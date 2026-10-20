import { useState, type FormEvent } from 'react';
import { ErrorSummary, TextField, type FieldError } from '../components/Fields';
import { SAMPLE_LASTNAME, SAMPLES } from '../data/demo';
import { cleanCode, fold } from '../lib/text';
import { useRequest, type Submitted } from '../state/request';

/** Busca una solicitud con los mismos datos que pide hoy Telesalud: código y apellido paterno. */
export function useFind() {
  const { sent } = useRequest();
  return (code: string, lastName?: string): Submitted | undefined => {
    const c = cleanCode(code);
    const all = [...sent, ...SAMPLES];
    const hit = all.find((s) => s.code === c);
    if (!hit) return undefined;
    if (lastName !== undefined && fold(hit.draft.lastName1) !== fold(lastName)) return undefined;
    return hit;
  };
}

type Props = { submitLabel: string; onFound: (s: Submitted) => void; initialCode?: string };

export function LookupForm({ submitLabel, onFound, initialCode = '' }: Props) {
  const find = useFind();
  const [code, setCode] = useState(initialCode);
  const [lastName, setLastName] = useState('');
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [notFound, setNotFound] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs: FieldError[] = [];
    const c = cleanCode(code);
    if (!c) errs.push({ id: 'codigo', text: 'Escriba su código de seguimiento.' });
    else if (c.length !== 10) errs.push({ id: 'codigo', text: `El código tiene 10 letras y números. Usted escribió ${c.length}.` });
    if (!lastName.trim()) errs.push({ id: 'apellido', text: 'Escriba el apellido paterno de la persona que se atenderá.' });
    setErrors(errs);
    setNotFound(false);
    if (errs.length) {
      requestAnimationFrame(() => document.getElementById('resumen-errores')?.focus());
      return;
    }
    const hit = find(c, lastName);
    if (hit) onFound(hit);
    else {
      setNotFound(true);
      requestAnimationFrame(() => document.getElementById('no-encontrada')?.focus());
    }
  };

  const errFor = (id: string) => errors.find((e) => e.id === id)?.text;

  return (
    <form onSubmit={submit} noValidate className="choices" style={{ gap: 16 }}>
      <ErrorSummary errors={errors} />
      {notFound && (
        <div className="errsum" id="no-encontrada" tabIndex={-1} role="alert">
          <h2>No encontramos esa solicitud</h2>
          <ul>
            <li>El código tiene 10 letras y números. Está en la pantalla de confirmación o en su correo.</li>
            <li>El apellido es el <b>paterno</b> de la persona que se atenderá, no el de quien hizo la solicitud.</li>
          </ul>
        </div>
      )}
      <div className="glass card">
        <TextField
          id="codigo"
          label="Código de seguimiento"
          value={code}
          onChange={(v) => setCode(cleanCode(v))}
          error={errFor('codigo')}
          help="Son 10 letras y números. Por ejemplo: 7C21F0B94D"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={10}
          style={{ fontFamily: 'ui-monospace, Menlo, Consolas, monospace', letterSpacing: '0.08em' }}
        />
        <TextField
          id="apellido"
          label="Apellido paterno de la persona que se atenderá"
          value={lastName}
          onChange={setLastName}
          error={errFor('apellido')}
          autoComplete="family-name"
          maxLength={30}
        />
      </div>
      <div className="action">
        <button type="submit" className="btn primary">
          {submitLabel}
        </button>
      </div>
      <div className="demo-note">
        <b>Para probar la demo:</b> use uno de estos códigos con el apellido <b>{SAMPLE_LASTNAME}</b>, o el de una solicitud
        que haya enviado en esta demo.
        <div className="codes">
          {SAMPLES.map((s) => (
            <button
              key={s.code}
              type="button"
              className="textlink"
              onClick={() => {
                setCode(s.code);
                setLastName(SAMPLE_LASTNAME);
              }}
            >
              {s.code}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
