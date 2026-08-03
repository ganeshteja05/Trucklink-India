'use client';

import { useEffect, useState } from 'react';
import { Truck as TruckIcon, Search, Shield, Check, X } from 'lucide-react';
import { supabase, type Truck } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const truckImages = [
  'https://images.pexels.com/photos/20922619/pexels-photo-20922619.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/29057949/pexels-photo-29057949.jpeg?auto=compress&cs=tinysrgb&w=800',
];

export default function AdminTrucks() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('trucks')
        .select('*, profiles!trucks_owner_id_fkey(full_name)')
        .order('created_at', { ascending: false });
      setTrucks(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = trucks.filter((t) => {
    if (filter !== 'all' && t.verification_status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return t.vehicle_type?.toLowerCase().includes(q) ||
        t.registration_number?.toLowerCase().includes(q) ||
        t.current_city?.toLowerCase().includes(q);
    }
    return true;
  });

  async function setVerification(t: Truck, status: 'approved' | 'rejected') {
    const { error } = await supabase.from('trucks')
      .update({ verification_status: status, is_verified: status === 'approved' })
      .eq('id', t.id);
    if (error) { toast.error('Failed'); return; }
    setTrucks((prev) => prev.map((tr) => tr.id === t.id ? { ...tr, verification_status: status, is_verified: status === 'approved' } : tr));

    await supabase.from('notifications').insert({
      user_id: t.owner_id,
      title: `Truck ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      body: `Your truck ${t.vehicle_type} (${t.registration_number}) has been ${status}.`,
      type: 'verification',
      reference_id: t.id,
    });
    toast.success(`Truck ${status}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">All Trucks</h1>
        <p className="mt-1 text-muted-foreground">Review and verify truck listings.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input placeholder="Search by type, reg, or city…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition capitalize ${
                filter === f ? 'bg-primary text-white' : 'bg-white border border-border text-foreground/70 hover:bg-muted'
              }`}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white py-16 text-center">
          <TruckIcon className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">No trucks found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t, i) => (
            <div key={t.id} className="flex items-center gap-4 rounded-xl border border-border bg-white p-4">
              <img src={t.images?.[0] || truckImages[i % 2]} alt="" className="h-16 w-20 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{t.vehicle_type}</span>
                  <Badge className={
                    t.verification_status === 'approved' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                    t.verification_status === 'pending' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' :
                    'bg-red-100 text-red-700 hover:bg-red-100'
                  }>{t.verification_status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t.registration_number} · {t.current_city} · {(t as any).profiles?.full_name}
                </p>
              </div>
              {t.verification_status !== 'approved' && (
                <Button size="sm" onClick={() => setVerification(t, 'approved')} className="bg-green-600 hover:bg-green-700">
                  <Check className="mr-1 h-4 w-4" /> Approve
                </Button>
              )}
              {t.verification_status !== 'rejected' && (
                <Button size="sm" variant="outline" onClick={() => setVerification(t, 'rejected')} className="text-destructive">
                  <X className="mr-1 h-4 w-4" /> Reject
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
