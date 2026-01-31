import React, { useState } from 'react';
import CategoryShowcase from './CategoryShowcase';
import ProductSelection from './ProductSelection';

const Shop: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<{ id: number; title: string } | null>(null);

  const handleCategoryClick = (categoryId: number, categoryTitle: string) => {
    setSelectedCategory({ id: categoryId, title: categoryTitle });
  };

  return (
    <div className="shop-container">
      {!selectedCategory ? (
        <CategoryShowcase onCategoryClick={handleCategoryClick} />
      ) : (
        <ProductSelection 
          categoryId={selectedCategory.id} 
          categoryTitle={selectedCategory.title} 
          onBack={() => setSelectedCategory(null)}
        />
      )}
    </div>
  );
};

export default Shop;