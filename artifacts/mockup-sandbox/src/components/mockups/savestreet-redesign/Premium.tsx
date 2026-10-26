import { useState, type AnchorHTMLAttributes } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  Facebook,
  Heart,
  Instagram,
  Menu,
  ShieldCheck,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";
import "./_premium.css";

const logo = "/__mockup/images/savestreet-dogs-logo-display-v1.webp";
const heroImage =
  "https://images.pexels.com/photos/1254140/pexels-photo-1254140.jpeg?auto=compress&cs=tinysrgb&w=1200&q=82";
const calmImage =
  "https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=1000&q=82";

const navigation = [
  ["/puppies", "Find a puppy"],
  ["/rescue", "Report a dog"],
  ["/adopt", "Adoption"],
  ["/products", "Shop"],
  ["/stories", "Stories"],
  ["/learn", "Learn"],
];

type NavLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

function NavLink({ href, ...props }: NavLinkProps) {
  return <a href={href} {...props} />;
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="ss-header">
      <div className="ss-utility">
        <span>Street by street. Paw by paw. Saving lives.</span>
        <a href="/learn">Clear guidance. Respectful care. <ArrowRight size={13} /></a>
      </div>
      <div className="ss-nav-shell">
        <nav className="ss-nav" aria-label="Main navigation">
          <NavLink href="/" className="ss-brand" aria-label="SaveStreet Dogs home">
            <img src={logo} alt="SaveStreet Dogs" width="504" height="336" />
          </NavLink>
          <div className="ss-nav-links">
            {navigation.map(([href, label]) => <NavLink key={href} href={href}>{label}</NavLink>)}
          </div>
          <div className="ss-nav-actions">
            <NavLink href="/login" className="ss-signin">Sign in</NavLink>
            <NavLink href="/donate" className="ss-button ss-button-gold">Give support <Heart size={15} /></NavLink>
            <button
              className="ss-menu-button"
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
              aria-controls="ss-mobile-menu"
            >
              {menuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </nav>
        {menuOpen && (
          <nav className="ss-mobile-menu" id="ss-mobile-menu" aria-label="Mobile navigation">
            {[["/", "Home"], ...navigation, ["/volunteer", "Volunteer"], ["/foster", "Foster"]].map(([href, label]) => (
              <NavLink key={href} href={href} onClick={() => setMenuOpen(false)}>
                <span>{label}</span><ArrowRight size={15} />
              </NavLink>
            ))}
            <NavLink href="/donate" className="ss-mobile-support" onClick={() => setMenuOpen(false)}>
              Give support <Heart size={15} />
            </NavLink>
          </nav>
        )}
      </div>
    </header>
  );
}

function RunningImage({
  src,
  alt,
  className = "",
  imageClassName = "",
  loading = "lazy",
}: {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  loading?: "eager" | "lazy";
}) {
  return (
    <div className={`ss-running-frame ${className}`}>
      <div className="ss-frame-inner">
        <img className={imageClassName} src={src} alt={alt} loading={loading} decoding="async" />
      </div>
    </div>
  );
}

function CollarFeature() {
  return (
    <section className="ss-collar-section" aria-labelledby="ss-collar-title">
      <div className="ss-collar-layout">
        <div className="ss-collar-gallery">
          <RunningImage
            className="ss-collar-main-frame"
            src="/__mockup/images/reflective-collars-red-yellow.jpg"
            alt="Red and yellow reflective dog collars displayed side by side"
          />
          <RunningImage
            className="ss-collar-small-frame"
            src="/__mockup/images/reflective-collar-color-options.jpg"
            alt="Reflective collars shown in a range of colors"
          />
          <span className="ss-gallery-caption">A useful little thing</span>
        </div>
        <div className="ss-collar-copy">
          <p className="ss-kicker">Small goods, practical good</p>
          <h2 id="ss-collar-title">Seen a little<br /><em>sooner.</em></h2>
          <p>Reflective collars help make a dog easier to see when light is low. Choose one piece or a few for your neighborhood.</p>
          <div className="ss-product-cta">
            <div><strong>₹60</strong><span>per piece</span></div>
            <NavLink href="/products" className="ss-button ss-button-forest">Visit the shop <ArrowRight size={16} /></NavLink>
          </div>
          <small>Availability is not tracked as a live stock count. Please confirm details with the team.</small>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="ss-footer">
      <div className="ss-footer-main">
        <div className="ss-footer-brand">
          <NavLink href="/" className="ss-footer-logo" aria-label="SaveStreet Dogs home">
            <img src={logo} alt="SaveStreet Dogs" width="504" height="336" loading="lazy" />
          </NavLink>
          <p>Practical care, patient homes, and a community that notices the dog at the edge of the road.</p>
          <span className="ss-footer-motto">Every Paw Deserves a Chance.</span>
          <div className="ss-socials" aria-label="SaveStreet Dogs social media">
            <a href="https://www.instagram.com/savestreetdogs18/" target="_blank" rel="noopener noreferrer"><Instagram size={16} />Instagram</a>
            <a href="https://www.facebook.com/profile.php?id=61591879406906" target="_blank" rel="noopener noreferrer"><Facebook size={16} />Facebook</a>
          </div>
        </div>
        <div className="ss-footer-column">
          <h2>Take action</h2>
          <NavLink href="/rescue">Report a dog</NavLink>
          <NavLink href="/adopt">Adopt responsibly</NavLink>
          <NavLink href="/foster">Become a foster</NavLink>
          <NavLink href="/volunteer">Volunteer</NavLink>
        </div>
        <div className="ss-footer-column">
          <h2>Explore</h2>
          <NavLink href="/puppies">Puppies</NavLink>
          <NavLink href="/products">Shop</NavLink>
          <NavLink href="/stories">Stories</NavLink>
          <NavLink href="/learn">Learn</NavLink>
        </div>
        <div className="ss-footer-contact">
          <p className="ss-kicker">Stay close</p>
          <p>Questions about a dog or a next step? We read every note.</p>
          <NavLink href="/contact" className="ss-button ss-button-outline">Contact the team <ArrowRight size={15} /></NavLink>
        </div>
      </div>
      <div className="ss-footer-bottom">
        <span>© 2026 SaveStreet Dogs</span>
        <span>Built for kind, informed action.</span>
      </div>
    </footer>
  );
}

export function Premium() {
  return (
    <div className="premium-site">
      <Header />
      <main>
        <section className="ss-hero">
          <div className="ss-hero-copy">
            <p className="ss-kicker"><span className="ss-kicker-line" />Community care for street dogs</p>
            <h1>Small actions.<br /><em>Real chances.</em></h1>
            <p className="ss-hero-description">A dog on the roadside can change the shape of your day. We make the next step clearer — report an injury, open your home, learn what helps.</p>
            <div className="ss-hero-actions">
              <NavLink href="/rescue" className="ss-button ss-button-gold">Report a dog <ArrowRight size={16} /></NavLink>
              <NavLink href="/puppies" className="ss-text-link">Meet the puppies <ArrowRight size={16} /></NavLink>
            </div>
            <div className="ss-hero-trust"><ShieldCheck size={16} /><span>Clear guidance. Respectful care.</span></div>
            <a href="#next-step" className="ss-scroll-cue"><span>Find your next step</span><ArrowDownRight size={16} /></a>
          </div>
          <div className="ss-hero-visual">
            <div className="ss-hero-photo-wrap">
              <RunningImage
                src={heroImage}
                alt="A tan dog resting calmly outdoors"
                className="ss-hero-frame"
                imageClassName="ss-hero-photo"
                loading="eager"
              />
              <div className="ss-image-index"><span>01</span><i />A neighbor notices</div>
            </div>
            <div className="ss-hero-side-note"><span>Street by street</span><span className="ss-note-rule" /><span>Paw by paw</span></div>
            <div className="ss-hero-badge"><span>Every Paw</span><span>Deserves a</span><strong>Chance.</strong></div>
          </div>
        </section>

        <section className="ss-pathways" id="next-step" aria-labelledby="ss-pathways-title">
          <div className="ss-section-intro">
            <p className="ss-kicker">Start where you are</p>
            <h2 id="ss-pathways-title">There is no one<br /><em>right way to help.</em></h2>
            <p>You do not need to know everything to help. Pick the path that fits what you can offer today.</p>
          </div>
          <div className="ss-path-list">
            <NavLink href="/rescue" className="ss-path-card ss-path-featured">
              <span className="ss-path-number">01 / NOTICE</span>
              <span className="ss-path-icon"><Stethoscope size={23} /></span>
              <span className="ss-path-body"><strong>There is a dog who needs help</strong><span>Tell us what you see. A clear report gives the right people a place to begin.</span></span>
              <span className="ss-path-arrow"><ArrowRight size={18} /></span>
            </NavLink>
            <NavLink href="/foster" className="ss-path-card">
              <span className="ss-path-number">02 / OPEN YOUR HOME</span>
              <span className="ss-path-icon"><Heart size={22} /></span>
              <span className="ss-path-body"><strong>I can open my home</strong><span>Even a temporary landing place makes recovery possible.</span></span>
              <span className="ss-path-arrow"><ArrowRight size={18} /></span>
            </NavLink>
            <NavLink href="/volunteer" className="ss-path-card">
              <span className="ss-path-number">03 / SHOW UP</span>
              <span className="ss-path-icon"><UserRound size={22} /></span>
              <span className="ss-path-body"><strong>I have time to give</strong><span>Good work is built by neighbors who show up steadily.</span></span>
              <span className="ss-path-arrow"><ArrowRight size={18} /></span>
            </NavLink>
          </div>
        </section>

        <section className="ss-learning-band">
          <div className="ss-learning-mark" aria-hidden="true"><span>SS</span><i /></div>
          <div className="ss-learning-copy">
            <p className="ss-kicker">A little knowledge goes a long way</p>
            <h2>Start with what<br />helps most.</h2>
          </div>
          <p className="ss-learning-text">One form. One conversation. One bowl of water can be the beginning.</p>
          <NavLink href="/learn" className="ss-button ss-button-outline">What helps most <ArrowRight size={15} /></NavLink>
        </section>

        <CollarFeature />

        <section className="ss-belief">
          <div className="ss-belief-image-column">
            <RunningImage
              src={calmImage}
              alt="A dog resting quietly outdoors"
              className="ss-belief-frame"
              imageClassName="ss-belief-photo"
            />
            <span className="ss-photo-caption"><span>CARE, WITHOUT THE NOISE</span><i /></span>
          </div>
          <div className="ss-belief-copy">
            <p className="ss-kicker">A slower kind of change</p>
            <span className="ss-quote-mark" aria-hidden="true">“</span>
            <h2>Every Paw<br /><em>Deserves a Chance.</em></h2>
            <p>We believe the most trustworthy rescue work is specific and patient: listen first, offer realistic choices, and keep the dog’s dignity at the center.</p>
            <NavLink href="/about" className="ss-text-link">How we work <ArrowRight size={16} /></NavLink>
          </div>
        </section>

        <section className="ss-closing">
          <div className="ss-closing-orbit" aria-hidden="true"><span /><span /><span /></div>
          <p className="ss-kicker">A good place to begin</p>
          <h2>Notice a dog.<br /><em>Know what to do next.</em></h2>
          <p>Thoughtful care starts with a clear next step. We are here to help make it easier to find.</p>
          <div className="ss-closing-actions">
            <NavLink href="/rescue" className="ss-button ss-button-gold">Report a dog <ArrowRight size={16} /></NavLink>
            <NavLink href="/learn" className="ss-button ss-button-light">Explore the care guide</NavLink>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
