import { baseUrl } from "@/constants/baseUrl";
import { TicketModel } from "@/db/models/ticket";
import { cookies } from "next/headers";

type NotificationPermission = "granted" | "denied" | "default";

type NotificationOptions<T> = {
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: T;
};

interface ReminderData {
  ticketId: string;
  eventName: string;
  venue: string;
}

const createNotification = <T>(title: string, options: NotificationOptions<T>): Notification | null => {
  if (typeof window === "undefined") {
    return null;
  }
  return new Notification(title, options);
};

const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  // Check if we're on the server side
  if (typeof window === "undefined") {
    console.log("Running on server side - notifications not available");
    return "denied";
  }

  if (!("Notification" in window)) {
    console.error("Browser ga support push notifications");
    return "denied";
  }

  return await Notification.requestPermission();
};

const calculateTimeUntilEvent = (eventDate: Date): number => eventDate.getTime() - new Date().getTime();

const isOneWeekBefore = (eventDate: Date): boolean => {
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const timeUntilEvent = calculateTimeUntilEvent(eventDate);
  return timeUntilEvent <= oneWeek && timeUntilEvent > 0;
};

const sendEventReminder = async (ticket: TicketModel): Promise<void> => {
  const permission = await requestNotificationPermission();

  if (permission === "granted") {
    const notificationOptions: NotificationOptions<ReminderData> = {
      body: `Reminder: ${ticket.name} akan dimulai dalam waktu kurang dari 1 minggu! Jangan lupa beli tiketnya ya!`,
      icon: "/path/to/notification-icon.png",
      tag: `event-reminder-${ticket._id}`,
      data: {
        ticketId: ticket._id.toString(),
        eventName: ticket.name,
        venue: ticket.venue,
      },
    };

    createNotification("Event Reminder! 🎫", notificationOptions);
  }
};

let morningInterval: NodeJS.Timeout;
let eveningInterval: NodeJS.Timeout;

const scheduleAtTime = (hour: number, minute: number, callback: () => void): NodeJS.Timeout => {
  const now = new Date();
  const scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);

  if (scheduledTime.getTime() < now.getTime()) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  return setInterval(() => {
    callback();
  }, 24 * 60 * 60 * 1000);
};

export const checkAndSendReminders = async (force = false): Promise<void> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    const response = await fetch(baseUrl + "/api/ticket", {
      method: "GET",
      credentials: "include",
      headers: {
        Cookie: `token=${token?.value}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch tickets");
    const json = await response.json();

    const ticketsToRemind = json.data.filter((ticket: TicketModel) => force || isOneWeekBefore(new Date(ticket.date)));

    for (const ticket of ticketsToRemind) {
      await sendEventReminder(ticket);
    }
  } catch (error) {
    console.error("Error sending reminders:", error);
  }
};

export const startNotificationService = (): void => {
  morningInterval = scheduleAtTime(9, 0, checkAndSendReminders);

  eveningInterval = scheduleAtTime(17, 0, checkAndSendReminders);

  console.log("Notification service started! ��");
};

export const stopNotificationService = (): void => {
  if (morningInterval) clearInterval(morningInterval);
  if (eveningInterval) clearInterval(eveningInterval);
  console.log("Notification service stopped! 🔕");
};
