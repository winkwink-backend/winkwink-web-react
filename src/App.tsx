import { BrowserRouter, Routes, Route } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import HomePage from "./pages/HomePage"
// importa qui tutte le altre pagine che hai creato

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ⭐ La pagina che deve aprirsi sul dominio */}
        <Route path="/" element={<LoginPage />} />

        {/* ⭐ Le altre pagine */}
        <Route path="/home" element={<HomePage />} />
        {/* aggiungi qui tutte le altre route */}
      </Routes>
    </BrowserRouter>
  )
}
export default App
