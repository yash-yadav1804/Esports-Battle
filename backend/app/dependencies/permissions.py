from fastapi import HTTPException
from app.constants.roles import Role

def ensure_platform_admin(user):
    if user.role not in {Role.ADMIN, Role.SUPER_ADMIN}: raise HTTPException(status_code=403, detail="Access Denied")

def ensure_super_admin(user):
    if user.role != Role.SUPER_ADMIN: raise HTTPException(status_code=403, detail="Only SuperAdmin can perform this action")
