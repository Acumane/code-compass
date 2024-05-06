---
layout: default
title: coordinator.py
parent: Server
---

# `mlp/src/coordinator.py`
## Overview:
This Python code defines a class, `AsyncEventCoordinator`, which facilitates asynchronous event handling in Python applications using the `asyncio` library. The class is designed to manage events and their associated asynchronous listeners, allowing for the subscription of asynchronous callback functions to specific events and the subsequent publishing of those events to all subscribed listeners.

### `AsyncEventCoordinator` (class):
**Attributes:**
- `listeners`: a dictionary that maps event names to lists of listener functions. It uses `defaultdict` from the collections module to automatically initialize new event categories with empty lists, ensuring that each event has a list of listeners even if it hasn't been subscribed to yet.

**Methods:**
- `__init__`: the constructor initializes the `AsyncEventCoordinator` instance with an empty listeners dictionary, setting the stage for event subscription and publishing.
- `publish_event`: an asynchronous method that takes an event name (`event_name`) and arbitrary arguments (`*args` and `**kwargs`). When this method is called, it checks if there are any listeners subscribed to the specified event. If there are, it concurrently invokes all the subscribed listener functions asynchronously using `asyncio.gather`. This allows all listeners for an event to be notified and executed in parallel, improving the efficiency of event handling in asynchronous applications.
- `subscribe_to_event`: this method allows the subscription of a listener function to a specific event. It takes two parameters: the name of the event (`event_name`) and the listener function (`listener`). The method checks if the provided listener is an asynchronous function using `asyncio.iscoroutinefunction`. If the listener is asynchronous, it is appended to the list of listeners for the specified event. If not, a TypeError is raised, ensuring that all listeners can be executed asynchronously when an event is published.
