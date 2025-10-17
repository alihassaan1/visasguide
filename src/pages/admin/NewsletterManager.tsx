import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, Users, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function NewsletterManager() {
  const { toast } = useToast();
  const [campaignSubject, setCampaignSubject] = useState("");
  const [campaignContent, setCampaignContent] = useState("");
  const [sendingCampaign, setSendingCampaign] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: subscribers, isLoading, refetch } = useQuery({
    queryKey: ["newsletter-subscribers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("subscribed_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleSendCampaign = async () => {
    if (!campaignSubject || !campaignContent) {
      toast({
        title: "Missing Information",
        description: "Please provide both subject and content for the campaign.",
        variant: "destructive",
      });
      return;
    }

    setSendingCampaign(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-campaign-email", {
        body: {
          subject: campaignSubject,
          content: campaignContent,
        },
      });

      if (error) throw error;

      toast({
        title: "Campaign Sent Successfully",
        description: `Sent to ${data.successful} subscribers. ${data.failed} failed.`,
      });

      setCampaignSubject("");
      setCampaignContent("");
      setDialogOpen(false);
    } catch (error: any) {
      console.error("Campaign error:", error);
      toast({
        title: "Campaign Failed",
        description: error.message || "Failed to send campaign emails.",
        variant: "destructive",
      });
    } finally {
      setSendingCampaign(false);
    }
  };

  const activeSubscribers = subscribers?.filter((s) => s.is_active) || [];
  const totalSubscribers = subscribers?.length || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Newsletter Management</h1>
          <p className="text-muted-foreground">Manage subscribers and send email campaigns</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Send className="mr-2 h-4 w-4" />
              Send Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send Email Campaign</DialogTitle>
              <DialogDescription>
                Send a campaign email to all {activeSubscribers.length} active subscribers. Use {"{name}"} to personalize with subscriber's name.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  placeholder="Weekly Visa Updates - New Requirements for Schengen"
                  value={campaignSubject}
                  onChange={(e) => setCampaignSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Email Content (HTML supported)</Label>
                <Textarea
                  id="content"
                  placeholder="Hi {name},&#10;&#10;Here are this week's important visa updates...&#10;&#10;Use HTML for formatting: <strong>bold</strong>, <a href='url'>links</a>, etc."
                  value={campaignContent}
                  onChange={(e) => setCampaignContent(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={sendingCampaign}>
                Cancel
              </Button>
              <Button onClick={handleSendCampaign} disabled={sendingCampaign}>
                {sendingCampaign ? "Sending..." : `Send to ${activeSubscribers.length} Subscribers`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubscribers}</div>
            <p className="text-xs text-muted-foreground">
              {activeSubscribers.length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscribers.length}</div>
            <p className="text-xs text-muted-foreground">
              {totalSubscribers > 0 ? Math.round((activeSubscribers.length / totalSubscribers) * 100) : 0}% active rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscribers?.filter((s) => {
                const subDate = new Date(s.subscribed_at);
                const now = new Date();
                return subDate.getMonth() === now.getMonth() && subDate.getFullYear() === now.getFullYear();
              }).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">New subscribers</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Subscribers</CardTitle>
          <CardDescription>Manage your newsletter subscriber list</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading subscribers...</div>
          ) : !subscribers || subscribers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No subscribers yet</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Country of Interest</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscribed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell className="font-medium">{subscriber.name}</TableCell>
                      <TableCell>{subscriber.email}</TableCell>
                      <TableCell>{subscriber.country_of_interest || "-"}</TableCell>
                      <TableCell>
                        {subscriber.is_active ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(subscriber.subscribed_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
