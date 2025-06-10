import requests
from typing import Dict, List, Optional, Any
import logging

logger = logging.getLogger(__name__)

class ExpenseSplitterClient:
    """Client for interacting with the Expense Splitter API"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        """Initialize with the base URL of the API"""
        self.base_url = base_url
        
    def _handle_response(self, response: requests.Response) -> Dict:
        """Handle API response and errors"""
        try:
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            error_msg = f"HTTP Error: {e}"
            try:
                error_detail = response.json().get("detail", "No detail provided")
                error_msg = f"{error_msg} - {error_detail}"
            except:
                pass
            logger.error(error_msg)
            raise Exception(error_msg)
        except Exception as e:
            logger.error(f"Error processing response: {e}")
            raise
    
    # Expense Management
    
    def get_expenses(self, skip: int = 0, limit: int = 100) -> List[Dict]:
        """Get all expenses"""
        url = f"{self.base_url}/expenses"
        params = {"skip": skip, "limit": limit}
        response = requests.get(url, params=params)
        data = self._handle_response(response)
        return data.get("data", [])
    
    def create_expense(self, expense_data: Dict) -> Dict:
        """Create a new expense"""
        url = f"{self.base_url}/expenses"
        # Make sure none of the values are None
        clean_data = {k: v for k, v in expense_data.items() if v is not None}
        
        try:
            response = requests.post(url, json=clean_data)
            data = self._handle_response(response)
            return data.get("data", {})
        except Exception as e:
            logging.error(f"Error creating expense: {e}")
            raise
    
    def update_expense(self, expense_id: str, expense_data: Dict) -> Dict:
        """Update an existing expense"""
        url = f"{self.base_url}/expenses/{expense_id}"
        # Make sure none of the values are None
        clean_data = {k: v for k, v in expense_data.items() if v is not None}
        
        try:
            response = requests.put(url, json=clean_data)
            data = self._handle_response(response)
            return data.get("data", {})
        except Exception as e:
            logging.error(f"Error updating expense: {e}")
            raise
    
    def delete_expense(self, expense_id: str) -> bool:
        """Delete an expense"""
        url = f"{self.base_url}/expenses/{expense_id}"
        response = requests.delete(url)
        data = self._handle_response(response)
        return data.get("success", False)
    
    # People
    
    def get_people(self) -> List[Dict]:
        """Get all people"""
        url = f"{self.base_url}/people"
        response = requests.get(url)
        data = self._handle_response(response)
        return data.get("data", [])
    
    # Settlements
    
    def get_balances(self) -> List[Dict]:
        """Get balances for all people"""
        url = f"{self.base_url}/balances"
        response = requests.get(url)
        data = self._handle_response(response)
        return data.get("data", [])
    
    def get_settlements(self) -> List[Dict]:
        """Get optimized settlement transactions"""
        url = f"{self.base_url}/settlements"
        response = requests.get(url)
        data = self._handle_response(response)
        return data.get("data", [])