import { useTranslation } from "react-i18next";
import { Button, Typography, Box } from "@mui/material";

export default function PageNotFound() {
  const { t } = useTranslation();

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh" gap={2}>
      <Typography variant="h2" color="error" gutterBottom>
        {t("pageNotFound")}
      </Typography>
      <Button variant="contained" color="primary" onClick={() => window.history.back()}>
        {t("goBack")}
      </Button>
    </Box>
  );
}
