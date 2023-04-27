import React, { createContext, useState } from "react";

const FileContext = createContext();

const FileContextProvider = ({ children }) => {
	const [fileURLObj, setFileURLObj] = useState({});
	const [downloadUrl, setDownloadUrl] = useState("");
	return (
		<FileContext.Provider value={{ fileURLObj, setFileURLObj, downloadUrl, setDownloadUrl }}>
			{children}
		</FileContext.Provider>
	);
};

export { FileContext, FileContextProvider };
