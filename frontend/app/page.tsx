import Link from "next/link";

const features = [
  { icon: "biotech",          title: "AI Scalp Analysis",    desc: "Detects 10 conditions including dandruff, psoriasis, alopecia and more." },
  { icon: "monitoring",       title: "Track Over Time",      desc: "Every scan is saved. Watch your scalp health improve with a full history." },
  { icon: "tips_and_updates", title: "Plain English Results", desc: "No medical jargon — we explain exactly what you have and what to do." },
  { icon: "lock",             title: "Secure & Private",     desc: "JWT-authenticated accounts. Your health data stays yours." },
];

const steps = [
  { num: "01", icon: "add_photo_alternate", title: "Upload a Photo",    desc: "Take a close-up photo of your scalp or hair and upload it." },
  { num: "02", icon: "biotech",             title: "AI Analyses It",    desc: "Our model scans for 10 different hair and scalp conditions." },
  { num: "03", icon: "query_stats",         title: "Get Your Report",   desc: "See your condition, confidence score, and care recommendations." },
];

const conditions = [
  "Alopecia Areata", "Seborrheic Dermatitis", "Psoriasis", "Folliculitis",
  "Head Lice", "Tinea Capitis", "Lichen Planus", "Telogen Effluvium",
  "Contact Dermatitis", "Male Pattern Baldness",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface font-body text-on-surface">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-surface-container-highest px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>biotech</span>
          <span className="text-xl font-headline font-bold text-teal-800 tracking-tight">HairVision</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">Sign In</Link>
          <Link href="/register" className="bg-primary text-on-primary text-sm font-bold px-5 py-2 rounded-xl hover:opacity-90 transition-all">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-28 gap-8 bg-linear-to-b from-surface to-surface-container-low">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          AI-Powered · 10 Conditions · Instant Results
        </div>
        <h1 className="text-5xl md:text-6xl font-headline font-extrabold text-on-surface leading-tight max-w-3xl">
          Know What&apos;s Wrong<br />
          <span className="text-primary">With Your Scalp.</span>
        </h1>
        <p className="text-on-surface-variant max-w-lg text-lg leading-relaxed">
          Upload a photo. Get an instant AI diagnosis in plain English — no doctor visit, no medical jargon.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link href="/register"
            className="bg-linear-to-br from-primary to-primary-container text-on-primary font-headline font-bold px-8 py-4 rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_photo_alternate</span>
            Analyse My Scalp
          </Link>
          <Link href="/login"
            className="bg-surface-container-lowest text-on-surface font-bold px-8 py-4 rounded-xl hover:bg-surface-container transition-all border border-surface-container-highest">
            Sign In
          </Link>
        </div>
        {/* Trust badge */}
        <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          99.6% accuracy on clinical test dataset · Free to use
        </p>
      </section>

      {/* How it works */}
      <section className="px-8 py-20 bg-surface-container-lowest">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-3">How It Works</p>
          <h2 className="text-3xl font-headline font-bold text-center text-on-surface mb-12">Three steps to your diagnosis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.num} className="flex flex-col items-center text-center gap-4 relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-surface-container-highest" />
                )}
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center relative z-10">
                  <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-primary mb-1">{s.num}</p>
                  <h3 className="font-headline font-bold text-on-surface mb-2">{s.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conditions we detect */}
      <section className="px-8 py-20 bg-surface-container-low">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-3">What We Detect</p>
          <h2 className="text-3xl font-headline font-bold text-on-surface mb-10">10 hair & scalp conditions</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {conditions.map((c) => (
              <span key={c} className="bg-surface-container-lowest border border-surface-container-highest text-on-surface text-sm font-medium px-4 py-2 rounded-full shadow-sm">
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-20 bg-surface-container-lowest">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-3">Why HairVision</p>
          <h2 className="text-3xl font-headline font-bold text-center text-on-surface mb-12">Built for real people, not doctors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-surface-container rounded-2xl p-6 flex flex-col gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
                </div>
                <h3 className="font-headline font-bold text-on-surface">{f.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-24 flex flex-col items-center gap-6 text-center bg-primary">
        <h2 className="text-3xl font-headline font-bold text-on-primary">Ready to check your scalp?</h2>
        <p className="text-on-primary/80 max-w-md">It takes less than a minute. No appointment needed.</p>
        <Link href="/register"
          className="bg-on-primary text-primary font-headline font-bold px-10 py-4 rounded-xl shadow-lg hover:opacity-90 transition-all">
          Start Free Analysis
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-container-highest px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-on-surface-variant">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>biotech</span>
          <span className="font-bold text-on-surface">HairVision</span>
          <span>· © 2026</span>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-primary transition-colors">Support</a>
        </div>
      </footer>
    </div>
  );
}
