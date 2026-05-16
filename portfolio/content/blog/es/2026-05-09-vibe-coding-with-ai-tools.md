---
title: "Vibe Coding: el arte de programar con agentes de IA"
date: "2026-05-09"
tags: ["Claude Code", "AI Agents", "Vibe Coding", "MCP", "Developer Tools"]
excerpt: "Cómo Claude Code, Gemini CLI, Cursor y OpenCode están redefiniendo el desarrollo de software a través de agentes, skills, workflows y contexto estructurado."
coverImage: "/images/blog/vibe-coding.webp"
published: true
readingTime: 9
---
# Vibe Coding: programación con agentes de IA

esto es increíble

pero muy increíble

*Vibe coding* no se trata de escribir código a ciegas y esperar lo mejor. Se trata de colaborar con una IA que entiende tu base de código, sigue tus reglas, ejecuta herramientas reales y aprende el contexto de tu proyecto. Herramientas como **Claude Code**, **Gemini CLI**, **Cursor** y **OpenCode** están convirtiendo esa visión en realidad hoy.

Este artículo explora las primitivas que hacen posible esa colaboración: agentes, habilidades, flujos de trabajo, reglas, sub-agentes, worktrees, MCP y los tres ámbitos de configuración.

---

# **¿Qué es vibe coding?**

El término, popularizado en 2025, describe un estilo de desarrollo donde el programador declara la intención — *"añade autenticación JWT a esta API"*, *"refactoriza este servicio siguiendo DDD"* — y el agente de IA toma decisiones, lee archivos, ejecuta comandos y produce código funcional.

No es autocompletado avanzado. Es delegación con contexto.

---

 

## Las herramientas principales

### Claude Code

CLI de Anthropic para terminal y VS Code. Opera con acceso real al sistema de archivos, git y herramientas externas vía MCP. Sus fortalezas son la arquitectura de configuración por capas (global → proyecto → local) y el sistema de agentes especializados.

```bash
# Install
npm install -g @anthropic-ai/claude-code

# Use in a project
cd my-project
claude
```

### Gemini CLI

La apuesta de Google, dirigida a proyectos grandes gracias a su ventana de contexto de 1M tokens. Integra Google Search como herramienta nativa, lo que la hace poderosa para tareas que requieren investigación externa.

### Cursor

Un IDE completo basado en VS Code con IA profundamente integrada. Destaca por su modo *Agent* con autorun, vista de diferencias en tiempo real y su capacidad de coordinar ediciones en múltiples archivos.

### OpenCode

Una alternativa de terminal de código abierto. Compatible con cualquier proveedor (OpenAI, Anthropic, Ollama) y dirigida a usuarios que priorizan privacidad y control total.

---

## Primitivas clave del vibe coding

### Agente

Un agente es una IA que no solo responde — actúa: lee archivos, ejecuta comandos, llama APIs externas y toma decisiones multi-paso para completar una tarea.

En Claude Code, los agentes se definen en `.agents/agents/` con un archivo `AGENT.md` que describe su especialidad, herramientas disponibles y restricciones de comportamiento.

```
.agents/
└── agents/
    ├── frontend-spa-lead/
    │   └── AGENT.md    ← "You are an Angular 21 architect. Never modify the backend."
    └── backend-ddd-lead/
        └── AGENT.md    ← "Apply strict DDD. Validate layer boundaries."
```

Cursor implementa agentes a través de su modo *Composer Agent*, que encadena ediciones de archivos y comandos de terminal de forma autónoma.

---

### Habilidad

Una habilidad es conocimiento especializado empaquetado como contexto reutilizable. No es código ejecutable — es un manual de instrucciones que el agente carga cuando es necesario.

```markdown
<!-- .agents/skills/angular-best-practices/SKILL.md -->
# Angular Best Practices

- Use OnPush in all components
- Prefer Signals over BehaviorSubject
- Apply @defer for heavy components
- Standalone components by default
```

Cuando el agente trabaja en un componente Angular, carga automáticamente estas instrucciones y las aplica sin que tengas que repetirlas en cada prompt.

**En Cursor**, los equivalentes son *Rules* en `.cursorrules` o en la configuración del proyecto — texto libre inyectado en el contexto de cada solicitud.

---

### Flujo de trabajo

Un flujo de trabajo es un proceso multi-paso, documentado como una guía que el agente puede seguir de principio a fin. La diferencia con una habilidad es que un flujo de trabajo tiene un orden definido y un estado final.

```markdown
<!-- .agents/workflows/deploy-vercel-angular.md -->
# Deploy Angular → Vercel

1. Run build: `npm run build`
2. Verify that dist/ exists
3. Check environment variables in .env.production
4. Push to main → GitHub Actions triggers the deploy
5. Verify the production URL after 3 minutes
```

Esto te permite delegar procesos repetitivos completos: *"sigue el flujo de trabajo de deploy"* y el agente ejecuta cada paso, verificando el resultado.

---

### Regla

Las reglas son restricciones duras que el agente debe respetar siempre, independientemente del prompt. Donde las habilidades son recomendaciones, las reglas son leyes.

```markdown
<!-- .agents/rules/ddd-layer-rules.md -->
# DDD Layer Rules

❌ NEVER import infrastructure classes from the domain
❌ NEVER put business logic in controllers
✅ Use cases depend only on interfaces, never on implementations
✅ Repositories belong to the infrastructure layer
```

Claude Code evalúa las reglas antes de cualquier edición. Si una acción las viola, detiene la ejecución y lo reporta. Cursor usa `.cursorrules` con la misma filosofía.

---

### Sub-Agente

Un sub-agente es un agente hijo que el agente principal lanza para resolver una tarea específica en paralelo o en aislamiento. El resultado vuelve al agente padre, que lo integra.

En Claude Code, la herramienta `Agent` permite al modelo orquestar sub-agentes especializados:

```
Main agent: "implement full authentication"
    ├── Sub-agent A: "design the database schema"
    ├── Sub-agent B: "implement the JWT backend"
    └── Sub-agent C: "implement the Angular form"
```

Cada sub-agente trabaja en paralelo con su propio contexto. El agente principal coordina, integra y resuelve conflictos. Esto acelera drásticamente las tareas grandes.

---

### Worktree

Un worktree es una copia aislada del repositorio git donde el sub-agente puede trabajar sin contaminar la rama principal. Si algo sale mal, se descarta sin dejar rastro.

```bash
# Claude Code creates a worktree automatically for tasks with isolation: "worktree"
git worktree add .worktrees/feature-auth -b feat/auth

# The agent works in .worktrees/feature-auth/
# Success → merge to main
# Failure → git worktree remove .worktrees/feature-auth
```

Esto es fundamental en vibe coding: puedes delegar experimentos arriesgados sin miedo. El agente intenta, refactoriza, rompe y reconstruye en su propio espacio. Tu rama se mantiene intacta.

Cursor implementa algo similar con su sistema de puntos de control y la capacidad de revertir cambios del agente de forma granular.

---

### MCP (Model Context Protocol)

MCP es el protocolo estándar abierto que permite a los agentes conectarse con herramientas y servicios externos: bases de datos, APIs, sistemas de tickets, navegadores, servicios en la nube.

```json
// mcp_config.json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem", "./src"]
    },
    "github": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "..." }
    },
    "postgres": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-postgres", "postgresql://..."]
    }
  }
}
```

Con MCP, el agente puede leer tu base de datos para entender el esquema antes de generar migraciones, abrir automáticamente PRs en GitHub, o buscar requisitos de tickets en Jira. Es el puente entre la IA y tu ecosistema real.

Claude Code, Cursor, Gemini CLI y OpenCode implementan todos MCP. Cualquier servidor MCP funciona en todos ellos.

---

## Los tres ámbitos de configuración

Una de las características más poderosas de Claude Code es su sistema de configuración por capas. Cada capa hereda de la anterior y puede sobrescribirla.

### Ámbito Global

Configuración que se aplica a **todos tus proyectos**. Vive en `~/.claude/` en tu máquina local.

```
~/.claude/
├── settings.json       ← global preferences, default permissions
├── CLAUDE.md           ← instructions that always apply
└── memory/             ← persistent memory across sessions
```

Aquí defines cosas como: *"siempre usa commits en inglés"*, *"nunca hagas push sin confirmación"*, *"mi editor es VS Code"*. Estas son tus preferencias personales, no las del proyecto.

### Ámbito de Proyecto

Configuración específica del repositorio. Vive en `.claude/` o `CLAUDE.md` en la raíz del proyecto y está versionada en git.

```
my-project/
├── CLAUDE.md               ← project context, stack, architectural decisions
├── .claude/
│   └── settings.json       ← permissions and tools allowed in this project
└── .agents/
    ├── skills/             ← project skills
    ├── workflows/          ← project workflows
    └── rules/              ← project rules
```

El `CLAUDE.md` del proyecto es donde describes el stack, convenciones, agentes disponibles y patrones a seguir. Es la incorporación del agente a tu base de código.

### Ámbito Local

Tu configuración personal para ese proyecto, que **no está versionada**. Vive en `.claude/settings.local.json`.

```json
// .claude/settings.local.json  (in .gitignore)
{
  "env": {
    "DATABASE_URL": "postgresql://localhost/my_db_local",
    "API_KEY": "sk-local-only-..."
  },
  "permissions": {
    "allow": ["Bash(docker:*)"]
  }
}
```

Aquí van tus credenciales locales, rutas específicas de la máquina o permisos que necesitas pero tus compañeros de equipo no. Cada desarrollador del equipo puede tener un ámbito local diferente en el mismo proyecto.

---

## El flujo completo en la práctica

Un día típico de vibe coding con esta arquitectura:

```
1. Abres Claude Code en tu proyecto
2. El agente carga: CLAUDE.md global + CLAUDE.md del proyecto + settings.local.json
3. Preguntas: "implementa el módulo de pagos siguiendo nuestras reglas DDD"
4. El agente:
   - Lee las reglas DDD antes de escribir nada
   - Carga la habilidad de Spring (si aplica)
   - Crea un worktree aislado para trabajar
   - Lanza sub-agentes para backend y frontend en paralelo
   - Usa MCP para consultar el esquema actual de la BD
   - Sigue el flujo de trabajo de creación de PR cuando termina
5. Revisas el diff y haces merge
```

En lugar de pair programming con un humano, tienes un equipo de agentes especializados — coordinados, con memoria de tus preferencias y respeto por tus reglas.

---

## ¿Qué herramienta elegir?

|  | Claude Code | Gemini CLI | Cursor | OpenCode |
| --- | --- | --- | --- | --- |
| **Contexto** | 1M | 1M | Variable | Variable |
| **Agentes** | ✅ Native | ✅ Native | ✅ Composer | ✅ |
| **MCP** | ✅ | ✅ | ✅ | ✅ |
| **Worktrees** | ✅ | ❌ | ❌ | ❌ |
| **Capas de config** | ✅ | Limitado | ✅ Parcial | ✅ |
| **Código Abierto** | ❌ | ❌ | ❌ | ✅ |
| **Mejor para** | Mejor agente de codificación autónoma / refactores de larga duración | Contexto masivo + código abierto + tier gratuito | Mejor experiencia IDE-nativa + flujo multi-modelo | Privacidad/auto-alojado/ecosistema abierto |

 

No hay respuesta universal. Claude Code brilla en proyectos con arquitectura compleja y equipos que quieren estandarizar cómo trabaja la IA. Gemini CLI gana cuando todo el contexto del repositorio cabe en un único prompt. Cursor es la mejor experiencia si no quieres salir del IDE. OpenCode si la privacidad es innegociable.

---

## Conclusión

El vibe coding maduro no es *"escribo prompts y rezo"*. Es construir una infraestructura de contexto: habilidades que encapsulen conocimiento del dominio, reglas que protejan invariantes arquitectónicos, flujos de trabajo que automaticen procesos, agentes especializados que colaboren, y worktrees que aíslen riesgo.

Cuando esa infraestructura está bien construida, la IA deja de ser una asistente de autocompletado y se convierte en un miembro del equipo que entiende el proyecto.

Eso es lo que hace que el vibe coding, hecho bien, sea una ventaja genuina.