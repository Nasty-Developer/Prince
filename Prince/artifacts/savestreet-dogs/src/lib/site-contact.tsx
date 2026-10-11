import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

export const SITE_CONTACT_QUERY_KEY = ["site-contact"] as const;

export const CONTACT_SETTING_KEYS = {
  email: "contact.email",
  phone: "contact.phone",
  whatsapp: "contact.whatsapp",
} as const;

export const DEFAULT_SITE_CONTACT = {
  email: "savestreetdogs18@gmail.com",
  phone: "+91 7413 073 410",
  whatsapp: "917413073410",
};

export type SiteContact = typeof DEFAULT_SITE_CONTACT;

const SiteContactContext = createContext<SiteContact>(DEFAULT_SITE_CONTACT);

type WebsiteSetting = { key: string; value: string };

function normaliseContactSetting(
  value: string | undefined,
  fallback: string,
  validate: (candidate: string) => boolean,
) {
  const candidate = value?.trim();
  return candidate && validate(candidate) ? candidate : fallback;
}

async function fetchSiteContact(): Promise<SiteContact> {
  const response = await fetch("/api/settings", { credentials: "include" });
  if (!response.ok) {
    throw new Error(`Contact settings could not be loaded (${response.status}).`);
  }

  const settings = (await response.json()) as WebsiteSetting[];
  if (!Array.isArray(settings)) {
    throw new Error("Contact settings response was not a list.");
  }

  const values = new Map(settings.map(({ key, value }) => [key, value]));
  const email = normaliseContactSetting(
    values.get(CONTACT_SETTING_KEYS.email),
    DEFAULT_SITE_CONTACT.email,
    (candidate) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate),
  );
  const phone = normaliseContactSetting(
    values.get(CONTACT_SETTING_KEYS.phone),
    DEFAULT_SITE_CONTACT.phone,
    (candidate) => /^\+?\d[\d\s()-]{6,}$/.test(candidate),
  );
  const whatsapp = normaliseContactSetting(
    values.get(CONTACT_SETTING_KEYS.whatsapp)?.replace(/\D/g, ""),
    DEFAULT_SITE_CONTACT.whatsapp,
    (candidate) => /^[1-9]\d{7,14}$/.test(candidate),
  );

  return { email, phone, whatsapp };
}

export function SiteContactProvider({ children }: { children: ReactNode }) {
  const query = useQuery({
    queryKey: SITE_CONTACT_QUERY_KEY,
    queryFn: fetchSiteContact,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  return (
    <SiteContactContext.Provider value={query.data ?? DEFAULT_SITE_CONTACT}>
      {children}
    </SiteContactContext.Provider>
  );
}

export function useSiteContact() {
  return useContext(SiteContactContext);
}

export function makeWhatsAppHref(contact: SiteContact, message: string) {
  const number = contact.whatsapp.replace(/\D/g, "") || DEFAULT_SITE_CONTACT.whatsapp;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function makePhoneHref(contact: SiteContact) {
  const number = contact.phone.replace(/[^\d+]/g, "");
  return `tel:${number || "+917413073410"}`;
}

export function makeEmailHref(contact: SiteContact) {
  return `mailto:${contact.email}`;
}

export function makeEmailComposerHref(
  contact: SiteContact,
  subject: string,
  body: string,
) {
  const params = new URLSearchParams({ subject, body });
  return `${makeEmailHref(contact)}?${params.toString()}`;
}

export const CONTACT_MESSAGES = {
  general: "Hello Save Street Dogs, I have a question and need help.",
  adoption: "Hello Save Street Dogs, I am interested in adopting a puppy.",
  rescue: "Hello Save Street Dogs, I need help with a street dog.",
  foster: "Hello Save Street Dogs, I am interested in fostering a dog.",
  volunteer: "Hello Save Street Dogs, I am interested in volunteering.",
  shop: "Hello Save Street Dogs, I have a question about a shop product.",
};

export function puppyAdoptionMessage(puppyName: string) {
  return `Hello Save Street Dogs, I am interested in adopting ${puppyName}.`;
}

export function productQuestionMessage(productName: string) {
  return `Hello Save Street Dogs, I have a question about ${productName}.`;
}

export function orderQuestionMessage(orderCode: string) {
  return `Hello Save Street Dogs, I have a question about order ${orderCode}.`;
}