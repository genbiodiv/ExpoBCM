import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface HeaderProps {
  storageWarning?: string | null;
}

export const Header: React.FC<HeaderProps> = ({ storageWarning }) => {
  return (
    <header className="border-b border-neutral-900 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Evaluación de exposiciones
          </h1>
          <p className="mt-0.5 text-sm font-medium text-neutral-600 sm:text-base">
            Biología Celular y Molecular
          </p>
        </div>

        {/* Initial Instruction */}
        <div className="mt-4 border-l-2 border-red-600 bg-neutral-50 px-4 py-3 text-xs sm:text-sm leading-relaxed text-neutral-800">
          “Evalúa lo que el grupo explicó y sustentó durante su exposición. Usa los mismos
          criterios para todos los grupos. Tu evaluación debe ser respetuosa, independiente y
          basada en evidencia.”
        </div>

        <p className="mt-2 text-[11px] text-neutral-500">
          El progreso se guarda en este navegador y dispositivo. Descarga el CSV para conservar una copia.
        </p>

        {storageWarning && (
          <div
            role="alert"
            className="mt-3 border border-red-600 bg-red-50 p-2.5 text-xs text-red-900"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0 text-red-600" />
              <span>
                <strong>Aviso de almacenamiento:</strong> {storageWarning} Tus datos se conservan
                en memoria mientras mantengas esta pestaña abierta.
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
