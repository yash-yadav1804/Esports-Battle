from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.domain import MatchRoom,Tournament,Team,TeamMember,TournamentRegistration
from app.constants.roles import Role

def can_manage(t,u): return u.role in {Role.ADMIN,Role.SUPER_ADMIN} or (u.role==Role.ORGANIZER and t.created_by==u.id)
def create(db,u,tid,d):
    t=db.get(Tournament,tid)
    if not t: raise HTTPException(404,"Tournament not found")
    if not can_manage(t,u): raise HTTPException(403,"You can manage match rooms only for your own tournaments")
    if t.status.value=='completed': raise HTTPException(400,"Cannot create match room for completed tournament")
    if db.scalar(select(MatchRoom).where(MatchRoom.room_id==d.roomId)): raise HTTPException(400,"Room ID already exists")
    if db.scalar(select(MatchRoom).where(MatchRoom.tournament_id==tid,MatchRoom.match_number==d.matchNumber)): raise HTTPException(400,"Match number already exists for this tournament")
    r=MatchRoom(room_id=d.roomId,room_password=d.roomPassword,match_number=d.matchNumber,map=d.map,match_time=d.matchTime,tournament_id=tid,created_by=u.id); db.add(r); db.commit(); db.refresh(r); return r
def all_rooms(db): return db.scalars(select(MatchRoom).order_by(MatchRoom.created_at.desc())).unique().all()
def my_created(db,u):
    q=select(MatchRoom).order_by(MatchRoom.created_at.desc())
    if u.role not in {Role.ADMIN,Role.SUPER_ADMIN}: q=q.where(MatchRoom.created_by==u.id)
    return db.scalars(q).unique().all()
def eligible(db,u):
    team=db.scalar(select(Team).join(TeamMember).where(TeamMember.user_id==u.id))
    if not team: return []
    tids=db.scalars(select(TournamentRegistration.tournament_id).where(TournamentRegistration.team_id==team.id)).all()
    if not tids:return []
    return db.scalars(select(MatchRoom).where(MatchRoom.tournament_id.in_(tids)).order_by(MatchRoom.match_time)).unique().all()
def get(db,rid):
    r=db.get(MatchRoom,rid)
    if not r: raise HTTPException(404,"Match room not found")
    return r
def update(db,u,rid,d):
    r=get(db,rid); t=r.tournament
    if not can_manage(t,u): raise HTTPException(403,"You can manage match rooms only for your own tournaments")
    if t.status.value=='completed': raise HTTPException(400,"Cannot update match room for completed tournament")
    if d.roomId is not None and db.scalar(select(MatchRoom).where(MatchRoom.room_id==d.roomId,MatchRoom.id!=r.id)): raise HTTPException(400,"Room ID already exists")
    if d.matchNumber is not None and db.scalar(select(MatchRoom).where(MatchRoom.tournament_id==r.tournament_id,MatchRoom.match_number==d.matchNumber,MatchRoom.id!=r.id)): raise HTTPException(400,"Match number already exists for this tournament")
    for k,v in [("room_id",d.roomId),("room_password",d.roomPassword),("match_number",d.matchNumber),("map",d.map),("match_time",d.matchTime)]:
        if v is not None:setattr(r,k,v)
    db.commit(); db.refresh(r); return r
def delete(db,u,rid):
    r=get(db,rid)
    if not can_manage(r.tournament,u): raise HTTPException(403,"You can manage match rooms only for your own tournaments")
    if r.tournament.status.value=='completed': raise HTTPException(400,"Cannot delete match room for completed tournament")
    db.delete(r); db.commit()
