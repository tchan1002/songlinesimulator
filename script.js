/**
 * Chicago Songline Simulator - Phase 1-2
 * Google Maps Integration and Route Parsing
 *
 * This script handles:
 * - Google Maps initialization
 * - Transit directions requests (bus and rail)
 * - Route segment parsing into structured data
 * - Map visualization with colored polylines
 *
 * The parsed route data is stored in window.routeSegments for use by Phase 3-5
 */

// Global variables
let map;
let directionsService;
let directionsRenderer;
let mapOverlays = []; // Store polylines and markers for cleanup

/**
 * Global route segments array - used by Phase 3-5 agents
 * Structure:
 * {
 *   mode: 'BUS' | 'RAIL' | 'WALKING' | 'DRIVING',
 *   routeNumber: string,        // For buses (e.g., "22")
 *   lineName: string,           // For trains (e.g., "Red Line")
 *   lineColor: string,          // For trains (e.g., "#c60c30")
 *   direction: string,          // Travel direction
 *   stops: number,              // Number of stops
 *   duration: number,           // Duration in seconds
 *   distance: number,           // Distance in meters
 *   polyline: string            // Encoded polyline for mapping
 * }
 */
window.routeSegments = [];

// Chicago CTA line colors for visualization
const CTA_COLORS = {
    'Red Line': '#c60c30',
    'Blue Line': '#00a1de',
    'Brown Line': '#62361b',
    'Green Line': '#009b3a',
    'Orange Line': '#f9461c',
    'Purple Line': '#522398',
    'Yellow Line': '#f9e300',
    'Pink Line': '#e27ea6'
};

// Default colors for different transit modes
const MODE_COLORS = {
    'BUS': '#4285f4',
    'RAIL': '#ea4335',
    'WALKING': '#34a853',
    'DRIVING': '#fbbc04'
};

/**
 * Initialize Google Maps - callback for async API load
 */
window.initApp = function() {
    console.log('🗺️  initApp callback triggered');
    initMap();
};

/**
 * Initialize Google Maps on page load
 */
function initMap() {
    console.log('🗺️  Initializing Google Maps...');

    // Center on Chicago
    const chicago = { lat: 41.8781, lng: -87.6298 };

    // Clear placeholder
    const mapView = document.getElementById('map-view');
    const placeholder = mapView.querySelector('.map-placeholder');
    if (placeholder) {
        console.log('✓ Removing map placeholder');
        placeholder.remove();
    }

    // Create map
    map = new google.maps.Map(document.getElementById('map-view'), {
        zoom: 11,
        center: chicago,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        styles: [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
            }
        ]
    });

    // Initialize directions service
    directionsService = new google.maps.DirectionsService();

    console.log('✅ Google Maps initialized - Chicago Songline Simulator ready');
    updateAPIKeyStatus(true);
}

/**
 * Request transit directions between two addresses
 */
function requestDirections(origin, destination) {
    console.log('\n🚀 ========== ROUTE GENERATION STARTED ==========');
    console.log('📍 Origin:', origin);
    console.log('📍 Destination:', destination);

    showLoading();
    hideError();

    // Clear previous outputs
    clearOutputs();

    const request = {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.TRANSIT,
        transitOptions: {
            modes: [
                google.maps.TransitMode.BUS,
                google.maps.TransitMode.RAIL
            ],
            routingPreference: google.maps.TransitRoutePreference.FEWER_TRANSFERS
        },
        region: 'us',
        unitSystem: google.maps.UnitSystem.IMPERIAL
    };

    console.log('📤 Sending request to Google Directions API...');
    console.log('Request config:', request);

    directionsService.route(request, (result, status) => {
        console.log('📥 Directions API response received');
        console.log('Status:', status);

        hideLoading();

        if (status === google.maps.DirectionsStatus.OK) {
            console.log('✅ Directions request successful');
            console.log('Raw result:', result);
            handleDirectionsSuccess(result);
        } else {
            console.error('❌ Directions request failed');
            console.error('Error status:', status);
            handleDirectionsError(status);
        }
    });
}

/**
 * Clear previous outputs before generating new route
 */
function clearOutputs() {
    // Clear timeline
    const timelineContainer = document.getElementById('sound-timeline');
    if (timelineContainer) {
        const canvas = timelineContainer.querySelector('#timeline-canvas');
        const controls = timelineContainer.querySelector('#audio-controls-container');
        if (canvas) canvas.remove();
        if (controls) controls.remove();

        // Reset placeholder
        const placeholder = document.createElement('p');
        placeholder.className = 'placeholder-text';
        placeholder.textContent = 'Audio timeline will appear here after route generation';
        timelineContainer.appendChild(placeholder);
    }

    // Clear quilt
    const quiltContainer = document.getElementById('quilt-pattern');
    if (quiltContainer) {
        quiltContainer.innerHTML = '<div class="placeholder-icon">🎨</div><p class="placeholder-text">Your unique textile pattern will appear here</p>';
    }

    // Stop any playing audio (only if audio controls exist)
    if (typeof stopAudio === 'function' && document.getElementById('play-btn')) {
        stopAudio();
    }
}

/**
 * Handle successful directions response
 */
function handleDirectionsSuccess(result) {
    console.log('Directions API Response:', result);

    // Parse route into segments
    const segments = parseRouteSegments(result);
    window.routeSegments = segments;

    console.log('Parsed Route Segments:', segments);
    console.log(`Total segments: ${segments.length}`);

    // Log summary
    const summary = generateRouteSummary(segments);
    console.log('Route Summary:', summary);

    // Display route on map
    displayRouteOnMap(result, segments);

    // Render timeline visualization
    renderTimeline(segments);

    // Generate quilt pattern
    generateQuilt(segments);

    // Show success message
    showSuccess(`Route generated: ${segments.length} segments, ${summary.totalDuration} minutes`);
}

/**
 * Calculate bearing (direction) between two lat/lng points
 * Returns bearing in degrees (0-360, where 0/360 = North)
 */
function calculateBearing(lat1, lon1, lat2, lon2) {
    const toRadians = (deg) => deg * Math.PI / 180;
    const toDegrees = (rad) => rad * 180 / Math.PI;

    const dLon = toRadians(lon2 - lon1);
    const lat1Rad = toRadians(lat1);
    const lat2Rad = toRadians(lat2);

    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

    const bearing = toDegrees(Math.atan2(y, x));
    return (bearing + 360) % 360; // Normalize to 0-360
}

/**
 * Convert bearing to cardinal direction
 */
function getCardinalDirection(bearing) {
    const directions = ['North', 'NE', 'East', 'SE', 'South', 'SW', 'West', 'NW'];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
}

/**
 * Get direction arrow symbol
 */
function getDirectionArrow(bearing) {
    const arrows = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'];
    const index = Math.round(bearing / 45) % 8;
    return arrows[index];
}

/**
 * Parse Google Directions result into structured route segments
 */
function parseRouteSegments(directionsResult) {
    console.log('🔍 Parsing route segments...');

    const segments = [];
    const route = directionsResult.routes[0];
    const legs = route.legs;

    console.log(`Found ${legs.length} leg(s) in route`);

    legs.forEach((leg, legIndex) => {
        console.log(`\n--- Leg ${legIndex + 1}: ${leg.steps.length} steps ---`);

        leg.steps.forEach((step, stepIndex) => {
            console.log(`\nStep ${stepIndex + 1}:`, step.travel_mode);

            const segment = {
                mode: step.travel_mode,
                routeNumber: null,
                lineName: null,
                lineColor: null,
                direction: null,
                stops: 0,
                duration: step.duration.value, // seconds
                distance: step.distance.value, // meters
                polyline: step.polyline.points,
                instructions: step.instructions
            };

            // Parse transit-specific details
            if (step.travel_mode === 'TRANSIT' && step.transit) {
                const transitDetails = step.transit;
                const line = transitDetails.line;

                console.log('  Transit details:', {
                    vehicle: line.vehicle.type,
                    name: line.name,
                    short_name: line.short_name,
                    color: line.color,
                    stops: transitDetails.num_stops
                });

                // Determine if bus or rail
                if (line.vehicle.type === 'BUS') {
                    segment.mode = 'BUS';
                    segment.routeNumber = line.short_name || line.name;
                    console.log(`  ✓ Bus route: ${segment.routeNumber}`);
                } else if (line.vehicle.type === 'SUBWAY' ||
                           line.vehicle.type === 'HEAVY_RAIL' ||
                           line.vehicle.type === 'COMMUTER_TRAIN') {
                    segment.mode = 'RAIL';
                    // Standardize line names
                    segment.lineName = standardizeCTALineName(line.name);

                    // Handle color - API sometimes includes # prefix, sometimes doesn't
                    if (line.color) {
                        const rawColor = line.color.replace(/^#/, ''); // Remove # if present
                        segment.lineColor = `#${rawColor}`; // Add it back cleanly
                    } else {
                        segment.lineColor = getCTALineColor(segment.lineName);
                    }

                    console.log(`  ✓ Rail line: ${segment.lineName} (${segment.lineColor})`);
                }

                // Direction and stops
                segment.direction = transitDetails.headsign || null;
                segment.stops = transitDetails.num_stops || 0;

                console.log(`  Direction: ${segment.direction}`);
                console.log(`  Stops: ${segment.stops}`);

                // Store departure and arrival info
                segment.departure = {
                    stop: transitDetails.departure_stop.name,
                    time: transitDetails.departure_time.text
                };
                segment.arrival = {
                    stop: transitDetails.arrival_stop.name,
                    time: transitDetails.arrival_time.text
                };

                console.log(`  From: ${segment.departure.stop}`);
                console.log(`  To: ${segment.arrival.stop}`);
            } else if (step.travel_mode === 'WALKING') {
                console.log(`  ✓ Walking: ${(step.distance.value * 0.000621371).toFixed(2)} miles`);
            } else if (step.travel_mode === 'DRIVING') {
                console.log(`  ✓ Driving: ${(step.distance.value * 0.000621371).toFixed(2)} miles`);
            }

            // Calculate bearing from polyline start/end points
            try {
                const path = google.maps.geometry.encoding.decodePath(segment.polyline);
                if (path.length >= 2) {
                    const start = path[0];
                    const end = path[path.length - 1];
                    segment.bearing = calculateBearing(start.lat(), start.lng(), end.lat(), end.lng());
                    segment.cardinalDirection = getCardinalDirection(segment.bearing);
                    segment.directionArrow = getDirectionArrow(segment.bearing);
                    console.log(`  🧭 Bearing: ${segment.bearing.toFixed(1)}° (${segment.cardinalDirection}) ${segment.directionArrow}`);
                }
            } catch (e) {
                console.warn('  ⚠️  Could not calculate bearing:', e);
                segment.bearing = null;
                segment.cardinalDirection = null;
                segment.directionArrow = null;
            }

            segments.push(segment);
        });
    });

    return segments;
}

/**
 * Get CTA line color by name
 */
/**
 * Standardize CTA line names to match our color map
 * Handles variations like "CTA Red Line", "Red", "red line" → "Red Line"
 */
function standardizeCTALineName(rawName) {
    if (!rawName) return null;

    const normalized = rawName.toLowerCase().trim();

    // Remove "CTA" prefix if present
    const cleanName = normalized.replace(/^cta\s+/, '');

    // Map to standard names
    const lineMap = {
        'red': 'Red Line',
        'blue': 'Blue Line',
        'brown': 'Brown Line',
        'green': 'Green Line',
        'orange': 'Orange Line',
        'purple': 'Purple Line',
        'yellow': 'Yellow Line',
        'pink': 'Pink Line'
    };

    // Check each color
    for (const [color, standardName] of Object.entries(lineMap)) {
        if (cleanName.includes(color)) {
            console.log(`  📌 Standardized "${rawName}" → "${standardName}"`);
            return standardName;
        }
    }

    // If already in standard format
    if (cleanName.endsWith(' line')) {
        const capitalized = cleanName
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        return capitalized;
    }

    console.warn(`  ⚠️  Could not standardize line name: "${rawName}"`);
    return rawName; // Return as-is if we can't standardize
}

function getCTALineColor(lineName) {
    if (!lineName) return null;

    // Check direct match first
    if (CTA_COLORS[lineName]) {
        return CTA_COLORS[lineName];
    }

    // Check if line name matches known CTA lines
    for (const [line, color] of Object.entries(CTA_COLORS)) {
        if (lineName.toLowerCase().includes(line.toLowerCase().replace(' Line', ''))) {
            return color;
        }
    }

    console.warn(`  ⚠️  No color found for line: "${lineName}"`);
    return null;
}

/**
 * Generate route summary statistics
 */
function generateRouteSummary(segments) {
    const summary = {
        totalDuration: 0,
        totalDistance: 0,
        busSegments: 0,
        railSegments: 0,
        walkingSegments: 0,
        totalStops: 0,
        lines: []
    };

    segments.forEach(segment => {
        summary.totalDuration += segment.duration;
        summary.totalDistance += segment.distance;
        summary.totalStops += segment.stops;

        if (segment.mode === 'BUS') {
            summary.busSegments++;
            if (segment.routeNumber && !summary.lines.includes(segment.routeNumber)) {
                summary.lines.push(`Bus ${segment.routeNumber}`);
            }
        } else if (segment.mode === 'RAIL') {
            summary.railSegments++;
            if (segment.lineName && !summary.lines.includes(segment.lineName)) {
                summary.lines.push(segment.lineName);
            }
        } else if (segment.mode === 'WALKING') {
            summary.walkingSegments++;
        }
    });

    // Convert duration to minutes
    summary.totalDuration = Math.round(summary.totalDuration / 60);

    // Convert distance to miles
    summary.totalDistance = (summary.totalDistance * 0.000621371).toFixed(2);

    return summary;
}

/**
 * Display route on map with colored polylines
 */
function displayRouteOnMap(directionsResult, segments) {
    // Clear existing overlays
    if (directionsRenderer) {
        directionsRenderer.setMap(null);
    }

    // Clear all previous polylines and markers
    mapOverlays.forEach(overlay => {
        overlay.setMap(null);
    });
    mapOverlays = [];

    // Create bounds to fit all segments
    const bounds = new google.maps.LatLngBounds();

    // Draw each segment with appropriate color
    segments.forEach((segment, index) => {
        const step = getStepFromDirections(directionsResult, index);
        if (!step) return;

        const color = getSegmentColor(segment);

        const polyline = new google.maps.Polyline({
            path: google.maps.geometry.encoding.decodePath(segment.polyline),
            strokeColor: color,
            strokeOpacity: 0.8,
            strokeWeight: 6,
            map: map
        });

        // Store polyline for cleanup
        mapOverlays.push(polyline);

        // Extend bounds to include this segment
        polyline.getPath().forEach(latLng => {
            bounds.extend(latLng);
        });

        // Add click listener for segment info
        polyline.addListener('click', () => {
            showSegmentInfo(segment, polyline.getPath().getAt(0));
        });
    });

    // Fit map to show entire route
    map.fitBounds(bounds);

    // Add start and end markers
    addRouteMarkers(directionsResult);
}

/**
 * Get step from directions result by index
 */
function getStepFromDirections(directionsResult, index) {
    let currentIndex = 0;
    const legs = directionsResult.routes[0].legs;

    for (const leg of legs) {
        for (const step of leg.steps) {
            if (currentIndex === index) {
                return step;
            }
            currentIndex++;
        }
    }

    return null;
}

/**
 * Get color for a route segment
 */
function getSegmentColor(segment) {
    if (segment.mode === 'RAIL' && segment.lineColor) {
        return segment.lineColor;
    }

    return MODE_COLORS[segment.mode] || '#333333';
}

/**
 * Add start and end markers to the map
 */
function addRouteMarkers(directionsResult) {
    const route = directionsResult.routes[0];
    const leg = route.legs[0];

    // Start marker
    const startMarker = new google.maps.Marker({
        position: leg.start_location,
        map: map,
        label: 'A',
        title: 'Origin: ' + leg.start_address
    });
    mapOverlays.push(startMarker);

    // End marker
    const endMarker = new google.maps.Marker({
        position: leg.end_location,
        map: map,
        label: 'B',
        title: 'Destination: ' + leg.end_address
    });
    mapOverlays.push(endMarker);
}

/**
 * Show info window for a segment
 */
function showSegmentInfo(segment, position) {
    let content = `<div style="padding: 8px; max-width: 250px;">`;
    content += `<strong>${segment.mode}</strong><br>`;

    if (segment.mode === 'BUS' && segment.routeNumber) {
        content += `Route: ${segment.routeNumber}<br>`;
    }
    if (segment.mode === 'RAIL' && segment.lineName) {
        content += `Line: ${segment.lineName}<br>`;
    }
    if (segment.direction) {
        content += `Direction: ${segment.direction}<br>`;
    }
    if (segment.stops > 0) {
        content += `Stops: ${segment.stops}<br>`;
    }

    content += `Duration: ${Math.round(segment.duration / 60)} min<br>`;
    content += `Distance: ${(segment.distance * 0.000621371).toFixed(2)} mi`;
    content += `</div>`;

    const infoWindow = new google.maps.InfoWindow({
        content: content,
        position: position
    });

    infoWindow.open(map);
}

/**
 * Handle directions API errors
 */
function handleDirectionsError(status) {
    let errorMessage = 'Unable to generate route. ';
    let suggestion = '';

    switch (status) {
        case google.maps.DirectionsStatus.NOT_FOUND:
            errorMessage += 'One or both addresses could not be found.';
            suggestion = 'Try adding "Chicago, IL" to your addresses or be more specific.';
            break;
        case google.maps.DirectionsStatus.ZERO_RESULTS:
            errorMessage += 'No transit route found between these locations.';
            suggestion = 'Try addresses within Chicago city limits, or use the Example Route button.';
            break;
        case google.maps.DirectionsStatus.MAX_ROUTE_LENGTH_EXCEEDED:
            errorMessage += 'Route is too long.';
            suggestion = 'Try addresses closer together within Chicago.';
            break;
        case google.maps.DirectionsStatus.INVALID_REQUEST:
            errorMessage += 'Invalid request.';
            suggestion = 'Please enter complete street addresses in Chicago.';
            break;
        case google.maps.DirectionsStatus.OVER_QUERY_LIMIT:
            errorMessage += 'Query limit exceeded.';
            suggestion = 'Please wait a moment and try again.';
            break;
        case google.maps.DirectionsStatus.REQUEST_DENIED:
            errorMessage += 'Request denied.';
            suggestion = 'Check that your Google Maps API key is configured correctly in index.html.';
            break;
        case google.maps.DirectionsStatus.UNKNOWN_ERROR:
            errorMessage += 'Unknown error occurred.';
            suggestion = 'This is usually temporary. Please try again in a moment.';
            break;
        default:
            errorMessage += 'Please check your addresses and try again.';
            suggestion = 'Make sure both addresses are valid locations in Chicago.';
    }

    if (suggestion) {
        errorMessage += ' ' + suggestion;
    }

    showError(errorMessage);
    console.error('Directions error:', status);
}

/**
 * UI Helper Functions
 */
function showLoading() {
    document.getElementById('loading-message').style.display = 'block';
    document.getElementById('generate-btn').disabled = true;
}

function hideLoading() {
    document.getElementById('loading-message').style.display = 'none';
    document.getElementById('generate-btn').disabled = false;
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function hideError() {
    document.getElementById('error-message').style.display = 'none';
}

function showSuccess(message) {
    // Could add a success message element, for now just log
    console.log('Success:', message);
}

/**
 * Update API key status indicator
 */
function updateAPIKeyStatus(isValid) {
    const statusElement = document.getElementById('api-key-status');
    if (!statusElement) return;

    if (isValid) {
        statusElement.textContent = '✓ Google Maps API connected';
        statusElement.className = 'api-key-status success';
    } else {
        statusElement.innerHTML = `⚠️ Google Maps API key not configured<br>
            <small>Please add your API key in index.html (line 72)</small>`;
        statusElement.className = 'api-key-status error';
    }
}

/**
 * Keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Space bar - play/pause
        if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            const playBtn = document.getElementById('play-btn');
            const pauseBtn = document.getElementById('pause-btn');

            if (playBtn && !playBtn.disabled) {
                playBtn.click();
            } else if (pauseBtn && !pauseBtn.disabled) {
                pauseBtn.click();
            }
        }

        // Escape - stop playback
        if (e.code === 'Escape') {
            const stopBtn = document.getElementById('stop-btn');
            if (stopBtn && !stopBtn.disabled) {
                stopBtn.click();
            }
        }
    });
}

/**
 * Event Listeners
 */
document.addEventListener('DOMContentLoaded', () => {
    // Setup keyboard shortcuts
    setupKeyboardShortcuts();

    // Wait for Google Maps to load
    if (typeof google !== 'undefined') {
        initMap();
    } else {
        console.error('Google Maps API not loaded. Check your API key.');
        showError('Google Maps API not loaded. Please check your API key in index.html');
        updateAPIKeyStatus(false);
    }

    // Generate button
    document.getElementById('generate-btn').addEventListener('click', () => {
        const origin = document.getElementById('origin').value.trim();
        const destination = document.getElementById('destination').value.trim();

        if (!origin || !destination) {
            showError('Please enter both origin and destination addresses.');
            return;
        }

        requestDirections(origin, destination);
    });

    // Example route button
    document.getElementById('example-btn').addEventListener('click', () => {
        document.getElementById('origin').value = 'University of Chicago, Chicago, IL';
        document.getElementById('destination').value = "O'Hare International Airport, Chicago, IL";
        hideError();
    });

    // Allow Enter key to submit
    document.getElementById('origin').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('generate-btn').click();
        }
    });

    document.getElementById('destination').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('generate-btn').click();
        }
    });

    // Add helpful console message
    console.log('%c🎵 Chicago Songline Simulator', 'font-size: 20px; font-weight: bold; color: #00a1de;');
    console.log('%cKeyboard shortcuts:', 'font-weight: bold;');
    console.log('  Enter - Generate songline');
    console.log('  Space - Play/Pause audio');
    console.log('  Escape - Stop audio');
});

/**
 * Expose init function for Google Maps callback
 */
window.initMap = initMap;

/**
 * ============================================================================
 * PHASE 4: TIMELINE VISUALIZATION
 * ============================================================================
 */

// Timeline state
let timelineCanvas = null;
let timelineCtx = null;
let playbackPosition = 0; // 0 to 1 representing progress through route

/**
 * Color mappings for timeline visualization
 */
const TIMELINE_COLORS = {
    BUS: '#FF6B35',           // Orange
    RAIL: null,               // Use actual line color
    WALKING: '#999999',       // Gray
    DRIVING: '#87CEEB'        // Light blue
};

/**
 * Main timeline rendering function
 * Creates a canvas-based visualization of route segments
 */
function renderTimeline(segments) {
    if (!segments || segments.length === 0) {
        console.warn('No segments to render in timeline');
        return;
    }

    // Get container and clear it
    const container = document.getElementById('sound-timeline');
    // Remove only the placeholder text, keep controls if they exist
    const placeholders = container.querySelectorAll('.placeholder-text, .placeholder-icon');
    placeholders.forEach(p => p.remove());

    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.id = 'timeline-canvas';
    container.appendChild(canvas);

    timelineCanvas = canvas;
    timelineCtx = canvas.getContext('2d');

    // Set canvas size (high DPI support)
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 180 * dpr; // Fixed height for timeline
    canvas.style.width = rect.width + 'px';
    canvas.style.height = '180px';

    // Scale context for high DPI
    timelineCtx.scale(dpr, dpr);

    // Store dimensions for later use
    const width = rect.width;
    const height = 180;

    // Draw the timeline
    drawTimeline(segments, width, height);

    // Add interactivity
    addTimelineInteractivity(canvas, segments, width, height);

    // Add resize handler
    window.addEventListener('resize', () => {
        const newRect = container.getBoundingClientRect();
        canvas.width = newRect.width * dpr;
        canvas.height = 180 * dpr;
        canvas.style.width = newRect.width + 'px';
        canvas.style.height = '180px';
        timelineCtx.scale(dpr, dpr);
        drawTimeline(segments, newRect.width, height);
    });

    console.log('Timeline rendered with', segments.length, 'segments');
}

/**
 * Draw the complete timeline visualization
 */
function drawTimeline(segments, width, height) {
    const ctx = timelineCtx;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate total duration
    const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);

    // Layout constants
    const TIMELINE_Y = 60;
    const TIMELINE_HEIGHT = 60;
    const MARGIN_X = 20;
    const TIMELINE_WIDTH = width - (MARGIN_X * 2);

    // Draw segments
    let currentX = MARGIN_X;

    segments.forEach((segment, index) => {
        const segmentWidth = (segment.duration / totalDuration) * TIMELINE_WIDTH;

        // Get segment color
        const color = getTimelineSegmentColor(segment);

        // Draw segment bar
        drawSegmentBar(ctx, currentX, TIMELINE_Y, segmentWidth, TIMELINE_HEIGHT, color, segment);

        // Draw waveform overlay
        drawWaveform(ctx, currentX, TIMELINE_Y, segmentWidth, TIMELINE_HEIGHT, segment);

        // Draw segment label
        drawSegmentLabel(ctx, currentX, TIMELINE_Y, segmentWidth, TIMELINE_HEIGHT, segment);

        // Draw transfer marker between segments
        if (index < segments.length - 1) {
            drawTransferMarker(ctx, currentX + segmentWidth, TIMELINE_Y, TIMELINE_HEIGHT);
        }

        currentX += segmentWidth;
    });

    // Draw playback indicator
    drawPlaybackIndicator(ctx, MARGIN_X, TIMELINE_Y, TIMELINE_WIDTH, TIMELINE_HEIGHT);

    // Draw timeline border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(MARGIN_X, TIMELINE_Y, TIMELINE_WIDTH, TIMELINE_HEIGHT);
}

/**
 * Get color for a timeline segment
 */
function getTimelineSegmentColor(segment) {
    if (segment.mode === 'RAIL' && segment.lineColor) {
        return segment.lineColor;
    }
    return TIMELINE_COLORS[segment.mode] || '#666666';
}

/**
 * Draw a segment bar with gradient
 */
function drawSegmentBar(ctx, x, y, width, height, color, segment) {
    // Create gradient for depth
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, darkenColor(color, 0.3));

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);

    // Add subtle border
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);

    // Add highlight at top
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(x, y, width, 3);
}

/**
 * Draw decorative waveform pattern on segment
 */
function drawWaveform(ctx, x, y, width, height, segment) {
    if (width < 20) return; // Skip if segment too small

    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const centerY = y + height / 2;
    const waveformType = getWaveformType(segment.mode);

    ctx.beginPath();

    if (waveformType === 'sine') {
        // Smooth sine wave for rail
        for (let i = 0; i < width; i += 2) {
            const amplitude = 12;
            const frequency = 0.05;
            const yOffset = Math.sin(i * frequency) * amplitude;
            if (i === 0) {
                ctx.moveTo(x + i, centerY + yOffset);
            } else {
                ctx.lineTo(x + i, centerY + yOffset);
            }
        }
    } else if (waveformType === 'jagged') {
        // Jagged pattern for bus
        const steps = Math.floor(width / 10);
        for (let i = 0; i <= steps; i++) {
            const xPos = x + (i / steps) * width;
            const yOffset = (i % 2 === 0 ? -10 : 10);
            if (i === 0) {
                ctx.moveTo(xPos, centerY);
            } else {
                ctx.lineTo(xPos, centerY + yOffset);
            }
        }
    } else if (waveformType === 'pulse') {
        // Square pulse for walking
        const steps = Math.floor(width / 15);
        for (let i = 0; i <= steps; i++) {
            const xPos = x + (i / steps) * width;
            const yOffset = (i % 2 === 0 ? -8 : 8);
            ctx.lineTo(xPos, centerY + yOffset);
        }
    } else {
        // Smooth curve for driving
        for (let i = 0; i < width; i += 3) {
            const amplitude = 8;
            const frequency = 0.08;
            const yOffset = Math.cos(i * frequency) * amplitude;
            if (i === 0) {
                ctx.moveTo(x + i, centerY + yOffset);
            } else {
                ctx.lineTo(x + i, centerY + yOffset);
            }
        }
    }

    ctx.stroke();
    ctx.restore();
}

/**
 * Get waveform type based on transit mode
 */
function getWaveformType(mode) {
    const types = {
        'BUS': 'jagged',
        'RAIL': 'sine',
        'WALKING': 'pulse',
        'DRIVING': 'smooth'
    };
    return types[mode] || 'sine';
}

/**
 * Draw segment label beneath the bar
 */
function drawSegmentLabel(ctx, x, y, width, height, segment) {
    if (width < 40) return; // Skip label if segment too small

    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const labelY = y + height + 8;
    let labelText = '';

    // Add direction arrow prefix if available
    const directionPrefix = segment.directionArrow ? `${segment.directionArrow} ` : '';

    if (segment.mode === 'BUS' && segment.routeNumber) {
        labelText = `${directionPrefix}Bus ${segment.routeNumber}`;
        if (segment.stops > 0) {
            labelText += ` - ${segment.stops} stops`;
        }
    } else if (segment.mode === 'RAIL' && segment.lineName) {
        labelText = `${directionPrefix}${segment.lineName}`;
        if (segment.stops > 0) {
            labelText += ` - ${segment.stops} stops`;
        }
    } else if (segment.mode === 'WALKING') {
        const miles = (segment.distance * 0.000621371).toFixed(1);
        labelText = `${directionPrefix}Walk - ${miles} mi`;
    } else if (segment.mode === 'DRIVING') {
        const miles = (segment.distance * 0.000621371).toFixed(1);
        labelText = `${directionPrefix}Drive - ${miles} mi`;
    } else {
        labelText = directionPrefix + segment.mode;
    }

    // Truncate if too long
    const maxWidth = width - 10;
    ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif';
    if (ctx.measureText(labelText).width > maxWidth) {
        while (ctx.measureText(labelText + '...').width > maxWidth && labelText.length > 0) {
            labelText = labelText.slice(0, -1);
        }
        labelText += '...';
    }

    // Draw label with shadow for readability
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 3;
    ctx.fillText(labelText, x + width / 2, labelY);

    // Duration and direction label
    const minutes = Math.round(segment.duration / 60);
    const cardinalDir = segment.cardinalDirection ? ` ${segment.cardinalDirection}` : '';
    const durationText = `${minutes} min${cardinalDir}`;
    ctx.font = '9px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(durationText, x + width / 2, labelY + 14);

    ctx.restore();
}

/**
 * Draw transfer marker between segments
 */
function drawTransferMarker(ctx, x, y, height) {
    ctx.save();

    // Draw vertical line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + height);
    ctx.stroke();

    // Draw dot at center
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y + height / 2, 4, 0, Math.PI * 2);
    ctx.fill();

    // Draw outer ring
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y + height / 2, 7, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
}

/**
 * Draw playback position indicator
 */
function drawPlaybackIndicator(ctx, x, y, width, height) {
    if (playbackPosition <= 0) return;

    const indicatorX = x + (width * playbackPosition);

    ctx.save();

    // Draw vertical line
    ctx.strokeStyle = '#FFD700'; // Gold color
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(indicatorX, y - 10);
    ctx.lineTo(indicatorX, y + height + 10);
    ctx.stroke();

    // Draw top triangle
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(indicatorX, y - 10);
    ctx.lineTo(indicatorX - 6, y - 20);
    ctx.lineTo(indicatorX + 6, y - 20);
    ctx.closePath();
    ctx.fill();

    // Draw bottom triangle
    ctx.beginPath();
    ctx.moveTo(indicatorX, y + height + 10);
    ctx.lineTo(indicatorX - 6, y + height + 20);
    ctx.lineTo(indicatorX + 6, y + height + 20);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

/**
 * Add interactivity to timeline (click, hover)
 */
function addTimelineInteractivity(canvas, segments, width, height) {
    const MARGIN_X = 20;
    const TIMELINE_Y = 60;
    const TIMELINE_WIDTH = width - (MARGIN_X * 2);
    const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);

    // Click handler - set playback position
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;

        if (x >= MARGIN_X && x <= MARGIN_X + TIMELINE_WIDTH) {
            playbackPosition = (x - MARGIN_X) / TIMELINE_WIDTH;
            drawTimeline(segments, width, height);

            // Log which segment was clicked
            const clickedSegment = getSegmentAtPosition(playbackPosition, segments);
            console.log('Clicked segment:', clickedSegment);
        }
    });

    // Hover handler - show tooltip
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (x >= MARGIN_X && x <= MARGIN_X + TIMELINE_WIDTH &&
            y >= TIMELINE_Y && y <= TIMELINE_Y + 60) {
            canvas.style.cursor = 'pointer';

            // Could add tooltip here
            const position = (x - MARGIN_X) / TIMELINE_WIDTH;
            const segment = getSegmentAtPosition(position, segments);
            canvas.title = getSegmentTooltip(segment);
        } else {
            canvas.style.cursor = 'default';
            canvas.title = '';
        }
    });
}

/**
 * Get segment at a given position (0 to 1)
 */
function getSegmentAtPosition(position, segments) {
    const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);
    let accumulatedDuration = 0;

    for (const segment of segments) {
        accumulatedDuration += segment.duration;
        if (position <= accumulatedDuration / totalDuration) {
            return segment;
        }
    }

    return segments[segments.length - 1];
}

/**
 * Generate tooltip text for a segment
 */
function getSegmentTooltip(segment) {
    let tooltip = segment.mode;

    if (segment.mode === 'BUS' && segment.routeNumber) {
        tooltip = `Bus Route ${segment.routeNumber}`;
    } else if (segment.mode === 'RAIL' && segment.lineName) {
        tooltip = segment.lineName;
    }

    if (segment.stops > 0) {
        tooltip += ` - ${segment.stops} stops`;
    }

    tooltip += ` - ${Math.round(segment.duration / 60)} minutes`;

    return tooltip;
}

/**
 * Update playback position (for audio sync)
 * @param {number} position - Position from 0 to 1
 */
function updatePlaybackPosition(position) {
    playbackPosition = Math.max(0, Math.min(1, position));

    if (timelineCanvas && window.routeSegments) {
        const rect = timelineCanvas.getBoundingClientRect();
        drawTimeline(window.routeSegments, rect.width, 180);
    }
}

/**
 * Reset playback to start
 */
function resetPlayback() {
    updatePlaybackPosition(0);
}

/**
 * Helper: Darken a color by a factor
 */
function darkenColor(color, factor) {
    // Parse hex color
    let hex = color.replace('#', '');
    let r = parseInt(hex.substr(0, 2), 16);
    let g = parseInt(hex.substr(2, 2), 16);
    let b = parseInt(hex.substr(4, 2), 16);

    // Darken
    r = Math.floor(r * (1 - factor));
    g = Math.floor(g * (1 - factor));
    b = Math.floor(b * (1 - factor));

    // Convert back to hex
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

/**
 * Expose global functions for audio synchronization
 */
window.updatePlaybackPosition = updatePlaybackPosition;
window.resetPlayback = resetPlayback;
window.renderTimeline = renderTimeline;

/**
 * ============================================================================
 * PHASE 3: AUDIO GENERATION SYSTEM
 * ============================================================================
 * Web Audio API implementation that converts route segments into playable audio
 *
 * Sound Design Rules:
 * - BUS: Bass tone, pitch = route number mod 12, duration scales with stops
 * - RAIL: Mid-range tone, pitch mapped to line color, rhythmic pattern based on stops
 * - WALKING: Percussive clicks, tempo based on walking pace
 * - DRIVING: Filtered white noise with rhythm, tempo based on speed
 * - TRANSFER: Brief chord between segments
 */

// Audio system state
let audioContext = null;
let audioSequence = [];
let isPlaying = false;
let currentTime = 0;
let audioStartTime = 0;
let animationFrameId = null;
let scheduledSources = [];
let totalAudioDuration = 0;
// Playback speed removed - always plays at 1.0x

// Note frequencies for musical mapping (C major scale with chromatic notes)
const NOTE_FREQUENCIES = [
    261.63,  // C4  (0)
    277.18,  // C#4 (1)
    293.66,  // D4  (2)
    311.13,  // D#4 (3)
    329.63,  // E4  (4)
    349.23,  // F4  (5)
    369.99,  // F#4 (6)
    392.00,  // G4  (7)
    415.30,  // G#4 (8)
    440.00,  // A4  (9)
    466.16,  // A#4 (10)
    493.88   // B4  (11)
];

// CTA Line color to pitch mapping
const LINE_PITCH_MAP = {
    '#c60c30': 0,  // Red Line -> C
    '#00a1de': 4,  // Blue Line -> E
    '#62361b': 7,  // Brown Line -> G
    '#009b3a': 9,  // Green Line -> A
    '#f9461c': 2,  // Orange Line -> D
    '#522398': 5,  // Purple Line -> F
    '#f9e300': 11, // Yellow Line -> B
    '#e27ea6': 10  // Pink Line -> A#
};

/**
 * Initialize audio context (must be called after user gesture)
 */
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

/**
 * Calculate directional audio parameters from bearing
 * Returns { pan, pitchMultiplier }
 * - pan: -1 (left/west) to +1 (right/east)
 * - pitchMultiplier: 0.9 (south) to 1.1 (north)
 */
function getDirectionalAudioParams(bearing) {
    if (bearing === null || bearing === undefined) {
        return { pan: 0, pitchMultiplier: 1.0 };
    }

    // Convert bearing to radians
    const bearingRad = bearing * Math.PI / 180;

    // Pan: East = +1 (right), West = -1 (left)
    // sin(0°) = 0 (North), sin(90°) = 1 (East), sin(180°) = 0 (South), sin(270°) = -1 (West)
    const pan = Math.sin(bearingRad);

    // Pitch: North = higher (1.1), South = lower (0.9)
    // cos(0°) = 1 (North), cos(180°) = -1 (South)
    const northness = Math.cos(bearingRad); // -1 to 1
    const pitchMultiplier = 1.0 + (northness * 0.1); // 0.9 to 1.1

    return { pan, pitchMultiplier };
}

/**
 * Create a noise buffer for percussive and driving sounds
 */
function createNoiseBuffer(duration) {
    const ctx = audioContext;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    return buffer;
}

/**
 * Generate audio for a BUS segment
 * Bass tone, pitch based on route number mod 12, duration scales with stops
 */
function generateBusSound(segment, startTime, speedMultiplier = 1.0) {
    const ctx = audioContext;
    const routeNum = parseInt(segment.routeNumber) || 0;
    const pitchIndex = routeNum % 12;

    // Apply directional pitch modulation
    const dirParams = getDirectionalAudioParams(segment.bearing);
    const frequency = (NOTE_FREQUENCIES[pitchIndex] / 2) * dirParams.pitchMultiplier; // Bass octave

    // Duration: base 1.2s + 0.3s per stop (3x slower than before)
    const baseDuration = Math.min(1.2 + (segment.stops * 0.3), 6.0);
    const duration = baseDuration / speedMultiplier;

    // Create oscillator (sine wave for smooth bass)
    const oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, startTime);

    // Create stereo panner for directional audio
    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(dirParams.pan, startTime);

    // Create gain node with envelope
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05); // Attack
    gainNode.gain.linearRampToValueAtTime(0.2, startTime + duration - 0.1); // Sustain
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration); // Release

    // Connect with panning: oscillator -> panner -> gain -> destination
    oscillator.connect(panner);
    panner.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);

    scheduledSources.push(oscillator);

    return duration;
}

/**
 * Generate audio for a RAIL segment
 * Mid-range tone, pitch mapped to line color, rhythm based on stops
 */
function generateTrainSound(segment, startTime, speedMultiplier = 1.0) {
    const ctx = audioContext;
    const pitchIndex = LINE_PITCH_MAP[segment.lineColor] || 0;

    // Apply directional pitch modulation
    const dirParams = getDirectionalAudioParams(segment.bearing);
    const frequency = NOTE_FREQUENCIES[pitchIndex] * dirParams.pitchMultiplier;

    // Create a rhythmic pattern based on stops (slower tempo)
    const stopCount = Math.max(segment.stops, 1);
    const beatDuration = 0.4 / speedMultiplier; // Slower beats
    const totalDuration = Math.min(stopCount * beatDuration, 8.0 / speedMultiplier);

    for (let i = 0; i < Math.min(stopCount, 15); i++) {
        const beatStart = startTime + (i * beatDuration);

        // Create oscillator (square wave for train-like sound)
        const oscillator = ctx.createOscillator();
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(frequency, beatStart);

        // Create stereo panner for directional audio
        const panner = ctx.createStereoPanner();
        panner.pan.setValueAtTime(dirParams.pan, beatStart);

        // Create gain node with sharp attack/release
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0, beatStart);
        gainNode.gain.linearRampToValueAtTime(0.15, beatStart + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, beatStart + beatDuration * 0.6);

        // Connect with panning: oscillator -> panner -> gain -> destination
        oscillator.connect(panner);
        panner.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.start(beatStart);
        oscillator.stop(beatStart + beatDuration);

        scheduledSources.push(oscillator);
    }

    return totalDuration;
}

/**
 * Generate audio for a WALKING segment
 * Percussive clicks, tempo based on pace
 */
function generateWalkingSound(segment, startTime, speedMultiplier = 1.0) {
    const ctx = audioContext;

    // Apply directional pitch modulation
    const dirParams = getDirectionalAudioParams(segment.bearing);

    // Calculate pace (meters per second)
    const pace = segment.distance / segment.duration;
    const stepInterval = (1.2 / Math.max(pace, 0.5)) / speedMultiplier; // Slower clicks

    const clickCount = Math.min(Math.floor(4.0 / (stepInterval * speedMultiplier)), 12);
    const totalDuration = clickCount * stepInterval;

    for (let i = 0; i < clickCount; i++) {
        const clickStart = startTime + (i * stepInterval);

        // Create high-frequency click with directional pitch
        const oscillator = ctx.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1200 * dirParams.pitchMultiplier, clickStart);

        // Create stereo panner
        const panner = ctx.createStereoPanner();
        panner.pan.setValueAtTime(dirParams.pan, clickStart);

        // Very short envelope for click sound
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0, clickStart);
        gainNode.gain.linearRampToValueAtTime(0.2, clickStart + 0.005);
        gainNode.gain.exponentialRampToValueAtTime(0.01, clickStart + 0.05);

        oscillator.connect(panner);
        panner.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.start(clickStart);
        oscillator.stop(clickStart + 0.05);

        scheduledSources.push(oscillator);
    }

    return totalDuration;
}

/**
 * Generate audio for a DRIVING segment
 * White noise with rhythm, tempo based on speed
 */
function generateDrivingSound(segment, startTime, speedMultiplier = 1.0) {
    const ctx = audioContext;

    // Apply directional parameters
    const dirParams = getDirectionalAudioParams(segment.bearing);

    // Calculate speed
    const speed = segment.distance / segment.duration;
    const pulseDuration = 0.5 / speedMultiplier;
    const pulseInterval = (1.0 / Math.max(speed / 10, 0.5)) / speedMultiplier;

    const pulseCount = Math.min(Math.floor(3.5 / (pulseInterval * speedMultiplier)), 10);
    const totalDuration = pulseCount * pulseInterval;

    for (let i = 0; i < pulseCount; i++) {
        const pulseStart = startTime + (i * pulseInterval);

        // Create noise buffer
        const noiseBuffer = createNoiseBuffer(pulseDuration);
        const source = ctx.createBufferSource();
        source.buffer = noiseBuffer;

        // Create filter for colored noise (pitch modulated by direction)
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400 * dirParams.pitchMultiplier, pulseStart);

        // Create stereo panner
        const panner = ctx.createStereoPanner();
        panner.pan.setValueAtTime(dirParams.pan, pulseStart);

        // Create gain envelope
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0, pulseStart);
        gainNode.gain.linearRampToValueAtTime(0.1, pulseStart + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, pulseStart + pulseDuration);

        source.connect(filter);
        filter.connect(panner);
        panner.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.start(pulseStart);

        scheduledSources.push(source);
    }

    return totalDuration;
}

/**
 * Generate a transfer chord (transition between segments)
 */
function generateTransferSound(startTime, speedMultiplier = 1.0) {
    const ctx = audioContext;
    const duration = 0.8 / speedMultiplier; // Longer, more noticeable transition

    // Major triad (C-E-G)
    const frequencies = [261.63, 329.63, 392.00];

    frequencies.forEach(freq => {
        const oscillator = ctx.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, startTime);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.08, startTime + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);

        scheduledSources.push(oscillator);
    });

    return duration;
}

/**
 * Generate complete audio sequence from route segments
 */
function generateAudio(segments) {
    if (!segments || segments.length === 0) {
        console.warn('No segments to generate audio from');
        return;
    }

    // Initialize audio context
    initAudioContext();

    // Build audio sequence
    audioSequence = [];
    let currentPosition = 0;

    segments.forEach((segment, index) => {
        const audioSegment = {
            segment: segment,
            startTime: currentPosition,
            duration: 0,
            index: index
        };

        // Map segment to sound based on mode (3x slower base durations)
        switch (segment.mode) {
            case 'BUS':
                audioSegment.duration = Math.min(1.2 + (segment.stops * 0.3), 6.0);
                audioSegment.soundType = 'bus';
                break;

            case 'RAIL':
                const stopCount = Math.max(segment.stops, 1);
                audioSegment.duration = Math.min(stopCount * 0.4, 8.0);
                audioSegment.soundType = 'rail';
                break;

            case 'WALKING':
                const pace = segment.distance / segment.duration;
                const stepInterval = 1.2 / Math.max(pace, 0.5);
                const clickCount = Math.min(Math.floor(4.0 / stepInterval), 12);
                audioSegment.duration = clickCount * stepInterval;
                audioSegment.soundType = 'walking';
                break;

            case 'DRIVING':
                const speed = segment.distance / segment.duration;
                const pulseInterval = 1.0 / Math.max(speed / 10, 0.5);
                const pulseCount = Math.min(Math.floor(3.5 / pulseInterval), 10);
                audioSegment.duration = pulseCount * pulseInterval;
                audioSegment.soundType = 'driving';
                break;

            default:
                audioSegment.duration = 1.5;
                audioSegment.soundType = 'walking';
        }

        audioSequence.push(audioSegment);
        currentPosition += audioSegment.duration;

        // Add breathing room gap after each segment
        const gap = 0.5;
        currentPosition += gap;

        // Add transfer sound between segments (except after last segment)
        if (index < segments.length - 1) {
            audioSequence.push({
                segment: null,
                startTime: currentPosition,
                duration: 0.8,
                index: -1,
                soundType: 'transfer'
            });
            currentPosition += 0.8;
        }
    });

    totalAudioDuration = currentPosition;

    console.log('Audio sequence generated:', audioSequence);
    console.log('Total audio duration:', totalAudioDuration.toFixed(2), 'seconds');

    // Create audio controls UI
    createAudioControls(totalAudioDuration);
}

/**
 * Create audio control UI elements
 */
function createAudioControls(totalDuration) {
    const timeline = document.getElementById('sound-timeline');

    // Check if controls already exist
    let controlsContainer = document.getElementById('audio-controls-container');

    if (!controlsContainer) {
        controlsContainer = document.createElement('div');
        controlsContainer.id = 'audio-controls-container';
        controlsContainer.className = 'audio-controls';
        timeline.insertBefore(controlsContainer, timeline.firstChild);
    }

    controlsContainer.innerHTML = `
        <div class="audio-buttons">
            <button id="play-btn" class="audio-btn" title="Play">▶</button>
            <button id="pause-btn" class="audio-btn" title="Pause" disabled>⏸</button>
            <button id="stop-btn" class="audio-btn" title="Stop" disabled>⏹</button>
        </div>
        <div class="time-display">
            <span id="current-time">0:00</span> / <span id="total-time">${formatTimeAudio(totalDuration)}</span>
        </div>
    `;

    // Add event listeners
    document.getElementById('play-btn').addEventListener('click', playAudio);
    document.getElementById('pause-btn').addEventListener('click', pauseAudio);
    document.getElementById('stop-btn').addEventListener('click', stopAudio);
}

/**
 * Play audio sequence
 */
function playAudio() {
    if (isPlaying) return;

    initAudioContext();

    // Resume audio context if suspended (browser autoplay policy)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    isPlaying = true;
    audioStartTime = audioContext.currentTime - currentTime;

    // Schedule all sounds from current position
    audioSequence.forEach(audioSeg => {
        if (audioSeg.startTime < currentTime) return; // Skip already played segments

        const scheduleTime = audioStartTime + audioSeg.startTime;

        switch (audioSeg.soundType) {
            case 'bus':
                generateBusSound(audioSeg.segment, scheduleTime);
                break;
            case 'rail':
                generateTrainSound(audioSeg.segment, scheduleTime);
                break;
            case 'walking':
                generateWalkingSound(audioSeg.segment, scheduleTime);
                break;
            case 'driving':
                generateDrivingSound(audioSeg.segment, scheduleTime);
                break;
            case 'transfer':
                generateTransferSound(scheduleTime);
                break;
        }
    });

    // Update UI
    document.getElementById('play-btn').disabled = true;
    document.getElementById('play-btn').classList.add('playing');
    document.getElementById('pause-btn').disabled = false;
    document.getElementById('stop-btn').disabled = false;

    // Start time update animation
    updateTimeDisplayAudio();
}

/**
 * Pause audio playback
 */
function pauseAudio() {
    if (!isPlaying) return;

    isPlaying = false;

    // Stop all scheduled sounds
    stopAllScheduledSounds();

    // Update UI
    document.getElementById('play-btn').disabled = false;
    document.getElementById('play-btn').classList.remove('playing');
    document.getElementById('pause-btn').disabled = true;

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

/**
 * Stop audio playback and reset
 */
function stopAudio() {
    isPlaying = false;
    currentTime = 0;

    // Stop all scheduled sounds
    stopAllScheduledSounds();

    // Reset timeline playback indicator
    if (typeof resetPlayback === 'function') {
        resetPlayback();
    }

    // Update UI (only if buttons exist)
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const stopBtn = document.getElementById('stop-btn');
    const currentTimeEl = document.getElementById('current-time');

    if (playBtn) {
        playBtn.disabled = false;
        playBtn.classList.remove('playing');
    }
    if (pauseBtn) pauseBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = true;
    if (currentTimeEl) currentTimeEl.textContent = '0:00';

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

/**
 * Stop all currently scheduled audio sources
 */
function stopAllScheduledSounds() {
    scheduledSources.forEach(source => {
        try {
            source.stop();
        } catch (e) {
            // Already stopped
        }
    });
    scheduledSources = [];
}

/**
 * Update time display during playback
 */
function updateTimeDisplayAudio() {
    if (!isPlaying) return;

    currentTime = audioContext.currentTime - audioStartTime;

    if (currentTime >= totalAudioDuration) {
        // Playback finished
        stopAudio();
        return;
    }

    // Update time display
    document.getElementById('current-time').textContent = formatTimeAudio(currentTime);

    // Update timeline playback indicator
    if (typeof updatePlaybackPosition === 'function') {
        const position = currentTime / totalAudioDuration;
        updatePlaybackPosition(position);
    }

    // Continue animation
    animationFrameId = requestAnimationFrame(updateTimeDisplayAudio);
}

/**
 * Format time in M:SS format
 */
function formatTimeAudio(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Hook into route generation success to generate audio automatically
 */
const originalHandleDirectionsSuccess = handleDirectionsSuccess;
handleDirectionsSuccess = function(result) {
    // Call original function
    originalHandleDirectionsSuccess(result);

    // Generate audio and render timeline after route is displayed
    if (window.routeSegments && window.routeSegments.length > 0) {
        // First render the timeline (Phase 4)
        if (typeof renderTimeline === 'function') {
            renderTimeline(window.routeSegments);
        }

        // Then generate audio (Phase 3)
        generateAudio(window.routeSegments);

        // Then generate quilt (Phase 5)
        if (typeof generateQuilt === 'function') {
            generateQuilt(window.routeSegments);
        }
    }
};

/**
 * ============================================================================
 * PHASE 5: QUILT PATTERN GENERATOR - SONGLINE STYLE
 * ============================================================================
 * Generates a songline-inspired visualization from route segments
 *
 * Design approach:
 * - Flowing path following the actual journey
 * - Concentric circles/dots at stops and transfers (Aboriginal style)
 * - Organic shapes and directional symbols
 * - Path connects segments like a traditional songline map
 * - Inspired by Aboriginal dot painting and songline art
 */

/**
 * Generate authentic Aboriginal songline-style quilt pattern
 * Based on real Aboriginal art: overlapping circles, dense dots, multiple sites
 */
function generateQuilt(segments) {
    if (!segments || segments.length === 0) {
        console.warn('No route segments to generate quilt pattern');
        return;
    }

    console.log('Generating songline pattern from', segments.length, 'segments');

    const container = document.getElementById('quilt-pattern');
    container.innerHTML = ''; // Clear placeholder

    // Create canvas
    const canvas = document.createElement('canvas');
    const canvasSize = 600;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    canvas.style.maxWidth = '100%';
    canvas.style.height = 'auto';
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    canvas.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    canvas.style.borderRadius = '8px';

    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    // Draw earth tone background
    drawAuthenticBackground(ctx, canvasSize);

    // Calculate circle sites (not linear path)
    const circleSites = calculateCircleSites(segments, canvasSize);

    // Draw overlapping concentric circles (main element)
    drawOverlappingCircles(ctx, circleSites, segments);

    // Fill spaces with connecting dots
    drawConnectingDots(ctx, circleSites, canvasSize);

    // Add U-shapes and curved connectors
    drawCurvedConnectors(ctx, circleSites);

    // Add dense background dots
    drawBackgroundDotwork(ctx, canvasSize);

    // Add border
    drawAuthenticBorder(ctx, canvasSize);

    // Add download button
    addDownloadButton(container, canvas);

    console.log('Songline pattern generated successfully');
}

/**
 * Draw authentic Aboriginal-style background with earth tones
 */
function drawAuthenticBackground(ctx, size) {
    // Rich earth tone base
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size);
    gradient.addColorStop(0, '#d4a574');
    gradient.addColorStop(0.4, '#c89858');
    gradient.addColorStop(0.8, '#b8884a');
    gradient.addColorStop(1, '#9d7842');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
}

/**
 * Calculate circle sites - each segment becomes overlapping circles
 * Like real Aboriginal art: multiple "places" not a single path
 */
function calculateCircleSites(segments, canvasSize) {
    const sites = [];
    const margin = 60;
    const usableSize = canvasSize - (margin * 2);
    const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);

    segments.forEach((segment, index) => {
        // Use organic placement that creates overlaps
        const angle = index * (Math.PI * 1.8) + Math.random() * 0.5; // Organic spacing
        const radiusFromCenter = (usableSize / 3) * (0.5 + Math.random() * 0.5);

        const centerX = canvasSize / 2;
        const centerY = canvasSize / 2;

        const x = centerX + Math.cos(angle) * radiusFromCenter;
        const y = centerY + Math.sin(angle) * radiusFromCenter;

        // Size based on duration and stops
        const importance = segment.duration / totalDuration;
        const stopFactor = Math.min(segment.stops / 10, 1);
        const baseRadius = 40 + importance * 80 + stopFactor * 40;

        // Create site with multiple properties
        sites.push({
            x: x,
            y: y,
            radius: baseRadius,
            segment: segment,
            index: index,
            color: getSegmentColor(segment),
            rings: 3 + Math.floor(stopFactor * 5), // 3-8 rings
            stops: segment.stops || 1,
            duration: segment.duration
        });
    });

    return sites;
}

/**
 * Draw overlapping concentric circles (main feature of real Aboriginal art)
 */
function drawOverlappingCircles(ctx, sites, segments) {
    ctx.save();

    // Draw largest circles first (background layer)
    sites.sort((a, b) => b.radius - a.radius);

    sites.forEach(site => {
        const maxRadius = site.radius;
        const ringCount = site.rings;

        // Draw concentric rings with varying opacity and colors
        for (let ring = ringCount; ring > 0; ring--) {
            const radius = (maxRadius / ringCount) * ring;
            const t = ring / ringCount;

            // Color variation - lighter toward outer rings
            const baseColor = site.color;
            const rgb = hexToRgb(baseColor);
            if (rgb) {
                const lighten = 30 * (1 - t);
                const r = Math.min(255, rgb.r + lighten);
                const g = Math.min(255, rgb.g + lighten);
                const b = Math.min(255, rgb.b + lighten);
                const ringColor = rgbToHex(r, g, b);

                // Draw filled ring
                ctx.fillStyle = ringColor;
                ctx.globalAlpha = 0.5 + t * 0.3;
                ctx.beginPath();
                ctx.arc(site.x, site.y, radius, 0, Math.PI * 2);
                ctx.fill();

                // Draw ring outline with dots
                ctx.strokeStyle = darkenColorQuilt(ringColor, 20);
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.7;
                ctx.setLineDash([3, 4]); // Dotted ring
                ctx.beginPath();
                ctx.arc(site.x, site.y, radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }

        // Draw center filled circle
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = site.color;
        ctx.beginPath();
        ctx.arc(site.x, site.y, 8, 0, Math.PI * 2);
        ctx.fill();

        // White center dot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(site.x, site.y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Add radiating dots around center
        const dotRingCount = 2;
        for (let r = 1; r <= dotRingCount; r++) {
            const dotRadius = 15 * r;
            const dotsOnRing = 8 * r;

            for (let d = 0; d < dotsOnRing; d++) {
                const angle = (d / dotsOnRing) * Math.PI * 2;
                const dotX = site.x + Math.cos(angle) * dotRadius;
                const dotY = site.y + Math.sin(angle) * dotRadius;

                ctx.fillStyle = site.color;
                ctx.globalAlpha = 0.8 - r * 0.2;
                ctx.beginPath();
                ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    });

    ctx.globalAlpha = 1.0;
    ctx.restore();
}

/**
 * OLD FUNCTION - Draw the main journey lines connecting waypoints
 */
function drawJourneyLines_OLD(ctx, pathPoints, segments) {
    ctx.save();

    for (let i = 1; i < pathPoints.length; i++) {
        const prevPoint = pathPoints[i - 1];
        const currentPoint = pathPoints[i];
        const segment = currentPoint.segment || prevPoint.segment;

        if (!segment) continue;

        const color = getSegmentColor(segment);

        // Draw thick base line
        ctx.strokeStyle = darkenColorQuilt(color, 30);
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = 0.3;

        ctx.beginPath();
        ctx.moveTo(prevPoint.x, prevPoint.y);
        ctx.lineTo(currentPoint.x, currentPoint.y);
        ctx.stroke();

        // Draw colored dotted line on top
        ctx.strokeStyle = color;
        ctx.lineWidth = 8;
        ctx.globalAlpha = 0.8;
        ctx.setLineDash([10, 15]); // Dotted pattern

        ctx.beginPath();
        ctx.moveTo(prevPoint.x, prevPoint.y);
        ctx.lineTo(currentPoint.x, currentPoint.y);
        ctx.stroke();

        ctx.setLineDash([]); // Reset
    }

    ctx.globalAlpha = 1.0;
    ctx.restore();
}

/**
 * Draw connecting dots between circle sites (fills space like real Aboriginal art)
 */
function drawConnectingDots(ctx, sites, canvasSize) {
    ctx.save();

    // Connect adjacent sites with dot trails
    for (let i = 0; i < sites.length - 1; i++) {
        const site1 = sites[i];
        const site2 = sites[i + 1];

        const dx = site2.x - site1.x;
        const dy = site2.y - site1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Only connect if not too far apart
        if (distance < canvasSize * 0.5) {
            const dotCount = Math.floor(distance / 15);

            for (let d = 0; d < dotCount; d++) {
                const t = d / dotCount;
                const x = site1.x + dx * t + (Math.random() - 0.5) * 20;
                const y = site1.y + dy * t + (Math.random() - 0.5) * 20;

                // Blend colors
                const color = t < 0.5 ? site1.color : site2.color;

                ctx.fillStyle = color;
                ctx.globalAlpha = 0.4 + Math.random() * 0.3;
                ctx.beginPath();
                ctx.arc(x, y, 1.5 + Math.random() * 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    ctx.globalAlpha = 1.0;
    ctx.restore();
}

/**
 * Draw U-shapes and curved connectors (like in real Aboriginal art)
 */
function drawCurvedConnectors(ctx, sites) {
    ctx.save();

    for (let i = 0; i < sites.length - 1; i++) {
        const site1 = sites[i];
        const site2 = sites[i + 1];

        const dx = site2.x - site1.x;
        const dy = site2.y - site1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 200) {
            // Draw U-shaped connector
            const midX = (site1.x + site2.x) / 2;
            const midY = (site1.y + site2.y) / 2;

            // Control point for curve
            const perpAngle = Math.atan2(dy, dx) + Math.PI / 2;
            const curveDist = distance * 0.3;
            const ctrlX = midX + Math.cos(perpAngle) * curveDist;
            const ctrlY = midY + Math.sin(perpAngle) * curveDist;

            // Draw dotted curved line
            ctx.strokeStyle = site1.color;
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.5;
            ctx.setLineDash([3, 5]);

            ctx.beginPath();
            ctx.moveTo(site1.x, site1.y);
            ctx.quadraticCurveTo(ctrlX, ctrlY, site2.x, site2.y);
            ctx.stroke();

            ctx.setLineDash([]);

            // Add dots along the curve
            for (let t = 0; t <= 1; t += 0.1) {
                const curveX = (1 - t) * (1 - t) * site1.x +
                              2 * (1 - t) * t * ctrlX +
                              t * t * site2.x;
                const curveY = (1 - t) * (1 - t) * site1.y +
                              2 * (1 - t) * t * ctrlY +
                              t * t * site2.y;

                ctx.fillStyle = t < 0.5 ? site1.color : site2.color;
                ctx.globalAlpha = 0.6;
                ctx.beginPath();
                ctx.arc(curveX, curveY, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    ctx.globalAlpha = 1.0;
    ctx.restore();
}

/**
 * Draw dense background dotwork (fills remaining space)
 */
function drawBackgroundDotwork(ctx, canvasSize) {
    ctx.save();
    ctx.globalAlpha = 0.15;

    const dotCount = 800;
    const colors = ['#d4a574', '#c89858', '#8b6f4a', '#a0724a', '#b8884a'];

    for (let i = 0; i < dotCount; i++) {
        const x = Math.random() * canvasSize;
        const y = Math.random() * canvasSize;
        const size = 0.5 + Math.random() * 2;
        const color = colors[Math.floor(Math.random() * colors.length)];

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.globalAlpha = 1.0;
    ctx.restore();
}

/**
 * OLD FUNCTION - Draw organized dots along the path
 */
function drawPathDots_OLD(ctx, pathPoints, segments) {
    ctx.save();

    for (let i = 1; i < pathPoints.length; i++) {
        const prevPoint = pathPoints[i - 1];
        const currentPoint = pathPoints[i];
        const segment = currentPoint.segment || prevPoint.segment;

        if (!segment) continue;

        const color = getSegmentColor(segment);
        const dx = currentPoint.x - prevPoint.x;
        const dy = currentPoint.y - prevPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Number of dots based on segment stops and distance
        const dotCount = 20 + (segment.stops * 5);
        const spacing = distance / dotCount;

        for (let d = 0; d < dotCount; d++) {
            const t = d / dotCount;
            const x = prevPoint.x + dx * t;
            const y = prevPoint.y + dy * t;

            // Add perpendicular offset for variation
            const offsetDist = 8;
            const offsetAngle = Math.atan2(dy, dx) + Math.PI / 2;
            const offset = (Math.random() - 0.5) * 2;
            const dotX = x + Math.cos(offsetAngle) * offset * offsetDist;
            const dotY = y + Math.sin(offsetAngle) * offset * offsetDist;

            // Dot size varies
            const dotSize = 2 + Math.random() * 2;

            ctx.fillStyle = color;
            ctx.globalAlpha = 0.6 + Math.random() * 0.3;
            ctx.beginPath();
            ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.globalAlpha = 1.0;
    ctx.restore();
}

/**
 * Draw concentric circles at significant waypoints (Aboriginal style)
 */
function drawStopCircles_OLD(ctx, pathPoints, segments) {
    ctx.save();

    pathPoints.forEach(point => {
        if (point.type === 'start' || point.type === 'end') {
            // Large prominent circles for start/end
            const color = '#8b4513';
            drawConcentricCircles(ctx, point.x, point.y, color, 5, 30);

            // Label
            ctx.fillStyle = '#5a3e2b';
            ctx.font = 'bold 12px -apple-system';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
            ctx.shadowBlur = 4;
            ctx.fillText(point.type.toUpperCase(), point.x, point.y + 50);
            ctx.shadowBlur = 0;
        } else if (point.segment && point.segment.stops > 0) {
            // Circles at waypoints with stops
            const color = getSegmentColor(point.segment);
            const ringCount = Math.min(3 + Math.floor(point.segment.stops / 3), 6);
            const maxRadius = 15 + point.segment.stops * 2;
            drawConcentricCircles(ctx, point.x, point.y, color, ringCount, maxRadius);
        }
    });

    ctx.restore();
}

/**
 * Draw concentric circles (traditional songline marker)
 */
function drawConcentricCircles(ctx, x, y, color, ringCount, maxRadius) {
    ctx.save();

    // Rings
    for (let i = 1; i <= ringCount; i++) {
        const radius = (maxRadius / ringCount) * i;
        const alpha = 0.7 - (i / ringCount) * 0.3;

        ctx.strokeStyle = color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Center filled circle
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();

    // White center dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

/**
 * Draw directional markers (simple chevrons/arrows along path)
 */
function drawDirectionalMarkers_OLD(ctx, pathPoints, segments) {
    ctx.save();

    for (let i = 1; i < pathPoints.length - 1; i++) {
        const prevPoint = pathPoints[i - 1];
        const currentPoint = pathPoints[i];
        const nextPoint = pathPoints[i + 1];

        if (!currentPoint.segment || !currentPoint.segment.directionArrow) continue;

        // Draw arrow at midpoint between waypoints
        const midX = (currentPoint.x + nextPoint.x) / 2;
        const midY = (currentPoint.y + nextPoint.y) / 2;

        const color = getSegmentColor(currentPoint.segment);

        // Background circle
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.beginPath();
        ctx.arc(midX, midY, 16, 0, Math.PI * 2);
        ctx.fill();

        // Border
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Arrow symbol
        ctx.fillStyle = '#5a3e2b';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(currentPoint.segment.directionArrow, midX, midY);
    }

    ctx.restore();
}

/**
 * OLD ABSTRACT FUNCTION - KEEPING FOR REFERENCE
 */
function drawDotFields_OLD(ctx, regions, segments) {
    ctx.save();

    regions.forEach(region => {
        const dotCount = 100 + region.density * 200; // More stops = more dots
        const baseColor = region.color;

        // Create concentric layers of dots
        const layers = 3 + Math.floor(region.density * 3);

        for (let layer = layers; layer > 0; layer--) {
            const layerRadius = region.size * (layer / layers);
            const layerDotCount = Math.floor(dotCount / layers);
            const alpha = 0.3 + (layer / layers) * 0.4;

            ctx.globalAlpha = alpha;

            for (let i = 0; i < layerDotCount; i++) {
                // Spiral distribution with noise
                const spiralAngle = (i / layerDotCount) * Math.PI * 4 + region.angle;
                const spiralRadius = layerRadius * (i / layerDotCount) + (Math.random() - 0.5) * 20;

                const x = region.x + Math.cos(spiralAngle) * spiralRadius;
                const y = region.y + Math.sin(spiralAngle) * spiralRadius;

                // Dot size varies by layer and randomness
                const dotSize = (1 + Math.random() * 3) * (layer / layers);

                // Color variation
                const colorVariation = Math.floor(Math.random() * 30 - 15);
                const variedColor = adjustBrightness(baseColor, colorVariation);

                ctx.fillStyle = variedColor;
                ctx.beginPath();
                ctx.arc(x, y, dotSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Central focal point (larger dots)
        ctx.globalAlpha = 0.8;
        for (let i = 0; i < 5; i++) {
            const ringAngle = (i / 5) * Math.PI * 2;
            const ringRadius = 8 + i * 3;
            const x = region.x + Math.cos(ringAngle) * ringRadius;
            const y = region.y + Math.sin(ringAngle) * ringRadius;

            ctx.fillStyle = baseColor;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();

            // White highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    ctx.globalAlpha = 1.0;
    ctx.restore();
}

/**
 * Adjust color brightness
 */
function adjustBrightness(hexColor, percent) {
    const rgb = hexToRgb(hexColor);
    if (!rgb) return hexColor;

    const r = Math.max(0, Math.min(255, rgb.r + percent));
    const g = Math.max(0, Math.min(255, rgb.g + percent));
    const b = Math.max(0, Math.min(255, rgb.b + percent));

    return rgbToHex(r, g, b);
}

/**
 * Draw symbolic connections between regions (abstract, not literal paths)
 */
function drawSymbolicConnections_OLD(ctx, regions, segments) {
    ctx.save();
    ctx.globalAlpha = 0.15;

    // Connect adjacent regions with flowing curves
    for (let i = 0; i < regions.length - 1; i++) {
        const r1 = regions[i];
        const r2 = regions[i + 1];

        // Draw abstract connecting arc
        const midX = (r1.x + r2.x) / 2;
        const midY = (r1.y + r2.y) / 2;
        const offset = 50 + Math.random() * 50;

        const controlX = midX + Math.cos(r1.angle + Math.PI / 2) * offset;
        const controlY = midY + Math.sin(r1.angle + Math.PI / 2) * offset;

        // Dashed curved line
        ctx.strokeStyle = r1.color;
        ctx.lineWidth = 2 + r1.intensity * 4;
        ctx.setLineDash([5, 10]);

        ctx.beginPath();
        ctx.moveTo(r1.x, r1.y);
        ctx.quadraticCurveTo(controlX, controlY, r2.x, r2.y);
        ctx.stroke();

        // Dot along path
        const dotX = controlX + (Math.random() - 0.5) * 20;
        const dotY = controlY + (Math.random() - 0.5) * 20;
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = r1.color;
        ctx.beginPath();
        ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.15;
    }

    ctx.setLineDash([]);
    ctx.globalAlpha = 1.0;
    ctx.restore();
}

/**
 * Draw abstract directional patterns (encoded in arrangement, not symbols)
 */
function drawAbstractDirectionalPatterns_OLD(ctx, regions, segments) {
    ctx.save();

    regions.forEach(region => {
        if (region.bearing === null || region.bearing === undefined) return;

        // Convert bearing to radians for pattern orientation
        const bearingRad = (region.bearing * Math.PI) / 180;
        const perpendicular = bearingRad + Math.PI / 2;

        // Draw directional line pattern
        ctx.globalAlpha = 0.2;
        ctx.strokeStyle = region.color;
        ctx.lineWidth = 1;

        // Multiple parallel lines suggesting direction
        for (let i = 0; i < 7; i++) {
            const offset = (i - 3) * 8;
            const lineLength = 30 + Math.random() * 20;

            const startX = region.x + Math.cos(perpendicular) * offset;
            const startY = region.y + Math.sin(perpendicular) * offset;
            const endX = startX + Math.cos(bearingRad) * lineLength;
            const endY = startY + Math.sin(bearingRad) * lineLength;

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }

        // Dot gradient suggesting direction (denser in direction of travel)
        ctx.globalAlpha = 0.25;
        for (let i = 0; i < 20; i++) {
            const distance = 40 + i * 3;
            const spread = 15 + Math.random() * 10;

            const x = region.x + Math.cos(bearingRad) * distance + (Math.random() - 0.5) * spread;
            const y = region.y + Math.sin(bearingRad) * distance + (Math.random() - 0.5) * spread;
            const size = 2 - (i / 20) * 1.5; // Gets smaller with distance

            ctx.fillStyle = region.color;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    ctx.globalAlpha = 1.0;
    ctx.restore();
}

/**
 * Draw rhythmic patterns representing stops and tempo
 */
function drawRhythmicPatterns_OLD(ctx, regions, segments) {
    ctx.save();

    regions.forEach(region => {
        const stops = region.segment.stops || 1;
        const rhythmCount = Math.min(stops, 8);

        // Create circular rhythm pattern around region
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = region.color;

        for (let i = 0; i < rhythmCount; i++) {
            const angle = (i / rhythmCount) * Math.PI * 2 + region.angle;
            const radius = region.size * 0.7;

            const x = region.x + Math.cos(angle) * radius;
            const y = region.y + Math.sin(angle) * radius;

            // Draw small rhythmic mark (dash or dot cluster)
            if (i % 2 === 0) {
                // Dash
                ctx.lineWidth = 2;
                ctx.beginPath();
                const dashLength = 10;
                ctx.moveTo(x - Math.cos(angle) * dashLength / 2, y - Math.sin(angle) * dashLength / 2);
                ctx.lineTo(x + Math.cos(angle) * dashLength / 2, y + Math.sin(angle) * dashLength / 2);
                ctx.stroke();
            } else {
                // Dot cluster
                for (let d = 0; d < 3; d++) {
                    const dotAngle = (d / 3) * Math.PI * 2;
                    const dotDist = 3;
                    const dotX = x + Math.cos(dotAngle) * dotDist;
                    const dotY = y + Math.sin(dotAngle) * dotDist;

                    ctx.fillStyle = region.color;
                    ctx.beginPath();
                    ctx.arc(dotX, dotY, 1.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    });

    ctx.globalAlpha = 1.0;
    ctx.restore();
}

/**
 * Draw organic overlapping shapes
 */
function drawOrganicShapes_OLD(ctx, canvasSize, segments) {
    ctx.save();

    // Create 3-5 large organic shapes that unify the composition
    const shapeCount = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < shapeCount; i++) {
        const x = Math.random() * canvasSize;
        const y = Math.random() * canvasSize;
        const size = 80 + Math.random() * 120;

        // Random segment color
        const segment = segments[Math.floor(Math.random() * segments.length)];
        const color = getSegmentColor(segment);

        // Draw irregular organic blob
        ctx.globalAlpha = 0.05;
        ctx.fillStyle = color;

        ctx.beginPath();
        for (let angle = 0; angle < Math.PI * 2; angle += 0.5) {
            const radius = size * (0.8 + Math.random() * 0.4);
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;

            if (angle === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
        ctx.fill();
    }

    ctx.globalAlpha = 1.0;
    ctx.restore();
}

/**
 * Draw authentic Aboriginal-style border with dots and patterns
 */
function drawAuthenticBorder(ctx, size) {
    ctx.save();

    const borderWidth = 25;
    const borderColors = ['#8b4513', '#a0724a', '#6d5230', '#b8884a'];

    // Main border frame - darker earth tone
    ctx.strokeStyle = '#6d5230';
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(borderWidth / 2, borderWidth / 2, size - borderWidth, size - borderWidth);

    // Dense dot pattern in border area (like real Aboriginal art)
    ctx.globalAlpha = 0.6;
    for (let i = 0; i < 200; i++) {
        const side = Math.floor(Math.random() * 4);
        let x, y;
        const inset = borderWidth / 2;

        switch (side) {
            case 0: // Top
                x = Math.random() * size;
                y = inset + Math.random() * borderWidth;
                break;
            case 1: // Right
                x = size - inset - Math.random() * borderWidth;
                y = Math.random() * size;
                break;
            case 2: // Bottom
                x = Math.random() * size;
                y = size - inset - Math.random() * borderWidth;
                break;
            case 3: // Left
                x = inset + Math.random() * borderWidth;
                y = Math.random() * size;
                break;
        }

        const color = borderColors[Math.floor(Math.random() * borderColors.length)];
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 1 + Math.random() * 2.5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Corner circles (traditional element)
    ctx.globalAlpha = 0.7;
    const cornerPositions = [
        { x: borderWidth + 20, y: borderWidth + 20 },
        { x: size - borderWidth - 20, y: borderWidth + 20 },
        { x: borderWidth + 20, y: size - borderWidth - 20 },
        { x: size - borderWidth - 20, y: size - borderWidth - 20 }
    ];

    cornerPositions.forEach(pos => {
        // Small concentric circles at corners
        for (let r = 1; r <= 3; r++) {
            ctx.strokeStyle = '#d4af37';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, r * 5, 0, Math.PI * 2);
            ctx.stroke();
        }
        // Center dot
        ctx.fillStyle = '#d4af37';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 2, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.globalAlpha = 1.0;
    ctx.restore();
}

/**
 * Old patch-based drawing functions (kept for reference, no longer used)
 */
function drawPatch_OLD(ctx, patch, cellSize) {
    const x = patch.col * cellSize;
    const y = patch.row * cellSize;
    const width = cellSize * patch.size;
    const height = cellSize * patch.size;

    // Draw base filled rectangle
    ctx.fillStyle = patch.colors.secondary;
    ctx.fillRect(x, y, width, height);

    // Draw geometric pattern based on shape type
    switch (patch.shape) {
        case 'circles':
            drawCirclePattern(ctx, x, y, width, height, patch);
            break;
        case 'squares':
            drawSquarePattern(ctx, x, y, width, height, patch);
            break;
        case 'triangles':
            drawTrianglePattern(ctx, x, y, width, height, patch);
            break;
        case 'hexagons':
            drawHexagonPattern(ctx, x, y, width, height, patch);
            break;
    }

    // Draw patch border (quilting stitch)
    drawPatchBorder(ctx, x, y, width, height, patch.colors.accent);
}

/**
 * Draw circular pattern (for trains)
 */
function drawCirclePattern_OLD(ctx, x, y, width, height, patch) {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const maxRadius = Math.min(width, height) / 2 - 10;

    // Determine number of circles based on stops
    const circleCount = Math.min(Math.max(3, Math.floor(patch.stops / 2)), 8);

    for (let i = 0; i < circleCount; i++) {
        const radius = maxRadius * ((i + 1) / circleCount);
        const opacity = 0.3 + (0.5 * (i / circleCount));

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = patch.colors.primary;
        ctx.lineWidth = 3;
        ctx.globalAlpha = opacity;
        ctx.stroke();
    }

    ctx.globalAlpha = 1.0;

    // Fill center
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fillStyle = patch.colors.primary;
    ctx.fill();
}

/**
 * Draw square grid pattern (for buses)
 */
function drawSquarePattern_OLD(ctx, x, y, width, height, patch) {
    const gridCount = Math.max(2, Math.min(5, Math.floor(patch.stops / 2)));
    const squareSize = Math.min(width, height) / gridCount;

    for (let row = 0; row < gridCount; row++) {
        for (let col = 0; col < gridCount; col++) {
            const sx = x + col * squareSize;
            const sy = y + row * squareSize;

            // Checkerboard pattern
            const isDark = (row + col) % 2 === 0;
            ctx.fillStyle = isDark ? patch.colors.primary : patch.colors.secondary;
            ctx.fillRect(sx + 2, sy + 2, squareSize - 4, squareSize - 4);
        }
    }
}

/**
 * Draw triangle pattern (for walking)
 */
function drawTrianglePattern_OLD(ctx, x, y, width, height, patch) {
    const triangleCount = Math.max(3, Math.min(8, patch.stops));

    for (let i = 0; i < triangleCount; i++) {
        const angle = (Math.PI * 2 * i) / triangleCount;
        const nextAngle = (Math.PI * 2 * (i + 1)) / triangleCount;

        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const radius = Math.min(width, height) / 2 - 10;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(angle) * radius,
            centerY + Math.sin(angle) * radius
        );
        ctx.lineTo(
            centerX + Math.cos(nextAngle) * radius,
            centerY + Math.sin(nextAngle) * radius
        );
        ctx.closePath();

        ctx.fillStyle = i % 2 === 0 ? patch.colors.primary : patch.colors.accent;
        ctx.fill();
    }
}

/**
 * Draw hexagon pattern (for driving)
 */
function drawHexagonPattern_OLD(ctx, x, y, width, height, patch) {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radius = Math.min(width, height) / 2 - 10;

    // Draw main hexagon
    drawHexagon(ctx, centerX, centerY, radius, patch.colors.primary, true);

    // Draw inner hexagons
    const innerCount = Math.max(1, Math.min(3, Math.floor(patch.stops / 3)));
    for (let i = 1; i <= innerCount; i++) {
        const innerRadius = radius * ((innerCount - i + 1) / (innerCount + 1));
        const color = i % 2 === 0 ? patch.colors.accent : patch.colors.secondary;
        drawHexagon(ctx, centerX, centerY, innerRadius, color, true);
    }
}

/**
 * Draw a hexagon
 */
function drawHexagon_OLD(ctx, centerX, centerY, radius, color, fill = true) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        const pointX = centerX + radius * Math.cos(angle);
        const pointY = centerY + radius * Math.sin(angle);

        if (i === 0) {
            ctx.moveTo(pointX, pointY);
        } else {
            ctx.lineTo(pointX, pointY);
        }
    }
    ctx.closePath();

    if (fill) {
        ctx.fillStyle = color;
        ctx.fill();
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
}

/**
 * Draw border around a patch (quilting stitch effect)
 */
function drawPatchBorder_OLD(ctx, x, y, width, height, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]); // Dashed line for stitch effect
    ctx.strokeRect(x + 1, y + 1, width - 2, height - 2);
    ctx.setLineDash([]); // Reset
}

/**
 * Draw outer border for entire quilt
 */
function drawQuiltBorder_OLD(ctx, size) {
    const borderWidth = 15;
    const borderColor = '#62361b'; // CTA brown for frame

    // Outer frame
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(borderWidth / 2, borderWidth / 2, size - borderWidth, size - borderWidth);

    // Inner decorative line
    ctx.strokeStyle = '#d4af37'; // Gold accent
    ctx.lineWidth = 2;
    ctx.strokeRect(borderWidth + 3, borderWidth + 3, size - 2 * borderWidth - 6, size - 2 * borderWidth - 6);
}

/**
 * Add download button for saving quilt pattern
 */
function addDownloadButton(container, canvas) {
    const buttonContainer = document.createElement('div');
    buttonContainer.style.textAlign = 'center';
    buttonContainer.style.marginTop = '1rem';

    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = 'Download Pattern';
    downloadBtn.className = 'secondary-btn';
    downloadBtn.style.display = 'inline-block';
    downloadBtn.style.padding = '0.75rem 1.5rem';
    downloadBtn.style.fontSize = '0.9rem';

    downloadBtn.addEventListener('click', () => {
        // Convert canvas to blob and download
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `chicago-songline-quilt-${Date.now()}.png`;
            link.click();
            URL.revokeObjectURL(url);
        });
    });

    buttonContainer.appendChild(downloadBtn);
    container.appendChild(buttonContainer);
}

/**
 * Color manipulation utilities for quilt pattern
 */
function lightenColor(hex, percent) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;

    const r = Math.min(255, rgb.r + Math.round((255 - rgb.r) * percent / 100));
    const g = Math.min(255, rgb.g + Math.round((255 - rgb.g) * percent / 100));
    const b = Math.min(255, rgb.b + Math.round((255 - rgb.b) * percent / 100));

    return rgbToHex(r, g, b);
}

function darkenColorQuilt(hex, percent) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;

    const r = Math.max(0, rgb.r - Math.round(rgb.r * percent / 100));
    const g = Math.max(0, rgb.g - Math.round(rgb.g * percent / 100));
    const b = Math.max(0, rgb.b - Math.round(rgb.b * percent / 100));

    return rgbToHex(r, g, b);
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Integrate quilt generation with route processing
 * Call this after route segments are parsed
 */
window.generateQuilt = generateQuilt;
