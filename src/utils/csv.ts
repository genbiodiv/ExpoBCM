import { Evaluation, ScoreValue } from '../types';

/**
 * Sanitizes a string for safe use in file names.
 * Retains only alphanumeric characters, hyphens, and underscores.
 */
export function sanitizeFilenamePart(part: string): string {
  if (!part) return 'unknown';
  const cleaned = part.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  return cleaned || 'unknown';
}

/**
 * Generates the expected filename for the student's evaluation export.
 * Format: evaluaciones_[actividad_id]_[evaluador_id].csv
 */
export function generateCsvFilename(actividadId: string, evaluadorId: string): string {
  const safeActivity = sanitizeFilenamePart(actividadId);
  const safeEvaluator = sanitizeFilenamePart(evaluadorId);
  return `evaluaciones_${safeActivity}_${safeEvaluator}.csv`;
}

/**
 * Converts a score value (1..4 or 'sin_evaluar') into the CSV numeric representation.
 * - 1, 2, 3, 4 -> string '1', '2', '3', '4'
 * - 'sin_evaluar' -> empty string '' (never 0, never text)
 */
export function formatScoreForCsv(score: ScoreValue | null | undefined): string {
  if (score === 1 || score === 2 || score === 3 || score === 4) {
    return String(score);
  }
  return '';
}

/**
 * Neutralizes potential spreadsheet formula injection (CSV Injection).
 * If a text field begins with =, +, -, @, \t, or \r, prefix with a single quote.
 */
export function preventFormulaInjection(value: string): string {
  if (!value) return '';
  const dangerousChars = ['=', '+', '-', '@', '\t', '\r'];
  if (dangerousChars.includes(value.charAt(0))) {
    return `'${value}`;
  }
  return value;
}

/**
 * Escapes a cell value according to RFC 4180 standards:
 * - Replaces any internal double quote " with ""
 * - Wraps in double quotes if it contains commas, newlines, quotes, or starts with a quote/space.
 */
export function escapeCsvCell(raw: string): string {
  const safeText = preventFormulaInjection(raw);
  const needsQuotes =
    safeText.includes(',') ||
    safeText.includes('"') ||
    safeText.includes('\n') ||
    safeText.includes('\r') ||
    safeText.startsWith(' ') ||
    safeText.endsWith(' ');

  if (!needsQuotes) {
    return safeText;
  }

  // RFC 4180: double quotes within a field must be escaped by preceding them with another double quote
  const escaped = safeText.replace(/"/g, '""');
  return `"${escaped}"`;
}

export const CSV_HEADERS = [
  'actividad_id',
  'evaluador_id',
  'nombre',
  'correo',
  'grupo_evaluador',
  'grupo_evaluado',
  'pregunta',
  'evidencia',
  'dominio',
  'sistema',
  'comentario',
] as const;

/**
 * Builds the complete CSV string for saved evaluations.
 * - Sorts evaluations stably by grupo_evaluado.
 * - Includes UTF-8 BOM (\uFEFF) at the start for native Excel compatibility with tildes and eñes.
 */
export function buildEvaluationsCsv(evaluations: Evaluation[]): string {
  // Stable sort by grupo_evaluado
  const sorted = [...evaluations].sort((a, b) =>
    a.grupoEvaluado.localeCompare(b.grupoEvaluado, 'es', { numeric: true })
  );

  const headerLine = CSV_HEADERS.join(',');

  const rows = sorted.map((item) => {
    const cells = [
      escapeCsvCell(item.actividadId),
      escapeCsvCell(item.evaluadorId),
      escapeCsvCell(item.nombreEvaluador || ''),
      escapeCsvCell(item.correoEvaluador || ''),
      escapeCsvCell(item.grupoEvaluador),
      escapeCsvCell(item.grupoEvaluado),
      formatScoreForCsv(item.pregunta),
      formatScoreForCsv(item.evidencia),
      formatScoreForCsv(item.dominio),
      formatScoreForCsv(item.sistema),
      escapeCsvCell(item.comentario),
    ];
    return cells.join(',');
  });

  const body = [headerLine, ...rows].join('\r\n');

  // Prepend UTF-8 BOM (\uFEFF)
  return `\uFEFF${body}`;
}

/**
 * Triggers a browser download of the generated CSV file.
 */
export function downloadCsvFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
