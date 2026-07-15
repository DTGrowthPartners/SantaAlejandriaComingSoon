"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession, canOperate } from "@/lib/auth";
import { daysInMonth as daysInMonthOf } from "@/lib/ledger";
import type { LedgerSectionKind } from "@/generated/prisma/client";
import { Prisma } from "@/generated/prisma/client";

/**
 * Acciones del ledger "Ingresos y Gastos". Todo manual: agregar/editar/mover/
 * borrar celdas, filas y secciones, y clonar la estructura a un mes nuevo.
 * Cada acción valida sesión + permiso (canOperate) y que el objeto pertenezca
 * al hotel de la sesión, luego revalida /dashboard/ledger.
 */

export type LedgerActionState = { ok: boolean; error: string | null; id?: string };
const OK = (id?: string): LedgerActionState => ({ ok: true, error: null, id });
const fail = (error: string): LedgerActionState => ({ ok: false, error });

function revalidate() {
  revalidatePath("/dashboard/ledger");
}

async function gate() {
  const session = await getSession();
  if (!session) return { session: null, err: "Sesión expirada." as const };
  if (!canOperate(session.role))
    return { session: null, err: "No tienes permiso para editar." as const };
  return { session, err: null };
}

/** Fila con su sección y hoja, validando pertenencia al hotel. */
async function rowOwned(rowId: string, hotelId: string) {
  const row = await prisma.ledgerRow.findUnique({
    where: { id: rowId },
    include: { section: { include: { sheet: true } } },
  });
  if (!row || row.section.sheet.hotelId !== hotelId) return null;
  return row;
}

async function sectionOwned(sectionId: string, hotelId: string) {
  const section = await prisma.ledgerSection.findUnique({
    where: { id: sectionId },
    include: { sheet: true },
  });
  if (!section || section.sheet.hotelId !== hotelId) return null;
  return section;
}

async function sheetOwned(sheetId: string, hotelId: string) {
  const sheet = await prisma.ledgerSheet.findUnique({ where: { id: sheetId } });
  if (!sheet || sheet.hotelId !== hotelId) return null;
  return sheet;
}

/** Interpreta lo que escribió el usuario en una celda. */
function parseCellInput(raw: string, isText: boolean): number | string | null {
  const t = (raw ?? "").trim();
  if (t === "") return null; // vacío = borrar la celda
  if (isText) return t;
  const digits = t.replace(/[^\d-]/g, "");
  if (digits === "" || digits === "-") return t; // texto tipo "FS" en sección numérica: se preserva
  const n = Number(digits);
  return Number.isFinite(n) ? n : t;
}

// ───────────────────────────── Celdas ─────────────────────────────

export async function updateCellAction(input: {
  rowId: string;
  day: number;
  value: string;
}): Promise<LedgerActionState> {
  const { session, err } = await gate();
  if (!session) return fail(err);
  const row = await rowOwned(input.rowId, session.hotelId);
  if (!row) return fail("La fila no existe.");
  const day = Math.trunc(input.day);
  if (day < 1 || day > 31) return fail("Día inválido.");

  const cells = { ...((row.cells as Record<string, unknown>) ?? {}) };
  const parsed = parseCellInput(input.value, row.section.isText);
  if (parsed === null) delete cells[String(day)];
  else cells[String(day)] = parsed;

  await prisma.ledgerRow.update({
    where: { id: row.id },
    data: { cells: cells as Prisma.InputJsonValue },
  });
  revalidate();
  return OK();
}

// ───────────────────────────── Filas ─────────────────────────────

export async function updateRowLabelAction(input: {
  rowId: string;
  label: string;
}): Promise<LedgerActionState> {
  const { session, err } = await gate();
  if (!session) return fail(err);
  const row = await rowOwned(input.rowId, session.hotelId);
  if (!row) return fail("La fila no existe.");
  const label = input.label.trim();
  if (!label) return fail("La etiqueta no puede quedar vacía.");
  await prisma.ledgerRow.update({ where: { id: row.id }, data: { label } });
  revalidate();
  return OK();
}

export async function addRowAction(input: {
  sectionId: string;
  label?: string;
  afterRowId?: string;
}): Promise<LedgerActionState> {
  const { session, err } = await gate();
  if (!session) return fail(err);
  const section = await sectionOwned(input.sectionId, session.hotelId);
  if (!section) return fail("La sección no existe.");

  const rows = await prisma.ledgerRow.findMany({
    where: { sectionId: section.id },
    orderBy: { sortOrder: "asc" },
  });
  const after = input.afterRowId
    ? rows.find((r) => r.id === input.afterRowId)
    : undefined;
  const insertAt = after ? after.sortOrder + 1 : rows.length;

  const created = await prisma.$transaction(async (tx) => {
    await tx.ledgerRow.updateMany({
      where: { sectionId: section.id, sortOrder: { gte: insertAt } },
      data: { sortOrder: { increment: 1 } },
    });
    return tx.ledgerRow.create({
      data: {
        sectionId: section.id,
        label: input.label?.trim() || "Nueva fila",
        sortOrder: insertAt,
        cells: {},
      },
    });
  });
  revalidate();
  return OK(created.id);
}

export async function deleteRowAction(input: {
  rowId: string;
}): Promise<LedgerActionState> {
  const { session, err } = await gate();
  if (!session) return fail(err);
  const row = await rowOwned(input.rowId, session.hotelId);
  if (!row) return fail("La fila no existe.");
  await prisma.ledgerRow.delete({ where: { id: row.id } });
  revalidate();
  return OK();
}

/** Mueve una fila arriba/abajo dentro de su sección (intercambia sortOrder). */
export async function moveRowAction(input: {
  rowId: string;
  direction: "up" | "down";
}): Promise<LedgerActionState> {
  const { session, err } = await gate();
  if (!session) return fail(err);
  const row = await rowOwned(input.rowId, session.hotelId);
  if (!row) return fail("La fila no existe.");

  const rows = await prisma.ledgerRow.findMany({
    where: { sectionId: row.sectionId },
    orderBy: { sortOrder: "asc" },
  });
  const idx = rows.findIndex((r) => r.id === row.id);
  const swapIdx = input.direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= rows.length) return OK(); // ya está en el borde
  const a = rows[idx];
  const b = rows[swapIdx];
  await prisma.$transaction([
    prisma.ledgerRow.update({ where: { id: a.id }, data: { sortOrder: b.sortOrder } }),
    prisma.ledgerRow.update({ where: { id: b.id }, data: { sortOrder: a.sortOrder } }),
  ]);
  revalidate();
  return OK();
}

/** Reordena todas las filas de una sección al orden dado (para drag & drop). */
export async function reorderRowsAction(input: {
  sectionId: string;
  orderedIds: string[];
}): Promise<LedgerActionState> {
  const { session, err } = await gate();
  if (!session) return fail(err);
  const section = await sectionOwned(input.sectionId, session.hotelId);
  if (!section) return fail("La sección no existe.");
  const rows = await prisma.ledgerRow.findMany({ where: { sectionId: section.id } });
  const valid = new Set(rows.map((r) => r.id));
  if (input.orderedIds.some((id) => !valid.has(id)) || input.orderedIds.length !== rows.length)
    return fail("Orden inválido.");
  await prisma.$transaction(
    input.orderedIds.map((id, i) =>
      prisma.ledgerRow.update({ where: { id }, data: { sortOrder: i } }),
    ),
  );
  revalidate();
  return OK();
}

// ─────────────────────────── Secciones ───────────────────────────

export async function addSectionAction(input: {
  sheetId: string;
  title?: string;
  kind?: LedgerSectionKind;
  isText?: boolean;
}): Promise<LedgerActionState> {
  const { session, err } = await gate();
  if (!session) return fail(err);
  const sheet = await sheetOwned(input.sheetId, session.hotelId);
  if (!sheet) return fail("La hoja no existe.");
  const count = await prisma.ledgerSection.count({ where: { sheetId: sheet.id } });
  const created = await prisma.ledgerSection.create({
    data: {
      sheetId: sheet.id,
      title: input.title?.trim() || "Nueva sección",
      kind: input.kind ?? "DATA",
      isText: input.isText ?? false,
      sortOrder: count,
      rows: { create: { label: "Nueva fila", sortOrder: 0, cells: {} } },
    },
  });
  revalidate();
  return OK(created.id);
}

export async function updateSectionAction(input: {
  sectionId: string;
  title?: string;
  kind?: LedgerSectionKind;
  isText?: boolean;
}): Promise<LedgerActionState> {
  const { session, err } = await gate();
  if (!session) return fail(err);
  const section = await sectionOwned(input.sectionId, session.hotelId);
  if (!section) return fail("La sección no existe.");
  const data: { title?: string; kind?: LedgerSectionKind; isText?: boolean } = {};
  if (input.title !== undefined) {
    const t = input.title.trim();
    if (!t) return fail("El título no puede quedar vacío.");
    data.title = t;
  }
  if (input.kind !== undefined) data.kind = input.kind;
  if (input.isText !== undefined) data.isText = input.isText;
  await prisma.ledgerSection.update({ where: { id: section.id }, data });
  revalidate();
  return OK();
}

export async function deleteSectionAction(input: {
  sectionId: string;
}): Promise<LedgerActionState> {
  const { session, err } = await gate();
  if (!session) return fail(err);
  const section = await sectionOwned(input.sectionId, session.hotelId);
  if (!section) return fail("La sección no existe.");
  await prisma.ledgerSection.delete({ where: { id: section.id } });
  revalidate();
  return OK();
}

export async function moveSectionAction(input: {
  sectionId: string;
  direction: "up" | "down";
}): Promise<LedgerActionState> {
  const { session, err } = await gate();
  if (!session) return fail(err);
  const section = await sectionOwned(input.sectionId, session.hotelId);
  if (!section) return fail("La sección no existe.");
  const sections = await prisma.ledgerSection.findMany({
    where: { sheetId: section.sheetId },
    orderBy: { sortOrder: "asc" },
  });
  const idx = sections.findIndex((s) => s.id === section.id);
  const swapIdx = input.direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= sections.length) return OK();
  const a = sections[idx];
  const b = sections[swapIdx];
  await prisma.$transaction([
    prisma.ledgerSection.update({ where: { id: a.id }, data: { sortOrder: b.sortOrder } }),
    prisma.ledgerSection.update({ where: { id: b.id }, data: { sortOrder: a.sortOrder } }),
  ]);
  revalidate();
  return OK();
}

// ───────────────────────── Hojas (meses) ─────────────────────────

/**
 * Crea la hoja de un mes nuevo clonando la ESTRUCTURA (secciones + filas +
 * etiquetas) de una hoja plantilla, con las celdas vacías. Por defecto clona la
 * hoja más reciente. Si no hay ninguna, crea una hoja vacía.
 */
export async function createMonthAction(input: {
  year: number;
  month: number;
  fromSheetId?: string;
}): Promise<LedgerActionState> {
  const { session, err } = await gate();
  if (!session) return fail(err);
  const year = Math.trunc(input.year);
  const month = Math.trunc(input.month);
  if (year < 2000 || year > 2100 || month < 1 || month > 12)
    return fail("Mes o año inválido.");

  const dup = await prisma.ledgerSheet.findUnique({
    where: { hotelId_year_month: { hotelId: session.hotelId, year, month } },
  });
  if (dup) return fail("Ya existe una hoja para ese mes.");

  const template = input.fromSheetId
    ? await prisma.ledgerSheet.findFirst({
        where: { id: input.fromSheetId, hotelId: session.hotelId },
        include: { sections: { include: { rows: true }, orderBy: { sortOrder: "asc" } } },
      })
    : await prisma.ledgerSheet.findFirst({
        where: { hotelId: session.hotelId },
        orderBy: [{ year: "desc" }, { month: "desc" }],
        include: { sections: { include: { rows: true }, orderBy: { sortOrder: "asc" } } },
      });

  const created = await prisma.ledgerSheet.create({
    data: {
      hotelId: session.hotelId,
      year,
      month,
      daysInMonth: daysInMonthOf(year, month),
      sections: template
        ? {
            create: template.sections.map((s) => ({
              title: s.title,
              kind: s.kind,
              isText: s.isText,
              sortOrder: s.sortOrder,
              rows: {
                create: s.rows
                  .slice()
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((r) => ({
                    label: r.label,
                    roomId: r.roomId,
                    sortOrder: r.sortOrder,
                    cells: {},
                  })),
              },
            })),
          }
        : undefined,
    },
  });
  revalidate();
  return OK(created.id);
}

export async function deleteSheetAction(input: {
  sheetId: string;
}): Promise<LedgerActionState> {
  const { session, err } = await gate();
  if (!session) return fail(err);
  const sheet = await sheetOwned(input.sheetId, session.hotelId);
  if (!sheet) return fail("La hoja no existe.");
  await prisma.ledgerSheet.delete({ where: { id: sheet.id } });
  revalidate();
  return OK();
}
