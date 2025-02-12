from sqlalchemy import Column, Integer, ForeignKey, Enum as SqlEnum
from sqlalchemy.orm import relationship
from database import Base

from enums.AsrModels import AsrModels
from enums.LlmModels import LlmModels

class UserSetting(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    asr_model = Column(SqlEnum(AsrModels), nullable=False)
    llm = Column(SqlEnum(LlmModels), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'))

    user = relationship("User", back_populates="user_settings")