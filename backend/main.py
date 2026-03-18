import json
import os
import re
import time
from typing import Any, Dict, List, Optional

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel, Field


load_dotenv()


SHEET_WEBHOOK_URL = os.getenv(
    "SHEET_WEBHOOK_URL",
    "https://script.google.com/macros/s/AKfycbz1y92nUxaYyW_Zngv-9iMu0eGbyTwXOmIPOQFH_ZhQx0k6RW4H1Vfx9xACMsJuxrMJ/exec",
)
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
DATA_CACHE_TTL_SECONDS = int(os.getenv("DATA_CACHE_TTL_SECONDS", "300"))
MAX_CANDIDATES = int(os.getenv("MAX_CANDIDATES", "6"))

app = FastAPI(title="44 Realty AI Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI()

_cached_data: Optional[Dict[str, Any]] = None
_cached_at: float = 0.0


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

    # Keyword scoring across all property fields
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

    async with httpx.AsyncClient(timeout=20) as client_http:
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


@app.get("/health")
async def health_check() -> Dict[str, str]:
    return {"status": "ok"}


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
