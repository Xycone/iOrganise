from enum import Enum

class DeviceTypes(str, Enum):
    cpu = "cpu"
    cuda = "cuda"    