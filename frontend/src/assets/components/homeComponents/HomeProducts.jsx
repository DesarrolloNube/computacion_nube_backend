import { useEffect, useState } from "react";
import api from "../../../services/api";
import ProductoCard from "../../components/productoCard";
import { Link } from "react-router-dom";
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

  <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2">
    <button
      type="button"
      className="btn btn-circle pointer-events-auto shadow-md"
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
      className="btn btn-circle pointer-events-auto shadow-md"
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

<div className="mt-8 flex justify-center">
  <Link
    to="/productos"
    className="btn border-none bg-[#efb60e] px-8 text-gray-900 hover:bg-[#d9a40b]"
  >
    Ver todos los productos
  </Link>
</div>

    </section>
  );
}

export default HomeProducts;