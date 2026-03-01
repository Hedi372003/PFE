import { useEffect, useState } from "react";
import { Plus, Trash2, Bot, ArrowLeft } from "lucide-react";

interface Robot {
  _id: string;
  name: string;
  robotId: string;
  status: string;
  latitude: number;
  longitude: number;
}

interface RobotFormData {
  name: string;
  robotId: string;
  status: string;
  latitude: string;
  longitude: string;
}

const RobotsPage: React.FC = () => {
  const [robots, setRobots] = useState<Robot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [view, setView] = useState<"list" | "add">("list");
  const [formData, setFormData] = useState<RobotFormData>({
    name: "",
    robotId: "",
    status: "offline",
    latitude: "0",
    longitude: "0",
  });

  useEffect(() => {
    void fetchRobots();
  }, []);

  const fetchRobots = async (): Promise<void> => {
    try {
      const res = await fetch("http://localhost:5000/api/robots");
      const data = (await res.json()) as Robot[];
      if (Array.isArray(data)) {
        setRobots(data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    const dataToSend = {
      ...formData,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
    };

    try {
      const res = await fetch("http://localhost:5000/api/robots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const responseData = (await res.json()) as { message?: string };

      if (res.ok) {
        setView("list");
        await fetchRobots();
        setFormData({
          name: "",
          robotId: "",
          status: "offline",
          latitude: "0",
          longitude: "0",
        });
      } else {
        alert("Error: " + (responseData.message || "Unable to add robot"));
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("Server connection error");
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (!window.confirm("Are you sure you want to delete this robot?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/robots/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchRobots();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const statusColor = (status: string): string => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-600 border-green-200";
      case "offline":
        return "bg-red-100 text-red-600 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-600 border-yellow-200";
    }
  };

  if (view === "add") {
    return (
      <div className="max-w-2xl bg-white p-8 rounded-xl border shadow-sm mx-auto">
        <button
          onClick={() => setView("list")}
          className="flex items-center gap-2 text-gray-500 mb-6 hover:text-black transition"
        >
          <ArrowLeft size={18} /> Back to list
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Register a New Robot
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Robot Name
              </label>
              <input
                placeholder="ex: Alpha-1"
                className="p-2 border rounded w-full focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.name}
                required
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unique ID
              </label>
              <input
                placeholder="ex: R-100"
                className="p-2 border rounded w-full focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.robotId}
                required
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, robotId: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                placeholder="0.0000"
                className="p-2 border rounded w-full"
                value={formData.latitude}
                required
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, latitude: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                placeholder="0.0000"
                className="p-2 border rounded w-full"
                value={formData.longitude}
                required
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, longitude: e.target.value })
                }
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-[#0b1426] text-white px-6 py-3 rounded-lg w-full mt-4 hover:bg-opacity-90 transition font-bold"
          >
            Confirm Registration
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Robot Fleet</h2>
          <p className="text-gray-500">
            Manage and monitor your telepresence units.
          </p>
        </div>
        <button
          onClick={() => setView("add")}
          className="flex items-center gap-2 bg-[#0b1426] text-white px-4 py-2 rounded-lg hover:shadow-lg transition"
        >
          <Plus size={18} /> Add Robot
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500 italic">
          Loading fleet...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {robots.length === 0 ? (
            <p className="col-span-full text-center py-10 text-gray-400">
              No robots registered.
            </p>
          ) : (
            robots.map((robot) => (
              <div
                key={robot._id}
                className="bg-white p-6 rounded-xl shadow-sm border relative hover:shadow-md transition"
              >
                <span
                  className={`absolute top-4 right-4 px-3 py-1 text-[10px] uppercase font-bold rounded-full border ${statusColor(
                    robot.status
                  )}`}
                >
                  {robot.status}
                </span>
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <Bot className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{robot.name}</h3>
                    <p className="text-xs text-gray-400">ID: {robot.robotId}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500 space-y-1 border-t pt-4">
                  <p>
                    Location: {robot.latitude} , {robot.longitude}
                  </p>
                </div>
                <div className="flex justify-between mt-6">
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition">
                    Details
                  </button>
                  <button
                    onClick={() => void handleDelete(robot._id)}
                    className="text-red-400 hover:text-red-600 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default RobotsPage;
