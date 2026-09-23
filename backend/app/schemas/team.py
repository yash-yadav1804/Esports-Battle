from pydantic import BaseModel, Field
class TeamCreate(BaseModel): teamName:str=Field(min_length=1,max_length=100)
class TeamUpdate(BaseModel): teamName:str|None=None; maxPlayers:int|None=Field(default=None,gt=0)
