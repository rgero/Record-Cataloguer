import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import LocationDetailsPage from "@pages/locations/LocationDetailsPage";
import PlaylogDetailsPage from "@pages/playlogs/PlaylogsDetailsPage";
import type { ReactElement } from "react";
import VinylDetailsPage from "@pages/vinyl/VinylDetailsPage";
import WantedItemDetailsPage from "@pages/wanted/WantedItemDetailsPage";

const {mockUseParams, mockLocationContext, mockPlaylogContext, mockVinylContext, mockWantedItemContext, mockToast} = vi.hoisted(() => ({
  mockUseParams: vi.fn(),
  mockLocationContext: { isLoading: false, getLocationById: vi.fn() },
  mockPlaylogContext: {
    isLoading: false,
    getPlaylogById: vi.fn(),
    getPlaylogsByAlbumId: vi.fn(() => []),
  },
  mockVinylContext: { isLoading: false, getVinylById: vi.fn() },
  mockWantedItemContext: { isLoading: false, getWantedItemById: vi.fn() },
  mockToast: { error: vi.fn() },
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useParams: () => mockUseParams(),
    Navigate: ({ to }: { to: string }) => <div data-testid="redirect">{to}</div>,
  };
});

vi.mock("react-hot-toast", () => ({ default: mockToast }));
vi.mock("@components/ui/SuspenseFormWrapper", () => ({
  default: () => <div data-testid="loading">Loading</div>,
}));
vi.mock("@components/locations/LocationForm", () => ({
  default: ({ location }: { location?: unknown }) => (
    <div data-testid="location-form">{location ? "edit" : "create"}</div>
  ),
}));
vi.mock("@components/playlog/PlaylogForm", () => ({
  default: ({ playlog }: { playlog?: unknown }) => (
    <div data-testid="playlog-form">{playlog ? "edit" : "create"}</div>
  ),
}));
vi.mock("@components/vinyls/VinylForm", () => ({
  default: ({ vinyl }: { vinyl?: unknown }) => (
    <div data-testid="vinyl-form">{vinyl ? "edit" : "create"}</div>
  ),
}));
vi.mock("@components/wanted/WantItemForm", () => ({
  default: ({ wantedItem }: { wantedItem?: unknown }) => (
    <div data-testid="wanted-form">{wantedItem ? "edit" : "create"}</div>
  ),
}));

vi.mock("@context/location/LocationContext", () => ({
  useLocationContext: () => mockLocationContext,
}));
vi.mock("@context/playlogs/PlaylogContext", () => ({
  usePlaylogContext: () => mockPlaylogContext,
}));
vi.mock("@context/vinyl/VinylContext", () => ({
  useVinylContext: () => mockVinylContext,
}));
vi.mock("@context/wanted/WantedItemContext", () => ({
  useWantedItemContext: () => mockWantedItemContext,
}));

type PageCase = {
  name: string;
  Page: () => ReactElement;
  context: { isLoading: boolean };
  getById: ReturnType<typeof vi.fn>;
  formTestId: string;
};

const pageCases: PageCase[] = [
  {
    name: "locations",
    Page: LocationDetailsPage,
    context: mockLocationContext,
    getById: mockLocationContext.getLocationById,
    formTestId: "location-form",
  },
  {
    name: "playlogs",
    Page: PlaylogDetailsPage,
    context: mockPlaylogContext,
    getById: mockPlaylogContext.getPlaylogById,
    formTestId: "playlog-form",
  },
  {
    name: "vinyls",
    Page: VinylDetailsPage,
    context: mockVinylContext,
    getById: mockVinylContext.getVinylById,
    formTestId: "vinyl-form",
  },
  {
    name: "wanted items",
    Page: WantedItemDetailsPage,
    context: mockWantedItemContext,
    getById: mockWantedItemContext.getWantedItemById,
    formTestId: "wanted-form",
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  mockUseParams.mockReturnValue({ id: undefined });
  mockLocationContext.isLoading = false;
  mockPlaylogContext.isLoading = false;
  mockVinylContext.isLoading = false;
  mockWantedItemContext.isLoading = false;
});

describe.each(pageCases)("$name details page", ({ Page, context, getById, formTestId }) => {
  it("passes no record to the form on create routes", () => {
    render(<Page />);

    expect(screen.getByTestId(formTestId)).toHaveTextContent("create");
    expect(getById).not.toHaveBeenCalled();
  });

  it("passes the resolved record to the form on edit routes", () => {
    const record = { id: 7 };
    mockUseParams.mockReturnValue({ id: "7" });
    getById.mockReturnValue(record);

    render(<Page />);

    expect(screen.getByTestId(formTestId)).toHaveTextContent("edit");
    expect(getById).toHaveBeenCalledWith(7);
  });

  it("redirects without rendering the form when an edit record is missing", () => {
    mockUseParams.mockReturnValue({ id: "999" });
    getById.mockReturnValue(null);

    render(<Page />);

    expect(screen.getByTestId("redirect").textContent).toMatch(/locations|plays|vinyls|wantlist/);
    expect(screen.queryByTestId(formTestId)).not.toBeInTheDocument();
    expect(mockToast.error).toHaveBeenCalled();
  });
});

it.each(pageCases)("shows loading before resolving $name edit records", ({ Page, context, formTestId }) => {
  mockUseParams.mockReturnValue({ id: "7" });
  context.isLoading = true;

  render(<Page />);

  expect(screen.getByTestId("loading")).toBeInTheDocument();
  expect(screen.queryByTestId(formTestId)).not.toBeInTheDocument();
});
