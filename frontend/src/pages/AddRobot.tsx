import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/api/axios";

const AddRobot: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [robotId, setRobotId] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post("/api/robots", {
        name,
        robotId,
        latitude: Number(latitude),
        longitude: Number(longitude),
        status: "offline",
      });

      navigate("/robots");
    } catch (err) {
      console.error("Failed to create robot", err);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Add Robot</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Robot Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            placeholder="Robot ID"
            value={robotId}
            onChange={(e) => setRobotId(e.target.value)}
            required
          />

          <Input
            type="number"
            placeholder="Latitude"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            required
          />

          <Input
            type="number"
            placeholder="Longitude"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            required
          />

          <Button type="submit">Create Robot</Button>
        </form>
      </div>
    </AppLayout>
  );
};

export default AddRobot;