
/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { handleRootGet } from './handlers/rootGet';
import { handleChatGet } from './handlers/chatGet';
import { handleChatPost } from './handlers/chatPost';
import { handleUserGet } from './handlers/userGet';
 
interface Routes {
  [path: string]: {
    [method: string]: (request: Request, env: Env, ctx: ExecutionContext) => Promise<Response>;
  };
}

const routes: Routes = {
  '/': {
    GET: handleRootGet,
  },
  '/chat': {
    GET: handleChatGet,
    POST: handleChatPost,
  },
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/').filter(segment => segment); // Get non-empty path parts

    // Route based on the path structure
    if (pathSegments.length === 0) {
      // Home page: /
      return handleRootGet(request, env, ctx);
    }

    if (pathSegments[0] === 'chat') {
      if (pathSegments.length === 2) {
        // User page: /chat/<userName>
        // We will create this handler next
        return handleUserGet(request, env, ctx);
      }
      if (pathSegments.length === 3) {
        // Specific chat page: /chat/<userName>/<chatId>
        if (request.method === 'GET') {
          return handleChatGet(request, env, ctx);
        }
        if (request.method === 'POST') {
          return handleChatPost(request, env, ctx);
        }
      }
    }

    // Fallback to 404 Not Found
    return new Response('Not Found', { status: 404 });
  },
};

