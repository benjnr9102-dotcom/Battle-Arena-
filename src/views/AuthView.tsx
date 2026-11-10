import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, getFirebaseAuthErrorMessage } from '../firebase';
import { resizeImageTo128Jpeg } from '../utils/imageResize';
import { Swords, LogIn, UserPlus, Camera, AlertCircle, Loader2 } from 'lucide-react';

interface AuthViewProps {
  onSuccess?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

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
      if (password.length < 6) {
        setErrorMsg('Le mot de passe doit comporter au moins 6 caractères.');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'register') {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const user = userCredential.user;

        // Requirement 2: Créer le document Firestore users/{uid} avec : pseudo, jetons (5000), createdAt, et optionnellement photo
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
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-300/40 mb-3">
            <Swords className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display font-black text-2xl tracking-wider text-white">
            BATTLE<span className="text-cyan-400">ARENA</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Arène e-sport mobile · Comptes joueurs officiels
          </p>
        </div>

        {/* Tab switch Connexion / Inscription */}
        <div className="flex items-center gap-1 p-1 bg-[#131b2e] rounded-xl border border-slate-800 mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
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

        {/* Error message in French */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/50 flex items-start gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

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

          {/* Password input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Mot de passe {mode === 'register' && '(min. 6 caractères)'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full bg-[#131b2e] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          {/* Initial tokens bonus notification on register */}
          {mode === 'register' && (
            <p className="text-[11px] text-cyan-400/90 text-center font-medium bg-cyan-950/40 p-2 rounded-xl border border-cyan-800/40">
              🎁 5 000 jetons virtuels offerts dès votre inscription !
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-display font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-50"
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

        <p className="text-[10px] text-slate-500 text-center mt-5">
          Les jetons sont virtuels et destinés exclusivement aux compétitions BATTLE ARENA.
        </p>
      </div>
    </div>
  );
};
