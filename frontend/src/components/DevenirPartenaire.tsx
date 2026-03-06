import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { normalizedApiUrl } from "../lib/AuthClient";
import GoldenBackground from "./GoldenBackground";
import Navbar from "./Navbar";
import Footer from "./Footer";
import {
  Building2,
  ShoppingBag,
  TrendingUp,
  Shield,
  CheckCircle2,
  Clock,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Briefcase,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

const styles = {
  gold: "#337957",
  text: "#2D2A26",
  cream: "#F9F7F2",
  fontScript: '"Great Vibes", cursive',
  fontSans: '"Inter", sans-serif',
};

interface DevenirPartenaireProps {
  onCartClick: () => void;
  cartCount: number;
}

const DevenirPartenaire: React.FC<DevenirPartenaireProps> = ({
  onCartClick,
  cartCount,
}) => {
  const STORAGE_KEY = "partner_request_pending_email";

  // Restore pending state from sessionStorage on mount
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(() => !!sessionStorage.getItem(STORAGE_KEY));
  const [pendingEmail, setPendingEmail] = useState(() => sessionStorage.getItem(STORAGE_KEY) || "");
  const [showPassword, setShowPassword] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Detect admin approval redirect (?approved=1)
  const searchParams = new URLSearchParams(location.search);
  const justApproved = searchParams.get("approved") === "1";
  const alreadyApproved = searchParams.get("already_approved") === "1";

  // Clear sessionStorage when admin approves
  useEffect(() => {
    if (justApproved || alreadyApproved) {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [justApproved, alreadyApproved]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Form fields
  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${normalizedApiUrl}/api/partner-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: formData.businessName,
          contactName: formData.contactName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // 409 = already has a pending request → treat as success screen
        if (res.status === 409 && data.message?.includes("en attente")) {
          sessionStorage.setItem(STORAGE_KEY, formData.email);
          setPendingEmail(formData.email);
          setSubmitted(true);
          return;
        }
        throw new Error(data.message || "Une erreur est survenue.");
      }

      // Persist so re-navigation still shows the pending screen
      sessionStorage.setItem(STORAGE_KEY, formData.email);
      setPendingEmail(formData.email);
      setSubmitted(true);
    } catch (err: any) {
      if (err.message === "Failed to fetch") {
        setError("Erreur réseau. Vérifiez votre connexion.");
      } else {
        setError(err.message || "Une erreur est survenue.");
      }
    } finally {
      setLoading(false);
    }
  };

  const advantages = [
    {
      icon: <ShoppingBag size={32} />,
      title: "Catalogue Complet",
      description:
        "Accédez à l'ensemble de notre gamme de produits artisanaux directement depuis votre espace dédié.",
    },
    {
      icon: <TrendingUp size={32} />,
      title: "Prix Professionnels",
      description:
        "Bénéficiez de tarifs préférentiels réservés exclusivement à nos partenaires professionnels.",
    },
    {
      icon: <Shield size={32} />,
      title: "Qualité Garantie",
      description:
        "Tous nos produits sont fabriqués artisanalement avec des ingrédients de première qualité.",
    },
    {
      icon: <Building2 size={32} />,
      title: "Support Dédié",
      description:
        "Un accompagnement personnalisé pour vous aider dans vos commandes et vos besoins spécifiques.",
    },
  ];

  // ----------- "JUST APPROVED" BANNER (admin clicked the approval link) -----------
  if (justApproved || alreadyApproved) {
    return (
      <>
        <Navbar onCartClick={onCartClick} cartCount={cartCount} />
        <div className="relative min-h-screen pt-20">
          <div className="fixed inset-0 z-0 opacity-30">
            <GoldenBackground />
          </div>
          <div className="relative z-10 flex items-center justify-center min-h-[80vh] px-4">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white p-8 md:p-12 w-full max-w-md text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#337957]/10 flex items-center justify-center">
                <CheckCircle2 size={40} className="text-[#337957]" />
              </div>
              <h2
                className="text-4xl mb-3"
                style={{ fontFamily: styles.fontScript, color: styles.gold }}
              >
                {alreadyApproved ? "Déjà approuvé !" : "Partenaire approuvé !"}
              </h2>
              <p className="text-stone-600 mb-6">
                {alreadyApproved
                  ? "Ce compte partenaire était déjà actif."
                  : "Le compte professionnel a été créé avec succès. Le partenaire va recevoir un email de confirmation avec ses accès."}
              </p>
              <button
                onClick={() => navigate("/se-connecter")}
                className="px-6 py-3 rounded-xl text-white font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all"
                style={{ backgroundColor: styles.gold }}
              >
                Page de connexion
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // ----------- PENDING APPROVAL SUCCESS VIEW -----------
  if (submitted) {
    return (
      <>
        <Navbar onCartClick={onCartClick} cartCount={cartCount} />
        <div className="relative min-h-screen pt-20">
          <div className="fixed inset-0 z-0 opacity-30">
            <GoldenBackground />
          </div>
          <div className="relative z-10 flex items-center justify-center min-h-[80vh] px-4">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white p-8 md:p-12 w-full max-w-md text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-50 flex items-center justify-center">
                <Clock size={40} className="text-amber-500" />
              </div>
              <h2
                className="text-4xl mb-3"
                style={{ fontFamily: styles.fontScript, color: styles.gold }}
              >
                Demande envoyée !
              </h2>
              <p className="text-stone-600 mb-4">
                Votre dossier de partenariat a bien été reçu et sera examiné
                dans les plus brefs délais.
              </p>
              <p className="text-stone-500 text-sm mb-6">
                Vous recevrez un email de confirmation à{" "}
                <span className="font-semibold text-stone-700">
                  {pendingEmail}
                </span>{" "}
                une fois votre compte approuvé.
              </p>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 rounded-xl text-white font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all"
                style={{ backgroundColor: styles.gold }}
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // ----------- MAIN PAGE -----------
  return (
    <>
      <Navbar onCartClick={onCartClick} cartCount={cartCount} />
      <div className="relative min-h-screen pt-20">
        <div className="fixed inset-0 z-0 opacity-30">
          <GoldenBackground />
        </div>

        <div className="relative z-10">
          {/* HERO SECTION */}
          <section className="py-16 md:py-24 px-4">
            <div className="max-w-6xl mx-auto text-center">
              <h1
                className="text-3xl md:text-4xl mb-4"
                style={{ fontFamily: styles.fontScript, color: styles.gold }}
              >
                Devenir Partenaire
              </h1>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-500 mb-6">
                Créez votre espace professionnel
              </p>
              <p className="text-stone-600 max-w-2xl mx-auto text-lg mb-10">
                Vous êtes un professionnel de la restauration, un hôtelier, ou
                un commerçant ? Accédez à notre catalogue complet de produits
                artisanaux et bénéficiez d'avantages exclusifs.
              </p>

              {/* FORMULAIRE COMPTE PRO */}
              <div className="max-w-lg mx-auto mt-12">
                <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white p-8 md:p-10">
                  <div className="text-center mb-8">
                    <h2
                      className="text-3xl mb-2"
                      style={{
                        fontFamily: styles.fontScript,
                        color: styles.gold,
                      }}
                    >
                      Créer mon Compte Pro
                    </h2>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400">
                      Votre demande sera examinée et approuvée
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Business Name */}
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-stone-500 mb-2">
                        Nom de l'entreprise *
                      </label>
                      <div className="relative">
                        <Building2
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                        />
                        <input
                          type="text"
                          name="businessName"
                          value={formData.businessName}
                          onChange={handleChange}
                          required
                          placeholder="Restaurant Le Provençal"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:border-[#337957] focus:ring-2 focus:ring-[#337957]/20 outline-none text-sm"
                        />
                      </div>
                    </div>

                    {/* Contact Name */}
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-stone-500 mb-2">
                        Nom du contact *
                      </label>
                      <div className="relative">
                        <User
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                        />
                        <input
                          type="text"
                          name="contactName"
                          value={formData.contactName}
                          onChange={handleChange}
                          required
                          placeholder="Jean Dupont"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:border-[#337957] focus:ring-2 focus:ring-[#337957]/20 outline-none text-sm"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-stone-500 mb-2">
                        Email professionnel *
                      </label>
                      <div className="relative">
                        <Mail
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                        />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="contact@entreprise.com"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:border-[#337957] focus:ring-2 focus:ring-[#337957]/20 outline-none text-sm"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-stone-500 mb-2">
                        Téléphone *
                      </label>
                      <div className="relative">
                        <Phone
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                        />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          placeholder="+33 6 12 34 56 78"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:border-[#337957] focus:ring-2 focus:ring-[#337957]/20 outline-none text-sm"
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-stone-500 mb-2">
                        Adresse *
                      </label>
                      <div className="relative">
                        <MapPin
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                        />
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          required
                          placeholder="12 rue de la Paix, 75001 Paris"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:border-[#337957] focus:ring-2 focus:ring-[#337957]/20 outline-none text-sm"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-stone-500 mb-2">
                        Mot de passe *
                      </label>
                      <div className="relative">
                        <Lock
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                        />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          minLength={6}
                          placeholder="Minimum 6 caractères"
                          className="w-full pl-10 pr-12 py-3 rounded-xl border border-stone-200 focus:border-[#337957] focus:ring-2 focus:ring-[#337957]/20 outline-none text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-stone-500 mb-2">
                        Confirmer le mot de passe *
                      </label>
                      <div className="relative">
                        <Lock
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                        />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          minLength={6}
                          placeholder="Retapez le mot de passe"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:border-[#337957] focus:ring-2 focus:ring-[#337957]/20 outline-none text-sm"
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                        {error}
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl text-white font-bold text-sm uppercase tracking-widest transition-all disabled:opacity-50 hover:opacity-90 flex items-center justify-center gap-2"
                      style={{ backgroundColor: styles.gold }}
                    >
                      {loading ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <>
                          <Briefcase size={18} />
                          Envoyer ma demande
                        </>
                      )}
                    </button>

                    <p className="text-center text-xs text-stone-400">
                      Vous avez déjà un compte ?{" "}
                      <button
                        type="button"
                        onClick={() => navigate("/se-connecter")}
                        className="text-[#337957] font-bold hover:underline"
                      >
                        Se connecter
                      </button>
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DevenirPartenaire;
