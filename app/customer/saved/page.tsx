'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Trash2, MapPin, Star, Truck as TruckIcon, Shield } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase, type Truck } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const truckImages = [
  'https://images.pexels.com/photos/20922619/pexels-photo-20922619.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/29057949/pexels-photo-29057949.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/29057947/pexels-photo-29057947.jpeg?auto=compress&cs=tinysrgb&w=800',
];

type SavedTruck = { id: string; truck_id: string; trucks: Truck };

export default function SavedTrucksPage() {
  const { profile } = useAuth();
  const [saved, setSaved] = useState<SavedTruck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!profile) return;
      const { data } = await supabase
        .from('saved_trucks')
        .select('id, truck_id, trucks(*)')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      setSaved((data as unknown as SavedTruck[]) || []);
      setLoading(false);
    }
    load();
  }, [profile]);

  async function removeSaved(id: string) {
    const { error } = await supabase.from('saved_trucks').delete().eq('id', id);
    if (error) { toast.error('Failed to remove'); return; }
    setSaved((prev) => prev.filter((s) => s.id !== id));
    toast.success('Removed from saved');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Saved Trucks</h1>
        <p className="mt-1 text-muted-foreground">Trucks you've saved for later booking.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      ) : saved.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white py-16 text-center">
          <Heart className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">No saved trucks yet.</p>
          <Link href="/search" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
            Browse trucks →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {saved.map((s, i) => (
            <div key={s.id} className="overflow-hidden rounded-2xl border border-border bg-white">
              <Link href={`/trucks/${s.truck_id}`}>
                <div className="relative h-36">
                  <img src={s.trucks.images?.[0] || truckImages[i % 3]} alt={s.trucks.vehicle_type} className="h-full w-full object-cover" />
                  <Badge className="absolute bottom-2 left-2 bg-white/90 text-foreground">
                    <TruckIcon className="mr-1 h-3 w-3" /> {s.trucks.vehicle_type}
                  </Badge>
                </div>
              </Link>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{s.trucks.model || s.trucks.vehicle_type}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {s.trucks.current_city}
                    </p>
                  </div>
                  {s.trucks.rating_avg > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium">{s.trucks.rating_avg.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                  <span className="font-bold">₹{s.trucks.price_per_km}<span className="text-sm font-normal text-muted-foreground">/km</span></span>
                  <button onClick={() => removeSaved(s.id)} className="text-muted-foreground hover:text-destructive transition">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
