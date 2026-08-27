import { Autocomplete, Box, FormLabel, Grid, TextField, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import FloatingAction from "@components/ui/FloatingAction";
import FormActions from "@components/ui/forms/FormActions";
import FormAdornment from "@components/ui/forms/FormAdornment";
import FormHeader from "@components/ui/forms/FormHeader";
import type { PlayLog } from "@interfaces/PlayLog";
import { format } from 'date-fns';
import toast from "react-hot-toast";
import useCombinedLoading from "@hooks/useCombinedLoading";
import { useDialogProvider } from "@context/dialog/DialogContext";
import { useNavigate } from "react-router-dom";
import { usePlaylogContext } from "@context/playlogs/PlaylogContext";
import { useUserContext } from "@context/users/UserContext";
import { useVinylContext } from "@context/vinyl/VinylContext";

type PlaylogFormModel = Omit<PlayLog, "id"> & { id?: number };

type PlaylogFormErrors = {
  album_id?: string;
};

const emptyPlaylog: PlaylogFormModel = {
  album_id: null,
  listeners: [],
  date: new Date(),
  notes: "",
};

interface PlaylogFormProps {
  playlog?: PlaylogFormModel | null;
}

const PlaylogForm = ({ playlog = null }: PlaylogFormProps) => {
  const { openDeleteDialog } = useDialogProvider();
  const { updatePlaylog, createPlaylog, deletePlaylog } = usePlaylogContext();
  const { isLoading: isVinylLoading, vinyls = [], getVinylById } = useVinylContext();
  const { isLoading: usersLoading, editorUsers, isEditor } = useUserContext();
  const navigate = useNavigate();

  const isCreateMode = !playlog;

  const isFormLoading = useCombinedLoading([usersLoading]);

  const [inEdit, setIsInEdit] = useState<boolean>(isCreateMode);
  const [formData, setFormData] = useState<PlaylogFormModel | null>(playlog ?? emptyPlaylog);
  const [errors, setErrors] = useState<PlaylogFormErrors>({});

  useEffect(() => {
    if (playlog) {
      setFormData(playlog);
      setIsInEdit(false);
      setErrors({});
    }
  }, [playlog]);

  // Find the full vinyl object safely using the context helper method (which searches archived items too)
  const selectedVinyl = useMemo(() => {
    if (!formData?.album_id) return null;
    return getVinylById(formData.album_id);
  }, [getVinylById, formData?.album_id]);

  // Dynamically compute autocomplete choices. Only append the selected vinyl to the active dropdown list if it's archived.
  const autocompleteOptions = useMemo(() => {
    if (selectedVinyl && !vinyls.some((v) => v.id === selectedVinyl.id)) {
      return [...vinyls, selectedVinyl];
    }
    return vinyls;
  }, [vinyls, selectedVinyl]);

  const validateForm = () => {
    const nextErrors: PlaylogFormErrors = {};

    if (!formData?.album_id) {
      nextErrors.album_id = "Select a vinyl record.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  if (isVinylLoading) return <Typography sx={{ p: 4 }}>Loading collection...</Typography>;
  if (!isCreateMode && (isFormLoading || !formData)) return <Typography sx={{ p: 4 }}>Loading playlog...</Typography>;
  if (!formData) return null;

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fix the highlighted fields before saving.");
      return;
    }

    const payload = { ...formData, album_id: formData.album_id as number } as PlayLog;
    try {
      if (isCreateMode) {
        const forCreate = { ...formData };
        delete forCreate.id;
        await createPlaylog(forCreate);
        toast.success("Playlog created successfully!");
        navigate(`/plays`);
      } else {
        if (playlog.id === undefined) return;
        await updatePlaylog(playlog.id, payload);
        setIsInEdit(false);
        toast.success("Playlog updated successfully!");
      }
    } catch (error) {
      toast.error(`Failed to save playlog.`);
      console.error(error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!playlog || playlog.id === undefined) return;

    try {
      await deletePlaylog(playlog.id);
      toast.success("Playlog deleted.");
      navigate("/plays");
    } catch (error) {
      toast.error("Failed to delete playlog.");
      console.error(error);
    }
  };

  const handleCancel = () => {
    if (isCreateMode) {
      navigate(-1);
    } else {
      setFormData(playlog);
      setIsInEdit(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', p: 3, pb: 10, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 3, boxShadow: 1 }}>
      <FormHeader
        isCreateMode={isCreateMode}
        rightAdornment={
          <FormAdornment
            mode={isCreateMode ? "create" : "edit"}
            isEditing={inEdit}
            isEditor={isEditor}
            onCancel={handleCancel}
            onDelete={() => openDeleteDialog({
              name: `${selectedVinyl?.artist || 'Unknown'} - ${selectedVinyl?.album || 'Unknown'}`,
              type: "Playlog"
            }, handleConfirmDelete)}
            onEdit={() => setIsInEdit(true)}
            onSave={handleSave}
            saveDisabled={!formData.album_id}
            createLabel="Create Play"
          />
        }
      />
      <Grid container spacing={3}>
        
        {/* Unified Vinyl Autocomplete */}
        <Grid size={12}>
          <FormLabel sx={{ mb: 1, display: 'block', fontWeight: 'bold' }}>
            Vinyl Record <span aria-hidden="true">*</span>
          </FormLabel>
          <Autocomplete
            disabled={!inEdit}
            options={autocompleteOptions}
            getOptionLabel={(option) => `${option.artist} - ${option.album}${option.archived ? " (Archived)" : ""}`}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={selectedVinyl ?? null}
            onChange={(_event, newValue) => {
              setErrors((prev) => ({ ...prev, album_id: undefined }));
              setFormData({
                ...formData, 
                album_id: newValue?.id ?? null,
              });
            }}
            renderInput={(params) => (
              <TextField 
                {...params} 
                placeholder="Search by artist or album..." 
                fullWidth 
                error={Boolean(errors.album_id)}
                helperText={errors.album_id ?? "Required to create a play."}
                required
              />
            )}
          />
        </Grid>

        {/* Multi-Select Listeners */}
        <Grid size={12}>
          <FormLabel sx={{ mb: 1, display: 'block', fontWeight: 'bold' }}>Listener(s)</FormLabel>
          <Autocomplete
            multiple
            disabled={!inEdit}
            options={editorUsers}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={formData.listeners || []}
            onChange={(_event, newValue) => {
              setFormData({ ...formData, listeners: newValue });
            }}
            renderInput={(params) => (
              <TextField {...params} placeholder={inEdit && formData.listeners?.length === 0 ? "Select Listeners" : ""} />
            )}
          />
        </Grid>

        {/* Date Field */}
        <Grid size={12}>
          <FormLabel sx={{ mb: 1, display: 'block', fontWeight: 'bold' }}>Date</FormLabel>
          <TextField
            type="date"
            value={formData.date ? format(new Date(formData.date), 'yyyy-MM-dd') : ""}
            onChange={(e) => {
              const selectedDate = new Date(e.target.value + 'T00:00:00');
              setFormData({ ...formData, date: selectedDate });
            }}
            fullWidth
            disabled={!inEdit}
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

        {/* Form Actions */}
        <Grid size={12} sx={{ mt: 2 }}>
          <FormActions
            mode={isCreateMode ? "create" : "edit"}
            isEditing={inEdit}
            isEditor={isEditor}
            onCancel={handleCancel}
            onDelete={() => openDeleteDialog({
              name: `${selectedVinyl?.artist || 'Unknown'} - ${selectedVinyl?.album || 'Unknown'}`,
              type: "Playlog"
            }, handleConfirmDelete)}
            onEdit={() => setIsInEdit(true)}
            onSave={handleSave}
            saveDisabled={!formData.album_id}
          />
        </Grid>
      </Grid>
      <FloatingAction fallbackPath="/plays" />
    </Box>
  );
};

export default PlaylogForm;