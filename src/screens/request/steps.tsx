import { Icon } from '../../components/Icons';
import { orgById } from '../../data/catalog';
import { categoryLabel, shortOrgName } from '../../data/labels';
import { go } from '../../lib/router';
import type { Draft } from '../../state/request';

export const STEPS = ['Qué solicita', 'Sus datos', 'Dónde se atiende', 'Contacto', 'Revisar y enviar'];

export const stepRoute = (n: number) => `/solicitud/${n}`;

export function Progress({ step }: { step: number }) {
  return (
    <div className="prog">
      <span>
        Paso {step} de {STEPS.length} · <b>{STEPS[step - 1]}</b>
      </span>
      <div className="segs" aria-hidden="true">
        {STEPS.map((_, i) => (
          <i key={i} className={i + 1 < step ? 'on' : i + 1 === step ? 'now' : ''} />
        ))}
      </div>
    </div>
  );
}

function summary(n: number, d: Draft): string | null {
  if (n === 1 && d.category) return categoryLabel(d.category).short;
  if (n === 2 && d.names) return `${d.forWhom === 'otra' ? 'Para otra persona' : 'Para mí'} · ${d.names} ${d.lastName1}`.trim();
  if (n === 3 && d.orgId) return shortOrgName(orgById(d.orgId)?.name ?? '');
  if (n === 4 && d.phone1) return '+56 ' + d.phone1;
  return null;
}

/** Columna de pasos en computador: qué hizo y qué falta, con acceso directo a lo ya completado. */
export function Stepper({ step, draft }: { step: number; draft: Draft }) {
  return (
    <nav className="glass stepper" aria-label="Pasos de la solicitud">
      <h2>Su solicitud</h2>
      <ol>
        {STEPS.map((name, i) => {
          const n = i + 1;
          const done = n < step || (n !== step && draft.done >= n);
          const s = summary(n, draft);
          return (
            <li key={name} className={n === step ? 'now' : done ? 'done' : ''} aria-current={n === step ? 'step' : undefined}>
              <span className="n">{done ? <Icon name="i-ok" /> : n}</span>
              <div>
                <b>{name}</b>
                {s && n !== step && <small>{s}</small>}
                {done && n !== step && (
                  <button type="button" className="textlink" onClick={() => go(stepRoute(n))}>
                    Cambiar<span className="sr-only"> {name}</span>
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
