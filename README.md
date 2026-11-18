# FinanceTracker Java Edition

A full-stack personal finance application built using Java, Spring Boot, and React. Users can track income, manage 
expenses, and monitor their monthly spending through a simple dashboard.

## About the Project

This project started as a fun way to revisit my original [Python FinanceTracker](https://github.com/Abhay-Bajaj/
FinanceTracker), which I built using Python and Streamlit.

I wanted to challenge myself by rebuilding the application with a different technology stack while keeping the features 
I enjoyed from the original. This gave me an opportunity to strengthen my Java skills, explore Spring Boot, and gain 
more experience connecting a React frontend to REST APIs.

## Features

- Add, edit, and delete income and expense transactions
- View monthly income, expenses, and remaining balance
- Visualize spending with interactive charts
- Filter transactions by category and month
- Export transactions to CSV
- Switch between light and dark mode
- Save transactions locally using JSON
- Validate dates and transaction amounts

## Tech Stack

| Technology | Purpose |
|---|---|
| Java | Backend development |
| Spring Boot | REST API |
| React | Frontend interface |
| Vite | Frontend tooling |
| JSON | Local data storage |
| Maven | Java dependency management |
| GitHub Actions | Continuous integration |

## Running Locally

### Prerequisites

- Java 21
- Maven
- Node.js and npm

### 1. Clone the repository

```bash
git clone <YOUR-REPOSITORY-URL>
cd FinanceTracker-Java
```

### 2. Start the backend

Open a terminal:

```bash
cd backend
mvn spring-boot:run
```

The backend runs at `http://localhost:8080`.

### 3. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

No database setup is required. Transactions are stored locally in a JSON file.

## Testing

Run backend tests:

```bash
cd backend
mvn test
```

Run frontend tests:

```bash
cd frontend
npm test
```

## What I Learned

Rebuilding an existing project using Java instead of Python was an enjoyable learning experience. It helped me better 
understand REST API development, object-oriented programming, frontend and backend communication, and input validation.

It was also interesting to approach familiar features from a different technical perspective while improving the overall 
application.