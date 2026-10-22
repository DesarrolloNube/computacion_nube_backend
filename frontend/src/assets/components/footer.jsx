export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialNetworks = [
    { name: "Facebook", href: "https://www.facebook.com/" },
    { name: "Instagram", href: "https://www.instagram.com/" },
    { name: "WhatsApp", href: "https://www.whatsapp.com/" },
  ];

  return (
    <footer className="footer footer-vertical bg-neutral p-8 text-neutral-content md:p-10">
      <div className="mx-auto w-full max-w-7xl">

        {/* Información de contacto */}
        <section className="text-center md:text-left">
          <h2 className="mb-4 text-xl font-bold">Contáctanos</h2>

          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
            <div>
              <p className="font-semibold">Teléfono</p>
              <p className="opacity-80">Por definir</p>
            </div>

            <div>
              <p className="font-semibold">Correo electrónico</p>
              <p className="opacity-80">Por definir</p>
            </div>

            <div>
              <p className="font-semibold">Dirección</p>
              <p className="opacity-80">Costa Rica</p>
            </div>
          </div>
        </section>

        <div className="divider before:bg-neutral-content/20 after:bg-neutral-content/20" />

        {/* Redes sociales */}
        <section className="w-full text-center">
          <h2 className="mb-4 text-lg font-bold">Síguenos en redes sociales</h2>

          <div className="flex flex-wrap justify-center gap-4">
            {socialNetworks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm"
                aria-label={social.name}
              >
                {social.name}
              </a>
            ))}
          </div>
        </section>

        <div className="divider before:bg-neutral-content/20 after:bg-neutral-content/20" />

        {/* Enlaces legales y copyright */}
        <section className="flex w-full flex-col items-center justify-between gap-4 text-center text-sm md:flex-row">
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            <a href="/politicas-privacidad" className="link link-hover">
              Política de privacidad
            </a>

            <a href="/terminos-condiciones" className="link link-hover">
              Términos y condiciones
            </a>
          </nav>

          <p className="opacity-70">
            © {currentYear} SE-Ferre. Todos los derechos reservados.
          </p>
        </section>

      </div>
    </footer>
  );
}