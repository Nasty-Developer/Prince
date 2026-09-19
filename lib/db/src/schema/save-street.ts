import { createInsertSchema } from "drizzle-zod";
import {
  boolean,
  date,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
};

export const puppiesTable = pgTable("puppies", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull().default(""),
  age: text("age").notNull().default(""),
  gender: text("gender").notNull().default(""),
  size: text("size").notNull().default(""),
  temperament: text("temperament").notNull().default(""),
  description: text("description").notNull().default(""),
  adoptionInfo: text("adoption_info").notNull().default(""),
  healthInfo: text("health_info").notNull().default(""),
  vaccinationInfo: text("vaccination_info").notNull().default(""),
  status: text("status").notNull().default("Available"),
  notes: text("notes").notNull().default(""),
  imageUrls: jsonb("image_urls").$type<string[]>().notNull().default([]),
  ...timestamps,
});

export const adoptionRequestsTable = pgTable("adoption_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  puppyId: uuid("puppy_id").references(() => puppiesTable.id, { onDelete: "set null" }),
  userId: text("user_id"),
  applicantName: text("applicant_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  city: text("city").notNull(),
  address: text("address").notNull().default(""),
  livingSituation: text("living_situation").notNull().default(""),
  animalExperience: text("animal_experience").notNull().default(""),
  householdInformation: text("household_information").notNull().default(""),
  reason: text("reason").notNull().default(""),
  additionalMessage: text("additional_message").notNull().default(""),
  status: text("status").notNull().default("New"),
  internalNotes: text("internal_notes").notNull().default(""),
  ...timestamps,
});

export const productsTable = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  priceRupees: integer("price_rupees").notNull().default(60),
  stock: integer("stock").notNull().default(0),
  available: boolean("available").notNull().default(true),
  category: text("category").notNull().default("Mission goods"),
  imageUrls: jsonb("image_urls").$type<string[]>().notNull().default([]),
  ...timestamps,
});

export const ordersTable = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderCode: text("order_code").notNull().unique(),
  userId: text("user_id"),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pinCode: text("pin_code").notNull(),
  deliveryNotes: text("delivery_notes").notNull().default(""),
  subtotalRupees: integer("subtotal_rupees").notNull(),
  deliveryChargeRupees: integer("delivery_charge_rupees"),
  totalRupees: integer("total_rupees").notNull(),
  paymentStatus: text("payment_status").notNull().default("Payment Pending"),
  status: text("status").notNull().default("Payment Pending"),
  expectedDelivery: date("expected_delivery", { mode: "string" }),
  delayReason: text("delay_reason").notNull().default(""),
  deliveryPerson: text("delivery_person").notNull().default(""),
  deliveryPhone: text("delivery_phone").notNull().default(""),
  trackingId: text("tracking_id").notNull().default(""),
  ...timestamps,
});

export const orderItemsTable = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull().references(() => ordersTable.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => productsTable.id, { onDelete: "set null" }),
  productName: text("product_name").notNull(),
  productImageUrl: text("product_image_url").notNull().default(""),
  quantity: integer("quantity").notNull(),
  unitPriceRupees: integer("unit_price_rupees").notNull(),
});

export const paymentsTable = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull().references(() => ordersTable.id, { onDelete: "cascade" }),
  provider: text("provider").notNull().default("razorpay"),
  paymentId: text("payment_id").notNull().default(""),
  status: text("status").notNull().default("Payment Pending"),
  amountPaise: integer("amount_paise").notNull(),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  ...timestamps,
});

export const deliveriesTable = pgTable("deliveries", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull().references(() => ordersTable.id, { onDelete: "cascade" }),
  partnerName: text("partner_name").notNull().default(""),
  phone: text("phone").notNull().default(""),
  trackingId: text("tracking_id").notNull().default(""),
  notes: text("notes").notNull().default(""),
  ...timestamps,
});

export const rescueReportsTable = pgTable("rescue_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  reporterName: text("reporter_name").notNull(),
  email: text("email").notNull(),
  location: text("location").notNull(),
  details: text("details").notNull(),
  category: text("category").notNull().default("Other"),
  urgency: text("urgency").notNull().default("Normal"),
  status: text("status").notNull().default("New"),
  internalNotes: text("internal_notes").notNull().default(""),
  ...timestamps,
});

export const volunteerApplicationsTable = pgTable("volunteer_applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  interest: text("interest").notNull(),
  message: text("message").notNull().default(""),
  status: text("status").notNull().default("New"),
  internalNotes: text("internal_notes").notNull().default(""),
  ...timestamps,
});

export const fosterApplicationsTable = pgTable("foster_applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  city: text("city").notNull(),
  message: text("message").notNull().default(""),
  status: text("status").notNull().default("New"),
  internalNotes: text("internal_notes").notNull().default(""),
  ...timestamps,
});

export const insertPuppySchema = createInsertSchema(puppiesTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAdoptionRequestSchema = createInsertSchema(adoptionRequestsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, updatedAt: true });

export const cmsStoriesTable = pgTable("cms_stories", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull().default(""),
  body: text("body").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  published: boolean("published").notNull().default(false),
  ...timestamps,
});

export const websiteSettingsTable = pgTable("website_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull().default(""),
  ...timestamps,
});

export const insertCmsStorySchema = createInsertSchema(cmsStoriesTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWebsiteSettingSchema = createInsertSchema(websiteSettingsTable).omit({ id: true, createdAt: true, updatedAt: true });

export const puppyStatusSchema = z.enum(["Available", "Under Care", "Foster Needed", "Adoption Pending", "Adopted", "Archived"]);
export const adoptionRequestStatusSchema = z.enum(["New", "Under Review", "Contacted", "Approved", "Not Approved", "Completed", "Cancelled"]);
export const orderStatusSchema = z.enum(["Payment Pending", "Payment Verified", "Preparing", "Ready to Dispatch", "Dispatched", "Out for Delivery", "Delivered", "Delayed", "Cancelled"]);
export const paymentStatusSchema = z.enum(["Payment Pending", "Payment Processing", "Payment Successful", "Payment Failed", "Payment Refunded"]);

export type Puppy = typeof puppiesTable.$inferSelect;
export type InsertPuppy = z.infer<typeof insertPuppySchema>;
export type AdoptionRequest = typeof adoptionRequestsTable.$inferSelect;
export type InsertAdoptionRequest = z.infer<typeof insertAdoptionRequestSchema>;
export type Product = typeof productsTable.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof ordersTable.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type CmsStory = typeof cmsStoriesTable.$inferSelect;
export type WebsiteSetting = typeof websiteSettingsTable.$inferSelect;
export type OrderItem = typeof orderItemsTable.$inferSelect;
export type Payment = typeof paymentsTable.$inferSelect;
export type Delivery = typeof deliveriesTable.$inferSelect;