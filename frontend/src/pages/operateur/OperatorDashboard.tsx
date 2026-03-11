import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Wifi, Activity, Gamepad2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import api from "@/api/axios";

type Robot = {
  id: string;
  name: string;
  robotId: string;
  status: string;
};

const OperatorDashboard: React.FC = () => {
  const [robots, setRobots] = useState<Robot[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRobots = async () => {
    try {
      const { data } = await api.get("/api/robots");
      setRobots(data || []);
    } catch {
      console.error("Failed to load robots");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRobots();
  }, []);

  const activeRobots = robots.filter((r) => r.status === "online").length;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}

        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Operator Dashboard
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Monitor and control telepresence robots in real-time.
          </p>
        </div>

        {/* STATS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <motion.div
            className="bg-white border rounded-lg p-6 shadow-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm text-slate-500">Total Robots</p>

            <p className="text-3xl font-bold text-slate-800">
              {robots.length}
            </p>
          </motion.div>

          <motion.div
            className="bg-white border rounded-lg p-6 shadow-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm text-slate-500">Online Robots</p>

            <p className="text-3xl font-bold text-green-600">
              {activeRobots}
            </p>
          </motion.div>

          <motion.div
            className="bg-white border rounded-lg p-6 shadow-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm text-slate-500">Offline Robots</p>

            <p className="text-3xl font-bold text-red-500">
              {robots.length - activeRobots}
            </p>
          </motion.div>

        </div>

        {/* ROBOT LIST */}

        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">

          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold text-slate-800">
              Robots
            </h2>
          </div>

          <table className="w-full text-sm">

            <thead className="bg-slate-100 border-b">
              <tr>
                <th className="text-left px-6 py-3">Robot Name</th>
                <th className="text-left px-6 py-3">Robot ID</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-right px-6 py-3">Control</th>
              </tr>
            </thead>

            <tbody>

              {loading && (
                <tr>
                  <td colSpan={4} className="text-center py-10">
                    Loading robots...
                  </td>
                </tr>
              )}

              {!loading && robots.map((robot) => (
                <tr key={robot.id} className="border-b hover:bg-slate-50">

                  <td className="px-6 py-3 flex items-center gap-2">
                    <Bot size={16} />
                    {robot.name}
                  </td>

                  <td className="px-6 py-3 text-slate-600">
                    {robot.robotId}
                  </td>

                  <td className="px-6 py-3">

                    {robot.status === "online" ? (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs flex items-center gap-1 w-fit">
                        <Wifi size={12} />
                        Online
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                        Offline
                      </span>
                    )}

                  </td>

                  <td className="px-6 py-3 text-right">

                    <Button
                      size="sm"
                      className="bg-slate-900 hover:bg-slate-800 text-white flex gap-2"
                      onClick={() =>
                        (window.location.href = "/robot-control")
                      }
                    >
                      <Gamepad2 size={16} />
                      Control
                    </Button>

                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>
    </AppLayout>
  );
};

export default OperatorDashboard;