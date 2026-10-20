import { useId, useState, type KeyboardEvent } from 'react';
import { searchCommunes } from '../data/catalog';
import { regionName } from '../data/labels';
import type { Commune } from '../state/request';
import { ErrorText } from './Fields';
import { Icon } from './Icons';

type Props = {
  id: string;
  label: string;
  value: Commune | null;
  onChange: (c: Commune | null) => void;
  error?: string | null;
  onBlur?: () => void;
};

/** Buscador de comuna (patrón combobox de WAI-ARIA). La región se completa sola. */
export function CommuneCombo({ id, label, value, onChange, error, onBlur }: Props) {
  const [text, setText] = useState(value?.name ?? '');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const errId = `${id}-err`;
  const helpId = `${id}-help`;
  const results = open ? searchCommunes(text) : [];

  const choose = (c: Commune) => {
    onChange(c);
    setText(c.name);
    setOpen(false);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && open && results[active]) {
      e.preventDefault();
      choose(results[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="f combo">
      <label htmlFor={id}>{label}</label>
      <div className="in-wrap">
        <Icon name="i-search" className="lead" />
        <input
          id={id}
          className="in"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open && text.length > 0}
          aria-controls={listId}
          aria-activedescendant={open && results[active] ? `${listId}-${active}` : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={[error ? errId : null, value ? helpId : null].filter(Boolean).join(' ') || undefined}
          autoComplete="off"
          placeholder="Escriba su comuna"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
            setActive(0);
            if (value) onChange(null);
          }}
          onFocus={() => text && !value && setOpen(true)}
          onBlur={() => {
            // Si escribió el nombre exacto, se elige sin tocar la lista.
            setTimeout(() => {
              setOpen(false);
              if (!value) {
                const exact = searchCommunes(text, 50).find((c) => c.name.toLowerCase() === text.trim().toLowerCase());
                if (exact) choose(exact);
              }
              onBlur?.();
            }, 150);
          }}
          onKeyDown={onKey}
        />
        {value && <Icon name="i-ok" className="mark" />}
      </div>
      {open && text.length > 0 && (
        <ul className="suggest" id={listId} role="listbox" aria-label="Comunas">
          {results.length ? (
            results.map((c, i) => (
              <li
                key={c.id}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(c);
                }}
                onMouseEnter={() => setActive(i)}
              >
                {c.name}
                <small>{regionName(c.regionName)}</small>
              </li>
            ))
          ) : (
            <li className="none" role="option" aria-selected={false} aria-disabled="true">
              No encontramos esa comuna. Revise cómo está escrita.
            </li>
          )}
        </ul>
      )}
      {value && (
        <p className="help" id={helpId}>
          {regionName(value.regionName)}
        </p>
      )}
      {error && <ErrorText id={errId}>{error}</ErrorText>}
    </div>
  );
}
