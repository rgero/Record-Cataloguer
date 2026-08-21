import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createVinyl,
  deleteVinyl,
  getUnplayedVinyls,
  getVinyls,
  getVinylsByUserId,
  updateVinyl,
} from "@services/apiVinyls";

import { DefaultSettings } from "@interfaces/settings/DefaultSettings";
import type { User } from "@interfaces/User";
import type { Vinyl } from "@interfaces/Vinyl";

const { chain, updateMock, eqMock, fromMock, rpcMock, orderMock, selectMock, containsMock, insertMock, singleMock, resolveIdsMock } = vi.hoisted(() => {
  const updateMock = vi.fn();
  const eqMock = vi.fn();
  const fromMock = vi.fn();
  const rpcMock = vi.fn();
  const orderMock = vi.fn();
  const selectMock = vi.fn();
  const containsMock = vi.fn();
  const insertMock = vi.fn();
  const singleMock = vi.fn();
  const resolveIdsMock = vi.fn();
  const chain = {
    update: updateMock,
    eq: eqMock,
    order: orderMock,
    select: selectMock,
    contains: containsMock,
    insert: insertMock,
    single: singleMock,
  };

  return { chain, updateMock, eqMock, fromMock, rpcMock, orderMock, selectMock, containsMock, insertMock, singleMock, resolveIdsMock };
});

vi.mock("@services/supabase", () => ({
  default: {
    from: fromMock,
    rpc: rpcMock,
  },
}));

vi.mock("@services/resolveIds", () => ({
  resolveIds: resolveIdsMock,
}));


describe("apiVinyls", () => {
  const createUser = (id: string, name: string): User => ({
    id,
    name,
    editor: false,
    settings: DefaultSettings,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    fromMock.mockReturnValue(chain);
    selectMock.mockReturnValue(chain);
    containsMock.mockReturnValue(chain);
    insertMock.mockReturnValue(chain);
    eqMock.mockResolvedValue({ error: null });
    orderMock.mockResolvedValue({ data: [], error: null });
    singleMock.mockResolvedValue({ data: { id: 1 }, error: null });
    rpcMock.mockResolvedValue({ data: [], error: null });
    updateMock.mockReturnValue({ eq: eqMock });
    resolveIdsMock.mockResolvedValue({});
  });

  it("hydrates database aliases, related records, and play counts", async () => {
    orderMock.mockResolvedValue({
      data: [{
        id: 12,
        artist: "Rise Against",
        purchase_number: 4,
        purchase_date: "2024-02-03",
        owners: ["owner-1"],
        purchased_by: ["buyer-1"],
        liked_by: ["liker-1"],
        purchase_location: 8,
        double_lp: true,
        image_url: "cover.jpg",
        playlogs: [{ count: 6 }],
      }],
      error: null,
    });
    resolveIdsMock.mockImplementation((table: string) => Promise.resolve(
      table === "users"
        ? {
          "owner-1": createUser("owner-1", "Owner"),
          "buyer-1": createUser("buyer-1", "Buyer"),
          "liker-1": createUser("liker-1", "Liker"),
        }
        : { 8: { id: 8, name: "Record Store" } },
    ));

    const [vinyl] = await getVinyls();

    expect(selectMock).toHaveBeenCalledWith('*, "purchaseNumber", playlogs(count)');
    expect(orderMock).toHaveBeenCalledWith("created_at", { ascending: true });
    expect(vinyl).toMatchObject({
      purchaseNumber: 4,
      playCount: 6,
      doubleLP: true,
      imageUrl: "cover.jpg",
      owners: [{ id: "owner-1", name: "Owner" }],
      purchasedBy: [{ id: "buyer-1", name: "Buyer" }],
      likedBy: [{ id: "liker-1", name: "Liker" }],
      purchaseLocation: { id: 8, name: "Record Store" },
    });
    expect(vinyl?.purchaseDate).toEqual(new Date("2024-02-03T12:00:00"));
  });

  it("queries vinyls played by a user", async () => {
    await getVinylsByUserId("user-1");

    expect(containsMock).toHaveBeenCalledWith("playlogs.listeners", ["user-1"]);
    expect(orderMock).toHaveBeenCalledWith("created_at", { ascending: true });
  });

  it("returns no unplayed vinyls without a user id", async () => {
    await expect(getUnplayedVinyls()).resolves.toEqual([]);

    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("hydrates successful unplayed vinyl results", async () => {
    rpcMock.mockResolvedValue({ data: [{ id: 5, artist: "The Cure" }], error: null });

    await getUnplayedVinyls("user-1");

    expect(rpcMock).toHaveBeenCalledWith("get_unplayed_vinyls", { target_user_id: "user-1" });
    expect(resolveIdsMock).toHaveBeenCalledWith("users", []);
  });

  it("creates a vinyl with normalized and related ids", async () => {
    const newVinyl: Omit<Vinyl, "id"> = {
      artist: "Rise Against",
      album: "Endgame",
      purchaseDate: new Date("2024-02-03T12:00:00"),
      purchaseLocation: { id: 8, name: "Record Store", address: "", recommended: null, notes: "", percentage: 0 },
      owners: [createUser("owner-1", "Owner")],
      purchasedBy: [createUser("buyer-1", "Buyer")],
      likedBy: [createUser("liker-1", "Liker")],
      length: 46,
      doubleLP: false,
      tags: [" Punk ", "Rock"],
    };

    await createVinyl(newVinyl);

    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
      tags: ["punk", "rock"],
      purchaseDate: "2024-02-03",
      owners: ["owner-1"],
      purchasedBy: ["buyer-1"],
      likedBy: ["liker-1"],
      purchaseLocation: 8,
    }));
  });

  it("omits derived vinyl fields from the database payload", async () => {
    await updateVinyl(12, {
      artist: "Rise Against",
      purchaseNumber: 4,
      playCount: 9,
      playlogs: [{ album_id: null, listeners: [], date: new Date("2024-02-03T12:00:00") }],
      notes: "Updated notes",
    });

    expect(fromMock).toHaveBeenCalledWith("vinyls");
    expect(updateMock).toHaveBeenCalledWith({
      artist: "Rise Against",
      notes: "Updated notes",
    });
    expect(eqMock).toHaveBeenCalledWith("id", 12);
  });

  it("transforms update relationships, tags, and dates", async () => {
    await updateVinyl(12, {
      purchaseDate: new Date("2024-02-03T12:00:00"),
      owners: [createUser("owner-1", "Owner")],
      purchasedBy: [createUser("buyer-1", "Buyer")],
      likedBy: [createUser("liker-1", "Liker")],
      purchaseLocation: null,
      tags: [" Punk ", "Rock"],
    });

    expect(updateMock).toHaveBeenCalledWith({
      tags: ["punk", "rock"],
      purchaseDate: "2024-02-03",
      owners: ["owner-1"],
      purchasedBy: ["buyer-1"],
      likedBy: ["liker-1"],
      purchaseLocation: null,
    });
  });

  it("throws when a vinyl query fails", async () => {
    const queryError = new Error("query failed");
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    orderMock.mockResolvedValue({ data: null, error: queryError });

    await expect(getVinyls()).rejects.toThrow(queryError);
    expect(consoleError).toHaveBeenCalledWith(queryError);
    consoleError.mockRestore();
  });

  it("returns no unplayed vinyls when the RPC fails", async () => {
    const rpcError = new Error("rpc failed");
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    rpcMock.mockResolvedValue({ data: null, error: rpcError });

    await expect(getUnplayedVinyls("user-1")).resolves.toEqual([]);
    expect(consoleError).toHaveBeenCalledWith(rpcError);
    consoleError.mockRestore();
  });

  it("throws when creating or updating a vinyl fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    singleMock.mockResolvedValue({ data: null, error: { message: "insert failed" } });
    await expect(createVinyl({
      artist: "Artist",
      album: "Album",
      purchaseDate: new Date("2024-02-03T12:00:00"),
      purchaseLocation: null,
      owners: [],
      purchasedBy: [],
      likedBy: [],
      length: 0,
      doubleLP: false,
      tags: [],
    })).rejects.toThrow("insert failed");

    eqMock.mockResolvedValue({ error: new Error("update failed") });
    await expect(updateVinyl(12, { notes: "Updated" })).rejects.toThrow("Failed to update vinyl");
    expect(consoleError).toHaveBeenCalledTimes(2);
    consoleError.mockRestore();
  });

  it("archives a vinyl and throws when archiving fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    await deleteVinyl(12);
    expect(updateMock).toHaveBeenCalledWith({ archived: true });
    expect(eqMock).toHaveBeenCalledWith("id", 12);

    eqMock.mockResolvedValue({ error: new Error("archive failed") });
    await expect(deleteVinyl(12)).rejects.toThrow("Failed to archive vinyl");
    expect(consoleError).toHaveBeenCalledWith(expect.any(Error));
    consoleError.mockRestore();
  });
});
