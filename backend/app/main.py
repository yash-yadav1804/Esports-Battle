from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.router import api_router
from app.core.exceptions import register_exception_handlers

app=FastAPI(title=settings.app_name,version="1.0.0",docs_url="/docs",redoc_url="/redoc")
origins=[x.strip() for x in settings.client_url.split(',') if x.strip()]
app.add_middleware(CORSMiddleware,allow_origins=origins,allow_credentials=True,allow_methods=["*"],allow_headers=["*"])
register_exception_handlers(app)
app.include_router(api_router,prefix=settings.api_prefix)
@app.get('/')
def health(): return {"statusCode":200,"success":True,"message":"Esports API Running Successfully","data":None}
@app.get('/health')
def health_check(): return {"status":"ok","environment":settings.environment}
