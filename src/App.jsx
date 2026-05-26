import React, { useEffect, useState } from "react";

const DATA_VERSION = "1.1";

const PRESETS = {
  default: {},
  invest: { "Админка": [{ text: "Заполнена выдержка" }, { text: "Заполнен тикер" }] },
  shopping: { "Админка": [{ text: "Напоминание о пересчете цен" }, { text: "Тег noads" }] },
  tests: {
    "Текст": [{ text: "В мини-тестах автор и подпись стоят перед лидом" }],
    "Админка": [
      { text: "В подвале больших тестов прописаны авторы и источники" },
      { text: "Тег noads" },
      { text: "В больших тестах под обложкой указан иллюстратор" }
    ],
    "Прочее": [
      { text: "Методичка тесты", links: [{ label: "Методичка тесты", url: "https://docs.google.com/document/d/1vBoENUtJI2UHtbBrLqVgPxuoEBE0yNvYhhATKmwiXzU/edit?tab=t.0#bookmark=id.sgzp2wu0gy8c" }] }
    ]
  },
  compare: { "Админка": [{ text: "Тег noads" }] },
  spending: { "Прочее": [{ text: "Нажата кнопка из сообщества" }] }
};

const DATA = {
  "Админка": [
    { text: "Проверить подзаголовок, слаг, редакции, теги, потоки, формат, вопрос к читателям, нож (в тюнах), мету, ог-описание, краткий заг или краткое описание" },
    { text: "Ог-заг = заголовок статьи" },
    { text: "Проверить скрытие" },
    { text: "Размер обложки, подпись к обложке в нужном месте (под обложкой/в подвале), актуальность текста, 18+ не обрезается на ОГ" },
    { text: "Если в затравке отсутствует знак вопроса, то стоит двоеточие" },
    { text: "Проверить автора обложки или источники" },
    { text: "Иноагенты и прочие враги в подвале" }
  ],
  "Текст": [
    { text: "Проверить метку разметка, если есть доп. авторы" },
    { text: "Подпись автора с маленькой буквы" },
    { text: "Лид на месте, в конце точка" }
  ],
  "Таблицы": [{ text: "Десктоп работает корректно" }],
  "Картинки": [{ text: "Сверить с доком все картинки" }],
  "Прочее": [
    { text: "Методички общие" },
    { text: "Проверить метку в кайтене об обновлении" }
  ]
};

function TaskItem({ task, onToggle, dark, focusMode }) {
  return (
    <label
      style={{
        display: task.done && focusMode ? "none" : "flex",
        alignItems: "center",
        gap: 8,
        padding: 12,
        borderRadius: 10,
        border: `1px solid ${dark ? "#2a2a2e" : "#e5e7eb"}`,
        background: dark ? "#18181b" : "#ffffff",
        boxShadow: dark ? "0 1px 2px rgba(0,0,0,0.3)" : "0 1px 2px rgba(0,0,0,0.05)",
        margin: "0 0 6px 0",
        textAlign: "left"
      }}
    >
      <input
        type="checkbox"
        checked={task.done}
        onChange={onToggle}
        style={{ width: 16, height: 16, marginTop: 2, cursor: "pointer" }}
      />
      <div style={{ flex: 1, opacity: task.done ? 0.5 : 1 }}>
        <div style={{
          fontSize: 13,
          lineHeight: "18px",
          color: dark ? "#e8e8ea" : "#111827",
          textDecoration: task.done ? "line-through" : "none"
        }}>
          {task.text}
          {task.links?.length > 0 &&
            task.links.map((l) => (
              <a key={l.url} href={l.url} target="_blank" rel="noreferrer" style={{ marginLeft: 8 }}>
                {l.label}
              </a>
            ))}
        </div>
      </div>
    </label>
  );
}

function CategorySection({ cat, items, onToggle, collapsed, onToggleCollapse, dark, focusMode }) {
  return (
    <div key={cat} style={{ marginBottom: 20 }}>
      <div
        onClick={() => onToggleCollapse(cat)}
        style={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontWeight: 600,
          fontSize: 15,
          color: dark ? "#e5e7eb" : "#111827",
          padding: "6px 0"
        }}
      >
        <span style={{ fontSize: 16 }}>{collapsed ? "▶" : "▼"}</span>
        <span>{cat}</span>
        <span style={{
          fontSize: 12, opacity: 0.9, padding: "2px 8px",
          borderRadius: 999, background: dark ? "#2a2a2e" : "#e5e7eb",
          minWidth: 42, textAlign: "center"
        }}>
          {items.filter(t => t.done).length}/{items.length}{items.every(t => t.done) ? " ✓" : ""}
        </span>
      </div>
      {!collapsed && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((task, i) => (
            <TaskItem key={i} task={task} onToggle={() => onToggle(cat, i)} dark={dark} focusMode={focusMode} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [dark, setDark] = useState(false);
  const [preset, setPreset] = useState(() => localStorage.getItem("preset") || "default");
  const [focusMode, setFocusMode] = useState(false);
  const [notes, setNotes] = useState(() => localStorage.getItem("notes") || "");
  const [notesOpen, setNotesOpen] = useState(false);

  const buildData = () => {
    const result = JSON.parse(JSON.stringify(DATA));
    const presetData = PRESETS[preset];
    if (presetData) {
      Object.keys(presetData).forEach((category) => {
        if (!result[category]) result[category] = [];
        result[category] = [...result[category], ...presetData[category]];
      });
    }
    return result;
  };

  const [tasks, setTasks] = useState(() => {
    const savedVersion = localStorage.getItem("version");
    const saved = localStorage.getItem("checklist");
    if (savedVersion !== DATA_VERSION) {
      localStorage.removeItem("checklist");
      localStorage.removeItem("collapsed");
      localStorage.setItem("version", DATA_VERSION);
    }
    if (saved) return JSON.parse(saved);

    const initial = {};
    const currentData = buildData();
    Object.keys(currentData).forEach((cat) => {
      initial[cat] = currentData[cat].map((t) => ({
        text: typeof t === "string" ? t : t.text,
        links: typeof t === "string" ? [] : t.links || [],
        done: false
      }));
    });
    return initial;
  });

  useEffect(() => { localStorage.setItem("preset", preset); }, [preset]);

  useEffect(() => {
    const currentData = buildData();
    setTasks((prev) => {
      const next = {};
      Object.keys(currentData).forEach((cat) => {
        next[cat] = currentData[cat].map((t) => {
          const text = typeof t === "string" ? t : t.text;
          const links = typeof t === "string" ? [] : t.links || [];
          const old = prev?.[cat]?.find((x) => x.text === text);
          return { text, links, done: old?.done ?? false };
        });
      });
      return next;
    });
  }, [preset]);

  useEffect(() => {
    const data = buildData();
    // обновление collapsed не детализировано в этом упрощении
  }, [preset]);

  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("collapsed");
    if (saved) return JSON.parse(saved);
    const data = buildData();
    const init = {};
    Object.keys(data).forEach((cat) => (init[cat] = true));
    return init;
  });

  useEffect(() => { localStorage.setItem("checklist", JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem("collapsed", JSON.stringify(collapsed)); }, [collapsed]);
  useEffect(() => { localStorage.setItem("notes", notes); }, [notes]);

  const toggle = (cat, index) => {
    setTasks((prev) => {
      const updated = prev[cat].map((t, i) => (i === index ? { ...t, done: !t.done } : t));
      const completed = updated.every((t) => t.done);
      if (completed) {
        setCollapsed((c) => ({ ...c, [cat]: true }));
      }
      return { ...prev, [cat]: updated };
    });
  };

  const resetAll = () => {
    const cleared = {};
    Object.keys(tasks).forEach((cat) => {
      cleared[cat] = tasks[cat].map((t) => ({ ...t, done: false }));
    });
    setTasks(cleared);
  };

  // упрощённая версия reset
  const hardReset = () => {
    localStorage.removeItem("checklist");
    localStorage.removeItem("collapsed");
    localStorage.removeItem("notes");
    localStorage.removeItem("preset");
    localStorage.removeItem("version");
    setNotes("");
    setPreset("default");
    const currentData = JSON.parse(JSON.stringify(DATA));
    const initial = {};
    Object.keys(currentData).forEach((cat) => {
      initial[cat] = currentData[cat].map((t) => ({
        text: typeof t === "string" ? t : t.text,
        links: typeof t === "string" ? [] : t.links || [],
        done: false
      }));
    });
    setTasks(initial);
    const collapsedInitial = {};
    Object.keys(currentData).forEach((cat) => (collapsedInitial[cat] = true));
    setCollapsed(collapsedInitial);
  };

  const toggleCollapse = (cat) => {
    setCollapsed((p) => ({ ...p, [cat]: !p[cat] }));
  };

  const allTasks = Object.values(tasks).flat();
  const doneTasks = allTasks.filter((t) => t.done).length;
  const totalTasks = allTasks.length;
  const percent = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  const textColor = dark ? "#e8e8ea" : "#111";
  const mutedColor = dark ? "#a1a1aa" : "#555";
  const card = dark ? "#18181b" : "#ffffff";
  const border = dark ? "#2a2a2e" : "#e5e7eb";
  const bg = dark ? "#0f0f10" : "#f5f5f7";
  const title = dark ? "#ffffff" : "#0a0a0a";

  // кнопки-стили
  const btn = {
    height: 34,
    padding: "6px 12px",
    borderRadius: 10,
    fontSize: 13,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    border: `1px solid ${dark ? "#2a2a2e" : "#d1d5db"}`,
    background: dark ? "#18181b" : "#ffffff",
    color: dark ? "#e8e8ea" : "#111827"
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20
  };

  const onPresetChange = (e) => {
    localStorage.removeItem("checklist");
    localStorage.removeItem("collapsed");
    setPreset(e.target.value);
  };

  // UI
  return (
    <>
      <div className={dark ? "dark" : ""} style={{
        padding: 30, minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial",
        background: bg, color: textColor
      }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={headerStyle}>
            <div style={{ flex: 1, textAlign: "center" }}>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: title }}>
                Чек-лист проверки
              </h1>
              <div style={{ marginTop: 6, fontSize: 13, color: mutedColor }}>
                {doneTasks}/{totalTasks} ({percent}%)
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button style={btn} onClick={() => setDark((v) => !v)}>Тема</button>
              <div style={{ position: "relative" }}>
                <select value={preset} onChange={onPresetChange} style={{
                  height: 34, minWidth: 140, padding: "0 36px 0 12px",
                  borderRadius: 10, border: `1px solid ${dark ? "#2a2a2e" : "#d1d5db"}`,
                  background: dark ? "#18181b" : "#ffffff", color: dark ? "#e8e8ea" : "#111827",
                  fontSize: 13, cursor: "pointer", outline: "none", appearance: "none"
                }}>
                  <option value="default">Обычный</option>
                  <option value="invest">Инвест</option>
                  <option value="shopping">Шопинг</option>
                  <option value="tests">Тест</option>
                  <option value="compare">Сравнятор</option>
                  <option value="spending">Дневник трат</option>
                </select>
              </div>
              <button style={btn} onClick={resetAll}>Сброс</button>
              <button style={btn} onClick={() => setFocusMode((v) => !v)}>
                {focusMode ? "Фокус: ON" : "Фокус: OFF"}
              </button>
              <button style={{ ...btn, color: "red" }} onClick={hardReset}>RESET</button>
            </div>
          </div>

          {Object.keys(tasks).map((cat) => (
            <CategorySection
              key={cat}
              cat={cat}
              items={tasks[cat]}
              onToggle={toggle}
              collapsed={collapsed[cat]}
              onToggleCollapse={toggleCollapse}
              dark={dark}
              focusMode={focusMode}
            />
          ))}
        </div>
      </div>

      <div style={{ position: "fixed", right: 24, bottom: 24, zIndex: 999 }}>
        {notesOpen && (
          <div style={{
            width: 320, marginBottom: 12, padding: 16, borderRadius: 18,
            border: `1px solid ${border}`, background: card
          }}>
            <div style={{ fontWeight: 700, marginBottom: 10, color: title, fontSize: 15 }}>Заметки</div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Заметки..."
              style={{
                width: "100%", height: 180, padding: 12, borderRadius: 12,
                border: `1px solid ${border}`, background: dark ? "#111" : "#fff",
                color: textColor, fontSize: 14, resize: "none"
              }}
            />
          </div>
        )}
        <button onClick={() => setNotesOpen(v => !v)} style={{
          width: 58, height: 58, borderRadius: "50%", border: "none",
          background: "#c0c0c8", color: "#fff", fontSize: 22,
          cursor: "pointer", boxShadow: "0 8px 24px rgba(112,114,118,0.35)"
        }}>✍️</button>
      </div>
    </>
  );
}
