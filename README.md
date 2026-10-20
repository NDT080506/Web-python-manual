# Guestbook - Manual

Ứng dụng guestbook gồm FastAPI, SQLite và giao diện React/Vite.

## Chạy backend

Mở terminal tại `manual/backend`:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn main:app --reload
```

Backend chạy tại `http://127.0.0.1:8000`. Database SQLite được tạo tự động tại
`manual/backend/guestbook.db`.

## Chạy frontend

Mở terminal thứ hai tại `manual/frontend`:

```powershell
npm install
npm run dev
```

Mở địa chỉ Vite hiển thị trong terminal (mặc định
`http://localhost:5173`). Vite chuyển tiếp các request `/api` tới FastAPI.

## Chức năng và endpoint

- `GET /` và `GET /api/entries`: lấy tất cả lời nhắn.
- `GET /add`: hiển thị form HTML cơ bản; giao diện React có form tại `/add`.
- `POST /add` và `POST /api/add`: thêm lời nhắn. Cả `name` và `message`
  phải có nội dung.
- `POST /delete/{id}` hoặc `DELETE /delete/{id}` (có alias `/api/delete/{id}`):
  xóa lời nhắn theo ID.

Các endpoint nhận dữ liệu thêm từ form fields `name` và `message`. API trả lỗi
HTTP 422 khi dữ liệu không hợp lệ. Frontend React hiển thị lỗi và nạp lại danh
sách sau khi thêm hoặc xóa.
=======
# Web-python-manual
