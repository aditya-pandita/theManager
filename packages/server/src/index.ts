import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import ticketsRouter from './routes/tickets';
import commentsRouter from './routes/comments';
import reasoningRouter from './routes/reasoning';
import statsRouter from './routes/stats';
import hooksRouter from './routes/hooks';
import processRouter from './routes/process';
import importRouter from './routes/import';
import projectsRouter from './routes/projects';
import userStoriesRouter from './routes/user-stories';
import gitRouter from './routes/git';
import ticketGitRouter from './routes/ticket-git';
import exportRouter from './routes/export';
import agentsRouter from './routes/agents';
import pipelineRouter from './routes/pipeline';
import testsRouter from './routes/tests';
import chatRouter from './routes/chat';
import activityRouter from './routes/activity';

const app = express();
const PORT = parseInt(process.env.PORT ?? '3117', 10);

app.use(cors());
app.use(express.json());

// Existing routes
app.use('/api/tickets', ticketsRouter);
app.use('/api/tickets/:id/comments', commentsRouter);
app.use('/api/tickets/:id/reasoning', reasoningRouter);
app.use('/api/stats', statsRouter);
app.use('/api/hooks', hooksRouter);
app.use('/api/process', processRouter);
app.use('/api/import/csv', express.text({ type: '*/*', limit: '10mb' }), importRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/tickets/:id/user-story', userStoriesRouter);
app.use('/api/git', gitRouter);
app.use('/api/tickets/:id/git', ticketGitRouter);
app.use('/api/export', exportRouter);

// Phase 2 routes
app.use('/api/agents',   agentsRouter);
app.use('/api/pipeline', pipelineRouter);
app.use('/api/tests',    testsRouter);
app.use('/api/tickets',  chatRouter);
app.use('/api/activity', activityRouter);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`[server] Decidr Code API running on http://localhost:${PORT}`);
});

export { app };
