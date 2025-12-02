import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  RefreshCw, Activity, CheckCircle, XCircle, Clock, Loader2, 
  Play, Pause, Settings, Globe, FileText, HelpCircle, CreditCard,
  Bot, Zap, Calendar, TrendingUp, AlertCircle
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface AgentTask {
  id: string;
  name: string;
  mode: string;
  description: string;
  icon: React.ReactNode;
  schedule: string;
  batchSize: number;
  status: 'idle' | 'running' | 'completed' | 'error';
  lastRun?: string;
  nextRun?: string;
  progress?: { current: string; total?: number };
}

const AgentDashboard = () => {
  const [activeTask, setActiveTask] = useState<{ mode: string; entity: string; type: string } | null>(null);
  const [taskSettings, setTaskSettings] = useState({
    ctr: { enabled: true, batchSize: 8 },
    create: { enabled: true, batchSize: 5 },
    visaEnrichment: { enabled: true, batchSize: 10 },
    blogGeneration: { enabled: true, batchSize: 3 },
    faqGeneration: { enabled: true, batchSize: 5 },
  });

  // Fetch recent activity logs
  const { data: recentActivity, refetch: refetchActivity } = useQuery({
    queryKey: ["agent-recent-activity"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_log")
        .select("*")
        .in("action", [
          "content_agent_ctr_optimization",
          "content_agent_status",
          "content_agent_update"
        ])
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 10000,
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ["agent-stats"],
    queryFn: async () => {
      const [countriesRes, contentRes, visaRes, blogRes] = await Promise.all([
        supabase.from("countries").select("id", { count: "exact", head: true }),
        supabase.from("content_pages").select("id", { count: "exact", head: true }).like("slug", "countries/%"),
        supabase.from("visa_requirements").select("id", { count: "exact", head: true }).or("fee_usd.is.null,processing_time_days.is.null"),
        supabase.from("content_pages").select("id", { count: "exact", head: true }).like("slug", "blog/%"),
      ]);

      return {
        totalCountries: countriesRes.count || 0,
        countriesWithContent: contentRes.count || 0,
        visaNeedingEnrichment: visaRes.count || 0,
        blogPosts: blogRes.count || 0,
      };
    },
    refetchInterval: 30000,
  });

  // Real-time subscription for live updates
  useEffect(() => {
    const channel = supabase
      .channel('agent-live-dashboard')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_log',
        },
        (payload) => {
          const action = payload.new.action;
          const metadata = payload.new.metadata as any;

          if (action === 'content_agent_status') {
            if (metadata?.status === 'processing') {
              setActiveTask({
                mode: metadata.mode || payload.new.entity_type,
                entity: metadata.country_name || metadata.title || metadata.page_title || metadata.from_country || 'Processing...',
                type: payload.new.entity_type || ''
              });
            } else if (metadata?.status === 'completed' || metadata?.status === 'started') {
              if (metadata?.status === 'started') {
                setActiveTask({
                  mode: metadata.bulkCTRMode ? 'bulk_ctr' : metadata.visaEnrichmentMode ? 'visa_enrichment' : metadata.blogGenerationMode ? 'blog_generation' : metadata.faqGenerationMode ? 'faq_generation' : 'default',
                  entity: 'Starting...',
                  type: 'system'
                });
              } else {
                setTimeout(() => setActiveTask(null), 2000);
              }
              refetchActivity();
            }
          } else if (action === 'content_agent_ctr_optimization') {
            refetchActivity();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchActivity]);

  const runTask = async (mode: string, batchSize: number) => {
    try {
      toast.info(`Starting ${mode} task...`);
      
      const body: any = { batchSize };
      if (mode === 'bulkCTR') body.bulkCTR = true;
      else if (mode === 'visaEnrichment') body.visaEnrichment = true;
      else if (mode === 'blogGeneration') body.blogGeneration = true;
      else if (mode === 'faqGeneration') body.faqGeneration = true;

      const { data, error } = await supabase.functions.invoke("content-agent", { body });

      if (error) throw error;
      toast.success(`Task completed! ${data.updates_made} updates made.`);
      refetchActivity();
    } catch (error) {
      console.error("Error running task:", error);
      toast.error("Failed to run task");
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'country_ctr': return <Globe className="h-4 w-4 text-blue-500" />;
      case 'visa_enrichment': return <CreditCard className="h-4 w-4 text-green-500" />;
      case 'blog_generation': return <FileText className="h-4 w-4 text-purple-500" />;
      case 'faq_generation': return <HelpCircle className="h-4 w-4 text-orange-500" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTaskColor = (type: string) => {
    switch (type) {
      case 'country_ctr': return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case 'visa_enrichment': return "bg-green-500/10 text-green-500 border-green-500/20";
      case 'blog_generation': return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case 'faq_generation': return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case 'country_guide': return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'bulk_ctr': return 'CTR Optimization';
      case 'default': return 'Content Creation';
      case 'visa_enrichment': return 'Visa Enrichment';
      case 'blog_generation': return 'Blog Generation';
      case 'faq_generation': return 'FAQ Generation';
      default: return mode;
    }
  };

  const tasks: AgentTask[] = [
    {
      id: 'ctr',
      name: 'CTR Optimization',
      mode: 'bulkCTR',
      description: 'Refresh existing country pages with CTR-optimized content',
      icon: <TrendingUp className="h-5 w-5" />,
      schedule: 'Every hour at :00',
      batchSize: taskSettings.ctr.batchSize,
      status: activeTask?.mode === 'bulk_ctr' ? 'running' : 'idle',
    },
    {
      id: 'create',
      name: 'Content Creation',
      mode: 'default',
      description: 'Create new country guide pages',
      icon: <Globe className="h-5 w-5" />,
      schedule: 'Every hour at :30',
      batchSize: taskSettings.create.batchSize,
      status: activeTask?.mode === 'default' ? 'running' : 'idle',
    },
    {
      id: 'visaEnrichment',
      name: 'Visa Data Enrichment',
      mode: 'visaEnrichment',
      description: 'Fill missing visa fees, processing times, and stay durations',
      icon: <CreditCard className="h-5 w-5" />,
      schedule: 'Every 2 hours at :15',
      batchSize: taskSettings.visaEnrichment.batchSize,
      status: activeTask?.mode === 'visa_enrichment' ? 'running' : 'idle',
    },
    {
      id: 'blogGeneration',
      name: 'Blog Generation',
      mode: 'blogGeneration',
      description: 'Auto-generate evergreen travel blog posts',
      icon: <FileText className="h-5 w-5" />,
      schedule: 'Daily at 3:00 AM',
      batchSize: taskSettings.blogGeneration.batchSize,
      status: activeTask?.mode === 'blog_generation' ? 'running' : 'idle',
    },
    {
      id: 'faqGeneration',
      name: 'FAQ Schema',
      mode: 'faqGeneration',
      description: 'Add FAQ structured data to country pages',
      icon: <HelpCircle className="h-5 w-5" />,
      schedule: 'Daily at 4:00 AM',
      batchSize: taskSettings.faqGeneration.batchSize,
      status: activeTask?.mode === 'faq_generation' ? 'running' : 'idle',
    },
  ];

  const completedToday = recentActivity?.filter(
    (log) => new Date(log.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000) && 
    log.action === 'content_agent_ctr_optimization'
  ).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bot className="h-8 w-8" />
            Agent Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time monitoring and control of automated content tasks
          </p>
        </div>
        <Button onClick={() => refetchActivity()} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Live Status Alert */}
      {activeTask && (
        <Alert className="bg-primary/10 border-primary/20 animate-pulse">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertTitle className="ml-2">Agent Active</AlertTitle>
          <AlertDescription className="ml-6">
            <span className="font-semibold">{getModeLabel(activeTask.mode)}</span>: Processing{' '}
            <span className="font-medium">{activeTask.entity}</span>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Countries</CardTitle>
            <Globe className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.countriesWithContent || 0}/{stats?.totalCountries || 0}</div>
            <Progress value={(stats?.countriesWithContent || 0) / (stats?.totalCountries || 1) * 100} className="mt-2 h-1" />
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.totalCountries && stats?.countriesWithContent ? stats.totalCountries - stats.countriesWithContent : 0} remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visa Records</CardTitle>
            <CreditCard className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.visaNeedingEnrichment || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Need enrichment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
            <FileText className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.blogPosts || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Published</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Updates</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedToday}</div>
            <p className="text-xs text-muted-foreground mt-1">Pages processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            {activeTask ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTask ? 'Running' : 'Idle'}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeTask ? 'Processing...' : 'Waiting for schedule'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="activity">Live Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <Card key={task.id} className={task.status === 'running' ? 'ring-2 ring-primary' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {task.icon}
                      <CardTitle className="text-base">{task.name}</CardTitle>
                    </div>
                    {task.status === 'running' && (
                      <Badge className="bg-primary/20 text-primary animate-pulse">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Running
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs">{task.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {task.schedule}
                    </span>
                    <Badge variant="outline">Batch: {task.batchSize}</Badge>
                  </div>
                  <Separator />
                  <Button 
                    size="sm" 
                    className="w-full" 
                    onClick={() => runTask(task.mode, task.batchSize)}
                    disabled={task.status === 'running'}
                  >
                    {task.status === 'running' ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 mr-2" />
                        Run Now
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Live Activity Feed
              </CardTitle>
              <CardDescription>Real-time updates from all agent tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {recentActivity?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bot className="w-12 h-12 mx-auto opacity-50 mb-2" />
                    <p>No recent activity</p>
                  </div>
                ) : (
                  recentActivity?.map((log) => {
                    const metadata = log.metadata as any;
                    return (
                      <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <div className="mt-0.5">
                          {getTaskIcon(log.entity_type || '')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className={getTaskColor(log.entity_type || '')}>
                              {log.entity_type?.replace(/_/g, ' ') || 'System'}
                            </Badge>
                            {metadata?.status && (
                              <Badge variant={metadata.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                                {metadata.status}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium mt-1 truncate">
                            {metadata?.country_name || metadata?.title || metadata?.from_country && metadata?.to_country ? `${metadata.from_country} → ${metadata.to_country}` : 'Agent task'}
                          </p>
                          {metadata?.fields_updated && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {metadata.fields_updated.map((field: string) => (
                                <Badge key={field} variant="secondary" className="text-xs">
                                  {field}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Agent Settings
              </CardTitle>
              <CardDescription>
                Configure batch sizes and enable/disable tasks. Note: Schedule changes require SQL updates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Cron Job Management</AlertTitle>
                <AlertDescription>
                  To modify schedules or add new tasks, run SQL commands in the{' '}
                  <a 
                    href="https://supabase.com/dashboard/project/awiytryceqehqapytfgn/sql/new" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    Supabase SQL Editor
                  </a>. The batch sizes below are for manual runs only.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {task.icon}
                      <div>
                        <p className="font-medium">{task.name}</p>
                        <p className="text-sm text-muted-foreground">{task.schedule}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`batch-${task.id}`} className="text-sm">Batch:</Label>
                        <Input
                          id={`batch-${task.id}`}
                          type="number"
                          className="w-16 h-8"
                          value={taskSettings[task.id as keyof typeof taskSettings]?.batchSize || task.batchSize}
                          onChange={(e) => setTaskSettings(prev => ({
                            ...prev,
                            [task.id]: { ...prev[task.id as keyof typeof taskSettings], batchSize: parseInt(e.target.value) || 1 }
                          }))}
                        />
                      </div>
                      <Switch
                        checked={taskSettings[task.id as keyof typeof taskSettings]?.enabled ?? true}
                        onCheckedChange={(checked) => setTaskSettings(prev => ({
                          ...prev,
                          [task.id]: { ...prev[task.id as keyof typeof taskSettings], enabled: checked }
                        }))}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Quick SQL Commands</h4>
                <p className="text-sm text-muted-foreground">Copy and run these in SQL Editor to manage cron jobs:</p>
                <div className="bg-muted p-3 rounded-lg text-xs font-mono overflow-x-auto">
                  <p className="text-muted-foreground">-- View all scheduled jobs:</p>
                  <p>SELECT * FROM cron.job;</p>
                  <br />
                  <p className="text-muted-foreground">-- Disable a job:</p>
                  <p>SELECT cron.unschedule('job-name');</p>
                  <br />
                  <p className="text-muted-foreground">-- View job run history:</p>
                  <p>SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentDashboard;
