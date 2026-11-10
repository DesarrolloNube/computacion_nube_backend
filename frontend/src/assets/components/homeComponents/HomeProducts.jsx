import { useEffect, useState } from "react";
import api from "../../../services/api";
import ProductoCard from "../../components/productoCard";
function HomeProducts() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        const respuesta = await api.get("/productos", {
          params: {
            skip: 0,
            limit: 12,
          },
        });

        setProductos(respuesta.data);
      } catch (error) {
        console.error("Error al obtener productos:", error);
        setError(true);
      } finally {
        setCargando(false);
      }
    };

    obtenerProductos();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
          Nuestros productos
        </h2>

        <p className="mt-2 text-gray-600">
          Encuentra los productos que necesitas para tu próximo proyecto.
        </p>
      </div>

      {cargando ? (
        <p className="py-10 text-center text-gray-600">
          Cargando productos...
        </p>
      ) : error ? (
        <p className="py-10 text-center text-gray-600">
          No se pudieron cargar los productos.
        </p>
      ) : productos.length === 0 ? (
        <p className="py-10 text-center text-gray-600">
          No hay productos disponibles.
        </p>
      ) : (
        <div className="relative">
          <div
            id="productos-carousel"
            className="carousel carousel-center w-full gap-4 p-2"
          >
            {productos.map((producto) => (
              <div
                key={producto.id}
                className="carousel-item w-64 sm:w-72"
              >
                <ProductoCard producto={producto} />
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-circle"
              aria-label="Productos anteriores"
              onClick={() =>
                document
                  .getElementById("productos-carousel")
                  ?.scrollBy({
                    left: -300,
                    behavior: "smooth",
                  })
              }
            >
              ❮
            </button>

            <button
              type="button"
              className="btn btn-circle"
              aria-label="Productos siguientes"
              onClick={() =>
                document
                  .getElementById("productos-carousel")
                  ?.scrollBy({
                    left: 300,
                    behavior: "smooth",
                  })
              }
            >
              ❯
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default HomeProducts;