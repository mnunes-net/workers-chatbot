import { getPathParams } from '../common';

// Handle POST request for the '/chat' route
interface ChatEntry {
  role: string;
  content: string;
}

interface ChatRequest {
  chatEntries: ChatEntry[];
}

export async function handleChatPost(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const { userName, chatId } = getPathParams(request);

  const { chatEntries } = (await request.json()) as ChatRequest;

  // This is the history sent from the frontend
  let messages = [...chatEntries];

  // If the first message is from the assistant, remove it.
  // This ensures the conversation starts with a 'user' message.
  if (messages.length > 0 && messages[0].role === 'assistant') {
    messages.shift();
  }

  const systemPrompt = (await env.CONFIG.get('systemPrompt')) ?? `You are a friendly assistant that always responds in a rhyme`
  const { response } = await env.AI.run('@cf/google/gemma-3-12b-it', {
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
  },
  {
    gateway: {
      id: 'chatbot-gateway', // use the Gateway ID you picked
    },
  });

  // get the latest prompt from the user (last chat entry)
  const lastMsg = chatEntries[chatEntries.length - 1];

  // prepare a generic insert statement (we'll bind values to it below)
  const insertStatement = env.chatbot.prepare(
    `INSERT INTO history (user_name, chat_id, role, content)
		 VALUES (?1, ?2, ?3, ?4)`
  );

  // make 2 inserts in a batch
  await env.chatbot.batch([
    // the latest user prompt
    insertStatement.bind(userName, chatId, lastMsg.role, lastMsg.content),
    // and the lastest AI response
    insertStatement.bind(userName, chatId, 'assistant', response),
  ]);

  return new Response(response, {
    headers: { 'Content-Type': 'text/plain' },
  });
}