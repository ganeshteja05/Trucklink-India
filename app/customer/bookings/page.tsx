'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase, type Booking } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/status-badge';
import { Input } from '@/components/ui/input';

export default function CustomerBookings() {
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
        .select('*, trucks(*)')
        .eq('customer_id', profile.id)
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
        b.trucks?.vehicle_type?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <p className="mt-1 text-muted-foreground">Track and manage all your truck bookings.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search by city or truck type…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'pending', 'accepted', 'in_transit', 'completed', 'cancelled'].map((f) => (
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
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white py-16 text-center">
          <Package className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">No bookings found.</p>
          <Link href="/search" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
            Find a truck →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <Link
              key={b.id}
              href={`/customer/bookings/${b.id}`}
              className="block rounded-2xl border border-border bg-white p-5 transition hover:shadow-md hover:border-primary/30"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{b.trucks?.vehicle_type || 'Truck'}</span>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {b.pickup_city} → {b.drop_city} · {b.loading_date || 'Date TBD'}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {b.weight_tons} tons · {b.goods_type || 'General goods'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {b.final_price > 0 && <span className="font-bold">₹{b.final_price}</span>}
                  {b.customer_offer_price > 0 && b.final_price === 0 && (
                    <span className="text-sm text-muted-foreground">Offer: ₹{b.customer_offer_price}</span>
                  )}
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
