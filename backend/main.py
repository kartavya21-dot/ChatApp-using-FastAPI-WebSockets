from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, Request, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Field, Session, SQLModel, create_engine, Relationship, select
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Annotated, List, Optional
from datetime import datetime
from contextlib import asynccontextmanager
from jose import jwt
from auth import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    SECRET_KEY,
    ALGORITHM,
)


class Message(SQLModel, table=True):
    id: Optional[int] = Field(primary_key=True, default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    message: str
    user_id: int = Field(foreign_key="user.id")
    user: Optional["User"] = Relationship(back_populates="message")
    conversation: Optional["Conversation"] = Relationship(back_populates="message")
    conversation_id: int = Field(foreign_key="conversation.id")


class User(SQLModel, table=True):
    id: Optional[int] = Field(primary_key=True, default=None)
    name: str
    email: str = Field(index=True, unique=True)
    hashed_password: str
    is_active: bool = True
    message: List["Message"] | None = Relationship(back_populates="user")


class Conversation(SQLModel, table=True):
    id: Optional[int] = Field(primary_key=True, default=None)
    name: str
    message: List["Message"] | None = Relationship(back_populates="conversation")


class UserCreate(SQLModel):
    name: str


class UserPublic(SQLModel):
    id: int
    name: str


class ConversationCreate(SQLModel):
    name: str


class ConversationPublic(SQLModel):
    id: int
    name: str


class MessageCreate(SQLModel):
    message: str
    conversation_id: int
    user_id: int


class MessagePublic(SQLModel):
    created_at: datetime
    message: str
    conversation_id: int
    user_id: int


class LoginSchema(SQLModel):
    email: str
    password: str

class RegisterSchema(SQLModel):
    name: str
    email: str
    password: str


sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)
security = HTTPBearer()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],  # change in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(creds.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401)
        return payload["sub"]
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.post("/register")
def register(data: RegisterSchema, session: SessionDep):
    try:
        db_data = User(
            name= data.name,
            email= data.email,
            hashed_password= hash_password(data.password)
        )
        session.add(db_data)
        session.commit()
        session.refresh(db_data)
        return {"User Created Succefully"}
    except Exception:
        return {"Cannot Create user"}

@app.post("/login")
def login(data: LoginSchema, response: Response, session: SessionDep):
    user = session.exec(select(User).where(User.email == data.email)).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid Credantial")

    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Not a User")

    access = create_access_token(str(user.id))
    refresh = create_refresh_token(str(user.id))

    response.set_cookie(
        key="refresh_token",
        value=refresh,
        httponly=True,
        secure=True,
        samesite="strict",
        path="/refresh",
    )

    return {"access_token": access}


@app.post("/refresh")
def refresh(request: Request):
    token = request.cookies.get("refresh_token")

    if not token:
        raise HTTPException(status_code=401)

    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401)

    return {"access_token": create_access_token(payload["sub"])}

@app.post("/conversation", response_model=ConversationPublic, dependencies=[Depends(get_current_user)])
def create_conversation(session: SessionDep, conversation: ConversationCreate):
    db_conversation = Conversation.model_validate(conversation)
    session.add(db_conversation)
    session.commit()
    session.refresh(db_conversation)
    return db_conversation


@app.get("/conversation", response_model=List[ConversationPublic], dependencies=[Depends(get_current_user)])
def get_conversation(session: SessionDep):
    return session.exec(select(Conversation)).all()


@app.get("/messages", response_model=List[MessagePublic], dependencies=[Depends(get_current_user)])
def get_messages(session: SessionDep, conversation_id: int, user_id: int = Depends(get_current_user)):
    return session.exec(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .where(Message.user_id == user_id)
    ).all()


connections: dict[int, list[WebSocket]] = {}

@app.websocket("/ws")
async def websocket_(websocket: WebSocket, _conversation_id: int, _user_id: int):
    await websocket.accept()
    
    if _conversation_id not in connections:
        connections[_conversation_id] = []

    connections[_conversation_id].append[websocket]

    try:
        while True:
            msg = await websocket.receive_text()

            db_msg = Message(
                message=msg, conversation_id=_conversation_id, user_id=_user_id
            )

            with Session(engine) as session:
                session.add(db_msg)
                session.commit()

            for client in connections[_conversation_id]:
                await client.send_text(msg)

    except WebSocketDisconnect:
        connections.remove(websocket)
