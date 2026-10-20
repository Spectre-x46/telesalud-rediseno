// RUN chileno: cuerpo numérico + dígito verificador (0-9 o K), módulo 11.

/** Deja solo dígitos y K, en mayúscula. */
export function cleanRun(value: string): string {
  return value.replace(/[^0-9kK]/g, '').toUpperCase();
}

/** Formatea mientras se escribe: 12345678-5 → 12.345.678-5. */
export function formatRun(value: string): string {
  const clean = cleanRun(value).slice(0, 9);
  if (clean.length < 2) return clean;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  return body.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv;
}

export function runCheckDigit(body: string): string {
  let sum = 0;
  let factor = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const rest = 11 - (sum % 11);
  if (rest === 11) return '0';
  if (rest === 10) return 'K';
  return String(rest);
}

export function isValidRun(value: string): boolean {
  const clean = cleanRun(value);
  if (clean.length < 8 || clean.length > 9) return false;
  const body = clean.slice(0, -1);
  if (!/^\d+$/.test(body)) return false;
  return runCheckDigit(body) === clean.slice(-1);
}
