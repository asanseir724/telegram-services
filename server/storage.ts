import { users, type User, type InsertUser, type Service, type InsertService, type Order, type InsertOrder, type Setting, type InsertSetting } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Service methods
  getServices(): Promise<Service[]>;
  getServicesByType(type: string): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;
  
  // Order methods
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order | undefined>;
  deleteOrder(id: number): Promise<boolean>;
  
  // Settings methods
  getSettings(): Promise<Setting[]>;
  getSetting(key: string): Promise<Setting | undefined>;
  createSetting(setting: InsertSetting): Promise<Setting>;
  updateSetting(key: string, value: string): Promise<Setting | undefined>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private services: Map<number, Service>;
  private orders: Map<number, Order>;
  private settings: Map<string, Setting>;
  currentId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.services = new Map();
    this.orders = new Map();
    this.settings = new Map();
    this.currentId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });

    // Initialize with default services and settings
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Default admin user
    this.createUser({
      username: "admin",
      password: "admin123", // In a real app, this would be hashed
      isAdmin: true,
      name: "Admin User",
      email: "admin@telegramplus.com"
    });

    // Default services for Stars
    this.createService({
      name: "100 Stars",
      type: "stars",
      quantity: 100,
      price: 3.99
    });
    this.createService({
      name: "200 Stars",
      type: "stars",
      quantity: 200,
      price: 7.49
    });
    this.createService({
      name: "500 Stars",
      type: "stars",
      quantity: 500,
      price: 17.99
    });
    this.createService({
      name: "1000 Stars",
      type: "stars",
      quantity: 1000,
      price: 34.99
    });

    // Default services for Premium
    this.createService({
      name: "1 Month Premium",
      type: "premium",
      quantity: 1,
      price: 9.99
    });
    this.createService({
      name: "3 Months Premium",
      type: "premium",
      quantity: 3,
      price: 26.99
    });
    this.createService({
      name: "6 Months Premium",
      type: "premium",
      quantity: 6,
      price: 49.99
    });
    this.createService({
      name: "12 Months Premium",
      type: "premium",
      quantity: 12,
      price: 89.99
    });

    // Default settings
    this.createSetting({
      key: "stars_commission",
      value: "15"
    });
    this.createSetting({
      key: "premium_commission",
      value: "20"
    });
    this.createSetting({
      key: "site_name",
      value: "TelegramPlus"
    });
    this.createSetting({
      key: "contact_email",
      value: "support@telegramplus.com"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updateData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Service methods
  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }

  async getServicesByType(type: string): Promise<Service[]> {
    return Array.from(this.services.values()).filter(
      (service) => service.type === type
    );
  }

  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = this.currentId++;
    const service: Service = { ...insertService, id };
    this.services.set(id, service);
    return service;
  }

  async updateService(id: number, updateData: Partial<InsertService>): Promise<Service | undefined> {
    const service = this.services.get(id);
    if (!service) return undefined;
    
    const updatedService = { ...service, ...updateData };
    this.services.set(id, updatedService);
    return updatedService;
  }

  async deleteService(id: number): Promise<boolean> {
    return this.services.delete(id);
  }

  // Order methods
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentId++;
    const order: Order = { 
      ...insertOrder, 
      id, 
      createdAt: new Date() 
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(id: number, updateData: Partial<InsertOrder>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, ...updateData };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async deleteOrder(id: number): Promise<boolean> {
    return this.orders.delete(id);
  }

  // Settings methods
  async getSettings(): Promise<Setting[]> {
    return Array.from(this.settings.values());
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    return this.settings.get(key);
  }

  async createSetting(insertSetting: InsertSetting): Promise<Setting> {
    const id = this.currentId++;
    const setting: Setting = { ...insertSetting, id };
    this.settings.set(setting.key, setting);
    return setting;
  }

  async updateSetting(key: string, value: string): Promise<Setting | undefined> {
    const setting = this.settings.get(key);
    if (!setting) return undefined;
    
    const updatedSetting = { ...setting, value };
    this.settings.set(key, updatedSetting);
    return updatedSetting;
  }
}

export const storage = new MemStorage();
