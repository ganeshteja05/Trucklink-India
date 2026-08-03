'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package, Truck, Clock, CheckCircle2, ArrowRight,
  TrendingUp, Search,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase, type Booking } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/status-badge';

export default function CustomerOverview() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, pending: 0 });

  useEffect(() => {
    async function load() {
      if (!profile) return;
      const { data } = await supabase
        .from('bookings')
        .select('*, trucks(*)')
        .eq('customer_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5);
      setBookings(data || []);
      const all = data || [];
      setStats({
        total: all.length,
        active: all.filter((b) => ['accepted', 'in_transit'].includes(b.status)).length,
        completed: all.filter((b) => b.status === 'completed').length,
        pending: all.filter((b) => b.status === 'pending').length,
      });
      setLoading(false);
    }
    load();
  }, [profile]);

  return (
    <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold">Welcome back, {profile?.full_name?.split(' ')[0] || 'Customer'}!</h1>
        <p className="mt-1 text-muted-foreground">Here's an overview of your bookings and activity.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Package} label="Total Bookings" value={stats.total} color="bg-blue-500" />
        <StatCard icon={Clock} label="Pending" value={stats.pending} color="bg-amber-500" />
        <StatCard icon={Truck} label="Active" value={stats.active} color="bg-sky-500" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} color="bg-green-500" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link href="/search" className="group rounded-2xl border border-border bg-white p-6 transition hover:shadow-lg hover:border-primary/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Find a Truck</h3>
              <p className="mt-1 text-sm text-muted-foreground">Search verified trucks near you</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition group-hover:bg-primary">
              <Search className="h-6 w-6 text-primary group-hover:text-white" />
            </div>
          </div>
        </Link>
        <Link href="/return-loads" className="group rounded-2xl border border-border bg-white p-6 transition hover:shadow-lg hover:border-primary/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Browse Return Loads</h3>
              <p className="mt-1 text-sm text-muted-foreground">Save up to 40% on return trips</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition group-hover:bg-primary">
              <TrendingUp className="h-6 w-6 text-primary group-hover:text-white" />
            </div>
          </div>
        </Link>
      </div>

      {/* Recent bookings */}
      <div className="rounded-2xl border border-border bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Bookings</h2>
          <Link href="/customer/bookings" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-10 text-center">
            <Package className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">No bookings yet. Find a truck to get started!</p>
            <Link href="/search"><Button className="mt-4">Search Trucks</Button></Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <Link
                key={b.id}
                href={`/customer/bookings/${b.id}`}
                className="flex items-center justify-between rounded-xl border border-border p-4 transition hover:border-primary/30 hover:bg-muted/40"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{b.trucks?.vehicle_type || 'Truck'}</span>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {b.pickup_city} → {b.drop_city}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="mt-0.5 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

