import streamlit as st
from ui.layout import render_layout
from core.router import route_query

st.set_page_config(page_title="OSINT Super App", layout="wide")
render_layout()

query = st.session_state.get("query")
category = st.session_state.get("category")

if query and category:
    with st.spinner("Running OSINT modules..."):
        results = route_query(category, query)

    st.subheader("Results")
    for tool, output in results.items():
        st.markdown(f"### 🔹 {tool}")
        st.json(output)
