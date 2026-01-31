import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { FiMenu, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const mainLinks = [
    { name: 'La Boutique', id: 'shop' },
    { name: 'Nos Favoris', id: 'best-sellers' },
    { name: 'Notre Histoire', id: 'timeline' },
    { name: 'Politique de retour', id: 'politique-de-retour' },
  ];

  const mobileLinks = [
    { name: 'La Boutique', id: 'shop' },
    { name: 'Nos Favoris', id: 'best-sellers' },
    { name: 'Notre Histoire', id: 'timeline' },
    { name: 'Politique de retour', id: 'politique-de-retour' },
    { name: 'Nous joindre', id: 'footer' },
  ];

  const handleAnchorClick = (id: string) => {
    if (isOpen) setIsOpen(false);

    if (id === 'politique-de-retour') {
      // Navigation vers la page séparée
      navigate('/politique-retour');
    } else {
      // Navigation par ancres sur la page d'accueil
      if (window.location.pathname !== '/') {
        navigate('/');
        // Petit délai pour laisser la page se charger
        setTimeout(() => {
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  const handleMobileClick = (id: string) => {
    if (id === 'politique-de-retour') {
      setIsOpen(false);
      navigate('/politique-retour');
    } else {
      // Fermer le menu mobile avant de scroller
      setIsOpen(false);
      
      // Si on n'est pas sur la page d'accueil, y aller d'abord
      if (window.location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        // Petit délai pour que le menu se ferme
        setTimeout(() => {
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 300);
      }
    }
  };

  const handleHeroClick = () => {
    if (window.location.pathname !== '/') {
      navigate('/');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleContactClick = () => {
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById('footer');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById('footer');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    if (!menuRef.current || !linksRef.current) return;

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

    // Nettoyage
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
          <button 
            onClick={handleHeroClick} 
            className="cursor-pointer z-50 focus:outline-none"
          >
            <img src="/logo.avif" alt="Logo" className="h-12 w-auto object-contain" />
          </button>

          <div className="hidden md:flex items-center gap-10">
            {mainLinks.map((link) => (
              <button 
                key={link.name} 
                onClick={() => handleAnchorClick(link.id)} 
                className="relative group text-xs font-bold uppercase tracking-[0.2em] py-2 focus:outline-none"
                style={{ fontFamily: styles.fontSans, color: styles.text }}
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full" style={{ backgroundColor: styles.gold }} />
              </button>
            ))}
            <button 
              onClick={handleContactClick} 
              className="px-6 py-2 text-xs font-bold uppercase tracking-widest text-white rounded-sm focus:outline-none" 
              style={{ backgroundColor: styles.text }}
            >
              Nous Contacter
            </button>
          </div>

          <div className="flex items-center md:hidden z-50">
            <button 
              className="text-2xl p-2 focus:outline-none" 
              style={{ color: styles.text }} 
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
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
                key={`${link.name}-${link.id}`} 
                onClick={() => handleMobileClick(link.id)} 
                className="text-3xl font-script focus:outline-none"
                style={{ 
                  color: styles.text,
                  fontFamily: link.id === 'politique-de-retour' ? styles.fontSans : styles.fontScript 
                }}
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