import { useState, type AnchorHTMLAttributes } from "react";
import {
  ArrowRight,
  Facebook,
  Heart,
  Instagram,
  Menu,
  MessageCircle,
  PawPrint,
  ShieldCheck,
  ShoppingBag,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";
import "./_group.css";

const logo = "/__mockup/images/savestreet-dogs-logo-display-v1.webp";
const heroImage =
  "https://images.pexels.com/photos/1254140/pexels-photo-1254140.jpeg?auto=compress&cs=tinysrgb&w=960&q=78";
const calmImage =
  "https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=800&q=78";
const socials = {
  instagram: "https://www.instagram.com/savestreetdogs18/",
  facebook: "https://www.facebook.com/profile.php?id=61591879406906",
};

type SiteLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

function SiteLink({ href, ...props }: SiteLinkProps) {
  return <a href={href} {...props} />;
}

function Header() {
  const [open, setOpen] = useState(false);
  const items = [
    ["/puppies", "Find a puppy"],
    ["/rescue", "Report a dog"],
    ["/adopt", "Adoption"],
    ["/products", "Shop"],
    ["/stories", "Stories"],
    ["/learn", "Learn"],
  ];

  return (
    <header>
      <div className="topline">Street by street. Paw by paw. Saving lives.</div>
      <div className="nav-wrap">
        <nav className="nav" aria-label="Main navigation">
          <SiteLink href="/" className="brand" aria-label="SaveStreet Dogs home">
            <img className="brand-logo" src={logo} alt="SaveStreet Dogs" width="504" height="336" />
          </SiteLink>
          <div className="nav-links">
            {items.map(([href, label]) => (
              <SiteLink key={href} href={href}>{label}</SiteLink>
            ))}
          </div>
          <div className="nav-actions">
            <SiteLink href="/login" className="nav-auth">Sign in</SiteLink>
            <SiteLink href="/donate" className="btn btn-primary">Give support <Heart size={15} /></SiteLink>
            <button className="icon-btn" aria-label="Open cart, 0 items"><ShoppingBag size={18} /></button>
            <button
              className="icon-btn menu-toggle"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </nav>
        {open && (
          <div className="mobile-menu open">
            {[["/", "Home"], ...items, ["/volunteer", "Volunteer"], ["/foster", "Foster"]].map(([href, label]) => (
              <SiteLink key={href} href={href} onClick={() => setOpen(false)}>
                {label}<ArrowRight size={14} />
              </SiteLink>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}

function CollarFeature() {
  return (
    <section className="collar-feature">
      <div className="container collar-feature-inner">
        <div className="collar-feature-image" aria-label="Reflective collar photos">
          <img src="/__mockup/images/reflective-collar-color-options.jpg" alt="Reflective dog collars in several colors" />
          <img src="/__mockup/images/reflective-collars-red-yellow.jpg" alt="Red and yellow reflective dog collars" />
        </div>
        <div className="collar-feature-copy">
          <div className="eyebrow">A useful little thing</div>
          <h2>Reflective<br /><em>Collars</em></h2>
          <p>Reflective collars help make a dog easier to see when light is low. Choose one piece or a few for your neighborhood.</p>
          <div className="collar-feature-bottom">
            <span className="price">₹60 <small>per piece</small></span>
            <SiteLink href="/products" className="btn btn-primary">Visit the shop <ArrowRight size={15} /></SiteLink>
          </div>
          <small className="stock-honesty">Availability is not tracked as a live stock count. Please confirm details with the team.</small>
        </div>
      </div>
    </section>
  );
}

function SocialLinks() {
  return (
    <div className="social-links" aria-label="SaveStreet Dogs social media">
      <a href={socials.instagram} target="_blank" rel="noopener noreferrer"><Instagram size={17} /><span>Instagram</span></a>
      <a href={socials.facebook} target="_blank" rel="noopener noreferrer"><Facebook size={17} /><span>Facebook</span></a>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <SiteLink href="/" className="brand" aria-label="SaveStreet Dogs home">
            <img className="brand-logo footer-logo" src={logo} alt="SaveStreet Dogs" width="504" height="336" />
          </SiteLink>
          <p>Practical care, patient homes, and a community that notices the dog at the edge of the road.</p>
          <p className="eyebrow">Every Paw Deserves a Chance.</p>
          <SocialLinks />
        </div>
        <div><h4>Take action</h4><SiteLink href="/rescue">Report a dog</SiteLink><SiteLink href="/adopt">Adopt responsibly</SiteLink><SiteLink href="/foster">Become a foster</SiteLink><SiteLink href="/volunteer">Volunteer</SiteLink></div>
        <div><h4>Explore</h4><SiteLink href="/puppies">Puppies</SiteLink><SiteLink href="/products">Shop</SiteLink><SiteLink href="/stories">Stories</SiteLink><SiteLink href="/learn">Learn</SiteLink></div>
        <div><h4>Stay close</h4><p>Questions about a dog or a next step? We read every note.</p><SiteLink href="/contact" className="btn btn-dark">Contact the team <ArrowRight size={14} /></SiteLink></div>
      </div>
      <div className="container footer-bottom"><span>© 2026 SaveStreet Dogs</span><span>Built for kind, informed action.</span></div>
    </footer>
  );
}

export function Current() {
  return (
    <div className="current-site">
      <Header />
      <main>
        <section className="hero">
          <div className="reveal">
            <div className="eyebrow">Community care for street dogs</div>
            <h1>Small actions.<br /><em>Real chances.</em></h1>
            <p className="hero-copy">A dog on the roadside can change the shape of your day. We make the next step clearer — report an injury, open your home, learn what helps.</p>
            <div className="hero-actions">
              <SiteLink href="/rescue" className="btn btn-primary">Report a dog <ArrowRight size={16} /></SiteLink>
              <SiteLink href="/puppies" className="btn btn-ghost">Meet the puppies</SiteLink>
            </div>
            <div className="hero-note"><ShieldCheck size={15} /> Clear guidance. Respectful care.</div>
          </div>
          <div className="hero-art reveal delay-2">
            <img className="hero-photo" src={heroImage} alt="A calm tan dog outdoors" />
            <div className="art-sticker"><PawPrint size={24} /><span>Every paw<br />deserves<br />a chance</span></div>
          </div>
        </section>
        <CollarFeature />
        <div className="band">
          <div className="container band-inner">
            <strong>Start where you are.</strong>
            <p>One form. One conversation. One bowl of water can be the beginning.</p>
            <SiteLink href="/learn" className="btn btn-dark">What helps most <ArrowRight size={14} /></SiteLink>
          </div>
        </div>
        <section className="section container">
          <div className="section-head">
            <div><div className="eyebrow">Choose your next step</div><h2>Care is a practice,<br />not a perfect moment.</h2></div>
            <p className="section-intro">You do not need to know everything to help. Pick the path that fits what you can offer today.</p>
          </div>
          <div className="action-grid">
            <SiteLink href="/rescue" className="action-card primary"><div><Stethoscope size={25} /><h3>There is a dog who needs help</h3><p>Tell us what you see. A clear report gives the right people a place to begin.</p></div><span className="arrow"><ArrowRight size={17} /></span></SiteLink>
            <SiteLink href="/foster" className="action-card sage"><div><Heart size={24} /><h3>I can open my home</h3><p>Even a temporary landing place makes recovery possible.</p></div><span className="arrow"><ArrowRight size={17} /></span></SiteLink>
            <SiteLink href="/volunteer" className="action-card cream"><div><UserRound size={24} /><h3>I have time to give</h3><p>Good work is built by neighbors who show up steadily.</p></div><span className="arrow"><ArrowRight size={17} /></span></SiteLink>
          </div>
        </section>
        <section className="section container">
          <div className="split">
            <img className="split-photo" src={calmImage} alt="A rescued dog resting" />
            <div><div className="eyebrow">A slower kind of change</div><div className="quote-mark">“</div><p className="quote">Every Paw Deserves a Chance.</p><p className="section-intro">We believe the most trustworthy rescue work is specific and patient: listen first, offer realistic choices, and keep the dog’s dignity at the center.</p><SiteLink href="/about" className="btn btn-ghost">How we work <ArrowRight size={15} /></SiteLink></div>
          </div>
        </section>
      </main>
      <Footer />
      <div className="current-floating">
        <button className="pawpal-toggle"><PawPrint size={19} /><span>PawPal</span></button>
        <button className="global-whatsapp"><MessageCircle size={20} /><span>WhatsApp</span></button>
      </div>
    </div>
  );
}
