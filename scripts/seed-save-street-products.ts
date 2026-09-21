import { readFile } from "node:fs/promises";
import path from "node:path";
import { db, pool } from "../lib/db/src/index";
import { productsTable } from "../lib/db/src/schema/save-street";
import { ObjectStorageService } from "../artifacts/api-server/src/lib/objectStorage";

const sourceProducts = [
  {
    file: "IMG_20260918_173824_388_1789749633278.jpg",
    name: "Colourful Dog Leash",
    description: "Durable, bright leads for safer walks and calmer handling.",
  },
  {
    file: "IMG_20260918_173826_201_1789749652016.jpg",
    name: "Reflective Dog Collar",
    description: "Adjustable reflective collars that help community dogs stay visible.",
  },
] as const;

async function uploadImage(storage: ObjectStorageService, filename: string) {
  const sourcePath = path.resolve("attached_assets", filename);
  const body = await readFile(sourcePath);
  const uploadURL = await storage.getObjectEntityUploadURL();
  const response = await fetch(uploadURL, {
    method: "PUT",
    headers: { "Content-Type": "image/jpeg" },
    body,
  });
  if (!response.ok) {
    throw new Error(`Could not upload ${filename}: ${response.status}`);
  }
  return storage.normalizeObjectEntityPath(uploadURL);
}

const existing = await db.select({ id: productsTable.id }).from(productsTable).limit(1);
if (existing.length > 0) {
  console.log("Products already exist; leaving the existing catalog unchanged.");
} else {
  const storage = new ObjectStorageService();
  for (const source of sourceProducts) {
    const imagePath = await uploadImage(storage, source.file);
    const [product] = await db.insert(productsTable).values({
      name: source.name,
      description: source.description,
      category: "Dog care essentials",
      priceRupees: 60,
      stock: 20,
      stockStatus: "IN STOCK",
      available: true,
      imageUrls: [imagePath],
    }).returning();
    console.log(`Seeded ${product.name} with ${product.imageUrls[0]}`);
  }
}

await pool.end();