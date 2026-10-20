import { useState } from 'react';
import { Icon } from '../components/Icons';
import { Note, Page } from '../components/Layout';
import { orgById } from '../data/catalog';
import { categoryLabel, shortOrgName } from '../data/labels';
import { go } from '../lib/router';
import { useRequest, type Submitted } from '../state/request';
import { LookupForm, useFind } from './Lookup';

export function Cancel({ code }: { code?: string }) {
  const find = useFind();
  const [picked, setPicked] = useState<Submitted | undefined>(undefined);
  // Desde "Ver el estado" ya se validó el apellido; aquí se confirma igual.
  const fromStatus = code ? find(code) : undefined;
  const s = picked ?? fromStatus;

  if (!s) {
    return (
      <Page title="Anular una solicitud" back="/" backLabel="Inicio" screenKey="anular">
        <p className="sub">Si ya no necesita lo que pidió, puede anular la solicitud. Escriba sus datos para encontrarla.</p>
        <LookupForm submitLabel="Buscar mi solicitud" onFound={setPicked} />
      </Page>
    );
  }
  return <Confirm s={s} />;
}

function Confirm({ s }: { s: Submitted }) {
  const { sent, cancelSent, addSent } = useRequest();
  const [done, setDone] = useState(false);
  const org = orgById(s.ids.orgId);
  const cat = s.draft.category ? categoryLabel(s.draft.category) : null;

  if (done || s.cancelled) {
    return (
      <Page title="Solicitud anulada" screenKey={`anulada-${s.code}`}>
        <Note icon="i-ok">
          <b>La solicitud {s.code} quedó anulada.</b> Su CESFAM ya no la revisará.
        </Note>
        <div className="action">
          <a className="btn primary" href="#/">
            Volver al inicio
          </a>
        </div>
      </Page>
    );
  }

  if (s.status === 'finalizada') {
    return (
      <Page title="Esta solicitud ya terminó" back="/anular" screenKey={`anular-fin-${s.code}`}>
        <Note>
          La solicitud <b>{s.code}</b> está <b>Finalizada</b>: el equipo ya terminó de gestionarla, por eso no se puede anular.
        </Note>
        <div className="action">
          <a className="btn ghost" href="#/">
            Volver al inicio
          </a>
        </div>
      </Page>
    );
  }

  return (
    <Page title="¿Anular esta solicitud?" back="/" backLabel="Inicio" screenKey={`anular-${s.code}`}>
      <div className="glass sum">
        <div className="it">
          <div>
            <h2>Código</h2>
            <p style={{ fontFamily: 'ui-monospace, Menlo, monospace' }}>{s.code}</p>
          </div>
        </div>
        {cat && (
          <div className="it">
            <div>
              <h2>Qué solicitó</h2>
              <p>
                {cat.short}
                <em>{cat.official}</em>
              </p>
            </div>
          </div>
        )}
        <div className="it">
          <div>
            <h2>Persona</h2>
            <p>
              {s.draft.names} {s.draft.lastName1} {s.draft.lastName2}
              {org && <em>{shortOrgName(org.name)}</em>}
            </p>
          </div>
        </div>
      </div>
      <Note icon="i-alert" tone="warn">
        Si la anula, su CESFAM no la revisará. Esto no se puede deshacer.
      </Note>
      <div className="action">
        <button
          type="button"
          className="btn danger"
          onClick={() => {
            // Las solicitudes de ejemplo no están guardadas: se guarda una copia anulada.
            if (sent.some((x) => x.code === s.code)) cancelSent(s.code);
            else addSent({ ...s, cancelled: true });
            setDone(true);
          }}
        >
          <Icon name="i-x" />
          Sí, anular mi solicitud
        </button>
        <button type="button" className="btn ghost" onClick={() => go(`/estado/${s.code}`)}>
          No, mantenerla
        </button>
      </div>
    </Page>
  );
}
