# AdInsight — Marketing Analytics Dashboard

A full-stack web application that visualizes 8,000 digital marketing campaign records through an interactive dashboard. Built with Next.js (frontend) and Flask + pandas (backend).

---

## Prerequisites

- Node.js 18+
- Python 3.10+
- A Kaggle account (for dataset auto-download)

---

## Setup

### 1. Backend

```bash
cd Backend
pip install -r requirements.txt
```

Create a `.env` file in the `Backend/` directory:

```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
KAGGLE_TOKEN=your_kaggle_token
PORT=3001
```

If you wish the start the backend server separately:

```bash
python main.py
```

The backend runs on `http://localhost:3001`. On first run it auto-downloads the dataset from Kaggle into `Backend/kaggle_download/`.

---

### 2. Frontend

```bash
cd Frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/overview` | Overall KPIs (conversion rate, CTR, ad spend) |
| `GET /api/by-channel` | Metrics grouped by campaign channel |
| `GET /api/by-campaign-type` | Metrics grouped by campaign type |
| `GET /api/by-age` | Conversion rate by age group |
| `GET /api/by-gender` | Conversion rate by gender |
| `GET /api/engagement` | Engagement metrics by channel |
| `GET /api/top-combinations` | Top 8 channel + type combinations by conversion rate |
