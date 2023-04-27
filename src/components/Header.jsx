import React from "react";

import logo from "../assets/audio-waves.png";

const Header = () => {
	return (
		<header className="header">
			<a href="/" className="header__logo">
				<img src={logo} alt="audio snip" />
				<span>Snip</span>
			</a>
		</header>
	);
};

export default Header;
