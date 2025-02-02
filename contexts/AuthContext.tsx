// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/components/ui/use-toast";
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  user: any | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setIsAuthenticated(true);
        try {
          // Force token refresh to ensure we have a valid token
          const token = await currentUser.getIdToken(true);
          const response = await fetch('/api/getUserData', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ uid: currentUser.uid })
          });
          
          if (response.status === 401) {
            // Token might be expired, try to force refresh
            const newToken = await currentUser.getIdToken(true);
            const retryResponse = await fetch('/api/getUserData', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newToken}`
              },
              body: JSON.stringify({ uid: currentUser.uid })
            });
            
            if (retryResponse.ok) {
              const userData = await retryResponse.json();
              // Ensure we keep the Firebase Auth methods
              setUser({
                ...currentUser,
                ...userData.data,
                getIdToken: currentUser.getIdToken.bind(currentUser)
              });
            } else {
              console.error('Failed to fetch user data after token refresh:', retryResponse.statusText);
              setUser({
                ...currentUser,
                getIdToken: currentUser.getIdToken.bind(currentUser)
              });
              router.push('/login');
            }
          } else if (response.ok) {
            const userData = await response.json();
            // Ensure we keep the Firebase Auth methods
            setUser({
              ...currentUser,
              ...userData.data,
              getIdToken: currentUser.getIdToken.bind(currentUser)
            });
          } else {
            console.error('Failed to fetch user data:', response.statusText);
            setUser({
              ...currentUser,
              getIdToken: currentUser.getIdToken.bind(currentUser)
            });
          }
        } catch (error: any) {
          console.error('Error fetching user data:', error);
          setUser({
            ...currentUser,
            getIdToken: currentUser.getIdToken.bind(currentUser)
          });
          if (error.code === 'auth/id-token-expired') {
            router.push('/login');
          }
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const login = async (email: string, password: string) => {
    try {
      // Odstranění přebytečných mezer
      const trimmedEmail = email.trim();
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      console.log("User logged in:", userCredential.user);
      toast({
        title: "Přihlášení úspěšné",
        description: "Vítejte zpět!",
      });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Chyba přihlášení",
        description: error.message || "Neplatné přihlašovací údaje",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      router.push("/");
      toast({
        title: "Odhlášení úspěšné",
        description: "Byli jste úspěšně odhlášeni",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Chyba odhlášení",
        description: error.message,
      });
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
