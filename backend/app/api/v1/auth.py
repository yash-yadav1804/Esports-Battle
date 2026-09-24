from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies.database import get_db
from app.schemas.auth import RegisterRequest, LoginRequest
from app.services import auth_service

router = APIRouter()


@router.post("/register", status_code=201)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    result = auth_service.register(db, data)
    return {
        "statusCode": 201,
        "success": True,
        "message": "User registered successfully",
        "data": result,
    }


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    result = auth_service.login(db, data)
    return {
        "statusCode": 200,
        "success": True,
        "message": "User logged in successfully",
        "data": result,
    }
