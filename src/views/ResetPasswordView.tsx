import React, { useState, useEffect } from 'react';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth, getFirebaseAuthErrorMessage } from '../firebase';
import {
  Swords,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

interface ResetPasswordViewProps {
  oobCode: string;
  onSuccess: (message: string) => void;
  onCancel: () => void;
}

export const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({
  oobCode,
  onSuccess,
  onCancel,
}) => {
  const [accountEmail, setAccountEmail] = useState<string>('');
  const [verifying, setVerifying] = useState<boolean>(true);
  const [verifyError, setVerifyError] = useState<string>('');

  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');

  // Password criteria verification
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
  const isPasswordStrong = hasMinLength && hasLetter && hasNumber && hasSpecial;
  const doPasswordsMatch = password.length > 0 && password === confirmPassword;

  // 1. Verify the oobCode upon mounting
  useEffect(() => {
    let isMounted = true;
    async function checkCode() {
      try {
        setVerifying(true);
        setVerifyError('');
        const email = await verifyPasswordResetCode(auth, oobCode);
        if (isMounted) {
          setAccountEmail(email);
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Erreur verifyPasswordResetCode:', err);
        const code = err.code || '';
        if (code === 'auth/expired-action-code') {
          setVerifyError('Ce lien de réinitialisation a expiré. Veuillez refaire une demande.');
        } else if (code === 'auth/invalid-action-code') {
          setVerifyError('Ce lien de réinitialisation est invalide ou a déjà été utilisé.');
        } else {
          setVerifyError(getFirebaseAuthErrorMessage(code));
        }
      } finally {
        if (isMounted) {
          setVerifying(false);
        }
      }
    }

    checkCode();

    return () => {
      isMounted = false;
    };
  }, [oobCode]);

  // 2. Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!isPasswordStrong) {
      setSubmitError('Veuillez respecter tous les critères de sécurité du mot de passe.');
      return;
    }

    if (!doPasswordsMatch) {
      setSubmitError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    try {
      await confirmPasswordReset(auth, oobCode, password);
      // Clean query parameters from URL
      try {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      } catch (e) {}

      onSuccess('Mot de passe modifié ! Tu peux maintenant te connecter avec ton nouveau mot de passe.');
    } catch (err: any) {
      console.error('Erreur confirmPasswordReset:', err);
      const code = err.code || '';
      if (code === 'auth/expired-action-code') {
        setSubmitError('Ce lien a expiré entre-temps. Veuillez demander un nouvel e-mail.');
      } else if (code === 'auth/invalid-action-code') {
        setSubmitError('Ce lien a déjà été utilisé.');
      } else {
        setSubmitError(getFirebaseAuthErrorMessage(code));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center p-4 text-slate-100">
      <div className="w-full max-w-sm bg-[#0d1322] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl relative">
        {/* Logo and Brand */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-300/40 mb-3">
            <Swords className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display font-black text-2xl tracking-wider text-white">
            BATTLE<span className="text-cyan-400">ARENA</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sécurité du compte · Nouveau mot de passe
          </p>
        </div>

        {verifying ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-300">Vérification du lien sécurisé en cours...</p>
          </div>
        ) : verifyError ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/50 text-center">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <h3 className="font-display font-bold text-sm text-white mb-1">
                Lien expiré ou déjà utilisé
              </h3>
              <p className="text-xs text-red-300 leading-relaxed">
                {verifyError}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="w-full py-2.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à la connexion</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="p-3 bg-cyan-950/40 border border-cyan-800/40 rounded-xl text-xs text-slate-300">
              <p className="text-[11px] text-cyan-300 font-medium">
                Compte : <strong>{accountEmail}</strong>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Définissez votre nouveau mot de passe sécurisé.
              </p>
            </div>

            {submitError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 flex items-start gap-2 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Field 1: Nouveau mot de passe */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#131b2e] border border-slate-700 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                  title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Live criteria checklist */}
              <div className="mt-2.5 p-2.5 bg-[#090d16] border border-slate-800 rounded-xl space-y-1.5 text-[11px]">
                <span className="font-semibold text-slate-400 block mb-1">
                  Critères requis :
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
            </div>

            {/* Field 2: Confirmer le nouveau mot de passe */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Confirmer le nouveau mot de passe
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

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || !isPasswordStrong || !doPasswordsMatch}
              className="w-full py-3 rounded-xl font-display font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Enregistrer le nouveau mot de passe</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Annuler
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
