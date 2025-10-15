import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Shield, UserX, Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface UserWithStats {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  totalPages: number;
  publishedPages: number;
  totalViews: number;
  aiGenerated: number;
}

export default function UserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // @ts-ignore - user_roles table exists
      const { data: roles } = await (supabase.from('user_roles') as any).select('*');

      if (!roles) {
        setUsers([]);
        return;
      }

      // Get stats for each user
      const usersWithStats = await Promise.all(
        roles.map(async (role: any) => {
          // @ts-ignore - author_id column exists but types not regenerated yet
          const { data: pages } = await supabase
            .from('content_pages')
            .select('*')
            .eq('author_id', role.user_id);

          const totalViews = pages?.reduce((sum, page) => sum + (page.view_count || 0), 0) || 0;
          const publishedPages = pages?.filter(p => p.is_published).length || 0;
          // @ts-ignore - ai_generated column exists but types not regenerated yet
          const aiGenerated = pages?.filter((p: any) => p.ai_generated).length || 0;

          return {
            ...role,
            totalPages: pages?.length || 0,
            publishedPages,
            totalViews,
            aiGenerated
          };
        })
      );

      setUsers(usersWithStats);
    } catch (error: any) {
      toast({
        title: "Error Loading Users",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      // @ts-ignore
      const { error } = await (supabase.from('user_roles') as any)
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      await loadUsers();
      toast({ title: "User role updated successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'editor':
        return 'default';
      case 'freelancer':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-muted-foreground">Manage user roles and permissions</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Roles</CardTitle>
              <CardDescription>Assign roles to control access levels</CardDescription>
            </div>
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading users...</p>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No users with assigned roles yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Total Pages</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>AI Generated</TableHead>
                  <TableHead>Total Views</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-sm">{user.user_id.slice(0, 8)}...</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.totalPages}</TableCell>
                    <TableCell>{user.publishedPages}</TableCell>
                    <TableCell>
                      {user.aiGenerated > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {user.aiGenerated}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{user.totalViews.toLocaleString()}</TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(newRole) => updateUserRole(user.user_id, newRole)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="freelancer">Freelancer</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>Understanding access levels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="destructive">Admin</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Full access to all features including user management, settings, and monetization</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default">Editor</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Can manage all content, review freelancer submissions, and access analytics</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">Freelancer</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Can create and manage own content, use AI studio, view personal performance</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">User</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Basic access, can view public content only</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}