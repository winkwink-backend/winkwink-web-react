// src/routes/AppRouter.tsx

console.log("FRONTEND SERVER: AppRouter MOUNTED");

import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../pages/LoginPage";
import PasswordGatePage from "../pages/PasswordGate";
import HomePage from "../pages/HomePage";
import PasswordResetRequestPage from "../pages/PasswordResetRequestPage";

import { StorageService } from "../services/StorageService";
import { AppRoutes } from "./AppRoutes";

export default function AppRouter() {

  // ⭐ Stato React che rappresenta l’autenticazione
  const [authState, setAuthState] = useState(() => ({
    token: StorageService.getAuthTokenSync(),
    bypass: StorageService.getBypassLockSync(),
  }));

  // ⭐ Router si aggiorna quando cambia il localStorage o arriva auth_update
  useEffect(() => {
    const handleAuthChange = () => {
      setAuthState({
        token: StorageService.getAuthTokenSync(),
        bypass: StorageService.getBypassLockSync(),
      });
    };

    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("auth_update", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("auth_update", handleAuthChange);
    };
  }, []);

  const { token, bypass } = authState;

  console.log("ROUTER LIVE STATE -> Token:", !!token, "| Bypass:", !!bypass);
  console.log("RAW LOCAL:", localStorage.getItem("bypassLock"));

  // ⭐ LOGIN
  if (!token) {
    return (
      <Routes>
        <Route path={AppRoutes.login} element={<LoginPage />} />
        <Route path="*" element={<Navigate to={AppRoutes.login} replace />} />
      </Routes>
    );
  }

  // ⭐ PASSWORD GATE
  if (!bypass) {
    return (
      <Routes>
        <Route path={AppRoutes.passwordGate} element={<PasswordGatePage />} />
        <Route
          path={AppRoutes.passwordResetRequest}
          element={<PasswordResetRequestPage />}
        />
        <Route
          path="*"
          element={<Navigate to={AppRoutes.passwordGate} replace />}
        />
      </Routes>
    );
  }

  // ⭐ HOME
  return (
    <Routes>
      <Route path={AppRoutes.home} element={<HomePage />} />
      <Route
        path={AppRoutes.passwordResetRequest}
        element={<PasswordResetRequestPage />}
      />
      <Route path="*" element={<Navigate to={AppRoutes.home} replace />} />
    </Routes>
  );
}
