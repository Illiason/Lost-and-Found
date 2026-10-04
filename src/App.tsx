import { FinderPhone } from './components/finder/FinderPhone'
import { MapStage } from './components/map/MapStage'
import { OwnerPhone } from './components/owner/OwnerPhone'
import { EvidenceButton, EvidenceDrawer } from './components/ui/EvidenceDrawer'
import { TopBar } from './components/ui/TopBar'
import { StepProvider } from './state/StepContext'

export default function App() {
  return (
    <StepProvider>
      <div className="flex h-screen flex-col overflow-hidden">
        <TopBar />
        <main className="grid min-h-0 flex-1 grid-cols-[360px_minmax(0,1fr)_360px] gap-6 px-6 pt-5">
          <OwnerPhone />
          <MapStage />
          <FinderPhone />
        </main>
        <footer className="flex h-14 shrink-0 items-center justify-between px-6">
          <EvidenceButton />
          <span className="text-xs text-muted/70">→ next · ← back · R reset · E evidence</span>
        </footer>
      </div>
      <EvidenceDrawer />
    </StepProvider>
  )
}
