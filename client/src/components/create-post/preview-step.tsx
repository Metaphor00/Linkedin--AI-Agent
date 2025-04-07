import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar } from '@/components/ui/avatar';
import { EventDetails } from '@shared/schema';
import { FaThumbsUp, FaComment, FaShare, FaArrowLeft, FaArrowRight, FaLinkedin } from 'react-icons/fa';

interface PreviewStepProps {
  eventDetails: EventDetails & { imageFiles: File[] };
  content: string;
  onBack: () => void;
  onNext: () => void;
}

export function PreviewStep({ eventDetails, content, onBack, onNext }: PreviewStepProps) {
  // Create urls for preview
  const imageUrls = eventDetails.imageFiles.map(file => URL.createObjectURL(file));
  
  return (
    <Card className="bg-white rounded-lg shadow-md">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Preview Post</h2>
        <p className="text-neutral-600 mb-6">
          Review how your post will appear on LinkedIn before scheduling or publishing.
        </p>
        
        {/* LinkedIn post preview */}
        <div className="border rounded-lg shadow mb-8 max-w-xl mx-auto">
          {/* Header */}
          <div className="p-4 flex items-center">
            <Avatar className="h-12 w-12">
              <div className="bg-neutral-300 h-full w-full flex items-center justify-center text-neutral-700">
                JD
              </div>
            </Avatar>
            <div className="ml-3">
              <p className="font-semibold">John Doe</p>
              <p className="text-xs text-neutral-600">Your professional headline</p>
              <p className="text-xs text-neutral-500">Just now</p>
            </div>
          </div>
          
          {/* Content */}
          <div className="px-4 pb-3">
            <p className="whitespace-pre-wrap mb-4">{content}</p>
            
            {/* Image grid */}
            {imageUrls.length > 0 && (
              <div className={`grid ${imageUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-1 mb-2`}>
                {imageUrls.slice(0, 4).map((url, i) => (
                  <div key={i} className={`
                    ${imageUrls.length === 3 && i === 0 ? 'col-span-2' : ''}
                    ${imageUrls.length === 1 ? 'col-span-2' : ''}
                    aspect-[4/3] overflow-hidden
                  `}>
                    <img 
                      src={url} 
                      alt={`Event photo ${i + 1}`} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ))}
                {imageUrls.length > 4 && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-sm px-2 py-1 rounded">
                    +{imageUrls.length - 4} more
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Engagement stats */}
          <div className="px-4 py-2 text-xs text-neutral-600 flex items-center">
            <span>0 reactions</span>
            <span className="mx-1">•</span>
            <span>0 comments</span>
          </div>
          
          <Separator />
          
          {/* Action buttons */}
          <div className="px-4 py-2 flex justify-between">
            <Button variant="ghost" size="sm" className="text-neutral-600 flex items-center">
              <FaThumbsUp className="mr-2" /> Like
            </Button>
            <Button variant="ghost" size="sm" className="text-neutral-600 flex items-center">
              <FaComment className="mr-2" /> Comment
            </Button>
            <Button variant="ghost" size="sm" className="text-neutral-600 flex items-center">
              <FaShare className="mr-2" /> Share
            </Button>
          </div>
        </div>
        
        <div className="bg-neutral-50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium mb-2">Preview Notes:</h3>
          <ul className="text-sm text-neutral-600 space-y-1 list-disc pl-4">
            <li>This is a preview of how your post may appear on LinkedIn.</li>
            <li>Images will be uploaded when you publish or schedule the post.</li>
            <li>Actual styling may vary slightly on LinkedIn.</li>
          </ul>
        </div>
        
        <div className="mt-8 flex justify-between">
          <Button variant="outline" type="button" onClick={onBack}>
            <FaArrowLeft className="mr-1" /> Back
          </Button>
          <Button 
            type="button" 
            className="bg-[#0077B5] hover:bg-[#005582]"
            onClick={onNext}
          >
            Continue to Schedule <FaArrowRight className="ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
