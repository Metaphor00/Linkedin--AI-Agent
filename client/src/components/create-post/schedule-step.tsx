import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { FaCalendarAlt, FaArrowLeft, FaLinkedin, FaClock } from 'react-icons/fa';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ScheduleStepProps {
  onBack: () => void;
  onPostNow: () => void;
  onSchedule: (date: Date) => void;
  isPosting: boolean;
}

const scheduleFormSchema = z.object({
  date: z.date({
    required_error: "Please select a date",
  }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Please enter a valid time in 24-hour format (HH:MM)",
  }),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

export function ScheduleStep({ onBack, onPostNow, onSchedule, isPosting }: ScheduleStepProps) {
  const [activeTab, setActiveTab] = useState('post-now');
  
  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      date: new Date(),
      time: format(new Date(), 'HH:mm'),
    },
  });
  
  const handleScheduleSubmit = (values: ScheduleFormValues) => {
    const [hours, minutes] = values.time.split(':').map(Number);
    const scheduledDate = new Date(values.date);
    scheduledDate.setHours(hours, minutes, 0, 0);
    
    onSchedule(scheduledDate);
  };

  return (
    <Card className="bg-white rounded-lg shadow-md">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Schedule Your Post</h2>
        <p className="text-neutral-600 mb-6">
          Choose when to publish your LinkedIn post.
        </p>
        
        <Tabs defaultValue="post-now" onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="post-now">Post Now</TabsTrigger>
            <TabsTrigger value="schedule">Schedule for Later</TabsTrigger>
          </TabsList>
          
          <TabsContent value="post-now" className="space-y-4">
            <div className="bg-neutral-50 rounded-lg p-6 text-center">
              <FaLinkedin className="w-12 h-12 text-[#0077B5] mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Ready to Publish</h3>
              <p className="text-neutral-600 mb-6">
                Your post will be published to your LinkedIn profile immediately.
              </p>
              <Button 
                onClick={onPostNow}
                disabled={isPosting}
                className="bg-[#0077B5] hover:bg-[#005582] w-full max-w-xs"
              >
                {isPosting ? 'Publishing...' : 'Publish Now'}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="schedule">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleScheduleSubmit)} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <FaCalendarAlt className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
                            <Input 
                              {...field} 
                              placeholder="HH:MM"
                              className="pl-10"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="bg-neutral-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-2">Best Posting Times:</h3>
                  <ul className="text-sm text-neutral-600 space-y-1">
                    <li>• Weekdays: 7:30-8:30am, 12pm, 5-6pm</li>
                    <li>• Tuesdays & Thursdays typically see higher engagement</li>
                  </ul>
                </div>
                
                <div className="mt-8 flex justify-between">
                  <Button variant="outline" type="button" onClick={onBack}>
                    <FaArrowLeft className="mr-1" /> Back
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-[#0077B5] hover:bg-[#005582]"
                    disabled={isPosting}
                  >
                    {isPosting ? 'Scheduling...' : 'Schedule Post'}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
