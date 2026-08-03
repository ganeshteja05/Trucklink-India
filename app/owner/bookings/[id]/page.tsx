'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, MapPin, Package, Calendar, IndianRupee, Truck, User as UserIcon,
  Check, X, MessageSquare, Star, Loader2, Navigation, CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase, type Booking, type Message } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/status-badge';
import { toast } from 'sonner';

export default function OwnerBookingDetail() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [counterPrice, setCounterPrice] = useState('');
  const [showCounter, setShowCounter] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('bookings')
        .select('*, trucks(*), customer:profiles!bookings_customer_id_fkey(*), owner:profiles!bookings_owner_id_fkey(*)')
        .eq('id', id)
        .maybeSingle();
      setBooking(data);
      if (data?.owner_counter_price) setCounterPrice(String(data.owner_counter_price));

      const { data: msgs } = await supabase
        .from('messages')
        .select('*, sender:profiles!messages_sender_id_fkey(full_name)')
        .eq('booking_id', id)
        .order('created_at', { ascending: true });
      setMessages(msgs || []);
      setLoading(false);
    }
    if (id) load();

    if (id) {
      const channel = supabase
        .channel(`owner-booking-${id}`)
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

  async function updateStatus(status: string, finalPrice?: number) {
    if (!booking) return;
    setSubmitting(true);
    const payload: any = { status };
    if (finalPrice !== undefined) payload.final_price = finalPrice;
    const { error } = await supabase.from('bookings').update(payload).eq('id', booking.id);
    if (error) { toast.error('Failed to update'); setSubmitting(false); return; }

    await supabase.from('notifications').insert({
      user_id: booking.customer_id,
      title: `Booking ${status.replace('_', ' ')}`,
      body: `Your booking for ${booking.trucks?.vehicle_type} has been ${status}.`,
      type: 'booking',
      reference_id: booking.id,
    });

    setBooking({ ...booking, status: status as any, final_price: finalPrice ?? booking.final_price });
    toast.success(`Booking ${status}`);
    setSubmitting(false);
  }

  async function sendCounter() {
    if (!booking || !counterPrice) return;
    setSubmitting(true);
    const price = parseFloat(counterPrice);
    const { error: bErr } = await supabase
      .from('bookings')
      .update({ owner_counter_price: price, status: 'pending' })
      .eq('id', booking.id);
    if (bErr) { toast.error('Failed'); setSubmitting(false); return; }

    await supabase.from('messages').insert({
      booking_id: booking.id,
      sender_id: profile!.id,
      content: `Counter offer: ₹${price.toLocaleString()}`,
      message_type: 'counter_offer',
      offer_amount: price,
    });

    await supabase.from('notifications').insert({
      user_id: booking.customer_id,
      title: 'Counter Offer Received',
      body: `The owner countered with ₹${price.toLocaleString()} for your booking.`,
      type: 'booking',
      reference_id: booking.id,
    });

    setBooking({ ...booking, owner_counter_price: price });
    setShowCounter(false);
    toast.success('Counter offer sent');
    setSubmitting(false);
  }

  async function sendMessage() {
    if (!newMessage.trim() || !booking || !profile) return;
    setSubmitting(true);
    const { error } = await supabase.from('messages').insert({
      booking_id: booking.id,
      sender_id: profile.id,
      content: newMessage.trim(),
      message_type: 'text',
    });
    if (error) { toast.error('Failed to send'); }
    else { setNewMessage(''); }
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
        <Link href="/owner/bookings"><Button className="mt-4">Back</Button></Link>
      </div>
    );
  }

  const isPending = booking.status === 'pending';

  return (
    <div className="space-y-6">
      <Link href="/owner/bookings" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to bookings
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{booking.trucks?.vehicle_type}</h1>
            <StatusBadge status={booking.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            From {(booking as any).customer?.full_name} · {new Date(booking.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Details */}
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
              <span className="text-muted-foreground">Customer Offer</span>
              <span className="font-medium">₹{booking.customer_offer_price.toLocaleString()}</span>
            </div>
            {booking.owner_counter_price > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Your Counter</span>
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
                {booking.final_price > 0 ? `₹${booking.final_price.toLocaleString()}` : 'Not set'}
              </span>
            </div>
          </div>

          {/* Actions */}
          {isPending && (
            <div className="mt-5 space-y-3">
              <div className="flex gap-2">
                <Button
                  onClick={() => updateStatus('accepted', booking.owner_counter_price || booking.customer_offer_price)}
                  disabled={submitting}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Check className="mr-2 h-4 w-4" /> Accept
                </Button>
                <Button
                  onClick={() => updateStatus('rejected')}
                  disabled={submitting}
                  variant="outline"
                  className="flex-1 text-destructive hover:bg-destructive/10"
                >
                  <X className="mr-2 h-4 w-4" /> Reject
                </Button>
              </div>
              <Button variant="outline" className="w-full" onClick={() => setShowCounter(!showCounter)}>
                <IndianRupee className="mr-2 h-4 w-4" /> Send Counter Offer
              </Button>
              {showCounter && (
                <div className="flex gap-2">
                  <Input type="number" value={counterPrice} onChange={(e) => setCounterPrice(e.target.value)}
                    placeholder="Counter amount" />
                  <Button onClick={sendCounter} disabled={submitting || !counterPrice}>Send</Button>
                </div>
              )}
            </div>
          )}

          {booking.status === 'accepted' && (
            <Button
              onClick={() => updateStatus('in_transit')}
              disabled={submitting}
              className="mt-5 w-full"
            >
              <Navigation className="mr-2 h-4 w-4" /> Mark as In Transit
            </Button>
          )}
          {booking.status === 'in_transit' && (
            <Button
              onClick={() => updateStatus('completed')}
              disabled={submitting}
              className="mt-5 w-full bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Completed
            </Button>
          )}
        </div>

        {/* Chat */}
        <div className="rounded-2xl border border-border bg-white p-6 flex flex-col">
          <h2 className="font-semibold mb-4">Chat with Customer</h2>
          <div className="flex-1 space-y-3 max-h-64 overflow-y-auto rounded-xl bg-slate-50 p-4">
            {messages.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">No messages yet.</p>
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
              placeholder="Type a message…" rows={1} className="flex-1 resize-none"
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            />
            <Button onClick={sendMessage} disabled={submitting || !newMessage.trim()}>
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
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
