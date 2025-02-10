from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

import torch

from database import create_tables, db_create, db_get, db_get_by_id, db_get_by_attribute, db_update, db_delete

from model.User import User
from model.FileUpload import FileUpload
from model.UserSetting import UserSetting

import subprocess
from typing import List
from tempfile import NamedTemporaryFile

from utils import *
from modelLoader import ModelLoader
from dto.TranscribeAudioDTO import TranscribeAudioDTO
from dto.SignUpDTO import SignUpDTO

app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

# CORS settings
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


model_loader = ModelLoader()
DEVICE, COMPUTE_TYPE = ("cuda", "float16") if torch.cuda.is_available() else ("cpu", "int8")

@app.on_event("startup")
async def on_startup():
    await create_tables()

@app.post("/sign-up")
async def sign_up(form_data: SignUpDTO = Depends()):
    # check if the email already exists
    existing_user = (await db_get_by_attribute(User, "email", form_data.email) or [None])[0]
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # hash password
    hashed_password = hash_password(form_data.password)
    
    # create new user record
    new_user = User(name=form_data.name, email=form_data.email, password=hashed_password)
    response = await db_create(new_user)
    
    return {"msg": "User created successfully", "user": response.email}

@app.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # fetch user by email
    existing_user = (await db_get_by_attribute(User, "email", form_data.username) or [None])[0]
    if not existing_user or not verify_password(form_data.password, existing_user.password):
        raise HTTPException(status_code=401, detail="Invalid login credentials")
    
    # create JWT token for user
    access_token = create_access_token(data={"sub": existing_user.id})
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/view-info")
async def view_info(token: str = Depends(oauth2_scheme)):
    user_id = verify_jwt_token(token)
    user = await db_get_by_attribute(User, "id", user_id)

    return {"user": user}

# @app.post("/view-extract/{file_id}") # need to trigger when view extract button is pressed and user is logged in
# async def view_extract(file_id: str = Path(..., description="The ID of the file to process"), current_user: str = Depends(get_current_user)):
#     # . retrieve file
#     file = await db_get_id(FileUpload, file_id)
#     if not file:
#         raise HTTPException(status_code=400, detail="File does not exist")
    
#     # . process file
#     with NamedTemporaryFile(delete=True) as temp:
#         try:
#             # copies uploaded file contents to the temporary file
#             with open(temp.name, "wb") as temp_file:
#                 temp_file.write(file.file.read())

#             # transcribe audio
#             if is_video(temp.name):
#                 with NamedTemporaryFile(delete=True) as audio_temp:
#                     extracted_audio_path = audio_temp.name + ".mp3"
#                     command = ["ffmpeg", "-i", temp.name, extracted_audio_path]
#                     subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

#             if is_audio(temp.name):
#                 transcription_manager = (
#                     model_loader.load_asr(user_settings.asr_model, DEVICE, 16, COMPUTE_TYPE)
#                 )

#                 content = "\n".join(
#                     f"Segment {j + 1}: {segment.get('text')}"
#                     for j, segment in enumerate(transcription_manager.transcribe(temp.name).get("segments"))
#                 )
                            
#             # image to text

#             # subject classification

#             # extract text
#             if is_text(temp.name):
#                 content = "test"

#             # summarise content
#             if content:
#                 model_loader.del_all_models()

#                 llama_cpp_manager = model_loader.load_llm(user_settings.llm, DEVICE)
#                 summary = llama_cpp_manager.generate_summary(content)

#                 model_loader.del_models("LLM")

#             # format response
#             response = {
#                 "content": content if content else None,
#                 "summary": summary if summary else None
#             }

#             return response
        
#         except Exception as e:
#             raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

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
                with open(temp.name, "wb") as temp_file:
                    temp_file.write(file.file.read())

                # extract audio from video using ffmpeg
                if is_video(temp.name):
                    with NamedTemporaryFile(delete=True) as audio_temp:
                        extracted_audio_path = audio_temp.name + ".mp3"
                        command = ["ffmpeg", "-i", temp.name, extracted_audio_path]
                        subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

                if is_audio(temp.name):
                    raise HTTPException(status_code=400, detail="Unsupported file type")

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