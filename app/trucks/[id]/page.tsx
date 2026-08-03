'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Truck as TruckIcon, MapPin, Star, Shield, Clock, IndianRupee, MessageSquare,
  ArrowLeft, Phone, CheckCircle2, Loader2, Calendar, Package,
  User as UserIcon, Navigation,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth-context';
import { supabase, VEHICLE_TYPES, INDIAN_CITIES, GOODS_TYPES, calculateSuggestedPrice, type Truck, type Profile, type Review } from '@/lib/supabase';
import { toast } from 'sonner';

const truckImages = [
  'https://images.pexels.com/photos/20922619/pexels-photo-20922619.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/29057949/pexels-photo-29057949.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/29057947/pexels-photo-29057947.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/29057946/pexels-photo-29057946.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/28264496/pexels-photo-28264496.jpeg?auto=compress&cs=tinysrgb&w=1200',
];

type TruckWithProfile = Truck & { profiles?: Profile };

export default function TruckDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, profile } = useAuth();
  const [truck, setTruck] = useState<TruckWithProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('trucks')
        .select('*, profiles!trucks_owner_id_fkey(*)')
        .eq('id', id)
        .maybeSingle();
      setTruck(data);
      const { data: revs } = await supabase
        .from('reviews')
        .select('*, reviewer:profiles!reviews_reviewer_id_fkey(full_name)')
        .eq('truck_id', id)
        .order('created_at', { ascending: false })
        .limit(5);
      setReviews(revs || []);
      setLoading(false);
    }
    if (id) load();
  }, [id]);

  if (loading) {
    return (
      <div className="container-mw container-px py-8">
        <Skeleton className="mb-6 h-6 w-32" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-80 w-full rounded-2xl" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!truck) {
    return (
      <div className="container-mw container-px py-20 text-center">
        <TruckIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h2 className="mt-4 text-xl font-semibold">Truck not found</h2>
        <p className="mt-2 text-muted-foreground">This listing may have been removed.</p>
        <Link href="/search"><Button className="mt-4">Browse Trucks</Button></Link>
      </div>
    );
  }

  const image = truck.images?.[0] || truckImages[Math.abs(id.charCodeAt(0) + id.charCodeAt(1)) % truckImages.length];
  const owner = truck.profiles;

  function handleBookClick() {
    if (!user) {
      toast.info('Please sign in to book a truck');
      router.push('/login');
      return;
    }
    if (profile?.role === 'owner') {
      toast.error('Truck owners cannot book trucks. Use a customer account.');
      return;
    }
    setBookingOpen(true);
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container-mw container-px py-6">
        <Link href="/search" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to search
        </Link>

        <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left: images + details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative overflow-hidden rounded-2xl bg-white">
              <img src={image} alt={truck.vehicle_type} className="h-80 w-full object-cover" />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge className="bg-white/90 text-foreground">
                  <TruckIcon className="mr-1 h-3 w-3" /> {truck.vehicle_type}
                </Badge>
                {truck.is_verified && (
                  <Badge className="bg-green-500 text-white">
                    <Shield className="mr-1 h-3 w-3" /> Verified
                  </Badge>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{truck.model || truck.vehicle_type}</h1>
                  <p className="mt-1 text-muted-foreground">{truck.registration_number || 'Verified truck'} · {truck.year}</p>
                </div>
                {truck.rating_avg > 0 && (
                  <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-amber-700">{truck.rating_avg.toFixed(1)}</span>
                    <span className="text-sm text-amber-600">({truck.rating_count})</span>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <InfoBox icon={Package} label="Capacity" value={`${truck.capacity_tons} Tons`} />
                <InfoBox icon={TruckIcon} label="Type" value={truck.vehicle_type} />
                <InfoBox icon={MapPin} label="Location" value={truck.current_city} />
                <InfoBox icon={IndianRupee} label="Price/km" value={`₹${truck.price_per_km}`} />
              </div>

              {truck.description && (
                <div className="mt-6">
                  <h3 className="font-semibold">Description</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{truck.description}</p>
                </div>
              )}

              {truck.is_return_load_available && (
                <div className="mt-6 rounded-xl bg-green-50 border border-green-200 p-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-semibold">Return Load Available</span>
                  </div>
                  <p className="mt-1 text-sm text-green-600">
                    This truck is heading to {truck.destination_city || 'another city'} and has capacity for return loads at a discounted rate.
                  </p>
                </div>
              )}
            </div>

            {/* Reviews */}
            <div className="rounded-2xl border border-border bg-white p-6">
              <h2 className="text-lg font-semibold">Reviews ({reviews.length})</h2>
              {reviews.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">No reviews yet. Be the first to book and review!</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="border-b border-border/50 pb-4 last:border-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {(r as any).reviewer?.full_name?.[0] || 'U'}
                          </div>
                          <span className="text-sm font-medium">{(r as any).reviewer?.full_name || 'Anonymous'}</span>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating_overall ? 'fill-amber-400 text-amber-400' : 'text-border'}`} />
                          ))}
                        </div>
                      </div>
                      {r.comment && <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: booking card + owner info */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-white p-6 sticky top-20">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">₹{truck.price_per_km}</span>
                <span className="text-muted-foreground">/km</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Final price negotiable with owner</p>

              <Button className="mt-4 w-full" size="lg" onClick={handleBookClick} disabled={!truck.is_available}>
                {truck.is_available ? 'Book This Truck' : 'Currently Unavailable'}
              </Button>
              {user && profile?.role !== 'owner' && (
                <Button
                  variant="outline"
                  className="mt-2 w-full"
                  onClick={() => router.push(`/chat?truckId=${truck.id}&ownerId=${truck.owner_id}`)}
                >
                  <MessageSquare className="mr-2 h-4 w-4" /> Message Owner
                </Button>
              )}

              <Separator className="my-4" />
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="h-4 w-4 text-green-500" /> KYC Verified Owner
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary" /> Quick Response
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Navigation className="h-4 w-4 text-primary" /> Live GPS Tracking
                </div>
              </div>
            </div>

            {owner && (
              <div className="rounded-2xl border border-border bg-white p-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Truck Owner</h3>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                    {owner.full_name?.[0] || 'O'}
                  </div>
                  <div>
                    <p className="font-semibold">{owner.full_name}</p>
                    <p className="text-sm text-muted-foreground">{owner.city}</p>
                  </div>
                </div>
                {owner.is_verified && (
                  <Badge className="mt-3 bg-green-100 text-green-700 hover:bg-green-100">
                    <Shield className="mr-1 h-3 w-3" /> Verified Owner
                  </Badge>
                )}
                {owner.company_name && (
                  <p className="mt-3 text-sm text-muted-foreground">{owner.company_name}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <BookingDialog
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        truck={truck}
        userId={user?.id || ''}
      />
    </div>
  );
}

function InfoBox({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <p className="mt-1 font-semibold text-sm">{value}</p>
    </div>
  );
}

function BookingDialog({
  open, onOpenChange, truck, userId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  truck: Truck;
  userId: string;
}) {
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupCity, setPickupCity] = useState(truck.current_city || '');
  const [dropAddress, setDropAddress] = useState('');
  const [dropCity, setDropCity] = useState('');
  const [goodsType, setGoodsType] = useState('');
  const [weight, setWeight] = useState('');
  const [loadingDate, setLoadingDate] = useState('');
  const [notes, setNotes] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [distance, setDistance] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const suggested = distance && truck.vehicle_type
    ? calculateSuggestedPrice(parseFloat(distance), truck.vehicle_type)
    : null;

  async function handleSubmit() {
    if (!pickupAddress || !dropAddress || !dropCity || !loadingDate) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const distNum = distance ? parseFloat(distance) : 0;
      const suggestedPrices = calculateSuggestedPrice(distNum, truck.vehicle_type);
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          customer_id: userId,
          truck_id: truck.id,
          owner_id: truck.owner_id,
          pickup_address: pickupAddress,
          pickup_city: pickupCity,
          drop_address: dropAddress,
          drop_city: dropCity,
          goods_type: goodsType,
          weight_tons: weight ? parseFloat(weight) : 1,
          loading_date: loadingDate,
          notes,
          customer_offer_price: offerPrice ? parseFloat(offerPrice) : 0,
          distance_km: distNum,
          suggested_price_min: suggestedPrices.min,
          suggested_price_max: suggestedPrices.max,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: truck.owner_id,
        title: 'New Booking Request',
        body: `You have a new booking request for ${truck.vehicle_type} from ${pickupCity} to ${dropCity}.`,
        type: 'booking',
        reference_id: data.id,
      });

      toast.success('Booking request sent! The owner will respond shortly.');
      onOpenChange(false);
      window.location.href = `/customer/bookings/${data.id}`;
    } catch (err: any) {
      toast.error(err.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book This Truck</DialogTitle>
          <DialogDescription>
            Fill in your shipment details. The owner will review and respond with a confirmation or counter-offer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="pickupAddress">Pickup Address *</Label>
            <Textarea id="pickupAddress" required value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="Full pickup address" className="mt-1" rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="pickupCity">Pickup City</Label>
              <select id="pickupCity" value={pickupCity}
                onChange={(e) => setPickupCity(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                {INDIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="dropCity">Drop City *</Label>
              <select id="dropCity" required value={dropCity}
                onChange={(e) => setDropCity(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select city</option>
                {INDIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="dropAddress">Drop Address *</Label>
            <Textarea id="dropAddress" required value={dropAddress}
              onChange={(e) => setDropAddress(e.target.value)}
              placeholder="Full drop address" className="mt-1" rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="goodsType">Goods Type</Label>
              <select id="goodsType" value={goodsType}
                onChange={(e) => setGoodsType(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select type</option>
                {GOODS_TYPES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="weight">Weight (tons)</Label>
              <Input id="weight" type="number" step="0.1" value={weight}
                onChange={(e) => setWeight(e.target.value)} placeholder="1.5" className="mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="loadingDate">Loading Date *</Label>
              <Input id="loadingDate" type="date" required value={loadingDate}
                onChange={(e) => setLoadingDate(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="distance">Distance (km)</Label>
              <Input id="distance" type="number" value={distance}
                onChange={(e) => setDistance(e.target.value)} placeholder="350" className="mt-1" />
            </div>
          </div>

          {suggested && (
            <div className="rounded-lg bg-primary/5 p-3 text-sm">
              <p className="font-medium text-primary">Suggested Price Range</p>
              <p className="mt-1 text-muted-foreground">
                Based on {distance} km for a {truck.vehicle_type}: <strong>₹{suggested.min} – ₹{suggested.max}</strong>
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="offerPrice">Your Offer Price (₹)</Label>
            <Input id="offerPrice" type="number" value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              placeholder={suggested ? `${suggested.min}` : 'Enter your offer'} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea id="notes" value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions for the owner" className="mt-1" rows={2} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {submitting ? 'Sending…' : 'Send Booking Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
