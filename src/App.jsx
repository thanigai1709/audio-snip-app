import { BrowserRouter, Router, Route, Routes } from "react-router-dom";
import "./App.css";
import AudioEditor from "./components/AudioEditor.jsx";
import ReactDOM from "react-dom";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import Home from "./pages/Home";
import Editor from "./pages/Editor";
import Header from "./components/Header";
import ThankYou from "./pages/ThankYou";
import { useEffect } from "react";
library.add(fas);

function App() {
	useEffect(() => {
		window.localStorage.setItem("chakra-ui-color-mode", "dark");
	}, []);

	return (
		<main className="app-parent">
			<Header />
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/editor" element={<Editor />} />
					<Route path="/thank-you" element={<ThankYou />} />
				</Routes>
			</BrowserRouter>
		</main>
	);
}

export default App;
