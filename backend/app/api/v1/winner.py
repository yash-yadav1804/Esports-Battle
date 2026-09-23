from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select,func
from app.dependencies.database import get_db
from app.models.domain import MatchResult,Team
router=APIRouter()
@router.get('/{tournament_id}')
def winner(tournament_id:str,db:Session=Depends(get_db)):
    r=db.execute(select(Team.team_name,func.sum(MatchResult.total_points).label('points')).join(MatchResult,MatchResult.team_id==Team.id).where(MatchResult.tournament_id==tournament_id).group_by(Team.id,Team.team_name).order_by(func.sum(MatchResult.total_points).desc())).first()
    if not r: raise HTTPException(404,"No results found")
    return {"rank":1,"team":r.team_name,"points":int(r.points)}
