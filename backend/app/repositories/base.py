from typing import TypeVar, Generic, Type
from sqlalchemy.orm import Session
T=TypeVar("T")
class BaseRepository(Generic[T]):
    def __init__(self, db:Session, model:Type[T]): self.db=db; self.model=model
    def get(self, item_id): return self.db.get(self.model,item_id)
    def delete(self, obj): self.db.delete(obj)
