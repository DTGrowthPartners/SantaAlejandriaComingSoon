import { useEffect, useState } from "react";
import { fetchAvailability, minAvailInRange } from "@/lib/beds24";

type Status = "idle" | "loading" | "available" | "unavailable" | "error";

interface State {
  status: Status;
  error: string | null;
  nights: number;
  minAvail: number | null;
}

function daysBetween(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn).getTime();
  const b = new Date(checkOut).getTime();
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

export function useBeds24Availability(args: {
  propertyId: string | null | undefined;
  roomId: string | null | undefined;
  checkIn: string;
  checkOut: string;
  enabled: boolean;
}): State {
  const { propertyId, roomId, checkIn, checkOut, enabled } = args;
  const [state, setState] = useState<State>({
    status: "idle",
    error: null,
    nights: 0,
    minAvail: null,
  });

  useEffect(() => {
    if (!enabled || !propertyId || !roomId || !checkIn || !checkOut) {
      setState({ status: "idle", error: null, nights: 0, minAvail: null });
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      setState({ status: "error", error: "La fecha de salida debe ser posterior a la de entrada", nights: 0, minAvail: null });
      return;
    }
    let cancelled = false;
    setState({ status: "loading", error: null, nights: daysBetween(checkIn, checkOut), minAvail: null });
    fetchAvailability({ propertyId, roomId, checkIn, checkOut })
      .then((resp) => {
        if (cancelled) return;
        const m = minAvailInRange(resp, checkIn, checkOut);
        const ok = m !== null && m > 0;
        setState({
          status: ok ? "available" : "unavailable",
          error: null,
          nights: daysBetween(checkIn, checkOut),
          minAvail: m,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ status: "error", error: String(err.message ?? err), nights: 0, minAvail: null });
      });
    return () => {
      cancelled = true;
    };
  }, [propertyId, roomId, checkIn, checkOut, enabled]);

  return state;
}
