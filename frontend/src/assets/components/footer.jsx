
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Camera,

} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialNetworks = [
    {
      name: "Facebook",
      href: "https://www.facebook.com/",
      symbol: "f",
    },
{
  name: "Instagram",
  href: "https://www.instagram.com/",
  Icon: Camera,
},
    {
      name: "WhatsApp",
      href: "https://www.whatsapp.com/",
      Icon: MessageCircle,
    },
  ];

  const mapUrl =
    "https://www.google.com/maps?q=9.658199,-84.023727";

  const embedUrl =
    "https://maps.google.com/maps?q=9.658199,-84.023727&z=16&output=embed";

  return (
    <footer className="bg-black px-6 py-10 text-white md:px-10">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
        <section>
          <h2 className="mb-5 text-xl font-bold text-[#efb60e]">
            Contáctanos
          </h2>

          <ul className="flex flex-col gap-4 text-sm">
            <li className="flex items-start gap-3">
              <Phone
                size={20}
                className="shrink-0 text-[#efb60e]"
              />
              <div>
                <p className="font-semibold">Teléfono</p>
                <p className="text-white/80">0000-0000</p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <Mail
                size={20}
                className="shrink-0 text-[#efb60e]"
              />
              <div>
                <p className="font-semibold">Correo electrónico</p>
                <p className="text-white/80">superEFerre@gmail.com</p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <MapPin
                size={20}
                className="shrink-0 text-[#efb60e]"
              />
              <div>
                <p className="font-semibold">Dirección</p>
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 transition-colors hover:text-[#efb60e]"
                >
                  100mts oeste del hotel La Arboleda, lado derecho, San Marcos de Tarrazú, Costa Rica
                </a>
              </div>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-5 text-xl font-bold text-[#efb60e]">
            Síguenos
          </h2>

          <div className="flex flex-col gap-4">
            {socialNetworks.map(({ name, href, Icon, symbol }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                className="flex w-fit items-center gap-3 text-sm text-white transition-colors hover:text-[#efb60e]"
              >
                {Icon ? (
                  <Icon size={21} />
                ) : (
                  <span className="flex h-[21px] w-[21px] items-center justify-center text-lg font-bold">
                    {symbol}
                  </span>
                )}
                <span>{name}</span>
              </a>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-5 text-xl font-bold text-[#efb60e]">
            Nuestra ubicación
          </h2>

          <div className="overflow-hidden rounded-lg border border-white/20">
            <iframe
              title="Ubicación de SE-Ferre en Google Maps"
              src={embedUrl}
              width="100%"
              height="200"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-sm text-white/80 transition-colors hover:text-[#efb60e]"
          >
            <MapPin size={16} />
            Cómo llegar
          </a>
        </section>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-white/20 pt-6 text-center text-sm text-white/70">
        <p>
          © {currentYear} SE-Ferre. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
