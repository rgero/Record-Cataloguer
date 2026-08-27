import { Autocomplete, Box, Checkbox, Chip, FormLabel, Grid, MenuItem, Select, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import AlbumImagePresenter from "@components/ui/AlbumImagePresenter";
import FloatingAction from "@components/ui/FloatingAction";
import FormActions from "@components/ui/FormActions";
import FormHeader from "@components/ui/FormHeader";
import SuspenseFormWrapper from "@components/ui/SuspenseFormWrapper";
import type { Vinyl } from "@interfaces/Vinyl"
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useCombinedLoading } from "@hooks/useCombinedLoading";
import { useDialogProvider } from "@context/dialog/DialogContext";
import { useLocationContext } from "@context/location/LocationContext";
import { useUserContext } from "@context/users/UserContext";
import { useVinylContext } from "@context/vinyl/VinylContext";
import { useWantedItemContext } from "@context/wanted/WantedItemContext";

interface VinylFormData extends Vinyl {
  wantedID?: number;
}

type VinylFormErrors = {
  artist?: string;
  album?: string;
  length?: string;
  price?: string;
};

const emptyVinyl: VinylFormData = {
  artist: "",
  album: "",
  color: "Black",
  price: 0,
  purchaseDate: new Date(),
  purchaseLocation: null,
  purchasedBy: [],
  owners: [],
  notes: "",
  length: 0,
  likedBy: [],
  imageUrl: "",
  doubleLP: false,
  tags: []
};

interface VinylFormProps {
  vinyl?: Vinyl | null;
}

const VinylForm = ({ vinyl = null }: VinylFormProps) => {
  const { openDeleteDialog } = useDialogProvider();
  const { updateVinyl, createVinyl, deleteVinyl } = useVinylContext();
  const { isLoading: locationsLoading, locations } = useLocationContext();
  const { isLoading: usersLoading, editorUsers, isEditor } = useUserContext();
  const { deleteWantedItem } = useWantedItemContext();
  const navigate = useNavigate();
  const location = useLocation();

  const isCreateMode = !vinyl;
  const isFormLoading = useCombinedLoading([locationsLoading, usersLoading]);

  const [inEdit, setIsInEdit] = useState<boolean>(isCreateMode);
  const [formData, setFormData] = useState<VinylFormData | null>(() => {
    if (!vinyl) {
      const state = location.state as { fromWantItem?: Partial<VinylFormData> } | null;
      const transferredData = state?.fromWantItem;
      return { ...emptyVinyl, ...transferredData };
    }
    return vinyl;
  });
  const [errors, setErrors] = useState<VinylFormErrors>({});
  
  const [deleteFromWanted, setDeleteFromWanted] = useState<boolean>(false);

  useEffect(() => {
    if (vinyl) {
      setFormData(vinyl);
      setIsInEdit(false);
      setErrors({});
    }
  }, [vinyl]);

  const validateForm = () => {
    const nextErrors: VinylFormErrors = {};
    if (!formData) return false;

    if (!formData.artist.trim()) {
      nextErrors.artist = "Artist is required.";
    }

    if (!formData.album.trim()) {
      nextErrors.album = "Album is required.";
    }

    if (Number.isNaN(formData.length) || formData.length < 0) {
      nextErrors.length = "Length must be zero or greater.";
    }

    if (formData.price != null && (Number.isNaN(formData.price) || formData.price < 0)) {
      nextErrors.price = "Price must be zero or greater.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  if (!isCreateMode && isFormLoading) {
    return <SuspenseFormWrapper />;
  }
  
  if (!formData) return null;

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fix the highlighted fields before saving.");
      return;
    }

    try {
      const { wantedID, ...vinylData } = formData;
      if (isCreateMode) {
        await createVinyl(vinylData);
        if (deleteFromWanted && wantedID) {
          await deleteWantedItem(wantedID);
        }
        toast.success("Vinyl created successfully!");
        navigate(`/vinyls`);
      } else {
        if (vinyl.id === undefined) return;

        await updateVinyl(vinyl.id, vinylData);
        setIsInEdit(false);
        toast.success("Vinyl updated successfully!");
      }
    } catch (error) {
      toast.error(`Failed to ${isCreateMode ? 'create' : 'update'} vinyl.`);
      console.error(error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!vinyl || vinyl.id === undefined) return;

    try {
      await deleteVinyl(vinyl.id);
      toast.success("Vinyl deleted.");
      navigate("/vinyls");
    } catch (error) {
      toast.error("Failed to delete vinyl.");
      console.error(error);
    }
  };

  const handleCancel = () => {
    if (isCreateMode) {
      navigate(-1);
    } else {
      setFormData(vinyl);
      setIsInEdit(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', p: 3, pb: 10, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 3, boxShadow: 1 }}>
      <FormHeader isCreateMode={isCreateMode} />
      <Grid container spacing={3}>
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
            placeholder="Enter artist name"
            error={Boolean(errors.artist)}
            helperText={errors.artist}
          />
        </Grid>

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
            placeholder="Enter album name"
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
            editable={inEdit} 
          />
        </Grid>        

        <Grid size={12}>
          <FormLabel sx={{ mb: 1, display: 'block', fontWeight: 'bold' }}>Color</FormLabel>
          <TextField
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            fullWidth
            disabled={!inEdit}
            placeholder="Enter album color"
          />
        </Grid>

        <Grid size={12} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <FormLabel
            htmlFor="double-lp-checkbox"
            sx={{ fontWeight: 'bold', cursor: inEdit ? 'pointer' : 'default' }}
          >
            Is Double LP?
          </FormLabel>
          <Checkbox
            id="double-lp-checkbox"
            checked={formData.doubleLP}
            disabled={!inEdit}
            onChange={(e) => setFormData({ ...formData, doubleLP: e.target.checked })}
            sx={{ pr: 0 }}
          />
        </Grid>

        <Grid size={12}>
          <FormLabel sx={{ mb: 1, display: 'block', fontWeight: 'bold' }}>Owner(s)</FormLabel>
          <Autocomplete
            multiple
            disabled={!inEdit}
            options={editorUsers}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={formData.owners}
            onChange={(_event, newValue) => {
              setFormData({ ...formData, owners: newValue });
            }}
            renderInput={(params) => (
              <TextField {...params} placeholder={inEdit ? "Select owners" : ""} />
            )}
            renderValue={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip label={option.name} {...getTagProps({ index })} key={option.id} />
              ))
            }
          />
        </Grid>

        <Grid size={12}>
          <FormLabel sx={{ mb: 1, display: 'block', fontWeight: 'bold' }}>Length (minutes)</FormLabel>
          <TextField
            type="number"
            value={formData.length || ''}
            onChange={(e) => {
              setErrors((prev) => ({ ...prev, length: undefined }));
              setFormData({ ...formData, length: e.target.value ? Number(e.target.value) : 0 });
            }}
            fullWidth
            disabled={!inEdit}
            placeholder="Enter length in minutes"
            error={Boolean(errors.length)}
            helperText={errors.length}
          />
        </Grid>

        <Grid size={12}>
          <FormLabel sx={{ mb: 1, display: 'block', fontWeight: 'bold' }}>Price ($)</FormLabel>
          <TextField
            type="number"
            // Displays empty string when 0 during edit to allow full deletion
            value={inEdit && formData.price === 0 ? '' : formData.price}
            onChange={(e) => {
              const val = e.target.value;
              setErrors((prev) => ({ ...prev, price: undefined }));
              setFormData({ 
                ...formData, 
                price: val === '' ? 0 : Number(val) 
              });
            }}
            onBlur={() => {
              // Standardizes to 0 if left empty on blur
              if (!formData.price) setFormData({ ...formData, price: 0 });
            }}
            fullWidth
            disabled={!inEdit}
            placeholder="0.00"
            slotProps={{
              htmlInput: { step: "0.01" } //  Correct for MUI v6
            }}
            error={Boolean(errors.price)}
            helperText={errors.price}
          />
        </Grid>

        <Grid size={12}>
          <FormLabel sx={{ mb: 1, display: 'block', fontWeight: 'bold' }}>Notes</FormLabel>
          <TextField
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            fullWidth
            multiline
            rows={4}
            disabled={!inEdit}
            placeholder="Add any specific details here..."
          />
        </Grid>

        <Grid size={12}>
          <FormLabel sx={{ mb: 1, display: 'block', fontWeight: 'bold' }}>Purchase Location</FormLabel>
          <Select
            value={formData.purchaseLocation ? formData.purchaseLocation.id : ""}
            onChange={(e) => setFormData({ ...formData, purchaseLocation: locations.find(l => l.id === Number(e.target.value)) ?? null })}
            fullWidth
            disabled={!inEdit}
          >
            {[...locations].sort((a, b) => a.name.localeCompare(b.name)).map((location) => (
              <MenuItem key={location.id} value={location.id}>
                {location.name}
              </MenuItem>
            ))}
          </Select>
        </Grid>

        <Grid size={12}>
          <FormLabel sx={{ mb: 1, display: 'block', fontWeight: 'bold' }}>Purchased Date</FormLabel>
          <TextField
            type="date"
            value={formData.purchaseDate ? format(formData.purchaseDate, 'yyyy-MM-dd') : ""}
            onChange={(e) => {
              const selectedDate = new Date(e.target.value + 'T00:00:00');
              setFormData({ ...formData, purchaseDate: selectedDate });
            }}
            fullWidth
            disabled={!inEdit}
            slotProps={{
              inputLabel: { shrink: true }
            }}
          />
        </Grid>

        <Grid size={12}>
          <FormLabel sx={{ mb: 1, display: 'block', fontWeight: 'bold' }}>Purchased By</FormLabel>
          <Autocomplete
            multiple
            disabled={!inEdit}
            options={editorUsers}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={formData.purchasedBy}
            onChange={(_event, newValue) => {
              setFormData({ ...formData, purchasedBy: newValue });
            }}
            renderInput={(params) => (
              <TextField {...params} placeholder={inEdit ? "Select Buyer" : ""} />
            )}
            renderValue={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip label={option.name} {...getTagProps({ index })} key={option.id} />
              ))
            }
          />
        </Grid>

        <Grid size={12}>
          <FormLabel sx={{ mb: 1, display: 'block', fontWeight: 'bold' }}>Liked By</FormLabel>
          <Autocomplete
            multiple
            disabled={!inEdit}
            options={editorUsers}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={formData.likedBy}
            onChange={(_event, newValue) => {
              setFormData({ ...formData, likedBy: newValue });
            }}
            renderInput={(params) => (
              <TextField {...params} placeholder={inEdit ? "Select liked by" : ""} />
            )}
            renderValue={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip label={option.name} {...getTagProps({ index })} key={option.id} />
              ))
            }
          />
        </Grid>

        <Grid size={12}>
          <FormLabel sx={{ mb: 1, display: 'block', fontWeight: 'bold' }}>Tags</FormLabel>
          <Autocomplete
            multiple
            freeSolo
            disabled={!inEdit}
            options={[]} 
            value={formData.tags || []} 
            onChange={(_event, newValue) => {
              setFormData({ ...formData, tags: newValue });
            }}
            renderValue={(value: string[], getTagProps) =>
              value.map((option: string, index: number) => (
                <Chip 
                  label={option} 
                  {...getTagProps({ index })} 
                  key={index} 
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={inEdit ? "Type tag and press Enter" : ""}
              />
            )}
          />
        </Grid>

        {formData.wantedID && (
          <Grid size={12} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <FormLabel
              htmlFor="delete-from-wanted-checkbox"
              sx={{ fontWeight: 'bold', cursor: inEdit ? 'pointer' : 'default' }}
            >
              Delete from Wanted list?
            </FormLabel>
            <Checkbox
              id="delete-from-wanted-checkbox"
              checked={deleteFromWanted}
              disabled={!inEdit}
              onChange={(e) => setDeleteFromWanted(e.target.checked)}
            />
          </Grid>
        )}

        <Grid size={12} sx={{ mt: 2 }}>
          <FormActions
            mode={isCreateMode ? "create" : "edit"}
            isEditing={inEdit}
            isEditor={isEditor}
            onCancel={handleCancel}
            onDelete={() => openDeleteDialog({ name: `${formData.artist} - ${formData.album}`, type: "Vinyl" }, handleConfirmDelete)}
            onEdit={() => setIsInEdit(true)}
            onSave={handleSave}
          />
        </Grid>
      </Grid>
      <FloatingAction fallbackPath="/vinyls" />
    </Box>
  );
};

export default VinylForm;