from typing import List, Dict, Optional
from bson.objectid import ObjectId
from decimal import Decimal

from app.db.database import get_expense_collection
from app.models.expense import ExpenseCreate, ExpenseUpdate
from app.utils.helpers import convert_decimal_to_float

async def get_all_expenses(skip: int = 0, limit: int = 10):
    """Get all expenses with pagination"""
    expense_collection = await get_expense_collection()
    cursor = expense_collection.find().skip(skip).limit(limit)
    expenses = []
    
    async for document in cursor:
        document["_id"] = str(document["_id"])
        expenses.append(document)
    
    return expenses

async def get_expense_by_id(expense_id: str):
    """Get a single expense by ID"""
    expense_collection = await get_expense_collection()
    
    if not ObjectId.is_valid(expense_id):
        return None
        
    document = await expense_collection.find_one({"_id": ObjectId(expense_id)})
    if document:
        document["_id"] = str(document["_id"])
        return document
    
    return None

async def create_expense(expense: ExpenseCreate):
    """Create a new expense"""
    expense_collection = await get_expense_collection()
    
    # Convert Pydantic model to dict
    expense_dict = expense.dict()
    
    # Add default participants if empty
    if not expense_dict["participants"]:
        expense_dict["participants"] = [expense_dict["paid_by"]]
    
    # Handle custom splits based on split_type
    if expense_dict["split_type"] == "equal":
        expense_dict["custom_split"] = {}
    elif expense_dict["split_type"] in ["percentage", "exact"] and not expense_dict["custom_split"]:
        # Create default splits
        if expense_dict["split_type"] == "percentage":
            # Equal percentage for all participants
            percentage = Decimal(100) / Decimal(len(expense_dict["participants"]))
            expense_dict["custom_split"] = {p: percentage for p in expense_dict["participants"]}
        else:  # exact
            # Equal amount for all participants
            share = expense_dict["amount"] / Decimal(len(expense_dict["participants"]))
            expense_dict["custom_split"] = {p: share for p in expense_dict["participants"]}
    
    # Convert Decimal to float for MongoDB compatibility
    expense_dict = convert_decimal_to_float(expense_dict)
    
    # Insert new expense
    result = await expense_collection.insert_one(expense_dict)
    
    # Return the newly created expense with its ID
    created_expense = await expense_collection.find_one({"_id": result.inserted_id})
    created_expense["_id"] = str(created_expense["_id"])
    
    return created_expense

async def update_expense(expense_id: str, expense_update: ExpenseUpdate):
    """Update an existing expense"""
    expense_collection = await get_expense_collection()
    
    if not ObjectId.is_valid(expense_id):
        return None
    
    # Get the current expense
    current_expense = await get_expense_by_id(expense_id)
    if not current_expense:
        return None
    
    # Create update dict from non-None fields
    update_data = {k: v for k, v in expense_update.dict().items() if v is not None}
    
    # If changing split_type, update custom_split accordingly
    if "split_type" in update_data:
        split_type = update_data["split_type"]
        participants = update_data.get("participants", current_expense["participants"])
        
        # Reset custom_split based on new split_type
        if split_type == "equal":
            update_data["custom_split"] = {}
        elif split_type in ["percentage", "exact"] and "custom_split" not in update_data:
            # Use amount from update or from existing expense
            amount = update_data.get("amount", Decimal(str(current_expense["amount"])))
            
            if split_type == "percentage":
                # Equal percentage for all participants
                percentage = Decimal(100) / Decimal(len(participants))
                update_data["custom_split"] = {p: percentage for p in participants}
            else:  # exact
                # Equal amount for all participants
                share = amount / Decimal(len(participants))
                update_data["custom_split"] = {p: share for p in participants}
    
    # Convert Decimal to float for MongoDB compatibility
    update_data = convert_decimal_to_float(update_data)
    
    # Update the expense
    if update_data:
        await expense_collection.update_one(
            {"_id": ObjectId(expense_id)},
            {"$set": update_data}
        )
    
    # Return the updated expense
    return await get_expense_by_id(expense_id)

async def delete_expense(expense_id: str):
    """Delete an expense"""
    expense_collection = await get_expense_collection()
    
    if not ObjectId.is_valid(expense_id):
        return False
    
    result = await expense_collection.delete_one({"_id": ObjectId(expense_id)})
    return result.deleted_count > 0

async def get_all_people_from_expenses():
    """Extract unique people from all expenses"""
    expense_collection = await get_expense_collection()
    
    pipeline = [
        # Unwind participants array to get all participants
        {"$unwind": "$participants"},
        # Group by participant name and count occurrences
        {"$group": {"_id": "$participants", "count": {"$sum": 1}}},
        # Sort by name
        {"$sort": {"_id": 1}},
        # Project to desired output format
        {"$project": {"name": "$_id", "_id": 0, "count": 1}}
    ]
    
    people = []
    async for person in expense_collection.aggregate(pipeline):
        people.append(person)
    
    return people