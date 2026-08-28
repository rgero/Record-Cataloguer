import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import TwoColumnPaginatedTable from "@components/ui/tables/TwoColumnPaginatedTable";

type Row = { name: string; count: number };

const rows: Row[] = [
  { name: "Alice", count: 3 },
  { name: "Bob", count: 10 },
  { name: "Casey", count: 1 },
  { name: "Dana", count: 7 },
  { name: "Evan", count: 5 },
  { name: "Finn", count: 2 },
  { name: "Gale", count: 8 },
];

const baseProps = {
  data: rows,
  primaryKey: "name" as const,
  secondaryKey: "count" as const,
  primaryHeader: "Name",
  secondaryHeader: "Count",
  getRowKey: (item: Row) => item.name,
  containerSx: {},
};

describe("TwoColumnPaginatedTable", () => {
  it("renders headers and row values", () => {
    render(<TwoColumnPaginatedTable {...baseProps} data={rows.slice(0, 2)} />);

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Count")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("sorts descending by sortKey by default", () => {
    render(<TwoColumnPaginatedTable {...baseProps} sortKey="count" />);

    const names = screen.getAllByTitle(/^(Alice|Bob|Casey|Dana|Evan|Finn|Gale)$/);
    expect(names.map((el) => el.textContent)).toEqual(["Bob", "Gale", "Dana", "Evan", "Alice"]);
  });

  it("sorts ascending when sortDirection is asc", () => {
    render(<TwoColumnPaginatedTable {...baseProps} sortKey="count" sortDirection="asc" />);

    const names = screen.getAllByTitle(/^(Alice|Bob|Casey|Dana|Evan|Finn|Gale)$/);
    expect(names.map((el) => el.textContent)).toEqual(["Casey", "Finn", "Alice", "Evan", "Dana"]);
  });

  it("preserves original order when no sortKey is provided", () => {
    render(<TwoColumnPaginatedTable {...baseProps} data={rows.slice(0, 4)} paginate={false} />);

    const names = screen.getAllByTitle(/^(Alice|Bob|Casey|Dana)$/);
    expect(names.map((el) => el.textContent)).toEqual(["Alice", "Bob", "Casey", "Dana"]);
  });

  it("uses renderPrimary to format the primary column", () => {
    render(
      <TwoColumnPaginatedTable
        {...baseProps}
        data={rows.slice(0, 1)}
        renderPrimary={(item) => item.name.toUpperCase()}
      />,
    );

    expect(screen.getByText("ALICE")).toBeInTheDocument();
  });

  it("paginates by default, showing 5 rows per page", () => {
    render(<TwoColumnPaginatedTable {...baseProps} sortKey="count" />);

    expect(screen.queryByTitle("Finn")).not.toBeInTheDocument();
    expect(screen.getByTitle("Bob")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Go to next page" }));

    expect(screen.getByTitle("Finn")).toBeInTheDocument();
    expect(screen.queryByTitle("Bob")).not.toBeInTheDocument();
  });

  it("renders all rows and hides pagination controls when paginate is false", () => {
    render(<TwoColumnPaginatedTable {...baseProps} paginate={false} />);

    rows.forEach((row) => {
      expect(screen.getByTitle(row.name)).toBeInTheDocument();
    });
    expect(screen.queryByRole("button", { name: "Go to next page" })).not.toBeInTheDocument();
  });
});
