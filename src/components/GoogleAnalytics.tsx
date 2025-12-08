import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsSettings {
  google_analytics_id: string;
  google_tag_manager_id: string;
  google_adsense_publisher_id: string;
  facebook_pixel_id: string;
  tiktok_pixel_id: string;
  linkedin_insight_tag: string;
  twitter_pixel_id: string;
  pinterest_tag_id: string;
  microsoft_clarity_id: string;
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
      
      if (!document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${gaId}"]`)) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(script);

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
      
      if (!document.querySelector(`script[src*="googletagmanager.com/gtm.js?id=${gtmId}"]`)) {
        const script = document.createElement('script');
        script.innerHTML = `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');
        `;
        document.head.appendChild(script);

        const noscript = document.createElement('noscript');
        noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
        document.body.insertBefore(noscript, document.body.firstChild);
        console.log('Google Tag Manager initialized:', gtmId);
      }
    }

    // Inject Facebook Pixel
    if (settings.facebook_pixel_id && settings.facebook_pixel_id.trim()) {
      const pixelId = settings.facebook_pixel_id.trim();
      
      if (!document.querySelector('script[data-fb-pixel]')) {
        const script = document.createElement('script');
        script.setAttribute('data-fb-pixel', 'true');
        script.innerHTML = `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `;
        document.head.appendChild(script);

        const noscript = document.createElement('noscript');
        noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>`;
        document.body.appendChild(noscript);
        console.log('Facebook Pixel initialized:', pixelId);
      }
    }

    // Inject TikTok Pixel
    if (settings.tiktok_pixel_id && settings.tiktok_pixel_id.trim()) {
      const tiktokId = settings.tiktok_pixel_id.trim();
      
      if (!document.querySelector('script[data-tiktok-pixel]')) {
        const script = document.createElement('script');
        script.setAttribute('data-tiktok-pixel', 'true');
        script.innerHTML = `
          !function (w, d, t) {
            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
            ttq.load('${tiktokId}');
            ttq.page();
          }(window, document, 'ttq');
        `;
        document.head.appendChild(script);
        console.log('TikTok Pixel initialized:', tiktokId);
      }
    }

    // Inject LinkedIn Insight Tag
    if (settings.linkedin_insight_tag && settings.linkedin_insight_tag.trim()) {
      const linkedinId = settings.linkedin_insight_tag.trim();
      
      if (!document.querySelector('script[data-linkedin-insight]')) {
        const script = document.createElement('script');
        script.setAttribute('data-linkedin-insight', 'true');
        script.innerHTML = `
          _linkedin_partner_id = "${linkedinId}";
          window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
          window._linkedin_data_partner_ids.push(_linkedin_partner_id);
          (function(l) {
            if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
            window.lintrk.q=[]}
            var s = document.getElementsByTagName("script")[0];
            var b = document.createElement("script");
            b.type = "text/javascript";b.async = true;
            b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
            s.parentNode.insertBefore(b, s);})(window.lintrk);
        `;
        document.head.appendChild(script);

        const noscript = document.createElement('noscript');
        noscript.innerHTML = `<img height="1" width="1" style="display:none;" alt="" src="https://px.ads.linkedin.com/collect/?pid=${linkedinId}&fmt=gif" />`;
        document.body.appendChild(noscript);
        console.log('LinkedIn Insight Tag initialized:', linkedinId);
      }
    }

    // Inject Twitter/X Pixel
    if (settings.twitter_pixel_id && settings.twitter_pixel_id.trim()) {
      const twitterId = settings.twitter_pixel_id.trim();
      
      if (!document.querySelector('script[data-twitter-pixel]')) {
        const script = document.createElement('script');
        script.setAttribute('data-twitter-pixel', 'true');
        script.innerHTML = `
          !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
          },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
          a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
          twq('config','${twitterId}');
        `;
        document.head.appendChild(script);
        console.log('Twitter/X Pixel initialized:', twitterId);
      }
    }

    // Inject Pinterest Tag
    if (settings.pinterest_tag_id && settings.pinterest_tag_id.trim()) {
      const pinterestId = settings.pinterest_tag_id.trim();
      
      if (!document.querySelector('script[data-pinterest-tag]')) {
        const script = document.createElement('script');
        script.setAttribute('data-pinterest-tag', 'true');
        script.innerHTML = `
          !function(e){if(!window.pintrk){window.pintrk = function () {
          window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var
          n=window.pintrk;n.queue=[],n.version="3.0";var
          t=document.createElement("script");t.async=!0,t.src=e;var
          r=document.getElementsByTagName("script")[0];
          r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
          pintrk('load', '${pinterestId}');
          pintrk('page');
        `;
        document.head.appendChild(script);

        const noscript = document.createElement('noscript');
        noscript.innerHTML = `<img height="1" width="1" style="display:none;" alt="" src="https://ct.pinterest.com/v3/?event=init&tid=${pinterestId}&noscript=1" />`;
        document.body.appendChild(noscript);
        console.log('Pinterest Tag initialized:', pinterestId);
      }
    }

    // Inject Microsoft Clarity - always use hardcoded ID as primary, fallback to settings
    const clarityId = settings.microsoft_clarity_id?.trim() || 'ug4ihlhgw9';
    
    if (!document.querySelector('script[data-clarity]')) {
      const script = document.createElement('script');
      script.setAttribute('data-clarity', 'true');
      script.innerHTML = `
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${clarityId}");
      `;
      document.head.appendChild(script);
      console.log('Microsoft Clarity initialized:', clarityId);
    }

    // Inject Google AdSense Auto-Ads
    if (settings.google_adsense_publisher_id && settings.google_adsense_publisher_id.startsWith('ca-pub-')) {
      const publisherId = settings.google_adsense_publisher_id.trim();
      
      if (!document.querySelector('script[data-adsense]')) {
        const script = document.createElement('script');
        script.async = true;
        script.setAttribute('data-adsense', 'true');
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
        console.log('Google AdSense initialized:', publisherId);
      }
    }
  }, [settings]);

  return null;
};

export default GoogleAnalytics;
