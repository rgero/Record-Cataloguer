import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { PlayLogTableColumnDef } from "@components/playlog/PlayLogTableColumnDef";
import PlaylogsPage from "@pages/playlogs/PlaylogsPage";

const mockVisibilityButton = vi.fn();
const mockFilterButton = vi.fn();

vi.mock("@components/ui/DataTablePage", () => ({
  default: ({ title, headerActions, children }: { title: string; headerActions: React.ReactNode; children: React.ReactNode }) => (
    <section>
      <h1>{title}</h1>
      <div>{headerActions}</div>
      {children}
    </section>
  ),
}));

vi.mock("@components/ui/tables/ColumnVisibilityButton", () => ({
  default: (props: unknown) => {
    mockVisibilityButton(props);
    return <button>visibility</button>;
  },
}));

vi.mock("@components/ui/tables/ColumnFilterButton", () => ({
  default: (props: unknown) => {
    mockFilterButton(props);
    return <button>filter</button>;
  },
}));

vi.mock("@components/playlog/PlayLogTable", () => ({
  default: () => <div data-testid="playlog-table" />,
}));

vi.mock("@components/ui/SuspenseTableWrapper", () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));

describe("PlaylogsPage", () => {
  it("configures both table controls with the shared playlog columns", () => {
    render(<PlaylogsPage />);

    expect(screen.getByRole("heading", { name: "Plays" })).toBeInTheDocument();
    expect(screen.getByTestId("playlog-table")).toBeInTheDocument();
    expect(mockVisibilityButton).toHaveBeenCalledWith({
      columns: PlayLogTableColumnDef,
      settingsColumn: "playlogs",
    });
    expect(mockFilterButton).toHaveBeenCalledWith({ columns: PlayLogTableColumnDef });
  });
});