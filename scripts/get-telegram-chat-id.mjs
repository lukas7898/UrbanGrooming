import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readEnvFile() {
  const envPath = resolve(process.cwd(), ".env.local");

  try {
    return readFileSync(envPath, "utf8");
  } catch {
    throw new Error("Cannot read .env.local. Add TELEGRAM_BOT_TOKEN first.");
  }
}

function getEnvValue(source, key) {
  const line = source
    .split(/\r?\n/)
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${key}=`));

  if (!line) {
    return "";
  }

  return line.slice(key.length + 1).trim();
}

async function requestTelegram(botToken, method) {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/${method}`);
  const payload = await response.json();

  if (!payload.ok) {
    throw new Error(payload.description || `Telegram ${method} failed.`);
  }

  return payload.result;
}

const envSource = readEnvFile();
const botToken = getEnvValue(envSource, "TELEGRAM_BOT_TOKEN");

if (!botToken || botToken === "paste_bot_token_here") {
  throw new Error("Paste your real TELEGRAM_BOT_TOKEN into .env.local first.");
}

const bot = await requestTelegram(botToken, "getMe");
console.log(`Bot connected: @${bot.username}`);

await requestTelegram(botToken, "deleteWebhook");
const updates = await requestTelegram(botToken, "getUpdates");

const chats = new Map();

for (const update of updates) {
  const chat =
    update.message?.chat ||
    update.edited_message?.chat ||
    update.channel_post?.chat ||
    update.my_chat_member?.chat;

  if (chat?.id) {
    chats.set(chat.id, chat);
  }
}

if (chats.size === 0) {
  console.log("");
  console.log("No chat_id found yet.");
  console.log("1. Open your bot in Telegram.");
  console.log("2. Send /start or any test message to the bot.");
  console.log("3. Run: npm run telegram:chat-id");
  process.exit(0);
}

console.log("");
console.log("Found chat IDs:");

for (const chat of chats.values()) {
  const title = chat.title || [chat.first_name, chat.last_name].filter(Boolean).join(" ");
  console.log(`TELEGRAM_ADMIN_CHAT_ID=${chat.id} ${title ? `(${title})` : ""}`);
}
