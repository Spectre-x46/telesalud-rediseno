/** Minúsculas y sin tildes, para buscar sin que importe cómo se escribe. */
export function fold(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/** Código de seguimiento de 10 caracteres, del mismo largo que el actual. */
export function newTrackingCode(): string {
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

export function cleanCode(value: string): string {
  return value.replace(/[^0-9a-zA-Z]/g, '').toUpperCase().slice(0, 10);
}
