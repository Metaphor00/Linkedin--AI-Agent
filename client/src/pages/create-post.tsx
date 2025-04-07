import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { EventDetails, type GeneratedPost } from '@shared/schema';
import { StepIndicator } from '@/components/create-post/step-indicator';
import { UploadStep } from '@/components/create-post/upload-step';
import { ContentStep } from '@/components/create-post/content-step';
import { PreviewStep } from '@/components/create-post/preview-step';
import { ScheduleStep } from '@/components/create-post/schedule-step';
import { FaQuestionCircle } from 'react-icons/fa';

// Steps for the post creation process
const STEPS = ['Upload', 'Content', 'Preview', 'Schedule'];

export default function CreatePost() {
  const [currentStep, setCurrentStep] = useState(0);
  const [eventDetails, setEventDetails] = useState<EventDetails & { imageFiles: File[] }>();
  const [generatedContent, setGeneratedContent] = useState<GeneratedPost>();
  const [finalContent, setFinalContent] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Mutation to generate content
  const generateMutation = useMutation({
    mutationFn: async (data: EventDetails & { imageFiles: File[] }) => {
      // Create a FormData object for file upload
      const formData = new FormData();
      
      // Append all files
      data.imageFiles.forEach((file, index) => {
        formData.append('images', file);
      });
      
      // Append event details as JSON
      formData.append('details', JSON.stringify({
        title: data.title,
        date: data.date,
        location: data.location,
        description: data.description,
        connections: data.connections,
        tonePreference: data.tonePreference,
        analyzeStyle: data.analyzeStyle,
      }));
      
      // Make request
      const response = await fetch('/api/posts/generate', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to generate content');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      setGeneratedContent(data);
      toast({
        title: 'Content Generated',
        description: 'Your LinkedIn post has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Generation Failed',
        description: error.message || 'Failed to generate post content',
        variant: 'destructive',
      });
    }
  });
  
  // Mutation for posting or scheduling
  const publishMutation = useMutation({
    mutationFn: async ({ content, scheduleDate }: { content: string, scheduleDate?: Date }) => {
      // Create a FormData object
      const formData = new FormData();
      
      if (!eventDetails) throw new Error('No event details found');
      
      // Append all image files
      eventDetails.imageFiles.forEach((file) => {
        formData.append('images', file);
      });
      
      // Append post data
      formData.append('post', JSON.stringify({
        title: eventDetails.title,
        content,
        eventDate: eventDetails.date,
        eventLocation: eventDetails.location,
        eventDescription: eventDetails.description,
        peopleMetConnections: eventDetails.connections,
        tonePreference: eventDetails.tonePreference,
        scheduleDate: scheduleDate ? scheduleDate.toISOString() : null,
      }));
      
      // Send request
      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to publish post');
      }
      
      return await response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      
      toast({
        title: variables.scheduleDate ? 'Post Scheduled' : 'Post Published',
        description: variables.scheduleDate
          ? `Your post will be published on ${variables.scheduleDate.toLocaleDateString()} at ${variables.scheduleDate.toLocaleTimeString()}`
          : 'Your post has been published to LinkedIn',
      });
      
      // Reset and go back to first step
      setCurrentStep(0);
      setEventDetails(undefined);
      setGeneratedContent(undefined);
      setFinalContent('');
    },
    onError: (error) => {
      toast({
        title: 'Publishing Failed',
        description: error.message || 'Failed to publish or schedule post',
        variant: 'destructive',
      });
    }
  });
  
  // Handle step transitions
  const handleUploadSubmit = (data: EventDetails & { imageFiles: File[] }) => {
    setEventDetails(data);
    setCurrentStep(1);
  };
  
  const handleGenerateContent = () => {
    if (eventDetails) {
      generateMutation.mutate(eventDetails);
    }
  };
  
  const handleContentSubmit = (content: string) => {
    setFinalContent(content);
    setCurrentStep(2);
  };
  
  const handlePreviewSubmit = () => {
    setCurrentStep(3);
  };
  
  const handleBack = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
  };
  
  const handlePostNow = () => {
    publishMutation.mutate({ content: finalContent });
  };
  
  const handleSchedule = (date: Date) => {
    publishMutation.mutate({ content: finalContent, scheduleDate: date });
  };
  
  return (
    <main className="flex-grow px-4 md:px-8 py-6 md:overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Create LinkedIn Post</h1>
          <a href="#" className="text-[#0077B5] hover:text-[#005582]">
            <FaQuestionCircle />
          </a>
        </div>
        
        <StepIndicator currentStep={currentStep} steps={STEPS} />
        
        {currentStep === 0 && (
          <UploadStep onNext={handleUploadSubmit} />
        )}
        
        {currentStep === 1 && eventDetails && (
          <ContentStep 
            eventDetails={eventDetails}
            generatedContent={generatedContent}
            isGenerating={generateMutation.isPending}
            onGenerate={handleGenerateContent}
            onBack={handleBack}
            onNext={handleContentSubmit}
          />
        )}
        
        {currentStep === 2 && eventDetails && (
          <PreviewStep 
            eventDetails={eventDetails}
            content={finalContent}
            onBack={handleBack}
            onNext={handlePreviewSubmit}
          />
        )}
        
        {currentStep === 3 && (
          <ScheduleStep 
            onBack={handleBack}
            onPostNow={handlePostNow}
            onSchedule={handleSchedule}
            isPosting={publishMutation.isPending}
          />
        )}
      </div>
    </main>
  );
}
