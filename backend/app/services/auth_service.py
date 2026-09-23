import re
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.domain import User
from app.repositories.user_repository import UserRepository
from app.core.security import hash_password, verify_password, create_access_token
from app.constants.roles import Role
from app.utils.serializers import user_dict

def register(db:Session,data):
    name=data.name.strip(); email=str(data.email).lower().strip(); uid=data.bgmiUID.strip(); ign=data.ign.strip()
    if not re.fullmatch(r"[A-Za-z ]{2,50}",name): raise HTTPException(400,"Name should contain only letters and spaces")
    if not re.fullmatch(r"(?=.*[A-Za-z])(?=.*\d).{6,}",data.password): raise HTTPException(400,"Password must be at least 6 characters and include one letter and one number")
    repo=UserRepository(db)
    if repo.by_email(email): raise HTTPException(400,"User already exists with this email")
    if repo.by_bgmi_uid(uid): raise HTTPException(400,"BGMI UID already exists")
    u=User(name=name,email=email,password=hash_password(data.password),ign=ign,bgmi_uid=uid,role=Role.PLAYER)
    db.add(u); db.commit(); db.refresh(u)
    return {"token":create_access_token(u.id),"user":user_dict(u)}

def login(db:Session,data):
    u=UserRepository(db).by_email(str(data.email).lower().strip())
    if not u or not verify_password(data.password,u.password): raise HTTPException(401,"Invalid email or password")
    return {"token":create_access_token(u.id),"user":user_dict(u)}
