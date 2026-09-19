import { and, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { z } from "zod";
import { db } from "@workspace/db";
import {
  adoptionRequestsTable,
  adoptionRequestStatusSchema,
  deliveriesTable,
  fosterApplicationsTable,
  orderStatusSchema,
  ordersTable,
  productsTable,
  puppiesTable,
  puppyStatusSchema,
  rescueReportsTable,
  volunteerApplicationsTable,
  orderItemsTable,
  paymentsTable,
  cmsStoriesTable,
  websiteSettingsTable,
  paymentStatusSchema,
} from "@workspace/db";
import {
  CreateAdoptionRequestBody,
  CreateAdminAdoptionRequestBody,
  GetAdminDashboardResponse,
  GetProductResponse,
  GetPuppyResponse,
  ListPuppiesResponse,
  CreatePuppyBody,
  UpdatePuppyBody,
  ListAdminPuppiesResponse,
  ListAdoptionRequestsResponse,
  ListAdminProductsResponse,
  ListAdminOrdersResponse,
  ListProductsResponse,
  CreateProductBody,
  UpdateProductBody,
  UpdateAdoptionRequestBody,
  CreateRescueReportBody,
  CreateVolunteerApplicationBody,
  CreateFosterApplicationBody,
  CreateRescueReportResponse,
  CreateVolunteerApplicationResponse,
  CreateFosterApplicationResponse,
  UpdateAdminOrderBody,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();
const ACTIVE_PUPPY_STATUSES = ["Available", "Under Care", "Foster Needed", "Adoption Pending"];

function puppyResponse(puppy: typeof puppiesTable.$inferSelect) {
  return GetPuppyResponse.parse(puppy);
}

function productResponse(product: typeof productsTable.$inferSelect) {
  return GetProductResponse.parse(product);
}

async function adoptionResponse(request: typeof adoptionRequestsTable.$inferSelect) {
  const puppy = request.puppyId
    ? (await db.select({ name: puppiesTable.name }).from(puppiesTable).where(eq(puppiesTable.id, request.puppyId)))[0]
    : undefined;
  return {
    ...request,
    puppyName: puppy?.name ?? null,
  };
}

router.get("/puppies", async (req, res): Promise<void> => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const size = typeof req.query.size === "string" ? req.query.size.trim() : "";
  const filters = [inArray(puppiesTable.status, ACTIVE_PUPPY_STATUSES)];
  if (size) filters.push(eq(puppiesTable.size, size));
  if (search) {
    filters.push(or(ilike(puppiesTable.name, `%${search}%`), ilike(puppiesTable.temperament, `%${search}%`))!);
  }
  const puppies = await db.select().from(puppiesTable).where(and(...filters)).orderBy(desc(puppiesTable.createdAt));
  res.json(ListPuppiesResponse.parse(puppies));
});

router.get("/puppies/:id", async (req, res): Promise<void> => {
  const puppy = (await db.select().from(puppiesTable).where(eq(puppiesTable.id, req.params.id)))[0];
  if (!puppy || !ACTIVE_PUPPY_STATUSES.includes(puppy.status)) {
    res.status(404).json({ error: "Puppy not found" });
    return;
  }
  res.json(puppyResponse(puppy));
});

router.post("/adoption-requests", async (req, res): Promise<void> => {
  const parsed = CreateAdoptionRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (parsed.data.puppyId) {
    const puppy = (await db.select({ id: puppiesTable.id }).from(puppiesTable).where(and(eq(puppiesTable.id, parsed.data.puppyId), inArray(puppiesTable.status, ACTIVE_PUPPY_STATUSES))))[0];
    if (!puppy) {
      res.status(400).json({ error: "That puppy is no longer accepting applications" });
      return;
    }
  }
  const [request] = await db.insert(adoptionRequestsTable).values(parsed.data).returning();
  res.status(201).json(await adoptionResponse(request));
});

router.get("/products", async (req, res): Promise<void> => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const category = typeof req.query.category === "string" ? req.query.category.trim() : "";
  const filters = [eq(productsTable.available, true)];
  if (category) filters.push(eq(productsTable.category, category));
  if (search) filters.push(or(ilike(productsTable.name, `%${search}%`), ilike(productsTable.description, `%${search}%`))!);
  const products = await db.select().from(productsTable).where(and(...filters)).orderBy(desc(productsTable.createdAt));
  res.json(ListProductsResponse.parse(products));
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const product = (await db.select().from(productsTable).where(and(eq(productsTable.id, req.params.id), eq(productsTable.available, true))))[0];
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(productResponse(product));
});

const adminRouter: IRouter = Router();
adminRouter.use(requireAdmin);

adminRouter.get("/dashboard", async (_req, res): Promise<void> => {
  const [puppies, adoption, pendingOrders, paidOrders, preparing, dispatched, delivered, delayed, rescue, volunteers, foster] = await Promise.all([
    db.select({ value: count() }).from(puppiesTable).where(inArray(puppiesTable.status, ACTIVE_PUPPY_STATUSES)),
    db.select({ value: count() }).from(adoptionRequestsTable).where(inArray(adoptionRequestsTable.status, ["New", "Under Review", "Contacted"])),
    db.select({ value: count() }).from(ordersTable).where(eq(ordersTable.status, "Payment Pending")),
    db.select({ value: count() }).from(ordersTable).where(inArray(ordersTable.paymentStatus, ["Payment Verified", "Payment Successful"])),
    db.select({ value: count() }).from(ordersTable).where(eq(ordersTable.status, "Preparing")),
    db.select({ value: count() }).from(ordersTable).where(inArray(ordersTable.status, ["Ready to Dispatch", "Dispatched", "Out for Delivery"])),
    db.select({ value: count() }).from(ordersTable).where(eq(ordersTable.status, "Delivered")),
    db.select({ value: count() }).from(ordersTable).where(eq(ordersTable.status, "Delayed")),
    db.select({ value: count() }).from(rescueReportsTable).where(eq(rescueReportsTable.status, "New")),
    db.select({ value: count() }).from(volunteerApplicationsTable).where(eq(volunteerApplicationsTable.status, "New")),
    db.select({ value: count() }).from(fosterApplicationsTable).where(eq(fosterApplicationsTable.status, "New")),
  ]);
  res.json(GetAdminDashboardResponse.parse({
    availablePuppies: puppies[0]?.value ?? 0,
    adoptionRequests: adoption[0]?.value ?? 0,
    pendingOrders: pendingOrders[0]?.value ?? 0,
    paidOrders: paidOrders[0]?.value ?? 0,
    preparingOrders: preparing[0]?.value ?? 0,
    dispatchedOrders: dispatched[0]?.value ?? 0,
    deliveredOrders: delivered[0]?.value ?? 0,
    delayedOrders: delayed[0]?.value ?? 0,
    rescueReports: rescue[0]?.value ?? 0,
    volunteers: volunteers[0]?.value ?? 0,
    fosterRequests: foster[0]?.value ?? 0,
  }));
});

adminRouter.get("/puppies", async (_req, res): Promise<void> => {
  const puppies = await db.select().from(puppiesTable).orderBy(desc(puppiesTable.createdAt));
  res.json(ListAdminPuppiesResponse.parse(puppies));
});

adminRouter.post("/puppies", async (req, res): Promise<void> => {
  const parsed = CreatePuppyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const values = {
    ...parsed.data,
    status: parsed.data.status ? puppyStatusSchema.parse(parsed.data.status) : "Available",
  };
  const [puppy] = await db.insert(puppiesTable).values(values).returning();
  res.status(201).json(puppyResponse(puppy));
});

adminRouter.patch("/puppies/:id", async (req, res): Promise<void> => {
  const parsed = UpdatePuppyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const values = {
    ...parsed.data,
    ...(parsed.data.status ? { status: puppyStatusSchema.parse(parsed.data.status) } : {}),
    updatedAt: new Date(),
  };
  const [puppy] = await db.update(puppiesTable).set(values).where(eq(puppiesTable.id, req.params.id)).returning();
  if (!puppy) {
    res.status(404).json({ error: "Puppy not found" });
    return;
  }
  res.json(puppyResponse(puppy));
});

adminRouter.delete("/puppies/:id", async (req, res): Promise<void> => {
  const [puppy] = await db.update(puppiesTable).set({ status: "Archived", updatedAt: new Date() }).where(eq(puppiesTable.id, req.params.id)).returning();
  if (!puppy) {
    res.status(404).json({ error: "Puppy not found" });
    return;
  }
  res.sendStatus(204);
});

adminRouter.get("/adoption-requests", async (_req, res): Promise<void> => {
  const requests = await db.select().from(adoptionRequestsTable).orderBy(desc(adoptionRequestsTable.createdAt));
  res.json(ListAdoptionRequestsResponse.parse(await Promise.all(requests.map(adoptionResponse))));
});

adminRouter.post("/adoption-requests", async (req, res): Promise<void> => {
  const parsed = CreateAdminAdoptionRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [request] = await db.insert(adoptionRequestsTable).values(parsed.data).returning();
  res.status(201).json(await adoptionResponse(request));
});

adminRouter.patch("/adoption-requests/:id", async (req, res): Promise<void> => {
  const parsed = UpdateAdoptionRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (parsed.data.status) adoptionRequestStatusSchema.parse(parsed.data.status);
  const [request] = await db.update(adoptionRequestsTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(adoptionRequestsTable.id, req.params.id)).returning();
  if (!request) {
    res.status(404).json({ error: "Adoption request not found" });
    return;
  }
  res.json(await adoptionResponse(request));
});

adminRouter.get("/products", async (_req, res): Promise<void> => {
  const products = await db.select().from(productsTable).orderBy(desc(productsTable.createdAt));
  res.json(ListAdminProductsResponse.parse(products));
});

adminRouter.post("/products", async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [product] = await db.insert(productsTable).values(parsed.data).returning();
  res.status(201).json(productResponse(product));
});

adminRouter.patch("/products/:id", async (req, res): Promise<void> => {
  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [product] = await db.update(productsTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(productsTable.id, req.params.id)).returning();
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(productResponse(product));
});

adminRouter.delete("/products/:id", async (req, res): Promise<void> => {
  const [product] = await db.update(productsTable).set({ available: false, updatedAt: new Date() }).where(eq(productsTable.id, req.params.id)).returning();
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.sendStatus(204);
});

adminRouter.get("/orders", async (_req, res): Promise<void> => {
  const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
  res.json(ListAdminOrdersResponse.parse(orders));
});

adminRouter.get("/orders/:id", async (req, res): Promise<void> => {
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, req.params.id));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  const [items, payments, deliveries] = await Promise.all([
    db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id)),
    db.select().from(paymentsTable).where(eq(paymentsTable.orderId, order.id)).orderBy(desc(paymentsTable.createdAt)),
    db.select().from(deliveriesTable).where(eq(deliveriesTable.orderId, order.id)).orderBy(desc(deliveriesTable.createdAt)),
  ]);
  res.json({ ...order, items, payments, deliveries });
});

adminRouter.patch("/orders/:id", async (req, res): Promise<void> => {
  const parsed = UpdateAdminOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (parsed.data.status) orderStatusSchema.parse(parsed.data.status);
  const { expectedDelivery, ...orderFields } = parsed.data;
  const expectedDeliveryValue =
    expectedDelivery === undefined
      ? undefined
      : expectedDelivery === null
        ? null
        : typeof expectedDelivery === "string"
          ? expectedDelivery
          : expectedDelivery.toISOString().slice(0, 10);
  const [order] = await db.update(ordersTable).set({
    ...orderFields,
    ...(expectedDeliveryValue !== undefined ? { expectedDelivery: expectedDeliveryValue } : {}),
    updatedAt: new Date(),
  }).where(eq(ordersTable.id, req.params.id)).returning();
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(order);
});

adminRouter.patch("/orders/:id/payment", async (req, res): Promise<void> => {
  const parsed = z.object({
    status: z.string().min(1),
    paymentId: z.string().optional(),
    provider: z.string().optional(),
  }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const status = paymentStatusSchema.safeParse(parsed.data.status);
  if (!status.success) {
    res.status(400).json({ error: "Invalid payment status" });
    return;
  }
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, req.params.id));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  const [payment] = await db.insert(paymentsTable).values({
    orderId: order.id,
    status: status.data,
    amountPaise: order.totalPaise,
    paymentId: parsed.data.paymentId ?? "",
    provider: parsed.data.provider ?? "razorpay",
    verifiedAt: status.data === "Payment Successful" ? new Date() : null,
  }).returning();
  await db.update(ordersTable).set({ paymentStatus: status.data, updatedAt: new Date() }).where(eq(ordersTable.id, order.id));
  res.status(201).json(payment);
});

adminRouter.patch("/orders/:id/delivery", async (req, res): Promise<void> => {
  const parsed = z.object({
    partnerName: z.string().optional(),
    phone: z.string().optional(),
    trackingId: z.string().optional(),
    notes: z.string().optional(),
  }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [order] = await db.select({ id: ordersTable.id }).from(ordersTable).where(eq(ordersTable.id, req.params.id));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  const [delivery] = await db.insert(deliveriesTable).values({ orderId: order.id, ...parsed.data }).returning();
  await db.update(ordersTable).set({
    ...(parsed.data.trackingId !== undefined ? { trackingId: parsed.data.trackingId } : {}),
    ...(parsed.data.partnerName !== undefined ? { deliveryPerson: parsed.data.partnerName } : {}),
    ...(parsed.data.phone !== undefined ? { deliveryPhone: parsed.data.phone } : {}),
    updatedAt: new Date(),
  }).where(eq(ordersTable.id, order.id));
  res.status(201).json(delivery);
});

type AdminSubmissionTable = typeof rescueReportsTable | typeof volunteerApplicationsTable | typeof fosterApplicationsTable;
const submissionTables: Record<string, AdminSubmissionTable> = {
  rescue: rescueReportsTable,
  volunteer: volunteerApplicationsTable,
  foster: fosterApplicationsTable,
};
const submissionStatus = {
  rescue: z.enum(["New", "Investigating", "Resolved", "Closed"]),
  volunteer: z.enum(["New", "Contacted", "Approved", "Rejected", "Closed"]),
  foster: z.enum(["New", "Contacted", "Approved", "Rejected", "Closed"]),
} as const;
for (const [kind, rawTable] of Object.entries(submissionTables)) {
  const table = rawTable as any;
  const resource = kind === "rescue" ? "rescue-reports" : `${kind}-applications`;
  adminRouter.get(`/${resource}`, async (_req, res): Promise<void> => {
    res.json(await db.select().from(table).orderBy(desc(table.createdAt)));
  });
  adminRouter.get(`/${resource}/:id`, async (req, res): Promise<void> => {
    const [record] = await db.select().from(table).where(eq(table.id, req.params.id));
    if (!record) {
      res.status(404).json({ error: `${kind} application not found` });
      return;
    }
    res.json(record);
  });
  adminRouter.patch(`/${resource}/:id`, async (req, res): Promise<void> => {
    const parsed = z.object({ status: submissionStatus[kind as keyof typeof submissionStatus].optional(), internalNotes: z.string().max(10000).optional() }).strict().safeParse(req.body);
    if (!parsed.success || (!parsed.data.status && parsed.data.internalNotes === undefined)) {
      res.status(400).json({ error: parsed.success ? "At least one field is required" : parsed.error.message });
      return;
    }
    const [record] = await db.update(table).set({ ...parsed.data, updatedAt: new Date() }).where(eq(table.id, req.params.id)).returning();
    if (!record) {
      res.status(404).json({ error: `${kind} application not found` });
      return;
    }
    res.json(record);
  });
}

adminRouter.get("/customers", async (_req, res): Promise<void> => {
  const [orders, adoptions] = await Promise.all([
    db.select({ name: ordersTable.customerName, email: ordersTable.email, phone: ordersTable.phone, city: ordersTable.city, source: ordersTable.id, createdAt: ordersTable.createdAt }).from(ordersTable),
    db.select({ name: adoptionRequestsTable.applicantName, email: adoptionRequestsTable.email, phone: adoptionRequestsTable.phone, city: adoptionRequestsTable.city, source: adoptionRequestsTable.id, createdAt: adoptionRequestsTable.createdAt }).from(adoptionRequestsTable),
  ]);
  const customers = new Map<string, typeof orders[number]>();
  for (const customer of [...orders, ...adoptions]) {
    const key = customer.email.toLowerCase();
    if (!customers.has(key)) customers.set(key, customer);
  }
  res.json([...customers.values()]);
});

adminRouter.get("/dashboard/recent", async (_req, res): Promise<void> => {
  const [orders, adoptions, rescues] = await Promise.all([
    db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(10),
    db.select().from(adoptionRequestsTable).orderBy(desc(adoptionRequestsTable.createdAt)).limit(10),
    db.select().from(rescueReportsTable).orderBy(desc(rescueReportsTable.createdAt)).limit(10),
  ]);
  res.json({ orders, adoptionRequests: adoptions, rescueReports: rescues });
});

adminRouter.get("/stories", async (_req, res): Promise<void> => {
  res.json(await db.select().from(cmsStoriesTable).orderBy(desc(cmsStoriesTable.createdAt)));
});
adminRouter.post("/stories", async (req, res): Promise<void> => {
  const parsed = z.object({
    slug: z.string().min(1).max(160),
    title: z.string().min(1).max(240),
    excerpt: z.string().optional(),
    body: z.string().optional(),
    imageUrl: z.string().url().or(z.literal("")).optional(),
    published: z.boolean().optional(),
  }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [story] = await db.insert(cmsStoriesTable).values(parsed.data).returning();
  res.status(201).json(story);
});
adminRouter.patch("/stories/:id", async (req, res): Promise<void> => {
  const parsed = z.object({
    slug: z.string().min(1).max(160).optional(), title: z.string().min(1).max(240).optional(),
    excerpt: z.string().optional(), body: z.string().optional(),
    imageUrl: z.string().url().or(z.literal("")).optional(), published: z.boolean().optional(),
  }).strict().safeParse(req.body);
  if (!parsed.success || Object.keys(parsed.data).length === 0) { res.status(400).json({ error: parsed.success ? "No fields to update" : parsed.error.message }); return; }
  const [story] = await db.update(cmsStoriesTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(cmsStoriesTable.id, req.params.id)).returning();
  if (!story) { res.status(404).json({ error: "Story not found" }); return; }
  res.json(story);
});
adminRouter.delete("/stories/:id", async (req, res): Promise<void> => {
  const [story] = await db.delete(cmsStoriesTable).where(eq(cmsStoriesTable.id, req.params.id)).returning();
  if (!story) { res.status(404).json({ error: "Story not found" }); return; }
  res.sendStatus(204);
});

adminRouter.get("/settings", async (_req, res): Promise<void> => {
  res.json(await db.select().from(websiteSettingsTable).orderBy(websiteSettingsTable.key));
});
adminRouter.put("/settings/:key", async (req, res): Promise<void> => {
  const parsed = z.object({ value: z.string() }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [setting] = await db.insert(websiteSettingsTable).values({ key: req.params.key, value: parsed.data.value })
    .onConflictDoUpdate({ target: websiteSettingsTable.key, set: { value: parsed.data.value, updatedAt: new Date() } }).returning();
  res.json(setting);
});

router.use("/admin", adminRouter);

router.get("/stories", async (_req, res): Promise<void> => {
  res.json(await db.select().from(cmsStoriesTable).where(eq(cmsStoriesTable.published, true)).orderBy(desc(cmsStoriesTable.createdAt)));
});
router.get("/stories/:slug", async (req, res): Promise<void> => {
  const [story] = await db.select().from(cmsStoriesTable).where(and(eq(cmsStoriesTable.slug, req.params.slug), eq(cmsStoriesTable.published, true)));
  if (!story) { res.status(404).json({ error: "Story not found" }); return; }
  res.json(story);
});
router.get("/settings", async (_req, res): Promise<void> => {
  res.json(await db.select({ key: websiteSettingsTable.key, value: websiteSettingsTable.value }).from(websiteSettingsTable));
});

router.post("/submissions/rescue", async (req, res): Promise<void> => {
  const parsed = CreateRescueReportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please provide the required rescue report details" });
    return;
  }
  const [report] = await db.insert(rescueReportsTable).values(parsed.data).returning({ id: rescueReportsTable.id });
  res.status(201).json(CreateRescueReportResponse.parse({ id: report.id, message: "Your report has been saved for the care team." }));
});

router.post("/submissions/volunteer", async (req, res): Promise<void> => {
  const parsed = CreateVolunteerApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please provide your name, email, and area of interest" });
    return;
  }
  const [application] = await db.insert(volunteerApplicationsTable).values(parsed.data).returning({ id: volunteerApplicationsTable.id });
  res.status(201).json(CreateVolunteerApplicationResponse.parse({ id: application.id, message: "Your volunteer interest has been saved." }));
});

router.post("/submissions/foster", async (req, res): Promise<void> => {
  const parsed = CreateFosterApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please provide your name, email, and city" });
    return;
  }
  const [application] = await db.insert(fosterApplicationsTable).values(parsed.data).returning({ id: fosterApplicationsTable.id });
  res.status(201).json(CreateFosterApplicationResponse.parse({ id: application.id, message: "Your foster interest has been saved." }));
});

export default router;