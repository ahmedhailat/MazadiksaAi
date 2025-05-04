import { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertBidSchema, insertFavoriteSchema } from "@shared/schema";
import { hashPassword, comparePasswords as verifyPassword } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // API routes - prefixed with /api
  
  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  
  // Auctions
  app.get("/api/auctions", async (req, res) => {
    try {
      const auctions = await storage.getAllAuctions();
      res.json(auctions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch auctions" });
    }
  });
  
  app.get("/api/auctions/featured", async (req, res) => {
    try {
      const auctions = await storage.getFeaturedAuctions();
      res.json(auctions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured auctions" });
    }
  });
  
  app.get("/api/auctions/closed", async (req, res) => {
    try {
      const auctions = await storage.getRecentlyClosedAuctions();
      res.json(auctions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch closed auctions" });
    }
  });
  
  app.get("/api/auctions/search", async (req, res) => {
    try {
      const query = req.query.q as string || "";
      const auctions = await storage.searchAuctions(query);
      res.json(auctions);
    } catch (error) {
      res.status(500).json({ message: "Failed to search auctions" });
    }
  });
  
  app.get("/api/auctions/category/:categoryId", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const auctions = await storage.getAuctionsByCategory(categoryId);
      res.json(auctions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch auctions for category" });
    }
  });
  
  app.get("/api/auctions/:id", async (req, res) => {
    try {
      const auctionId = parseInt(req.params.id);
      if (isNaN(auctionId)) {
        return res.status(400).json({ message: "Invalid auction ID" });
      }
      
      const auction = await storage.getAuction(auctionId);
      if (!auction) {
        return res.status(404).json({ message: "Auction not found" });
      }
      
      res.json(auction);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch auction" });
    }
  });
  
  // Bids
  app.get("/api/auctions/:id/bids", async (req, res) => {
    try {
      const auctionId = parseInt(req.params.id);
      if (isNaN(auctionId)) {
        return res.status(400).json({ message: "Invalid auction ID" });
      }
      
      const bids = await storage.getBidsForAuction(auctionId);
      res.json(bids);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bids" });
    }
  });
  
  app.post("/api/bids", isAuthenticated, async (req, res) => {
    try {
      const bidData = req.body;
      
      // Validate bid data
      const validatedData = insertBidSchema.safeParse({
        ...bidData,
        userId: req.user!.id
      });
      
      if (!validatedData.success) {
        return res.status(400).json({ message: "Invalid bid data", errors: validatedData.error.errors });
      }
      
      // Get the auction
      const auction = await storage.getAuction(validatedData.data.auctionId);
      if (!auction) {
        return res.status(404).json({ message: "Auction not found" });
      }
      
      // Check if auction is still active
      if (auction.status !== "active") {
        return res.status(400).json({ message: "This auction is no longer active" });
      }
      
      // Check if the bid amount is high enough
      if (validatedData.data.amount <= auction.currentPrice) {
        return res.status(400).json({ 
          message: "Bid amount must be higher than the current price",
          currentPrice: auction.currentPrice
        });
      }
      
      // Check if the bid meets the minimum increment
      if (validatedData.data.amount < auction.currentPrice + auction.minBidIncrement) {
        return res.status(400).json({ 
          message: `Bid must be at least ${auction.minBidIncrement} SAR higher than the current price`,
          minBid: auction.currentPrice + auction.minBidIncrement
        });
      }
      
      // Create the bid
      const bid = await storage.createBid(validatedData.data);
      res.status(201).json(bid);
    } catch (error) {
      res.status(500).json({ message: "Failed to place bid" });
    }
  });
  
  // User Profile Management
  app.patch("/api/user/profile", isAuthenticated, async (req, res) => {
    try {
      // Create a schema for validating profile update data
      const profileUpdateSchema = z.object({
        fullName: z.string().min(2, "Full name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        phoneNumber: z.string().min(9, "Phone number must be at least 9 characters"),
        profileImage: z.string().optional(),
      });
      
      // Validate the request data
      const validatedData = profileUpdateSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        return res.status(400).json({ 
          message: "Invalid profile data", 
          errors: validatedData.error.errors 
        });
      }
      
      // Check if email is already in use by another user
      if (req.body.email !== req.user!.email) {
        const existingUser = await storage.getUserByEmail(req.body.email);
        if (existingUser && existingUser.id !== req.user!.id) {
          return res.status(400).json({ message: "Email is already in use" });
        }
      }
      
      // Update the user's profile
      const updatedUser = await storage.updateUserProfile(req.user!.id, validatedData.data);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return the updated user object
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  
  app.post("/api/user/change-password", isAuthenticated, async (req, res) => {
    try {
      // Create a schema for validating password change data
      const passwordChangeSchema = z.object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(6, "New password must be at least 6 characters"),
      });
      
      // Validate the request data
      const validatedData = passwordChangeSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        return res.status(400).json({
          message: "Invalid password data",
          errors: validatedData.error.errors
        });
      }
      
      // Verify current password
      const isPasswordValid = await verifyPassword(
        validatedData.data.currentPassword,
        req.user!.password
      );
      
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      // Hash the new password
      const hashedPassword = await hashPassword(validatedData.data.newPassword);
      
      // Update the user's password
      const updatedUser = await storage.updateUserPassword(req.user!.id, hashedPassword);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update password" });
    }
  });

  // Favorites
  app.get("/api/favorites", isAuthenticated, async (req, res) => {
    try {
      const favorites = await storage.getFavoritesForUser(req.user!.id);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });
  
  app.post("/api/favorites", isAuthenticated, async (req, res) => {
    try {
      const favoriteData = {
        userId: req.user!.id,
        auctionId: req.body.auctionId
      };
      
      // Validate data
      const validatedData = insertFavoriteSchema.safeParse(favoriteData);
      
      if (!validatedData.success) {
        return res.status(400).json({ message: "Invalid data", errors: validatedData.error.errors });
      }
      
      // Create the favorite
      const favorite = await storage.createFavorite(validatedData.data);
      res.status(201).json(favorite);
    } catch (error) {
      res.status(500).json({ message: "Failed to add to favorites" });
    }
  });
  
  app.delete("/api/favorites/:auctionId", isAuthenticated, async (req, res) => {
    try {
      const auctionId = parseInt(req.params.auctionId);
      if (isNaN(auctionId)) {
        return res.status(400).json({ message: "Invalid auction ID" });
      }
      
      const removed = await storage.removeFavorite(req.user!.id, auctionId);
      if (!removed) {
        return res.status(404).json({ message: "Favorite not found" });
      }
      
      res.status(200).json({ message: "Favorite removed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove from favorites" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Middleware to check if the user is authenticated
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({ message: "Unauthorized" });
}
