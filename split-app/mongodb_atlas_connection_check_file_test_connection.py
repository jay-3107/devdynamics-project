import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from datetime import datetime, timezone

# Load environment variables from .env file
load_dotenv()

async def test_connection():
    # Get connection string from environment variables
    uri = os.getenv("MONGODB_URI")
    # Hide password in log by replacing it with asterisks
    printable_uri = uri.replace(uri.split(':')[2].split('@')[0], '****')
    print(f"Connecting to MongoDB using: {printable_uri}")
    
    try:
        # Create a new client and connect to the server
        client = AsyncIOMotorClient(uri)
        
        # Send a ping to confirm a successful connection
        await client.admin.command('ping')
        print("✅ Connection successful! MongoDB is responding.")
        
        # Print current UTC time
        now = datetime.now(timezone.utc)
        formatted_time = now.strftime('%Y-%m-%d %H:%M:%S')
        print(f"Current UTC time: {formatted_time}")
        
        # List available databases
        db_names = await client.list_database_names()
        print(f"Available databases: {db_names}")
        
        # Check if our database exists
        db_name = os.getenv("DB_NAME", "expense_splitter")
        if db_name in db_names:
            print(f"Database '{db_name}' exists")
            
            # Count documents in collections
            db = client[db_name]
            collections = await db.list_collection_names()
            print(f"Collections in {db_name}: {collections}")
            
            for collection in collections:
                count = await db[collection].count_documents({})
                print(f"  - {collection}: {count} documents")
        else:
            print(f"Database '{db_name}' will be created when data is first inserted")
        
        return True
    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")
        return False

# Run the async function
if __name__ == "__main__":
    asyncio.run(test_connection())