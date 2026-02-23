import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const navigate = useNavigate();

  const truckRef = useRef<HTMLDivElement>(null);
  const lilyRef = useRef<HTMLDivElement>(null);
  const tartRef = useRef<HTMLDivElement>(null);
  const tallRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      const floatingElements = [truckRef.current, lilyRef.current, tartRef.current, tallRef.current];

      gsap.set(floatingElements, { opacity: 0, scale: 0.8 });
      
      if (pathRef.current) {
        const pathLength = pathRef.current.getTotalLength();
        gsap.set(pathRef.current, { 
          strokeDasharray: pathLength, 
          strokeDashoffset: pathLength,
          opacity: 0 
        });
      }

      // 1. Dessin du fil doré (plus subtil sur fond clair)
      tl.to(pathRef.current, {
        strokeDashoffset: 0,
        opacity: 0.6,
        duration: 2.5,
        ease: "power2.inOut"
      });

      // 2. Entrée des images (plus douce)
      tl.to(floatingElements, {
        opacity: 1,
        scale: 1,
        duration: 1.5,
        stagger: 0.2,
        ease: "elastic.out(1, 0.75)",
      }, "-=2");

      // 3. Logo et Texte
      tl.fromTo([logoRef.current, contentRef.current], 
        { y: 40, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.2, ease: "power3.out" }, 
        "-=1"
      );

      // 4. Flottement Loop (plus ample et organique)
      floatingElements.forEach((el, i) => {
        if (!el) return;
        gsap.to(el, {
          y: i % 2 === 0 ? "+=15" : "-=15",
          x: i % 2 === 0 ? "+=10" : "-=10",
          rotation: i % 2 === 0 ? 2 : -2,
          duration: 4 + i * 0.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      // Nouveau fond clair, chaleureux (teintes blé/crème)
      className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center py-10 md:py-20 bg-[#FAF8F5]"
    >
      {/* Taches de couleurs floutées en arrière-plan pour un côté moderne */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-200/30 rounded-full blur-[100px] pointer-events-none z-[0]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-orange-200/20 rounded-full blur-[120px] pointer-events-none z-[0]"></div>

      {/* SVG DU COLLIER - Adapté pour le fond clair */}
      <svg
        className="absolute inset-0 w-full h-full z-[1] pointer-events-none hidden sm:block"
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          ref={pathRef}
          d="M-50,200 C250,100 450,400 720,450 C990,500 1200,250 1500,400"
          stroke="#D4B886" /* Un doré un peu plus doux */
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {/* ELEMENTS FLOTTANTS - Ombres douces, bordures blanches pour un effet "premium" */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-[2]">
        
        {/* Camion */}
        <div ref={truckRef} className="absolute top-[10%] left-[5%] md:top-[15%] md:left-[8%] w-36 md:w-72 aspect-video rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)] ring-4 ring-white bg-white">
          <img src="/1.png" alt="Camion" className="w-full h-full object-cover" />
        </div>

        {/* Muguet */}
        <div ref={lilyRef} className="absolute top-[65%] left-[-2%] md:top-[55%] md:left-[8%] w-28 h-28 md:w-48 md:h-48 rounded-full ring-4 ring-white overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.06)] bg-white">
          <img src="/3.png" alt="Muguet" className="w-full h-full object-cover" />
        </div>

        {/* Tarte */}
        <div ref={tartRef} className="absolute bottom-[10%] right-[2%] md:bottom-[15%] md:right-[10%] w-36 h-36 md:w-64 md:h-64 bg-white rounded-full p-2 shadow-[0_30px_60px_rgba(0,0,0,0.1)]">
          <img src="/2.png" alt="Tarte" className="w-full h-full object-cover rounded-full" />
        </div>

        {/* Chocolats */}
        <div ref={tallRef} className="absolute top-[12%] right-[5%] md:top-[18%] md:right-[12%] w-24 h-48 md:w-32 md:h-72 rounded-[40px] ring-4 ring-white overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)] hidden md:block bg-white">
          <img src="/4.png" alt="Gourmandises" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* CONTENU CENTRAL */}
      <div className="relative z-[10] flex flex-col items-center text-center px-6 max-w-full">
        <img
          ref={logoRef}
          src="/logo.avif"
          alt="Marius & Fanny Logo"
          // L'ombre portée est adoucie pour coller au fond clair
          className="w-56 sm:w-72 md:w-96 lg:w-[480px] h-auto object-contain drop-shadow-md mx-auto mb-8 md:mb-12"
        />

        <div ref={contentRef} className="flex flex-col items-center">
          {/* Texte passé en gris/marron très foncé pour la lisibilité sur fond clair */}
          <p className="font-sans text-[#2C241B] text-lg sm:text-xl md:text-2xl max-w-2xl mb-10 leading-relaxed font-light opacity-90">
            L'excellence de la boulangerie provençale.
            <br className="hidden md:block" />
            Tradition, passion et savoir-faire artisanal.
          </p>

          <button
            onClick={() => {
              const shopSection = document.getElementById("shop");
              if (shopSection) {
                shopSection.scrollIntoView({ behavior: "smooth" });
              } else {
                navigate("/products");
              }
            }}
            className="bg-bakery-gold text-bakery-dark px-8 py-3 md:px-10 md:py-4 rounded-sm font-bold uppercase tracking-widest text-xs md:text-sm hover:bg-white hover:scale-105 transition-all duration-300 shadow-[0_10px_30px_rgba(197,160,101,0.3)] hover:shadow-[0_15px_40px_rgba(197,160,101,0.4)]"
          >
            Commander maintenant
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;