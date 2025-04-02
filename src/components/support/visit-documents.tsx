import { useState, useEffect, useRef } from "react";
import {
  ClipboardList,
  Plus,
  MoreHorizontal,
  Image,
  FileText,
  X,
  Pencil,
  Download,
  Trash,
  Loader2,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { supabase } from "@/lib/supabase";

export default function VisitDocuments({ visitId, franchise }) {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [documentTitle, setDocumentTitle] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      
      // Validate file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File size exceeds 10MB limit");
      }
      
      // Get file extension
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${visitId}/${fileName}`;
      
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase
        .storage
        .from('support-documents')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL for the file
      const { data: urlData } = supabase
        .storage
        .from('support-documents')
        .getPublicUrl(filePath);
      
      // Create document record in the database
      const { data, error: dbError } = await supabase
        .from('support_documents')
        .insert({
          visit_id: visitId,
          title: documentTitle || file.name,
          link: urlData.publicUrl
        })
        .select()
        .single();
      
      if (dbError) throw dbError;
      
      // Update local state
      setDocuments([data, ...documents]);
      
      toast({
        title: "Success",
        description: "Document uploaded successfully.",
      });
      
      // Reset form
      setDocumentTitle("");
      setUploadDialog(false);
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload document.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUpdateTitle = async () => {
    if (!currentDocument || !documentTitle.trim()) return;
    
    try {
      const { error } = await supabase
        .from('support_documents')
        .update({ title: documentTitle })
        .eq('id', currentDocument.id);
      
      if (error) throw error;
      
      // Update local state
      setDocuments(documents.map(doc => 
        doc.id === currentDocument.id ? { ...doc, title: documentTitle } : doc
      ));
      
      toast({
        title: "Success",
        description: "Document title updated successfully.",
      });
      
      // Reset form
      setDocumentTitle("");
      setEditDialog(false);
      setCurrentDocument(null);
    } catch (error) {
      console.error("Error updating document title:", error);
      toast({
        title: "Error",
        description: "Failed to update document title.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDocument = async () => {
    if (!currentDocument) return;
    
    try {
      // Extract file path from URL
      const urlParts = currentDocument.link.split('/');
      const filePath = urlParts.slice(urlParts.indexOf('support-documents') + 1).join('/');
      
      // Delete file from storage
      const { error: storageError } = await supabase
        .storage
        .from('support-documents')
        .remove([filePath]);
      
      if (storageError) {
        console.error("Error removing file from storage:", storageError);
        // Continue even if storage removal fails
      }
      
      // Delete record from database
      const { error: dbError } = await supabase
        .from('support_documents')
        .delete()
        .eq('id', currentDocument.id);
      
      if (dbError) throw dbError;
      
      // Update local state
      setDocuments(documents.filter(doc => doc.id !== currentDocument.id));
      
      toast({
        title: "Success",
        description: "Document deleted successfully.",
      });
      
      // Reset state
      setDeleteConfirm(false);
      setCurrentDocument(null);
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error",
        description: "Failed to delete document.",
        variant: "destructive",
      });
    }
  };

  const getDocumentIcon = (link) => {
    if (!link) return <FileText className="h-4 w-4 mr-2 text-gray-500" />;
    
    const extension = link.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
      return <Image className="h-4 w-4 mr-2 text-blue-500" />;
    } else if (['pdf'].includes(extension)) {
      return <ClipboardList className="h-4 w-4 mr-2 text-red-500" />;
    } else if (['doc', 'docx'].includes(extension)) {
      return <FileText className="h-4 w-4 mr-2 text-blue-600" />;
    } else if (['xls', 'xlsx'].includes(extension)) {
      return <FileText className="h-4 w-4 mr-2 text-green-600" />;
    } else {
      return <FileText className="h-4 w-4 mr-2 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Documents</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setUploadDialog(true)}
            disabled={isUploading}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <>
            {documents.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No documents available
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((document) => (
                  <div 
                    key={document.id} 
                    className="flex items-center justify-between p-2 rounded-lg bg-secondary"
                  >
                    <a href={document.link} target="_blank">
                        <div className="flex items-center flex-1 min-w-0">
                          {getDocumentIcon(document.link)}
                          <span className="text-sm truncate">{document.title} <ExternalLink className="inline w-3 text-gray-400 "></ExternalLink></span> 
                        </div>
                    </a>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setCurrentDocument(document);
                          setDocumentTitle(document.title);
                          setEditDialog(true);
                        }}>
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>Rename</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => window.open(document.link, '_blank')}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          <span>Download</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => {
                            setCurrentDocument(document);
                            setDeleteConfirm(true);
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => setUploadDialog(true)}
                disabled={isUploading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Document
              </Button>
            </div>
          </>
        )}

        {/* Upload Dialog */}
        <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                Upload a document related to this visit.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Title (optional)
                </label>
                <Input 
                  placeholder="Document title"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  If left blank, the file name will be used.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  File
                </label>
                <Input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum file size: 10MB
                </p>
              </div>
              {isUploading && (
                <div className="flex justify-center items-center py-2">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span>Uploading...</span>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setUploadDialog(false);
                  setDocumentTitle("");
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                disabled={isUploading}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialog} onOpenChange={setEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename Document</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input 
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="Document title"
              />
            </div>
            <DialogFooter>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setEditDialog(false);
                  setCurrentDocument(null);
                  setDocumentTitle("");
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateTitle}
                disabled={!documentTitle.trim()}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the document.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setDeleteConfirm(false);
                setCurrentDocument(null);
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteDocument}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}