# AGENTS.md instructions for /Users/mac/Library/CloudStorage/OneDrive-Personal/codes/projects/web/HR CRM Global Creatives

<INSTRUCTIONS>
Think of this like giving your AI coder a **technical operating manual**. If the instructions are fuzzy, the machine improvises. If they're sharp, it behaves like a disciplined engineer instead of a caffeine-fueled intern rewriting the stack every five minutes.

Since your priority is **React + Vite full-stack development**, the instruction block should make that crystal clear. Everything else becomes supporting infrastructure.

Below is a **clean custom instruction profile** tuned for a React-Vite full-stack workflow.

---

## Developer Context

The developer is a **full-stack engineer focused primarily on React and Vite ecosystems**, building modern web applications with scalable architecture and clean UI systems.

Primary stack (highest priority):

* **React (primary frontend framework)**
* **Vite (default build tool)**
* **TypeScript**
* **Tailwind CSS for styling**

Full-stack backend technologies:

* **Python (Django / Flask APIs)**
* **Node.js when lightweight APIs are needed**

Database layer:

* **PostgreSQL (primary database)**
* **MongoDB (for document-based systems)**

AI integration stack:

* **Python**
* **TensorFlow / PyTorch**

---

## Frontend Development Standards (Priority Stack)

When generating frontend code:

* Always prefer **React with Vite**
* Use **functional components**
* Use **React hooks**
* Avoid class components
* Prefer **Tailwind CSS** for styling
* Build **modular reusable components**
* Maintain **clean component separation**

Preferred folder architecture:

```
src
 |- components
 |- pages
 |- hooks
 |- services
 |- utils
 |- assets
 `- layouts
```

Rules:

* Avoid large monolithic components
* Keep UI logic separate from API logic
* Prefer composition over prop drilling
* Use async/await for API calls

Avoid:

* Create React App
* heavy UI libraries unless required
* unnecessary global state

---

## Full-Stack Development Pattern

For full stack projects:

Frontend:

* React + Vite
* component-driven architecture
* API calls via service layer

Backend:

* modular route structure
* clean validation and error handling


---

## Coding Standards

Always produce:

* complete working code
* clear imports
* maintainable structure
* comments for complex logic

Prefer:

* TypeScript when possible
* readable and scalable code

Avoid:

* pseudo code
* partial snippets
* academic explanations

---

## Response Format

Structure outputs as:

1. Approach explanation
2. Architecture overview
3. Complete code implementation
4. Optional improvements

---

Here's the deeper engineering trick most people miss. React + Vite works best when you enforce **three invisible layers**:

UI layer -> Components
Logic layer -> Hooks / Services
Data layer -> API / Database

Once you train your AI assistant to respect that separation, suddenly your generated code stops looking like a **Frankenstein monster of JSX and fetch calls**.

Software architecture is basically applied philosophy: deciding what belongs where so chaos stays contained. The universe tends toward entropy; good folder structures push back.
IF I EVER SAY DO SOMETHING REMOTELY RELATE TO WEB LIKE DEPLOY OR GOOGLE SIGNIN WIRE OR SUPABASE SETUP I NEED YOU TO ACTIVELY USE PLAYWRIGHT AND DO IT SWIFTLY
</INSTRUCTIONS>
