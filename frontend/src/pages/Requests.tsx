import { useEffect, useMemo, useState } from "react";
import { MessageSquareText, UserCheck, UserX, Waypoints } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { MetricCard } from "@/components/dashboard/MetricCard";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import { getApiErrorMessage, logService, requestService } from "@/services/api";
import type { VisitorRequest } from "@/types/request";

const Requests: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<VisitorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await requestService.listPending();
      setRequests(data);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "Failed to load the request queue."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRequests();
  }, []);

  const staleCount = useMemo(
    () =>
      requests.filter((request) => {
        const createdAt = request.createdAt ? new Date(request.createdAt).getTime() : Date.now();
        return Date.now() - createdAt > 1000 * 60 * 60 * 12;
      }).length,
    [requests],
  );

  const queueSummary =
    requests.length === 0
      ? "No pending visitor requests."
      : `${requests.length} pending visitor request${requests.length > 1 ? "s" : ""} waiting for action.`;

  const handleApprove = (request: VisitorRequest) => {
    logService.record({
      category: "visit",
      severity: "info",
      actor: "Admin workflow",
      title: "Visitor approval flow started",
      description: `Preparing profile creation for ${request.firstName} ${request.lastName}.`,
    });

    navigate("/users/add", {
      state: {
        fromRequest: {
          requestId: request.id,
          firstName: request.firstName,
          lastName: request.lastName,
          email: request.email,
          phone: request.phone,
        },
      },
    });
  };

  const handleReject = async (request: VisitorRequest) => {
    setActiveRequestId(request.id);
    try {
      await requestService.reject(request.id);
      setRequests((previous) => previous.filter((item) => item.id !== request.id));
      logService.record({
        category: "visit",
        severity: "warning",
        actor: "Admin",
        title: "Visitor request rejected",
        description: `${request.firstName} ${request.lastName}'s request was rejected by the administration panel.`,
      });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Failed to reject the visitor request."));
    } finally {
      setActiveRequestId(null);
    }
  };

  const handleStartCall = (request: VisitorRequest) => {
    logService.record({
      category: "communication",
      severity: "info",
      actor: "Admin",
      title: "Pre-approval call launched",
      description: `A communication session was opened for ${request.firstName} ${request.lastName}.`,
    });

    navigate("/communication", {
      state: {
        visitor: request,
        mode: "video",
      },
    });
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="card-elevated p-6">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Visitor Requests</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Approve visitor entries, reject invalid requests, or start a live call before the remote
            telepresence experience begins.
          </p>
        </section>

        {error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard
            label="Pending Queue"
            value={loading ? "..." : requests.length}
            helper={queueSummary}
            icon={Waypoints}
            tone={requests.length > 0 ? "warning" : "default"}
          />
          <MetricCard
            label="Needs Attention"
            value={loading ? "..." : staleCount}
            helper="Requests waiting more than 12 hours should be reviewed first."
            icon={UserX}
            tone={staleCount > 0 ? "critical" : "default"}
          />
          <MetricCard
            label="Call Ready"
            value={loading ? "..." : requests.length}
            helper="Any queued request can immediately open the communication workspace."
            icon={MessageSquareText}
            tone="success"
          />
        </section>

        <section className="space-y-4">
          {loading ? (
            <div className="card-elevated p-8 text-sm text-muted-foreground">Loading request queue...</div>
          ) : requests.length === 0 ? (
            <div className="card-elevated p-8 text-sm text-muted-foreground">
              No pending requests. The visitor queue is clear for now.
            </div>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="card-elevated p-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-semibold text-foreground">
                        {request.firstName} {request.lastName}
                      </h2>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                        {request.status}
                      </span>
                    </div>

                    <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                      <p>{request.email}</p>
                      <p>{request.phone}</p>
                      <p>Submitted: {formatDateTime(request.createdAt)}</p>
                      <p>Latest update: {formatDateTime(request.updatedAt || request.createdAt)}</p>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-slate-50 p-4 text-sm text-muted-foreground">
                      {request.message}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
                    <Button className="gap-2" onClick={() => handleApprove(request)}>
                      <UserCheck className="h-4 w-4" />
                      Accept
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={() => handleStartCall(request)}>
                      <MessageSquareText className="h-4 w-4" />
                      Start Call
                    </Button>
                    <Button
                      variant="destructive"
                      className="gap-2"
                      disabled={activeRequestId === request.id}
                      onClick={() => void handleReject(request)}
                    >
                      <UserX className="h-4 w-4" />
                      {activeRequestId === request.id ? "Rejecting..." : "Reject"}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </AppLayout>
  );
};

export default Requests;
