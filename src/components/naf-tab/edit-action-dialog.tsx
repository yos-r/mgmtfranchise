import { useState, useEffect } from "react";
import { Upload, X, FileImage } from "lucide-react";
import { useDropzone } from 'react-dropzone';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";

interface MarketingAction {
  id: string;
  title: string;
  type: string;
  // budget: number;
  spent: number;
  status: string;
  start_date: string;
  end_date: string;
  description: string;
  images?: { url: string; name: string }[];
  video_url?: string;
  attachments?: { name: string; url: string; type: string; size: string }[];
}

interface EditActionDialogProps {
  action: MarketingAction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updatedAction: MarketingAction) => void;
}

export function EditActionDialog({
  action,
  open,
  onOpenChange,
  onSuccess,
}: EditActionDialogProps) {
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<Array<{ url: string; name: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    spent: '',
    status: '',
    startDate: '',
    endDate: '',
    description: '',
    youtubeUrl: '',
  });

  // Initialize the form data when the dialog opens or action changes
  useEffect(() => {
    if (open && action) {
      setFormData({
        title: action.title || '',
        type: action.type || '',
        spent: action.spent?.toString() || '',
        status: action.status || 'planned',
        startDate: action.start_date?.split('T')[0] || '',
        endDate: action.end_date?.split('T')[0] || '',
        description: action.description || '',
        youtubeUrl: action.video_url || '',
      });

      // Set existing images if any
      if (action.images && action.images.length > 0) {
        setExistingImages(action.images);
      } else {
        setExistingImages([]);
      }
    }
  }, [open, action]);

  // Handle dialog close
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Only reset if we're closing
      setImages([]);
    }
    onOpenChange(newOpen);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': []
    },
    onDrop: (acceptedFiles) => {
      setImages([...images, ...acceptedFiles]);
    }
  });

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate required fields
      if (!formData.title || !formData.type || !formData.spent || !formData.startDate || !formData.endDate || !formData.status) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Update marketing action
      const { data: actionData, error: actionError } = await supabase
        .from('marketing_actions')
        .update({
          title: formData.title,
          type: formData.type,
          spent: parseFloat(formData.spent),
          status: formData.status,
          start_date: formData.startDate,
          end_date: formData.endDate,
          description: formData.description,
        })
        .eq('id', action.id)
        .select()
        .single();

      if (actionError) throw actionError;

      // Create the updated action object
      const updatedAction: MarketingAction = {
        ...action,
        title: actionData.title,
        type: actionData.type,
        spent: actionData.spent,
        status: actionData.status,
        start_date: actionData.start_date,
        end_date: actionData.end_date,
        description: actionData.description,
        images: [...existingImages],
      };

      // Handle removed existing images
      const removedImages = (action.images || []).filter(
        img => !existingImages.some(ei => ei.url === img.url)
      );

      // Delete removed images from database and storage
      for (const img of removedImages) {
        // Extract path from URL if needed
        const urlParts = img.url.split('/');
        const filename = urlParts[urlParts.length - 1];
        const storagePath = `marketing-actions/${action.id}/${filename}`;

        // Delete the media record first
        await supabase
          .from('marketing_action_media')
          .delete()
          .eq('action_id', action.id)
          .eq('url', img.url);

        // Attempt to delete from storage
        try {
          await supabase.storage
            .from('marketing-media')
            .remove([storagePath]);
        } catch (err) {
          console.error("Error removing image from storage:", err);
          // Continue even if storage deletion fails
        }
      }

      // Upload new images and create media records
      if (images.length > 0) {
        const uploadedImages = [];
        
        for (const image of images) {
          const fileExt = image.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `marketing-actions/${action.id}/${fileName}`;

          // Upload to storage
          const { data: storageData, error: uploadError } = await supabase.storage
            .from('marketing-media')
            .upload(filePath, image);

          if (uploadError) {
            console.error("Error uploading image:", uploadError);
            continue; // Skip this image but continue processing others
          }

          // Get public URL for the uploaded file
          const { data: { publicUrl } } = supabase.storage
            .from('marketing-media')
            .getPublicUrl(filePath);

          // Add media record to database
          const { data: mediaData, error: mediaError } = await supabase
            .from('marketing_action_media')
            .insert({
              action_id: action.id,
              name: image.name,
              url: publicUrl || filePath,
              type: 'image'
            });

          if (mediaError) {
            console.error("Error saving image metadata:", mediaError);
            continue;
          }

          // Add to our array of uploaded images
          uploadedImages.push({
            url: publicUrl || filePath,
            name: image.name
          });
        }

        // Add the new images to our updated action
        if (uploadedImages.length > 0) {
          updatedAction.images = [...existingImages, ...uploadedImages];
        }
      }

      // Update YouTube URL if it has changed
      if (formData.youtubeUrl !== action.video_url) {
        // Delete old YouTube URL record if it exists
        if (action.video_url) {
          await supabase
            .from('marketing_action_media')
            .delete()
            .eq('action_id', action.id)
            .eq('type', 'youtube');
        }

        // Add new YouTube URL if provided
        if (formData.youtubeUrl) {
          const { error: youtubeError } = await supabase
            .from('marketing_action_media')
            .insert({
              action_id: action.id,
              name: 'YouTube Video',
              url: formData.youtubeUrl,
              type: 'youtube'
            });

          if (youtubeError) {
            console.error("Error saving YouTube URL:", youtubeError);
          } else {
            updatedAction.video_url = formData.youtubeUrl;
          }
        } else {
          updatedAction.video_url = undefined;
        }
      }

      // Call the success callback with our updated action
      onSuccess(updatedAction);
      
      // Close dialog
      onOpenChange(false);

    } catch (error: any) {
      console.error("Error updating marketing action:", error);
      toast({
        title: "Error updating marketing action",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to get a truncated file name
  const getTruncatedName = (name) => {
    return name.length > 15 ? `${name.substring(0, 12)}...${name.substring(name.lastIndexOf('.'))}` : name;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Marketing Action</DialogTitle>
          <DialogDescription>
            Update the marketing action details
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Title</Label>
            <Input
              placeholder="Marketing action title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="advertising">Advertising</SelectItem>
                  <SelectItem value="digital">Digital Marketing</SelectItem>
                  <SelectItem value="branding">Branding</SelectItem>
                  <SelectItem value="events">Events</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Spent</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={formData.spent}
              onChange={(e) => setFormData({ ...formData, spent: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Video URL</Label>
            <Input
              placeholder="https://www.youtube.com/watch?v=..."
              value={formData.youtubeUrl}
              onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Label>Images</Label>
              <Badge variant="outline">{existingImages.length + images.length} images</Badge>
            </div>
            
            {/* Existing Images - Compact Layout */}
            {existingImages.length > 0 && (
              <div className="mt-1">
                <Label className="text-xs text-muted-foreground">Current Images</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {existingImages.map((img, index) => (
                    <div 
                      key={`existing-${index}`} 
                      className="relative bg-muted rounded-md p-1 flex items-center group"
                    >
                      <div className="w-6 h-6 flex-shrink-0 mr-1">
                        <img
                          src={img.url}
                          alt={img.name}
                          className="w-6 h-6 object-cover rounded"
                        />
                      </div>
                      <span className="text-xs">{getTruncatedName(img.name)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 ml-1"
                        onClick={() => removeExistingImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Add New Images */}
            <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-2 text-center cursor-pointer hover:border-primary/50 transition-colors">
              <input {...getInputProps()} />
              <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
              <p className="text-sm mt-1">Drop new images here or click to upload</p>
            </div>
            
            {/* New Images Preview - Compact Layout */}
            {images.length > 0 && (
              <div className="mt-1">
                <Label className="text-xs text-muted-foreground">New Images to Upload</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {images.map((file, index) => (
                    <div 
                      key={`new-${index}`} 
                      className="relative bg-muted rounded-md p-1 flex items-center group"
                    >
                      <div className="w-6 h-6 flex-shrink-0 mr-1">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-6 h-6 object-cover rounded"
                        />
                      </div>
                      <span className="text-xs">{getTruncatedName(file.name)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 ml-1"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeImage(index);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="grid gap-2">
            <Label>Description</Label>
            <Input
              placeholder="Brief description of the marketing action"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}