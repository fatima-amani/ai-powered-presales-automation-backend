# AI-Powered Presales Automation Backend

Welcome to the **AI-Powered Presales Automation Backend** repository! This backend system is designed to enhance and automate the presales process using artificial intelligence. It aims to improve efficiency and accuracy for presales teams by streamlining workflows and generating intelligent recommendations.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Usage](#usage)
  - [Start the Development Server](#start-the-development-server)
  - [Run with Docker](#run-with-docker)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview

The **AI-Powered Presales Automation Backend** is the core engine that powers the presales automation process, leveraging artificial intelligence to process data and generate valuable insights. It seamlessly integrates with the AI server to offer intelligent recommendations, making the presales process faster, smarter, and more efficient.

---

## Features

- 🔐 **Secure Authentication**: Implements JWT-based authentication to keep your data and users safe.
- 📄 **Client Requirement Processing**: Accepts client requirements through PDFs and tech stack preferences, storing PDFs securely in Cloudinary.
- 📊 **Requirement Breakdown Generation**: Automatically generates functional, non-functional, and feature breakdowns, storing and retrieving them from the database.
- 🏗 **Tech Stack Recommendation**: AI-driven recommendations for the most suitable tech stack, stored and fetched from the database.
- 🏛 **Architecture Diagram Generation**: Generates architecture diagrams dynamically, storing and retrieving them from the database.
- 🤖 **AI-Powered Business Analyst**: Generates and stores business analysis reports, making them available for retrieval as needed.
- ⏳ **AI-Powered Effort Estimation**: Uses AI to estimate effort, generates an Excel file, and securely stores it in Cloudinary.
- 🖼 **AI-Powered Wireframe Generation**: Generates wireframes using AI, storing images securely in the database.
- 🔑 **Role-Based Access Control (RBAC)**: Implements role-based access to restrict or grant features based on user roles.
- 🕒 **Version Control**: Uses `mongoose-history-plugin` to maintain version control for stored data, ensuring data integrity and tracking changes over time.


---

## Technologies Used

This project is built using the following technologies:

- **Node.js**: A JavaScript runtime used for building the backend.
- **Express.js**: A web framework for handling API requests and routing.
- **MongoDB**: A NoSQL database for flexible, scalable data storage.
- **Cloudinary**: For cloud-based storage and management of media files.
- **JWT (JSON Web Token)**: Secure and stateless authentication system.
- **Docker**: For containerization, making it easy to deploy and scale.

---

## Getting Started

Follow the steps below to set up and run the project on your local machine.

### Prerequisites

Make sure you have the following tools installed:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [MongoDB](https://www.mongodb.com/) (Cloud-based or local instance)
- [Docker](https://www.docker.com/) (Optional for containerized deployment)

### Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/fatima-amani/ai-powered-presales-automation-backend.git
   ```

2. **Navigate to the Project Directory**:

   ```bash
   cd ai-powered-presales-automation-backend
   ```

3. **Install Dependencies**:

   ```bash
   npm install
   ```

---

## Environment Variables

Create a `.env` file in the root directory of the project with the following configuration:

```env
MONGO_URL=your_mongodb_connection_string
PORT=8080

CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=expiration_time_in_seconds

BACKEND_URL=url_of_ai_server_from_https://github.com/fatima-amani/ai-powered-presales-automation-ai
```

### Replace the placeholders:

- **MONGO_URL**: Your MongoDB connection string (e.g., `mongodb+srv://<user>:<password>@cluster.mongodb.net/dbname`).
- **CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET**: Your Cloudinary credentials for media storage.
- **JWT_SECRET**: A secure key used for JWT authentication.
- **JWT_EXPIRES_IN**: Token expiration time in seconds (e.g., `3600` for 1 hour).
- **BACKEND_URL**: The URL of the AI server from [this repository](https://github.com/fatima-amani/ai-powered-presales-automation-ai).

> 🚨 **Security Note**: Never commit your `.env` file to version control. Be sure to add it to your `.gitignore` file.

---

## Usage

### Start the Development Server

To run the server locally, use the following command:

```bash
npm start
```

The server will run on the port specified in your `.env` file (default: `8080`). You can access it at:

```
http://localhost:8080
```

### Run with Docker

To run the project inside a Docker container, first build the image and then run it with:

```bash
docker build -t ai-presales-backend .
docker run -p 8080:8080 --env-file .env ai-presales-backend
```

---

Thanks for checking out the **AI-Powered Presales Automation Backend**! We hope it helps make your presales process faster and smarter. Let us know if you have any questions or suggestions! 😊
