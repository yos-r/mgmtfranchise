import { Download } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ActivityTabsProps {
  timelineActivities: Array<{
    date: string;
    content: string;
  }>;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size: string;
  }>;
}

export function ActivityTabs({ timelineActivities, attachments = [] }: ActivityTabsProps) {
  return (
    <Card className="w-full shadow-sm">
      <Tabs defaultValue="activity" className="w-full">
        <div className="px-6 pt-3">
          <TabsList className="grid grid-cols-3 -mb-4">
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="activity" className="p-6">
          <div className="flex justify-between items-start mb-3">
            <div className="text-sm font-medium text-gray-700">
              Activity Timeline
            </div>
          </div>

          <div className="space-y-6 mt-4">
            {timelineActivities.map((activity, index) => (
              <div
                key={index}
                className={`pl-6 ${index < timelineActivities.length - 1 ? 'border-l-2 border-gray-200' : ''} relative`}
              >
                <div className="absolute top-0 left-0 w-3 h-3 -ml-1.5 bg-primary rounded-full"></div>
                <p className="text-xs text-gray-500">{activity.date}</p>
                <p className="mt-1 text-sm text-gray-800">{activity.content}</p>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="comments" className="p-6">
          <div className="flex justify-between items-start mb-3">
            <div className="text-sm font-medium text-gray-700">
              Comments
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 px-3 text-xs flex items-center gap-1 text-gray-600 border-gray-300"
            >
              Add Comment
            </Button>
          </div>
          <div className="bg-white rounded-lg mt-4">
            <p className="text-gray-500 text-center py-8 text-sm">No comments yet.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="attachments" className="p-6">
          <div className="flex justify-between items-start mb-3">
            <div className="text-sm font-medium text-gray-700">
              Attachment Files
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 px-3 text-xs flex items-center gap-1 text-gray-600 border-gray-300"
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              Download All
            </Button>
          </div>

          <div className="bg-white rounded-lg mt-2">
            {attachments && attachments.length > 0 ? (
              <>
                {/* Table header */}
                <div className="grid grid-cols-3 gap-4 pb-2 mb-2 border-b text-sm font-medium text-gray-500">
                  <div>File Name</div>
                  <div>Size</div>
                  <div>Action</div>
                </div>
                {attachments.map((attachment, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100 text-sm">
                    <div className="font-medium text-gray-800 flex items-center">
                      <span className="mr-2">
                        {attachment.type.includes('pdf') ? '📄' : 
                         attachment.type.includes('excel') || attachment.type.includes('spreadsheet') ? '📊' : 
                         attachment.type.includes('video') ? '🎬' : '📎'}
                      </span>
                      {attachment.name}
                    </div>
                    <div className="text-gray-600">{attachment.size}</div>
                    <div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2 text-xs flex items-center text-gray-600"
                        asChild
                      >
                        <a href={attachment.url} download>
                          <Download className="h-3.5 w-3.5 mr-1" />
                          Download
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <p className="text-gray-500 text-center py-8 text-sm">No attachments added.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

export default ActivityTabs;