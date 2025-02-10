from pydantic import BaseModel

from enums.AsrModels import AsrModels
from enums.LlmModels import LlmModels

class TranscribeAudioDTO(BaseModel):
    asr_model: AsrModels
    content_summary: bool
    llm: LlmModels