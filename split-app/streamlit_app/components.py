import streamlit as st
from typing import Dict, List, Optional, Any, Callable
import pandas as pd
import numpy as np

def display_expense_form(
    on_submit: Callable,
    people: List[Dict] = None,
    expense_data: Dict = None,
    is_update: bool = False
):
    """Display form for adding or updating an expense"""
    # Use different form keys for add vs edit
    form_key = "edit_expense_form" if is_update else "add_expense_form"
    
    # Get existing people names
    existing_people = []
    if people:
        existing_people = [p["name"] for p in people]
    
    # Initialize split type in session state (outside form)
    if f"{form_key}_split_type" not in st.session_state:
        default_split_type = expense_data.get("split_type", "equal") if expense_data else "equal"
        st.session_state[f"{form_key}_split_type"] = default_split_type
    
    # Handle split type selection outside the form
    st.subheader("Split Type Selection")
    split_types = ["equal", "percentage", "exact"]
    current_split_type = st.session_state[f"{form_key}_split_type"]
    split_type_index = split_types.index(current_split_type) if current_split_type in split_types else 0
    
    # This selection is outside the form
    split_type = st.selectbox(
        "How to split the expense",
        options=split_types,
        index=split_type_index,
        key=f"{form_key}_split_select"
    )
    
    # Update session state with current selection
    st.session_state[f"{form_key}_split_type"] = split_type
    
    # Now begin the form
    with st.form(key=form_key):
        # Form fields with default values if updating
        amount = st.number_input(
            "Amount",
            min_value=0.01,
            value=float(expense_data.get("amount", 100)) if expense_data else 100.0,
            step=10.0,
            format="%.2f"
        )
        
        description = st.text_input(
            "Description",
            value=expense_data.get("description", "") if expense_data else ""
        )
        
        # Paid by field - simple dropdown with option for new person
        st.subheader("Who paid?")
        
        # Create combined list with option for new person
        payer_options = ["Add new person"] + existing_people
        
        # Get default index
        default_paid_by = expense_data.get("paid_by", "") if expense_data else ""
        default_index = 0  # Default to "Add new person"
        if default_paid_by in existing_people:
            default_index = existing_people.index(default_paid_by) + 1
        
        # Payer selection
        paid_by_selection = st.selectbox(
            "Select payer",
            options=payer_options,
            index=default_index,
            key=f"{form_key}_payer_select"
        )
        
        # Text input for new payer if needed
        if paid_by_selection == "Add new person":
            paid_by = st.text_input(
                "New payer name",
                value="",
                key=f"{form_key}_new_payer"
            )
        else:
            paid_by = paid_by_selection
        
        # Participants section
        st.subheader("Who's involved?")
        
        # Default participants from expense data
        default_participants = expense_data.get("participants", []) if expense_data else []
        
        # Multiselect for existing participants
        selected_existing = st.multiselect(
            "Select existing participants",
            options=existing_people,
            default=[p for p in default_participants if p in existing_people],
            key=f"{form_key}_existing_participants"
        )
        
        # Text input for new participants
        new_participant = st.text_input(
            "Add a new participant (optional)",
            key=f"{form_key}_new_participant",
            help="Type a name for a participant not in the list"
        )
        
        # Create final participants list
        participants = selected_existing.copy()
        
        # Add new participant if provided
        if new_participant:
            if new_participant not in participants:
                participants.append(new_participant)
        
        # Always ensure payer is included
        if paid_by and paid_by != "Add new person" and paid_by not in participants:
            participants.append(paid_by)
        
        # Use split type from session state, not from inside the form
        current_split = st.session_state[f"{form_key}_split_type"]
        
        # Show current participants and split type
        st.markdown(f"**Split type:** {current_split}")
        
        if participants:
            st.markdown("**Current participants:**")
            st.info(", ".join(participants))
        else:
            st.warning("No participants selected yet")
        
        # Custom split inputs based on split type from session state
        custom_split = {}
        if current_split in ["percentage", "exact"] and participants:
            st.subheader(f"{current_split.capitalize()} Split Values")
            
            # Get existing split values if available
            existing_split = expense_data.get("custom_split", {}) if expense_data else {}
            
            # Setup variables based on split type
            if current_split == "percentage":
                default_value = 100.0 / max(len(participants), 1)
                total_expected = 100.0
                unit = "%"
                step = 1.0
            else:  # exact
                default_value = amount / max(len(participants), 1)
                total_expected = amount
                unit = "₹"
                step = 10.0
            
            total = 0.0
            
            # Create input fields for each participant's share
            for i, participant in enumerate(participants):
                # Set default value from existing data or calculate evenly
                if participant in existing_split:
                    value = float(existing_split[participant])
                else:
                    value = default_value
                
                # Create a number input for this participant's share
                share = st.number_input(
                    f"{participant} ({unit})",
                    min_value=0.0,
                    value=value,
                    step=step,
                    format="%.2f",
                    key=f"{form_key}_{i}_{current_split}"  # Use index instead of name for safer keys
                )
                
                custom_split[participant] = share
                total += share
            
            # Show validation status for split totals
            st.markdown("**Split Validation:**")
            if abs(total - total_expected) > 0.01:
                if current_split == "percentage":
                    st.warning(f"⚠️ Percentages should add up to 100%. Current total: {total:.2f}%")
                else:
                    st.warning(f"⚠️ Amounts should add up to {amount:.2f}. Current total: {total:.2f}")
            else:
                st.success(f"✓ Split values are correct! Total: {total:.2f} {unit}")
        elif current_split == "equal":
            # For equal split, just show a message
            st.info("The expense will be split equally among all participants.")
        
        # Submit button 
        submit_label = "Update Expense" if is_update else "Add Expense"
        submitted = st.form_submit_button(submit_label)
        
        if submitted:
            # Validation
            if not description:
                st.error("Please enter a description.")
                return
                
            if not paid_by or paid_by == "Add new person":
                st.error("Please specify who paid.")
                return
                
            if not participants:
                st.error("Please select at least one participant.")
                return
                
            # Validate custom splits
            if current_split == "percentage" and custom_split:
                total_pct = sum(custom_split.values())
                if abs(total_pct - 100) > 0.01:
                    st.error(f"Percentages must add up to 100%. Current total: {total_pct:.2f}%")
                    return
                    
            if current_split == "exact" and custom_split:
                total_amt = sum(custom_split.values())
                if abs(total_amt - amount) > 0.01:
                    st.error(f"Amounts must add up to {amount:.2f}. Current total: {total_amt:.2f}")
                    return
            
            # Prepare data for submission
            data = {
                "amount": amount,
                "description": description,
                "paid_by": paid_by,
                "split_type": current_split,
                "participants": participants
            }
            
            # Add custom split if applicable
            if current_split in ["percentage", "exact"] and custom_split:
                data["custom_split"] = custom_split
            
            # Call submit handler
            on_submit(data)
            
def display_expense_table(expenses: List[Dict], on_edit, on_delete):
    """Display expenses in a table with edit/delete buttons"""
    if not expenses:
        st.info("No expenses found.")
        return
    
    # Create a DataFrame for display
    data = []
    for expense in expenses:
        data.append({
            "Amount": f"₹ {expense['amount']:.2f}",
            "Description": expense['description'],
            "Paid By": expense['paid_by'],
            "Split Type": expense['split_type'],
            "Participants": ", ".join(expense['participants']),
            "_id": expense["_id"]  # Keep ID for reference but don't display
        })
    
    df = pd.DataFrame(data)
    
    # Use the built-in Streamlit table formatting with custom styling
    st.markdown("""
    <style>
    .stDataFrame {
        border: 2px solid #444;
    }
    .stDataFrame table {
        width: 100%;
        border-collapse: collapse;
    }
    .stDataFrame th {
        background-color: #0E1117;
        color: white;
        font-weight: bold;
        text-align: left;
        padding: 10px;
        border: 1px solid #444;
    }
    .stDataFrame td {
        padding: 8px;
        border: 1px solid #333;
    }
    .stDataFrame tr:hover {
        background-color: rgba(100, 100, 100, 0.2);
    }
    </style>
    """, unsafe_allow_html=True)
    
    # Display the table without the ID column
    display_df = df.drop(columns=["_id"])
    st.dataframe(display_df, use_container_width=True, hide_index=True)
    
    # Create action buttons in a structured grid
    st.subheader("Expense Actions")
    
    # Create a grid of expense action buttons
    cols_per_row = 3
    for i in range(0, len(expenses), cols_per_row):
        cols = st.columns(cols_per_row)
        for j in range(cols_per_row):
            idx = i + j
            if idx < len(expenses):
                expense = expenses[idx]
                with cols[j]:
                    st.markdown(f"""
                    <div style="
                        padding: 10px;
                        border: 1px solid #444;
                        border-radius: 5px;
                        margin-bottom: 10px;
                        background-color: rgba(100, 100, 100, 0.1);
                    ">
                        <strong>{expense['description']}</strong><br>
                        ₹ {expense['amount']:.2f} | Paid by: {expense['paid_by']}
                    </div>
                    """, unsafe_allow_html=True)
                    
                    edit_col, delete_col = st.columns(2)
                    with edit_col:
                        if st.button("✏️ Edit", key=f"edit_{expense['_id']}"):
                            on_edit(expense)
                    with delete_col:
                        if st.button("🗑️ Delete", key=f"delete_{expense['_id']}"):
                            on_delete(expense["_id"])

def display_settlements(settlements: List[Dict]):
    """Display settlement transactions"""
    if not settlements:
        st.info("No settlements needed. Everyone is square!")
        return
    
    st.subheader("Settlements (Optimized Payments)")
    
    for settlement in settlements:
        st.markdown(
            f"**{settlement['from_person']}** pays **₹ {settlement['amount']:.2f}** to **{settlement['to_person']}**"
        )

def display_balances(balances: List[Dict]):
    """Display balances for all people"""
    if not balances:
        st.info("No balance information available.")
        return
    
    # Prepare data for visualization
    names = []
    balance_values = []
    paid_values = []
    share_values = []
    
    for balance in balances:
        names.append(balance["name"])
        balance_values.append(float(balance["balance"]))
        paid_values.append(float(balance["total_paid"]))
        share_values.append(float(balance["total_share"]))
    
    # Create DataFrame for display
    df = pd.DataFrame({
        "Person": names,
        "Total Paid": [f"₹ {p:.2f}" for p in paid_values],
        "Total Share": [f"₹ {s:.2f}" for s in share_values],
        "Balance": [f"₹ {b:.2f}" for b in balance_values],
        "Status": ["Gets back" if b > 0 else "Owes" if b < 0 else "Settled" for b in balance_values]
    })
    
    st.dataframe(df, use_container_width=True)
    
    # Create bar chart for balances
    balance_chart_data = pd.DataFrame({
        "Person": names,
        "Balance": balance_values
    })
    
    st.bar_chart(balance_chart_data.set_index("Person"))