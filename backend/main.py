from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.core.config import settings
import importlib
import os
from typing import Dict, Any, get_type_hints, List
from backend.core.utils import execute_snippet
import ast
import inspect
from pathlib import Path

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API for Python Snippets",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Dynamically load snippets and create endpoints
def load_snippets():
    snippets_dir = os.path.join(os.path.dirname(__file__), "snippets")
    
    # Get all Python files in the snippets directory
    snippet_files = [
        f[:-3] for f in os.listdir(snippets_dir)
        if f.endswith('.py') and not f.startswith('__')
    ]
    
    # Create endpoints for each snippet
    for snippet_name in snippet_files:
        try:
            # Import the snippet module
            module = importlib.import_module(f"backend.snippets.{snippet_name}")
            
            # Create a closure to capture the snippet_name
            def create_endpoint(name: str):
                @app.post(f"/api/snippets/{name}")
                async def execute_snippet_endpoint(params: Dict[str, Any]):
                    try:
                        result = await execute_snippet(name, params)
                        return result
                    except Exception as e:
                        raise HTTPException(status_code=400, detail=str(e))
                return execute_snippet_endpoint
            
            # Create the endpoint with the correct name
            endpoint = create_endpoint(snippet_name)
            
            print(f"Loaded snippet: {snippet_name}")
            
        except Exception as e:
            print(f"Error loading snippet {snippet_name}: {str(e)}")

# Load snippets when the app starts
@app.on_event("startup")
async def startup_event():
    load_snippets()

def get_type_name(type_hint) -> str:
    """Extract a readable type name from a type hint."""
    import typing
    
    if hasattr(type_hint, "__origin__"):
        # Handle Union, List, etc.
        if type_hint.__origin__ is typing.Union:
            return " | ".join(get_type_name(t) for t in type_hint.__args__)
        return f"{type_hint.__origin__.__name__}[{', '.join(get_type_name(arg) for arg in type_hint.__args__)}]"
    
    return getattr(type_hint, "__name__", str(type_hint))

def get_snippet_dependencies(module) -> List[str]:
    """Extract snippet dependencies by analyzing the code."""
    try:
        source = inspect.getsource(module.execute)
        tree = ast.parse(source)
        
        dependencies = []
        for node in ast.walk(tree):
            # Look for execute_snippet calls
            if (isinstance(node, ast.Call) and 
                isinstance(node.func, ast.Name) and 
                node.func.id == 'execute_snippet'):
                # Get the first argument (snippet name)
                if node.args and isinstance(node.args[0], ast.Constant):
                    dependencies.append(node.args[0].value)
        
        return dependencies
    except:
        return []

@app.get("/api/snippets")
async def list_snippets():
    snippets_dir = os.path.join(os.path.dirname(__file__), "snippets")
    snippets = []
    
    for f in os.listdir(snippets_dir):
        if f.endswith('.py') and not f.startswith('__'):
            snippet_name = f[:-3]
            module = importlib.import_module(f"backend.snippets.{snippet_name}")
            doc = module.execute.__doc__ or "No documentation available"
            
            # Get dependencies
            dependencies = get_snippet_dependencies(module)
            
            # Get type hints from the execute function
            type_hints = get_type_hints(module.execute)
            params_type = type_hints['params'].__annotations__ if 'params' in type_hints else {}
            return_type = type_hints.get('return', 'Any')
            
            snippets.append({
                "name": snippet_name,
                "description": doc.strip(),
                "endpoint": f"/api/snippets/{snippet_name}",
                "params": {
                    name: get_type_name(param_type)
                    for name, param_type in params_type.items()
                },
                "return_type": get_type_name(return_type),
                "dependencies": dependencies
            })
    
    return {"snippets": snippets}

@app.get("/api/snippets/{name}/code")
async def get_snippet_code(name: str):
    try:
        # Get the absolute file path using the current file's location
        current_dir = os.path.dirname(os.path.abspath(__file__))
        snippet_path = os.path.join(current_dir, "snippets", f"{name}.py")
        
        if not os.path.exists(snippet_path):
            raise HTTPException(status_code=404, detail=f"Snippet {name} not found")
            
        # Read the file content
        with open(snippet_path, "r") as f:
            code = f.read()
            
        return {"code": code}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 