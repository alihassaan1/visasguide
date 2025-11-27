import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Activity, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ContentAgentLogs = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentPage, setCurrentPage] = useState<{ title: string; type: string } | null>(null);
  const [agentStatus, setAgentStatus] = useState<'idle' | 'running' | 'completed'>('idle');

  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ["content-agent-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_log")
        .select("*")
        .eq("action", "content_agent_update")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
  });

  // Set up realtime subscription for live progress
  useEffect(() => {
    const channel = supabase
      .channel('agent-progress')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_log',
          filter: 'action=eq.content_agent_status'
        },
        (payload) => {
          const metadata = payload.new.metadata as any;
          console.log('Agent status update:', metadata);
          
          if (metadata.status === 'started') {
            setAgentStatus('running');
            setCurrentPage(null);
          } else if (metadata.status === 'processing') {
            setCurrentPage({
              title: metadata.title,
              type: payload.new.entity_type
            });
          } else if (metadata.status === 'completed') {
            setAgentStatus('completed');
            setCurrentPage(null);
            setTimeout(() => {
              setAgentStatus('idle');
              refetch();
            }, 3000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const runAgent = async () => {
    try {
      setIsRunning(true);
      toast.info("Starting content agent...");

      const { data, error } = await supabase.functions.invoke("content-agent", {
        body: {},
      });

      if (error) throw error;

      toast.success(`Agent completed! Updated ${data.updates_made} pages`);
      refetch();
    } catch (error) {
      console.error("Error running agent:", error);
      toast.error("Failed to run content agent");
    } finally {
      setIsRunning(false);
    }
  };

  const getEntityTypeColor = (type: string) => {
    switch (type) {
      case "content_page":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "news_article":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Agent Logs</h1>
          <p className="text-muted-foreground mt-2">
            Track automated content updates made by the AI agent
          </p>
        </div>
        <Button onClick={runAgent} disabled={isRunning}>
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Activity className="w-4 h-4 mr-2" />
              Run Agent Now
            </>
          )}
        </Button>
      </div>

      {agentStatus === 'running' && (
        <Alert className="bg-blue-500/10 border-blue-500/20">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription className="ml-2">
            <div className="font-medium">Agent is running...</div>
            {currentPage && (
              <div className="text-sm mt-1">
                Currently processing: <span className="font-semibold">{currentPage.title}</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  {currentPage.type?.replace('_', ' ')}
                </Badge>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {agentStatus === 'completed' && (
        <Alert className="bg-green-500/10 border-green-500/20">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="ml-2">
            <div className="font-medium text-green-500">Agent completed successfully!</div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Updates</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs?.length || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 24 Hours</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                logs?.filter(
                  (log) =>
                    new Date(log.created_at) >
                    new Date(Date.now() - 24 * 60 * 60 * 1000)
                ).length || 0
              }
            </div>
            <p className="text-xs text-muted-foreground">Recent updates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground">All updates successful</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Update History</CardTitle>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading logs...
            </div>
          ) : !logs || logs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No logs yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Run the agent to see update logs
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Entity Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Fields Updated</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => {
                    const metadata = log.metadata as any;
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {format(new Date(log.created_at), "MMM dd, yyyy HH:mm")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getEntityTypeColor(log.entity_type || "")}
                          >
                            {log.entity_type?.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {metadata?.title || "Unknown"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {metadata?.fields_updated?.map((field: string) => (
                              <Badge
                                key={field}
                                variant="secondary"
                                className="text-xs"
                              >
                                {field}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-green-500/10 text-green-500 border-green-500/20"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Success
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentAgentLogs;
