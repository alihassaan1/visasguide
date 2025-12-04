import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Search, AlertCircle, CheckCircle, Clock, Filter, DollarSign } from "lucide-react";
import { format } from "date-fns";

// DeepSeek API pricing (per 1M tokens)
const DEEPSEEK_INPUT_PRICE = 0.56;  // $0.56 per 1M input tokens
const DEEPSEEK_OUTPUT_PRICE = 1.68; // $1.68 per 1M output tokens (cache miss)
const DEEPSEEK_BLENDED_PRICE = 1.46; // Weighted average for legacy data (~20% input, 80% output)

// OpenAI pricing (gpt-4o-mini)
const OPENAI_INPUT_PRICE = 0.15;   // $0.15 per 1M input tokens
const OPENAI_OUTPUT_PRICE = 0.60;  // $0.60 per 1M output tokens

// Calculate cost for a single log entry
const calculateCost = (log: any): number => {
  const isDeepSeek = log.api_provider === 'deepseek';
  const inputPrice = isDeepSeek ? DEEPSEEK_INPUT_PRICE : OPENAI_INPUT_PRICE;
  const outputPrice = isDeepSeek ? DEEPSEEK_OUTPUT_PRICE : OPENAI_OUTPUT_PRICE;
  const blendedPrice = isDeepSeek ? DEEPSEEK_BLENDED_PRICE : (OPENAI_INPUT_PRICE * 0.2 + OPENAI_OUTPUT_PRICE * 0.8);
  
  // If we have input/output breakdown, use precise calculation
  if (log.input_tokens && log.output_tokens) {
    return (log.input_tokens * inputPrice / 1000000) + (log.output_tokens * outputPrice / 1000000);
  }
  
  // Fall back to blended estimate for legacy data
  if (log.tokens_used) {
    return log.tokens_used * blendedPrice / 1000000;
  }
  
  return 0;
};

// Format cost for display
const formatCost = (cost: number): string => {
  if (cost === 0) return '-';
  if (cost < 0.0001) return '<$0.0001';
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  return `$${cost.toFixed(3)}`;
};

const APILogs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [taskFilter, setTaskFilter] = useState<string>("all");
  const [limit, setLimit] = useState(100);

  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ['api-logs', statusFilter, taskFilter, limit],
    queryFn: async () => {
      let query = supabase
        .from('api_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (taskFilter !== 'all') {
        query = query.eq('task_type', taskFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    refetchInterval: 10000,
  });

  const { data: stats } = useQuery({
    queryKey: ['api-logs-stats'],
    queryFn: async () => {
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      
      // Get counts
      const [total, success, errors, timeouts] = await Promise.all([
        supabase.from('api_logs').select('id', { count: 'exact', head: true }).gte('created_at', last24h),
        supabase.from('api_logs').select('id', { count: 'exact', head: true }).eq('status', 'success').gte('created_at', last24h),
        supabase.from('api_logs').select('id', { count: 'exact', head: true }).eq('status', 'error').gte('created_at', last24h),
        supabase.from('api_logs').select('id', { count: 'exact', head: true }).eq('status', 'timeout').gte('created_at', last24h),
      ]);

      // Get token data for cost calculation
      const { data: tokenData } = await supabase
        .from('api_logs')
        .select('tokens_used, input_tokens, output_tokens, api_provider')
        .gte('created_at', last24h)
        .eq('status', 'success');

      let totalCost = 0;
      let totalTokens = 0;
      let totalInputTokens = 0;
      let totalOutputTokens = 0;

      tokenData?.forEach(log => {
        totalCost += calculateCost(log);
        totalTokens += log.tokens_used || 0;
        totalInputTokens += log.input_tokens || 0;
        totalOutputTokens += log.output_tokens || 0;
      });

      return {
        total: total.count || 0,
        success: success.count || 0,
        errors: errors.count || 0,
        timeouts: timeouts.count || 0,
        totalCost,
        totalTokens,
        totalInputTokens,
        totalOutputTokens,
        avgCostPerCall: (success.count || 0) > 0 ? totalCost / (success.count || 1) : 0,
      };
    },
  });

  const filteredLogs = logs?.filter(log => 
    !searchTerm || 
    log.entity_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.task_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.error_message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Success</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" /> Error</Badge>;
      case 'timeout':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" /> Timeout</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTaskBadge = (taskType: string) => {
    const colors: Record<string, string> = {
      'bulkCTR': 'bg-blue-500',
      'visa_enrichment': 'bg-purple-500',
      'blog_generation': 'bg-green-500',
      'faq_generation': 'bg-orange-500',
      'default': 'bg-gray-500',
    };
    return <Badge className={colors[taskType] || 'bg-gray-500'}>{taskType}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">API Logs</h1>
          <p className="text-muted-foreground">Monitor all API calls, tokens, and costs</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards - Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.total || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-500">Success</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-500">{stats?.success || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-500">Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500">{stats?.errors || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-500">Timeouts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-500">{stats?.timeouts || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards - Row 2: Cost & Tokens */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Est. Cost (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">
              ${(stats?.totalCost || 0).toFixed(4)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Cost/Call</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCost(stats?.avgCostPerCall || 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-500">Input Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-500">
              {((stats?.totalInputTokens || 0) / 1000).toFixed(1)}K
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-500">Output Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-500">
              {((stats?.totalOutputTokens || 0) / 1000).toFixed(1)}K
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="timeout">Timeout</SelectItem>
              </SelectContent>
            </Select>
            <Select value={taskFilter} onValueChange={setTaskFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Task Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="bulkCTR">CTR Optimization</SelectItem>
                <SelectItem value="visa_enrichment">Visa Enrichment</SelectItem>
                <SelectItem value="blog_generation">Blog Generation</SelectItem>
                <SelectItem value="faq_generation">FAQ Generation</SelectItem>
              </SelectContent>
            </Select>
            <Select value={limit.toString()} onValueChange={(v) => setLimit(parseInt(v))}>
              <SelectTrigger className="w-full sm:w-[120px]">
                <SelectValue placeholder="Limit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50">50 rows</SelectItem>
                <SelectItem value="100">100 rows</SelectItem>
                <SelectItem value="250">250 rows</SelectItem>
                <SelectItem value="500">500 rows</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Response</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filteredLogs?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs?.map((log) => {
                    const cost = calculateCost(log);
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(log.created_at), 'MMM dd, HH:mm:ss')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.api_provider}</Badge>
                        </TableCell>
                        <TableCell>{getTaskBadge(log.task_type || 'unknown')}</TableCell>
                        <TableCell className="max-w-[150px] truncate" title={log.entity_name || ''}>
                          {log.entity_name || '-'}
                        </TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {log.input_tokens && log.output_tokens ? (
                            <span className="text-xs">
                              <span className="text-blue-500">{log.input_tokens}</span>
                              {' / '}
                              <span className="text-purple-500">{log.output_tokens}</span>
                            </span>
                          ) : log.tokens_used ? (
                            <span className="text-muted-foreground">{log.tokens_used}</span>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-mono text-xs">
                          {formatCost(cost)}
                        </TableCell>
                        <TableCell>
                          {log.response_time_ms ? `${(log.response_time_ms / 1000).toFixed(1)}s` : '-'}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-red-500" title={log.error_message || ''}>
                          {log.error_message || '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default APILogs;