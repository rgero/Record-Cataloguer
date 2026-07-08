import { Box, Button, FormLabel, Grid, MenuItem, Select, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { APIProvider } from "@vis.gl/react-google-maps";
import { AddressSearchMap } from "./AddressSearchMap";
import FloatingAction from "@components/ui/FloatingAction";
import FormHeader from "@components/ui/FormHeader";
import type { Location } from "@interfaces/Location";
import SuspenseFormWrapper from "@components/ui/SuspenseFormWrapper";
import toast from "react-hot-toast";
import { useCombinedLoading } from "@hooks/useCombinedLoading";
import { useDialogProvider } from "@context/dialog/DialogContext";
import { useLocationContext } from "@context/location/LocationContext";
import { useUserContext } from "@context/users/UserContext";

const emptyLocation: Location = {
  name: "",
  address: "",
  recommended: null,
  notes: "",
};

type LocationFormErrors = {
  name?: string;
  address?: string;
};

const LocationForm = () => {
  const { id } = useParams();
  const { openDeleteDialog } = useDialogProvider();
  const navigate = useNavigate();
  
  // Mode detection
  const isCreateMode = !id || id === 'new';

  const [inEdit, setIsInEdit] = useState<boolean>(isCreateMode);
  const [formData, setFormData] = useState<Location | null>(isCreateMode ? emptyLocation : null);
  const [errors, setErrors] = useState<LocationFormErrors>({});
  
  const { isLoading, getLocationById, updateLocation, createLocation, deleteLocation } = useLocationContext();
  const { isEditor } = useUserContext();

  const currentLocation = !isCreateMode ? getLocationById(Number(id)) : null;
  const isFormLoading = useCombinedLoading([isLoading]);

  const validateForm = () => {
    const nextErrors: LocationFormErrors = {};

    if (!formData?.name.trim()) {
      nextErrors.name = "Location name is required.";
    }

    if (!formData?.address?.trim()) {
      nextErrors.address = "Address is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  useEffect(() => {
    if (!isCreateMode && currentLocation && !formData) {
      setFormData(currentLocation);
    }
  }, [currentLocation, isCreateMode, formData]);

  useEffect(() => {
    if (!isCreateMode && !isFormLoading && !currentLocation) {
      toast.error("The requested location could not be found.", {
        id: "missing-location-error",
      });
      navigate("/locations", { replace: true });
    }
  }, [isCreateMode, isFormLoading, currentLocation, navigate]);

  if (!isCreateMode && isFormLoading) {
    return <SuspenseFormWrapper />;
  }
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
        const itemToUpdate = formData;
        delete itemToUpdate.percentage;
        await updateLocation(Number(id), itemToUpdate);
        setIsInEdit(false);
        toast.success("Location updated successfully!");
      }
    } catch (error) {
      toast.error(`Failed to ${isCreateMode ? 'create' : 'update'} location.`);
      console.error(error);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteLocation(Number(id));
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
      setFormData(currentLocation);
      setIsInEdit(false);
    }
  };

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_LOCATIONS_API} libraries={['places', 'marker']}>
      <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', p: 3, pb: 10, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 3, boxShadow: 1 }}>
        <FormHeader isCreateMode={isCreateMode}/>
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
              error={Boolean(errors.address)}
              helperText={errors.address}
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

          <Grid size={12} sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
            {inEdit ? (
              <>
                <Button variant="outlined" size="large" onClick={handleCancel}>
                  Cancel
                </Button>
                
                {!isCreateMode && (
                  <Button variant="contained" size="large" onClick={() => openDeleteDialog({name: formData.name, type: "Location"}, handleConfirmDelete)} color="error">
                    Delete
                  </Button>
                )}

                <Button variant="contained" size="large" onClick={handleSave} color="success">
                  {isCreateMode ? "Create Location" : "Save Changes"}
                </Button>

              </>
            ) : isEditor ? (
              <Button variant="contained" size="large" onClick={() => setIsInEdit(true)}>
                Edit
              </Button>
            ) : null}
          </Grid>
        </Grid>
      </Box>
      <FloatingAction fallbackPath="/locations"/>
    </APIProvider>
  );
};

export default LocationForm;