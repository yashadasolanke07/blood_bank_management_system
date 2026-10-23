# HemoCare — Blood Bank Management System

A modular React frontend starter for a Blood Bank Management System. Built with Vite, React, React Router, Tailwind CSS v4, Lucide icons, and Recharts.

## Run locally

```bash
npm install
npm run dev
```

Create a production build with `npm run build`.

Format the source files with Prettier using `npm run format`.

## Project structure

```text
src/
├── components/
│   ├── common/       # Reusable badges, tables, fields, cards, modals
│   └── layout/       # Sidebar and top navigation
├── data/
│   └── mockData.js   # Demo seed records and chart data
├── hooks/
│   └── usePersistedState.js
├── pages/            # Dashboard and the seven management pages + login
├── services/         # API integration placeholder
├── App.jsx           # Routes and application state
├── index.css
└── main.jsx
```

## Important

This project currently uses demo data persisted in browser local storage and a demo-only sign-in screen. It is not connected to a C++ backend or SQL database. Do not use it for real patient data or clinical decisions. Implement server-side authentication, authorization, validation, and secure API access before production use.
