'use client';

import { useEffect, useState } from 'react';
import { Package, Search, IndianRupee } from 'lucide-react';
import { supabase, type Booking } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/status-badge';

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('bookings')
        .select('*, trucks(vehicle_type), customer:profiles!bookings_customer_id_fkey(full_name), owner:profiles!bookings_owner_id_fkey(full_name)')
        .order('created_at', { ascending: false });
      setBookings(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = bookings.filter((b) => {
    if (filter !== 'all' && b.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return b.pickup_city?.toLowerCase().includes(q) ||
        b.drop_city?.toLowerCase().includes(q) ||
        (b as any).customer?.full_name?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">All Bookings</h1>
        <p className="mt-1 text-muted-foreground">Monitor all platform bookings.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input placeholder="Search by city or customer…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'pending', 'accepted', 'in_transit', 'completed', 'cancelled', 'rejected'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                filter === f ? 'bg-primary text-white' : 'bg-white border border-border text-foreground/70 hover:bg-muted'
              }`}>{f.replace('_', ' ')}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white py-16 text-center">
          <Package className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">No bookings found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((b) => (
            <div key={b.id} className="rounded-xl border border-border bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{b.trucks?.vehicle_type || 'Truck'}</span>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {b.pickup_city} → {b.drop_city}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Customer: {(b as any).customer?.full_name} · Owner: {(b as any).owner?.full_name}
                  </p>
                </div>
                <div className="text-right">
                  {b.final_price > 0 ? (
                    <span className="flex items-center gap-1 font-bold text-primary">
                      <IndianRupee className="h-3.5 w-3.5" />{b.final_price.toLocaleString()}
                    </span>
                  ) : b.customer_offer_price > 0 ? (
                    <span className="text-sm text-muted-foreground">Offer: ₹{b.customer_offer_price.toLocaleString()}</span>
                  ) : null}
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
