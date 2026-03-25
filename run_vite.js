import { createServer } from 'vite';

async function startServer() {
  const server = await createServer({
    // any configuration options
    server: { port: 5173 },
  });
  await server.listen();
  server.printUrls();
}

startServer();
