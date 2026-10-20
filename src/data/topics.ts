import { fold } from '../lib/text';

// Formas de navegar el catálogo real. Cada tema lleva a combinaciones reales
// de prestador y motivo; no reemplaza ni cambia la taxonomía de Telesalud.
// Las claves son "Prestador › Motivo", tal como vienen del catálogo.

export const key = (prestador: string, motivo: string) => `${prestador} › ${motivo}`;

export const MG = key('Medicina', 'Atención Medicina General');

const f = (x: string) => fold(x).replace(/\s+/g, ' ');
const INFO_INDEX = new Map<string, string>();

/** Explicación de una categoría, sin importar tildes, mayúsculas ni espacios del catálogo. */
export function infoFor(prestador: string, motivo: string): string | undefined {
  if (!INFO_INDEX.size) for (const [k, v] of Object.entries(MOTIVE_INFO)) INFO_INDEX.set(f(k), v);
  return INFO_INDEX.get(f(key(prestador, motivo)));
}

/** Nombre corto de una especificidad de Medicina General (el catálogo a veces trae "Sintomas" sin tilde). */
export function chipLabel(detail: string): string {
  const hit = Object.entries(MG_CHIPS).find(([k]) => f(k) === f(detail));
  return hit ? hit[1] : detail;
}

/** Una línea que explica cada categoría. Administrativa: qué se pide, no qué se tiene. */
export const MOTIVE_INFO: Record<string, string> = {
  [key('Asistente Social', 'Certificado')]: 'Pedir un certificado del área social.',
  [key('Asistente Social', 'Consulta Social')]: 'Orientación sobre beneficios, redes de apoyo o una situación social.',

  [key('Dental', 'Consulta de Atención Odontológica')]: 'Consulta con el equipo dental.',
  [key('Dental', 'Control Preventivo Odontológico')]: 'Control dental preventivo.',
  [key('Dental', 'Consulta de Tratamiento Odontológico')]: 'Tratamiento con el equipo dental.',
  [key('Dental', 'Control embarazadas')]: 'Control dental durante el embarazo.',
  [key('Dental', 'Control Dental Diabetes')]: 'Control dental para personas con diabetes.',
  [key('Dental', 'Control y tratamiento mayor de 20 años')]: 'Control o tratamiento dental para personas de 20 años o más.',
  [key('Dental', 'Control y tratamiento menor de 19 años')]: 'Control o tratamiento dental para personas de 19 años o menos.',

  [key('Enfermería', 'Control de Salud Infantil')]: 'Control del niño o la niña con enfermería.',
  [key('Enfermería', 'Sospecha de pie diabético')]: 'Para personas con diabetes que notan un problema en los pies.',
  [key('Enfermería', 'Control de Salud del Adolescente (10-19 años)')]: 'Control de salud para adolescentes de 10 a 19 años.',
  [key('Enfermería', 'Reevaluación del Desarrollo Psicomotor')]: 'Nueva evaluación del desarrollo de un niño o niña.',
  [key('Enfermería', 'Control adulto mayor (mayor a 65 años)')]: 'Control de salud para personas mayores de 65 años.',
  [key('Enfermería', 'Consulta de Enfermería')]: 'Consulta con enfermería.',
  [key('Enfermería', 'Control Crónico')]: 'Control con enfermería de una enfermedad que ya está en seguimiento en su CESFAM.',

  [key('Kinesiología', 'Control crónico adulto')]: 'Control con kinesiología para adultos en seguimiento en su CESFAM.',
  [key('Kinesiología', 'Control crónico infanto juvenil')]: 'Control con kinesiología para niños, niñas y jóvenes en seguimiento.',
  [key('Kinesiología', 'Problema respiratorio descompensado')]: 'Para quien está en control por una enfermedad respiratoria y está peor que de costumbre.',
  [key('Kinesiología', 'Atención rehabilitación física')]: 'Rehabilitación física con kinesiología.',
  [key('Kinesiología', 'Entrega de ayudas técnicas (bastón, sillas de rueda, andador, etc)')]: 'Pedir ayudas técnicas, como bastón, andador o silla de ruedas.',

  [key('Matrona', 'Control de la Díada')]: 'Control de la madre junto a su guagua recién nacida.',
  [key('Matrona', 'Control ginecológico (incluye PAP o VPH)')]: 'Control ginecológico, que incluye el examen PAP o VPH.',
  [key('Matrona', 'Método anticonceptivo')]: 'Empezar, cambiar o seguir con un método anticonceptivo.',
  [key('Matrona', 'Revisión de exámenes con matrona')]: 'Revisar con la matrona exámenes que ya se hizo.',
  [key('Matrona', 'Control de Salud del Adolescente (10-19 años)')]: 'Control de salud con matrona para adolescentes de 10 a 19 años.',
  [key('Matrona', 'Consulta de lactancia')]: 'Apoyo con la lactancia.',
  [key('Matrona', 'Consulta Ginecológica')]: 'Consulta ginecológica con matrona.',
  [key('Matrona', 'Control prenatal')]: 'Control del embarazo.',
  [key('Matrona', 'Renovación de receta con Matrona')]: 'Renovar una receta que le dio la matrona.',
  [key('Matrona', 'Solicitud de preservativos (condones)')]: 'Pedir preservativos.',
  [key('Matrona', 'Control preconcepcional')]: 'Control antes de buscar un embarazo.',
  [key('Matrona', 'Exámenes')]: 'Pedir exámenes con matrona.',
  [key('Matrona', 'Sospecha de Embarazo')]: 'Si cree que puede estar embarazada.',
  [key('Matrona', 'Ingreso de Embarazo')]: 'Comenzar los controles de un embarazo.',
  [key('Matrona', 'Climaterio/Menopausia')]: 'Ingreso o control por climaterio o menopausia.',
  [key('Matrona', 'Continuidad de Atención de Urgencia')]: 'Seguimiento con matrona después de una atención en urgencia.',

  [MG]: 'Que un médico o médica evalúe una molestia.',
  [key('Medicina', 'Resultado de exámenes')]: 'Revisar con un médico o médica los resultados de sus exámenes.',
  [key('Medicina', 'Control de salud infantil')]: 'Control del niño o la niña con médico o médica.',
  [key('Medicina', 'Renovación de receta')]: 'Renovar una receta médica que ya tiene.',
  [key('Medicina', 'Estado de Interconsulta')]: 'Saber en qué va una derivación a especialista (interconsulta).',
  [key('Medicina', 'Control Crónico')]: 'Control médico de una enfermedad que ya está en seguimiento en su CESFAM.',
  [key('Medicina', 'Certificado o Informe médico')]: 'Pedir un certificado o informe médico.',
  [key('Medicina', 'Continuidad de Atención de Urgencia')]: 'Seguimiento en su CESFAM después de una atención en urgencia.',

  [key('Nutrición', 'Control embarazadas')]: 'Control de nutrición durante el embarazo.',
  [key('Nutrición', 'Control de salud infantil (rango 5 meses y 3 años')]: 'Control de nutrición para niños y niñas de 5 meses a 3 años y 6 meses.',
  [key('Nutrición', 'Control Crónico')]: 'Control de nutrición de una enfermedad que ya está en seguimiento.',
  [key('Nutrición', 'Clínica de Lactancia')]: 'Apoyo con la lactancia con nutrición.',
  [key('Nutrición', 'Sobrepeso y obesidad')]: 'Atención de nutrición por sobrepeso u obesidad.',
  [key('Nutrición', 'Bajopeso')]: 'Atención de nutrición por bajo peso.',

  [key('Podología', 'Podología preventiva pie diabético')]: 'Cuidado preventivo de los pies para personas con diabetes.',

  [key('Profesionales Chile Crece Contigo', 'Taller prenatal')]: 'Taller para personas embarazadas.',
  [key('Profesionales Chile Crece Contigo', 'Taller de promoción temprana del desarrollo motor')]: 'Taller para apoyar el desarrollo del movimiento en niños y niñas pequeños.',
  [key('Profesionales Chile Crece Contigo', 'Taller de promoción temprana del lenguaje')]: 'Taller para apoyar el desarrollo del lenguaje en niños y niñas pequeños.',
  [key('Profesionales Chile Crece Contigo', 'Taller parental "Nadie Es Perfecto"')]: 'Taller de crianza para madres, padres y personas cuidadoras.',
  [key('Profesionales Chile Crece Contigo', 'Ingreso Sala de Estimulación (MADIS)')]: 'Ingresar a la sala de estimulación para niños y niñas.',
  [key('Profesionales Chile Crece Contigo', 'Sesión de intervención MADIS')]: 'Sesión en la sala de estimulación, si ya participa.',

  [key('Psicología', 'Consulta')]: 'Consulta con psicología.',
  [key('Psicología', 'Control salud mental')]: 'Control de salud mental, si ya está en atención.',
  [key('Psicología', 'Certificado o Informe médico')]: 'Pedir un certificado o informe de psicología.',

  [key('Técnico en enfermería', 'Examen de medicina preventiva del adulto')]: 'Examen de salud preventivo para adultos (EMPA).',
  [key('Técnico en enfermería', 'Curaciones y/o extracciones de puntos')]: 'Curación de una herida o retiro de puntos.',

  [key('Terapia Ocupacional', 'Evaluación de discapacidad')]: 'Evaluación de discapacidad con terapia ocupacional.',
  [key('Terapia Ocupacional', 'Problemas de memoria')]: 'Atención por problemas de memoria.',
  [key('Terapia Ocupacional', 'Atención rehabilitación física')]: 'Rehabilitación física con terapia ocupacional.',
  [key('Terapia Ocupacional', 'Consumo de drogas y alcohol')]: 'Apoyo por consumo de alcohol u otras drogas.',
  [key('Terapia Ocupacional', 'Entrega de ayudas técnicas (bastón, sillas de rueda, andador, etc)')]: 'Pedir ayudas técnicas, como bastón, andador o silla de ruedas.',
};

/** Nombres cortos para las especificidades de Atención Medicina General. */
export const MG_CHIPS: Record<string, string> = {
  'Síntomas respiratorios': 'Respiratoria',
  'Dolor de cabeza': 'Dolor de cabeza',
  'Molestias Digestivas': 'Estómago o digestión',
  'Dolor Muscular o de espalda': 'Espalda o músculos',
  'Dolor articular': 'Articulaciones',
  'Problemas en la piel o mucosas': 'Piel',
  'Molestias Genitales o al orinar': 'Al orinar o genital',
  'Síntomas relacionados al corazón': 'Corazón',
  'Problemas de Salud Mental': 'Ánimo o salud mental',
  'Sangrado rectal': 'Sangrado al ir al baño',
  Otros: 'Otra molestia',
};

export type NotOffered = { title: string; text: string };

export type Topic = {
  id: string;
  icon: string;
  title: string;
  sub?: string;
  main: boolean;
  items: string[];
  notOffered?: NotOffered[];
};

export const TOPICS: Topic[] = [
  {
    id: 'evaluacion',
    icon: 'i-steth',
    title: 'Que me evalúen por una molestia',
    sub: 'El equipo revisa y le contacta',
    main: true,
    items: [
      MG,
      key('Enfermería', 'Consulta de Enfermería'),
      key('Kinesiología', 'Problema respiratorio descompensado'),
      key('Enfermería', 'Sospecha de pie diabético'),
    ],
  },
  {
    id: 'receta',
    icon: 'i-pill',
    title: 'Renovar una receta',
    main: true,
    items: [key('Medicina', 'Renovación de receta'), key('Matrona', 'Renovación de receta con Matrona')],
    notOffered: [
      {
        title: 'Retirar remedios que ya le recetaron',
        text: 'Telesalud no tiene una opción para esto. Consulte en la farmacia de su CESFAM.',
      },
    ],
  },
  {
    id: 'examenes',
    icon: 'i-flask',
    title: 'Exámenes y resultados',
    main: true,
    items: [
      key('Medicina', 'Resultado de exámenes'),
      key('Matrona', 'Revisión de exámenes con matrona'),
      key('Matrona', 'Exámenes'),
      key('Técnico en enfermería', 'Examen de medicina preventiva del adulto'),
      key('Medicina', 'Estado de Interconsulta'),
    ],
  },
  {
    id: 'control',
    icon: 'i-heart',
    title: 'Un control de salud',
    main: true,
    items: [
      key('Medicina', 'Control Crónico'),
      key('Enfermería', 'Control Crónico'),
      key('Nutrición', 'Control Crónico'),
      key('Kinesiología', 'Control crónico adulto'),
      key('Enfermería', 'Control adulto mayor (mayor a 65 años)'),
      key('Dental', 'Control Dental Diabetes'),
      key('Podología', 'Podología preventiva pie diabético'),
      key('Medicina', 'Continuidad de Atención de Urgencia'),
      key('Matrona', 'Continuidad de Atención de Urgencia'),
    ],
  },
  {
    id: 'dientes',
    icon: 'i-tooth',
    title: 'Dientes',
    main: true,
    items: [
      key('Dental', 'Consulta de Atención Odontológica'),
      key('Dental', 'Consulta de Tratamiento Odontológico'),
      key('Dental', 'Control Preventivo Odontológico'),
      key('Dental', 'Control embarazadas'),
      key('Dental', 'Control Dental Diabetes'),
      key('Dental', 'Control y tratamiento menor de 19 años'),
      key('Dental', 'Control y tratamiento mayor de 20 años'),
    ],
  },
  {
    id: 'embarazo',
    icon: 'i-preg',
    title: 'Embarazo y salud sexual',
    sub: 'Embarazo, anticoncepción, control ginecológico, lactancia, menopausia',
    main: false,
    items: [
      key('Matrona', 'Sospecha de Embarazo'),
      key('Matrona', 'Ingreso de Embarazo'),
      key('Matrona', 'Control prenatal'),
      key('Matrona', 'Control preconcepcional'),
      key('Matrona', 'Método anticonceptivo'),
      key('Matrona', 'Control ginecológico (incluye PAP o VPH)'),
      key('Matrona', 'Consulta Ginecológica'),
      key('Matrona', 'Climaterio/Menopausia'),
      key('Matrona', 'Solicitud de preservativos (condones)'),
      key('Matrona', 'Consulta de lactancia'),
      key('Matrona', 'Control de la Díada'),
      key('Nutrición', 'Control embarazadas'),
      key('Nutrición', 'Clínica de Lactancia'),
      key('Dental', 'Control embarazadas'),
      key('Profesionales Chile Crece Contigo', 'Taller prenatal'),
    ],
  },
  {
    id: 'ninos',
    icon: 'i-kid',
    title: 'Niños, niñas y adolescentes',
    sub: 'Controles, desarrollo y talleres',
    main: false,
    items: [
      key('Medicina', 'Control de salud infantil'),
      key('Enfermería', 'Control de Salud Infantil'),
      key('Nutrición', 'Control de salud infantil (rango 5 meses y 3 años'),
      key('Enfermería', 'Reevaluación del Desarrollo Psicomotor'),
      key('Enfermería', 'Control de Salud del Adolescente (10-19 años)'),
      key('Matrona', 'Control de Salud del Adolescente (10-19 años)'),
      key('Kinesiología', 'Control crónico infanto juvenil'),
      key('Profesionales Chile Crece Contigo', 'Taller de promoción temprana del desarrollo motor'),
      key('Profesionales Chile Crece Contigo', 'Taller de promoción temprana del lenguaje'),
      key('Profesionales Chile Crece Contigo', 'Taller parental "Nadie Es Perfecto"'),
      key('Profesionales Chile Crece Contigo', 'Ingreso Sala de Estimulación (MADIS)'),
      key('Profesionales Chile Crece Contigo', 'Sesión de intervención MADIS'),
    ],
  },
  {
    id: 'mental',
    icon: 'i-mind',
    title: 'Salud mental y emocional',
    sub: 'Psicología, memoria, consumo de alcohol o drogas',
    main: false,
    items: [
      key('Psicología', 'Consulta'),
      key('Psicología', 'Control salud mental'),
      key('Terapia Ocupacional', 'Consumo de drogas y alcohol'),
      key('Terapia Ocupacional', 'Problemas de memoria'),
    ],
  },
  {
    id: 'movilidad',
    icon: 'i-walk',
    title: 'Movilidad y rehabilitación',
    sub: 'Rehabilitación, ayudas técnicas, discapacidad',
    main: false,
    items: [
      key('Kinesiología', 'Atención rehabilitación física'),
      key('Terapia Ocupacional', 'Atención rehabilitación física'),
      key('Kinesiología', 'Entrega de ayudas técnicas (bastón, sillas de rueda, andador, etc)'),
      key('Terapia Ocupacional', 'Entrega de ayudas técnicas (bastón, sillas de rueda, andador, etc)'),
      key('Terapia Ocupacional', 'Evaluación de discapacidad'),
    ],
  },
  {
    id: 'peso',
    icon: 'i-apple',
    title: 'Peso y alimentación',
    main: false,
    items: [key('Nutrición', 'Sobrepeso y obesidad'), key('Nutrición', 'Bajopeso')],
  },
  {
    id: 'certificados',
    icon: 'i-doc',
    title: 'Certificados y trámites',
    sub: 'Certificados, informes, orientación social',
    main: false,
    items: [
      key('Medicina', 'Certificado o Informe médico'),
      key('Psicología', 'Certificado o Informe médico'),
      key('Asistente Social', 'Certificado'),
      key('Asistente Social', 'Consulta Social'),
    ],
  },
  {
    id: 'curaciones',
    icon: 'i-band',
    title: 'Curaciones y puntos',
    main: false,
    items: [key('Técnico en enfermería', 'Curaciones y/o extracciones de puntos')],
  },
];
