import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure parent .next/package.json exists so Vercel deployment bundler in monorepos never encounters ENOENT
const parentNext = path.resolve(__dirname, "../../.next");
try {
  if (!fs.existsSync(parentNext)) {
    fs.mkdirSync(parentNext, { recursive: true });
  }
  const pkgPath = path.join(parentNext, "package.json");
  if (!fs.existsSync(pkgPath)) {
    fs.writeFileSync(pkgPath, JSON.stringify({ type: "commonjs" }, null, 2));
    console.log("[ensure-output-root] Synced parent .next/package.json for Vercel monorepo deployment.");
  }
} catch (err) {
  console.error("[ensure-output-root] Failed to prepare .next/package.json:", err);
  process.exit(1);
}
