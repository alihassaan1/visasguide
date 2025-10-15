import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Key, Sparkles, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function APISettings() {
  const { toast } = useToast();
  const [openAIKey, setOpenAIKey] = useState("");
  const [model, setModel] = useState("gpt-4o-mini");
  const [maxTokens, setMaxTokens] = useState("2000");
  const [enableForFreelancers, setEnableForFreelancers] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: keyData } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'openai_api_key')
        .single();

      const { data: modelData } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'openai_model')
        .single();

      const { data: freelancerData } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'ai_freelancer_enabled')
        .single();

      if (keyData?.setting_value) {
        // @ts-ignore
        setOpenAIKey(keyData.setting_value.key || '');
      }
      if (modelData?.setting_value) {
        // @ts-ignore
        setModel(modelData.setting_value.model || 'gpt-4o-mini');
        // @ts-ignore
        setMaxTokens(modelData.setting_value.maxTokens || '2000');
      }
      if (freelancerData?.setting_value) {
        // @ts-ignore
        setEnableForFreelancers(freelancerData.setting_value.enabled ?? true);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      // Save API key
      await supabase.from('site_settings').upsert({
        setting_key: 'openai_api_key',
        setting_value: { key: openAIKey }
      });

      // Save model settings
      await supabase.from('site_settings').upsert({
        setting_key: 'openai_model',
        setting_value: { model, maxTokens }
      });

      // Save freelancer access
      await supabase.from('site_settings').upsert({
        setting_key: 'ai_freelancer_enabled',
        setting_value: { enabled: enableForFreelancers }
      });

      toast({ title: "API settings saved successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearAPIKey = async () => {
    try {
      await supabase.from('site_settings')
        .delete()
        .eq('setting_key', 'openai_api_key');

      setOpenAIKey('');
      toast({ title: "API key cleared" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">API Settings</h1>
        <p className="text-muted-foreground">Configure OpenAI API for AI content generation</p>
      </div>

      <Alert className="mb-6">
        <Sparkles className="h-4 w-4" />
        <AlertDescription>
          These settings control the AI Content Studio feature. The API key is stored securely in your database.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            OpenAI Configuration
          </CardTitle>
          <CardDescription>Set up your OpenAI API key and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>OpenAI API Key</Label>
            <div className="flex gap-2">
              <Input
                type="password"
                value={openAIKey}
                onChange={(e) => setOpenAIKey(e.target.value)}
                placeholder="sk-..."
                className="font-mono"
              />
              <Button variant="outline" onClick={clearAPIKey}>
                Clear
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Get your API key from{" "}
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">
                OpenAI Platform
              </a>
            </p>
          </div>

          <div>
            <Label>Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4o (Most Capable)</SelectItem>
                <SelectItem value="gpt-4o-mini">GPT-4o Mini (Recommended)</SelectItem>
                <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Fastest)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Max Tokens per Generation</Label>
            <Input
              type="number"
              value={maxTokens}
              onChange={(e) => setMaxTokens(e.target.value)}
              min="500"
              max="4000"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Controls content length (500-4000). Higher = longer content but more expensive.
            </p>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label>Enable for Freelancers</Label>
              <p className="text-sm text-muted-foreground">
                Allow freelancers to use AI Content Studio
              </p>
            </div>
            <Switch
              checked={enableForFreelancers}
              onCheckedChange={setEnableForFreelancers}
            />
          </div>

          <div className="pt-4">
            <Button onClick={saveSettings} disabled={loading} className="w-full">
              {loading ? "Saving..." : "Save API Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Usage Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• GPT-4o Mini is recommended for most use cases - great balance of quality and cost</p>
          <p>• Monitor your OpenAI usage at platform.openai.com to track costs</p>
          <p>• Set billing limits on your OpenAI account to prevent unexpected charges</p>
          <p>• Each content generation typically uses 1,000-2,500 tokens</p>
        </CardContent>
      </Card>
    </div>
  );
}