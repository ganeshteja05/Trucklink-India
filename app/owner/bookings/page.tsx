'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ArrowRight, IndianRupee } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase, type Booking } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/status-badge';
import { Input } from '@/components/ui/input';

export default function OwnerBookings() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function load() {
      if (!profile) return;
      const { data } = await supabase
        .from('bookings')
        .select('*, trucks(*), customer:profiles!bookings_customer_id_fkey(full_name, city)')
        .eq('owner_id', profile.id)
        .order('created_at', { ascending: false });
      setBookings(data || []);
      setLoading(false);
    }
    load();
  }, [profile]);

  const filtered = bookings.filter((b) => {
    if (filter !== 'all' && b.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return b.pickup_city.toLowerCase().includes(q) ||
        b.drop_city.toLowerCase().includes(q) ||
        (b as any).customer?.full_name?.toLowerCase().includes(q);
    }
    return true;
  });

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Booking Requests</h1>
        <p className="mt-1 text-muted-foreground">
          {pendingCount > 0 ? `You have ${pendingCount} pending request${pendingCount > 1 ? 's' : ''}.` : 'All bookings up to date.'}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search by city or customer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'pending', 'accepted', 'in_transit', 'completed', 'rejected', 'cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                filter === f ? 'bg-primary text-white' : 'bg-white border border-border text-foreground/70 hover:bg-muted'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white py-16 text-center">
          <Package className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">No bookings found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <Link
              key={b.id}
              href={`/owner/bookings/${b.id}`}
              className="block rounded-2xl border border-border bg-white p-5 transition hover:shadow-md hover:border-primary/30"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{b.trucks?.vehicle_type || 'Truck'}</span>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {b.pickup_city} → {b.drop_city} · {(b as any).customer?.full_name}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {b.weight_tons} tons · {b.goods_type || 'General'} · {b.loading_date || 'Date TBD'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {b.customer_offer_price > 0 && (
                    <span className="flex items-center gap-1 font-bold text-primary">
                      <IndianRupee className="h-3.5 w-3.5" />{b.customer_offer_price.toLocaleString()}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">Offer</span>
                  <ArrowRight className="mt-1 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
