import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  RefreshCw, Activity, CheckCircle, Clock, Loader2, 
  Play, Settings, Globe, FileText, HelpCircle, CreditCard,
  Bot, Zap, Calendar, TrendingUp, AlertCircle, Save, Timer,
  ScrollText, AlertTriangle, DollarSign, Coins, XCircle, ArrowUp, ArrowDown, ChevronDown,
  Mail, Leaf, Trophy
} from "lucide-react";
import { formatDistanceToNow, addHours, addDays, format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

interface TaskConfig {
  enabled: boolean;
  batchSize: number;
  schedule: string;
}

interface AgentSettings {
  ctr: TaskConfig;
  create: TaskConfig;
  visaEnrichment: TaskConfig;
  blogGeneration: TaskConfig;
  faqGeneration: TaskConfig;
  visaRequirementsContent: TaskConfig;
  evergreenContent: TaskConfig;
  dailyReport: TaskConfig;
}

const defaultSettings: AgentSettings = {
  ctr: { enabled: true, batchSize: 8, schedule: "0 * * * *" },
  create: { enabled: true, batchSize: 5, schedule: "30 * * * *" },
  visaEnrichment: { enabled: true, batchSize: 10, schedule: "15 */2 * * *" },
  blogGeneration: { enabled: true, batchSize: 3, schedule: "0 3 * * *" },
  faqGeneration: { enabled: true, batchSize: 5, schedule: "0 4 * * *" },
  visaRequirementsContent: { enabled: true, batchSize: 100, schedule: "*/10 * * * *" }, // AGGRESSIVE: 100 batch, every 10 min
  evergreenContent: { enabled: true, batchSize: 2, schedule: "0 6 * * *" },
  dailyReport: { enabled: true, batchSize: 1, schedule: "0 8 * * *" },
};

const AgentDashboard = () => {
  const queryClient = useQueryClient();
  const [activeTask, setActiveTask] = useState<{ mode: string; entity: string; type: string } | null>(null);
  const [localSettings, setLocalSettings] = useState<AgentSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));

  // Fetch saved settings from database
  const { data: savedSettings, isLoading: loadingSettings } = useQuery({
    queryKey: ["agent-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("setting_value")
        .eq("setting_key", "agent_task_settings")
        .maybeSingle();

      if (error) throw error;
      return data?.setting_value as unknown as AgentSettings | null;
    },
  });

  // Fetch circuit breaker status
  const { data: circuitBreakerStatus, refetch: refetchCircuitBreaker } = useQuery({
    queryKey: ["circuit-breaker-status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("setting_value")
        .eq("setting_key", "api_circuit_breaker")
        .maybeSingle();

      if (error) throw error;
      const state = data?.setting_value as any;
      
      if (state?.open_until && new Date(state.open_until) > new Date()) {
        const remainingMinutes = Math.ceil((new Date(state.open_until).getTime() - Date.now()) / 60000);
        return {
          isOpen: true,
          reason: state.reason,
          openedAt: state.opened_at,
          opensAt: state.open_until,
          remainingMinutes,
          errorCount: state.error_count
        };
      }
      
      return { isOpen: false };
    },
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Reset circuit breaker mutation
  const resetCircuitBreakerMutation = useMutation({
    mutationFn: async () => {
      const response = await supabase.functions.invoke('content-agent', {
        body: { resetCircuitBreaker: true }
      });
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["circuit-breaker-status"] });
      toast.success("Circuit breaker reset successfully! API calls will resume.");
    },
    onError: (error) => {
      toast.error("Failed to reset circuit breaker");
      console.error(error);
    },
  });

  // Update local settings when saved settings load
  useEffect(() => {
    if (savedSettings) {
      setLocalSettings(savedSettings);
    }
  }, [savedSettings]);

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: AgentSettings) => {
      const { data: existing } = await supabase
        .from("site_settings")
        .select("id")
        .eq("setting_key", "agent_task_settings")
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("site_settings")
          .update({ setting_value: settings as any })
          .eq("setting_key", "agent_task_settings");
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("site_settings")
          .insert({ setting_key: "agent_task_settings", setting_value: settings as any });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-settings"] });
      setHasChanges(false);
      toast.success("Settings saved successfully!");
    },
    onError: (error) => {
      toast.error("Failed to save settings");
      console.error(error);
    },
  });

  // Fetch recent activity logs - expanded action types
  const { data: recentActivity, refetch: refetchActivity } = useQuery({
    queryKey: ["agent-recent-activity"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_log")
        .select("*")
        .in("action", [
          "content_agent_ctr_optimization",
          "content_agent_status",
          "content_agent_update",
          "visa_enrichment_complete",
          "blog_generation_complete",
          "faq_generation_complete"
        ])
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 10000,
  });

  // Fetch stats
  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ["agent-stats"],
    queryFn: async () => {
      const [countriesRes, contentRes, visaRes, visaTotalRes, blogRes, faqRes, visaReqContentRes, milestonesRes] = await Promise.all([
        supabase.from("countries").select("id", { count: "exact", head: true }),
        supabase.from("content_pages").select("id", { count: "exact", head: true }).like("slug", "countries/%"),
        supabase.from("visa_requirements").select("id", { count: "exact", head: true }).or("fee_usd.is.null,processing_time_days.is.null"),
        supabase.from("visa_requirements").select("id", { count: "exact", head: true }),
        supabase.from("content_pages").select("id", { count: "exact", head: true }).like("slug", "blog/%"),
        supabase.from("content_pages").select("id, content", { count: "exact" }).like("slug", "countries/%").not("content", "ilike", "%FAQPage%"),
        supabase.from("content_pages").select("id", { count: "exact", head: true }).like("slug", "%-to-%-visa-requirements"),
        supabase.from("site_settings").select("setting_value").eq("setting_key", "visa_coverage_milestones").maybeSingle(),
      ]);

      // Calculate total possible combinations (n * (n-1) where n = total countries)
      const totalCountries = countriesRes.count || 0;
      const totalCombinations = totalCountries * (totalCountries - 1);
      const visaReqContentCount = visaReqContentRes.count || 0;
      
      // Get milestone data
      const milestoneData = milestonesRes.data?.setting_value as any;
      const reachedMilestones: number[] = milestoneData?.reached || [];
      const lastMilestone = milestoneData?.last_milestone || null;
      const lastMilestoneAt = milestoneData?.last_milestone_at || null;

      return {
        totalCountries,
        countriesWithContent: contentRes.count || 0,
        visaNeedingEnrichment: visaRes.count || 0,
        visaTotal: visaTotalRes.count || 0,
        blogPosts: blogRes.count || 0,
        pagesNeedingFAQ: faqRes.count || 0,
        visaReqContentCount,
        visaReqTotalCombinations: totalCombinations,
        visaReqRemaining: totalCombinations - visaReqContentCount,
        milestones: {
          reached: reachedMilestones,
          lastMilestone,
          lastMilestoneAt,
        },
      };
    },
    refetchInterval: 15000, // Faster refresh for aggressive mode
  });

  // Fetch real-time speed metrics from latest batch completions
  const { data: speedMetrics, refetch: refetchSpeedMetrics } = useQuery({
    queryKey: ["agent-speed-metrics"],
    queryFn: async () => {
      const now = new Date();
      const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
      
      // Get latest batch_complete events for speed data
      const { data: recentBatches } = await supabase
        .from("activity_log")
        .select("metadata, created_at")
        .eq("action", "content_agent_status")
        .eq("entity_type", "visa_requirements_content")
        .gte("created_at", lastHour.toISOString())
        .order("created_at", { ascending: false })
        .limit(20);

      const completedBatches = (recentBatches || []).filter(
        (b) => (b.metadata as any)?.status === 'batch_complete'
      );

      if (completedBatches.length === 0) {
        return {
          pagesPerHour: 0,
          estimatedHoursRemaining: 0,
          lastBatchSpeed: 0,
          batchesThisHour: 0,
          totalPagesThisHour: 0,
          isParallelProcessing: false,
        };
      }

      // Calculate aggregate metrics
      const totalPagesThisHour = completedBatches.reduce(
        (sum, b) => sum + ((b.metadata as any)?.generated || 0), 0
      );
      
      // Get speed from latest batch
      const latestBatch = completedBatches[0]?.metadata as any;
      const pagesPerHour = latestBatch?.pages_per_hour || 0;
      const estimatedHoursRemaining = latestBatch?.estimated_hours_remaining || 0;
      const isParallelProcessing = latestBatch?.parallel_processing || false;

      return {
        pagesPerHour,
        estimatedHoursRemaining,
        lastBatchSpeed: latestBatch?.generated || 0,
        batchesThisHour: completedBatches.length,
        totalPagesThisHour,
        isParallelProcessing,
        lastBatchDuration: latestBatch?.batch_duration_seconds || 0,
      };
    },
    refetchInterval: 10000, // Refresh every 10 seconds for real-time feel
  });

  // DeepSeek API pricing (per 1M tokens)
  const DEEPSEEK_INPUT_PRICE = 0.56;
  const DEEPSEEK_OUTPUT_PRICE = 1.68;
  const DEEPSEEK_BLENDED_PRICE = 1.46; // For historical data without breakdown

  const calculateCost = (inputTokens: number, outputTokens: number, totalTokens: number) => {
    if (inputTokens > 0 || outputTokens > 0) {
      return (inputTokens * DEEPSEEK_INPUT_PRICE / 1000000) + (outputTokens * DEEPSEEK_OUTPUT_PRICE / 1000000);
    }
    return totalTokens * DEEPSEEK_BLENDED_PRICE / 1000000;
  };

  // Fetch API usage stats with comparison data
  const { data: apiStats } = useQuery({
    queryKey: ["agent-api-stats"],
    queryFn: async () => {
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const previous24hStart = new Date(now.getTime() - 48 * 60 * 60 * 1000);
      const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const previous7dStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Current month boundaries
      const currentMonthStart = startOfMonth(now);
      const currentMonthEnd = endOfMonth(now);
      
      // Previous month boundaries
      const prevMonthDate = subMonths(now, 1);
      const prevMonthStart = startOfMonth(prevMonthDate);
      const prevMonthEnd = endOfMonth(prevMonthDate);

      // Today's updates - start of today
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const [stats24h, statsPrev24h, stats7d, statsPrev7d, stats30d, recentErrors, currentMonthStats, prevMonthStats, allTimeStats, todayUpdates] = await Promise.all([
        supabase
          .from("api_logs")
          .select("status, tokens_used, response_time_ms, input_tokens, output_tokens, task_type")
          .gte("created_at", last24h.toISOString()),
        supabase
          .from("api_logs")
          .select("status, tokens_used, input_tokens, output_tokens")
          .gte("created_at", previous24hStart.toISOString())
          .lt("created_at", last24h.toISOString()),
        supabase
          .from("api_logs")
          .select("status, tokens_used, input_tokens, output_tokens")
          .gte("created_at", last7d.toISOString()),
        supabase
          .from("api_logs")
          .select("status, tokens_used, input_tokens, output_tokens")
          .gte("created_at", previous7dStart.toISOString())
          .lt("created_at", last7d.toISOString()),
        supabase
          .from("api_logs")
          .select("status, tokens_used, input_tokens, output_tokens")
          .gte("created_at", last30d.toISOString()),
        supabase
          .from("api_logs")
          .select("*")
          .in("status", ["error", "timeout"])
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("api_logs")
          .select("status, tokens_used, input_tokens, output_tokens, task_type")
          .gte("created_at", currentMonthStart.toISOString())
          .lte("created_at", currentMonthEnd.toISOString()),
        supabase
          .from("api_logs")
          .select("status, tokens_used, input_tokens, output_tokens")
          .gte("created_at", prevMonthStart.toISOString())
          .lte("created_at", prevMonthEnd.toISOString()),
        supabase
          .from("api_logs")
          .select("status, tokens_used, input_tokens, output_tokens"),
        // Today's successful updates count
        supabase
          .from("api_logs")
          .select("id", { count: "exact", head: true })
          .eq("status", "success")
          .gte("created_at", todayStart.toISOString()),
      ]);

      const calc24h = stats24h.data || [];
      const calcPrev24h = statsPrev24h.data || [];
      const calc7d = stats7d.data || [];
      const calcPrev7d = statsPrev7d.data || [];
      const calc30d = stats30d.data || [];
      const calcCurrentMonth = currentMonthStats.data || [];
      const calcPrevMonth = prevMonthStats.data || [];
      const calcAllTime = allTimeStats.data || [];

      const tokens24h = calc24h.reduce((sum, log) => sum + (log.tokens_used || 0), 0);
      const tokens7d = calc7d.reduce((sum, log) => sum + (log.tokens_used || 0), 0);
      const tokens30d = calc30d.reduce((sum, log) => sum + (log.tokens_used || 0), 0);

      // Calculate costs
      const cost24h = calc24h.reduce((sum, log) => 
        sum + calculateCost(log.input_tokens || 0, log.output_tokens || 0, log.tokens_used || 0), 0);
      const costPrev24h = calcPrev24h.reduce((sum, log) => 
        sum + calculateCost(log.input_tokens || 0, log.output_tokens || 0, log.tokens_used || 0), 0);
      const cost7d = calc7d.reduce((sum, log) => 
        sum + calculateCost(log.input_tokens || 0, log.output_tokens || 0, log.tokens_used || 0), 0);
      const costPrev7d = calcPrev7d.reduce((sum, log) => 
        sum + calculateCost(log.input_tokens || 0, log.output_tokens || 0, log.tokens_used || 0), 0);
      const cost30d = calc30d.reduce((sum, log) => 
        sum + calculateCost(log.input_tokens || 0, log.output_tokens || 0, log.tokens_used || 0), 0);
      const costCurrentMonth = calcCurrentMonth.reduce((sum, log) => 
        sum + calculateCost(log.input_tokens || 0, log.output_tokens || 0, log.tokens_used || 0), 0);
      const costPrevMonth = calcPrevMonth.reduce((sum, log) => 
        sum + calculateCost(log.input_tokens || 0, log.output_tokens || 0, log.tokens_used || 0), 0);
      const costAllTime = calcAllTime.reduce((sum, log) => 
        sum + calculateCost(log.input_tokens || 0, log.output_tokens || 0, log.tokens_used || 0), 0);

      // Calculate cost by task type for smart projection
      const costByTaskType: Record<string, { cost: number; calls: number }> = {};
      calc24h.forEach(log => {
        const taskType = log.task_type || 'unknown';
        if (!costByTaskType[taskType]) {
          costByTaskType[taskType] = { cost: 0, calls: 0 };
        }
        costByTaskType[taskType].cost += calculateCost(log.input_tokens || 0, log.output_tokens || 0, log.tokens_used || 0);
        costByTaskType[taskType].calls += 1;
      });

      const calls24h = calc24h.length;
      const success24h = calc24h.filter(l => l.status === "success").length;
      const errors24h = calc24h.filter(l => l.status === "error" || l.status === "timeout").length;
      const avgResponseTime = calls24h > 0 
        ? Math.round(calc24h.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / calls24h)
        : 0;

      // Calculate percentage changes
      const change24h = costPrev24h > 0 ? ((cost24h - costPrev24h) / costPrev24h) * 100 : 0;
      const change7d = costPrev7d > 0 ? ((cost7d - costPrev7d) / costPrev7d) * 100 : 0;
      const changeMonth = costPrevMonth > 0 ? ((costCurrentMonth - costPrevMonth) / costPrevMonth) * 100 : 0;

      return {
        tokens24h,
        tokens7d,
        tokens30d,
        cost24h,
        costPrev24h,
        cost7d,
        costPrev7d,
        cost30d,
        costCurrentMonth,
        costPrevMonth,
        costAllTime,
        change24h,
        change7d,
        changeMonth,
        costByTaskType,
        calls24h,
        callsCurrentMonth: calcCurrentMonth.length,
        success24h,
        errors24h,
        avgResponseTime,
        successRate: calls24h > 0 ? Math.round((success24h / calls24h) * 100) : 100,
        recentErrors: recentErrors.data || [],
        currentMonthName: format(now, 'MMMM yyyy'),
        prevMonthName: format(prevMonthDate, 'MMMM yyyy'),
        todayUpdates: todayUpdates.count || 0,
      };
    },
    refetchInterval: 30000,
  });

  // Fetch historical month data
  const { data: historicalMonthData } = useQuery({
    queryKey: ["agent-historical-month", selectedMonth],
    queryFn: async () => {
      const [year, month] = selectedMonth.split('-').map(Number);
      const monthDate = new Date(year, month - 1, 1);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const { data } = await supabase
        .from("api_logs")
        .select("status, tokens_used, input_tokens, output_tokens, task_type")
        .gte("created_at", monthStart.toISOString())
        .lte("created_at", monthEnd.toISOString());

      const logs = data || [];
      const cost = logs.reduce((sum, log) => 
        sum + calculateCost(log.input_tokens || 0, log.output_tokens || 0, log.tokens_used || 0), 0);
      const tokens = logs.reduce((sum, log) => sum + (log.tokens_used || 0), 0);

      return {
        cost,
        tokens,
        calls: logs.length,
        monthName: format(monthDate, 'MMMM yyyy'),
      };
    },
  });

  // Calculate smart projection based on agent schedules
  const calculateSmartProjection = () => {
    const avgCostPerCall = apiStats?.calls24h ? (apiStats.cost24h / apiStats.calls24h) : 0.001;
    const taskCosts = apiStats?.costByTaskType || {};

    // Get average cost per task type from actual data, or use estimated defaults
    const getTaskAvgCost = (taskType: string, defaultCost: number) => {
      const taskData = taskCosts[taskType];
      return taskData && taskData.calls > 0 ? taskData.cost / taskData.calls : defaultCost;
    };

    const projections: { taskName: string; dailyCost: number; monthlyCost: number; runsPerDay: number }[] = [];

    // Visa Requirements Content: every 15 min = 96 runs/day (4x speedup)
    if (localSettings.visaRequirementsContent.enabled) {
      const avgCost = getTaskAvgCost('visa_requirements_content', 0.0013);
      const runsPerDay = 96; // 4x speedup: every 15 min instead of 30 min
      const dailyCost = localSettings.visaRequirementsContent.batchSize * runsPerDay * avgCost;
      projections.push({ taskName: 'Visa Req Content (4x)', dailyCost, monthlyCost: dailyCost * 30, runsPerDay });
    }

    // CTR Optimization: every hour = 24 runs/day
    if (localSettings.ctr.enabled) {
      const avgCost = getTaskAvgCost('ctr_optimization', 0.0015);
      const runsPerDay = 24;
      const dailyCost = localSettings.ctr.batchSize * runsPerDay * avgCost;
      projections.push({ taskName: 'CTR Optimization', dailyCost, monthlyCost: dailyCost * 30, runsPerDay });
    }

    // Content Creation: every hour = 24 runs/day
    if (localSettings.create.enabled) {
      const avgCost = getTaskAvgCost('content_creation', 0.0012);
      const runsPerDay = 24;
      const dailyCost = localSettings.create.batchSize * runsPerDay * avgCost;
      projections.push({ taskName: 'Content Creation', dailyCost, monthlyCost: dailyCost * 30, runsPerDay });
    }

    // Visa Enrichment: every 2 hours = 12 runs/day
    if (localSettings.visaEnrichment.enabled) {
      const avgCost = getTaskAvgCost('visa_enrichment', 0.0003);
      const runsPerDay = 12;
      const dailyCost = localSettings.visaEnrichment.batchSize * runsPerDay * avgCost;
      projections.push({ taskName: 'Visa Enrichment', dailyCost, monthlyCost: dailyCost * 30, runsPerDay });
    }

    // Blog Generation: daily = 1 run/day
    if (localSettings.blogGeneration.enabled) {
      const avgCost = getTaskAvgCost('blog_generation', 0.0016);
      const runsPerDay = 1;
      const dailyCost = localSettings.blogGeneration.batchSize * runsPerDay * avgCost;
      projections.push({ taskName: 'Blog Generation', dailyCost, monthlyCost: dailyCost * 30, runsPerDay });
    }

    // FAQ Generation: daily = 1 run/day
    if (localSettings.faqGeneration.enabled) {
      const avgCost = getTaskAvgCost('faq_generation', 0.0004);
      const runsPerDay = 1;
      const dailyCost = localSettings.faqGeneration.batchSize * runsPerDay * avgCost;
      projections.push({ taskName: 'FAQ Generation', dailyCost, monthlyCost: dailyCost * 30, runsPerDay });
    }

    const totalDaily = projections.reduce((sum, p) => sum + p.dailyCost, 0);
    const totalMonthly = projections.reduce((sum, p) => sum + p.monthlyCost, 0);
    const simpleProjection = (apiStats?.cost24h || 0) * 30;

    return {
      projections,
      totalDaily,
      totalMonthly,
      simpleProjection,
    };
  };

  const smartProjection = calculateSmartProjection();

  // Generate month options for selector (last 6 months)
  const monthOptions = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy'),
    };
  });

  // Cost change indicator component
  const CostChangeIndicator = ({ change, size = 'sm' }: { change: number; size?: 'sm' | 'lg' }) => {
    if (change === 0) return null;
    const isDecrease = change < 0;
    const absChange = Math.abs(change);
    const Icon = isDecrease ? ArrowDown : ArrowUp;
    const colorClass = isDecrease ? 'text-green-500' : 'text-red-500';
    const bgClass = isDecrease ? 'bg-green-500/10' : 'bg-red-500/10';
    
    return (
      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium ${bgClass} ${colorClass}`}>
        <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
        {absChange.toFixed(1)}%
      </span>
    );
  };

  // Fetch visa enrichment breakdown
  const { data: visaBreakdown } = useQuery({
    queryKey: ["visa-enrichment-breakdown"],
    queryFn: async () => {
      const [missingFee, missingProcessing, missingStay, missingNotes] = await Promise.all([
        supabase.from("visa_requirements").select("id", { count: "exact", head: true }).is("fee_usd", null),
        supabase.from("visa_requirements").select("id", { count: "exact", head: true }).is("processing_time_days", null),
        supabase.from("visa_requirements").select("id", { count: "exact", head: true }).is("max_stay_days", null),
        supabase.from("visa_requirements").select("id", { count: "exact", head: true }).is("notes", null),
      ]);

      return {
        missingFee: missingFee.count || 0,
        missingProcessing: missingProcessing.count || 0,
        missingStay: missingStay.count || 0,
        missingNotes: missingNotes.count || 0,
      };
    },
    refetchInterval: 60000,
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
            } else if (metadata?.status === 'batch_complete') {
              // Batch completed - refresh speed metrics
              refetchSpeedMetrics();
              refetchStats();
              refetchActivity();
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
              refetchStats();
            }
          } else if (action === 'content_agent_ctr_optimization') {
            refetchActivity();
            refetchStats();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchActivity, refetchStats, refetchSpeedMetrics]);

  const updateSetting = (taskId: keyof AgentSettings, field: keyof TaskConfig, value: boolean | number | string) => {
    setLocalSettings(prev => ({
      ...prev,
      [taskId]: { ...prev[taskId], [field]: value }
    }));
    setHasChanges(true);
  };

  const runTask = async (mode: string, batchSize: number) => {
    try {
      toast.info(`Starting ${mode} task...`);
      
      // Handle daily report separately
      if (mode === 'dailyReport') {
        const { data, error } = await supabase.functions.invoke("daily-agent-report", {});
        if (error) throw error;
        toast.success(`Daily report sent to ${data.recipient}!`);
        refetchActivity();
        return;
      }
      
      const body: any = { batchSize };
      if (mode === 'bulkCTR') body.bulkCTR = true;
      else if (mode === 'visaEnrichment') body.visaEnrichment = true;
      else if (mode === 'blogGeneration') body.blogGeneration = true;
      else if (mode === 'faqGeneration') body.faqGeneration = true;
      else if (mode === 'visaRequirementsContent') body.visaRequirementsContent = true;
      else if (mode === 'evergreenContent') body.evergreenContent = true;

      const { data, error } = await supabase.functions.invoke("content-agent", { body });

      if (error) throw error;
      toast.success(`Task completed! ${data.updates_made} updates made.`);
      refetchActivity();
      refetchStats();
    } catch (error) {
      console.error("Error running task:", error);
      toast.error("Failed to run task");
    }
  };

  // Calculate estimated completion times
  const calculateCompletion = () => {
    if (!stats) return null;

    const countriesRemaining = stats.totalCountries - stats.countriesWithContent;
    const visaRemaining = stats.visaNeedingEnrichment;
    const faqRemaining = stats.pagesNeedingFAQ;

    // Calculate hours to complete based on batch sizes and schedules
    const createBatch = localSettings.create.batchSize;
    const createPerDay = createBatch * 24; // hourly
    const countryDays = countriesRemaining > 0 ? Math.ceil(countriesRemaining / createPerDay) : 0;

    const visaBatch = localSettings.visaEnrichment.batchSize;
    const visaPerDay = visaBatch * 12; // every 2 hours
    const visaDays = visaRemaining > 0 ? Math.ceil(visaRemaining / visaPerDay) : 0;

    const faqBatch = localSettings.faqGeneration.batchSize;
    const faqPerDay = faqBatch; // daily
    const faqDays = faqRemaining > 0 ? Math.ceil(faqRemaining / faqPerDay) : 0;

    return {
      countries: { remaining: countriesRemaining, days: countryDays, eta: addDays(new Date(), countryDays) },
      visa: { remaining: visaRemaining, days: visaDays, eta: addDays(new Date(), visaDays) },
      faq: { remaining: faqRemaining, days: faqDays, eta: addDays(new Date(), faqDays) },
    };
  };

  const estimates = calculateCompletion();

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

  // Calculate visa content completion estimate
  const visaCompletionEstimate = () => {
    if (!stats) return null;
    const remaining = stats.visaReqRemaining;
    const batchSize = localSettings.visaRequirementsContent.batchSize;
    const runsPerDay = 96; // every 15 min
    const pagesPerDay = batchSize * runsPerDay;
    const daysToComplete = Math.ceil(remaining / pagesPerDay);
    const coveragePercent = stats.visaReqTotalCombinations > 0 
      ? ((stats.visaReqContentCount / stats.visaReqTotalCombinations) * 100).toFixed(1)
      : 0;
    return { daysToComplete, pagesPerDay, coveragePercent };
  };

  const visaEstimate = visaCompletionEstimate();

  const tasks = [
    {
      id: 'visaRequirementsContent' as const,
      name: 'Visa Requirements Content',
      mode: 'visaRequirementsContent',
      description: `Priority Mode: ${localSettings.visaRequirementsContent.batchSize} pages every 15 min (~${visaEstimate?.pagesPerDay || 4800}/day)`,
      icon: <Globe className="h-5 w-5 text-emerald-500" />,
      scheduleLabel: 'Every 15 min (4x speedup)',
      remaining: stats?.visaReqRemaining,
      total: stats?.visaReqTotalCombinations,
      completed: stats?.visaReqContentCount,
      coverage: visaEstimate?.coveragePercent,
      daysToComplete: visaEstimate?.daysToComplete,
      status: activeTask?.mode === 'visa_requirements_content' ? 'running' : 'idle',
      priority: true,
    },
    {
      id: 'ctr' as const,
      name: 'CTR Optimization',
      mode: 'bulkCTR',
      description: 'Refresh existing country pages with CTR-optimized content',
      icon: <TrendingUp className="h-5 w-5 text-blue-500" />,
      scheduleLabel: 'Every hour at :00',
      status: activeTask?.mode === 'bulk_ctr' ? 'running' : 'idle',
    },
    {
      id: 'create' as const,
      name: 'Content Creation',
      mode: 'default',
      description: 'Create new country guide pages',
      icon: <Globe className="h-5 w-5 text-cyan-500" />,
      scheduleLabel: 'Every hour at :30',
      remaining: estimates?.countries.remaining,
      eta: estimates?.countries.days,
      status: activeTask?.mode === 'default' ? 'running' : 'idle',
    },
    {
      id: 'visaEnrichment' as const,
      name: 'Visa Data Enrichment',
      mode: 'visaEnrichment',
      description: 'Fill missing visa fees, processing times, and stay durations',
      icon: <CreditCard className="h-5 w-5 text-green-500" />,
      scheduleLabel: 'Every 2 hours at :15',
      remaining: estimates?.visa.remaining,
      eta: estimates?.visa.days,
      status: activeTask?.mode === 'visa_enrichment' ? 'running' : 'idle',
    },
    {
      id: 'blogGeneration' as const,
      name: 'Blog Generation',
      mode: 'blogGeneration',
      description: 'Auto-generate travel blog posts with author attribution',
      icon: <FileText className="h-5 w-5 text-purple-500" />,
      scheduleLabel: 'Daily at 3:00 AM',
      status: activeTask?.mode === 'blog_generation' ? 'running' : 'idle',
    },
    {
      id: 'evergreenContent' as const,
      name: 'Evergreen SEO Content',
      mode: 'evergreenContent',
      description: 'Create high-value evergreen pages (Schengen Guide, US Visa, etc.)',
      icon: <Leaf className="h-5 w-5 text-green-600" />,
      scheduleLabel: 'Daily at 6:00 AM',
      status: activeTask?.mode === 'evergreen_content' ? 'running' : 'idle',
    },
    {
      id: 'faqGeneration' as const,
      name: 'FAQ Schema',
      mode: 'faqGeneration',
      description: 'Add FAQ structured data to country pages',
      icon: <HelpCircle className="h-5 w-5 text-orange-500" />,
      scheduleLabel: 'Daily at 4:00 AM',
      remaining: estimates?.faq.remaining,
      eta: estimates?.faq.days,
      status: activeTask?.mode === 'faq_generation' ? 'running' : 'idle',
    },
    {
      id: 'dailyReport' as const,
      name: 'Daily Progress Report',
      mode: 'dailyReport',
      description: 'Send daily email report with task progress and costs',
      icon: <Mail className="h-5 w-5 text-indigo-500" />,
      scheduleLabel: 'Daily at 8:00 AM UTC',
      status: 'idle',
      isReportTask: true,
    },
  ];

  // Note: Today's updates now comes from apiStats.todayUpdates (from api_logs table)

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
        <div className="flex gap-2">
          {hasChanges && (
            <Button onClick={() => saveSettingsMutation.mutate(localSettings)} disabled={saveSettingsMutation.isPending}>
              {saveSettingsMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          )}
          <Button onClick={() => { refetchActivity(); refetchStats(); }} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Circuit Breaker Alert */}
      {circuitBreakerStatus?.isOpen && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="ml-2 flex items-center gap-2">
            API Calls Paused
            <Badge variant="outline" className="bg-red-500/20 text-red-600 border-red-500/30">
              Circuit Breaker Open
            </Badge>
          </AlertTitle>
          <AlertDescription className="ml-6">
            <p className="mb-2">
              <strong>Reason:</strong> {circuitBreakerStatus.reason}
            </p>
            <p className="mb-2 text-sm">
              Opened: {circuitBreakerStatus.openedAt ? formatDistanceToNow(new Date(circuitBreakerStatus.openedAt), { addSuffix: true }) : 'Unknown'} 
              {' • '}Auto-resets in <strong>{circuitBreakerStatus.remainingMinutes} minutes</strong>
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              This prevents wasted API calls when the DeepSeek balance is exhausted. 
              Add balance to your DeepSeek account and click "Reset" to resume.
            </p>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => resetCircuitBreakerMutation.mutate()}
              disabled={resetCircuitBreakerMutation.isPending}
              className="border-red-500/30 hover:bg-red-500/10"
            >
              {resetCircuitBreakerMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Reset Circuit Breaker
            </Button>
          </AlertDescription>
        </Alert>
      )}

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

      {/* Real-Time Speed Metrics - Aggressive Mode Dashboard */}
      {speedMetrics && (speedMetrics.pagesPerHour > 0 || speedMetrics.totalPagesThisHour > 0) && (
        <Card className="bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-blue-500/10 border-emerald-500/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-emerald-500" />
                Aggressive Mode Active
                {speedMetrics.isParallelProcessing && (
                  <Badge className="ml-2 bg-cyan-500/20 text-cyan-600 border-cyan-500/30">
                    5x Parallel
                  </Badge>
                )}
              </CardTitle>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 animate-pulse">
                <Activity className="h-3 w-3 mr-1" />
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-3 bg-background/50 rounded-lg border border-emerald-500/20">
                <p className="text-xs text-muted-foreground uppercase">Speed</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {speedMetrics.pagesPerHour.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">pages/hour</p>
              </div>
              <div className="p-3 bg-background/50 rounded-lg border border-cyan-500/20">
                <p className="text-xs text-muted-foreground uppercase">ETA</p>
                <p className="text-2xl font-bold text-cyan-600">
                  {speedMetrics.estimatedHoursRemaining > 24 
                    ? `${(speedMetrics.estimatedHoursRemaining / 24).toFixed(1)}d`
                    : `${speedMetrics.estimatedHoursRemaining.toFixed(1)}h`
                  }
                </p>
                <p className="text-xs text-muted-foreground">to complete</p>
              </div>
              <div className="p-3 bg-background/50 rounded-lg border border-blue-500/20">
                <p className="text-xs text-muted-foreground uppercase">This Hour</p>
                <p className="text-2xl font-bold text-blue-600">
                  {speedMetrics.totalPagesThisHour}
                </p>
                <p className="text-xs text-muted-foreground">pages generated</p>
              </div>
              <div className="p-3 bg-background/50 rounded-lg border border-purple-500/20">
                <p className="text-xs text-muted-foreground uppercase">Batches</p>
                <p className="text-2xl font-bold text-purple-600">
                  {speedMetrics.batchesThisHour}
                </p>
                <p className="text-xs text-muted-foreground">this hour</p>
              </div>
              <div className="p-3 bg-background/50 rounded-lg border border-amber-500/20">
                <p className="text-xs text-muted-foreground uppercase">Last Batch</p>
                <p className="text-2xl font-bold text-amber-600">
                  {speedMetrics.lastBatchDuration || 0}s
                </p>
                <p className="text-xs text-muted-foreground">{speedMetrics.lastBatchSpeed} pages</p>
              </div>
            </div>
            
            {/* Progress towards completion */}
            {stats && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">
                    Progress: {stats.visaReqContentCount.toLocaleString()} / {stats.visaReqTotalCombinations.toLocaleString()} pages
                  </span>
                  <span className="font-medium text-emerald-600">
                    {((stats.visaReqContentCount / stats.visaReqTotalCombinations) * 100).toFixed(2)}%
                  </span>
                </div>
                <Progress 
                  value={(stats.visaReqContentCount / stats.visaReqTotalCombinations) * 100} 
                  className="h-2"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* API Usage Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls (24h)</CardTitle>
            <ScrollText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiStats?.calls24h || 0}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                {apiStats?.successRate || 100}% success
              </Badge>
              {(apiStats?.errors24h || 0) > 0 && (
                <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600 border-red-500/20">
                  {apiStats?.errors24h} errors
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens Used</CardTitle>
            <Coins className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(apiStats?.tokens24h || 0).toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">
              7d: {(apiStats?.tokens7d || 0).toLocaleString()} • 30d: {(apiStats?.tokens30d || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost (24h)</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">${(apiStats?.cost24h || 0).toFixed(4)}</span>
              <CostChangeIndicator change={apiStats?.change24h || 0} />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              vs yesterday: ${(apiStats?.costPrev24h || 0).toFixed(4)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Updates</CardTitle>
            <Zap className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiStats?.todayUpdates || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Successful API calls today</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Cost Tracking Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost (7d)</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">${(apiStats?.cost7d || 0).toFixed(2)}</span>
              <CostChangeIndicator change={apiStats?.change7d || 0} />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              vs prev 7d: ${(apiStats?.costPrev7d || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{apiStats?.currentMonthName || 'Current Month'}</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">${(apiStats?.costCurrentMonth || 0).toFixed(2)}</span>
              <CostChangeIndicator change={apiStats?.changeMonth || 0} />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {apiStats?.callsCurrentMonth || 0} API calls
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{apiStats?.prevMonthName || 'Previous Month'}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(apiStats?.costPrevMonth || 0).toFixed(2)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Baseline for comparison
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total All-Time</CardTitle>
            <Coins className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(apiStats?.costAllTime || 0).toFixed(2)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Since tracking started
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Smart Projection & Historical Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Smart Projection Card */}
        <Card className="bg-gradient-to-br from-cyan-500/5 to-cyan-500/10 border-cyan-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-cyan-500" />
              Smart Monthly Projection
            </CardTitle>
            <CardDescription>Based on agent batch schedules & settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold">${smartProjection.totalMonthly.toFixed(2)}</span>
              <span className="text-sm text-muted-foreground">
                (Simple: ${smartProjection.simpleProjection.toFixed(2)})
              </span>
            </div>
            <div className="space-y-2">
              {smartProjection.projections.map((proj) => {
                const percentage = smartProjection.totalMonthly > 0 
                  ? (proj.monthlyCost / smartProjection.totalMonthly) * 100 
                  : 0;
                return (
                  <div key={proj.taskName} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{proj.taskName}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">${proj.monthlyCost.toFixed(2)}</span>
                      <Badge variant="outline" className="text-xs">
                        {percentage.toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
            <Separator className="my-3" />
            <div className="text-xs text-muted-foreground">
              Daily estimate: ${smartProjection.totalDaily.toFixed(4)}
            </div>
          </CardContent>
        </Card>

        {/* Historical Month Selector */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Historical Costs
              </CardTitle>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold">${(historicalMonthData?.cost || 0).toFixed(2)}</span>
                <span className="text-sm text-muted-foreground">{historicalMonthData?.monthName}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">API Calls</p>
                  <p className="text-xl font-bold">{(historicalMonthData?.calls || 0).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Tokens Used</p>
                  <p className="text-xl font-bold">{(historicalMonthData?.tokens || 0).toLocaleString()}</p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Avg/day: ${historicalMonthData?.calls ? (historicalMonthData.cost / 30).toFixed(4) : '0.0000'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiStats?.avgResponseTime || 0}ms</div>
            <p className="text-xs text-muted-foreground mt-1">Last 24 hours average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Cost/Call</CardTitle>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${apiStats?.calls24h ? ((apiStats?.cost24h || 0) / apiStats.calls24h).toFixed(5) : '0.00000'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per API request</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">30d Running Cost</CardTitle>
            <TrendingUp className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(apiStats?.cost30d || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Rolling 30-day total</p>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert - NEW */}
      {apiStats?.recentErrors && apiStats.recentErrors.length > 0 && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Recent API Errors ({apiStats.recentErrors.length})</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-1">
              {apiStats.recentErrors.slice(0, 3).map((error: any) => (
                <div key={error.id} className="text-sm flex items-center justify-between">
                  <span className="truncate max-w-md">{error.entity_name || error.task_type}: {error.error_message?.slice(0, 50)}...</span>
                  <span className="text-xs opacity-70">{formatDistanceToNow(new Date(error.created_at), { addSuffix: true })}</span>
                </div>
              ))}
            </div>
            <Button variant="link" className="p-0 h-auto mt-2 text-red-600" asChild>
              <Link to="/admin/api-logs">View all API logs →</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Estimated Completion Times */}
      {estimates && (estimates.countries.remaining > 0 || estimates.visa.remaining > 0 || estimates.faq.remaining > 0) && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Estimated Completion Times
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {estimates.countries.remaining > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                  <Globe className="h-8 w-8 text-cyan-500" />
                  <div>
                    <p className="font-medium">Country Guides</p>
                    <p className="text-sm text-muted-foreground">{estimates.countries.remaining} remaining</p>
                    <p className="text-xs text-primary font-medium">~{estimates.countries.days} days to complete</p>
                  </div>
                </div>
              )}
              {estimates.visa.remaining > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                  <CreditCard className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="font-medium">Visa Data</p>
                    <p className="text-sm text-muted-foreground">{estimates.visa.remaining} remaining</p>
                    <p className="text-xs text-primary font-medium">~{estimates.visa.days} days to complete</p>
                  </div>
                </div>
              )}
              {estimates.faq.remaining > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                  <HelpCircle className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="font-medium">FAQ Schemas</p>
                    <p className="text-sm text-muted-foreground">{estimates.faq.remaining} remaining</p>
                    <p className="text-xs text-primary font-medium">~{estimates.faq.days} days to complete</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Milestone Tracker */}
      {visaEstimate && (
        <Card className="bg-gradient-to-r from-emerald-500/5 to-emerald-500/10 border-emerald-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-emerald-500" />
              Visa Coverage Milestones
            </CardTitle>
            <CardDescription>Email alerts sent at each milestone</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Current Coverage */}
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-emerald-600">{visaEstimate.coveragePercent}%</span>
                <span className="text-sm text-muted-foreground">
                  {stats?.visaReqContentCount?.toLocaleString()} / {stats?.visaReqTotalCombinations?.toLocaleString()} pages
                </span>
              </div>

              {/* Milestone Progress Bar */}
              <div className="relative">
                <Progress value={Number(visaEstimate.coveragePercent)} className="h-3" />
                {/* Milestone markers */}
                <div className="absolute top-0 left-0 w-full h-3 flex">
                  {[25, 50, 75].map(milestone => (
                    <div 
                      key={milestone}
                      className="absolute h-full w-0.5 bg-background"
                      style={{ left: `${milestone}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Milestone Labels */}
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">0%</span>
                {[25, 50, 75, 100].map(milestone => {
                  const isReached = stats?.milestones?.reached?.includes(milestone) || Number(visaEstimate.coveragePercent) >= milestone;
                  const isCurrent = milestone === 100 
                    ? Number(visaEstimate.coveragePercent) >= 75 
                    : Number(visaEstimate.coveragePercent) >= milestone - 25 && Number(visaEstimate.coveragePercent) < milestone;
                  return (
                    <div key={milestone} className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mb-1 ${
                        isReached 
                          ? 'bg-emerald-500 text-white' 
                          : isCurrent 
                            ? 'bg-emerald-500/20 text-emerald-600 ring-2 ring-emerald-500/50' 
                            : 'bg-muted text-muted-foreground'
                      }`}>
                        {isReached ? '✓' : milestone === 100 ? '🏆' : ''}
                      </div>
                      <span className={isReached ? 'text-emerald-600 font-medium' : 'text-muted-foreground'}>
                        {milestone}%
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Last Milestone Info */}
              {stats?.milestones?.lastMilestone && (
                <div className="flex items-center gap-2 text-sm bg-emerald-500/10 p-2 rounded-lg">
                  <Trophy className="h-4 w-4 text-emerald-500" />
                  <span>Last milestone: <strong>{stats.milestones.lastMilestone}%</strong></span>
                  {stats.milestones.lastMilestoneAt && (
                    <span className="text-muted-foreground">
                      ({formatDistanceToNow(new Date(stats.milestones.lastMilestoneAt), { addSuffix: true })})
                    </span>
                  )}
                </div>
              )}

              {/* Next Milestone */}
              {Number(visaEstimate.coveragePercent) < 100 && (
                <div className="text-sm text-muted-foreground">
                  Next milestone: <strong>{
                    [25, 50, 75, 100].find(m => m > Number(visaEstimate.coveragePercent)) || 100
                  }%</strong>
                  {' '}- Email will be sent automatically when reached
                </div>
              )}
            </div>
          </CardContent>
        </Card>
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
            <div className="text-2xl font-bold">{(stats?.visaTotal || 0) - (stats?.visaNeedingEnrichment || 0)}/{stats?.visaTotal || 0}</div>
            <Progress value={((stats?.visaTotal || 0) - (stats?.visaNeedingEnrichment || 0)) / (stats?.visaTotal || 1) * 100} className="mt-2 h-1" />
            <p className="text-xs text-muted-foreground mt-1">{stats?.visaNeedingEnrichment || 0} need enrichment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
            <FileText className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.blogPosts || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Published articles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">FAQ Coverage</CardTitle>
            <HelpCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.countriesWithContent || 0) - (stats?.pagesNeedingFAQ || 0)}/{stats?.countriesWithContent || 0}</div>
            <Progress value={((stats?.countriesWithContent || 0) - (stats?.pagesNeedingFAQ || 0)) / (stats?.countriesWithContent || 1) * 100} className="mt-2 h-1" />
            <p className="text-xs text-muted-foreground mt-1">{stats?.pagesNeedingFAQ || 0} pages need FAQ</p>
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

      {/* Visa Enrichment Breakdown - NEW */}
      {visaBreakdown && (visaBreakdown.missingFee > 0 || visaBreakdown.missingProcessing > 0 || visaBreakdown.missingStay > 0) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-green-500" />
              Visa Data Enrichment Breakdown
            </CardTitle>
            <CardDescription>Missing fields that need to be populated</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">Fee (USD)</span>
                </div>
                <Badge variant="secondary">{visaBreakdown.missingFee}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Processing Time</span>
                </div>
                <Badge variant="secondary">{visaBreakdown.missingProcessing}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Max Stay Days</span>
                </div>
                <Badge variant="secondary">{visaBreakdown.missingStay}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-cyan-500" />
                  <span className="text-sm">Notes</span>
                </div>
                <Badge variant="secondary">{visaBreakdown.missingNotes}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="activity">Live Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => {
              const settings = localSettings[task.id];
              const isRunning = task.status === 'running';
              
              return (
                <Card key={task.id} className={`${isRunning ? 'ring-2 ring-primary' : ''} ${!settings.enabled ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {task.icon}
                        <CardTitle className="text-base">{task.name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        {!settings.enabled && (
                          <Badge variant="secondary" className="text-xs">Disabled</Badge>
                        )}
                        {isRunning && (
                          <Badge className="bg-primary/20 text-primary animate-pulse">
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Running
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription className="text-xs">{task.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {task.scheduleLabel}
                      </span>
                      <Badge variant="outline">Batch: {settings.batchSize}</Badge>
                    </div>
                    
                    {task.remaining !== undefined && task.remaining > 0 && (
                      <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                        <span className="font-medium">{task.remaining}</span> remaining
                        {task.eta !== undefined && <span className="ml-1">• ~{task.eta}d to complete</span>}
                      </div>
                    )}
                    
                    <Separator />
                    <Button 
                      size="sm" 
                      className="w-full" 
                      onClick={() => runTask(task.mode, settings.batchSize)}
                      disabled={isRunning || !settings.enabled}
                    >
                      {isRunning ? (
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
              );
            })}
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
                            {metadata?.country_name || metadata?.title || (metadata?.from_country && metadata?.to_country ? `${metadata.from_country} → ${metadata.to_country}` : 'Agent task')}
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Agent Settings
                  </CardTitle>
                  <CardDescription>
                    Configure task settings. Changes are saved to database and used by the agent.
                  </CardDescription>
                </div>
                {hasChanges && (
                  <Button onClick={() => saveSettingsMutation.mutate(localSettings)} disabled={saveSettingsMutation.isPending}>
                    {saveSettingsMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {loadingSettings ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {tasks.map((task) => {
                      const settings = localSettings[task.id];
                      return (
                        <div key={task.id} className="flex items-center justify-between p-4 rounded-lg border">
                          <div className="flex items-center gap-3">
                            {task.icon}
                            <div>
                              <p className="font-medium">{task.name}</p>
                              <p className="text-sm text-muted-foreground">{task.scheduleLabel}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`batch-${task.id}`} className="text-sm text-muted-foreground">Batch:</Label>
                              <Input
                                id={`batch-${task.id}`}
                                type="number"
                                className="w-16 h-8"
                                value={settings.batchSize}
                                onChange={(e) => updateSetting(task.id, 'batchSize', parseInt(e.target.value) || 1)}
                                min={1}
                                max={50}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`enabled-${task.id}`} className="text-sm text-muted-foreground">Enabled:</Label>
                              <Switch
                                id={`enabled-${task.id}`}
                                checked={settings.enabled}
                                onCheckedChange={(checked) => updateSetting(task.id, 'enabled', checked)}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Separator />

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Cron Job Management</AlertTitle>
                    <AlertDescription className="space-y-2">
                      <p>Schedule changes require SQL updates in the Supabase SQL Editor.</p>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href="https://supabase.com/dashboard/project/awiytryceqehqapytfgn/sql/new" target="_blank" rel="noopener noreferrer">
                            Open SQL Editor
                          </a>
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <h4 className="font-medium">Quick SQL Commands</h4>
                    <div className="bg-muted p-3 rounded-lg text-xs font-mono overflow-x-auto space-y-1">
                      <p className="text-muted-foreground">-- View all scheduled jobs:</p>
                      <p>SELECT * FROM cron.job;</p>
                      <p className="text-muted-foreground mt-2">-- View recent job runs:</p>
                      <p>SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentDashboard;
