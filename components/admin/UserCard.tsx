import { Mail, Phone, Building, Calendar, CalendarDays, Check, UserX, UserPlus, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ROLE } from '@/lib/enum';

interface UserCardProps {
  user: any;
  onRoleChange: (user: any, newRole: any) => void;
  onEdit?: (user: any) => void;
  onDelete?: (user: any) => void;
}

export default function UserCard({ user, onRoleChange, onEdit, onDelete }: UserCardProps) {
  const initials = user.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const avatarStyles = [
    { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', glow: 'from-blue-500/10' },
    { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', glow: 'from-purple-500/10' },
    { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', glow: 'from-amber-500/10' },
    { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', glow: 'from-pink-500/10' },
  ];
  const style = avatarStyles[user.name.charCodeAt(0) % avatarStyles.length];

  return (
    <div className="group relative bg-white border border-slate-200/60 rounded-xl p-4 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden z-0">
      {/* Background gradient hint */}
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${style.glow} to-transparent rounded-bl-full -z-10 transition-opacity opacity-50 group-hover:opacity-100`} />

      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-10 h-10 rounded-full ${style.bg} ${style.text} ${style.border} border shadow-sm flex items-center justify-center text-xs font-bold shrink-0 ring-2 ring-white`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
            <span className={`shrink-0 text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {user.role}
            </span>
          </div>
          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 inline-block">
            {user.userId}
          </span>
        </div>
        
        {/* Three-dot menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors shrink-0 -mr-1 -mt-1"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-lg border-slate-200/60 p-1.5">
            {user.role !== ROLE.GUEST && (
              <DropdownMenuItem
                onClick={() => onRoleChange(user, ROLE.GUEST)}
                className="flex items-center gap-2.5 cursor-pointer py-2 px-3 focus:bg-orange-50 focus:text-orange-700 rounded-lg transition-colors"
              >
                <UserX className="h-4 w-4" />
                <span className="font-medium text-sm">Make Guest</span>
              </DropdownMenuItem>
            )}
            {user.role !== ROLE.USER && (
              <DropdownMenuItem
                onClick={() => onRoleChange(user, ROLE.USER)}
                className="flex items-center gap-2.5 cursor-pointer py-2 px-3 focus:bg-blue-50 focus:text-blue-700 rounded-lg transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                <span className="font-medium text-sm">Make User</span>
              </DropdownMenuItem>
            )}
            {user.role !== ROLE.ORGANIZER && (
              <DropdownMenuItem
                onClick={() => onRoleChange(user, ROLE.ORGANIZER)}
                className="flex items-center gap-2.5 cursor-pointer py-2 px-3 focus:bg-emerald-50 focus:text-emerald-700 rounded-lg transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                <span className="font-medium text-sm">Make Organizer</span>
              </DropdownMenuItem>
            )}
            {user.role !== ROLE.ADMIN && (
              <DropdownMenuItem
                onClick={() => onRoleChange(user, ROLE.ADMIN)}
                className="flex items-center gap-2.5 cursor-pointer py-2 px-3 focus:bg-purple-50 focus:text-purple-700 rounded-lg transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                <span className="font-medium text-sm">Make Admin</span>
              </DropdownMenuItem>
            )}
            
            {(onEdit || onDelete) && <div className="h-px bg-slate-200/60 my-1" />}
            
            {onEdit && (
              <DropdownMenuItem
                onClick={() => onEdit(user)}
                className="flex items-center gap-2.5 cursor-pointer py-2 px-3 focus:bg-blue-50 focus:text-blue-700 rounded-lg transition-colors"
              >
                <span className="font-medium text-sm">Edit User</span>
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(user)}
                className="flex items-center gap-2.5 cursor-pointer py-2 px-3 text-red-600 focus:bg-red-50 focus:text-red-700 rounded-lg transition-colors"
              >
                <span className="font-medium text-sm">Delete User</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Details */}
      <div className="space-y-0.5">
        {[
          { icon: Mail, bg: 'bg-blue-50/50', color: 'text-blue-600', label: 'Email', value: user.email },
          { icon: Phone, bg: 'bg-emerald-50/50', color: 'text-emerald-600', label: 'Phone', value: user.phone || 'Not provided' },
          { icon: Building, bg: 'bg-purple-50/50', color: 'text-purple-600', label: 'Department', value: user.department },
          { icon: Calendar, bg: 'bg-amber-50/50', color: 'text-amber-600', label: 'Registered', value: new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) },
        ].map(({ icon: Icon, bg, color, label, value }) => (
          <div key={label} className="flex items-center gap-2.5 py-1.5 px-1 rounded-lg hover:bg-slate-50 transition-colors">
            <div className={`w-6 h-6 rounded-md ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-3.5 h-3.5 ${color}`} aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">{label}</p>
              <p className="text-xs font-medium text-slate-700 truncate leading-none">{value}</p>
            </div>
          </div>
        ))}

        {/* Events row */}
        <div className="mt-3 pt-3 border-t border-slate-100/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
              <CalendarDays className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">Events applied</p>
              <p className="text-xs font-bold text-slate-800 leading-none">{user.eventApplied?.length || 0} event(s)</p>
            </div>
          </div>
          {(user.eventApplied?.length || 0) > 0
            ? <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-teal-50 text-teal-700 flex items-center gap-1 border border-teal-100"><Check className="w-2.5 h-2.5 stroke-[3]" /> Active</span>
            : <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-500 border border-slate-200">None</span>
          }
        </div>
      </div>
    </div>
  );
}
