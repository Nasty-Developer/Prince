import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import {
  Archive, ArrowRight, BarChart3, BookOpen, Boxes, Check, ChevronRight, ClipboardList,
  FileText, HeartHandshake, ImagePlus, LayoutDashboard, LogOut, Menu, Package, PawPrint,
  PenLine, RefreshCw, Search, Settings, ShieldAlert, ShoppingBag, SlidersHorizontal,
  UserRound, Users, X,
  type LucideIcon,
} from "lucide-react";
import {
  getGetAdminDashboardQueryKey, getListAdminOrdersQueryKey, getListAdminProductsQueryKey,
  getListAdminPuppiesQueryKey, getListAdoptionRequestsQueryKey, useArchiveProduct,
  useArchivePuppy, useCreateProduct, useCreatePuppy, useGetAdminDashboard,
  useListAdminOrders, useListAdminProducts, useListAdminPuppies, useListAdoptionRequests,
  useUpdateAdoptionRequest, useUpdateAdminOrder, useUpdateProduct, useUpdatePuppy,
  type AdoptionRequest, type Order, type Product, type ProductInput, type Puppy, type PuppyInput,
} from "@workspace/api-client-react";
import { useFirebaseAuth } from "@/lib/auth-context";
import { adminJson, apiErrorMessage, objectUrl, uploadAdminImage } from "./api";
import "./admin.css";

type NavItem = { href: string; label: string; icon: LucideIcon };
const navItems: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/puppies", label: "Puppies", icon: PawPrint },
  { href: "/admin/adoptions", label: "Adoptions", icon: HeartHandshake },
  { href: "/admin/rescue-reports", label: "Rescue reports", icon: ShieldAlert },
  { href: "/admin/volunteers", label: "Volunteers", icon: Users },
  { href: "/admin/foster", label: "Foster", icon: UserRound },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/stories", label: "Stories", icon: BookOpen },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const money = (paise = 0) => `₹${(paise / 100).toFixed(0)}`;
const niceDate = (value?: string | null) => value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const initials = (value?: string | null) => (value || "Admin").split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

function Badge({ value }: { value?: string | number | null }) {
  const text = String(value ?? "Unknown");
  const lower = text.toLowerCase();
  const tone = lower.includes("pending") || lower.includes("low") || lower.includes("review") ? "orange" : lower.includes("reject") || lower.includes("cancel") || lower.includes("archive") || lower.includes("out") ? "red" : lower === "unknown" ? "gray" : "";
  return <span className={`admin-badge ${tone}`} data-testid={`status-${text.toLowerCase().replace(/\s+/g, "-")}`}>{text}</span>;
}

function Notice({ kind, children }: { kind: "success" | "error"; children: ReactNode }) {
  return <div className={`admin-notice ${kind}`} role="status" data-testid={`admin-notice-${kind}`}>{children}</div>;
}

function LoadingState() {
  return <div className="admin-loading" data-testid="admin-loading"><div className="admin-skeleton" /><div className="admin-skeleton" /><div className="admin-skeleton" /></div>;
}

function ErrorState({ error, retry }: { error: unknown; retry: () => void }) {
  return <div className="admin-error" role="alert" data-testid="admin-error"><strong>Could not load this view.</strong><span>{apiErrorMessage(error)}</span><div style={{ marginTop: 16 }}><button className="admin-button secondary small" onClick={retry} data-testid="button-retry"><RefreshCw size={13} /> Try again</button></div></div>;
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="admin-empty" data-testid="admin-empty"><strong>{title}</strong><span>{text}</span></div>;
}

function PageTitle({ eyebrow, title, text, action }: { eyebrow: string; title: string; text: string; action?: ReactNode }) {
  return <div className="admin-page-title"><div><div className="admin-eyebrow">{eyebrow}</div><h1>{title}</h1><p>{text}</p></div>{action}</div>;
}

function AdminShell({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, signOut } = useFirebaseAuth();
  const active = location === "/admin" ? "/admin" : navItems.find((item) => location.startsWith(item.href))?.href ?? "/admin";
  const mobileItems = navItems.slice(0, 5);
  return <div className="admin-root">
    <div className="admin-frame">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand" data-testid="link-admin-home"><span className="admin-brand-mark"><PawPrint size={18} /></span><span>SaveStreet Dogs<small>Operations desk</small></span></Link>
        <div className="admin-nav-label">Workspace</div>
        <nav className="admin-nav" aria-label="Admin navigation">{navItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={active === href ? "active" : ""} data-testid={`link-admin-${label.toLowerCase().replace(/\s+/g, "-")}`}><Icon size={16} /><span>{label}</span></Link>)}</nav>
        <div className="admin-sidebar-footer"><strong>{user?.email || "Authorized team"}</strong>Live operational data<br />Changes are saved to the API.</div>
      </aside>
      <section className="admin-main">
        <header className="admin-topbar"><div className="admin-breadcrumb"><strong>SaveStreet</strong> <ChevronRight size={11} style={{ verticalAlign: "middle" }} /> Admin / {navItems.find((item) => item.href === active)?.label}</div><div className="admin-top-actions"><div className="admin-user-pill"><span>{user?.email}</span><span className="admin-avatar">{initials(user?.displayName || user?.email)}</span></div><button className="admin-button secondary small" onClick={() => void signOut()} data-testid="button-admin-sign-out"><LogOut size={13} /> Sign out</button></div></header>
        <main className="admin-content">{children}</main>
      </section>
    </div>
    <nav className="admin-mobile-nav" aria-label="Mobile admin navigation">{mobileItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={active === href ? "active" : ""} data-testid={`mobile-link-${label.toLowerCase().replace(/\s+/g, "-")}`}><Icon /><span>{label}</span></Link>)}</nav>
  </div>;
}

function Overview() {
  const query = useGetAdminDashboard({ query: { queryKey: getGetAdminDashboardQueryKey() } });
  if (query.isLoading) return <><PageTitle eyebrow="Operations desk" title="Good morning, team." text="A live read of the work that needs attention today." /><LoadingState /></>;
  if (query.error) return <><PageTitle eyebrow="Operations desk" title="Good morning, team." text="A live read of the work that needs attention today." /><ErrorState error={query.error} retry={() => void query.refetch()} /></>;
  const data = query.data;
  const stats = data ? [
    ["Available puppies", data.availablePuppies], ["Adoption requests", data.adoptionRequests], ["Pending orders", data.pendingOrders], ["Rescue reports", data.rescueReports],
    ["Paid orders", data.paidOrders], ["Preparing orders", data.preparingOrders], ["Volunteers", data.volunteers], ["Foster requests", data.fosterRequests],
  ] : [];
  return <><PageTitle eyebrow="Operations desk" title="Good morning, team." text="A live read of the work that needs attention today." action={<Link href="/admin/puppies" className="admin-button" data-testid="link-overview-puppies">Manage puppies <ArrowRight size={14} /></Link>} />
    <div className="admin-grid admin-stat-grid" data-testid="dashboard-stats">{stats.map(([label, value]) => <div className="admin-stat" key={String(label)} data-testid={`stat-${String(label).toLowerCase().replace(/\s+/g, "-")}`}><span className="admin-stat-label">{label}</span><strong>{value}</strong></div>)}</div>
    <div className="admin-two-col" style={{ marginTop: 15 }}><section className="admin-panel"><div className="admin-panel-head"><div><h2>Order pulse</h2><p>Current delivery workflow</p></div><Link href="/admin/orders" className="admin-button secondary small" data-testid="link-overview-orders">Open orders</Link></div><div className="admin-quick-list">{[["Paid", data?.paidOrders], ["Preparing", data?.preparingOrders], ["Dispatched", data?.dispatchedOrders], ["Delayed", data?.delayedOrders]].map(([label, value]) => <div className="admin-quick-row" key={String(label)}><div><strong>{label}</strong><span>orders in this stage</span></div><Badge value={value} /></div>)}</div></section><aside className="admin-callout"><BarChart3 size={19} /><h3>Keep the handoffs visible.</h3><p>Update statuses as care moves forward so the whole team works from the same source of truth.</p><Link href="/admin/rescue-reports" className="admin-button" data-testid="link-overview-reports">Review reports <ArrowRight size={14} /></Link></aside></div>
  </>;
}

type PuppyForm = PuppyInput & { rescueStory?: string };
const emptyPuppy: PuppyForm = { name: "", location: "", age: "", gender: "", size: "", temperament: "", description: "", adoptionInfo: "", healthInfo: "", vaccinationInfo: "", status: "Available", notes: "", imageUrls: [], rescueStory: "" };
const emptyProduct: ProductInput = { name: "", description: "", category: "", pricePaise: 6000, stock: 0, available: true, imageUrls: [] };

function UploadField({ images, onUpload }: { images: string[]; onUpload: (file: File) => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function choose(file?: File) {
    if (!file) return;
    setBusy(true); setError("");
    try { await onUpload(file); } catch (err) { setError(apiErrorMessage(err)); } finally { setBusy(false); }
  }
  return <div className="admin-upload"><div style={{ display: "flex", alignItems: "center", gap: 8 }}><ImagePlus size={16} /><strong style={{ fontSize: 12 }}>Add an image</strong><span style={{ color: "var(--admin-muted)", fontSize: 11 }}>stored in object storage</span></div><input type="file" accept="image/*" onChange={(event) => void choose(event.target.files?.[0])} disabled={busy} data-testid="input-image-upload" />{busy && <small>Uploading image…</small>}{error && <small style={{ color: "var(--admin-red)" }}>{error}</small>}<div className="admin-image-strip">{images.map((image) => <img src={objectUrl(image)} alt="" key={image} data-testid={`img-upload-${image.replace(/[^a-zA-Z0-9]/g, "-")}`} />)}</div></div>;
}

function PuppyEditor({ selected, onDone }: { selected: Puppy | null; onDone: (message: string, error?: string) => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<PuppyForm>(selected ? { ...selected, rescueStory: "" } : emptyPuppy);
  const create = useCreatePuppy(); const update = useUpdatePuppy();
  const set = (key: keyof PuppyForm, value: string | string[]) => setForm((current) => ({ ...current, [key]: value }));
  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      const { rescueStory: _rescueStory, ...supportedFields } = form;
      const body: PuppyInput = { ...supportedFields, imageUrls: form.imageUrls || [] };
      if (selected) await update.mutateAsync({ id: selected.id, data: body });
      else await create.mutateAsync({ data: body });
      await queryClient.invalidateQueries({ queryKey: getListAdminPuppiesQueryKey() });
      await queryClient.invalidateQueries({ queryKey: getGetAdminDashboardQueryKey() });
      onDone(selected ? "Puppy updated." : "Puppy added.");
    } catch (error) { onDone("", apiErrorMessage(error)); }
  }
  return <form className="admin-panel admin-form" onSubmit={submit} data-testid="form-puppy"><h2>{selected ? "Edit puppy" : "Add a puppy"}</h2><p className="admin-form-intro">Keep this profile specific. The public listing is powered by these fields.</p><div className="admin-form-grid">
    <Field label="Name *" full><input value={form.name} onChange={(e) => set("name", e.target.value)} required data-testid="input-puppy-name" /></Field>
    <Field label="Location"><input value={form.location} onChange={(e) => set("location", e.target.value)} data-testid="input-puppy-location" /></Field><Field label="Age"><input value={form.age} onChange={(e) => set("age", e.target.value)} data-testid="input-puppy-age" /></Field>
    <Field label="Gender"><select value={form.gender} onChange={(e) => set("gender", e.target.value)} data-testid="select-puppy-gender"><option value="">Select</option><option>Female</option><option>Male</option><option>Unknown</option></select></Field><Field label="Size"><select value={form.size} onChange={(e) => set("size", e.target.value)} data-testid="select-puppy-size"><option value="">Select</option><option>Small</option><option>Medium</option><option>Large</option></select></Field>
    <Field label="Status"><select value={form.status} onChange={(e) => set("status", e.target.value)} data-testid="select-puppy-status"><option>Available</option><option>In care</option><option>Adopted</option><option>Archived</option></select></Field><Field label="Temperament"><input value={form.temperament} onChange={(e) => set("temperament", e.target.value)} data-testid="input-puppy-temperament" /></Field>
    <Field label="Description" full><textarea value={form.description} onChange={(e) => set("description", e.target.value)} data-testid="textarea-puppy-description" /></Field><Field label="Adoption information"><textarea value={form.adoptionInfo} onChange={(e) => set("adoptionInfo", e.target.value)} data-testid="textarea-puppy-adoption-info" /></Field><Field label="Health information"><textarea value={form.healthInfo} onChange={(e) => set("healthInfo", e.target.value)} data-testid="textarea-puppy-health-info" /></Field><Field label="Vaccination information"><textarea value={form.vaccinationInfo} onChange={(e) => set("vaccinationInfo", e.target.value)} data-testid="textarea-puppy-vaccination-info" /></Field><Field label="Rescue story"><textarea value={form.rescueStory} onChange={(e) => set("rescueStory", e.target.value)} data-testid="textarea-puppy-rescue-story" /><small>Saved when the backend supports this field.</small></Field><Field label="Internal notes" full><textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} data-testid="textarea-puppy-notes" /></Field>
    <Field label="Photos" full><UploadField images={form.imageUrls || []} onUpload={async (file) => set("imageUrls", [...(form.imageUrls || []), await uploadAdminImage(file)])} /></Field>
  </div><div className="admin-form-actions"><button className="admin-button" disabled={!form.name.trim() || create.isPending || update.isPending} data-testid="button-save-puppy">{create.isPending || update.isPending ? "Saving…" : selected ? "Save changes" : "Add puppy"} <Check size={14} /></button></div></form>;
}

function PuppiesPage() {
  const query = useListAdminPuppies({ query: { queryKey: getListAdminPuppiesQueryKey() } });
  const archive = useArchivePuppy(); const queryClient = useQueryClient(); const [selected, setSelected] = useState<Puppy | null>(null); const [search, setSearch] = useState(""); const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const items = useMemo(() => (query.data ?? []).filter((item) => `${item.name} ${item.location} ${item.status}`.toLowerCase().includes(search.toLowerCase())), [query.data, search]);
  async function archivePuppy(id: string) { if (!window.confirm("Archive this puppy? It will no longer be active.")) return; try { await archive.mutateAsync({ id }); await queryClient.invalidateQueries({ queryKey: getListAdminPuppiesQueryKey() }); setMessage({ text: "Puppy archived." }); } catch (error) { setMessage({ text: apiErrorMessage(error), error: true }); } }
  return <><PageTitle eyebrow="Care records" title="Puppies" text="Manage profiles, health context, and placement status for every dog in the system." action={<button className="admin-button" onClick={() => setSelected(null)} data-testid="button-add-puppy"><PawPrint size={14} /> Add puppy</button>} />{message && <Notice kind={message.error ? "error" : "success"}>{message.text}</Notice>}<div className="admin-toolbar"><div className="admin-search"><Search size={15} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, location, status" data-testid="input-search-puppies" /></div><span className="admin-eyebrow">{items.length} records</span></div><div className="admin-form-layout"><PuppyEditor selected={selected} onDone={(text, error) => { setMessage(text ? { text } : { text: error || "Could not save puppy.", error: true }); if (text) setSelected(null); }} /><section className="admin-panel"><div className="admin-panel-head"><div><h2>All puppy records</h2><p>Archive rather than delete care history.</p></div></div>{query.isLoading ? <LoadingState /> : query.error ? <ErrorState error={query.error} retry={() => void query.refetch()} /> : !items.length ? <EmptyState title="No puppy records found." text="Add a real record or adjust the search." /> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Puppy</th><th>Status</th><th>Profile</th><th /></tr></thead><tbody>{items.map((puppy) => <tr key={puppy.id} data-testid={`row-puppy-${puppy.id}`}><td><div className="admin-record-name">{puppy.name}</div><div className="admin-record-sub">{puppy.location || "Location not set"} · {puppy.age || "Age not set"}</div></td><td><Badge value={puppy.status} /></td><td>{puppy.gender || "—"} · {puppy.size || "—"}</td><td><div className="admin-actions"><button className="admin-button secondary small" onClick={() => setSelected(puppy)} data-testid={`button-edit-puppy-${puppy.id}`}><PenLine size={12} /> Edit</button><button className="admin-button danger small" onClick={() => void archivePuppy(puppy.id)} data-testid={`button-archive-puppy-${puppy.id}`}><Archive size={12} /> Archive</button></div></td></tr>)}</tbody></table></div>}</section></div></>;
}

function Field({ label, full, children }: { label: string; full?: boolean; children: ReactNode }) {
  return <div className={`admin-field ${full ? "full" : ""}`}><label>{label}</label>{children}</div>;
}

function ProductEditor({ selected, onDone }: { selected: Product | null; onDone: (message: string, error?: string) => void }) {
  const queryClient = useQueryClient(); const [form, setForm] = useState<ProductInput>(selected ? { ...selected } : emptyProduct); const create = useCreateProduct(); const update = useUpdateProduct();
  const set = (key: keyof ProductInput, value: string | number | boolean | string[]) => setForm((current) => ({ ...current, [key]: value }));
  async function submit(event: FormEvent) { event.preventDefault(); try { const body: ProductInput = { ...form, pricePaise: Number(form.pricePaise || 0), stock: Number(form.stock || 0), available: Number(form.stock || 0) > 0 && Boolean(form.available), imageUrls: form.imageUrls || [] }; if (selected) await update.mutateAsync({ id: selected.id, data: body }); else await create.mutateAsync({ data: body }); await queryClient.invalidateQueries({ queryKey: getListAdminProductsQueryKey() }); await queryClient.invalidateQueries({ queryKey: getGetAdminDashboardQueryKey() }); onDone(selected ? "Product updated." : "Product added."); } catch (error) { onDone("", apiErrorMessage(error)); } }
  const stockStatus = Number(form.stock || 0) === 0 ? "No stock" : Number(form.stock || 0) < 5 ? "Low stock" : "In stock";
  return <form className="admin-panel admin-form" onSubmit={submit} data-testid="form-product"><h2>{selected ? "Edit product" : "Add a product"}</h2><p className="admin-form-intro">Price is stored in paise. Availability follows stock and the explicit availability toggle.</p><div className="admin-form-grid"><Field label="Name *" full><input value={form.name} onChange={(e) => set("name", e.target.value)} required data-testid="input-product-name" /></Field><Field label="Category"><input value={form.category} onChange={(e) => set("category", e.target.value)} data-testid="input-product-category" /></Field><Field label="Stock"><input type="number" min="0" value={form.stock} onChange={(e) => set("stock", Number(e.target.value))} data-testid="input-product-stock" /></Field><Field label="Price (paise)"><input type="number" min="0" value={form.pricePaise} onChange={(e) => set("pricePaise", Number(e.target.value))} data-testid="input-product-price" /><small>Default ₹60 is 6000 paise.</small></Field><Field label="Stock status"><div style={{ paddingTop: 9 }}><Badge value={stockStatus} /></div></Field><Field label="Description" full><textarea value={form.description} onChange={(e) => set("description", e.target.value)} data-testid="textarea-product-description" /></Field><Field label="Availability" full><label style={{ display: "flex", alignItems: "center", gap: 8 }}><input type="checkbox" checked={Boolean(form.available)} onChange={(e) => set("available", e.target.checked)} data-testid="checkbox-product-available" /> Visible in shop when stock is available</label></Field><Field label="Product image" full><UploadField images={form.imageUrls || []} onUpload={async (file) => set("imageUrls", [...(form.imageUrls || []), await uploadAdminImage(file)])} /></Field></div><div className="admin-form-actions"><button className="admin-button" disabled={!form.name.trim() || create.isPending || update.isPending} data-testid="button-save-product">{create.isPending || update.isPending ? "Saving…" : selected ? "Save changes" : "Add product"} <Check size={14} /></button></div></form>;
}

function ProductsPage() {
  const query = useListAdminProducts({ query: { queryKey: getListAdminProductsQueryKey() } }); const archive = useArchiveProduct(); const queryClient = useQueryClient(); const [selected, setSelected] = useState<Product | null>(null); const [search, setSearch] = useState(""); const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const items = useMemo(() => (query.data ?? []).filter((item) => `${item.name} ${item.category}`.toLowerCase().includes(search.toLowerCase())), [query.data, search]);
  async function archiveProduct(id: string) { if (!window.confirm("Archive this product?")) return; try { await archive.mutateAsync({ id }); await queryClient.invalidateQueries({ queryKey: getListAdminProductsQueryKey() }); setMessage({ text: "Product archived." }); } catch (error) { setMessage({ text: apiErrorMessage(error), error: true }); } }
  return <><PageTitle eyebrow="Mission shop" title="Products" text="Keep the live shop accurate: clear descriptions, real stock, and images the team owns." action={<button className="admin-button" onClick={() => setSelected(null)} data-testid="button-add-product"><Package size={14} /> Add product</button>} />{message && <Notice kind={message.error ? "error" : "success"}>{message.text}</Notice>}<div className="admin-toolbar"><div className="admin-search"><Search size={15} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product or category" data-testid="input-search-products" /></div><span className="admin-eyebrow">{items.length} records</span></div><div className="admin-form-layout"><ProductEditor selected={selected} onDone={(text, error) => { setMessage(text ? { text } : { text: error || "Could not save product.", error: true }); if (text) setSelected(null); }} /><section className="admin-panel"><div className="admin-panel-head"><div><h2>Catalog records</h2><p>Availability is persisted with each product.</p></div></div>{query.isLoading ? <LoadingState /> : query.error ? <ErrorState error={query.error} retry={() => void query.refetch()} /> : !items.length ? <EmptyState title="No products found." text="Add a real product to begin stocking the shop." /> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Available</th><th /></tr></thead><tbody>{items.map((product) => <tr key={product.id} data-testid={`row-product-${product.id}`}><td><div className="admin-record-name">{product.name}</div><div className="admin-record-sub">{product.category || "Uncategorised"}</div></td><td>{money(product.pricePaise)}</td><td><Badge value={product.stock === 0 ? "No stock" : product.stock < 5 ? "Low stock" : `${product.stock} in stock`} /></td><td><Badge value={product.available ? "Published" : "Hidden"} /></td><td><div className="admin-actions"><button className="admin-button secondary small" onClick={() => setSelected(product)} data-testid={`button-edit-product-${product.id}`}><PenLine size={12} /> Edit</button><button className="admin-button danger small" onClick={() => void archiveProduct(product.id)} data-testid={`button-archive-product-${product.id}`}><Archive size={12} /> Archive</button></div></td></tr>)}</tbody></table></div>}</section></div></>;
}

function AdoptionsPage() {
  const query = useListAdoptionRequests({ query: { queryKey: getListAdoptionRequestsQueryKey() } }); const update = useUpdateAdoptionRequest(); const queryClient = useQueryClient(); const [selected, setSelected] = useState<AdoptionRequest | null>(null); const [message, setMessage] = useState("");
  async function save(id: string, status: string, notes: string) { try { await update.mutateAsync({ id, data: { status, internalNotes: notes } }); await queryClient.invalidateQueries({ queryKey: getListAdoptionRequestsQueryKey() }); setMessage("Adoption request updated."); setSelected(null); } catch (error) { setMessage(apiErrorMessage(error)); } }
  return <><PageTitle eyebrow="People and placements" title="Adoption requests" text="Read each household carefully, keep internal notes close, and make the next step visible." />{message && <Notice kind={message.includes("updated") ? "success" : "error"}>{message}</Notice>}<section className="admin-panel">{query.isLoading ? <LoadingState /> : query.error ? <ErrorState error={query.error} retry={() => void query.refetch()} /> : !query.data?.length ? <EmptyState title="No adoption requests yet." text="New requests from the public form will appear here." /> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Applicant</th><th>Puppy</th><th>Received</th><th>Status</th><th /></tr></thead><tbody>{query.data.map((row) => <tr key={row.id} data-testid={`row-adoption-${row.id}`}><td><div className="admin-record-name">{row.applicantName}</div><div className="admin-record-sub">{row.email} · {row.city}</div></td><td>{row.puppyName || "General enquiry"}</td><td>{niceDate(row.createdAt)}</td><td><Badge value={row.status} /></td><td><button className="admin-button secondary small" onClick={() => setSelected(row)} data-testid={`button-review-adoption-${row.id}`}>Review <ChevronRight size={12} /></button></td></tr>)}</tbody></table></div>}</section>{selected && <RequestEditor request={selected} onClose={() => setSelected(null)} onSave={save} />}</>;
}

function RequestEditor({ request, onClose, onSave }: { request: AdoptionRequest; onClose: () => void; onSave: (id: string, status: string, notes: string) => Promise<void> }) {
  const [status, setStatus] = useState(request.status); const [notes, setNotes] = useState(request.internalNotes || "");
  return <div className="admin-panel admin-detail" style={{ marginTop: 15 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><div><div className="admin-eyebrow">Request detail</div><h3>{request.applicantName}</h3></div><button className="admin-button secondary small" onClick={onClose} data-testid="button-close-request"><X size={13} /> Close</button></div><div className="admin-detail-row"><label>Contact</label><span>{request.email} · {request.phone}</span></div><div className="admin-detail-row"><label>Household</label><span>{request.livingSituation || "Not supplied"}<br />{request.householdInformation || ""}</span></div><div className="admin-detail-row"><label>Experience</label><span>{request.animalExperience || "Not supplied"}</span></div><div className="admin-form-grid"><Field label="Status"><select value={status} onChange={(e) => setStatus(e.target.value)} data-testid="select-adoption-status"><option>Pending</option><option>Reviewing</option><option>Approved</option><option>Rejected</option><option>Completed</option></select></Field><Field label="Internal notes"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} data-testid="textarea-adoption-notes" /></Field></div><div className="admin-form-actions"><button className="admin-button" onClick={() => void onSave(request.id, status, notes)} data-testid="button-save-adoption">Save request</button></div></div>;
}

function OrdersPage() {
  const query = useListAdminOrders({ query: { queryKey: getListAdminOrdersQueryKey() } }); const update = useUpdateAdminOrder(); const queryClient = useQueryClient(); const [selected, setSelected] = useState<Order | null>(null); const [message, setMessage] = useState("");
  async function save(id: string, payload: { status: string; paymentStatus?: string; deliveryNotes?: string; expectedDelivery?: string | null; deliveryPerson?: string; deliveryPhone?: string; trackingId?: string }) { try { await update.mutateAsync({ id, data: payload }); await queryClient.invalidateQueries({ queryKey: getListAdminOrdersQueryKey() }); setMessage("Order updated."); setSelected(null); } catch (error) { setMessage(apiErrorMessage(error)); } }
  return <><PageTitle eyebrow="Mission shop" title="Orders" text="Verify payment, coordinate delivery, and keep each customer handoff current." />{message && <Notice kind={message.includes("updated") ? "success" : "error"}>{message}</Notice>}<section className="admin-panel">{query.isLoading ? <LoadingState /> : query.error ? <ErrorState error={query.error} retry={() => void query.refetch()} /> : !query.data?.length ? <EmptyState title="No orders yet." text="Orders appear after a verified checkout is created." /> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Delivery</th><th /></tr></thead><tbody>{query.data.map((order) => <tr key={order.id} data-testid={`row-order-${order.id}`}><td><div className="admin-record-name">{order.orderCode}</div><div className="admin-record-sub">{niceDate(order.createdAt)}</div></td><td><div className="admin-record-name">{order.customerName}</div><div className="admin-record-sub">{order.city}</div></td><td>{money(order.totalPaise)}</td><td><Badge value={order.paymentStatus} /></td><td><Badge value={order.status} /></td><td><button className="admin-button secondary small" onClick={() => setSelected(order)} data-testid={`button-review-order-${order.id}`}>Open <ChevronRight size={12} /></button></td></tr>)}</tbody></table></div>}</section>{selected && <OrderEditor order={selected} onClose={() => setSelected(null)} onSave={save} />}</>;
}

function OrderEditor({ order, onClose, onSave }: { order: Order; onClose: () => void; onSave: (id: string, payload: { status: string; paymentStatus?: string; deliveryNotes?: string; expectedDelivery?: string | null; deliveryPerson?: string; deliveryPhone?: string; trackingId?: string }) => Promise<void> }) {
  const [status, setStatus] = useState(order.status); const [payment, setPayment] = useState(order.paymentStatus); const [notes, setNotes] = useState(order.deliveryNotes || ""); const [person, setPerson] = useState(order.deliveryPerson || ""); const [phone, setPhone] = useState(order.deliveryPhone || ""); const [tracking, setTracking] = useState(order.trackingId || ""); const [expected, setExpected] = useState(order.expectedDelivery ? order.expectedDelivery.slice(0, 10) : "");
  return <div className="admin-panel admin-detail" style={{ marginTop: 15 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><div><div className="admin-eyebrow">Order detail</div><h3>{order.orderCode}</h3></div><button className="admin-button secondary small" onClick={onClose} data-testid="button-close-order"><X size={13} /> Close</button></div><div className="admin-detail-row"><label>Customer</label><span>{order.customerName}<br />{order.email} · {order.phone}<br />{order.address}, {order.city}, {order.pinCode}</span></div><div className="admin-detail-row"><label>Total</label><span>{money(order.totalPaise)}</span></div><div className="admin-form-grid"><Field label="Payment"><select value={payment} onChange={(e) => setPayment(e.target.value)} data-testid="select-order-payment"><option>Pending</option><option>Paid</option><option>Failed</option><option>Refunded</option></select></Field><Field label="Delivery status"><select value={status} onChange={(e) => setStatus(e.target.value)} data-testid="select-order-status"><option>Pending</option><option>Preparing</option><option>Dispatched</option><option>Delivered</option><option>Delayed</option><option>Cancelled</option></select></Field><Field label="Expected delivery"><input type="date" value={expected} onChange={(e) => setExpected(e.target.value)} data-testid="input-order-expected" /></Field><Field label="Tracking ID"><input value={tracking} onChange={(e) => setTracking(e.target.value)} data-testid="input-order-tracking" /></Field><Field label="Delivery person"><input value={person} onChange={(e) => setPerson(e.target.value)} data-testid="input-order-delivery-person" /></Field><Field label="Delivery phone"><input value={phone} onChange={(e) => setPhone(e.target.value)} data-testid="input-order-delivery-phone" /></Field><Field label="Delivery notes" full><textarea value={notes} onChange={(e) => setNotes(e.target.value)} data-testid="textarea-order-notes" /></Field></div><div className="admin-form-actions"><button className="admin-button" onClick={() => void onSave(order.id, { status, paymentStatus: payment, deliveryNotes: notes, expectedDelivery: expected || null, deliveryPerson: person, deliveryPhone: phone, trackingId: tracking })} data-testid="button-save-order">Save order</button></div></div>;
}

type GenericRecord = Record<string, unknown> & { id?: string };
function useAdminRecords(path: string) {
  return useQuery({ queryKey: [path], queryFn: () => adminJson<GenericRecord[]>(path) });
}
function GenericPage({ title, eyebrow, text, path, actionLabel }: { title: string; eyebrow: string; text: string; path: string; actionLabel?: string }) {
  const query = useAdminRecords(path); const queryClient = useQueryClient(); const [selected, setSelected] = useState<GenericRecord | null>(null); const [creating, setCreating] = useState(false); const [message, setMessage] = useState("");
  async function update(record: GenericRecord, patch: Record<string, unknown>) { if (!record.id) return; try { await adminJson(`${path}/${record.id}`, { method: "PATCH", body: JSON.stringify(patch) }); await queryClient.invalidateQueries({ queryKey: [path] }); setMessage("Record updated."); setSelected(null); } catch (error) { setMessage(apiErrorMessage(error)); } }
  async function create(payload: Record<string, unknown>) { try { await adminJson(path, { method: "POST", body: JSON.stringify(payload) }); await queryClient.invalidateQueries({ queryKey: [path] }); setMessage("Record created."); setCreating(false); } catch (error) { setMessage(apiErrorMessage(error)); } }
  const records = query.data ?? [];
  const canCreate = title === "Stories" || title === "Content" || title === "Settings";
  return <><PageTitle eyebrow={eyebrow} title={title} text={text} action={actionLabel ? <button className="admin-button secondary" disabled={!canCreate} onClick={() => setCreating(true)} data-testid={`button-${title.toLowerCase().replace(/\s+/g, "-")}-add`}>{canCreate ? actionLabel : `${actionLabel} unavailable`}</button> : undefined} />{message && <Notice kind={message.includes("created") || message.includes("updated") ? "success" : "error"}>{message}</Notice>}{creating && <GenericCreateForm title={title} onClose={() => setCreating(false)} onSave={create} />}<section className="admin-panel">{query.isLoading ? <LoadingState /> : query.error ? <div className="admin-error" data-testid="admin-unavailable"><strong>This backend surface is unavailable.</strong><span>{apiErrorMessage(query.error)} The admin UI will not invent records until the route is enabled.</span></div> : !records.length ? <EmptyState title={`No ${title.toLowerCase()} yet.`} text="The live API returned no records." /> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Record</th><th>Contact</th><th>Status</th><th>Created</th><th /></tr></thead><tbody>{records.map((record, index) => { const id = String(record.id ?? index); return <tr key={id} data-testid={`row-record-${id}`}><td><div className="admin-record-name">{String(record.name ?? record.title ?? record.subject ?? record.customerName ?? "Record")}</div><div className="admin-record-sub">{String(record.message ?? record.details ?? record.email ?? "")}</div></td><td>{String(record.email ?? record.phone ?? record.city ?? "—")}</td><td><Badge value={String(record.status ?? "Unreviewed")} /></td><td>{niceDate(String(record.createdAt ?? ""))}</td><td>{record.id && <button className="admin-button secondary small" onClick={() => setSelected(record)} data-testid={`button-edit-record-${id}`}><PenLine size={12} /> Update</button>}</td></tr>; })}</tbody></table></div>}</section>{selected && <GenericEditor record={selected} onClose={() => setSelected(null)} onSave={(patch) => update(selected, patch)} title={title} />}</>;
}

function GenericCreateForm({ title, onClose, onSave }: { title: string; onClose: () => void; onSave: (payload: Record<string, unknown>) => Promise<void> }) {
  const [name, setName] = useState(""); const [description, setDescription] = useState(""); const [status, setStatus] = useState(title === "Stories" ? "Unpublished" : "Draft");
  return <form className="admin-panel admin-form" style={{ marginBottom: 15 }} onSubmit={(event) => { event.preventDefault(); void onSave({ name, title: name, description, body: description, status }); }} data-testid={`form-create-${title.toLowerCase()}`}><div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><div><div className="admin-eyebrow">New {title.toLowerCase().slice(0, -1)}</div><h2>Create record</h2></div><button type="button" className="admin-button secondary small" onClick={onClose} data-testid="button-cancel-create"><X size={13} /> Cancel</button></div><div className="admin-form-grid"><Field label="Title or name" full><input value={name} onChange={(e) => setName(e.target.value)} required data-testid="input-generic-name" /></Field><Field label="Copy or description" full><textarea value={description} onChange={(e) => setDescription(e.target.value)} data-testid="textarea-generic-description" /></Field><Field label="Status"><select value={status} onChange={(e) => setStatus(e.target.value)} data-testid="select-generic-status"><option>Draft</option><option>Unpublished</option><option>Published</option></select></Field></div><div className="admin-form-actions"><button className="admin-button" data-testid="button-save-generic">Create {title.toLowerCase().slice(0, -1)} <Check size={14} /></button></div></form>;
}

function GenericEditor({ record, title, onClose, onSave }: { record: GenericRecord; title: string; onClose: () => void; onSave: (patch: Record<string, unknown>) => Promise<void> }) {
  const [status, setStatus] = useState(String(record.status ?? "Pending")); const [notes, setNotes] = useState(String(record.internalNotes ?? record.notes ?? ""));
  return <div className="admin-panel admin-detail" style={{ marginTop: 15 }}><div style={{ display: "flex", justifyContent: "space-between" }}><div><div className="admin-eyebrow">{title} detail</div><h3>{String(record.name ?? record.title ?? record.applicantName ?? "Record")}</h3></div><button className="admin-button secondary small" onClick={onClose} data-testid="button-close-record"><X size={13} /> Close</button></div><div className="admin-detail-row"><label>Message</label><span>{String(record.message ?? record.details ?? record.additionalMessage ?? "No message supplied.")}</span></div><div className="admin-form-grid"><Field label="Status"><select value={status} onChange={(e) => setStatus(e.target.value)} data-testid="select-record-status"><option>Pending</option><option>Reviewing</option><option>Contacted</option><option>Approved</option><option>Rejected</option><option>Completed</option><option>Published</option><option>Unpublished</option></select></Field><Field label="Internal notes"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} data-testid="textarea-record-notes" /></Field></div><div className="admin-form-actions"><button className="admin-button" onClick={() => void onSave({ status, internalNotes: notes, notes })} data-testid="button-save-record">Save update</button></div></div>;
}

function AdminApp() {
  const { loading, user, isAdmin } = useFirebaseAuth();
  const [location] = useLocation();
  if (loading) return <div className="admin-root"><LoadingState /></div>;
  if (!user || !isAdmin) return <div className="admin-root"><div className="admin-content"><div className="admin-error" style={{ margin: "15vh auto", maxWidth: 520 }} data-testid="admin-access-denied"><strong>Admin access required.</strong><span>Sign in with an authorized SaveStreet Dogs Firebase account to open this workspace.</span><div style={{ marginTop: 16 }}><Link href="/admin/login" className="admin-button" data-testid="link-admin-login">Go to admin sign in <ArrowRight size={14} /></Link></div></div></div></div>;
  const page = location.split("?")[0];
  let content: ReactNode;
  if (page === "/admin" || page === "/admin/") content = <Overview />;
  else if (page === "/admin/puppies") content = <PuppiesPage />;
  else if (page === "/admin/products") content = <ProductsPage />;
  else if (page === "/admin/adoptions") content = <AdoptionsPage />;
  else if (page === "/admin/orders") content = <OrdersPage />;
  else if (page === "/admin/rescue-reports") content = <GenericPage title="Rescue reports" eyebrow="Incoming care" text="Triage reports from the public form and keep the response status visible." path="/api/admin/rescue-reports" actionLabel="New report" />;
  else if (page === "/admin/volunteers") content = <GenericPage title="Volunteers" eyebrow="People power" text="Review interest, record the next conversation, and keep reliable helpers close." path="/api/admin/volunteers" actionLabel="Add volunteer" />;
  else if (page === "/admin/foster") content = <GenericPage title="Foster" eyebrow="Temporary homes" text="Track foster interest and the follow-up that helps dogs settle safely." path="/api/admin/foster" actionLabel="Add foster" />;
  else if (page === "/admin/stories") content = <GenericPage title="Stories" eyebrow="Public journal" text="Publish the real work when a story is ready, and unpublish it when it needs review." path="/api/admin/stories" actionLabel="New story" />;
  else if (page === "/admin/customers") content = <GenericPage title="Customers" eyebrow="Community records" text="A live view of customer records returned by the API." path="/api/admin/customers" actionLabel="Add customer" />;
  else if (page === "/admin/content") content = <GenericPage title="Content" eyebrow="Site control" text="Manage public copy through the backend content routes when enabled." path="/api/admin/content" actionLabel="New content" />;
  else if (page === "/admin/settings") content = <GenericPage title="Settings" eyebrow="Workspace controls" text="Operational settings are shown only when the backend route is available." path="/api/admin/settings" actionLabel="Add setting" />;
  else content = <Overview />;
  return <AdminShell>{content}</AdminShell>;
}

export default AdminApp;