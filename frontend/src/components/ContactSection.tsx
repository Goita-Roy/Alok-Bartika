import React, { useState, useRef } from 'react';
import LiveChatModal from './chat/LiveChatModal';
import { 
  Mail, 
  MapPin, 
  Send,
  MessageCircle,
} from 'lucide-react';

const contactInfo = {
  email: 'royjenious@gmail.com',
  whatsapp: '01831890053',
  address: 'গাজীপুর, কালিয়াকৈর, ইউনিভার্সিটি অফ ফ্রন্টিয়ার টেকনোলজি, বাংলাদেশ',
  mapLink: 'https://www.google.com/maps/search/?api=1&query=University+of+Frontier+Technology+Kaliakoir+Gazipur+Bangladesh',
}

const socialLinks = [
  {
    label: 'ফেসবুক',
    href: 'https://www.facebook.com/share/14i7svec4oY/-fb',
    color: '#1877F2',
    path: 'M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z',
  },
  {
    label: 'ইনস্টাগ্রাম',
    // TODO: replace with the real Instagram profile URL
    href: '#',
    color: '#E4405F',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  },
  {
    label: 'লিংকডইন',
    href: 'https://www.linkedin.com/in/goita-roy-1b8b48416?utm_source=share_via&utm_content=profile&utm_medium=member_android',
    color: '#0A66C2',
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z',
  },
  {
    label: 'হোয়াটসঅ্যাপ',
    // TODO: replace with the real WhatsApp link (e.g. https://wa.me/88XXXXXXXXXX)
    href: '#',
    color: '#25D366',
    path: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z',
  },
]

const ContactSection: React.FC = () => {
  const [showMap, setShowMap] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [supportUnread, setSupportUnread] = useState(0);
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
                    <p className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>হোয়াটসঅ্যাপ</p>
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
                <div className="flex flex-wrap items-center gap-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={social.label}
                      aria-label={social.label}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-xl"
                      style={{ backgroundColor: social.color }}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d={social.path} />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#1D9E75] p-8 rounded-[2rem] text-white shadow-xl shadow-[#1D9E75]/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <h4 className="text-xl font-bold mb-3 relative z-10">সরাসরি সহায়তা চান?</h4>
              <p className="text-white/80 mb-6 relative z-10 leading-relaxed">আমাদের টিম আপনাকে তাৎক্ষণিক সহায়তার জন্য প্রস্তুত রয়েছে।</p>
              <button
                id="live-chat-open-btn"
                onClick={() => setIsChatOpen(true)}
                className="bg-white text-[#1D9E75] px-6 py-3 rounded-xl font-bold hover:bg-[#F7FBF9] transition-all relative z-10 cursor-pointer">
                লাইভ চ্যাট শুরু করুন
              </button>
              {supportUnread > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-black text-white rounded-full"
                  style={{
                    backgroundColor: 'var(--color-error, #FF6B4A)',
                    zIndex: 11,
                  }}
                >
                  {supportUnread > 99 ? '99+' : supportUnread}
                </span>
              )}
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
                    placeholder="ইমেইল@উদাহরণ.কম"
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
                title="ইউনিভার্সিটি অফ ফ্রন্টিয়ার টেকনোলজির অবস্থান"
              />
            </div>
          )}
        </div>
      </section>

      <footer className="py-12 text-center text-sm" style={{ color: 'var(--color-text-muted)', borderTop: '1px solid rgba(255,201,60,0.2)' }}>
        <p>© ২০২৬ আলোকবর্তিকা। আমরা আপনার অপেক্ষায় আছি।</p>
      </footer>

      {/* Live Chat Modal — portal-like overlay rendered at the end of the tree */}
      <LiveChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onUnreadCount={setSupportUnread}
      />
    </div>
  );
};

export default ContactSection;
