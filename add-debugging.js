#!/usr/bin/env node
/**
 * Script to add comprehensive debugging to script.js
 * Adds logging throughout all major functions
 */

const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, 'script.js');
let content = fs.readFileSync(scriptPath, 'utf8');

// Function to add logging at function start
function addFunctionStartLogging(content) {
    // Add comprehensive logging to initApp
    content = content.replace(
        /window\.initApp = function\(\) \{\s*console\.log\('🗺️  initApp callback triggered'\);/,
        `window.initApp = function() {
    console.group('🗺️ INITIALIZATION: Google Maps API Callback');
    console.log('⏱️ Timestamp:', new Date().toISOString());
    console.log('✅ Google Maps API loaded successfully');
    console.log('🔍 Checking google object:', typeof google !== 'undefined' ? 'Available' : 'Not available');
    console.groupEnd();
    console.log('🗺️  initApp callback triggered');`
    );

    // Add comprehensive logging to initMap
    content = content.replace(
        /function initMap\(\) \{\s*console\.log\('🗺️  Initializing Google Maps\.\.\.'\);/,
        `function initMap() {
    console.group('🗺️ INITIALIZATION: Map Setup');
    console.log('⏱️ Start time:', new Date().toISOString());
    console.log('🗺️  Initializing Google Maps...');

    try {`
    );

    content = content.replace(
        /console\.log\('✅ Google Maps initialized - Chicago Songline Simulator ready'\);\s*updateAPIKeyStatus\(true\);/,
        `console.log('✅ Google Maps initialized successfully');
        console.log('🎉 Chicago Songline Simulator ready');
        updateAPIKeyStatus(true);
    } catch (error) {
        console.error('❌ ERROR during map initialization:', error);
        console.error('Error details:', { message: error.message, stack: error.stack });
        updateAPIKeyStatus(false);
    } finally {
        console.groupEnd();
    }`
    );

    // Add comprehensive logging to requestDirections
    content = content.replace(
        /function requestDirections\(origin, destination\) \{\s*console\.log\('\\n🚀 ========== ROUTE GENERATION STARTED =========='\);/,
        `function requestDirections(origin, destination) {
    console.group('🚀 ROUTE GENERATION: Starting New Request');
    console.log('⏱️ Request time:', new Date().toISOString());
    console.log('\\n🚀 ========== ROUTE GENERATION STARTED ==========');

    try {`
    );

    content = content.replace(
        /directionsService\.route\(request, \(result, status\) => \{/,
        `const requestStartTime = performance.now();

        directionsService.route(request, (result, status) => {
            const requestDuration = (performance.now() - requestStartTime).toFixed(2);
            console.log('⚡ Request duration:', requestDuration, 'ms');`
    );

    // Add error handling for clearOutputs
    content = content.replace(
        /function clearOutputs\(\) \{/,
        `function clearOutputs() {
    console.group('🧹 Clearing Previous Outputs');
    try {`
    );

    content = content.replace(
        /if \(typeof stopAudio === 'function'\) \{\s*stopAudio\(\);\s*\}\s*\}/m,
        `if (typeof stopAudio === 'function') {
            console.log('⏹️ Stopping audio playback');
            stopAudio();
        }
        console.log('✅ All outputs cleared successfully');
    } catch (error) {
        console.error('❌ ERROR clearing outputs:', error);
    } finally {
        console.groupEnd();
    }
}`
    );

    return content;
}

// Function to enhance audio generation logging
function addAudioLogging(content) {
    // Add logging to initAudioContext
    content = content.replace(
        /function initAudioContext\(\) \{\s*if \(!audioContext\) \{/,
        `function initAudioContext() {
    console.group('🎵 AUDIO: Initializing Audio Context');
    try {
        if (!audioContext) {
            console.log('🔧 Creating new AudioContext...');`
    );

    content = content.replace(
        /audioContext = new \(window\.AudioContext \|\| window\.webkitAudioContext\)\(\);/,
        `const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) {
                throw new Error('Web Audio API not supported');
            }
            audioContext = new AudioContextClass();
            console.log('✅ AudioContext created');
            console.log('🔍 State:', audioContext.state);
            console.log('🔊 Sample rate:', audioContext.sampleRate, 'Hz');`
    );

    // Add logging to generateAudio
    content = content.replace(
        /function generateAudio\(segments\) \{\s*if \(!segments \|\| segments\.length === 0\) \{/,
        `function generateAudio(segments) {
    console.group('🎵 AUDIO GENERATION: Building Audio Sequence');
    console.log('⏱️ Generation start:', new Date().toISOString());
    if (!segments || segments.length === 0) {`
    );

    // Add logging to playAudio
    content = content.replace(
        /function playAudio\(\) \{\s*if \(isPlaying\) return;/,
        `function playAudio() {
    console.group('▶️ AUDIO PLAYBACK: Starting');
    console.log('⏱️ Play initiated:', new Date().toISOString());
    if (isPlaying) {
        console.warn('⚠️ Already playing');
        console.groupEnd();
        return;
    }
    try {`
    );

    // Add logging to pauseAudio and stopAudio
    content = content.replace(
        /function pauseAudio\(\) \{\s*if \(!isPlaying\) return;/,
        `function pauseAudio() {
    console.group('⏸️ AUDIO PLAYBACK: Pausing');
    if (!isPlaying) {
        console.warn('⚠️ Not playing');
        console.groupEnd();
        return;
    }
    try {`
    );

    content = content.replace(
        /function stopAudio\(\) \{\s*isPlaying = false;/,
        `function stopAudio() {
    console.group('⏹️ AUDIO PLAYBACK: Stopping');
    try {
        isPlaying = false;`
    );

    return content;
}

// Function to enhance timeline visualization logging
function addTimelineLogging(content) {
    // Add logging to renderTimeline
    content = content.replace(
        /function renderTimeline\(segments\) \{\s*if \(!segments \|\| segments\.length === 0\) \{/,
        `function renderTimeline(segments) {
    console.group('🎨 TIMELINE VISUALIZATION: Rendering');
    console.log('⏱️ Start:', new Date().toISOString());
    if (!segments || segments.length === 0) {`
    );

    // Add logging to drawTimeline
    content = content.replace(
        /function drawTimeline\(segments, width, height\) \{\s*const ctx = timelineCtx;/,
        `function drawTimeline(segments, width, height) {
    console.debug('🖌️ TIMELINE: Drawing', segments.length, 'segments');
    try {
        const ctx = timelineCtx;`
    );

    return content;
}

// Function to enhance quilt pattern logging
function addQuiltLogging(content) {
    // Add logging to generateQuilt
    content = content.replace(
        /function generateQuilt\(segments\) \{\s*if \(!segments \|\| segments\.length === 0\) \{/,
        `function generateQuilt(segments) {
    console.group('🎨 QUILT PATTERN: Generating');
    console.log('⏱️ Start:', new Date().toISOString());
    if (!segments || segments.length === 0) {`
    );

    content = content.replace(
        /console\.log\('Generating quilt pattern from', segments\.length, 'segments'\);/,
        `console.log('📊 Input:', segments.length, 'segments');
    try {`
    );

    content = content.replace(
        /console\.log\('Quilt pattern generated successfully'\);/,
        `console.log('🎉 Quilt pattern generated successfully');
    } catch (error) {
        console.error('❌ ERROR generating quilt:', error);
    } finally {
        console.groupEnd();
    }`
    );

    return content;
}

// Function to add user action logging
function addUserActionLogging(content) {
    // Add logging to button clicks
    content = content.replace(
        /document\.getElementById\('generate-btn'\)\.addEventListener\('click', \(\) => \{/,
        `document.getElementById('generate-btn').addEventListener('click', () => {
        console.group('👤 USER ACTION: Generate Button Clicked');
        console.log('⏱️ Time:', new Date().toISOString());`
    );

    content = content.replace(
        /document\.getElementById\('example-btn'\)\.addEventListener\('click', \(\) => \{/,
        `document.getElementById('example-btn').addEventListener('click', () => {
        console.group('👤 USER ACTION: Example Route Button');`
    );

    // Add logging to keyboard shortcuts
    content = content.replace(
        /function setupKeyboardShortcuts\(\) \{/,
        `function setupKeyboardShortcuts() {
    console.log('⌨️ Setting up keyboard shortcuts...');`
    );

    content = content.replace(
        /if \(e\.code === 'Space' && e\.target\.tagName !== 'INPUT'\) \{/,
        `if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
            console.log('⌨️ USER ACTION: Space pressed');`
    );

    content = content.replace(
        /if \(e\.code === 'Escape'\) \{/,
        `if (e.code === 'Escape') {
            console.log('⌨️ USER ACTION: Escape pressed');`
    );

    return content;
}

// Function to add comprehensive route parsing logging
function addRouteParsingLogging(content) {
    content = content.replace(
        /function parseRouteSegments\(directionsResult\) \{\s*console\.log\('🔍 Parsing route segments\.\.\.'\);/,
        `function parseRouteSegments(directionsResult) {
    console.group('🔍 ROUTE PARSING: Extracting Segments');
    console.log('⏱️ Parse start:', new Date().toISOString());
    console.log('🔍 Parsing route segments...');
    try {`
    );

    content = content.replace(
        /legs\.forEach\(\(leg, legIndex\) => \{\s*console\.log\(`\\n--- Leg \$\{legIndex \+ 1\}/,
        `legs.forEach((leg, legIndex) => {
        console.group(\`🚶 Leg \${legIndex + 1}/\${legs.length}\`);
        console.log('📍 From:', leg.start_address);
        console.log('📍 To:', leg.end_address);
        console.log(\`\\n--- Leg \${legIndex + 1}`
    );

    return content;
}

// Function to add error handling logging
function addErrorLogging(content) {
    content = content.replace(
        /function handleDirectionsError\(status\) \{/,
        `function handleDirectionsError(status) {
    console.group('❌ ERROR HANDLING: Directions API Error');
    console.error('🚫 Error status:', status);`
    );

    content = content.replace(
        /showError\(errorMessage\);\s*console\.error\('Directions error:', status\);/,
        `console.error('📝 Error message:', errorMessage);
    showError(errorMessage);
    console.groupEnd();`
    );

    return content;
}

// Function to enhance DOMContentLoaded logging
function addDOMLoadedLogging(content) {
    content = content.replace(
        /document\.addEventListener\('DOMContentLoaded', \(\) => \{/,
        `document.addEventListener('DOMContentLoaded', () => {
    console.group('🚀 APPLICATION: Initializing');
    console.log('⏱️ DOM Loaded:', new Date().toISOString());
    try {`
    );

    content = content.replace(
        /console\.log\('%c🎵 Chicago Songline Simulator'/,
        `console.log('✅ Initialization complete');
        console.groupEnd();
        console.log('%c🎵 Chicago Songline Simulator'`
    );

    return content;
}

// Apply all enhancements
console.log('🔧 Adding comprehensive debugging logs...');

content = addFunctionStartLogging(content);
content = addAudioLogging(content);
content = addTimelineLogging(content);
content = addQuiltLogging(content);
content = addUserActionLogging(content);
content = addRouteParsingLogging(content);
content = addErrorLogging(content);
content = addDOMLoadedLogging(content);

// Write the enhanced file
fs.writeFileSync(scriptPath, content, 'utf8');

console.log('✅ Debugging logs added successfully!');
console.log('📊 Enhanced functions:');
console.log('  - Initialization (initApp, initMap)');
console.log('  - Route Generation (requestDirections, parseRouteSegments)');
console.log('  - Audio Generation (generateAudio, playAudio, pauseAudio, stopAudio)');
console.log('  - Timeline Visualization (renderTimeline, drawTimeline)');
console.log('  - Quilt Pattern (generateQuilt)');
console.log('  - User Actions (button clicks, keyboard shortcuts)');
console.log('  - Error Handling (handleDirectionsError)');
console.log('💾 Original backed up to script.js.backup');
