import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getApiErrorMessage, logService, robotService } from "@/services/api";
import type { RobotDraft, RobotStatus } from "@/types/robot";

const initialForm: RobotDraft = {
  name: "", 
  robotId: "",
  latitude: 36.8065,
  longitude: 10.1815,
  status: "offline",
};

const AddRobot: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<RobotDraft>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const createdRobot = await robotService.create(form);

      logService.record({
        category: "robot",
        severity: "success",
        actor: "Admin",
        title: "Robot created",
        description: `${createdRobot.name} (${createdRobot.robotId}) was added to the fleet.`,
      });

      navigate("/robots", {
        replace: true,
        state: { toast: "Robot added successfully." },
      });
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, "Unable to add this robot right now."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Register Robot</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Add a telepresence robot with its identity, location, and starting fleet status.
          </p>
        </div>

        {error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="card-elevated p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="robot-name">Robot Name</Label>
              <Input
                id="robot-name"
                value={form.name}
                onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="robot-id">Robot ID</Label>
              <Input
                id="robot-id"
                value={form.robotId}
                onChange={(event) => setForm((previous) => ({ ...previous, robotId: event.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="robot-latitude">Latitude</Label>
              <Input
                id="robot-latitude"
                type="number"
                step="0.0001"
                value={form.latitude}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, latitude: Number(event.target.value) }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="robot-longitude">Longitude</Label>
              <Input
                id="robot-longitude"
                type="number"
                step="0.0001"
                value={form.longitude}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, longitude: Number(event.target.value) }))
                }
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="robot-status">Initial Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setForm((previous) => ({ ...previous, status: value as RobotStatus }))
                }
              >
                <SelectTrigger id="robot-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Adding robot..." : "Add Robot"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default AddRobot;
