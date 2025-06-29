"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, DollarSign, BarChart3, ArrowRight } from "lucide-react";

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

interface TextSelectionProps {
  processedText: ProcessedText;
  onTextSelected: (text: string) => void;
}

export default function TextSelection({
  processedText,
  onTextSelected,
}: TextSelectionProps) {
  const [selectedOption, setSelectedOption] = useState<
    "original" | "summarized" | null
  >(null);

  const handleProceed = () => {
    if (selectedOption) {
      const text =
        selectedOption === "original"
          ? processedText.original_text.text
          : processedText.summarized_text.text;
      onTextSelected(text);
    }
  };

  const reductionPercentage = Math.round(
    ((processedText.original_text.char_count -
      processedText.summarized_text.char_count) /
      processedText.original_text.char_count) *
      100
  );

  const costSavings =
    processedText.original_text.cost - processedText.summarized_text.cost;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Your Text Version</h2>
        <p className="text-gray-600">
          Select which version of your text you'd like to convert to audio
        </p>
      </div>

      {/* Comparison Stats */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">Size Reduction</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {reductionPercentage}%
              </div>
              <div className="text-sm text-gray-600">Smaller text size</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="font-semibold">Cost Savings</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                ${costSavings.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Using summarized text</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <span className="font-semibold">Character Difference</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {(
                  processedText.original_text.char_count -
                  processedText.summarized_text.char_count
                ).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Characters saved</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Text Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Text */}
        <Card
          className={`cursor-pointer transition-all ${
            selectedOption === "original"
              ? "ring-2 ring-blue-500 shadow-lg"
              : "hover:shadow-md"
          }`}
          onClick={() => setSelectedOption("original")}
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Original Text</span>
                </CardTitle>
                <CardDescription>
                  Complete, unmodified document content
                </CardDescription>
              </div>
              {selectedOption === "original" && (
                <Badge variant="default">Selected</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Characters</div>
                <div className="text-lg font-semibold">
                  {processedText.original_text.char_count.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Estimated Cost</div>
                <div className="text-lg font-semibold">
                  ${processedText.original_text.cost.toFixed(2)}
                </div>
              </div>
            </div>
            <Separator />
            <div className="h-40 overflow-y-auto">
              <p className="text-sm text-gray-700 leading-relaxed">
                {processedText.original_text.text}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Summarized Text */}
        <Card
          className={`cursor-pointer transition-all ${
            selectedOption === "summarized"
              ? "ring-2 ring-green-500 shadow-lg"
              : "hover:shadow-md"
          }`}
          onClick={() => setSelectedOption("summarized")}
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Summarized Text</span>
                </CardTitle>
                <CardDescription>
                  AI-generated summary of key content
                </CardDescription>
              </div>
              {selectedOption === "summarized" && (
                <Badge variant="secondary">Selected</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Characters</div>
                <div className="text-lg font-semibold">
                  {processedText.summarized_text.char_count.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Estimated Cost</div>
                <div className="text-lg font-semibold">
                  ${processedText.summarized_text.cost.toFixed(2)}
                </div>
              </div>
            </div>
            <Separator />
            <div className="h-40 overflow-y-auto">
              <p className="text-sm text-gray-700 leading-relaxed">
                {processedText.summarized_text.text}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Proceed Button */}
      <div className="text-center">
        <Button
          onClick={handleProceed}
          disabled={!selectedOption}
          size="lg"
          className="px-8"
        >
          Proceed to Audio Configuration
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
