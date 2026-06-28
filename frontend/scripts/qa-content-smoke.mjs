/**
 * HTML content smoke — key strings on critical pages.
 * Usage: node scripts/qa-content-smoke.mjs [baseUrl]
 */
const base = process.argv[2] || "http://localhost:3001";

const pages = [
  {
    path: "/contact",
    mustInclude: [
      "mvroverseasconsultancy@gmail.com",
      "guntur@mvrconsultants.org",
      "Hyderabad",
      "Guntur",
      "Mukkapati Veeranjaneyulu",
    ],
  },
  {
    path: "/",
    mustInclude: ["MVR", "Study Abroad"],
  },
  {
    path: "/countries/canada",
    mustInclude: ["Canada", "images.unsplash.com"],
  },
  {
    path: "/privacy",
    mustInclude: ["Hyderabad", "Guntur"],
  },
  {
    path: "/tools/gpa",
    mustInclude: ["GPA"],
  },
];

let failed = 0;
for (const { path, mustInclude } of pages) {
  const res = await fetch(`${base}${path}`);
  const html = await res.text();
  if (res.status !== 200) {
    console.error(`FAIL ${path} status ${res.status}`);
    failed++;
    continue;
  }
  for (const needle of mustInclude) {
    if (!html.includes(needle)) {
      console.error(`FAIL ${path} missing: "${needle}"`);
      failed++;
    }
  }
  if (res.status === 200) {
    const missing = mustInclude.filter((n) => !html.includes(n));
    if (!missing.length) console.log(`PASS ${path}`);
  }
}

if (failed) {
  console.error(`\n${failed} content check(s) failed.`);
  process.exit(1);
}
console.log("\nAll content smoke checks passed.");
