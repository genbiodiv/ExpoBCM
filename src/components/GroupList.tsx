import React, { useState } from 'react';
import { DraftsMap, EvaluationsMap, Group, ScoreValue } from '../types';
import { hasDraftContent } from '../utils/validation';
import { activityConfig } from '../config/activityConfig';
import {
  CheckCircle2,
  Clock,
  Download,
  Edit3,
  ExternalLink,
  LogOut,
  PlusCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  Table,
} from 'lucide-react';

interface GroupListProps {
  groups: Group[];
  evaluatorId: string;
  evaluatorName?: string;
  evaluatorEmail?: string;
  evaluatorGroup: string;
  savedEvaluations: EvaluationsMap;
  drafts: DraftsMap;
  onSelectGroupToEvaluate: (groupId: string) => void;
  onDownloadCsv: () => void;
  onLogout: () => void;
  onResetData: () => void;
}

export const GroupList: React.FC<GroupListProps> = ({
  groups,
  evaluatorId,
  evaluatorName,
  evaluatorEmail,
  evaluatorGroup,
  savedEvaluations,
  drafts,
  onSelectGroupToEvaluate,
  onDownloadCsv,
  onLogout,
  onResetData,
}) => {
  const [expandedSummaryGroupId, setExpandedSummaryGroupId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'cards' | 'summary'>('cards');

  // Filter out the student's own group!
  const availableGroups = groups.filter((g) => g.id !== evaluatorGroup);

  const savedCount = Object.keys(savedEvaluations).length;
  const totalAvailable = availableGroups.length;

  const formatScoreBadge = (score: ScoreValue | null | undefined) => {
    if (score === 'sin_evaluar') {
      return (
        <span className="border border-neutral-300 bg-neutral-100 px-1.5 py-0.5 text-[11px] font-mono text-neutral-600">
          Sin evaluar
        </span>
      );
    }
    if (score) {
      return (
        <span className="border border-neutral-900 bg-neutral-900 px-1.5 py-0.5 text-[11px] font-mono font-bold text-white">
          {score}/4
        </span>
      );
    }
    return <span className="text-neutral-400">—</span>;
  };

  const getScoreLabel = (score: ScoreValue | null | undefined) => {
    if (score === 'sin_evaluar') return 'Sin evaluar';
    if (score === 1) return '1 (No se logró)';
    if (score === 2) return '2 (Parcial)';
    if (score === 3) return '3 (Se logró)';
    if (score === 4) return '4 (Muy bien)';
    return '—';
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      {/* Top Session & Action Bar */}
      <section
        aria-label="Información del evaluador y acciones"
        className="mb-8 border border-neutral-900 bg-white p-5 shadow-sm"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="border border-neutral-900 bg-neutral-900 px-3 py-1 font-mono text-xs font-bold text-white">
              CÓDIGO/CÉDULA: {evaluatorId}
            </div>
            {evaluatorName && (
              <div className="border border-neutral-300 bg-neutral-50 px-3 py-1 text-xs font-bold text-neutral-900">
                {evaluatorName}
              </div>
            )}
            {evaluatorEmail && (
              <div className="border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs text-neutral-600">
                {evaluatorEmail}
              </div>
            )}
            <div className="border border-neutral-300 bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-800">
              GRUPO PROPIO:{' '}
              <span className="font-bold text-neutral-900">
                {evaluatorGroup} (excluido)
              </span>
            </div>
            <div className="text-xs text-neutral-600">
              Evaluadas:{' '}
              <strong className="text-neutral-900">
                {savedCount} de {totalAvailable}
              </strong>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Prominent Download Button */}
            <button
              type="button"
              onClick={onDownloadCsv}
              disabled={savedCount === 0}
              className={`inline-flex items-center gap-2 border px-4 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 ${
                savedCount > 0
                  ? 'border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800 focus-visible:ring-neutral-900'
                  : 'cursor-not-allowed border-neutral-300 bg-neutral-100 text-neutral-400'
              }`}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>
                Descargar mis evaluaciones {savedCount > 0 && `(${savedCount})`}
              </span>
            </button>

            {activityConfig.enlaceEntrega && (
              <a
                href={activityConfig.enlaceEntrega}
                target="_blank"
                rel="noopener noreferrer"
                title="Abrir formulario de entrega en Microsoft Forms"
                className="inline-flex items-center gap-1.5 border border-red-600 bg-white px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Formulario de entrega</span>
              </a>
            )}

            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Cerrar sesión</span>
            </button>

            <button
              type="button"
              onClick={onResetData}
              title="Borrar datos locales"
              className="inline-flex items-center gap-1.5 border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:border-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Borrar datos</span>
            </button>
          </div>
        </div>
      </section>

      {/* View Switcher: Cards vs Table Summary */}
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">
            Exposiciones para evaluar
          </h2>
        </div>

        {savedCount > 0 && (
          <div className="flex border border-neutral-900 bg-white p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 ${
                activeTab === 'cards'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <FileCheck2 className="h-3.5 w-3.5" />
              <span>Lista de grupos</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-1.5 px-3 py-1.5 ${
                activeTab === 'summary'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <Table className="h-3.5 w-3.5" />
              <span>Resumen ({savedCount})</span>
            </button>
          </div>
        )}
      </div>

      {/* Summary Table View */}
      {activeTab === 'summary' && savedCount > 0 ? (
        <section aria-label="Resumen de evaluaciones guardadas" className="mb-8 overflow-hidden border border-neutral-900 bg-white">
          <div className="border-b border-neutral-900 bg-neutral-100 p-4">
            <h3 className="font-bold text-neutral-900">
              Resumen de tus evaluaciones guardadas ({savedCount})
            </h3>
            <p className="text-xs text-neutral-600">
              Estas son las filas que se incluirán en el archivo CSV ordenadas por grupo.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-900 bg-neutral-50 font-bold uppercase tracking-wider text-neutral-700">
                <tr>
                  <th className="px-3 py-2.5">Grupo</th>
                  <th className="px-3 py-2.5">Pregunta</th>
                  <th className="px-3 py-2.5">Evidencia</th>
                  <th className="px-3 py-2.5">Dominio</th>
                  <th className="px-3 py-2.5">Sistema</th>
                  <th className="px-3 py-2.5">Comentario</th>
                  <th className="px-3 py-2.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {availableGroups
                  .filter((g) => savedEvaluations[g.id])
                  .map((g) => {
                    const ev = savedEvaluations[g.id];
                    return (
                      <tr key={g.id} className="hover:bg-neutral-50">
                        <td className="whitespace-nowrap px-3 py-3 font-mono font-bold text-neutral-900">
                          {g.id}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          {formatScoreBadge(ev.pregunta)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          {formatScoreBadge(ev.evidencia)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          {formatScoreBadge(ev.dominio)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          {formatScoreBadge(ev.sistema)}
                        </td>
                        <td className="max-w-xs truncate px-3 py-3 text-neutral-700" title={ev.comentario}>
                          {ev.comentario}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => onSelectGroupToEvaluate(g.id)}
                            className="font-bold text-neutral-900 underline hover:text-red-600"
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {/* Cards List */}
      <div className="space-y-4">
        {availableGroups.map((group) => {
          const isSaved = Boolean(savedEvaluations[group.id]);
          const currentDraft = drafts[group.id];
          const hasDraft = !isSaved && hasDraftContent(currentDraft);
          const savedData = savedEvaluations[group.id];
          const isExpanded = expandedSummaryGroupId === group.id;

          return (
            <article
              key={group.id}
              className={`border transition ${
                isSaved
                  ? 'border-neutral-900 bg-white'
                  : hasDraft
                  ? 'border-amber-500 bg-white'
                  : 'border-neutral-300 bg-white hover:border-neutral-500'
              }`}
            >
              <div className="p-5 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="border border-neutral-900 bg-neutral-900 px-2.5 py-0.5 font-mono text-xs font-bold text-white">
                        {group.id}
                      </span>
                      <h3 className="text-lg font-bold text-neutral-900">{group.name}</h3>

                      {/* Status Badges */}
                      {isSaved && (
                        <span className="inline-flex items-center gap-1 border border-neutral-900 bg-neutral-900 px-2 py-0.5 text-xs font-semibold text-white">
                          <CheckCircle2 className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                          <span>Guardada</span>
                        </span>
                      )}

                      {hasDraft && (
                        <span className="inline-flex items-center gap-1 border border-amber-600 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
                          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Borrador en curso</span>
                        </span>
                      )}

                      {!isSaved && !hasDraft && (
                        <span className="inline-flex items-center gap-1 border border-dashed border-neutral-400 bg-neutral-50 px-2 py-0.5 text-xs font-medium text-neutral-600">
                          <span>Pendiente</span>
                        </span>
                      )}
                    </div>

                    {group.topicOrQuestion && (
                      <p className="mt-1.5 text-sm text-neutral-800">
                        “{group.topicOrQuestion}”
                      </p>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="flex shrink-0 items-center gap-2 pt-2 sm:pt-0">
                    {isSaved ? (
                      <button
                        type="button"
                        onClick={() => onSelectGroupToEvaluate(group.id)}
                        className="inline-flex w-full items-center justify-center gap-1.5 border border-neutral-900 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-900 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 sm:w-auto"
                      >
                        <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Revisar / Editar</span>
                      </button>
                    ) : hasDraft ? (
                      <button
                        type="button"
                        onClick={() => onSelectGroupToEvaluate(group.id)}
                        className="inline-flex w-full items-center justify-center gap-1.5 border border-amber-700 bg-amber-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-900 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 sm:w-auto"
                      >
                        <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Continuar borrador</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSelectGroupToEvaluate(group.id)}
                        className="inline-flex w-full items-center justify-center gap-1.5 border border-neutral-900 bg-neutral-900 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 sm:w-auto"
                      >
                        <PlusCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Evaluar grupo</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Collapsible summary for saved evaluation */}
                {isSaved && savedData && (
                  <div className="mt-4 border-t border-neutral-200 pt-3">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedSummaryGroupId(isExpanded ? null : group.id)
                      }
                      className="flex items-center gap-1 text-xs font-semibold text-neutral-600 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                    >
                      <span>
                        {isExpanded
                          ? 'Ocultar resumen de evaluación'
                          : 'Ver resumen de evaluación guardada'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 border border-neutral-200 bg-neutral-50 p-4">
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <div>
                            <span className="block text-[11px] font-bold text-neutral-500 uppercase">
                              Pregunta
                            </span>
                            <span className="text-xs font-bold text-neutral-900">
                              {getScoreLabel(savedData.pregunta)}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[11px] font-bold text-neutral-500 uppercase">
                              Evidencia
                            </span>
                            <span className="text-xs font-bold text-neutral-900">
                              {getScoreLabel(savedData.evidencia)}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[11px] font-bold text-neutral-500 uppercase">
                              Dominio
                            </span>
                            <span className="text-xs font-bold text-neutral-900">
                              {getScoreLabel(savedData.dominio)}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[11px] font-bold text-neutral-500 uppercase">
                              Sistema
                            </span>
                            <span className="text-xs font-bold text-neutral-900">
                              {getScoreLabel(savedData.sistema)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 border-t border-neutral-200 pt-2">
                          <span className="block text-[11px] font-bold text-neutral-500 uppercase">
                            Comentario registrado:
                          </span>
                          <p className="mt-1 text-xs italic text-neutral-800">
                            &quot;{savedData.comentario}&quot;
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
