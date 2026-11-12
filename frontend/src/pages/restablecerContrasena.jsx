import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

const MIN_LONGITUD = 8;

function obtenerMensajeError(error) {
  if (!error.response) {
    return "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";
  }

  const { status, data } = error.response;

  if (status === 400 && typeof data?.detail === "string") {
    return data.detail;
  }

  if (status === 422) {
    return `La contraseña debe tener al menos ${MIN_LONGITUD} caracteres.`;
  }

  return "No se pudo restablecer la contraseña. Inténtalo de nuevo más tarde.";
}

export default function RestablecerContrasena() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [contrasena, setContrasena] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setError("");

    if (contrasena.length < MIN_LONGITUD) {
      setError(`La contraseña debe tener al menos ${MIN_LONGITUD} caracteres.`);
      return;
    }

    if (contrasena !== confirmacion) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/usuarios/restablecer-contrasena", {
        token,
        nueva_contrasena: contrasena,
      });
      setExito(true);
      setTimeout(() => navigate("/login", { replace: true }), 2500);
    } catch (error) {
      setError(obtenerMensajeError(error));
    } finally {
      setLoading(false);
    }
  }

  const linkClass =
    "font-bold text-black underline decoration-[#efb60e] decoration-2 underline-offset-4 hover:text-[#b88b00]";
  const inputClass =
    "input input-bordered w-full border-gray-300 bg-white pr-20 text-black placeholder:text-gray-400 focus:border-[#efb60e] focus:outline-none";

  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-white px-4 py-12 text-black">
      <div className="card w-full max-w-md border border-gray-200 bg-white shadow-xl">
        <div className="card-body gap-5 p-6 sm:p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-black">
              Nueva contraseña
            </h1>
          </div>

          {!token ? (
            <p role="alert" className="text-center text-sm text-red-600">
              El enlace no es válido.{" "}
              <Link to="/recuperar-contrasena" className={linkClass}>
                Solicita uno nuevo
              </Link>
            </p>
          ) : exito ? (
            <p role="status" className="rounded-md bg-green-50 p-3 text-sm text-green-700">
              Tu contraseña se cambió correctamente. Te llevaremos al inicio de
              sesión...
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
              aria-busy={loading}
            >
              <div className="form-control">
                <label htmlFor="contrasena" className="label">
                  <span className="label-text font-semibold text-black">
                    Nueva contraseña
                  </span>
                </label>

                <div className="relative">
                  <input
                    id="contrasena"
                    type={showPassword ? "text" : "password"}
                    name="contrasena"
                    placeholder={`Mínimo ${MIN_LONGITUD} caracteres`}
                    autoComplete="new-password"
                    value={contrasena}
                    onChange={(event) => setContrasena(event.target.value)}
                    disabled={loading}
                    className={inputClass}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-black hover:text-[#b88b00]"
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    aria-pressed={showPassword}
                  >
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </div>

              <div className="form-control">
                <label htmlFor="confirmacion" className="label">
                  <span className="label-text font-semibold text-black">
                    Confirmar contraseña
                  </span>
                </label>

                <input
                  id="confirmacion"
                  type={showPassword ? "text" : "password"}
                  name="confirmacion"
                  placeholder="Repite tu contraseña"
                  autoComplete="new-password"
                  value={confirmacion}
                  onChange={(event) => setConfirmacion(event.target.value)}
                  disabled={loading}
                  className={inputClass}
                  required
                />
              </div>

              {error && (
                <p role="alert" className="text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn mt-2 w-full border-[#efb60e] bg-[#efb60e] text-black hover:border-[#d9a40b] hover:bg-[#d9a40b] disabled:opacity-60"
              >
                {loading ? "Guardando..." : "Cambiar contraseña"}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-black">
            <Link to="/login" className={linkClass}>
              Volver a iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
