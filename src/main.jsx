import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { FileContextProvider } from "./context/fileContext.jsx";

const theme = extendTheme({
	initialColorMode: "dark",
	useSystemColorMode: false,
});

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<FileContextProvider>
			<ChakraProvider theme={theme}>
				<App />
			</ChakraProvider>
		</FileContextProvider>
	</React.StrictMode>
);
