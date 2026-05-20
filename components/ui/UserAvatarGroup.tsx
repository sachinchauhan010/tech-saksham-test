'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Users } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { IUser } from '@/types/interface'
import { Types } from 'mongoose'

interface UserAvatarGroupProps {
  users: (IUser | Types.ObjectId)[]
  maxVisible?: number
  className?: string
}

export default function UserAvatarGroup({ 
  users, 
  maxVisible = 3, 
  className = '' 
}: UserAvatarGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  if (!users || users.length === 0) {
    return <span className="text-gray-500 text-sm">No users</span>
  }

  const visibleUsers = isExpanded ? users : users.slice(0, maxVisible)
  const hasMore = users.length > maxVisible

  const getUserName = (user: IUser | Types.ObjectId): string => {
    if (typeof user === 'object' && 'name' in user) {
      return user.name
    }
    return user.toString()
  }

  const getUserInitials = (user: IUser | Types.ObjectId): string => {
    const name = getUserName(user)
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex -space-x-1">
        {visibleUsers.map((user, index) => {
          const name = getUserName(user)
          const initials = getUserInitials(user)
          
          return (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span 
                    className="inline-flex items-center justify-center w-7 h-7 bg-primary text-primary-foreground rounded-full text-xs font-medium hover:bg-primary/90 transition-colors ring-2 ring-white border border-white"
                    title={name}
                    style={{ zIndex: index + 1 }}
                  >
                    {initials}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{name}</p>
                  {typeof user === 'object' && 'email' in user && (
                    <p className="text-xs text-gray-500">{user.email}</p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>
      
      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-2 inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors cursor-pointer"
          title={isExpanded ? 'Show less' : `Show ${users.length - maxVisible} more`}
        >
          {isExpanded ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <span className="text-xs">+{users.length - maxVisible}</span>
          )}
        </button>
      )}
    </div>
  )
}
