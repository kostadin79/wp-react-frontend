// MSW server setup for Node.js tests
import { setupServer } from 'msw/node';
import { handlers } from './msw-handlers';

// Setup server with handlers
export const server = setupServer(...handlers);

// Export a function to reset handlers
export const resetHandlers = () => server.resetHandlers(...handlers);