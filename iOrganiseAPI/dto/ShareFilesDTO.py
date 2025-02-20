from pydantic import BaseModel, Field
from typing import List

class ShareFilesDTO(BaseModel):
    fileId_list: List[int]
    userEmail_list: List[str]
