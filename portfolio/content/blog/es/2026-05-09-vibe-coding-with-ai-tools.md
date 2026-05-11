---
title: "Vibe Coding: el arte de programar con agentes de IA"
date: "2026-05-09"
tags: ["Claude Code", "AI Agents", "Vibe Coding", "MCP", "Developer Tools"]
excerpt: "Cómo Claude Code, Gemini CLI, Cursor y OpenCode están redefiniendo el desarrollo de software a través de agentes, skills, workflows y contexto estructurado."
coverImage: "/images/blog/vibe-coding.webp"
published: true
readingTime: 9
---

# Vibe Coding: el arte de programar con agentes de IA

El *vibe coding* no es escribir código a ciegas esperando que funcione. Es colaborar con una IA que entiende tu base de código, sigue tus reglas, ejecuta herramientas reales y aprende el contexto de tu proyecto. Herramientas como **Claude Code**, **Gemini CLI**, **Cursor** y **OpenCode** están convirtiendo esa visión en realidad hoy.

Esta entrada explora las primitivas que hacen posible esa colaboración: agentes, skills, workflows, reglas, sub-agentes, worktrees, MCP y los tres niveles de configuración.

---

## ¿Qué es el vibe coding?

El término, popularizado en 2025, describe un estilo de desarrollo donde el programador describe la intención — *"añade autenticación JWT a esta API"*, *"refactoriza este servicio siguiendo DDD"* — y el agente de IA toma decisiones, lee archivos, ejecuta comandos y produce código funcional.

No es autocompletado avanzado. Es delegación con contexto.

---

## Las herramientas principales

### Claude Code

CLI de Anthropic para el terminal y VS Code. Opera con acceso real al sistema de archivos, git, y herramientas externas vía MCP. Su punto fuerte es la arquitectura de configuración por capas (global → proyecto → local) y el sistema de agentes especializados.

```bash
# Instalar
npm install -g @anthropic-ai/claude-code

# Usar en un proyecto
cd mi-proyecto
claude
```

### Gemini CLI

La apuesta de Google, orientada a proyectos grandes gracias a su ventana de contexto de 1M tokens. Integra Google Search como herramienta nativa, lo que lo hace potente para tareas con investigación externa.

### Cursor

IDE completo basado en VS Code con IA profundamente integrada. Destaca por el modo *Agent* con autorun, la vista de diffs en tiempo real, y su capacidad de editar múltiples archivos coordinadamente.

### OpenCode

Alternativa open-source en la terminal. Compatible con cualquier proveedor (OpenAI, Anthropic, Ollama) y orientado a usuarios que priorizan privacidad y control total.

---

## Primitivas clave del vibe coding

### Agent

Un agente es una IA que no solo responde, sino que actúa: lee archivos, ejecuta comandos, llama a APIs externas y toma decisiones en múltiples pasos para completar una tarea.

En Claude Code, los agentes se definen en `.agents/agents/` con un fichero `AGENT.md` que describe su especialidad, herramientas disponibles y restricciones de comportamiento.

```
.agents/
└── agents/
    ├── frontend-spa-lead/
    │   └── AGENT.md    ← "Eres un arquitecto Angular 21. Nunca modifiques el backend."
    └── backend-ddd-lead/
        └── AGENT.md    ← "Aplica DDD estricto. Valida límites de capa."
```

Cursor implementa agentes a través de su modo *Composer Agent*, que encadena ediciones de archivos y comandos terminal de forma autónoma.

---

### Skill

Una skill es conocimiento especializado empaquetado como contexto reutilizable. No es código ejecutable, es un manual de instrucciones que el agente carga cuando lo necesita.

```markdown
<!-- .agents/skills/angular-best-practices/SKILL.md -->
# Angular Best Practices

- Usa OnPush en todos los componentes
- Prefiere Signals sobre BehaviorSubject
- Aplica @defer para componentes pesados
- Standalone components por defecto
```

Cuando el agente trabaja en un componente Angular, carga automáticamente estas instrucciones y las aplica sin que tengas que repetirlas en cada prompt.

**En Cursor**, los equivalentes son las *Rules* en `.cursorrules` o en la configuración del proyecto — texto libre que se inyecta en el contexto de cada petición.

---

### Workflow

Un workflow es un proceso de múltiples pasos, documentado como guía que el agente puede seguir de principio a fin. La diferencia con una skill es que el workflow tiene un orden y un estado final definido.

```markdown
<!-- .agents/workflows/deploy-vercel-angular.md -->
# Deploy Angular → Vercel

1. Ejecutar build: `npm run build`
2. Verificar que dist/ existe
3. Comprobar variables de entorno en .env.production
4. Push a main → GitHub Actions activa el deploy automático
5. Verificar URL de producción tras 3 minutos
```

Esto permite delegar procesos repetitivos completos: *"sigue el workflow de deploy"* y el agente ejecuta cada paso verificando el resultado.

---

### Rule

Las rules son restricciones duras que el agente debe respetar siempre, independientemente del prompt. Donde las skills son recomendaciones, las rules son leyes.

```markdown
<!-- .agents/rules/ddd-layer-rules.md -->
# DDD Layer Rules

❌ NUNCA importes clases de infraestructura desde el dominio
❌ NUNCA pongas lógica de negocio en los controllers
✅ Los casos de uso solo dependen de interfaces, nunca de implementaciones
✅ Los repositorios pertenecen a la capa de infraestructura
```

Claude Code evalúa las rules antes de cualquier edición. Si una acción las viola, detiene la ejecución y lo notifica. Cursor usa `.cursorrules` con la misma filosofía.

---

### Sub-Agent

Un sub-agente es un agente hijo que el agente principal lanza para resolver una tarea específica en paralelo o en aislamiento. El resultado vuelve al agente padre que lo integra.

En Claude Code, el `Agent tool` permite al modelo orquestar sub-agentes especializados:

```
Agente principal: "implementa autenticación completa"
    ├── Sub-agente A: "diseña el esquema de base de datos"  
    ├── Sub-agente B: "implementa el backend JWT"
    └── Sub-agente C: "implementa el formulario Angular"
```

Cada sub-agente trabaja en paralelo con su propio contexto. El agente principal coordina, integra y resuelve conflictos. Esto acelera drásticamente tareas grandes.

---

### Worktree

Un worktree es una copia aislada del repositorio git donde el sub-agente puede trabajar sin contaminar la rama principal. Si algo sale mal, se descarta sin rastro.

```bash
# Claude Code crea un worktree automáticamente para tareas con isolation: "worktree"
git worktree add .worktrees/feature-auth -b feat/auth

# El agente trabaja en .worktrees/feature-auth/
# Si tiene éxito → merge a main
# Si falla → git worktree remove .worktrees/feature-auth
```

Esto es fundamental en vibe coding: puedes delegar experimentos riesgosos sin miedo. El agente prueba, refactoriza, rompe y recompone en su propio espacio. Tu rama queda intacta.

Cursor implementa algo similar con su sistema de checkpoints y la posibilidad de revertir cambios del agente de forma granular.

---

### MCP (Model Context Protocol)

MCP es el protocolo estándar abierto que permite a los agentes conectarse con herramientas y servicios externos: bases de datos, APIs, sistemas de tickets, navegadores, servicios cloud.

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

Con MCP, el agente puede leer tu base de datos para entender el esquema antes de generar migraciones, abrir PRs en GitHub automáticamente, o buscar en Jira los requisitos de un ticket. Es el puente entre la IA y tu ecosistema real.

Claude Code, Cursor, Gemini CLI y OpenCode implementan MCP. Cualquier servidor MCP funciona en todos ellos.

---

## Los tres niveles de configuración

Una de las características más potentes de Claude Code es su sistema de configuración por capas. Cada capa hereda la anterior y puede sobreescribirla.

### Global Scope

Configuración que aplica a **todos tus proyectos**. Vive en `~/.claude/` en tu máquina local.

```
~/.claude/
├── settings.json       ← preferencias globales, permisos por defecto
├── CLAUDE.md           ← instrucciones que siempre aplican
└── memory/             ← memoria persistente entre sesiones
```

Aquí defines cosas como: *"siempre usa commits en inglés"*, *"nunca hagas push sin confirmación"*, *"mi editor es VS Code"*. Son tus preferencias personales, no las del proyecto.

### Project Scope

Configuración específica del repositorio. Vive en `.claude/` o `CLAUDE.md` en la raíz del proyecto y se versiona en git.

```
mi-proyecto/
├── CLAUDE.md               ← contexto del proyecto, stack, decisiones arquitectónicas
├── .claude/
│   └── settings.json       ← permisos y herramientas permitidas en este proyecto
└── .agents/
    ├── skills/             ← skills del proyecto
    ├── workflows/          ← workflows del proyecto
    └── rules/              ← reglas del proyecto
```

El `CLAUDE.md` del proyecto es donde describes el stack, las convenciones, los agentes disponibles y los patrones a seguir. Es el "onboarding" del agente en tu codebase.

### Local Scope

Configuración personal para ese proyecto, que **no se versiona**. Vive en `.claude/settings.local.json`.

```json
// .claude/settings.local.json  (en .gitignore)
{
  "env": {
    "DATABASE_URL": "postgresql://localhost/mi_db_local",
    "API_KEY": "sk-local-only-..."
  },
  "permissions": {
    "allow": ["Bash(docker:*)"]
  }
}
```

Aquí van tus credenciales locales, rutas específicas de tu máquina, o permisos que tú necesitas pero tus compañeros no. Cada developer del equipo puede tener un scope local diferente sobre el mismo proyecto.

---

## El flujo completo en la práctica

Un día típico de vibe coding con esta arquitectura:

```
1. Abres Claude Code en tu proyecto
2. El agente carga: global CLAUDE.md + project CLAUDE.md + settings.local.json
3. Le pides: "implementa el módulo de pagos siguiendo nuestras rules DDD"
4. El agente:
   - Lee las rules de DDD antes de escribir nada
   - Carga la skill de Spring (si aplica)
   - Crea un worktree aislado para trabajar
   - Lanza sub-agentes para backend y frontend en paralelo
   - Usa MCP para consultar el esquema actual de la DB
   - Sigue el workflow de PR creation al terminar
5. Revisas el diff y haces merge
```

En lugar de pair programming con un humano, tienes un equipo de agentes especializados coordinados, con memoria de tus preferencias y respeto por tus reglas.

---

## ¿Qué herramienta elegir?

| | Claude Code | Gemini CLI | Cursor | OpenCode |
|---|---|---|---|---|
| **Contexto** | 200k tokens | 1M tokens | Variable | Variable |
| **Agentes** | ✅ Nativos | ✅ Nativos | ✅ Composer | ✅ |
| **MCP** | ✅ | ✅ | ✅ | ✅ |
| **Worktrees** | ✅ | ❌ | ❌ | ❌ |
| **Config layers** | ✅ 3 capas | Limitado | ✅ Parcial | ✅ |
| **Open Source** | ❌ | ❌ | ❌ | ✅ |
| **Ideal para** | Equipos, proyectos complejos | Contexto masivo | IDE integrado | Privacidad total |

No hay una respuesta universal. Claude Code destaca en proyectos con arquitectura compleja y equipos que quieren estandarizar cómo trabaja la IA. Gemini CLI gana cuando el contexto de todo el repositorio cabe en un solo prompt. Cursor es la mejor experiencia si no quieres salir del IDE. OpenCode si la privacidad es no negociable.

---

## Conclusión

El vibe coding maduro no es *"escribo prompts y rezo"*. Es construir una infraestructura de contexto: skills que encapsulan conocimiento del dominio, rules que protegen las invariantes arquitectónicas, workflows que automatizan procesos, agentes especializados que colaboran, y worktrees que aíslan el riesgo.

Cuando esa infraestructura está bien construida, la IA deja de ser un asistente que autocompleta y se convierte en un miembro del equipo que entiende el proyecto.

Eso es lo que hace que el vibe coding, bien hecho, sea una ventaja real.
