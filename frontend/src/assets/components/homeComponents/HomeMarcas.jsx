const marcas = [
  {
    nombre: "Truper",
    imagen:
      "https://storage.googleapis.com/se-ferre-bucket/brand/truper_logo.webp",
  },
  {
    nombre: "Lanco",
    imagen:
      "https://storage.googleapis.com/se-ferre-bucket/brand/lanco_logo.webp",
  },
  {
    nombre: "Evergreen",
    imagen:
      "https://storage.googleapis.com/se-ferre-bucket/brand/Evergreen_Roundel.webp",
  },
  {
    nombre: "Makita",
    imagen:
      "https://storage.googleapis.com/se-ferre-bucket/brand/makitaLogo.webp",
  },
];

function HomeMarcas() {
  return (
    <section className="w-full bg-[#111111] px-6 py-8">
      <div className="mx-auto grid max-w-7xl grid-cols-2 items-center justify-items-center gap-8 md:grid-cols-4">
        {marcas.map((marca) => (
          <div
            key={marca.nombre}
            className="flex h-20 w-40 items-center justify-center"
          >
            <img
              src={marca.imagen}
              alt={`Logo de ${marca.nombre}`}
              className="max-h-full max-w-full object-contain opacity-75"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default HomeMarcas;
