import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './RiderMap.css';

const geocodeAddress = async (query) => {
    if (!query || query === 'SELF_PICKUP') return null;
    try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/v1';
        const response = await fetch(`${baseUrl}/geocode?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        if (data?.latitude != null && data?.longitude != null) {
            return [parseFloat(data.latitude), parseFloat(data.longitude)];
        }
    } catch (err) {
        console.error('Geocoding failed:', err);
    }
    return null;
};

const FitBounds = ({ positions }) => {
    const map = useMap();

    useEffect(() => {
        if (!positions.length) return;
        if (positions.length === 1) {
            map.setView(positions[0], 14);
            return;
        }
        map.fitBounds(L.latLngBounds(positions), { padding: [48, 48], maxZoom: 15 });
    }, [map, positions]);

    return null;
};

// Fix for default marker icon missing in Leaflet when bundled
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const riderIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2972/2972185.png',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38]
});

const storeIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448650.png',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38]
});

const userIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38]
});

const RiderMap = ({ riderPos, storePos, userPos, storeAddress, userAddress }) => {
    const [resolvedStore, setResolvedStore] = useState(storePos);
    const [resolvedUser, setResolvedUser] = useState(userPos);

    useEffect(() => {
        setResolvedStore(storePos);
    }, [storePos]);

    useEffect(() => {
        setResolvedUser(userPos);
    }, [userPos]);

    useEffect(() => {
        let cancelled = false;

        const resolveMissingCoords = async () => {
            if (!resolvedStore && storeAddress) {
                const coords = await geocodeAddress(storeAddress);
                if (!cancelled && coords) setResolvedStore(coords);
            }
            if (!resolvedUser && userAddress && userAddress !== 'SELF_PICKUP') {
                const coords = await geocodeAddress(userAddress);
                if (!cancelled && coords) setResolvedUser(coords);
            }
        };

        resolveMissingCoords();
        return () => { cancelled = true; };
    }, [resolvedStore, resolvedUser, storeAddress, userAddress]);

    const riderLocation = riderPos || [22.3072, 73.1812];

    const storeLocation = resolvedStore || [
        riderLocation[0] + 0.008,
        riderLocation[1] + 0.006
    ];

    const userLocation = resolvedUser || [
        riderLocation[0] - 0.012,
        riderLocation[1] + 0.014
    ];

    const allPositions = useMemo(
        () => [riderLocation, storeLocation, userLocation],
        [riderLocation, storeLocation, userLocation]
    );

    const center = [
        (riderLocation[0] + storeLocation[0] + userLocation[0]) / 3,
        (riderLocation[1] + storeLocation[1] + userLocation[1]) / 3
    ];

    return (
        <div className="rider-map-container">
            <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%', borderRadius: '16px' }}
            >
                <FitBounds positions={allPositions} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={riderLocation} icon={riderIcon}>
                    <Popup>You are here</Popup>
                </Marker>

                <Marker position={storeLocation} icon={storeIcon}>
                    <Popup>Pickup Location</Popup>
                </Marker>

                <Marker position={userLocation} icon={userIcon}>
                    <Popup>Delivery Location</Popup>
                </Marker>

                <Polyline positions={[riderLocation, storeLocation]} color="#3b82f6" weight={4} dashArray="5, 10" />
                <Polyline positions={[storeLocation, userLocation]} color="#ff6b00" weight={4} dashArray="5, 10" />
            </MapContainer>
            <div className="map-overlay-glow"></div>
        </div>
    );
};

export default RiderMap;
