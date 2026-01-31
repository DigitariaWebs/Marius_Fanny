import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { FiMenu, FiX } from 'react-icons/fi';

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

  const mainLinks = [
    { name: 'La Boutique', id: 'shop' },
    { name: 'Nos Favoris', id: 'best-sellers' },
    { name: 'Notre Histoire', id: 'timeline' },
  ];

  const mobileLinks = [
    ...mainLinks,
    { name: 'Politique de retour', id: 'footer' },
    { name: 'Nous joindre', id: 'footer' },
  ];

  useEffect(() => {
    // 1. On vérifie que les éléments existent bien pour éviter les erreurs TS
    if (!menuRef.current || !linksRef.current) return;

    // 2. On transforme l'HTMLCollection en Array pour GSAP et TS
    const links = Array.from(linksRef.current.children);

    if (isOpen) {
      const tl = gsap.timeline();
      tl.to(menuRef.current, { y: 0, duration: 0.6, ease: 'power3.out' })
        .fromTo(links, 
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out' },
          "-=0.2"
        );
      document.body.style.overflow = 'hidden';
    } else {
      gsap.to(menuRef.current, { y: '-100%', duration: 0.5, ease: 'power3.in' });
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
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-[#1a1a1a] z-[100] pointer-events-none"
        style={{ transform: 'translateY(-100%)' }}
      />

      <nav 
        className="fixed top-0 w-full z-50 transition-all duration-300 border-b border-[#E5E0D8]"
        style={{ backgroundColor: 'rgba(249, 247, 242, 0.95)', backdropFilter: 'blur(8px)' }}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div onClick={() => handleScroll('hero')} className="cursor-pointer z-50">
            <img src="/logo.avif" alt="Logo" className="h-12 w-auto object-contain" />
          </div>

          <div className="hidden md:flex items-center gap-10">
            {mainLinks.map((link) => (
              <button 
                key={link.name} 
                onClick={() => handleScroll(link.id)} 
                className="relative group text-xs font-bold uppercase tracking-[0.2em] py-2"
                style={{ fontFamily: styles.fontSans, color: styles.text }}
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full" style={{ backgroundColor: styles.gold }} />
              </button>
            ))}
            <button onClick={() => handleScroll('footer')} className="px-6 py-2 text-xs font-bold uppercase tracking-widest text-white rounded-sm" style={{ backgroundColor: styles.text }}>
              Contact
            </button>
          </div>

          <div className="flex items-center md:hidden z-50">
            <button className="text-2xl p-2" style={{ color: styles.text }} onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        <div 
          ref={menuRef} 
          className="fixed inset-0 z-40 flex flex-col items-center justify-center md:hidden"
          style={{ backgroundColor: styles.cream, transform: 'translateY(-100%)' }}
        >
          <div ref={linksRef} className="flex flex-col items-center gap-8 z-10 p-6">
            {mobileLinks.map((link) => (
              <button 
                key={link.name} 
                onClick={() => handleScroll(link.id)} 
                className="text-3xl font-script"
                style={{ color: styles.text }}
              >
                {link.name}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;