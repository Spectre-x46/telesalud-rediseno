import { useState } from 'react';
import { Icon } from '../components/Icons';
import { Note, Page } from '../components/Layout';
import { orgById } from '../data/catalog';
import { REVIEW_HOURS } from '../data/content';
import { shortOrgName } from '../data/labels';
import { useFind } from './Lookup';

export function Sent({ code }: { code: string }) {
  const s = useFind()(code);
  const [copied, setCopied] = useState(false);
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  if (!s) {
    return (
      <Page title="No encontramos esa solicitud" back="/" backLabel="Inicio" screenKey="enviada-x">
        <p className="sub">Puede buscarla en "Ver cómo va mi solicitud".</p>
        <a className="btn primary" href="#/estado">Ver cómo va mi solicitud</a>
      </Page>
    );
  }

  const org = orgById(s.ids.orgId);
  const shareText = `Mi código de seguimiento de Telesalud es ${s.code}${org ? ` (${shortOrgName(org.name)})` : ''}.`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(s.code);
      setCopied(true);
    } catch {
      // Sin acceso al portapapeles: se selecciona el código para copiarlo a mano.
      const el = document.getElementById('codigo-valor');
      if (el) window.getSelection()?.selectAllChildren(el);
    }
  };

  return (
    <Page
      title="Solicitud enviada"
      screenKey={`enviada-${s.code}`}
      before={
        <div className="hero">
          <div className="big-check">
            <Icon name="i-check" />
          </div>
        </div>
      }
      heading={<span style={{ display: 'block', textAlign: 'center' }}>Solicitud enviada</span>}
    >
      <p className="sub" style={{ textAlign: 'center' }}>
        Quedó en la lista de revisión de {org ? shortOrgName(org.name) : 'su CESFAM'}.
      </p>

      <div className="glass code">
        <p className="small">Su código de seguimiento</p>
        <p className="v" id="codigo-valor">
          {s.code}
        </p>
        <div className="acts">
          <button type="button" className={`mini${copied ? ' ok' : ''}`} onClick={copy}>
            <Icon name={copied ? 'i-ok' : 'i-copy'} />
            {copied ? 'Copiado' : 'Copiar'}
          </button>
          {canShare && (
            <button
              type="button"
              className="mini"
              onClick={() => navigator.share({ title: 'Código de seguimiento', text: shareText }).catch(() => {})}
            >
              <Icon name="i-share" />
              Compartir
            </button>
          )}
        </div>
        <p className="sr-only" aria-live="polite">
          {copied ? 'Código copiado' : ''}
        </p>
      </div>

      {!s.draft.email && (
        <Note icon="i-alert" tone="warn">
          <b>No registró un correo.</b> Anote o copie este código: lo necesitará para ver el estado de su solicitud.
        </Note>
      )}

      <h2>Qué pasará ahora</h2>
      <ol className="glass steps">
        <li>
          <span className="n">1</span>
          <p>
            El equipo de su CESFAM revisará su solicitud
            <small>{REVIEW_HOURS}</small>
          </p>
        </li>
        <li>
          <span className="n">2</span>
          <p>
            Le contactarán por teléfono o correo
            <small>Conteste aunque no conozca el número</small>
          </p>
        </li>
        <li>
          <span className="n">3</span>
          <p>No vaya al CESFAM por esta solicitud hasta que le contacten</p>
        </li>
      </ol>

      <div className="action">
        <a className="btn primary" href={`#/estado/${s.code}`}>
          Ver el estado
        </a>
        <a className="btn quiet" href="#/">
          Volver al inicio
        </a>
      </div>
    </Page>
  );
}
