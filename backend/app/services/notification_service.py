from sqlalchemy import select, update
from sqlalchemy.orm import Session
from app.models.domain import Notification
from app.constants.status import NotificationType

def create(db,user_id,title,message,kind=NotificationType.GENERAL):
    n=Notification(user_id=user_id,title=title,message=message,type=kind); db.add(n); return n

def list_for_user(db,user_id): return db.scalars(select(Notification).where(Notification.user_id==user_id).order_by(Notification.created_at.desc())).all()
