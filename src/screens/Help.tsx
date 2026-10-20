import type { ReactNode } from 'react';
import { Icon } from '../components/Icons';
import { Page } from '../components/Layout';
import { REVIEW_HOURS, STATUS } from '../data/content';

function Q({ q, children, open }: { q: string; children: ReactNode; open?: boolean }) {
  return (
    <details open={open}>
      <summary>
        {q}
        <Icon name="i-chev" />
      </summary>
      <div className="a">{children}</div>
    </details>
  );
}

export function Help() {
  return (
    <Page title="Cómo funciona" back="/" backLabel="Inicio" screenKey="ayuda">
      <p className="sub">Respuestas cortas a las dudas más comunes.</p>

      <div className="glass faq">
        <Q q="¿Para qué sirve Telesalud?" open>
          <p>
            Para <b>enviar una solicitud a su CESFAM</b> sin tener que ir. Puede ser por una molestia, una receta, un examen,
            un control u otro tema.
          </p>
          <p>
            No es una atención inmediata: el equipo de su CESFAM revisa cada solicitud y decide cómo responder.
          </p>
        </Q>
        <Q q="¿Qué pasa después de enviar?">
          <ul>
            <li>El equipo de su CESFAM revisa su solicitud. {REVIEW_HOURS}</li>
            <li>Le contactan por teléfono o correo. La respuesta puede ser una hora de atención o una solución a distancia.</li>
            <li>No vaya al CESFAM por esta solicitud hasta que le contacten.</li>
          </ul>
        </Q>
        <Q q="¿Me van a llamar?">
          <p>
            Sí, el equipo puede llamarle. <b>Conteste aunque no conozca el número</b>: puede ser su CESFAM.
          </p>
        </Q>
        <Q q="No sé qué elegir">
          <p>Hoy la solicitud necesita una categoría. Si no sabe cuál elegir:</p>
          <ul>
            <li>Revise la lista completa: cada categoría tiene una explicación corta.</li>
            <li>Si su caso es por una molestia, elija "Que me evalúen por una molestia".</li>
            <li>También puede preguntar en su CESFAM.</li>
          </ul>
          <p>El equipo que revisa su solicitud lee lo que usted escribe con sus palabras.</p>
        </Q>
        <Q q="¿Puedo hacer la solicitud por otra persona?">
          <p>
            Sí. Elija "Para otra persona" y escriba <b>los datos de la persona que se atenderá</b>. El teléfono de contacto
            puede ser el suyo, si usted la está ayudando.
          </p>
        </Q>
        <Q q="No sé en qué CESFAM estoy inscrito/a">
          <p>Pregunte en el centro de salud más cercano a su casa. Si no está inscrito/a, ahí le dirán cómo inscribirse.</p>
        </Q>
        <Q q="¿Qué significan los estados de mi solicitud?">
          <ul>
            {STATUS.map((s) => (
              <li key={s.id}>
                <b>{s.name}:</b> {s.text}
              </li>
            ))}
          </ul>
        </Q>
        <Q q="No puedo o no sé usar internet">
          <p>Puede pedirle a una persona de confianza que le ayude a enviar la solicitud. También puede preguntar en su CESFAM otras formas de hacerla.</p>
        </Q>
        <Q q="¿Y si es una emergencia?">
          <p>
            Telesalud no es para emergencias. Llame al <a href="tel:131">131</a> o vaya al servicio de urgencia más cercano.
          </p>
          <p>
            Para orientación en salud, llame a Salud Responde: <a href="tel:6003607777">600 360 7777</a>.
          </p>
        </Q>
      </div>

      <h2>Sobre esta demo</h2>
      <div className="glass faq">
        <Q q="¿Qué es real y qué es simulado?">
          <ul>
            <li>
              <b>Real:</b> las categorías, las regiones, comunas y centros de salud vienen del catálogo público de
              Telesalud.
            </li>
            <li>
              <b>Simulado:</b> los datos de las personas son ficticios, nada se envía a Telesalud ni a su CESFAM, el código
              de seguimiento es inventado y el ingreso con ClaveÚnica es una simulación.
            </li>
            <li>Lo que escribe queda guardado solo en este dispositivo.</li>
          </ul>
        </Q>
      </div>
    </Page>
  );
}
