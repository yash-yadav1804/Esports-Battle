from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.dependencies.database import get_db
from app.dependencies.auth import require_roles
from app.constants.roles import Role
from app.schemas.match import ResultCreate
from app.models.domain import MatchResult,Team,Tournament,MatchRoom
from app.utils.scoring import calculate_points
router=APIRouter()
@router.post('/add',status_code=201)
def add(data:ResultCreate,db:Session=Depends(get_db),u=Depends(require_roles(Role.ADMIN))):
    team=db.get(Team,data.team);t=db.get(Tournament,data.tournament);room=db.get(MatchRoom,data.matchRoom)
    if not team or not t or not room: raise HTTPException(404,"Team, tournament or match room not found")
    if room.tournament_id!=t.id: raise HTTPException(400,"Match room does not belong to tournament")
    kp,pp,total=calculate_points(data.kills,data.position);r=MatchResult(team_id=team.id,tournament_id=t.id,match_room_id=room.id,kills=data.kills,position=data.position,kill_points=kp,placement_points=pp,total_points=total);db.add(r);db.commit();db.refresh(r);return {"message":"Match result added successfully","result":{"_id":str(r.id),"team":str(r.team_id),"tournament":str(r.tournament_id),"matchRoom":str(r.match_room_id),"kills":r.kills,"position":r.position,"killPoints":r.kill_points,"placementPoints":r.placement_points,"totalPoints":r.total_points,"createdAt":r.created_at}}
@router.get('/')
def all(db:Session=Depends(get_db)):
    rs=db.scalars(select(MatchResult).order_by(MatchResult.created_at.desc())).all();return [{"_id":str(r.id),"team":{"_id":str(r.team_id),"teamName":r.team.team_name},"tournament":{"_id":str(r.tournament_id),"title":r.tournament.title},"matchRoom":{"_id":str(r.match_room_id),"roomId":r.match_room.room_id},"kills":r.kills,"position":r.position,"killPoints":r.kill_points,"placementPoints":r.placement_points,"totalPoints":r.total_points,"createdAt":r.created_at} for r in rs]
