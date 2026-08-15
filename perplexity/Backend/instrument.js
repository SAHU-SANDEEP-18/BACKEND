import * as Sentry from "@sentry/node";
import dotenv from "dotenv";
dotenv.config();


Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    // send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
  // Enable logs to be sent to Sentry
  enableLogs: true,
  tracesSampleRate: 1.0,
  debug: true,
  sendDefaultPii: true,
});

Sentry.logger.info('User triggered test log', { action: 'test_log' })