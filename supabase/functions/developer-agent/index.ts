import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface RequestBody {
  action: 'chat' | 'review_code' | 'detect_bugs' | 'suggest_improvements' | 'list_files' | 'read_file' | 'search_code' | 'apply_change';
  messages?: Message[];
  conversationId?: string;
  code?: string;
  filePath?: string;
  folderPath?: string;
  searchQuery?: string;
  newContent?: string;
  changeDescription?: string;
}

const SYSTEM_PROMPTS = {
  chat: `You are a senior full-stack developer assistant for Visas.Guide. You help with code reviews, bug detection, architecture decisions, and code improvements.

Your capabilities:
- Review code for issues, patterns, and best practices
- Detect potential bugs and security vulnerabilities
- Suggest improvements for performance, readability, and maintainability
- Explain complex code and architectural decisions
- Help with React, TypeScript, Tailwind CSS, Supabase, and Node.js

When reviewing code, always:
1. Check for security vulnerabilities
2. Look for performance issues
3. Verify error handling
4. Assess code organization and readability
5. Suggest specific improvements with code examples

Format your responses clearly with markdown code blocks when showing code.`,

  review_code: `You are a code reviewer. Analyze the provided code and:
1. Identify bad patterns and anti-patterns
2. Find performance risks
3. Check error handling completeness
4. Look for security vulnerabilities
5. Suggest specific improvements with updated code snippets

Be thorough but constructive. Provide actionable feedback with code examples.`,

  detect_bugs: `You are a bug detection specialist. Scan the provided code for:
1. Logic errors
2. Null/undefined reference issues
3. Race conditions
4. Memory leaks
5. Edge cases not handled
6. Type safety issues

For each bug found, explain:
- What the bug is
- Why it's a problem
- How to fix it with code example`,

  suggest_improvements: `You are a code improvement specialist. Review the provided code and suggest:
1. Refactoring opportunities
2. Cleaner code structure
3. Better naming conventions
4. Query optimizations
5. Component optimizations
6. DRY improvements

Provide updated code blocks that can be directly applied.`
};

interface DeepSeekResponse {
  content: string;
  tokensUsed: number | null;
}

async function callDeepSeek(messages: Message[], model: string, apiKey: string): Promise<DeepSeekResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90000); // 90 second timeout

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 4000,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const tokensUsed = data.usage?.total_tokens || null;
    console.log(`DeepSeek API tokens used: ${tokensUsed}`);
    
    return {
      content: data.choices[0].message.content,
      tokensUsed
    };
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      throw new Error('DeepSeek API timeout after 90 seconds');
    }
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Verify admin access
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check admin role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin');

    if (!roles || roles.length === 0) {
      throw new Error('Admin access required');
    }

    const body: RequestBody = await req.json();
    const { action, messages, conversationId, code, filePath, folderPath, searchQuery, newContent, changeDescription } = body;

    // Get DeepSeek API key from settings
    const { data: settings } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'deepseek_api_key')
      .single();

    let apiKey = null;
    let model = 'deepseek-chat';
    
    if (settings?.setting_value && typeof settings.setting_value === 'object') {
      apiKey = (settings.setting_value as any).key;
      model = (settings.setting_value as any).model || 'deepseek-chat';
    }

    if (!apiKey) {
      apiKey = Deno.env.get('DEEPSEEK_API_KEY');
    }

    if (!apiKey) {
      throw new Error('DeepSeek API key not configured. Please add it in API Settings.');
    }

    let response: any = {};
    let totalTokensUsed = 0;

    switch (action) {
      case 'chat': {
        if (!messages || messages.length === 0) {
          throw new Error('Messages required for chat');
        }

        const systemMessage: Message = { role: 'system', content: SYSTEM_PROMPTS.chat };
        const fullMessages = [systemMessage, ...messages];
        
        const aiResponse = await callDeepSeek(fullMessages, model, apiKey);
        totalTokensUsed = aiResponse.tokensUsed || 0;
        
        // Save to conversation if conversationId provided
        if (conversationId) {
          const userMessage = messages[messages.length - 1];
          await supabase.from('developer_agent_messages').insert([
            { conversation_id: conversationId, role: 'user', content: userMessage.content },
            { conversation_id: conversationId, role: 'assistant', content: aiResponse.content }
          ]);

          // Update conversation title if first message
          const { count } = await supabase
            .from('developer_agent_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conversationId);

          if (count && count <= 2) {
            const title = userMessage.content.slice(0, 50) + (userMessage.content.length > 50 ? '...' : '');
            await supabase
              .from('developer_agent_conversations')
              .update({ title })
              .eq('id', conversationId);
          }
        }

        response = { content: aiResponse.content, tokensUsed: totalTokensUsed };
        break;
      }

      case 'review_code': {
        if (!code) {
          throw new Error('Code required for review');
        }

        const reviewMessages: Message[] = [
          { role: 'system', content: SYSTEM_PROMPTS.review_code },
          { role: 'user', content: `Please review the following code:\n\n\`\`\`\n${code}\n\`\`\`` }
        ];

        const aiResponse = await callDeepSeek(reviewMessages, model, apiKey);
        totalTokensUsed = aiResponse.tokensUsed || 0;
        response = { content: aiResponse.content, tokensUsed: totalTokensUsed };
        break;
      }

      case 'detect_bugs': {
        if (!code) {
          throw new Error('Code required for bug detection');
        }

        const bugMessages: Message[] = [
          { role: 'system', content: SYSTEM_PROMPTS.detect_bugs },
          { role: 'user', content: `Please scan the following code for bugs:\n\n\`\`\`\n${code}\n\`\`\`` }
        ];

        const aiResponse = await callDeepSeek(bugMessages, model, apiKey);
        totalTokensUsed = aiResponse.tokensUsed || 0;
        response = { content: aiResponse.content, tokensUsed: totalTokensUsed };
        break;
      }

      case 'suggest_improvements': {
        if (!code) {
          throw new Error('Code required for improvement suggestions');
        }

        const improveMessages: Message[] = [
          { role: 'system', content: SYSTEM_PROMPTS.suggest_improvements },
          { role: 'user', content: `Please suggest improvements for the following code:\n\n\`\`\`\n${code}\n\`\`\`` }
        ];

        const aiResponse = await callDeepSeek(improveMessages, model, apiKey);
        totalTokensUsed = aiResponse.tokensUsed || 0;
        response = { content: aiResponse.content, tokensUsed: totalTokensUsed };
        break;
      }

case 'list_files': {
        const fileServerUrl = Deno.env.get('FILE_SERVER_URL');
        const fileServerSecret = Deno.env.get('FILE_SERVER_SECRET');
        
        if (!fileServerUrl || !fileServerSecret) {
          response = {
            content: `File server not configured. Please add FILE_SERVER_URL and FILE_SERVER_SECRET to your Supabase secrets.`,
            requiresFileServer: true
          };
          break;
        }

        try {
          const listResponse = await fetch(`${fileServerUrl}/api/files/list?path=${encodeURIComponent(folderPath || '')}`, {
            headers: { 'Authorization': `Bearer ${fileServerSecret}` }
          });
          
          if (!listResponse.ok) {
            const error = await listResponse.json();
            throw new Error(error.error || 'Failed to list files');
          }
          
          const data = await listResponse.json();
          const fileList = data.files.map((f: any) => `${f.type === 'directory' ? '📁' : '📄'} ${f.name}`).join('\n');
          
          response = {
            content: `**Files in ${folderPath || '/'}:**\n\n\`\`\`\n${fileList}\n\`\`\``,
            files: data.files
          };
        } catch (error) {
          response = { content: `Error listing files: ${error.message}`, error: true };
        }
        break;
      }

      case 'read_file': {
        const fileServerUrl = Deno.env.get('FILE_SERVER_URL');
        const fileServerSecret = Deno.env.get('FILE_SERVER_SECRET');
        
        if (!fileServerUrl || !fileServerSecret) {
          response = {
            content: `File server not configured. Please add FILE_SERVER_URL and FILE_SERVER_SECRET to your Supabase secrets.`,
            requiresFileServer: true
          };
          break;
        }

        if (!filePath) {
          throw new Error('File path required');
        }

        try {
          const readResponse = await fetch(`${fileServerUrl}/api/files/read?path=${encodeURIComponent(filePath)}`, {
            headers: { 'Authorization': `Bearer ${fileServerSecret}` }
          });
          
          if (!readResponse.ok) {
            const error = await readResponse.json();
            throw new Error(error.error || 'Failed to read file');
          }
          
          const data = await readResponse.json();
          const ext = filePath.split('.').pop() || 'txt';
          
          response = {
            content: `**File: ${filePath}**\n\n\`\`\`${ext}\n${data.content}\n\`\`\``,
            fileContent: data.content,
            fileInfo: { size: data.size, modified: data.modified }
          };
        } catch (error) {
          response = { content: `Error reading file: ${error.message}`, error: true };
        }
        break;
      }

      case 'search_code': {
        const fileServerUrl = Deno.env.get('FILE_SERVER_URL');
        const fileServerSecret = Deno.env.get('FILE_SERVER_SECRET');
        
        if (!fileServerUrl || !fileServerSecret) {
          response = {
            content: `File server not configured. Please add FILE_SERVER_URL and FILE_SERVER_SECRET to your Supabase secrets.`,
            requiresFileServer: true
          };
          break;
        }

        if (!searchQuery) {
          throw new Error('Search query required');
        }

        try {
          const searchResponse = await fetch(`${fileServerUrl}/api/files/search?q=${encodeURIComponent(searchQuery)}&path=${encodeURIComponent(folderPath || '')}`, {
            headers: { 'Authorization': `Bearer ${fileServerSecret}` }
          });
          
          if (!searchResponse.ok) {
            const error = await searchResponse.json();
            throw new Error(error.error || 'Failed to search');
          }
          
          const data = await searchResponse.json();
          
          let resultText = `**Search results for "${searchQuery}":**\n\n`;
          resultText += `Found in ${data.matchedFiles} of ${data.totalFiles} files\n\n`;
          
          for (const result of data.results.slice(0, 10)) {
            resultText += `**${result.file}**\n`;
            for (const match of result.matches.slice(0, 3)) {
              resultText += `  Line ${match.line}: \`${match.content}\`\n`;
            }
            resultText += '\n';
          }
          
          response = { content: resultText, searchResults: data.results };
        } catch (error) {
          response = { content: `Error searching: ${error.message}`, error: true };
        }
        break;
      }

      case 'apply_change': {
        const fileServerUrl = Deno.env.get('FILE_SERVER_URL');
        const fileServerSecret = Deno.env.get('FILE_SERVER_SECRET');
        
        if (!filePath || !newContent) {
          throw new Error('File path and new content required for apply_change');
        }

        // Always log the change first
        const { data: logEntry } = await supabase.from('file_change_history').insert({
          user_id: user.id,
          file_path: filePath,
          new_content: newContent,
          change_description: changeDescription || 'No description provided',
          conversation_id: conversationId
        }).select().single();

        if (!fileServerUrl || !fileServerSecret) {
          response = {
            content: `Change logged but file server not configured. The change has been recorded for manual application.\n\nFile: ${filePath}\nLog ID: ${logEntry?.id}`,
            logged: true,
            requiresFileServer: true
          };
          break;
        }

        try {
          // Read current content for backup
          let originalContent: string | null = null;
          try {
            const readResponse = await fetch(`${fileServerUrl}/api/files/read?path=${encodeURIComponent(filePath)}`, {
              headers: { 'Authorization': `Bearer ${fileServerSecret}` }
            });
            if (readResponse.ok) {
              const data = await readResponse.json();
              originalContent = data.content;
            }
          } catch {
            // File might not exist
          }

          // Update the log entry with original content
          if (originalContent && logEntry) {
            await supabase.from('file_change_history')
              .update({ original_content: originalContent })
              .eq('id', logEntry.id);
          }

          // Apply the change
          const writeResponse = await fetch(`${fileServerUrl}/api/files/write`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${fileServerSecret}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              path: filePath,
              content: newContent,
              description: changeDescription
            })
          });

          if (!writeResponse.ok) {
            const error = await writeResponse.json();
            throw new Error(error.error || 'Failed to write file');
          }

          const result = await writeResponse.json();
          
          response = {
            content: `✅ **File updated successfully!**\n\nFile: ${filePath}\n${result.backedUp ? 'Backup created automatically.' : 'New file created.'}\n\nChange logged with ID: ${logEntry?.id}`,
            applied: true,
            backedUp: result.backedUp
          };
        } catch (error) {
          response = {
            content: `❌ Error applying change: ${error.message}\n\nThe change has been logged (ID: ${logEntry?.id}) for manual review.`,
            error: true,
            logged: true
          };
        }
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Log API call with tokens used
    const responseTime = Date.now() - startTime;
    await supabase.from('api_logs').insert({
      api_provider: 'deepseek',
      task_type: `developer_agent_${action}`,
      status: 'success',
      response_time_ms: responseTime,
      tokens_used: totalTokensUsed || null,
      entity_name: filePath || conversationId || 'developer-agent',
      endpoint: 'https://api.deepseek.com/v1/chat/completions',
      response_summary: { action, tokensUsed: totalTokensUsed }
    });
    
    console.log(`Developer Agent ${action} completed - Tokens used: ${totalTokensUsed}`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Developer Agent error:', error);
    
    // Log error
    const responseTime = Date.now() - startTime;
    await supabase.from('api_logs').insert({
      api_provider: 'DeepSeek',
      task_type: 'developer_agent',
      status: 'error',
      error_message: error.message,
      response_time_ms: responseTime,
      entity_name: 'developer-agent',
      endpoint: '/v1/chat/completions'
    });

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: error.message.includes('Unauthorized') || error.message.includes('Admin access') ? 403 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
