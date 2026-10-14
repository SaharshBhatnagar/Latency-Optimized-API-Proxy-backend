# Cloud-Native API Backend

The core logic and database management layer for the Latency-Optimized API Proxy ecosystem. Built with Node.js, Express, TypeScript, and PostgreSQL, this isolated service securely processes cache-miss queries forwarded by the gateway, manages persistent database connections, and handles core user authentication logic.

---

### Prerequisites
Make sure you have Node.js and npm installed. You will also need a local PostgreSQL database running, and ensure the frontend and gateway services are also running locally.

## Getting Started

### Installation

1. Clone the repository:

```bash
git clone https://github.com/SaharshBhatnagar/Latency-Optimized-API-Proxy-backend.git
```

2. Navigate to the project directory:

```bash
cd Latency-Optimized-API-Proxy-backend
```

3. Install dependencies:

```bash
npm install
```

4. Create your environment file:

Create a .env file in the root directory and configure your database, port, and email settings:

```bash
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/clouddb
JWT_SECRET=your_secure_jwt_secret
REDIS_URL=redis://127.0.0.1:6380
EMAIL_USER=your_email@gmail.com
EMAIL_APP_PASSWORD=your_gmail_app_password
FRONTEND_URL=https://proxy.saharshbhatnagar.app
```

> **Note**: In production, the DATABASE_URL points to your AWS RDS PostgreSQL instance.

5. Initialize the Database schema:

> Execute the SQL commands found in src/db/database.sql inside your PostgreSQL instance to create the necessary tables.

6. Start the development server:

```bash
npm run dev
```

## Usage

### Production Build

1. Compile the TypeScript source code:

```bash
npm run build
```

2. Start the compiled production server:

```bash
npm start
```

### Docker Deployment

This backend service is fully containerized. To build and run the isolated Docker image locally:

```bash
docker build -t latency-optimized-api-proxy-backend .
docker run -p 5000:5000 --env-file .env latency-optimized-api-proxy-backend
```

If you are running the full stack locally via Docker Compose, use:

```bash
docker compose up -d backend
```

## Directory Structure

```plaintext
Latency-Optimized-API-Proxy-backend/
├── .github/workflows/deploy.yml
├── src/
│   ├── config/              
│   │   └── database.ts      
│   ├── controllers/         
│   │   ├── authController.ts
│   │   └── metricsController.ts
│   ├── db/                  
│   │   └── database.sql     
│   ├── middleware/          
│   │   └── authMiddleware.ts
│   ├── models/              
│   │   └── userModel.ts     
│   └── routes/              
│       ├── authRoutes.ts    
│       ├── metricsRoutes.ts 
│       └── index.ts         
├── Dockerfile               
├── package.json             
└── tsconfig.json            
```

## CI/CD Pipeline

> This repository includes a GitHub Actions workflow (`deploy.yml`) that automatically builds the Docker image, pushes it to Amazon Elastic Container Registry (ECR), and automatically deploys to your EC2 instance via SSH upon pushes to the main branch. Ensure your AWS IAM credentials and EC2 SSH secrets are stored safely in GitHub Repository Secrets.

### Additional Documentation

**Architecture Details**

> This service acts as the origin server. It does not interface with the frontend directly; all client traffic is routed through the proxy gateway. It utilizes a centralized database.ts configuration to maintain a persistent connection pool with PostgreSQL, eliminating connection churn on cache misses.

**Tech Stack:** Node.js, Express, TypeScript, PostgreSQL, Docker, AWS (ECR, RDS, EC2)

**Full Architecture Stack**

This backend service is one component of a complete cloud-native ecosystem. You can explore the other microservices in this architecture here:

**API Gateway Proxy:** [Latency-Optimized API Proxy Gateway](https://github.com/SaharshBhatnagar/Latency-Optimized-API-Proxy-gateway)

**Frontend UI:** [Cloud-Native Performance Dashboard](https://github.com/SaharshBhatnagar/Latency-Optimized-API-Proxy-frontend)