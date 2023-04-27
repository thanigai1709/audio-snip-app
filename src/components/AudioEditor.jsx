import React, { useState, useEffect, useContext, useRef } from "react";
import CursorPlugin from "wavesurfer.js/dist/plugin/wavesurfer.cursor.min.js";
import RegionsPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions.min.js";
import wavesurfer from "wavesurfer.js";
import { Button, Heading, Stack } from "@chakra-ui/react";
import { IconButton } from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NumberInput, NumberInputField } from "@chakra-ui/react";
import { Slider, SliderTrack, SliderFilledTrack, SliderThumb, SliderMark } from "@chakra-ui/react";
import { Input, Tooltip, Select, Spinner } from "@chakra-ui/react";
import { FileContext } from "../context/fileContext";
import { useNavigate } from "react-router-dom";

const AudioEditor = () => {
	const navigation = useNavigate();
	const wavesurferRef = useRef(null);
	const { fileURLObj, setDownloadUrl } = useContext(FileContext);
	const timelineRef = useRef(null);
	const [playing, setPlaying] = useState(false);
	const [wavesurferObj, setWavesurferObj] = useState();
	const [zoom, setZoom] = useState(1);
	const [duration, setDuration] = useState(0);
	const [crop, setCrop] = useState({
		start: 0,
		end: 0,
	});
	const [isProcessing, setProcessing] = useState(false);
	const [isCropAdded, setCropAdded] = useState(false);
	const [volume, setVolume] = useState(0);
	const [exportFormat, setExportFormat] = useState("mp3");
	const [isInitialized, setInitialized] = useState(false);

	useEffect(() => {
		if (duration && wavesurferObj) {
			// add a region with default length
			wavesurferObj.addRegion({
				start: Math.floor(duration / 2) - Math.floor(duration) / 5, // time in seconds
				end: Math.floor(duration / 2), // time in seconds
				color: "hsla(265, 100%, 86%, 0.4)", // color of the selected region, light hue of purple
			});
		}
	}, [duration, wavesurferObj]);

	useEffect(() => {
		if (wavesurferRef.current && !wavesurferObj) {
			setWavesurferObj(
				wavesurfer.create({
					container: "#waveform",
					scrollParent: false,
					autoCenter: false,
					cursorColor: "violet",
					loopSelection: true,
					waveColor: "#B794F4",
					progressColor: "#553C9A",
					responsive: true,
					plugins: [
						RegionsPlugin.create({}),
						CursorPlugin.create({
							showTime: true,
							opacity: 1,
						}),
					],
				})
			);
		}
	}, [wavesurferRef, wavesurferObj]);

	useEffect(() => {
		if (wavesurferObj) {
			wavesurferObj.load(fileURLObj.url);
		}
	}, [wavesurferObj]);

	useEffect(() => {
		if (wavesurferObj) {
			// once the waveform is ready, play the audio
			wavesurferObj.on("ready", () => {
				setInitialized(true);
			});

			wavesurferObj.on("play", () => {
				setPlaying(true);
			});

			// once audio starts playing, set the state variable to false
			wavesurferObj.on("finish", () => {
				setPlaying(false);
			});

			wavesurferObj.on("region-updated", (region) => {
				const regions = region.wavesurfer.regions.list;
				const keys = Object.keys(regions);
				if (keys.length > 1) {
					regions[keys[0]].remove();
				}
				if (regions[keys[0]].start && regions[keys[0]].end) {
					setCrop({
						start: regions[keys[0]].start,
						end: regions[keys[0]].end,
					});
					wavesurferObj.pause();
					setPlaying(false);
					// wavesurferObj.play(regions[keys[0]].start, regions[keys[0]].end);
				}
			});
		}
	}, [wavesurferObj]);

	useEffect(() => {
		if (duration && wavesurferObj && isCropAdded) {
			// add a region with default length
			let start = Math.floor(duration / 2) - Math.floor(duration) / 5;
			let end = Math.floor(duration / 2);
			wavesurferObj.addRegion({
				start: Math.floor(duration / 2) - Math.floor(duration) / 5, // time in seconds
				end: Math.floor(duration / 2), // time in seconds
				color: "hsla(265, 100%, 86%, 0.4)", // color of the selected region, light hue of purple
				loop: true,
			});
			setCrop({
				start: start,
				end: end,
			});
		}
	}, [duration, wavesurferObj]);

	const handlePlayPause = (e) => {
		if (wavesurferObj.isPlaying()) {
			wavesurferObj.pause();
		} else {
			if (crop.start && crop.end) {
				wavesurferObj.play(crop.start, crop.end);
			} else {
				wavesurferObj.play();
			}
		}
		setPlaying(!playing);
	};

	const handleAudioCrop = (e) => {
		if (!isCropAdded) {
			wavesurferObj.enableDragSelection({}); // to select the region to be trimmed
			setPlaying(false);
			wavesurferObj.pause();
			setDuration(Math.floor(wavesurferObj.getDuration())); // set the duration in local state
			setCropAdded(true);
		} else {
			wavesurferObj.clearRegions();
			setCrop({
				start: 0,
				end: 0,
			});
			setPlaying(false);
			wavesurferObj.pause();
			setDuration(0);
			setCropAdded(false);
		}
	};

	useEffect(() => {
		if (wavesurferObj) {
			wavesurferObj.setVolume(normalizeVolume(volume));
		}
	}, [volume]);

	function processAudio() {
		setProcessing(true);
		setPlaying(false);
		wavesurferObj.stop();
		var myHeaders = new Headers();
		myHeaders.append("Content-Type", "application/json");

		let raw = JSON.stringify({
			file_name: fileURLObj.file_name,
			file_key: fileURLObj.key,
			amplitude: {
				value: Math.abs(volume),
				mode: volume >= 0 ? "gain" : "lose",
			},
			crop: {
				start: crop.start * 1000,
				end: crop.end * 1000,
			},
			output_format: exportFormat,
		});

		let requestOptions = {
			method: "POST",
			headers: myHeaders,
			body: raw,
			redirect: "follow",
		};

		fetch(`${import.meta.env.API_URL}/edit-audio`, requestOptions)
			.then((response) => response.json())
			.then((result) => {
				setProcessing(false);
				setPlaying(false);
				wavesurferObj.stop();
				setDownloadUrl(result.url);
				navigation("/thank-you");
			})
			.catch((error) => console.log("error", error));
	}

	return (
		<div className="player-wrapper">
			<div ref={wavesurferRef} id="waveform" />
			<div ref={timelineRef} id="wave-timeline" />
			<div className="editor-bottom">
				<div className="control-pannel">
					<Tooltip label={playing ? "Pause" : "Play"} placement={"bottom"} colorScheme="purple" bg={"purple.200"}>
						<IconButton
							icon={
								playing ? <FontAwesomeIcon icon="fa-solid fa-pause" /> : <FontAwesomeIcon icon="fa-solid fa-play" />
							}
							onClick={handlePlayPause}
							colorScheme="purple"
							size="lg"
						/>
					</Tooltip>
					<Tooltip label={"Cut"} placement={"bottom"} colorScheme="purple" bg={"purple.200"}>
						<IconButton
							isActive={isCropAdded}
							icon={<FontAwesomeIcon icon="fa-solid fa-scissors" />}
							colorScheme="purple"
							size="lg"
							onClick={handleAudioCrop}
						/>
					</Tooltip>
					<Tooltip label={"Start At"} placement={"bottom"} colorScheme="purple" bg={"purple.200"}>
						<Input value={formatDuration(crop.start)} maxW={"80px"} disabled />
					</Tooltip>
					<Tooltip label={"End At"} placement={"bottom"} colorScheme="purple" bg={"purple.200"}>
						<Input value={formatDuration(crop.end)} maxW={"80px"} disabled />
					</Tooltip>
					<Tooltip label={"Volume Boost (db)"} placement={"bottom"} colorScheme="purple" bg={"purple.200"}>
						<span>
							<Slider
								aria-label="slider-ex-4"
								min={-20}
								defaultValue={0}
								max={20}
								onChange={(val) => setVolume(val)}
								colorScheme="purple"
								width={100}
							>
								<SliderTrack>
									<SliderFilledTrack />
								</SliderTrack>
								<SliderThumb boxSize={8} color={"#000"}>
									{volume}
								</SliderThumb>
							</Slider>
						</span>
					</Tooltip>
				</div>
				<div className="control-export">
					<Select value={exportFormat} onChange={(val) => setExportFormat(val.target.value)}>
						<option value="mp3">mp3</option>
						<option value="wav">wav</option>
						<option value="flac">flac</option>
					</Select>
					<Button colorScheme={"purple"} size={"md"} onClick={processAudio} paddingInline={10} isLoading={isProcessing}>
						Save
					</Button>
				</div>
			</div>
			{!isInitialized && (
				<div className="flash-screen">
					<div className="flash-screen__content">
						<Heading as={"h3"} size="lg">
							Initializing Editor...
						</Heading>
						<Spinner />
					</div>
				</div>
			)}
		</div>
	);
};

export default AudioEditor;

function formatDuration(duration) {
	return new Date(duration * 1000).toISOString().slice(14, 19);
}

function normalizeVolume(vol) {
	return (vol + 20) / 40;
}

function deDormalizeVolume(vol) {
	return vol * 40 - 20;
}
