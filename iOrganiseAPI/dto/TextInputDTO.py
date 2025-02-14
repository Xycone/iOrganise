from pydantic import BaseModel

class TextInputDTO(BaseModel):
    text: str