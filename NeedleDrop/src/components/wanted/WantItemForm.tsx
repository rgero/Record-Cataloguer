import { Autocomplete, Box, Chip, FormLabel, Grid, IconButton, MenuItem, Select, TextField } from "@mui/material";
import { useEffect, useState } from "react";

import AlbumImagePresenter from "@components/ui/AlbumImagePresenter";
import { DriveFileMove } from "@mui/icons-material";
import FloatingAction from "@components/ui/FloatingAction";
import FormActions from "@components/ui/forms/FormActions";
import FormAdornment from "@components/ui/forms/FormAdornment";
import FormHeader from "@components/ui/forms/FormHeader";
import SuspenseFormWrapper from "@components/ui/SuspenseFormWrapper";
import type { WantedItem } from "@interfaces/WantedItem";
import toast from "react-hot-toast";
import { useCombinedLoading } from "@hooks/useCombinedLoading";
import { useDialogProvider } from "@context/dialog/DialogContext";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "@context/users/UserContext";
import { useWantedItemContext } from "@context/wanted/WantedItemContext";

type WantItemFormErrors = {
  artist?: string;
  album?: string;
};

const emptyWant : WantedItem = {
  artist: "",
  album: "",
  searcher: [],
  notes: "",
  imageUrl: "",
  weight: "Medium",
  created_at: new Date(),
}


interface WantItemFormProps {
  wantedItem?: WantedItem | null;
}

const WantItemForm = ({ wantedItem = null }: WantItemFormProps) => {
  const navigate = useNavigate();
  const { openDeleteDialog } = useDialogProvider();
  const { isLoading: usersLoading, editorUsers, isEditor } = useUserContext();
  const { updateWantedItem, createWantedItem, deleteWantedItem } = useWantedItemContext();
  
  const isCreateMode = !wantedItem;
  const isFormLoading = useCombinedLoading([usersLoading]);

  const [inEdit, setIsInEdit] = useState<boolean>(isCreateMode);
  const [formData, setFormData] = useState<WantedItem | null>(wantedItem ?? emptyWant);
  const [errors, setErrors] = useState<WantItemFormErrors>({});

  const validateForm = () => {
    const nextErrors: WantItemFormErrors = {};

    if (!formData?.artist.trim()) {
      nextErrors.artist = "Artist is required.";
    }

    if (!formData?.album.trim()) {
      nextErrors.album = "Album is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  useEffect(() => {
    if (wantedItem) {
      setFormData(wantedItem);
      setIsInEdit(false);
      setErrors({});
    }
  }, [wantedItem]);

  if (!isCreateMode && isFormLoading) {
    return <SuspenseFormWrapper><div>Loading...</div></SuspenseFormWrapper>;
  }

  if (!formData) return <div>Loading...</div>;

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fix the highlighted fields before saving.");
      return;
    }

    try {
      if (isCreateMode) {
        await createWantedItem(formData);
        toast.success("Wanted Item created successfully!");
        navigate(`/wantlist`);
      } else {
        if (wantedItem.id === undefined) return;
        await updateWantedItem(wantedItem.id, formData);
        setIsInEdit(false);
        toast.success("Wanted Item updated successfully!");
      }
    } catch (error) {
      toast.error(`Failed to ${isCreateMode ? 'create' : 'update'} wanteditem.`);
      console.error(error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!wantedItem || wantedItem.id === undefined) return;

    try {
      await deleteWantedItem(wantedItem.id);
      toast.success("Wanted item deleted.");
      navigate("/wantlist");
    } catch (error) {
      toast.error("Failed to delete wanted item.");
      console.error(error);
    }
  };
  
  const handleCancel = () => {
    if (isCreateMode) {
      navigate(-1);
    } else {
      setFormData(wantedItem);
      setIsInEdit(false);
    }
  };

  const handleConvertToVinyl = () => {
    if (!wantedItem || wantedItem.id === undefined) return;

    navigate("/vinyls/create", { 
      state: { 
        fromWantItem: {
          wantedID: wantedItem.id,
          artist: formData.artist,
          album: formData.album,
          notes: formData.notes,
          imageUrl: formData.imageUrl
        } 
      } 
    });
  };

  const rightAdornment = (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <FormAdornment
        mode={isCreateMode ? "create" : "edit"}
        isEditing={inEdit}
        isEditor={isEditor}
        onCancel={handleCancel}
        onDelete={() => openDeleteDialog({ name: `${formData.artist} - ${formData.album}`, type: "Want Item" }, handleConfirmDelete)}
        onEdit={() => setIsInEdit(true)}
        onSave={handleSave}
        createLabel="Create Wanted Item"
      />
      {!isCreateMode && isEditor && (
        <IconButton onClick={handleConvertToVinyl} aria-label="Convert to vinyl">
          <DriveFileMove/>
        </IconButton>
      )}
    </Box>
  )
  
  return (
    <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', p: 3, pb: 10, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 3, boxShadow: 1 }}>
      <FormHeader isCreateMode={isCreateMode} rightAdornment={rightAdornment} />
      <Grid container spacing={3}>
        {/* Artist Field */}
        <Grid size={12}>
          <FormLabel sx={{ mb: 1, display: 'block', fontWeight: 'bold' }}>Artist</FormLabel>
          <TextField
            value={formData.artist}
            onChange={(e) => {
              setErrors((prev) => ({ ...prev, artist: undefined }));
              setFormData({ ...formData, artist: e.target.value });
            }}
            fullWidth
            disabled={!inEdit}
            error={Boolean(errors.artist)}
            helperText={errors.artist}
          />
        </Grid>

        {/* Album Field */}
        <Grid size={12}>
          <FormLabel sx={{ mb: 1, display: 'block', fontWeight: 'bold' }}>Album</FormLabel>
          <TextField
            value={formData.album}
            onChange={(e) => {
              setErrors((prev) => ({ ...prev, album: undefined }));
              setFormData({ ...formData, album: e.target.value });
            }}
            fullWidth
            disabled={!inEdit}
            error={Boolean(errors.album)}
            helperText={errors.album}
          />
        </Grid>

        <Grid size={12}>
          <FormLabel sx={{ mb: 1, display: 'block', fontWeight: 'bold' }}>Album Art</FormLabel>
          <AlbumImagePresenter 
            targetURL={formData.imageUrl} 
            altText={`${formData.artist} - ${formData.album}`}
            onImageChange={(newUrl) => setFormData({ ...formData, imageUrl: newUrl })}
            editable={inEdit} // Pass the form's edit state here
          />
        </Grid>

        {/* Multi-Select Searchers */}
        <Grid size={12}>
          <FormLabel sx={{ mb: 1, display: 'block', fontWeight: 'bold' }}>Searcher(s)</FormLabel>
          <Autocomplete
            multiple
            disabled={!inEdit}
            options={editorUsers}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={formData.searcher}
            onChange={(_event, newValue) => {
              setFormData({ ...formData, searcher: newValue });
            }}
            renderInput={(params) => (
              <TextField {...params} placeholder={inEdit ? "Select Searchers" : ""} />
            )}
            renderValue={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip label={option.name} {...getTagProps({ index })} key={option.id} />
              ))
            }
          />
        </Grid>

        {/* Notes Field */}
        <Grid size={12}>
          <FormLabel sx={{ mb: 1, display: 'block', fontWeight: 'bold' }}>Notes</FormLabel>
          <TextField
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            fullWidth
            disabled={!inEdit}
            multiline
            rows={4}
          />
        </Grid>

        {/* Weight Field */}
        <Grid size={12}>
          <FormLabel sx={{ mb: 1, display: "block", fontWeight: "bold" }}>
            Priority
          </FormLabel>
          <Select
            fullWidth
            value={formData.weight}
            disabled={!inEdit}
            onChange={(e) =>
              setFormData({
                ...formData,
                weight: e.target.value as WantedItem["weight"],
              })
            }
          >
            <MenuItem value="Low">Low</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="High">High</MenuItem>
          </Select>
        </Grid>

        {/* Form Actions */}
        <Grid size={12} sx={{ mt: 2 }}>
          <FormActions
            mode={isCreateMode ? "create" : "edit"}
            isEditing={inEdit}
            isEditor={isEditor}
            onCancel={handleCancel}
            onDelete={() => openDeleteDialog({ name: `${formData.artist} - ${formData.album}`, type: "Want Item" }, handleConfirmDelete)}
            onEdit={() => setIsInEdit(true)}
            onSave={handleSave}
            createLabel="Create Wanted Item"
          />
        </Grid>
      </Grid>
      <FloatingAction fallbackPath="/wantlist"/>
    </Box>
  );
};

export default WantItemForm;