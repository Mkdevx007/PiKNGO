import React, { useEffect, useState, useRef } from 'react';
import MapboxGLMap, { Marker as MapboxMarker, Source as MapboxSource, Layer as MapboxLayer, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
    Navigation, MapPin, Truck, ShieldCheck, WifiOff, 
    CloudDownload, Play, Pause, RotateCcw, FastForward, Info, Signal
} from 'lucide-react';
import './LiveTrackingMap.css';

// Leaflet fallback imports
import { MapContainer, TileLayer, Marker as LeafletMarker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// Curved Highway Waypoints Generator
const generateCurvedRoute = (start, end, pointsCount = 24) => {
    const route = [];
    const [startLat, startLng] = start;
    const [endLat, endLng] = end;
    
    // Perpendicular vector for offset math (NH-44 realistic bends)
    const dx = endLat - startLat;
    const dy = endLng - startLng;
    const len = Math.sqrt(dx * dx + dy * dy);
    const px = len > 0 ? -dy / len : 0;
    const py = len > 0 ? dx / len : 0;

    for (let i = 0; i < pointsCount; i++) {
        const t = i / (pointsCount - 1);
        // Linear base coords
        let lat = startLat + (endLat - startLat) * t;
        let lng = startLng + (endLng - startLng) * t;
        
        // Dynamic curves: composite sinusoidal wave to simulate expressways bends
        const curveOffset = Math.sin(t * Math.PI) * 0.015 + Math.sin(t * Math.PI * 3) * 0.005;
        lat += px * curveOffset;
        lng += py * curveOffset;
        
        route.push([lat, lng]);
    }
    return route;
};

// Haversine distance calculator for live HUD stats
const haversineDistance = (coords1, coords2) => {
    const [lat1, lon1] = coords1;
    const [lat2, lon2] = coords2;
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const LiveTrackingMap = ({ order, riderLocation }) => {
    const [restaurantLoc, setRestaurantLoc] = useState([28.9950, 77.1211]); // Default NH-44 Murthal
    const [userLoc, setUserLoc] = useState([28.7041, 77.1025]); // Default Delhi
    
    // Simulation state
    const [route, setRoute] = useState([]);
    const [simProgress, setSimProgress] = useState(0); // float from 0 to route.length - 1
    const [isPlaying, setIsPlaying] = useState(true);
    const [speedMultiplier, setSpeedMultiplier] = useState(2); // 1x, 2x, 5x, 10x
    const [simulatedSpeed, setSimulatedSpeed] = useState(72); // km/h
    const [simulatedPing, setSimulatedPing] = useState(52); // ms
    
    const [interpolatedRiderLoc, setInterpolatedRiderLoc] = useState([28.9950, 77.1211]);
    const [isOffline, setIsOffline] = useState(!window.navigator.onLine);
    const [mapCached, setMapCached] = useState(false);

    // Map viewstate (Mapbox)
    const [viewState, setViewState] = useState({
        latitude: 28.8495,
        longitude: 77.1118,
        zoom: 10.5,
        pitch: 50,
        bearing: 0
    });

    const animationRef = useRef(null);
    const lastTimeRef = useRef(null);

    // Detect if valid Mapbox Token exists
    const hasMapboxToken = MAPBOX_TOKEN && MAPBOX_TOKEN.trim().length > 0 && !MAPBOX_TOKEN.includes("placeholder");

    // Offline status detection
    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        // Sim cache load
        const timer = setTimeout(() => setMapCached(true), 2500);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearTimeout(timer);
        };
    }, []);

    // Set locations from order details
    useEffect(() => {
        let rLat = 28.9950;
        let rLng = 77.1211;
        let uLat = 28.7041;
        let uLng = 77.1025;

        if (order) {
            rLat = order.restaurantLatitude || 28.9950;
            rLng = order.restaurantLongitude || 77.1211;
            uLat = order.deliveryLatitude || 28.7041;
            uLng = order.deliveryLongitude || 77.1025;
        }

        setRestaurantLoc([rLat, rLng]);
        setUserLoc([uLat, uLng]);
        
        // Set camera view center coordinates
        setViewState(prev => ({
            ...prev,
            latitude: (rLat + uLat) / 2,
            longitude: (rLng + uLng) / 2,
            zoom: 10
        }));

        // Generate curving NH-44 highway waypoints
        const generated = generateCurvedRoute([rLat, rLng], [uLat, uLng], 30);
        setRoute(generated);
        setSimProgress(0);
        setInterpolatedRiderLoc(generated[0]);
    }, [order]);

    // Butter-smooth 60fps frame-rate rendering loop
    useEffect(() => {
        if (route.length === 0 || !isPlaying) {
            lastTimeRef.current = null;
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            return;
        }

        const animate = (timestamp) => {
            if (!lastTimeRef.current) lastTimeRef.current = timestamp;
            const deltaTime = (timestamp - lastTimeRef.current) / 1000; // in seconds
            lastTimeRef.current = timestamp;

            // Duration of 1 waypoint segment at 1x speed is ~3.5 seconds
            const baseSegmentDuration = 3.5; 
            const progressIncrement = (speedMultiplier * deltaTime) / baseSegmentDuration;

            setSimProgress((prevProgress) => {
                const nextProgress = prevProgress + progressIncrement;
                if (nextProgress >= route.length - 1) {
                    // Loop back to restaurant once completed
                    return 0;
                }
                return nextProgress;
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [route, isPlaying, speedMultiplier]);

    // Interpolate exact position based on simulation float progress
    useEffect(() => {
        if (route.length === 0) return;

        const startIndex = Math.floor(simProgress);
        const endIndex = Math.min(startIndex + 1, route.length - 1);
        const interpolationT = simProgress - startIndex;

        const startPt = route[startIndex];
        const endPt = route[endIndex];

        if (startPt && endPt) {
            const interpolatedLat = startPt[0] + (endPt[0] - startPt[0]) * interpolationT;
            const interpolatedLng = startPt[1] + (endPt[1] - startPt[1]) * interpolationT;
            setInterpolatedRiderLoc([interpolatedLat, interpolatedLng]);
        }

        // Add realistic telemetry fluctuations
        const seed = Math.sin(simProgress * 2);
        setSimulatedSpeed(Math.round(68 + seed * 6));
        setSimulatedPing(Math.round(50 + seed * 12));
    }, [simProgress, route]);

    // Live calculations for HUD overlay card
    const distanceLeft = haversineDistance(interpolatedRiderLoc, userLoc);
    const etaRemaining = Math.max(1, Math.round((distanceLeft / simulatedSpeed) * 60));

    // Custom Leaflet HTML DivIcons
    const restaurantDivIcon = L.divIcon({
        html: `<div class="map-icon restaurant-icon" style="color: #ff6b00;"><div class="icon-inner">🏪</div></div>`,
        className: 'leaflet-div-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });

    const userDivIcon = L.divIcon({
        html: `<div class="map-icon user-icon" style="color: #10b981;"><div class="icon-inner">🏠</div></div>`,
        className: 'leaflet-div-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });

    const riderDivIcon = L.divIcon({
        html: `<div class="leaflet-div-marker-rider">
                 <div class="leaflet-rider-pulse"></div>
                 <div class="leaflet-rider-emoji">🏍️</div>
               </div>`,
        className: 'leaflet-div-marker',
        iconSize: [44, 44],
        iconAnchor: [22, 22]
    });

    // GeoJSON route format for Mapbox renderer
    const mapboxRouteData = {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'LineString',
            coordinates: route.map(coords => [coords[1], coords[0]])
        }
    };

    return (
        <div className="live-tracking-map-container glass-modern animate-fade-in">
            {/* Tech HUD Laser Scanner Line */}
            <div className="hud-scanner-beam"></div>

            {/* Core Telemetry Info Overlay */}
            <div className="tracking-stats-overlay">
                <div className="stat-node accent">
                    <Navigation size={14} className="sparkle-anim" />
                    <span>ETA: {etaRemaining} MINS</span>
                </div>
                {isOffline ? (
                    <div className="stat-node warning animate-pulse">
                        <WifiOff size={14} />
                        <span>STANDALONE NAVIGATION ACTIVE</span>
                    </div>
                ) : (
                    <div className="stat-node success">
                        <ShieldCheck size={14} />
                        <span>SECURE TELEMETRY STREAM</span>
                    </div>
                )}
                {mapCached && (
                    <div className="stat-node">
                        <CloudDownload size={14} />
                        <span>HYBRID CACHE VALID</span>
                    </div>
                )}
            </div>

            {/* Interactive Simulation Console Dashboard */}
            <div className="simulation-hud-panel">
                <div className="sim-header">
                    <span className="sim-title">NH-44 Vector Tracking</span>
                    <span className={`sim-status-badge ${isPlaying ? 'active animate-pulse' : ''}`}>
                        {isPlaying ? '● REAL-TIME SYNC' : '⏸ SIM PAUSED'}
                    </span>
                </div>

                <div className="sim-telemetry-grid">
                    <div className="tel-node">
                        <span className="tel-label">Distance Left</span>
                        <span className="tel-val">{distanceLeft.toFixed(2)} km</span>
                    </div>
                    <div className="tel-node">
                        <span className="tel-label">Vehicle Velocity</span>
                        <span className="tel-val">{simulatedSpeed} km/h</span>
                    </div>
                    <div className="tel-node">
                        <span className="tel-label">Uplink Latency</span>
                        <span className="tel-val">{simulatedPing} ms</span>
                    </div>
                    <div className="tel-node">
                        <span className="tel-label">Telemetry Mode</span>
                        <span className="tel-val" style={{ color: hasMapboxToken ? '#3b82f6' : '#ffbb28' }}>
                            {hasMapboxToken ? 'MAPBOX GL' : 'LEAFLET LITE'}
                        </span>
                    </div>
                </div>

                <div className="sim-controls-actions">
                    <button 
                        className={`hud-btn ${isPlaying ? '' : 'primary'}`} 
                        onClick={() => setIsPlaying(!isPlaying)}
                        title={isPlaying ? "Pause Simulation" : "Resume Simulation"}
                    >
                        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                        <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
                    </button>
                    
                    <button 
                        className="hud-btn" 
                        onClick={() => setSimProgress(0)}
                        title="Reset Trajectory"
                    >
                        <RotateCcw size={14} />
                    </button>

                    <div className="speed-selector">
                        {[1, 2, 5, 10].map(multiplier => (
                            <button 
                                key={multiplier} 
                                className={`speed-opt ${speedMultiplier === multiplier ? 'active' : ''}`}
                                onClick={() => setSpeedMultiplier(multiplier)}
                            >
                                {multiplier}x
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Map Rendering Logic */}
            {hasMapboxToken ? (
                // 1. Premium Mapbox GL Map Renderer
                <MapboxGLMap
                    {...viewState}
                    onMove={evt => setViewState(evt.viewState)}
                    style={{ width: '100%', height: '100%', borderRadius: '24px' }}
                    mapStyle="mapbox://styles/mapbox/dark-v11"
                    mapboxAccessToken={MAPBOX_TOKEN}
                >
                    <NavigationControl position="top-right" />

                    {route.length > 0 && (
                        <MapboxSource id="route" type="geojson" data={mapboxRouteData}>
                            <MapboxLayer
                                id="route-layer"
                                type="line"
                                paint={{
                                    'line-color': '#ff6b00',
                                    'line-width': 4,
                                    'line-dasharray': [2, 2],
                                    'line-opacity': 0.7
                                }}
                            />
                        </MapboxSource>
                    )}

                    <MapboxMarker longitude={restaurantLoc[1]} latitude={restaurantLoc[0]} anchor="bottom">
                        <div className="map-icon restaurant-icon" style={{ color: '#ff6b00' }}>
                            <div className="icon-inner">🏪</div>
                        </div>
                    </MapboxMarker>

                    <MapboxMarker longitude={userLoc[1]} latitude={userLoc[0]} anchor="bottom">
                        <div className="map-icon user-icon" style={{ color: '#10b981' }}>
                            <div className="icon-inner">🏠</div>
                        </div>
                    </MapboxMarker>

                    {interpolatedRiderLoc && (
                        <MapboxMarker longitude={interpolatedRiderLoc[1]} latitude={interpolatedRiderLoc[0]} anchor="bottom">
                            <div className="rider-icon-mapbox">
                                <div className="icon-inner">🏍️</div>
                                <div className="rider-pulse-glow"></div>
                            </div>
                        </MapboxMarker>
                    )}
                </MapboxGLMap>
            ) : (
                // 2. High-Fidelity Leaflet Dark Mode Map Fallback
                <MapContainer
                    center={[(restaurantLoc[0] + userLoc[0]) / 2, (restaurantLoc[1] + userLoc[1]) / 2]}
                    zoom={10.5}
                    style={{ width: '100%', height: '100%', borderRadius: '24px' }}
                    zoomControl={false}
                    attributionControl={false}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />

                    {route.length > 0 && (
                        <>
                            {/* Curved highway path glowing trace */}
                            <Polyline
                                positions={route}
                                className="leaflet-neon-glow-bg"
                                weight={8}
                            />
                            <Polyline
                                positions={route}
                                className="leaflet-neon-path"
                                weight={3.5}
                            />
                        </>
                    )}

                    {/* Restaurant Marker */}
                    <LeafletMarker position={restaurantLoc} icon={restaurantDivIcon}>
                        <Popup>
                            <div className="admin-popup">
                                <strong>NH-44 Dhaba/Eatery Hub</strong>
                                <p>Order dispatch unit active.</p>
                            </div>
                        </Popup>
                    </LeafletMarker>

                    {/* Rider Marker (Buttery smooth simulated position) */}
                    {interpolatedRiderLoc && (
                        <LeafletMarker position={interpolatedRiderLoc} icon={riderDivIcon} />
                    )}

                    {/* User Home Marker */}
                    <LeafletMarker position={userLoc} icon={userDivIcon}>
                        <Popup>
                            <div className="admin-popup">
                                <strong>Your Highway Delivery Hub</strong>
                                <p>Awaiting pre-ordered courier.</p>
                            </div>
                        </Popup>
                    </LeafletMarker>
                </MapContainer>
            )}

            {/* High-Tech HUD Bottom-Right Metadata */}
            <div className="map-footer-intel">
                <div className="intel-row">
                    <Signal size={12} className="text-amber animate-pulse" />
                    <span>NH-44 LOGISTICS LINK // ACTIVE</span>
                </div>
            </div>
        </div>
    );
};

export default LiveTrackingMap;
