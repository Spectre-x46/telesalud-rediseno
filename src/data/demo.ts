import type { Draft, RequestStatus, Submitted } from '../state/request';
import { emptyDraft } from '../state/request';
import { communes, orgsIn, resolveCategory } from './catalog';

// Personas y solicitudes ficticias para probar la demo. Ninguna corresponde a una persona real.

export type Persona = {
  id: string;
  label: string;
  age: string;
  data: Partial<Draft>;
};

function communeByName(name: string) {
  return communes.find((c) => c.name === name) ?? null;
}

function firstOrg(communeName: string): number | null {
  const c = communeByName(communeName);
  return c ? orgsIn(c.id)[0]?.id ?? null : null;
}

/** Simulación de ClaveÚnica (nivel C): no sabemos qué datos entrega hoy a Telesalud. */
export const PERSONAS: Persona[] = [
  {
    id: 'maria',
    label: 'María Soto Rojas',
    age: '72 años',
    data: {
      docType: 'run',
      docNumber: '8.765.432-K',
      names: 'María',
      lastName1: 'Soto',
      lastName2: 'Rojas',
      sex: 'female',
      birth: { day: '3', month: '5', year: '1954' },
      homeCommune: communeByName('Puente Alto'),
      street: 'Los Aromos',
      number: '1234',
      orgCommune: communeByName('Puente Alto'),
      orgId: firstOrg('Puente Alto'),
    },
  },
  {
    id: 'juan',
    label: 'Juan Pérez Muñoz',
    age: '34 años',
    data: {
      docType: 'run',
      docNumber: '17.654.321-3',
      names: 'Juan Andrés',
      lastName1: 'Pérez',
      lastName2: 'Muñoz',
      sex: 'male',
      birth: { day: '21', month: '11', year: '1991' },
      homeCommune: communeByName('Valparaíso'),
      street: 'Avenida Brasil',
      number: '560',
      orgCommune: communeByName('Valparaíso'),
      orgId: firstOrg('Valparaíso'),
    },
  },
];

function sample(code: string, status: RequestStatus, daysAgo: number): Submitted | null {
  const maria = PERSONAS[0].data;
  const orgId = maria.orgId;
  if (!orgId) return null;
  const draft: Draft = {
    ...emptyDraft(),
    ...maria,
    category: { prestador: 'Medicina', motivo: 'Renovación de receta', especificidad: 'Renovación de receta' },
    info: 'Se me acabaron los remedios de la presión. Los tomo hace años.',
    identityMode: 'manual',
    phone1: '912345678',
    done: 5,
  };
  const ids = resolveCategory(draft.category!, orgId);
  if (!ids) return null;
  return {
    code,
    createdAt: Date.now() - daysAgo * 86400000,
    status,
    cancelled: false,
    draft,
    ids: { ...ids, orgId },
    sample: true,
  };
}

export const SAMPLES: Submitted[] = [
  sample('DEMO00ING1', 'ingresada', 0),
  sample('DEMO00REV2', 'en-revision', 1),
  sample('DEMO00FIN3', 'finalizada', 4),
].filter((x): x is Submitted => x !== null);

export const SAMPLE_LASTNAME = 'Soto';
