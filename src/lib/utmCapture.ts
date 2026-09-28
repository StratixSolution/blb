const STORAGE_KEY = "blb_attribution";
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days, same as WooCommerce

const SEARCH_ENGINES = ["google", "bing", "yahoo", "duckduckgo", "baidu", "yandex"];

export interface Attribution {
  sourceType: "utm" | "organic" | "referral" | "typein";
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  capturedAt: number;
}

function getReferrerHostname(): string | null {
  try {
    const ref = document.referrer;
    if (!ref) return null;
    return new URL(ref).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function deriveAttribution(): Attribution {
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source");
  const utmMedium = params.get("utm_medium");
  const utmCampaign = params.get("utm_campaign");

  if (utmSource) {
    return { sourceType: "utm", utmSource, utmMedium, utmCampaign, capturedAt: Date.now() };
  }

  const referrer = getReferrerHostname();
  if (!referrer) {
    return { sourceType: "typein", utmSource: null, utmMedium: null, utmCampaign: null, capturedAt: Date.now() };
  }

  const isSearchEngine = SEARCH_ENGINES.some((se) => referrer.includes(se));
  if (isSearchEngine) {
    const engine = SEARCH_ENGINES.find((se) => referrer.includes(se)) ?? referrer;
    return { sourceType: "organic", utmSource: engine, utmMedium: null, utmCampaign: null, capturedAt: Date.now() };
  }

  return { sourceType: "referral", utmSource: referrer, utmMedium: null, utmCampaign: null, capturedAt: Date.now() };
}

export function captureAndStoreAttribution(): void {
  try {
    const params = new URLSearchParams(window.location.search);
    const hasUtm = params.has("utm_source") || params.has("utm_medium") || params.has("utm_campaign");
    const existing = getStoredAttribution();

    // Only overwrite if there are fresh UTM params, or nothing stored yet
    if (!hasUtm && existing) return;

    const attribution = deriveAttribution();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // localStorage may be blocked in some browsers
  }
}

export function getStoredAttribution(): Attribution | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: Attribution = JSON.parse(raw);
    if (Date.now() - parsed.capturedAt > TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
