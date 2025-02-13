from manager.fasterwhisperManager import FasterWhisperManager
from manager.llamacppManager import LlamaCppManager
from manager.bertManager import DistilBertManager
from utils import *

class ModelLoader():
    '''
    The ModelLoader class is used to manage the loading and unloading of models in memory while keeping track of the models that are currently active.
    '''

    def __init__(self):
        self.__loaded_models = {}   # key-value pair mapping the type of model being loaded to its corresponding variable.

    # model loading functions
    def load_asr(self, model, device, batch_size, compute_type):
        model_key = "ASR"

        if model_key not in self.__loaded_models or self.__loaded_models[model_key].get_model() != model:
            self.del_models(model_key)
            self.__loaded_models[model_key] = FasterWhisperManager(model, device, batch_size, compute_type)

        return self.__loaded_models.get(model_key)  
    
    def load_llm(self, model, device):
        model_key = "LLM"

        if model_key not in self.__loaded_models or self.__loaded_models[model_key].get_model() != model:
            self.del_models(model_key)
            self.__loaded_models[model_key] = LlamaCppManager(model, device)
        
        return self.__loaded_models.get(model_key)
    
    def load_bert(self):
        model_key = "BERT"

        if model_key not in self.__loaded_models:
            self.del_models(model_key)
            self.__loaded_models[model_key] = DistilBertManager()
        
        return self.__loaded_models.get(model_key)
    
    # retrieve model with key
    def get_model(self, model_key):
        return self.__loaded_models.get(model_key)
    
    # delete models with keys
    def del_models(self, *model_keys):
        for key in model_keys:
            if key in self.__loaded_models:
                del self.__loaded_models[key]  # Remove model from dictionary
        free_memory()

    # delete all models currently loaded
    def del_all_models(self):
        self.__loaded_models.clear()
        free_memory()

        return self