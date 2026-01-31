import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { FiMenu, FiX } from 'react-icons/fi';

// Styles cohérents
const styles = {
  cream: '#F9F7F2',
  gold: '#C5A065',
  text: '#2D2A26',
  fontScript: '"Great Vibes", cursive',
  fontSans: '"Inter", sans-serif',
};

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Liens Desktop
  const mainLinks = [
    { name: 'La Boutique', id: 'shop' },
    { name: 'Nos Favoris', id: 'best-sellers' },
    { name: 'Notre Histoire', id: 'timeline' },
  ];

  // Liens Mobile (inclut les liens footer pour l'accessibilité mobile)
  const mobileLinks = [
    ...mainLinks,
    { name: 'Politique de retour', id: 'footer' },
    { name: 'Nous joindre', id: 'footer' },
  ];

  // Animation Menu Mobile
  useEffect(() => {
    // Si on est sur PC (largeur > 768px), on ne lance pas l'animation mobile
    if (window.innerWidth > 768 && !isOpen) return;

    const menu = menuRef.current;
    const links = linksRef.current?.children;

    if (isOpen) {
      const tl = gsap.timeline();
      tl.to(menu, { y: 0, duration: 0.6, ease: 'power3.out' })
        .fromTo(links, 
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out' },
          "-=0.2"
        );
      document.body.style.overflow = 'hidden';
    } else {
      gsap.to(menu, { y: '-100%', duration: 0.5, ease: 'power3.in' });
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const handleScroll = (id: string) => {
    const target = document.getElementById(id);
    if (isOpen) setIsOpen(false);

    if (target && overlayRef.current) {
      const tl = gsap.timeline();
      tl.to(overlayRef.current, {
        yPercent: 100,
        duration: 0.6,
        ease: "expo.inOut"
      })
      .add(() => {
        target.scrollIntoView({ behavior: 'auto' });
      })
      .to(overlayRef.current, {
        yPercent: 200,
        duration: 0.6,
        ease: "expo.inOut",
        onComplete: () => {
          gsap.set(overlayRef.current, { yPercent: -100 });
        }
      });
    }
  };

  return (
    <>
      {/* --- OVERLAY DE TRANSITION --- */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-[#1a1a1a] z-[100] pointer-events-none"
        style={{ transform: 'translateY(-100%)' }}
      />

      {/* --- NAVBAR --- */}
      <nav 
        className="fixed top-0 w-full z-50 transition-all duration-300 border-b border-[#E5E0D8]"
        style={{ backgroundColor: 'rgba(249, 247, 242, 0.95)', backdropFilter: 'blur(8px)' }}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          
          {/* LOGO */}
          <div onClick={() => handleScroll('hero')} className="cursor-pointer z-50 hover:opacity-80 transition-opacity">
            <img 
              src="/logo.avif" 
              alt="Marius et Fanny" 
              className="h-12 w-auto object-contain" 
            />
          </div>

          {/* --- MENU DESKTOP (Visible uniquement sur md et plus) --- */}
          <div className="hidden md:flex items-center gap-10">
            {mainLinks.map((link) => (
              <button 
                key={link.name} 
                onClick={() => handleScroll(link.id)} 
                className="relative group text-xs font-bold uppercase tracking-[0.2em] py-2"
                style={{ fontFamily: styles.fontSans, color: styles.text }}
              >
                {link.name}
                <span 
                  className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                  style={{ backgroundColor: styles.gold }}
                />
              </button>
            ))}
            
            <button
              onClick={() => handleScroll('footer')}
              className="px-6 py-2 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-opacity-90 hover:shadow-lg rounded-sm"
              style={{ backgroundColor: styles.text }}
            >
              Contact
            </button>
          </div>

          {/* --- BOUTON HAMBURGER (Visible uniquement sur mobile - md:hidden) --- */}
          <div className="flex items-center md:hidden z-50">
            <button 
              className="text-2xl p-2 focus:outline-none"
              style={{ color: styles.text }}
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        {/* --- MENU MOBILE PLEIN ÉCRAN --- */}
        {/* Ajout de 'md:hidden' ici pour forcer la disparition sur PC */}
        <div 
          ref={menuRef} 
          className="fixed inset-0 z-40 flex flex-col items-center justify-center md:hidden"
          style={{ backgroundColor: styles.cream, transform: 'translateY(-100%)' }}
        >
          {/* Fond décoratif */}
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('/logo.avif')] bg-no-repeat bg-center bg-contain grayscale" />

          <div ref={linksRef} className="flex flex-col items-center gap-8 z-10 p-6">
            {mobileLinks.map((link) => (
              <button 
                key={link.name} 
                onClick={() => handleScroll(link.id)} 
                className="text-3xl font-script hover:text-[#C5A065] transition-colors"
                style={{ color: styles.text }}
              >
                {link.name}
              </button>
            ))}
            
            <div className="w-16 h-px my-4" style={{ backgroundColor: styles.gold }} />
            
            <p className="text-xs uppercase tracking-widest opacity-60">
              Marius et Fanny
            </p>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;