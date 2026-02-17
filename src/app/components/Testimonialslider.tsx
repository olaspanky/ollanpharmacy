"use client";

import { useState, useEffect, useRef, useCallback, FC, CSSProperties } from "react";

/* ============================================================
   TYPES
   ============================================================ */

interface Testimonial {
  id: number;
  name: string;
  location: string;
  initials: string;
  avatarGradient: string;
  rating: number;
  date: string;
  title: string;
  review: string;
  helpful: number;
  category: "food" | "medication" | "both";
  badge?: string;
  emoji: string;
  orderItem: string;
}

type SlideDirection = "left" | "right";

/* ============================================================
   DATA
   ============================================================ */

const REVIEWS: Testimonial[] = [
  {
    id: 1,
    name: "Sarah M.",
    location: "New York, USA",
    initials: "SM",
    avatarGradient: "linear-gradient(135deg,#fb923c,#ef4444)",
    rating: 5,
    date: "Jan 12, 2025",
    title: "My prescriptions arrive before I even run out!",
    review:
      "I've been using this for my monthly medications and it's been a lifesaver. Delivered to my door in under 2 hours every single time. The packaging is discreet and professional.",
    helpful: 312,
    category: "medication",
    badge: "Top Reviewer",
    emoji: "💊",
    orderItem: "Monthly Prescription Pack",
  },
  {
    id: 2,
    name: "James K.",
    location: "London, UK",
    initials: "JK",
    avatarGradient: "linear-gradient(135deg,#ef4444,#ea580c)",
    rating: 5,
    date: "Feb 3, 2025",
    title: "Best jollof rice delivered right to my couch!",
    review:
      "Ordered dinner at 8 pm, arrived piping hot by 8:40. The food quality is outstanding — tastes exactly like the restaurant. My family now orders three times a week.",
    helpful: 198,
    category: "food",
    badge: "Foodie",
    emoji: "🍛",
    orderItem: "Jollof Rice & Chicken",
  },
  {
    id: 3,
    name: "Priya R.",
    location: "Toronto, Canada",
    initials: "PR",
    avatarGradient: "linear-gradient(135deg,#f97316,#facc15)",
    rating: 5,
    date: "Dec 28, 2024",
    title: "One app for food AND meds — finally!",
    review:
      "I used to juggle four different apps. Now just one. Ordered my blood-pressure medication and a healthy dinner bowl in the same checkout. This is the future of delivery.",
    helpful: 445,
    category: "both",
    badge: "Power User",
    emoji: "🥗",
    orderItem: "Wellness Bowl + Metformin",
  },
  {
    id: 4,
    name: "Daniel W.",
    location: "Lagos, Nigeria",
    initials: "DW",
    avatarGradient: "linear-gradient(135deg,#dc2626,#f97316)",
    rating: 5,
    date: "Jan 29, 2025",
    title: "Midnight cravings? Absolutely no problem.",
    review:
      "3 am suya craving hit hard. Placed my order, it was at my gate in 45 minutes. The team even called to confirm the spice level. Incredible attention to detail.",
    helpful: 276,
    category: "food",
    badge: "Night Owl",
    emoji: "🍖",
    orderItem: "Suya Platter",
  },
  {
    id: 5,
    name: "Mia L.",
    location: "Berlin, Germany",
    initials: "ML",
    avatarGradient: "linear-gradient(135deg,#ea580c,#dc2626)",
    rating: 5,
    date: "Feb 10, 2025",
    title: "My elderly mum gets her meds on time, every time.",
    review:
      "I set up recurring medication delivery for my mum who lives alone. The app pings me when it's delivered. It's given our whole family peace of mind we didn't know we needed.",
    helpful: 389,
    category: "medication",
    badge: "Family Hero",
    emoji: "❤️",
    orderItem: "Recurring Prescription",
  },
  {
    id: 6,
    name: "Kofi A.",
    location: "Accra, Ghana",
    initials: "KA",
    avatarGradient: "linear-gradient(135deg,#eab308,#f97316)",
    rating: 5,
    date: "Feb 14, 2025",
    title: "Valentine's dinner delivered in 30 minutes!",
    review:
      "Planned a surprise for my wife. It arrived warm, beautifully packaged, with a complimentary dessert. She was completely blown away. 10/10 would recommend.",
    helpful: 521,
    category: "food",
    badge: "Romantic",
    emoji: "🌹",
    orderItem: "Fine Dining Special",
  },
  {
    id: 7,
    name: "Aisha T.",
    location: "Nairobi, Kenya",
    initials: "AT",
    avatarGradient: "linear-gradient(135deg,#f87171,#fb923c)",
    rating: 5,
    date: "Jan 5, 2025",
    title: "Live tracking is worth the download alone.",
    review:
      "My insulin arrived in a temperature-controlled bag. They understand that some medications can't just be tossed in a regular bag. Professional, thorough, genuinely caring.",
    helpful: 334,
    category: "medication",
    badge: "Health Champion",
    emoji: "💉",
    orderItem: "Insulin + Cold Pack",
  },
  {
    id: 8,
    name: "Lucas B.",
    location: "São Paulo, Brazil",
    initials: "LB",
    avatarGradient: "linear-gradient(135deg,#f97316,#ef4444)",
    rating: 5,
    date: "Feb 20, 2025",
    title: "Weekly meal preps every Sunday — flawless.",
    review:
      "Seven healthy portioned meals, always fresh, always on time. I've lost 8 kg since I started using this service three months ago. Best subscription I've ever had.",
    helpful: 467,
    category: "food",
    badge: "Fitness Freak",
    emoji: "💪",
    orderItem: "Weekly Meal Prep ×7",
  },
];

/* ============================================================
   SHARED ATOMS
   ============================================================ */

const Stars: FC<{ rating: number }> = ({ rating }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <svg
        key={i}
        width={13}
        height={13}
        viewBox="0 0 24 24"
        fill={i <= rating ? "#fb923c" : "#e5e7eb"}
      >
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    ))}
  </div>
);

const CATEGORY_STYLE: Record<
  Testimonial["category"],
  { label: string; bg: string; color: string; border: string }
> = {
  food:       { label: "🍽 Food", bg: "#fff7ed", color: "#ea580c", border: "#fed7aa" },
  medication: { label: "💊 Meds", bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  both:       { label: "✨ Both", bg: "#fff7ed", color: "#c2410c", border: "#fdba74" },
};

/* ============================================================
   CARD  (used in both marquee and mobile slider)
   ============================================================ */

const Card: FC<{ t: Testimonial; style?: CSSProperties }> = ({ t, style }) => {
  const [liked, setLiked] = useState(false);
  const cat = CATEGORY_STYLE[t.category];

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        border: "1px solid #f3f4f6",
        boxShadow: "0 2px 20px rgba(234,88,12,0.08), 0 1px 4px rgba(0,0,0,0.04)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        ...style,
      }}
    >
      {/* colour stripe */}
      <div
        style={{
          height: 3,
          background: "linear-gradient(90deg,#f97316,#ef4444,#f97316)",
          flexShrink: 0,
        }}
      />

      <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>

        {/* ── row 1: avatar + name + emoji ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* avatar */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: t.avatarGradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 0 0 2px #fff, 0 0 0 3.5px rgba(249,115,22,.35)",
                fontFamily: "'Sora',sans-serif",
                fontWeight: 700,
                fontSize: 13,
                color: "#fff",
              }}
            >
              {t.initials}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 600, fontSize: 13, color: "#111827" }}>
                  {t.name}
                </span>
                {t.badge && (
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      background: "linear-gradient(90deg,#fff7ed,#fef2f2)",
                      color: "#ea580c",
                      border: "1px solid #fed7aa",
                      padding: "2px 6px",
                      borderRadius: 999,
                      fontFamily: "'Sora',sans-serif",
                    }}
                  >
                    {t.badge}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1, fontFamily: "'Nunito',sans-serif" }}>
                {t.location}
              </div>
            </div>
          </div>
          <span style={{ fontSize: 20, lineHeight: 1 }}>{t.emoji}</span>
        </div>

        {/* ── row 2: stars + date + category ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Stars rating={t.rating} />
          <span style={{ color: "#d1d5db", fontSize: 11 }}>·</span>
          <span style={{ color: "#9ca3af", fontSize: 11, fontFamily: "'Nunito',sans-serif" }}>{t.date}</span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              background: cat.bg,
              color: cat.color,
              border: `1px solid ${cat.border}`,
              padding: "2px 7px",
              borderRadius: 999,
              fontFamily: "'Sora',sans-serif",
            }}
          >
            {cat.label}
          </span>
        </div>

        {/* ── row 3: order item ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fb923c", flexShrink: 0 }} />
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#f97316",
              fontFamily: "'Sora',sans-serif",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {t.orderItem}
          </span>
        </div>

        {/* divider */}
        <div
          style={{
            height: 1,
            background: "linear-gradient(90deg,#fed7aa,#fecaca,transparent)",
          }}
        />

        {/* ── title ── */}
        <div
          style={{
            fontFamily: "'Sora',sans-serif",
            fontWeight: 700,
            fontSize: 13,
            color: "#1f2937",
            lineHeight: 1.4,
          }}
        >
          {t.title}
        </div>

        {/* ── review ── */}
        <p
          style={{
            fontFamily: "'Nunito',sans-serif",
            fontSize: 12,
            color: "#6b7280",
            lineHeight: 1.6,
            flex: 1,
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical" as const,
            overflow: "hidden",
          }}
        >
          {t.review}
        </p>

        {/* ── footer ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#9ca3af", fontFamily: "'Nunito',sans-serif" }}>
            <svg width={12} height={12} viewBox="0 0 24 24" fill="#fb923c">
              <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Verified delivery
          </div>

          <button
            onClick={() => setLiked((p) => !p)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 10,
              fontWeight: 600,
              fontFamily: "'Sora',sans-serif",
              padding: "4px 10px",
              borderRadius: 999,
              border: liked ? "1px solid #f97316" : "1px solid #e5e7eb",
              background: liked ? "#f97316" : "transparent",
              color: liked ? "#fff" : "#9ca3af",
              cursor: "pointer",
              transition: "all .2s",
            }}
          >
            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
              <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
            </svg>
            {t.helpful + (liked ? 1 : 0)}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   DESKTOP — CSS INFINITE MARQUEE
   Shows exactly 3–4 cards at all times by using fluid card
   widths: calc(100% / 3.4) so the viewport always holds 3–4.
   The scroll uses a pure CSS @keyframes on the inner track,
   so there is zero JS jank and no fixed pixel assumptions.
   ============================================================ */

// Duplicate enough times that the loop never shows a gap
const MARQUEE_ITEMS = [...REVIEWS, ...REVIEWS, ...REVIEWS, ...REVIEWS];

const DesktopMarquee: FC = () => {
  const [paused, setPaused] = useState(false);

  // Each card is 25% of the outer container → ~3.8 visible at once.
  // The track total width = number_of_items × 25%, and we translate
  // by -(REVIEWS.length × 25%) which equals exactly one set of cards.
  const CARD_PCT = 100 / 3.8; // ≈ 26.3%  → ~3.8 cards visible
  const SHIFT_PCT = REVIEWS.length * CARD_PCT; // one full set

  return (
    <>
      <style>{`
        @keyframes marqueeScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-${SHIFT_PCT.toFixed(4)}%); }
        }
        .marquee-track {
          animation: marqueeScroll 280s linear infinite;
        }
        .marquee-track.paused {
          animation-play-state: paused;
        }
      `}</style>

      <div
        style={{ position: "relative", overflow: "hidden" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* left fade */}
        <div
          style={{
            position: "absolute", left: 0, top: 0, bottom: 0, width: 80, zIndex: 10,
            background: "linear-gradient(to right, white, transparent)",
            pointerEvents: "none",
          }}
        />
        {/* right fade */}
        <div
          style={{
            position: "absolute", right: 0, top: 0, bottom: 0, width: 80, zIndex: 10,
            background: "linear-gradient(to left, white, transparent)",
            pointerEvents: "none",
          }}
        />

        {/* pause pill */}
        {paused && (
          <div
            style={{
              position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
              zIndex: 20, background: "rgba(17,24,39,.75)", color: "#fff",
              fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 999,
              fontFamily: "'Sora',sans-serif", pointerEvents: "none",
              backdropFilter: "blur(4px)",
            }}
          >
            ⏸ Paused — scroll to read
          </div>
        )}

        {/* track — total width = items × CARD_PCT */}
        <div
          className={`marquee-track${paused ? " paused" : ""}`}
          style={{
            display: "flex",
            width: `${MARQUEE_ITEMS.length * CARD_PCT}%`,
            padding: "16px 0",
          }}
        >
          {MARQUEE_ITEMS.map((t, i) => (
            <div
              key={`${t.id}-${i}`}
              style={{
                // each child width relative to the TRACK, not the viewport
                width: `${(1 / MARQUEE_ITEMS.length) * 100}%`,
                flexShrink: 0,
                padding: "0 8px",
                boxSizing: "border-box",
              }}
            >
              <Card t={t} style={{ height: "100%" }} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

/* ============================================================
   MOBILE — single card slider
   ============================================================ */

const MobileSlider: FC = () => {
  const [current, setCurrent]       = useState(0);
  const [animating, setAnimating]   = useState(false);
  const [dir, setDir]               = useState<SlideDirection>("right");
  const [autoPlay, setAutoPlay]     = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((idx: number, d: SlideDirection = "right") => {
    if (animating) return;
    setDir(d);
    setAnimating(true);
    setTimeout(() => { setCurrent(idx); setAnimating(false); }, 280);
  }, [animating]);

  const next = useCallback(() => goTo((current + 1) % REVIEWS.length, "right"), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + REVIEWS.length) % REVIEWS.length, "left"), [current, goTo]);

  useEffect(() => {
    if (autoPlay) timerRef.current = setInterval(next, 4500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [autoPlay, next]);

  const pause = () => {
    setAutoPlay(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(() => setAutoPlay(true), 9000);
  };

  const slideStyle: CSSProperties = {
    transition: "opacity .28s ease, transform .28s ease",
    opacity:    animating ? 0 : 1,
    transform:  animating
      ? dir === "right" ? "translateX(20px) scale(.97)" : "translateX(-20px) scale(.97)"
      : "translateX(0) scale(1)",
  };

  return (
    <div style={{ position: "relative", padding: "0 36px" }}>
      <div style={slideStyle}>
        <Card t={REVIEWS[current]} />
      </div>

      {/* progress */}
      <div style={{ marginTop: 14, height: 2, background: "#f3f4f6", borderRadius: 2, overflow: "hidden" }}>
        <div
          key={`prog-${current}`}
          style={{
            height: "100%",
            background: "linear-gradient(90deg,#f97316,#ef4444)",
            borderRadius: 2,
            animation: autoPlay ? "mobProg 4.5s linear forwards" : "none",
          }}
        />
      </div>

      {/* arrows */}
      {(["prev","next"] as const).map((which) => (
        <button
          key={which}
          onClick={() => { which === "prev" ? prev() : next(); pause(); }}
          aria-label={which === "prev" ? "Previous" : "Next"}
          style={{
            position: "absolute",
            [which === "prev" ? "left" : "right"]: 0,
            top: "50%", transform: "translateY(-36px)",
            width: 32, height: 32, borderRadius: "50%",
            background: "#fff", border: "1px solid #f3f4f6",
            boxShadow: "0 1px 6px rgba(0,0,0,.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#9ca3af",
          }}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            {which === "prev"
              ? <polyline points="15,18 9,12 15,6" />
              : <polyline points="9,18 15,12 9,6" />
            }
          </svg>
        </button>
      ))}

      {/* dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 14 }}>
        {REVIEWS.map((_, i) => (
          <button
            key={i}
            onClick={() => { goTo(i, i > current ? "right" : "left"); pause(); }}
            aria-label={`Review ${i + 1}`}
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
          >
            <span
              style={{
                display: "block",
                borderRadius: 999,
                transition: "all .3s",
                width:  i === current ? 20 : 8,
                height: 8,
                background: i === current
                  ? "linear-gradient(90deg,#f97316,#ef4444)"
                  : "#e5e7eb",
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

const TestimonialSlider: FC = () => {
  const stats = [
    { value: "28K+",    label: "Happy customers", icon: "😊" },
    { value: "4.9★",   label: "Average rating",   icon: "⭐" },
    { value: "<45 min", label: "Avg. delivery",    icon: "⚡" },
    { value: "99.2%",  label: "On-time rate",      icon: "✅" },
  ];

  const trust = [
    { icon: "🔒", label: "Secure checkout" },
    { icon: "🌡️", label: "Cold-chain delivery" },
    { icon: "📍", label: "Live GPS tracking" },
    { icon: "💬", label: "24/7 support" },
    { icon: "↩️", label: "Easy refunds" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 64,
        paddingBottom: 64,
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Nunito:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .shimmer {
          background: linear-gradient(90deg,#ea580c,#ef4444,#f97316,#ea580c);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 30000s linear infinite;
        }
        @keyframes pulseDot {
          0%,100% { opacity:1; transform:scale(1);   }
          50%      { opacity:.4; transform:scale(1.5); }
        }
        @keyframes mobProg {
          from { width:0; }
          to   { width:100%; }
        }

        /* responsive grid for stats */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (min-width: 640px) {
          .stats-grid { grid-template-columns: repeat(4, 1fr); }
        }

        /* hide marquee on mobile, show slider */
        .desktop-marquee { display: none; }
        .mobile-slider   { display: block; }
        @media (min-width: 640px) {
          .desktop-marquee { display: block; }
          .mobile-slider   { display: none; }
        }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ width: "100%", maxWidth: 1100, padding: "0 20px", textAlign: "center", marginBottom: 36 }}>

        {/* live badge */}
        <div
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#fff7ed", border: "1px solid #fed7aa",
            borderRadius: 999, padding: "6px 16px", marginBottom: 20,
          }}
        >
          <span
            style={{
              width: 8, height: 8, borderRadius: "50%", background: "#f97316", display: "inline-block",
              animation: "pulseDot 2s ease-in-out infinite",
            }}
          />
          <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#ea580c" }}>
            Real Customer Stories
          </span>
        </div>

        <h2
          style={{
            fontFamily: "'Sora',sans-serif", fontWeight: 800,
            fontSize: "clamp(26px, 4vw, 48px)",
            color: "#111827", lineHeight: 1.2, margin: "0 0 12px",
          }}
        >
          Trusted for food & medicine,{" "}
          <span className="shimmer">delivered with care</span>
        </h2>

        <p style={{ fontFamily: "'Nunito',sans-serif", color: "#9ca3af", fontSize: "clamp(13px,1.5vw,16px)", maxWidth: 500, margin: "0 auto 24px", lineHeight: 1.6 }}>
          From midnight cravings to critical prescriptions — our customers trust us with what matters most.
        </p>

        {/* overall rating pill */}
        <div
          style={{
            display: "inline-flex", alignItems: "center", gap: 12,
            background: "#f9fafb", border: "1px solid #f3f4f6",
            borderRadius: 16, padding: "10px 20px",
          }}
        >
          <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 26, color: "#111827" }}>4.9</span>
          <div>
            <Stars rating={5} />
            <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 2, textAlign: "left", fontFamily: "'Nunito',sans-serif" }}>
              28,400+ verified reviews
            </p>
          </div>
          <div style={{ width: 1, height: 32, background: "#e5e7eb" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="#f97316">
              <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 12, color: "#374151" }}>All verified</span>
          </div>
        </div>
      </div>

      {/* ── STATS STRIP ── */}
      <div style={{ width: "100%", maxWidth: 1100, padding: "0 20px", marginBottom: 36 }}>
        <div className="stats-grid">
          {stats.map((s) => (
            <div
              key={s.label}
              style={{
                background: "#fff", border: "1px solid #f3f4f6", borderRadius: 16,
                padding: "16px 12px", textAlign: "center",
                boxShadow: "0 2px 12px rgba(234,88,12,.06)",
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: "#111827" }}>{s.value}</div>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── DESKTOP MARQUEE ── */}
      <div className="desktop-marquee" style={{ width: "100%" }}>
        <DesktopMarquee />
      </div>

      {/* ── MOBILE SLIDER ── */}
      <div className="mobile-slider" style={{ width: "100%", padding: "0 16px" }}>
        <MobileSlider />
      </div>

      {/* ── TRUST STRIP ── */}
      <div style={{ width: "100%", maxWidth: 1100, padding: "36px 20px 0", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px 32px" }}>
        {trust.map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'Nunito',sans-serif", fontSize: 12, color: "#9ca3af", fontWeight: 500 }}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialSlider;