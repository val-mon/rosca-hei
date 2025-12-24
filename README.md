# ROSCA-HEI
A digital platform for managing **ROSCA** (Rotating Savings and Credit Association).

## 📖 What is a ROSCA ?
It is a financial cooperative where:
- A group of people (called a "circle") commit to saving together
- Each member contributes a fixed amount every 2 week
- Each period, **all members contribute** → **one member receives** the total pot
- Members take turns receiving the pot until everyone has received once

## Architecture
- **Frontend**: Next.js (React framework)
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Authentication**: Email-based OTP (One-Time Password)

## Getting Started
### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm 11+

### Installation
1. Clone the repository

    ```bash
    git clone https://github.com/val-mon/rosca-hei.git
    cd rosca-hei
    ```

2. Set up the database
    - launch postgres (in docker)
    - use `db/create_db.sql` to create the db

3. Configure environment variables
    - Duplicate `.env.example` and name it `.env`
    - Fill it

4. Install and run backend

    ```bash
    cd backend
    npm install
    npm start
    ```

5. Install and run frontend

    ```bash
    cd frontend
    npm install
    npm run dev
    ```

6. Access the application at [http://localhost:3000](http://localhost:3000)

## Testing
- Run backend tests:

    ```bash
    cd backend
    npm test
    ```
