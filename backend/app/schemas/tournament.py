from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal
class TournamentCreate(BaseModel):
    title:str=Field(min_length=1,max_length=150); game:str; mode:str; entryFee:Decimal=Field(default=0,ge=0); prizePool:Decimal=Field(default=0,ge=0); maxTeams:int=Field(default=25,gt=0); startDate:datetime
class TournamentUpdate(BaseModel):
    title:str|None=None; game:str|None=None; mode:str|None=None; entryFee:Decimal|None=Field(default=None,ge=0); prizePool:Decimal|None=Field(default=None,ge=0); maxTeams:int|None=Field(default=None,gt=0); startDate:datetime|None=None
