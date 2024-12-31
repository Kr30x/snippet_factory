from typing import Any, Dict
import inspect

async def execute_snippet(snippet_name: str, params: Dict[str, Any]) -> Any:
    """Execute a snippet by name and return its result."""
    import importlib
    
    try:
        module = importlib.import_module(f"backend.snippets.{snippet_name}")
        # Check if the execute function is async
        if inspect.iscoroutinefunction(module.execute):
            result = await module.execute(params)
        else:
            result = module.execute(params)
        return result
    except Exception as e:
        raise ValueError(f"Failed to execute snippet {snippet_name}: {str(e)}") 