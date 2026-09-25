import { db } from "@/db/client";
import { settings } from "@/db/schema";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const rows = await db.select().from(settings).orderBy(settings.key);

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-white text-2xl font-semibold">Invoice Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Configure invoice details, tax rates, and bank information.</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded p-6">
        <SettingsClient rows={rows} />
      </div>
    </div>
  );
}
