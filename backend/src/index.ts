import 'dotenv/config';
import app from './app';
import prisma from './utils/prisma';
import { startWorkers } from './workers';
import { closeQueues } from './lib/queue';

const PORT = parseInt(process.env.PORT || '4000', 10);

async function main() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Database connected successfully');

    app.listen(PORT, () => {
      console.log(`\n  CDC ATS Backend running on http://localhost:${PORT}`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Health check: http://localhost:${PORT}/api/health\n`);

      // Start background workers (BullMQ) — safe to call without Redis
      startWorkers();
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down...');
  await closeQueues().catch(() => {});
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down...');
  await closeQueues().catch(() => {});
  await prisma.$disconnect();
  process.exit(0);
});

main();
