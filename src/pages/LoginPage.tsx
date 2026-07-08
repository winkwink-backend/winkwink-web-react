// src/pages/LoginPage.tsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import WinkWinkScaffold from "../widgets/WinkWinkScaffold";
import NeonButton from "../widgets/NeonButton";

import { AppRoutes } from "../routes/AppRoutes";
import { StorageService } from "../services/StorageService";
import { ApiService } from "../services/ApiService";
import { PresenceService } from "../services/PresenceService";

import { showErrorDialog, showInfoDialog } from "../utils/dialogs";

export default function LoginPage() {
  const navigate = useNavigate();

  // ------------------------------------------------------------
  // STATE
  // ------------------------------------------------------------
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [alias, setAlias] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [recoverAlias, setRecoverAlias] = useState("");
  const [recoverPassword, setRecoverPassword] = useState("");

  const [prefix, setPrefix] = useState("+39");

  const [showRegistration, setShowRegistration] = useState(false);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [notificationsAccepted, setNotificationsAccepted] = useState(false);

  const [obscurePassword, setObscurePassword] = useState(true);
  const [obscureConfirm, setObscureConfirm] = useState(true);
  const [obscureRecover, setObscureRecover] = useState(true);

  // ------------------------------------------------------------
  // PREFIX LOCALE (web)
  // ------------------------------------------------------------
  useEffect(() => {
    try {
      const locale = navigator.language.toUpperCase();
      const iso = locale.split("-")[1];

      const map: Record<string, string> = {
        IT: "+39",
        FR: "+33",
        DE: "+49",
        ES: "+34",
        US: "+1",
      };

      setPrefix(map[iso] ?? "+39");
    } catch (_) {}
  }, []);

  // ------------------------------------------------------------
  // UTILS
  // ------------------------------------------------------------
  function normalizePhone(prefix: string, number: string) {
    const clean = number.replace(/[^0-9]/g, "");
    const cleanPrefix = prefix.replace(/[^0-9+]/g, "");
    return cleanPrefix + clean;
  }

  function isStrongPassword(p: string) {
    if (p.length < 8 || p.length > 20) return false;
    const hasUpper = /[A-Z]/.test(p);
    const hasLower = /[a-z]/.test(p);
    const hasDigit = /[0-9]/.test(p);
    const hasSpecial = /[!@#$%^&*()\-_=+]/.test(p);
    return hasUpper && hasLower && hasDigit && hasSpecial;
  }

  // ------------------------------------------------------------
  // RECUPERO PROFILO
  // ------------------------------------------------------------
  async function recoverProfile() {
    if (!recoverAlias.trim() || !recoverPassword.trim()) {
      await showErrorDialog("Errore", "Compila tutti i campi");
      return;
    }

    const response = await ApiService.recoverProfile(
     recoverAlias.trim(),
     recoverPassword.trim()
    );

    if (!response || response.error) {
      await showErrorDialog("Errore", "Profilo non trovato");
      return;
    }

    const user = response.user;
    const authToken = response.authToken;

    await StorageService.saveAuthToken(authToken);
    await StorageService.saveUserId(user.id);
    await StorageService.saveAlias(user.alias);

    await StorageService.saveProfile({
      name: user.name,
      surname: user.last_name,
      email: user.email,
      password: recoverPassword.trim(),
    });

    await StorageService.setHasPassword(true);
    await StorageService.setLoggedIn(true);

    navigate(AppRoutes.passwordGate);
  }

  // ------------------------------------------------------------
  // REGISTRAZIONE
  // ------------------------------------------------------------
  async function submit() {
    if (!firstName.trim() ||
        !lastName.trim() ||
        !alias.trim() ||
        !phone.trim() ||
        !email.trim() ||
        !password.trim() ||
        !confirmPassword.trim()) {
      await showErrorDialog("Errore", "Compila tutti i campi");
      return;
    }

    if (password.trim() !== confirmPassword.trim()) {
      await showErrorDialog("Errore", "Le password non coincidono");
      return;
    }

    if (!isStrongPassword(password.trim())) {
      await showErrorDialog("Password debole", "La password non rispetta i requisiti");
      return;
    }

    if (!legalAccepted) {
      await showErrorDialog("Errore", "Devi accettare i termini legali");
      return;
    }

    if (!notificationsAccepted) {
      await showErrorDialog("Errore", "Devi accettare le notifiche");
      return;
    }

    const normalizedPhone = normalizePhone(prefix, phone.trim());

    const response = await ApiService.registerUser({
      phone: normalizedPhone,
      publicKey: "",
      name: firstName.trim(),
      lastName: lastName.trim(),
      alias: alias.trim(),
      qrData: "",
      password: password.trim(),
      email: email.trim(),
    });

    if (!response) {
      await showErrorDialog("Errore", "Errore server");
      return;
    }

    if (response.error === "ALIAS_REQUIRED") {
      await showErrorDialog("Errore", "Alias mancante");
      return;
    }

    if (response.error === "ALIAS_TAKEN") {
      await showErrorDialog("Errore", "Alias già in uso");
      return;
    }

    if (response.error || !response.user) {
      await showErrorDialog("Errore", "Errore server");
      return;
    }

    const serverId = Number(response.user.id);

    await StorageService.saveAuthToken(response.authToken);
    await StorageService.saveUserId(serverId);
    await StorageService.saveQrData("");
    await StorageService.saveProfile({
      name: firstName.trim(),
      surname: lastName.trim(),
      email: email.trim(),
      password: password.trim(),
    });
    await StorageService.saveAlias(alias.trim());

    await StorageService.setHasPassword(true);
    await StorageService.setLoggedIn(true);

    PresenceService.instance.init();

    await showInfoDialog("ID generato", "Il tuo ID è stato creato con successo");

    navigate(AppRoutes.passwordGate);
  }

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  return (
    <WinkWinkScaffold
      showColorSelector={false}
      header={
        <div className="wink-header-simple">
          <h2 style={{ color: "white" }}>Accedi o Registrati</h2>
        </div>
      }
    >
      <div className="login-container">
        {/* RECUPERO PROFILO */}
        <h3 className="login-title">Hai già un profilo?</h3>

        <input
          className="login-input"
          placeholder="Alias"
          value={recoverAlias}
          onChange={(e) => setRecoverAlias(e.target.value)}
        />

        <input
          className="login-input"
          type={obscureRecover ? "password" : "text"}
          placeholder="Password"
          value={recoverPassword}
          onChange={(e) => setRecoverPassword(e.target.value)}
        />

        <NeonButton label="Recupera profilo" onClick={recoverProfile} />

        <div className="login-divider" />

        {/* LINK REGISTRAZIONE */}
        {!showRegistration && (
          <button
            className="login-link"
            onClick={() => setShowRegistration(true)}
          >
            Non hai un account? Registrati
          </button>
        )}

        {/* REGISTRAZIONE */}
        {showRegistration && (
          <>
            <input
              className="login-input"
              placeholder="Nome"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />

            <input
              className="login-input"
              placeholder="Cognome"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />

            <input
              className="login-input"
              placeholder="Alias"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
            />

            <div className="login-phone-row">
              <div className="login-prefix">{prefix}</div>
              <input
                className="login-input"
                placeholder="Telefono"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <input
              className="login-input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="login-input"
              type={obscurePassword ? "password" : "text"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              className="login-input"
              type={obscureConfirm ? "password" : "text"}
              placeholder="Conferma password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <label className="login-checkbox">
              <input
                type="checkbox"
                checked={notificationsAccepted}
                onChange={(e) => setNotificationsAccepted(e.target.checked)}
              />
              Accetto le notifiche
            </label>

            <label className="login-checkbox">
              <input
                type="checkbox"
                checked={legalAccepted}
                onChange={(e) => setLegalAccepted(e.target.checked)}
              />
              Accetto i termini legali
            </label>

            <NeonButton label="Genera ID" onClick={submit} />
          </>
        )}
      </div>
    </WinkWinkScaffold>
  );
}
