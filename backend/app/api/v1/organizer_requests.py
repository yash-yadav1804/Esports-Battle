from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user,require_roles
from app.schemas.organizer import OrganizerRequestCreate,OrganizerReview
from app.services import organizer_service
from app.constants.roles import Role
router=APIRouter()
def rd(r): return {"_id":str(r.id),"user":str(r.user_id),"organizationName":r.organization_name,"contactNumber":r.contact_number,"reason":r.reason,"experience":r.experience,"socialLink":r.social_link,"status":r.status,"adminNote":r.admin_note,"reviewedBy":str(r.reviewed_by) if r.reviewed_by else None,"reviewedAt":r.reviewed_at,"createdAt":r.created_at,"updatedAt":r.updated_at}
@router.post('/request',status_code=201)
def create(data:OrganizerRequestCreate,db:Session=Depends(get_db),u=Depends(get_current_user)): return rd(organizer_service.create(db,u,data))
@router.get('/my-requests')
def mine(db:Session=Depends(get_db),u=Depends(get_current_user)): rs=organizer_service.mine(db,u);return {"count":len(rs),"requests":[rd(x) for x in rs]}
@router.get('/pending')
def pending(db:Session=Depends(get_db),u=Depends(require_roles(Role.ADMIN,Role.SUPER_ADMIN))): rs=organizer_service.pending(db);return {"count":len(rs),"requests":[rd(x) for x in rs]}
@router.patch('/approve/{request_id}')
def approve(request_id:str,data:OrganizerReview,db:Session=Depends(get_db),u=Depends(require_roles(Role.ADMIN,Role.SUPER_ADMIN))): return {"message":"Organizer request approved","request":rd(organizer_service.review(db,u,request_id,True,data.adminNote))}
@router.patch('/reject/{request_id}')
def reject(request_id:str,data:OrganizerReview,db:Session=Depends(get_db),u=Depends(require_roles(Role.ADMIN,Role.SUPER_ADMIN))): return {"message":"Organizer request rejected","request":rd(organizer_service.review(db,u,request_id,False,data.adminNote))}
