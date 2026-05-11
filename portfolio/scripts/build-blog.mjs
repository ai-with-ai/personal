import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { marked } from 'marked';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(__dirname, '..', 'content', 'blog');
const OUT_DIR = path.join(__dirname, '..', 'public', 'blog');

fs.mkdirSync(OUT_DIR, { recursive: true });

const LANGS = ['es', 'en'];
let total = 0;

for (const lang of LANGS) {
  const langDir = path.join(CONTENT_DIR, lang);
  if (!fs.existsSync(langDir)) {
    fs.writeFileSync(path.join(OUT_DIR, `${lang}.json`), '[]');
    continue;
  }

  const files = fs.readdirSync(langDir).filter(f => f.endsWith('.md') && !f.startsWith('draft-'));

  const posts = files.map(file => {
    const raw = fs.readFileSync(path.join(langDir, file), 'utf-8');
    const { data, content } = matter(raw);
    const slug = file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace('.md', '');
    return { slug, ...data, html: marked(content) };
  }).filter(p => p.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  fs.writeFileSync(path.join(OUT_DIR, `${lang}.json`), JSON.stringify(posts, null, 2));
  total += posts.length;
  console.log(`Blog [${lang}]: ${posts.length} post(s) → public/blog/${lang}.json`);
}

console.log(`Blog build complete: ${total} total post(s)`);
