from utils.http import run_api, run_web

def execute_tool(tool, query):
    m = tool['integration']['method']
    if m == 'api': return run_api(tool, query)
    if m == 'web': return run_web(tool, query)
    return {'status': 'unsupported'}
