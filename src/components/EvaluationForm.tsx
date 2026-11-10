import React, { useState } from 'react';
import { Group, ScoreValue } from '../types';
import { CRITERIA_DEFINITIONS, SCORE_OPTIONS } from '../config/activityConfig';
import { MAX_COMMENT_LENGTH, validateEvaluationForm } from '../utils/validation';
import {
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Save,
  AlertCircle,
  HelpCircle as QuestionIcon,
} from 'lucide-react';

interface EvaluationFormProps {
  group: Group;
  evaluatorId: string;
  evaluatorGroup: string;
  initialPregunta: ScoreValue | null;
  initialEvidencia: ScoreValue | null;
  initialDominio: ScoreValue | null;
  initialSistema: ScoreValue | null;
  initialComentario: string;
  isPreviouslySaved: boolean;
  onSave: (data: {
    pregunta: ScoreValue;
    evidencia: ScoreValue;
    dominio: ScoreValue;
    sistema: ScoreValue;
    comentario: string;
  }) => void;
  onDraftChange: (data: {
    pregunta: ScoreValue | null;
    evidencia: ScoreValue | null;
    dominio: ScoreValue | null;
    sistema: ScoreValue | null;
    comentario: string;
  }) => void;
  onCancel: () => void;
}

export const EvaluationForm: React.FC<EvaluationFormProps> = ({
  group,
  initialPregunta,
  initialEvidencia,
  initialDominio,
  initialSistema,
  initialComentario,
  isPreviouslySaved,
  onSave,
  onDraftChange,
  onCancel,
}) => {
  const [pregunta, setPregunta] = useState<ScoreValue | null>(initialPregunta);
  const [evidencia, setEvidencia] = useState<ScoreValue | null>(initialEvidencia);
  const [dominio, setDominio] = useState<ScoreValue | null>(initialDominio);
  const [sistema, setSistema] = useState<ScoreValue | null>(initialSistema);
  const [comentario, setComentario] = useState<string>(initialComentario);
  const [submittedAttempt, setSubmittedAttempt] = useState(false);

  // Sync state up to parent draft
  const updateDraft = (
    nextPregunta: ScoreValue | null,
    nextEvidencia: ScoreValue | null,
    nextDominio: ScoreValue | null,
    nextSistema: ScoreValue | null,
    nextComentario: string
  ) => {
    onDraftChange({
      pregunta: nextPregunta,
      evidencia: nextEvidencia,
      dominio: nextDominio,
      sistema: nextSistema,
      comentario: nextComentario,
    });
  };

  const validation = validateEvaluationForm({
    pregunta,
    evidencia,
    dominio,
    sistema,
    comentario,
  });

  const handleScoreSelect = (
    key: 'pregunta' | 'evidencia' | 'dominio' | 'sistema',
    val: ScoreValue
  ) => {
    let p = pregunta;
    let e = evidencia;
    let d = dominio;
    let s = sistema;

    if (key === 'pregunta') {
      p = val;
      setPregunta(val);
    } else if (key === 'evidencia') {
      e = val;
      setEvidencia(val);
    } else if (key === 'dominio') {
      d = val;
      setDominio(val);
    } else if (key === 'sistema') {
      s = val;
      setSistema(val);
    }

    updateDraft(p, e, d, s, comentario);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextVal = e.target.value;
    if (nextVal.length <= MAX_COMMENT_LENGTH) {
      setComentario(nextVal);
      updateDraft(pregunta, evidencia, dominio, sistema, nextVal);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedAttempt(true);

    if (
      validation.canSave &&
      pregunta !== null &&
      evidencia !== null &&
      dominio !== null &&
      sistema !== null
    ) {
      onSave({
        pregunta,
        evidencia,
        dominio,
        sistema,
        comentario: comentario.trim(),
      });
    }
  };

  const getScoreState = (key: 'pregunta' | 'evidencia' | 'dominio' | 'sistema') => {
    switch (key) {
      case 'pregunta':
        return pregunta;
      case 'evidencia':
        return evidencia;
      case 'dominio':
        return dominio;
      case 'sistema':
        return sistema;
    }
  };

  const remainingChars = MAX_COMMENT_LENGTH - comentario.length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      {/* Top navigation & breadcrumb */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-4">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 border border-neutral-900 bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-900 transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Volver a la lista de grupos</span>
        </button>

        <div className="flex items-center gap-2">
          {isPreviouslySaved ? (
            <span className="inline-flex items-center gap-1.5 border border-neutral-900 bg-neutral-900 px-3 py-1 text-xs font-semibold text-white">
              <CheckCircle2 className="h-3.5 w-3.5 text-white" />
              Evaluación guardada previamente (modo edición)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 border border-dashed border-neutral-400 bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
              Nueva evaluación (borrador local)
            </span>
          )}
        </div>
      </div>

      {/* Evaluated Group Information Card */}
      <section
        className="mb-6 border border-neutral-900 bg-neutral-50 p-4 sm:p-5"
      >
        <div className="flex items-center gap-2">
          <span className="border border-neutral-900 bg-neutral-900 px-2.5 py-0.5 font-mono text-xs font-bold text-white">
            {group.id}
          </span>
          <h2 className="text-lg font-bold text-neutral-900">
            {group.name}
          </h2>
        </div>
        {group.topicOrQuestion && (
          <p className="mt-2 text-sm text-neutral-800">
            “{group.topicOrQuestion}”
          </p>
        )}
      </section>

      {/* Evaluation Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {CRITERIA_DEFINITIONS.map((crit) => {
          const currentScore = getScoreState(crit.key);
          const isAnswered = currentScore !== null;
          const showError = submittedAttempt && !isAnswered;

          return (
            <fieldset
              key={crit.key}
              aria-required="true"
              className={`border p-4 sm:p-5 ${
                showError
                  ? 'border-red-600 bg-red-50/20'
                  : isAnswered
                  ? 'border-neutral-900 bg-white'
                  : 'border-neutral-300 bg-white'
              }`}
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-base font-bold text-neutral-900">{crit.title}</h3>
                  <p className="mt-0.5 text-sm text-neutral-700">{crit.question}</p>
                </div>

                <div className="mt-2 shrink-0 sm:mt-0">
                  {isAnswered ? (
                    <span className="inline-flex items-center gap-1 border border-neutral-900 bg-neutral-100 px-2 py-0.5 text-xs font-bold text-neutral-900">
                      <CheckCircle2 className="h-3.5 w-3.5 text-neutral-900" />
                      {currentScore === 'sin_evaluar' ? 'Sin evaluar' : `Nivel ${currentScore}`}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 border border-dashed border-red-500 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                      <QuestionIcon className="h-3.5 w-3.5" />
                      Pendiente de selección
                    </span>
                  )}
                </div>
              </div>

              {crit.help && (
                <div className="mt-3 flex items-start gap-2 border-l-2 border-neutral-400 bg-neutral-50 p-2.5 text-xs text-neutral-600">
                  <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />
                  <span>{crit.help}</span>
                </div>
              )}

              {/* Options list: wide accessible radio buttons */}
              <div
                role="radiogroup"
                aria-label={crit.title}
                className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-1"
              >
                {SCORE_OPTIONS.map((opt) => {
                  const isSelected = currentScore === opt.value;
                  const isSinEvaluar = opt.value === 'sin_evaluar';

                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => handleScoreSelect(crit.key, opt.value)}
                      className={`group relative flex w-full text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 ${
                        isSelected
                          ? isSinEvaluar
                            ? 'border-2 border-neutral-900 bg-neutral-100 shadow-sm'
                            : 'border-2 border-neutral-900 bg-white ring-1 ring-neutral-900'
                          : 'border border-neutral-300 bg-white hover:border-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {/* Left accent indicator bar */}
                      <div
                        className={`w-2 shrink-0 ${
                          isSelected
                            ? isSinEvaluar
                              ? 'bg-neutral-600'
                              : 'bg-red-600'
                            : 'bg-transparent group-hover:bg-neutral-300'
                        }`}
                        aria-hidden="true"
                      />

                      <div className="flex flex-1 items-center justify-between p-3.5 sm:p-4">
                        <div className="pr-4">
                          <p
                            className={`text-sm font-bold ${
                              isSelected ? 'text-neutral-900' : 'text-neutral-800'
                            }`}
                          >
                            {opt.label}
                          </p>
                          <p className="mt-0.5 text-xs text-neutral-600">{opt.description}</p>
                        </div>

                        {/* Radio circle visual indicator */}
                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                            isSelected
                              ? 'border-neutral-900 bg-neutral-900 text-white'
                              : 'border-neutral-400 bg-white'
                          }`}
                          aria-hidden="true"
                        >
                          {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {showError && (
                <p role="alert" className="mt-3 flex items-center gap-1.5 text-xs font-bold text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  Debes seleccionar una opción explícita para este criterio (o indicar &quot;Sin evaluar&quot;).
                </p>
              )}
            </fieldset>
          );
        })}

        {/* Single Mandatory Comment Field */}
        <div
          className={`border p-5 sm:p-6 ${
            submittedAttempt && validation.commentError
              ? 'border-red-600 bg-red-50/20'
              : 'border-neutral-900 bg-white'
          }`}
        >
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <label htmlFor="eval-comentario" className="text-base font-bold text-neutral-900">
              Comentario evaluativo <span className="text-red-600">*</span>
            </label>
            <span
              className={`font-mono text-xs font-semibold ${
                remainingChars < 50 ? 'text-red-600' : 'text-neutral-500'
              }`}
            >
              {comentario.length} / {MAX_COMMENT_LENGTH} caracteres
            </span>
          </div>

          <p className="mt-1 text-sm font-medium text-neutral-700">
            “Menciona una fortaleza concreta de la exposición y algo que el grupo podría mejorar.”
          </p>

          <div className="mt-3">
            <textarea
              id="eval-comentario"
              name="comentario"
              rows={4}
              value={comentario}
              onChange={handleCommentChange}
              placeholder="Escribe aquí la retroalimentación constructiva y basada en evidencia para el grupo..."
              className={`w-full border p-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 ${
                validation.commentError && submittedAttempt
                  ? 'border-red-600 focus:ring-red-600'
                  : 'border-neutral-900 focus:ring-neutral-900'
              }`}
            />
          </div>

          {submittedAttempt && validation.commentError && (
            <p role="alert" className="mt-2 flex items-center gap-1.5 text-xs font-bold text-red-600">
              <AlertCircle className="h-4 w-4" />
              {validation.commentError}
            </p>
          )}
        </div>

        {/* Form Action Summary & Submit Button */}
        <div className="border-t border-neutral-900 pt-6">
          {submittedAttempt && !validation.canSave && (
            <div
              role="alert"
              className="mb-4 border border-red-600 bg-red-50 p-4 text-xs text-red-900"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <div>
                  <strong className="font-bold">Para guardar la evaluación debes completar:</strong>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4">
                    {validation.missingCriteria.map((c) => (
                      <li key={c}>{c} (selecciona una opción o &quot;Sin evaluar&quot;)</li>
                    ))}
                    {validation.commentError && <li>Comentario válido (no vacío ni de solo espacios)</li>}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={onCancel}
              className="border border-neutral-900 bg-white px-6 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
            >
              Cancelar y volver a la lista
            </button>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 border border-neutral-900 bg-neutral-900 px-8 py-3.5 text-base font-bold text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
            >
              <Save className="h-5 w-5" aria-hidden="true" />
              <span>Guardar evaluación</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
