# Quick Start Guide

This guide will get you up and running with the Medicare Part D Drug Spending Explorer in under 10 minutes.

## Prerequisites Check

Ensure you have these installed:

```bash
# Check Python version (need 3.9+)
python3 --version

# Check Node.js version (need 18+)
node --version

# Check PostgreSQL (need 13+)
psql --version
```

If any are missing, see the [Prerequisites section in README.md](README.md#prerequisites).

## Step-by-Step Setup

### 1. Database Setup (2 minutes)

```bash
# Start PostgreSQL
sudo systemctl start postgresql  # Linux
# or
brew services start postgresql@15  # macOS

# Create database
sudo -u postgres psql -c "CREATE DATABASE medicare_partd;"
sudo -u postgres psql -c "CREATE USER medicare_user WITH PASSWORD 'dev_password_123';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE medicare_partd TO medicare_user;"
```

### 2. Environment Configuration (1 minute)

```bash
# From project root
cp .env.example .env

# Edit .env if you changed the database password
# (Optional, only if you used a different password above)
```

### 3. Backend Setup (2 minutes)

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate  # macOS/Linux
# or
# venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head
```

### 4. Get Sample Data (1 minute)

Download a sample dataset from CMS:

1. Visit https://data.cms.gov/summary-statistics-on-use-and-payments/medicare-medicaid-spending-by-drug/medicare-part-d-spending-by-drug
2. Download the CSV for the most recent year
3. Move it to the `data/raw/` directory

### 5. Load Data (2 minutes)

```bash
# Still in backend/ with venv activated
python -m app.etl.etl_partd --data-dir ../data/raw

# You should see progress logs
# Wait for "ETL Process Complete"
```

### 6. Start Backend (30 seconds)

```bash
# In backend/ with venv activated
python -m app.main

# Backend is now running at http://localhost:8000
# Visit http://localhost:8000/docs to see the API
```

### 7. Start Frontend (2 minutes)

Open a NEW terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Frontend is now running at http://localhost:3000
```

### 8. Explore the App!

Open your browser to `http://localhost:3000`

Try:
- Searching for a drug (e.g., "insulin", "eliquis", "ozempic")
- Clicking on a drug to see detailed metrics
- Viewing the top drugs by spending

## What's Next?

- **Add More Data**: Download additional years from CMS and re-run the ETL
- **Explore the API**: Visit `http://localhost:8000/docs` for interactive API documentation
- **Customize**: Modify the frontend components in `frontend/src/components/`
- **Deploy**: See the [Deployment section in README.md](README.md#deployment)

## Troubleshooting

### "Connection refused" when accessing the app
- Make sure both backend (port 8000) and frontend (port 3000) are running
- Check that nothing else is using these ports

### ETL script fails
- Verify the CSV file is in `data/raw/`
- Check the CSV column names match expected format
- See the column mapping in `backend/app/etl/etl_partd.py`

### Database connection error
- Ensure PostgreSQL is running: `sudo systemctl status postgresql`
- Verify the DATABASE_URL in `.env` matches your database credentials

### Need Help?
See the full [README.md](README.md) or open an issue on GitHub.

---

**You're all set! Happy exploring!** 🎉
