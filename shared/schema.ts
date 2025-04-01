import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  name: text("name"),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'stars' or 'premium'
  quantity: integer("quantity"), // Stars quantity or Premium months
  price: doublePrecision("price").notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").notNull(),
  telegramId: text("telegram_id").notNull(),
  phoneNumber: text("phone_number").notNull(),
  email: text("email"),
  quantity: integer("quantity").notNull(),
  total: doublePrecision("total").notNull(),
  status: text("status").default("pending").notNull(), // 'pending', 'processing', 'completed', 'cancelled'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 50 }).notNull().unique(),
  value: text("value").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  isAdmin: true,
});

export const insertServiceSchema = createInsertSchema(services).pick({
  name: true,
  type: true,
  quantity: true,
  price: true,
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  serviceId: true,
  telegramId: true,
  phoneNumber: true, 
  email: true,
  quantity: true,
  total: true,
  status: true,
});

export const insertSettingSchema = createInsertSchema(settings).pick({
  key: true,
  value: true, 
});

export const orderFormSchema = z.object({
  telegramId: z.string().min(3, { message: "Telegram ID must be at least 3 characters" }),
  phoneNumber: z.string().min(5, { message: "Phone number is required" }),
  email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal("")),
  quantity: z.number().positive(),
  serviceId: z.number().positive(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type OrderForm = z.infer<typeof orderFormSchema>;

export type User = typeof users.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Setting = typeof settings.$inferSelect;
