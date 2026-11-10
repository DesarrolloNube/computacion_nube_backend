import HomeCarousel from "../assets/components/homeComponents/HomeCarousel";
import HomeProducts from "../assets/components/homeComponents/HomeProducts";
import HomeMarcas from "../assets/components/homeComponents/HomeMarcas";
import { Award, Tags, Store } from "lucide-react";


function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <HomeCarousel />

      <HomeProducts />

      <HomeMarcas />

      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              ¿Por qué comprar con nosotros?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              En Super Ferre trabajamos para ofrecerte calidad y
              variedad .
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

            <div className="card border border-gray-200 bg-base-100 shadow-sm">
              <div className="card-body items-center text-center">
                <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-[#efb60e]/15">
                  <Award size={34} className="text-[#d9a40b]" />
                </div>

                <h3 className="card-title justify-center text-xl text-[#efb60e] ">
                  Productos y marcas de calidad
                </h3>

                <p className="text-white-600">
                  Trabajamos con marcas reconocidas en los sectores
                  de construcción y agropecuario, ofreciendo
                  productos de calidad.
                </p>
              </div>
            </div>

            <div className="card border border-gray-200 bg-base-100 shadow-sm">
              <div className="card-body items-center text-center">
                <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-[#efb60e]/15">
                  <Tags size={34} className="text-[#d9a40b]" />
                </div>

                <h3 className="card-title justify-center text-xl text-[#efb60e]">
                  Opciones y precios accesibles
                </h3>

                <p className="text-white-600">
                  Contamos con diferentes alternativas para cada
                  necesidad y presupuesto, además de promociones
                  constantes.
                </p>
              </div>
            </div>

            <div className="card border border-gray-200 bg-base-100 shadow-sm">
              <div className="card-body items-center text-center">
                <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-[#efb60e]/15">
                  <Store size={34} className="text-[#d9a40b]" />
                </div>

                <h3 className="card-title justify-center text-xl text-[#efb60e]">
                  Retiro en tienda
                </h3>

                <p className="text-white-600">
                  Compra en línea y retira tus productos directamente
                  en nuestra tienda. Solo necesitas presentar tu
                  orden de compra.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;