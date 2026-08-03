'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Truck as TruckIcon, Package, IndianRupee, Clock, Plus, ArrowRight,
  Shield, TrendingUp, Star,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase, type Truck, type Booking } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/status-badge';

export default function OwnerOverview() {
  const { profile } = useAuth();
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!profile) return;
      const { data: t } = await supabase
        .from('trucks')
        .select('*')
        .eq('owner_id', profile.id)
        .order('created_at', { ascending: false });
      setTrucks(t || []);

      const { data: b } = await supabase
        .from('bookings')
        .select('*, trucks(*), customer:profiles!bookings_customer_id_fkey(full_name)')
        .eq('owner_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5);
      setBookings(b || []);
      setLoading(false);
    }
    load();
  }, [profile]);

  const activeBookings = bookings.filter((b) => ['pending', 'accepted', 'in_transit'].includes(b.status)).length;
  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;
  const totalRevenue = bookings.filter((b) => b.status === 'completed').reduce((s, b) => s + (b.final_price || 0), 0);
  const verifiedTrucks = trucks.filter((t) => t.verification_status === 'approved').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Owner Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Manage your fleet, bookings, and earnings.</p>
        </div>
        <Link href="/owner/trucks/new">
          <Button><Plus className="mr-2 h-4 w-4" /> Add Truck</Button>
        </Link>
      </div>

      {!profile?.is_verified && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-800">
            <Shield className="h-5 w-5" />
            <span className="font-semibold">Verify your account</span>
          </div>
          <p className="mt-1 text-sm text-amber-700">
            Upload your RC book, insurance, and license to get your trucks listed publicly.
          </p>
          <Link href="/owner/verification">
            <Button size="sm" className="mt-3" variant="outline">Start Verification</Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={TruckIcon} label="Total Trucks" value={trucks.length} sub={`${verifiedTrucks} verified`} color="bg-blue-500" />
        <StatCard icon={Clock} label="Pending Bookings" value={pendingBookings} sub="needs response" color="bg-amber-500" />
        <StatCard icon={Package} label="Active Bookings" value={activeBookings} sub="in progress" color="bg-sky-500" />
        <StatCard icon={IndianRupee} label="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} sub="from completed trips" color="bg-green-500" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link href="/owner/trucks" className="group rounded-2xl border border-border bg-white p-6 transition hover:shadow-lg hover:border-primary/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Manage Trucks</h3>
              <p className="mt-1 text-sm text-muted-foreground">Add, edit, and track your fleet</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition group-hover:bg-primary">
              <TruckIcon className="h-6 w-6 text-primary group-hover:text-white" />
            </div>
          </div>
        </Link>
        <Link href="/owner/return-loads" className="group rounded-2xl border border-border bg-white p-6 transition hover:shadow-lg hover:border-primary/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Post Return Load</h3>
              <p className="mt-1 text-sm text-muted-foreground">Sell empty return trips at a discount</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition group-hover:bg-primary">
              <TrendingUp className="h-6 w-6 text-primary group-hover:text-white" />
            </div>
          </div>
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Bookings</h2>
          <Link href="/owner/bookings" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-10 text-center">
            <Package className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">No bookings yet. Add trucks to start receiving requests!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <Link
                key={b.id}
                href={`/owner/bookings/${b.id}`}
                className="flex items-center justify-between rounded-xl border border-border p-4 transition hover:border-primary/30 hover:bg-muted/40"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{b.trucks?.vehicle_type || 'Truck'}</span>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {b.pickup_city} → {b.drop_city} · {(b as any).customer?.full_name}
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

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: any; sub: string; color: string }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="mt-0.5 text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 text-xs text-muted-foreground/70">{sub}</div>
    </div>
  );
}
