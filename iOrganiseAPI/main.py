from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import FileResponse

import os

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
from dto.RegisterDTO import RegisterDTO
from dto.UpdateUserDTO import UpdateUserDTO
from dto.UpdateSettingDTO import UpdateSettingDTO
from dto.TranscribeAudioDTO import TranscribeAudioDTO
from dto.TextInputDTO import TextInputDTO

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

@app.post("/register")
async def register(form_data: RegisterDTO):
    # check if the email already exists
    existing_user = (await db_get_by_attribute(User, "email", form_data.email) or [None])[0]
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # hash password
    hashed_password = hash_password(form_data.password)
    
    # create new user
    user = User(name=form_data.name, email=form_data.email, password=hashed_password)
    response = await db_create(user)
    user_setting = UserSetting(asr_model="small_sg", llm="deepseek_14b", user=user)
    await db_create(user_setting)
    os.makedirs(os.path.join("/app/file_storage", user.email), exist_ok=True)
    
    return {"msg": "User created successfully", "user": response}

@app.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # fetch user by email
    existing_user = (await db_get_by_attribute(User, "email", form_data.username) or [None])[0]
    if not existing_user or not verify_password(form_data.password, existing_user.password):
        raise HTTPException(status_code=401, detail="Invalid login credentials")
    
    # create JWT token for user
    access_token = create_access_token(data={"sub": existing_user.id})
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/get-user")
async def get_user(token: str = Depends(oauth2_scheme)):
    user_id = verify_jwt_token(token)
    user = await db_get_by_id(User, user_id)

    return {"user": user}

@app.put("/update-user")
async def update_user(form_data: UpdateUserDTO, token: str = Depends(oauth2_scheme)):
    user_id = verify_jwt_token(token)
    user = await db_get_by_id(User, user_id)

    # check if the email already exists
    existing_user = (await db_get_by_attribute(User, "email", form_data.email) or [None])[0]
    if existing_user and form_data.email != user.email:
        raise HTTPException(status_code=400, detail="Email already registered")

    # hash password
    hashed_password = hash_password(form_data.password)

    new_user = {
        "name": form_data.name,
        "email": form_data.email,
        "password": hashed_password
    }
    response = await db_update(User, user_id, new_user)

    return {"msg": "User updated successfully", "user": response}

@app.get("/get-setting")
async def get_setting(token: str = Depends(oauth2_scheme)):
    user_id = verify_jwt_token(token)
    user_setting = await db_get_by_attribute(UserSetting, "user_id", user_id)

    return {"user_setting": user_setting}

@app.put("/update-setting/{id}")
async def update_setting(id: int, form_data: UpdateSettingDTO, token: str = Depends(oauth2_scheme)):
    user_id = verify_jwt_token(token)

    # check if the setting belongs to user
    user_setting = await db_get_by_id(UserSetting, id)
    if user_id != user_setting.user_id:
        raise HTTPException(status_code=401, detail="Invalid permissions to update this setting")

    new_user_setting = {
        "asr_model": form_data.asr_model,
        "llm": form_data.llm
    }
    response = await db_update(UserSetting, id, new_user_setting)

    return {"msg": "UserSetting updated successfully", "user_setting": response}

@app.post("/upload-files")
async def upload_files(files: List[UploadFile] = File(...), token: str = Depends(oauth2_scheme)):
    user_id = verify_jwt_token(token)
    user = await db_get_by_id(User, user_id)

    for file in files:
        type, size, path = await save_uploaded_file(user.email, file)

        file_upload = FileUpload(name=os.path.basename(path), type=type, size=size, path=path, user=user)
        await db_create(file_upload)

    return {"msg": "Files uploaded successfully"}

@app.get("/get-files")
async def get_files(token: str = Depends(oauth2_scheme)):
    user_id = verify_jwt_token(token)
    file_upload_list = await db_get_by_attribute(FileUpload, "user_id", user_id)

    files = [file for file in file_upload_list if os.path.exists(file.path)]

    return {"files": files}

@app.get("/download-file/{id}")
async def download_file(id: int, token: str = Depends(oauth2_scheme)):
    user_id = verify_jwt_token(token)
    file_upload_list = await db_get_by_attribute(FileUpload, "user_id", user_id)
    file = next((file_upload for file_upload in file_upload_list if file_upload.id == id and os.path.exists(file_upload.path)), None)

    if file is None:
        raise HTTPException(status_code=404, detail="Requested file not found or authorized for download")
    
    return FileResponse(file.path, filename=file.name, headers={"Content-Disposition": f"attachment; filename={os.path.basename(file.path)}"})

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

@app.post("/predict-text")
async def predict_text(form_data: TextInputDTO = Depends(), files: List[UploadFile] = File(...)):
    # 1. error check
    if not form_data.text and not files:
        raise HTTPException(status_code=400, detail="No text or file uploaded")

    response = {}

    # 2. extract text from files
    extracted_text = ""
    if files:
        for file in files:
            with NamedTemporaryFile(delete=True) as temp:
                try:
                    with open(temp.name, "wb") as temp_file:
                        temp_file.write(file.file.read())

                    # extract text from the file based on extension
                    if file.filename.endswith(".pdf"):
                        extracted_text += TextExtractor.extract_text_from_pdf(temp.name)
                    elif file.filename.endswith(".docx"):
                        extracted_text += TextExtractor.extract_text_from_docx(temp.name)
                    elif file.filename.endswith(".txt"):
                        extracted_text += TextExtractor.extract_text_from_txt(temp.name)
                    else:
                        raise HTTPException(status_code=400, detail="Unsupported file type")

                except Exception as e:
                    response[file.filename] = {"error": str(e)}

    text = form_data.text or extracted_text

    # 3. predict subject for file
    if text:
        try:
            classification_manager = model_loader.load_bert()
            predicted_label = classification_manager.predict(text)

            response = {
                "text": text,
                "predicted_label": int(predicted_label)
            }

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

        # 4. unload the model
        model_loader.del_models("BERT")

    return response


@app.get("/get-device")
async def get_device():
    return DEVICE