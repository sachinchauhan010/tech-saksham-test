import React from 'react';
import { Edit, Trash2, Building, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROLE } from '@/lib/enum';

interface AdminCardProps {
  admin: any;
  onEdit: (admin: any) => void;
  onDelete: (adminId: string) => void;
}

export default function AdminCard({ admin, onEdit, onDelete }: AdminCardProps) {
  const isSuperAdmin = admin.role.includes(ROLE.SUPER_ADMIN);
  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg">{admin.name}</h3>
          <p className="text-sm text-gray-500">{admin.email}</p>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-semibold ${isSuperAdmin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
          {isSuperAdmin ? 'Super Admin' : 'Admin'}
        </div>
      </div>
      
      <div className="space-y-2 mb-4 text-sm text-gray-600">
        <div className="flex items-center gap-2"><Building className="h-4 w-4"/> {admin.department}</div>
        <div className="flex items-center gap-2"><Phone className="h-4 w-4"/> {admin.phone}</div>
      </div>
      
      <div className="flex gap-2 pt-4 border-t border-gray-100 mt-auto">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(admin)}>
          <Edit className="h-4 w-4 mr-2" /> Edit
        </Button>
        <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => onDelete(admin._id)}>
          <Trash2 className="h-4 w-4 mr-2" /> Delete
        </Button>
      </div>
    </div>
  );
}
