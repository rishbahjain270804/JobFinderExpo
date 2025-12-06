import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { searchAndCache, recommendedForProfile, getRecommendedJobs } from './orchestrator';
import { store } from './storage';

const searchSchema = z.object({
  query: z.string().optional(),
  location: z.string().optional(),
  remote: z.boolean().optional(),
  seniority: z.string().optional(),
  tech: z.array(z.string()).optional(),
});

const profileSchema = z.object({
  name: z.string().optional(),
  purpose: z.string().optional(),
  currentRole: z.string().optional(),
  desiredRole: z.string().optional(),
  experience: z.string().optional(),
  location: z.string().optional(),
  workMode: z.string().optional(),
  preferredLocation: z.string().optional(),
  skills: z.string().optional(),
  salary: z.string().optional(),
  availability: z.string().optional(),
  education: z.string().optional(),
  linkedin: z.string().optional(),
});

export async function registerRoutes(app: FastifyInstance) {
  app.post('/jobs/search', async (req, reply) => {
    const parsed = searchSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'invalid_payload' });
    const ids = await searchAndCache(parsed.data);
    const jobs = ids.map(id => store.jobs.get(id)).filter(Boolean);
    return reply.send({ count: jobs.length, jobs });
  });

  app.post('/jobs/recommended', async (req, reply) => {
    const body = req.body as any;
    const profileParsed = profileSchema.safeParse(body?.profile || {});
    const searchParsed = searchSchema.safeParse(body?.criteria || {});
    if (!profileParsed.success || !searchParsed.success) return reply.code(400).send({ error: 'invalid_payload' });
    await recommendedForProfile(profileParsed.data, searchParsed.data);
    const jobs = getRecommendedJobs(profileParsed.data);
    return reply.send({ count: jobs.length, jobs });
  });

  app.get('/jobs/:id', async (req, reply) => {
    const id = (req.params as any)?.id as string;
    if (!id) return reply.code(400).send({ error: 'missing_id' });
    const job = store.jobs.get(id);
    if (!job) return reply.code(404).send({ error: 'not_found' });
    return reply.send(job);
  });
}