import { describe, expect, it } from 'vitest';
import { cleanRun, formatRun, isValidRun, runCheckDigit } from './run';
import { cleanCode, fold, newTrackingCode } from './text';
import { ageFrom, cleanPhone, dateError, emailError, formatPhone, phoneError, phoneKind } from './validate';

describe('RUN', () => {
  it('calcula el dígito verificador', () => {
    expect(runCheckDigit('12345678')).toBe('5');
    expect(runCheckDigit('8765432')).toBe('K');
    expect(runCheckDigit('17654321')).toBe('3');
  });
  it('formatea mientras se escribe', () => {
    expect(formatRun('123456785')).toBe('12.345.678-5');
    expect(formatRun('12.345.678-5')).toBe('12.345.678-5');
    expect(formatRun('1')).toBe('1');
    expect(formatRun('12')).toBe('1-2');
    expect(formatRun('8765432k')).toBe('8.765.432-K');
  });
  it('valida', () => {
    expect(isValidRun('12.345.678-5')).toBe(true);
    expect(isValidRun('12.345.678-4')).toBe(false);
    expect(isValidRun('1-9')).toBe(false);
    expect(cleanRun('12.345.678-k')).toBe('12345678K');
  });
});

describe('fecha de nacimiento', () => {
  const today = new Date(2026, 8, 30);
  it('explica qué falta o qué está mal', () => {
    expect(dateError({ day: '', month: '', year: '' }, today)).toMatch(/Escriba/);
    expect(dateError({ day: '3', month: '15', year: '1954' }, today)).toBe('El mes debe ser un número del 1 al 12.');
    expect(dateError({ day: '31', month: '2', year: '1990' }, today)).toMatch(/del 1 al 28/);
    expect(dateError({ day: '29', month: '2', year: '2024' }, today)).toBeNull();
    expect(dateError({ day: '1', month: '1', year: '54' }, today)).toMatch(/4 números/);
    expect(dateError({ day: '1', month: '10', year: '2026' }, today)).toMatch(/posterior/);
  });
  it('calcula la edad', () => {
    expect(ageFrom({ day: '3', month: '5', year: '1954' }, today)).toBe(72);
    expect(ageFrom({ day: '1', month: '10', year: '2000' }, today)).toBe(25);
  });
});

describe('teléfono', () => {
  it('limpia y formatea', () => {
    expect(cleanPhone('+56 9 1234 5678')).toBe('912345678');
    expect(formatPhone('912345678')).toBe('9 1234 5678');
    expect(formatPhone('222345678')).toBe('2 2234 5678');
  });
  it('detecta celular o fijo', () => {
    expect(phoneKind('912345678')).toBe('celular');
    expect(phoneKind('222345678')).toBe('fijo');
    expect(phoneKind('9123')).toBeNull();
  });
  it('valida', () => {
    expect(phoneError('', true)).toMatch(/Escriba/);
    expect(phoneError('', false)).toBeNull();
    expect(phoneError('91234', true)).toMatch(/9 dígitos/);
    expect(phoneError('012345678', true)).toMatch(/no parece/);
  });
});

describe('correo', () => {
  it('es opcional y se valida si se escribe', () => {
    expect(emailError('')).toBeNull();
    expect(emailError('maria@correo.cl')).toBeNull();
    expect(emailError('maria@correo')).toMatch(/Revise/);
  });
});

describe('texto y código', () => {
  it('busca sin tildes ni mayúsculas', () => {
    expect(fold('Ñuñoa  Médica ')).toBe('nunoa  medica');
  });
  it('genera códigos de 10 caracteres', () => {
    const c = newTrackingCode();
    expect(c).toMatch(/^[0-9A-F]{10}$/);
    expect(cleanCode(' 7c21-f0b9 4d ')).toBe('7C21F0B94D');
  });
});
