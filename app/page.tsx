'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Truck, Shield, MapPin, Clock, IndianRupee, CheckCircle2, ArrowRight,
  Users, Package, Star, TrendingUp, Phone, MessageSquare, Route,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { INDIAN_CITIES, VEHICLE_TYPES } from '@/lib/supabase';

const heroImage =
  'https://images.pexels.com/photos/20922619/pexels-photo-20922619.jpeg?auto=compress&cs=tinysrgb&w=1600';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <Stats />
      <VehicleTypes />
      <HowItWorks />
      <Features />
      <ReturnLoadCTA />
      <Testimonials />
      <FinalCTA />
    </div>
  );
}

function Hero() {
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [truckType, setTruckType] = useState('');

  const searchUrl = `/search?from=${encodeURIComponent(fromCity)}&to=${encodeURIComponent(toCity)}&type=${encodeURIComponent(truckType)}`;

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 hero-gradient" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />

      <div className="container-mw container-px relative">
        <div className="grid min-h-[600px] grid-cols-1 items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div className="text-white animate-slide-up">
            <Badge className="mb-4 bg-white/15 text-white border-white/20 backdrop-blur">
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> 100% Commission-Free
            </Badge>
            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              Book Trucks Directly
              <br />
              <span className="text-sky-200">From Verified Owners</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-sky-100/90">
              India's first truly free truck marketplace. No middlemen, no hidden charges.
              Connect directly with truck owners, negotiate prices, and track your goods in real-time.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="w-full bg-white text-primary hover:bg-sky-50 sm:w-auto">
                  Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/search">
                <Button size="lg" variant="outline" className="w-full border-white/30 bg-transparent text-white hover:bg-white/10 sm:w-auto">
                  Browse Trucks
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-6 text-sm text-sky-100/80">
              <span className="flex items-center gap-1.5">
                <Shield className="h-4 w-4" /> Verified Owners
              </span>
              <span className="flex items-center gap-1.5">
                <IndianRupee className="h-4 w-4" /> No Commission
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> Pan-India Coverage
              </span>
            </div>
          </div>

          {/* Search card */}
          <div className="relative animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <div className="glass rounded-2xl p-6 shadow-2xl">
              <h3 className="mb-4 text-lg font-semibold text-white">Find a Truck Now</h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-sky-100/80">From City</label>
                  <select
                    value={fromCity}
                    onChange={(e) => setFromCity(e.target.value)}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-white placeholder-sky-100/50 outline-none backdrop-blur focus:border-white/40"
                  >
                    <option value="" className="text-slate-900">Select pickup city</option>
                    {INDIAN_CITIES.map((c) => (
                      <option key={c} value={c} className="text-slate-900">{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-sky-100/80">To City</label>
                  <select
                    value={toCity}
                    onChange={(e) => setToCity(e.target.value)}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-white placeholder-sky-100/50 outline-none backdrop-blur focus:border-white/40"
                  >
                    <option value="" className="text-slate-900">Select destination city</option>
                    {INDIAN_CITIES.map((c) => (
                      <option key={c} value={c} className="text-slate-900">{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-sky-100/80">Truck Type</label>
                  <select
                    value={truckType}
                    onChange={(e) => setTruckType(e.target.value)}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-white outline-none backdrop-blur focus:border-white/40"
                  >
                    <option value="" className="text-slate-900">Any type</option>
                    {VEHICLE_TYPES.map((t) => (
                      <option key={t} value={t} className="text-slate-900">{t}</option>
                    ))}
                  </select>
                </div>
                <Link href={searchUrl}>
                  <Button className="w-full bg-white text-primary hover:bg-sky-50" size="lg">
                    <Truck className="mr-2 h-4 w-4" /> Search Trucks
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { label: 'Verified Trucks', value: '5,000+', icon: Truck },
    { label: 'Cities Covered', value: '120+', icon: MapPin },
    { label: 'Happy Customers', value: '12,000+', icon: Users },
    { label: 'Trips Completed', value: '45,000+', icon: Package },
  ];
  return (
    <section className="border-b border-border/60 bg-white py-12">
      <div className="container-mw container-px">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <s.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground">{s.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VehicleTypes() {
  const vehicles = [
    { name: 'Tata Ace', capacity: '0.75 Ton', desc: 'Perfect for intra-city small loads' },
    { name: 'Pickup Van', capacity: '1 Ton', desc: 'Light goods and quick delivery' },
    { name: 'Mini Truck', capacity: '1-3 Tons', desc: 'Compact loads within the city' },
    { name: 'Lorry', capacity: '3-7 Tons', desc: 'Medium cargo across cities' },
    {
      name: 'Container Truck', capacity: '6-16 Tons', desc: 'Secure enclosed transport',
    },
    { name: 'Trailer', capacity: '16-30 Tons', desc: 'Heavy long-haul freight' },
    { name: 'Refrigerated Truck', capacity: '4-10 Tons', desc: 'Cold-chain & perishables' },
    { name: '18 Wheeler', capacity: '25-40 Tons', desc: 'Industrial heavy haulage' },
  ];
  return (
    <section className="py-16 bg-slate-50">
      <div className="container-mw container-px">
        <div className="mb-10 text-center">
          <Badge className="mb-3">Fleet Types</Badge>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Trucks for Every Need</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            From intra-city mini trucks to long-haul heavy trailers, find the right vehicle for your cargo.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {vehicles.map((v) => (
            <div
              key={v.name}
              className="group rounded-xl border border-border bg-white p-5 transition hover:shadow-lg hover:border-primary/40"
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 transition group-hover:bg-primary">
                <Truck className="h-5 w-5 text-primary transition group-hover:text-white" />
              </div>
              <h3 className="font-semibold">{v.name}</h3>
              <p className="mt-1 text-sm text-primary font-medium">{v.capacity}</p>
          <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: SearchIcon,
      title: 'Search & Compare',
      desc: 'Enter your route and cargo details. Browse verified trucks by capacity, price, and rating.',
    },
    {
      icon: MessageSquare,
      title: 'Chat & Negotiate',
      desc: 'Talk directly to the truck owner. Negotiate the best price without any middleman markup.',
    },
    {
      icon: Package,
      title: 'Book & Track',
      desc: 'Confirm your booking and track your goods live on the map from pickup to delivery.',
    },
    {
      icon: Star,
      title: 'Rate & Review',
      desc: 'After delivery, share your experience to help other customers find reliable owners.',
    },
  ];
  return (
    <section className="py-16 bg-white" id="how-it-works">
      <div className="container-mw container-px">
        <div className="mb-10 text-center">
          <Badge className="mb-3">Simple Process</Badge>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">How TruckLink Works</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Four simple steps from search to delivery. No apps to install, no agents to call.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.title} className="relative text-center">
              <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <s.icon className="h-7 w-7 text-primary" />
                <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-semibold text-lg">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              {i < steps.length - 1 && (
                <ArrowRight className="absolute -right-4 top-8 hidden h-6 w-6 text-border md:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: IndianRupee,
      title: 'Zero Commission',
      desc: 'You pay only what you agree with the owner. TruckLink charges absolutely nothing. No subscription, no per-booking fee.',
    },
    {
      icon: Shield,
      title: 'Verified Owners',
      desc: 'Every truck owner is KYC-verified with RC book, insurance, and license checks before listings go live.',
    },
    {
      icon: MapPin,
      title: 'Live GPS Tracking',
      desc: 'Track your shipment on a real-time map from pickup to drop. Know exactly where your goods are, always.',
    },
    {
      icon: MessageSquare,
      title: 'Direct Chat',
      desc: 'In-app messaging with the owner and driver. Share photos, negotiate, and coordinate — all in one place.',
    },
    {
      icon: Route,
      title: 'Return Loads',
      desc: 'Owners post return-trip availability so customers in the destination city get trucks at discounted rates.',
    },
    {
      icon: Star,
      title: 'Transparent Reviews',
      desc: 'Real ratings on communication, delivery, driver behaviour, and vehicle condition from completed trips.',
    },
  ];
  return (
    <section className="py-16 bg-slate-50">
      <div className="container-mw container-px">
        <div className="mb-10 text-center">
          <Badge className="mb-3">Why TruckLink</Badge>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Built for Trust & Transparency</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Every feature is designed to remove the friction and opacity of traditional truck booking.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border bg-white p-6 transition hover:shadow-xl hover:border-primary/30"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition group-hover:bg-primary">
                <f.icon className="h-6 w-6 text-primary group-hover:text-white transition" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReturnLoadCTA() {
  return (
    <section className="py-16 bg-white">
      <div className="container-mw container-px">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-600 to-cyan-600 p-8 md:p-12">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 -right-8 h-64 w-64 rounded-full bg-white/5" />
          <div className="relative grid grid-cols-1 items-center gap-6 lg:grid-cols-2">
            <div className="text-white">
              <Badge className="mb-3 bg-white/20 text-white border-white/20">
                <TrendingUp className="mr-1 h-3.5 w-3.5" /> Save Up to 40%
              </Badge>
              <h2 className="text-3xl font-bold md:text-4xl">Return Loads Marketplace</h2>
              <p className="mt-4 text-sky-100/90 max-w-lg">
                Truck owners heading back empty post-delivery post their return route at a discount.
                Customers in the destination city get the same truck at a fraction of the cost — a win for both.
              </p>
              <div className="mt-6">
                <Link href="/return-loads">
                  <Button size="lg" className="bg-white text-sky-700 hover:bg-sky-50">
                    Browse Return Loads <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex justify-end">
              <div className="animate-float">
                <div className="glass rounded-2xl p-6 w-72">
                  <div className="flex items-center gap-2 text-white">
                    <MapPin className="h-5 w-5" />
                    <span className="font-medium">Mumbai → Pune</span>
                  </div>
                  <div className="mt-3 text-3xl font-bold text-white">₹2,400</div>
                  <div className="text-sm text-sky-100 line-through">₹4,000</div>
                  <div className="mt-3 inline-flex rounded-full bg-green-400/20 px-2 py-0.5 text-xs font-medium text-green-100">
                    40% OFF return load
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    {
      name: 'Rajesh Kumar',
      role: 'Manufacturer, Pune',
      quote:
        'I used to pay 15% commission to brokers. With TruckLink I deal directly with the owner and save on every single trip. The live tracking gives me peace of mind.',
      rating: 5,
    },
    {
      name: 'Suresh Yadav',
      role: 'Truck Owner, Hyderabad',
      quote:
        'Before TruckLink, my truck sat idle for days between trips. Now I get bookings directly and even sell return loads. My revenue has gone up by 30%.',
      rating: 5,
    },
    {
      name: 'Priya Sharma',
      role: 'Logistics Manager, Mumbai',
      quote:
        'The verification system is excellent. I only deal with owners whose RC and insurance are checked. The chat feature makes coordination effortless.',
      rating: 5,
    },
  ];
  return (
    <section className="py-16 bg-slate-50">
      <div className="container-mw container-px">
        <div className="mb-10 text-center">
          <Badge className="mb-3">Real Stories</Badge>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Loved by Customers & Owners</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.map((t) => (
            <div key={t.name} className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mt-4 text-sm text-foreground/80 leading-relaxed">"{t.quote}"</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
   </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-16 bg-white">
      <div className="container-mw container-px">
        <div className="rounded-3xl border border-border bg-slate-900 p-10 text-center md:p-16">
          <h2 className="text-3xl font-bold text-white md:text-4xl">Ready to Move Your Goods?</h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            Join thousands of customers and truck owners already saving time and money on TruckLink India.
          </p>
          <div className="mt-8 flex flex-col gap-3 justify-center sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="bg-primary text-white hover:bg-primary/90">
                Create Free Account <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/search">
              <Button size="lg" variant="outline" className="border-slate-700 bg-transparent text-white hover:bg-slate-800">
                Browse Trucks First
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
