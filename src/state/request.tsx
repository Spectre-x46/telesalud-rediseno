import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { load, remove, save } from '../lib/storage';
import type { DateParts } from '../lib/validate';

// Los mismos datos que pide hoy el formulario de Telesalud.
// Cambia el orden y la forma de preguntar, no el contenido.

export type Category = {
  prestador: string;
  motivo: string;
  especificidad: string;
};

export type Commune = { id: number; name: string; regionId: number; regionName: string };

export type Draft = {
  v: 1;
  // Paso 1 · Qué solicita
  category: Category | null;
  info: string; // Información adicional (obligatoria, ≤ 300)
  // Paso 2 · Sus datos
  identityMode: 'manual' | 'claveunica' | null;
  forWhom: 'yo' | 'otra';
  docType: string; // code del catálogo identifier-types
  docNumber: string;
  names: string;
  lastName1: string;
  lastName2: string;
  socialName: string;
  sex: string; // code de administrative-genders
  gender: string; // code de administrative-sexs (opcional)
  birth: DateParts;
  disability: boolean;
  caregiver: boolean;
  // Paso 3 · Dónde se atiende
  homeCommune: Commune | null;
  street: string;
  number: string;
  extra: string;
  orgCommune: Commune | null; // comuna del establecimiento (por defecto, la de la dirección)
  orgId: number | null;
  // Paso 4 · Contacto
  phone1: string;
  phone2: string;
  email: string;
  emailUpdates: boolean;
  // Avance: último paso completado (0 = ninguno)
  done: number;
  updatedAt: number;
};

export const emptyDraft = (): Draft => ({
  v: 1,
  category: null,
  info: '',
  identityMode: null,
  forWhom: 'yo',
  docType: 'run',
  docNumber: '',
  names: '',
  lastName1: '',
  lastName2: '',
  socialName: '',
  sex: '',
  gender: '',
  birth: { day: '', month: '', year: '' },
  disability: false,
  caregiver: false,
  homeCommune: null,
  street: '',
  number: '',
  extra: '',
  orgCommune: null,
  orgId: null,
  phone1: '',
  phone2: '',
  email: '',
  emailUpdates: true,
  done: 0,
  updatedAt: 0,
});

export type RequestStatus = 'ingresada' | 'en-revision' | 'finalizada';

export type Submitted = {
  code: string;
  createdAt: number;
  status: RequestStatus;
  cancelled: boolean;
  draft: Draft;
  /** Los identificadores del catálogo que se enviarían, igual que hoy. */
  ids: { providerId: number; motiveId: number; detailId: number; orgId: number };
  sample?: boolean;
};

const DRAFT_KEY = 'telesalud-demo-borrador';
const SENT_KEY = 'telesalud-demo-solicitudes';

type Ctx = {
  draft: Draft;
  update: (patch: Partial<Draft>) => void;
  complete: (step: number) => void;
  reset: () => void;
  hasDraft: boolean;
  sent: Submitted[];
  addSent: (s: Submitted) => void;
  cancelSent: (code: string) => void;
};

const RequestContext = createContext<Ctx | null>(null);

function isStarted(d: Draft) {
  return d.done > 0 || !!d.category;
}

export function RequestProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<Draft>(() => {
    const d = load<Draft | null>(DRAFT_KEY, null);
    return d && d.v === 1 ? { ...emptyDraft(), ...d } : emptyDraft();
  });
  const [sent, setSent] = useState<Submitted[]>(() => load<Submitted[]>(SENT_KEY, []));

  useEffect(() => {
    if (isStarted(draft)) save(DRAFT_KEY, draft);
    else remove(DRAFT_KEY);
  }, [draft]);

  useEffect(() => save(SENT_KEY, sent), [sent]);

  const update = useCallback((patch: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...patch, updatedAt: Date.now() }));
  }, []);

  const complete = useCallback((step: number) => {
    setDraft((d) => ({ ...d, done: Math.max(d.done, step), updatedAt: Date.now() }));
  }, []);

  const reset = useCallback(() => setDraft(emptyDraft()), []);

  const addSent = useCallback((s: Submitted) => setSent((all) => [s, ...all.filter((x) => x.code !== s.code)]), []);

  const cancelSent = useCallback(
    (code: string) => setSent((all) => all.map((x) => (x.code === code ? { ...x, cancelled: true } : x))),
    [],
  );

  const value = useMemo(
    () => ({ draft, update, complete, reset, hasDraft: isStarted(draft), sent, addSent, cancelSent }),
    [draft, update, complete, reset, sent, addSent, cancelSent],
  );

  return <RequestContext.Provider value={value}>{children}</RequestContext.Provider>;
}

export function useRequest(): Ctx {
  const c = useContext(RequestContext);
  if (!c) throw new Error('useRequest fuera de RequestProvider');
  return c;
}
