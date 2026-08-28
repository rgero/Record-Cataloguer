import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import type { PlayLog } from "@interfaces/PlayLog";
import type { User } from "@interfaces/User";
import VinylPlaysTable from "@components/vinyls/VinylPlaysTable";

const createListener = (id: string, name: string): User => ({
  id,
  name,
  editor: false,
  settings: {} as User["settings"],
});

const createPlaylog = (date: string, listeners: User[]): PlayLog => ({
  album_id: 1,
  date: new Date(`${date}T12:00:00`),
  listeners,
});

describe("VinylPlaysTable", () => {
  it("formats dates as YYYY-MM-DD, sorts newest first, and renders listeners", () => {
    render(
      <VinylPlaysTable
        playlogs={[
          createPlaylog("2024-01-05", [createListener("1", "Alice")]),
          createPlaylog("2025-12-09", [
            createListener("2", "Bob"),
            createListener("3", "Casey"),
          ]),
        ]}
      />,
    );

    const dates = screen.getAllByText(/^(2024|2025)-\d{2}-\d{2}$/);

    expect(dates.map((date) => date.textContent)).toEqual([
      "2025-12-09",
      "2024-01-05",
    ]);
    expect(screen.getByText("Bob, Casey")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("paginates after five rows", () => {
    const playlogs = Array.from({ length: 6 }, (_, index) =>
      createPlaylog(`2024-01-${String(index + 1).padStart(2, "0")}`, [
        createListener(String(index), `Listener ${index}`),
      ]),
    );

    render(<VinylPlaysTable playlogs={playlogs} />);

    expect(screen.getByText("2024-01-06")).toBeInTheDocument();
    expect(screen.queryByText("2024-01-01")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Go to next page" }));

    expect(screen.getByText("2024-01-01")).toBeInTheDocument();
    expect(screen.queryByText("2024-01-06")).not.toBeInTheDocument();
  });
});
