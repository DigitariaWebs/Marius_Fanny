import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BestSellers from './components/BestSellers'; 
import ParallaxSection from './components/ParallaxSection';
import Time from './components/Timeline';
import Footer from './components/Footer';
import Shop from './components/Shop';
import ProductSelection from './components/ProductSelection';

const HomePage: React.FC = () => {
  return (
    <div className="bg-bakery-cream min-h-screen text-bakery-text bg-grain">
      <Navbar />
      <main>
        <Hero />
        <section id="shop">
          <Shop />
        </section>
        <section id="best-sellers">
          <BestSellers /> 
        </section>
        <section id="timeline">
          <Time />
        </section>
        <ParallaxSection />
      </main>
      <section id="footer">
        <Footer />
      </section>
    </div>
  );
};

const ProductsPage: React.FC = () => {
  return (
    <div className="bg-bakery-cream min-h-screen text-bakery-text bg-grain">
      <Navbar />
      <main className="py-10">
        <ProductSelection />
      </main>
      <section id="footer">
        <Footer />
      </section>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
      </Routes>
    </Router>
  );
}

export default App;