import { useEffect } from "react";

function HomeCarousel() {
  useEffect(() => {
    const carrusel = document.getElementById("carrusel");
    const items = document.querySelectorAll("#carrusel .carousel-item");

    let index = 0;

    const intervalo = setInterval(() => {
      index++;

      if (index >= items.length) {
        index = 0;
      }

      carrusel.scrollTo({
        left: items[index].offsetLeft,
        behavior: "smooth",
      });
    }, 4000);

    return () => clearInterval(intervalo);
  }, []);

  return (
    <div id="carrusel" className="carousel w-full">
      <div id="slide1" className="carousel-item relative w-full">
        <img
          src="https://storage.googleapis.com/se-ferre-bucket/promociones%20/TruperBannerPromo1.webp"
          className="h-[260px] w-full object-cover"
          alt="Promoción 1"
        />

        <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 justify-between">
          <a href="#slide3" className="btn btn-circle">❮</a>
          <a href="#slide2" className="btn btn-circle">❯</a>
        </div>
      </div>

      <div id="slide2" className="carousel-item relative w-full">
        <img
          src="https://storage.googleapis.com/se-ferre-bucket/promociones%20/lancoPromo1.webp"
          className="h-[260px] w-full object-cover "
          alt="Promoción 2"
        />

        <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 justify-between">
          <a href="#slide1" className="btn btn-circle">❮</a>
          <a href="#slide3" className="btn btn-circle">❯</a>
        </div>
      </div>

      <div id="slide3" className="carousel-item relative w-full">
        <img
          src="https://storage.googleapis.com/se-ferre-bucket/banners/banner-calidad.webp"
          className="h-[260px] w-full object-cover "
          alt="Promoción 3"
        />

        <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 justify-between">
          <a href="#slide2" className="btn btn-circle">❮</a>
          <a href="#slide1" className="btn btn-circle">❯</a>
        </div>
      </div>
    </div>
  );
}

export default HomeCarousel;