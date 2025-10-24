"use client";

import React from "react";
import { EmailSubscription } from "@boostlly/features";
import { Card, CardContent, CardHeader, CardTitle } from "@boostlly/ui";
import { 
  Mail, 
  Bell, 
  Globe, 
  FileText, 
  Lightbulb, 
  Calendar,
  Check,
  Star,
  Users,
  TrendingUp
} from "lucide-react";

export default function NewsletterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Mail className="w-4 h-4" />
            Daily Motivation Newsletter
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Stay Motivated Every Day
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Get your daily dose of inspiration delivered straight to your inbox. Join thousands of people who start their day with motivation and purpose.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="border-0 shadow-lg text-center p-6">
            <Bell className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Daily Inspiration</h3>
            <p className="text-gray-600">
              Start each day with a carefully curated motivational quote to set the right tone for success.
            </p>
          </Card>

          <Card className="border-0 shadow-lg text-center p-6">
            <FileText className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Expert Articles</h3>
            <p className="text-gray-600">
              Access our library of motivational articles on discipline, productivity, and personal growth.
            </p>
          </Card>

          <Card className="border-0 shadow-lg text-center p-6">
            <Lightbulb className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Practical Tips</h3>
            <p className="text-gray-600">
              Get actionable advice and strategies to improve your daily habits and achieve your goals.
            </p>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">10,000+</div>
            <div className="text-gray-600">Active Subscribers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-2">95%</div>
            <div className="text-gray-600">Open Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">4.9/5</div>
            <div className="text-gray-600">User Rating</div>
          </div>
        </div>

        {/* Main Subscription Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div>
            <EmailSubscription 
              variant="default"
              showPreferences={true}
            />
          </div>
          
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  What You&apos;ll Get
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Daily Motivational Quotes</h4>
                    <p className="text-sm text-gray-600">Fresh, inspiring quotes every morning</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Weekly Articles</h4>
                    <p className="text-sm text-gray-600">In-depth articles on motivation and productivity</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Productivity Tips</h4>
                    <p className="text-sm text-gray-600">Actionable advice for better habits</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Flexible Frequency</h4>
                    <p className="text-sm text-gray-600">Choose daily, weekly, or monthly delivery</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Community Testimonials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 italic mb-2">
                    &ldquo;These daily quotes have completely transformed my morning routine. I feel more motivated and ready to tackle any challenge.&rdquo;
                  </p>
                  <p className="text-xs text-gray-500">- Sarah M.</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 italic mb-2">
                    &ldquo;The articles are incredibly insightful. I&apos;ve learned so much about building discipline and achieving my goals.&rdquo;
                  </p>
                  <p className="text-xs text-gray-500">- Michael R.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How often will I receive emails?</h3>
                <p className="text-gray-600">
                  You can choose to receive emails daily, weekly, or monthly. Most subscribers prefer daily delivery to start their day with motivation.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I unsubscribe anytime?</h3>
                <p className="text-gray-600">
                  Yes, absolutely! You can unsubscribe at any time with a single click. We respect your privacy and make it easy to opt out.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What format are the emails?</h3>
                <p className="text-gray-600">
                  You can choose between HTML (with beautiful formatting) or plain text. Both formats include the same inspiring content.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Is my email address safe?</h3>
                <p className="text-gray-600">
                  Yes, we take your privacy seriously. We never share your email address with third parties and use industry-standard security measures.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
          <CardContent className="text-center py-12">
            <Mail className="w-16 h-16 mx-auto mb-6 text-white/90" />
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Daily Routine?</h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Join thousands of people who start their day with motivation and purpose. Your journey to a more inspired life begins with a single click.
            </p>
            <div className="flex justify-center">
              <EmailSubscription variant="inline" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
