from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select,func
from app.dependencies.database import get_db
from app.dependencies.auth import require_roles
from app.constants.roles import Role
from app.models.domain import *
from app.schemas.team import TeamUpdate
from app.utils.serializers import team_dict
router=APIRouter()
admin=Depends(require_roles(Role.ADMIN,Role.SUPER_ADMIN))
@router.get('/users')
def users(db:Session=Depends(get_db),u=admin):
    us=db.scalars(select(User).order_by(User.created_at.desc())).all(); return {"count":len(us),"users":[{"_id":str(x.id),"name":x.name,"email":x.email,"ign":x.ign,"bgmiUID":x.bgmi_uid,"role":x.role.value,"createdAt":x.created_at,"updatedAt":x.updated_at} for x in us]}
@router.delete('/users/{user_id}')
def delete_user(user_id:str,db:Session=Depends(get_db),u=admin):
    x=db.get(User,user_id)
    if not x: raise HTTPException(404,"User not found")
    if x.id==u.id: raise HTTPException(400,"You cannot delete your own account")
    if x.role==Role.SUPER_ADMIN: raise HTTPException(403,"SuperAdmin account cannot be deleted")
    if x.role==Role.ADMIN and u.role!=Role.SUPER_ADMIN: raise HTTPException(403,"Only SuperAdmin can delete admin users")
    db.delete(x);db.commit();return {"message":"User deleted successfully"}
@router.delete('/teams/{team_id}')
def delete_team(team_id:str,db:Session=Depends(get_db),u=admin):
    x=db.get(Team,team_id)
    if not x: raise HTTPException(404,"Team not found")
    db.delete(x);db.commit();return {"message":"Team deleted successfully"}
@router.patch('/teams/{team_id}')
def update_team(team_id:str,data:TeamUpdate,db:Session=Depends(get_db),u=admin):
    x=db.get(Team,team_id)
    if not x: raise HTTPException(404,"Team not found")
    if data.teamName is not None:
        name=data.teamName.lower().strip()
        if db.scalar(select(Team).where(func.lower(Team.team_name)==name,Team.id!=x.id)): raise HTTPException(400,"Team name already exists")
        x.team_name=name
    if data.maxPlayers is not None:
        if data.maxPlayers < len(x.members): raise HTTPException(400,"Max players cannot be less than current team players")
        x.max_players=data.maxPlayers
    db.commit();db.refresh(x);return {"message":"Team updated successfully","team":team_dict(x)}
@router.get('/dashboard-stats')
def stats(db:Session=Depends(get_db),u=admin):
    total_users=db.scalar(select(func.count()).select_from(User)); players=db.scalar(select(func.count()).select_from(User).where(User.role==Role.PLAYER)); orgs=db.scalar(select(func.count()).select_from(User).where(User.role==Role.ORGANIZER)); admins=db.scalar(select(func.count()).select_from(User).where(User.role==Role.ADMIN)); sas=db.scalar(select(func.count()).select_from(User).where(User.role==Role.SUPER_ADMIN)); teams=db.scalar(select(func.count()).select_from(Team)); ts=db.scalar(select(func.count()).select_from(Tournament)); upcoming=db.scalar(select(func.count()).select_from(Tournament).where(Tournament.status=="upcoming")); live=db.scalar(select(func.count()).select_from(Tournament).where(Tournament.status=="live")); completed=db.scalar(select(func.count()).select_from(Tournament).where(Tournament.status=="completed")); rooms=db.scalar(select(func.count()).select_from(MatchRoom)); results=db.scalar(select(func.count()).select_from(MatchResult)); prizes=db.scalars(select(PrizeDistribution)).all(); total_prize=sum(float(p.first_amount+p.second_amount+p.third_amount) for p in prizes)
    return {"message":"Dashboard stats fetched successfully","stats":{"users":{"totalUsers":total_users,"totalPlayers":players,"totalOrganizers":orgs,"totalAdmins":admins,"totalSuperAdmins":sas},"teams":{"totalTeams":teams},"tournaments":{"totalTournaments":ts,"upcomingTournaments":upcoming,"liveTournaments":live,"completedTournaments":completed},"matches":{"totalMatchRooms":rooms,"totalMatchResults":results},"prizes":{"totalPrizeDistributed":total_prize}}}
