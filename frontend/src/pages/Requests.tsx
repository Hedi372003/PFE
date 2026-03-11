import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { Button } from "../components/ui/button";
import api from "@/api/axios";

interface RequestItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message?: string;
  password?: string;
  status: string;
}

const Requests: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      setError("");
      const token = localStorage.getItem("token");
      const { data } = await api.get<RequestItem[]>("/api/requests", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      console.debug("Pending requests fetched:", data.length);
      setRequests(data);
    } catch (err) {
      console.error("Failed to load requests:", err);
      setError("Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRequests();
  }, []);

  const handleApprove = (id: string) => {
    const request = requests.find((item) => item.id === id);
    if (!request) {
      setError("Request not found.");
      return;
    }

    setRequests((prev) => prev.filter((item) => item.id !== id));
    navigate("/users/add", {
      state: {
        fromRequest: {
          requestId: request.id,
          firstName: request.firstName,
          lastName: request.lastName,
          email: request.email,
          phone: request.phone,
          password: request.password || "",
        },
      },
    });
  };

  const handleReject = async (id: string) => {
    try {
      await api.put(`/api/requests/${id}/reject`);
      await fetchRequests();
    } catch (err) {
      console.error("Failed to reject request:", err);
      setError("Failed to reject request.");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Pending Requests</h1>

        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-4">
            {requests.length === 0 && <p className="text-muted-foreground">No pending requests.</p>}

            {requests.map((req) => (
              <div key={req.id} className="card-elevated p-5">
                <div className="flex justify-between items-center gap-4">
                  <div>
                    <p className="font-semibold">
                      {req.firstName} {req.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {req.email} | {req.phone}
                    </p>
                    {req.message && <p className="text-sm mt-1 text-muted-foreground">{req.message}</p>}
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => handleApprove(req.id)} className="bg-green-600 hover:bg-green-700">
                      Approve
                    </Button>
                    <Button variant="destructive" onClick={() => void handleReject(req.id)}>
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Requests;
