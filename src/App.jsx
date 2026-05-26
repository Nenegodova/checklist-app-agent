import { useEffect, useState } from "react";

const DATA_VERSION = "1.1";

const PRESETS = {
  default: {},

  invest: {
    "Админка": [
      { text: "Заполнена выдержка" },
      { text: "Заполнен тикер" }
    ]
  },

  shopping: {
    "Админка": [
      { text: "Напоминание о пересчете цен" },
      { text: "Тег noads" }
    ]
  },

  tests: {
    "Текст": [
      { text: "В мини-тестах автор и подпись стоят перед лидом" }
    ],
    "Админка": [
      { text: "В подвале больших тестов прописаны авторы и источники" },
      { text: "Тег noads" },
      { text: "В больших тестах под обложкой указан иллюстратор" }
    ],
    "Прочее": [
      {
        text: "Методичка тесты",
        links: [
          {
            label: "Методичка тесты",
            url: "https://docs.google.com/document/d/1vBoENUtJI2UHtbBrLqVgPxuoEBE0yNvYhhATKmwiXzU/edit?tab=t.0#bookmark=id.sgzp2wu0gy8c"
          }
        ]
      }
    ]
  },

  compare: {
    "Админка": [{ text: "Тег noads" }]
  },

  spending: {
    "Прочее": [{ text: "Нажата кнопка из сообщества" }]
  }
};

const DATA = {
  "Админка": [
    { text: "Проверить подзаголовок..." },
    { text: "Ог-заг = заголовок статьи" }
  ],
  "Текст": [
    { text: "Проверить метку разметка" }
  ]
};

const buildCollapsed = (data, prev = {}) => {
  const next = {};
  Object.keys(data).forEach((cat) => {
    next[cat] = prev?.[cat] ?? true;
  });
  return next;
};

export default function App() {
  const [dark, setDark] = useState(false);
  const [preset, setPreset] = useState(
    () => localStorage.getItem("preset") || "default"
  );
  const [focusMode, setFocusMode] = useState(false);
  const [notes, setNotes] = useState(
    () => localStorage.getItem("notes") || ""
  );
  const [notesOpen, setNotesOpen] = useState(false);

  const buildData = () => {
    const result = JSON.parse(JSON.stringify(DATA));
    const presetData = PRESETS[preset];

    if (presetData) {
      Object.keys(presetData).forEach((cat) => {
        if (!result[cat]) result[cat] = [];
        result[cat] = [...result[cat], ...presetData[cat]];
      });
    }

    return result;
  };

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("checklist");
    const version = localStorage.getItem("version");

    if (version !== DATA_VERSION) {
      localStorage.removeItem("checklist");
      localStorage.removeItem("collapsed");
      localStorage.setItem("version", DATA_VERSION);
    }

    if (saved) return JSON.parse(saved);

    const data = buildData();
    const initial = {};

    Object.keys(data).forEach((cat) => {
      initial[cat] = data[cat].map((t) => ({
        text: typeof t === "string" ? t : t.text,
        links: typeof t === "string" ? [] : t.links || [],
        done: false
      }));
    });

    return initial;
  });

  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("collapsed");
    if (saved) return JSON.parse(saved);
    return buildCollapsed(buildData());
  });

  useEffect(() => {
    localStorage.setItem("preset", preset);
  }, [preset]);

  useEffect(() => {
    localStorage.setItem("checklist", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("collapsed", JSON.stringify(collapsed));
  }, [collapsed]);

  useEffect(() => {
    localStorage.setItem("notes", notes);
  }, [notes]);

  useEffect(() => {
    const data = buildData();

    setTasks((prev) => {
      const next = {};
      Object.keys(data).forEach((cat) => {
        next[cat] = data[cat].map((t) => {
          const text = typeof t === "string" ? t : t.text;
          const links = typeof t === "string" ? [] : t.links || [];
          const old = prev?.[cat]?.find((x) => x.text === text);

          return {
            text,
            links,
            done: old?.done ?? false
          };
        });
      });
      return next;
    });

    setCollapsed((prev) => buildCollapsed(data, prev));
  }, [preset]);

  const toggle = (cat, index) => {
    setTasks((prev) => {
      const updated = prev[cat].map((t, i) =>
        i === index ? { ...t, done: !t.done } : t
      );

      if (updated.every((t) => t.done)) {
        setCollapsed((prevC) => ({
          ...prevC,
          [cat]: true
        }));
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

  const hardReset = () => {
    localStorage.clear();
    setPreset("default");
    setNotes("");

    const data = buildData();
    const initial = {};

    Object.keys(data).forEach((cat) => {
      initial[cat] = data[cat].map((t) => ({
        text: typeof t === "string" ? t : t.text,
        links: typeof t === "string" ? [] : t.links || [],
        done: false
      }));
    });

    setTasks(initial);
    setCollapsed(buildCollapsed(data));
  };

  const all = Object.values(tasks || {}).flat();
  const done = all.filter((t) => t.done).length;
  const total = all.length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  const darkBg = dark ? "#0f0f10" : "#f5f5f7";
  const card = dark ? "#18181b" : "#fff";
  const text = dark ? "#e8e8ea" : "#111";

  return (
    <div style={{ padding: 30, background: darkBg, minHeight: "100vh", color: text }}>
      <h1>Чек-лист проверки</h1>
      <p>{done}/{total} ({percent}%)</p>

      <button onClick={() => setDark(!dark)}>Тема</button>
      <button onClick={resetAll}>Сброс</button>
      <button onClick={hardReset}>RESET</button>

      {Object.keys(tasks).map((cat) => (
        <div key={cat} style={{ marginTop: 20 }}>
          <h3 onClick={() => setCollapsed((p) => ({ ...p, [cat]: !p[cat] }))}>
            {collapsed[cat] ? "▶" : "▼"} {cat}
          </h3>

          {!collapsed[cat] &&
            tasks[cat].map((task, i) => (
              <div
                key={i}
                style={{
                  padding: 10,
                  marginBottom: 6,
                  background: card
                }}
              >
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => toggle(cat, i)}
                />
                <span style={{ marginLeft: 10, textDecoration: task.done ? "line-through" : "none" }}>
                  {task.text}
                </span>
              </div>
            ))}
        </div>
      ))}

      <button onClick={() => setNotesOpen((v) => !v)}>✍️</button>

      {notesOpen && (
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ width: 300, height: 150 }}
        />
      )}
    </div>
  );
}