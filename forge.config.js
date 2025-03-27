module.exports = {
  packagerConfig: {
    asar: true,
    icon: 'icon'    
  },
  rebuildConfig: {},
  makers: [
    // {
    //   "name": "@rabbitholesyndrome/electron-forge-maker-portable",
    //   "config": {
    //     "portable": {
    //       "artifactName": "OneStream Application Launcher.exe"
    //     }
    //   }
    // },
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        "name": "OneStream-Utilities",
        "icon": "icon.ico",
        "setupIcon": "icon.ico",
        "loadingGif": "assets/images/installing.gif"
      },
      build: {     
        "files": [
          "applications/book-utility/server.js",
          "applications/book-utility/file-ripper.js",
          "applications/book-utility/file-ripper-reportNames.js"
         ],
        }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
};
