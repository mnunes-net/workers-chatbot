export async function handleRootGet(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  // 1. Prepare a query to get all distinct users from the history table
  const query = 'SELECT DISTINCT user_name FROM history ORDER BY user_name;';
  const stmt = env.chatbot.prepare(query);

  // 2. Execute the query and get the results
  const { results } = await stmt.all<{ user_name: string }>();

  // 3. Generate the new HTML page
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Chatbot Home</title>
        <style>
          body { font-family: Helvetica, sans-serif; margin: 2em; background-color: #f9f9f9; }
          h1, h2 { color: #f38020; border-bottom: 2px solid #eee; padding-bottom: 10px; }
          .container { max-width: 800px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          ul { list-style: none; padding: 0; }
          li { margin: 0.5em 0; }
          a { text-decoration: none; color: #007bff; font-weight: bold; font-size: 1.1em; }
          a:hover { text-decoration: underline; }
          form { margin-top: 1em; }
          input[type="text"] { padding: 10px; border: 1px solid #ccc; border-radius: 4px; width: 250px; }
          button { padding: 10px 15px; border: none; border-radius: 4px; background-color: #f38020; color: white; cursor: pointer; font-size: 1em; }
          button:hover { background-color: #d86c12; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Welcome to the Worker Chatbot!</h1>

          <h2>Continue a Conversation</h2>
          ${
            results && results.length > 0
              ? `<ul>
                  ${results.map((user) => `<li><a href="/chat/${user.user_name}">${user.user_name}</a></li>`).join('')}
                </ul>`
              : `<p>No users have started a chat yet.</p>`
          }

          <h2>Start a New Chat</h2>
          <form id="new-chat-form">
            <input type="text" id="userNameInput" placeholder="Enter your username" required />
            <button type="submit">Start Chat</button>
          </form>
        </div>

        <script>
          const form = document.getElementById('new-chat-form');
          const input = document.getElementById('userNameInput');

          form.addEventListener('submit', (e) => {
            e.preventDefault();
            const userName = input.value.trim();
            if (userName) {
              // This is the key line: It dynamically creates the URL
              // from whatever you type in the input box.
              window.location.href = \`/chat/\${userName}/1\`;
            }
          });
        </script>
      </body>
    </html>
  `;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}