import React, { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, getFirebaseAuthErrorMessage } from '../firebase';
import { resizeImageTo128Jpeg } from '../utils/imageResize';
import {
  Swords,
  LogIn,
  UserPlus,
  Camera,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Check,
  X,
  KeyRound,
  ArrowLeft,
  Mail,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface AuthViewProps {
  initialMessage?: string;
  onSuccess?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ initialMessage = '', onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string>(initialMessage);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (initialMessage) {
      setResetSuccessMsg(initialMessage);
      setMode('login');
    }
  }, [initialMessage]);

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Password strength criteria
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
  const isPasswordStrong = hasMinLength && hasLetter && hasNumber && hasSpecial;
  const doPasswordsMatch = password.length > 0 && password === confirmPassword;

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const resized = await resizeImageTo128Jpeg(file);
      setPhotoPreview(resized);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors du traitement de l’image.');
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setResetSuccessMsg('');

    if (!email.trim()) {
      setErrorMsg('Veuillez renseigner votre adresse e-mail.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: any) {
      console.warn('Password reset response (obscured for security):', err);
    } finally {
      setLoading(false);
      // Toujours afficher le même message en français, que l'e-mail existe ou non
      setResetSuccessMsg(
        "Si un compte existe avec cet e-mail, un message de réinitialisation vient d'être envoyé. Pense à vérifier tes courriers indésirables."
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setResetSuccessMsg('');

    // Validation
    if (!email.trim() || !password) {
      setErrorMsg('Veuillez renseigner votre e-mail et votre mot de passe.');
      return;
    }

    if (mode === 'register') {
      const trimmedPseudo = pseudo.trim();
      if (trimmedPseudo.length < 3 || trimmedPseudo.length > 20) {
        setErrorMsg('Le pseudo doit contenir entre 3 et 20 caractères.');
        return;
      }

      if (!isPasswordStrong) {
        setErrorMsg('Veuillez respecter tous les critères de sécurité du mot de passe.');
        return;
      }

      if (password !== confirmPassword) {
        setErrorMsg('Les mots de passe ne correspondent pas.');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'register') {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const user = userCredential.user;

        // Requirement 4: Envoyer l'e-mail de vérification
        try {
          await sendEmailVerification(user);
        } catch (verifErr) {
          console.warn('Erreur envoi vérification e-mail:', verifErr);
        }

        // Créer le document Firestore users/{uid}
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          pseudo: pseudo.trim(),
          jetons: 5000,
          createdAt: serverTimestamp(),
          photo: photoPreview || '',
          level: 1,
          xp: 0,
          chessElo: 1200,
          tapRaceBest: 0,
          totalMatches: 0,
          victories: 0,
          defeats: 0,
          draws: 0,
          totalTokensWon: 0,
          totalFeesPaid: 0,
        });
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }

      onSuccess?.();
    } catch (err: any) {
      console.error('Firebase Auth error:', err);
      const code = err.code || '';
      setErrorMsg(getFirebaseAuthErrorMessage(code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center p-4 text-slate-100">
      <div className="w-full max-w-sm bg-[#0d1322] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl relative">
        {/* Logo and App Title */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-300/40 mb-3">
            <Swords className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display font-black text-2xl tracking-wider text-white">
            BATTLE<span className="text-cyan-400">ARENA</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Arène e-sport mobile · Authentification Sécurisée
          </p>
        </div>

        {/* Tab switch Connexion / Inscription (hidden in forgot password mode) */}
        {mode !== 'forgot' ? (
          <div className="flex items-center gap-1 p-1 bg-[#131b2e] rounded-xl border border-slate-800 mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setResetSuccessMsg('');
              }}
              className={`flex-1 py-2 text-xs font-display font-bold rounded-lg transition ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg('');
                setResetSuccessMsg('');
              }}
              className={`flex-1 py-2 text-xs font-display font-bold rounded-lg transition ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Inscription
            </button>
          </div>
        ) : (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setResetSuccessMsg('');
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retour à la connexion</span>
            </button>
            <h2 className="font-display font-bold text-base text-white mt-2">
              Réinitialisation du mot de passe
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Saisissez l'e-mail de votre compte pour recevoir un lien de réinitialisation.
            </p>
          </div>
        )}

        {/* Error message in French */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/50 flex items-start gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Reset Success message in French */}
        {resetSuccessMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-start gap-2.5 text-xs text-emerald-300 leading-relaxed">
            <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{resetSuccessMsg}</span>
          </div>
        )}

        {/* Forgot password form */}
        {mode === 'forgot' ? (
          <form onSubmit={handlePasswordReset} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Adresse e-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="joueur@battle-arena.com"
                required
                className="w-full bg-[#131b2e] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-display font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Envoyer le lien de réinitialisation</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <>
                {/* Optional Photo Picker */}
                <div className="flex flex-col items-center mb-1">
                  <label className="text-[11px] text-slate-400 mb-1.5 font-medium">
                    Photo de profil (optionnelle)
                  </label>
                  <div className="relative group">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-dashed border-cyan-500/50 flex items-center justify-center overflow-hidden ring-2 ring-slate-700">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Aperçu"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera className="w-6 h-6 text-slate-400 group-hover:text-cyan-400 transition" />
                      )}
                    </div>
                    <label
                      htmlFor="photo-upload"
                      className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-cyan-500 text-black shadow cursor-pointer hover:bg-cyan-400 transition"
                      title="Choisir dans la galerie"
                    >
                      <Camera className="w-3 h-3" />
                    </label>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Pseudo input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Pseudonyme joueur (3 à 20 caractères)
                  </label>
                  <input
                    type="text"
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                    placeholder="Ex: CyberStriker"
                    minLength={3}
                    maxLength={20}
                    required
                    className="w-full bg-[#131b2e] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </>
            )}

            {/* Email input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Adresse e-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="joueur@battle-arena.com"
                required
                className="w-full bg-[#131b2e] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            {/* Password input with eye toggle */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Mot de passe
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMsg('');
                      setResetSuccessMsg('');
                    }}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline"
                  >
                    Mot de passe oublié ?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={mode === 'register' ? (showRegisterPassword ? 'text' : 'password') : (showLoginPassword ? 'text' : 'password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#131b2e] border border-slate-700 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (mode === 'register') {
                      setShowRegisterPassword(!showRegisterPassword);
                    } else {
                      setShowLoginPassword(!showLoginPassword);
                    }
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                  title={
                    (mode === 'register' ? showRegisterPassword : showLoginPassword)
                      ? 'Masquer le mot de passe'
                      : 'Afficher le mot de passe'
                  }
                >
                  {(mode === 'register' ? showRegisterPassword : showLoginPassword) ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Requirement 1: Live password criteria checklist for registration */}
              {mode === 'register' && (
                <div className="mt-2.5 p-2.5 bg-[#090d16] border border-slate-800 rounded-xl space-y-1.5 text-[11px]">
                  <span className="font-semibold text-slate-400 block mb-1">
                    Critères de sécurité requis :
                  </span>
                  <div
                    className={`flex items-center gap-1.5 transition-colors ${
                      hasMinLength ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {hasMinLength ? (
                      <Check className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 shrink-0 text-slate-600" />
                    )}
                    <span>Au moins 8 caractères</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 transition-colors ${
                      hasLetter ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {hasLetter ? (
                      <Check className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 shrink-0 text-slate-600" />
                    )}
                    <span>Au moins une lettre (a-z ou A-Z)</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 transition-colors ${
                      hasNumber ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {hasNumber ? (
                      <Check className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 shrink-0 text-slate-600" />
                    )}
                    <span>Au moins un chiffre (0-9)</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 transition-colors ${
                      hasSpecial ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {hasSpecial ? (
                      <Check className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 shrink-0 text-slate-600" />
                    )}
                    <span>Au moins un caractère spécial (!@#$%...)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password input (Registration only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={`w-full bg-[#131b2e] border rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition ${
                      confirmPassword.length > 0
                        ? doPasswordsMatch
                          ? 'border-emerald-500 focus:border-emerald-400'
                          : 'border-red-500 focus:border-red-400'
                        : 'border-slate-700 focus:border-cyan-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                    title={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword.length > 0 && (
                  <div
                    className={`flex items-center gap-1 text-[11px] mt-1 font-medium ${
                      doPasswordsMatch ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {doPasswordsMatch ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Les mots de passe correspondent</span>
                      </>
                    ) : (
                      <>
                        <X className="w-3.5 h-3.5" />
                        <span>Les mots de passe ne correspondent pas</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Initial tokens bonus notification on register */}
            {mode === 'register' && (
              <p className="text-[11px] text-cyan-400/90 text-center font-medium bg-cyan-950/40 p-2 rounded-xl border border-cyan-800/40">
                🎁 5 000 jetons virtuels offerts dès votre inscription !
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (mode === 'register' && (!isPasswordStrong || !doPasswordsMatch))}
              className="w-full py-3 rounded-xl font-display font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === 'register' ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Créer mon compte joueur</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Entrer dans l'Arène</span>
                </>
              )}
            </button>
          </form>
        )}

        <p className="text-[10px] text-slate-500 text-center mt-5">
          Les jetons sont virtuels et destinés exclusivement aux compétitions BATTLE ARENA.
        </p>
      </div>
    </div>
  );
};
