import { Mail, MessageCircle, Phone } from "lucide-react";
import {
  makeEmailHref,
  makePhoneHref,
  makeWhatsAppHref,
  useSiteContact,
} from "@/lib/site-contact";

export function WhatsAppAction({
  message,
  label = "WhatsApp the team",
  className = "btn btn-light",
}: {
  message: string;
  label?: string;
  className?: string;
}) {
  const contact = useSiteContact();
  const href = makeWhatsAppHref(contact, message);
  if (!href) return <span className={`${className} contact-disabled`} aria-disabled="true" title="WhatsApp contact is coming soon"><MessageCircle size={15} aria-hidden="true" />WhatsApp coming soon</span>;
  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
      <MessageCircle size={15} aria-hidden="true" />
      {label}
    </a>
  );
}

export function ContactActionLinks({
  message,
  variant = "footer",
}: {
  message: string;
  variant?: "footer" | "panel";
}) {
  const contact = useSiteContact();
  return (
    <div className={`site-contact-actions ${variant}`}>
      {makeWhatsAppHref(contact, message)
        ? <a href={makeWhatsAppHref(contact, message)} target="_blank" rel="noopener noreferrer"><MessageCircle size={15} aria-hidden="true" />WhatsApp the team</a>
        : <span className="contact-disabled" aria-disabled="true"><MessageCircle size={15} aria-hidden="true" />WhatsApp coming soon</span>}
      <a href={makeEmailHref(contact)}>
        <Mail size={15} aria-hidden="true" />
        {contact.email}
      </a>
      {contact.phone ? <a href={makePhoneHref(contact)}><Phone size={15} aria-hidden="true" />Call {contact.phone}</a> : <span className="contact-disabled"><Phone size={15} aria-hidden="true" />Phone details coming soon</span>}
    </div>
  );
}