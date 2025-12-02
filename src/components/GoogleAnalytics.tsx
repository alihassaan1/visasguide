import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsSettings {
  google_analytics_id: string;
  google_tag_manager_id: string;
}

const GoogleAnalytics = () => {
  const [settings, setSettings] = useState<AnalyticsSettings | null>(null);

  useEffect(() => {
    const fetchAnalyticsSettings = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'analytics_settings')
        .single();

      if (data?.setting_value) {
        setSettings(data.setting_value as unknown as AnalyticsSettings);
      }
    };

    fetchAnalyticsSettings();
  }, []);

  useEffect(() => {
    if (!settings) return;

    // Inject Google Analytics (GA4)
    if (settings.google_analytics_id && settings.google_analytics_id.startsWith('G-')) {
      const gaId = settings.google_analytics_id;
      
      // Check if script already exists
      if (!document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${gaId}"]`)) {
        // Create and inject the GA script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(script);

        // Initialize gtag
        const initScript = document.createElement('script');
        initScript.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `;
        document.head.appendChild(initScript);

        console.log('Google Analytics initialized:', gaId);
      }
    }

    // Inject Google Tag Manager
    if (settings.google_tag_manager_id && settings.google_tag_manager_id.startsWith('GTM-')) {
      const gtmId = settings.google_tag_manager_id;
      
      // Check if GTM script already exists
      if (!document.querySelector(`script[src*="googletagmanager.com/gtm.js?id=${gtmId}"]`)) {
        // Create and inject GTM script
        const script = document.createElement('script');
        script.innerHTML = `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');
        `;
        document.head.appendChild(script);

        // Add noscript fallback to body
        const noscript = document.createElement('noscript');
        noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
        document.body.insertBefore(noscript, document.body.firstChild);

        console.log('Google Tag Manager initialized:', gtmId);
      }
    }
  }, [settings]);

  return null;
};

export default GoogleAnalytics;
