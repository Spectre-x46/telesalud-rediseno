import { useState } from 'react';
import { Icon } from '../../components/Icons';
import { Note } from '../../components/Layout';
import { identifierTypes, orgById, resolveCategory, sexes } from '../../data/catalog';
import { categoryLabel, regionName, sentence, shortOrgName } from '../../data/labels';
import { go } from '../../lib/router';
import { newTrackingCode } from '../../lib/text';
import { formatPhone } from '../../lib/validate';
import { useRequest } from '../../state/request';
import { WizardPage } from './WizardPage';

function Item({ title, step, children }: { title: string; step: string; children: React.ReactNode }) {
  return (
    <div className="it">
      <div>
        <h2>{title}</h2>
        <p>{children}</p>
      </div>
      <button type="button" className="textlink" onClick={() => go(step)}>
        Cambiar<span className="sr-only"> {title.toLowerCase()}</span>
      </button>
    </div>
  );
}

export function Step5() {
  const { draft, addSent, reset } = useRequest();
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);

  const org = orgById(draft.orgId);
  const cat = draft.category ? categoryLabel(draft.category) : null;
  const ids = draft.category && draft.orgId ? resolveCategory(draft.category, draft.orgId) : undefined;
  const doc = identifierTypes.find((t) => t.code === draft.docType);
  const sex = sexes.find((s) => s.code === draft.sex);

  const send = () => {
    if (sending || !ids || !draft.orgId) return;
    setSending(true);
    setFailed(false);
    // La demo no envía nada: simula la espera y guarda la solicitud en este dispositivo.
    window.setTimeout(() => {
      if (!navigator.onLine) {
        setSending(false);
        setFailed(true);
        requestAnimationFrame(() => document.getElementById('error-envio')?.focus());
        return;
      }
      const code = newTrackingCode();
      addSent({ code, createdAt: Date.now(), status: 'ingresada', cancelled: false, draft, ids: { ...ids, orgId: draft.orgId! } });
      reset();
      go(`/enviada/${code}`, { replace: true });
    }, 1200);
  };

  return (
    <WizardPage step={5} title="Revise su solicitud" back="/solicitud/4" screenKey="s5">
      <p className="sub">Si algo no está bien, toque "Cambiar".</p>

      {failed && (
        <div className="glass note err" id="error-envio" tabIndex={-1} role="alert">
          <Icon name="i-alert" />
          <div>
            <b>No pudimos enviar su solicitud.</b> Revise su conexión a internet e intente de nuevo. Sus datos siguen aquí.
          </div>
        </div>
      )}

      <div className="glass sum">
        {cat && draft.category && (
          <Item title="Qué solicita" step="/solicitud/1">
            {cat.short}
            <em>{cat.official}</em>
            <em style={{ marginTop: 6, color: 'var(--ink)' }}>«{draft.info}»</em>
          </Item>
        )}
        <Item title={draft.forWhom === 'otra' ? 'Persona que se atenderá' : 'Sus datos'} step="/solicitud/2/datos">
          {draft.names} {draft.lastName1} {draft.lastName2}
          <em>
            {doc?.code === 'run' ? 'RUN' : sentence(doc?.display ?? '')} {draft.docNumber}
          </em>
          <em>
            Nació el {draft.birth.day}/{draft.birth.month}/{draft.birth.year} · {sex ? sentence(sex.display) : ''}
          </em>
          {draft.forWhom === 'otra' && <em>Solicitud hecha por otra persona</em>}
        </Item>
        <Item title="Dónde se atiende" step="/solicitud/3">
          {org ? shortOrgName(org.name) : '—'}
          {org?.address && <em>{org.address}</em>}
          <em>
            Vive en {draft.street} {draft.number}
            {draft.extra ? `, ${draft.extra}` : ''}, {draft.homeCommune?.name}
            {draft.homeCommune ? ` (${regionName(draft.homeCommune.regionName)})` : ''}
          </em>
        </Item>
        <Item title="Contacto" step="/solicitud/4">
          +56 {formatPhone(draft.phone1)}
          {draft.phone2 && <em>+56 {formatPhone(draft.phone2)}</em>}
          <em>{draft.email || 'Sin correo'}</em>
        </Item>
      </div>

      {!ids && draft.category && org && (
        <Note icon="i-alert" tone="warn">
          {shortOrgName(org.name)} no recibe esta categoría por Telesalud.{' '}
          <button type="button" className="textlink" onClick={() => go('/solicitud/1')}>
            Cambiar lo que solicita
          </button>
        </Note>
      )}

      <Note icon="i-clock">
        Su CESFAM revisará la solicitud y le contactará. <b>No es una atención inmediata.</b>
      </Note>

      <div className="action sticky desk-row">
        <button type="button" className="btn primary" onClick={send} disabled={sending || !ids} aria-disabled={sending || !ids}>
          {sending ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Enviando…
            </>
          ) : (
            'Enviar solicitud'
          )}
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {sending ? 'Enviando su solicitud' : ''}
      </p>
    </WizardPage>
  );
}
