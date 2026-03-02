import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";

const RobotControl: React.FC = () => {
  const [videoOn, setVideoOn] = useState(false);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Robot Control
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Operate the telepresence robot in real time.
            Use the directional controls to navigate and toggle video or audio feeds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Video Panel */}
          <div className="md:col-span-2 card-elevated p-6 flex flex-col justify-between">
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              {videoOn
                ? "Video streaming..."
                : "Video stream is offline. Click Start to begin."}
            </div>

            <div className="flex gap-3 mt-4">
              <Button onClick={() => setVideoOn(true)}>
                Start Video
              </Button>
              <Button variant="outline">
                Unmute
              </Button>
            </div>
          </div>

          {/* Directional Controls */}
          <div className="card-elevated p-6 flex flex-col items-center justify-center">
            <h3 className="font-semibold mb-6">Directional Controls</h3>

            <div className="grid grid-cols-3 gap-3">
              <div />
              <Button>↑</Button>
              <div />

              <Button>←</Button>
              <Button variant="secondary">•</Button>
              <Button>→</Button>

              <div />
              <Button>↓</Button>
              <div />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default RobotControl;