from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware

import torch

import subprocess
from typing import List
from tempfile import NamedTemporaryFile

from utils import *
from modelLoader import ModelLoader
from dto.transcribeaudioDTO import TranscribeAudioDTO

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEVICE, COMPUTE_TYPE = ("cuda", "float16") if torch.cuda.is_available() else ("cpu", "int8")
model_loader = ModelLoader("small_sg", DEVICE, 16, COMPUTE_TYPE)

@app.post("/transcribe-audio")
async def transcribe_audio(form_data: TranscribeAudioDTO = Depends(), files: List[UploadFile] = File(...)):
    # 1. error check
    if not files:
        raise HTTPException(status_code=400, detail="No Files Uploaded")

    response = {}

    # 2. load models used for transciption
    transcription_manager = (
        model_loader.load_asr(form_data.asr_model, DEVICE, 16, COMPUTE_TYPE)
    )

    # 3. transcribe all audio/video files
    for id, file in enumerate(files, start=1):
        with NamedTemporaryFile(delete=True) as temp:
            try:
                # copies uploaded file contents to the temporary file
                with open(temp.name, 'wb') as temp_file:
                    temp_file.write(file.file.read())

                # extract audio from video using ffmpeg
                if is_video(temp.name):
                    with NamedTemporaryFile(delete=True) as audio_temp:
                        extracted_audio_path = audio_temp.name + ".mp3"
                        command = ["ffmpeg", "-i", temp.name, extracted_audio_path]
                        subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

                # performs audio transcription
                transcript = transcription_manager.transcribe(temp.name)
                segments = transcript["segments"]
                    
                response[id] = {
                    "filename": file.filename,
                    "language": transcript["language"],
                    "segments": [
                        {
                            "start": segment.get("start"),
                            "end": segment.get("end"),
                            "text": segment.get("text").lstrip()
                        }
                        for segment in segments
                    ]
                }
            
            except Exception as e:
                response[id] = {
                    "filename": file.filename,
                    "error": str(e)
                }
    
    if form_data.content_summary:
        # 4. unload the ASR model used for transcription and load in the LLM
        model_loader.del_all_models()
        llama_cpp_manager = model_loader.load_llm(form_data.llm, DEVICE)

        # 5. summarise transcript of all audio files
        for i, file_data in response.items():
            try:
                formatted_transcript = "\n".join(
                    f"Segment {j + 1}: {segment.get('text')}"
                    for j, segment in enumerate(file_data["segments"])
                )
                
                response[i]["summary"] = llama_cpp_manager.generate_summary(formatted_transcript)

            except Exception as e:
                response[i]["summary"] = {
                    "error": str(e)
                }

        # 6. unload the LLM
        model_loader.del_models("LLM")

    return response


@app.get("/get-device")
async def get_device():
    return DEVICE