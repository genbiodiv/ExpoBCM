export type ScoreValue = 1 | 2 | 3 | 4 | 'sin_evaluar';

export type CriterionKey = 'pregunta' | 'evidencia' | 'dominio' | 'sistema';

export interface CriterionDefinition {
  key: CriterionKey;
  title: string;
  question: string;
  help?: string;
}

export interface Group {
  id: string; // Stable identifier, e.g. 'G01', 'G02', ...
  name: string; // e.g. 'Grupo 1'
  topicOrQuestion?: string; // Optional presentation question or title (tema por definir o configurado por el docente)
}

export interface ActivityConfig {
  actividadId: string;
  nombreCurso: string;
  grupos: Group[];
  instruccionEntrega: string;
  enlaceEntrega?: string;
}

export interface EvaluatorSession {
  codigoEstudiante: string; // Código o cédula del estudiante
  nombreCompleto: string; // Nombre completo
  correo: string; // Correo electrónico
  grupoPropio: string; // Group ID, e.g. 'G01'
}

export interface Evaluation {
  actividadId: string;
  evaluadorId: string; // Código o cédula
  nombreEvaluador: string; // Nombre completo
  correoEvaluador: string; // Correo electrónico
  grupoEvaluador: string;
  grupoEvaluado: string;
  pregunta: ScoreValue;
  evidencia: ScoreValue;
  dominio: ScoreValue;
  sistema: ScoreValue;
  comentario: string;
  updatedAt: string;
}

export interface DraftEvaluation {
  pregunta: ScoreValue | null;
  evidencia: ScoreValue | null;
  dominio: ScoreValue | null;
  sistema: ScoreValue | null;
  comentario: string;
  updatedAt: string;
}

export type EvaluationsMap = Record<string, Evaluation>; // Key is grupoEvaluado
export type DraftsMap = Record<string, DraftEvaluation>; // Key is grupoEvaluado
