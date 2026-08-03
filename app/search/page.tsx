'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Truck as TruckIcon, MapPin, Star, Filter, X, SlidersHorizontal,
  Shield, Clock, IndianRupee, Search, Loader2, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase, VEHICLE_TYPES, INDIAN_CITIES, type Truck, type Profile } from '@/lib/supabase';

const truckImages = [
  'https://images.pexels.com/photos/20922619/pexels-photo-20922619.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/29057949/pexels-photo-29057949.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/29057947/pexels-photo-29057947.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/29057946/pexels-photo-29057946.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/28264496/pexels-photo-28264496.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/14214416/pexels-photo-14214416.jpeg?auto=compress&cs=tinysrgb&w=800',
];

type TruckWithProfile = Truck & { profiles?: Profile };

export default function SearchPage() {
  const params = useSearchParams();
  const [trucks, setTrucks] = useState<TruckWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [fromCity, setFromCity] = useState(params.get('from') || '');
  const [toCity, setToCity] = useState(params.get('to') || '');
  const [vehicleType, setVehicleType] = useState(params.get('type') || '');
  const [minCapacity, setMinCapacity] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  async function loadTrucks() {
    setLoading(true);
    let query = supabase
      .from('trucks')
      .select('*, profiles!trucks_owner_id_fkey(*)')
      .eq('verification_status', 'approved')
      .eq('is_available', true);

    if (fromCity) query = query.eq('current_city', fromCity);
    if (vehicleType) query = query.eq('vehicle_type', vehicleType);
    if (minCapacity) query = query.gte('capacity_tons', parseFloat(minCapacity));
    if (maxPrice) query = query.lte('price_per_km', parseFloat(maxPrice));

    if (sortBy === 'price_low') query = query.order('price_per_km', { ascending: true });
    else if (sortBy === 'price_high') query = query.order('price_per_km', { ascending: false });
    else if (sortBy === 'rating') query = query.order('rating_avg', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    const { data } = await query.limit(50);
    setTrucks(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadTrucks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (fromCity) count++;
    if (toCity) count++;
    if (vehicleType) count++;
    if (minCapacity) count++;
    if (maxPrice) count++;
    return count;
  }, [fromCity, toCity, vehicleType, minCapacity, maxPrice]);

  function clearFilters() {
    setFromCity(''); setToCity(''); setVehicleType('');
    setMinCapacity(''); setMaxPrice('');
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Search bar */}
      <div className="border-b border-border bg-white">
        <div className="container-mw container-px py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">From</Label>
                <select
                  value={fromCity}
                  onChange={(e) => setFromCity(e.target.value)}
                  className="mt-0.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Any city</option>
                  {INDIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">To</Label>
                <select
                  value={toCity}
                  onChange={(e) => setToCity(e.target.value)}
                  className="mt-0.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Any destination</option>
                  {INDIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Truck Type</Label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="mt-0.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">All types</option>
                  {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={loadTrucks} className="flex-1 lg:flex-none">
                <Search className="mr-2 h-4 w-4" /> Search
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
                {activeFilterCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-3 lg:grid-cols-4">
              <div>
                <Label className="text-xs">Min Capacity (tons)</Label>
                <Input type="number" value={minCapacity} onChange={(e) => setMinCapacity(e.target.value)} placeholder="0" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Max Price/km (₹)</Label>
                <Input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="100" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Sort By</Label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="recent">Most Recent</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button variant="ghost" onClick={clearFilters} className="w-full">
                  <X className="mr-1 h-4 w-4" /> Clear All
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="container-mw container-px py-8">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            {loading ? 'Searching…' : `${trucks.length} truck${trucks.length !== 1 ? 's' : ''} available`}
          </h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-white p-4">
                <Skeleton className="mb-3 h-40 w-full rounded-xl" />
                <Skeleton className="mb-2 h-5 w-3/4" />
                <Skeleton className="mb-2 h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : trucks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white py-20 text-center">
            <TruckIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No trucks found</h3>
            <p className="mt-2 text-sm text-muted-foreground">Try adjusting your filters or search criteria.</p>
            <Button onClick={clearFilters} variant="outline" className="mt-4">Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {trucks.map((truck, i) => (
              <TruckCard key={truck.id} truck={truck} imageIndex={i % truckImages.length} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TruckCard({ truck, imageIndex }: { truck: TruckWithProfile; imageIndex: number }) {
  const image = truck.images?.[0] || truckImages[imageIndex];
  return (
    <Link href={`/trucks/${truck.id}`} className="group block">
      <div className="overflow-hidden rounded-2xl border border-border bg-white transition hover:shadow-xl hover:border-primary/30">
        <div className="relative h-44 overflow-hidden">
          <img
            src={image}
            alt={truck.vehicle_type}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <Badge className="bg-white/90 text-foreground">
              <TruckIcon className="mr-1 h-3 w-3" /> {truck.vehicle_type}
            </Badge>
            {truck.is_return_load_available && (
              <Badge className="bg-green-500 text-white">Return Load Available</Badge>
            )}
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">{truck.model || truck.vehicle_type}</h3>
              <p className="text-sm text-muted-foreground">{truck.registration_number || 'Verified truck'}</p>
            </div>
            {truck.rating_avg > 0 && (
              <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium text-amber-700">{truck.rating_avg.toFixed(1)}</span>
                <span className="text-xs text-amber-600">({truck.rating_count})</span>
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{truck.current_city}</span>
            {truck.destination_city && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span>{truck.destination_city}</span>
              </>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary">{truck.capacity_tons} Ton capacity</Badge>
            {truck.is_verified && (
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                <Shield className="mr-1 h-3 w-3" /> Verified
              </Badge>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
            <div>
              <span className="text-lg font-bold text-foreground">₹{truck.price_per_km}</span>
              <span className="text-sm text-muted-foreground">/km</span>
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-primary transition group-hover:gap-2">
              View Details <ChevronRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
