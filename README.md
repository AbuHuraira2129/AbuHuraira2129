<p align="center">
  <img src="./assets/banner.svg" alt="Muhammad Abu Huraira, AI Product Engineer. Business problem in. Working AI product out." width="100%" />
</p>

<p align="center">
  <a href="https://www.linkedin.com/in/abuhuraira2129"><img src="https://img.shields.io/badge/LinkedIn-abuhuraira2129-121418?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn" /></a>
  <a href="mailto:abuhuraira2129@gmail.com"><img src="https://img.shields.io/badge/Email-abuhuraira2129%40gmail.com-121418?style=flat-square&logo=gmail&logoColor=white" alt="Email" /></a>
  <img src="https://img.shields.io/badge/Open_to-Product_%C2%B7_AI_%C2%B7_Forward--Deployed_roles-FF6A3D?style=flat-square" alt="Open to Product, AI and Forward-Deployed Engineer roles" />
</p>

### Hi, I'm Huraira.

I build **WhatsApp AI agents for sales and support, and the CRMs behind them**. I take each one from a messy business problem to a product people use every day: the user flow, the interface, the agent and its guardrails, and the full-stack app around it.

I started as a UI/UX designer, so I still design every screen myself. Then I build it with AI coding agents (Claude Code, Cursor) and MCP, and I keep a human in the loop for anything that touches a customer.

---

### How I build

```ts
// huraira.config.ts
export const huraira = {
  role: "AI Product Engineer",
  based: "Islamabad, Pakistan · remote-first · UTC+5",

  builds: [
    "WhatsApp AI agents for sales and support",
    "the CRMs and dashboards behind them",
    "voice agents that join live calls",
    "internal tools that replace spreadsheets and chasing",
  ],

  rules: [
    "Nothing customer-facing ships without a human approving it.",
    "If it can be a rule in code, it should not be a paragraph of prompt.",
    "Check what the agent actually did, not what it reported.",
    "If a screen confuses a real user, the feature is not done.",
  ],

  openTo: ["Product Engineer", "AI Engineer", "Forward-Deployed Engineer"],
} as const;
```

---

### The loop every project runs through

```mermaid
flowchart LR
    A[Business problem] --> B[User flow]
    B --> C[Interface]
    C --> D[Agent + tools]
    D --> E{Human check}
    E -- approved --> F((Live))
    E -- needs work --> D
    F -. real usage .-> A

    classDef base fill:#171A1F,stroke:#3A3F47,color:#EEE9E0;
    classDef gate fill:#171A1F,stroke:#FF6A3D,color:#EEE9E0;
    classDef live fill:#FF6A3D,stroke:#FF6A3D,color:#121418;
    class A,B,C,D base;
    class E gate;
    class F live;
```

---

### Recent builds

| Build | What it does | Stack |
|---|---|---|
| **WhatsApp sales agent + CRM** | Answers buyers only from a client-approved brief, captures and qualifies leads, and hands off to a person with the full conversation. Built for a software company in Saudi Arabia. | Next.js · PostgreSQL · WhatsApp Business API · LLMs |
| **Live-call voice agent** | Joins Google Meet calls and briefs a founder by voice. Works in stages (evidence, opinion, suggestion, action) so it reports before it acts. | FastAPI · Recall.ai · DeepSeek · edge-tts |
| **Daily briefing pipeline** | Pulls a company knowledge base into a database every day and turns it into Claude-written briefings. | TypeScript · GitHub Actions · Supabase · Claude |
| **Role-based ERP** | One app, four dashboards (CEO, Operations, QMP, Mentor), dual approval before work goes live, and payment requests that move from approved to paid. *In build.* | Next.js · RBAC · notifications |
| **Agent loops for engineering** | A triage loop and a coding loop that use GitHub Issues as the control plane. | GitHub Actions · Claude |

Most of this is client work, so the code is private. Happy to walk through any of it on a call.

<!--
  OPEN SOURCE: add 2 to 3 public repos here once they are cleaned up and pinned, for example:
  | [Taskify](https://github.com/AbuHuraira2129/REPO-NAME) | AI project platform with Kanban, Gantt and real-time updates | MERN · Socket.io · Gemini |
-->

---

### Stack

**AI and agents**
<br/>
<img src="https://img.shields.io/badge/Claude_API-121418?style=flat-square&logo=anthropic&logoColor=white" alt="Claude API" />
<img src="https://img.shields.io/badge/MCP-121418?style=flat-square&logo=modelcontextprotocol&logoColor=white" alt="MCP" />
<img src="https://img.shields.io/badge/Claude_Code-121418?style=flat-square&logo=claude&logoColor=white" alt="Claude Code" />
<img src="https://img.shields.io/badge/Cursor-121418?style=flat-square&logo=cursor&logoColor=white" alt="Cursor" />
<img src="https://img.shields.io/badge/Gemini_API-121418?style=flat-square&logo=googlegemini&logoColor=white" alt="Gemini API" />
<img src="https://img.shields.io/badge/n8n-121418?style=flat-square&logo=n8n&logoColor=white" alt="n8n" />
<img src="https://img.shields.io/badge/Make.com-121418?style=flat-square&logo=make&logoColor=white" alt="Make.com" />

**Product and frontend**
<br/>
<img src="https://img.shields.io/badge/Next.js-121418?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js" />
<img src="https://img.shields.io/badge/React-121418?style=flat-square&logo=react&logoColor=white" alt="React" />
<img src="https://img.shields.io/badge/TypeScript-121418?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
<img src="https://img.shields.io/badge/Tailwind_CSS-121418?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
<img src="https://img.shields.io/badge/Figma-121418?style=flat-square&logo=figma&logoColor=white" alt="Figma" />

**Backend and data**
<br/>
<img src="https://img.shields.io/badge/Node.js-121418?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js" />
<img src="https://img.shields.io/badge/Express-121418?style=flat-square&logo=express&logoColor=white" alt="Express" />
<img src="https://img.shields.io/badge/Python-121418?style=flat-square&logo=python&logoColor=white" alt="Python" />
<img src="https://img.shields.io/badge/FastAPI-121418?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" />
<img src="https://img.shields.io/badge/Supabase-121418?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
<img src="https://img.shields.io/badge/PostgreSQL-121418?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
<img src="https://img.shields.io/badge/MongoDB-121418?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB" />

**Ship and run**
<br/>
<img src="https://img.shields.io/badge/GitHub_Actions-121418?style=flat-square&logo=githubactions&logoColor=white" alt="GitHub Actions" />
<img src="https://img.shields.io/badge/Vercel-121418?style=flat-square&logo=vercel&logoColor=white" alt="Vercel" />
<img src="https://img.shields.io/badge/Cloudflare-121418?style=flat-square&logo=cloudflare&logoColor=white" alt="Cloudflare" />
<img src="https://img.shields.io/badge/WhatsApp_Business_API-121418?style=flat-square&logo=whatsapp&logoColor=white" alt="WhatsApp Business API" />

---

### Background

- **5+ years** of client delivery for founders and small businesses in the US, the Gulf and Pakistan, from scoping and pricing to launch and support.
- **BS Software Engineering**, NUML Islamabad. MERN Stack Fellowship, Bytewise.
- Design work: [Dribbble](https://dribbble.com/abuhuraira2129) · [Behance](https://www.behance.net/abuhuraira2129)

<p align="center"><sub>Got a business problem that an AI agent should solve, safely? <a href="mailto:abuhuraira2129@gmail.com">Write to me</a>.</sub></p>
