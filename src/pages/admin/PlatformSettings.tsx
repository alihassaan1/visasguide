import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Facebook,
  Instagram,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Settings,
  Link as LinkIcon,
  Save,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

interface PostingRules {
  cooldown_hours: number;
  max_posts_per_day: number;
  auto_publish: boolean;
  retry_max: number;
  retry_delay_minutes: number;
}

const DEFAULT_POSTING_RULES: PostingRules = {
  cooldown_hours: 24,
  max_posts_per_day: 10,
  auto_publish: true,
  retry_max: 1,
  retry_delay_minutes: 30,
};

export default function PlatformSettings() {
  const queryClient = useQueryClient();
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccountPlatform, setNewAccountPlatform] = useState<'facebook' | 'instagram'>('facebook');
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountId, setNewAccountId] = useState("");
  const [newAccessToken, setNewAccessToken] = useState("");
  const [postingRules, setPostingRules] = useState<PostingRules>(DEFAULT_POSTING_RULES);
  const [isSavingRules, setIsSavingRules] = useState(false);

  // Fetch platform accounts
  const { data: accounts, isLoading: accountsLoading } = useQuery({
    queryKey: ['platform-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_accounts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch posting rules
  useQuery({
    queryKey: ['social-posting-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'social_posting_rules')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      const rules = data?.setting_value as unknown as PostingRules;
      if (rules) setPostingRules(rules);
      return rules || DEFAULT_POSTING_RULES;
    },
  });

  // Add account mutation
  const addAccountMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('platform_accounts')
        .insert({
          platform: newAccountPlatform,
          account_name: newAccountName,
          account_id: newAccountId || null,
          access_token_encrypted: newAccessToken || null,
          is_active: true,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Account added successfully');
      setIsAddingAccount(false);
      setNewAccountName("");
      setNewAccountId("");
      setNewAccessToken("");
      queryClient.invalidateQueries({ queryKey: ['platform-accounts'] });
    },
    onError: (error: any) => {
      toast.error('Failed to add account: ' + error.message);
    },
  });

  // Toggle account active status
  const toggleAccountMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('platform_accounts')
        .update({ is_active: isActive })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-accounts'] });
    },
    onError: (error: any) => {
      toast.error('Failed to update account: ' + error.message);
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('platform_accounts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Account removed');
      queryClient.invalidateQueries({ queryKey: ['platform-accounts'] });
    },
    onError: (error: any) => {
      toast.error('Failed to remove account: ' + error.message);
    },
  });

  // Save posting rules
  const savePostingRules = async () => {
    setIsSavingRules(true);
    try {
      // Check if setting exists
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('setting_key', 'social_posting_rules')
        .single();

      if (existing) {
        const { error } = await supabase
          .from('site_settings')
          .update({ setting_value: JSON.parse(JSON.stringify(postingRules)) })
          .eq('setting_key', 'social_posting_rules');
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert([{ setting_key: 'social_posting_rules', setting_value: JSON.parse(JSON.stringify(postingRules)) }]);
        if (error) throw error;
      }
      toast.success('Posting rules saved');
      queryClient.invalidateQueries({ queryKey: ['social-posting-rules'] });
    } catch (error: any) {
      toast.error('Failed to save rules: ' + error.message);
    } finally {
      setIsSavingRules(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    return platform === 'facebook' ? (
      <Facebook className="h-5 w-5 text-blue-600" />
    ) : (
      <Instagram className="h-5 w-5 text-pink-600" />
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Platform Settings</h1>
        <p className="text-muted-foreground">Configure your social media accounts and posting rules</p>
      </div>

      <Tabs defaultValue="accounts" className="w-full">
        <TabsList>
          <TabsTrigger value="accounts">Connected Accounts</TabsTrigger>
          <TabsTrigger value="rules">Posting Rules</TabsTrigger>
          <TabsTrigger value="setup">Setup Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="mt-4 space-y-4">
          {/* Connected Accounts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Connected Accounts</CardTitle>
                  <CardDescription>Your Facebook and Instagram accounts for posting</CardDescription>
                </div>
                <Dialog open={isAddingAccount} onOpenChange={setIsAddingAccount}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Social Media Account</DialogTitle>
                      <DialogDescription>
                        Connect a Facebook Page or Instagram Business Account
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="flex gap-2">
                        <Button
                          variant={newAccountPlatform === 'facebook' ? 'default' : 'outline'}
                          onClick={() => setNewAccountPlatform('facebook')}
                          className="flex-1"
                        >
                          <Facebook className="h-4 w-4 mr-2" />
                          Facebook
                        </Button>
                        <Button
                          variant={newAccountPlatform === 'instagram' ? 'default' : 'outline'}
                          onClick={() => setNewAccountPlatform('instagram')}
                          className="flex-1"
                        >
                          <Instagram className="h-4 w-4 mr-2" />
                          Instagram
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label>Account Name</Label>
                        <Input
                          placeholder="e.g., Visas.Guide Official"
                          value={newAccountName}
                          onChange={(e) => setNewAccountName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Account/Page ID (optional)</Label>
                        <Input
                          placeholder="e.g., 123456789"
                          value={newAccountId}
                          onChange={(e) => setNewAccountId(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Access Token (optional)</Label>
                        <Input
                          type="password"
                          placeholder="Long-lived access token"
                          value={newAccessToken}
                          onChange={(e) => setNewAccessToken(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Leave empty to create a placeholder account
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddingAccount(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => addAccountMutation.mutate()}
                        disabled={!newAccountName || addAccountMutation.isPending}
                      >
                        Add Account
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {accountsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : accounts?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <LinkIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No accounts connected yet</p>
                  <p className="text-sm mt-1">Add your Facebook or Instagram account to start posting</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {accounts?.map((account: any) => (
                    <div 
                      key={account.id} 
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        {getPlatformIcon(account.platform)}
                        <div>
                          <p className="font-medium">{account.account_name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {account.access_token_encrypted ? (
                              <Badge className="bg-green-500/20 text-green-600">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Connected
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-500/20 text-yellow-600">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Not Configured
                              </Badge>
                            )}
                            {account.account_id && (
                              <span className="text-xs text-muted-foreground">
                                ID: {account.account_id}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`active-${account.id}`} className="text-sm">Active</Label>
                          <Switch
                            id={`active-${account.id}`}
                            checked={account.is_active}
                            onCheckedChange={(checked) => 
                              toggleAccountMutation.mutate({ id: account.id, isActive: checked })
                            }
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteAccountMutation.mutate(account.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Posting Rules
              </CardTitle>
              <CardDescription>Configure automatic posting behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Publish</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically publish content when it's created or updated
                  </p>
                </div>
                <Switch
                  checked={postingRules.auto_publish}
                  onCheckedChange={(checked) => 
                    setPostingRules(prev => ({ ...prev, auto_publish: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Cooldown Period (hours)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={168}
                    value={postingRules.cooldown_hours}
                    onChange={(e) => 
                      setPostingRules(prev => ({ ...prev, cooldown_hours: parseInt(e.target.value) || 24 }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Wait time before reposting the same content
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Max Posts Per Day</Label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={postingRules.max_posts_per_day}
                    onChange={(e) => 
                      setPostingRules(prev => ({ ...prev, max_posts_per_day: parseInt(e.target.value) || 10 }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum posts per platform per day
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Max Retry Attempts</Label>
                  <Input
                    type="number"
                    min={0}
                    max={5}
                    value={postingRules.retry_max}
                    onChange={(e) => 
                      setPostingRules(prev => ({ ...prev, retry_max: parseInt(e.target.value) || 1 }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of times to retry failed posts
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Retry Delay (minutes)</Label>
                  <Input
                    type="number"
                    min={5}
                    max={120}
                    value={postingRules.retry_delay_minutes}
                    onChange={(e) => 
                      setPostingRules(prev => ({ ...prev, retry_delay_minutes: parseInt(e.target.value) || 30 }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Wait time before retrying a failed post
                  </p>
                </div>
              </div>

              <Button onClick={savePostingRules} disabled={isSavingRules}>
                {isSavingRules ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Rules
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Meta API Setup Guide</CardTitle>
              <CardDescription>Follow these steps to connect your Facebook and Instagram accounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium">Create a Meta Developer App</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Go to{" "}
                      <a 
                        href="https://developers.facebook.com/apps" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        developers.facebook.com/apps <ExternalLink className="h-3 w-3" />
                      </a>{" "}
                      and create a new app. Choose "Business" type.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium">Add Facebook Login & Instagram API</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      In your app dashboard, add "Facebook Login for Business" and "Instagram Graph API" products.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium">Connect Your Facebook Page</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Link your Facebook Page to the app and grant the required permissions:
                    </p>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                      <li>pages_manage_posts</li>
                      <li>pages_read_engagement</li>
                      <li>pages_read_user_content</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    4
                  </div>
                  <div>
                    <h3 className="font-medium">Connect Instagram Business Account</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ensure your Instagram account is a Business or Creator account, and linked to your Facebook Page. Add permissions:
                    </p>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                      <li>instagram_basic</li>
                      <li>instagram_content_publish</li>
                      <li>instagram_manage_insights</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    5
                  </div>
                  <div>
                    <h3 className="font-medium">Generate Long-Lived Access Token</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      In the Graph API Explorer, generate a User Access Token, then exchange it for a long-lived token (valid for 60 days). Copy the Page Access Token.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    6
                  </div>
                  <div>
                    <h3 className="font-medium">Add Account Here</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Click "Add Account" in the Connected Accounts tab, enter your Page/Account ID and the access token.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Need Help?</h4>
                <p className="text-sm text-muted-foreground">
                  The current system works in placeholder mode without real Meta credentials. Posts are queued and marked as "published" locally, ready for when you connect your Meta accounts. You can view and manage all posts in the Social Posts section.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}