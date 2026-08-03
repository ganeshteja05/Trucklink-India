'use client';

import Link from 'next/link';
import { Search, MessageSquare, Package, Star, ArrowRight, Truck, IndianRupee, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function HowItWorksPage() {
  const steps = [
    { icon: Search, title: 'Search & Compare', desc: 'Enter your pickup and drop cities, select truck type, and browse verified trucks. Filter by capacity, price, and rating to find the perfect match.' },
    { icon: MessageSquare, title: 'Chat & Negotiate', desc: 'Message the truck owner directly in-app. Discuss details, negotiate the price, and agree on terms — no broker, no middleman markup.' },
    { icon: Package, title: 'Book & Track', desc: 'Send a booking request with your shipment details. Once accepted, track your goods on a live map from pickup to delivery.' },
    { icon: Star, title: 'Rate & Review', desc: 'After delivery, rate the owner on communication, delivery, driver behaviour, and vehicle condition. Help build trust in the community.' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="hero-gradient text-white">
        <div className="container-mw container-px py-16">
          <Badge className="mb-4 bg-white/15 text-white border-white/20">Simple Process</Badge>
          <h1 className="text-4xl font-bold">How TruckLink Works</h1>
          <p className="mt-4 max-w-2xl text-sky-100/90 text-lg">
            From search to delivery in four simple steps. No apps to install, no agents to call — just direct, transparent truck booking.
          </p>
        </div>
      </div>

      <div className="container-mw container-px py-16">
        <div className="space-y-8">
          {steps.map((s, i) => (
            <div key={s.title} className="flex flex-col gap-6 rounded-2xl border border-border bg-white p-8 md:flex-row md:items-center">
              <div className="flex items-center gap-4 md:flex-col md:items-center">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
                  <s.icon className="h-8 w-8 text-primary" />
                  <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {i + 1}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{s.title}</h2>
                <p className="mt-2 text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-600 p-8 text-center text-white">
          <h2 className="text-2xl font-bold">Ready to Get Started?</h2>
          <p className="mt-2 text-sky-100">Create your free account and book your first truck today.</p>
          <Link href="/register">
            <Button size="lg" className="mt-6 bg-white text-sky-700 hover:bg-sky-50">
              Create Free Account <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
