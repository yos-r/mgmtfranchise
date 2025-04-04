import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
    ArrowLeft,
    Calendar,
    FileText,
    Save,
    X,
    ExternalLink,
    Download,
    Edit,
    Trash2,
    PieChart,
    BarChart2,
    ArrowRight,
    ImageIcon,
    Banknote,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { EditActionDialog } from "./edit-action-dialog";
import ImageGallery from "./image-gallery";
import ActivityTabs from "./activity-tabs";
import ChannelDistributionCard from "./channel-distribution-card";

// Import the useMarketingMedia hook
import { useMarketingMedia } from "./marketing-media-loader";

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
    video_url?: string;
    attachments?: { name: string; url: string; type: string; size: string }[];
    channel_distribution?: Record<string, number>;
}

interface ActionDetailProps {
    action: MarketingAction;
    onBack: () => void;
    onDelete: (actionId: string) => void;
    onUpdate: (updatedAction: MarketingAction) => void;
}

export function MarketingActionDetail({ action, onBack, onDelete, onUpdate }: ActionDetailProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentAction, setCurrentAction] = useState<MarketingAction>(action);
    const { toast } = useToast();
    
    // Use the hook to fetch media for this action
    const { media, youtubeUrl, loading: mediaLoading, error: mediaError } = useMarketingMedia(currentAction.id);
    
    // State for gallery
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [initialImageIndex, setInitialImageIndex] = useState(0);

    // Update the action with media when it loads
    useEffect(() => {
        if (media.length > 0 || youtubeUrl) {
            setCurrentAction(prev => ({
                ...prev,
                images: media.map(item => ({ url: item.url, name: item.name })),
                video_url: youtubeUrl || prev.video_url
            }));
        }
    }, [media, youtubeUrl]);

    // Convert media to format needed by ImageGallery
    const galleryImages = media.map((item, index) => ({
        id: index,
        src: item.url,
        alt: item.name,
        thumb: item.url
    }));

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

    const handleChannelDistributionUpdate = (updatedDistribution: Record<string, number>) => {
        // Update local state with new distribution
        setCurrentAction(prev => ({
            ...prev,
            channel_distribution: updatedDistribution
        }));
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
        if (!url) return '';
        const videoId = url.split('v=')[1]?.split('&')[0];
        return `https://www.youtube.com/embed/${videoId}`;
    };

    const openGallery = (index) => {
        setInitialImageIndex(index);
        setGalleryOpen(true);
    };

    const percentUsed = Math.round((currentAction.spent / currentAction.budget) * 100);
    const daysRemaining = Math.max(0, Math.ceil((new Date(currentAction.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
    
    // Placeholder data for timeline activities
    const timelineActivities = [
        { date: "April 2, 2025 - 10:23 AM", content: "Sarah Johnson updated the campaign status to \"Active\"" },
        { date: "April 1, 2025 - 3:45 PM", content: "Michael Lee added a new creative asset" },
        { date: "March 28, 2025 - 11:12 AM", content: "Budget increased from €75,000 to €85,000" },
        { date: "March 25, 2025 - 9:30 AM", content: "LinkedIn ads campaign launched" },
        { date: "March 20, 2025 - 2:15 PM", content: "Email sequence approved" }
    ];

    return (
        <div className="">
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-2">
                        <Button variant="ghost" onClick={onBack} className="p-2">
                            <ArrowLeft className="h-5 w-5 mr-3" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {currentAction.title}
                            </h1>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <Calendar className="mr-1 h-3.5 w-3.5" />
                                <span>{format(new Date(currentAction.start_date), "MMMM d, yyyy")}</span>
                                <ArrowRight className="w-3 mx-2"></ArrowRight>
                                <Calendar className="mr-1 h-3.5 w-3.5" />
                                <span>{format(new Date(currentAction.end_date), "MMMM d, yyyy")}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => setIsEditing(true)}
                            className="flex items-center"
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" disabled={isDeleting}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
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

                <div className="flex gap-6">
                    {/* Main Content (2/3) */}
                    <div className="w-2/3 space-y-6">
                        {/* Bento Grid for Images - Dynamic from database */}
                        {galleryImages.length > 0 && <div className="grid grid-cols-2 md:grid-cols-3 gap-3 aspect-video relative overflow-hidden rounded-lg">
                            {mediaLoading ? (
                                <div className="col-span-3 flex items-center justify-center bg-muted rounded-lg">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : mediaError || galleryImages.length === 0 ? (
                                // <div className="col-span-3 flex flex-col items-center justify-center bg-muted/20 rounded-lg p-6">
                                //     <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                                //     <p className="text-muted-foreground">No images available</p>
                                // </div>
                                <div></div>
                            ) : (
                                <>
                                    {/* First image (large) */}
                                    {galleryImages.length > 0 && (
                                        <div
                                            className="col-span-2 row-span-2 bg-muted rounded-lg overflow-hidden cursor-pointer"
                                            onClick={() => openGallery(0)}
                                        >
                                            <img
                                                src={galleryImages[0].src}
                                                alt={galleryImages[0].alt}
                                                className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                                            />
                                        </div>
                                    )}
                                    
                                    {/* Second image (if available) */}
                                    {galleryImages.length > 1 && (
                                        <div
                                            className="bg-muted rounded-lg overflow-hidden cursor-pointer"
                                            onClick={() => openGallery(1)}
                                        >
                                            <img
                                                src={galleryImages[1].src}
                                                alt={galleryImages[1].alt}
                                                className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                                            />
                                        </div>
                                    )}
                                    
                                    {/* Third image (if available) */}
                                    {galleryImages.length > 2 && (
                                        <div
                                            className="bg-muted rounded-lg overflow-hidden cursor-pointer"
                                            onClick={() => openGallery(2)}
                                        >
                                            <img
                                                src={galleryImages[2].src}
                                                alt={galleryImages[2].alt}
                                                className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                                            />
                                        </div>
                                    )}
                                    
                                    {/* Fill empty spaces if not enough images */}
                                    {galleryImages.length === 1 && (
                                        <>
                                            <div className="bg-muted rounded-lg"></div>
                                            <div className="bg-muted rounded-lg"></div>
                                        </>
                                    )}
                                    
                                    {galleryImages.length === 2 && (
                                        <div className="bg-muted rounded-lg"></div>
                                    )}
                                    
                                    {/* View All button - only if there are images */}
                                    {galleryImages.length > 0 && (
                                        <Button
                                            variant="secondary"
                                            className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm"
                                            onClick={() => openGallery(0)}
                                        >
                                            <ImageIcon className="h-4 w-4 mr-2" />
                                            View All Photos ({galleryImages.length})
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>}

                        <Card>
                            <CardHeader className="pb-3 border-b">
                                <div className="flex justify-between items-center">
                                    <CardTitle>Marketing Action Details</CardTitle>
                                    {getStatusBadge(currentAction.status)}
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-2 gap-y-4 mb-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Name:</p>
                                        <p>{currentAction.title}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Type:</p>
                                        <p>{currentAction.type}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Start Date:</p>
                                        <p>{format(new Date(currentAction.start_date), "MMMM d, yyyy")}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">End Date:</p>
                                        <p>{format(new Date(currentAction.end_date), "MMMM d, yyyy")}</p>
                                    </div>
                                </div>

                                {currentAction.description && (
                                    <div className="mb-4">
                                        <p className="text-sm font-medium text-gray-500 mb-1">Description:</p>
                                        <p className="text-gray-700">{currentAction.description}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* YouTube Video - Using dynamically loaded URL */}
                        {youtubeUrl && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Campaign Video</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="aspect-video rounded-lg overflow-hidden">
                                        <iframe
                                            className="w-full h-full"
                                            src={getYouTubeEmbedUrl(youtubeUrl)}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>
                                    <div className="flex justify-end mt-3">
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={youtubeUrl} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                Open in YouTube
                                            </a>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Metrics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-6 mb-6">
                                    <div>
                                        <p className="text-sm text-gray-500">Impressions</p>
                                        <p className="text-xl font-semibold">856,423</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Clicks</p>
                                        <p className="text-xl font-semibold">32,856</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Conversions</p>
                                        <p className="text-xl font-semibold">1,243</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">CTR</p>
                                        <p className="text-xl font-semibold">3.84%</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Cost per Lead</p>
                                        <p className="text-xl font-semibold">€42.65</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">ROI</p>
                                        <p className="text-xl font-semibold">247%</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <ActivityTabs 
                            timelineActivities={timelineActivities} 
                            attachments={currentAction.attachments}
                        />
                    </div>

                    {/* Sidebar (1/3) */}
                    <div className="w-1/3 space-y-6">
                        <div className="flex flex-col justify-between p-5 bg-white border rounded-lg shadow-sm h-44 hover:shadow-md transition-shadow duration-200">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-medium text-obsessedgrey bg-relentlessgold/30 px-3 py-1.5 rounded-full">
                                    Budget
                                </span>
                                <Banknote className="h-5 w-5 text-[#252526]" />
                            </div>
                            <div className="flex flex-col items-center justify-center flex-grow">
                                <p className="text-5xl font-bold text-obsessedgrey tracking-tight">€{currentAction.spent.toLocaleString('fr-FR')}</p>
                                <p className="text-sm text-gray-500 mt-2">Total Budget Spent</p>
                            </div>
                        </div>
                        
                        {/* Using the new ChannelDistributionCard component */}
                        <ChannelDistributionCard 
                            actionId={currentAction.id}
                            initialDistribution={currentAction.channel_distribution}
                            onUpdate={handleChannelDistributionUpdate}
                        />

                        <Card>
                            <CardHeader>
                                <CardTitle>Campaign Status</CardTitle>
                            </CardHeader>
                            <CardContent className="pb-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center">
                                            <Calendar className="h-5 w-5 text-gray-500 mr-3" />
                                            <span>Days Remaining</span>
                                        </div>
                                        <span className="font-medium">{daysRemaining} days</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center">
                                            <BarChart2 className="h-5 w-5 text-gray-500 mr-3" />
                                            <span>Progress</span>
                                        </div>
                                        <span className="font-medium">{percentUsed}%</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center">
                                            <PieChart className="h-5 w-5 text-gray-500 mr-3" />
                                            <span>ROI</span>
                                        </div>
                                        <span className="font-medium">247%</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Pass the dynamic galleryImages to the ImageGallery component */}
            <ImageGallery
                images={galleryImages}
                initialIndex={initialImageIndex}
                isOpen={galleryOpen}
                onClose={() => setGalleryOpen(false)}
            />
            <EditActionDialog
                action={currentAction}
                open={isEditing}
                onOpenChange={setIsEditing}
                onSuccess={handleActionUpdated}
            />
        </div>
    );
}