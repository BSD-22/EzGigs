import { TicketModel } from "@/db/models/ticket";

// Types
type NotificationPermission = "granted" | "denied" | "default";
type NotificationOptions = {
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
};

// Pure functions untuk handle notifications
const createNotification = (title: string, options: NotificationOptions): Notification => 
  new Notification(title, options);

const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!("Notification" in window)) {
    console.error("Browser ga support push notifications");
    return "denied";
  }
  
  return await Notification.requestPermission();
};

const calculateTimeUntilEvent = (eventDate: Date): number => 
  eventDate.getTime() - new Date().getTime();

const isOneWeekBefore = (eventDate: Date): boolean => {
  const oneWeek = 7 * 24 * 60 * 60 * 1000; // 1 minggu dalam milliseconds
  const timeUntilEvent = calculateTimeUntilEvent(eventDate);
  return timeUntilEvent <= oneWeek && timeUntilEvent > 0;
};

// Function buat send notification
const sendEventReminder = async (ticket: TicketModel): Promise<void> => {
  const permission = await requestNotificationPermission();
  
  if (permission === "granted") {
    const notificationOptions: NotificationOptions = {
      body: `Reminder: ${ticket.name} akan dimulai dalam waktu kurang dari 1 minggu! Jangan lupa beli tiketnya ya!`,
      icon: "/path/to/notification-icon.png", // Ganti dengan path icon lo
      tag: `event-reminder-${ticket._id}`,
      data: {
        ticketId: ticket._id,
        eventName: ticket.name,
        venue: ticket.venue
      }
    };

    createNotification("Event Reminder! 🎫", notificationOptions);
  }
};

let morningInterval: NodeJS.Timeout;
let eveningInterval: NodeJS.Timeout;

const scheduleAtTime = (hour: number, minute: number, callback: () => void): NodeJS.Timeout => {
  const now = new Date();
  let scheduledTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    minute
  );
  
  // Jika waktu yang ditentukan sudah lewat hari ini, jadwalkan untuk besok
  if (scheduledTime.getTime() < now.getTime()) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }
  
  const msUntilScheduled = scheduledTime.getTime() - now.getTime();
  
  // Jalankan setiap 24 jam
  return setInterval(() => {
    callback();
  }, 24 * 60 * 60 * 1000);
};

// Main function buat check dan send reminders
const checkAndSendReminders = async (): Promise<void> => {
  try {
    const response = await fetch('/api/tickets');
    if (!response.ok) {
      throw new Error('Failed to fetch tickets');
    }
    const tickets = await response.json();
    
    const ticketsToRemind = tickets.filter((ticket: TicketModel) => 
      isOneWeekBefore(new Date(ticket.date))
    );

    await Promise.all(
      ticketsToRemind.map((ticket: TicketModel) => sendEventReminder(ticket))
    );
  } catch (error) {
    console.error("Error sending reminders:", error);
  }
};

// Function untuk start notification service
export const startNotificationService = (): void => {
  // Schedule untuk pagi jam 09:00 WIB
  morningInterval = scheduleAtTime(9, 0, checkAndSendReminders);
  
  // Schedule untuk sore jam 17:00 WIB
  eveningInterval = scheduleAtTime(17, 0, checkAndSendReminders);
  
  console.log("Notification service started! ��");
};

// Function untuk stop notification service
export const stopNotificationService = (): void => {
  if (morningInterval) clearInterval(morningInterval);
  if (eveningInterval) clearInterval(eveningInterval);
  console.log("Notification service stopped! 🔕");
}; 