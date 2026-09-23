from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.domain import User
class UserRepository:
    def __init__(self,db:Session): self.db=db
    def by_email(self,email): return self.db.scalar(select(User).where(User.email==email))
    def by_bgmi_uid(self,uid): return self.db.scalar(select(User).where(User.bgmi_uid==uid))
