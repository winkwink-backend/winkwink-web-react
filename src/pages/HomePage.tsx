import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import MiniNeonButton from "../widgets/MiniNeonButton"
import WinkWinkScaffold from "../widgets/WinkWinkScaffold"
import { useColorProvider } from "../providers/ColorProvider"
import { AppState } from "../services/AppState"
import { AppRoutes } from "../routes/AppRoutes"
import { showExitDialog } from "../widgets/WWDialogs"
import { MdMonetizationOn, MdLock, MdLockOpen, MdSportsEsports, MdStorefront, MdKey, MdHelpOutline } from "react-icons/md"


export default function HomePage() {
  const navigate = useNavigate()
  const theme = useColorProvider()

  const userId =
    AppState.currentUser?.userId ?? AppState.currentUser?.id

  // WillPopScope equivalente
  useEffect(() => {
    const handler = async (e: BeforeUnloadEvent) => {
     e.preventDefault()

     const exit = await showExitDialog({
         title: "Uscire dall'app?",
          message: "Vuoi davvero chiudere WinkWink Web?"
     })

     if (exit) {
         window.close()
     }

     return ""
  }

    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [])

  return (
    <WinkWinkScaffold userId={userId} showColorSelector={true}>
      <div style={{ padding: "24px 24px 120px 24px" }}>
        {/* ⭐ MENU PRINCIPALE */}
        <MiniNeonButton
          label="WinkCoin"
          icon={MdMonetizationOn}
          onClick={() => navigate(AppRoutes.winkcoin)}
        />

        <MiniNeonButton
          label="Encrypt"
          icon={MdLock}
          onClick={() => navigate(AppRoutes.encrypt)}
        />

        <MiniNeonButton
          label="Decrypt"
          icon={MdLockOpen}
          onClick={() => navigate(AppRoutes.decrypt)}
        />

        {/* ⭐ PATCH: Video WW → Games */}
        <MiniNeonButton
          label="Games"
          icon={MdSportsEsports}
          onClick={() => navigate(AppRoutes.games)}
        />

        {/* ⭐ PATCH: WinkWink Web → WinkStore */}
        <MiniNeonButton
          label="WinkStore"
          icon={MdStorefront}
          onClick={() => navigate(AppRoutes.winkstore)}
        />

        <MiniNeonButton
          label="Passepartout"
          icon={MdKey}
          onClick={() => navigate(AppRoutes.passepartout)}
        />

        <MiniNeonButton
          label="FAQ"
          icon={MdHelpOutline}
          onClick={() => navigate(AppRoutes.faq)}
        />
      </div>
    </WinkWinkScaffold>
  )
}
