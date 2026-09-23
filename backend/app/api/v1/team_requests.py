from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.services import team_request_service
router=APIRouter()
@router.post('/send/{team_id}',status_code=201)
def send(team_id:str,db:Session=Depends(get_db),u=Depends(get_current_user)): return {"message":"Join request sent successfully","request":team_request_service.send(db,u,team_id)}
@router.get('/team/{team_id}')
def get(team_id:str,db:Session=Depends(get_db),u=Depends(get_current_user)):
    rs=team_request_service.get_for_team(db,u,team_id); return {"count":len(rs),"requests":[{"_id":str(r.id),"team":str(r.team_id),"player":{"_id":str(r.player.id),"name":r.player.name,"email":r.player.email,"ign":r.player.ign,"bgmiUID":r.player.bgmi_uid},"status":r.status.value,"createdAt":r.created_at} for r in rs]}
@router.patch('/approve/{request_id}')
def approve(request_id:str,db:Session=Depends(get_db),u=Depends(get_current_user)): return {"message":"Player added to team successfully","request":team_request_service.review(db,u,request_id,True)}
@router.patch('/reject/{request_id}')
def reject(request_id:str,db:Session=Depends(get_db),u=Depends(get_current_user)): return {"message":"Request rejected successfully","request":team_request_service.review(db,u,request_id,False)}
