import { BrowserRouter, Route, Routes } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Suspense, lazy } from "react";

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AppLayout from "@components/ui/AppLayout"
import AuthenticatedRoute from "@components/AuthenticatedRoute"
import { AuthenticationProvider } from "./context/authentication/AuthenticationProvider"
import { CssBaseline } from "@mui/material"
import CustomToaster from "@components/ui/CustomToaster"
import DarkModeProvider from "./context/theme/DarkModeProvider"
import { DialogProvider } from "@context/dialog/DialogProvider"
import EditorRoute from "@components/EditorRoute"
import { ErrorBoundary } from "react-error-boundary"
import ErrorFallback from "./components/ui/ErrorFallback"
import Loading from "@components/ui/Loading";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { LocationProvider } from "@context/location/LocationProvider"
import { PlaylogProvider } from "@context/playlogs/PlaylogProvider"
import ScrollToTop from "@components/ui/ScrollToTop"
import { UserProvider } from "@context/users/UserProvider"
import { VinylProvider } from "@context/vinyl/VinylProvider"
import { WantedItemProvider } from "@context/wanted/WantedItemProvider"

const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("@pages/LoginPage"));
const PageNotFound = lazy(() => import("@pages/PageNotFound"));
const VinylsPage = lazy(() => import("@pages/vinyl/VinylsPage"));
const VinylDetailsPage = lazy(() => import("@pages/vinyl/VinylDetailsPage"));
const LocationsPage = lazy(() => import("@pages/locations/LocationsPage"));
const LocationDetailsPage = lazy(() => import("@pages/locations/LocationDetailsPage"));
const WantedItemsPage = lazy(() => import("@pages/wanted/WantedItemsPage"));
const WantedItemDetailsPage = lazy(() => import("@pages/wanted/WantedItemDetailsPage"));
const PlaylogsPage = lazy(() => import("@pages/playlogs/PlaylogsPage"));
const PlaylogDetailsPage = lazy(() => import("@pages/playlogs/PlaylogsDetailsPage"));
const StatsPage = lazy(() => import("@pages/stats/StatsPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
    },
    mutations: {
      onError: (error) => {
        console.error(error);
      },
    },
  },
});

const App = () => {
  return (
    <DarkModeProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <QueryClientProvider client={queryClient}>
          <AuthenticationProvider>
            <UserProvider>
              <LocationProvider>
                <VinylProvider>
                  <WantedItemProvider>
                    <PlaylogProvider>
                      <BrowserRouter>
                        <DialogProvider>
                          <ErrorBoundary FallbackComponent={ErrorFallback}>
                            <ScrollToTop/>
                            <Suspense fallback={<Loading />}>
                              <Routes>
                                <Route
                                  element={
                                    <AuthenticatedRoute>
                                      <AppLayout />
                                    </AuthenticatedRoute>
                                  }
                                >
                                  <Route index element={<VinylsPage/>}/>
                                  <Route path="vinyls">
                                    <Route index element={<VinylsPage/>} />
                                    <Route path="create" element={<EditorRoute><VinylDetailsPage/></EditorRoute>} />
                                    <Route path=':id' element={<VinylDetailsPage/>} />
                                  </Route>
                                  <Route path="locations">
                                    <Route index element={<LocationsPage/>} />
                                    <Route path="create" element={<EditorRoute><LocationDetailsPage/></EditorRoute>} />
                                    <Route path=':id' element={<LocationDetailsPage/>} />
                                  </Route>
                                  <Route path="wantlist">
                                    <Route index element={<WantedItemsPage/>} />
                                    <Route path='create' element={<EditorRoute><WantedItemDetailsPage/></EditorRoute>} />
                                    <Route path=':id' element={<WantedItemDetailsPage/>} />
                                  </Route>
                                  <Route path="plays">
                                    <Route index element={<PlaylogsPage/>} /> 
                                    <Route path='create' element={<EditorRoute><PlaylogDetailsPage/></EditorRoute>} />
                                    <Route path=':id' element={<PlaylogDetailsPage/>} />
                                  </Route>
                                  <Route path="stats">
                                    <Route index element={<StatsPage/>} />
                                  </Route>
                                </Route>
                                <Route path='landing' element={<LandingPage/>} />
                                <Route path="login" element={<LoginPage/>} />
                                <Route element={<AppLayout/>}>
                                  <Route path="*" element={<PageNotFound />} />
                                </Route>
                              </Routes>
                            </Suspense>
                          </ErrorBoundary>
                          <CssBaseline/>
                        </DialogProvider>
                      </BrowserRouter>
                    </PlaylogProvider>
                  </WantedItemProvider>
                </VinylProvider>
              </LocationProvider>
            </UserProvider>
          </AuthenticationProvider>
        </QueryClientProvider>
        <CustomToaster/>
      </LocalizationProvider>
    </DarkModeProvider>
  )
}

export default App
