import { describe, expect, it } from 'vitest';
import { findMotive, orgsIn, resolveCategory, treeFor, unionTree, communes } from './catalog';
import { PERSONAS, SAMPLES } from './demo';
import { TOPICS, infoFor, key } from './topics';
import { fold } from '../lib/text';

describe('catálogo real', () => {
  it('cada categoría de algún centro aparece en al menos un tema', () => {
    const inTopics = new Set(
      TOPICS.flatMap((t) => t.items).map((k) => {
        const [p, m] = k.split(' › ');
        return fold(key(p, m));
      }),
    );
    const missing = unionTree.flatMap((p) => p.motives.map((m) => key(p.name, m.name))).filter((k) => !inTopics.has(fold(k)));
    expect(missing).toEqual([]);
  });

  it('cada tema apunta a categorías que existen', () => {
    const broken = TOPICS.flatMap((t) => t.items).filter((k) => {
      const [p, m] = k.split(' › ');
      return !findMotive(p, m);
    });
    expect(broken).toEqual([]);
  });

  it('cada categoría tiene una explicación', () => {
    const without = unionTree.flatMap((p) => p.motives.filter((m) => !infoFor(p.name, m.name)).map((m) => key(p.name, m.name)));
    expect(without).toEqual([]);
  });

  it('cada centro tiene su catálogo', () => {
    for (const c of communes.slice(0, 40)) for (const o of orgsIn(c.id)) expect(treeFor(o.id)).toBeTruthy();
  });
});

describe('datos ficticios de la demo', () => {
  it('las personas simuladas tienen comuna y centro reales', () => {
    for (const p of PERSONAS) {
      expect(p.data.homeCommune).toBeTruthy();
      expect(p.data.orgId).toBeTruthy();
    }
  });
  it('las solicitudes de ejemplo se traducen a identificadores del centro', () => {
    expect(SAMPLES).toHaveLength(3);
    for (const s of SAMPLES) expect(resolveCategory(s.draft.category!, s.ids.orgId)).toEqual({ providerId: s.ids.providerId, motiveId: s.ids.motiveId, detailId: s.ids.detailId });
  });
});
