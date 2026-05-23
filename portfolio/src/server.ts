import 'dotenv/config';
// Allow corporate proxy certificates in dev (TLS verification disabled for outbound fetch)
if (process.env['NODE_ENV'] !== 'production') {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
}
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { createHmac, timingSafeEqual, createHash } from 'node:crypto';
import Anthropic from '@anthropic-ai/sdk';
import pino from 'pino';
import pretty from 'pino-pretty';
import { Writable } from 'node:stream';

// ── Structured logger ─────────────────────────────────────────────────────────

interface LogEntry { level: number; time: number; module?: string; msg: string; [k: string]: unknown }

const LOG_BUFFER_SIZE = 500;
const logBuffer: LogEntry[] = [];

const bufferSink = new Writable({
  write(chunk: Buffer, _enc: BufferEncoding, cb: () => void) {
    try {
      const line = chunk.toString().trim();
      if (line) {
        const entry = JSON.parse(line) as LogEntry;
        logBuffer.push(entry);
        if (logBuffer.length > LOG_BUFFER_SIZE) logBuffer.shift();
      }
    } catch { /* ignore malformed lines */ }
    cb();
  },
});

const isDev = process.env['NODE_ENV'] !== 'production';
const logLevel = process.env['LOG_LEVEL'] ?? (isDev ? 'debug' : 'info');

const logger = pino(
  { level: logLevel },
  pino.multistream([
    { stream: isDev ? pretty({ colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname', sync: true }) : process.stdout, level: logLevel as pino.Level },
    { stream: bufferSink, level: 'trace' },
  ]),
);

const authLog = logger.child({ module: 'auth' });
const blogLog = logger.child({ module: 'blog' });
const chatLog = logger.child({ module: 'chat' });

// ── Auth helpers ──────────────────────────────────────────────────────────────

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 min
const RATE_LIMIT_MAX    = 5;
const loginAttempts     = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now   = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

function sha256(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

function signToken(payload: object): string {
  const secret  = process.env['JWT_SECRET'] ?? '';
  const header  = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body    = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig     = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

function verifyToken(token: string): boolean {
  try {
    const secret  = process.env['JWT_SECRET'] ?? '';
    const parts   = token.split('.');
    if (parts.length !== 3) return false;
    const expected = createHmac('sha256', secret).update(`${parts[0]}.${parts[1]}`).digest('base64url');
    const sigBuf   = Buffer.from(parts[2], 'base64url');
    const expBuf   = Buffer.from(expected, 'base64url');
    if (sigBuf.length !== expBuf.length) return false;
    if (!timingSafeEqual(sigBuf, expBuf)) return false;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    return payload.exp > Date.now();
  } catch {
    return false;
  }
}

const browserDistFolder = join(import.meta.dirname, '../browser');
const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(express.json());

const CV_CONTEXT = {
  name: 'Carlos Esteban Peña',
  title: 'Senior Software Engineer & Scrum Team Manager',
  email: 'carlosestebanpena@gmail.com',
  linkedin: 'https://www.linkedin.com/in/carlos-esteban-pena',
  personalProject: 'https://www.StatsForBetting.com',
  summary: `Senior Software Engineer with 15+ years of experience building enterprise Java/Spring applications and leading Agile teams. Currently working at My Compliance Office (Dublin) as Senior Software Engineer and Scrum Team Manager, leading a 10+ member team. Expert in J2EE, Spring, Angular, REST services and databases (Oracle, MySQL). Multilingual: Spanish (native), English (fluent), Italian (competent).`,
  experience: [
    {
      role: 'Senior Software Engineer & Scrum Team Manager',
      company: 'My Compliance Office (MCO)',
      location: 'Dublin, Ireland',
      period: 'Sep 2016 – present',
      description: 'MCO provides Conduct Risk software on a single platform integrating Personal Trade Compliance, Third Party Risk Management, and Trade Surveillance.',
      highlights: [
        'Lead and manage a team of 10+ engineers: inspire, mentor, and create a productive environment where team members own the product',
        'Design UML diagrams for new functionality and provide architectural solutions',
        'Coordinate sprints, retrospective meetings, and daily stand-ups as Scrum Master',
        'Coach team members in Agile methodology and best practices',
        'Estimate development time for all tasks and work with PO to handle backlogs',
        'Development using Java 21, Oracle, Spring, Bootstrap 3, Maven 3, Angular 12',
        'Build and maintain REST web services that secure and forward requests to other services',
        'Mentoring new developers and writing documentation and coding guidelines',
        'Testing with JUnit, Mockito, and Selenium',
      ],
    },
    {
      role: 'Personal Project Owner & Full Stack Developer',
      company: 'StatsForBetting.com',
      location: 'Remote',
      period: 'Jan 2015 – present',
      description: 'Stats tool based on the recent history of European football, hosting more than 500,000 events (goals, minutes, cards...). Customizable stats per game.',
      highlights: [
        'Full responsive design and deployment of the web application',
        'Technologies: Spring 4 MVC, Spring Security, jQuery, JSTL, Hibernate, MySQL, JSON, Maven, i18n, GoogleChart, CSS, Bootstrap, Jsoup, AJAX',
      ],
    },
    {
      role: 'Software Engineer — 3 Projects (ALTEN)',
      company: 'ALTEN',
      location: 'Madrid, Spain',
      period: 'Nov 2011 – Dec 2014',
      highlights: [
        'PSA Peugeot (Mar 2013 – Dec 2014): Web applications on Tomcat using J2EE, Oracle, Spring 3, Bootstrap3, Maven, jQuery, AJAX; SOAP & REST web services',
        'Prisacom I+D+I / PRISA (Jun 2012 – Mar 2013): Payment gateway development (PayPal, Worldpay, BBVA TPV); shopping basket, checkout, order history; Tomcat & JBoss deployment',
        'Telefónica I+D+I (Nov 2011 – Jun 2012): Concert ticket booking and live streaming platform; J2EE, EJB, Struts 2, Hibernate, RESTful services; SCRUM',
      ],
    },
    {
      role: 'Software Engineer',
      company: 'CGI (Orange)',
      location: 'Madrid, Spain',
      period: 'Jun 2009 – Nov 2011',
      highlights: [
        'Main project: roaming calling charge system in Java, C, and shell scripts',
        'Backend development with Java and Oracle',
        'Web applications on GlassFish using J2EE, MySQL, Oracle, Unix, Hibernate, EJB 3.0, AJAX',
        'Writing documentation and tutorials for developers and interns',
      ],
    },
  ],
  skills: {
    backend: ['Java 8/J2EE', 'Spring MVC', 'Spring Security', 'Hibernate', 'EJB', 'Maven', 'Struts 2', 'REST & SOAP Web Services'],
    frontend: ['Angular 12', 'jQuery', 'Bootstrap', 'JSTL', 'HTML5', 'CSS3', 'AJAX', 'JSON', 'XML'],
    databases: ['MySQL', 'Oracle'],
    servers: ['Tomcat', 'JBoss', 'GlassFish'],
    tools: ['Git', 'SVN', 'UML', 'JUnit', 'Mockito', 'Selenium'],
    methodologies: ['Scrum', 'Agile', 'TDD'],
    other: ['i18n', 'GoogleChart API', 'Jsoup', 'Shell scripting'],
  },
  languages: [
    { language: 'Spanish', level: 'Native' },
    { language: 'English', level: 'Fluent' },
    { language: 'Italian', level: 'Competent' },
  ],
  education: [
    { degree: "Master's in Computer Science", institution: 'University of Malaga', location: 'Spain', year: '2008–2009' },
    { degree: 'Exchange Year — Computer Science', institution: 'Polytechnic University Leonardo da Vinci', location: 'Milan, Italy', year: '2007–2008' },
    { degree: 'Computer Science Engineering (5-year degree)', institution: 'University of Malaga', location: 'Spain', year: '2001–2007' },
  ],
  books: ['Spring in Action 5', 'The Clean Coder', 'Clean Architecture', 'Effective Java'],
  courses: ['Angular 12', 'Spring Framework 5', 'Java Persistence — Hibernate and JPA', 'Scrum Fundamental'],
  otherInfo: 'Final Degree Project: Mashup web application — a music search engine using external APIs (JSP, Struts, SAX, EJB 3.0, JavaScript, AJAX, RESTful services). Driver licence holder.',
};

// ── Auth endpoints ────────────────────────────────────────────────────────────

app.post('/api/auth/login', (req, res) => {
  const ip = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0].trim() ?? req.socket.remoteAddress ?? 'unknown';

  if (!checkRateLimit(ip)) {
    authLog.warn({ ip }, 'Rate limit exceeded on login');
    res.status(429).json({ error: 'Too many attempts. Try again later.' });
    return;
  }

  const { username, password } = req.body as { username?: string; password?: string };

  const storedUserHash = sha256(process.env['ADMIN_USERNAME'] ?? '');
  const storedPassHash = Buffer.from(process.env['ADMIN_PASSWORD_HASH'] ?? '', 'hex');

  const incomingUserHash = sha256(username ?? '');
  const incomingPassHash = sha256(password ?? '');

  const userMatch = incomingUserHash.length === storedUserHash.length && timingSafeEqual(incomingUserHash, storedUserHash);
  const passMatch = incomingPassHash.length === storedPassHash.length && timingSafeEqual(incomingPassHash, storedPassHash);

  if (!userMatch || !passMatch) {
    authLog.warn({ ip, username }, 'Login failed — invalid credentials');
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = signToken({ sub: username, exp: Date.now() + 8 * 60 * 60 * 1000 });
  authLog.info({ ip, username }, 'Login successful');
  res.json({ token });
});

app.get('/api/auth/verify', (req, res) => {
  const auth  = req.headers['authorization'] ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  res.json({ valid: verifyToken(token) });
});

// ── Blog edit endpoints ───────────────────────────────────────────────────────

function findBlogFile(lang: string, slug: string): string | null {
  const dir = join(process.cwd(), 'content', 'blog', lang);
  if (!existsSync(dir)) return null;
  const file = readdirSync(dir).find(f => {
    const m = f.match(/^\d{4}-\d{2}-\d{2}-(.+)\.md$/);
    return m?.[1] === slug;
  });
  return file ? join(dir, file) : null;
}

function splitFrontMatter(content: string): { frontmatter: string; body: string } {
  const m = content.match(/^(---\n[\s\S]*?\n---\n?)([\s\S]*)$/);
  return m ? { frontmatter: m[1], body: m[2] } : { frontmatter: '', body: content };
}

app.get('/api/blog/raw', (req, res) => {
  const token = (req.headers['authorization'] ?? '').replace('Bearer ', '');
  if (!verifyToken(token)) { blogLog.warn({}, 'Unauthorized raw read attempt'); res.status(401).json({ error: 'Unauthorized' }); return; }

  const { slug, lang } = req.query as { slug?: string; lang?: string };
  if (!slug || !lang) { res.status(400).json({ error: 'Missing slug or lang' }); return; }

  const filePath = findBlogFile(lang, slug);
  if (!filePath) { blogLog.warn({ slug, lang }, 'Raw read — post not found'); res.status(404).json({ error: 'Post not found' }); return; }

  blogLog.debug({ slug, lang }, 'Raw markdown read');
  const { body } = splitFrontMatter(readFileSync(filePath, 'utf-8'));
  res.json({ markdown: body });
});

app.put('/api/blog/save', (req, res) => {
  const token = (req.headers['authorization'] ?? '').replace('Bearer ', '');
  if (!verifyToken(token)) { blogLog.warn({}, 'Unauthorized save attempt'); res.status(401).json({ error: 'Unauthorized' }); return; }

  const { slug, lang, markdown, skipRebuild, title } = req.body as { slug?: string; lang?: string; markdown?: string; skipRebuild?: boolean; title?: string };
  if (!slug || !lang || markdown === undefined) {
    res.status(400).json({ error: 'Missing slug, lang or markdown' }); return;
  }

  const filePath = findBlogFile(lang, slug);
  if (!filePath) { blogLog.warn({ slug, lang }, 'Save — post not found'); res.status(404).json({ error: 'Post not found' }); return; }

  let { frontmatter } = splitFrontMatter(readFileSync(filePath, 'utf-8'));
  if (title !== undefined) {
    const escaped = title.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    frontmatter = frontmatter.replace(/^(title:\s*)["']?.*?["']?\s*$/m, `$1"${escaped}"`);
  }
  writeFileSync(filePath, frontmatter + markdown, 'utf-8');

  if (skipRebuild) {
    blogLog.info({ slug, lang }, 'Blog post saved (rebuild skipped)');
    res.json({ ok: true });
    return;
  }

  try {
    execSync('node scripts/build-blog.mjs', { cwd: process.cwd(), stdio: 'pipe' });
    blogLog.info({ slug, lang }, 'Blog post saved and rebuilt');
  } catch (e) {
    blogLog.error({ err: e, slug, lang }, 'Blog rebuild failed');
    res.status(500).json({ error: 'Saved but rebuild failed' }); return;
  }
  res.json({ ok: true });
});

// ── Blog new post endpoint ────────────────────────────────────────────────────

app.post('/api/blog/new', (req, res) => {
  const token = (req.headers['authorization'] ?? '').replace('Bearer ', '');
  if (!verifyToken(token)) { blogLog.warn({}, 'Unauthorized new-post attempt'); res.status(401).json({ error: 'Unauthorized' }); return; }

  const dateStr = new Date().toISOString().slice(0, 10);
  let slug = 'new-post';
  let n = 1;
  while (findBlogFile('en', slug) || findBlogFile('es', slug)) slug = `new-post-${++n}`;

  const filename = `${dateStr}-${slug}.md`;
  const template = `---\ntitle: "New Post"\ndate: "${dateStr}"\ntags: []\nexcerpt: ""\ncoverImage: ""\npublished: false\nreadingTime: 1\n---\n# New Post\n\nStart writing here.\n`;

  for (const lang of ['en', 'es']) {
    writeFileSync(join(process.cwd(), 'content', 'blog', lang, filename), template, 'utf-8');
  }

  try {
    execSync('node scripts/build-blog.mjs', { cwd: process.cwd(), stdio: 'pipe' });
    blogLog.info({ slug, filename }, 'New blog post created');
  } catch (e) {
    blogLog.error({ err: e }, 'Blog rebuild failed after new post');
    res.status(500).json({ error: 'Post created but rebuild failed' }); return;
  }

  res.json({ slug });
});

// ── Blog translate endpoint ───────────────────────────────────────────────────

app.post('/api/blog/translate', async (req, res) => {
  const token = (req.headers['authorization'] ?? '').replace('Bearer ', '');
  if (!verifyToken(token)) { blogLog.warn({}, 'Unauthorized translate attempt'); res.status(401).json({ error: 'Unauthorized' }); return; }

  const { markdown, fromLang, toLang } = req.body as { markdown?: string; fromLang?: string; toLang?: string };
  if (!markdown || !fromLang || !toLang) {
    res.status(400).json({ error: 'Missing markdown, fromLang or toLang' }); return;
  }

  const apiKey = process.env['ANTHROPIC_API_KEY'];
  if (!apiKey) { res.status(500).json({ error: 'API key not configured' }); return; }

  const langNames: Record<string, string> = { en: 'English', es: 'Spanish' };
  const client = new Anthropic({ apiKey });
  const t0 = Date.now();

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8096,
      system: `You are a professional technical translator. Translate the provided Markdown blog post from ${langNames[fromLang] ?? fromLang} to ${langNames[toLang] ?? toLang}.
Rules:
- Preserve ALL Markdown formatting exactly (headings, bold, italic, code blocks, links, tables, lists, blockquotes, hr).
- NEVER translate text inside fenced code blocks (\`\`\`...\`\`\`) or inline code (\`...\`).
- NEVER translate frontmatter keys; only translate frontmatter values that are human-readable text (title, description, etc.).
- Return ONLY the translated Markdown — no explanations, no preamble, no trailing notes.`,
      messages: [{ role: 'user', content: markdown }],
    });

    const translated = response.content[0].type === 'text' ? response.content[0].text : '';
    blogLog.info({ fromLang, toLang, durationMs: Date.now() - t0 }, 'Blog translation completed');
    res.json({ markdown: translated });
  } catch (err) {
    blogLog.error({ err, durationMs: Date.now() - t0 }, 'Translation API error');
    res.status(500).json({ error: 'Translation failed' });
  }
});

// ── Blog translate-diff endpoint (translate only changed paragraphs) ──────────

app.post('/api/blog/translate-diff', async (req, res) => {
  const token = (req.headers['authorization'] ?? '').replace('Bearer ', '');
  if (!verifyToken(token)) { blogLog.warn({}, 'Unauthorized translate-diff attempt'); res.status(401).json({ error: 'Unauthorized' }); return; }

  const { slug, fromLang, toLang, currentMarkdown, originalMarkdown: origMd } =
    req.body as { slug?: string; fromLang?: string; toLang?: string; currentMarkdown?: string; originalMarkdown?: string };

  if (!slug || !fromLang || !toLang || !currentMarkdown || !origMd) {
    res.status(400).json({ error: 'Missing required fields' }); return;
  }

  const apiKey = process.env['ANTHROPIC_API_KEY'];
  if (!apiKey) { res.status(500).json({ error: 'API key not configured' }); return; }

  const otherFilePath = findBlogFile(toLang, slug);
  if (!otherFilePath) { res.status(404).json({ error: `${toLang} version not found` }); return; }
  const { body: otherBody } = splitFrontMatter(readFileSync(otherFilePath, 'utf-8'));

  // Identify blocks that changed between the original load and the current save
  const origBlocks = origMd.split(/\n\n+/);
  const currBlocks = currentMarkdown.split(/\n\n+/);
  const changedBlocks: string[] = [];
  const maxLen = Math.max(origBlocks.length, currBlocks.length);
  for (let i = 0; i < maxLen; i++) {
    const orig = (origBlocks[i] ?? '').trim();
    const curr = (currBlocks[i] ?? '').trim();
    if (orig !== curr && curr) changedBlocks.push(curr);
  }

  if (changedBlocks.length === 0) {
    blogLog.info({ slug, fromLang, toLang }, 'translate-diff: no changes detected');
    res.json({ markdown: otherBody });
    return;
  }

  const langNames: Record<string, string> = { en: 'English', es: 'Spanish' };
  const client = new Anthropic({ apiKey });
  const t0 = Date.now();

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8096,
      system: `You are a professional technical translator. You will receive sections of a blog post that were modified in ${langNames[fromLang] ?? fromLang}. Your job is to apply the equivalent changes to the ${langNames[toLang] ?? toLang} version, translating only the modified sections and leaving everything else untouched.
Rules:
- Preserve ALL Markdown formatting exactly (headings, bold, italic, code blocks, links, tables, lists).
- NEVER translate text inside fenced code blocks (\`\`\`...\`\`\`) or inline code (\`...\`).
- Return ONLY the updated ${langNames[toLang] ?? toLang} Markdown — no explanations, no preamble.`,
      messages: [{
        role: 'user',
        content: `These sections were modified in the ${langNames[fromLang] ?? fromLang} version:\n\n${changedBlocks.join('\n\n---\n\n')}\n\n===\n\nApply the equivalent changes to this ${langNames[toLang] ?? toLang} version (translate the modified sections, keep the rest):\n\n${otherBody}`,
      }],
    });

    const merged = response.content[0].type === 'text' ? response.content[0].text.trim() : otherBody;
    blogLog.info({ slug, fromLang, toLang, changedCount: changedBlocks.length, durationMs: Date.now() - t0 }, 'translate-diff completed');
    res.json({ markdown: merged });
  } catch (err) {
    blogLog.error({ err, durationMs: Date.now() - t0 }, 'translate-diff API error');
    res.status(500).json({ error: 'Translation failed' });
  }
});

// ── Chat endpoint ─────────────────────────────────────────────────────────────

app.post('/api/chat', async (req, res) => {
  const { message, history = [] } = req.body as {
    message: string;
    history?: { role: 'user' | 'assistant'; content: string }[];
  };

  if (!message?.trim()) {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  const apiKey = process.env['ANTHROPIC_API_KEY'];
  if (!apiKey) {
    res.status(500).json({ error: 'API key not configured' });
    return;
  }

  const client = new Anthropic({ apiKey });
  const cvText = JSON.stringify(CV_CONTEXT, null, 2);

  const systemPrompt = `Eres el asistente de IA del portfolio de Carlos Esteban Peña, un Senior Software Engineer con más de 15 años de experiencia.
Tu función es responder preguntas sobre su experiencia profesional, habilidades, proyectos y formación, basándote EXCLUSIVAMENTE en estos datos de su CV:

${cvText}

Reglas importantes:
- Responde siempre en el mismo idioma que use el visitante (español o inglés)
- Sé conciso y directo, máximo 3-4 frases por respuesta
- Si te preguntan algo que no está en el CV, di honestamente que no tienes esa información y sugiere contactar a Carlos en LinkedIn: https://www.linkedin.com/in/carlos-esteban-pena
- Habla en tercera persona sobre Carlos ("Carlos tiene experiencia en...", "Ha trabajado en...")
- Muéstrate entusiasta y profesional
- Puedes mencionar su proyecto personal StatsForBetting.com cuando sea relevante`;

  const messages: Anthropic.MessageParam[] = [
    ...history.slice(-10).map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: message },
  ];

  const t0 = Date.now();
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: systemPrompt,
      messages,
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    chatLog.info({ messageLength: message.length, historyLength: history.length, durationMs: Date.now() - t0 }, 'Chat response sent');
    res.json({ response: text });
  } catch (err) {
    chatLog.error({ err, durationMs: Date.now() - t0 }, 'Claude API error');
    res.status(500).json({ error: 'Error calling Claude API' });
  }
});

// ── Log endpoints (auth-gated) ────────────────────────────────────────────────

app.get('/api/logs', (req, res) => {
  const token = (req.headers['authorization'] ?? '').replace('Bearer ', '');
  if (!verifyToken(token)) { res.status(401).json({ error: 'Unauthorized' }); return; }
  const limit = Math.min(parseInt((req.query['limit'] as string) ?? '300', 10), LOG_BUFFER_SIZE);
  res.json({ logs: logBuffer.slice(-limit) });
});

app.delete('/api/logs', (req, res) => {
  const token = (req.headers['authorization'] ?? '').replace('Bearer ', '');
  if (!verifyToken(token)) { res.status(401).json({ error: 'Unauthorized' }); return; }
  logBuffer.length = 0;
  logger.info({}, 'Log buffer cleared by admin');
  res.json({ ok: true });
});

// ── Static + Angular SSR ──────────────────────────────────────────────────────

app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) throw error;
    logger.info({ port, env: process.env['NODE_ENV'] ?? 'development' }, `Server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
