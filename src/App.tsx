import { FinderPhone } from './components/finder/FinderPhone'
import { MapStage } from './components/map/MapStage'
import { OwnerPhone } from './components/owner/OwnerPhone'
import { EvidenceButton, EvidenceDrawer } from './components/ui/EvidenceDrawer'
import { Overlays } from './components/ui/Overlays'
import { Stage } from './components/ui/Stage'
import { TopBar } from './components/ui/TopBar'
import { content } from './data/content'
import { StepProvider, usePresenter } from './state/StepContext'

export default function App() {
  return (
    <StepProvider>
      <Stage>
        <div className="flex h-full flex-col overflow-hidden">
          <TopBar />
          <main className="grid min-h-0 flex-1 grid-cols-[360px_minmax(0,1fr)_360px] gap-6 px-6 pt-5">
            <OwnerPhone />
            <MapStage />
            <FinderPhone />
          </main>
          <footer className="flex h-14 shrink-0 items-center justify-between px-6">
            <EvidenceButton />
            <PresenterHint />
          </footer>
        </div>
        <EvidenceDrawer />
        <Overlays />
      </Stage>
    </StepProvider>
  )
}

function PresenterHint() {
  const { hintVisible } = usePresenter()
  return (
    <span className={`text-xs text-muted/70 transition-opacity duration-300 ${hintVisible ? 'opacity-100' : 'opacity-0'}`}>
      {content.presenterHint}
    </span>
  )
}
