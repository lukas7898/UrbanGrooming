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

function normalizeDisplayName(value) {
  return cleanName(value)
    .replace(/\s*арт\.?\s*[\w/-]+/gi, "")
    .replace(/\s*\bарт\s*[\w/-]+/gi, "")
    .replace(/\s+/g, " ")
    .replace(/\s+,/g, ",")
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

function createDisplayName(invoiceName, brand) {
  let name = normalizeDisplayName(invoiceName);

  const replacements = [
    [/^Корм\s+/i, ""],
    [/Бріт Кеа дог/gi, "Brit Care Dog"],
    [/Бріт Кеа Кет/gi, "Brit Care Cat"],
    [/Бріт Кеа/gi, "Brit Care"],
    [/Гіпоалергенний/gi, "Hypoallergenic"],
    [/едалт/gi, "Adult"],
    [/лардж брід/gi, "Large Breed"],
    [/медіум брід/gi, "Medium Breed"],
    [/Паппі/gi, "Puppy"],
    [/Грейн Фрі/gi, "Grain Free"],
    [/Хеіркеа Хеалсі енд Шайні Коат/gi, "Haircare Healthy & Shiny Coat"],
    [/Хелсі Гровз енд Девелопмент/gi, "Healthy Growth & Development"],
    [/Стеріалайзд Урінарі Хелз/gi, "Sterilised Urinary Health"],
    [/Стеріалайзд Вейт Контрол/gi, "Sterilised Weight Control"],
    [/Стеріалайзд Сенсатів/gi, "Sterilised Sensitive"],
    [/д\/дорослих/gi, "для дорослих"],
    [/д\/цуценят/gi, "для цуценят"],
    [/д\/кошенят/gi, "для кошенят"],
  ];

  for (const [pattern, replacement] of replacements) {
    name = name.replace(pattern, replacement);
  }

  for (const marker of ["Brit Care Cat", "Brit Care Dog"]) {
    const firstIndex = name.indexOf(marker);
    const lastIndex = name.lastIndexOf(marker);

    if (firstIndex !== -1 && lastIndex !== firstIndex) {
      name = name.slice(lastIndex);
    }
  }

  name = name
    .replace(/великих порід вагою від\s*\d+\s?кг,?\s*/gi, "")
    .replace(/середніх порід вагою\s*[\d-]+\s?кг,?\s*/gi, "")
    .replace(/для стерилізованих котів з надмірною вагою\s*/gi, "")
    .replace(/для стерилізованих котів з чутливим травленням\s*/gi, "")
    .replace(/для стерилізованих котів\s*/gi, "")
    .replace(/для котів\s*/gi, "")
    .replace(/котів\s+Brit Care Cat/gi, "Brit Care Cat")
    .replace(/^Brit Care\s+вологий\s+Brit Care Cat/gi, "Brit Care Cat вологий")
    .replace(/для дорослих собак\s*/gi, "")
    .replace(/для дорослих котів\s*/gi, "")
    .replace(/для кошенят\s*/gi, "")
    .replace(/для цуценят\s*/gi, "")
    .replace(/що потребують догляду за шкірою та шерстю\s*/gi, "")
    .replace(/для здорового росту та розвитку\s*/gi, "")
    .replace(/сухий\s*/gi, "")
    .replace(/вологий повнораціонний\s*/gi, "вологий ")
    .replace(/вологий\s+для\s+/gi, "вологий ")
    .replace(/\s*,\s*/g, ", ")
    .replace(/,\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!name.toLowerCase().startsWith(brand.toLowerCase())) {
    name = `${brand} ${name}`;
  }

  if (name.length <= 96) {
    return name;
  }

  const sizeMatch = name.match(/(\d+(?:[,.]\d+)?\s?(?:кг|г))\b/gi);
  const size = sizeMatch ? sizeMatch[sizeMatch.length - 1] : "";
  const compact = name
    .replace(/\s+вагою\s+[^,]+/gi, "")
    .replace(/\s+порід\s+[^,]+/gi, "")
    .split(",")
    .slice(0, 2)
    .join(",")
    .trim();

  if (compact.length <= 96) {
    return compact;
  }

  return `${compact.slice(0, 88).replace(/\s+\S*$/, "")}${
    size ? ` ${size}` : ""
  }`;
}

function createShortDescription(productName, category) {
  const lowerName = productName.toLowerCase();

  if (category === "Корм" && lowerName.includes("волог")) {
    return "Вологий корм для щоденного раціону або як смачне доповнення до основного харчування.";
  }

  if (category === "Корм" && lowerName.includes("cat")) {
    return "Сухий корм для котів з підібраною формулою для щоденного харчування.";
  }

  if (category === "Корм" && lowerName.includes("dog")) {
    return "Сухий корм для собак з формулою для щоденного збалансованого раціону.";
  }

  if (category === "Корм") {
    return "Корм для щоденного харчування собак або котів.";
  }

  if (category === "Ласощі") {
    return "Ласощі для винагороди, прогулянок або приємного доповнення до раціону.";
  }

  return "Товар для щоденного догляду та комфорту вашого улюбленця.";
}

function createDescription(productName, category) {
  const lowerName = productName.toLowerCase();

  if (category === "Корм" && lowerName.includes("weight control")) {
    return "Формула для котів, яким важливо контролювати вагу. Підходить для регулярного використання як основний раціон.";
  }

  if (category === "Корм" && lowerName.includes("sterilised")) {
    return "Раціон для стерилізованих котів. Допомагає підтримувати щоденне харчування з урахуванням особливих потреб після стерилізації.";
  }

  if (category === "Корм" && lowerName.includes("haircare")) {
    return "Формула для підтримки шкіри та шерсті. Підходить для котів, яким потрібен додатковий догляд за якістю шерсті.";
  }

  if (category === "Корм" && lowerName.includes("puppy")) {
    return "Раціон для цуценят у період росту. Підійде для щоденного годування відповідно до рекомендацій виробника.";
  }

  if (category === "Корм" && lowerName.includes("kitten")) {
    return "Раціон для кошенят у період росту. Підходить для щоденного годування відповідно до рекомендацій виробника.";
  }

  if (category === "Корм" && lowerName.includes("волог")) {
    return "Вологий корм із м'якою текстурою. Можна використовувати як основний раціон або як доповнення до сухого корму.";
  }

  if (category === "Корм") {
    return "Збалансований корм для щоденного раціону. Перед замовленням можна перевірити фасування, склад і рекомендації виробника на упаковці.";
  }

  if (category === "Ласощі") {
    return "Смачні ласощі для заохочення та щоденної винагороди. Зручно брати на прогулянку або використовувати під час тренування.";
  }

  return "Практична позиція для догляду, комфорту або щоденного використання.";
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
  const displayName = createDisplayName(item.name, brand);
  const baseSlug = slugify(`${brand}-${displayName}`) || `product-${index + 1}`;
  const slugCount = usedSlugs.get(baseSlug) ?? 0;
  const slug = slugCount === 0 ? baseSlug : `${baseSlug}-${slugCount + 1}`;

  usedSlugs.set(baseSlug, slugCount + 1);

  return {
    id: index + 1,
    slug,
    name: displayName,
    brand,
    category,
    price: Math.round(item.retailPrice),
    oldPrice: null,
    stockStatus: "В наявності",
    stockQuantity: item.quantity,
    supplierArticle: item.article,
    barcode: item.barcode,
    imageUrl: defaultImageUrl,
    shortDescription: createShortDescription(displayName, category),
    description: createDescription(displayName, category),
    tags: [category.toLowerCase(), brand.toLowerCase()],
    seoTitle: `${displayName} | Urban Grooming Lviv`,
    seoDescription: `${displayName} у каталозі Urban Grooming Lviv.`,
    featured: index < 12,
  };
});

const outputPath = resolve(process.cwd(), "data/products.json");
writeFileSync(outputPath, `${JSON.stringify(products, null, 2)}\n`, "utf8");

console.log(`Imported ${products.length} products into ${outputPath}`);
