import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Loader2, 
  Bot, 
  User, 
  Plus, 
  MessageSquare, 
  Code, 
  Bug, 
  Sparkles,
  History,
  Trash2,
  FileCode,
  Search,
  FolderOpen
} from "lucide-react";

interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export default function DeveloperAgent() {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation);
    }
  }, [currentConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from('developer_agent_conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error loading conversations:', error);
      return;
    }

    setConversations(data || []);
    if (data && data.length > 0 && !currentConversation) {
      setCurrentConversation(data[0].id);
    }
  };

  const loadMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('developer_agent_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    // Map the data to ensure role type is correct
    const mappedMessages: Message[] = (data || []).map(m => ({
      id: m.id,
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
      created_at: m.created_at
    }));
    setMessages(mappedMessages);
  };

  const createNewConversation = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('developer_agent_conversations')
      .insert({ user_id: user.id, title: 'New Conversation' })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: "Failed to create conversation", variant: "destructive" });
      return;
    }

    setConversations(prev => [data, ...prev]);
    setCurrentConversation(data.id);
    setMessages([]);
  };

  const deleteConversation = async (id: string) => {
    const { error } = await supabase
      .from('developer_agent_conversations')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete conversation", variant: "destructive" });
      return;
    }

    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConversation === id) {
      setCurrentConversation(conversations.find(c => c.id !== id)?.id || null);
      setMessages([]);
    }
  };

  const sendMessage = async (action: string = 'chat', code?: string) => {
    const messageContent = action === 'chat' ? input : codeInput;
    if (!messageContent.trim() && !code) return;

    setIsLoading(true);

    // Create conversation if needed
    let convId = currentConversation;
    if (!convId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data: newConv, error: convError } = await supabase
        .from('developer_agent_conversations')
        .insert({ user_id: user.id, title: 'New Conversation' })
        .select()
        .single();

      if (convError) {
        toast({ title: "Error", description: "Failed to create conversation", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      convId = newConv.id;
      setCurrentConversation(convId);
      setConversations(prev => [newConv, ...prev]);
    }

    // Add user message to UI
    const userMessage: Message = { role: 'user', content: code || messageContent };
    setMessages(prev => [...prev, userMessage]);
    
    if (action === 'chat') {
      setInput("");
    } else {
      setCodeInput("");
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const allMessages = [...messages, userMessage].map(m => ({ role: m.role, content: m.content }));

      const response = await fetch(
        `https://awiytryceqehqapytfgn.supabase.co/functions/v1/developer-agent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            action,
            messages: action === 'chat' ? allMessages : undefined,
            code: action !== 'chat' ? (code || messageContent) : undefined,
            conversationId: convId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const assistantMessage: Message = { role: 'assistant', content: data.content };
      setMessages(prev => [...prev, assistantMessage]);

      // Update conversation title and timestamp
      loadConversations();

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    { icon: Code, label: "Review Code", action: "review_code", description: "Analyze code for issues and patterns" },
    { icon: Bug, label: "Detect Bugs", action: "detect_bugs", description: "Scan for potential bugs and errors" },
    { icon: Sparkles, label: "Suggest Improvements", action: "suggest_improvements", description: "Get optimization suggestions" },
  ];

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar - Conversations */}
      <div className="w-64 border-r bg-muted/30 flex flex-col">
        <div className="p-4 border-b">
          <Button onClick={createNewConversation} className="w-full" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                  currentConversation === conv.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                }`}
                onClick={() => setCurrentConversation(conv.id)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <MessageSquare className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm truncate">{conv.title}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="border-b px-4">
            <TabsList className="h-12">
              <TabsTrigger value="chat" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="code" className="gap-2">
                <FileCode className="h-4 w-4" />
                Code Tools
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="h-4 w-4" />
                File Changes
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="chat" className="flex-1 flex flex-col m-0 overflow-hidden">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <Bot className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Developer Agent</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    I'm here to help you with code reviews, bug detection, and improvements. 
                    Start a conversation or paste code to analyze.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {["Review a component", "Find bugs in my code", "Optimize this function", "Explain this pattern"].map((prompt) => (
                      <Button
                        key={prompt}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setInput(prompt);
                        }}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-w-4xl mx-auto">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                    >
                      {message.role === 'assistant' && (
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div
                        className={`rounded-lg p-4 max-w-[80%] ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                          {message.content}
                        </div>
                      </div>
                      {message.role === 'user' && (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex gap-2 max-w-4xl mx-auto">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me to review code, find bugs, or suggest improvements..."
                  className="min-h-[60px] resize-none"
                  disabled={isLoading}
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  className="h-[60px] w-[60px]"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="code" className="flex-1 m-0 p-4 overflow-auto">
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Code Analysis Tools</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {quickActions.map((action) => (
                    <Card key={action.action} className="cursor-pointer hover:border-primary transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <action.icon className="h-5 w-5 text-primary" />
                          {action.label}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {action.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Paste your code</h3>
                <Textarea
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="Paste your code here for analysis..."
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>

              <div className="flex gap-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.action}
                    onClick={() => sendMessage(action.action)}
                    disabled={isLoading || !codeInput.trim()}
                    variant="outline"
                  >
                    <action.icon className="h-4 w-4 mr-2" />
                    {action.label}
                  </Button>
                ))}
              </div>

              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FolderOpen className="h-5 w-5" />
                    File Access (EC2 Required)
                  </CardTitle>
                  <CardDescription>
                    To enable direct file access, search, and auto-apply features, you'll need to deploy
                    a file server backend on your EC2 instance. For now, paste code directly into the chat.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Button variant="outline" disabled>
                    <FolderOpen className="h-4 w-4 mr-2" />
                    List Files
                  </Button>
                  <Button variant="outline" disabled>
                    <FileCode className="h-4 w-4 mr-2" />
                    Read File
                  </Button>
                  <Button variant="outline" disabled>
                    <Search className="h-4 w-4 mr-2" />
                    Search Code
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="flex-1 m-0 p-4 overflow-auto">
            <FileChangeHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function FileChangeHistory() {
  const [changes, setChanges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChanges();
  }, []);

  const loadChanges = async () => {
    const { data, error } = await supabase
      .from('file_change_history')
      .select('*')
      .order('applied_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading file changes:', error);
    }

    setChanges(data || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (changes.length === 0) {
    return (
      <div className="text-center py-12">
        <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No File Changes Yet</h3>
        <p className="text-muted-foreground">
          File changes will appear here when you use the auto-apply feature.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h2 className="text-lg font-semibold">File Change History</h2>
      {changes.map((change) => (
        <Card key={change.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-mono">{change.file_path}</CardTitle>
              <Badge variant={change.reverted_at ? "secondary" : "default"}>
                {change.reverted_at ? "Reverted" : "Applied"}
              </Badge>
            </div>
            <CardDescription>
              {new Date(change.applied_at).toLocaleString()}
              {change.change_description && ` — ${change.change_description}`}
            </CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
