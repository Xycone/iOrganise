from faster_whisper import WhisperModel, BatchedInferencePipeline

from enums.DeviceTypes import DeviceTypes
from enums.AsrModels import AsrModels

ASR_MODELS = {
    "small": "/app/models/faster-whisper-small",
    "small_sg": "/app/models/faster-whisper-small-sg",
    "medium": "/app/models/faster-whisper-medium"
}

class FasterWhisperManager:
    def __init__(self, name: AsrModels, device: DeviceTypes, batch_size, compute_type):
        try:
            self.__name = name
            self.__device = device
            self.__batch_size = batch_size
            self.__compute_type = compute_type
            self.__model = BatchedInferencePipeline(model=WhisperModel(ASR_MODELS.get(self.__name), self.__device, compute_type=self.__compute_type))

        except Exception as e:
            raise RuntimeError(f"Error initialising FasterWhisperManager: {e}")
    
    def get_model(self):
        return self.__name

    def transcribe(self, path):
        if self.__model is None:
            raise RuntimeError("Model has not been loaded.")

        try:
            segments, info = self.__model.transcribe(path, batch_size=self.__batch_size, vad_filter=True, language="en")
            transcript = {
                "language": getattr(info, "language", "unknown"),
                "segments": [
                    {
                        "start": segment.start,
                        "end": segment.end,
                        "text": segment.text.lstrip()
                    }
                    for segment in segments
                ]
            }

            return transcript
            
        except FileNotFoundError as e:
            raise RuntimeError(f"Audio file not found: {e}")
        
        except Exception as e:
            raise RuntimeError(f"Error transcribing audio: {e}")