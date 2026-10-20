import type { ReactNode } from 'react';
import { Icon } from '../components/Icons';
import { Page } from '../components/Layout';
import { catalogDate, communes, genders, identifierTypes, orgById, sexes } from '../data/catalog';
import { SAMPLES } from '../data/demo';
import { regionName, sentence } from '../data/labels';
import { formatPhone, phoneKind } from '../lib/validate';
import { useRequest, type Submitted } from '../state/request';

// Modo presentación: qué estaba mal, qué cambió y por qué es mejor, sin que nadie lo explique.
// Las capturas "Hoy" son de telesalud.gob.cl con datos de prueba (docs/evidencia);
// las de "Propuesta" son de esta demo (docs/demo).

type Moment = {
  title: string;
  findings: string[];
  before: { src: string; alt: string } | null;
  after: { src: string; alt: string };
  was: string;
  changed: string;
  better: string;
  route: string;
};

const MOMENTS: Moment[] = [
  {
    title: 'La portada',
    findings: ['U03', 'U04', 'U05'],
    before: { src: 'evidencia/A01-movil-inicio.png', alt: 'Portada actual en celular: un bloque verde vacío y los botones bajo la mitad de la pantalla' },
    after: { src: 'demo/D01-inicio.png', alt: 'Portada propuesta: cuatro acciones con nombres claros, visibles sin bajar' },
    was: 'En el celular, la primera pantalla es un bloque vacío y el botón principal queda a media pantalla. Tres de los cuatro botones no dicen lo que hacen: "Gestiona tus Solicitudes", "Sigue estos pasos", "Para editar tus datos debes iniciar sesión".',
    changed: 'Las mismas cuatro acciones, con nombres de persona: enviar una solicitud, ver cómo va, cómo funciona y anular. Todas visibles sin bajar.',
    better: 'La persona encuentra lo que viene a hacer en la primera pantalla, sin adivinar qué hay detrás de cada botón.',
    route: '#/',
  },
  {
    title: 'El aviso de emergencia y el inicio del formulario',
    findings: ['U07', 'U08', 'U33', 'U34'],
    before: { src: 'evidencia/A02-movil-formulario-inicio.png', alt: 'Inicio del formulario actual: un bloque rosado con cinco avisos mezclados' },
    after: { src: 'demo/D02-que-necesita.png', alt: 'Primer paso propuesto: una sola pregunta, barra de avance y el 131 al pie' },
    was: 'Un bloque rosado mezcla cinco avisos. El 131 es el texto menos legible del formulario (12 px, contraste 4,21:1) y no se puede tocar para llamar. El zoom está bloqueado y nada dice cuánto falta.',
    changed: 'El 131 queda fijo al pie de todas las pantallas, legible y con enlace para llamar. Se permite el zoom. Una pregunta por pantalla y una barra de 5 pasos con nombre.',
    better: 'Lo urgente se ve siempre y se puede usar. Quien tiene baja visión puede agrandar la letra, y todos saben cuánto les falta.',
    route: '#/solicitud/1',
  },
  {
    title: 'Elegir qué necesita',
    findings: ['U17', 'U18', 'U19'],
    before: { src: 'evidencia/A13-movil-tipo-prestador.png', alt: 'Menú actual "Tipo Prestador" con la lista de profesiones' },
    after: { src: 'demo/D03-tema-recetas.png', alt: 'Tema "Renovar una receta" en la propuesta, con las categorías explicadas' },
    was: 'Hay que elegir entre 12 profesiones, después el motivo y después la especificidad. Hay que saber cómo se organiza el CESFAM, con nombres como "Control de la Díada" o "MADIS", y no existe "no sé".',
    changed: 'Temas por necesidad ("Renovar una receta", "Exámenes y resultados") que llevan a las mismas categorías, cada una con una línea que la explica. Están también el catálogo completo y "No sé qué elegir".',
    better: 'La persona elige por lo que necesita, no por cómo está organizado el centro. Al CESFAM le llegan exactamente el mismo prestador, motivo y especificidad.',
    route: '#/solicitud/1',
  },
  {
    title: 'Escribir los datos en el celular',
    findings: ['U09', 'U10', 'U15'],
    before: { src: 'evidencia/A03-movil-formulario-contacto-detalle.png', alt: 'Contacto actual: dos teléfonos lado a lado con etiquetas cortadas y botones pequeños' },
    after: { src: 'demo/D04-sus-datos.png', alt: 'Sus datos en la propuesta: campos grandes a todo el ancho' },
    was: 'Ningún campo abre el teclado numérico ni ofrece el autocompletado del celular. Los teléfonos van lado a lado con las etiquetas cortadas, y los botones Celular/Fijo miden 21 px. La fecha no indica formato y aceptó el 31 de febrero.',
    changed: 'Teclado numérico o de correo según el campo, autocompletado, RUN con formato automático y fecha en tres casillas (día, mes y año). Campos a todo el ancho y controles grandes.',
    better: 'Menos tipeo y menos errores en una pantalla pequeña, sobre todo para personas mayores.',
    route: '#/solicitud/1',
  },
  {
    title: 'Cuando algo falta o está mal',
    findings: ['U11'],
    before: { src: 'evidencia/A05-movil-validacion.png', alt: 'Validación actual: el campo Nombre vacío se pone rojo sin mensaje' },
    after: { src: 'demo/D05-errores.png', alt: 'Validación propuesta: un resumen con cada dato por corregir y un mensaje bajo cada campo' },
    was: 'Un campo vacío o mal escrito solo se pone rojo, sin decir qué falta. Un lector de pantalla no anuncia el error.',
    changed: 'Un resumen arriba con cada dato por corregir, que lleva al campo al tocarlo, y un mensaje en texto bajo cada campo ("Escriba el RUN.").',
    better: 'La persona sabe qué corregir y dónde. También funciona para quien no distingue el rojo o usa lector de pantalla.',
    route: '#/solicitud/1',
  },
  {
    title: 'Después de enviar',
    findings: ['U22', 'U23'],
    before: null,
    after: { src: 'demo/D06-enviada.png', alt: 'Solicitud enviada en la propuesta: el código grande con botón Copiar y los pasos siguientes' },
    was: 'Aparecen dos confirmaciones seguidas con un solo botón, "OK". El formulario queda lleno detrás, con ENVIAR disponible, lo que invita a enviar de nuevo. No se explica qué pasará ahora.',
    changed: 'Una confirmación con el mismo código, en grande y con botón para copiar, los pasos siguientes con la información que ya da el sitio y un botón "Ver el estado". El formulario queda limpio.',
    better: 'La persona sabe qué viene y guarda su código. Se reduce el riesgo de solicitudes duplicadas, que según el estudio publicado sobre Telesalud 2021–2024 son la causa principal de los cierres administrativos.',
    route: '#/enviada/DEMO00ING1',
  },
  {
    title: 'Ver cómo va la solicitud',
    findings: ['U24', 'U25'],
    before: { src: 'evidencia/A08-movil-consultar-error.png', alt: 'Consulta actual con un código inexistente: un mensaje genérico' },
    after: { src: 'demo/D07-consultar-error.png', alt: 'Consulta propuesta: el error explica dónde está el código y qué apellido usar' },
    was: 'Si el código o el apellido no coinciden, el mensaje dice solo "No se ha encontrado una solicitud con los datos proporcionados". Los tres estados no explican qué significan.',
    changed: 'Los mismos dos datos, código y apellido. El error dice dónde está el código y que el apellido es el paterno del paciente. Cada estado explica qué significa.',
    better: 'Quien se equivoca puede corregir solo, sin llamar ni ir al CESFAM.',
    route: '#/estado',
  },
  {
    title: 'La ayuda',
    findings: ['U26', 'U32'],
    before: { src: 'evidencia/A07-movil-tutorial.png', alt: 'Tutorial actual: tarjetas que son imágenes con texto' },
    after: { src: 'demo/D08-ayuda.png', alt: 'Ayuda propuesta: preguntas frecuentes en texto' },
    was: 'El tutorial son 6 imágenes con texto adentro, sin texto alternativo. Explica cómo usar el formulario, no qué elegir ni qué pasará. No menciona alternativas a la web.',
    changed: 'Preguntas de persona, en texto: qué pasa después de enviar, si me van a llamar, qué hacer si no sé qué elegir, cómo pedir por otra persona o qué hacer si no puedo usar internet.',
    better: 'Se puede leer, agrandar y escuchar con lector de pantalla, y responde lo que la persona realmente se pregunta.',
    route: '#/ayuda',
  },
];

const SECTIONS = [
  { id: 'momentos', label: 'Antes y después' },
  { id: 'misma-solicitud', label: 'La misma solicitud' },
  { id: 'niveles', label: 'Qué requiere cada mejora' },
  { id: 'real', label: 'Qué es real y qué es simulado' },
];

// El router usa el #, así que la navegación interna se hace con scroll y no con enlaces de ancla.
function jump(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  el.focus({ preventScroll: true });
}

function Shot({ label, shot, tone }: { label: string; shot: Moment['before']; tone: 'before' | 'after' }) {
  return (
    <figure className={`shot ${tone}`}>
      <figcaption>{label}</figcaption>
      {shot ? (
        <a href={shot.src} target="_blank" rel="noreferrer" className="frame">
          <img src={shot.src} alt={shot.alt} loading="lazy" />
        </a>
      ) : (
        <div className="frame empty">
          <p>No incluimos esta captura: la única disponible es de una solicitud real y tiene datos personales.</p>
        </div>
      )}
    </figure>
  );
}

function MomentCard({ m, n }: { m: Moment; n: number }) {
  return (
    <article className="glass moment">
      <header>
        <span className="num">{n}</span>
        <h3>{m.title}</h3>
      </header>
      <div className="pair">
        <Shot label="Hoy" shot={m.before} tone="before" />
        <Shot label="Propuesta" shot={m.after} tone="after" />
      </div>
      <dl>
        <dt>Qué pasaba</dt>
        <dd>{m.was}</dd>
        <dt>Qué cambió</dt>
        <dd>{m.changed}</dd>
        <dt>Por qué es mejor</dt>
        <dd>{m.better}</dd>
      </dl>
      <footer>
        <span className="tag a">A · Solo experiencia</span>
        <span className="small">
          Hallazgos{' '}
          {m.findings.map((f, i) => (
            <span key={f}>
              {i > 0 && ', '}
              <a href={`investigacion-telesalud.html#${f}`}>{f}</a>
            </span>
          ))}
        </span>
        <a className="textlink" href={m.route}>
          Probar esta pantalla
        </a>
      </footer>
    </article>
  );
}

const yesNo = (v: boolean) => (v ? 'Sí' : 'No');
const display = (list: { code: string; display: string }[], code: string) => list.find((x) => x.code === code)?.display ?? '';
const dash = (v: string) => v || '—';

function phoneType(v: string) {
  const k = phoneKind(v);
  return k === 'celular' ? 'Celular' : k === 'fijo' ? 'Fijo' : '—';
}

type Row = [field: string, value: ReactNode, where: string];

function rows(s: Submitted): { section: string; rows: Row[] }[] {
  const d = s.draft;
  const org = orgById(s.ids.orgId);
  const orgCommune = communes.find((c) => c.id === org?.communeId) ?? d.orgCommune;
  const b = d.birth;
  return [
    {
      section: 'Datos del paciente',
      rows: [
        ['Tipo Documento', display(identifierTypes, d.docType), 'Paso 2 · RUN por defecto; "¿No tiene RUN?" para otros'],
        ['N° Documento', d.docNumber, 'Paso 2 · formato automático y dígito verificador'],
        ['Nombre(s)', d.names, 'Paso 2'],
        ['Apellido Paterno', d.lastName1, 'Paso 2'],
        ['Apellido Materno', dash(d.lastName2), 'Paso 2'],
        ['Nombre Social', dash(d.socialName), 'Paso 2 · en "Otros datos (opcionales)"'],
        ['Sexo', sentence(display(sexes, d.sex)), 'Paso 2'],
        ['Género', dash(sentence(display(genders, d.gender))), 'Paso 2 · en "Otros datos (opcionales)"'],
        ['Fecha nacimiento', b.day ? `${b.day.padStart(2, '0')}-${b.month.padStart(2, '0')}-${b.year}` : '—', 'Paso 2 · día, mes y año por separado'],
        ['Cuenta con alguna discapacidad', yesNo(d.disability), 'Paso 2 · con una explicación breve'],
        ['Es cuidador/a de una persona con discapacidad', yesNo(d.caregiver), 'Paso 2'],
      ],
    },
    {
      section: 'Dirección',
      rows: [
        ['Calle', d.street, 'Paso 3'],
        ['Número', d.number, 'Paso 3'],
        ['Block, departamento, población', dash(d.extra), 'Paso 3'],
        ['Región', d.homeCommune ? regionName(d.homeCommune.regionName) : '—', 'Paso 3 · sale de la comuna'],
        ['Comuna', d.homeCommune?.name ?? '—', 'Paso 3 · buscador de comuna'],
      ],
    },
    {
      section: 'Establecimiento',
      rows: [
        ['Región', orgCommune ? regionName(orgCommune.regionName) : '—', 'Paso 3 · se toma de la dirección; se puede cambiar'],
        ['Comuna', orgCommune?.name ?? '—', 'Paso 3 · se toma de la dirección; se puede cambiar'],
        ['Establecimiento', org?.name ?? '—', 'Paso 3 · centros de la comuna, con su dirección'],
      ],
    },
    {
      section: 'Información de contacto',
      rows: [
        ['Celular / Fijo (teléfono 1)', phoneType(d.phone1), 'Paso 4 · se deduce del número'],
        ['Teléfono de contacto 1', d.phone1 ? '+56 ' + formatPhone(d.phone1) : '—', 'Paso 4 · teclado numérico'],
        ['Celular / Fijo (teléfono 2)', phoneType(d.phone2), 'Paso 4 · se deduce del número'],
        ['Teléfono de contacto 2', d.phone2 ? '+56 ' + formatPhone(d.phone2) : '—', 'Paso 4 · "Agregar otro teléfono"'],
        ['Email', dash(d.email), 'Paso 4 · teclado de correo'],
        ['¿Desea recibir seguimiento de sus solicitudes vía email?', yesNo(!!d.email && d.emailUpdates), 'Paso 4'],
      ],
    },
    {
      section: 'Detalle de la solicitud',
      rows: [
        ['Tipo Prestador', d.category?.prestador ?? '—', 'Paso 1 · por tema o catálogo completo'],
        ['Motivo Consulta', d.category?.motivo ?? '—', 'Paso 1'],
        ['Especificidad Consulta', d.category?.especificidad ?? '—', 'Paso 1 · se elige sola si hay una'],
        ['Información Adicional', <q key="info">{d.info}</q>, 'Paso 1 · con guía de qué escribir; máximo 300'],
      ],
    },
  ];
}

function SameRequest() {
  const { sent } = useRequest();
  const own = sent.find((s) => !s.sample && !s.cancelled);
  const s = own ?? SAMPLES[0];
  if (!s) return null;
  return (
    <>
      <p className="sub">
        {own ? (
          <>
            Esta es la última solicitud que usted envió en la demo, en este dispositivo (código <b>{own.code}</b>).
          </>
        ) : (
          <>
            Esta es una solicitud de ejemplo de una persona ficticia. Si envía una en la demo, aquí aparecerá la suya.
          </>
        )}{' '}
        A la izquierda está cada campo del formulario actual, con su nombre exacto; al centro, el valor que se enviaría.
      </p>
      <div className="glass tablewrap">
        <table className="same">
          <thead>
            <tr>
              <th scope="col">Campo del formulario actual</th>
              <th scope="col">Valor que se enviaría</th>
              <th scope="col">Dónde lo pide la demo</th>
            </tr>
          </thead>
          {rows(s).map((g) => (
            <tbody key={g.section}>
              <tr className="sec">
                <th colSpan={3} scope="colgroup">
                  {g.section}
                </th>
              </tr>
              {g.rows.map(([field, value, where], i) => (
                <tr key={g.section + i}>
                  <th scope="row">{field}</th>
                  <td>{value}</td>
                  <td className="where">{where}</td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
      <p className="small">
        Las categorías y el establecimiento se envían con los mismos identificadores del catálogo de Telesalud: prestador{' '}
        {s.ids.providerId}, motivo {s.ids.motiveId}, especificidad {s.ids.detailId} y establecimiento {s.ids.orgId}. El código de
        seguimiento sigue teniendo 10 caracteres y los estados siguen siendo Ingresada, En revisión y Finalizada.
      </p>
    </>
  );
}

export function Compare() {
  return (
    <Page title="Antes y después" heading="Telesalud, más simple para el paciente" className="compare" screenKey="comparacion">
      <p className="lead">
        Una propuesta de rediseño de <a href="https://telesalud.gob.cl">telesalud.gob.cl</a>. Recibe los mismos datos y entrega al CESFAM la
        misma solicitud. No agrega sistemas ni procesos: cambia solo cómo la persona encuentra lo que necesita y completa el formulario.
      </p>
      <p className="small">
        Propuesta independiente de <a href="https://felipe-droguett.netlify.app/">Felipe Droguett O.</a>, desarrollador y usuario de Telesalud. No tiene relación con el
        MINSAL ni con telesalud.gob.cl.
      </p>

      <ul className="same-list">
        <li className="glass"><Icon name="i-doc" /><span><b>Mismos campos y catálogos</b>Los mismos datos, largos máximos e identificadores.</span></li>
        <li className="glass"><Icon name="i-search" /><span><b>Mismo seguimiento</b>El código de 10 caracteres y los tres estados.</span></li>
        <li className="glass"><Icon name="i-users" /><span><b>Mismo triage</b>El equipo del CESFAM revisa y decide, igual que hoy.</span></li>
      </ul>

      <div className="cta">
        <a className="btn primary" href="#/">Probar la demo</a>
        <a className="btn ghost" href="investigacion-telesalud.html">Leer la auditoría (35 hallazgos)</a>
        <a className="btn ghost" href="propuesta-demo.html">Ver el diseño completo</a>
      </div>

      <nav className="glass jump" aria-label="Secciones">
        {SECTIONS.map((s) => (
          <button key={s.id} type="button" className="textlink" onClick={() => jump(s.id)}>
            {s.label}
          </button>
        ))}
      </nav>

      <section className="block">
        <h2 id="momentos" tabIndex={-1}>Antes y después</h2>
        <p className="sub">
          Ocho momentos del recorrido, en un celular. "Hoy" son capturas de telesalud.gob.cl hechas con datos de prueba, sin enviar nada.
          Toque una captura para verla completa.
        </p>
        {MOMENTS.map((m, i) => (
          <MomentCard key={m.title} m={m} n={i + 1} />
        ))}
      </section>

      <section className="block">
        <h2 id="misma-solicitud" tabIndex={-1}>La misma solicitud</h2>
        <SameRequest />
      </section>

      <section className="block">
        <h2 id="niveles" tabIndex={-1}>Qué requiere cada mejora</h2>
        <div className="levels">
          <div className="glass lvl">
            <span className="tag a">A · Solo experiencia</span>
            <p>
              Todo lo que se ve arriba. Se hace cambiando solo la página: textos, orden, diseño, accesibilidad, validaciones y ayuda. El
              rediseño se sostiene completo con este nivel.
            </p>
          </div>
          <div className="glass lvl">
            <span className="tag b">B · Requiere un cambio del MINSAL</span>
            <ul>
              <li>Que "Finalizada" diga qué pasó: hora agendada, resuelta a distancia o anulada.</li>
              <li>Mostrar desde qué número llama cada CESFAM.</li>
              <li>Poder enviar sin categoría, para que el equipo la elija.</li>
              <li>Campos propios para quien pide por otra persona.</li>
              <li>Una página por CESFAM, para que aparezca al buscar el nombre del consultorio.</li>
            </ul>
          </div>
          <div className="glass lvl">
            <span className="tag sim">C · Oportunidad por explorar</span>
            <ul>
              <li>Datos y CESFAM precargados al entrar con ClaveÚnica. En la demo se muestra simulado en el paso 2, porque no sabemos qué datos entrega hoy ClaveÚnica a Telesalud.</li>
              <li>"Mis solicitudes" sin tener que escribir el código.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="block">
        <h2 id="real" tabIndex={-1}>Qué es real y qué es simulado</h2>
        <div className="levels two">
          <div className="glass lvl">
            <h3>Real</h3>
            <ul>
              <li>El catálogo público de Telesalud: 565 centros, 12 prestadores y 69 motivos, descargado el {new Date(catalogDate).toLocaleDateString('es-CL')}.</li>
              <li>Los campos del formulario actual, con sus nombres y largos máximos.</li>
              <li>Los textos sobre qué pasa después, tomados de lo que Telesalud ya informa.</li>
            </ul>
          </div>
          <div className="glass lvl">
            <h3>Simulado</h3>
            <ul>
              <li>El envío: nada sale de este navegador ni llega a Telesalud.</li>
              <li>El código de seguimiento y los estados de las solicitudes de ejemplo.</li>
              <li>ClaveÚnica y las personas, que son ficticias.</li>
            </ul>
          </div>
        </div>
      </section>
    </Page>
  );
}
