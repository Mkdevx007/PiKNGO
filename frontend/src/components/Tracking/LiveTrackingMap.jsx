import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, MapPin, Truck, ShieldCheck } from 'lucide-react';
import './LiveTrackingMap.css';

// Fix for default marker icons in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons for Food App
const restaurantIcon = L.divIcon({
    html: `<div class="map-icon restaurant-icon"><div class="icon-inner">🏪</div></div>`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 40]
});

const userIcon = L.divIcon({
    html: `<div class="map-icon user-icon"><div class="icon-inner">🏠</div></div>`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 40]
});

const riderIcon = L.divIcon({
    html: `<div class="map-icon rider-icon"><div class="icon-inner">🏍️</div></div>`,
    className: '',
    iconSize: [50, 50],
    iconAnchor: [25, 50]
});

// Component to handle map centering and bounds
const MapRefresher = ({ restaurantLoc, userLoc, riderLoc }) => {
    const map = useMap();
    
    useEffect(() => {
        if (restaurantLoc && userLoc) {
            const bounds = L.latLngBounds([restaurantLoc, userLoc]);
            if (riderLoc) bounds.extend(riderLoc);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [restaurantLoc, userLoc, riderLoc, map]);

    return null;
};

const LiveTrackingMap = ({ order, riderLocation }) => {
    // Default coordinates (Highway context - NH-44 near Delhi/Murthal)
    const [restaurantLoc, setRestaurantLoc] = useState([28.9950, 77.1211]); 
    const [userLoc, setUserLoc] = useState([28.7041, 77.1025]);
    const [riderLoc, setRiderLoc] = useState(null);

    useEffect(() => {
        if (order) {
            // Priority: actual order coordinates > restaurant entity coordinates > defaults
            const rLat = order.restaurantLatitude || 28.6139;
            const rLng = order.restaurantLongitude || 77.2090;
            
            const uLat = order.deliveryLatitude || 28.5355;
            const uLng = order.deliveryLongitude || 77.3910;

            setRestaurantLoc([rLat, rLng]);
            setUserLoc([uLat, uLng]);
            
            if (riderLocation) {
                setRiderLoc([riderLocation.latitude, riderLocation.longitude]);
            } else if (order.riderLatitude && order.riderLongitude) {
                setRiderLoc([order.riderLatitude, order.riderLongitude]);
            } else if (order.status === 'READY' || order.status === 'PICKED_UP' || order.status === 'OUT_FOR_DELIVERY') {
                 // If no live location yet, show at restaurant as starting point
                 setRiderLoc([rLat, rLng]);
            }
        }
    }, [order, riderLocation]);

    return (
        <div className="live-tracking-map-container glass-modern animate-fade-in">
            <div className="tracking-stats-overlay">
                <div className="stat-node">
                    <Navigation size={16} />
                    <span>ETA: 12 MINS</span>
                </div>
                <div className="stat-node accent">
                    <ShieldCheck size={16} />
                    <span>SECURE HUB TRANSIT</span>
                </div>
            </div>

            <MapContainer 
                center={restaurantLoc} 
                zoom={10} 
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%", borderRadius: "24px" }}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                
                <MapRefresher restaurantLoc={restaurantLoc} userLoc={userLoc} riderLoc={riderLoc} />

                <Marker position={restaurantLoc} icon={restaurantIcon}>
                    <Popup className="glass-modern">
                        <strong>Restaurant Hub</strong><br/>{order?.restaurantName || "PikNGo Terminal"}
                    </Popup>
                </Marker>

                <Marker position={userLoc} icon={userIcon}>
                    <Popup>
                        <strong>Your Destination</strong><br/>{order?.deliveryAddress || "Target Hub"}
                    </Popup>
                </Marker>

                {riderLoc && (
                    <Marker position={riderLoc} icon={riderIcon}>
                        <Popup>
                            <strong>Rider Intel</strong><br/>Intercepting your order...
                        </Popup>
                    </Marker>
                )}

                {/* Route Path Line */}
                <Polyline 
                    positions={[restaurantLoc, userLoc]} 
                    color="var(--accent-orange)" 
                    weight={4} 
                    opacity={0.6}
                    dashArray="10, 10"
                />
            </MapContainer>

            <div className="map-footer-intel">
                <div className="intel-row">
                    <Truck size={14} />
                    <span>TRANSMISSION ACTIVE: NH-44 LOGISTICS HUB</span>
                </div>
            </div>
        </div>
    );
};

export default LiveTrackingMap;
