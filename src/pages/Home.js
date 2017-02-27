/* eslint no-bitwise: 0 */

import React from 'react';
import CanvasTileEngine from '../components/CanvasTileEngine';
import map1 from '../maps/map1.json';
import tileAtlas from '../maps/tile-atlas.png';

// Create random star fields in layers 1, 2 and 3
for (let i = 1; i <= 3; ++i) {
  const layer = map1.layers[i];
  const map = new Array(layer.height);
  for (let y = 0; y < map.length; ++y) {
    map[y] = new Array(layer.width);
    for (let x = 0; x < map[y].length; ++x) {
      const randomIndex = (Math.random() * 40) | 0;
      map[y][x] = randomIndex >= 36 ? (randomIndex - 36) + 2 + (4 * (i - 1)) : 0;
    }
  }
  layer.map = map;
}

const world = {
  width: 320,
  height: 200,
  scale: 3,
};

export default class Home extends React.Component {

  _scrollDirX = 1;
  _scrollDirY = 1;

  _tick = ({getSceneX, setSceneX, getSceneY, setSceneY}) => {

    const widthInTiles = (world.width / map1.layers[0].tileset.tileWidth) | 0;
    const heightInTiles = (world.height / map1.layers[0].tileset.tileHeight) | 0;

    if (this._scrollDirX !== 0) {

      if (this._scrollDirX > 0) {
        if ((getSceneX() >> 3) + widthInTiles >= map1.layers[0].width) {
          this._scrollDirX = -1;
        }
      } else if (getSceneX() < 0) {
        this._scrollDirX = 1;
      }

      setSceneX(getSceneX() + this._scrollDirX);
    }

    if (this._scrollDirY !== 0) {

      if (this._scrollDirY > 0) {
        if ((getSceneY() >> 3) + heightInTiles >= map1.layers[0].height) {
          this._scrollDirY = -1;
        }
      } else if (getSceneY() < 0) {
        this._scrollDirY = 1;
      }

      setSceneY(getSceneY() + this._scrollDirY);
    }
  };

  render() {
    return (
      <div className="container">
        <CanvasTileEngine
          world={world}
          map={map1}
          tileAtlas={tileAtlas}
          onTick={this._tick}
          style={{marginTop: 10}}
        />
      </div>
    );
  }
}
