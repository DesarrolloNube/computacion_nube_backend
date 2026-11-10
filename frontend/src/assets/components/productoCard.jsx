import { Link } from "react-router-dom";

function ProductoCard({ producto }) {
  return (
    <Link to={`/productos/${producto.id}`} className="block h-full">
      <article className="h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
        <div className="flex h-48 items-center justify-center bg-gray-100">
          <img
            src={producto.imagen_producto}
            alt={producto.nombre_producto}
            className="h-full w-full object-contain p-4"
          />
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900">
            {producto.nombre_producto}
          </h3>

          <p className="mt-3 text-xl font-bold text-gray-900">
            ₡{Number(producto.precio_producto).toLocaleString("es-CR")}
          </p>

          <div className="mt-4 w-full rounded-lg bg-[#efb60e] px-4 py-3 text-center font-semibold text-gray-900 transition hover:bg-[#d9a40b]">
            Agregar al carrito
          </div>
        </div>
      </article>
    </Link>
  );
}

export default ProductoCard;