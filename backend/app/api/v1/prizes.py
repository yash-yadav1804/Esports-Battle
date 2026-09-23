from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select,func
from app.dependencies.database import get_db
from app.models.domain import *
from app.dependencies.auth import require_roles
from app.constants.roles import Role
router=APIRouter()
def pdict(p): return {"_id":str(p.id),"tournament":str(p.tournament_id),"firstPlace":{"team":{"_id":str(p.first_team.id),"teamName":p.first_team.team_name} if p.first_team else None,"amount":float(p.first_amount)},"secondPlace":{"team":{"_id":str(p.second_team.id),"teamName":p.second_team.team_name} if p.second_team else None,"amount":float(p.second_amount)},"thirdPlace":{"team":{"_id":str(p.third_team.id),"teamName":p.third_team.team_name} if p.third_team else None,"amount":float(p.third_amount)},"createdAt":p.created_at,"updatedAt":p.updated_at}
@router.get('/{tournament_id}')
def get(tournament_id:str,db:Session=Depends(get_db)):
    p=db.scalar(select(PrizeDistribution).where(PrizeDistribution.tournament_id==tournament_id))
    if not p: raise HTTPException(404,"Prize distribution not found")
    return pdict(p)
@router.post('/generate/{tournament_id}')
def generate(tournament_id:str,db:Session=Depends(get_db),u=Depends(require_roles(Role.ADMIN,Role.SUPER_ADMIN))):
    t=db.get(Tournament,tournament_id)
    if not t: raise HTTPException(404,"Tournament not found")
    rows=db.execute(select(Team.id,func.sum(MatchResult.total_points).label('points')).join(MatchResult,MatchResult.team_id==Team.id).where(MatchResult.tournament_id==t.id).group_by(Team.id).order_by(func.sum(MatchResult.total_points).desc())).all()
    if not rows: raise HTTPException(404,"No match results found")
    old=db.scalar(select(PrizeDistribution).where(PrizeDistribution.tournament_id==t.id));
    if old: db.delete(old);db.flush()
    p=PrizeDistribution(tournament_id=t.id,first_team_id=rows[0].id if len(rows)>0 else None,first_amount=t.prize_pool*0.5,second_team_id=rows[1].id if len(rows)>1 else None,second_amount=t.prize_pool*0.3,third_team_id=rows[2].id if len(rows)>2 else None,third_amount=t.prize_pool*0.2);db.add(p);db.commit();db.refresh(p);return {"message":"Prize distribution generated successfully","prizeDistribution":pdict(p)}
