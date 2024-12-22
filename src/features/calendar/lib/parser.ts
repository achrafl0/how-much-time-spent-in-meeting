import ICAL from "ical.js";
import { CalendarEvent } from "./types";
import { normalizeEmail } from "./utils";

function getAttendeeEmail(prop: ICAL.Property): string | null {
  const value = prop.getFirstValue();
  return typeof value === "string" ? value.replace("mailto:", "") : null;
}

export function parseIcsData(icsString: string): CalendarEvent[] {
  try {
    const jcalData = ICAL.parse(icsString);
    const comp = new ICAL.Component(jcalData);
    const vevents = comp.getAllSubcomponents("vevent");

    return vevents.map((vevent: ICAL.Component): CalendarEvent => {
      const event = new ICAL.Event(vevent);

      // Get all attendee properties
      const attendeeProps = vevent.getAllProperties("attendee");

      // Filter and process attendees
      const attendees = attendeeProps
        .map(getAttendeeEmail)
        .filter((email): email is string => {
          if (!email) return false;

          // Filter out resources
          const isResource =
            email.includes("resource.calendar.google") ||
            email.includes("team") ||
            email.includes("ovrsalle");

          return !isResource;
        })
        .map(normalizeEmail);

      // Get the user's status from the attendee properties
      let status = "NEEDS-ACTION";
      attendeeProps.forEach((prop) => {
        const partstat = prop.getParameter("partstat");
        if (partstat && typeof partstat === "string") {
          status = partstat.toUpperCase();
        }
      });

      return {
        summary: event.summary || "",
        startTime: event.startDate.toJSDate(),
        endTime: event.endDate.toJSDate(),
        attendees: attendees,
        status,
      };
    });
  } catch (error) {
    console.error("Error parsing ICS data:", error);
    return [];
  }
}
