import { useEffect, useState, useMemo, useCallback, useLayoutEffect } from "react";

const DATA_VERSION = "1.1";

const NOTES_TEMPLATE =
  `Вопросы к редакции:
—
Поставить блокер:
—
Правки для фотореда/дизайнера:
—`;

const CONTENT_FILTERS = {
  tables: { label: "Таблицы", default: true },
  screenshots: { label: "Скрины", default: true },
  images: { label: "Картинки", default: true },
  poll: { label: "Опрос", default: true },
  infographic: { label: "Инфографика", default: true },
};

const buildContentFilters = () => {
  const result = {};
  Object.entries(CONTENT_FILTERS).forEach(([key, value]) => {
    result[key] = value.default;
  });
  return result;
};

const PRESETS = {
  default: {},
  invest: {
    "Админка": [
      { _sortOrder: 6, text: "Заполнено краткое описание" },
      { _sortOrder: 3, text: "Заполнен тикер" },
    ],
  },
  shopping: {
    "Админка": [
      { _sortOrder: 4, text: "В подвале стоит: Цены действительны на момент публикации" },
      { _sortOrder: 3, text: "Тег noads" },
    ],
    "Текст": [
      { _sortOrder: 17, text: "Список в шортах: первая строчка с большой, следующие с маленькой, в конце каждой строчки точка, кроме последней, отбиты <br/>" },
    ],
  },
  tests: {
    "Текст": [
      { _sortOrder: 0, text: "В мини⁠-⁠тестах автор и подпись стоят перед лидом" },
      { _sortOrder: 6, text: "Внутри конфига есть все необходимые склейки" },
    ],
    "Админка": [
      { _sortOrder: 3, text: "Проверить автора обложки или источники" },
      { _sortOrder: 2, text: "Тег *noadscalctest*" },
      { _sortOrder: 3, text: "В больших тестах под обложкой указан иллюстратор" },
    ],
    "Прочее": [
      { text: "В кайтене прикреплены ссылки на админку и конфиг" },
      { links: [{ label: "Методичка тесты", url: "https://docs.google.com/document/d/1vBoENUtJI2UHtbBrLqVgPxuoEBE0yNvYhhATKmwiXzU/edit?tab=t.0#bookmark=id.sgzp2wu0gy8c" }] },
    ],
  },
  compare: { "Админка": [{ _sortOrder: 3, text: "Тег noads" }] },
  spending: {
    "Текст": [
      { _sortOrder: 1, text: "В начале статьи стоит плашка panel с абзацами *p grade=\"secondary\"*" },
      { _sortOrder: 1, text: "У авторов стоят анонимные аватарки anonym_male у мужчин и anonym_female у женщин, автор стоит после оглавления" },
      { _sortOrder: 7, text: "Траты обозначены *class=\"negative\"*" },
      { _sortOrder: 7, text: "Доходы обозначены *class=\"positive\"*" },
      { _sortOrder: 2, text: "Все заголовки в дневниках трат кроме заголовков дней *h2 level=\"2\"*" },
    ],
    "Админка": [
      { _sortOrder: 4, text: "Нажата кнопка из сообщества" },
      { _sortOrder: 5, text: "Подпись к обложке: Фотография — Ксения Михайлова" },
    ],
  },
  cd: {
    "Админка": [
      { _sortOrder: 0, text: "В классических ЧД нет подзага" },
      { _sortOrder: 0, text: "В подборке ЧД есть подзаг" },
      { _sortOrder: 5, text: "Обложка с эмодзи с типом мейна «мини над заголовком»" },
      { _sortOrder: 4, text: "Редакция Что делать + тематическая" },
      { _sortOrder: 2, text: "Нажаты кнопки из сообщества и выбор редакции" },
      { _sortOrder: 6, text: "Обязательно указываем краткое описание. В это поле дублируем текст из ог⁠-⁠описания" },
      { _sortOrder: 6, text: "В реальных вопросах проверяем наличие технического *тега noadswhattodo* (скрывает некоторые рекламные баннеры). Если его нет, то добавляем. В выдуманных проставляем тег вместе с другими. Если в статье присутствуют фичеры (калькуляторы, тесты), то добавляем еще один технический тег: *feature⁠-⁠out.* Для опросов этот тег не нужен" },
      { _sortOrder: 0, text: "В подборке ЧД основной заг начинается с о слов «Что делать, если:..»" },
      { _sortOrder: 0, text: "В подборке ЧД url статьи всегда начинается с префикса «ask⁠-»" },
      { _sortOrder: 5, text: "В классических ЧД цвет фона для обложек #2c2c2c" },
      { _sortOrder: 5, text: "В подборке ЧД на обложке ОГ по три эмодзи" },
    ],
    "Текст": [
      { _sortOrder: 0, text: "В классических ЧД нет лида" },
      { _sortOrder: 1, text: "В подборке ЧД есть лид" },
      { text: "Есть автор вопроса и вопрос в плашке с *isbuble=\"true\"*" },
      { _sortOrder: 2, text: "Есть автор ответа" },
      { _sortOrder: 3, text: "В классических ЧД написание автора вопроса «спросил в Сообществе»/«спросила в Сообществе»" },
      { _sortOrder: 4, text: "В классических ЧД заголовки *h2 level=\"2\"*" },
      { _sortOrder: 5, text: "В подборке ЧД заголовки *h2*" },
      { _sortOrder: 6, text: "В подборке ЧД у каждого вопроса стоит бирка с эмодзи" },
      { text: "Если в конце статьи стоит список статей: вводное предложение выделяем болдом, для вводного предложения и списка используем шифт с * p grade=\"large\"*" },
      { _sortOrder: 7, text: "В микро ЧД ответ на вопрос в плашке" },
      { text: "В микро ЧД есть utm⁠-⁠метки у с сылок на внутренние статьи" },
      { _sortOrder: 8, text: "В микро ЧД автор ответа с подписью «нашел ответ»/«нашла ответ»" },
    ],
    "Выпуск": [
      { _sortOrder: 1, text: "Если материал сверстан в старом вопросе автора и нужно выпустить с новым url, то обязательно после публикации нужно настроить редирект" },
      { sortOrder: 2, text: "В случае, когда после выпуска меняется обложка, пишем в тематическом чате соответствующей редакции и чате «Т–Ж + соцсети», что поменялась обложка, прикладываем ссылку на статью и новую обложку" },
    ],
    "Прочее": [
      { links: [{ label: "Методичка ЧД", url: "https://tinkoffjournal.kaiten.ru/documents/g/c4db513a-6478-46ae-967b-984c87b15af0" }] },
    ],
  },
  shorts: {
    "Админка": [
      { _sortOrder: 2, text: "Проставлен *тег noadsshort*" },
      { _sortOrder: 2, text: "Среди потоков добавлены «Шорты», но не основным потоком" },
      { _sortOrder: 2, text: "Нажата кнопка из сообщества и выбор редакции если вторая редакция UGC" },
      { _sortOrder: 3, text: "Обложка внутри статьи отсутствует" },
      { _sortOrder: 3, text: "Источник фото в подвале" },
    ],
    "Текст": [
      { _sortOrder: 4, text: "Подводка размещается в теге * p grade=\"secondary\"*, если она слишком длинная, то часть скрывается под кат" },
      { _sortOrder: 1, text: "Оглавление стоит перед карточками-тайлами" },
      { text: "У текста внутри шортов *grade=\"medium\"*" },
      { _sortOrder: 3, text: "В заголовке нет эмодзи, если в карточке есть картинка" },
      { text: "Для картинки-обтравки добавлен атрибут *image_style=\"picture\"*" },
      { text: "В последней карточке, если это не рассылка, добавлена иконка потока или Telegram, в заголовке этой карточки нет эмодзи. В шортах иконки со скруглёнными углами" },
      { text: "Проверить у ссылки на курс наличие хвоста, если его нет, запросить у редактора" },
      { text: "Проверить у ссылки на анкету наличие хвоста ?internal_source=tj_short_слаг-этого-шорта_any-page_ankета, вместо стандартного. Исключение — анкеты спорта" },
      { text: "Проверить у ссылки на статью или поток наличие хвоста ?internal_source=tj_short_слаг-этого-шорта_any-page_button" },
      { text: "Дискрипшн находится внутри *<tiles></tiles>* и тега * p grade=\"small\"*." },
      { text: "В дискрипшен под последней карточкой вынесена информация об актуальности цен и ценах в валюте (поскольку не используем тултипы), источниках данных, метках об иноагентах и т. д." },
      { text: "У списка в конце шортов * p grade=\"secondary\"*" },
      { text: "Список в конце шортов из 3–4 ссылок выстроен «лесенкой» если позволяет смысл. Вводное предложение — без жирного выделения" },
    ],
    "Прочее": [
      { links: [{ label: "Методичка шорты", url: "https://tinkoffjournal.kaiten.ru/documents/g/c4db513a-6478-46ae-967b-984c87b15af0" }] },
    ],
  },
  ugc: {
    "Админка": [{ _sortOrder: 4, text: "Нажата кнопка из сообщества" }],
    "Текст": [
      {
        _sortOrder: 2,
        links: [{ label: "В текст добавлена актуальная плашка с ообщества", url: "https://docs.google.com/document/d/1U_YBVur4Rtjv5jEMY1Xas9Rr4TxdvenLlIBFbVxIBjg/edit?tab=t.0" }],
      },
    ],
  },
};

const PRESET_EXCLUDES = {
  cd: { "Текст": ["lead", "heading-levels", "editor-badge"], "Админка": ["cover-author", "cover-type", "utm", "credit"] },
  shorts: { "Текст": ["tooltip-link", "currency-tooltip", "lists-style", "utm"] },
};

const DATA = {
  "Админка": [
    { text: "Проверить, что коллеги закрыли вкладку с визивигом" },
    { text: "Перенести мету из комментария в кайтене в админку" },
    { text: "Ог⁠⁠-⁠⁠заг = заголовок статьи, ОГ-описание на месте" },
    { text: "Проверить скрытие" },
    { _sortOrder: 4, text: "Если в затравке отсутствует знак вопроса, то стоит двоеточие" },
    { _sortOrder: 4, text: "Проверить формат" },
    { id: "cover-type", text: "Проверить тип обложки, кредит к обложке в нужном месте (под обложкой/в подвале), наличие бирки на ОГ, текст на ОГ оттипирован (проставлены склейки)" },
    { id: "credit", text: "Проверить автора обложки или источники" },
    { links: [{ label: "Иноагенты и прочие враги в подвале", url: "https://tinkoffjournal.kaiten.ru/documents/d/05e4af49-d4af-433d-a183-528ac0d4da1a" }] },
    { _sortOrder: 9999, text: "Мягкий перенос в заге", links: [{ label: "Символы", url: "https://symbl.cc/ru/00AD/" }, { label: "Правила", url: "https://www.batov.ru/hyph/cgi-bin/hyphtestex.exe" }] },
  ],
  "Текст": [
    { text: "Подпись автора с маленькой буквы" },
    { id: "lead", text: "Лид на месте, в конце точка" },
    { text: "Якоря в оглавлении стоят верно. Двоеточие в оглавлении убрать" },
    { id: "heading-levels", text: "Везде проставлены верные уровни заголовков (*h2*, *h2 level=\"2\"*, *h3* для плашек)" },
    { text: "Проверить бирки над заголовками" },
    { text: "Заменяем невидимые пробелы на *&nbsp;*" },
    { text: "*&nbsp;* склеяны слова с частицами бы, же, ли; предлоги при, про, над, под, для, вне, обо, без" },
    { text: "Внутри *<nobr></nobr>* стоят диапазоны чисел, составные наречия, °C, пишущиеся через дефис слова (до 4 символов от дефиса), числа, которые идут после того, что считаем (минут 15, iPhone 16), аббревиатуры-дополнения (страны ЕС, ставка ЦБ, Витамин C)" },
    { text: "После эмодзи стоит пробел" },
    { text: "Поправить типографирование: м², а не м2, 1/2, а не ½" },
    { text: "Предлог, точка, восклицательный, вопросительный знак, двоеточие в ссылках, запятые вне ссылок" },
    { text: "Точка, запятая, восклицательный, вопросительный знаки, двоеточие, точка с запятой в жире/марке" },
    { text: "У сервисных плашек в последнем предложении отсутствует точка" },
    { text: "Нет пустых атрибутов" },
    { id: "utm", text: "UTM метки отсутствуют" },
    { id: "currency-tooltip", text: "У первого валютного фичера тултип: Суммы в рублях пересчитываются по актуальному курсу раз в день" },
    { id: "tooltip-link", text: "Тултип не стоит рядом с ссылкой" },
    { id: "lists-style", text: "Списки с цифрами и кастомные — с большой буквы, в конце точки. список с буллитами — с маленькой буквы, в конце точка, запятые" },
    { text: "У плашек с авторами с тоит *hl isbubble=\"true\"*" },
    { text: "Опрос на месте, в нем все склеено", feature: "poll" },
    { id: "editor-badge", text: "Верная плашка редакции" },
    { text: "Расставить поля если нужно, они не должны с тоять рядом с баннерами, анкетами, картинками и таблицами" },
    { text: "Проверить виджеты, фичеры, баннеры, этажи, кат" },
  ],
  "Таблицы": [
    { text: "У таблицы есть заголовок" },
    { text: "Проверить *table sticky-header=\"true\"* у таблиц с thead" },
    { text: "Красиво отрегулированы ширины" },
    { text: "Выравнивание по левому краю если: числа не сравниваются между собой, а используются как обозначение или порядковый номер, в колонке есть диапазоны, в колонке смешаны разные единицы измерения, в колонке используются валютные фичеры (в том числе есть ячейки с ним, а есть без него), в части ячеек нет числовых значений" },
    { text: "Списки: пункты лежат внутри одной ячейки, вначале пункта стоит •, после буллита стоит пробел, каждый пункт с большой буквы, в конце пунктов нет знаков препинания, пункты разделяются <br/>" },
    { text: "Если в таблице есть цены, то строки нужно отсортировать по убыванию цен" },
  ],
  "Картинки": [
    { text: "Источники под фотками заменены на ©", feature: "images" },
    { text: "Скрины ретиновые и чистые, текст читаем, соблюдены поля, проставлен *prop=\"bordered\"* если фон сливается с фоном страницы", feature: "screenshots" },
    { text: "Проверить необходимость *prop=\"bordered\"* у видео", feature: "images" },
    { text: "Для инфографики проставлен *prop=\"bordered rounded\"*", feature: "infographic" },
    { text: "В подписи к инфографике есть Источник: ", feature: "infographic" },
    { text: "Проверить в кайтене наличие комментария от фотореда о размере картинок или фоторам", feature: "images" },
    { text: "Проверить есть ли засветы или вотермарки на картинках от фотореда", feature: "images" },
    { text: "При необходимости заблюрены все персональные данные", feature: "images" },
  ],
  "Выпуск": [
    { text: "Проверить метку разметка, если есть доп. авторы" },
    { text: "Проверить комментарии в кайтене" },
    { text: "В кайтен прикрепить ссылку на материал после выпуска и опенграф-картинку" },
    { text: "После выпуска проверить материал на главной" },
  ],
  "Прочее": [
    { text: "В ссылке шаблона гугл⁠-⁠дока для копирования */edit* заменен на */copy*." },
    { links: [{ label: "Методички общие", url: "https://tinkoffjournal.kaiten.ru/documents/g/1a81bca6-923a-460c-8081-864ecb12e994" }] },
  ],
};

// --- Helpers ---
const readStorageJSON = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    console.warn(`localStorage corrupted: ${key}`, err);
    localStorage.removeItem(key);
    return null;
  }
};

const buildCollapsed = (data, prev = {}) => {
  const next = {};
  Object.keys(data).forEach((cat) => {
    next[cat] = prev?.[cat] ?? true;
  });
  return next;
};

const buildTasks = (data) => {
  const initial = {};
  Object.keys(data).forEach((cat) => {
    initial[cat] = data[cat].map((t) => ({
      id: t.id || t.text,
      text: typeof t === "string" ? t : t.text,
      links: typeof t === "string" ? [] : t.links || [],
      feature: typeof t === "string" ? null : t.feature || null,
      done: false,
    }));
  });
  return initial;
};

function useMediaQuery(query) {
  const getMatches = () => (typeof window !== "undefined" ? window.matchMedia(query).matches : false);
  const [matches, setMatches] = useState(getMatches);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

// ИСПРАВЛЕНО: функция вынесена наружу, ключи генерируются через индекс map (стабильно)
const renderTextWithLinks = (text, dark) => {
  if (!text) return null;
  const parts = text.split(/(\*[^*]+\*|\[[^\]]+\]\(https?:\/\/[^)]+\))/g);
  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith("*") && part.endsWith("*")) {
      return <strong key={i} style={{ fontWeight: 700 }}>{part.slice(1, -1)}</strong>;
    }
    const match = part.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);
    if (match) {
      const [, label, url] = match;
      return (
        <a key={i} href={url} target="_blank" rel="noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", padding: "2px 8px", marginLeft: 6,
            borderRadius: 8, background: dark ? "#33334b" : "#e8e8ea", color: dark ? "#7ab7ff" : "#2563eb",
            textDecoration: "none", fontSize: 13, fontWeight: 500
          }}
        >{label}</a>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

// --- Component ---
export default function App() {
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem("dark");
      if (saved !== null) return saved === "true";
      return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      if (localStorage.getItem("dark") === null) {
        setDark(e.matches);
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const [preset, setPreset] = useState(() => localStorage.getItem("preset") || "default");
  const [contentFilters, setContentFilters] = useState(() => readStorageJSON("contentFilters") || buildContentFilters());
  const [focusMode, setFocusMode] = useState(false);

  // --- ДОБАВЛЕНО: недостающие состояния и функция toggle ---
  const [tasks, setTasks] = useState(() => buildTasks(DATA));
  const [collapsed, setCollapsed] = useState(() => buildCollapsed(DATA));
  const [notes, setNotes] = useState("");
  const [notesOpen, setNotesOpen] = useState(false);
  const toggle = useCallback((cat, i) => {
    setTasks((prev) => ({
      ...prev,
      [cat]: prev[cat].map((t, idx) =>
        idx === i ? { ...t, done: !t.done } : t
      ),
    }));
  }, []);
  // --- КОНЕЦ ДОБАВЛЕНИЯ ---

  // --- AI АГЕНТ: Состояния ---
  const [aiCode, setAiCode] = useState("");
  const [aiFeatures, setAiFeatures] = useState(null);
  const [aiFilterMode, setAiFilterMode] = useState(false);

  // ИСПРАВЛЕНО: маппинг привязан к РЕАЛЬНЫМ id из вашего DATA
  const AI_FEATURE_TO_TASK_IDS = {
    has_forms: ["lists-style", "editor-badge", "utm"],
    has_media: ["credit", "cover-type"],
    has_flex_grid: ["lists-style"],
    has_images: ["credit", "cover-type"],
    has_tables: ["lists-style"],
    has_meta: ["heading-levels", "lead"],
    has_labels: ["lists-style", "editor-badge"],
    has_js_interactive: ["tooltip-link", "currency-tooltip"],
    has_responsive_img: ["cover-type"],
    has_semantic: ["heading-levels", "lead"],
  };

  // ИСПРАВЛЕНО: убран alert, добавлена обработка ошибок
  const analyzeCode = useCallback((code) => {
    if (!code.trim()) return;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(code, 'text/html');
      const features = {
        has_forms: doc.querySelectorAll('input,select,textarea').length > 0,
        has_media: /@media/.test(code),
        has_flex_grid: /display:\s*(flex|grid|inline-flex|inline-grid)/.test(code),
        has_images: doc.querySelectorAll('img,picture,video').length > 0,
        has_tables: doc.querySelectorAll('table').length > 0,
        has_meta: doc.querySelector('meta[name="description"]') !== null,
        has_labels: Array.from(doc.querySelectorAll('input,select,textarea')).every(el => {
          const parent = el.closest('label');
          const byFor = parent ? el.id && doc.querySelector(`label[for="${el.id}"]`) : false;
          return parent || byFor;
        }),
        has_js_interactive: /addEventListener|fetch\s*\(|axios|\.on\s*=\s*|\.then\(|\.click/.test(code),
        has_responsive_img: /srcset|sizes|picture/.test(code),
        has_semantic: /<article|<section|<nav|<header|<footer|<main/.test(code),
      };
      setAiFeatures(features);
      setAiFilterMode(true);
    } catch (err) {
      console.error("Ошибка парсинга кода:", err);
    }
  }, []);



  const resetAll = useCallback(() => {
    setTasks((prev) => {
      const cleared = {};
      Object.keys(prev).forEach((cat) => {
        cleared[cat] = prev[cat].map((t) => ({ ...t, done: false }));
      });
      return cleared;
    });
  }, []);

  const hardReset = useCallback(() => {
    ["preset", "notes", "checklist", "collapsed", "contentFilters", "version", "dark"].forEach((key) => localStorage.removeItem(key));
    localStorage.setItem("version", DATA_VERSION);
    setPreset("default");
    setContentFilters(buildContentFilters());
    setNotes("");
    setFocusMode(false);
    setDark(false);
    setTasks(buildTasks(DATA));
    setCollapsed(buildCollapsed(DATA));
  }, []);

  const toggleCollapse = useCallback((cat) => {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }, []);

  const allTasks = Object.values(tasks ?? {}).flat();
  const doneTasks = allTasks.filter((t) => t.done).length;
  const totalTasks = allTasks.length;
  const percent = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);
  const isMobile = useMediaQuery("(max-width: 900px)");
  const textColor = dark ? "#e8e8ea" : "#111";
  const mutedColor = dark ? "#a1a1aa" : "#555";
  const card = dark ? "#1A1D21" : "#ffffff";
  const border = dark ? "#2F343C" : "#E5E7EB";
  const bg = dark ? "#111315" : "#F6F7F9";
  const title = dark ? "#FFFFFF" : "#111827";
  const category = dark ? "#F3F4F6" : "#111827";
  const controlBase = {
    height: 34, padding: "6px 12px", borderRadius: 10, fontSize: 13, lineHeight: "20px",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", transition: "all 0.15s ease", boxShadow: "none", outline: "none",
  };
  const makeControl = (isDark) => ({
    ...controlBase, border: `1px solid ${isDark ? "#2a2a2e" : "#d1d5db"}`,
    background: isDark ? "#1A1D21" : "#ffffff", color: isDark ? "#e8e8ea" : "#111827",
  });
  const btn = makeControl(dark);
  const ui = {
    categoryTitle: { cursor: "pointer", marginBottom: 12, fontSize: 15, fontWeight: 600, color: category, display: "flex", alignItems: "center", gap: 16 },
    card: { display: "flex", alignItems: "flex-start", gap: 10, padding: "16px 18px", border: `1px solid ${border}`, background: card, textAlign: "left", borderRadius: 18, transition: "all 0.15s ease", boxShadow: dark ? "0 1px 2px rgba(0,0,0,0.3)" : "0 1px 2px rgba(0,0,0,0.05)" },
    taskText: { flex: 1, fontSize: 13, lineHeight: "18px", color: textColor, textDecoration: "none" },
  };

  return (
    <div className={dark ? "dark" : ""} style={{ padding: 30, minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial", background: bg, color: textColor }}>
      <style>{`
        body, html { margin: 0 !important; padding: 0 !important; }
      `}</style>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {/* Шапка и контролы */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 24, marginBottom: 24 }}>
          <div style={{ flex: "1 1 320px", textAlign: "center" }}>
            <h1 style={{ margin: 0, padding: 0, fontSize: 28, fontWeight: 700, color: title, lineHeight: 1.2 }}>Чек-лист проверки</h1>
            <div style={{ marginTop: 8, fontSize: 13, color: mutedColor, lineHeight: 1.5 }}>{doneTasks}/{totalTasks} ({percent}%)</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12, marginLeft: "auto", flex: "0 1 520px" }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: isMobile ? "center" : "flex-end", width: "100%" }}>
              <button type="button" style={btn} onClick={() => setDark((v) => !v)}>
                {dark ? "☀️" : "🌙"}
              </button>
              <div style={{ position: "relative" }}>
                <select value={preset} onChange={(e) => { localStorage.removeItem("checklist"); localStorage.removeItem("collapsed"); setPreset(e.target.value); }}
                  style={{ height: 34, minWidth: 140, padding: "0 36px 0 12px", borderRadius: 10, border: `1px solid ${dark ? "#2a2a2e" : "#d1d5db"}`, background: dark ? "#18181b" : "#ffffff", color: dark ? "#e8e8ea" : "#111827", fontSize: 13, cursor: "pointer", outline: "none", appearance: "none", WebkitAppearance: "none", MozAppearance: "none" }}>
                  <option value="default">Обычный</option><option value="invest">Инвест</option><option value="shopping">Шопинг</option><option value="tests">Тест</option><option value="compare">Сравнятор</option><option value="spending">Дневник трат</option><option value="cd">ЧД</option><option value="shorts">Шорты</option><option value="ugc">UGC</option>
                </select>
                <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: 10, color: dark ? "#a1a1aa" : "#666" }}>▼</span>
              </div>
              <button type="button" style={btn} onClick={resetAll}>Сброс</button>
              <button type="button" style={btn} onClick={() => setFocusMode((v) => !v)}>{focusMode ? "Фокус: ON" : "Фокус: OFF"}</button>
              <button type="button" style={{ ...btn, color: "red" }} onClick={hardReset}>RESET</button>
            </div>
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", alignItems: isMobile ? "center" : "flex-end", width: "100%" }}>
              <div style={{ width: "100%", fontSize: 12, fontWeight: 600, color: mutedColor, marginBottom: 6, textAlign: "center" }}>Контент</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: isMobile ? "center" : "flex-end" }}>
                {Object.entries(CONTENT_FILTERS).map(([key, item]) => (
                  <button key={key} type="button" onClick={() => setContentFilters((prev) => ({ ...prev, [key]: !prev[key] }))}
                    style={{ ...btn, height: 28, padding: "4px 10px", fontSize: 12, background: contentFilters[key] ? "#FFDD2D" : dark ? "#1A1D21" : "#fff", color: contentFilters[key] ? "#111" : textColor, border: contentFilters[key] ? "1px solid #FFDD2D" : `1px solid ${border}`, fontWeight: contentFilters[key] ? 600 : 400 }}>
                    {contentFilters[key] ? "✓ " : ""}{item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* --- AI АГЕНТ: Панель анализа --- */}
        {/* --- AI АГЕНТ: Панель анализа --- */}
        <div style={{ marginBottom: 24, padding: 16, borderRadius: 16, background: dark ? "#1e293b" : "#f8fafc", border: `1px solid ${border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 12 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: title }}>🤖 AI-анализ кода</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" style={{ ...btn, opacity: aiCode ? 1 : 0.5 }} onClick={() => analyzeCode(aiCode)} disabled={!aiCode}>
                ▶ Проверить код
              </button>
              <button type="button" style={btn} onClick={() => { setAiFilterMode(false); setAiFeatures(null); }}>Сбросить фильтр</button>
            </div>
          </div>
          <textarea
            id="ai-code-input"
            name="ai-code-input"
            value={aiCode}
            onChange={(e) => setAiCode(e.target.value)}
            placeholder="Вставьте сюда HTML/CSS/JS код..."
            aria-label="Поле ввода кода для AI-анализа"
            style={{ width: "100%", minHeight: 100, padding: 12, borderRadius: 12, border: `1px solid ${border}`, background: dark ? "#0f172a" : "#fff", color: textColor, fontSize: 13, fontFamily: "monospace", resize: "vertical" }}
          />
          {aiFeatures && aiFilterMode && (
            <div style={{ marginTop: 10, fontSize: 12, color: "#10b981", fontWeight: 600 }}>
              ✅ Режим активирован: показаны только релевантные пункты
            </div>
          )}
        </div>
        {/* --- AI АГЕНТ: Умная фильтрация списка --- */}
        {(() => {
          // 🎯 Границы влияния AI-фильтра: только содержательные разделы
          const AI_ALLOWED_CATEGORIES = ["Текст", "Таблицы", "Картинки"];
          const isAiCategory = aiFilterMode && aiFeatures && AI_ALLOWED_CATEGORIES.includes(cat);

          // 🔍 1. Формируем списки разрешённых ID и Feature для текущего анализа кода
          const allowedIds = new Set();
          const allowedFeatures = new Set();
          if (aiFilterMode && aiFeatures) {
            Object.entries(AI_FEATURE_TO_TASK_IDS).forEach(([aiKey, ids]) => {
              if (aiFeatures[aiKey]) ids.forEach(id => allowedIds.add(id));
            });
            // AI detect media -> показываем все media-задачи
            if (aiFeatures.has_images) {
              allowedFeatures.add("images");
              allowedFeatures.add("screenshots");
              allowedFeatures.add("infographic");
            }
          }

          // ✅ 2. Проверяем, есть ли хоть один элемент для показа в этой категории
          const hasVisible = categoryTasks.some(task => {
            const baseVisible = (cat !== "Таблицы" || contentFilters.tables) &&
              (!task.feature || contentFilters[task.feature]);
            if (!baseVisible) return false;

            if (isAiCategory) {
              if (cat === "Таблицы") return aiFeatures.has_tables;
              if (task.feature) return allowedFeatures.has(task.feature);
              if (task.id) return allowedIds.has(task.id);
            }
            return true; // Задачи без id/feature (базовая проверка текста) всегда видны
          });
          if (!hasVisible) return null;

          // 📊 3. Точный подсчёт для шапки категории
          const visibleCount = categoryTasks.filter(task => {
            const base = (cat !== "Таблицы" || contentFilters.tables) && (!task.feature || contentFilters[task.feature]);
            if (!base) return false;
            if (isAiCategory) {
              if (cat === "Таблицы") return aiFeatures.has_tables;
              if (task.feature) return allowedFeatures.has(task.feature);
              if (task.id) return allowedIds.has(task.id);
            }
            return true;
          }).length;

          return (
            <div key={cat} style={{ marginBottom: 20 }}>
              <div onClick={() => toggleCollapse(cat)} style={{ ...ui.categoryTitle, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16 }}>{collapsed[cat] ? "▶" : "▼"}</span>
                <span>{cat}</span>
                <span style={{ fontSize: 12, opacity: 0.9, padding: "2px 8px", borderRadius: 999, background: dark ? "#2a2a2e" : "#e5e7eb", minWidth: 42, textAlign: "center" }}>
                  {visibleCount}/{categoryTasks.length} {visibleCount === categoryTasks.length ? " ✓" : ""}
                </span>
              </div>
              {!collapsed[cat] && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {categoryTasks.map((task, i) => {
                    // 🛡️ Базовый фильтр (ручные переключатели Контент)
                    const baseVisible = (cat !== "Таблицы" || contentFilters.tables) &&
                      (!task.feature || contentFilters[task.feature]);

                    // 🤖 Точечный AI-фильтр (только для разрешённых категорий)
                    let aiVisible = true;
                    if (isAiCategory) {
                      if (cat === "Таблицы") aiVisible = aiFeatures.has_tables;
                      else if (task.feature) aiVisible = allowedFeatures.has(task.feature);
                      else if (task.id) aiVisible = allowedIds.has(task.id);
                      // Остальные текстовые чекбоксы (без id/feature) всегда показываем
                    }

                    if (!baseVisible || !aiVisible) return null;

                    return (
                      <label key={task.id || task.text} className="task-card" style={{ ...ui.card, display: focusMode && task.done ? "none" : "flex" }}>
                        <input type="checkbox" checked={task.done} onChange={() => toggle(cat, i)} aria-label={task.text}
                          style={{ width: 16, height: 16, marginTop: 2, accentColor: dark ? "#3f3f46" : "#6b7280", cursor: "pointer", flexShrink: 0 }} />
                        <div style={{ flex: 1, opacity: task.done ? 0.5 : 1 }}>
                          {task.text && <div style={{ ...ui.taskText, textDecoration: task.done ? "line-through" : "none" }}>{renderTextWithLinks(task.text, dark)}</div>}
                          {task.links?.length > 0 && (
                            <div style={{ display: "flex", gap: 8, marginTop: task.text ? 8 : 0, flexWrap: "wrap" }}>
                              {task.links.map((link) => (
                                <a key={link.url} href={link.url} target="_blank" rel="noreferrer"
                                  style={{ padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, textDecoration: "none", background: dark ? "#27272a" : "#eef2f7", color: dark ? "#93c5fd" : "#2563eb", border: dark ? "1px solid #3f3f46" : "1px solid #d1d5db" }}>
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
          );
        })()}
        {/* --- Заметки (плавающая панель) --- */}
        <div style={{ position: "fixed", right: 24, bottom: 24, zIndex: 999 }}>
          {notesOpen && (
            <div style={{ width: 320, marginBottom: 12, padding: 16, borderRadius: 18, border: `1px solid ${border}`, background: card, boxShadow: dark ? "0 12px 40px rgba(0,0,0,0.45)" : "0 12px 30px rgba(0,0,0,0.12)" }}>
              <div style={{ fontWeight: 700, marginBottom: 10, color: title, fontSize: 15 }}>Заметки</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <button type="button" onClick={() => setNotes((prev) => prev.trim() ? prev : NOTES_TEMPLATE)}
                  style={{ padding: "6px 10px", borderRadius: 10, border: "none", background: dark ? "#27272a" : "#eef2f7", color: textColor, fontSize: 12, cursor: "pointer" }}>Вставить шаблон</button>
                <button type="button" onClick={() => setNotes("")}
                  style={{ padding: "6px 10px", borderRadius: 10, border: "none", background: dark ? "#3a1f1f" : "#fee2e2", color: dark ? "#fca5a5" : "#991b1b", fontSize: 12, cursor: "pointer" }}>Очистить</button>
              </div>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Заметки по ходу проверки: вопросы, правки и всё, что не хочется потерять — можно записывать сюда, чтобы не держать в голове"
                style={{ width: "100%", height: 180, padding: 12, borderRadius: 12, border: `1px solid ${border}`, background: dark ? "#111" : "#fff", color: textColor, fontSize: 14, lineHeight: "20px", resize: "none", outline: "none", boxSizing: "border-box" }} />
            </div>
          )}

          <button type="button" onClick={() => setNotesOpen((v) => !v)}
            style={{
              width: 58, height: 58, borderRadius: "50%", border: "2px solid #FFDD2D",
              background: bg, color: dark ? "#FFDD2D" : "#111827",
              boxShadow: dark ? "0 8px 24px rgba(0,0,0,0.4)" : "0 8px 24px rgba(0,0,0,0.12)",
              fontSize: 22, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center"
            }}>✏️</button>
        </div>
      </div>
    </div>
  );
}
