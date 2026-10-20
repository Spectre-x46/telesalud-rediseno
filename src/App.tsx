import { Component, type ReactNode } from 'react';
import { IconSprite } from './components/Icons';
import { DemoBand, Page } from './components/Layout';
import { go, useRoute } from './lib/router';
import { useRequest } from './state/request';
import { Cancel } from './screens/Cancel';
import { Compare } from './screens/Compare';
import { Help } from './screens/Help';
import { Home } from './screens/Home';
import { Sent } from './screens/Sent';
import { Status } from './screens/Status';
import { Step1All, Step1Detail, Step1Info, Step1NotSure, Step1Others, Step1Topic, Step1Topics } from './screens/request/Step1';
import { Step2ClaveUnica, Step2Entry, Step2Form } from './screens/request/Step2';
import { Step3 } from './screens/request/Step3';
import { Step4 } from './screens/request/Step4';
import { Step5 } from './screens/request/Step5';
import { stepRoute } from './screens/request/steps';

function Request({ parts }: { parts: string[] }) {
  const { draft } = useRequest();
  const step = Number(parts[0] ?? 1);
  // No se puede saltar a un paso sin completar los anteriores.
  if (step > draft.done + 1) {
    queueMicrotask(() => go(stepRoute(draft.done + 1), { replace: true }));
    return null;
  }
  const sub = parts[1];
  switch (step) {
    case 1:
      if (sub === 'tema') return <Step1Topic id={parts[2]} />;
      if (sub === 'otros') return <Step1Others />;
      if (sub === 'todas') return <Step1All />;
      if (sub === 'nose') return <Step1NotSure />;
      if (sub === 'opcion') return <Step1Detail />;
      if (sub === 'detalle') return <Step1Info />;
      return <Step1Topics />;
    case 2:
      if (sub === 'claveunica') return <Step2ClaveUnica />;
      if (sub === 'datos' || (!sub && draft.identityMode)) return <Step2Form />;
      return <Step2Entry />;
    case 3:
      return <Step3 />;
    case 4:
      return <Step4 />;
    case 5:
      return <Step5 />;
    default:
      return <Step1Topics />;
  }
}

function Routes() {
  const [first, ...rest] = useRoute();
  switch (first) {
    case undefined:
      return <Home />;
    case 'solicitud':
      return <Request parts={rest} />;
    case 'enviada':
      return <Sent code={rest[0] ?? ''} />;
    case 'estado':
      return <Status code={rest[0]} />;
    case 'anular':
      return <Cancel code={rest[0]} />;
    case 'ayuda':
      return <Help />;
    case 'comparacion':
      return <Compare />;
    default:
      return (
        <Page title="No encontramos esa página" back="/" backLabel="Inicio" screenKey="404">
          <p className="sub">Puede que el enlace esté incompleto.</p>
          <a className="btn primary" href="#/">
            Ir al inicio
          </a>
        </Page>
      );
  }
}

/** S11: nunca un error técnico en pantalla. Los datos del borrador siguen guardados. */
class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error(error);
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <Page title="Algo no funcionó" screenKey="error">
        <p className="sub">Tuvimos un problema al mostrar esta pantalla. Lo que ya escribió sigue guardado en este dispositivo.</p>
        <button
          type="button"
          className="btn primary"
          onClick={() => {
            this.setState({ failed: false });
            go('/');
          }}
        >
          Volver al inicio
        </button>
      </Page>
    );
  }
}

export function App() {
  return (
    <div className="app">
      <a className="skip" href="#contenido" onClick={(e) => { e.preventDefault(); document.getElementById('contenido')?.focus(); }}>
        Saltar al contenido
      </a>
      <IconSprite />
      <DemoBand />
      <Boundary>
        <Routes />
      </Boundary>
    </div>
  );
}
