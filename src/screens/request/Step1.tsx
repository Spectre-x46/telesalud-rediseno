import { useMemo, useState } from 'react';
import { ChoiceCard, ErrorSummary, type FieldError } from '../../components/Fields';
import { Icon } from '../../components/Icons';
import { Note } from '../../components/Layout';
import { COMMON, findMotive, motiveName, motiveShare, treeFor, unionTree, type Motive, type Provider } from '../../data/catalog';
import { categoryLabel } from '../../data/labels';
import { MG, MG_CHIPS, TOPICS, chipLabel, infoFor, key, type Topic } from '../../data/topics';
import { go } from '../../lib/router';
import { fold } from '../../lib/text';
import { useRequest, type Category } from '../../state/request';
import { WizardPage } from './WizardPage';

const INFO_MAX = 300;

/** El catálogo del CESFAM si ya se eligió; si no, el de todos los centros. */
function useTree(): Provider[] {
  const { draft } = useRequest();
  return (draft.orgId && treeFor(draft.orgId)) || unionTree;
}

/** Nombre de la opción; si todavía no se sabe el CESFAM, avisa cuando no todos los centros la tienen. */
function Title({ p, m, tree }: { p: Provider; m: Motive; tree: Provider[] }) {
  const rare = tree === unionTree && motiveShare(p.name, m.name) < COMMON;
  return (
    <>
      {motiveName(m.name)}
      {rare && <span className="rare">Solo en algunos centros</span>}
    </>
  );
}

type Entry = { provider: Provider; motive: Motive; k: string };

function topicEntries(t: Topic, tree: Provider[]): Entry[] {
  return t.items
    .map((k) => {
      const [p, m] = k.split(' › ');
      const f = findMotive(p, m, tree);
      return f ? { ...f, k } : null;
    })
    .filter((x): x is Entry => x !== null);
}

/** Elige la categoría. Si hay una sola especificidad, queda elegida; si hay varias, se pregunta. */
function useChoose() {
  const { update } = useRequest();
  return (provider: Provider, motive: Motive, especificidad?: string) => {
    const only = motive.details.length === 1 ? motive.details[0].name : '';
    const cat: Category = { prestador: provider.name, motivo: motive.name, especificidad: especificidad ?? only };
    update({ category: cat });
    go(cat.especificidad ? '/solicitud/1/detalle' : '/solicitud/1/opcion');
  };
}

// ── Temas ────────────────────────────────────────────────────────

export function Step1Topics() {
  const main = TOPICS.filter((t) => t.main);
  return (
    <WizardPage step={1} title="¿Qué quiere solicitar?" back="/" screenKey="s1">
      <ul className="glass list">
        {main.map((t) => (
          <li key={t.id}>
            <a className="row" href={`#/solicitud/1/tema/${t.id}`}>
              <span className="ic"><Icon name={t.icon} /></span>
              <span className="t">
                {t.title}
                {t.sub && <small>{t.sub}</small>}
              </span>
              <Icon name="i-chev" className="chev" />
            </a>
          </li>
        ))}
        <li>
          <a className="row" href="#/solicitud/1/otros">
            <span className="ic"><Icon name="i-grid" /></span>
            <span className="t">
              Otros temas
              <small>Embarazo, niños, salud mental y más</small>
            </span>
            <Icon name="i-chev" className="chev" />
          </a>
        </li>
      </ul>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 20px' }}>
        <a className="textlink" href="#/solicitud/1/todas">Ver todas las opciones</a>
        <a className="textlink" href="#/solicitud/1/nose">No sé qué elegir</a>
      </div>
    </WizardPage>
  );
}

export function Step1Others() {
  const rest = TOPICS.filter((t) => !t.main);
  return (
    <WizardPage step={1} title="Otros temas" back="/solicitud/1" screenKey="s1-otros">
      <ul className="glass list">
        {rest.map((t) => (
          <li key={t.id}>
            <a className="row" href={`#/solicitud/1/tema/${t.id}`}>
              <span className="ic"><Icon name={t.icon} /></span>
              <span className="t">
                {t.title}
                {t.sub && <small>{t.sub}</small>}
              </span>
              <Icon name="i-chev" className="chev" />
            </a>
          </li>
        ))}
      </ul>
      <a className="textlink" href="#/solicitud/1/todas" style={{ alignSelf: 'center' }}>Ver todas las opciones</a>
    </WizardPage>
  );
}

// ── Opciones de un tema ──────────────────────────────────────────

export function Step1Topic({ id }: { id: string }) {
  const topic = TOPICS.find((t) => t.id === id);
  if (!topic) return <Step1Topics />;
  if (topic.id === 'evaluacion') return <Step1Molestia topic={topic} />;
  return <TopicOptions topic={topic} />;
}

function currentKey(cat: Category | null) {
  return cat ? key(cat.prestador, cat.motivo) : '';
}

function TopicOptions({ topic }: { topic: Topic }) {
  const { draft } = useRequest();
  const tree = useTree();
  const entries = topicEntries(topic, tree);
  const [sel, setSel] = useState(() => entries.find((e) => fold(currentKey(draft.category)) === fold(key(e.provider.name, e.motive.name)))?.k ?? '');
  const [err, setErr] = useState(false);
  const choose = useChoose();
  const back = topic.main ? '/solicitud/1' : '/solicitud/1/otros';

  const next = () => {
    const e = entries.find((x) => x.k === sel);
    if (!e) {
      setErr(true);
      return;
    }
    choose(e.provider, e.motive);
  };

  return (
    <WizardPage step={1} title={topic.title} back={back} screenKey={`s1-${topic.id}`}>
      <p className="sub">Elija la opción que corresponde. Así llega a su CESFAM.</p>
      <fieldset className="f">
        <legend className="sr-only">{topic.title}</legend>
        <div className="choices">
          {entries.map((e) => (
            <ChoiceCard
              key={e.k}
              name="motivo"
              checked={sel === e.k}
              onChange={() => {
                setSel(e.k);
                setErr(false);
              }}
              title={<Title p={e.provider} m={e.motive} tree={tree} />}
              who={e.provider.name}
              description={infoFor(e.provider.name, e.motive.name)}
            />
          ))}
        </div>
      </fieldset>
      {topic.notOffered?.map((n) => (
        <Note key={n.title} icon="i-info">
          <b>{n.title}:</b> {n.text}
        </Note>
      ))}
      {err && (
        <p className="msg" role="alert">
          <Icon name="i-alert" />
          Elija una opción para continuar.
        </p>
      )}
      <a className="textlink" href="#/solicitud/1/nose" style={{ alignSelf: 'center' }}>No sé cuál elegir</a>
      <div className="action sticky desk-row">
        <button type="button" className="btn primary" onClick={next}>
          Continuar
        </button>
      </div>
    </WizardPage>
  );
}

// ── Evaluación por una molestia ──────────────────────────────────

function Step1Molestia({ topic }: { topic: Topic }) {
  const { draft } = useRequest();
  const tree = useTree();
  const entries = topicEntries(topic, tree);
  const mg = entries.find((e) => e.k === MG);
  const others = entries.filter((e) => e.k !== MG);
  const cur = draft.category;
  const [sel, setSel] = useState<string>(() => {
    if (!cur) return '';
    if (key(cur.prestador, cur.motivo) === MG) return `mg:${cur.especificidad}`;
    return others.find((e) => fold(key(e.provider.name, e.motive.name)) === fold(currentKey(cur)))?.k ?? '';
  });
  const [showOthers, setShowOthers] = useState(sel !== '' && !sel.startsWith('mg:'));
  const [err, setErr] = useState(false);
  const choose = useChoose();

  const chips = mg ? [...mg.motive.details].sort((a, b) => order(a.name) - order(b.name)) : [];

  const next = () => {
    if (sel.startsWith('mg:') && mg) return choose(mg.provider, mg.motive, sel.slice(3));
    const e = others.find((x) => x.k === sel);
    if (e) return choose(e.provider, e.motive);
    setErr(true);
  };

  return (
    <WizardPage step={1} title="¿Sobre qué es la molestia?" back="/solicitud/1" screenKey="s1-molestia">
      <p className="sub">Así el equipo que revisa sabe de qué se trata.</p>
      {mg && (
        <fieldset className="f">
          <legend className="sr-only">Tipo de molestia</legend>
          <div className="chips">
            {chips.map((d) => {
              const v = `mg:${d.name}`;
              const on = sel === v;
              const label = chipLabel(d.name);
              return (
                <label key={d.id} className={`chip${on ? ' on' : ''}${fold(d.name) === 'otros' ? ' wide' : ''}`}>
                  <input
                    type="radio"
                    className="sr-only"
                    name="molestia"
                    checked={on}
                    onChange={() => {
                      setSel(v);
                      setErr(false);
                    }}
                  />
                  {on && <Icon name="i-check" />}
                  {label}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}
      {sel.startsWith('mg:') && (
        <p className="small">
          Llega a su CESFAM como: <b>Medicina · Atención Medicina General · {sel.slice(3)}</b>
        </p>
      )}
      <button type="button" className="textlink" aria-expanded={showOthers} onClick={() => setShowOthers(!showOthers)}>
        {showOthers ? 'Ocultar otras opciones' : '¿Es con otro profesional? Ver otras opciones'}
      </button>
      {showOthers && (
        <div className="choices">
          {others.map((e) => (
            <ChoiceCard
              key={e.k}
              name="molestia"
              checked={sel === e.k}
              onChange={() => {
                setSel(e.k);
                setErr(false);
              }}
              title={<Title p={e.provider} m={e.motive} tree={tree} />}
              who={e.provider.name}
              description={infoFor(e.provider.name, e.motive.name)}
            />
          ))}
        </div>
      )}
      {err && (
        <p className="msg" role="alert">
          <Icon name="i-alert" />
          Elija una opción para continuar.
        </p>
      )}
      <Note icon="i-clock">
        Su CESFAM revisará la solicitud y le contactará. <b>No es una atención inmediata.</b>
      </Note>
      <div className="action sticky desk-row">
        <button type="button" className="btn primary" onClick={next}>
          Continuar
        </button>
      </div>
    </WizardPage>
  );
}

const CHIP_ORDER = Object.keys(MG_CHIPS).map((k) => fold(k));
/** Orden de los botones: el de los mockups; "Otros" siempre al final. */
function order(name: string) {
  const i = CHIP_ORDER.indexOf(fold(name));
  if (fold(name) === 'otros') return 99;
  return i === -1 ? CHIP_ORDER.length : i;
}

// ── Especificidad (tercer nivel) ─────────────────────────────────

const DETAIL_QUESTION: Record<string, string> = {
  // El catálogo de Dental separa por rango de edad.
  'Resultado de exámenes': '¿De qué examen es el resultado?',
  'Control de salud infantil': '¿Qué control le corresponde?',
  'Método anticonceptivo': '¿Qué necesita sobre su método anticonceptivo?',
  'Consulta Ginecológica': '¿Sobre qué es la consulta?',
  Exámenes: '¿Qué examen necesita?',
  'Consulta de Tratamiento Odontológico': '¿Qué tipo de tratamiento dental?',
};

function detailQuestion(motive: string, details: string[]) {
  if (details.every((d) => /\d+ (a|y) \d+ años|años y más/.test(d))) return '¿Qué edad tiene la persona que se atenderá?';
  return DETAIL_QUESTION[motive] ?? '¿Cuál de estas opciones?';
}

export function Step1Detail() {
  const { draft, update } = useRequest();
  const tree = useTree();
  const cat = draft.category;
  const found = cat ? findMotive(cat.prestador, cat.motivo, tree) : undefined;
  const [sel, setSel] = useState(cat?.especificidad ?? '');
  const [err, setErr] = useState(false);
  if (!cat || !found) return <Step1Topics />;
  const details = found.motive.details;

  const next = () => {
    if (!details.some((d) => d.name === sel)) return setErr(true);
    update({ category: { ...cat, especificidad: sel } });
    go('/solicitud/1/detalle');
  };

  return (
    <WizardPage step={1} title={detailQuestion(cat.motivo, details.map((d) => d.name))} back="/solicitud/1" screenKey="s1-opcion">
      <span className="picked">
        <Icon name="i-ok" />
        {found.provider.name} · {motiveName(found.motive.name)}
      </span>
      <fieldset className="f">
        <legend className="sr-only">Opciones</legend>
        <div className="choices">
          {details.map((d) => (
            <ChoiceCard
              key={d.id}
              name="especificidad"
              checked={sel === d.name}
              onChange={() => {
                setSel(d.name);
                setErr(false);
              }}
              title={d.name}
            />
          ))}
        </div>
      </fieldset>
      {err && (
        <p className="msg" role="alert">
          <Icon name="i-alert" />
          Elija una opción para continuar.
        </p>
      )}
      <div className="action sticky desk-row">
        <button type="button" className="btn primary" onClick={next}>
          Continuar
        </button>
      </div>
    </WizardPage>
  );
}

// ── Con sus palabras (información adicional) ─────────────────────

export function Step1Info() {
  const { draft, update, complete } = useRequest();
  const [tried, setTried] = useState(false);
  const cat = draft.category;
  if (!cat || !cat.especificidad) return <Step1Topics />;
  const label = categoryLabel(cat);
  const len = draft.info.length;
  const errors: FieldError[] = !draft.info.trim() ? [{ id: 'info', text: 'Cuéntenos en pocas palabras qué necesita.' }] : [];
  const showErr = tried && errors.length > 0;

  const next = () => {
    setTried(true);
    if (errors.length) {
      requestAnimationFrame(() => document.getElementById('info')?.focus());
      return;
    }
    complete(1);
    go(draft.identityMode ? '/solicitud/2/datos' : '/solicitud/2');
  };

  return (
    <WizardPage step={1} title="Cuéntenos un poco más" back={key(cat.prestador, cat.motivo) === MG ? '/solicitud/1/tema/evaluacion' : '/solicitud/1'} screenKey="s1-info">
      <div className="glass card" style={{ gap: 6 }}>
        <p className="small">Lo que eligió</p>
        <p>
          <b>{label.short}</b>
        </p>
        <p className="small">{label.official}</p>
        <button type="button" className="textlink" onClick={() => go('/solicitud/1')}>
          Cambiar
        </button>
      </div>
      {showErr && <ErrorSummary errors={errors} />}
      <div className="f">
        <label htmlFor="info">Con sus palabras, ¿qué necesita?</label>
        <p className="help" id="info-help">
          Por ejemplo: desde cuándo le pasa, o qué remedio o examen necesita. El equipo que revisa su solicitud leerá esto.
        </p>
        <textarea
          id="info"
          className="in"
          value={draft.info}
          maxLength={INFO_MAX}
          onChange={(e) => update({ info: e.target.value.slice(0, INFO_MAX) })}
          aria-invalid={showErr || undefined}
          aria-describedby={`info-help info-count${showErr ? ' info-err' : ''}`}
          aria-required
        />
        <p className={`count${len > INFO_MAX - 30 ? ' near' : ''}`} id="info-count">
          {len} de {INFO_MAX} caracteres
        </p>
        {showErr && (
          <p className="msg" id="info-err">
            <Icon name="i-alert" />
            {errors[0].text}
          </p>
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

// ── Todas las opciones ───────────────────────────────────────────

export function Step1All() {
  const { draft } = useRequest();
  const tree = useTree();
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(() => (draft.category ? fold(currentKey(draft.category)) : ''));
  const [err, setErr] = useState(false);
  const choose = useChoose();

  const groups = useMemo(() => {
    const f = fold(q);
    return tree
      .map((p) => ({
        provider: p,
        motives: p.motives.filter((m) => {
          if (!f) return true;
          const hay = fold([p.name, m.name, infoFor(p.name, m.name) ?? '', ...m.details.map((d) => d.name)].join(' '));
          return f.split(/\s+/).every((w) => hay.includes(w));
        }),
      }))
      .filter((g) => g.motives.length);
  }, [q, tree]);

  const next = () => {
    for (const p of tree) for (const m of p.motives) if (fold(key(p.name, m.name)) === sel) return choose(p, m);
    setErr(true);
  };

  return (
    <WizardPage step={1} title="Todas las opciones" back="/solicitud/1" screenKey="s1-todas">
      <p className="sub">Ordenadas por el profesional que atiende, como en el formulario actual, con una explicación de cada una.</p>
      <div className="f">
        <label htmlFor="buscar" className="sr-only">Buscar</label>
        <div className="in-wrap">
          <Icon name="i-search" className="lead" />
          <input id="buscar" className="in" type="search" placeholder="Buscar: receta, examen, certificado…" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" />
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {groups.reduce((n, g) => n + g.motives.length, 0)} opciones
      </p>
      {groups.length === 0 && (
        <Note>
          No encontramos opciones con «{q}». Pruebe con otra palabra, o vea <a href="#/solicitud/1/nose">qué hacer si no sabe qué elegir</a>.
        </Note>
      )}
      <fieldset className="f">
        <legend className="sr-only">Opciones</legend>
        {groups.map((g) => (
          <div key={g.provider.id} className="group">
            <h2>{g.provider.name}</h2>
            <div className="choices">
              {g.motives.map((m) => {
                const k = key(g.provider.name, m.name);
                return (
                  <ChoiceCard
                    key={m.id}
                    name="todas"
                    checked={sel === fold(k)}
                    onChange={() => {
                      setSel(fold(k));
                      setErr(false);
                    }}
                    title={<Title p={g.provider} m={m} tree={tree} />}
                    description={infoFor(g.provider.name, m.name)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </fieldset>
      {err && (
        <p className="msg" role="alert">
          <Icon name="i-alert" />
          Elija una opción para continuar.
        </p>
      )}
      <div className="action sticky desk-row">
        <button type="button" className="btn primary" onClick={next}>
          Continuar
        </button>
      </div>
    </WizardPage>
  );
}

// ── No sé qué elegir ─────────────────────────────────────────────

export function Step1NotSure() {
  const [cesfam, setCesfam] = useState(false);
  return (
    <WizardPage step={1} title="No está seguro/a de qué elegir" back="/solicitud/1" screenKey="s1-nose">
      <p className="sub">Es normal. Hoy la solicitud necesita una categoría para enviarse. Estas son sus opciones:</p>
      <ul className="glass list">
        <li>
          <a className="row" href="#/solicitud/1/todas">
            <span className="ic"><Icon name="i-grid" /></span>
            <span className="t">
              Ver todas las opciones
              <small>Cada una con una explicación corta</small>
            </span>
            <Icon name="i-chev" className="chev" />
          </a>
        </li>
        <li>
          <a className="row" href="#/solicitud/1/tema/evaluacion">
            <span className="ic"><Icon name="i-steth" /></span>
            <span className="t">
              Si es por una molestia
              <small>Elija "Que me evalúen por una molestia"</small>
            </span>
            <Icon name="i-chev" className="chev" />
          </a>
        </li>
        <li>
          <button type="button" className="row" aria-expanded={cesfam} onClick={() => setCesfam(!cesfam)}>
            <span className="ic"><Icon name="i-phone" /></span>
            <span className="t">
              Preguntar en su CESFAM
              <small>Le pueden orientar sobre qué solicitar</small>
            </span>
            <Icon name="i-chev" className="chev" />
          </button>
        </li>
      </ul>
      {cesfam && <Note>Puede preguntar en su CESFAM, en persona o por teléfono, qué tipo de solicitud corresponde a su caso.</Note>}
      <details className="glass faq">
        <summary>
          <span>
            Propuesta: enviar sin elegir categoría <span className="tag b">Requiere cambio de MINSAL</span>
          </span>
          <Icon name="i-chev" />
        </summary>
        <div className="a">
          <p>
            Hoy no es posible. Proponemos que la persona pueda enviar su solicitud sin categoría y que el equipo del CESFAM la
            elija al revisarla. En esta demo esta opción no envía nada: solo muestra la idea.
          </p>
        </div>
      </details>
    </WizardPage>
  );
}
