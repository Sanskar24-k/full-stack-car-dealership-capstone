# Full-Stack Car Dealership Capstone

A starter workspace for a full-stack car dealership application. The project is organized as a web client, a Django application/API, a database area for schema and seed assets, and focused microservices for dealership workflows.

## Architecture

```text
Browser
  │ HTTPS / JSON API
  ▼
server/frontend/ ───────► server/djangoapp/ ───────► server/database/
                                  │
                                  └──► server/djangoapp/microservices/
```

- **Frontend (`server/frontend/`)** — the browser-facing user experience. It will host inventory browsing and search, vehicle detail pages, customer accounts, favorites, and dealership/admin screens. The frontend calls the Django API over HTTP and should keep presentation concerns separate from business rules.
- **Django application (`server/djangoapp/`)** — the backend entry point and API. It will own request validation, authentication and permissions, domain models, orchestration, and API serialization. Django apps and shared backend configuration belong here as the implementation grows.
- **Microservices (`server/djangoapp/microservices/`)** — bounded service modules for dealership capabilities such as inventory, pricing, orders, customer records, or notifications. Start with clear internal interfaces; deploy a component independently only when its scale or operational needs justify it.
- **Database (`server/database/`)** — database-related project assets such as schema notes, migrations support, seed/import data, and local development documentation. The running application should access persistent data through Django's data layer rather than having the frontend connect directly to the database.

The intended request path is: a user interacts with the frontend, the frontend sends an authenticated API request to Django, Django applies domain rules and delegates to the relevant service module, and the data layer reads or writes the database. Responses return through the API to the frontend. Keep secrets and database credentials in environment variables; never commit them.

## Initial layout

```text
.
├── README.md
└── server/
    ├── frontend/
    ├── djangoapp/
    │   └── microservices/
    └── database/
```

Each directory currently contains a `.gitkeep` file so the scaffold is present in Git. Add implementation-specific documentation and configuration alongside the component they describe.

## Development plan

1. Choose and document frontend and backend versions and local prerequisites.
2. Add the frontend app under `server/frontend/` and the Django project/API under `server/djangoapp/`.
3. Define the initial dealership data model (for example vehicles, dealerships, customers, and inquiries), then create migrations and seed data.
4. Add API endpoints and tests for inventory search, vehicle details, and customer inquiry flows.
5. Configure local environment variables from a checked-in example file, and document how to run each component.

## Local setup

This repository starts as a structure-only scaffold. Runtime commands will be added after the frontend framework, database engine, and service boundaries are selected. Do not put credentials in source control.
