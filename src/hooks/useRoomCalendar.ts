import { useEffect, useMemo, useState } from "react";
import { fetchAvailability } from "@/lib/beds24";

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface State {
  unavailable: Set<string>;
  loading: boolean;
  error: string | null;
}

const HORIZON_DAYS = 365;

export function useRoomCalendar(args: {
  propertyId: string | null | undefined;
  roomId: string | null | undefined;
}): State {
  const { propertyId, roomId } = args;
  const [state, setState] = useState<State>({
    unavailable: new Set(),
    loading: false,
    error: null,
  });

  const range = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + HORIZON_DAYS);
    return { start: toISO(start), end: toISO(end) };
  }, []);

  useEffect(() => {
    if (!propertyId || !roomId) return;
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetchAvailability({
      propertyId,
      roomId,
      checkIn: range.start,
      checkOut: range.end,
    })
      .then((resp) => {
        if (cancelled) return;
        const room = resp.data?.[0];
        const set = new Set<string>();
        if (room?.availability) {
          for (const [date, n] of Object.entries(room.availability)) {
            if (typeof n !== "number" || n <= 0) set.add(date);
          }
        }
        setState({ unavailable: set, loading: false, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({
          unavailable: new Set(),
          loading: false,
          error: String(err.message ?? err),
        });
      });
    return () => {
      cancelled = true;
    };
  }, [propertyId, roomId, range.start, range.end]);

  return state;
}
