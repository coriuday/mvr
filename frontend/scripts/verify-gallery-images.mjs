import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "../src/data/countries");

const files = fs.readdirSync(dataDir).filter((name) => name.endsWith(".json"));
let failed = 0;

for (const file of files) {
  const slug = file.replace(/\.json$/, "");
  const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8"));

  for (const url of data.images ?? []) {
    if (url.startsWith("/images/countries/")) {
      console.error(`LOCAL path [${slug}] ${url}`);
      failed += 1;
      continue;
    }

    const response = await fetch(url, { method: "HEAD" });
    if (!response.ok) {
      console.error(`FAIL ${response.status} [${slug}] ${url}`);
      failed += 1;
    }
  }
}

if (failed > 0) {
  console.error(`\n${failed} gallery image issue(s) found.`);
  process.exit(1);
}

console.log(`All gallery image URLs verified for ${files.length} countries.`);
