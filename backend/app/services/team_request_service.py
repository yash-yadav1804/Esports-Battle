from fastapi import HTTPException
from sqlalchemy import select, and_
from sqlalchemy.orm import Session
from app.models.domain import Team,TeamMember,TeamRequest
from app.constants.status import TeamRequestStatus,NotificationType
from app.services.notification_service import create as notify

def send(db,user,team_id):
    t=db.get(Team,team_id)
    if not t: raise HTTPException(404,"Team not found")
    if db.scalar(select(TeamMember).where(TeamMember.user_id==user.id)): raise HTTPException(400,"You are already in a team")
    count=len(t.members)
    if count>=t.max_players: raise HTTPException(400,"Team is full")
    existing=db.scalar(select(TeamRequest).where(TeamRequest.team_id==team_id,TeamRequest.player_id==user.id,TeamRequest.status==TeamRequestStatus.PENDING))
    if existing: raise HTTPException(400,"Request already sent")
    r=TeamRequest(team_id=team_id,player_id=user.id); db.add(r); notify(db,t.igl_id,"New Team Request",f"{user.name} wants to join your team {t.team_name}",NotificationType.TEAM_REQUEST); db.commit(); db.refresh(r); return r

def get_for_team(db,user,team_id):
    t=db.get(Team,team_id)
    if not t: raise HTTPException(404,"Team not found")
    if t.igl_id!=user.id: raise HTTPException(403,"Only IGL can view team requests")
    return db.scalars(select(TeamRequest).where(TeamRequest.team_id==team_id,TeamRequest.status==TeamRequestStatus.PENDING).order_by(TeamRequest.created_at.desc())).all()

def review(db,user,request_id,accept):
    r=db.get(TeamRequest,request_id)
    if not r: raise HTTPException(404,"Request not found")
    if r.status!=TeamRequestStatus.PENDING: raise HTTPException(400,f"Request already {r.status.value}")
    t=db.get(Team,r.team_id)
    if t.igl_id!=user.id: raise HTTPException(403,"Only IGL can review requests")
    if accept:
        if db.scalar(select(TeamMember).where(TeamMember.team_id==t.id,TeamMember.user_id==r.player_id)):
            r.status=TeamRequestStatus.ACCEPTED; db.commit(); raise HTTPException(400,"Player is already in the team")
        if len(t.members)>=t.max_players: raise HTTPException(400,"Team is full")
        if db.scalar(select(TeamMember).where(TeamMember.user_id==r.player_id)): raise HTTPException(400,"Player is already in another team")
        db.add(TeamMember(team_id=t.id,user_id=r.player_id)); r.status=TeamRequestStatus.ACCEPTED; notify(db,r.player_id,"Team Request Approved",f"Your request to join team {t.team_name} has been approved.",NotificationType.TEAM_REQUEST)
    else:
        r.status=TeamRequestStatus.REJECTED; notify(db,r.player_id,"Team Request Rejected",f"Your request to join team {t.team_name} has been rejected.",NotificationType.TEAM_REQUEST)
    db.commit(); db.refresh(r); return r
