from fastapi import APIRouter, HTTPException, status
from typing import List

from app.models.responses import DataResponse, PersonBalance, Settlement
from app.services.settlement_service import (
    calculate_balances, 
    calculate_simplified_settlements
)

router = APIRouter()

@router.get("/balances", response_model=DataResponse)
async def get_balances():
    """
    Get the balance of each person (total paid, total share, net balance)
    """
    try:
        balances = await calculate_balances()
        return {
            "success": True,
            "data": balances,
            "message": f"Retrieved balances for {len(balances)} people"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate balances: {str(e)}"
        )

@router.get("/settlements", response_model=DataResponse)
async def get_settlements():
    """
    Get optimized settlement transactions
    """
    try:
        settlements = await calculate_simplified_settlements()
        return {
            "success": True,
            "data": settlements,
            "message": f"Generated {len(settlements)} settlement transactions"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate settlements: {str(e)}"
        )