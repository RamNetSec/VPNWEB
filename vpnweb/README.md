# VPNWEB

This project provides a simple administrative dashboard to manage WireGuard users.

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app. Log in with **admin / root** to access the dashboard where you can manage users and query WireGuard status.

## Features

- Next.js app with Tailwind CSS and MUI components
- Login with basic auth (admin/root)
- CRUD endpoints for users (`/api/users`)
- WireGuard status endpoint (`/api/wireguard/status`)
