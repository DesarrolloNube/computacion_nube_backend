import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();

    console.log("Correo:", email);
    console.log("Contraseña:", password);
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-white px-4 py-12 text-black">
      <div className="card w-full max-w-md border border-gray-200 bg-white shadow-xl">
        <div className="card-body gap-5 p-6 sm:p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-black">
Inicio de Sesión
            </h1>

          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="form-control">
              <label htmlFor="email" className="label">
                <span className="label-text font-semibold text-black">
                  Correo electrónico
                </span>
              </label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="ejemplo@correo.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="input input-bordered w-full border-gray-300 bg-white text-black placeholder:text-gray-400 focus:border-[#efb60e] focus:outline-none"
                required
              />
            </div>

            <div className="form-control">
              <label htmlFor="password" className="label">
                <span className="label-text font-semibold text-black">
                  Contraseña
                </span>
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="1234abcd"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
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
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <a
                href="/recuperar-contrasena"
                className="text-sm font-medium text-black underline-offset-4 hover:text-[#b88b00] hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              className="btn mt-2 w-full border-[#efb60e] bg-[#efb60e] text-black hover:border-[#d9a40b] hover:bg-[#d9a40b]"
            >
              Iniciar sesión
            </button>
          </form>

          <p className="text-center text-sm text-black">
            ¿Aun no tienes cuenta? <a href="/registro" className="font-bold text-black underline decoration-[#efb60e] decoration-2 underline-offset-4 hover:text-[#b88b00]">
              Crear usuario
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}