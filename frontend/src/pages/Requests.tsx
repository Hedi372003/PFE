import { useEffect, useMemo, useState } from "react";
import { MessageSquareText, PhoneCall, UserX, Waypoints } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { MetricCard } from "@/components/dashboard/MetricCard";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import { getApiErrorMessage, logService, requestService } from "@/services/api";
import type { VisitorRequest } from "@/types/request";

const requestChartColors = ["#f59e0b", "#e11d48", "#10b981"];

const ignoredConversationPatterns = [
  /guided intake/i,
  /technologies/i,
  /project process/i,
  /admin handoff/i,
  /request details/i,
  /smart request/i,
  /admin notified/i,
  /these fields follow/i,
  /full chat transcript/i,
  /contact admin/i,
  /request sent/i,
  /click/i,
  /system/i,
];

function buildConversation(request: VisitorRequest) {
  const lines = request.message
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !ignoredConversationPatterns.some((pattern) => pattern.test(line)));

  const speakerLines = lines
    .map((line, index) => {
      const speakerMatch = line.match(/^(visitor|user|guest|bot|chatbot|assistant|agent)\s*[:\-]\s*(.*)$/i);
      if (!speakerMatch && lines.length > 1) {
        return null;
      }

      const speaker = speakerMatch?.[1]?.toLowerCase() || "visitor";
      const text = (speakerMatch?.[2] || line).trim();
      const isVisitor = ["visitor", "user", "guest"].includes(speaker);

      if (!text || ignoredConversationPatterns.some((pattern) => pattern.test(text))) {
        return null;
      }

      return {
        id: `${request.id}-${index}`,
        speaker: isVisitor ? "Visitor" : "Chatbot",
        text,
        isVisitor,
      };
    })
    .filter((message): message is { id: string; speaker: string; text: string; isVisitor: boolean } => Boolean(message));

  if (speakerLines.length > 0) {
    return speakerLines;
  }

  const fallbackText = request.message.trim() || "No visit details supplied.";

  return [
    {
      id: `${request.id}-fallback`,
      speaker: "Visitor",
      text: fallbackText,
      isVisitor: true,
    },
  ];
}

const Requests: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<VisitorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRequests = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await requestService.listCallReady();
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

  const pendingCount = useMemo(
    () => requests.filter((request) => request.status === "pending").length,
    [requests],
  );

  const staleCount = useMemo(
    () =>
      requests.filter((request) => {
        if (request.status !== "pending") {
          return false;
        }

        const createdAt = request.createdAt ? new Date(request.createdAt).getTime() : Date.now();
        return Date.now() - createdAt > 1000 * 60 * 60 * 12;
      }).length,
    [requests],
  );

  const queueSummary =
    pendingCount === 0
      ? "No pending visitor requests."
      : `${pendingCount} pending visitor request${pendingCount > 1 ? "s" : ""} waiting for action.`;

  const requestChartData = useMemo(
    () => [
      {
        name: "Pending Queue",
        value: pendingCount,
        description: "Requests currently stored as pending.",
      },
      {
        name: "Needs Attention",
        value: staleCount,
        description: "Pending requests older than 12 hours.",
      },
      {
        name: "Call Ready",
        value: requests.length,
        description: "Pending requests ready to open a call.",
      },
    ],
    [pendingCount, requests.length, staleCount],
  );

  const chartTotal = requestChartData.reduce((total, item) => total + item.value, 0);

  const handleContactVisitor = (request: VisitorRequest) => {
    logService.record({
      category: "communication",
      severity: "info",
      actor: "Admin",
      title: "Visitor contact launched",
      description: `A communication session was opened for ${request.firstName} ${request.lastName}.`,
    });

    navigate("/robot-control", {
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
            Review visitor details and open a direct communication session when a follow-up is needed.
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
            value={loading ? "..." : pendingCount}
            helper={queueSummary}
            icon={Waypoints}
            tone={pendingCount > 0 ? "warning" : "default"}
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

        <section className="card-elevated p-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Request Status Overview</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Database-backed view of pending requests, attention priority, and call readiness.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {requestChartData.map((item, index) => (
                  <div key={item.name} className="rounded-2xl border border-border/70 bg-slate-50 p-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: requestChartColors[index] }}
                      />
                      <p className="text-sm font-semibold text-foreground">{item.name}</p>
                    </div>
                    <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                      {loading ? "..." : item.value}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative h-[280px]">
              {loading ? (
                <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-border text-sm text-muted-foreground">
                  Loading chart data...
                </div>
              ) : chartTotal === 0 ? (
                <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-slate-50 text-center">
                  <p className="text-4xl font-semibold text-foreground">0</p>
                  <p className="mt-2 text-sm text-muted-foreground">No request data to display.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={requestChartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={68}
                      outerRadius={104}
                      paddingAngle={3}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {requestChartData.map((item, index) => (
                        <Cell key={item.name} fill={requestChartColors[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          {loading ? (
            <div className="card-elevated p-8 text-sm text-muted-foreground">Loading request queue...</div>
          ) : requests.length === 0 ? (
            <div className="card-elevated p-8 text-sm text-muted-foreground">
              No visitor requests are available for contact right now.
            </div>
          ) : (
            requests.map((request) => {
              const conversation = buildConversation(request);

              return (
              <div key={request.id} className="card-elevated p-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1 space-y-5">
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

                    <details className="rounded-3xl border border-border/70 bg-slate-50 p-4">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">Visitor conversation</p>
                          <p className="text-xs text-muted-foreground">
                            Only visitor and chatbot messages are shown.
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                          Show {conversation.length} message{conversation.length > 1 ? "s" : ""}
                        </span>
                      </summary>

                      <div className="mt-4 space-y-3 border-t border-border/70 pt-4">
                        {conversation.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.isVisitor ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[min(36rem,100%)] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                                message.isVisitor
                                  ? "bg-slate-950 text-white"
                                  : "border border-border/70 bg-white text-slate-700"
                              }`}
                            >
                              <p
                                className={`mb-1 text-xs font-semibold ${
                                  message.isVisitor ? "text-slate-300" : "text-slate-500"
                                }`}
                              >
                                {message.speaker}
                              </p>
                              <p>{message.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
                    <Button className="gap-2" onClick={() => handleContactVisitor(request)}>
                      <PhoneCall className="h-4 w-4" />
                      Contact Visitor
                    </Button>
                  </div>
                </div>
              </div>
              );
            })
          )}
        </section>
      </div>
    </AppLayout>
  );
};

export default Requests;
