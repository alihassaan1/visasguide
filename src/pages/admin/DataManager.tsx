import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, RefreshCw, FileText, Newspaper } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DataManager() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-3 sm:p-6 max-w-7xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Data Manager</h1>
        <p className="text-muted-foreground">Manage all content and database operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate('/admin')}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Content Pages</CardTitle>
                <CardDescription>Manage evergreen visa guides and SEO pages</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate('/admin')}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Newspaper className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>News Articles</CardTitle>
                <CardDescription>Manage news articles and RSS feeds</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate('/admin/ai-studio')}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>AI Content Studio</CardTitle>
                <CardDescription>Generate new content with AI</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate('/admin/dashboard')}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <RefreshCw className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>View site performance and statistics</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
