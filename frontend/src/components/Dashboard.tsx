import { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  LayoutDashboard, 
  LogOut,
  Settings,
  X,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  AlertCircle,
  Eye,
  Filter,
  Download,
  BarChart3
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'En stock' | 'Rupture' | 'Stock bas';
  sales: number;
  revenue: number;
  image?: string;
}

interface Statistics {
  totalProducts: number;
  totalRevenue: number;
  lowStock: number;
  totalSales: number;
  revenueChange: number;
  salesChange: number;
}

interface FormData {
  name: string;
  category: string;
  price: string;
  stock: string;
}

type ViewMode = 'overview' | 'products' | 'settings';

const CATEGORIES = ['Gâteaux', 'Pains', 'Viennoiseries', 'Chocolats', 'Boîtes à lunch', 'À la carte'];

const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: 'La Marguerite (6 pers.)', category: 'Gâteaux', price: 37.50, stock: 120, status: 'En stock', sales: 245, revenue: 9187.50 },
  { id: 2, name: 'Tarte Citron Meringuée', category: 'Gâteaux', price: 29.95, stock: 45, status: 'En stock', sales: 189, revenue: 5660.55 },
  { id: 3, name: 'Baguette Tradition', category: 'Pains', price: 3.50, stock: 0, status: 'Rupture', sales: 312, revenue: 1092 },
  { id: 4, name: 'Pain Campagne Bio', category: 'Pains', price: 4.80, stock: 12, status: 'Stock bas', sales: 98, revenue: 470.40 },
  { id: 5, name: 'Croissant Pur Beurre', category: 'Viennoiseries', price: 2.20, stock: 78, status: 'En stock', sales: 403, revenue: 886.60 },
  { id: 6, name: 'Pain au Chocolat', category: 'Viennoiseries', price: 2.40, stock: 5, status: 'Stock bas', sales: 367, revenue: 880.80 },
  { id: 7, name: 'Macarons Assortis (12 pcs)', category: 'Chocolats', price: 24.00, stock: 34, status: 'En stock', sales: 156, revenue: 3744 },
  { id: 8, name: 'Chocolats Pralinés (250g)', category: 'Chocolats', price: 18.50, stock: 89, status: 'En stock', sales: 178, revenue: 3293 },
  { id: 9, name: 'Plateau Affaires', category: 'Boîtes à lunch', price: 22.00, stock: 45, status: 'En stock', sales: 134, revenue: 2948 },
  { id: 10, name: 'Sandwich Jambon-Beurre', category: 'À la carte', price: 6.50, stock: 67, status: 'En stock', sales: 289, revenue: 1878.50 },
  { id: 11, name: 'Quiche Lorraine', category: 'À la carte', price: 8.90, stock: 23, status: 'En stock', sales: 156, revenue: 1388.40 },
  { id: 12, name: 'Éclair au Chocolat', category: 'Gâteaux', price: 4.50, stock: 15, status: 'Stock bas', sales: 423, revenue: 1903.50 },
];

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('Tous');
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: 'Gâteaux',
    price: '',
    stock: ''
  });

  const gold = "#C5A065";
  const dark = "#2D2A26";

  // Calcul des statistiques
  const calculateStats = (): Statistics => {
    const totalProducts = products.length;
    const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0);
    const lowStock = products.filter(p => p.status === 'Stock bas' || p.status === 'Rupture').length;
    const totalSales = products.reduce((sum, p) => sum + p.sales, 0);
    
    return {
      totalProducts,
      totalRevenue,
      lowStock,
      totalSales,
      revenueChange: 12.5,
      salesChange: 8.3
    };
  };

  const stats = calculateStats();

  // Gestion du formulaire
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({ name: '', category: 'Gâteaux', price: '', stock: '' });
    setEditingProduct(null);
  };

  const handleSubmit = () => {
    const price = parseFloat(formData.price);
    const stock = parseInt(formData.stock);

    if (!formData.name || isNaN(price) || isNaN(stock)) {
      alert('Veuillez remplir tous les champs correctement.');
      return;
    }

    if (editingProduct) {
      // Modifier un produit existant
      setProducts(products.map(p => 
        p.id === editingProduct.id 
          ? {
              ...p,
              name: formData.name,
              category: formData.category,
              price,
              stock,
              status: stock === 0 ? 'Rupture' : stock < 20 ? 'Stock bas' : 'En stock'
            }
          : p
      ));
    } else {
      // Ajouter un nouveau produit
      const newProduct: Product = {
        id: Math.max(...products.map(p => p.id)) + 1,
        name: formData.name,
        category: formData.category,
        price,
        stock,
        status: stock === 0 ? 'Rupture' : stock < 20 ? 'Stock bas' : 'En stock',
        sales: 0,
        revenue: 0
      };
      setProducts([...products, newProduct]);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString()
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce produit ?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  // Filtrage des produits
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'Tous' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Produits les plus vendus
  const topProducts = [...products]
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-[#2D2A26]">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-[#2D2A26] text-white hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-serif tracking-widest text-[#C5A065]">MARIUS & FANNY</h1>
          <p className="text-xs text-gray-400 mt-1 tracking-wider uppercase">Administration</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Vue d'ensemble" 
            active={viewMode === 'overview'}
            onClick={() => setViewMode('overview')}
          />
          <NavItem 
            icon={<Package size={20} />} 
            label="Produits" 
            active={viewMode === 'products'}
            onClick={() => setViewMode('products')}
          />
          <NavItem 
            icon={<Settings size={20} />} 
            label="Paramètres" 
            active={viewMode === 'settings'}
            onClick={() => setViewMode('settings')}
          />
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors w-full p-2">
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* --- CONTENU PRINCIPAL --- */}
      <main className="flex-1 overflow-y-auto">
        
        {/* VUE D'ENSEMBLE */}
        {viewMode === 'overview' && (
          <>
            <header className="bg-white shadow-sm border-b border-gray-100 p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-serif text-[#2D2A26]">Vue d'ensemble</h2>
                  <p className="text-gray-500 mt-1">Tableau de bord et statistiques</p>
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <Download size={18} />
                    <span>Exporter</span>
                  </button>
                </div>
              </div>
            </header>

            <div className="p-8 space-y-6">
              {/* Cartes statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Produits Total"
                  value={stats.totalProducts}
                  icon={<Package size={24} />}
                  color="blue"
                />
                <StatCard
                  title="Chiffre d'Affaires"
                  value={`${stats.totalRevenue.toLocaleString()} €`}
                  change={stats.revenueChange}
                  icon={<DollarSign size={24} />}
                  color="green"
                />
                <StatCard
                  title="Ventes Totales"
                  value={stats.totalSales}
                  change={stats.salesChange}
                  icon={<ShoppingCart size={24} />}
                  color="purple"
                />
                <StatCard
                  title="Alertes Stock"
                  value={stats.lowStock}
                  icon={<AlertCircle size={24} />}
                  color="red"
                  alert={stats.lowStock > 0}
                />
              </div>

              {/* Graphique et Top Produits */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Graphique des ventes */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-serif text-[#2D2A26]">Performance des Ventes</h3>
                    <button className="text-gray-400 hover:text-gray-600">
                      <BarChart3 size={20} />
                    </button>
                  </div>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {CATEGORIES.map((cat, idx) => {
                      const catProducts = products.filter(p => p.category === cat);
                      const catRevenue = catProducts.reduce((sum, p) => sum + p.revenue, 0);
                      const maxRevenue = Math.max(...CATEGORIES.map(c => 
                        products.filter(p => p.category === c).reduce((s, p) => s + p.revenue, 0)
                      ));
                      const height = (catRevenue / maxRevenue) * 100;
                      
                      return (
                        <div key={cat} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full bg-gray-100 rounded-t-lg overflow-hidden relative" style={{ height: '200px' }}>
                            <div 
                              className="absolute bottom-0 w-full bg-gradient-to-t from-[#C5A065] to-[#D4B886] transition-all duration-500 hover:from-[#2D2A26] hover:to-[#3D3A36]"
                              style={{ height: `${height}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 text-center">{cat}</span>
                          <span className="text-sm font-semibold text-[#2D2A26]">{catRevenue.toLocaleString()}€</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top 5 Produits */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-serif text-[#2D2A26] mb-6">Top 5 Ventes</h3>
                  <div className="space-y-4">
                    {topProducts.map((product, idx) => (
                      <div key={product.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#C5A065] text-white flex items-center justify-center text-sm font-bold">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#2D2A26] truncate">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.sales} ventes</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-[#2D2A26]">{product.revenue.toLocaleString()}€</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Produits en alerte */}
              {stats.lowStock > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="text-red-600 mt-1" size={24} />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-red-900 mb-2">Alertes de Stock</h3>
                      <p className="text-red-700 mb-4">
                        {stats.lowStock} produit{stats.lowStock > 1 ? 's' : ''} nécessite{stats.lowStock > 1 ? 'nt' : ''} votre attention
                      </p>
                      <div className="space-y-2">
                        {products
                          .filter(p => p.status === 'Stock bas' || p.status === 'Rupture')
                          .map(product => (
                            <div key={product.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                              <div>
                                <p className="font-medium text-[#2D2A26]">{product.name}</p>
                                <p className="text-sm text-gray-600">{product.stock} unités restantes</p>
                              </div>
                              <StatusBadge status={product.status} />
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* VUE PRODUITS */}
        {viewMode === 'products' && (
          <>
            <header className="bg-white shadow-sm border-b border-gray-100 p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-serif text-[#2D2A26]">Gestion des Produits</h2>
                  <p className="text-gray-500 mt-1">Gérez votre catalogue, vos stocks et vos prix.</p>
                </div>
                
                <button 
                  onClick={() => {
                    resetForm();
                    setIsModalOpen(true);
                  }}
                  className="flex items-center gap-2 bg-[#2D2A26] hover:bg-[#C5A065] text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Plus size={20} />
                  <span className="font-medium">Nouveau Produit</span>
                </button>
              </div>
            </header>

            <div className="p-8">
              {/* Filtres et recherche */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 flex items-center gap-4">
                    <Search className="text-gray-400" size={20} />
                    <input 
                      type="text" 
                      placeholder="Rechercher un produit..." 
                      className="flex-1 outline-none text-[#2D2A26] placeholder-gray-400"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter size={20} className="text-gray-400" />
                    <select 
                      className="px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#C5A065]/50"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="Tous">Toutes catégories</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Tableau des produits */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-100">
                        <th className="p-6">Produit</th>
                        <th className="p-6">Catégorie</th>
                        <th className="p-6">Prix</th>
                        <th className="p-6">Stock</th>
                        <th className="p-6">Ventes</th>
                        <th className="p-6">Revenu</th>
                        <th className="p-6">Statut</th>
                        <th className="p-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                          <td className="p-6 font-medium text-[#2D2A26]">{product.name}</td>
                          <td className="p-6">
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                              {product.category}
                            </span>
                          </td>
                          <td className="p-6 font-semibold">{product.price} €</td>
                          <td className="p-6 text-gray-600">{product.stock} unités</td>
                          <td className="p-6 text-gray-600">{product.sales}</td>
                          <td className="p-6 font-semibold text-[#C5A065]">{product.revenue.toLocaleString()} €</td>
                          <td className="p-6">
                            <StatusBadge status={product.status} />
                          </td>
                          <td className="p-6 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleEdit(product)}
                                className="p-2 text-gray-400 hover:text-[#C5A065] hover:bg-orange-50 rounded-lg transition-colors"
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                onClick={() => handleDelete(product.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {filteredProducts.length === 0 && (
                  <div className="p-12 text-center text-gray-400">
                    <Package size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Aucun produit trouvé</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* VUE PARAMÈTRES */}
        {viewMode === 'settings' && (
          <>
            <header className="bg-white shadow-sm border-b border-gray-100 p-8">
              <h2 className="text-3xl font-serif text-[#2D2A26]">Paramètres</h2>
              <p className="text-gray-500 mt-1">Configuration de votre boutique</p>
            </header>

            <div className="p-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-2xl">
                <h3 className="text-xl font-serif text-[#2D2A26] mb-6">Informations générales</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Nom de la boutique</label>
                    <input 
                      type="text" 
                      defaultValue="MARIUS & FANNY"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email de contact</label>
                    <input 
                      type="email" 
                      defaultValue="contact@mariusetfanny.com"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Seuil de stock bas</label>
                    <input 
                      type="number" 
                      defaultValue="20"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none" 
                    />
                    <p className="text-xs text-gray-500">Les produits avec un stock inférieur à ce seuil seront marqués comme "Stock bas"</p>
                  </div>
                  <button className="w-full bg-[#2D2A26] hover:bg-[#C5A065] text-white font-medium py-3 rounded-lg transition-colors">
                    Enregistrer les modifications
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-serif text-[#2D2A26]">
                {editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}
              </h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nom du produit</label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none" 
                  placeholder="Ex: Croissant aux Amandes"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Catégorie</label>
                <select 
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Prix (€)</label>
                  <input 
                    type="number" 
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none" 
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Stock</label>
                  <input 
                    type="number" 
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A065]/50 outline-none" 
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', e.target.value)}
                  />
                </div>
              </div>

              <button 
                onClick={handleSubmit}
                className="w-full bg-[#2D2A26] hover:bg-[#C5A065] text-white font-medium py-3 rounded-lg transition-colors mt-4"
              >
                {editingProduct ? 'Enregistrer les modifications' : 'Créer le produit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Composants ---

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function NavItem({ icon, label, active = false, onClick }: NavItemProps) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all ${
        active 
          ? 'bg-[#C5A065] text-white shadow-lg' 
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = 
    status === 'En stock' 
      ? 'bg-green-100 text-green-700 border-green-200' 
      : status === 'Stock bas'
      ? 'bg-orange-100 text-orange-700 border-orange-200'
      : 'bg-red-100 text-red-700 border-red-200';
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles}`}>
      {status}
    </span>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'red';
  alert?: boolean;
}

function StatCard({ title, value, change, icon, color, alert }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600'
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${alert ? 'ring-2 ring-red-200' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-[#2D2A26]">{value}</h3>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {change >= 0 ? (
                <TrendingUp size={16} className="text-green-600" />
              ) : (
                <TrendingDown size={16} className="text-red-600" />
              )}
              <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? '+' : ''}{change}%
              </span>
              <span className="text-xs text-gray-400">vs mois dernier</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
