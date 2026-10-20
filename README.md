# Telesalud: propuesta de rediseño

Prototipo **no oficial** que muestra cómo la misma función que hoy cumple [telesalud.gob.cl](https://telesalud.gob.cl) puede ser mucho más sencilla para el paciente.

Propuesta independiente de [Felipe Droguett O.](https://felipe-droguett.netlify.app/), desarrollador y usuario de Telesalud. No tiene relación con el MINSAL.

**Recibe los mismos datos y entrega la misma solicitud.** No agrega sistemas, servicios ni capas nuevas: solo mejora la experiencia de quien busca qué pedir y completa el formulario.

- Mismos campos, con los mismos largos máximos y los mismos catálogos (tipo de documento, región, comuna, establecimiento, prestador, motivo, especificidad).
- Mismo código de seguimiento de 10 caracteres, mismos tres estados y mismo triage humano en el CESFAM.
- Cambian el orden, el lenguaje, la ayuda, las validaciones y la accesibilidad.
- No se conecta a Telesalud y no envía nada. Usa datos ficticios de personas; el catálogo es el público de Telesalud.

**Para ver la propuesta, empiece por la comparación "antes y después"** (ruta `#/comparacion` de la demo): ocho momentos del recorrido con la captura del sitio actual junto a la pantalla nueva, y la tabla "la misma solicitud" con cada campo del formulario actual.

## Qué mejora

La [auditoría](docs/investigacion-telesalud.html) del sitio actual encontró 35 problemas. Algunos ejemplos y cómo los resuelve la demo:

| Hoy | En la demo |
| --- | --- |
| El zoom está bloqueado y el aviso de emergencia (131) es el texto menos legible | Zoom permitido; 131 y Salud Responde fijos y legibles, con enlace para llamar |
| 12 prestadores y 69 motivos con nombres internos ("Díada", "MADIS") | Grupos por necesidad que llevan a las mismas categorías, cada una explicada, más "No estoy seguro/a" |
| Campos vacíos en rojo sin decir qué falta; sin teclado numérico ni autocompletado | Mensajes que dicen qué corregir; teclado y autocompletado correctos en el celular |
| Una página larga sin indicar cuánto falta | 5 pasos con nombre y una revisión antes de enviar |
| Confirmación doble, formulario lleno detrás (riesgo de envío duplicado) | Una confirmación, código grande para copiar, "Ver el estado" |
| Estados sin explicación | Los mismos tres estados, cada uno explicado |

Cada mejora está marcada según lo que necesitaría para existir de verdad:

- **A, solo experiencia:** se hace cambiando solo lo que ve el paciente. **El rediseño se sostiene únicamente con mejoras A.**
- **B, requiere un cambio de MINSAL** (por ejemplo, mostrar el resultado de una solicitud finalizada).
- **C, oportunidad por explorar** (por ejemplo, datos precargados con ClaveÚnica). Se muestra simulada.

## Estado

| Fase | Qué incluye | Estado |
| --- | --- | --- |
| 1. Rediseño base (nivel A) | Pantallas S1–S11, catálogo real, validaciones, accesibilidad, borrador guardado | Lista |
| 2. Modo presentación | Antes y después, "la misma solicitud", niveles A/B/C, qué es real y qué es simulado | Lista (`#/comparacion`) |
| 3. Oportunidades y técnica | Mejoras B, simulación C, correspondencia con FHIR | Pendiente (ClaveÚnica simulada ya está en el paso 2) |
| 4. Medir y entregar | Mediciones antes/después, celular real, publicación | Pendiente |

## Ejecutar

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # validaciones y cobertura del catálogo
npm run build      # sitio estático en dist/
```

Para probar "Ver cómo va mi solicitud" y "Anular" sin enviar una solicitud, use los códigos `DEMO00ING1`, `DEMO00REV2` o `DEMO00FIN3` con el apellido `Soto`.

## Cómo está hecho

- Vite + React + TypeScript, sin librerías de interfaz ni servidor. Se publica como sitio estático en GitHub Pages (`.github/workflows/pages.yml`), junto con todo lo que hay en `docs/`.
- Rutas con `#`, para cualquier hosting estático; el botón atrás del navegador retrocede paso a paso.
- El borrador y las solicitudes de la demo se guardan solo en el navegador (`localStorage`).
- `src/data/catalog.json` se genera con `node scripts/catalog.mjs`, que solo hace lecturas (GET) a la API pública que usa el formulario actual.
- `src/data/topics.ts` agrupa las categorías reales en temas de persona y explica cada una en una línea. Una prueba asegura que las 69 categorías aparezcan en algún tema.
- Sin fallas WCAG 2.1 A/AA según axe, y sin desborde a 320 px.

## Lo que mostró el catálogo real (30-09-2026)

- 565 centros activos con Telesalud, 12 prestadores, 69 motivos y 106 especificidades, con los mismos identificadores en todo el país.
- **Cada centro tiene su propio catálogo** (49 variantes). Por ejemplo, Podología y "Sospecha de pie diabético" existen en 79 centros; "Otros" de Medicina General falta en 27. La demo marca "Solo en algunos centros" y avisa si el centro elegido no recibe la categoría.
- Hay nombres con espacios sobrantes o cortados ("Control de salud infantil (rango 5 meses y 3 años") y especificidades repetidas dentro de un mismo motivo en 126 casos. La demo las muestra una vez, sin cambiar el identificador que se enviaría.

## Documentos

| Ruta | Qué es |
| --- | --- |
| `docs/investigacion-telesalud.html` | Auditoría de la experiencia del paciente en el sitio actual (35 hallazgos) |
| `docs/propuesta-demo.html` | Diseño de la demo: pantallas, estados, niveles de cambio (A, B, C) y cobertura de los hallazgos |
| `docs/evidencia/` | Capturas del sitio actual, solo con datos de prueba y sin enviar nada |
| `docs/demo/` | Capturas de la demo usadas en la comparación |

## Licencia y avisos

- El código, los textos y el diseño de este proyecto se publican con licencia [MIT](LICENSE): se pueden usar, copiar y modificar libremente, manteniendo el aviso de autoría.
- El catálogo de establecimientos, prestadores y motivos es información pública de Telesalud, obtenida solo con consultas de lectura a la API que usa su formulario.
- Las capturas de telesalud.gob.cl en `docs/evidencia/` se citan con fines de análisis y crítica, con su fuente. No forman parte de la licencia MIT.
- Telesalud, el Ministerio de Salud y sus nombres y marcas pertenecen a sus titulares. Este proyecto es independiente y no está asociado ni respaldado por ellos.
