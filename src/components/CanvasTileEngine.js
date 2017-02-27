/* eslint no-bitwise: 0 */

import React from 'react';

const {arrayOf, bool, func, number, shape, string} = React.PropTypes;

export default class CanvasTileEngine extends React.Component {

  static propTypes = {
    world: shape({
      width: number.isRequired,
      height: number.isRequired,
      scale: number.isRequired,
    }),
    tileAtlas: string.isRequired,
    map: shape({
      layers: arrayOf(shape({
        name: string.isRequired,
        tileset: shape({
          url: string.isRequired,
          tileWidth: number.isRequired,
          tileHeight: number.isRequired,
        }).isRequired,
        width: number.isRequired,
        height: number.isRequired,
        xScrollDivisor: number.isRequired,
        yScrollDivisor: number.isRequired,
        map: arrayOf(arrayOf(number.isRequired).isRequired).isRequired,
      })).isRequired,
    }).isRequired,
    onTick: func.isRequired,
    blitFromCanvas: bool,
    frameDuration: number,
  };

  static defaultProps = {
    world: {
      width: 320,
      height: 200,
      scale: 2,
    },
    blitFromCanvas: true,
    frameDuration: 1000.0 / 60,
  };

  componentDidMount() {
    this._tileAtlases = new Array(this.props.map.layers.length);
    this._ctx = this._canvas.getContext('2d');
    this._clearCanvas();
    this._loadTiles();
  }

  componentWillUnmount() {
    this._ctx = null;
  }

  _canvas = null;
  _ctx = null;
  _tileAtlases = null;
  _tileAtlasesLoaded = 0;
  _sceneX = 0;
  _sceneY = 0;
  _firstTime = -1;
  _lastFrame = -1;

  _gameLoopContext = {
    getSceneX: () => this._sceneX,
    setSceneX: x => this._sceneX = x,
    getSceneY: () => this._sceneY,
    setSceneY: y => this._sceneY = y,
  };

  _drawTile(layerIndex, tileIndex, x, y) {
    const tileX = (tileIndex & 31) | 0;
    const tileY = (tileIndex >> 5) | 0;
    this._ctx.drawImage(this._tileAtlases[layerIndex], tileX << 3, tileY << 3, 8, 8, x, y, 8, 8);
  }

  _drawLayer(layerIndex) {
    const layer = this.props.map.layers[layerIndex];
    const layerX = this._sceneX / layer.xScrollDivisor;
    const layerY = this._sceneY / layer.yScrollDivisor;

    const startTilemapX = (layerX / layer.tileset.tileWidth) | 0;
    const scrollOffsetX = layerX % layer.tileset.tileWidth;
    const startTilemapY = (layerY / layer.tileset.tileHeight) | 0;
    const scrollOffsetY = layerY % layer.tileset.tileHeight;

    const widthInTiles = (this.props.world.width / layer.tileset.tileWidth) | 0;
    const heightInTiles = (this.props.world.height / layer.tileset.tileHeight) | 0;

    for (let y = 0; y <= heightInTiles; ++y) {
      for (let x = 0; x <= widthInTiles; ++x) {

        if ((x < widthInTiles || scrollOffsetX > 0) && (y < heightInTiles || scrollOffsetY > 0)) {

          const tilemapX = startTilemapX + x;
          const tilemapY = startTilemapY + y;

          if (0 <= tilemapX && tilemapX < layer.width && 0 <= tilemapY && tilemapY < layer.height) {
            const tileIndex = layer.map[tilemapY][tilemapX];
            if (tileIndex > 0) {
              this._drawTile(layerIndex, tileIndex, (x * layer.tileset.tileWidth) - scrollOffsetX, (y * layer.tileset.tileHeight) - scrollOffsetY);
            }
          }
        }
      }
    }
  }

  /** Draw the scene. It's currently single layer. Multiple layers with parallax scrolling will be added later. */
  _drawScene() {
    for (let i = this.props.map.layers.length - 1; i >= 0; --i) {
      this._drawLayer(i);
    }
  }

  _animationLoop = () => {
    requestAnimationFrame(this._animationLoop);
  };

  _gameLoop = time => {

    // Render the scene
    this._clearCanvas();
    this._drawScene();

    // Determine the number of frames to execute.
    if (this._firstTime < 0) {
      this._firstTime = time;
    }
    const currentFrame = ((time - this._firstTime) / this.props.frameDuration) | 0;
    const frames = currentFrame - this._lastFrame;
    this._lastFrame = currentFrame;

    // Update game logic by the number of frames.
    for (let i = 0; i < frames; ++i) {
      this.props.onTick(this._gameLoopContext);
    }

    // Do it all over again.
    requestAnimationFrame(this._gameLoop);
  };

  _startGame() {
    requestAnimationFrame(this._gameLoop);
  }

  _onTileAtlasLoaded = (layerIndex, tileAtlas) => {

    if (this.props.blitFromCanvas) {
      const canvas = document.createElement('canvas');
      canvas.width = tileAtlas.width;
      canvas.height = tileAtlas.height;
      canvas.getContext('2d').drawImage(tileAtlas, 0, 0);
      this._tileAtlases[layerIndex] = canvas;
    } else {
      this._tileAtlases[layerIndex] = tileAtlas;
    }

    if (++this._tileAtlasesLoaded === this.props.map.layers.length) {
      this._startGame();
    }
  };

  _loadTiles() {
    for (let i = 0; i < this.props.map.layers.length; ++i) {
      const tileAtlas = new Image();
      tileAtlas.onload = () => this._onTileAtlasLoaded(i, tileAtlas);
      tileAtlas.src = this.props.tileAtlas;
    }
  }

  _clearCanvas() {
    const ctx = this._ctx;
    ctx.beginPath();
    ctx.rect(0, 0, this.props.world.width, this.props.world.height);
    ctx.fillStyle = '#000';
    ctx.fill();
  }

  render() {
    return (
      <canvas
        ref={canvas => this._canvas = canvas}
        width={this.props.world.width}
        height={this.props.world.height}
        className="noSmoothing"
        style={{
          width: this.props.world.width * this.props.world.scale,
          height: this.props.world.height * this.props.world.scale,
          ...this.props.style,
        }}
      />
    );
  }
}
