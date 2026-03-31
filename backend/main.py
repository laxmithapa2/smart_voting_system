from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json

from models.schemas import VoteCasting, BlockchainResponse, RegisterRequest, AuthRequest
from blockchain.chain import Blockchain
from auth.face_engine import verify_face, extract_face_encoding
import uvicorn

# Import database and models
from database import engine, get_db
from models import db_models

# Create DB tables
db_models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Voting System API")

# Setup CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

blockchain = Blockchain()

# Hardcoded candidates for prototype
CANDIDATES = [
    {"id": "A", "name": "Alice Smith", "party": "Progressive Party"},
    {"id": "B", "name": "Bob Jones", "party": "Conservative Party"},
    {"id": "C", "name": "Charlie Brown", "party": "Independent"}
]

@app.get("/")
def read_root():
    return {"message": "Welcome to the Blockchain Smart Voting API"}

@app.post("/register")
async def register_voter(request: RegisterRequest, db: Session = Depends(get_db)):
    existing_voter = db.query(db_models.Voter).filter(db_models.Voter.voter_id == request.voter_id).first()
    if existing_voter:
        raise HTTPException(status_code=400, detail="Voter ID already registered")
        
    encoding = extract_face_encoding(request.image)
    if not encoding:
        raise HTTPException(status_code=400, detail="No face detected in image. Please retake photo.")
        
    new_voter = db_models.Voter(
        voter_id=request.voter_id,
        aadhar_id=request.aadhar_id,
        name=request.name,
        face_encoding=json.dumps(encoding),
        has_voted=False
    )
    db.add(new_voter)
    db.commit()
    db.refresh(new_voter)
    
    return {"message": "Voter registered successfully", "voter_id": new_voter.voter_id}

@app.post("/authenticate")
async def authenticate_voter(request: AuthRequest, db: Session = Depends(get_db)):
    voter = db.query(db_models.Voter).filter(db_models.Voter.voter_id == request.voter_id).first()
    if not voter:
        raise HTTPException(status_code=404, detail="Voter ID not fully registered in system.")
        
    # Verify Aadhar
    if voter.aadhar_id != request.aadhar_id:
        raise HTTPException(status_code=401, detail="Invalid Aadhar details provided.")
    
    # Verify Face
    saved_encoding = json.loads(voter.face_encoding)
    is_match = verify_face(saved_encoding, request.image)
    if not is_match:
        raise HTTPException(status_code=401, detail="Face authentication failed. Biometrics do not match.")
        
    return {
        "message": "Authentication successful", 
        "authenticated": True, 
        "voter_name": voter.name, 
        "has_voted": voter.has_voted
    }

@app.post("/vote")
async def cast_vote(vote_data: VoteCasting, db: Session = Depends(get_db)):
    voter_id = vote_data.voter_id
    candidate_id = vote_data.candidate_id
    
    voter = db.query(db_models.Voter).filter(db_models.Voter.voter_id == voter_id).first()
    
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found. Please register.")
        
    if voter.has_voted:
        raise HTTPException(status_code=403, detail="Voter has already cast a vote!")
        
    # Create transaction
    transaction = {
        "voter_id_hash": str(hash(voter_id)), # Anonymize voter id on blockchain
        "candidate_id": candidate_id
    }
    
    blockchain.add_new_transaction(transaction)
    # Mine immediately for prototype purposes
    blockchain.mine()
    
    # Mark as voted
    voter.has_voted = True
    db.commit()
    
    return {"message": "Vote successfully cast and added to blockchain"}

@app.get("/candidates")
def get_candidates():
    return {"candidates": CANDIDATES}

@app.get("/chain", response_model=BlockchainResponse)
def get_chain():
    chain_data = []
    for block in blockchain.chain:
        chain_data.append(block.__dict__)
    return {"chain": chain_data, "length": len(chain_data)}

@app.get("/results")
def get_results():
    # Tally votes from blockchain
    results = {c["id"]: 0 for c in CANDIDATES}
    
    for block in blockchain.chain:
        for tx in block.transactions:
            cid = tx.get("candidate_id")
            if cid in results:
                results[cid] += 1
                
    return {"results": results}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
