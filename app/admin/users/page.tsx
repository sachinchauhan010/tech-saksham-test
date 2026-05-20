'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Download, Search, Mail, Phone, Building, Calendar, CalendarDays, Check, MoreHorizontal, UserPlus, UserX, LayoutGrid, List } from 'lucide-react';
import { toast } from 'sonner';
import { useAppSelector } from '@/redux/hooks';
import apiClient from '@/lib/api-client';
import { ROLE } from '@/lib/enum';
import UserCard from '@/components/admin/UserCard';
import GridView from '@/components/admin/GridView';
import TableView, { TableColumn } from '@/components/admin/TableView';
import EventFilterDropdown from '@/components/admin/EventFilterDropdown';
import { IEvent } from '@/types/interface';
import { Badge } from '@/components/ui/badge';

interface User {
  _id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  eventApplied: Array<any>;
  createdAt: string;
}

type UserPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function AdminUsersPage() {
  const { user} = useAppSelector((state)=> state.user);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<UserPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [assignEvents, setAssignEvents] = useState<IEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [isRoleChangeDialogOpen, setIsRoleChangeDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<'guest' | 'organizer'>('guest');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userFormData, setUserFormData] = useState<Partial<User>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignEvents();
  }, []);

  const fetchAssignEvents = async () => {
    try {
      const { data } = await apiClient.get('/api/admin/assigned-event');
      if (data.success) {
        setAssignEvents(data.events || []);
      }
    } catch (error) {
      console.error('Failed to load assigned events');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedEvent, assignEvents, user?.managedEvents]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      filterUsers();
    }, 150); // Small debounce for performance but still feels instant

    return () => clearTimeout(timeoutId);
  }, [searchQuery, allUsers]);

  const filterUsers = () => {
    if (!searchQuery.trim()) {
      setUsers(allUsers);
      setPagination(prev => ({
        ...prev,
        total: allUsers.length,
        page: 1,
        totalPages: Math.ceil(allUsers.length / 10)
      }));
      return;
    }

    const filtered = allUsers.filter(user => {
      const searchLower = searchQuery.toLowerCase();
      return (
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.userId.toLowerCase().includes(searchLower) ||
        user.department.toLowerCase().includes(searchLower)
      );
    });

    setUsers(filtered);
    setPagination(prev => ({
      ...prev,
      total: filtered.length,
      page: 1,
      totalPages: Math.ceil(filtered.length / 10)
    }));
  };

  const fetchUsers = async (page = 1) => {
    setIsLoading(true);
    try {
      let payloadEvents = [];
      if (selectedEvent) {
        payloadEvents = [{ eventCode: selectedEvent.eventCode }];
      } else if (assignEvents.length > 0) {
        payloadEvents = assignEvents.map((e) => ({ eventCode: e.eventCode }));
      } else {
        payloadEvents = user?.managedEvents || [];
      }

      if (payloadEvents.length === 0) {
        setAllUsers([]);
        setUsers([]);
        setPagination(prev => ({...prev, total: 0, page: 1, totalPages: 0}));
        setIsLoading(false);
        return;
      }

      const {data} = await apiClient.post('/api/admin/users', {
        managedEvents: payloadEvents
      });
      
      if (data.success) {
        setAllUsers(data.data);
        setUsers(data.data);
        setPagination(prev => ({
          ...prev,
          total: data.data.length,
          page: page,
          totalPages: Math.ceil(data.data.length / 10)
        }));
      } else {
        throw new Error(data.message || 'Failed to load users');
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      toast.error('Failed to load participants');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchUsers(1);
  };

  const handleRoleChange = async (user: User, role: 'guest' | 'organizer' | 'user' | 'admin') => {
    try {
      setIsUpdatingRole(true);
      const { data } = await apiClient.post('/api/admin/users/update-role', {
        userId: user._id,
        newRole: role
      });

      if (data.success) {
        // Update user in both allUsers and filtered users
        const updatedUsers = allUsers.map(u => 
          u._id === user._id 
            ? { ...u, role: role }
            : u
        );

        setAllUsers(updatedUsers);
        setUsers(updatedUsers);
        
        toast.success(`Successfully changed ${user.name}'s role to ${role}`);
        setIsRoleChangeDialogOpen(false);
        setSelectedUser(null);
      } else {
        throw new Error(data.message || 'Failed to update user role');
      }
    } catch (error) {
      console.error('Role change error:', error);
      toast.error('Failed to update user role');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleOpenEditUser = (user: User) => {
    setSelectedUser(user);
    setUserFormData(user);
    setIsUserModalOpen(true);
  };

  const handleOpenDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = '/api/admin/users/crud';
      const method = 'PUT';
      
      const { data } = await apiClient({
        method,
        url,
        data: userFormData
      });

      if (data.success) {
        toast.success(`User updated successfully`);
        setIsUserModalOpen(false);
        fetchUsers(pagination.page);
      } else {
        throw new Error(data.message || `Failed to update user`);
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to update user`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      const { data } = await apiClient.delete(`/api/admin/users/crud?_id=${selectedUser._id}`);
      if (data.success) {
        toast.success('User deleted successfully');
        setIsDeleteModalOpen(false);
        fetchUsers(pagination.page);
      } else {
        throw new Error(data.message || 'Failed to delete user');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportToCSV = async () => {
    try {
      // Use current allUsers data for export
      const usersToExport = searchQuery.trim() ? users : allUsers;

      // Create CSV content
      const headers = ['User ID', 'Name', 'Email', 'Phone', 'Department', 'Role', 'Events Applied', 'Registration Date'];
      const csvContent = [
        headers.join(','),
        ...usersToExport.map((user: User) => [
          user.userId,
          `"${user.name}"`,
          user.email,
          user.phone || 'Not provided',
          `"${user.department}"`,
          user.role,
          user.eventApplied?.length || 0,
          new Date(user.createdAt).toLocaleDateString()
        ].join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${usersToExport.length} participants to CSV`);
    } catch (error) {
      toast.error('Failed to export participants');
    }
  };

  const userColumns: TableColumn<User>[] = [
    { header: 'User ID', key: 'userId', className: 'font-medium' },
    { header: 'Name', key: 'name' },
    { header: 'Email', key: 'email' },
    { header: 'Phone', key: 'phone', render: (user) => user.phone || 'N/A' },
    { header: 'Department', key: 'department' },
    { 
      header: 'Role', 
      key: 'role',
      render: (user) => (
        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
          {user.role}
        </Badge>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      className: 'text-right',
      render: (user) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {user.role !== ROLE.GUEST && (
              <DropdownMenuItem onClick={() => handleRoleChange(user, ROLE.GUEST)}>
                Make Guest
              </DropdownMenuItem>
            )}
            {user.role !== ROLE.USER && (
              <DropdownMenuItem onClick={() => handleRoleChange(user, ROLE.USER)}>
                Make User
              </DropdownMenuItem>
            )}
            {user.role !== ROLE.ORGANIZER && (
              <DropdownMenuItem onClick={() => handleRoleChange(user, ROLE.ORGANIZER)}>
                Make Organizer
              </DropdownMenuItem>
            )}
            {user.role !== ROLE.ADMIN && (
              <DropdownMenuItem onClick={() => handleRoleChange(user, ROLE.ADMIN)}>
                Make Admin
              </DropdownMenuItem>
            )}
            <div className="h-px bg-slate-200/60 my-1" />
            <DropdownMenuItem onClick={() => handleOpenEditUser(user)}>
              Edit User
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleOpenDeleteUser(user)}
              className="text-red-600 focus:text-red-700 focus:bg-red-50"
            >
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0f5fc3]">All Participants</h1>
        <p className="mt-1 text-muted-foreground">Manage registered participants ({pagination.total} total)</p>
      </div>

      <div className="flex justify-between items-center gap-10">
        <div className="flex gap-3 items-center w-full mx-auto">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              placeholder="Search by Name, Email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-12 pr-10 h-10 rounded-full border-2 border-slate-200 focus:border-slate-500 focus:ring-1 focus:ring-slate-200 transition-all duration-200 bg-white shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <Button
            onClick={handleSearch}
            disabled={isLoading}
            className="h-10 px-6 cursor-pointer font-medium transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Search
              </>
            )}
          </Button>
        </div>
        <div className="flex justify-between items-center gap-4">
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
          <EventFilterDropdown
            assignEvents={assignEvents}
            selectedEvent={selectedEvent}
            onSelectEvent={setSelectedEvent}
          />
          <Button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground my-6">
        Showing {users.length} of {pagination.total} participants
      </div>

      <div className="mt-4">
        {users.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            No participants found
          </Card>
        ) : viewMode === 'grid' ? (
          <GridView 
            data={users}
            keyExtractor={(user) => user._id}
            renderItem={(user) => (
              <UserCard 
                user={user} 
                onRoleChange={handleRoleChange}
                onEdit={handleOpenEditUser}
                onDelete={handleOpenDeleteUser}
              />
            )}
          />
        ) : (
          <TableView 
            data={users}
            columns={userColumns}
            keyExtractor={(user) => user._id}
          />
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={pagination.page === 1}
              onClick={() => fetchUsers(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => fetchUsers(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Edit User Dialog */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleUserSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Participant</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={userFormData.name || ''}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userFormData.email || ''}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={userFormData.phone || ''}
                  onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={userFormData.department || ''}
                  onChange={(e) => setUserFormData({ ...userFormData, department: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={userFormData.role || 'user'}
                  onValueChange={(value) => setUserFormData({ ...userFormData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guest">Guest</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="organizer">Organizer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account
              for {selectedUser?.name} and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete Participant'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
