import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, CalendarDays, Check, MapPin, PawPrint, ShieldCheck, Truck } from "lucide-react";
import { Link, useRoute } from "wouter";
import { useFirebaseAuth } from "@/lib/auth-context";
import {
  apiErrorMessage,
  storefrontJson,
  storageImageUrl,
  type OrderProduct,
  type OrderTimelineEntry,
  type TrackedOrder,
} from "./api";
import "./storefront.css";

const money = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

function firstDefined(...values: Array<string | number | undefined | null>): string | number | undefined {
  return values.find((value) => value !== undefined && value !== null && value !== "") as string | number | undefined;
}

function titleCase(value?: string) {
  if (!value) return "Not updated";
  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function normaliseItems(order: TrackedOrder): OrderProduct[] {
  return (order.items ?? order.products ?? []).map((item) => ({
    ...item,
    name: item.name ?? item.productName,
    imagePath: item.imagePath ?? item.imageUrl ?? item.productImageUrl,
    unitPriceRupees: item.unitPriceRupees ?? item.priceRupees,
  }));
}

function normaliseTimeline(order: TrackedOrder): OrderTimelineEntry[] {
  if (order.timeline?.length || order.statusTimeline?.length) return order.timeline ?? order.statusTimeline ?? [];
  const statuses = ["Payment Pending", "Payment Verified", "Preparing", "Ready to Dispatch", "Dispatched", "Out for Delivery", "Delivered"];
  const current = order.orderStatus ?? order.status ?? "Payment Pending";
  const currentIndex = statuses.indexOf(current);
  const timeline: OrderTimelineEntry[] = statuses.map((status, index) => ({
    status,
    label: status,
    completed: current === "Delayed" ? index < Math.max(0, statuses.indexOf("Dispatched")) : currentIndex >= 0 && index <= currentIndex,
    current: status === current,
    date: index === 0 ? order.createdAt : undefined,
  }));
  if (current === "Delayed") timeline.push({ status: "Delayed", label: "Delayed", description: order.delayReason, completed: false, current: true, date: order.updatedAt });
  return timeline;
}

function StateCard({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="storefront-wrap storefront-centered-state">
      <div className="storefront-card">
        <div className="storefront-state-mark"><PawPrint size={22} /></div>
        <p className="storefront-kicker">Order trail</p>
        <h2>{title}</h2>
        <p className="storefront-hero-copy" style={{ margin: "12px auto 24px" }}>{text}</p>
        {action}
      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  const [, params] = useRoute("/orders/:orderCode");
  const { loading: authLoading, user } = useFirebaseAuth();
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const orderCode = params?.orderCode?.trim() ?? "";

  useEffect(() => {
    let active = true;
    if (authLoading) return () => { active = false; };
    if (!user || !orderCode) {
      setLoading(false);
      return () => { active = false; };
    }
    setLoading(true);
    setError("");
    void storefrontJson<TrackedOrder>(`/api/orders/${encodeURIComponent(orderCode)}`)
      .then((result) => {
        if (active) setOrder(result);
      })
      .catch((requestError: unknown) => {
        if (active) setError(apiErrorMessage(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [authLoading, orderCode, user]);

  if (authLoading || loading) {
    return (
      <main className="storefront-page">
        <div className="storefront-wrap storefront-centered-state">
          <div className="storefront-card storefront-skeleton" aria-label="Loading order">
            <span style={{ width: "42%", height: 30 }} /><span /><span /><span style={{ width: "80%" }} />
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="storefront-page">
        <StateCard
          title="Sign in to see your order."
          text="Your delivery trail is private to the account that placed the order."
          action={<Link href="/login" className="btn btn-primary">Sign in <ArrowLeft size={15} /></Link>}
        />
      </main>
    );
  }

  if (!orderCode) {
    return (
      <main className="storefront-page">
        <StateCard title="No order reference yet." text="Open tracking from the order confirmation so we know which delivery trail to show." action={<Link href="/products" className="btn btn-primary">Back to the shop <ArrowLeft size={15} /></Link>} />
      </main>
    );
  }

  if (error) {
    return (
      <main className="storefront-page">
        <StateCard title="We could not load this order." text={error} action={<Link href="/products" className="btn btn-ghost">Back to the shop <ArrowLeft size={15} /></Link>} />
      </main>
    );
  }

  if (!order) {
    return (
      <main className="storefront-page">
        <StateCard title="Order details are empty." text="This order has no details to display right now. Please return from your confirmation link or try again later." />
      </main>
    );
  }

  const items = normaliseItems(order);
  const timeline = normaliseTimeline(order);
  const total = Number(firstDefined(order.totalRupees, order.total, items.reduce((sum, item) => sum + Number(item.totalRupees ?? (item.quantity ?? 0) * Number(item.unitPriceRupees ?? item.priceRupees ?? 0)), 0)) ?? 0);
  const destination = order.delivery;
  const deliveryNotes = destination?.notes ?? order.deliveryNotes;
  const expectedDate = order.expectedDate ?? order.estimatedDeliveryDate ?? order.expectedDelivery;
  const currentStatus = order.orderStatus ?? order.status;

  return (
    <main className="storefront-page">
      <div className="storefront-wrap">
        <header className="storefront-tracking-head" style={{ paddingTop: 65 }}>
          <div>
            <p className="storefront-kicker">Order trail</p>
            <h1>On its way,<br /><em>one clear step at a time.</em></h1>
          </div>
          <div className="storefront-order-meta">
            <span className="storefront-pill">{order.orderCode ?? orderCode}</span>
            {currentStatus && <span className="storefront-pill">{titleCase(currentStatus)}</span>}
          </div>
        </header>

        <section className="storefront-layout">
          <div>
            <div className="storefront-card storefront-items">
              <p className="storefront-kicker">What you ordered</p>
              <h2>Goods supporting care in Kota.</h2>
              {items.length ? items.map((item, index) => {
                const itemImage = storageImageUrl(item.imagePath ?? item.imageUrl ?? item.imageUrls?.[0]);
                const quantity = Number(item.quantity ?? 0);
                const unitPrice = Number(item.unitPriceRupees ?? item.priceRupees ?? 0);
                const lineTotal = Number(item.totalRupees ?? quantity * unitPrice);
                return (
                  <div className="storefront-tracking-item" key={`${item.productId ?? item.name ?? "item"}-${index}`}>
                    <div className="storefront-tracking-image">
                      {itemImage ? <img src={itemImage} alt="" /> : <span><PawPrint size={22} /></span>}
                    </div>
                    <div>
                      <h3>{item.name ?? "SaveStreet Dogs product"}</h3>
                      <p>{quantity} × {money(unitPrice)} each</p>
                    </div>
                    <strong className="storefront-tracking-item-price">{money(lineTotal)}</strong>
                  </div>
                );
              }) : <p style={{ color: "#526a64", padding: "20px 0" }}>No products were included in this order response.</p>}
              <div className="storefront-subtotal"><span>Total</span><strong>{money(total)}</strong></div>
            </div>

            <div className="storefront-detail-grid">
              <section className="storefront-detail">
                <MapPin size={19} color="#c46d51" />
                <h3>Delivery details</h3>
                <p><strong>{order.customerName ?? "Customer"}</strong></p>
                <p>{destination?.address ?? order.address ?? "Address not provided"}</p>
                <p>{[destination?.city ?? order.city, destination?.state ?? order.state, destination?.pinCode ?? order.pinCode].filter(Boolean).join(", ") || "Location not provided"}</p>
                {deliveryNotes ? <p>{deliveryNotes}</p> : null}
              </section>
              <section className="storefront-detail">
                <ShieldCheck size={19} color="#c46d51" />
                <h3>Payment handoff</h3>
                <p><strong>Status</strong> {titleCase(order.paymentStatus)}</p>
                <p>Payment is reviewed by the SaveStreet team. Customer confirmation is not shown as verification.</p>
                {order.delayReason ? <p><strong>Delay note:</strong> {order.delayReason}</p> : null}
              </section>
            </div>
          </div>

          <aside className="storefront-summary">
            <p className="storefront-kicker">Delivery status</p>
            <h2>{titleCase(currentStatus)}</h2>
            {expectedDate && <p className="storefront-summary-note"><CalendarDays size={14} style={{ verticalAlign: "middle", marginRight: 6 }} /> Expected {formatDate(expectedDate)}</p>}
            {order.delayReason && <div className="storefront-alert" style={{ marginTop: 18 }}>{order.delayReason}</div>}
            <div className="storefront-timeline">
              {timeline.length ? timeline.map((entry, index) => (
                <div className={`storefront-timeline-entry ${entry.current ? "current" : ""} ${entry.completed ? "completed" : ""}`} key={`${entry.status ?? entry.label ?? "step"}-${index}`}>
                  <div className="storefront-timeline-dot">{entry.completed && <Check size={15} color="#173833" style={{ margin: 4 }} />}</div>
                  <div>
                    <h4>{titleCase(entry.label ?? entry.status)}</h4>
                    {entry.description && <p>{entry.description}</p>}
                    {(entry.date ?? entry.timestamp) && <span className="storefront-timeline-date">{formatDate(entry.date ?? entry.timestamp)}</span>}
                  </div>
                </div>
              )) : (
                <div className="storefront-timeline-entry current">
                  <div className="storefront-timeline-dot" />
                  <div><h4>Status updates will appear here</h4><p>The care team has not added a timeline entry yet.</p></div>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 9, alignItems: "center", marginTop: 17, color: "#c0d0c8", fontSize: 11 }}>
              <Truck size={15} /> <span>Delivery information is updated by the care team.</span>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}