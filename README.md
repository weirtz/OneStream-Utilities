# OneStream-Utilities
### OneStream multi-environment application launcher and utilities.

This application utilizes Microsoft Windows [ClickOnce - PresentationHost.exe](https://en.wikipedia.org/wiki/ClickOnce) application deployment feature. Although you can build for other platforms, the application will not work without this.

<img src="https://github.com/weirtz/OneStream-Utilities/blob/main/assets/images/Application-Preview.png?raw=true" width="350">

### Setup DEV Environment
```
npm install
```

### Run DEV environment application
```
npm run start
```

### Build Application
```
npm run make
```
You can configure OS Build types within **forge.config.js**

By default, it will use **@electron-forge/maker-squirrel** for building a Windows .exe 

<br><br>

## Included Utility: Book Report Utility
<img src="https://github.com/weirtz/OneStream-Utilities/blob/main/assets/images/Application-Preview2.png?raw=true" width="450">

## Updates to code you need to make
As of now, the application information is hardcoded. You will need to go into the code before building and add your own Applications URLs to the code. Below are screenshots of the changes needed, marked in yellow is where to add your applications URLs

<img src="https://github.com/weirtz/OneStream-Utilities/blob/main/assets/images/updates-1.png?raw=true">

<img src="https://github.com/weirtz/OneStream-Utilities/blob/main/assets/images/updates-2.png?raw=true">
