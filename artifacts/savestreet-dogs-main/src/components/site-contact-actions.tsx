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
  return (
    <a
      className={className}
      href={makeWhatsAppHref(contact, message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} at ${contact.whatsapp}`}
    >
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
      <a
        href={makeWhatsAppHref(contact, message)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <MessageCircle size={15} aria-hidden="true" />
        WhatsApp SaveStreet Dogs
      </a>
      <a href={makeEmailHref(contact)}>
        <Mail size={15} aria-hidden="true" />
        {contact.email}
      </a>
      {contact.phone
        ? <a href={makePhoneHref(contact)}><Phone size={15} aria-hidden="true" />Call {contact.phone}</a>
        : <span><Phone size={15} aria-hidden="true" />Phone details coming soon</span>}
    </div>
  );
}