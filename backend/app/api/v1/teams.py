from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.schemas.team import TeamCreate
from app.services import team_service
from app.utils.serializers import team_dict
router=APIRouter()
@router.post('/create',status_code=201)
def create(data:TeamCreate,db:Session=Depends(get_db),u=Depends(get_current_user)):
    return {"message":"Team created successfully","team":team_dict(team_service.create(db,u,data))}
@router.post('/join/{team_id}')
def join(team_id:str,db:Session=Depends(get_db),u=Depends(get_current_user)): return {"message":"Team joined successfully","team":team_dict(team_service.join(db,u,team_id))}
@router.patch('/leave')
def leave(db:Session=Depends(get_db),u=Depends(get_current_user)):
    t,deleted=team_service.leave(db,u); return {"message":"You left the team. Team deleted because no players remained." if deleted else "You left the team successfully","team":team_dict(t) if t else None}
@router.patch('/remove-player/{player_id}')
def remove(player_id:str,db:Session=Depends(get_db),u=Depends(get_current_user)): return {"message":"Player removed from team successfully","team":team_dict(team_service.remove_player(db,u,player_id))}
@router.patch('/transfer-captain/{new_captain_id}')
def transfer(new_captain_id:str,db:Session=Depends(get_db),u=Depends(get_current_user)): return {"message":"Captaincy transferred successfully","team":team_dict(team_service.transfer(db,u,new_captain_id))}
@router.get('/')
def all(db:Session=Depends(get_db)): return {"count":len(team_service.all_teams(db)),"teams":[team_dict(t) for t in team_service.all_teams(db)]}
@router.get('/my-team')
def mine(db:Session=Depends(get_db),u=Depends(get_current_user)):
    t=team_service.my_team(db,u); return {"team":team_dict(t) if t else None}
@router.get('/{team_id}')
def get(team_id:str,db:Session=Depends(get_db)): return {"team":team_dict(team_service.get(db,team_id))}
