import fs from 'node:fs';

const templatePath = new URL('../src/metadata.template.json', import.meta.url);
const outPath = new URL('../dist/metadata.json', import.meta.url);

const template = JSON.parse(fs.readFileSync(templatePath, 'utf-8'));

if (!process.env.REGISTRY_BASE_URL || !process.env.EDGE_CACHE_TTL) {
  console.error("❌ Build Failed: environment variables are missing.");
  process.exit(1);
}

template.bindings[0].text = process.env.REGISTRY_BASE_URL;
template.bindings[1].text = process.env.EDGE_CACHE_TTL;

if (!fs.existsSync(new URL('../dist', import.meta.url))) {
  fs.mkdirSync(new URL('../dist', import.meta.url));
}

fs.writeFileSync(outPath, JSON.stringify(template, null, 2));
console.log("✅ dist/metadata.json successfully generated.");
