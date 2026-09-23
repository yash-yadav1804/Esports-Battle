import uuid
from datetime import datetime
from decimal import Decimal
from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey, Numeric, UniqueConstraint, Index, Text, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.constants.roles import Role
from app.constants.status import TournamentStatus, ResultStatus, TeamRequestStatus, NotificationType, MatchStatus

class User(Base):
    __tablename__="users"
    id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str]=mapped_column(String(50), nullable=False)
    email: Mapped[str]=mapped_column(String(255), unique=True, index=True, nullable=False)
    password: Mapped[str]=mapped_column(String(255), nullable=False)
    ign: Mapped[str]=mapped_column(String(100), nullable=False)
    bgmi_uid: Mapped[str]=mapped_column("bgmiUID", String(32), unique=True, index=True, nullable=False)
    role: Mapped[Role]=mapped_column(SAEnum(Role, name="user_role", native_enum=False), default=Role.PLAYER, nullable=False)
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime]=mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    team_memberships=relationship("TeamMember", back_populates="user", cascade="all, delete-orphan")

class Team(Base):
    __tablename__="teams"
    id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    team_name: Mapped[str]=mapped_column(String(100), unique=True, index=True, nullable=False)
    igl_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    max_players: Mapped[int]=mapped_column(Integer, default=4, nullable=False)
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime]=mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    igl=relationship("User", foreign_keys=[igl_id])
    members=relationship("TeamMember", back_populates="team", cascade="all, delete-orphan")
    registrations=relationship("TournamentRegistration", back_populates="team", cascade="all, delete-orphan")

class TeamMember(Base):
    __tablename__="team_members"
    id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    team_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    joined_at: Mapped[datetime]=mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    team=relationship("Team", back_populates="members")
    user=relationship("User", back_populates="team_memberships")
    __table_args__=(UniqueConstraint("team_id","user_id",name="uq_team_member"), UniqueConstraint("user_id",name="uq_user_one_team"))

class TeamRequest(Base):
    __tablename__="team_requests"
    id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    team_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    player_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[TeamRequestStatus]=mapped_column(SAEnum(TeamRequestStatus, name="team_request_status", native_enum=False), default=TeamRequestStatus.PENDING, nullable=False)
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime]=mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    team=relationship("Team")
    player=relationship("User")
    __table_args__=(Index("ix_team_request_team_status","team_id","status"),)

class Tournament(Base):
    __tablename__="tournaments"
    id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str]=mapped_column(String(150), unique=True, nullable=False)
    game: Mapped[str]=mapped_column(String(30), nullable=False)
    mode: Mapped[str]=mapped_column(String(20), nullable=False)
    entry_fee: Mapped[Decimal]=mapped_column(Numeric(12,2), default=0, nullable=False)
    prize_pool: Mapped[Decimal]=mapped_column(Numeric(12,2), default=0, nullable=False)
    max_teams: Mapped[int]=mapped_column(Integer, default=25, nullable=False)
    start_date: Mapped[datetime]=mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[TournamentStatus]=mapped_column(SAEnum(TournamentStatus, name="tournament_status", native_enum=False), default=TournamentStatus.UPCOMING, nullable=False)
    created_by: Mapped[uuid.UUID|None]=mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime]=mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    creator=relationship("User")
    registrations=relationship("TournamentRegistration", back_populates="tournament", cascade="all, delete-orphan")
    rooms=relationship("MatchRoom", back_populates="tournament", cascade="all, delete-orphan")

class TournamentRegistration(Base):
    __tablename__="tournament_registrations"
    id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tournament_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("tournaments.id", ondelete="CASCADE"), nullable=False)
    team_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    tournament=relationship("Tournament", back_populates="registrations")
    team=relationship("Team", back_populates="registrations")
    __table_args__=(UniqueConstraint("tournament_id","team_id",name="uq_tournament_team"),)

class MatchRoom(Base):
    __tablename__="match_rooms"
    id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    room_id: Mapped[int]=mapped_column(Integer, unique=True, nullable=False)
    room_password: Mapped[str]=mapped_column(String(100), nullable=False)
    match_number: Mapped[int]=mapped_column(Integer, nullable=False, default=1)
    map: Mapped[str]=mapped_column(String(30), default="Erangel", nullable=False)
    match_time: Mapped[datetime]=mapped_column(DateTime(timezone=True), nullable=False)
    tournament_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("tournaments.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[MatchStatus]=mapped_column(SAEnum(MatchStatus, name="match_status", native_enum=False), default=MatchStatus.UPCOMING, nullable=False)
    created_by: Mapped[uuid.UUID]=mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime]=mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    tournament=relationship("Tournament", back_populates="rooms")
    creator=relationship("User")
    registrations=relationship("MatchRegistration", back_populates="match_room", cascade="all, delete-orphan")
    results=relationship("MatchResult", back_populates="match_room", cascade="all, delete-orphan")
    __table_args__=(UniqueConstraint("tournament_id","match_number",name="uq_tournament_match_number"),)

class MatchRegistration(Base):
    __tablename__="match_registrations"
    id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    player_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    team_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    match_room_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("match_rooms.id", ondelete="CASCADE"), nullable=False)
    bgmi_name: Mapped[str]=mapped_column(String(100), nullable=False)
    bgmi_id: Mapped[str]=mapped_column(String(32), nullable=False)
    status: Mapped[str]=mapped_column(String(20), default="joined", nullable=False)
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    player=relationship("User")
    team=relationship("Team")
    match_room=relationship("MatchRoom", back_populates="registrations")
    __table_args__=(UniqueConstraint("player_id","match_room_id",name="uq_player_match_room"),)

class ResultSubmission(Base):
    __tablename__="result_submissions"
    id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    team_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    tournament_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("tournaments.id", ondelete="CASCADE"), nullable=False)
    match_room_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("match_rooms.id", ondelete="CASCADE"), nullable=False)
    submitted_by: Mapped[uuid.UUID]=mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    kills: Mapped[int]=mapped_column(Integer, default=0, nullable=False)
    position: Mapped[int]=mapped_column(Integer, nullable=False)
    status: Mapped[ResultStatus]=mapped_column(SAEnum(ResultStatus, name="result_status", native_enum=False), default=ResultStatus.PENDING, nullable=False)
    admin_note: Mapped[str|None]=mapped_column(Text)
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime]=mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    team=relationship("Team")
    tournament=relationship("Tournament")
    match_room=relationship("MatchRoom")
    submitter=relationship("User")

class MatchResult(Base):
    __tablename__="match_results"
    id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    team_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    tournament_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("tournaments.id", ondelete="CASCADE"), nullable=False)
    match_room_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("match_rooms.id", ondelete="CASCADE"), nullable=False)
    kills: Mapped[int]=mapped_column(Integer, default=0, nullable=False)
    position: Mapped[int]=mapped_column(Integer, nullable=False)
    kill_points: Mapped[int]=mapped_column(Integer, default=0, nullable=False)
    placement_points: Mapped[int]=mapped_column(Integer, default=0, nullable=False)
    total_points: Mapped[int]=mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime]=mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    team=relationship("Team")
    tournament=relationship("Tournament")
    match_room=relationship("MatchRoom", back_populates="results")
    __table_args__=(UniqueConstraint("team_id","match_room_id",name="uq_team_match_result"),)

class Notification(Base):
    __tablename__="notifications"
    id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str]=mapped_column(String(150), nullable=False)
    message: Mapped[str]=mapped_column(Text, nullable=False)
    type: Mapped[NotificationType]=mapped_column(SAEnum(NotificationType, name="notification_type", native_enum=False), default=NotificationType.GENERAL, nullable=False)
    is_read: Mapped[bool]=mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    user=relationship("User")

class OrganizerRequest(Base):
    __tablename__="organizer_requests"
    id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    organization_name: Mapped[str]=mapped_column(String(150), nullable=False)
    contact_number: Mapped[str]=mapped_column(String(50), nullable=False)
    reason: Mapped[str]=mapped_column(Text, nullable=False)
    experience: Mapped[str]=mapped_column(Text, default="", nullable=False)
    social_link: Mapped[str]=mapped_column(String(500), default="", nullable=False)
    status: Mapped[str]=mapped_column(String(20), default="pending", nullable=False)
    admin_note: Mapped[str]=mapped_column(Text, default="", nullable=False)
    reviewed_by: Mapped[uuid.UUID|None]=mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    reviewed_at: Mapped[datetime|None]=mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime]=mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    user=relationship("User", foreign_keys=[user_id])
    reviewer=relationship("User", foreign_keys=[reviewed_by])

class PrizeDistribution(Base):
    __tablename__="prize_distributions"
    id: Mapped[uuid.UUID]=mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tournament_id: Mapped[uuid.UUID]=mapped_column(ForeignKey("tournaments.id", ondelete="CASCADE"), unique=True, nullable=False)
    first_team_id: Mapped[uuid.UUID|None]=mapped_column(ForeignKey("teams.id", ondelete="SET NULL"))
    first_amount: Mapped[Decimal]=mapped_column(Numeric(12,2), default=0, nullable=False)
    second_team_id: Mapped[uuid.UUID|None]=mapped_column(ForeignKey("teams.id", ondelete="SET NULL"))
    second_amount: Mapped[Decimal]=mapped_column(Numeric(12,2), default=0, nullable=False)
    third_team_id: Mapped[uuid.UUID|None]=mapped_column(ForeignKey("teams.id", ondelete="SET NULL"))
    third_amount: Mapped[Decimal]=mapped_column(Numeric(12,2), default=0, nullable=False)
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime]=mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    tournament=relationship("Tournament")
    first_team=relationship("Team", foreign_keys=[first_team_id])
    second_team=relationship("Team", foreign_keys=[second_team_id])
    third_team=relationship("Team", foreign_keys=[third_team_id])
