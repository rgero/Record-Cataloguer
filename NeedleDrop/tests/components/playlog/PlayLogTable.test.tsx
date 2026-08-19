import { describe, expect, it, vi } from "vitest";

import PlayLogTable from "@components/playlog/PlayLogTable";
import { PlayLogTableColumnDef } from "@components/playlog/PlayLogTableColumnDef";
import { render } from "@testing-library/react";
import { usePlaylogContext } from "@context/playlogs/PlaylogContext";

const mockReactTable = vi.fn(() => null);

vi.mock("@components/ui/tables/ReactTable", () => ({
  default: (props: unknown) => {
    mockReactTable(props);
    return null;
  },
}));

vi.mock("@context/playlogs/PlaylogContext", () => ({
  usePlaylogContext: vi.fn(),
}));

describe("PlayLogTable", () => {
  it("passes the shared playlog column definition to ReactTable", () => {
    vi.mocked(usePlaylogContext).mockReturnValue({ playlogs: [] } as never);

    render(<PlayLogTable />);

    expect(mockReactTable).toHaveBeenCalledWith({
      columns: PlayLogTableColumnDef,
      data: [],
      settingsColumn: "playlogs",
    });
  });
});