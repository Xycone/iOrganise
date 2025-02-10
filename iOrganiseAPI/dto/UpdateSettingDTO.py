from pydantic import BaseModel

from enums.AsrModels import AsrModels
from enums.LlmModels import LlmModels

class UpdateSettingDTO(BaseModel):
    asr_model: AsrModels
    llm: LlmModels