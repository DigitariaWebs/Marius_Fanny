import React from 'react';
import { useNavigate } from 'react-router-dom';

// Définition de l'interface pour les props
interface ShopProps {
  onAddToCart?: (product: any) => void;
}

// Définition de l'interface pour une catégorie
interface Category {
  id: number;
  title: string;
  image: string;
  description: string;
}

const Shop: React.FC<ShopProps> = () => {
  const navigate = useNavigate();

  const categories: Category[] = [
    { id: 1, title: "Pâtisseries", image: "./gateau.jpg", description: "Nos créations sucrées" },
    { id: 2, title: "Pains", image: "./pain1.jpg", description: "Farines biologiques" },
    { id: 3, title: "Viennoiseries", image: "./croi1.jpg", description: "Pur beurre AOP" },
    { id: 5, title: "Lunch", image: "./boite.jpg", description: "Fraîcheur midi" },
  ];

  // Cette fonction gère le clic et envoie l'utilisateur sur la page /products
  // avec les informations de la catégorie dans l'URL
  const handleCategoryClick = (cat: Category) => {
    navigate(`/products?category=${cat.id}&title=${encodeURIComponent(cat.title)}`);
  };

  return (
    <section className="py-20 px-4 bg-transparent">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-serif text-[#2D2A26] mb-4" style={{ fontFamily: '"Great Vibes", cursive' }}>
            Notre Boutique
          </h2>
          <div className="w-24 h-1 mx-auto bg-[#C5A065] mb-6 rounded-full"></div>
          <p className="text-stone-500 italic uppercase tracking-widest text-sm">
            Choisissez une catégorie pour découvrir nos délices
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div 
              key={cat.id}
              onClick={() => handleCategoryClick(cat)}
              className="group relative h-[450px] overflow-hidden rounded-2xl cursor-pointer shadow-lg transition-all duration-500 border-4 border-white"
            >
              {/* Image de fond */}
              <img 
                src={cat.image} 
                alt={cat.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              
              {/* Overlay dégradé pour la lisibilité */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-70 transition-opacity" />
              
              {/* Contenu texte */}
              <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                <h3 className="text-3xl font-serif mb-2 transform transition-transform duration-500 group-hover:-translate-y-2">
                  {cat.title}
                </h3>
                <div className="w-12 h-1 bg-[#C5A065] mb-4 transition-all duration-500 group-hover:w-full"></div>
                <p className="text-sm text-stone-300 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 font-light">
                  {cat.description}
                </p>
                <span className="mt-4 text-[10px] uppercase tracking-[0.2em] text-[#C5A065] font-bold">
                  Voir la sélection →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Shop;