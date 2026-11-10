import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidStudentCode,
  isValidFullName,
  isValidEmail,
  isExplicitScore,
  isValidComment,
  validateEvaluationForm,
  hasDraftContent,
  MAX_COMMENT_LENGTH,
} from './validation';
import { DraftEvaluation } from '../types';

test('isValidStudentCode preserves leading zeros and rejects empty strings', () => {
  assert.equal(isValidStudentCode('00123456'), true);
  assert.equal(isValidStudentCode('0001'), true);
  assert.equal(isValidStudentCode('1029384756'), true);
  assert.equal(isValidStudentCode('EST-99'), true);
  assert.equal(isValidStudentCode(''), false);
  assert.equal(isValidStudentCode('   '), false);
  assert.equal(isValidStudentCode(null), false);
  assert.equal(isValidStudentCode(undefined), false);
});

test('isValidFullName requires at least 2 characters', () => {
  assert.equal(isValidFullName('Ana Torres'), true);
  assert.equal(isValidFullName('Li'), true);
  assert.equal(isValidFullName('A'), false);
  assert.equal(isValidFullName('   '), false);
  assert.equal(isValidFullName(''), false);
  assert.equal(isValidFullName(null), false);
});

test('isValidEmail validates standard email format', () => {
  assert.equal(isValidEmail('estudiante@universidad.edu'), true);
  assert.equal(isValidEmail('juan.perez@gmail.com'), true);
  assert.equal(isValidEmail('invalido'), false);
  assert.equal(isValidEmail('invalido@'), false);
  assert.equal(isValidEmail('@dominio.com'), false);
  assert.equal(isValidEmail(''), false);
  assert.equal(isValidEmail(null), false);
});

test('isExplicitScore distinguishes valid scores including sin_evaluar from null/undefined', () => {
  assert.equal(isExplicitScore(1), true);
  assert.equal(isExplicitScore(2), true);
  assert.equal(isExplicitScore(3), true);
  assert.equal(isExplicitScore(4), true);
  assert.equal(isExplicitScore('sin_evaluar'), true);

  assert.equal(isExplicitScore(null), false);
  assert.equal(isExplicitScore(undefined), false);
  assert.equal(isExplicitScore(0), false);
  assert.equal(isExplicitScore(5), false);
  assert.equal(isExplicitScore(''), false);
});

test('isValidComment rejects empty or whitespace-only comments and enforces 600 chars limit', () => {
  assert.equal(isValidComment('Buen trabajo.'), true);
  assert.equal(isValidComment('   '), false);
  assert.equal(isValidComment(''), false);
  assert.equal(isValidComment(null), false);

  const exact600 = 'a'.repeat(MAX_COMMENT_LENGTH);
  assert.equal(isValidComment(exact600), true);

  const over600 = 'a'.repeat(MAX_COMMENT_LENGTH + 1);
  assert.equal(isValidComment(over600), false);
});

test('validateEvaluationForm requires all 4 criteria to be answered explicitly and valid comment', () => {
  const incompleteDraft: Partial<DraftEvaluation> = {
    pregunta: 3,
    evidencia: null,
    dominio: 4,
    sistema: 'sin_evaluar',
    comentario: 'Buena sustentación.',
  };

  const incompleteRes = validateEvaluationForm(incompleteDraft);
  assert.equal(incompleteRes.canSave, false);
  assert.deepEqual(incompleteRes.missingCriteria, ['Métodos y evidencia']);
  assert.equal(incompleteRes.commentError, null);

  const completeValidDraft: Partial<DraftEvaluation> = {
    pregunta: 4,
    evidencia: 'sin_evaluar',
    dominio: 2,
    sistema: 'sin_evaluar',
    comentario: 'Fortaleza: diapositivas claras con esquemas celulares. Mejora: profundizar en los controles metodológicos.',
  };

  const completeRes = validateEvaluationForm(completeValidDraft);
  assert.equal(completeRes.canSave, true);
  assert.equal(completeRes.missingCriteria.length, 0);
  assert.equal(completeRes.commentError, null);
});

test('hasDraftContent detects partial selections or draft comments', () => {
  assert.equal(hasDraftContent(null), false);
  assert.equal(hasDraftContent({}), false);
  assert.equal(hasDraftContent({ comentario: '' }), false);
  assert.equal(hasDraftContent({ pregunta: 2 }), true);
  assert.equal(hasDraftContent({ pregunta: 'sin_evaluar' }), true);
  assert.equal(hasDraftContent({ comentario: 'Escribiendo algo...' }), true);
});
