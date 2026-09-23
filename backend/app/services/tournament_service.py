from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.models.domain import (
    Tournament,
    TournamentRegistration,
    Team,
    TeamMember,
    MatchRoom,
    MatchResult,
    PrizeDistribution,
    Notification,
)
from app.constants.roles import Role
from app.constants.status import TournamentStatus, NotificationType
from app.services.notification_service import create as notify
from app.utils.serializers import tournament_dict


def can_manage(t, u):
    if u.role in {Role.ADMIN, Role.SUPER_ADMIN}:
        return True

    return u.role == Role.ORGANIZER and t.created_by == u.id


def create(db, u, d):
    if u.role not in {Role.ORGANIZER, Role.ADMIN, Role.SUPER_ADMIN}:
        raise HTTPException(403, "Access Denied")

    if db.scalar(
        select(Tournament).where(
            Tournament.title == d.title.strip()
        )
    ):
        raise HTTPException(400, "Tournament already exists")

    if d.startDate is None:
        raise HTTPException(400, "Start date is required")

    t = Tournament(
        title=d.title.strip(),
        game=d.game,
        mode=d.mode,
        entry_fee=d.entryFee,
        prize_pool=d.prizePool,
        max_teams=d.maxTeams,
        start_date=d.startDate,
        created_by=u.id,
    )

    db.add(t)
    db.commit()
    db.refresh(t)

    return t


def list_all(db):
    return db.scalars(
        select(Tournament).order_by(Tournament.created_at.desc())
    ).unique().all()


def my_created(db, u):
    q = select(Tournament).order_by(Tournament.created_at.desc())

    if u.role not in {Role.ADMIN, Role.SUPER_ADMIN}:
        q = q.where(Tournament.created_by == u.id)

    return db.scalars(q).unique().all()


def get(db, tid):
    t = db.get(Tournament, tid)

    if not t:
        raise HTTPException(404, "Tournament not found")

    return t


def register(db, u, tid):
    t = get(db, tid)

    if t.status == TournamentStatus.COMPLETED:
        raise HTTPException(
            400,
            "Cannot register in completed tournament",
        )

    team = db.scalar(
        select(Team)
        .join(TeamMember)
        .where(TeamMember.user_id == u.id)
    )

    if not team:
        raise HTTPException(
            400,
            "You are not in any team",
        )

    if db.scalar(
        select(TournamentRegistration).where(
            TournamentRegistration.tournament_id == t.id,
            TournamentRegistration.team_id == team.id,
        )
    ):
        raise HTTPException(
            400,
            "Team already registered",
        )

    count = db.scalar(
        select(func.count())
        .select_from(TournamentRegistration)
        .where(
            TournamentRegistration.tournament_id == t.id
        )
    )

    if count >= t.max_teams:
        raise HTTPException(
            400,
            "Tournament is full",
        )

    db.add(
        TournamentRegistration(
            tournament_id=t.id,
            team_id=team.id,
        )
    )

    db.commit()
    db.refresh(t)

    return t


def leave(db, u, tid):
    t = get(db, tid)

    if t.status == TournamentStatus.LIVE:
        raise HTTPException(
            400,
            "Cannot leave tournament after it has started",
        )

    if t.status == TournamentStatus.COMPLETED:
        raise HTTPException(
            400,
            "Cannot leave completed tournament",
        )

    team = db.scalar(
        select(Team)
        .join(TeamMember)
        .where(TeamMember.user_id == u.id)
    )

    if not team:
        raise HTTPException(
            400,
            "You are not in any team",
        )

    r = db.scalar(
        select(TournamentRegistration).where(
            TournamentRegistration.tournament_id == t.id,
            TournamentRegistration.team_id == team.id,
        )
    )

    if not r:
        raise HTTPException(
            400,
            "Team is not registered in this tournament",
        )

    db.delete(r)
    db.commit()
    db.refresh(t)

    return t


def start(db, u, tid):
    t = get(db, tid)

    if not can_manage(t, u):
        raise HTTPException(
            403,
            "You can manage only your own tournaments",
        )

    if t.status == TournamentStatus.LIVE:
        raise HTTPException(
            400,
            "Tournament is already live",
        )

    if t.status == TournamentStatus.COMPLETED:
        raise HTTPException(
            400,
            "Tournament is already completed",
        )

    if not t.registrations:
        raise HTTPException(
            400,
            "No teams registered",
        )

    t.status = TournamentStatus.LIVE

    for r in t.registrations:
        for m in r.team.members:
            notify(
                db,
                m.user_id,
                "Tournament Started",
                f"{t.title} has started. Join your match room on time.",
                NotificationType.TOURNAMENT,
            )

    db.commit()
    db.refresh(t)

    return t


def complete(db, u, tid):
    t = get(db, tid)

    if not can_manage(t, u):
        raise HTTPException(
            403,
            "You can manage only your own tournaments",
        )

    if t.status == TournamentStatus.COMPLETED:
        raise HTTPException(
            400,
            "Tournament already completed",
        )

    results = db.scalars(
        select(MatchResult).where(
            MatchResult.tournament_id == t.id
        )
    ).all()

    if not results:
        raise HTTPException(
            400,
            "No match results found",
        )

    totals = {}

    for r in results:
        totals[r.team_id] = (
            totals.get(r.team_id, 0) + r.total_points
        )

    sorted_teams = sorted(
        totals.items(),
        key=lambda x: x[1],
        reverse=True,
    )

    # Prize distribution
    # PostgreSQL NUMERIC values are returned by SQLAlchemy
    # as Decimal objects. Therefore, use Decimal values
    # instead of Python floats for money calculations.
    pool = t.prize_pool

    first = pool * Decimal("0.50")
    second = pool * Decimal("0.30")
    third = pool * Decimal("0.20")

    old = db.scalar(
        select(PrizeDistribution).where(
            PrizeDistribution.tournament_id == t.id
        )
    )

    if old:
        db.delete(old)
        db.flush()

    prize = PrizeDistribution(
        tournament_id=t.id,
        first_team_id=(
            sorted_teams[0][0]
            if len(sorted_teams) > 0
            else None
        ),
        first_amount=first,
        second_team_id=(
            sorted_teams[1][0]
            if len(sorted_teams) > 1
            else None
        ),
        second_amount=second,
        third_team_id=(
            sorted_teams[2][0]
            if len(sorted_teams) > 2
            else None
        ),
        third_amount=third,
    )

    db.add(prize)

    t.status = TournamentStatus.COMPLETED

    winner_team = (
        db.get(Team, sorted_teams[0][0])
        if sorted_teams
        else None
    )

    for r in t.registrations:
        for m in r.team.members:
            notify(
                db,
                m.user_id,
                "Tournament Completed",
                (
                    f"{t.title} has been completed. "
                    f"Winner: "
                    f"{winner_team.team_name if winner_team else 'N/A'}"
                ),
                NotificationType.TOURNAMENT,
            )

    db.commit()
    db.refresh(t)

    return {
        "tournament": t,
        "winner": (
            winner_team.team_name
            if winner_team
            else None
        ),
        "prizePool": float(pool),
    }


def update(db, u, tid, d):
    t = get(db, tid)

    if not can_manage(t, u):
        raise HTTPException(
            403,
            "You can manage only your own tournaments",
        )

    if t.status == TournamentStatus.COMPLETED:
        raise HTTPException(
            400,
            "Completed tournament cannot be updated",
        )

    if (
        d.title is not None
        and d.title.strip() != t.title
        and db.scalar(
            select(Tournament).where(
                Tournament.title == d.title.strip()
            )
        )
    ):
        raise HTTPException(
            400,
            "Tournament title already exists",
        )

    if d.title is not None:
        t.title = d.title.strip()

    if d.game is not None:
        t.game = d.game

    if d.mode is not None:
        t.mode = d.mode

    if d.entryFee is not None:
        t.entry_fee = d.entryFee

    if d.prizePool is not None:
        t.prize_pool = d.prizePool

    if d.maxTeams is not None:
        if d.maxTeams < len(t.registrations):
            raise HTTPException(
                400,
                "Max teams cannot be less than already registered teams",
            )

        t.max_teams = d.maxTeams

    if d.startDate is not None:
        t.start_date = d.startDate

    db.commit()
    db.refresh(t)

    return t


def delete_tournament(db, u, tid):
    t = get(db, tid)

    if not can_manage(t, u):
        raise HTTPException(
            403,
            "You can manage only your own tournaments",
        )

    db.delete(t)
    db.commit()


def history(db):
    ts = db.scalars(
        select(Tournament)
        .where(
            Tournament.status == TournamentStatus.COMPLETED
        )
        .order_by(Tournament.updated_at.desc())
    ).all()

    out = []

    for t in ts:
        p = db.scalar(
            select(PrizeDistribution).where(
                PrizeDistribution.tournament_id == t.id
            )
        )

        out.append(
            {
                "tournamentId": str(t.id),
                "tournamentName": t.title,
                "game": t.game,
                "mode": t.mode,
                "prizePool": float(t.prize_pool),
                "entryFee": float(t.entry_fee),
                "totalRegisteredTeams": len(t.registrations),
                "winner": (
                    str(p.first_team.team_name)
                    if p and p.first_team
                    else "No winner found"
                ),
                "firstPlace": {
                    "team": (
                        p.first_team.team_name
                        if p and p.first_team
                        else None
                    ),
                    "amount": (
                        float(p.first_amount)
                        if p
                        else 0
                    ),
                },
                "secondPlace": {
                    "team": (
                        p.second_team.team_name
                        if p and p.second_team
                        else None
                    ),
                    "amount": (
                        float(p.second_amount)
                        if p
                        else 0
                    ),
                },
                "thirdPlace": {
                    "team": (
                        p.third_team.team_name
                        if p and p.third_team
                        else None
                    ),
                    "amount": (
                        float(p.third_amount)
                        if p
                        else 0
                    ),
                },
                "completedAt": t.updated_at,
            }
        )

    return out