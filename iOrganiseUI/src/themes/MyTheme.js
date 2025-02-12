import { createContext, useState, useMemo } from 'react';
import { createTheme } from '@mui/material/styles';

export const tokens = (mode) => ({
    ...(mode === "dark"
        ? {
            grey: {
                100: "#E0E0E0",
                200: "#C2C2C2",
                300: "#A3A3A3",
                400: "#858585",
                500: "#666666",
                600: "#525252",
                700: "#3D3D3D",
                800: "#292929",
                900: "#141414"
            },
            primary: {
                100: "#D0D1D5",
                200: "#A1A4AB",
                300: "#727681",
                400: "#1F2A40",
                500: "#141B2D",
                600: "#101624",
                700: "#0C101B",
                800: "#080B12",
                900: "#040509"
            },
            greenAccent: {
                100: "#DBF5EE",
                200: "#B7EBDE",
                300: "#94E2CD",
                400: "#70D8BD",
                500: "#4CCEAC",
                600: "#3DA58A",
                700: "#2E7C67",
                800: "#1E5245",
                900: "#0F2922"
            },
            redAccent: {
                100: "#F8DCDB",
                200: "#F1B9B7",
                300: "#E99592",
                400: "#E2726E",
                500: "#DB4F4A",
                600: "#AF3F3B",
                700: "#832F2C",
                800: "#58201E",
                900: "#2C100f"
            },
            blueAccent: {
                100: "#E1E2FE",
                200: "#C3C6FD",
                300: "#A4A9FC",
                400: "#868DFB",
                500: "#6870FA",
                600: "#535AC8",
                700: "#3E4396",
                800: "#2A2D64",
                900: "#151632"
            }
        } : {
            grey: {
                100: "#141414",
                200: "#292929",
                300: "#3D3D3D",
                400: "#525252",
                500: "#666666",
                600: "#858585",
                700: "#A3A3A3",
                800: "#C2C2C2",
                900: "#E0E0E0"
            },
            primary: {
                100: "#040509",
                200: "#080B12",
                300: "#0C101B",
                400: "#F2F0F0",
                500: "#141B2D",
                600: "#434957",
                700: "#727681",
                800: "#A1A4AB",
                900: "#D0D1D5"
            },
            greenAccent: {
                100: "#0F2922",
                200: "#1E5245",
                300: "#2E7C67",
                400: "#3DA58A",
                500: "#4CCEAC",
                600: "#70D8BD",
                700: "#94E2CD",
                800: "#B7EBDE",
                900: "#DBF5EE"
            },
            redAccent: {
                100: "#2C100f",
                200: "#58201E",
                300: "#832F2C",
                400: "#AF3F3B",
                500: "#DB4F4A",
                600: "#E2726E",
                700: "#E99592",
                800: "#F1B9B7",
                900: "#F8DCDB"
            },
            blueAccent: {
                100: "#151632",
                200: "#2A2D64",
                300: "#3E4396",
                400: "#535AC8",
                500: "#6870FA",
                600: "#868DFB",
                700: "#A4A9FC",
                800: "#C3C6FD",
                900: "#E1E2FE"
            }
        }
    )
});

// mui theme settings
export const themeSettings = (mode) => {
    const colours = tokens(mode);

    return {
        palette: {
            mode: mode,
            ...(mode === "dark"
                ? {
                    primary: {
                        main: colours.primary[500]
                    },
                    secondary: {
                        main: colours.greenAccent[500]
                    },
                    neutral: {
                        dark: colours.grey[700],
                        main: colours.grey[500],
                        light: colours.grey[100]
                    },
                    background: {
                        default: colours.primary[500]
                    }
                } : {
                    primary: {
                        main: colours.primary[100]
                    },
                    secondary: {
                        main: colours.greenAccent[500]
                    },
                    neutral: {
                        dark: colours.grey[700],
                        main: colours.grey[500],
                        light: colours.grey[100]
                    },
                    background: {
                        default: "#FCFCFC"
                    }
                }
            )
        },
        components: {
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        borderRadius: "5px",
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: colours.greenAccent[300],
                        },
                        "&.Mui-focused": {
                            "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: colours.greenAccent[300]
                            }
                        },
                        "& .MuiInputLabel-outlined": {
                            "&.Mui-focused": {
                                color: colours.greenAccent[300]
                            }
                        }
                    }
                }
            },
            MuiInputLabel: {
                styleOverrides: {
                    root: {
                        "&.Mui-focused": {
                            color: colours.greenAccent[300]
                        }
                    }
                }
            },
            MuiMenu: {
                styleOverrides: {
                    list: {
                        backgroundColor: colours.primary[400]
                    }
                }
            },
            MuiCheckbox: {
                styleOverrides: {
                    root: {
                        "&.Mui-checked": {
                            color: colours.greenAccent[300]
                        },
                        "&:hover": {
                            backgroundColor: colours.primary[400]
                        }
                    }
                }
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: "5px",
                        textTransform: "none",
                        ...(mode === "dark"
                            ? {
                                backgroundColor: colours.greenAccent[300],
                                color: colours.primary[500],
                                "&:hover": {
                                    backgroundColor: colours.greenAccent[200],
                                    color: colours.primary[500]
                                }
                            } : {
                                backgroundColor: colours.greenAccent[300],
                                color: "#FCFCFC",
                                "&:hover": {
                                    backgroundColor: colours.greenAccent[200],
                                    color: "#FCFCFC"
                                }
                            }
                        )
                    }
                },
                variants: [
                    {
                        props: { variant: "outlined" },
                        style: {
                            backgroundColor: "transparent",
                            border: "2px solid",
                            borderColor: colours.greenAccent[300],
                            color: colours.greenAccent[300],
                            "&:hover": {
                                backgroundColor: "transparent",
                                borderColor: colours.greenAccent[300],
                                color: colours.greenAccent[300],
                            }
                        }
                    }
                ]
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        borderRadius: "5px",
                        ...(mode === "dark"
                            ? {
                                backgroundColor: colours.primary[500]
                            } : {
                                backgroundColor: "#FCFCFC"
                            }
                        )
                    }
                }
            }
        },
        typography: {
            fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
            fontSize: 12,
            h1: {
                fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
                fontSize: 40
            },
            h2: {
                fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
                fontSize: 32
            },
            h3: {
                fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
                fontSize: 24
            },
            h4: {
                fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
                fontSize: 20
            },
            h5: {
                fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
                fontSize: 16
            },
            h6: {
                fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
                fontSize: 14
            }
        }
    }
};

export const ColourModeContext = createContext({
    toggleColourMode: () => { }
});

export const useMode = () => {
    const [mode, setMode] = useState("dark");

    const colourMode = useMemo(
        () => ({
            toggleColourMode: () =>
                setMode((prev) => (prev === "light" ? "dark" : "light")),
        }),
        []
    );

    const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

    return [theme, colourMode]
}
