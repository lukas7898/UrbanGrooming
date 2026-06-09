import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const productsPath = resolve(process.cwd(), "data/products.json");
const products = JSON.parse(readFileSync(productsPath, "utf8"));
const imageDirectory = resolve(process.cwd(), "public/images/products");

mkdirSync(imageDirectory, { recursive: true });

function extractArticle(product) {
  if (product.supplierArticle) {
    const articleMatch = String(product.supplierArticle).match(/[0-9]{5,6}/);

    if (articleMatch) {
      return articleMatch[0];
    }
  }

  const source = `${product.name} ${product.description}`;
  const match = source.match(/арт\.?\s*([0-9]{5,6})/i);

  return match?.[1] ?? "";
}

function getExtension(contentType) {
  if (contentType.includes("jpeg") || contentType.includes("jpg")) {
    return ".jpg";
  }

  if (contentType.includes("webp")) {
    return ".webp";
  }

  return ".png";
}

let downloaded = 0;
let skipped = 0;

for (const product of products) {
  if (product.brand !== "Brit Care") {
    skipped += 1;
    continue;
  }

  const article = extractArticle(product);

  if (!article) {
    skipped += 1;
    continue;
  }

  const url = `https://www.brit.sk/out/pictures/1/100${article}.png`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok || !contentType.startsWith("image/")) {
    skipped += 1;
    continue;
  }

  const extension = getExtension(contentType);
  const fileName = `${product.slug}${extension}`;
  const filePath = resolve(imageDirectory, fileName);
  const buffer = Buffer.from(await response.arrayBuffer());

  writeFileSync(filePath, buffer);
  product.imageUrl = `/images/products/${fileName}`;
  downloaded += 1;
}

writeFileSync(productsPath, `${JSON.stringify(products, null, 2)}\n`, "utf8");

console.log(`Downloaded ${downloaded} Brit Care images.`);
console.log(`Skipped ${skipped} products.`);
