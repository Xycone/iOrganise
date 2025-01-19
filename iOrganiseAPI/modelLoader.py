from manager.whisperXManager import WhisperXManager
from manager.llamacppManager import LlamaCppManager
from utils import *

from enums.deviceTypes import DeviceTypes
from enums.asrModels import AsrModels
from enums.llmModels import LlmModels

class ModelLoader():
    '''
    The ModelLoader class is used to manage the loading and unloading of models in memory while keeping track of the models that are currently active.
    '''

    def __init__(self, model: AsrModels, device: DeviceTypes, batch_size, compute_type):
        self.__loaded_models = {}   # key-value pair mapping the type of model being loaded to its corresponding variable.
        self.load_asr(model, device, batch_size, compute_type)

    # model loading functions
    def load_asr(self, model: AsrModels, device: DeviceTypes, batch_size, compute_type):
        model_key = "ASR"

        if model_key not in self.__loaded_models or self.__loaded_models[model_key].get_model() != model:
            self.del_models(model_key)
            self.__loaded_models[model_key] = WhisperXManager(model, device, batch_size, compute_type)

        return self.__loaded_models.get(model_key)  
    
    def load_llm(self, model: LlmModels, device: DeviceTypes):
        model_key = "LLM"

        if model_key not in self.__loaded_models or self.__loaded_models[model_key].get_model() != model:
            self.del_models(model_key)
            self.__loaded_models[model_key] = LlamaCppManager(model, device)
        
        return self.__loaded_models.get(model_key)
    
    # retrieve model with key
    def get_model(self, model_key):
        return self.__loaded_models.get(model_key)
    
    # delete models with keys
    def del_models(self, *model_keys):
        for key in model_keys:
            if key in self.__loaded_models:
                del self.__loaded_models[key]
        free_memory()

    # delete all models currently loaded
    def del_all_models(self):
        self.__loaded_models.clear()
        free_memory()

        return self