from registry.registry_loader import get_tools_by_category
from core.executor import execute_tool

def route_query(category, query):
    results = {}
    for tool in get_tools_by_category(category):
        results[tool['name']] = execute_tool(tool, query)
    return results
