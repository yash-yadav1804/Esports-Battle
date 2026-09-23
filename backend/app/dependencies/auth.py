from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.domain import User
from app.constants.roles import Role

bearer=HTTPBearer(auto_error=False)

def get_current_user(credentials: HTTPAuthorizationCredentials|None=Depends(bearer), db: Session=Depends(get_db)):
    if not credentials: raise HTTPException(status_code=401, detail="Not authorized, no token")
    user_id=decode_access_token(credentials.credentials)
    user=db.get(User,user_id)
    if not user: raise HTTPException(status_code=401, detail="Token failed")
    return user

def require_roles(*roles: Role):
    def dep(user: User=Depends(get_current_user)):
        if user.role not in roles: raise HTTPException(status_code=403, detail="Access Denied")
        return user
    return dep

def platform_manager(user: User=Depends(get_current_user)):
    if user.role not in {Role.ORGANIZER, Role.ADMIN, Role.SUPER_ADMIN}: raise HTTPException(status_code=403, detail="Access Denied")
    return user
