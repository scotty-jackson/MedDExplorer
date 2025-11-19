# Medicare Part D Drug Spending Explorer

A full-stack web application for exploring Medicare Part D prescription drug spending data. Built with FastAPI (Python), PostgreSQL, and Next.js (React/TypeScript).

## Overview

This application allows users to:
- Search for drugs by generic or brand name
- View detailed spending trends and metrics over time
- Compare drugs by total spending, cost per beneficiary, and year-over-year growth
- Explore data by year and drug category
- Visualize trends with interactive charts

The app is SEO-optimized and designed for future Google AdSense monetization.

## Architecture

```
/backend          # FastAPI backend API
  /app
    /api          # API route handlers
    /etl          # ETL scripts for data ingestion
    models.py     # SQLAlchemy database models
    schemas.py    # Pydantic validation schemas
    database.py   # Database configuration
    main.py       # FastAPI application entry point
  /alembic        # Database migrations
  requirements.txt

/frontend         # Next.js frontend
  /src
    /app          # Next.js app router pages
    /components   # React components
    /lib          # Utilities and API client
  package.json
  tailwind.config.ts

.env.example      # Environment variable template
```

## Tech Stack

**Backend:**
- FastAPI (Python web framework)
- PostgreSQL (relational database)
- SQLAlchemy (ORM)
- Alembic (database migrations)
- Pandas (data processing for ETL)

**Frontend:**
- Next.js 14 (React framework with App Router)
- TypeScript
- Tailwind CSS (styling)
- Recharts (data visualization)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.9+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 18+** and npm - [Download Node.js](https://nodejs.org/)
- **PostgreSQL 13+** - [Download PostgreSQL](https://www.postgresql.org/download/)
- **Git** - [Download Git](https://git-scm.com/)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd MedDExplorer
```

### 2. Set Up PostgreSQL Database

#### Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download and install from [PostgreSQL official site](https://www.postgresql.org/download/windows/).

#### Create the Database

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE medicare_partd;
CREATE USER medicare_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE medicare_partd TO medicare_user;

# Exit PostgreSQL
\q
```

### 3. Configure Environment Variables

Copy the example environment file and update it with your settings:

```bash
cp .env.example .env
```

Edit `.env` and update the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://medicare_user:your_secure_password@localhost:5432/medicare_partd

# Application Environment
APP_ENV=development

# Data Directory for ETL
DATA_DIR=./data/raw

# Backend API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# CORS Settings
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Logging
LOG_LEVEL=INFO
```

### 4. Set Up Backend

```bash
cd backend

# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 5. Run Database Migrations

```bash
# Still in the /backend directory with venv activated

# Run Alembic migrations to create tables
alembic upgrade head
```

### 6. Download CMS Part D Data

Download Medicare Part D drug spending data from CMS:

1. Visit the [CMS Data Portal](https://data.cms.gov)
2. Search for "Medicare Part D Spending by Drug"
3. Download the CSV/TSV files for the years you want to analyze
4. Create a data directory and place the files there:

```bash
# From the project root
mkdir -p data/raw
# Copy your downloaded CMS files to data/raw/
```

### 7. Run the ETL Process

```bash
# From the /backend directory with venv activated
python -m app.etl.etl_partd --data-dir ../data/raw
```

This will:
- Read all CSV/TSV files in the data directory
- Parse and normalize the data
- Insert drugs and year statistics into the database
- Calculate derived metrics (cost per claim, YoY growth, etc.)
- Log progress and statistics

**Note:** The ETL process is idempotent and can be re-run to add new years of data.

### 8. Start the Backend API

```bash
# From the /backend directory with venv activated
python -m app.main
```

The API will be available at `http://localhost:8000`

API Documentation:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 9. Set Up Frontend

Open a new terminal window:

```bash
cd frontend

# Install dependencies
npm install
```

### 10. Start the Frontend Development Server

```bash
# From the /frontend directory
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Usage

### Exploring the App

1. **Home Page** (`/`): Search for drugs, view top drugs by spending and growth
2. **Drug Detail Page** (`/drug/[id]`): View comprehensive metrics, charts, and time series data for a specific drug
3. **Year Overview** (`/year/[year]`): View top drugs for a specific year by various metrics
4. **About Page** (`/about`): Learn about the data sources and methodology

### API Endpoints

#### Get Available Years
```bash
GET /api/years
```

#### Search Drugs
```bash
GET /api/drugs/search?q=ozempic&limit=20&offset=0
```

#### Get Top Drugs
```bash
GET /api/drugs/top?year=2023&metric=total_spending&limit=10
```

Metrics: `total_spending`, `spending_per_beneficiary`, `yoy_spending_growth`

#### Get Drug Time Series
```bash
GET /api/drugs/{drug_id}/timeseries
```

#### Get Categories
```bash
GET /api/categories
```

#### Get Category Summary
```bash
GET /api/categories/{category_id}/summary?year=2023
```

## Development Workflow

### Adding New Data

When CMS publishes new year(s) of data:

1. Download the new CSV/TSV files
2. Place them in the `data/raw` directory
3. Run the ETL script:
   ```bash
   cd backend
   source venv/bin/activate
   python -m app.etl.etl_partd --data-dir ../data/raw
   ```

### Database Migrations

When you modify database models:

```bash
cd backend
source venv/bin/activate

# Create a new migration
alembic revision --autogenerate -m "Description of changes"

# Review the generated migration in alembic/versions/

# Apply the migration
alembic upgrade head
```

### Running Tests

```bash
# Backend tests (add pytest and tests later)
cd backend
pytest

# Frontend tests (add Jest tests later)
cd frontend
npm test
```

## Deployment

### Production Deployment Checklist

1. **Environment Variables:**
   - Set `APP_ENV=production`
   - Use strong, unique passwords for database
   - Update `CORS_ORIGINS` to include your production domain
   - Set `NEXT_PUBLIC_API_URL` to your production API URL

2. **Database:**
   - Use a managed PostgreSQL service (e.g., AWS RDS, DigitalOcean Managed Database)
   - Enable automated backups
   - Use SSL connections

3. **Backend:**
   - Use a production WSGI server (e.g., Gunicorn with Uvicorn workers)
   - Set up a reverse proxy (Nginx or Caddy)
   - Enable HTTPS with Let's Encrypt
   - Use a process manager (systemd, supervisor, or Docker)

4. **Frontend:**
   - Build the production bundle: `npm run build`
   - Serve with `npm start` or a static hosting service
   - Configure CDN for static assets

5. **Google AdSense:**
   - Replace placeholder divs in `AdPlaceholder.tsx` with actual AdSense code
   - Add your AdSense publisher ID
   - Configure ad units in Google AdSense dashboard

### Example Production Commands

```bash
# Backend with Gunicorn
cd backend
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# Frontend production build
cd frontend
npm run build
npm start
```

## Project Structure Details

### Backend Structure

```
backend/
├── app/
│   ├── api/              # API routes
│   │   ├── drugs.py      # Drug-related endpoints
│   │   ├── years.py      # Years endpoint
│   │   └── categories.py # Category endpoints
│   ├── etl/              # ETL scripts
│   │   └── etl_partd.py  # Medicare Part D ETL
│   ├── models.py         # SQLAlchemy models
│   ├── schemas.py        # Pydantic schemas
│   ├── database.py       # Database configuration
│   └── main.py           # FastAPI app
├── alembic/              # Database migrations
│   ├── versions/         # Migration scripts
│   └── env.py            # Alembic config
└── requirements.txt      # Python dependencies
```

### Frontend Structure

```
frontend/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── page.tsx      # Home page
│   │   ├── layout.tsx    # Root layout
│   │   ├── about/        # About page
│   │   ├── drug/[id]/    # Drug detail page
│   │   └── year/[year]/  # Year overview page
│   ├── components/       # React components
│   │   ├── Layout.tsx    # Main layout
│   │   ├── SearchBar.tsx # Drug search
│   │   ├── SpendingChart.tsx
│   │   ├── BeneficiariesChart.tsx
│   │   ├── GrowthChart.tsx
│   │   ├── TopDrugsTable.tsx
│   │   └── AdPlaceholder.tsx
│   └── lib/
│       └── api.ts        # API client and utilities
├── package.json
└── tailwind.config.ts
```

## Data Model

### Tables

**drug_classes**
- `id`: Primary key
- `name`: Category name (e.g., "GLP-1", "Statin")
- `description`: Category description

**drugs**
- `id`: Primary key
- `generic_name`: Generic drug name
- `brand_name`: Brand name (optional)
- `ndc`: National Drug Code (optional)
- `hcpcs_code`: HCPCS code (optional)
- `drug_class_id`: Foreign key to drug_classes
- `slug`: URL-friendly slug

**drug_year_stats**
- `id`: Primary key
- `drug_id`: Foreign key to drugs
- `year`: Year
- `total_spending`: Total gross spending
- `total_claims`: Number of claims
- `beneficiaries_count`: Number of beneficiaries
- `spending_per_claim`: Derived metric
- `spending_per_beneficiary`: Derived metric
- `yoy_spending_growth`: Year-over-year spending growth %
- `yoy_beneficiary_growth`: Year-over-year beneficiary growth %
- `yoy_claims_growth`: Year-over-year claims growth %

## SEO Optimization

The app is optimized for search engines:

- Server-side rendering with Next.js
- Dynamic meta tags for each page
- Clean, semantic HTML
- Human-readable URLs with slugs
- Descriptive page titles and meta descriptions
- Clear content structure with headings

## Performance Considerations

- Database indexes on frequently queried columns
- Connection pooling for database
- React component memoization where appropriate
- Image optimization (if images are added)
- CDN for static assets (in production)

## Future Enhancements

- [ ] Add user authentication for saved searches
- [ ] Implement drug comparison feature
- [ ] Add export to CSV/Excel functionality
- [ ] Create email alerts for drug price changes
- [ ] Add more drug categories and classifications
- [ ] Implement full-text search with PostgreSQL
- [ ] Add caching layer (Redis)
- [ ] Create admin dashboard for data management
- [ ] Add unit and integration tests
- [ ] Set up CI/CD pipeline

## Troubleshooting

### Database Connection Issues

**Error:** `could not connect to server`

**Solution:** Ensure PostgreSQL is running:
```bash
# Check status
sudo systemctl status postgresql  # Linux
brew services list                 # macOS

# Start if not running
sudo systemctl start postgresql    # Linux
brew services start postgresql@15  # macOS
```

### ETL Fails to Parse CSV

**Error:** Column name mismatches

**Solution:** CMS file formats may vary by year. Update the column mapping in `etl_partd.py`:
```python
column_map = {
    'Your_Column_Name': 'our_column_name',
    # Add more mappings as needed
}
```

### Frontend Cannot Connect to API

**Error:** Network error when fetching data

**Solution:** Ensure:
1. Backend is running on port 8000
2. `NEXT_PUBLIC_API_URL` in `.env` is correct
3. CORS is configured to allow localhost:3000

### Port Already in Use

**Error:** `Address already in use`

**Solution:**
```bash
# Find and kill process using port 8000
lsof -ti:8000 | xargs kill -9

# Or use a different port
uvicorn app.main:app --port 8001
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is provided as-is for educational and research purposes. The CMS data is public domain.

## Acknowledgments

- Data provided by the Centers for Medicare & Medicaid Services (CMS)
- Built with FastAPI, Next.js, PostgreSQL, and Recharts

## Contact

For questions or feedback, please open an issue on the GitHub repository.

---

**Disclaimer:** This is an independent project and is not affiliated with or endorsed by CMS or the U.S. government. All data is sourced from publicly available CMS datasets.
