'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, Package, Heart, Bell, User as UserIcon,
  Truck, LogOut, Menu, X, MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';

const navItems = [
  { href: '/customer', label: 'Overview', icon: LayoutDashboard },
  { href: '/customer/bookings', label: 'My Bookings', icon: Package },
  { href: '/customer/saved', label: 'Saved Trucks', icon: Heart },
  { href: '/customer/notifications', label: 'Notifications', icon: Bell },
  { href: '/customer/messages', label: 'Messages', icon: MessageSquare },
  { href: '/profile', label: 'Profile', icon: UserIcon },
];

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { profile, signOut, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!profile) {
    router.push('/login');
    return null;
  }

  if (profile.role === 'owner') {
    router.push('/owner');
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="container-mw container-px py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 rounded-2xl border border-border bg-white p-4">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {profile.full_name?.[0]?.toUpperCase() || 'C'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{profile.full_name}</p>
                  <p className="text-xs text-muted-foreground">Customer</p>
                </div>
              </div>
              <nav className="mt-4 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      pathname === item.href
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <item.icon className="h-4 w-4" /> {item.label}
                  </Link>
                ))}
                <button
                  onClick={() => signOut().then(() => router.push('/'))}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </nav>
            </div>
          </aside>

          {/* Mobile sidebar toggle */}
          <div className="lg:hidden">
            <Button variant="outline" onClick={() => setSidebarOpen(true)} className="w-full">
              <Menu className="mr-2 h-4 w-4" /> Menu
            </Button>
            {sidebarOpen && (
              <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setSidebarOpen(false)}>
                <div className="absolute left-0 top-0 h-full w-72 bg-white p-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="font-semibold">Menu</span>
                    <button onClick={() => setSidebarOpen(false)}><X className="h-5 w-5" /></button>
                  </div>
                  <nav className="mt-3 space-y-1">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                          pathname === item.href ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                        }`}
                      >
                        <item.icon className="h-4 w-4" /> {item.label}
                      </Link>
                    ))}
                    <button
                      onClick={() => { signOut().then(() => router.push('/')); setSidebarOpen(false); }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </nav>
                </div>
              </div>
            )}
          </div>

          {/* Main content */}
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
