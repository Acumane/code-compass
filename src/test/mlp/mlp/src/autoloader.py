import os
import sys
import importlib

class MetaAutoloader(type):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

class Autoloader(metaclass=MetaAutoloader):
    def __init__(self, base_package):
        self.base_package = base_package

    def autoload(self):
        for root, dirs, files in os.walk(self.base_package.replace('.', '/')):
            for file in files:
                if file.endswith('.py') and not file.startswith('__'):
                    module_name = os.path.join(root, file)[:-3].replace('/', '.')
                    self._import_module(module_name)

    def _import_module(self, module_name):
        if module_name not in sys.modules:
            importlib.import_module(module_name)
