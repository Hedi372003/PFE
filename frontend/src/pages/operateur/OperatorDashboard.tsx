import { useEffect, useState } from "react";
import { motion } from "framer-motion";
<<<<<<< HEAD
import { Bot, Wifi, Activity, Gamepad2 } from "lucide-react";
=======
import { Bot, Wifi, Battery, MapPin, Gamepad2 } from "lucide-react";
>>>>>>> forth
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import api from "@/api/axios";

type Robot = {
  id: string;
  name: string;
  robotId: string;
  status: string;
<<<<<<< HEAD
=======
  battery?: number;
  latitude?: number;
  longitude?: number;
>>>>>>> forth
};

const OperatorDashboard: React.FC = () => {
  const [robots, setRobots] = useState<Robot[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRobots = async () => {
    try {
      const { data } = await api.get("/api/robots");
      setRobots(data || []);
<<<<<<< HEAD
    } catch {
      console.error("Failed to load robots");
=======
    } catch (err) {
      console.error("Failed to load robots", err);
>>>>>>> forth
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRobots();
  }, []);

<<<<<<< HEAD
  const activeRobots = robots.filter((r) => r.status === "online").length;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
=======
  const onlineRobots = robots.filter((r) => r.status === "online").length;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-8">
>>>>>>> forth

        {/* HEADER */}

        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Operator Dashboard
          </h1>

<<<<<<< HEAD
          <p className="text-sm text-slate-500 mt-1">
            Monitor and control telepresence robots in real-time.
=======
          <p className="text-slate-500 text-sm mt-1">
            Monitor and control telepresence robots in real time
>>>>>>> forth
          </p>
        </div>

        {/* STATS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <motion.div
<<<<<<< HEAD
            className="bg-white border rounded-lg p-6 shadow-sm"
=======
            className="bg-white border rounded-xl p-6 shadow-sm"
>>>>>>> forth
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm text-slate-500">Total Robots</p>
<<<<<<< HEAD

=======
>>>>>>> forth
            <p className="text-3xl font-bold text-slate-800">
              {robots.length}
            </p>
          </motion.div>

          <motion.div
<<<<<<< HEAD
            className="bg-white border rounded-lg p-6 shadow-sm"
=======
            className="bg-white border rounded-xl p-6 shadow-sm"
>>>>>>> forth
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm text-slate-500">Online Robots</p>
<<<<<<< HEAD

            <p className="text-3xl font-bold text-green-600">
              {activeRobots}
=======
            <p className="text-3xl font-bold text-green-600">
              {onlineRobots}
>>>>>>> forth
            </p>
          </motion.div>

          <motion.div
<<<<<<< HEAD
            className="bg-white border rounded-lg p-6 shadow-sm"
=======
            className="bg-white border rounded-xl p-6 shadow-sm"
>>>>>>> forth
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm text-slate-500">Offline Robots</p>
<<<<<<< HEAD

            <p className="text-3xl font-bold text-red-500">
              {robots.length - activeRobots}
=======
            <p className="text-3xl font-bold text-red-500">
              {robots.length - onlineRobots}
>>>>>>> forth
            </p>
          </motion.div>

        </div>

<<<<<<< HEAD
        {/* ROBOT LIST */}

        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">

          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold text-slate-800">
              Robots
=======
        {/* ROBOT TABLE */}

        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">

          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold text-slate-800">
              Robot Fleet
>>>>>>> forth
            </h2>
          </div>

          <table className="w-full text-sm">

<<<<<<< HEAD
            <thead className="bg-slate-100 border-b">
              <tr>
                <th className="text-left px-6 py-3">Robot Name</th>
                <th className="text-left px-6 py-3">Robot ID</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-right px-6 py-3">Control</th>
=======
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-3 text-left">Robot</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Battery</th>
                <th className="px-6 py-3 text-left">Location</th>
                <th className="px-6 py-3 text-right">Control</th>
>>>>>>> forth
              </tr>
            </thead>

            <tbody>

              {loading && (
                <tr>
<<<<<<< HEAD
                  <td colSpan={4} className="text-center py-10">
=======
                  <td colSpan={5} className="text-center py-10">
>>>>>>> forth
                    Loading robots...
                  </td>
                </tr>
              )}

              {!loading && robots.map((robot) => (
<<<<<<< HEAD
=======

>>>>>>> forth
                <tr key={robot.id} className="border-b hover:bg-slate-50">

                  <td className="px-6 py-3 flex items-center gap-2">
                    <Bot size={16} />
                    {robot.name}
                  </td>

<<<<<<< HEAD
                  <td className="px-6 py-3 text-slate-600">
                    {robot.robotId}
                  </td>

=======
>>>>>>> forth
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

<<<<<<< HEAD
=======
                  <td className="px-6 py-3 flex items-center gap-1 text-slate-600">

                    <Battery size={14} />

                    {robot.battery ?? 80}%

                  </td>

                  <td className="px-6 py-3 flex items-center gap-1 text-slate-600">

                    <MapPin size={14} />

                    {robot.latitude
                      ? `${robot.latitude.toFixed(3)}, ${robot.longitude?.toFixed(3)}`
                      : "Unknown"}

                  </td>

>>>>>>> forth
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
<<<<<<< HEAD
=======

>>>>>>> forth
              ))}

            </tbody>

          </table>

        </div>

      </div>
    </AppLayout>
  );
};

<<<<<<< HEAD
export default OperatorDashboard;
=======
export default OperatorDashboard;
>>>>>>> forth
