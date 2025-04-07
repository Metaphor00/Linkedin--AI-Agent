# LinkedIn Post Generator

An AI agent that creates and schedules LinkedIn posts in the user's personal style based on provided event details and photos.

## Features

- Multi-step post creation workflow
- AI-powered content generation with OpenAI
- LinkedIn posting capabilities
- Post scheduling
- Persistent storage with PostgreSQL

## Deployment to Render

### Prerequisites

1. A [Render](https://render.com/) account
2. An [OpenAI API key](https://platform.openai.com/)

### Step 1: Fork the Repository

Fork this repository to your own GitHub account.

### Step 2: Create a PostgreSQL Database on Render

1. Log in to your Render dashboard
2. Navigate to "New" > "PostgreSQL"
3. Name your database (e.g., "linkedin-post-generator-db")
4. Choose the Free plan
5. Click "Create Database"
6. Make note of the "Internal Database URL" - you'll need this for the next step

### Step 3: Deploy the Web Service

1. Navigate to "New" > "Web Service"
2. Connect your GitHub repository
3. Name your service (e.g., "linkedin-post-generator")
4. Set the following:
   - Environment: Node
   - Build Command: `npm ci && npm run build`
   - Start Command: `npm start`
5. Under "Advanced" > "Environment Variables", add:
   - `DATABASE_URL` = [Your Internal Database URL from Step 2]
   - `OPENAI_API_KEY` = [Your OpenAI API Key]
   - `NODE_ENV` = `production`
6. Choose the Free plan
7. Click "Create Web Service"

### Step 4: Initialize the Database

After your application is deployed, you'll need to initialize the database schema:

1. Go to your Web Service dashboard
2. Click on "Shell" in the top right
3. Run: `npm run db:push`

This will create the necessary database tables.

### Step 5: Access Your Application

Once deployment is complete (usually takes a few minutes), click the URL provided by Render to access your application.

## Local Development

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env` file with the following variables:
   ```
   DATABASE_URL=postgres://user:password@host:port/dbname
   OPENAI_API_KEY=your_openai_api_key
   ```
4. Run `npm run db:push` to initialize the database
5. Start the development server with `npm run dev`

## Technology Stack

- Frontend: React, TailwindCSS, Shadcn UI
- Backend: Express.js, Node.js
- Database: PostgreSQL with Drizzle ORM
- AI: OpenAI API (GPT-4o)