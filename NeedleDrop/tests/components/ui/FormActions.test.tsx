import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import FormAdornment from "@components/ui/forms/FormAdornment";

const createProps = () => ({
  onCancel: vi.fn(),
  onDelete: vi.fn(),
  onEdit: vi.fn(),
  onSave: vi.fn(),
});

describe("FormActions", () => {
  it("shows Edit and hides the action group before editing", () => {
    render(
      <FormAdornment
        {...createProps()}
        mode="edit"
        isEditing={false}
        isEditor={true}
      />,
    );

    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cancel" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Save Changes" })).not.toBeInTheDocument();
  });

  it("calls Edit when the Edit icon is clicked", () => {
    const props = createProps();

    render(
      <FormAdornment
        {...props}
        mode="edit"
        isEditing={false}
        isEditor={true}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    expect(props.onEdit).toHaveBeenCalledOnce();
  });

  it("shows edit-mode actions and calls each action callback", () => {
    const props = createProps();

    render(
      <FormAdornment
        {...props}
        mode="edit"
        isEditing={true}
        isEditor={true}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(props.onCancel).toHaveBeenCalledOnce();
    expect(props.onDelete).toHaveBeenCalledOnce();
    expect(props.onSave).toHaveBeenCalledOnce();
    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
  });

  it("shows the create label and omits Delete in create mode", () => {
    const props = createProps();

    render(
      <FormAdornment
        {...props}
        mode="create"
        isEditing={true}
        isEditor={true}
        createLabel="Create Location"
      />,
    );

    expect(screen.getByRole("button", { name: "Create Location" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
  });

  it("disables Save when requested", () => {
    render(
      <FormAdornment
        {...createProps()}
        mode="create"
        isEditing={true}
        isEditor={true}
        saveDisabled={true}
      />,
    );

    expect(screen.getByRole("button", { name: "Create" })).toBeDisabled();
  });
});