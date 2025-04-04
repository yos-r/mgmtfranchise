import { useState, useEffect, useRef } from "react";
import {
  Download,
  Upload,
  FileText,
  File,
  Image as ImageIcon,
  FilePdf,
  Loader2,
  X,
  Plus,
  Trash2,
  Text,
  FileSpreadsheetIcon,
  ArchiveIcon,
  VideoIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (!bytes) return "Unknown size";

  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Byte";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i)) + " " + sizes[i];
};

// Get file icon based on file type
const getFileIcon = (fileType) => {
  const type = fileType.toLowerCase();

  if (type.includes('pdf')) {
    return <Text className="h-5 w-5 text-red-500" />;
  } else if (type.includes('word') || type.includes('doc')) {
    return <Text className="h-5 w-5 text-blue-500" />;
  } else if (type.includes('excel') || type.includes('sheet') || type.includes('xls')) {
    return <FileSpreadsheetIcon className="h-5 w-5 text-green-500" />;
  } else if (type.includes('zip') || type.includes('rar') || type.includes('7z') || type.includes('tar')) {
    return <ArchiveIcon className="h-5 w-5 text-yellow-500" />;
  } else if (type.includes('jpg') || type.includes('jpeg') || type.includes('png') || type.includes('gif') || type.includes('webp')) {
    return <ImageIcon className="h-5 w-5 text-purple-500" />;
  } else if (type.includes('mp4') || type.includes('mov') || type.includes('avi') || type.includes('webm')) {
    return <VideoIcon className="h-5 w-5 text-pink-500" />;
  } else {
    return <File className="h-5 w-5 text-gray-500" />;
  }
};

export default function MarketingAttachments({ actionId, isAdmin = true }) {
  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState(null);

  const fileInputRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    if (actionId) {
      fetchAttachments();
    }
  }, [actionId]);

  const fetchAttachments = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('marketing_action_attachments')
        .select('*')
        .eq('action_id', actionId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setAttachments(data || []);
    } catch (error) {
      console.error("Error fetching attachments:", error);
      toast({
        title: "Error",
        description: "Failed to load marketing attachments.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (limit to 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 50MB.",
          variant: "destructive",
        });
        // Reset input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !actionId) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // 1. Upload file to storage
      const fileName = `${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9_.]/g, '_')}`;
      const filePath = `marketing/${actionId}/${fileName}`;
      
      // Create a simulated progress effect while uploading
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + (Math.random() * 10);
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 300);
      
      const { error: uploadError, data: uploadData } = await supabase
        .storage
        .from('marketing-attachments')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });
      
      clearInterval(progressInterval);
      
      if (uploadError) throw uploadError;
      
      setUploadProgress(95);
      
      // 2. Get public URL
      const { data: urlData } = supabase
        .storage
        .from('marketing-attachments')
        .getPublicUrl(filePath);
      
      // 3. Store metadata in database
      const fileType = selectedFile.type || 
                      selectedFile.name.split('.').pop() || 
                      'application/octet-stream';
      
      const attachmentData = {
        action_id: actionId,
        name: selectedFile.name,
        type: fileType,
        url: urlData.publicUrl,
        size: formatFileSize(selectedFile.size)
      };
      
      const { data, error } = await supabase
        .from('marketing_action_attachments')
        .insert(attachmentData)
        .select()
        .single();
      
      if (error) throw error;
      
      setUploadProgress(100);
      
      // 4. Update attachments list
      setAttachments([data, ...attachments]);
      
      toast({
        title: "Upload successful",
        description: `${selectedFile.name} has been uploaded successfully.`,
      });
      
      // Reset state
      setSelectedFile(null);
      setUploadDialog(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDownload = (attachment) => {
    window.open(attachment.url, '_blank');
    
    toast({
      title: "Download initiated",
      description: `Downloading ${attachment.name}...`
    });
  };

  const confirmDelete = (attachment) => {
    setAttachmentToDelete(attachment);
    setDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!attachmentToDelete) return;
    
    try {
      // 1. Get file path from URL
      const url = new URL(attachmentToDelete.url);
      const pathSegments = url.pathname.split('/');
      const bucketName = 'marketing-attachments';
      
      // Find the index where the bucket name appears and extract the path after it
      const bucketIndex = pathSegments.findIndex(segment => segment === bucketName);
      const filePath = pathSegments.slice(bucketIndex + 1).join('/');
      
      // 2. Delete file from storage
      const { error: storageError } = await supabase
        .storage
        .from(bucketName)
        .remove([filePath]);
      
      if (storageError) {
        console.error("Error deleting file from storage:", storageError);
      }
      
      const { error } = await supabase
        .from('marketing_action_attachments')
        .delete()
        .eq('id', attachmentToDelete.id);
      
      if (error) throw error;
      
      // 4. Update attachments list
      setAttachments(attachments.filter(a => a.id !== attachmentToDelete.id));
      
      toast({
        title: "Attachment deleted",
        description: `${attachmentToDelete.name} has been removed.`,
      });
      
    } catch (error) {
      console.error("Error deleting attachment:", error);
      toast({
        title: "Deletion failed",
        description: "An error occurred while deleting the attachment.",
        variant: "destructive",
      });
    } finally {
      setDeleteConfirm(false);
      setAttachmentToDelete(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Campaign Attachments</CardTitle>
            <CardDescription>
              Supporting documents and files
            </CardDescription>
          </div>
          {isAdmin && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setUploadDialog(true)}
              disabled={isUploading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Attachment
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : attachments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No attachments available yet</p>
            {isAdmin && (
              <Button 
                variant="link" 
                className="mt-2" 
                onClick={() => setUploadDialog(true)}
              >
                Upload attachments
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  {getFileIcon(attachment.type)}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{attachment.name}</p>
                    <p className="text-xs text-muted-foreground">{attachment.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(attachment)}
                    className="h-8 w-8"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => confirmDelete(attachment)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onOpenChange={(open) => {
        if (!isUploading) setUploadDialog(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Attachment</DialogTitle>
            <DialogDescription>
              Add supporting documents for this marketing action.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Input
                id="attachment"
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                disabled={isUploading}
              />
              <p className="text-xs text-muted-foreground">
                Maximum file size: 50MB
              </p>
            </div>
            
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>Uploading {selectedFile?.name}...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => {
                setUploadDialog(false);
                setSelectedFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Attachment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{attachmentToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteConfirm(false);
              setAttachmentToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}