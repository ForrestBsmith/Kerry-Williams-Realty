import json
import os
import re
import subprocess
import time
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel, Field


load_dotenv()
BASE_DIR = Path(__file__).resolve().parent
ONWARD_DIR = Path(os.getenv("ONWARD_DIR", str(BASE_DIR.parent / "Onward"))).resolve()
load_dotenv(ONWARD_DIR / ".env")


SHEET_WEBHOOK_URL = os.getenv(
    "SHEET_WEBHOOK_URL",
    "https://script.google.com/macros/s/AKfycbz1y92nUxaYyW_Zngv-9iMu0eGbyTwXOmIPOQFH_ZhQx0k6RW4H1Vfx9xACMsJuxrMJ/exec",
)
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
DATA_CACHE_TTL_SECONDS = int(os.getenv("DATA_CACHE_TTL_SECONDS", "300"))
MAX_CANDIDATES = int(os.getenv("MAX_CANDIDATES", "6"))
DRIVE_PREVIEW_LIMIT = int(os.getenv("DRIVE_PREVIEW_LIMIT", "8"))
SHEET_ID = os.getenv("SHEET_ID") or os.getenv("SHEETS_SPREADSHEET_ID") or ""
SHEET_RANGE = os.getenv("LISTINGS_SHEET_RANGE") or os.getenv("SHEETS_LISTINGS_RANGE") or os.getenv("SHEET_RANGE") or os.getenv("SHEETS_RANGE") or ""

app = FastAPI(title="44 Realty AI Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_cached_data: Optional[Dict[str, Any]] = None
_cached_at: float = 0.0
_drive_service = None
_sheets_service = None


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    session_id: Optional[str] = None


class LeadRequest(BaseModel):
    name: str = Field(..., min_length=1)
    email: str = Field(..., min_length=3)
    phone: str = Field(..., min_length=6)
    property_inquired: str = Field(..., min_length=1)
    notes: Optional[str] = None


class RenderRequest(BaseModel):
    listing_id: Optional[str] = None
    scope: str = "single"  # single | batch-ready
    outputs: List[str] = Field(default_factory=list)
    brochure: bool = False
    verbose: bool = False


def _normalize_text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, (int, float)):
        return str(value)
    return str(value)


def _clean_number(token: str) -> Optional[float]:
    if not token:
        return None
    token = token.replace(",", "").strip().lower()
    multiplier = 1
    if token.endswith("k"):
        multiplier = 1000
        token = token[:-1]
    elif token.endswith("m"):
        multiplier = 1000000
        token = token[:-1]
    try:
        return float(token) * multiplier
    except ValueError:
        return None


def _extract_numbers(text: str) -> List[float]:
    matches = re.findall(r"\$?([0-9]+(?:\.[0-9]+)?[km]?)", text.lower())
    numbers = []
    for match in matches:
        value = _clean_number(match)
        if value is not None:
            numbers.append(value)
    return numbers


def _extract_criteria(text: str, properties: List[Dict[str, Any]]) -> Dict[str, Any]:
    text_lower = text.lower()
    criteria: Dict[str, Any] = {}

    numbers = _extract_numbers(text_lower)

    between_match = re.search(r"between\s+\$?([0-9,.km]+)\s+and\s+\$?([0-9,.km]+)", text_lower)
    if between_match:
        min_val = _clean_number(between_match.group(1))
        max_val = _clean_number(between_match.group(2))
        if min_val:
            criteria["min_price"] = min_val
        if max_val:
            criteria["max_price"] = max_val
    else:
        if any(word in text_lower for word in ["under", "below", "max", "up to", "no more than"]):
            if numbers:
                criteria["max_price"] = max(numbers)
        if any(word in text_lower for word in ["over", "above", "min", "at least", "starting at"]):
            if numbers:
                criteria["min_price"] = min(numbers)

    bed_match = re.search(r"(\d+)\s*(bed|beds|bd)", text_lower)
    if bed_match:
        criteria["min_beds"] = int(bed_match.group(1))

    bath_match = re.search(r"(\d+)\s*(bath|baths|ba)", text_lower)
    if bath_match:
        criteria["min_baths"] = int(bath_match.group(1))

    type_map = {
        "condo": "Condo",
        "apartment": "Apartment",
        "commercial": "Commercial",
        "single family": "Single Family",
        "house": "House",
        "rental": "Rental",
    }
    for key, label in type_map.items():
        if key in text_lower:
            criteria["type"] = label
            break

    city_names = {str(p.get("city", "")).lower(): p.get("city") for p in properties if p.get("city")}
    for city_lower, city in city_names.items():
        if city_lower and city_lower in text_lower:
            criteria["city"] = city
            break

    return criteria


def _property_matches(property_data: Dict[str, Any], criteria: Dict[str, Any]) -> bool:
    if not criteria:
        return True

    price = property_data.get("price")
    if criteria.get("min_price") and price is not None and price < criteria["min_price"]:
        return False
    if criteria.get("max_price") and price is not None and price > criteria["max_price"]:
        return False

    beds = property_data.get("bedrooms")
    if criteria.get("min_beds") and beds is not None and beds < criteria["min_beds"]:
        return False

    baths = property_data.get("bathrooms")
    if criteria.get("min_baths") and baths is not None and baths < criteria["min_baths"]:
        return False

    if criteria.get("type"):
        prop_type = _normalize_text(property_data.get("type")).lower()
        if criteria["type"].lower() not in prop_type:
            return False

    if criteria.get("city"):
        prop_city = _normalize_text(property_data.get("city")).lower()
        if criteria["city"].lower() != prop_city:
            return False

    return True


def _property_score(property_data: Dict[str, Any], criteria: Dict[str, Any], text: str) -> float:
    score = 0.0
    if criteria.get("min_price") or criteria.get("max_price"):
        if property_data.get("price") is not None:
            score += 1
    if criteria.get("min_beds") and property_data.get("bedrooms") is not None:
        score += 1
    if criteria.get("min_baths") and property_data.get("bathrooms") is not None:
        score += 1
    if criteria.get("type") and property_data.get("type"):
        score += 1
    if criteria.get("city") and property_data.get("city"):
        score += 1

    text_lower = text.lower()
    keywords = [kw for kw in re.split(r"\W+", text_lower) if len(kw) > 3]
    haystack = " ".join(_normalize_text(v).lower() for v in property_data.values())
    for kw in keywords:
        if kw in haystack:
            score += 0.2

    return score


def _select_properties(properties: List[Dict[str, Any]], text: str) -> List[Dict[str, Any]]:
    criteria = _extract_criteria(text, properties)
    filtered = [p for p in properties if _property_matches(p, criteria)]
    scored = [
        (p, _property_score(p, criteria, text))
        for p in (filtered if filtered else properties)
    ]
    scored.sort(key=lambda item: item[1], reverse=True)
    return [item[0] for item in scored[:MAX_CANDIDATES]]


async def _fetch_sheet_data() -> Dict[str, Any]:
    global _cached_data, _cached_at
    if _cached_data and (time.time() - _cached_at) < DATA_CACHE_TTL_SECONDS:
        return _cached_data

    async with httpx.AsyncClient(timeout=20, follow_redirects=True) as client_http:
        try:
            response = await client_http.get(SHEET_WEBHOOK_URL)
            response.raise_for_status()
            payload = response.json()
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"Failed to read sheet data: {exc}")

    if not payload:
        raise HTTPException(status_code=502, detail="Sheet data empty")

    data_block = payload[0] if isinstance(payload, list) else payload
    _cached_data = data_block
    _cached_at = time.time()
    return data_block


def _normalize_header(header: str = "") -> str:
    return re.sub(r"[^A-Z0-9]+", "_", (header or "").strip().upper()).strip("_")


def _rows_with_headers(values: List[List[Any]]) -> List[Dict[str, Any]]:
    if not values:
        return []

    headers = [_normalize_header(str(header)) for header in values[0]]
    rows = []
    for row in values[1:]:
        item = {}
        for idx, header in enumerate(headers):
            if not header:
                continue
            item[header] = row[idx] if idx < len(row) else ""
        rows.append(item)
    return rows


def _build_sheets_service():
    global _sheets_service
    if _sheets_service is not None:
        return _sheets_service

    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build
    except ImportError as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Google Sheets dependencies are not installed: {exc}",
        )

    private_key = os.getenv("GOOGLE_PRIVATE_KEY", "").replace("\\n", "\n")
    client_email = os.getenv("GOOGLE_CLIENT_EMAIL", "")
    project_id = os.getenv("GOOGLE_PROJECT_ID", "")

    if not private_key or not client_email:
        raise HTTPException(
            status_code=500,
            detail="Missing GOOGLE_CLIENT_EMAIL/GOOGLE_PRIVATE_KEY for Sheets access",
        )

    creds_info = {
        "type": "service_account",
        "project_id": project_id,
        "private_key": private_key,
        "client_email": client_email,
        "token_uri": "https://oauth2.googleapis.com/token",
    }
    creds = service_account.Credentials.from_service_account_info(
        creds_info,
        scopes=["https://www.googleapis.com/auth/spreadsheets.readonly"],
    )
    _sheets_service = build("sheets", "v4", credentials=creds)
    return _sheets_service


def _get_listing_rows_from_google_sheet() -> List[Dict[str, Any]]:
    if not SHEET_ID or not SHEET_RANGE:
        return []

    sheets = _build_sheets_service()
    response = (
        sheets.spreadsheets()
        .values()
        .get(spreadsheetId=SHEET_ID, range=SHEET_RANGE)
        .execute()
    )
    return _rows_with_headers(response.get("values", []))


def _property_to_listing(property_row: Dict[str, Any], index: int) -> Dict[str, Any]:
    def is_previewable_url(url: str) -> bool:
        value = str(url or "").strip()
        if not value:
            return False
        if value.startswith(("http://", "https://", "/")):
            return True
        # The website payload contains some relative placeholders like
        # img/marksmithproperty-1.jpg that are not served by the intranet app.
        return False

    image_urls = []
    if property_row.get("image"):
        image_urls.append(property_row["image"])
    if isinstance(property_row.get("images"), list):
        image_urls.extend(property_row["images"])

    preview_assets = [
        {
            "label": f"Photo {photo_index + 1}",
            "outputKey": "photo",
            "url": url,
            "webViewLink": url,
        }
        for photo_index, url in enumerate(url for url in dict.fromkeys(image_urls) if is_previewable_url(url))
    ]

    return {
        **property_row,
        "listingId": property_row.get("id") or f"property-{index + 1}",
        "address": property_row.get("address") or "",
        "status": property_row.get("status") or "draft",
        "agent": property_row.get("agentId") or property_row.get("listingAgentId") or "",
        "assetSetId": property_row.get("assetSetId") or "",
        "folderId": property_row.get("folderId") or property_row.get("FOLDER_ID") or "",
        "previewAssets": preview_assets,
    }


def _build_system_prompt(properties: List[Dict[str, Any]], agents: List[Dict[str, Any]]) -> str:
    data_blob = json.dumps(
        {"properties": properties, "agents": agents},
        ensure_ascii=True,
        indent=2,
    )
    return (
        "You are a helpful real estate assistant for 44 Realty Group. "
        "Use ONLY the provided property and agent data for factual details. "
        "If a detail is missing, say you don't have it. "
        "Give short, clear recommendations (2-3 homes) and ask clarifying questions when needed. "
        "If the user wants to tour, buy, sell, or speak with an agent, ask for name, email, phone, "
        "and the property address they're interested in. "
        "\n\nAvailable data (JSON):\n"
        f"{data_blob}"
    )


def _build_drive_service():
    global _drive_service
    if _drive_service is not None:
        return _drive_service

    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build
    except ImportError as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Google Drive dependencies are not installed: {exc}",
        )

    private_key = os.getenv("GOOGLE_PRIVATE_KEY", "").replace("\\n", "\n")
    client_email = os.getenv("GOOGLE_CLIENT_EMAIL", "")
    project_id = os.getenv("GOOGLE_PROJECT_ID", "")

    if not private_key or not client_email:
        raise HTTPException(
            status_code=500,
            detail="Missing GOOGLE_CLIENT_EMAIL/GOOGLE_PRIVATE_KEY for Drive preview access",
        )

    creds_info = {
        "type": "service_account",
        "project_id": project_id,
        "private_key": private_key,
        "client_email": client_email,
        "token_uri": "https://oauth2.googleapis.com/token",
    }
    creds = service_account.Credentials.from_service_account_info(
        creds_info,
        scopes=["https://www.googleapis.com/auth/drive.readonly"],
    )
    _drive_service = build("drive", "v3", credentials=creds)
    return _drive_service


def _output_key_from_name(name: str) -> str:
    low = (name or "").strip().lower()
    if any(k in low for k in ["hero", "cover"]):
        return "hero"
    if any(k in low for k in ["story", "vertical"]):
        return "story"
    if "square" in low:
        return "square"
    if any(k in low for k in ["tiktok", "video", "reel"]):
        return "video"
    if any(k in low for k in ["floor", "map", "retailer", "zoning", "fema", "flood", "boundary"]):
        return "brochure"
    return "social-cards"


def _preview_record_from_drive_file(file_item: Dict[str, Any]) -> Dict[str, str]:
    name = file_item.get("name", "Asset")
    mime_type = file_item.get("mimeType", "")
    thumbnail_url = file_item.get("thumbnailLink", "")
    if not thumbnail_url and mime_type.startswith("image/"):
        thumbnail_url = file_item.get("webContentLink", "")
    return {
        "fileId": file_item.get("id", ""),
        "label": name,
        "outputKey": _output_key_from_name(name),
        "url": thumbnail_url or "",
        "webViewLink": file_item.get("webViewLink", "") or file_item.get("webContentLink", "") or "",
        "mimeType": mime_type,
    }


def _list_folder_images_for_preview(folder_id: str, limit: int) -> List[Dict[str, str]]:
    drive = _build_drive_service()
    files = []

    def query_images(parent_id: str) -> List[Dict[str, Any]]:
        response = (
            drive.files()
            .list(
                q=(
                    f"'{parent_id}' in parents and "
                    "mimeType contains 'image/' and trashed = false"
                ),
                fields="files(id,name,mimeType,thumbnailLink,webViewLink)",
                pageSize=50,
            )
            .execute()
        )
        return response.get("files", [])

    files.extend(query_images(folder_id))

    if not files:
        nested = (
            drive.files()
            .list(
                q=(
                    f"'{folder_id}' in parents and "
                    "mimeType = 'application/vnd.google-apps.folder' and trashed = false"
                ),
                fields="files(id,name)",
                pageSize=30,
            )
            .execute()
            .get("files", [])
        )
        for item in nested:
            if item.get("name", "").strip().lower() in {"photo_upload", "photo upload"}:
                files.extend(query_images(item["id"]))
                if files:
                    break

    files.sort(key=lambda f: (f.get("name") or "").lower())
    return [_preview_record_from_drive_file(file_item) for file_item in files[: max(1, limit)]]


def _build_render_command(req: RenderRequest) -> List[str]:
    script_path = ONWARD_DIR / "src" / "index.js"
    if not script_path.exists():
        raise HTTPException(status_code=500, detail=f"Onward script not found: {script_path}")

    cmd = ["node", "src/index.js"]
    mode = "all" if req.scope == "batch-ready" else "one"
    cmd.append(f"--mode={mode}")

    if req.listing_id and req.scope != "batch-ready":
        cmd.append(f"--listing-id={req.listing_id}")

    if req.outputs:
        normalized = [x.strip().lower() for x in req.outputs if x and x.strip()]
        if normalized:
            cmd.append(f"--outputs={','.join(normalized)}")

    if req.brochure:
        cmd.append("--brochure")

    if req.verbose:
        cmd.append("--verbose")

    return cmd


@app.get("/health")
async def health_check() -> Dict[str, str]:
    return {"status": "ok"}


@app.get("/api/listings")
async def listings() -> List[Dict[str, Any]]:
    try:
        rows = _get_listing_rows_from_google_sheet()
        if rows:
            return rows
    except Exception as exc:
        print(f"Google Sheets listing fetch failed, falling back to webhook: {exc}")

    sheet_data = await _fetch_sheet_data()
    properties = sheet_data.get("properties", [])
    if not isinstance(properties, list):
        return []
    return [_property_to_listing(row, idx) for idx, row in enumerate(properties)]


@app.get("/api/asset-preview")
async def asset_preview(
    folder_id: str,
    limit: int = DRIVE_PREVIEW_LIMIT,
) -> Dict[str, Any]:
    folder_id = (folder_id or "").strip()
    if not folder_id:
        raise HTTPException(status_code=400, detail="folder_id is required")

    try:
        previews = _list_folder_images_for_preview(folder_id, limit)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Drive preview failed: {exc}")

    return {"folderId": folder_id, "assets": previews}


@app.get("/api/image-proxy")
async def image_proxy(url: str) -> Response:
    if not url.startswith(("http://", "https://")):
        raise HTTPException(status_code=400, detail="Only http(s) image URLs are supported")

    async with httpx.AsyncClient(timeout=20, follow_redirects=True) as client_http:
        try:
            response = await client_http.get(url)
            response.raise_for_status()
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"Image proxy failed: {exc}")

    content_type = response.headers.get("content-type", "application/octet-stream")
    return Response(
        content=response.content,
        media_type=content_type,
        headers={"Cache-Control": "public, max-age=3600"},
    )


@app.get("/api/render-sample/{filename}")
async def render_sample(filename: str) -> FileResponse:
    safe_name = Path(filename).name
    sample_path = ONWARD_DIR / "output" / safe_name
    if not sample_path.exists() or not sample_path.is_file():
        raise HTTPException(status_code=404, detail="Render sample not found")
    return FileResponse(sample_path)


@app.post("/api/render/run")
async def run_render(payload: RenderRequest) -> Dict[str, Any]:
    cmd = _build_render_command(payload)
    run_id = str(uuid.uuid4())
    started_at = time.time()

    try:
        proc = subprocess.run(
            cmd,
            cwd=str(ONWARD_DIR),
            capture_output=True,
            text=True,
            check=False,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Render execution failed: {exc}")

    duration_ms = int((time.time() - started_at) * 1000)
    ok = proc.returncode == 0

    return {
        "runId": run_id,
        "ok": ok,
        "command": cmd,
        "scope": payload.scope,
        "listingId": payload.listing_id,
        "outputs": payload.outputs,
        "durationMs": duration_ms,
        "exitCode": proc.returncode,
        "stdout": (proc.stdout or "")[-4000:],
        "stderr": (proc.stderr or "")[-4000:],
    }


@app.post("/api/chat")
async def chat(request: ChatRequest) -> Dict[str, Any]:
    if not request.messages:
        raise HTTPException(status_code=400, detail="messages required")

    sheet_data = await _fetch_sheet_data()
    properties = sheet_data.get("properties", [])
    agents = sheet_data.get("agents", [])

    latest_user_message = next(
        (msg.content for msg in reversed(request.messages) if msg.role == "user"),
        "",
    )

    selected_properties = _select_properties(properties, latest_user_message)
    related_agent_ids = {
        prop.get("agentId") or prop.get("listingAgentId") for prop in selected_properties
    }
    related_agents = [
        agent for agent in agents if agent.get("id") in related_agent_ids
    ]

    system_prompt = _build_system_prompt(selected_properties, related_agents)

    messages = [
        {"role": "system", "content": system_prompt},
        *[{"role": msg.role, "content": msg.content} for msg in request.messages],
    ]

    try:
        from openai import OpenAI

        client = OpenAI()
        response = client.responses.create(
            model=OPENAI_MODEL,
            input=messages,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"OpenAI request failed: {exc}")

    assistant_text = ""
    if response.output:
        for item in response.output:
            if item.type == "message":
                for segment in item.content:
                    if segment.type == "output_text":
                        assistant_text += segment.text

    return {
        "reply": assistant_text.strip() or "I'm here to help—what kind of home are you looking for?",
        "properties": selected_properties,
        "agents": related_agents,
    }


@app.post("/api/lead")
async def capture_lead(payload: LeadRequest) -> Dict[str, Any]:
    lead_payload = {
        "name": payload.name,
        "email": payload.email,
        "phone": payload.phone,
        "notes": f"Property inquired: {payload.property_inquired}",
        "interests": payload.property_inquired,
        "source": "AI Chatbot",
    }
    if payload.notes:
        lead_payload["notes"] += f" | {payload.notes}"

    async with httpx.AsyncClient(timeout=20) as client_http:
        try:
            response = await client_http.post(
                SHEET_WEBHOOK_URL,
                content=json.dumps(lead_payload),
                headers={"Content-Type": "text/plain"},
            )
            response.raise_for_status()
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"Lead capture failed: {exc}")

    return {"ok": True}
