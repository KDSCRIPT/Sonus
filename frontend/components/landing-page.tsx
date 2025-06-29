"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Upload,
  Mic,
  Settings,
  Zap,
  Shield,
  Globe,
  Headphones,
} from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-ocean to-mint">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-navy/90 to-ocean/90" />
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Transform Text to
              <span className="text-sunshine block mt-2">Natural Speech</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              Upload your documents and convert them to high-quality audio with
              AI-powered voice recommendations. Perfect for accessibility,
              learning, and content creation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={onGetStarted}
                size="lg"
                className="bg-coral hover:bg-coral/90 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started Free
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-navy px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 bg-transparent"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-navy mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to create professional-quality audio from your
              text documents
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-2 border-mint/20 hover:border-mint transition-all duration-300 hover:shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-mint/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-mint" />
                </div>
                <CardTitle className="text-navy">Smart Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Upload DOCX, PDF, and TXT files. Our AI automatically
                  processes and optimizes your content for speech conversion.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-sunshine/20 hover:border-sunshine transition-all duration-300 hover:shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-sunshine/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-sunshine" />
                </div>
                <CardTitle className="text-navy">AI Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Get intelligent voice and style recommendations based on your
                  content type and target audience.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-coral/20 hover:border-coral transition-all duration-300 hover:shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mic className="w-8 h-8 text-coral" />
                </div>
                <CardTitle className="text-navy">Voice Control</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Fine-tune every aspect of your audio with advanced controls
                  for pitch, speed, style, and emotion.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-ocean/20 hover:border-ocean transition-all duration-300 hover:shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-ocean/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-ocean" />
                </div>
                <CardTitle className="text-navy">File Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Organize your projects with folders, export in multiple
                  formats, and manage your audio library efficiently.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 bg-gradient-to-r from-mint/5 to-ocean/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-navy mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transform your documents to audio in just four simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-coral rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-navy mb-3">
                Upload Document
              </h3>
              <p className="text-gray-600">
                Upload your DOCX, PDF, or TXT file to get started
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-sunshine rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-navy mb-3">
                Choose Text
              </h3>
              <p className="text-gray-600">
                Select between original or AI-summarized version
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-mint rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-navy mb-3">
                Customize Audio
              </h3>
              <p className="text-gray-600">
                Fine-tune voice settings with AI recommendations
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-ocean rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                4
              </div>
              <h3 className="text-xl font-semibold text-navy mb-3">
                Export & Share
              </h3>
              <p className="text-gray-600">
                Download your audio files and organize in folders
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-navy mb-6">
                Why Choose Our Platform?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-mint rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-navy mb-2">
                      Enterprise Security
                    </h3>
                    <p className="text-gray-600">
                      Your documents are processed securely with
                      enterprise-grade encryption and privacy protection.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-coral rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Globe className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-navy mb-2">
                      Multiple Languages
                    </h3>
                    <p className="text-gray-600">
                      Support for dozens of languages and regional accents to
                      reach global audiences.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-sunshine rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Headphones className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-navy mb-2">
                      Studio Quality
                    </h3>
                    <p className="text-gray-600">
                      Professional-grade audio output suitable for podcasts,
                      audiobooks, and presentations.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-mint/10 to-ocean/10 rounded-3xl p-8">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-coral to-sunshine rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mic className="w-16 h-16 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-navy mb-4">
                  Ready to Get Started?
                </h3>
                <p className="text-gray-600 mb-6">
                  Join thousands of users who trust our platform for their
                  text-to-speech needs.
                </p>
                <Button
                  onClick={onGetStarted}
                  size="lg"
                  className="bg-navy hover:bg-navy/90 text-white px-8 py-3 rounded-full"
                >
                  Start Converting Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-navy text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Text-to-Speech Studio</h3>
            <p className="text-white/70 mb-6">
              Transform your documents into natural, engaging audio content
            </p>
            <div className="flex justify-center space-x-6">
              <Button
                variant="ghost"
                className="text-white hover:text-sunshine"
              >
                Privacy Policy
              </Button>
              <Button
                variant="ghost"
                className="text-white hover:text-sunshine"
              >
                Terms of Service
              </Button>
              <Button
                variant="ghost"
                className="text-white hover:text-sunshine"
              >
                Contact Us
              </Button>
            </div>
            <div className="mt-8 pt-8 border-t border-white/20">
              <p className="text-white/50">
                © 2024 Text-to-Speech Studio. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
