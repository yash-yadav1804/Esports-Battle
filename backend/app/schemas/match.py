from pydantic import BaseModel, Field
from datetime import datetime
class MatchRoomCreate(BaseModel): roomId:int; roomPassword:str=Field(min_length=1,max_length=100); matchNumber:int=Field(default=1,gt=0); map:str="Erangel"; matchTime:datetime
class MatchRoomUpdate(BaseModel): roomId:int|None=None; roomPassword:str|None=None; matchNumber:int|None=None; map:str|None=None; matchTime:datetime|None=None
class ResultCreate(BaseModel): team:str; tournament:str; matchRoom:str; kills:int=Field(ge=0); position:int=Field(gt=0)
class ResultSubmissionCreate(BaseModel): tournamentId:str; matchRoomId:str; kills:int=Field(ge=0); position:int=Field(gt=0)
class RejectSubmission(BaseModel): adminNote:str=""
