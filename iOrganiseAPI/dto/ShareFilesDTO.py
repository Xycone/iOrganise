from pydantic import BaseModel
from typing import List

class ShareFilesDTO(BaseModel):
    fileId_list: List[int]
    userId_list: List[int]
