from decimal import Decimal
from typing import Dict, List
import logging

from app.db.database import get_expense_collection
from app.models.responses import PersonBalance, Settlement

logger = logging.getLogger(__name__)

async def calculate_balances() -> List[PersonBalance]:
    """
    Calculate the balance of each person: total paid, total share, and net balance
    """
    # Get the expense collection
    expense_collection = await get_expense_collection()
    
    # First, gather all expenses
    expenses = []
    async for expense in expense_collection.find():
        expenses.append(expense)
    
    # If no expenses, return empty list
    if not expenses:
        return []
    
    # Collect all unique people involved in expenses
    all_people = set()
    for expense in expenses:
        all_people.add(expense["paid_by"])
        all_people.update(expense["participants"])
    
    # Initialize tracking for each person
    balances: Dict[str, Dict] = {
        person: {"total_paid": Decimal('0'), "total_share": Decimal('0')} 
        for person in all_people
    }
    
    # Process each expense
    for expense in expenses:
        # Convert to Decimal for accurate calculations
        amount = Decimal(str(expense["amount"]))
        paid_by = expense["paid_by"]
        participants = expense["participants"]
        
        # Add to paid amount
        balances[paid_by]["total_paid"] += amount
        
        # Calculate shares based on split_type
        if expense["split_type"] == "equal":
            # Equal split among participants
            share = amount / Decimal(len(participants))
            for person in participants:
                balances[person]["total_share"] += share
        
        elif expense["split_type"] == "percentage":
            # Split based on custom percentages
            for person, percentage in expense["custom_split"].items():
                share = amount * Decimal(str(percentage)) / Decimal('100')
                balances[person]["total_share"] += share
        
        elif expense["split_type"] == "exact":
            # Split based on exact amounts
            for person, share in expense["custom_split"].items():
                balances[person]["total_share"] += Decimal(str(share))
    
    # Calculate net balance for each person
    result = []
    for person, amounts in balances.items():
        # Positive balance means the person is owed money
        # Negative balance means the person owes money
        balance = amounts["total_paid"] - amounts["total_share"]
        
        # Ensure balances are rounded to 2 decimal places
        result.append(
            PersonBalance(
                name=person,
                total_paid=round(amounts["total_paid"], 2),
                total_share=round(amounts["total_share"], 2),
                balance=round(balance, 2)
            )
        )
    
    # Sort by balance (highest positive to highest negative)
    return sorted(result, key=lambda x: x.balance, reverse=True)

async def calculate_simplified_settlements() -> List[Settlement]:
    """
    Calculate simplified settlement transactions that minimize the number of payments
    """
    # Get balances for all people
    balances = await calculate_balances()
    
    # If no balances, return empty list
    if not balances:
        return []
    
    # Create separate lists for creditors (positive balance) and debtors (negative balance)
    creditors = [b for b in balances if b.balance > Decimal('0')]
    debtors = [b for b in balances if b.balance < Decimal('0')]
    
    # Sort creditors by descending balance (highest positive first)
    creditors.sort(key=lambda x: x.balance, reverse=True)
    
    # Sort debtors by ascending balance (highest negative first)
    debtors.sort(key=lambda x: x.balance)
    
    # Initialize the settlements list
    settlements = []
    
    # Process until either creditors or debtors list is empty
    while creditors and debtors:
        creditor = creditors[0]
        debtor = debtors[0]
        
        # Calculate the amount to settle (minimum of what's owed and what can be paid)
        amount = min(creditor.balance, -debtor.balance)
        
        # Round to 2 decimal places for currency
        amount = round(amount, 2)
        
        if amount > Decimal('0'):
            settlements.append(
                Settlement(
                    from_person=debtor.name,
                    to_person=creditor.name,
                    amount=amount
                )
            )
        
        # Update balances
        creditor.balance -= amount
        debtor.balance += amount
        
        # Remove people with zero balance
        if abs(creditor.balance) < Decimal('0.01'):
            creditors.pop(0)
        
        if abs(debtor.balance) < Decimal('0.01'):
            debtors.pop(0)
    
    return settlements