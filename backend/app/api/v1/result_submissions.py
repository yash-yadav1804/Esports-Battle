from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user,platform_manager
from app.schemas.match import ResultSubmissionCreate,RejectSubmission
from app.services import result_service
router=APIRouter()
def sub_dict(s): return {"_id":str(s.id),"team":str(s.team_id),"tournament":str(s.tournament_id),"matchRoom":str(s.match_room_id),"submittedBy":str(s.submitted_by),"kills":s.kills,"position":s.position,"status":s.status.value,"adminNote":s.admin_note,"createdAt":s.created_at,"updatedAt":s.updated_at}
@router.post('/submit',status_code=201)
def submit(data:ResultSubmissionCreate,db:Session=Depends(get_db),u=Depends(get_current_user)): return {"message":"Result submitted successfully. Waiting for review.","submission":sub_dict(result_service.submit(db,u,data))}
@router.get('/my-submissions')
def mine(db:Session=Depends(get_db),u=Depends(get_current_user)): rs=result_service.mine(db,u); return {"count":len(rs),"submissions":[sub_dict(x) for x in rs]}
@router.get('/pending')
def pending(db:Session=Depends(get_db),u=Depends(platform_manager)): rs=result_service.pending(db,u); return {"count":len(rs),"submissions":[sub_dict(x) for x in rs]}
@router.patch('/approve/{submission_id}')
def approve(submission_id:str,db:Session=Depends(get_db),u=Depends(platform_manager)): 
    r=result_service.approve(db,u,submission_id); return {"message":"Submission approved and match result created successfully","matchResult":result_dict(r)}
def result_dict(r): return {"_id":str(r.id),"team":str(r.team_id),"tournament":str(r.tournament_id),"matchRoom":str(r.match_room_id),"kills":r.kills,"position":r.position,"killPoints":r.kill_points,"placementPoints":r.placement_points,"totalPoints":r.total_points,"createdAt":r.created_at}
@router.patch('/reject/{submission_id}')
def reject(submission_id:str,data:RejectSubmission,db:Session=Depends(get_db),u=Depends(platform_manager)): return {"message":"Submission rejected successfully","submission":sub_dict(result_service.reject(db,u,submission_id,data.adminNote))}
