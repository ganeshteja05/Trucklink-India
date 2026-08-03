export default function AboutPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="hero-gradient text-white">
        <div className="container-mw container-px py-16">
          <h1 className="text-4xl font-bold">About TruckLink India</h1>
          <p className="mt-4 max-w-2xl text-sky-100/90 text-lg">
            We're on a mission to make truck booking transparent, affordable, and accessible for every Indian business.
          </p>
        </div>
      </div>
      <div className="container-mw container-px py-16 max-w-3xl">
        <div className="prose prose-slate max-w-none">
          <h2 className="text-xl font-bold">Our Story</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            TruckLink India was born from a simple observation: truck booking in India is broken. Customers pay exorbitant commissions to brokers, truck owners struggle to find loads, and return trips run empty. We knew technology could fix this.
          </p>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            So we built India's first truly free truck marketplace — a platform where customers and truck owners connect directly, negotiate openly, and track shipments in real-time. No middlemen, no hidden fees, no opacity.
          </p>

          <h2 className="mt-8 text-xl font-bold">Our Mission</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            To digitize India's trucking industry by giving every truck owner a platform to find customers and every business a transparent way to book transport. We believe in fair pricing, verified trust, and the power of direct connections.
          </p>

          <h2 className="mt-8 text-xl font-bold">Our Values</h2>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li><strong className="text-foreground">Transparency:</strong> Every price, every review, every detail is visible.</li>
            <li><strong className="text-foreground">Trust:</strong> KYC verification ensures you always deal with real, verified owners.</li>
            <li><strong className="text-foreground">Fairness:</strong> Zero commission means owners keep what they earn and customers pay what's fair.</li>
            <li><strong className="text-foreground">Innovation:</strong> Return load marketplace, live tracking, and direct chat — solving real logistics problems.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
