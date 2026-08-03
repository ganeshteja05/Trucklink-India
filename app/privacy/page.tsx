export default function PrivacyPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container-mw container-px py-16 max-w-3xl">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-2 text-muted-foreground">Last updated: {new Date().getFullYear()}</p>
        <div className="mt-8 space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-foreground">1. Information We Collect</h2>
            <p className="mt-2">We collect information you provide directly: name, email, phone number, city, and for truck owners, company details and vehicle information. We also collect usage data such as bookings and messages.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-foreground">2. How We Use Your Information</h2>
            <p className="mt-2">To connect customers with truck owners, facilitate bookings, provide live tracking, send notifications, verify identities, and improve our platform.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-foreground">3. Data Sharing</h2>
            <p className="mt-2">We do not sell your data. Booking details are shared between the customer and truck owner involved. Verification documents are reviewed by our admin team only.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-foreground">4. Data Security</h2>
            <p className="mt-2">All data is encrypted in transit and at rest. Access is controlled via row-level security policies. Passwords are hashed by our authentication provider.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-foreground">5. Your Rights</h2>
            <p className="mt-2">You can access, update, or delete your personal data at any time from your profile settings. Contact us at support@trucklink.in for data requests.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
