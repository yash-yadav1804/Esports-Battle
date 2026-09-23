from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.models.domain import *
router=APIRouter()
@router.post('/join/{room_id}',status_code=201)
def join(room_id:str,db:Session=Depends(get_db),u=Depends(get_current_user)):
    room=db.get(MatchRoom,room_id)
    if not room: raise HTTPException(404,"Match room not found")
    team=db.scalar(select(Team).join(TeamMember).where(TeamMember.user_id==u.id))
    if not team: raise HTTPException(400,"You are not in any team")
    if db.scalar(select(MatchRegistration).where(MatchRegistration.player_id==u.id,MatchRegistration.match_room_id==room.id)): raise HTTPException(400,"Already joined this match room")
    r=MatchRegistration(player_id=u.id,team_id=team.id,match_room_id=room.id,bgmi_name=u.ign,bgmi_id=u.bgmi_uid);db.add(r);db.commit();db.refresh(r);return {"message":"Joined match room successfully","registration":{"_id":str(r.id),"player":str(r.player_id),"team":str(r.team_id),"matchRoom":str(r.match_room_id),"bgmiName":r.bgmi_name,"bgmiId":r.bgmi_id,"status":r.status,"createdAt":r.created_at}}
