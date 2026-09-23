from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from sqlalchemy import select,update
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.domain import Notification
router=APIRouter()
def nd(n): return {"_id":str(n.id),"user":str(n.user_id),"title":n.title,"message":n.message,"type":n.type.value,"isRead":n.is_read,"createdAt":n.created_at,"updatedAt":n.created_at}
@router.get('/my')
def mine(db:Session=Depends(get_db),u=Depends(get_current_user)):
    ns=db.scalars(select(Notification).where(Notification.user_id==u.id).order_by(Notification.created_at.desc())).all(); return {"message":"Notifications fetched successfully","unreadCount":sum(not n.is_read for n in ns),"count":len(ns),"notifications":[nd(n) for n in ns]}
@router.patch('/read/{notification_id}')
def read(notification_id:str,db:Session=Depends(get_db),u=Depends(get_current_user)):
    n=db.scalar(select(Notification).where(Notification.id==notification_id,Notification.user_id==u.id))
    if not n: from fastapi import HTTPException; raise HTTPException(404,"Notification not found")
    n.is_read=True;db.commit();db.refresh(n);return {"message":"Notification marked as read","notification":nd(n)}
@router.patch('/read-all')
def read_all(db:Session=Depends(get_db),u=Depends(get_current_user)): db.execute(update(Notification).where(Notification.user_id==u.id,Notification.is_read==False).values(is_read=True));db.commit();return {"message":"All notifications marked as read"}
