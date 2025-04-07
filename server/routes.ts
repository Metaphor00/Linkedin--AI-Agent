import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import { eventDetailsSchema, insertPostSchema } from "@shared/schema";
import { z } from "zod";
import { generatePost, analyzeWritingStyle } from "./lib/openai";
import { schedulePost, publishPost } from "./lib/linkedin";

// Configure multer for in-memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 10
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WEBP files are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a post or schedule it
  app.post('/api/posts', upload.array('images', 10), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      const postData = JSON.parse(req.body.post);
      
      // Validate post data
      const result = insertPostSchema.safeParse({
        userId: 1, // Hardcoded for demo
        title: postData.title,
        content: postData.content,
        images: files.map(file => file.buffer.toString('base64')),
        status: postData.scheduleDate ? 'scheduled' : 'published',
        eventDate: postData.eventDate || null,
        eventLocation: postData.eventLocation || null,
        eventDescription: postData.eventDescription || null,
        peopleMetConnections: postData.peopleMetConnections || null,
        tonePreference: postData.tonePreference || null,
        scheduleDate: postData.scheduleDate || null,
        publishedDate: postData.scheduleDate ? null : new Date().toISOString(),
      });
      
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }
      
      // Save the post
      const post = await storage.createPost(result.data);
      
      // If it's scheduled, set up the scheduler
      if (post.status === 'scheduled' && post.scheduleDate) {
        await schedulePost(post.id, post.content, post.images || [], new Date(post.scheduleDate));
      } 
      // If publish immediately, post to LinkedIn
      else if (post.status === 'published') {
        await publishPost(post.content, post.images || []);
      }
      
      res.status(201).json(post);
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ error: 'Failed to create post' });
    }
  });
  
  // Generate post content
  app.post('/api/posts/generate', upload.array('images', 10), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      const detailsJson = req.body.details;
      
      if (!detailsJson) {
        return res.status(400).json({ error: 'Event details are required' });
      }
      
      // Parse and validate event details
      const details = JSON.parse(detailsJson);
      const result = eventDetailsSchema.safeParse(details);
      
      if (!result.success) {
        return res.status(400).json({ error: result.error.errors });
      }
      
      // Get base64 encoded images
      const imageBuffers = files.map(file => file.buffer.toString('base64'));
      
      // Generate content using OpenAI
      const generatedContent = await generatePost(result.data, imageBuffers);
      
      res.status(200).json(generatedContent);
    } catch (error) {
      console.error('Error generating post:', error);
      res.status(500).json({ error: 'Failed to generate post content' });
    }
  });
  
  // Get all posts
  app.get('/api/posts', async (req, res) => {
    try {
      const posts = await storage.getAllPosts();
      res.json(posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  });
  
  // Get scheduled posts
  app.get('/api/posts/scheduled', async (req, res) => {
    try {
      const posts = await storage.getScheduledPosts();
      res.json(posts);
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
      res.status(500).json({ error: 'Failed to fetch scheduled posts' });
    }
  });
  
  // Cancel a scheduled post (move back to draft)
  app.delete('/api/posts/:id/schedule', async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      
      if (isNaN(postId)) {
        return res.status(400).json({ error: 'Invalid post ID' });
      }
      
      const post = await storage.getPost(postId);
      
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      if (post.status !== 'scheduled') {
        return res.status(400).json({ error: 'Post is not scheduled' });
      }
      
      // Update post status to draft
      const updatedPost = await storage.updatePostStatus(postId, 'draft');
      
      res.json(updatedPost);
    } catch (error) {
      console.error('Error cancelling scheduled post:', error);
      res.status(500).json({ error: 'Failed to cancel scheduled post' });
    }
  });
  
  // Analyze writing style
  app.post('/api/ai/analyze-style', async (req, res) => {
    try {
      const { samples } = req.body;
      
      if (!samples || typeof samples !== 'string') {
        return res.status(400).json({ error: 'Writing samples are required' });
      }
      
      const analysis = await analyzeWritingStyle(samples);
      res.json(analysis);
    } catch (error) {
      console.error('Error analyzing writing style:', error);
      res.status(500).json({ error: 'Failed to analyze writing style' });
    }
  });
  
  // Save settings
  app.post('/api/settings', async (req, res) => {
    try {
      const { writingStyleSamples, analyzePostsByDefault, defaultTone } = req.body;
      
      // In a real app, you'd save these to the user's profile
      // For now, just simulate a successful save
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error saving settings:', error);
      res.status(500).json({ error: 'Failed to save settings' });
    }
  });
  
  // LinkedIn connection endpoints (simulated)
  app.get('/api/auth/linkedin/connect', async (req, res) => {
    res.json({ success: true, redirectUrl: 'https://linkedin.com/oauth' });
  });
  
  app.get('/api/linkedin/status', async (req, res) => {
    res.json({ connected: false });
  });
  
  // Add a health check endpoint for Render
  app.get('/health', async (req, res) => {
    res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV });
  });

  const httpServer = createServer(app);
  return httpServer;
}
