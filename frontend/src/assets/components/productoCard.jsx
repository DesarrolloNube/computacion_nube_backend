
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { agregarItem } from "../../services/carritoServices";

function ProductCard({ producto }) {
  const navigate = useNavigate();
const { isAuthenticated, loadingAuth, refreshCart } = useAuth();
  const [agregando, setAgregando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const bloqueo = useRef(false);

  async function handleAgregar() {
    if (loadingAuth || bloqueo.current) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    bloqueo.current = true;
    setAgregando(true);
    setMensaje("");
    setError("");
    try {
     await agregarItem(producto.id, 1);
await refreshCart();
setMensaje("Producto agregado al carrito.");
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        navigate("/login", { replace: true });
        return;
      }
      if (status === 404) {
        setError("Este producto ya no está disponible.");
      } else if (status === 409) {
        const detail = err.response?.data?.detail;
        setError(typeof detail === "string" ? detail : "No se pudo agregar el producto en este momento.");
      } else if (!err.response || status >= 500) {
        setError("No pudimos confirmar si se agregó. " + "Revisa el carrito antes de intentarlo otra vez.");
      } else {
        setError("No se pudo agregar el producto. Inténtalo de nuevo.");
      }
    } finally {
      bloqueo.current = false;
      setAgregando(false);
    }
  }

  return (
      <article className="flex min-h-[380px] w-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">

        <div className="flex h-48 w-full shrink-0 items-center justify-center bg-gray-100">
          <img
            src={producto.imagen_producto}
            alt={producto.nombre_producto}
            className="h-full w-full object-contain p-4"
          />
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="min-h-12 line-clamp-2 font-semibold text-gray-900">
            {producto.nombre_producto}
          </h3>

          <p className="mt-3 min-h-7 text-xl font-bold text-gray-900">
            ₡{Number(producto.precio_producto).toLocaleString("es-CR")}
          </p>

          <button type="button" onClick={handleAgregar} disabled={loadingAuth || agregando}
            className="mt-4 w-full rounded-lg bg-[#efb60e] px-4 py-3 text-center font-semibold text-gray-900 transition hover:bg-[#d9a40b] disabled:cursor-not-allowed disabled:opacity-50">
            {loadingAuth ? "Comprobando sesión..." : agregando ? "Agregando..." : "Agregar al carrito"}
          </button>
          {mensaje && <p role="status" className="mt-2 text-sm text-green-700">{mensaje}</p>}
          {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
        </div>
      </article>
  );
}

export default ProductCard;
