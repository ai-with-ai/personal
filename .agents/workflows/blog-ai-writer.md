---
description: AI-assisted blog post creation — from topic to published post via Claude + git
---

# Blog AI Writer Workflow

Generate, review, and publish blog posts using Claude as your writing assistant.

## Workflow Steps

### Step 1 — Generate Draft

Run the blog generation script with your topic:

```bash
npx ts-node scripts/write-post.ts "How I built a semantic search with Claude embeddings"
```

Claude will generate a complete draft saved to:
```
content/blog/draft-YYYY-MM-DD-your-topic-slug.md
```

### Step 2 — Review & Edit

Open the draft in your editor. The file contains:
- Frontmatter (title, date, tags, excerpt)
- Full post body (~1000 words)
- Code examples if relevant

Edit freely. Claude's output is a starting point, not final copy.

**Checklist before publishing:**
- [ ] Title is compelling and specific
- [ ] Excerpt is under 160 characters (for SEO)
- [ ] Tags are consistent with existing tags in the blog
- [ ] Code examples are tested and correct
- [ ] Cover image added to `/public/images/blog/`
- [ ] Set `published: true` in frontmatter

### Step 3 — Publish

Rename the file (remove `draft-` prefix) and commit:

```bash
# Rename draft to published
mv content/blog/draft-2025-03-01-my-topic.md content/blog/2025-03-01-my-topic.md

# Stage and commit
git add content/blog/2025-03-01-my-topic.md
git add public/images/blog/my-topic.webp  # if you added a cover image
git commit -m "feat(blog): publish post — My Topic Title"
git push origin main
```

### Step 4 — Auto Deploy

GitHub Actions picks up the push → builds blog JSON → deploys to Vercel.
Post is live within ~2 minutes at `yoursite.com/blog/my-topic`.

---

## Improve a Draft with Claude

If you want Claude to refine a specific section:

```bash
# In Claude Code chat, with the draft open:
# "Rewrite the introduction to be more engaging for senior developers"
# "Add a practical code example for the vector similarity section"
# "Shorten this to 600 words, keep the code samples"
```

## Translate a Post

```bash
npx ts-node scripts/write-post.ts --translate content/blog/2025-01-15-my-post.md --lang es
```

*(Requires extending write-post.ts with a translation flag)*

## Batch Topic Generation

```bash
# Generate outlines for 5 posts at once
npx ts-node scripts/generate-topics.ts "Angular performance optimization tips"
```
