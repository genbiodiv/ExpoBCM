import { ActivityConfig, CriterionDefinition } from '../types';

/**
 * ============================================================================
 * CONFIGURACIÓN CENTRALIZADA DE LA ACTIVIDAD DOCENTE
 * ============================================================================
 * Modifica este archivo para cambiar:
 * 1. Identificador de la actividad (actividadId)
 * 2. Nombre del curso (nombreCurso)
 * 3. Lista de grupos, sus nombres y títulos o preguntas de investigación (grupos)
 * 4. Instrucción de entrega y enlace opcional al aula virtual (instruccionEntrega, enlaceEntrega)
 * ============================================================================
 */
export const activityConfig: ActivityConfig = {
  // Identificador único y estable de la actividad evaluativa
  actividadId: 'BCM-EXP-2025-1',

  // Nombre oficial del curso universitario
  nombreCurso: 'Biología Celular y Molecular',

  // 10 grupos de ejemplo para reemplazar por los grupos reales del curso.
  // Nota: Los identificadores (id) son estables y alfanuméricos simples (G01 hasta G10).
  grupos: [
    { id: 'G01', name: 'Grupo 1' },
    { id: 'G02', name: 'Grupo 2' },
    { id: 'G03', name: 'Grupo 3' },
    { id: 'G04', name: 'Grupo 4' },
    { id: 'G05', name: 'Grupo 5' },
    { id: 'G06', name: 'Grupo 6' },
    { id: 'G07', name: 'Grupo 7' },
    { id: 'G08', name: 'Grupo 8' },
    { id: 'G09', name: 'Grupo 9' },
    { id: 'G10', name: 'Grupo 10' },
  ],

  // Instrucción clara para cuando el estudiante descargue el archivo CSV
  instruccionEntrega:
    'Sube el archivo CSV descargado en el formulario de entrega de Microsoft Forms habilitado por el docente.',

  // Enlace oficial a la plataforma de entrega del docente
  enlaceEntrega: 'https://forms.cloud.microsoft/r/JdZsgKZAHE',
};

/**
 * Criterios exactos de evaluación requeridos por la pauta del curso.
 */
export const CRITERIA_DEFINITIONS: CriterionDefinition[] = [
  {
    key: 'pregunta',
    title: 'Calidad de la pregunta',
    question:
      '¿El grupo planteó una pregunta clara y pertinente que permite explicar un fenómeno celular o molecular?',
  },
  {
    key: 'evidencia',
    title: 'Métodos y evidencia',
    question:
      '¿El grupo explicó cómo se obtuvo la evidencia y por qué sirve para responder su pregunta?',
    help: 'Valora cómo seleccionaron la evidencia y si comprenden los métodos de los estudios que presentan. No se esperan detalles técnicos avanzados.',
  },
  {
    key: 'dominio',
    title: 'Dominio del tema',
    question:
      '¿El grupo explicó los conceptos con precisión y mostró que comprende las relaciones entre ellos?',
  },
  {
    key: 'sistema',
    title: 'Comprensión del sistema e interés',
    question:
      '¿El grupo hizo interesante el problema al conectar componentes y procesos, y mostrar qué ocurre cuando cambia alguno de ellos?',
    help: 'Valora si la exposición te ayudó a pensar sobre el sistema biológico, más allá de la apariencia de las diapositivas.',
  },
];

export interface ScoreOption {
  value: 1 | 2 | 3 | 4 | 'sin_evaluar';
  label: string;
  description: string;
}

export const SCORE_OPTIONS: ScoreOption[] = [
  {
    value: 1,
    label: '1 — No se logró',
    description: 'Faltó una explicación o hubo confusiones importantes.',
  },
  {
    value: 2,
    label: '2 — Se logró parcialmente',
    description: 'La idea se reconoce, pero quedan vacíos importantes.',
  },
  {
    value: 3,
    label: '3 — Se logró',
    description: 'La explicación fue clara y estuvo suficientemente sustentada.',
  },
  {
    value: 4,
    label: '4 — Se logró muy bien',
    description: 'La explicación fue precisa, conectada y convincente.',
  },
  {
    value: 'sin_evaluar',
    label: 'Sin evaluar',
    description: 'No tengo elementos suficientes para valorar esta categoría.',
  },
];
