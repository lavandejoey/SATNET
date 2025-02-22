# SATNET

---

3D satellite plotting application with the ability to highlight specific satellites and display detailed information.


## Installation Dependencies

```bash
npm install
```

## Scripts Supported by npm

- **start**: Starts the Vite development server `npm start` or `npm run dev`.
- **build**: Builds the project for production `npm run build`.
- **serve**: Serves the built project for preview `npm run serve`.

  After running `npm run build`, the project will be built in the `dist` directory. You can preview the built project by running `npm run serve`.
- After script running, the webpage can be shown in the ***[http://localhost:4170/](http://localhost:4170/)***.

# Functions TODOs
## 3D Animation
- 3D satellite plotting (Current)
  - Highlight specific satellite (by click): highlight its detailed information.

- 3D Filter by time (launched / not at a past time)


## Data Analysis
- Launch **location** on 2D by time [2D-time]
  e.g. https://celestrak.org/satcat/launchsites.php
  
- Stat char/graph animation by time
  
  numbers of launches, like: 人口图 [#launches in country - time]
  
  global number of active satellites [#all launches - time]
  
  number of satellites [#launches in types - time]


# Websites for Reference
## Examples / its Github repo

- https://www.starlinkmap.org/
  有点丑的
- https://github.com/Flowm/satvis
- https://spaceaware.io/

### Others
- https://github.com/jeremysuh/3D-Satellite-Tracker
- https://github.com/andrewkihs/satellite-radio
- https://github.com/RuiZhang2Penn/Shinning

## Data Souce
- https://celestrak.org/NORAD/elements/
- https://satdb.ethz.ch/
  Processed 'celestrak' data APIs
- https://github.com/r-spacex/SpaceX-API/tree/master/docs/starlink/v4
  might be official data
- https://planet4589.org/space/gcat/web/sites/index.html
  Launch sites

## The Earth texture
- https://planetpixelemporium.com/earth.html
