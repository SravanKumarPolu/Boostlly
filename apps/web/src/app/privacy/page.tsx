"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@boostlly/ui";
import { Shield, Eye, Database, Lock, Users, Mail, Calendar } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Shield className="w-4 h-4" />
            Privacy-First Design
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your privacy is our priority. Learn how we protect your data and give you control.
          </p>
        </div>

        <div className="space-y-8">
          {/* Privacy Overview */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Eye className="w-6 h-6 text-purple-600" />
                Privacy Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg text-gray-900">What We Collect</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Your saved quotes and collections</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>App preferences and settings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Usage analytics (optional)</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg text-gray-900">What We Don&apos;t Collect</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>Personal identification information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>Email addresses or contact details</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>Browsing history or external data</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Storage */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Database className="w-6 h-6 text-blue-600" />
                Data Storage & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Local Storage Explanation */}
              <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-600" />
                  Local Storage Explained
                </h3>
                <p className="text-gray-700 mb-4">
                  Boostlly uses <strong>local storage</strong> (also called browser storage) to save all your data directly on your device. 
                  This means your quotes, collections, settings, and preferences are stored in your browser&apos;s storage space, 
                  not on our servers or in the cloud.
                </p>
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-lg border border-blue-100">
                    <h4 className="font-semibold text-gray-900 mb-2">What is Local Storage?</h4>
                    <p className="text-sm text-gray-700 mb-2">
                      Local storage is a browser feature that allows websites to store data on your device. 
                      It&apos;s similar to saving a file on your computer, but it&apos;s managed by your browser.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                      <li>Data is stored in your browser&apos;s storage space (typically 5-10MB per website)</li>
                      <li>Data persists even after you close the browser</li>
                      <li>Data is specific to each browser and device</li>
                      <li>Data is only accessible by the website that created it</li>
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-blue-100">
                    <h4 className="font-semibold text-gray-900 mb-2">What Data is Stored Locally?</h4>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span><strong>Saved Quotes:</strong> Quotes you&apos;ve saved for later reading</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span><strong>Collections:</strong> Your custom quote collections and categories</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span><strong>Settings:</strong> Theme preferences, notification settings, and app configuration</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span><strong>Reading History:</strong> Quotes you&apos;ve viewed (for statistics and recommendations)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span><strong>Streak Data:</strong> Your reading streaks and progress tracking</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span><strong>User Preferences:</strong> Language, font size, and accessibility settings</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-blue-100">
                    <h4 className="font-semibold text-gray-900 mb-2">Why Local Storage?</h4>
                    <p className="text-sm text-gray-700 mb-2">
                      We chose local storage for several important reasons:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                      <li><strong>Privacy:</strong> Your data never leaves your device, so we can&apos;t access it</li>
                      <li><strong>Speed:</strong> Data loads instantly since it&apos;s stored on your device</li>
                      <li><strong>Offline Access:</strong> You can use the app even without an internet connection</li>
                      <li><strong>No Account Required:</strong> No need to create an account or share personal information</li>
                      <li><strong>Full Control:</strong> You can delete your data anytime by clearing browser storage</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Storage Security */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-2">Browser Security</h3>
                  <p className="text-sm text-gray-600">
                    Your browser provides built-in security for local storage. Data is isolated per website and protected by browser security policies.
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-2">No Tracking</h3>
                  <p className="text-sm text-gray-600">
                    We don&apos;t track you across websites, use cookies for tracking, or share data with third parties. 
                    Your activity stays private.
                  </p>
                </div>
                <div className="text-center p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <Eye className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-2">No Server Access</h3>
                  <p className="text-sm text-gray-600">
                    Since data is stored locally, we cannot access, read, or modify your data. 
                    It&apos;s completely under your control.
                  </p>
                </div>
              </div>

              {/* Storage Limits */}
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h3 className="font-semibold text-gray-900 mb-2">Storage Limits</h3>
                <p className="text-sm text-gray-700">
                  Most browsers allow 5-10MB of local storage per website. Boostlly typically uses less than 1MB for most users. 
                  If you reach the limit, you can export and delete old data to free up space.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Users className="w-6 h-6 text-green-600" />
                Your Rights & Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-3">Data Control</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Export your data anytime</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Delete all data instantly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Opt-out of analytics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Control data sharing</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-3">Privacy Settings</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Privacy mode (default)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Disable data collection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Offline-first operation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Local storage only</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Mail className="w-6 h-6 text-indigo-600" />
                Contact & Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-3">Questions?</h3>
                  <p className="text-gray-600 mb-4">
                    Have questions about your privacy or data? We&apos;re here to help.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-indigo-600" />
                      <span className="text-gray-600">privacy@boostlly.app</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      <span className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-3">Report Issues</h3>
                  <p className="text-gray-600 mb-4">
                    Found a privacy concern? Report it immediately.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-red-600" />
                      <span className="text-gray-600">security@boostlly.app</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-600" />
                      <span className="text-gray-600">GitHub Issues</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How to Delete All Data */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Database className="w-6 h-6 text-red-600" />
                How to Delete All Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                You have complete control over your data. Here&apos;s how to delete everything:
              </p>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Option 1: Delete from Settings</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 ml-2">
                    <li>Go to Settings in the app</li>
                    <li>Scroll to &quot;Privacy &amp; Data&quot; section</li>
                    <li>Click &quot;Delete All Data&quot;</li>
                    <li>Confirm the deletion</li>
                  </ol>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Option 2: Browser Storage</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Since all data is stored locally in your browser, you can clear it:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-2">
                    <li><strong>Chrome/Edge:</strong> Settings → Privacy → Clear browsing data → Select &quot;Local storage&quot; → Clear</li>
                    <li><strong>Firefox:</strong> Settings → Privacy → Clear Data → Select &quot;Site Data&quot; → Clear</li>
                    <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data → Remove Boostlly</li>
                  </ul>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Option 3: Uninstall Extension</h3>
                  <p className="text-sm text-gray-600">
                    If using the browser extension, uninstalling it will remove all extension data. 
                    Note: This doesn&apos;t affect web app data stored in your browser.
                  </p>
                </div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Once deleted, your data cannot be recovered. 
                  Make sure to export any quotes or collections you want to keep before deleting.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Legal Information */}
          <Card className="border-0 shadow-lg bg-gray-50">
            <CardHeader>
              <CardTitle className="text-xl text-gray-700">Legal Information</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <p>
                This privacy policy is effective as of {new Date().toLocaleDateString()} and applies to all users of Boostlly.
              </p>
              <p>
                We may update this policy from time to time. We will notify users of any material changes.
              </p>
              <p>
                By using Boostlly, you agree to the terms outlined in this privacy policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
