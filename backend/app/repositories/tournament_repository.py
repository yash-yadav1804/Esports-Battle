from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.domain import Tournament
class TournamentRepository:
    def __init__(self,db:Session): self.db=db
    def get(self,item_id): return self.db.get(Tournament,item_id)
