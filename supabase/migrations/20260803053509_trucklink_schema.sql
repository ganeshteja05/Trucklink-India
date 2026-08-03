
/*
# TruckLink India - Complete Database Schema

## Overview
This migration creates the full schema for TruckLink India, a free truck marketplace 
connecting customers directly with truck owners.

## New Tables

### 1. profiles
- Extended user profile linked to auth.users
- Stores role (customer, owner, admin), name, phone, avatar
- Each authenticated user gets exactly one profile

### 2. trucks
- Truck listings created by owners
- Stores vehicle type, capacity, location, availability, verification status
- Linked to owner's profile

### 3. bookings
- Booking requests from customers to truck owners
- Tracks pickup/drop locations, goods info, status (pending/accepted/rejected/completed)
- Linked to customer profile and truck

### 4. messages
- Chat messages between customers and truck owners
- Linked to a booking context

### 5. reviews
- Post-trip ratings and reviews
- Categories: communication, delivery, driver_behaviour, vehicle_condition

### 6. notifications
- In-app notifications for booking events, messages, return loads

### 7. verification_documents
- Documents uploaded by truck owners (RC, insurance, license)
- Admin approval workflow

### 8. return_loads
- Available return load postings by truck owners
- Visible to customers in destination city

### 9. saved_trucks
- Customer wishlist/saved trucks

## Security
- RLS enabled on all tables
- Policies scoped to authenticated users
- Profiles are readable by all authenticated users (for truck owner info display)
- Trucks with approved status visible to all authenticated + anon users (for browsing)
- Messages/bookings scoped to involved parties
*/

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'owner', 'admin')),
  full_name text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  avatar_url text DEFAULT '',
  city text DEFAULT '',
  is_verified boolean DEFAULT false,
  is_suspended boolean DEFAULT false,
  gst_number text DEFAULT '',
  company_name text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete" ON profiles;
CREATE POLICY "profiles_delete" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- Also allow anon to read profiles (for public truck listings)
DROP POLICY IF EXISTS "profiles_select_anon" ON profiles;
CREATE POLICY "profiles_select_anon" ON profiles FOR SELECT
  TO anon USING (true);

-- TRUCKS TABLE
CREATE TABLE IF NOT EXISTS trucks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_type text NOT NULL,
  capacity_tons numeric(8,2) NOT NULL DEFAULT 1,
  registration_number text NOT NULL DEFAULT '',
  model text DEFAULT '',
  year integer DEFAULT 2020,
  description text DEFAULT '',
  current_city text NOT NULL DEFAULT '',
  current_lat numeric(10,7) DEFAULT 17.3850,
  current_lng numeric(10,7) DEFAULT 78.4867,
  destination_city text DEFAULT '',
  is_available boolean DEFAULT true,
  is_verified boolean DEFAULT false,
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  price_per_km numeric(10,2) DEFAULT 0,
  images text[] DEFAULT '{}',
  rating_avg numeric(3,2) DEFAULT 0,
  rating_count integer DEFAULT 0,
  is_return_load_available boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS trucks_owner_id_idx ON trucks(owner_id);
CREATE INDEX IF NOT EXISTS trucks_city_idx ON trucks(current_city);
CREATE INDEX IF NOT EXISTS trucks_vehicle_type_idx ON trucks(vehicle_type);
CREATE INDEX IF NOT EXISTS trucks_available_idx ON trucks(is_available);

ALTER TABLE trucks ENABLE ROW LEVEL SECURITY;

-- All can read approved trucks
DROP POLICY IF EXISTS "trucks_select_public" ON trucks;
CREATE POLICY "trucks_select_public" ON trucks FOR SELECT
  TO anon, authenticated USING (verification_status = 'approved' OR owner_id = auth.uid());

DROP POLICY IF EXISTS "trucks_insert_owner" ON trucks;
CREATE POLICY "trucks_insert_owner" ON trucks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "trucks_update_owner" ON trucks;
CREATE POLICY "trucks_update_owner" ON trucks FOR UPDATE
  TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "trucks_delete_owner" ON trucks;
CREATE POLICY "trucks_delete_owner" ON trucks FOR DELETE
  TO authenticated USING (auth.uid() = owner_id);

-- BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  truck_id uuid NOT NULL REFERENCES trucks(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pickup_address text NOT NULL DEFAULT '',
  pickup_city text NOT NULL DEFAULT '',
  drop_address text NOT NULL DEFAULT '',
  drop_city text NOT NULL DEFAULT '',
  goods_type text DEFAULT '',
  weight_tons numeric(8,2) DEFAULT 1,
  loading_date date,
  notes text DEFAULT '',
  status text DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','in_transit','completed','cancelled')),
  customer_offer_price numeric(12,2) DEFAULT 0,
  owner_counter_price numeric(12,2) DEFAULT 0,
  final_price numeric(12,2) DEFAULT 0,
  suggested_price_min numeric(12,2) DEFAULT 0,
  suggested_price_max numeric(12,2) DEFAULT 0,
  distance_km numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bookings_customer_id_idx ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS bookings_truck_id_idx ON bookings(truck_id);
CREATE INDEX IF NOT EXISTS bookings_owner_id_idx ON bookings(owner_id);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings(status);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bookings_select" ON bookings;
CREATE POLICY "bookings_select" ON bookings FOR SELECT
  TO authenticated USING (auth.uid() = customer_id OR auth.uid() = owner_id);

DROP POLICY IF EXISTS "bookings_insert" ON bookings;
CREATE POLICY "bookings_insert" ON bookings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "bookings_update" ON bookings;
CREATE POLICY "bookings_update" ON bookings FOR UPDATE
  TO authenticated USING (auth.uid() = customer_id OR auth.uid() = owner_id)
  WITH CHECK (auth.uid() = customer_id OR auth.uid() = owner_id);

DROP POLICY IF EXISTS "bookings_delete" ON bookings;
CREATE POLICY "bookings_delete" ON bookings FOR DELETE
  TO authenticated USING (auth.uid() = customer_id);

-- MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'offer', 'counter_offer', 'system')),
  offer_amount numeric(12,2) DEFAULT 0,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_booking_id_idx ON messages(booking_id);
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON messages(sender_id);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_select" ON messages;
CREATE POLICY "messages_select" ON messages FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = messages.booking_id
      AND (b.customer_id = auth.uid() OR b.owner_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "messages_insert" ON messages;
CREATE POLICY "messages_insert" ON messages FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = booking_id
      AND (b.customer_id = auth.uid() OR b.owner_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "messages_update" ON messages;
CREATE POLICY "messages_update" ON messages FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = messages.booking_id
      AND (b.customer_id = auth.uid() OR b.owner_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "messages_delete" ON messages;
CREATE POLICY "messages_delete" ON messages FOR DELETE
  TO authenticated USING (auth.uid() = sender_id);

-- REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  truck_id uuid NOT NULL REFERENCES trucks(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating_overall integer NOT NULL CHECK (rating_overall BETWEEN 1 AND 5),
  rating_communication integer DEFAULT 5 CHECK (rating_communication BETWEEN 1 AND 5),
  rating_delivery integer DEFAULT 5 CHECK (rating_delivery BETWEEN 1 AND 5),
  rating_driver_behaviour integer DEFAULT 5 CHECK (rating_driver_behaviour BETWEEN 1 AND 5),
  rating_vehicle_condition integer DEFAULT 5 CHECK (rating_vehicle_condition BETWEEN 1 AND 5),
  comment text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reviews_truck_id_idx ON reviews(truck_id);
CREATE INDEX IF NOT EXISTS reviews_owner_id_idx ON reviews(owner_id);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_select" ON reviews;
CREATE POLICY "reviews_select" ON reviews FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "reviews_insert" ON reviews;
CREATE POLICY "reviews_insert" ON reviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = reviewer_id);

DROP POLICY IF EXISTS "reviews_update" ON reviews;
CREATE POLICY "reviews_update" ON reviews FOR UPDATE
  TO authenticated USING (auth.uid() = reviewer_id);

DROP POLICY IF EXISTS "reviews_delete" ON reviews;
CREATE POLICY "reviews_delete" ON reviews FOR DELETE
  TO authenticated USING (auth.uid() = reviewer_id);

-- NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('booking', 'message', 'return_load', 'verification', 'system', 'info')),
  is_read boolean DEFAULT false,
  reference_id uuid DEFAULT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON notifications(is_read);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select" ON notifications;
CREATE POLICY "notifications_select" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_insert" ON notifications;
CREATE POLICY "notifications_insert" ON notifications FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "notifications_update" ON notifications;
CREATE POLICY "notifications_update" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_delete" ON notifications;
CREATE POLICY "notifications_delete" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- VERIFICATION DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS verification_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  truck_id uuid REFERENCES trucks(id) ON DELETE CASCADE,
  doc_type text NOT NULL CHECK (doc_type IN ('rc_book', 'insurance', 'driving_license', 'fitness_certificate', 'permit', 'pollution')),
  doc_url text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "verdocs_select" ON verification_documents;
CREATE POLICY "verdocs_select" ON verification_documents FOR SELECT
  TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "verdocs_insert" ON verification_documents;
CREATE POLICY "verdocs_insert" ON verification_documents FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "verdocs_update" ON verification_documents;
CREATE POLICY "verdocs_update" ON verification_documents FOR UPDATE
  TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "verdocs_delete" ON verification_documents;
CREATE POLICY "verdocs_delete" ON verification_documents FOR DELETE
  TO authenticated USING (auth.uid() = owner_id);

-- RETURN LOADS TABLE
CREATE TABLE IF NOT EXISTS return_loads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_id uuid NOT NULL REFERENCES trucks(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  current_city text NOT NULL,
  available_for_city text NOT NULL,
  available_date date DEFAULT CURRENT_DATE,
  capacity_tons numeric(8,2) DEFAULT 1,
  vehicle_type text NOT NULL,
  price_suggestion numeric(12,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS return_loads_city_idx ON return_loads(current_city);
CREATE INDEX IF NOT EXISTS return_loads_active_idx ON return_loads(is_active);

ALTER TABLE return_loads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "return_loads_select" ON return_loads;
CREATE POLICY "return_loads_select" ON return_loads FOR SELECT
  TO anon, authenticated USING (is_active = true AND expires_at > now());

DROP POLICY IF EXISTS "return_loads_insert" ON return_loads;
CREATE POLICY "return_loads_insert" ON return_loads FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "return_loads_update" ON return_loads;
CREATE POLICY "return_loads_update" ON return_loads FOR UPDATE
  TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "return_loads_delete" ON return_loads;
CREATE POLICY "return_loads_delete" ON return_loads FOR DELETE
  TO authenticated USING (auth.uid() = owner_id);

-- SAVED TRUCKS TABLE
CREATE TABLE IF NOT EXISTS saved_trucks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  truck_id uuid NOT NULL REFERENCES trucks(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, truck_id)
);

ALTER TABLE saved_trucks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "saved_trucks_select" ON saved_trucks;
CREATE POLICY "saved_trucks_select" ON saved_trucks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_trucks_insert" ON saved_trucks;
CREATE POLICY "saved_trucks_insert" ON saved_trucks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_trucks_delete" ON saved_trucks;
CREATE POLICY "saved_trucks_delete" ON saved_trucks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- TRIGGER: Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- SEED: Demo admin trucks (approved, visible publicly)
-- These use a placeholder owner_id; in production real owners create these
-- We'll insert demo trucks after real users are created via the app
