# Cloud-Native API Backend

The core logic and database management layer for the Latency-Optimized API Proxy ecosystem. Built with Node.js, Express, TypeScript, and PostgreSQL, this isolated service securely processes cache-miss queries forwarded by the gateway, manages persistent database connections, and handles core user authentication logic.

---

### Prerequisites
Make sure you have Node.js and npm installed. You will also need a local PostgreSQL database running, ensure frontend and gateway are also running locally.

## Getting Started

### Installation

1. Clone the repository:

```bash
git clone https://github.com/SaharshBhatnagar/Latency-Optimized-API-Proxy-backend.git
```

2. Navigate to the project directory:

```Bash
cd Latency-Optimized-API-Proxy-backend
```

3. Install dependencies:

```Bash
npm install
```

4. Create your environment file:

Create a .env file in the root directory and configure your database and port settings:

```Bash
PORT=5000
DATABASE_URL=postgres://username:password@localhost:5432/your_database_name
JWT_SECRET=your_secure_jwt_secret
```

> **Note**: In a production AWS environment, the DATABASE_URL should point to your AWS RDS instance. Append `?ssl=true` to the URL if strict TLS is required by your RDS configuration.


5. Initialize the Database schema:

> Execute the SQL commands found in src/db/database.sql inside your PostgreSQL instance to create the necessary tables.

6. Start the development server:

```Bash
npm run dev
```

## Usage

### Production Build

1. Compile the TypeScript source code:

```Bash
npm run build
```

2. Start the compiled production server:

```Bash
npm start
```

### Docker Deployment

This backend service is fully containerized. To build and run the isolated Docker image locally:

```Bash
docker build -t latency-optimized-api-proxy-backend .
docker run -p 5000:5000 --env-file .env latency-optimized-api-proxy-backend
```

If you are running the full stack locally via Docker Compose, use:

```Bash
docker compose up -d backend
```

## Directory Structure

```Plaintext
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
├── nginx.conf               
├── package.json             
└── tsconfig.json            
```

## CI/CD Pipeline

> This repository includes a GitHub Actions workflow (`deploy.yml`) that automatically builds the Docker image and pushes it to Amazon Elastic Container Registry (ECR) upon pushes to the main branch. Ensure your AWS IAM credentials (`AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`) are stored safely in GitHub Repository Secrets.


### Additional Documentation

**Architecture Details**

> This service acts as the origin server. It does not interface with the frontend directly; all client traffic is routed through the proxy gateway. It utilizes a centralized database.ts configuration to maintain a persistent connection pool with PostgreSQL, eliminating connection churn on cache misses.

**Tech Stack:** Node.js, Express, TypeScript, PostgreSQL, Docker, AWS (ECR, RDS, EC2)

**Full Architecture Stack**

This backend service is one component of a complete cloud-native ecosystem. You can explore the other microservices in this architecture here:

**API Gateway Proxy:** [Latency-Optimized API Proxy Gateway](https://github.com/SaharshBhatnagar/Latency-Optimized-API-Proxy-gateway)

**Frontend UI:** [Cloud-Native Performance Dashboard](https://github.com/SaharshBhatnagar/Latency-Optimized-API-Proxy-frontend)