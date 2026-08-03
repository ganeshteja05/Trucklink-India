'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Truck, Menu, X, Bell, ChevronDown, LayoutDashboard, LogOut, User as UserIcon } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import type { Notification } from '@/lib/supabase';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (user) loadNotifications();
  }, [user]);

  async function loadNotifications() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user!.id)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(5);
    setNotifications(data || []);
  }

  const dashboards = {
    customer: '/customer',
    owner: '/owner',
    admin: '/admin',
  };

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-white/80 backdrop-blur-md">
      <div className="container-mw container-px">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-md">
              <Truck className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Truck<span className="text-primary">Link</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink href="/" active={isActive('/')}>Home</NavLink>
            <NavLink href="/search" active={isActive('/search') || isActive('/trucks')}>Find Trucks</NavLink>
            <NavLink href="/how-it-works" active={isActive('/how-it-works')}>How It Works</NavLink>
            <NavLink href="/return-loads" active={isActive('/return-loads')}>Return Loads</NavLink>
            <NavLink href="/for-owners" active={isActive('/for-owners')}>For Owners</NavLink>
          </nav>

          {/* Desktop auth */}
          <div className="hidden items-center gap-3 md:flex">
            {user && profile ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition">
                      <Bell className="h-5 w-5 text-foreground/70" />
                      {notifications.length > 0 && (
                        <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                          {notifications.length}
                        </span>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {notifications.length === 0 ? (
                      <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="border-b border-border/50 px-3 py-2 last:border-0">
                          <p className="text-sm font-medium">{n.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                        </div>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 rounded-full border border-border/60 px-2 py-1 hover:bg-muted transition">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile.avatar_url} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                          {profile.full_name?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{profile.full_name}</span>
                        <span className="text-xs text-muted-foreground capitalize">{profile.role}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push(dashboards[profile.role])}>
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                      <UserIcon className="mr-2 h-4 w-4" /> My Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut().then(() => router.push('/'))}>
                      <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => router.push('/login')}>
                  Sign In
                </Button>
                <Button onClick={() => router.push('/register')}>
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-white md:hidden">
          <div className="container-mw container-px py-4 space-y-2">
            <MobileLink href="/" onClick={() => setMobileOpen(false)}>Home</MobileLink>
            <MobileLink href="/search" onClick={() => setMobileOpen(false)}>Find Trucks</MobileLink>
            <MobileLink href="/how-it-works" onClick={() => setMobileOpen(false)}>How It Works</MobileLink>
            <MobileLink href="/return-loads" active={isActive('/return-loads')} onClick={() => setMobileOpen(false)}>Return Loads</MobileLink>
            <MobileLink href="/for-owners" onClick={() => setMobileOpen(false)}>For Owners</MobileLink>
            <div className="pt-2 space-y-2">
              {user && profile ? (
                <>
                  <Button className="w-full" onClick={() => { router.push(dashboards[profile.role]); setMobileOpen(false); }}>
                    Dashboard
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => { signOut().then(() => router.push('/')); setMobileOpen(false); }}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="w-full" onClick={() => { router.push('/login'); setMobileOpen(false); }}>
                    Sign In
                  </Button>
                  <Button className="w-full" onClick={() => { router.push('/register'); setMobileOpen(false); }}>
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
        active ? 'text-primary' : 'text-foreground/70 hover:text-foreground hover:bg-muted'
      }`}
    >
      {children}
    </Link>
  );
}

function MobileLink({ href, active, onClick, children }: { href: string; active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block rounded-lg px-3 py-2.5 text-base font-medium transition ${
        active ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
      }`}
    >
      {children}
    </Link>
  );
}
