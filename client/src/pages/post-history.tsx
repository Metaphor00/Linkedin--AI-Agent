import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Post } from '@shared/schema';
import { 
  FaFileAlt, 
  FaCalendarCheck, 
  FaLinkedin,
  FaEllipsisH
} from 'react-icons/fa';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function PostHistory() {
  // Fetch posts from API
  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <FaLinkedin className="text-[#0077B5]" />;
      case 'scheduled':
        return <FaCalendarCheck className="text-amber-500" />;
      default:
        return <FaFileAlt className="text-neutral-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-[#0077B5]">Published</Badge>;
      case 'scheduled':
        return <Badge variant="outline" className="text-amber-500 border-amber-500">Scheduled</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  return (
    <main className="flex-grow px-4 md:px-8 py-6 md:overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Post History</h1>
        
        {isLoading ? (
          // Loading state
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-6 w-20" />
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
              <p className="text-red-500">Failed to load posts history.</p>
            </CardContent>
          </Card>
        ) : !posts || posts.length === 0 ? (
          // Empty state
          <Card>
            <CardContent className="p-6 text-center py-12">
              <FaFileAlt className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Posts Yet</h3>
              <p className="text-neutral-600 mb-6">
                You haven't created any LinkedIn posts yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          // Posts list
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="mr-2">
                        {getStatusIcon(post.status)}
                      </div>
                      <h3 className="font-medium">{post.title}</h3>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(post.status)}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-1">
                          <FaEllipsisH className="text-neutral-500" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          {post.status === 'draft' && (
                            <DropdownMenuItem>Edit Post</DropdownMenuItem>
                          )}
                          {post.status === 'scheduled' && (
                            <DropdownMenuItem>Reschedule</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  <p className="text-sm text-neutral-600 line-clamp-2 mb-2">
                    {post.content}
                  </p>
                  
                  <div className="flex items-center text-xs text-neutral-500 mt-2">
                    <span>Created: {format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
                    {post.status === 'scheduled' && post.scheduleDate && (
                      <>
                        <span className="mx-2">•</span>
                        <span>Scheduled: {format(new Date(post.scheduleDate), 'MMM d, yyyy h:mm a')}</span>
                      </>
                    )}
                    {post.status === 'published' && post.publishedDate && (
                      <>
                        <span className="mx-2">•</span>
                        <span>Published: {format(new Date(post.publishedDate), 'MMM d, yyyy')}</span>
                      </>
                    )}
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
