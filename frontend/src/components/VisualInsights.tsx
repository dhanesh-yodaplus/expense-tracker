import { useState } from "react";
import {
  Card,
  Typography,
  Grid,
  Box,
  CardActionArea,
  useTheme,
  Stack,
} from "@mui/material";
import PieChartIcon from "@mui/icons-material/PieChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import RadarIcon from "@mui/icons-material/Radar";
import ChartModal from "./ChartModal";

type ChartType = "pie" | "bar" | "line" | "radar";

export default function VisualInsights() {
  const [open, setOpen] = useState(false);
  const [chartType, setChartType] = useState<ChartType>("pie");

  const theme = useTheme();

  const openChartHandler = (type: ChartType) => {
    setChartType(type);
    setOpen(true);
  };

  const renderCard = (
    title: string,
    icon: JSX.Element,
    type: ChartType,
    color: string
  ) => (
    <Grid item xs={12} sm={6}>
      <Card
        variant="outlined"
        sx={{
          height: 160,
          borderLeft: `5px solid ${color}`,
          boxShadow: 2,
          transition: "0.3s",
          "&:hover": {
            boxShadow: 4,
            transform: "translateY(-4px)",
          },
        }}
      >
        <CardActionArea
          sx={{
            height: "100%",
            px: 2,
            py: 3,
          }}
          onClick={() => openChartHandler(type)}
        >
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={2}
            sx={{ height: "100%" }}
          >
            <Box>{icon}</Box>
            <Typography fontWeight={600} textAlign="center">
              {title}
            </Typography>
          </Stack>
        </CardActionArea>
      </Card>
    </Grid>
  );

  return (
    <>
      <Card sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Visual Insights
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Select a chart to explore your financial data visually.
        </Typography>

        <Grid container spacing={3}>
          {renderCard(
            "Category-wise Pie Chart",
            <PieChartIcon fontSize="large" color="primary" />,
            "pie",
            theme.palette.primary.main
          )}
          {renderCard(
            "Monthly Expense Bar Chart",
            <BarChartIcon fontSize="large" color="secondary" />,
            "bar",
            theme.palette.secondary.main
          )}
          {renderCard(
            "Income vs Expense Line Chart",
            <ShowChartIcon fontSize="large" color="info" />,
            "line",
            theme.palette.info.main
          )}
          {renderCard(
            "Budget vs Spent Radar Chart",
            <RadarIcon fontSize="large" color="success" />,
            "radar",
            theme.palette.success.main
          )}
        </Grid>
      </Card>

      <ChartModal open={open} onClose={() => setOpen(false)} type={chartType} />
    </>
  );
}
