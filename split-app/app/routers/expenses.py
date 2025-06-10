from fastapi import APIRouter, Body, HTTPException, status, Path, Query
from fastapi.responses import JSONResponse
from typing import List, Optional
from bson.objectid import ObjectId
from datetime import datetime

from app.models.expense import ExpenseCreate, ExpenseUpdate, ExpenseInDB
from app.models.responses import DataResponse, ErrorResponse
from app.db.database import expense_collection
from app.services.expense_service import create_expense, get_all_expenses, update_expense, delete_expense

router = APIRouter()

@router.get("/", response_model=DataResponse)
async def get_expenses(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100)
):
    """
    Get all expenses with pagination
    """
    try:
        expenses = await get_all_expenses(skip, limit)
        return {
            "success": True,
            "data": expenses,
            "message": f"Retrieved {len(expenses)} expenses"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve expenses: {str(e)}"
        )

@router.post("/", response_model=DataResponse, status_code=status.HTTP_201_CREATED)
async def add_expense(expense: ExpenseCreate):
    """
    Add a new expense
    """
    try:
        created_expense = await create_expense(expense)
        return {
            "success": True,
            "data": created_expense,
            "message": "Expense added successfully"
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add expense: {str(e)}"
        )

@router.put("/{expense_id}", response_model=DataResponse)
async def update_expense_by_id(
    expense_id: str = Path(..., title="The ID of the expense to update"),
    expense_update: ExpenseUpdate = Body(...)
):
    """
    Update an existing expense by ID
    """
    try:
        # Validate ObjectId
        if not ObjectId.is_valid(expense_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid expense ID format"
            )
            
        updated_expense = await update_expense(expense_id, expense_update)
        if not updated_expense:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Expense with ID {expense_id} not found"
            )
            
        return {
            "success": True,
            "data": updated_expense,
            "message": "Expense updated successfully"
        }
    except HTTPException as e:
        raise e
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update expense: {str(e)}"
        )

@router.delete("/{expense_id}", response_model=DataResponse)
async def delete_expense_by_id(
    expense_id: str = Path(..., title="The ID of the expense to delete")
):
    """
    Delete an expense by ID
    """
    try:
        # Validate ObjectId
        if not ObjectId.is_valid(expense_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid expense ID format"
            )
            
        deleted = await delete_expense(expense_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Expense with ID {expense_id} not found"
            )
            
        return {
            "success": True,
            "data": {"id": expense_id},
            "message": "Expense deleted successfully"
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete expense: {str(e)}"
        )