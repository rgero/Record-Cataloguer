import { Box, FormLabel, Grid, MenuItem, Select, TextField } from "@mui/material";
import { useEffect, useState } from "react";

import { APIProvider } from "@vis.gl/react-google-maps";
import { AddressSearchMap } from "./AddressSearchMap";
import FloatingAction from "@components/ui/FloatingAction";
import FormActions from "@components/ui/forms/FormActions";
import FormAdornment from "@components/ui/forms/FormAdornment";
import FormHeader from "@components/ui/forms/FormHeader";
import type { Location } from "@interfaces/Location";
import toast from "react-hot-toast";
import { useDialogProvider } from "@context/dialog/DialogContext";
import { useLocationContext } from "@context/location/LocationContext";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "@context/users/UserContext";

const emptyLocation: Location = {
  name: "",
  address: "",
  recommended: null,
  notes: "",
};

type LocationFormErrors = {
  name?: string;
};

interface LocationFormProps {
  location?: Location | null;
}

const LocationForm = ({ location = null }: LocationFormProps) => {
  const { openDeleteDialog } = useDialogProvider();
  const navigate = useNavigate();
  
  const isCreateMode = !location;

  const [inEdit, setIsInEdit] = useState<boolean>(isCreateMode);
  const [formData, setFormData] = useState<Location | null>(location ?? emptyLocation);
  const [errors, setErrors] = useState<LocationFormErrors>({});
  
  const { updateLocation, createLocation, deleteLocation } = useLocationContext();
  const { isEditor } = useUserContext();

  const validateForm = () => {
    const nextErrors: LocationFormErrors = {};

    if (!formData?.name.trim()) {
      nextErrors.name = "Location name is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  useEffect(() => {
    if (location) {
      setFormData(location);
      setIsInEdit(false);
      setErrors({});
    }
  }, [location]);
  if (!formData) return null;

  const handleAddressChange = (address: string) => {
    setErrors((prev) => ({ ...prev, address: undefined }));
    setFormData((prev) => (prev ? { 
        ...prev, 
        address
    } : null));
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fix the highlighted fields before saving.");
      return;
    }

    try {
      if (isCreateMode) {
        await createLocation(formData);
        toast.success("Location created successfully!");
        navigate(`/locations`);
      } else {
        const { percentage, ...itemToUpdate } = formData;
        if (location.id === undefined) return;
        await updateLocation(location.id, itemToUpdate);
        setIsInEdit(false);
        toast.success("Location updated successfully!");
      }
    } catch (error) {
      toast.error(`Failed to ${isCreateMode ? 'create' : 'update'} location.`);
      console.error(error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!location || location.id === undefined) return;

    try {
      await deleteLocation(location.id);
      toast.success("Location deleted.");
      navigate("/locations");
    } catch (error) {
      toast.error("Failed to delete location.");
      console.error(error);
    }
  };
  
  const handleCancel = () => {
    if (isCreateMode) {
      navigate(-1);
    } else {
      setFormData(location);
      setIsInEdit(false);
    }
  };

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_LOCATIONS_API} libraries={['places', 'marker']}>
      <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', p: 3, pb: 10, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 3, boxShadow: 1 }}>
        <FormHeader
          isCreateMode={isCreateMode}
          rightAdornment={
            <FormAdornment
              mode={isCreateMode ? "create" : "edit"}
              isEditing={inEdit}
              isEditor={isEditor}
              onCancel={handleCancel}
              onDelete={() => openDeleteDialog({ name: formData.name, type: "Location" }, handleConfirmDelete)}
              onEdit={() => setIsInEdit(true)}
              onSave={handleSave}
              createLabel="Create Location"
            />
          }
        />
        <Grid container spacing={3}>
          {/* Name Field */}
          <Grid size={12}>
            <FormLabel sx={{ mb: 1, display: 'block', fontWeight: 'bold' }}>Name</FormLabel>
            <TextField
              value={formData.name}
              onChange={(e) => {
                setErrors((prev) => ({ ...prev, name: undefined }));
                setFormData({ ...formData, name: e.target.value });
              }}
              fullWidth
              disabled={!inEdit}
              placeholder="Enter location name"
              error={Boolean(errors.name)}
              helperText={errors.name}
            />
          </Grid>

          <Grid size={12}>
            <FormLabel sx={{ mb: 1, display: 'block', fontWeight: 'bold' }}>Address</FormLabel>
            <AddressSearchMap 
                initialAddress={formData.address} 
                onAddressSelect={handleAddressChange} 
                disabled={!inEdit}
            />
          </Grid>

          {/* Recommended Field */}
          <Grid size={12}>
            <FormLabel sx={{ mb: 1, display: 'block', fontWeight: 'bold' }}>Recommended</FormLabel>
            <Select
              value={formData.recommended === null ? "---" : (formData.recommended ? "Yes" : "No")}
              onChange={(e) => {
                const val = e.target.value;
                setFormData({ 
                  ...formData, 
                  recommended: val === "Yes" ? true : val === "No" ? false : null 
                });
              }}
              fullWidth
              disabled={!inEdit}
            >
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
              <MenuItem value="---">---</MenuItem>
            </Select>
          </Grid>

          {/* Notes Field */}
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

          {/* Form Actions */}
          <Grid size={12} sx={{ mt: 2 }}>
            <FormActions
              mode={isCreateMode ? "create" : "edit"}
              isEditing={inEdit}
              isEditor={isEditor}
              onCancel={handleCancel}
              onDelete={() => openDeleteDialog({ name: formData.name, type: "Location" }, handleConfirmDelete)}
              onEdit={() => setIsInEdit(true)}
              onSave={handleSave}
              createLabel="Create Location"
            />
          </Grid>

        </Grid>
      </Box>
      <FloatingAction fallbackPath="/locations"/>
    </APIProvider>
  );
};

export default LocationForm;