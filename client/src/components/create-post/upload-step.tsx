import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventDetailsSchema, type EventDetails } from '@shared/schema';
import { FileUploader } from '@/components/ui/file-uploader';
import { FaQuestionCircle, FaArrowRight } from 'react-icons/fa';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface UploadStepProps {
  onNext: (data: EventDetails & { imageFiles: File[] }) => void;
}

export function UploadStep({ onNext }: UploadStepProps) {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  
  const form = useForm<EventDetails>({
    resolver: zodResolver(eventDetailsSchema),
    defaultValues: {
      title: '',
      date: '',
      location: '',
      description: '',
      connections: '',
      tonePreference: 'professional',
      analyzeStyle: true,
    },
  });

  const handleSubmit = (data: EventDetails) => {
    onNext({
      ...data,
      imageFiles,
    });
  };

  return (
    <Card className="bg-white rounded-lg shadow-md">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Upload Content</h2>
        <p className="text-neutral-600 mb-6">
          Upload event photos and provide details about the event or achievement you want to share.
        </p>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Photo Uploader */}
            <div className="mb-8">
              <FormLabel>Event Photos</FormLabel>
              <FileUploader
                files={imageFiles}
                onChange={setImageFiles}
                onRemove={(index) => {
                  const newFiles = [...imageFiles];
                  newFiles.splice(index, 1);
                  setImageFiles(newFiles);
                }}
              />
            </div>
            
            {/* Event Details Form */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Tech Conference 2023" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. San Francisco Convention Center" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={5}
                      placeholder="Describe the event, your role, key learnings, or achievements..." 
                      {...field} 
                    />
                  </FormControl>
                  <p className="text-xs text-neutral-600 mt-1">
                    Be specific to help the AI generate content that matches your experience.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="connections"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>People/Companies You Met</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Sarah @TechCorp, John @InnovateInc" 
                      {...field} 
                    />
                  </FormControl>
                  <p className="text-xs text-neutral-600 mt-1">
                    Include LinkedIn handles when possible for easier tagging.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tonePreference"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel>Tone Preference</FormLabel>
                    <span className="text-xs text-neutral-600">Optional</span>
                  </div>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual & Friendly</SelectItem>
                      <SelectItem value="excited">Excited & Enthusiastic</SelectItem>
                      <SelectItem value="reflective">Thoughtful & Reflective</SelectItem>
                      <SelectItem value="technical">Technical & Detailed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="analyzeStyle"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm text-neutral-600">
                      Analyze my previous posts to match my writing style
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <div className="mt-8 flex justify-between">
              <Button variant="outline" type="button">
                Save Draft
              </Button>
              <Button type="submit" className="bg-[#0077B5] hover:bg-[#005582]">
                Continue to Content <FaArrowRight className="ml-1" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
