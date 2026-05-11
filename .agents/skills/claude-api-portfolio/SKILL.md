---
name: claude-api-portfolio
description: "Integration of the Anthropic Claude API into an Angular 21 portfolio. Covers Chat-with-CV (RAG), semantic search via embeddings, and an AI blog writing assistant. Uses @anthropic-ai/sdk in Angular SSR API routes or Vercel Edge Functions."
---

# Claude API — Portfolio AI Features

## Setup

```bash
npm install @anthropic-ai/sdk
```

Set env var in `.env.local` and Vercel dashboard:
```
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Feature 1: Chat with CV (RAG)

The visitor asks questions; Claude answers using your CV as context.

### Data: `/src/data/cv.json`

```json
{
  "name": "Your Name",
  "title": "Full Stack Developer",
  "summary": "...",
  "experience": [
    {
      "company": "Acme Corp",
      "role": "Senior Developer",
      "period": "2022–present",
      "highlights": ["Built X", "Led team of Y", "Reduced Z by 40%"]
    }
  ],
  "skills": ["Angular", "Java", "Claude API", "Docker"],
  "education": [{ "degree": "CS", "institution": "...", "year": 2018 }],
  "linkedin": "https://linkedin.com/in/yourhandle"
}
```

### Angular SSR API Route: `/src/server/routes/chat.ts`

```ts
import Anthropic from '@anthropic-ai/sdk';
import cvData from '../../data/cv.json';

const client = new Anthropic();

export async function POST(req: Request): Promise<Response> {
  const { message } = await req.json();

  const cvContext = JSON.stringify(cvData, null, 2);

  const stream = await client.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: `You are an AI assistant representing ${cvData.name}'s portfolio.
Answer questions about their experience, skills, and projects based only on this CV data:

${cvContext}

Be concise, professional, and enthusiastic. If asked something not in the CV, say you don't have that information.`,
    messages: [{ role: 'user', content: message }],
  });

  return new Response(stream.toReadableStream(), {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}
```

### Angular Chat Component

```ts
@Component({
  selector: 'app-ai-chat',
  template: `
    <div class="chat-container">
      @for (msg of messages(); track msg.id) {
        <div [class]="msg.role === 'user' ? 'user-bubble' : 'ai-bubble'">
          {{ msg.content }}
        </div>
      }
    </div>
    <input [(ngModel)]="input" (keydown.enter)="send()" placeholder="Ask about my experience..." />
  `
})
export class AiChatComponent {
  messages = signal<Message[]>([]);
  input = '';

  async send() {
    const userMsg = this.input;
    this.input = '';
    this.messages.update(m => [...m, { id: Date.now(), role: 'user', content: userMsg }]);

    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: userMsg }),
      headers: { 'Content-Type': 'application/json' }
    });

    const reader = res.body!.getReader();
    let aiContent = '';
    const aiId = Date.now();
    this.messages.update(m => [...m, { id: aiId, role: 'assistant', content: '' }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      aiContent += new TextDecoder().decode(value);
      this.messages.update(m => m.map(msg => msg.id === aiId ? { ...msg, content: aiContent } : msg));
    }
  }
}
```

---

## Feature 2: Semantic Search

Search projects and blog posts by meaning, not just keywords.

### Index Generation (build-time script)

```ts
// scripts/generate-embeddings.ts
import Anthropic from '@anthropic-ai/sdk';
import projects from '../src/data/projects.json';

const client = new Anthropic();

const items = projects.map(p => ({ id: p.slug, text: `${p.title}: ${p.description}` }));

// Note: Use voyage-3-lite for embeddings (Anthropic's recommended model)
// Or use text content as simple keyword index for MVP
```

### API Route: `/src/server/routes/search.ts`

```ts
export async function GET(req: Request): Promise<Response> {
  const query = new URL(req.url).searchParams.get('q') ?? '';
  // Simple fuzzy search as MVP; replace with vector similarity later
  const results = projects.filter(p =>
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
  );
  return Response.json(results);
}
```

---

## Feature 3: AI Blog Writing Assistant

Workflow: describe post topic → Claude generates draft → save to `/content/blog/`.

```ts
// scripts/write-post.ts
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';

const client = new Anthropic();
const topic = process.argv[2];
const date = new Date().toISOString().split('T')[0];

const message = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 4096,
  messages: [{
    role: 'user',
    content: `Write a technical blog post about: "${topic}".
Format as Markdown with this frontmatter:
---
title: "..."
date: "${date}"
tags: [...]
excerpt: "..."
---

Then the full post content (800–1200 words). Be practical, include code examples if relevant.`
  }]
});

const slug = topic.toLowerCase().replace(/\s+/g, '-');
const path = `content/blog/${date}-${slug}.md`;
fs.writeFileSync(path, message.content[0].type === 'text' ? message.content[0].text : '');
console.log(`Draft saved: ${path}`);
```

Run with: `npx ts-node scripts/write-post.ts "My topic here"`

---

## Models Reference

| Use Case | Model | Why |
|----------|-------|-----|
| Chat with CV | `claude-haiku-4-5-20251001` | Fast, low latency for chat |
| Blog drafts | `claude-sonnet-4-6` | Best writing quality |
| Code demos | `claude-sonnet-4-6` | Strong reasoning |
