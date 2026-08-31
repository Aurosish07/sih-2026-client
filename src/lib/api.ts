const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function fetchStorms() {
  return fetchJson<import("./types").Storm[]>("/api/storms");
}

export async function fetchStorm(stormId: string) {
  return fetchJson<import("./types").StormDetail>(`/api/storms/${stormId}`);
}

export async function fetchStormTrack(stormId: string) {
  return fetchJson<import("./types").TrackPoint[]>(`/api/storms/${stormId}/track`);
}

export async function fetchStormObservations(stormId: string) {
  return fetchJson<import("./types").Observation[]>(`/api/storms/${stormId}/observations`);
}

export async function fetchSatelliteImages(stormId: string) {
  return fetchJson<import("./types").SatelliteImage[]>(`/api/storms/${stormId}/satellite`);
}

export async function fetchSatelliteAnalysis(stormId: string) {
  return fetchJson<import("./types").SatelliteAnalysis>(
    `/api/satellite/${stormId}/analysis`,
  );
}

export async function fetchPredictions(stormId: string) {
  return fetchJson<import("./types").Prediction>(`/api/predictions/${stormId}`);
}

export function streamChat(
  query: string,
  onToken: (token: string) => void,
  onToolStart: (name: string, input: Record<string, unknown>) => void,
  onToolEnd: (name: string, output: string) => void,
  onDone: () => void,
  onError: (err: Error) => void,
) {
  const ctrl = new AbortController();

  fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
    signal: ctrl.signal,
  })
    .then(async (res) => {
      if (!res.ok || !res.body) throw new Error(`Chat error ${res.status}`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "token") onToken(data.content);
            else if (data.type === "tool_start") onToolStart(data.name, data.input);
            else if (data.type === "tool_end") onToolEnd(data.name, data.output);
            else if (data.type === "DONE") onDone();
          } catch {}
        }
      }
      onDone();
    })
    .catch((err) => {
      if (err.name !== "AbortError") onError(err);
    });

  return () => ctrl.abort();
}
