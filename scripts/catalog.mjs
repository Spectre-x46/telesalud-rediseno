// Descarga el catálogo público de Telesalud y genera src/data/catalog.json.
//
//   node scripts/catalog.mjs              descarga todo (≈ 15 min, con pausas para no cargar el servicio)
//   node scripts/catalog.mjs --from DIR   usa una descarga previa guardada en DIR
//
// Solo hace lecturas (GET) de los mismos catálogos que usa el formulario de telesalud.gob.cl.
// No envía ni modifica nada.

import fs from 'node:fs';
import path from 'node:path';

const API = 'https://api.telesalud.gob.cl/api/v1/';
const UA = 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36';
const OUT = new URL('../src/data/catalog.json', import.meta.url);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const args = process.argv.slice(2);
const fromDir = args.includes('--from') ? args[args.indexOf('--from') + 1] : null;
const saveDir = args.includes('--save') ? args[args.indexOf('--save') + 1] : null;

async function get(p) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(API + p, {
        headers: { 'User-Agent': UA, Origin: 'https://telesalud.gob.cl', Referer: 'https://telesalud.gob.cl/' },
        signal: AbortSignal.timeout(20000),
      });
      if (r.ok) return r.json();
      console.error('HTTP', r.status, p);
    } catch (e) {
      console.error('Error', p, e.message);
    }
    await sleep(1500);
  }
  return null;
}

async function download() {
  const raw = {};
  for (const e of ['identifier-types', 'administrative-genders', 'administrative-sexs', 'regions']) raw[e] = await get(e);
  raw.communes = {};
  for (const r of raw.regions) {
    raw.communes[r.id] = await get(`regions/${r.id}/communes`);
    await sleep(200);
  }
  const comms = Object.values(raw.communes).flatMap((r) => r.communes);
  raw.orgs = {};
  for (const c of comms) {
    raw.orgs[c.id] = (await get(`organizations/search?commune.id=${c.id}`)) ?? [];
    await sleep(200);
  }
  raw.care = {};
  const active = Object.values(raw.orgs).flat().filter((o) => o.isActive);
  for (const [i, o] of active.entries()) {
    raw.care[o.id] = await get(`organizations/${o.id}/care-details`);
    if (i % 50 === 0) console.log(`care-details ${i}/${active.length}`);
    await sleep(200);
  }
  return raw;
}

function readDir(dir) {
  const j = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  return {
    'identifier-types': j('identifier-types.json'),
    'administrative-genders': j('administrative-genders.json'),
    'administrative-sexs': j('administrative-sexs.json'),
    regions: j('regions.json'),
    communes: j('communes.json'),
    orgs: j('orgs.json'),
    care: j('care.json'),
  };
}

// Los nombres del catálogo traen espacios sobrantes; se limpian solo para mostrar.
const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

// Formato compacto: un diccionario nacional (los identificadores son únicos en todo el país)
// y, por cada variante de catálogo, la lista de especificidades que ofrece.
function build(raw) {
  const item = (x) => ({ id: x.id, code: x.code, display: clean(x.display) });

  const regions = Object.values(raw.communes)
    .map((r) => ({
      id: r.id,
      code: r.code,
      name: clean(r.display),
      communes: r.communes.map((c) => ({ id: c.id, code: c.code, name: clean(c.display) })),
    }))
    .sort((a, b) => a.code.localeCompare(b.code));

  const providers = new Map();
  const motives = new Map();
  const details = new Map();
  const variants = [];
  const variantIndex = new Map();
  const orgs = [];

  for (const o of Object.values(raw.orgs).flat()) {
    const tree = raw.care[o.id];
    if (!o.isActive || !Array.isArray(tree)) continue;
    const ids = new Set();
    for (const p of tree) {
      providers.set(p.id, { id: p.id, name: clean(p.display) });
      for (const m of p.careTypes) {
        motives.set(m.id, { id: m.id, p: p.id, name: clean(m.display) });
        for (const d of m.careDetails) {
          details.set(d.id, { id: d.id, m: m.id, name: clean(d.display) });
          ids.add(d.id);
        }
      }
    }
    if (!ids.size) continue;
    const list = [...ids].sort((a, b) => a - b);
    const k = list.join(',');
    if (!variantIndex.has(k)) {
      variantIndex.set(k, variants.length);
      variants.push(list);
    }
    orgs.push({
      id: o.id,
      code: o.code,
      name: clean(o.display),
      address: o.address ? clean(o.address) : null,
      type: o.organizationType?.code ?? '',
      communeId: o.communeId,
      v: variantIndex.get(k),
    });
  }

  const byId = (a, b) => a.id - b.id;
  return {
    generatedAt: new Date().toISOString().slice(0, 10),
    source: API,
    identifierTypes: raw['identifier-types'].map(item),
    sexes: raw['administrative-genders'].map(item),
    genders: raw['administrative-sexs'].map(item),
    regions,
    providers: [...providers.values()].sort(byId),
    motives: [...motives.values()].sort(byId),
    details: [...details.values()].sort(byId),
    variants,
    orgs: orgs.sort((a, b) => a.name.localeCompare(b.name, 'es')),
  };
}

const raw = fromDir ? readDir(fromDir) : await download();
if (saveDir) {
  fs.mkdirSync(saveDir, { recursive: true });
  for (const [k, v] of Object.entries(raw)) fs.writeFileSync(path.join(saveDir, `${k}.json`), JSON.stringify(v));
}
const out = build(raw);
fs.writeFileSync(OUT, JSON.stringify(out));
console.log(`${out.orgs.length} establecimientos, ${out.motives.length} motivos, ${out.variants.length} variantes de catálogo → ${OUT.pathname}`);
