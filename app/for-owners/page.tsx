'use client';

import Link from 'next/link';
import { Truck, IndianRupee, TrendingUp, Shield, Users, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ForOwnersPage() {
  const benefits = [
    { icon: IndianRupee, title: 'Zero Commission', desc: 'Keep 100% of what you earn. No per-booking fee, no subscription, no hidden charges. Ever.' },
    { icon: Users, title: 'Direct Customers', desc: 'Connect directly with customers across India. No broker cutting into your margins.' },
    { icon: TrendingUp, title: 'Return Load Marketplace', desc: 'Sell your empty return trips at a discount and turn dead miles into revenue.' },
    { icon: Shield, title: 'KYC Verification', desc: 'Get a verified badge that builds trust and gets you 3x more booking requests.' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="hero-gradient text-white">
        <div className="container-mw container-px py-16">
          <Badge className="mb-4 bg-white/15 text-white border-white/20">For Truck Owners</Badge>
          <h1 className="text-4xl font-bold">Turn Your Trucks Into Revenue</h1>
          <p className="mt-4 max-w-2xl text-sky-100/90 text-lg">
            List your fleet on TruckLink and get bookings directly from customers across India.
            No commission, no middlemen — just more business.
          </p>
          <Link href="/register">
            <Button size="lg" className="mt-6 bg-white text-sky-700 hover:bg-sky-50">
              List Your Trucks Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="container-mw container-px py-16">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-2xl border border-border bg-white p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <b.icon className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold">{b.title}</h2>
              <p className="mt-2 text-muted-foreground leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-white p-8">
          <h2 className="text-2xl font-bold text-center">How to Get Started</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { step: 1, title: 'Create Owner Account', desc: 'Sign up as a truck owner with your details.' },
              { step: 2, title: 'Add Your Trucks', desc: 'List each truck with photos, capacity, and pricing.' },
              { step: 3, title: 'Get Verified', desc: 'Upload RC, insurance, and license for a verified badge.' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white text-xl font-bold">
                  {s.step}
                </div>
                <h3 className="font-semibold text-lg">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 rounded-2xl bg-slate-900 p-8 text-center text-white">
          <h2 className="text-2xl font-bold">Start Earning Today</h2>
          <p className="mt-2 text-slate-300">Join 5,000+ truck owners already on TruckLink.</p>
          <Link href="/register">
            <Button size="lg" className="mt-6 bg-primary text-white hover:bg-primary/90">
              Create Free Account <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
