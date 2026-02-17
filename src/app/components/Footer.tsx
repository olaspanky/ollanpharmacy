import { useState } from "react";

const OllanFooter = () => {
  const [hoveredLink, setHoveredLink] = useState(null);

  const quickLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  const services = [
    "24/7 Delivery",
    "Consultation",
    "Laboratory",
    "ICU",
    "Patient Ward",
  ];

  const socialLinks = [
    {
      name: "Facebook",
      href: "#",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      ),
    },
    {
      name: "Twitter",
      href: "#",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
        </svg>
      ),
    },
    {
      name: "Instagram",
      href: "#",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      name: "WhatsApp",
      href: "https://wa.me/2349040788398",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.847L.057 23.535a.5.5 0 0 0 .612.612l5.688-1.471A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.97 0-3.805-.568-5.356-1.55l-.385-.24-3.97 1.026 1.05-3.858-.262-.403A9.956 9.956 0 0 1 2 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');

        .ollan-footer {
          --red-deep: #1a0505;
          --red-mid: #7a1010;
          --red-accent: #c0392b;
          --red-light: #e74c3c;
          --orange: #e8620a;
          --orange-light: #f7934a;
          --cream: #fff5f0;
          --white: #ffffff;
          --text-muted: rgba(255, 245, 240, 0.55);

          background: var(--red-deep);
          font-family: 'DM Sans', sans-serif;
          color: var(--cream);
          position: relative;
          overflow: hidden;
        }

        .ollan-footer::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 40% at 80% 10%, rgba(232, 98, 10, 0.18) 0%, transparent 60%),
            radial-gradient(ellipse 40% 60% at 10% 80%, rgba(192, 57, 43, 0.12) 0%, transparent 50%);
          pointer-events: none;
        }

        .footer-top-bar {
          background: var(--red-mid);
          padding: 0 2.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(232, 98, 10, 0.4);
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 1.25rem 0;
        }

        .brand-pill {
          background: var(--orange);
          color: var(--white);
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Playfair Display', serif;
          font-weight: 600;
          font-size: 1.15rem;
          flex-shrink: 0;
        }

        .brand-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: var(--white);
        }

        .brand-tagline {
          font-size: 0.7rem;
          color: var(--orange-light);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-top: 1px;
        }

        .rc-badge {
          font-size: 0.72rem;
          color: var(--text-muted);
          letter-spacing: 0.06em;
        }

        .footer-main {
          display: grid;
          grid-template-columns: 1.6fr 1fr 1fr 1fr;
          gap: 3rem;
          padding: 3rem 2.5rem 2.5rem;
          position: relative;
        }

        .footer-section-title {
          font-family: 'Playfair Display', serif;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--orange-light);
          margin: 0 0 1.2rem;
          padding-bottom: 0.65rem;
          border-bottom: 1px solid rgba(232, 98, 10, 0.35);
          position: relative;
        }

        .footer-section-title::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 28px;
          height: 2px;
          background: var(--orange);
        }

        /* Contact */
        .contact-item {
          display: flex;
          align-items: flex-start;
          gap: 0.7rem;
          margin-bottom: 0.85rem;
          font-size: 0.875rem;
          color: var(--cream);
          line-height: 1.55;
        }

        .contact-icon {
          color: var(--orange-light);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .contact-link {
          color: var(--cream);
          text-decoration: none;
          transition: color 0.2s;
        }

        .contact-link:hover {
          color: var(--orange-light);
        }

        /* Quick Links */
        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
        }

        .footer-link-item a {
          color: var(--cream);
          text-decoration: none;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.45rem;
          transition: color 0.2s, gap 0.2s;
          opacity: 0.85;
        }

        .footer-link-item a::before {
          content: '→';
          font-size: 0.7rem;
          color: var(--orange);
          transition: transform 0.2s;
        }

        .footer-link-item a:hover {
          color: var(--orange-light);
          opacity: 1;
          gap: 0.65rem;
        }

        .footer-link-item a:hover::before {
          transform: translateX(3px);
        }

        /* Services */
        .services-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
        }

        .service-item {
          font-size: 0.875rem;
          color: var(--cream);
          opacity: 0.85;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .service-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--orange-light);
          flex-shrink: 0;
        }

        /* Social */
        .social-grid {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .social-link {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          color: var(--cream);
          text-decoration: none;
          font-size: 0.875rem;
          opacity: 0.85;
          padding: 0.4rem 0.6rem;
          border-radius: 6px;
          border: 1px solid transparent;
          transition: all 0.22s;
        }

        .social-link:hover {
          opacity: 1;
          border-color: rgba(232, 98, 10, 0.45);
          background: rgba(255,255,255,0.04);
          color: var(--orange-light);
        }

        /* Bottom Bar */
        .footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.08);
          padding: 1.1rem 2.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }

        .footer-copyright {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .footer-legal {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .legal-link {
          color: var(--text-muted);
          text-decoration: none;
          font-size: 0.78rem;
          transition: color 0.2s;
        }

        .legal-link:hover {
          color: var(--orange-light);
        }

        .legal-divider {
          width: 1px;
          height: 12px;
          background: rgba(255,255,255,0.15);
        }

        /* Decorative cross */
        .deco-cross {
          position: absolute;
          right: 2.5rem;
          top: 50%;
          transform: translateY(-50%);
          opacity: 0.06;
          pointer-events: none;
          font-size: 5rem;
          color: var(--white);
          line-height: 1;
        }

        @media (max-width: 900px) {
          .footer-main {
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            padding: 2.5rem 1.5rem 2rem;
          }
          .footer-top-bar {
            padding: 0 1.5rem;
          }
          .footer-bottom {
            padding: 1rem 1.5rem;
            flex-direction: column;
            gap: 0.75rem;
            text-align: center;
          }
        }

        @media (max-width: 560px) {
          .footer-main {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <footer className="ollan-footer">
        {/* Top brand bar */}
        <div className="footer-top-bar">
          <div className="footer-brand">
            <div className="brand-pill">O</div>
            <div>
              <div className="brand-name">Ollan Pharmacy</div>
              <div className="brand-tagline">Your Health, Our Priority</div>
            </div>
          </div>
          <div className="rc-badge">RC No: 69,342</div>
        </div>

        {/* Main grid */}
        <div className="footer-main">
          {/* Contact */}
          <div>
            <h4 className="footer-section-title">Contact Us</h4>
            <div className="contact-item">
              <span className="contact-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <span>No. 62 Iwo Road, Opposite Ibadan North East Secretariat, Ibadan, Oyo State, Nigeria</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.8a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.6a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 18l.19-1.08z" />
                </svg>
              </span>
              <a href="tel:+2349040788398" className="contact-link">+234 904 078 8398</a>
            </div>
            <div className="contact-item">
              <span className="contact-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <a href="mailto:services@ollanpharmacy.ng" className="contact-link">services@ollanpharmacy.ng</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer-section-title">Quick Links</h4>
            <ul className="footer-links">
              {quickLinks.map((link) => (
                <li key={link.label} className="footer-link-item">
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="footer-section-title">Services</h4>
            <ul className="services-list">
              {services.map((service) => (
                <li key={service} className="service-item">
                  <span className="service-dot" />
                  {service}
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="footer-section-title">Social Media</h4>
            <div className="social-grid">
              {socialLinks.map((s) => (
                <a key={s.name} href={s.href} className="social-link" target="_blank" rel="noopener noreferrer">
                  {s.icon}
                  <span>{s.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © 2023 Ollan Pharmacy · RC Number: 69,342 · All rights reserved.
          </p>
          <nav className="footer-legal">
            <a href="/terms" className="legal-link">Terms and Conditions</a>
            <div className="legal-divider" />
            <a href="/privacy" className="legal-link">Privacy Policy</a>
          </nav>
          <div className="deco-cross">✚</div>
        </div>
      </footer>
    </>
  );
};

export default OllanFooter;