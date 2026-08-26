import { beforeEach, describe, expect, it, vi } from "vitest";

import { updateLocation } from "@services/apiLocations";

const { eqMock, fromMock, updateMock } = vi.hoisted(() => {
  const eqMock = vi.fn();
  const fromMock = vi.fn();
  const updateMock = vi.fn();
  return { eqMock, fromMock, updateMock };
});

vi.mock("@services/supabase", () => ({
  default: {
    from: fromMock,
  },
}));

describe("apiLocations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fromMock.mockReturnValue({ update: updateMock });
    updateMock.mockReturnValue({ eq: eqMock });
    eqMock.mockResolvedValue({ error: null });
  });

  it("omits derived purchase count and relationship data when updating a location", async () => {
    await updateLocation(12, {
      name: "Record Store",
      address: "123 Main Street",
      purchaseCount: 8,
      vinyls: [{ count: 8 }],
    });

    expect(fromMock).toHaveBeenCalledWith("locations");
    expect(updateMock).toHaveBeenCalledWith({
      name: "Record Store",
      address: "123 Main Street",
    });
    expect(eqMock).toHaveBeenCalledWith("id", 12);
  });
});
