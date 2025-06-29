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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  File,
  Download,
  Trash2,
  Edit,
  Music,
  FileText,
  Archive,
  RefreshCw,
  Clock,
  Calendar,
  HardDrive,
} from "lucide-react";
import { useUser, useClerk, SignInButton, useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
interface FileItem {
  name: string;
  type: "file" | "directory";
  size?: number;
  created_at?: string;
  updated_at?: string;
  last_modified?: string;
  path: string;
  url?: string;
  bucket: "murf-audiofiles" | "murf-documents";
}

const formatExactDate = (dateString?: string) => {
  if (!dateString) return "Date not available";

  try {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    });
  } catch (error) {
    return "Invalid date";
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      // Less than 24 hours ago - show relative time
      if (diffInHours < 1) {
        const minutes = Math.floor(diffInHours * 60);
        return `${minutes} min${minutes !== 1 ? "s" : ""} ago`;
      }
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    } else if (diffInHours < 24 * 7) {
      // Less than a week ago - show days
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days !== 1 ? "s" : ""} ago`;
    } else {
      // More than a week ago - show formatted date
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  } catch (error) {
    return "—";
  }
};

const getLastModifiedDate = (item: FileItem) => {
  return item.updated_at || item.last_modified || item.created_at;
};

export default function FileManager() {
  const { getToken, userId } = useAuth();
  const { isSignedIn, isLoaded } = useUser();
  const [audioFiles, setAudioFiles] = useState<FileItem[]>([]);
  const [documentFiles, setDocumentFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<FileItem | null>(null);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (isSignedIn && userId) {
      loadFiles();
    }
  }, [isSignedIn, userId]);

  const getAuthHeaders = async () => {
    const authToken = await getToken();
    if (!authToken) {
      throw new Error("No authentication token found");
    }
    return {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };
  };

  const loadFiles = async () => {
    setLoading(true);
    try {
      await Promise.all([loadAudioFiles(), loadDocumentFiles()]);
      toast.success("Files loaded successfully");
    } catch (error) {
      console.error("Error loading files:", error);
      toast.error("Error loading files");
    } finally {
      setLoading(false);
    }
  };

  const loadAudioFiles = async () => {
    try {
      const params = new URLSearchParams({
        storage_bucket: "murf-audiofiles",
        // directory: userId || "",
      });

      const headers = await getAuthHeaders();
      delete headers["Content-Type"];

      const response = await fetch(
        `https://sonus.onrender.com/api/filesystem/list-directory?${params}`,
        { headers }
      );
      console.log(response);
      if (response.ok) {
        const data = await response.json();
        const files = (data.items || [])
          .filter((item: any) => {
            // Filter out .emptyFolderPlaceholder and other hidden files
            return (
              !item.name.startsWith(".") &&
              item.name !== ".emptyFolderPlaceholder"
            );
          })
          .map((item: any) => ({
            ...item,
            bucket: "murf-audiofiles" as const,
          }));
        setAudioFiles(files);
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(
          `Failed to load audio files: ${
            errorData.message || response.statusText
          }`
        );
      }
    } catch (error) {
      console.error("Error loading audio files:", error);
      throw error;
    }
  };

  const loadDocumentFiles = async () => {
    try {
      const params = new URLSearchParams({
        storage_bucket: "murf-documents",
        // directory: userId || "",
      });

      const headers = await getAuthHeaders();
      delete headers["Content-Type"];

      const response = await fetch(
        `https://sonus.onrender.com/api/filesystem/list-directory?${params}`,
        { headers }
      );

      if (response.ok) {
        const data = await response.json();
        const files = (data.items || [])
          .filter((item: any) => {
            // Filter out .emptyFolderPlaceholder and other hidden files
            return (
              !item.name.startsWith(".") &&
              item.name !== ".emptyFolderPlaceholder"
            );
          })
          .map((item: any) => ({
            ...item,
            bucket: "murf-documents" as const,
          }));
        setDocumentFiles(files);
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(
          `Failed to load document files: ${
            errorData.message || response.statusText
          }`
        );
      }
    } catch (error) {
      console.error("Error loading document files:", error);
      throw error;
    }
  };

  const deleteItem = async (item: FileItem) => {
    try {
      const headers = await getAuthHeaders();
      const endpoint = "https://sonus.onrender.com/api/filesystem/file";
      const body = { path: `${item.name}` };

      const response = await fetch(
        `${endpoint}?storage_bucket=${item.bucket}`,
        {
          method: "DELETE",
          headers,
          body: JSON.stringify(body),
        }
      );

      if (response.ok) {
        await loadFiles();
        toast.success("File deleted successfully");
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(
          `Failed to delete file: ${errorData.message || response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Error deleting file");
    }
  };

  const renameItem = async () => {
    if (!editingItem || !newName.trim()) {
      toast.error("Please enter a new name");
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const endpoint = "https://sonus.onrender.com/api/filesystem/file";
      const body = {
        old_path: editingItem.name,
        new_path: newName,
      };

      const response = await fetch(
        `${endpoint}?storage_bucket=${editingItem.bucket}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify(body),
        }
      );

      if (response.ok) {
        setEditingItem(null);
        setNewName("");
        await loadFiles();
        toast.success("File renamed successfully");
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(
          `Failed to rename file: ${errorData.message || response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error renaming file:", error);
      toast.error("Error renaming file");
    }
  };

  const downloadItem = async (item: FileItem) => {
    try {
      if (item.url) {
        window.open(item.url, "_blank", "noopener,noreferrer");
        toast.success("File opened in new tab");
      } else {
        toast.error("File URL not available");
      }
    } catch (error) {
      console.error("Error downloading item:", error);
      toast.error("Error downloading item");
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "mp3":
      case "wav":
      case "ogg":
        return <Music className="w-5 h-5 text-mint" />;
      case "txt":
      case "docx":
      case "pdf":
        return <FileText className="w-5 h-5 text-ocean" />;
      case "zip":
        return <Archive className="w-5 h-5 text-sunshine" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "—";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const renderFileList = (
    files: FileItem[],
    title: string,
    emptyMessage: string
  ) => (
    <Card className="border-2 border-ocean/20 mb-6">
      <CardHeader>
        <CardTitle className="text-navy">{title}</CardTitle>
        <CardDescription>{emptyMessage}</CardDescription>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <div className="text-center py-8">
            <File className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No files found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-ocean/30 hover:bg-ocean/5 transition-all duration-200"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex-shrink-0">{getFileIcon(item.name)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-left font-medium truncate text-gray-900">
                        {item.name}
                      </span>
                      <Badge
                        variant="secondary"
                        className={`${
                          item.bucket === "murf-audiofiles"
                            ? "bg-mint/10 text-mint border-mint/20"
                            : "bg-ocean/10 text-ocean border-ocean/20"
                        }`}
                      >
                        {item.bucket === "murf-audiofiles"
                          ? "Audio"
                          : "Document"}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="flex items-center space-x-1 cursor-help">
                              <HardDrive className="w-3 h-3" />
                              <span>{formatFileSize(item.size)}</span>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1">
                              <p className="font-semibold">File Size:</p>
                              <p>
                                {item.size
                                  ? `${item.size.toLocaleString()} bytes`
                                  : "Size not available"}
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="flex items-center space-x-1 cursor-help">
                              <Clock className="w-3 h-3" />
                              <span>Modified:</span>
                              <span className="font-medium">
                                {formatDate(getLastModifiedDate(item))}
                              </span>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-2 max-w-xs">
                              <div>
                                <p className="font-semibold text-xs uppercase tracking-wide">
                                  Last Modified:
                                </p>
                                <p className="text-sm">
                                  {formatExactDate(getLastModifiedDate(item))}
                                </p>
                              </div>
                              {item.updated_at &&
                                item.updated_at !==
                                  getLastModifiedDate(item) && (
                                  <div className="border-t pt-2">
                                    <p className="font-semibold text-xs uppercase tracking-wide">
                                      Updated:
                                    </p>
                                    <p className="text-sm">
                                      {formatExactDate(item.updated_at)}
                                    </p>
                                  </div>
                                )}
                              {item.last_modified &&
                                item.last_modified !== item.updated_at && (
                                  <div className="border-t pt-2">
                                    <p className="font-semibold text-xs uppercase tracking-wide">
                                      File Modified:
                                    </p>
                                    <p className="text-sm">
                                      {formatExactDate(item.last_modified)}
                                    </p>
                                  </div>
                                )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {item.created_at && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="flex items-center space-x-1 cursor-help">
                                <Calendar className="w-3 h-3" />
                                <span>Created:</span>
                                <span>{formatDate(item.created_at)}</span>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1">
                                <p className="font-semibold text-xs uppercase tracking-wide">
                                  Created:
                                </p>
                                <p className="text-sm">
                                  {formatExactDate(item.created_at)}
                                </p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadItem(item)}
                    className="text-mint hover:text-mint hover:bg-mint/10"
                  >
                    <Download className="w-4 h-4" />
                  </Button>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingItem(item);
                          setNewName(item.name);
                        }}
                        className="text-ocean hover:text-ocean hover:bg-ocean/10"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Rename File</DialogTitle>
                        <DialogDescription>
                          Enter a new name for "{item.name}"
                        </DialogDescription>
                      </DialogHeader>
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="New name"
                        onKeyDown={(e) => e.key === "Enter" && renameItem()}
                      />
                      <DialogFooter>
                        <Button onClick={renameItem} disabled={!newName.trim()}>
                          Rename
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-coral hover:text-coral hover:bg-coral/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete File</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{item.name}"? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteItem(item)}
                          className="bg-coral hover:bg-coral/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean mx-auto"></div>
        <p className="text-gray-500 mt-4">Loading...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 p-4">
        <h2 className="text-2xl font-semibold mb-4">
          Please sign in to manage files
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
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-navy mb-4">File Manager</h2>
        <p className="text-lg text-gray-600">
          Organize your audio files and documents
        </p>
      </div>

      <div className="flex justify-end mb-6">
        <Button
          variant="outline"
          onClick={loadFiles}
          disabled={loading}
          className="flex items-center space-x-2"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span>Refresh</span>
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading files...</p>
        </div>
      ) : (
        <>
          {renderFileList(
            audioFiles,
            "Audio Documents",
            "Your audio files will appear here"
          )}
          {renderFileList(
            documentFiles,
            "Text Documents",
            "Your text documents will appear here"
          )}
        </>
      )}
    </div>
  );
}
