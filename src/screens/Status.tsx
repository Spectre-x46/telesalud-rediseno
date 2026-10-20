import { Icon } from '../components/Icons';
import { Note, Page } from '../components/Layout';
import { orgById } from '../data/catalog';
import { STATUS } from '../data/content';
import { categoryLabel, shortOrgName } from '../data/labels';
import { go } from '../lib/router';
import type { Submitted } from '../state/request';
import { LookupForm, useFind } from './Lookup';

export function Status({ code }: { code?: string }) {
  const find = useFind();
  const found = code ? find(code) : undefined;

  if (!found) {
    return (
      <Page title="Ver cómo va mi solicitud" back="/" backLabel="Inicio" screenKey="estado">
        <p className="sub">Escriba los mismos datos que usó al enviarla.</p>
        <LookupForm submitLabel="Ver el estado" onFound={(s) => go(`/estado/${s.code}`)} initialCode={code} />
      </Page>
    );
  }
  return <StatusResult s={found} />;
}

function StatusResult({ s }: { s: Submitted }) {
  const idx = STATUS.findIndex((x) => x.id === s.status);
  const org = orgById(s.ids.orgId);
  const cat = s.draft.category ? categoryLabel(s.draft.category) : null;

  return (
    <Page title="Estado de su solicitud" back="/estado" backLabel="Buscar otra" screenKey={`estado-${s.code}`}>
      <p className="sub">
        Hola, {s.draft.names.split(' ')[0]}. Código <b style={{ fontFamily: 'ui-monospace, Menlo, monospace', color: 'var(--ink)' }}>{s.code}</b>
      </p>

      {s.cancelled ? (
        <Note icon="i-x" tone="warn">
          <b>Usted anuló esta solicitud.</b> Su CESFAM ya no la revisará. Si todavía lo necesita, puede enviar una nueva.
        </Note>
      ) : (
        <ol className="glass timeline" aria-label="Estados de la solicitud">
          {STATUS.map((st, i) => {
            const cls = i < idx ? 'done' : i === idx ? (st.id === 'finalizada' ? 'done' : 'now') : 'todo';
            return (
              <li key={st.id} className={cls} aria-current={i === idx ? 'step' : undefined}>
                <span className="dot">{cls === 'done' && <Icon name="i-ok" />}</span>
                <div>
                  <b>
                    {st.name}
                    {i === idx && <span className="here">Ahora</span>}
                  </b>
                  <small>{st.text}</small>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <div className="glass sum">
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
        {org && (
          <div className="it">
            <div>
              <h2>Dónde</h2>
              <p>
                {shortOrgName(org.name)}
                {org.address && <em>{org.address}</em>}
              </p>
            </div>
          </div>
        )}
        <div className="it">
          <div>
            <h2>Enviada el</h2>
            <p>{new Date(s.createdAt).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {!s.cancelled && s.status !== 'finalizada' && (
        <Note icon="i-phone">
          <b>Esté atento/a a su teléfono.</b> El equipo puede llamarle desde un número que no conoce.
        </Note>
      )}

      {!s.cancelled && s.status !== 'finalizada' && (
        <div className="action">
          <a className="btn ghost" href={`#/anular/${s.code}`}>
            Anular esta solicitud
          </a>
        </div>
      )}
    </Page>
  );
}
