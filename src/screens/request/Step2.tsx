import { useState } from 'react';
import { Checkbox, DateField, ErrorSummary, Segmented, TextField, type FieldError } from '../../components/Fields';
import { Icon } from '../../components/Icons';
import { Note } from '../../components/Layout';
import { genders, identifierTypes, sexes } from '../../data/catalog';
import { PERSONAS } from '../../data/demo';
import { categoryLabel, sentence } from '../../data/labels';
import { go } from '../../lib/router';
import { formatRun, isValidRun } from '../../lib/run';
import { dateError, requiredError } from '../../lib/validate';
import { emptyDraft, useRequest, type Draft } from '../../state/request';
import { WizardPage } from './WizardPage';

/** Paso 2, primera pantalla: cómo ingresar los datos. ClaveÚnica es una simulación (nivel C). */
export function Step2Entry() {
  const { draft, update } = useRequest();
  return (
    <WizardPage step={2} title="¿Cómo quiere ingresar sus datos?" back="/solicitud/1/detalle" screenKey="s2-entrada">
      {draft.category && (
        <span className="picked">
          <Icon name="i-ok" />
          {categoryLabel(draft.category).short}
        </span>
      )}
      <div className="glass card" style={{ gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span className="cu-badge" aria-hidden="true">
            <Icon name="i-id" />
          </span>
          <div>
            <h2 style={{ margin: 0 }}>Con ClaveÚnica</h2>
            <span className="tag sim">Simulación en esta demo</span>
          </div>
        </div>
        <ul className="ticks">
          <li>
            <Icon name="i-ok" />
            Sus datos personales ya completos
          </li>
          <li>
            <Icon name="i-ok" />
            Usted solo revisa y confirma
          </li>
        </ul>
        <button type="button" className="btn primary" onClick={() => go('/solicitud/2/claveunica')}>
          Continuar con ClaveÚnica
        </button>
      </div>
      <button
        type="button"
        className="btn ghost"
        onClick={() => {
          update({ identityMode: 'manual' });
          go('/solicitud/2/datos');
        }}
      >
        <Icon name="i-pen" />
        Escribir mis datos
      </button>
      <p className="small" style={{ textAlign: 'center' }}>
        Las dos formas llegan igual a su CESFAM.
      </p>
    </WizardPage>
  );
}

/** Simulación: se elige una persona ficticia y sus datos quedan escritos para revisar. */
export function Step2ClaveUnica() {
  const { update } = useRequest();
  const [pick, setPick] = useState('');
  return (
    <WizardPage step={2} title="Ingreso con ClaveÚnica" back="/solicitud/2" screenKey="s2-cu">
      <Note icon="i-info" tone="warn">
        <b>Esto es una simulación.</b> No se usa su ClaveÚnica real y no sabemos qué datos entrega hoy ClaveÚnica a
        Telesalud. Sirve para mostrar cómo se sentiría llegar con los datos ya completos.
      </Note>
      <fieldset className="f">
        <legend>Elija una persona ficticia</legend>
        <div className="choices">
          {PERSONAS.map((p) => (
            <label key={p.id} className={`choice${pick === p.id ? ' on' : ''}`}>
              <input type="radio" className="sr-only" name="persona" checked={pick === p.id} onChange={() => setPick(p.id)} />
              <span className="box">{pick === p.id && <Icon name="i-check" />}</span>
              <span>
                <b>{p.label}</b>
                <span className="d">{p.age}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="action sticky">
        <button
          type="button"
          className="btn primary"
          disabled={!pick}
          onClick={() => {
            const p = PERSONAS.find((x) => x.id === pick);
            if (!p) return;
            update({ ...p.data, identityMode: 'claveunica', forWhom: 'yo' });
            go('/solicitud/2/datos');
          }}
        >
          Traer mis datos
        </button>
      </div>
    </WizardPage>
  );
}

// Orden de los botones de sexo: el catálogo trae "Desconocido" primero.
const SEX_ORDER = ['female', 'male', 'other', 'unknown'];

const IDENTITY_FIELDS: (keyof Draft)[] = ['docType', 'docNumber', 'names', 'lastName1', 'lastName2', 'socialName', 'sex', 'gender', 'birth', 'disability', 'caregiver'];

export function validateIdentity(d: Draft): FieldError[] {
  const e: FieldError[] = [];
  const isRun = d.docType === 'run';
  if (!d.docNumber.trim()) e.push({ id: 'doc', text: isRun ? 'Escriba el RUN.' : 'Escriba el número de documento.' });
  else if (isRun && !isValidRun(d.docNumber)) e.push({ id: 'doc', text: 'El RUN no es válido. Revise los números y el dígito después del guion.' });
  const n = requiredError(d.names, 'Escriba el o los nombres.');
  if (n) e.push({ id: 'nombres', text: n });
  const a = requiredError(d.lastName1, 'Escriba el apellido paterno.');
  if (a) e.push({ id: 'apellido1', text: a });
  const f = dateError(d.birth);
  if (f) e.push({ id: 'nacimiento', text: f });
  if (!d.sex) e.push({ id: 'sexo', text: 'Elija una opción de sexo.' });
  return e;
}

export function Step2Form() {
  const { draft, update, complete } = useRequest();
  const [tried, setTried] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [more, setMore] = useState(!!(draft.socialName || draft.gender));
  const [otherDoc, setOtherDoc] = useState(draft.docType !== 'run');

  const errors = validateIdentity(draft);
  const show = (id: string) => (tried || touched[id] ? errors.find((e) => e.id === id)?.text : undefined);
  const blur = (id: string) => () => setTouched((t) => ({ ...t, [id]: true }));
  const isRun = draft.docType === 'run';
  const forOther = draft.forWhom === 'otra';
  const fromCU = draft.identityMode === 'claveunica';

  const setForWhom = (v: string) => {
    if (v === draft.forWhom) return;
    // Si llegó con ClaveÚnica y la solicitud es para otra persona, sus datos no sirven.
    if (fromCU && v === 'otra') {
      const blank = emptyDraft();
      update({ forWhom: 'otra', identityMode: 'manual', ...Object.fromEntries(IDENTITY_FIELDS.map((k) => [k, blank[k]])) });
    } else update({ forWhom: v as Draft['forWhom'] });
  };

  const next = () => {
    setTried(true);
    if (errors.length) {
      requestAnimationFrame(() => document.getElementById('resumen-errores')?.focus());
      return;
    }
    complete(2);
    go('/solicitud/3');
  };

  const docLabel = isRun ? 'RUN' : `N° de ${sentence(identifierTypes.find((t) => t.code === draft.docType)?.display ?? 'documento')}`;

  return (
    <WizardPage
      step={2}
      title={forOther ? 'Datos de la persona que se atenderá' : 'Sus datos'}
      back={fromCU ? '/solicitud/2/claveunica' : '/solicitud/2'}
      screenKey="s2-datos"
    >
      {tried && <ErrorSummary errors={errors} />}
      {fromCU && (
        <Note icon="i-id">
          <b>Datos traídos con ClaveÚnica</b> <span className="tag sim">Simulación</span>
          <br />
          Revíselos. Puede corregir cualquier dato.
        </Note>
      )}

      <Segmented
        label="¿Para quién es la solicitud?"
        name="para"
        value={draft.forWhom}
        onChange={setForWhom}
        options={[
          { value: 'yo', label: 'Para mí' },
          { value: 'otra', label: 'Para otra persona' },
        ]}
      />
      {forOther && (
        <Note>
          Escriba <b>los datos de la persona que se atenderá</b>. En el paso de contacto puede dejar su propio teléfono si
          usted la está ayudando.
        </Note>
      )}

      <div className="glass card form">
        <div className="id-grid">
          <div className="f a-doc">
            {otherDoc && (
              <div className="f" style={{ marginBottom: 12 }}>
                <label htmlFor="tipo-doc">Tipo de documento</label>
                <select
                  id="tipo-doc"
                  className="in"
                  value={draft.docType}
                  onChange={(e) => update({ docType: e.target.value, docNumber: '' })}
                >
                  {identifierTypes.map((t) => (
                    <option key={t.code} value={t.code}>
                      {t.code === 'run' ? 'RUN' : sentence(t.display)}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <TextField
              id="doc"
              label={docLabel}
              value={draft.docNumber}
              onChange={(v) => update({ docNumber: isRun ? formatRun(v) : v })}
              onBlur={blur('doc')}
              error={show('doc')}
              valid={isRun && isValidRun(draft.docNumber)}
              placeholder={isRun ? 'Ej: 12.345.678-5' : undefined}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={isRun ? 12 : 20}
              help={
                !otherDoc && (
                  <button type="button" className="textlink" onClick={() => setOtherDoc(true)}>
                    ¿No tiene RUN? Usar otro documento
                  </button>
                )
              }
            />
          </div>
          <div className="a-names">
            <TextField
              id="nombres"
              label="Nombres"
              value={draft.names}
              onChange={(names) => update({ names })}
              onBlur={blur('nombres')}
              error={show('nombres')}
              autoComplete={forOther ? 'off' : 'given-name'}
              autoCapitalize="words"
              maxLength={50}
            />
          </div>
          <div className="a-l1">
            <TextField
              id="apellido1"
              label="Apellido paterno"
              value={draft.lastName1}
              onChange={(lastName1) => update({ lastName1 })}
              onBlur={blur('apellido1')}
              error={show('apellido1')}
              autoComplete={forOther ? 'off' : 'family-name'}
              autoCapitalize="words"
              maxLength={30}
            />
          </div>
          <div className="a-l2">
            <TextField
              id="apellido2"
              label="Apellido materno"
              optional
              value={draft.lastName2}
              onChange={(lastName2) => update({ lastName2 })}
              autoComplete="off"
              autoCapitalize="words"
              maxLength={30}
            />
          </div>
          <div className="a-date">
            <DateField
              id="nacimiento"
              label="Fecha de nacimiento"
              value={draft.birth}
              onChange={(birth) => {
                update({ birth });
                if (birth.year.length === 4) setTouched((t) => ({ ...t, nacimiento: true }));
              }}
              error={show('nacimiento')}
            />
          </div>
          <div className="a-sex">
            <Segmented
              id="sexo"
              label="Sexo"
              name="sexo"
              grid
              value={draft.sex}
              onChange={(sex) => update({ sex })}
              error={show('sexo')}
              options={[...sexes].sort((a, b) => SEX_ORDER.indexOf(a.code) - SEX_ORDER.indexOf(b.code)).map((s) => ({ value: s.code, label: sentence(s.display) }))}
            />
          </div>
          <div className="a-chk">
        <div className="choices" style={{ gap: 6 }}>
            <Checkbox checked={draft.disability} onChange={(disability) => update({ disability })} hint="Esta información la verá el equipo que revisa la solicitud.">
              {forOther ? 'La persona tiene alguna discapacidad' : 'Tengo alguna discapacidad'}
            </Checkbox>
            <Checkbox checked={draft.caregiver} onChange={(caregiver) => update({ caregiver })}>
              {forOther ? 'La persona es cuidador/a de alguien con discapacidad' : 'Soy cuidador/a de una persona con discapacidad'}
            </Checkbox>
        </div>
          </div>
        </div>

        <button type="button" className="more" aria-expanded={more} aria-controls="mas-datos" onClick={() => setMore(!more)}>
          <Icon name="i-plus" />
          Más datos (opcionales): nombre social y género
        </button>
        {more && (
          <div id="mas-datos" className="d-grid2">
            <TextField
              id="nombre-social"
              label="Nombre social"
              optional
              value={draft.socialName}
              onChange={(socialName) => update({ socialName })}
              autoComplete="off"
              maxLength={20}
              help="El nombre con que la persona quiere que le llamen."
            />
            <div className="f">
              <label htmlFor="genero">
                Género <span className="opt">(opcional)</span>
              </label>
              <select id="genero" className="in" value={draft.gender} onChange={(e) => update({ gender: e.target.value })}>
                <option value="">Sin indicar</option>
                {genders.map((g) => (
                  <option key={g.code} value={g.code}>
                    {sentence(g.display)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="action sticky desk-row">
        <button type="button" className="btn primary" onClick={next}>
          Continuar
        </button>
      </div>
    </WizardPage>
  );
}
