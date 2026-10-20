import type { RequestStatus } from '../state/request';

// Textos que se repiten. Solo dicen lo que publica Telesalud o lo que es general y verdadero:
// sin plazos, sin números desde los que llaman y sin cantidad de intentos.

export const STATUS: { id: RequestStatus; name: string; text: string }[] = [
  { id: 'ingresada', name: 'Ingresada', text: 'Su solicitud llegó a su CESFAM y espera que el equipo la revise.' },
  { id: 'en-revision', name: 'En revisión', text: 'El equipo está revisando su solicitud. Esté atento/a a su teléfono.' },
  {
    id: 'finalizada',
    name: 'Finalizada',
    text: 'El equipo terminó de gestionar su solicitud. Lo que se decidió se lo informan por teléfono o correo.',
  },
];

export const REVIEW_HOURS = 'De lunes a viernes, de 8:00 a 17:00. El tiempo depende de cada caso.';
