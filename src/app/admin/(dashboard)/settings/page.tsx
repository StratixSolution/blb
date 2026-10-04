import { db } from "@/db/client";
import { settings } from "@/db/schema";
import { SettingsClient } from "./SettingsClient";
import { ChangePassword } from "./ChangePassword";

export default async function SettingsPage() {
  const rows = await db.select().from(settings).orderBy(settings.key);

  return (
    <div className="p-8 max-w-4xl space-y-8">
      <div>
        <div className="mb-8">
          <h1 className="text-white text-2xl font-semibold">Invoice Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Configure invoice details, tax rates, and bank information.</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded p-6">
          <SettingsClient rows={rows} />
        </div>
      </div>

      <div>
        <div className="mb-4">
          <h2 className="text-white text-xl font-semibold">Admin Password</h2>
          <p className="text-gray-500 text-sm mt-1">Change the password used to sign in to this dashboard.</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded p-6">
          <ChangePassword />
        </div>
      </div>
    </div>
  );
}
