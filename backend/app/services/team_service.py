from fastapi import HTTPException
from sqlalchemy import select, func, delete
from sqlalchemy.orm import Session
from app.models.domain import Team,TeamMember,User,TeamRequest,TournamentRegistration
from app.constants.roles import Role
from app.utils.serializers import team_dict

def my_team(db,user): return db.scalar(select(Team).join(TeamMember).where(TeamMember.user_id==user.id))
def create(db,user,data):
    if my_team(db,user): raise HTTPException(400,"You are already in a team")
    name=data.teamName.strip().lower()
    if not name: raise HTTPException(400,"Team name cannot be empty")
    if db.scalar(select(Team).where(func.lower(Team.team_name)==name)): raise HTTPException(400,"Team name already exists")
    t=Team(team_name=name,igl_id=user.id,max_players=4); db.add(t); db.flush(); db.add(TeamMember(team_id=t.id,user_id=user.id)); db.commit(); db.refresh(t); return t
def all_teams(db): return db.scalars(select(Team).order_by(Team.created_at.desc())).unique().all()
def get(db,tid):
    t=db.get(Team,tid)
    if not t: raise HTTPException(404,"Team not found")
    return t
def join(db,user,tid):
    if my_team(db,user): raise HTTPException(400,"You are already in a team")
    t=get(db,tid); count=db.scalar(select(func.count()).select_from(TeamMember).where(TeamMember.team_id==t.id))
    if count>=t.max_players: raise HTTPException(400,"Team is full")
    db.add(TeamMember(team_id=t.id,user_id=user.id)); db.commit(); db.refresh(t); return t
def leave(db,user):
    t=my_team(db,user)
    if not t: raise HTTPException(400,"You are not in any team")
    if t.igl_id==user.id:
        members=db.scalars(select(TeamMember).where(TeamMember.team_id==t.id).order_by(TeamMember.joined_at)).all()
        remaining=[m for m in members if m.user_id!=user.id]
        if remaining:
            t.igl_id=remaining[0].user_id
        else:
            db.delete(t); db.commit(); return None,True
    m=db.scalar(select(TeamMember).where(TeamMember.team_id==t.id,TeamMember.user_id==user.id)); db.delete(m); db.commit(); return t,False
def remove_player(db,user,player_id):
    t=my_team(db,user)
    if not t or t.igl_id!=user.id: raise HTTPException(403,"Only IGL can remove players")
    if player_id==user.id: raise HTTPException(400,"IGL cannot remove himself")
    m=db.scalar(select(TeamMember).where(TeamMember.team_id==t.id,TeamMember.user_id==player_id))
    if not m: raise HTTPException(404,"Player is not in your team")
    db.delete(m); db.commit(); db.refresh(t); return t
def transfer(db,user,new_id):
    t=my_team(db,user)
    if not t or t.igl_id!=user.id: raise HTTPException(403,"Only IGL can transfer captaincy")
    if not db.scalar(select(TeamMember).where(TeamMember.team_id==t.id,TeamMember.user_id==new_id)): raise HTTPException(400,"New captain must be a team member")
    t.igl_id=new_id; db.commit(); db.refresh(t); return t
