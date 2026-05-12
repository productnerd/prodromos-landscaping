import { useState, useRef } from 'react';
import Toolbar from './components/Toolbar/Toolbar';
import GardenCanvas from './components/Canvas/GardenCanvas';
import { PlantSidebar } from './components/Sidebar/PlantSidebar';
import { TimelineSlider } from './components/Timeline/TimelineSlider';
import { PlantingPlanModal } from './components/PlantingPlan/PlantingPlanModal';

export default function App() {
  const [showPlantingPlan, setShowPlantingPlan] = useState(false);
  const stageRef = useRef<any>(null);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Toolbar
        stageRef={stageRef}
        onShowPlantingPlan={() => setShowPlantingPlan(true)}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          <GardenCanvas stageRef={stageRef} />
        </div>
        <PlantSidebar />
      </div>
      <TimelineSlider />
      <PlantingPlanModal
        isOpen={showPlantingPlan}
        onClose={() => setShowPlantingPlan(false)}
      />
    </div>
  );
}
