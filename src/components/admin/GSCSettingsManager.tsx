import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Key, Globe, CheckCircle, XCircle, RefreshCw, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Json } from "@/integrations/supabase/types";

interface GSCSettings {
  client_email: string;
  private_key: string;
  site_url: string;
}

export function GSCSettingsManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [settings, setSettings] = useState<GSCSettings>({
    client_email: "",
    private_key: "",
    site_url: ""
  });
  const [isConfigured, setIsConfigured] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
    loadLastSync();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'gsc_credentials')
        .single();

      if (data?.setting_value && typeof data.setting_value === 'object' && !Array.isArray(data.setting_value)) {
        const value = data.setting_value as unknown as GSCSettings;
        setSettings({
          client_email: value.client_email ? '••••••••' + value.client_email.slice(-20) : '',
          private_key: value.private_key ? '••••••••[CONFIGURED]' : '',
          site_url: value.site_url || ''
        });
        setIsConfigured(!!value.client_email && !!value.private_key);
      }
    } catch (error) {
      // No settings found yet, that's okay
    } finally {
      setLoading(false);
    }
  };

  const loadLastSync = async () => {
    try {
      const { data } = await supabase
        .from('gsc_sync_log')
        .select('completed_at, status')
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      if (data?.completed_at) {
        setLastSync(new Date(data.completed_at).toLocaleString());
      }
    } catch {
      // No sync yet
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const isNewEmail = !settings.client_email.startsWith('••••');
      const isNewKey = !settings.private_key.startsWith('••••');

      let valueToSave: GSCSettings = { 
        client_email: '', 
        private_key: '', 
        site_url: settings.site_url 
      };

      // Get existing values if we're not updating them
      if (!isNewEmail || !isNewKey) {
        const { data: existing } = await supabase
          .from('site_settings')
          .select('setting_value')
          .eq('setting_key', 'gsc_credentials')
          .single();

        if (existing?.setting_value && typeof existing.setting_value === 'object' && !Array.isArray(existing.setting_value)) {
          const existingValue = existing.setting_value as unknown as GSCSettings;
          valueToSave.client_email = existingValue.client_email || '';
          valueToSave.private_key = existingValue.private_key || '';
        }
      }

      // Update with new values if provided
      if (isNewEmail && settings.client_email.trim()) {
        valueToSave.client_email = settings.client_email.trim();
      }
      if (isNewKey && settings.private_key.trim()) {
        valueToSave.private_key = settings.private_key.trim();
      }

      const { data: existingRow } = await supabase
        .from('site_settings')
        .select('id')
        .eq('setting_key', 'gsc_credentials')
        .single();

      const settingValueJson = JSON.parse(JSON.stringify(valueToSave));
      
      let error;
      if (existingRow) {
        const result = await supabase
          .from('site_settings')
          .update({
            setting_value: settingValueJson,
            updated_at: new Date().toISOString()
          })
          .eq('setting_key', 'gsc_credentials');
        error = result.error;
      } else {
        const result = await supabase
          .from('site_settings')
          .insert({
            setting_key: 'gsc_credentials',
            setting_value: settingValueJson
          });
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: "Google Search Console credentials have been updated.",
      });

      // Update display
      if (isNewEmail && settings.client_email.trim()) {
        setSettings(prev => ({
          ...prev,
          client_email: '••••••••' + settings.client_email.slice(-20)
        }));
      }
      if (isNewKey && settings.private_key.trim()) {
        setSettings(prev => ({
          ...prev,
          private_key: '••••••••[CONFIGURED]'
        }));
      }
      setIsConfigured(true);
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
        `https://awiytryceqehqapytfgn.supabase.co/functions/v1/gsc-fetch-data`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ action: 'test' }),
        }
      );

      if (response.ok) {
        setTestResult('success');
        toast({
          title: "Connection Successful",
          description: "Google Search Console API is connected.",
        });
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Connection failed');
      }
    } catch (error) {
      setTestResult('error');
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to GSC API",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const syncData = async () => {
    setSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `https://awiytryceqehqapytfgn.supabase.co/functions/v1/gsc-fetch-data`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ action: 'sync' }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Sync Complete",
          description: `Fetched ${data.rowsInserted || 0} rows from Google Search Console.`,
        });
        loadLastSync();
      } else {
        throw new Error(data.error || 'Sync failed');
      }
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync GSC data",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Google Search Console Integration
          {isConfigured && (
            <Badge variant="secondary" className="ml-2">
              <CheckCircle className="h-3 w-3 mr-1" />
              Configured
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Connect to Google Search Console to fetch real search performance data for the Quick Wins dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Setup Instructions */}
        <Alert>
          <AlertDescription className="space-y-2">
            <p className="font-medium">Setup Instructions:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Cloud Console <ExternalLink className="inline h-3 w-3" /></a></li>
              <li>Enable the Search Console API</li>
              <li>Create a Service Account (IAM & Admin → Service Accounts)</li>
              <li>Download the JSON key file</li>
              <li>Add the service account email as a user in <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Search Console <ExternalLink className="inline h-3 w-3" /></a></li>
            </ol>
          </AlertDescription>
        </Alert>

        {/* Credentials Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site_url">Site URL (Property)</Label>
            <Input
              id="site_url"
              type="text"
              value={settings.site_url}
              onChange={(e) => setSettings(prev => ({ ...prev, site_url: e.target.value }))}
              placeholder="https://visasguide.lovable.app or sc-domain:visasguide.lovable.app"
            />
            <p className="text-xs text-muted-foreground">
              The exact property URL as shown in Search Console (URL-prefix or Domain property)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_email">Service Account Email</Label>
            <Input
              id="client_email"
              type="text"
              value={settings.client_email}
              onChange={(e) => setSettings(prev => ({ ...prev, client_email: e.target.value }))}
              placeholder="your-service-account@project-id.iam.gserviceaccount.com"
            />
            <p className="text-xs text-muted-foreground">
              Found in the JSON key file as "client_email"
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="private_key">Private Key</Label>
            <Textarea
              id="private_key"
              value={settings.private_key}
              onChange={(e) => setSettings(prev => ({ ...prev, private_key: e.target.value }))}
              placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
              rows={4}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Found in the JSON key file as "private_key" (paste the entire key including BEGIN/END lines)
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Credentials
          </Button>

          <Button 
            onClick={testConnection} 
            disabled={testing || !isConfigured}
            variant="outline"
          >
            {testing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : testResult === 'success' ? (
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            ) : testResult === 'error' ? (
              <XCircle className="h-4 w-4 mr-2 text-red-500" />
            ) : (
              <Key className="h-4 w-4 mr-2" />
            )}
            Test Connection
          </Button>

          <Button 
            onClick={syncData} 
            disabled={syncing || !isConfigured}
            variant="outline"
          >
            {syncing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Sync Data Now
          </Button>
        </div>

        {/* Last Sync Info */}
        {lastSync && (
          <p className="text-sm text-muted-foreground">
            Last successful sync: {lastSync}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
