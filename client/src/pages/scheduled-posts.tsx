import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Post } from '@shared/schema';
import { 
  FaCalendarAlt, 
  FaEdit, 
  FaTrash, 
  FaClock,
  FaExclamationTriangle
} from 'react-icons/fa';
import { format } from 'date-fns';
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
import { useState } from 'react';

export default function ScheduledPosts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  
  // Fetch scheduled posts
  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ['/api/posts/scheduled'],
  });
  
  // Mutation for cancelling a scheduled post
  const cancelMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await apiRequest('DELETE', `/api/posts/${postId}/schedule`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts/scheduled'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      
      toast({
        title: 'Schedule Cancelled',
        description: 'The scheduled post has been moved to drafts.',
      });
      
      setPostToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel scheduled post',
        variant: 'destructive',
      });
    }
  });
  
  const handleCancelSchedule = (postId: number) => {
    setPostToDelete(postId);
  };
  
  const confirmCancel = () => {
    if (postToDelete) {
      cancelMutation.mutate(postToDelete);
    }
  };

  return (
    <main className="flex-grow px-4 md:px-8 py-6 md:overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Scheduled Posts</h1>
        
        {isLoading ? (
          // Loading state
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6 mb-2" />
                  <Skeleton className="h-4 w-4/6" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          // Error state
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-red-500">Failed to load scheduled posts.</p>
            </CardContent>
          </Card>
        ) : !posts || posts.length === 0 ? (
          // Empty state
          <Card>
            <CardContent className="p-6 text-center py-12">
              <FaCalendarAlt className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Scheduled Posts</h3>
              <p className="text-neutral-600 mb-6">
                You don't have any posts scheduled for publication.
              </p>
              <Button className="bg-[#0077B5] hover:bg-[#005582]">
                Create New Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Scheduled posts list
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{post.title}</h3>
                    <div className="flex items-center text-sm bg-amber-50 text-amber-600 px-2 py-1 rounded-full">
                      <FaClock className="mr-1" />
                      <span>
                        {post.scheduleDate && format(new Date(post.scheduleDate), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-neutral-600 line-clamp-2 mb-4">
                    {post.content}
                  </p>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" className="text-neutral-600">
                      <FaEdit className="mr-1" /> Edit
                    </Button>
                    
                    <AlertDialog open={postToDelete === post.id} onOpenChange={(open) => {
                      if (!open) setPostToDelete(null);
                    }}>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-500 border-red-200 hover:bg-red-50"
                          onClick={() => handleCancelSchedule(post.id)}
                        >
                          <FaTrash className="mr-1" /> Cancel
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Scheduled Post</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will cancel the scheduled publication. The post will be moved back to drafts.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Scheduled</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={confirmCancel}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Cancel Schedule
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
