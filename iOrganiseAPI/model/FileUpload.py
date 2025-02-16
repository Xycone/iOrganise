from sqlalchemy import Column, Integer, String, ForeignKey, Enum as SqlEnum
from sqlalchemy.orm import relationship
from database import Base

from enums.SubjectTypes import SubjectTypes

class FileUpload(Base):
    __tablename__ = "file_uploads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    type = Column(String(20), nullable=False)
    size = Column(Integer, nullable=False)
    path = Column(String(255), unique=True, index=True, nullable=False)
    subject = Column(SqlEnum(SubjectTypes), nullable=False)
    content_path = Column(String(255), unique=True, index=True, nullable=True)
    summary_path = Column(String(255), unique=True, index=True, nullable=True)
    user_id = Column(Integer, ForeignKey('users.id'))

    user = relationship("User", back_populates="file_uploads")