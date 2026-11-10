import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildEvaluationsCsv,
  formatScoreForCsv,
  generateCsvFilename,
  preventFormulaInjection,
  escapeCsvCell,
  sanitizeFilenamePart,
  CSV_HEADERS,
} from './csv';
import { Evaluation } from '../types';

test('CSV headers include nombre and correo in correct order', () => {
  const expected = [
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
  ];
  assert.deepEqual([...CSV_HEADERS], expected);
});

test('formatScoreForCsv formats numeric scores and leaves sin_evaluar empty', () => {
  assert.equal(formatScoreForCsv(1), '1');
  assert.equal(formatScoreForCsv(2), '2');
  assert.equal(formatScoreForCsv(3), '3');
  assert.equal(formatScoreForCsv(4), '4');
  assert.equal(formatScoreForCsv('sin_evaluar'), '');
  assert.equal(formatScoreForCsv(null), '');
  assert.equal(formatScoreForCsv(undefined), '');
  // Never 0
  assert.notEqual(formatScoreForCsv('sin_evaluar'), '0');
  assert.notEqual(formatScoreForCsv('sin_evaluar'), 'Sin evaluar');
});

test('preventFormulaInjection prefixes dangerous characters with a single quote', () => {
  assert.equal(preventFormulaInjection('=SUM(A1:A10)'), "'=SUM(A1:A10)");
  assert.equal(preventFormulaInjection('+12345'), "'+12345");
  assert.equal(preventFormulaInjection('-10'), "'-10");
  assert.equal(preventFormulaInjection('@command'), "'@command");
  assert.equal(preventFormulaInjection('\ttabbed'), "'\ttabbed");
  assert.equal(preventFormulaInjection('Normal text'), 'Normal text');
  assert.equal(preventFormulaInjection(''), '');
});

test('escapeCsvCell correctly escapes commas, quotes, and newlines per RFC 4180', () => {
  assert.equal(escapeCsvCell('Hola'), 'Hola');
  assert.equal(escapeCsvCell('Excelente, muy claro'), '"Excelente, muy claro"');
  assert.equal(escapeCsvCell('Dijo: "claro"'), '"Dijo: ""claro"""');
  assert.equal(escapeCsvCell("Linea 1\nLinea 2"), '"Linea 1\nLinea 2"');
  assert.equal(escapeCsvCell('=1+2, prueba'), '"\'=1+2, prueba"');
});

test('sanitizeFilenamePart cleans illegal file characters', () => {
  assert.equal(sanitizeFilenamePart('BCM-EXP-2025/1'), 'BCM-EXP-2025_1');
  assert.equal(sanitizeFilenamePart('001234:estudiante'), '001234_estudiante');
  assert.equal(sanitizeFilenamePart('Grupo 01!'), 'Grupo_01_');
});

test('generateCsvFilename constructs sanitized filename with correct pattern', () => {
  const filename = generateCsvFilename('BCM-EXP-1', '0023412');
  assert.equal(filename, 'evaluaciones_BCM-EXP-1_0023412.csv');
});

test('buildEvaluationsCsv includes UTF-8 BOM, student name/email, sorts stably, and exports correctly', () => {
  const mockEvals: Evaluation[] = [
    {
      actividadId: 'BCM-EXP-1',
      evaluadorId: '009876',
      nombreEvaluador: 'María Gómez Pérez',
      correoEvaluador: 'maria.gomez@universidad.edu',
      grupoEvaluador: 'G01',
      grupoEvaluado: 'G03',
      pregunta: 4,
      evidencia: 'sin_evaluar',
      dominio: 3,
      sistema: 2,
      comentario: 'Buena presentación, faltó profundizar en el control negativo.',
      updatedAt: '2026-11-04T12:00:00Z',
    },
    {
      actividadId: 'BCM-EXP-1',
      evaluadorId: '009876',
      nombreEvaluador: 'María Gómez Pérez',
      correoEvaluador: 'maria.gomez@universidad.edu',
      grupoEvaluador: 'G01',
      grupoEvaluado: 'G02',
      pregunta: 3,
      evidencia: 4,
      dominio: 'sin_evaluar',
      sistema: 4,
      comentario: 'Excelente dominio del tema y gráficos claros.',
      updatedAt: '2026-11-04T12:05:00Z',
    },
  ];

  const csv = buildEvaluationsCsv(mockEvals);

  // Check UTF-8 BOM (\uFEFF)
  assert.ok(csv.startsWith('\uFEFF'));

  // Strip BOM for line checks
  const content = csv.slice(1);
  const lines = content.split('\r\n');

  // Header line
  assert.equal(
    lines[0],
    'actividad_id,evaluador_id,nombre,correo,grupo_evaluador,grupo_evaluado,pregunta,evidencia,dominio,sistema,comentario'
  );

  // First data line should be G02 (sorted before G03)
  assert.ok(lines[1].includes('G02'));
  assert.ok(lines[1].includes('María Gómez Pérez,maria.gomez@universidad.edu,G01,G02,3,4,,4'));

  // Second data line should be G03
  assert.ok(lines[2].includes('G03'));
  assert.ok(lines[2].includes('María Gómez Pérez,maria.gomez@universidad.edu,G01,G03,4,,3,2'));
});
