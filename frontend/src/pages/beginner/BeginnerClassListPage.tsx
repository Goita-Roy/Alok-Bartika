import { Sparkles, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { lessonClasses } from "../../components/beginner-content/lessonConfig";

const C = {
  accent: "#1D9E75",
  cardBg: "#FFFFFF",
  text: "#1F2937",
  secondary: "#4B5563",
  muted: "#6B7280",
  border: "#C8E8DC",
};

const classDescriptions: Record<string, string> = {
  "class-01": "কম্পিউটার কী, এর ইতিহাস, প্রকারভেদ ও ব্যবহার সম্পর্কে বিস্তারিত জানুন।",
  "class-02": "CPU বা সেন্ট্রাল প্রসেসিং ইউনিট কীভাবে কম্পিউটারের মস্তিষ্ক হিসেবে কাজ করে তা শিখুন।",
  "class-03": "RAM বা মেমোরি কী, এটি কীভাবে অস্থায়ী ডেটা সংরক্ষণ করে তা বুঝুন।",
  "class-04": "স্টোরেজ ডিভাইসের মাধ্যমে স্থায়ীভাবে ডেটা সংরক্ষণের পদ্ধতি জানুন।",
  "class-05": "কীবোর্ড, মাউস, স্ক্যানার - ইনপুট ডিভাইসগুলোর কাজ ও ব্যবহার শিখুন।",
  "class-06": "মনিটর, প্রিন্টার, স্পিকার - আউটপুট ডিভাইসগুলোর কাজ ও ব্যবহার জানুন।",
  "class-07": "সফটওয়্যার কী, এর প্রকারভেদ ও গুরুত্ব সম্পর্কে বিস্তারিত জানুন।",
  "class-08": "অপারেটিং সিস্টেম কীভাবে কম্পিউটার পরিচালনা করে তা শিখুন।",
  "class-09": "ইন্টারনেটের ইতিহাস, কাজের পদ্ধতি ও তথ্যের সমুদ্র সম্পর্কে জানুন।",
  "class-10": "সাইবার নিরাপত্তার গুরুত্ব ও অনলাইনে সুরক্ষিত থাকার উপায় শিখুন।",
};

export default function BeginnerClassListPage() {
  return (
    <div className="space-y-8 pb-24">
      <header className="max-w-3xl">
        <div
          className="inline-flex items-center gap-2 font-black rounded-full px-5 py-2 mb-4 uppercase tracking-widest"
          style={{
            fontSize: "13px",
            backgroundColor: "rgba(29,158,117,0.10)",
            color: C.accent,
            border: `1px solid var(--color-border)`,
          }}
        >
          <Sparkles size={14} /> শিক্ষানবিশ
        </div>
        <h1
          className="font-black mb-3 tracking-tight leading-tight"
          style={{
            fontSize: "clamp(28px, 4vw, 40px)",
            color: C.text,
            fontFamily: "'Hind Siliguri', sans-serif",
          }}
        >
          কম্পিউটার পরিচিতি
        </h1>
        <p
          className="font-medium leading-relaxed"
          style={{
            fontSize: "17px",
            color: C.secondary,
            fontFamily: "'Hind Siliguri', sans-serif",
          }}
        >
          ১০টি ক্লাসে কম্পিউটার, সিপিইউ, র‍্যাম, স্টোরেজ, ইনপুট/আউটপুট ডিভাইস,
          সফটওয়্যার, অপারেটিং সিস্টেম, ইন্টারনেট ও সাইবার নিরাপত্তা সম্পর্কে
          ইন্টারেক্টিভভাবে শিখুন।
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {lessonClasses.map((cls, idx) => (
          <Link
            key={cls.id}
            to={`/courses/beginner/${cls.id}`}
            className="group relative block overflow-hidden"
            style={{
              backgroundColor: C.cardBg,
              borderRadius: "20px",
              border: `1.5px solid ${C.border}`,
              boxShadow: "0 2px 8px rgba(29,158,117,0.07)",
              transition: "all 0.25s ease",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.boxShadow = "0 8px 28px rgba(29,158,117,0.14)";
              el.style.borderColor = C.accent;
              el.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.boxShadow = "0 2px 8px rgba(29,158,117,0.07)";
              el.style.borderColor = C.border;
              el.style.transform = "translateY(0)";
            }}
          >
            <div
              className="h-1.5 w-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ backgroundColor: C.accent }}
            />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <span
                    className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black transition-transform group-hover:scale-110 duration-200"
                    style={{
                      backgroundColor: "rgba(29,158,117,0.12)",
                      color: C.accent,
                    }}
                  >
                    {idx + 1}
                  </span>
                  <h3
                    className="text-base font-bold leading-snug"
                    style={{
                      color: C.text,
                      fontFamily: "'Hind Siliguri', sans-serif",
                    }}
                  >
                    {cls.title}
                  </h3>
                </div>
                <span
                  className="shrink-0 opacity-35 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ color: C.accent }}
                >
                  <ChevronRight size={20} />
                </span>
              </div>
              <p
                className="text-sm line-clamp-2 leading-relaxed"
                style={{
                  color: C.secondary,
                  fontFamily: "'Hind Siliguri', sans-serif",
                }}
              >
                {classDescriptions[cls.id]}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
