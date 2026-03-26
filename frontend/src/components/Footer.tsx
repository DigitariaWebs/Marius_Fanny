import { Phone, MapPin, Instagram, Facebook } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../lib/SettingsContext";

function formatTime(t: string) {
  const [h, m] = t.split(":");
  return `${parseInt(h)}h${m !== "00" ? m : "00"}`;
}

function formatHoursCompact(hours: Record<string, { open: string; close: string; closed: boolean }>) {
  const dayNames = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const shortNames: Record<string, string> = {
    monday: "Lun", tuesday: "Mar", wednesday: "Mer", thursday: "Jeu",
    friday: "Ven", saturday: "Sam", sunday: "Dim",
  };

  const groups: { days: string[]; open: string; close: string }[] = [];
  for (const day of dayNames) {
    const h = hours[day];
    if (!h || h.closed) {
      const last = groups[groups.length - 1];
      if (last && last.open === "closed") {
        last.days.push(day);
      } else {
        groups.push({ days: [day], open: "closed", close: "" });
      }
    } else {
      const last = groups[groups.length - 1];
      if (last && last.open === h.open && last.close === h.close) {
        last.days.push(day);
      } else {
        groups.push({ days: [day], open: h.open, close: h.close });
      }
    }
  }

  return groups.map((g, i) => {
    const label =
      g.days.length === 1
        ? shortNames[g.days[0]]
        : `${shortNames[g.days[0]]} - ${shortNames[g.days[g.days.length - 1]]}`;
    return (
      <p key={i}>
        {label} : {g.open === "closed" ? "Fermé" : `${formatTime(g.open)} à ${formatTime(g.close)}`}
      </p>
    );
  });
}

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const settings = useSettings();

  const mainLinks = [
    { name: "La Boutique", id: "shop" },
    { name: "Notre Histoire", id: "timeline" },
    { name: "Devenir partenaire", id: "devenir-partenaire" },
    { name: "Contacter", id: "contact" },
  ];

  const handleAnchorClick = (id: string) => {
    if (id === "politique-de-retour") {
      navigate("/politique-retour");
      return;
    }
    if (id === "contact") {
      navigate("/contact");
      return;
    }

    if (window.location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(id);
        element?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const element = document.getElementById(id);
      element?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="relative bg-[#F9F7F2] text-[#2D2A26] overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Grid layout - 3 Colonnes */}
        <div className="grid lg:grid-cols-3 gap-12 mb-16 items-start">
          
          {/* Colonne 1 - Nos Boutiques */}
          <div className="order-1">
            <h3 className="text-2xl font-black mb-6 uppercase tracking-wide text-[#337957]">
              Nos Boutiques
            </h3>
            <div className="space-y-6 text-sm">
              {([
                { label: "Laval", address: settings.address, phone: settings.contactPhone, hours: settings.businessHoursLaval },
                { label: "Montréal", address: settings.addressMontreal, phone: settings.contactPhoneMontreal, hours: settings.businessHoursMontreal },
              ] as const).map((loc) => (
                <div key={loc.label}>
                  <div className="flex items-start gap-3 mb-2">
                    <MapPin size={20} className="shrink-0 mt-1 text-[#337957]" />
                    <div>
                      <p className="font-black text-[#337957] uppercase mb-1">{loc.label}</p>
                      <p className="font-bold">{loc.address}</p>
                    </div>
                  </div>
                  <div className="ml-8 text-[#2D2A26]/70">
                    {formatHoursCompact(loc.hours)}
                  </div>
                  <div className="flex items-center gap-3 ml-8 mt-2">
                    <Phone size={18} className="shrink-0 text-[#337957]" />
                    <a href={`tel:${loc.phone.replace(/[^+\d]/g, "")}`} className="hover:text-[#337957] transition-colors font-bold">
                      {loc.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Colonne 2 - MILIEU : Marque & Description */}
          <div className="order-2 flex flex-col items-center text-center px-4">
            <h3 className="text-3xl font-black mb-6 uppercase tracking-widest text-[#337957]">
              {settings.storeName}
            </h3>
            <p className="text-sm font-medium leading-relaxed text-[#2D2A26]/80 max-w-xs mb-8">
              Artisans passionnés depuis des générations, nous mettons tout notre savoir-faire au service de vos papilles pour créer des moments de pure gourmandise.
            </p>
            <div className="flex gap-4">
            </div>
          </div>

          <div className="order-3 lg:text-right">
            <h3 className="text-2xl font-black mb-6 uppercase tracking-wide text-[#337957]">
              Navigation
            </h3>
            <ul className="space-y-3">
              {mainLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => handleAnchorClick(link.id)}
                    className="text-lg font-bold hover:text-[#337957] transition-colors uppercase"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Section décorative (Grand texte en arrière-plan) */}
        <div className="relative overflow-hidden py-8">
          <h2 className="text-[4rem] md:text-[6rem] lg:text-[8rem] font-black uppercase leading-none text-[#337957] tracking-tighter opacity-10">
            PATISSERIE
            <br />
            PROVENCALE
          </h2>
        </div>

        {/* Bas du footer */}
        <div className="border-t-2 border-[#337957]/30 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-[#2D2A26]/70 font-bold">
              Copyright {new Date().getFullYear()} | {settings.storeName}
            </p>

            <div className="flex gap-6">
              <a
                href="#conditions"
                className="text-[#2D2A26]/70 hover:text-[#337957] transition-colors font-bold"
              >
                Conditions d'utilisation
              </a>
              <span className="text-[#2D2A26]/40">|</span>
              <button
                onClick={() => handleAnchorClick("politique-de-retour")}
                className="text-[#2D2A26]/70 hover:text-[#337957] transition-colors font-bold"
              >
                Politique de retour
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;