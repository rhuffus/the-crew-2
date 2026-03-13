import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/drizzle/schema/*.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgresql://thecrew:thecrew@localhost:5432/thecrew',
  },
})
