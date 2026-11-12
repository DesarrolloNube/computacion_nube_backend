import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const fieldLabels = {
  primer_nombre: "Nombre",
  apellido: "Apellido",
  usuario: "Nombre de usuario",
  correo: "Correo electrónico",
  contrasena: "Contraseña",
};

function obtenerMensajeError(error) {
  if (!error.response) {
    return "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";
  }

  const { status, data } = error.response;
  const detail = data?.detail;

  if (status >= 500) {
    return "No se pudo crear la cuenta por un problema del servidor. Inténtalo de nuevo más tarde.";
  }

  if (status === 422) {
    if (Array.isArray(detail)) {
      const campos = [
        ...new Set(
          detail
            .map((item) => fieldLabels[item.loc?.[1]])
            .filter(Boolean)
        ),
      ];

      if (campos.length > 0) {
        return `Revisa los siguientes campos: ${campos.join(", ")}.`;
      }
    }

    return "Hay datos inválidos en el formulario. Revisa los campos e inténtalo de nuevo.";
  }

  if (status === 400 || status === 409) {
    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }

    return "No se pudo crear la cuenta. Revisa si el usuario o el correo ya están registrados.";
  }

  if (status === 429) {
    return "Se realizaron demasiados intentos. Espera un momento e inténtalo de nuevo.";
  }

  return "No se pudo crear la cuenta. Inténtalo de nuevo.";
}

export default function Registro() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    primer_nombre: "",
    apellido: "",
    usuario: "",
    correo: "",
    contrasena: "",
    confirmarContrasena: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setError("");

    const datos = {
      primer_nombre: form.primer_nombre.trim(),
      apellido: form.apellido.trim(),
      usuario: form.usuario.trim(),
      correo: form.correo.trim(),
      contrasena: form.contrasena,
    };

    if (
      !datos.primer_nombre ||
      !datos.apellido ||
      !datos.usuario ||
      !datos.correo ||
      !datos.contrasena.trim() ||
      !form.confirmarContrasena.trim()
    ) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    if (form.contrasena.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (form.contrasena !== form.confirmarContrasena) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/usuarios/registrar", datos);
      navigate("/login", { replace: true });
    } catch (error) {
      setError(obtenerMensajeError(error));
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
              Crear usuario
            </h1>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
            aria-busy={loading}
          >
            <div className="form-control">
              <label htmlFor="primer_nombre" className="label">
                <span className="label-text font-semibold text-black">
                  Nombre
                </span>
              </label>

              <input
                id="primer_nombre"
                type="text"
                name="primer_nombre"
                placeholder="Tu nombre"
                autoComplete="given-name"
                value={form.primer_nombre}
                onChange={handleChange}
                maxLength={100}
                disabled={loading}
                className="input input-bordered w-full border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-[#efb60e] focus:outline-none"
                required
              />
            </div>

            <div className="form-control">
              <label htmlFor="apellido" className="label">
                <span className="label-text font-semibold text-black">
                  Apellido
                </span>
              </label>

              <input
                id="apellido"
                type="text"
                name="apellido"
                placeholder="Tu apellido"
                autoComplete="family-name"
                value={form.apellido}
                onChange={handleChange}
                maxLength={100}
                disabled={loading}
                className="input input-bordered w-full border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-[#efb60e] focus:outline-none"
                required
              />
            </div>

            <div className="form-control">
              <label htmlFor="usuario" className="label">
                <span className="label-text font-semibold text-black">
                  Nombre de usuario
                </span>
              </label>

              <input
                id="usuario"
                type="text"
                name="usuario"
                placeholder="Tu nombre de usuario"
                autoComplete="username"
                value={form.usuario}
                onChange={handleChange}
                maxLength={100}
                disabled={loading}
                className="input input-bordered w-full border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-[#efb60e] focus:outline-none"
                required
              />
            </div>

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
                value={form.correo}
                onChange={handleChange}
                maxLength={100}
                disabled={loading}
                className="input input-bordered w-full border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-[#efb60e] focus:outline-none"
                required
              />
            </div>

            <div className="form-control">
              <label htmlFor="contrasena" className="label">
                <span className="label-text font-semibold text-black">
                  Contraseña
                </span>
              </label>

              <div className="relative">
                <input
                  id="contrasena"
                  type={showPassword ? "text" : "password"}
                  name="contrasena"
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  value={form.contrasena}
                  onChange={handleChange}
                  disabled={loading}
                  className="input input-bordered w-full border-gray-300 bg-white pr-20 text-black placeholder:text-gray-400 focus:border-[#efb60e] focus:outline-none"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-black hover:text-[#b88b00]"
                  aria-label={
                    showPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                  aria-pressed={showPassword}
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            <div className="form-control">
              <label htmlFor="confirmarContrasena" className="label">
                <span className="label-text font-semibold text-black">
                  Confirmar contraseña
                </span>
              </label>

              <div className="relative">
                <input
                  id="confirmarContrasena"
                  type={showConfirmation ? "text" : "password"}
                  name="confirmarContrasena"
                  placeholder="Repite tu contraseña"
                  autoComplete="new-password"
                  value={form.confirmarContrasena}
                  onChange={handleChange}
                  disabled={loading}
                  className="input input-bordered w-full border-gray-300 bg-white pr-20 text-black placeholder:text-gray-400 focus:border-[#efb60e] focus:outline-none"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmation((visible) => !visible)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-black hover:text-[#b88b00]"
                  aria-label={
                    showConfirmation
                      ? "Ocultar confirmación de contraseña"
                      : "Mostrar confirmación de contraseña"
                  }
                  aria-pressed={showConfirmation}
                >
                  {showConfirmation ? "Ocultar" : "Mostrar"}
                </button>
              </div>
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
              {loading ? "Creando usuario..." : "Crear usuario"}
            </button>
          </form>

          <p className="text-center text-sm text-black">
            ¿Ya tienes cuenta?{" "}
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
