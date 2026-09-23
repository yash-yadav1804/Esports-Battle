from datetime import datetime,timezone
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.domain import OrganizerRequest,User
from app.constants.roles import Role

def create(db,u,d):
    if u.role==Role.ORGANIZER: raise HTTPException(400,"You are already an organizer")
    if u.role in {Role.ADMIN,Role.SUPER_ADMIN}: raise HTTPException(400,"Admins cannot apply as organizers")
    pending=db.scalar(select(OrganizerRequest).where(OrganizerRequest.user_id==u.id,OrganizerRequest.status=='pending'))
    if pending: raise HTTPException(400,"You already have a pending organizer request")
    r=OrganizerRequest(user_id=u.id,organization_name=d.organizationName.strip(),contact_number=d.contactNumber.strip(),reason=d.reason.strip(),experience=d.experience.strip(),social_link=d.socialLink.strip()); db.add(r); db.commit(); db.refresh(r); return r

def mine(db,u): return db.scalars(select(OrganizerRequest).where(OrganizerRequest.user_id==u.id).order_by(OrganizerRequest.created_at.desc())).all()
def pending(db): return db.scalars(select(OrganizerRequest).where(OrganizerRequest.status=='pending').order_by(OrganizerRequest.created_at.desc())).all()
def review(db,u,rid,approve,note):
    r=db.get(OrganizerRequest,rid)
    if not r: raise HTTPException(404,"Organizer request not found")
    if r.status!='pending': raise HTTPException(400,f"Request already {r.status}")
    r.status='approved' if approve else 'rejected'; r.admin_note=note; r.reviewed_by=u.id; r.reviewed_at=datetime.now(timezone.utc)
    if approve:
        user=db.get(User,r.user_id); user.role=Role.ORGANIZER
    db.commit(); db.refresh(r); return r
