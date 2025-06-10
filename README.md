Expense Splitter API
A FastAPI service for tracking shared expenses and calculating settlements among groups of people.

📋 Features
Multiple Split Types: Equal, exact amount, and percentage-based splitting
Settlement Calculation: Optimized algorithm to minimize transactions
REST API: Full CRUD operations for expenses and balances
🚀 Live Demo
API: https://expense-splitter-api-n53l.onrender.com
Frontend: https://expense-splitter-frontend.onrender.com
🛠️ Tech Stack
Backend: FastAPI, Python 3.9+
Frontend: React, Vite
Database: MongoDB
Deployment: Render
📦 API Documentation
Endpoints
GET / - Health check
GET /expenses/ - List all expenses
POST /expenses/ - Create a new expense
PUT /expenses/{id} - Update an expense
DELETE /expenses/{id} - Delete an expense
GET /people/ - List all people
GET /settlements - Get optimal settlement plan
GET /balances - Get current balances
Testing the API
Postman Collection: Public Link
Gist: GitHub Gist
🧮 Settlement Logic Explained
The settlement algorithm works in 3 steps:

Calculate net balance for each person
Separate into debtors (negative balance) and creditors (positive balance)
Use a greedy approach to clear debts with minimal transactions
Example:

Alice: +$100 (creditor)
Bob: -$60 (debtor)
Charlie: -$40 (debtor)
Solution:

Bob pays $60 to Alice
Charlie pays $40 to Alice
🔧 Local Development Setup
bash
# Clone repository
git clone https://github.com/jay-3107/devdynamics-project.git
cd split-app

# Set up virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your MongoDB connection string

# Run the application
uvicorn app.main:app --reload
🗄️ Database Schema
The application uses MongoDB with the following collections:

expenses: Stores expense records with title, amount, payer, participants, and split information
balances: Calculated balances between users (generated, not stored)
settlements: Optimized transactions to settle debts (generated, not stored)
⚠️ Limitations & Assumptions
Single Currency: Currently supports calculations in a single currency
No Authentication: API doesn't implement user authentication/authorization
Simplified Person Model: People are identified by name only without user accounts
In-memory Optimizations: Some calculations happen in-memory rather than in the database
👤 Author
jay-3107 - Last updated: 2025-06-10
