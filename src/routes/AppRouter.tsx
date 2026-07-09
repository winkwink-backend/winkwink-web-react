// src/routes/AppRouter.tsx

console.log("FRONTEND SERVER: AppRouter MOUNTED");


import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../pages/LoginPage";
import PasswordGatePage from "../pages/PasswordGate";
import HomePage from "../pages/HomePage";

import { StorageService } from "../services/StorageService";
import { AppRoutes } from "./AppRoutes";

export default function AppRouter() {
  // 🔥 Letture sincrone (senza flicker)
  const token = StorageService.getAuthTokenSync();
  const bypass = StorageService.getBypassLockSync(); 

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
  // 2) Token presente → PasswordGate SEMPRE
  //    (a meno che bypassLock sia attivo)
  // ------------------------------------------------------------
  console.log("BYPASS VALUE:", bypass);
  console.log("RAW LOCAL:", localStorage.getItem("bypassLock"));


  if (!bypass) {
  return (
    <Routes>
      <Route
        path={AppRoutes.passwordGate}
        element={<PasswordGatePage />}
      />
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
