'use client'

import * as React from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Icons } from '@/components/icons'

// Lazy load components
const Button = dynamic(() => import('@/components/ui/button').then(mod => mod.default), {
  ssr: false,
  loading: () => <div className="h-9 w-16 rounded-md bg-muted animate-pulse" />
});

const ScrollArea = dynamic(() => import('@/components/ui/scroll-area').then(mod => mod.default), {
  ssr: false,
  loading: () => <div className="w-full h-64 bg-muted animate-pulse" />
});

const Sheet = dynamic(() => import('@/components/ui/sheet').then(mod => mod.Sheet), {
  ssr: false,
  loading: () => null
});

const SheetContent = dynamic(() => import('@/components/ui/sheet').then(mod => mod.SheetContent), {
  ssr: false,
  loading: () => null
});

const SheetTrigger = dynamic(() => import('@/components/ui/sheet').then(mod => mod.SheetTrigger), {
  ssr: false,
  loading: () => <div className="h-9 w-9 rounded-md bg-muted animate-pulse" />
});

const mainNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Icons.home,
  },
  {
    title: 'Scripts',
    href: '/scripts',
    icon: Icons.fileText,
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: Icons.fileBarChart2,
  },
]

function MainNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="flex h-16 items-center border-b px-4 md:px-6">
      <div className="flex items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Icons.fileText className="h-6 w-6" />
          <span className="font-bold">ScriptGenius</span>
        </Link>
        <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'transition-colors hover:text-foreground/80',
                pathname === item.href
                  ? 'text-foreground'
                  : 'text-foreground/60'
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
      <div className="ml-auto flex items-center space-x-4">
        <Button variant="ghost" size="sm" className="hidden md:flex">
          <Icons.user className="mr-2 h-4 w-4" />
          Sign In
        </Button>
        <Button size="sm" className="hidden md:flex">
          Get Started
        </Button>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsOpen(true)}
            >
              <Icons.menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <div className="flex h-full flex-col">
              <div className="flex items-center border-b px-6 py-4">
                <Link
                  href="/"
                  className="flex items-center space-x-2"
                  onClick={() => setIsOpen(false)}
                >
                  <Icons.fileText className="h-6 w-6" />
                  <span className="font-bold">ScriptGenius</span>
                </Link>
              </div>
              <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
                <div className="flex flex-col space-y-3">
                  {mainNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                        pathname === item.href
                          ? 'bg-accent text-accent-foreground'
                          : 'text-foreground/60'
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </Link>
                  ))}
                </div>
                <div className="mt-4 flex flex-col space-y-2 pt-6">
                  <Button className="w-full">
                    <Icons.user className="mr-2 h-4 w-4" />
                    Sign In
                  </Button>
                  <Button variant="outline" className="w-full">
                    Get Started
                  </Button>
                </div>
              </ScrollArea>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
