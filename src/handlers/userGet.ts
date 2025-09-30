import { getPathParams } from '../common';

// Define the shape of our query result
interface Conversation {
  chat_id: string;
  message_count: number;
}

export async function handleUserGet(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const { userName } = getPathParams(request);

  // Prepare and execute the D1 query
  const query = `
    SELECT
      chat_id,
      COUNT(*) as message_count
    FROM history
    WHERE user_name = ?1
    GROUP BY chat_id
    ORDER BY chat_id;
  `;
  const stmt = env.chatbot.prepare(query).bind(userName);
  const { results } = await stmt.all<Conversation>();

  // Generate the HTML for the page
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Conversations for ${userName}</title>
        <style>
          body { font-family: Helvetica, sans-serif; margin: 2em; }
          h1 { color: #f38020; }
          ul { list-style: none; padding: 0; }
          li { margin: 1em 0; padding: 1em; border: 1px solid #ccc; border-radius: 5px; }
          a { text-decoration: none; color: #007bff; font-weight: bold; }
          span { color: #666; }
        </style>
      </head>
      <body>
        <h1>Conversations for ${userName}</h1>
        ${
          results && results.length > 0
            ? `<ul>
              ${results
                .map(
                  (convo) => `
                <li>
                  <a href="/chat/${userName}/${convo.chat_id}">Chat ${convo.chat_id}</a>
                  <span>(${convo.message_count} messages)</span>
                </li>
              `
                )
                .join('')}
            </ul>`
            : `<p>No conversations found for this user.</p>`
        }
      </body>
    </html>
  `;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}