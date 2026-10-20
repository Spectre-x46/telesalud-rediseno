// Íconos de línea monocromos (los mismos de los mockups de Celeste guía).
// Se definen una vez como <symbol> y se usan con <Icon name="..." />.

const S = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1273E0" />
          <stop offset="1" stopColor="#5DB8F5" />
        </linearGradient>
      </defs>
      <symbol id="logo" viewBox="0 0 28 28">
        <rect x="1" y="1" width="26" height="26" rx="9" fill="url(#lg)" />
        <path fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" d="M14 8.5v11M8.5 14h11" />
      </symbol>
      <symbol id="i-phone" viewBox="0 0 24 24"><path {...S} strokeWidth="2" d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2" /></symbol>
      <symbol id="i-help" viewBox="0 0 24 24"><g {...S} strokeWidth="1.9"><circle cx="12" cy="12" r="9" /><path d="M9.5 9.2a2.6 2.6 0 015 .9c0 1.8-2.5 2.2-2.5 3.9M12 17.2v.1" /></g></symbol>
      <symbol id="i-send-doc" viewBox="0 0 24 24"><g {...S} strokeWidth="2"><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h6" /><path d="M14 3l5 5h-5z" /><path d="M15 17h6M18 14l3 3-3 3" /></g></symbol>
      <symbol id="i-search" viewBox="0 0 24 24"><g {...S} strokeWidth="2"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /></g></symbol>
      <symbol id="i-x" viewBox="0 0 24 24"><g {...S} strokeWidth="1.9"><circle cx="12" cy="12" r="9" /><path d="M9 9l6 6M15 9l-6 6" /></g></symbol>
      <symbol id="i-book" viewBox="0 0 24 24"><g {...S} strokeWidth="1.9"><path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5z" /><path d="M4 20.5A2.5 2.5 0 006.5 23H20" /></g></symbol>
      <symbol id="i-chev" viewBox="0 0 24 24"><path {...S} strokeWidth="2.2" d="M9 5l7 7-7 7" /></symbol>
      <symbol id="i-back" viewBox="0 0 24 24"><path {...S} strokeWidth="2.2" d="M15 5l-7 7 7 7" /></symbol>
      <symbol id="i-check" viewBox="0 0 24 24"><path {...S} strokeWidth="3" d="M5 12.5l4.5 4.5L19 7.5" /></symbol>
      <symbol id="i-ok" viewBox="0 0 24 24"><path {...S} strokeWidth="2.6" d="M5 12.5l4.5 4.5L19 7.5" /></symbol>
      <symbol id="i-copy" viewBox="0 0 24 24"><g {...S} strokeWidth="1.9"><rect x="8" y="8" width="12" height="12" rx="2.5" /><path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" /></g></symbol>
      <symbol id="i-share" viewBox="0 0 24 24"><g {...S} strokeWidth="1.9"><circle cx="18" cy="5.5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="18.5" r="2.5" /><path d="M8.2 10.8l7.6-4M8.2 13.2l7.6 4" /></g></symbol>
      <symbol id="i-steth" viewBox="0 0 24 24"><g {...S} strokeWidth="1.9"><path d="M6 3v5a4 4 0 008 0V3" /><path d="M10 12v3a5 5 0 0010 0v-1" /><circle cx="20" cy="11.5" r="2" /></g></symbol>
      <symbol id="i-pill" viewBox="0 0 24 24"><g {...S} strokeWidth="1.9"><rect x="3" y="8.5" width="18" height="7" rx="3.5" transform="rotate(-45 12 12)" /><path d="M9.2 9.2l5.6 5.6" /></g></symbol>
      <symbol id="i-flask" viewBox="0 0 24 24"><g {...S} strokeWidth="1.9"><path d="M9 3h6M10 3v6L4.8 18a2 2 0 001.7 3h11a2 2 0 001.7-3L14 9V3" /><path d="M7.5 14h9" /></g></symbol>
      <symbol id="i-heart" viewBox="0 0 24 24"><path {...S} strokeWidth="1.9" d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0112 7.3 4.3 4.3 0 0119.5 10c0 5.6-7.5 10-7.5 10z" /><path {...S} strokeWidth="1.9" d="M7 12h2.5l1.3-2 2 4 1.2-2H17" /></symbol>
      <symbol id="i-tooth" viewBox="0 0 24 24"><path {...S} strokeWidth="1.9" d="M8 3.5c-2.5 0-4 1.8-4 4.3 0 1.9.8 3 1.4 4.7.6 1.8.9 8 2.9 8 1.6 0 1.4-5 3.7-5s2.1 5 3.7 5c2 0 2.3-6.2 2.9-8 .6-1.7 1.4-2.8 1.4-4.7 0-2.5-1.5-4.3-4-4.3-1.7 0-2.6.9-4 .9s-2.3-.9-4-.9z" /></symbol>
      <symbol id="i-grid" viewBox="0 0 24 24"><g {...S} strokeWidth="1.9"><rect x="4" y="4" width="6.5" height="6.5" rx="2" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="2" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="2" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2" /></g></symbol>
      <symbol id="i-id" viewBox="0 0 24 24"><g {...S} strokeWidth="1.9"><rect x="3" y="5" width="18" height="14" rx="3" /><circle cx="9" cy="11" r="2.2" /><path d="M5.8 16c.6-1.5 1.8-2.3 3.2-2.3s2.6.8 3.2 2.3M15 10h3M15 13.5h3" /></g></symbol>
      <symbol id="i-pen" viewBox="0 0 24 24"><path {...S} strokeWidth="1.9" d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4" /></symbol>
      <symbol id="i-info" viewBox="0 0 24 24"><g {...S} strokeWidth="1.9"><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5v.1" /></g></symbol>
      <symbol id="i-alert" viewBox="0 0 24 24"><g {...S} strokeWidth="2.2"><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.5v.1" /></g></symbol>
      <symbol id="i-clock" viewBox="0 0 24 24"><g {...S} strokeWidth="1.9"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></g></symbol>
      <symbol id="i-plus" viewBox="0 0 24 24"><path {...S} strokeWidth="2.2" d="M12 5v14M5 12h14" /></symbol>
      <symbol id="i-pin" viewBox="0 0 24 24"><g {...S} strokeWidth="1.9"><path d="M12 21s-7-6.1-7-11.5A7 7 0 0112 2.5a7 7 0 017 7C19 14.9 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></g></symbol>
      <symbol id="i-preg" viewBox="0 0 24 24"><g {...S} strokeWidth="1.9"><circle cx="12" cy="4.5" r="2" /><path d="M10 21v-5l-1.5-1V10a3 3 0 013-3h1a3 3 0 013 3v1.5a3.5 3.5 0 01-1.5 6.5V21" /></g></symbol>
      <symbol id="i-kid" viewBox="0 0 24 24"><g {...S} strokeWidth="1.9"><circle cx="12" cy="5" r="2.3" /><path d="M7 10l5-1.5 5 1.5M12 8.5V15M9 21l3-6 3 6" /></g></symbol>
      <symbol id="i-mind" viewBox="0 0 24 24"><g {...S} strokeWidth="1.9"><path d="M9 21v-3.5A7 7 0 1119 11.5l1.5 3-2 .5V18a2 2 0 01-2 2H15v1" /><path d="M10.5 9.5a2 2 0 013.5 1.3c0 1.2-1.5 1.5-1.5 2.7" /></g></symbol>
      <symbol id="i-walk" viewBox="0 0 24 24"><g {...S} strokeWidth="1.9"><circle cx="13" cy="4.5" r="2" /><path d="M9 21l2.5-6 2.5 2v4M11.5 15l1-6 3 3h3M12.5 9l-3.5 1.5L8 14" /></g></symbol>
      <symbol id="i-apple" viewBox="0 0 24 24"><g {...S} strokeWidth="1.9"><path d="M12 7.5c-1.5-1.3-6-1.8-6.5 3-.4 4 2.3 9.5 4.5 9.5 1 0 1.3-.6 2-.6s1 .6 2 .6c2.2 0 4.9-5.5 4.5-9.5-.5-4.8-5-4.3-6.5-3z" /><path d="M12 7.5c0-2 1-3.5 3-4" /></g></symbol>
      <symbol id="i-doc" viewBox="0 0 24 24"><g {...S} strokeWidth="1.9"><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z" /><path d="M14 3v6h6M8 13h8M8 17h5" /></g></symbol>
      <symbol id="i-band" viewBox="0 0 24 24"><g {...S} strokeWidth="1.9"><rect x="2.5" y="8.5" width="19" height="7" rx="3.5" transform="rotate(-45 12 12)" /><path d="M10 10h.01M14 14h.01M12 12h.01" /></g></symbol>
      <symbol id="i-user" viewBox="0 0 24 24"><g {...S} strokeWidth="1.9"><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0115 0" /></g></symbol>
      <symbol id="i-users" viewBox="0 0 24 24"><g {...S} strokeWidth="1.9"><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0113 0M16 4.5a3.5 3.5 0 010 7M18 14a6.5 6.5 0 013.5 6" /></g></symbol>
      <symbol id="i-trash" viewBox="0 0 24 24"><g {...S} strokeWidth="1.9"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></g></symbol>
    </svg>
  );
}

export function Icon({ name, className = 'i' }: { name: string; className?: string }) {
  return (
    <svg className={className} aria-hidden="true" focusable="false">
      <use href={`#${name}`} />
    </svg>
  );
}
