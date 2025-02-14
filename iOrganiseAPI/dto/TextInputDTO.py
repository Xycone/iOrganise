from pydantic import BaseModel, Field

class TextInputDTO(BaseModel):
    text: str