/* ==================== CONFIGURATION ==================== */
const CONFIG = {
  APP_VERSION: "2.0",
  STORAGE_KEY: "savedDescriptions_v2_0",
  // Старі ключі — з них один раз підтягуємо збережені описи (самі старі дані не видаляються)
  OLD_STORAGE_KEYS: ["savedDescriptions_v1_2", "savedDescriptions_v1_1_1"],
  THEME_KEY: "descTheme",

  DELETE_SVG: `<svg viewBox="-3.5 0 19 19" xmlns="http://www.w3.org/2000/svg"><path d="M11.383 13.644A1.03 1.03 0 0 1 9.928 15.1L6 11.172 2.072 15.1a1.03 1.03 0 1 1-1.455-1.456l3.928-3.928L.617 5.79a1.03 1.03 0 1 1 1.455-1.456L6 8.261l3.928-3.928a1.03 1.03 0 0 1 1.455 1.456L7.455 9.716z" fill="currentColor"/></svg>`,
  COPY_SVG: `<svg viewBox="0 0 24 24"><path d="M16 1H4a1 1 0 0 0-1 1v14h2V3h11V1zm3 4H8a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1zm-1 16H9V7h9v14z"/></svg>`,
  CHECK_SVG: `<svg viewBox="0 0 24 24"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>`,

  COPY_NOPRICE_ICON: "https://shafa.c.prom.st/favicon-32x32.png",

  FEEDBACK_MS: 1500,

  BRANDS: [
    "ZARA",
    "H&M",
    "M&S",
    "George",
    "Primark",
    "F&F",
    "Stradivarius",
    "Bershka",
    "Pull & Bear",
    "COS",
    "Arket",
    "Massimo Dutti",
    "Next",
    "New Look",
    "& Other Stories",
    "Mango",
    "ASOS",
    "Topshop",
    "Monki",
    "Reiss",
    "Autograph",
    "Hugo Boss",
    "Cashmere",
    "Woolmark",
    "Ralph Lauren",
    "Max Mara",
    "Only",
    "C&A",
    "Weekday",
    "Calvin Klein",
    "Uniqlo",
    "Urban Outfitters",
    "Vila",
    "Puma",
    "Cotton On",
    "Motel",
    "Pepe Jeans",
    "Levis",
    "Guess",
    "Michael Kors",
    "JJXX",
    "Selected",
    "Old Navy",
    "Gap",
    "Nobody's Child",
    "Brandy Melville",
    "Papaya",
    "Per Una",
    "Jigsaw",
    "Drykorn",
    "Maje",
    "Reclaimed Vintage",
    "Majestic Filatures",
    "Eleventy",
    "G-Star Raw",
    "Peacocks",
    "Joseph",
    "Boohoo",
    "Jaeger",
    "Brave Soul",
    "Debenhams",
    "Benetton",
    "AllSaints",
    "Tommy Hilfiger",
    "Whistles",
    "QED London",
    "Dickies",
    "Stone Island",
    "Kaffe",
    "Masai",
    "Cambio",
    "Nordstrom",
    "Quechua",
    "NA-KD",
    "Wilfred",
    "Navyboot",
  ],

  CATEGORY_FIELDS: {
    sweater: ["по груди", "по низу", "рукав", "довжина"],
    pants: [
      "по пояс",
      "по стегна",
      "посадка",
      "довжина",
      "ширина стегна",
      "ширина внизу",
    ],
    skirt: ["по пояс", "по стегна", "довжина"],
    tshirt: ["по груди", "по низу", "довжина"],
    outerwear: ["плечі", "по груди", "по низу", "рукав", "довжина"],
    dress: ["по груди", "по талії", "по стегна", "рукав", "довжина"],
  },

  // Категорії з одним полем для вводу у вільній формі (в опис іде лише введений текст)
  FREEFORM_CATEGORIES: {
    accessories: {
      label: "Деталі",
      placeholder: "Розміри, довжина, особливості...",
    },
  },

  NUMERIC_FIELDS: [
    "по груди",
    "по низу",
    "рукав",
    "довжина",
    "по пояс",
    "по стегна",
    "посадка",
    "ширина стегна",
    "ширина внизу",
    "плечі",
    "по талії",
  ],

  CATEGORIES_WITH_NECK_CHECKBOX: ["sweater", "outerwear", "dress"],

  SPLASH_DELAYS: { fadeOut: 1100, remove: 420, fallback: 6000 },
};

/* ==================== APPLICATION STATE ==================== */
const state = {
  activeCategory: null,
  savedDescriptions: [],
  brandSuggestions: {
    current: [],
    selectedIndex: -1,
  },
};

/* ==================== UTILITIES ==================== */
const $ = (sel) => document.querySelector(sel);
const $all = (sel) => Array.from(document.querySelectorAll(sel));

const autosize = (el) => {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = Math.max(160, el.scrollHeight) + "px";
};

const fallbackCopy = (text) => {
  const ta = document.createElement("textarea");
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
  } catch (e) {}
  ta.remove();
};

const copyToClipboard = (text) => {
  if (!text) return;
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
};

/* Тимчасово показує галочку замість іконки кнопки */
const flashIconDone = (btn) => {
  if (btn._orig === undefined) btn._orig = btn.innerHTML;
  btn.innerHTML = CONFIG.CHECK_SVG;
  btn.classList.add("done");
  clearTimeout(btn._timer);
  btn._timer = setTimeout(() => {
    btn.innerHTML = btn._orig;
    btn.classList.remove("done");
  }, CONFIG.FEEDBACK_MS);
};

/* Тимчасово змінює текст кнопки */
const flashText = (btn, text) => {
  if (btn._orig === undefined) btn._orig = btn.textContent;
  btn.textContent = text;
  clearTimeout(btn._timer);
  btn._timer = setTimeout(() => {
    btn.textContent = btn._orig;
  }, CONFIG.FEEDBACK_MS);
};

/* ==================== THEME ==================== */
const theme = {
  current() {
    return document.documentElement.getAttribute("data-theme") === "dark"
      ? "dark"
      : "light";
  },

  apply(mode) {
    document.documentElement.setAttribute("data-theme", mode);
    $("#themeColor")?.setAttribute(
      "content",
      mode === "dark" ? "#121214" : "#f2f2f6"
    );
  },

  init() {
    let mode = null;
    try {
      mode = localStorage.getItem(CONFIG.THEME_KEY);
    } catch (e) {}
    if (mode !== "dark" && mode !== "light") {
      mode = window.matchMedia?.("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    this.apply(mode);

    $("#themeToggle").addEventListener("click", () => {
      const next = this.current() === "dark" ? "light" : "dark";
      this.apply(next);
      try {
        localStorage.setItem(CONFIG.THEME_KEY, next);
      } catch (e) {}
    });
  },
};

/* ==================== STORAGE MANAGEMENT ==================== */
const storage = {
  migrate() {
    try {
      if (localStorage.getItem(CONFIG.STORAGE_KEY) !== null) return;
      for (const key of CONFIG.OLD_STORAGE_KEYS) {
        const old = localStorage.getItem(key);
        if (old) {
          localStorage.setItem(CONFIG.STORAGE_KEY, old);
          return;
        }
      }
    } catch (e) {}
  },

  load() {
    try {
      return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || "[]") || [];
    } catch (e) {
      return [];
    }
  },

  save(data) {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
  },
};

/* ==================== BRAND AUTOCOMPLETE ==================== */
const brandAutocomplete = {
  filter(value) {
    const v = value.trim().toLowerCase();
    if (!v) return [];

    const matches = CONFIG.BRANDS.filter((b) => b.toLowerCase().includes(v));
    return matches.sort((a, b) => {
      const av = a.toLowerCase(),
        bv = b.toLowerCase();
      const startsA = av.startsWith(v),
        startsB = bv.startsWith(v);
      if (startsA && !startsB) return -1;
      if (!startsA && startsB) return 1;
      return a.localeCompare(b);
    });
  },

  render() {
    const container = $("#brandSuggestions");
    container.innerHTML = "";

    if (!state.brandSuggestions.current.length) {
      container.style.display = "none";
      return;
    }

    state.brandSuggestions.current.forEach((brand, i) => {
      const div = document.createElement("div");
      div.className = "suggestion";
      div.textContent = brand;
      if (i === state.brandSuggestions.selectedIndex)
        div.classList.add("active");

      div.addEventListener("mousedown", () => {
        $("#brand").value = brand;
        container.style.display = "none";
        state.brandSuggestions.selectedIndex = -1;
      });

      container.appendChild(div);
    });

    container.style.display = "block";
  },

  navigate(direction) {
    const max = state.brandSuggestions.current.length - 1;
    if (direction === "down") {
      state.brandSuggestions.selectedIndex = Math.min(
        state.brandSuggestions.selectedIndex + 1,
        max
      );
    } else if (direction === "up") {
      state.brandSuggestions.selectedIndex = Math.max(
        state.brandSuggestions.selectedIndex - 1,
        0
      );
    }
    this.render();
  },

  select() {
    const idx = state.brandSuggestions.selectedIndex;
    if (idx >= 0 && state.brandSuggestions.current[idx]) {
      $("#brand").value = state.brandSuggestions.current[idx];
      $("#brandSuggestions").style.display = "none";
      state.brandSuggestions.selectedIndex = -1;
    }
  },
};

/* ==================== CATEGORY MANAGEMENT ==================== */
const categoryManager = {
  setActive(category) {
    state.activeCategory = category;
    $all(".category-pill").forEach((p) => p.classList.remove("active"));
    $(`.category-pill[data-cat="${category}"]`)?.classList.add("active");
    this.renderFields();
  },

  renderFields() {
    const container = $("#categoryFields");
    container.innerHTML = "";

    // Категорія з одним вільним полем (Аксесуари)
    const freeform = CONFIG.FREEFORM_CATEGORIES[state.activeCategory];
    if (freeform) {
      const row = document.createElement("div");
      row.className = "cat-row";

      const label = document.createElement("label");
      label.textContent = freeform.label;

      const input = document.createElement("input");
      input.type = "text";
      input.dataset.field = "freeform";
      input.placeholder = freeform.placeholder;

      row.appendChild(label);
      row.appendChild(input);
      container.appendChild(row);
      return;
    }

    if (!state.activeCategory || !CONFIG.CATEGORY_FIELDS[state.activeCategory])
      return;

    CONFIG.CATEGORY_FIELDS[state.activeCategory].forEach((field) => {
      const row = document.createElement("div");
      row.className = "cat-row";

      const label = document.createElement("label");
      label.textContent = field;

      // Спеціальний випадок: штани + довжина = два поля
      if (state.activeCategory === "pants" && field === "довжина") {
        const wrap = document.createElement("div");
        wrap.style.display = "flex";
        wrap.style.alignItems = "center";
        wrap.style.gap = "6px";
        wrap.style.flex = "1";
        wrap.style.minWidth = "0";

        const input1 = document.createElement("input");
        input1.type = "number";
        input1.inputMode = "numeric";
        input1.pattern = "[0-9]*";
        input1.dataset.field = "довжина1";
        input1.placeholder = "внутр.";
        input1.style.flex = "1";
        input1.style.minWidth = "0";

        const slash = document.createElement("span");
        slash.textContent = "/";
        slash.style.fontWeight = "700";
        slash.style.flexShrink = "0";

        const input2 = document.createElement("input");
        input2.type = "number";
        input2.inputMode = "numeric";
        input2.pattern = "[0-9]*";
        input2.dataset.field = "довжина2";
        input2.placeholder = "зовн.";
        input2.style.flex = "1";
        input2.style.minWidth = "0";

        wrap.appendChild(input1);
        wrap.appendChild(slash);
        wrap.appendChild(input2);
        row.appendChild(label);
        row.appendChild(wrap);
      } else {
        const input = document.createElement("input");
        input.dataset.field = field;

        if (CONFIG.NUMERIC_FIELDS.includes(field)) {
          input.type = "number";
          input.inputMode = "numeric";
          input.pattern = "[0-9]*";
        } else {
          input.type = "text";
        }

        row.appendChild(label);
        row.appendChild(input);
      }

      container.appendChild(row);
    });

    if (CONFIG.CATEGORIES_WITH_NECK_CHECKBOX.includes(state.activeCategory)) {
      this.addNeckCheckbox(container);
    }
  },

  addNeckCheckbox(container) {
    const row = document.createElement("div");
    row.className = "cat-row";

    const spacer = document.createElement("label");
    spacer.style.visibility = "hidden";

    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.innerHTML = `<label style="font-weight:600;font-size:14px;width:auto"><input id="fromNeck" type="checkbox"> Рукав від горловини</label>`;

    row.appendChild(spacer);
    row.appendChild(wrapper);
    container.appendChild(row);
  },
};

/* ==================== OUTPUT BUILDER ==================== */
const outputBuilder = {
  build() {
    const price = $("#price").value.trim();
    const brand = $("#brand").value.trim();
    const desc = $("#descInput").value.trim();
    const condition =
      (document.querySelector('input[name="state"]:checked') || {}).value || "";
    const defects = $("#defects").value.trim();
    const sizes = $all('.sizes input[type="checkbox"]:checked').map(
      (c) => c.value
    );

    let output = "";
    if (price) output += `💸Ціна ${price} грн\n`;
    if (brand) output += `${brand}\n`;
    if (desc) output += `${desc}\n`;
    if (condition) {
      output += defects ? `${condition}, ${defects}\n` : `${condition}\n`;
    }
    output += "‑‑‑‑‑‑‑\n";
    if (sizes.length) output += `розмір ${sizes.join("/")} \n`;

    if (state.activeCategory) {
      const fieldValues = {};

      $all("#categoryFields input[data-field]").forEach((inp) => {
        const field = inp.dataset.field;
        const val = inp.value.trim();
        if (val) fieldValues[field] = val;
      });

      if (CONFIG.FREEFORM_CATEGORIES[state.activeCategory]) {
        // Аксесуари: виводимо лише те, що ввів користувач
        if (fieldValues["freeform"]) output += `${fieldValues["freeform"]}\n`;
      } else {
        if (state.activeCategory === "pants") {
          const len1 = fieldValues["довжина1"];
          const len2 = fieldValues["довжина2"];
          if (len1 || len2) {
            fieldValues["довжина"] = `${len1 || ""}/${len2 || ""}`;
          }
          delete fieldValues["довжина1"];
          delete fieldValues["довжина2"];
        }

        CONFIG.CATEGORY_FIELDS[state.activeCategory].forEach((field) => {
          const val = fieldValues[field];
          if (val) output += `${field} ${val}\n`;
        });

        const fromNeck = $("#fromNeck");
        if (fromNeck?.checked) {
          output = output.replace(/(рукав\s+)/, "рукав від горловини ");
        }
      }
    }

    output += "‑‑‑‑‑‑‑\n";

    const materials = $all(".materials input:checked").map((i) => i.value);
    const customMaterial = $("#materialCustom").value.trim();
    if (customMaterial) materials.push(customMaterial);
    if (materials.length) output += materials.join("/") + "\n";

    return output.trim();
  },
};

/* ==================== SAVED DESCRIPTIONS MANAGER ==================== */
const savedManager = {
  add(text) {
    const title = $("#descInput").value.trim() || "Без назви";
    const id =
      Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
    state.savedDescriptions.unshift({ id, title, text, copied: false });
    storage.save(state.savedDescriptions);
    this.render();
  },

  remove(index) {
    if (!confirm("Видалити цей збережений опис?")) return;
    state.savedDescriptions.splice(index, 1);
    storage.save(state.savedDescriptions);
    this.render();
  },

  clearAll() {
    if (!confirm("Видалити всі збережені описи?")) return;
    state.savedDescriptions = [];
    storage.save(state.savedDescriptions);
    this.render();
  },

  /* Позначає опис скопійованим: міняє колір плашки без повного перемальовування списку */
  markCopied(index, header) {
    const item = state.savedDescriptions[index];
    if (!item) return;
    item.copied = true;
    storage.save(state.savedDescriptions);
    header.classList.add("copied");
  },

  copyWithoutPrice(text) {
    const lines = text.split(/\r?\n/);
    const startIdx = lines.length && /ціна|💸/i.test(lines[0]) ? 1 : 0;
    return lines.slice(startIdx).join("\n");
  },

  createIconButton(title, html, onClick) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "icon-btn";
    btn.title = title;
    btn.innerHTML = html;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      onClick(btn);
    });
    return btn;
  },

  render() {
    const container = $("#savedList");
    container.innerHTML = "";

    state.savedDescriptions.forEach((item, idx) => {
      const wrapper = document.createElement("div");
      wrapper.className = "saved-item";

      const header = document.createElement("div");
      header.className = "saved-header" + (item.copied ? " copied" : "");

      const title = document.createElement("div");
      title.textContent = `${idx + 1}. ${item.title}`;

      const actions = document.createElement("div");
      actions.className = "saved-actions";

      // Копіювати весь опис
      const copyAllBtn = this.createIconButton(
        "Копіювати весь опис",
        CONFIG.COPY_SVG,
        (btn) => {
          copyToClipboard(item.text);
          this.markCopied(idx, header);
          flashIconDone(btn);
        }
      );

      // Копіювати без ціни
      const copyNoPriceBtn = this.createIconButton(
        "Копіювати без ціни",
        `<img src="${CONFIG.COPY_NOPRICE_ICON}" alt="cp">`,
        (btn) => {
          copyToClipboard(this.copyWithoutPrice(item.text));
          this.markCopied(idx, header);
          flashIconDone(btn);
        }
      );

      // Видалити
      const delBtn = this.createIconButton("Видалити", CONFIG.DELETE_SVG, () =>
        this.remove(idx)
      );

      actions.appendChild(copyAllBtn);
      actions.appendChild(copyNoPriceBtn);
      actions.appendChild(delBtn);

      header.appendChild(title);
      header.appendChild(actions);

      const body = document.createElement("div");
      body.className = "saved-body";
      body.textContent = item.text;

      header.addEventListener("click", (e) => {
        if (!e.target.closest(".icon-btn")) {
          body.style.display =
            body.style.display === "block" ? "none" : "block";
        }
      });

      wrapper.appendChild(header);
      wrapper.appendChild(body);
      container.appendChild(wrapper);
    });
  },
};

/* ==================== FORM MANAGEMENT ==================== */
const formManager = {
  clear() {
    if (!confirm("Очистити всі поля форми?")) return;
    $all('input[type="text"], input[type="number"], textarea').forEach(
      (i) => (i.value = "")
    );
    $all('input[type="checkbox"], input[type="radio"]').forEach(
      (i) => (i.checked = false)
    );
    $("#categoryFields").innerHTML = "";
    $("#output").value = "";
    autosize($("#output"));
    $all(".category-pill").forEach((p) => p.classList.remove("active"));
    state.activeCategory = null;
    $("#brandSuggestions").style.display = "none";
    ui.syncPriceChips();
  },
};

/* ==================== UI INITIALIZATION ==================== */
const ui = {
  initSplash() {
    window.addEventListener("load", () => {
      const splash = $("#splash");
      setTimeout(() => {
        if (splash) splash.style.opacity = "0";
        setTimeout(() => {
          splash?.parentNode?.removeChild(splash);
          $("#app").classList.remove("hidden");
        }, CONFIG.SPLASH_DELAYS.remove);
      }, CONFIG.SPLASH_DELAYS.fadeOut);
    });

    setTimeout(() => {
      const s = $("#splash");
      if (s?.parentNode) {
        s.parentNode.removeChild(s);
        $("#app").classList.remove("hidden");
      }
    }, CONFIG.SPLASH_DELAYS.fallback);
  },

  initBrandInput() {
    const input = $("#brand");
    const suggestions = $("#brandSuggestions");

    input.addEventListener("input", (e) => {
      const value = e.target.value;
      state.brandSuggestions.current = brandAutocomplete.filter(value);
      state.brandSuggestions.selectedIndex = -1;
      brandAutocomplete.render();
    });

    input.addEventListener("keydown", (e) => {
      if (suggestions.style.display === "none") return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        brandAutocomplete.navigate("down");
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        brandAutocomplete.navigate("up");
      } else if (e.key === "Enter") {
        e.preventDefault();
        brandAutocomplete.select();
      } else if (e.key === "Escape") {
        suggestions.style.display = "none";
        state.brandSuggestions.selectedIndex = -1;
      }
    });

    input.addEventListener("blur", () => {
      setTimeout(() => (suggestions.style.display = "none"), 140);
    });
  },

  initCategoryPills() {
    $("#categoryGroup").addEventListener("click", (e) => {
      const pill = e.target.closest(".category-pill");
      if (pill) categoryManager.setActive(pill.dataset.cat);
    });
  },

  /* Швидкий вибір ціни */
  initPriceChips() {
    const input = $("#price");

    $("#priceChips").addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      input.value = chip.dataset.price;
      this.syncPriceChips();
    });

    input.addEventListener("input", () => this.syncPriceChips());
  },

  syncPriceChips() {
    const value = $("#price").value.trim();
    $all("#priceChips .chip").forEach((chip) => {
      chip.classList.toggle("active", chip.dataset.price === value);
    });
  },

  initButtons() {
    $("#btnGenerate").addEventListener("click", () => {
      const output = $("#output");
      output.value = outputBuilder.build();
      autosize(output);
    });

    $("#btnCopy").addEventListener("click", (e) => {
      const output = $("#output");
      if (!output.value) return;
      copyToClipboard(output.value);
      flashText(e.currentTarget, "✓ Скопійовано");
    });

    $("#btnSave").addEventListener("click", () => {
      const text = $("#output").value.trim();
      if (!text) {
        alert("Немає тексту для збереження.");
        return;
      }
      savedManager.add(text);
      formManager.clear();
    });

    $("#btnClearAll").addEventListener("click", () => savedManager.clearAll());
    $("#fabClear").addEventListener("click", () => formManager.clear());
  },

  initOutput() {
    const output = $("#output");
    output.addEventListener("input", () => autosize(output));
    autosize(output);
  },

  preventEnterSubmit() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target.tagName.toLowerCase() !== "textarea") {
        e.preventDefault();
      }
    });
  },
};

/* ==================== APPLICATION INITIALIZATION ==================== */
function init() {
  theme.init();
  storage.migrate();
  state.savedDescriptions = storage.load();

  ui.initSplash();
  ui.initBrandInput();
  ui.initCategoryPills();
  ui.initPriceChips();
  ui.initButtons();
  ui.initOutput();
  ui.preventEnterSubmit();

  savedManager.render();
}

init();
