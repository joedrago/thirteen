(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var Animation, calcSign;

calcSign = function(v) {
  if (v === 0) {
    return 0;
  } else if (v < 0) {
    return -1;
  }
  return 1;
};

Animation = (function() {
  function Animation(data) {
    var k, v;
    this.speed = data.speed;
    this.req = {};
    this.cur = {};
    for (k in data) {
      v = data[k];
      if (k !== 'speed') {
        this.req[k] = v;
        this.cur[k] = v;
      }
    }
  }

  Animation.prototype.warp = function() {
    if (this.cur.r != null) {
      this.cur.r = this.req.r;
    }
    if (this.cur.s != null) {
      this.cur.s = this.req.s;
    }
    if ((this.cur.x != null) && (this.cur.y != null)) {
      this.cur.x = this.req.x;
      return this.cur.y = this.req.y;
    }
  };

  Animation.prototype.animating = function() {
    if (this.cur.r != null) {
      if (this.req.r !== this.cur.r) {
        return true;
      }
    }
    if (this.cur.s != null) {
      if (this.req.s !== this.cur.s) {
        return true;
      }
    }
    if ((this.cur.x != null) && (this.cur.y != null)) {
      if ((this.req.x !== this.cur.x) || (this.req.y !== this.cur.y)) {
        return true;
      }
    }
    return false;
  };

  Animation.prototype.update = function(dt) {
    var dist, dr, ds, maxDist, negTwoPi, sign, twoPi, updated, vecX, vecY;
    updated = false;
    if (this.cur.r != null) {
      if (this.req.r !== this.cur.r) {
        updated = true;
        twoPi = Math.PI * 2;
        negTwoPi = -1 * twoPi;
        while (this.req.r >= twoPi) {
          this.req.r -= twoPi;
        }
        while (this.req.r <= negTwoPi) {
          this.req.r += twoPi;
        }
        dr = this.req.r - this.cur.r;
        dist = Math.abs(dr);
        sign = calcSign(dr);
        if (dist > Math.PI) {
          dist = twoPi - dist;
          sign *= -1;
        }
        maxDist = dt * this.speed.r / 1000;
        if (dist < maxDist) {
          this.cur.r = this.req.r;
        } else {
          this.cur.r += maxDist * sign;
        }
      }
    }
    if (this.cur.s != null) {
      if (this.req.s !== this.cur.s) {
        updated = true;
        ds = this.req.s - this.cur.s;
        dist = Math.abs(ds);
        sign = calcSign(ds);
        maxDist = dt * this.speed.s / 1000;
        if (dist < maxDist) {
          this.cur.s = this.req.s;
        } else {
          this.cur.s += maxDist * sign;
        }
      }
    }
    if ((this.cur.x != null) && (this.cur.y != null)) {
      if ((this.req.x !== this.cur.x) || (this.req.y !== this.cur.y)) {
        updated = true;
        vecX = this.req.x - this.cur.x;
        vecY = this.req.y - this.cur.y;
        dist = Math.sqrt((vecX * vecX) + (vecY * vecY));
        maxDist = dt * this.speed.t / 1000;
        if (dist < maxDist) {
          this.cur.x = this.req.x;
          this.cur.y = this.req.y;
        } else {
          this.cur.x += (vecX / dist) * maxDist;
          this.cur.y += (vecY / dist) * maxDist;
        }
      }
    }
    return updated;
  };

  return Animation;

})();

module.exports = Animation;


},{}],2:[function(require,module,exports){
var Animation, Button;

Animation = require('./Animation');

Button = (function() {
  function Button(game, spriteNames, font, textHeight, x, y, cb) {
    this.game = game;
    this.spriteNames = spriteNames;
    this.font = font;
    this.textHeight = textHeight;
    this.x = x;
    this.y = y;
    this.cb = cb;
    this.anim = new Animation({
      speed: {
        s: 3
      },
      s: 0
    });
    this.color = {
      r: 1,
      g: 1,
      b: 1,
      a: 0
    };
  }

  Button.prototype.update = function(dt) {
    return this.anim.update(dt);
  };

  Button.prototype.render = function() {
    var text;
    this.color.a = this.anim.cur.s;
    this.game.spriteRenderer.render(this.spriteNames[0], this.x, this.y, 0, this.textHeight * 1.5, 0, 0.5, 0.5, this.game.colors.white, (function(_this) {
      return function() {
        _this.anim.cur.s = 1;
        _this.anim.req.s = 0;
        return _this.cb(true);
      };
    })(this));
    this.game.spriteRenderer.render(this.spriteNames[1], this.x, this.y, 0, this.textHeight * 1.5, 0, 0.5, 0.5, this.color);
    text = this.cb(false);
    return this.game.fontRenderer.render(this.font, this.textHeight, text, this.x, this.y, 0.5, 0.5, this.game.colors.buttontext);
  };

  return Button;

})();

module.exports = Button;


},{"./Animation":1}],3:[function(require,module,exports){
var FontRenderer, fontmetrics, hexToRgb;

fontmetrics = require('./fontmetrics');

hexToRgb = function(hex, a) {
  var result;
  result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return null;
  }
  return {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
    a: a
  };
};

FontRenderer = (function() {
  function FontRenderer(game) {
    this.game = game;
    this.white = {
      r: 1,
      g: 1,
      b: 1,
      a: 1
    };
  }

  FontRenderer.prototype.size = function(font, height, str) {
    var ch, code, glyph, i, j, len1, metrics, scale, totalHeight, totalWidth;
    metrics = fontmetrics[font];
    if (!metrics) {
      return;
    }
    scale = height / metrics.height;
    totalWidth = 0;
    totalHeight = metrics.height * scale;
    for (i = j = 0, len1 = str.length; j < len1; i = ++j) {
      ch = str[i];
      code = ch.charCodeAt(0);
      glyph = metrics.glyphs[code];
      if (!glyph) {
        continue;
      }
      totalWidth += glyph.xadvance * scale;
    }
    return {
      w: totalWidth,
      h: totalHeight
    };
  };

  FontRenderer.prototype.render = function(font, height, str, x, y, anchorx, anchory, color, cb) {
    var anchorOffsetX, anchorOffsetY, ch, code, colorStart, currX, currentColor, glyph, i, j, k, len, len1, len2, metrics, results, scale, skipColor, startingColor, totalHeight, totalWidth;
    metrics = fontmetrics[font];
    if (!metrics) {
      return;
    }
    scale = height / metrics.height;
    totalWidth = 0;
    totalHeight = metrics.height * scale;
    skipColor = false;
    for (i = j = 0, len1 = str.length; j < len1; i = ++j) {
      ch = str[i];
      if (ch === '`') {
        skipColor = !skipColor;
      }
      if (skipColor) {
        continue;
      }
      code = ch.charCodeAt(0);
      glyph = metrics.glyphs[code];
      if (!glyph) {
        continue;
      }
      totalWidth += glyph.xadvance * scale;
    }
    anchorOffsetX = -1 * anchorx * totalWidth;
    anchorOffsetY = -1 * anchory * totalHeight;
    currX = x;
    if (color) {
      startingColor = color;
    } else {
      startingColor = this.white;
    }
    currentColor = startingColor;
    colorStart = -1;
    results = [];
    for (i = k = 0, len2 = str.length; k < len2; i = ++k) {
      ch = str[i];
      if (ch === '`') {
        if (colorStart === -1) {
          colorStart = i + 1;
        } else {
          len = i - colorStart;
          if (len) {
            currentColor = hexToRgb(str.substr(colorStart, i - colorStart), startingColor.a);
          } else {
            currentColor = startingColor;
          }
          colorStart = -1;
        }
      }
      if (colorStart !== -1) {
        continue;
      }
      code = ch.charCodeAt(0);
      glyph = metrics.glyphs[code];
      if (!glyph) {
        continue;
      }
      this.game.drawImage(font, glyph.x, glyph.y, glyph.width, glyph.height, currX + (glyph.xoffset * scale) + anchorOffsetX, y + (glyph.yoffset * scale) + anchorOffsetY, glyph.width * scale, glyph.height * scale, 0, 0, 0, currentColor.r, currentColor.g, currentColor.b, currentColor.a, cb);
      results.push(currX += glyph.xadvance * scale);
    }
    return results;
  };

  return FontRenderer;

})();

module.exports = FontRenderer;


},{"./fontmetrics":10}],4:[function(require,module,exports){
var Animation, BUILD_TIMESTAMP, Button, FontRenderer, Game, Hand, Menu, OK, Pile, SpriteRenderer, Thirteen, aiCharacters, ref;

Animation = require('./Animation');

Button = require('./Button');

FontRenderer = require('./FontRenderer');

SpriteRenderer = require('./SpriteRenderer');

Menu = require('./Menu');

Hand = require('./Hand');

Pile = require('./Pile');

ref = require('./Thirteen'), Thirteen = ref.Thirteen, OK = ref.OK, aiCharacters = ref.aiCharacters;

BUILD_TIMESTAMP = "0.0.1";

Game = (function() {
  function Game(_native, width, height) {
    this["native"] = _native;
    this.width = width;
    this.height = height;
    this.version = BUILD_TIMESTAMP;
    this.log("Game constructed: " + this.width + "x" + this.height);
    this.fontRenderer = new FontRenderer(this);
    this.spriteRenderer = new SpriteRenderer(this);
    this.font = "darkforest";
    this.zones = [];
    this.nextAITick = 1000;
    this.center = {
      x: this.width / 2,
      y: this.height / 2
    };
    this.aaHeight = this.width * 9 / 16;
    this.log("height: " + this.height + ". height if screen was 16:9 (aspect adjusted): " + this.aaHeight);
    this.pauseButtonSize = this.aaHeight / 15;
    this.colors = {
      white: {
        r: 1,
        g: 1,
        b: 1,
        a: 1
      },
      black: {
        r: 0,
        g: 0,
        b: 0,
        a: 1
      },
      red: {
        r: 1,
        g: 0,
        b: 0,
        a: 1
      },
      orange: {
        r: 1,
        g: 0.5,
        b: 0,
        a: 1
      },
      gold: {
        r: 1,
        g: 1,
        b: 0,
        a: 1
      },
      buttontext: {
        r: 1,
        g: 1,
        b: 1,
        a: 1
      },
      lightgray: {
        r: 0.5,
        g: 0.5,
        b: 0.5,
        a: 1
      },
      background: {
        r: 0,
        g: 0.2,
        b: 0,
        a: 1
      },
      logbg: {
        r: 0.1,
        g: 0,
        b: 0,
        a: 1
      },
      arrow: {
        r: 1,
        g: 1,
        b: 1,
        a: 1
      },
      arrowclose: {
        r: 1,
        g: 0.5,
        b: 0,
        a: 0.3
      },
      handarea: {
        r: 0,
        g: 0.1,
        b: 0,
        a: 1.0
      },
      overlay: {
        r: 0,
        g: 0,
        b: 0,
        a: 0.6
      },
      mainmenu: {
        r: 0.1,
        g: 0.1,
        b: 0.1,
        a: 1
      },
      pausemenu: {
        r: 0.1,
        g: 0.0,
        b: 0.1,
        a: 1
      },
      bid: {
        r: 0,
        g: 0.6,
        b: 0,
        a: 1
      }
    };
    this.textures = {
      "cards": 0,
      "darkforest": 1,
      "chars": 2,
      "howto1": 3,
      "howto2": 4,
      "howto3": 5
    };
    this.thirteen = null;
    this.lastErr = '';
    this.paused = false;
    this.howto = 0;
    this.renderCommands = [];
    this.optionMenus = {
      speeds: [
        {
          text: "AI Speed: Slow",
          speed: 2000
        }, {
          text: "AI Speed: Medium",
          speed: 1000
        }, {
          text: "AI Speed: Fast",
          speed: 500
        }, {
          text: "AI Speed: Ultra",
          speed: 250
        }
      ],
      sorts: [
        {
          text: "Sort Order: Normal"
        }, {
          text: "Sort Order: Reverse"
        }
      ]
    };
    this.options = {
      speedIndex: 1,
      sortIndex: 0,
      sound: true
    };
    this.mainMenu = new Menu(this, "Thirteen", "solid", this.colors.mainmenu, [
      (function(_this) {
        return function(click) {
          if (click) {
            _this.howto = 1;
          }
          return "How To Play";
        };
      })(this), (function(_this) {
        return function(click) {
          if (click) {
            _this.options.speedIndex = (_this.options.speedIndex + 1) % _this.optionMenus.speeds.length;
          }
          return _this.optionMenus.speeds[_this.options.speedIndex].text;
        };
      })(this), (function(_this) {
        return function(click) {
          if (click) {
            _this.options.sortIndex = (_this.options.sortIndex + 1) % _this.optionMenus.sorts.length;
          }
          return _this.optionMenus.sorts[_this.options.sortIndex].text;
        };
      })(this), (function(_this) {
        return function(click) {
          if (click) {
            _this.newGame();
          }
          return "Start";
        };
      })(this)
    ]);
    this.pauseMenu = new Menu(this, "Paused", "solid", this.colors.pausemenu, [
      (function(_this) {
        return function(click) {
          if (click) {
            _this.paused = false;
          }
          return "Resume Game";
        };
      })(this), (function(_this) {
        return function(click) {
          if (click) {
            _this.newGame();
            _this.paused = false;
          }
          return "New Game";
        };
      })(this), (function(_this) {
        return function(click) {
          if (click) {
            _this.howto = 1;
          }
          return "How To Play";
        };
      })(this), (function(_this) {
        return function(click) {
          if (click) {
            _this.options.speedIndex = (_this.options.speedIndex + 1) % _this.optionMenus.speeds.length;
          }
          return _this.optionMenus.speeds[_this.options.speedIndex].text;
        };
      })(this), (function(_this) {
        return function(click) {
          if (click) {
            _this.options.sortIndex = (_this.options.sortIndex + 1) % _this.optionMenus.sorts.length;
          }
          return _this.optionMenus.sorts[_this.options.sortIndex].text;
        };
      })(this)
    ]);
    this.newGame();
  }

  Game.prototype.log = function(s) {
    return this["native"].log(s);
  };

  Game.prototype.load = function(json) {
    var k, ref1, state, v;
    this.log("(CS) loading state");
    try {
      state = JSON.parse(json);
    } catch (error) {
      this.log("load failed to parse state: " + json);
      return;
    }
    if (state.options) {
      ref1 = state.options;
      for (k in ref1) {
        v = ref1[k];
        this.options[k] = v;
      }
    }
    if (state.thirteen) {
      this.log("recreating game from savedata");
      this.thirteen = new Thirteen(this, {
        state: state.thirteen
      });
      return this.prepareGame();
    }
  };

  Game.prototype.save = function() {
    var state;
    state = {
      options: this.options
    };
    return JSON.stringify(state);
  };

  Game.prototype.aiTickRate = function() {
    return this.optionMenus.speeds[this.options.speedIndex].speed;
  };

  Game.prototype.newGame = function() {
    this.thirteen = new Thirteen(this, {});
    this.log("player 0's hand: " + JSON.stringify(this.thirteen.players[0].hand));
    return this.prepareGame();
  };

  Game.prototype.prepareGame = function() {
    this.hand = new Hand(this);
    this.pile = new Pile(this, this.hand);
    return this.hand.set(this.thirteen.players[0].hand);
  };

  Game.prototype.touchDown = function(x, y) {
    return this.checkZones(x, y);
  };

  Game.prototype.touchMove = function(x, y) {
    if (this.thirteen !== null) {
      return this.hand.move(x, y);
    }
  };

  Game.prototype.touchUp = function(x, y) {
    if (this.thirteen !== null) {
      return this.hand.up(x, y);
    }
  };

  Game.prototype.prettyErrorTable = {};

  Game.prototype.prettyError = function() {
    var pretty;
    pretty = this.prettyErrorTable[this.lastErr];
    if (pretty) {
      return pretty;
    }
    return this.lastErr;
  };

  Game.prototype.calcHeadline = function() {
    var errText, headline;
    if (this.thirteen === null) {
      return "";
    }
    headline = "";
    errText = "";
    if ((this.lastErr.length > 0) && (this.lastErr !== OK)) {
      errText = "  ERROR: `ff0000`" + (this.prettyError());
      headline += errText;
    }
    return headline;
  };

  Game.prototype.gameOverText = function() {
    var winner;
    winner = this.thirteen.winner();
    if (winner.name === "Player") {
      return ["You win!"];
    }
    return [winner.name + " wins!"];
  };

  Game.prototype.play = function(cardToPlay, x, y, r, cardIndex) {
    var ret;
    this.log("(game) playing card " + cardToPlay);
    ret = this.thirteen.play({
      id: 1,
      cards: [cardToPlay]
    });
    this.lastErr = ret;
    if (ret === OK) {
      this.hand.set(this.thirteen.players[0].hand);
      return this.pile.hint([cardToPlay], x, y, r);
    }
  };

  Game.prototype.update = function(dt) {
    var updated;
    this.zones.length = 0;
    updated = false;
    if (this.updateMainMenu(dt)) {
      updated = true;
    }
    if (this.updateGame(dt)) {
      updated = true;
    }
    return updated;
  };

  Game.prototype.updateMainMenu = function(dt) {
    var updated;
    updated = false;
    if (this.mainMenu.update(dt)) {
      updated = true;
    }
    return updated;
  };

  Game.prototype.updateGame = function(dt) {
    var updated;
    if (this.thirteen === null) {
      return false;
    }
    updated = false;
    if (this.pile.update(dt)) {
      updated = true;
    }
    if (this.pile.readyForNextTrick()) {
      this.nextAITick -= dt;
      if (this.nextAITick <= 0) {
        this.nextAITick = this.aiTickRate();
        if (this.thirteen.aiTick()) {
          updated = true;
        }
      }
    }
    if (this.hand.update(dt)) {
      updated = true;
    }
    this.pile.set(this.thirteen.throwID, this.thirteen.pile, this.thirteen.pileWho);
    if (this.pauseMenu.update(dt)) {
      updated = true;
    }
    return updated;
  };

  Game.prototype.render = function() {
    this.renderCommands.length = 0;
    if (this.howto > 0) {
      this.renderHowto();
    } else if (this.thirteen === null) {
      this.renderMainMenu();
    } else {
      this.renderGame();
    }
    return this.renderCommands;
  };

  Game.prototype.renderHowto = function() {
    var arrowOffset, arrowWidth, color, howtoTexture;
    howtoTexture = "howto" + this.howto;
    this.log("rendering " + howtoTexture);
    this.spriteRenderer.render("solid", 0, 0, this.width, this.height, 0, 0, 0, this.colors.black);
    this.spriteRenderer.render(howtoTexture, 0, 0, this.width, this.aaHeight, 0, 0, 0, this.colors.white);
    arrowWidth = this.width / 20;
    arrowOffset = arrowWidth * 4;
    color = this.howto === 1 ? this.colors.arrowclose : this.colors.arrow;
    this.spriteRenderer.render("arrowL", this.center.x - arrowOffset, this.height, arrowWidth, 0, 0, 0.5, 1, color, (function(_this) {
      return function() {
        _this.howto--;
        if (_this.howto < 0) {
          return _this.howto = 0;
        }
      };
    })(this));
    color = this.howto === 3 ? this.colors.arrowclose : this.colors.arrow;
    return this.spriteRenderer.render("arrowR", this.center.x + arrowOffset, this.height, arrowWidth, 0, 0, 0.5, 1, color, (function(_this) {
      return function() {
        _this.howto++;
        if (_this.howto > 3) {
          return _this.howto = 0;
        }
      };
    })(this));
  };

  Game.prototype.renderMainMenu = function() {
    return this.mainMenu.render();
  };

  Game.prototype.renderGame = function() {
    var aiPlayers, character, characterHeight, characterMargin, characterWidth, countHeight, gameOverSize, gameOverY, i, j, len, line, lines, ref1, restartQuitSize, shadowDistance, textHeight, textPadding;
    this.spriteRenderer.render("solid", 0, 0, this.width, this.height, 0, 0, 0, this.colors.background);
    textHeight = this.aaHeight / 25;
    textPadding = textHeight / 5;
    characterHeight = this.aaHeight / 5;
    countHeight = textHeight;
    ref1 = this.thirteen.log;
    for (i = j = 0, len = ref1.length; j < len; i = ++j) {
      line = ref1[i];
      this.fontRenderer.render(this.font, textHeight, line, 0, (i + 1) * (textHeight + textPadding), 0, 0, this.colors.white);
    }
    aiPlayers = [this.thirteen.players[1], this.thirteen.players[2], this.thirteen.players[3]];
    characterMargin = characterHeight / 2;
    if (aiPlayers[0] !== null) {
      character = aiCharacters[aiPlayers[0].charID];
      characterWidth = this.spriteRenderer.calcWidth(character.sprite, characterHeight);
      this.spriteRenderer.render(character.sprite, characterMargin, this.hand.playCeiling, 0, characterHeight, 0, 0, 1, this.colors.white);
      this.renderCount(aiPlayers[0], aiPlayers[0].index === this.thirteen.turn, countHeight, characterMargin + (characterWidth / 2), this.hand.playCeiling - textPadding, 0.5, 0);
    }
    if (aiPlayers[1] !== null) {
      character = aiCharacters[aiPlayers[1].charID];
      this.spriteRenderer.render(character.sprite, this.center.x, 0, 0, characterHeight, 0, 0.5, 0, this.colors.white);
      this.renderCount(aiPlayers[1], aiPlayers[1].index === this.thirteen.turn, countHeight, this.center.x, characterHeight, 0.5, 0);
    }
    if (aiPlayers[2] !== null) {
      character = aiCharacters[aiPlayers[2].charID];
      characterWidth = this.spriteRenderer.calcWidth(character.sprite, characterHeight);
      this.spriteRenderer.render(character.sprite, this.width - characterMargin, this.hand.playCeiling, 0, characterHeight, 0, 1, 1, this.colors.white);
      this.renderCount(aiPlayers[2], aiPlayers[2].index === this.thirteen.turn, countHeight, this.width - (characterMargin + (characterWidth / 2)), this.hand.playCeiling - textPadding, 0.5, 0);
    }
    this.pile.render();
    if (this.thirteen.winner() && this.pile.resting()) {
      lines = this.gameOverText();
      gameOverSize = this.aaHeight / 8;
      gameOverY = this.center.y;
      if (lines.length > 1) {
        gameOverY -= gameOverSize >> 1;
      }
      this.fontRenderer.render(this.font, gameOverSize, lines[0], this.center.x, gameOverY, 0.5, 0.5, this.colors.orange);
      if (lines.length > 1) {
        gameOverY += gameOverSize;
        this.fontRenderer.render(this.font, gameOverSize, lines[1], this.center.x, gameOverY, 0.5, 0.5, this.colors.orange);
      }
      restartQuitSize = this.aaHeight / 12;
      shadowDistance = restartQuitSize / 8;
      this.fontRenderer.render(this.font, restartQuitSize, "Play Again", shadowDistance + this.center.x / 2, shadowDistance + this.height - restartQuitSize, 0.5, 1, this.colors.black, (function(_this) {
        return function() {};
      })(this));
      this.fontRenderer.render(this.font, restartQuitSize, "Play Again", this.center.x / 2, this.height - restartQuitSize, 0.5, 1, this.colors.gold, (function(_this) {
        return function() {
          _this.thirteen.deal();
          return _this.prepareGame();
        };
      })(this));
    }
    this.hand.render();
    this.renderCount(this.thirteen.players[0], 0 === this.thirteen.turn, countHeight, this.center.x, this.height, 0.5, 1);
    this.fontRenderer.render(this.font, textHeight, this.calcHeadline(), 0, 0, 0, 0, this.colors.lightgray);
    this.spriteRenderer.render("pause", this.width, 0, 0, this.pauseButtonSize, 0, 1, 0, this.colors.white, (function(_this) {
      return function() {
        return _this.paused = true;
      };
    })(this));
    if (this.paused) {
      this.pauseMenu.render();
    }
  };

  Game.prototype.renderCount = function(player, myTurn, countHeight, x, y, anchorx, anchory) {
    var cardCount, countSize, countString, countY, nameColor, nameSize, nameString, nameY, trickColor;
    if (myTurn) {
      nameColor = "`ff7700`";
    } else {
      nameColor = "";
    }
    nameString = " " + nameColor + player.name + "`` ";
    cardCount = player.hand.length;
    if (cardCount > 1) {
      trickColor = "ffff33";
    } else {
      trickColor = "ff3333";
    }
    countString = "[ `" + trickColor + "`" + cardCount + "`` ]";
    nameSize = this.fontRenderer.size(this.font, countHeight, nameString);
    countSize = this.fontRenderer.size(this.font, countHeight, countString);
    if (nameSize.w > countSize.w) {
      countSize.w = nameSize.w;
    }
    nameY = y;
    countY = y;
    if (anchory > 0) {
      nameY -= countHeight;
    } else {
      countY += countHeight;
    }
    this.spriteRenderer.render("solid", x, y, countSize.w, countSize.h * 2, 0, anchorx, anchory, this.colors.overlay);
    this.fontRenderer.render(this.font, countHeight, nameString, x, nameY, anchorx, anchory, this.colors.white);
    return this.fontRenderer.render(this.font, countHeight, countString, x, countY, anchorx, anchory, this.colors.white);
  };

  Game.prototype.drawImage = function(texture, sx, sy, sw, sh, dx, dy, dw, dh, rot, anchorx, anchory, r, g, b, a, cb) {
    var anchorOffsetX, anchorOffsetY, zone;
    this.renderCommands.push(this.textures[texture], sx, sy, sw, sh, dx, dy, dw, dh, rot, anchorx, anchory, r, g, b, a);
    if (cb != null) {
      anchorOffsetX = -1 * anchorx * dw;
      anchorOffsetY = -1 * anchory * dh;
      zone = {
        cx: dx,
        cy: dy,
        rot: rot * -1,
        l: anchorOffsetX,
        t: anchorOffsetY,
        r: anchorOffsetX + dw,
        b: anchorOffsetY + dh,
        cb: cb
      };
      return this.zones.push(zone);
    }
  };

  Game.prototype.checkZones = function(x, y) {
    var j, localX, localY, ref1, unrotatedLocalX, unrotatedLocalY, zone;
    ref1 = this.zones;
    for (j = ref1.length - 1; j >= 0; j += -1) {
      zone = ref1[j];
      unrotatedLocalX = x - zone.cx;
      unrotatedLocalY = y - zone.cy;
      localX = unrotatedLocalX * Math.cos(zone.rot) - unrotatedLocalY * Math.sin(zone.rot);
      localY = unrotatedLocalX * Math.sin(zone.rot) + unrotatedLocalY * Math.cos(zone.rot);
      if ((localX < zone.l) || (localX > zone.r) || (localY < zone.t) || (localY > zone.b)) {
        continue;
      }
      zone.cb(x, y);
      return true;
    }
    return false;
  };

  return Game;

})();

module.exports = Game;


},{"./Animation":1,"./Button":2,"./FontRenderer":3,"./Hand":5,"./Menu":6,"./Pile":7,"./SpriteRenderer":8,"./Thirteen":9}],5:[function(require,module,exports){
var Animation, CARD_HAND_CURVE_DIST_FACTOR, CARD_HOLDING_ROT_ORDER, CARD_HOLDING_ROT_PLAY, CARD_IMAGE_ADV_X, CARD_IMAGE_ADV_Y, CARD_IMAGE_H, CARD_IMAGE_OFF_X, CARD_IMAGE_OFF_Y, CARD_IMAGE_W, CARD_PLAY_CEILING, CARD_RENDER_SCALE, Hand, NO_CARD, calcDistance, calcDistanceSquared, findAngle;

Animation = require('./Animation');

CARD_IMAGE_W = 120;

CARD_IMAGE_H = 162;

CARD_IMAGE_OFF_X = 4;

CARD_IMAGE_OFF_Y = 4;

CARD_IMAGE_ADV_X = CARD_IMAGE_W;

CARD_IMAGE_ADV_Y = CARD_IMAGE_H;

CARD_RENDER_SCALE = 0.35;

CARD_HAND_CURVE_DIST_FACTOR = 3.5;

CARD_HOLDING_ROT_ORDER = Math.PI / 12;

CARD_HOLDING_ROT_PLAY = -1 * Math.PI / 12;

CARD_PLAY_CEILING = 0.65;

NO_CARD = -1;

findAngle = function(p0, p1, p2) {
  var a, b, c;
  a = Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
  b = Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2);
  c = Math.pow(p2.x - p0.x, 2) + Math.pow(p2.y - p0.y, 2);
  return Math.acos((a + b - c) / Math.sqrt(4 * a * b));
};

calcDistance = function(p0, p1) {
  return Math.sqrt(Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2));
};

calcDistanceSquared = function(x0, y0, x1, y1) {
  return Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2);
};

Hand = (function() {
  function Hand(game) {
    var arcMargin, arcVerticalBias, bottomLeft, bottomRight;
    this.game = game;
    this.cards = [];
    this.anims = {};
    this.positionCache = {};
    this.dragIndexStart = NO_CARD;
    this.dragIndexCurrent = NO_CARD;
    this.dragX = 0;
    this.dragY = 0;
    this.cardSpeed = {
      r: Math.PI * 2,
      s: 2.5,
      t: 2 * this.game.width
    };
    this.playCeiling = CARD_PLAY_CEILING * this.game.height;
    this.cardHeight = Math.floor(this.game.height * CARD_RENDER_SCALE);
    this.cardWidth = Math.floor(this.cardHeight * CARD_IMAGE_W / CARD_IMAGE_H);
    this.cardHalfHeight = this.cardHeight >> 1;
    this.cardHalfWidth = this.cardWidth >> 1;
    arcMargin = this.cardWidth / 2;
    arcVerticalBias = this.cardHeight / 50;
    bottomLeft = {
      x: arcMargin,
      y: arcVerticalBias + this.game.height
    };
    bottomRight = {
      x: this.game.width - arcMargin,
      y: arcVerticalBias + this.game.height
    };
    this.handCenter = {
      x: this.game.width / 2,
      y: arcVerticalBias + this.game.height + (CARD_HAND_CURVE_DIST_FACTOR * this.game.height)
    };
    this.handAngle = findAngle(bottomLeft, this.handCenter, bottomRight);
    this.handDistance = calcDistance(bottomLeft, this.handCenter);
    this.handAngleAdvanceMax = this.handAngle / 7;
    this.game.log("Hand distance " + this.handDistance + ", angle " + this.handAngle + " (screen height " + this.game.height + ")");
  }

  Hand.prototype.set = function(cards) {
    this.cards = cards.slice(0);
    this.syncAnims();
    return this.warp();
  };

  Hand.prototype.syncAnims = function() {
    var anim, card, j, k, len, len1, ref, ref1, seen, toRemove;
    seen = {};
    ref = this.cards;
    for (j = 0, len = ref.length; j < len; j++) {
      card = ref[j];
      seen[card]++;
      if (!this.anims[card]) {
        this.anims[card] = new Animation({
          speed: this.cardSpeed,
          x: 0,
          y: 0,
          r: 0
        });
      }
    }
    toRemove = [];
    ref1 = this.anims;
    for (card in ref1) {
      anim = ref1[card];
      if (!seen.hasOwnProperty(card)) {
        toRemove.push(card);
      }
    }
    for (k = 0, len1 = toRemove.length; k < len1; k++) {
      card = toRemove[k];
      delete this.anims[card];
    }
    return this.updatePositions();
  };

  Hand.prototype.calcDrawnHand = function() {
    var card, drawnHand, i, j, len, ref;
    drawnHand = [];
    ref = this.cards;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      card = ref[i];
      if (i !== this.dragIndexStart) {
        drawnHand.push(card);
      }
    }
    if (this.dragIndexCurrent !== NO_CARD) {
      drawnHand.splice(this.dragIndexCurrent, 0, this.cards[this.dragIndexStart]);
    }
    return drawnHand;
  };

  Hand.prototype.wantsToPlayDraggedCard = function() {
    if (this.dragIndexStart === NO_CARD) {
      return false;
    }
    return this.dragY < this.playCeiling;
  };

  Hand.prototype.updatePositions = function() {
    var anim, card, desiredRotation, drawIndex, drawnHand, i, j, len, pos, positionCount, positions, results, wantsToPlay;
    drawnHand = this.calcDrawnHand();
    wantsToPlay = this.wantsToPlayDraggedCard();
    desiredRotation = CARD_HOLDING_ROT_ORDER;
    positionCount = drawnHand.length;
    if (wantsToPlay) {
      desiredRotation = CARD_HOLDING_ROT_PLAY;
      positionCount--;
    }
    positions = this.calcPositions(positionCount);
    drawIndex = 0;
    results = [];
    for (i = j = 0, len = drawnHand.length; j < len; i = ++j) {
      card = drawnHand[i];
      anim = this.anims[card];
      if (i === this.dragIndexCurrent) {
        anim.req.x = this.dragX;
        anim.req.y = this.dragY;
        anim.req.r = desiredRotation;
        if (!wantsToPlay) {
          results.push(drawIndex++);
        } else {
          results.push(void 0);
        }
      } else {
        pos = positions[drawIndex];
        anim.req.x = pos.x;
        anim.req.y = pos.y;
        anim.req.r = pos.r;
        results.push(drawIndex++);
      }
    }
    return results;
  };

  Hand.prototype.warp = function() {
    var anim, card, ref, results;
    ref = this.anims;
    results = [];
    for (card in ref) {
      anim = ref[card];
      results.push(anim.warp());
    }
    return results;
  };

  Hand.prototype.reorder = function() {
    var closestDist, closestIndex, dist, index, j, len, pos, positions;
    if (this.dragIndexStart === NO_CARD) {
      return;
    }
    if (this.cards.length < 2) {
      return;
    }
    positions = this.calcPositions(this.cards.length);
    closestIndex = 0;
    closestDist = this.game.width * this.game.height;
    for (index = j = 0, len = positions.length; j < len; index = ++j) {
      pos = positions[index];
      dist = calcDistanceSquared(pos.x, pos.y, this.dragX, this.dragY);
      if (closestDist > dist) {
        closestDist = dist;
        closestIndex = index;
      }
    }
    return this.dragIndexCurrent = closestIndex;
  };

  Hand.prototype.down = function(dragX, dragY, index) {
    this.dragX = dragX;
    this.dragY = dragY;
    this.up(this.dragX, this.dragY);
    this.game.log("picking up card index " + index);
    this.dragIndexStart = index;
    this.dragIndexCurrent = index;
    return this.updatePositions();
  };

  Hand.prototype.move = function(dragX, dragY) {
    this.dragX = dragX;
    this.dragY = dragY;
    if (this.dragIndexStart === NO_CARD) {
      return;
    }
    this.reorder();
    return this.updatePositions();
  };

  Hand.prototype.up = function(dragX, dragY) {
    var anim, card, cardIndex;
    this.dragX = dragX;
    this.dragY = dragY;
    if (this.dragIndexStart === NO_CARD) {
      return;
    }
    this.reorder();
    if (this.wantsToPlayDraggedCard()) {
      this.game.log("trying to play a " + this.cards[this.dragIndexStart] + " from index " + this.dragIndexStart);
      cardIndex = this.dragIndexStart;
      card = this.cards[cardIndex];
      anim = this.anims[card];
      this.dragIndexStart = NO_CARD;
      this.dragIndexCurrent = NO_CARD;
      this.game.play(card, anim.cur.x, anim.cur.y, anim.cur.r, cardIndex);
    } else {
      this.game.log("trying to reorder " + this.cards[this.dragIndexStart] + " into index " + this.dragIndexCurrent);
      this.cards = this.calcDrawnHand();
    }
    this.dragIndexStart = NO_CARD;
    this.dragIndexCurrent = NO_CARD;
    return this.updatePositions();
  };

  Hand.prototype.update = function(dt) {
    var anim, card, ref, updated;
    updated = false;
    ref = this.anims;
    for (card in ref) {
      anim = ref[card];
      if (anim.update(dt)) {
        updated = true;
      }
    }
    return updated;
  };

  Hand.prototype.render = function() {
    var anim, drawnHand, index, j, len, results, v;
    if (this.cards.length === 0) {
      return;
    }
    drawnHand = this.calcDrawnHand();
    results = [];
    for (index = j = 0, len = drawnHand.length; j < len; index = ++j) {
      v = drawnHand[index];
      if (v === NO_CARD) {
        continue;
      }
      anim = this.anims[v];
      results.push((function(_this) {
        return function(anim, index) {
          return _this.renderCard(v, anim.cur.x, anim.cur.y, anim.cur.r, 1, function(clickX, clickY) {
            return _this.down(clickX, clickY, index);
          });
        };
      })(this)(anim, index));
    }
    return results;
  };

  Hand.prototype.renderCard = function(v, x, y, rot, scale, cb) {
    var rank, suit;
    if (!rot) {
      rot = 0;
    }
    rank = Math.floor(v / 4);
    suit = Math.floor(v % 4);
    return this.game.drawImage("cards", CARD_IMAGE_OFF_X + (CARD_IMAGE_ADV_X * rank), CARD_IMAGE_OFF_Y + (CARD_IMAGE_ADV_Y * suit), CARD_IMAGE_W, CARD_IMAGE_H, x, y, this.cardWidth * scale, this.cardHeight * scale, rot, 0.5, 0.5, 1, 1, 1, 1, cb);
  };

  Hand.prototype.calcPositions = function(handSize) {
    var advance, angleLeftover, angleSpread, currentAngle, i, j, positions, ref, x, y;
    if (this.positionCache.hasOwnProperty(handSize)) {
      return this.positionCache[handSize];
    }
    if (handSize === 0) {
      return [];
    }
    advance = this.handAngle / handSize;
    if (advance > this.handAngleAdvanceMax) {
      advance = this.handAngleAdvanceMax;
    }
    angleSpread = advance * handSize;
    angleLeftover = this.handAngle - angleSpread;
    currentAngle = -1 * (this.handAngle / 2);
    currentAngle += angleLeftover / 2;
    currentAngle += advance / 2;
    positions = [];
    for (i = j = 0, ref = handSize; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      x = this.handCenter.x - Math.cos((Math.PI / 2) + currentAngle) * this.handDistance;
      y = this.handCenter.y - Math.sin((Math.PI / 2) + currentAngle) * this.handDistance;
      currentAngle += advance;
      positions.push({
        x: x,
        y: y,
        r: currentAngle - advance
      });
    }
    this.positionCache[handSize] = positions;
    return positions;
  };

  Hand.prototype.renderHand = function() {
    var index, j, len, ref, results, v;
    if (this.hand.length === 0) {
      return;
    }
    ref = this.hand;
    results = [];
    for (index = j = 0, len = ref.length; j < len; index = ++j) {
      v = ref[index];
      results.push((function(_this) {
        return function(index) {
          return _this.renderCard(v, x, y, currentAngle, 1, function(clickX, clickY) {
            return _this.down(clickX, clickY, index);
          });
        };
      })(this)(index));
    }
    return results;
  };

  return Hand;

})();

module.exports = Hand;


},{"./Animation":1}],6:[function(require,module,exports){
var Button, Menu;

Button = require('./Button');

Menu = (function() {
  function Menu(game, title, background, color, actions) {
    var action, button, buttonSize, currY, i, len, ref, slice;
    this.game = game;
    this.title = title;
    this.background = background;
    this.color = color;
    this.actions = actions;
    this.buttons = [];
    this.buttonNames = ["button0", "button1"];
    buttonSize = this.game.height / 15;
    this.buttonStartY = this.game.height / 5;
    slice = (this.game.height - this.buttonStartY) / (this.actions.length + 1);
    currY = this.buttonStartY + slice;
    ref = this.actions;
    for (i = 0, len = ref.length; i < len; i++) {
      action = ref[i];
      button = new Button(this.game, this.buttonNames, this.game.font, buttonSize, this.game.center.x, currY, action);
      this.buttons.push(button);
      currY += slice;
    }
  }

  Menu.prototype.update = function(dt) {
    var button, i, len, ref, updated;
    updated = false;
    ref = this.buttons;
    for (i = 0, len = ref.length; i < len; i++) {
      button = ref[i];
      if (button.update(dt)) {
        updated = true;
      }
    }
    return updated;
  };

  Menu.prototype.render = function() {
    var button, i, len, ref, results, titleHeight, titleOffset;
    this.game.spriteRenderer.render(this.background, 0, 0, this.game.width, this.game.height, 0, 0, 0, this.color);
    this.game.fontRenderer.render(this.game.font, this.game.height / 25, "Build: " + this.game.version, 0, this.game.height, 0, 1, this.game.colors.lightgray);
    titleHeight = this.game.height / 8;
    titleOffset = this.buttonStartY >> 1;
    this.game.fontRenderer.render(this.game.font, titleHeight, this.title, this.game.center.x, titleOffset, 0.5, 0.5, this.game.colors.white);
    ref = this.buttons;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      button = ref[i];
      results.push(button.render());
    }
    return results;
  };

  return Menu;

})();

module.exports = Menu;


},{"./Button":2}],7:[function(require,module,exports){
var Animation, Pile, SETTLE_MS;

Animation = require('./Animation');

SETTLE_MS = 1000;

Pile = (function() {
  function Pile(game, hand) {
    var centerX, centerY, offsetX, offsetY;
    this.game = game;
    this.hand = hand;
    this.pile = [];
    this.pileWho = [];
    this.thrown = [];
    this.thrownWho = [];
    this.anims = {};
    this.pileID = -1;
    this.thrownTaker = "";
    this.settleTimer = 0;
    this.thrownColor = {
      r: 1,
      g: 1,
      b: 0,
      a: 1
    };
    this.scale = 0.6;
    centerX = this.game.center.x;
    centerY = this.game.center.y;
    offsetX = this.hand.cardWidth * this.scale;
    offsetY = this.hand.cardHalfHeight * this.scale;
    this.pileLocations = [
      {
        x: centerX,
        y: centerY + offsetY
      }, {
        x: centerX - offsetX,
        y: centerY
      }, {
        x: centerX,
        y: centerY - offsetY
      }, {
        x: centerX + offsetX,
        y: centerY
      }
    ];
    this.throwLocations = [
      {
        x: centerX,
        y: this.game.height
      }, {
        x: 0,
        y: centerY + offsetY
      }, {
        x: centerX,
        y: 0
      }, {
        x: this.game.width,
        y: centerY + offsetY
      }
    ];
  }

  Pile.prototype.set = function(pileID, pile, pileWho, thrown, thrownWho) {};

  Pile.prototype.hint = function(v, x, y, r) {};

  Pile.prototype.syncAnims = function() {
    var anim, card, index, j, k, l, len, len1, len2, location, locations, ref, ref1, ref2, seen, toRemove, who;
    seen = {};
    locations = this.throwLocations;
    ref = this.pile;
    for (index = j = 0, len = ref.length; j < len; index = ++j) {
      card = ref[index];
      seen[card]++;
      if (!this.anims[card]) {
        who = this.pileWho[index];
        location = locations[who];
        this.anims[card] = new Animation({
          speed: this.hand.cardSpeed,
          x: location.x,
          y: location.y,
          r: -1 * Math.PI / 4,
          s: this.scale
        });
      }
    }
    ref1 = this.thrown;
    for (k = 0, len1 = ref1.length; k < len1; k++) {
      card = ref1[k];
      seen[card]++;
      if (!this.anims[card]) {
        this.anims[card] = new Animation({
          speed: this.hand.cardSpeed,
          x: -1 * this.hand.cardHalfWidth,
          y: -1 * this.hand.cardHalfWidth,
          r: -1 * Math.PI / 2,
          s: 1
        });
      }
    }
    toRemove = [];
    ref2 = this.anims;
    for (card in ref2) {
      anim = ref2[card];
      if (!seen.hasOwnProperty(card)) {
        toRemove.push(card);
      }
    }
    for (l = 0, len2 = toRemove.length; l < len2; l++) {
      card = toRemove[l];
      delete this.anims[card];
    }
    return this.updatePositions();
  };

  Pile.prototype.updatePositions = function() {
    var _, anim, i, index, j, k, len, len1, loc, locations, ref, ref1, results, v;
    locations = this.pileLocations;
    ref = this.pile;
    for (index = j = 0, len = ref.length; j < len; index = ++j) {
      v = ref[index];
      anim = this.anims[v];
      loc = this.pileWho[index];
      anim.req.x = locations[loc].x;
      anim.req.y = locations[loc].y;
      anim.req.r = 0;
      anim.req.s = this.scale;
    }
    ref1 = this.thrown;
    results = [];
    for (index = k = 0, len1 = ref1.length; k < len1; index = ++k) {
      _ = ref1[index];
      i = this.thrown.length - index - 1;
      v = this.thrown[i];
      anim = this.anims[v];
      anim.req.x = (this.game.width + this.hand.cardHalfWidth) - ((index + 1) * (this.hand.cardWidth / 5));
      anim.req.y = (this.game.pauseButtonSize * 1.5) + this.hand.cardHalfHeight;
      anim.req.r = 0;
      results.push(anim.req.s = 1);
    }
    return results;
  };

  Pile.prototype.readyForNextTrick = function() {
    return this.settleTimer === 0;
  };

  Pile.prototype.update = function(dt) {
    var anim, card, ref, updated;
    updated = false;
    if (this.settleTimer > 0) {
      updated = true;
      this.settleTimer -= dt;
      if (this.settleTimer < 0) {
        this.settleTimer = 0;
      }
    }
    ref = this.anims;
    for (card in ref) {
      anim = ref[card];
      if (anim.update(dt)) {
        updated = true;
      }
    }
    return updated;
  };

  Pile.prototype.resting = function() {
    return true;
  };

  Pile.prototype.render = function() {};

  return Pile;

})();

module.exports = Pile;


},{"./Animation":1}],8:[function(require,module,exports){
var SpriteRenderer;

SpriteRenderer = (function() {
  function SpriteRenderer(game) {
    this.game = game;
    this.sprites = {
      solid: {
        texture: "chars",
        x: 55,
        y: 723,
        w: 10,
        h: 10
      },
      pause: {
        texture: "chars",
        x: 602,
        y: 707,
        w: 122,
        h: 125
      },
      button0: {
        texture: "chars",
        x: 140,
        y: 777,
        w: 422,
        h: 65
      },
      button1: {
        texture: "chars",
        x: 140,
        y: 698,
        w: 422,
        h: 65
      },
      plus0: {
        texture: "chars",
        x: 745,
        y: 664,
        w: 116,
        h: 118
      },
      plus1: {
        texture: "chars",
        x: 745,
        y: 820,
        w: 116,
        h: 118
      },
      minus0: {
        texture: "chars",
        x: 895,
        y: 664,
        w: 116,
        h: 118
      },
      minus1: {
        texture: "chars",
        x: 895,
        y: 820,
        w: 116,
        h: 118
      },
      arrowL: {
        texture: "chars",
        x: 33,
        y: 858,
        w: 204,
        h: 156
      },
      arrowR: {
        texture: "chars",
        x: 239,
        y: 852,
        w: 208,
        h: 155
      },
      mainmenu: {
        texture: "mainmenu",
        x: 0,
        y: 0,
        w: 1280,
        h: 720
      },
      pausemenu: {
        texture: "pausemenu",
        x: 0,
        y: 0,
        w: 1280,
        h: 720
      },
      howto1: {
        texture: "howto1",
        x: 0,
        y: 0,
        w: 1920,
        h: 1080
      },
      howto2: {
        texture: "howto2",
        x: 0,
        y: 0,
        w: 1920,
        h: 1080
      },
      howto3: {
        texture: "howto3",
        x: 0,
        y: 0,
        w: 1920,
        h: 1080
      },
      mario: {
        texture: "chars",
        x: 20,
        y: 0,
        w: 151,
        h: 308
      },
      luigi: {
        texture: "chars",
        x: 171,
        y: 0,
        w: 151,
        h: 308
      },
      peach: {
        texture: "chars",
        x: 335,
        y: 0,
        w: 164,
        h: 308
      },
      daisy: {
        texture: "chars",
        x: 504,
        y: 0,
        w: 164,
        h: 308
      },
      yoshi: {
        texture: "chars",
        x: 668,
        y: 0,
        w: 180,
        h: 308
      },
      toad: {
        texture: "chars",
        x: 849,
        y: 0,
        w: 157,
        h: 308
      },
      bowser: {
        texture: "chars",
        x: 11,
        y: 322,
        w: 151,
        h: 308
      },
      bowserjr: {
        texture: "chars",
        x: 225,
        y: 322,
        w: 144,
        h: 308
      },
      koopa: {
        texture: "chars",
        x: 372,
        y: 322,
        w: 128,
        h: 308
      },
      rosalina: {
        texture: "chars",
        x: 500,
        y: 322,
        w: 173,
        h: 308
      },
      shyguy: {
        texture: "chars",
        x: 691,
        y: 322,
        w: 154,
        h: 308
      },
      toadette: {
        texture: "chars",
        x: 847,
        y: 322,
        w: 158,
        h: 308
      }
    };
  }

  SpriteRenderer.prototype.calcWidth = function(spriteName, height) {
    var sprite;
    sprite = this.sprites[spriteName];
    if (!sprite) {
      return 1;
    }
    return height * sprite.w / sprite.h;
  };

  SpriteRenderer.prototype.render = function(spriteName, dx, dy, dw, dh, rot, anchorx, anchory, color, cb) {
    var sprite;
    sprite = this.sprites[spriteName];
    if (!sprite) {
      return;
    }
    if ((dw === 0) && (dh === 0)) {
      dw = sprite.x;
      dh = sprite.y;
    } else if (dw === 0) {
      dw = dh * sprite.w / sprite.h;
    } else if (dh === 0) {
      dh = dw * sprite.h / sprite.w;
    }
    this.game.drawImage(sprite.texture, sprite.x, sprite.y, sprite.w, sprite.h, dx, dy, dw, dh, rot, anchorx, anchory, color.r, color.g, color.b, color.a, cb);
  };

  return SpriteRenderer;

})();

module.exports = SpriteRenderer;


},{}],9:[function(require,module,exports){
var Card, MAX_LOG_LINES, MIN_PLAYERS, OK, ShortSuitName, ShuffledDeck, Suit, SuitName, Thirteen, aiCharacterList, aiCharacters, cardsToString, character, highestIndexInSuit, highestValueIndexInSuitLowerThan, highestValueNonSpadeIndex, l, len, lowestIndexInSuit, lowestValueIndex, randomCharacter, stringifyCards, valuesOfSuit;

MIN_PLAYERS = 3;

MAX_LOG_LINES = 7;

OK = 'OK';

Suit = {
  NONE: -1,
  SPADES: 0,
  CLUBS: 1,
  DIAMONDS: 2,
  HEARTS: 3
};

SuitName = ['Spades', 'Clubs', 'Diamonds', 'Hearts'];

ShortSuitName = ['S', 'C', 'D', 'H'];

aiCharacterList = [
  {
    id: "mario",
    name: "Mario",
    sprite: "mario",
    brain: "normal"
  }, {
    id: "luigi",
    name: "Luigi",
    sprite: "luigi",
    brain: "normal"
  }, {
    id: "peach",
    name: "Peach",
    sprite: "peach",
    brain: "normal"
  }, {
    id: "daisy",
    name: "Daisy",
    sprite: "daisy",
    brain: "normal"
  }, {
    id: "yoshi",
    name: "Yoshi",
    sprite: "yoshi",
    brain: "normal"
  }, {
    id: "toad",
    name: "Toad",
    sprite: "toad",
    brain: "normal"
  }, {
    id: "bowser",
    name: "Bowser",
    sprite: "bowser",
    brain: "normal"
  }, {
    id: "bowserjr",
    name: "Bowser Jr",
    sprite: "bowserjr",
    brain: "normal"
  }, {
    id: "koopa",
    name: "Koopa",
    sprite: "koopa",
    brain: "normal"
  }, {
    id: "rosalina",
    name: "Rosalina",
    sprite: "rosalina",
    brain: "normal"
  }, {
    id: "shyguy",
    name: "Shyguy",
    sprite: "shyguy",
    brain: "normal"
  }, {
    id: "toadette",
    name: "Toadette",
    sprite: "toadette",
    brain: "normal"
  }
];

aiCharacters = {};

for (l = 0, len = aiCharacterList.length; l < len; l++) {
  character = aiCharacterList[l];
  aiCharacters[character.id] = character;
}

randomCharacter = function() {
  var r;
  r = Math.floor(Math.random() * aiCharacterList.length);
  return aiCharacterList[r];
};

Card = (function() {
  function Card(raw1) {
    this.raw = raw1;
    this.suit = Math.floor(this.raw % 4);
    this.value = Math.floor(this.raw / 4);
    this.valueName = (function() {
      switch (this.value) {
        case 8:
          return 'J';
        case 9:
          return 'Q';
        case 10:
          return 'K';
        case 11:
          return 'A';
        case 12:
          return '2';
        default:
          return String(this.value + 3);
      }
    }).call(this);
    this.name = this.valueName + ShortSuitName[this.suit];
  }

  return Card;

})();

cardsToString = function(rawCards) {
  var card, cardNames, len1, m, raw;
  cardNames = [];
  for (m = 0, len1 = rawCards.length; m < len1; m++) {
    raw = rawCards[m];
    card = new Card(raw);
    cardNames.push(card.name);
  }
  return "[ " + cardNames.join(',') + " ]";
};

ShuffledDeck = (function() {
  function ShuffledDeck() {
    var i, j, m;
    this.cards = [0];
    for (i = m = 1; m < 52; i = ++m) {
      j = Math.floor(Math.random() * i);
      this.cards.push(this.cards[j]);
      this.cards[j] = i;
    }
  }

  return ShuffledDeck;

})();

Thirteen = (function() {
  function Thirteen(game, params) {
    var i, k, m, ref, v;
    this.game = game;
    if (!params) {
      return;
    }
    if (params.state) {
      ref = params.state;
      for (k in ref) {
        v = ref[k];
        if (params.state.hasOwnProperty(k)) {
          this[k] = params.state[k];
        }
      }
    } else {
      this.log = [];
      this.players = [
        {
          id: 1,
          name: 'Player',
          index: 0
        }
      ];
      for (i = m = 1; m < 4; i = ++m) {
        this.addAI();
      }
      this.deal();
    }
  }

  Thirteen.prototype.deal = function(params) {
    var deck, i, j, len1, m, n, player, ref;
    deck = new ShuffledDeck();
    ref = this.players;
    for (i = m = 0, len1 = ref.length; m < len1; i = ++m) {
      player = ref[i];
      this.game.log("dealing 13 cards to player " + i);
      player.hand = [];
      for (j = n = 0; n < 13; j = ++n) {
        player.hand.push(deck.cards.shift());
      }
      console.log("@game.options.sortIndex " + this.game.options.sortIndex);
      if (this.game.options.sortIndex === 0) {
        player.hand.sort(function(a, b) {
          return a - b;
        });
      } else {
        player.hand.sort(function(a, b) {
          return b - a;
        });
      }
    }
    this.turn = 0;
    this.pile = [];
    this.pileWho = -1;
    this.throwID = 0;
    this.output('Hand dealt, ' + this.players[this.turn].name + ' plays first');
    return OK;
  };

  Thirteen.prototype.save = function() {
    var len1, m, name, names, state;
    names = "log players turn pile pileWho throwID".split(" ");
    state = {};
    for (m = 0, len1 = names.length; m < len1; m++) {
      name = names[m];
      state[name] = this[name];
    }
    return state;
  };

  Thirteen.prototype.output = function(text) {
    this.log.push(text);
    if (this.log.length > MAX_LOG_LINES) {
      return this.log.shift();
    }
  };

  Thirteen.prototype.findPlayer = function(id) {
    var len1, m, player, ref;
    ref = this.players;
    for (m = 0, len1 = ref.length; m < len1; m++) {
      player = ref[m];
      if (player.id === id) {
        return player;
      }
    }
    return void 0;
  };

  Thirteen.prototype.currentPlayer = function() {
    return this.players[this.turn];
  };

  Thirteen.prototype.playerAfter = function(index) {
    return (index + 1) % this.players.length;
  };

  Thirteen.prototype.addPlayer = function(player) {
    if (!player.ai) {
      player.ai = false;
    }
    this.players.push(player);
    player.index = this.players.length - 1;
    return this.output(player.name + " joins the game");
  };

  Thirteen.prototype.namePresent = function(name) {
    var len1, m, player, ref;
    ref = this.players;
    for (m = 0, len1 = ref.length; m < len1; m++) {
      player = ref[m];
      if (player.name === name) {
        return true;
      }
    }
    return false;
  };

  Thirteen.prototype.addAI = function() {
    var ai;
    while (true) {
      character = randomCharacter();
      if (!this.namePresent(character.name)) {
        break;
      }
    }
    ai = {
      charID: character.id,
      name: character.name,
      id: 'ai' + String(this.players.length),
      ai: true
    };
    this.addPlayer(ai);
    this.game.log("added AI player");
    return OK;
  };

  Thirteen.prototype.winner = function() {
    var i, len1, m, player, ref;
    ref = this.players;
    for (i = m = 0, len1 = ref.length; m < len1; i = ++m) {
      player = ref[i];
      if (player.hand.length === 0) {
        return player;
      }
    }
    return null;
  };

  Thirteen.prototype.hasCard = function(hand, rawCard) {
    var len1, m, raw;
    for (m = 0, len1 = hand.length; m < len1; m++) {
      raw = hand[m];
      if (raw === rawCard) {
        return true;
      }
    }
    return false;
  };

  Thirteen.prototype.hasCards = function(hand, rawCards) {
    var len1, m, raw;
    for (m = 0, len1 = rawCards.length; m < len1; m++) {
      raw = rawCards[m];
      if (!this.hasCard(hand, raw)) {
        return false;
      }
    }
    return true;
  };

  Thirteen.prototype.removeCards = function(hand, rawCards) {
    var card, keepMe, len1, len2, m, n, newHand, raw;
    newHand = [];
    for (m = 0, len1 = hand.length; m < len1; m++) {
      card = hand[m];
      keepMe = true;
      for (n = 0, len2 = rawCards.length; n < len2; n++) {
        raw = rawCards[n];
        if (card === raw) {
          keepMe = false;
          break;
        }
      }
      if (keepMe) {
        newHand.push(card);
      }
    }
    return newHand;
  };

  Thirteen.prototype.canPass = function(params) {
    var currentPlayer;
    if (this.winner() !== null) {
      return 'gameOver';
    }
    currentPlayer = this.currentPlayer();
    if (params.id !== currentPlayer.id) {
      return 'notYourTurn';
    }
    return OK;
  };

  Thirteen.prototype.canPlay = function(params) {
    var ret;
    ret = this.canPass(params);
    if (ret !== OK) {
      return ret;
    }
    return OK;
  };

  Thirteen.prototype.play = function(params) {
    var currentPlayer, ret;
    console.log("someone calling play", params);
    ret = this.canPlay(params);
    if (ret !== OK) {
      return ret;
    }
    this.throwID += 1;
    currentPlayer = this.currentPlayer();
    currentPlayer.hand = this.removeCards(currentPlayer.hand, params.cards);
    this.output(currentPlayer.name + " throws " + (cardsToString(params.cards)));
    if (currentPlayer.hand.length === 0) {
      this.output(currentPlayer.name + " wins!");
    }
    this.pile = params.cards.slice(0);
    this.pileWho = this.turn;
    this.turn = this.playerAfter(this.turn);
    return OK;
  };

  Thirteen.prototype.pass = function(params) {
    var currentPlayer, ret;
    ret = this.canPass(params);
    if (ret !== OK) {
      return ret;
    }
    currentPlayer = this.currentPlayer();
    this.output(currentPlayer.name + " passes");
    this.turn = this.playerAfter(this.turn);
    return OK;
  };

  Thirteen.prototype.aiPlay = function(currentPlayer, cards) {
    return this.play({
      'id': currentPlayer.id,
      'cards': cards
    });
  };

  Thirteen.prototype.aiPass = function(currentPlayer) {
    return this.pass({
      'id': currentPlayer.id
    });
  };

  Thirteen.prototype.aiLog = function(text) {
    var currentPlayer;
    currentPlayer = this.currentPlayer();
    if (!currentPlayer.ai) {
      return false;
    }
    character = aiCharacters[currentPlayer.charID];
    return this.game.log('AI[' + currentPlayer.name + ' ' + character.brain + ']: hand:' + stringifyCards(currentPlayer.hand) + ' pile:' + stringifyCards(this.pile) + ' ' + text);
  };

  Thirteen.prototype.aiTick = function() {
    var currentPlayer, playedCard;
    if (this.winner() !== null) {
      return false;
    }
    currentPlayer = this.currentPlayer();
    if (!currentPlayer.ai) {
      return false;
    }
    this.aiLog("about to call brain.play");
    character = aiCharacters[currentPlayer.charID];
    playedCard = this.brains[character.brain].play.apply(this, [currentPlayer]);
    if (playedCard) {
      return true;
    } else {
      this.aiLog('brain failed to play: passing');
      return this.aiPass(currentPlayer);
    }
    return false;
  };

  Thirteen.prototype.brains = {
    normal: {
      id: "normal",
      name: "Normal",
      play: function(currentPlayer) {
        this.aiPlay(currentPlayer, [currentPlayer.hand[0]]);
        return true;
      }
    },
    chaos: {
      id: "chaos",
      name: "Chaos",
      bid: function(currentPlayer) {
        return Math.floor(Math.random() * currentPlayer.hand.length * 0.5);
      },
      play: function(currentPlayer) {
        var canPlayCard, i, legalIndices, len1, m, randomIndex, ref, v;
        legalIndices = [];
        ref = currentPlayer.hand;
        for (i = m = 0, len1 = ref.length; m < len1; i = ++m) {
          v = ref[i];
          canPlayCard = this.canPlay({
            id: currentPlayer.id,
            index: i
          });
          if (canPlayCard === OK) {
            legalIndices.push(i);
          }
        }
        randomIndex = Math.floor(Math.random() * legalIndices.length);
        this.aiLog("legal indices: " + (JSON.stringify(legalIndices)) + ", choosing index " + legalIndices[randomIndex]);
        return this.aiPlay(currentPlayer, legalIndices[randomIndex]);
      }
    },
    conservativeMoron: {
      id: "conservativeMoron",
      name: "Conservative Moron",
      bid: function(currentPlayer) {
        var bid, card, len1, m, ref, v;
        bid = 0;
        ref = currentPlayer.hand;
        for (m = 0, len1 = ref.length; m < len1; m++) {
          v = ref[m];
          card = new Card(v);
          if (card.suit === Suit.SPADES) {
            bid++;
          }
        }
        this.aiLog("I am a moron and I have " + bid + " spades. Let's roll with it.");
        return bid;
      },
      play: function(currentPlayer) {
        this.aiLog("playing lowest possible card");
        return this.aiPlayLow(currentPlayer, 0);
      }
    },
    aggressiveMoron: {
      id: "aggressiveMoron",
      name: "Aggressive Moron",
      bid: function(currentPlayer) {
        var bid, card, len1, m, ref, v;
        bid = 0;
        ref = currentPlayer.hand;
        for (m = 0, len1 = ref.length; m < len1; m++) {
          v = ref[m];
          card = new Card(v);
          if ((card.suit === Suit.SPADES) || (card.value === 12)) {
            bid++;
          }
        }
        this.aiLog("I am a moron and I have " + bid + " spades and/or aces. Fart.");
        return bid;
      },
      play: function(currentPlayer) {
        this.aiLog("playing highest possible card");
        return this.aiPlayHigh(currentPlayer, currentPlayer.hand.length - 1);
      }
    }
  };

  return Thirteen;

})();

valuesOfSuit = function(hand, suit) {
  var card, len1, m, v, values;
  values = [];
  for (m = 0, len1 = hand.length; m < len1; m++) {
    v = hand[m];
    card = new Card(v);
    if (card.suit === suit) {
      values.push(card.value);
    }
  }
  return values;
};

stringifyCards = function(cards) {
  var card, len1, m, t, v;
  t = '';
  for (m = 0, len1 = cards.length; m < len1; m++) {
    v = cards[m];
    card = new Card(v);
    if (t) {
      t += ',';
    }
    t += card.name;
  }
  return '[' + t + ']';
};

lowestIndexInSuit = function(hand, suit) {
  var card, i, len1, m, v;
  for (i = m = 0, len1 = hand.length; m < len1; i = ++m) {
    v = hand[i];
    card = new Card(v);
    if (card.suit === suit) {
      return i;
    }
  }
  return -1;
};

highestIndexInSuit = function(hand, suit) {
  var card, i, m, v;
  for (i = m = hand.length - 1; m >= 0; i = m += -1) {
    v = hand[i];
    card = new Card(v);
    if (card.suit === suit) {
      return i;
    }
  }
  return -1;
};

lowestValueIndex = function(hand, avoidSuit) {
  var card, i, lowestIndex, lowestValue, m, ref;
  card = new Card(hand[0]);
  lowestIndex = 0;
  lowestValue = card.value;
  for (i = m = 1, ref = hand.length; 1 <= ref ? m < ref : m > ref; i = 1 <= ref ? ++m : --m) {
    card = new Card(hand[i]);
    if (card.suit !== avoidSuit) {
      if (card.value < lowestValue) {
        lowestValue = card.value;
        lowestIndex = i;
      }
    }
  }
  return lowestIndex;
};

highestValueNonSpadeIndex = function(hand, avoidSuit) {
  var card, highestIndex, highestValue, i, m, ref;
  highestIndex = -1;
  highestValue = -1;
  for (i = m = ref = hand.length - 1; m >= 0; i = m += -1) {
    card = new Card(hand[i]);
    if ((card.suit !== avoidSuit) && (card.suit !== Suit.SPADES)) {
      if (card.value > highestValue) {
        highestValue = card.value;
        highestIndex = i;
      }
    }
  }
  return highestIndex;
};

highestValueIndexInSuitLowerThan = function(hand, winningCard) {
  var card, i, m, ref;
  for (i = m = ref = hand.length - 1; m >= 0; i = m += -1) {
    card = new Card(hand[i]);
    if ((card.suit === winningCard.suit) && (card.value < winningCard.value)) {
      return i;
    }
  }
  return -1;
};

module.exports = {
  Card: Card,
  Thirteen: Thirteen,
  OK: OK,
  aiCharacters: aiCharacters
};


},{}],10:[function(require,module,exports){
module.exports = {
  darkforest: {
    height: 72,
    glyphs: {
      '97': {
        x: 8,
        y: 8,
        width: 34,
        height: 42,
        xoffset: 1,
        yoffset: 31,
        xadvance: 34
      },
      '98': {
        x: 8,
        y: 58,
        width: 35,
        height: 52,
        xoffset: 1,
        yoffset: 20,
        xadvance: 34
      },
      '99': {
        x: 50,
        y: 8,
        width: 35,
        height: 42,
        xoffset: 1,
        yoffset: 31,
        xadvance: 34
      },
      '100': {
        x: 8,
        y: 118,
        width: 35,
        height: 52,
        xoffset: 1,
        yoffset: 20,
        xadvance: 34
      },
      '101': {
        x: 8,
        y: 178,
        width: 35,
        height: 42,
        xoffset: 1,
        yoffset: 31,
        xadvance: 34
      },
      '102': {
        x: 8,
        y: 228,
        width: 35,
        height: 42,
        xoffset: 1,
        yoffset: 31,
        xadvance: 33
      },
      '103': {
        x: 8,
        y: 278,
        width: 36,
        height: 42,
        xoffset: 1,
        yoffset: 31,
        xadvance: 35
      },
      '104': {
        x: 8,
        y: 328,
        width: 35,
        height: 42,
        xoffset: 1,
        yoffset: 31,
        xadvance: 34
      },
      '105': {
        x: 8,
        y: 378,
        width: 12,
        height: 42,
        xoffset: 1,
        yoffset: 31,
        xadvance: 11
      },
      '106': {
        x: 8,
        y: 428,
        width: 35,
        height: 41,
        xoffset: 2,
        yoffset: 31,
        xadvance: 34
      },
      '107': {
        x: 28,
        y: 378,
        width: 35,
        height: 41,
        xoffset: 1,
        yoffset: 31,
        xadvance: 34
      },
      '108': {
        x: 51,
        y: 328,
        width: 34,
        height: 41,
        xoffset: 1,
        yoffset: 31,
        xadvance: 33
      },
      '109': {
        x: 51,
        y: 427,
        width: 38,
        height: 42,
        xoffset: 1,
        yoffset: 31,
        xadvance: 37
      },
      '110': {
        x: 71,
        y: 377,
        width: 35,
        height: 42,
        xoffset: 1,
        yoffset: 31,
        xadvance: 34
      },
      '111': {
        x: 97,
        y: 427,
        width: 35,
        height: 41,
        xoffset: 1,
        yoffset: 31,
        xadvance: 34
      },
      '112': {
        x: 51,
        y: 58,
        width: 35,
        height: 42,
        xoffset: 1,
        yoffset: 31,
        xadvance: 34
      },
      '113': {
        x: 51,
        y: 108,
        width: 35,
        height: 45,
        xoffset: 1,
        yoffset: 31,
        xadvance: 34
      },
      '114': {
        x: 93,
        y: 8,
        width: 35,
        height: 42,
        xoffset: 1,
        yoffset: 31,
        xadvance: 35
      },
      '115': {
        x: 51,
        y: 161,
        width: 35,
        height: 42,
        xoffset: 2,
        yoffset: 31,
        xadvance: 35
      },
      '116': {
        x: 51,
        y: 211,
        width: 35,
        height: 42,
        xoffset: 1,
        yoffset: 31,
        xadvance: 33
      },
      '117': {
        x: 52,
        y: 261,
        width: 35,
        height: 42,
        xoffset: 1,
        yoffset: 31,
        xadvance: 34
      },
      '118': {
        x: 93,
        y: 311,
        width: 34,
        height: 41,
        xoffset: 1,
        yoffset: 31,
        xadvance: 32
      },
      '119': {
        x: 114,
        y: 360,
        width: 38,
        height: 42,
        xoffset: 1,
        yoffset: 31,
        xadvance: 38
      },
      '120': {
        x: 140,
        y: 410,
        width: 36,
        height: 41,
        xoffset: 1,
        yoffset: 31,
        xadvance: 37
      },
      '121': {
        x: 140,
        y: 459,
        width: 35,
        height: 41,
        xoffset: 1,
        yoffset: 31,
        xadvance: 34
      },
      '122': {
        x: 183,
        y: 459,
        width: 36,
        height: 42,
        xoffset: 2,
        yoffset: 31,
        xadvance: 35
      },
      '65': {
        x: 94,
        y: 58,
        width: 34,
        height: 53,
        xoffset: 2,
        yoffset: 20,
        xadvance: 36
      },
      '66': {
        x: 94,
        y: 119,
        width: 35,
        height: 53,
        xoffset: 3,
        yoffset: 20,
        xadvance: 37
      },
      '67': {
        x: 94,
        y: 180,
        width: 35,
        height: 53,
        xoffset: 2,
        yoffset: 20,
        xadvance: 36
      },
      '68': {
        x: 95,
        y: 241,
        width: 35,
        height: 53,
        xoffset: 3,
        yoffset: 20,
        xadvance: 37
      },
      '69': {
        x: 136,
        y: 8,
        width: 35,
        height: 53,
        xoffset: 2,
        yoffset: 20,
        xadvance: 36
      },
      '70': {
        x: 137,
        y: 69,
        width: 35,
        height: 53,
        xoffset: 2,
        yoffset: 20,
        xadvance: 34
      },
      '71': {
        x: 179,
        y: 8,
        width: 35,
        height: 53,
        xoffset: 2,
        yoffset: 20,
        xadvance: 36
      },
      '72': {
        x: 137,
        y: 130,
        width: 35,
        height: 53,
        xoffset: 2,
        yoffset: 20,
        xadvance: 36
      },
      '73': {
        x: 138,
        y: 191,
        width: 12,
        height: 53,
        xoffset: 2,
        yoffset: 20,
        xadvance: 13
      },
      '74': {
        x: 138,
        y: 252,
        width: 35,
        height: 53,
        xoffset: 2,
        yoffset: 20,
        xadvance: 36
      },
      '75': {
        x: 158,
        y: 191,
        width: 35,
        height: 52,
        xoffset: 2,
        yoffset: 20,
        xadvance: 36
      },
      '76': {
        x: 160,
        y: 313,
        width: 35,
        height: 53,
        xoffset: 2,
        yoffset: 20,
        xadvance: 34
      },
      '77': {
        x: 181,
        y: 251,
        width: 38,
        height: 53,
        xoffset: 2,
        yoffset: 20,
        xadvance: 39
      },
      '78': {
        x: 184,
        y: 374,
        width: 35,
        height: 53,
        xoffset: 2,
        yoffset: 20,
        xadvance: 35
      },
      '79': {
        x: 203,
        y: 312,
        width: 35,
        height: 53,
        xoffset: 2,
        yoffset: 20,
        xadvance: 35
      },
      '80': {
        x: 180,
        y: 69,
        width: 35,
        height: 53,
        xoffset: 2,
        yoffset: 20,
        xadvance: 34
      },
      '81': {
        x: 201,
        y: 130,
        width: 35,
        height: 56,
        xoffset: 2,
        yoffset: 20,
        xadvance: 35
      },
      '82': {
        x: 222,
        y: 8,
        width: 35,
        height: 53,
        xoffset: 2,
        yoffset: 20,
        xadvance: 36
      },
      '83': {
        x: 223,
        y: 69,
        width: 35,
        height: 53,
        xoffset: 2,
        yoffset: 20,
        xadvance: 35
      },
      '84': {
        x: 265,
        y: 8,
        width: 35,
        height: 53,
        xoffset: 1,
        yoffset: 20,
        xadvance: 33
      },
      '85': {
        x: 227,
        y: 194,
        width: 35,
        height: 53,
        xoffset: 2,
        yoffset: 20,
        xadvance: 35
      },
      '86': {
        x: 244,
        y: 130,
        width: 41,
        height: 52,
        xoffset: 1,
        yoffset: 19,
        xadvance: 39
      },
      '87': {
        x: 266,
        y: 69,
        width: 38,
        height: 53,
        xoffset: 2,
        yoffset: 20,
        xadvance: 37
      },
      '88': {
        x: 308,
        y: 8,
        width: 35,
        height: 52,
        xoffset: 1,
        yoffset: 19,
        xadvance: 35
      },
      '89': {
        x: 227,
        y: 373,
        width: 35,
        height: 52,
        xoffset: 1,
        yoffset: 19,
        xadvance: 34
      },
      '90': {
        x: 227,
        y: 433,
        width: 35,
        height: 53,
        xoffset: 2,
        yoffset: 20,
        xadvance: 35
      },
      '33': {
        x: 246,
        y: 255,
        width: 14,
        height: 53,
        xoffset: 0,
        yoffset: 20,
        xadvance: 11
      },
      '59': {
        x: 180,
        y: 130,
        width: 13,
        height: 37,
        xoffset: 0,
        yoffset: 56,
        xadvance: 13
      },
      '37': {
        x: 95,
        y: 302,
        width: 0,
        height: 0,
        xoffset: 0,
        yoffset: 70,
        xadvance: 22
      },
      '58': {
        x: 160,
        y: 374,
        width: 13,
        height: 23,
        xoffset: 0,
        yoffset: 50,
        xadvance: 13
      },
      '63': {
        x: 268,
        y: 255,
        width: 35,
        height: 53,
        xoffset: 0,
        yoffset: 20,
        xadvance: 33
      },
      '42': {
        x: 103,
        y: 302,
        width: 0,
        height: 0,
        xoffset: 0,
        yoffset: 70,
        xadvance: 22
      },
      '40': {
        x: 270,
        y: 190,
        width: 23,
        height: 52,
        xoffset: 0,
        yoffset: 20,
        xadvance: 21
      },
      '41': {
        x: 293,
        y: 130,
        width: 23,
        height: 52,
        xoffset: 1,
        yoffset: 20,
        xadvance: 21
      },
      '95': {
        x: 111,
        y: 302,
        width: 0,
        height: 0,
        xoffset: 0,
        yoffset: 70,
        xadvance: 22
      },
      '43': {
        x: 246,
        y: 316,
        width: 35,
        height: 34,
        xoffset: 0,
        yoffset: 39,
        xadvance: 32
      },
      '45': {
        x: 184,
        y: 435,
        width: 26,
        height: 11,
        xoffset: 1,
        yoffset: 44,
        xadvance: 25
      },
      '61': {
        x: 312,
        y: 68,
        width: 35,
        height: 30,
        xoffset: 1,
        yoffset: 42,
        xadvance: 33
      },
      '46': {
        x: 135,
        y: 313,
        width: 14,
        height: 11,
        xoffset: 0,
        yoffset: 61,
        xadvance: 14
      },
      '44': {
        x: 227,
        y: 255,
        width: 10,
        height: 21,
        xoffset: 0,
        yoffset: 68,
        xadvance: 11
      },
      '47': {
        x: 351,
        y: 8,
        width: 28,
        height: 52,
        xoffset: 0,
        yoffset: 19,
        xadvance: 26
      },
      '124': {
        x: 119,
        y: 302,
        width: 0,
        height: 0,
        xoffset: 0,
        yoffset: 70,
        xadvance: 22
      },
      '34': {
        x: 127,
        y: 302,
        width: 0,
        height: 0,
        xoffset: 0,
        yoffset: 70,
        xadvance: 22
      },
      '39': {
        x: 201,
        y: 194,
        width: 18,
        height: 19,
        xoffset: 0,
        yoffset: 0,
        xadvance: 21
      },
      '64': {
        x: 218,
        y: 435,
        width: 0,
        height: 0,
        xoffset: 0,
        yoffset: 70,
        xadvance: 22
      },
      '35': {
        x: 218,
        y: 443,
        width: 0,
        height: 0,
        xoffset: 0,
        yoffset: 70,
        xadvance: 22
      },
      '36': {
        x: 301,
        y: 190,
        width: 32,
        height: 53,
        xoffset: 0,
        yoffset: 22,
        xadvance: 29
      },
      '94': {
        x: 218,
        y: 451,
        width: 0,
        height: 0,
        xoffset: 0,
        yoffset: 70,
        xadvance: 22
      },
      '38': {
        x: 246,
        y: 358,
        width: 0,
        height: 0,
        xoffset: 0,
        yoffset: 70,
        xadvance: 22
      },
      '123': {
        x: 324,
        y: 106,
        width: 27,
        height: 52,
        xoffset: 0,
        yoffset: 20,
        xadvance: 26
      },
      '125': {
        x: 270,
        y: 358,
        width: 27,
        height: 52,
        xoffset: 2,
        yoffset: 20,
        xadvance: 27
      },
      '91': {
        x: 270,
        y: 418,
        width: 22,
        height: 53,
        xoffset: 0,
        yoffset: 20,
        xadvance: 21
      },
      '93': {
        x: 300,
        y: 418,
        width: 22,
        height: 53,
        xoffset: 1,
        yoffset: 20,
        xadvance: 20
      },
      '48': {
        x: 305,
        y: 316,
        width: 35,
        height: 53,
        xoffset: 2,
        yoffset: 20,
        xadvance: 36
      },
      '49': {
        x: 311,
        y: 251,
        width: 34,
        height: 53,
        xoffset: 2,
        yoffset: 20,
        xadvance: 35
      },
      '50': {
        x: 341,
        y: 166,
        width: 35,
        height: 53,
        xoffset: 3,
        yoffset: 20,
        xadvance: 37
      },
      '51': {
        x: 359,
        y: 68,
        width: 35,
        height: 53,
        xoffset: 3,
        yoffset: 20,
        xadvance: 36
      },
      '52': {
        x: 330,
        y: 377,
        width: 35,
        height: 53,
        xoffset: 1,
        yoffset: 20,
        xadvance: 35
      },
      '53': {
        x: 348,
        y: 312,
        width: 35,
        height: 53,
        xoffset: 3,
        yoffset: 20,
        xadvance: 37
      },
      '54': {
        x: 330,
        y: 438,
        width: 35,
        height: 53,
        xoffset: 2,
        yoffset: 20,
        xadvance: 36
      },
      '55': {
        x: 353,
        y: 227,
        width: 35,
        height: 53,
        xoffset: 1,
        yoffset: 20,
        xadvance: 34
      },
      '56': {
        x: 384,
        y: 129,
        width: 35,
        height: 53,
        xoffset: 2,
        yoffset: 20,
        xadvance: 36
      },
      '57': {
        x: 402,
        y: 8,
        width: 35,
        height: 53,
        xoffset: 3,
        yoffset: 20,
        xadvance: 36
      },
      '32': {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        xoffset: 3,
        yoffset: 20,
        xadvance: 22
      }
    }
  }
};


},{}],11:[function(require,module,exports){
var Game, NativeApp, SAVE_TIMER_MS, app, componentToHex, resizeScreen, rgbToHex, screen;

console.log('web startup');

Game = require('./Game');

componentToHex = function(c) {
  var hex;
  hex = Math.floor(c * 255).toString(16);
  if (hex.length === 1) {
    return "0" + hex;
  } else {
    return hex;
  }
};

rgbToHex = function(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
};

SAVE_TIMER_MS = 3000;

NativeApp = (function() {
  function NativeApp(screen1, width, height) {
    var imageUrl, img, j, len, loadedTextures, ref, state;
    this.screen = screen1;
    this.width = width;
    this.height = height;
    this.tintedTextureCache = [];
    this.lastTime = new Date().getTime();
    this.lastInteractTime = new Date().getTime();
    this.heardOneTouch = false;
    this.touchMouse = null;
    window.addEventListener('mousedown', this.onMouseDown.bind(this), false);
    window.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    window.addEventListener('mouseup', this.onMouseUp.bind(this), false);
    window.addEventListener('touchstart', this.onTouchStart.bind(this), false);
    window.addEventListener('touchmove', this.onTouchMove.bind(this), false);
    window.addEventListener('touchend', this.onTouchEnd.bind(this), false);
    this.context = this.screen.getContext("2d");
    this.textures = ["../images/cards.png", "../images/darkforest.png", "../images/chars.png", "../images/howto1.png", "../images/howto2.png", "../images/howto3.png"];
    this.game = new Game(this, this.width, this.height);
    if (typeof Storage !== "undefined") {
      state = localStorage.getItem("state");
      if (state) {
        this.game.load(state);
      }
    }
    this.pendingImages = 0;
    loadedTextures = [];
    ref = this.textures;
    for (j = 0, len = ref.length; j < len; j++) {
      imageUrl = ref[j];
      this.pendingImages++;
      console.log("loading image " + this.pendingImages + ": " + imageUrl);
      img = new Image();
      img.onload = this.onImageLoaded.bind(this);
      img.src = imageUrl;
      loadedTextures.push(img);
    }
    this.textures = loadedTextures;
    this.saveTimer = SAVE_TIMER_MS;
  }

  NativeApp.prototype.onImageLoaded = function(info) {
    this.pendingImages--;
    if (this.pendingImages === 0) {
      console.log('All images loaded. Beginning render loop.');
      return requestAnimationFrame((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    }
  };

  NativeApp.prototype.log = function(s) {
    return console.log("NativeApp.log(): " + s);
  };

  NativeApp.prototype.updateSave = function(dt) {
    var state;
    if (typeof Storage === "undefined") {
      return;
    }
    this.saveTimer -= dt;
    if (this.saveTimer <= 0) {
      this.saveTimer = SAVE_TIMER_MS;
      state = this.game.save();
      return localStorage.setItem("state", state);
    }
  };

  NativeApp.prototype.generateTintImage = function(textureIndex, red, green, blue) {
    var buff, ctx, fillColor, img, imgComp;
    img = this.textures[textureIndex];
    buff = document.createElement("canvas");
    buff.width = img.width;
    buff.height = img.height;
    ctx = buff.getContext("2d");
    ctx.globalCompositeOperation = 'copy';
    ctx.drawImage(img, 0, 0);
    fillColor = "rgb(" + (Math.floor(red * 255)) + ", " + (Math.floor(green * 255)) + ", " + (Math.floor(blue * 255)) + ")";
    ctx.fillStyle = fillColor;
    console.log("fillColor " + fillColor);
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillRect(0, 0, buff.width, buff.height);
    ctx.globalCompositeOperation = 'copy';
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(img, 0, 0);
    imgComp = new Image();
    imgComp.src = buff.toDataURL();
    return imgComp;
  };

  NativeApp.prototype.drawImage = function(textureIndex, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH, rot, anchorX, anchorY, r, g, b, a) {
    var anchorOffsetX, anchorOffsetY, texture, tintedTexture, tintedTextureKey;
    texture = this.textures[textureIndex];
    if ((r !== 1) || (g !== 1) || (b !== 1)) {
      tintedTextureKey = textureIndex + "-" + r + "-" + g + "-" + b;
      tintedTexture = this.tintedTextureCache[tintedTextureKey];
      if (!tintedTexture) {
        tintedTexture = this.generateTintImage(textureIndex, r, g, b);
        this.tintedTextureCache[tintedTextureKey] = tintedTexture;
      }
      texture = tintedTexture;
    }
    this.context.save();
    this.context.translate(dstX, dstY);
    this.context.rotate(rot);
    anchorOffsetX = -1 * anchorX * dstW;
    anchorOffsetY = -1 * anchorY * dstH;
    this.context.translate(anchorOffsetX, anchorOffsetY);
    this.context.globalAlpha = a;
    this.context.drawImage(texture, srcX, srcY, srcW, srcH, 0, 0, dstW, dstH);
    return this.context.restore();
  };

  NativeApp.prototype.update = function() {
    var drawCall, dt, fpsInterval, goalFPS, i, n, now, renderCommands, timeSinceInteract;
    requestAnimationFrame((function(_this) {
      return function() {
        return _this.update();
      };
    })(this));
    now = new Date().getTime();
    dt = now - this.lastTime;
    timeSinceInteract = now - this.lastInteractTime;
    if (timeSinceInteract > 5000) {
      goalFPS = 5;
    } else {
      goalFPS = 200;
    }
    if (this.lastGoalFPS !== goalFPS) {
      console.log("switching to " + goalFPS + " FPS");
      this.lastGoalFPS = goalFPS;
    }
    fpsInterval = 1000 / goalFPS;
    if (dt < fpsInterval) {
      return;
    }
    this.lastTime = now;
    this.context.clearRect(0, 0, this.width, this.height);
    this.game.update(dt);
    renderCommands = this.game.render();
    i = 0;
    n = renderCommands.length;
    while (i < n) {
      drawCall = renderCommands.slice(i, i += 16);
      this.drawImage.apply(this, drawCall);
    }
    return this.updateSave(dt);
  };

  NativeApp.prototype.onTouchStart = function(evt) {
    var j, len, results, touch, touches;
    this.lastInteractTime = new Date().getTime();
    this.heardOneTouch = true;
    touches = evt.changedTouches;
    results = [];
    for (j = 0, len = touches.length; j < len; j++) {
      touch = touches[j];
      if (this.touchMouse === null) {
        this.touchMouse = touch.identifier;
      }
      if (this.touchMouse === touch.identifier) {
        results.push(this.game.touchDown(touch.clientX, touch.clientY));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  NativeApp.prototype.onTouchMove = function(evt) {
    var j, len, results, touch, touches;
    this.lastInteractTime = new Date().getTime();
    touches = evt.changedTouches;
    results = [];
    for (j = 0, len = touches.length; j < len; j++) {
      touch = touches[j];
      if (this.touchMouse === touch.identifier) {
        results.push(this.game.touchMove(touch.clientX, touch.clientY));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  NativeApp.prototype.onTouchEnd = function(evt) {
    var j, len, touch, touches;
    this.lastInteractTime = new Date().getTime();
    touches = evt.changedTouches;
    for (j = 0, len = touches.length; j < len; j++) {
      touch = touches[j];
      if (this.touchMouse === touch.identifier) {
        this.game.touchUp(touch.clientX, touch.clientY);
        this.touchMouse = null;
      }
    }
    if (evt.touches.length === 0) {
      return this.touchMouse = null;
    }
  };

  NativeApp.prototype.onMouseDown = function(evt) {
    if (this.heardOneTouch) {
      return;
    }
    this.lastInteractTime = new Date().getTime();
    return this.game.touchDown(evt.clientX, evt.clientY);
  };

  NativeApp.prototype.onMouseMove = function(evt) {
    if (this.heardOneTouch) {
      return;
    }
    this.lastInteractTime = new Date().getTime();
    return this.game.touchMove(evt.clientX, evt.clientY);
  };

  NativeApp.prototype.onMouseUp = function(evt) {
    if (this.heardOneTouch) {
      return;
    }
    this.lastInteractTime = new Date().getTime();
    return this.game.touchUp(evt.clientX, evt.clientY);
  };

  return NativeApp;

})();

screen = document.getElementById('screen');

resizeScreen = function() {
  var currentAspectRatio, desiredAspectRatio;
  desiredAspectRatio = 16 / 9;
  currentAspectRatio = window.innerWidth / window.innerHeight;
  if (currentAspectRatio < desiredAspectRatio) {
    screen.width = window.innerWidth;
    return screen.height = Math.floor(window.innerWidth * (1 / desiredAspectRatio));
  } else {
    screen.width = Math.floor(window.innerHeight * desiredAspectRatio);
    return screen.height = window.innerHeight;
  }
};

resizeScreen();

app = new NativeApp(screen, screen.width, screen.height);


},{"./Game":4}]},{},[11])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQW5pbWF0aW9uLmNvZmZlZSIsInNyYy9CdXR0b24uY29mZmVlIiwic3JjL0ZvbnRSZW5kZXJlci5jb2ZmZWUiLCJzcmMvR2FtZS5jb2ZmZWUiLCJzcmMvSGFuZC5jb2ZmZWUiLCJzcmMvTWVudS5jb2ZmZWUiLCJzcmMvUGlsZS5jb2ZmZWUiLCJzcmMvU3ByaXRlUmVuZGVyZXIuY29mZmVlIiwic3JjL1RoaXJ0ZWVuLmNvZmZlZSIsInNyYy9mb250bWV0cmljcy5jb2ZmZWUiLCJzcmMvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBOztBQUFBLFFBQUEsR0FBVyxTQUFDLENBQUQ7RUFDVCxJQUFHLENBQUEsS0FBSyxDQUFSO0FBQ0UsV0FBTyxFQURUO0dBQUEsTUFFSyxJQUFHLENBQUEsR0FBSSxDQUFQO0FBQ0gsV0FBTyxDQUFDLEVBREw7O0FBRUwsU0FBTztBQUxFOztBQU9MO0VBQ1MsbUJBQUMsSUFBRDtBQUNYLFFBQUE7SUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksQ0FBQztJQUNkLElBQUMsQ0FBQSxHQUFELEdBQU87SUFDUCxJQUFDLENBQUEsR0FBRCxHQUFPO0FBQ1AsU0FBQSxTQUFBOztNQUNFLElBQUcsQ0FBQSxLQUFLLE9BQVI7UUFDRSxJQUFDLENBQUEsR0FBSSxDQUFBLENBQUEsQ0FBTCxHQUFVO1FBQ1YsSUFBQyxDQUFBLEdBQUksQ0FBQSxDQUFBLENBQUwsR0FBVSxFQUZaOztBQURGO0VBSlc7O3NCQVViLElBQUEsR0FBTSxTQUFBO0lBQ0osSUFBRyxrQkFBSDtNQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBTCxHQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFEaEI7O0lBRUEsSUFBRyxrQkFBSDtNQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBTCxHQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFEaEI7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LElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBTixDQUFnQixHQUFHLENBQUMsT0FBcEIsRUFBNkIsR0FBRyxDQUFDLE9BQWpDO0VBSlc7O3NCQU1iLFNBQUEsR0FBVyxTQUFDLEdBQUQ7SUFDVCxJQUFHLElBQUMsQ0FBQSxhQUFKO0FBQ0UsYUFERjs7SUFFQSxJQUFDLENBQUEsZ0JBQUQsR0FBb0IsSUFBSSxJQUFKLENBQUEsQ0FBVSxDQUFDLE9BQVgsQ0FBQTtXQUNwQixJQUFDLENBQUEsSUFBSSxDQUFDLE9BQU4sQ0FBYyxHQUFHLENBQUMsT0FBbEIsRUFBMkIsR0FBRyxDQUFDLE9BQS9CO0VBSlM7Ozs7OztBQU1iLE1BQUEsR0FBUyxRQUFRLENBQUMsY0FBVCxDQUF3QixRQUF4Qjs7QUFDVCxZQUFBLEdBQWUsU0FBQTtBQUNiLE1BQUE7RUFBQSxrQkFBQSxHQUFxQixFQUFBLEdBQUs7RUFDMUIsa0JBQUEsR0FBcUIsTUFBTSxDQUFDLFVBQVAsR0FBb0IsTUFBTSxDQUFDO0VBQ2hELElBQUcsa0JBQUEsR0FBcUIsa0JBQXhCO0lBQ0UsTUFBTSxDQUFDLEtBQVAsR0FBZSxNQUFNLENBQUM7V0FDdEIsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsSUFBSSxDQUFDLEtBQUwsQ0FBVyxNQUFNLENBQUMsVUFBUCxHQUFvQixDQUFDLENBQUEsR0FBSSxrQkFBTCxDQUEvQixFQUZsQjtHQUFBLE1BQUE7SUFJRSxNQUFNLENBQUMsS0FBUCxHQUFlLElBQUksQ0FBQyxLQUFMLENBQVcsTUFBTSxDQUFDLFdBQVAsR0FBcUIsa0JBQWhDO1dBQ2YsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsTUFBTSxDQUFDLFlBTHpCOztBQUhhOztBQVNmLFlBQUEsQ0FBQTs7QUFHQSxHQUFBLEdBQU0sSUFBSSxTQUFKLENBQWMsTUFBZCxFQUFzQixNQUFNLENBQUMsS0FBN0IsRUFBb0MsTUFBTSxDQUFDLE1BQTNDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY2FsY1NpZ24gPSAodikgLT5cbiAgaWYgdiA9PSAwXG4gICAgcmV0dXJuIDBcbiAgZWxzZSBpZiB2IDwgMFxuICAgIHJldHVybiAtMVxuICByZXR1cm4gMVxuXG5jbGFzcyBBbmltYXRpb25cbiAgY29uc3RydWN0b3I6IChkYXRhKSAtPlxuICAgIEBzcGVlZCA9IGRhdGEuc3BlZWRcbiAgICBAcmVxID0ge31cbiAgICBAY3VyID0ge31cbiAgICBmb3Igayx2IG9mIGRhdGFcbiAgICAgIGlmIGsgIT0gJ3NwZWVkJ1xuICAgICAgICBAcmVxW2tdID0gdlxuICAgICAgICBAY3VyW2tdID0gdlxuXG4gICMgJ2ZpbmlzaGVzJyBhbGwgYW5pbWF0aW9uc1xuICB3YXJwOiAtPlxuICAgIGlmIEBjdXIucj9cbiAgICAgIEBjdXIuciA9IEByZXEuclxuICAgIGlmIEBjdXIucz9cbiAgICAgIEBjdXIucyA9IEByZXEuc1xuICAgIGlmIEBjdXIueD8gYW5kIEBjdXIueT9cbiAgICAgIEBjdXIueCA9IEByZXEueFxuICAgICAgQGN1ci55ID0gQHJlcS55XG5cbiAgYW5pbWF0aW5nOiAtPlxuICAgIGlmIEBjdXIucj9cbiAgICAgIGlmIEByZXEuciAhPSBAY3VyLnJcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICBpZiBAY3VyLnM/XG4gICAgICBpZiBAcmVxLnMgIT0gQGN1ci5zXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgaWYgQGN1ci54PyBhbmQgQGN1ci55P1xuICAgICAgaWYgKEByZXEueCAhPSBAY3VyLngpIG9yIChAcmVxLnkgIT0gQGN1ci55KVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIHJldHVybiBmYWxzZVxuXG4gIHVwZGF0ZTogKGR0KSAtPlxuICAgIHVwZGF0ZWQgPSBmYWxzZVxuICAgICMgcm90YXRpb25cbiAgICBpZiBAY3VyLnI/XG4gICAgICBpZiBAcmVxLnIgIT0gQGN1ci5yXG4gICAgICAgIHVwZGF0ZWQgPSB0cnVlXG4gICAgICAgICMgc2FuaXRpemUgcmVxdWVzdGVkIHJvdGF0aW9uXG4gICAgICAgIHR3b1BpID0gTWF0aC5QSSAqIDJcbiAgICAgICAgbmVnVHdvUGkgPSAtMSAqIHR3b1BpXG4gICAgICAgIEByZXEuciAtPSB0d29QaSB3aGlsZSBAcmVxLnIgPj0gdHdvUGlcbiAgICAgICAgQHJlcS5yICs9IHR3b1BpIHdoaWxlIEByZXEuciA8PSBuZWdUd29QaVxuICAgICAgICAjIHBpY2sgYSBkaXJlY3Rpb24gYW5kIHR1cm5cbiAgICAgICAgZHIgPSBAcmVxLnIgLSBAY3VyLnJcbiAgICAgICAgZGlzdCA9IE1hdGguYWJzKGRyKVxuICAgICAgICBzaWduID0gY2FsY1NpZ24oZHIpXG4gICAgICAgIGlmIGRpc3QgPiBNYXRoLlBJXG4gICAgICAgICAgIyBzcGluIHRoZSBvdGhlciBkaXJlY3Rpb24sIGl0IGlzIGNsb3NlclxuICAgICAgICAgIGRpc3QgPSB0d29QaSAtIGRpc3RcbiAgICAgICAgICBzaWduICo9IC0xXG4gICAgICAgIG1heERpc3QgPSBkdCAqIEBzcGVlZC5yIC8gMTAwMFxuICAgICAgICBpZiBkaXN0IDwgbWF4RGlzdFxuICAgICAgICAgICMgd2UgY2FuIGZpbmlzaCB0aGlzIGZyYW1lXG4gICAgICAgICAgQGN1ci5yID0gQHJlcS5yXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAY3VyLnIgKz0gbWF4RGlzdCAqIHNpZ25cblxuICAgICMgc2NhbGVcbiAgICBpZiBAY3VyLnM/XG4gICAgICBpZiBAcmVxLnMgIT0gQGN1ci5zXG4gICAgICAgIHVwZGF0ZWQgPSB0cnVlXG4gICAgICAgICMgcGljayBhIGRpcmVjdGlvbiBhbmQgdHVyblxuICAgICAgICBkcyA9IEByZXEucyAtIEBjdXIuc1xuICAgICAgICBkaXN0ID0gTWF0aC5hYnMoZHMpXG4gICAgICAgIHNpZ24gPSBjYWxjU2lnbihkcylcbiAgICAgICAgbWF4RGlzdCA9IGR0ICogQHNwZWVkLnMgLyAxMDAwXG4gICAgICAgIGlmIGRpc3QgPCBtYXhEaXN0XG4gICAgICAgICAgIyB3ZSBjYW4gZmluaXNoIHRoaXMgZnJhbWVcbiAgICAgICAgICBAY3VyLnMgPSBAcmVxLnNcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBjdXIucyArPSBtYXhEaXN0ICogc2lnblxuXG4gICAgIyB0cmFuc2xhdGlvblxuICAgIGlmIEBjdXIueD8gYW5kIEBjdXIueT9cbiAgICAgIGlmIChAcmVxLnggIT0gQGN1ci54KSBvciAoQHJlcS55ICE9IEBjdXIueSlcbiAgICAgICAgdXBkYXRlZCA9IHRydWVcbiAgICAgICAgdmVjWCA9IEByZXEueCAtIEBjdXIueFxuICAgICAgICB2ZWNZID0gQHJlcS55IC0gQGN1ci55XG4gICAgICAgIGRpc3QgPSBNYXRoLnNxcnQoKHZlY1ggKiB2ZWNYKSArICh2ZWNZICogdmVjWSkpXG4gICAgICAgIG1heERpc3QgPSBkdCAqIEBzcGVlZC50IC8gMTAwMFxuICAgICAgICBpZiBkaXN0IDwgbWF4RGlzdFxuICAgICAgICAgICMgd2UgY2FuIGZpbmlzaCB0aGlzIGZyYW1lXG4gICAgICAgICAgQGN1ci54ID0gQHJlcS54XG4gICAgICAgICAgQGN1ci55ID0gQHJlcS55XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAjIG1vdmUgYXMgbXVjaCBhcyBwb3NzaWJsZVxuICAgICAgICAgIEBjdXIueCArPSAodmVjWCAvIGRpc3QpICogbWF4RGlzdFxuICAgICAgICAgIEBjdXIueSArPSAodmVjWSAvIGRpc3QpICogbWF4RGlzdFxuXG4gICAgcmV0dXJuIHVwZGF0ZWRcblxubW9kdWxlLmV4cG9ydHMgPSBBbmltYXRpb25cbiIsIkFuaW1hdGlvbiA9IHJlcXVpcmUgJy4vQW5pbWF0aW9uJ1xuXG5jbGFzcyBCdXR0b25cbiAgY29uc3RydWN0b3I6IChAZ2FtZSwgQHNwcml0ZU5hbWVzLCBAZm9udCwgQHRleHRIZWlnaHQsIEB4LCBAeSwgQGNiKSAtPlxuICAgIEBhbmltID0gbmV3IEFuaW1hdGlvbiB7XG4gICAgICBzcGVlZDogeyBzOiAzIH1cbiAgICAgIHM6IDBcbiAgICB9XG4gICAgQGNvbG9yID0geyByOiAxLCBnOiAxLCBiOiAxLCBhOiAwIH1cblxuICB1cGRhdGU6IChkdCkgLT5cbiAgICByZXR1cm4gQGFuaW0udXBkYXRlKGR0KVxuXG4gIHJlbmRlcjogLT5cbiAgICBAY29sb3IuYSA9IEBhbmltLmN1ci5zXG4gICAgQGdhbWUuc3ByaXRlUmVuZGVyZXIucmVuZGVyIEBzcHJpdGVOYW1lc1swXSwgQHgsIEB5LCAwLCBAdGV4dEhlaWdodCAqIDEuNSwgMCwgMC41LCAwLjUsIEBnYW1lLmNvbG9ycy53aGl0ZSwgPT5cbiAgICAgICMgcHVsc2UgYnV0dG9uIGFuaW0sXG4gICAgICBAYW5pbS5jdXIucyA9IDFcbiAgICAgIEBhbmltLnJlcS5zID0gMFxuICAgICAgIyB0aGVuIGNhbGwgY2FsbGJhY2tcbiAgICAgIEBjYih0cnVlKVxuICAgIEBnYW1lLnNwcml0ZVJlbmRlcmVyLnJlbmRlciBAc3ByaXRlTmFtZXNbMV0sIEB4LCBAeSwgMCwgQHRleHRIZWlnaHQgKiAxLjUsIDAsIDAuNSwgMC41LCBAY29sb3JcbiAgICB0ZXh0ID0gQGNiKGZhbHNlKVxuICAgIEBnYW1lLmZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIEB0ZXh0SGVpZ2h0LCB0ZXh0LCBAeCwgQHksIDAuNSwgMC41LCBAZ2FtZS5jb2xvcnMuYnV0dG9udGV4dFxuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1dHRvblxuIiwiZm9udG1ldHJpY3MgPSByZXF1aXJlICcuL2ZvbnRtZXRyaWNzJ1xuXG4jIHRha2VuIGZyb20gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy81NjIzODM4L3JnYi10by1oZXgtYW5kLWhleC10by1yZ2JcbmhleFRvUmdiID0gKGhleCwgYSkgLT5cbiAgICByZXN1bHQgPSAvXiM/KFthLWZcXGRdezJ9KShbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pJC9pLmV4ZWMoaGV4KVxuICAgIHJldHVybiBudWxsIGlmIG5vdCByZXN1bHRcbiAgICByZXR1cm4ge1xuICAgICAgICByOiBwYXJzZUludChyZXN1bHRbMV0sIDE2KSAvIDI1NSxcbiAgICAgICAgZzogcGFyc2VJbnQocmVzdWx0WzJdLCAxNikgLyAyNTUsXG4gICAgICAgIGI6IHBhcnNlSW50KHJlc3VsdFszXSwgMTYpIC8gMjU1XG4gICAgICAgIGE6IGFcbiAgICB9XG5cbmNsYXNzIEZvbnRSZW5kZXJlclxuICBjb25zdHJ1Y3RvcjogIChAZ2FtZSkgLT5cbiAgICBAd2hpdGUgPSB7IHI6IDEsIGc6IDEsIGI6IDEsIGE6IDEgfVxuXG4gIHNpemU6IChmb250LCBoZWlnaHQsIHN0cikgLT5cbiAgICBtZXRyaWNzID0gZm9udG1ldHJpY3NbZm9udF1cbiAgICByZXR1cm4gaWYgbm90IG1ldHJpY3NcbiAgICBzY2FsZSA9IGhlaWdodCAvIG1ldHJpY3MuaGVpZ2h0XG5cbiAgICB0b3RhbFdpZHRoID0gMFxuICAgIHRvdGFsSGVpZ2h0ID0gbWV0cmljcy5oZWlnaHQgKiBzY2FsZVxuICAgIGZvciBjaCwgaSBpbiBzdHJcbiAgICAgIGNvZGUgPSBjaC5jaGFyQ29kZUF0KDApXG4gICAgICBnbHlwaCA9IG1ldHJpY3MuZ2x5cGhzW2NvZGVdXG4gICAgICBjb250aW51ZSBpZiBub3QgZ2x5cGhcbiAgICAgIHRvdGFsV2lkdGggKz0gZ2x5cGgueGFkdmFuY2UgKiBzY2FsZVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHc6IHRvdGFsV2lkdGhcbiAgICAgIGg6IHRvdGFsSGVpZ2h0XG4gICAgfVxuXG4gIHJlbmRlcjogKGZvbnQsIGhlaWdodCwgc3RyLCB4LCB5LCBhbmNob3J4LCBhbmNob3J5LCBjb2xvciwgY2IpIC0+XG4gICAgbWV0cmljcyA9IGZvbnRtZXRyaWNzW2ZvbnRdXG4gICAgcmV0dXJuIGlmIG5vdCBtZXRyaWNzXG4gICAgc2NhbGUgPSBoZWlnaHQgLyBtZXRyaWNzLmhlaWdodFxuXG4gICAgdG90YWxXaWR0aCA9IDBcbiAgICB0b3RhbEhlaWdodCA9IG1ldHJpY3MuaGVpZ2h0ICogc2NhbGVcbiAgICBza2lwQ29sb3IgPSBmYWxzZVxuICAgIGZvciBjaCwgaSBpbiBzdHJcbiAgICAgIGlmIGNoID09ICdgJ1xuICAgICAgICBza2lwQ29sb3IgPSAhc2tpcENvbG9yXG4gICAgICBjb250aW51ZSBpZiBza2lwQ29sb3JcbiAgICAgIGNvZGUgPSBjaC5jaGFyQ29kZUF0KDApXG4gICAgICBnbHlwaCA9IG1ldHJpY3MuZ2x5cGhzW2NvZGVdXG4gICAgICBjb250aW51ZSBpZiBub3QgZ2x5cGhcbiAgICAgIHRvdGFsV2lkdGggKz0gZ2x5cGgueGFkdmFuY2UgKiBzY2FsZVxuXG4gICAgYW5jaG9yT2Zmc2V0WCA9IC0xICogYW5jaG9yeCAqIHRvdGFsV2lkdGhcbiAgICBhbmNob3JPZmZzZXRZID0gLTEgKiBhbmNob3J5ICogdG90YWxIZWlnaHRcbiAgICBjdXJyWCA9IHhcblxuICAgIGlmIGNvbG9yXG4gICAgICBzdGFydGluZ0NvbG9yID0gY29sb3JcbiAgICBlbHNlXG4gICAgICBzdGFydGluZ0NvbG9yID0gQHdoaXRlXG4gICAgY3VycmVudENvbG9yID0gc3RhcnRpbmdDb2xvclxuXG4gICAgY29sb3JTdGFydCA9IC0xXG4gICAgZm9yIGNoLCBpIGluIHN0clxuICAgICAgaWYgY2ggPT0gJ2AnXG4gICAgICAgIGlmIGNvbG9yU3RhcnQgPT0gLTFcbiAgICAgICAgICBjb2xvclN0YXJ0ID0gaSArIDFcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGxlbiA9IGkgLSBjb2xvclN0YXJ0XG4gICAgICAgICAgaWYgbGVuXG4gICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBoZXhUb1JnYihzdHIuc3Vic3RyKGNvbG9yU3RhcnQsIGkgLSBjb2xvclN0YXJ0KSwgc3RhcnRpbmdDb2xvci5hKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGN1cnJlbnRDb2xvciA9IHN0YXJ0aW5nQ29sb3JcbiAgICAgICAgICBjb2xvclN0YXJ0ID0gLTFcblxuICAgICAgY29udGludWUgaWYgY29sb3JTdGFydCAhPSAtMVxuICAgICAgY29kZSA9IGNoLmNoYXJDb2RlQXQoMClcbiAgICAgIGdseXBoID0gbWV0cmljcy5nbHlwaHNbY29kZV1cbiAgICAgIGNvbnRpbnVlIGlmIG5vdCBnbHlwaFxuICAgICAgQGdhbWUuZHJhd0ltYWdlIGZvbnQsXG4gICAgICBnbHlwaC54LCBnbHlwaC55LCBnbHlwaC53aWR0aCwgZ2x5cGguaGVpZ2h0LFxuICAgICAgY3VyclggKyAoZ2x5cGgueG9mZnNldCAqIHNjYWxlKSArIGFuY2hvck9mZnNldFgsIHkgKyAoZ2x5cGgueW9mZnNldCAqIHNjYWxlKSArIGFuY2hvck9mZnNldFksIGdseXBoLndpZHRoICogc2NhbGUsIGdseXBoLmhlaWdodCAqIHNjYWxlLFxuICAgICAgMCwgMCwgMCxcbiAgICAgIGN1cnJlbnRDb2xvci5yLCBjdXJyZW50Q29sb3IuZywgY3VycmVudENvbG9yLmIsIGN1cnJlbnRDb2xvci5hLCBjYlxuICAgICAgY3VyclggKz0gZ2x5cGgueGFkdmFuY2UgKiBzY2FsZVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZvbnRSZW5kZXJlclxuIiwiQW5pbWF0aW9uID0gcmVxdWlyZSAnLi9BbmltYXRpb24nXG5CdXR0b24gPSByZXF1aXJlICcuL0J1dHRvbidcbkZvbnRSZW5kZXJlciA9IHJlcXVpcmUgJy4vRm9udFJlbmRlcmVyJ1xuU3ByaXRlUmVuZGVyZXIgPSByZXF1aXJlICcuL1Nwcml0ZVJlbmRlcmVyJ1xuTWVudSA9IHJlcXVpcmUgJy4vTWVudSdcbkhhbmQgPSByZXF1aXJlICcuL0hhbmQnXG5QaWxlID0gcmVxdWlyZSAnLi9QaWxlJ1xue1RoaXJ0ZWVuLCBPSywgYWlDaGFyYWN0ZXJzfSA9IHJlcXVpcmUgJy4vVGhpcnRlZW4nXG5cbiMgdGVtcFxuQlVJTERfVElNRVNUQU1QID0gXCIwLjAuMVwiXG5cbmNsYXNzIEdhbWVcbiAgY29uc3RydWN0b3I6IChAbmF0aXZlLCBAd2lkdGgsIEBoZWlnaHQpIC0+XG4gICAgQHZlcnNpb24gPSBCVUlMRF9USU1FU1RBTVBcbiAgICBAbG9nKFwiR2FtZSBjb25zdHJ1Y3RlZDogI3tAd2lkdGh9eCN7QGhlaWdodH1cIilcbiAgICBAZm9udFJlbmRlcmVyID0gbmV3IEZvbnRSZW5kZXJlciB0aGlzXG4gICAgQHNwcml0ZVJlbmRlcmVyID0gbmV3IFNwcml0ZVJlbmRlcmVyIHRoaXNcbiAgICBAZm9udCA9IFwiZGFya2ZvcmVzdFwiXG4gICAgQHpvbmVzID0gW11cbiAgICBAbmV4dEFJVGljayA9IDEwMDAgIyB3aWxsIGJlIHNldCBieSBvcHRpb25zXG4gICAgQGNlbnRlciA9XG4gICAgICB4OiBAd2lkdGggLyAyXG4gICAgICB5OiBAaGVpZ2h0IC8gMlxuICAgIEBhYUhlaWdodCA9IEB3aWR0aCAqIDkgLyAxNlxuICAgIEBsb2cgXCJoZWlnaHQ6ICN7QGhlaWdodH0uIGhlaWdodCBpZiBzY3JlZW4gd2FzIDE2OjkgKGFzcGVjdCBhZGp1c3RlZCk6ICN7QGFhSGVpZ2h0fVwiXG4gICAgQHBhdXNlQnV0dG9uU2l6ZSA9IEBhYUhlaWdodCAvIDE1XG4gICAgQGNvbG9ycyA9XG4gICAgICB3aGl0ZTogICAgICB7IHI6ICAgMSwgZzogICAxLCBiOiAgIDEsIGE6ICAgMSB9XG4gICAgICBibGFjazogICAgICB7IHI6ICAgMCwgZzogICAwLCBiOiAgIDAsIGE6ICAgMSB9XG4gICAgICByZWQ6ICAgICAgICB7IHI6ICAgMSwgZzogICAwLCBiOiAgIDAsIGE6ICAgMSB9XG4gICAgICBvcmFuZ2U6ICAgICB7IHI6ICAgMSwgZzogMC41LCBiOiAgIDAsIGE6ICAgMSB9XG4gICAgICBnb2xkOiAgICAgICB7IHI6ICAgMSwgZzogICAxLCBiOiAgIDAsIGE6ICAgMSB9XG4gICAgICBidXR0b250ZXh0OiB7IHI6ICAgMSwgZzogICAxLCBiOiAgIDEsIGE6ICAgMSB9XG4gICAgICBsaWdodGdyYXk6ICB7IHI6IDAuNSwgZzogMC41LCBiOiAwLjUsIGE6ICAgMSB9XG4gICAgICBiYWNrZ3JvdW5kOiB7IHI6ICAgMCwgZzogMC4yLCBiOiAgIDAsIGE6ICAgMSB9XG4gICAgICBsb2diZzogICAgICB7IHI6IDAuMSwgZzogICAwLCBiOiAgIDAsIGE6ICAgMSB9XG4gICAgICBhcnJvdzogICAgICB7IHI6ICAgMSwgZzogICAxLCBiOiAgIDEsIGE6ICAgMSB9XG4gICAgICBhcnJvd2Nsb3NlOiB7IHI6ICAgMSwgZzogMC41LCBiOiAgIDAsIGE6IDAuMyB9XG4gICAgICBoYW5kYXJlYTogICB7IHI6ICAgMCwgZzogMC4xLCBiOiAgIDAsIGE6IDEuMCB9XG4gICAgICBvdmVybGF5OiAgICB7IHI6ICAgMCwgZzogICAwLCBiOiAgIDAsIGE6IDAuNiB9XG4gICAgICBtYWlubWVudTogICB7IHI6IDAuMSwgZzogMC4xLCBiOiAwLjEsIGE6ICAgMSB9XG4gICAgICBwYXVzZW1lbnU6ICB7IHI6IDAuMSwgZzogMC4wLCBiOiAwLjEsIGE6ICAgMSB9XG4gICAgICBiaWQ6ICAgICAgICB7IHI6ICAgMCwgZzogMC42LCBiOiAgIDAsIGE6ICAgMSB9XG5cbiAgICBAdGV4dHVyZXMgPVxuICAgICAgXCJjYXJkc1wiOiAwXG4gICAgICBcImRhcmtmb3Jlc3RcIjogMVxuICAgICAgXCJjaGFyc1wiOiAyXG4gICAgICBcImhvd3RvMVwiOiAzXG4gICAgICBcImhvd3RvMlwiOiA0XG4gICAgICBcImhvd3RvM1wiOiA1XG5cbiAgICBAdGhpcnRlZW4gPSBudWxsXG4gICAgQGxhc3RFcnIgPSAnJ1xuICAgIEBwYXVzZWQgPSBmYWxzZVxuICAgIEBob3d0byA9IDBcbiAgICBAcmVuZGVyQ29tbWFuZHMgPSBbXVxuXG4gICAgIyBAYmlkID0gMFxuICAgICMgQGJpZEJ1dHRvblNpemUgPSBAYWFIZWlnaHQgLyA4XG4gICAgIyBAYmlkVGV4dFNpemUgPSBAYWFIZWlnaHQgLyA2XG4gICAgIyBiaWRCdXR0b25EaXN0YW5jZSA9IEBiaWRCdXR0b25TaXplICogM1xuICAgICMgQGJpZEJ1dHRvblkgPSBAY2VudGVyLnkgLSAoQGJpZEJ1dHRvblNpemUpXG4gICAgIyBAYmlkVUkgPSAjKEBnYW1lLCBAc3ByaXRlTmFtZXMsIEBmb250LCBAdGV4dEhlaWdodCwgQHgsIEB5LCBAdGV4dCwgQGNiKVxuICAgICMgICBtaW51czogbmV3IEJ1dHRvbiB0aGlzLCBbJ21pbnVzMCcsICdtaW51czEnXSwgQGZvbnQsIEBiaWRCdXR0b25TaXplLCBAY2VudGVyLnggLSBiaWRCdXR0b25EaXN0YW5jZSwgQGJpZEJ1dHRvblksIChjbGljaykgPT5cbiAgICAjICAgICBpZiBjbGlja1xuICAgICMgICAgICAgQGFkanVzdEJpZCgtMSlcbiAgICAjICAgICByZXR1cm4gJydcbiAgICAjICAgcGx1czogIG5ldyBCdXR0b24gdGhpcywgWydwbHVzMCcsICdwbHVzMSddLCAgIEBmb250LCBAYmlkQnV0dG9uU2l6ZSwgQGNlbnRlci54ICsgYmlkQnV0dG9uRGlzdGFuY2UsIEBiaWRCdXR0b25ZLCAoY2xpY2spID0+XG4gICAgIyAgICAgaWYgY2xpY2tcbiAgICAjICAgICAgIEBhZGp1c3RCaWQoMSlcbiAgICAjICAgICByZXR1cm4gJydcblxuICAgIEBvcHRpb25NZW51cyA9XG4gICAgICBzcGVlZHM6IFtcbiAgICAgICAgeyB0ZXh0OiBcIkFJIFNwZWVkOiBTbG93XCIsIHNwZWVkOiAyMDAwIH1cbiAgICAgICAgeyB0ZXh0OiBcIkFJIFNwZWVkOiBNZWRpdW1cIiwgc3BlZWQ6IDEwMDAgfVxuICAgICAgICB7IHRleHQ6IFwiQUkgU3BlZWQ6IEZhc3RcIiwgc3BlZWQ6IDUwMCB9XG4gICAgICAgIHsgdGV4dDogXCJBSSBTcGVlZDogVWx0cmFcIiwgc3BlZWQ6IDI1MCB9XG4gICAgICBdXG4gICAgICBzb3J0czogW1xuICAgICAgICB7IHRleHQ6IFwiU29ydCBPcmRlcjogTm9ybWFsXCIgfVxuICAgICAgICB7IHRleHQ6IFwiU29ydCBPcmRlcjogUmV2ZXJzZVwiIH1cbiAgICAgIF1cbiAgICBAb3B0aW9ucyA9XG4gICAgICBzcGVlZEluZGV4OiAxXG4gICAgICBzb3J0SW5kZXg6IDBcbiAgICAgIHNvdW5kOiB0cnVlXG5cbiAgICBAbWFpbk1lbnUgPSBuZXcgTWVudSB0aGlzLCBcIlRoaXJ0ZWVuXCIsIFwic29saWRcIiwgQGNvbG9ycy5tYWlubWVudSwgW1xuICAgICAgKGNsaWNrKSA9PlxuICAgICAgICBpZiBjbGlja1xuICAgICAgICAgIEBob3d0byA9IDFcbiAgICAgICAgcmV0dXJuIFwiSG93IFRvIFBsYXlcIlxuICAgICAgKGNsaWNrKSA9PlxuICAgICAgICBpZiBjbGlja1xuICAgICAgICAgIEBvcHRpb25zLnNwZWVkSW5kZXggPSAoQG9wdGlvbnMuc3BlZWRJbmRleCArIDEpICUgQG9wdGlvbk1lbnVzLnNwZWVkcy5sZW5ndGhcbiAgICAgICAgcmV0dXJuIEBvcHRpb25NZW51cy5zcGVlZHNbQG9wdGlvbnMuc3BlZWRJbmRleF0udGV4dFxuICAgICAgKGNsaWNrKSA9PlxuICAgICAgICBpZiBjbGlja1xuICAgICAgICAgIEBvcHRpb25zLnNvcnRJbmRleCA9IChAb3B0aW9ucy5zb3J0SW5kZXggKyAxKSAlIEBvcHRpb25NZW51cy5zb3J0cy5sZW5ndGhcbiAgICAgICAgcmV0dXJuIEBvcHRpb25NZW51cy5zb3J0c1tAb3B0aW9ucy5zb3J0SW5kZXhdLnRleHRcbiAgICAgICMgKGNsaWNrKSA9PlxuICAgICAgIyAgIGlmIGNsaWNrXG4gICAgICAjICAgICBAb3B0aW9ucy5zb3VuZCA9ICFAb3B0aW9ucy5zb3VuZFxuICAgICAgIyAgIHJldHVybiBcIlNvdW5kOiAje2lmIEBvcHRpb25zLnNvdW5kIHRoZW4gXCJFbmFibGVkXCIgZWxzZSBcIkRpc2FibGVkXCJ9XCJcbiAgICAgIChjbGljaykgPT5cbiAgICAgICAgaWYgY2xpY2tcbiAgICAgICAgICBAbmV3R2FtZSgpXG4gICAgICAgIHJldHVybiBcIlN0YXJ0XCJcbiAgICBdXG5cbiAgICBAcGF1c2VNZW51ID0gbmV3IE1lbnUgdGhpcywgXCJQYXVzZWRcIiwgXCJzb2xpZFwiLCBAY29sb3JzLnBhdXNlbWVudSwgW1xuICAgICAgKGNsaWNrKSA9PlxuICAgICAgICBpZiBjbGlja1xuICAgICAgICAgIEBwYXVzZWQgPSBmYWxzZVxuICAgICAgICByZXR1cm4gXCJSZXN1bWUgR2FtZVwiXG4gICAgICAoY2xpY2spID0+XG4gICAgICAgIGlmIGNsaWNrXG4gICAgICAgICAgQG5ld0dhbWUoKVxuICAgICAgICAgIEBwYXVzZWQgPSBmYWxzZVxuICAgICAgICByZXR1cm4gXCJOZXcgR2FtZVwiXG4gICAgICAoY2xpY2spID0+XG4gICAgICAgIGlmIGNsaWNrXG4gICAgICAgICAgQGhvd3RvID0gMVxuICAgICAgICByZXR1cm4gXCJIb3cgVG8gUGxheVwiXG4gICAgICAoY2xpY2spID0+XG4gICAgICAgIGlmIGNsaWNrXG4gICAgICAgICAgQG9wdGlvbnMuc3BlZWRJbmRleCA9IChAb3B0aW9ucy5zcGVlZEluZGV4ICsgMSkgJSBAb3B0aW9uTWVudXMuc3BlZWRzLmxlbmd0aFxuICAgICAgICByZXR1cm4gQG9wdGlvbk1lbnVzLnNwZWVkc1tAb3B0aW9ucy5zcGVlZEluZGV4XS50ZXh0XG4gICAgICAoY2xpY2spID0+XG4gICAgICAgIGlmIGNsaWNrXG4gICAgICAgICAgQG9wdGlvbnMuc29ydEluZGV4ID0gKEBvcHRpb25zLnNvcnRJbmRleCArIDEpICUgQG9wdGlvbk1lbnVzLnNvcnRzLmxlbmd0aFxuICAgICAgICByZXR1cm4gQG9wdGlvbk1lbnVzLnNvcnRzW0BvcHRpb25zLnNvcnRJbmRleF0udGV4dFxuICAgICAgIyAoY2xpY2spID0+XG4gICAgICAjICAgaWYgY2xpY2tcbiAgICAgICMgICAgIEBvcHRpb25zLnNvdW5kID0gIUBvcHRpb25zLnNvdW5kXG4gICAgICAjICAgcmV0dXJuIFwiU291bmQ6ICN7aWYgQG9wdGlvbnMuc291bmQgdGhlbiBcIkVuYWJsZWRcIiBlbHNlIFwiRGlzYWJsZWRcIn1cIlxuICAgIF1cblxuICAgIEBuZXdHYW1lKClcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgbG9nZ2luZ1xuXG4gIGxvZzogKHMpIC0+XG4gICAgQG5hdGl2ZS5sb2cocylcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgbG9hZCAvIHNhdmVcblxuICBsb2FkOiAoanNvbikgLT5cbiAgICBAbG9nIFwiKENTKSBsb2FkaW5nIHN0YXRlXCJcbiAgICB0cnlcbiAgICAgIHN0YXRlID0gSlNPTi5wYXJzZSBqc29uXG4gICAgY2F0Y2hcbiAgICAgIEBsb2cgXCJsb2FkIGZhaWxlZCB0byBwYXJzZSBzdGF0ZTogI3tqc29ufVwiXG4gICAgICByZXR1cm5cbiAgICBpZiBzdGF0ZS5vcHRpb25zXG4gICAgICBmb3IgaywgdiBvZiBzdGF0ZS5vcHRpb25zXG4gICAgICAgIEBvcHRpb25zW2tdID0gdlxuXG4gICAgaWYgc3RhdGUudGhpcnRlZW5cbiAgICAgIEBsb2cgXCJyZWNyZWF0aW5nIGdhbWUgZnJvbSBzYXZlZGF0YVwiXG4gICAgICBAdGhpcnRlZW4gPSBuZXcgVGhpcnRlZW4gdGhpcywge1xuICAgICAgICBzdGF0ZTogc3RhdGUudGhpcnRlZW5cbiAgICAgIH1cbiAgICAgIEBwcmVwYXJlR2FtZSgpXG5cbiAgc2F2ZTogLT5cbiAgICAjIEBsb2cgXCIoQ1MpIHNhdmluZyBzdGF0ZVwiXG4gICAgc3RhdGUgPSB7XG4gICAgICBvcHRpb25zOiBAb3B0aW9uc1xuICAgIH1cblxuICAgICMgVE9ETzogRU5BQkxFIFNBVklORyBIRVJFXG4gICAgIyBpZiBAdGhpcnRlZW4/XG4gICAgIyAgIHN0YXRlLnRoaXJ0ZWVuID0gQHRoaXJ0ZWVuLnNhdmUoKVxuXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5IHN0YXRlXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIGFpVGlja1JhdGU6IC0+XG4gICAgcmV0dXJuIEBvcHRpb25NZW51cy5zcGVlZHNbQG9wdGlvbnMuc3BlZWRJbmRleF0uc3BlZWRcblxuICBuZXdHYW1lOiAtPlxuICAgIEB0aGlydGVlbiA9IG5ldyBUaGlydGVlbiB0aGlzLCB7fVxuICAgIEBsb2cgXCJwbGF5ZXIgMCdzIGhhbmQ6IFwiICsgSlNPTi5zdHJpbmdpZnkoQHRoaXJ0ZWVuLnBsYXllcnNbMF0uaGFuZClcbiAgICBAcHJlcGFyZUdhbWUoKVxuXG4gIHByZXBhcmVHYW1lOiAtPlxuICAgIEBoYW5kID0gbmV3IEhhbmQgdGhpc1xuICAgIEBwaWxlID0gbmV3IFBpbGUgdGhpcywgQGhhbmRcbiAgICBAaGFuZC5zZXQgQHRoaXJ0ZWVuLnBsYXllcnNbMF0uaGFuZFxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyBpbnB1dCBoYW5kbGluZ1xuXG4gIHRvdWNoRG93bjogKHgsIHkpIC0+XG4gICAgIyBAbG9nKFwidG91Y2hEb3duICN7eH0sI3t5fVwiKVxuICAgIEBjaGVja1pvbmVzKHgsIHkpXG5cbiAgdG91Y2hNb3ZlOiAoeCwgeSkgLT5cbiAgICAjIEBsb2coXCJ0b3VjaE1vdmUgI3t4fSwje3l9XCIpXG4gICAgaWYgQHRoaXJ0ZWVuICE9IG51bGxcbiAgICAgIEBoYW5kLm1vdmUoeCwgeSlcblxuICB0b3VjaFVwOiAoeCwgeSkgLT5cbiAgICAjIEBsb2coXCJ0b3VjaFVwICN7eH0sI3t5fVwiKVxuICAgIGlmIEB0aGlydGVlbiAhPSBudWxsXG4gICAgICBAaGFuZC51cCh4LCB5KVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyBiaWQgaGFuZGxpbmdcblxuICAjIGFkanVzdEJpZDogKGFtb3VudCkgLT5cbiAgIyAgIHJldHVybiBpZiBAdGhpcnRlZW4gPT0gbnVsbFxuICAjICAgQGJpZCA9IEBiaWQgKyBhbW91bnRcbiAgIyAgIGlmIEBiaWQgPCAwXG4gICMgICAgIEBiaWQgPSAwXG4gICMgICBpZiBAYmlkID4gQHRoaXJ0ZWVuLnRyaWNrc1xuICAjICAgICBAYmlkID0gQHRoaXJ0ZWVuLnRyaWNrc1xuXG4gICMgYXR0ZW1wdEJpZDogLT5cbiAgIyAgIHJldHVybiBpZiBAdGhpcnRlZW4gPT0gbnVsbFxuICAjICAgQGFkanVzdEJpZCgwKVxuICAjICAgaWYgQHRoaXJ0ZWVuLnN0YXRlID09IFN0YXRlLkJJRFxuICAjICAgICBpZiBAdGhpcnRlZW4udHVybiA9PSAwXG4gICMgICAgICAgQGxvZyBcImJpZGRpbmcgI3tAYmlkfVwiXG4gICMgICAgICAgQGxhc3RFcnIgPSBAdGhpcnRlZW4uYmlkIHtcbiAgIyAgICAgICAgIGlkOiAxXG4gICMgICAgICAgICBiaWQ6IEBiaWRcbiAgIyAgICAgICAgIGFpOiBmYWxzZVxuICAjICAgICAgIH1cblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgaGVhZGxpbmUgKGdhbWUgc3RhdGUgaW4gdG9wIGxlZnQpXG5cbiAgcHJldHR5RXJyb3JUYWJsZToge1xuICAgICMgYmlkT3V0T2ZSYW5nZTogICAgICBcIllvdSBhcmUgc29tZWhvdyBiaWRkaW5nIGFuIGltcG9zc2libGUgdmFsdWUuIFRoZSBnYW1lIG11c3QgYmUgYnJva2VuLlwiXG4gICAgIyBkZWFsZXJGdWNrZWQ6ICAgICAgIFwiRGVhbGVyIHJlc3RyaWN0aW9uOiBZb3UgbWF5IG5vdCBtYWtlIHRvdGFsIGJpZHMgbWF0Y2ggdG90YWwgdHJpY2tzLlwiXG4gICAgIyBkb05vdEhhdmU6ICAgICAgICAgIFwiWW91IGFyZSBzb21laG93IGF0dGVtcHRpbmcgdG8gcGxheSBhIGNhcmQgeW91IGRvbid0IG93bi4gVGhlIGdhbWUgbXVzdCBiZSBicm9rZW4uXCJcbiAgICAjIGZvcmNlZEhpZ2hlckluU3VpdDogXCJZb3UgaGF2ZSBhIGhpZ2hlciB2YWx1ZSBpbiB0aGUgbGVhZCBzdWl0LiBZb3UgbXVzdCBwbGF5IGl0LiAoUnVsZSAyKVwiXG4gICAgIyBmb3JjZWRJblN1aXQ6ICAgICAgIFwiWW91IGhhdmUgYXQgbGVhc3Qgb25lIG9mIHRoZSBsZWFkIHN1aXQuIFlvdSBtdXN0IHBsYXkgaXQuIChSdWxlIDEpXCJcbiAgICAjIGdhbWVPdmVyOiAgICAgICAgICAgXCJUaGUgZ2FtZSBpcyBvdmVyLiAgVGhlIGdhbWUgbXVzdCBiZSBicm9rZW4uXCJcbiAgICAjIGluZGV4T3V0T2ZSYW5nZTogICAgXCJZb3UgZG9uJ3QgaGF2ZSB0aGF0IGluZGV4LiBUaGUgZ2FtZSBtdXN0IGJlIGJyb2tlbi5cIlxuICAgICMgbG93ZXN0Q2FyZFJlcXVpcmVkOiBcIllvdSBtdXN0IHN0YXJ0IHRoZSByb3VuZCB3aXRoIHRoZSBsb3dlc3QgY2FyZCB5b3UgaGF2ZS5cIlxuICAgICMgbmV4dElzQ29uZnVzZWQ6ICAgICBcIkludGVyYWwgZXJyb3IuIFRoZSBnYW1lIG11c3QgYmUgYnJva2VuLlwiXG4gICAgIyBub05leHQ6ICAgICAgICAgICAgIFwiSW50ZXJhbCBlcnJvci4gVGhlIGdhbWUgbXVzdCBiZSBicm9rZW4uXCJcbiAgICAjIG5vdEJpZGRpbmdOb3c6ICAgICAgXCJZb3UgYXJlIHRyeWluZyB0byBiaWQgZHVyaW5nIHRoZSB3cm9uZyBwaGFzZS5cIlxuICAgICMgbm90RW5vdWdoUGxheWVyczogICBcIkNhbm5vdCBzdGFydCB0aGUgZ2FtZSB3aXRob3V0IG1vcmUgcGxheWVycy5cIlxuICAgICMgbm90SW5UcmljazogICAgICAgICBcIllvdSBhcmUgdHJ5aW5nIHRvIHBsYXkgYSBjYXJkIGR1cmluZyB0aGUgd3JvbmcgcGhhc2UuXCJcbiAgICAjIG5vdFlvdXJUdXJuOiAgICAgICAgXCJJdCBpc24ndCB5b3VyIHR1cm4uXCJcbiAgICAjIHRydW1wTm90QnJva2VuOiAgICAgXCJUcnVtcCBpc24ndCBicm9rZW4geWV0LiBMZWFkIHdpdGggYSBub24tc3BhZGUuXCJcbiAgfVxuXG4gIHByZXR0eUVycm9yOiAtPlxuICAgIHByZXR0eSA9IEBwcmV0dHlFcnJvclRhYmxlW0BsYXN0RXJyXVxuICAgIHJldHVybiBwcmV0dHkgaWYgcHJldHR5XG4gICAgcmV0dXJuIEBsYXN0RXJyXG5cbiAgY2FsY0hlYWRsaW5lOiAtPlxuICAgIHJldHVybiBcIlwiIGlmIEB0aGlydGVlbiA9PSBudWxsXG5cbiAgICBoZWFkbGluZSA9IFwiXCJcbiAgICAjIHN3aXRjaCBAdGhpcnRlZW4uc3RhdGVcbiAgICAjICAgd2hlbiBTdGF0ZS5CSURcbiAgICAjICAgICBoZWFkbGluZSA9IFwiV2FpdGluZyBmb3IgYGZmNzcwMGAje0B0aGlydGVlbi5wbGF5ZXJzW0B0aGlydGVlbi50dXJuXS5uYW1lfWBgIHRvIGBmZmZmMDBgYmlkYGBcIlxuICAgICMgICB3aGVuIFN0YXRlLlRSSUNLXG4gICAgIyAgICAgaGVhZGxpbmUgPSBcIldhaXRpbmcgZm9yIGBmZjc3MDBgI3tAdGhpcnRlZW4ucGxheWVyc1tAdGhpcnRlZW4udHVybl0ubmFtZX1gYCB0byBgZmZmZjAwYHBsYXlgYFwiXG4gICAgIyAgIHdoZW4gU3RhdGUuUk9VTkRTVU1NQVJZXG4gICAgIyAgICAgaGVhZGxpbmUgPSBcIldhaXRpbmcgZm9yIG5leHQgcm91bmQuLi5cIlxuICAgICMgICB3aGVuIFN0YXRlLlBPU1RHQU1FU1VNTUFSWVxuICAgICMgICAgIGhlYWRsaW5lID0gXCJHYW1lIG92ZXIhXCJcblxuICAgIGVyclRleHQgPSBcIlwiXG4gICAgaWYgKEBsYXN0RXJyLmxlbmd0aCA+IDApIGFuZCAoQGxhc3RFcnIgIT0gT0spXG4gICAgICBlcnJUZXh0ID0gXCIgIEVSUk9SOiBgZmYwMDAwYCN7QHByZXR0eUVycm9yKCl9XCJcbiAgICAgIGhlYWRsaW5lICs9IGVyclRleHRcblxuICAgIHJldHVybiBoZWFkbGluZVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyBnYW1lIG92ZXIgaW5mb3JtYXRpb25cblxuICBnYW1lT3ZlclRleHQ6IC0+XG4gICAgd2lubmVyID0gQHRoaXJ0ZWVuLndpbm5lcigpXG4gICAgaWYgd2lubmVyLm5hbWUgPT0gXCJQbGF5ZXJcIlxuICAgICAgcmV0dXJuIFtcIllvdSB3aW4hXCJdXG4gICAgcmV0dXJuIFtcIiN7d2lubmVyLm5hbWV9IHdpbnMhXCJdXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyBjYXJkIGhhbmRsaW5nXG5cbiAgcGxheTogKGNhcmRUb1BsYXksIHgsIHksIHIsIGNhcmRJbmRleCkgLT5cbiAgICAgIEBsb2cgXCIoZ2FtZSkgcGxheWluZyBjYXJkICN7Y2FyZFRvUGxheX1cIlxuICAgICAgcmV0ID0gQHRoaXJ0ZWVuLnBsYXkge1xuICAgICAgICBpZDogMVxuICAgICAgICBjYXJkczogW2NhcmRUb1BsYXldXG4gICAgICB9XG4gICAgICBAbGFzdEVyciA9IHJldFxuICAgICAgaWYgcmV0ID09IE9LXG4gICAgICAgIEBoYW5kLnNldCBAdGhpcnRlZW4ucGxheWVyc1swXS5oYW5kXG4gICAgICAgIEBwaWxlLmhpbnQgW2NhcmRUb1BsYXldLCB4LCB5LCByXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIG1haW4gbG9vcFxuXG4gIHVwZGF0ZTogKGR0KSAtPlxuICAgIEB6b25lcy5sZW5ndGggPSAwICMgZm9yZ2V0IGFib3V0IHpvbmVzIGZyb20gdGhlIGxhc3QgZnJhbWUuIHdlJ3JlIGFib3V0IHRvIG1ha2Ugc29tZSBuZXcgb25lcyFcblxuICAgIHVwZGF0ZWQgPSBmYWxzZVxuICAgIGlmIEB1cGRhdGVNYWluTWVudShkdClcbiAgICAgIHVwZGF0ZWQgPSB0cnVlXG4gICAgaWYgQHVwZGF0ZUdhbWUoZHQpXG4gICAgICB1cGRhdGVkID0gdHJ1ZVxuXG4gICAgcmV0dXJuIHVwZGF0ZWRcblxuICB1cGRhdGVNYWluTWVudTogKGR0KSAtPlxuICAgIHVwZGF0ZWQgPSBmYWxzZVxuICAgIGlmIEBtYWluTWVudS51cGRhdGUoZHQpXG4gICAgICB1cGRhdGVkID0gdHJ1ZVxuICAgIHJldHVybiB1cGRhdGVkXG5cbiAgdXBkYXRlR2FtZTogKGR0KSAtPlxuICAgIHJldHVybiBmYWxzZSBpZiBAdGhpcnRlZW4gPT0gbnVsbFxuXG4gICAgdXBkYXRlZCA9IGZhbHNlXG5cbiAgICBpZiBAcGlsZS51cGRhdGUoZHQpXG4gICAgICB1cGRhdGVkID0gdHJ1ZVxuICAgIGlmIEBwaWxlLnJlYWR5Rm9yTmV4dFRyaWNrKClcbiAgICAgIEBuZXh0QUlUaWNrIC09IGR0XG4gICAgICBpZiBAbmV4dEFJVGljayA8PSAwXG4gICAgICAgIEBuZXh0QUlUaWNrID0gQGFpVGlja1JhdGUoKVxuICAgICAgICBpZiBAdGhpcnRlZW4uYWlUaWNrKClcbiAgICAgICAgICB1cGRhdGVkID0gdHJ1ZVxuICAgIGlmIEBoYW5kLnVwZGF0ZShkdClcbiAgICAgIHVwZGF0ZWQgPSB0cnVlXG5cbiAgICBAcGlsZS5zZXQgQHRoaXJ0ZWVuLnRocm93SUQsIEB0aGlydGVlbi5waWxlLCBAdGhpcnRlZW4ucGlsZVdob1xuXG4gICAgaWYgQHBhdXNlTWVudS51cGRhdGUoZHQpXG4gICAgICB1cGRhdGVkID0gdHJ1ZVxuXG4gICAgIyBAYWRqdXN0QmlkKDApXG4gICAgIyBpZiBAYmlkVUkubWludXMudXBkYXRlKGR0KVxuICAgICMgICB1cGRhdGVkID0gdHJ1ZVxuICAgICMgaWYgQGJpZFVJLnBsdXMudXBkYXRlKGR0KVxuICAgICMgICB1cGRhdGVkID0gdHJ1ZVxuXG4gICAgcmV0dXJuIHVwZGF0ZWRcblxuICByZW5kZXI6IC0+XG4gICAgIyBSZXNldCByZW5kZXIgY29tbWFuZHNcbiAgICBAcmVuZGVyQ29tbWFuZHMubGVuZ3RoID0gMFxuXG4gICAgaWYgQGhvd3RvID4gMFxuICAgICAgQHJlbmRlckhvd3RvKClcbiAgICBlbHNlIGlmIEB0aGlydGVlbiA9PSBudWxsXG4gICAgICBAcmVuZGVyTWFpbk1lbnUoKVxuICAgIGVsc2VcbiAgICAgIEByZW5kZXJHYW1lKClcblxuICAgIHJldHVybiBAcmVuZGVyQ29tbWFuZHNcblxuICByZW5kZXJIb3d0bzogLT5cbiAgICBob3d0b1RleHR1cmUgPSBcImhvd3RvI3tAaG93dG99XCJcbiAgICBAbG9nIFwicmVuZGVyaW5nICN7aG93dG9UZXh0dXJlfVwiXG4gICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcInNvbGlkXCIsIDAsIDAsIEB3aWR0aCwgQGhlaWdodCwgMCwgMCwgMCwgQGNvbG9ycy5ibGFja1xuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgaG93dG9UZXh0dXJlLCAwLCAwLCBAd2lkdGgsIEBhYUhlaWdodCwgMCwgMCwgMCwgQGNvbG9ycy53aGl0ZVxuICAgIGFycm93V2lkdGggPSBAd2lkdGggLyAyMFxuICAgIGFycm93T2Zmc2V0ID0gYXJyb3dXaWR0aCAqIDRcbiAgICBjb2xvciA9IGlmIEBob3d0byA9PSAxIHRoZW4gQGNvbG9ycy5hcnJvd2Nsb3NlIGVsc2UgQGNvbG9ycy5hcnJvd1xuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJhcnJvd0xcIiwgQGNlbnRlci54IC0gYXJyb3dPZmZzZXQsIEBoZWlnaHQsIGFycm93V2lkdGgsIDAsIDAsIDAuNSwgMSwgY29sb3IsID0+XG4gICAgICBAaG93dG8tLVxuICAgICAgaWYgQGhvd3RvIDwgMFxuICAgICAgICBAaG93dG8gPSAwXG4gICAgY29sb3IgPSBpZiBAaG93dG8gPT0gMyB0aGVuIEBjb2xvcnMuYXJyb3djbG9zZSBlbHNlIEBjb2xvcnMuYXJyb3dcbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwiYXJyb3dSXCIsIEBjZW50ZXIueCArIGFycm93T2Zmc2V0LCBAaGVpZ2h0LCBhcnJvd1dpZHRoLCAwLCAwLCAwLjUsIDEsIGNvbG9yLCA9PlxuICAgICAgQGhvd3RvKytcbiAgICAgIGlmIEBob3d0byA+IDNcbiAgICAgICAgQGhvd3RvID0gMFxuXG4gIHJlbmRlck1haW5NZW51OiAtPlxuICAgIEBtYWluTWVudS5yZW5kZXIoKVxuXG4gIHJlbmRlckdhbWU6IC0+XG5cbiAgICAjIGJhY2tncm91bmRcbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwic29saWRcIiwgMCwgMCwgQHdpZHRoLCBAaGVpZ2h0LCAwLCAwLCAwLCBAY29sb3JzLmJhY2tncm91bmRcblxuICAgIHRleHRIZWlnaHQgPSBAYWFIZWlnaHQgLyAyNVxuICAgIHRleHRQYWRkaW5nID0gdGV4dEhlaWdodCAvIDVcbiAgICBjaGFyYWN0ZXJIZWlnaHQgPSBAYWFIZWlnaHQgLyA1XG4gICAgY291bnRIZWlnaHQgPSB0ZXh0SGVpZ2h0XG5cbiAgICAjIExvZ1xuICAgIGZvciBsaW5lLCBpIGluIEB0aGlydGVlbi5sb2dcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCB0ZXh0SGVpZ2h0LCBsaW5lLCAwLCAoaSsxKSAqICh0ZXh0SGVpZ2h0ICsgdGV4dFBhZGRpbmcpLCAwLCAwLCBAY29sb3JzLndoaXRlXG5cbiAgICAjIGlmIEB0aGlydGVlbi5tYXJhdGhvbk1vZGUoKVxuICAgICMgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgdGV4dEhlaWdodCwgXCJNQVJBVEhPTiBNT0RFXCIsIEB3aWR0aCAtIEBwYXVzZUJ1dHRvblNpemUsIDAsIDEsIDAsIEBjb2xvcnMub3JhbmdlXG5cbiAgICBhaVBsYXllcnMgPSBbXG4gICAgICBAdGhpcnRlZW4ucGxheWVyc1sxXVxuICAgICAgQHRoaXJ0ZWVuLnBsYXllcnNbMl1cbiAgICAgIEB0aGlydGVlbi5wbGF5ZXJzWzNdXG4gICAgXVxuXG4gICAgY2hhcmFjdGVyTWFyZ2luID0gY2hhcmFjdGVySGVpZ2h0IC8gMlxuXG4gICAgIyBsZWZ0IHNpZGVcbiAgICBpZiBhaVBsYXllcnNbMF0gIT0gbnVsbFxuICAgICAgY2hhcmFjdGVyID0gYWlDaGFyYWN0ZXJzW2FpUGxheWVyc1swXS5jaGFySURdXG4gICAgICBjaGFyYWN0ZXJXaWR0aCA9IEBzcHJpdGVSZW5kZXJlci5jYWxjV2lkdGgoY2hhcmFjdGVyLnNwcml0ZSwgY2hhcmFjdGVySGVpZ2h0KVxuICAgICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBjaGFyYWN0ZXIuc3ByaXRlLCBjaGFyYWN0ZXJNYXJnaW4sIEBoYW5kLnBsYXlDZWlsaW5nLCAwLCBjaGFyYWN0ZXJIZWlnaHQsIDAsIDAsIDEsIEBjb2xvcnMud2hpdGVcbiAgICAgIEByZW5kZXJDb3VudCBhaVBsYXllcnNbMF0sIGFpUGxheWVyc1swXS5pbmRleCA9PSBAdGhpcnRlZW4udHVybiwgY291bnRIZWlnaHQsIGNoYXJhY3Rlck1hcmdpbiArIChjaGFyYWN0ZXJXaWR0aCAvIDIpLCBAaGFuZC5wbGF5Q2VpbGluZyAtIHRleHRQYWRkaW5nLCAwLjUsIDBcbiAgICAjIHRvcCBzaWRlXG4gICAgaWYgYWlQbGF5ZXJzWzFdICE9IG51bGxcbiAgICAgIGNoYXJhY3RlciA9IGFpQ2hhcmFjdGVyc1thaVBsYXllcnNbMV0uY2hhcklEXVxuICAgICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBjaGFyYWN0ZXIuc3ByaXRlLCBAY2VudGVyLngsIDAsIDAsIGNoYXJhY3RlckhlaWdodCwgMCwgMC41LCAwLCBAY29sb3JzLndoaXRlXG4gICAgICBAcmVuZGVyQ291bnQgYWlQbGF5ZXJzWzFdLCBhaVBsYXllcnNbMV0uaW5kZXggPT0gQHRoaXJ0ZWVuLnR1cm4sIGNvdW50SGVpZ2h0LCBAY2VudGVyLngsIGNoYXJhY3RlckhlaWdodCwgMC41LCAwXG4gICAgIyByaWdodCBzaWRlXG4gICAgaWYgYWlQbGF5ZXJzWzJdICE9IG51bGxcbiAgICAgIGNoYXJhY3RlciA9IGFpQ2hhcmFjdGVyc1thaVBsYXllcnNbMl0uY2hhcklEXVxuICAgICAgY2hhcmFjdGVyV2lkdGggPSBAc3ByaXRlUmVuZGVyZXIuY2FsY1dpZHRoKGNoYXJhY3Rlci5zcHJpdGUsIGNoYXJhY3RlckhlaWdodClcbiAgICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgY2hhcmFjdGVyLnNwcml0ZSwgQHdpZHRoIC0gY2hhcmFjdGVyTWFyZ2luLCBAaGFuZC5wbGF5Q2VpbGluZywgMCwgY2hhcmFjdGVySGVpZ2h0LCAwLCAxLCAxLCBAY29sb3JzLndoaXRlXG4gICAgICBAcmVuZGVyQ291bnQgYWlQbGF5ZXJzWzJdLCBhaVBsYXllcnNbMl0uaW5kZXggPT0gQHRoaXJ0ZWVuLnR1cm4sIGNvdW50SGVpZ2h0LCBAd2lkdGggLSAoY2hhcmFjdGVyTWFyZ2luICsgKGNoYXJhY3RlcldpZHRoIC8gMikpLCBAaGFuZC5wbGF5Q2VpbGluZyAtIHRleHRQYWRkaW5nLCAwLjUsIDBcblxuICAgIEBwaWxlLnJlbmRlcigpXG5cbiAgICBpZiBAdGhpcnRlZW4ud2lubmVyKCkgYW5kIEBwaWxlLnJlc3RpbmcoKVxuICAgICAgbGluZXMgPSBAZ2FtZU92ZXJUZXh0KClcbiAgICAgIGdhbWVPdmVyU2l6ZSA9IEBhYUhlaWdodCAvIDhcbiAgICAgIGdhbWVPdmVyWSA9IEBjZW50ZXIueVxuICAgICAgaWYgbGluZXMubGVuZ3RoID4gMVxuICAgICAgICBnYW1lT3ZlclkgLT0gKGdhbWVPdmVyU2l6ZSA+PiAxKVxuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIGdhbWVPdmVyU2l6ZSwgbGluZXNbMF0sIEBjZW50ZXIueCwgZ2FtZU92ZXJZLCAwLjUsIDAuNSwgQGNvbG9ycy5vcmFuZ2VcbiAgICAgIGlmIGxpbmVzLmxlbmd0aCA+IDFcbiAgICAgICAgZ2FtZU92ZXJZICs9IGdhbWVPdmVyU2l6ZVxuICAgICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgZ2FtZU92ZXJTaXplLCBsaW5lc1sxXSwgQGNlbnRlci54LCBnYW1lT3ZlclksIDAuNSwgMC41LCBAY29sb3JzLm9yYW5nZVxuXG4gICAgICByZXN0YXJ0UXVpdFNpemUgPSBAYWFIZWlnaHQgLyAxMlxuICAgICAgc2hhZG93RGlzdGFuY2UgPSByZXN0YXJ0UXVpdFNpemUgLyA4XG4gICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgcmVzdGFydFF1aXRTaXplLCBcIlBsYXkgQWdhaW5cIiwgc2hhZG93RGlzdGFuY2UgKyBAY2VudGVyLnggLyAyLCBzaGFkb3dEaXN0YW5jZSArIEBoZWlnaHQgLSByZXN0YXJ0UXVpdFNpemUsIDAuNSwgMSwgQGNvbG9ycy5ibGFjaywgPT5cbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCByZXN0YXJ0UXVpdFNpemUsIFwiUGxheSBBZ2FpblwiLCBAY2VudGVyLnggLyAyLCBAaGVpZ2h0IC0gcmVzdGFydFF1aXRTaXplLCAwLjUsIDEsIEBjb2xvcnMuZ29sZCwgPT5cbiAgICAgICAgQHRoaXJ0ZWVuLmRlYWwoKVxuICAgICAgICBAcHJlcGFyZUdhbWUoKVxuXG4gICAgIyBpZiAoQHRoaXJ0ZWVuLnN0YXRlID09IFN0YXRlLlJPVU5EU1VNTUFSWSkgYW5kIEBwaWxlLnJlc3RpbmcoKVxuICAgICMgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgQGFhSGVpZ2h0IC8gOCwgXCJUYXAgZm9yIG5leHQgcm91bmQgLi4uXCIsIEBjZW50ZXIueCwgQGNlbnRlci55LCAwLjUsIDAuNSwgQGNvbG9ycy5vcmFuZ2UsID0+XG4gICAgIyAgICAgaWYgQHRoaXJ0ZWVuLm5leHQoKSA9PSBPS1xuICAgICMgICAgICAgQGhhbmQuc2V0IEB0aGlydGVlbi5wbGF5ZXJzWzBdLmhhbmRcblxuICAgICMgaWYgKEB0aGlydGVlbi5zdGF0ZSA9PSBTdGF0ZS5CSUQpIGFuZCAoQHRoaXJ0ZWVuLnR1cm4gPT0gMClcbiAgICAjICAgQGJpZFVJLm1pbnVzLnJlbmRlcigpXG4gICAgIyAgIEBiaWRVSS5wbHVzLnJlbmRlcigpXG4gICAgIyAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCBAYmlkVGV4dFNpemUsIFwiI3tAYmlkfVwiLCBAY2VudGVyLngsIEBiaWRCdXR0b25ZIC0gKEBiaWRUZXh0U2l6ZSAqIDAuMSksIDAuNSwgMC41LCBAY29sb3JzLndoaXRlLCA9PlxuICAgICMgICAgIEBhdHRlbXB0QmlkKClcbiAgICAjICAgYmlkQnV0dG9uSGVpZ2h0ID0gQGFhSGVpZ2h0IC8gMTJcbiAgICAjICAgYmlkU2l6ZSA9IEBmb250UmVuZGVyZXIuc2l6ZShAZm9udCwgYmlkQnV0dG9uSGVpZ2h0LCBcIkJpZFwiKVxuICAgICMgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwic29saWRcIiwgQGNlbnRlci54LCAoQGJpZEJ1dHRvblkgKyBAYmlkVGV4dFNpemUpICsgKGJpZFNpemUuaCAqIDAuMiksIGJpZFNpemUudyAqIDMsIGJpZFNpemUuaCAqIDEuNSwgMCwgMC41LCAwLjUsIEBjb2xvcnMuYmlkLCA9PlxuICAgICMgICAgIEBhdHRlbXB0QmlkKClcbiAgICAjICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIGJpZEJ1dHRvbkhlaWdodCwgXCJCaWRcIiwgQGNlbnRlci54LCBAYmlkQnV0dG9uWSArIEBiaWRUZXh0U2l6ZSwgMC41LCAwLjUsIEBjb2xvcnMud2hpdGVcblxuICAgICMgY2FyZCBhcmVhXG4gICAgIyBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwic29saWRcIiwgMCwgQGhlaWdodCwgQHdpZHRoLCBAaGVpZ2h0IC0gQGhhbmQucGxheUNlaWxpbmcsIDAsIDAsIDEsIEBjb2xvcnMuaGFuZGFyZWFcbiAgICBAaGFuZC5yZW5kZXIoKVxuICAgIEByZW5kZXJDb3VudCBAdGhpcnRlZW4ucGxheWVyc1swXSwgMCA9PSBAdGhpcnRlZW4udHVybiwgY291bnRIZWlnaHQsIEBjZW50ZXIueCwgQGhlaWdodCwgMC41LCAxXG5cbiAgICAjIEhlYWRsaW5lIChpbmNsdWRlcyBlcnJvcilcbiAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgdGV4dEhlaWdodCwgQGNhbGNIZWFkbGluZSgpLCAwLCAwLCAwLCAwLCBAY29sb3JzLmxpZ2h0Z3JheVxuXG4gICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcInBhdXNlXCIsIEB3aWR0aCwgMCwgMCwgQHBhdXNlQnV0dG9uU2l6ZSwgMCwgMSwgMCwgQGNvbG9ycy53aGl0ZSwgPT5cbiAgICAgIEBwYXVzZWQgPSB0cnVlXG5cbiAgICBpZiBAcGF1c2VkXG4gICAgICBAcGF1c2VNZW51LnJlbmRlcigpXG5cbiAgICByZXR1cm5cblxuICByZW5kZXJDb3VudDogKHBsYXllciwgbXlUdXJuLCBjb3VudEhlaWdodCwgeCwgeSwgYW5jaG9yeCwgYW5jaG9yeSkgLT5cbiAgICBpZiBteVR1cm5cbiAgICAgIG5hbWVDb2xvciA9IFwiYGZmNzcwMGBcIlxuICAgIGVsc2VcbiAgICAgIG5hbWVDb2xvciA9IFwiXCJcbiAgICBuYW1lU3RyaW5nID0gXCIgI3tuYW1lQ29sb3J9I3twbGF5ZXIubmFtZX1gYCBcIlxuICAgIGNhcmRDb3VudCA9IHBsYXllci5oYW5kLmxlbmd0aFxuICAgIGlmIGNhcmRDb3VudCA+IDFcbiAgICAgIHRyaWNrQ29sb3IgPSBcImZmZmYzM1wiXG4gICAgZWxzZVxuICAgICAgdHJpY2tDb2xvciA9IFwiZmYzMzMzXCJcbiAgICBjb3VudFN0cmluZyA9IFwiWyBgI3t0cmlja0NvbG9yfWAje2NhcmRDb3VudH1gYCBdXCJcblxuICAgIG5hbWVTaXplID0gQGZvbnRSZW5kZXJlci5zaXplKEBmb250LCBjb3VudEhlaWdodCwgbmFtZVN0cmluZylcbiAgICBjb3VudFNpemUgPSBAZm9udFJlbmRlcmVyLnNpemUoQGZvbnQsIGNvdW50SGVpZ2h0LCBjb3VudFN0cmluZylcbiAgICBpZiBuYW1lU2l6ZS53ID4gY291bnRTaXplLndcbiAgICAgIGNvdW50U2l6ZS53ID0gbmFtZVNpemUud1xuICAgIG5hbWVZID0geVxuICAgIGNvdW50WSA9IHlcbiAgICBpZiBhbmNob3J5ID4gMFxuICAgICAgbmFtZVkgLT0gY291bnRIZWlnaHRcbiAgICBlbHNlXG4gICAgICBjb3VudFkgKz0gY291bnRIZWlnaHRcbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwic29saWRcIiwgeCwgeSwgY291bnRTaXplLncsIGNvdW50U2l6ZS5oICogMiwgMCwgYW5jaG9yeCwgYW5jaG9yeSwgQGNvbG9ycy5vdmVybGF5XG4gICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIGNvdW50SGVpZ2h0LCBuYW1lU3RyaW5nLCB4LCBuYW1lWSwgYW5jaG9yeCwgYW5jaG9yeSwgQGNvbG9ycy53aGl0ZVxuICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCBjb3VudEhlaWdodCwgY291bnRTdHJpbmcsIHgsIGNvdW50WSwgYW5jaG9yeCwgYW5jaG9yeSwgQGNvbG9ycy53aGl0ZVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyByZW5kZXJpbmcgYW5kIHpvbmVzXG5cbiAgZHJhd0ltYWdlOiAodGV4dHVyZSwgc3gsIHN5LCBzdywgc2gsIGR4LCBkeSwgZHcsIGRoLCByb3QsIGFuY2hvcngsIGFuY2hvcnksIHIsIGcsIGIsIGEsIGNiKSAtPlxuICAgIEByZW5kZXJDb21tYW5kcy5wdXNoIEB0ZXh0dXJlc1t0ZXh0dXJlXSwgc3gsIHN5LCBzdywgc2gsIGR4LCBkeSwgZHcsIGRoLCByb3QsIGFuY2hvcngsIGFuY2hvcnksIHIsIGcsIGIsIGFcblxuICAgIGlmIGNiP1xuICAgICAgIyBjYWxsZXIgd2FudHMgdG8gcmVtZW1iZXIgd2hlcmUgdGhpcyB3YXMgZHJhd24sIGFuZCB3YW50cyB0byBiZSBjYWxsZWQgYmFjayBpZiBpdCBpcyBldmVyIHRvdWNoZWRcbiAgICAgICMgVGhpcyBpcyBjYWxsZWQgYSBcInpvbmVcIi4gU2luY2Ugem9uZXMgYXJlIHRyYXZlcnNlZCBpbiByZXZlcnNlIG9yZGVyLCB0aGUgbmF0dXJhbCBvdmVybGFwIG9mXG4gICAgICAjIGEgc2VyaWVzIG9mIHJlbmRlcnMgaXMgcmVzcGVjdGVkIGFjY29yZGluZ2x5LlxuICAgICAgYW5jaG9yT2Zmc2V0WCA9IC0xICogYW5jaG9yeCAqIGR3XG4gICAgICBhbmNob3JPZmZzZXRZID0gLTEgKiBhbmNob3J5ICogZGhcbiAgICAgIHpvbmUgPVxuICAgICAgICAjIGNlbnRlciAoWCxZKSBhbmQgcmV2ZXJzZWQgcm90YXRpb24sIHVzZWQgdG8gcHV0IHRoZSBjb29yZGluYXRlIGluIGxvY2FsIHNwYWNlIHRvIHRoZSB6b25lXG4gICAgICAgIGN4OiAgZHhcbiAgICAgICAgY3k6ICBkeVxuICAgICAgICByb3Q6IHJvdCAqIC0xXG4gICAgICAgICMgdGhlIGF4aXMgYWxpZ25lZCBib3VuZGluZyBib3ggdXNlZCBmb3IgZGV0ZWN0aW9uIG9mIGEgbG9jYWxzcGFjZSBjb29yZFxuICAgICAgICBsOiAgIGFuY2hvck9mZnNldFhcbiAgICAgICAgdDogICBhbmNob3JPZmZzZXRZXG4gICAgICAgIHI6ICAgYW5jaG9yT2Zmc2V0WCArIGR3XG4gICAgICAgIGI6ICAgYW5jaG9yT2Zmc2V0WSArIGRoXG4gICAgICAgICMgY2FsbGJhY2sgdG8gY2FsbCBpZiB0aGUgem9uZSBpcyBjbGlja2VkIG9uXG4gICAgICAgIGNiOiAgY2JcbiAgICAgIEB6b25lcy5wdXNoIHpvbmVcblxuICBjaGVja1pvbmVzOiAoeCwgeSkgLT5cbiAgICBmb3Igem9uZSBpbiBAem9uZXMgYnkgLTFcbiAgICAgICMgbW92ZSBjb29yZCBpbnRvIHNwYWNlIHJlbGF0aXZlIHRvIHRoZSBxdWFkLCB0aGVuIHJvdGF0ZSBpdCB0byBtYXRjaFxuICAgICAgdW5yb3RhdGVkTG9jYWxYID0geCAtIHpvbmUuY3hcbiAgICAgIHVucm90YXRlZExvY2FsWSA9IHkgLSB6b25lLmN5XG4gICAgICBsb2NhbFggPSB1bnJvdGF0ZWRMb2NhbFggKiBNYXRoLmNvcyh6b25lLnJvdCkgLSB1bnJvdGF0ZWRMb2NhbFkgKiBNYXRoLnNpbih6b25lLnJvdClcbiAgICAgIGxvY2FsWSA9IHVucm90YXRlZExvY2FsWCAqIE1hdGguc2luKHpvbmUucm90KSArIHVucm90YXRlZExvY2FsWSAqIE1hdGguY29zKHpvbmUucm90KVxuICAgICAgaWYgKGxvY2FsWCA8IHpvbmUubCkgb3IgKGxvY2FsWCA+IHpvbmUucikgb3IgKGxvY2FsWSA8IHpvbmUudCkgb3IgKGxvY2FsWSA+IHpvbmUuYilcbiAgICAgICAgIyBvdXRzaWRlIG9mIG9yaWVudGVkIGJvdW5kaW5nIGJveFxuICAgICAgICBjb250aW51ZVxuICAgICAgem9uZS5jYih4LCB5KVxuICAgICAgcmV0dXJuIHRydWVcbiAgICByZXR1cm4gZmFsc2VcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbm1vZHVsZS5leHBvcnRzID0gR2FtZVxuIiwiQW5pbWF0aW9uID0gcmVxdWlyZSAnLi9BbmltYXRpb24nXG5cbkNBUkRfSU1BR0VfVyA9IDEyMFxuQ0FSRF9JTUFHRV9IID0gMTYyXG5DQVJEX0lNQUdFX09GRl9YID0gNFxuQ0FSRF9JTUFHRV9PRkZfWSA9IDRcbkNBUkRfSU1BR0VfQURWX1ggPSBDQVJEX0lNQUdFX1dcbkNBUkRfSU1BR0VfQURWX1kgPSBDQVJEX0lNQUdFX0hcbkNBUkRfUkVOREVSX1NDQUxFID0gMC4zNSAgICAgICAgICAgICAgICAgICMgY2FyZCBoZWlnaHQgY29lZmZpY2llbnQgZnJvbSB0aGUgc2NyZWVuJ3MgaGVpZ2h0XG5DQVJEX0hBTkRfQ1VSVkVfRElTVF9GQUNUT1IgPSAzLjUgICAgICAgICAjIGZhY3RvciB3aXRoIHNjcmVlbiBoZWlnaHQgdG8gZmlndXJlIG91dCBjZW50ZXIgb2YgYXJjLiBiaWdnZXIgbnVtYmVyIGlzIGxlc3MgYXJjXG5DQVJEX0hPTERJTkdfUk9UX09SREVSID0gTWF0aC5QSSAvIDEyICAgICAjIGRlc2lyZWQgcm90YXRpb24gb2YgdGhlIGNhcmQgd2hlbiBiZWluZyBkcmFnZ2VkIGFyb3VuZCBmb3Igb3JkZXJpbmcncyBzYWtlXG5DQVJEX0hPTERJTkdfUk9UX1BMQVkgPSAtMSAqIE1hdGguUEkgLyAxMiAjIGRlc2lyZWQgcm90YXRpb24gb2YgdGhlIGNhcmQgd2hlbiBiZWluZyBkcmFnZ2VkIGFyb3VuZCB3aXRoIGludGVudCB0byBwbGF5XG5DQVJEX1BMQVlfQ0VJTElORyA9IDAuNjUgICAgICAgICAgICAgICAgICAjIGhvdyBtdWNoIG9mIHRoZSB0b3Agb2YgdGhlIHNjcmVlbiByZXByZXNlbnRzIFwiSSB3YW50IHRvIHBsYXkgdGhpc1wiIHZzIFwiSSB3YW50IHRvIHJlb3JkZXJcIlxuXG5OT19DQVJEID0gLTFcblxuIyB0YWtlbiBmcm9tIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTIxMTIxMi9ob3ctdG8tY2FsY3VsYXRlLWFuLWFuZ2xlLWZyb20tdGhyZWUtcG9pbnRzXG4jIHVzZXMgbGF3IG9mIGNvc2luZXMgdG8gZmlndXJlIG91dCB0aGUgaGFuZCBhcmMgYW5nbGVcbmZpbmRBbmdsZSA9IChwMCwgcDEsIHAyKSAtPlxuICAgIGEgPSBNYXRoLnBvdyhwMS54IC0gcDIueCwgMikgKyBNYXRoLnBvdyhwMS55IC0gcDIueSwgMilcbiAgICBiID0gTWF0aC5wb3cocDEueCAtIHAwLngsIDIpICsgTWF0aC5wb3cocDEueSAtIHAwLnksIDIpXG4gICAgYyA9IE1hdGgucG93KHAyLnggLSBwMC54LCAyKSArIE1hdGgucG93KHAyLnkgLSBwMC55LCAyKVxuICAgIHJldHVybiBNYXRoLmFjb3MoIChhK2ItYykgLyBNYXRoLnNxcnQoNCphKmIpIClcblxuY2FsY0Rpc3RhbmNlID0gKHAwLCBwMSkgLT5cbiAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyhwMS54IC0gcDAueCwgMikgKyBNYXRoLnBvdyhwMS55IC0gcDAueSwgMikpXG5cbmNhbGNEaXN0YW5jZVNxdWFyZWQgPSAoeDAsIHkwLCB4MSwgeTEpIC0+XG4gIHJldHVybiBNYXRoLnBvdyh4MSAtIHgwLCAyKSArIE1hdGgucG93KHkxIC0geTAsIDIpXG5cbmNsYXNzIEhhbmRcbiAgY29uc3RydWN0b3I6IChAZ2FtZSkgLT5cbiAgICBAY2FyZHMgPSBbXVxuICAgIEBhbmltcyA9IHt9XG4gICAgQHBvc2l0aW9uQ2FjaGUgPSB7fVxuXG4gICAgQGRyYWdJbmRleFN0YXJ0ID0gTk9fQ0FSRFxuICAgIEBkcmFnSW5kZXhDdXJyZW50ID0gTk9fQ0FSRFxuICAgIEBkcmFnWCA9IDBcbiAgICBAZHJhZ1kgPSAwXG5cbiAgICAjIHJlbmRlciAvIGFuaW0gbWV0cmljc1xuICAgIEBjYXJkU3BlZWQgPVxuICAgICAgcjogTWF0aC5QSSAqIDJcbiAgICAgIHM6IDIuNVxuICAgICAgdDogMiAqIEBnYW1lLndpZHRoXG4gICAgQHBsYXlDZWlsaW5nID0gQ0FSRF9QTEFZX0NFSUxJTkcgKiBAZ2FtZS5oZWlnaHRcbiAgICBAY2FyZEhlaWdodCA9IE1hdGguZmxvb3IoQGdhbWUuaGVpZ2h0ICogQ0FSRF9SRU5ERVJfU0NBTEUpXG4gICAgQGNhcmRXaWR0aCAgPSBNYXRoLmZsb29yKEBjYXJkSGVpZ2h0ICogQ0FSRF9JTUFHRV9XIC8gQ0FSRF9JTUFHRV9IKVxuICAgIEBjYXJkSGFsZkhlaWdodCA9IEBjYXJkSGVpZ2h0ID4+IDFcbiAgICBAY2FyZEhhbGZXaWR0aCAgPSBAY2FyZFdpZHRoID4+IDFcbiAgICBhcmNNYXJnaW4gPSBAY2FyZFdpZHRoIC8gMlxuICAgIGFyY1ZlcnRpY2FsQmlhcyA9IEBjYXJkSGVpZ2h0IC8gNTBcbiAgICBib3R0b21MZWZ0ICA9IHsgeDogYXJjTWFyZ2luLCAgICAgICAgICAgICAgICB5OiBhcmNWZXJ0aWNhbEJpYXMgKyBAZ2FtZS5oZWlnaHQgfVxuICAgIGJvdHRvbVJpZ2h0ID0geyB4OiBAZ2FtZS53aWR0aCAtIGFyY01hcmdpbiwgeTogYXJjVmVydGljYWxCaWFzICsgQGdhbWUuaGVpZ2h0IH1cbiAgICBAaGFuZENlbnRlciA9IHsgeDogQGdhbWUud2lkdGggLyAyLCAgICAgICAgIHk6IGFyY1ZlcnRpY2FsQmlhcyArIEBnYW1lLmhlaWdodCArIChDQVJEX0hBTkRfQ1VSVkVfRElTVF9GQUNUT1IgKiBAZ2FtZS5oZWlnaHQpIH1cbiAgICBAaGFuZEFuZ2xlID0gZmluZEFuZ2xlKGJvdHRvbUxlZnQsIEBoYW5kQ2VudGVyLCBib3R0b21SaWdodClcbiAgICBAaGFuZERpc3RhbmNlID0gY2FsY0Rpc3RhbmNlKGJvdHRvbUxlZnQsIEBoYW5kQ2VudGVyKVxuICAgIEBoYW5kQW5nbGVBZHZhbmNlTWF4ID0gQGhhbmRBbmdsZSAvIDcgIyBuZXZlciBzcGFjZSB0aGUgY2FyZHMgbW9yZSB0aGFuIHdoYXQgdGhleSdkIGxvb2sgbGlrZSB3aXRoIHRoaXMgaGFuZHNpemVcbiAgICBAZ2FtZS5sb2cgXCJIYW5kIGRpc3RhbmNlICN7QGhhbmREaXN0YW5jZX0sIGFuZ2xlICN7QGhhbmRBbmdsZX0gKHNjcmVlbiBoZWlnaHQgI3tAZ2FtZS5oZWlnaHR9KVwiXG5cbiAgc2V0OiAoY2FyZHMpIC0+XG4gICAgQGNhcmRzID0gY2FyZHMuc2xpY2UoMClcbiAgICBAc3luY0FuaW1zKClcbiAgICBAd2FycCgpXG5cbiAgc3luY0FuaW1zOiAtPlxuICAgIHNlZW4gPSB7fVxuICAgIGZvciBjYXJkIGluIEBjYXJkc1xuICAgICAgc2VlbltjYXJkXSsrXG4gICAgICBpZiBub3QgQGFuaW1zW2NhcmRdXG4gICAgICAgIEBhbmltc1tjYXJkXSA9IG5ldyBBbmltYXRpb24ge1xuICAgICAgICAgIHNwZWVkOiBAY2FyZFNwZWVkXG4gICAgICAgICAgeDogMFxuICAgICAgICAgIHk6IDBcbiAgICAgICAgICByOiAwXG4gICAgICAgIH1cbiAgICB0b1JlbW92ZSA9IFtdXG4gICAgZm9yIGNhcmQsYW5pbSBvZiBAYW5pbXNcbiAgICAgIGlmIG5vdCBzZWVuLmhhc093blByb3BlcnR5KGNhcmQpXG4gICAgICAgIHRvUmVtb3ZlLnB1c2ggY2FyZFxuICAgIGZvciBjYXJkIGluIHRvUmVtb3ZlXG4gICAgICAjIEBnYW1lLmxvZyBcInJlbW92aW5nIGFuaW0gZm9yICN7Y2FyZH1cIlxuICAgICAgZGVsZXRlIEBhbmltc1tjYXJkXVxuXG4gICAgQHVwZGF0ZVBvc2l0aW9ucygpXG5cbiAgY2FsY0RyYXduSGFuZDogLT5cbiAgICBkcmF3bkhhbmQgPSBbXVxuICAgIGZvciBjYXJkLGkgaW4gQGNhcmRzXG4gICAgICBpZiBpICE9IEBkcmFnSW5kZXhTdGFydFxuICAgICAgICBkcmF3bkhhbmQucHVzaCBjYXJkXG5cbiAgICBpZiBAZHJhZ0luZGV4Q3VycmVudCAhPSBOT19DQVJEXG4gICAgICBkcmF3bkhhbmQuc3BsaWNlIEBkcmFnSW5kZXhDdXJyZW50LCAwLCBAY2FyZHNbQGRyYWdJbmRleFN0YXJ0XVxuICAgIHJldHVybiBkcmF3bkhhbmRcblxuICB3YW50c1RvUGxheURyYWdnZWRDYXJkOiAtPlxuICAgIHJldHVybiBmYWxzZSBpZiBAZHJhZ0luZGV4U3RhcnQgPT0gTk9fQ0FSRFxuICAgIHJldHVybiBAZHJhZ1kgPCBAcGxheUNlaWxpbmdcblxuICB1cGRhdGVQb3NpdGlvbnM6IC0+XG4gICAgZHJhd25IYW5kID0gQGNhbGNEcmF3bkhhbmQoKVxuICAgIHdhbnRzVG9QbGF5ID0gQHdhbnRzVG9QbGF5RHJhZ2dlZENhcmQoKVxuICAgIGRlc2lyZWRSb3RhdGlvbiA9IENBUkRfSE9MRElOR19ST1RfT1JERVJcbiAgICBwb3NpdGlvbkNvdW50ID0gZHJhd25IYW5kLmxlbmd0aFxuICAgIGlmIHdhbnRzVG9QbGF5XG4gICAgICBkZXNpcmVkUm90YXRpb24gPSBDQVJEX0hPTERJTkdfUk9UX1BMQVlcbiAgICAgIHBvc2l0aW9uQ291bnQtLVxuICAgIHBvc2l0aW9ucyA9IEBjYWxjUG9zaXRpb25zKHBvc2l0aW9uQ291bnQpXG4gICAgZHJhd0luZGV4ID0gMFxuICAgIGZvciBjYXJkLGkgaW4gZHJhd25IYW5kXG4gICAgICBhbmltID0gQGFuaW1zW2NhcmRdXG4gICAgICBpZiBpID09IEBkcmFnSW5kZXhDdXJyZW50XG4gICAgICAgIGFuaW0ucmVxLnggPSBAZHJhZ1hcbiAgICAgICAgYW5pbS5yZXEueSA9IEBkcmFnWVxuICAgICAgICBhbmltLnJlcS5yID0gZGVzaXJlZFJvdGF0aW9uXG4gICAgICAgIGlmIG5vdCB3YW50c1RvUGxheVxuICAgICAgICAgIGRyYXdJbmRleCsrXG4gICAgICBlbHNlXG4gICAgICAgIHBvcyA9IHBvc2l0aW9uc1tkcmF3SW5kZXhdXG4gICAgICAgIGFuaW0ucmVxLnggPSBwb3MueFxuICAgICAgICBhbmltLnJlcS55ID0gcG9zLnlcbiAgICAgICAgYW5pbS5yZXEuciA9IHBvcy5yXG4gICAgICAgIGRyYXdJbmRleCsrXG5cbiAgIyBpbW1lZGlhdGVseSB3YXJwIGFsbCBjYXJkcyB0byB3aGVyZSB0aGV5IHNob3VsZCBiZVxuICB3YXJwOiAtPlxuICAgIGZvciBjYXJkLGFuaW0gb2YgQGFuaW1zXG4gICAgICBhbmltLndhcnAoKVxuXG4gICMgcmVvcmRlciB0aGUgaGFuZCBiYXNlZCBvbiB0aGUgZHJhZyBsb2NhdGlvbiBvZiB0aGUgaGVsZCBjYXJkXG4gIHJlb3JkZXI6IC0+XG4gICAgcmV0dXJuIGlmIEBkcmFnSW5kZXhTdGFydCA9PSBOT19DQVJEXG4gICAgcmV0dXJuIGlmIEBjYXJkcy5sZW5ndGggPCAyICMgbm90aGluZyB0byByZW9yZGVyXG4gICAgcG9zaXRpb25zID0gQGNhbGNQb3NpdGlvbnMoQGNhcmRzLmxlbmd0aClcbiAgICBjbG9zZXN0SW5kZXggPSAwXG4gICAgY2xvc2VzdERpc3QgPSBAZ2FtZS53aWR0aCAqIEBnYW1lLmhlaWdodCAjIHNvbWV0aGluZyBpbXBvc3NpYmx5IGxhcmdlXG4gICAgZm9yIHBvcywgaW5kZXggaW4gcG9zaXRpb25zXG4gICAgICBkaXN0ID0gY2FsY0Rpc3RhbmNlU3F1YXJlZChwb3MueCwgcG9zLnksIEBkcmFnWCwgQGRyYWdZKVxuICAgICAgaWYgY2xvc2VzdERpc3QgPiBkaXN0XG4gICAgICAgIGNsb3Nlc3REaXN0ID0gZGlzdFxuICAgICAgICBjbG9zZXN0SW5kZXggPSBpbmRleFxuICAgIEBkcmFnSW5kZXhDdXJyZW50ID0gY2xvc2VzdEluZGV4XG5cbiAgZG93bjogKEBkcmFnWCwgQGRyYWdZLCBpbmRleCkgLT5cbiAgICBAdXAoQGRyYWdYLCBAZHJhZ1kpICMgZW5zdXJlIHdlIGxldCBnbyBvZiB0aGUgcHJldmlvdXMgY2FyZCBpbiBjYXNlIHRoZSBldmVudHMgYXJlIGR1bWJcbiAgICBAZ2FtZS5sb2cgXCJwaWNraW5nIHVwIGNhcmQgaW5kZXggI3tpbmRleH1cIlxuICAgIEBkcmFnSW5kZXhTdGFydCA9IGluZGV4XG4gICAgQGRyYWdJbmRleEN1cnJlbnQgPSBpbmRleFxuICAgIEB1cGRhdGVQb3NpdGlvbnMoKVxuXG4gIG1vdmU6IChAZHJhZ1gsIEBkcmFnWSkgLT5cbiAgICByZXR1cm4gaWYgQGRyYWdJbmRleFN0YXJ0ID09IE5PX0NBUkRcbiAgICAjQGdhbWUubG9nIFwiZHJhZ2dpbmcgYXJvdW5kIGNhcmQgaW5kZXggI3tAZHJhZ0luZGV4Q3VycmVudH1cIlxuICAgIEByZW9yZGVyKClcbiAgICBAdXBkYXRlUG9zaXRpb25zKClcblxuICB1cDogKEBkcmFnWCwgQGRyYWdZKSAtPlxuICAgIHJldHVybiBpZiBAZHJhZ0luZGV4U3RhcnQgPT0gTk9fQ0FSRFxuICAgIEByZW9yZGVyKClcbiAgICBpZiBAd2FudHNUb1BsYXlEcmFnZ2VkQ2FyZCgpXG4gICAgICBAZ2FtZS5sb2cgXCJ0cnlpbmcgdG8gcGxheSBhICN7QGNhcmRzW0BkcmFnSW5kZXhTdGFydF19IGZyb20gaW5kZXggI3tAZHJhZ0luZGV4U3RhcnR9XCJcbiAgICAgIGNhcmRJbmRleCA9IEBkcmFnSW5kZXhTdGFydFxuICAgICAgY2FyZCA9IEBjYXJkc1tjYXJkSW5kZXhdXG4gICAgICBhbmltID0gQGFuaW1zW2NhcmRdXG4gICAgICBAZHJhZ0luZGV4U3RhcnQgPSBOT19DQVJEXG4gICAgICBAZHJhZ0luZGV4Q3VycmVudCA9IE5PX0NBUkRcbiAgICAgIEBnYW1lLnBsYXkgY2FyZCwgYW5pbS5jdXIueCwgYW5pbS5jdXIueSwgYW5pbS5jdXIuciwgY2FyZEluZGV4XG4gICAgZWxzZVxuICAgICAgQGdhbWUubG9nIFwidHJ5aW5nIHRvIHJlb3JkZXIgI3tAY2FyZHNbQGRyYWdJbmRleFN0YXJ0XX0gaW50byBpbmRleCAje0BkcmFnSW5kZXhDdXJyZW50fVwiXG4gICAgICBAY2FyZHMgPSBAY2FsY0RyYXduSGFuZCgpICMgaXMgdGhpcyByaWdodD9cblxuICAgIEBkcmFnSW5kZXhTdGFydCA9IE5PX0NBUkRcbiAgICBAZHJhZ0luZGV4Q3VycmVudCA9IE5PX0NBUkRcbiAgICBAdXBkYXRlUG9zaXRpb25zKClcblxuICB1cGRhdGU6IChkdCkgLT5cbiAgICB1cGRhdGVkID0gZmFsc2VcbiAgICBmb3IgY2FyZCxhbmltIG9mIEBhbmltc1xuICAgICAgaWYgYW5pbS51cGRhdGUoZHQpXG4gICAgICAgIHVwZGF0ZWQgPSB0cnVlXG4gICAgcmV0dXJuIHVwZGF0ZWRcblxuICByZW5kZXI6IC0+XG4gICAgcmV0dXJuIGlmIEBjYXJkcy5sZW5ndGggPT0gMFxuICAgIGRyYXduSGFuZCA9IEBjYWxjRHJhd25IYW5kKClcbiAgICBmb3IgdiwgaW5kZXggaW4gZHJhd25IYW5kXG4gICAgICBjb250aW51ZSBpZiB2ID09IE5PX0NBUkRcbiAgICAgIGFuaW0gPSBAYW5pbXNbdl1cbiAgICAgIGRvIChhbmltLCBpbmRleCkgPT5cbiAgICAgICAgQHJlbmRlckNhcmQgdiwgYW5pbS5jdXIueCwgYW5pbS5jdXIueSwgYW5pbS5jdXIuciwgMSwgKGNsaWNrWCwgY2xpY2tZKSA9PlxuICAgICAgICAgIEBkb3duKGNsaWNrWCwgY2xpY2tZLCBpbmRleClcblxuICByZW5kZXJDYXJkOiAodiwgeCwgeSwgcm90LCBzY2FsZSwgY2IpIC0+XG4gICAgcm90ID0gMCBpZiBub3Qgcm90XG4gICAgcmFuayA9IE1hdGguZmxvb3IodiAvIDQpXG4gICAgc3VpdCA9IE1hdGguZmxvb3IodiAlIDQpXG5cbiAgICBAZ2FtZS5kcmF3SW1hZ2UgXCJjYXJkc1wiLFxuICAgIENBUkRfSU1BR0VfT0ZGX1ggKyAoQ0FSRF9JTUFHRV9BRFZfWCAqIHJhbmspLCBDQVJEX0lNQUdFX09GRl9ZICsgKENBUkRfSU1BR0VfQURWX1kgKiBzdWl0KSwgQ0FSRF9JTUFHRV9XLCBDQVJEX0lNQUdFX0gsXG4gICAgeCwgeSwgQGNhcmRXaWR0aCAqIHNjYWxlLCBAY2FyZEhlaWdodCAqIHNjYWxlLFxuICAgIHJvdCwgMC41LCAwLjUsIDEsMSwxLDEsIGNiXG5cbiAgY2FsY1Bvc2l0aW9uczogKGhhbmRTaXplKSAtPlxuICAgIGlmIEBwb3NpdGlvbkNhY2hlLmhhc093blByb3BlcnR5KGhhbmRTaXplKVxuICAgICAgcmV0dXJuIEBwb3NpdGlvbkNhY2hlW2hhbmRTaXplXVxuICAgIHJldHVybiBbXSBpZiBoYW5kU2l6ZSA9PSAwXG5cbiAgICBhZHZhbmNlID0gQGhhbmRBbmdsZSAvIGhhbmRTaXplXG4gICAgaWYgYWR2YW5jZSA+IEBoYW5kQW5nbGVBZHZhbmNlTWF4XG4gICAgICBhZHZhbmNlID0gQGhhbmRBbmdsZUFkdmFuY2VNYXhcbiAgICBhbmdsZVNwcmVhZCA9IGFkdmFuY2UgKiBoYW5kU2l6ZSAgICAgICAgICAgICAgICAjIGhvdyBtdWNoIG9mIHRoZSBhbmdsZSB3ZSBwbGFuIG9uIHVzaW5nXG4gICAgYW5nbGVMZWZ0b3ZlciA9IEBoYW5kQW5nbGUgLSBhbmdsZVNwcmVhZCAgICAgICAgIyBhbW91bnQgb2YgYW5nbGUgd2UncmUgbm90IHVzaW5nLCBhbmQgbmVlZCB0byBwYWQgc2lkZXMgd2l0aCBldmVubHlcbiAgICBjdXJyZW50QW5nbGUgPSAtMSAqIChAaGFuZEFuZ2xlIC8gMikgICAgICAgICAgICAjIG1vdmUgdG8gdGhlIGxlZnQgc2lkZSBvZiBvdXIgYW5nbGVcbiAgICBjdXJyZW50QW5nbGUgKz0gYW5nbGVMZWZ0b3ZlciAvIDIgICAgICAgICAgICAgICAjIC4uLiBhbmQgYWR2YW5jZSBwYXN0IGhhbGYgb2YgdGhlIHBhZGRpbmdcbiAgICBjdXJyZW50QW5nbGUgKz0gYWR2YW5jZSAvIDIgICAgICAgICAgICAgICAgICAgICAjIC4uLiBhbmQgY2VudGVyIHRoZSBjYXJkcyBpbiB0aGUgYW5nbGVcblxuICAgIHBvc2l0aW9ucyA9IFtdXG4gICAgZm9yIGkgaW4gWzAuLi5oYW5kU2l6ZV1cbiAgICAgIHggPSBAaGFuZENlbnRlci54IC0gTWF0aC5jb3MoKE1hdGguUEkgLyAyKSArIGN1cnJlbnRBbmdsZSkgKiBAaGFuZERpc3RhbmNlXG4gICAgICB5ID0gQGhhbmRDZW50ZXIueSAtIE1hdGguc2luKChNYXRoLlBJIC8gMikgKyBjdXJyZW50QW5nbGUpICogQGhhbmREaXN0YW5jZVxuICAgICAgY3VycmVudEFuZ2xlICs9IGFkdmFuY2VcbiAgICAgIHBvc2l0aW9ucy5wdXNoIHtcbiAgICAgICAgeDogeFxuICAgICAgICB5OiB5XG4gICAgICAgIHI6IGN1cnJlbnRBbmdsZSAtIGFkdmFuY2VcbiAgICAgIH1cblxuICAgIEBwb3NpdGlvbkNhY2hlW2hhbmRTaXplXSA9IHBvc2l0aW9uc1xuICAgIHJldHVybiBwb3NpdGlvbnNcblxuICByZW5kZXJIYW5kOiAtPlxuICAgIHJldHVybiBpZiBAaGFuZC5sZW5ndGggPT0gMFxuICAgIGZvciB2LGluZGV4IGluIEBoYW5kXG4gICAgICBkbyAoaW5kZXgpID0+XG4gICAgICAgIEByZW5kZXJDYXJkIHYsIHgsIHksIGN1cnJlbnRBbmdsZSwgMSwgKGNsaWNrWCwgY2xpY2tZKSA9PlxuICAgICAgICAgIEBkb3duKGNsaWNrWCwgY2xpY2tZLCBpbmRleClcblxubW9kdWxlLmV4cG9ydHMgPSBIYW5kXG4iLCJCdXR0b24gPSByZXF1aXJlICcuL0J1dHRvbidcblxuY2xhc3MgTWVudVxuICBjb25zdHJ1Y3RvcjogKEBnYW1lLCBAdGl0bGUsIEBiYWNrZ3JvdW5kLCBAY29sb3IsIEBhY3Rpb25zKSAtPlxuICAgIEBidXR0b25zID0gW11cbiAgICBAYnV0dG9uTmFtZXMgPSBbXCJidXR0b24wXCIsIFwiYnV0dG9uMVwiXVxuXG4gICAgYnV0dG9uU2l6ZSA9IEBnYW1lLmhlaWdodCAvIDE1XG4gICAgQGJ1dHRvblN0YXJ0WSA9IEBnYW1lLmhlaWdodCAvIDVcblxuICAgIHNsaWNlID0gKEBnYW1lLmhlaWdodCAtIEBidXR0b25TdGFydFkpIC8gKEBhY3Rpb25zLmxlbmd0aCArIDEpXG4gICAgY3VyclkgPSBAYnV0dG9uU3RhcnRZICsgc2xpY2VcbiAgICBmb3IgYWN0aW9uIGluIEBhY3Rpb25zXG4gICAgICBidXR0b24gPSBuZXcgQnV0dG9uKEBnYW1lLCBAYnV0dG9uTmFtZXMsIEBnYW1lLmZvbnQsIGJ1dHRvblNpemUsIEBnYW1lLmNlbnRlci54LCBjdXJyWSwgYWN0aW9uKVxuICAgICAgQGJ1dHRvbnMucHVzaCBidXR0b25cbiAgICAgIGN1cnJZICs9IHNsaWNlXG5cbiAgdXBkYXRlOiAoZHQpIC0+XG4gICAgdXBkYXRlZCA9IGZhbHNlXG4gICAgZm9yIGJ1dHRvbiBpbiBAYnV0dG9uc1xuICAgICAgaWYgYnV0dG9uLnVwZGF0ZShkdClcbiAgICAgICAgdXBkYXRlZCA9IHRydWVcbiAgICByZXR1cm4gdXBkYXRlZFxuXG4gIHJlbmRlcjogLT5cbiAgICBAZ2FtZS5zcHJpdGVSZW5kZXJlci5yZW5kZXIgQGJhY2tncm91bmQsIDAsIDAsIEBnYW1lLndpZHRoLCBAZ2FtZS5oZWlnaHQsIDAsIDAsIDAsIEBjb2xvclxuICAgIEBnYW1lLmZvbnRSZW5kZXJlci5yZW5kZXIgQGdhbWUuZm9udCwgQGdhbWUuaGVpZ2h0IC8gMjUsIFwiQnVpbGQ6ICN7QGdhbWUudmVyc2lvbn1cIiwgMCwgQGdhbWUuaGVpZ2h0LCAwLCAxLCBAZ2FtZS5jb2xvcnMubGlnaHRncmF5XG4gICAgdGl0bGVIZWlnaHQgPSBAZ2FtZS5oZWlnaHQgLyA4XG4gICAgdGl0bGVPZmZzZXQgPSBAYnV0dG9uU3RhcnRZID4+IDFcbiAgICBAZ2FtZS5mb250UmVuZGVyZXIucmVuZGVyIEBnYW1lLmZvbnQsIHRpdGxlSGVpZ2h0LCBAdGl0bGUsIEBnYW1lLmNlbnRlci54LCB0aXRsZU9mZnNldCwgMC41LCAwLjUsIEBnYW1lLmNvbG9ycy53aGl0ZVxuICAgIGZvciBidXR0b24gaW4gQGJ1dHRvbnNcbiAgICAgIGJ1dHRvbi5yZW5kZXIoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1lbnVcbiIsIkFuaW1hdGlvbiA9IHJlcXVpcmUgJy4vQW5pbWF0aW9uJ1xuXG5TRVRUTEVfTVMgPSAxMDAwXG5cbmNsYXNzIFBpbGVcbiAgY29uc3RydWN0b3I6IChAZ2FtZSwgQGhhbmQpIC0+XG4gICAgQHBpbGUgPSBbXVxuICAgIEBwaWxlV2hvID0gW11cbiAgICBAdGhyb3duID0gW11cbiAgICBAdGhyb3duV2hvID0gW11cbiAgICBAYW5pbXMgPSB7fVxuICAgIEBwaWxlSUQgPSAtMVxuICAgIEB0aHJvd25UYWtlciA9IFwiXCJcbiAgICBAc2V0dGxlVGltZXIgPSAwXG4gICAgQHRocm93bkNvbG9yID0geyByOiAxLCBnOiAxLCBiOiAwLCBhOiAxfVxuICAgIEBzY2FsZSA9IDAuNlxuXG4gICAgY2VudGVyWCA9IEBnYW1lLmNlbnRlci54XG4gICAgY2VudGVyWSA9IEBnYW1lLmNlbnRlci55XG4gICAgb2Zmc2V0WCA9IEBoYW5kLmNhcmRXaWR0aCAqIEBzY2FsZVxuICAgIG9mZnNldFkgPSBAaGFuZC5jYXJkSGFsZkhlaWdodCAqIEBzY2FsZVxuICAgIEBwaWxlTG9jYXRpb25zID0gW1xuICAgICAgeyB4OiBjZW50ZXJYLCB5OiBjZW50ZXJZICsgb2Zmc2V0WSB9ICMgYm90dG9tXG4gICAgICB7IHg6IGNlbnRlclggLSBvZmZzZXRYLCB5OiBjZW50ZXJZIH0gIyBsZWZ0XG4gICAgICB7IHg6IGNlbnRlclgsIHk6IGNlbnRlclkgLSBvZmZzZXRZIH0gIyB0b3BcbiAgICAgIHsgeDogY2VudGVyWCArIG9mZnNldFgsIHk6IGNlbnRlclkgfSAjIHJpZ2h0XG4gICAgXVxuICAgIEB0aHJvd0xvY2F0aW9ucyA9IFtcbiAgICAgIHsgeDogY2VudGVyWCwgeTogQGdhbWUuaGVpZ2h0IH0gIyBib3R0b21cbiAgICAgIHsgeDogMCwgeTogY2VudGVyWSArIG9mZnNldFkgfSAjIGxlZnRcbiAgICAgIHsgeDogY2VudGVyWCwgeTogMCB9ICMgdG9wXG4gICAgICB7IHg6IEBnYW1lLndpZHRoLCB5OiBjZW50ZXJZICsgb2Zmc2V0WSB9ICMgcmlnaHRcbiAgICBdXG5cbiAgc2V0OiAocGlsZUlELCBwaWxlLCBwaWxlV2hvLCB0aHJvd24sIHRocm93bldobykgLT5cbiAgICAjIGlmIChAcGlsZUlEICE9IHBpbGVJRCkgYW5kICh0aHJvd24ubGVuZ3RoID4gMClcbiAgICAjICAgQHBpbGUgPSB0aHJvd24uc2xpY2UoMCkgIyB0aGUgcGlsZSBoYXMgYmVjb21lIHRoZSB0aHJvd24sIHN0YXNoIGl0IG9mZiBvbmUgbGFzdCB0aW1lXG4gICAgIyAgIEBwaWxlV2hvID0gdGhyb3duV2hvLnNsaWNlKDApXG4gICAgIyAgIEBwaWxlSUQgPSBwaWxlSURcbiAgICAjICAgQHNldHRsZVRpbWVyID0gU0VUVExFX01TXG5cbiAgICAjICMgZG9uJ3Qgc3RvbXAgdGhlIHBpbGUgd2UncmUgZHJhd2luZyB1bnRpbCBpdCBpcyBkb25lIHNldHRsaW5nIGFuZCBjYW4gZmx5IG9mZiB0aGUgc2NyZWVuXG4gICAgIyBpZiBAc2V0dGxlVGltZXIgPT0gMFxuICAgICMgICBAcGlsZSA9IHBpbGUuc2xpY2UoMClcbiAgICAjICAgQHBpbGVXaG8gPSBwaWxlV2hvLnNsaWNlKDApXG4gICAgIyAgIEB0aHJvd24gPSB0aHJvd24uc2xpY2UoMClcbiAgICAjICAgQHRocm93bldobyA9IHRocm93bldoby5zbGljZSgwKVxuICAgICMgICBAdGhyb3duVGFrZXIgPSB0aHJvd25UYWtlclxuXG4gICAgIyBAc3luY0FuaW1zKClcblxuICBoaW50OiAodiwgeCwgeSwgcikgLT5cbiAgICAjIEBhbmltc1t2XSA9IG5ldyBBbmltYXRpb24ge1xuICAgICMgICBzcGVlZDogQGhhbmQuY2FyZFNwZWVkXG4gICAgIyAgIHg6IHhcbiAgICAjICAgeTogeVxuICAgICMgICByOiByXG4gICAgIyAgIHM6IDFcbiAgICAjIH1cblxuICBzeW5jQW5pbXM6IC0+XG4gICAgc2VlbiA9IHt9XG4gICAgbG9jYXRpb25zID0gQHRocm93TG9jYXRpb25zXG4gICAgZm9yIGNhcmQsIGluZGV4IGluIEBwaWxlXG4gICAgICBzZWVuW2NhcmRdKytcbiAgICAgIGlmIG5vdCBAYW5pbXNbY2FyZF1cbiAgICAgICAgd2hvID0gQHBpbGVXaG9baW5kZXhdXG4gICAgICAgIGxvY2F0aW9uID0gbG9jYXRpb25zW3dob11cbiAgICAgICAgQGFuaW1zW2NhcmRdID0gbmV3IEFuaW1hdGlvbiB7XG4gICAgICAgICAgc3BlZWQ6IEBoYW5kLmNhcmRTcGVlZFxuICAgICAgICAgIHg6IGxvY2F0aW9uLnhcbiAgICAgICAgICB5OiBsb2NhdGlvbi55XG4gICAgICAgICAgcjogLTEgKiBNYXRoLlBJIC8gNFxuICAgICAgICAgIHM6IEBzY2FsZVxuICAgICAgICB9XG4gICAgZm9yIGNhcmQgaW4gQHRocm93blxuICAgICAgc2VlbltjYXJkXSsrXG4gICAgICBpZiBub3QgQGFuaW1zW2NhcmRdXG4gICAgICAgIEBhbmltc1tjYXJkXSA9IG5ldyBBbmltYXRpb24ge1xuICAgICAgICAgIHNwZWVkOiBAaGFuZC5jYXJkU3BlZWRcbiAgICAgICAgICB4OiAtMSAqIEBoYW5kLmNhcmRIYWxmV2lkdGhcbiAgICAgICAgICB5OiAtMSAqIEBoYW5kLmNhcmRIYWxmV2lkdGhcbiAgICAgICAgICByOiAtMSAqIE1hdGguUEkgLyAyXG4gICAgICAgICAgczogMVxuICAgICAgICB9XG4gICAgdG9SZW1vdmUgPSBbXVxuICAgIGZvciBjYXJkLGFuaW0gb2YgQGFuaW1zXG4gICAgICBpZiBub3Qgc2Vlbi5oYXNPd25Qcm9wZXJ0eShjYXJkKVxuICAgICAgICB0b1JlbW92ZS5wdXNoIGNhcmRcbiAgICBmb3IgY2FyZCBpbiB0b1JlbW92ZVxuICAgICAgIyBAZ2FtZS5sb2cgXCJyZW1vdmluZyBhbmltIGZvciAje2NhcmR9XCJcbiAgICAgIGRlbGV0ZSBAYW5pbXNbY2FyZF1cblxuICAgIEB1cGRhdGVQb3NpdGlvbnMoKVxuXG4gIHVwZGF0ZVBvc2l0aW9uczogLT5cbiAgICBsb2NhdGlvbnMgPSBAcGlsZUxvY2F0aW9uc1xuICAgIGZvciB2LCBpbmRleCBpbiBAcGlsZVxuICAgICAgYW5pbSA9IEBhbmltc1t2XVxuICAgICAgbG9jID0gQHBpbGVXaG9baW5kZXhdXG4gICAgICBhbmltLnJlcS54ID0gbG9jYXRpb25zW2xvY10ueFxuICAgICAgYW5pbS5yZXEueSA9IGxvY2F0aW9uc1tsb2NdLnlcbiAgICAgIGFuaW0ucmVxLnIgPSAwXG4gICAgICBhbmltLnJlcS5zID0gQHNjYWxlXG5cbiAgICBmb3IgXywgaW5kZXggaW4gQHRocm93blxuICAgICAgaSA9IEB0aHJvd24ubGVuZ3RoIC0gaW5kZXggLSAxXG4gICAgICB2ID0gQHRocm93bltpXVxuICAgICAgYW5pbSA9IEBhbmltc1t2XVxuICAgICAgYW5pbS5yZXEueCA9IChAZ2FtZS53aWR0aCArIEBoYW5kLmNhcmRIYWxmV2lkdGgpIC0gKChpbmRleCsxKSAqIChAaGFuZC5jYXJkV2lkdGggLyA1KSlcbiAgICAgIGFuaW0ucmVxLnkgPSAoQGdhbWUucGF1c2VCdXR0b25TaXplICogMS41KSArIEBoYW5kLmNhcmRIYWxmSGVpZ2h0XG4gICAgICBhbmltLnJlcS5yID0gMFxuICAgICAgYW5pbS5yZXEucyA9IDFcblxuICByZWFkeUZvck5leHRUcmljazogLT5cbiAgICByZXR1cm4gKEBzZXR0bGVUaW1lciA9PSAwKVxuXG4gIHVwZGF0ZTogKGR0KSAtPlxuICAgIHVwZGF0ZWQgPSBmYWxzZVxuXG4gICAgaWYgQHNldHRsZVRpbWVyID4gMFxuICAgICAgdXBkYXRlZCA9IHRydWVcbiAgICAgIEBzZXR0bGVUaW1lciAtPSBkdFxuICAgICAgaWYgQHNldHRsZVRpbWVyIDwgMFxuICAgICAgICBAc2V0dGxlVGltZXIgPSAwXG5cbiAgICBmb3IgY2FyZCxhbmltIG9mIEBhbmltc1xuICAgICAgaWYgYW5pbS51cGRhdGUoZHQpXG4gICAgICAgIHVwZGF0ZWQgPSB0cnVlXG5cbiAgICByZXR1cm4gdXBkYXRlZFxuXG4gICMgdXNlZCBieSB0aGUgZ2FtZSBvdmVyIHNjcmVlbi4gSXQgcmV0dXJucyB0cnVlIHdoZW4gbmVpdGhlciB0aGUgcGlsZSBub3IgdGhlIGxhc3QgdGhyb3duIGFyZSBtb3ZpbmdcbiAgcmVzdGluZzogLT5cbiAgICAjIGZvciBjYXJkLGFuaW0gb2YgQGFuaW1zXG4gICAgIyAgIGlmIGFuaW0uYW5pbWF0aW5nKClcbiAgICAjICAgICByZXR1cm4gZmFsc2VcbiAgICAjIGlmIEBzZXR0bGVUaW1lciA+IDBcbiAgICAjICAgcmV0dXJuIGZhbHNlXG4gICAgcmV0dXJuIHRydWVcblxuICByZW5kZXI6IC0+XG4gICAgIyBmb3IgdiwgaW5kZXggaW4gQHBpbGVcbiAgICAjICAgYW5pbSA9IEBhbmltc1t2XVxuICAgICMgICBAaGFuZC5yZW5kZXJDYXJkIHYsIGFuaW0uY3VyLngsIGFuaW0uY3VyLnksIGFuaW0uY3VyLnIsIGFuaW0uY3VyLnNcblxuICAgICMgZm9yIHYgaW4gQHRocm93blxuICAgICMgICBhbmltID0gQGFuaW1zW3ZdXG4gICAgIyAgIEBoYW5kLnJlbmRlckNhcmQgdiwgYW5pbS5jdXIueCwgYW5pbS5jdXIueSwgYW5pbS5jdXIuciwgYW5pbS5jdXIuc1xuXG4gICAgIyBpZiAoQHRocm93bi5sZW5ndGggPiAwKSBhbmQgKEB0aHJvd25UYWtlci5sZW5ndGggPiAwKVxuICAgICMgICBhbmltID0gQGFuaW1zW0B0aHJvd25bMF1dXG4gICAgIyAgIGlmIGFuaW0/XG4gICAgIyAgICAgQGdhbWUuZm9udFJlbmRlcmVyLnJlbmRlciBAZ2FtZS5mb250LCBAZ2FtZS5hYUhlaWdodCAvIDMwLCBAdGhyb3duVGFrZXIsIEBnYW1lLndpZHRoLCBhbmltLmN1ci55ICsgQGhhbmQuY2FyZEhhbGZIZWlnaHQsIDEsIDAsIEB0aHJvd25Db2xvclxuXG5tb2R1bGUuZXhwb3J0cyA9IFBpbGVcbiIsImNsYXNzIFNwcml0ZVJlbmRlcmVyXG4gIGNvbnN0cnVjdG9yOiAoQGdhbWUpIC0+XG4gICAgQHNwcml0ZXMgPVxuICAgICAgIyBnZW5lcmljIHNwcml0ZXNcbiAgICAgIHNvbGlkOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6ICA1NSwgeTogNzIzLCB3OiAgMTAsIGg6ICAxMCB9XG4gICAgICBwYXVzZTogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA2MDIsIHk6IDcwNywgdzogMTIyLCBoOiAxMjUgfVxuICAgICAgYnV0dG9uMDogICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogMTQwLCB5OiA3NzcsIHc6IDQyMiwgaDogIDY1IH1cbiAgICAgIGJ1dHRvbjE6ICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDE0MCwgeTogNjk4LCB3OiA0MjIsIGg6ICA2NSB9XG4gICAgICBwbHVzMDogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA3NDUsIHk6IDY2NCwgdzogMTE2LCBoOiAxMTggfVxuICAgICAgcGx1czE6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogNzQ1LCB5OiA4MjAsIHc6IDExNiwgaDogMTE4IH1cbiAgICAgIG1pbnVzMDogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDg5NSwgeTogNjY0LCB3OiAxMTYsIGg6IDExOCB9XG4gICAgICBtaW51czE6ICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA4OTUsIHk6IDgyMCwgdzogMTE2LCBoOiAxMTggfVxuICAgICAgYXJyb3dMOiAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogIDMzLCB5OiA4NTgsIHc6IDIwNCwgaDogMTU2IH1cbiAgICAgIGFycm93UjogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDIzOSwgeTogODUyLCB3OiAyMDgsIGg6IDE1NSB9XG5cbiAgICAgICMgbWVudSBiYWNrZ3JvdW5kc1xuICAgICAgbWFpbm1lbnU6ICB7IHRleHR1cmU6IFwibWFpbm1lbnVcIiwgIHg6IDAsIHk6IDAsIHc6IDEyODAsIGg6IDcyMCB9XG4gICAgICBwYXVzZW1lbnU6IHsgdGV4dHVyZTogXCJwYXVzZW1lbnVcIiwgeDogMCwgeTogMCwgdzogMTI4MCwgaDogNzIwIH1cblxuICAgICAgIyBob3d0b1xuICAgICAgaG93dG8xOiAgICB7IHRleHR1cmU6IFwiaG93dG8xXCIsICB4OiAwLCB5OiAgMCwgdzogMTkyMCwgaDogMTA4MCB9XG4gICAgICBob3d0bzI6ICAgIHsgdGV4dHVyZTogXCJob3d0bzJcIiwgIHg6IDAsIHk6ICAwLCB3OiAxOTIwLCBoOiAxMDgwIH1cbiAgICAgIGhvd3RvMzogICAgeyB0ZXh0dXJlOiBcImhvd3RvM1wiLCAgeDogMCwgeTogIDAsIHc6IDE5MjAsIGg6IDEwODAgfVxuXG4gICAgICAjIGNoYXJhY3RlcnNcbiAgICAgIG1hcmlvOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6ICAyMCwgeTogICAwLCB3OiAxNTEsIGg6IDMwOCB9XG4gICAgICBsdWlnaTogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAxNzEsIHk6ICAgMCwgdzogMTUxLCBoOiAzMDggfVxuICAgICAgcGVhY2g6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogMzM1LCB5OiAgIDAsIHc6IDE2NCwgaDogMzA4IH1cbiAgICAgIGRhaXN5OiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDUwNCwgeTogICAwLCB3OiAxNjQsIGg6IDMwOCB9XG4gICAgICB5b3NoaTogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA2NjgsIHk6ICAgMCwgdzogMTgwLCBoOiAzMDggfVxuICAgICAgdG9hZDogICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogODQ5LCB5OiAgIDAsIHc6IDE1NywgaDogMzA4IH1cbiAgICAgIGJvd3NlcjogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6ICAxMSwgeTogMzIyLCB3OiAxNTEsIGg6IDMwOCB9XG4gICAgICBib3dzZXJqcjogIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAyMjUsIHk6IDMyMiwgdzogMTQ0LCBoOiAzMDggfVxuICAgICAga29vcGE6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogMzcyLCB5OiAzMjIsIHc6IDEyOCwgaDogMzA4IH1cbiAgICAgIHJvc2FsaW5hOiAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDUwMCwgeTogMzIyLCB3OiAxNzMsIGg6IDMwOCB9XG4gICAgICBzaHlndXk6ICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA2OTEsIHk6IDMyMiwgdzogMTU0LCBoOiAzMDggfVxuICAgICAgdG9hZGV0dGU6ICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogODQ3LCB5OiAzMjIsIHc6IDE1OCwgaDogMzA4IH1cblxuICBjYWxjV2lkdGg6IChzcHJpdGVOYW1lLCBoZWlnaHQpIC0+XG4gICAgc3ByaXRlID0gQHNwcml0ZXNbc3ByaXRlTmFtZV1cbiAgICByZXR1cm4gMSBpZiBub3Qgc3ByaXRlXG4gICAgcmV0dXJuIGhlaWdodCAqIHNwcml0ZS53IC8gc3ByaXRlLmhcblxuICByZW5kZXI6IChzcHJpdGVOYW1lLCBkeCwgZHksIGR3LCBkaCwgcm90LCBhbmNob3J4LCBhbmNob3J5LCBjb2xvciwgY2IpIC0+XG4gICAgc3ByaXRlID0gQHNwcml0ZXNbc3ByaXRlTmFtZV1cbiAgICByZXR1cm4gaWYgbm90IHNwcml0ZVxuICAgIGlmIChkdyA9PSAwKSBhbmQgKGRoID09IDApXG4gICAgICAjIHRoaXMgcHJvYmFibHkgc2hvdWxkbid0IGV2ZXIgYmUgdXNlZC5cbiAgICAgIGR3ID0gc3ByaXRlLnhcbiAgICAgIGRoID0gc3ByaXRlLnlcbiAgICBlbHNlIGlmIGR3ID09IDBcbiAgICAgIGR3ID0gZGggKiBzcHJpdGUudyAvIHNwcml0ZS5oXG4gICAgZWxzZSBpZiBkaCA9PSAwXG4gICAgICBkaCA9IGR3ICogc3ByaXRlLmggLyBzcHJpdGUud1xuICAgIEBnYW1lLmRyYXdJbWFnZSBzcHJpdGUudGV4dHVyZSwgc3ByaXRlLngsIHNwcml0ZS55LCBzcHJpdGUudywgc3ByaXRlLmgsIGR4LCBkeSwgZHcsIGRoLCByb3QsIGFuY2hvcngsIGFuY2hvcnksIGNvbG9yLnIsIGNvbG9yLmcsIGNvbG9yLmIsIGNvbG9yLmEsIGNiXG4gICAgcmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gU3ByaXRlUmVuZGVyZXJcbiIsIk1JTl9QTEFZRVJTID0gM1xuTUFYX0xPR19MSU5FUyA9IDdcbk9LID0gJ09LJ1xuXG5TdWl0ID1cbiAgTk9ORTogLTFcbiAgU1BBREVTOiAwXG4gIENMVUJTOiAxXG4gIERJQU1PTkRTOiAyXG4gIEhFQVJUUzogM1xuXG5TdWl0TmFtZSA9IFsnU3BhZGVzJywgJ0NsdWJzJywgJ0RpYW1vbmRzJywgJ0hlYXJ0cyddXG5TaG9ydFN1aXROYW1lID0gWydTJywgJ0MnLCAnRCcsICdIJ11cblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQUkgTmFtZSBHZW5lcmF0b3JcblxuYWlDaGFyYWN0ZXJMaXN0ID0gW1xuICB7IGlkOiBcIm1hcmlvXCIsICAgIG5hbWU6IFwiTWFyaW9cIiwgICAgICBzcHJpdGU6IFwibWFyaW9cIiwgICAgYnJhaW46IFwibm9ybWFsXCIgfVxuICB7IGlkOiBcImx1aWdpXCIsICAgIG5hbWU6IFwiTHVpZ2lcIiwgICAgICBzcHJpdGU6IFwibHVpZ2lcIiwgICAgYnJhaW46IFwibm9ybWFsXCIgfVxuICB7IGlkOiBcInBlYWNoXCIsICAgIG5hbWU6IFwiUGVhY2hcIiwgICAgICBzcHJpdGU6IFwicGVhY2hcIiwgICAgYnJhaW46IFwibm9ybWFsXCIgfVxuICB7IGlkOiBcImRhaXN5XCIsICAgIG5hbWU6IFwiRGFpc3lcIiwgICAgICBzcHJpdGU6IFwiZGFpc3lcIiwgICAgYnJhaW46IFwibm9ybWFsXCIgfVxuICB7IGlkOiBcInlvc2hpXCIsICAgIG5hbWU6IFwiWW9zaGlcIiwgICAgICBzcHJpdGU6IFwieW9zaGlcIiwgICAgYnJhaW46IFwibm9ybWFsXCIgfVxuICB7IGlkOiBcInRvYWRcIiwgICAgIG5hbWU6IFwiVG9hZFwiLCAgICAgICBzcHJpdGU6IFwidG9hZFwiLCAgICAgYnJhaW46IFwibm9ybWFsXCIgfVxuICB7IGlkOiBcImJvd3NlclwiLCAgIG5hbWU6IFwiQm93c2VyXCIsICAgICBzcHJpdGU6IFwiYm93c2VyXCIsICAgYnJhaW46IFwibm9ybWFsXCIgfVxuICB7IGlkOiBcImJvd3NlcmpyXCIsIG5hbWU6IFwiQm93c2VyIEpyXCIsICBzcHJpdGU6IFwiYm93c2VyanJcIiwgYnJhaW46IFwibm9ybWFsXCIgfVxuICB7IGlkOiBcImtvb3BhXCIsICAgIG5hbWU6IFwiS29vcGFcIiwgICAgICBzcHJpdGU6IFwia29vcGFcIiwgICAgYnJhaW46IFwibm9ybWFsXCIgfVxuICB7IGlkOiBcInJvc2FsaW5hXCIsIG5hbWU6IFwiUm9zYWxpbmFcIiwgICBzcHJpdGU6IFwicm9zYWxpbmFcIiwgYnJhaW46IFwibm9ybWFsXCIgfVxuICB7IGlkOiBcInNoeWd1eVwiLCAgIG5hbWU6IFwiU2h5Z3V5XCIsICAgICBzcHJpdGU6IFwic2h5Z3V5XCIsICAgYnJhaW46IFwibm9ybWFsXCIgfVxuICB7IGlkOiBcInRvYWRldHRlXCIsIG5hbWU6IFwiVG9hZGV0dGVcIiwgICBzcHJpdGU6IFwidG9hZGV0dGVcIiwgYnJhaW46IFwibm9ybWFsXCIgfVxuXVxuXG5haUNoYXJhY3RlcnMgPSB7fVxuZm9yIGNoYXJhY3RlciBpbiBhaUNoYXJhY3Rlckxpc3RcbiAgYWlDaGFyYWN0ZXJzW2NoYXJhY3Rlci5pZF0gPSBjaGFyYWN0ZXJcblxucmFuZG9tQ2hhcmFjdGVyID0gLT5cbiAgciA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGFpQ2hhcmFjdGVyTGlzdC5sZW5ndGgpXG4gIHJldHVybiBhaUNoYXJhY3Rlckxpc3Rbcl1cblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQ2FyZFxuXG5jbGFzcyBDYXJkXG4gIGNvbnN0cnVjdG9yOiAoQHJhdykgLT5cbiAgICBAc3VpdCAgPSBNYXRoLmZsb29yKEByYXcgJSA0KVxuICAgIEB2YWx1ZSA9IE1hdGguZmxvb3IoQHJhdyAvIDQpXG4gICAgQHZhbHVlTmFtZSA9IHN3aXRjaCBAdmFsdWVcbiAgICAgIHdoZW4gIDggdGhlbiAnSidcbiAgICAgIHdoZW4gIDkgdGhlbiAnUSdcbiAgICAgIHdoZW4gMTAgdGhlbiAnSydcbiAgICAgIHdoZW4gMTEgdGhlbiAnQSdcbiAgICAgIHdoZW4gMTIgdGhlbiAnMidcbiAgICAgIGVsc2VcbiAgICAgICAgU3RyaW5nKEB2YWx1ZSArIDMpXG4gICAgQG5hbWUgPSBAdmFsdWVOYW1lICsgU2hvcnRTdWl0TmFtZVtAc3VpdF1cbiAgICAjIGNvbnNvbGUubG9nIFwiI3tAcmF3fSAtPiAje0BuYW1lfVwiXG5cbmNhcmRzVG9TdHJpbmcgPSAocmF3Q2FyZHMpIC0+XG4gIGNhcmROYW1lcyA9IFtdXG4gIGZvciByYXcgaW4gcmF3Q2FyZHNcbiAgICBjYXJkID0gbmV3IENhcmQocmF3KVxuICAgIGNhcmROYW1lcy5wdXNoIGNhcmQubmFtZVxuICByZXR1cm4gXCJbIFwiICsgY2FyZE5hbWVzLmpvaW4oJywnKSArIFwiIF1cIlxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBEZWNrXG5cbmNsYXNzIFNodWZmbGVkRGVja1xuICBjb25zdHJ1Y3RvcjogLT5cbiAgICAjIGRhdCBpbnNpZGUtb3V0IHNodWZmbGUhXG4gICAgQGNhcmRzID0gWyAwIF1cbiAgICBmb3IgaSBpbiBbMS4uLjUyXVxuICAgICAgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGkpXG4gICAgICBAY2FyZHMucHVzaChAY2FyZHNbal0pXG4gICAgICBAY2FyZHNbal0gPSBpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIFRoaXJ0ZWVuXG5cbmNsYXNzIFRoaXJ0ZWVuXG4gIGNvbnN0cnVjdG9yOiAoQGdhbWUsIHBhcmFtcykgLT5cbiAgICByZXR1cm4gaWYgbm90IHBhcmFtc1xuXG4gICAgaWYgcGFyYW1zLnN0YXRlXG4gICAgICBmb3Igayx2IG9mIHBhcmFtcy5zdGF0ZVxuICAgICAgICBpZiBwYXJhbXMuc3RhdGUuaGFzT3duUHJvcGVydHkoaylcbiAgICAgICAgICB0aGlzW2tdID0gcGFyYW1zLnN0YXRlW2tdXG4gICAgZWxzZVxuICAgICAgIyBuZXcgZ2FtZVxuICAgICAgQGxvZyA9IFtdXG5cbiAgICAgIEBwbGF5ZXJzID0gW1xuICAgICAgICB7IGlkOiAxLCBuYW1lOiAnUGxheWVyJywgaW5kZXg6IDAgfVxuICAgICAgXVxuXG4gICAgICBmb3IgaSBpbiBbMS4uLjRdXG4gICAgICAgIEBhZGRBSSgpXG5cbiAgICAgIEBkZWFsKClcblxuICBkZWFsOiAocGFyYW1zKSAtPlxuICAgIGRlY2sgPSBuZXcgU2h1ZmZsZWREZWNrKClcbiAgICBmb3IgcGxheWVyLCBpIGluIEBwbGF5ZXJzXG4gICAgICBAZ2FtZS5sb2cgXCJkZWFsaW5nIDEzIGNhcmRzIHRvIHBsYXllciAje2l9XCJcblxuICAgICAgcGxheWVyLmhhbmQgPSBbXVxuICAgICAgZm9yIGogaW4gWzAuLi4xM11cbiAgICAgICAgcGxheWVyLmhhbmQucHVzaChkZWNrLmNhcmRzLnNoaWZ0KCkpXG5cbiAgICAgIGNvbnNvbGUubG9nIFwiQGdhbWUub3B0aW9ucy5zb3J0SW5kZXggI3tAZ2FtZS5vcHRpb25zLnNvcnRJbmRleH1cIlxuICAgICAgaWYgQGdhbWUub3B0aW9ucy5zb3J0SW5kZXggPT0gMFxuICAgICAgICAjIE5vcm1hbFxuICAgICAgICBwbGF5ZXIuaGFuZC5zb3J0IChhLGIpIC0+IHJldHVybiBhIC0gYlxuICAgICAgZWxzZVxuICAgICAgICAjIFJldmVyc2VcbiAgICAgICAgcGxheWVyLmhhbmQuc29ydCAoYSxiKSAtPiByZXR1cm4gYiAtIGFcblxuICAgIEB0dXJuID0gMCAjIFRPRE86IGZpeFxuICAgIEBwaWxlID0gW11cbiAgICBAcGlsZVdobyA9IC0xXG4gICAgQHRocm93SUQgPSAwXG5cbiAgICBAb3V0cHV0KCdIYW5kIGRlYWx0LCAnICsgQHBsYXllcnNbQHR1cm5dLm5hbWUgKyAnIHBsYXlzIGZpcnN0JylcblxuICAgIHJldHVybiBPS1xuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgVGhpcnRlZW4gbWV0aG9kc1xuXG4gIHNhdmU6IC0+XG4gICAgbmFtZXMgPSBcImxvZyBwbGF5ZXJzIHR1cm4gcGlsZSBwaWxlV2hvIHRocm93SURcIi5zcGxpdChcIiBcIilcbiAgICBzdGF0ZSA9IHt9XG4gICAgZm9yIG5hbWUgaW4gbmFtZXNcbiAgICAgIHN0YXRlW25hbWVdID0gdGhpc1tuYW1lXVxuICAgIHJldHVybiBzdGF0ZVxuXG4gIG91dHB1dDogKHRleHQpIC0+XG4gICAgQGxvZy5wdXNoIHRleHRcbiAgICBpZiBAbG9nLmxlbmd0aCA+IE1BWF9MT0dfTElORVNcbiAgICAgIEBsb2cuc2hpZnQoKVxuXG4gIGZpbmRQbGF5ZXI6IChpZCkgLT5cbiAgICBmb3IgcGxheWVyIGluIEBwbGF5ZXJzXG4gICAgICBpZiBwbGF5ZXIuaWQgPT0gaWRcbiAgICAgICAgcmV0dXJuIHBsYXllclxuICAgIHJldHVybiB1bmRlZmluZWRcblxuICBjdXJyZW50UGxheWVyOiAtPlxuICAgIHJldHVybiBAcGxheWVyc1tAdHVybl1cblxuICBwbGF5ZXJBZnRlcjogKGluZGV4KSAtPlxuICAgIHJldHVybiAoaW5kZXggKyAxKSAlIEBwbGF5ZXJzLmxlbmd0aFxuXG4gIGFkZFBsYXllcjogKHBsYXllcikgLT5cbiAgICBpZiBub3QgcGxheWVyLmFpXG4gICAgICBwbGF5ZXIuYWkgPSBmYWxzZVxuXG4gICAgQHBsYXllcnMucHVzaCBwbGF5ZXJcbiAgICBwbGF5ZXIuaW5kZXggPSBAcGxheWVycy5sZW5ndGggLSAxXG4gICAgQG91dHB1dChwbGF5ZXIubmFtZSArIFwiIGpvaW5zIHRoZSBnYW1lXCIpXG5cbiAgbmFtZVByZXNlbnQ6IChuYW1lKSAtPlxuICAgIGZvciBwbGF5ZXIgaW4gQHBsYXllcnNcbiAgICAgIGlmIHBsYXllci5uYW1lID09IG5hbWVcbiAgICAgICAgcmV0dXJuIHRydWVcblxuICAgIHJldHVybiBmYWxzZVxuXG4gIGFkZEFJOiAtPlxuICAgIGxvb3BcbiAgICAgIGNoYXJhY3RlciA9IHJhbmRvbUNoYXJhY3RlcigpXG4gICAgICBpZiBub3QgQG5hbWVQcmVzZW50KGNoYXJhY3Rlci5uYW1lKVxuICAgICAgICBicmVha1xuXG4gICAgYWkgPVxuICAgICAgY2hhcklEOiBjaGFyYWN0ZXIuaWRcbiAgICAgIG5hbWU6IGNoYXJhY3Rlci5uYW1lXG4gICAgICBpZDogJ2FpJyArIFN0cmluZyhAcGxheWVycy5sZW5ndGgpXG4gICAgICBhaTogdHJ1ZVxuXG4gICAgQGFkZFBsYXllcihhaSlcblxuICAgIEBnYW1lLmxvZyhcImFkZGVkIEFJIHBsYXllclwiKVxuICAgIHJldHVybiBPS1xuXG5cbiAgd2lubmVyOiAtPlxuICAgIGZvciBwbGF5ZXIsIGkgaW4gQHBsYXllcnNcbiAgICAgIGlmIHBsYXllci5oYW5kLmxlbmd0aCA9PSAwXG4gICAgICAgIHJldHVybiBwbGF5ZXJcbiAgICByZXR1cm4gbnVsbFxuXG4gIGhhc0NhcmQ6IChoYW5kLCByYXdDYXJkKSAtPlxuICAgIGZvciByYXcgaW4gaGFuZFxuICAgICAgaWYgcmF3ID09IHJhd0NhcmRcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICByZXR1cm4gZmFsc2VcblxuICBoYXNDYXJkczogKGhhbmQsIHJhd0NhcmRzKSAtPlxuICAgIGZvciByYXcgaW4gcmF3Q2FyZHNcbiAgICAgIGlmIG5vdCBAaGFzQ2FyZChoYW5kLCByYXcpXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIHJldHVybiB0cnVlXG5cbiAgcmVtb3ZlQ2FyZHM6IChoYW5kLCByYXdDYXJkcykgLT5cbiAgICBuZXdIYW5kID0gW11cbiAgICBmb3IgY2FyZCBpbiBoYW5kXG4gICAgICBrZWVwTWUgPSB0cnVlXG4gICAgICBmb3IgcmF3IGluIHJhd0NhcmRzXG4gICAgICAgIGlmIGNhcmQgPT0gcmF3XG4gICAgICAgICAga2VlcE1lID0gZmFsc2VcbiAgICAgICAgICBicmVha1xuICAgICAgaWYga2VlcE1lXG4gICAgICAgIG5ld0hhbmQucHVzaCBjYXJkXG4gICAgcmV0dXJuIG5ld0hhbmRcblxuICBjYW5QYXNzOiAocGFyYW1zKSAtPlxuICAgIGlmIEB3aW5uZXIoKSAhPSBudWxsXG4gICAgICByZXR1cm4gJ2dhbWVPdmVyJ1xuXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcbiAgICBpZiBwYXJhbXMuaWQgIT0gY3VycmVudFBsYXllci5pZFxuICAgICAgcmV0dXJuICdub3RZb3VyVHVybidcblxuICAgIHJldHVybiBPS1xuXG4gIGNhblBsYXk6IChwYXJhbXMpIC0+XG4gICAgcmV0ID0gQGNhblBhc3MocGFyYW1zKVxuICAgIGlmIHJldCAhPSBPS1xuICAgICAgcmV0dXJuIHJldFxuXG4gICAgcmV0dXJuIE9LXG5cbiAgcGxheTogKHBhcmFtcykgLT5cbiAgICBjb25zb2xlLmxvZyBcInNvbWVvbmUgY2FsbGluZyBwbGF5XCIsIHBhcmFtc1xuICAgIHJldCA9IEBjYW5QbGF5KHBhcmFtcylcbiAgICBpZiByZXQgIT0gT0tcbiAgICAgIHJldHVybiByZXRcblxuICAgIEB0aHJvd0lEICs9IDFcbiAgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxuICAgIGN1cnJlbnRQbGF5ZXIuaGFuZCA9IEByZW1vdmVDYXJkcyhjdXJyZW50UGxheWVyLmhhbmQsIHBhcmFtcy5jYXJkcylcblxuICAgIEBvdXRwdXQoXCIje2N1cnJlbnRQbGF5ZXIubmFtZX0gdGhyb3dzICN7Y2FyZHNUb1N0cmluZyhwYXJhbXMuY2FyZHMpfVwiKVxuXG4gICAgaWYgY3VycmVudFBsYXllci5oYW5kLmxlbmd0aCA9PSAwXG4gICAgICBAb3V0cHV0KFwiI3tjdXJyZW50UGxheWVyLm5hbWV9IHdpbnMhXCIpXG5cbiAgICBAcGlsZSA9IHBhcmFtcy5jYXJkcy5zbGljZSgwKVxuICAgIEBwaWxlV2hvID0gQHR1cm5cblxuICAgIEB0dXJuID0gQHBsYXllckFmdGVyKEB0dXJuKVxuICAgIHJldHVybiBPS1xuXG4gIHBhc3M6IChwYXJhbXMpIC0+XG4gICAgcmV0ID0gQGNhblBhc3MocGFyYW1zKVxuICAgIGlmIHJldCAhPSBPS1xuICAgICAgcmV0dXJuIHJldFxuXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcbiAgICBAb3V0cHV0KFwiI3tjdXJyZW50UGxheWVyLm5hbWV9IHBhc3Nlc1wiKVxuICAgIEB0dXJuID0gQHBsYXllckFmdGVyKEB0dXJuKVxuICAgIHJldHVybiBPS1xuXG4gIGFpUGxheTogKGN1cnJlbnRQbGF5ZXIsIGNhcmRzKSAtPlxuICAgIHJldHVybiBAcGxheSh7J2lkJzpjdXJyZW50UGxheWVyLmlkLCAnY2FyZHMnOmNhcmRzfSlcblxuICBhaVBhc3M6IChjdXJyZW50UGxheWVyKSAtPlxuICAgIHJldHVybiBAcGFzcyh7J2lkJzpjdXJyZW50UGxheWVyLmlkfSlcblxuXG4gICMgY3VycmVudFN1aXQ6IC0+XG4gICMgICBpZiBAcGlsZS5sZW5ndGggPT0gMFxuICAjICAgICByZXR1cm4gU3VpdC5OT05FXG5cbiAgIyAgIGNhcmQgPSBuZXcgQ2FyZChAcGlsZVswXSlcbiAgIyAgIHJldHVybiBjYXJkLnN1aXRcblxuICAjIHBsYXllckhhc1N1aXQ6IChwbGF5ZXIsIHN1aXQpIC0+XG4gICMgICBmb3IgdiBpbiBwbGF5ZXIuaGFuZFxuICAjICAgICBjYXJkID0gbmV3IENhcmQodilcbiAgIyAgICAgaWYgY2FyZC5zdWl0ID09IHN1aXRcbiAgIyAgICAgICByZXR1cm4gdHJ1ZVxuICAjICAgcmV0dXJuIGZhbHNlXG5cbiAgIyBwbGF5ZXJIYXNPbmx5U3BhZGVzOiAocGxheWVyKSAtPlxuICAjICAgZm9yIHYgaW4gcGxheWVyLmhhbmRcbiAgIyAgICAgY2FyZCA9IG5ldyBDYXJkKHYpXG4gICMgICAgIGlmIGNhcmQuc3VpdCAhPSBTdWl0LlNQQURFU1xuICAjICAgICAgIHJldHVybiBmYWxzZVxuICAjICAgcmV0dXJuIHRydWVcblxuICAjIHBsYXllckNhbldpbkluU3VpdDogKHBsYXllciwgY2hhbXBpb25DYXJkKSAtPlxuICAjICAgZm9yIHYgaW4gcGxheWVyLmhhbmRcbiAgIyAgICAgY2FyZCA9IG5ldyBDYXJkKHYpXG4gICMgICAgIGlmIGNhcmQuc3VpdCA9PSBjaGFtcGlvbkNhcmQuc3VpdFxuICAjICAgICAgIGlmIGNhcmQudmFsdWUgPiBjaGFtcGlvbkNhcmQudmFsdWVcbiAgIyAgICAgICAgIHJldHVybiB0cnVlXG4gICMgICByZXR1cm4gZmFsc2VcblxuICAjIGJlc3RJblBpbGU6IC0+XG4gICMgICBpZiBAcGlsZS5sZW5ndGggPT0gMFxuICAjICAgICByZXR1cm4gLTFcbiAgIyAgIGN1cnJlbnRTdWl0ID0gQGN1cnJlbnRTdWl0KClcbiAgIyAgIGJlc3QgPSAwXG4gICMgICBmb3IgaSBpbiBbMS4uLkBwaWxlLmxlbmd0aF1cbiAgIyAgICAgaWYgY2FyZEJlYXRzKEBwaWxlW2ldLCBAcGlsZVtiZXN0XSwgY3VycmVudFN1aXQpXG4gICMgICAgICAgYmVzdCA9IGlcbiAgIyAgIHJldHVybiBiZXN0XG5cbiAgIyByZXNldDogKHBhcmFtcykgLT5cbiAgIyAgIGlmIEBwbGF5ZXJzLmxlbmd0aCA8IE1JTl9QTEFZRVJTXG4gICMgICAgIHJldHVybiAnbm90RW5vdWdoUGxheWVycydcblxuICAjICAgZm9yIHBsYXllciBpbiBAcGxheWVyc1xuICAjICAgICBwbGF5ZXIuaGFuZCA9IFtdXG5cbiAgIyAgIEBuZXh0Um91bmQgPSAwXG4gICMgICBAdHJ1bXBCcm9rZW4gPSBmYWxzZVxuICAjICAgQHByZXYgPSBbXVxuICAjICAgQHBpbGUgPSBbXVxuICAjICAgQHBpbGVXaG8gPSBbXVxuICAjICAgQHByZXZXaG8gPSBbXVxuICAjICAgQHByZXZUcmlja1Rha2VyID0gLTFcblxuICAjICAgaWYgQG1hcmF0aG9uTW9kZSgpXG4gICMgICAgIHJvdW5kQ291bnQgPSBcIk1hcmF0aG9uIG1vZGVcIlxuICAjICAgZWxzZVxuICAjICAgICByb3VuZENvdW50ID0gXCIje0Byb3VuZHMubGVuZ3RofSByb3VuZHNcIlxuICAjICAgQG91dHB1dChcIk5ldyBnYW1lISAoI3tAcGxheWVycy5sZW5ndGh9IHBsYXllcnMsICN7cm91bmRDb3VudH0pXCIpXG5cbiAgIyAgIEBzdGFydEJpZCgpXG5cbiAgIyAgIHJldHVybiBPS1xuXG4gICMgc3RhcnRCaWQ6IChwYXJhbXMpIC0+XG4gICMgICBpZiBAbWFyYXRob25Nb2RlKClcbiAgIyAgICAgaWYgQHBsYXllcnNbMF0uc2NvcmUgPiAwXG4gICMgICAgICAgcmV0dXJuICdnYW1lT3ZlcidcbiAgIyAgICAgQHRyaWNrcyA9IDEzXG4gICMgICBlbHNlXG4gICMgICAgIGlmKEBuZXh0Um91bmQgPj0gQHJvdW5kcy5sZW5ndGgpXG4gICMgICAgICAgcmV0dXJuICdnYW1lT3ZlcidcbiAgIyAgICAgQHRyaWNrcyA9IEByb3VuZHNbQG5leHRSb3VuZF1cblxuICAjICAgQG5leHRSb3VuZCsrXG5cbiAgIyAgIGlmIEBwcmV2VHJpY2tUYWtlciA9PSAtMVxuICAjICAgICBAZGVhbGVyID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogQHBsYXllcnMubGVuZ3RoKVxuICAjICAgICBAb3V0cHV0IFwiUmFuZG9tbHkgYXNzaWduaW5nIGRlYWxlciB0byAje0BwbGF5ZXJzW0BkZWFsZXJdLm5hbWV9XCJcbiAgIyAgIGVsc2VcbiAgIyAgICAgQGRlYWxlciA9IEBwcmV2VHJpY2tUYWtlclxuICAjICAgICBAb3V0cHV0IFwiI3tAcGxheWVyc1tAZGVhbGVyXS5uYW1lfSBjbGFpbWVkIGxhc3QgdHJpY2ssIGRlYWxzXCJcblxuICAjICAgZGVjayA9IG5ldyBTaHVmZmxlZERlY2soKVxuICAjICAgZm9yIHBsYXllciwgaSBpbiBAcGxheWVyc1xuICAjICAgICBwbGF5ZXIuYmlkID0gLTFcbiAgIyAgICAgcGxheWVyLnRyaWNrcyA9IDBcblxuICAjICAgICBAZ2FtZS5sb2cgXCJkZWFsaW5nICN7QHRyaWNrc30gY2FyZHMgdG8gcGxheWVyICN7aX1cIlxuXG4gICMgICAgIHBsYXllci5oYW5kID0gW11cbiAgIyAgICAgZm9yIGogaW4gWzAuLi5AdHJpY2tzXVxuICAjICAgICAgIHBsYXllci5oYW5kLnB1c2goZGVjay5jYXJkcy5zaGlmdCgpKVxuXG4gICMgICAgIHBsYXllci5oYW5kLnNvcnQgKGEsYikgLT4gcmV0dXJuIGEgLSBiXG5cbiAgIyAgIEBzdGF0ZSA9IFN0YXRlLkJJRFxuICAjICAgQHR1cm4gPSBAcGxheWVyQWZ0ZXIoQGRlYWxlcilcbiAgIyAgIEBiaWRzID0gMFxuICAjICAgQHBpbGUgPSBbXVxuICAjICAgQHBpbGVXaG8gPSBbXVxuICAjICAgQHByZXYgPSBbXVxuICAjICAgQHByZXZXaG8gPSBbXVxuICAjICAgQHByZXZUcmlja1Rha2VyID0gLTFcblxuICAjICAgQG91dHB1dCgnUm91bmQgJyArIEBuZXh0Um91bmQgKyAnIGJlZ2lucyAnICsgQHBsYXllcnNbQHR1cm5dLm5hbWUgKyAnIGJpZHMgZmlyc3QnKVxuXG4gICMgICByZXR1cm4gT0tcblxuICAjIGVuZEJpZDogLT5cbiAgIyAgIGxvd2VzdFBsYXllciA9IDBcbiAgIyAgIGxvd2VzdENhcmQgPSBAcGxheWVyc1swXS5oYW5kWzBdICMgaGFuZCBpcyBzb3J0ZWQsIHRoZXJlZm9yZSBoYW5kWzBdIGlzIHRoZSBsb3dlc3RcbiAgIyAgIGZvciBpIGluIFsxLi4uQHBsYXllcnMubGVuZ3RoXVxuICAjICAgICBwbGF5ZXIgPSBAcGxheWVyc1tpXVxuICAjICAgICBpZiBwbGF5ZXIuaGFuZFswXSA8IGxvd2VzdENhcmRcbiAgIyAgICAgICBsb3dlc3RQbGF5ZXIgPSBpXG4gICMgICAgICAgbG93ZXN0Q2FyZCA9IHBsYXllci5oYW5kWzBdXG5cbiAgIyAgIEBsb3dlc3RSZXF1aXJlZCA9IHRydWUgIyBOZXh0IHBsYXllciBpcyBvYmxpZ2F0ZWQgdG8gdGhyb3cgdGhlIGxvd2VzdCBjYXJkXG4gICMgICBAdHVybiA9IGxvd2VzdFBsYXllclxuICAjICAgQHRydW1wQnJva2VuID0gZmFsc2VcbiAgIyAgIEB0cmlja0lEID0gMFxuICAjICAgQHN0YXJ0VHJpY2soKVxuXG4gICMgc3RhcnRUcmljazogKCkgLT5cbiAgIyAgICMgQHR1cm4gc2hvdWxkIGFscmVhZHkgYmUgY29ycmVjdCwgZWl0aGVyIGZyb20gZW5kQmlkIChsb3dlc3QgY2x1Yikgb3IgZW5kVHJpY2sgKGxhc3QgdHJpY2tUYWtlcilcblxuICAjICAgQHRyaWNrVGFrZXIgPSAtMVxuICAjICAgQHN0YXRlID0gU3RhdGUuVFJJQ0tcblxuICAjICAgcmV0dXJuIE9LXG5cbiAgIyBlbmRUcmljazogLT5cbiAgIyAgIHRha2VyID0gQHBsYXllcnNbQHRyaWNrVGFrZXJdXG4gICMgICB0YWtlci50cmlja3MrK1xuXG4gICMgICBAb3V0cHV0KHRha2VyLm5hbWUgKyAnIHBvY2tldHMgdGhlIHRyaWNrIFsnICsgdGFrZXIudHJpY2tzICsgJ10nKVxuICAjICAgQHByZXZUcmlja1Rha2VyID0gQHRyaWNrVGFrZXJcbiAgIyAgIEB0dXJuID0gQHRyaWNrVGFrZXJcbiAgIyAgIEBwcmV2ID0gQHBpbGVcbiAgIyAgIEBwcmV2V2hvID0gQHBpbGVXaG9cbiAgIyAgIEBwaWxlID0gW11cbiAgIyAgIEBwaWxlV2hvID0gW11cbiAgIyAgIEB0cmlja0lEKytcblxuICAjICAgaWYgQHBsYXllcnNbMF0uaGFuZC5sZW5ndGggPiAwXG4gICMgICAgIEBzdGFydFRyaWNrKClcbiAgIyAgIGVsc2VcbiAgIyAgICAgcm91bmRDb3VudCA9IEByb3VuZHMubGVuZ3RoXG4gICMgICAgIGlmIEBtYXJhdGhvbk1vZGUoKVxuICAjICAgICAgIHJvdW5kQ291bnQgPSBcIk1cIlxuICAjICAgICBAb3V0cHV0KCdSb3VuZCBlbmRzIFsnICsgQG5leHRSb3VuZCArICcvJyArIHJvdW5kQ291bnQgKyAnXScpXG5cbiAgIyAgICAgZm9yIHBsYXllciBpbiBAcGxheWVyc1xuICAjICAgICAgIG92ZXJVbmRlciA9IHBsYXllci5iaWQgLSBwbGF5ZXIudHJpY2tzXG4gICMgICAgICAgaWYgb3ZlclVuZGVyIDwgMFxuICAjICAgICAgICAgb3ZlclVuZGVyICo9IC0xXG5cbiAgIyAgICAgICBwZW5hbHR5UG9pbnRzID0gMFxuICAjICAgICAgIHN0ZXAgPSAxXG4gICMgICAgICAgd2hpbGUgb3ZlclVuZGVyID4gMFxuICAjICAgICAgICAgcGVuYWx0eVBvaW50cyArPSBzdGVwKysgIyBkYXQgcXVhZHJhdGljXG4gICMgICAgICAgICBvdmVyVW5kZXItLVxuXG4gICMgICAgICAgcGxheWVyLnNjb3JlICs9IHBlbmFsdHlQb2ludHNcblxuICAjICAgICAgIHBsYXllci5sYXN0V2VudCA9IFN0cmluZyhwbGF5ZXIudHJpY2tzKSArICcvJyArIFN0cmluZyhwbGF5ZXIuYmlkKVxuICAjICAgICAgIHBsYXllci5sYXN0UG9pbnRzID0gcGVuYWx0eVBvaW50c1xuXG4gICMgICAgIGdhbWVFbmRpbmcgPSBmYWxzZVxuICAjICAgICBpZiBAbWFyYXRob25Nb2RlKClcbiAgIyAgICAgICBnYW1lRW5kaW5nID0gKEBwbGF5ZXJzWzBdLnNjb3JlID4gMClcbiAgIyAgICAgZWxzZVxuICAjICAgICAgIGdhbWVFbmRpbmcgPSAoQG5leHRSb3VuZCA+PSBAcm91bmRzLmxlbmd0aClcblxuICAjICAgICBpZiBnYW1lRW5kaW5nXG4gICMgICAgICAgQHN0YXRlID0gU3RhdGUuUE9TVEdBTUVTVU1NQVJZXG4gICMgICAgIGVsc2VcbiAgIyAgICAgICBAc3RhdGUgPSBTdGF0ZS5ST1VORFNVTU1BUllcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIFRoaXJ0ZWVuIGFjdGlvbnNcblxuICAjIGJpZDogKHBhcmFtcykgLT5cbiAgIyAgIGlmIEBzdGF0ZSAhPSBTdGF0ZS5CSURcbiAgIyAgICAgcmV0dXJuICdub3RCaWRkaW5nTm93J1xuXG4gICMgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxuICAjICAgaWYgcGFyYW1zLmlkICE9IGN1cnJlbnRQbGF5ZXIuaWRcbiAgIyAgICAgcmV0dXJuICdub3RZb3VyVHVybidcblxuICAjICAgcGFyYW1zLmJpZCA9IE51bWJlcihwYXJhbXMuYmlkKVxuXG4gICMgICBpZiAocGFyYW1zLmJpZCA8IDApIHx8IChwYXJhbXMuYmlkID4gQHRyaWNrcylcbiAgIyAgICAgcmV0dXJuICdiaWRPdXRPZlJhbmdlJ1xuXG4gICMgICBpZiBAdHVybiA9PSBAZGVhbGVyXG4gICMgICAgIGlmIChAYmlkcyArIHBhcmFtcy5iaWQpID09IEB0cmlja3NcbiAgIyAgICAgICByZXR1cm4gJ2RlYWxlckZ1Y2tlZCdcblxuICAjICAgICBAZW5kQmlkKClcbiAgIyAgIGVsc2VcbiAgIyAgICAgQHR1cm4gPSBAcGxheWVyQWZ0ZXIoQHR1cm4pXG5cbiAgIyAgIGN1cnJlbnRQbGF5ZXIuYmlkID0gcGFyYW1zLmJpZFxuICAjICAgQGJpZHMgKz0gY3VycmVudFBsYXllci5iaWRcbiAgIyAgIEBvdXRwdXQoY3VycmVudFBsYXllci5uYW1lICsgXCIgYmlkcyBcIiArIGN1cnJlbnRQbGF5ZXIuYmlkKVxuXG4gICMgICBpZiBAc3RhdGUgIT0gU3RhdGUuQklEXG4gICMgICAgICMgQmlkZGluZyBlbmRlZFxuICAjICAgICBAb3V0cHV0KCdCaWRkaW5nIGVuZHMgJyArIEBiaWRzICsgJy8nICsgQHRyaWNrcyArICcgJyArIEBwbGF5ZXJzW0B0dXJuXS5uYW1lICsgJyB0aHJvd3MgZmlyc3QnKVxuXG4gICMgICByZXR1cm4gT0tcblxuICAjIGNhblBsYXk6IChwYXJhbXMpIC0+XG4gICMgICBpZiBAc3RhdGUgIT0gU3RhdGUuVFJJQ0tcbiAgIyAgICAgcmV0dXJuICdub3RJblRyaWNrJ1xuXG4gICMgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxuICAjICAgaWYgcGFyYW1zLmlkICE9IGN1cnJlbnRQbGF5ZXIuaWRcbiAgIyAgICAgcmV0dXJuICdub3RZb3VyVHVybidcblxuICAjICAgaWYgcGFyYW1zLmhhc093blByb3BlcnR5KCd3aGljaCcpXG4gICMgICAgIHBhcmFtcy53aGljaCA9IE51bWJlcihwYXJhbXMud2hpY2gpXG4gICMgICAgIHBhcmFtcy5pbmRleCA9IC0xXG4gICMgICAgIGZvciBjYXJkLCBpIGluIGN1cnJlbnRQbGF5ZXIuaGFuZFxuICAjICAgICAgIGlmIGNhcmQgPT0gcGFyYW1zLndoaWNoXG4gICMgICAgICAgICBwYXJhbXMuaW5kZXggPSBpXG4gICMgICAgICAgICBicmVha1xuXG4gICMgICAgIGlmIHBhcmFtcy5pbmRleCA9PSAtMVxuICAjICAgICAgIHJldHVybiAnZG9Ob3RIYXZlJ1xuICAjICAgZWxzZVxuICAjICAgICBwYXJhbXMuaW5kZXggPSBOdW1iZXIocGFyYW1zLmluZGV4KVxuXG4gICMgICBpZiAocGFyYW1zLmluZGV4IDwgMCkgfHwgKHBhcmFtcy5pbmRleCA+PSBjdXJyZW50UGxheWVyLmhhbmQubGVuZ3RoKVxuICAjICAgICByZXR1cm4gJ2luZGV4T3V0T2ZSYW5nZSdcblxuICAjICAgaWYgQGxvd2VzdFJlcXVpcmVkICYmIChwYXJhbXMuaW5kZXggIT0gMClcbiAgIyAgICAgcmV0dXJuICdsb3dlc3RDYXJkUmVxdWlyZWQnXG5cbiAgIyAgIGNob3NlbkNhcmRYID0gY3VycmVudFBsYXllci5oYW5kW3BhcmFtcy5pbmRleF1cbiAgIyAgIGNob3NlbkNhcmQgPSBuZXcgQ2FyZChjaG9zZW5DYXJkWClcblxuICAjICAgaWYoKCFAdHJ1bXBCcm9rZW4pICYmICAgICAgICAgICAgICAgICAgICAjIEVuc3VyZSB0aGF0IHRydW1wIGlzIGJyb2tlblxuICAjICAgKEBwaWxlLmxlbmd0aCA9PSAwKSAmJiAgICAgICAgICAgICAgICAgICAjIGJlZm9yZSBhbGxvd2luZyBzb21lb25lIHRvIGxlYWRcbiAgIyAgIChjaG9zZW5DYXJkLnN1aXQgPT0gU3VpdC5TUEFERVMpICYmICAgICAgIyB3aXRoIHNwYWRlc1xuICAjICAgKCFAcGxheWVySGFzT25seVNwYWRlcyhjdXJyZW50UGxheWVyKSkpICAjIHVubGVzcyBpdCBpcyBhbGwgdGhleSBoYXZlXG4gICMgICAgIHJldHVybiAndHJ1bXBOb3RCcm9rZW4nXG5cbiAgIyAgIGJlc3RJbmRleCA9IEBiZXN0SW5QaWxlKClcbiAgIyAgIGZvcmNlZFN1aXQgPSBAY3VycmVudFN1aXQoKVxuICAjICAgaWYgZm9yY2VkU3VpdCAhPSBTdWl0Lk5PTkUgIyBzYWZlIHRvIGFzc3VtZSAoYmVzdEluZGV4ICE9IC0xKSBpbiB0aGlzIGJsb2NrXG4gICMgICAgIGlmIEBwbGF5ZXJIYXNTdWl0KGN1cnJlbnRQbGF5ZXIsIGZvcmNlZFN1aXQpXG4gICMgICAgICAgIyBZb3UgbXVzdCB0aHJvdyBpbi1zdWl0IGlmIHlvdSBoYXZlIG9uZSBvZiB0aGF0IHN1aXRcbiAgIyAgICAgICBpZiBjaG9zZW5DYXJkLnN1aXQgIT0gZm9yY2VkU3VpdFxuICAjICAgICAgICAgcmV0dXJuICdmb3JjZWRJblN1aXQnXG5cbiAgIyAgICAgICAjIElmIHRoZSBjdXJyZW50IHdpbm5lciBpcyB3aW5uaW5nIGluLXN1aXQsIHlvdSBtdXN0IHRyeSB0byBiZWF0IHRoZW0gaW4tc3VpdFxuICAjICAgICAgIGN1cnJlbnRXaW5uaW5nQ2FyZFggPSBAcGlsZVtiZXN0SW5kZXhdXG4gICMgICAgICAgY3VycmVudFdpbm5pbmdDYXJkID0gbmV3IENhcmQoY3VycmVudFdpbm5pbmdDYXJkWClcbiAgIyAgICAgICBpZiBjdXJyZW50V2lubmluZ0NhcmQuc3VpdCA9PSBmb3JjZWRTdWl0XG4gICMgICAgICAgICBpZigoIWNhcmRCZWF0cyhjaG9zZW5DYXJkWCwgY3VycmVudFdpbm5pbmdDYXJkWCwgZm9yY2VkU3VpdCkpICYmXG4gICMgICAgICAgICAoQHBsYXllckNhbldpbkluU3VpdChjdXJyZW50UGxheWVyLCBjdXJyZW50V2lubmluZ0NhcmQpKSlcbiAgIyAgICAgICAgICAgcmV0dXJuICdmb3JjZWRIaWdoZXJJblN1aXQnXG4gICMgICAgIGVsc2VcbiAgIyAgICAgICAjIEN1cnJlbnQgcGxheWVyIGRvZXNuJ3QgaGF2ZSB0aGF0IHN1aXQsIGRvbid0IGJvdGhlclxuICAjICAgICAgIGZvcmNlZFN1aXQgPSBTdWl0Lk5PTkVcblxuICAjICAgcmV0dXJuIE9LXG5cbiAgIyBwbGF5OiAocGFyYW1zKSAtPlxuICAjICAgY2FuUGxheUNhcmQgPSBAY2FuUGxheShwYXJhbXMpXG4gICMgICBpZiBjYW5QbGF5Q2FyZCAhPSBPS1xuICAjICAgICByZXR1cm4gY2FuUGxheUNhcmRcblxuICAjICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcblxuICAjICAgaWYgcGFyYW1zLmhhc093blByb3BlcnR5KCd3aGljaCcpXG4gICMgICAgIHBhcmFtcy53aGljaCA9IE51bWJlcihwYXJhbXMud2hpY2gpXG4gICMgICAgIHBhcmFtcy5pbmRleCA9IC0xXG4gICMgICAgIGZvciBjYXJkLCBpIGluIGN1cnJlbnRQbGF5ZXIuaGFuZFxuICAjICAgICAgIGlmIGNhcmQgPT0gcGFyYW1zLndoaWNoXG4gICMgICAgICAgICBwYXJhbXMuaW5kZXggPSBpXG4gICMgICAgICAgICBicmVha1xuXG4gICMgICAgIGlmIHBhcmFtcy5pbmRleCA9PSAtMVxuICAjICAgICAgIHJldHVybiAnZG9Ob3RIYXZlJ1xuICAjICAgZWxzZVxuICAjICAgICBwYXJhbXMuaW5kZXggPSBOdW1iZXIocGFyYW1zLmluZGV4KVxuXG4gICMgICBjaG9zZW5DYXJkWCA9IGN1cnJlbnRQbGF5ZXIuaGFuZFtwYXJhbXMuaW5kZXhdXG4gICMgICBjaG9zZW5DYXJkID0gbmV3IENhcmQoY2hvc2VuQ2FyZFgpXG5cbiAgIyAgICMgSWYgeW91IGdldCBoZXJlLCB5b3UgY2FuIHRocm93IHdoYXRldmVyIHlvdSB3YW50LCBhbmQgaXRcbiAgIyAgICMgd2lsbCBlaXRoZXIgcHV0IHlvdSBpbiB0aGUgbGVhZCwgdHJ1bXAsIG9yIGR1bXAuXG5cbiAgIyAgIEBsb3dlc3RSZXF1aXJlZCA9IGZhbHNlXG5cbiAgIyAgICMgVGhyb3cgdGhlIGNhcmQgb24gdGhlIHBpbGUsIGFkdmFuY2UgdGhlIHR1cm5cbiAgIyAgIEBwaWxlLnB1c2goY3VycmVudFBsYXllci5oYW5kW3BhcmFtcy5pbmRleF0pXG4gICMgICBAcGlsZVdoby5wdXNoKEB0dXJuKVxuICAjICAgY3VycmVudFBsYXllci5oYW5kLnNwbGljZShwYXJhbXMuaW5kZXgsIDEpXG5cbiAgIyAgICMgUmVjYWxjdWxhdGUgYmVzdCBpbmRleFxuICAjICAgYmVzdEluZGV4ID0gQGJlc3RJblBpbGUoKVxuICAjICAgaWYgYmVzdEluZGV4ID09IChAcGlsZS5sZW5ndGggLSAxKVxuICAjICAgICAjIFRoZSBjYXJkIHRoaXMgcGxheWVyIGp1c3QgdGhyZXcgaXMgdGhlIGJlc3QgY2FyZC4gQ2xhaW0gdGhlIHRyaWNrLlxuICAjICAgICBAdHJpY2tUYWtlciA9IEB0dXJuXG5cbiAgIyAgIGlmIEBwaWxlLmxlbmd0aCA9PSAxXG4gICMgICAgIG1zZyA9IGN1cnJlbnRQbGF5ZXIubmFtZSArIFwiIGxlYWRzIHdpdGggXCIgKyBjaG9zZW5DYXJkLm5hbWVcbiAgIyAgIGVsc2VcbiAgIyAgICAgaWYgQHRyaWNrVGFrZXIgPT0gQHR1cm5cbiAgIyAgICAgICBtc2cgPSBjdXJyZW50UGxheWVyLm5hbWUgKyBcIiBjbGFpbXMgdGhlIHRyaWNrIHdpdGggXCIgKyBjaG9zZW5DYXJkLm5hbWVcbiAgIyAgICAgZWxzZVxuICAjICAgICAgIG1zZyA9IGN1cnJlbnRQbGF5ZXIubmFtZSArIFwiIGR1bXBzIFwiICsgY2hvc2VuQ2FyZC5uYW1lXG5cbiAgIyAgIGlmKCghQHRydW1wQnJva2VuKSAmJiAoY2hvc2VuQ2FyZC5zdWl0ID09IFN1aXQuU1BBREVTKSlcbiAgIyAgICAgbXNnICs9IFwiICh0cnVtcCBicm9rZW4pXCJcbiAgIyAgICAgQHRydW1wQnJva2VuID0gdHJ1ZVxuXG4gICMgICBAb3V0cHV0KG1zZylcblxuICAjICAgaWYgQHBpbGUubGVuZ3RoID09IEBwbGF5ZXJzLmxlbmd0aFxuICAjICAgICBAZW5kVHJpY2soKVxuICAjICAgZWxzZVxuICAjICAgICBAdHVybiA9IEBwbGF5ZXJBZnRlcihAdHVybilcblxuICAjICAgcmV0dXJuIE9LXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyBBSVxuXG4gICMgIyBIZWxwZXIgZnVuY3Rpb24gdG8gYmlkIHJlYXNvbmluZyBmb3IgYmlkZGluZyBpIHRyaWNrc1xuICAjIGFpTG9nQmlkOiAoaSwgd2h5KSAtPlxuICAjICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcbiAgIyAgIGlmIG5vdCBjdXJyZW50UGxheWVyLmFpXG4gICMgICAgIHJldHVybiBmYWxzZVxuXG4gICMgICBjYXJkID0gbmV3IENhcmQoY3VycmVudFBsYXllci5oYW5kW2ldKVxuICAjICAgQGFpTG9nKCdwb3RlbnRpYWwgd2lubmVyOiAnICsgY2FyZC5uYW1lICsgJyBbJyArIHdoeSArICddJylcblxuICAjICMgSGVscGVyIGZ1bmN0aW9uIHRvIGJpZCByZWFzb25pbmcgZm9yIHBsYXlpbmcgY2FyZCBpbmRleCBpXG4gICMgYWlMb2dQbGF5OiAoaSwgd2h5KSAtPlxuICAjICAgaWYgaSA9PSAtMVxuICAjICAgICByZXR1cm5cblxuICAjICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcbiAgIyAgIGlmIG5vdCBjdXJyZW50UGxheWVyLmFpXG4gICMgICAgIHJldHVybiBmYWxzZVxuXG4gICMgICBjYXJkID0gbmV3IENhcmQoY3VycmVudFBsYXllci5oYW5kW2ldKVxuICAjICAgQGFpTG9nKCdiZXN0UGxheTogJyArIGNhcmQubmFtZSArICcgWycgKyB3aHkgKyAnXScpXG5cbiAgIyAjIEF0dGVtcHRzIHRvIGJpZCBpIHRyaWNrc1xuICAjIGFpQmlkOiAoY3VycmVudFBsYXllciwgaSkgLT5cbiAgIyAgIHJlcGx5ID0gQGJpZCh7J2lkJzpjdXJyZW50UGxheWVyLmlkLCAnYmlkJzppfSlcbiAgIyAgIGlmIHJlcGx5ID09IE9LXG4gICMgICAgIEBnYW1lLmxvZyhcIkFJOiBcIiArIGN1cnJlbnRQbGF5ZXIubmFtZSArIFwiIGJpZHMgXCIgKyBTdHJpbmcoaSkpXG4gICMgICAgIHJldHVybiB0cnVlXG4gICMgICByZXR1cm4gZmFsc2VcblxuICAjICMgQXR0ZW1wdHMgdG8gcGxheSBjYXJkIGluZGV4IGlcbiAgIyBhaVBsYXk6IChjdXJyZW50UGxheWVyLCBpKSAtPlxuICAjICAgY2FyZCA9IG5ldyBDYXJkKGN1cnJlbnRQbGF5ZXIuaGFuZFtpXSlcbiAgIyAgICMgQGdhbWUubG9nIFwiYWlQbGF5OiAje2l9XCJcbiAgIyAgIHJlcGx5ID0gQHBsYXkoeydpZCc6Y3VycmVudFBsYXllci5pZCwgJ2luZGV4JzppfSlcbiAgIyAgIGlmIHJlcGx5ID09IE9LXG4gICMgICAgIEBnYW1lLmxvZyhcIkFJOiBcIiArIGN1cnJlbnRQbGF5ZXIubmFtZSArIFwiIHBsYXlzIFwiICsgY2FyZC5uYW1lKVxuICAjICAgICByZXR1cm4gdHJ1ZVxuICAjICAgZWxzZVxuICAjICAgICBpZiByZXBseSA9PSAnZGVhbGVyRnVja2VkJ1xuICAjICAgICAgIEBvdXRwdXQoY3VycmVudFBsYXllci5uYW1lICsgJyBzYXlzIFwiSSBoYXRlIGJlaW5nIHRoZSBkZWFsZXIuXCInKVxuICAjICAgcmV0dXJuIGZhbHNlXG5cbiAgIyAjIFRyaWVzIHRvIHBsYXkgbG93ZXN0IGNhcmRzIGZpcnN0IChtb3ZlcyByaWdodClcbiAgIyBhaVBsYXlMb3c6IChjdXJyZW50UGxheWVyLCBzdGFydGluZ1BvaW50KSAtPlxuICAjICAgZm9yIGkgaW4gW3N0YXJ0aW5nUG9pbnQuLi5jdXJyZW50UGxheWVyLmhhbmQubGVuZ3RoXVxuICAjICAgICBpZiBAYWlQbGF5KGN1cnJlbnRQbGF5ZXIsIGkpXG4gICMgICAgICAgcmV0dXJuIHRydWVcbiAgIyAgIGZvciBpIGluIFswLi4uc3RhcnRpbmdQb2ludF1cbiAgIyAgICAgaWYgQGFpUGxheShjdXJyZW50UGxheWVyLCBpKVxuICAjICAgICAgIHJldHVybiB0cnVlXG4gICMgICByZXR1cm4gZmFsc2VcblxuICAjICMgVHJpZXMgdG8gcGxheSBoaWdoZXN0IGNhcmRzIGZpcnN0IChtb3ZlcyBsZWZ0KVxuICAjIGFpUGxheUhpZ2g6IChjdXJyZW50UGxheWVyLCBzdGFydGluZ1BvaW50KSAtPlxuICAjICAgZm9yIGkgaW4gW3N0YXJ0aW5nUG9pbnQuLjBdIGJ5IC0xXG4gICMgICAgIGlmKEBhaVBsYXkoY3VycmVudFBsYXllciwgaSkpXG4gICMgICAgICAgcmV0dXJuIHRydWVcbiAgIyAgIGZvciBpIGluIFtjdXJyZW50UGxheWVyLmhhbmQubGVuZ3RoLTEuLi5zdGFydGluZ1BvaW50XSBieSAtMVxuICAjICAgICBpZiBAYWlQbGF5KGN1cnJlbnRQbGF5ZXIsIGkpXG4gICMgICAgICAgcmV0dXJuIHRydWVcbiAgIyAgIHJldHVybiBmYWxzZVxuXG4gICMgR2VuZXJpYyBsb2dnaW5nIGZ1bmN0aW9uOyBwcmVwZW5kcyBjdXJyZW50IEFJIHBsYXllcidzIGd1dHMgYmVmb3JlIHByaW50aW5nIHRleHRcbiAgYWlMb2c6ICh0ZXh0KSAtPlxuICAgIGN1cnJlbnRQbGF5ZXIgPSBAY3VycmVudFBsYXllcigpXG4gICAgaWYgbm90IGN1cnJlbnRQbGF5ZXIuYWlcbiAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgY2hhcmFjdGVyID0gYWlDaGFyYWN0ZXJzW2N1cnJlbnRQbGF5ZXIuY2hhcklEXVxuICAgIEBnYW1lLmxvZygnQUlbJytjdXJyZW50UGxheWVyLm5hbWUrJyAnK2NoYXJhY3Rlci5icmFpbisnXTogaGFuZDonK3N0cmluZ2lmeUNhcmRzKGN1cnJlbnRQbGF5ZXIuaGFuZCkrJyBwaWxlOicrc3RyaW5naWZ5Q2FyZHMoQHBpbGUpKycgJyt0ZXh0KVxuXG4gICMgRGV0ZWN0cyBpZiB0aGUgY3VycmVudCBwbGF5ZXIgaXMgQUkgZHVyaW5nIGEgQklEIG9yIFRSSUNLIHBoYXNlIGFuZCBhY3RzIGFjY29yZGluZyB0byB0aGVpciAnYnJhaW4nXG4gIGFpVGljazogLT5cbiAgICBpZiBAd2lubmVyKCkgIT0gbnVsbFxuICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxuICAgIGlmIG5vdCBjdXJyZW50UGxheWVyLmFpXG4gICAgICByZXR1cm4gZmFsc2VcblxuICAgIEBhaUxvZyhcImFib3V0IHRvIGNhbGwgYnJhaW4ucGxheVwiKVxuICAgIGNoYXJhY3RlciA9IGFpQ2hhcmFjdGVyc1tjdXJyZW50UGxheWVyLmNoYXJJRF1cbiAgICBwbGF5ZWRDYXJkID0gQGJyYWluc1tjaGFyYWN0ZXIuYnJhaW5dLnBsYXkuYXBwbHkodGhpcywgW2N1cnJlbnRQbGF5ZXJdKVxuICAgIGlmIHBsYXllZENhcmRcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZWxzZVxuICAgICAgQGFpTG9nKCdicmFpbiBmYWlsZWQgdG8gcGxheTogcGFzc2luZycpXG4gICAgICByZXR1cm4gQGFpUGFzcyhjdXJyZW50UGxheWVyKVxuXG4gICAgIyAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICMgIyBCaWRkaW5nXG5cbiAgICAjIGlmIEBzdGF0ZSA9PSBTdGF0ZS5CSURcbiAgICAjICAgQGFpTG9nKFwiYWJvdXQgdG8gY2FsbCBicmFpbi5iaWRcIilcbiAgICAjICAgY2hhcmFjdGVyID0gYWlDaGFyYWN0ZXJzW2N1cnJlbnRQbGF5ZXIuY2hhcklEXVxuICAgICMgICBiaWQgPSBAYnJhaW5zW2NoYXJhY3Rlci5icmFpbl0uYmlkLmFwcGx5KHRoaXMsIFtjdXJyZW50UGxheWVyXSlcblxuICAgICMgICAjIFRyeSB0byBiaWQgYXMgY2xvc2UgYXMgeW91IGNhbiB0byB0aGUgJ2Jlc3QgYmlkJ1xuICAgICMgICBAYWlMb2coJ2JpZDonK1N0cmluZyhiaWQpKVxuICAgICMgICBpZiBAYWlCaWQoY3VycmVudFBsYXllciwgYmlkKVxuICAgICMgICAgIHJldHVybiB0cnVlXG4gICAgIyAgIGlmIEBhaUJpZChjdXJyZW50UGxheWVyLCBiaWQtMSlcbiAgICAjICAgICByZXR1cm4gdHJ1ZVxuICAgICMgICBpZiBAYWlCaWQoY3VycmVudFBsYXllciwgYmlkKzEpXG4gICAgIyAgICAgcmV0dXJuIHRydWVcbiAgICAjICAgaWYgQGFpQmlkKGN1cnJlbnRQbGF5ZXIsIGJpZC0yKVxuICAgICMgICAgIHJldHVybiB0cnVlXG4gICAgIyAgIGlmIEBhaUJpZChjdXJyZW50UGxheWVyLCBiaWQrMilcbiAgICAjICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgIyAgICMgR2l2ZSB1cCBhbmQgYmlkIHdoYXRldmVyIGlzIGFsbG93ZWRcbiAgICAjICAgZm9yIGkgaW4gWzAuLi5jdXJyZW50UGxheWVyLmhhbmQubGVuZ3RoXVxuICAgICMgICAgIGlmIEBhaUJpZChjdXJyZW50UGxheWVyLCBpKVxuICAgICMgICAgICAgQGFpTG9nKCdnYXZlIHVwIGFuZCBiaWQ6JytTdHJpbmcoaSkpXG4gICAgIyAgICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgIyAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICMgIyBQbGF5aW5nXG5cbiAgICAjIGlmIEBzdGF0ZSA9PSBTdGF0ZS5UUklDS1xuICAgICMgICBAYWlMb2coXCJhYm91dCB0byBjYWxsIGJyYWluLnBsYXlcIilcbiAgICAjICAgY2hhcmFjdGVyID0gYWlDaGFyYWN0ZXJzW2N1cnJlbnRQbGF5ZXIuY2hhcklEXVxuICAgICMgICBwbGF5ZWRDYXJkID0gQGJyYWluc1tjaGFyYWN0ZXIuYnJhaW5dLnBsYXkuYXBwbHkodGhpcywgW2N1cnJlbnRQbGF5ZXJdKVxuICAgICMgICBpZiBwbGF5ZWRDYXJkXG4gICAgIyAgICAgcmV0dXJuIHRydWVcbiAgICAjICAgZWxzZVxuICAgICMgICAgIEBhaUxvZygnYnJhaW4gZmFpbGVkIHRvIHBsYXkgY2FyZDogcGlja2luZyByYW5kb20gY2FyZCB0byBwbGF5JylcbiAgICAjICAgICBzdGFydGluZ1BvaW50ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY3VycmVudFBsYXllci5oYW5kLmxlbmd0aClcbiAgICAjICAgICByZXR1cm4gQGFpUGxheUxvdyhjdXJyZW50UGxheWVyLCBzdGFydGluZ1BvaW50KVxuXG4gICAgcmV0dXJuIGZhbHNlXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEFJIEJyYWluc1xuXG4gICMgQnJhaW5zIG11c3QgaGF2ZTpcbiAgIyAqIGlkOiBpbnRlcm5hbCBpZGVudGlmaWVyIGZvciB0aGUgYnJhaW5cbiAgIyAqIG5hbWU6IHByZXR0eSBuYW1lXG4gICMgKiBiaWQoY3VycmVudFBsYXllcikgcmV0dXJucyB0aGUgYmlkIHZhbHVlIGJldHdlZW4gWzAgLSBoYW5kU2l6ZV0uXG4gICMgKiBwbGF5KGN1cnJlbnRQbGF5ZXIpIGF0dGVtcHRzIHRvIHBsYXkgYSBjYXJkIGJ5IGNhbGxpbmcgYWlQbGF5KCkuIFNob3VsZCByZXR1cm4gdHJ1ZSBpZiBpdCBzdWNjZXNzZnVsbHkgcGxheWVkIGEgY2FyZCAoYWlQbGF5KCkgcmV0dXJuZWQgdHJ1ZSlcbiAgYnJhaW5zOlxuXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAjIE5vcm1hbDogSW50ZW5kZWQgdG8gYmUgdXNlZCBieSBtb3N0IGNoYXJhY3RlcnMuXG4gICAgIyAgICAgICAgIE5vdCB0b28gZHVtYiwgbm90IHRvbyBzbWFydC5cbiAgICBub3JtYWw6XG4gICAgICBpZDogICBcIm5vcm1hbFwiXG4gICAgICBuYW1lOiBcIk5vcm1hbFwiXG5cbiAgICAgICMgbm9ybWFsXG4gICAgICBwbGF5OiAoY3VycmVudFBsYXllcikgLT5cbiAgICAgICAgQGFpUGxheShjdXJyZW50UGxheWVyLCBbY3VycmVudFBsYXllci5oYW5kWzBdXSlcbiAgICAgICAgcmV0dXJuIHRydWVcblxuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgIyBDaGFvczogQ29tcGxldGVseSByYW5kb20uIFByb2JhYmx5IGF3ZnVsIHRvIHBsYXkgYWdhaW5zdC5cbiAgICBjaGFvczpcbiAgICAgIGlkOiAgIFwiY2hhb3NcIlxuICAgICAgbmFtZTogXCJDaGFvc1wiXG5cbiAgICAgICMgY2hhb3NcbiAgICAgIGJpZDogKGN1cnJlbnRQbGF5ZXIpIC0+XG4gICAgICAgICMgcGljayBhIGJpZCBzb21ld2hlcmUgaW4gdGhlIGZpcnN0IDUwJVxuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY3VycmVudFBsYXllci5oYW5kLmxlbmd0aCAqIDAuNSlcblxuICAgICAgIyBjaGFvc1xuICAgICAgcGxheTogKGN1cnJlbnRQbGF5ZXIpIC0+XG4gICAgICAgIGxlZ2FsSW5kaWNlcyA9IFtdXG4gICAgICAgIGZvciB2LCBpIGluIGN1cnJlbnRQbGF5ZXIuaGFuZFxuICAgICAgICAgIGNhblBsYXlDYXJkID0gQGNhblBsYXkoeyBpZDogY3VycmVudFBsYXllci5pZCwgaW5kZXg6IGkgfSlcbiAgICAgICAgICBpZiBjYW5QbGF5Q2FyZCA9PSBPS1xuICAgICAgICAgICAgbGVnYWxJbmRpY2VzLnB1c2ggaVxuICAgICAgICAgICMgZWxzZVxuICAgICAgICAgICMgICBAYWlMb2cgXCJjYW5QbGF5Q2FyZCAje2l9IHJldHVybmVkICN7Y2FuUGxheUNhcmR9XCJcbiAgICAgICAgcmFuZG9tSW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBsZWdhbEluZGljZXMubGVuZ3RoKVxuICAgICAgICBAYWlMb2cgXCJsZWdhbCBpbmRpY2VzOiAje0pTT04uc3RyaW5naWZ5KGxlZ2FsSW5kaWNlcyl9LCBjaG9vc2luZyBpbmRleCAje2xlZ2FsSW5kaWNlc1tyYW5kb21JbmRleF19XCJcbiAgICAgICAgcmV0dXJuIEBhaVBsYXkoY3VycmVudFBsYXllciwgbGVnYWxJbmRpY2VzW3JhbmRvbUluZGV4XSlcblxuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgIyBDb25zZXJ2YXRpdmUgTW9yb246IEJpZHMgc3BhZGUgY291bnQsIGFuZCBwbGF5cyBsb3cgY2FyZHMuXG4gICAgY29uc2VydmF0aXZlTW9yb246XG4gICAgICBpZDogICBcImNvbnNlcnZhdGl2ZU1vcm9uXCJcbiAgICAgIG5hbWU6IFwiQ29uc2VydmF0aXZlIE1vcm9uXCJcblxuICAgICAgIyBjb25zZXJ2YXRpdmVNb3JvblxuICAgICAgYmlkOiAoY3VycmVudFBsYXllcikgLT5cbiAgICAgICAgYmlkID0gMFxuICAgICAgICBmb3IgdiBpbiBjdXJyZW50UGxheWVyLmhhbmRcbiAgICAgICAgICBjYXJkID0gbmV3IENhcmQodilcbiAgICAgICAgICBiaWQrKyBpZiBjYXJkLnN1aXQgPT0gU3VpdC5TUEFERVNcbiAgICAgICAgQGFpTG9nIFwiSSBhbSBhIG1vcm9uIGFuZCBJIGhhdmUgI3tiaWR9IHNwYWRlcy4gTGV0J3Mgcm9sbCB3aXRoIGl0LlwiXG4gICAgICAgIHJldHVybiBiaWRcblxuICAgICAgIyBjb25zZXJ2YXRpdmVNb3JvblxuICAgICAgcGxheTogKGN1cnJlbnRQbGF5ZXIpIC0+XG4gICAgICAgIEBhaUxvZyBcInBsYXlpbmcgbG93ZXN0IHBvc3NpYmxlIGNhcmRcIlxuICAgICAgICByZXR1cm4gQGFpUGxheUxvdyhjdXJyZW50UGxheWVyLCAwKVxuXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAjIEFnZ3Jlc3NpdmUgTW9yb246IEJpZHMgc3BhZGVzIGFuZCBhY2VzLCBhbmQgcGxheXMgaGlnaCBjYXJkcy5cbiAgICBhZ2dyZXNzaXZlTW9yb246XG4gICAgICBpZDogICBcImFnZ3Jlc3NpdmVNb3JvblwiXG4gICAgICBuYW1lOiBcIkFnZ3Jlc3NpdmUgTW9yb25cIlxuXG4gICAgICAjIGFnZ3Jlc3NpdmVNb3JvblxuICAgICAgYmlkOiAoY3VycmVudFBsYXllcikgLT5cbiAgICAgICAgYmlkID0gMFxuICAgICAgICBmb3IgdiBpbiBjdXJyZW50UGxheWVyLmhhbmRcbiAgICAgICAgICBjYXJkID0gbmV3IENhcmQodilcbiAgICAgICAgICBiaWQrKyBpZiAoY2FyZC5zdWl0ID09IFN1aXQuU1BBREVTKSBvciAoY2FyZC52YWx1ZSA9PSAxMilcbiAgICAgICAgQGFpTG9nIFwiSSBhbSBhIG1vcm9uIGFuZCBJIGhhdmUgI3tiaWR9IHNwYWRlcyBhbmQvb3IgYWNlcy4gRmFydC5cIlxuICAgICAgICByZXR1cm4gYmlkXG5cbiAgICAgICMgYWdncmVzc2l2ZU1vcm9uXG4gICAgICBwbGF5OiAoY3VycmVudFBsYXllcikgLT5cbiAgICAgICAgQGFpTG9nIFwicGxheWluZyBoaWdoZXN0IHBvc3NpYmxlIGNhcmRcIlxuICAgICAgICByZXR1cm4gQGFpUGxheUhpZ2goY3VycmVudFBsYXllciwgY3VycmVudFBsYXllci5oYW5kLmxlbmd0aCAtIDEpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEFJIGNhcmQgaGVscGVyc1xuXG52YWx1ZXNPZlN1aXQgPSAoaGFuZCwgc3VpdCkgLT5cbiAgdmFsdWVzID0gW11cbiAgZm9yIHYgaW4gaGFuZFxuICAgIGNhcmQgPSBuZXcgQ2FyZCh2KVxuICAgIGlmIGNhcmQuc3VpdCA9PSBzdWl0XG4gICAgICB2YWx1ZXMucHVzaChjYXJkLnZhbHVlKVxuICByZXR1cm4gdmFsdWVzXG5cbnN0cmluZ2lmeUNhcmRzID0gKGNhcmRzKSAtPlxuICB0ID0gJydcbiAgZm9yIHYgaW4gY2FyZHNcbiAgICBjYXJkID0gbmV3IENhcmQodilcbiAgICBpZih0KVxuICAgICAgdCArPSAnLCdcbiAgICB0ICs9IGNhcmQubmFtZVxuXG4gIHJldHVybiAnWycrdCsnXSdcblxubG93ZXN0SW5kZXhJblN1aXQgPSAoaGFuZCwgc3VpdCkgLT5cbiAgZm9yIHYsaSBpbiBoYW5kXG4gICAgY2FyZCA9IG5ldyBDYXJkKHYpXG4gICAgaWYgY2FyZC5zdWl0ID09IHN1aXRcbiAgICAgIHJldHVybiBpXG4gIHJldHVybiAtMVxuXG5oaWdoZXN0SW5kZXhJblN1aXQgPSAoaGFuZCwgc3VpdCkgLT5cbiAgZm9yIHYsaSBpbiBoYW5kIGJ5IC0xXG4gICAgY2FyZCA9IG5ldyBDYXJkKHYpXG4gICAgaWYgY2FyZC5zdWl0ID09IHN1aXRcbiAgICAgIHJldHVybiBpXG4gIHJldHVybiAtMVxuXG5sb3dlc3RWYWx1ZUluZGV4ID0gKGhhbmQsIGF2b2lkU3VpdCkgLT4gIyB1c2UgU3VpdC5OT05FIHRvIHJldHVybiBhbnkgc3VpdFxuICBjYXJkID0gbmV3IENhcmQoaGFuZFswXSlcbiAgbG93ZXN0SW5kZXggPSAwXG4gIGxvd2VzdFZhbHVlID0gY2FyZC52YWx1ZVxuICBmb3IgaSBpbiBbMS4uLmhhbmQubGVuZ3RoXVxuICAgIGNhcmQgPSBuZXcgQ2FyZChoYW5kW2ldKVxuICAgIGlmIGNhcmQuc3VpdCAhPSBhdm9pZFN1aXRcbiAgICAgIGlmIGNhcmQudmFsdWUgPCBsb3dlc3RWYWx1ZVxuICAgICAgICBsb3dlc3RWYWx1ZSA9IGNhcmQudmFsdWVcbiAgICAgICAgbG93ZXN0SW5kZXggPSBpXG4gIHJldHVybiBsb3dlc3RJbmRleFxuXG5oaWdoZXN0VmFsdWVOb25TcGFkZUluZGV4ID0gKGhhbmQsIGF2b2lkU3VpdCkgLT5cbiAgaGlnaGVzdEluZGV4ID0gLTFcbiAgaGlnaGVzdFZhbHVlID0gLTFcbiAgZm9yIGkgaW4gW2hhbmQubGVuZ3RoLTEuLjBdIGJ5IC0xXG4gICAgY2FyZCA9IG5ldyBDYXJkKGhhbmRbaV0pXG4gICAgaWYgKGNhcmQuc3VpdCAhPSBhdm9pZFN1aXQpICYmIChjYXJkLnN1aXQgIT0gU3VpdC5TUEFERVMpXG4gICAgICBpZiBjYXJkLnZhbHVlID4gaGlnaGVzdFZhbHVlXG4gICAgICAgIGhpZ2hlc3RWYWx1ZSA9IGNhcmQudmFsdWVcbiAgICAgICAgaGlnaGVzdEluZGV4ID0gaVxuICByZXR1cm4gaGlnaGVzdEluZGV4XG5cbmhpZ2hlc3RWYWx1ZUluZGV4SW5TdWl0TG93ZXJUaGFuID0gKGhhbmQsIHdpbm5pbmdDYXJkKSAtPlxuICBmb3IgaSBpbiBbaGFuZC5sZW5ndGgtMS4uMF0gYnkgLTFcbiAgICBjYXJkID0gbmV3IENhcmQoaGFuZFtpXSlcbiAgICBpZiAoY2FyZC5zdWl0ID09IHdpbm5pbmdDYXJkLnN1aXQpICYmIChjYXJkLnZhbHVlIDwgd2lubmluZ0NhcmQudmFsdWUpXG4gICAgICByZXR1cm4gaVxuICByZXR1cm4gLTFcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgRXhwb3J0c1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIENhcmQ6IENhcmRcbiAgVGhpcnRlZW46IFRoaXJ0ZWVuXG4gIE9LOiBPS1xuICBhaUNoYXJhY3RlcnM6IGFpQ2hhcmFjdGVyc1xuXG4iLCJtb2R1bGUuZXhwb3J0cyA9XG4gIGRhcmtmb3Jlc3Q6XG4gICAgaGVpZ2h0OiA3MlxuICAgIGdseXBoczpcbiAgICAgICc5NycgOiB7IHg6ICAgOCwgeTogICA4LCB3aWR0aDogIDM0LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzk4JyA6IHsgeDogICA4LCB5OiAgNTgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnOTknIDogeyB4OiAgNTAsIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICcxMDAnOiB7IHg6ICAgOCwgeTogMTE4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzEwMSc6IHsgeDogICA4LCB5OiAxNzgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnMTAyJzogeyB4OiAgIDgsIHk6IDIyOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDMzIH1cbiAgICAgICcxMDMnOiB7IHg6ICAgOCwgeTogMjc4LCB3aWR0aDogIDM2LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzUgfVxuICAgICAgJzEwNCc6IHsgeDogICA4LCB5OiAzMjgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnMTA1JzogeyB4OiAgIDgsIHk6IDM3OCwgd2lkdGg6ICAxMiwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDExIH1cbiAgICAgICcxMDYnOiB7IHg6ICAgOCwgeTogNDI4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MSwgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzEwNyc6IHsgeDogIDI4LCB5OiAzNzgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQxLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnMTA4JzogeyB4OiAgNTEsIHk6IDMyOCwgd2lkdGg6ICAzNCwgaGVpZ2h0OiAgNDEsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDMzIH1cbiAgICAgICcxMDknOiB7IHg6ICA1MSwgeTogNDI3LCB3aWR0aDogIDM4LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzcgfVxuICAgICAgJzExMCc6IHsgeDogIDcxLCB5OiAzNzcsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnMTExJzogeyB4OiAgOTcsIHk6IDQyNywgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDEsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICcxMTInOiB7IHg6ICA1MSwgeTogIDU4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzExMyc6IHsgeDogIDUxLCB5OiAxMDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQ1LCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnMTE0JzogeyB4OiAgOTMsIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM1IH1cbiAgICAgICcxMTUnOiB7IHg6ICA1MSwgeTogMTYxLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzUgfVxuICAgICAgJzExNic6IHsgeDogIDUxLCB5OiAyMTEsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzMyB9XG4gICAgICAnMTE3JzogeyB4OiAgNTIsIHk6IDI2MSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICcxMTgnOiB7IHg6ICA5MywgeTogMzExLCB3aWR0aDogIDM0LCBoZWlnaHQ6ICA0MSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzIgfVxuICAgICAgJzExOSc6IHsgeDogMTE0LCB5OiAzNjAsIHdpZHRoOiAgMzgsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzOCB9XG4gICAgICAnMTIwJzogeyB4OiAxNDAsIHk6IDQxMCwgd2lkdGg6ICAzNiwgaGVpZ2h0OiAgNDEsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM3IH1cbiAgICAgICcxMjEnOiB7IHg6IDE0MCwgeTogNDU5LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzEyMic6IHsgeDogMTgzLCB5OiA0NTksIHdpZHRoOiAgMzYsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNSB9XG4gICAgICAnNjUnIDogeyB4OiAgOTQsIHk6ICA1OCwgd2lkdGg6ICAzNCwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cbiAgICAgICc2NicgOiB7IHg6ICA5NCwgeTogMTE5LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzcgfVxuICAgICAgJzY3JyA6IHsgeDogIDk0LCB5OiAxODAsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XG4gICAgICAnNjgnIDogeyB4OiAgOTUsIHk6IDI0MSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM3IH1cbiAgICAgICc2OScgOiB7IHg6IDEzNiwgeTogICA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxuICAgICAgJzcwJyA6IHsgeDogMTM3LCB5OiAgNjksIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnNzEnIDogeyB4OiAxNzksIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cbiAgICAgICc3MicgOiB7IHg6IDEzNywgeTogMTMwLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxuICAgICAgJzczJyA6IHsgeDogMTM4LCB5OiAxOTEsIHdpZHRoOiAgMTIsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAxMyB9XG4gICAgICAnNzQnIDogeyB4OiAxMzgsIHk6IDI1Miwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cbiAgICAgICc3NScgOiB7IHg6IDE1OCwgeTogMTkxLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxuICAgICAgJzc2JyA6IHsgeDogMTYwLCB5OiAzMTMsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnNzcnIDogeyB4OiAxODEsIHk6IDI1MSwgd2lkdGg6ICAzOCwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM5IH1cbiAgICAgICc3OCcgOiB7IHg6IDE4NCwgeTogMzc0LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxuICAgICAgJzc5JyA6IHsgeDogMjAzLCB5OiAzMTIsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNSB9XG4gICAgICAnODAnIDogeyB4OiAxODAsIHk6ICA2OSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICc4MScgOiB7IHg6IDIwMSwgeTogMTMwLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1NiwgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxuICAgICAgJzgyJyA6IHsgeDogMjIyLCB5OiAgIDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XG4gICAgICAnODMnIDogeyB4OiAyMjMsIHk6ICA2OSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM1IH1cbiAgICAgICc4NCcgOiB7IHg6IDI2NSwgeTogICA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzMgfVxuICAgICAgJzg1JyA6IHsgeDogMjI3LCB5OiAxOTQsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNSB9XG4gICAgICAnODYnIDogeyB4OiAyNDQsIHk6IDEzMCwgd2lkdGg6ICA0MSwgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDE5LCB4YWR2YW5jZTogIDM5IH1cbiAgICAgICc4NycgOiB7IHg6IDI2NiwgeTogIDY5LCB3aWR0aDogIDM4LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzcgfVxuICAgICAgJzg4JyA6IHsgeDogMzA4LCB5OiAgIDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAxOSwgeGFkdmFuY2U6ICAzNSB9XG4gICAgICAnODknIDogeyB4OiAyMjcsIHk6IDM3Mywgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDE5LCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICc5MCcgOiB7IHg6IDIyNywgeTogNDMzLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxuICAgICAgJzMzJyA6IHsgeDogMjQ2LCB5OiAyNTUsIHdpZHRoOiAgMTQsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAxMSB9XG4gICAgICAnNTknIDogeyB4OiAxODAsIHk6IDEzMCwgd2lkdGg6ICAxMywgaGVpZ2h0OiAgMzcsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDU2LCB4YWR2YW5jZTogIDEzIH1cbiAgICAgICczNycgOiB7IHg6ICA5NSwgeTogMzAyLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxuICAgICAgJzU4JyA6IHsgeDogMTYwLCB5OiAzNzQsIHdpZHRoOiAgMTMsIGhlaWdodDogIDIzLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA1MCwgeGFkdmFuY2U6ICAxMyB9XG4gICAgICAnNjMnIDogeyB4OiAyNjgsIHk6IDI1NSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDMzIH1cbiAgICAgICc0MicgOiB7IHg6IDEwMywgeTogMzAyLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxuICAgICAgJzQwJyA6IHsgeDogMjcwLCB5OiAxOTAsIHdpZHRoOiAgMjMsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAyMSB9XG4gICAgICAnNDEnIDogeyB4OiAyOTMsIHk6IDEzMCwgd2lkdGg6ICAyMywgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDIxIH1cbiAgICAgICc5NScgOiB7IHg6IDExMSwgeTogMzAyLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxuICAgICAgJzQzJyA6IHsgeDogMjQ2LCB5OiAzMTYsIHdpZHRoOiAgMzUsIGhlaWdodDogIDM0LCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAzOSwgeGFkdmFuY2U6ICAzMiB9XG4gICAgICAnNDUnIDogeyB4OiAxODQsIHk6IDQzNSwgd2lkdGg6ICAyNiwgaGVpZ2h0OiAgMTEsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDQ0LCB4YWR2YW5jZTogIDI1IH1cbiAgICAgICc2MScgOiB7IHg6IDMxMiwgeTogIDY4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICAzMCwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgNDIsIHhhZHZhbmNlOiAgMzMgfVxuICAgICAgJzQ2JyA6IHsgeDogMTM1LCB5OiAzMTMsIHdpZHRoOiAgMTQsIGhlaWdodDogIDExLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA2MSwgeGFkdmFuY2U6ICAxNCB9XG4gICAgICAnNDQnIDogeyB4OiAyMjcsIHk6IDI1NSwgd2lkdGg6ICAxMCwgaGVpZ2h0OiAgMjEsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDY4LCB4YWR2YW5jZTogIDExIH1cbiAgICAgICc0NycgOiB7IHg6IDM1MSwgeTogICA4LCB3aWR0aDogIDI4LCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgMTksIHhhZHZhbmNlOiAgMjYgfVxuICAgICAgJzEyNCc6IHsgeDogMTE5LCB5OiAzMDIsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XG4gICAgICAnMzQnIDogeyB4OiAxMjcsIHk6IDMwMiwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cbiAgICAgICczOScgOiB7IHg6IDIwMSwgeTogMTk0LCB3aWR0aDogIDE4LCBoZWlnaHQ6ICAxOSwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgIDAsIHhhZHZhbmNlOiAgMjEgfVxuICAgICAgJzY0JyA6IHsgeDogMjE4LCB5OiA0MzUsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XG4gICAgICAnMzUnIDogeyB4OiAyMTgsIHk6IDQ0Mywgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cbiAgICAgICczNicgOiB7IHg6IDMwMSwgeTogMTkwLCB3aWR0aDogIDMyLCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgMjIsIHhhZHZhbmNlOiAgMjkgfVxuICAgICAgJzk0JyA6IHsgeDogMjE4LCB5OiA0NTEsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XG4gICAgICAnMzgnIDogeyB4OiAyNDYsIHk6IDM1OCwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cbiAgICAgICcxMjMnOiB7IHg6IDMyNCwgeTogMTA2LCB3aWR0aDogIDI3LCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMjYgfVxuICAgICAgJzEyNSc6IHsgeDogMjcwLCB5OiAzNTgsIHdpZHRoOiAgMjcsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAyNyB9XG4gICAgICAnOTEnIDogeyB4OiAyNzAsIHk6IDQxOCwgd2lkdGg6ICAyMiwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDIxIH1cbiAgICAgICc5MycgOiB7IHg6IDMwMCwgeTogNDE4LCB3aWR0aDogIDIyLCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMjAgfVxuICAgICAgJzQ4JyA6IHsgeDogMzA1LCB5OiAzMTYsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XG4gICAgICAnNDknIDogeyB4OiAzMTEsIHk6IDI1MSwgd2lkdGg6ICAzNCwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM1IH1cbiAgICAgICc1MCcgOiB7IHg6IDM0MSwgeTogMTY2LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzcgfVxuICAgICAgJzUxJyA6IHsgeDogMzU5LCB5OiAgNjgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XG4gICAgICAnNTInIDogeyB4OiAzMzAsIHk6IDM3Nywgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM1IH1cbiAgICAgICc1MycgOiB7IHg6IDM0OCwgeTogMzEyLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzcgfVxuICAgICAgJzU0JyA6IHsgeDogMzMwLCB5OiA0MzgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XG4gICAgICAnNTUnIDogeyB4OiAzNTMsIHk6IDIyNywgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICc1NicgOiB7IHg6IDM4NCwgeTogMTI5LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxuICAgICAgJzU3JyA6IHsgeDogNDAyLCB5OiAgIDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XG4gICAgICAnMzInIDogeyB4OiAgIDAsIHk6ICAgMCwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDIyIH1cbiIsIiMgVGhpcyBmaWxlIHByb3ZpZGVzIHRoZSByZW5kZXJpbmcgZW5naW5lIGZvciB0aGUgd2ViIHZlcnNpb24uIE5vbmUgb2YgdGhpcyBjb2RlIGlzIGluY2x1ZGVkIGluIHRoZSBKYXZhIHZlcnNpb24uXG5cbmNvbnNvbGUubG9nICd3ZWIgc3RhcnR1cCdcblxuR2FtZSA9IHJlcXVpcmUgJy4vR2FtZSdcblxuIyB0YWtlbiBmcm9tIGh0dHA6I3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy81NjIzODM4L3JnYi10by1oZXgtYW5kLWhleC10by1yZ2JcbmNvbXBvbmVudFRvSGV4ID0gKGMpIC0+XG4gIGhleCA9IE1hdGguZmxvb3IoYyAqIDI1NSkudG9TdHJpbmcoMTYpXG4gIHJldHVybiBpZiBoZXgubGVuZ3RoID09IDEgdGhlbiBcIjBcIiArIGhleCBlbHNlIGhleFxucmdiVG9IZXggPSAociwgZywgYikgLT5cbiAgcmV0dXJuIFwiI1wiICsgY29tcG9uZW50VG9IZXgocikgKyBjb21wb25lbnRUb0hleChnKSArIGNvbXBvbmVudFRvSGV4KGIpXG5cblNBVkVfVElNRVJfTVMgPSAzMDAwXG5cbmNsYXNzIE5hdGl2ZUFwcFxuICBjb25zdHJ1Y3RvcjogKEBzY3JlZW4sIEB3aWR0aCwgQGhlaWdodCkgLT5cbiAgICBAdGludGVkVGV4dHVyZUNhY2hlID0gW11cbiAgICBAbGFzdFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuICAgIEBsYXN0SW50ZXJhY3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcbiAgICBAaGVhcmRPbmVUb3VjaCA9IGZhbHNlXG4gICAgQHRvdWNoTW91c2UgPSBudWxsXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNlZG93bicsICBAb25Nb3VzZURvd24uYmluZCh0aGlzKSwgZmFsc2VcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2Vtb3ZlJywgIEBvbk1vdXNlTW92ZS5iaW5kKHRoaXMpLCBmYWxzZVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdtb3VzZXVwJywgICAgQG9uTW91c2VVcC5iaW5kKHRoaXMpLCBmYWxzZVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICd0b3VjaHN0YXJ0JywgQG9uVG91Y2hTdGFydC5iaW5kKHRoaXMpLCBmYWxzZVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICd0b3VjaG1vdmUnLCAgQG9uVG91Y2hNb3ZlLmJpbmQodGhpcyksIGZhbHNlXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ3RvdWNoZW5kJywgICBAb25Ub3VjaEVuZC5iaW5kKHRoaXMpLCBmYWxzZVxuICAgIEBjb250ZXh0ID0gQHNjcmVlbi5nZXRDb250ZXh0KFwiMmRcIilcbiAgICBAdGV4dHVyZXMgPSBbXG4gICAgICAjIGFsbCBjYXJkIGFydFxuICAgICAgXCIuLi9pbWFnZXMvY2FyZHMucG5nXCJcbiAgICAgICMgZm9udHNcbiAgICAgIFwiLi4vaW1hZ2VzL2Rhcmtmb3Jlc3QucG5nXCJcbiAgICAgICMgY2hhcmFjdGVycyAvIG90aGVyXG4gICAgICBcIi4uL2ltYWdlcy9jaGFycy5wbmdcIlxuICAgICAgIyBoZWxwXG4gICAgICBcIi4uL2ltYWdlcy9ob3d0bzEucG5nXCJcbiAgICAgIFwiLi4vaW1hZ2VzL2hvd3RvMi5wbmdcIlxuICAgICAgXCIuLi9pbWFnZXMvaG93dG8zLnBuZ1wiXG4gICAgXVxuXG4gICAgQGdhbWUgPSBuZXcgR2FtZSh0aGlzLCBAd2lkdGgsIEBoZWlnaHQpXG5cbiAgICBpZiB0eXBlb2YgU3RvcmFnZSAhPSBcInVuZGVmaW5lZFwiXG4gICAgICBzdGF0ZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtIFwic3RhdGVcIlxuICAgICAgaWYgc3RhdGVcbiAgICAgICAgIyBjb25zb2xlLmxvZyBcImxvYWRpbmcgc3RhdGU6ICN7c3RhdGV9XCJcbiAgICAgICAgQGdhbWUubG9hZCBzdGF0ZVxuXG4gICAgQHBlbmRpbmdJbWFnZXMgPSAwXG4gICAgbG9hZGVkVGV4dHVyZXMgPSBbXVxuICAgIGZvciBpbWFnZVVybCBpbiBAdGV4dHVyZXNcbiAgICAgIEBwZW5kaW5nSW1hZ2VzKytcbiAgICAgIGNvbnNvbGUubG9nIFwibG9hZGluZyBpbWFnZSAje0BwZW5kaW5nSW1hZ2VzfTogI3tpbWFnZVVybH1cIlxuICAgICAgaW1nID0gbmV3IEltYWdlKClcbiAgICAgIGltZy5vbmxvYWQgPSBAb25JbWFnZUxvYWRlZC5iaW5kKHRoaXMpXG4gICAgICBpbWcuc3JjID0gaW1hZ2VVcmxcbiAgICAgIGxvYWRlZFRleHR1cmVzLnB1c2ggaW1nXG4gICAgQHRleHR1cmVzID0gbG9hZGVkVGV4dHVyZXNcblxuICAgIEBzYXZlVGltZXIgPSBTQVZFX1RJTUVSX01TXG5cbiAgb25JbWFnZUxvYWRlZDogKGluZm8pIC0+XG4gICAgQHBlbmRpbmdJbWFnZXMtLVxuICAgIGlmIEBwZW5kaW5nSW1hZ2VzID09IDBcbiAgICAgIGNvbnNvbGUubG9nICdBbGwgaW1hZ2VzIGxvYWRlZC4gQmVnaW5uaW5nIHJlbmRlciBsb29wLidcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9PiBAdXBkYXRlKClcblxuICBsb2c6IChzKSAtPlxuICAgIGNvbnNvbGUubG9nIFwiTmF0aXZlQXBwLmxvZygpOiAje3N9XCJcblxuICB1cGRhdGVTYXZlOiAoZHQpIC0+XG4gICAgcmV0dXJuIGlmIHR5cGVvZiBTdG9yYWdlID09IFwidW5kZWZpbmVkXCJcbiAgICBAc2F2ZVRpbWVyIC09IGR0XG4gICAgaWYgQHNhdmVUaW1lciA8PSAwXG4gICAgICBAc2F2ZVRpbWVyID0gU0FWRV9USU1FUl9NU1xuICAgICAgc3RhdGUgPSBAZ2FtZS5zYXZlKClcbiAgICAgICMgY29uc29sZS5sb2cgXCJzYXZpbmc6ICN7c3RhdGV9XCJcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtIFwic3RhdGVcIiwgc3RhdGVcblxuICBnZW5lcmF0ZVRpbnRJbWFnZTogKHRleHR1cmVJbmRleCwgcmVkLCBncmVlbiwgYmx1ZSkgLT5cbiAgICBpbWcgPSBAdGV4dHVyZXNbdGV4dHVyZUluZGV4XVxuICAgIGJ1ZmYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50IFwiY2FudmFzXCJcbiAgICBidWZmLndpZHRoICA9IGltZy53aWR0aFxuICAgIGJ1ZmYuaGVpZ2h0ID0gaW1nLmhlaWdodFxuXG4gICAgY3R4ID0gYnVmZi5nZXRDb250ZXh0IFwiMmRcIlxuICAgIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnY29weSdcbiAgICBjdHguZHJhd0ltYWdlKGltZywgMCwgMClcbiAgICBmaWxsQ29sb3IgPSBcInJnYigje01hdGguZmxvb3IocmVkKjI1NSl9LCAje01hdGguZmxvb3IoZ3JlZW4qMjU1KX0sICN7TWF0aC5mbG9vcihibHVlKjI1NSl9KVwiXG4gICAgY3R4LmZpbGxTdHlsZSA9IGZpbGxDb2xvclxuICAgIGNvbnNvbGUubG9nIFwiZmlsbENvbG9yICN7ZmlsbENvbG9yfVwiXG4gICAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdtdWx0aXBseSdcbiAgICBjdHguZmlsbFJlY3QoMCwgMCwgYnVmZi53aWR0aCwgYnVmZi5oZWlnaHQpXG4gICAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdjb3B5J1xuICAgIGN0eC5nbG9iYWxBbHBoYSA9IDEuMFxuICAgIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnZGVzdGluYXRpb24taW4nXG4gICAgY3R4LmRyYXdJbWFnZShpbWcsIDAsIDApXG5cbiAgICBpbWdDb21wID0gbmV3IEltYWdlKClcbiAgICBpbWdDb21wLnNyYyA9IGJ1ZmYudG9EYXRhVVJMKClcbiAgICByZXR1cm4gaW1nQ29tcFxuXG4gIGRyYXdJbWFnZTogKHRleHR1cmVJbmRleCwgc3JjWCwgc3JjWSwgc3JjVywgc3JjSCwgZHN0WCwgZHN0WSwgZHN0VywgZHN0SCwgcm90LCBhbmNob3JYLCBhbmNob3JZLCByLCBnLCBiLCBhKSAtPlxuICAgIHRleHR1cmUgPSBAdGV4dHVyZXNbdGV4dHVyZUluZGV4XVxuICAgIGlmIChyICE9IDEpIG9yIChnICE9IDEpIG9yIChiICE9IDEpXG4gICAgICB0aW50ZWRUZXh0dXJlS2V5ID0gXCIje3RleHR1cmVJbmRleH0tI3tyfS0je2d9LSN7Yn1cIlxuICAgICAgdGludGVkVGV4dHVyZSA9IEB0aW50ZWRUZXh0dXJlQ2FjaGVbdGludGVkVGV4dHVyZUtleV1cbiAgICAgIGlmIG5vdCB0aW50ZWRUZXh0dXJlXG4gICAgICAgIHRpbnRlZFRleHR1cmUgPSBAZ2VuZXJhdGVUaW50SW1hZ2UgdGV4dHVyZUluZGV4LCByLCBnLCBiXG4gICAgICAgIEB0aW50ZWRUZXh0dXJlQ2FjaGVbdGludGVkVGV4dHVyZUtleV0gPSB0aW50ZWRUZXh0dXJlXG4gICAgICAgICMgY29uc29sZS5sb2cgXCJnZW5lcmF0ZWQgY2FjaGVkIHRleHR1cmUgI3t0aW50ZWRUZXh0dXJlS2V5fVwiXG4gICAgICB0ZXh0dXJlID0gdGludGVkVGV4dHVyZVxuXG4gICAgQGNvbnRleHQuc2F2ZSgpXG4gICAgQGNvbnRleHQudHJhbnNsYXRlIGRzdFgsIGRzdFlcbiAgICBAY29udGV4dC5yb3RhdGUgcm90ICMgKiAzLjE0MTU5MiAvIDE4MC4wXG4gICAgYW5jaG9yT2Zmc2V0WCA9IC0xICogYW5jaG9yWCAqIGRzdFdcbiAgICBhbmNob3JPZmZzZXRZID0gLTEgKiBhbmNob3JZICogZHN0SFxuICAgIEBjb250ZXh0LnRyYW5zbGF0ZSBhbmNob3JPZmZzZXRYLCBhbmNob3JPZmZzZXRZXG4gICAgQGNvbnRleHQuZ2xvYmFsQWxwaGEgPSBhXG4gICAgQGNvbnRleHQuZHJhd0ltYWdlKHRleHR1cmUsIHNyY1gsIHNyY1ksIHNyY1csIHNyY0gsIDAsIDAsIGRzdFcsIGRzdEgpXG4gICAgQGNvbnRleHQucmVzdG9yZSgpXG5cbiAgdXBkYXRlOiAtPlxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9PiBAdXBkYXRlKClcblxuICAgIG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG4gICAgZHQgPSBub3cgLSBAbGFzdFRpbWVcblxuICAgIHRpbWVTaW5jZUludGVyYWN0ID0gbm93IC0gQGxhc3RJbnRlcmFjdFRpbWVcbiAgICBpZiB0aW1lU2luY2VJbnRlcmFjdCA+IDUwMDBcbiAgICAgIGdvYWxGUFMgPSA1ICMgY2FsbSBkb3duLCBub2JvZHkgaXMgZG9pbmcgYW55dGhpbmcgZm9yIDUgc2Vjb25kc1xuICAgIGVsc2VcbiAgICAgIGdvYWxGUFMgPSAyMDAgIyBhcyBmYXN0IGFzIHBvc3NpYmxlXG4gICAgaWYgQGxhc3RHb2FsRlBTICE9IGdvYWxGUFNcbiAgICAgIGNvbnNvbGUubG9nIFwic3dpdGNoaW5nIHRvICN7Z29hbEZQU30gRlBTXCJcbiAgICAgIEBsYXN0R29hbEZQUyA9IGdvYWxGUFNcblxuICAgIGZwc0ludGVydmFsID0gMTAwMCAvIGdvYWxGUFNcbiAgICBpZiBkdCA8IGZwc0ludGVydmFsXG4gICAgICByZXR1cm5cbiAgICBAbGFzdFRpbWUgPSBub3dcblxuICAgIEBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBAd2lkdGgsIEBoZWlnaHQpXG4gICAgQGdhbWUudXBkYXRlKGR0KVxuICAgIHJlbmRlckNvbW1hbmRzID0gQGdhbWUucmVuZGVyKClcblxuICAgIGkgPSAwXG4gICAgbiA9IHJlbmRlckNvbW1hbmRzLmxlbmd0aFxuICAgIHdoaWxlIChpIDwgbilcbiAgICAgIGRyYXdDYWxsID0gcmVuZGVyQ29tbWFuZHMuc2xpY2UoaSwgaSArPSAxNilcbiAgICAgIEBkcmF3SW1hZ2UuYXBwbHkodGhpcywgZHJhd0NhbGwpXG5cbiAgICBAdXBkYXRlU2F2ZShkdClcblxuICBvblRvdWNoU3RhcnQ6IChldnQpIC0+XG4gICAgQGxhc3RJbnRlcmFjdFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuICAgIEBoZWFyZE9uZVRvdWNoID0gdHJ1ZVxuICAgIHRvdWNoZXMgPSBldnQuY2hhbmdlZFRvdWNoZXNcbiAgICBmb3IgdG91Y2ggaW4gdG91Y2hlc1xuICAgICAgaWYgQHRvdWNoTW91c2UgPT0gbnVsbFxuICAgICAgICBAdG91Y2hNb3VzZSA9IHRvdWNoLmlkZW50aWZpZXJcbiAgICAgIGlmIEB0b3VjaE1vdXNlID09IHRvdWNoLmlkZW50aWZpZXJcbiAgICAgICAgQGdhbWUudG91Y2hEb3duKHRvdWNoLmNsaWVudFgsIHRvdWNoLmNsaWVudFkpXG5cbiAgb25Ub3VjaE1vdmU6IChldnQpIC0+XG4gICAgQGxhc3RJbnRlcmFjdFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuICAgIHRvdWNoZXMgPSBldnQuY2hhbmdlZFRvdWNoZXNcbiAgICBmb3IgdG91Y2ggaW4gdG91Y2hlc1xuICAgICAgaWYgQHRvdWNoTW91c2UgPT0gdG91Y2guaWRlbnRpZmllclxuICAgICAgICBAZ2FtZS50b3VjaE1vdmUodG91Y2guY2xpZW50WCwgdG91Y2guY2xpZW50WSlcblxuICBvblRvdWNoRW5kOiAoZXZ0KSAtPlxuICAgIEBsYXN0SW50ZXJhY3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcbiAgICB0b3VjaGVzID0gZXZ0LmNoYW5nZWRUb3VjaGVzXG4gICAgZm9yIHRvdWNoIGluIHRvdWNoZXNcbiAgICAgIGlmIEB0b3VjaE1vdXNlID09IHRvdWNoLmlkZW50aWZpZXJcbiAgICAgICAgQGdhbWUudG91Y2hVcCh0b3VjaC5jbGllbnRYLCB0b3VjaC5jbGllbnRZKVxuICAgICAgICBAdG91Y2hNb3VzZSA9IG51bGxcbiAgICBpZiBldnQudG91Y2hlcy5sZW5ndGggPT0gMFxuICAgICAgQHRvdWNoTW91c2UgPSBudWxsXG5cbiAgb25Nb3VzZURvd246IChldnQpIC0+XG4gICAgaWYgQGhlYXJkT25lVG91Y2hcbiAgICAgIHJldHVyblxuICAgIEBsYXN0SW50ZXJhY3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcbiAgICBAZ2FtZS50b3VjaERvd24oZXZ0LmNsaWVudFgsIGV2dC5jbGllbnRZKVxuXG4gIG9uTW91c2VNb3ZlOiAoZXZ0KSAtPlxuICAgIGlmIEBoZWFyZE9uZVRvdWNoXG4gICAgICByZXR1cm5cbiAgICBAbGFzdEludGVyYWN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG4gICAgQGdhbWUudG91Y2hNb3ZlKGV2dC5jbGllbnRYLCBldnQuY2xpZW50WSlcblxuICBvbk1vdXNlVXA6IChldnQpIC0+XG4gICAgaWYgQGhlYXJkT25lVG91Y2hcbiAgICAgIHJldHVyblxuICAgIEBsYXN0SW50ZXJhY3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcbiAgICBAZ2FtZS50b3VjaFVwKGV2dC5jbGllbnRYLCBldnQuY2xpZW50WSlcblxuc2NyZWVuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ3NjcmVlbidcbnJlc2l6ZVNjcmVlbiA9IC0+XG4gIGRlc2lyZWRBc3BlY3RSYXRpbyA9IDE2IC8gOVxuICBjdXJyZW50QXNwZWN0UmF0aW8gPSB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodFxuICBpZiBjdXJyZW50QXNwZWN0UmF0aW8gPCBkZXNpcmVkQXNwZWN0UmF0aW9cbiAgICBzY3JlZW4ud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aFxuICAgIHNjcmVlbi5oZWlnaHQgPSBNYXRoLmZsb29yKHdpbmRvdy5pbm5lcldpZHRoICogKDEgLyBkZXNpcmVkQXNwZWN0UmF0aW8pKVxuICBlbHNlXG4gICAgc2NyZWVuLndpZHRoID0gTWF0aC5mbG9vcih3aW5kb3cuaW5uZXJIZWlnaHQgKiBkZXNpcmVkQXNwZWN0UmF0aW8pXG4gICAgc2NyZWVuLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxucmVzaXplU2NyZWVuKClcbiMgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ3Jlc2l6ZScsIHJlc2l6ZVNjcmVlbiwgZmFsc2VcblxuYXBwID0gbmV3IE5hdGl2ZUFwcChzY3JlZW4sIHNjcmVlbi53aWR0aCwgc2NyZWVuLmhlaWdodClcbiJdfQ==
