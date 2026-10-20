// Validaciones de los campos. Los mensajes dicen qué hacer, no solo que hay un error.

export type DateParts = { day: string; month: string; year: string };

export function dateError(d: DateParts, today = new Date()): string | null {
  if (!d.day && !d.month && !d.year) return 'Escriba la fecha de nacimiento.';
  if (!d.day) return 'Falta el día.';
  if (!d.month) return 'Falta el mes.';
  if (!d.year) return 'Falta el año.';
  const day = Number(d.day);
  const month = Number(d.month);
  const year = Number(d.year);
  if (!Number.isInteger(month) || month < 1 || month > 12) return 'El mes debe ser un número del 1 al 12.';
  if (d.year.length !== 4) return 'Escriba el año con 4 números. Por ejemplo: 1954.';
  const maxDay = new Date(year, month, 0).getDate();
  if (!Number.isInteger(day) || day < 1 || day > maxDay) return `Ese mes tiene días del 1 al ${maxDay}.`;
  const date = new Date(year, month - 1, day);
  if (date > today) return 'La fecha no puede ser posterior a hoy.';
  if (year < today.getFullYear() - 120) return 'Revise el año: parece demasiado antiguo.';
  return null;
}

export function toIsoDate(d: DateParts): string {
  return `${d.year}-${d.month.padStart(2, '0')}-${d.day.padStart(2, '0')}`;
}

export function ageFrom(d: DateParts, today = new Date()): number | null {
  if (dateError(d, today)) return null;
  const birth = new Date(Number(d.year), Number(d.month) - 1, Number(d.day));
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

/** Teléfono chileno sin el +56: 9 dígitos. Celular si empieza con 9. */
export function cleanPhone(value: string): string {
  let v = value.replace(/\D/g, '');
  if (v.startsWith('56') && v.length > 9) v = v.slice(2);
  return v.slice(0, 9);
}

export function formatPhone(value: string): string {
  const v = cleanPhone(value);
  if (v.startsWith('9')) return [v.slice(0, 1), v.slice(1, 5), v.slice(5)].filter(Boolean).join(' ');
  if (v.startsWith('2')) return [v.slice(0, 1), v.slice(1, 5), v.slice(5)].filter(Boolean).join(' ');
  return [v.slice(0, 2), v.slice(2, 5), v.slice(5)].filter(Boolean).join(' ');
}

export type PhoneKind = 'celular' | 'fijo';

export function phoneKind(value: string): PhoneKind | null {
  const v = cleanPhone(value);
  if (v.length !== 9) return null;
  return v.startsWith('9') ? 'celular' : 'fijo';
}

export function phoneError(value: string, required: boolean): string | null {
  const v = cleanPhone(value);
  if (!v) return required ? 'Escriba un teléfono para que su CESFAM pueda contactarle.' : null;
  if (v.length !== 9) return 'El número debe tener 9 dígitos. Por ejemplo: 9 1234 5678.';
  if (v.startsWith('0') || v.startsWith('1')) return 'Revise el número: no parece un teléfono de Chile.';
  return null;
}

export function emailError(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Revise el correo. Debe verse así: nombre@correo.cl';
  return null;
}

export function requiredError(value: string, message: string): string | null {
  return value.trim() ? null : message;
}
