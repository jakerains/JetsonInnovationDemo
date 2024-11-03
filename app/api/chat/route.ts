import { NextRequest } from 'next/server';

const OLLAMA_API_URL = 'http://localhost:11434/api/chat';
const DEFAULT_MODEL = 'jakerains/jetson_ai_demo';

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  try {
    const { messages } = await req.json();

    // Format messages for Ollama API
    const formattedMessages = messages.map((message: any) => ({
      role: message.role === 'bot' ? 'assistant' : message.role,
      content: message.text
    }));

    const ollamaRequest = {
      model: DEFAULT_MODEL,
      messages: formattedMessages,
      stream: true
    };

    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ollamaRequest)
    });

    if (!response.ok) {
      throw new Error(`Ollama API responded with status ${response.status}`);
    }

    // Create a TransformStream to process the response
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Process the response stream
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            await writer.close();
            break;
          }

          // Parse the chunks
          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              if (data.message?.content) {
                await writer.write(
                  encoder.encode(`data: ${JSON.stringify({ content: data.message.content })}\n\n`)
                );
              }
            } catch (e) {
              console.error('Error parsing JSON:', e);
            }
          }
        }
      } catch (error) {
        console.error('Stream processing error:', error);
        await writer.abort(error);
      }
    })();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}