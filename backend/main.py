import math
import os
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path

from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from openai import OpenAI
from pydantic import BaseModel

load_dotenv()

app = FastAPI(title="Parallax AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ---------------------------------------------------------------------------
# File storage
# ---------------------------------------------------------------------------

UPLOADS_DIR = Path(__file__).parent / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------

DB_PATH = Path(__file__).parent / "cards.db"


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with get_conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS cards (
                id           TEXT PRIMARY KEY,
                title        TEXT NOT NULL,
                story        TEXT NOT NULL,
                location_name TEXT NOT NULL,
                lat          REAL NOT NULL,
                lng          REAL NOT NULL,
                image_url    TEXT,
                tags         TEXT DEFAULT '[]',
                created_at   TEXT NOT NULL
            )
        """)
        # Migrate: add tags column if it doesn't exist yet
        try:
            conn.execute("ALTER TABLE cards ADD COLUMN tags TEXT DEFAULT '[]'")
        except Exception:
            pass


init_db()

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Return distance in kilometres between two lat/lng points."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlng / 2) ** 2
    )
    return R * 2 * math.asin(math.sqrt(a))


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------


class StoryRequest(BaseModel):
    location: str
    user_input: str
    image_url: Optional[str] = None


class CardCreate(BaseModel):
    title: str
    story: str
    location_name: str
    lat: float
    lng: float
    image_url: Optional[str] = None
    tags: Optional[list[str]] = []


# ---------------------------------------------------------------------------
# System prompt (story generation)
# ---------------------------------------------------------------------------

SYSTEM_PROMPT_TEMPLATE = """[Role]
You are a poet who writes micro-stories about city moments. Your writing feels like a real person talking — unpolished edges, specific details, honest emotion.

[Context]
The user found something at "{location}". You may do a quick web search to pick up one small, vivid detail about the place — a texture, a nickname, something only a local would notice. Do NOT write a description of the place. Do NOT cite sources or include any URLs or links.

[Task]
Take the user's raw notes and turn them into a short personal story. The voice should stay theirs — you're just sharpening it. Make it feel alive.

[Style & Tone]
- Read the user's original carefully: their rhythm, their sentence length, how casual or intense they are
- Match that energy — don't upgrade it into something formal or lyrical if they wrote plainly
- Short sentences can hit harder than long ones
- One unexpected image or detail is worth more than three correct ones

[Few-shot examples]
Input: "just a weird statue but couldn't stop staring"
Good: "Just a weird statue. But I stood there way longer than I should have, not really sure why. Like it was waiting for something."
Bad: "This remarkable sculpture captivates visitors with its mysterious artistic presence."

Input: "tiny door in the wall near the subway, nobody notices it"
Good: "There's this tiny door. Knee height, rusted hinge, right beside the F train entrance. I've walked past it maybe a hundred times. Today I finally stopped."
Bad: "A hidden door near the subway station offers a glimpse into the city's forgotten history."

[Constraints]
- Keep the user's original words and images where possible
- Do not invent feelings or details they didn't mention
- No URLs, no citations, no source references — ever
- 60–120 words max

[Format]
Return ONLY a JSON object with exactly two fields:
{{"story": "<story text>", "tags": ["#Tag1", "#Tag2", "#Tag3"]}}
Tags must be short (1–2 words), specific to the location or vibe, prefixed with #. No other text."""


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@app.post("/api/generate-story")
async def generate_story(req: StoryRequest):
    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(location=req.location)
    user_message = f'Location: {req.location}\nUser\'s description: "{req.user_input}"'

    try:
        response = client.responses.create(
            model="gpt-4.1-mini",
            tools=[{"type": "web_search_preview"}],
            instructions=system_prompt,
            input=user_message,
            temperature=1.4,
        )

        # Log every output item so we can see exactly what the API returned
        print(f"\n[generate-story] output items ({len(response.output)}):")
        for item in response.output:
            print(f"  type={item.type!r}")

        # Explicitly extract text from message output items
        raw_text = ""
        for item in response.output:
            if item.type == "message":
                for block in item.content:
                    if hasattr(block, "text"):
                        raw_text += block.text

        print(f"[generate-story] raw response: {raw_text!r}\n")

        if not raw_text:
            raise HTTPException(status_code=500, detail="Model returned no text — check terminal logs")

        # Parse JSON response containing story + tags
        import json
        try:
            # Strip markdown code fences if present
            clean = raw_text.strip().strip("```json").strip("```").strip()
            parsed = json.loads(clean)
            story = parsed.get("story", "")
            tags = parsed.get("tags", [])
        except json.JSONDecodeError:
            # Fallback: treat entire response as story text, no tags
            story = raw_text.strip()
            tags = []

        print(f"[generate-story] story={story!r} tags={tags!r}\n")

        return {"story": story, "tags": tags}

    except HTTPException:
        raise
    except Exception as e:
        print(f"[generate-story] exception: {e}")
        raise HTTPException(status_code=500, detail=f"API error: {e}")


@app.post("/api/upload-image")
async def upload_image(file: UploadFile = File(...)):
    ext = Path(file.filename).suffix if file.filename else ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = UPLOADS_DIR / filename
    dest.write_bytes(await file.read())
    return {"image_url": f"/uploads/{filename}"}


@app.post("/api/cards")
async def create_card(card: CardCreate):
    import json as _json
    card_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    tags_json = _json.dumps(card.tags or [])
    with get_conn() as conn:
        conn.execute(
            """INSERT INTO cards
               (id, title, story, location_name, lat, lng, image_url, tags, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (card_id, card.title, card.story, card.location_name,
             card.lat, card.lng, card.image_url, tags_json, created_at),
        )
    return {"id": card_id, "created_at": created_at, **card.model_dump()}


@app.get("/api/cards/nearby")
async def get_nearby_cards(lat: float, lng: float, radius_km: float = 5.0):
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM cards").fetchall()
    import json as _json
    result = []
    for row in rows:
        d = haversine(lat, lng, row["lat"], row["lng"])
        if d <= radius_km:
            entry = dict(row)
            try:
                entry["tags"] = _json.loads(entry.get("tags") or "[]")
            except Exception:
                entry["tags"] = []
            result.append({**entry, "distance_km": round(d, 3)})
    result.sort(key=lambda x: x["distance_km"])
    return result


@app.get("/health")
async def health():
    return {"status": "ok"}
