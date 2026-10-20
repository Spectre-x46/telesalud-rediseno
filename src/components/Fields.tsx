import { useId, useRef, type InputHTMLAttributes, type ReactNode } from 'react';
import type { DateParts } from '../lib/validate';
import { Icon } from './Icons';

export function ErrorText({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p className="msg" id={id}>
      <Icon name="i-alert" />
      <span>{children}</span>
    </p>
  );
}

type TextFieldProps = {
  id: string;
  label: ReactNode;
  optional?: boolean;
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
  help?: ReactNode;
  valid?: boolean;
  okText?: ReactNode;
  prefix?: string;
  leadIcon?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'id' | 'prefix'>;

export function TextField({ id, label, optional, value, onChange, error, help, valid, okText, prefix, leadIcon, ...rest }: TextFieldProps) {
  const errId = `${id}-err`;
  const helpId = `${id}-help`;
  const okId = `${id}-ok`;
  const describedBy = [error ? errId : null, help ? helpId : null, !error && okText ? okId : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className="f">
      <label htmlFor={id}>
        {label} {optional && <span className="opt">(opcional)</span>}
      </label>
      <div className="in-wrap">
        {prefix && <span className="pre" aria-hidden="true">{prefix}</span>}
        {leadIcon && <Icon name={leadIcon} className="lead" />}
        <input
          id={id}
          className="in"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          aria-required={optional ? undefined : true}
          {...rest}
        />
        {valid && !error && <Icon name="i-ok" className="mark" />}
      </div>
      {error && <ErrorText id={errId}>{error}</ErrorText>}
      {!error && okText && (
        <p className="msg ok" id={okId}>
          <Icon name="i-ok" />
          <span>{okText}</span>
        </p>
      )}
      {help && (
        <div className="help" id={helpId}>
          {help}
        </div>
      )}
    </div>
  );
}

type DateFieldProps = { id: string; label: string; value: DateParts; onChange: (v: DateParts) => void; error?: string | null };

export function DateField({ id, label, value, onChange, error }: DateFieldProps) {
  const month = useRef<HTMLInputElement>(null);
  const year = useRef<HTMLInputElement>(null);
  const errId = `${id}-err`;
  const set = (k: keyof DateParts, raw: string, max: number, next?: HTMLInputElement | null) => {
    const v = raw.replace(/\D/g, '').slice(0, max);
    onChange({ ...value, [k]: v });
    if (next && v.length === max) next.focus();
  };
  const common = {
    className: 'in',
    inputMode: 'numeric' as const,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errId : undefined,
  };
  return (
    <fieldset className="f">
      <legend>{label}</legend>
      <div className="date">
        <label>
          Día
          <input id={id} {...common} autoComplete="bday-day" placeholder="DD" value={value.day} onChange={(e) => set('day', e.target.value, 2, month.current)} />
        </label>
        <label>
          Mes
          <input ref={month} {...common} autoComplete="bday-month" placeholder="MM" value={value.month} onChange={(e) => set('month', e.target.value, 2, year.current)} />
        </label>
        <label>
          Año
          <input ref={year} {...common} autoComplete="bday-year" placeholder="AAAA" value={value.year} onChange={(e) => set('year', e.target.value, 4)} />
        </label>
      </div>
      {error && <ErrorText id={errId}>{error}</ErrorText>}
    </fieldset>
  );
}

type Option = { value: string; label: ReactNode };

/** Grupo de botones grandes que se comporta como radios nativos. */
export function Segmented({
  label,
  name,
  options,
  value,
  onChange,
  error,
  id,
  grid,
  hideLegend,
}: {
  label: ReactNode;
  name: string;
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
  id?: string;
  grid?: boolean;
  hideLegend?: boolean;
}) {
  const errId = `${name}-err`;
  return (
    <fieldset className="f" aria-describedby={error ? errId : undefined}>
      <legend className={hideLegend ? 'sr-only' : undefined}>{label}</legend>
      <div className={`seg${grid ? ' grid2' : ''}`}>
        {options.map((o, i) => (
          <label key={o.value} className={`pill${value === o.value ? ' on' : ''}`}>
            <input
              type="radio"
              className="sr-only"
              name={name}
              id={i === 0 ? id : undefined}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              aria-invalid={error ? true : undefined}
            />
            {value === o.value && <Icon name="i-ok" />}
            {o.label}
          </label>
        ))}
      </div>
      {error && <ErrorText id={errId}>{error}</ErrorText>}
    </fieldset>
  );
}

/** Tarjeta de elección con estado "elegido" visible (check, borde y texto). */
export function ChoiceCard({
  name,
  checked,
  onChange,
  title,
  who,
  description,
  id,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  title: ReactNode;
  who?: ReactNode;
  description?: ReactNode;
  id?: string;
}) {
  return (
    <label className={`choice${checked ? ' on' : ''}`}>
      <input type="radio" className="sr-only" name={name} id={id} checked={checked} onChange={onChange} />
      <span className="box">{checked && <Icon name="i-check" />}</span>
      <span>
        <b>{title}</b>
        {who && <span className="who">{who}</span>}
        {description && <span className="d">{description}</span>}
      </span>
      {checked && <span className="state">Elegido</span>}
    </label>
  );
}

export function Checkbox({ checked, onChange, children, hint }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode; hint?: ReactNode }) {
  const id = useId();
  return (
    <label className="check" htmlFor={id}>
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="b">
        <Icon name="i-ok" />
      </span>
      <span>
        {children}
        {hint && <small>{hint}</small>}
      </span>
    </label>
  );
}

export type FieldError = { id: string; text: string };

/** Resumen de errores al intentar continuar, con enlaces a cada campo. */
export function ErrorSummary({ errors }: { errors: FieldError[] }) {
  if (!errors.length) return null;
  return (
    <div className="errsum" role="alert" tabIndex={-1} id="resumen-errores">
      <h2>{errors.length === 1 ? 'Hay 1 dato por corregir' : `Hay ${errors.length} datos por corregir`}</h2>
      <ul>
        {errors.map((e) => (
          <li key={e.id}>
            <a
              href={`#${e.id}`}
              onClick={(ev) => {
                ev.preventDefault();
                const el = document.getElementById(e.id);
                el?.focus();
                el?.scrollIntoView({ block: 'center' });
              }}
            >
              {e.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
