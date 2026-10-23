import { useState } from "react";
import { ShoppingCart, Menu, Search } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  { name: "Herramientas", href: "/productos?categoria=herramientas" },
  { name: "Construcción", href: "/productos?categoria=construccion" },
  { name: "Pinturas", href: "/productos?categoria=pinturas" },
  { name: "Electricidad", href: "/productos?categoria=electricidad" },
  {
    name: "Insumos agrícolas",
    href: "/productos?categoria=insumos_agricolas",
  },
  {
    name: "Artículos del hogar",
    href: "/productos?categoria=articulos_del_hogar",
  },
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
    <header className="sticky top-0 z-50 bg-black text-white shadow-md">
      <div className="navbar mx-auto max-w-7xl gap-2 px-3 sm:px-6">
        <div className="navbar-start flex-1">
          <Link to="/" aria-label="Inicio Super Ferre">
            <img
              src="/logo.png"
              alt="Logo de Super Ferre"
              className="h-12 w-auto object-contain sm:h-14"
            />
          </Link>
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
              className="input join-item w-full border-gray-300 bg-white text-gray-800 placeholder:text-gray-500 focus:outline-none"
            />

            <button
              type="submit"
              className="btn join-item border-[#efb60e] bg-[#efb60e] text-black hover:border-[#d9a40b] hover:bg-[#d9a40b]"
            >
              <Search size={18} />
              Buscar
            </button>
          </form>
        </div>

        <div className="navbar-end flex-1 gap-1">
          <Link
            to="/carrito"
            className="btn btn-ghost btn-square text-white hover:bg-white/10"
            aria-label="Carrito de compras"
            title="Carrito"
          >
            <ShoppingCart size={24} strokeWidth={1.8} />
          </Link>

          <div className="dropdown dropdown-end">
            <button
              type="button"
              className="btn gap-2 border-[#efb60e] bg-[#efb60e] text-black hover:border-[#d9a40b] hover:bg-[#d9a40b]"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <Menu size={20} strokeWidth={2} />
              <span className="hidden sm:inline">Categorías</span>
            </button>

            {menuOpen && (
              <ul className="menu dropdown-content z-50 mt-3 w-64 rounded-box border border-gray-200 bg-white p-2 text-gray-800 shadow-xl">
                {categories.map((category) => (
                  <li key={category.name}>
                    <Link
                      to={category.href}
                      onClick={() => setMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}

                <li className="my-1 border-t border-gray-200" />

                <li>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                  >
                    Iniciar sesión
                  </Link>
                </li>

                <li>
                  <Link
                    to="/registro"
                    onClick={() => setMenuOpen(false)}
                  >
                    Crear usuario
                  </Link>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-3 py-3 md:hidden">
        <form
          onSubmit={handleSearch}
          role="search"
          className="join flex w-full"
        >
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar productos..."
            aria-label="Buscar productos"
            className="input join-item w-full border-gray-300 bg-white text-gray-800 placeholder:text-gray-500 focus:outline-none"
          />

          <button
            type="submit"
            className="btn join-item border-[#efb60e] bg-[#efb60e] text-black hover:border-[#d9a40b] hover:bg-[#d9a40b]"
            aria-label="Buscar"
          >
            <Search size={18} />
            <span>Buscar</span>
          </button>
        </form>
      </div>
    </header>
  );
}