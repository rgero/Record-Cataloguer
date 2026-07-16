import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { DialogProvider } from "@context/dialog/DialogProvider";
import { useDialogProvider } from "@context/dialog/DialogContext";

vi.mock("@components/dialogs/DeleteDialog", () => ({
  default: () => <div data-testid="mock-delete-dialog" />
}));

vi.mock("@components/dialogs/SettingsDialog", () => ({
  default: () => <div data-testid="mock-settings-dialog" />
}));

vi.mock("@components/dialogs/StatsSettingsDialog", () => ({
  default: () => <div data-testid="mock-stats-dialog" />
}));

vi.mock("@components/dialogs/ColumnFilterDialog", () => ({
  default: () => <div data-testid="mock-column-filter-dialog" />
}));

vi.mock("@components/dialogs/ColumnVisibilityDialog", () => ({
  default: () => <div data-testid="mock-column-visibility-dialog" />
}));

const TestConsumer = () => {
  const { openDeleteDialog, toggleSettingsDialog, deleteDialogOpen, settingsDialogOpen } = useDialogProvider();

  return (
    <div>
      <div data-testid="delete-status">{deleteDialogOpen ? "Open" : "Closed"}</div>
      <div data-testid="settings-status">{settingsDialogOpen ? "Open" : "Closed"}</div>
      
      <button onClick={() => openDeleteDialog({name: "Delete Item", type: ""}, () => console.log("Deleted"))}>
        Open Delete
      </button>
      <button onClick={toggleSettingsDialog}>
        Toggle Settings
      </button>
    </div>
  );
};

describe("DialogProvider", () => {
  it("provides default values and updates delete dialog state", () => {
    render(
      <DialogProvider>
        <TestConsumer />
      </DialogProvider>
    );

    // Assert initial state
    expect(screen.getByTestId("delete-status")).toHaveTextContent("Closed");

    // Trigger update
    fireEvent.click(screen.getByText("Open Delete"));

    // Assert updated state
    expect(screen.getByTestId("delete-status")).toHaveTextContent("Open");
  });

  it("toggles the settings dialog state", () => {
    render(
      <DialogProvider>
        <TestConsumer />
      </DialogProvider>
    );

    const toggleBtn = screen.getByText("Toggle Settings");
    const status = screen.getByTestId("settings-status");

    expect(status).toHaveTextContent("Closed");
    
    fireEvent.click(toggleBtn);
    expect(status).toHaveTextContent("Open");
    
    fireEvent.click(toggleBtn);
    expect(status).toHaveTextContent("Closed");
  });

  it("correctly stores and executes the confirmAction", async () => {
    const mockAction = vi.fn();
    
    const ActionConsumer = () => {
      const { openDeleteDialog, confirmAction } = useDialogProvider();
      return (
        <>
          <button onClick={() => openDeleteDialog({name: "Test", type: ""}, mockAction)}>Set Action</button>
          <button onClick={() => confirmAction()}>Run Action</button>
        </>
      );
    };

    render(
      <DialogProvider>
        <ActionConsumer />
      </DialogProvider>
    );

    fireEvent.click(screen.getByText("Set Action"));
    fireEvent.click(screen.getByText("Run Action"));

    expect(mockAction).toHaveBeenCalledTimes(1);
  });
});