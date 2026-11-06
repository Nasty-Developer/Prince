export type OrderLine = {
  name: string;
  quantity: number;
  priceRupees: number;
};

export type OrderCustomer = {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  notes: string;
};

export const EMPTY_CUSTOMER: OrderCustomer = {
  name: "",
  phone: "",
  address: "",
  city: "",
  pincode: "",
  notes: "",
};

const money = (value: number) =>
  `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

/** Short human reference the team can quote back, e.g. SSD-2611-7K2Q. */
export function orderReference(now: Date = new Date()): string {
  const year = String(now.getFullYear()).slice(2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let tail = "";
  for (let index = 0; index < 4; index += 1) {
    tail += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `SSD-${year}${month}-${tail}`;
}

/** Digits only, with the Indian country code reduced to the local 10-digit form. */
export function normalisePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

export function validateCustomer(customer: OrderCustomer, lines: OrderLine[]): string[] {
  const problems: string[] = [];
  if (customer.name.trim().length < 2) problems.push("Add the name the order is for.");
  if (!/^[6-9]\d{9}$/.test(normalisePhone(customer.phone))) {
    problems.push("Add a valid 10-digit mobile number.");
  }
  if (customer.address.trim().length < 12) {
    problems.push("Add the full address: house or building, street, area.");
  }
  if (customer.city.trim().length < 2) problems.push("Add the city or town.");
  if (customer.pincode.trim() && !/^\d{6}$/.test(customer.pincode.trim())) {
    problems.push("The PIN code should be 6 digits.");
  }
  if (!lines.length || lines.every((line) => line.quantity < 1)) {
    problems.push("Add at least one piece to the order.");
  }
  return problems;
}

export function orderTotal(lines: OrderLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity * line.priceRupees, 0);
}

/**
 * The message that lands in the team's WhatsApp. Everything the team needs to
 * book the order sits in one block: reference, items with quantity, total and
 * the delivery details.
 */
export function buildOrderMessage(
  customer: OrderCustomer,
  lines: OrderLine[],
  reference: string,
  siteUrl = "savestreetdogss.com",
): string {
  const items = lines
    .filter((line) => line.quantity > 0)
    .map(
      (line) =>
        `• ${line.name} × ${line.quantity} — ${money(line.quantity * line.priceRupees)}`,
    );

  return [
    "Hello SaveStreet Dogs, I would like to place an order.",
    "",
    `Order reference: ${reference}`,
    "",
    "Items",
    ...items,
    "",
    `Total: ${money(orderTotal(lines))}`,
    "",
    "Delivery details",
    `Name: ${customer.name.trim()}`,
    `Phone: ${normalisePhone(customer.phone)}`,
    `Address: ${customer.address.trim()}`,
    `City: ${customer.city.trim()}`,
    `PIN code: ${customer.pincode.trim() || "—"}`,
    `Notes: ${customer.notes.trim() || "—"}`,
    "",
    `Sent from ${siteUrl}`,
  ].join("\n");
}
