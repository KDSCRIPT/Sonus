"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  Download,
  Plus,
  Trash2,
  Settings,
  Loader,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";

type TTSConfig = {
  channelType: string;
  encodeAsBase64: boolean;
  format: string;
  multiNativeLocale: string;
  pitch: number;
  rate: number;
  sampleRate: number;
  style: string;
  text: string;
  variation: number;
  voiceId: string;
};

type TTSRecommendation = {
  line: string;
  config: TTSConfig;
  analysis: any;
  reasoning: any;
  selected_voice: string | null;
  success: boolean;
};

type Voice = {
  voice_id: string;
  display_name: string;
  gender: string;
  accent: string;
  description: string;
  available_styles: string[];
  supported_locales: {
    [key: string]: {
      available_styles: string[];
      detail: string;
    };
  };
};

interface TTSEditorProps {
  recommendations: TTSRecommendation[];
  onRecommendationsChange: (recommendations: TTSRecommendation[]) => void;
}

export default function TTSEditor({
  recommendations,
  onRecommendationsChange,
}: TTSEditorProps) {
  const { getToken } = useAuth();
  const [voices, setVoices] = useState<Voice[]>([]);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isLoadingExport, setIsLoadingExport] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  // Add these state variables at the top of your component
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFileName, setExportFileName] = useState("");
  const [fileExists, setFileExists] = useState(false);
  const [isCheckingFile, setIsCheckingFile] = useState(false);

  // Function to check if file exists
  const checkFileExists = async (fileName: string) => {
    if (!fileName) {
      setFileExists(false);
      return;
    }

    setIsCheckingFile(true);
    try {
      const authToken = await getToken();
      if (!authToken) return;

      const fullFileName = fileName.endsWith(".mp3")
        ? fileName
        : `${fileName}.mp3`;

      const response = await fetch(
        `https://sonus.onrender.com/api/filesystem/list-directory?storage_bucket=murf-audiofiles`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const exists = data.items?.some(
          (item: any) => item.name === fullFileName && item.type === "file"
        );
        setFileExists(exists);
      }
    } catch (error) {
      console.error("Error checking file:", error);
    } finally {
      setIsCheckingFile(false);
    }
  };

  // Debounced file check
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkFileExists(exportFileName);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [exportFileName]);

  // Updated export function
  const exportAudio = async () => {
    setShowExportModal(true);
  };

  const handleExportConfirm = async () => {
    if (!exportFileName.trim()) return;

    const fullFileName = exportFileName.endsWith(".mp3")
      ? exportFileName
      : `${exportFileName}.mp3`;

    setShowExportModal(false);
    setIsLoadingExport(true);

    try {
      const authToken = await getToken();
      if (!authToken) {
        console.error("No Clerk token found.");
        return;
      }

      const configs = recommendations.map((rec) => ({
        text: rec.config.text,
        channel_type: rec.config.channelType,
        format: rec.config.format,
        multi_native_locale: rec.config.multiNativeLocale,
        pitch: rec.config.pitch,
        rate: rec.config.rate,
        sample_rate: rec.config.sampleRate,
        style: rec.config.style,
        variation: rec.config.variation,
        voice_id: rec.config.voiceId,
      }));

      const response = await fetch(
        "https://sonus.onrender.com/api/tts/export-audio",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            file_name: fullFileName,
            configs,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert(`Audio file ${result["file_name"]} exported successfully!`);
      } else {
        alert(`Error exporting audio: ${result.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error exporting audio:", error);
      alert("Error exporting audio. Please try again.");
    } finally {
      setIsLoadingExport(false);
      setExportFileName("");
      setFileExists(false);
    }
  };

  useEffect(() => {
    fetchVoices();
  }, []);

  const fetchVoices = async () => {
    try {
      const authToken = await getToken();
      if (!authToken) {
        console.error("No Clerk token found.");
        return;
      }
      const response = await fetch(
        "https://sonus.onrender.com/api/tts/voices",
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setVoices(data.voices);
      }
    } catch (error) {
      console.error("Error fetching voices:", error);
    }
  };

  const updateRecommendation = (index: number, updates: Partial<TTSConfig>) => {
    const newRecommendations = [...recommendations];
    newRecommendations[index] = {
      ...newRecommendations[index],
      config: { ...newRecommendations[index].config, ...updates },
    };
    onRecommendationsChange(newRecommendations);
  };

  const addBlock = () => {
    const newBlock: TTSRecommendation = {
      line: "",
      config: {
        channelType: "MONO",
        encodeAsBase64: false,
        format: "MP3",
        multiNativeLocale: "en-US",
        pitch: 0,
        rate: 0,
        sampleRate: 44100,
        style: "Conversational",
        text: "",
        variation: 2,
        voiceId: "en-US-natalie",
      },
      analysis: {},
      reasoning: {},
      selected_voice: null,
      success: true,
    };
    onRecommendationsChange([...recommendations, newBlock]);
  };

  const deleteBlock = (index: number) => {
    const newRecommendations = recommendations.filter((_, i) => i !== index);
    onRecommendationsChange(newRecommendations);
  };

  const playAudio = async (index: number) => {
    if (playingIndex === index) {
      setPlayingIndex(null);
      return;
    }

    setLoadingIndex(index); // Show loader
    setPlayingIndex(null); // Reset play state until audio starts

    try {
      const authToken = await getToken();
      if (!authToken) {
        console.error("No Clerk token found.");
        setLoadingIndex(null);
        return;
      }

      const stream_config = {
        text: recommendations[index].config.text,
        channel_type: recommendations[index].config.channelType,
        format: recommendations[index].config.format,
        multi_native_locale: recommendations[index].config.multiNativeLocale,
        pitch: recommendations[index].config.pitch,
        rate: recommendations[index].config.rate,
        sample_rate: recommendations[index].config.sampleRate,
        style: recommendations[index].config.style,
        variation: recommendations[index].config.variation,
        voice_id: recommendations[index].config.voiceId,
      };

      const response = await fetch(
        "https://sonus.onrender.com/api/audiosystem/play",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ config: stream_config }),
        }
      );

      if (!response.ok) {
        console.error("Failed to fetch audio stream");
        setLoadingIndex(null);
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.play();
      setPlayingIndex(index); // Now it's playing
      setLoadingIndex(null); // Stop showing spinner

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setPlayingIndex(null);
      };
    } catch (error) {
      console.error("Error playing audio:", error);
      setLoadingIndex(null);
    }
  };

  // const exportAudio = async () => {
  //   try {
  //     setIsLoadingExport(true);
  //     const configs = recommendations.map((rec) => ({
  //       text: rec.config.text,
  //       channel_type: rec.config.channelType,
  //       format: rec.config.format,
  //       multi_native_locale: rec.config.multiNativeLocale,
  //       pitch: rec.config.pitch,
  //       rate: rec.config.rate,
  //       sample_rate: rec.config.sampleRate,
  //       style: rec.config.style,
  //       variation: rec.config.variation,
  //       voice_id: rec.config.voiceId,
  //     }));
  //     const authToken = await getToken();
  //     if (!authToken) {
  //       console.error("No Clerk token found.");
  //       return;
  //     }
  //     const response = await fetch(
  //       "https://sonus.onrender.com/api/tts/export-audio",
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${authToken}`,
  //         },
  //         body: JSON.stringify({
  //           file_name: "exported12_audio.mp3",
  //           configs,
  //         }),
  //       }
  //     );
  //     const filename = await response.json();
  //     console.log(filename);
  //     if (response.ok) {
  //       alert(`Audio file ${filename["file_name"]} exported successfully!`);
  //     }
  //   } catch (error) {
  //     console.error("Error exporting audio:", error);
  //   } finally {
  //     setIsLoadingExport(false); // Stop loading
  //   }
  // };

  const getAvailableStyles = (voiceId: string, locale: string) => {
    const voice = voices.find((v) => v.voice_id === voiceId);
    if (!voice) return [];

    if (voice.supported_locales[locale]) {
      return voice.supported_locales[locale].available_styles;
    }

    return voice.available_styles || [];
  };

  const getAvailableLocales = (voiceId: string) => {
    const voice = voices.find((v) => v.voice_id === voiceId);
    if (!voice) return [];

    return Object.keys(voice.supported_locales || {});
  };

  const handleVoiceChange = (index: number, newVoiceId: string) => {
    const voice = voices.find((v) => v.voice_id === newVoiceId);
    if (!voice) return;

    const availableLocales = getAvailableLocales(newVoiceId);
    const defaultLocale = availableLocales.includes("en-US")
      ? "en-US"
      : availableLocales[0];
    const availableStyles = getAvailableStyles(newVoiceId, defaultLocale);
    const defaultStyle = availableStyles.includes("Conversational")
      ? "Conversational"
      : availableStyles[0];

    updateRecommendation(index, {
      voiceId: newVoiceId,
      multiNativeLocale: defaultLocale,
      style: defaultStyle,
    });
  };

  const handleLocaleChange = (index: number, newLocale: string) => {
    const currentVoiceId = recommendations[index].config.voiceId;
    const availableStyles = getAvailableStyles(currentVoiceId, newLocale);
    const defaultStyle = availableStyles.includes("Conversational")
      ? "Conversational"
      : availableStyles[0];

    updateRecommendation(index, {
      multiNativeLocale: newLocale,
      style: defaultStyle,
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Audio Configuration</h2>
          <p className="text-gray-600">
            Configure voice settings for each text block
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={addBlock} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Block
          </Button>
          <Button onClick={exportAudio}>
            <Download className="w-4 h-4 mr-2" />
            Export Audio
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {isLoadingExport && (
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
                  r="20"
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
              <h2 className="text-2xl font-bold mt-2">Exporting Audio...</h2>
            </div>
          </div>
        )}
        {recommendations.map((recommendation, index) => (
          <Card key={index} className="relative">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">Block {index + 1}</CardTitle>
                  <CardDescription>
                    Voice:{" "}
                    {voices.find(
                      (v) => v.voice_id === recommendation.config.voiceId
                    )?.display_name || recommendation.config.voiceId}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => playAudio(index)}
                  >
                    {loadingIndex === index ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : playingIndex === index ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setExpandedIndex(expandedIndex === index ? null : index)
                    }
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteBlock(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Text Input */}
              <div>
                <Label htmlFor={`text-${index}`}>Text</Label>
                <Textarea
                  id={`text-${index}`}
                  value={recommendation.config.text}
                  onChange={(e) =>
                    updateRecommendation(index, { text: e.target.value })
                  }
                  rows={3}
                />
              </div>

              {/* Basic Settings - Always Visible */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Voice Selection */}
                <div>
                  <Label>Voice</Label>
                  <Select
                    value={recommendation.config.voiceId}
                    onValueChange={(value) => handleVoiceChange(index, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {voices.map((voice) => (
                        <SelectItem key={voice.voice_id} value={voice.voice_id}>
                          {voice.display_name} ({voice.accent})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Locale Selection */}
                <div>
                  <Label>Locale</Label>
                  <Select
                    value={recommendation.config.multiNativeLocale}
                    onValueChange={(value) => handleLocaleChange(index, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableLocales(recommendation.config.voiceId).map(
                        (locale) => {
                          const voice = voices.find(
                            (v) => v.voice_id === recommendation.config.voiceId
                          );
                          const localeDetail =
                            voice?.supported_locales[locale]?.detail || locale;
                          return (
                            <SelectItem key={locale} value={locale}>
                              {localeDetail}
                            </SelectItem>
                          );
                        }
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Style Selection */}
                <div>
                  <Label>Style</Label>
                  <Select
                    value={recommendation.config.style}
                    onValueChange={(value) =>
                      updateRecommendation(index, { style: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableStyles(
                        recommendation.config.voiceId,
                        recommendation.config.multiNativeLocale
                      ).map((style) => (
                        <SelectItem key={style} value={style}>
                          {style}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Advanced Settings - Expandable */}
              {expandedIndex === index && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  {/* Pitch Slider */}
                  <div>
                    <Label>Pitch: {recommendation.config.pitch}</Label>
                    <Slider
                      value={[recommendation.config.pitch]}
                      onValueChange={([value]) =>
                        updateRecommendation(index, { pitch: value })
                      }
                      min={-20}
                      max={20}
                      step={1}
                    />
                  </div>

                  {/* Rate Slider */}
                  <div>
                    <Label>Rate: {recommendation.config.rate}</Label>
                    <Slider
                      value={[recommendation.config.rate]}
                      onValueChange={([value]) =>
                        updateRecommendation(index, { rate: value })
                      }
                      min={-20}
                      max={20}
                      step={1}
                    />
                  </div>

                  {/* Variation */}
                  <div>
                    <Label>Variation</Label>
                    <Select
                      value={recommendation.config.variation.toString()}
                      onValueChange={(value) =>
                        updateRecommendation(index, {
                          variation: Number.parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Channel Type */}
                  <div>
                    <Label>Channel Type</Label>
                    <Select
                      value={recommendation.config.channelType}
                      onValueChange={(value) =>
                        updateRecommendation(index, { channelType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MONO">Mono</SelectItem>
                        <SelectItem value="STEREO">Stereo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Format */}
                  <div>
                    <Label>Format</Label>
                    <Select
                      value={recommendation.config.format}
                      onValueChange={(value) =>
                        updateRecommendation(index, { format: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MP3">MP3</SelectItem>
                        <SelectItem value="WAV">WAV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sample Rate */}
                  <div>
                    <Label>Sample Rate</Label>
                    <Select
                      value={recommendation.config.sampleRate.toString()}
                      onValueChange={(value) =>
                        updateRecommendation(index, {
                          sampleRate: Number.parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="22050">22.05 kHz</SelectItem>
                        <SelectItem value="44100">44.1 kHz</SelectItem>
                        <SelectItem value="48000">48 kHz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Analysis Info */}
              {recommendation.analysis?.emotional_analysis && (
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {recommendation.analysis.emotional_analysis.primary_emotion}
                  </Badge>
                  <Badge variant="outline">
                    {recommendation.analysis.content_analysis.content_type}
                  </Badge>
                  <Badge variant="outline">
                    Intensity:{" "}
                    {
                      recommendation.analysis.emotional_analysis
                        .emotional_intensity
                    }
                  </Badge>
                  {recommendation.reasoning?.voice_choice && (
                    <Badge variant="outline">AI Recommended</Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Export Audio</CardTitle>
              <CardDescription>
                Enter a filename for your exported audio file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="filename">Filename</Label>
                <div className="flex">
                  <input
                    id="filename"
                    type="text"
                    value={exportFileName}
                    onChange={(e) => setExportFileName(e.target.value)}
                    placeholder="my-audio-file"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-gray-600">
                    .mp3
                  </span>
                </div>
                {isCheckingFile && (
                  <p className="text-sm text-gray-500 mt-1">Checking...</p>
                )}
                {fileExists && !isCheckingFile && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <span className="mr-1">⚠️</span>A file with this name
                    already exists and will be overwritten
                  </p>
                )}
              </div>
            </CardContent>
            <div className="flex justify-end space-x-2 p-6 pt-0">
              <Button
                variant="outline"
                onClick={() => {
                  setShowExportModal(false);
                  setExportFileName("");
                  setFileExists(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleExportConfirm}
                disabled={!exportFileName.trim() || isCheckingFile}
              >
                {fileExists ? "Overwrite & Export" : "Export"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
