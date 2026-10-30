import { useState } from "react";
import { ShoppingCart, Menu, Search, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

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
  const [accountOpen, setAccountOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { user, isAuthenticated, loadingAuth, logout } = useAuth();
  const navigate = useNavigate();

  function handleSearch(event) {
    event.preventDefault();

    if (!search.trim()) return;

    navigate(`/productos?busqueda=${encodeURIComponent(search.trim())}`);
  }

  async function handleLogout() {
    try {
      await logout();
      setAccountOpen(false);
      navigate("/", { replace: true });
    } catch {
      alert("No se pudo cerrar la sesión. Inténtalo de nuevo.");
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-black text-white shadow-md">
      <div className="navbar mx-auto max-w-7xl gap-2 px-3 sm:px-6">
        <div className="navbar-start flex-1">
          <Link to="/" aria-label="Inicio Super Ferre">
            <img
              src="https://storage.googleapis.com/se-ferre-bucket/brand/LogoSuperFerre.webp"
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
              </ul>
            )}
          </div>

          <div className="dropdown dropdown-end">
            <button
              type="button"
              className="btn btn-ghost gap-2 text-white hover:bg-white/10"
              aria-expanded={accountOpen}
              onClick={() => setAccountOpen((open) => !open)}
            >
              <UserRound size={21} />
              <span className="hidden sm:inline">
                {loadingAuth
                  ? "Mi cuenta"
                  : isAuthenticated
                    ? user?.username || "Mi cuenta"
                    : "Mi cuenta"}
              </span>
            </button>

            {accountOpen && (
              <ul className="menu dropdown-content z-50 mt-3 w-56 rounded-box border border-gray-200 bg-white p-2 text-gray-800 shadow-xl">
                {loadingAuth ? (
                  <li>
                    <span>Comprobando sesión...</span>
                  </li>
                ) : isAuthenticated ? (
                  <>
                    <li>
                      <Link
                        to="/perfil"
                        onClick={() => setAccountOpen(false)}
                      >
                        Mi perfil
                      </Link>
                    </li>
                    <li>
                      <button type="button" onClick={handleLogout}>
                        Cerrar sesión
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link
                        to="/login"
                        onClick={() => setAccountOpen(false)}
                      >
                        Iniciar sesión
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/registro"
                        onClick={() => setAccountOpen(false)}
                      >
                        Crear usuario
                      </Link>
                    </li>
                  </>
                )}
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