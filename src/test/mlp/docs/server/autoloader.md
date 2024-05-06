---
layout: default
title: autoloader.py
parent: Server
---

# `mlp/src/autoloader.py`
## Overview:
This Python script defines a mechanism for automatic module loading, often referred to as an autoloader. The purpose of this mechanism is to dynamically load and import all Python modules from a specified base package at runtime. This can be particularly useful in large projects to ensure all necessary modules are loaded without needing explicit import statements for each one.

### `MetaAutoloader` (metaclass):
**Description:** implements the Singleton design pattern at the class level. This ensures that any instance of a class that uses `MetaAutoloader` as its metaclass will be a singleton, meaning that only one instance of such a class can exist.

**Attributes:**
- `_instances`: A class-level dictionary holding references to instances of classes that use this metaclass, ensuring that only one instance per class is created.

**Methods:**
- `__call__`: Overrides the default `__call__` to check if an instance of the class already exists in the `_instances` dictionary before creating a new one, ensuring the singleton behavior.

### `Autoloader` (class):
**Description:** provides functionality to automatically find and import all Python modules from a given base package directory. This class is particularly useful for large-scale projects to automate module loading. Defined with `MetaAutoloader` as its metaclass.

**Attributes:**
- `base_package`: A string representing the base package from which modules will be auto-loaded.

**Methods:**
- `__init__(self, base_package)`: constructor that initializes the Autoloader instance with the specified base package.
- `autoload(self)`: scans through the base_package directory, and all its subdirectories, for Python files (excluding `__init__.py`) and attempts to import them as modules.
- `_import_module(self, module_name)`: a helper method used by autoload() to import a module if it hasn't already been imported. This method takes the fully qualified name of the module as its argument.