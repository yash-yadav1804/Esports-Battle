from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user,platform_manager
from app.schemas.match import MatchRoomCreate,MatchRoomUpdate
from app.services import match_room_service
from app.utils.serializers import room_dict
router=APIRouter()
@router.post('/create/{tournament_id}',status_code=201)
def create(tournament_id:str,data:MatchRoomCreate,db:Session=Depends(get_db),u=Depends(platform_manager)): return {"message":"Match room created successfully","matchRoom":room_dict(match_room_service.create(db,u,tournament_id,data))}
@router.get('/')
def all(db:Session=Depends(get_db)): return {"count":len(match_room_service.all_rooms(db)),"matchRooms":[room_dict(r,False) for r in match_room_service.all_rooms(db)]}
@router.get('/my-created')
def mine(db:Session=Depends(get_db),u=Depends(platform_manager)): rs=match_room_service.my_created(db,u); return {"count":len(rs),"matchRooms":[room_dict(r) for r in rs]}
@router.get('/eligible')
def eligible(db:Session=Depends(get_db),u=Depends(get_current_user)): rs=match_room_service.eligible(db,u); return {"count":len(rs),"matchRooms":[room_dict(r) for r in rs]}
@router.patch('/manage/{room_id}')
def update(room_id:str,data:MatchRoomUpdate,db:Session=Depends(get_db),u=Depends(platform_manager)): return {"message":"Match room updated successfully","matchRoom":room_dict(match_room_service.update(db,u,room_id,data))}
@router.delete('/manage/{room_id}')
def delete(room_id:str,db:Session=Depends(get_db),u=Depends(platform_manager)): match_room_service.delete(db,u,room_id); return {"message":"Match room deleted successfully"}
@router.get('/{room_id}')
def get(room_id:str,db:Session=Depends(get_db)): return {"matchRoom":room_dict(match_room_service.get(db,room_id))}
