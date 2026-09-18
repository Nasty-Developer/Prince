import { useEffect, useMemo, useState, type Dispatch, type FormEvent, type ReactNode, type SetStateAction } from 'react';
import { ArrowRight, BookOpen, Check, ChevronDown, CircleHelp, Heart, Leaf, Menu, Minus, PawPrint, Plus, Search, Send, ShieldCheck, ShoppingBag, Stethoscope, Truck, UserRound, X } from 'lucide-react';
import { Link, Route, Switch, useLocation, useRoute } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

type Product = { id: string; name: string; price: number; type: string; color: string; icon: 'paw' | 'leaf' | 'heart' };
type CartLine = Product & { quantity: number };

const dogImages = {
  hero: 'https://images.pexels.com/photos/1254140/pexels-photo-1254140.jpeg?auto=compress&cs=tinysrgb&w=1200',
  calm: 'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=1000',
  puppy: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=900',
  small: 'https://images.pexels.com/photos/551628/pexels-photo-551628.jpeg?auto=compress&cs=tinysrgb&w=900',
  portrait: 'https://images.pexels.com/photos/1490908/pexels-photo-1490908.jpeg?auto=compress&cs=tinysrgb&w=900',
  brown: 'https://images.pexels.com/photos/160846/pexels-photo-160846.jpeg?auto=compress&cs=tinysrgb&w=900',
};

const products: Product[] = [
  { id: 'tote', name: 'Every Paw canvas tote', price: 18, type: 'Everyday carry', color: 'sage', icon: 'paw' },
  { id: 'bandana', name: 'Streetwise bandana', price: 14, type: 'For dogs', color: 'coral', icon: 'heart' },
  { id: 'print', name: 'Paw by paw print', price: 22, type: 'Art for good', color: 'cream', icon: 'leaf' },
  { id: 'mug', name: 'Warm hands, warm bowls mug', price: 16, type: 'Kitchen', color: 'dark', icon: 'heart' },
  { id: 'patch', name: 'Good neighbour patch', price: 9, type: 'Small goods', color: 'sage', icon: 'paw' },
  { id: 'notebook', name: 'Field notes notebook', price: 12, type: 'Stationery', color: 'cream', icon: 'leaf' },
];

const puppies = [
  { id: 'milo', name: 'Milo', age: '8 months', size: 'Medium', trait: 'Gentle observer', image: dogImages.puppy, text: 'Milo takes a little time to trust, then follows you everywhere. He is looking for a calm home.' },
  { id: 'pepper', name: 'Pepper', age: '5 months', size: 'Small', trait: 'Bright & bouncy', image: dogImages.small, text: 'Pepper loves a sunny patch and a squeaky toy. A family ready for puppy energy would suit her.' },
  { id: 'suri', name: 'Suri', age: '1 year', size: 'Medium', trait: 'People person', image: dogImages.calm, text: 'Suri is curious, affectionate, and learning her leash skills with a foster family.' },
  { id: 'biscuit', name: 'Biscuit', age: '7 months', size: 'Small', trait: 'Soft-hearted', image: dogImages.brown, text: 'Biscuit is a gentle little shadow who would love a home with another kind dog.' },
  { id: 'tala', name: 'Tala', age: '10 months', size: 'Large', trait: 'Quietly funny', image: dogImages.portrait, text: 'Tala has a thoughtful nature and a very serious relationship with treats.' },
  { id: 'otto', name: 'Otto', age: '6 months', size: 'Medium', trait: 'Playful learner', image: dogImages.hero, text: 'Otto is practicing his best manners and would thrive with patient, playful people.' },
];

const navItems = [
  ['/puppies', 'Find a puppy'],
  ['/rescue', 'Report a dog'],
  ['/adopt', 'Adoption'],
  ['/products', 'Shop'],
  ['/stories', 'Stories'],
  ['/learn', 'Learn'],
];

function Meta({ title, description }: { title: string; description: string }) {
  useEffect(() => {
    document.title = `${title} · SaveStreet Dogs`;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);
    const socialDescription = document.querySelector('meta[property="og:description"]');
    if (socialDescription) socialDescription.setAttribute('content', description);
    const socialTitle = document.querySelector('meta[property="og:title"]');
    if (socialTitle) socialTitle.setAttribute('content', `${title} · SaveStreet Dogs`);
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) twitterDescription.setAttribute('content', description);
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', `${title} · SaveStreet Dogs`);
  }, [title, description]);
  return null;
}

function Loader() {
  const [location] = useLocation();
  const [done, setDone] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setDone(true), 900);
    return () => window.clearTimeout(timer);
  }, []);
  if (location !== '/') return null;
  return <div className={`loader ${done ? 'done' : ''}`} aria-hidden={done}><div className="loader-inner"><div className="loader-paw"><PawPrint size={25} strokeWidth={2.5} /></div><p>Making room for hope</p></div></div>;
}

function Header({ cartCount, onCart }: { cartCount: number; onCart: () => void }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.classList.add('menu-open');
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('menu-open');
    };
  }, [menuOpen]);
  useEffect(() => setMenuOpen(false), [location]);

  const mobileItems = [
    ['/', 'Home'],
    ['/rescue', 'Report a dog'],
    ['/puppies', 'Puppies'],
    ['/adopt', 'Adoption'],
    ['/products', 'Products'],
    ['/volunteer', 'Volunteer'],
    ['/foster', 'Foster'],
    ['/stories', 'Stories'],
    ['/learn', 'Education'],
    ['/about', 'About'],
    ['/contact', 'Contact'],
    ['/donate', 'Donate'],
  ];

  return <header>
    <div className="topline">Street by street. Paw by paw. Saving lives.</div>
    <div className="nav-wrap">
      <nav className="nav" aria-label="Main navigation">
        <Link href="/" className="brand" data-testid="link-brand" onClick={() => setMenuOpen(false)}><span className="brand-mark"><PawPrint size={19} /></span><span>SaveStreet Dogs</span></Link>
        <div className="nav-links">{navItems.map(([href, label]) => <Link key={href} href={href} className={location === href ? 'active' : ''} data-testid={`link-nav-${href.slice(1)}`}>{label}</Link>)}</div>
        <div className="nav-actions">
          <Link href="/donate" className="btn btn-primary" data-testid="link-nav-donate">Give support <Heart size={15} /></Link>
          <button className="icon-btn" aria-label={`Open cart, ${cartCount} items`} onClick={onCart} data-testid="button-open-cart"><ShoppingBag size={18} /><span className="sr-only">{cartCount} items</span></button>
          <button className="icon-btn menu-toggle" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)} data-testid="button-mobile-menu">{menuOpen ? <X size={19} /> : <Menu size={19} />}</button>
        </div>
      </nav>
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`} id="mobile-navigation" aria-label="Mobile navigation" aria-hidden={!menuOpen}>{mobileItems.map(([href, label]) => <Link key={href} href={href} onClick={() => setMenuOpen(false)} className={href === '/rescue' || href === '/donate' ? 'mobile-priority' : ''} data-testid={`link-mobile-${href === '/' ? 'home' : href.slice(1)}`}>{label}<ArrowRight size={14} /></Link>)}</div>
    </div>
    {menuOpen && <button className="menu-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
  </header>;
}

function Footer() {
  return <footer className="footer"><div className="container footer-grid">
    <div className="footer-brand"><Link href="/" className="brand" data-testid="link-footer-brand"><span className="brand-mark"><PawPrint size={19} /></span><span>SaveStreet Dogs</span></Link><p>Practical care, patient homes, and a community that notices the dog at the edge of the road.</p><p className="eyebrow">Every Paw Deserves a Chance.</p></div>
    <div><h4>Take action</h4><Link href="/rescue" data-testid="link-footer-rescue">Report a dog</Link><Link href="/adopt" data-testid="link-footer-adopt">Adopt responsibly</Link><Link href="/foster" data-testid="link-footer-foster">Become a foster</Link><Link href="/volunteer" data-testid="link-footer-volunteer">Volunteer</Link></div>
    <div><h4>Explore</h4><Link href="/puppies" data-testid="link-footer-puppies">Puppies</Link><Link href="/products" data-testid="link-footer-products">Shop</Link><Link href="/stories" data-testid="link-footer-stories">Stories</Link><Link href="/learn" data-testid="link-footer-learn">Learn</Link></div>
    <div><h4>Stay close</h4><p style={{ color: '#526a64', fontSize: 13, lineHeight: 1.55 }}>Questions about a dog or a next step? We read every note.</p><Link href="/contact" className="btn btn-dark" data-testid="link-footer-contact">Contact the team <ArrowRight size={14} /></Link></div>
  </div><div className="container footer-bottom"><span>© 2025 SaveStreet Dogs · Demo organization content</span><span>Built for kind, informed action.</span></div></footer>;
}

function Shell({ children, cart, setCart }: { children: ReactNode; cart: CartLine[]; setCart: Dispatch<SetStateAction<CartLine[]>> }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutNotice, setCheckoutNotice] = useState(false);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const changeQuantity = (id: string, delta: number) => setCart(items => items.map(item => item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter(item => item.quantity > 0));
  useEffect(() => {
    if (!cartOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setCartOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.classList.add('cart-open');
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('cart-open');
    };
  }, [cartOpen]);

  return <div className="site-shell"><Loader /><Header cartCount={cartCount} onCart={() => { setCheckoutNotice(false); setCartOpen(true); }} />{children}<Footer />
    <nav className="mobile-quick-actions" aria-label="Quick actions"><Link href="/rescue"><Stethoscope size={16} />Report</Link><Link href="/adopt"><Heart size={16} />Adopt</Link><Link href="/donate"><Heart size={16} />Donate</Link></nav>
    <div className={`drawer-backdrop ${cartOpen ? 'open' : ''}`} onClick={() => setCartOpen(false)} />
    <aside className={`cart-drawer ${cartOpen ? 'open' : ''}`} aria-label="Shopping cart" aria-hidden={!cartOpen} aria-modal="true" role="dialog">
      <div className="drawer-head"><h2>Your cart</h2><button className="icon-btn" onClick={() => setCartOpen(false)} aria-label="Close cart" data-testid="button-close-cart"><X size={18} /></button></div>
      {cart.length === 0 ? <div className="empty-state" style={{ marginTop: 24 }}><ShoppingBag size={27} /><p>Your cart is waiting for something kind.</p><Link href="/products" className="btn btn-ghost" onClick={() => setCartOpen(false)} data-testid="link-empty-cart">Browse the shop</Link></div> : <><div className="cart-items">{cart.map(item => <div className="cart-row" key={item.id} data-testid={`row-cart-${item.id}`}><div className="cart-thumb"><PawPrint size={20} /></div><div><strong>{item.name}</strong><small>${item.price.toFixed(2)} each</small><div className="qty"><button onClick={() => changeQuantity(item.id, -1)} aria-label={`Decrease ${item.name}`} data-testid={`button-decrease-${item.id}`}><Minus size={12} /></button><span data-testid={`text-quantity-${item.id}`}>{item.quantity}</span><button onClick={() => changeQuantity(item.id, 1)} aria-label={`Increase ${item.name}`} data-testid={`button-increase-${item.id}`}><Plus size={12} /></button></div></div><button className="icon-btn" style={{ width: 30, height: 30 }} onClick={() => setCart(items => items.filter(line => line.id !== item.id))} aria-label={`Remove ${item.name}`} data-testid={`button-remove-${item.id}`}><X size={14} /></button></div>)}</div><div className="drawer-total"><div className="drawer-total-line"><span>Estimated total</span><strong>${total.toFixed(2)}</strong></div>{checkoutNotice && <div className="notice success" role="status" data-testid="status-checkout-placeholder"><Check size={16} /> Checkout is not connected yet. No payment was processed and no order was placed.</div>}<button className="btn btn-dark" style={{ width: '100%' }} onClick={() => setCheckoutNotice(true)} data-testid="button-checkout-placeholder">Continue to checkout <ArrowRight size={15} /></button><p style={{ color: '#7d8982', fontSize: 11, lineHeight: 1.45, marginTop: 12 }}>Demo checkout only. Payment is not processed on this site.</p></div></>}
    </aside>
  </div>;
}

function Home() {
  return <><Meta title="Street by street" description="SaveStreet Dogs helps people turn concern for street dogs into simple, compassionate action." /><main>
    <section className="hero"><div className="reveal"><div className="eyebrow">Community care for street dogs</div><h1>Small actions.<br /><em>Real chances.</em></h1><p className="hero-copy">A dog on the roadside can change the shape of your day. We make the next step clearer — report an injury, open your home, learn what helps.</p><div className="hero-actions"><Link href="/rescue" className="btn btn-primary" data-testid="link-hero-rescue">Report a dog <ArrowRight size={16} /></Link><Link href="/puppies" className="btn btn-ghost" data-testid="link-hero-puppies">Meet the puppies</Link></div><div className="hero-note"><ShieldCheck size={15} /> Clear guidance. Respectful care. Demo organization content.</div></div><div className="hero-art reveal delay-2"><img className="hero-photo" src={dogImages.hero} alt="A calm tan dog looking toward the camera outdoors" /><div className="art-sticker"><PawPrint size={24} /><span>Every paw<br />deserves<br />a chance</span></div><div className="art-label">FIELD NOTE 01 / NOTICE THE UNNOTICED</div></div></section>
    <div className="band"><div className="container band-inner"><strong>Start where you are.</strong><p>One form. One conversation. One bowl of water can be the beginning.</p><Link href="/learn" className="btn btn-dark" data-testid="link-band-learn">What helps most <ArrowRight size={14} /></Link></div></div>
    <section className="section container"><div className="section-head"><div><div className="eyebrow">Choose your next step</div><h2>Care is a practice,<br />not a perfect moment.</h2></div><p className="section-intro">You do not need to know everything to help. Pick the path that fits what you can offer today.</p></div><div className="action-grid"><Link href="/rescue" className="action-card primary" data-testid="card-action-rescue"><div><Stethoscope size={25} /><h3>There is a dog who needs help</h3><p>Tell us what you see. A clear report gives the right people a place to begin.</p></div><span className="arrow"><ArrowRight size={17} /></span></Link><Link href="/foster" className="action-card sage" data-testid="card-action-foster"><div><Heart size={24} /><h3>I can open my home</h3><p>Even a temporary landing place makes recovery possible.</p></div><span className="arrow"><ArrowRight size={17} /></span></Link><Link href="/volunteer" className="action-card cream" data-testid="card-action-volunteer"><div><UserRound size={24} /><h3>I have time to give</h3><p>Good work is built by neighbors who show up steadily.</p></div><span className="arrow"><ArrowRight size={17} /></span></Link></div></section>
    <section className="section container"><div className="split"><img className="split-photo" src={dogImages.calm} alt="A rescued dog resting in soft daylight" /><div><div className="eyebrow">A slower kind of change</div><div className="quote-mark">“</div><p className="quote">Every Paw Deserves a Chance.</p><p className="section-intro">We believe the most trustworthy rescue work is specific and patient: listen first, offer realistic choices, and keep the dog’s dignity at the center.</p><ul className="check-list"><li><Check size={17} /> Practical guidance before big promises</li><li><Check size={17} /> Adoption that considers the whole household</li><li><Check size={17} /> A community built for the long haul</li></ul><Link href="/about" className="btn btn-ghost" data-testid="link-home-about">How we work <ArrowRight size={15} /></Link></div></div></section>
    <section className="story-strip"><div className="container"><div className="section-head"><div><div className="eyebrow" style={{ color: '#e9a050' }}>From the field journal</div><h2>Hope has a face.</h2></div><Link href="/stories" className="btn btn-light" data-testid="link-home-stories">Read all stories <ArrowRight size={14} /></Link></div><div className="story-grid">{[['A quiet place to land', dogImages.portrait, 'Foster notes / illustrative story'], ['The first warm meal', dogImages.small, 'Care notes / illustrative story'], ['Finding the right yes', dogImages.brown, 'Adoption notes / illustrative story']].map(([title, image, label], index) => <article className="story-card" key={title}><img src={image} alt={`${title} — dog story`} /><div className="eyebrow" style={{ color: '#b9c9c0' }}>{label}</div><h3>{title}</h3><p>Small details matter when a dog is learning that people can be safe, predictable, and kind.</p><Link href="/stories" data-testid={`link-story-preview-${index}`}>Read the note <ArrowRight size={13} /></Link></article>)}</div></div></section>
    <section className="section container" style={{ paddingBottom: 90 }}><div className="split"><div><div className="eyebrow">Stay in the loop</div><h2>A kinder internet for street dogs.</h2><p className="section-intro" style={{ marginTop: 20 }}>Occasional field notes, practical guides, and dogs looking for their next chapter. No noise. Unsubscribe anytime.</p><Newsletter /></div><div className="aside-note"><Leaf size={28} color="#e9a050" /><h3>Bring your care with you.</h3><p>Keep our rescue checklist close for the next time you find a dog who needs a calm, considered response.</p><Link href="/learn" className="btn btn-primary" data-testid="link-home-checklist">Read the checklist <ArrowRight size={15} /></Link></div></div></section>
  </main></>;
}

function Newsletter() {
  const [status, setStatus] = useState('');
  return <form onSubmit={(event) => { event.preventDefault(); setStatus('You’re on the list. Watch your inbox for a welcome note.'); }}><div className="search" style={{ borderRadius: 10, width: '100%' }}><input type="email" required placeholder="you@example.com" aria-label="Email address" data-testid="input-newsletter-email" /><button className="btn btn-primary" type="submit" style={{ minHeight: 35, padding: '0 13px' }} data-testid="button-newsletter-submit"><Send size={15} /></button></div>{status && <div className="notice success" style={{ marginTop: 12 }} data-testid="status-newsletter">{status}</div>}</form>;
}

function PageHeader({ eyebrow, title, text }: { eyebrow: string; title: ReactNode; text: string }) {
  return <section className="page-header"><div className="container page-header-inner"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1></div><p>{text}</p></div></section>;
}

function Puppies() {
  const [search, setSearch] = useState('');
  const [size, setSize] = useState('All sizes');
  const filtered = puppies.filter(puppy => `${puppy.name} ${puppy.trait}`.toLowerCase().includes(search.toLowerCase()) && (size === 'All sizes' || puppy.size === size));
  return <><Meta title="Meet the puppies" description="Browse illustrative adoptable puppy profiles and learn about the responsible adoption process." /><main><PageHeader eyebrow="Adoptable, with care" title={<>Meet your<br /><em>maybe-dog.</em></>} text="These illustrative profiles show the kind of information we share so a good match can begin with curiosity, not impulse." /><section className="content-section container"><div className="toolbar"><div><div className="eyebrow">Sample profiles</div><p style={{ color: '#526a64', fontSize: 13, margin: '8px 0 0' }}>Availability changes quickly. Every profile is demo content.</p></div><div className="filter-row"><div className="search"><Search size={16} /><input value={search} onChange={event => setSearch(event.target.value)} type="search" placeholder="Search by name or trait" aria-label="Search puppies" data-testid="input-search-puppies" /></div><select className="select" value={size} onChange={event => setSize(event.target.value)} aria-label="Filter by size" data-testid="select-puppy-size"><option>All sizes</option><option>Small</option><option>Medium</option><option>Large</option></select></div></div>{filtered.length ? <div className="puppy-grid">{filtered.map(puppy => <article className="puppy-card" key={puppy.id} data-testid={`card-puppy-${puppy.id}`}><img src={puppy.image} alt={`${puppy.name}, illustrative adoptable dog profile`} /><div className="card-body"><div className="card-top"><h2 className="card-title">{puppy.name}</h2><span className="tag">{puppy.trait}</span></div><p>{puppy.text}</p><div className="meta"><span>{puppy.age}</span><span>{puppy.size}</span></div><div className="card-actions"><Link href={`/puppies/${puppy.id}`} className="btn btn-ghost" data-testid={`link-puppy-profile-${puppy.id}`}>View profile <ArrowRight size={14} /></Link><Link href="/adopt" className="btn btn-dark" data-testid={`link-puppy-adopt-${puppy.id}`}>Ask about adoption <ArrowRight size={14} /></Link></div></div></article>)}</div> : <div className="empty-state" data-testid="empty-puppies"><Search size={28} /><h3>No profiles match that search.</h3><p>Try a different name, trait, or size.</p><button className="btn btn-ghost" onClick={() => { setSearch(''); setSize('All sizes'); }} data-testid="button-reset-puppies">Reset filters</button></div>}</section></main></>;
}

function PuppyProfile() {
  const [, params] = useRoute('/puppies/:id');
  const puppy = puppies.find(item => item.id === params?.id);
  if (!puppy) return <NotFound />;
  return <><Meta title={`${puppy.name}'s profile`} description={`Learn about ${puppy.name}, an illustrative SaveStreet Dogs puppy profile.`} /><main><PageHeader eyebrow="A closer look" title={<>{puppy.name}<br /><em>could be your next hello.</em></>} text="This is an illustrative profile. Availability, health information, and adoption decisions should always be confirmed with the care team." /><section className="content-section container"><div className="profile-layout"><img className="profile-photo" src={puppy.image} alt={`${puppy.name}, illustrative adoptable dog profile`} /><div className="profile-copy"><div className="tag">{puppy.trait}</div><h2>{puppy.name} is waiting for the right kind of yes.</h2><p>{puppy.text}</p><div className="meta profile-meta"><span>{puppy.age}</span><span>{puppy.size}</span><span>Demo profile</span></div><div className="profile-actions"><Link href="/adopt" className="btn btn-primary">Ask about adoption <ArrowRight size={15} /></Link><Link href="/foster" className="btn btn-ghost">Explore fostering <ArrowRight size={15} /></Link></div><div className="notice success"><ShieldCheck size={16} /> Medical details and placement information are shared only after a human review.</div></div></div></section></main></>;
}

function FormPage({ kind }: { kind: 'rescue' | 'adopt' | 'foster' | 'volunteer' | 'contact' }) {
  const config = {
    rescue: { eyebrow: 'First, stay calm', title: <>Report a dog.<br /><em>Start with what you see.</em></>, text: 'A clear, current report helps a care team decide what is safe and useful next. If there is immediate danger, contact local emergency services first.', heading: 'Dog report', button: 'Send report', fields: ['Your first name', 'Email for follow-up', 'Where is the dog?', 'What do you notice?'] },
    adopt: { eyebrow: 'A thoughtful yes', title: <>Adoption starts<br /><em>before hello.</em></>, text: 'The right home is about fit, not speed. Share a little about your household and we will help you understand the next conversation.', heading: 'Adoption enquiry', button: 'Begin enquiry', fields: ['Your first name', 'Email for follow-up', 'Which dog are you asking about?', 'Tell us about your household'] },
    foster: { eyebrow: 'A temporary home is a real home', title: <>Make room<br /><em>for a new start.</em></>, text: 'Fostering gives a dog time to decompress, heal, and show their personality. We provide guidance for each placement.', heading: 'Foster interest', button: 'Share my interest', fields: ['Your first name', 'Email for follow-up', 'Your city or region', 'What would fostering look like for you?'] },
    volunteer: { eyebrow: 'Your time has shape', title: <>Help in the<br /><em>in-between.</em></>, text: 'There are many ways to be useful: transport, careful admin, event support, photography, or simply being a steady pair of hands.', heading: 'Volunteer interest', button: 'Raise my hand', fields: ['Your first name', 'Email for follow-up', 'What kind of help interests you?', 'A note for the team'] },
    contact: { eyebrow: 'We are listening', title: <>Questions are<br /><em>welcome here.</em></>, text: 'Tell us what you need and we will point you toward the clearest next step. Please do not include sensitive personal information.', heading: 'Send a note', button: 'Send message', fields: ['Your first name', 'Email for follow-up', 'Subject', 'Your message'] },
  }[kind];
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      setStatus('error');
      form.reportValidity();
      return;
    }
    setStatus('idle');
    setIsSubmitting(true);
    window.setTimeout(() => {
      setIsSubmitting(false);
      setStatus('success');
      form.reset();
    }, 650);
  };
  return <><Meta title={config.heading} description={config.text} /><main><PageHeader eyebrow={config.eyebrow} title={config.title} text={config.text} /><section className="content-section container"><div className="form-layout"><form className="form-card" onSubmit={handleSubmit} noValidate={false} aria-label={config.heading}>{status === 'success' && <div className="notice success" role="status" data-testid="status-form-success"><Check size={16} /> Thank you. Your note is in the demo inbox; no personal data was sent or stored.</div>}{status === 'error' && <div className="notice error" role="alert" data-testid="status-form-error">Please complete the required fields so we can understand the next step.</div>}<h2 style={{ margin: '0 0 24px', font: '700 30px var(--app-font-serif)', color: '#173833' }}>{config.heading}</h2>{config.fields.map((field, index) => <div className="field" key={field}><label htmlFor={`${kind}-${index}`}>{field}{index < 3 ? ' *' : ''}</label>{index === 3 ? <textarea id={`${kind}-${index}`} required={index < 3} minLength={12} placeholder="A few thoughtful details help." data-testid={`textarea-${kind}-${index}`} /> : <input id={`${kind}-${index}`} type={field.includes('Email') ? 'email' : 'text'} required={index < 3} minLength={field.includes('Email') ? undefined : 2} placeholder={field.includes('Email') ? 'you@example.com' : 'Type here'} data-testid={`input-${kind}-${index}`} />}</div>)}{kind === 'rescue' && <><div className="field"><label htmlFor="rescue-category">What kind of help is needed? *</label><select id="rescue-category" required defaultValue="" data-testid="select-rescue-category"><option value="" disabled>Select one</option><option>Injured</option><option>Sick</option><option>Abandoned</option><option>Puppy in danger</option><option>Accident</option><option>Lost dog</option><option>Other</option></select></div><div className="field"><label htmlFor="rescue-urgency">Urgency *</label><select id="rescue-urgency" required defaultValue="" data-testid="select-rescue-urgency"><option value="" disabled>Select urgency</option><option>Normal</option><option>Important</option><option>Emergency</option></select></div><div className="field"><label htmlFor="rescue-photo">Photo, if safe to share</label><input id="rescue-photo" type="file" accept="image/jpeg,image/png,image/webp" data-testid="input-rescue-photo" /></div></>}{kind === 'adopt' && <div className="field checkbox-field"><label htmlFor="adopt-agreement"><input id="adopt-agreement" type="checkbox" required data-testid="checkbox-adopt-agreement" /> I understand adoption requires a human review.</label></div>}<button type="submit" className="btn btn-primary" disabled={isSubmitting} data-testid={`button-submit-${kind}`}>{isSubmitting ? 'Submitting…' : config.button} {!isSubmitting && <ArrowRight size={15} />}</button><p style={{ color: '#7d8982', fontSize: 11, lineHeight: 1.5, marginTop: 15 }}>Demo form: this experience does not transmit or store personal information.</p></form><aside className="aside-note"><ShieldCheck size={28} color="#e9a050" /><h3>Good information is kind information.</h3><p>Only share what is needed to help us understand the situation. Never share financial details, passwords, or another person’s private information here.</p><div className="steps"><div className="step" style={{ background: 'rgba(255,255,255,.06)', borderColor: '#4f6d64' }}><div className="step-number">01</div><div><h3 style={{ color: '#f8f1e7' }}>Tell us the useful bits</h3><p>Where, when, what you noticed.</p></div></div><div className="step" style={{ background: 'rgba(255,255,255,.06)', borderColor: '#4f6d64' }}><div className="step-number">02</div><div><h3 style={{ color: '#f8f1e7' }}>We make the next step clearer</h3><p>Guidance before assumptions.</p></div></div></div></aside></div></section></main></>;
}

function Products({ cart, setCart }: { cart: CartLine[]; setCart: Dispatch<SetStateAction<CartLine[]>> }) {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('Everything');
  const [sort, setSort] = useState('Featured');
  const [addedId, setAddedId] = useState<string | null>(null);
  const types = ['Everything', ...Array.from(new Set(products.map(product => product.type)))];
  const visible = useMemo(() => products.filter(product => (type === 'Everything' || product.type === type) && product.name.toLowerCase().includes(search.toLowerCase())).sort((a, b) => sort === 'Price: low to high' ? a.price - b.price : sort === 'Price: high to low' ? b.price - a.price : 0), [search, sort, type]);
  const add = (product: Product) => {
    setCart(items => {
      const found = items.find(item => item.id === product.id);
      return found ? items.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...items, { ...product, quantity: 1 }];
    });
    setAddedId(product.id);
    window.setTimeout(() => setAddedId(current => current === product.id ? null : current), 1400);
  };
  const Icon = ({ icon }: { icon: Product['icon'] }) => icon === 'leaf' ? <Leaf size={64} strokeWidth={1.2} /> : icon === 'heart' ? <Heart size={64} strokeWidth={1.2} /> : <PawPrint size={64} strokeWidth={1.2} />;
  return <><Meta title="The kind shop" description="Shop small goods that support the SaveStreet Dogs mission. Demo checkout only; payment is not processed." /><main><PageHeader eyebrow="The kind shop" title={<>Carry the<br /><em>message.</em></>} text="Small goods for people who believe street dogs belong in the circle of care. Every listing below is illustrative, and checkout does not process payment." /><section className="content-section container"><div className="toolbar"><div className="filter-row">{types.map(item => <button key={item} className={`chip ${type === item ? 'active' : ''}`} onClick={() => setType(item)} data-testid={`button-filter-${item.toLowerCase().replaceAll(' ', '-')}`}>{item}</button>)}</div><div className="filter-row"><div className="search"><Search size={16} /><input value={search} onChange={event => setSearch(event.target.value)} type="search" placeholder="Search the shop" aria-label="Search products" data-testid="input-search-products" /></div><select className="select" value={sort} onChange={event => setSort(event.target.value)} aria-label="Sort products" data-testid="select-sort-products"><option>Featured</option><option>Price: low to high</option><option>Price: high to low</option></select></div></div>{visible.length ? <div className="product-grid">{visible.map(product => <article className="product-card" key={product.id} data-testid={`card-product-${product.id}`}><Link href={`/products/${product.id}`} className={`product-art ${product.color}`} aria-label={`View details for ${product.name}`}><div className="product-icon"><Icon icon={product.icon} /></div></Link><div className="card-body"><div className="card-top"><Link href={`/products/${product.id}`} className="product-title-link"><h2 style={{ font: '700 25px var(--app-font-serif)', margin: 0 }}>{product.name}</h2></Link><span className="price">${product.price}</span></div><p>{product.type} · illustrative listing</p><button className="btn btn-dark" style={{ width: '100%' }} onClick={() => add(product)} data-testid={`button-add-${product.id}`}>{addedId === product.id ? <><Check size={15} /> Added to cart</> : <>Add to cart <Plus size={15} /></>}</button></div></article>)}</div> : <div className="empty-state" data-testid="empty-products"><Search size={28} /><h3>No goods found.</h3><p>Try a different search or category.</p></div>}<div className="notice success" style={{ marginTop: 30 }}><Truck size={16} /> Checkout is a future-ready placeholder. No payment is collected, and no order is placed.</div></section></main></>;
}

function ProductDetail({ setCart }: { setCart: Dispatch<SetStateAction<CartLine[]>> }) {
  const [, params] = useRoute('/products/:id');
  const product = products.find(item => item.id === params?.id);
  const [added, setAdded] = useState(false);
  if (!product) return <NotFound />;
  const Icon = product.icon === 'leaf' ? Leaf : product.icon === 'heart' ? Heart : PawPrint;
  const add = () => {
    setCart(items => {
      const found = items.find(item => item.id === product.id);
      return found ? items.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...items, { ...product, quantity: 1 }];
    });
    setAdded(true);
  };
  return <><Meta title={product.name} description={`Illustrative product details for ${product.name} from the SaveStreet Dogs kind shop.`} /><main><PageHeader eyebrow="The kind shop" title={<>A small thing<br /><em>with a bigger circle.</em></>} text="Every listing is illustrative. The future checkout will clearly explain availability, shipping, and payment before anything is collected." /><section className="content-section container"><div className="product-detail"><div className={`product-art ${product.color}`}><div className="product-icon"><Icon size={100} strokeWidth={1.1} /></div></div><div className="product-detail-copy"><div className="eyebrow">{product.type}</div><h2>{product.name}</h2><div className="price detail-price">${product.price}</div><p>A considered, illustrative item for people who want to carry the message of practical care with them. Product fulfillment and payment are not connected yet.</p><div className="detail-actions"><button className="btn btn-primary" onClick={add}>{added ? <><Check size={15} /> Added to cart</> : <>Add to cart <Plus size={15} /></>}</button><Link href="/products" className="btn btn-ghost">Back to shop <ArrowRight size={15} /></Link></div>{added && <div className="notice success" role="status"><Check size={16} /> Added to your demo cart. Nothing has been purchased.</div>}</div></div></section></main></>;
}

function Donate() {
  const [selected, setSelected] = useState('25');
  const [submitted, setSubmitted] = useState(false);
  return <><Meta title="Give support" description="Learn how to support compassionate street-dog care. Donation processing is not yet available." /><main><PageHeader eyebrow="Keep care moving" title={<>Give what<br /><em>you can.</em></>} text="A future donation flow will make it easier to support local care. For now, this is a transparent preview — no payment details are requested and no donation is processed." /><section className="content-section container"><div className="form-layout"><div className="form-card"><div className="eyebrow">Donation preview</div><h2 style={{ font: '700 36px var(--app-font-serif)', color: '#173833', margin: '13px 0' }}>Choose a starting point.</h2><p style={{ color: '#526a64', fontSize: 14, lineHeight: 1.6 }}>Select an illustrative amount to see the shape of the future flow. This button will not charge you.</p><div className="filter-row" style={{ margin: '25px 0' }}>{['10', '25', '50', 'Other'].map(amount => <button key={amount} className={`chip ${selected === amount ? 'active' : ''}`} onClick={() => setSelected(amount)} data-testid={`button-donation-${amount.toLowerCase()}`}>{amount === 'Other' ? amount : `$${amount}`}</button>)}</div><button className="btn btn-primary" onClick={() => setSubmitted(true)} data-testid="button-donation-preview">Preview future donation flow <ArrowRight size={15} /></button>{submitted && <div className="notice success" style={{ marginTop: 18 }} role="status" data-testid="status-donation-placeholder"><Check size={16} /> Thanks for exploring. Payment is not connected yet, so nothing was processed.</div>}</div><aside className="aside-note"><Heart size={28} color="#e9a050" /><h3>Trust is part of the work.</h3><p>When giving is available, you will see clear information about where support can go, what is illustrative, and what is still being built.</p><Link href="/about" className="btn btn-primary" data-testid="link-donation-about">Our approach <ArrowRight size={15} /></Link></aside></div></section></main></>;
}

function Learn() {
  const guides = [
    { title: 'You found a dog', text: 'What to do first, what not to do, and how to observe without escalating a stressful moment.', Icon: Stethoscope },
    { title: 'A safer bowl of water', text: 'Small, practical ways to offer help while respecting distance and safety.', Icon: Leaf },
    { title: 'Thinking about adoption', text: 'A short look at capacity, introductions, costs, and the kind of yes that lasts.', Icon: Heart },
    { title: 'How fostering works', text: 'The questions to ask before opening your door — and why temporary care matters.', Icon: ShieldCheck },
  ];
  const [openGuide, setOpenGuide] = useState<string | null>(null);
  return <><Meta title="Learn what helps" description="Practical, calm guides for helping street dogs safely and responsibly." /><main><PageHeader eyebrow="A little knowledge helps" title={<>Learn the<br /><em>next right thing.</em></>} text="Rescue is full of unknowns. These short guides are designed to help you pause, notice, and choose a safer next step." /><section className="content-section container"><div className="steps">{guides.map((guide, index) => { const GuideIcon = guide.Icon; const isOpen = openGuide === guide.title; return <article className="step" key={guide.title}><div className="step-number">0{index + 1}</div><div style={{ flex: 1 }}><GuideIcon size={22} color="#c46d51" /><h2 style={{ font: '700 30px var(--app-font-serif)', color: '#173833', margin: '10px 0 7px' }}>{guide.title}</h2><p style={{ maxWidth: 600 }}>{guide.text}</p><button className="btn btn-ghost" style={{ marginTop: 17 }} aria-expanded={isOpen} onClick={() => setOpenGuide(isOpen ? null : guide.title)} data-testid={`button-guide-${index}`}>{isOpen ? 'Close guide' : 'Read the guide'} <ArrowRight size={14} /></button>{isOpen && <div className="detail-note" role="region">This educational preview will be expanded with practical, safety-reviewed guidance before launch. If a dog is injured or you feel unsafe, keep your distance and contact local emergency services or a qualified animal-care group.</div>}</div></article>; })}</div></section></main></>;
}

function Stories() {
  const stories = [
    { title: 'A quiet place to land', image: dogImages.portrait, label: 'Foster notes' },
    { title: 'The first warm meal', image: dogImages.small, label: 'Care notes' },
    { title: 'Finding the right yes', image: dogImages.brown, label: 'Adoption notes' },
    { title: 'The long way home', image: dogImages.hero, label: 'Neighbourhood notes' },
    { title: 'Learning the leash', image: dogImages.puppy, label: 'Training notes' },
    { title: 'A person who noticed', image: dogImages.calm, label: 'Community notes' },
  ];
  const [openStory, setOpenStory] = useState<string | null>(null);
  return <><Meta title="Field stories" description="Illustrative field notes about the patient, practical work of helping street dogs." /><main><PageHeader eyebrow="Field notes" title={<>The stories<br /><em>stay with us.</em></>} text="Real rescue work is made of ordinary moments. These clearly labeled illustrative notes explore what care can look like without turning animals into before-and-after content." /><section className="content-section container"><div className="story-grid" style={{ color: '#173833' }}>{stories.map((story, index) => { const isOpen = openStory === story.title; return <article className="story-card" style={{ borderColor: '#dcd4c6' }} key={story.title}><img src={story.image} alt={`${story.title}, illustrative story`} /><div className="eyebrow">{story.label} · demo content</div><h2 style={{ color: '#173833' }}>{story.title}</h2><p style={{ color: '#526a64' }}>A short, illustrative note about the details that help trust grow: time, routine, and one person willing to pay attention.</p><button className="btn btn-ghost" style={{ marginTop: 17 }} aria-expanded={isOpen} onClick={() => setOpenStory(isOpen ? null : story.title)} data-testid={`button-story-${index}`}>{isOpen ? 'Close the note' : 'Read the note'} <ArrowRight size={14} /></button>{isOpen && <div className="detail-note" role="region">This is illustrative content while the story archive is being prepared. Future stories will be shared with consent, context, and care for the animals involved.</div>}</article>; })}</div></section></main></>;
}

function About() {
  return <><Meta title="About SaveStreet Dogs" description="Meet the values behind SaveStreet Dogs, a presentation-first animal-welfare platform." /><main><PageHeader eyebrow="Why we are here" title={<>Make care<br /><em>easier to enter.</em></>} text="SaveStreet Dogs is a demo organization built around a simple idea: concern becomes more useful when people have a clear, respectful next step." /><section className="section container"><div className="split"><div><div className="eyebrow">The promise</div><p className="quote">No grand gestures required. Just a better way in.</p><p className="section-intro">We center dignity, informed consent, and realistic commitments. That means honest labels, no inflated claims, and room for people to help in different ways.</p></div><div className="aside-note"><BookOpen size={28} color="#e9a050" /><h3>Our working principles.</h3><div className="steps"><div className="step" style={{ background: 'rgba(255,255,255,.06)', borderColor: '#4f6d64' }}><div className="step-number">01</div><div><h3 style={{ color: '#f8f1e7' }}>Notice before acting</h3><p>Observation is a form of care.</p></div></div><div className="step" style={{ background: 'rgba(255,255,255,.06)', borderColor: '#4f6d64' }}><div className="step-number">02</div><div><h3 style={{ color: '#f8f1e7' }}>Make room for complexity</h3><p>Every dog and household is different.</p></div></div></div></div></div></section><section className="band"><div className="container band-inner"><strong>Every Paw Deserves a Chance.</strong><Link href="/rescue" className="btn btn-dark" data-testid="link-about-action">Take a practical next step <ArrowRight size={15} /></Link></div></section></main></>;
}

function AppContent() {
  const [cart, setCart] = useState<CartLine[]>([]);
  return <Shell cart={cart} setCart={setCart}><Switch><Route path="/" component={Home} /><Route path="/puppies/:id" component={PuppyProfile} /><Route path="/puppies" component={Puppies} /><Route path="/rescue" component={() => <FormPage kind="rescue" />} /><Route path="/adopt" component={() => <FormPage kind="adopt" />} /><Route path="/products/:id" component={() => <ProductDetail setCart={setCart} />} /><Route path="/products" component={() => <Products cart={cart} setCart={setCart} />} /><Route path="/donate" component={Donate} /><Route path="/volunteer" component={() => <FormPage kind="volunteer" />} /><Route path="/foster" component={() => <FormPage kind="foster" />} /><Route path="/stories" component={Stories} /><Route path="/learn" component={Learn} /><Route path="/about" component={About} /><Route path="/contact" component={() => <FormPage kind="contact" />} /><Route component={NotFound} /></Switch></Shell>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><ErrorBoundary><AppContent /></ErrorBoundary><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;