import { Component, inject, signal, OnInit, OnDestroy, computed, ViewChild, ElementRef, effect } from '@angular/core';
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
  styleUrl: './blog-post.component.scss',
  templateUrl: './blog-post.component.html',
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
  editTitle          = signal('');
  private pendingAutoEdit = signal(false);
  saving             = signal(false);
  saveError          = signal('');
  showLangConfirm    = signal(false);
  translating        = signal(false);
  private originalMarkdown = signal<string>('');

  otherLangLabel   = computed(() => this.lang.current() === 'en' ? 'Spanish' : 'English');
  currentLangLabel = computed(() => this.lang.current() === 'en' ? 'English' : 'Spanish');

  constructor() {
    effect(() => {
      if (this.pendingAutoEdit() && this.post() && !this.editMode() && this.auth.isAuthenticated()) {
        this.pendingAutoEdit.set(false);
        this.enterEditMode();
      }
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.slug.set(params.get('slug') ?? '');
    });
    this.route.queryParamMap.subscribe(qp => {
      if (qp.get('edit') === '1') this.pendingAutoEdit.set(true);
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
        const titleMatch = res.markdown.match(/^title:\s*["']?(.*?)["']?\s*$/m);
        this.editTitle.set(titleMatch ? titleMatch[1] : (this.post()?.title ?? ''));
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
  // Temporarily fill them with   so marked emits a real <p> (visible blank line).
  private fillEmptyParagraphs(node: any): any {
    if (node.type === 'paragraph' && (!node.content || node.content.length === 0)) {
      return { ...node, content: [{ type: 'text', text: ' ' }] };
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
    const title       = this.editTitle();

    const doSave = (lang: string, md: string, skipRebuild = false, t?: string) => this.http.put<{ ok: boolean }>(
      '/api/blog/save',
      { slug: this.slug(), lang, markdown: md, skipRebuild, ...(t !== undefined ? { title: t } : {}) },
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
      doSave(currentLang, markdown, true, title).pipe(
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
      doSave(currentLang, markdown, false, title).subscribe({ next: finish, error: onError });
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
    const title       = this.editTitle();

    const doSave = (lang: string, md: string, skipRebuild = false, t?: string) => this.http.put<{ ok: boolean }>(
      '/api/blog/save',
      { slug: this.slug(), lang, markdown: md, skipRebuild, ...(t !== undefined ? { title: t } : {}) },
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

    doSave(currentLang, markdown, true, title).pipe(
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
