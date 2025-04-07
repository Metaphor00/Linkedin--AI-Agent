import { posts, type Post, type InsertPost, users, type User, type InsertUser, postGenerations, type PostGeneration, type InsertPostGeneration } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private postsData: Map<number, Post>;
  private postGenerationsData: Map<number, PostGeneration>;
  private userCurrentId: number;
  private postCurrentId: number;
  private postGenerationCurrentId: number;

  constructor() {
    this.users = new Map();
    this.postsData = new Map();
    this.postGenerationsData = new Map();
    this.userCurrentId = 1;
    this.postCurrentId = 1;
    this.postGenerationCurrentId = 1;
    
    // Create a default user
    this.createUser({
      username: "demo",
      password: "password",
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Post operations
  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.postCurrentId++;
    const now = new Date();
    
    const post: Post = {
      ...insertPost,
      id,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    
    this.postsData.set(id, post);
    return post;
  }
  
  async getPost(id: number): Promise<Post | undefined> {
    return this.postsData.get(id);
  }
  
  async getAllPosts(): Promise<Post[]> {
    return Array.from(this.postsData.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getScheduledPosts(): Promise<Post[]> {
    return Array.from(this.postsData.values())
      .filter(post => post.status === 'scheduled')
      .sort((a, b) => {
        if (a.scheduleDate && b.scheduleDate) {
          return new Date(a.scheduleDate).getTime() - new Date(b.scheduleDate).getTime();
        }
        return 0;
      });
  }
  
  async updatePostStatus(id: number, status: string): Promise<Post> {
    const post = this.postsData.get(id);
    
    if (!post) {
      throw new Error(`Post with ID ${id} not found`);
    }
    
    const updatedPost: Post = {
      ...post,
      status,
      updatedAt: new Date().toISOString(),
    };
    
    this.postsData.set(id, updatedPost);
    return updatedPost;
  }
  
  // Post generation operations
  async createPostGeneration(insertGeneration: InsertPostGeneration): Promise<PostGeneration> {
    const id = this.postGenerationCurrentId++;
    const now = new Date();
    
    const generation: PostGeneration = {
      ...insertGeneration,
      id,
      createdAt: now.toISOString(),
    };
    
    this.postGenerationsData.set(id, generation);
    return generation;
  }
  
  async getPostGenerations(postId: number): Promise<PostGeneration[]> {
    return Array.from(this.postGenerationsData.values())
      .filter(gen => gen.postId === postId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export const storage = new MemStorage();
