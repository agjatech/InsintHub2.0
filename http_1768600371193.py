import requests

def run_api(tool, query):
    url = tool['integration']['url'].replace('<query>', query)
    try:
        r = requests.get(url, timeout=10)
        return r.json() if r.ok else {'error': r.text}
    except Exception as e:
        return {'error': str(e)}

def run_web(tool, query):
    return {'url': tool['integration']['url'].replace('<query>', query)}
