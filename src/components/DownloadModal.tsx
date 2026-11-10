import React from 'react';
import { activityConfig } from '../config/activityConfig';
import {
  Download,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  X,
  FileSpreadsheet,
} from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  step: 'drafts_warning' | 'download_complete';
  pendingDraftCount: number;
  pendingDraftGroupNames: string[];
  savedCount: number;
  filename: string;
  onProceedDownload: () => void;
  onReviewDrafts: () => void;
  onClose: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  step,
  pendingDraftCount,
  pendingDraftGroupNames,
  savedCount,
  filename,
  onProceedDownload,
  onReviewDrafts,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="download-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <div className="w-full max-w-lg border-2 border-neutral-900 bg-white p-6 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between border-b border-neutral-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center border border-neutral-900 bg-neutral-900 text-white">
              <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
            </div>
            <h2 id="download-modal-title" className="text-lg font-bold text-neutral-900">
              {step === 'drafts_warning' ? 'Borradores pendientes detectados' : 'Archivo CSV descargado'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-neutral-500 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === 'drafts_warning' && (
          <div className="mt-4 space-y-4">
            <div className="flex items-start gap-3 border border-amber-500 bg-amber-50 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
              <div className="text-sm text-amber-950">
                <p className="font-bold">
                  Tienes {pendingDraftCount} {pendingDraftCount === 1 ? 'borrador sin guardar' : 'borradores sin guardar'}:
                </p>
                <p className="mt-1 font-medium text-amber-900">
                  {pendingDraftGroupNames.join(', ')}
                </p>
                <p className="mt-2 text-xs">
                  Los borradores que no hayan sido completados y guardados con el botón &quot;Guardar evaluación&quot;{' '}
                  <strong>no se incluirán en el archivo CSV</strong>.
                </p>
              </div>
            </div>

            <p className="text-sm text-neutral-700">
              ¿Deseas volver a revisar tus borradores antes de descargar, o prefieres continuar con la descarga de las{' '}
              <strong>{savedCount} {savedCount === 1 ? 'evaluación guardada' : 'evaluaciones guardadas'}</strong>?
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onReviewDrafts}
                className="w-full border border-neutral-900 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 sm:w-auto"
              >
                Revisar borradores
              </button>
              <button
                type="button"
                onClick={onProceedDownload}
                className="w-full border border-neutral-900 bg-neutral-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 sm:w-auto"
              >
                Descargar solo guardadas ({savedCount})
              </button>
            </div>
          </div>
        )}

        {step === 'download_complete' && (
          <div className="mt-4 space-y-4">
            <div className="border-l-4 border-neutral-900 bg-neutral-50 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-neutral-900" aria-hidden="true" />
                <div className="text-sm text-neutral-900">
                  <p className="font-bold">
                    Se generó y descargó el archivo en tu dispositivo:
                  </p>
                  <p className="mt-1 font-mono text-xs font-semibold text-neutral-700">
                    {filename}
                  </p>
                  <p className="mt-1 text-xs text-neutral-600">
                    Contiene {savedCount} {savedCount === 1 ? 'evaluación guardada' : 'evaluaciones guardadas'}.
                  </p>
                </div>
              </div>
            </div>

            {/* MANDATORY NOTICE AFTER DOWNLOAD */}
            <div className="border border-neutral-900 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-red-600">
                Paso indispensable para completar la entrega:
              </p>
              <p className="mt-2 text-base font-bold text-neutral-900">
                “Ahora sube este CSV al espacio de entrega indicado por el docente. Descargarlo no lo envía automáticamente.”
              </p>
            </div>

            {/* Delivery instructions configured by instructor */}
            {activityConfig.instruccionEntrega && (
              <div className="border border-neutral-200 bg-neutral-50 p-3.5 text-xs text-neutral-800">
                <p className="font-bold text-neutral-900">Instrucción del docente:</p>
                <p className="mt-1 leading-relaxed">{activityConfig.instruccionEntrega}</p>
              </div>
            )}

            {/* Link to external delivery platform if configured */}
            {activityConfig.enlaceEntrega && (
              <div>
                <a
                  href={activityConfig.enlaceEntrega}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 border border-red-600 bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:w-auto"
                >
                  <span>Abrir plataforma de entrega</span>
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-2 border-t border-neutral-200 pt-4 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={onProceedDownload}
                className="inline-flex items-center justify-center gap-1.5 border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Volver a descargar CSV</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="border border-neutral-900 bg-neutral-900 px-5 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
              >
                Entendido, cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
