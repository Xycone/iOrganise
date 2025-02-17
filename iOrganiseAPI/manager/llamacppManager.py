import re

from langchain_community.llms import LlamaCpp

from enums.DeviceTypes import DeviceTypes
from enums.LlmModels import LlmModels

LLM_MODELS = {
    "mistral_7b": ("/app/models/mistral_7b/model.bin", 8192),
    "deepseek_14b": ("/app/models/deepseek_14b/model.bin", 16384)
}

class LlamaCppManager:
    def __init__(self, name: LlmModels, device: DeviceTypes):
        try:
            self.__name = name

            model_path, context_length = LLM_MODELS.get(self.__name)
            llm_params = {
                "model_path": model_path,
                "temperature": 0.4,
                "max_tokens": 2048,
                "n_ctx": context_length
            }

            if device == "cuda":
                llm_params["n_gpu_layers"] = 49
                llm_params["n_batch"] = 512
            
            self.__llm = LlamaCpp(**llm_params)

        except Exception as e:
            raise RuntimeError(f"Error initialising LlamaCppManager: {e}")

    def get_model(self):
        return self.__name
    
    def generate_summary(self, transcript):
        prompt = f"""
        Instructions:
        Provide me with a short summary of what is in Transcript with as little words as possible in bullet point form without adding your own information or repeating any of the Instructions.

        Transcript: 
        {transcript}
        """

        # generate the content summary
        result = self.__llm.invoke(prompt)

        # filter out COT tokens when using deepseek 14b
        if self.__name == "deepseek_14b":
            result = re.sub(r".*</think>", "", result, flags=re.DOTALL).strip()

        return result