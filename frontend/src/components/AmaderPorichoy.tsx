import React, { useEffect } from 'react';
import {
  Target,
  GraduationCap
} from 'lucide-react';

const AmaderPorichoy: React.FC = () => {
  useEffect(() => {
    const el = document.getElementById('about-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, []);
  return (
    <div style={{ backgroundColor: 'var(--color-bg)' }} className="font-bengali overflow-hidden">

      {/* 1. Hero Area */}
      <section className="relative min-h-[700px] flex items-center justify-center text-center px-4 py-20"
        style={{ backgroundColor: 'var(--color-home-hero-bg)' }}>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(var(--color-home-accent-dark) 1.5px, transparent 1.5px)',
            backgroundSize: '40px 40px'
          }}>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="inline-block px-5 py-2 mb-10 text-sm font-bold rounded-full"
            style={{ backgroundColor: 'var(--color-home-warm-badge-bg)', color: 'var(--color-home-warm-badge-text)', border: '1px solid var(--color-home-warm-badge-border)' }}>
            আমাদের সম্পর্কে
          </div>

          <h1 className="text-5xl md:text-8xl font-black mb-10 leading-[1.1] tracking-tight"
            style={{ color: 'var(--color-home-accent-dark)' }}>
            বাংলাদেশের শিশুদের জন্য <br />
            <span style={{ color: 'var(--color-accent)' }}>প্রোগ্রামিং শেখার আলো</span>
          </h1>

          <p className="text-xl md:text-2xl mb-14 max-w-3xl mx-auto leading-relaxed"
            style={{ color: 'var(--color-home-text-body)' }}>
            আলোকবর্তিকা — ৬ষ্ঠ থেকে ৮ ম শ্রেণীর শিক্ষার্থীদের জন্য বাংলা ভাষায় ইন্টারঅ্যাক্টিভ কোডিং প্ল্যাটফর্ম।
          </p>

          <button
            className="px-12 py-5 rounded-2xl font-black text-xl flex items-center gap-3 mx-auto transition-all duration-200 hover:scale-105"
            style={{ color: 'var(--color-accent)', border: '1.5px solid var(--color-accent)', backgroundColor: 'var(--color-white)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-home-surface)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-white)' }}
            onClick={() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' })}>
            আরও জানুন ↓
          </button>
        </div>
      </section>

      {/* 2. About Content — আমরা কারা? */}
      <section id="about-section" className="py-24 px-4 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <span className="inline-block px-4 py-1 mb-4 text-xs font-bold rounded-lg"
              style={{ backgroundColor: 'var(--color-home-warm-badge-bg)', color: 'var(--color-home-warm-badge-text)' }}>
              পরিচয়
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-6 relative inline-block"
              style={{ color: 'var(--color-home-accent-dark)' }}>
              আমরা কারা?
              <div className="absolute -bottom-2 left-0 w-12 h-1.5 rounded-full"
                style={{ backgroundColor: 'var(--color-accent)' }}></div>
            </h2>

            <div className="space-y-6 text-lg mt-10" style={{ color: 'var(--color-home-text-body)' }}>
              <p>
                Alokbartika (আলোকবর্তিকা) হলো একটি বাংলা-ভিত্তিক ইন্টারঅ্যাকটিভ কোডিং প্ল্যাটফর্ম, যা বিশেষভাবে বাংলাদেশের মাধ্যমিক বিদ্যালয়ের শিক্ষার্থীদের জন্য ডিজাইন করা হয়েছে।
              </p>
              <p>
                আমাদের লক্ষ্য হলো প্রোগ্রামিং শিক্ষাকে সহজ, মজাদার ও সকলের জন্য সহজলভ্য করে তোলা। ভাষার বাধা ও জটিল টুলসের ঝামেলা দূর করে আমরা একটি Zero-Setup, Browser-based IDE তৈরি করেছি।
              </p>
            </div>

            <div className="mt-12 p-6 rounded-2xl border-l-4"
              style={{ backgroundColor: 'var(--color-home-surface)', borderLeftColor: 'var(--color-home-gold)', boxShadow: '0 2px 12px rgba(14,124,102,0.06)' }}>
              <p className="italic font-medium" style={{ color: 'var(--color-home-accent-dark)' }}>
                “প্রযুক্তি শেখার পথে ভাষা যেন বাধা না হয় — এই স্বপ্ন নিয়েই আলোকবর্তিকার জন্ম।”
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {[
              { val: '6–8', label: 'Target grade levels' },
              { val: '3', label: 'Curriculum stages (Logic → Visual → Python)' },
              { val: 'AI', label: 'Real-time Bengali hints & guidance' },
              { val: 'SDG 4', label: 'UN Quality Education goal aligned' },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-8 rounded-3xl text-center flex flex-col justify-center items-center h-48 transition-all group"
                  style={{
                    backgroundColor: 'var(--color-home-surface)',
                    borderRadius: '20px',
                  boxShadow: '0 2px 12px rgba(14,124,102,0.06), 0 1px 4px rgba(0,0,0,0.03)'
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(14,124,102,0.12)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(14,124,102,0.06), 0 1px 4px rgba(0,0,0,0.03)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
              >
                <h3 className="text-4xl font-black mb-2 group-hover:scale-110 transition-transform"
                  style={{ color: 'var(--color-accent)' }}>{stat.val}</h3>
                <p className="text-sm leading-tight" style={{ color: 'var(--color-home-accent-dark)' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Mission — আমাদের মিশন (modern educational card) */}
      <section className="px-4 max-w-5xl mx-auto pb-24">
        <div className="rounded-[2.5rem] p-12 md:p-16 text-center relative overflow-hidden"
          style={{ backgroundColor: 'var(--color-home-card-bg)', border: '1.5px solid var(--color-home-card-border)', boxShadow: '0 8px 32px rgba(14,124,102,0.08)' }}>
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(244,197,58,0.10) 0%, transparent 70%)', transform: 'translate(30%,-30%)' }} />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8"
              style={{ backgroundColor: 'var(--color-home-warm-badge-bg)' }}>
              <Target className="w-8 h-8" style={{ color: 'var(--color-home-warm-badge-text)' }} />
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-6" style={{ color: 'var(--color-home-accent-dark)' }}>
              আমাদের <span style={{ color: 'var(--color-accent)' }}>মিশন</span>
            </h2>
            <p className="text-lg md:text-xl leading-relaxed max-w-4xl mx-auto" style={{ color: 'var(--color-home-text-body)' }}>
              প্রযুক্তি শিক্ষার মাধ্যমে বাংলাদেশের প্রতিটি শিক্ষার্থীকে ডিজিটাল ভবিষ্যতের জন্য প্রস্তুত করা — ভাষার বাধা দূর করে, সহজ প্রযুক্তি ও AI-এর সাহায্যে। SDG 4 (Quality Education) অর্জনে আমাদের অবদান।
            </p>
            <div className="flex flex-wrap justify-center gap-6 mt-10">
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold"
                style={{ backgroundColor: 'var(--color-home-cta-soft)', color: 'var(--color-accent)' }}>
                <GraduationCap size={18} /> SDG 4 — Quality Education
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AmaderPorichoy;
