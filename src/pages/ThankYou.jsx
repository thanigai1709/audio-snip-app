import { Button, Heading } from "@chakra-ui/react";
import React, { useContext } from "react";
import { FileContext } from "../context/fileContext";

const ThankYou = () => {
	const { downloadUrl } = useContext(FileContext);
	return (
		<section className="thankyou-wrapper">
			<Heading marginBottom={3} textAlign={"center"}>
				Thank you!
			</Heading>
			<div className="btn-container">
				<a href={downloadUrl} download>
					<Button size={"lg"} variant="outline" colorScheme={"purple"}>
						Download
					</Button>
				</a>
				<a href={"/"}>
					<Button size={"lg"} variant="outline" colorScheme={"purple"}>
						Go to home
					</Button>
				</a>
			</div>
		</section>
	);
};

export default ThankYou;
