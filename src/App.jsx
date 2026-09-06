import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Users, Shuffle, BarChart3, Star, Plus, Trash2, Copy, RotateCcw,
  Hand, Check, X, Link2, Ban, TrendingUp, TrendingDown, UserPlus,
  ClipboardPaste, Pin, ChevronDown, ChevronUp, Crown, AlertTriangle, ArrowDown, ArrowUp,
  Search, ArrowDownAZ, ArrowUpAZ,
} from "lucide-react";

/* ---------------------------------- meta ---------------------------------- */
const TEAMS = [
  { key: "A", name: "Drużyna 1", nick: "Czarni", color: "#1a1a1a", text: "#ffffff", label: "#1a1a1a", soft: "#e5e5e5", ring: "#3f3f46" },
  { key: "B", name: "Drużyna 2", nick: "Biali", color: "#ffffff", text: "#1a1a1a", label: "#64748b", soft: "#f8fafc", ring: "#cbd5e1" },
];
const PITCH = "#171717";
const GOLD = "#f59e0b";
const LOGO = "data:image/jpeg;base64,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";
const STORAGE_KEY = "kapitan:data:v1";
const CATS = [
  { k: "shots", label: "Strzały" },
  { k: "passes", label: "Podania" },
  { k: "running", label: "Bieganie" },
  { k: "defense", label: "Obrona" },
];

/* -------------------------------- helpers --------------------------------- */
const uid = () => Math.random().toString(36).slice(2, 9);
const overall = (p) => (p ? CATS.reduce((s, c) => s + (p[c.k] || 0), 0) : 0);
const avg = (p) => (p ? `${overall(p)}/20` : "0/20");
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

function computeStats(players, matches) {
  const stats = {};
  const seq = {};
  players.forEach((p) => {
    stats[p.id] = { played: 0, wins: 0, losses: 0, draws: 0, winRate: 0, streak: 0 };
    seq[p.id] = [];
  });
  matches.forEach((m) => {
    const proc = (ids, team) =>
      ids.forEach((id) => {
        if (!stats[id]) return;
        stats[id].played++;
        let r;
        if (m.winner === "draw") { stats[id].draws++; r = "D"; }
        else if (m.winner === team) { stats[id].wins++; r = "W"; }
        else { stats[id].losses++; r = "L"; }
        seq[id].push(r);
      });
    proc(m.teamA, "A");
    proc(m.teamB, "B");
  });
  players.forEach((p) => {
    const s = seq[p.id];
    let streak = 0;
    if (s.length) {
      const last = s[s.length - 1];
      if (last !== "D") {
        for (let i = s.length - 1; i >= 0; i--) {
          if (s[i] === last) streak++;
          else break;
        }
        if (last === "L") streak = -streak;
      }
    }
    stats[p.id].streak = streak;
    stats[p.id].winRate = stats[p.id].played
      ? Math.round((stats[p.id].wins / stats[p.id].played) * 100)
      : 0;
  });
  return stats;
}

// Balanced-with-randomness draw honouring link/block pairs + goalkeeper spread.
function drawTeams(present, pairs, mode = "balanced") {
  const byId = {};
  present.forEach((p) => (byId[p.id] = p));
  const ids = present.map((p) => p.id);
  if (ids.length < 2) return { error: "Potrzeba przynajmniej 2 obecnych graczy." };

  // union-find for "zawsze razem"
  const parent = {};
  ids.forEach((i) => (parent[i] = i));
  const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
  const union = (a, b) => { parent[find(a)] = find(b); };
  pairs.filter((p) => p.type === "link" && byId[p.a] && byId[p.b]).forEach((p) => union(p.a, p.b));

  const groups = {};
  ids.forEach((i) => { const r = find(i); (groups[r] = groups[r] || []).push(i); });
  const clusters = Object.values(groups).map((members) => ({
    members,
    size: members.length,
    rating: members.reduce((s, id) => s + (mode === "random" ? 0 : overall(byId[id])), 0),
    gk: members.filter((id) => byId[id].isGK).length,
  }));
  const memberCluster = {};
  clusters.forEach((c, ci) => c.members.forEach((id) => (memberCluster[id] = ci)));

  // "nie razem"
  const conflicts = [];
  let impossible = null;
  pairs.filter((p) => p.type === "block" && byId[p.a] && byId[p.b]).forEach((p) => {
    const ca = memberCluster[p.a], cb = memberCluster[p.b];
    if (ca === cb)
      impossible = `${byId[p.a].name} i ${byId[p.b].name} nie mogą być razem, ale inne pary łączą ich w jedną drużynę. Poluzuj zasady.`;
    else conflicts.push([ca, cb]);
  });
  if (impossible) return { error: impossible };

  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0;[a[i], a[j]] = [a[j], a[i]]; } return a; };
  const solutions = [];

  for (let attempt = 0; attempt < 500; attempt++) {
    const order = shuffle([...clusters.keys()]);
    order.sort((a, b) => clusters[b].rating - clusters[a].rating + (Math.random() - 0.5) * 5);
    const assign = {};
    const tR = [0, 0], tS = [0, 0], tG = [0, 0];
    let ok = true;
    for (const ci of order) {
      const forbidden = new Set();
      for (const [x, y] of conflicts) {
        if (x === ci && assign[y] !== undefined) forbidden.add(assign[y]);
        if (y === ci && assign[x] !== undefined) forbidden.add(assign[x]);
      }
      const cand = [0, 1].filter((t) => !forbidden.has(t));
      if (!cand.length) { ok = false; break; }
      cand.sort((a, b) => (tR[a] - tR[b]) || (tS[a] - tS[b]) || (Math.random() - 0.5));
      const t = cand[0];
      assign[ci] = t; tR[t] += clusters[ci].rating; tS[t] += clusters[ci].size; tG[t] += clusters[ci].gk;
    }
    if (!ok) continue;
    const gkPenalty = tG[0] + tG[1] > 0 && (tG[0] === 0 || tG[1] === 0) ? 1 : 0;
    const score = Math.abs(tR[0] - tR[1]) + Math.abs(tS[0] - tS[1]) * 3 + gkPenalty * 3;
    const teamA = [], teamB = [];
    clusters.forEach((c, ci) => (assign[ci] === 0 ? teamA : teamB).push(...c.members));
    solutions.push({ score, teamA, teamB });
  }
  if (!solutions.length) return { error: "Nie da się ułożyć drużyn przy tych blokadach. Usuń część zasad." };

  const minS = Math.min(...solutions.map((s) => s.score));
  const pool = solutions.filter((s) => s.score <= minS + 2); // keep variety
  const pick = pool[(Math.random() * pool.length) | 0];
  return { teamA: pick.teamA, teamB: pick.teamB };
}

/* ------------------------------ small widgets ----------------------------- */
function Stars({ value, onChange, color = "#f59e0b" }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          onClick={() => onChange(i === value ? i - 1 : i)}
          className="p-0.5 active:scale-90 transition-transform"
          aria-label={`${i} gwiazdek`}
        >
          <Star size={20} strokeWidth={2} style={{ color }} fill={i <= value ? color : "transparent"} />
        </button>
      ))}
    </div>
  );
}

function Tab({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors"
      style={{ color: active ? PITCH : "#94a3b8" }}
    >
      <Icon size={22} strokeWidth={active ? 2.4 : 2} />
      <span className="text-xs font-semibold">{label}</span>
      <span className="h-1 w-8 rounded-full" style={{ background: active ? GOLD : "transparent" }} />
    </button>
  );
}

function ShareModal({ text, onClose }) {
  const [copied, setCopied] = useState(false);
  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true); setTimeout(() => setCopied(false), 1500);
    } catch {
      const ta = document.getElementById("share-ta");
      if (ta) { ta.focus(); ta.select(); try { document.execCommand("copy"); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {} }
    }
  };
  const openWA = () => { try { window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank"); } catch {} };
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: "rgba(15,23,42,.5)" }} onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center">
          <h3 className="font-bold text-slate-700">Udostępnij</h3>
          <button onClick={onClose} className="ml-auto p-1 text-slate-400"><X size={20} /></button>
        </div>
        <textarea id="share-ta" readOnly value={text} onFocus={(e) => e.target.select()} rows={9}
          className="w-full text-sm rounded-xl border px-3 py-2 resize-none" style={{ borderColor: "#dbe2e5", background: "#f8fafb" }} />
        <div className="grid grid-cols-2 gap-2">
          <button onClick={doCopy} className="flex items-center justify-center gap-2 text-sm font-bold py-3 rounded-xl border" style={{ borderColor: "#dbe2e5", color: PITCH }}>
            <Copy size={16} /> {copied ? "Skopiowano" : "Kopiuj"}
          </button>
          <button onClick={openWA} className="flex items-center justify-center gap-2 text-sm font-bold py-3 rounded-xl text-white" style={{ background: "#25D366" }}>
            WhatsApp
          </button>
        </div>
        <p className="text-xs text-slate-400 text-center">Jeśli „Kopiuj" nie zadziała, zaznacz tekst w polu i skopiuj ręcznie.</p>
      </div>
    </div>
  );
}

/* ---------------------------- share-link helpers --------------------------- */
const encodePayload = (obj) => {
  try { return btoa(encodeURIComponent(JSON.stringify(obj))); } catch { return ""; }
};
const decodePayload = (str) => {
  try { return JSON.parse(decodeURIComponent(atob(str))); } catch { return null; }
};
const readViewHash = () => {
  try {
    const h = window.location.hash || "";
    const i = h.indexOf("#v=");
    return i === 0 ? decodePayload(h.slice(3)) : null;
  } catch { return null; }
};

function ViewerScreen({ data }) {
  const [tab, setTab] = useState("table");
  return (
    <div className="min-h-screen w-full flex justify-center" style={{ background: "#f1f5f2", fontFamily: "system-ui, sans-serif" }}>
      <div className="w-full max-w-md flex flex-col min-h-screen">
        <header className="px-5 pt-5 pb-4 text-white" style={{ background: PITCH, borderBottom: `3px solid ${GOLD}` }}>
          <div className="flex items-center gap-3">
            <img src={LOGO} alt="Dokersi" className="h-11 w-11 rounded-lg object-cover" />
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none">Dokersi</h1>
              <p className="text-xs mt-0.5" style={{ color: GOLD }}>Podgląd wyników</p>
            </div>
          </div>
        </header>

        <div className="px-4 py-4 space-y-4 pb-10">
          <p className="text-xs text-slate-400 text-center">Stan na {data.t || "—"} · podgląd tylko do odczytu</p>

          {data.d && (data.d.A?.length || data.d.B?.length) ? (
            <section className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#e9eef0" }}>
              <div className="px-4 py-2.5 text-sm font-bold text-slate-700" style={{ background: "#f8fafb" }}>Ostatnie składy</div>
              <div className="grid grid-cols-2 divide-x" style={{ borderColor: "#f1f5f4" }}>
                {[["Czarni", data.d.A || []], ["Biali", data.d.B || []]].map(([nick, list]) => (
                  <div key={nick} className="p-3">
                    <p className="text-xs font-black text-slate-500 mb-1">{nick}</p>
                    {list.map((n, i) => <p key={i} className="text-sm text-slate-700">{n}</p>)}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#e9eef0" }}>
            <div className="flex" style={{ background: "#f8fafb" }}>
              {[["table", "Bilans graczy"], ["hist", "Mecze"]].map(([k, l]) => (
                <button key={k} onClick={() => setTab(k)} className="flex-1 py-2.5 text-xs font-bold"
                  style={{ color: tab === k ? PITCH : "#94a3b8", borderBottom: tab === k ? `2px solid ${GOLD}` : "2px solid transparent" }}>
                  {l}
                </button>
              ))}
            </div>
            {tab === "table" ? (
              <>
                <div className="grid grid-cols-12 gap-1 px-4 py-2 text-[11px] font-bold text-slate-400 uppercase">
                  <span className="col-span-5">Gracz</span>
                  <span className="col-span-2 text-center">Mecze</span>
                  <span className="col-span-3 text-center">W-R-P</span>
                  <span className="col-span-2 text-center">%</span>
                </div>
                <div className="divide-y" style={{ borderColor: "#f1f5f4" }}>
                  {(data.p || []).map((r, i) => {
                    const [name, played, w, d, l, pct] = r;
                    return (
                      <div key={i} className="grid grid-cols-12 gap-1 px-4 py-2.5 items-center text-sm">
                        <span className="col-span-5 truncate font-medium text-slate-800">{name}</span>
                        <span className="col-span-2 text-center text-slate-500">{played}</span>
                        <span className="col-span-3 text-center text-slate-500 text-xs">{w}-{d}-{l}</span>
                        <span className="col-span-2 text-center font-bold" style={{ color: pct >= 50 ? "#059669" : "#94a3b8" }}>{pct}%</span>
                      </div>
                    );
                  })}
                  {!(data.p || []).length && <p className="text-center text-sm text-slate-400 py-8">Brak danych.</p>}
                </div>
              </>
            ) : (
              <div className="p-3 space-y-1.5">
                {(data.m || []).map((r, i) => {
                  const [date, winner, a, b] = r;
                  const label = winner === "draw" ? "Remis" : winner === "A" ? "Czarni ↑" : "Biali ↑";
                  return (
                    <div key={i} className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg" style={{ background: "#f8fafb" }}>
                      <span className="text-xs text-slate-400">{date}</span>
                      <span className="text-xs text-slate-400">{a}v{b}</span>
                      <span className="ml-auto font-bold text-xs text-slate-600">{label}</span>
                    </div>
                  );
                })}
                {!(data.m || []).length && <p className="text-center text-sm text-slate-400 py-8">Brak meczów.</p>}
              </div>
            )}
          </section>

          <button
            onClick={() => { try { window.location.hash = ""; window.location.reload(); } catch {} }}
            className="w-full text-sm font-bold py-3 rounded-xl border bg-white" style={{ borderColor: "#dbe2e5", color: PITCH }}
          >
            Otwórz pełną aplikację
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- app ----------------------------------- */
export default function App() {
  const [viewData] = useState(() => readViewHash());
  const [players, setPlayers] = useState([]);
  const [pairs, setPairs] = useState([]);
  const [matches, setMatches] = useState([]);
  const [settings, setSettings] = useState({ streakThreshold: 5, autoRate: true });
  const [dismissed, setDismissed] = useState({}); // playerId -> streak value dismissed
  const [lastDraw, setLastDraw] = useState(null); // {teamA, teamB, saved}
  const [tab, setTab] = useState("players");
  const [toast, setToast] = useState("");
  const [shareText, setShareText] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const loaded = useRef(false);

  /* load */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        setPlayers(d.players || []);
        setPairs(d.pairs || []);
        setMatches(d.matches || []);
        setSettings({ streakThreshold: 5, autoRate: true, ...(d.settings || {}) });
        setDismissed(d.dismissed || {});
        setLastDraw(d.lastDraw || null);
      }
    } catch (e) { /* first run or storage unavailable */ }
    loaded.current = true;
  }, []);

  /* save */
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ players, pairs, matches, settings, dismissed, lastDraw })
      );
    } catch (e) { /* ignore */ }
  }, [players, pairs, matches, settings, dismissed, lastDraw]);

  const flash = (m) => { setToast(m); setTimeout(() => setToast(""), 2200); };
  const share = (t) => setShareText(t);
  const exportData = () => JSON.stringify({ _app: "kapitan", _v: 1, players, pairs, matches, settings, dismissed, lastDraw }, null, 2);
  const importData = (raw) => {
    try {
      const d = JSON.parse(raw);
      if (!d || !Array.isArray(d.players)) return false;
      setPlayers(d.players || []);
      setPairs(d.pairs || []);
      setMatches(d.matches || []);
      setSettings({ streakThreshold: 5, autoRate: true, ...(d.settings || {}) });
      setDismissed(d.dismissed || {});
      setLastDraw(d.lastDraw || null);
      return true;
    } catch { return false; }
  };

  const dataBlob = () => JSON.stringify({ players, pairs, matches, settings, dismissed, lastDraw, _kapitan: 1 });
  const exportAllText = () => share(dataBlob());
  const downloadAll = () => {
    try {
      const blob = new Blob([dataBlob()], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "kapitan-dane.json";
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      flash("Pobrano plik z danymi");
    } catch { flash("Nie udało się pobrać pliku"); }
  };
  const importAll = (text) => {
    try {
      const d = JSON.parse(text);
      if (!d || typeof d !== "object") throw new Error("bad");
      setPlayers(Array.isArray(d.players) ? d.players : []);
      setPairs(Array.isArray(d.pairs) ? d.pairs : []);
      setMatches(Array.isArray(d.matches) ? d.matches : []);
      setSettings({ streakThreshold: 5, autoRate: true, ...(d.settings || {}) });
      setDismissed(d.dismissed || {});
      setLastDraw(d.lastDraw || null);
      setImportOpen(false);
      flash("Dane wczytane");
    } catch { flash("Niepoprawne dane — sprawdź, czy wkleiłeś cały kod"); }
  };

  const stats = useMemo(() => computeStats(players, matches), [players, matches]);
  const present = players.filter((p) => p.present);
  const byId = useMemo(() => Object.fromEntries(players.map((p) => [p.id, p])), [players]);

  /* player mutations */
  const patch = (id, upd) => setPlayers((ps) => ps.map((p) => (p.id === id ? { ...p, ...upd } : p)));
  const remove = (id) => {
    setPlayers((ps) => ps.filter((p) => p.id !== id));
    setPairs((xs) => xs.filter((x) => x.a !== id && x.b !== id));
  };

  if (viewData) return <ViewerScreen data={viewData} />;

  const addFromText = (text, asGuest) => {
    const names = text
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!names.length) return 0;
    const existing = new Set(players.map((p) => p.name.toLowerCase()));
    const fresh = [];
    names.forEach((name) => {
      if (existing.has(name.toLowerCase())) return;
      existing.add(name.toLowerCase());
      fresh.push({ id: uid(), name, shots: 3, passes: 3, running: 3, defense: 3, isGK: false, present: true, isGuest: !!asGuest });
    });
    if (fresh.length) setPlayers((ps) => [...ps, ...fresh]);
    return fresh.length;
  };

  return (
    <div className="min-h-screen w-full flex justify-center" style={{ background: "#f1f5f2", fontFamily: "system-ui, sans-serif" }}>
      <div className="w-full max-w-md flex flex-col min-h-screen relative">
        {/* header */}
        <header
          className="px-5 pt-5 pb-4 text-white sticky top-0 z-20"
          style={{ background: PITCH, borderBottom: `3px solid ${GOLD}` }}
        >
          <div className="flex items-center gap-3">
            <img src={LOGO} alt="Dokersi" className="h-11 w-11 rounded-lg object-cover" />
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none">Dokersi</h1>
              <p className="text-xs mt-0.5" style={{ color: GOLD }}>Losowanie drużyn</p>
            </div>
            <div className="ml-auto text-right">
              <div className="text-2xl font-black leading-none">{present.length}</div>
              <div className="text-[10px] uppercase tracking-wide" style={{ color: GOLD }}>obecni</div>
            </div>
          </div>
        </header>

        {/* content */}
        <main className="flex-1 px-4 py-4 pb-28 space-y-4">
          {tab === "players" && (
            <PlayersTab
              players={players} pairs={pairs} byId={byId} stats={stats}
              patch={patch} remove={remove} addFromText={addFromText}
              setPlayers={setPlayers} setPairs={setPairs} flash={flash} share={share}
            />
          )}
          {tab === "draw" && (
            <DrawTab
              present={present} players={players} pairs={pairs} byId={byId} lastDraw={lastDraw}
              setLastDraw={setLastDraw} setMatches={setMatches} setPairs={setPairs} setPlayers={setPlayers} flash={flash} share={share}
              settings={settings}
            />
          )}
          {tab === "stats" && (
            <StatsTab
              players={players} matches={matches} stats={stats} byId={byId}
              settings={settings} setSettings={setSettings}
              dismissed={dismissed} setDismissed={setDismissed}
              patch={patch} setMatches={setMatches} flash={flash} share={share}
              exportData={exportData} importData={importData}
            />
          )}
        </main>

        {/* toast */}
        {toast && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 px-4 py-2.5 rounded-full text-white text-sm font-semibold shadow-lg"
            style={{ background: "#0f172a" }}>
            {toast}
          </div>
        )}

        {shareText !== null && <ShareModal text={shareText} onClose={() => setShareText(null)} />}

        {/* bottom nav */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t flex z-30" style={{ borderColor: "#e2e8f0" }}>
          <Tab active={tab === "players"} onClick={() => setTab("players")} icon={Users} label="Gracze" />
          <Tab active={tab === "draw"} onClick={() => setTab("draw")} icon={Shuffle} label="Losowanie" />
          <Tab active={tab === "stats"} onClick={() => setTab("stats")} icon={BarChart3} label="Statystyki" />
        </nav>
      </div>
    </div>
  );
}

/* ------------------------------- PLAYERS TAB ------------------------------ */
function PlayersTab({ players, pairs, byId, stats, patch, remove, addFromText, setPlayers, setPairs, flash, share }) {
  const [paste, setPaste] = useState("");
  const [asGuest, setAsGuest] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sortDir, setSortDir] = useState("az");

  const q = query.trim().toLowerCase();
  const visible = players
    .filter((p) => !q || p.name.toLowerCase().includes(q))
    .sort((a, b) => (sortDir === "az" ? 1 : -1) * a.name.localeCompare(b.name, "pl", { sensitivity: "base" }));

  const doAdd = () => {
    const n = addFromText(paste, asGuest);
    if (n > 0) { flash(`Dodano ${n} ${n === 1 ? "gracza" : "graczy"}`); setPaste(""); }
    else flash("Brak nowych imion (lub już są na liście)");
  };
  const setAll = (v) => setPlayers((ps) => ps.map((p) => ({ ...p, present: v })));

  const exportList = () => {
    if (!players.length) { flash("Brak graczy do eksportu"); return; }
    const lines = players.map((p, i) => `${i + 1}. ${p.name}${p.isGK ? " (BR)" : ""}${p.isGuest ? " (gość)" : ""}`);
    share(`👥 Lista graczy (${players.length})\n${lines.join("\n")}`);
  };

  return (
    <>
      {/* add box */}
      <section className="bg-white rounded-2xl p-4 shadow-sm border" style={{ borderColor: "#e9eef0" }}>
        <div className="flex items-center gap-2 mb-2 text-slate-700">
          <ClipboardPaste size={18} />
          <h2 className="font-bold text-sm">Dodaj graczy</h2>
        </div>
        <p className="text-xs text-slate-400 mb-2">Wklej imiona — po jednym w wierszu (możesz skopiować je z grupy na WhatsAppie).</p>
        <textarea
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          rows={3}
          placeholder={"Adam\nKuba\nMichał..."}
          className="w-full text-sm rounded-xl border px-3 py-2 outline-none resize-none focus:ring-2"
          style={{ borderColor: "#dbe2e5" }}
        />
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => setAsGuest((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border"
            style={{ borderColor: asGuest ? "#f59e0b" : "#dbe2e5", color: asGuest ? "#b45309" : "#64748b", background: asGuest ? "#fffbeb" : "white" }}
          >
            <UserPlus size={14} /> jako goście
          </button>
          <button
            onClick={doAdd}
            className="ml-auto flex items-center gap-1.5 text-white text-sm font-bold px-4 py-2 rounded-xl active:scale-95 transition"
            style={{ background: PITCH }}
          >
            <Plus size={16} /> Dodaj
          </button>
        </div>
      </section>

      {/* roster header */}
      {players.length > 0 && (
        <>
          <div className="flex items-center gap-2 px-1">
            <h2 className="font-bold text-sm text-slate-600">Lista ({players.length})</h2>
            <div className="ml-auto flex gap-1.5">
              <button onClick={() => setAll(true)} className="text-xs font-semibold px-2.5 py-1 rounded-lg border bg-white" style={{ borderColor: "#dbe2e5", color: PITCH }}>Wszyscy</button>
              <button onClick={() => setAll(false)} className="text-xs font-semibold px-2.5 py-1 rounded-lg border bg-white" style={{ borderColor: "#dbe2e5", color: "#94a3b8" }}>Nikt</button>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Szukaj zawodnika…"
                className="w-full text-sm rounded-xl border pl-9 pr-8 py-2.5 outline-none bg-white"
                style={{ borderColor: "#dbe2e5" }}
              />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-300"><X size={16} /></button>
              )}
            </div>
            <button
              onClick={() => setSortDir((d) => (d === "az" ? "za" : "az"))}
              className="shrink-0 flex items-center gap-1 text-xs font-bold px-3 rounded-xl border bg-white"
              style={{ borderColor: "#dbe2e5", color: PITCH }}
              title="Zmień kolejność"
            >
              {sortDir === "az" ? <ArrowDownAZ size={16} /> : <ArrowUpAZ size={16} />}
              {sortDir === "az" ? "A-Z" : "Z-A"}
            </button>
          </div>
        </>
      )}

      {/* roster */}
      <div className="space-y-2">
        {visible.map((p) => {
          const open = openId === p.id;
          return (
            <div key={p.id} className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: p.present ? "#c7e8d5" : "#eef1f2" }}>
              <div className="flex items-center gap-3 p-3">
                {/* attendance */}
                <button
                  onClick={() => patch(p.id, { present: !p.present })}
                  className="grid place-items-center h-8 w-8 rounded-full border-2 shrink-0 active:scale-90 transition"
                  style={{ borderColor: p.present ? "#10b981" : "#cbd5e1", background: p.present ? "#10b981" : "white" }}
                  aria-label="obecność"
                >
                  {p.present && <Check size={18} color="white" strokeWidth={3} />}
                </button>

                <button className="flex-1 min-w-0 text-left" onClick={() => setOpenId(open ? null : p.id)}>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-800 truncate">{p.name}</span>
                    {p.isGK && <Hand size={14} style={{ color: "#0891b2" }} title="Bramkarz" />}
                    {p.isGuest && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: "#fffbeb", color: "#b45309" }}>GOŚĆ</span>}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                    <Star size={11} fill="#f59e0b" style={{ color: "#f59e0b" }} />
                    <span>{avg(p)}</span>
                    {stats[p.id]?.played > 0 && <span className="ml-1">· {stats[p.id].winRate}% wygranych</span>}
                  </div>
                </button>

                <button onClick={() => setOpenId(open ? null : p.id)} className="p-1 text-slate-300">
                  {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>

              {open && (
                <div className="px-3 pb-3 pt-1 border-t" style={{ borderColor: "#f1f5f4", background: "#fafbfb" }}>
                  <div className="pt-2 pb-1">
                    <label className="text-xs text-slate-400">Imię / nazwisko</label>
                    <input
                      value={p.name}
                      onChange={(e) => patch(p.id, { name: e.target.value })}
                      className="w-full text-sm rounded-lg border px-3 py-2 mt-1 outline-none focus:ring-2"
                      style={{ borderColor: "#dbe2e5" }}
                    />
                  </div>
                  {CATS.map((c) => (
                    <div key={c.k} className="flex items-center justify-between py-1.5">
                      <span className="text-sm text-slate-500">{c.label}</span>
                      <Stars value={p[c.k]} onChange={(v) => patch(p.id, { [c.k]: v })} />
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2 mt-1 border-t" style={{ borderColor: "#eef1f2" }}>
                    <span className="text-sm font-bold text-slate-600">Razem</span>
                    <span className="text-sm font-black" style={{ color: GOLD }}>{overall(p)} / 20</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t" style={{ borderColor: "#eef1f2" }}>
                    <button
                      onClick={() => patch(p.id, { isGK: !p.isGK })}
                      className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border"
                      style={{ borderColor: p.isGK ? "#0891b2" : "#dbe2e5", color: p.isGK ? "#0e7490" : "#64748b", background: p.isGK ? "#ecfeff" : "white" }}
                    >
                      <Hand size={14} /> Bramkarz
                    </button>
                    {p.isGuest && (
                      <button
                        onClick={() => { patch(p.id, { isGuest: false }); flash(`${p.name} dołącza na stałe`); }}
                        className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border"
                        style={{ borderColor: "#dbe2e5", color: PITCH }}
                      >
                        <Pin size={14} /> Na stałe
                      </button>
                    )}
                    <button onClick={() => remove(p.id)} className="ml-auto p-2 rounded-lg text-red-400 active:bg-red-50">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {players.length === 0 && (
          <div className="text-center text-sm text-slate-400 py-10">
            Jeszcze nikogo nie ma.<br />Wklej listę imion powyżej, żeby zacząć.
          </div>
        )}
        {players.length > 0 && visible.length === 0 && (
          <div className="text-center text-sm text-slate-400 py-8">Nikogo nie znaleziono dla „{query}".</div>
        )}
      </div>

      {/* export */}
      {players.length > 0 && (
        <button onClick={exportList} className="w-full flex items-center justify-center gap-2 text-sm font-bold py-3 rounded-xl border bg-white" style={{ borderColor: "#dbe2e5", color: PITCH }}>
          <Copy size={16} /> Eksportuj listę na WhatsApp
        </button>
      )}

      {/* pair rules */}
      {players.length >= 2 && (
        <RulesSection open={rulesOpen} setOpen={setRulesOpen} players={players} byId={byId} pairs={pairs} setPairs={setPairs} flash={flash} />
      )}
    </>
  );
}

function RulesSection({ open, setOpen, players, byId, pairs, setPairs, flash }) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [type, setType] = useState("block");

  const add = () => {
    if (!a || !b || a === b) { flash("Wybierz dwie różne osoby"); return; }
    if (pairs.some((p) => ((p.a === a && p.b === b) || (p.a === b && p.b === a)) && p.type === type)) { flash("Taka zasada już istnieje"); return; }
    setPairs((xs) => [...xs, { id: uid(), a, b, type }]);
    setA(""); setB("");
    flash("Dodano zasadę");
  };

  return (
    <section className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#e9eef0" }}>
      <button className="w-full flex items-center gap-2 p-4" onClick={() => setOpen(!open)}>
        <Link2 size={18} className="text-slate-600" />
        <h2 className="font-bold text-sm text-slate-700">Zasady par</h2>
        {pairs.length > 0 && <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full" style={{ background: PITCH }}>{pairs.length}</span>}
        <span className="ml-auto text-slate-300">{open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          <div className="flex gap-1.5">
            <button onClick={() => setType("block")} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-lg border"
              style={{ borderColor: type === "block" ? "#ef4444" : "#dbe2e5", color: type === "block" ? "#dc2626" : "#94a3b8", background: type === "block" ? "#fef2f2" : "white" }}>
              <Ban size={14} /> Nie razem
            </button>
            <button onClick={() => setType("link")} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-lg border"
              style={{ borderColor: type === "link" ? "#059669" : "#dbe2e5", color: type === "link" ? "#047857" : "#94a3b8", background: type === "link" ? "#fffbeb" : "white" }}>
              <Link2 size={14} /> Zawsze razem
            </button>
          </div>
          <div className="flex items-center gap-2">
            <select value={a} onChange={(e) => setA(e.target.value)} className="flex-1 min-w-0 text-sm rounded-lg border px-2 py-2 bg-white" style={{ borderColor: "#dbe2e5" }}>
              <option value="">osoba…</option>
              {players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <span className="text-slate-300 text-xs">+</span>
            <select value={b} onChange={(e) => setB(e.target.value)} className="flex-1 min-w-0 text-sm rounded-lg border px-2 py-2 bg-white" style={{ borderColor: "#dbe2e5" }}>
              <option value="">osoba…</option>
              {players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button onClick={add} className="grid place-items-center h-9 w-9 rounded-lg text-white shrink-0" style={{ background: PITCH }}><Plus size={18} /></button>
          </div>

          <div className="space-y-1.5">
            {pairs.map((p) => (
              <div key={p.id} className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg" style={{ background: p.type === "block" ? "#fef2f2" : "#fffbeb" }}>
                {p.type === "block" ? <Ban size={14} className="text-red-500 shrink-0" /> : <Link2 size={14} className="text-emerald-600 shrink-0" />}
                <span className="truncate text-slate-700">{byId[p.a]?.name} {p.type === "block" ? "≠" : "="} {byId[p.b]?.name}</span>
                <button onClick={() => setPairs((xs) => xs.filter((x) => x.id !== p.id))} className="ml-auto text-slate-400 p-1"><X size={16} /></button>
              </div>
            ))}
            {pairs.length === 0 && <p className="text-xs text-slate-400 text-center py-1">Brak zasad — losowanie w pełni swobodne.</p>}
          </div>
        </div>
      )}
    </section>
  );
}

/* -------------------------------- DRAW TAB -------------------------------- */
function DrawTab({ present, players, pairs, byId, lastDraw, setLastDraw, setMatches, setPairs, setPlayers, flash, share, settings }) {
  const [error, setError] = useState("");
  const [mode, setMode] = useState("balanced");
  const [rulesOpen, setRulesOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [addTeam, setAddTeam] = useState(null);
  const [newName, setNewName] = useState("");
  const locked = !!(lastDraw && lastDraw.saved && !editing);

  const roll = () => {
    setError("");
    setEditing(false);
    const res = drawTeams(present, pairs, mode);
    if (res.error) { setError(res.error); setLastDraw(null); return; }
    setLastDraw({ teamA: res.teamA, teamB: res.teamB, saved: false });
  };

  const teamRating = (ids) => ids.reduce((s, id) => s + (byId[id] ? overall(byId[id]) : 0), 0);

  const movePlayer = (id) => {
    if (!lastDraw) return;
    const inA = lastDraw.teamA.includes(id);
    const teamA = inA ? lastDraw.teamA.filter((x) => x !== id) : [...lastDraw.teamA, id];
    const teamB = inA ? [...lastDraw.teamB, id] : lastDraw.teamB.filter((x) => x !== id);
    setLastDraw({ ...lastDraw, teamA, teamB });
    if (lastDraw.matchId) setMatches((ms) => ms.map((m) => (m.id === lastDraw.matchId ? { ...m, teamA, teamB } : m)));
  };

  const assignedSet = new Set(lastDraw ? [...lastDraw.teamA, ...lastDraw.teamB] : []);
  const unassigned = players.filter((p) => !assignedSet.has(p.id));

  const copy = () => {
    if (!lastDraw) return;
    const fmt = (t, ids) =>
      `${t.name} (${t.nick}):\n` + ids.filter((id) => byId[id]).map((id) => `– ${byId[id].name}${byId[id].isGK ? " (BR)" : ""}`).join("\n");
    share(`⚽ Składy na dziś\n\n${fmt(TEAMS[0], lastDraw.teamA)}\n\n${fmt(TEAMS[1], lastDraw.teamB)}`);
  };

  const syncMatch = (teamA, teamB) => {
    setLastDraw({ ...lastDraw, teamA, teamB });
    if (lastDraw.matchId) setMatches((ms) => ms.map((m) => (m.id === lastDraw.matchId ? { ...m, teamA, teamB } : m)));
  };
  const removeFromDraw = (id) => {
    if (!lastDraw) return;
    syncMatch(lastDraw.teamA.filter((x) => x !== id), lastDraw.teamB.filter((x) => x !== id));
  };
  const addToTeam = (teamKey, id) => {
    if (!lastDraw) return;
    let teamA = lastDraw.teamA.filter((x) => x !== id);
    let teamB = lastDraw.teamB.filter((x) => x !== id);
    if (teamKey === "A") teamA = [...teamA, id]; else teamB = [...teamB, id];
    syncMatch(teamA, teamB);
  };
  const addNewToTeam = (teamKey, name) => {
    const n = name.trim();
    if (!n || !lastDraw) return;
    const id = uid();
    setPlayers((ps) => [...ps, { id, name: n, shots: 3, passes: 3, running: 3, defense: 3, isGK: false, present: true, isGuest: true }]);
    const teamA = teamKey === "A" ? [...lastDraw.teamA, id] : lastDraw.teamA;
    const teamB = teamKey === "B" ? [...lastDraw.teamB, id] : lastDraw.teamB;
    syncMatch(teamA, teamB);
  };

  const buildAdj = (winner, teamA, teamB) => {
    const adj = {};
    if (winner === "draw") return adj;
    const winners = winner === "A" ? teamA : teamB;
    const losers = winner === "A" ? teamB : teamA;
    const pick = (p, dir) => {
      const opts = CATS.filter((c) => (dir > 0 ? (p[c.k] || 0) < 5 : (p[c.k] || 0) > 0));
      return opts.length ? opts[(Math.random() * opts.length) | 0].k : null;
    };
    [[winners, 1], [losers, -1]].forEach(([ids, d]) =>
      ids.forEach((id) => {
        const p = byId[id];
        if (!p) return;
        const k = pick(p, d);
        if (k) adj[id] = { k, d };
      })
    );
    return adj;
  };
  const applyAdj = (adj, sign) => {
    if (!adj || !Object.keys(adj).length) return;
    setPlayers((ps) => ps.map((p) => {
      const a = adj[p.id];
      if (!a) return p;
      return { ...p, [a.k]: clamp((p[a.k] || 3) + a.d * sign, 0, 5) };
    }));
  };

  const saveResult = (winner) => {
    if (!lastDraw) return;
    const auto = settings.autoRate !== false;
    if (lastDraw.adj) applyAdj(lastDraw.adj, -1); // cofnij poprzednią korektę
    const adj = auto ? buildAdj(winner, lastDraw.teamA, lastDraw.teamB) : null;
    if (adj) applyAdj(adj, 1);

    if (lastDraw.matchId) {
      setMatches((ms) => ms.map((m) => (m.id === lastDraw.matchId ? { ...m, winner } : m)));
      setLastDraw({ ...lastDraw, winner, adj });
      flash("Wynik poprawiony");
    } else {
      const id = uid();
      setMatches((ms) => [...ms, { id, date: new Date().toISOString(), teamA: lastDraw.teamA, teamB: lastDraw.teamB, winner }]);
      setLastDraw({ ...lastDraw, saved: true, winner, matchId: id, adj });
      const n = adj ? Object.keys(adj).length : 0;
      flash(winner === "draw"
        ? "Zapisano remis — oceny bez zmian"
        : `Zapisano: ${winner === "A" ? TEAMS[0].nick : TEAMS[1].nick}${n ? ` · oceny zmienione (${n})` : ""}`);
    }
    setEditing(false);
  };

  return (
    <>
      <section className="bg-white rounded-2xl p-4 shadow-sm border text-center" style={{ borderColor: "#e9eef0" }}>
        <p className="text-sm text-slate-500 mb-3">
          Obecnych dziś: <b className="text-slate-800">{present.length}</b>
          {present.filter((p) => p.isGK).length > 0 && <span> · bramkarzy: {present.filter((p) => p.isGK).length}</span>}
        </p>
        <div className="flex gap-1.5 mb-3">
          <button onClick={() => setMode("balanced")} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-lg border"
            style={{ borderColor: mode === "balanced" ? PITCH : "#dbe2e5", color: mode === "balanced" ? PITCH : "#94a3b8", background: mode === "balanced" ? "#fffbeb" : "white" }}>
            <BarChart3 size={14} /> Wg umiejętności
          </button>
          <button onClick={() => setMode("random")} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-lg border"
            style={{ borderColor: mode === "random" ? PITCH : "#dbe2e5", color: mode === "random" ? PITCH : "#94a3b8", background: mode === "random" ? "#fffbeb" : "white" }}>
            <Shuffle size={14} /> Losowo
          </button>
        </div>
        <button
          onClick={roll}
          disabled={present.length < 2}
          className="w-full flex items-center justify-center gap-2 text-white font-black text-lg py-4 rounded-2xl active:scale-95 transition disabled:opacity-40"
          style={{ background: PITCH }}
        >
          <Shuffle size={22} /> {lastDraw ? "Losuj ponownie" : "Losuj drużyny"}
        </button>
        <p className="text-xs text-slate-400 mt-2">
          {present.length < 2 ? "Zaznacz obecnych na zakładce „Gracze”." : mode === "balanced" ? "Drużyny wyrównane siłą, za każdym razem trochę inne." : "Czyste losowanie — oceny pomijane."}
        </p>
      </section>

      {players.length >= 2 && (
        <RulesSection open={rulesOpen} setOpen={setRulesOpen} players={players} byId={byId} pairs={pairs} setPairs={setPairs} flash={flash} />
      )}

      {error && (
        <div className="flex gap-2 items-start bg-red-50 text-red-700 text-sm rounded-xl p-3 border border-red-100">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {lastDraw && (
        <>
          {[TEAMS[0], TEAMS[1]].map((t, i) => {
            const ids = (i === 0 ? lastDraw.teamA : lastDraw.teamB).filter((id) => byId[id]);
            return (
              <section key={t.key} className="rounded-2xl overflow-hidden border" style={{ borderColor: t.ring }}>
                <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: t.color, color: t.text, borderBottom: `1px solid ${t.ring}` }}>
                  <span className="font-black">{t.name}</span>
                  <span className="text-xs opacity-80">· {t.nick}</span>
                  <span className="ml-auto text-xs font-semibold opacity-90">{ids.length} graczy · siła {teamRating(ids)}</span>
                </div>
                <ul className="bg-white divide-y" style={{ borderColor: "#f1f5f4" }}>
                  {ids.map((id) => (
                    <li key={id} className="flex items-center gap-1 px-4 py-2.5 text-sm">
                      <span className="text-slate-800 font-medium">{byId[id]?.name}</span>
                      {byId[id]?.isGK && <Hand size={13} style={{ color: "#0891b2" }} />}
                      <span className="ml-auto text-xs text-slate-400 flex items-center gap-0.5 mr-1">
                        <Star size={11} fill="#f59e0b" style={{ color: "#f59e0b" }} />{avg(byId[id])}
                      </span>
                      <button onClick={() => movePlayer(id)} className="p-1.5 rounded-lg text-slate-400 active:bg-slate-100" title="Przenieś do drugiej drużyny">
                        {i === 0 ? <ArrowDown size={16} /> : <ArrowUp size={16} />}
                      </button>
                      <button onClick={() => removeFromDraw(id)} className="p-1.5 rounded-lg text-slate-300 active:bg-red-50 active:text-red-500" title="Usuń ze składu">
                        <X size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="bg-white p-2 border-t" style={{ borderColor: "#f1f5f4" }}>
                  {addTeam === t.key ? (
                    <div className="space-y-2">
                      {unassigned.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {unassigned.map((u) => (
                            <button key={u.id} onClick={() => addToTeam(t.key, u.id)} className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border" style={{ borderColor: "#dbe2e5", color: PITCH }}>
                              + {u.name}{u.isGK ? " (BR)" : ""}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="nowa osoba (gość)"
                          className="flex-1 min-w-0 text-sm rounded-lg border px-2 py-2 outline-none" style={{ borderColor: "#dbe2e5" }} />
                        <button onClick={() => { addNewToTeam(t.key, newName); setNewName(""); }} className="px-3 rounded-lg text-white text-sm font-bold" style={{ background: PITCH }}>Dodaj</button>
                        <button onClick={() => { setAddTeam(null); setNewName(""); }} className="px-2 text-xs text-slate-400">Zamknij</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setAddTeam(t.key)} className="w-full text-xs font-bold py-2 rounded-lg border" style={{ borderColor: "#dbe2e5", color: PITCH }}>
                      ＋ Dodaj gracza do: {t.nick}
                    </button>
                  )}
                </div>
              </section>
            );
          })}

          <p className="text-xs text-slate-400 text-center -mt-1">Strzałka przenosi gracza, ✕ usuwa ze składu, „＋" dodaje kogoś ręcznie.</p>

          <button onClick={copy} className="w-full flex items-center justify-center gap-2 text-sm font-bold py-3 rounded-xl border bg-white" style={{ borderColor: "#dbe2e5", color: PITCH }}>
            <Copy size={16} /> Udostępnij składy (WhatsApp)
          </button>

          {/* result */}
          <section className="bg-white rounded-2xl p-4 border" style={{ borderColor: "#e9eef0" }}>
            <h3 className="text-sm font-bold text-slate-600 mb-2 text-center">{locked ? "Zapisany wynik" : editing ? "Wybierz nowy wynik" : "Kto wygrał?"}</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "A", bg: TEAMS[0].color, fg: TEAMS[0].text, bd: TEAMS[0].ring, label: TEAMS[0].nick },
                { key: "draw", bg: "#fbbf24", fg: "#78350f", bd: "#d97706", label: "Remis" },
                { key: "B", bg: TEAMS[1].color, fg: TEAMS[1].text, bd: TEAMS[1].ring, label: TEAMS[1].nick },
              ].map((b) => {
                const sel = lastDraw.winner === b.key;
                return (
                  <button
                    key={b.key}
                    onClick={() => saveResult(b.key)}
                    disabled={locked}
                    className="text-sm font-bold py-3.5 rounded-xl transition border-2 active:scale-95 disabled:active:scale-100"
                    style={{
                      background: b.bg,
                      color: b.fg,
                      borderColor: sel ? "#0f172a" : b.bd,
                      boxShadow: sel ? "0 0 0 3px rgba(15,23,42,.18)" : "none",
                      opacity: lastDraw.winner && !sel ? 0.45 : 1,
                    }}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
            {locked ? (
              <div className="flex items-center justify-center gap-3 mt-3">
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><Check size={14} /> Zapisano</span>
                <button onClick={() => setEditing(true)} className="text-xs font-bold px-3 py-1.5 rounded-lg border" style={{ borderColor: "#dbe2e5", color: PITCH }}>Zmień wynik</button>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center mt-3">
                {editing ? "Kliknij drużynę, aby nadpisać zapisany wynik." : "Zapis blokuje się po kliknięciu — bez podwójnego dopisania."}
              </p>
            )}
            {lastDraw.adj && Object.keys(lastDraw.adj).length > 0 && (
              <div className="mt-3 pt-3 border-t" style={{ borderColor: "#f1f5f4" }}>
                <p className="text-xs font-bold text-slate-500 mb-1.5">Zmiany ocen po meczu</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(lastDraw.adj).map(([id, a]) => byId[id] && (
                    <span key={id} className="text-[11px] font-semibold px-2 py-1 rounded-lg"
                      style={{ background: a.d > 0 ? "#ecfdf5" : "#fef2f2", color: a.d > 0 ? "#047857" : "#b91c1c" }}>
                      {byId[id].name} {a.d > 0 ? "+1" : "−1"} {CATS.find((c) => c.k === a.k)?.label.toLowerCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}

/* ------------------------------- STATS TAB -------------------------------- */
function StatsTab({ players, matches, stats, byId, settings, setSettings, dismissed, setDismissed, patch, setMatches, flash, share, exportData, importData }) {
  const [histOpen, setHistOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [dataOpen, setDataOpen] = useState(false);
  const [pendingImport, setPendingImport] = useState(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const fileRef = useRef(null);
  const th = settings.streakThreshold;
  const auto = settings.autoRate !== false;

  const downloadFile = () => {
    try {
      const blob = new Blob([exportData()], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kapitan-dane-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      flash("Plik pobrany — wyślij go innym");
    } catch { flash("Nie udało się pobrać pliku"); }
  };
  const onFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setPendingImport(String(r.result));
    r.readAsText(f);
    e.target.value = "";
  };
  const applyImport = () => {
    const ok = importData(pendingImport);
    flash(ok ? "Dane wczytane" : "Nieprawidłowy plik lub tekst");
    setPendingImport(null); setPasteText(""); setPasteOpen(false);
  };

  const suggestions = (auto ? [] : players)
    .map((p) => ({ p, s: stats[p.id] }))
    .filter(({ p, s }) => {
      if (!s || Math.abs(s.streak) < th) return false;
      return dismissed[p.id] !== s.streak; // hide once handled until streak changes
    });

  const applyBump = (p, dir) => {
    const upd = {};
    CATS.forEach((c) => (upd[c.k] = clamp((p[c.k] || 3) + dir, 0, 5)));
    patch(p.id, upd);
    setDismissed((d) => ({ ...d, [p.id]: stats[p.id].streak }));
    flash(dir > 0 ? `${p.name}: podniesiono oceny` : `${p.name}: obniżono oceny`);
  };
  const dismiss = (p) => setDismissed((d) => ({ ...d, [p.id]: stats[p.id].streak }));

  const ranked = [...players].sort((a, b) => (stats[b.id]?.winRate || 0) - (stats[a.id]?.winRate || 0) || (stats[b.id]?.played || 0) - (stats[a.id]?.played || 0));
  const played = players.filter((p) => stats[p.id]?.played > 0);

  const doReset = () => {
    setMatches([]);
    setDismissed({});
    setConfirmReset(false);
    flash("Wyniki wyczyszczone");
  };

  const makeViewLink = () => {
    if (!matches.length && !players.length) { flash("Brak danych do udostępnienia"); return; }
    const rows = [...players]
      .filter((p) => stats[p.id]?.played > 0)
      .sort((a, b) => stats[b.id].winRate - stats[a.id].winRate)
      .map((p) => [p.name, stats[p.id].played, stats[p.id].wins, stats[p.id].draws, stats[p.id].losses, stats[p.id].winRate]);
    const ms = matches.map((m) => [new Date(m.date).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit" }), m.winner, m.teamA.length, m.teamB.length]);
    const payload = { t: new Date().toLocaleDateString("pl-PL"), p: rows, m: ms };
    const enc = encodePayload(payload);
    if (!enc) { flash("Nie udało się utworzyć linku"); return; }
    let base = "";
    try { base = window.location.origin + window.location.pathname; } catch { base = ""; }
    const url = `${base}#v=${enc}`;
    share(`⚽ Dokersi — wyniki\n${url}`);
  };

  const exportResults = () => {
    if (!matches.length) { flash("Brak meczów do eksportu"); return; }
    const lines = matches.map((m, i) => {
      const w = m.winner === "draw" ? "Remis" : m.winner === "A" ? `${TEAMS[0].nick} wygrali` : `${TEAMS[1].nick} wygrali`;
      const d = new Date(m.date).toLocaleDateString("pl-PL");
      return `${i + 1}. ${d} — ${w} (${m.teamA.length}v${m.teamB.length})`;
    });
    const table = [...players]
      .filter((p) => stats[p.id]?.played > 0)
      .sort((a, b) => stats[b.id].winRate - stats[a.id].winRate)
      .map((p) => `${p.name}: ${stats[p.id].wins}-${stats[p.id].draws}-${stats[p.id].losses} (${stats[p.id].winRate}%)`);
    let text = `📋 Wyniki meczów (${matches.length})\n${lines.join("\n")}`;
    if (table.length) text += `\n\n🏆 Bilans graczy (W-R-P):\n${table.join("\n")}`;
    share(text);
  };

  return (
    <>
      {/* suggestions */}
      {suggestions.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-bold text-sm text-slate-600 px-1">Sugestie ocen</h2>
          {suggestions.map(({ p, s }) => {
            const up = s.streak > 0;
            return (
              <div key={p.id} className="rounded-2xl p-3 border flex items-center gap-3" style={{ background: up ? "#fffbeb" : "#fef2f2", borderColor: up ? "#a7f3d0" : "#fecaca" }}>
                {up ? <TrendingUp className="text-emerald-600 shrink-0" size={22} /> : <TrendingDown className="text-red-500 shrink-0" size={22} />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800">{p.name}</p>
                  <p className="text-xs text-slate-500">
                    {up ? `${s.streak} wygranych z rzędu — rozważ podniesienie` : `${Math.abs(s.streak)} przegranych z rzędu — rozważ obniżenie`}
                  </p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => applyBump(p, up ? 1 : -1)} className="text-xs font-bold text-white px-2.5 py-1.5 rounded-lg" style={{ background: up ? "#059669" : "#dc2626" }}>
                    {up ? "+1" : "−1"}
                  </button>
                  <button onClick={() => dismiss(p)} className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border bg-white text-slate-500" style={{ borderColor: "#e2e8f0" }}>Pomiń</button>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* auto rating */}
      <section className="bg-white rounded-2xl p-4 border" style={{ borderColor: "#e9eef0" }}>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-700">Automatyczne oceny po meczu</p>
            <p className="text-xs text-slate-400 mt-0.5">Wygrani +1 gwiazdka, przegrani −1, w losowej kategorii. Remis nie zmienia nic.</p>
          </div>
          <button
            onClick={() => setSettings((s) => ({ ...s, autoRate: !(s.autoRate !== false) }))}
            className="shrink-0 h-7 w-12 rounded-full transition relative"
            style={{ background: auto ? GOLD : "#cbd5e1" }}
            aria-label="Przełącz automatyczne oceny"
          >
            <span className="absolute top-1 h-5 w-5 rounded-full bg-white transition-all" style={{ left: auto ? 26 : 4 }} />
          </button>
        </div>
      </section>

      {/* threshold */}
      {!auto && <section className="bg-white rounded-2xl p-3 border flex items-center gap-2" style={{ borderColor: "#e9eef0" }}>
        <span className="text-sm text-slate-500 flex-1">Sugestia po serii</span>
        <button onClick={() => setSettings((s) => ({ ...s, streakThreshold: clamp(th - 1, 2, 20) }))} className="h-8 w-8 rounded-lg border text-slate-500 font-bold" style={{ borderColor: "#dbe2e5" }}>−</button>
        <span className="w-8 text-center font-black text-slate-800">{th}</span>
        <button onClick={() => setSettings((s) => ({ ...s, streakThreshold: clamp(th + 1, 2, 20) }))} className="h-8 w-8 rounded-lg border text-slate-500 font-bold" style={{ borderColor: "#dbe2e5" }}>+</button>
        <span className="text-sm text-slate-400">meczów</span>
      </section>}

      {/* table */}
      <section className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#e9eef0" }}>
        <div className="grid grid-cols-12 gap-1 px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wide" style={{ background: "#f8fafb" }}>
          <span className="col-span-5">Gracz</span>
          <span className="col-span-2 text-center">Mecze</span>
          <span className="col-span-3 text-center">B-R-P</span>
          <span className="col-span-2 text-center">%</span>
        </div>
        <div className="divide-y" style={{ borderColor: "#f1f5f4" }}>
          {ranked.map((p) => {
            const s = stats[p.id] || {};
            return (
              <div key={p.id} className="grid grid-cols-12 gap-1 px-4 py-2.5 items-center text-sm">
                <span className="col-span-5 truncate font-medium text-slate-800 flex items-center gap-1">
                  {p.name}
                  {s.streak >= 3 && <span className="text-[10px]">🔥</span>}
                  {s.streak <= -3 && <span className="text-[10px]">🥶</span>}
                </span>
                <span className="col-span-2 text-center text-slate-500">{s.played || 0}</span>
                <span className="col-span-3 text-center text-slate-500 text-xs">{s.wins || 0}-{s.draws || 0}-{s.losses || 0}</span>
                <span className="col-span-2 text-center font-bold" style={{ color: (s.winRate || 0) >= 50 ? "#059669" : "#94a3b8" }}>{s.played ? `${s.winRate}%` : "–"}</span>
              </div>
            );
          })}
          {players.length === 0 && <p className="text-center text-sm text-slate-400 py-8">Brak graczy.</p>}
          {players.length > 0 && played.length === 0 && <p className="text-center text-sm text-slate-400 py-8">Rozegraj i zapisz pierwszy mecz.</p>}
        </div>
      </section>

      {/* history */}
      {matches.length > 0 && (
        <section className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#e9eef0" }}>
          <button onClick={() => setHistOpen(!histOpen)} className="w-full flex items-center gap-2 p-4">
            <h2 className="font-bold text-sm text-slate-700">Historia meczów ({matches.length})</h2>
            <span className="ml-auto text-slate-300">{histOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
          </button>
          {histOpen && (
            <div className="px-4 pb-3 space-y-1.5">
              {[...matches].reverse().map((m) => {
                const label = m.winner === "draw" ? "Remis" : m.winner === "A" ? `${TEAMS[0].nick} ↑` : `${TEAMS[1].nick} ↑`;
                const c = m.winner === "draw" ? "#64748b" : m.winner === "A" ? TEAMS[0].label : TEAMS[1].label;
                return (
                  <div key={m.id} className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg" style={{ background: "#f8fafb" }}>
                    <span className="text-xs text-slate-400">{new Date(m.date).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit" })}</span>
                    <span className="text-xs text-slate-400">{m.teamA.length}v{m.teamB.length}</span>
                    <span className="ml-auto font-bold text-xs" style={{ color: c }}>{label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* export results */}
      {matches.length > 0 && (
        <button onClick={exportResults} className="w-full flex items-center justify-center gap-2 text-sm font-bold py-3 rounded-xl border bg-white" style={{ borderColor: "#dbe2e5", color: PITCH }}>
          <Copy size={16} /> Eksportuj wyniki meczów
        </button>
      )}

      {/* dane */}
      <section className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#e9eef0" }}>
        <button onClick={() => setDataOpen(!dataOpen)} className="w-full flex items-center gap-2 p-4">
          <h2 className="font-bold text-sm text-slate-700">Kopia i synchronizacja danych</h2>
          <span className="ml-auto text-slate-300">{dataOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
        </button>
        {dataOpen && (
          <div className="px-4 pb-4 space-y-2">
            <p className="text-xs text-slate-400">Eksportuj wszystkie dane i wyślij je innym (plik przez WhatsApp albo tekst). Oni wczytują u siebie, żeby mieć ten sam skład i wyniki.</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={downloadFile} className="text-sm font-bold py-2.5 rounded-xl border" style={{ borderColor: "#dbe2e5", color: PITCH }}>Eksportuj plik</button>
              <button onClick={() => share(exportData())} className="text-sm font-bold py-2.5 rounded-xl border" style={{ borderColor: "#dbe2e5", color: PITCH }}>Eksportuj tekst</button>
            </div>
            <button onClick={makeViewLink} className="w-full text-sm font-bold py-2.5 rounded-xl border" style={{ borderColor: GOLD, color: "#b45309", background: "#fffbeb" }}>
              🔗 Link do podglądu wyników (tylko do odczytu)
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => fileRef.current && fileRef.current.click()} className="text-sm font-bold py-2.5 rounded-xl text-white" style={{ background: PITCH }}>Wczytaj z pliku</button>
              <button onClick={() => setPasteOpen((v) => !v)} className="text-sm font-bold py-2.5 rounded-xl text-white" style={{ background: PITCH }}>Wklej i wczytaj</button>
            </div>
            <input ref={fileRef} type="file" accept="application/json,.json,.txt" onChange={onFile} style={{ display: "none" }} />
            {pasteOpen && (
              <div className="space-y-2">
                <textarea value={pasteText} onChange={(e) => setPasteText(e.target.value)} rows={4} placeholder="Wklej tutaj dane otrzymane od kogoś…"
                  className="w-full text-xs rounded-xl border px-3 py-2 resize-none outline-none" style={{ borderColor: "#dbe2e5" }} />
                <button onClick={() => setPendingImport(pasteText)} disabled={!pasteText.trim()} className="w-full text-sm font-bold py-2.5 rounded-xl text-white disabled:opacity-40" style={{ background: PITCH }}>Wczytaj wklejone</button>
              </div>
            )}
            {pendingImport !== null && (
              <div className="rounded-xl p-3 border space-y-2" style={{ borderColor: "#fde68a", background: "#fffbeb" }}>
                <p className="text-sm text-slate-700">Wczytać te dane? Zastąpią wszystkich graczy i wyniki na tym telefonie.</p>
                <div className="flex gap-2">
                  <button onClick={() => setPendingImport(null)} className="flex-1 text-sm font-bold py-2 rounded-lg border bg-white text-slate-500" style={{ borderColor: "#e2e8f0" }}>Anuluj</button>
                  <button onClick={applyImport} className="flex-1 text-sm font-bold py-2 rounded-lg text-white" style={{ background: "#d97706" }}>Wczytaj</button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* reset */}
      {matches.length > 0 && (
        confirmReset ? (
          <div className="rounded-2xl p-4 border bg-white space-y-3" style={{ borderColor: "#fecaca" }}>
            <p className="text-sm text-slate-700 text-center">Wyczyścić wszystkie wyniki i statystyki? Gracze i oceny zostają.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmReset(false)} className="flex-1 text-sm font-bold py-2.5 rounded-xl border bg-white text-slate-500" style={{ borderColor: "#e2e8f0" }}>Anuluj</button>
              <button onClick={doReset} className="flex-1 text-sm font-bold py-2.5 rounded-xl text-white" style={{ background: "#dc2626" }}>Tak, wyczyść</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setConfirmReset(true)} className="w-full flex items-center justify-center gap-2 text-sm font-bold py-3 rounded-xl border text-red-500 bg-white" style={{ borderColor: "#fecaca" }}>
            <RotateCcw size={16} /> Resetuj wyniki
          </button>
        )
      )}
    </>
  );
}
