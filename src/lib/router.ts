import { useEffect, useState } from 'react';

// Rutas con # para que la demo funcione en cualquier hosting estático
// y el botón "atrás" del navegador retroceda paso a paso.

function current(): string {
  const h = window.location.hash.replace(/^#/, '');
  return h.startsWith('/') ? h : '/';
}

export function useRoute(): string[] {
  const [path, setPath] = useState(current);
  useEffect(() => {
    const on = () => setPath(current());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return path.split('/').filter(Boolean).map(decodeURIComponent);
}

export function go(path: string, opts: { replace?: boolean } = {}): void {
  const target = '#' + path;
  if (opts.replace) {
    window.history.replaceState(null, '', target);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else if (window.location.hash !== target) {
    window.location.hash = path;
  }
}
