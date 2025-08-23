import { User } from 'next-auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/components/icons';
import { signOut } from 'next-auth/react';

interface AdminHeaderProps {
  user: User | null | undefined;
}

export function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
      <div className="flex flex-1 justify-between px-4">
        <div className="flex items-center md:hidden">
          <Button variant="ghost" size="icon">
            <Icons.menu className="h-6 w-6" />
            <span className="sr-only">Open sidebar</span>
          </Button>
        </div>
        <div className="ml-4 flex items-center md:ml-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user?.image || ''}
                    alt={user?.name || 'User'}
                  />
                  <AvatarFallback>
                    {user?.name
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">Open user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
