import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Users, Shuffle, BarChart3, Star, Plus, Trash2, Copy, RotateCcw,
  Hand, Check, X, Link2, Ban, TrendingUp, TrendingDown, UserPlus,
  ClipboardPaste, Pin, ChevronDown, ChevronUp, Crown, AlertTriangle, ArrowDown, ArrowUp,
} from "lucide-react";

/* ---------------------------------- meta ---------------------------------- */
const TEAMS = [
  { key: "A", name: "Drużyna 1", nick: "Czarni", color: "#1a1a1a", text: "#ffffff", label: "#1a1a1a", soft: "#e5e5e5", ring: "#3f3f46" },
  { key: "B", name: "Drużyna 2", nick: "Biali", color: "#ffffff", text: "#1a1a1a", label: "#64748b", soft: "#f8fafc", ring: "#cbd5e1" },
];
const PITCH = "#14532d";
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
const avg = (p) => (p ? (overall(p) / CATS.length).toFixed(1) : "0.0");
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
      <span className="h-1 w-8 rounded-full" style={{ background: active ? PITCH : "transparent" }} />
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

/* ---------------------------------- app ----------------------------------- */
export default function App() {
  const [players, setPlayers] = useState([]);
  const [pairs, setPairs] = useState([]);
  const [matches, setMatches] = useState([]);
  const [settings, setSettings] = useState({ streakThreshold: 5 });
  const [dismissed, setDismissed] = useState({}); // playerId -> streak value dismissed
  const [lastDraw, setLastDraw] = useState(null); // {teamA, teamB, saved}
  const [tab, setTab] = useState("players");
  const [toast, setToast] = useState("");
  const [shareText, setShareText] = useState(null);
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
        setSettings(d.settings || { streakThreshold: 5 });
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

  const stats = useMemo(() => computeStats(players, matches), [players, matches]);
  const present = players.filter((p) => p.present);
  const byId = useMemo(() => Object.fromEntries(players.map((p) => [p.id, p])), [players]);

  /* player mutations */
  const patch = (id, upd) => setPlayers((ps) => ps.map((p) => (p.id === id ? { ...p, ...upd } : p)));
  const remove = (id) => {
    setPlayers((ps) => ps.filter((p) => p.id !== id));
    setPairs((xs) => xs.filter((x) => x.a !== id && x.b !== id));
  };

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
          style={{ background: PITCH, backgroundImage: "radial-gradient(circle at 100% 0%, rgba(255,255,255,.09), transparent 45%)" }}
        >
          <div className="flex items-center gap-2">
            <div className="grid place-items-center h-9 w-9 rounded-full" style={{ background: "rgba(255,255,255,.15)" }}>
              <Crown size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none">Kapitan</h1>
              <p className="text-xs opacity-75 mt-0.5">Losowanie drużyn na osiedlowe mecze</p>
            </div>
            <div className="ml-auto text-right">
              <div className="text-2xl font-black leading-none">{present.length}</div>
              <div className="text-[10px] opacity-75 uppercase tracking-wide">obecni</div>
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
            />
          )}
          {tab === "stats" && (
            <StatsTab
              players={players} matches={matches} stats={stats} byId={byId}
              settings={settings} setSettings={setSettings}
              dismissed={dismissed} setDismissed={setDismissed}
              patch={patch} setMatches={setMatches} flash={flash} share={share}
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
        <div className="flex items-center gap-2 px-1">
          <h2 className="font-bold text-sm text-slate-600">Lista ({players.length})</h2>
          <div className="ml-auto flex gap-1.5">
            <button onClick={() => setAll(true)} className="text-xs font-semibold px-2.5 py-1 rounded-lg border bg-white" style={{ borderColor: "#dbe2e5", color: PITCH }}>Wszyscy</button>
            <button onClick={() => setAll(false)} className="text-xs font-semibold px-2.5 py-1 rounded-lg border bg-white" style={{ borderColor: "#dbe2e5", color: "#94a3b8" }}>Nikt</button>
          </div>
        </div>
      )}

      {/* roster */}
      <div className="space-y-2">
        {players.map((p) => {
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
              style={{ borderColor: type === "link" ? "#059669" : "#dbe2e5", color: type === "link" ? "#047857" : "#94a3b8", background: type === "link" ? "#ecfdf5" : "white" }}>
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
              <div key={p.id} className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg" style={{ background: p.type === "block" ? "#fef2f2" : "#ecfdf5" }}>
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
function DrawTab({ present, players, pairs, byId, lastDraw, setLastDraw, setMatches, setPairs, setPlayers, flash, share }) {
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

  const saveResult = (winner) => {
    if (!lastDraw) return;
    if (lastDraw.matchId) {
      setMatches((ms) => ms.map((m) => (m.id === lastDraw.matchId ? { ...m, winner } : m)));
      setLastDraw({ ...lastDraw, winner });
      flash("Wynik poprawiony");
    } else {
      const id = uid();
      setMatches((ms) => [...ms, { id, date: new Date().toISOString(), teamA: lastDraw.teamA, teamB: lastDraw.teamB, winner }]);
      setLastDraw({ ...lastDraw, saved: true, winner, matchId: id });
      flash(winner === "draw" ? "Zapisano remis" : `Zapisano wygraną: ${winner === "A" ? TEAMS[0].nick : TEAMS[1].nick}`);
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
            style={{ borderColor: mode === "balanced" ? PITCH : "#dbe2e5", color: mode === "balanced" ? PITCH : "#94a3b8", background: mode === "balanced" ? "#ecfdf5" : "white" }}>
            <BarChart3 size={14} /> Wg umiejętności
          </button>
          <button onClick={() => setMode("random")} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-lg border"
            style={{ borderColor: mode === "random" ? PITCH : "#dbe2e5", color: mode === "random" ? PITCH : "#94a3b8", background: mode === "random" ? "#ecfdf5" : "white" }}>
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
          </section>
        </>
      )}
    </>
  );
}

/* ------------------------------- STATS TAB -------------------------------- */
function StatsTab({ players, matches, stats, byId, settings, setSettings, dismissed, setDismissed, patch, setMatches, flash, share }) {
  const [histOpen, setHistOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const th = settings.streakThreshold;

  const suggestions = players
    .map((p) => ({ p, s: stats[p.id] }))
    .filter(({ p, s }) => {
      if (!s || Math.abs(s.streak) < th) return false;
      return dismissed[p.id] !== s.streak; // hide once handled until streak changes
    });

  const applyBump = (p, dir) => {
    const upd = {};
    CATS.forEach((c) => (upd[c.k] = clamp((p[c.k] || 3) + dir, 1, 5)));
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
              <div key={p.id} className="rounded-2xl p-3 border flex items-center gap-3" style={{ background: up ? "#ecfdf5" : "#fef2f2", borderColor: up ? "#a7f3d0" : "#fecaca" }}>
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

      {/* threshold */}
      <section className="bg-white rounded-2xl p-3 border flex items-center gap-2" style={{ borderColor: "#e9eef0" }}>
        <span className="text-sm text-slate-500 flex-1">Sugestia po serii</span>
        <button onClick={() => setSettings((s) => ({ ...s, streakThreshold: clamp(th - 1, 2, 20) }))} className="h-8 w-8 rounded-lg border text-slate-500 font-bold" style={{ borderColor: "#dbe2e5" }}>−</button>
        <span className="w-8 text-center font-black text-slate-800">{th}</span>
        <button onClick={() => setSettings((s) => ({ ...s, streakThreshold: clamp(th + 1, 2, 20) }))} className="h-8 w-8 rounded-lg border text-slate-500 font-bold" style={{ borderColor: "#dbe2e5" }}>+</button>
        <span className="text-sm text-slate-400">meczów</span>
      </section>

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
