"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@boostlly/ui";
import { Heart, Users, Target, Zap, Shield, Globe, Code, Sparkles } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Heart className="w-4 h-4" />
            Made with Love
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            About Boostlly
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We believe that small moments of inspiration can create big changes in your life. 
            Boostlly is designed to be your daily companion for motivation, growth, and positive thinking.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Target className="w-6 h-6 text-indigo-600" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 leading-relaxed">
                To democratize access to daily motivation and inspiration through technology. 
                We believe everyone deserves access to uplifting content that can transform their mindset and drive positive change.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600">Make motivation accessible to everyone</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600">Respect user privacy and data ownership</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600">Create technology that serves human well-being</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Zap className="w-6 h-6 text-purple-600" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 leading-relaxed">
                A world where technology amplifies human potential rather than replacing human connection. 
                We envision a future where daily inspiration is seamlessly integrated into people&apos;s lives.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600">Technology that enhances human flourishing</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600">Privacy-first design as the standard</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600">Accessible motivation for all</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Core Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg text-center p-6">
              <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Privacy First</h3>
              <p className="text-gray-600">
                Your data belongs to you. We design with privacy as the default, not an afterthought.
              </p>
            </Card>

            <Card className="border-0 shadow-lg text-center p-6">
              <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">User-Centric</h3>
              <p className="text-gray-600">
                Every feature is designed with real user needs in mind, not corporate interests.
              </p>
            </Card>

            <Card className="border-0 shadow-lg text-center p-6">
              <Globe className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Accessibility</h3>
              <p className="text-gray-600">
                Motivation should be accessible to everyone, regardless of ability or background.
              </p>
            </Card>

            <Card className="border-0 shadow-lg text-center p-6">
              <Code className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Open Source</h3>
              <p className="text-gray-600">
                We believe in transparency and community-driven development.
              </p>
            </Card>

            <Card className="border-0 shadow-lg text-center p-6">
              <Heart className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Human-Centered</h3>
              <p className="text-gray-600">
                Technology should serve human well-being, not the other way around.
              </p>
            </Card>

            <Card className="border-0 shadow-lg text-center p-6">
              <Sparkles className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Innovation</h3>
              <p className="text-gray-600">
                We continuously explore new ways to deliver meaningful inspiration.
              </p>
            </Card>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Built With Modern Technology</h2>
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Technology Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">R</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">React</h3>
                  <p className="text-sm text-gray-600">Modern UI framework</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="w-12 h-12 bg-green-600 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">N</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Next.js</h3>
                  <p className="text-sm text-gray-600">Full-stack framework</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">T</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">TypeScript</h3>
                  <p className="text-sm text-gray-600">Type-safe development</p>
                </div>
                <div className="text-center p-4 bg-cyan-50 rounded-lg">
                  <div className="w-12 h-12 bg-cyan-600 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">T</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Tailwind</h3>
                  <p className="text-sm text-gray-600">Utility-first CSS</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Meet the Team</h2>
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center">The Boostlly Team</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">B</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">The Boostlly Team</h3>
                  <p className="text-gray-600 mb-4">
                    A passionate group of developers, designers, and product managers who believe in the power of daily inspiration.
                  </p>
                  <div className="flex justify-center gap-4 text-sm text-gray-500">
                    <span>• Developers</span>
                    <span>• Designers</span>
                    <span>• Product Managers</span>
                    <span>• Community Contributors</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-white">Get in Touch</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-indigo-100">
              Have questions, feedback, or want to contribute? We&apos;d love to hear from you!
            </p>
            <div className="flex justify-center gap-6">
              <a 
                href="mailto:hello@boostlly.app" 
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                <Heart className="w-4 h-4" />
                hello@boostlly.app
              </a>
              <a 
                href="https://github.com/yourusername/boostlly" 
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                <Code className="w-4 h-4" />
                GitHub
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
