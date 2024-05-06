class MetaConfig(type):
    _configurations = {}

    def __new__(cls, name, bases, dct):
        instance = super().__new__(cls, name, bases, dct)
        cls._configurations[name] = instance
        return instance

    @classmethod
    def get_config(cls, name):
        return cls._configurations.get(name, None)

class AppConfig(metaclass=MetaConfig):
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

    def dynamic_update(self, updates):
        for key, value in updates.items():
            if hasattr(self, key):
                setattr(self, key, value)
            else:
                raise AttributeError(f"Unknown configuration: {key}")
