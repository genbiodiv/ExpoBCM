import { DraftEvaluation, ScoreValue } from '../types';

export const MAX_COMMENT_LENGTH = 600;

/**
 * Validates a student code or national ID (cédula):
 * - Must be treated as string to preserve leading zeros (e.g., "001234")
 * - Must not be empty or whitespace-only
 */
export function isValidStudentCode(code: string | null | undefined): boolean {
  if (!code) return false;
  return code.trim().length > 0;
}

/**
 * Validates the student's full name:
 * - Required
 * - Must contain at least 2 characters after trimming
 */
export function isValidFullName(name: string | null | undefined): boolean {
  if (!name) return false;
  return name.trim().length >= 2;
}

/**
 * Validates email format:
 * - Basic standard format check: something@domain.tld
 */
export function isValidEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const trimmed = email.trim();
  // Standard robust email pattern
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(trimmed);
}

/**
 * Validates whether a criterion was explicitly chosen by the user.
 * Explicit valid choices: 1, 2, 3, 4, or 'sin_evaluar'.
 * Unselected (null, undefined, or empty) returns false.
 */
export function isExplicitScore(val: unknown): val is ScoreValue {
  return val === 1 || val === 2 || val === 3 || val === 4 || val === 'sin_evaluar';
}

/**
 * Validates the single evaluation comment:
 * - Required
 * - Cannot be whitespace-only
 * - Maximum length: 600 characters
 */
export function isValidComment(comment: string | null | undefined): boolean {
  if (!comment) return false;
  const trimmed = comment.trim();
  if (trimmed.length === 0) return false;
  if (comment.length > MAX_COMMENT_LENGTH) return false;
  return true;
}

export interface EvaluationFormValidation {
  canSave: boolean;
  missingCriteria: string[];
  commentError: string | null;
}

/**
 * Checks if all required fields are completed to save an evaluation.
 */
export function validateEvaluationForm(draft: Partial<DraftEvaluation> | null | undefined): EvaluationFormValidation {
  const missingCriteria: string[] = [];

  if (!isExplicitScore(draft?.pregunta)) {
    missingCriteria.push('Calidad de la pregunta');
  }
  if (!isExplicitScore(draft?.evidencia)) {
    missingCriteria.push('Métodos y evidencia');
  }
  if (!isExplicitScore(draft?.dominio)) {
    missingCriteria.push('Dominio del tema');
  }
  if (!isExplicitScore(draft?.sistema)) {
    missingCriteria.push('Comprensión del sistema e interés');
  }

  let commentError: string | null = null;
  const comment = draft?.comentario ?? '';
  if (comment.trim().length === 0) {
    commentError = 'El comentario es obligatorio y no puede contener únicamente espacios.';
  } else if (comment.length > MAX_COMMENT_LENGTH) {
    commentError = `El comentario excede el límite máximo de ${MAX_COMMENT_LENGTH} caracteres.`;
  }

  const canSave = missingCriteria.length === 0 && commentError === null;

  return {
    canSave,
    missingCriteria,
    commentError,
  };
}

/**
 * Checks if a draft has any partial work entered (so it can be flagged as a draft in progress).
 */
export function hasDraftContent(draft: Partial<DraftEvaluation> | null | undefined): boolean {
  if (!draft) return false;
  const hasScore =
    isExplicitScore(draft.pregunta) ||
    isExplicitScore(draft.evidencia) ||
    isExplicitScore(draft.dominio) ||
    isExplicitScore(draft.sistema);
  const hasText = typeof draft.comentario === 'string' && draft.comentario.trim().length > 0;
  return hasScore || hasText;
}
