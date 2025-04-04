import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
    ArrowLeft,
    Calendar,
    Clock,
    Users,
    Star,
    FileText,
    Edit,
    Trash2,
    Download,
    FileIcon,
    BarChart3,
    Lock,
    Image as ImageIcon,
    User,
    X,
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    Maximize,
    Notebook,
    Pen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { EditEventDialog } from "./edit-event-dialog";
// import { NotesCard } from "./notes-card";
import { AttendanceCard } from "./attendance-card";
import TrainingMaterials from "./training_materials";
import InternalNotesCard from "./internal_notes";
export default function ImageGallery({ images, initialIndex = 0, isOpen, onClose }) {

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
    )
}