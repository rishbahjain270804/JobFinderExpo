import Fastify from 'fastify';
import { registerRoutes } from './routes';
import { store } from './storage';

async function main() {
  const app = Fastify({ logger: false });
  await registerRoutes(app);
  setInterval(() => {
    store.purgeOldJobs(30);
  }, 24 * 60 * 60 * 1000);
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
  await app.listen({ port, host: '0.0.0.0' });
}

main();