import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createLocation, deleteLocation, getLocations, updateLocation } from "@services/apiLocations";

import { LocationProvider } from "@context/location/LocationProvider";
import supabase from "@services/supabase";
import { useLocationContext } from "@context/location/LocationContext";
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

  return {
    channelMock,
    handlers,
    removeChannelMock: vi.fn(),
  };
});

vi.mock("@services/apiLocations", () => ({
  createLocation: vi.fn(),
  deleteLocation: vi.fn(),
  getLocations: vi.fn(),
  updateLocation: vi.fn(),
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

const mockedGetLocations = getLocations as unknown as ReturnType<typeof vi.fn>;
const mockedCreateLocation = createLocation as unknown as ReturnType<typeof vi.fn>;
const mockedUpdateLocation = updateLocation as unknown as ReturnType<typeof vi.fn>;
const mockedDeleteLocation = deleteLocation as unknown as ReturnType<typeof vi.fn>;
const mockedUseUserContext = useUserContext as unknown as ReturnType<typeof vi.fn>;

let locationContext: ReturnType<typeof useLocationContext>;

const ContextReader = () => {
  locationContext = useLocationContext();
  return null;
};

const renderProvider = (queryClient: QueryClient) => render(
  <QueryClientProvider client={queryClient}>
    <LocationProvider>
      <ContextReader />
    </LocationProvider>
  </QueryClientProvider>,
);

describe("LocationProvider realtime updates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    handlers.length = 0;
    mockedGetLocations.mockResolvedValue([]);
    mockedCreateLocation.mockResolvedValue({ id: 2 });
    mockedUpdateLocation.mockResolvedValue(undefined);
    mockedDeleteLocation.mockResolvedValue(undefined);
    mockedUseUserContext.mockReturnValue({ isEditor: true });
  });

  it("invalidates locations when locations or vinyls change", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

    renderProvider(queryClient);

    await waitFor(() => {
      expect(supabase.channel).toHaveBeenCalledWith("locations-realtime");
      expect(handlers).toHaveLength(2);
    });

    expect(handlers.map(({ filter }) => filter)).toEqual([
      { event: "*", schema: "public", table: "locations" },
      { event: "*", schema: "public", table: "vinyls" },
    ]);

    handlers.forEach(({ callback }) => callback());

    expect(invalidateQueries).toHaveBeenCalledTimes(2);
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["locations"] });
  });

  it("loads locations and exposes lookup and mutation operations", async () => {
    const locations = [
      { id: 1, name: "Shelf A", address: null, recommended: true, notes: null },
      { id: 2, name: "Shelf B", address: "Downstairs", recommended: false, notes: "Near the window" },
    ];
    mockedGetLocations.mockResolvedValue(locations);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

    renderProvider(queryClient);

    await waitFor(() => expect(locationContext.locations).toEqual(locations));

    expect(locationContext.getLocationById(1)).toEqual(locations[0]);
    expect(locationContext.getLocationById(99)).toBeNull();

    await act(async () => {
      await locationContext.createLocation({ name: "Shelf C", address: null, recommended: null, notes: null });
      await locationContext.updateLocation(1, { name: "Updated Shelf" });
      await locationContext.deleteLocation(2);
    });

    expect(mockedCreateLocation).toHaveBeenCalledWith({ name: "Shelf C", address: null, recommended: null, notes: null });
    expect(mockedUpdateLocation).toHaveBeenCalledWith(1, { name: "Updated Shelf" });
    expect(mockedDeleteLocation).toHaveBeenCalledWith(2);
    expect(invalidateQueries).toHaveBeenCalledTimes(3);
  });

  it("rejects mutations for non-editors", async () => {
    mockedUseUserContext.mockReturnValue({ isEditor: false });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    renderProvider(queryClient);
    await waitFor(() => expect(locationContext).toBeDefined());

    await expect(locationContext.createLocation({ name: "Shelf C", address: null, recommended: null, notes: null }))
      .rejects.toThrow("Editor permissions required");
    expect(mockedCreateLocation).not.toHaveBeenCalled();
  });
});
