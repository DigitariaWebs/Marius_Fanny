/**
 * Payment Reminders Script
 * 
 * This script:
 * 1. Sends payment reminders to government and representative clients
 *    - 1 week (7 days) before payment due date
 *    - 48 hours before payment due date
 * 2. Cancels orders that have passed their payment due date
 * 
 * Run with: bun run scripts/payment-reminders.ts
 * Or set up as a cron job to run daily
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: "./.env" });

// Import Order model
import Order from "../src/models/Order.js";

// Import mail functions
import { 
  sendPaymentReminderEmail,
  sendPaymentOverdueEmail 
} from "../src/utils/mail.js";

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || "mongodb://localhost:27017/marius-fanny";

interface OrderDocument {
  _id: mongoose.Types.ObjectId;
  orderNumber: string;
  clientInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  billingKind: "standard" | "representant" | "gouvernement";
  paymentDueDate: Date;
  paymentStatus: "unpaid" | "deposit_paid" | "paid";
  status: string;
  total: number;
}

interface ReminderRecord {
  orderId: string;
  orderNumber: string;
  email: string;
  reminderType: "week" | "48h" | "overdue";
  sentAt: Date;
}

// In-memory store for sent reminders (in production, use a database collection)
const sentReminders: Map<string, ReminderRecord[]> = new Map();

function getReminderKey(orderId: string, reminderType: string): string {
  return `${orderId}-${reminderType}`;
}

function hasSentReminder(orderId: string, reminderType: string): boolean {
  const key = getReminderKey(orderId, reminderType);
  return sentReminders.has(key);
}

function markReminderSent(orderId: string, reminderType: string): void {
  const key = getReminderKey(orderId, reminderType);
  sentReminders.set(key, {
    orderId,
    orderNumber: "",
    email: "",
    reminderType: reminderType as "week" | "48h" | "overdue",
    sentAt: new Date()
  });
}

async function sendReminderEmail(
  order: OrderDocument,
  reminderType: "week" | "48h" | "overdue"
): Promise<boolean> {
  const { clientInfo, orderNumber, total, paymentDueDate } = order;
  const fullName = `${clientInfo.firstName} ${clientInfo.lastName}`;
  
  const daysUntilDue = Math.ceil(
    (new Date(paymentDueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const billingKindLabel = {
    gouvernement: "gouvernemental",
    representant: "représentant",
    standard: "standard"
  }[order.billingKind] || "standard";

  try {
    if (reminderType === "overdue") {
      await sendPaymentOverdueEmail(
        clientInfo.email,
        fullName,
        orderNumber,
        total,
        Math.abs(daysUntilDue),
        billingKindLabel
      );
    } else {
      await sendPaymentReminderEmail(
        clientInfo.email,
        fullName,
        orderNumber,
        total,
        daysUntilDue,
        billingKindLabel,
        reminderType === "week" ? "une semaine" : "48 heures"
      );
    }
    
    console.log(`✅ Reminder sent: ${reminderType} for order ${orderNumber} to ${clientInfo.email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send ${reminderType} reminder for order ${orderNumber}:`, error);
    return false;
  }
}

async function processPaymentReminders(): Promise<void> {
  console.log("\n" + "=".repeat(60));
  console.log("🔔 PAYMENT REMINDERS PROCESSING STARTED");
  console.log("=".repeat(60));
  
  const now = new Date();
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const fortyEightHoursFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  
  // Find unpaid orders for government and representative clients with payment due dates
  const unpaidOrders = await Order.find({
    billingKind: { $in: ["gouvernement", "representant"] },
    paymentStatus: { $in: ["unpaid", "deposit_paid"] },
    paymentDueDate: { $exists: true, $ne: null },
    status: { $nin: ["cancelled", "completed"] }
  }).lean() as unknown as OrderDocument[];

  console.log(`📋 Found ${unpaidOrders.length} unpaid orders for government/representative clients`);

  let remindersSent = 0;
  let ordersCancelled = 0;

  for (const order of unpaidOrders) {
    const dueDate = new Date(order.paymentDueDate);
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log(`\n📦 Order ${order.orderNumber}:`);
    console.log(`   - Billing type: ${order.billingKind}`);
    console.log(`   - Due date: ${dueDate.toISOString().split('T')[0]}`);
    console.log(`   - Days until due: ${daysUntilDue}`);
    console.log(`   - Status: ${order.paymentStatus}`);

    // Check if order is overdue
    if (daysUntilDue < 0) {
      // Order is overdue - send final reminder and cancel
      const overdueKey = getReminderKey(order._id.toString(), "overdue");
      if (!hasSentReminder(order._id.toString(), "overdue")) {
        const sent = await sendReminderEmail(order, "overdue");
        if (sent) {
          markReminderSent(order._id.toString(), "overdue");
          remindersSent++;
        }
      }
      
      // Cancel the order
      await Order.findByIdAndUpdate(order._id, {
        status: "cancelled",
        $push: {
          changeHistory: {
            changedAt: new Date(),
            field: "status",
            oldValue: order.status,
            newValue: "cancelled",
            changeType: "status_changed",
            notes: "Commande annulée automatiquement - paiement en retard"
          }
        }
      });
      
      console.log(`   ⚠️ Order CANCELLED - payment overdue by ${Math.abs(daysUntilDue)} days`);
      ordersCancelled++;
    }
    // Check if 48 hours before due date
    else if (daysUntilDue <= 2 && daysUntilDue > 0) {
      const key48h = getReminderKey(order._id.toString(), "48h");
      if (!hasSentReminder(order._id.toString(), "48h")) {
        const sent = await sendReminderEmail(order, "48h");
        if (sent) {
          markReminderSent(order._id.toString(), "48h");
          remindersSent++;
        }
      }
    }
    // Check if 1 week before due date
    else if (daysUntilDue <= 7 && daysUntilDue > 2) {
      const keyWeek = getReminderKey(order._id.toString(), "week");
      if (!hasSentReminder(order._id.toString(), "week")) {
        const sent = await sendReminderEmail(order, "week");
        if (sent) {
          markReminderSent(order._id.toString(), "week");
          remindersSent++;
        }
      }
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 SUMMARY");
  console.log("=".repeat(60));
  console.log(`✅ Reminders sent: ${remindersSent}`);
  console.log(`⚠️ Orders cancelled: ${ordersCancelled}`);
  console.log("=".repeat(60) + "\n");
}

async function main(): Promise<void> {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    await processPaymentReminders();
    
    console.log("Disconnecting from MongoDB...");
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error processing payment reminders:", error);
    process.exit(1);
  }
}

main();
