import raw from './catalog.json';
import { fold } from '../lib/text';
import type { Category, Commune } from '../state/request';

// Catálogo público de Telesalud (api.telesalud.gob.cl), descargado una vez
// con scripts/catalog.mjs. Mismos identificadores que usa el formulario actual.

export type Item = { id: number; code: string; display: string };
export type Detail = { id: number; name: string };
export type Motive = { id: number; name: string; details: Detail[] };
export type Provider = { id: number; name: string; motives: Motive[] };
export type Org = { id: number; code: string; name: string; address: string | null; type: string; communeId: number; v: number };

type Raw = {
  generatedAt: string;
  identifierTypes: Item[];
  sexes: Item[];
  genders: Item[];
  regions: { id: number; code: string; name: string; communes: { id: number; code: string; name: string }[] }[];
  providers: { id: number; name: string }[];
  motives: { id: number; p: number; name: string }[];
  details: { id: number; m: number; name: string }[];
  variants: number[][];
  orgs: Org[];
};

const C = raw as Raw;

const motiveById = new Map(C.motives.map((m) => [m.id, m]));
const detailById = new Map(C.details.map((d) => [d.id, d]));
const providerById = new Map(C.providers.map((p) => [p.id, p]));

/**
 * Arma el árbol prestador › motivo › especificidad a partir de una lista de especificidades.
 * El catálogo real repite a veces un nombre dentro del mismo motivo; se muestra una sola vez.
 */
function buildTree(detailIds: number[]): Provider[] {
  const providers = new Map<number, Provider>();
  const motives = new Map<number, Motive>();
  for (const id of detailIds) {
    const d = detailById.get(id);
    const m = d && motiveById.get(d.m);
    const p = m && providerById.get(m.p);
    if (!d || !m || !p) continue;
    let P = providers.get(p.id);
    if (!P) providers.set(p.id, (P = { id: p.id, name: p.name, motives: [] }));
    let M = motives.get(m.id);
    if (!M) {
      motives.set(m.id, (M = { id: m.id, name: m.name, details: [] }));
      P.motives.push(M);
    }
    if (!M.details.some((x) => fold(x.name) === fold(d.name))) M.details.push({ id: d.id, name: d.name });
  }
  return [...providers.values()].sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

const treeCache = new Map<number, Provider[]>();

// Cuántos centros ofrecen cada motivo y cada especificidad (por nombre).
const motiveCount = new Map<string, number>();
const detailCount = new Map<string, number>();
for (const o of C.orgs) {
  const ms = new Set<string>();
  for (const id of C.variants[o.v]) {
    const d = detailById.get(id);
    const m = d && motiveById.get(d.m);
    const p = m && providerById.get(m.p);
    if (!d || !m || !p) continue;
    const mk = fold(p.name + '|' + m.name);
    ms.add(mk);
    const dk = mk + '|' + fold(d.name);
    detailCount.set(dk, (detailCount.get(dk) ?? 0) + 1);
  }
  for (const mk of ms) motiveCount.set(mk, (motiveCount.get(mk) ?? 0) + 1);
}

/** Parte de los centros del país que ofrece este motivo (0 a 1). */
export function motiveShare(prestador: string, motivo: string): number {
  return (motiveCount.get(fold(prestador + '|' + motivo)) ?? 0) / C.orgs.length;
}

/** Bajo esta parte, el motivo se marca "Solo en algunos centros". */
export const COMMON = 0.9;
/** Bajo esta parte, la especificidad no se muestra hasta saber el CESFAM (p. ej. "Sospecha COVID", en 1 centro). */
const RARE_DETAIL = 0.05;

export const catalogDate = C.generatedAt;
export const identifierTypes = C.identifierTypes;
export const sexes = C.sexes;
export const genders = C.genders;

export const communes: Commune[] = C.regions
  .flatMap((r) => r.communes.map((c) => ({ id: c.id, name: c.name, regionId: r.id, regionName: r.name })))
  .sort((a, b) => a.name.localeCompare(b.name, 'es'));

const foldedCommunes = communes.map((c) => ({ c, f: fold(c.name) }));

export function searchCommunes(q: string, limit = 8): Commune[] {
  const f = fold(q);
  if (!f) return [];
  const starts = foldedCommunes.filter((x) => x.f.startsWith(f));
  const contains = foldedCommunes.filter((x) => !x.f.startsWith(f) && x.f.includes(f));
  return [...starts, ...contains].slice(0, limit).map((x) => x.c);
}

const TYPE_ORDER = ['cesfam', 'cecosf', 'hospital-comunitario', 'psr'];

/** Centros de una comuna: primero los CESFAM, luego CECOSF, hospitales comunitarios y postas. */
export function orgsIn(communeId: number): Org[] {
  return C.orgs
    .filter((o) => o.communeId === communeId)
    .sort((a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type) || a.name.localeCompare(b.name, 'es'));
}

export function orgById(id: number | null): Org | undefined {
  return id == null ? undefined : C.orgs.find((o) => o.id === id);
}

export function communeById(id: number): Commune | undefined {
  return communes.find((c) => c.id === id);
}

export function treeFor(orgId: number): Provider[] | undefined {
  const org = orgById(orgId);
  if (!org) return undefined;
  let t = treeCache.get(org.v);
  if (!t) treeCache.set(org.v, (t = buildTree(C.variants[org.v])));
  return t;
}

/** Todas las categorías que existen en algún centro, para elegir antes de saber el CESFAM. */
export const unionTree: Provider[] = mergeByName(buildTree(C.details.map((d) => d.id))).map((p) => ({
  ...p,
  motives: p.motives.map((m) => {
    const mk = fold(p.name + '|' + m.name);
    const n = motiveCount.get(mk) ?? 0;
    return { ...m, details: m.details.filter((d) => (detailCount.get(mk + '|' + fold(d.name)) ?? 0) >= RARE_DETAIL * n) };
  }),
}));

/** El catálogo trae variantes del mismo motivo con otra mayúscula ("Control de la díada"): se muestran una vez. */
function mergeByName(tree: Provider[]): Provider[] {
  return tree.map((p) => {
    const seen = new Map<string, Motive>();
    for (const m of p.motives) {
      const k = fold(m.name);
      const prev = seen.get(k);
      if (!prev) seen.set(k, { ...m, details: [...m.details] });
      else for (const d of m.details) if (!prev.details.some((x) => fold(x.name) === fold(d.name))) prev.details.push(d);
    }
    return { ...p, motives: [...seen.values()] };
  });
}

const same = (a: string, b: string) => fold(a) === fold(b);

const DISPLAY_FIX: Record<string, string> = {
  'Control de salud infantil (rango 5 meses y 3 años': 'Control de salud infantil (5 meses a 3 años 6 meses)',
};

/** Algunos nombres del catálogo vienen cortados. Se arreglan solo para mostrar; se envía el mismo identificador. */
export function motiveName(name: string): string {
  if (DISPLAY_FIX[name]) return DISPLAY_FIX[name];
  const open = (name.match(/\(/g) ?? []).length;
  const close = (name.match(/\)/g) ?? []).length;
  return open > close ? name + ')' : name;
}

export function findMotive(prestador: string, motivo: string, tree: Provider[] = unionTree) {
  const p = tree.find((x) => same(x.name, prestador));
  const m = p?.motives.find((x) => same(x.name, motivo));
  return p && m ? { provider: p, motive: m } : undefined;
}

/** Traduce la categoría elegida a los identificadores del CESFAM elegido. */
export function resolveCategory(cat: Category, orgId: number) {
  const tree = treeFor(orgId);
  if (!tree) return undefined;
  const found = findMotive(cat.prestador, cat.motivo, tree);
  const detail = found?.motive.details.find((d) => same(d.name, cat.especificidad));
  if (!found || !detail) return undefined;
  return { providerId: found.provider.id, motiveId: found.motive.id, detailId: detail.id };
}

export function orgOffers(cat: Category, orgId: number): boolean {
  return !!resolveCategory(cat, orgId);
}

export function allMotives(tree: Provider[] = unionTree) {
  return tree.flatMap((p) => p.motives.map((m) => ({ provider: p, motive: m })));
}
