import whisperx

from enums.deviceTypes import DeviceTypes

class DiarisationPipelineManager:
    def __init__(self, device: DeviceTypes, auth_token):
        try:
            self.__diarisation_model = whisperx.DiarizationPipeline(use_auth_token=auth_token, device=device)

        except Exception as e:
            raise RuntimeError(f"Error loading model: {e}")

    def diarise(self, audio, transcript, num_speakers):
        try:
            diarised_segments = self.__diarisation_model(audio, min_speakers=num_speakers, max_speakers=num_speakers)
            diarised_transcript = whisperx.assign_word_speakers(diarised_segments, transcript)["segments"]
        
            return diarised_transcript
        
        except Exception as e:
            raise RuntimeError(f"Error diarising audio: {e}")