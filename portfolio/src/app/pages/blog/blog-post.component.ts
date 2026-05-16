import { Component, inject, signal, OnInit, OnDestroy, computed, ViewChild, ElementRef } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslatePipe } from '@ngx-translate/core';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import { BlogService } from '../../services/blog.service';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  styles: [`
    .reading-progress {
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, #6366f1, #818cf8, #f59e0b);
      transform-origin: left;
      transform: scaleX(0);
      z-index: 100;
      animation: reading-progress linear;
      animation-timeline: scroll(root block);
    }
    @keyframes reading-progress {
      from { transform: scaleX(0); }
      to   { transform: scaleX(1); }
    }

    /* toolbar button active state — TipTap editor styles live in global styles.css */
    .tb-btn { display:inline-flex; align-items:center; justify-content:center;
              width:1.875rem; height:1.875rem; border-radius:.375rem; font-size:.8rem; font-weight:600;
              color:#94a3b8; transition:background .15s, color .15s; cursor:pointer; border:none; background:transparent; }
    .tb-btn:hover { background:rgba(255,255,255,.07); color:#f1f5f9; }
    .tb-btn.is-active { background:rgba(99,102,241,.18); color:#818cf8; }
    .tb-sep { width:1px; height:1.125rem; background:rgba(255,255,255,.1); margin:0 .25rem; }
  `],
  template: `
    <!-- Reading progress -->
    <div id="readingProgress" class="reading-progress" aria-hidden="true"></div>

    <article id="blogPost" class="min-h-screen pt-20 pb-24 px-6">
      <div id="blogPostContainer" class="max-w-3xl mx-auto">

        <!-- Back -->
        <a routerLink="/blog"
           class="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm mb-14 group font-mono">
          <span class="group-hover:-translate-x-1 transition-transform">←</span>
          {{ 'BLOG.BACK' | translate }}
        </a>

        @if (post()) {

          <!-- Header -->
          <header id="postHeader" class="mb-14">
            <div id="postTags" class="flex flex-wrap gap-2 mb-6">
              @for (tag of post()!.tags; track tag) {
                <span class="text-xs font-mono text-accent bg-accent/10 border border-accent/10 px-2.5 py-1 rounded-full">
                  {{ tag }}
                </span>
              }
            </div>

            <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6"
                style="background: linear-gradient(135deg, #f1f5f9 40%, #818cf8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
              {{ post()!.title }}
            </h1>

            <div id="postMeta" class="flex flex-wrap items-center gap-4 text-sm font-mono text-slate-500">
              <time>{{ post()!.date }}</time>
              <span class="text-slate-700">·</span>
              <span class="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                {{ post()!.readingTime }} {{ 'BLOG.MIN_READ_POST' | translate }}
              </span>
            </div>

            <!-- Gradient divider -->
            <div id="postDivider" class="mt-8 h-px bg-gradient-to-r from-primary/40 via-primary/10 to-transparent"></div>
          </header>

          <!-- Edit button (authenticated only) -->
          @if (auth.isAuthenticated() && !editMode()) {
            <div id="editButtonWrap" class="flex justify-end mb-6 -mt-6">
              <button (click)="enterEditMode()"
                      class="inline-flex items-center gap-2 px-3 py-1.5 rounded-btn text-xs font-mono
                             border border-white/15 text-slate-400 hover:text-white hover:border-primary/40
                             transition-all duration-200">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path opacity="0.5" d="M3 21H21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  <path d="M15.5 4.5L19.5 8.5M5 15L15.5 4.5L19.5 8.5L9 19H5V15Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Edit
              </button>
            </div>
          }

          <!-- TipTap editor (edit mode) -->
          @if (editMode()) {

            <!-- Toolbar: sibling of editor (not inside it) so sticky is never blocked by a parent -->
            <div id="editorToolbar" class="sticky top-16 z-20 flex flex-wrap items-center gap-0.5 px-3 py-2
                         border border-b-0 border-white/10 rounded-t-[1rem] bg-[#0f172a]">

              <!-- Text style -->
              <button class="tb-btn" [class.is-active]="isActive('bold')"
                      (click)="run('toggleBold')" title="Bold (Ctrl+B)" aria-label="Bold">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 4h8a4 4 0 0 1 0 8H6z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 12h9a4 4 0 0 1 0 8H6z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
              <button class="tb-btn" [class.is-active]="isActive('italic')"
                      (click)="run('toggleItalic')" title="Italic (Ctrl+I)" aria-label="Italic">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><line x1="19" y1="4" x2="10" y2="4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="14" y1="20" x2="5" y2="20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="15" y1="4" x2="9" y2="20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
              </button>
              <button class="tb-btn" [class.is-active]="isActive('strike')"
                      (click)="run('toggleStrike')" title="Strikethrough" aria-label="Strikethrough"
                      style="text-decoration:line-through">S</button>
              <button class="tb-btn" [class.is-active]="isActive('code')"
                      (click)="run('toggleCode')" title="Inline code" aria-label="Code"
                      style="font-family:monospace">&lt;/&gt;</button>

              <div class="tb-sep"></div>

              <!-- Headings -->
              <button class="tb-btn" [class.is-active]="isActive('heading', {level:1})"
                      (click)="runHeading(1)" title="Heading 1" aria-label="H1">H1</button>
              <button class="tb-btn" [class.is-active]="isActive('heading', {level:2})"
                      (click)="runHeading(2)" title="Heading 2" aria-label="H2">H2</button>
              <button class="tb-btn" [class.is-active]="isActive('heading', {level:3})"
                      (click)="runHeading(3)" title="Heading 3" aria-label="H3">H3</button>
              <button class="tb-btn" [class.is-active]="isActive('paragraph')"
                      (click)="run('setParagraph')" title="Paragraph" aria-label="Paragraph">¶</button>

              <div class="tb-sep"></div>

              <!-- Lists -->
              <button class="tb-btn" [class.is-active]="isActive('bulletList')"
                      (click)="run('toggleBulletList')" title="Bullet list" aria-label="Bullet list">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><line x1="9" y1="6" x2="20" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="9" y1="12" x2="20" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="9" y1="18" x2="20" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/></svg>
              </button>
              <button class="tb-btn" [class.is-active]="isActive('orderedList')"
                      (click)="run('toggleOrderedList')" title="Ordered list" aria-label="Ordered list">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><line x1="10" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="10" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="10" y1="18" x2="21" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><text x="2" y="8" font-size="7" fill="currentColor" font-family="sans-serif">1.</text><text x="2" y="14" font-size="7" fill="currentColor" font-family="sans-serif">2.</text><text x="2" y="20" font-size="7" fill="currentColor" font-family="sans-serif">3.</text></svg>
              </button>
              <button class="tb-btn" [class.is-active]="isActive('blockquote')"
                      (click)="run('toggleBlockquote')" title="Blockquote" aria-label="Blockquote">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
              <button class="tb-btn" [class.is-active]="isActive('codeBlock')"
                      (click)="run('toggleCodeBlock')" title="Code block" aria-label="Code block">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><polyline points="16 18 22 12 16 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="8 6 2 12 8 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>

              <div class="tb-sep"></div>

              <!-- Undo / Redo -->
              <button class="tb-btn" (click)="run('undo')" title="Undo (Ctrl+Z)" aria-label="Undo">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 7v6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
              <button class="tb-btn" (click)="run('redo')" title="Redo (Ctrl+Y)" aria-label="Redo">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 7v6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>

              <div class="tb-sep"></div>

              <!-- Alignment -->
              <button class="tb-btn" [class.is-active]="isActive('textAlign', {textAlign:'left'})"
                      (click)="runAlign('left')" title="Align left" aria-label="Align left">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>
              </button>
              <button class="tb-btn" [class.is-active]="isActive('textAlign', {textAlign:'center'})"
                      (click)="runAlign('center')" title="Align center" aria-label="Align center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
              </button>
              <button class="tb-btn" [class.is-active]="isActive('textAlign', {textAlign:'right'})"
                      (click)="runAlign('right')" title="Align right" aria-label="Align right">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>
              </button>
              <button class="tb-btn" [class.is-active]="isActive('textAlign', {textAlign:'justify'})"
                      (click)="runAlign('justify')" title="Justify" aria-label="Justify">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>

              <div class="tb-sep"></div>

              <!-- Table insert -->
              <button class="tb-btn" [class.is-active]="isActive('table')"
                      (click)="insertTable()" title="Insert table" aria-label="Insert table">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>
                </svg>
              </button>

              <!-- Table context controls -->
              @if (isActive('table')) {
                <button class="tb-btn" (click)="runTable('addRowAfter')" title="Add row below" aria-label="Add row below">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="9" rx="1"/><line x1="12" y1="16" x2="12" y2="22"/><line x1="9" y1="19" x2="15" y2="19"/></svg>
                </button>
                <button class="tb-btn" (click)="runTable('deleteRow')" title="Delete row" aria-label="Delete row">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="9" rx="1"/><line x1="9" y1="19" x2="15" y2="19"/></svg>
                </button>
                <button class="tb-btn" (click)="runTable('addColumnAfter')" title="Add column right" aria-label="Add column right">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="9" height="18" rx="1"/><line x1="16" y1="12" x2="22" y2="12"/><line x1="19" y1="9" x2="19" y2="15"/></svg>
                </button>
                <button class="tb-btn" (click)="runTable('deleteColumn')" title="Delete column" aria-label="Delete column">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="9" height="18" rx="1"/><line x1="15" y1="12" x2="21" y2="12"/></svg>
                </button>
                <button class="tb-btn" (click)="runTable('deleteTable')" title="Delete table" aria-label="Delete table" style="color:#f87171">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>
                </button>
              }

              <!-- Save / Cancel pushed to the right -->
              <div id="toolbarSpacer" class="flex-1"></div>
              @if (saveError()) {
                <span class="text-xs text-red-400 mr-2">{{ saveError() }}</span>
              }
              <button (click)="cancelEdit()"
                      class="px-3 py-1 rounded-btn text-xs font-mono border border-white/15
                             text-slate-400 hover:text-white transition-colors mr-1">
                Cancel
              </button>
              <button (click)="saveEdit()" [disabled]="saving()"
                      class="inline-flex items-center gap-1.5 px-3 py-1 rounded-btn text-xs font-mono
                             bg-primary hover:bg-primary-dark text-white transition-colors disabled:opacity-50">
                @if (saving()) {
                  <svg class="animate-spin" width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="32" stroke-dashoffset="12"/>
                  </svg>
                  {{ translating() ? 'Translating…' : 'Saving…' }}
                } @else {
                  Save
                }
              </button>
            </div>

            <!-- Editor mount (no toolbar inside — toolbar above is the sticky one) -->
            <div id="editorWrap" class="mb-6 border border-white/10 rounded-b-[1rem] bg-surface-alt tiptap-wrap">
              <div id="editorMount" #editorRef></div>
            </div>
          }

          <!-- Rendered content -->
          @if (!editMode()) {
            <div id="postContent" class="prose" [innerHTML]="post()!.html"></div>
          }

          <!-- Author card -->
          <div id="authorSection" class="mt-20 pt-10 border-t border-white/8">
            <div id="authorCard" class="flex items-center gap-4 p-6 rounded-2xl bg-surface-alt border border-white/8">
              <div id="authorAvatar" class="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm shrink-0">
                CE
              </div>
              <div id="authorInfo" class="flex-1 min-w-0">
                <p class="font-semibold text-white text-sm">Carlos Esteban</p>
                <p class="text-slate-500 text-xs mt-0.5">{{ 'BLOG.AUTHOR_ROLE' | translate }}</p>
              </div>
              <a routerLink="/blog"
                 class="hidden sm:inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors font-mono group">
                {{ 'BLOG.BACK' | translate }}
                <span class="group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </div>
          </div>

        } @else {
          <div id="postNotFound" class="text-center py-32 border border-dashed border-white/10 rounded-card">
            <p class="text-slate-400">{{ 'BLOG.NOT_FOUND' | translate }}</p>
          </div>
        }
      </div>
    </article>

    <!-- Lang confirm modal -->
    @if (showLangConfirm()) {
      <div id="langConfirmOverlay" class="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm"
           role="dialog" aria-modal="true" aria-labelledby="langConfirmTitle">
        <div id="langConfirmDialog" class="bg-[#0f172a] border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
          <h3 id="langConfirmTitle" class="text-white font-semibold text-base mb-2">
            Also update {{ otherLangLabel() }}?
          </h3>
          <p class="text-slate-400 text-sm mb-5 leading-relaxed">
            Choose how to handle the <strong class="text-slate-300">{{ otherLangLabel() }}</strong> version.
          </p>
          <div id="langConfirmActions" class="flex flex-col gap-2">
            <!-- Full translate -->
            <button (click)="confirmSave(true)" [disabled]="translating()"
                    class="w-full px-4 py-2.5 rounded-btn text-xs font-mono text-left
                           bg-primary hover:bg-primary-dark text-white transition-colors disabled:opacity-50">
              <span class="font-semibold">Translate all &amp; save both</span>
              <span class="block text-white/60 text-[0.7rem] mt-0.5">Re-translate the full {{ otherLangLabel() }} version from scratch</span>
            </button>
            <!-- Diff translate -->
            <button (click)="confirmSaveDiff()" [disabled]="translating()"
                    class="w-full px-4 py-2.5 rounded-btn text-xs font-mono text-left
                           border border-primary/40 text-primary-light hover:bg-primary/10 transition-colors disabled:opacity-50">
              <span class="font-semibold">Translate changed paragraphs &amp; save both</span>
              <span class="block text-slate-500 text-[0.7rem] mt-0.5">Only modified sections are translated; the rest of {{ otherLangLabel() }} stays unchanged</span>
            </button>
            <!-- Save current only / cancel -->
            <div class="flex gap-2 mt-1">
              <button (click)="confirmSave(false)" [disabled]="translating()"
                      class="flex-1 px-4 py-2 rounded-btn text-xs font-mono border border-white/15
                             text-slate-400 hover:text-white transition-colors disabled:opacity-50">
                Only {{ currentLangLabel() }}
              </button>
              <button (click)="cancelLangConfirm()" [disabled]="translating()"
                      class="flex-1 px-4 py-2 rounded-btn text-xs font-mono border border-white/10
                             text-slate-500 hover:text-white transition-colors disabled:opacity-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class BlogPostComponent implements OnInit, OnDestroy {
  private blog  = inject(BlogService);
  private route = inject(ActivatedRoute);
  private http  = inject(HttpClient);
  auth          = inject(AuthService);
  private lang  = inject(LanguageService);

  @ViewChild('editorRef') editorRef!: ElementRef<HTMLDivElement>;

  private editor: Editor | null = null;

  private slug = signal<string>('');
  post = computed(() => this.blog.getBySlug(this.slug()));

  editMode           = signal(false);
  saving             = signal(false);
  saveError          = signal('');
  showLangConfirm    = signal(false);
  translating        = signal(false);
  private originalMarkdown = signal<string>('');

  otherLangLabel   = computed(() => this.lang.current() === 'en' ? 'Spanish' : 'English');
  currentLangLabel = computed(() => this.lang.current() === 'en' ? 'English' : 'Spanish');

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.slug.set(params.get('slug') ?? '');
    });
  }

  ngOnDestroy() {
    this.editor?.destroy();
  }

  // ── Toolbar helpers ──────────────────────────────────────────────────────────

  isActive(name: string, attrs?: object): boolean {
    return this.editor?.isActive(name, attrs) ?? false;
  }

  run(command: string) {
    if (!this.editor) return;
    (this.editor.chain().focus() as any)[command]().run();
  }

  runAlign(alignment: 'left' | 'center' | 'right' | 'justify') {
    this.editor?.chain().focus().setTextAlign(alignment).run();
  }

  runHeading(level: 1 | 2 | 3) {
    this.editor?.chain().focus().toggleHeading({ level }).run();
  }

  insertTable() {
    this.editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }

  runTable(command: 'addRowAfter' | 'deleteRow' | 'addColumnAfter' | 'deleteColumn' | 'deleteTable') {
    if (!this.editor) return;
    (this.editor.chain().focus() as any)[command]().run();
  }

  // ── Edit lifecycle ───────────────────────────────────────────────────────────

  enterEditMode() {
    this.saveError.set('');
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
    this.http.get<{ markdown: string }>(
      `/api/blog/raw?slug=${this.slug()}&lang=${this.lang.current()}`,
      { headers }
    ).subscribe({
      next: res => {
        this.originalMarkdown.set(res.markdown);
        this.editMode.set(true);
        setTimeout(() => this.mountEditor(res.markdown), 0);
      },
      error: () => this.saveError.set('Could not load source'),
    });
  }

  private mountEditor(markdown: string) {
    this.editor?.destroy();
    this.editor = new Editor({
      element: this.editorRef.nativeElement,
      extensions: [
        StarterKit,
        Markdown.configure({ html: false, tightLists: true }),
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Table.configure({ resizable: false }),
        TableRow,
        TableHeader,
        TableCell,
      ],
      content: markdown,
      editorProps: {
        attributes: { 'data-placeholder': 'Start writing…' },
      },
    });
  }

  // tiptap-markdown drops empty paragraphs on serialization.
  // Temporarily fill them with   so marked emits a real <p> (visible blank line).
  private fillEmptyParagraphs(node: any): any {
    if (node.type === 'paragraph' && (!node.content || node.content.length === 0)) {
      return { ...node, content: [{ type: 'text', text: ' ' }] };
    }
    if (node.content) {
      return { ...node, content: node.content.map((n: any) => this.fillEmptyParagraphs(n)) };
    }
    return node;
  }

  saveEdit() {
    if (!this.editor) return;
    this.saveError.set('');
    this.showLangConfirm.set(true);
  }

  confirmSave(alsoOther: boolean) {
    this.showLangConfirm.set(false);
    if (!this.editor) return;
    this.saving.set(true);

    const originalDoc = this.editor.getJSON();
    this.editor.commands.setContent(this.fillEmptyParagraphs(originalDoc), { emitUpdate: false });
    const markdown = (this.editor.storage as any)['markdown'].getMarkdown();
    this.editor.commands.setContent(originalDoc, { emitUpdate: false });

    const headers     = new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
    const currentLang = this.lang.current();
    const otherLang   = currentLang === 'en' ? 'es' : 'en';

    const doSave = (lang: string, md: string, skipRebuild = false) => this.http.put<{ ok: boolean }>(
      '/api/blog/save',
      { slug: this.slug(), lang, markdown: md, skipRebuild },
      { headers }
    );

    const finish = () => {
      this.saving.set(false);
      this.translating.set(false);
      this.editor?.destroy();
      this.editor = null;
      this.editMode.set(false);
      this.blog.reload();
    };

    const onError = (err: any) => {
      this.saving.set(false);
      this.translating.set(false);
      const msg = err?.error?.error ?? err?.message ?? 'Save failed';
      this.saveError.set(msg);
    };

    if (alsoOther) {
      doSave(currentLang, markdown, true).pipe(
        switchMap(() => {
          this.translating.set(true);
          return this.http.post<{ markdown: string }>(
            '/api/blog/translate',
            { markdown, fromLang: currentLang, toLang: otherLang },
            { headers }
          );
        }),
        switchMap(res => {
          this.translating.set(false);
          return doSave(otherLang, res.markdown);
        })
      ).subscribe({ next: finish, error: onError });
    } else {
      doSave(currentLang, markdown).subscribe({ next: finish, error: onError });
    }
  }

  confirmSaveDiff() {
    this.showLangConfirm.set(false);
    if (!this.editor) return;
    this.saving.set(true);

    const originalDoc = this.editor.getJSON();
    this.editor.commands.setContent(this.fillEmptyParagraphs(originalDoc), { emitUpdate: false });
    const markdown = (this.editor.storage as any)['markdown'].getMarkdown();
    this.editor.commands.setContent(originalDoc, { emitUpdate: false });

    const headers     = new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
    const currentLang = this.lang.current();
    const otherLang   = currentLang === 'en' ? 'es' : 'en';

    const doSave = (lang: string, md: string, skipRebuild = false) => this.http.put<{ ok: boolean }>(
      '/api/blog/save',
      { slug: this.slug(), lang, markdown: md, skipRebuild },
      { headers }
    );

    const finish = () => {
      this.saving.set(false);
      this.translating.set(false);
      this.editor?.destroy();
      this.editor = null;
      this.editMode.set(false);
      this.blog.reload();
    };

    const onError = (err: any) => {
      this.saving.set(false);
      this.translating.set(false);
      this.saveError.set(err?.error?.error ?? err?.message ?? 'Save failed');
    };

    doSave(currentLang, markdown, true).pipe(
      switchMap(() => {
        this.translating.set(true);
        return this.http.post<{ markdown: string }>(
          '/api/blog/translate-diff',
          { slug: this.slug(), fromLang: currentLang, toLang: otherLang, currentMarkdown: markdown, originalMarkdown: this.originalMarkdown() },
          { headers }
        );
      }),
      switchMap(res => {
        this.translating.set(false);
        return doSave(otherLang, res.markdown);
      })
    ).subscribe({ next: finish, error: onError });
  }

  cancelLangConfirm() {
    this.showLangConfirm.set(false);
  }

  cancelEdit() {
    this.editor?.destroy();
    this.editor = null;
    this.editMode.set(false);
    this.saveError.set('');
  }
}
