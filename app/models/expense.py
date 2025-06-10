from pydantic import BaseModel, Field, validator
from typing import Dict, List, Optional, Literal
from decimal import Decimal

class ExpenseBase(BaseModel):
    # Change this line
    amount: Decimal = Field(..., description="Expense amount (must be positive)", ge=Decimal('0.01'))
    description: str = Field(..., description="Description of the expense", min_length=1)
    paid_by: str = Field(..., description="Person who paid for the expense")
    split_type: Literal["equal", "percentage", "exact"] = Field(
        default="equal", 
        description="How to split the expense: equal shares, percentage, or exact amounts"
    )
    participants: List[str] = Field(
        default_factory=list, 
        description="People involved in this expense"
    )
    custom_split: Dict[str, Decimal] = Field(
        default_factory=dict,
        description="Custom split values when split_type is percentage or exact"
    )
    
    @validator('description')
    def description_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Description cannot be empty")
        return v.strip()
    
    @validator('paid_by')
    def paid_by_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Paid by cannot be empty")
        return v.strip()
    
    @validator('participants')
    def validate_participants(cls, v, values):
        # Ensure paid_by is in participants
        paid_by = values.get('paid_by', '')
        if paid_by and paid_by not in v:
            v.append(paid_by)
        return v
    
    @validator('custom_split')
    def validate_custom_split(cls, v, values):
        split_type = values.get('split_type')
        participants = values.get('participants', [])
        
        # For equal split, custom_split should be empty
        if split_type == 'equal' and v:
            return {}
            
        # For percentage or exact split, validate the custom_split
        if split_type in ['percentage', 'exact'] and v:
            # Check that all participants are in custom_split
            for participant in participants:
                if participant not in v:
                    raise ValueError(f"Missing split value for participant: {participant}")
            
            # For percentage, sum should be 100%
            if split_type == 'percentage':
                total = sum(v.values())
                if abs(total - Decimal('100')) > Decimal('0.01'):
                    raise ValueError(f"Percentage values must sum to 100%, got {total}%")
                    
            # For exact, sum should match amount
            if split_type == 'exact':
                amount = values.get('amount')
                total = sum(v.values())
                if abs(total - amount) > Decimal('0.01'):
                    raise ValueError(f"Exact amounts must sum to {amount}, got {total}")
                    
        return v

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(ExpenseBase):
    # Change this line too
    amount: Optional[Decimal] = Field(None, description="Expense amount (must be positive)", ge=Decimal('0.01'))
    description: Optional[str] = None
    paid_by: Optional[str] = None
    split_type: Optional[Literal["equal", "percentage", "exact"]] = None
    participants: Optional[List[str]] = None
    custom_split: Optional[Dict[str, Decimal]] = None
    
    @validator('description')
    def description_not_empty_if_provided(cls, v):
        if v is not None and not v.strip():
            raise ValueError("Description cannot be empty")
        return v.strip() if v else v
    
    @validator('paid_by')
    def paid_by_not_empty_if_provided(cls, v):
        if v is not None and not v.strip():
            raise ValueError("Paid by cannot be empty")
        return v.strip() if v else v

class ExpenseInDB(ExpenseBase):
    id: str = Field(..., alias="_id")
    
    class Config:
        allow_population_by_field_name = True