import json

def get_tools_by_category(category):
    with open('registry/tools.json') as f:
        tools = json.load(f)['tools']
    return [t for t in tools if t['category'].lower()==category.lower()]
