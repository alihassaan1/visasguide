import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, Sparkles } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function SiteReviewChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('deepseek-chat', {
        body: { messages: [...messages, userMessage] }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.choices[0].message.content
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to get response from DeepSeek. Please check your API settings.",
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

  const startNewChat = () => {
    setMessages([]);
    setInput('');
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">AI Site Review Assistant</h1>
        <p className="text-muted-foreground">
          Chat with DeepSeek AI to get improvement suggestions for your website
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                DeepSeek Chat
              </CardTitle>
              <CardDescription>
                Ask for SEO, UX, content, or technical improvement suggestions
              </CardDescription>
            </div>
            {messages.length > 0 && (
              <Button variant="outline" onClick={startNewChat} size="sm">
                New Chat
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4 mb-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Sparkles className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Start a conversation</p>
                <p className="text-sm max-w-md">
                  Ask DeepSeek to review specific aspects of your site or request general improvement suggestions
                </p>
                <div className="mt-6 grid grid-cols-1 gap-2 max-w-md">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInput("Review the overall SEO strategy of visas.guide and suggest improvements")}
                  >
                    Review SEO Strategy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInput("What improvements can we make to user experience and navigation?")}
                  >
                    Improve UX/Navigation
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInput("Suggest ways to increase visitor engagement and time on site")}
                  >
                    Boost Engagement
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-4">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask for improvement suggestions..."
              className="min-h-[60px] max-h-[120px]"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
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
        </CardContent>
      </Card>
    </div>
  );
}