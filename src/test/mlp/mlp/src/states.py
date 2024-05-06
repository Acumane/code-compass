import numpy as np

class QuantumState:
    def __init__(self, state_vector):
        self.state_vector = np.array(state_vector, dtype=complex)
        self._validate()

    def _validate(self):
        if not np.isclose(np.linalg.norm(self.state_vector), 1):
            raise ValueError("State vector must be normalized.")

    def measure(self):
        probabilities = np.abs(self.state_vector) ** 2
        return np.random.choice(len(self.state_vector), p=probabilities)

class QuantumStateManager:
    def __init__(self):
        self.states = {}

    def add_state(self, name, state_vector):
        self.states[name] = QuantumState(state_vector)

    def measure_state(self, name):
        if name in self.states:
            return self.states[name].measure()
        else:
            raise ValueError("Unknown quantum state.")
