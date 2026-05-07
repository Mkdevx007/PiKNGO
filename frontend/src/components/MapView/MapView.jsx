import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, Tooltip, useMapEvents, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import './MapView.css';
import { HIGHWAYS } from '../../data/highways';
import { calculateDistance } from '../../utils/geoUtils';

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

        // We remove fitBounds from here to let MapAutoCenter handle the holistic view
        // including route and restaurants

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

const hoveredRestaurantIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
    shadowUrl: iconShadow,
    iconSize: [35, 51],
    iconAnchor: [17, 51],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: 'hovered-marker-animate'
});

const MapEvents = ({ onMapClick }) => {
    useMapEvents({
        click: (e) => {
            if (onMapClick) onMapClick(e.latlng.lat, e.latlng.lng);
        }
    });
    return null;
};

const MapAutoCenter = ({ coords, focusedHighwayPath, sourceCoords, destinationCoords }) => {
    const map = useMap();
    useEffect(() => {
        let allPoints = [];

        if (sourceCoords) allPoints.push([sourceCoords.lat, sourceCoords.lon]);
        if (destinationCoords) allPoints.push([destinationCoords.lat, destinationCoords.lon]);
        
        if (coords && coords.length > 0) {
            coords.forEach(c => allPoints.push(c));
        }

        if (focusedHighwayPath && focusedHighwayPath.length > 0) {
            const bounds = L.latLngBounds(focusedHighwayPath);
            map.fitBounds(bounds, { padding: [100, 100], animate: true });
        } else if (allPoints.length > 0) {
            const bounds = L.latLngBounds(allPoints);
            map.fitBounds(bounds, { padding: [80, 80], animate: true });
        }
    }, [coords, focusedHighwayPath, sourceCoords, destinationCoords, map]);
    return null;
};

const MapView = ({ 
    restaurants, 
    sourceCoords, 
    destinationCoords, 
    hoveredRestId, 
    focusedHighwayId,
    onMapClick,
    isSimulating,
    simulatedLocation,
    setSimulatedLocation
}) => {
    const focusedHighway = HIGHWAYS.find(h => h.id === focusedHighwayId);
    const mapRef = useRef();
    const routePointsRef = useRef([]);
    const [isHudMinimized, setIsHudMinimized] = React.useState(false);

    // Capture route points for simulation
    useEffect(() => {
        if (!isSimulating) return;
        
        // Find the routing control line and extract coordinates
        // This is a bit of a hack since routing control doesn't easily expose the line to React
        const interval = setInterval(() => {
            const lines = document.querySelectorAll('.leaflet-interactive');
            // Usually the route line is one of these. 
            // Better way: intercept the routing control 'routesfound' event in RoutingEngine
        }, 1000);
        
        return () => clearInterval(interval);
    }, [isSimulating]);

    // Simple simulation logic: Move towards destination if no complex route available
    useEffect(() => {
        if (!isSimulating || !simulatedLocation || !destinationCoords) return;

        const moveSpeed = 0.005; // Adjustable speed
        
        const simulationTimer = setInterval(() => {
            setSimulatedLocation(prev => {
                if (!prev) return null;
                
                const latDiff = destinationCoords.lat - prev.lat;
                const lonDiff = destinationCoords.lon - prev.lon;
                const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
                
                if (distance < moveSpeed) {
                    return destinationCoords;
                }
                
                return {
                    lat: prev.lat + (latDiff / distance) * moveSpeed,
                    lon: prev.lon + (lonDiff / distance) * moveSpeed
                };
            });
        }, 100);

        return () => clearInterval(simulationTimer);
    }, [isSimulating, destinationCoords, setSimulatedLocation]);

    // Proximity logic: Find the nearest stop based on the map center or current location
    const nearestStop = restaurants.length > 0 ? [...restaurants].sort((a, b) => {
        // Use live simulated distance if available for sorting, otherwise fallback to API distance
        const userLat = simulatedLocation?.lat;
        const userLon = simulatedLocation?.lon;
        
        const distA = (isSimulating && userLat) 
            ? calculateDistance(userLat, userLon, a.latitude || a.location?.lat, a.longitude || a.location?.lon)
            : parseFloat(a.distance);
            
        const distB = (isSimulating && userLat) 
            ? calculateDistance(userLat, userLon, b.latitude || b.location?.lat, b.longitude || b.location?.lon)
            : parseFloat(b.distance);
        
        // Debug logging for missing coordinates
        if ((!a.latitude && !a.location?.lat) && !a._warned) {
            console.warn(`Restaurant ${a.restaurantName} (ID: ${a.id}) is missing GPS coordinates.`);
            a._warned = true;
        }

        return (distA || 9999) - (distB || 9999);
    })[0] : null;

    // Calculate live distance for display
    const liveDistance = nearestStop && isSimulating && simulatedLocation
        ? calculateDistance(simulatedLocation.lat, simulatedLocation.lon, nearestStop.latitude || nearestStop.location?.lat, nearestStop.longitude || nearestStop.location?.lon)
        : nearestStop?.distance;

    // Custom Elite Pulsing Icon Creator - Memoized to prevent jitter during simulation
    const createEliteIcon = React.useCallback((type, isHovered = false) => {
        return L.divIcon({
            className: `elite-div-icon ${type} ${isHovered ? 'hovered' : ''}`,
            html: `
                <div class="elite-marker-ring"></div>
                <div class="elite-marker-core"></div>
                <div class="elite-marker-pulse"></div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
    }, []);

    // Stable icons for Source and Destination to prevent flickering
    const sourceMarkerIcon = React.useMemo(() => createEliteIcon('source'), [createEliteIcon]);
    const destMarkerIcon = React.useMemo(() => createEliteIcon('destination'), [createEliteIcon]);
    const userMarkerIcon = React.useMemo(() => createEliteIcon('user-location'), [createEliteIcon]);
    const restaurantMarkerIcon = React.useMemo(() => createEliteIcon('restaurant'), [createEliteIcon]);
    const restaurantHoveredIcon = React.useMemo(() => createEliteIcon('restaurant', true), [createEliteIcon]);

    return (
        <div className="map-view-container-pro tech-hud-frame">
            {/* Technical Grid Overlay */}
            <div className="map-hud-grid"></div>
            <div className="map-hud-vignette"></div>

            {/* Live Proximity HUD Intel */}
            {nearestStop && (
                <div className={`map-proximity-hud animate-fade-in ${isHudMinimized ? 'minimized' : ''}`}>
                    <div className="hud-intel-header">
                        <span>LIVE INTEL {isHudMinimized ? '' : ': NEXT BEST STOP'}</span>
                        <button 
                            className="hud-toggle-btn" 
                            onClick={() => setIsHudMinimized(!isHudMinimized)}
                        >
                            {isHudMinimized ? '+' : '−'}
                        </button>
                    </div>
                    {!isHudMinimized && (
                        <div className="hud-intel-content">
                            <div className="intel-name">{nearestStop.restaurantName}</div>
                            <div className="intel-meta">
                                <span className="dist">
                                    {liveDistance ? `${parseFloat(liveDistance).toFixed(1)} KM` : 'NO GPS SIGNAL'}
                                    {isSimulating && <span className="sim-badge">LIVE</span>}
                                </span>
                                <span className="divider">|</span>
                                <span className="rating">⭐ {nearestStop.rating || '4.5'}</span>
                            </div>
                        </div>
                    )}
                    <div className="hud-pulse-bar"></div>
                </div>
            )}

            <MapContainer 
                center={[20.5937, 78.9629]} 
                zoom={5} 
                style={{ height: '100%', width: '100%', borderRadius: '24px' }}
                ref={mapRef}
                zoomControl={false}
            >
                <ZoomControl position="bottomright" />
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                <MapEvents onMapClick={onMapClick} />

                {isSimulating && simulatedLocation && (
                    <Marker position={[simulatedLocation.lat, simulatedLocation.lon]} icon={userMarkerIcon}>
                        <Popup className="premium-popup">Scanning Route...</Popup>
                    </Marker>
                )}

                {sourceCoords && (
                    <Marker position={[sourceCoords.lat, sourceCoords.lon]} icon={sourceMarkerIcon}>
                        <Popup className="premium-popup">Starting Point</Popup>
                    </Marker>
                )}

                {destinationCoords && (
                    <Marker position={[destinationCoords.lat, destinationCoords.lon]} icon={destMarkerIcon}>
                        <Popup className="premium-popup">Destination</Popup>
                    </Marker>
                )}

                {/* Neon Route Conduit - Double Layered */}
                {sourceCoords && destinationCoords && (
                    <>
                        <RoutingEngine sourceCoords={sourceCoords} destinationCoords={destinationCoords} />
                        {/* The logic inside RoutingEngine handles the detailed route lines, 
                            but we can add a visual neon glow conduit for specific highways below */}
                    </>
                )}

                {/* Highway Routes Layer with Neon Pulse - Shown only after source is picked but before routing starts */}
                {sourceCoords && !destinationCoords && HIGHWAYS.map(highway => {
                    const isFocused = highway.id === focusedHighwayId;

                    return (
                        <React.Fragment key={highway.id}>
                            {/* Outer Glow Layer */}
                            <Polyline
                                positions={highway.path}
                                pathOptions={{ 
                                    color: highway.color, 
                                    weight: 12, 
                                    opacity: 0.15,
                                    lineCap: 'round'
                                }}
                            />
                            {/* Inner Conduit Layer */}
                            <Polyline
                                positions={highway.path}
                                pathOptions={{ 
                                    color: highway.color, 
                                    weight: 3, 
                                    opacity: 1,
                                    dashArray: '10, 20',
                                    className: 'moving-conduit-pulse'
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
                        </React.Fragment>
                    );
                })}

                {restaurants.map((res) => {
                    const lat = res.latitude || (res.location && res.location.lat);
                    const lon = res.longitude || (res.location && res.location.lon);
                    
                    if (!lat || !lon) return null;

                    const isHovered = (res._id || res.id) === hoveredRestId;

                    return (
                        <Marker 
                            key={res._id || res.id} 
                            position={[lat, lon]} 
                            icon={isHovered ? restaurantHoveredIcon : restaurantMarkerIcon}
                            zIndexOffset={isHovered ? 2000 : 1000} // Ensure they are above the route line
                            ref={(r) => {
                                if (r) {
                                    if (isHovered) {
                                        r.openPopup();
                                    } else {
                                        r.closePopup();
                                    }
                                }
                            }}
                        >
                            <Popup className="premium-popup">
                                <div className="map-popup">
                                    <div className="popup-header">
                                        <h4>{res.restaurantName}</h4>
                                    </div>
                                    <p className="popup-address">{res.address}</p>
                                    <div className="popup-footer">
                                        <span className="rating">⭐ {res.rating || '4.5'}</span>
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
                    sourceCoords={sourceCoords}
                    destinationCoords={destinationCoords}
                />
            </MapContainer>
        </div>
    );
};

export default MapView;
