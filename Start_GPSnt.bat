@echo off
echo Starting GPSn't Local Server...
echo Please leave this black window open while using the app!
start "" "http://127.0.0.1:8123"
python -m http.server 8123
