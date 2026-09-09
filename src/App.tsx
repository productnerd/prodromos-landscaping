import { useRef } from 'react';
import Toolbar from './components/Toolbar/Toolbar';
import GardenCanvas from './components/Canvas/GardenCanvas';
import { PlantSidebar } from './components/Sidebar/PlantSidebar';
import { TimelineSlider } from './components/Timeline/TimelineSlider';
import { PlantInfoPanel } from './components/InfoPanel/PlantInfoPanel';

export default function App() {
  const stageRef = useRef<any>(null);

  return (
    <div className="flex flex-col h-screen bg-[var(--cream)] text-[var(--ink)]">
      <Toolbar stageRef={stageRef} />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 relative min-h-0">
          <GardenCanvas stageRef={stageRef} />
          <PlantInfoPanel />
        </div>
        <PlantSidebar />
      </div>
      <TimelineSlider />
    </div>
  );
}
