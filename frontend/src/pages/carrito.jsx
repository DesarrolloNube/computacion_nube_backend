import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  actualizarCantidad,
  eliminarItem,
  obtenerCarrito,
} from "../services/carritoServices";
import { completarCompra } from "../services/pedidosServices";

const moneda = new Intl.NumberFormat("es-CR", {
  style: "currency",
  currency: "CRC",
});

const boton =
  "rounded-lg bg-[#efb60e] px-4 py-2 font-semibold text-black " +
  "hover:bg-[#d9a40b] disabled:cursor-not-allowed disabled:opacity-50";

function mensajeError(error) {
  const status = error.response?.status;
  if (status === 409) {
    const detail = error.response?.data?.detail;
    return typeof detail === "string"
      ? detail
      : "El carrito cambió. Actualízalo antes de continuar.";
  }
  if (status === 404) {
    return "El producto ya no está disponible en el carrito. Actualízalo.";
  }
  if (status === 422) {
    return "Revisa la cantidad. Debe ser un número entero mayor o igual a 1.";
  }
  if (!error.response) {
    return "No se pudo conectar con el servidor. Revisa tu conexión.";
  }
  return "No se pudo completar la operación. Inténtalo de nuevo.";
}

function ContenidoCarrito() {
  const { actualizarContadorCarrito } = useAuth();
  const navigate = useNavigate();
  const [carrito, setCarrito] = useState(null);
  const [cantidades, setCantidades] = useState({});
  const [cargando, setCargando] = useState(true);
  const [operando, setOperando] = useState(false);
  const [error, setError] = useState("");
  const [pedido, setPedido] = useState(null);
  const [requiereActualizar, setRequiereActualizar] = useState(false);

  // Evita dos solicitudes por clics consecutivos antes del render.
  const bloqueo = useRef(false);
  const activo = useRef(false);

const aplicarCarrito = useCallback((datos) => {
  const items = datos.items ?? [];

  setCarrito({
    ...datos,
    items,
  });

  setCantidades(
    Object.fromEntries(
      items.map((item) => [
        item.id_producto,
        String(item.cantidad),
      ])
    )
  );

  actualizarContadorCarrito(items);
}, [actualizarContadorCarrito]);

  useEffect(() => {
    activo.current = true;
    const controller = new AbortController();

    async function cargar() {
      try {
        const datos = await obtenerCarrito({ signal: controller.signal });
        if (!controller.signal.aborted) aplicarCarrito(datos);
      } catch (err) {
        if (controller.signal.aborted) return;
        if (err.response?.status === 401) {
          navigate("/login", { replace: true });
          return;
        }
        setError(mensajeError(err));
      } finally {
        if (!controller.signal.aborted) setCargando(false);
      }
    }

    cargar();
    return () => {
      activo.current = false;
      controller.abort();
    };
  }, [navigate, aplicarCarrito]);

  async function ejecutar(accion, esCompra = false) {
    if (bloqueo.current) return;
    bloqueo.current = true;
    setOperando(true);
    setError("");

    try {
      if (esCompra) {
        const resultado = await completarCompra();
        if (!activo.current) return;
setPedido(resultado);
aplicarCarrito({ items: [], total: 0 });
setRequiereActualizar(false);
      } else {
        await accion();
        if (!activo.current) return;
        // El total y las cantidades se recuperan del backend.
        const datos = await obtenerCarrito();
        if (!activo.current) return;
        aplicarCarrito(datos);
        setRequiereActualizar(false);
      }
    } catch (err) {
      if (!activo.current) return;
      if (err.response?.status === 401) {
        navigate("/login", { replace: true });
        return;
      }
      // El estado mostrado podría haber quedado desactualizado.
      setRequiereActualizar(true);
      if (esCompra && (!err.response || err.response.status >= 500)) {
        setError(
          "No pudimos confirmar el resultado de la compra. " +
          "El pedido podría haberse generado. Actualiza el carrito " +
          "antes de continuar; no repitas la compra inmediatamente."
        );
      } else {
        setError(mensajeError(err));
      }
    } finally {
      bloqueo.current = false;
      if (activo.current) setOperando(false);
    }
  }

  function guardarCantidad(event, item) {
    event.preventDefault();
    const cantidad = Number(cantidades[item.id_producto]);
    if (!Number.isSafeInteger(cantidad) || cantidad < 1) {
      setError("La cantidad debe ser un número entero mayor o igual a 1.");
      return;
    }
    if (cantidad === item.cantidad) return;
    ejecutar(() => actualizarCantidad(item.id_producto, cantidad));
  }

  if (cargando) return <p role="status">Cargando carrito...</p>;

  const items = carrito?.items ?? [];
  const hayCambiosSinGuardar = items.some(
    (item) => Number(cantidades[item.id_producto]) !== item.cantidad
  );
  const bloquearCambios = operando || requiereActualizar;

  return (
    <div aria-busy={operando}>
      {pedido && (
        <section role="status" className="mb-6 rounded-xl border border-green-300 bg-green-50 p-5">
          <h2 className="text-xl font-bold">Pedido generado correctamente</h2>
          <p className="mt-2">
            Código de retiro: <strong className="break-all">{pedido.codigo_retiro}</strong>
          </p>
          <p>Total: {moneda.format(Number(pedido.total))}</p>
          <p>Estado: {pedido.estado}</p>
          <p className="mt-2 text-sm">Compra simulada. No se realizó ningún cobro.</p>
        </section>
      )}

      {error && <p role="alert" className="mb-4 text-red-700">{error}</p>}

      {(!carrito || requiereActualizar) && (
        <button type="button" className={`${boton} mb-6`} disabled={operando}
          onClick={() => ejecutar(() => Promise.resolve())}>
          Actualizar carrito
        </button>
      )}

      {carrito && items.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-8">
          <p className="text-lg font-semibold">Tu carrito está vacío.</p>
          <Link to="/productos" className="mt-4 inline-block font-semibold underline">
            Explorar productos
          </Link>
        </div>
      )}

      {items.length > 0 && (
        <>
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.id_producto} className="rounded-xl border border-gray-200 bg-white p-5">
                <h2 className="text-lg font-bold">{item.nombre}</h2>
                <p className="mt-2">Precio unitario: {moneda.format(Number(item.precio))}</p>
                <form onSubmit={(event) => guardarCantidad(event, item)}
                  className="mt-4 flex flex-wrap items-end gap-3">
                  <div>
                    <label htmlFor={`cantidad-${item.id_producto}`} className="mb-1 block text-sm font-semibold">
                      Cantidad
                    </label>
                    <input id={`cantidad-${item.id_producto}`} type="number" min="1" step="1" required
                      value={cantidades[item.id_producto] ?? ""} disabled={bloquearCambios}
                      onChange={(event) => {
                        const valor = event.target.value;
                        setCantidades((actuales) => ({ ...actuales, [item.id_producto]: valor }));
                      }}
                      className="w-24 rounded-lg border border-gray-300 p-2" />
                  </div>
                  <button type="submit" className={boton} disabled={bloquearCambios}>
                    Actualizar cantidad
                  </button>
                  <button type="button" disabled={bloquearCambios}
                    onClick={() => ejecutar(() => eliminarItem(item.id_producto))}
                    aria-label={`Eliminar ${item.nombre} del carrito`}
                    className="rounded-lg border border-red-300 px-4 py-2 text-red-700 disabled:opacity-50">
                    Eliminar
                  </button>
                </form>
                <p className="mt-4 font-semibold">Subtotal: {moneda.format(Number(item.subtotal))}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-gray-600">
            Los subtotales y el total corresponden a las cantidades guardadas.
          </p>
        </>
      )}

      {carrito && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-2xl font-bold">Total: {moneda.format(Number(carrito.total))}</p>
          <button type="button" className={boton}
            disabled={bloquearCambios || items.length === 0 || hayCambiosSinGuardar}
            onClick={() => ejecutar(null, true)}>
            {operando ? "Procesando..." : "Completar compra"}
          </button>
        </div>
      )}
      {hayCambiosSinGuardar && (
        <p className="mt-3 text-sm text-gray-700">Guarda las cantidades antes de completar la compra.</p>
      )}
    </div>
  );
}

export default function Carrito() {
  const { user, isAuthenticated, loadingAuth } = useAuth();
  return (
    <section className="min-h-[60vh] bg-gray-50 px-4 py-8 text-gray-900 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold">Carrito de compras</h1>
        {loadingAuth ? (
          <p role="status">Comprobando sesión...</p>
        ) : !isAuthenticated ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <p>Debes iniciar sesión para ver tu carrito y comprar.</p>
            <Link to="/login" className={`${boton} mt-4 inline-block`}>Iniciar sesión</Link>
          </div>
        ) : (
          <ContenidoCarrito key={user.user_id} />
        )}
      </div>
    </section>
  );
}
