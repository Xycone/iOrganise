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
                "max_tokens": 2000,
                "n_ctx": 8192
            }

            if device == "cuda":
                llm_params["n_gpu_layers"] = 30
                llm_params["n_batch"] = 512
            
            self.__llm = LlamaCpp(**llm_params)

        except Exception as e:
            raise RuntimeError(f"Error initializing WhisperXManager: {e}")

    def get_model(self):
        return self.__name
    
    def generate_summary(self, transcript):
        prompt = f"""
        <s>  
        [INST]
        Your task is to review the transcript generated from the uploaded study materials and provide a concise summary.
        Focus on identifying the key topics, main ideas, and essential information presented in the material. Avoid adding any information that is not explicitly in the transcript.  
        [/INST]  
        {transcript}  

        [INST]  
        Provide a summary of the conversation in a clear and concise manner, highlighting the main topics and any important details discussed. Avoid quoting the transcript directly unless necessary for clarity.  
        [/INST]  
        </s>  
        """

        # generate the content summary
        result = self.__llm.invoke(prompt)

        return result