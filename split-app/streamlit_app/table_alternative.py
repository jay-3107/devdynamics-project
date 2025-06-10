import streamlit as st
import pandas as pd
from typing import Dict, List, Any, Callable

def display_expense_table_alternative(expenses: List[Dict], on_edit, on_delete):
    """Alternative implementation of expense table using DataFrames"""
    if not expenses:
        st.info("No expenses found.")
        return
    
    # Create a DataFrame for the main data
    data = []
    for i, expense in enumerate(expenses):
        data.append({
            "ID": expense["_id"],
            "Amount": f"₹ {expense['amount']:.2f}",
            "Description": expense["description"],
            "Paid By": expense["paid_by"],
            "Split Type": expense["split_type"],
            "Participants": ", ".join(expense["participants"]),
            "Edit": f"edit_{i}",   # These are just placeholders
            "Delete": f"delete_{i}"  # for the button columns
        })
    
    df = pd.DataFrame(data)
    
    # Create columns for the buttons
    edit_buttons = []
    delete_buttons = []
    
    # Display the DataFrame (without action columns)
    display_df = df.drop(columns=["ID", "Edit", "Delete"])
    st.dataframe(display_df, use_container_width=True, hide_index=True)
    
    # Create a separate area for actions with expense names for clarity
    st.subheader("Expense Actions")
    
    # Create a 3-column layout for each expense
    for i in range(0, len(expenses), 3):
        cols = st.columns(3)
        for j in range(3):
            if i+j < len(expenses):
                expense = expenses[i+j]
                with cols[j]:
                    st.write(f"**{expense['description']}** (₹ {expense['amount']:.2f})")
                    edit_col, delete_col = st.columns(2)
                    with edit_col:
                        if st.button("Edit", key=f"edit_{expense['_id']}"):
                            on_edit(expense)
                    with delete_col:
                        if st.button("Delete", key=f"delete_{expense['_id']}"):
                            on_delete(expense["_id"])