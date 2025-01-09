import torch
import gc
from pydub import AudioSegment

def is_stereo(path):
    try:
        audio = AudioSegment.from_file(path)
        channels = audio.channels
        return channels != 1
        
    except Exception as e:  
        print(f"Error checking if audio is stereo: {e}")
        return False
    
def free_memory():
    gc.collect()
    
    if torch.cuda.is_available():
        torch.cuda.empty_cache()