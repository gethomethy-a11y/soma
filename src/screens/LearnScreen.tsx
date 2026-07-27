import { useMemo, useState } from "react";
import { BookOpen, Flame, Search } from "lucide-react";
import { FONT } from "../theme";
import { Card, Screen, ScreenTitle } from "../components/Card";
import { FilterChip } from "../components/Chip";
import { ALL_ARTICLES, ARTICLES, CATEGORIES, TRENDING } from "../data/articles";
import { useApp } from "../hooks/useApp";
import type { Article } from "../types";

export function LearnScreen({ openArticle }: { openArticle: (a: Article) => void }) {
  const { t, dark } = useApp();
  const [category, setCategory] = useState("Trending");
  const [query, setQuery] = useState("");

  const searching = query.trim().length > 0;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q) {
      return ALL_ARTICLES.filter((a) =>
        (a.title + a.blurb + a.cat + a.body.join(" ")).toLowerCase().includes(q)
      );
    }
    if (category === "Trending") return ARTICLES;
    return ARTICLES.filter((a) => a.cat === category);
  }, [query, category]);

  return (
    <Screen>
      <ScreenTitle t={t}>Learn</ScreenTitle>

      <div style={{ position: "relative", marginTop: 14 }}>
        <Search size={18} color={t.faint} style={{ position: "absolute", left: 15, top: 14 }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search cortisol, acne, sleep…"
          style={{
            width: "100%",
            boxSizing: "border-box",
            fontFamily: FONT,
            fontSize: 15,
            padding: "13px 16px 13px 44px",
            borderRadius: 15,
            border: `1px solid ${t.line}`,
            background: t.card,
            color: t.ink,
            outline: "none",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          margin: "14px -18px 4px",
          padding: "0 18px",
          scrollbarWidth: "none",
        }}
      >
        {CATEGORIES.map((c) => (
          <FilterChip
            key={c}
            t={t}
            active={!searching && category === c}
            onClick={() => {
              setCategory(c);
              setQuery("");
            }}
          >
            {c}
          </FilterChip>
        ))}
      </div>

      {/* Trending myths hero — only on the default view. */}
      {category === "Trending" && !searching && (
        <>
          <Card
            t={t}
            pad={0}
            style={{
              overflow: "hidden",
              marginTop: 14,
              background: `linear-gradient(140deg, ${t.sage}, ${t.blue})`,
              border: "none",
            }}
          >
            <div style={{ padding: 22 }}>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em", color: "rgba(255,255,255,.85)" }}>
                Trust, not hype
              </span>
              <div style={{ fontSize: 21, fontWeight: 750, color: "#fff", margin: "8px 0 6px", lineHeight: 1.25 }}>
                Your feed, fact-checked
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,.9)", lineHeight: 1.5 }}>
                Viral hormone claims, sorted into true, false, and it depends.
              </div>
            </div>
          </Card>

          <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
            {TRENDING.map((a) => (
              <Card
                t={t}
                key={a.id}
                pad={16}
                onClick={() => openArticle(a)}
                style={{ display: "flex", gap: 14, alignItems: "flex-start" }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    flexShrink: 0,
                    background: dark ? t.card2 : t.sageSoft,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Flame size={20} color="#E08A46" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: t.ink, lineHeight: 1.3 }}>{a.title}</div>
                  <div style={{ fontSize: 13, color: t.sub, lineHeight: 1.45, margin: "4px 0" }}>{a.blurb}</div>
                  <span style={{ fontSize: 11.5, color: t.faint }}>{a.read}</span>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        {results.map((a) => (
          <Card
            t={t}
            key={a.id}
            pad={16}
            onClick={() => openArticle(a)}
            style={{ display: "flex", gap: 14, alignItems: "flex-start" }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 15,
                flexShrink: 0,
                background: dark ? t.card2 : t.sageSoft,
                display: "grid",
                placeItems: "center",
              }}
            >
              <BookOpen size={22} color={t.sage} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: t.sage, letterSpacing: ".03em" }}>
                  {a.cat.toUpperCase()}
                </span>
                <span style={{ fontSize: 11.5, color: t.faint }}>· {a.read}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: t.ink, lineHeight: 1.3, marginBottom: 4 }}>{a.title}</div>
              <div style={{ fontSize: 13, color: t.sub, lineHeight: 1.45 }}>{a.blurb}</div>
            </div>
          </Card>
        ))}

        {results.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: t.sub }}>
            <Search size={30} color={t.faint} style={{ marginBottom: 10 }} />
            <div style={{ fontSize: 15, fontWeight: 600, color: t.ink }}>Nothing here yet</div>
            <div style={{ fontSize: 13.5, marginTop: 4 }}>Try another word or category.</div>
          </div>
        )}
      </div>
    </Screen>
  );
}
