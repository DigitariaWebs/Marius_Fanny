import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChefHat, 
  Clock, 
  Package, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Search,
  Printer,
  Download,
  RefreshCw,
  LayoutGrid,
  List,
  LogOut,
  Menu,
  X,
  MapPin,
  Phone
} from "lucide-react";
import { authClient } from "../lib/AuthClient";
import GoldenBackground from "./GoldenBackground";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface ProductionItem {
  id: string;
  orderId: string;
  orderNumber: string;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  productionType?: "patisserie" | "cuisinier" | null;
  customerName: string;
  customerPhone: string;
  deliveryDate: string;
  deliveryTimeSlot: string;
  deliveryType: "pickup" | "delivery";
  pickupLocation: string;
  orderStatus: string;
  notes: string;
  done: boolean;
}

interface GroupedProduct {
  productId: number;
  productName: string;
  totalQuantity: number;
  items: ProductionItem[];
}

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
      className={`
        flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200
        relative group
        ${
          active
            ? "bg-gradient-to-r from-[#C5A065] to-[#b8935a] text-white shadow-lg shadow-[#C5A065]/30"
            : "text-stone-600 hover:bg-stone-100 hover:text-[#C5A065]"
        }
      `}
    >
      <span
        className={`${active ? "scale-110" : "group-hover:scale-110"} transition-transform`}
      >
        {icon}
      </span>
      <span className="font-medium text-sm">{label}</span>
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#C5A065] rounded-r-full" />
      )}
    </button>
  );
}

const PatissierDashboard: React.FC = () => {
  const [productionItems, setProductionItems] = useState<ProductionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [viewMode, setViewMode] = useState<"list" | "orders">("list");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const loadSavedStatuses = (): Record<string, boolean> => {
    try {
      const saved = localStorage.getItem(`patissier-done-${selectedDate}`);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  };

  const saveStatuses = (items: ProductionItem[]) => {
    const statuses: Record<string, boolean> = {};
    items.forEach((item) => {
      if (item.done) {
        statuses[item.id] = item.done;
      }
    });
    localStorage.setItem(`patissier-done-${selectedDate}`, JSON.stringify(statuses));
  };

  useEffect(() => {
    fetchProductionData();
  }, [selectedDate]);

  const fetchProductionData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/api/orders/production?date=${selectedDate}`,
        {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const savedStatuses = loadSavedStatuses();

      // Filter only items for patissier (productionType === "patisserie")
      const patissierItems = (data.data?.items || [])
        .filter((item: ProductionItem) => item.productionType === "patisserie")
        .map((item: ProductionItem) => ({
          ...item,
          done: savedStatuses[item.id] || false,
        }));

      setProductionItems(patissierItems);
    } catch (err: any) {
      console.error("Error loading production data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleDone = (itemId: string) => {
    setProductionItems((prev) => {
      const updated = prev.map((item) =>
        item.id === itemId ? { ...item, done: !item.done } : item
      );
      saveStatuses(updated);
      return updated;
    });
  };

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      navigate("/se-connecter");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const groupedProducts: GroupedProduct[] = Object.values(
    productionItems.reduce((acc, item) => {
      if (!acc[item.productId]) {
        acc[item.productId] = {
          productId: item.productId,
          productName: item.productName,
          totalQuantity: 0,
          items: [],
        };
      }
      acc[item.productId].totalQuantity += item.quantity;
      acc[item.productId].items.push(item);
      return acc;
    }, {} as Record<number, GroupedProduct>)
  );

  const filteredProducts = groupedProducts.filter((product) =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItemsToProduce = productionItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const completedItems = productionItems.filter((item) => item.done).length;
  const completionPercentage =
    productionItems.length > 0
      ? Math.round((completedItems / productionItems.length) * 100)
      : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const csvContent = [
      ["Produit", "Quantité Totale", "Client", "Date Livraison", "Notes"],
      ...productionItems.map((item) => [
        item.productName,
        item.quantity,
        item.customerName,
        item.deliveryDate,
        item.notes,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `production-patissier-${selectedDate}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F9F7F2]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-[#C5A065]" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F9F7F2]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold mb-2">Erreur</p>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchProductionData}
            className="mt-4 px-4 py-2 bg-[#C5A065] text-white rounded-lg hover:bg-[#b8935a]"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen bg-[#F9F7F2] font-sans text-stone-800">
      <div className="fixed inset-0 z-0 opacity-30">
        <GoldenBackground />
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        w-72 bg-white/80 backdrop-blur-md text-stone-800 flex flex-col shadow-2xl border-r border-stone-200/50 relative z-20
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-stone-200/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1
                className="text-2xl mb-1"
                style={{
                  fontFamily: '"Great Vibes", cursive',
                  color: "#C5A065",
                }}
              >
                Marius & Fanny
              </h1>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-500">
                Pâtissier
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-stone-400 hover:text-[#C5A065] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {/* Production Section */}
          <div className="pb-4">
            <p className="text-[9px] font-black text-stone-400 uppercase tracking-[0.3em] mb-3 px-3">
              Production
            </p>
            <div className="space-y-2">
              <NavItem
                icon={<ChefHat size={20} />}
                label="Liste de production"
                active={true}
              />
            </div>
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-stone-200/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 rounded-xl text-stone-600 hover:bg-red-50 hover:text-red-600 transition-all border border-stone-200 hover:border-red-200"
          >
            <LogOut size={20} />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative z-10">
        {/* Mobile Header */}
        <div className="md:hidden bg-white/80 backdrop-blur-md border-b border-stone-200 p-4 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-stone-600 hover:text-[#C5A065]"
          >
            <Menu size={24} />
          </button>
          <h1
            className="text-xl"
            style={{ fontFamily: '"Great Vibes", cursive', color: "#C5A065" }}
          >
            Marius & Fanny
          </h1>
          <div className="w-6" />
        </div>

        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-sm p-6 mb-6 border border-stone-200/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <ChefHat className="w-8 h-8 text-[#C5A065]" />
                <div>
                  <h2
                    className="text-3xl md:text-4xl mb-1"
                    style={{
                      fontFamily: '"Great Vibes", cursive',
                      color: "#C5A065",
                    }}
                  >
                    Liste de Production - Pâtisserie
                  </h2>
                  <p className="text-stone-600">
                    Gestion des pâtisseries
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 print:hidden">
                <button
                  onClick={handlePrint}
                  className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg"
                  title="Imprimer"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button
                  onClick={handleExport}
                  className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg"
                  title="Exporter CSV"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={fetchProductionData}
                  className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg"
                  title="Actualiser"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200/50">
                <div className="flex items-center gap-3">
                  <Package className="w-6 h-6 text-amber-600" />
                  <div>
                    <p className="text-sm text-stone-600">Total Produits</p>
                    <p className="text-2xl font-bold text-stone-900">
                      {filteredProducts.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200/50">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-stone-600">Quantité Totale</p>
                    <p className="text-2xl font-bold text-stone-900">
                      {totalItemsToProduce}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200/50">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="text-sm text-stone-600">Complété</p>
                    <p className="text-2xl font-bold text-stone-900">
                      {completedItems}/{productionItems.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200/50">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-purple-600" />
                  <div>
                    <p className="text-sm text-stone-600">Progression</p>
                    <p className="text-2xl font-bold text-stone-900">
                      {completionPercentage}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 print:hidden">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un produit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#C5A065] focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-stone-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#C5A065] focus:border-transparent"
                />
              </div>
              <div className="flex bg-stone-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    viewMode === "list"
                      ? "bg-white shadow-sm text-[#C5A065]"
                      : "text-stone-600"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Regroupé
                </button>
                <button
                  onClick={() => setViewMode("orders")}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    viewMode === "orders"
                      ? "bg-white shadow-sm text-[#C5A065]"
                      : "text-stone-600"
                  }`}
                >
                  <List className="w-4 h-4" />
                  Par Commande
                </button>
              </div>
            </div>
          </div>

          {/* Production List */}
          {viewMode === "list" ? (
            <div className="space-y-4">
              {filteredProducts.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-sm p-8 text-center border border-stone-200/50">
                  <Package className="w-12 h-12 text-stone-400 mx-auto mb-4" />
                  <p className="text-stone-600">
                    Aucun produit à produire pour cette date
                  </p>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product.productId}
                    className="bg-white/80 backdrop-blur-md rounded-lg shadow-sm p-6 border border-stone-200/50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-stone-900">
                          {product.productName}
                        </h3>
                        <p className="text-sm text-stone-600">
                          Quantité totale: {product.totalQuantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-stone-600">
                          {product.items.filter((i) => i.done).length} /{" "}
                          {product.items.length} commandes terminées
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {product.items.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center gap-4 p-4 rounded-lg border ${
                            item.done
                              ? "bg-green-50 border-green-200"
                              : "bg-stone-50 border-stone-200"
                          }`}
                        >
                          <button
                            onClick={() => toggleDone(item.id)}
                            className="shrink-0"
                          >
                            {item.done ? (
                              <CheckCircle2 className="w-6 h-6 text-green-600" />
                            ) : (
                              <div className="w-6 h-6 border-2 border-stone-300 rounded-full" />
                            )}
                          </button>
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-stone-600">Commande</p>
                              <p className="font-medium">{item.orderNumber}</p>
                            </div>
                            <div>
                              <p className="text-sm text-stone-600">Quantité</p>
                              <p className="font-medium">{item.quantity}</p>
                            </div>
                            <div>
                              <p className="text-sm text-stone-600">Client</p>
                              <p className="font-medium">{item.customerName}</p>
                            </div>
                            <div>
                              <p className="text-sm text-stone-600">Livraison</p>
                              <p className="font-medium">
                                {item.deliveryDate} - {item.deliveryTimeSlot}
                              </p>
                            </div>
                          </div>
                          {item.notes && (
                            <div className="shrink-0 max-w-xs">
                              <p className="text-sm text-stone-600">Notes:</p>
                              <p className="text-sm">{item.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {productionItems.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-sm p-8 text-center border border-stone-200/50">
                  <Package className="w-12 h-12 text-stone-400 mx-auto mb-4" />
                  <p className="text-stone-600">
                    Aucune commande pour cette date
                  </p>
                </div>
              ) : (
                productionItems.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white/80 backdrop-blur-md rounded-lg shadow-sm p-6 border border-stone-200/50 ${
                      item.done ? "border-l-4 border-l-green-500" : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => toggleDone(item.id)}
                        className="shrink-0 mt-1"
                      >
                        {item.done ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        ) : (
                          <div className="w-6 h-6 border-2 border-stone-300 rounded-full" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-stone-900">
                              {item.productName}
                            </h3>
                            <p className="text-sm text-stone-600">
                              Commande #{item.orderNumber}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-[#C5A065]">
                              {item.quantity}
                            </p>
                            <p className="text-sm text-stone-600">unités</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-stone-400" />
                            <div>
                              <p className="text-sm text-stone-600">Client</p>
                              <p className="font-medium">{item.customerName}</p>
                              <p className="text-sm text-stone-500">
                                {item.customerPhone}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-stone-400" />
                            <div>
                              <p className="text-sm text-stone-600">Livraison</p>
                              <p className="font-medium">
                                {item.deliveryType === "pickup"
                                  ? "Ramassage"
                                  : "Livraison"}
                              </p>
                              <p className="text-sm text-stone-500">
                                {item.deliveryDate} - {item.deliveryTimeSlot}
                              </p>
                            </div>
                          </div>
                        </div>
                        {item.notes && (
                          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="text-sm font-medium text-stone-900 mb-1">
                              Notes:
                            </p>
                            <p className="text-sm text-stone-700">{item.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PatissierDashboard;
