'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp, MapPin, Truck as TruckIcon, IndianRupee, ArrowRight, Calendar,
} from 'lucide-react';
import { supabase, type ReturnLoad, VEHICLE_TYPES, INDIAN_CITIES } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const truckImages = [
  'https://images.pexels.com/photos/20922619/pexels-photo-20922619.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/29057949/pexels-photo-29057949.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/29057947/pexels-photo-29057947.jpeg?auto=compress&cs=tinysrgb&w=800',
];

export default function ReturnLoadsPage() {
  const [loads, setLoads] = useState<ReturnLoad[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    async function load() {
      let query = supabase
        .from('return_loads')
        .select('*, trucks(*), profiles!return_loads_owner_id_fkey(*)')
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });
      if (cityFilter) query = query.eq('available_for_city', cityFilter);
      if (typeFilter) query = query.eq('vehicle_type', typeFilter);
      const { data } = await query.limit(30);
      setLoads(data || []);
      setLoading(false);
    }
    load();
  }, [cityFilter, typeFilter]);

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-gradient-to-r from-sky-600 to-cyan-600 text-white">
        <div className="container-mw container-px py-10">
          <Badge className="mb-3 bg-white/20 text-white border-white/20">
            <TrendingUp className="mr-1 h-3.5 w-3.5" /> Save Up to 40%
          </Badge>
          <h1 className="text-3xl font-bold">Return Loads Marketplace</h1>
          <p className="mt-2 max-w-2xl text-sky-100/90">
            Trucks heading back empty after delivery post their return route at a discount.
            Book the same truck at a fraction of the cost.
          </p>
        </div>
      </div>

      <div className="container-mw container-px py-6">
        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="flex-1 rounded-lg border border-input bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All cities</option>
            {INDIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="flex-1 rounded-lg border border-input bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All truck types</option>
            {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 w-full" />)}
          </div>
        ) : loads.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white py-20 text-center">
            <TruckIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No return loads available</h3>
            <p className="mt-2 text-sm text-muted-foreground">Check back later or browse regular trucks.</p>
            <Link href="/search"><Button className="mt-4">Browse All Trucks</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loads.map((load, i) => {
              const truck = load.trucks;
              const owner = load.profiles;
              return (
                <div key={load.id} className="overflow-hidden rounded-2xl border border-border bg-white transition hover:shadow-lg">
                  <div className="relative h-36">
                    <img
                      src={truck?.images?.[0] || truckImages[i % 3]}
                      alt={load.vehicle_type}
                      className="h-full w-full object-cover"
                    />
                    <Badge className="absolute top-3 left-3 bg-green-500 text-white">Return Load</Badge>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{load.current_city}</span>
                      <ArrowRight className="h-3 w-3" />
                      <span className="text-sm font-medium">{load.available_for_city}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="secondary">{load.vehicle_type}</Badge>
                      <Badge variant="secondary">{load.capacity_tons} Ton</Badge>
                      {load.available_date && (
                        <Badge variant="secondary">
                          <Calendar className="mr-1 h-3 w-3" /> {new Date(load.available_date).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-3 flex items-end justify-between border-t border-border/60 pt-3">
                      <div>
                        {load.price_suggestion > 0 ? (
                          <>
                            <span className="text-xl font-bold">₹{load.price_suggestion.toLocaleString()}</span>
                            <span className="text-xs text-muted-foreground ml-1">suggested</span>
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground">Price negotiable</span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{owner?.full_name}</span>
                    </div>
                    <Link href={`/trucks/${load.truck_id}`}>
                      <Button variant="outline" className="mt-3 w-full" size="sm">
                        View Truck & Book
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
