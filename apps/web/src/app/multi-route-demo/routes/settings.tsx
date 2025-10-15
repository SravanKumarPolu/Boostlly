"use client";

import React, { useState } from "react";

interface SettingsRouteProps {
  onLoad?: () => void;
}

export const SettingsRoute: React.FC<SettingsRouteProps> = ({ onLoad }) => {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    autoSave: true,
    language: "en",
    timezone: "UTC",
  });

  React.useEffect(() => {
    onLoad?.();
  }, [onLoad]);

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* General Settings */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              General Settings
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-700">Notifications</div>
                  <div className="text-sm text-gray-500">
                    Receive email notifications
                  </div>
                </div>
                <button
                  onClick={() =>
                    handleSettingChange(
                      "notifications",
                      !settings.notifications,
                    )
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications ? "bg-purple-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-700">Dark Mode</div>
                  <div className="text-sm text-gray-500">Use dark theme</div>
                </div>
                <button
                  onClick={() =>
                    handleSettingChange("darkMode", !settings.darkMode)
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.darkMode ? "bg-purple-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.darkMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-700">Auto Save</div>
                  <div className="text-sm text-gray-500">
                    Automatically save changes
                  </div>
                </div>
                <button
                  onClick={() =>
                    handleSettingChange("autoSave", !settings.autoSave)
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.autoSave ? "bg-purple-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.autoSave ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Language & Region
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) =>
                    handleSettingChange("language", e.target.value)
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) =>
                    handleSettingChange("timezone", e.target.value)
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern Time</option>
                  <option value="PST">Pacific Time</option>
                  <option value="GMT">Greenwich Mean Time</option>
                  <option value="CET">Central European Time</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Security
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div>
                  <div className="font-medium text-gray-700">
                    Two-Factor Authentication
                  </div>
                  <div className="text-sm text-gray-500">
                    Add an extra layer of security
                  </div>
                </div>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Enable
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div>
                  <div className="font-medium text-gray-700">Password</div>
                  <div className="text-sm text-gray-500">
                    Last changed 30 days ago
                  </div>
                </div>
                <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  Change
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div>
                  <div className="font-medium text-gray-700">API Keys</div>
                  <div className="text-sm text-gray-500">
                    Manage your API access
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Manage
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Data & Privacy
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-700">Data Export</div>
                  <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors">
                    Export
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  Download all your data
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-700">
                    Account Deletion
                  </div>
                  <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors">
                    Delete
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  Permanently delete your account
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Settings */}
      <div className="mt-8 flex justify-end space-x-4">
        <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          Save Changes
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center">
          <span className="text-gray-600 mr-2">⚙️</span>
          <span className="text-gray-800 font-medium">
            Settings route loaded successfully
          </span>
        </div>
        <div className="text-gray-600 text-sm mt-1">
          This settings panel was loaded on-demand using code splitting.
        </div>
      </div>
    </div>
  );
};
