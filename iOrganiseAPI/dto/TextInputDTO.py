from pydantic import BaseModel

from enums.SupportedFileType import SupportedFileType

class TextInputDTO(BaseModel):
    text: str