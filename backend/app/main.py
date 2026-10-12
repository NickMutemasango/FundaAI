"""FundaAI API foundation."""

import json
import os
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.database import database_url, connect, read_passages, DATABASE_ERRORS
from pydantic import BaseModel

Language = Literal["shona", "ndebele"]
Level = Literal["beginner", "intermediate", "advanced"]


class PassageSummary(BaseModel):
    id: str
    language: Language
    level: Level
    title: str
    summary: str
    minutes: int


class VocabularyItem(BaseModel):
    word: str
    meaning: str


class Question(BaseModel):
    prompt: str
    options: list[str]
    correctIndex: int
    explanation: str


class Passage(PassageSummary):
    paragraphs: list[str]
    vocabulary: list[VocabularyItem]
    question: Question


# Original sample content. Fluent-speaker review is required before educational use.
passages = [
    Passage.model_validate(item)
    for item in json.loads(Path(__file__).with_name("passages.json").read_text(encoding="utf-8"))
]
passages_by_id = {passage.id: passage for passage in passages}

app = FastAPI(title="FundaAI API", version="0.1.0")

frontend_origins = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_methods=["GET"],
    allow_headers=["Content-Type"],
)


@app.get("/health")
def health() -> dict[str, str]:
    if database_url():
        try:
            with connect() as conn:
                conn.execute("SELECT 1 FROM passages LIMIT 1")
        except DATABASE_ERRORS:
            raise HTTPException(status_code=503, detail="Database unavailable or migrations pending")
    return {"status": "ok", "service": "funda-ai", "storage": "postgresql" if database_url() else "json"}


@app.get("/passages", response_model=list[PassageSummary])
def list_passages(language: Language | None = None, level: Level | None = None) -> list[Passage]:
    if database_url():
        try:
            return [Passage.model_validate(item) for item in read_passages(language, level)]
        except DATABASE_ERRORS:
            raise HTTPException(status_code=503, detail="Database unavailable or migrations pending")
    return [
        passage
        for passage in passages
        if (language is None or passage.language == language)
        and (level is None or passage.level == level)
    ]


@app.get("/passages/{passage_id}", response_model=Passage)
def get_passage(passage_id: str) -> Passage:
    if database_url():
        try:
            rows = read_passages(passage_id=passage_id)
        except DATABASE_ERRORS:
            raise HTTPException(status_code=503, detail="Database unavailable or migrations pending")
        passage = Passage.model_validate(rows[0]) if rows else None
    else:
        passage = passages_by_id.get(passage_id)
    if passage is None:
        raise HTTPException(status_code=404, detail="Passage not found")
    return passage



