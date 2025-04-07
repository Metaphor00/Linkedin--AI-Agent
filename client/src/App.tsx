import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/layout/sidebar";
import CreatePost from "@/pages/create-post";
import PostHistory from "@/pages/post-history";
import ScheduledPosts from "@/pages/scheduled-posts";
import Settings from "@/pages/settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={CreatePost} />
      <Route path="/history" component={PostHistory} />
      <Route path="/scheduled" component={ScheduledPosts} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col md:flex-row bg-neutral-50">
        <Sidebar />
        <Router />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
