import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Logo et Texte
      tl.fromTo([logoRef.current, contentRef.current], 
        { y: 40, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.2, ease: "power3.out" }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center"
    >
      {/* VIDEO DE FOND */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-[0]"
      >
        <source src="/fanny.mp4" type="video/mp4" />
      </video>

      {/* OVERLAY SOMBRE pour lisibilité */}
      <div className="absolute inset-0 bg-black/30 z-[1]" />

      {/* CONTENU CENTRAL */}
      <div className="relative z-[10] flex flex-col items-center text-center px-6 max-w-full py-10 md:py-20">
        <img
          ref={logoRef}
          src="/logo.avif"
          alt="Marius & Fanny Logo"
          className="w-40 sm:w-52 md:w-64 lg:w-80 h-auto object-contain drop-shadow-xl mx-auto mb-8 md:mb-12 mt-16 md:mt-20"
        />

        <div ref={contentRef} className="flex flex-col items-center">
          <p className="font-sans text-white text-lg sm:text-xl md:text-2xl max-w-2xl mb-10 leading-relaxed font-light opacity-90 drop-shadow">
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
            className="bg-white text-[#2D2A26] px-8 py-3 md:px-10 md:py-4 rounded-sm font-bold uppercase tracking-widest text-xs md:text-sm hover:bg-[#337957] hover:text-white hover:scale-105 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.3)]"
          >
            Commander maintenant
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;