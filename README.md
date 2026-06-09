# Urban Grooming Lviv MVP Catalog

Production-ready MVP website for Urban Grooming Lviv, combining grooming service information with a pet goods catalog that can later evolve into e-commerce.

## Tech Stack

- Next.js 15+
- TypeScript
- Tailwind CSS
- App Router
- Static product catalog from `data/products.json`

## Installation

```bash
npm install
```

## Local Development

```bash
npm run dev
```

Open the local URL shown in the terminal, usually `http://localhost:3000`.

If the dev server stays on `Starting...` for more than a minute on Windows, stop it with `Ctrl + C` and run:

```bash
npm run dev:turbo
```

If port `3000` is already in use:

```bash
npm run dev:3001
```

## Telegram Orders

Product pages include an add-to-cart flow:

- quantity selector
- stock quantity limit per product
- local cart saved in the customer's browser
- multi-item checkout on `/cart`
- customer name
- customer phone with `+380` prefilled
- submit button for the whole cart
- success confirmation on the website
- local customer receipt saved on `/orders`
- Telegram notification to the admin

The customer does not copy any text manually. The website sends the cart order through a Telegram bot from the server-side route `app/api/orders/route.ts`.

The cart and `/orders` page store data in the customer's browser local storage. This is useful for an MVP, but it is not cross-device. A real cart and order history later require a database and customer identity.

### Bot Setup

1. Open Telegram and find `@BotFather`.
2. Send `/newbot`.
3. Choose a bot name and username.
4. Copy the bot token.
5. Open your new bot and send `/start`.
6. Get your admin chat ID by opening this URL in a browser, replacing `TOKEN` with the bot token:

```text
https://api.telegram.org/botTOKEN/getUpdates
```

Find `chat.id` in the response. That value is `TELEGRAM_ADMIN_CHAT_ID`.

Create a local `.env.local` file:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_ADMIN_CHAT_ID=your_chat_id_here
```

Restart the dev server after changing `.env.local`.

For Vercel deployment, add the same variables in Project Settings → Environment Variables. Set `NEXT_PUBLIC_SITE_URL` to the production domain.

## Adding Products

Products are stored in `data/products.json`.

You can edit products manually or import them from supplier invoice `.xls` files.

To import invoices:

```bash
npm run import:products -- "C:\path\to\invoice-1.xls" "C:\path\to\invoice-2.xls"
```

The import script reads product name, quantity, and retail price (`РРЦ`), then rewrites `data/products.json`. Product images still need to be added manually in `public/images/products/`.

Use this structure:

```json
{
  "id": 13,
  "slug": "example-product",
  "name": "Example Product",
  "brand": "Example Brand",
  "category": "Корм",
  "price": 299,
  "oldPrice": 349,
  "stockStatus": "В наявності",
  "stockQuantity": 4,
  "imageUrl": "/images/products/placeholder-product.jpg",
  "shortDescription": "Short product summary.",
  "description": "Full product description.",
  "tags": ["собаки", "корм"],
  "seoTitle": "Example Product купити у Львові",
  "seoDescription": "SEO description for the product page.",
  "featured": true
}
```

Notes:

- Keep `slug` unique because it becomes the product page URL.
- Use `stockQuantity` for the real available quantity. The order form will not allow customers to order more than this number.
- Put product images in `public/images/products/`.
- Use `featured: true` to show a product on the home page.

## Changing Colors

Brand colors are defined in two places:

- `tailwind.config.ts` for Tailwind utility classes
- `app/globals.css` for CSS variables

Current palette:

- Primary: `#F2D44B`
- Dark: `#2D2D2D`
- Background: `#F8F8F8`
- Text: `#222222`

## Deployment to Vercel

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Keep the default Next.js build settings.
4. Optional: set `NEXT_PUBLIC_SITE_URL` to the production domain for canonical metadata.
5. Deploy.

## Future API Migration

Catalog access is isolated in `services/products.ts`, so a later API or database implementation can replace the JSON import without changing page and component contracts.
