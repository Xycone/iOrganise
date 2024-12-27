import whisperx

from enums.deviceTypes import DeviceTypes
from enums.asrModels import AsrModels

ASR_MODELS = {
    "small": "/app/models/faster-whisper-small",
    "small_sg": "/app/models/faster-whisper-small-sg",
    "medium": "/app/models/faster-whisper-medium"
}

class WhisperXManager:
    def __init__(self, name: AsrModels, device: DeviceTypes, batch_size, compute_type):
        try:
            self.__name = name
            self.__device = device
            self.__batch_size = batch_size
            self.__compute_type = compute_type
            self.__audio = None
            self.__model = whisperx.load_model(ASR_MODELS.get(self.__name), self.__device, compute_type=self.__compute_type)

        except Exception as e:
            raise RuntimeError(f"Error initializing WhisperXManager: {e}")

    def get_audio(self):
        return self.__audio
    
    def get_model(self):
        return self.__name

    def transcribe(self, path):
        if self.__model is None:    
            raise RuntimeError("Model has not been loaded. Call load_model() first.")

        try:
            self.__audio = whisperx.load_audio(path)
            transcript = self.__model.transcribe(self.__audio, batch_size=self.__batch_size, language="en")

            # align output
            model_a, metadata = whisperx.load_align_model(language_code=transcript["language"], device=self.__device)
            transcript["segments"] = whisperx.align(transcript["segments"], model_a, metadata, self.__audio, self.__device, return_char_alignments=False)["segments"]

            return transcript
            
        except FileNotFoundError as e:
            raise RuntimeError(f"Audio file not found: {e}")
        
        except Exception as e:
            raise RuntimeError(f"Error transcribing audio: {e}")