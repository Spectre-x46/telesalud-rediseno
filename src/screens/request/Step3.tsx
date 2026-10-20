import { useState } from 'react';
import { CommuneCombo } from '../../components/CommuneCombo';
import { ChoiceCard, ErrorSummary, TextField, type FieldError } from '../../components/Fields';
import { Icon } from '../../components/Icons';
import { Note } from '../../components/Layout';
import { orgById, orgOffers, orgsIn } from '../../data/catalog';
import { categoryLabel, shortOrgName } from '../../data/labels';
import { go } from '../../lib/router';
import { requiredError } from '../../lib/validate';
import { useRequest, type Draft } from '../../state/request';
import { WizardPage } from './WizardPage';

export function validatePlace(d: Draft): FieldError[] {
  const e: FieldError[] = [];
  if (!d.homeCommune) e.push({ id: 'comuna', text: 'Escriba su comuna y elíjala de la lista.' });
  const s = requiredError(d.street, 'Escriba la calle.');
  if (s) e.push({ id: 'calle', text: s });
  const n = requiredError(d.number, 'Escriba el número de la casa o edificio. Si no tiene, escriba S/N.');
  if (n) e.push({ id: 'numero', text: n });
  if (!d.orgId) e.push({ id: 'centro', text: 'Elija el centro de salud donde se atiende.' });
  return e;
}

const SHOW_FIRST = 4;

export function Step3() {
  const { draft, update, complete } = useRequest();
  const [tried, setTried] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [otherCommune, setOtherCommune] = useState(
    !!draft.orgCommune && !!draft.homeCommune && draft.orgCommune.id !== draft.homeCommune.id,
  );
  const [showAll, setShowAll] = useState(false);
  const [noSe, setNoSe] = useState(false);

  const errors = validatePlace(draft);
  const show = (id: string) => (tried || touched[id] ? errors.find((e) => e.id === id)?.text : undefined);
  const blur = (id: string) => () => setTouched((t) => ({ ...t, [id]: true }));

  const orgCommune = draft.orgCommune ?? draft.homeCommune;
  const orgs = orgCommune ? orgsIn(orgCommune.id) : [];
  const selectedIndex = orgs.findIndex((o) => o.id === draft.orgId);
  const visible = showAll || orgs.length <= SHOW_FIRST + 1 || selectedIndex >= SHOW_FIRST ? orgs : orgs.slice(0, SHOW_FIRST);
  const org = orgById(draft.orgId);
  const offered = !draft.category || !draft.orgId || orgOffers(draft.category, draft.orgId);

  const next = () => {
    setTried(true);
    if (errors.length || !offered) {
      requestAnimationFrame(() => document.getElementById(errors.length ? 'resumen-errores' : 'no-ofrece')?.focus());
      return;
    }
    complete(3);
    go('/solicitud/4');
  };

  return (
    <WizardPage step={3} title="¿Dónde vive y en qué centro se atiende?" back="/solicitud/2/datos" screenKey="s3">
      {tried && <ErrorSummary errors={errors} />}
      <div className="glass card form">
        <CommuneCombo
          id="comuna"
          label="Comuna donde vive"
          value={draft.homeCommune}
          onBlur={blur('comuna')}
          error={show('comuna')}
          onChange={(c) => {
            // La comuna del centro sigue a la de la dirección, salvo que la persona la haya cambiado.
            const patch: Partial<Draft> = { homeCommune: c };
            if (!otherCommune && c?.id !== draft.homeCommune?.id) Object.assign(patch, { orgCommune: c, orgId: null });
            update(patch);
          }}
        />
        <div className="grid-street">
          <TextField
            id="calle"
            label="Calle"
            value={draft.street}
            onChange={(street) => update({ street })}
            onBlur={blur('calle')}
            error={show('calle')}
            autoComplete="address-line1"
            maxLength={30}
          />
          <TextField
            id="numero"
            label="Número"
            value={draft.number}
            onChange={(number) => update({ number })}
            onBlur={blur('numero')}
            error={show('numero')}
            autoComplete="off"
            maxLength={10}
          />
        </div>
        <TextField
          id="extra"
          label="Depto, block o población"
          optional
          value={draft.extra}
          onChange={(extra) => update({ extra })}
          autoComplete="address-line2"
          maxLength={30}
          placeholder="Ej: Depto 21"
        />
      </div>

      {orgCommune && (
        <fieldset className="f" aria-describedby={show('centro') ? 'centro-err' : undefined}>
          <legend>
            <h2 style={{ margin: 0 }}>Centros de salud en {orgCommune.name}</h2>
          </legend>
          {otherCommune && (
            <CommuneCombo
              id="comuna-centro"
              label="Comuna del centro de salud"
              value={draft.orgCommune}
              onChange={(c) => update({ orgCommune: c, orgId: null })}
            />
          )}
          <div className="choices" id="centro" tabIndex={-1}>
            {visible.map((o) => (
              <ChoiceCard
                key={o.id}
                name="centro"
                checked={draft.orgId === o.id}
                onChange={() => update({ orgId: o.id, orgCommune: orgCommune })}
                title={shortOrgName(o.name)}
                description={o.address ?? undefined}
              />
            ))}
            {!orgs.length && <Note>No encontramos centros con Telesalud en {orgCommune.name}. Pruebe con otra comuna.</Note>}
          </div>
          {visible.length < orgs.length && (
            <button type="button" className="btn ghost" onClick={() => setShowAll(true)}>
              Ver los {orgs.length} centros
            </button>
          )}
          {show('centro') && (
            <p className="msg" id="centro-err">
              <Icon name="i-alert" />
              {show('centro')}
            </p>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 18px' }}>
            {!otherCommune && (
              <button type="button" className="textlink" onClick={() => setOtherCommune(true)}>
                Me atiendo en otra comuna
              </button>
            )}
            <button type="button" className="textlink" aria-expanded={noSe} onClick={() => setNoSe(!noSe)}>
              No sé en cuál estoy inscrito/a
            </button>
          </div>
          {noSe && (
            <Note>
              Normalmente es el centro de salud donde se inscribió, cerca de su casa. Si no lo sabe, pregunte en el centro más
              cercano: ahí le dirán dónde está inscrito/a o cómo inscribirse.
            </Note>
          )}
        </fieldset>
      )}

      {!offered && draft.category && org && (
        <div className="glass note warn" id="no-ofrece" tabIndex={-1} role="alert">
          <Icon name="i-alert" />
          <div>
            <b>{shortOrgName(org.name)} no recibe por Telesalud solicitudes de «{categoryLabel(draft.category).short}».</b>
            <br />
            Cada centro tiene sus propias opciones. Elija otra cosa que solicitar, o revise si eligió bien el centro.
            <br />
            <button type="button" className="textlink" onClick={() => go('/solicitud/1')}>
              Cambiar lo que solicita
            </button>
          </div>
        </div>
      )}

      <div className="action sticky desk-row">
        <button type="button" className="btn primary" onClick={next}>
          Continuar
        </button>
      </div>
    </WizardPage>
  );
}
