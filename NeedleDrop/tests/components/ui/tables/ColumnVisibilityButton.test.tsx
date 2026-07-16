import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { createColumnHelper } from "@tanstack/react-table";
import { MemoryRouter } from "react-router-dom";

import ColumnVisibilityButton from "@components/ui/tables/ColumnVisibilityButton";
import { DefaultSettings } from "@interfaces/settings/DefaultSettings";
import { useUserContext, type UserContextType } from "@context/users/UserContext";
import { DialogProvider } from "@context/dialog/DialogProvider";

vi.mock("@context/users/UserContext", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@context/users/UserContext")>();
  return {
    ...actual,
    useUserContext: vi.fn(),
  };
});

type PlaylogRow = {
  artist: string;
  playNumber: number;
};

const columnHelper = createColumnHelper<PlaylogRow>();

const columns = [
  columnHelper.accessor("artist", {
    header: "Artist",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("playNumber", {
    // Non-string header ensures component falls back to prettified column id.
    header: () => "#",
    cell: (info) => info.getValue(),
  }),
];

const mockedUseUserContext = useUserContext as unknown as ReturnType<typeof vi.fn>;

describe("ColumnVisibilityButton", () => {
  const mockUpdateCurrentUserSettings = vi.fn();

  const createContext = (overrides: Partial<UserContextType> = {}): UserContextType => ({
    users: [],
    editorUsers: [],
    isLoading: false,
    isFetching: false,
    error: null,
    currentUser: null,
    isEditor: false,
    getCurrentUserSettings: () => DefaultSettings,
    updateCurrentUserSettings: mockUpdateCurrentUserSettings,
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseUserContext.mockReturnValue(createContext());
  });

  const renderButton = () => {
    return render(
      <MemoryRouter>
        <DialogProvider>
          <ColumnVisibilityButton columns={columns} settingsColumn="playlogs" />
        </DialogProvider>
      </MemoryRouter>,
    );
  };

  it("opens the modal and shows available column toggles", async () => {
    renderButton();

    fireEvent.click(screen.getByRole("button", { name: /configure visible columns/i }));

    expect(await screen.findByText("Columns & Order")).toBeInTheDocument();
    expect(screen.getByText("Artist")).toBeInTheDocument();
    expect(screen.getByText("Play Number")).toBeInTheDocument();
  });

  it("sends updated visibility settings when a column is toggled", async () => {
    const currentSettings = {
      ...DefaultSettings,
      playlogs: {
        ...DefaultSettings.playlogs,
        artist: true,
      },
    };

    mockedUseUserContext.mockReturnValue(
      createContext({ getCurrentUserSettings: () => currentSettings }),
    );

    renderButton();

    fireEvent.click(screen.getByRole("button", { name: /configure visible columns/i }));
    fireEvent.click((await screen.findAllByRole("checkbox"))[0]);

    expect(mockUpdateCurrentUserSettings).toHaveBeenCalledWith({
      playlogs: {
        ...currentSettings.playlogs,
        artist: false,
      },
    });
  });

  it("resets the table visibility to default settings", async () => {
    renderButton();

    fireEvent.click(screen.getByRole("button", { name: /configure visible columns/i }));
    fireEvent.click(await screen.findByRole("button", { name: "Visibility" }));

    expect(mockUpdateCurrentUserSettings).toHaveBeenCalledWith({
      playlogs: {
        ...DefaultSettings.playlogs,
      },
    });
  });
});
