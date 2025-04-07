import { posts, type Post, type InsertPost, users, type User, type InsertUser, postGenerations, type PostGeneration, type InsertPostGeneration } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Modify the interface with any CRUD methods you might need
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Post operations
  createPost(post: InsertPost): Promise<Post>;
  getPost(id: number): Promise<Post | undefined>;
  getAllPosts(): Promise<Post[]>;
  getScheduledPosts(): Promise<Post[]>;
  updatePostStatus(id: number, status: string): Promise<Post>;
  
  // Post generation operations
  createPostGeneration(generation: InsertPostGeneration): Promise<PostGeneration>;
  getPostGenerations(postId: number): Promise<PostGeneration[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Post operations
  async createPost(insertPost: InsertPost): Promise<Post> {
    // Ensure we're passing an array to values if needed by Drizzle
    const [post] = await db
      .insert(posts)
      .values(insertPost as any)
      .returning();
    return post;
  }
  
  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }
  
  async getAllPosts(): Promise<Post[]> {
    return db.select().from(posts).orderBy(desc(posts.createdAt));
  }
  
  async getScheduledPosts(): Promise<Post[]> {
    return db
      .select()
      .from(posts)
      .where(eq(posts.status, 'scheduled'))
      .orderBy(posts.scheduleDate);
  }
  
  async updatePostStatus(id: number, status: string): Promise<Post> {
    const now = new Date();
    
    const [updatedPost] = await db
      .update(posts)
      .set({ 
        status, 
        updatedAt: now,
        ...(status === 'published' ? { publishedDate: now } : {})
      })
      .where(eq(posts.id, id))
      .returning();
    
    if (!updatedPost) {
      throw new Error(`Post with ID ${id} not found`);
    }
    
    return updatedPost;
  }
  
  // Post generation operations
  async createPostGeneration(insertGeneration: InsertPostGeneration): Promise<PostGeneration> {
    const [generation] = await db
      .insert(postGenerations)
      .values(insertGeneration as any)
      .returning();
    
    return generation;
  }
  
  async getPostGenerations(postId: number): Promise<PostGeneration[]> {
    return db
      .select()
      .from(postGenerations)
      .where(eq(postGenerations.postId, postId))
      .orderBy(desc(postGenerations.createdAt));
  }
}

// Database storage instance
export const storage = new DatabaseStorage();

// Initialize the database with a default user
export const initializeDatabase = async () => {
  try {
    // Check if default user exists
    const existingUser = await storage.getUserByUsername("demo");
    
    // Create default user if not exists
    if (!existingUser) {
      await storage.createUser({
        username: "demo",
        password: "password",
      });
      console.log("Created default user 'demo'");
    }
    
    return true;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to initialize database:", errorMessage);
    return false;
  }
};
