from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import FileResponse, Response

import os
import zipfile
import aiofiles
from io import BytesIO
import re

import torch

from database import create_tables, db_create, db_get, db_get_by_id, db_get_by_attribute, db_update, db_delete

from model.User import User
from model.FileUpload import FileUpload
from model.UserSetting import UserSetting

import subprocess
from typing import List, Optional
from tempfile import NamedTemporaryFile

from utils import *
from modelLoader import ModelLoader
from dto.RegisterDTO import RegisterDTO
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

@app.get("/get-setting")
async def get_settings(token: str = Depends(oauth2_scheme)):
    user_id = verify_jwt_token(token)
    user = await db_get_by_id(User, user_id)
    user_setting = next(iter(await db_get_by_attribute(UserSetting, "user_id", user_id)), None)

    if not user_setting:
        raise HTTPException(status_code=404, detail="User settings not found")

    setting = {
        "id": user_setting.id,
        "name": user.name,
        "email": user.email,
        "asr_model": user_setting.asr_model,
        "llm": user_setting.llm
    }

    return {"setting": setting}

@app.put("/update-setting/{id}")
async def update_setting(id: int, form_data: UpdateSettingDTO, token: str = Depends(oauth2_scheme)):
    user_id = verify_jwt_token(token)
    user = await db_get_by_id(User, user_id)
    user_setting = await db_get_by_id(UserSetting, id)

    # check if the user setting belongs to user
    if user_id != user_setting.user_id:
        raise HTTPException(status_code=401, detail="Invalid permissions to update this setting")

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

    new_setting = {
        "asr_model": form_data.asr_model,
        "llm": form_data.llm
    }
    
    response_user = await db_update(User, user_id, new_user)
    user_status = {"status": "User updated successfully"} if response_user else {"status": "Failed"}

    response_setting = await db_update(UserSetting, id, new_setting)
    setting_status = {"status": "UserSetting updated successfully"} if response_setting else {"status": "Failed"}

    return {
        "user_msg": user_status,
        "setting_msg": setting_status
    }

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

@app.delete("/delete-file/{id}")
async def delete_file(id: int, token: str = Depends(oauth2_scheme)):
    user_id = verify_jwt_token(token)
    file_upload_list = await db_get_by_attribute(FileUpload, "user_id", user_id)
    file = next((file_upload for file_upload in file_upload_list if file_upload.id == id and os.path.exists(file_upload.path)), None)

    if file is None:
        raise HTTPException(status_code=404, detail="Requested file not found or authorised for deletion")
    
    try:
        os.remove(file.path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error removing file from storage: {e}")
    
    await db_delete(FileUpload, id)
    
    return {"msg": "File deleted successfully"}

@app.get("/download-file/{id}")
async def download_file(id: int, token: str = Depends(oauth2_scheme)):
    user_id = verify_jwt_token(token)
    file_upload_list = await db_get_by_attribute(FileUpload, "user_id", user_id)
    file = next((file_upload for file_upload in file_upload_list if file_upload.id == id and os.path.exists(file_upload.path)), None)

    if file is None:
        raise HTTPException(status_code=404, detail="Requested file not found or authorised for download")
    
    return FileResponse(file.path, filename=file.name, headers={"Content-Disposition": f"attachment; filename={os.path.basename(file.path)}"})

@app.get("/download-all")
async def download_all(token: str = Depends(oauth2_scheme)):
    user_id = verify_jwt_token(token)
    file_upload_list = await db_get_by_attribute(FileUpload, "user_id", user_id)
    files = [file_upload for file_upload in file_upload_list if os.path.exists(file_upload.path)]

    if files is None:
        raise HTTPException(status_code=404, detail="No files found or authorised for download")
    
    # create an in-memory zip file
    zip_buffer = BytesIO()

    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for file_upload in files:
            file_path = file_upload.path
            file_name = os.path.basename(file_path)
            zip_file.write(file_path, arcname=file_name)

    zip_buffer.seek(0) 

    headers = {
        "Content-Disposition": "attachment; filename=files.zip",
        "Content-Type": "application/zip"
    }

    return Response(zip_buffer.read(), headers=headers)

@app.post("/smart-upload")
async def smart_upload(files: List[UploadFile] = File(...), token: str = Depends(oauth2_scheme)):
    user_id = verify_jwt_token(token)
    user = await db_get_by_id(User, user_id)
    user_setting = next(iter(await db_get_by_attribute(UserSetting, "user_id", user_id)), None)

    # upload files
    myList = []
    for file in files:
        type, size, path = await save_uploaded_file(user.email, file)

        file_upload = FileUpload(name=os.path.basename(path), type=type, size=size, path=path, user=user)
        response = await db_create(file_upload)

        myList.append((response.id, response.name, response.type, response.path))

    # bucket sort based on MIME type for later processing
    buckets = {"video": [], "audio": [], "image": [], "document": [], "other": []}

    for id, name, type, path in myList:
        category = type.split("/")[0] if type and type.split("/")[0] in buckets else "other"
        buckets[category].append((id, name, path, type))

    # file processing (1st stage)
    myList = []
    if buckets["video"] or buckets["audio"]:
        transcription_manager = model_loader.load_asr(user_setting.asr_model, DEVICE, 16, COMPUTE_TYPE)

        for id, name, path, type in buckets["video"] + buckets["audio"]:
            try:
                if type == "video":
                    with NamedTemporaryFile(delete=True) as audio_temp:
                        extracted_audio_path = audio_temp.name + ".mp3"
                        subprocess.run(["ffmpeg", "-i", path, extracted_audio_path], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                        content = "\n".join(
                            f"Segment {j + 1}: {segment.get('text')}"
                            for j, segment in enumerate(transcription_manager.transcribe(path).get("segments"))
                        )

                elif type == "audio":
                    content = "\n".join(
                        f"Segment {j + 1}: {segment.get('text')}"
                        for j, segment in enumerate(transcription_manager.transcribe(path).get("segments"))
                    )

                myList.append((id, name, path, type, content))

            except Exception as e:
                print(f"Error processing file {name}: {e}")

        model_loader.del_models("ASR")

    # extract text from image files
    if buckets["image"]:
        # load model(s) here
        for id, name, path, type in buckets["image"]:
            # processing steps for file here
            pass
            
            # make sure to pass in value for "content"
            content = None
            myList.append((id, name, path, type, content))
        
        # unload model(s) here

    # extract text from document
    if buckets["document"]:
        # load model(s) here

        for id, name, path, type in buckets["document"]:
            # processing steps for file here
            pass

            # make sure to pass in value for "content"
            content = None
            myList.append((id, name, path, type, content))
        
        # unload model(s) here

    if buckets["other"]:
        for id, name, path, type in buckets["other"]:
            content = None
            myList.append((id, name, path, type, content))

    # subject classification (2nd stage)
    # load models for subject classification here

    for id, name, path, type, content in myList:
        # classify files and save the subject to db
        pass

    # content summary (final stage)
    model_loader.del_all_models()
    llama_cpp_manager = model_loader.load_llm(user_setting.llm, DEVICE)

    for id, name, path, type, content in myList:
        if content:
            summary = llama_cpp_manager.generate_summary(content)

            content_path = os.path.join("/app/file_storage", user.email, "content_" + name)
            summary_path = os.path.join("/app/file_storage", user.email, "summary_" + name)

            async with aiofiles.open(content_path, 'w') as content_file:
                await content_file.write(content)
            async with aiofiles.open(summary_path, 'w') as summary_file:
                await summary_file.write(summary)

            await db_update(FileUpload, id, {"content_path": content_path, "summary_path": summary_path})

    model_loader.del_models("LLM")

    return {"Files Uploaded & Processed"}

@app.post("/view-extract/{id}")
async def view_extract(id: str, token: str = Depends(oauth2_scheme)):
    user_id = verify_jwt_token(token)
    user = await db_get_by_id(User, user_id)
    user_setting = next(iter(await db_get_by_attribute(UserSetting, "user_id", user_id)), None)

    # retrieve file
    file = await db_get_by_id(FileUpload, id)
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    if user_id != file.user_id:
        raise HTTPException(status_code=403, detail="You are not authorized to view this file")
    
    content, summary = None, None
    
    # retrieve content and summary if information has been extracted before
    if file.content_path and file.summary_path and file.content_path.strip() and file.summary_path.strip():
        async with aiofiles.open(file.content_path, 'r') as content_file:
            content = await content_file.read()
        async with aiofiles.open(file.summary_path, 'r') as summary_file:
            summary = await summary_file.read()

        return {"content": content, "summary": summary}
      
    # process file if not viewed before
    with NamedTemporaryFile(delete=True) as temp:
        try:
            with open(file.path, "rb") as src_file, open(temp.name, "wb") as temp_file:
                temp_file.write(src_file.read())

            # transcribe audio
            if is_video(temp.name) or is_audio(temp.name):
                transcription_manager = model_loader.load_asr(user_setting.asr_model, DEVICE, 16, COMPUTE_TYPE)

                if is_video(temp.name):
                    with NamedTemporaryFile(delete=True) as audio_temp:
                        extracted_audio_path = audio_temp.name + ".mp3"
                        subprocess.run(["ffmpeg", "-i", temp.name, extracted_audio_path], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                        content = "\n".join(
                            f"Segment {j + 1}: {segment.get('text')}"
                            for j, segment in enumerate(transcription_manager.transcribe(temp.name).get("segments"))
                        )

                elif is_audio(temp.name):
                    content = "\n".join(
                        f"Segment {j + 1}: {segment.get('text')}"
                        for j, segment in enumerate(transcription_manager.transcribe(temp.name).get("segments"))
                    )

                model_loader.del_models("ASR")
                            
            # image to text

            # document text extraction

            # subject classification

            # summarise content
            if content:
                model_loader.del_all_models()
                llama_cpp_manager = model_loader.load_llm(user_setting.llm, DEVICE)
                summary = llama_cpp_manager.generate_summary(content)
                model_loader.del_models("LLM")

            if content and summary:
                content_path = os.path.join("/app/file_storage", user.email, "content_" + file.name)
                summary_path = os.path.join("/app/file_storage", user.email, "summary_" + file.name)
                
                async with aiofiles.open(content_path, 'w') as content_file:
                    await content_file.write(content)
                async with aiofiles.open(summary_path, 'w') as summary_file:
                    await summary_file.write(summary)

                await db_update(FileUpload, id, {"content_path": content_path, "summary_path": summary_path})

            return {"content": content, "summary": summary}
        
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.post("/transcribe-audio")
async def transcribe_audio(form_data: TranscribeAudioDTO = Depends(), files: List[UploadFile] = File(...)):
    # 1. error check
    if not files:
        raise HTTPException(status_code=400, detail="No Files Uploaded")

    response = {}

    # 2. load models used for transciption
    transcription_manager = model_loader.load_asr(form_data.asr_model, DEVICE, 16, COMPUTE_TYPE)

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
                        subprocess.run(["ffmpeg", "-i", temp.name, extracted_audio_path], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

                        transcript = transcription_manager.transcribe(extracted_audio_path)
                        segments = transcript["segments"]

                if is_audio(temp.name):
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
<<<<<<< HEAD
async def predict_text(
    text: Optional[str] = Form(None),
    files: List[UploadFile] = File(default=None)
):
=======
async def predict_text(form_data: TextInputDTO = Depends(), files: Optional[List[UploadFile]] = File(None)):
>>>>>>> e530db2db185ae0c7fb5630b3e796f39277f51bc
    # 1. error check
    if not text and not files:
        raise HTTPException(status_code=400, detail="No text or file uploaded")

    response = {}
    
    # 2. extract text from files
    extracted_text = ""
    if files:
        for file in files:
            with NamedTemporaryFile(delete=True) as temp:
                try:
                    content = await file.read()  # Read file content
                    with open(temp.name, "wb") as temp_file:
                        temp_file.write(content)

                    # extract text from the file based on extension
                    if file.filename.endswith(".pdf"):
                        extracted_text += extract_text_from_pdf(temp.name)
                    elif file.filename.endswith(".docx"):
                        extracted_text += extract_text_from_docx(temp.name)
                    elif file.filename.endswith(".txt"):
                        extracted_text += extract_text_from_txt(temp.name)
                    else:
                        raise HTTPException(status_code=400, detail="Unsupported file type")
                    
                    await file.seek(0)  # Reset file pointer

                except Exception as e:
                    response[file.filename] = {"error": str(e)}

   # Combine texts
    combined_text = ""
    if text:
        combined_text += text
    if extracted_text:
        combined_text += " " + extracted_text

    cleaned_text = re.sub(r'[^a-zA-Z0-9\s,!?-]', '', combined_text)
    cleaned_text = ' '.join(cleaned_text.split())
    
    # 3. predict subject for combined text
    if combined_text:
        try:
            classification_manager = model_loader.load_bert()
            predicted_label = classification_manager.predict(cleaned_text)

            response = {
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