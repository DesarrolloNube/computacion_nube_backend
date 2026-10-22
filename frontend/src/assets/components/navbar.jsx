import { useState } from "react";

const categories = [
  { name: "Herramientas", href: "/productos?categoria=herramientas" },
  { name: "Construcción", href: "/productos?categoria=construccion" },
  { name: "Pinturas", href: "/productos?categoria=pinturas" },
  { name: "Electricidad", href: "/productos?categoria=electricidad" },
  { name: "Insumos agrícolas", href: "/productos?categoria=insumos-agricolas" },
  { name: "Artículos del hogar", href: "/productos?categoria=articulos-del-hogar" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  function handleSearch(event) {
    event.preventDefault();

    if (!search.trim()) return;

    console.log("Buscar producto:", search.trim());
  }

  return (
    <header className="sticky top-0 z-50 bg-base-100 shadow-md">
      <div className="navbar mx-auto max-w-7xl gap-2 px-3 sm:px-6">

        <div className="navbar-start flex-1">
          <a href="/" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-error text-lg font-black text-white">
              SE
            </span>

            <span className="leading-tight">
              <span className="block text-lg font-black sm:text-xl">
                SE-Ferre
              </span>
              <span className="hidden text-xs text-base-content/60 sm:block">
                Super E-Ferretería
              </span>
            </span>
          </a>
        </div>

        <div className="navbar-center hidden flex-1 md:flex">
          <form
            onSubmit={handleSearch}
            role="search"
            className="join w-full max-w-xl"
          >
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar herramientas, materiales..."
              aria-label="Buscar productos"
              className="input input-bordered join-item w-full"
            />

            <button
              type="submit"
              className="btn btn-error join-item text-white"
            >
              Buscar
            </button>
          </form>
        </div>

        <div className="navbar-end flex-1 gap-1">
          <a
            href="/carrito"
            className="btn btn-ghost btn-square"
            aria-label="Carrito de compras"
            title="Carrito"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </a>

          <div className="dropdown dropdown-end">
            <button
              type="button"
              className="btn btn-error gap-2 text-white"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>

              <span className="hidden sm:inline">Categorías</span>
            </button>

            {menuOpen && (
              <ul className="menu dropdown-content z-50 mt-3 w-64 rounded-box border border-base-300 bg-base-100 p-2 shadow-xl">
                <li className="menu-title">
                  <span>Explorar categorías</span>
                </li>

                {categories.map((category) => (
                  <li key={category.name}>
                    <a
                      href={category.href}
                      onClick={() => setMenuOpen(false)}
                    >
                      {category.name}
                    </a>
                  </li>
                ))}

                <li className="my-1 border-t border-base-300" />

                <li>
                  <a
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                  >
                    Iniciar sesión
                  </a>
                </li>

                <li>
                  <a
                    href="/registro"
                    onClick={() => setMenuOpen(false)}
                  >
                    Crear usuario
                  </a>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-base-300 px-3 py-3 md:hidden">
        <form onSubmit={handleSearch} role="search" className="join flex w-full">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar productos..."
            aria-label="Buscar productos"
            className="input input-bordered join-item w-full"
          />

          <button
            type="submit"
            className="btn btn-error join-item text-white"
          >
            Buscar
          </button>
        </form>
      </div>
    </header>
  );
}