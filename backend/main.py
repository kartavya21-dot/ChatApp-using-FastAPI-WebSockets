from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Field, Session, SQLModel, create_engine, Relationship, select
from typing import Annotated, List, Optional
from datetime import datetime
from contextlib import asynccontextmanager


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

sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)

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

@app.post("/user", response_model=UserPublic)
def create_user(session: SessionDep, user: UserCreate):
    db_user = User.model_validate(user)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

@app.post("/conversation", response_model=ConversationPublic)
def create_conversation(session: SessionDep, conversation: ConversationCreate):
    db_conversation = Conversation.model_validate(conversation)
    session.add(db_conversation)
    session.commit()
    session.refresh(db_conversation)
    return db_conversation

@app.get("/conversation", response_model=List[ConversationPublic])
def get_conversation(session: SessionDep):
    return session.exec(select(Conversation)).all()

@app.get('/messages', response_model=List[MessagePublic])
def get_messages(session: SessionDep, _conversation_id: int, _user_id: int):
    return session.exec(select(Message).where(Message.conversation_id==_conversation_id).where(Message.user_id==_user_id)).all()

clients = []

@app.websocket("/ws")
async def websocket_(websocket: WebSocket, _conversation_id: int, _user_id: int):
    await websocket.accept()
    clients.append(websocket)
 
    try:
        while True:
            msg= await websocket.receive_text()

            db_msg = Message(
                message=msg,
                conversation_id=_conversation_id,
                user_id=_user_id
            )
            
            with Session(engine) as session:
                session.add(db_msg)
                session.commit()

            for client in clients:
                await client.send_text(msg)

    except WebSocketDisconnect:
        clients.remove(websocket)