import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  BarChart3,
  Share2,
  Eye,
  RefreshCw
} from 'lucide-react';

interface AnalyticsSettings {
  google_analytics_id: string;
  google_tag_manager_id: string;
  facebook_pixel_id: string;
  tiktok_pixel_id: string;
  linkedin_insight_tag: string;
  twitter_pixel_id: string;
  pinterest_tag_id: string;
  microsoft_clarity_id: string;
}

interface PixelConfig {
  key: keyof AnalyticsSettings;
  name: string;
  icon: string;
  dashboardUrl: string;
  category: 'google' | 'social' | 'analytics';
  color: string;
}

const PIXEL_CONFIGS: PixelConfig[] = [
  {
    key: 'google_analytics_id',
    name: 'Google Analytics 4',
    icon: '📊',
    dashboardUrl: 'https://analytics.google.com/',
    category: 'google',
    color: 'bg-orange-500'
  },
  {
    key: 'google_tag_manager_id',
    name: 'Google Tag Manager',
    icon: '🏷️',
    dashboardUrl: 'https://tagmanager.google.com/',
    category: 'google',
    color: 'bg-blue-500'
  },
  {
    key: 'facebook_pixel_id',
    name: 'Facebook Pixel',
    icon: '📘',
    dashboardUrl: 'https://business.facebook.com/events_manager',
    category: 'social',
    color: 'bg-blue-600'
  },
  {
    key: 'tiktok_pixel_id',
    name: 'TikTok Pixel',
    icon: '🎵',
    dashboardUrl: 'https://ads.tiktok.com/i18n/events_manager/',
    category: 'social',
    color: 'bg-pink-500'
  },
  {
    key: 'twitter_pixel_id',
    name: 'Twitter/X Pixel',
    icon: '🐦',
    dashboardUrl: 'https://ads.twitter.com/',
    category: 'social',
    color: 'bg-sky-500'
  },
  {
    key: 'linkedin_insight_tag',
    name: 'LinkedIn Insight Tag',
    icon: '💼',
    dashboardUrl: 'https://www.linkedin.com/campaignmanager/',
    category: 'social',
    color: 'bg-blue-700'
  },
  {
    key: 'pinterest_tag_id',
    name: 'Pinterest Tag',
    icon: '📌',
    dashboardUrl: 'https://ads.pinterest.com/',
    category: 'social',
    color: 'bg-red-500'
  },
  {
    key: 'microsoft_clarity_id',
    name: 'Microsoft Clarity',
    icon: '🔍',
    dashboardUrl: 'https://clarity.microsoft.com/',
    category: 'analytics',
    color: 'bg-cyan-500'
  }
];

export const PixelStatusDashboard = () => {
  const [settings, setSettings] = useState<AnalyticsSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'analytics_settings')
        .maybeSingle();

      if (data?.setting_value) {
        setSettings(data.setting_value as unknown as AnalyticsSettings);
      } else {
        setSettings({
          google_analytics_id: '',
          google_tag_manager_id: '',
          facebook_pixel_id: '',
          tiktok_pixel_id: '',
          linkedin_insight_tag: '',
          twitter_pixel_id: '',
          pinterest_tag_id: '',
          microsoft_clarity_id: ''
        });
      }
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching pixel settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const isConfigured = (key: keyof AnalyticsSettings): boolean => {
    return !!(settings && settings[key] && settings[key].trim());
  };

  const activeCount = PIXEL_CONFIGS.filter(p => isConfigured(p.key)).length;
  const totalCount = PIXEL_CONFIGS.length;

  const googlePixels = PIXEL_CONFIGS.filter(p => p.category === 'google');
  const socialPixels = PIXEL_CONFIGS.filter(p => p.category === 'social');
  const analyticsPixels = PIXEL_CONFIGS.filter(p => p.category === 'analytics');

  const renderPixelCard = (pixel: PixelConfig) => {
    const configured = isConfigured(pixel.key);
    return (
      <div
        key={pixel.key}
        className={`flex items-center justify-between p-3 rounded-lg border ${
          configured 
            ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' 
            : 'bg-muted/50 border-border'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{pixel.icon}</span>
          <div>
            <p className={`font-medium text-sm ${configured ? 'text-foreground' : 'text-muted-foreground'}`}>
              {pixel.name}
            </p>
            {configured && settings && (
              <p className="text-xs text-muted-foreground font-mono truncate max-w-[120px]">
                {settings[pixel.key].substring(0, 12)}...
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {configured ? (
            <>
              <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => window.open(pixel.dashboardUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Badge variant="secondary" className="text-muted-foreground">
              <XCircle className="h-3 w-3 mr-1" />
              Not Set
            </Badge>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Pixel Status Dashboard
            </CardTitle>
            <CardDescription>
              Overview of all tracking pixels and their configuration status
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{activeCount}/{totalCount}</p>
              <p className="text-xs text-muted-foreground">Pixels Active</p>
            </div>
            <Button size="icon" variant="outline" onClick={fetchSettings}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Configuration Progress</span>
            <span className="font-medium">{Math.round((activeCount / totalCount) * 100)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${(activeCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        {/* Google Analytics Section */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-orange-500" />
            Google Analytics
          </h4>
          <div className="grid gap-2">
            {googlePixels.map(renderPixelCard)}
          </div>
        </div>

        {/* Social Media Pixels Section */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Share2 className="h-4 w-4 text-blue-500" />
            Social Media Pixels
          </h4>
          <div className="grid gap-2">
            {socialPixels.map(renderPixelCard)}
          </div>
        </div>

        {/* Behavior Analytics Section */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Eye className="h-4 w-4 text-cyan-500" />
            Behavior Analytics
          </h4>
          <div className="grid gap-2">
            {analyticsPixels.map(renderPixelCard)}
          </div>
        </div>

        {/* Last Refresh */}
        <p className="text-xs text-muted-foreground text-center pt-2">
          Last refreshed: {lastRefresh.toLocaleTimeString()}
        </p>
      </CardContent>
    </Card>
  );
};
