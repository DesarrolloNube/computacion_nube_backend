import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import ProductCard from "../assets/components/productoCard";

const PRODUCTOS_POR_PAGINA = 24;

function normalizarCategoria(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");
}

function Productos() {
  const [searchParams] = useSearchParams();

  const categoriaURL = searchParams.get("categoria");
  const buscarURL = searchParams.get("buscar")?.trim() || "";

  const filtroActual = `${categoriaURL || ""}|${buscarURL}`;

  const [estadoPagina, setEstadoPagina] = useState({
    filtro: "",
    numero: 1,
  });

  const pagina =
    estadoPagina.filtro === filtroActual
      ? estadoPagina.numero
      : 1;

  const [categorias, setCategorias] = useState([]);
  const [categoriasCargando, setCategoriasCargando] = useState(true);

  const [productos, setProductos] = useState([]);
  const [haySiguiente, setHaySiguiente] = useState(false);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const obtenerCategorias = async () => {
      try {
        const respuesta = await api.get("/categorias");
        setCategorias(respuesta.data);
      } catch (error) {
        console.error("Error al obtener las categorias:", error);
        setError("No se pudieron cargar las categorias.");
      } finally {
        setCategoriasCargando(false);
      }
    };

    obtenerCategorias();
  }, []);

  const categoriaSeleccionada = categorias.find(
    (categoria) =>
      normalizarCategoria(categoria.nombre) === categoriaURL
  );

  useEffect(() => {
    if (categoriasCargando) return;

    const obtenerProductos = async () => {
      setCargando(true);
      setError("");

      try {
        if (categoriaURL && !categoriaSeleccionada) {
          setProductos([]);
          setHaySiguiente(false);
          return;
        }

        const params = {
          skip: (pagina - 1) * PRODUCTOS_POR_PAGINA,
          limit: PRODUCTOS_POR_PAGINA + 1,
        };

        if (categoriaSeleccionada) {
          params.id_categoria = categoriaSeleccionada.id;
        }

        if (buscarURL) {
          params.buscar = buscarURL;
        }

        const respuesta = await api.get("/productos", { params });

        const listaProductos = respuesta.data;

        setProductos(
          listaProductos.slice(0, PRODUCTOS_POR_PAGINA)
        );

        setHaySiguiente(
          listaProductos.length > PRODUCTOS_POR_PAGINA
        );
      } catch (error) {
        console.error("Error al obtener los productos:", error);
        setError(
          "Error, intentalo de nuevo."
        );
        setProductos([]);
        setHaySiguiente(false);
      } finally {
        setCargando(false);
      }
    };

    obtenerProductos();
  }, [
    categoriasCargando,
    categoriaURL,
    buscarURL,
    categoriaSeleccionada,
    categorias,
    pagina,
  ]);

  const titulo = buscarURL
    ? `Resultados para "${buscarURL}"`
    : categoriaSeleccionada?.nombre || "Todos los productos";

  return (
    <section className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {titulo}
          </h1>

          {!buscarURL && (
            <p className="mt-2 text-sm text-gray-500">
              Explora nuestro catálogo de productos.
            </p>
          )}
        </div>

        {(cargando || categoriasCargando) && (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg text-[#efb60e]"></span>
          </div>
        )}

        {!cargando && !categoriasCargando && error && (
          <p className="py-12 text-center text-red-600">
            {error}
          </p>
        )}

        {!cargando &&
          !categoriasCargando &&
          !error &&
          categoriaURL &&
          !categoriaSeleccionada && (
            <p className="py-12 text-center text-gray-500">
              No se encontró la categoría solicitada.
            </p>
          )}

        {!cargando &&
          !categoriasCargando &&
          !error &&
          (!categoriaURL || categoriaSeleccionada) && (
            <>
              {productos.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {productos.map((producto) => (
                    <ProductCard
                      key={producto.id}
                      producto={producto}
                    />
                  ))}
                </div>
              ) : (
                <p className="py-16 text-center text-gray-500">
                  No se encontraron productos.
                </p>
              )}

              {productos.length > 0 && (
                <div className="mt-10 flex items-center justify-center gap-4">

                  <button
                    onClick={() =>
                      setEstadoPagina({
                        filtro: filtroActual,
                        numero: pagina - 1,
                      })
                    }
                    disabled={pagina === 1}
                    className="rounded-lg border border-gray-300 px-5 py-2 font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Anterior
                  </button>

                  <span className="font-medium text-gray-700">
                    Página {pagina}
                  </span>

                  <button
                    onClick={() =>
                      setEstadoPagina({
                        filtro: filtroActual,
                        numero: pagina + 1,
                      })
                    }
                    disabled={!haySiguiente}
                    className="rounded-lg border border-gray-300 px-5 py-2 font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Siguiente
                  </button>

                </div>
              )}
            </>
          )}
      </div>
    </section>
  );
}

export default Productos;
