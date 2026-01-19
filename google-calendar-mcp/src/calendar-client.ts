import { google, calendar_v3 } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { loadTokens, saveTokens, StoredTokens } from "./auth/token-store.js";
import { getTimeInPST, toDateStringPST, PST_TIMEZONE } from "./utils/date.js";

// User timezone per CLAUDE.md
const USER_TIMEZONE = PST_TIMEZONE;

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
  attendees?: string[];
  htmlLink?: string;
}

export interface FreeTimeBlock {
  start: string;
  end: string;
  durationMinutes: number;
}

export interface CreateEventParams {
  summary: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
  colorId?: string;
}

export interface UpdateEventParams {
  summary?: string;
  start?: string;
  end?: string;
  description?: string;
  location?: string;
  colorId?: string;
}

export class CalendarClient {
  private oauth2Client: OAuth2Client;
  private calendar: calendar_v3.Calendar;
  private initialized = false;

  constructor(clientId: string, clientSecret: string) {
    this.oauth2Client = new OAuth2Client(clientId, clientSecret);
    this.calendar = google.calendar({ version: "v3", auth: this.oauth2Client });
  }

  async initialize(force = false): Promise<void> {
    if (this.initialized && !force) return;

    const tokens = await loadTokens();
    if (!tokens) {
      throw new Error(
        'No tokens found. Run "npm run auth" in google-calendar-mcp to authorize.'
      );
    }

    // Check for missing refresh token and provide helpful error
    if (!tokens.refresh_token) {
      throw new Error(
        'No refresh token found. Run "npm run auth" in google-calendar-mcp to re-authorize.'
      );
    }

    this.oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
      token_type: tokens.token_type,
    });

    // Set up auto-refresh listener (only once)
    if (!this.initialized) {
      this.oauth2Client.on("tokens", async (newTokens) => {
        await saveTokens({
          access_token: newTokens.access_token ?? undefined,
          refresh_token: newTokens.refresh_token ?? undefined,
          expiry_date: newTokens.expiry_date ?? undefined,
          token_type: newTokens.token_type ?? undefined,
          scope: newTokens.scope ?? undefined,
        });
      });
    }

    this.initialized = true;
  }

  /**
   * Force reload tokens from disk. Call this after running `npm run auth`.
   */
  async reinitialize(): Promise<void> {
    this.initialized = false;
    await this.initialize(true);
  }

  /**
   * Execute an API call with automatic token reload on auth errors.
   * If the call fails with an auth error, reload tokens from disk and retry once.
   */
  private async withTokenReload<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error: unknown) {
      // Check if this is an auth-related error
      const isAuthError =
        error instanceof Error &&
        (error.message.includes("No refresh token is set") ||
          error.message.includes("invalid_grant") ||
          error.message.includes("Token has been expired or revoked") ||
          error.message.includes("Invalid Credentials"));

      if (isAuthError) {
        // Try reloading tokens from disk and retry once
        try {
          await this.reinitialize();
          return await operation();
        } catch (retryError) {
          // If retry fails, throw a helpful error message
          throw new Error(
            `Authentication failed after token reload. Run "npm run auth" in google-calendar-mcp to re-authorize. Original error: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }

      throw error;
    }
  }

  private formatEventTime(dateTime?: string | null, date?: string | null): string {
    if (dateTime) {
      // Convert to PST for display
      const d = new Date(dateTime);
      return d.toLocaleString("en-US", {
        timeZone: USER_TIMEZONE,
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    }
    if (date) {
      // All-day event
      return `${date} (all day)`;
    }
    return "Unknown";
  }

  private mapEvent(event: calendar_v3.Schema$Event): CalendarEvent {
    return {
      id: event.id!,
      summary: event.summary || "(No title)",
      description: event.description || undefined,
      start: this.formatEventTime(event.start?.dateTime, event.start?.date),
      end: this.formatEventTime(event.end?.dateTime, event.end?.date),
      location: event.location || undefined,
      attendees: event.attendees?.map((a) => a.email!).filter(Boolean),
      htmlLink: event.htmlLink || undefined,
    };
  }

  async listEvents(
    calendarId: string,
    timeMin: Date,
    timeMax: Date,
    maxResults: number = 50
  ): Promise<CalendarEvent[]> {
    await this.initialize();

    return this.withTokenReload(async () => {
      const response = await this.calendar.events.list({
        calendarId,
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        maxResults,
        singleEvents: true,
        orderBy: "startTime",
        timeZone: USER_TIMEZONE,
      });

      return (response.data.items || []).map((event) => this.mapEvent(event));
    });
  }

  async getEvent(calendarId: string, eventId: string): Promise<CalendarEvent> {
    await this.initialize();

    return this.withTokenReload(async () => {
      const response = await this.calendar.events.get({
        calendarId,
        eventId,
      });

      return this.mapEvent(response.data);
    });
  }

  async findFreeTime(
    calendarId: string,
    dateStr: string, // YYYY-MM-DD format, interpreted as PST
    minDurationMinutes: number,
    startHour: number,
    endHour: number
  ): Promise<FreeTimeBlock[]> {
    await this.initialize();

    // Set up time bounds for the day in PST
    // Using getTimeInPST ensures correct handling regardless of server timezone
    const dayStart = getTimeInPST(dateStr, startHour);
    const dayEnd = getTimeInPST(dateStr, endHour);

    return this.withTokenReload(async () => {
      // Get events for the day
      const response = await this.calendar.events.list({
        calendarId,
        timeMin: dayStart.toISOString(),
        timeMax: dayEnd.toISOString(),
        singleEvents: true,
        orderBy: "startTime",
        timeZone: USER_TIMEZONE,
      });

      const events = response.data.items || [];
      const freeBlocks: FreeTimeBlock[] = [];

      let currentTime = dayStart;

      for (const event of events) {
        const eventStart = new Date(event.start?.dateTime || event.start?.date!);
        const eventEnd = new Date(event.end?.dateTime || event.end?.date!);

        // If there's a gap before this event
        if (eventStart > currentTime) {
          const gapMinutes = (eventStart.getTime() - currentTime.getTime()) / 60000;
          if (gapMinutes >= minDurationMinutes) {
            freeBlocks.push({
              start: this.formatEventTime(currentTime.toISOString(), null),
              end: this.formatEventTime(eventStart.toISOString(), null),
              durationMinutes: Math.round(gapMinutes),
            });
          }
        }

        // Move current time to end of this event
        if (eventEnd > currentTime) {
          currentTime = eventEnd;
        }
      }

      // Check for free time after last event
      if (currentTime < dayEnd) {
        const gapMinutes = (dayEnd.getTime() - currentTime.getTime()) / 60000;
        if (gapMinutes >= minDurationMinutes) {
          freeBlocks.push({
            start: this.formatEventTime(currentTime.toISOString(), null),
            end: this.formatEventTime(dayEnd.toISOString(), null),
            durationMinutes: Math.round(gapMinutes),
          });
        }
      }

      return freeBlocks;
    });
  }

  async createEvent(
    calendarId: string,
    params: CreateEventParams
  ): Promise<CalendarEvent> {
    await this.initialize();

    return this.withTokenReload(async () => {
      const response = await this.calendar.events.insert({
        calendarId,
        requestBody: {
          summary: params.summary,
          description: params.description,
          location: params.location,
          colorId: params.colorId,
          start: {
            dateTime: params.start,
            timeZone: USER_TIMEZONE,
          },
          end: {
            dateTime: params.end,
            timeZone: USER_TIMEZONE,
          },
        },
      });

      return this.mapEvent(response.data);
    });
  }

  async updateEvent(
    calendarId: string,
    eventId: string,
    params: UpdateEventParams
  ): Promise<CalendarEvent> {
    await this.initialize();

    return this.withTokenReload(async () => {
      // Get existing event first
      const existing = await this.calendar.events.get({
        calendarId,
        eventId,
      });

      const response = await this.calendar.events.update({
        calendarId,
        eventId,
        requestBody: {
          ...existing.data,
          summary: params.summary ?? existing.data.summary,
          description: params.description ?? existing.data.description,
          location: params.location ?? existing.data.location,
          colorId: params.colorId ?? existing.data.colorId,
          start: params.start
            ? { dateTime: params.start, timeZone: USER_TIMEZONE }
            : existing.data.start,
          end: params.end
            ? { dateTime: params.end, timeZone: USER_TIMEZONE }
            : existing.data.end,
        },
      });

      return this.mapEvent(response.data);
    });
  }

  async deleteEvent(calendarId: string, eventId: string): Promise<void> {
    await this.initialize();

    return this.withTokenReload(async () => {
      await this.calendar.events.delete({
        calendarId,
        eventId,
      });
    });
  }
}
