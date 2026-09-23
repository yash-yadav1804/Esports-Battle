from app.models.domain import *

def user_dict(u):
    return {"_id":str(u.id),"name":u.name,"email":u.email,"ign":u.ign,"bgmiUID":u.bgmi_uid,"role":u.role.value if hasattr(u.role,"value") else u.role,"createdAt":u.created_at,"updatedAt":u.updated_at}

def team_dict(t, db=None):
    members=t.members if hasattr(t,"members") else []
    players=[]
    for m in members:
        if m.user: players.append(user_dict(m.user))
    igl=user_dict(t.igl) if t.igl else None
    return {"_id":str(t.id),"teamName":t.team_name,"igl":igl,"players":players,"maxPlayers":t.max_players,"createdAt":t.created_at,"updatedAt":t.updated_at}

def tournament_dict(t, include_registered=True):
    regs=t.registrations if include_registered and hasattr(t,"registrations") else []
    return {"_id":str(t.id),"title":t.title,"game":t.game,"mode":t.mode,"entryFee":float(t.entry_fee),"prizePool":float(t.prize_pool),"maxTeams":t.max_teams,"registeredTeams":[str(r.team_id) for r in regs],"startDate":t.start_date,"status":t.status.value if hasattr(t.status,"value") else t.status,"createdBy":user_dict(t.creator) if t.creator else None,"createdAt":t.created_at,"updatedAt":t.updated_at}

def room_dict(r, include_password=True):
    return {"_id":str(r.id),"roomId":r.room_id,"roomPassword":r.room_password if include_password else None,"matchNumber":r.match_number,"map":r.map,"matchTime":r.match_time,"tournament":{"_id":str(r.tournament.id),"title":r.tournament.title,"game":r.tournament.game,"mode":r.tournament.mode,"status":r.tournament.status.value if hasattr(r.tournament.status,"value") else r.tournament.status,"createdBy":str(r.tournament.created_by) if r.tournament.created_by else None} if r.tournament else None,"status":r.status.value if hasattr(r.status,"value") else r.status,"createdBy":user_dict(r.creator) if r.creator else None,"createdAt":r.created_at,"updatedAt":r.updated_at}
