import inspect
from typing import get_type_hints

class Injector:
    _registry = {}

    @staticmethod
    def register(interface, implementation):
        Injector._registry[interface] = implementation

    @staticmethod
    def resolve(interface):
        if interface in Injector._registry:
            implementation = Injector._registry[interface]
            sig = inspect.signature(implementation.__init__)
            params = sig.parameters
            kwargs = {name: Injector.resolve(param.annotation) for name, param in params.items() if name != 'self' and param.annotation in Injector._registry}
            return implementation(**kwargs)
        else:
            raise ValueError(f"No implementation registered for {interface}")
