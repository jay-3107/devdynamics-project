import streamlit as st
import pandas as pd
from datetime import datetime
import json
import logging
from typing import Dict, List, Optional

from api_client import ExpenseSplitterClient
import components
from table_alternative import display_expense_table_alternative

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize API client
@st.cache_resource
def get_api_client():
    """Get cached API client"""
    return ExpenseSplitterClient(base_url="http://localhost:8000")

def main():
    # Page configuration
    st.set_page_config(
        page_title="Expense Splitter",
        page_icon="💰",
        layout="wide",
        initial_sidebar_state="expanded"
    )
    
    # Initialize client
    client = get_api_client()
    
    # App title and description
    st.title("💰 Expense Splitter")
    st.markdown(
        """
        Split expenses among friends, roommates, or travel buddies fairly and easily.
        Keep track of who paid for what and calculate settlements automatically.
        """
    )
    
    # Navigation
    page = st.sidebar.radio(
        "Navigate",
        ["Expenses", "Balances & Settlements", "About"]
    )
    
    # Settings
    with st.sidebar.expander("Settings"):
        table_style = st.radio(
            "Table Style",
            ["Standard", "Alternative"],
            index=0,
            help="Choose how expenses are displayed"
        )
    
    # Initialize session state for editing if not exists
    if 'editing_expense' not in st.session_state:
        st.session_state.editing_expense = None
    
    try:
        # Get people data for forms
        people = client.get_people()
        
        # Show current page
        if page == "Expenses":
            show_expenses_page(client, people, table_style)
        elif page == "Balances & Settlements":
            show_settlements_page(client)
        else:  # About
            show_about_page()
    
    except Exception as e:
        st.error(f"Error connecting to API: {str(e)}")
        st.info("Make sure the FastAPI backend is running at http://localhost:8000")

def show_expenses_page(client, people, table_style="Standard"):
    """Display expenses management page"""
    st.header("Manage Expenses")
    
    # Show editing form first if we're editing
    if st.session_state.editing_expense:
        st.subheader(f"Edit Expense: {st.session_state.editing_expense['description']}")
        
        def on_submit_update(data):
            try:
                # Debug the data to ensure it's correct
                st.write("Submitting update:", data)
                
                expense_id = st.session_state.editing_expense["_id"]
                client.update_expense(expense_id, data)
                st.success("Expense updated successfully!")
                # Clear editing state
                st.session_state.editing_expense = None
                st.rerun()
            except Exception as e:
                st.error(f"Failed to update expense: {str(e)}")
        
        components.display_expense_form(
            on_submit=on_submit_update,
            people=people,
            expense_data=st.session_state.editing_expense,
            is_update=True
        )
        
        if st.button("Cancel Editing"):
            st.session_state.editing_expense = None
            st.rerun()
            
        # Add a separator
        st.markdown("---")
    
    # Create tabs for List vs. Add
    tab1, tab2 = st.tabs(["📋 Expenses List", "➕ Add New Expense"])
    
    with tab1:
        # Display expenses
        st.subheader("All Expenses")
        
        # Add refresh button
        if st.button("Refresh Expenses"):
            st.rerun()
        
        try:
            # Get expenses from API
            expenses = client.get_expenses()
            
            # Define callbacks
            def on_edit_expense(expense):
                st.session_state.editing_expense = expense
                st.rerun()
                
            def on_delete_expense(expense_id):
                if client.delete_expense(expense_id):
                    st.success(f"Expense deleted successfully.")
                    st.rerun()
                else:
                    st.error("Failed to delete expense.")
            
            # Display expense table based on selected style
            if table_style == "Alternative":
                display_expense_table_alternative(expenses, on_edit_expense, on_delete_expense)
            else:
                components.display_expense_table(expenses, on_edit_expense, on_delete_expense)
        except Exception as e:
            st.error(f"Error loading expenses: {str(e)}")
    
    with tab2:
        # Add new expense form
        st.subheader("Add New Expense")
        
        def on_submit_new_expense(data):
            try:
                # Debug the data to ensure it's correct
                st.write("Submitting new expense:", data)
                
                client.create_expense(data)
                st.success("Expense added successfully!")
                # Clear form by rerunning
                st.rerun()
            except Exception as e:
                st.error(f"Failed to add expense: {str(e)}")
        
        components.display_expense_form(
            on_submit=on_submit_new_expense,
            people=people
        )

def show_settlements_page(client):
    """Display balances and settlements page"""
    st.header("Balances & Settlements")
    
    # Add refresh button
    if st.button("Refresh Data"):
        st.rerun()
    
    # Create two columns
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Current Balances")
        balances = client.get_balances()
        components.display_balances(balances)
    
    with col2:
        st.subheader("Settlements")
        settlements = client.get_settlements()
        components.display_settlements(settlements)

def show_about_page():
    """Display about page with info about the app"""
    st.header("About Expense Splitter")
    
    st.markdown("""
    ### How It Works
    
    **Expense Splitter** helps groups of people split expenses fairly by:
    
    1. **Tracking expenses** - Record who paid for what
    2. **Supporting different split types**:
       - Equal splits among participants
       - Percentage splits where each person owes a specific percentage
       - Exact amount splits where specific amounts are assigned
    3. **Calculating balances** - Shows who owes money and who should receive money
    4. **Optimizing settlements** - Minimizing the number of transactions needed
    
    ### Features
    
    - **Add, edit, and delete expenses**
    - **View expenses** in a clear tabular format
    - **Split expenses** equally, by percentage, or exact amounts
    - **Calculate optimized settlements** to minimize transactions
    - **View balances** with insightful visualizations
    
    ### Technologies Used
    
    - **Frontend**: Streamlit
    - **Backend**: FastAPI
    - **Database**: MongoDB
    
    ### Made by
    
    This app was created as part of a development assignment.
    """)

if __name__ == "__main__":
    main()