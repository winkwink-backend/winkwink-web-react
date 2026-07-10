import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import NeonButton from "../widgets/NeonButton"
import WinkWinkScaffold from "../widgets/WinkWinkScaffold"
import { useColorProvider } from "../providers/ColorProvider"
import { AppState } from "../services/AppState"
import { AppRoutes } from "../routes/AppRoutes"
import { showExitDialog } from "../widgets/WWDialogs"
import {
  MdMonetizationOn,
  MdImage,
  MdLock,
  MdLockOpen,
  MdSportsEsports,
  MdStorefront,
  MdKey,
  MdHelpOutline
} from "react-icons/md"

export default function HomePage() {
  const navigate = useNavigate()
  const theme = useColorProvider()

  const userId =
    AppState.currentUser?.userId ?? AppState.currentUser?.id

  // Conferma uscita (equivalente WillPopScope)
  useEffect(() => {
    const handler = async (e: BeforeUnloadEvent) => {
      e.preventDefault()

      const exit = await showExitDialog({
        title: "Uscire dall'app?",
        message: "Vuoi davvero chiudere WinkWink Web?"
      })

      if (exit) window.close()
      return ""
    }

    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [])

  return (
    <WinkWinkScaffold userId={userId} showColorSelector={true}>
      <div style={{ padding: "24px", maxWidth: 480, margin: "0 auto" }}>
        
        <NeonButton
          label="WinkCoin"
          icon={MdMonetizationOn}
          onClick={() => navigate(AppRoutes.winkcoin)}
        />

        <NeonButton
          label="WW immagine"
          icon={MdImage}
          onClick={() => navigate(AppRoutes.encrypt)}
        />

        <NeonButton
          label="Decifra"
          icon={MdLockOpen}
          onClick={() => navigate(AppRoutes.decrypt)}
        />

        <NeonButton
          label="Games"
          icon={MdSportsEsports}
          onClick={() => navigate(AppRoutes.games)}
        />

        <NeonButton
          label="WinkStore"
          icon={MdStorefront}
          onClick={() => navigate(AppRoutes.winkstore)}
        />

        <NeonButton
          label="Chiave maestra"
          icon={MdKey}
          onClick={() => navigate(AppRoutes.passepartout)}
        />

        <NeonButton
          label="FAQ"
          icon={MdHelpOutline}
          onClick={() => navigate(AppRoutes.faq)}
        />

      </div>
    </WinkWinkScaffold>
  )
}
