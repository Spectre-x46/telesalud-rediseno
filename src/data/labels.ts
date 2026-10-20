import type { Category } from '../state/request';
import { MG, chipLabel, key } from './topics';

/** Cómo se muestra una categoría: nombre corto para la persona y ruta oficial del catálogo. */
export function categoryLabel(c: Category) {
  const official = [c.prestador, c.motivo, c.especificidad !== c.motivo ? c.especificidad : null].filter(Boolean).join(' · ');
  if (key(c.prestador, c.motivo) === MG) {
    return { short: `Evaluación · ${chipLabel(c.especificidad)}`, official };
  }
  const short = c.especificidad !== c.motivo ? `${c.motivo} · ${c.especificidad}` : c.motivo;
  return { short, official };
}

/** "Centro de Salud Familiar Confraternidad" → "CESFAM Confraternidad". */
export function shortOrgName(name: string): string {
  return name
    .replace(/^Centro de Salud Familiar\b/i, 'CESFAM')
    .replace(/^Centro Comunitario de Salud Familiar\b/i, 'CECOSF')
    .replace(/^Posta de Salud Rural\b/i, 'Posta')
    .trim();
}

/** "FEMENINO" → "Femenino"; respeta tildes. */
export function sentence(s: string): string {
  const lower = s.toLocaleLowerCase('es');
  return lower.charAt(0).toLocaleUpperCase('es') + lower.slice(1);
}

/** "De Tarapacá" → "Región de Tarapacá"; "Metropolitana de Santiago" → "Región Metropolitana de Santiago". */
export function regionName(s: string): string {
  return 'Región ' + s.replace(/^De(l?) /, 'de$1 ');
}
