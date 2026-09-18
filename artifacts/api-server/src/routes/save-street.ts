import { and, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { Router, type IRouter } from "express";
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

router.use("/admin", adminRouter);

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