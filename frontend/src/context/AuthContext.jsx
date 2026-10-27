
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import api from "../services/api";
import { AuthContext } from "./auth_context";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get("/usuarios/quien_es");
      setUser(response.data);
      return response.data;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const response = await api.get("/usuarios/quien_es");

        if (active) {
          setUser(response.data);
        }
      } catch {
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoadingAuth(false);
        }
      }
    }

    checkSession();

    return () => {
      active = false;
    };
  }, []);

  const logout = async () => {
    await api.post("/usuarios/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        loadingAuth,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
