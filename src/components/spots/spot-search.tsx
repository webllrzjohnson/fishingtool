"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { SpotSuggestion } from "@/lib/spots/search";

const DEBOUNCE_MS = 250;

const KIND_LABEL: Record<SpotSuggestion["kind"], string> = {
  place: "Place",
  access: "Access",
  waterbody: "Water",
  curated: "Guide",
};

const KIND_TONE: Record<SpotSuggestion["kind"], "teal" | "slate" | "amber"> = {
  place: "amber",
  access: "teal",
  waterbody: "slate",
  curated: "teal",
};

export function SpotSearch({
  onPick,
  autoFocus,
}: {
  onPick: (suggestion: SpotSuggestion) => void;
  autoFocus?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SpotSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searching, setSearching] = useState(false);
  const suppressRef = useRef(false);
  const listboxId = useId();

  const term = query.trim();
  const canSearch = term.length >= 3;

  useEffect(() => {
    if (!canSearch) return;
    if (suppressRef.current) {
      suppressRef.current = false;
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/spots/search?q=${encodeURIComponent(term)}`, { signal: controller.signal })
        .then((response) => (response.ok ? response.json() : { suggestions: [] }))
        .then((body) => {
          setSuggestions(body.suggestions ?? []);
          setOpen(true);
          setActiveIndex(-1);
          setSearching(false);
        })
        .catch(() => undefined);
    }, DEBOUNCE_MS);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [term, canSearch]);

  const showList = open && canSearch && suggestions.length > 0;

  function choose(suggestion: SpotSuggestion) {
    suppressRef.current = true;
    setQuery(suggestion.label);
    setOpen(false);
    setActiveIndex(-1);
    onPick(suggestion);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!showList) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(suggestions[activeIndex >= 0 ? activeIndex : 0]);
    } else if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div className="relative">
      <label htmlFor={`${listboxId}-input`} className="block text-sm font-bold text-slate-700">
        Where do you want to fish?
      </label>
      <input
        id={`${listboxId}-input`}
        value={query}
        autoFocus={autoFocus}
        onChange={(event) => {
          setQuery(event.target.value);
          setSearching(event.target.value.trim().length >= 3);
        }}
        onKeyDown={onKeyDown}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        placeholder="Port Dalhousie, Port Hope, Lake Simcoe, Nipigon…"
        autoComplete="off"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
        className="mt-1.5 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base"
      />
      <p className="mt-1.5 text-xs text-slate-500">
        Type a town, harbour, lake, or river. Capitalisation does not matter.
      </p>

      {showList ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Matching spots"
          className="absolute z-30 mt-1 max-h-80 w-full overflow-y-auto rounded-xl border border-slate-300 bg-white py-1 shadow-xl"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.id}
              id={`${listboxId}-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(event) => {
                event.preventDefault();
                choose(suggestion);
              }}
              onMouseEnter={() => setActiveIndex(index)}
              className={`flex cursor-pointer items-center justify-between gap-3 px-3 py-2.5 ${
                index === activeIndex ? "bg-teal-50" : ""
              }`}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-slate-900">
                  {suggestion.label}
                </span>
                {suggestion.detail ? (
                  <span className="block truncate text-xs text-slate-500">{suggestion.detail}</span>
                ) : null}
              </span>
              <Badge tone={KIND_TONE[suggestion.kind]} size="sm">
                {KIND_LABEL[suggestion.kind]}
              </Badge>
            </li>
          ))}
        </ul>
      ) : null}

      {searching && !showList ? (
        <p role="status" aria-live="polite" className="mt-2 animate-pulse text-xs text-slate-500">
          Searching Ontario…
        </p>
      ) : null}
    </div>
  );
}
