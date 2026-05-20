'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/redux/hooks';
import { ROLE } from '@/lib/enum';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Search, Filter, Plus, Download, Edit, Trash2, Users, LayoutGrid, List } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import GridView from '@/components/admin/GridView';
import TableView, { TableColumn } from '@/components/admin/TableView';
import AdminCard from '@/components/admin/AdminCard';

interface AdminUser {
	_id: string;
	userId: string;
	name: string;
	email: string;
	phone: string;
	department: string;
	role: string[];
	managedEvents?: Array<{ eventCode: string; title: string; }>;
	createdAt: string;
}

export default function ManageAdmin() {
	const router = useRouter();
	const [admins, setAdmins] = useState<AdminUser[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [roleFilter, setRoleFilter] = useState('all');
	const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [adminToDelete, setAdminToDelete] = useState<string | null>(null);
	const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

	const { user: currentUser } = useAppSelector((state) => state.user);

	// Check if current user is super admin
	const isSuperAdmin = currentUser?.role?.includes(ROLE.SUPER_ADMIN) || false;

	useEffect(() => {
		fetchAdmins();
	}, []);

	const fetchAdmins = async () => {
		try {
			setLoading(true);
			const {data} = await apiClient.get('/api/admin/manage-admin');

			if (data.success) {
				setAdmins(data.data);
			} else {
				toast.error('Failed to fetch admins');
			}
		} catch (error) {
			toast.error('Error fetching admins');
		} finally {
			setLoading(false);
		}
	};

	const filteredAdmins = useMemo(() => {
		return admins.filter(admin => {
			const matchesSearch = admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				admin.email.toLowerCase().includes(searchTerm.toLowerCase());
			const matchesRole = roleFilter === 'all' || admin.role.includes(roleFilter);
			return matchesSearch && matchesRole;
		});
	}, [admins, searchTerm, roleFilter]);

	const handleEdit = (admin: AdminUser) => {
		router.push(`/admin/manage-admin/${admin._id}/edit`);
	};

	const handleDelete = async () => {
		if (!adminToDelete) return;

		try {
			const {data} = await apiClient.get(`/api/admin/manage-admin/${adminToDelete}`);

			if (data.success) {
				toast.success('Admin deleted successfully');
				fetchAdmins();
				setDeleteDialogOpen(false);
				setAdminToDelete(null);
			} else {
				toast.error(data.error || 'Failed to delete admin');
			}
		} catch (error) {
			toast.error('Error deleting admin');
		}
	};

	const openDeleteDialog = (adminId: string) => {
		setAdminToDelete(adminId);
		setDeleteDialogOpen(true);
	};

	const exportToCSV = () => {
		const headers = ['Name', 'Email', 'Phone', 'Department', 'Role', 'Managed Events', 'Created At'];
		const csvContent = [
			headers.join(','),
			...filteredAdmins.map(admin => [
				admin.name,
				admin.email,
				admin.phone,
				admin.department,
				Array.isArray(admin.role) ? admin.role.join('; ') : admin.role,
				admin.managedEvents?.map(event => event.title).join('; ') || '',
				new Date(admin.createdAt).toLocaleDateString()
			])
		].map(row => Array.isArray(row) ? row.join(',') : String(row)).join('\n');

		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'admins.csv';
		a.click();
		URL.revokeObjectURL(url);

		toast.success('Admin list exported successfully');
	};

	if (!isSuperAdmin) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-semibold text-gray-900 mb-4">Access Denied</h1>
					<p className="text-gray-600">You don't have permission to access this page.</p>
					<p className="text-sm text-gray-500">Only Super Admins can manage admin users.</p>
				</div>
			</div>
		);
	}

	const adminColumns: TableColumn<AdminUser>[] = [
		{ header: 'Name', key: 'name', className: 'font-medium' },
		{ header: 'Email', key: 'email' },
		{ header: 'Phone', key: 'phone' },
		{ header: 'Department', key: 'department' },
		{ 
			header: 'Role', 
			key: 'role',
			render: (admin) => (
				<Badge variant={admin.role.includes(ROLE.SUPER_ADMIN) ? 'default' : 'secondary'}>
					{admin.role.includes(ROLE.SUPER_ADMIN) ? 'Super Admin' : 'Admin'}
				</Badge>
			)
		},
		{
			header: 'Managed Events',
			key: 'events',
			render: (admin) => (
				admin.managedEvents && admin.managedEvents.length > 0 ? (
					<span className="text-sm text-gray-600">
						{admin.managedEvents.length} events
					</span>
				) : (
					<span className="text-sm text-gray-400">No events</span>
				)
			)
		},
		{ 
			header: 'Created', 
			key: 'createdAt',
			render: (admin) => new Date(admin.createdAt).toLocaleDateString()
		},
		{
			header: 'Actions',
			key: 'actions',
			render: (admin) => (
				<div className="flex gap-2">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => handleEdit(admin)}
						className="h-8 w-8 p-0"
					>
						<Edit className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => openDeleteDialog(admin._id)}
						className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			)
		}
	];

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="bg-white shadow rounded-lg">
					{/* Header */}
					<div className="px-6 py-4 border-b border-gray-200">
						<div className="flex items-center justify-between">
							<h1 className="text-2xl font-semibold text-gray-900">Manage Admin Users</h1>
							<div className="flex gap-3">
								<div className="relative">
									<Search className="absolute left-3 top-2 h-4 w-4 text-gray-400" />
									<Input
										placeholder="Search admins..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="pl-10 w-64"
									/>
								</div>

								<Select value={roleFilter} onValueChange={setRoleFilter}>
									<SelectTrigger className="w-40">
										<SelectValue placeholder="Filter by role" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Roles</SelectItem>
										<SelectItem value={ROLE.ADMIN}>Admin</SelectItem>
										<SelectItem value={ROLE.SUPER_ADMIN}>Super Admin</SelectItem>
									</SelectContent>
								</Select>

								<div className="flex items-center bg-slate-100/80 rounded-xl p-1 shadow-inner border border-slate-200">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setViewMode('grid')}
										className={`h-8 w-8 p-0 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60 hover:bg-white hover:text-blue-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
									>
										<LayoutGrid className="h-4 w-4" />
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setViewMode('table')}
										className={`h-8 w-8 p-0 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60 hover:bg-white hover:text-blue-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
									>
										<List className="h-4 w-4" />
									</Button>
								</div>

								<Button
									onClick={() => router.push('/admin/manage-admin/create')}
									className="flex items-center gap-2"
								>
									<Plus className="h-4 w-4" />
									Add Admin
								</Button>

								<Button
									variant="outline"
									onClick={exportToCSV}
									className="flex items-center gap-2"
								>
									<Download className="h-4 w-4" />
									Export CSV
								</Button>
							</div>
						</div>
					</div>


					{/* Admins Table */}
					<div className="px-6 py-4">
						{loading ? (
							<div className="text-center py-8">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
								<p className="mt-2 text-gray-600">Loading admins...</p>
							</div>
						) : filteredAdmins.length === 0 ? (
							<div className="text-center py-8">
								<Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-medium text-gray-900 mb-2">No Admin Users Found</h3>
								<p className="text-gray-600">Get started by creating your first admin user.</p>
								<Button onClick={() => router.push('/admin/manage-admin/create')} className="mt-4">
									<Plus className="h-4 w-4 mr-2" />
									Create Admin
								</Button>
							</div>
						) : viewMode === 'grid' ? (
							<GridView 
								data={filteredAdmins}
								keyExtractor={(admin) => admin._id}
								renderItem={(admin) => (
									<AdminCard 
										admin={admin} 
										onEdit={handleEdit} 
										onDelete={openDeleteDialog} 
									/>
								)}
							/>
						) : (
							<div className="overflow-x-auto">
								<TableView 
									data={filteredAdmins}
									columns={adminColumns}
									keyExtractor={(admin) => admin._id}
								/>
							</div>
						)}
					</div>
				</div>
			</div>

			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the admin user and remove all their access.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-red-600 hover:bg-red-700"
						>
							Delete Admin
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}