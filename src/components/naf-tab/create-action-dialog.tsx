import { useState } from "react";
import { Upload, X } from "lucide-react";
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
  // description: string;
  images?: { url: string; name: string }[];
  video_url?: string;
  attachments?: { name: string; url: string; type: string; size: string }[];
}

interface CreateActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (newAction: MarketingAction) => void;
}

export function CreateActionDialog({ open, onOpenChange, onSuccess }: CreateActionDialogProps) {
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    spent: '',
    startDate: '',
    endDate: '',
    // description: '',
    videoUrl: '',
  });

  // Reset form when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Only reset if we're closing
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: '',
      spent: '',
      startDate: '',
      endDate: '',
      // description: '',
      videoUrl: '',
    });
    setImages([]);
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

  // Function to get a truncated file name
  const getTruncatedName = (name) => {
    return name.length > 15 ? `${name.substring(0, 12)}...${name.substring(name.lastIndexOf('.'))}` : name;
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate required fields
      if (!formData.title || !formData.type || !formData.spent || !formData.startDate || !formData.endDate) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Insert marketing action
      const { data: actionData, error: actionError } = await supabase
        .from('marketing_actions')
        .insert({
          title: formData.title,
          type: formData.type,
          spent: parseFloat(formData.spent),
          start_date: formData.startDate,
          end_date: formData.endDate,
          // description: formData.description,
          status: 'planned',
          // spent: 0,
        })
        .select()
        .single();

      if (actionError) throw actionError;

      // Create the new action object to pass back to parent
      const newAction: MarketingAction = {
        id: actionData.id,
        title: actionData.title,
        type: actionData.type,
        spent: actionData.spent,
        // spent: actionData.spent,
        status: actionData.status,
        start_date: actionData.start_date,
        end_date: actionData.end_date,
        // description: actionData.description,
        images: [],
        attachments: []
      };

      // Upload images and create media records
      if (images.length > 0) {
        const uploadedImages = [];
        
        for (const image of images) {
          const fileExt = image.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `marketing-actions/${actionData.id}/${fileName}`;

          // Create a URL for immediate display
          const objectUrl = URL.createObjectURL(image);

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
          console.log("Saving image metadata to database...");
          const { data: mediaData, error: mediaError } = await supabase
            .from('marketing_action_media')
            .insert({
              action_id: actionData.id,
              name: image.name,
              url: publicUrl || filePath, // Use public URL if available, otherwise the path
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

        // Add the images to our new action
        if (uploadedImages.length > 0) {
          newAction.images = uploadedImages;
        }
      }

      // Add YouTube URL if provided
      if (formData.videoUrl) {
        const { error: youtubeError } = await supabase
          .from('marketing_action_media')
          .insert({
            action_id: actionData.id,
            name: 'YouTube Video',
            url: formData.videoUrl,
            type: 'youtube'
          });

        if (youtubeError) {
          console.error("Error saving YouTube URL:", youtubeError);
        } else {
          newAction.video_url = formData.videoUrl;
        }
      }

      // Call the success callback with our new action
      onSuccess(newAction);
      
      // Reset form and close dialog
      resetForm();
      onOpenChange(false);

    } catch (error: any) {
      console.error("Error creating marketing action:", error);
      toast({
        title: "Error creating marketing action",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Marketing Action</DialogTitle>
          <DialogDescription>
            Add a new marketing action to the NAF
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
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Label>Images</Label>
              {images.length > 0 && (
                <Badge variant="outline">{images.length} images</Badge>
              )}
            </div>
            
            {/* Add New Images */}
            <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-2 text-center cursor-pointer hover:border-primary/50 transition-colors">
              <input {...getInputProps()} />
              <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
              <p className="text-sm mt-1">Drop images here or click to upload</p>
            </div>
            
            {/* New Images Preview - Compact Layout */}
            {images.length > 0 && (
              <div className="mt-1">
                <Label className="text-xs text-muted-foreground">Images to Upload</Label>
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
          {/* <div className="grid gap-2">
            <Label>Description</Label>
            <Input
              placeholder="Brief description of the marketing action"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div> */}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Action"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}