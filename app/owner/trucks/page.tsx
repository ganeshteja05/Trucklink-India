'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Truck as TruckIcon, Plus, MapPin, Star, Shield, Edit, Trash2, Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase, type Truck } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const truckImages = [
  'https://images.pexels.com/photos/20922619/pexels-photo-20922619.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/29057949/pexels-photo-29057949.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/29057947/pexels-photo-29057947.jpeg?auto=compress&cs=tinysrgb&w=800',
];

export default function OwnerTrucksPage() {
  const { profile } = useAuth();
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!profile) return;
      const { data } = await supabase
        .from('trucks')
        .select('*')
        .eq('owner_id', profile.id)
        .order('created_at', { ascending: false });
      setTrucks(data || []);
      setLoading(false);
    }
    load();
  }, [profile]);

  async function toggleAvailability(t: Truck) {
    const { error } = await supabase
      .from('trucks')
      .update({ is_available: !t.is_available })
      .eq('id', t.id);
    if (error) { toast.error('Failed to update'); return; }
    setTrucks((prev) => prev.map((tr) => tr.id === t.id ? { ...tr, is_available: !t.is_available } : tr));
    toast.success(t.is_available ? 'Marked unavailable' : 'Marked available');
  }

  async function deleteTruck(id: string) {
    if (!confirm('Delete this truck? This cannot be undone.')) return;
    const { error } = await supabase.from('trucks').delete().eq('id', id);
    if (error) { toast.error('Failed to delete'); return; }
    setTrucks((prev) => prev.filter((t) => t.id !== id));
    toast.success('Truck deleted');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">My Trucks</h1>
          <p className="mt-1 text-muted-foreground">Manage your fleet listings.</p>
        </div>
        <Link href="/owner/trucks/new">
          <Button><Plus className="mr-2 h-4 w-4" /> Add Truck</Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-56 w-full" />)}
        </div>
      ) : trucks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white py-16 text-center">
          <TruckIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No trucks yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">Add your first truck to start receiving bookings.</p>
          <Link href="/owner/trucks/new"><Button className="mt-4"><Plus className="mr-2 h-4 w-4" /> Add Truck</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {trucks.map((t, i) => (
            <div key={t.id} className="overflow-hidden rounded-2xl border border-border bg-white">
              <div className="relative h-36">
                <img src={t.images?.[0] || truckImages[i % 3]} alt={t.vehicle_type} className="h-full w-full object-cover" />
                <div className="absolute top-3 right-3 flex gap-2">
                  {t.verification_status === 'approved' && (
                    <Badge className="bg-green-500 text-white"><Shield className="mr-1 h-3 w-3" /> Verified</Badge>
                  )}
                  {t.verification_status === 'pending' && (
                    <Badge className="bg-amber-500 text-white">Pending Review</Badge>
                  )}
                  {t.verification_status === 'rejected' && (
                    <Badge className="bg-red-500 text-white">Rejected</Badge>
                  )}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{t.model || t.vehicle_type}</h3>
                    <p className="text-sm text-muted-foreground">{t.registration_number}</p>
                  </div>
                  {t.rating_avg > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium">{t.rating_avg.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="secondary">{t.vehicle_type}</Badge>
                  <Badge variant="secondary">{t.capacity_tons} Ton</Badge>
                  <Badge variant="secondary"><MapPin className="mr-1 h-3 w-3" /> {t.current_city}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                  <span className="font-bold">₹{t.price_per_km}<span className="text-sm font-normal text-muted-foreground">/km</span></span>
                  <Badge className={t.is_available ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-100'}>
                    {t.is_available ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
                <div className="mt-3 flex gap-2">
                  <Link href={`/owner/trucks/${t.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full"><Edit className="mr-1 h-3.5 w-3.5" /> Edit</Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => toggleAvailability(t)}>
                    {t.is_available ? 'Pause' : 'Activate'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => deleteTruck(t.id)} className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
