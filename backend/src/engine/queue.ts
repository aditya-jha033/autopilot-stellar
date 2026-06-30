import { Queue } from "bullmq";
import type { ConnectionOptions } from "bullmq";

// ────────────────────────────────────────────────────────────────────────────
// Queue names
// ────────────────────────────────────────────────────────────────────────────
export const PAYMENT_QUEUE_NAME = "autopilot-payment-events";
export const CRON_QUEUE_NAME = "autopilot-cron-rules";

// ────────────────────────────────────────────────────────────────────────────
// Build BullMQ connection options from REDIS_URL env var
// Supports: redis://... and rediss://... (TLS)
// ────────────────────────────────────────────────────────────────────────────
export function getConnectionOptions(): ConnectionOptions {
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error(
      "[Engine] REDIS_URL is not set.\n" +
      "Get a free Redis DB at https://console.upstash.com\n" +
      "Then add: REDIS_URL=rediss://:TOKEN@host.upstash.io:6379"
    );
  }

  const parsed = new URL(url);
  const opts: ConnectionOptions = {
    host: parsed.hostname,
    port: parseInt(parsed.port) || 6379,
    password: parsed.password || undefined,
    username: parsed.username && parsed.username !== "default" ? parsed.username : undefined,
    tls: url.startsWith("rediss://") ? {} : undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  } as ConnectionOptions;

  return opts;
}

// ────────────────────────────────────────────────────────────────────────────
// BullMQ Queue instances
// ────────────────────────────────────────────────────────────────────────────
let _paymentQueue: Queue | null = null;
let _cronQueue: Queue | null = null;

export function getPaymentQueue(): Queue {
  if (!_paymentQueue) {
    _paymentQueue = new Queue(PAYMENT_QUEUE_NAME, {
      connection: getConnectionOptions(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    });
  }
  return _paymentQueue;
}

export function getCronQueue(): Queue {
  if (!_cronQueue) {
    _cronQueue = new Queue(CRON_QUEUE_NAME, {
      connection: getConnectionOptions(),
      defaultJobOptions: {
        attempts: 2,
        backoff: { type: "fixed", delay: 10000 },
        removeOnComplete: 50,
        removeOnFail: 200,
      },
    });
  }
  return _cronQueue;
}

// ────────────────────────────────────────────────────────────────────────────
// Job data types
// ────────────────────────────────────────────────────────────────────────────
export interface PaymentJobData {
  userId: string;
  publicKey: string;
  paymentHorizonId: string; // Unique Horizon payment ID (for deduplication)
  amount: string;           // Raw XLM amount (7 decimal places string)
  asset: string;            // "XLM" or "ASSET_CODE:ISSUER"
  from: string;             // Sender public key
  createdAt: string;        // ISO timestamp from Horizon
}

export interface CronJobData {
  userId: string;
  publicKey: string;
  ruleId: string;
  amount: number;
  isPercentage: boolean;
  action: string;
  memo: string | null;
}
