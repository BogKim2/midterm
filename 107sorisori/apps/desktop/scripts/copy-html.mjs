import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const here = path.dirname(url.fileURLToPath(import.meta.url));
const pkgRoot = path.join(here, "..");
const srcHtml = path.join(pkgRoot, "src", "renderer", "index.html");
const dstDir = path.join(pkgRoot, "dist", "renderer");
const dstHtml = path.join(dstDir, "index.html");

fs.mkdirSync(dstDir, { recursive: true });
fs.copyFileSync(srcHtml, dstHtml);
// eslint-disable-next-line no-console
console.log(`[desktop] copied index.html → ${dstHtml}`);
