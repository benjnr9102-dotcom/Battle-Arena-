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
      return 'Ce compte joueur a été désactivé.';
    case 'auth/user-not-found':
      return 'Aucun compte associé à cette adresse e-mail.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Identifiants incorrects. Vérifiez votre e-mail et mot de passe.';
    case 'auth/email-already-in-use':
      return 'Cette adresse e-mail est déjà utilisée par un autre joueur.';
    case 'auth/weak-password':
      return 'Le mot de passe doit comporter au moins 6 caractères.';
    case 'auth/too-many-requests':
      return 'Trop de tentatives infructueuses. Veuillez patienter avant de réessayer.';
    case 'auth/network-request-failed':
      return 'Erreur de connexion réseau. Vérifiez votre accès internet.';
    case 'auth/popup-closed-by-user':
      return 'La fenêtre de connexion a été fermée.';
    default:
      return 'Une erreur est survenue lors de l’authentification. Veuillez réessayer.';
  }
}
