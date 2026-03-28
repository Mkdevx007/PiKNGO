import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import './MapView.css';
import { HIGHWAYS } from '../../data/highways';

// Fix for default marker icons in Leaflet with React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons for Source and Destination
const sourceIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const destIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const RoutingEngine = ({ sourceCoords, destinationCoords }) => {
    const map = useMap();
    const routingControlRef = useRef(null);

    useEffect(() => {
        if (!map || !sourceCoords || !destinationCoords) return;

        // Remove existing routing control if it exists
        if (routingControlRef.current) {
            map.removeControl(routingControlRef.current);
        }

        // Create new routing control with improved styling
        routingControlRef.current = L.Routing.control({
            waypoints: [
                L.latLng(sourceCoords.lat, sourceCoords.lon),
                L.latLng(destinationCoords.lat, destinationCoords.lon)
            ],
            lineOptions: {
                styles: [
                    { color: '#000', weight: 8, opacity: 0.3 }, // Shadow/Glow base
                    { color: '#2196F3', weight: 6, opacity: 0.95 } // Main vibrant blue line
                ],
                extendToWaypoints: true,
                missingRouteTolerance: 10
            },
            createMarker: () => null, // Don't create default markers (we have our own)
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            show: false,
            collapsible: true,
            itinerary: {
                containerClassName: 'routing-itinerary-hidden'
            }
        }).addTo(map);

        // Ensure the line is on top and visible
        routingControlRef.current.on('routesfound', (e) => {
            const routes = e.routes;
            if (routes && routes[0]) {
                const bounds = L.latLngBounds(routes[0].coordinates);
                map.fitBounds(bounds, { padding: [50, 50], animate: true });
            }
        });

        // Force hide the container if it's injected
        const container = routingControlRef.current.getContainer();
        if (container) {
            container.style.display = 'none';
        }

        return () => {
            if (routingControlRef.current) {
                map.removeControl(routingControlRef.current);
            }
        };
    }, [map, sourceCoords, destinationCoords]);

    return null;
};

const restaurantIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const MapAutoCenter = ({ coords, focusedHighwayPath }) => {
    const map = useMap();
    useEffect(() => {
        if (focusedHighwayPath && focusedHighwayPath.length > 0) {
            const bounds = L.latLngBounds(focusedHighwayPath);
            map.fitBounds(bounds, { padding: [100, 100], animate: true });
        } else if (coords && coords.length > 0) {
            const bounds = L.latLngBounds(coords);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [coords, focusedHighwayPath, map]);
    return null;
};

const MapView = ({ restaurants, sourceCoords, destinationCoords, hoveredRestId, focusedHighwayId }) => {
    const focusedHighway = HIGHWAYS.find(h => h.id === focusedHighwayId);

    return (
        <div className="map-view-container glass">
            <MapContainer 
                center={[20.5937, 78.9629]} 
                zoom={5} 
                style={{ height: '100%', width: '100%', borderRadius: '16px' }}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                {sourceCoords && (
                    <Marker position={[sourceCoords.lat, sourceCoords.lon]} icon={sourceIcon}>
                        <Popup>Starting Point</Popup>
                    </Marker>
                )}

                {destinationCoords && (
                    <Marker position={[destinationCoords.lat, destinationCoords.lon]} icon={destIcon}>
                        <Popup>Destination</Popup>
                    </Marker>
                )}

                {/* National Highway Routes Layer - Only show if focused */}
                {HIGHWAYS.map(highway => {
                    const isFocused = highway.id === focusedHighwayId;
                    if (!isFocused) return null; // HIDDEN BY DEFAULT

                    return (
                        <Polyline
                            key={highway.id}
                            positions={highway.path}
                            pathOptions={{ 
                                color: highway.color, 
                                weight: 8, 
                                opacity: 1
                            }}
                        >
                            <Tooltip sticky>
                                <div className="highway-tooltip">
                                    <span className="h-badge" style={{ backgroundColor: highway.color }}>{highway.id}</span>
                                    <strong>{highway.name}</strong>
                                    <p>{highway.description}</p>
                                </div>
                            </Tooltip>
                        </Polyline>
                    );
                })}

                <RoutingEngine sourceCoords={sourceCoords} destinationCoords={destinationCoords} />

                {restaurants.map((res) => {
                    const lat = res.latitude || (res.location && res.location.lat);
                    const lon = res.longitude || (res.location && res.location.lon);
                    
                    if (!lat || !lon) return null;

                    return (
                        <Marker 
                            key={res._id || res.id} 
                            position={[lat, lon]} 
                            icon={L.divIcon({
                                className: `custom-div-icon ${hoveredRestId === (res._id || res.id) ? 'marker-hovered' : ''}`,
                                html: `<div class="marker-pin"></div>`,
                                iconSize: [30, 42],
                                iconAnchor: [15, 42]
                            })}
                        >
                            <Popup className="premium-popup">
                                <div className="map-popup">
                                    <div className="popup-header">
                                        <h4>{res.resturantName || res.restaurantName}</h4>
                                    </div>
                                    <p className="popup-address">{res.address}</p>
                                    <div className="popup-footer">
                                        <span className="rating">⭐ 4.5</span>
                                        <button className="book-btn">View Menu</button>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                <MapAutoCenter 
                    coords={restaurants.map(r => [r.latitude || (r.location && r.location.lat), r.longitude || (r.location && r.location.lon)]).filter(c => c[0] && c[1])} 
                    focusedHighwayPath={focusedHighway?.path}
                />
            </MapContainer>
        </div>
    );
};

export default MapView;
