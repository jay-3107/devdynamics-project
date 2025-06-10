# Expense Splitter API

A backend system for splitting expenses among groups of people. Built with FastAPI and MongoDB.

## Features

- **Expense Tracking**: Add, view, update, and delete expenses
- **Flexible Splitting Options**: Equal, percentage, or exact amount splits
- **Settlement Calculations**: Simplified payments to settle debts
- **Automatic Person Creation**: People are automatically added when mentioned in expenses

## API Endpoints

### Expense Management

- `GET /expenses` - List all expenses
- `POST /expenses` - Add new expense
- `PUT /expenses/:id` - Update expense
- `DELETE /expenses/:id` - Delete expense

### Settlement Calculations

- `GET /settlements` - Get current settlement summary
- `GET /balances` - Show each person's balance (owes/owed)
- `GET /people` - List all people (derived from expenses)
