import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createWantedItem, deleteWantedItem, getWantedItems, updateWantedItem } from "@services/apiWantedItems";

import { WantedItemProvider } from "@context/wanted/WantedItemProvider";
import supabase from "@services/supabase";
import { useUserContext } from "@context/users/UserContext";
import { useWantedItemContext } from "@context/wanted/WantedItemContext";

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

vi.mock("@services/apiWantedItems", () => ({
  createWantedItem: vi.fn(),
  deleteWantedItem: vi.fn(),
  getWantedItems: vi.fn(),
  updateWantedItem: vi.fn(),
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

const mockedGetWantedItems = getWantedItems as unknown as ReturnType<typeof vi.fn>;
const mockedCreateWantedItem = createWantedItem as unknown as ReturnType<typeof vi.fn>;
const mockedUpdateWantedItem = updateWantedItem as unknown as ReturnType<typeof vi.fn>;
const mockedDeleteWantedItem = deleteWantedItem as unknown as ReturnType<typeof vi.fn>;
const mockedUseUserContext = useUserContext as unknown as ReturnType<typeof vi.fn>;

let wantedItemContext: ReturnType<typeof useWantedItemContext>;

const ContextReader = () => {
  wantedItemContext = useWantedItemContext();
  return null;
};

const renderProvider = (queryClient: QueryClient) => render(
  <QueryClientProvider client={queryClient}>
    <WantedItemProvider>
      <ContextReader />
    </WantedItemProvider>
  </QueryClientProvider>,
);

describe("WantedItemProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    handlers.length = 0;
    mockedGetWantedItems.mockResolvedValue([]);
    mockedCreateWantedItem.mockResolvedValue({ id: 2 });
    mockedUpdateWantedItem.mockResolvedValue(undefined);
    mockedDeleteWantedItem.mockResolvedValue(undefined);
    mockedUseUserContext.mockReturnValue({ isEditor: true });
  });

  it("subscribes to wanted item changes and invalidates wanted items", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

    renderProvider(queryClient);

    await waitFor(() => {
      expect(supabase.channel).toHaveBeenCalledWith("wanted-realtime");
      expect(handlers).toHaveLength(1);
    });

    expect(handlers[0].filter).toEqual({ event: "*", schema: "public", table: "wanted_items" });
    handlers[0].callback();
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["wanteditem"] });
  });

  it("loads items, looks them up, and runs editor mutations", async () => {
    const wantedItems = [
      {
        id: 1,
        artist: "Artist One",
        album: "Album One",
        searcher: [],
        created_at: new Date("2026-01-01"),
        weight: "High" as const,
      },
      {
        id: 2,
        artist: "Artist Two",
        album: "Album Two",
        searcher: [],
        created_at: new Date("2026-02-01"),
        weight: "Low" as const,
      },
    ];
    mockedGetWantedItems.mockResolvedValue(wantedItems);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

    renderProvider(queryClient);

    await waitFor(() => expect(wantedItemContext.wanteditems).toEqual(wantedItems));
    expect(wantedItemContext.getWantedItemById(1)).toEqual(wantedItems[0]);
    expect(wantedItemContext.getWantedItemById(99)).toBeNull();

    const newItem = {
      artist: "Artist Three",
      album: "Album Three",
      searcher: [],
      created_at: new Date("2026-03-01"),
      weight: "Medium" as const,
    };

    await act(async () => {
      await wantedItemContext.createWantedItem(newItem);
      await wantedItemContext.updateWantedItem(1, { notes: "Keep looking" });
      await wantedItemContext.deleteWantedItem(2);
    });

    expect(mockedCreateWantedItem).toHaveBeenCalledWith(newItem);
    expect(mockedUpdateWantedItem).toHaveBeenCalledWith(1, { notes: "Keep looking" });
    expect(mockedDeleteWantedItem).toHaveBeenCalledWith(2);
    expect(invalidateQueries).toHaveBeenCalledTimes(3);
  });

  it("rejects mutations for non-editors", async () => {
    mockedUseUserContext.mockReturnValue({ isEditor: false });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    renderProvider(queryClient);
    await waitFor(() => expect(wantedItemContext).toBeDefined());

    await expect(wantedItemContext.deleteWantedItem(1)).rejects.toThrow("Editor permissions required");
    expect(mockedDeleteWantedItem).not.toHaveBeenCalled();
  });
});
