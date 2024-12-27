from pydantic import BaseModel

from enums.asrModels import AsrModels
from enums.llmModels import LlmModels

class TranscribeAudioDTO(BaseModel):
    asr_model: AsrModels
    content_summary: bool
    llm: LlmModels