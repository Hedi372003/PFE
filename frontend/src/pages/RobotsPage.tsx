import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Bot } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import api from "@/api/axios";

type Robot = {
  id: string;
  name: string;
  robotId: string;
  latitude: number;
  longitude: number;
  status: string;
};

const RobotsPage: React.FC = () => {
  const [robots, setRobots] = useState<Robot[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRobots = async () => {
    try {
      const { data } = await api.get<Robot[]>("/api/robots");
      setRobots(data);
    } catch (err) {
      console.error("Failed to load robots", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRobots();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/robots/${id}`);
      setRobots((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-emerald-100 text-emerald-700";
      case "maintenance":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-rose-100 text-rose-700";
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Robots</h1>
            <p className="text-sm text-muted-foreground">
              View and manage all telepresence robots registered on the platform.
            </p>
          </div>

          <Link to="/robots/add">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Robot
            </Button>
          </Link>
        </div>

        {/* Robots Grid */}
        {loading ? (
          <p>Loading robots...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {robots.map((robot, index) => (
              <motion.div
                key={robot.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card-elevated p-5 space-y-4"
              >
                <div className="flex justify-between items-center">
                  <Bot className="h-8 w-8 text-accent" />
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded ${statusColor(
                      robot.status
                    )}`}
                  >
                    {robot.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-lg">{robot.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    ID: {robot.robotId}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Coords: {robot.latitude}, {robot.longitude}
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <Link to={`/robots/edit/${robot.id}`}>
                    <Button variant="outline" className="gap-2">
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => handleDelete(robot.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default RobotsPage;