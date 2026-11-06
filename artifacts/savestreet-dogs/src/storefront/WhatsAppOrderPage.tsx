import { useMemo, useState, type FormEvent } from "react";
import { ArrowRight, Check, MessageCircle, Minus, PawPrint, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import {
  makeEmailComposerHref,
  makeWhatsAppHref,
  useSiteContact,
} from "@/lib/site-contact";
import {
  EMPTY_CUSTOMER,
  buildOrderMessage,
  normalisePhone,
  orderReference,
  orderTotal,
  validateCustomer,
  type OrderCustomer,
} from "./whatsapp-order";
import "./storefront.css";

export type WhatsAppCartLine = {
  id: string;
  name: string;
  quantity: number;
  priceRupees: number;
};

type WhatsAppOrderPageProps = {
  cart: WhatsAppCartLine[];
  onQuantityChange: (id: string, delta: number) => void;
};

const money = (value: number) =>
  `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function WhatsAppOrderPage({ cart, onQuantityChange }: WhatsAppOrderPageProps) {
  const contact = useSiteContact();
  const [customer, setCustomer] = useState<OrderCustomer>(EMPTY_CUSTOMER);
  const [reference, setReference] = useState(() => orderReference());
  const [problems, setProblems] = useState<string[]>([]);
  const [sent, setSent] = useState(false);

  const lines = useMemo(
    () =>
      cart
        .map((line) => ({
          name: line.name,
          quantity: line.quantity,
          priceRupees: line.priceRupees,
        }))
        .filter((line) => line.quantity > 0),
    [cart],
  );

  const total = orderTotal(lines);
  const message = buildOrderMessage(customer, lines, reference);
  const whatsappHref = makeWhatsAppHref(contact, message);
  const emailHref = makeEmailComposerHref(
    contact,
    `Order ${reference} — SaveStreet Dogs`,
    message,
  );

  const setField = (field: keyof OrderCustomer) => (value: string) =>
    setCustomer((current) => ({ ...current, [field]: value }));

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateCustomer(customer, lines);
    setProblems(found);
    if (found.length) return;
    if (!whatsappHref) {
      setProblems([
        "The team's WhatsApp number is not set up yet. Send the order by email instead, or ask the team to add it in the admin settings.",
      ]);
      return;
    }
    window.open(whatsappHref, "_blank", "noopener,noreferrer");
    setSent(true);
  }

  function startAnother() {
    setSent(false);
    setReference(orderReference());
    setCustomer(EMPTY_CUSTOMER);
    setProblems([]);
  }

  if (!lines.length && !sent) {
    return (
      <main className="storefront-page">
        <div className="storefront-wrap storefront-centered-state">
          <div className="storefront-card">
            <div className="storefront-state-mark"><PawPrint size={22} /></div>
            <p className="storefront-kicker">Nothing to book yet</p>
            <h2>Your order is empty.</h2>
            <p className="storefront-hero-copy" style={{ margin: "12px auto 24px" }}>
              Pick a reflective collar and the order form will collect the delivery details for the team.
            </p>
            <Link href="/products" className="btn btn-primary">Visit the shop <ArrowRight size={15} /></Link>
          </div>
        </div>
      </main>
    );
  }

  if (sent) {
    return (
      <main className="storefront-page">
        <div className="storefront-wrap storefront-centered-state">
          <div className="storefront-card storefront-success">
            <div className="storefront-state-mark"><Check size={22} /></div>
            <p className="storefront-kicker">Order sent to WhatsApp</p>
            <h2>Almost booked.</h2>
            <p className="storefront-hero-copy">
              Your order is written out and waiting in WhatsApp. Press send there and the team will confirm
              availability, delivery and payment.
            </p>
            <div className="storefront-code">
              <span>Order reference</span>
              <strong>{reference}</strong>
            </div>
            <div className="whatsapp-order-actions">
              <a className="btn btn-primary" href={whatsappHref} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={15} /> Open WhatsApp again
              </a>
              <button type="button" className="btn btn-ghost" onClick={startAnother}>
                Place another order
              </button>
            </div>
            <p className="storefront-alert" style={{ marginTop: 18 }}>
              Nothing is charged on this site. The team replies on WhatsApp with delivery and payment details.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="storefront-page">
      <div className="storefront-wrap">
        <header className="storefront-hero">
          <p className="storefront-kicker">Book on WhatsApp</p>
          <h1>
            Order in a minute.
            <br />
            <em>No account needed.</em>
          </h1>
          <p className="storefront-hero-copy">
            Fill in where the collars should go and we will open WhatsApp with the full order ready to send.
            The team confirms stock, delivery and payment in the same chat.
          </p>
        </header>

        <div className="storefront-layout">
          <form className="storefront-card" onSubmit={submit} noValidate>
            <h2>Delivery details</h2>
            <div className="storefront-form">
              <div className="storefront-field">
                <label htmlFor="orderName">Name *</label>
                <input
                  id="orderName"
                  name="name"
                  autoComplete="name"
                  value={customer.name}
                  onChange={(event) => setField("name")(event.target.value)}
                  required
                />
              </div>
              <div className="storefront-field">
                <label htmlFor="orderPhone">Phone *</label>
                <input
                  id="orderPhone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="10-digit mobile"
                  value={customer.phone}
                  onChange={(event) => setField("phone")(event.target.value)}
                  required
                />
              </div>
              <div className="storefront-field storefront-field-wide">
                <label htmlFor="orderAddress">Address *</label>
                <textarea
                  id="orderAddress"
                  name="address"
                  autoComplete="street-address"
                  placeholder="House or building, street, area"
                  value={customer.address}
                  onChange={(event) => setField("address")(event.target.value)}
                  required
                />
              </div>
              <div className="storefront-field">
                <label htmlFor="orderCity">City *</label>
                <input
                  id="orderCity"
                  name="city"
                  autoComplete="address-level2"
                  value={customer.city}
                  onChange={(event) => setField("city")(event.target.value)}
                  required
                />
              </div>
              <div className="storefront-field">
                <label htmlFor="orderPincode">PIN code</label>
                <input
                  id="orderPincode"
                  name="pincode"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="6 digits"
                  value={customer.pincode}
                  onChange={(event) => setField("pincode")(event.target.value)}
                />
              </div>
              <div className="storefront-field storefront-field-wide">
                <label htmlFor="orderNotes">Anything else?</label>
                <textarea
                  id="orderNotes"
                  name="notes"
                  placeholder="Collar colours, a landmark, a delivery time that suits you"
                  value={customer.notes}
                  onChange={(event) => setField("notes")(event.target.value)}
                />
              </div>
            </div>

            {problems.length > 0 && (
              <div className="storefront-alert" role="alert">
                <strong>Please check these before sending.</strong>
                <ul>
                  {problems.map((problem) => (
                    <li key={problem}>{problem}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="whatsapp-order-actions">
              <button type="submit" className="btn btn-primary" disabled={!whatsappHref}>
                <MessageCircle size={15} /> Send order on WhatsApp
              </button>
              {!whatsappHref && (
                <a className="btn btn-ghost" href={emailHref}>
                  Send the order by email instead
                </a>
              )}
            </div>
            <p className="whatsapp-order-note">
              <ShieldCheck size={14} aria-hidden="true" /> Nothing is charged here. Payment is settled with the
              team after they confirm your order.
            </p>
          </form>

          <aside className="storefront-summary">
            <p className="storefront-kicker">Your order</p>
            <h2>{lines.length === 1 ? "One small good." : `${lines.length} small goods.`}</h2>
            <div className="storefront-order-lines">
              {cart.map((line) => (
                <div className="storefront-order-line" key={line.id}>
                  <div className="storefront-order-thumb">
                    <span>{line.quantity}</span>
                  </div>
                  <div>
                    <strong>{line.name}</strong>
                    <small>{money(line.priceRupees)} each</small>
                    <div className="qty">
                      <button
                        type="button"
                        aria-label={`Remove one ${line.name}`}
                        onClick={() => onQuantityChange(line.id, -1)}
                      >
                        <Minus size={12} />
                      </button>
                      <span>{line.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Add one ${line.name}`}
                        onClick={() => onQuantityChange(line.id, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <span className="storefront-order-price">
                    {money(line.priceRupees * line.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="storefront-total">
              <span>Total</span>
              <strong>{money(total)}</strong>
            </div>
            <p className="storefront-summary-note">
              Reference {reference}. Keep it handy — the team quotes it when they reply.
            </p>
            <p className="storefront-summary-note">
              Stock is not tracked live, so availability is confirmed in the chat.
            </p>
            <Link href="/products" className="btn btn-ghost" style={{ width: "100%" }}>
              Add another piece
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
