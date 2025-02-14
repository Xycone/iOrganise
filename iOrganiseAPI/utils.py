from fastapi import HTTPException, UploadFile

import os
import gc

import torch
import tempfile
import aiofiles
import magic

import fitz
from typing import Optional
from docx import Document

from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt

# filetype check
def get_file_type(path):
    try:
        mime = magic.Magic(mime=True)
        return mime.from_file(path)
    except Exception as e:
        return None
    
def is_video(path):
    file_type = get_file_type(path)
    return bool(file_type) and file_type.startswith("video/")

def is_audio(path):
    file_type = get_file_type(path)
    return bool(file_type) and file_type.startswith("audio/")

def is_text(path):
    return

def extract_text_from_pdf(pdf_path: str) -> str:
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def extract_text_from_docx(docx_path: str) -> str:
    doc = Document(docx_path)
    text = ""
    for para in doc.paragraphs:
        text += para.text
    return text

def extract_text_from_txt(txt_path: str) -> str:
    with open(txt_path, 'r', encoding='utf-8') as file:
        return file.read()

# file uploading
async def save_uploaded_file(email: str, file: UploadFile):
    try:
        file_content = await file.read()

        with tempfile.NamedTemporaryFile(delete=True) as temp_file:
            temp_file.write(file_content)
            type = get_file_type(temp_file.name) if get_file_type(temp_file.name) else 'unknown'

        size = round(file.size / (1024 * 1024), 2)
        path = os.path.join("/app/file_storage", email, file.filename)
        
        async with aiofiles.open(path, 'wb') as output_file:
            await output_file.write(file_content)

        return type, size, path

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