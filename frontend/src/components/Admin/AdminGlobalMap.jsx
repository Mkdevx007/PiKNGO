import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair, Package, Activity } from 'lucide-react';
import '../Tracking/LiveTrackingMap.css'; // Reuse icon styles

const AdminGlobalMap = ({ orders }) => {
    const [activeOrders, setActiveOrders] = useState([]);

    useEffect(() => {
        // Filter for active orders and simulate coordinates
        const filtered = (orders || []).filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
        
        const mapped = filtered.map((o, idx) => {
            // Simulated coordinates centered around NH-44 Murthal/Delhi
            const rLat = 28.9950 + (Math.random() - 0.5) * 0.1;
            const rLng = 77.1211 + (Math.random() - 0.5) * 0.1;
            return { ...o, lat: rLat, lng: rLng };
        });
        
        setActiveOrders(mapped);
    }, [orders]);

    const MapCenterer = ({ points }) => {
        const map = useMap();
        useEffect(() => {
            if (points.length > 0) {
                const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }, [points, map]);
        return null;
    };

    const restaurantIcon = L.divIcon({
        html: `<div class="map-icon restaurant-icon"><div class="icon-inner">🏪</div></div>`,
        className: '',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });

    return (
        <div className="admin-global-map-wrapper glass-modern">
            <div className="map-hud-header">
                <div className="hud-node">
                    <Crosshair size={14} />
                    <span>SURVEILLANCE ACTIVE</span>
                </div>
                <div className="hud-node accent">
                    <Activity size={14} />
                    <span>{activeOrders.length} ACTIVE TRANSMISSIONS</span>
                </div>
            </div>

            <MapContainer 
                center={[28.7041, 77.1025]} 
                zoom={10} 
                style={{ height: "400px", width: "100%", borderRadius: "16px" }}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                
                <MapCenterer points={activeOrders} />

                {activeOrders.map(order => (
                    <Marker key={order.id} position={[order.lat, order.lng]} icon={restaurantIcon}>
                        <Popup>
                            <div className="admin-popup">
                                <strong>Order #{order.id.substring(0, 6)}</strong>
                                <p>{order.restaurantName}</p>
                                <span className={`status-tag ${order.status.toLowerCase()}`}>{order.status}</span>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default AdminGlobalMap;
