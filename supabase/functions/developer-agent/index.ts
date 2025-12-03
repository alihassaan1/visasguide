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

async function callDeepSeek(messages: Message[], model: string, apiKey: string): Promise<string> {
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
    return data.choices[0].message.content;
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

    switch (action) {
      case 'chat': {
        if (!messages || messages.length === 0) {
          throw new Error('Messages required for chat');
        }

        const systemMessage: Message = { role: 'system', content: SYSTEM_PROMPTS.chat };
        const fullMessages = [systemMessage, ...messages];
        
        const aiResponse = await callDeepSeek(fullMessages, model, apiKey);
        
        // Save to conversation if conversationId provided
        if (conversationId) {
          const userMessage = messages[messages.length - 1];
          await supabase.from('developer_agent_messages').insert([
            { conversation_id: conversationId, role: 'user', content: userMessage.content },
            { conversation_id: conversationId, role: 'assistant', content: aiResponse }
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

        response = { content: aiResponse };
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
        response = { content: aiResponse };
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
        response = { content: aiResponse };
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
        response = { content: aiResponse };
        break;
      }

      case 'list_files': {
        // This requires a file server backend - return placeholder
        response = {
          content: `File listing requires the file server backend to be running on EC2.
          
To enable this feature:
1. Deploy the file-server backend to your EC2 instance
2. Configure the FILE_SERVER_URL in your environment
3. The agent will then be able to list files from: ${folderPath || '/'}

For now, you can paste code directly into the chat for review.`,
          requiresFileServer: true
        };
        break;
      }

      case 'read_file': {
        // This requires a file server backend - return placeholder
        response = {
          content: `File reading requires the file server backend to be running on EC2.

To enable this feature:
1. Deploy the file-server backend to your EC2 instance
2. Configure the FILE_SERVER_URL in your environment
3. The agent will then be able to read: ${filePath}

For now, you can paste code directly into the chat for review.`,
          requiresFileServer: true
        };
        break;
      }

      case 'search_code': {
        // This requires a file server backend - return placeholder
        response = {
          content: `Code search requires the file server backend to be running on EC2.

To enable this feature:
1. Deploy the file-server backend to your EC2 instance
2. Configure the FILE_SERVER_URL in your environment
3. The agent will then be able to search for: "${searchQuery}"

For now, you can paste code directly into the chat for review.`,
          requiresFileServer: true
        };
        break;
      }

      case 'apply_change': {
        // Log the change intent
        if (filePath && newContent) {
          await supabase.from('file_change_history').insert({
            user_id: user.id,
            file_path: filePath,
            new_content: newContent,
            change_description: changeDescription || 'No description provided',
            conversation_id: conversationId
          });

          response = {
            content: `File change logged for: ${filePath}

To apply this change:
1. Deploy the file-server backend to your EC2 instance
2. Configure the FILE_SERVER_URL in your environment
3. The change will then be applied automatically

The change has been recorded in the file_change_history table for audit purposes.`,
            logged: true,
            requiresFileServer: true
          };
        } else {
          throw new Error('File path and new content required for apply_change');
        }
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Log API call
    const responseTime = Date.now() - startTime;
    await supabase.from('api_logs').insert({
      api_provider: 'DeepSeek',
      task_type: `developer_agent_${action}`,
      status: 'success',
      response_time_ms: responseTime,
      entity_name: filePath || conversationId || 'developer-agent',
      endpoint: '/v1/chat/completions'
    });

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
