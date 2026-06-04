import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './RiderMap.css';

// Fix for default marker icon missing in Leaflet when bundled
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Icons for better UX
const riderIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2972/2972185.png', // simple bike icon
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38]
});

const storeIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448650.png', // simple store icon
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38]
});

const userIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png', // user home icon
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38]
});


const RiderMap = ({ riderPos, storePos, userPos }) => {
    // Default positions (fallback)
    const defRider = riderPos || [22.3072, 73.1812]; // Vadodara center
    const defStore = storePos || [22.3122, 73.1792];
    const defUser = userPos || [22.3012, 73.1852];

    const center = [
        (defRider[0] + defStore[0] + defUser[0]) / 3,
        (defRider[1] + defStore[1] + defUser[1]) / 3
    ];

    return (
        <div className="rider-map-container">
            <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%', borderRadius: '16px' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <Marker position={defRider} icon={riderIcon}>
                    <Popup>You are here</Popup>
                </Marker>
                
                {storePos && (
                    <Marker position={defStore} icon={storeIcon}>
                        <Popup>Pickup Location</Popup>
                    </Marker>
                )}

                {userPos && (
                    <Marker position={defUser} icon={userIcon}>
                        <Popup>Delivery Location</Popup>
                    </Marker>
                )}

                {/* Draw Route lines */}
                {storePos && <Polyline positions={[defRider, defStore]} color="#3b82f6" weight={4} dashArray="5, 10" />}
                {userPos && <Polyline positions={[defStore, defUser]} color="#ff6b00" weight={4} dashArray="5, 10" />}
            </MapContainer>
            <div className="map-overlay-glow"></div>
        </div>
    );
};

export default RiderMap;
