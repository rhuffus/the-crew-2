export const STREAM_NAMES = {
  PLATFORM_EVENTS: 'stream:platform:events',
  PLATFORM_COMMANDS: 'stream:platform:commands',
  COMPANY_DESIGN_EVENTS: 'stream:company-design:events',
  COMPANY_DESIGN_COMMANDS: 'stream:company-design:commands',
  WEB_BFF_EVENTS: 'stream:web-bff:events',
} as const

export type StreamName = (typeof STREAM_NAMES)[keyof typeof STREAM_NAMES]

export const CONSUMER_GROUPS = {
  PLATFORM: 'cg:platform',
  COMPANY_DESIGN: 'cg:company-design',
  WEB_BFF: 'cg:web-bff',
  TEMPORAL_WORKER: 'cg:temporal-worker',
} as const

export type ConsumerGroup = (typeof CONSUMER_GROUPS)[keyof typeof CONSUMER_GROUPS]
