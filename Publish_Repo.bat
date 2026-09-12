@echo off
echo ===================================================
echo   GPSn't - Git Publisher and Installer
echo ===================================================
echo.

git --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Git is not installed. Installing Git now...
    echo (You may see a Windows Admin prompt. Please click YES)
    winget install Git.Git -e --accept-source-agreements --accept-package-agreements
    
    echo.
    echo Git installation complete! 
    echo We need to reload the system to use Git.
    echo Please CLOSE this window, and double-click Publish_Repo.bat again!
    pause
    exit
)

echo Git is installed. Initializing repository...
git init
git add .
git commit -m "Initial commit: GPSn't app completed"

echo.
echo ===================================================
echo Repository is ready! 
echo Go to github.com and create a new EMPTY repository.
echo ===================================================
set /p repo_url="Paste your new GitHub Repository URL here (or press Enter to skip pushing): "

IF "%repo_url%"=="" (
    echo Skipped pushing. Your local repository is ready!
    pause
    exit
)

git branch -M main
git remote add origin %repo_url%
echo Pushing to GitHub...
git push -u origin main

echo.
echo Done! Your code is now live on GitHub.
pause
