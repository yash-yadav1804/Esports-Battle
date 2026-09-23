from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.schemas.profile import ProfileUpdate
from app.models.domain import User,Team,TeamMember,Tournament,TournamentRegistration,MatchResult
from app.utils.serializers import user_dict,team_dict,tournament_dict
router=APIRouter()
@router.get('/me')
def me(u=Depends(get_current_user)): return {"message":"Profile fetched successfully","user":user_dict(u)}
@router.get('/my-team')
def myteam(db:Session=Depends(get_db),u=Depends(get_current_user)):
    t=db.scalar(select(Team).join(TeamMember).where(TeamMember.user_id==u.id)); return {"message":"Team fetched successfully","team":team_dict(t) if t else None}
@router.get('/my-tournaments')
def myt(db:Session=Depends(get_db),u=Depends(get_current_user)):
    t=db.scalar(select(Team).join(TeamMember).where(TeamMember.user_id==u.id))
    ts=db.scalars(select(Tournament).join(TournamentRegistration).where(TournamentRegistration.team_id==t.id).order_by(Tournament.created_at.desc())).unique().all() if t else []
    return {"message":"My tournaments fetched successfully","count":len(ts),"tournaments":[tournament_dict(x,False) for x in ts]}
@router.get('/my-match-history')
def history(db:Session=Depends(get_db),u=Depends(get_current_user)):
    t=db.scalar(select(Team).join(TeamMember).where(TeamMember.user_id==u.id)); rs=db.scalars(select(MatchResult).where(MatchResult.team_id==t.id).order_by(MatchResult.created_at.desc())).all() if t else []
    out=[{"_id":str(r.id),"team":str(r.team_id),"tournament":{"_id":str(r.tournament.id),"title":r.tournament.title,"game":r.tournament.game,"mode":r.tournament.mode,"status":r.tournament.status.value},"matchRoom":{"_id":str(r.match_room.id),"roomId":r.match_room.room_id,"matchNumber":r.match_room.match_number,"status":r.match_room.status.value},"kills":r.kills,"position":r.position,"killPoints":r.kill_points,"placementPoints":r.placement_points,"totalPoints":r.total_points,"createdAt":r.created_at} for r in rs]
    return {"message":"Match history fetched successfully","count":len(out),"matchHistory":out}
@router.patch('/update')
def update(data:ProfileUpdate,db:Session=Depends(get_db),u=Depends(get_current_user)):
    if data.bgmiUID is not None:
        if db.scalar(select(User).where(User.bgmi_uid==data.bgmiUID,User.id!=u.id)): raise Exception("BGMI UID already exists")
        u.bgmi_uid=data.bgmiUID
    if data.name is not None:u.name=data.name
    if data.ign is not None:u.ign=data.ign
    db.commit();db.refresh(u);return {"message":"Profile updated successfully","user":user_dict(u)}
