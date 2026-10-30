import { Link } from "react-router-dom";

const productos = [
  {
    id: 1,
    nombre_producto: "Taladro Makita DP2011",
    precio_producto: 45900,
    imagen_producto: "https://storage.googleapis.com/se-ferre-bucket/productos/herramientas/MakitaTaladroDP2011-1.webp",
  },
  {
    id: 2,
    nombre_producto: "Martillo de acero",
    precio_producto: 8500,
    imagen_producto: "https://placehold.co/600x600?text=Martillo",
  },
  {
    id: 3,
    nombre_producto: "Juego de destornilladores",
    precio_producto: 12500,
    imagen_producto: "https://placehold.co/600x600?text=Destornilladores",
  },
  {
    id: 4,
    nombre_producto: "Taladro inalámbrico",
    precio_producto: 65000,
    imagen_producto: "https://placehold.co/600x600?text=Taladro+inalambrico",
  },
];

function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Encabezado */}
      <section className="bg-gray-900 px-6 py-16 text-center text-white">
        <h1 className="text-3xl font-bold md:text-5xl">
          Bienvenido a Super E-Ferretería
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-gray-300">
          Todo lo que necesita en un mismo lugar 
        </p>
      </section>

      {/* Productos */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Nuestros productos
          </h2>

          <p className="mt-2 text-gray-600">
            Encuentra los productos que necesitas para tu próximo proyecto.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {productos.map((producto) => (
            <article
              key={producto.id}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <Link to={`/productos/${producto.id}`}>
                <div className="flex h-56 items-center justify-center bg-gray-100">
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

                  <p className="mt-2 text-xl font-bold text-gray-900">
                    ₡{producto.precio_producto.toLocaleString("es-CR")}
                  </p>
                </div>
              </Link>

              <div className="px-4 pb-4">
                <button
                  type="button"
                  className="w-full rounded-lg bg-[#efb60e] px-4 py-3 font-semibold text-gray-900 transition hover:bg-[#d9a40b]"
                >
                  Agregar al carrito
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;