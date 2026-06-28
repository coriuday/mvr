import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { COUNTRY_GALLERY_IMAGES } from "../src/constants/countryGalleryImages.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "../src/data/countries");

for (const slug of Object.keys(COUNTRY_GALLERY_IMAGES)) {
  const filePath = path.join(dataDir, `${slug}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  data.images = [...COUNTRY_GALLERY_IMAGES[slug]];
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
  console.log("Updated", slug);
}
