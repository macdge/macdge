# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Hosts the "متجر الهدايا المخصص" (Custom Gift Box Builder) — an Arabic, RTL, mobile-first React + Vite web app for browsing/customizing gifts, building a custom gift box (4-step wizard), submitting special requests, and an admin dashboard for managing products, packaging, orders, and special requests. Uses mock data persisted to localStorage via React Context (no backend yet).

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + TypeScript + Tailwind CSS v4 + shadcn/ui + framer-motion + wouter
- **State**: React Context + localStorage (mock data)
- **API framework (scaffolded, not used yet)**: Express 5
- **Database (scaffolded, not used yet)**: PostgreSQL + Drizzle ORM

## Artifacts

- `artifacts/gift-box-builder` — the customer + admin web app (Arabic RTL)
- `artifacts/api-server` — placeholder Express API (not used by gift-box-builder yet)
- `artifacts/mockup-sandbox` — design prototyping sandbox

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
