// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"

import styles from "./Form.module.css";
import "react-datepicker/dist/react-datepicker.css";

import { useEffect, useState } from "react";
import { useUrlPosition } from "../hooks/useUrlPosition";
import ReactDatePicker from "react-datepicker";
import Button from "./Button";
import BackButton from "./BackButton";
import Message from "./Message";
import Spinner from "./Spinner";
import { useCities } from "../contexts/CitiesContext";
import { useNavigate } from "react-router-dom";

export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function Form() {
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const { mapLat, mapLng } = useUrlPosition();
  const [isLoadingGeocoding, setIsLoadingGeocoding] = useState(false);
  const [emoji, setEmoji] = useState("");
  const [geoCodingError, setGeoCodingError] = useState(null);
  const { createCity, isLoading } = useCities();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCityData() {
      try {
        if (!mapLat || !mapLng) return;
        setGeoCodingError(null);
        setIsLoadingGeocoding(true);
        const res = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${mapLat}&longitude=${mapLng}`
        );
        const data = await res.json();
        if (!data.countryCode)
          throw new Error(
            "That doesn't seem to be a city.Click somewhere else"
          );
        setCityName(data.city || data.locality || "");
        setCountry(data.countryName);
        setEmoji(convertToEmoji(data.countryCode));
      } catch (error) {
        setGeoCodingError(error.message);
      } finally {
        setIsLoadingGeocoding(false);
      }
    }
    fetchCityData();
  }, [mapLat, mapLng]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cityName || !date) return;

    const newCity = {
      cityName,
      country,
      emoji,
      date,
      notes,
      position: { lat: mapLat, lng: mapLng },
    };
    await createCity(newCity);
    navigate("/app");
  };

  if (isLoadingGeocoding) return <Spinner />;

  if (!mapLat || !mapLng)
    return <Message message={"Start by clicking somewhere on map"} />;

  if (geoCodingError) return <Message message={geoCodingError} />;

  return (
    <form
      className={`${styles.form} ${isLoading ? styles.loading : ""}`}
      onSubmit={handleSubmit}
    >
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
        />
        <span className={styles.flag}>{emoji}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>
        <ReactDatePicker
          selected={date}
          onChange={(date) => setDate(date)}
          dateFormat="dd/MM/yyyy"
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type={"primary"}>Add</Button>
        <BackButton href={"/app/cities"} />
      </div>
    </form>
  );
}

export default Form;
