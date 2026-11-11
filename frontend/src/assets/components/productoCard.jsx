
import { Link } from "react-router-dom";

function ProductCard({ producto }) {
  return (
    <Link
      to={`/productos/${producto.id}`}
      className="block h-[380px] w-full"
    >
      <article className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">

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

          <div className="mt-auto w-full rounded-lg bg-[#efb60e] px-4 py-3 text-center font-semibold text-gray-900 transition hover:bg-[#d9a40b]">
            Agregar al carrito
          </div>
        </div>
      </article>
    </Link>
  );
}

export default ProductCard;
