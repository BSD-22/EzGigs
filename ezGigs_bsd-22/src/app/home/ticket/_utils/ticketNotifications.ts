import { TicketModel } from "@/db/models/ticket";

const showNotification = (ticket: TicketModel) => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return;
  }

  if (Notification.permission === "granted") {
    new Notification("Upcoming Event Reminder! 🎫", {
      body: `${ticket.name} is starting in less than a week!\nDate: ${new Date(
        ticket.date
      ).toLocaleDateString()}\nTime: ${ticket.time}\nVenue: ${ticket.venue}`,
      icon: ticket.image,
      tag: `event-reminder-${ticket._id}`,
    });
  }
};

const checkNotifications = async () => {
  try {
    const response = await fetch("/api/notifications", {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch notifications");
    }

    const data = await response.json();
    if (data.upcomingEvents && Array.isArray(data.upcomingEvents)) {
      data.upcomingEvents.forEach(showNotification);
    }
  } catch (error) {
    console.error("Error checking notifications:", error);
  }
};

export const startNotificationService = async () => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    console.log("Notification permission denied");
    return;
  }

  // Check immediately
  await checkNotifications();

  // Set up polling every hour to check for new notifications
  const interval = setInterval(checkNotifications, 60 * 60 * 1000);

  // Return cleanup function
  return () => {
    clearInterval(interval);
    console.log("Notification service stopped");
  };
};
