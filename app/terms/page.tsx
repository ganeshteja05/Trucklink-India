export default function TermsPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container-mw container-px py-16 max-w-3xl">
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="mt-2 text-muted-foreground">Last updated: {new Date().getFullYear()}</p>
        <div className="mt-8 space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-foreground">1. Acceptance of Terms</h2>
            <p className="mt-2">By using TruckLink India, you agree to these terms. If you do not agree, please do not use the platform.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-foreground">2. Commission-Free Platform</h2>
            <p className="mt-2">TruckLink is a free marketplace. We charge no commission on bookings. Prices are negotiated directly between customers and truck owners.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-foreground">3. User Responsibilities</h2>
            <p className="mt-2">Customers must provide accurate shipment details. Truck owners must maintain valid documents (RC, insurance, license) and ensure their trucks are roadworthy.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-foreground">4. Verification</h2>
            <p className="mt-2">Truck owners must submit documents for verification. Unverified trucks are not visible to customers. We reserve the right to reject listings that do not meet our standards.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-foreground">5. Disputes</h2>
            <p className="mt-2">TruckLink facilitates connections but is not a party to the transport agreement. Disputes should be resolved between the parties. We may mediate upon request.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-foreground">6. Account Suspension</h2>
            <p className="mt-2">We reserve the right to suspend accounts that violate these terms, engage in fraud, or compromise platform safety.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
