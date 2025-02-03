import nodemailer from "nodemailer";

interface UserData {
  name: string;
  email: string;
}

interface BuyerData {
  email: string;
  name: string;
  phone: string;
  identityType: "KTP" | "Passport" | "SIM" | "Student";
  identityDetails: string;
}

interface TicketDetails {
  name: string;
  date: string;
  time: string;
  venue: string;
  category: string; // This will receive categoryName from the request
  price: number;
  ticketId: string;
}

export const sendETicket = async (userData: UserData, buyerData: BuyerData, ticketDetails: TicketDetails) => {
  console.log(buyerData, "buyerdata nodemailer");
  console.log(ticketDetails, "ticketdetails nodemailer");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_GOOGLE_USER,
      pass: process.env.EMAIL_GOOGLE_PASS,
    },
  });

  const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #1A1A1A; color: white;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #8E2DE2; margin: 0;">TIXID E-Ticket</h1>
        <p style="color: #00F5A0;">Your ticket has been confirmed!</p>
      </div>
      
      <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="color: #8E2DE2; margin-top: 0;">${ticketDetails.name || "Event Ticket"}</h2>
        <p style="margin: 5px 0;">Date: ${new Date(ticketDetails.date).toLocaleDateString()}</p>
        <p style="margin: 5px 0;">Time: ${ticketDetails.time}</p>
        <p style="margin: 5px 0;">Venue: ${ticketDetails.venue}</p>
        <p style="margin: 5px 0;">Seat Number: ${ticketDetails.category}</p>
        <p style="margin: 5px 0;">Price: Rp ${ticketDetails.price.toLocaleString("id-ID")}</p>
        <p style="margin: 5px 0;">Ticket ID: ${ticketDetails.ticketId}</p>
      </div>
      
      <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 10px;">
        <h3 style="color: #00F5A0; margin-top: 0;">Buyer Details</h3>
        <p style="margin: 5px 0; color:white;">Name: ${buyerData.name}</p>
        <p style="margin: 5px 0; color:white;">Email: ${buyerData.email}</p>
        <p style="margin: 5px 0; color:white;">Phone: ${buyerData.phone}</p>
        <p style="margin: 5px 0; color:white;">Identity Type: ${buyerData.identityType}</p>
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <p style="color: #666; font-size: 12px;">This is an automated email, please do not reply.</p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_GOOGLE_USER,
    to: userData.email,
    subject: `Your E-Ticket Confirmation`,
    html: emailTemplate,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
};
