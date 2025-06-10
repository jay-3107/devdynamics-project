import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# MongoDB configuration
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "expense_splitter")

# MongoDB clients and collections
client = None
db = None
expense_collection = None

async def init_db():
    """Initialize database connection"""
    global client, db, expense_collection
    
    try:
        client = AsyncIOMotorClient(MONGODB_URI)
        # Validate connection
        await client.admin.command('ping')
        
        # Access database and collections
        db = client[DB_NAME]
        expense_collection = db.expenses
        
        logger.info(f"Connected to MongoDB: {MONGODB_URI}")
        
        # Create indexes for better performance
        await expense_collection.create_index("paid_by")
        
        # Seed initial data if needed (for testing)
        if os.getenv("ENVIRONMENT") == "development":
            await seed_initial_data()
        
        return expense_collection
            
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise

async def get_expense_collection():
    """Get the expense collection, initializing if needed"""
    global expense_collection
    if expense_collection is None:
        await init_db()
    return expense_collection

async def seed_initial_data():
    """Seed initial test data"""
    # Ensure we have the collection
    global expense_collection
    
    # Check if we already have expenses
    count = await expense_collection.count_documents({})
    if count > 0:
        logger.info("Database already has data, skipping seed")
        return
        
    # Sample expenses as per requirements
    expenses = [
        {
            "amount": 600.00,
            "description": "Dinner",
            "paid_by": "Shantanu",
            "split_type": "equal",
            "participants": ["Shantanu", "Sanket", "Om"],
            "custom_split": {}
        },
        {
            "amount": 450.00,
            "description": "Groceries",
            "paid_by": "Sanket",
            "split_type": "equal",
            "participants": ["Shantanu", "Sanket", "Om"],
            "custom_split": {}
        },
        {
            "amount": 300.00,
            "description": "Petrol",
            "paid_by": "Om",
            "split_type": "equal",
            "participants": ["Shantanu", "Sanket", "Om"],
            "custom_split": {}
        },
        {
            "amount": 500.00,
            "description": "Movie Tickets",
            "paid_by": "Shantanu",
            "split_type": "equal",
            "participants": ["Shantanu", "Sanket", "Om"],
            "custom_split": {}
        },
        {
            "amount": 280.00,
            "description": "Pizza",
            "paid_by": "Sanket",
            "split_type": "equal",
            "participants": ["Shantanu", "Sanket", "Om"],
            "custom_split": {}
        }
    ]
    
    await expense_collection.insert_many(expenses)
    logger.info("Seeded initial expense data")

async def close_db():
    """Close database connection"""
    if client:
        client.close()
        logger.info("Closed MongoDB connection")