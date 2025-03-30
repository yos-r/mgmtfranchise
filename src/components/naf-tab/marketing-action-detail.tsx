import { useState } from "react";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Euro,
  FileText,
  Save,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  Download,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
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
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { EditActionDialog } from "./edit-action-dialog";

interface MarketingAction {
  id: string;
  title: string;
  type: string;
  budget: number;
  spent: number;
  status: string;
  start_date: string;
  end_date: string;
  description: string;
  images?: { url: string; name: string }[];
  youtube_url?: string;
  attachments?: { name: string; url: string; type: string; size: string }[];
}

interface ActionDetailProps {
  action: MarketingAction;
  onBack: () => void;
  onDelete: (actionId: string) => void;
  onUpdate: (updatedAction: MarketingAction) => void;
}

export function MarketingActionDetail({ action, onBack, onDelete, onUpdate }: ActionDetailProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentAction, setCurrentAction] = useState<MarketingAction>(action);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('marketing_actions')
        .delete()
        .eq('id', currentAction.id);

      if (error) throw error;
      
      // Call the onDelete callback
      onDelete(currentAction.id);
    } catch (error: any) {
      console.error("Error deleting action:", error);
      toast({
        title: "Error",
        description: "Failed to delete the action. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleActionUpdated = (updatedAction: MarketingAction) => {
    // Update local state immediately
    setCurrentAction(updatedAction);
    // Notify parent component
    onUpdate(updatedAction);
    setIsEditing(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'planned':
        return <Badge className="bg-yellow-100 text-yellow-800">Planned</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="button-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketing Actions
          </Button>
          <div>
            <h2 className="tagline-1">{currentAction.title}</h2>
            <p className="body-lead text-muted-foreground">
              {format(new Date(currentAction.start_date), "MMMM d, yyyy")} - {format(new Date(currentAction.end_date), "MMMM d, yyyy")}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setIsEditing(true)}
            className="button-2"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Action
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Action
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Marketing Action</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this marketing action? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Media Section */}
          {(currentAction.youtube_url || (currentAction.images && currentAction.images.length > 0)) && (
            <Card>
              <CardHeader>
                <CardTitle className="tagline-2">Campaign Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentAction.youtube_url && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Campaign Video</h3>
                    <div className="aspect-video rounded-lg overflow-hidden">
                      <iframe
                        className="w-full h-full"
                        src={getYouTubeEmbedUrl(currentAction.youtube_url)}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" asChild>
                        <a href={currentAction.youtube_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open in YouTube
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                {currentAction.images && currentAction.images.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Campaign Images</h3>
                    <Carousel className="w-full">
                      <CarouselContent>
                        {currentAction.images.map((image, index) => (
                          <CarouselItem key={index}>
                            <div className="relative aspect-video">
                              <img
                                src={image.url}
                                alt={image.name}
                                className="w-full h-full object-cover rounded-lg cursor-pointer"
                                onClick={() => setSelectedImage(image.url)}
                              />
                            </div>
                            <p className="text-sm text-muted-foreground mt-2 text-center">{image.name}</p>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Description and Details */}
          <Card>
            <CardHeader>
              <CardTitle className="tagline-2">Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Start Date</span>
                  </div>
                  <p>{format(new Date(currentAction.start_date), "MMMM d, yyyy")}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">End Date</span>
                  </div>
                  <p>{format(new Date(currentAction.end_date), "MMMM d, yyyy")}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Description</h3>
                <p className="text-muted-foreground">{currentAction.description}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Budget Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Spent</span>
                    <p className="text-xl font-semibold">€{currentAction.spent.toLocaleString()}</p>
                  </div>
                  {/* <div>
                    <span className="text-sm text-muted-foreground">Spent</span>
                    <p className="text-xl font-semibold">€{currentAction.spent.toLocaleString()}</p>
                  </div> */}
                </div>
                {/* <div className="w-full h-2 bg-secondary rounded-full mt-2">
                  <div
                    className="h-2 bg-primary rounded-full"
                    style={{ width: `${Math.min((currentAction.spent / currentAction.budget) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground text-right">
                  {Math.round((currentAction.spent / currentAction.budget) * 100)}% of budget used
                </p> */}
              </div>
            </CardContent>
          </Card>

          {/* Attachments Section */}
          {currentAction.attachments && currentAction.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="tagline-2">Campaign Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentAction.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{attachment.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {attachment.type} • {attachment.size}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                        <a href={attachment.url} download>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="tagline-2">Campaign Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status</span>
                  {getStatusBadge(currentAction.status)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm">
                    {Math.round((currentAction.spent / currentAction.budget) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Days Remaining</span>
                  <span className="text-sm">
                    {Math.max(0, Math.ceil((new Date(currentAction.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="tagline-2">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
                <Button className="w-full" variant="outline">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            <img
              src={selectedImage || ''}
              alt="Preview"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <EditActionDialog
        action={currentAction}
        open={isEditing}
        onOpenChange={setIsEditing}
        onSuccess={handleActionUpdated}
      />
    </div>
  );
}