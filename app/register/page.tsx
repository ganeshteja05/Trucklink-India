'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Truck, Mail, Lock, User as UserIcon, Phone, ArrowRight,
  AlertCircle, Package, Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase, type UserRole, INDIAN_CITIES } from '@/lib/supabase';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole>('customer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
          },
        },
      });
      if (error) throw error;

      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          role,
          full_name: fullName,
          phone,
          city,
          company_name: companyName,
          gst_number: gstNumber,
        });
      }

      toast.success('Account created! Welcome to TruckLink.');
      if (role === 'owner') router.push('/owner');
      else router.push('/customer');
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
              <Truck className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold">Truck<span className="text-primary">Link</span></span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold">Create Your Account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {step === 1 ? 'Choose how you want to use TruckLink' : 'Tell us about yourself'}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className={`h-2 w-16 rounded-full transition ${step >= 1 ? 'bg-primary' : 'bg-border'}`} />
          <div className={`h-2 w-16 rounded-full transition ${step >= 2 ? 'bg-primary' : 'bg-border'}`} />
        </div>

        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => { setRole('customer'); setStep(2); }}
                className="group flex w-full items-center gap-4 rounded-xl border-2 border-border p-5 text-left transition hover:border-primary hover:bg-primary/5"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition group-hover:bg-primary">
                  <Package className="h-6 w-6 text-primary transition group-hover:text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">I'm a Customer</h3>
                  <p className="text-sm text-muted-foreground">I want to book trucks for my goods</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:text-primary" />
              </button>

              <button
                type="button"
                onClick={() => { setRole('owner'); setStep(2); }}
                className="group flex w-full items-center gap-4 rounded-xl border-2 border-border p-5 text-left transition hover:border-primary hover:bg-primary/5"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition group-hover:bg-primary">
                  <Truck className="h-6 w-6 text-primary transition group-hover:text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">I'm a Truck Owner</h3>
                  <p className="text-sm text-muted-foreground">I want to list my trucks and get bookings</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:text-primary" />
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative mt-1">
                  <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="fullName" required value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Rajesh Kumar" className="pl-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="email" type="email" required value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com" className="pl-9"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="phone" type="tel" required value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210" className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="city">City</Label>
                  <select
                    id="city" required value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select your city</option>
                    {INDIAN_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="password" type="password" required value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters" className="pl-9" minLength={6}
                    />
                  </div>
                </div>
              </div>

              {role === 'owner' && (
                <div className="rounded-xl bg-primary/5 p-4 space-y-4">
                  <p className="text-sm font-medium text-primary flex items-center gap-1.5">
                    <Check className="h-4 w-4" /> Truck Owner Details
                  </p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="companyName">Company Name (Optional)</Label>
                      <Input id="companyName" value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Your transport company" className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gstNumber">GST Number (Optional)</Label>
                      <Input id="gstNumber" value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value)}
                        placeholder="22AAAAA0000A1Z5" className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating…' : (<>Create Account <ArrowRight className="ml-2 h-4 w-4" /></>)}
                </Button>
              </div>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
