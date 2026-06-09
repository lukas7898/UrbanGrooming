import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import XLSX from "xlsx";

const defaultImageUrl = "/images/products/placeholder-product.jpg";

const files = process.argv.slice(2);

if (files.length === 0) {
  throw new Error(
    "Pass one or more XLS invoice paths. Example: npm run import:products -- C:\\path\\invoice.xls",
  );
}

const transliterationMap = new Map(
  Object.entries({
    а: "a",
    б: "b",
    в: "v",
    г: "h",
    ґ: "g",
    д: "d",
    е: "e",
    є: "ie",
    ж: "zh",
    з: "z",
    и: "y",
    і: "i",
    ї: "i",
    й: "i",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "kh",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "shch",
    ь: "",
    ю: "iu",
    я: "ia",
    ы: "y",
    э: "e",
    ё: "e",
    ъ: "",
  }),
);

function slugify(value) {
  const transliterated = value
    .toLowerCase()
    .split("")
    .map((character) => transliterationMap.get(character) ?? character)
    .join("");

  return transliterated
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function cleanName(value) {
  return String(value)
    .replace(/\s+/g, " ")
    .replace(/\s+,/g, ",")
    .replace(/\s+\./g, ".")
    .trim();
}

function inferBrand(name) {
  const lowerName = name.toLowerCase();

  if (lowerName.includes("brit care") || lowerName.includes("бріт кеа")) {
    return "Brit Care";
  }

  if (lowerName.includes("savory")) {
    return "Savory";
  }

  if (lowerName.includes("monge")) {
    return "Monge";
  }

  if (lowerName.includes("trixie")) {
    return "Trixie";
  }

  if (lowerName.includes("kong")) {
    return "KONG";
  }

  return name.split(" ")[0].replace(/[,:]/g, "");
}

function inferCategory(name) {
  const lowerName = name.toLowerCase();

  if (
    lowerName.includes("ласощ") ||
    lowerName.includes("джерки") ||
    lowerName.includes("батончик") ||
    lowerName.includes("монетки") ||
    lowerName.includes("пауч") ||
    lowerName.includes("treat")
  ) {
    return "Ласощі";
  }

  if (
    lowerName.includes("шампун") ||
    lowerName.includes("кондиціон") ||
    lowerName.includes("космет")
  ) {
    return "Косметика";
  }

  if (
    lowerName.includes("лоток") ||
    lowerName.includes("пелюш") ||
    lowerName.includes("гігієн") ||
    lowerName.includes("сервет")
  ) {
    return "Гігієна";
  }

  if (
    lowerName.includes("іграш") ||
    lowerName.includes("м'яч") ||
    lowerName.includes("канат")
  ) {
    return "Іграшки";
  }

  if (
    lowerName.includes("повідець") ||
    lowerName.includes("нашийник") ||
    lowerName.includes("миска") ||
    lowerName.includes("гребінець")
  ) {
    return "Аксесуари";
  }

  return "Корм";
}

function createShortDescription(productName, category) {
  if (category === "Корм") {
    return `${productName}. Позиція з поточного асортименту Urban Grooming Lviv.`;
  }

  return `${productName}. Товар з поточного асортименту Urban Grooming Lviv.`;
}

function extractItems(file) {
  const workbook = XLSX.readFile(file);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
  });

  return rows
    .filter((row) => typeof row[1] === "number" && row[8])
    .map((row) => ({
      barcode: String(row[4] || ""),
      article: String(row[5] || ""),
      name: cleanName(row[8]),
      quantity: Number(row[14] || 0),
      retailPrice: Number(row[23] || row[18] || 0),
    }))
    .filter((item) => item.name && item.quantity > 0 && item.retailPrice > 0);
}

const itemMap = new Map();

for (const file of files) {
  for (const item of extractItems(file)) {
    const key = item.barcode || item.article || item.name;
    const existingItem = itemMap.get(key);

    if (existingItem) {
      existingItem.quantity += item.quantity;
      existingItem.retailPrice = Math.max(
        existingItem.retailPrice,
        item.retailPrice,
      );
      continue;
    }

    itemMap.set(key, { ...item });
  }
}

const usedSlugs = new Map();
const products = Array.from(itemMap.values()).map((item, index) => {
  const brand = inferBrand(item.name);
  const category = inferCategory(item.name);
  const baseSlug = slugify(`${brand}-${item.name}`) || `product-${index + 1}`;
  const slugCount = usedSlugs.get(baseSlug) ?? 0;
  const slug = slugCount === 0 ? baseSlug : `${baseSlug}-${slugCount + 1}`;

  usedSlugs.set(baseSlug, slugCount + 1);

  return {
    id: index + 1,
    slug,
    name: item.name,
    brand,
    category,
    price: Math.round(item.retailPrice),
    oldPrice: null,
    stockStatus: "В наявності",
    stockQuantity: item.quantity,
    imageUrl: defaultImageUrl,
    shortDescription: createShortDescription(item.name, category),
    description:
      "Поточна позиція каталогу Urban Grooming Lviv. Наявність і деталі можна уточнити під час підтвердження замовлення.",
    tags: [category.toLowerCase(), brand.toLowerCase()],
    seoTitle: `${item.name} | Urban Grooming Lviv`,
    seoDescription: `${item.name} у каталозі Urban Grooming Lviv.`,
    featured: index < 12,
  };
});

const outputPath = resolve(process.cwd(), "data/products.json");
writeFileSync(outputPath, `${JSON.stringify(products, null, 2)}\n`, "utf8");

console.log(`Imported ${products.length} products into ${outputPath}`);
