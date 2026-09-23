from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.domain import Team,TeamMember
class TeamRepository:
    def __init__(self,db:Session): self.db=db
    def by_user(self,user_id):
        return self.db.scalar(select(Team).join(TeamMember).where(TeamMember.user_id==user_id))
