from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import FileResponse, Response

import os
import zipfile
import aiofiles
from io import BytesIO
import re

import torch

import io
import requests

from database import create_tables, db_create, db_get, db_get_by_id, db_get_by_attribute, db_update, db_delete

from model.User import User
from model.FileUpload import FileUpload
from model.UserSetting import UserSetting
from model.SharedFile import SharedFile

import subprocess
from typing import List, Optional
from tempfile import NamedTemporaryFile

from enums.SubjectTypes import SubjectTypes

from utils import *
from modelLoader import ModelLoader
from dto.RegisterDTO import RegisterDTO
from dto.UpdateSettingDTO import UpdateSettingDTO
from dto.ShareFilesDTO import ShareFilesDTO
from dto.TranscribeAudioDTO import TranscribeAudioDTO

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
# Hugging Face API endpoint for OCR
HUGGING_FACE_URL = "https://fiamenova-aap.hf.space/predict/"

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
async def get_files(token: str = Depends(oauth2_scheme), name: Optional[str] = Query(None), subject: Optional[str] = Query(None)):
    user_id = verify_jwt_token(token)
    file_upload_list = await db_get_by_attribute(FileUpload, "user_id", user_id)
    shared_file_list = [
        await db_get_by_id(FileUpload, shared.file_id)
        for shared in await db_get_by_attribute(SharedFile, "user_id", user_id)
    ]

    file_upload_list = filter(
        lambda file: (not name or name.lower() in file.name.lower()) and 
                    (not subject or subject.lower() in str(file.subject).lower()),
        file_upload_list
    )

    shared_file_list = filter(
        lambda file: (not name or name.lower() in file.name.lower()) and 
                    (not subject or subject.lower() in str(file.subject).lower()),
        shared_file_list
    )

    files = [file for file in file_upload_list if os.path.exists(file.path)]
    shared_files = [file for file in shared_file_list if os.path.exists(file.path)]

    return {"files": files, "shared_files": shared_files}

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
    shared_file_list = await db_get_by_attribute(SharedFile, "file_id", id)
    for shared_file in shared_file_list:
        await db_delete(SharedFile, shared_file.id)
    
    return {"msg": "File deleted successfully"}

@app.get("/download-file/{id}")
async def download_file(id: int, token: str = Depends(oauth2_scheme)):
    user_id = verify_jwt_token(token)
    file_upload_list = await db_get_by_attribute(FileUpload, "user_id", user_id)
    file = next((file_upload for file_upload in file_upload_list if file_upload.id == id and os.path.exists(file_upload.path)), None)

    if file is None:
        shared_file = await db_get_by_attribute(SharedFile, "user_id", user_id)
        shared_file_ids = {shared.file_id for shared in shared_file}

        if id in shared_file_ids:
            file = await db_get_by_id(FileUpload, id)

    if file is None:
        raise HTTPException(status_code=404, detail="Requested file not found or authorised for download")
    
    return FileResponse(file.path, filename=file.name, headers={"Content-Disposition": f"attachment; filename={os.path.basename(file.path)}"})

@app.get("/download-all")
async def download_all(token: str = Depends(oauth2_scheme)):
    user_id = verify_jwt_token(token)
    file_upload_list = await db_get_by_attribute(FileUpload, "user_id", user_id)
    user_files = [file_upload for file_upload in file_upload_list if os.path.exists(file_upload.path)]

    shared_file_list = [
        await db_get_by_id(FileUpload, shared.file_id)
        for shared in await db_get_by_attribute(SharedFile, "user_id", user_id)
    ]
    shared_files = [file for file in shared_file_list if os.path.exists(file.path)]

    if not user_files and not shared_files:
        raise HTTPException(status_code=404, detail="No files found or authorized for download")
    
    # create an in-memory zip file
    zip_buffer = BytesIO()

    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        # Add user files under "Your Files"
        for file in user_files:
            file_path = file.path
            file_name = os.path.basename(file_path)
            subject_folder = file.subject if file.subject else "Uncategorized"
            zip_file.write(file_path, arcname=f"Your Files/{subject_folder}/{file_name}")

        # Add shared files under "Shared Files"
        for file in shared_files:
            file_path = file.path
            file_name = os.path.basename(file_path)
            subject_folder = file.subject if file.subject else "Uncategorized"
            zip_file.write(file_path, arcname=f"Shared Files/{subject_folder}/{file_name}")

    zip_buffer.seek(0)

    headers = {
        "Content-Disposition": "attachment; filename=files.zip",
        "Content-Type": "application/zip"
    }

    return Response(zip_buffer.read(), headers=headers)

@app.get("/view-shared")
async def view_shared(token: str = Depends(oauth2_scheme)):
    user_id = verify_jwt_token(token)
    shared_file_list = await db_get_by_attribute(SharedFile, "user_id", user_id)

    return {"shared_files": shared_file_list}

@app.post("/share-files")
async def share_files(form_data: ShareFilesDTO = Depends(), token: str = Depends(oauth2_scheme)):
    user_id = verify_jwt_token(token)
    user = await db_get_by_id(User, user_id)

    file_upload_list = [
        file for file in await db_get_by_attribute(FileUpload, "user_id", user_id) 
        if file.id in form_data.fileId_list and os.path.exists(file.path)
    ]
    user_list = [
        db_user
        for userEmail in form_data.userEmail_list
        if userEmail != user.email
        for db_user in await db_get_by_attribute(User, "email", userEmail)
    ]

    if not file_upload_list or not user_list:
        raise HTTPException(status_code=400, detail="No files or users found or unauthorized to share")
    
    shared_file_list = []
    for file_upload in file_upload_list:
        for user in user_list:
            existing_shared_file = await db_get_by_attribute(SharedFile, "file_id", file_upload.id)
            if any(shared_file.user_id == user.id for shared_file in existing_shared_file):
                continue
            shared_file_list.append(SharedFile(file_upload=file_upload, user=user))

    if not shared_file_list:
        raise HTTPException(status_code=400, detail="Files have already been shared with the specified users")

    print("Shared File List:", shared_file_list)
    
    for shared_file in shared_file_list:
        await db_create(shared_file)

    return {"msg": "Files shared successfully"}

@app.delete("/unshare-file/{id}")
async def unshare_file(id: int, token: str = Depends(oauth2_scheme)):
    user_id = verify_jwt_token(token)
    shared_file_list = await db_get_by_attribute(SharedFile, "user_id", user_id)
    shared_file = next((shared for shared in shared_file_list if shared.file_id == id), None)

    if not shared_file:
        raise HTTPException(status_code=400, detail="File not found or unauthorized to unshare")

    await db_delete(SharedFile, shared_file.id)

    return {"msg": "Files unshared successfully"}

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

        if response:
            myList.append((response.id, response.name, response.type, response.path))

    # bucket sort based on MIME type for later processing
    buckets = {"video": [], "audio": [], "image": [], "application": [], "other": []}

    for file_id, file_name, file_type, file_path in myList:
        category = file_type.split("/")[0] if file_type and file_type.split("/")[0] in buckets else "other"
        buckets[category].append((file_id, file_name, file_path, category))

    # file processing (1st stage)
    myList = []
    # extract audio from audio/video files
    if buckets["video"] or buckets["audio"]:
        transcription_manager = model_loader.load_asr(user_setting.asr_model, DEVICE, 16, COMPUTE_TYPE)

        for file_id, file_name, file_path, category in buckets["video"] + buckets["audio"]:
            try:
                if category == "video":
                    with NamedTemporaryFile(delete=True) as audio_temp:
                        extracted_audio_path = audio_temp.name + ".mp3"
                        subprocess.run(["ffmpeg", "-i", file_path, extracted_audio_path], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                        content = "\n".join(
                            f"Segment {j + 1}: {segment.get('text')}"
                            for j, segment in enumerate(transcription_manager.transcribe(file_path).get("segments"))
                        )

                if category == "audio":
                    content = "\n".join(
                        f"Segment {j + 1}: {segment.get('text')}"
                        for j, segment in enumerate(transcription_manager.transcribe(file_path).get("segments"))
                    )

                myList.append((file_id, file_name, file_path, category, content))

            except Exception as e:
                print(f"Error processing file {file_name}: {e}")

        model_loader.del_models("ASR")

    # Extract text from image files
    if buckets["image"]:
        for file_id, file_name, file_path, category in buckets["image"]:
            try:
                # Open the image file in binary mode
                with open(file_path, "rb") as image_file:
                    image_bytes = image_file.read()  # Read the image as bytes

                    # Send the image to Hugging Face API
                    response = requests.post(HUGGING_FACE_URL, files={"image": image_bytes})

                    if response.status_code == 200:
                        content = response.json()["prediction"]  # Extract the prediction from the response
                    else:
                        print(f"Error: {response.status_code} - {response.text}")
                        content = None

                myList.append((file_id, file_name, file_path, category, content))
            except Exception as e:
                print(f"Error processing image {file_name}: {e}")
                myList.append((file_id, file_name, file_path, category, None))

    if buckets["application"]:
        # load model(s) here

        for file_id, file_name, file_path, category in buckets["application"]:
            # processing steps for file here
            print(f"Processing document: {file_name}")

            # Check file type and extract text accordingly
            file_type = get_file_type(file_path)
            extracted_text = ""

            if file_type == "application/pdf":
                extracted_text = extract_text_from_pdf(file_path)
            elif file_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                extracted_text = extract_text_from_docx(file_path)

            content = extracted_text if extracted_text else None
            myList.append((file_id, file_name, file_path, category, content))
        
        # unload model(s) here

    if buckets["other"]:
        for file_id, file_name, file_path, category in buckets["other"]:
            content = None
            myList.append((file_id, file_name, file_path, category, content))

    # subject classification (2nd stage)
    classification_manager = model_loader.load_bert()

    subject_mapping = {
        0: SubjectTypes.math,
        1: SubjectTypes.english,
        2: SubjectTypes.science
    }

    for file_id, file_name, file_path, category, content in myList:
        # classify files and save the subject to db
        try:
            if content:  # Only try to classify if there's content
                print(content)
                predicted_label = classification_manager.predict(content)  # This returns 0, 1, or 2
                
                # Get the corresponding enum value using the mapping
                try:
                    
                    subject_enum = subject_mapping[predicted_label]
                    
                    # Update the file record with the predicted subject
                    await db_update(FileUpload, file_id, {"subject": subject_enum})
                    
                    print(f"Classified {file_name} as: {subject_enum}")
                except KeyError:
                    # Handle case where prediction doesn't match any mapping
                    print(f"Warning: Predicted label '{predicted_label}' doesn't match any known subject mapping")
            else:
                print(f"Skipping classification for {file_name}: No content available")

        except Exception as e:
            print(f"Classification error for file {file_name}: {str(e)}")
            # Continue processing other files instead of failing completely
            continue

    # Unload BERT model after processing all files
    model_loader.del_models("BERT")
    print("END------------------")

    # content summary (final stage)
    if myList:
        model_loader.del_all_models()
        llama_cpp_manager = model_loader.load_llm(user_setting.llm, DEVICE)

        for file_id, file_name, file_path, category, content in myList:
            if not content:
                continue

            summary = llama_cpp_manager.generate_summary(content)

            content_path = os.path.join("/app/file_storage", user.email, "content_" + file_name)
            summary_path = os.path.join("/app/file_storage", user.email, "summary_" + file_name)

            async with aiofiles.open(content_path, "w") as content_file:
                await content_file.write(content)
            async with aiofiles.open(summary_path, "w") as summary_file:
                await summary_file.write(summary)

            await db_update(FileUpload, file_id, {"content_path": content_path, "summary_path": summary_path})

        model_loader.del_models("LLM")

        return {"Files uploaded & processed"}
    
    return {"Files uploaded but not processed"}

@app.post("/view-extract/{id}")
async def view_extract(id: str, token: str = Depends(oauth2_scheme)):
    user_id = verify_jwt_token(token)
    user = await db_get_by_id(User, user_id)
    user_setting = next(iter(await db_get_by_attribute(UserSetting, "user_id", user_id)), None)

    # retrieve file
    file = await db_get_by_id(FileUpload, id)
    shared_file_list = await db_get_by_attribute(SharedFile, "file_id", id)
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    if user_id != file.user_id and not any(user_id == shared_file.user_id for shared_file in shared_file_list):
        raise HTTPException(status_code=403, detail="You are not authorized to view this file")
    
    content, summary, subject = None, None, None
    
    subject = file.subject.value if file.subject else "Unknown"
    
    # retrieve content and summary if information has been extracted before
    if file.content_path and file.summary_path and file.content_path.strip() and file.summary_path.strip():
        async with aiofiles.open(file.content_path, "r") as content_file:
            content = await content_file.read()
        async with aiofiles.open(file.summary_path, "r") as summary_file:
            summary = await summary_file.read()

        return {"content": content, "summary": summary, "subject": subject}
      
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
                            
            # Image to text
            if is_image(temp.name):
                try:
                    # Open the image file in binary mode
                    with open(temp.name, "rb") as image_file:
                        image_bytes = image_file.read()  # Read the image as bytes

                        # Send the image to Hugging Face API
                        response = requests.post(HUGGING_FACE_URL, files={"image": image_bytes})

                        if response.status_code == 200:
                            content = response.json()["prediction"]  # Extract the prediction from the response
                        else:
                            print(f"Error: {response.status_code} - {response.text}")
                            content = None
                except Exception as e:
                    print(f"Error processing image: {e}")
                    content = None
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
                
                async with aiofiles.open(content_path, "w") as content_file:
                    await content_file.write(content)
                async with aiofiles.open(summary_path, "w") as summary_file:
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
async def predict_text(
    text: Optional[str] = Form(None),
    files: List[UploadFile] = File(default=None)
):
    # 1. error check
    if not text and not files:
        raise HTTPException(status_code=400, detail="No text or file uploaded")

    response = {}
    
    # Print received files
    print("Received files:", [file.filename for file in files] if files else "No files")

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
                        print(f"Before DOCX extraction: {temp.name}")
                        extracted_text += extract_text_from_docx(temp.name)
                        print(f"After DOCX extraction: {extracted_text}")
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

    cleaned_text = re.sub(r"[^a-zA-Z0-9\s,!?-]", "", combined_text)
    cleaned_text = " ".join(cleaned_text.split())

    # 3. predict subject for combined text
    if cleaned_text:
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