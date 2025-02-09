import { useRouteError } from "react-router-dom";
import { Box, Link, Typography } from "@mui/material";

interface RouteError {
  data: string;
  error: {
    columnNumber: number;
    fileName: string;
    lineNumber: number;
    message: string;
    stack: string;
  };
  internal: boolean;
  status: number;
  statusText: string;
}

export default function Error() {
  const error = useRouteError() as RouteError;
  console.error(error);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Typography variant="h4">Oops!</Typography>
      <Typography>Sorry, an unexpected error has occurred.</Typography>
      <Typography>{error.statusText || error.error.message}</Typography>
      <Link href="/">Go Home</Link>
    </Box>
  );
}