import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import "leaflet-geosearch/dist/geosearch.css";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import axios from "axios";
import { Card, CardText, Button } from 'reactstrap';
import { Star } from "@mui/icons-material";
import { useState, useEffect } from 'react';
import { format } from 'timeago.js';
import 'leaflet/dist/leaflet.css';
import './App.css';
import Register from "./components/Register";
import Login from "./components/Login";
import userLocationURL from "./icons/red.png"
import otherLocationURL from "./icons/purple.png"


function App() {

  const myStorage = window.localStorage;
  myStorage.removeItem("user");
  const [currentUsername, setCurrentUsername] = useState(myStorage.getItem("user"));
  const [pins, setPins] = useState([]);
  const [title, setTitle] = useState(null);
  const [desc, setDesc] = useState(null);
  const [star, setStar] = useState(0);
  const [newPlace, setNewPlace] = useState(null);
  const [markerPlace, setMarkerPlace] = useState({ mLat: 51.505, mLong: -0.09 });
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [viewport, setViewport] = useState({
    center: [51.505, -0.09],
    zoom: 4,
    //center={[51.505, -0.09]} zoom={5}
  });

  const myIcon = L.icon({
    iconUrl: userLocationURL,
    iconSize: [35, 40]
  })

  const otherIcon = L.icon({
    iconUrl: otherLocationURL,
    iconSize: [35, 40]
  })

  const LeafletgeoSearch = () => {
    const map = useMap();
    useEffect(() => {
      const provider = new OpenStreetMapProvider();

      const searchControl = new GeoSearchControl({
        provider,
        marker: {
          myIcon
        }
      });

      map.addControl(searchControl);

      return () => map.removeControl(searchControl);
    }, []);

    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newPin = {
      username: currentUsername,
      title,
      desc,
      rating: star,
      lat: newPlace.nLat,
      long: newPlace.nLong,
    };

    try {
      const res = await axios.post("http://localhost:4000/api/pins", newPin);
      setPins([...pins, res.data]);
      setNewPlace(null);
      setDesc(null);
      setTitle(null);
      setStar(0);
    } catch (err) {
      console.log(err);
    }
  };

  const removeMarker = async (e) => {
    const newPin = {
      username: currentUsername,
      lat: markerPlace.mLat,
      long: markerPlace.mLong,
    };

    try {
      const res = await axios.post("http://localhost:4000/api/pins/deletepin", newPin);
      setPins(res.data);
      // getPins();
    } catch (err) {
      console.log(err);
    }
  }

  const markerPosition = (mLat) => {
    const latlong = mLat.latlng;
    setMarkerPlace({
      mLat: latlong.lat,
      mLong: latlong.lng
    });

    console.log(markerPlace);
  }

  useEffect(() => {
    const getPins = async () => {
      try {
        const allPins = await axios.get("http://localhost:4000/api/pins");
        console.log("got data");
        setPins(allPins.data);
      } catch (err) {
        console.log(err);
      }
    };
    getPins();
  }, []);

  const handleLogout = () => {
    setCurrentUsername(null);
    myStorage.removeItem("user");
  };

  const handleLogin = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  const handleRegister = () => {
    setShowRegister(true);
    setShowLogin(false);
  };

  const Markers = () => {
    const map = useMapEvents({
      click(e) {
        let newLatitude = e.latlng.lat;
        let newLongitude = e.latlng.lng;
        setNewPlace({
          nLat: newLatitude,
          nLong: newLongitude
        });
        newPlace && console.log(newPlace);
      },
    });
  };

  return (
    <div className="App">

      <MapContainer {...viewport} scrollWheelZoom={true}>
        <LeafletgeoSearch />
        <TileLayer
          url="https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png"
        //url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {currentUsername !== null && <Markers />}

        {pins && pins.map(p => (
          p.username !== currentUsername && (
            <Marker position={[p.lat, p.long]} icon={otherIcon}  >
              <Popup
                key={p._id}
                latitude={p.lat}
                longitude={p.long}
                closeButton={true}
                closeOnClick={false}
                anchor="left"
              >
                <div className="card">
                  <br />
                  <label>Place</label>
                  <h4 className="place">{p.title}</h4>
                  <label>Review</label>
                  <p className="desc">{p.desc}</p>
                  <label>Rating</label>
                  <div className="stars">
                    {Array(p.rating).fill(<Star className="star" />)}
                  </div>
                  <label>Information</label>
                  <span className="username">
                    Created by <b>{p.username}</b>
                  </span>
                  <span className="date">{format(p.createdAt)}</span>
                  <br /> <br />
                </div>
              </Popup>
            </Marker>)
        ))};

        {pins && pins.map(p => (
          p.username === currentUsername && (
            <Marker position={[p.lat, p.long]} icon={myIcon} eventHandlers={{ click: markerPosition }}>
              <Popup
                key={p._id}
                latitude={p.lat}
                longitude={p.long}
                closeButton={true}
                closeOnClick={false}
                anchor="left"
              >
                <div className="card">
                  <label>Place</label>
                  <h4 className="place">{p.title}</h4>
                  <label>Review</label>
                  <p className="desc">{p.desc}</p>
                  <label>Rating</label>
                  <div className="stars">
                    {Array(p.rating).fill(<Star className="star" />)}
                  </div>
                  <label>Information</label>
                  <span className="username">
                    Created by <b>{p.username}</b>
                  </span>
                  <span className="date">{format(p.createdAt)}</span>
                  <br />
                  <button type="button" className="remove" onClick={removeMarker}> Delte Marker </button>
                  <br />
                </div>
              </Popup>
            </Marker>)
        ))};

        {newPlace !== null && (
          <Marker position={[newPlace.nLat, newPlace.nLong]} icon={myIcon}>
            <Popup
              latitude={newPlace.nLat}
              longitude={newPlace.nLong}
              closeButton={true}
              closeOnClick={false}
              onClose={() => newPlace(null)}
              anchor="left"
            >
              <div>
                <form onSubmit={handleSubmit}>
                  <label>Title</label>
                  <input
                    name="title"
                    placeholder="Enter a title"
                    autoFocus
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                  <label>Description</label>
                  <textarea
                    placeholder="Say us something about this place."
                    onChange={(e) => setDesc(e.target.value)}
                    required
                  />
                  <label>Rating</label>
                  <select onChange={(e) => setStar(e.target.value)} required>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                  <button type="submit" className="submitButton">
                    Add Pin
                  </button>
                </form>
              </div>
            </Popup>
          </Marker>
        )};

      </MapContainer>

      {currentUsername ? (
        <button className="button logout" onClick={handleLogout}>
          Logout
        </button>
      ) : (
        <div className="buttons">
          <button className="button login" onClick={handleLogin}>
            Login
          </button>
          <button className="button register" onClick={handleRegister}>
            Register
          </button>
        </div>
      )}

      {showRegister && <Register setShowRegister={setShowRegister} />}
      {showLogin && (
        <Login
          setShowLogin={setShowLogin}
          setCurrentUsername={setCurrentUsername}
          myStorage={myStorage}
        />
      )}

      <Card className="footer">
        <CardText className="content"> Made with <span role="img" aria-label="love">❤️</span> by <b>Nishi Patel</b> </CardText>
      </Card>

    </div>
  );

}

export default App;