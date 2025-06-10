from fastapi import APIRouter, HTTPException, status

from app.models.responses import DataResponse
from app.services.expense_service import get_all_people_from_expenses

router = APIRouter()

@router.get("/", response_model=DataResponse)
async def get_people():
    """
    Get all people who have been mentioned in expenses
    """
    try:
        people = await get_all_people_from_expenses()
        return {
            "success": True,
            "data": people,
            "message": f"Retrieved {len(people)} people"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve people: {str(e)}"
        )