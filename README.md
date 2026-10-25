# Full-Stack Car Dealership Capstone

A full-stack dealership application organized as a React client, a Django API, an Express/MongoDB dealer directory, and a Flask sentiment service. The frontend sends application requests to Django; Django owns account sessions and the car catalog, and proxies dealership and sentiment requests to their focused services.

## Architecture

```text
                           ┌── Express API ── MongoDB
Browser ── React/Vite ── Django API
                           └── Flask sentiment analyzer
                            SQLite: users, makes, models
```

- **React/Vite (`server/frontend/`)** provides the account registration UI. The `static/` directory is also Vite's public directory and serves the standalone About and Contact pages at `/About.html` and `/Contact.html`.
- **Django (`server/djangoapp/`)** handles user registration, session login/logout, and car make/model data stored in SQLite. It proxies dealer requests to Express and text analysis requests to Flask.
- **Express/MongoDB (`server/database/`)** stores dealership profiles and reviews and exposes list, detail, state, and review endpoints. A repeatable seed script provides sample Kansas and Nebraska dealers.
- **Flask (`server/djangoapp/microservices/sentiment/`)** classifies short text as positive, neutral, or negative and returns a normalized score.

## Project layout

```text
server/
├── database/                         # Express + Mongoose dealer directory
│   ├── compose.yaml                  # Local MongoDB container
│   └── src/
├── djangoapp/                        # Django project and API
│   ├── dealership_api/               # Models, views, migration, seed command
│   └── microservices/sentiment/      # Flask analyzer
└── frontend/                         # React/Vite UI and static pages
    ├── src/components/Register/
    └── static/
```

## Requirements

- Node.js 18 or newer and npm
- Python 3.10 or newer and pip
- Docker Desktop (for the local MongoDB container), or another MongoDB server

## Local development

Run each component in its own terminal from the indicated directory.

### 1. Start MongoDB and the Express service

```powershell
cd server/database
Copy-Item .env.example .env
docker compose up -d mongo
npm install
npm run seed
npm run dev
```

The dealer API listens at `http://localhost:3000`. `npm run seed` is safe to repeat and adds three sample Kansas dealers, one Nebraska dealer, and two sample reviews.

### 2. Start Django

```powershell
cd server/djangoapp
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python manage.py migrate
python manage.py seed_cars
python manage.py runserver 8000
```

Django uses SQLite locally. The Vite development server proxies `/djangoapp/*` to Django, including the CSRF cookie endpoint used by registration.

### 3. Start the Flask analyzer

```powershell
cd server/djangoapp/microservices/sentiment
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

The analyzer listens at `http://localhost:5000`.

### 4. Start the React app

```powershell
cd server/frontend
npm install
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`). Static pages are available at `/About.html` and `/Contact.html`.

## API routes

### Django (`http://localhost:8000`)

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/djangoapp/csrf` | Set and return the CSRF cookie/token for browser clients |
| `POST` | `/djangoapp/register` | Create an account from `username`, `first_name`, `last_name`, `email`, and `password`; establishes a session |
| `POST` | `/djangoapp/login` | Start a session with username (or email) and password |
| `POST` | `/djangoapp/logout` | End the current session |
| `GET` | `/djangoapp/get_cars` | Return makes and their model details |
| `GET` | `/djangoapp/dealers` | Proxy all dealers from Express |
| `GET` | `/djangoapp/dealers/{id}` | Proxy one dealer |
| `GET` | `/djangoapp/dealers/state/{state}` | Proxy dealers by state, including `KS` or `Kansas` |
| `GET` | `/djangoapp/dealers/{id}/reviews` | Proxy reviews for a dealer |
| `GET` | `/djangoapp/analyze/{text}` | Proxy sentiment analysis to Flask; URL-encode text when calling directly |

### Express (`http://localhost:3000`)

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Service health |
| `GET` | `/dealers` | List dealers |
| `GET` | `/dealers/state/KS` | List Kansas dealers (`Kansas` is accepted too) |
| `GET` | `/dealers/{id}` | Dealer details by MongoDB ObjectId |
| `GET` | `/dealers/{id}/reviews` | Reviews for a dealer |

### Flask (`http://localhost:5000`)

- `GET /health`
- `GET /analyze/{text}` returns `{ "text": "...", "sentiment": "positive|neutral|negative", "score": 0.0 }`.

## Configuration

Copy each service's `.env.example` to `.env` for local overrides. Do not commit secrets. Django defaults to `127.0.0.1:3000` for Express and `127.0.0.1:5000` for Flask; override `DEALER_SERVICE_URL` and `SENTIMENT_SERVICE_URL` when those services run elsewhere. The Express service reads `MONGODB_URI`, `PORT`, and `FRONTEND_ORIGIN`.

## Production container deployment

The multi-container production stack is defined in `server/deployment/compose.yaml`. It serves the built React application through Nginx, runs Django with Gunicorn and WhiteNoise, and starts Express, Flask, and MongoDB. `mongo-data` and `django-data` are named persistent volumes.

```powershell
Copy-Item server/deployment/.env.example server/deployment/.env
# Edit server/deployment/.env and set a unique DJANGO_SECRET_KEY and the public host/origin values.
docker compose --env-file server/deployment/.env -f server/deployment/compose.yaml up --build -d
```

Open the port configured in `PORT` (4173 by default). Stop the stack with `docker compose --env-file server/deployment/.env -f server/deployment/compose.yaml down`; add `-v` only when intentionally discarding the persistent data volumes.

### Render deployment

The root `render.yaml` Blueprint defines the production web frontend, Django API, Express dealer API, Flask sentiment service, and MongoDB. The Django SQLite database and MongoDB data use persistent disks. In Render, connect this GitHub repository and create a Blueprint from `render.yaml`; the selected service plans and disks are paid Render resources. Render-generated service hostnames and the Django secret are wired through Blueprint references.
