import { Icon } from '../components/Icons';
import { Page } from '../components/Layout';
import { go } from '../lib/router';
import { useRequest } from '../state/request';
import { stepRoute } from './request/steps';

export function Home() {
  const { draft, hasDraft, reset } = useRequest();

  return (
    <Page title="Inicio" heading={<>Hola.<br />¿Qué quiere hacer?</>} className="home" screenKey="home">
      <p className="sub">Desde aquí puede enviar una solicitud a su CESFAM. El equipo la revisa y le contacta.</p>

      {hasDraft && (
        <div className="glass card" style={{ gap: 12 }}>
          <p>
            <b>Tiene una solicitud sin terminar.</b>
            <br />
            <span className="small">Quedó guardada en este dispositivo.</span>
          </p>
          <button type="button" className="btn primary" onClick={() => go(stepRoute(Math.min(draft.done + 1, 5)))}>
            Continuar donde quedé
          </button>
          <button
            type="button"
            className="btn quiet"
            onClick={() => {
              reset();
              go('/solicitud/1');
            }}
          >
            Empezar una nueva
          </button>
        </div>
      )}

      {!hasDraft && (
        <a className="btn primary big" href="#/solicitud/1">
          <span className="ic">
            <Icon name="i-send-doc" />
          </span>
          <span>
            Enviar una solicitud
            <small>a mi CESFAM</small>
          </span>
          <Icon name="i-chev" className="i chev" />
        </a>
      )}

      <ul className="glass list">
        <li>
          <a className="row" href="#/estado">
            <span className="ic"><Icon name="i-search" /></span>
            <span className="t">
              Ver cómo va mi solicitud
              <small>Con su código de seguimiento</small>
            </span>
            <Icon name="i-chev" className="chev" />
          </a>
        </li>
        <li>
          <a className="row" href="#/ayuda">
            <span className="ic"><Icon name="i-book" /></span>
            <span className="t">
              Cómo funciona
              <small>Qué pasa después de enviar, y más</small>
            </span>
            <Icon name="i-chev" className="chev" />
          </a>
        </li>
        <li>
          <a className="row" href="#/anular">
            <span className="ic"><Icon name="i-x" /></span>
            <span className="t">Anular una solicitud</span>
            <Icon name="i-chev" className="chev" />
          </a>
        </li>
      </ul>
    </Page>
  );
}
