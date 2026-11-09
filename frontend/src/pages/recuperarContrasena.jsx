import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function RecuperarContrasena() {
  const [correo, setCorreo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");
    setMensaje("");

    try {
      const response = await api.post("/usuarios/recuperar-contrasena", {
        correo: correo.trim(),
      });
      setMensaje(response.data.message);
    } catch (error) {
      const status = error.response?.status;

      if (!error.response) {
        setError("No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.");
      } else if (status === 422) {
        setError("Ingresa un correo electrónico válido.");
      } else {
        setError("Algo salió mal. Inténtalo de nuevo más tarde.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-white px-4 py-12 text-black">
      <div className="card w-full max-w-md border border-gray-200 bg-white shadow-xl">
        <div className="card-body gap-5 p-6 sm:p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-black">
              Recuperar contraseña
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Ingresa el correo de tu cuenta y te enviaremos un enlace para
              crear una nueva contraseña.
            </p>
          </div>

          {mensaje ? (
            <p role="status" className="rounded-md bg-green-50 p-3 text-sm text-green-700">
              {mensaje}
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
              aria-busy={loading}
            >
              <div className="form-control">
                <label htmlFor="correo" className="label">
                  <span className="label-text font-semibold text-black">
                    Correo electrónico
                  </span>
                </label>

                <input
                  id="correo"
                  type="email"
                  name="correo"
                  placeholder="tu@correo.com"
                  autoComplete="email"
                  value={correo}
                  onChange={(event) => setCorreo(event.target.value)}
                  maxLength={100}
                  disabled={loading}
                  className="input input-bordered w-full border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-[#efb60e] focus:outline-none"
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
                {loading ? "Enviando..." : "Enviar enlace"}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-black">
            ¿Recordaste tu contraseña?{" "}
            <Link
              to="/login"
              className="font-bold text-black underline decoration-[#efb60e] decoration-2 underline-offset-4 hover:text-[#b88b00]"
            >
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
