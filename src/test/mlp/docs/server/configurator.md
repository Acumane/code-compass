---
layout: default
title: configurator.py
parent: Server
---


# `mlp/src/configurator.py`
## Overview:
This Python code snippet defines a meta-class `MetaConfig` and a class `AppConfig` that uses `MetaConfig` as its metaclass. This design pattern is primarily used for creating configurable application settings where configurations are expected to be unique, accessible globally, and modifiable at runtime.

### `MetaConfig` (class):
**Description:** `MetaConfig` is a metaclass used to create singleton configuration instances. This ensures that each configuration class defined with `MetaConfig` as its metaclass will have only one instance throughout the application lifecycle.

**Attributes:**
- `_configurations`: a class-level dictionary that stores instances of configuration classes. The keys are the names of the configuration classes, and the values are the singleton instances.

**Methods:**
- `__new__`: this is the constructor method for creating new instances of classes defined with `MetaConfig`. When a new class instance is created, this method adds the instance to the _`configurations` dictionary and ensures that only one instance of each configuration class is created.
- `get_config`: a class method that retrieves a configuration instance from the `_configurations` dictionary based on the configuration class name. If the configuration does not exist, it returns `None`.

### `AppConfig` (class):
**Description:** `AppConfig` serves as a base class for application configuration classes. Instances of subclasses of `AppConfig` are intended to store various configuration settings.

**Metaclass:** `MetaConfig`. This association makes `AppConfig` and its subclasses follow the singleton pattern through `MetaConfig`.

**Methods:**
- `__init__`: the constructor method that initializes a new configuration instance. It takes keyword arguments and sets them as attributes of the instance, allowing for dynamic creation of configuration properties.
- `dynamic_update`: this method allows for the dynamic update of existing configuration properties. It accepts a dictionary of updates, where keys are configuration property names, and values are the new values for these properties. If the specified property exists, it updates the property; otherwise, it raises an AttributeError indicating that the configuration is unknown
