# OneStream-Utilities
### OneStream multi-environment application launcher and utilities.

This application utilizes Microsoft Windows [ClickOnce - PresentationHost.exe](https://en.wikipedia.org/wiki/ClickOnce) application deployment feature. Although you can build for other platforms, the application will not work without this.

<img src="https://github.com/weirtz/OneStream-Utilities/blob/main/assets/images/Application-Preview.png?raw=true" width="350">

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
