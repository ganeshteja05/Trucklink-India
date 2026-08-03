'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Truck as TruckIcon, Loader2, Upload, Check } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase, VEHICLE_TYPES, INDIAN_CITIES, type Truck } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const truckImages = [
  'https://images.pexels.com/photos/20922619/pexels-photo-20922619.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/29057949/pexels-photo-29057949.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/29057947/pexels-photo-29057947.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/29057946/pexels-photo-29057946.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/28264496/pexels-photo-28264496.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/14214416/pexels-photo-14214416.jpeg?auto=compress&cs=tinysrgb&w=800',
];

export default function AddTruckPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<Truck | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  const [form, setForm] = useState({
    vehicle_type: 'Tata Ace',
    capacity_tons: '1',
    registration_number: '',
    model: '',
    year: '2020',
    description: '',
    current_city: '',
    price_per_km: '15',
    destination_city: '',
    is_return_load_available: false,
  });

  // Load editing truck if query param exists
  useState(() => {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('edit');
    if (editId) {
      supabase.from('trucks').select('*').eq('id', editId).maybeSingle().then(({ data }) => {
        if (data) {
          setEditing(data);
          setForm({
            vehicle_type: data.vehicle_type,
            capacity_tons: String(data.capacity_tons),
            registration_number: data.registration_number,
            model: data.model || '',
            year: String(data.year),
            description: data.description || '',
            current_city: data.current_city,
            price_per_km: String(data.price_per_km),
            destination_city: data.destination_city || '',
            is_return_load_available: data.is_return_load_available,
          });
        }
      });
    }
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    if (!form.current_city || !form.registration_number) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        owner_id: profile.id,
        vehicle_type: form.vehicle_type,
        capacity_tons: parseFloat(form.capacity_tons),
        registration_number: form.registration_number,
        model: form.model,
        year: parseInt(form.year),
        description: form.description,
        current_city: form.current_city,
        price_per_km: parseFloat(form.price_per_km),
        destination_city: form.destination_city,
        is_return_load_available: form.is_return_load_available,
        images: [truckImages[selectedImage]],
        verification_status: 'pending',
      };

      if (editing) {
        const { error } = await supabase.from('trucks').update({
          ...payload,
          verification_status: 'pending',
        }).eq('id', editing.id);
        if (error) throw error;
        toast.success('Truck updated! Re-review pending.');
      } else {
        const { error } = await supabase.from('trucks').insert(payload);
        if (error) throw error;
        toast.success('Truck added! Awaiting verification.');
      }
      router.push('/owner/trucks');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save truck');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Link href="/owner/trucks" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to trucks
      </Link>

      <div>
        <h1 className="text-2xl font-bold">{editing ? 'Edit Truck' : 'Add a Truck'}</h1>
        <p className="mt-1 text-muted-foreground">
          {editing ? 'Update your truck details.' : 'List a new truck in your fleet. All trucks go through verification before going live.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-white p-6">
        {/* Image picker */}
        <div>
          <Label>Truck Photo</Label>
          <p className="mt-1 text-xs text-muted-foreground">Choose a photo that best represents your truck type.</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {truckImages.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedImage(i)}
                className={`relative overflow-hidden rounded-lg border-2 transition ${
                  selectedImage === i ? 'border-primary ring-2 ring-primary/30' : 'border-border'
                }`}
              >
                <img src={img} alt="" className="h-20 w-full object-cover" />
                {selectedImage === i && (
                  <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="vehicle_type">Vehicle Type *</Label>
            <select
              id="vehicle_type" required value={form.vehicle_type}
              onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="capacity_tons">Capacity (Tons) *</Label>
            <Input id="capacity_tons" type="number" step="0.1" required value={form.capacity_tons}
              onChange={(e) => setForm({ ...form, capacity_tons: e.target.value })} className="mt-1" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="registration_number">Registration Number *</Label>
            <Input id="registration_number" required value={form.registration_number}
              onChange={(e) => setForm({ ...form, registration_number: e.target.value })}
              placeholder="TS 09 AB 1234" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="model">Model</Label>
            <Input id="model" value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              placeholder="Tata LPT 1613" className="mt-1" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="year">Year</Label>
            <Input id="year" type="number" value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="price_per_km">Price per km (₹) *</Label>
            <Input id="price_per_km" type="number" required value={form.price_per_km}
              onChange={(e) => setForm({ ...form, price_per_km: e.target.value })} className="mt-1" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="current_city">Current City *</Label>
            <select
              id="current_city" required value={form.current_city}
              onChange={(e) => setForm({ ...form, current_city: e.target.value })}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select city</option>
              {INDIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="destination_city">Destination City (Optional)</Label>
            <select
              id="destination_city" value={form.destination_city}
              onChange={(e) => setForm({ ...form, destination_city: e.target.value })}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Not specified</option>
              {INDIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe your truck, features, and any special capabilities" className="mt-1" rows={3} />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_return_load_available}
            onChange={(e) => setForm({ ...form, is_return_load_available: e.target.checked })}
            className="h-4 w-4 rounded border-border"
          />
          <span className="text-sm">This truck has return load availability</span>
        </label>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.push('/owner/trucks')} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} className="flex-1">
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TruckIcon className="mr-2 h-4 w-4" />}
            {submitting ? 'Saving…' : (editing ? 'Update Truck' : 'Add Truck')}
          </Button>
        </div>
      </form>
    </div>
  );
}
