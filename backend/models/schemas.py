from pydantic import BaseModel
from typing import List

class RegisterRequest(BaseModel):
    voter_id: str
    aadhar_id: str
    name: str
    image: str

class AuthRequest(BaseModel):
    voter_id: str
    aadhar_id: str
    image: str

class VoteCasting(BaseModel):
    voter_id: str
    candidate_id: str

class BlockchainResponse(BaseModel):
    chain: List[dict]
    length: int
