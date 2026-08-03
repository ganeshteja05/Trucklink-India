'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase, type Booking } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/status-badge';

export default function OwnerMessages() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!profile) return;
      const { data } = await supabase
        .from('bookings')
        .select('*, trucks(*), customer:profiles!bookings_customer_id_fkey(full_name)')
        .eq('owner_id', profile.id)
        .order('updated_at', { ascending: false });
      setBookings(data || []);
      setLoading(false);
    }
    load();
  }, [profile]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="mt-1 text-muted-foreground">Conversations with your customers.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white py-16 text-center">
          <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">No conversations yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {bookings.map((b) => (
            <Link
              key={b.id}
              href={`/owner/bookings/${b.id}`}
              className="flex items-center justify-between rounded-xl border border-border bg-white p-4 transition hover:shadow-md hover:border-primary/30"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{b.trucks?.vehicle_type || 'Truck'}</span>
                  <StatusBadge status={b.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {(b as any).customer?.full_name} · {b.pickup_city} → {b.drop_city}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
