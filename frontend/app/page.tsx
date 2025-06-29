"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Mic, Settings } from "lucide-react";
import LandingPage from "@/components/landing-page";
import FileUpload from "@/components/file-upload";
import TextSelection from "@/components/text-selection";
import TTSEditor from "@/components/tts-editor";
import FileManager from "@/components/file-manager";
import { useAuth } from "@clerk/nextjs";

type ProcessedText = {
  original_text: {
    char_count: number;
    cost: number;
    text: string;
  };
  summarized_text: {
    char_count: number;
    cost: number;
    text: string;
  };
};

// Updated TTSRecommendation type to match the new response format
type TTSRecommendation = {
  line: string;
  config: {
    channelType: string;
    encodeAsBase64: boolean;
    format: string;
    multiNativeLocale: string;
    pitch: number;
    rate: number;
    sampleRate: number;
    speaker: string;
    style: string;
    text: string;
    variation: number;
    voiceId: string;
  };
  analysis: any;
  reasoning: any;
  selected_voice: string | null;
  success: boolean;
};

export default function Home() {
  const { getToken } = useAuth();
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    "landing" | "upload" | "select" | "edit" | "manage"
  >("landing");
  const [processedText, setProcessedText] = useState<ProcessedText | null>(
    null
  );
  const [selectedText, setSelectedText] = useState<string>("");
  const [ttsRecommendations, setTTSRecommendations] = useState<
    TTSRecommendation[]
  >([]);

  const handleGetStarted = () => {
    setCurrentStep("upload");
  };

  const handleFileProcessed = (data: ProcessedText) => {
    setProcessedText(data);
    setCurrentStep("select");
  };

  const handleTextSelected = async (text: string) => {
    setSelectedText(text);
    setIsLoadingConfigs(true);

    try {
      const authToken = await getToken();
      if (!authToken) {
        console.error("No Clerk token found.");
        return;
      }

      const response = await fetch(
        "https://sonus.onrender.com/api/tts/recommend-options",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ text }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Handle the new response format - extract sentence_configs if it exists
        let recommendations: TTSRecommendation[];

        if (data.sentence_configs && Array.isArray(data.sentence_configs)) {
          // Convert sentence_configs format to TTSRecommendation format
          recommendations = data.sentence_configs.map(
            (config: any, index: number) => ({
              line: config.text,
              config: {
                channelType: config.channelType,
                encodeAsBase64: config.encodeAsBase64,
                format: config.format,
                multiNativeLocale: config.multiNativeLocale,
                pitch: config.pitch,
                rate: config.rate,
                sampleRate: config.sampleRate,
                speaker: config.speaker,
                style: config.style,
                text: config.text,
                variation: config.variation,
                voiceId: config.voiceId,
              },
              analysis: null,
              reasoning: null,
              selected_voice: config.voiceId,
              success: true,
            })
          );
        } else if (Array.isArray(data)) {
          // Handle direct array format
          recommendations = data;
        } else {
          console.error("Unexpected response format:", data);
          return;
        }

        setTTSRecommendations(recommendations);
        setCurrentStep("edit");
      } else {
        console.error(
          "Failed to get TTS recommendations:",
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error getting TTS recommendations:", error);
    } finally {
      setIsLoadingConfigs(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "landing":
        return <LandingPage onGetStarted={handleGetStarted} />;
      case "upload":
        return <FileUpload onFileProcessed={handleFileProcessed} />;
      case "select":
        return processedText ? (
          <TextSelection
            processedText={processedText}
            onTextSelected={handleTextSelected}
          />
        ) : null;
      case "edit":
        return (
          <TTSEditor
            recommendations={ttsRecommendations}
            onRecommendationsChange={setTTSRecommendations}
          />
        );
      case "manage":
        return <FileManager />;
      default:
        return null;
    }
  };

  if (currentStep === "landing") {
    return renderCurrentStep();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint/10 via-white to-ocean/10">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          {isLoadingConfigs && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[hsl(var(--background)/0.8)] text-[hsl(var(--foreground))] backdrop-blur-sm">
              <div className="text-center">
                <svg
                  className="animate-spin h-8 w-8 text-[hsl(var(--primary))] mx-auto"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                  />
                </svg>
                <p className="mt-2 text-sm">Loading recommendations...</p>
              </div>
            </div>
          )}

          <h1 className="text-4xl font-bold text-navy mb-2">
            Text-to-Speech Studio
          </h1>
          <p className="text-lg text-gray-600">
            Upload, process, and convert your documents to high-quality audio
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <div className="flex justify-center space-x-4">
            <Button
              variant={currentStep === "upload" ? "default" : "outline"}
              onClick={() => setCurrentStep("upload")}
              className={`flex items-center space-x-2 ${
                currentStep === "upload"
                  ? "bg-coral hover:bg-coral/90 text-white"
                  : "border-coral text-coral hover:bg-coral hover:text-white"
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </Button>
            <Button
              variant={currentStep === "select" ? "default" : "outline"}
              onClick={() => setCurrentStep("select")}
              disabled={!processedText}
              className={`flex items-center space-x-2 ${
                currentStep === "select"
                  ? "bg-sunshine hover:bg-sunshine/90 text-navy"
                  : "border-sunshine text-sunshine hover:bg-sunshine hover:text-navy"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Select Text</span>
            </Button>
            <Button
              variant={currentStep === "edit" ? "default" : "outline"}
              onClick={() => setCurrentStep("edit")}
              disabled={ttsRecommendations.length === 0}
              className={`flex items-center space-x-2 ${
                currentStep === "edit"
                  ? "bg-mint hover:bg-mint/90 text-white"
                  : "border-mint text-mint hover:bg-mint hover:text-white"
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>Edit Audio</span>
            </Button>
            <Button
              variant={currentStep === "manage" ? "default" : "outline"}
              onClick={() => setCurrentStep("manage")}
              className={`flex items-center space-x-2 ${
                currentStep === "manage"
                  ? "bg-ocean hover:bg-ocean/90 text-white"
                  : "border-ocean text-ocean hover:bg-ocean hover:text-white"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Manage Files</span>
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">{renderCurrentStep()}</div>
      </div>
    </div>
  );
}
