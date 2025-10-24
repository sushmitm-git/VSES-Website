import { readdir, stat, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = 'assets/photos';
const BUCKETS = ['gallery', 'departments', 'staff', 'media'];
const IMG_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

const slug = s => s
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '')
  || 'image';

async function listImages(dir) {
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await listImages(p));
    else if (IMG_EXT.has(path.extname(e.name).toLowerCase())) out.push(p);
  }
  return out;
}
async function ensureKebabCase(fp) {
  const dir = path.dirname(fp);
  const base = path.basename(fp);
  if (base.startsWith('.')) return fp; // respect dotfiles such as .keep

  let ext = path.extname(base).toLowerCase();
  let name = path.basename(base, ext);

  if (!ext) {
    ext = '.jpg';
  } else if (!IMG_EXT.has(ext)) {
    ext = '.jpg';
  }

  const kebab = `${slug(name)}${ext}`;
  if (base !== kebab) {
    const np = path.join(dir, kebab);
    await rename(fp, np);
    return np;
  }
  return fp;
}
async function main() {
  const data = { gallery: [], departments: [], staff: [], media: [] };
  for (const bucket of BUCKETS) {
    const full = path.join(ROOT, bucket);
    try { const s = await stat(full); if (!s.isDirectory()) continue; } catch { continue; }
    const files = await listImages(full);
    for (const f of files) {
      const fixed = await ensureKebabCase(f);
      const rel = path.relative(ROOT, fixed).replaceAll('\\','/');
      if (bucket === 'departments' || bucket === 'staff') {
        const name = path.basename(rel, path.extname(rel)).replace(/-/g,' ');
        data[bucket].push({ src: `${bucket}/${path.basename(rel)}`, caption: name.replace(/\b\w/g,m=>m.toUpperCase()) });
      } else {
        data[bucket].push(`${bucket}/${path.basename(rel)}`);
      }
    }
  }
  await writeFile(path.join(ROOT, 'manifest.json'), `${JSON.stringify(data, null, 2)}\n`);
  console.log('✅ Wrote assets/photos/manifest.json');
}
main().catch(err => { console.error(err); process.exit(1); });
