import { DraftsMap, EvaluationsMap, EvaluatorSession } from '../types';

export interface StorageStatus {
  isAvailable: boolean;
  errorMessage?: string;
}

const SESSION_KEY_PREFIX = 'bcm_eval_session_';
const EVALS_KEY_PREFIX = 'bcm_eval_saved_';
const DRAFTS_KEY_PREFIX = 'bcm_eval_drafts_';

/**
 * Checks if localStorage is functional.
 */
export function checkLocalStorageAvailable(): StorageStatus {
  try {
    const testKey = '__bcm_storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return { isAvailable: true };
  } catch (err) {
    return {
      isAvailable: false,
      errorMessage:
        err instanceof Error
          ? err.message
          : 'El almacenamiento local (localStorage) está deshabilitado o restringido en este navegador.',
    };
  }
}

/**
 * Loads current evaluator session for an activity.
 */
export function loadSession(actividadId: string): EvaluatorSession | null {
  try {
    const raw = window.localStorage.getItem(`${SESSION_KEY_PREFIX}${actividadId}`);
    if (!raw) return null;
    return JSON.parse(raw) as EvaluatorSession;
  } catch {
    return null;
  }
}

/**
 * Saves current evaluator session for an activity.
 */
export function saveSession(actividadId: string, session: EvaluatorSession | null): boolean {
  try {
    const key = `${SESSION_KEY_PREFIX}${actividadId}`;
    if (!session) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, JSON.stringify(session));
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Generates an isolated key per activity and student evaluator.
 */
function makeStudentKey(prefix: string, actividadId: string, evaluadorId: string): string {
  // Use trimmed and sanitized student ID to avoid accidental collisions
  const cleanEvaluator = evaluadorId.trim().toLowerCase();
  return `${prefix}${actividadId}_${cleanEvaluator}`;
}

/**
 * Loads saved evaluations for a specific student and activity.
 */
export function loadSavedEvaluations(actividadId: string, evaluadorId: string): EvaluationsMap {
  try {
    const key = makeStudentKey(EVALS_KEY_PREFIX, actividadId, evaluadorId);
    const raw = window.localStorage.getItem(key);
    if (!raw) return {};
    return JSON.parse(raw) as EvaluationsMap;
  } catch {
    return {};
  }
}

/**
 * Persists saved evaluations for a specific student and activity.
 */
export function saveEvaluations(
  actividadId: string,
  evaluadorId: string,
  evaluations: EvaluationsMap
): { success: boolean; error?: string } {
  try {
    const key = makeStudentKey(EVALS_KEY_PREFIX, actividadId, evaluadorId);
    window.localStorage.setItem(key, JSON.stringify(evaluations));
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : 'No se pudo guardar en el almacenamiento local. Las evaluaciones se mantienen en memoria.',
    };
  }
}

/**
 * Loads drafts in progress for a specific student and activity.
 */
export function loadDrafts(actividadId: string, evaluadorId: string): DraftsMap {
  try {
    const key = makeStudentKey(DRAFTS_KEY_PREFIX, actividadId, evaluadorId);
    const raw = window.localStorage.getItem(key);
    if (!raw) return {};
    return JSON.parse(raw) as DraftsMap;
  } catch {
    return {};
  }
}

/**
 * Persists drafts in progress for a specific student and activity.
 */
export function saveDrafts(
  actividadId: string,
  evaluadorId: string,
  drafts: DraftsMap
): { success: boolean; error?: string } {
  try {
    const key = makeStudentKey(DRAFTS_KEY_PREFIX, actividadId, evaluadorId);
    window.localStorage.setItem(key, JSON.stringify(drafts));
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'No se pudo guardar el borrador en disco.',
    };
  }
}

/**
 * Clears all data for a specific evaluator in the activity.
 */
export function clearEvaluatorData(actividadId: string, evaluadorId: string): void {
  try {
    window.localStorage.removeItem(makeStudentKey(EVALS_KEY_PREFIX, actividadId, evaluadorId));
    window.localStorage.removeItem(makeStudentKey(DRAFTS_KEY_PREFIX, actividadId, evaluadorId));
    const currentSession = loadSession(actividadId);
    if (currentSession?.codigoEstudiante === evaluadorId) {
      window.localStorage.removeItem(`${SESSION_KEY_PREFIX}${actividadId}`);
    }
  } catch {
    // Ignore removal failures
  }
}

/**
 * Completely resets all data stored for this activity.
 */
export function clearAllActivityData(actividadId: string): void {
  try {
    window.localStorage.removeItem(`${SESSION_KEY_PREFIX}${actividadId}`);
    // Scan and remove any keys starting with prefixes for this activity
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (
        key &&
        (key.startsWith(`${EVALS_KEY_PREFIX}${actividadId}_`) ||
          key.startsWith(`${DRAFTS_KEY_PREFIX}${actividadId}_`))
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // Ignore removal failures
  }
}
