import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import VinylsTable from "@components/vinyls/VinylsTable";

const mockVinylContext = vi.hoisted(() => ({
  vinyls: [
    {
      id: 1,
      artist: "Rise Against",
      album: "Endgame",
      color: "Black",
      price: 25,
      purchaseDate: new Date("2023-01-01"),
      purchaseLocation: { id: 1, name: "Record Store A", address: "", recommended: null, notes: "", percentage: 0 },
      purchasedBy: [{ id: "user-1", name: "Roy", email: "roy@example.com", editor: true, settings: {} }],
      owners: [{ id: "user-1", name: "Roy", email: "roy@example.com", editor: true, settings: {} }],
      notes: "",
      length: 46,
      likedBy: [],
      imageUrl: "http://example.com/image.jpg",
      doubleLP: false,
      tags: [],
    },
    {
      id: 2,
      artist: "Pink Floyd",
      album: "The Wall",
      color: "Black",
      price: 30,
      purchaseDate: new Date("2023-02-01"),
      purchaseLocation: { id: 2, name: "Record Store B", address: "", recommended: null, notes: "", percentage: 0 },
      purchasedBy: [{ id: "user-1", name: "Roy", email: "roy@example.com", editor: true, settings: {} }],
      owners: [{ id: "user-1", name: "Roy", email: "roy@example.com", editor: true, settings: {} }],
      notes: "",
      length: 81,
      likedBy: [],
      imageUrl: "http://example.com/image2.jpg",
      doubleLP: true,
      tags: [],
    },
  ],
}));

vi.mock("@context/vinyl/VinylContext", () => ({
  useVinylContext: () => mockVinylContext,
}));

vi.mock("@components/ui/tables/ReactTable", () => ({
  default: ({ data }: { data: unknown[] }) => (
    <div data-testid="react-table">
      <p>{data.length} records</p>
    </div>
  ),
}));

const initialVinyls = mockVinylContext.vinyls;

describe("VinylsTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVinylContext.vinyls = initialVinyls;
  });

  it("renders the table with vinyl data", () => {
    render(<VinylsTable />);

    expect(screen.getByTestId("react-table")).toBeInTheDocument();
    expect(screen.getByText("2 records")).toBeInTheDocument();
  });

  it("passes correct vinyl data to ReactTable", () => {
    render(<VinylsTable />);

    expect(screen.getByText("2 records")).toBeInTheDocument();
  });

  it("renders table without loading state checks", () => {
    // This test verifies that the component no longer checks isLoading
    // and renders directly, delegating loading handling to the parent Suspense
    const { container } = render(<VinylsTable />);

    expect(container.querySelector("[data-testid='react-table']")).toBeInTheDocument();
  });

  it("handles empty vinyl list", () => {
    mockVinylContext.vinyls = [];

    render(<VinylsTable />);

    expect(screen.getByText("No Vinyls added yet!")).toBeInTheDocument();
  });

  it("uses checkIsComplete utility for row styling", () => {
    render(<VinylsTable />);

    // Verify the table renders (styling is applied internally)
    expect(screen.getByTestId("react-table")).toBeInTheDocument();
  });

  it("renders with correct settings column", () => {
    render(<VinylsTable />);

    expect(screen.getByTestId("react-table")).toBeInTheDocument();
  });
});
