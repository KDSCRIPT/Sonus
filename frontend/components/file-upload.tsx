"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUser, useClerk, SignInButton, useAuth } from "@clerk/nextjs";

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

interface FileUploadProps {
  onFileProcessed: (data: ProcessedText) => void;
}

export default function FileUpload({ onFileProcessed }: FileUploadProps) {
  const { getToken } = useAuth();
  const { isSignedIn, isLoaded } = useUser();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];

      if (!allowedTypes.includes(file.type)) {
        setError("Please upload a PDF, DOCX, or TXT file");
        return;
      }

      setUploading(true);
      setProgress(0);
      setError(null);
      setSuccess(false);

      try {
        const formData = new FormData();
        formData.append("file", file);

        // Simulate progress
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + 10;
          });
        }, 200);
        const authToken = await getToken();
        if (!authToken) {
          console.error("No Clerk token found.");
          return;
        }
        const response = await fetch(
          "http://localhost:5000/api/filesystem/file",
          {
            method: "POST",
            body: formData,
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        clearInterval(progressInterval);
        setProgress(100);

        if (response.ok) {
          const data = await response.json();
          setSuccess(true);
          setTimeout(() => {
            onFileProcessed(data);
          }, 1000);
        } else {
          throw new Error("Upload failed");
        }
      } catch (err) {
        setError("Failed to upload and process file. Please try again.");
        console.error("Upload error:", err);
      } finally {
        setUploading(false);
      }
    },
    [onFileProcessed]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    disabled: uploading,
  });
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 p-4">
        <h2 className="text-2xl font-semibold mb-4">
          Please sign in to make audiobooks
        </h2>
        <SignInButton mode="modal">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Sign In
          </Button>
        </SignInButton>
      </div>
    );
  }
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-2 border-dashed border-mint/30 hover:border-mint transition-all duration-300">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-navy">
            Upload Your Document
          </CardTitle>
          <CardDescription>
            Support for PDF, DOCX, and TXT files up to 10MB
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragActive
                ? "border-coral bg-coral/5"
                : "border-gray-300 hover:border-mint hover:bg-mint/5"
            } ${uploading ? "pointer-events-none opacity-50" : ""}`}
          >
            <input {...getInputProps()} />

            {uploading ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-ocean/10 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8 text-ocean animate-pulse" />
                </div>
                <div>
                  <p className="text-lg font-medium text-navy mb-2">
                    Processing your file...
                  </p>
                  <Progress
                    value={progress}
                    className="w-full max-w-xs mx-auto"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {progress}% complete
                  </p>
                </div>
              </div>
            ) : success ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-mint/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-mint" />
                </div>
                <div>
                  <p className="text-lg font-medium text-navy">
                    File processed successfully!
                  </p>
                  <p className="text-sm text-gray-500">
                    Redirecting to text selection...
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-sunshine/10 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="w-8 h-8 text-sunshine" />
                </div>
                <div>
                  <p className="text-lg font-medium text-navy">
                    {isDragActive
                      ? "Drop your file here"
                      : "Drag & drop your file here"}
                  </p>
                  <p className="text-gray-500 mb-4">or</p>
                  <Button
                    variant="outline"
                    className="border-coral text-coral hover:bg-coral hover:text-white bg-transparent"
                  >
                    Browse Files
                  </Button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <Alert className="mt-4 border-coral/50 bg-coral/5">
              <AlertCircle className="h-4 w-4 text-coral" />
              <AlertDescription className="text-coral">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Supported formats: PDF, DOCX, TXT</p>
            <p>Maximum file size: 10MB</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
