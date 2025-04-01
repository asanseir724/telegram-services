import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import { orderFormSchema, insertServiceSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // API Routes
  // Get services by type
  app.get("/api/services", async (req, res) => {
    const type = req.query.type as string;
    let services;
    
    if (type) {
      services = await storage.getServicesByType(type);
    } else {
      services = await storage.getServices();
    }
    
    res.json(services);
  });

  // Get specific service
  app.get("/api/services/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid service ID" });
    }
    
    const service = await storage.getService(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    
    res.json(service);
  });

  // Admin: Create service
  app.post("/api/services", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const validatedData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(validatedData);
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid service data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create service" });
      }
    }
  });

  // Admin: Update service
  app.put("/api/services/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid service ID" });
    }

    try {
      const validatedData = insertServiceSchema.partial().parse(req.body);
      const updatedService = await storage.updateService(id, validatedData);
      
      if (!updatedService) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.json(updatedService);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid service data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update service" });
      }
    }
  });

  // Admin: Delete service
  app.delete("/api/services/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid service ID" });
    }

    const success = await storage.deleteService(id);
    if (!success) {
      return res.status(404).json({ message: "Service not found" });
    }
    
    res.status(204).send();
  });

  // Get all orders (Admin only)
  app.get("/api/orders", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const orders = await storage.getOrders();
    res.json(orders);
  });

  // Get specific order (Admin only)
  app.get("/api/orders/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }
    
    const order = await storage.getOrder(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    res.json(order);
  });

  // Create order (Public)
  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = orderFormSchema.parse(req.body);
      
      // Get the service to validate and calculate total
      const service = await storage.getService(orderData.serviceId);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      // Create order with calculated total
      const order = await storage.createOrder({
        serviceId: orderData.serviceId,
        telegramId: orderData.telegramId,
        phoneNumber: orderData.phoneNumber,
        email: orderData.email || undefined,
        quantity: orderData.quantity,
        total: service.price * (orderData.quantity / service.quantity),
        status: "pending"
      });
      
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid order data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create order" });
      }
    }
  });

  // Update order status (Admin only)
  app.patch("/api/orders/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const { status } = req.body;
    if (!["pending", "processing", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedOrder = await storage.updateOrder(id, { status });
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    res.json(updatedOrder);
  });

  // Delete order (Admin only)
  app.delete("/api/orders/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const success = await storage.deleteOrder(id);
    if (!success) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    res.status(204).send();
  });

  // Get all settings (Admin only)
  app.get("/api/settings", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const settings = await storage.getSettings();
    res.json(settings);
  });

  // Get specific setting (some may be public)
  app.get("/api/settings/:key", async (req, res) => {
    const key = req.params.key;
    
    // For now, only certain keys are publicly accessible
    const publicKeys = ["site_name", "contact_email"];
    const needsAuth = !publicKeys.includes(key);
    
    if (needsAuth && (!req.isAuthenticated() || !req.user.isAdmin)) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const setting = await storage.getSetting(key);
    if (!setting) {
      return res.status(404).json({ message: "Setting not found" });
    }
    
    res.json(setting);
  });

  // Update setting (Admin only)
  app.put("/api/settings/:key", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { key } = req.params;
    const { value } = req.body;
    
    if (typeof value !== "string") {
      return res.status(400).json({ message: "Value must be a string" });
    }

    const updatedSetting = await storage.updateSetting(key, value);
    if (!updatedSetting) {
      return res.status(404).json({ message: "Setting not found" });
    }
    
    res.json(updatedSetting);
  });

  const httpServer = createServer(app);
  return httpServer;
}
