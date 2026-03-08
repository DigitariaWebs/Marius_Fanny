import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryAPI } from '../lib/CategoryAPI';
import type { Category as CategoryType } from '../types';
import { getImageUrl } from '../utils/api';
import ProductSelection from './ProductSelection';

const styles = {
  cream: '#F9F7F2',
  text: '#2D2A26',
  gold: '#337957',
  fontScript: '"Great Vibes", cursive',
  fontSans: '"Inter", sans-serif',
};

interface Category {
  id: number;
  title: string;
  image: string;
  size: 'large' | 'small';
  childTitles: string[];
}

interface ApiCategoryNode extends CategoryType {
  children?: ApiCategoryNode[];
}

interface CategoryShowcaseProps {
  onCategoryClick?: (categoryId: number, categoryTitle: string) => void;
  onAddToCart: (product: any) => void; // Changé en obligatoire pour ProductSelection
}

const Shop: React.FC<CategoryShowcaseProps> = ({ onCategoryClick, onAddToCart }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<CategoryType[]>([]); // Banner categories from admin
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ÉTAT : Pour savoir quelle catégorie est sélectionnée
  const [selectedCat, setSelectedCat] = useState<{id: number | string, title: string} | null>(null);
  
  // RÉFÉRENCE : Pour le scroll automatique
  const productsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryAPI.getAllCategories();
      const flattenCategories = (nodes: ApiCategoryNode[] = []): ApiCategoryNode[] => {
        const result: ApiCategoryNode[] = [];
        const walk = (items: ApiCategoryNode[]) => {
          items.forEach((item) => {
            result.push(item);
            if (Array.isArray(item.children) && item.children.length > 0) walk(item.children);
          });
        };
        walk(nodes);
        return result;
      };

      const allNodes = flattenCategories((response.data.categories || []) as ApiCategoryNode[]);
      const byId = new Map<number, ApiCategoryNode & { children: ApiCategoryNode[] }>();
      allNodes.forEach((node) => {
        if (typeof node.id !== 'number') return;
        if (!byId.has(node.id)) byId.set(node.id, { ...node, children: [] });
      });
      byId.forEach((node) => {
        if (node.parentId && byId.has(node.parentId)) byId.get(node.parentId)!.children.push(node);
      });

      const rootCategories = Array.from(byId.values())
        .filter((node) => !node.parentId || !byId.has(node.parentId))
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.name.localeCompare(b.name));

      // Filter banner categories (special occasions created by admin)
      const bannerCategories = rootCategories.filter((cat) => cat.isBanner === true);
      setBanners(bannerCategories);

      // Regular categories (non-banner)
      const regularCategories = rootCategories.filter((cat) => cat.isBanner !== true);

      const getAllChildTitles = (children: ApiCategoryNode[] = []): string[] => {
        const titles: string[] = [];
        const walk = (nodes: ApiCategoryNode[]) => {
          nodes.forEach((node) => {
            titles.push(node.name);
            if (Array.isArray(node.children) && node.children.length > 0) walk(node.children);
          });
        };
        walk(children);
        return titles;
      };
      
      const displayCategories: Category[] = regularCategories.map((cat, index) => ({
        id: cat.id,
        title: cat.name,
        image: cat.image || './gateau.jpg',
        size: 'small', // On force 'small' pour que tout soit uniforme et compact
        childTitles: getAllChildTitles(cat.children || []),
      }));
      setCategories(displayCategories);
    } catch (error: any) {
      setError(error?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId: number | string, categoryTitle: string) => {
    setSelectedCat({ id: categoryId, title: categoryTitle });
    if (onCategoryClick) {
      // Only pass number to external handler
      if (typeof categoryId === 'number') {
        onCategoryClick(categoryId, categoryTitle);
      }
    }
    
    // Scroll vers les produits après un court délai
    setTimeout(() => {
      productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  if (loading) return <div className="py-20 text-center">Chargement...</div>;

  return (
    <div className="flex flex-col bg-[#F9F7F2]">
      {/* SPECIAL OCCASION BANNERS */}
      <section className="relative py-8 px-6 bg-gradient-to-r from-amber-50 to-rose-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl" style={{ fontFamily: styles.fontScript, color: '#C5A065' }}>
              Vos Événements Spéciaux
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {banners.length > 0 ? (
              banners.map((banner) => (
                <div
                  key={banner.id}
                  onClick={() => handleCategoryClick(banner.id, banner.name)}
                  className="group relative h-48 md:h-56 overflow-hidden rounded-2xl cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  {/* Background gradient or image */}
                  {banner.image ? (
                    <img 
                      src={getImageUrl(banner.image)} 
                      alt={banner.name}
                      className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div 
                      className="absolute inset-0 transition-all duration-500 group-hover:scale-110"
                      style={{ 
                        background: `linear-gradient(135deg, ${banner.bannerColor || '#C5A065'}dd 0%, ${banner.bannerColor || '#C5A065'}88 100%)`
                      }}
                    />
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                  
                  {/* Decorative elements */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-4 right-4 text-4xl">✨</div>
                    <div className="absolute bottom-4 left-4 text-3xl">🎂</div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 text-center">
                    <h3 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg" style={{ fontFamily: styles.fontScript }}>
                      {banner.name}
                    </h3>
                    <p className="mt-2 text-white/90 font-medium">
                      {banner.description || 'Découvrez notre sélection'}
                    </p>
                    <button className="mt-4 px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full text-sm font-semibold transition-all">
                      Découvrir →
                    </button>
                  </div>
                </div>
              ))
            ) : (
              // Fallback: show message if no banners configured
              <div className="col-span-3 text-center py-8 text-gray-500">
                <p className="text-lg">Pas d'événements spéciaux configurés</p>
                <p className="text-sm mt-2">L'administrateur peut ajouter des catégories bannières depuis le panneau d'administration</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="relative py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 space-y-4">
            <h2 className="text-4xl md:text-5xl" style={{ fontFamily: styles.fontScript, color: styles.gold }}>
              Notre Boutique
            </h2>
            <p className="uppercase tracking-widest text-xs font-bold">Sélectionnez une catégorie</p>
          </div>

          {/* GRILLE COMPACTE */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat) => {
              const isSelected = selectedCat?.id === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id, cat.title)}
                  className={`group relative h-32 md:h-40 overflow-hidden rounded-xl cursor-pointer transition-all duration-300
                    ${isSelected ? 'ring-4 ring-[#337957] shadow-inner' : 'hover:shadow-md'}`}
                >
                  <img
                    src={getImageUrl(cat.image)}
                    alt={cat.title}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-500
                      ${isSelected ? 'scale-100' : 'group-hover:scale-105'}`}
                  />
                  <div className={`absolute inset-0 flex items-center justify-center p-2 transition-all duration-300 ${isSelected ? 'bg-[#337957]/60' : 'bg-black/30 group-hover:bg-black/20'}`}>
                    <h3 className="text-white text-sm md:text-base font-bold uppercase text-center drop-shadow-md">
                      {cat.title}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ZONE D'AFFICHAGE DES PRODUITS */}
      <div ref={productsRef}>
        {selectedCat ? (
          typeof selectedCat.id === 'number' ? (
            <ProductSelection 
              categoryId={selectedCat.id} 
              categoryTitle={selectedCat.title}
              onAddToCart={onAddToCart}
              onBack={() => setSelectedCat(null)}
            />
          ) : (
            // Special occasion - show message or all products
            <div className="py-12 text-center">
              <h3 className="text-2xl" style={{ fontFamily: '"Great Vibes", cursive', color: '#C5A065' }}>
                {selectedCat.title}
              </h3>
              <p className="mt-4 text-gray-600">
                Bientôt disponible - Découvrez nos créations spéciales pour {selectedCat.title}!
              </p>
              <button 
                onClick={() => setSelectedCat(null)}
                className="mt-6 px-6 py-2 bg-[#C5A065] text-white rounded-full"
              >
                Retour aux catégories
              </button>
            </div>
          )
        ) : null}
      </div>
    </div>
  );
};

export default Shop;