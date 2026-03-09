import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Wifi } from "lucide-react";

const RobotControl: React.FC = () => {
  const [videoOn, setVideoOn] = useState(false);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Robot Control
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Operate the telepresence robot in real time. Use the directional
            controls to navigate and toggle video or audio feeds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* VIDEO PANEL */}
          <div className="md:col-span-2 bg-white border rounded-lg shadow-sm flex flex-col justify-between">

            {/* Status */}
            <div className="flex justify-end p-4">
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                <Wifi size={14} />
                Connected
              </div>
            </div>

            {/* Video Area */}
            <div className="h-72 flex items-center justify-center text-slate-500">
              {videoOn
                ? "Video streaming..."
                : "Video stream is offline. Click Start to begin."}
            </div>

            {/* Controls */}
            <div className="border-t p-4 flex gap-3">
              <Button
                className="bg-slate-900 hover:bg-slate-800 text-white"
                onClick={() => setVideoOn(true)}
              >
                Start Video
              </Button>

              <Button variant="outline">
                Unmute
              </Button>
            </div>

          </div>

          {/* DIRECTION CONTROLS */}
          <div className="bg-white border rounded-lg shadow-sm p-6 flex flex-col items-center">

            <h3 className="font-semibold text-slate-700 mb-6">
              Directional Controls
            </h3>

            <div className="grid grid-cols-3 gap-4">

              <div />

              <Button className="bg-slate-900 text-white hover:bg-slate-800">
                <ArrowUp size={18} />
              </Button>

              <div />

              <Button className="bg-slate-900 text-white hover:bg-slate-800">
                <ArrowLeft size={18} />
              </Button>

              <Button
                variant="secondary"
                className="bg-gray-200 text-gray-600 cursor-default"
              >
                ●
              </Button>

              <Button className="bg-slate-900 text-white hover:bg-slate-800">
                <ArrowRight size={18} />
              </Button>

              <div />

              <Button className="bg-slate-900 text-white hover:bg-slate-800">
                <ArrowDown size={18} />
              </Button>

              <div />

            </div>

          </div>

        </div>
      </div>
    </AppLayout>
  );
};

export default RobotControl;