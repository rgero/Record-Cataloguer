import { Autocomplete, Box, Button, FormLabel, Grid, TextField, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import FloatingAction from "@components/ui/FloatingAction";
import FormHeader from "@components/ui/FormHeader";
import type { PlayLog } from "@interfaces/PlayLog";
import { format } from 'date-fns';
import toast from "react-hot-toast";
import useCombinedLoading from "@hooks/useCombinedLoading";
import { useDialogProvider } from "@context/dialog/DialogContext";
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
};

const PlaylogForm = () => {
  const { id } = useParams();
  const { openDeleteDialog } = useDialogProvider();
  const { isLoading, getPlaylogById, updatePlaylog, createPlaylog, deletePlaylog } = usePlaylogContext();
  const { isLoading: isVinylLoading, vinyls = [] } = useVinylContext();
  const { isLoading: usersLoading, editorUsers, isEditor } = useUserContext();
  const navigate = useNavigate();

  const isCreateMode = !id || id === 'new';

    const isFormLoading = useCombinedLoading([isLoading, usersLoading]);

  const [inEdit, setIsInEdit] = useState<boolean>(isCreateMode);
  const [formData, setFormData] = useState<PlaylogFormModel | null>(isCreateMode ? emptyPlaylog : null);
  const [errors, setErrors] = useState<PlaylogFormErrors>({});

  const currentPlaylog = !isCreateMode ? getPlaylogById(Number(id)) : null;

  useEffect(() => {
    if (!isCreateMode && currentPlaylog && !formData) {
      setFormData(currentPlaylog);
    }
  }, [currentPlaylog, isCreateMode, formData]);

  useEffect(() => {
    if (!isCreateMode && !isFormLoading && !currentPlaylog) {
      toast.error("The requested playlog could not be found.", {
        id: "missing-play-error",
      });
      navigate("/plays", { replace: true });
    }
  }, [isCreateMode, isFormLoading, currentPlaylog, navigate]);

  // Find the full vinyl object based on the album_id in formData
  const selectedVinyl = useMemo(() => {
    if (!formData?.album_id) return null;
    return vinyls.find((v) => v.id === formData.album_id) || null;
  }, [vinyls, formData?.album_id]);

  const validateForm = () => {
    const nextErrors: PlaylogFormErrors = {};

    if (!formData?.album_id) {
      nextErrors.album_id = "Select a vinyl record.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  if (isVinylLoading) return <Typography sx={{ p: 4 }}>Loading collection...</Typography>;
  if (!isCreateMode && (isLoading || usersLoading || !formData)) return <Typography sx={{ p: 4 }}>Loading playlog...</Typography>;
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
        await updatePlaylog(Number(id), payload);
        setIsInEdit(false);
        toast.success("Playlog updated successfully!");
      }
    } catch (error) {
      toast.error(`Failed to save playlog.`);
      console.error(error);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deletePlaylog(Number(id));
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
      setFormData(currentPlaylog);
      setIsInEdit(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', p: 3, pb: 10, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 3, boxShadow: 1 }}>
      <FormHeader isCreateMode={isCreateMode} />
      <Grid container spacing={3}>
        
        {/* Unified Vinyl Autocomplete */}
        <Grid size={12}>
          <FormLabel sx={{ mb: 1, display: 'block', fontWeight: 'bold' }}>
            Vinyl Record <span aria-hidden="true">*</span>
          </FormLabel>
          <Autocomplete
            disabled={!inEdit}
            options={vinyls}
            getOptionLabel={(option) => `${option.artist} - ${option.album}`}
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

        {/* Action Buttons */}
        <Grid size={12} sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
          {inEdit ? (
            <>
              <Button variant="outlined" size="large" onClick={handleCancel}>Cancel</Button>
              {!isCreateMode && (
                <Button 
                  variant="contained" 
                  size="large" 
                  onClick={() => openDeleteDialog({
                    name: `${selectedVinyl?.artist || 'Unknown'} - ${selectedVinyl?.album || 'Unknown'}`, 
                    type: "Playlog"
                  }, handleConfirmDelete)} 
                  color="error"
                >
                  Delete
                </Button>
              )}
              <Button 
                variant="contained" 
                size="large" 
                onClick={handleSave} 
                color="success"
                disabled={!formData.album_id}
              >
                {isCreateMode ? "Create" : "Save Changes"}
              </Button>
            </>
          ) : (
            isEditor ? <Button variant="contained" size="large" onClick={() => setIsInEdit(true)}>Edit</Button> : null
          )}
        </Grid>
      </Grid>
      <FloatingAction fallbackPath="/plays" />
    </Box>
  );
};

export default PlaylogForm;