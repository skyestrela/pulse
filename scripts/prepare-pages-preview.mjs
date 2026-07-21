import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const output = path.join(root, "pages-preview");
const homepage = path.join(root, ".next", "server", "app", "index.html");

if (!fs.existsSync(homepage)) {
  throw new Error(`Static homepage not found: ${homepage}`);
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
fs.copyFileSync(homepage, path.join(output, "index.html"));
fs.cpSync(
  path.join(root, ".next", "static"),
  path.join(output, "_next", "static"),
  { recursive: true }
);

const publicDir = path.join(root, "public");
if (fs.existsSync(publicDir)) {
  fs.cpSync(publicDir, output, { recursive: true });
}

fs.writeFileSync(path.join(output, ".nojekyll"), "");
console.log(`Prepared GitHub Pages preview at ${output}`);
