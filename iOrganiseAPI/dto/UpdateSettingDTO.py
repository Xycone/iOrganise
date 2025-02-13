from pydantic import BaseModel, Field

from enums.AsrModels import AsrModels
from enums.LlmModels import LlmModels

class UpdateSettingDTO(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=1, max_length=255)
    password: str = Field(..., min_length=1, max_length=255)
    asr_model: AsrModels
    llm: LlmModels