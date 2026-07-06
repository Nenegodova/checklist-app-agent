return (
  <>
    <div
      className={dark ? "dark" : ""}
      style={{
        padding: 30,
        minHeight: "100vh",
        fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial",
        background: bg,
        color: textColor
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {/* HEADER FIXED */}
        <div style={{
          display: "flex",
          flexDirection: "column", // делаем колонку, чтобы сначала была шапка, потом фильтры
          gap: 16,
          marginBottom: 24
        }}>
          {/* Верхняя строка: заголовок + селектор + кнопки действий */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12
          }}>
            <div style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: title }}>
                Чек-лист проверки
              </h1>
              <div style={{ marginTop: 6, fontSize: 13, color: mutedColor }}>
                {doneTasks}/{totalTasks} ({percent}%)
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button style={btn} onClick={() => setDark(v => !v)}>Тема</button>

              <div style={{ position: "relative" }}>
                <select
                  value={preset}
                  onChange={(e) => {
                    localStorage.removeItem("checklist");
                    localStorage.removeItem("collapsed");
                    setPreset(e.target.value);
                  }}
                  style={{
                    height: 34,
                    minWidth: 140,
                    padding: "0 36px 0 12px",
                    borderRadius: 10,
                    border: `1px solid ${dark ? "#2a2a2e" : "#d1d5db"}`,
                    background: dark ? "#18181b" : "#ffffff",
                    color: dark ? "#e8e8ea" : "#111827",
                    fontSize: 13,
                    cursor: "pointer",
                    outline: "none",
                    appearance: "none",
                    WebkitAppearance: "none",
                    MozAppearance: "none"
                  }}
                >
                  <option value="default">Обычный</option>
                  <option value="invest">Инвест</option>
                  <option value="shopping">Шопинг</option>
                  <option value="tests">Тест</option>
                  <option value="compare">Сравнятор</option>
                  <option value="spending">Дневник трат</option>
                  <option value="cd">ЧД</option>
                  <option value="shorts">Шорты</option>
                  <option value="ugc">UGC</option>
                </select>
                <span
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    fontSize: 10,
                    color: dark ? "#a1a1aa" : "#666"
                  }}
                >
                  ▼
                </span>
              </div>

              <button style={btn} onClick={resetAll}>Сброс</button>
              <button style={btn} onClick={() => setFocusMode(v => !v)}>
                {focusMode ? "Фокус: ON" : "Фокус: OFF"}
              </button>
              <button style={{ ...btn, color: "red" }} onClick={hardReset}>
                RESET
              </button>
            </div>
          </div>

          {/* Блок фильтров контента (теперь сразу под кнопками) */}
          <div style={{ width: "100%", borderTop: `1px solid ${border}`, paddingTop: 16 }}>
            <div style={{
              fontSize: 12,
              fontWeight: 600,
              color: mutedColor,
              marginBottom: 8
            }}>
              Контент
            </div>

            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6
            }}>
              {Object.entries(CONTENT_FILTERS).map(
                ([key, item]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      setContentFilters((prev) => ({
                        ...prev,
                        [key]: !prev[key]
                      }))
                    }
                    style={{
                      ...btn,
                      height: 28,
                      padding: "4px 10px",
                      fontSize: 12,
                      background: contentFilters[key]
                        ? dark ? "#2d3748" : "#dbeafe"
                        : dark ? "#18181b" : "#fff",
                      color: textColor,
                      fontWeight: contentFilters[key] ? 600 : 400
                    }}
                  >
                    {contentFilters[key] ? "✓ " : ""}{item.label}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* LIST */}
        {Object.keys(tasks).map((cat) => (
          <div key={cat} style={{ marginBottom: 20 }}>
            <div
              onClick={() => toggleCollapse(cat)}
              style={{
                ...ui.categoryTitle,
                display: "flex",
                alignItems: "center",
                gap: 10
              }}
            >
              <span style={{ fontSize: 16 }}>
                {collapsed[cat] ? "▶" : "▼"}
              </span>

              <span>{cat}</span>

              <span
                style={{
                  fontSize: 12,
                  opacity: 0.9,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: dark ? "#2a2a2e" : "#e5e7eb",
                  minWidth: 42,
                  textAlign: "center"
                }}
              >
                {tasks[cat].filter(t => t.done).length}/{tasks[cat].length}
                {tasks[cat].every(t => t.done) ? " ✓" : ""}
              </span>
            </div>

            {!collapsed[cat] && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {tasks[cat].map((task, i) => {
                  if (
                    (cat === "Таблицы" && !contentFilters.tables) ||
                    (task.feature && !contentFilters[task.feature])
                  ) {
                    return null;
                  }

                  return (
                    <label
                      key={i}
                      className="task-card"
                      style={{
                        ...ui.card,
                        display: focusMode && task.done ? "none" : "flex"
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => toggle(cat, i)}
                        style={{
                          width: 16,
                          height: 16,
                          marginTop: 2,
                          accentColor: dark ? "#3f3f46" : "#6b7280",
                          cursor: "pointer",
                          flexShrink: 0
                        }}
                      />
                      <div
                        style={{
                          flex: 1,
                          opacity: task.done ? 0.5 : 1
                        }}
                      >
                        {task.text && (
                          <div
                            style={{
                              ...ui.taskText,
                              textDecoration: task.done
                                ? "line-through"
                                : "none"
                            }}
                          >
                            {renderTextWithLinks(task.text)}
                          </div>
                        )}

                        {task.links?.length > 0 && (
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              marginTop: task.text ? 8 : 0,
                              flexWrap: "wrap"
                            }}
                          >
                            {task.links.map((link) => (
                              <a
                                key={link.url}
                                href={link.url}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  padding: "4px 10px",
                                  borderRadius: 999,
                                  fontSize: 12,
                                  fontWeight: 600,
                                  textDecoration: "none",
                                  background: dark ? "#27272a" : "#eef2f7",
                                  color: dark ? "#93c5fd" : "#2563eb",
                                  border: `1px solid ${dark ? "#3f3f46" : "#d1d5db"}`
                                }}
                              >
                                {link.label}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* FLOATING NOTES */}
      <div
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          zIndex: 999
        }}
      >
        {notesOpen && (
          <div
            style={{
              width: 320,
              marginBottom: 12,
              padding: 16,
              borderRadius: 18,
              border: `1px solid ${border}`,
              background: card,
              boxShadow: dark
                ? "0 12px 40px rgba(0,0,0,0.45)"
                : "0 12px 30px rgba(0,0,0,0.12)"
            }}
          >
            <div
              style={{
                fontWeight: 700,
                marginBottom: 10,
                color: title,
                fontSize: 15
              }}
            >
              Заметки
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 10
              }}
            >
              <button
                onClick={() => {
                  if (!notes.trim()) {
                    setNotes(NOTES_TEMPLATE);
                  }
                }}
                style={{
                  padding: "6px 10px",
                  borderRadius: 10,
                  border: "none",
                  background: dark ? "#27272a" : "#eef2f7",
                  color: textColor,
                  fontSize: 12,
                  cursor: "pointer"
                }}
              >
                Вставить шаблон
              </button>

              <button
                onClick={() => setNotes("")}
                style={{
                  padding: "6px 10px",
                  borderRadius: 10,
                  border: "none",
                  background: dark ? "#3a1f1f" : "#fee2e2",
                  color: dark ? "#fca5a5" : "#991b1b",
                  fontSize: 12,
                  cursor: "pointer"
                }}
              >
                Очистить
              </button>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Заметки по ходу проверки: вопросы, правки и всё, что не хочется потерять — можно записывать сюда, чтобы не держать в голове"
              style={{
                width: "100%",
                height: 180,
                padding: 12,
                borderRadius: 12,
                border: `1px solid ${border}`,
                background: dark ? "#111" : "#fff",
                color: textColor,
                fontSize: 14,
                lineHeight: "20px",
                resize: "none",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>
        )}

        <button
          onClick={() => setNotesOpen(v => !v)}
          style={{
            width: 58,
            height: 58,
            borderRadius: "50%",
            border: "none",
            background: "#c0c0c8",
            color: "#fff",
            fontSize: 22,
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(112, 114, 118, 0.35)"
          }}
        >
          ✍️
        </button>
      </div>
    </div>
  </>
);
