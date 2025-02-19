from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)

    file_uploads = relationship("FileUpload", back_populates="user")
    user_settings = relationship("UserSetting", back_populates="user", uselist=False)
    shared_files = relationship("SharedFile", back_populates="user")