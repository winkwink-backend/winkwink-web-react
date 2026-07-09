// src/routes/AppRouter.tsx

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../pages/LoginPage";
import PasswordPage from "../pages/PasswordPage";
import HomePage from "../pages/HomePage";

import { StorageService } from "../services/StorageService";
import { AppRoutes } from "./AppRoutes";

export default function AppRouter() {
  const token = StorageService.getAuthTokenSync();
  const bypass = StorageService.getBypassLock(); // opzionale

  // ------------------------------------------------------------
  // 1) Nessun token → LoginPage
  // ------------------------------------------------------------
  if (!token) {
    return (
      <Routes>
        <Route path={AppRoutes.login} element={<LoginPage />} />
        <Route path="*" element={<Navigate to={AppRoutes.login} replace />} />
      </Routes>
    );
  }

  // ------------------------------------------------------------
  // 2) Token presente → PasswordPage SEMPRE
  //    (a meno che bypassLock sia attivo)
  // ------------------------------------------------------------
  if (!bypass) {
    return (
      <Routes>
        <Route path={AppRoutes.passwordGate} element={<PasswordPage />} />
        <Route
          path="*"
          element={<Navigate to={AppRoutes.passwordGate} replace />}
        />
      </Routes>
    );
  }

  // ------------------------------------------------------------
  // 3) bypassLock = true → HomePage
  // ------------------------------------------------------------
  return (
    <Routes>
      <Route path={AppRoutes.home} element={<HomePage />} />
      <Route path="*" element={<Navigate to={AppRoutes.home} replace />} />
    </Routes>
  );
}
