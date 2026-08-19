import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createVinyl, deleteVinyl, getUnplayedVinyls, getVinyls, updateVinyl } from "@services/apiVinyls";

import { DefaultSettings } from "@interfaces/settings/DefaultSettings";
import { VinylProvider } from "@context/vinyl/VinylProvider";
import supabase from "@services/supabase";
import { useAuthenticationContext } from "@context/authentication/AuthenticationContext";
import { useUserContext } from "@context/users/UserContext";
import { useVinylContext } from "@context/vinyl/VinylContext";

const { channelMock, handlers } = vi.hoisted(() => {
  const handlers: Array<{ filter: Record<string, string>; callback: () => void }> = [];
  const channelMock = {
    on: vi.fn((_event: string, filter: Record<string, string>, callback: () => void) => {
      handlers.push({ filter, callback });
      return channelMock;
    }),
    subscribe: vi.fn(() => channelMock),
  };

  return { channelMock, handlers };
});

vi.mock("@services/apiVinyls", () => ({
  createVinyl: vi.fn(),
  deleteVinyl: vi.fn(),
  getUnplayedVinyls: vi.fn(),
  getVinyls: vi.fn(),
  updateVinyl: vi.fn(),
}));

vi.mock("@services/supabase", () => ({
  default: {
    channel: vi.fn(() => channelMock),
    removeChannel: vi.fn(),
  },
}));

vi.mock("@context/authentication/AuthenticationContext", () => ({
  useAuthenticationContext: vi.fn(),
}));

vi.mock("@context/users/UserContext", () => ({
  useUserContext: vi.fn(),
}));

const mockedGetUnplayedVinyls = getUnplayedVinyls as unknown as ReturnType<typeof vi.fn>;
const mockedGetVinyls = getVinyls as unknown as ReturnType<typeof vi.fn>;
const mockedCreateVinyl = createVinyl as unknown as ReturnType<typeof vi.fn>;
const mockedUpdateVinyl = updateVinyl as unknown as ReturnType<typeof vi.fn>;
const mockedDeleteVinyl = deleteVinyl as unknown as ReturnType<typeof vi.fn>;
const mockedUseAuthenticationContext = useAuthenticationContext as unknown as ReturnType<typeof vi.fn>;
const mockedUseUserContext = useUserContext as unknown as ReturnType<typeof vi.fn>;

let vinylContext: ReturnType<typeof useVinylContext>;

const ContextReader = () => {
  vinylContext = useVinylContext();
  return null;
};

const renderProvider = (queryClient: QueryClient) => render(
  <QueryClientProvider client={queryClient}>
    <VinylProvider>
      <ContextReader />
    </VinylProvider>
  </QueryClientProvider>,
);

describe("VinylProvider realtime updates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    handlers.length = 0;
    mockedGetUnplayedVinyls.mockResolvedValue([]);
    mockedGetVinyls.mockResolvedValue([]);
    mockedCreateVinyl.mockResolvedValue(undefined);
    mockedUpdateVinyl.mockResolvedValue(undefined);
    mockedDeleteVinyl.mockResolvedValue(undefined);
    mockedUseAuthenticationContext.mockReturnValue({ user: { id: "user-1" } });
    mockedUseUserContext.mockReturnValue({ isEditor: true });
  });

  it("invalidates vinyl and unplayed-vinyl queries when vinyls or playlogs change", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

    renderProvider(queryClient);

    await waitFor(() => {
      expect(supabase.channel).toHaveBeenCalledWith("vinyls-realtime");
      expect(handlers).toHaveLength(2);
    });

    expect(handlers.map(({ filter }) => filter)).toEqual([
      { event: "*", schema: "public", table: "vinyls" },
      { event: "*", schema: "public", table: "playlogs" },
    ]);

    handlers.forEach(({ callback }) => callback());

    expect(invalidateQueries).toHaveBeenCalledTimes(4);
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["vinyls"] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["unplayed_vinyls"] });
  });

  it("loads vinyls and calculates ownership, purchase, and collection totals", async () => {
    const alice = { id: "alice", name: "Alice", editor: true, settings: DefaultSettings };
    const bob = { id: "bob", name: "Bob", editor: false, settings: DefaultSettings };
    const vinyls = [
      {
        id: 1,
        artist: "Artist One",
        album: "Album One",
        purchaseDate: new Date("2026-01-01"),
        purchaseLocation: null,
        price: 30,
        owners: [alice, bob],
        purchasedBy: [alice],
        length: 1,
        likedBy: [],
        doubleLP: false,
        tags: [],
      },
      {
        id: 2,
        artist: "Artist Two",
        album: "Album Two",
        purchaseDate: new Date("2026-02-01"),
        purchaseLocation: null,
        price: 20,
        owners: [bob],
        purchasedBy: [bob],
        length: 1,
        likedBy: [],
        doubleLP: false,
        tags: [],
      },
    ];
    const unplayedVinyls = [vinyls[1]];
    mockedGetVinyls.mockResolvedValue(vinyls);
    mockedGetUnplayedVinyls.mockResolvedValue(unplayedVinyls);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    renderProvider(queryClient);

    await waitFor(() => expect(vinylContext.vinyls).toEqual(vinyls));

    expect(vinylContext.unplayedVinyls).toEqual(unplayedVinyls);
    expect(vinylContext.getVinylById(1)).toEqual(vinyls[0]);
    expect(vinylContext.getVinylById(99)).toBeNull();
    expect(vinylContext.getVinylsOwnedByUserId("alice")).toEqual(vinyls.slice(0, 1));
    expect(vinylContext.getVinylsBoughtByUserId("bob")).toEqual(vinyls.slice(1));
    expect(vinylContext.calculateValueById("alice")).toBe(15);
    expect(vinylContext.calculateTotalSpentById("alice")).toBe(15);
    expect(vinylContext.calculateTotalPrice()).toBe(35);
  });

  it("runs editor mutations and invalidates vinyls after success", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    renderProvider(queryClient);

    await waitFor(() => expect(vinylContext).toBeDefined());

    const newVinyl = {
      artist: "New Artist",
      album: "New Album",
      purchaseDate: new Date("2026-03-01"),
      purchaseLocation: null,
      owners: [],
      purchasedBy: [],
      length: 1,
      likedBy: [],
      doubleLP: false,
      tags: [],
    };

    await act(async () => {
      await vinylContext.createVinyl(newVinyl);
      await vinylContext.updateVinyl(1, { notes: "Played" });
      await vinylContext.deleteVinyl(1);
    });

    expect(mockedCreateVinyl).toHaveBeenCalledWith(newVinyl);
    expect(mockedUpdateVinyl).toHaveBeenCalledWith(1, { notes: "Played" });
    expect(mockedDeleteVinyl).toHaveBeenCalledWith(1);
    expect(invalidateQueries).toHaveBeenCalledTimes(3);
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["vinyls"] });
  });

  it("rejects mutations for non-editors", async () => {
    mockedUseUserContext.mockReturnValue({ isEditor: false });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    renderProvider(queryClient);
    await waitFor(() => expect(vinylContext).toBeDefined());

    await expect(vinylContext.deleteVinyl(1)).rejects.toThrow("Editor permissions required");
    expect(mockedDeleteVinyl).not.toHaveBeenCalled();
  });
});
