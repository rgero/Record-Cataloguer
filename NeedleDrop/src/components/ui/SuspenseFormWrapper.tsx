import { Suspense, type  ReactNode } from "react";
import { Typography } from "@mui/material";

interface SuspenseFormWrapperProps {
  children?: ReactNode;
  fallback?: ReactNode;
}

const SuspenseFormWrapper = ({ children, fallback }: SuspenseFormWrapperProps) => {
  return (
    <Suspense fallback={fallback || <Typography sx={{ p: 4 }}>Loading...</Typography>}>
      {children}
    </Suspense>
  );
};

export default SuspenseFormWrapper;
