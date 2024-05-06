import ast
import inspect

def modify_function(func):
    src = inspect.getsource(func)
    parsed = ast.parse(src)
    for node in ast.walk(parsed):
        if isinstance(node, ast.FunctionDef):
            new_node = ast.copy_location(ast.Return(value=ast.Str(s="Modified return value")), node)
            node.body = [new_node]
    compiled = compile(parsed, filename="<ast>", mode="exec")
    local_namespace = {}
    exec(compiled, globals(), local_namespace)
    return local_namespace[func.__name__]
