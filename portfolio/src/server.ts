import 'dotenv/config';
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { createHmac, timingSafeEqual, createHash } from 'node:crypto';
import Anthropic from '@anthropic-ai/sdk';

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
        'Development using Java 8, Oracle, Spring, Bootstrap 3, Maven 3, Angular 12',
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
  books: ['Spring in Action 5', 'The Clean Coder', 'Clean Architecture', 'Effective Java (Java 9)'],
  courses: ['Angular 12', 'Spring Framework 5', 'Java Persistence — Hibernate and JPA', 'Scrum Fundamental'],
  otherInfo: 'Final Degree Project: Mashup web application — a music search engine using external APIs (JSP, Struts, SAX, EJB 3.0, JavaScript, AJAX, RESTful services). Driver licence holder.',
};

// ── Auth endpoints ────────────────────────────────────────────────────────────

app.post('/api/auth/login', (req, res) => {
  const ip = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0].trim() ?? req.socket.remoteAddress ?? 'unknown';

  if (!checkRateLimit(ip)) {
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
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = signToken({ sub: username, exp: Date.now() + 8 * 60 * 60 * 1000 });
  res.json({ token });
});

app.get('/api/auth/verify', (req, res) => {
  const auth  = req.headers['authorization'] ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  res.json({ valid: verifyToken(token) });
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

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: systemPrompt,
      messages,
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    res.json({ response: text });
  } catch (err) {
    console.error('Claude API error:', err);
    res.status(500).json({ error: 'Error calling Claude API' });
  }
});

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
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
