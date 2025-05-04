import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  auctions, type Auction, type InsertAuction,
  bids, type Bid, type InsertBid,
  favorites, type Favorite, type InsertFavorite
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, and, desc, asc, like, or, isNull, sql } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(userId: number, data: Partial<User>): Promise<User | undefined>;
  updateUserPassword(userId: number, newPassword: string): Promise<User | undefined>;
  
  // Category operations
  getAllCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Auction operations
  getAllAuctions(): Promise<Auction[]>;
  getFeaturedAuctions(): Promise<Auction[]>;
  getRecentlyClosedAuctions(): Promise<Auction[]>;
  getAuction(id: number): Promise<Auction | undefined>;
  getAuctionsByCategory(categoryId: number): Promise<Auction[]>;
  getAuctionsByUser(userId: number): Promise<Auction[]>;
  searchAuctions(query: string): Promise<Auction[]>;
  createAuction(auction: InsertAuction): Promise<Auction>;
  updateAuctionPrice(id: number, newPrice: number): Promise<Auction | undefined>;
  updateAuctionWinner(id: number, winnerId: number): Promise<Auction | undefined>;
  
  // Bid operations
  getBidsForAuction(auctionId: number): Promise<Bid[]>;
  createBid(bid: InsertBid): Promise<Bid>;
  
  // Favorite operations
  getFavoritesForUser(userId: number): Promise<Favorite[]>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: number, auctionId: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private categoriesMap: Map<number, Category>;
  private auctionsMap: Map<number, Auction>;
  private bidsMap: Map<number, Bid>;
  private favoritesMap: Map<number, Favorite>;
  
  private currentUserId: number;
  private currentCategoryId: number;
  private currentAuctionId: number;
  private currentBidId: number;
  private currentFavoriteId: number;
  
  sessionStore: session.Store;

  constructor() {
    this.usersMap = new Map();
    this.categoriesMap = new Map();
    this.auctionsMap = new Map();
    this.bidsMap = new Map();
    this.favoritesMap = new Map();
    
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentAuctionId = 1;
    this.currentBidId = 1;
    this.currentFavoriteId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Initialize with sample categories
    this.seedCategories();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.usersMap.set(id, user);
    return user;
  }
  
  async updateUserProfile(userId: number, data: Partial<User>): Promise<User | undefined> {
    const user = this.usersMap.get(userId);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      ...data,
      id: userId, // Ensure ID doesn't change
      updatedAt: new Date()
    };
    
    this.usersMap.set(userId, updatedUser);
    return updatedUser;
  }
  
  async updateUserPassword(userId: number, newPassword: string): Promise<User | undefined> {
    const user = this.usersMap.get(userId);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      password: newPassword,
      updatedAt: new Date()
    };
    
    this.usersMap.set(userId, updatedUser);
    return updatedUser;
  }
  
  // Category operations
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categoriesMap.values());
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categoriesMap.get(id);
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categoriesMap.values()).find(
      (category) => category.slug === slug
    );
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { ...insertCategory, id, auctionCount: 0 };
    this.categoriesMap.set(id, category);
    return category;
  }
  
  // Auction operations
  async getAllAuctions(): Promise<Auction[]> {
    return Array.from(this.auctionsMap.values())
      .filter(auction => auction.status === "active")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getFeaturedAuctions(): Promise<Auction[]> {
    return Array.from(this.auctionsMap.values())
      .filter(auction => auction.featured && auction.status === "active")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getRecentlyClosedAuctions(): Promise<Auction[]> {
    return Array.from(this.auctionsMap.values())
      .filter(auction => auction.status === "closed")
      .sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime())
      .slice(0, 5);
  }
  
  async getAuction(id: number): Promise<Auction | undefined> {
    return this.auctionsMap.get(id);
  }
  
  async getAuctionsByCategory(categoryId: number): Promise<Auction[]> {
    return Array.from(this.auctionsMap.values())
      .filter(auction => auction.categoryId === categoryId && auction.status === "active")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getAuctionsByUser(userId: number): Promise<Auction[]> {
    return Array.from(this.auctionsMap.values())
      .filter(auction => auction.sellerId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async searchAuctions(query: string): Promise<Auction[]> {
    if (!query) {
      return this.getAllAuctions();
    }
    
    query = query.toLowerCase();
    return Array.from(this.auctionsMap.values())
      .filter(auction => 
        auction.status === "active" && (
          auction.title.toLowerCase().includes(query) || 
          auction.titleAr.toLowerCase().includes(query) ||
          auction.description.toLowerCase().includes(query) ||
          auction.descriptionAr.toLowerCase().includes(query)
        )
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createAuction(insertAuction: InsertAuction): Promise<Auction> {
    const id = this.currentAuctionId++;
    const now = new Date();
    const auction: Auction = { 
      ...insertAuction, 
      id,
      bidCount: 0,
      winnerId: null,
      createdAt: now,
      updatedAt: now
    };
    this.auctionsMap.set(id, auction);
    
    // Update category auction count
    const category = this.categoriesMap.get(auction.categoryId);
    if (category) {
      category.auctionCount += 1;
      this.categoriesMap.set(category.id, category);
    }
    
    return auction;
  }
  
  async updateAuctionPrice(id: number, newPrice: number): Promise<Auction | undefined> {
    const auction = this.auctionsMap.get(id);
    if (!auction) return undefined;
    
    const updatedAuction: Auction = {
      ...auction,
      currentPrice: newPrice,
      bidCount: auction.bidCount + 1,
      updatedAt: new Date()
    };
    
    this.auctionsMap.set(id, updatedAuction);
    return updatedAuction;
  }
  
  async updateAuctionWinner(id: number, winnerId: number): Promise<Auction | undefined> {
    const auction = this.auctionsMap.get(id);
    if (!auction) return undefined;
    
    const updatedAuction: Auction = {
      ...auction,
      winnerId,
      status: "closed",
      updatedAt: new Date()
    };
    
    this.auctionsMap.set(id, updatedAuction);
    return updatedAuction;
  }
  
  // Bid operations
  async getBidsForAuction(auctionId: number): Promise<Bid[]> {
    return Array.from(this.bidsMap.values())
      .filter(bid => bid.auctionId === auctionId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createBid(insertBid: InsertBid): Promise<Bid> {
    const id = this.currentBidId++;
    const now = new Date();
    const bid: Bid = { 
      ...insertBid, 
      id,
      createdAt: now
    };
    this.bidsMap.set(id, bid);
    
    // Update auction's current price and bid count
    await this.updateAuctionPrice(bid.auctionId, bid.amount);
    
    return bid;
  }
  
  // Favorite operations
  async getFavoritesForUser(userId: number): Promise<Favorite[]> {
    return Array.from(this.favoritesMap.values())
      .filter(favorite => favorite.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    // Check if the favorite already exists
    const existingFavorite = Array.from(this.favoritesMap.values()).find(
      (fav) => fav.userId === insertFavorite.userId && fav.auctionId === insertFavorite.auctionId
    );
    
    if (existingFavorite) {
      return existingFavorite;
    }
    
    const id = this.currentFavoriteId++;
    const now = new Date();
    const favorite: Favorite = { 
      ...insertFavorite, 
      id,
      createdAt: now
    };
    this.favoritesMap.set(id, favorite);
    return favorite;
  }
  
  async removeFavorite(userId: number, auctionId: number): Promise<boolean> {
    const favorite = Array.from(this.favoritesMap.values()).find(
      (fav) => fav.userId === userId && fav.auctionId === auctionId
    );
    
    if (!favorite) return false;
    
    return this.favoritesMap.delete(favorite.id);
  }
  
  // Seed initial categories
  private seedCategories() {
    const categories: InsertCategory[] = [
      {
        nameEn: "Jewelry & Watches",
        nameAr: "المجوهرات والساعات",
        slug: "jewelry-watches",
        imageUrl: "https://images.unsplash.com/photo-1618220048045-10a6dbdf83e0"
      },
      {
        nameEn: "Art & Paintings",
        nameAr: "اللوحات والفن",
        slug: "art-paintings",
        imageUrl: "https://images.unsplash.com/photo-1592492152545-9695d3f473f4"
      },
      {
        nameEn: "Heritage Items",
        nameAr: "المقتنيات التراثية",
        slug: "heritage-items",
        imageUrl: "https://images.unsplash.com/photo-1614332287897-cdc485fa562d"
      },
      {
        nameEn: "Luxury Cars",
        nameAr: "السيارات الفاخرة",
        slug: "luxury-cars",
        imageUrl: "https://images.unsplash.com/photo-1583121274602-3e2820c69888"
      }
    ];
    
    categories.forEach(category => {
      this.createCategory(category);
    });
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      phoneNumber: insertUser.phoneNumber || null,
      profileImage: insertUser.profileImage || null
    }).returning();
    return user;
  }
  
  async updateUserProfile(userId: number, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ 
        ...data,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }
  
  async updateUserPassword(userId: number, newPassword: string): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ 
        password: newPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }
  
  // Category operations
  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values({
      ...insertCategory,
      imageUrl: insertCategory.imageUrl || null,
      auctionCount: 0
    }).returning();
    return category;
  }
  
  // Auction operations
  async getAllAuctions(): Promise<Auction[]> {
    return await db.select()
      .from(auctions)
      .where(eq(auctions.status, "active"))
      .orderBy(desc(auctions.createdAt));
  }
  
  async getFeaturedAuctions(): Promise<Auction[]> {
    return await db.select()
      .from(auctions)
      .where(and(
        eq(auctions.status, "active"),
        eq(auctions.featured, true)
      ))
      .orderBy(desc(auctions.createdAt));
  }
  
  async getRecentlyClosedAuctions(): Promise<Auction[]> {
    return await db.select()
      .from(auctions)
      .where(eq(auctions.status, "closed"))
      .orderBy(desc(auctions.endTime))
      .limit(5);
  }
  
  async getAuction(id: number): Promise<Auction | undefined> {
    const [auction] = await db.select().from(auctions).where(eq(auctions.id, id));
    return auction;
  }
  
  async getAuctionsByCategory(categoryId: number): Promise<Auction[]> {
    return await db.select()
      .from(auctions)
      .where(and(
        eq(auctions.categoryId, categoryId),
        eq(auctions.status, "active")
      ))
      .orderBy(desc(auctions.createdAt));
  }
  
  async getAuctionsByUser(userId: number): Promise<Auction[]> {
    return await db.select()
      .from(auctions)
      .where(eq(auctions.sellerId, userId))
      .orderBy(desc(auctions.createdAt));
  }
  
  async searchAuctions(query: string): Promise<Auction[]> {
    if (!query) {
      return this.getAllAuctions();
    }
    
    return await db.select()
      .from(auctions)
      .where(and(
        eq(auctions.status, "active"),
        or(
          like(auctions.title, `%${query}%`),
          like(auctions.titleAr, `%${query}%`),
          like(auctions.description, `%${query}%`),
          like(auctions.descriptionAr, `%${query}%`)
        )
      ))
      .orderBy(desc(auctions.createdAt));
  }
  
  async createAuction(insertAuction: InsertAuction): Promise<Auction> {
    const [auction] = await db.insert(auctions).values({
      ...insertAuction,
      status: insertAuction.status || 'active',
      featured: insertAuction.featured || false,
      bidCount: 0,
      winnerId: null
    }).returning();
    
    // Update category auction count
    await db.update(categories)
      .set({ 
        auctionCount: sql`${categories.auctionCount} + 1` 
      })
      .where(eq(categories.id, auction.categoryId));
    
    return auction;
  }
  
  async updateAuctionPrice(id: number, newPrice: number): Promise<Auction | undefined> {
    const [auction] = await db.update(auctions)
      .set({ 
        currentPrice: newPrice,
        bidCount: sql`${auctions.bidCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(auctions.id, id))
      .returning();
    return auction;
  }
  
  async updateAuctionWinner(id: number, winnerId: number): Promise<Auction | undefined> {
    const [auction] = await db.update(auctions)
      .set({ 
        winnerId,
        status: "closed",
        updatedAt: new Date()
      })
      .where(eq(auctions.id, id))
      .returning();
    return auction;
  }
  
  // Bid operations
  async getBidsForAuction(auctionId: number): Promise<Bid[]> {
    return await db.select()
      .from(bids)
      .where(eq(bids.auctionId, auctionId))
      .orderBy(desc(bids.createdAt));
  }
  
  async createBid(insertBid: InsertBid): Promise<Bid> {
    const [bid] = await db.insert(bids).values(insertBid).returning();
    
    // Update auction's current price and bid count
    await this.updateAuctionPrice(bid.auctionId, bid.amount);
    
    return bid;
  }
  
  // Favorite operations
  async getFavoritesForUser(userId: number): Promise<Favorite[]> {
    return await db.select()
      .from(favorites)
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));
  }
  
  async createFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    // Check if the favorite already exists
    const [existingFavorite] = await db.select()
      .from(favorites)
      .where(and(
        eq(favorites.userId, insertFavorite.userId),
        eq(favorites.auctionId, insertFavorite.auctionId)
      ));
    
    if (existingFavorite) {
      return existingFavorite;
    }
    
    const [favorite] = await db.insert(favorites).values(insertFavorite).returning();
    return favorite;
  }
  
  async removeFavorite(userId: number, auctionId: number): Promise<boolean> {
    const result = await db.delete(favorites)
      .where(and(
        eq(favorites.userId, userId),
        eq(favorites.auctionId, auctionId)
      ));
    
    return !!result;
  }
}

// Switch from MemStorage to DatabaseStorage
export const storage = new DatabaseStorage();
