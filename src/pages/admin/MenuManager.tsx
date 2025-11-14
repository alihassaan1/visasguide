import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, GripVertical } from "lucide-react";

interface MenuItem {
  label: string;
  url: string;
  order: number;
}

export default function MenuManager() {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'menu_items')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data?.setting_value && Array.isArray(data.setting_value)) {
        setMenuItems(data.setting_value as unknown as MenuItem[]);
      } else {
        // Set default menu items
        const defaultItems = [
          { label: "Countries", url: "/countries", order: 0 },
          { label: "Visa Search", url: "/visa-search", order: 1 },
          { label: "Guides", url: "/guides", order: 2 },
          { label: "Blog", url: "/blog", order: 3 },
          { label: "Passport Index Rankings", url: "/passport-index", order: 4 }
        ];
        setMenuItems(defaultItems);
      }
    } catch (error) {
      console.error('Error loading menu items:', error);
      toast({
        title: "Error",
        description: "Failed to load menu items",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveMenuItems = async () => {
    try {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('setting_key', 'menu_items')
        .single();

      if (existing) {
        const { error } = await supabase
          .from('site_settings')
          .update({ setting_value: menuItems as any })
          .eq('setting_key', 'menu_items');
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert({
            setting_key: 'menu_items',
            setting_value: menuItems as any,
          });
        
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Menu items saved successfully",
      });
    } catch (error) {
      console.error('Error saving menu items:', error);
      toast({
        title: "Error",
        description: "Failed to save menu items",
        variant: "destructive",
      });
    }
  };

  const addMenuItem = () => {
    setMenuItems([
      ...menuItems,
      { label: "", url: "", order: menuItems.length }
    ]);
  };

  const updateMenuItem = (index: number, field: keyof MenuItem, value: string | number) => {
    const updated = [...menuItems];
    updated[index] = { ...updated[index], [field]: value };
    setMenuItems(updated);
  };

  const removeMenuItem = (index: number) => {
    const updated = menuItems.filter((_, i) => i !== index);
    // Reorder remaining items
    updated.forEach((item, i) => item.order = i);
    setMenuItems(updated);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === menuItems.length - 1)
    ) {
      return;
    }

    const updated = [...menuItems];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    
    // Update order values
    updated.forEach((item, i) => item.order = i);
    setMenuItems(updated);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Menu Manager</h1>
        <p className="text-muted-foreground">
          Manage navigation menu items that appear in the header
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Navigation Menu Items</CardTitle>
          <CardDescription>
            Add, edit, or reorder menu items. Changes will appear in the main navigation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {menuItems.map((item, index) => (
            <div key={index} className="flex items-end gap-3 p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                  >
                    ▲
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === menuItems.length - 1}
                  >
                    ▼
                  </Button>
                </div>
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="flex-1 grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor={`label-${index}`}>Label</Label>
                  <Input
                    id={`label-${index}`}
                    placeholder="Menu Label"
                    value={item.label}
                    onChange={(e) => updateMenuItem(index, 'label', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`url-${index}`}>URL</Label>
                  <Input
                    id={`url-${index}`}
                    placeholder="/path"
                    value={item.url}
                    onChange={(e) => updateMenuItem(index, 'url', e.target.value)}
                  />
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeMenuItem(index)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={addMenuItem}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Menu Item
          </Button>

          <div className="flex justify-end pt-4">
            <Button onClick={saveMenuItems}>
              Save Menu Items
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
