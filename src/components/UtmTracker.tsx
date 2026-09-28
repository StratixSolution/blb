"use client";

import { useEffect } from "react";
import { captureAndStoreAttribution } from "@/lib/utmCapture";

export function UtmTracker() {
  useEffect(() => {
    captureAndStoreAttribution();
  }, []);
  return null;
}
