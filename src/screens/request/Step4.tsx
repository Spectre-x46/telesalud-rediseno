import { useState } from 'react';
import { Checkbox, ErrorSummary, TextField, type FieldError } from '../../components/Fields';
import { Icon } from '../../components/Icons';
import { Note } from '../../components/Layout';
import { go } from '../../lib/router';
import { cleanPhone, emailError, formatPhone, phoneError, phoneKind } from '../../lib/validate';
import { useRequest, type Draft } from '../../state/request';
import { WizardPage } from './WizardPage';

export function validateContact(d: Draft): FieldError[] {
  const e: FieldError[] = [];
  const p1 = phoneError(d.phone1, true);
  if (p1) e.push({ id: 'tel1', text: p1 });
  const p2 = phoneError(d.phone2, false);
  if (p2) e.push({ id: 'tel2', text: `Segundo teléfono: ${p2.charAt(0).toLowerCase()}${p2.slice(1)}` });
  const m = emailError(d.email);
  if (m) e.push({ id: 'correo', text: m });
  return e;
}

const kindText = (v: string) => {
  const k = phoneKind(v);
  return k === 'celular' ? 'Celular' : k === 'fijo' ? 'Teléfono fijo' : null;
};

export function Step4() {
  const { draft, update, complete } = useRequest();
  const [tried, setTried] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [second, setSecond] = useState(!!draft.phone2);

  const errors = validateContact(draft);
  const show = (id: string) => (tried || touched[id] ? errors.find((e) => e.id === id)?.text : undefined);
  const blur = (id: string) => () => setTouched((t) => ({ ...t, [id]: true }));
  const forOther = draft.forWhom === 'otra';

  const next = () => {
    setTried(true);
    if (errors.length) {
      requestAnimationFrame(() => document.getElementById('resumen-errores')?.focus());
      return;
    }
    complete(4);
    go('/solicitud/5');
  };

  const phoneProps = { inputMode: 'tel' as const, prefix: '+56', maxLength: 12, placeholder: '9 1234 5678' };

  return (
    <WizardPage step={4} title="¿Cómo le contactamos?" back="/solicitud/3" screenKey="s4">
      <p className="sub">Su CESFAM usará estos datos para responder la solicitud.</p>
      {tried && <ErrorSummary errors={errors} />}
      <div className="glass card form">
        <TextField
          id="tel1"
          label="Teléfono"
          value={formatPhone(draft.phone1)}
          onChange={(v) => update({ phone1: cleanPhone(v) })}
          onBlur={blur('tel1')}
          error={show('tel1')}
          valid={!phoneError(draft.phone1, true)}
          okText={!phoneError(draft.phone1, true) ? kindText(draft.phone1) : null}
          autoComplete="tel-national"
          help={forOther ? 'Puede ser su teléfono, si usted está ayudando a esta persona.' : undefined}
          {...phoneProps}
        />
        {second ? (
          <TextField
            id="tel2"
            label="Otro teléfono"
            optional
            value={formatPhone(draft.phone2)}
            onChange={(v) => update({ phone2: cleanPhone(v) })}
            onBlur={blur('tel2')}
            error={show('tel2')}
            valid={!!draft.phone2 && !phoneError(draft.phone2, false)}
            okText={draft.phone2 && !phoneError(draft.phone2, false) ? kindText(draft.phone2) : null}
            autoComplete="off"
            {...phoneProps}
          />
        ) : (
          <button type="button" className="more" style={{ borderTop: 0, paddingTop: 0 }} onClick={() => setSecond(true)}>
            <Icon name="i-plus" />
            Agregar otro teléfono
          </button>
        )}
        <TextField
          id="correo"
          label="Correo electrónico"
          optional
          type="email"
          inputMode="email"
          value={draft.email}
          onChange={(email) => update({ email: email.trim() })}
          onBlur={blur('correo')}
          error={show('correo')}
          autoComplete="email"
          autoCapitalize="off"
          spellCheck={false}
          maxLength={50}
          placeholder="nombre@correo.cl"
        />
        {draft.email && !emailError(draft.email) && (
          <Checkbox checked={draft.emailUpdates} onChange={(emailUpdates) => update({ emailUpdates })}>
            Recibir el seguimiento de mi solicitud por correo
          </Checkbox>
        )}
      </div>
      <Note icon="i-phone">
        <b>Esté atento/a a su teléfono.</b> El equipo puede llamarle desde un número que no conoce.
      </Note>
      <div className="action sticky desk-row">
        <button type="button" className="btn primary" onClick={next}>
          Continuar
        </button>
      </div>
    </WizardPage>
  );
}
