def placement_points(position:int)->int:
    return {1:15,2:12,3:10,4:8,5:6}.get(position,0)
def calculate_points(kills:int, position:int):
    kp=kills*2; pp=placement_points(position); return kp,pp,kp+pp
