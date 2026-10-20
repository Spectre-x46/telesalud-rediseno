import { useEffect, useRef, type ReactNode } from 'react';
import { go } from '../lib/router';
import { Icon } from './Icons';

export function DemoBand() {
  return (
    <aside className="demo-band" aria-label="Aviso de prototipo">
      PROTOTIPO NO OFICIAL · DATOS FICTICIOS · NO ENVÍA NADA A TELESALUD · <a href="#/comparacion">VER ANTES Y DESPUÉS</a>
    </aside>
  );
}

export function Urgency() {
  return (
    <footer className="urg">
      <Icon name="i-phone" />
      <span>¿Es una emergencia? Llame al</span>
      <a href="tel:131" aria-label="Llamar al 131, SAMU">131</a>
      <span className="sep desk-only" aria-hidden="true">·</span>
      <span className="desk-only">
        Salud Responde <a href="tel:6003607777">600 360 7777</a>
      </span>
    </footer>
  );
}

type HeaderProps = { back?: string; backLabel?: string };

export function Header({ back, backLabel = 'Volver' }: HeaderProps) {
  return (
    <header className="top">
      <div className="top-inner">
        {back ? (
          <button type="button" className="toplink" onClick={() => go(back)}>
            <Icon name="i-back" />
            {backLabel}
          </button>
        ) : (
          <a className="brand" href="#/">
            <svg aria-hidden="true"><use href="#logo" /></svg>
            Telesalud <span className="brand-tag">propuesta</span>
          </a>
        )}
        <a className="toplink" href="#/ayuda">
          <Icon name="i-help" />
          Ayuda
        </a>
      </div>
    </header>
  );
}

type PageProps = {
  title: string; // título de la pestaña y del h1
  heading?: ReactNode; // h1 visible si difiere del título
  back?: string;
  backLabel?: string;
  className?: string;
  children: ReactNode;
  before?: ReactNode; // contenido antes del h1 (p. ej. barra de avance)
  aside?: ReactNode; // columna de pasos en computador
  screenKey: string; // cambia cuando cambia la pantalla
};

export function Page({ title, heading, back, backLabel, className, children, before, aside, screenKey }: PageProps) {
  const h1 = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    document.title = `${title} · Propuesta de rediseño de Telesalud`;
    window.scrollTo(0, 0);
    // Mover el foco al título en cada pantalla nueva (no en la carga inicial).
    if (document.body.dataset.loaded) h1.current?.focus({ preventScroll: true });
    document.body.dataset.loaded = '1';
  }, [screenKey, title]);

  const content = (
    <>
      {before}
      <h1 ref={h1} tabIndex={-1}>
        {heading ?? title}
      </h1>
      {children}
    </>
  );

  return (
    <>
      <Header back={back} backLabel={backLabel} />
      <main id="contenido" className={className}>
        {aside ? (
          <>
            {aside}
            <div className="wizard">{content}</div>
          </>
        ) : (
          content
        )}
      </main>
      <Urgency />
    </>
  );
}

export function Note({ icon = 'i-info', tone, children }: { icon?: string; tone?: 'warn' | 'err'; children: ReactNode }) {
  return (
    <div className={`glass note${tone ? ' ' + tone : ''}`}>
      <Icon name={icon} />
      <div>{children}</div>
    </div>
  );
}
