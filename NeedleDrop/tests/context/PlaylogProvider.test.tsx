import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPlaylog, deletePlaylog, getPlaylogs, updatePlaylog } from "@services/apiPlaylogs";

import { DefaultSettings } from "@interfaces/settings/DefaultSettings";
import { PlaylogProvider } from "@context/playlogs/PlaylogProvider";
import supabase from "@services/supabase";
import { usePlaylogContext } from "@context/playlogs/PlaylogContext";
import { useUserContext } from "@context/users/UserContext";

const { channelMock, handlers, removeChannelMock } = vi.hoisted(() => {
  const handlers: Array<{ filter: Record<string, string>; callback: () => void }> = [];
  const channelMock = {
    on: vi.fn((_event: string, filter: Record<string, string>, callback: () => void) => {
      handlers.push({ filter, callback });
      return channelMock;
    }),
    subscribe: vi.fn(() => channelMock),
  };

  return { channelMock, handlers, removeChannelMock: vi.fn() };
});

vi.mock("@services/apiPlaylogs", () => ({
  createPlaylog: vi.fn(),
  deletePlaylog: vi.fn(),
  getPlaylogs: vi.fn(),
  updatePlaylog: vi.fn(),
}));

vi.mock("@services/supabase", () => ({
  default: {
    channel: vi.fn(() => channelMock),
    removeChannel: removeChannelMock,
  },
}));

vi.mock("@context/users/UserContext", () => ({
  useUserContext: vi.fn(),
}));

const mockedGetPlaylogs = getPlaylogs as unknown as ReturnType<typeof vi.fn>;
const mockedCreatePlaylog = createPlaylog as unknown as ReturnType<typeof vi.fn>;
const mockedUpdatePlaylog = updatePlaylog as unknown as ReturnType<typeof vi.fn>;
const mockedDeletePlaylog = deletePlaylog as unknown as ReturnType<typeof vi.fn>;
const mockedUseUserContext = useUserContext as unknown as ReturnType<typeof vi.fn>;

let playlogContext: ReturnType<typeof usePlaylogContext>;

const ContextReader = () => {
  playlogContext = usePlaylogContext();
  return null;
};

const renderProvider = (queryClient: QueryClient) => render(
  <QueryClientProvider client={queryClient}>
    <PlaylogProvider>
      <ContextReader />
    </PlaylogProvider>
  </QueryClientProvider>,
);

describe("PlaylogProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    handlers.length = 0;
    mockedGetPlaylogs.mockResolvedValue([]);
    mockedCreatePlaylog.mockResolvedValue({ id: 2 });
    mockedUpdatePlaylog.mockResolvedValue(undefined);
    mockedDeletePlaylog.mockResolvedValue(undefined);
    mockedUseUserContext.mockReturnValue({ isEditor: true });
  });

  it("subscribes to playlog changes and invalidates playlogs", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

    renderProvider(queryClient);

    await waitFor(() => {
      expect(supabase.channel).toHaveBeenCalledWith("playlogs-realtime");
      expect(handlers).toHaveLength(1);
    });

    expect(handlers[0].filter).toEqual({ event: "*", schema: "public", table: "playlogs" });
    handlers[0].callback();
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["playlogs"] });
  });

  it("loads playlogs, filters by listener, and runs editor mutations", async () => {
    const alice = { id: "alice", name: "Alice", editor: true, settings: DefaultSettings };
    const bob = { id: "bob", name: "Bob", editor: false, settings: DefaultSettings };
    const playlogs = [
      { id: 1, album_id: 10, listeners: [alice], date: new Date("2026-01-01"), artist: "Artist One", album: "Album One" },
      { id: 2, album_id: 20, listeners: [bob], date: new Date("2026-02-01"), artist: "Artist Two", album: "Album Two" },
      { id: 3, album_id: null, listeners: [alice, bob], date: new Date("2026-03-01"), artist: "Artist Three", album: "Album Three" },
    ];
    mockedGetPlaylogs.mockResolvedValue(playlogs);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

    renderProvider(queryClient);

    await waitFor(() => expect(playlogContext.playlogs).toEqual(playlogs));
    expect(playlogContext.getPlaylogById(2)).toEqual(playlogs[1]);
    expect(playlogContext.getPlaylogById(99)).toBeNull();
    expect(playlogContext.getPlaylogsByUserId("alice")).toEqual([playlogs[0], playlogs[2]]);
    expect(playlogContext.getPlaylogsByUserId("missing")).toEqual([]);

    const newPlaylog = {
      album_id: 30,
      listeners: [alice],
      date: new Date("2026-04-01"),
      artist: "Artist Four",
      album: "Album Four",
    };

    await act(async () => {
      await playlogContext.createPlaylog(newPlaylog);
      await playlogContext.updatePlaylog(1, { album: "Updated Album" });
      await playlogContext.deletePlaylog(2);
    });

    expect(mockedCreatePlaylog).toHaveBeenCalledWith(newPlaylog);
    expect(mockedUpdatePlaylog).toHaveBeenCalledWith(1, { album: "Updated Album" });
    expect(mockedDeletePlaylog).toHaveBeenCalledWith(2);
    expect(invalidateQueries).toHaveBeenCalledTimes(3);
  });

  it("rejects mutations for non-editors", async () => {
    mockedUseUserContext.mockReturnValue({ isEditor: false });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    renderProvider(queryClient);
    await waitFor(() => expect(playlogContext).toBeDefined());

    await expect(playlogContext.createPlaylog({ album_id: null, listeners: [], date: new Date("2026-01-01") }))
      .rejects.toThrow("Editor permissions required");
    expect(mockedCreatePlaylog).not.toHaveBeenCalled();
  });
});
