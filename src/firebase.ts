import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyD4um5ymlOyv_m7-tMgl9Dv93qA18xt4TQ",
  authDomain: "battle-arena-6b590.firebaseapp.com",
  projectId: "battle-arena-6b590",
  storageBucket: "battle-arena-6b590.firebasestorage.app",
  messagingSenderId: "644218805406",
  appId: "1:644218805406:web:985e46aaaa743a0b07af8f"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

// Helper to translate Firebase Auth errors into clear French messages
export function getFirebaseAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Format d’adresse e-mail invalide.';
    case 'auth/user-disabled':
      return 'Ce compte joueur a été désactivé par l’administrateur.';
    case 'auth/user-not-found':
      return 'Aucun compte associé à cette adresse e-mail.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'Identifiants incorrects. Vérifiez votre adresse e-mail et votre mot de passe.';
    case 'auth/email-already-in-use':
      return 'Cette adresse e-mail est déjà utilisée par un autre joueur.';
    case 'auth/weak-password':
      return 'Le mot de passe doit comporter au moins 8 caractères avec lettres, chiffres et caractères spéciaux.';
    case 'auth/missing-password':
      return 'Veuillez saisir votre mot de passe.';
    case 'auth/missing-email':
      return 'Veuillez saisir votre adresse e-mail.';
    case 'auth/too-many-requests':
      return 'Trop de tentatives infructueuses consécutives. Votre accès est temporairement bloqué pour des raisons de sécurité. Veuillez patienter avant de réessayer.';
    case 'auth/network-request-failed':
      return 'Erreur de connexion au serveur. Vérifiez votre connexion internet.';
    case 'auth/requires-recent-login':
      return 'Cette opération sensible nécessite une reconnexion récente.';
    case 'auth/popup-closed-by-user':
      return 'La fenêtre de connexion a été fermée avant la fin de l’opération.';
    default:
      return 'Une erreur de sécurité est survenue. Veuillez vérifier vos informations et réessayer.';
  }
}
