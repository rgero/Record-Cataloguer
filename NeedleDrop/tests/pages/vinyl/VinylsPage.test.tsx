import { MemoryRouter, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import VinylsPage from "@pages/vinyl/VinylsPage";

const { mockUseMediaQuery } = vi.hoisted(() => ({
  mockUseMediaQuery: vi.fn(() => false),
}));

const { mockUseUserContext } = vi.hoisted(() => ({
  mockUseUserContext: vi.fn(() => ({ isEditor: true })),
}));

vi.mock("@mui/material", async () => ({
  ...(await vi.importActual<typeof import("@mui/material")>("@mui/material")),
  useMediaQuery: mockUseMediaQuery,
}));

vi.mock("@context/users/UserContext", () => ({
  useUserContext: mockUseUserContext,
}));

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
  default: () => <button>visibility</button>,
}));

vi.mock("@components/ui/tables/ColumnFilterButton", () => ({
  default: () => <button>filter</button>,
}));

vi.mock("@components/vinyls/VinylsTable", () => ({
  default: () => <div data-testid="all-vinyls-table" />,
}));

vi.mock("@components/vinyls/UnplayedVinylsTable", () => ({
  default: () => <div data-testid="unplayed-vinyls-table" />,
}));

vi.mock("@components/vinyls/UserVinylsTable", () => ({
  default: () => <div data-testid="user-vinyls-table" />,
}));

vi.mock("@components/ui/SuspenseTableWrapper", () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));

const LocationDisplay = () => {
  const location = useLocation();
  return <output data-testid="location">{location.search}</output>;
};

const renderPage = (initialEntry = "/vinyls") => render(
  <MemoryRouter initialEntries={[initialEntry]}>
    <VinylsPage />
    <LocationDisplay />
  </MemoryRouter>,
);

describe("VinylsPage view selection", () => {
  beforeEach(() => {
    mockUseMediaQuery.mockReturnValue(false);
    mockUseUserContext.mockReturnValue({ isEditor: true });
  });

  it("defaults to all vinyls for a missing or invalid view parameter", () => {
    renderPage("/vinyls?view=unknown");

    expect(screen.getByRole("heading", { name: "Vinyls" })).toBeInTheDocument();
    expect(screen.getByTestId("all-vinyls-table")).toBeInTheDocument();
  });

  it("restores the unplayed view from the URL", () => {
    renderPage("/vinyls?view=unplayed");

    expect(screen.getByRole("heading", { name: "Unplayed" })).toBeInTheDocument();
    expect(screen.getByTestId("unplayed-vinyls-table")).toBeInTheDocument();
  });

  it("falls back to all vinyls for a non-editor on an editor-only view", () => {
    mockUseUserContext.mockReturnValue({ isEditor: false });

    renderPage("/vinyls?view=unplayed");

    expect(screen.getByRole("heading", { name: "Vinyls" })).toBeInTheDocument();
    expect(screen.getByTestId("all-vinyls-table")).toBeInTheDocument();
    expect(screen.queryByTestId("unplayed-vinyls-table")).not.toBeInTheDocument();
    expect(screen.queryByTitle("Show unplayed only")).not.toBeInTheDocument();
  });

  it("preserves filters when selecting a view", async () => {
    const { getByTitle } = renderPage("/vinyls?f_artist=Pink+Floyd");

    fireEvent.click(getByTitle("Show unplayed only"));

    await waitFor(() => {
      expect(screen.getByTestId("location")).toHaveTextContent("?f_artist=Pink+Floyd&view=unplayed");
    });
  });

  it("removes the view parameter when toggling the active view off", async () => {
    const { getByTitle } = renderPage("/vinyls?f_artist=Pink+Floyd&view=unplayed");

    fireEvent.click(getByTitle("Showing unplayed only"));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Vinyls" })).toBeInTheDocument();
      expect(screen.getByTestId("location")).toHaveTextContent("?f_artist=Pink+Floyd");
      expect(screen.getByTestId("all-vinyls-table")).toBeInTheDocument();
    });
  });

    it("restores the user view and switches between user and unplayed views", async () => {
      const { getByTitle } = renderPage("/vinyls?view=user");

      expect(screen.getByRole("heading", { name: "Vinyls (mine)" })).toBeInTheDocument();
      expect(screen.getByTestId("user-vinyls-table")).toBeInTheDocument();

      fireEvent.click(getByTitle("Show unplayed only"));

      await waitFor(() => {
        expect(screen.getByTestId("unplayed-vinyls-table")).toBeInTheDocument();
        expect(screen.getByTestId("location")).toHaveTextContent("?view=unplayed");
      });
    });

    it("uses the mobile dropdown to select a view", async () => {
      mockUseMediaQuery.mockReturnValue(true);
      renderPage("/vinyls?f_artist=Pink+Floyd");

      fireEvent.click(screen.getByRole("button", { name: "Vinyl views" }));
      fireEvent.click(screen.getByRole("menuitem", { name: "Show your plays" }));

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Vinyls (mine)" })).toBeInTheDocument();
        expect(screen.getByTestId("location")).toHaveTextContent("?f_artist=Pink+Floyd&view=user");
      });
    });
});
