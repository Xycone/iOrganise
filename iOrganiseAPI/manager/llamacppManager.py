import re

from langchain_community.llms import LlamaCpp

from enums.deviceTypes import DeviceTypes
from enums.llmModels import LlmModels

LLM_MODELS = {
    "mistral_7b": ("/app/models/mistral_7b/model.bin", 8192),
    "deepseek_14b": ("/app/models/deepseek_14b/model.bin", 8192)
}

class LlamaCppManager:
    def __init__(self, name: LlmModels, device: DeviceTypes):
        try:
            self.__name = name

            model_path, context_length = LLM_MODELS.get(self.__name)
            llm_params = {
                "model_path": model_path,
                "temperature": 0.2,
                "max_tokens": 512,
                "n_ctx": context_length
            }

            if device == "cuda":
                llm_params["n_gpu_layers"] = 33
                llm_params["n_batch"] = 512
            
            self.__llm = LlamaCpp(**llm_params)

        except Exception as e:
            raise RuntimeError(f"Error initializing LlamaCppManager: {e}")

    def get_model(self):
        return self.__name
    
    def generate_summary(self, transcript):
        prompt = f"""
        Instructions:
        You are a content summariser used to help summarise the Transcript in bullet point form.
        Provide me with a summary of the Transcript with as little words as possible without adding any information that is not explicitly in there or repeating any of the Instructions.

        Transcript: 
        {transcript}
        """

        # generate the content summary
        result = self.__llm.invoke(prompt)

        # filter out COT tokens when using deepseek 14b
        if self.__name == "deepseek_14b":
            result = re.sub(r"<think>.*?</think>", "", result, flags=re.DOTALL).strip()

        return result