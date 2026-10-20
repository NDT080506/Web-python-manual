import { useCallback, useEffect, useState } from "react";
import { Link, Route, Routes, useNavigate } from "react-router-dom";

function Guestbook() {
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadEntries = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/entries");
      if (!response.ok) {
        throw new Error("Không thể tải danh sách lời nhắn.");
      }
      setEntries(await response.json());
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  async function deleteEntry(id) {
    setError("");
    try {
      const response = await fetch(`/api/delete/${id}`, { method: "POST" });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.detail || "Không thể xóa lời nhắn.");
      }
      setEntries((current) => current.filter((entry) => entry.id !== id));
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1>GUESTBOOK</h1>
          <p className="subtitle">Hãy để lại một lời nhắn</p>
        </div>
        <Link className="button" to="/add">Viết lời nhắn</Link>
      </header>

      {error && <p className="notice error" role="alert">{error}</p>}
      {loading ? (
        <p className="empty-state">Đang tải lời nhắn...</p>
      ) : entries.length === 0 ? (
        <p className="empty-state">Chưa có lời nhắn nào. Hãy là người đầu tiên!</p>
      ) : (
        <section className="entries" aria-label="Tất cả lời nhắn">
          {entries.map((entry) => (
            <article className="entry-card" key={entry.id}>
              <div className="entry-heading">
                <h2>{entry.name}</h2>
                <button
                  className="delete-button"
                  type="button"
                  onClick={() => deleteEntry(entry.id)}
                  aria-label={`Xóa lời nhắn của ${entry.name}`}
                >
                  Xóa
                </button>
              </div>
              <p>{entry.message}</p>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

function AddEntry() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submitEntry(event) {
    event.preventDefault();
    if (!name.trim() || !message.trim()) {
      setError("Vui lòng nhập đầy đủ tên và lời nhắn.");
      return;
    }

    setError("");
    setSaving(true);
    try {
      const form = new FormData();
      form.set("name", name);
      form.set("message", message);
      const response = await fetch("/api/add", { method: "POST", body: form });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.detail || "Không thể gửi lời nhắn.");
      }
      navigate("/");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page form-page">
      <Link className="back-link" to="/">← Trở về trang chủ</Link>
      <p className="eyebrow">LỜI NHẮN MỚI</p>
      <h1>Để lại lời nhắn</h1>
      <p className="subtitle">Cả tên và lời nhắn đều cần được điền.</p>
      {error && <p className="notice error" role="alert">{error}</p>}
      <form className="entry-form" onSubmit={submitEntry}>
        <label htmlFor="name">Tên</label>
        <input
          id="name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={100}
          required
        />
        <label htmlFor="message">Lời nhắn</label>
        <textarea
          id="message"
          name="message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={5}
          maxLength={2000}
          required
        />
        <button className="button" type="submit" disabled={saving}>
          {saving ? "Đang gửi..." : "Gửi lời nhắn"}
        </button>
      </form>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Guestbook />} />
      <Route path="/add" element={<AddEntry />} />
      <Route path="*" element={<Guestbook />} />
    </Routes>
  );
}
