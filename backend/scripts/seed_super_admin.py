import sys
from sqlalchemy import select
from app.core.database import SessionLocal
from app.core.config import settings
from app.core.security import hash_password
from app.models.domain import User
from app.constants.roles import Role

def main():
    if not settings.super_admin_name or not settings.super_admin_email or not settings.super_admin_password:
        print('Set SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD in .env'); return
    db=SessionLocal()
    try:
        existing=db.scalar(select(User).where(User.email==settings.super_admin_email.lower()))
        if existing:
            existing.role=Role.SUPER_ADMIN; existing.name=settings.super_admin_name; existing.password=hash_password(settings.super_admin_password); db.commit(); print('Existing user upgraded to SuperAdmin.')
        else:
            u=User(name=settings.super_admin_name,email=settings.super_admin_email.lower(),password=hash_password(settings.super_admin_password),ign='superadmin',bgmi_uid='00000000',role=Role.SUPER_ADMIN); db.add(u);db.commit();print('SuperAdmin created.')
    finally: db.close()
if __name__=='__main__': main()
