import { Booking } from "@/lib/db/store";

export function generateICSEvent(booking: Booking, productName: string): string {
  const formatDate = (dateStr: string) => {
    return dateStr.replace(/-/g, "");
  };

  // DTEND must be exclusive (the day after the rental ends)
  const endDateObj = new Date(booking.endDate);
  endDateObj.setDate(endDateObj.getDate() + 1);
  const formattedEndDate = endDateObj.toISOString().split("T")[0].replace(/-/g, "");

  const stamp = new Date(booking.createdAt).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Aurevia Camera Rentals//NONSGML v1.0//EN",
    "BEGIN:VEVENT",
    `UID:${booking.id}@aurevia.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${formatDate(booking.startDate)}`,
    `DTEND;VALUE=DATE:${formattedEndDate}`,
    `SUMMARY:Aurevia Camera Rental - ${productName}`,
    `DESCRIPTION:Your camera rental booking ${booking.referenceCode} is confirmed.\\nPickup: ${booking.startDate}\\nReturn: ${booking.endDate}\\nContact: ${booking.contactName} (${booking.contactPhone})`,
    "LOCATION:Aurevia Studio Vault, Gadag, Karnataka",
    "END:VEVENT",
    "END:VCALENDAR"
  ];

  return lines.join("\r\n");
}

export function downloadCalendarFile(booking: Booking, productName: string) {
  const icsContent = generateICSEvent(booking, productName);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `aurevia-booking-${booking.referenceCode}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
