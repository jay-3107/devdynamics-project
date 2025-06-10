from decimal import Decimal
from typing import Any, Dict, List, Union

def convert_decimal_to_float(obj: Any) -> Any:
    """Convert Decimal objects to float for MongoDB compatibility"""
    if isinstance(obj, Decimal):
        return float(obj)
    elif isinstance(obj, dict):
        return {k: convert_decimal_to_float(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_decimal_to_float(item) for item in obj]
    else:
        return obj