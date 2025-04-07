import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { FaLinkedin, FaCheck } from 'react-icons/fa';

const linkedInSettingsSchema = z.object({
  writingStyleSamples: z.string().optional(),
  analyzePostsByDefault: z.boolean().default(true),
  defaultTone: z.string().default('professional'),
});

type LinkedInSettingsValues = z.infer<typeof linkedInSettingsSchema>;

export default function Settings() {
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<LinkedInSettingsValues>({
    resolver: zodResolver(linkedInSettingsSchema),
    defaultValues: {
      writingStyleSamples: '',
      analyzePostsByDefault: true,
      defaultTone: 'professional',
    },
  });
  
  const connectMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('GET', '/api/auth/linkedin/connect');
      return response.json();
    },
    onSuccess: (data) => {
      // In a real app, this would redirect to LinkedIn's OAuth flow
      // For now, we'll just simulate a successful connection
      setIsConnected(true);
      toast({
        title: 'Successfully Connected',
        description: 'Your LinkedIn account has been connected.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to connect to LinkedIn',
        variant: 'destructive',
      });
    }
  });
  
  const saveSettingsMutation = useMutation({
    mutationFn: async (data: LinkedInSettingsValues) => {
      const response = await apiRequest('POST', '/api/settings', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Settings Saved',
        description: 'Your LinkedIn post assistant settings have been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Save Failed',
        description: error.message || 'Failed to save settings',
        variant: 'destructive',
      });
    }
  });
  
  const handleConnectLinkedIn = () => {
    connectMutation.mutate();
  };
  
  const onSubmit = (data: LinkedInSettingsValues) => {
    saveSettingsMutation.mutate(data);
  };

  return (
    <main className="flex-grow px-4 md:px-8 py-6 md:overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <div className="space-y-6">
          {/* LinkedIn Connection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaLinkedin className="text-[#0077B5] mr-2" /> 
                LinkedIn Connection
              </CardTitle>
              <CardDescription>
                Connect your LinkedIn account to allow the assistant to post on your behalf.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isConnected ? (
                <div className="flex items-center text-green-600 bg-green-50 p-3 rounded-md">
                  <FaCheck className="mr-2" />
                  <p>Your LinkedIn account is connected</p>
                </div>
              ) : (
                <Button 
                  className="bg-[#0077B5] hover:bg-[#005582]"
                  onClick={handleConnectLinkedIn}
                  disabled={connectMutation.isPending}
                >
                  {connectMutation.isPending ? 'Connecting...' : 'Connect LinkedIn Account'}
                </Button>
              )}
            </CardContent>
          </Card>
          
          {/* AI Assistant Settings */}
          <Card>
            <CardHeader>
              <CardTitle>AI Assistant Settings</CardTitle>
              <CardDescription>
                Customize how the AI assistant generates LinkedIn posts for you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="writingStyleSamples"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Writing Style Samples</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Paste examples of your writing style here to help the AI mimic your voice..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide 1-3 paragraphs of your writing so the AI can learn your style.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Separator />
                  
                  <FormField
                    control={form.control}
                    name="defaultTone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Tone</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            type="button"
                            variant={field.value === 'professional' ? 'default' : 'outline'}
                            className={field.value === 'professional' ? 'bg-[#0077B5]' : ''}
                            onClick={() => form.setValue('defaultTone', 'professional')}
                          >
                            Professional
                          </Button>
                          <Button
                            type="button"
                            variant={field.value === 'casual' ? 'default' : 'outline'}
                            className={field.value === 'casual' ? 'bg-[#0077B5]' : ''}
                            onClick={() => form.setValue('defaultTone', 'casual')}
                          >
                            Casual & Friendly
                          </Button>
                          <Button
                            type="button"
                            variant={field.value === 'excited' ? 'default' : 'outline'}
                            className={field.value === 'excited' ? 'bg-[#0077B5]' : ''}
                            onClick={() => form.setValue('defaultTone', 'excited')}
                          >
                            Excited & Enthusiastic
                          </Button>
                          <Button
                            type="button"
                            variant={field.value === 'technical' ? 'default' : 'outline'}
                            className={field.value === 'technical' ? 'bg-[#0077B5]' : ''}
                            onClick={() => form.setValue('defaultTone', 'technical')}
                          >
                            Technical & Detailed
                          </Button>
                        </div>
                        <FormDescription>
                          Choose the default tone for your LinkedIn posts.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="analyzePostsByDefault"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Analyze Previous Posts</FormLabel>
                          <FormDescription>
                            Automatically analyze your writing style from previous posts.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="bg-[#0077B5] hover:bg-[#005582]"
                    disabled={saveSettingsMutation.isPending}
                  >
                    {saveSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
