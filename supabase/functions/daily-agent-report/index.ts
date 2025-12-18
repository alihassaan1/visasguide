import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DailyStats {
  contentCreated: number;
  visaRequirementsGenerated: number;
  blogPostsCreated: number;
  faqsGenerated: number;
  visaEnrichmentsCompleted: number;
  ctrOptimizations: number;
  apiCallsTotal: number;
  apiCostUSD: number;
  errorCount: number;
  topErrors: string[];
  // Visa coverage tracking
  visaContentToday: number;
  visaContentTotal: number;
  visaCoveragePercent: string;
  visaRemaining: number;
  daysToComplete: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }
    const resend = new Resend(resendApiKey);

    // Get report recipient from settings
    const { data: emailSettings } = await supabase
      .from("site_settings")
      .select("setting_value")
      .eq("setting_key", "admin_email")
      .single();

    const adminEmail = (emailSettings?.setting_value as any)?.email || "admin@visas.guide";

    // Calculate date range for last 24 hours
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    console.log(`📊 Generating daily report for ${yesterday.toISOString()} to ${now.toISOString()}`);

    // Fetch API logs for the period
    const { data: apiLogs } = await supabase
      .from("api_logs")
      .select("*")
      .gte("created_at", yesterday.toISOString())
      .lte("created_at", now.toISOString());

    // Calculate costs using DeepSeek pricing
    const calculateCost = (inputTokens: number, outputTokens: number, totalTokens: number) => {
      const inputRate = 0.56 / 1_000_000;
      const outputRate = 1.68 / 1_000_000;
      if (inputTokens && outputTokens) {
        return inputTokens * inputRate + outputTokens * outputRate;
      }
      return totalTokens * 0.5 * inputRate + totalTokens * 0.5 * outputRate;
    };

    const logs = apiLogs || [];
    const totalCost = logs.reduce((sum, log) => 
      sum + calculateCost(log.input_tokens || 0, log.output_tokens || 0, log.tokens_used || 0), 0);

    // Count by task type
    const taskCounts: Record<string, number> = {};
    const errorMessages: string[] = [];
    logs.forEach(log => {
      const taskType = log.task_type || 'unknown';
      taskCounts[taskType] = (taskCounts[taskType] || 0) + 1;
      if (log.status === 'error' && log.error_message) {
        errorMessages.push(`${taskType}: ${log.error_message.substring(0, 100)}`);
      }
    });

    // Get content stats
    const { count: contentCreated } = await supabase
      .from("content_pages")
      .select("id", { count: "exact", head: true })
      .gte("created_at", yesterday.toISOString());

    const { count: newsCreated } = await supabase
      .from("news_articles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", yesterday.toISOString());

    // Get visa content stats - total coverage
    const { count: totalCountries } = await supabase
      .from("countries")
      .select("id", { count: "exact", head: true });
    
    const totalCombinations = (totalCountries || 0) * ((totalCountries || 0) - 1);
    
    const { count: visaContentTotal } = await supabase
      .from("content_pages")
      .select("id", { count: "exact", head: true })
      .like("slug", "%-to-%-visa-requirements");
    
    const { count: visaContentToday } = await supabase
      .from("content_pages")
      .select("id", { count: "exact", head: true })
      .like("slug", "%-to-%-visa-requirements")
      .gte("created_at", yesterday.toISOString());

    const visaCoveragePercent = totalCombinations > 0 
      ? ((visaContentTotal || 0) / totalCombinations * 100).toFixed(2)
      : "0";
    const visaRemaining = totalCombinations - (visaContentTotal || 0);
    
    // Estimate completion at current pace (4800/day with 4x speedup)
    const pagesPerDay = visaContentToday && visaContentToday > 0 ? visaContentToday : 4800;
    const daysToComplete = Math.ceil(visaRemaining / pagesPerDay);

    // Get remaining work estimates
    const { count: visaReqRemaining } = await supabase
      .from("visa_requirements")
      .select("id", { count: "exact", head: true })
      .is("notes", null);

    const { count: countriesWithoutContent } = await supabase
      .from("countries")
      .select("id", { count: "exact", head: true });

    const { data: countriesWithContent } = await supabase
      .from("content_pages")
      .select("slug")
      .like("slug", "countries/%");

    const countriesRemaining = (countriesWithoutContent || 0) - (countriesWithContent?.length || 0);

    // Build report stats
    const stats: DailyStats = {
      contentCreated: contentCreated || 0,
      visaRequirementsGenerated: taskCounts['visaRequirementsContent'] || taskCounts['visa_requirements_content'] || 0,
      blogPostsCreated: taskCounts['blog_generation'] || taskCounts['blogGeneration'] || 0,
      faqsGenerated: taskCounts['faq_generation'] || taskCounts['faqGeneration'] || 0,
      visaEnrichmentsCompleted: taskCounts['visa_enrichment'] || taskCounts['visaEnrichment'] || 0,
      ctrOptimizations: taskCounts['bulk_ctr'] || taskCounts['bulkCTR'] || 0,
      apiCallsTotal: logs.length,
      apiCostUSD: totalCost,
      errorCount: logs.filter(l => l.status === 'error').length,
      topErrors: [...new Set(errorMessages)].slice(0, 5),
      // New visa coverage fields
      visaContentToday: visaContentToday || 0,
      visaContentTotal: visaContentTotal || 0,
      visaCoveragePercent,
      visaRemaining,
      daysToComplete,
    };

    // Generate HTML email
    const reportDate = now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0ea5e9, #8b5cf6); color: white; padding: 30px; border-radius: 12px 12px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 5px 0 0; opacity: 0.9; }
    .content { background: #f8fafc; padding: 25px; border: 1px solid #e2e8f0; }
    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
    .stat-card { background: white; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
    .stat-value { font-size: 28px; font-weight: bold; color: #0ea5e9; }
    .stat-label { font-size: 12px; color: #64748b; text-transform: uppercase; }
    .section { margin: 25px 0; }
    .section-title { font-size: 16px; font-weight: 600; color: #334155; border-bottom: 2px solid #0ea5e9; padding-bottom: 8px; }
    .progress-bar { background: #e2e8f0; border-radius: 4px; height: 8px; margin: 10px 0; }
    .progress-fill { background: linear-gradient(90deg, #0ea5e9, #8b5cf6); height: 100%; border-radius: 4px; }
    .cost-highlight { background: #fef3c7; border: 1px solid #fcd34d; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .error-list { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; }
    .error-item { font-size: 12px; color: #dc2626; margin: 5px 0; }
    .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
    .success-badge { background: #dcfce7; color: #16a34a; padding: 3px 8px; border-radius: 4px; font-size: 11px; }
    .remaining-work { background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #8b5cf6; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🤖 AI Agent Daily Report</h1>
    <p>${reportDate}</p>
  </div>
  
  <div class="content">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${stats.contentCreated}</div>
        <div class="stat-label">Pages Created</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.visaRequirementsGenerated}</div>
        <div class="stat-label">Visa Req Content</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.blogPostsCreated}</div>
        <div class="stat-label">Blog Posts</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.visaEnrichmentsCompleted}</div>
        <div class="stat-label">Visa Enrichments</div>
      </div>
    </div>

    <div class="section" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 12px; color: white; margin: 20px 0;">
      <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">🌍 VISA CONTENT COVERAGE - PRIORITY TASK</div>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 36px; font-weight: bold;">${stats.visaCoveragePercent}%</div>
          <div style="font-size: 12px; opacity: 0.8;">${stats.visaContentTotal.toLocaleString()} of 38,612 pages</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 24px; font-weight: 600;">+${stats.visaContentToday}</div>
          <div style="font-size: 12px; opacity: 0.8;">pages today</div>
        </div>
      </div>
      <div style="background: rgba(255,255,255,0.2); border-radius: 4px; height: 8px; margin-top: 15px;">
        <div style="background: white; height: 100%; border-radius: 4px; width: ${stats.visaCoveragePercent}%;"></div>
      </div>
      <div style="font-size: 11px; opacity: 0.8; margin-top: 8px;">
        ${stats.visaRemaining.toLocaleString()} remaining • Est. ${stats.daysToComplete} days to complete at current pace
      </div>
    </div>

    <div class="cost-highlight">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong>💰 API Costs (24h)</strong>
          <div style="font-size: 24px; font-weight: bold; color: #d97706;">$${stats.apiCostUSD.toFixed(4)}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 12px; color: #64748b;">Total API Calls</div>
          <div style="font-size: 18px; font-weight: 600;">${stats.apiCallsTotal}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">📊 Task Breakdown</div>
      <table style="width: 100%; margin-top: 10px; font-size: 14px;">
        <tr style="background: #dcfce7;"><td><strong>Visa Content Pages</strong></td><td style="text-align: right; font-weight: 600;">${stats.visaContentToday}</td></tr>
        <tr><td>CTR Optimization</td><td style="text-align: right; font-weight: 600;">${stats.ctrOptimizations}</td></tr>
        <tr><td>Blog Posts Generated</td><td style="text-align: right; font-weight: 600;">${stats.blogPostsCreated}</td></tr>
        <tr><td>FAQs Generated</td><td style="text-align: right; font-weight: 600;">${stats.faqsGenerated}</td></tr>
        <tr><td>Visa Data Enrichments</td><td style="text-align: right; font-weight: 600;">${stats.visaEnrichmentsCompleted}</td></tr>
      </table>
    </div>

    <div class="section">
      <div class="section-title">📈 Remaining Work</div>
      <div class="remaining-work">
        <p><strong>Visa Requirement Pages:</strong> ${stats.visaRemaining.toLocaleString()} remaining (${stats.visaCoveragePercent}% complete)</p>
        <p><strong>Country Guides:</strong> ~${Math.max(0, countriesRemaining)} countries need content</p>
        <div style="font-size: 12px; color: #64748b; margin-top: 10px;">
          At 4x speedup (~4,800 pages/day), visa content completion in ~${stats.daysToComplete} days
        </div>
      </div>
    </div>

    ${stats.errorCount > 0 ? `
    <div class="section">
      <div class="section-title">⚠️ Errors (${stats.errorCount})</div>
      <div class="error-list">
        ${stats.topErrors.map(e => `<div class="error-item">• ${e}</div>`).join('')}
      </div>
    </div>
    ` : `
    <div class="section" style="background: #dcfce7; padding: 15px; border-radius: 8px;">
      <span class="success-badge">✓ No Errors</span>
      <span style="margin-left: 10px;">All tasks completed successfully!</span>
    </div>
    `}
  </div>

  <div class="footer">
    <p>🌍 visas.guide AI Agent Report</p>
    <p>This report is auto-generated daily at 8:00 AM UTC</p>
    <p><a href="https://visas.guide/admin/agent" style="color: #0ea5e9;">View Agent Dashboard →</a></p>
  </div>
</body>
</html>
    `;

    // Send email via Resend
    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: "AI Agent <agent@visas.guide>",
      to: [adminEmail],
      subject: `📊 Daily Agent Report - ${stats.contentCreated} pages, $${stats.apiCostUSD.toFixed(2)} spent`,
      html: emailHtml,
    });

    if (emailError) {
      console.error("Email send error:", emailError);
      throw emailError;
    }

    console.log(`✅ Daily report sent to ${adminEmail}`, emailResult);

    // Log the report send
    await supabase.from("activity_log").insert({
      action: "daily_report_sent",
      entity_type: "system",
      metadata: {
        recipient: adminEmail,
        stats,
        sent_at: now.toISOString(),
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        recipient: adminEmail,
        stats,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in daily-agent-report:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
