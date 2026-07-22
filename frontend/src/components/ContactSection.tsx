import React, { useState, useRef } from 'react';
import { 
  Mail, 
  MapPin, 
  Send,
  MessageCircle,
} from 'lucide-react';

const contactInfo = {
  email: 'royjenious@gmail.com',
  whatsapp: '01831890053',
  address: 'Gazipur, Kaliakoir, University of Frontier Technology, Bangladesh',
  mapLink: 'https://www.google.com/maps/search/?api=1&query=University+of+Frontier+Technology+Kaliakoir+Gazipur+Bangladesh',
}

const ContactSection: React.FC = () => {
  const [showMap, setShowMap] = useState(false);
  const locationRef = useRef<HTMLElement>(null);

  const handleShowMap = () => {
    setShowMap(true);
    setTimeout(() => {
      locationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="font-bengali overflow-hidden" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
      
      {/* 1. Hero Area */}
      <section className="relative pt-24 pb-32 flex items-center justify-center text-center px-4"
        style={{ backgroundColor: '#04342C' }}>
        <div className="absolute inset-0 opacity-[0.05]" 
          style={{ 
            backgroundImage: 'radial-gradient(#5DCAA5 1.5px, transparent 1.5px)', 
            backgroundSize: '40px 40px' 
          }}>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="inline-block px-5 py-2 mb-8 text-sm font-bold text-[#5DCAA5] bg-white/5 backdrop-blur-md rounded-full border border-white/10">
            যোগাযোগ
          </span>
          
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            আমাদের সাথে <span className="text-[#5DCAA5]">কথা বলুন</span>
          </h1>

          <p className="text-lg md:text-xl text-white/60 mb-0 max-w-2xl mx-auto leading-relaxed">
            আপনার যেকোনো প্রশ্ন, পরামর্শ বা মতামতের জন্য আমাদের সাথে যোগাযোগ করুন। আমরা আপনার বার্তার অপেক্ষায় আছি।
          </p>
        </div>
      </section>

      {/* 2. Contact Content */}
      <section className="py-24 px-4 max-w-7xl mx-auto -mt-20 relative z-20">
        <div className="grid lg:grid-cols-5 gap-12 items-start">
          
          {/* Left Side: Info Cards */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-8 rounded-[2rem] border shadow-xl"
              style={{ backgroundColor: 'var(--color-white)', borderColor: 'rgba(255,201,60,0.2)', boxShadow: '0 4px 24px rgba(15,23,42,0.08)' }}>
              <h3 className="text-2xl font-bold mb-8 flex items-center gap-3" style={{ color: 'var(--color-text)' }}>
                <div className="w-1.5 h-6 bg-[#1D9E75] rounded-full"></div>
                যোগাযোগের তথ্য
              </h3>
              
              <div className="space-y-8">
                {/* Email — try Gmail compose, fallback mailto */}
                <div className="flex gap-5 group">
                  <div className="w-12 h-12 bg-[#9FE1CB]/20 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#1D9E75] group-hover:text-white transition-all">
                    <Mail className="w-5 h-5 text-[#1D9E75] group-hover:text-white transition-all" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>ইমেইল করুন</p>
                    <a
                      href={`https://mail.google.com/mail/?view=cm&fs=1&to=${contactInfo.email}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-bold hover:text-[#1D9E75] hover:underline transition-all cursor-pointer"
                      style={{ color: 'var(--color-text)' }}
                      onClick={e => {
                        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${contactInfo.email}`
                        const w = window.open(gmailUrl, '_blank')
                        if (!w || w.closed || typeof w.closed === 'undefined') {
                          e.preventDefault()
                          window.location.href = `mailto:${contactInfo.email}`
                        }
                      }}
                    >
                      {contactInfo.email}
                    </a>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex gap-5 group">
                  <div className="w-12 h-12 bg-[#9FE1CB]/20 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#1D9E75] group-hover:text-white transition-all">
                    <MessageCircle className="w-5 h-5 text-[#1D9E75] group-hover:text-white transition-all" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>WhatsApp</p>
                    <a
                      href={`https://wa.me/${contactInfo.whatsapp.startsWith('88') ? '' : '88'}${contactInfo.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-bold hover:text-[#1D9E75] hover:underline transition-all"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {contactInfo.whatsapp}
                    </a>
                  </div>
                </div>

                {/* Address */}
                <div className="flex gap-5 group">
                  <div className="w-12 h-12 bg-[#9FE1CB]/20 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#1D9E75] group-hover:text-white transition-all">
                    <MapPin className="w-5 h-5 text-[#1D9E75] group-hover:text-white transition-all" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>ঠিকানা</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <a
                        href={contactInfo.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg font-bold hover:text-[#1D9E75] hover:underline transition-all cursor-pointer"
                        style={{ color: 'var(--color-text)' }}
                      >
                        {contactInfo.address}
                      </a>
                      <button
                        onClick={handleShowMap}
                        className="text-xs font-bold text-white bg-[#1D9E75] px-3 py-1.5 rounded-lg hover:bg-[#04342C] transition-all whitespace-nowrap inline-flex items-center gap-1 cursor-pointer"
                      >
                        গুগল ম্যাপে দেখুন
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-10" style={{ borderTop: '1px solid rgba(255,201,60,0.2)' }}>
                <p className="text-sm font-bold uppercase tracking-wider mb-6" style={{ color: 'var(--color-text-muted)' }}>আমাদের সোশ্যাল মিডিয়া</p>
                <div className="flex gap-4">
                  <a
                    href="YOUR_FACEBOOK_PROFILE_OR_PAGE_LINK"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-[#04342C] text-[#5DCAA5] rounded-2xl flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all shadow-lg"
                    title="Facebook"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-[#1D9E75] p-8 rounded-[2rem] text-white shadow-xl shadow-[#1D9E75]/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <h4 className="text-xl font-bold mb-3 relative z-10">সরাসরি সহায়তা চান?</h4>
              <p className="text-white/80 mb-6 relative z-10 leading-relaxed">আমাদের টিম আপনাকে তাৎক্ষণিক সহায়তার জন্য প্রস্তুত রয়েছে।</p>
              <button className="bg-white text-[#1D9E75] px-6 py-3 rounded-xl font-bold hover:bg-[#F7FBF9] transition-all relative z-10">
                লাইভ চ্যাট শুরু করুন
              </button>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="lg:col-span-3 p-10 md:p-16 rounded-[3rem] border shadow-2xl"
            style={{ backgroundColor: 'var(--color-white)', borderColor: 'rgba(255,201,60,0.2)', boxShadow: '0 4px 24px rgba(15,23,42,0.08)' }}>
            <div className="mb-12">
              <h3 className="text-3xl font-black mb-4" style={{ color: 'var(--color-text)' }}>আমাদের মেসেজ পাঠান</h3>
              <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>আপনার তথ্যাদি দিয়ে ফর্মটি পূরণ করুন, আমরা দ্রুত যোগাযোগ করব।</p>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold ml-2" style={{ color: 'var(--color-text-muted)' }}>আপনার নাম</label>
                  <input 
                    type="text" 
                    placeholder="নাম লিখুন"
                    className="w-full px-6 py-4 border rounded-2xl focus:outline-none focus:border-[#1D9E75] focus:ring-4 focus:ring-[#1D9E75]/5 transition-all"
                    style={{ backgroundColor: 'var(--color-bg)', borderColor: 'rgba(255,201,60,0.3)', color: 'var(--color-text)' }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold ml-2" style={{ color: 'var(--color-text-muted)' }}>ইমেইল ঠিকানা</label>
                  <input 
                    type="email" 
                    placeholder="email@example.com"
                    className="w-full px-6 py-4 border rounded-2xl focus:outline-none focus:border-[#1D9E75] focus:ring-4 focus:ring-[#1D9E75]/5 transition-all"
                    style={{ backgroundColor: 'var(--color-bg)', borderColor: 'rgba(255,201,60,0.3)', color: 'var(--color-text)' }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold ml-2" style={{ color: 'var(--color-text-muted)' }}>বিষয়</label>
                <input 
                  type="text" 
                  placeholder="কি বিষয়ে জানতে চান?"
                  className="w-full px-6 py-4 border rounded-2xl focus:outline-none focus:border-[#1D9E75] focus:ring-4 focus:ring-[#1D9E75]/5 transition-all"
                  style={{ backgroundColor: 'var(--color-bg)', borderColor: 'rgba(255,201,60,0.3)', color: 'var(--color-text)' }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold ml-2" style={{ color: 'var(--color-text-muted)' }}>আপনার বার্তা</label>
                <textarea 
                  rows={5}
                  placeholder="এখানে বিস্তারিত লিখুন..."
                  className="w-full px-6 py-4 border rounded-2xl focus:outline-none focus:border-[#1D9E75] focus:ring-4 focus:ring-[#1D9E75]/5 transition-all resize-none"
                  style={{ backgroundColor: 'var(--color-bg)', borderColor: 'rgba(255,201,60,0.3)', color: 'var(--color-text)' }}
                ></textarea>
              </div>

              <button className="w-full py-5 bg-[#04342C] text-[#5DCAA5] rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:bg-[#0a4d42] transition-all shadow-xl shadow-[#04342C]/20 group">
                মেসেজ পাঠান
                <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 3. Map/Location Placeholder */}
      <section ref={locationRef} className="pb-24 px-4 max-w-7xl mx-auto">
        <div className="w-full rounded-[3rem] border flex flex-col items-center text-center p-8 overflow-hidden relative"
          style={{ backgroundColor: 'rgba(255,201,60,0.06)', borderColor: 'rgba(255,201,60,0.2)' }}>
          <div className="absolute inset-0 opacity-20 pointer-events-none" 
            style={{ 
              backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")'
            }}>
          </div>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-xl relative z-10"
            style={{ backgroundColor: 'var(--color-white)' }}>
            <MapPin className="w-10 h-10 text-[#1D9E75]" />
          </div>
          <h4 className="text-2xl font-bold mb-4 relative z-10" style={{ color: 'var(--color-text)' }}>আমাদের অবস্থান</h4>
          {showMap && (
            <div className="w-full mt-6 relative z-10 transition-all duration-500">
              <iframe
                src="https://www.google.com/maps?q=University%20of%20Frontier%20Technology%20Kaliakoir%20Gazipur%20Bangladesh&output=embed"
                width="100%"
                height="400"
                style={{ border: 0, borderRadius: '12px' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="University of Frontier Technology Location"
              />
            </div>
          )}
        </div>
      </section>

      <footer className="py-12 text-center text-sm" style={{ color: 'var(--color-text-muted)', borderTop: '1px solid rgba(255,201,60,0.2)' }}>
        <p>© ২০২৬ আলোকবর্তিকা। আমরা আপনার অপেক্ষায় আছি।</p>
      </footer>
    </div>
  );
};

export default ContactSection;
