import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// --- Styles ---
const styles = {
  cream: '#F9F7F2',
  white: '#FFFFFF',
  text: '#2D2A26',
  gold: '#C5A065',
  fontScript: '"Great Vibes", cursive',
  fontSans: '"Inter", sans-serif',
};

// --- Interfaces ---
interface Product {
  id: number;
  categoryId: number; // Pour les sous-catégories, on utilisera des ID spécifiques (ex: 51, 52...)
  name: string;
  description: string;
  price: number;
  image: string;
  tag?: string;
  allergens?: string[];
}

interface ProductSelectionProps {
  categoryId?: number;
  categoryTitle?: string;
  onBack?: () => void;
}

// --- Configuration des Sous-Catégories (Boîte à lunch - ID 5) ---
const LUNCH_SUBCATEGORIES = [
  { id: 51, title: "Boite à lunch", image: "./boite.jpg" }, // Remplacez par vos images réelles
  { id: 52, title: "Salade repas", image: "./salade.jpg" },
  { id: 53, title: "Plateau repas", image: "./plateau.jpg" },
  { id: 54, title: "Option végétarienne", image: "./vege.jpg" },
];

// --- Mock Data (Vos données + Nouveaux produits pour le lunch) ---
const ALL_PRODUCTS: Product[] = [
  // --- Vos produits existants ---
  { 
    id: 101, categoryId: 1, name: "La marguerite", description: "Mousse mascarpone, roulade nature, framboise, 6 ou 12 personnes", price: 37.50, image: "./gateau.jpg", tag: "en stock", allergens: ["Gluten", "Lait", "Oeufs", "Fruits à coque"]
  },
  { 
    id: 102, categoryId: 1, name: "Tarte citron", description: "Tarte citron meringuée, 6 personnes", price: 29.95, image: "./fav4.jpg", tag: "en stock", allergens: ["Lait", "Oeufs", "Gluten"]
  },
  { 
    id: 201, categoryId: 2, name: "Baguette", description: "Farine blanche, Eau, Sel, Levure, Pâte fermentée", price: 3.50, image: "./pain1.jpg", tag: "en stock", allergens: ["Gluten (Blé)"]
  },
  {
    id: 202, categoryId: 2, name: "Carré blanc", description: "Farine blanche, Eau, Sel, Levure, Pâte fermentée", price: 5.95, image: "./pain2.jpg", tag: "en stock", allergens: ["Gluten (Blé)"] 
  },
  {
    id: 301, categoryId: 3, name: "Croissant", description: "Farine blanche, Beurre, Eau, Sel, Levure, Sucre", price: 2.75, image: "./croi1.jpg", tag: "en stock", allergens: ["Gluten (Blé)", "Lait"]
  },

  // --- NOUVEAUX PRODUITS POUR LA BOÎTE À LUNCH ---
  // ID 51: Boite à lunch classique
  { id: 5101, categoryId: 51, name: "Le Parisien", description: "Sandwich jambon beurre, fromage, dessert du jour et boisson.", price: 12.50, image: "./boite.jpg", allergens: ["Gluten", "Lait"] },
  { id: 5102, categoryId: 51, name: "Le Club", description: "Club sandwich poulet, mayonnaise maison, chips et dessert.", price: 13.50, image: "./boite.jpg", allergens: ["Gluten", "Oeufs"] },

  // ID 52: Salades
  { id: 5201, categoryId: 52, name: "Salade César", description: "Poulet grillé, parmesan, croûtons, sauce césar maison.", price: 14.00, image: "./salade.jpg", allergens: ["Lait", "Gluten", "Oeufs"] },
  
  // ID 53: Plateau repas
  { id: 5301, categoryId: 53, name: "Plateau Affaires", description: "Entrée, plat chaud, fromages affinés et dessert signature.", price: 22.00, image: "./plateau.jpg", allergens: ["Lait", "Gluten"] },

  // ID 54: Végétarien
  { id: 5401, categoryId: 54, name: "Wrap Végé", description: "Galette, légumes grillés, houmous, feta.", price: 11.50, image: "./vege.jpg", tag: "Végétarien", allergens: ["Gluten", "Lait"] },
];

const ProductSelection: React.FC<ProductSelectionProps> = ({ 
  categoryId, 
  categoryTitle, 
  onBack 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // États principaux
  const [currentCategory, setCurrentCategory] = useState<{ id: number; title: string } | null>(null);
  const [subCategory, setSubCategory] = useState<{ id: number; title: string } | null>(null);
  
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Scroll en haut à chaque changement majeur
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentCategory, subCategory]);

  // Initialisation depuis Props ou URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlCategoryId = searchParams.get('category');
    const urlCategoryTitle = searchParams.get('title');
    
    let activeId: number | null = null;
    let activeTitle: string = '';

    if (categoryId && categoryTitle) {
      activeId = categoryId;
      activeTitle = categoryTitle;
    } else if (urlCategoryId && urlCategoryTitle) {
      activeId = parseInt(urlCategoryId);
      activeTitle = decodeURIComponent(urlCategoryTitle);
    }

    if (activeId) {
      setCurrentCategory({ id: activeId, title: activeTitle });
      // Reset subcategory quand on change de catégorie principale
      setSubCategory(null);
    }
  }, [location.search, categoryId, categoryTitle]);

  // Filtrage des produits (dépend de si on est dans une sous-catégorie ou non)
  useEffect(() => {
    if (!currentCategory) return;

    let targetId = currentCategory.id;

    // Si on est dans le mode "Boite à lunch" (ID 5) et qu'une sous-catégorie est sélectionnée
    if (currentCategory.id === 5 && subCategory) {
      targetId = subCategory.id;
    }

    const products = ALL_PRODUCTS.filter(p => p.categoryId === targetId);
    setFilteredProducts(products);
  }, [currentCategory, subCategory]);

  // Gestion intelligente du bouton Retour
  const handleBack = () => {
    // 1. Si on est dans une sous-catégorie (ex: Salade), on revient à la liste des choix Lunch
    if (currentCategory?.id === 5 && subCategory) {
      setSubCategory(null);
      return;
    }

    // 2. Sinon, on revient à l'accueil
    if (onBack) onBack();
    else navigate(-1);
  };

  // Empêcher le scroll si modale ouverte
  useEffect(() => {
    document.body.style.overflow = selectedProduct ? 'hidden' : 'unset';
  }, [selectedProduct]);

  if (!currentCategory) return <div className="h-screen flex items-center justify-center">Chargement...</div>;

  // --- RENDU CONDITIONNEL : Afficher le choix des sous-catégories OU la liste des produits ---
  const showSubCategories = currentCategory.id === 5 && !subCategory;

  return (
    <div className="min-h-screen py-12 px-6 relative fade-in" style={{ backgroundColor: styles.cream, fontFamily: styles.fontSans, color: styles.text }}>
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-4 mb-12 text-sm uppercase tracking-widest opacity-60">
          <button onClick={handleBack} className="hover:text-black transition-colors flex items-center gap-2 group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Retour
          </button>
          <span>/</span>
          <span className="font-bold" style={{ color: styles.gold }}>
            {subCategory ? subCategory.title : currentCategory.title}
          </span>
        </nav>

        {/* Header */}
        <header className="mb-16 text-center">
          <h1 className="text-5xl md:text-6xl mb-4" style={{ fontFamily: styles.fontScript, color: styles.gold }}>
            {subCategory ? subCategory.title : currentCategory.title}
          </h1>
          <p className="max-w-xl mx-auto opacity-70 leading-relaxed">
            {showSubCategories 
              ? "La solution parfaite pour vos repas sur le pouce ou vos dîners d’affaires." 
              : "Cliquez sur un produit pour voir le détail des ingrédients et les allergènes."}
          </p>
        </header>
        
        {/* --- CAS 1 : Affichage des Sous-Catégories (Spécifique ID 5) --- */}
        {showSubCategories ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {LUNCH_SUBCATEGORIES.map((sub) => (
              <div 
                key={sub.id}
                onClick={() => setSubCategory({ id: sub.id, title: sub.title })}
                className="group relative h-64 overflow-hidden rounded-lg cursor-pointer shadow-md hover:shadow-xl transition-all duration-500"
              >
                <img 
                  src={sub.image} 
                  alt={sub.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <h3 className="text-white text-xl font-bold uppercase tracking-wide group-hover:text-[#C5A065] transition-colors">
                    {sub.title}
                  </h3>
                  <div className="h-0.5 w-8 bg-[#C5A065] mt-2 group-hover:w-full transition-all duration-500" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* --- CAS 2 : Affichage de la grille de produits (Standard) --- */
          filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
              {filteredProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="group flex flex-col cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-sm mb-6 bg-gray-100 shadow-sm group-hover:shadow-xl transition-all duration-500">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {product.tag && (
                      <span className="absolute top-4 left-4 bg-white/95 px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur-sm">
                        {product.tag}
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <span className="bg-white/90 text-black px-6 py-2 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 text-xs uppercase tracking-widest font-bold">
                        Voir détails
                      </span>
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-medium font-serif group-hover:text-[#C5A065] transition-colors">{product.name}</h3>
                    <p className="text-lg font-bold" style={{ color: styles.gold }}>
                      {product.price.toFixed(2)} €
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-stone-300 rounded-lg">
              <p className="text-xl opacity-50">Aucun produit disponible dans cette section pour le moment.</p>
              <button onClick={handleBack} className="mt-4 underline">Retour</button>
            </div>
          )
        )}
      </div>

      {/* --- MODALE PRODUIT (Inchangée mais toujours fonctionnelle) --- */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedProduct(null)}
          />
          <div 
            className="relative bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-[fadeIn_0.3s_ease-out]"
            style={{ backgroundColor: styles.cream }}
          >
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors text-xl font-bold"
            >
              ×
            </button>

            <div className="w-full md:w-1/2 h-64 md:h-auto relative">
              <img 
                src={selectedProduct.image} 
                alt={selectedProduct.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] opacity-50 block mb-2">
                  {subCategory ? subCategory.title : currentCategory.title}
                </span>
                <h2 className="text-3xl md:text-4xl font-serif mb-4" style={{ color: styles.text }}>
                  {selectedProduct.name}
                </h2>
                <div className="w-12 h-1 mb-6" style={{ backgroundColor: styles.gold }} />
                
                <p className="text-lg opacity-80 leading-relaxed mb-8">
                  {selectedProduct.description}
                </p>

                {selectedProduct.allergens && selectedProduct.allergens.length > 0 && (
                  <div className="mb-8 p-4 bg-white/50 rounded-lg border border-[#C5A065]/20">
                    <h4 className="text-xs font-bold uppercase tracking-widest mb-3 opacity-70 flex items-center gap-2">
                      ⚠️ Allergènes présents
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.allergens.map((allergen, index) => (
                        <span key={index} className="px-3 py-1 bg-white text-xs font-medium rounded-full border border-stone-200 text-stone-600">
                          {allergen}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-stone-200 mt-auto flex items-center justify-between gap-4">
                <span className="text-3xl font-bold" style={{ color: styles.gold }}>
                  {selectedProduct.price.toFixed(2)} €
                </span>
                <button className="flex-1 py-4 bg-[#2D2A26] text-white uppercase tracking-widest text-sm font-bold hover:bg-[#C5A065] transition-colors rounded-sm">
                  Ajouter au panier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSelection;