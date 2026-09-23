from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal
from typing import Any
class MessageResponse(BaseModel): message: str
class IDParam(BaseModel): id: str
class UserOut(BaseModel):
    _id: str; name: str; email: str; ign: str; bgmiUID: str; role: str; createdAt: datetime|None=None; updatedAt: datetime|None=None
class TeamMemberOut(UserOut): pass
class TeamOut(BaseModel):
    _id: str; teamName: str; igl: Any; players: list[Any]; maxPlayers: int; createdAt: datetime|None=None; updatedAt: datetime|None=None
