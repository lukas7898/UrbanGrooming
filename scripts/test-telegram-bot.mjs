import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readEnvFile() {
  const envPath = resolve(process.cwd(), ".env.local");

  try {
    return readFileSync(envPath, "utf8");
  } catch {
    throw new Error("Cannot read .env.local.");
  }
}

function getEnvValue(source, key) {
  const line = source
    .split(/\r?\n/)
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${key}=`));

  return line ? line.slice(key.length + 1).trim() : "";
}

async function telegramRequest(botToken, method, body) {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json();

  if (!payload.ok) {
    throw new Error(payload.description || `Telegram ${method} failed.`);
  }

  return payload.result;
}

const envSource = readEnvFile();
const botToken = getEnvValue(envSource, "TELEGRAM_BOT_TOKEN");
const adminChatId = getEnvValue(envSource, "TELEGRAM_ADMIN_CHAT_ID");

if (!botToken || botToken === "paste_bot_token_here") {
  throw new Error("TELEGRAM_BOT_TOKEN is missing in .env.local.");
}

if (!adminChatId || adminChatId === "paste_admin_chat_id_here") {
  throw new Error("TELEGRAM_ADMIN_CHAT_ID is missing in .env.local.");
}

const bot = await telegramRequest(botToken, "getMe");
console.log(`Bot connected: @${bot.username}`);

await telegramRequest(botToken, "sendMessage", {
  chat_id: adminChatId,
  text: "Test message from Urban Grooming Lviv website.",
});

console.log("Test message sent successfully.");
