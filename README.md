# Asignaciones — GST Transportes

Web app for managing freight trip assignments, replacing the Excel-based dispatch workflow.

## Features

- **Tablero de Despacho** — weekly board showing active units by zone
- **Lista de Viajes** — paginated trip list with filters (status, zone, date range, search)
- **Nueva Asignación / Editar** — form to create and edit trips with origin, destination, unit, and client data
- **Clientes** — searchable dropdown with inline client creation

## Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite, React Router |
| Backend | Node.js + Express |
| Database | SQL Server (mssql) |
| Auth | JWT (single admin user) |
| Process manager | PM2 |
| Reverse proxy | nginx |

## Project Structure

```
asignaciones/
├── backend/
│   ├── src/
│   │   ├── index.js
│   │   ├── db.js
│   │   ├── middleware/auth.js
│   │   └── routes/
│   │       ├── auth.js
│   │       ├── clientes.js
│   │       ├── dispatch.js
│   │       ├── viajes.js
│   │       └── zonas.js
│   └── seed-clientes.js
└── frontend/
    └── src/
        ├── components/
        │   ├── ClienteSelect.jsx
        │   └── StatusBadge.jsx
        └── pages/
            ├── Dashboard.jsx
            ├── Login.jsx
            ├── ViajeForm.jsx
            └── Viajes.jsx
```

## Database Tables

- `asig_viajes` — trip records
- `asig_clientes` — client catalog
- `asig_zonas` — zone catalog

## Setup (server)

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in DB credentials and JWT_SECRET
pm2 start src/index.js --name asignaciones-backend
```

### Frontend
```bash
cd frontend
npm install
npm run build
# dist/ is served by nginx at /asignaciones/
```

### nginx
```nginx
location ^~ /asignaciones/api/ {
    proxy_pass http://localhost:3001/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
location /asignaciones/ {
    alias /var/www/asignaciones/frontend/dist/;
    index index.html;
    try_files $uri $uri/ /asignaciones/index.html;
}
```

### Seed clients
```bash
cd backend
node seed-clientes.js
```

## Environment Variables

```env
DB_SERVER=
DB_DATABASE=
DB_USER=
DB_PASSWORD=
JWT_SECRET=
PORT=3001
```
