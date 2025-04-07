import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FaRedo, FaArrowLeft, FaArrowRight, FaSyncAlt } from 'react-icons/fa';
import { EventDetails, GeneratedPost } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface ContentStepProps {
  eventDetails: EventDetails & { imageFiles: File[] };
  generatedContent?: GeneratedPost;
  isGenerating: boolean;
  onGenerate: () => void;
  onBack: () => void;
  onNext: (content: string) => void;
}

export function ContentStep({
  eventDetails,
  generatedContent,
  isGenerating,
  onGenerate,
  onBack,
  onNext,
}: ContentStepProps) {
  const [editedContent, setEditedContent] = useState(generatedContent?.content || '');
  const [activeTab, setActiveTab] = useState('generated');
  
  // Update edited content when new generated content arrives
  if (generatedContent?.content && !editedContent && activeTab === 'generated') {
    setEditedContent(generatedContent.content);
  }
  
  const handleContentEdit = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(e.target.value);
  };
  
  const handleNext = () => {
    onNext(editedContent);
  };

  return (
    <Card className="bg-white rounded-lg shadow-md">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Create Content</h2>
        <p className="text-neutral-600 mb-6">
          Our AI has analyzed your event details and writing style to generate a personalized LinkedIn post.
        </p>
        
        <div className="rounded-lg border mb-6">
          <div className="bg-neutral-100 p-4 rounded-t-lg">
            <h3 className="font-medium">Event Summary</h3>
          </div>
          <div className="p-4 space-y-2 text-sm">
            <p><span className="font-medium">Title:</span> {eventDetails.title}</p>
            {eventDetails.date && (
              <p><span className="font-medium">Date:</span> {new Date(eventDetails.date).toLocaleDateString()}</p>
            )}
            {eventDetails.location && (
              <p><span className="font-medium">Location:</span> {eventDetails.location}</p>
            )}
            <p><span className="font-medium">Photos:</span> {eventDetails.imageFiles.length} uploaded</p>
          </div>
        </div>
        
        <Tabs defaultValue="generated" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="generated">Generated Content</TabsTrigger>
            <TabsTrigger value="edit">Edit</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generated" className="space-y-4">
            {isGenerating ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[95%]" />
                <Skeleton className="h-4 w-[85%]" />
                <Skeleton className="h-4 w-[70%]" />
              </div>
            ) : generatedContent ? (
              <>
                <div className="whitespace-pre-wrap border rounded-md p-4 min-h-[200px]">
                  {generatedContent.content}
                </div>
                
                {generatedContent.hashtags && generatedContent.hashtags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Suggested Hashtags:</p>
                    <div className="flex flex-wrap gap-2">
                      {generatedContent.hashtags.map((tag, i) => (
                        <Badge key={i} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  className="mt-2" 
                  onClick={onGenerate}
                  disabled={isGenerating}
                >
                  <FaSyncAlt className="mr-2" />
                  Regenerate
                </Button>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-neutral-600 mb-4">No content generated yet.</p>
                <Button 
                  onClick={onGenerate}
                  disabled={isGenerating}
                  className="bg-[#0077B5] hover:bg-[#005582]"
                >
                  Generate Content
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="edit">
            <Textarea 
              value={editedContent}
              onChange={handleContentEdit}
              placeholder="Edit your post content here..."
              className="min-h-[250px]"
            />
            <p className="text-xs text-neutral-600 mt-2">
              Make any edits to personalize the content to your voice and preferences.
            </p>
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 flex justify-between">
          <Button variant="outline" type="button" onClick={onBack}>
            <FaArrowLeft className="mr-1" /> Back
          </Button>
          <Button 
            type="button" 
            className="bg-[#0077B5] hover:bg-[#005582]"
            onClick={handleNext}
            disabled={!editedContent}
          >
            Continue to Preview <FaArrowRight className="ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
