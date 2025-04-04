import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Image, ImageOff } from "lucide-react";

// Types
interface MarketingMedia {
  id: string;
  action_id: string;
  name: string;
  url: string;
  type: string;
  created_at: string;
}

interface MarketingAction {
  id: string;
  title: string;
  type: string;
  spent: number;
  status: string;
  start_date: string;
  end_date: string;
  description: string;
}

// Hook to fetch media for a specific marketing action
export function useMarketingMedia(actionId: string) {
  const [media, setMedia] = useState<MarketingMedia[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchMedia() {
      if (!actionId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('marketing_action_media')
          .select('*')
          .eq('action_id', actionId)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        // Separate YouTube URL from images
        const images = data.filter(item => item.type === 'image');
        const youtube = data.find(item => item.type === 'youtube');
        
        setMedia(images);
        setYoutubeUrl(youtube?.url || null);
      } catch (err) {
        console.error('Error fetching marketing media:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchMedia();
  }, [actionId]);

  return { media, youtubeUrl, loading, error };
}

// Gallery Component
interface ImageGalleryProps {
  actionId: string;
  className?: string;
}

export function MarketingImageGallery({ actionId, className = "" }: ImageGalleryProps) {
  const { media, loading, error } = useMarketingMedia(actionId);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  useEffect(() => {
    // Set the first image as selected when media loads
    if (media.length > 0 && !selectedImage) {
      setSelectedImage(media[0].url);
    }
  }, [media, selectedImage]);
  
  if (loading) {
    return <div className="flex items-center justify-center h-48 bg-muted animate-pulse">Loading...</div>;
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-48 bg-muted/20 rounded-md">
        <ImageOff className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Failed to load images</p>
      </div>
    );
  }
  
  if (media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 bg-muted/20 rounded-md">
        <ImageOff className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No images available</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main image display */}
      <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden">
        {selectedImage && (
          <img 
            src={selectedImage} 
            alt="Marketing media" 
            className="w-full h-full object-cover"
          />
        )}
      </div>
      
      {/* Thumbnails */}
      {media.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-1">
          {media.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedImage(item.url)}
              className={`relative w-16 h-16 flex-shrink-0 rounded-sm overflow-hidden ${
                selectedImage === item.url ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <img 
                src={item.url} 
                alt={item.name} 
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Bento Card Preview - Compact thumbnail for marketing actions
interface BentoImagePreviewProps {
  actionId: string;
  className?: string;
}

export function BentoImagePreview({ actionId, className = "" }: BentoImagePreviewProps) {
  const { media, loading, error } = useMarketingMedia(actionId);
  
  if (loading) {
    return <div className="h-20 w-full bg-muted animate-pulse rounded-md"></div>;
  }
  
  if (error || media.length === 0) {
    return (
      <div className="flex items-center justify-center h-20 w-full bg-muted/20 rounded-md">
        <ImageOff className="h-5 w-5 text-muted-foreground" />
      </div>
    );
  }
  
  // Display first image as preview
  return (
    <div className={`relative h-20 w-full bg-muted rounded-md overflow-hidden ${className}`}>
      <img 
        src={media[0].url} 
        alt="Marketing preview" 
        className="w-full h-full object-cover"
      />
      {media.length > 1 && (
        <div className="absolute bottom-1 right-1 bg-background/80 text-foreground rounded-full px-1.5 py-0.5 text-xs">
          +{media.length - 1}
        </div>
      )}
    </div>
  );
}

// Marketing actions list with media integration example
export function MarketingActionsList() {
  const [actions, setActions] = useState<MarketingAction[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchActions() {
      try {
        const { data, error } = await supabase
          .from('marketing_actions')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setActions(data || []);
      } catch (err) {
        console.error('Error fetching marketing actions:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchActions();
  }, []);
  
  if (loading) {
    return <div>Loading actions...</div>;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {actions.map((action) => (
        <div key={action.id} className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">{action.title}</h3>
          
          {/* Compact image preview in bento card */}
          <BentoImagePreview actionId={action.id} className="mb-3" />
          
          <div className="flex justify-between">
            <span className="text-sm">{action.type}</span>
            <span className="text-sm">{action.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Example usage component for detail view
export function MarketingActionDetail({ actionId }: { actionId: string }) {
  const [action, setAction] = useState<MarketingAction | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchAction() {
      try {
        const { data, error } = await supabase
          .from('marketing_actions')
          .select('*')
          .eq('id', actionId)
          .single();
          
        if (error) throw error;
        setAction(data);
      } catch (err) {
        console.error('Error fetching marketing action:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAction();
  }, [actionId]);
  
  if (loading) {
    return <div>Loading action details...</div>;
  }
  
  if (!action) {
    return <div>Action not found</div>;
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{action.title}</h2>
      
      {/* Full image gallery in detail view */}
      <MarketingImageGallery actionId={actionId} />
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
          <p>{action.type}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
          <p>{action.status}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Start Date</h3>
          <p>{new Date(action.start_date).toLocaleDateString()}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">End Date</h3>
          <p>{new Date(action.end_date).toLocaleDateString()}</p>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
        <p>{action.description}</p>
      </div>
    </div>
  );
}