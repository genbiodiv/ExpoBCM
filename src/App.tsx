import { useState, useEffect, useTransition } from 'react';
import { activityConfig } from './config/activityConfig';
import {
  DraftsMap,
  Evaluation,
  EvaluationsMap,
  EvaluatorSession,
  ScoreValue,
} from './types';
import { Header } from './components/Header';
import { IdentificationForm } from './components/IdentificationForm';
import { GroupList } from './components/GroupList';
import { EvaluationForm } from './components/EvaluationForm';
import { DownloadModal } from './components/DownloadModal';
import { ConfirmModal } from './components/ConfirmModal';
import {
  checkLocalStorageAvailable,
  clearAllActivityData,
  loadDrafts,
  loadSavedEvaluations,
  loadSession,
  saveDrafts,
  saveEvaluations,
  saveSession,
} from './utils/storage';
import { buildEvaluationsCsv, downloadCsvFile, generateCsvFilename } from './utils/csv';
import { hasDraftContent } from './utils/validation';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<EvaluatorSession | null>(null);
  const [savedEvaluations, setSavedEvaluations] = useState<EvaluationsMap>({});
  const [drafts, setDrafts] = useState<DraftsMap>({});
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Modals state
  const [downloadModal, setDownloadModal] = useState<{
    isOpen: boolean;
    step: 'drafts_warning' | 'download_complete';
    filename: string;
  }>({
    isOpen: false,
    step: 'drafts_warning',
    filename: '',
  });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    variant: 'danger' | 'neutral';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: '',
    variant: 'neutral',
    onConfirm: () => {},
  });

  // Check storage and restore session on mount
  useEffect(() => {
    const storageCheck = checkLocalStorageAvailable();
    if (!storageCheck.isAvailable) {
      setStorageWarning(storageCheck.errorMessage ?? 'Almacenamiento no disponible.');
    }

    const existingSession = loadSession(activityConfig.actividadId);
    if (existingSession?.codigoEstudiante && existingSession?.grupoPropio) {
      setSession(existingSession);
      const evals = loadSavedEvaluations(
        activityConfig.actividadId,
        existingSession.codigoEstudiante
      );
      const studentDrafts = loadDrafts(
        activityConfig.actividadId,
        existingSession.codigoEstudiante
      );
      setSavedEvaluations(evals);
      setDrafts(studentDrafts);
    }
  }, []);

  // Show auto-dismiss toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  // Handle identification submission
  const handleStartSession = (datos: {
    codigoEstudiante: string;
    nombreCompleto: string;
    correo: string;
    grupoPropio: string;
  }) => {
    const newSession: EvaluatorSession = {
      codigoEstudiante: datos.codigoEstudiante,
      nombreCompleto: datos.nombreCompleto,
      correo: datos.correo,
      grupoPropio: datos.grupoPropio,
    };
    setSession(newSession);
    saveSession(activityConfig.actividadId, newSession);

    // Load data for this student
    const evals = loadSavedEvaluations(activityConfig.actividadId, datos.codigoEstudiante);
    const studentDrafts = loadDrafts(activityConfig.actividadId, datos.codigoEstudiante);
    setSavedEvaluations(evals);
    setDrafts(studentDrafts);
    setActiveGroupId(null);
    showToast(`Sesión iniciada: ${datos.nombreCompleto} (${datos.codigoEstudiante}).`);
  };

  // Close session without wiping stored student data
  const handleRequestLogout = () => {
    if (!session) return;

    // Check if there are active unsaved drafts for groups that are not saved
    const pendingDraftsCount = activityConfig.grupos.filter(
      (g) =>
        g.id !== session.grupoPropio &&
        !savedEvaluations[g.id] &&
        hasDraftContent(drafts[g.id])
    ).length;

    const performLogout = () => {
      saveSession(activityConfig.actividadId, null);
      setSession(null);
      setActiveGroupId(null);
      setSavedEvaluations({});
      setDrafts({});
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      showToast('Sesión local cerrada.');
    };

    if (pendingDraftsCount > 0) {
      setConfirmModal({
        isOpen: true,
        title: '¿Cerrar sesión local?',
        message: `Tienes ${pendingDraftsCount} borrador(es) sin guardar. Aunque permanecerán en este navegador para tu código (${session.codigoEstudiante}), no se incluirán en ningún CSV hasta que los guardes.`,
        confirmLabel: 'Cerrar sesión',
        variant: 'neutral',
        onConfirm: performLogout,
      });
    } else {
      performLogout();
    }
  };

  // Completely wipe activity data
  const handleRequestResetData = () => {
    setConfirmModal({
      isOpen: true,
      title: '¿Borrar todos los datos de la actividad?',
      message:
        'Esta acción eliminará todas las evaluaciones guardadas y borradores de esta actividad en este navegador. Esta acción es irreversible.',
      confirmLabel: 'Sí, borrar todo',
      variant: 'danger',
      onConfirm: () => {
        clearAllActivityData(activityConfig.actividadId);
        setSession(null);
        setSavedEvaluations({});
        setDrafts({});
        setActiveGroupId(null);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        showToast('Se han eliminado todos los datos locales de la actividad.');
      },
    });
  };

  // Update draft in memory and localStorage
  const handleDraftChange = (
    groupId: string,
    data: {
      pregunta: ScoreValue | null;
      evidencia: ScoreValue | null;
      dominio: ScoreValue | null;
      sistema: ScoreValue | null;
      comentario: string;
    }
  ) => {
    if (!session) return;
    const nextDrafts: DraftsMap = {
      ...drafts,
      [groupId]: {
        ...data,
        updatedAt: new Date().toISOString(),
      },
    };
    setDrafts(nextDrafts);
    saveDrafts(activityConfig.actividadId, session.codigoEstudiante, nextDrafts);
  };

  // Save completed evaluation
  const handleSaveEvaluation = (
    groupId: string,
    data: {
      pregunta: ScoreValue;
      evidencia: ScoreValue;
      dominio: ScoreValue;
      sistema: ScoreValue;
      comentario: string;
    }
  ) => {
    if (!session) return;

    const newEvaluation: Evaluation = {
      actividadId: activityConfig.actividadId,
      evaluadorId: session.codigoEstudiante,
      nombreEvaluador: session.nombreCompleto,
      correoEvaluador: session.correo,
      grupoEvaluador: session.grupoPropio,
      grupoEvaluado: groupId,
      pregunta: data.pregunta,
      evidencia: data.evidencia,
      dominio: data.dominio,
      sistema: data.sistema,
      comentario: data.comentario,
      updatedAt: new Date().toISOString(),
    };

    const nextEvaluations: EvaluationsMap = {
      ...savedEvaluations,
      [groupId]: newEvaluation,
    };

    setSavedEvaluations(nextEvaluations);
    const res = saveEvaluations(
      activityConfig.actividadId,
      session.codigoEstudiante,
      nextEvaluations
    );
    if (!res.success && res.error) {
      setStorageWarning(res.error);
    }

    // Clear draft for this group now that it's formally saved
    const nextDrafts = { ...drafts };
    delete nextDrafts[groupId];
    setDrafts(nextDrafts);
    saveDrafts(activityConfig.actividadId, session.codigoEstudiante, nextDrafts);

    showToast(`Evaluación del ${groupId} guardada con éxito.`);
    setActiveGroupId(null);
  };

  // Trigger CSV export flow
  const handleInitiateDownload = () => {
    if (!session) return;

    const savedList = Object.values(savedEvaluations);
    if (savedList.length === 0) {
      return;
    }

    // Check for pending incomplete drafts among available groups
    const pendingDraftGroups = activityConfig.grupos
      .filter(
        (g) =>
          g.id !== session.grupoPropio &&
          !savedEvaluations[g.id] &&
          hasDraftContent(drafts[g.id])
      )
      .map((g) => `${g.id} (${g.name})`);

    const filename = generateCsvFilename(
      activityConfig.actividadId,
      session.codigoEstudiante
    );

    if (pendingDraftGroups.length > 0) {
      // Show warning modal about pending drafts
      setDownloadModal({
        isOpen: true,
        step: 'drafts_warning',
        filename,
      });
    } else {
      executeDownload(filename);
    }
  };

  const executeDownload = (filename: string) => {
    const savedList = Object.values(savedEvaluations);
    const csvContent = buildEvaluationsCsv(savedList);
    downloadCsvFile(csvContent, filename);

    setDownloadModal({
      isOpen: true,
      step: 'download_complete',
      filename,
    });
  };

  // Find currently active group object
  const activeGroup = activityConfig.grupos.find((g) => g.id === activeGroupId);

  // Inactive groups for draft warning
  const pendingDraftGroups = session
    ? activityConfig.grupos
        .filter(
          (g) =>
            g.id !== session.grupoPropio &&
            !savedEvaluations[g.id] &&
            hasDraftContent(drafts[g.id])
        )
        .map((g) => `${g.id}: ${g.name}`)
    : [];

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans antialiased flex flex-col justify-between">
      <div>
        <Header storageWarning={storageWarning} />

        {/* Global Toast Notification */}
        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-4 right-4 z-50 flex items-center gap-2 border border-neutral-900 bg-neutral-900 px-4 py-3 text-sm font-semibold text-white shadow-lg"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        <main id="main-content">
          {!session ? (
            <IdentificationForm
              groups={activityConfig.grupos}
              onSubmit={handleStartSession}
            />
          ) : activeGroup ? (
            <EvaluationForm
              key={activeGroup.id}
              group={activeGroup}
              evaluatorId={session.codigoEstudiante}
              evaluatorGroup={session.grupoPropio}
              initialPregunta={
                savedEvaluations[activeGroup.id]?.pregunta ??
                drafts[activeGroup.id]?.pregunta ??
                null
              }
              initialEvidencia={
                savedEvaluations[activeGroup.id]?.evidencia ??
                drafts[activeGroup.id]?.evidencia ??
                null
              }
              initialDominio={
                savedEvaluations[activeGroup.id]?.dominio ??
                drafts[activeGroup.id]?.dominio ??
                null
              }
              initialSistema={
                savedEvaluations[activeGroup.id]?.sistema ??
                drafts[activeGroup.id]?.sistema ??
                null
              }
              initialComentario={
                savedEvaluations[activeGroup.id]?.comentario ??
                drafts[activeGroup.id]?.comentario ??
                ''
              }
              isPreviouslySaved={Boolean(savedEvaluations[activeGroup.id])}
              onSave={(data) => handleSaveEvaluation(activeGroup.id, data)}
              onDraftChange={(data) => handleDraftChange(activeGroup.id, data)}
              onCancel={() => {
                startTransition(() => {
                  setActiveGroupId(null);
                });
              }}
            />
          ) : (
            <GroupList
              groups={activityConfig.grupos}
              evaluatorId={session.codigoEstudiante}
              evaluatorName={session.nombreCompleto}
              evaluatorEmail={session.correo}
              evaluatorGroup={session.grupoPropio}
              savedEvaluations={savedEvaluations}
              drafts={drafts}
              onSelectGroupToEvaluate={(groupId) => setActiveGroupId(groupId)}
              onDownloadCsv={handleInitiateDownload}
              onLogout={handleRequestLogout}
              onResetData={handleRequestResetData}
            />
          )}
        </main>
      </div>

      {/* Download and Post-Download Modal */}
      <DownloadModal
        isOpen={downloadModal.isOpen}
        step={downloadModal.step}
        pendingDraftCount={pendingDraftGroups.length}
        pendingDraftGroupNames={pendingDraftGroups}
        savedCount={Object.keys(savedEvaluations).length}
        filename={downloadModal.filename}
        onProceedDownload={() => {
          if (session) {
            const filename = generateCsvFilename(
              activityConfig.actividadId,
              session.codigoEstudiante
            );
            executeDownload(filename);
          }
        }}
        onReviewDrafts={() => {
          setDownloadModal((prev) => ({ ...prev, isOpen: false }));
        }}
        onClose={() => {
          setDownloadModal((prev) => ({ ...prev, isOpen: false }));
        }}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
