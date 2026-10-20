import os
import sqlite3
from contextlib import closing
from html import escape
from pathlib import Path

from fastapi import FastAPI, Form, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse

BASE_DIR = Path(__file__).parent
DB_PATH = Path(os.environ.get("GUESTBOOK_DB_PATH", BASE_DIR / "guestbook.db"))

app = FastAPI(title="Guestbook API")


def connect() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL CHECK(length(trim(name)) > 0),
            message TEXT NOT NULL CHECK(length(trim(message)) > 0)
        )
        """
    )
    connection.commit()
    return connection


def get_entries() -> list[dict[str, object]]:
    with closing(connect()) as connection:
        rows = connection.execute(
            "SELECT id, name, message FROM entries ORDER BY id DESC"
        ).fetchall()
    return [dict(row) for row in rows]


def add_form(error: str = "", name: str = "", message: str = "") -> str:
    return f"""<!doctype html>
<html lang="vi">
  <head><meta charset="utf-8"><title>Thêm lời nhắn</title></head>
  <body>
    <h1>Để lại lời nhắn</h1>
    <p role="alert">{escape(error)}</p>
    <form action="/add" method="post">
      <label>Tên <input name="name" value="{escape(name, quote=True)}" required></label>
      <label>Lời nhắn <textarea name="message" required>{escape(message)}</textarea></label>
      <button type="submit">Gửi lời nhắn</button>
    </form>
    <p><a href="/">Xem tất cả lời nhắn</a></p>
  </body>
</html>"""


@app.get("/")
@app.get("/api/entries")
def index() -> list[dict[str, object]]:
    return get_entries()


@app.get("/add", response_class=HTMLResponse)
def add_form_page() -> HTMLResponse:
    return HTMLResponse(add_form())


@app.post("/add")
@app.post("/api/add")
def add_entry(
    request: Request,
    name: str = Form(""),
    message: str = Form(""),
):
    name = name.strip()
    message = message.strip()
    if not name or not message:
        error = "Vui lòng nhập đầy đủ tên và lời nhắn."
        if "text/html" in request.headers.get("accept", ""):
            return HTMLResponse(
                add_form(error=error, name=name, message=message),
                status_code=400,
            )
        return JSONResponse({"detail": error}, status_code=422)

    with closing(connect()) as connection:
        cursor = connection.execute(
            "INSERT INTO entries (name, message) VALUES (?, ?)",
            (name, message),
        )
        connection.commit()
        entry_id = cursor.lastrowid

    if "text/html" in request.headers.get("accept", ""):
        return RedirectResponse(url="/", status_code=303)
    return JSONResponse(
        {"id": entry_id, "name": name, "message": message},
        status_code=201,
    )


@app.post("/delete/{entry_id}")
@app.delete("/delete/{entry_id}")
@app.post("/api/delete/{entry_id}")
@app.delete("/api/delete/{entry_id}")
def delete_entry(entry_id: int, request: Request):
    with closing(connect()) as connection:
        cursor = connection.execute("DELETE FROM entries WHERE id = ?", (entry_id,))
        connection.commit()

    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy lời nhắn.")
    if "text/html" in request.headers.get("accept", ""):
        return RedirectResponse(url="/", status_code=303)
    return JSONResponse({"deleted": entry_id})
