import torch
import gc

import filetype

def is_video(path):
    mime_types = ['video/mp4', 'video/mpeg', 'video/webm']

    file_type = filetype.guess(path)
    if file_type is None:
        return False

    return file_type.mime in mime_types
    
def free_memory():
    gc.collect()
    
    if torch.cuda.is_available():
        torch.cuda.empty_cache()