from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user,platform_manager
from app.schemas.tournament import TournamentCreate,TournamentUpdate
from app.services import tournament_service
from app.utils.serializers import tournament_dict
router=APIRouter()
@router.post('/createTournament',status_code=201)
def create(data:TournamentCreate,db:Session=Depends(get_db),u=Depends(platform_manager)): return {"message":"Tournament created successfully","tournament":tournament_dict(tournament_service.create(db,u,data))}
@router.get('/')
def all(db:Session=Depends(get_db)): return [tournament_dict(t,False) for t in tournament_service.list_all(db)]
@router.get('/my-created')
def mine(db:Session=Depends(get_db),u=Depends(platform_manager)): return {"statusCode":200,"success":True,"message":"Manageable tournaments fetched successfully","data":[tournament_dict(t,False) for t in tournament_service.my_created(db,u)]}
@router.patch('/manage/{tournament_id}')
def update(tournament_id:str,data:TournamentUpdate,db:Session=Depends(get_db),u=Depends(platform_manager)): return {"message":"Tournament updated successfully","tournament":tournament_dict(tournament_service.update(db,u,tournament_id,data),False)}
@router.delete('/manage/{tournament_id}')
def delete(tournament_id:str,db:Session=Depends(get_db),u=Depends(platform_manager)): tournament_service.delete_tournament(db,u,tournament_id); return {"message":"Tournament and related data deleted successfully"}
@router.get('/history/completed')
def history(db:Session=Depends(get_db)): h=tournament_service.history(db); return {"count":len(h),"history":h}
@router.post('/register/{tournament_id}')
def register(tournament_id:str,db:Session=Depends(get_db),u=Depends(get_current_user)): return {"message":"Team registered successfully","tournament":tournament_dict(tournament_service.register(db,u,tournament_id))}
@router.post('/leave/{tournament_id}')
@router.delete('/leave/{tournament_id}')
def leave(tournament_id:str,db:Session=Depends(get_db),u=Depends(get_current_user)): return {"message":"Left tournament successfully","tournament":tournament_dict(tournament_service.leave(db,u,tournament_id))}
@router.post('/start/{tournament_id}')
@router.patch('/start/{tournament_id}')
def start(tournament_id:str,db:Session=Depends(get_db),u=Depends(platform_manager)): return {"message":"Tournament started successfully","tournament":tournament_dict(tournament_service.start(db,u,tournament_id))}
@router.post('/complete/{tournament_id}')
@router.patch('/complete/{tournament_id}')
def complete(tournament_id:str,db:Session=Depends(get_db),u=Depends(platform_manager)):
    r=tournament_service.complete(db,u,tournament_id); return {"message":"Tournament completed successfully","winner":r["winner"],"prizePool":r["prizePool"],"tournament":tournament_dict(r["tournament"])}
@router.get('/{tournament_id}')
def get(tournament_id:str,db:Session=Depends(get_db)): return tournament_dict(tournament_service.get(db,tournament_id))
