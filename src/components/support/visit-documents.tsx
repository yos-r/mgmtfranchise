import { useState, useEffect, useRef } from "react";
import {
  Download,
  Upload,
  FileText,
  File,
  Image as ImageIcon,
  FilePdf,
  FileArchive,
  FileSpreadsheet,
  Video,
  Loader2,
  X,
  Plus,
  Trash2,
  AlertTriangle,
  Text,
  FileSpreadsheetIcon,
  ArchiveIcon,
  VideoIcon,
  Pencil
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
  AlertDialogTrigger,
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
  const type = fileType?.toLowerCase() || '';
  
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

export default function VisitDocuments({ visitId, isAdmin = true }) {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentTitle, setDocumentTitle] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [documentToEdit, setDocumentToEdit] = useState(null);
  
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    if (visitId) {
      fetchDocuments();
    }
  }, [visitId]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('support_documents')
        .select('*')
        .eq('visit_id', visitId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setDocuments(data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Error",
        description: "Failed to load documents.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 10MB.",
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
    if (!selectedFile || !visitId) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // 1. Upload file to storage
      const fileName = `${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9_.]/g, '_')}`;
      const filePath = `visits/${visitId}/${fileName}`;
      
      // Create a simulated progress effect while uploading
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + (Math.random() * 10);
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 300);
      
      const { error: uploadError, data: uploadData } = await supabase
        .storage
        .from('support-documents')
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
        .from('support-documents')
        .getPublicUrl(filePath);
      
      // 3. Store metadata in database
      const fileType = selectedFile.type || 
                      selectedFile.name.split('.').pop() || 
                      'application/octet-stream';
      
      const documentData = {
        visit_id: visitId,
        name: documentTitle || selectedFile.name,
        url: urlData.publicUrl,
        type: fileType,
        size: formatFileSize(selectedFile.size)
      };
      
      const { data, error } = await supabase
        .from('support_documents')
        .insert(documentData)
        .select()
        .single();
      
      if (error) throw error;
      
      setUploadProgress(100);
      
      // 4. Update documents list
      setDocuments([data, ...documents]);
      
      toast({
        title: "Upload successful",
        description: `${selectedFile.name} has been uploaded successfully.`,
      });
      
      // Reset state
      setSelectedFile(null);
      setDocumentTitle("");
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

  const handleDownload = (document) => {
    window.open(document.url, '_blank');
    
    toast({
      title: "Download initiated",
      description: `Downloading ${document.name}...`
    });
  };

  const confirmDelete = (document) => {
    setDocumentToDelete(document);
    setDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!documentToDelete) return;
    
    try {
      // 1. Get file path from URL
      const url = new URL(documentToDelete.url);
      const pathSegments = url.pathname.split('/');
      const bucketName = 'support-documents';
      
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
        .from('support_documents')
        .delete()
        .eq('id', documentToDelete.id);
      
      if (error) throw error;
      
      // 4. Update documents list
      setDocuments(documents.filter(d => d.id !== documentToDelete.id));
      
      toast({
        title: "Document deleted",
        description: `${documentToDelete.name} has been removed.`,
      });
      
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Deletion failed",
        description: "An error occurred while deleting the document.",
        variant: "destructive",
      });
    } finally {
      setDeleteConfirm(false);
      setDocumentToDelete(null);
    }
  };

  const handleEditDocument = (document) => {
    setDocumentToEdit(document);
    setDocumentTitle(document.name);
    setEditDialog(true);
  };

  const handleUpdateTitle = async () => {
    if (!documentToEdit || !documentTitle.trim()) return;
    
    try {
      const { error } = await supabase
        .from('support_documents')
        .update({ name: documentTitle })
        .eq('id', documentToEdit.id);
      
      if (error) throw error;
      
      // Update documents list
      setDocuments(documents.map(doc => 
        doc.id === documentToEdit.id ? { ...doc, name: documentTitle } : doc
      ));
      
      toast({
        title: "Document updated",
        description: "The document name has been updated successfully.",
      });
      
      // Reset state
      setDocumentTitle("");
      setDocumentToEdit(null);
      setEditDialog(false);
    } catch (error) {
      console.error("Error updating document:", error);
      toast({
        title: "Update failed",
        description: "An error occurred while updating the document.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Visit Documents</CardTitle>
            <CardDescription>
              Documents related to this support visit
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
              Add Document
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No documents available yet</p>
            {isAdmin && (
              <Button 
                variant="link" 
                className="mt-2" 
                onClick={() => setUploadDialog(true)}
              >
                Upload documents
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((document) => (
              <div
                key={document.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  {getFileIcon(document.type)}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{document.name}</p>
                    <p className="text-xs text-muted-foreground">{document.size || 'Unknown size'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditDocument(document)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(document)}
                    className="h-8 w-8"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => confirmDelete(document)}
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
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Add documents related to this visit.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <label className="text-sm font-medium">
                Document Title (optional)
              </label>
              <Input
                placeholder="Document title"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                className="mb-2"
              />
              <p className="text-xs text-muted-foreground mb-4">
                If left blank, the file name will be used.
              </p>
              
              <label className="text-sm font-medium">
                Select File
              </label>
              <Input
                id="document"
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                disabled={isUploading}
              />
              <p className="text-xs text-muted-foreground">
                Maximum file size: 10MB
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
                setDocumentTitle("");
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

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={(open) => {
        if (!isUploading) setEditDialog(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Document</DialogTitle>
            <DialogDescription>
              Update the title of this document.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <label className="text-sm font-medium">
                Document Title
              </label>
              <Input
                placeholder="Document title"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => {
                setEditDialog(false);
                setDocumentToEdit(null);
                setDocumentTitle("");
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateTitle}
              disabled={!documentTitle.trim()}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{documentToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteConfirm(false);
              setDocumentToDelete(null);
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