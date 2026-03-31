from sqlalchemy import Column, String, Boolean, Text
from database import Base

class Voter(Base):
    __tablename__ = "voters"

    voter_id = Column(String, primary_key=True, index=True)
    aadhar_id = Column(String, unique=True, index=True)
    name = Column(String)
    face_encoding = Column(Text)  # Stored as JSON string to persist a list of floats
    has_voted = Column(Boolean, default=False)
