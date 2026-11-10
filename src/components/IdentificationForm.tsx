import React, { useState } from 'react';
import { Group } from '../types';
import { isValidEmail, isValidFullName, isValidStudentCode } from '../utils/validation';
import { ArrowRight } from 'lucide-react';

interface IdentificationFormProps {
  groups: Group[];
  onSubmit: (datos: {
    codigoEstudiante: string;
    nombreCompleto: string;
    correo: string;
    grupoPropio: string;
  }) => void;
  initialCodigo?: string;
  initialNombre?: string;
  initialCorreo?: string;
  initialGrupo?: string;
}

export const IdentificationForm: React.FC<IdentificationFormProps> = ({
  groups,
  onSubmit,
  initialCodigo = '',
  initialNombre = '',
  initialCorreo = '',
  initialGrupo = '',
}) => {
  const [nombre, setNombre] = useState(initialNombre);
  const [correo, setCorreo] = useState(initialCorreo);
  const [codigo, setCodigo] = useState(initialCodigo);
  const [grupo, setGrupo] = useState(initialGrupo);

  const [errorNombre, setErrorNombre] = useState<string | null>(null);
  const [errorCorreo, setErrorCorreo] = useState<string | null>(null);
  const [errorCodigo, setErrorCodigo] = useState<string | null>(null);
  const [errorGrupo, setErrorGrupo] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    if (!isValidFullName(nombre)) {
      setErrorNombre('Ingresa tu nombre completo.');
      hasError = true;
    } else {
      setErrorNombre(null);
    }

    if (!isValidEmail(correo)) {
      setErrorCorreo('Ingresa un correo electrónico válido.');
      hasError = true;
    } else {
      setErrorCorreo(null);
    }

    if (!isValidStudentCode(codigo)) {
      setErrorCodigo('Ingresa tu código de estudiante o cédula.');
      hasError = true;
    } else {
      setErrorCodigo(null);
    }

    if (!grupo) {
      setErrorGrupo('Selecciona tu grupo.');
      hasError = true;
    } else {
      setErrorGrupo(null);
    }

    if (!hasError) {
      onSubmit({
        codigoEstudiante: codigo.trim(),
        nombreCompleto: nombre.trim(),
        correo: correo.trim().toLowerCase(),
        grupoPropio: grupo,
      });
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="border border-neutral-900 bg-white p-6 sm:p-8">
        <h2 className="text-xl font-bold text-neutral-900">
          Identificación del evaluador
        </h2>
        <p className="mt-1 text-xs text-neutral-600">
          “Tu código quedará registrado en el archivo para que el docente identifique tu entrega.”
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          {/* Nombre Completo */}
          <div>
            <label
              htmlFor="nombre-estudiante"
              className="block text-xs font-bold uppercase tracking-wider text-neutral-700"
            >
              Nombre completo <span className="text-red-600">*</span>
            </label>
            <input
              id="nombre-estudiante"
              name="nombreEstudiante"
              type="text"
              autoComplete="name"
              placeholder="Nombre y apellidos"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                if (errorNombre) setErrorNombre(null);
              }}
              className={`mt-1.5 w-full border px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 ${
                errorNombre
                  ? 'border-red-600 focus:ring-red-600'
                  : 'border-neutral-900 focus:ring-neutral-900'
              }`}
            />
            {errorNombre && (
              <p role="alert" className="mt-1 text-xs font-semibold text-red-600">
                {errorNombre}
              </p>
            )}
          </div>

          {/* Correo Electrónico */}
          <div>
            <label
              htmlFor="correo-estudiante"
              className="block text-xs font-bold uppercase tracking-wider text-neutral-700"
            >
              Correo electrónico <span className="text-red-600">*</span>
            </label>
            <input
              id="correo-estudiante"
              name="correoEstudiante"
              type="email"
              autoComplete="email"
              placeholder="correo@universidad.edu"
              value={correo}
              onChange={(e) => {
                setCorreo(e.target.value);
                if (errorCorreo) setErrorCorreo(null);
              }}
              className={`mt-1.5 w-full border px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 ${
                errorCorreo
                  ? 'border-red-600 focus:ring-red-600'
                  : 'border-neutral-900 focus:ring-neutral-900'
              }`}
            />
            {errorCorreo && (
              <p role="alert" className="mt-1 text-xs font-semibold text-red-600">
                {errorCorreo}
              </p>
            )}
          </div>

          {/* Código o Cédula */}
          <div>
            <label
              htmlFor="codigo-estudiante"
              className="block text-xs font-bold uppercase tracking-wider text-neutral-700"
            >
              Código o cédula <span className="text-red-600">*</span>
            </label>
            <input
              id="codigo-estudiante"
              name="codigoEstudiante"
              type="text"
              autoComplete="off"
              spellCheck="false"
              placeholder="Número de identificación"
              value={codigo}
              onChange={(e) => {
                setCodigo(e.target.value);
                if (errorCodigo) setErrorCodigo(null);
              }}
              className={`mt-1.5 w-full border px-3 py-2 font-mono text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 ${
                errorCodigo
                  ? 'border-red-600 focus:ring-red-600'
                  : 'border-neutral-900 focus:ring-neutral-900'
              }`}
            />
            {errorCodigo && (
              <p role="alert" className="mt-1 text-xs font-semibold text-red-600">
                {errorCodigo}
              </p>
            )}
          </div>

          {/* Grupo propio */}
          <div>
            <label
              htmlFor="grupo-propio"
              className="block text-xs font-bold uppercase tracking-wider text-neutral-700"
            >
              Grupo al que perteneces <span className="text-red-600">*</span>
            </label>
            <select
              id="grupo-propio"
              name="grupoPropio"
              value={grupo}
              onChange={(e) => {
                setGrupo(e.target.value);
                if (errorGrupo) setErrorGrupo(null);
              }}
              className={`mt-1.5 w-full border bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 ${
                errorGrupo
                  ? 'border-red-600 focus:ring-red-600'
                  : 'border-neutral-900 focus:ring-neutral-900'
              }`}
            >
              <option value="">-- Selecciona tu grupo --</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.id}: {g.name}
                </option>
              ))}
            </select>
            {errorGrupo && (
              <p role="alert" className="mt-1 text-xs font-semibold text-red-600">
                {errorGrupo}
              </p>
            )}
          </div>

          {/* Submit button */}
          <div className="pt-3">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 border border-neutral-900 bg-neutral-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
            >
              <span>Comenzar</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
