from pydantic import BaseModel
from typing import Optional
from fastapi import UploadFile
from enum import Enum
from typing import List

# Assuming the TextInputDTO is similar to your previous example
class TextInputDTO(BaseModel):
    text: Optional[str] = None
    files: Optional[List[UploadFile]] = None

# Example Enums if needed, based on your context
class SupportedFileType(Enum):
    PDF = ".pdf"
    DOCX = ".docx"
    TXT = ".txt"