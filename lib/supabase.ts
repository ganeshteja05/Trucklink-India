'use client';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'customer' | 'owner' | 'admin';

export type Profile = {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string;
  avatar_url: string;
  city: string;
  is_verified: boolean;
  is_suspended: boolean;
  gst_number: string;
  company_name: string;
  created_at: string;
  updated_at: string;
};

export type Truck = {
  id: string;
  owner_id: string;
  vehicle_type: string;
  capacity_tons: number;
  registration_number: string;
  model: string;
  year: number;
  description: string;
  current_city: string;
  current_lat: number;
  current_lng: number;
  destination_city: string;
  is_available: boolean;
  is_verified: boolean;
  verification_status: 'pending' | 'approved' | 'rejected';
  price_per_km: number;
  images: string[];
  rating_avg: number;
  rating_count: number;
  is_return_load_available: boolean;
  created_at: string;
  profiles?: Profile;
};

export type Booking = {
  id: string;
  customer_id: string;
  truck_id: string;
  owner_id: string;
  pickup_address: string;
  pickup_city: string;
  drop_address: string;
  drop_city: string;
  goods_type: string;
  weight_tons: number;
  loading_date: string;
  notes: string;
  status: 'pending' | 'accepted' | 'rejected' | 'in_transit' | 'completed' | 'cancelled';
  customer_offer_price: number;
  owner_counter_price: number;
  final_price: number;
  suggested_price_min: number;
  suggested_price_max: number;
  distance_km: number;
  created_at: string;
  trucks?: Truck;
  customer?: Profile;
  owner?: Profile;
};

export type Message = {
  id: string;
  booking_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'offer' | 'counter_offer' | 'system';
  offer_amount: number;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
};

export type Review = {
  id: string;
  booking_id: string;
  reviewer_id: string;
  truck_id: string;
  owner_id: string;
  rating_overall: number;
  rating_communication: number;
  rating_delivery: number;
  rating_driver_behaviour: number;
  rating_vehicle_condition: number;
  comment: string;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: 'booking' | 'message' | 'return_load' | 'verification' | 'system' | 'info';
  is_read: boolean;
  reference_id: string | null;
  created_at: string;
};

export type ReturnLoad = {
  id: string;
  truck_id: string;
  owner_id: string;
  current_city: string;
  available_for_city: string;
  available_date: string;
  capacity_tons: number;
  vehicle_type: string;
  price_suggestion: number;
  is_active: boolean;
  expires_at: string;
  created_at: string;
  trucks?: Truck;
  profiles?: Profile;
};

export const VEHICLE_TYPES = [
  'Tata Ace',
  'Pickup Van',
  'Mini Truck',
  'Lorry',
  'Container Truck',
  'Trailer',
  'Refrigerated Truck',
  '6 Wheeler',
  '10 Wheeler',
  '14 Wheeler',
  '18 Wheeler',
];

export const INDIAN_CITIES = [
  'Hyderabad', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur',
  'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Vijayawada', 'Patna',
  'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Ranchi',
  'Faridabad', 'Meerut', 'Rajkot', 'Surat', 'Coimbatore', 'Kochi',
];

export const GOODS_TYPES = [
  'Electronics', 'Furniture', 'Industrial Equipment', 'Construction Material',
  'Agricultural Produce', 'Textiles', 'Food & Beverages', 'Chemicals',
  'Automobiles', 'Machinery', 'Household Goods', 'Fragile Items', 'Others',
];

export function calculateSuggestedPrice(distanceKm: number, vehicleType: string): { min: number; max: number } {
  const baseRates: Record<string, number> = {
    'Tata Ace': 12, 'Pickup Van': 10, 'Mini Truck': 14, 'Lorry': 18,
    'Container Truck': 25, 'Trailer': 30, 'Refrigerated Truck': 35,
    '6 Wheeler': 20, '10 Wheeler': 22, '14 Wheeler': 26, '18 Wheeler': 32,
  };
  const rate = baseRates[vehicleType] || 18;
  const base = distanceKm * rate;
  return { min: Math.round(base * 0.85), max: Math.round(base * 1.15) };
}
