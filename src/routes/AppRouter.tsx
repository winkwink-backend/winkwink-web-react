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
  const token = StorageService.getAuthTokenSync();
  const bypass = StorageService.getBypassLockSync();

  if (!token) {
    return (
      <Routes>
        <Route path={AppRoutes.login} element={<LoginPage />} />
        <Route path="*" element={<Navigate to={AppRoutes.login} replace />} />
      </Routes>
    );
  }

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

  return (
    <Routes>
      <Route path={AppRoutes.home} element={<HomePage />} />
      <Route path="*" element={<Navigate to={AppRoutes.home} replace />} />
    </Routes>
  );
}
