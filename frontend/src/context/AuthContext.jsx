import {
  useCallback,
  useEffect,
  useState,
} from "react";

import api from "../services/api";
import { obtenerCarrito } from "../services/carritoServices";
import { AuthContext } from "./auth_context";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  const actualizarContadorCarrito = useCallback((items) => {
    const cantidadTotal = (items ?? []).reduce(
      (total, item) => total + Number(item.cantidad),
      0
    );

    setCartCount(cantidadTotal);
  }, []);

  const refreshCart = useCallback(async () => {
    try {
      const carrito = await obtenerCarrito();

      actualizarContadorCarrito(carrito.items);

      return carrito;
    } catch (error) {
      if (error.response?.status === 401) {
        setCartCount(0);
      }

      return null;
    }
  }, [actualizarContadorCarrito]);

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get("/usuarios/quien_es");

      setUser(response.data);

      await refreshCart();

      return response.data;
    } catch {
      setUser(null);
      setCartCount(0);

      return null;
    } finally {
      setLoadingAuth(false);
    }
  }, [refreshCart]);

  useEffect(() => {
    let activo = true;
    const controller = new AbortController();

    async function comprobarSesion() {
      try {
        const response = await api.get("/usuarios/quien_es", {
          signal: controller.signal,
        });

        if (!activo) return;

        setUser(response.data);

        try {
          const carrito = await obtenerCarrito({
            signal: controller.signal,
          });

          if (!activo) return;

          actualizarContadorCarrito(carrito.items);
        } catch (error) {
          if (!activo) return;

          if (error.response?.status === 401) {
            setCartCount(0);
          }
        }
} catch {
  if (!activo || controller.signal.aborted) return;

  setUser(null);
  setCartCount(0);
} finally {
        if (activo) {
          setLoadingAuth(false);
        }
      }
    }

    comprobarSesion();

    return () => {
      activo = false;
      controller.abort();
    };
  }, [actualizarContadorCarrito]);

  const logout = async () => {
    await api.post("/usuarios/logout");

    setUser(null);
    setCartCount(0);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        loadingAuth,
        refreshUser,
        logout,
        cartCount,
        refreshCart,
        actualizarContadorCarrito,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
