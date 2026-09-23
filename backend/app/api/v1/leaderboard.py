from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from sqlalchemy import select,func
from app.dependencies.database import get_db
from app.models.domain import MatchResult,Team
router=APIRouter()
@router.get('/{tournament_id}')
def leaderboard(tournament_id:str,db:Session=Depends(get_db)):
    rows=db.execute(select(Team.team_name,func.sum(MatchResult.total_points).label('points')).join(MatchResult,MatchResult.team_id==Team.id).where(MatchResult.tournament_id==tournament_id).group_by(Team.id,Team.team_name).order_by(func.sum(MatchResult.total_points).desc())).all();return [{"rank":i+1,"team":r.team_name,"points":int(r.points)} for i,r in enumerate(rows)]
