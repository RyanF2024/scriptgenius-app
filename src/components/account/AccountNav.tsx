import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Profile', href: '/account/profile' },
  { name: 'Security', href: '/account/security' },
  // Add more navigation items as needed
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="flex space-x-4 border-b" aria-label="Account navigation">
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-t-md'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
