from fastapi import HTTPException, UploadFile

import os
import gc

import torch
import aiofiles
import filetype

from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt

# filetype check
def is_video(path):
    mime_types = ["video/mp4", "video/mpeg", "video/webm"]

    file_type = filetype.guess(path)
    if file_type is None:
        return False

    return file_type.mime in mime_types

def is_audio(path):
    mime_types = ['audio/mp3', 'audio/mpga', 'audio/m4a', 'audio/wav']

    file_type = filetype.guess(path)
    if file_type is None:
        return False

    return file_type.mime in mime_types

def is_text(path):
    mime_types = [
        'text/plain',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/pdf'
    ]

    file_type = filetype.guess(path)
    if file_type is None:
        return False

    return file_type.mime in mime_types

# file uploading
def get_file_info(file: UploadFile):
    try:
        file_content = file.file.read()
        size = round(len(file_content) / (1024 * 1024), 2)  # Size in MB

        type = filetype.guess(file_content)
        return type.mime if type else "unknown", size

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")

async def save_uploaded_file(file: UploadFile):
    try:
        file_location = os.path.join("/app/file_storage", file.filename)
        
        async with aiofiles.open(file_location, 'wb') as out_file:
            while content := await file.read(1024):
                await out_file.write(content)

        return file_location

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file to storage: {str(e)}")

# authentication
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    secret_key = os.getenv('SECRET_KEY')
    if not secret_key:
        raise ValueError("SECRET_KEY environment variable not set.")
    
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=60))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, secret_key, algorithm="HS256")

def verify_jwt_token(token: str):
    try:
        payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms="HS256")
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid JWT token")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid JWT token")

# memory management
def free_memory():
    gc.collect()
    
    if torch.cuda.is_available():
        torch.cuda.empty_cache()