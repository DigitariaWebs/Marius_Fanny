import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authClient } from '../lib/AuthClient.ts';
import GoldenBackground from '../components/GoldenBackground.tsx';
import { Lock, Check, AlertCircle, RefreshCw } from 'lucide-react';

const styles = {
  gold: '#C5A065',
  text: '#2D2A26',
  fontScript: '"Great Vibes", cursive',
};

const ResetPasswordPage: React.FC = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Cooldown for resend button (60 seconds)
  const [cooldown, setCooldown] = useState(0); 
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Pre-fill OTP if present in URL (e.g. ?token=123456)
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl && tokenFromUrl.length === 6) {
      setOtp(tokenFromUrl.split(''));
    }
  }, [searchParams]);

  // Timer logic
  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // --- OTP HANDLERS ---
  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // --- PASSWORD STRENGTH ---
  const getStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 7) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score; // 0 to 4
  };
  const strength = getStrength(password);

  // --- SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const code = otp.join('');
    if (code.length !== 6) return setError("Le code doit contenir 6 chiffres.");
    if (password !== confirmPassword) return setError("Les mots de passe ne correspondent pas.");
    if (strength < 2) return setError("Le mot de passe est trop faible.");

    setLoading(true);

    try {
      const { error } = await authClient.resetPassword({
        token: code,
        password,
      });

      if (error) throw new Error(error.message);

      // Redirect to login with success state
      navigate('/auth', { 
        state: { successMessage: "Mot de passe réinitialisé avec succès. Connectez-vous." } 
      });

    } catch (err: any) {
      setError(err.message || "Code invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    // Trigger resend logic here (usually re-calling forgotPassword)
    setCooldown(60);
    // await authClient.forgetPassword({ ... })
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#F9F7F2]">
      <div className="absolute inset-0 z-0"><GoldenBackground /></div>
      
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/40">
          
          <div className="text-center mb-8">
            <h2 className="text-4xl mb-2" style={{ fontFamily: styles.fontScript, color: styles.gold }}>
              Nouveau Mot de Passe
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mt-2">
              Entrez le code reçu et définissez votre accès
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest p-3 rounded bg-red-50 text-red-600 border border-red-200 justify-center">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            {/* OTP Inputs */}
            <div>
              <label className="block text-center text-[10px] font-black uppercase tracking-widest opacity-50 mb-3">
                Code de vérification (6 chiffres)
              </label>
              <div className="flex justify-between gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-full h-12 text-center text-lg font-bold bg-white/50 border border-black/10 rounded focus:border-[#C5A065] focus:ring-1 focus:ring-[#C5A065] outline-none transition-all"
                  />
                ))}
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <div className="relative">
                <Lock size={14} className="absolute left-0 top-3 text-stone-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-6 py-2 bg-transparent border-b border-black/10 focus:border-[#C5A065] outline-none text-sm placeholder:text-black/20"
                  placeholder="Nouveau mot de passe"
                  required
                />
              </div>
              
              {/* Strength Indicator */}
              <div className="flex gap-1 h-1 mt-2">
                {[1, 2, 3, 4].map((level) => (
                  <div 
                    key={level} 
                    className={`flex-1 rounded-full transition-all duration-300 ${strength >= level ? 'bg-[#C5A065]' : 'bg-black/5'}`} 
                  />
                ))}
              </div>
              <p className="text-[9px] uppercase tracking-wider text-right text-stone-400">
                {strength === 0 ? 'Vide' : strength < 3 ? 'Faible' : 'Fort'}
              </p>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Lock size={14} className="absolute left-0 top-3 text-stone-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-6 py-2 bg-transparent border-b border-black/10 focus:border-[#C5A065] outline-none text-sm placeholder:text-black/20"
                placeholder="Confirmer le mot de passe"
                required
              />
              {confirmPassword && password === confirmPassword && (
                <Check size={14} className="absolute right-0 top-3 text-green-600" />
              )}
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: styles.text }}
              >
                {loading ? 'MODIFICATION...' : 'RÉINITIALISER'}
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0}
                className="w-full flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#2D2A26]/60 hover:text-[#C5A065] disabled:opacity-30 transition-all"
              >
                <RefreshCw size={12} className={cooldown > 0 ? 'animate-spin' : ''} />
                {cooldown > 0 ? `Renvoyer le code (${cooldown}s)` : "Renvoyer le code"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;