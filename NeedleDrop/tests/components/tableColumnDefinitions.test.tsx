import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { LocationTableColumnDef } from "@components/locations/LocationsTableColumnDef";
import { PlayLogTableColumnDef } from "@components/playlog/PlayLogTableColumnDef";
import { WantedItemTableColumnDef } from "@components/wanted/WantedTableColumnDef";
import vinylColumns from "@components/vinyls/VinylsTableColumns";

type NotesColumn = {
  accessorKey?: string;
  id?: string;
  meta?: { filterVariant?: string };
  cell?: (context: { getValue: () => string | undefined }) => React.ReactNode;
};

const getNotesColumn = (columns: readonly NotesColumn[]) => {
  const notesColumn = columns.find((column) => (column.accessorKey ?? column.id) === "notes");

  if (!notesColumn) {
    throw new Error("Notes column was not defined");
  }

  return notesColumn;
};

describe("notes table columns", () => {
  it.each([
    ["locations", LocationTableColumnDef],
    ["playlogs", PlayLogTableColumnDef],
    ["vinyls", vinylColumns],
    ["wanted items", WantedItemTableColumnDef],
  ] as const)("marks non-empty %s notes as present", (_table, columns) => {
    const notesColumn = getNotesColumn(columns);

    expect(notesColumn.meta?.filterVariant).toBe("boolean");

    render(notesColumn.cell?.({ getValue: () => "Keep this record" }));

    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });

  it.each([
    ["locations", LocationTableColumnDef],
    ["playlogs", PlayLogTableColumnDef],
    ["vinyls", vinylColumns],
    ["wanted items", WantedItemTableColumnDef],
  ] as const)("marks missing or whitespace-only %s notes as absent", (_table, columns) => {
    const notesColumn = getNotesColumn(columns);

    const { rerender } = render(notesColumn.cell?.({ getValue: () => "   " }));
    expect(screen.getByRole("checkbox")).not.toBeChecked();

    rerender(notesColumn.cell?.({ getValue: () => undefined }));
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });
});