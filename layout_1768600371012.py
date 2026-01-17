import streamlit as st

def render_layout():
    st.title('OSINT Super App')
    st.session_state['category'] = st.sidebar.selectbox('Category',['Username','Email','Domain','IP'])
    st.session_state['query'] = st.sidebar.text_input('Target')
