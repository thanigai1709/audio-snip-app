import { Button } from "@chakra-ui/react";
import React, { useRef, useState, useContext } from "react";
import { Heading, Text } from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FileContext } from "../context/fileContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
	const fileInputRef = useRef(null);
	const navigate = useNavigate();
	const [isLoading, setLoading] = useState(false);
	const { fileURLObj, setFileURLObj } = useContext(FileContext);
	const handleButtonClick = () => {
		fileInputRef.current.click();
	};

	const handleFileInputChange = (event) => {
		const file = event.target.files[0];
		setLoading(true);
		console.log(file, "file");
		let formdata = new FormData();
		formdata.append("audio", file, file.name);

		let requestOptions = {
			method: "POST",
			body: formdata,
			redirect: "follow",
		};

		fetch("http://127.0.0.1:8000/upload-file", requestOptions)
			.then((response) => response.json())
			.then((result) => {
				setFileURLObj({
					url: result.url,
					key: result.key,
					file_name: result.file_name,
				});
				navigate("/editor");
			})
			.catch((error) => console.log("error", error));
	};

	return (
		<section className="upload-section">
			<div className="upload-section__container" style={{ textAlign: "center" }}>
				<Heading marginBottom={2} textAlign={"center"}>
					Audio Snip
				</Heading>
				<Text marginBottom={2} textAlign={"center"}>
					Cut any audio file online
				</Text>
				<input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileInputChange} />
				<Button onClick={handleButtonClick} size="lg" colorScheme={"purple"} isLoading={isLoading}>
					Upload
				</Button>
			</div>
		</section>
	);
};

export default Home;
