from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select,func
from app.dependencies.database import get_db
from app.models.domain import Tournament,MatchRoom,MatchResult,Team
router=APIRouter()
@router.get('/{tournament_id}')
def dashboard(tournament_id:str,db:Session=Depends(get_db)):
    t=db.get(Tournament,tournament_id)
    if not t: raise HTTPException(404,"Tournament not found")
    rows=db.execute(select(Team.team_name,func.sum(MatchResult.total_points).label('points')).join(MatchResult,MatchResult.team_id==Team.id).where(MatchResult.tournament_id==t.id).group_by(Team.id,Team.team_name).order_by(func.sum(MatchResult.total_points).desc())).all();lb=[{"rank":i+1,"team":r.team_name,"points":int(r.points)} for i,r in enumerate(rows)]
    return {"tournamentName":t.title,"game":t.game,"status":t.status.value,"totalTeams":len(t.registrations),"totalRooms":db.scalar(select(func.count()).select_from(MatchRoom).where(MatchRoom.tournament_id==t.id)),"totalResults":db.scalar(select(func.count()).select_from(MatchResult).where(MatchResult.tournament_id==t.id)),"winner":lb[0]['team'] if lb else 'No Winner Yet',"leaderboard":lb}
