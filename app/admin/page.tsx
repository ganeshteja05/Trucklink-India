'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users, Truck, Package, IndianRupee, TrendingUp, ArrowRight,
  Shield, Clock,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar,
} from 'recharts';

export default function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0, owners: 0, trucks: 0, bookings: 0, pendingVerifications: 0, revenue: 0,
  });
  const [bookingTrend, setBookingTrend] = useState<{ date: string; count: number }[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const { count: users } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: owners } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'owner');
      const { count: trucks } = await supabase.from('trucks').select('*', { count: 'exact', head: true });
      const { count: bookings } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
      const { count: pending } = await supabase.from('verification_documents').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      const { data: completed } = await supabase.from('bookings').select('final_price').eq('status', 'completed');
      const revenue = (completed || []).reduce((s, b) => s + (b.final_price || 0), 0);

      setStats({ users: users || 0, owners: owners || 0, trucks: trucks || 0, bookings: bookings || 0, pendingVerifications: pending || 0, revenue });

      const { data: recent } = await supabase
        .from('bookings')
        .select('*, trucks(vehicle_type), customer:profiles!bookings_customer_id_fkey(full_name)')
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentBookings(recent || []);

      // Build a simple trend from bookings grouped by date
      const { data: allBookings } = await supabase.from('bookings').select('created_at').order('created_at', { ascending: true });
      const grouped: Record<string, number> = {};
      (allBookings || []).forEach((b) => {
        const d = new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        grouped[d] = (grouped[d] || 0) + 1;
      });
      setBookingTrend(Object.entries(grouped).slice(-7).map(([date, count]) => ({ date, count })));

      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Platform overview and key metrics.</p>
      </div>

      {stats.pendingVerifications > 0 && (
        <Link href="/admin/verification" className="block">
          <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 transition hover:bg-amber-100">
            <Shield className="h-5 w-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">
              {stats.pendingVerifications} verification document{stats.pendingVerifications !== 1 ? 's' : ''} pending review
            </span>
            <ArrowRight className="ml-auto h-4 w-4 text-amber-600" />
          </div>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Users" value={stats.users} color="bg-blue-500" />
        <StatCard icon={Truck} label="Total Trucks" value={stats.trucks} color="bg-sky-500" />
        <StatCard icon={Package} label="Total Bookings" value={stats.bookings} color="bg-purple-500" />
        <StatCard icon={IndianRupee} label="Platform Revenue" value={`₹${stats.revenue.toLocaleString()}`} color="bg-green-500" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-6">
          <h2 className="font-semibold mb-4">Booking Trends</h2>
          {bookingTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={bookingTrend}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="hsl(199, 89%, 48%)" strokeWidth={2} fill="url(#colorBookings)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
              No booking data yet
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          <h2 className="font-semibold mb-4">User Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[
              { name: 'Customers', count: stats.users - stats.owners },
              { name: 'Owners', count: stats.owners },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(199, 89%, 48%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Recent Bookings</h2>
          <Link href="/admin/bookings" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        {recentBookings.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No bookings yet.</p>
        ) : (
          <div className="space-y-3">
            {recentBookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-xl border border-border p-4">
                <div>
                  <span className="font-medium">{b.trucks?.vehicle_type || 'Truck'}</span>
                  <p className="text-sm text-muted-foreground">
                    {b.pickup_city} → {b.drop_city} · {b.customer?.full_name}
                  </p>
                </div>
                <Badge className={
                  b.status === 'completed' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                  b.status === 'pending' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' :
                  'bg-slate-100 text-slate-600 hover:bg-slate-100'
                }>
                  {b.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: any; color: string }) {
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
