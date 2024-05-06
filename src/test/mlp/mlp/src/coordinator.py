import asyncio
from collections import defaultdict

class AsyncEventCoordinator:
    def __init__(self):
        self.listeners = defaultdict(list)

    async def publish_event(self, event_name, *args, **kwargs):
        if event_name in self.listeners:
            await asyncio.gather(*(listener(*args, **kwargs) for listener in self.listeners[event_name]))

    def subscribe_to_event(self, event_name, listener):
        if asyncio.iscoroutinefunction(listener):
            self.listeners[event_name].append(listener)
        else:
            raise TypeError("Listener must be an asynchronous function.")
