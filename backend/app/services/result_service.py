from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.domain import *
from app.constants.roles import Role
from app.constants.status import ResultStatus,NotificationType
from app.services.notification_service import create as notify
from app.utils.scoring import calculate_points

def submit(db,u,d):
    t=db.get(Tournament,d.tournamentId); room=db.get(MatchRoom,d.matchRoomId)
    if not t or not room: raise HTTPException(404,"Tournament or match room not found")
    team=db.scalar(select(Team).join(TeamMember).where(TeamMember.user_id==u.id))
    if not team: raise HTTPException(400,"You are not in any team")
    if not db.scalar(select(TournamentRegistration).where(TournamentRegistration.tournament_id==t.id,TournamentRegistration.team_id==team.id)): raise HTTPException(400,"Team is not registered in this tournament")
    if room.tournament_id!=t.id: raise HTTPException(400,"Match room does not belong to this tournament")
    if db.scalar(select(ResultSubmission).where(ResultSubmission.team_id==team.id,ResultSubmission.match_room_id==room.id,ResultSubmission.status==ResultStatus.PENDING)): raise HTTPException(400,"A pending submission already exists")
    s=ResultSubmission(team_id=team.id,tournament_id=t.id,match_room_id=room.id,submitted_by=u.id,kills=d.kills,position=d.position); db.add(s); db.commit(); db.refresh(s); return s

def pending(db,u):
    q=select(ResultSubmission).where(ResultSubmission.status==ResultStatus.PENDING).order_by(ResultSubmission.created_at.desc())
    if u.role==Role.ORGANIZER:q=q.join(Tournament,ResultSubmission.tournament_id==Tournament.id).where(Tournament.created_by==u.id)
    return db.scalars(q).unique().all()
def mine(db,u): return db.scalars(select(ResultSubmission).where(ResultSubmission.submitted_by==u.id).order_by(ResultSubmission.created_at.desc())).all()
def approve(db,u,sid):
    s=db.get(ResultSubmission,sid)
    if not s: raise HTTPException(404,"Submission not found")
    if s.status!=ResultStatus.PENDING: raise HTTPException(400,f"Submission already {s.status.value}")
    if u.role==Role.ORGANIZER and s.tournament.created_by!=u.id: raise HTTPException(403,"You can only review your own tournament submissions")
    kp,pp,total=calculate_points(s.kills,s.position)
    existing=db.scalar(select(MatchResult).where(MatchResult.team_id==s.team_id,MatchResult.match_room_id==s.match_room_id))
    if existing: raise HTTPException(400,"A final result already exists for this team and match")
    r=MatchResult(team_id=s.team_id,tournament_id=s.tournament_id,match_room_id=s.match_room_id,kills=s.kills,position=s.position,kill_points=kp,placement_points=pp,total_points=total); db.add(r); s.status=ResultStatus.APPROVED; notify(db,s.submitted_by,"Result Approved","Your result submission has been approved.",NotificationType.RESULT_SUBMISSION); db.commit(); db.refresh(r); return r

def reject(db,u,sid,note):
    s=db.get(ResultSubmission,sid)
    if not s: raise HTTPException(404,"Submission not found")
    if s.status!=ResultStatus.PENDING: raise HTTPException(400,f"Submission already {s.status.value}")
    if u.role==Role.ORGANIZER and s.tournament.created_by!=u.id: raise HTTPException(403,"You can only review your own tournament submissions")
    s.status=ResultStatus.REJECTED; s.admin_note=note; notify(db,s.submitted_by,"Result Rejected",note or "Your result submission was rejected.",NotificationType.RESULT_SUBMISSION); db.commit(); db.refresh(s); return s
