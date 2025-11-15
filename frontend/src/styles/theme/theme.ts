import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#0041D9", // --brand-primary
      light: "#CCCCF5", // --brand-secondary
      dark: "#002999", // --primary-dark
    },
    secondary: {
      main: "#7C8493", // --neutral-700
      light: "#A8ADB7", // --neutral-600
      dark: "#515B6F", // --neutral-800
    },
    success: {
      main: "#56CDAD", // --accent-green
      light: "#7DD3C2", // --success-light
      dark: "#3FB896", // --success-dark
    },
    warning: {
      main: "#FFB836", // --accent-yellow
      light: "#FFCC5A", // --warning-light
      dark: "#E6A62E", // --warning-dark
    },
    error: {
      main: "#FF6550", // --accent-red
      light: "#FF8A73", // --error-light
      dark: "#E64A2D", // --error-dark
    },
    info: {
      main: "#26A4FF", // --accent-blue
      light: "#5BB8FF", // --info-light
      dark: "#1A8FE6", // --info-dark
    },
    background: {
      default: "#F8F8FD", // --neutral-300
      paper: "#ffffff", // --background-secondary
    },
    text: {
      primary: "#25324B", // --text-primary
      secondary: "#515B6F", // --text-secondary
      disabled: "#7C8493", // --text-muted
    },
    grey: {
      50: "#F8F8FD", // --neutral-300
      100: "#F9FAFC", // --neutral-400
      200: "#E4E5E7", // --neutral-500
      300: "#A8ADB7", // --neutral-600
      400: "#7C8493", // --neutral-700
      500: "#515B6F", // --neutral-800
      600: "#25324B", // --neutral-900
    },
  },
  typography: {
    fontFamily: '"Epilogue", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
    h1: {
      fontSize: "72px", // --font-size-h1
      fontWeight: 400, // --font-weight-regular
      lineHeight: 1.25, // --leading-tight
      fontFamily: '"Epilogue", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
    },
    h2: {
      fontSize: "48px", // --font-size-h2
      fontWeight: 400, // --font-weight-regular
      lineHeight: 1.25, // --leading-tight
      fontFamily: '"Epilogue", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
    },
    h3: {
      fontSize: "32px", // --font-size-h3
      fontWeight: 400, // --font-weight-regular
      lineHeight: 1.25, // --leading-tight
      fontFamily: '"Epilogue", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
    },
    h4: {
      fontSize: "24px", // --font-size-h4
      fontWeight: 400, // --font-weight-regular
      lineHeight: 1.25, // --leading-tight
      fontFamily: '"Epilogue", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
    },
    h5: {
      fontSize: "20px", // --font-size-h5
      fontWeight: 400, // --font-weight-regular
      lineHeight: 1.25, // --leading-tight
      fontFamily: '"Epilogue", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
    },
    body1: {
      fontSize: "16px", // --font-size-body-base
      fontWeight: 400, // --font-weight-regular
      lineHeight: 1.5, // --leading-normal
      fontFamily: '"Epilogue", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
    },
    body2: {
      fontSize: "14px", // --font-size-body-sm
      fontWeight: 400, // --font-weight-regular
      lineHeight: 1.5, // --leading-normal
      fontFamily: '"Epilogue", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
    },
    button: {
      fontSize: "16px", // --font-size-button-base
      fontWeight: 700, // --font-weight-bold
      lineHeight: 1.5, // --leading-normal
      fontFamily: '"Epilogue", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
      textTransform: "none",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "8px",
          fontWeight: 700, // --font-weight-bold
          fontSize: "16px", // --font-size-button-base
          fontFamily: '"Epilogue", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0, 65, 217, 0.15)",
          },
        },
        outlined: {
          borderColor: "#E4E5E7", // --border-color
          "&:hover": {
            borderColor: "#0041D9", // --brand-primary
            backgroundColor: "rgba(0, 65, 217, 0.04)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          backgroundColor: "#ffffff", // --background-secondary
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            backgroundColor: "#ffffff",
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#0041D9", // --brand-primary
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#0041D9", // --brand-primary
              borderWidth: "2px",
            },
          },
          "& .MuiInputLabel-root": {
            color: "#7C8493", // --text-muted
            "&.Mui-focused": {
              color: "#0041D9", // --brand-primary
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: '"Epilogue", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
          fontWeight: 500, // --font-weight-medium
          fontSize: "14px", // --font-size-body-sm
        },
        filled: {
          backgroundColor: "#CCCCF5", // --brand-secondary
          color: "#0041D9", // --brand-primary
          "&:hover": {
            backgroundColor: "#0041D9", // --brand-primary
            color: "#ffffff",
          },
        },
        outlined: {
          borderColor: "#E4E5E7", // --border-color
          color: "#7C8493", // --text-muted
          "&:hover": {
            backgroundColor: "#F8F8FD", // --neutral-300
            borderColor: "#0041D9", // --brand-primary
            color: "#0041D9", // --brand-primary
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff", // --background-secondary
          color: "#25324B", // --text-primary
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        },
      },
    },
  },
});
