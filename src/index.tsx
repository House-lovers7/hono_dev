import { Hono } from 'hono'
import { Ai } from '@cloudflare/ai' 
import { z } from "zod"

type Bindings = {
  AI: any
}

const MessageSchema = z.object({
  content: z.string(),
  role: z.enum(["user", "assistant", "system"]),
});

const AnswerSchema = z.object({
  response: z.string(),
});

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/ai', async (c) => {
  const ai = new Ai(c.env.AI)
  
  const messageInput = {
    role: 'user',
    content: `What is Cloudflare Workers. You respond in less than 100 words.`
  };
  
  const parsedMessage = MessageSchema.parse(messageInput);
  
  const answer = await ai.run('@cf/meta/llama-2-7b-chat-int8', {
    messages: [parsedMessage]
  })
  
  const parsedAnswer = AnswerSchema.parse(answer);

  return c.text(parsedAnswer.response)
})

export default app