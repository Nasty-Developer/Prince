import { useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { ArrowRight, Check, LockKeyhole, MapPin, PawPrint, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import type { Product } from "@workspace/api-client-react";
import { useFirebaseAuth } from "@/lib/auth-context";
import {
  apiErrorMessage,
  storefrontJson,
  storageImageUrl,
  type CreatedOrder,
} from "./api";
import "./storefront.css";

export type StorefrontCartLine = Product & { quantity: number };

type CheckoutPageProps = {
  cart: StorefrontCartLine[];
  setCart: Dispatch<SetStateAction<StorefrontCartLine[]>>;
};

const money = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

function CheckoutEmpty() {
  return (
    <main className="storefront-page">
      <div className="storefront-wrap storefront-centered-state">
        <div className="storefront-card">
          <div className="storefront-state-mark"><PawPrint size={22} /></div>
          <p className="storefront-kicker">Nothing to hand over yet</p>
          <h2>Your cart is empty.</h2>
          <p className="storefront-hero-copy" style={{ margin: "12px auto 24px" }}>
            Choose a small good from the shop and your purchase will help keep care moving in Kota.
          </p>
          <Link href="/products" className="btn btn-primary">Browse the shop <ArrowRight size={15} /></Link>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage({ cart, setCart }: CheckoutPageProps) {
  const { loading: authLoading, user } = useFirebaseAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<CreatedOrder | null>(null);
  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.priceRupees, 0);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
      setError("Please sign in before placing an order.");
      return;
    }
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const created = await storefrontJson<CreatedOrder>("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          customerName: String(form.get("customerName") ?? "").trim(),
          phone: String(form.get("phone") ?? "").trim(),
          email: String(form.get("email") ?? "").trim(),
          address: String(form.get("address") ?? "").trim(),
          city: String(form.get("city") ?? "").trim(),
          state: String(form.get("state") ?? "").trim(),
          pinCode: String(form.get("pinCode") ?? "").trim(),
          deliveryNotes: String(form.get("deliveryNotes") ?? "").trim(),
          items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
          paymentDone: true,
        }),
      });
      setOrder(created);
      setCart([]);
    } catch (submitError) {
      setError(apiErrorMessage(submitError));
    } finally {
      setBusy(false);
    }
  }

  if (authLoading) {
    return (
      <main className="storefront-page">
        <div className="storefront-wrap storefront-centered-state">
          <div className="storefront-card storefront-skeleton" aria-label="Loading checkout">
            <span style={{ width: "38%", height: 28 }} /><span /><span />
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="storefront-page">
        <div className="storefront-wrap storefront-centered-state">
          <div className="storefront-card">
            <div className="storefront-state-mark"><LockKeyhole size={21} /></div>
            <p className="storefront-kicker">A secure handoff</p>
            <h2>Sign in to continue.</h2>
            <p className="storefront-hero-copy" style={{ margin: "12px auto 24px" }}>
              Orders are connected to your signed-in account so you can return to the delivery trail.
            </p>
            <Link href="/login" className="btn btn-primary">Sign in <ArrowRight size={15} /></Link>
          </div>
        </div>
      </main>
    );
  }

  if (!cart.length && !order) return <CheckoutEmpty />;

  if (order) {
    return (
      <main className="storefront-page">
        <div className="storefront-wrap storefront-centered-state">
          <div className="storefront-card">
            <div className="storefront-success">
              <ShieldCheck size={24} />
              <h2>Order received.</h2>
              <p>
                Your request is saved. The SaveStreet team will review the payment and coordinate delivery; this page does not verify payment.
              </p>
              <span className="storefront-code">{order.orderCode}</span>
              <div>
                <Link href={`/orders/${order.orderCode}`} className="btn btn-dark">
                  Track this order <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="storefront-page">
      <div className="storefront-wrap">
        <header className="storefront-hero">
          <div>
            <p className="storefront-kicker">One last step</p>
            <h1>Your order,<br /><em>clearly handed over.</em></h1>
            <p className="storefront-hero-copy">
              Pay by UPI, share where it should go, and keep the reference for the delivery trail.
            </p>
          </div>
          <div className="storefront-reference">
            <MapPin size={15} /> <span>Care coordinated in <strong>Kota, Rajasthan</strong></span>
          </div>
        </header>

        <div className="storefront-layout">
          <section className="storefront-card">
            <p className="storefront-kicker">Delivery details</p>
            <h2>Where should we send it?</h2>
            {error && <div className="storefront-alert" role="alert">{error}</div>}
            <form className="storefront-form" onSubmit={submit}>
              <div className="storefront-field">
                <label htmlFor="customerName">Name *</label>
                <input id="customerName" name="customerName" autoComplete="name" required minLength={2} />
              </div>
              <div className="storefront-field">
                <label htmlFor="phone">Phone *</label>
                <input id="phone" name="phone" type="tel" autoComplete="tel" required minLength={6} />
              </div>
              <div className="storefront-field storefront-field-wide">
                <label htmlFor="email">Email *</label>
                <input id="email" name="email" type="email" autoComplete="email" required />
              </div>
              <div className="storefront-field storefront-field-wide">
                <label htmlFor="address">Address *</label>
                <textarea id="address" name="address" autoComplete="street-address" required minLength={5} />
              </div>
              <div className="storefront-field">
                <label htmlFor="city">City *</label>
                <input id="city" name="city" autoComplete="address-level2" required minLength={2} />
              </div>
              <div className="storefront-field">
                <label htmlFor="state">State *</label>
                <input id="state" name="state" autoComplete="address-level1" required minLength={2} />
              </div>
              <div className="storefront-field">
                <label htmlFor="pinCode">PIN code *</label>
                <input id="pinCode" name="pinCode" inputMode="numeric" autoComplete="postal-code" required minLength={4} />
              </div>
              <div className="storefront-field">
                <label htmlFor="deliveryNotes">Delivery notes</label>
                <input id="deliveryNotes" name="deliveryNotes" placeholder="Optional landmark or timing note" />
              </div>

              <div className="storefront-field storefront-field-wide">
                <label>UPI payment</label>
                <div className="storefront-payment">
                  <img src="/assets/payment-qr.jpg" alt="UPI payment QR code for SaveStreet Dogs" />
                  <div>
                    <p>Scan the exact amount of <strong>{money(subtotal)}</strong> using any UPI app. Keep your payment confirmation for your records.</p>
                    <label className="storefront-check">
                      <input name="paymentDone" type="checkbox" required />
                      <span>
                        Payment Done
                        <small>I have completed the UPI payment. The SaveStreet team will review it; this checkbox is not payment verification.</small>
                      </span>
                    </label>
                  </div>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={busy}>
                {busy ? "Saving order…" : "Place order"} {!busy && <ArrowRight size={15} />}
              </button>
            </form>
          </section>

          <aside className="storefront-summary">
            <p className="storefront-kicker">Your basket</p>
            <h2>Small goods.<br />Practical good.</h2>
            {cart.map((item) => {
              const image = storageImageUrl(item.imageUrls?.[0]);
              return (
                <div className="storefront-order-line" key={item.id}>
                  <div className="storefront-order-thumb">
                    {image ? <img src={image} alt="" /> : <span><PawPrint size={17} /></span>}
                  </div>
                  <div><strong>{item.name}</strong><small>{item.quantity} × {money(item.priceRupees)}</small></div>
                  <span className="storefront-order-price">{money(item.quantity * item.priceRupees)}</span>
                </div>
              );
            })}
            <div className="storefront-total"><span>Total</span><strong>{money(subtotal)}</strong></div>
            <p className="storefront-summary-note">All amounts are Indian rupees (INR). Delivery coordination follows the team’s payment review.</p>
          </aside>
        </div>
      </div>
    </main>
  );
}