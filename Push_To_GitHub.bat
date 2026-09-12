@echo off
echo ===================================================
echo   GPSn't - Automatic GitHub Publisher
echo ===================================================
echo.

set PATH=%PATH%;%CD%\bin;C:\Program Files\Git\cmd

echo Initializing local Git repository...
git init
git add .
git commit -m "Initial commit: GPSn't app completed"

echo.
echo ===================================================
echo   STEP 1: Log in to GitHub
echo ===================================================
echo The GitHub CLI will now guide you through logging in.
echo Please follow the prompts on the screen (Choose GitHub.com, HTTPS, Login with a web browser).
echo.
bin\gh.exe auth login -w

echo.
echo ===================================================
echo   STEP 2: Create Repository and Push
echo ===================================================
set /p repo_name="Enter the name for your new GitHub repository (e.g., gpsnt): "

echo.
echo Creating repository '%repo_name%' on GitHub and pushing code...
bin\gh.exe repo create %repo_name% --public --source=. --remote=origin --push

echo.
echo ===================================================
echo Done! Your code is now live on GitHub!
echo ===================================================
pause
