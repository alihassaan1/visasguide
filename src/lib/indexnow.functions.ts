import { createServerFn } from "@tanstack/react-start";

const INDEXNOW_KEY = "4e987242e9884f69b076157c7064eec3";
const SITE_HOST = "visas.guide";
const KEY_LOCATION = `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`;

type IndexNowResult = { success: boolean; submitted: number; error?: string };

// Submits site URLs to IndexNow (Bing, Yandex, etc.). Only paths on visas.guide are accepted.
export const submitToIndexNow = createServerFn({ method: "POST" })
  .inputValidator((data: { urls: string[] }) => {
    if (!data || !Array.isArray(data.urls) || data.urls.length === 0) {
      throw new Error("urls array is required");
    }
    const urls = data.urls
      .filter((u): u is string => typeof u === "string" && u.length > 0 && u.length < 2048)
      .slice(0, 1000);
    return { urls };
  })
  .handler(async ({ data }): Promise<IndexNowResult> => {
    const fullUrls = data.urls
      .map((url) => {
        if (url.startsWith("http")) return url;
        return `https://${SITE_HOST}${url.startsWith("/") ? "" : "/"}${url}`;
      })
      .filter((url) => {
        try {
          const host = new URL(url).hostname;
          return host === SITE_HOST || host === `www.${SITE_HOST}`;
        } catch {
          return false;
        }
      });

    if (fullUrls.length === 0) return { success: true, submitted: 0 };

    try {
      const response = await fetch("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: SITE_HOST,
          key: INDEXNOW_KEY,
          keyLocation: KEY_LOCATION,
          urlList: fullUrls,
        }),
      });
      if (response.status === 200 || response.status === 202) {
        return { success: true, submitted: fullUrls.length };
      }
      const errorText = await response.text();
      console.error(`IndexNow error: ${response.status} - ${errorText}`);
      return { success: false, submitted: 0, error: `Status ${response.status}` };
    } catch (error) {
      console.error(error);
      return { success: false, submitted: 0, error: "IndexNow unavailable" };
    }
  });
