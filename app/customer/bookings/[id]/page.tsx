'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, MessageSquare, MapPin, Package, Calendar, IndianRupee,
  Truck, User as UserIcon, Star, CheckCircle2, XCircle, Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase, type Booking, type Message, type Review } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/status-badge';
import { toast } from 'sonner';

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [existingReview, setExistingReview] = useState<Review | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('bookings')
        .select('*, trucks(*), owner:profiles!bookings_owner_id_fkey(*), customer:profiles!bookings_customer_id_fkey(*)')
        .eq('id', id)
        .maybeSingle();
      setBooking(data);

      const { data: msgs } = await supabase
        .from('messages')
        .select('*, sender:profiles!messages_sender_id_fkey(full_name)')
        .eq('booking_id', id)
        .order('created_at', { ascending: true });
      setMessages(msgs || []);

      const { data: rev } = await supabase
        .from('reviews')
        .select('*')
        .eq('booking_id', id)
        .maybeSingle();
      setExistingReview(rev);

      setLoading(false);
    }
    if (id) load();

    if (id) {
      const channel = supabase
        .channel(`booking-${id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `booking_id=eq.${id}`,
        }, (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [id]);

  async function sendMessage() {
    if (!newMessage.trim() || !booking || !profile) return;
    setSubmitting(true);
    const { error } = await supabase.from('messages').insert({
      booking_id: booking.id,
      sender_id: profile.id,
      content: newMessage.trim(),
      message_type: 'text',
    });
    if (error) {
      toast.error('Failed to send message');
    } else {
      setNewMessage('');
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Booking not found.</p>
        <Link href="/customer/bookings"><Button className="mt-4">Back to Bookings</Button></Link>
      </div>
    );
  }

  const canReview = booking.status === 'completed' && !existingReview;
  const isCustomer = profile?.id === booking.customer_id;

  return (
    <div className="space-y-6">
      <Link href="/customer/bookings" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to bookings
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{booking.trucks?.vehicle_type}</h1>
            <StatusBadge status={booking.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Booking ID: {booking.id.slice(0, 8)} · Created {new Date(booking.created_at).toLocaleDateString()}
          </p>
        </div>
        {canReview && isCustomer && (
          <Button onClick={() => setReviewOpen(true)}>
            <Star className="mr-2 h-4 w-4" /> Leave Review
          </Button>
        )}
        {existingReview && (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Reviewed
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Booking details */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <h2 className="font-semibold mb-4">Shipment Details</h2>
          <div className="space-y-3 text-sm">
            <DetailRow icon={MapPin} label="Pickup" value={`${booking.pickup_address}, ${booking.pickup_city}`} />
            <DetailRow icon={MapPin} label="Drop" value={`${booking.drop_address}, ${booking.drop_city}`} />
            <DetailRow icon={Package} label="Goods" value={`${booking.goods_type || 'General'} · ${booking.weight_tons} tons`} />
            <DetailRow icon={Calendar} label="Loading Date" value={booking.loading_date || 'TBD'} />
            <DetailRow icon={Truck} label="Distance" value={`${booking.distance_km} km`} />
            {booking.notes && <DetailRow icon={UserIcon} label="Notes" value={booking.notes} />}
          </div>

          <Separator className="my-4" />

          <h3 className="text-sm font-semibold mb-3">Pricing</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Your Offer</span>
              <span className="font-medium">₹{booking.customer_offer_price.toLocaleString()}</span>
            </div>
            {booking.owner_counter_price > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Owner Counter</span>
                <span className="font-medium">₹{booking.owner_counter_price.toLocaleString()}</span>
              </div>
            )}
            {booking.suggested_price_min > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Suggested Range</span>
                <span className="font-medium">₹{booking.suggested_price_min} – ₹{booking.suggested_price_max}</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between text-base">
              <span className="font-semibold">Final Price</span>
              <span className="font-bold text-primary">
                {booking.final_price > 0 ? `₹${booking.final_price.toLocaleString()}` : 'Negotiating'}
              </span>
            </div>
          </div>
        </div>

        {/* Chat */}
        <div className="rounded-2xl border border-border bg-white p-6 flex flex-col">
          <h2 className="font-semibold mb-4">Chat with Owner</h2>
          <div className="flex-1 space-y-3 max-h-64 overflow-y-auto rounded-xl bg-slate-50 p-4">
            {messages.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                No messages yet. Start the conversation!
              </p>
            ) : (
              messages.map((m) => {
                const mine = m.sender_id === profile?.id;
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
                      mine ? 'bg-primary text-white' : 'bg-white border border-border'
                    }`}>
                      <p>{m.content}</p>
                      <p className={`mt-1 text-[10px] ${mine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="mt-3 flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message…"
              rows={1}
              className="flex-1 resize-none"
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            />
            <Button onClick={sendMessage} disabled={submitting || !newMessage.trim()}>
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {reviewOpen && (
        <ReviewDialog
          booking={booking}
          userId={profile!.id}
          onClose={() => setReviewOpen(false)}
          onSubmitted={() => { setReviewOpen(false); window.location.reload(); }}
        />
      )}
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
      <div>
        <span className="text-muted-foreground">{label}: </span>
        <span className="font-medium">{value}</span>
      </div>
    </div>
  );
}

function ReviewDialog({ booking, userId, onClose, onSubmitted }: {
  booking: Booking;
  userId: string;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [overall, setOverall] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [delivery, setDelivery] = useState(5);
  const [driver, setDriver] = useState(5);
  const [vehicle, setVehicle] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setSubmitting(true);
    const { error } = await supabase.from('reviews').insert({
      booking_id: booking.id,
      reviewer_id: userId,
      truck_id: booking.truck_id,
      owner_id: booking.owner_id,
      rating_overall: overall,
      rating_communication: communication,
      rating_delivery: delivery,
      rating_driver_behaviour: driver,
      rating_vehicle_condition: vehicle,
      comment,
    });
    setSubmitting(false);
    if (error) { toast.error('Failed to submit review'); return; }
    toast.success('Review submitted!');
    onSubmitted();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="max-w-md w-full rounded-2xl bg-white p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold">Rate Your Experience</h2>
        <p className="mt-1 text-sm text-muted-foreground">Your feedback helps the community.</p>

        <div className="mt-4 space-y-4">
          <RatingRow label="Overall" value={overall} onChange={setOverall} />
          <RatingRow label="Communication" value={communication} onChange={setCommunication} />
          <RatingRow label="Delivery" value={delivery} onChange={setDelivery} />
          <RatingRow label="Driver Behaviour" value={driver} onChange={setDriver} />
          <RatingRow label="Vehicle Condition" value={vehicle} onChange={setVehicle} />
          <div>
            <Label>Comment (Optional)</Label>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} className="mt-1" rows={3} placeholder="Share details of your experience" />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={submit} disabled={submitting} className="flex-1">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Review'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function RatingRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => onChange(n)} className="transition hover:scale-110">
            <Star className={`h-5 w-5 ${n <= value ? 'fill-amber-400 text-amber-400' : 'text-border'}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
