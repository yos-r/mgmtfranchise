import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  Trash2,
  BarChart3,
  ImageIcon,
  User,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { EditEventDialog } from "./edit-event-dialog";
import { AttendanceCard } from "./attendance-card";
import TrainingMaterials from "./training_materials";
import InternalNotesCard from "./internal_notes";
import EventRatings from "./event-ratings";
import EventInfo from "./event-info";

// Define interface for TrainingEvent based on database schema
interface TrainingEvent {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  duration: string;
  description: string | null;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  trainer: string | null;
  trainer_rating: number | null;
  notes: string | null;
  session_rating: number | null;
  note_by: string | null;
  // Add relationships that might be included in queries
  training_attendance?: Array<{
    id: string;
    event_id: string;
    franchise_id: string;
    attended: boolean;
    franchises?: {
      id: string;
      name: string;
      // Add other fields from franchises as needed
    }
  }>;
}

// Sample images for the bento grid
const demoImages = [
  {
    id: 1,
    src: "https://media.istockphoto.com/id/2116544916/photo/happy-business-leader-talking-to-group-of-his-colleagues-on-a-seminar-in-board-room.jpg?s=1024x1024&w=is&k=20&c=ME144TkMSs0dVSW9Abi-jnYBjfAh1VtgOcZZYiA3bL0=",
    alt: "Training session",
    thumb: "https://media.istockphoto.com/id/2116544916/photo/happy-business-leader-talking-to-group-of-his-colleagues-on-a-seminar-in-board-room.jpg?s=612x612&w=is&k=20&c=xL9JQbmk_Vy6q14Gbs0zzB0Ui2UUoMQ5GIcKVKjtf1M="
  },
  {
    id: 2,
    src: "https://media.istockphoto.com/id/1396788272/photo/mid-adult-ceo-giving-a-business-presentation-to-his-colleagues-on-whiteboard-in-the-office.jpg?s=612x612&w=0&k=20&c=nydUtUWSoVV2syO1WQe3zZ9q43cSP3EBPwpUjkO5Eec=",
    alt: "Group activity",
    thumb: "https://media.istockphoto.com/id/1396788272/photo/mid-adult-ceo-giving-a-business-presentation-to-his-colleagues-on-whiteboard-in-the-office.jpg?s=612x612&w=0&k=20&c=nydUtUWSoVV2syO1WQe3zZ9q43cSP3EBPwpUjkO5Eec="
  },
  {
    id: 3,
    src: "https://media.istockphoto.com/id/2162033406/photo/group-business-meeting-at-bright-beige-office.jpg?s=1024x1024&w=is&k=20&c=11McT9_IOtNUo4IVPuL2012P-8Ev_Pe2hqmyzAbQW5M=",
    alt: "Presentation",
    thumb: "https://media.istockphoto.com/id/2162033406/photo/group-business-meeting-at-bright-beige-office.jpg?s=612x612&w=is&k=20&c=i7Q9UXuCjqXS05R5eXMpWRzMqeQG9rACa9gPIrZJ0n4="
  },
  {
    id: 4,
    src: "https://media.istockphoto.com/id/1061632686/photo/hes-got-a-wealth-of-experience-to-share.jpg?s=612x612&w=0&k=20&c=VidySX8N-sMmzMod-GJdgrCcMAjdlYsl_B5IHZSrOVQ=",
    alt: "Workshop",
    thumb: "https://media.istockphoto.com/id/1061632686/photo/hes-got-a-wealth-of-experience-to-share.jpg?s=612x612&w=0&k=20&c=VidySX8N-sMmzMod-GJdgrCcMAjdlYsl_B5IHZSrOVQ="
  },
];

// Custom Image Gallery Component
const ImageGallery = ({ images, initialIndex = 0, isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    // Reset zoom when changing images
    setZoomLevel(1);
  }, [currentIndex]);

  useEffect(() => {
    // Add keyboard event listeners
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent scrolling while gallery is open
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = ''; // Restore scrolling
    };
  }, [isOpen, currentIndex]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const zoomIn = () => {
    setZoomLevel((prevZoom) => Math.min(prevZoom + 0.25, 3));
  };

  const zoomOut = () => {
    setZoomLevel((prevZoom) => Math.max(prevZoom - 0.25, 0.5));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      {/* Close button */}
      <button
        className="absolute top-4 right-4 z-50 p-2 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-colors"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </button>

      {/* Image navigation */}
      <button
        className="absolute left-4 z-50 p-3 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-colors"
        onClick={goToPrevious}
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        className="absolute right-4 p-3 z-50 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-colors"
        onClick={goToNext}
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-black bg-opacity-60 p-2 rounded-lg">
        <button
          className="p-2 text-white rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
          onClick={zoomOut}
        >
          <ZoomOut className="h-5 w-5" />
        </button>
        <div className="text-white text-sm">{Math.round(zoomLevel * 100)}%</div>
        <button
          className="p-2 text-white rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
          onClick={zoomIn}
        >
          <ZoomIn className="h-5 w-5" />
        </button>
        <div className="w-px h-6 bg-gray-500 mx-1"></div>
        <button
          className="p-2 text-white rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
          onClick={toggleFullscreen}
        >
          <Maximize className="h-5 w-5" />
        </button>
      </div>

      {/* Current image */}
      <div
        className="relative h-full w-full flex items-center justify-center overflow-hidden"
        style={{
          cursor: 'grab',
        }}
      >
        <img
          src={images[currentIndex].src}
          alt={images[currentIndex].alt}
          className="max-h-[85vh] max-w-[85vw] object-contain transition-transform duration-200"
          style={{
            transform: `scale(${zoomLevel})`,
          }}
        />
      </div>

      {/* Image counter */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Caption */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-white text-center bg-black bg-opacity-60 px-4 py-2 rounded-md">
        {images[currentIndex].alt}
      </div>

      {/* Thumbnails */}
      <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] p-2">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`w-16 h-16 rounded-md overflow-hidden cursor-pointer border-2 transition-colors ${index === currentIndex ? 'border-white' : 'border-transparent'
              }`}
            onClick={() => setCurrentIndex(index)}
          >
            <img
              src={image.src}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

interface EventDetailProps {
  event: TrainingEvent;
  onBack: () => void;
  isAdmin?: boolean;
}

export function EventDetail({ event, onBack, isAdmin = true }: EventDetailProps) {
  const { toast } = useToast();
  const [currentEvent, setCurrentEvent] = useState<TrainingEvent>(event);
  const [isNotesUpdated, setIsNotesUpdated] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // State for custom gallery
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [initialImageIndex, setInitialImageIndex] = useState(0);

  // Sync with event props when they change
  useEffect(() => {
    setCurrentEvent(event);
  }, [event]);

  // Separated handlers for trainer and session ratings
  const handleTrainerRatingChange = (rating: number) => {
    console.log("handleTrainerRatingChange called with:", rating);


    currentEvent.trainer_rating = rating

    toast({
      title: "Trainer rating updated",
      description: "The trainer rating has been saved successfully",
    });
  };

  const handleSessionRatingChange = (rating: number) => {
    console.log("handleSessionRatingChange called with:", rating);

    // Immediately update the local state first for immediate UI feedback
    // setCurrentEvent(prev => ({
    //   ...prev,
    //   session_rating: rating
    // }));
    currentEvent.session_rating = rating

    toast({
      title: "Session rating updated",
      description: "The session rating has been saved successfully",
    });
  };

  const saveInternalNotes = async (notes: string, noteBy?: string) => {
    try {
      const { error } = await supabase
        .from('training_events')
        .update({
          notes: notes,
          note_by: noteBy || currentEvent.note_by
        })
        .eq('id', currentEvent.id);

      if (error) throw error;

      // Update currentEvent to keep it in sync
      // setCurrentEvent(prev => ({
      //   ...prev,
      //   notes: notes,
      //   note_by: noteBy || prev.note_by
      // }));
      currentEvent.notes = notes || currentEvent.notes;
      currentEvent.note_by = noteBy || currentEvent.note_by

      toast({
        title: "Notes updated",
        description: "Internal notes have been saved",
      });
      setIsNotesUpdated(false);
    } catch (error) {
      console.error("Error saving notes:", error);
      toast({
        title: "Update failed",
        description: "Failed to save internal notes",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('training_events')
        .delete()
        .eq('id', currentEvent.id);

      if (error) throw error;

      toast({
        title: "Event deleted",
        description: "The training event has been deleted successfully",
      });
      onBack();
    } catch (error: any) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "Failed to delete the event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAttendanceUpdate = async () => {
    try {
      const { data, error } = await supabase
        .from('training_events')
        .select(`
          *,
          training_attendance(
            *,
            franchises(*)
          )
        `)
        .eq('id', currentEvent.id)
        .single();

      if (error) throw error;

      if (data) {
        // Update the entire currentEvent state with fresh data
        setCurrentEvent(data as TrainingEvent);
      }
    } catch (error) {
      console.error("Error refreshing event data:", error);
      toast({
        title: "Error",
        description: "Failed to refresh event data",
        variant: "destructive",
      });
    }
  };

  // Use current event data from state to reflect updates
  const attendeeCount = currentEvent.training_attendance?.length || 0;
  const presentCount = currentEvent.training_attendance?.filter(a => a.attended)?.length || 0;
  const absentCount = attendeeCount - presentCount;
  const attendanceRate = attendeeCount > 0 ? Math.round((presentCount / attendeeCount) * 100) : 0;

  // Function to open gallery at specific index
  const openGallery = (index: number) => {
    setInitialImageIndex(index);
    setGalleryOpen(true);
  };

  return (
    <div className="container pt-0 py-6 space-y-6">
      {/* Header with Back Button and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" onClick={onBack} className="mr-2 p-0 h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {currentEvent.title}
            </h1>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Calendar className="mr-1 h-3.5 w-3.5" />
              <span>{format(new Date(currentEvent.date), "MMMM d, yyyy")}</span>
              <Clock className="ml-3 mr-1 h-3.5 w-3.5" />
              <span>{currentEvent.time}</span>
              <span className="mx-2">•</span>
              <span>{currentEvent.duration}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Event</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this event? This action cannot be undone.
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

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section (2/3 on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bento Grid for Images */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 aspect-video relative overflow-hidden rounded-lg">
            <div
              className="col-span-2 row-span-2 bg-muted rounded-lg overflow-hidden cursor-pointer"
              onClick={() => openGallery(0)}
            >
              <img
                src={demoImages[0].src}
                alt={demoImages[0].alt}
                className="w-full h-full object-cover hover:opacity-90 transition-opacity"
              />
            </div>
            <div
              className="bg-muted rounded-lg overflow-hidden cursor-pointer"
              onClick={() => openGallery(1)}
            >
              <img
                src={demoImages[1].src}
                alt={demoImages[1].alt}
                className="w-full h-full object-cover hover:opacity-90 transition-opacity"
              />
            </div>
            <div
              className="bg-muted rounded-lg overflow-hidden cursor-pointer"
              onClick={() => openGallery(2)}
            >
              <img
                src={demoImages[2].src}
                alt={demoImages[2].alt}
                className="w-full h-full object-cover hover:opacity-90 transition-opacity"
              />
            </div>

            <Button
              variant="secondary"
              className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm"
              onClick={() => openGallery(0)}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              View All Photos
            </Button>
          </div>

          <EventInfo currentEvent={currentEvent} eventId={currentEvent} />
          
          <AttendanceCard
            event={currentEvent}
            onAttendanceUpdate={handleAttendanceUpdate}
          />
        </div>

        <div className="space-y-6">
          <EventRatings
            eventId={currentEvent.id}
            trainerRating={currentEvent.trainer_rating}
            sessionRating={currentEvent.session_rating}
            trainerName={currentEvent.trainer || undefined}
            onTrainerRatingChange={handleTrainerRatingChange}
            onSessionRatingChange={handleSessionRatingChange}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <BarChart3 className="h-4 w-4 mr-2 text-muted-foreground" />
                Attendance Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-primary">
                    {attendanceRate}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Attendance Rate
                  </p>
                </div>

                <Progress
                  value={attendanceRate}
                  className="h-2 w-full mb-6"
                />

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="text-lg font-semibold">{attendeeCount}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-lg font-semibold text-green-600">{presentCount}</div>
                    <div className="text-xs text-green-700">Present</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="text-lg font-semibold text-red-600">{absentCount}</div>
                    <div className="text-xs text-red-700">Absent</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <TrainingMaterials eventId={currentEvent.id} />

          <InternalNotesCard
            eventId={currentEvent.id}
            initialNotes={currentEvent.notes || ""}
            noteBy={currentEvent.note_by || ""}
            onSave={(notes, noteBy) => {
              // Direct mutation (works without re-rendering issues)
              currentEvent.notes = notes;
              currentEvent.note_by = noteBy;

              // Also update the database
              supabase
                .from('training_events')
                .update({
                  notes: notes,
                  note_by: noteBy
                })
                .eq('id', currentEvent.id)
                .then(() => {
                  toast({
                    title: "Notes updated",
                    description: "Internal notes have been saved",
                  });
                });
            }}
          />
        </div>
      </div>

      <EditEventDialog
        event={currentEvent}
        open={isEditing}
        onOpenChange={setIsEditing}
        onSuccess={handleAttendanceUpdate}
      />

      <ImageGallery
        images={demoImages}
        initialIndex={initialImageIndex}
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
      />
    </div>
  );
}