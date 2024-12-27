from langchain_community.llms import LlamaCpp

from enums.deviceTypes import DeviceTypes
from enums.llmModels import LlmModels

LLM_MODELS = {
    "mistral_7b": "/app/models/mistral_7b/model.bin",
    "llama_8b": "/app/models/llama_8b/model.bin",
    "mistral_22b": "/app/models/mistral_22b/model.bin"
}

class LlamaCppManager:
    def __init__(self, name: LlmModels, device: DeviceTypes):
        try:
            self.__name = name

            llm_params = {
                "model_path": LLM_MODELS.get(name),
                "temperature": 0.4,
                "max_tokens": 512,
                "n_ctx": 8192
            }

            if device == "cuda":
                llm_params["n_gpu_layers"] = 33
                llm_params["n_batch"] = 512
            
            self.__llm = LlamaCpp(**llm_params)

        except Exception as e:
            raise RuntimeError(f"Error initializing WhisperXManager: {e}")

    def get_model(self):
        return self.__name
    
    def generate_summary(self, transcript):
        prompt = f"""
        You are a content summariser used to help summarise the contents of study materials in point form.
        Your task is to provide a clear yet short summary of the transcript without adding any information that is not explicitly in there:
        {transcript}
        Summary: 
        """

        # generate the content summary
        result = self.__llm.invoke(prompt)

        return result