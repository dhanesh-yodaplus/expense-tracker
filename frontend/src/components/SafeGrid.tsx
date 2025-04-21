// components/SafeGrid.tsx
import Grid from "@mui/material/Grid";
import { ComponentProps } from "react";

export default function SafeGrid(props: ComponentProps<typeof Grid>) {
  return <Grid {...props} />;
}
