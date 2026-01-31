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
import Politique from './components/Politique';

const HomePage: React.FC = () => {
  return (
    <>
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
    </>
  );
};

const ProductsPage: React.FC = () => {
  return (
    <>
      <Navbar />
      <main className="py-10">
        <ProductSelection />
      </main>
      <section id="footer">
        <Footer />
      </section>
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="bg-bakery-cream min-h-screen text-bakery-text bg-grain">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/politique-retour" element={<Politique />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;