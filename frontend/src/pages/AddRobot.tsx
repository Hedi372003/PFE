import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/api/axios";

interface ApiErrorResponse {
  message?: string;
}

const AddRobot: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [robotId, setRobotId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedRobotId = robotId.trim();

    if (!trimmedName || !trimmedRobotId) {
      setError("Robot name and robot ID are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/api/robots", {
        name: trimmedName,
        robotId: trimmedRobotId,
        status: "offline",
      });

      navigate("/robots", {
        replace: true,
        state: { toast: "Robot created successfully." },
      });
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const apiMessage = (err.response?.data as ApiErrorResponse | undefined)?.message;
        setError(apiMessage || "Failed to add robot.");
      } else {
        setError("Failed to add robot.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Add Robot</h1>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

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

          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Robot"}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
};

export default AddRobot;
