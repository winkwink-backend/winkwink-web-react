// src/routes/AppRouter.tsx
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import LoginPage from "../pages/LoginPage";
import PasswordGatePage from "../pages/PasswordGate";
import HomePage from "../pages/HomePage";

import { StorageService } from "../services/StorageService";
import { AppRoutes } from "./AppRoutes";

export default function AppRouter() {
  // 1. Usiamo lo stato per rendere il router reattivo ai cambiamenti
  const [token, setToken] = useState(() => StorageService.getAuthTokenSync());
  const [bypass, setBypass] = useState(() => StorageService.getBypassLockSync());
  const location = useLocation();

  // 2. Sincronizziamo lo stato quando cambiamo pagina (o tramite eventi)
  useEffect(() => {
    setToken(StorageService.getAuthTokenSync());
    setBypass(StorageService.getBypassLockSync());
  }, [location]); // Si aggiorna ad ogni cambio di rotta

  // 3. Albero delle rotte unico e centralizzato
  return (
    <Routes>
      {/* Rotta Login: accessibile solo se NON c'è il token */}
      <Route 
        path={AppRoutes.login} 
        element={!token ? <LoginPage /> : <Navigate to={bypass ? AppRoutes.home : AppRoutes.passwordGate} replace />} 
      />

      {/* Rotta Password Gate: accessibile solo se c'è il token MA non il bypass */}
      <Route 
        path={AppRoutes.passwordGate} 
        element={
          !token ? <Navigate to={AppRoutes.login} replace /> : 
          bypass ? <Navigate to={AppRoutes.home} replace /> : 
          <PasswordGatePage />
        } 
      />

      {/* Rotta Home: accessibile solo se ci sono sia token che bypass */}
      <Route 
        path={AppRoutes.home} 
        element={
          !token ? <Navigate to={AppRoutes.login} replace /> : 
          !bypass ? <Navigate to={AppRoutes.passwordGate} replace /> : 
          <HomePage />
        } 
      />

      {/* Fallback globale per rotte sconosciute */}
      <Route 
        path="*" 
        element={
          !token ? <Navigate to={AppRoutes.login} replace /> : 
          !bypass ? <Navigate to={AppRoutes.passwordGate} replace /> : 
          <Navigate to={AppRoutes.home} replace />
        } 
      />
    </Routes>
  );
}
