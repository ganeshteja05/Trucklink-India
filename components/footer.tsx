import Link from 'next/link';
import { Truck, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-slate-900 text-slate-300">
      <div className="container-mw container-px py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
                <Truck className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-white">
                Truck<span className="text-primary">Link</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-slate-400">
              India's free truck marketplace connecting customers directly with verified truck owners. No commission, no middlemen.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/search" className="hover:text-primary transition">Find Trucks</Link></li>
              <li><Link href="/return-loads" className="hover:text-primary transition">Return Loads</Link></li>
              <li><Link href="/how-it-works" className="hover:text-primary transition">How It Works</Link></li>
              <li><Link href="/for-owners" className="hover:text-primary transition">For Truck Owners</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-primary transition">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" /> +91 1800-TRUCKLINK
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" /> support@trucklink.in
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Hyderabad, Telangana
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-6 text-sm text-slate-400 md:flex-row">
          <p>&copy; {new Date().getFullYear()} TruckLink India. All rights reserved.</p>
          <p>Made in India for Indian roads.</p>
        </div>
      </div>
    </footer>
  );
}
