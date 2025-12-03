import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Key, Cpu, CheckCircle, XCircle } from "lucide-react";

export default function DeveloperAPISettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("deepseek-chat");
  const [keyConfigured, setKeyConfigured] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'deepseek_api_key')
        .single();

      if (data?.setting_value && typeof data.setting_value === 'object') {
        const value = data.setting_value as { key?: string; model?: string };
        if (value.key) {
          setApiKey('••••••••••••••••' + value.key.slice(-4));
          setKeyConfigured(true);
        }
        if (value.model) {
          setModel(value.model);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Only update if the key has been changed (not masked)
      const isNewKey = !apiKey.startsWith('••••');
      
      let valueToSave: { key?: string; model: string } = { model };
      
      if (isNewKey && apiKey.trim()) {
        valueToSave.key = apiKey.trim();
      } else {
        // Keep existing key, only update model
        const { data: existing } = await supabase
          .from('site_settings')
          .select('setting_value')
          .eq('setting_key', 'deepseek_api_key')
          .single();

        if (existing?.setting_value && typeof existing.setting_value === 'object') {
          const existingValue = existing.setting_value as { key?: string };
          valueToSave.key = existingValue.key;
        }
      }

      const { error } = await supabase
        .from('site_settings')
        .upsert({
          setting_key: 'deepseek_api_key',
          setting_value: valueToSave,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'setting_key'
        });

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: "DeepSeek API settings have been updated.",
      });

      if (isNewKey && apiKey.trim()) {
        setApiKey('••••••••••••••••' + apiKey.slice(-4));
        setKeyConfigured(true);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `https://awiytryceqehqapytfgn.supabase.co/functions/v1/developer-agent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            action: 'chat',
            messages: [{ role: 'user', content: 'Hello, respond with "Connection successful" only.' }],
          }),
        }
      );

      if (response.ok) {
        setTestResult('success');
        toast({
          title: "Connection Successful",
          description: "DeepSeek API is working correctly.",
        });
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Connection failed');
      }
    } catch (error) {
      setTestResult('error');
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to DeepSeek API",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Developer Agent Settings</h1>
        <p className="text-muted-foreground">Configure the DeepSeek API for the Developer Agent</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Key Configuration
          </CardTitle>
          <CardDescription>
            Enter your DeepSeek API key to enable the Developer Agent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">DeepSeek API Key</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
              />
              {keyConfigured && (
                <Badge variant="secondary" className="flex-shrink-0">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Configured
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Get your API key from{" "}
              <a 
                href="https://platform.deepseek.com/api_keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                platform.deepseek.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Model Selection
          </CardTitle>
          <CardDescription>
            Choose which DeepSeek model to use for code analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deepseek-chat">
                  <div className="flex flex-col">
                    <span>DeepSeek Chat</span>
                    <span className="text-xs text-muted-foreground">Fast, cost-effective</span>
                  </div>
                </SelectItem>
                <SelectItem value="deepseek-reasoner">
                  <div className="flex flex-col">
                    <span>DeepSeek Reasoner</span>
                    <span className="text-xs text-muted-foreground">Advanced reasoning, better for complex analysis</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <h4 className="font-medium mb-2">Model Comparison</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">DeepSeek Chat</p>
                <ul className="text-muted-foreground space-y-1 mt-1">
                  <li>• Faster responses</li>
                  <li>• Lower cost</li>
                  <li>• Good for general tasks</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">DeepSeek Reasoner</p>
                <ul className="text-muted-foreground space-y-1 mt-1">
                  <li>• Better reasoning</li>
                  <li>• Complex bug detection</li>
                  <li>• Detailed code analysis</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connection Test</CardTitle>
          <CardDescription>
            Test the DeepSeek API connection to verify your configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Button 
            onClick={testConnection} 
            disabled={testing || !keyConfigured}
            variant="outline"
          >
            {testing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : testResult === 'success' ? (
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            ) : testResult === 'error' ? (
              <XCircle className="h-4 w-4 mr-2 text-red-500" />
            ) : null}
            Test Connection
          </Button>
          {testResult === 'success' && (
            <span className="text-sm text-green-600">API connected successfully</span>
          )}
          {testResult === 'error' && (
            <span className="text-sm text-red-600">Connection failed</span>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
