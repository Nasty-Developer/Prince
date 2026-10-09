import { lazy, Suspense, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, Check, Heart, Menu, Minus, PawPrint, Search, Send, ShieldCheck, ShoppingBag, Stethoscope, UserRound, X, MessageCircle, Instagram, Facebook, BookOpen } from "lucide-react";
import { Link, Route, Switch, useLocation, useRoute } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  getGetProductQueryKey,
  getGetPuppyQueryKey,
  getListProductsQueryKey,
  getListPuppiesQueryKey,
  useGetProduct,
  useGetPuppy,
  useListProducts,
  useListPuppies,
} from "@workspace/api-client-react";
import type { Product, Puppy } from "@workspace/api-client-react";
import NotFound from "@/pages/not-found";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FirebaseAuthProvider, useFirebaseAuth } from "@/lib/auth-context";
import { storageImageUrl, storefrontJson } from "@/storefront/api";
import { ContactActionLinks, WhatsAppAction } from "@/components/site-contact-actions";
import { SAVE_STREET_DOGS_LOGO } from "@/lib/brand";
import {
  CONTACT_MESSAGES,
  SiteContactProvider,
  makeEmailComposerHref,
  makeEmailHref,
  orderQuestionMessage,
  productQuestionMessage,
  puppyAdoptionMessage,
  useSiteContact,
} from "@/lib/site-contact";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 500,
      refetchOnWindowFocus: false,
    },
  },
});
const AuthPage = lazy(() => import("@/components/auth-page"));
const AdminApp = lazy(() => import("@/admin"));
const OrderTrackingPage = lazy(() => import("@/storefront/OrderTrackingPage"));
const LearnPage = lazy(() => import("@/learn/Stories").then((pages) => ({ default: pages.LearnPage })));
const StoriesPage = lazy(() => import("@/learn/Stories").then((pages) => ({ default: pages.StoriesPage })));
const StoryDetailPage = lazy(() => import("@/learn/Stories").then((pages) => ({ default: pages.StoryDetailPage })));
const dogImages = {
  hero: (width: number) => `https://images.pexels.com/photos/1254140/pexels-photo-1254140.jpeg?auto=compress&cs=tinysrgb&w=${width}&q=78`,
  calm: (width: number) => `https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=${width}&q=78`,
};
const collarImages = [`${import.meta.env.BASE_URL}assets/reflective-collar-color-options.jpg`, `${import.meta.env.BASE_URL}assets/reflective-collars-red-yellow.jpg`];
const productImages = (product: Product) => product.name.toLowerCase().includes("reflective collar") ? collarImages : product.imageUrls.map((image) => storageImageUrl(image)).filter((image): image is string => Boolean(image));
type CartLine = Product & { quantity: number };
const money = (rupees: number) => `₹${rupees.toFixed(0)}`;
const api = <T,>(path: string, init?: RequestInit) => storefrontJson<T>(path, init);

function Meta({ title, description }: { title: string; description: string }) {
  useEffect(() => {
    document.title = `${title} · SaveStreet Dogs`;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  }, [title, description]);
  return null;
}
function PageHeader({ eyebrow, title, text }: { eyebrow: string; title: ReactNode; text: string }) {
  return <section className="page-header"><div className="container page-header-inner"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1></div><p>{text}</p></div></section>;
}
function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return <div className="empty-state"><PawPrint size={28} /><h3>{title}</h3><p>{text}</p>{action}</div>;
}
function RouteLoading({ label }: { label: string }) {
  return <main><section className="content-section container"><div className="empty-state" role="status">Loading {label}…</div></section></main>;
}
function AdminRoute() {
  return <Suspense fallback={<RouteLoading label="admin tools" />}><AdminApp /></Suspense>;
}
function AuthRoute({ mode }: { mode: "signin" | "signup" | "reset" | "admin" }) {
  return <Suspense fallback={<RouteLoading label="sign-in" />}><AuthPage mode={mode} /></Suspense>;
}
function Header({ cartCount, onCart }: { cartCount: number; onCart: () => void }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { user, signOut } = useFirebaseAuth();
  const items = [["/puppies", "Find a puppy"], ["/rescue", "Report a dog"], ["/adopt", "Adoption"], ["/products", "Shop"], ["/stories", "Stories"], ["/learn", "Learn"]];
  return (
    <header>
      <div className="topline">Street by street. Paw by paw. Saving lives.</div>
      <div className="nav-wrap">
        <nav className="nav">
          <Link href="/" className="brand" aria-label="SaveStreet Dogs home">
            <img className="brand-logo" src={SAVE_STREET_DOGS_LOGO} alt="SaveStreet Dogs" width="504" height="336" decoding="async" />
          </Link>
          <div className="nav-links">{items.map(([href, label]) => <Link key={href} href={href} className={location === href ? "active" : ""}>{label}</Link>)}</div>
          <div className="nav-actions">
            {user ? <button className="nav-auth" onClick={() => void signOut()}>Sign out</button> : <Link href="/login" className="nav-auth">Sign in</Link>}
            <Link href="/donate" className="btn btn-primary">Give support <Heart size={15} /></Link>
            <button className="icon-btn" aria-label={`Open cart, ${cartCount} items`} onClick={onCart}><ShoppingBag size={18} /></button>
            <button className="icon-btn menu-toggle" onClick={() => setOpen(!open)} aria-label="Open menu">{open ? <X size={19} /> : <Menu size={19} />}</button>
          </div>
        </nav>
        {open && <div className="mobile-menu open">{[["/", "Home"], ...items, ["/volunteer", "Volunteer"], ["/foster", "Foster"], ["/admin", "Admin"]].map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}<ArrowRight size={14} /></Link>)}</div>}
      </div>
    </header>
  );
}
function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link href="/" className="brand" aria-label="SaveStreet Dogs home">
            <img className="brand-logo footer-logo" src={SAVE_STREET_DOGS_LOGO} alt="SaveStreet Dogs" width="504" height="336" loading="lazy" decoding="async" />
          </Link>
          <p>Practical care, patient homes, and a community that notices the dog at the edge of the road.</p>
          <p className="eyebrow">Every Paw Deserves a Chance.</p>
        </div>
        <div><h4>Take action</h4><Link href="/rescue">Report a dog</Link><Link href="/adopt">Adopt responsibly</Link><Link href="/foster">Become a foster</Link><Link href="/volunteer">Volunteer</Link></div>
        <div><h4>Explore</h4><Link href="/puppies">Puppies</Link><Link href="/products">Shop</Link><Link href="/stories">Stories</Link><Link href="/learn">Learn</Link></div>
        <div>
          <h4>Stay close</h4>
          <p style={{ color: "#526a64", fontSize: 13 }}>Questions about a dog or a next step? We read every note.</p>
          <Link href="/contact" className="btn btn-dark">Contact the team <ArrowRight size={14} /></Link>
          <ContactActionLinks message={CONTACT_MESSAGES.general} variant="footer" />
          <div className="social-links" aria-label="Social media">
            <a href="https://www.instagram.com/savestreetdogs18/" target="_blank" rel="noopener noreferrer" aria-label="SaveStreet Dogs on Instagram"><Instagram size={17} /> Instagram</a>
            <a href="https://www.facebook.com/profile.php?id=61591879406906" target="_blank" rel="noopener noreferrer" aria-label="SaveStreet Dogs on Facebook"><Facebook size={17} /> Facebook</a>
          </div>
        </div>
      </div>
      <div className="container footer-bottom"><span>© 2026 SaveStreet Dogs</span><span>Built for kind, informed action.</span></div>
    </footer>
  );
}
function Shell({ children, cart, setCart }: { children: ReactNode; cart: CartLine[]; setCart: React.Dispatch<React.SetStateAction<CartLine[]>> }) {
  const [cartOpen, setCartOpen] = useState(false);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.quantity * item.priceRupees, 0);
  const change = (id: string, amount: number) => setCart((lines) => lines.map((line) => line.id === id ? { ...line, quantity: Math.max(0, line.quantity + amount) } : line).filter((line) => line.quantity));
  return <div className="site-shell"><Header cartCount={count} onCart={() => setCartOpen(true)} />{children}<Footer /><div className={`drawer-backdrop ${cartOpen ? "open" : ""}`} onClick={() => setCartOpen(false)} /><aside className={`cart-drawer ${cartOpen ? "open" : ""}`}><div className="drawer-head"><h2>Your cart</h2><button className="icon-btn" onClick={() => setCartOpen(false)}><X size={18} /></button></div>{!cart.length ? <EmptyState title="Your cart is waiting for something kind." text="Browse the shop to support the work." action={<Link href="/products" className="btn btn-ghost" onClick={() => setCartOpen(false)}>Browse the shop</Link>} /> : <><div className="cart-items">{cart.map((item) => { const image = storageImageUrl(item.imageUrls?.[0]); return <div className="cart-row" key={item.id}><div className="cart-thumb">{image ? <img src={image} alt="" loading="lazy" decoding="async" /> : <PawPrint size={20} />}</div><div><strong>{item.name}</strong><small>{money(item.priceRupees)} each</small><div className="qty"><button onClick={() => change(item.id, -1)}><Minus size={12} /></button><span>{item.quantity}</span><button onClick={() => change(item.id, 1)}>+</button></div></div></div>; })}</div><div className="drawer-total"><div className="drawer-total-line"><span>Estimated total</span><strong>{money(total)}</strong></div><Link href="/checkout" className="btn btn-dark" style={{ width: "100%" }} onClick={() => setCartOpen(false)}>Continue to checkout <ArrowRight size={15} /></Link><p style={{ color: "#7d8982", fontSize: 11 }}>Payment is collected after your order is reviewed.</p></div></>}</aside></div>;
}
function Home({ setCart }: { setCart: React.Dispatch<React.SetStateAction<CartLine[]>> }) {
  const products = useListProducts(undefined, { query: { queryKey: getListProductsQueryKey(), staleTime: 30_000 } });
  const collar = products.data?.find((product) => product.name.toLowerCase().includes("reflective collar"));
  const add = (product: Product) => setCart((lines) => lines.some((line) => line.id === product.id) ? lines.map((line) => line.id === product.id ? { ...line, quantity: line.quantity + 1 } : line) : [...lines, { ...product, quantity: 1 }]);
  return <><Meta title="Street by street" description="SaveStreet Dogs helps people turn concern for street dogs into simple, compassionate action." /><main>
    <section className="hero"><div className="reveal"><div className="eyebrow">Community care for street dogs</div><h1>Small actions.<br /><em>Real chances.</em></h1><p className="hero-copy">A dog on the roadside can change the shape of your day. We make the next step clearer — report an injury, open your home, learn what helps.</p><div className="hero-actions"><Link href="/rescue" className="btn btn-primary">Report a dog <ArrowRight size={16} /></Link><Link href="/puppies" className="btn btn-ghost">Meet the puppies</Link></div><div className="hero-note"><ShieldCheck size={15} /> Clear guidance. Respectful care.</div></div><div className="hero-art reveal delay-2"><img className="hero-photo" src={dogImages.hero(960)} srcSet={`${dogImages.hero(480)} 480w, ${dogImages.hero(960)} 960w`} sizes="(max-width: 760px) 80vw, 40vw" alt="A calm tan dog outdoors" loading="eager" fetchPriority="high" decoding="async" /><div className="art-sticker"><PawPrint size={24} /><span>Every paw<br />deserves<br />a chance</span></div></div></section>
    <section className="home-shop-section"><div className="container home-shop-inner"><div className="home-shop-heading"><span className="eyebrow">Useful things, chosen with care</span><h2>Shop for dogs.</h2><p>Practical gear for safer moments outside, selected from the live shop catalog.</p><Link className="btn btn-ghost" href="/products">Shop all products <ArrowRight size={14} /></Link></div>{products.isLoading && !products.data ? <div className="shop-feature-placeholder" role="status">Loading the live shop…</div> : products.error ? <div className="shop-feature-placeholder">The shop is temporarily unavailable. <button className="text-action" onClick={() => void products.refetch()}>Try again</button></div> : collar ? <article className="home-product-feature"><Link href={`/products/${collar.id}`} className="home-product-image" aria-label="View Reflective Collars">{collarImages.map((image, index) => <img src={image} alt={index === 0 ? "Reflective collars in several colors" : "Red and yellow reflective collars"} key={image} loading="lazy" />)}</Link><div className="home-product-copy"><div className="eyebrow">{collar.category || "Dog Accessories / Collars"}</div><h3>{collar.name}</h3><p>{collar.description}</p><strong className="home-product-price">{money(collar.priceRupees)} <small>/ piece</small></strong>{collar.stock === null && <p className="stock-note">Stock is not tracked; staff will confirm availability after your order request.</p>}<div className="hero-actions"><Link href={`/products/${collar.id}`} className="btn btn-dark">View product <ArrowRight size={14} /></Link><button className="btn btn-primary" onClick={() => add(collar)} disabled={collar.stock === 0 || !collar.available}>{collar.stock === 0 ? "Out of stock" : "Add to cart"} <ShoppingBag size={14} /></button></div></div></article> : <div className="shop-feature-placeholder">Reflective Collars are not currently listed in the live catalog. <Link href="/products">Visit the shop</Link></div>}</div></section>
    <div className="band"><div className="container band-inner"><strong>Start where you are.</strong><p>One form. One conversation. One bowl of water can be the beginning.</p><Link href="/learn" className="btn btn-dark">What helps most <ArrowRight size={14} /></Link></div></div>
    <section className="section container"><div className="section-head"><div><div className="eyebrow">Choose your next step</div><h2>Care is a practice,<br />not a perfect moment.</h2></div><p className="section-intro">You do not need to know everything to help. Pick the path that fits what you can offer today.</p></div><div className="action-grid"><Link href="/rescue" className="action-card primary"><div><Stethoscope size={25} /><h3>There is a dog who needs help</h3><p>Tell us what you see. A clear report gives the right people a place to begin.</p></div><span className="arrow"><ArrowRight size={17} /></span></Link><Link href="/foster" className="action-card sage"><div><Heart size={24} /><h3>I can open my home</h3><p>Even a temporary landing place makes recovery possible.</p></div><span className="arrow"><ArrowRight size={17} /></span></Link><Link href="/volunteer" className="action-card cream"><div><UserRound size={24} /><h3>I have time to give</h3><p>Good work is built by neighbors who show up steadily.</p></div><span className="arrow"><ArrowRight size={17} /></span></Link></div></section><section className="section container"><div className="split"><img className="split-photo" src={dogImages.calm(800)} srcSet={`${dogImages.calm(480)} 480w, ${dogImages.calm(800)} 800w`} sizes="(max-width: 760px) 100vw, 50vw" alt="A dog resting outdoors" loading="lazy" decoding="async" /><div><div className="eyebrow">A slower kind of change</div><div className="quote-mark">“</div><p className="quote">Every Paw Deserves a Chance.</p><p className="section-intro">We believe the most trustworthy rescue work is specific and patient: listen first, offer realistic choices, and keep the dog’s dignity at the center.</p><Link href="/about" className="btn btn-ghost">How we work <ArrowRight size={15} /></Link></div></div></section></main></>;
}
function Puppies() {
  const [search, setSearch] = useState(""); const [size, setSize] = useState("");
  const params = { search: search || undefined, size: size || undefined };
  const query = useListPuppies(
    params,
    { query: { queryKey: getListPuppiesQueryKey(params), staleTime: 30_000 } },
  );
  return <><Meta title="Meet the puppies" description="Browse current SaveStreet Dogs puppy profiles." /><main><PageHeader eyebrow="Adoptable, with care" title={<>Meet your<br /><em>maybe-dog.</em></>} text="Current profiles come from the care team. Availability changes as dogs move through care and adoption." /><section className="content-section container"><div className="toolbar"><div><div className="eyebrow">Current profiles</div><p style={{ color: "#526a64", fontSize: 13 }}>No profile is published until the team adds it in Admin.</p></div><div className="filter-row"><div className="search"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or temperament" /></div><select className="select" value={size} onChange={(e) => setSize(e.target.value)}><option value="">All sizes</option><option>Small</option><option>Medium</option><option>Large</option></select></div></div>{query.error && <div className="notice error" role="alert">We couldn’t refresh profiles. <button className="btn btn-ghost" onClick={() => query.refetch()}>Try again</button></div>}{query.isLoading && !query.data ? <div className="empty-state" role="status">Loading current profiles…</div> : query.data?.length ? <div className="puppy-grid">{query.data.map((puppy) => <PuppyCard puppy={puppy} key={puppy.id} />)}</div> : query.error ? <EmptyState title="Profiles are temporarily unavailable." text="Please try again in a moment." action={<button className="btn btn-ghost" onClick={() => query.refetch()}>Try again</button>} /> : <EmptyState title="No puppies are currently listed." text="The care team has not published an available profile yet. Check back soon or report a dog who needs help." action={<Link href="/rescue" className="btn btn-primary">Report a dog <ArrowRight size={14} /></Link>} />}</section></main></>;
}
function PuppyCard({ puppy }: { puppy: Puppy }) {
  const image = storageImageUrl(puppy.imageUrls[0]);
  return (
    <article className="puppy-card">
      <div className="card-image-fallback">{image ? <img src={image} alt={`${puppy.name}, adoptable dog`} loading="lazy" decoding="async" /> : <PawPrint size={44} />}</div>
      <div className="card-body">
        <div className="card-top"><h2 className="card-title">{puppy.name}</h2><span className="tag">{puppy.temperament || puppy.status}</span></div>
        <p>{puppy.description || "The care team will share more about this dog soon."}</p>
        <div className="meta"><span>{puppy.age || "Age to be confirmed"}</span><span>{puppy.size || "Size to be confirmed"}</span></div>
        <div className="card-actions">
          <Link href={`/puppies/${puppy.id}`} className="btn btn-ghost">View profile <ArrowRight size={14} /></Link>
          <Link href={`/adopt?puppy=${puppy.id}`} className="btn btn-dark">Ask about adoption</Link>
          <WhatsAppAction message={puppyAdoptionMessage(puppy.name)} label="WhatsApp" className="btn btn-ghost" />
        </div>
      </div>
    </article>
  );
}
function PuppyProfile() {
  const [, params] = useRoute("/puppies/:id");
  const puppyId = params?.id ?? "";
  const query = useGetPuppy(puppyId, { query: { queryKey: getGetPuppyQueryKey(puppyId), staleTime: 30_000 } });
  if (query.isLoading && !query.data) return <main><div className="content-section container"><div className="empty-state" role="status">Loading profile…</div></div></main>;
  if (query.error && !query.data) return <main><div className="content-section container"><EmptyState title="This profile is temporarily unavailable." text="Please try again in a moment." action={<button className="btn btn-ghost" onClick={() => query.refetch()}>Try again</button>} /></div></main>;
  if (!query.data) return <NotFound />;
  const puppy = query.data; const image = storageImageUrl(puppy.imageUrls[0]);
  return (
    <>
      <Meta title={`${puppy.name}'s profile`} description={`Learn about ${puppy.name} and the adoption process.`} />
      <main>
        <PageHeader eyebrow="A closer look" title={<>{puppy.name}<br /><em>could be your next hello.</em></>} text="The care team keeps this profile current. Adoption decisions always begin with a human conversation." />
        <section className="content-section container">
          <div className="profile-layout">
             <div className="profile-photo card-image-fallback">{image ? <img src={image} alt={`${puppy.name}, adoptable dog`} loading="eager" fetchPriority="high" decoding="async" /> : <PawPrint size={64} />}</div>
            <div className="profile-copy">
              <div className="tag">{puppy.temperament || puppy.status}</div>
              <h2>{puppy.name} is waiting for the right kind of yes.</h2>
              <p>{puppy.description || "More details will be added by the care team."}</p>
              <div className="meta profile-meta"><span>{puppy.age || "Age to be confirmed"}</span><span>{puppy.size || "Size to be confirmed"}</span><span>{puppy.location || "Location to be confirmed"}</span></div>
              <div className="profile-actions">
                <Link href={`/adopt?puppy=${puppy.id}`} className="btn btn-primary">Ask about adoption <ArrowRight size={15} /></Link>
                <Link href="/foster" className="btn btn-ghost">Explore fostering</Link>
                <WhatsAppAction message={puppyAdoptionMessage(puppy.name)} label="WhatsApp about this puppy" className="btn btn-ghost" />
              </div>
              <div className="notice success"><ShieldCheck size={16} /> Health and placement information is reviewed by the care team.</div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
function Products({ cart, setCart }: { cart: CartLine[]; setCart: React.Dispatch<React.SetStateAction<CartLine[]>> }) {
  const [search, setSearch] = useState("");
  const params = { search: search || undefined };
  const query = useListProducts(params, { query: { queryKey: getListProductsQueryKey(params), staleTime: 30_000 } });
  const add = (product: Product) => setCart((lines) => lines.some((line) => line.id === product.id) ? lines.map((line) => line.id === product.id ? { ...line, quantity: line.quantity + 1 } : line) : [...lines, { ...product, quantity: 1 }]);
  return (
    <>
      <Meta title="Shop" description="Support SaveStreet Dogs through mission goods." />
      <main>
        <PageHeader eyebrow="Shop the mission" title={<>Small goods.<br /><em>Practical good.</em></>} text="Products are managed by the SaveStreet Dogs team. Every available item is shown from the live catalog." />
        <section className="content-section container">
          <div className="toolbar">
            <div className="eyebrow">Live catalog</div>
            <div className="search"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search the catalog" /></div>
          </div>
          {query.error && query.data?.length ? <div className="notice error" role="alert">We couldn’t refresh the catalog. <button className="btn btn-ghost" onClick={() => query.refetch()}>Try again</button></div> : null}
          {query.isLoading && !query.data ? <div className="empty-state" role="status">Loading the live catalog…</div> : query.data?.length ? (
            <div className="product-grid">
              {query.data.map((product) => {
                const images = productImages(product);
                const image = images[0];
                return (
                  <article className="product-card" key={product.id}>
                    <Link href={`/products/${product.id}`} className={`product-art ${image ? "has-image" : ""}`} aria-label={`View ${product.name}`}>
                      {image ? <img src={image} alt={`${product.name} product`} loading="lazy" decoding="async" /> : <PawPrint size={34} />}
                    </Link>
                    <div className="product-body">
                      <div className="eyebrow">{product.category}</div>
                      <h3><Link href={`/products/${product.id}`} className="product-title-link">{product.name}</Link></h3>
                      <p>{product.description}</p>
                      <div className="product-bottom">
                        <strong>{money(product.priceRupees)}</strong>
                        <button className="btn btn-dark" onClick={() => add(product)} disabled={product.stock === 0 || !product.available}>{product.stock === 0 ? "Out of stock" : "Add to cart"}</button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : query.error ? (
            <EmptyState title="The shop is temporarily unavailable." text="Please try again in a moment." action={<button className="btn btn-primary" onClick={() => query.refetch()}>Try again</button>} />
          ) : (
            <EmptyState
              title="The shop is being stocked."
              text="No products are currently available. The admin catalog will appear here once items are published."
              action={<WhatsAppAction message={CONTACT_MESSAGES.shop} label="Ask about the shop" className="btn btn-primary" />}
            />
          )}
        </section>
      </main>
    </>
  );
}
function ProductDetail({ cart, setCart }: { cart: CartLine[]; setCart: React.Dispatch<React.SetStateAction<CartLine[]>> }) {
  const [, params] = useRoute("/products/:id");
  const productId = params?.id ?? "";
  const query = useGetProduct(productId, { query: { queryKey: getGetProductQueryKey(productId), staleTime: 30_000 } });
  const [, navigate] = useLocation();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  if (query.isLoading && !query.data) return <main><div className="content-section container"><div className="empty-state" role="status">Loading product…</div></div></main>;
  if (query.error && !query.data) return <main><div className="content-section container"><EmptyState title="This product is temporarily unavailable." text="Please try again in a moment." action={<button className="btn btn-ghost" onClick={() => query.refetch()}>Try again</button>} /></div></main>;
  if (!query.data) return <NotFound />;
  const product = query.data;
  const images = productImages(product);
  const image = images[selectedImage] ?? images[0];
  const add = () => setCart((lines) => lines.some((line) => line.id === product.id) ? lines.map((line) => line.id === product.id ? { ...line, quantity: line.quantity + quantity } : line) : [...lines, { ...product, quantity }]);
  return (
    <>
      <Meta title={product.name} description={product.description || `Support SaveStreet Dogs with ${product.name}.`} />
      <main>
        <section className="content-section container">
          <button className="btn btn-ghost" onClick={() => navigate("/products")}><ArrowRight size={14} style={{ transform: "rotate(180deg)" }} /> Back to shop</button>
          <div className="product-detail" style={{ marginTop: 30 }}>
             <div><div className={`product-art ${image ? "has-image" : ""}`}>{image ? <img src={image} alt={`${product.name} product`} loading="eager" fetchPriority="high" decoding="async" /> : <PawPrint size={64} />}</div>{images.length > 1 && <div className="product-gallery-thumbs" aria-label="Product photos">{images.map((src, index) => <button type="button" key={src} aria-label={`Show product photo ${index + 1}`} aria-pressed={selectedImage === index} onClick={() => setSelectedImage(index)}><img src={src} alt="" /></button>)}</div>}</div>
            <div className="product-detail-copy">
              <div className="eyebrow">{product.category}</div>
              <h2>{product.name}</h2>
              <p>{product.description}</p>
              <div className="detail-price price">{money(product.priceRupees)} per piece</div>
               <div className="meta"><span>{product.stock === null ? "Stock not tracked · staff confirms availability" : product.stock > 0 ? product.stock < 5 ? "Low stock" : "In stock" : "No stock"}</span></div>
               <div className="qty detail-qty" aria-label="Quantity"><button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={13} /></button><span>{quantity}</span><button type="button" aria-label="Increase quantity" onClick={() => setQuantity((value) => value + 1)}>+</button><small>{money(product.priceRupees * quantity)} total</small></div>
              <div className="detail-actions">
                 <button className="btn btn-primary" onClick={add} disabled={product.stock === 0 || !product.available}>{product.stock === 0 ? "Out of stock" : "Add to cart"} <ShoppingBag size={15} /></button>
                <Link href="/products" className="btn btn-ghost">Keep browsing</Link>
                <WhatsAppAction message={productQuestionMessage(product.name)} label="Ask about this product" className="btn btn-ghost" />
              </div>
              <div className="detail-note">Each purchase helps keep practical care moving for street dogs.</div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function CheckoutPage({ cart, setCart }: { cart: CartLine[]; setCart: React.Dispatch<React.SetStateAction<CartLine[]>> }) {
  const { user } = useFirebaseAuth();
  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.priceRupees, 0);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [orderCode, setOrderCode] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    const form = new FormData(event.currentTarget);
    try {
      const order = await api("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          customerName: form.get("customerName"),
          phone: form.get("phone"),
          email: form.get("email"),
          address: form.get("address"),
          city: form.get("city"),
          state: form.get("state"),
          pinCode: form.get("pinCode"),
          deliveryNotes: form.get("deliveryNotes"),
          items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
        }),
      }) as { orderCode: string; totalRupees: number };
      setOrderCode(order.orderCode);
      setStatus(`Order placed for ${money(order.totalRupees)}.`);
      setCart([]);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "We could not create the order.");
    } finally {
      setBusy(false);
    }
  }

  if (!cart.length && !orderCode) {
    return <><Meta title="Checkout" description="Review your SaveStreet Dogs order." /><main><section className="content-section container"><EmptyState title="Your cart is empty." text="Add a product before starting checkout." action={<Link href="/products" className="btn btn-primary">Browse the shop <ArrowRight size={14} /></Link>} /></section></main></>;
  }
  if (!user && !orderCode) return <><Meta title="Sign in to checkout" description="Sign in before placing an order." /><main><section className="content-section container"><div className="form-card checkout-auth"><div className="eyebrow">Your cart stays here</div><h2>Sign in before checkout.</h2><p>Checkout is available to signed-in customers. Your cart remains saved while you sign in on this page.</p><Link href="/login" className="btn btn-primary">Sign in to continue <ArrowRight size={14} /></Link><Link href="/products" className="btn btn-ghost">Return to shop</Link></div></section></main></>;
  if (orderCode) {
    return (
      <>
        <Meta title="Order received" description="Your SaveStreet Dogs order has been received." />
        <main>
          <section className="content-section container">
            <div className="form-card" style={{ maxWidth: 620, margin: "0 auto" }}>
              <div className="notice success"><Check size={16} /> {status}</div>
              <h2>Thank you for supporting the mission.</h2>
              <p>Your order reference is <strong>{orderCode}</strong>. The team will confirm payment and delivery details with you.</p>
              <div className="detail-actions">
                <WhatsAppAction message={orderQuestionMessage(orderCode)} label="Ask about this order" className="btn btn-primary" />
                <Link href="/products" className="btn btn-dark">Back to the shop <ArrowRight size={14} /></Link>
              </div>
            </div>
          </section>
        </main>
      </>
    );
  }
  return <><Meta title="Checkout" description="Review your SaveStreet Dogs order." /><main><PageHeader eyebrow="One last step" title={<>Your order,<br /><em>clearly handed over.</em></>} text="The team will confirm payment and delivery after this order is saved." /><section className="content-section container"><div className="form-layout"><form className="form-card" onSubmit={submit}><h2>Delivery details</h2>{status && <div className="notice error" role="alert">{status}</div>}<div className="field"><label>Name *</label><input name="customerName" required minLength={2} /></div><div className="field"><label>Email *</label><input name="email" type="email" required /></div><div className="field"><label>Phone *</label><input name="phone" required minLength={6} /></div><div className="field"><label>Address *</label><textarea name="address" required minLength={5} /></div><div className="field"><label>City *</label><input name="city" required minLength={2} /></div><div className="field"><label>State *</label><input name="state" required minLength={2} /></div><div className="field"><label>PIN code *</label><input name="pinCode" required minLength={4} /></div><div className="field"><label>Delivery notes</label><textarea name="deliveryNotes" /></div><button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Saving order…" : "Place order"} <ArrowRight size={15} /></button></form><aside className="aside-note"><h3>Order summary</h3>{cart.map((item) => <div className="drawer-total-line" key={item.id}><span>{item.name} × {item.quantity}</span><strong>{money(item.priceRupees * item.quantity)}</strong></div>)}<div className="drawer-total-line" style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid #d8ded6" }}><span>Total</span><strong>{money(subtotal)}</strong></div><p style={{ color: "#7d8982", fontSize: 11 }}>All amounts are Indian rupees (INR).</p></aside></div></section></main></>;
}
function FormPage({ kind }: { kind: "rescue" | "adopt" | "foster" | "volunteer" | "contact" }) {
  const configMap: Record<typeof kind, { eyebrow: string; title: ReactNode; text: string; heading: string; button: string }> = {
    rescue: { eyebrow: "First, stay calm", title: <>Report a dog.<br /><em>Start with what you see.</em></>, text: "A clear, current report helps the care team decide what is safe and useful next.", heading: "Dog report", button: "Send report" },
    adopt: { eyebrow: "A thoughtful yes", title: <>Adoption starts<br /><em>before hello.</em></>, text: "Share a little about your household and the care team will help with the next conversation.", heading: "Adoption enquiry", button: "Begin enquiry" },
    foster: { eyebrow: "A temporary home is a real home", title: <>Make room<br /><em>for a new start.</em></>, text: "Fostering gives a dog time to decompress, heal, and show their personality.", heading: "Foster interest", button: "Share my interest" },
    volunteer: { eyebrow: "Your time has shape", title: <>Help in the<br /><em>in-between.</em></>, text: "There are many ways to be useful: transport, careful admin, event support, or a steady pair of hands.", heading: "Volunteer interest", button: "Raise my hand" },
    contact: { eyebrow: "We are listening", title: <>Questions are<br /><em>welcome here.</em></>, text: "Tell us what you need and we will point you toward the clearest next step.", heading: "Send a note", button: "Send message" },
  };
  const config = configMap[kind];
  const puppyId = new URLSearchParams(window.location.search).get("puppy");
  const contact = useSiteContact();
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const whatsappMessage =
    kind === "contact"
      ? CONTACT_MESSAGES.general
      : kind === "adopt"
        ? CONTACT_MESSAGES.adoption
        : CONTACT_MESSAGES[kind];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      if (kind === "contact") {
        const name = String(form.get("name") ?? "").trim();
        const senderEmail = String(form.get("email") ?? "").trim();
        const message = String(form.get("message") ?? "").trim();
        const body = `Name: ${name}\nReply email: ${senderEmail}\n\nMessage:\n${message}`;
        window.location.assign(makeEmailComposerHref(contact, "Message for SaveStreet Dogs", body));
        setStatus("email");
        return;
      }
      if (kind === "adopt") {
        await api("/api/adoption-requests", {
          method: "POST",
          body: JSON.stringify({
            puppyId: puppyId || null,
            applicantName: form.get("name"),
            email: form.get("email"),
            phone: form.get("phone"),
            city: form.get("city"),
            address: form.get("details"),
            livingSituation: form.get("details"),
            animalExperience: form.get("experience"),
            householdInformation: form.get("household"),
            reason: form.get("details"),
            additionalMessage: form.get("message"),
          }),
        });
      } else if (kind === "rescue") {
        await api("/api/submissions/rescue", {
          method: "POST",
          body: JSON.stringify({
            reporterName: form.get("name"),
            email: form.get("email"),
            location: form.get("location"),
            details: form.get("details"),
            category: form.get("category"),
            urgency: form.get("urgency"),
          }),
        });
      } else if (kind === "volunteer") {
        await api("/api/submissions/volunteer", {
          method: "POST",
          body: JSON.stringify({
            name: form.get("name"),
            email: form.get("email"),
            interest: form.get("interest"),
            message: form.get("message"),
          }),
        });
      } else if (kind === "foster") {
        await api("/api/submissions/foster", {
          method: "POST",
          body: JSON.stringify({
            name: form.get("name"),
            email: form.get("email"),
            city: form.get("city"),
            message: form.get("message"),
          }),
        });
      }
      setStatus("success");
      formElement.reset();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Meta title={config.heading} description={config.text} />
      <main>
        <PageHeader eyebrow={config.eyebrow} title={config.title} text={config.text} />
        <section className="content-section container">
          <div className="form-layout">
            <form className="form-card" onSubmit={submit}>
              <h2 style={{ margin: "0 0 24px", font: "700 30px var(--app-font-serif)", color: "#173833" }}>{config.heading}</h2>
              {status === "success" && <div className="notice success" role="status"><Check size={16} /> Thank you. Your note has been saved for the care team.</div>}
              {status === "email" && <div className="notice success" role="status">Your email app should open with this message. If it does not, email <a href={makeEmailHref(contact)}>{contact.email}</a>.</div>}
              {status && status !== "success" && status !== "email" && <div className="notice error" role="alert">{status}</div>}
              <div className="field"><label>Your name *</label><input name="name" required minLength={2} /></div>
              <div className="field"><label>Email *</label><input name="email" type="email" required /></div>
              {kind === "adopt" && <>
                <div className="field"><label>Phone *</label><input name="phone" required /></div>
                <div className="field"><label>City *</label><input name="city" required /></div>
                <div className="field"><label>Household and living situation *</label><textarea name="details" required minLength={12} /></div>
                <div className="field"><label>Animal experience</label><textarea name="experience" /></div>
                <div className="field"><label>Who lives in the household?</label><textarea name="household" /></div>
              </>}
              {kind === "rescue" && <>
                <div className="field"><label>Where is the dog? *</label><input name="location" required /></div>
                <div className="field"><label>What do you notice? *</label><textarea name="details" required minLength={10} /></div>
                <div className="field"><label>Category</label><select name="category" defaultValue="Other"><option>Injured</option><option>Sick</option><option>Abandoned</option><option>Puppy in danger</option><option>Other</option></select></div>
                <div className="field"><label>Urgency</label><select name="urgency" defaultValue="Normal"><option>Normal</option><option>Important</option><option>Emergency</option></select></div>
              </>}
              {kind === "foster" && <>
                <div className="field"><label>City or region *</label><input name="city" required /></div>
                <div className="field"><label>What would fostering look like for you?</label><textarea name="message" required minLength={10} /></div>
              </>}
              {kind === "volunteer" && <>
                <div className="field"><label>What kind of help interests you? *</label><input name="interest" required /></div>
                <div className="field"><label>A note for the team</label><textarea name="message" /></div>
              </>}
              {kind === "contact" && <div className="field"><label>Your message *</label><textarea name="message" required minLength={10} /></div>}
              <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : config.button} {!busy && <ArrowRight size={15} />}</button>
              <p style={{ color: "#7d8982", fontSize: 11 }}>Share only what is needed to understand the next step.</p>
            </form>
            <aside className="aside-note">
              <ShieldCheck size={28} color="#e9a050" />
              <h3>Good information is kind information.</h3>
              <p>We keep requests private and use them only to coordinate care.</p>
              {kind === "contact"
                ? <ContactActionLinks message={CONTACT_MESSAGES.general} variant="panel" />
                : <WhatsAppAction message={whatsappMessage} label={`WhatsApp about ${kind}`} />}
            </aside>
          </div>
        </section>
      </main>
    </>
  );
}
function AboutPage() {
  return <><Meta title="About" description="How SaveStreet Dogs encourages patient, practical care for street dogs." /><main><PageHeader eyebrow="Our approach" title={<>Care begins<br /><em>with paying attention.</em></>} text="SaveStreet Dogs helps neighbors find a clear next step when a street dog needs support." /><section className="content-section container"><div className="about-copy"><h2>Useful help is specific, patient, and kind.</h2><p>We make it easier to report concerns, learn responsible ways to help, and connect with adoption, fostering, and volunteering pathways. Every dog and situation is different; the right next step may begin with listening and sharing accurate details.</p><p>This site is a place to find practical information and contact the team. It does not promise a particular rescue response or placement outcome.</p><div className="hero-actions"><Link href="/rescue" className="btn btn-primary">Report a dog <ArrowRight size={14} /></Link><Link href="/learn" className="btn btn-ghost">Read the guides <BookOpen size={14} /></Link></div></div></section></main></>;
}
function DonatePage() {
  return <><Meta title="Support the work" description="Learn how to support SaveStreet Dogs through practical involvement." /><main><PageHeader eyebrow="Support, thoughtfully" title={<>There are many ways<br /><em>to show up.</em></>} text="We do not currently publish a donation or payment method on this page. Please do not send money through an unverified channel." /><section className="content-section container"><div className="about-copy"><h2>Offer time, a home, or useful knowledge.</h2><p>Explore volunteering, fostering, adoption, or the shop. For questions about other ways to support SaveStreet Dogs, contact the team directly; we will share confirmed options when available.</p><div className="support-links"><Link href="/volunteer">Volunteer <ArrowRight size={14} /></Link><Link href="/foster">Ask about fostering <ArrowRight size={14} /></Link><Link href="/products">Visit the shop <ArrowRight size={14} /></Link><Link href="/contact">Contact the team <ArrowRight size={14} /></Link></div></div></section></main></>;
}

const helpTopics: Array<{ test: RegExp; answer: string; links: Array<[string, string]> }> = [
  { test: /puppy|puppies|available dog|available puppy/i, answer: "Current puppy profiles come from the care team and may change. Open the listings to see what is currently published.", links: [["/puppies", "View puppy profiles"], ["/adopt", "Ask about adoption"]] },
  { test: /adopt|adoption/i, answer: "Start by reading a current puppy profile, then send an adoption enquiry. The team will follow up for a human conversation; an enquiry is not a placement guarantee.", links: [["/puppies", "Meet the puppies"], ["/adopt", "Adoption enquiry"]] },
  { test: /injur|rescue|report|found a dog|stray/i, answer: "Keep yourself and the dog safe. Share the location, time, what you can observe, and a safe way to follow up. Urgent injuries need qualified veterinary or emergency help.", links: [["/rescue", "Report a dog"], ["/learn/safe-approach", "Safe approach guide"], ["/learn/injured-dog", "Injured dog guide"]] },
  { test: /foster/i, answer: "Fostering is a temporary home with agreed expectations and team support. Share your availability so the team can discuss whether a suitable match exists.", links: [["/foster", "Foster interest"], ["/learn/fostering", "Read about fostering"]] },
  { test: /volunteer/i, answer: "Volunteer interest can include many kinds of time and skills. Send the form with your availability and the team can discuss useful next steps.", links: [["/volunteer", "Volunteer with us"]] },
  { test: /collar|shop|price|cost|buy|product/i, answer: "Reflective Collars are listed at ₹60 per piece when available in the live catalog. If stock is untracked, staff confirms availability after an order request.", links: [["/products", "Visit the shop"]] },
  { test: /story|stories/i, answer: "Read published CMS stories alongside clearly labelled illustrative stories. Illustrative stories are not real cases or outcomes.", links: [["/stories", "Browse stories"]] },
  { test: /learn|guide|article/i, answer: "The Learn section contains nine practical guides on helping street dogs, adoption, fostering, and puppy safety.", links: [["/learn", "Explore Learn"]] },
  { test: /donat|money|payment|support/i, answer: "No donation or payment method is currently published here. Please contact the team to ask about confirmed ways to help; we will not direct you to an unverified payment channel.", links: [["/donate", "Ways to support"], ["/contact", "Contact the team"], ["/volunteer", "Volunteer"]] },
  { test: /contact|email|phone|whatsapp/i, answer: "Email the team at vexaxam466@caps7.com. WhatsApp details have not been configured yet.", links: [["/contact", "Contact page"]] },
];
function FloatingHelper() {
  const contact = useSiteContact();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<typeof helpTopics[number] | null>(null);
  if (location.startsWith("/admin")) return null;
  const whatsappHref = contact.whatsapp ? `https://wa.me/${contact.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Hello SaveStreet Dogs, I would like to know more about how to help.")}` : "";
  const submit = (value: string) => {
    const topic = helpTopics.find((entry) => entry.test.test(value));
    setQuestion(value);
    setAnswer(topic ?? { answer: "I don’t have a reliable answer for that yet. Please contact the team and we’ll point you toward the right information.", links: [["/contact", "Contact the team"], ["/learn", "Browse the guides"]], test: /.*/ });
  };
  return <div className="floating-helper">
    {open && <section className="faq-panel" aria-label="Local help and FAQ" aria-live="polite"><div className="faq-head"><div><span className="eyebrow">SaveStreet help</span><h2>Ask a question</h2></div><button type="button" className="icon-btn" aria-label="Close help" onClick={() => setOpen(false)}><X size={17} /></button></div><p className="faq-intro">A local FAQ helper — not AI. Choose a topic or type a question.</p>
      <div className="faq-suggestions">{["Found a dog", "Adoption", "Fostering", "Collar price"].map((item) => <button type="button" key={item} onClick={() => submit(item)}>{item}</button>)}</div>
      {question && <div className="faq-response"><strong>You asked</strong><p>{question}</p>{answer && <><strong>Helpful information</strong><p>{answer.answer}</p><div>{answer.links.map(([href, label]) => <Link key={href} href={href}>{label} <ArrowRight size={12} /></Link>)}</div></>}</div>}
      <form className="faq-form" onSubmit={(event) => { event.preventDefault(); if (question.trim()) submit(question.trim()); }}><label className="sr-only" htmlFor="faq-question">Ask about dogs or the site</label><input id="faq-question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask about dogs or the site" /><button type="submit" aria-label="Send question"><Send size={15} /></button></form>
    </section>}
    <div className="floating-actions">
      {whatsappHref ? <a className="floating-whatsapp" href={whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp"><MessageCircle size={18} /><span>WhatsApp</span></a> : <button className="floating-whatsapp disabled" type="button" disabled aria-label="WhatsApp contact coming soon"><MessageCircle size={18} /><span>WhatsApp soon</span></button>}
      <button className="floating-chat" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "Close SaveStreet help" : "Open SaveStreet local FAQ help"}><MessageCircle size={20} /><span>{open ? "Close help" : "Ask a question"}</span></button>
    </div>
  </div>;
}
function AppRoutes() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [location] = useLocation();
  if (location.startsWith("/admin") && location !== "/admin/login") {
    return <Switch><Route path="/admin" component={AdminRoute} /><Route path="/admin/:rest*" component={AdminRoute} /><Route><NotFound /></Route></Switch>;
  }
  return (
    <Shell cart={cart} setCart={setCart}>
      <Switch>
        <Route path="/"><Home setCart={setCart} /></Route>
        <Route path="/learn"><Suspense fallback={<RouteLoading label="learning page" />}><LearnPage /></Suspense></Route>
        <Route path="/stories/:slug"><Suspense fallback={<RouteLoading label="story" />}><StoryDetailPage /></Suspense></Route>
        <Route path="/stories"><Suspense fallback={<RouteLoading label="stories" />}><StoriesPage /></Suspense></Route>
        <Route path="/login"><AuthRoute mode="signin" /></Route>
        <Route path="/signup"><AuthRoute mode="signup" /></Route>
        <Route path="/forgot-password"><AuthRoute mode="reset" /></Route>
        <Route path="/admin/login"><AuthRoute mode="admin" /></Route>
        <Route path="/orders/:orderCode"><Suspense fallback={<RouteLoading label="order details" />}><OrderTrackingPage /></Suspense></Route>
        <Route path="/puppies/:id" component={PuppyProfile} />
        <Route path="/puppies" component={Puppies} />
        <Route path="/products/:id"><ProductDetail cart={cart} setCart={setCart} /></Route>
        <Route path="/products"><Products cart={cart} setCart={setCart} /></Route>
        <Route path="/checkout"><CheckoutPage cart={cart} setCart={setCart} /></Route>
        <Route path="/rescue"><FormPage kind="rescue" /></Route>
        <Route path="/adopt"><FormPage kind="adopt" /></Route>
        <Route path="/foster"><FormPage kind="foster" /></Route>
        <Route path="/volunteer"><FormPage kind="volunteer" /></Route>
        <Route path="/contact"><FormPage kind="contact" /></Route>
        <Route path="/about" component={AboutPage} />
        <Route path="/donate" component={DonatePage} />
        <Route><NotFound /></Route>
      </Switch>
    </Shell>
  );
}

function StartupReadyGate({ children }: { children: ReactNode }) {
  const holdStartupPreview =
    import.meta.env.DEV &&
    new URLSearchParams(window.location.search).get("startupPreview") === "1";

  useEffect(() => {
    if (holdStartupPreview) return;
    const loader = document.getElementById("startup-loader");
    if (!loader || loader.classList.contains("is-done")) return;

    let removeTimer: number | undefined;
    const dismissTimer = window.setTimeout(() => {
      loader.classList.add("is-done");
      removeTimer = window.setTimeout(() => loader.remove(), 360);
    }, 140);

    return () => {
      window.clearTimeout(dismissTimer);
      if (removeTimer !== undefined) window.clearTimeout(removeTimer);
    };
  }, [holdStartupPreview]);

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SiteContactProvider>
        <FirebaseAuthProvider>
          <StartupReadyGate>
            <TooltipProvider>
              <AppRoutes />
              <FloatingHelper />
              <Toaster />
            </TooltipProvider>
          </StartupReadyGate>
        </FirebaseAuthProvider>
      </SiteContactProvider>
    </QueryClientProvider>
  );
}