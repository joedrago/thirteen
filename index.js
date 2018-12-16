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
    var ch, code, glyph, i, inColor, j, len1, metrics, scale, totalHeight, totalWidth;
    metrics = fontmetrics[font];
    if (!metrics) {
      return;
    }
    scale = height / metrics.height;
    totalWidth = 0;
    totalHeight = metrics.height * scale;
    inColor = false;
    for (i = j = 0, len1 = str.length; j < len1; i = ++j) {
      ch = str[i];
      if (ch === '`') {
        inColor = !inColor;
      }
      if (!inColor) {
        code = ch.charCodeAt(0);
        glyph = metrics.glyphs[code];
        if (!glyph) {
          continue;
        }
        totalWidth += glyph.xadvance * scale;
      }
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
      pile: {
        r: 0.4,
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
      hand_pick: {
        r: 0,
        g: 0.1,
        b: 0,
        a: 1.0
      },
      hand_reorg: {
        r: 0.4,
        g: 0,
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
    headline = this.thirteen.headline();
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

  Game.prototype.pass = function() {
    return this.lastErr = this.thirteen.pass({
      id: 1
    });
  };

  Game.prototype.play = function(cards) {
    var card, j, len, rawCards, ret;
    console.log("(game) playing cards", cards);
    this.thirteen.updatePlayerHand(this.hand.cards);
    rawCards = [];
    for (j = 0, len = cards.length; j < len; j++) {
      card = cards[j];
      rawCards.push(card.card);
    }
    ret = this.thirteen.play({
      id: 1,
      cards: rawCards
    });
    this.lastErr = ret;
    if (ret === OK) {
      this.hand.set(this.thirteen.players[0].hand);
      return this.pile.hint(cards);
    }
  };

  Game.prototype.playPicked = function() {
    var cards;
    if (!this.hand.picking) {
      return;
    }
    cards = this.hand.selectedCards();
    this.hand.selectNone();
    if (cards.length === 0) {
      return this.pass();
    }
    return this.play(cards);
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
    var aiPlayers, character, characterHeight, characterMargin, characterWidth, countHeight, gameOverSize, gameOverY, handAreaHeight, handareaColor, i, j, len, line, lines, pileDimension, ref1, restartQuitSize, shadowDistance, textHeight, textPadding;
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
    this.charCeiling = this.height * 0.6;
    if (aiPlayers[0] !== null) {
      character = aiCharacters[aiPlayers[0].charID];
      characterWidth = this.spriteRenderer.calcWidth(character.sprite, characterHeight);
      this.spriteRenderer.render(character.sprite, characterMargin, this.charCeiling, 0, characterHeight, 0, 0, 1, this.colors.white);
      this.renderCount(aiPlayers[0], aiPlayers[0].index === this.thirteen.turn, countHeight, characterMargin + (characterWidth / 2), this.charCeiling - textPadding, 0.5, 0);
      this.renderAIHand(aiPlayers[0].count, characterMargin + (characterWidth / 2), this.charCeiling - textPadding, 0.5, 0);
    }
    if (aiPlayers[1] !== null) {
      character = aiCharacters[aiPlayers[1].charID];
      this.spriteRenderer.render(character.sprite, this.center.x, 0, 0, characterHeight, 0, 0.5, 0, this.colors.white);
      this.renderCount(aiPlayers[1], aiPlayers[1].index === this.thirteen.turn, countHeight, this.center.x, characterHeight, 0.5, 0);
      this.renderAIHand(aiPlayers[0].count, characterMargin + (characterWidth / 2), this.charCeiling - textPadding, 0.5, 0);
    }
    if (aiPlayers[2] !== null) {
      character = aiCharacters[aiPlayers[2].charID];
      characterWidth = this.spriteRenderer.calcWidth(character.sprite, characterHeight);
      this.spriteRenderer.render(character.sprite, this.width - characterMargin, this.charCeiling, 0, characterHeight, 0, 1, 1, this.colors.white);
      this.renderCount(aiPlayers[2], aiPlayers[2].index === this.thirteen.turn, countHeight, this.width - (characterMargin + (characterWidth / 2)), this.charCeiling - textPadding, 0.5, 0);
      this.renderAIHand(aiPlayers[0].count, characterMargin + (characterWidth / 2), this.charCeiling - textPadding, 0.5, 0);
    }
    handAreaHeight = 0.27 * this.height;
    if (this.hand.picking) {
      handareaColor = this.colors.hand_pick;
    } else {
      handareaColor = this.colors.hand_reorg;
    }
    this.spriteRenderer.render("solid", 0, this.height, this.width, handAreaHeight, 0, 0, 1, handareaColor, (function(_this) {
      return function() {
        return _this.hand.togglePicking();
      };
    })(this));
    pileDimension = this.height * 0.4;
    this.spriteRenderer.render("pile", this.width / 2, this.height / 2, pileDimension, pileDimension, 0, 0.5, 0.5, this.colors.white, (function(_this) {
      return function() {
        return _this.playPicked();
      };
    })(this));
    this.pile.render();
    this.hand.render();
    this.renderCount(this.thirteen.players[0], 0 === this.thirteen.turn, countHeight, this.center.x, this.height, 0.5, 1);
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
      this.fontRenderer.render(this.font, restartQuitSize, "Play Again", shadowDistance + this.center.x, shadowDistance + (this.height - (handAreaHeight * 0.5)), 0.5, 1, this.colors.black, (function(_this) {
        return function() {};
      })(this));
      this.fontRenderer.render(this.font, restartQuitSize, "Play Again", this.center.x, this.height - (handAreaHeight * 0.5), 0.5, 1, this.colors.gold, (function(_this) {
        return function() {
          _this.thirteen.deal();
          return _this.prepareGame();
        };
      })(this));
    }
    this.fontRenderer.render(this.font, textHeight, this.calcHeadline(), 0, 0, 0, 0, this.colors.lightgray);
    this.spriteRenderer.render("pause", this.width, 0, 0, this.pauseButtonSize, 0, 1, 0, this.colors.white, (function(_this) {
      return function() {
        return _this.paused = true;
      };
    })(this));
    if (!this.hand.picking) {
      this.fontRenderer.render(this.font, textHeight, "Unlocked", 0.02 * this.width, this.height - handAreaHeight, 0, 0, this.colors.white);
    }
    if (this.paused) {
      this.pauseMenu.render();
    }
  };

  Game.prototype.renderCount = function(player, myTurn, countHeight, x, y, anchorx, anchory) {
    var boxHeight, cardCount, countSize, countString, countY, nameColor, nameSize, nameString, nameY, trickColor;
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
    countString = " `" + trickColor + "`" + cardCount + "`` left ";
    nameSize = this.fontRenderer.size(this.font, countHeight, nameString);
    countSize = this.fontRenderer.size(this.font, countHeight, countString);
    if (nameSize.w > countSize.w) {
      countSize.w = nameSize.w;
    } else {
      nameSize.w = countSize.w;
    }
    nameY = y;
    countY = y;
    boxHeight = countSize.h;
    if (player.id !== 1) {
      boxHeight *= 2;
      if (anchory > 0) {
        nameY -= countHeight;
      } else {
        countY += countHeight;
      }
    }
    this.spriteRenderer.render("solid", x, y, countSize.w, boxHeight, 0, anchorx, anchory, this.colors.overlay);
    this.fontRenderer.render(this.font, countHeight, nameString, x, nameY, anchorx, anchory, this.colors.white);
    if (player.id !== 1) {
      return this.fontRenderer.render(this.font, countHeight, countString, x, countY, anchorx, anchory, this.colors.white);
    }
  };

  Game.prototype.renderAIHand = function(cardCount, countHeight, x, y, anchorx, anchory) {};

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
var Animation, CARD_HAND_CURVE_DIST_FACTOR, CARD_HOLDING_ROT_ORDER, CARD_HOLDING_ROT_PLAY, CARD_IMAGE_ADV_X, CARD_IMAGE_ADV_Y, CARD_IMAGE_H, CARD_IMAGE_OFF_X, CARD_IMAGE_OFF_Y, CARD_IMAGE_W, CARD_PLAY_CEILING, CARD_RENDER_SCALE, Hand, Highlight, NO_CARD, calcDistance, calcDistanceSquared, findAngle;

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

CARD_PLAY_CEILING = 0.60;

NO_CARD = -1;

Highlight = {
  NONE: -1,
  UNSELECTED: 0,
  SELECTED: 1,
  PILE: 2
};

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
  Hand.CARD_IMAGE_W = CARD_IMAGE_W;

  Hand.CARD_IMAGE_H = CARD_IMAGE_H;

  Hand.CARD_IMAGE_OFF_X = CARD_IMAGE_OFF_X;

  Hand.CARD_IMAGE_OFF_Y = CARD_IMAGE_OFF_Y;

  Hand.CARD_IMAGE_ADV_X = CARD_IMAGE_ADV_X;

  Hand.CARD_IMAGE_ADV_Y = CARD_IMAGE_ADV_Y;

  Hand.CARD_RENDER_SCALE = CARD_RENDER_SCALE;

  Hand.Highlight = Highlight;

  function Hand(game) {
    var arcMargin, arcVerticalBias, bottomLeft, bottomRight;
    this.game = game;
    this.cards = [];
    this.anims = {};
    this.positionCache = {};
    this.picking = true;
    this.picked = [];
    this.pickPaint = false;
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

  Hand.prototype.togglePicking = function() {
    this.picking = !this.picking;
    if (this.picking) {
      return this.selectNone();
    }
  };

  Hand.prototype.selectNone = function() {
    this.picked = new Array(this.cards.length).fill(false);
  };

  Hand.prototype.set = function(cards) {
    this.cards = cards.slice(0);
    if (this.picking) {
      this.selectNone();
    }
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

  Hand.prototype.selectedCards = function() {
    var anim, card, cards, i, j, len, ref;
    if (!this.picking) {
      return [];
    }
    cards = [];
    ref = this.cards;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      card = ref[i];
      if (this.picked[i]) {
        anim = this.anims[card];
        cards.push({
          card: card,
          x: anim.cur.x,
          y: anim.cur.y,
          r: anim.cur.r,
          index: i
        });
      }
    }
    return cards;
  };

  Hand.prototype.down = function(dragX, dragY, index) {
    this.dragX = dragX;
    this.dragY = dragY;
    this.up(this.dragX, this.dragY);
    if (this.picking) {
      this.picked[index] = !this.picked[index];
      this.pickPaint = this.picked[index];
      return;
    }
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
      this.game.play([
        {
          card: card,
          x: anim.cur.x,
          y: anim.cur.y,
          r: anim.cur.r,
          index: cardIndex
        }
      ]);
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
          var highlightState;
          if (_this.picking) {
            if (_this.picked[index]) {
              highlightState = Highlight.SELECTED;
            } else {
              highlightState = Highlight.UNSELECTED;
            }
          } else {
            if (_this.wantsToPlayDraggedCard()) {
              if (index === _this.dragIndexCurrent) {
                highlightState = Highlight.SELECTED;
              } else {
                highlightState = Highlight.UNSELECTED;
              }
            } else {
              highlightState = Highlight.NONE;
            }
          }
          return _this.renderCard(v, anim.cur.x, anim.cur.y, anim.cur.r, 1, highlightState, function(clickX, clickY) {
            return _this.down(clickX, clickY, index);
          });
        };
      })(this)(anim, index));
    }
    return results;
  };

  Hand.prototype.renderCard = function(v, x, y, rot, scale, selected, cb) {
    var col, rank, suit;
    if (!rot) {
      rot = 0;
    }
    rank = Math.floor(v / 4);
    suit = Math.floor(v % 4);
    col = (function() {
      switch (selected) {
        case Highlight.NONE:
          return [1, 1, 1];
        case Highlight.UNSELECTED:
          return [1, 1, 1];
        case Highlight.SELECTED:
          return [0.5, 0.5, 0.9];
        case Highlight.PILE:
          return [0.6, 0.6, 0.6];
      }
    })();
    return this.game.drawImage("cards", CARD_IMAGE_OFF_X + (CARD_IMAGE_ADV_X * rank), CARD_IMAGE_OFF_Y + (CARD_IMAGE_ADV_Y * suit), CARD_IMAGE_W, CARD_IMAGE_H, x, y, this.cardWidth * scale, this.cardHeight * scale, rot, 0.5, 0.5, col[0], col[1], col[2], 1, cb);
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
var Animation, Hand, Pile, SETTLE_MS;

Animation = require('./Animation');

Hand = require('./Hand');

SETTLE_MS = 1000;

Pile = (function() {
  function Pile(game, hand) {
    var centerX, centerY, messy, offsetX, offsetY;
    this.game = game;
    this.hand = hand;
    this.playID = -1;
    this.plays = [];
    this.anims = {};
    this.settleTimer = 0;
    this.thrownColor = {
      r: 1,
      g: 1,
      b: 0,
      a: 1
    };
    this.scale = 0.6;
    messy = 0.2;
    this.playCardSpacing = 0.1;
    centerX = this.game.center.x;
    centerY = this.game.center.y;
    offsetX = this.hand.cardWidth * messy * this.scale;
    offsetY = this.hand.cardHalfHeight * messy * this.scale;
    this.playLocations = [
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

  Pile.prototype.set = function(pileID, pile, pileWho) {
    if (this.playID !== pileID) {
      this.playID = pileID;
      this.plays.push({
        cards: pile.slice(0),
        who: pileWho
      });
      this.settleTimer = SETTLE_MS;
    }
    return this.syncAnims();
  };

  Pile.prototype.hint = function(cards) {
    var card, i, len, results;
    results = [];
    for (i = 0, len = cards.length; i < len; i++) {
      card = cards[i];
      results.push(this.anims[card.card] = new Animation({
        speed: this.hand.cardSpeed,
        x: card.x,
        y: card.y,
        r: card.r,
        s: 1
      }));
    }
    return results;
  };

  Pile.prototype.syncAnims = function() {
    var anim, card, i, index, j, k, len, len1, len2, location, locations, play, ref, ref1, ref2, seen, toRemove, who;
    seen = {};
    locations = this.throwLocations;
    ref = this.plays;
    for (i = 0, len = ref.length; i < len; i++) {
      play = ref[i];
      ref1 = play.cards;
      for (index = j = 0, len1 = ref1.length; j < len1; index = ++j) {
        card = ref1[index];
        seen[card]++;
        if (!this.anims[card]) {
          who = play.who;
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
    }
    toRemove = [];
    ref2 = this.anims;
    for (card in ref2) {
      anim = ref2[card];
      if (!seen.hasOwnProperty(card)) {
        toRemove.push(card);
      }
    }
    for (k = 0, len2 = toRemove.length; k < len2; k++) {
      card = toRemove[k];
      delete this.anims[card];
    }
    return this.updatePositions();
  };

  Pile.prototype.updatePositions = function() {
    var anim, i, index, len, loc, locations, play, playIndex, ref, results, v;
    locations = this.playLocations;
    ref = this.plays;
    results = [];
    for (playIndex = i = 0, len = ref.length; i < len; playIndex = ++i) {
      play = ref[playIndex];
      results.push((function() {
        var j, len1, ref1, results1;
        ref1 = play.cards;
        results1 = [];
        for (index = j = 0, len1 = ref1.length; j < len1; index = ++j) {
          v = ref1[index];
          anim = this.anims[v];
          loc = play.who;
          anim.req.x = locations[loc].x + (index * this.hand.cardWidth * this.playCardSpacing);
          anim.req.y = locations[loc].y;
          anim.req.r = 0.2 * Math.cos(playIndex / 0.1);
          results1.push(anim.req.s = this.scale);
        }
        return results1;
      }).call(this));
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
    var anim, card, ref;
    ref = this.anims;
    for (card in ref) {
      anim = ref[card];
      if (anim.animating()) {
        return false;
      }
    }
    if (this.settleTimer > 0) {
      return false;
    }
    return true;
  };

  Pile.prototype.render = function() {
    var anim, highlight, i, index, len, play, playIndex, ref, results, v;
    ref = this.plays;
    results = [];
    for (playIndex = i = 0, len = ref.length; i < len; playIndex = ++i) {
      play = ref[playIndex];
      highlight = Hand.Highlight.PILE;
      if (playIndex === (this.plays.length - 1)) {
        highlight = Hand.Highlight.NONE;
      }
      results.push((function() {
        var j, len1, ref1, results1;
        ref1 = play.cards;
        results1 = [];
        for (index = j = 0, len1 = ref1.length; j < len1; index = ++j) {
          v = ref1[index];
          anim = this.anims[v];
          results1.push(this.hand.renderCard(v, anim.cur.x, anim.cur.y, anim.cur.r, anim.cur.s, highlight));
        }
        return results1;
      }).call(this));
    }
    return results;
  };

  return Pile;

})();

module.exports = Pile;


},{"./Animation":1,"./Hand":5}],8:[function(require,module,exports){
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
      pile: {
        texture: "chars",
        x: 513,
        y: 875,
        w: 128,
        h: 128
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
var Card, MAX_LOG_LINES, MIN_PLAYERS, OK, ShortSuitName, ShuffledDeck, Suit, SuitName, Thirteen, aiCharacterList, aiCharacters, cardsToString, character, debug, l, len, playTypeToString, randomCharacter;

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

playTypeToString = function(type) {
  var matches;
  if (matches = type.match(/^run(\d+)/)) {
    return "Run of " + matches[1];
  }
  if (matches = type.match(/^kind(\d+)/)) {
    if (matches[1] === '1') {
      return 'Single';
    }
    if (matches[1] === '2') {
      return 'Pair';
    }
    if (matches[1] === '3') {
      return 'Trips';
    }
    return 'Quads';
  }
  return type;
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
          index: 0,
          pass: false
        }
      ];
      for (i = m = 1; m < 4; i = ++m) {
        this.addAI();
      }
      this.deal();
    }
  }

  Thirteen.prototype.deal = function(params) {
    var deck, j, len1, m, n, player, playerIndex, raw, ref;
    deck = new ShuffledDeck();
    ref = this.players;
    for (playerIndex = m = 0, len1 = ref.length; m < len1; playerIndex = ++m) {
      player = ref[playerIndex];
      this.game.log("dealing 13 cards to player " + playerIndex);
      player.hand = [];
      for (j = n = 0; n < 13; j = ++n) {
        raw = deck.cards.shift();
        if (raw === 0) {
          this.turn = playerIndex;
        }
        player.hand.push(raw);
      }
      console.log("@game.options.sortIndex " + this.game.options.sortIndex);
      if ((this.game.options.sortIndex === 0) || player.ai) {
        player.hand.sort(function(a, b) {
          return a - b;
        });
      } else {
        player.hand.sort(function(a, b) {
          return b - a;
        });
      }
    }
    this.pile = [];
    this.pileWho = -1;
    this.throwID = 0;
    this.currentPlay = null;
    this.unpassAll();
    this.output('Hand dealt, ' + this.players[this.turn].name + ' plays first');
    return OK;
  };

  Thirteen.prototype.save = function() {
    var len1, m, name, names, state;
    names = "log players turn pile pileWho throwID currentPlay".split(" ");
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

  Thirteen.prototype.headline = function() {
    var currentPlayer, headline, playString;
    if (this.winner() !== null) {
      return "Game Over";
    }
    if (this.currentPlay) {
      playString = this.currentPlay.type + (" (" + this.currentPlay.high + ")");
    } else {
      playString = "Anything";
    }
    currentPlayer = this.currentPlayer();
    headline = playString + " to " + currentPlayer.name;
    return headline;
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

  Thirteen.prototype.everyonePassed = function() {
    var len1, m, player, playerIndex, ref;
    ref = this.players;
    for (playerIndex = m = 0, len1 = ref.length; m < len1; playerIndex = ++m) {
      player = ref[playerIndex];
      if (playerIndex === this.turn) {
        continue;
      }
      if (!player.pass) {
        return false;
      }
    }
    return true;
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
      pass: false,
      ai: true
    };
    this.addPlayer(ai);
    this.game.log("added AI player");
    return OK;
  };

  Thirteen.prototype.updatePlayerHand = function(cards) {
    return this.players[0].hand = cards.slice(0);
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

  Thirteen.prototype.classify = function(rawCards) {
    var card, cardIndex, cards, foundRop, foundRun, highestRaw, len1, len2, len3, m, n, o, reqValue, type;
    cards = rawCards.map(function(raw) {
      return new Card(raw);
    });
    cards = cards.sort(function(a, b) {
      return a.raw - b.raw;
    });
    highestRaw = cards[cards.length - 1].raw;
    if ((cards.length >= 6) && ((cards.length % 2) === 0)) {
      foundRop = true;
      for (cardIndex = m = 0, len1 = cards.length; m < len1; cardIndex = ++m) {
        card = cards[cardIndex];
        if (cardIndex === 0) {
          continue;
        }
        if (card.value === 12) {
          foundRop = false;
          break;
        }
        if ((cardIndex % 2) === 1) {
          if (card.value !== cards[cardIndex - 1].value) {
            foundRop = false;
            break;
          }
        } else {
          if (card.value !== (cards[cardIndex - 1].value + 1)) {
            foundRop = false;
            break;
          }
        }
      }
      if (foundRop) {
        return {
          type: 'rop' + Math.floor(cards.length / 2),
          high: highestRaw
        };
      }
    }
    if (cards.length >= 3) {
      foundRun = true;
      for (cardIndex = n = 0, len2 = cards.length; n < len2; cardIndex = ++n) {
        card = cards[cardIndex];
        if (cardIndex === 0) {
          continue;
        }
        if (card.value === 12) {
          foundRun = false;
          break;
        }
        if (card.value !== (cards[cardIndex - 1].value + 1)) {
          foundRun = false;
          break;
        }
      }
      if (foundRun) {
        return {
          type: 'run' + cards.length,
          high: highestRaw
        };
      }
    }
    reqValue = cards[0].value;
    for (o = 0, len3 = cards.length; o < len3; o++) {
      card = cards[o];
      if (card.value !== reqValue) {
        return null;
      }
    }
    type = 'kind' + cards.length;
    return {
      type: type,
      high: highestRaw
    };
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
    if (this.everyonePassed()) {
      return 'throwAnything';
    }
    return OK;
  };

  Thirteen.prototype.canPlay = function(params, incomingPlay) {
    var currentPlayer;
    if (this.winner() !== null) {
      return 'gameOver';
    }
    currentPlayer = this.currentPlayer();
    if (params.id !== currentPlayer.id) {
      return 'notYourTurn';
    }
    currentPlayer = this.currentPlayer();
    if (currentPlayer.pass) {
      return 'mustPass';
    }
    if (incomingPlay === null) {
      return 'invalidPlay';
    }
    if (this.currentPlay === null) {
      return OK;
    }
    if (this.everyonePassed()) {
      return OK;
    }
    if (incomingPlay.type !== this.currentPlay.type) {
      return 'wrongPlay';
    }
    if (incomingPlay.high < this.currentPlay.high) {
      return 'tooLowPlay';
    }
    return OK;
  };

  Thirteen.prototype.play = function(params) {
    var currentPlayer, incomingPlay, ret, verb;
    incomingPlay = this.classify(params.cards);
    console.log("incomingPlay", incomingPlay);
    console.log("someone calling play", params);
    ret = this.canPlay(params, incomingPlay);
    if (ret !== OK) {
      return ret;
    }
    verb = "continues with";
    if (this.currentPlay) {
      if ((incomingPlay.type !== this.currentPlay.type) || (incomingPlay.high < this.currentPlay.high)) {
        this.unpassAll();
        verb = "throws new play";
      }
    }
    this.currentPlay = incomingPlay;
    this.throwID += 1;
    currentPlayer = this.currentPlayer();
    currentPlayer.hand = this.removeCards(currentPlayer.hand, params.cards);
    this.output(currentPlayer.name + " " + verb + " " + (cardsToString(params.cards)));
    if (currentPlayer.hand.length === 0) {
      this.output(currentPlayer.name + " wins!");
    }
    this.pile = params.cards.slice(0);
    this.pileWho = this.turn;
    this.turn = this.playerAfter(this.turn);
    return OK;
  };

  Thirteen.prototype.unpassAll = function() {
    var len1, m, player, ref;
    ref = this.players;
    for (m = 0, len1 = ref.length; m < len1; m++) {
      player = ref[m];
      player.pass = false;
    }
  };

  Thirteen.prototype.pass = function(params) {
    var currentPlayer, ret;
    ret = this.canPass(params);
    if (ret !== OK) {
      return ret;
    }
    currentPlayer = this.currentPlayer();
    if (currentPlayer.pass) {
      this.output(currentPlayer.name + " auto-passes");
    } else {
      this.output(currentPlayer.name + " passes");
    }
    currentPlayer.pass = true;
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
    return this.game.log('AI[' + currentPlayer.name + ' ' + character.brain + ']: hand:' + cardsToString(currentPlayer.hand) + ' pile:' + cardsToString(this.pile) + ' ' + text);
  };

  Thirteen.prototype.aiTick = function() {
    var currentPlayer, ret;
    if (this.winner() !== null) {
      return false;
    }
    currentPlayer = this.currentPlayer();
    if (!currentPlayer.ai) {
      if (currentPlayer.pass) {
        this.aiLog("autopassing for player");
        this.aiPass(currentPlayer);
        return true;
      }
      return false;
    }
    character = aiCharacters[currentPlayer.charID];
    ret = this.brains[character.brain].play.apply(this, [currentPlayer, this.currentPlay, this.everyonePassed()]);
    if (ret === OK) {
      return true;
    }
    return false;
  };

  Thirteen.prototype.alCalcKinds = function(hand, plays, match2s) {
    var card, cards, i, key, len1, len2, len3, m, n, o, q, v, value, valueArray, valueArrays;
    if (match2s == null) {
      match2s = false;
    }
    cards = hand.map(function(raw) {
      return new Card(raw);
    });
    cards = cards.sort(function(a, b) {
      return a.raw - b.raw;
    });
    valueArrays = [];
    for (i = m = 0; m < 13; i = ++m) {
      valueArrays.push([]);
    }
    for (n = 0, len1 = cards.length; n < len1; n++) {
      card = cards[n];
      valueArrays[card.value].push(card);
    }
    hand = [];
    for (value = o = 0, len2 = valueArrays.length; o < len2; value = ++o) {
      valueArray = valueArrays[value];
      if ((valueArray.length > 1) && (match2s || (value < 12))) {
        key = "kind" + valueArray.length;
        if (plays[key] == null) {
          plays[key] = [];
        }
        plays[key].push(valueArray.map(function(v) {
          return v.raw;
        }));
      } else {
        for (q = 0, len3 = valueArray.length; q < len3; q++) {
          v = valueArray[q];
          hand.push(v.raw);
        }
      }
    }
    return hand;
  };

  Thirteen.prototype.aiFindRuns = function(hand, eachSize, size) {
    var card, cards, each, i, lastStartingValue, leftovers, len1, len2, len3, m, n, o, offset, q, ref, ref1, ref2, ref3, run, runFound, runs, startingValue, u, valueArray, valueArrays, w, x, y;
    runs = [];
    cards = hand.map(function(raw) {
      return new Card(raw);
    });
    cards = cards.sort(function(a, b) {
      return a.raw - b.raw;
    });
    valueArrays = [];
    for (i = m = 0; m < 13; i = ++m) {
      valueArrays.push([]);
    }
    for (n = 0, len1 = cards.length; n < len1; n++) {
      card = cards[n];
      valueArrays[card.value].push(card);
    }
    lastStartingValue = 12 - size;
    for (startingValue = o = 0, ref = lastStartingValue; 0 <= ref ? o < ref : o > ref; startingValue = 0 <= ref ? ++o : --o) {
      runFound = true;
      for (offset = q = 0, ref1 = size; 0 <= ref1 ? q < ref1 : q > ref1; offset = 0 <= ref1 ? ++q : --q) {
        if (valueArrays[startingValue + offset].length < eachSize) {
          runFound = false;
          break;
        }
      }
      if (runFound) {
        run = [];
        for (offset = u = 0, ref2 = size; 0 <= ref2 ? u < ref2 : u > ref2; offset = 0 <= ref2 ? ++u : --u) {
          for (each = w = 0, ref3 = eachSize; 0 <= ref3 ? w < ref3 : w > ref3; each = 0 <= ref3 ? ++w : --w) {
            run.push(valueArrays[startingValue + offset].pop().raw);
          }
        }
        runs.push(run);
      }
    }
    leftovers = [];
    for (x = 0, len2 = valueArrays.length; x < len2; x++) {
      valueArray = valueArrays[x];
      for (y = 0, len3 = valueArray.length; y < len3; y++) {
        card = valueArray[y];
        leftovers.push(card.raw);
      }
    }
    return [runs, leftovers];
  };

  Thirteen.prototype.aiCalcRuns = function(hand, plays, smallRuns) {
    var byAmount, endSize, key, leftovers, m, ref, ref1, ref2, ref3, runSize, runs, startSize;
    if (smallRuns) {
      startSize = 3;
      endSize = 12;
      byAmount = 1;
    } else {
      startSize = 12;
      endSize = 3;
      byAmount = -1;
    }
    for (runSize = m = ref = startSize, ref1 = endSize, ref2 = byAmount; ref2 > 0 ? m <= ref1 : m >= ref1; runSize = m += ref2) {
      ref3 = this.aiFindRuns(hand, 1, runSize), runs = ref3[0], leftovers = ref3[1];
      if (runs.length > 0) {
        key = "run" + runSize;
        plays[key] = runs;
      }
      hand = leftovers;
    }
    return hand;
  };

  Thirteen.prototype.aiCalcRops = function(hand, plays) {
    var endSize, key, leftovers, m, ref, ref1, ref2, rops, runSize, startSize;
    startSize = 3;
    endSize = 6;
    for (runSize = m = ref = startSize, ref1 = endSize; ref <= ref1 ? m <= ref1 : m >= ref1; runSize = ref <= ref1 ? ++m : --m) {
      ref2 = this.aiFindRuns(hand, 2, runSize), rops = ref2[0], leftovers = ref2[1];
      if (rops.length > 0) {
        key = "rop" + runSize;
        plays[key] = rops;
      }
      hand = leftovers;
    }
    return hand;
  };

  Thirteen.prototype.aiCalcPlays = function(hand, strategy) {
    var kind1, plays;
    if (strategy == null) {
      strategy = {};
    }
    plays = {};
    if (strategy.seesRops) {
      hand = this.aiCalcRops(hand, plays);
    }
    if (strategy.prefersRuns) {
      hand = this.aiCalcRuns(hand, plays, strategy.smallRuns);
      hand = this.alCalcKinds(hand, plays, strategy.match2s);
    } else {
      hand = this.alCalcKinds(hand, plays, strategy.match2s);
      hand = this.aiCalcRuns(hand, plays, strategy.smallRuns);
    }
    kind1 = hand.map(function(v) {
      return [v];
    });
    if (kind1.length > 0) {
      plays.kind1 = kind1;
    }
    return plays;
  };

  Thirteen.prototype.numberOfSingles = function(plays) {
    if (plays.kind1 == null) {
      return 0;
    }
    return plays.kind1.length;
  };

  Thirteen.prototype.aiCalcBestPlays = function(hand) {
    var bestPlays, bits, m, plays, strategy;
    bestPlays = null;
    for (bits = m = 0; m < 16; bits = ++m) {
      strategy = {
        smallRuns: (bits & 1) === 1,
        prefersRuns: (bits & 2) === 2,
        match2s: (bits & 4) === 4,
        seesRops: (bits & 8) === 8
      };
      plays = this.aiCalcPlays(hand, strategy);
      if (bestPlays === null) {
        bestPlays = plays;
      } else {
        if (this.numberOfSingles(plays) < this.numberOfSingles(bestPlays)) {
          bestPlays = plays;
        }
      }
    }
    return bestPlays;
  };

  Thirteen.prototype.prettyPlays = function(plays, extraPretty) {
    var arr, card, len1, len2, len3, m, n, names, o, play, pretty, raw, s, t, throws, type, typeName;
    if (extraPretty == null) {
      extraPretty = false;
    }
    pretty = {};
    for (type in plays) {
      arr = plays[type];
      pretty[type] = [];
      for (m = 0, len1 = arr.length; m < len1; m++) {
        play = arr[m];
        names = [];
        for (n = 0, len2 = play.length; n < len2; n++) {
          raw = play[n];
          card = new Card(raw);
          names.push(card.name);
        }
        pretty[type].push(names);
      }
    }
    if (extraPretty) {
      s = "";
      for (typeName in pretty) {
        throws = pretty[typeName];
        s += "      * " + (playTypeToString(typeName)) + ":\n";
        if (typeName === 'kind1') {
          s += "        * " + (throws.map(function(v) {
            return v[0];
          }).join(',')) + "\n";
        } else {
          for (o = 0, len3 = throws.length; o < len3; o++) {
            t = throws[o];
            s += "        * " + (t.join(',')) + "\n";
          }
        }
      }
      return s;
    }
    return JSON.stringify(pretty);
  };

  Thirteen.prototype.highestCard = function(play) {
    var highest, len1, m, p;
    highest = 0;
    for (m = 0, len1 = play.length; m < len1; m++) {
      p = play[m];
      if (highest < p) {
        highest = p;
      }
    }
    return highest;
  };

  Thirteen.prototype.brains = {
    normal: {
      id: "normal",
      name: "Normal",
      play: function(currentPlayer, currentPlay, everyonePassed) {
        var len1, len2, m, n, play, playTypeIndex, playTypes, plays, rawCard, ref, ref1;
        if (currentPlayer.pass) {
          this.aiLog("already passed, going to keep passing");
          return this.aiPass(currentPlayer);
        }
        plays = this.aiCalcBestPlays(currentPlayer.hand);
        this.aiLog("best plays: " + (this.prettyPlays(plays)));
        if (currentPlay && !everyonePassed) {
          if ((plays[currentPlay.type] != null) && (plays[currentPlay.type].length > 0)) {
            ref = plays[currentPlay.type];
            for (m = 0, len1 = ref.length; m < len1; m++) {
              play = ref[m];
              if (this.highestCard(play) > currentPlay.high) {
                if (this.aiPlay(currentPlayer, play) === OK) {
                  return OK;
                }
              }
            }
            this.aiLog("I guess I can't actually beat this, passing");
            return this.aiPass(currentPlayer);
          } else {
            this.aiLog("I don't have that play, passing");
            return this.aiPass(currentPlayer);
          }
        } else {
          this.aiLog("I can do anything, throwing a random play");
          playTypes = Object.keys(plays);
          playTypeIndex = Math.floor(Math.random() * playTypes.length);
          if (this.aiPlay(currentPlayer, plays[playTypes[playTypeIndex]][0]) === OK) {
            return OK;
          }
        }
        ref1 = currentPlayer.hand;
        for (n = 0, len2 = ref1.length; n < len2; n++) {
          rawCard = ref1[n];
          if (rawCard > currentPlay.high) {
            this.aiLog("found smallest single (" + rawCard + "), playing");
            if (this.aiPlay(currentPlayer, [rawCard]) === OK) {
              return OK;
            }
            break;
          }
        }
        this.aiLog("nothing else to do, passing");
        return this.aiPass(currentPlayer);
      }
    }
  };

  return Thirteen;

})();

debug = function() {
  var attempt, bits, deck, foundFullyPlayed, fullyPlayed, hand, j, m, n, o, plays, raw, ref, strategy, thir, totalAttempts;
  thir = new Thirteen();
  fullyPlayed = 0;
  totalAttempts = 100;
  for (attempt = m = 0, ref = totalAttempts; 0 <= ref ? m < ref : m > ref; attempt = 0 <= ref ? ++m : --m) {
    deck = new ShuffledDeck();
    hand = [];
    for (j = n = 0; n < 13; j = ++n) {
      raw = deck.cards.shift();
      hand.push(raw);
    }
    hand.sort(function(a, b) {
      return a - b;
    });
    console.log("------------------------------------------------------------------------");
    console.log("Hand " + (attempt + 1) + ": " + (cardsToString(hand)));
    console.log("");
    foundFullyPlayed = false;
    for (bits = o = 0; o < 16; bits = ++o) {
      strategy = {
        smallRuns: (bits & 1) === 1,
        prefersRuns: (bits & 2) === 2,
        match2s: (bits & 4) === 4,
        seesRops: (bits & 8) === 8
      };
      plays = thir.aiCalcPlays(hand, strategy);
      console.log("   * Strategy: " + (JSON.stringify(strategy)));
      console.log(thir.prettyPlays(plays, true));
      if (!plays.kind1) {
        foundFullyPlayed = true;
      }
    }
    if (foundFullyPlayed) {
      fullyPlayed += 1;
    }
  }
  return console.log("fullyPlayed: " + fullyPlayed + " / " + totalAttempts);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQW5pbWF0aW9uLmNvZmZlZSIsInNyYy9CdXR0b24uY29mZmVlIiwic3JjL0ZvbnRSZW5kZXJlci5jb2ZmZWUiLCJzcmMvR2FtZS5jb2ZmZWUiLCJzcmMvSGFuZC5jb2ZmZWUiLCJzcmMvTWVudS5jb2ZmZWUiLCJzcmMvUGlsZS5jb2ZmZWUiLCJzcmMvU3ByaXRlUmVuZGVyZXIuY29mZmVlIiwic3JjL1RoaXJ0ZWVuLmNvZmZlZSIsInNyYy9mb250bWV0cmljcy5jb2ZmZWUiLCJzcmMvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBOztBQUFBLFFBQUEsR0FBVyxTQUFDLENBQUQ7RUFDVCxJQUFHLENBQUEsS0FBSyxDQUFSO0FBQ0UsV0FBTyxFQURUO0dBQUEsTUFFSyxJQUFHLENBQUEsR0FBSSxDQUFQO0FBQ0gsV0FBTyxDQUFDLEVBREw7O0FBRUwsU0FBTztBQUxFOztBQU9MO0VBQ1MsbUJBQUMsSUFBRDtBQUNYLFFBQUE7SUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksQ0FBQztJQUNkLElBQUMsQ0FBQSxHQUFELEdBQU87SUFDUCxJQUFDLENBQUEsR0FBRCxHQUFPO0FBQ1AsU0FBQSxTQUFBOztNQUNFLElBQUcsQ0FBQSxLQUFLLE9BQVI7UUFDRSxJQUFDLENBQUEsR0FBSSxDQUFBLENBQUEsQ0FBTCxHQUFVO1FBQ1YsSUFBQyxDQUFBLEdBQUksQ0FBQSxDQUFBLENBQUwsR0FBVSxFQUZaOztBQURGO0VBSlc7O3NCQVViLElBQUEsR0FBTSxTQUFBO0lBQ0osSUFBRyxrQkFBSDtNQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBTCxHQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFEaEI7O0lBRUEsSUFBRyxrQkFBSDtNQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBTCxHQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFEaEI7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a0JBQUwsQ0FBL0IsRUFGbEI7R0FBQSxNQUFBO0lBSUUsTUFBTSxDQUFDLEtBQVAsR0FBZSxJQUFJLENBQUMsS0FBTCxDQUFXLE1BQU0sQ0FBQyxXQUFQLEdBQXFCLGtCQUFoQztXQUNmLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLE1BQU0sQ0FBQyxZQUx6Qjs7QUFIYTs7QUFTZixZQUFBLENBQUE7O0FBR0EsR0FBQSxHQUFNLElBQUksU0FBSixDQUFjLE1BQWQsRUFBc0IsTUFBTSxDQUFDLEtBQTdCLEVBQW9DLE1BQU0sQ0FBQyxNQUEzQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNhbGNTaWduID0gKHYpIC0+XHJcbiAgaWYgdiA9PSAwXHJcbiAgICByZXR1cm4gMFxyXG4gIGVsc2UgaWYgdiA8IDBcclxuICAgIHJldHVybiAtMVxyXG4gIHJldHVybiAxXHJcblxyXG5jbGFzcyBBbmltYXRpb25cclxuICBjb25zdHJ1Y3RvcjogKGRhdGEpIC0+XHJcbiAgICBAc3BlZWQgPSBkYXRhLnNwZWVkXHJcbiAgICBAcmVxID0ge31cclxuICAgIEBjdXIgPSB7fVxyXG4gICAgZm9yIGssdiBvZiBkYXRhXHJcbiAgICAgIGlmIGsgIT0gJ3NwZWVkJ1xyXG4gICAgICAgIEByZXFba10gPSB2XHJcbiAgICAgICAgQGN1cltrXSA9IHZcclxuXHJcbiAgIyAnZmluaXNoZXMnIGFsbCBhbmltYXRpb25zXHJcbiAgd2FycDogLT5cclxuICAgIGlmIEBjdXIucj9cclxuICAgICAgQGN1ci5yID0gQHJlcS5yXHJcbiAgICBpZiBAY3VyLnM/XHJcbiAgICAgIEBjdXIucyA9IEByZXEuc1xyXG4gICAgaWYgQGN1ci54PyBhbmQgQGN1ci55P1xyXG4gICAgICBAY3VyLnggPSBAcmVxLnhcclxuICAgICAgQGN1ci55ID0gQHJlcS55XHJcblxyXG4gIGFuaW1hdGluZzogLT5cclxuICAgIGlmIEBjdXIucj9cclxuICAgICAgaWYgQHJlcS5yICE9IEBjdXIuclxyXG4gICAgICAgIHJldHVybiB0cnVlXHJcbiAgICBpZiBAY3VyLnM/XHJcbiAgICAgIGlmIEByZXEucyAhPSBAY3VyLnNcclxuICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgaWYgQGN1ci54PyBhbmQgQGN1ci55P1xyXG4gICAgICBpZiAoQHJlcS54ICE9IEBjdXIueCkgb3IgKEByZXEueSAhPSBAY3VyLnkpXHJcbiAgICAgICAgcmV0dXJuIHRydWVcclxuICAgIHJldHVybiBmYWxzZVxyXG5cclxuICB1cGRhdGU6IChkdCkgLT5cclxuICAgIHVwZGF0ZWQgPSBmYWxzZVxyXG4gICAgIyByb3RhdGlvblxyXG4gICAgaWYgQGN1ci5yP1xyXG4gICAgICBpZiBAcmVxLnIgIT0gQGN1ci5yXHJcbiAgICAgICAgdXBkYXRlZCA9IHRydWVcclxuICAgICAgICAjIHNhbml0aXplIHJlcXVlc3RlZCByb3RhdGlvblxyXG4gICAgICAgIHR3b1BpID0gTWF0aC5QSSAqIDJcclxuICAgICAgICBuZWdUd29QaSA9IC0xICogdHdvUGlcclxuICAgICAgICBAcmVxLnIgLT0gdHdvUGkgd2hpbGUgQHJlcS5yID49IHR3b1BpXHJcbiAgICAgICAgQHJlcS5yICs9IHR3b1BpIHdoaWxlIEByZXEuciA8PSBuZWdUd29QaVxyXG4gICAgICAgICMgcGljayBhIGRpcmVjdGlvbiBhbmQgdHVyblxyXG4gICAgICAgIGRyID0gQHJlcS5yIC0gQGN1ci5yXHJcbiAgICAgICAgZGlzdCA9IE1hdGguYWJzKGRyKVxyXG4gICAgICAgIHNpZ24gPSBjYWxjU2lnbihkcilcclxuICAgICAgICBpZiBkaXN0ID4gTWF0aC5QSVxyXG4gICAgICAgICAgIyBzcGluIHRoZSBvdGhlciBkaXJlY3Rpb24sIGl0IGlzIGNsb3NlclxyXG4gICAgICAgICAgZGlzdCA9IHR3b1BpIC0gZGlzdFxyXG4gICAgICAgICAgc2lnbiAqPSAtMVxyXG4gICAgICAgIG1heERpc3QgPSBkdCAqIEBzcGVlZC5yIC8gMTAwMFxyXG4gICAgICAgIGlmIGRpc3QgPCBtYXhEaXN0XHJcbiAgICAgICAgICAjIHdlIGNhbiBmaW5pc2ggdGhpcyBmcmFtZVxyXG4gICAgICAgICAgQGN1ci5yID0gQHJlcS5yXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgQGN1ci5yICs9IG1heERpc3QgKiBzaWduXHJcblxyXG4gICAgIyBzY2FsZVxyXG4gICAgaWYgQGN1ci5zP1xyXG4gICAgICBpZiBAcmVxLnMgIT0gQGN1ci5zXHJcbiAgICAgICAgdXBkYXRlZCA9IHRydWVcclxuICAgICAgICAjIHBpY2sgYSBkaXJlY3Rpb24gYW5kIHR1cm5cclxuICAgICAgICBkcyA9IEByZXEucyAtIEBjdXIuc1xyXG4gICAgICAgIGRpc3QgPSBNYXRoLmFicyhkcylcclxuICAgICAgICBzaWduID0gY2FsY1NpZ24oZHMpXHJcbiAgICAgICAgbWF4RGlzdCA9IGR0ICogQHNwZWVkLnMgLyAxMDAwXHJcbiAgICAgICAgaWYgZGlzdCA8IG1heERpc3RcclxuICAgICAgICAgICMgd2UgY2FuIGZpbmlzaCB0aGlzIGZyYW1lXHJcbiAgICAgICAgICBAY3VyLnMgPSBAcmVxLnNcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBAY3VyLnMgKz0gbWF4RGlzdCAqIHNpZ25cclxuXHJcbiAgICAjIHRyYW5zbGF0aW9uXHJcbiAgICBpZiBAY3VyLng/IGFuZCBAY3VyLnk/XHJcbiAgICAgIGlmIChAcmVxLnggIT0gQGN1ci54KSBvciAoQHJlcS55ICE9IEBjdXIueSlcclxuICAgICAgICB1cGRhdGVkID0gdHJ1ZVxyXG4gICAgICAgIHZlY1ggPSBAcmVxLnggLSBAY3VyLnhcclxuICAgICAgICB2ZWNZID0gQHJlcS55IC0gQGN1ci55XHJcbiAgICAgICAgZGlzdCA9IE1hdGguc3FydCgodmVjWCAqIHZlY1gpICsgKHZlY1kgKiB2ZWNZKSlcclxuICAgICAgICBtYXhEaXN0ID0gZHQgKiBAc3BlZWQudCAvIDEwMDBcclxuICAgICAgICBpZiBkaXN0IDwgbWF4RGlzdFxyXG4gICAgICAgICAgIyB3ZSBjYW4gZmluaXNoIHRoaXMgZnJhbWVcclxuICAgICAgICAgIEBjdXIueCA9IEByZXEueFxyXG4gICAgICAgICAgQGN1ci55ID0gQHJlcS55XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgIyBtb3ZlIGFzIG11Y2ggYXMgcG9zc2libGVcclxuICAgICAgICAgIEBjdXIueCArPSAodmVjWCAvIGRpc3QpICogbWF4RGlzdFxyXG4gICAgICAgICAgQGN1ci55ICs9ICh2ZWNZIC8gZGlzdCkgKiBtYXhEaXN0XHJcblxyXG4gICAgcmV0dXJuIHVwZGF0ZWRcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQW5pbWF0aW9uXHJcbiIsIkFuaW1hdGlvbiA9IHJlcXVpcmUgJy4vQW5pbWF0aW9uJ1xyXG5cclxuY2xhc3MgQnV0dG9uXHJcbiAgY29uc3RydWN0b3I6IChAZ2FtZSwgQHNwcml0ZU5hbWVzLCBAZm9udCwgQHRleHRIZWlnaHQsIEB4LCBAeSwgQGNiKSAtPlxyXG4gICAgQGFuaW0gPSBuZXcgQW5pbWF0aW9uIHtcclxuICAgICAgc3BlZWQ6IHsgczogMyB9XHJcbiAgICAgIHM6IDBcclxuICAgIH1cclxuICAgIEBjb2xvciA9IHsgcjogMSwgZzogMSwgYjogMSwgYTogMCB9XHJcblxyXG4gIHVwZGF0ZTogKGR0KSAtPlxyXG4gICAgcmV0dXJuIEBhbmltLnVwZGF0ZShkdClcclxuXHJcbiAgcmVuZGVyOiAtPlxyXG4gICAgQGNvbG9yLmEgPSBAYW5pbS5jdXIuc1xyXG4gICAgQGdhbWUuc3ByaXRlUmVuZGVyZXIucmVuZGVyIEBzcHJpdGVOYW1lc1swXSwgQHgsIEB5LCAwLCBAdGV4dEhlaWdodCAqIDEuNSwgMCwgMC41LCAwLjUsIEBnYW1lLmNvbG9ycy53aGl0ZSwgPT5cclxuICAgICAgIyBwdWxzZSBidXR0b24gYW5pbSxcclxuICAgICAgQGFuaW0uY3VyLnMgPSAxXHJcbiAgICAgIEBhbmltLnJlcS5zID0gMFxyXG4gICAgICAjIHRoZW4gY2FsbCBjYWxsYmFja1xyXG4gICAgICBAY2IodHJ1ZSlcclxuICAgIEBnYW1lLnNwcml0ZVJlbmRlcmVyLnJlbmRlciBAc3ByaXRlTmFtZXNbMV0sIEB4LCBAeSwgMCwgQHRleHRIZWlnaHQgKiAxLjUsIDAsIDAuNSwgMC41LCBAY29sb3JcclxuICAgIHRleHQgPSBAY2IoZmFsc2UpXHJcbiAgICBAZ2FtZS5mb250UmVuZGVyZXIucmVuZGVyIEBmb250LCBAdGV4dEhlaWdodCwgdGV4dCwgQHgsIEB5LCAwLjUsIDAuNSwgQGdhbWUuY29sb3JzLmJ1dHRvbnRleHRcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQnV0dG9uXHJcbiIsImZvbnRtZXRyaWNzID0gcmVxdWlyZSAnLi9mb250bWV0cmljcydcclxuXHJcbiMgdGFrZW4gZnJvbSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzU2MjM4MzgvcmdiLXRvLWhleC1hbmQtaGV4LXRvLXJnYlxyXG5oZXhUb1JnYiA9IChoZXgsIGEpIC0+XHJcbiAgICByZXN1bHQgPSAvXiM/KFthLWZcXGRdezJ9KShbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pJC9pLmV4ZWMoaGV4KVxyXG4gICAgcmV0dXJuIG51bGwgaWYgbm90IHJlc3VsdFxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByOiBwYXJzZUludChyZXN1bHRbMV0sIDE2KSAvIDI1NSxcclxuICAgICAgICBnOiBwYXJzZUludChyZXN1bHRbMl0sIDE2KSAvIDI1NSxcclxuICAgICAgICBiOiBwYXJzZUludChyZXN1bHRbM10sIDE2KSAvIDI1NVxyXG4gICAgICAgIGE6IGFcclxuICAgIH1cclxuXHJcbmNsYXNzIEZvbnRSZW5kZXJlclxyXG4gIGNvbnN0cnVjdG9yOiAgKEBnYW1lKSAtPlxyXG4gICAgQHdoaXRlID0geyByOiAxLCBnOiAxLCBiOiAxLCBhOiAxIH1cclxuXHJcbiAgc2l6ZTogKGZvbnQsIGhlaWdodCwgc3RyKSAtPlxyXG4gICAgbWV0cmljcyA9IGZvbnRtZXRyaWNzW2ZvbnRdXHJcbiAgICByZXR1cm4gaWYgbm90IG1ldHJpY3NcclxuICAgIHNjYWxlID0gaGVpZ2h0IC8gbWV0cmljcy5oZWlnaHRcclxuXHJcbiAgICB0b3RhbFdpZHRoID0gMFxyXG4gICAgdG90YWxIZWlnaHQgPSBtZXRyaWNzLmhlaWdodCAqIHNjYWxlXHJcblxyXG4gICAgaW5Db2xvciA9IGZhbHNlXHJcbiAgICBmb3IgY2gsIGkgaW4gc3RyXHJcbiAgICAgIGlmIGNoID09ICdgJ1xyXG4gICAgICAgIGluQ29sb3IgPSAhaW5Db2xvclxyXG5cclxuICAgICAgaWYgbm90IGluQ29sb3JcclxuICAgICAgICBjb2RlID0gY2guY2hhckNvZGVBdCgwKVxyXG4gICAgICAgIGdseXBoID0gbWV0cmljcy5nbHlwaHNbY29kZV1cclxuICAgICAgICBjb250aW51ZSBpZiBub3QgZ2x5cGhcclxuICAgICAgICB0b3RhbFdpZHRoICs9IGdseXBoLnhhZHZhbmNlICogc2NhbGVcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB3OiB0b3RhbFdpZHRoXHJcbiAgICAgIGg6IHRvdGFsSGVpZ2h0XHJcbiAgICB9XHJcblxyXG4gIHJlbmRlcjogKGZvbnQsIGhlaWdodCwgc3RyLCB4LCB5LCBhbmNob3J4LCBhbmNob3J5LCBjb2xvciwgY2IpIC0+XHJcbiAgICBtZXRyaWNzID0gZm9udG1ldHJpY3NbZm9udF1cclxuICAgIHJldHVybiBpZiBub3QgbWV0cmljc1xyXG4gICAgc2NhbGUgPSBoZWlnaHQgLyBtZXRyaWNzLmhlaWdodFxyXG5cclxuICAgIHRvdGFsV2lkdGggPSAwXHJcbiAgICB0b3RhbEhlaWdodCA9IG1ldHJpY3MuaGVpZ2h0ICogc2NhbGVcclxuICAgIHNraXBDb2xvciA9IGZhbHNlXHJcbiAgICBmb3IgY2gsIGkgaW4gc3RyXHJcbiAgICAgIGlmIGNoID09ICdgJ1xyXG4gICAgICAgIHNraXBDb2xvciA9ICFza2lwQ29sb3JcclxuICAgICAgY29udGludWUgaWYgc2tpcENvbG9yXHJcbiAgICAgIGNvZGUgPSBjaC5jaGFyQ29kZUF0KDApXHJcbiAgICAgIGdseXBoID0gbWV0cmljcy5nbHlwaHNbY29kZV1cclxuICAgICAgY29udGludWUgaWYgbm90IGdseXBoXHJcbiAgICAgIHRvdGFsV2lkdGggKz0gZ2x5cGgueGFkdmFuY2UgKiBzY2FsZVxyXG5cclxuICAgIGFuY2hvck9mZnNldFggPSAtMSAqIGFuY2hvcnggKiB0b3RhbFdpZHRoXHJcbiAgICBhbmNob3JPZmZzZXRZID0gLTEgKiBhbmNob3J5ICogdG90YWxIZWlnaHRcclxuICAgIGN1cnJYID0geFxyXG5cclxuICAgIGlmIGNvbG9yXHJcbiAgICAgIHN0YXJ0aW5nQ29sb3IgPSBjb2xvclxyXG4gICAgZWxzZVxyXG4gICAgICBzdGFydGluZ0NvbG9yID0gQHdoaXRlXHJcbiAgICBjdXJyZW50Q29sb3IgPSBzdGFydGluZ0NvbG9yXHJcblxyXG4gICAgY29sb3JTdGFydCA9IC0xXHJcbiAgICBmb3IgY2gsIGkgaW4gc3RyXHJcbiAgICAgIGlmIGNoID09ICdgJ1xyXG4gICAgICAgIGlmIGNvbG9yU3RhcnQgPT0gLTFcclxuICAgICAgICAgIGNvbG9yU3RhcnQgPSBpICsgMVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIGxlbiA9IGkgLSBjb2xvclN0YXJ0XHJcbiAgICAgICAgICBpZiBsZW5cclxuICAgICAgICAgICAgY3VycmVudENvbG9yID0gaGV4VG9SZ2Ioc3RyLnN1YnN0cihjb2xvclN0YXJ0LCBpIC0gY29sb3JTdGFydCksIHN0YXJ0aW5nQ29sb3IuYSlcclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgY3VycmVudENvbG9yID0gc3RhcnRpbmdDb2xvclxyXG4gICAgICAgICAgY29sb3JTdGFydCA9IC0xXHJcblxyXG4gICAgICBjb250aW51ZSBpZiBjb2xvclN0YXJ0ICE9IC0xXHJcbiAgICAgIGNvZGUgPSBjaC5jaGFyQ29kZUF0KDApXHJcbiAgICAgIGdseXBoID0gbWV0cmljcy5nbHlwaHNbY29kZV1cclxuICAgICAgY29udGludWUgaWYgbm90IGdseXBoXHJcbiAgICAgIEBnYW1lLmRyYXdJbWFnZSBmb250LFxyXG4gICAgICBnbHlwaC54LCBnbHlwaC55LCBnbHlwaC53aWR0aCwgZ2x5cGguaGVpZ2h0LFxyXG4gICAgICBjdXJyWCArIChnbHlwaC54b2Zmc2V0ICogc2NhbGUpICsgYW5jaG9yT2Zmc2V0WCwgeSArIChnbHlwaC55b2Zmc2V0ICogc2NhbGUpICsgYW5jaG9yT2Zmc2V0WSwgZ2x5cGgud2lkdGggKiBzY2FsZSwgZ2x5cGguaGVpZ2h0ICogc2NhbGUsXHJcbiAgICAgIDAsIDAsIDAsXHJcbiAgICAgIGN1cnJlbnRDb2xvci5yLCBjdXJyZW50Q29sb3IuZywgY3VycmVudENvbG9yLmIsIGN1cnJlbnRDb2xvci5hLCBjYlxyXG4gICAgICBjdXJyWCArPSBnbHlwaC54YWR2YW5jZSAqIHNjYWxlXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEZvbnRSZW5kZXJlclxyXG4iLCJBbmltYXRpb24gPSByZXF1aXJlICcuL0FuaW1hdGlvbidcclxuQnV0dG9uID0gcmVxdWlyZSAnLi9CdXR0b24nXHJcbkZvbnRSZW5kZXJlciA9IHJlcXVpcmUgJy4vRm9udFJlbmRlcmVyJ1xyXG5TcHJpdGVSZW5kZXJlciA9IHJlcXVpcmUgJy4vU3ByaXRlUmVuZGVyZXInXHJcbk1lbnUgPSByZXF1aXJlICcuL01lbnUnXHJcbkhhbmQgPSByZXF1aXJlICcuL0hhbmQnXHJcblBpbGUgPSByZXF1aXJlICcuL1BpbGUnXHJcbntUaGlydGVlbiwgT0ssIGFpQ2hhcmFjdGVyc30gPSByZXF1aXJlICcuL1RoaXJ0ZWVuJ1xyXG5cclxuIyB0ZW1wXHJcbkJVSUxEX1RJTUVTVEFNUCA9IFwiMC4wLjFcIlxyXG5cclxuY2xhc3MgR2FtZVxyXG4gIGNvbnN0cnVjdG9yOiAoQG5hdGl2ZSwgQHdpZHRoLCBAaGVpZ2h0KSAtPlxyXG4gICAgQHZlcnNpb24gPSBCVUlMRF9USU1FU1RBTVBcclxuICAgIEBsb2coXCJHYW1lIGNvbnN0cnVjdGVkOiAje0B3aWR0aH14I3tAaGVpZ2h0fVwiKVxyXG4gICAgQGZvbnRSZW5kZXJlciA9IG5ldyBGb250UmVuZGVyZXIgdGhpc1xyXG4gICAgQHNwcml0ZVJlbmRlcmVyID0gbmV3IFNwcml0ZVJlbmRlcmVyIHRoaXNcclxuICAgIEBmb250ID0gXCJkYXJrZm9yZXN0XCJcclxuICAgIEB6b25lcyA9IFtdXHJcbiAgICBAbmV4dEFJVGljayA9IDEwMDAgIyB3aWxsIGJlIHNldCBieSBvcHRpb25zXHJcbiAgICBAY2VudGVyID1cclxuICAgICAgeDogQHdpZHRoIC8gMlxyXG4gICAgICB5OiBAaGVpZ2h0IC8gMlxyXG4gICAgQGFhSGVpZ2h0ID0gQHdpZHRoICogOSAvIDE2XHJcbiAgICBAbG9nIFwiaGVpZ2h0OiAje0BoZWlnaHR9LiBoZWlnaHQgaWYgc2NyZWVuIHdhcyAxNjo5IChhc3BlY3QgYWRqdXN0ZWQpOiAje0BhYUhlaWdodH1cIlxyXG4gICAgQHBhdXNlQnV0dG9uU2l6ZSA9IEBhYUhlaWdodCAvIDE1XHJcbiAgICBAY29sb3JzID1cclxuICAgICAgd2hpdGU6ICAgICAgeyByOiAgIDEsIGc6ICAgMSwgYjogICAxLCBhOiAgIDEgfVxyXG4gICAgICBibGFjazogICAgICB7IHI6ICAgMCwgZzogICAwLCBiOiAgIDAsIGE6ICAgMSB9XHJcbiAgICAgIHJlZDogICAgICAgIHsgcjogICAxLCBnOiAgIDAsIGI6ICAgMCwgYTogICAxIH1cclxuICAgICAgb3JhbmdlOiAgICAgeyByOiAgIDEsIGc6IDAuNSwgYjogICAwLCBhOiAgIDEgfVxyXG4gICAgICBnb2xkOiAgICAgICB7IHI6ICAgMSwgZzogICAxLCBiOiAgIDAsIGE6ICAgMSB9XHJcbiAgICAgIGJ1dHRvbnRleHQ6IHsgcjogICAxLCBnOiAgIDEsIGI6ICAgMSwgYTogICAxIH1cclxuICAgICAgbGlnaHRncmF5OiAgeyByOiAwLjUsIGc6IDAuNSwgYjogMC41LCBhOiAgIDEgfVxyXG4gICAgICBiYWNrZ3JvdW5kOiB7IHI6ICAgMCwgZzogMC4yLCBiOiAgIDAsIGE6ICAgMSB9XHJcbiAgICAgIHBpbGU6ICAgICAgIHsgcjogMC40LCBnOiAwLjIsIGI6ICAgMCwgYTogICAxIH1cclxuICAgICAgbG9nYmc6ICAgICAgeyByOiAwLjEsIGc6ICAgMCwgYjogICAwLCBhOiAgIDEgfVxyXG4gICAgICBhcnJvdzogICAgICB7IHI6ICAgMSwgZzogICAxLCBiOiAgIDEsIGE6ICAgMSB9XHJcbiAgICAgIGFycm93Y2xvc2U6IHsgcjogICAxLCBnOiAwLjUsIGI6ICAgMCwgYTogMC4zIH1cclxuICAgICAgaGFuZF9waWNrOiAgeyByOiAgIDAsIGc6IDAuMSwgYjogICAwLCBhOiAxLjAgfVxyXG4gICAgICBoYW5kX3Jlb3JnOiB7IHI6IDAuNCwgZzogICAwLCBiOiAgIDAsIGE6IDEuMCB9XHJcbiAgICAgIG92ZXJsYXk6ICAgIHsgcjogICAwLCBnOiAgIDAsIGI6ICAgMCwgYTogMC42IH1cclxuICAgICAgbWFpbm1lbnU6ICAgeyByOiAwLjEsIGc6IDAuMSwgYjogMC4xLCBhOiAgIDEgfVxyXG4gICAgICBwYXVzZW1lbnU6ICB7IHI6IDAuMSwgZzogMC4wLCBiOiAwLjEsIGE6ICAgMSB9XHJcbiAgICAgIGJpZDogICAgICAgIHsgcjogICAwLCBnOiAwLjYsIGI6ICAgMCwgYTogICAxIH1cclxuXHJcbiAgICBAdGV4dHVyZXMgPVxyXG4gICAgICBcImNhcmRzXCI6IDBcclxuICAgICAgXCJkYXJrZm9yZXN0XCI6IDFcclxuICAgICAgXCJjaGFyc1wiOiAyXHJcbiAgICAgIFwiaG93dG8xXCI6IDNcclxuICAgICAgXCJob3d0bzJcIjogNFxyXG4gICAgICBcImhvd3RvM1wiOiA1XHJcblxyXG4gICAgQHRoaXJ0ZWVuID0gbnVsbFxyXG4gICAgQGxhc3RFcnIgPSAnJ1xyXG4gICAgQHBhdXNlZCA9IGZhbHNlXHJcbiAgICBAaG93dG8gPSAwXHJcbiAgICBAcmVuZGVyQ29tbWFuZHMgPSBbXVxyXG5cclxuICAgIEBvcHRpb25NZW51cyA9XHJcbiAgICAgIHNwZWVkczogW1xyXG4gICAgICAgIHsgdGV4dDogXCJBSSBTcGVlZDogU2xvd1wiLCBzcGVlZDogMjAwMCB9XHJcbiAgICAgICAgeyB0ZXh0OiBcIkFJIFNwZWVkOiBNZWRpdW1cIiwgc3BlZWQ6IDEwMDAgfVxyXG4gICAgICAgIHsgdGV4dDogXCJBSSBTcGVlZDogRmFzdFwiLCBzcGVlZDogNTAwIH1cclxuICAgICAgICB7IHRleHQ6IFwiQUkgU3BlZWQ6IFVsdHJhXCIsIHNwZWVkOiAyNTAgfVxyXG4gICAgICBdXHJcbiAgICAgIHNvcnRzOiBbXHJcbiAgICAgICAgeyB0ZXh0OiBcIlNvcnQgT3JkZXI6IE5vcm1hbFwiIH1cclxuICAgICAgICB7IHRleHQ6IFwiU29ydCBPcmRlcjogUmV2ZXJzZVwiIH1cclxuICAgICAgXVxyXG4gICAgQG9wdGlvbnMgPVxyXG4gICAgICBzcGVlZEluZGV4OiAxXHJcbiAgICAgIHNvcnRJbmRleDogMFxyXG4gICAgICBzb3VuZDogdHJ1ZVxyXG5cclxuICAgIEBtYWluTWVudSA9IG5ldyBNZW51IHRoaXMsIFwiVGhpcnRlZW5cIiwgXCJzb2xpZFwiLCBAY29sb3JzLm1haW5tZW51LCBbXHJcbiAgICAgIChjbGljaykgPT5cclxuICAgICAgICBpZiBjbGlja1xyXG4gICAgICAgICAgQGhvd3RvID0gMVxyXG4gICAgICAgIHJldHVybiBcIkhvdyBUbyBQbGF5XCJcclxuICAgICAgKGNsaWNrKSA9PlxyXG4gICAgICAgIGlmIGNsaWNrXHJcbiAgICAgICAgICBAb3B0aW9ucy5zcGVlZEluZGV4ID0gKEBvcHRpb25zLnNwZWVkSW5kZXggKyAxKSAlIEBvcHRpb25NZW51cy5zcGVlZHMubGVuZ3RoXHJcbiAgICAgICAgcmV0dXJuIEBvcHRpb25NZW51cy5zcGVlZHNbQG9wdGlvbnMuc3BlZWRJbmRleF0udGV4dFxyXG4gICAgICAoY2xpY2spID0+XHJcbiAgICAgICAgaWYgY2xpY2tcclxuICAgICAgICAgIEBvcHRpb25zLnNvcnRJbmRleCA9IChAb3B0aW9ucy5zb3J0SW5kZXggKyAxKSAlIEBvcHRpb25NZW51cy5zb3J0cy5sZW5ndGhcclxuICAgICAgICByZXR1cm4gQG9wdGlvbk1lbnVzLnNvcnRzW0BvcHRpb25zLnNvcnRJbmRleF0udGV4dFxyXG4gICAgICAoY2xpY2spID0+XHJcbiAgICAgICAgaWYgY2xpY2tcclxuICAgICAgICAgIEBuZXdHYW1lKClcclxuICAgICAgICByZXR1cm4gXCJTdGFydFwiXHJcbiAgICBdXHJcblxyXG4gICAgQHBhdXNlTWVudSA9IG5ldyBNZW51IHRoaXMsIFwiUGF1c2VkXCIsIFwic29saWRcIiwgQGNvbG9ycy5wYXVzZW1lbnUsIFtcclxuICAgICAgKGNsaWNrKSA9PlxyXG4gICAgICAgIGlmIGNsaWNrXHJcbiAgICAgICAgICBAcGF1c2VkID0gZmFsc2VcclxuICAgICAgICByZXR1cm4gXCJSZXN1bWUgR2FtZVwiXHJcbiAgICAgIChjbGljaykgPT5cclxuICAgICAgICBpZiBjbGlja1xyXG4gICAgICAgICAgQG5ld0dhbWUoKVxyXG4gICAgICAgICAgQHBhdXNlZCA9IGZhbHNlXHJcbiAgICAgICAgcmV0dXJuIFwiTmV3IEdhbWVcIlxyXG4gICAgICAoY2xpY2spID0+XHJcbiAgICAgICAgaWYgY2xpY2tcclxuICAgICAgICAgIEBob3d0byA9IDFcclxuICAgICAgICByZXR1cm4gXCJIb3cgVG8gUGxheVwiXHJcbiAgICAgIChjbGljaykgPT5cclxuICAgICAgICBpZiBjbGlja1xyXG4gICAgICAgICAgQG9wdGlvbnMuc3BlZWRJbmRleCA9IChAb3B0aW9ucy5zcGVlZEluZGV4ICsgMSkgJSBAb3B0aW9uTWVudXMuc3BlZWRzLmxlbmd0aFxyXG4gICAgICAgIHJldHVybiBAb3B0aW9uTWVudXMuc3BlZWRzW0BvcHRpb25zLnNwZWVkSW5kZXhdLnRleHRcclxuICAgICAgKGNsaWNrKSA9PlxyXG4gICAgICAgIGlmIGNsaWNrXHJcbiAgICAgICAgICBAb3B0aW9ucy5zb3J0SW5kZXggPSAoQG9wdGlvbnMuc29ydEluZGV4ICsgMSkgJSBAb3B0aW9uTWVudXMuc29ydHMubGVuZ3RoXHJcbiAgICAgICAgcmV0dXJuIEBvcHRpb25NZW51cy5zb3J0c1tAb3B0aW9ucy5zb3J0SW5kZXhdLnRleHRcclxuICAgIF1cclxuXHJcbiAgICBAbmV3R2FtZSgpXHJcblxyXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAjIGxvZ2dpbmdcclxuXHJcbiAgbG9nOiAocykgLT5cclxuICAgIEBuYXRpdmUubG9nKHMpXHJcblxyXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAjIGxvYWQgLyBzYXZlXHJcblxyXG4gIGxvYWQ6IChqc29uKSAtPlxyXG4gICAgQGxvZyBcIihDUykgbG9hZGluZyBzdGF0ZVwiXHJcbiAgICB0cnlcclxuICAgICAgc3RhdGUgPSBKU09OLnBhcnNlIGpzb25cclxuICAgIGNhdGNoXHJcbiAgICAgIEBsb2cgXCJsb2FkIGZhaWxlZCB0byBwYXJzZSBzdGF0ZTogI3tqc29ufVwiXHJcbiAgICAgIHJldHVyblxyXG4gICAgaWYgc3RhdGUub3B0aW9uc1xyXG4gICAgICBmb3IgaywgdiBvZiBzdGF0ZS5vcHRpb25zXHJcbiAgICAgICAgQG9wdGlvbnNba10gPSB2XHJcblxyXG4gICAgaWYgc3RhdGUudGhpcnRlZW5cclxuICAgICAgQGxvZyBcInJlY3JlYXRpbmcgZ2FtZSBmcm9tIHNhdmVkYXRhXCJcclxuICAgICAgQHRoaXJ0ZWVuID0gbmV3IFRoaXJ0ZWVuIHRoaXMsIHtcclxuICAgICAgICBzdGF0ZTogc3RhdGUudGhpcnRlZW5cclxuICAgICAgfVxyXG4gICAgICBAcHJlcGFyZUdhbWUoKVxyXG5cclxuICBzYXZlOiAtPlxyXG4gICAgIyBAbG9nIFwiKENTKSBzYXZpbmcgc3RhdGVcIlxyXG4gICAgc3RhdGUgPSB7XHJcbiAgICAgIG9wdGlvbnM6IEBvcHRpb25zXHJcbiAgICB9XHJcblxyXG4gICAgIyBUT0RPOiBFTkFCTEUgU0FWSU5HIEhFUkVcclxuICAgICMgaWYgQHRoaXJ0ZWVuP1xyXG4gICAgIyAgIHN0YXRlLnRoaXJ0ZWVuID0gQHRoaXJ0ZWVuLnNhdmUoKVxyXG5cclxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSBzdGF0ZVxyXG5cclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIGFpVGlja1JhdGU6IC0+XHJcbiAgICByZXR1cm4gQG9wdGlvbk1lbnVzLnNwZWVkc1tAb3B0aW9ucy5zcGVlZEluZGV4XS5zcGVlZFxyXG5cclxuICBuZXdHYW1lOiAtPlxyXG4gICAgQHRoaXJ0ZWVuID0gbmV3IFRoaXJ0ZWVuIHRoaXMsIHt9XHJcbiAgICBAbG9nIFwicGxheWVyIDAncyBoYW5kOiBcIiArIEpTT04uc3RyaW5naWZ5KEB0aGlydGVlbi5wbGF5ZXJzWzBdLmhhbmQpXHJcbiAgICBAcHJlcGFyZUdhbWUoKVxyXG5cclxuICBwcmVwYXJlR2FtZTogLT5cclxuICAgIEBoYW5kID0gbmV3IEhhbmQgdGhpc1xyXG4gICAgQHBpbGUgPSBuZXcgUGlsZSB0aGlzLCBAaGFuZFxyXG4gICAgQGhhbmQuc2V0IEB0aGlydGVlbi5wbGF5ZXJzWzBdLmhhbmRcclxuXHJcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICMgaW5wdXQgaGFuZGxpbmdcclxuXHJcbiAgdG91Y2hEb3duOiAoeCwgeSkgLT5cclxuICAgICMgQGxvZyhcInRvdWNoRG93biAje3h9LCN7eX1cIilcclxuICAgIEBjaGVja1pvbmVzKHgsIHkpXHJcblxyXG4gIHRvdWNoTW92ZTogKHgsIHkpIC0+XHJcbiAgICAjIEBsb2coXCJ0b3VjaE1vdmUgI3t4fSwje3l9XCIpXHJcbiAgICBpZiBAdGhpcnRlZW4gIT0gbnVsbFxyXG4gICAgICBAaGFuZC5tb3ZlKHgsIHkpXHJcblxyXG4gIHRvdWNoVXA6ICh4LCB5KSAtPlxyXG4gICAgIyBAbG9nKFwidG91Y2hVcCAje3h9LCN7eX1cIilcclxuICAgIGlmIEB0aGlydGVlbiAhPSBudWxsXHJcbiAgICAgIEBoYW5kLnVwKHgsIHkpXHJcblxyXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAjIGhlYWRsaW5lIChnYW1lIHN0YXRlIGluIHRvcCBsZWZ0KVxyXG5cclxuICBwcmV0dHlFcnJvclRhYmxlOiB7XHJcbiAgICAjIGJpZE91dE9mUmFuZ2U6ICAgICAgXCJZb3UgYXJlIHNvbWVob3cgYmlkZGluZyBhbiBpbXBvc3NpYmxlIHZhbHVlLiBUaGUgZ2FtZSBtdXN0IGJlIGJyb2tlbi5cIlxyXG4gICAgIyBkZWFsZXJGdWNrZWQ6ICAgICAgIFwiRGVhbGVyIHJlc3RyaWN0aW9uOiBZb3UgbWF5IG5vdCBtYWtlIHRvdGFsIGJpZHMgbWF0Y2ggdG90YWwgdHJpY2tzLlwiXHJcbiAgICAjIGRvTm90SGF2ZTogICAgICAgICAgXCJZb3UgYXJlIHNvbWVob3cgYXR0ZW1wdGluZyB0byBwbGF5IGEgY2FyZCB5b3UgZG9uJ3Qgb3duLiBUaGUgZ2FtZSBtdXN0IGJlIGJyb2tlbi5cIlxyXG4gICAgIyBmb3JjZWRIaWdoZXJJblN1aXQ6IFwiWW91IGhhdmUgYSBoaWdoZXIgdmFsdWUgaW4gdGhlIGxlYWQgc3VpdC4gWW91IG11c3QgcGxheSBpdC4gKFJ1bGUgMilcIlxyXG4gICAgIyBmb3JjZWRJblN1aXQ6ICAgICAgIFwiWW91IGhhdmUgYXQgbGVhc3Qgb25lIG9mIHRoZSBsZWFkIHN1aXQuIFlvdSBtdXN0IHBsYXkgaXQuIChSdWxlIDEpXCJcclxuICAgICMgZ2FtZU92ZXI6ICAgICAgICAgICBcIlRoZSBnYW1lIGlzIG92ZXIuICBUaGUgZ2FtZSBtdXN0IGJlIGJyb2tlbi5cIlxyXG4gICAgIyBpbmRleE91dE9mUmFuZ2U6ICAgIFwiWW91IGRvbid0IGhhdmUgdGhhdCBpbmRleC4gVGhlIGdhbWUgbXVzdCBiZSBicm9rZW4uXCJcclxuICAgICMgbG93ZXN0Q2FyZFJlcXVpcmVkOiBcIllvdSBtdXN0IHN0YXJ0IHRoZSByb3VuZCB3aXRoIHRoZSBsb3dlc3QgY2FyZCB5b3UgaGF2ZS5cIlxyXG4gICAgIyBuZXh0SXNDb25mdXNlZDogICAgIFwiSW50ZXJhbCBlcnJvci4gVGhlIGdhbWUgbXVzdCBiZSBicm9rZW4uXCJcclxuICAgICMgbm9OZXh0OiAgICAgICAgICAgICBcIkludGVyYWwgZXJyb3IuIFRoZSBnYW1lIG11c3QgYmUgYnJva2VuLlwiXHJcbiAgICAjIG5vdEJpZGRpbmdOb3c6ICAgICAgXCJZb3UgYXJlIHRyeWluZyB0byBiaWQgZHVyaW5nIHRoZSB3cm9uZyBwaGFzZS5cIlxyXG4gICAgIyBub3RFbm91Z2hQbGF5ZXJzOiAgIFwiQ2Fubm90IHN0YXJ0IHRoZSBnYW1lIHdpdGhvdXQgbW9yZSBwbGF5ZXJzLlwiXHJcbiAgICAjIG5vdEluVHJpY2s6ICAgICAgICAgXCJZb3UgYXJlIHRyeWluZyB0byBwbGF5IGEgY2FyZCBkdXJpbmcgdGhlIHdyb25nIHBoYXNlLlwiXHJcbiAgICAjIG5vdFlvdXJUdXJuOiAgICAgICAgXCJJdCBpc24ndCB5b3VyIHR1cm4uXCJcclxuICAgICMgdHJ1bXBOb3RCcm9rZW46ICAgICBcIlRydW1wIGlzbid0IGJyb2tlbiB5ZXQuIExlYWQgd2l0aCBhIG5vbi1zcGFkZS5cIlxyXG4gIH1cclxuXHJcbiAgcHJldHR5RXJyb3I6IC0+XHJcbiAgICBwcmV0dHkgPSBAcHJldHR5RXJyb3JUYWJsZVtAbGFzdEVycl1cclxuICAgIHJldHVybiBwcmV0dHkgaWYgcHJldHR5XHJcbiAgICByZXR1cm4gQGxhc3RFcnJcclxuXHJcbiAgY2FsY0hlYWRsaW5lOiAtPlxyXG4gICAgcmV0dXJuIFwiXCIgaWYgQHRoaXJ0ZWVuID09IG51bGxcclxuXHJcbiAgICBoZWFkbGluZSA9IEB0aGlydGVlbi5oZWFkbGluZSgpXHJcbiAgICAjIHN3aXRjaCBAdGhpcnRlZW4uc3RhdGVcclxuICAgICMgICB3aGVuIFN0YXRlLkJJRFxyXG4gICAgIyAgICAgaGVhZGxpbmUgPSBcIldhaXRpbmcgZm9yIGBmZjc3MDBgI3tAdGhpcnRlZW4ucGxheWVyc1tAdGhpcnRlZW4udHVybl0ubmFtZX1gYCB0byBgZmZmZjAwYGJpZGBgXCJcclxuICAgICMgICB3aGVuIFN0YXRlLlRSSUNLXHJcbiAgICAjICAgICBoZWFkbGluZSA9IFwiV2FpdGluZyBmb3IgYGZmNzcwMGAje0B0aGlydGVlbi5wbGF5ZXJzW0B0aGlydGVlbi50dXJuXS5uYW1lfWBgIHRvIGBmZmZmMDBgcGxheWBgXCJcclxuICAgICMgICB3aGVuIFN0YXRlLlJPVU5EU1VNTUFSWVxyXG4gICAgIyAgICAgaGVhZGxpbmUgPSBcIldhaXRpbmcgZm9yIG5leHQgcm91bmQuLi5cIlxyXG4gICAgIyAgIHdoZW4gU3RhdGUuUE9TVEdBTUVTVU1NQVJZXHJcbiAgICAjICAgICBoZWFkbGluZSA9IFwiR2FtZSBvdmVyIVwiXHJcblxyXG4gICAgZXJyVGV4dCA9IFwiXCJcclxuICAgIGlmIChAbGFzdEVyci5sZW5ndGggPiAwKSBhbmQgKEBsYXN0RXJyICE9IE9LKVxyXG4gICAgICBlcnJUZXh0ID0gXCIgIEVSUk9SOiBgZmYwMDAwYCN7QHByZXR0eUVycm9yKCl9XCJcclxuICAgICAgaGVhZGxpbmUgKz0gZXJyVGV4dFxyXG5cclxuICAgIHJldHVybiBoZWFkbGluZVxyXG5cclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgIyBnYW1lIG92ZXIgaW5mb3JtYXRpb25cclxuXHJcbiAgZ2FtZU92ZXJUZXh0OiAtPlxyXG4gICAgd2lubmVyID0gQHRoaXJ0ZWVuLndpbm5lcigpXHJcbiAgICBpZiB3aW5uZXIubmFtZSA9PSBcIlBsYXllclwiXHJcbiAgICAgIHJldHVybiBbXCJZb3Ugd2luIVwiXVxyXG4gICAgcmV0dXJuIFtcIiN7d2lubmVyLm5hbWV9IHdpbnMhXCJdXHJcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICMgY2FyZCBoYW5kbGluZ1xyXG5cclxuICBwYXNzOiAtPlxyXG4gICAgQGxhc3RFcnIgPSBAdGhpcnRlZW4ucGFzcyB7XHJcbiAgICAgIGlkOiAxXHJcbiAgICB9XHJcblxyXG4gIHBsYXk6IChjYXJkcykgLT5cclxuICAgIGNvbnNvbGUubG9nIFwiKGdhbWUpIHBsYXlpbmcgY2FyZHNcIiwgY2FyZHNcclxuXHJcbiAgICBAdGhpcnRlZW4udXBkYXRlUGxheWVySGFuZChAaGFuZC5jYXJkcylcclxuXHJcbiAgICByYXdDYXJkcyA9IFtdXHJcbiAgICBmb3IgY2FyZCBpbiBjYXJkc1xyXG4gICAgICByYXdDYXJkcy5wdXNoIGNhcmQuY2FyZFxyXG5cclxuICAgIHJldCA9IEB0aGlydGVlbi5wbGF5IHtcclxuICAgICAgaWQ6IDFcclxuICAgICAgY2FyZHM6IHJhd0NhcmRzXHJcbiAgICB9XHJcbiAgICBAbGFzdEVyciA9IHJldFxyXG4gICAgaWYgcmV0ID09IE9LXHJcbiAgICAgIEBoYW5kLnNldCBAdGhpcnRlZW4ucGxheWVyc1swXS5oYW5kXHJcbiAgICAgIEBwaWxlLmhpbnQgY2FyZHNcclxuXHJcbiAgcGxheVBpY2tlZDogLT5cclxuICAgIGlmIG5vdCBAaGFuZC5waWNraW5nXHJcbiAgICAgIHJldHVyblxyXG4gICAgY2FyZHMgPSBAaGFuZC5zZWxlY3RlZENhcmRzKClcclxuICAgIEBoYW5kLnNlbGVjdE5vbmUoKVxyXG4gICAgaWYgY2FyZHMubGVuZ3RoID09IDBcclxuICAgICAgcmV0dXJuIEBwYXNzKClcclxuICAgICMgQGhhbmQudG9nZ2xlUGlja2luZygpXHJcbiAgICByZXR1cm4gQHBsYXkoY2FyZHMpXHJcblxyXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAjIG1haW4gbG9vcFxyXG5cclxuICB1cGRhdGU6IChkdCkgLT5cclxuICAgIEB6b25lcy5sZW5ndGggPSAwICMgZm9yZ2V0IGFib3V0IHpvbmVzIGZyb20gdGhlIGxhc3QgZnJhbWUuIHdlJ3JlIGFib3V0IHRvIG1ha2Ugc29tZSBuZXcgb25lcyFcclxuXHJcbiAgICB1cGRhdGVkID0gZmFsc2VcclxuICAgIGlmIEB1cGRhdGVNYWluTWVudShkdClcclxuICAgICAgdXBkYXRlZCA9IHRydWVcclxuICAgIGlmIEB1cGRhdGVHYW1lKGR0KVxyXG4gICAgICB1cGRhdGVkID0gdHJ1ZVxyXG5cclxuICAgIHJldHVybiB1cGRhdGVkXHJcblxyXG4gIHVwZGF0ZU1haW5NZW51OiAoZHQpIC0+XHJcbiAgICB1cGRhdGVkID0gZmFsc2VcclxuICAgIGlmIEBtYWluTWVudS51cGRhdGUoZHQpXHJcbiAgICAgIHVwZGF0ZWQgPSB0cnVlXHJcbiAgICByZXR1cm4gdXBkYXRlZFxyXG5cclxuICB1cGRhdGVHYW1lOiAoZHQpIC0+XHJcbiAgICByZXR1cm4gZmFsc2UgaWYgQHRoaXJ0ZWVuID09IG51bGxcclxuXHJcbiAgICB1cGRhdGVkID0gZmFsc2VcclxuXHJcbiAgICBpZiBAcGlsZS51cGRhdGUoZHQpXHJcbiAgICAgIHVwZGF0ZWQgPSB0cnVlXHJcbiAgICBpZiBAcGlsZS5yZWFkeUZvck5leHRUcmljaygpXHJcbiAgICAgIEBuZXh0QUlUaWNrIC09IGR0XHJcbiAgICAgIGlmIEBuZXh0QUlUaWNrIDw9IDBcclxuICAgICAgICBAbmV4dEFJVGljayA9IEBhaVRpY2tSYXRlKClcclxuICAgICAgICBpZiBAdGhpcnRlZW4uYWlUaWNrKClcclxuICAgICAgICAgIHVwZGF0ZWQgPSB0cnVlXHJcbiAgICBpZiBAaGFuZC51cGRhdGUoZHQpXHJcbiAgICAgIHVwZGF0ZWQgPSB0cnVlXHJcblxyXG4gICAgQHBpbGUuc2V0IEB0aGlydGVlbi50aHJvd0lELCBAdGhpcnRlZW4ucGlsZSwgQHRoaXJ0ZWVuLnBpbGVXaG9cclxuXHJcbiAgICBpZiBAcGF1c2VNZW51LnVwZGF0ZShkdClcclxuICAgICAgdXBkYXRlZCA9IHRydWVcclxuXHJcbiAgICByZXR1cm4gdXBkYXRlZFxyXG5cclxuICByZW5kZXI6IC0+XHJcbiAgICAjIFJlc2V0IHJlbmRlciBjb21tYW5kc1xyXG4gICAgQHJlbmRlckNvbW1hbmRzLmxlbmd0aCA9IDBcclxuXHJcbiAgICBpZiBAaG93dG8gPiAwXHJcbiAgICAgIEByZW5kZXJIb3d0bygpXHJcbiAgICBlbHNlIGlmIEB0aGlydGVlbiA9PSBudWxsXHJcbiAgICAgIEByZW5kZXJNYWluTWVudSgpXHJcbiAgICBlbHNlXHJcbiAgICAgIEByZW5kZXJHYW1lKClcclxuXHJcbiAgICByZXR1cm4gQHJlbmRlckNvbW1hbmRzXHJcblxyXG4gIHJlbmRlckhvd3RvOiAtPlxyXG4gICAgaG93dG9UZXh0dXJlID0gXCJob3d0byN7QGhvd3RvfVwiXHJcbiAgICBAbG9nIFwicmVuZGVyaW5nICN7aG93dG9UZXh0dXJlfVwiXHJcbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwic29saWRcIiwgMCwgMCwgQHdpZHRoLCBAaGVpZ2h0LCAwLCAwLCAwLCBAY29sb3JzLmJsYWNrXHJcbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIGhvd3RvVGV4dHVyZSwgMCwgMCwgQHdpZHRoLCBAYWFIZWlnaHQsIDAsIDAsIDAsIEBjb2xvcnMud2hpdGVcclxuICAgIGFycm93V2lkdGggPSBAd2lkdGggLyAyMFxyXG4gICAgYXJyb3dPZmZzZXQgPSBhcnJvd1dpZHRoICogNFxyXG4gICAgY29sb3IgPSBpZiBAaG93dG8gPT0gMSB0aGVuIEBjb2xvcnMuYXJyb3djbG9zZSBlbHNlIEBjb2xvcnMuYXJyb3dcclxuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJhcnJvd0xcIiwgQGNlbnRlci54IC0gYXJyb3dPZmZzZXQsIEBoZWlnaHQsIGFycm93V2lkdGgsIDAsIDAsIDAuNSwgMSwgY29sb3IsID0+XHJcbiAgICAgIEBob3d0by0tXHJcbiAgICAgIGlmIEBob3d0byA8IDBcclxuICAgICAgICBAaG93dG8gPSAwXHJcbiAgICBjb2xvciA9IGlmIEBob3d0byA9PSAzIHRoZW4gQGNvbG9ycy5hcnJvd2Nsb3NlIGVsc2UgQGNvbG9ycy5hcnJvd1xyXG4gICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcImFycm93UlwiLCBAY2VudGVyLnggKyBhcnJvd09mZnNldCwgQGhlaWdodCwgYXJyb3dXaWR0aCwgMCwgMCwgMC41LCAxLCBjb2xvciwgPT5cclxuICAgICAgQGhvd3RvKytcclxuICAgICAgaWYgQGhvd3RvID4gM1xyXG4gICAgICAgIEBob3d0byA9IDBcclxuXHJcbiAgcmVuZGVyTWFpbk1lbnU6IC0+XHJcbiAgICBAbWFpbk1lbnUucmVuZGVyKClcclxuXHJcbiAgcmVuZGVyR2FtZTogLT5cclxuXHJcbiAgICAjIGJhY2tncm91bmRcclxuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJzb2xpZFwiLCAwLCAwLCBAd2lkdGgsIEBoZWlnaHQsIDAsIDAsIDAsIEBjb2xvcnMuYmFja2dyb3VuZFxyXG5cclxuICAgIHRleHRIZWlnaHQgPSBAYWFIZWlnaHQgLyAyNVxyXG4gICAgdGV4dFBhZGRpbmcgPSB0ZXh0SGVpZ2h0IC8gNVxyXG4gICAgY2hhcmFjdGVySGVpZ2h0ID0gQGFhSGVpZ2h0IC8gNVxyXG4gICAgY291bnRIZWlnaHQgPSB0ZXh0SGVpZ2h0XHJcblxyXG4gICAgIyBMb2dcclxuICAgIGZvciBsaW5lLCBpIGluIEB0aGlydGVlbi5sb2dcclxuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIHRleHRIZWlnaHQsIGxpbmUsIDAsIChpKzEpICogKHRleHRIZWlnaHQgKyB0ZXh0UGFkZGluZyksIDAsIDAsIEBjb2xvcnMud2hpdGVcclxuXHJcbiAgICBhaVBsYXllcnMgPSBbXHJcbiAgICAgIEB0aGlydGVlbi5wbGF5ZXJzWzFdXHJcbiAgICAgIEB0aGlydGVlbi5wbGF5ZXJzWzJdXHJcbiAgICAgIEB0aGlydGVlbi5wbGF5ZXJzWzNdXHJcbiAgICBdXHJcblxyXG4gICAgY2hhcmFjdGVyTWFyZ2luID0gY2hhcmFjdGVySGVpZ2h0IC8gMlxyXG4gICAgQGNoYXJDZWlsaW5nID0gQGhlaWdodCAqIDAuNlxyXG5cclxuICAgICMgbGVmdCBzaWRlXHJcbiAgICBpZiBhaVBsYXllcnNbMF0gIT0gbnVsbFxyXG4gICAgICBjaGFyYWN0ZXIgPSBhaUNoYXJhY3RlcnNbYWlQbGF5ZXJzWzBdLmNoYXJJRF1cclxuICAgICAgY2hhcmFjdGVyV2lkdGggPSBAc3ByaXRlUmVuZGVyZXIuY2FsY1dpZHRoKGNoYXJhY3Rlci5zcHJpdGUsIGNoYXJhY3RlckhlaWdodClcclxuICAgICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBjaGFyYWN0ZXIuc3ByaXRlLCBjaGFyYWN0ZXJNYXJnaW4sIEBjaGFyQ2VpbGluZywgMCwgY2hhcmFjdGVySGVpZ2h0LCAwLCAwLCAxLCBAY29sb3JzLndoaXRlXHJcbiAgICAgIEByZW5kZXJDb3VudCBhaVBsYXllcnNbMF0sIGFpUGxheWVyc1swXS5pbmRleCA9PSBAdGhpcnRlZW4udHVybiwgY291bnRIZWlnaHQsIGNoYXJhY3Rlck1hcmdpbiArIChjaGFyYWN0ZXJXaWR0aCAvIDIpLCBAY2hhckNlaWxpbmcgLSB0ZXh0UGFkZGluZywgMC41LCAwXHJcbiAgICAgIEByZW5kZXJBSUhhbmQgYWlQbGF5ZXJzWzBdLmNvdW50LCBjaGFyYWN0ZXJNYXJnaW4gKyAoY2hhcmFjdGVyV2lkdGggLyAyKSwgQGNoYXJDZWlsaW5nIC0gdGV4dFBhZGRpbmcsIDAuNSwgMFxyXG4gICAgIyB0b3Agc2lkZVxyXG4gICAgaWYgYWlQbGF5ZXJzWzFdICE9IG51bGxcclxuICAgICAgY2hhcmFjdGVyID0gYWlDaGFyYWN0ZXJzW2FpUGxheWVyc1sxXS5jaGFySURdXHJcbiAgICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgY2hhcmFjdGVyLnNwcml0ZSwgQGNlbnRlci54LCAwLCAwLCBjaGFyYWN0ZXJIZWlnaHQsIDAsIDAuNSwgMCwgQGNvbG9ycy53aGl0ZVxyXG4gICAgICBAcmVuZGVyQ291bnQgYWlQbGF5ZXJzWzFdLCBhaVBsYXllcnNbMV0uaW5kZXggPT0gQHRoaXJ0ZWVuLnR1cm4sIGNvdW50SGVpZ2h0LCBAY2VudGVyLngsIGNoYXJhY3RlckhlaWdodCwgMC41LCAwXHJcbiAgICAgIEByZW5kZXJBSUhhbmQgYWlQbGF5ZXJzWzBdLmNvdW50LCBjaGFyYWN0ZXJNYXJnaW4gKyAoY2hhcmFjdGVyV2lkdGggLyAyKSwgQGNoYXJDZWlsaW5nIC0gdGV4dFBhZGRpbmcsIDAuNSwgMFxyXG4gICAgIyByaWdodCBzaWRlXHJcbiAgICBpZiBhaVBsYXllcnNbMl0gIT0gbnVsbFxyXG4gICAgICBjaGFyYWN0ZXIgPSBhaUNoYXJhY3RlcnNbYWlQbGF5ZXJzWzJdLmNoYXJJRF1cclxuICAgICAgY2hhcmFjdGVyV2lkdGggPSBAc3ByaXRlUmVuZGVyZXIuY2FsY1dpZHRoKGNoYXJhY3Rlci5zcHJpdGUsIGNoYXJhY3RlckhlaWdodClcclxuICAgICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBjaGFyYWN0ZXIuc3ByaXRlLCBAd2lkdGggLSBjaGFyYWN0ZXJNYXJnaW4sIEBjaGFyQ2VpbGluZywgMCwgY2hhcmFjdGVySGVpZ2h0LCAwLCAxLCAxLCBAY29sb3JzLndoaXRlXHJcbiAgICAgIEByZW5kZXJDb3VudCBhaVBsYXllcnNbMl0sIGFpUGxheWVyc1syXS5pbmRleCA9PSBAdGhpcnRlZW4udHVybiwgY291bnRIZWlnaHQsIEB3aWR0aCAtIChjaGFyYWN0ZXJNYXJnaW4gKyAoY2hhcmFjdGVyV2lkdGggLyAyKSksIEBjaGFyQ2VpbGluZyAtIHRleHRQYWRkaW5nLCAwLjUsIDBcclxuICAgICAgQHJlbmRlckFJSGFuZCBhaVBsYXllcnNbMF0uY291bnQsIGNoYXJhY3Rlck1hcmdpbiArIChjaGFyYWN0ZXJXaWR0aCAvIDIpLCBAY2hhckNlaWxpbmcgLSB0ZXh0UGFkZGluZywgMC41LCAwXHJcblxyXG4gICAgIyBjYXJkIGFyZWFcclxuICAgIGhhbmRBcmVhSGVpZ2h0ID0gMC4yNyAqIEBoZWlnaHRcclxuICAgIGlmIEBoYW5kLnBpY2tpbmdcclxuICAgICAgaGFuZGFyZWFDb2xvciA9IEBjb2xvcnMuaGFuZF9waWNrXHJcbiAgICBlbHNlXHJcbiAgICAgIGhhbmRhcmVhQ29sb3IgPSBAY29sb3JzLmhhbmRfcmVvcmdcclxuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJzb2xpZFwiLCAwLCBAaGVpZ2h0LCBAd2lkdGgsIGhhbmRBcmVhSGVpZ2h0LCAwLCAwLCAxLCBoYW5kYXJlYUNvbG9yLCA9PlxyXG4gICAgICBAaGFuZC50b2dnbGVQaWNraW5nKClcclxuXHJcbiAgICAjIHBpbGVcclxuICAgIHBpbGVEaW1lbnNpb24gPSBAaGVpZ2h0ICogMC40XHJcbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwicGlsZVwiLCBAd2lkdGggLyAyLCBAaGVpZ2h0IC8gMiwgcGlsZURpbWVuc2lvbiwgcGlsZURpbWVuc2lvbiwgMCwgMC41LCAwLjUsIEBjb2xvcnMud2hpdGUsID0+XHJcbiAgICAgIEBwbGF5UGlja2VkKClcclxuICAgIEBwaWxlLnJlbmRlcigpXHJcblxyXG4gICAgQGhhbmQucmVuZGVyKClcclxuICAgIEByZW5kZXJDb3VudCBAdGhpcnRlZW4ucGxheWVyc1swXSwgMCA9PSBAdGhpcnRlZW4udHVybiwgY291bnRIZWlnaHQsIEBjZW50ZXIueCwgQGhlaWdodCwgMC41LCAxXHJcblxyXG4gICAgaWYgQHRoaXJ0ZWVuLndpbm5lcigpIGFuZCBAcGlsZS5yZXN0aW5nKClcclxuICAgICAgbGluZXMgPSBAZ2FtZU92ZXJUZXh0KClcclxuICAgICAgZ2FtZU92ZXJTaXplID0gQGFhSGVpZ2h0IC8gOFxyXG4gICAgICBnYW1lT3ZlclkgPSBAY2VudGVyLnlcclxuICAgICAgaWYgbGluZXMubGVuZ3RoID4gMVxyXG4gICAgICAgIGdhbWVPdmVyWSAtPSAoZ2FtZU92ZXJTaXplID4+IDEpXHJcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCBnYW1lT3ZlclNpemUsIGxpbmVzWzBdLCBAY2VudGVyLngsIGdhbWVPdmVyWSwgMC41LCAwLjUsIEBjb2xvcnMub3JhbmdlXHJcbiAgICAgIGlmIGxpbmVzLmxlbmd0aCA+IDFcclxuICAgICAgICBnYW1lT3ZlclkgKz0gZ2FtZU92ZXJTaXplXHJcbiAgICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIGdhbWVPdmVyU2l6ZSwgbGluZXNbMV0sIEBjZW50ZXIueCwgZ2FtZU92ZXJZLCAwLjUsIDAuNSwgQGNvbG9ycy5vcmFuZ2VcclxuXHJcbiAgICAgIHJlc3RhcnRRdWl0U2l6ZSA9IEBhYUhlaWdodCAvIDEyXHJcbiAgICAgIHNoYWRvd0Rpc3RhbmNlID0gcmVzdGFydFF1aXRTaXplIC8gOFxyXG4gICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgcmVzdGFydFF1aXRTaXplLCBcIlBsYXkgQWdhaW5cIiwgc2hhZG93RGlzdGFuY2UgKyBAY2VudGVyLngsIHNoYWRvd0Rpc3RhbmNlICsgKEBoZWlnaHQgLSAoaGFuZEFyZWFIZWlnaHQgKiAwLjUpKSwgMC41LCAxLCBAY29sb3JzLmJsYWNrLCA9PlxyXG4gICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgcmVzdGFydFF1aXRTaXplLCBcIlBsYXkgQWdhaW5cIiwgQGNlbnRlci54LCBAaGVpZ2h0IC0gKGhhbmRBcmVhSGVpZ2h0ICogMC41KSwgMC41LCAxLCBAY29sb3JzLmdvbGQsID0+XHJcbiAgICAgICAgQHRoaXJ0ZWVuLmRlYWwoKVxyXG4gICAgICAgIEBwcmVwYXJlR2FtZSgpXHJcblxyXG4gICAgIyBIZWFkbGluZSAoaW5jbHVkZXMgZXJyb3IpXHJcbiAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgdGV4dEhlaWdodCwgQGNhbGNIZWFkbGluZSgpLCAwLCAwLCAwLCAwLCBAY29sb3JzLmxpZ2h0Z3JheVxyXG5cclxuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJwYXVzZVwiLCBAd2lkdGgsIDAsIDAsIEBwYXVzZUJ1dHRvblNpemUsIDAsIDEsIDAsIEBjb2xvcnMud2hpdGUsID0+XHJcbiAgICAgIEBwYXVzZWQgPSB0cnVlXHJcblxyXG4gICAgaWYgbm90IEBoYW5kLnBpY2tpbmdcclxuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIHRleHRIZWlnaHQsIFwiVW5sb2NrZWRcIiwgMC4wMiAqIEB3aWR0aCwgQGhlaWdodCAtIGhhbmRBcmVhSGVpZ2h0LCAwLCAwLCBAY29sb3JzLndoaXRlXHJcblxyXG4gICAgaWYgQHBhdXNlZFxyXG4gICAgICBAcGF1c2VNZW51LnJlbmRlcigpXHJcblxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHJlbmRlckNvdW50OiAocGxheWVyLCBteVR1cm4sIGNvdW50SGVpZ2h0LCB4LCB5LCBhbmNob3J4LCBhbmNob3J5KSAtPlxyXG4gICAgaWYgbXlUdXJuXHJcbiAgICAgIG5hbWVDb2xvciA9IFwiYGZmNzcwMGBcIlxyXG4gICAgZWxzZVxyXG4gICAgICBuYW1lQ29sb3IgPSBcIlwiXHJcbiAgICBuYW1lU3RyaW5nID0gXCIgI3tuYW1lQ29sb3J9I3twbGF5ZXIubmFtZX1gYCBcIlxyXG4gICAgY2FyZENvdW50ID0gcGxheWVyLmhhbmQubGVuZ3RoXHJcbiAgICBpZiBjYXJkQ291bnQgPiAxXHJcbiAgICAgIHRyaWNrQ29sb3IgPSBcImZmZmYzM1wiXHJcbiAgICBlbHNlXHJcbiAgICAgIHRyaWNrQ29sb3IgPSBcImZmMzMzM1wiXHJcbiAgICBjb3VudFN0cmluZyA9IFwiIGAje3RyaWNrQ29sb3J9YCN7Y2FyZENvdW50fWBgIGxlZnQgXCJcclxuXHJcbiAgICBuYW1lU2l6ZSA9IEBmb250UmVuZGVyZXIuc2l6ZShAZm9udCwgY291bnRIZWlnaHQsIG5hbWVTdHJpbmcpXHJcbiAgICBjb3VudFNpemUgPSBAZm9udFJlbmRlcmVyLnNpemUoQGZvbnQsIGNvdW50SGVpZ2h0LCBjb3VudFN0cmluZylcclxuICAgIGlmIG5hbWVTaXplLncgPiBjb3VudFNpemUud1xyXG4gICAgICBjb3VudFNpemUudyA9IG5hbWVTaXplLndcclxuICAgIGVsc2VcclxuICAgICAgbmFtZVNpemUudyA9IGNvdW50U2l6ZS53XHJcbiAgICBuYW1lWSA9IHlcclxuICAgIGNvdW50WSA9IHlcclxuICAgIGJveEhlaWdodCA9IGNvdW50U2l6ZS5oXHJcbiAgICBpZiBwbGF5ZXIuaWQgIT0gMVxyXG4gICAgICBib3hIZWlnaHQgKj0gMlxyXG4gICAgICBpZiBhbmNob3J5ID4gMFxyXG4gICAgICAgIG5hbWVZIC09IGNvdW50SGVpZ2h0XHJcbiAgICAgIGVsc2VcclxuICAgICAgICBjb3VudFkgKz0gY291bnRIZWlnaHRcclxuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJzb2xpZFwiLCB4LCB5LCBjb3VudFNpemUudywgYm94SGVpZ2h0LCAwLCBhbmNob3J4LCBhbmNob3J5LCBAY29sb3JzLm92ZXJsYXlcclxuICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCBjb3VudEhlaWdodCwgbmFtZVN0cmluZywgeCwgbmFtZVksIGFuY2hvcngsIGFuY2hvcnksIEBjb2xvcnMud2hpdGVcclxuICAgIGlmIHBsYXllci5pZCAhPSAxXHJcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCBjb3VudEhlaWdodCwgY291bnRTdHJpbmcsIHgsIGNvdW50WSwgYW5jaG9yeCwgYW5jaG9yeSwgQGNvbG9ycy53aGl0ZVxyXG5cclxuICByZW5kZXJBSUhhbmQ6IChjYXJkQ291bnQsIGNvdW50SGVpZ2h0LCB4LCB5LCBhbmNob3J4LCBhbmNob3J5KSAtPlxyXG4gICAgIyBUT0RPOiBtYWtlIHRoaXMgZHJhdyBhIHRpbnkgaGFuZCBvZiBjYXJkcyBvbiB0aGUgQUkgY2hhcnNcclxuXHJcbiAgICAjIGNhcmRIZWlnaHQgPSBNYXRoLmZsb29yKEBoZWlnaHQgKiBDQVJEX1JFTkRFUl9TQ0FMRSlcclxuICAgICMgY2FyZFdpZHRoICA9IE1hdGguZmxvb3IoY2FyZEhlaWdodCAqIENBUkRfSU1BR0VfVyAvIENBUkRfSU1BR0VfSClcclxuICAgICMgQGdhbWUuZHJhd0ltYWdlIFwiY2FyZHNcIixcclxuICAgICMgSGFuZC5DQVJEX0lNQUdFX09GRl9YICsgKEhhbmQuQ0FSRF9JTUFHRV9BRFZfWCAqIHJhbmspLCBIYW5kLkNBUkRfSU1BR0VfT0ZGX1kgKyAoSGFuZC5DQVJEX0lNQUdFX0FEVl9ZICogc3VpdCksIEhhbmQuQ0FSRF9JTUFHRV9XLCBIYW5kLkNBUkRfSU1BR0VfSCxcclxuICAgICMgeCwgeSwgQGNhcmRXaWR0aCAqIHNjYWxlLCBAY2FyZEhlaWdodCAqIHNjYWxlLFxyXG4gICAgIyByb3QsIDAuNSwgMC41LCAxLDEsMSwxLCBjYlxyXG5cclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgIyByZW5kZXJpbmcgYW5kIHpvbmVzXHJcblxyXG4gIGRyYXdJbWFnZTogKHRleHR1cmUsIHN4LCBzeSwgc3csIHNoLCBkeCwgZHksIGR3LCBkaCwgcm90LCBhbmNob3J4LCBhbmNob3J5LCByLCBnLCBiLCBhLCBjYikgLT5cclxuICAgIEByZW5kZXJDb21tYW5kcy5wdXNoIEB0ZXh0dXJlc1t0ZXh0dXJlXSwgc3gsIHN5LCBzdywgc2gsIGR4LCBkeSwgZHcsIGRoLCByb3QsIGFuY2hvcngsIGFuY2hvcnksIHIsIGcsIGIsIGFcclxuXHJcbiAgICBpZiBjYj9cclxuICAgICAgIyBjYWxsZXIgd2FudHMgdG8gcmVtZW1iZXIgd2hlcmUgdGhpcyB3YXMgZHJhd24sIGFuZCB3YW50cyB0byBiZSBjYWxsZWQgYmFjayBpZiBpdCBpcyBldmVyIHRvdWNoZWRcclxuICAgICAgIyBUaGlzIGlzIGNhbGxlZCBhIFwiem9uZVwiLiBTaW5jZSB6b25lcyBhcmUgdHJhdmVyc2VkIGluIHJldmVyc2Ugb3JkZXIsIHRoZSBuYXR1cmFsIG92ZXJsYXAgb2ZcclxuICAgICAgIyBhIHNlcmllcyBvZiByZW5kZXJzIGlzIHJlc3BlY3RlZCBhY2NvcmRpbmdseS5cclxuICAgICAgYW5jaG9yT2Zmc2V0WCA9IC0xICogYW5jaG9yeCAqIGR3XHJcbiAgICAgIGFuY2hvck9mZnNldFkgPSAtMSAqIGFuY2hvcnkgKiBkaFxyXG4gICAgICB6b25lID1cclxuICAgICAgICAjIGNlbnRlciAoWCxZKSBhbmQgcmV2ZXJzZWQgcm90YXRpb24sIHVzZWQgdG8gcHV0IHRoZSBjb29yZGluYXRlIGluIGxvY2FsIHNwYWNlIHRvIHRoZSB6b25lXHJcbiAgICAgICAgY3g6ICBkeFxyXG4gICAgICAgIGN5OiAgZHlcclxuICAgICAgICByb3Q6IHJvdCAqIC0xXHJcbiAgICAgICAgIyB0aGUgYXhpcyBhbGlnbmVkIGJvdW5kaW5nIGJveCB1c2VkIGZvciBkZXRlY3Rpb24gb2YgYSBsb2NhbHNwYWNlIGNvb3JkXHJcbiAgICAgICAgbDogICBhbmNob3JPZmZzZXRYXHJcbiAgICAgICAgdDogICBhbmNob3JPZmZzZXRZXHJcbiAgICAgICAgcjogICBhbmNob3JPZmZzZXRYICsgZHdcclxuICAgICAgICBiOiAgIGFuY2hvck9mZnNldFkgKyBkaFxyXG4gICAgICAgICMgY2FsbGJhY2sgdG8gY2FsbCBpZiB0aGUgem9uZSBpcyBjbGlja2VkIG9uXHJcbiAgICAgICAgY2I6ICBjYlxyXG4gICAgICBAem9uZXMucHVzaCB6b25lXHJcblxyXG4gIGNoZWNrWm9uZXM6ICh4LCB5KSAtPlxyXG4gICAgZm9yIHpvbmUgaW4gQHpvbmVzIGJ5IC0xXHJcbiAgICAgICMgbW92ZSBjb29yZCBpbnRvIHNwYWNlIHJlbGF0aXZlIHRvIHRoZSBxdWFkLCB0aGVuIHJvdGF0ZSBpdCB0byBtYXRjaFxyXG4gICAgICB1bnJvdGF0ZWRMb2NhbFggPSB4IC0gem9uZS5jeFxyXG4gICAgICB1bnJvdGF0ZWRMb2NhbFkgPSB5IC0gem9uZS5jeVxyXG4gICAgICBsb2NhbFggPSB1bnJvdGF0ZWRMb2NhbFggKiBNYXRoLmNvcyh6b25lLnJvdCkgLSB1bnJvdGF0ZWRMb2NhbFkgKiBNYXRoLnNpbih6b25lLnJvdClcclxuICAgICAgbG9jYWxZID0gdW5yb3RhdGVkTG9jYWxYICogTWF0aC5zaW4oem9uZS5yb3QpICsgdW5yb3RhdGVkTG9jYWxZICogTWF0aC5jb3Moem9uZS5yb3QpXHJcbiAgICAgIGlmIChsb2NhbFggPCB6b25lLmwpIG9yIChsb2NhbFggPiB6b25lLnIpIG9yIChsb2NhbFkgPCB6b25lLnQpIG9yIChsb2NhbFkgPiB6b25lLmIpXHJcbiAgICAgICAgIyBvdXRzaWRlIG9mIG9yaWVudGVkIGJvdW5kaW5nIGJveFxyXG4gICAgICAgIGNvbnRpbnVlXHJcbiAgICAgIHpvbmUuY2IoeCwgeSlcclxuICAgICAgcmV0dXJuIHRydWVcclxuICAgIHJldHVybiBmYWxzZVxyXG5cclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVcclxuIiwiQW5pbWF0aW9uID0gcmVxdWlyZSAnLi9BbmltYXRpb24nXHJcblxyXG5DQVJEX0lNQUdFX1cgPSAxMjBcclxuQ0FSRF9JTUFHRV9IID0gMTYyXHJcbkNBUkRfSU1BR0VfT0ZGX1ggPSA0XHJcbkNBUkRfSU1BR0VfT0ZGX1kgPSA0XHJcbkNBUkRfSU1BR0VfQURWX1ggPSBDQVJEX0lNQUdFX1dcclxuQ0FSRF9JTUFHRV9BRFZfWSA9IENBUkRfSU1BR0VfSFxyXG5DQVJEX1JFTkRFUl9TQ0FMRSA9IDAuMzUgICAgICAgICAgICAgICAgICAjIGNhcmQgaGVpZ2h0IGNvZWZmaWNpZW50IGZyb20gdGhlIHNjcmVlbidzIGhlaWdodFxyXG5DQVJEX0hBTkRfQ1VSVkVfRElTVF9GQUNUT1IgPSAzLjUgICAgICAgICAjIGZhY3RvciB3aXRoIHNjcmVlbiBoZWlnaHQgdG8gZmlndXJlIG91dCBjZW50ZXIgb2YgYXJjLiBiaWdnZXIgbnVtYmVyIGlzIGxlc3MgYXJjXHJcbkNBUkRfSE9MRElOR19ST1RfT1JERVIgPSBNYXRoLlBJIC8gMTIgICAgICMgZGVzaXJlZCByb3RhdGlvbiBvZiB0aGUgY2FyZCB3aGVuIGJlaW5nIGRyYWdnZWQgYXJvdW5kIGZvciBvcmRlcmluZydzIHNha2VcclxuQ0FSRF9IT0xESU5HX1JPVF9QTEFZID0gLTEgKiBNYXRoLlBJIC8gMTIgIyBkZXNpcmVkIHJvdGF0aW9uIG9mIHRoZSBjYXJkIHdoZW4gYmVpbmcgZHJhZ2dlZCBhcm91bmQgd2l0aCBpbnRlbnQgdG8gcGxheVxyXG5DQVJEX1BMQVlfQ0VJTElORyA9IDAuNjAgICAgICAgICAgICAgICAgICAjIGhvdyBtdWNoIG9mIHRoZSB0b3Agb2YgdGhlIHNjcmVlbiByZXByZXNlbnRzIFwiSSB3YW50IHRvIHBsYXkgdGhpc1wiIHZzIFwiSSB3YW50IHRvIHJlb3JkZXJcIlxyXG5cclxuTk9fQ0FSRCA9IC0xXHJcblxyXG5IaWdobGlnaHQgPVxyXG4gIE5PTkU6IC0xXHJcbiAgVU5TRUxFQ1RFRDogMFxyXG4gIFNFTEVDVEVEOiAxXHJcbiAgUElMRTogMlxyXG5cclxuIyB0YWtlbiBmcm9tIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTIxMTIxMi9ob3ctdG8tY2FsY3VsYXRlLWFuLWFuZ2xlLWZyb20tdGhyZWUtcG9pbnRzXHJcbiMgdXNlcyBsYXcgb2YgY29zaW5lcyB0byBmaWd1cmUgb3V0IHRoZSBoYW5kIGFyYyBhbmdsZVxyXG5maW5kQW5nbGUgPSAocDAsIHAxLCBwMikgLT5cclxuICAgIGEgPSBNYXRoLnBvdyhwMS54IC0gcDIueCwgMikgKyBNYXRoLnBvdyhwMS55IC0gcDIueSwgMilcclxuICAgIGIgPSBNYXRoLnBvdyhwMS54IC0gcDAueCwgMikgKyBNYXRoLnBvdyhwMS55IC0gcDAueSwgMilcclxuICAgIGMgPSBNYXRoLnBvdyhwMi54IC0gcDAueCwgMikgKyBNYXRoLnBvdyhwMi55IC0gcDAueSwgMilcclxuICAgIHJldHVybiBNYXRoLmFjb3MoIChhK2ItYykgLyBNYXRoLnNxcnQoNCphKmIpIClcclxuXHJcbmNhbGNEaXN0YW5jZSA9IChwMCwgcDEpIC0+XHJcbiAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyhwMS54IC0gcDAueCwgMikgKyBNYXRoLnBvdyhwMS55IC0gcDAueSwgMikpXHJcblxyXG5jYWxjRGlzdGFuY2VTcXVhcmVkID0gKHgwLCB5MCwgeDEsIHkxKSAtPlxyXG4gIHJldHVybiBNYXRoLnBvdyh4MSAtIHgwLCAyKSArIE1hdGgucG93KHkxIC0geTAsIDIpXHJcblxyXG5jbGFzcyBIYW5kXHJcbiAgQENBUkRfSU1BR0VfVzogQ0FSRF9JTUFHRV9XXHJcbiAgQENBUkRfSU1BR0VfSDogQ0FSRF9JTUFHRV9IXHJcbiAgQENBUkRfSU1BR0VfT0ZGX1g6IENBUkRfSU1BR0VfT0ZGX1hcclxuICBAQ0FSRF9JTUFHRV9PRkZfWTogQ0FSRF9JTUFHRV9PRkZfWVxyXG4gIEBDQVJEX0lNQUdFX0FEVl9YOiBDQVJEX0lNQUdFX0FEVl9YXHJcbiAgQENBUkRfSU1BR0VfQURWX1k6IENBUkRfSU1BR0VfQURWX1lcclxuICBAQ0FSRF9SRU5ERVJfU0NBTEU6IENBUkRfUkVOREVSX1NDQUxFXHJcbiAgQEhpZ2hsaWdodDogSGlnaGxpZ2h0XHJcblxyXG4gIGNvbnN0cnVjdG9yOiAoQGdhbWUpIC0+XHJcbiAgICBAY2FyZHMgPSBbXVxyXG4gICAgQGFuaW1zID0ge31cclxuICAgIEBwb3NpdGlvbkNhY2hlID0ge31cclxuXHJcbiAgICBAcGlja2luZyA9IHRydWVcclxuICAgIEBwaWNrZWQgPSBbXVxyXG4gICAgQHBpY2tQYWludCA9IGZhbHNlXHJcblxyXG4gICAgQGRyYWdJbmRleFN0YXJ0ID0gTk9fQ0FSRFxyXG4gICAgQGRyYWdJbmRleEN1cnJlbnQgPSBOT19DQVJEXHJcbiAgICBAZHJhZ1ggPSAwXHJcbiAgICBAZHJhZ1kgPSAwXHJcblxyXG4gICAgIyByZW5kZXIgLyBhbmltIG1ldHJpY3NcclxuICAgIEBjYXJkU3BlZWQgPVxyXG4gICAgICByOiBNYXRoLlBJICogMlxyXG4gICAgICBzOiAyLjVcclxuICAgICAgdDogMiAqIEBnYW1lLndpZHRoXHJcbiAgICBAcGxheUNlaWxpbmcgPSBDQVJEX1BMQVlfQ0VJTElORyAqIEBnYW1lLmhlaWdodFxyXG4gICAgQGNhcmRIZWlnaHQgPSBNYXRoLmZsb29yKEBnYW1lLmhlaWdodCAqIENBUkRfUkVOREVSX1NDQUxFKVxyXG4gICAgQGNhcmRXaWR0aCAgPSBNYXRoLmZsb29yKEBjYXJkSGVpZ2h0ICogQ0FSRF9JTUFHRV9XIC8gQ0FSRF9JTUFHRV9IKVxyXG4gICAgQGNhcmRIYWxmSGVpZ2h0ID0gQGNhcmRIZWlnaHQgPj4gMVxyXG4gICAgQGNhcmRIYWxmV2lkdGggID0gQGNhcmRXaWR0aCA+PiAxXHJcbiAgICBhcmNNYXJnaW4gPSBAY2FyZFdpZHRoIC8gMlxyXG4gICAgYXJjVmVydGljYWxCaWFzID0gQGNhcmRIZWlnaHQgLyA1MFxyXG4gICAgYm90dG9tTGVmdCAgPSB7IHg6IGFyY01hcmdpbiwgICAgICAgICAgICAgICAgeTogYXJjVmVydGljYWxCaWFzICsgQGdhbWUuaGVpZ2h0IH1cclxuICAgIGJvdHRvbVJpZ2h0ID0geyB4OiBAZ2FtZS53aWR0aCAtIGFyY01hcmdpbiwgeTogYXJjVmVydGljYWxCaWFzICsgQGdhbWUuaGVpZ2h0IH1cclxuICAgIEBoYW5kQ2VudGVyID0geyB4OiBAZ2FtZS53aWR0aCAvIDIsICAgICAgICAgeTogYXJjVmVydGljYWxCaWFzICsgQGdhbWUuaGVpZ2h0ICsgKENBUkRfSEFORF9DVVJWRV9ESVNUX0ZBQ1RPUiAqIEBnYW1lLmhlaWdodCkgfVxyXG4gICAgQGhhbmRBbmdsZSA9IGZpbmRBbmdsZShib3R0b21MZWZ0LCBAaGFuZENlbnRlciwgYm90dG9tUmlnaHQpXHJcbiAgICBAaGFuZERpc3RhbmNlID0gY2FsY0Rpc3RhbmNlKGJvdHRvbUxlZnQsIEBoYW5kQ2VudGVyKVxyXG4gICAgQGhhbmRBbmdsZUFkdmFuY2VNYXggPSBAaGFuZEFuZ2xlIC8gNyAjIG5ldmVyIHNwYWNlIHRoZSBjYXJkcyBtb3JlIHRoYW4gd2hhdCB0aGV5J2QgbG9vayBsaWtlIHdpdGggdGhpcyBoYW5kc2l6ZVxyXG4gICAgQGdhbWUubG9nIFwiSGFuZCBkaXN0YW5jZSAje0BoYW5kRGlzdGFuY2V9LCBhbmdsZSAje0BoYW5kQW5nbGV9IChzY3JlZW4gaGVpZ2h0ICN7QGdhbWUuaGVpZ2h0fSlcIlxyXG5cclxuICB0b2dnbGVQaWNraW5nOiAtPlxyXG4gICAgQHBpY2tpbmcgPSAhQHBpY2tpbmdcclxuICAgIGlmIEBwaWNraW5nXHJcbiAgICAgIEBzZWxlY3ROb25lKClcclxuXHJcbiAgc2VsZWN0Tm9uZTogLT5cclxuICAgIEBwaWNrZWQgPSBuZXcgQXJyYXkoQGNhcmRzLmxlbmd0aCkuZmlsbChmYWxzZSlcclxuICAgIHJldHVyblxyXG5cclxuICBzZXQ6IChjYXJkcykgLT5cclxuICAgIEBjYXJkcyA9IGNhcmRzLnNsaWNlKDApXHJcbiAgICBpZiBAcGlja2luZ1xyXG4gICAgICBAc2VsZWN0Tm9uZSgpXHJcbiAgICBAc3luY0FuaW1zKClcclxuICAgIEB3YXJwKClcclxuXHJcbiAgc3luY0FuaW1zOiAtPlxyXG4gICAgc2VlbiA9IHt9XHJcbiAgICBmb3IgY2FyZCBpbiBAY2FyZHNcclxuICAgICAgc2VlbltjYXJkXSsrXHJcbiAgICAgIGlmIG5vdCBAYW5pbXNbY2FyZF1cclxuICAgICAgICBAYW5pbXNbY2FyZF0gPSBuZXcgQW5pbWF0aW9uIHtcclxuICAgICAgICAgIHNwZWVkOiBAY2FyZFNwZWVkXHJcbiAgICAgICAgICB4OiAwXHJcbiAgICAgICAgICB5OiAwXHJcbiAgICAgICAgICByOiAwXHJcbiAgICAgICAgfVxyXG4gICAgdG9SZW1vdmUgPSBbXVxyXG4gICAgZm9yIGNhcmQsYW5pbSBvZiBAYW5pbXNcclxuICAgICAgaWYgbm90IHNlZW4uaGFzT3duUHJvcGVydHkoY2FyZClcclxuICAgICAgICB0b1JlbW92ZS5wdXNoIGNhcmRcclxuICAgIGZvciBjYXJkIGluIHRvUmVtb3ZlXHJcbiAgICAgICMgQGdhbWUubG9nIFwicmVtb3ZpbmcgYW5pbSBmb3IgI3tjYXJkfVwiXHJcbiAgICAgIGRlbGV0ZSBAYW5pbXNbY2FyZF1cclxuXHJcbiAgICBAdXBkYXRlUG9zaXRpb25zKClcclxuXHJcbiAgY2FsY0RyYXduSGFuZDogLT5cclxuICAgIGRyYXduSGFuZCA9IFtdXHJcbiAgICBmb3IgY2FyZCxpIGluIEBjYXJkc1xyXG4gICAgICBpZiBpICE9IEBkcmFnSW5kZXhTdGFydFxyXG4gICAgICAgIGRyYXduSGFuZC5wdXNoIGNhcmRcclxuXHJcbiAgICBpZiBAZHJhZ0luZGV4Q3VycmVudCAhPSBOT19DQVJEXHJcbiAgICAgIGRyYXduSGFuZC5zcGxpY2UgQGRyYWdJbmRleEN1cnJlbnQsIDAsIEBjYXJkc1tAZHJhZ0luZGV4U3RhcnRdXHJcbiAgICByZXR1cm4gZHJhd25IYW5kXHJcblxyXG4gIHdhbnRzVG9QbGF5RHJhZ2dlZENhcmQ6IC0+XHJcbiAgICByZXR1cm4gZmFsc2UgaWYgQGRyYWdJbmRleFN0YXJ0ID09IE5PX0NBUkRcclxuICAgIHJldHVybiBAZHJhZ1kgPCBAcGxheUNlaWxpbmdcclxuXHJcbiAgdXBkYXRlUG9zaXRpb25zOiAtPlxyXG4gICAgZHJhd25IYW5kID0gQGNhbGNEcmF3bkhhbmQoKVxyXG4gICAgd2FudHNUb1BsYXkgPSBAd2FudHNUb1BsYXlEcmFnZ2VkQ2FyZCgpXHJcbiAgICBkZXNpcmVkUm90YXRpb24gPSBDQVJEX0hPTERJTkdfUk9UX09SREVSXHJcbiAgICBwb3NpdGlvbkNvdW50ID0gZHJhd25IYW5kLmxlbmd0aFxyXG4gICAgaWYgd2FudHNUb1BsYXlcclxuICAgICAgZGVzaXJlZFJvdGF0aW9uID0gQ0FSRF9IT0xESU5HX1JPVF9QTEFZXHJcbiAgICAgIHBvc2l0aW9uQ291bnQtLVxyXG4gICAgcG9zaXRpb25zID0gQGNhbGNQb3NpdGlvbnMocG9zaXRpb25Db3VudClcclxuICAgIGRyYXdJbmRleCA9IDBcclxuICAgIGZvciBjYXJkLGkgaW4gZHJhd25IYW5kXHJcbiAgICAgIGFuaW0gPSBAYW5pbXNbY2FyZF1cclxuICAgICAgaWYgaSA9PSBAZHJhZ0luZGV4Q3VycmVudFxyXG4gICAgICAgIGFuaW0ucmVxLnggPSBAZHJhZ1hcclxuICAgICAgICBhbmltLnJlcS55ID0gQGRyYWdZXHJcbiAgICAgICAgYW5pbS5yZXEuciA9IGRlc2lyZWRSb3RhdGlvblxyXG4gICAgICAgIGlmIG5vdCB3YW50c1RvUGxheVxyXG4gICAgICAgICAgZHJhd0luZGV4KytcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHBvcyA9IHBvc2l0aW9uc1tkcmF3SW5kZXhdXHJcbiAgICAgICAgYW5pbS5yZXEueCA9IHBvcy54XHJcbiAgICAgICAgYW5pbS5yZXEueSA9IHBvcy55XHJcbiAgICAgICAgYW5pbS5yZXEuciA9IHBvcy5yXHJcbiAgICAgICAgZHJhd0luZGV4KytcclxuXHJcbiAgIyBpbW1lZGlhdGVseSB3YXJwIGFsbCBjYXJkcyB0byB3aGVyZSB0aGV5IHNob3VsZCBiZVxyXG4gIHdhcnA6IC0+XHJcbiAgICBmb3IgY2FyZCxhbmltIG9mIEBhbmltc1xyXG4gICAgICBhbmltLndhcnAoKVxyXG5cclxuICAjIHJlb3JkZXIgdGhlIGhhbmQgYmFzZWQgb24gdGhlIGRyYWcgbG9jYXRpb24gb2YgdGhlIGhlbGQgY2FyZFxyXG4gIHJlb3JkZXI6IC0+XHJcbiAgICByZXR1cm4gaWYgQGRyYWdJbmRleFN0YXJ0ID09IE5PX0NBUkRcclxuICAgIHJldHVybiBpZiBAY2FyZHMubGVuZ3RoIDwgMiAjIG5vdGhpbmcgdG8gcmVvcmRlclxyXG4gICAgcG9zaXRpb25zID0gQGNhbGNQb3NpdGlvbnMoQGNhcmRzLmxlbmd0aClcclxuICAgIGNsb3Nlc3RJbmRleCA9IDBcclxuICAgIGNsb3Nlc3REaXN0ID0gQGdhbWUud2lkdGggKiBAZ2FtZS5oZWlnaHQgIyBzb21ldGhpbmcgaW1wb3NzaWJseSBsYXJnZVxyXG4gICAgZm9yIHBvcywgaW5kZXggaW4gcG9zaXRpb25zXHJcbiAgICAgIGRpc3QgPSBjYWxjRGlzdGFuY2VTcXVhcmVkKHBvcy54LCBwb3MueSwgQGRyYWdYLCBAZHJhZ1kpXHJcbiAgICAgIGlmIGNsb3Nlc3REaXN0ID4gZGlzdFxyXG4gICAgICAgIGNsb3Nlc3REaXN0ID0gZGlzdFxyXG4gICAgICAgIGNsb3Nlc3RJbmRleCA9IGluZGV4XHJcbiAgICBAZHJhZ0luZGV4Q3VycmVudCA9IGNsb3Nlc3RJbmRleFxyXG5cclxuICBzZWxlY3RlZENhcmRzOiAtPlxyXG4gICAgaWYgbm90IEBwaWNraW5nXHJcbiAgICAgIHJldHVybiBbXVxyXG5cclxuICAgIGNhcmRzID0gW11cclxuICAgIGZvciBjYXJkLCBpIGluIEBjYXJkc1xyXG4gICAgICBpZiBAcGlja2VkW2ldXHJcbiAgICAgICAgYW5pbSA9IEBhbmltc1tjYXJkXVxyXG4gICAgICAgIGNhcmRzLnB1c2gge1xyXG4gICAgICAgICAgY2FyZDogY2FyZFxyXG4gICAgICAgICAgeDogYW5pbS5jdXIueFxyXG4gICAgICAgICAgeTogYW5pbS5jdXIueVxyXG4gICAgICAgICAgcjogYW5pbS5jdXIuclxyXG4gICAgICAgICAgaW5kZXg6IGlcclxuICAgICAgICB9XHJcbiAgICByZXR1cm4gY2FyZHNcclxuXHJcbiAgZG93bjogKEBkcmFnWCwgQGRyYWdZLCBpbmRleCkgLT5cclxuICAgIEB1cChAZHJhZ1gsIEBkcmFnWSkgIyBlbnN1cmUgd2UgbGV0IGdvIG9mIHRoZSBwcmV2aW91cyBjYXJkIGluIGNhc2UgdGhlIGV2ZW50cyBhcmUgZHVtYlxyXG4gICAgaWYgQHBpY2tpbmdcclxuICAgICAgQHBpY2tlZFtpbmRleF0gPSAhQHBpY2tlZFtpbmRleF1cclxuICAgICAgQHBpY2tQYWludCA9IEBwaWNrZWRbaW5kZXhdXHJcbiAgICAgIHJldHVyblxyXG4gICAgQGdhbWUubG9nIFwicGlja2luZyB1cCBjYXJkIGluZGV4ICN7aW5kZXh9XCJcclxuICAgIEBkcmFnSW5kZXhTdGFydCA9IGluZGV4XHJcbiAgICBAZHJhZ0luZGV4Q3VycmVudCA9IGluZGV4XHJcbiAgICBAdXBkYXRlUG9zaXRpb25zKClcclxuXHJcbiAgbW92ZTogKEBkcmFnWCwgQGRyYWdZKSAtPlxyXG4gICAgcmV0dXJuIGlmIEBkcmFnSW5kZXhTdGFydCA9PSBOT19DQVJEXHJcbiAgICAjQGdhbWUubG9nIFwiZHJhZ2dpbmcgYXJvdW5kIGNhcmQgaW5kZXggI3tAZHJhZ0luZGV4Q3VycmVudH1cIlxyXG4gICAgQHJlb3JkZXIoKVxyXG4gICAgQHVwZGF0ZVBvc2l0aW9ucygpXHJcblxyXG4gIHVwOiAoQGRyYWdYLCBAZHJhZ1kpIC0+XHJcbiAgICByZXR1cm4gaWYgQGRyYWdJbmRleFN0YXJ0ID09IE5PX0NBUkRcclxuICAgIEByZW9yZGVyKClcclxuICAgIGlmIEB3YW50c1RvUGxheURyYWdnZWRDYXJkKClcclxuICAgICAgQGdhbWUubG9nIFwidHJ5aW5nIHRvIHBsYXkgYSAje0BjYXJkc1tAZHJhZ0luZGV4U3RhcnRdfSBmcm9tIGluZGV4ICN7QGRyYWdJbmRleFN0YXJ0fVwiXHJcbiAgICAgIGNhcmRJbmRleCA9IEBkcmFnSW5kZXhTdGFydFxyXG4gICAgICBjYXJkID0gQGNhcmRzW2NhcmRJbmRleF1cclxuICAgICAgYW5pbSA9IEBhbmltc1tjYXJkXVxyXG4gICAgICBAZHJhZ0luZGV4U3RhcnQgPSBOT19DQVJEXHJcbiAgICAgIEBkcmFnSW5kZXhDdXJyZW50ID0gTk9fQ0FSRFxyXG4gICAgICBAZ2FtZS5wbGF5IFt7XHJcbiAgICAgICAgY2FyZDogY2FyZFxyXG4gICAgICAgIHg6IGFuaW0uY3VyLnhcclxuICAgICAgICB5OiBhbmltLmN1ci55XHJcbiAgICAgICAgcjogYW5pbS5jdXIuclxyXG4gICAgICAgIGluZGV4OiBjYXJkSW5kZXhcclxuICAgICAgfV1cclxuICAgIGVsc2VcclxuICAgICAgQGdhbWUubG9nIFwidHJ5aW5nIHRvIHJlb3JkZXIgI3tAY2FyZHNbQGRyYWdJbmRleFN0YXJ0XX0gaW50byBpbmRleCAje0BkcmFnSW5kZXhDdXJyZW50fVwiXHJcbiAgICAgIEBjYXJkcyA9IEBjYWxjRHJhd25IYW5kKCkgIyBpcyB0aGlzIHJpZ2h0P1xyXG5cclxuICAgIEBkcmFnSW5kZXhTdGFydCA9IE5PX0NBUkRcclxuICAgIEBkcmFnSW5kZXhDdXJyZW50ID0gTk9fQ0FSRFxyXG4gICAgQHVwZGF0ZVBvc2l0aW9ucygpXHJcblxyXG4gIHVwZGF0ZTogKGR0KSAtPlxyXG4gICAgdXBkYXRlZCA9IGZhbHNlXHJcbiAgICBmb3IgY2FyZCxhbmltIG9mIEBhbmltc1xyXG4gICAgICBpZiBhbmltLnVwZGF0ZShkdClcclxuICAgICAgICB1cGRhdGVkID0gdHJ1ZVxyXG4gICAgcmV0dXJuIHVwZGF0ZWRcclxuXHJcbiAgcmVuZGVyOiAtPlxyXG4gICAgcmV0dXJuIGlmIEBjYXJkcy5sZW5ndGggPT0gMFxyXG4gICAgZHJhd25IYW5kID0gQGNhbGNEcmF3bkhhbmQoKVxyXG4gICAgZm9yIHYsIGluZGV4IGluIGRyYXduSGFuZFxyXG4gICAgICBjb250aW51ZSBpZiB2ID09IE5PX0NBUkRcclxuICAgICAgYW5pbSA9IEBhbmltc1t2XVxyXG4gICAgICBkbyAoYW5pbSwgaW5kZXgpID0+XHJcbiAgICAgICAgaWYgQHBpY2tpbmdcclxuICAgICAgICAgIGlmIEBwaWNrZWRbaW5kZXhdXHJcbiAgICAgICAgICAgIGhpZ2hsaWdodFN0YXRlID0gSGlnaGxpZ2h0LlNFTEVDVEVEXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIGhpZ2hsaWdodFN0YXRlID0gSGlnaGxpZ2h0LlVOU0VMRUNURURcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBpZiBAd2FudHNUb1BsYXlEcmFnZ2VkQ2FyZCgpXHJcbiAgICAgICAgICAgIGlmIChpbmRleCA9PSBAZHJhZ0luZGV4Q3VycmVudClcclxuICAgICAgICAgICAgICBoaWdobGlnaHRTdGF0ZSA9IEhpZ2hsaWdodC5TRUxFQ1RFRFxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgaGlnaGxpZ2h0U3RhdGUgPSBIaWdobGlnaHQuVU5TRUxFQ1RFRFxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBoaWdobGlnaHRTdGF0ZSA9IEhpZ2hsaWdodC5OT05FXHJcbiAgICAgICAgQHJlbmRlckNhcmQgdiwgYW5pbS5jdXIueCwgYW5pbS5jdXIueSwgYW5pbS5jdXIuciwgMSwgaGlnaGxpZ2h0U3RhdGUsIChjbGlja1gsIGNsaWNrWSkgPT5cclxuICAgICAgICAgIEBkb3duKGNsaWNrWCwgY2xpY2tZLCBpbmRleClcclxuXHJcbiAgcmVuZGVyQ2FyZDogKHYsIHgsIHksIHJvdCwgc2NhbGUsIHNlbGVjdGVkLCBjYikgLT5cclxuICAgIHJvdCA9IDAgaWYgbm90IHJvdFxyXG4gICAgcmFuayA9IE1hdGguZmxvb3IodiAvIDQpXHJcbiAgICBzdWl0ID0gTWF0aC5mbG9vcih2ICUgNClcclxuXHJcbiAgICBjb2wgPSBzd2l0Y2ggc2VsZWN0ZWRcclxuICAgICAgd2hlbiBIaWdobGlnaHQuTk9ORVxyXG4gICAgICAgIFsxLCAxLCAxXVxyXG4gICAgICB3aGVuIEhpZ2hsaWdodC5VTlNFTEVDVEVEXHJcbiAgICAgICAgIyBbMC4zLCAwLjMsIDAuM11cclxuICAgICAgICBbMSwgMSwgMV1cclxuICAgICAgd2hlbiBIaWdobGlnaHQuU0VMRUNURURcclxuICAgICAgICBbMC41LCAwLjUsIDAuOV1cclxuICAgICAgd2hlbiBIaWdobGlnaHQuUElMRVxyXG4gICAgICAgIFswLjYsIDAuNiwgMC42XVxyXG5cclxuICAgIEBnYW1lLmRyYXdJbWFnZSBcImNhcmRzXCIsXHJcbiAgICBDQVJEX0lNQUdFX09GRl9YICsgKENBUkRfSU1BR0VfQURWX1ggKiByYW5rKSwgQ0FSRF9JTUFHRV9PRkZfWSArIChDQVJEX0lNQUdFX0FEVl9ZICogc3VpdCksIENBUkRfSU1BR0VfVywgQ0FSRF9JTUFHRV9ILFxyXG4gICAgeCwgeSwgQGNhcmRXaWR0aCAqIHNjYWxlLCBAY2FyZEhlaWdodCAqIHNjYWxlLFxyXG4gICAgcm90LCAwLjUsIDAuNSwgY29sWzBdLGNvbFsxXSxjb2xbMl0sMSwgY2JcclxuXHJcbiAgY2FsY1Bvc2l0aW9uczogKGhhbmRTaXplKSAtPlxyXG4gICAgaWYgQHBvc2l0aW9uQ2FjaGUuaGFzT3duUHJvcGVydHkoaGFuZFNpemUpXHJcbiAgICAgIHJldHVybiBAcG9zaXRpb25DYWNoZVtoYW5kU2l6ZV1cclxuICAgIHJldHVybiBbXSBpZiBoYW5kU2l6ZSA9PSAwXHJcblxyXG4gICAgYWR2YW5jZSA9IEBoYW5kQW5nbGUgLyBoYW5kU2l6ZVxyXG4gICAgaWYgYWR2YW5jZSA+IEBoYW5kQW5nbGVBZHZhbmNlTWF4XHJcbiAgICAgIGFkdmFuY2UgPSBAaGFuZEFuZ2xlQWR2YW5jZU1heFxyXG4gICAgYW5nbGVTcHJlYWQgPSBhZHZhbmNlICogaGFuZFNpemUgICAgICAgICAgICAgICAgIyBob3cgbXVjaCBvZiB0aGUgYW5nbGUgd2UgcGxhbiBvbiB1c2luZ1xyXG4gICAgYW5nbGVMZWZ0b3ZlciA9IEBoYW5kQW5nbGUgLSBhbmdsZVNwcmVhZCAgICAgICAgIyBhbW91bnQgb2YgYW5nbGUgd2UncmUgbm90IHVzaW5nLCBhbmQgbmVlZCB0byBwYWQgc2lkZXMgd2l0aCBldmVubHlcclxuICAgIGN1cnJlbnRBbmdsZSA9IC0xICogKEBoYW5kQW5nbGUgLyAyKSAgICAgICAgICAgICMgbW92ZSB0byB0aGUgbGVmdCBzaWRlIG9mIG91ciBhbmdsZVxyXG4gICAgY3VycmVudEFuZ2xlICs9IGFuZ2xlTGVmdG92ZXIgLyAyICAgICAgICAgICAgICAgIyAuLi4gYW5kIGFkdmFuY2UgcGFzdCBoYWxmIG9mIHRoZSBwYWRkaW5nXHJcbiAgICBjdXJyZW50QW5nbGUgKz0gYWR2YW5jZSAvIDIgICAgICAgICAgICAgICAgICAgICAjIC4uLiBhbmQgY2VudGVyIHRoZSBjYXJkcyBpbiB0aGUgYW5nbGVcclxuXHJcbiAgICBwb3NpdGlvbnMgPSBbXVxyXG4gICAgZm9yIGkgaW4gWzAuLi5oYW5kU2l6ZV1cclxuICAgICAgeCA9IEBoYW5kQ2VudGVyLnggLSBNYXRoLmNvcygoTWF0aC5QSSAvIDIpICsgY3VycmVudEFuZ2xlKSAqIEBoYW5kRGlzdGFuY2VcclxuICAgICAgeSA9IEBoYW5kQ2VudGVyLnkgLSBNYXRoLnNpbigoTWF0aC5QSSAvIDIpICsgY3VycmVudEFuZ2xlKSAqIEBoYW5kRGlzdGFuY2VcclxuICAgICAgY3VycmVudEFuZ2xlICs9IGFkdmFuY2VcclxuICAgICAgcG9zaXRpb25zLnB1c2gge1xyXG4gICAgICAgIHg6IHhcclxuICAgICAgICB5OiB5XHJcbiAgICAgICAgcjogY3VycmVudEFuZ2xlIC0gYWR2YW5jZVxyXG4gICAgICB9XHJcblxyXG4gICAgQHBvc2l0aW9uQ2FjaGVbaGFuZFNpemVdID0gcG9zaXRpb25zXHJcbiAgICByZXR1cm4gcG9zaXRpb25zXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRcclxuIiwiQnV0dG9uID0gcmVxdWlyZSAnLi9CdXR0b24nXHJcblxyXG5jbGFzcyBNZW51XHJcbiAgY29uc3RydWN0b3I6IChAZ2FtZSwgQHRpdGxlLCBAYmFja2dyb3VuZCwgQGNvbG9yLCBAYWN0aW9ucykgLT5cclxuICAgIEBidXR0b25zID0gW11cclxuICAgIEBidXR0b25OYW1lcyA9IFtcImJ1dHRvbjBcIiwgXCJidXR0b24xXCJdXHJcblxyXG4gICAgYnV0dG9uU2l6ZSA9IEBnYW1lLmhlaWdodCAvIDE1XHJcbiAgICBAYnV0dG9uU3RhcnRZID0gQGdhbWUuaGVpZ2h0IC8gNVxyXG5cclxuICAgIHNsaWNlID0gKEBnYW1lLmhlaWdodCAtIEBidXR0b25TdGFydFkpIC8gKEBhY3Rpb25zLmxlbmd0aCArIDEpXHJcbiAgICBjdXJyWSA9IEBidXR0b25TdGFydFkgKyBzbGljZVxyXG4gICAgZm9yIGFjdGlvbiBpbiBAYWN0aW9uc1xyXG4gICAgICBidXR0b24gPSBuZXcgQnV0dG9uKEBnYW1lLCBAYnV0dG9uTmFtZXMsIEBnYW1lLmZvbnQsIGJ1dHRvblNpemUsIEBnYW1lLmNlbnRlci54LCBjdXJyWSwgYWN0aW9uKVxyXG4gICAgICBAYnV0dG9ucy5wdXNoIGJ1dHRvblxyXG4gICAgICBjdXJyWSArPSBzbGljZVxyXG5cclxuICB1cGRhdGU6IChkdCkgLT5cclxuICAgIHVwZGF0ZWQgPSBmYWxzZVxyXG4gICAgZm9yIGJ1dHRvbiBpbiBAYnV0dG9uc1xyXG4gICAgICBpZiBidXR0b24udXBkYXRlKGR0KVxyXG4gICAgICAgIHVwZGF0ZWQgPSB0cnVlXHJcbiAgICByZXR1cm4gdXBkYXRlZFxyXG5cclxuICByZW5kZXI6IC0+XHJcbiAgICBAZ2FtZS5zcHJpdGVSZW5kZXJlci5yZW5kZXIgQGJhY2tncm91bmQsIDAsIDAsIEBnYW1lLndpZHRoLCBAZ2FtZS5oZWlnaHQsIDAsIDAsIDAsIEBjb2xvclxyXG4gICAgQGdhbWUuZm9udFJlbmRlcmVyLnJlbmRlciBAZ2FtZS5mb250LCBAZ2FtZS5oZWlnaHQgLyAyNSwgXCJCdWlsZDogI3tAZ2FtZS52ZXJzaW9ufVwiLCAwLCBAZ2FtZS5oZWlnaHQsIDAsIDEsIEBnYW1lLmNvbG9ycy5saWdodGdyYXlcclxuICAgIHRpdGxlSGVpZ2h0ID0gQGdhbWUuaGVpZ2h0IC8gOFxyXG4gICAgdGl0bGVPZmZzZXQgPSBAYnV0dG9uU3RhcnRZID4+IDFcclxuICAgIEBnYW1lLmZvbnRSZW5kZXJlci5yZW5kZXIgQGdhbWUuZm9udCwgdGl0bGVIZWlnaHQsIEB0aXRsZSwgQGdhbWUuY2VudGVyLngsIHRpdGxlT2Zmc2V0LCAwLjUsIDAuNSwgQGdhbWUuY29sb3JzLndoaXRlXHJcbiAgICBmb3IgYnV0dG9uIGluIEBidXR0b25zXHJcbiAgICAgIGJ1dHRvbi5yZW5kZXIoKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNZW51XHJcbiIsIkFuaW1hdGlvbiA9IHJlcXVpcmUgJy4vQW5pbWF0aW9uJ1xyXG5IYW5kID0gcmVxdWlyZSAnLi9IYW5kJ1xyXG5cclxuU0VUVExFX01TID0gMTAwMFxyXG5cclxuY2xhc3MgUGlsZVxyXG4gIGNvbnN0cnVjdG9yOiAoQGdhbWUsIEBoYW5kKSAtPlxyXG4gICAgQHBsYXlJRCA9IC0xXHJcbiAgICBAcGxheXMgPSBbXVxyXG4gICAgQGFuaW1zID0ge31cclxuICAgIEBzZXR0bGVUaW1lciA9IDBcclxuICAgIEB0aHJvd25Db2xvciA9IHsgcjogMSwgZzogMSwgYjogMCwgYTogMX1cclxuICAgIEBzY2FsZSA9IDAuNlxyXG5cclxuICAgICMgMS4wIGlzIG5vdCBtZXNzeSBhdCBhbGwsIGFzIHlvdSBhcHByb2FjaCAwIGl0IHN0YXJ0cyB0byBhbGwgcGlsZSBvbiBvbmUgYW5vdGhlclxyXG4gICAgbWVzc3kgPSAwLjJcclxuXHJcbiAgICBAcGxheUNhcmRTcGFjaW5nID0gMC4xXHJcblxyXG4gICAgY2VudGVyWCA9IEBnYW1lLmNlbnRlci54XHJcbiAgICBjZW50ZXJZID0gQGdhbWUuY2VudGVyLnlcclxuICAgIG9mZnNldFggPSBAaGFuZC5jYXJkV2lkdGggKiBtZXNzeSAqIEBzY2FsZVxyXG4gICAgb2Zmc2V0WSA9IEBoYW5kLmNhcmRIYWxmSGVpZ2h0ICogbWVzc3kgKiBAc2NhbGVcclxuICAgIEBwbGF5TG9jYXRpb25zID0gW1xyXG4gICAgICB7IHg6IGNlbnRlclgsIHk6IGNlbnRlclkgKyBvZmZzZXRZIH0gIyBib3R0b21cclxuICAgICAgeyB4OiBjZW50ZXJYIC0gb2Zmc2V0WCwgeTogY2VudGVyWSB9ICMgbGVmdFxyXG4gICAgICB7IHg6IGNlbnRlclgsIHk6IGNlbnRlclkgLSBvZmZzZXRZIH0gIyB0b3BcclxuICAgICAgeyB4OiBjZW50ZXJYICsgb2Zmc2V0WCwgeTogY2VudGVyWSB9ICMgcmlnaHRcclxuICAgIF1cclxuICAgIEB0aHJvd0xvY2F0aW9ucyA9IFtcclxuICAgICAgeyB4OiBjZW50ZXJYLCB5OiBAZ2FtZS5oZWlnaHQgfSAjIGJvdHRvbVxyXG4gICAgICB7IHg6IDAsIHk6IGNlbnRlclkgKyBvZmZzZXRZIH0gIyBsZWZ0XHJcbiAgICAgIHsgeDogY2VudGVyWCwgeTogMCB9ICMgdG9wXHJcbiAgICAgIHsgeDogQGdhbWUud2lkdGgsIHk6IGNlbnRlclkgKyBvZmZzZXRZIH0gIyByaWdodFxyXG4gICAgXVxyXG5cclxuICBzZXQ6IChwaWxlSUQsIHBpbGUsIHBpbGVXaG8pIC0+XHJcbiAgICBpZiBAcGxheUlEICE9IHBpbGVJRFxyXG4gICAgICBAcGxheUlEID0gcGlsZUlEXHJcbiAgICAgIEBwbGF5cy5wdXNoIHtcclxuICAgICAgICBjYXJkczogcGlsZS5zbGljZSgwKVxyXG4gICAgICAgIHdobzogcGlsZVdob1xyXG4gICAgICB9XHJcbiAgICAgIEBzZXR0bGVUaW1lciA9IFNFVFRMRV9NU1xyXG5cclxuICAgICMgaWYgKEBwbGF5SUQgIT0gcGlsZUlEKSBhbmQgKHRocm93bi5sZW5ndGggPiAwKVxyXG4gICAgIyAgIEBwbGF5cyA9IHRocm93bi5zbGljZSgwKSAjIHRoZSBwaWxlIGhhcyBiZWNvbWUgdGhlIHRocm93biwgc3Rhc2ggaXQgb2ZmIG9uZSBsYXN0IHRpbWVcclxuICAgICMgICBAcGxheVdobyA9IHRocm93bldoby5zbGljZSgwKVxyXG4gICAgIyAgIEBwbGF5SUQgPSBwaWxlSURcclxuICAgICMgICBAc2V0dGxlVGltZXIgPSBTRVRUTEVfTVNcclxuXHJcbiAgICAjICMgZG9uJ3Qgc3RvbXAgdGhlIHBpbGUgd2UncmUgZHJhd2luZyB1bnRpbCBpdCBpcyBkb25lIHNldHRsaW5nIGFuZCBjYW4gZmx5IG9mZiB0aGUgc2NyZWVuXHJcbiAgICAjIGlmIEBzZXR0bGVUaW1lciA9PSAwXHJcbiAgICAjICAgQHBsYXlzID0gcGlsZS5zbGljZSgwKVxyXG4gICAgIyAgIEBwbGF5V2hvID0gcGlsZVdoby5zbGljZSgwKVxyXG4gICAgIyAgIEB0aHJvd24gPSB0aHJvd24uc2xpY2UoMClcclxuICAgICMgICBAdGhyb3duV2hvID0gdGhyb3duV2hvLnNsaWNlKDApXHJcbiAgICAjICAgQHRocm93blRha2VyID0gdGhyb3duVGFrZXJcclxuXHJcbiAgICBAc3luY0FuaW1zKClcclxuXHJcbiAgaGludDogKGNhcmRzKSAtPlxyXG4gICAgZm9yIGNhcmQgaW4gY2FyZHNcclxuICAgICAgQGFuaW1zW2NhcmQuY2FyZF0gPSBuZXcgQW5pbWF0aW9uIHtcclxuICAgICAgICBzcGVlZDogQGhhbmQuY2FyZFNwZWVkXHJcbiAgICAgICAgeDogY2FyZC54XHJcbiAgICAgICAgeTogY2FyZC55XHJcbiAgICAgICAgcjogY2FyZC5yXHJcbiAgICAgICAgczogMVxyXG4gICAgICB9XHJcblxyXG4gIHN5bmNBbmltczogLT5cclxuICAgIHNlZW4gPSB7fVxyXG4gICAgbG9jYXRpb25zID0gQHRocm93TG9jYXRpb25zXHJcbiAgICBmb3IgcGxheSBpbiBAcGxheXNcclxuICAgICAgZm9yIGNhcmQsIGluZGV4IGluIHBsYXkuY2FyZHNcclxuICAgICAgICBzZWVuW2NhcmRdKytcclxuICAgICAgICBpZiBub3QgQGFuaW1zW2NhcmRdXHJcbiAgICAgICAgICB3aG8gPSBwbGF5Lndob1xyXG4gICAgICAgICAgbG9jYXRpb24gPSBsb2NhdGlvbnNbd2hvXVxyXG4gICAgICAgICAgQGFuaW1zW2NhcmRdID0gbmV3IEFuaW1hdGlvbiB7XHJcbiAgICAgICAgICAgIHNwZWVkOiBAaGFuZC5jYXJkU3BlZWRcclxuICAgICAgICAgICAgeDogbG9jYXRpb24ueFxyXG4gICAgICAgICAgICB5OiBsb2NhdGlvbi55XHJcbiAgICAgICAgICAgIHI6IC0xICogTWF0aC5QSSAvIDRcclxuICAgICAgICAgICAgczogQHNjYWxlXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgdG9SZW1vdmUgPSBbXVxyXG4gICAgZm9yIGNhcmQsYW5pbSBvZiBAYW5pbXNcclxuICAgICAgaWYgbm90IHNlZW4uaGFzT3duUHJvcGVydHkoY2FyZClcclxuICAgICAgICB0b1JlbW92ZS5wdXNoIGNhcmRcclxuICAgIGZvciBjYXJkIGluIHRvUmVtb3ZlXHJcbiAgICAgICMgQGdhbWUubG9nIFwicmVtb3ZpbmcgYW5pbSBmb3IgI3tjYXJkfVwiXHJcbiAgICAgIGRlbGV0ZSBAYW5pbXNbY2FyZF1cclxuXHJcbiAgICBAdXBkYXRlUG9zaXRpb25zKClcclxuXHJcbiAgdXBkYXRlUG9zaXRpb25zOiAtPlxyXG4gICAgbG9jYXRpb25zID0gQHBsYXlMb2NhdGlvbnNcclxuICAgIGZvciBwbGF5LCBwbGF5SW5kZXggaW4gQHBsYXlzXHJcbiAgICAgIGZvciB2LCBpbmRleCBpbiBwbGF5LmNhcmRzXHJcbiAgICAgICAgYW5pbSA9IEBhbmltc1t2XVxyXG4gICAgICAgIGxvYyA9IHBsYXkud2hvXHJcbiAgICAgICAgYW5pbS5yZXEueCA9IGxvY2F0aW9uc1tsb2NdLnggKyAoaW5kZXggKiBAaGFuZC5jYXJkV2lkdGggKiBAcGxheUNhcmRTcGFjaW5nKVxyXG4gICAgICAgIGFuaW0ucmVxLnkgPSBsb2NhdGlvbnNbbG9jXS55XHJcbiAgICAgICAgYW5pbS5yZXEuciA9IDAuMiAqIE1hdGguY29zKHBsYXlJbmRleCAvIDAuMSlcclxuICAgICAgICBhbmltLnJlcS5zID0gQHNjYWxlXHJcblxyXG4gIHJlYWR5Rm9yTmV4dFRyaWNrOiAtPlxyXG4gICAgcmV0dXJuIChAc2V0dGxlVGltZXIgPT0gMClcclxuXHJcbiAgdXBkYXRlOiAoZHQpIC0+XHJcbiAgICB1cGRhdGVkID0gZmFsc2VcclxuXHJcbiAgICBpZiBAc2V0dGxlVGltZXIgPiAwXHJcbiAgICAgIHVwZGF0ZWQgPSB0cnVlXHJcbiAgICAgIEBzZXR0bGVUaW1lciAtPSBkdFxyXG4gICAgICBpZiBAc2V0dGxlVGltZXIgPCAwXHJcbiAgICAgICAgQHNldHRsZVRpbWVyID0gMFxyXG5cclxuICAgIGZvciBjYXJkLGFuaW0gb2YgQGFuaW1zXHJcbiAgICAgIGlmIGFuaW0udXBkYXRlKGR0KVxyXG4gICAgICAgIHVwZGF0ZWQgPSB0cnVlXHJcblxyXG4gICAgcmV0dXJuIHVwZGF0ZWRcclxuXHJcbiAgIyB1c2VkIGJ5IHRoZSBnYW1lIG92ZXIgc2NyZWVuLiBJdCByZXR1cm5zIHRydWUgd2hlbiBuZWl0aGVyIHRoZSBwaWxlIG5vciB0aGUgbGFzdCB0aHJvd24gYXJlIG1vdmluZ1xyXG4gIHJlc3Rpbmc6IC0+XHJcbiAgICBmb3IgY2FyZCxhbmltIG9mIEBhbmltc1xyXG4gICAgICBpZiBhbmltLmFuaW1hdGluZygpXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICBpZiBAc2V0dGxlVGltZXIgPiAwXHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgcmV0dXJuIHRydWVcclxuXHJcbiAgcmVuZGVyOiAtPlxyXG4gICAgZm9yIHBsYXksIHBsYXlJbmRleCBpbiBAcGxheXNcclxuICAgICAgaGlnaGxpZ2h0ID0gSGFuZC5IaWdobGlnaHQuUElMRVxyXG4gICAgICBpZiBwbGF5SW5kZXggPT0gKEBwbGF5cy5sZW5ndGggLSAxKVxyXG4gICAgICAgIGhpZ2hsaWdodCA9IEhhbmQuSGlnaGxpZ2h0Lk5PTkVcclxuICAgICAgZm9yIHYsIGluZGV4IGluIHBsYXkuY2FyZHNcclxuICAgICAgICBhbmltID0gQGFuaW1zW3ZdXHJcbiAgICAgICAgQGhhbmQucmVuZGVyQ2FyZCB2LCBhbmltLmN1ci54LCBhbmltLmN1ci55LCBhbmltLmN1ci5yLCBhbmltLmN1ci5zLCBoaWdobGlnaHRcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUGlsZVxyXG4iLCJjbGFzcyBTcHJpdGVSZW5kZXJlclxyXG4gIGNvbnN0cnVjdG9yOiAoQGdhbWUpIC0+XHJcbiAgICBAc3ByaXRlcyA9XHJcbiAgICAgICMgZ2VuZXJpYyBzcHJpdGVzXHJcbiAgICAgIHNvbGlkOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6ICA1NSwgeTogNzIzLCB3OiAgMTAsIGg6ICAxMCB9XHJcbiAgICAgIHBhdXNlOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDYwMiwgeTogNzA3LCB3OiAxMjIsIGg6IDEyNSB9XHJcbiAgICAgIGJ1dHRvbjA6ICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDE0MCwgeTogNzc3LCB3OiA0MjIsIGg6ICA2NSB9XHJcbiAgICAgIGJ1dHRvbjE6ICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDE0MCwgeTogNjk4LCB3OiA0MjIsIGg6ICA2NSB9XHJcbiAgICAgIHBsdXMwOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDc0NSwgeTogNjY0LCB3OiAxMTYsIGg6IDExOCB9XHJcbiAgICAgIHBsdXMxOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDc0NSwgeTogODIwLCB3OiAxMTYsIGg6IDExOCB9XHJcbiAgICAgIG1pbnVzMDogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDg5NSwgeTogNjY0LCB3OiAxMTYsIGg6IDExOCB9XHJcbiAgICAgIG1pbnVzMTogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDg5NSwgeTogODIwLCB3OiAxMTYsIGg6IDExOCB9XHJcbiAgICAgIGFycm93TDogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6ICAzMywgeTogODU4LCB3OiAyMDQsIGg6IDE1NiB9XHJcbiAgICAgIGFycm93UjogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDIzOSwgeTogODUyLCB3OiAyMDgsIGg6IDE1NSB9XHJcbiAgICAgIHBpbGU6ICAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDUxMywgeTogODc1LCB3OiAxMjgsIGg6IDEyOCB9XHJcblxyXG4gICAgICAjIG1lbnUgYmFja2dyb3VuZHNcclxuICAgICAgbWFpbm1lbnU6ICB7IHRleHR1cmU6IFwibWFpbm1lbnVcIiwgIHg6IDAsIHk6IDAsIHc6IDEyODAsIGg6IDcyMCB9XHJcbiAgICAgIHBhdXNlbWVudTogeyB0ZXh0dXJlOiBcInBhdXNlbWVudVwiLCB4OiAwLCB5OiAwLCB3OiAxMjgwLCBoOiA3MjAgfVxyXG5cclxuICAgICAgIyBob3d0b1xyXG4gICAgICBob3d0bzE6ICAgIHsgdGV4dHVyZTogXCJob3d0bzFcIiwgIHg6IDAsIHk6ICAwLCB3OiAxOTIwLCBoOiAxMDgwIH1cclxuICAgICAgaG93dG8yOiAgICB7IHRleHR1cmU6IFwiaG93dG8yXCIsICB4OiAwLCB5OiAgMCwgdzogMTkyMCwgaDogMTA4MCB9XHJcbiAgICAgIGhvd3RvMzogICAgeyB0ZXh0dXJlOiBcImhvd3RvM1wiLCAgeDogMCwgeTogIDAsIHc6IDE5MjAsIGg6IDEwODAgfVxyXG5cclxuICAgICAgIyBjaGFyYWN0ZXJzXHJcbiAgICAgIG1hcmlvOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6ICAyMCwgeTogICAwLCB3OiAxNTEsIGg6IDMwOCB9XHJcbiAgICAgIGx1aWdpOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDE3MSwgeTogICAwLCB3OiAxNTEsIGg6IDMwOCB9XHJcbiAgICAgIHBlYWNoOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDMzNSwgeTogICAwLCB3OiAxNjQsIGg6IDMwOCB9XHJcbiAgICAgIGRhaXN5OiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDUwNCwgeTogICAwLCB3OiAxNjQsIGg6IDMwOCB9XHJcbiAgICAgIHlvc2hpOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDY2OCwgeTogICAwLCB3OiAxODAsIGg6IDMwOCB9XHJcbiAgICAgIHRvYWQ6ICAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDg0OSwgeTogICAwLCB3OiAxNTcsIGg6IDMwOCB9XHJcbiAgICAgIGJvd3NlcjogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6ICAxMSwgeTogMzIyLCB3OiAxNTEsIGg6IDMwOCB9XHJcbiAgICAgIGJvd3NlcmpyOiAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDIyNSwgeTogMzIyLCB3OiAxNDQsIGg6IDMwOCB9XHJcbiAgICAgIGtvb3BhOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDM3MiwgeTogMzIyLCB3OiAxMjgsIGg6IDMwOCB9XHJcbiAgICAgIHJvc2FsaW5hOiAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDUwMCwgeTogMzIyLCB3OiAxNzMsIGg6IDMwOCB9XHJcbiAgICAgIHNoeWd1eTogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDY5MSwgeTogMzIyLCB3OiAxNTQsIGg6IDMwOCB9XHJcbiAgICAgIHRvYWRldHRlOiAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDg0NywgeTogMzIyLCB3OiAxNTgsIGg6IDMwOCB9XHJcblxyXG4gIGNhbGNXaWR0aDogKHNwcml0ZU5hbWUsIGhlaWdodCkgLT5cclxuICAgIHNwcml0ZSA9IEBzcHJpdGVzW3Nwcml0ZU5hbWVdXHJcbiAgICByZXR1cm4gMSBpZiBub3Qgc3ByaXRlXHJcbiAgICByZXR1cm4gaGVpZ2h0ICogc3ByaXRlLncgLyBzcHJpdGUuaFxyXG5cclxuICByZW5kZXI6IChzcHJpdGVOYW1lLCBkeCwgZHksIGR3LCBkaCwgcm90LCBhbmNob3J4LCBhbmNob3J5LCBjb2xvciwgY2IpIC0+XHJcbiAgICBzcHJpdGUgPSBAc3ByaXRlc1tzcHJpdGVOYW1lXVxyXG4gICAgcmV0dXJuIGlmIG5vdCBzcHJpdGVcclxuICAgIGlmIChkdyA9PSAwKSBhbmQgKGRoID09IDApXHJcbiAgICAgICMgdGhpcyBwcm9iYWJseSBzaG91bGRuJ3QgZXZlciBiZSB1c2VkLlxyXG4gICAgICBkdyA9IHNwcml0ZS54XHJcbiAgICAgIGRoID0gc3ByaXRlLnlcclxuICAgIGVsc2UgaWYgZHcgPT0gMFxyXG4gICAgICBkdyA9IGRoICogc3ByaXRlLncgLyBzcHJpdGUuaFxyXG4gICAgZWxzZSBpZiBkaCA9PSAwXHJcbiAgICAgIGRoID0gZHcgKiBzcHJpdGUuaCAvIHNwcml0ZS53XHJcbiAgICBAZ2FtZS5kcmF3SW1hZ2Ugc3ByaXRlLnRleHR1cmUsIHNwcml0ZS54LCBzcHJpdGUueSwgc3ByaXRlLncsIHNwcml0ZS5oLCBkeCwgZHksIGR3LCBkaCwgcm90LCBhbmNob3J4LCBhbmNob3J5LCBjb2xvci5yLCBjb2xvci5nLCBjb2xvci5iLCBjb2xvci5hLCBjYlxyXG4gICAgcmV0dXJuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNwcml0ZVJlbmRlcmVyXHJcbiIsIk1JTl9QTEFZRVJTID0gM1xyXG5NQVhfTE9HX0xJTkVTID0gN1xyXG5PSyA9ICdPSydcclxuXHJcblN1aXQgPVxyXG4gIE5PTkU6IC0xXHJcbiAgU1BBREVTOiAwXHJcbiAgQ0xVQlM6IDFcclxuICBESUFNT05EUzogMlxyXG4gIEhFQVJUUzogM1xyXG5cclxuU3VpdE5hbWUgPSBbJ1NwYWRlcycsICdDbHVicycsICdEaWFtb25kcycsICdIZWFydHMnXVxyXG5TaG9ydFN1aXROYW1lID0gWydTJywgJ0MnLCAnRCcsICdIJ11cclxuXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgQUkgTmFtZSBHZW5lcmF0b3JcclxuXHJcbmFpQ2hhcmFjdGVyTGlzdCA9IFtcclxuICB7IGlkOiBcIm1hcmlvXCIsICAgIG5hbWU6IFwiTWFyaW9cIiwgICAgICBzcHJpdGU6IFwibWFyaW9cIiwgICAgYnJhaW46IFwibm9ybWFsXCIgfVxyXG4gIHsgaWQ6IFwibHVpZ2lcIiwgICAgbmFtZTogXCJMdWlnaVwiLCAgICAgIHNwcml0ZTogXCJsdWlnaVwiLCAgICBicmFpbjogXCJub3JtYWxcIiB9XHJcbiAgeyBpZDogXCJwZWFjaFwiLCAgICBuYW1lOiBcIlBlYWNoXCIsICAgICAgc3ByaXRlOiBcInBlYWNoXCIsICAgIGJyYWluOiBcIm5vcm1hbFwiIH1cclxuICB7IGlkOiBcImRhaXN5XCIsICAgIG5hbWU6IFwiRGFpc3lcIiwgICAgICBzcHJpdGU6IFwiZGFpc3lcIiwgICAgYnJhaW46IFwibm9ybWFsXCIgfVxyXG4gIHsgaWQ6IFwieW9zaGlcIiwgICAgbmFtZTogXCJZb3NoaVwiLCAgICAgIHNwcml0ZTogXCJ5b3NoaVwiLCAgICBicmFpbjogXCJub3JtYWxcIiB9XHJcbiAgeyBpZDogXCJ0b2FkXCIsICAgICBuYW1lOiBcIlRvYWRcIiwgICAgICAgc3ByaXRlOiBcInRvYWRcIiwgICAgIGJyYWluOiBcIm5vcm1hbFwiIH1cclxuICB7IGlkOiBcImJvd3NlclwiLCAgIG5hbWU6IFwiQm93c2VyXCIsICAgICBzcHJpdGU6IFwiYm93c2VyXCIsICAgYnJhaW46IFwibm9ybWFsXCIgfVxyXG4gIHsgaWQ6IFwiYm93c2VyanJcIiwgbmFtZTogXCJCb3dzZXIgSnJcIiwgIHNwcml0ZTogXCJib3dzZXJqclwiLCBicmFpbjogXCJub3JtYWxcIiB9XHJcbiAgeyBpZDogXCJrb29wYVwiLCAgICBuYW1lOiBcIktvb3BhXCIsICAgICAgc3ByaXRlOiBcImtvb3BhXCIsICAgIGJyYWluOiBcIm5vcm1hbFwiIH1cclxuICB7IGlkOiBcInJvc2FsaW5hXCIsIG5hbWU6IFwiUm9zYWxpbmFcIiwgICBzcHJpdGU6IFwicm9zYWxpbmFcIiwgYnJhaW46IFwibm9ybWFsXCIgfVxyXG4gIHsgaWQ6IFwic2h5Z3V5XCIsICAgbmFtZTogXCJTaHlndXlcIiwgICAgIHNwcml0ZTogXCJzaHlndXlcIiwgICBicmFpbjogXCJub3JtYWxcIiB9XHJcbiAgeyBpZDogXCJ0b2FkZXR0ZVwiLCBuYW1lOiBcIlRvYWRldHRlXCIsICAgc3ByaXRlOiBcInRvYWRldHRlXCIsIGJyYWluOiBcIm5vcm1hbFwiIH1cclxuXVxyXG5cclxuYWlDaGFyYWN0ZXJzID0ge31cclxuZm9yIGNoYXJhY3RlciBpbiBhaUNoYXJhY3Rlckxpc3RcclxuICBhaUNoYXJhY3RlcnNbY2hhcmFjdGVyLmlkXSA9IGNoYXJhY3RlclxyXG5cclxucmFuZG9tQ2hhcmFjdGVyID0gLT5cclxuICByID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogYWlDaGFyYWN0ZXJMaXN0Lmxlbmd0aClcclxuICByZXR1cm4gYWlDaGFyYWN0ZXJMaXN0W3JdXHJcblxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIENhcmRcclxuXHJcbmNsYXNzIENhcmRcclxuICBjb25zdHJ1Y3RvcjogKEByYXcpIC0+XHJcbiAgICBAc3VpdCAgPSBNYXRoLmZsb29yKEByYXcgJSA0KVxyXG4gICAgQHZhbHVlID0gTWF0aC5mbG9vcihAcmF3IC8gNClcclxuICAgIEB2YWx1ZU5hbWUgPSBzd2l0Y2ggQHZhbHVlXHJcbiAgICAgIHdoZW4gIDggdGhlbiAnSidcclxuICAgICAgd2hlbiAgOSB0aGVuICdRJ1xyXG4gICAgICB3aGVuIDEwIHRoZW4gJ0snXHJcbiAgICAgIHdoZW4gMTEgdGhlbiAnQSdcclxuICAgICAgd2hlbiAxMiB0aGVuICcyJ1xyXG4gICAgICBlbHNlXHJcbiAgICAgICAgU3RyaW5nKEB2YWx1ZSArIDMpXHJcbiAgICBAbmFtZSA9IEB2YWx1ZU5hbWUgKyBTaG9ydFN1aXROYW1lW0BzdWl0XVxyXG4gICAgIyBjb25zb2xlLmxvZyBcIiN7QHJhd30gLT4gI3tAbmFtZX1cIlxyXG5cclxuY2FyZHNUb1N0cmluZyA9IChyYXdDYXJkcykgLT5cclxuICBjYXJkTmFtZXMgPSBbXVxyXG4gIGZvciByYXcgaW4gcmF3Q2FyZHNcclxuICAgIGNhcmQgPSBuZXcgQ2FyZChyYXcpXHJcbiAgICBjYXJkTmFtZXMucHVzaCBjYXJkLm5hbWVcclxuICByZXR1cm4gXCJbIFwiICsgY2FyZE5hbWVzLmpvaW4oJywnKSArIFwiIF1cIlxyXG5cclxucGxheVR5cGVUb1N0cmluZyA9ICh0eXBlKSAtPlxyXG4gIGlmIG1hdGNoZXMgPSB0eXBlLm1hdGNoKC9ecnVuKFxcZCspLylcclxuICAgIHJldHVybiBcIlJ1biBvZiAje21hdGNoZXNbMV19XCJcclxuICBpZiBtYXRjaGVzID0gdHlwZS5tYXRjaCgvXmtpbmQoXFxkKykvKVxyXG4gICAgaWYgbWF0Y2hlc1sxXSA9PSAnMSdcclxuICAgICAgcmV0dXJuICdTaW5nbGUnXHJcbiAgICBpZiBtYXRjaGVzWzFdID09ICcyJ1xyXG4gICAgICByZXR1cm4gJ1BhaXInXHJcbiAgICBpZiBtYXRjaGVzWzFdID09ICczJ1xyXG4gICAgICByZXR1cm4gJ1RyaXBzJ1xyXG4gICAgcmV0dXJuICdRdWFkcydcclxuICByZXR1cm4gdHlwZVxyXG5cclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuIyBEZWNrXHJcblxyXG5jbGFzcyBTaHVmZmxlZERlY2tcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgICMgZGF0IGluc2lkZS1vdXQgc2h1ZmZsZSFcclxuICAgIEBjYXJkcyA9IFsgMCBdXHJcbiAgICBmb3IgaSBpbiBbMS4uLjUyXVxyXG4gICAgICBqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogaSlcclxuICAgICAgQGNhcmRzLnB1c2goQGNhcmRzW2pdKVxyXG4gICAgICBAY2FyZHNbal0gPSBpXHJcblxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIFRoaXJ0ZWVuXHJcblxyXG5jbGFzcyBUaGlydGVlblxyXG4gIGNvbnN0cnVjdG9yOiAoQGdhbWUsIHBhcmFtcykgLT5cclxuICAgIHJldHVybiBpZiBub3QgcGFyYW1zXHJcblxyXG4gICAgaWYgcGFyYW1zLnN0YXRlXHJcbiAgICAgIGZvciBrLHYgb2YgcGFyYW1zLnN0YXRlXHJcbiAgICAgICAgaWYgcGFyYW1zLnN0YXRlLmhhc093blByb3BlcnR5KGspXHJcbiAgICAgICAgICB0aGlzW2tdID0gcGFyYW1zLnN0YXRlW2tdXHJcbiAgICBlbHNlXHJcbiAgICAgICMgbmV3IGdhbWVcclxuICAgICAgQGxvZyA9IFtdXHJcblxyXG4gICAgICBAcGxheWVycyA9IFtcclxuICAgICAgICB7IGlkOiAxLCBuYW1lOiAnUGxheWVyJywgaW5kZXg6IDAsIHBhc3M6IGZhbHNlIH1cclxuICAgICAgXVxyXG5cclxuICAgICAgZm9yIGkgaW4gWzEuLi40XVxyXG4gICAgICAgIEBhZGRBSSgpXHJcblxyXG4gICAgICBAZGVhbCgpXHJcblxyXG4gIGRlYWw6IChwYXJhbXMpIC0+XHJcbiAgICBkZWNrID0gbmV3IFNodWZmbGVkRGVjaygpXHJcbiAgICBmb3IgcGxheWVyLCBwbGF5ZXJJbmRleCBpbiBAcGxheWVyc1xyXG4gICAgICBAZ2FtZS5sb2cgXCJkZWFsaW5nIDEzIGNhcmRzIHRvIHBsYXllciAje3BsYXllckluZGV4fVwiXHJcblxyXG4gICAgICBwbGF5ZXIuaGFuZCA9IFtdXHJcbiAgICAgIGZvciBqIGluIFswLi4uMTNdXHJcbiAgICAgICAgcmF3ID0gZGVjay5jYXJkcy5zaGlmdCgpXHJcbiAgICAgICAgaWYgcmF3ID09IDBcclxuICAgICAgICAgIEB0dXJuID0gcGxheWVySW5kZXhcclxuICAgICAgICBwbGF5ZXIuaGFuZC5wdXNoKHJhdylcclxuXHJcbiAgICAgIGNvbnNvbGUubG9nIFwiQGdhbWUub3B0aW9ucy5zb3J0SW5kZXggI3tAZ2FtZS5vcHRpb25zLnNvcnRJbmRleH1cIlxyXG4gICAgICBpZiAoQGdhbWUub3B0aW9ucy5zb3J0SW5kZXggPT0gMCkgb3IgcGxheWVyLmFpXHJcbiAgICAgICAgIyBOb3JtYWxcclxuICAgICAgICBwbGF5ZXIuaGFuZC5zb3J0IChhLGIpIC0+IHJldHVybiBhIC0gYlxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgIyBSZXZlcnNlXHJcbiAgICAgICAgcGxheWVyLmhhbmQuc29ydCAoYSxiKSAtPiByZXR1cm4gYiAtIGFcclxuXHJcbiAgICBAcGlsZSA9IFtdXHJcbiAgICBAcGlsZVdobyA9IC0xXHJcbiAgICBAdGhyb3dJRCA9IDBcclxuICAgIEBjdXJyZW50UGxheSA9IG51bGxcclxuICAgIEB1bnBhc3NBbGwoKVxyXG5cclxuICAgIEBvdXRwdXQoJ0hhbmQgZGVhbHQsICcgKyBAcGxheWVyc1tAdHVybl0ubmFtZSArICcgcGxheXMgZmlyc3QnKVxyXG5cclxuICAgIHJldHVybiBPS1xyXG5cclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICMgVGhpcnRlZW4gbWV0aG9kc1xyXG5cclxuICBzYXZlOiAtPlxyXG4gICAgbmFtZXMgPSBcImxvZyBwbGF5ZXJzIHR1cm4gcGlsZSBwaWxlV2hvIHRocm93SUQgY3VycmVudFBsYXlcIi5zcGxpdChcIiBcIilcclxuICAgIHN0YXRlID0ge31cclxuICAgIGZvciBuYW1lIGluIG5hbWVzXHJcbiAgICAgIHN0YXRlW25hbWVdID0gdGhpc1tuYW1lXVxyXG4gICAgcmV0dXJuIHN0YXRlXHJcblxyXG4gIG91dHB1dDogKHRleHQpIC0+XHJcbiAgICBAbG9nLnB1c2ggdGV4dFxyXG4gICAgaWYgQGxvZy5sZW5ndGggPiBNQVhfTE9HX0xJTkVTXHJcbiAgICAgIEBsb2cuc2hpZnQoKVxyXG5cclxuICBoZWFkbGluZTogLT5cclxuICAgIGlmIEB3aW5uZXIoKSAhPSBudWxsXHJcbiAgICAgIHJldHVybiBcIkdhbWUgT3ZlclwiXHJcblxyXG4gICAgaWYgQGN1cnJlbnRQbGF5XHJcbiAgICAgIHBsYXlTdHJpbmcgPSBAY3VycmVudFBsYXkudHlwZSArIFwiICgje0BjdXJyZW50UGxheS5oaWdofSlcIlxyXG4gICAgZWxzZVxyXG4gICAgICBwbGF5U3RyaW5nID0gXCJBbnl0aGluZ1wiXHJcblxyXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcclxuICAgIGhlYWRsaW5lID0gcGxheVN0cmluZyArIFwiIHRvIFwiICsgY3VycmVudFBsYXllci5uYW1lXHJcbiAgICByZXR1cm4gaGVhZGxpbmVcclxuXHJcbiAgZmluZFBsYXllcjogKGlkKSAtPlxyXG4gICAgZm9yIHBsYXllciBpbiBAcGxheWVyc1xyXG4gICAgICBpZiBwbGF5ZXIuaWQgPT0gaWRcclxuICAgICAgICByZXR1cm4gcGxheWVyXHJcbiAgICByZXR1cm4gdW5kZWZpbmVkXHJcblxyXG4gIGN1cnJlbnRQbGF5ZXI6IC0+XHJcbiAgICByZXR1cm4gQHBsYXllcnNbQHR1cm5dXHJcblxyXG4gIGV2ZXJ5b25lUGFzc2VkOiAtPlxyXG4gICAgZm9yIHBsYXllciwgcGxheWVySW5kZXggaW4gQHBsYXllcnNcclxuICAgICAgaWYgcGxheWVySW5kZXggPT0gQHR1cm5cclxuICAgICAgICBjb250aW51ZVxyXG4gICAgICBpZiBub3QgcGxheWVyLnBhc3NcclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgIHJldHVybiB0cnVlXHJcblxyXG4gIHBsYXllckFmdGVyOiAoaW5kZXgpIC0+XHJcbiAgICByZXR1cm4gKGluZGV4ICsgMSkgJSBAcGxheWVycy5sZW5ndGhcclxuXHJcbiAgYWRkUGxheWVyOiAocGxheWVyKSAtPlxyXG4gICAgaWYgbm90IHBsYXllci5haVxyXG4gICAgICBwbGF5ZXIuYWkgPSBmYWxzZVxyXG5cclxuICAgIEBwbGF5ZXJzLnB1c2ggcGxheWVyXHJcbiAgICBwbGF5ZXIuaW5kZXggPSBAcGxheWVycy5sZW5ndGggLSAxXHJcbiAgICBAb3V0cHV0KHBsYXllci5uYW1lICsgXCIgam9pbnMgdGhlIGdhbWVcIilcclxuXHJcbiAgbmFtZVByZXNlbnQ6IChuYW1lKSAtPlxyXG4gICAgZm9yIHBsYXllciBpbiBAcGxheWVyc1xyXG4gICAgICBpZiBwbGF5ZXIubmFtZSA9PSBuYW1lXHJcbiAgICAgICAgcmV0dXJuIHRydWVcclxuXHJcbiAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgYWRkQUk6IC0+XHJcbiAgICBsb29wXHJcbiAgICAgIGNoYXJhY3RlciA9IHJhbmRvbUNoYXJhY3RlcigpXHJcbiAgICAgIGlmIG5vdCBAbmFtZVByZXNlbnQoY2hhcmFjdGVyLm5hbWUpXHJcbiAgICAgICAgYnJlYWtcclxuXHJcbiAgICBhaSA9XHJcbiAgICAgIGNoYXJJRDogY2hhcmFjdGVyLmlkXHJcbiAgICAgIG5hbWU6IGNoYXJhY3Rlci5uYW1lXHJcbiAgICAgIGlkOiAnYWknICsgU3RyaW5nKEBwbGF5ZXJzLmxlbmd0aClcclxuICAgICAgcGFzczogZmFsc2VcclxuICAgICAgYWk6IHRydWVcclxuXHJcbiAgICBAYWRkUGxheWVyKGFpKVxyXG5cclxuICAgIEBnYW1lLmxvZyhcImFkZGVkIEFJIHBsYXllclwiKVxyXG4gICAgcmV0dXJuIE9LXHJcblxyXG4gIHVwZGF0ZVBsYXllckhhbmQ6IChjYXJkcykgLT5cclxuICAgICMgVGhpcyBtYWludGFpbnMgdGhlIHJlb3JnYW5pemVkIG9yZGVyIG9mIHRoZSBwbGF5ZXIncyBoYW5kXHJcbiAgICBAcGxheWVyc1swXS5oYW5kID0gY2FyZHMuc2xpY2UoMClcclxuXHJcbiAgd2lubmVyOiAtPlxyXG4gICAgZm9yIHBsYXllciwgaSBpbiBAcGxheWVyc1xyXG4gICAgICBpZiBwbGF5ZXIuaGFuZC5sZW5ndGggPT0gMFxyXG4gICAgICAgIHJldHVybiBwbGF5ZXJcclxuICAgIHJldHVybiBudWxsXHJcblxyXG4gIGhhc0NhcmQ6IChoYW5kLCByYXdDYXJkKSAtPlxyXG4gICAgZm9yIHJhdyBpbiBoYW5kXHJcbiAgICAgIGlmIHJhdyA9PSByYXdDYXJkXHJcbiAgICAgICAgcmV0dXJuIHRydWVcclxuICAgIHJldHVybiBmYWxzZVxyXG5cclxuICBoYXNDYXJkczogKGhhbmQsIHJhd0NhcmRzKSAtPlxyXG4gICAgZm9yIHJhdyBpbiByYXdDYXJkc1xyXG4gICAgICBpZiBub3QgQGhhc0NhcmQoaGFuZCwgcmF3KVxyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgcmV0dXJuIHRydWVcclxuXHJcbiAgcmVtb3ZlQ2FyZHM6IChoYW5kLCByYXdDYXJkcykgLT5cclxuICAgIG5ld0hhbmQgPSBbXVxyXG4gICAgZm9yIGNhcmQgaW4gaGFuZFxyXG4gICAgICBrZWVwTWUgPSB0cnVlXHJcbiAgICAgIGZvciByYXcgaW4gcmF3Q2FyZHNcclxuICAgICAgICBpZiBjYXJkID09IHJhd1xyXG4gICAgICAgICAga2VlcE1lID0gZmFsc2VcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgIGlmIGtlZXBNZVxyXG4gICAgICAgIG5ld0hhbmQucHVzaCBjYXJkXHJcbiAgICByZXR1cm4gbmV3SGFuZFxyXG5cclxuICBjbGFzc2lmeTogKHJhd0NhcmRzKSAtPlxyXG4gICAgY2FyZHMgPSByYXdDYXJkcy5tYXAgKHJhdykgLT4gbmV3IENhcmQocmF3KVxyXG4gICAgY2FyZHMgPSBjYXJkcy5zb3J0IChhLCBiKSAtPiByZXR1cm4gYS5yYXcgLSBiLnJhd1xyXG4gICAgaGlnaGVzdFJhdyA9IGNhcmRzW2NhcmRzLmxlbmd0aCAtIDFdLnJhd1xyXG5cclxuICAgICMgbG9vayBmb3IgYSBydW4gb2YgcGFpcnNcclxuICAgIGlmIChjYXJkcy5sZW5ndGggPj0gNikgYW5kICgoY2FyZHMubGVuZ3RoICUgMikgPT0gMClcclxuICAgICAgZm91bmRSb3AgPSB0cnVlXHJcbiAgICAgIGZvciBjYXJkLCBjYXJkSW5kZXggaW4gY2FyZHNcclxuICAgICAgICBpZiBjYXJkSW5kZXggPT0gMFxyXG4gICAgICAgICAgY29udGludWVcclxuICAgICAgICBpZiBjYXJkLnZhbHVlID09IDEyXHJcbiAgICAgICAgICAjIG5vIDJzIGluIGEgcnVuXHJcbiAgICAgICAgICBmb3VuZFJvcCA9IGZhbHNlXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGlmIChjYXJkSW5kZXggJSAyKSA9PSAxXHJcbiAgICAgICAgICAjIG9kZCBjYXJkLCBtdXN0IG1hdGNoIGxhc3QgY2FyZCBleGFjdGx5XHJcbiAgICAgICAgICBpZiBjYXJkLnZhbHVlICE9IChjYXJkc1tjYXJkSW5kZXggLSAxXS52YWx1ZSlcclxuICAgICAgICAgICAgZm91bmRSb3AgPSBmYWxzZVxyXG4gICAgICAgICAgICBicmVha1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICMgZXZlbiBjYXJkLCBtdXN0IGluY3JlbWVudFxyXG4gICAgICAgICAgaWYgY2FyZC52YWx1ZSAhPSAoY2FyZHNbY2FyZEluZGV4IC0gMV0udmFsdWUgKyAxKVxyXG4gICAgICAgICAgICBmb3VuZFJvcCA9IGZhbHNlXHJcbiAgICAgICAgICAgIGJyZWFrXHJcblxyXG4gICAgICBpZiBmb3VuZFJvcFxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAncm9wJyArIE1hdGguZmxvb3IoY2FyZHMubGVuZ3RoIC8gMilcclxuICAgICAgICAgIGhpZ2g6IGhpZ2hlc3RSYXdcclxuICAgICAgICB9XHJcblxyXG4gICAgIyBsb29rIGZvciBhIHJ1blxyXG4gICAgaWYgY2FyZHMubGVuZ3RoID49IDNcclxuICAgICAgZm91bmRSdW4gPSB0cnVlXHJcbiAgICAgIGZvciBjYXJkLCBjYXJkSW5kZXggaW4gY2FyZHNcclxuICAgICAgICBpZiBjYXJkSW5kZXggPT0gMFxyXG4gICAgICAgICAgY29udGludWVcclxuICAgICAgICBpZiBjYXJkLnZhbHVlID09IDEyXHJcbiAgICAgICAgICAjIG5vIDJzIGluIGEgcnVuXHJcbiAgICAgICAgICBmb3VuZFJ1biA9IGZhbHNlXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGlmIGNhcmQudmFsdWUgIT0gKGNhcmRzW2NhcmRJbmRleCAtIDFdLnZhbHVlICsgMSlcclxuICAgICAgICAgIGZvdW5kUnVuID0gZmFsc2VcclxuICAgICAgICAgIGJyZWFrXHJcblxyXG4gICAgICBpZiBmb3VuZFJ1blxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAncnVuJyArIGNhcmRzLmxlbmd0aFxyXG4gICAgICAgICAgaGlnaDogaGlnaGVzdFJhd1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAjIGxvb2sgZm9yIFggb2YgYSBraW5kXHJcbiAgICByZXFWYWx1ZSA9IGNhcmRzWzBdLnZhbHVlXHJcbiAgICBmb3IgY2FyZCBpbiBjYXJkc1xyXG4gICAgICBpZiBjYXJkLnZhbHVlICE9IHJlcVZhbHVlXHJcbiAgICAgICAgcmV0dXJuIG51bGxcclxuICAgIHR5cGUgPSAna2luZCcgKyBjYXJkcy5sZW5ndGhcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHR5cGU6IHR5cGVcclxuICAgICAgaGlnaDogaGlnaGVzdFJhd1xyXG4gICAgfVxyXG5cclxuICBjYW5QYXNzOiAocGFyYW1zKSAtPlxyXG4gICAgaWYgQHdpbm5lcigpICE9IG51bGxcclxuICAgICAgcmV0dXJuICdnYW1lT3ZlcidcclxuXHJcbiAgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxyXG4gICAgaWYgcGFyYW1zLmlkICE9IGN1cnJlbnRQbGF5ZXIuaWRcclxuICAgICAgcmV0dXJuICdub3RZb3VyVHVybidcclxuXHJcbiAgICBpZiBAZXZlcnlvbmVQYXNzZWQoKVxyXG4gICAgICByZXR1cm4gJ3Rocm93QW55dGhpbmcnXHJcblxyXG4gICAgcmV0dXJuIE9LXHJcblxyXG4gIGNhblBsYXk6IChwYXJhbXMsIGluY29taW5nUGxheSkgLT5cclxuICAgIGlmIEB3aW5uZXIoKSAhPSBudWxsXHJcbiAgICAgIHJldHVybiAnZ2FtZU92ZXInXHJcblxyXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcclxuICAgIGlmIHBhcmFtcy5pZCAhPSBjdXJyZW50UGxheWVyLmlkXHJcbiAgICAgIHJldHVybiAnbm90WW91clR1cm4nXHJcblxyXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcclxuICAgIGlmIGN1cnJlbnRQbGF5ZXIucGFzc1xyXG4gICAgICByZXR1cm4gJ211c3RQYXNzJ1xyXG5cclxuICAgIGlmIGluY29taW5nUGxheSA9PSBudWxsXHJcbiAgICAgIHJldHVybiAnaW52YWxpZFBsYXknXHJcblxyXG4gICAgaWYgQGN1cnJlbnRQbGF5ID09IG51bGxcclxuICAgICAgcmV0dXJuIE9LXHJcblxyXG4gICAgaWYgQGV2ZXJ5b25lUGFzc2VkKClcclxuICAgICAgcmV0dXJuIE9LXHJcblxyXG4gICAgaWYgaW5jb21pbmdQbGF5LnR5cGUgIT0gQGN1cnJlbnRQbGF5LnR5cGVcclxuICAgICAgcmV0dXJuICd3cm9uZ1BsYXknXHJcblxyXG4gICAgaWYgaW5jb21pbmdQbGF5LmhpZ2ggPCBAY3VycmVudFBsYXkuaGlnaFxyXG4gICAgICByZXR1cm4gJ3Rvb0xvd1BsYXknXHJcblxyXG4gICAgcmV0dXJuIE9LXHJcblxyXG4gIHBsYXk6IChwYXJhbXMpIC0+XHJcbiAgICBpbmNvbWluZ1BsYXkgPSBAY2xhc3NpZnkocGFyYW1zLmNhcmRzKVxyXG4gICAgY29uc29sZS5sb2cgXCJpbmNvbWluZ1BsYXlcIiwgaW5jb21pbmdQbGF5XHJcblxyXG4gICAgY29uc29sZS5sb2cgXCJzb21lb25lIGNhbGxpbmcgcGxheVwiLCBwYXJhbXNcclxuICAgIHJldCA9IEBjYW5QbGF5KHBhcmFtcywgaW5jb21pbmdQbGF5KVxyXG4gICAgaWYgcmV0ICE9IE9LXHJcbiAgICAgIHJldHVybiByZXRcclxuXHJcbiAgICAjIFRPRE86IG1ha2UgcHJldHR5IG5hbWVzIGJhc2VkIG9uIHRoZSBwbGF5LCBhZGQgcGxheSB0byBoZWFkbGluZVxyXG4gICAgdmVyYiA9IFwiY29udGludWVzIHdpdGhcIlxyXG4gICAgaWYgQGN1cnJlbnRQbGF5XHJcbiAgICAgIGlmIChpbmNvbWluZ1BsYXkudHlwZSAhPSBAY3VycmVudFBsYXkudHlwZSkgb3IgKGluY29taW5nUGxheS5oaWdoIDwgQGN1cnJlbnRQbGF5LmhpZ2gpXHJcbiAgICAgICAgIyBOZXcgcGxheSFcclxuICAgICAgICBAdW5wYXNzQWxsKClcclxuICAgICAgICB2ZXJiID0gXCJ0aHJvd3MgbmV3IHBsYXlcIlxyXG5cclxuICAgIEBjdXJyZW50UGxheSA9IGluY29taW5nUGxheVxyXG5cclxuICAgIEB0aHJvd0lEICs9IDFcclxuICAgIGN1cnJlbnRQbGF5ZXIgPSBAY3VycmVudFBsYXllcigpXHJcbiAgICBjdXJyZW50UGxheWVyLmhhbmQgPSBAcmVtb3ZlQ2FyZHMoY3VycmVudFBsYXllci5oYW5kLCBwYXJhbXMuY2FyZHMpXHJcblxyXG4gICAgQG91dHB1dChcIiN7Y3VycmVudFBsYXllci5uYW1lfSAje3ZlcmJ9ICN7Y2FyZHNUb1N0cmluZyhwYXJhbXMuY2FyZHMpfVwiKVxyXG5cclxuICAgIGlmIGN1cnJlbnRQbGF5ZXIuaGFuZC5sZW5ndGggPT0gMFxyXG4gICAgICBAb3V0cHV0KFwiI3tjdXJyZW50UGxheWVyLm5hbWV9IHdpbnMhXCIpXHJcblxyXG4gICAgQHBpbGUgPSBwYXJhbXMuY2FyZHMuc2xpY2UoMClcclxuICAgIEBwaWxlV2hvID0gQHR1cm5cclxuXHJcbiAgICBAdHVybiA9IEBwbGF5ZXJBZnRlcihAdHVybilcclxuICAgIHJldHVybiBPS1xyXG5cclxuICB1bnBhc3NBbGw6IC0+XHJcbiAgICBmb3IgcGxheWVyIGluIEBwbGF5ZXJzXHJcbiAgICAgIHBsYXllci5wYXNzID0gZmFsc2VcclxuICAgIHJldHVyblxyXG5cclxuICBwYXNzOiAocGFyYW1zKSAtPlxyXG4gICAgcmV0ID0gQGNhblBhc3MocGFyYW1zKVxyXG4gICAgaWYgcmV0ICE9IE9LXHJcbiAgICAgIHJldHVybiByZXRcclxuXHJcbiAgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxyXG4gICAgaWYgY3VycmVudFBsYXllci5wYXNzXHJcbiAgICAgIEBvdXRwdXQoXCIje2N1cnJlbnRQbGF5ZXIubmFtZX0gYXV0by1wYXNzZXNcIilcclxuICAgIGVsc2VcclxuICAgICAgQG91dHB1dChcIiN7Y3VycmVudFBsYXllci5uYW1lfSBwYXNzZXNcIilcclxuICAgIGN1cnJlbnRQbGF5ZXIucGFzcyA9IHRydWVcclxuICAgIEB0dXJuID0gQHBsYXllckFmdGVyKEB0dXJuKVxyXG4gICAgcmV0dXJuIE9LXHJcblxyXG4gIGFpUGxheTogKGN1cnJlbnRQbGF5ZXIsIGNhcmRzKSAtPlxyXG4gICAgcmV0dXJuIEBwbGF5KHsnaWQnOmN1cnJlbnRQbGF5ZXIuaWQsICdjYXJkcyc6Y2FyZHN9KVxyXG5cclxuICBhaVBhc3M6IChjdXJyZW50UGxheWVyKSAtPlxyXG4gICAgcmV0dXJuIEBwYXNzKHsnaWQnOmN1cnJlbnRQbGF5ZXIuaWR9KVxyXG5cclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICMgQUlcclxuXHJcbiAgIyBHZW5lcmljIGxvZ2dpbmcgZnVuY3Rpb247IHByZXBlbmRzIGN1cnJlbnQgQUkgcGxheWVyJ3MgZ3V0cyBiZWZvcmUgcHJpbnRpbmcgdGV4dFxyXG4gIGFpTG9nOiAodGV4dCkgLT5cclxuICAgIGN1cnJlbnRQbGF5ZXIgPSBAY3VycmVudFBsYXllcigpXHJcbiAgICBpZiBub3QgY3VycmVudFBsYXllci5haVxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgICBjaGFyYWN0ZXIgPSBhaUNoYXJhY3RlcnNbY3VycmVudFBsYXllci5jaGFySURdXHJcbiAgICBAZ2FtZS5sb2coJ0FJWycrY3VycmVudFBsYXllci5uYW1lKycgJytjaGFyYWN0ZXIuYnJhaW4rJ106IGhhbmQ6JytjYXJkc1RvU3RyaW5nKGN1cnJlbnRQbGF5ZXIuaGFuZCkrJyBwaWxlOicrY2FyZHNUb1N0cmluZyhAcGlsZSkrJyAnK3RleHQpXHJcblxyXG4gICMgRGV0ZWN0cyBpZiB0aGUgY3VycmVudCBwbGF5ZXIgaXMgQUkgZHVyaW5nIGEgQklEIG9yIFRSSUNLIHBoYXNlIGFuZCBhY3RzIGFjY29yZGluZyB0byB0aGVpciAnYnJhaW4nXHJcbiAgYWlUaWNrOiAtPlxyXG4gICAgaWYgQHdpbm5lcigpICE9IG51bGxcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcclxuICAgIGlmIG5vdCBjdXJyZW50UGxheWVyLmFpXHJcbiAgICAgIGlmIGN1cnJlbnRQbGF5ZXIucGFzc1xyXG4gICAgICAgIEBhaUxvZyhcImF1dG9wYXNzaW5nIGZvciBwbGF5ZXJcIilcclxuICAgICAgICBAYWlQYXNzKGN1cnJlbnRQbGF5ZXIpXHJcbiAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gICAgY2hhcmFjdGVyID0gYWlDaGFyYWN0ZXJzW2N1cnJlbnRQbGF5ZXIuY2hhcklEXVxyXG4gICAgcmV0ID0gQGJyYWluc1tjaGFyYWN0ZXIuYnJhaW5dLnBsYXkuYXBwbHkodGhpcywgW2N1cnJlbnRQbGF5ZXIsIEBjdXJyZW50UGxheSwgQGV2ZXJ5b25lUGFzc2VkKCldKVxyXG4gICAgaWYgcmV0ID09IE9LXHJcbiAgICAgIHJldHVybiB0cnVlXHJcbiAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgYWxDYWxjS2luZHM6IChoYW5kLCBwbGF5cywgbWF0Y2gycyA9IGZhbHNlKSAtPlxyXG4gICAgY2FyZHMgPSBoYW5kLm1hcCAocmF3KSAtPiBuZXcgQ2FyZChyYXcpXHJcbiAgICBjYXJkcyA9IGNhcmRzLnNvcnQgKGEsIGIpIC0+IHJldHVybiBhLnJhdyAtIGIucmF3XHJcbiAgICB2YWx1ZUFycmF5cyA9IFtdXHJcbiAgICBmb3IgaSBpbiBbMC4uLjEzXVxyXG4gICAgICB2YWx1ZUFycmF5cy5wdXNoIFtdXHJcbiAgICBmb3IgY2FyZCBpbiBjYXJkc1xyXG4gICAgICB2YWx1ZUFycmF5c1tjYXJkLnZhbHVlXS5wdXNoKGNhcmQpXHJcblxyXG4gICAgaGFuZCA9IFtdXHJcbiAgICBmb3IgdmFsdWVBcnJheSwgdmFsdWUgaW4gdmFsdWVBcnJheXNcclxuICAgICAgaWYgKHZhbHVlQXJyYXkubGVuZ3RoID4gMSkgYW5kIChtYXRjaDJzIG9yICh2YWx1ZSA8IDEyKSlcclxuICAgICAgICBrZXkgPSBcImtpbmQje3ZhbHVlQXJyYXkubGVuZ3RofVwiXHJcbiAgICAgICAgcGxheXNba2V5XSA/PSBbXVxyXG4gICAgICAgIHBsYXlzW2tleV0ucHVzaCB2YWx1ZUFycmF5Lm1hcCAodikgLT4gdi5yYXdcclxuICAgICAgZWxzZVxyXG4gICAgICAgIGZvciB2IGluIHZhbHVlQXJyYXlcclxuICAgICAgICAgIGhhbmQucHVzaCB2LnJhd1xyXG5cclxuICAgIHJldHVybiBoYW5kXHJcblxyXG4gIGFpRmluZFJ1bnM6IChoYW5kLCBlYWNoU2l6ZSwgc2l6ZSkgLT5cclxuICAgIHJ1bnMgPSBbXVxyXG5cclxuICAgIGNhcmRzID0gaGFuZC5tYXAgKHJhdykgLT4gbmV3IENhcmQocmF3KVxyXG4gICAgY2FyZHMgPSBjYXJkcy5zb3J0IChhLCBiKSAtPiByZXR1cm4gYS5yYXcgLSBiLnJhd1xyXG4gICAgdmFsdWVBcnJheXMgPSBbXVxyXG4gICAgZm9yIGkgaW4gWzAuLi4xM11cclxuICAgICAgdmFsdWVBcnJheXMucHVzaCBbXVxyXG4gICAgZm9yIGNhcmQgaW4gY2FyZHNcclxuICAgICAgdmFsdWVBcnJheXNbY2FyZC52YWx1ZV0ucHVzaChjYXJkKVxyXG5cclxuICAgIGxhc3RTdGFydGluZ1ZhbHVlID0gMTIgLSBzaXplXHJcbiAgICBmb3Igc3RhcnRpbmdWYWx1ZSBpbiBbMC4uLmxhc3RTdGFydGluZ1ZhbHVlXVxyXG4gICAgICBydW5Gb3VuZCA9IHRydWVcclxuICAgICAgZm9yIG9mZnNldCBpbiBbMC4uLnNpemVdXHJcbiAgICAgICAgaWYgdmFsdWVBcnJheXNbc3RhcnRpbmdWYWx1ZStvZmZzZXRdLmxlbmd0aCA8IGVhY2hTaXplXHJcbiAgICAgICAgICBydW5Gb3VuZCA9IGZhbHNlXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICBpZiBydW5Gb3VuZFxyXG4gICAgICAgIHJ1biA9IFtdXHJcbiAgICAgICAgZm9yIG9mZnNldCBpbiBbMC4uLnNpemVdXHJcbiAgICAgICAgICBmb3IgZWFjaCBpbiBbMC4uLmVhY2hTaXplXVxyXG4gICAgICAgICAgICBydW4ucHVzaCh2YWx1ZUFycmF5c1tzdGFydGluZ1ZhbHVlK29mZnNldF0ucG9wKCkucmF3KVxyXG4gICAgICAgIHJ1bnMucHVzaCBydW5cclxuXHJcbiAgICBsZWZ0b3ZlcnMgPSBbXVxyXG4gICAgZm9yIHZhbHVlQXJyYXkgaW4gdmFsdWVBcnJheXNcclxuICAgICAgZm9yIGNhcmQgaW4gdmFsdWVBcnJheVxyXG4gICAgICAgIGxlZnRvdmVycy5wdXNoIGNhcmQucmF3XHJcblxyXG4gICAgcmV0dXJuIFtydW5zLCBsZWZ0b3ZlcnNdXHJcblxyXG4gIGFpQ2FsY1J1bnM6IChoYW5kLCBwbGF5cywgc21hbGxSdW5zKSAtPlxyXG4gICAgaWYgc21hbGxSdW5zXHJcbiAgICAgIHN0YXJ0U2l6ZSA9IDNcclxuICAgICAgZW5kU2l6ZSA9IDEyXHJcbiAgICAgIGJ5QW1vdW50ID0gMVxyXG4gICAgZWxzZVxyXG4gICAgICBzdGFydFNpemUgPSAxMlxyXG4gICAgICBlbmRTaXplID0gM1xyXG4gICAgICBieUFtb3VudCA9IC0xXHJcbiAgICBmb3IgcnVuU2l6ZSBpbiBbc3RhcnRTaXplLi5lbmRTaXplXSBieSBieUFtb3VudFxyXG4gICAgICBbcnVucywgbGVmdG92ZXJzXSA9IEBhaUZpbmRSdW5zKGhhbmQsIDEsIHJ1blNpemUpXHJcbiAgICAgIGlmIHJ1bnMubGVuZ3RoID4gMFxyXG4gICAgICAgIGtleSA9IFwicnVuI3tydW5TaXplfVwiXHJcbiAgICAgICAgcGxheXNba2V5XSA9IHJ1bnNcclxuICAgICAgaGFuZCA9IGxlZnRvdmVyc1xyXG5cclxuICAgIHJldHVybiBoYW5kXHJcblxyXG4gIGFpQ2FsY1JvcHM6IChoYW5kLCBwbGF5cykgLT5cclxuICAgIHN0YXJ0U2l6ZSA9IDNcclxuICAgIGVuZFNpemUgPSA2XHJcbiAgICBmb3IgcnVuU2l6ZSBpbiBbc3RhcnRTaXplLi5lbmRTaXplXVxyXG4gICAgICBbcm9wcywgbGVmdG92ZXJzXSA9IEBhaUZpbmRSdW5zKGhhbmQsIDIsIHJ1blNpemUpXHJcbiAgICAgIGlmIHJvcHMubGVuZ3RoID4gMFxyXG4gICAgICAgIGtleSA9IFwicm9wI3tydW5TaXplfVwiXHJcbiAgICAgICAgcGxheXNba2V5XSA9IHJvcHNcclxuICAgICAgaGFuZCA9IGxlZnRvdmVyc1xyXG5cclxuICAgIHJldHVybiBoYW5kXHJcblxyXG4gIGFpQ2FsY1BsYXlzOiAoaGFuZCwgc3RyYXRlZ3kgPSB7fSkgLT5cclxuICAgIHBsYXlzID0ge31cclxuXHJcbiAgICAjIFdlIGFsd2F5cyB3YW50IHRvIHVzZSByb3BzIGlmIHdlIGhhdmUgb25lXHJcbiAgICBpZiBzdHJhdGVneS5zZWVzUm9wc1xyXG4gICAgICBoYW5kID0gQGFpQ2FsY1JvcHMoaGFuZCwgcGxheXMpXHJcblxyXG4gICAgaWYgc3RyYXRlZ3kucHJlZmVyc1J1bnNcclxuICAgICAgaGFuZCA9IEBhaUNhbGNSdW5zKGhhbmQsIHBsYXlzLCBzdHJhdGVneS5zbWFsbFJ1bnMpXHJcbiAgICAgIGhhbmQgPSBAYWxDYWxjS2luZHMoaGFuZCwgcGxheXMsIHN0cmF0ZWd5Lm1hdGNoMnMpXHJcbiAgICBlbHNlXHJcbiAgICAgIGhhbmQgPSBAYWxDYWxjS2luZHMoaGFuZCwgcGxheXMsIHN0cmF0ZWd5Lm1hdGNoMnMpXHJcbiAgICAgIGhhbmQgPSBAYWlDYWxjUnVucyhoYW5kLCBwbGF5cywgc3RyYXRlZ3kuc21hbGxSdW5zKVxyXG5cclxuICAgIGtpbmQxID0gaGFuZC5tYXAgKHYpIC0+IFt2XVxyXG4gICAgaWYga2luZDEubGVuZ3RoID4gMFxyXG4gICAgICBwbGF5cy5raW5kMSA9IGtpbmQxXHJcbiAgICByZXR1cm4gcGxheXNcclxuXHJcbiAgbnVtYmVyT2ZTaW5nbGVzOiAocGxheXMpIC0+XHJcbiAgICBpZiBub3QgcGxheXMua2luZDE/XHJcbiAgICAgIHJldHVybiAwXHJcbiAgICByZXR1cm4gcGxheXMua2luZDEubGVuZ3RoXHJcblxyXG4gIGFpQ2FsY0Jlc3RQbGF5czogKGhhbmQpIC0+XHJcbiAgICBiZXN0UGxheXMgPSBudWxsXHJcbiAgICBmb3IgYml0cyBpbiBbMC4uLjE2XVxyXG4gICAgICBzdHJhdGVneSA9XHJcbiAgICAgICAgc21hbGxSdW5zOiAoYml0cyAmIDEpID09IDFcclxuICAgICAgICBwcmVmZXJzUnVuczogKGJpdHMgJiAyKSA9PSAyXHJcbiAgICAgICAgbWF0Y2gyczogKGJpdHMgJiA0KSA9PSA0XHJcbiAgICAgICAgc2Vlc1JvcHM6IChiaXRzICYgOCkgPT0gOFxyXG4gICAgICBwbGF5cyA9IEBhaUNhbGNQbGF5cyhoYW5kLCBzdHJhdGVneSlcclxuICAgICAgaWYgYmVzdFBsYXlzID09IG51bGxcclxuICAgICAgICBiZXN0UGxheXMgPSBwbGF5c1xyXG4gICAgICBlbHNlXHJcbiAgICAgICAgaWYgQG51bWJlck9mU2luZ2xlcyhwbGF5cykgPCBAbnVtYmVyT2ZTaW5nbGVzKGJlc3RQbGF5cylcclxuICAgICAgICAgIGJlc3RQbGF5cyA9IHBsYXlzXHJcbiAgICByZXR1cm4gYmVzdFBsYXlzXHJcblxyXG4gIHByZXR0eVBsYXlzOiAocGxheXMsIGV4dHJhUHJldHR5ID0gZmFsc2UpIC0+XHJcbiAgICBwcmV0dHkgPSB7fVxyXG4gICAgZm9yIHR5cGUsIGFyciBvZiBwbGF5c1xyXG4gICAgICBwcmV0dHlbdHlwZV0gPSBbXVxyXG4gICAgICBmb3IgcGxheSBpbiBhcnJcclxuICAgICAgICBuYW1lcyA9IFtdXHJcbiAgICAgICAgZm9yIHJhdyBpbiBwbGF5XHJcbiAgICAgICAgICBjYXJkID0gbmV3IENhcmQocmF3KVxyXG4gICAgICAgICAgbmFtZXMucHVzaChjYXJkLm5hbWUpXHJcbiAgICAgICAgcHJldHR5W3R5cGVdLnB1c2gobmFtZXMpXHJcbiAgICBpZiBleHRyYVByZXR0eVxyXG4gICAgICBzID0gXCJcIlxyXG4gICAgICBmb3IgdHlwZU5hbWUsIHRocm93cyBvZiBwcmV0dHlcclxuICAgICAgICBzICs9IFwiICAgICAgKiAje3BsYXlUeXBlVG9TdHJpbmcodHlwZU5hbWUpfTpcXG5cIlxyXG4gICAgICAgIGlmIHR5cGVOYW1lID09ICdraW5kMSdcclxuICAgICAgICAgIHMgKz0gXCIgICAgICAgICogI3t0aHJvd3MubWFwKCh2KSAtPiB2WzBdKS5qb2luKCcsJyl9XFxuXCJcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBmb3IgdCBpbiB0aHJvd3NcclxuICAgICAgICAgICAgcyArPSBcIiAgICAgICAgKiAje3Quam9pbignLCcpfVxcblwiXHJcbiAgICAgIHJldHVybiBzXHJcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocHJldHR5KVxyXG5cclxuICBoaWdoZXN0Q2FyZDogKHBsYXkpIC0+XHJcbiAgICBoaWdoZXN0ID0gMFxyXG4gICAgZm9yIHAgaW4gcGxheVxyXG4gICAgICBpZiBoaWdoZXN0IDwgcFxyXG4gICAgICAgIGhpZ2hlc3QgPSBwXHJcbiAgICByZXR1cm4gaGlnaGVzdFxyXG5cclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuIyBBSSBCcmFpbnNcclxuXHJcbiAgIyBCcmFpbnMgbXVzdCBoYXZlOlxyXG4gICMgKiBpZDogaW50ZXJuYWwgaWRlbnRpZmllciBmb3IgdGhlIGJyYWluXHJcbiAgIyAqIG5hbWU6IHByZXR0eSBuYW1lXHJcbiAgIyAqIHBsYXkoY3VycmVudFBsYXllcikgYXR0ZW1wdHMgdG8gcGxheSBhIGNhcmQgYnkgY2FsbGluZyBhaVBsYXkoKS4gU2hvdWxkIHJldHVybiB0cnVlIGlmIGl0IHN1Y2Nlc3NmdWxseSBwbGF5ZWQgYSBjYXJkIChhaVBsYXkoKSByZXR1cm5lZCB0cnVlKVxyXG4gIGJyYWluczpcclxuXHJcbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgIyBOb3JtYWw6IEludGVuZGVkIHRvIGJlIHVzZWQgYnkgbW9zdCBjaGFyYWN0ZXJzLlxyXG4gICAgIyAgICAgICAgIE5vdCB0b28gZHVtYiwgbm90IHRvbyBzbWFydC5cclxuICAgIG5vcm1hbDpcclxuICAgICAgaWQ6ICAgXCJub3JtYWxcIlxyXG4gICAgICBuYW1lOiBcIk5vcm1hbFwiXHJcblxyXG4gICAgICAjIG5vcm1hbFxyXG4gICAgICBwbGF5OiAoY3VycmVudFBsYXllciwgY3VycmVudFBsYXksIGV2ZXJ5b25lUGFzc2VkKSAtPlxyXG4gICAgICAgIGlmIGN1cnJlbnRQbGF5ZXIucGFzc1xyXG4gICAgICAgICAgQGFpTG9nKFwiYWxyZWFkeSBwYXNzZWQsIGdvaW5nIHRvIGtlZXAgcGFzc2luZ1wiKVxyXG4gICAgICAgICAgcmV0dXJuIEBhaVBhc3MoY3VycmVudFBsYXllcilcclxuXHJcbiAgICAgICAgcGxheXMgPSBAYWlDYWxjQmVzdFBsYXlzKGN1cnJlbnRQbGF5ZXIuaGFuZClcclxuICAgICAgICBAYWlMb2coXCJiZXN0IHBsYXlzOiAje0BwcmV0dHlQbGF5cyhwbGF5cyl9XCIpXHJcblxyXG4gICAgICAgIGlmIGN1cnJlbnRQbGF5IGFuZCBub3QgZXZlcnlvbmVQYXNzZWRcclxuICAgICAgICAgIGlmIHBsYXlzW2N1cnJlbnRQbGF5LnR5cGVdPyBhbmQgKHBsYXlzW2N1cnJlbnRQbGF5LnR5cGVdLmxlbmd0aCA+IDApXHJcbiAgICAgICAgICAgIGZvciBwbGF5IGluIHBsYXlzW2N1cnJlbnRQbGF5LnR5cGVdXHJcbiAgICAgICAgICAgICAgaWYgQGhpZ2hlc3RDYXJkKHBsYXkpID4gY3VycmVudFBsYXkuaGlnaFxyXG4gICAgICAgICAgICAgICAgaWYgQGFpUGxheShjdXJyZW50UGxheWVyLCBwbGF5KSA9PSBPS1xyXG4gICAgICAgICAgICAgICAgICByZXR1cm4gT0tcclxuICAgICAgICAgICAgQGFpTG9nKFwiSSBndWVzcyBJIGNhbid0IGFjdHVhbGx5IGJlYXQgdGhpcywgcGFzc2luZ1wiKVxyXG4gICAgICAgICAgICByZXR1cm4gQGFpUGFzcyhjdXJyZW50UGxheWVyKVxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBAYWlMb2coXCJJIGRvbid0IGhhdmUgdGhhdCBwbGF5LCBwYXNzaW5nXCIpXHJcbiAgICAgICAgICAgIHJldHVybiBAYWlQYXNzKGN1cnJlbnRQbGF5ZXIpXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgIyBubyBjdXJyZW50IHBsYXksIHRocm93IHRoZSBmaXJzdCBjYXJkXHJcbiAgICAgICAgICBAYWlMb2coXCJJIGNhbiBkbyBhbnl0aGluZywgdGhyb3dpbmcgYSByYW5kb20gcGxheVwiKVxyXG4gICAgICAgICAgcGxheVR5cGVzID0gT2JqZWN0LmtleXMocGxheXMpXHJcbiAgICAgICAgICBwbGF5VHlwZUluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcGxheVR5cGVzLmxlbmd0aClcclxuICAgICAgICAgIGlmIEBhaVBsYXkoY3VycmVudFBsYXllciwgcGxheXNbcGxheVR5cGVzW3BsYXlUeXBlSW5kZXhdXVswXSkgPT0gT0tcclxuICAgICAgICAgICAgcmV0dXJuIE9LXHJcblxyXG4gICAgICAgICMgZmluZCB0aGUgZmlyc3QgY2FyZCB0aGF0IGJlYXRzIHRoZSBjdXJyZW50UGxheSdzIGhpZ2hcclxuICAgICAgICBmb3IgcmF3Q2FyZCBpbiBjdXJyZW50UGxheWVyLmhhbmRcclxuICAgICAgICAgIGlmIHJhd0NhcmQgPiBjdXJyZW50UGxheS5oaWdoXHJcbiAgICAgICAgICAgIEBhaUxvZyhcImZvdW5kIHNtYWxsZXN0IHNpbmdsZSAoI3tyYXdDYXJkfSksIHBsYXlpbmdcIilcclxuICAgICAgICAgICAgaWYgQGFpUGxheShjdXJyZW50UGxheWVyLCBbcmF3Q2FyZF0pID09IE9LXHJcbiAgICAgICAgICAgICAgcmV0dXJuIE9LXHJcbiAgICAgICAgICAgIGJyZWFrXHJcblxyXG4gICAgICAgIEBhaUxvZyhcIm5vdGhpbmcgZWxzZSB0byBkbywgcGFzc2luZ1wiKVxyXG4gICAgICAgIHJldHVybiBAYWlQYXNzKGN1cnJlbnRQbGF5ZXIpXHJcblxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIERlYnVnIGNvZGVcclxuXHJcbmRlYnVnID0gLT5cclxuICB0aGlyID0gbmV3IFRoaXJ0ZWVuKClcclxuICBmdWxseVBsYXllZCA9IDBcclxuICB0b3RhbEF0dGVtcHRzID0gMTAwXHJcblxyXG4gIGZvciBhdHRlbXB0IGluIFswLi4udG90YWxBdHRlbXB0c11cclxuICAgIGRlY2sgPSBuZXcgU2h1ZmZsZWREZWNrKClcclxuICAgIGhhbmQgPSBbXVxyXG4gICAgZm9yIGogaW4gWzAuLi4xM11cclxuICAgICAgcmF3ID0gZGVjay5jYXJkcy5zaGlmdCgpXHJcbiAgICAgIGhhbmQucHVzaChyYXcpXHJcbiAgICAjIGhhbmQgPSBbNTEsNTAsNDksNDgsNDcsNDYsNDUsNDQsNDMsNDIsNDEsNDAsMzldXHJcbiAgICAjIGhhbmQgPSBbMCwxLDIsMyw0LDUsNiw3LDgsOSwxMCwxMSwxMl1cclxuICAgIGhhbmQuc29ydCAoYSxiKSAtPiByZXR1cm4gYSAtIGJcclxuXHJcbiAgICBjb25zb2xlLmxvZyhcIi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVwiKVxyXG4gICAgY29uc29sZS5sb2coXCJIYW5kICN7YXR0ZW1wdCsxfTogI3tjYXJkc1RvU3RyaW5nKGhhbmQpfVwiKVxyXG4gICAgY29uc29sZS5sb2coXCJcIilcclxuXHJcbiAgICBmb3VuZEZ1bGx5UGxheWVkID0gZmFsc2VcclxuICAgIGZvciBiaXRzIGluIFswLi4uMTZdXHJcbiAgICAgIHN0cmF0ZWd5ID1cclxuICAgICAgICBzbWFsbFJ1bnM6IChiaXRzICYgMSkgPT0gMVxyXG4gICAgICAgIHByZWZlcnNSdW5zOiAoYml0cyAmIDIpID09IDJcclxuICAgICAgICBtYXRjaDJzOiAoYml0cyAmIDQpID09IDRcclxuICAgICAgICBzZWVzUm9wczogKGJpdHMgJiA4KSA9PSA4XHJcbiAgICAgIHBsYXlzID0gdGhpci5haUNhbGNQbGF5cyhoYW5kLCBzdHJhdGVneSlcclxuXHJcbiAgICAgIGNvbnNvbGUubG9nKFwiICAgKiBTdHJhdGVneTogI3tKU09OLnN0cmluZ2lmeShzdHJhdGVneSl9XCIpXHJcbiAgICAgIGNvbnNvbGUubG9nKHRoaXIucHJldHR5UGxheXMocGxheXMsIHRydWUpKVxyXG5cclxuICAgICAgaWYgbm90IHBsYXlzLmtpbmQxXHJcbiAgICAgICAgZm91bmRGdWxseVBsYXllZCA9IHRydWVcclxuXHJcbiAgICBpZiBmb3VuZEZ1bGx5UGxheWVkXHJcbiAgICAgIGZ1bGx5UGxheWVkICs9IDFcclxuXHJcbiAgY29uc29sZS5sb2cgXCJmdWxseVBsYXllZDogI3tmdWxseVBsYXllZH0gLyAje3RvdGFsQXR0ZW1wdHN9XCJcclxuXHJcbiMgZGVidWcoKVxyXG5cclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuIyBFeHBvcnRzXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9XHJcbiAgQ2FyZDogQ2FyZFxyXG4gIFRoaXJ0ZWVuOiBUaGlydGVlblxyXG4gIE9LOiBPS1xyXG4gIGFpQ2hhcmFjdGVyczogYWlDaGFyYWN0ZXJzXHJcbiIsIm1vZHVsZS5leHBvcnRzID1cclxuICBkYXJrZm9yZXN0OlxyXG4gICAgaGVpZ2h0OiA3MlxyXG4gICAgZ2x5cGhzOlxyXG4gICAgICAnOTcnIDogeyB4OiAgIDgsIHk6ICAgOCwgd2lkdGg6ICAzNCwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzk4JyA6IHsgeDogICA4LCB5OiAgNTgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICc5OScgOiB7IHg6ICA1MCwgeTogICA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnMTAwJzogeyB4OiAgIDgsIHk6IDExOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzEwMSc6IHsgeDogICA4LCB5OiAxNzgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICcxMDInOiB7IHg6ICAgOCwgeTogMjI4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzMgfVxyXG4gICAgICAnMTAzJzogeyB4OiAgIDgsIHk6IDI3OCwgd2lkdGg6ICAzNiwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM1IH1cclxuICAgICAgJzEwNCc6IHsgeDogICA4LCB5OiAzMjgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICcxMDUnOiB7IHg6ICAgOCwgeTogMzc4LCB3aWR0aDogIDEyLCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMTEgfVxyXG4gICAgICAnMTA2JzogeyB4OiAgIDgsIHk6IDQyOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDEsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzEwNyc6IHsgeDogIDI4LCB5OiAzNzgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQxLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICcxMDgnOiB7IHg6ICA1MSwgeTogMzI4LCB3aWR0aDogIDM0LCBoZWlnaHQ6ICA0MSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzMgfVxyXG4gICAgICAnMTA5JzogeyB4OiAgNTEsIHk6IDQyNywgd2lkdGg6ICAzOCwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM3IH1cclxuICAgICAgJzExMCc6IHsgeDogIDcxLCB5OiAzNzcsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICcxMTEnOiB7IHg6ICA5NywgeTogNDI3LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnMTEyJzogeyB4OiAgNTEsIHk6ICA1OCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzExMyc6IHsgeDogIDUxLCB5OiAxMDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQ1LCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICcxMTQnOiB7IHg6ICA5MywgeTogICA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzUgfVxyXG4gICAgICAnMTE1JzogeyB4OiAgNTEsIHk6IDE2MSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM1IH1cclxuICAgICAgJzExNic6IHsgeDogIDUxLCB5OiAyMTEsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzMyB9XHJcbiAgICAgICcxMTcnOiB7IHg6ICA1MiwgeTogMjYxLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnMTE4JzogeyB4OiAgOTMsIHk6IDMxMSwgd2lkdGg6ICAzNCwgaGVpZ2h0OiAgNDEsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDMyIH1cclxuICAgICAgJzExOSc6IHsgeDogMTE0LCB5OiAzNjAsIHdpZHRoOiAgMzgsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzOCB9XHJcbiAgICAgICcxMjAnOiB7IHg6IDE0MCwgeTogNDEwLCB3aWR0aDogIDM2LCBoZWlnaHQ6ICA0MSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzcgfVxyXG4gICAgICAnMTIxJzogeyB4OiAxNDAsIHk6IDQ1OSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDEsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzEyMic6IHsgeDogMTgzLCB5OiA0NTksIHdpZHRoOiAgMzYsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNSB9XHJcbiAgICAgICc2NScgOiB7IHg6ICA5NCwgeTogIDU4LCB3aWR0aDogIDM0LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxyXG4gICAgICAnNjYnIDogeyB4OiAgOTQsIHk6IDExOSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM3IH1cclxuICAgICAgJzY3JyA6IHsgeDogIDk0LCB5OiAxODAsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XHJcbiAgICAgICc2OCcgOiB7IHg6ICA5NSwgeTogMjQxLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzcgfVxyXG4gICAgICAnNjknIDogeyB4OiAxMzYsIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cclxuICAgICAgJzcwJyA6IHsgeDogMTM3LCB5OiAgNjksIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICc3MScgOiB7IHg6IDE3OSwgeTogICA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxyXG4gICAgICAnNzInIDogeyB4OiAxMzcsIHk6IDEzMCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cclxuICAgICAgJzczJyA6IHsgeDogMTM4LCB5OiAxOTEsIHdpZHRoOiAgMTIsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAxMyB9XHJcbiAgICAgICc3NCcgOiB7IHg6IDEzOCwgeTogMjUyLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxyXG4gICAgICAnNzUnIDogeyB4OiAxNTgsIHk6IDE5MSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cclxuICAgICAgJzc2JyA6IHsgeDogMTYwLCB5OiAzMTMsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICc3NycgOiB7IHg6IDE4MSwgeTogMjUxLCB3aWR0aDogIDM4LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzkgfVxyXG4gICAgICAnNzgnIDogeyB4OiAxODQsIHk6IDM3NCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM1IH1cclxuICAgICAgJzc5JyA6IHsgeDogMjAzLCB5OiAzMTIsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNSB9XHJcbiAgICAgICc4MCcgOiB7IHg6IDE4MCwgeTogIDY5LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnODEnIDogeyB4OiAyMDEsIHk6IDEzMCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTYsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM1IH1cclxuICAgICAgJzgyJyA6IHsgeDogMjIyLCB5OiAgIDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XHJcbiAgICAgICc4MycgOiB7IHg6IDIyMywgeTogIDY5LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxyXG4gICAgICAnODQnIDogeyB4OiAyNjUsIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDMzIH1cclxuICAgICAgJzg1JyA6IHsgeDogMjI3LCB5OiAxOTQsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNSB9XHJcbiAgICAgICc4NicgOiB7IHg6IDI0NCwgeTogMTMwLCB3aWR0aDogIDQxLCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMTksIHhhZHZhbmNlOiAgMzkgfVxyXG4gICAgICAnODcnIDogeyB4OiAyNjYsIHk6ICA2OSwgd2lkdGg6ICAzOCwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM3IH1cclxuICAgICAgJzg4JyA6IHsgeDogMzA4LCB5OiAgIDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAxOSwgeGFkdmFuY2U6ICAzNSB9XHJcbiAgICAgICc4OScgOiB7IHg6IDIyNywgeTogMzczLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMTksIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnOTAnIDogeyB4OiAyMjcsIHk6IDQzMywgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM1IH1cclxuICAgICAgJzMzJyA6IHsgeDogMjQ2LCB5OiAyNTUsIHdpZHRoOiAgMTQsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAxMSB9XHJcbiAgICAgICc1OScgOiB7IHg6IDE4MCwgeTogMTMwLCB3aWR0aDogIDEzLCBoZWlnaHQ6ICAzNywgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNTYsIHhhZHZhbmNlOiAgMTMgfVxyXG4gICAgICAnMzcnIDogeyB4OiAgOTUsIHk6IDMwMiwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cclxuICAgICAgJzU4JyA6IHsgeDogMTYwLCB5OiAzNzQsIHdpZHRoOiAgMTMsIGhlaWdodDogIDIzLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA1MCwgeGFkdmFuY2U6ICAxMyB9XHJcbiAgICAgICc2MycgOiB7IHg6IDI2OCwgeTogMjU1LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzMgfVxyXG4gICAgICAnNDInIDogeyB4OiAxMDMsIHk6IDMwMiwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cclxuICAgICAgJzQwJyA6IHsgeDogMjcwLCB5OiAxOTAsIHdpZHRoOiAgMjMsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAyMSB9XHJcbiAgICAgICc0MScgOiB7IHg6IDI5MywgeTogMTMwLCB3aWR0aDogIDIzLCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMjEgfVxyXG4gICAgICAnOTUnIDogeyB4OiAxMTEsIHk6IDMwMiwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cclxuICAgICAgJzQzJyA6IHsgeDogMjQ2LCB5OiAzMTYsIHdpZHRoOiAgMzUsIGhlaWdodDogIDM0LCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAzOSwgeGFkdmFuY2U6ICAzMiB9XHJcbiAgICAgICc0NScgOiB7IHg6IDE4NCwgeTogNDM1LCB3aWR0aDogIDI2LCBoZWlnaHQ6ICAxMSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgNDQsIHhhZHZhbmNlOiAgMjUgfVxyXG4gICAgICAnNjEnIDogeyB4OiAzMTIsIHk6ICA2OCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgMzAsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDQyLCB4YWR2YW5jZTogIDMzIH1cclxuICAgICAgJzQ2JyA6IHsgeDogMTM1LCB5OiAzMTMsIHdpZHRoOiAgMTQsIGhlaWdodDogIDExLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA2MSwgeGFkdmFuY2U6ICAxNCB9XHJcbiAgICAgICc0NCcgOiB7IHg6IDIyNywgeTogMjU1LCB3aWR0aDogIDEwLCBoZWlnaHQ6ICAyMSwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNjgsIHhhZHZhbmNlOiAgMTEgfVxyXG4gICAgICAnNDcnIDogeyB4OiAzNTEsIHk6ICAgOCwgd2lkdGg6ICAyOCwgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDE5LCB4YWR2YW5jZTogIDI2IH1cclxuICAgICAgJzEyNCc6IHsgeDogMTE5LCB5OiAzMDIsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XHJcbiAgICAgICczNCcgOiB7IHg6IDEyNywgeTogMzAyLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxyXG4gICAgICAnMzknIDogeyB4OiAyMDEsIHk6IDE5NCwgd2lkdGg6ICAxOCwgaGVpZ2h0OiAgMTksIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogICAwLCB4YWR2YW5jZTogIDIxIH1cclxuICAgICAgJzY0JyA6IHsgeDogMjE4LCB5OiA0MzUsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XHJcbiAgICAgICczNScgOiB7IHg6IDIxOCwgeTogNDQzLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxyXG4gICAgICAnMzYnIDogeyB4OiAzMDEsIHk6IDE5MCwgd2lkdGg6ICAzMiwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDIyLCB4YWR2YW5jZTogIDI5IH1cclxuICAgICAgJzk0JyA6IHsgeDogMjE4LCB5OiA0NTEsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XHJcbiAgICAgICczOCcgOiB7IHg6IDI0NiwgeTogMzU4LCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxyXG4gICAgICAnMTIzJzogeyB4OiAzMjQsIHk6IDEwNiwgd2lkdGg6ICAyNywgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDI2IH1cclxuICAgICAgJzEyNSc6IHsgeDogMjcwLCB5OiAzNTgsIHdpZHRoOiAgMjcsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAyNyB9XHJcbiAgICAgICc5MScgOiB7IHg6IDI3MCwgeTogNDE4LCB3aWR0aDogIDIyLCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMjEgfVxyXG4gICAgICAnOTMnIDogeyB4OiAzMDAsIHk6IDQxOCwgd2lkdGg6ICAyMiwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDIwIH1cclxuICAgICAgJzQ4JyA6IHsgeDogMzA1LCB5OiAzMTYsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XHJcbiAgICAgICc0OScgOiB7IHg6IDMxMSwgeTogMjUxLCB3aWR0aDogIDM0LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxyXG4gICAgICAnNTAnIDogeyB4OiAzNDEsIHk6IDE2Niwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM3IH1cclxuICAgICAgJzUxJyA6IHsgeDogMzU5LCB5OiAgNjgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XHJcbiAgICAgICc1MicgOiB7IHg6IDMzMCwgeTogMzc3LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxyXG4gICAgICAnNTMnIDogeyB4OiAzNDgsIHk6IDMxMiwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM3IH1cclxuICAgICAgJzU0JyA6IHsgeDogMzMwLCB5OiA0MzgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XHJcbiAgICAgICc1NScgOiB7IHg6IDM1MywgeTogMjI3LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnNTYnIDogeyB4OiAzODQsIHk6IDEyOSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cclxuICAgICAgJzU3JyA6IHsgeDogNDAyLCB5OiAgIDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XHJcbiAgICAgICczMicgOiB7IHg6ICAgMCwgeTogICAwLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMjIgfVxyXG4iLCIjIFRoaXMgZmlsZSBwcm92aWRlcyB0aGUgcmVuZGVyaW5nIGVuZ2luZSBmb3IgdGhlIHdlYiB2ZXJzaW9uLiBOb25lIG9mIHRoaXMgY29kZSBpcyBpbmNsdWRlZCBpbiB0aGUgSmF2YSB2ZXJzaW9uLlxyXG5cclxuY29uc29sZS5sb2cgJ3dlYiBzdGFydHVwJ1xyXG5cclxuR2FtZSA9IHJlcXVpcmUgJy4vR2FtZSdcclxuXHJcbiMgdGFrZW4gZnJvbSBodHRwOiNzdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNTYyMzgzOC9yZ2ItdG8taGV4LWFuZC1oZXgtdG8tcmdiXHJcbmNvbXBvbmVudFRvSGV4ID0gKGMpIC0+XHJcbiAgaGV4ID0gTWF0aC5mbG9vcihjICogMjU1KS50b1N0cmluZygxNilcclxuICByZXR1cm4gaWYgaGV4Lmxlbmd0aCA9PSAxIHRoZW4gXCIwXCIgKyBoZXggZWxzZSBoZXhcclxucmdiVG9IZXggPSAociwgZywgYikgLT5cclxuICByZXR1cm4gXCIjXCIgKyBjb21wb25lbnRUb0hleChyKSArIGNvbXBvbmVudFRvSGV4KGcpICsgY29tcG9uZW50VG9IZXgoYilcclxuXHJcblNBVkVfVElNRVJfTVMgPSAzMDAwXHJcblxyXG5jbGFzcyBOYXRpdmVBcHBcclxuICBjb25zdHJ1Y3RvcjogKEBzY3JlZW4sIEB3aWR0aCwgQGhlaWdodCkgLT5cclxuICAgIEB0aW50ZWRUZXh0dXJlQ2FjaGUgPSBbXVxyXG4gICAgQGxhc3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcclxuICAgIEBsYXN0SW50ZXJhY3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcclxuICAgIEBoZWFyZE9uZVRvdWNoID0gZmFsc2VcclxuICAgIEB0b3VjaE1vdXNlID0gbnVsbFxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNlZG93bicsICBAb25Nb3VzZURvd24uYmluZCh0aGlzKSwgZmFsc2VcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdtb3VzZW1vdmUnLCAgQG9uTW91c2VNb3ZlLmJpbmQodGhpcyksIGZhbHNlXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2V1cCcsICAgIEBvbk1vdXNlVXAuYmluZCh0aGlzKSwgZmFsc2VcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICd0b3VjaHN0YXJ0JywgQG9uVG91Y2hTdGFydC5iaW5kKHRoaXMpLCBmYWxzZVxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ3RvdWNobW92ZScsICBAb25Ub3VjaE1vdmUuYmluZCh0aGlzKSwgZmFsc2VcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICd0b3VjaGVuZCcsICAgQG9uVG91Y2hFbmQuYmluZCh0aGlzKSwgZmFsc2VcclxuICAgIEBjb250ZXh0ID0gQHNjcmVlbi5nZXRDb250ZXh0KFwiMmRcIilcclxuICAgIEB0ZXh0dXJlcyA9IFtcclxuICAgICAgIyBhbGwgY2FyZCBhcnRcclxuICAgICAgXCIuLi9pbWFnZXMvY2FyZHMucG5nXCJcclxuICAgICAgIyBmb250c1xyXG4gICAgICBcIi4uL2ltYWdlcy9kYXJrZm9yZXN0LnBuZ1wiXHJcbiAgICAgICMgY2hhcmFjdGVycyAvIG90aGVyXHJcbiAgICAgIFwiLi4vaW1hZ2VzL2NoYXJzLnBuZ1wiXHJcbiAgICAgICMgaGVscFxyXG4gICAgICBcIi4uL2ltYWdlcy9ob3d0bzEucG5nXCJcclxuICAgICAgXCIuLi9pbWFnZXMvaG93dG8yLnBuZ1wiXHJcbiAgICAgIFwiLi4vaW1hZ2VzL2hvd3RvMy5wbmdcIlxyXG4gICAgXVxyXG5cclxuICAgIEBnYW1lID0gbmV3IEdhbWUodGhpcywgQHdpZHRoLCBAaGVpZ2h0KVxyXG5cclxuICAgIGlmIHR5cGVvZiBTdG9yYWdlICE9IFwidW5kZWZpbmVkXCJcclxuICAgICAgc3RhdGUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSBcInN0YXRlXCJcclxuICAgICAgaWYgc3RhdGVcclxuICAgICAgICAjIGNvbnNvbGUubG9nIFwibG9hZGluZyBzdGF0ZTogI3tzdGF0ZX1cIlxyXG4gICAgICAgIEBnYW1lLmxvYWQgc3RhdGVcclxuXHJcbiAgICBAcGVuZGluZ0ltYWdlcyA9IDBcclxuICAgIGxvYWRlZFRleHR1cmVzID0gW11cclxuICAgIGZvciBpbWFnZVVybCBpbiBAdGV4dHVyZXNcclxuICAgICAgQHBlbmRpbmdJbWFnZXMrK1xyXG4gICAgICBjb25zb2xlLmxvZyBcImxvYWRpbmcgaW1hZ2UgI3tAcGVuZGluZ0ltYWdlc306ICN7aW1hZ2VVcmx9XCJcclxuICAgICAgaW1nID0gbmV3IEltYWdlKClcclxuICAgICAgaW1nLm9ubG9hZCA9IEBvbkltYWdlTG9hZGVkLmJpbmQodGhpcylcclxuICAgICAgaW1nLnNyYyA9IGltYWdlVXJsXHJcbiAgICAgIGxvYWRlZFRleHR1cmVzLnB1c2ggaW1nXHJcbiAgICBAdGV4dHVyZXMgPSBsb2FkZWRUZXh0dXJlc1xyXG5cclxuICAgIEBzYXZlVGltZXIgPSBTQVZFX1RJTUVSX01TXHJcblxyXG4gIG9uSW1hZ2VMb2FkZWQ6IChpbmZvKSAtPlxyXG4gICAgQHBlbmRpbmdJbWFnZXMtLVxyXG4gICAgaWYgQHBlbmRpbmdJbWFnZXMgPT0gMFxyXG4gICAgICBjb25zb2xlLmxvZyAnQWxsIGltYWdlcyBsb2FkZWQuIEJlZ2lubmluZyByZW5kZXIgbG9vcC4nXHJcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9PiBAdXBkYXRlKClcclxuXHJcbiAgbG9nOiAocykgLT5cclxuICAgIGNvbnNvbGUubG9nIFwiTmF0aXZlQXBwLmxvZygpOiAje3N9XCJcclxuXHJcbiAgdXBkYXRlU2F2ZTogKGR0KSAtPlxyXG4gICAgcmV0dXJuIGlmIHR5cGVvZiBTdG9yYWdlID09IFwidW5kZWZpbmVkXCJcclxuICAgIEBzYXZlVGltZXIgLT0gZHRcclxuICAgIGlmIEBzYXZlVGltZXIgPD0gMFxyXG4gICAgICBAc2F2ZVRpbWVyID0gU0FWRV9USU1FUl9NU1xyXG4gICAgICBzdGF0ZSA9IEBnYW1lLnNhdmUoKVxyXG4gICAgICAjIGNvbnNvbGUubG9nIFwic2F2aW5nOiAje3N0YXRlfVwiXHJcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtIFwic3RhdGVcIiwgc3RhdGVcclxuXHJcbiAgZ2VuZXJhdGVUaW50SW1hZ2U6ICh0ZXh0dXJlSW5kZXgsIHJlZCwgZ3JlZW4sIGJsdWUpIC0+XHJcbiAgICBpbWcgPSBAdGV4dHVyZXNbdGV4dHVyZUluZGV4XVxyXG4gICAgYnVmZiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgXCJjYW52YXNcIlxyXG4gICAgYnVmZi53aWR0aCAgPSBpbWcud2lkdGhcclxuICAgIGJ1ZmYuaGVpZ2h0ID0gaW1nLmhlaWdodFxyXG5cclxuICAgIGN0eCA9IGJ1ZmYuZ2V0Q29udGV4dCBcIjJkXCJcclxuICAgIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnY29weSdcclxuICAgIGN0eC5kcmF3SW1hZ2UoaW1nLCAwLCAwKVxyXG4gICAgZmlsbENvbG9yID0gXCJyZ2IoI3tNYXRoLmZsb29yKHJlZCoyNTUpfSwgI3tNYXRoLmZsb29yKGdyZWVuKjI1NSl9LCAje01hdGguZmxvb3IoYmx1ZSoyNTUpfSlcIlxyXG4gICAgY3R4LmZpbGxTdHlsZSA9IGZpbGxDb2xvclxyXG4gICAgY29uc29sZS5sb2cgXCJmaWxsQ29sb3IgI3tmaWxsQ29sb3J9XCJcclxuICAgIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnbXVsdGlwbHknXHJcbiAgICBjdHguZmlsbFJlY3QoMCwgMCwgYnVmZi53aWR0aCwgYnVmZi5oZWlnaHQpXHJcbiAgICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2NvcHknXHJcbiAgICBjdHguZ2xvYmFsQWxwaGEgPSAxLjBcclxuICAgIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnZGVzdGluYXRpb24taW4nXHJcbiAgICBjdHguZHJhd0ltYWdlKGltZywgMCwgMClcclxuXHJcbiAgICBpbWdDb21wID0gbmV3IEltYWdlKClcclxuICAgIGltZ0NvbXAuc3JjID0gYnVmZi50b0RhdGFVUkwoKVxyXG4gICAgcmV0dXJuIGltZ0NvbXBcclxuXHJcbiAgZHJhd0ltYWdlOiAodGV4dHVyZUluZGV4LCBzcmNYLCBzcmNZLCBzcmNXLCBzcmNILCBkc3RYLCBkc3RZLCBkc3RXLCBkc3RILCByb3QsIGFuY2hvclgsIGFuY2hvclksIHIsIGcsIGIsIGEpIC0+XHJcbiAgICB0ZXh0dXJlID0gQHRleHR1cmVzW3RleHR1cmVJbmRleF1cclxuICAgIGlmIChyICE9IDEpIG9yIChnICE9IDEpIG9yIChiICE9IDEpXHJcbiAgICAgIHRpbnRlZFRleHR1cmVLZXkgPSBcIiN7dGV4dHVyZUluZGV4fS0je3J9LSN7Z30tI3tifVwiXHJcbiAgICAgIHRpbnRlZFRleHR1cmUgPSBAdGludGVkVGV4dHVyZUNhY2hlW3RpbnRlZFRleHR1cmVLZXldXHJcbiAgICAgIGlmIG5vdCB0aW50ZWRUZXh0dXJlXHJcbiAgICAgICAgdGludGVkVGV4dHVyZSA9IEBnZW5lcmF0ZVRpbnRJbWFnZSB0ZXh0dXJlSW5kZXgsIHIsIGcsIGJcclxuICAgICAgICBAdGludGVkVGV4dHVyZUNhY2hlW3RpbnRlZFRleHR1cmVLZXldID0gdGludGVkVGV4dHVyZVxyXG4gICAgICAgICMgY29uc29sZS5sb2cgXCJnZW5lcmF0ZWQgY2FjaGVkIHRleHR1cmUgI3t0aW50ZWRUZXh0dXJlS2V5fVwiXHJcbiAgICAgIHRleHR1cmUgPSB0aW50ZWRUZXh0dXJlXHJcblxyXG4gICAgQGNvbnRleHQuc2F2ZSgpXHJcbiAgICBAY29udGV4dC50cmFuc2xhdGUgZHN0WCwgZHN0WVxyXG4gICAgQGNvbnRleHQucm90YXRlIHJvdCAjICogMy4xNDE1OTIgLyAxODAuMFxyXG4gICAgYW5jaG9yT2Zmc2V0WCA9IC0xICogYW5jaG9yWCAqIGRzdFdcclxuICAgIGFuY2hvck9mZnNldFkgPSAtMSAqIGFuY2hvclkgKiBkc3RIXHJcbiAgICBAY29udGV4dC50cmFuc2xhdGUgYW5jaG9yT2Zmc2V0WCwgYW5jaG9yT2Zmc2V0WVxyXG4gICAgQGNvbnRleHQuZ2xvYmFsQWxwaGEgPSBhXHJcbiAgICBAY29udGV4dC5kcmF3SW1hZ2UodGV4dHVyZSwgc3JjWCwgc3JjWSwgc3JjVywgc3JjSCwgMCwgMCwgZHN0VywgZHN0SClcclxuICAgIEBjb250ZXh0LnJlc3RvcmUoKVxyXG5cclxuICB1cGRhdGU6IC0+XHJcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPT4gQHVwZGF0ZSgpXHJcblxyXG4gICAgbm93ID0gbmV3IERhdGUoKS5nZXRUaW1lKClcclxuICAgIGR0ID0gbm93IC0gQGxhc3RUaW1lXHJcblxyXG4gICAgdGltZVNpbmNlSW50ZXJhY3QgPSBub3cgLSBAbGFzdEludGVyYWN0VGltZVxyXG4gICAgaWYgdGltZVNpbmNlSW50ZXJhY3QgPiA1MDAwXHJcbiAgICAgIGdvYWxGUFMgPSA1ICMgY2FsbSBkb3duLCBub2JvZHkgaXMgZG9pbmcgYW55dGhpbmcgZm9yIDUgc2Vjb25kc1xyXG4gICAgZWxzZVxyXG4gICAgICBnb2FsRlBTID0gMjAwICMgYXMgZmFzdCBhcyBwb3NzaWJsZVxyXG4gICAgaWYgQGxhc3RHb2FsRlBTICE9IGdvYWxGUFNcclxuICAgICAgY29uc29sZS5sb2cgXCJzd2l0Y2hpbmcgdG8gI3tnb2FsRlBTfSBGUFNcIlxyXG4gICAgICBAbGFzdEdvYWxGUFMgPSBnb2FsRlBTXHJcblxyXG4gICAgZnBzSW50ZXJ2YWwgPSAxMDAwIC8gZ29hbEZQU1xyXG4gICAgaWYgZHQgPCBmcHNJbnRlcnZhbFxyXG4gICAgICByZXR1cm5cclxuICAgIEBsYXN0VGltZSA9IG5vd1xyXG5cclxuICAgIEBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBAd2lkdGgsIEBoZWlnaHQpXHJcbiAgICBAZ2FtZS51cGRhdGUoZHQpXHJcbiAgICByZW5kZXJDb21tYW5kcyA9IEBnYW1lLnJlbmRlcigpXHJcblxyXG4gICAgaSA9IDBcclxuICAgIG4gPSByZW5kZXJDb21tYW5kcy5sZW5ndGhcclxuICAgIHdoaWxlIChpIDwgbilcclxuICAgICAgZHJhd0NhbGwgPSByZW5kZXJDb21tYW5kcy5zbGljZShpLCBpICs9IDE2KVxyXG4gICAgICBAZHJhd0ltYWdlLmFwcGx5KHRoaXMsIGRyYXdDYWxsKVxyXG5cclxuICAgIEB1cGRhdGVTYXZlKGR0KVxyXG5cclxuICBvblRvdWNoU3RhcnQ6IChldnQpIC0+XHJcbiAgICBAbGFzdEludGVyYWN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXHJcbiAgICBAaGVhcmRPbmVUb3VjaCA9IHRydWVcclxuICAgIHRvdWNoZXMgPSBldnQuY2hhbmdlZFRvdWNoZXNcclxuICAgIGZvciB0b3VjaCBpbiB0b3VjaGVzXHJcbiAgICAgIGlmIEB0b3VjaE1vdXNlID09IG51bGxcclxuICAgICAgICBAdG91Y2hNb3VzZSA9IHRvdWNoLmlkZW50aWZpZXJcclxuICAgICAgaWYgQHRvdWNoTW91c2UgPT0gdG91Y2guaWRlbnRpZmllclxyXG4gICAgICAgIEBnYW1lLnRvdWNoRG93bih0b3VjaC5jbGllbnRYLCB0b3VjaC5jbGllbnRZKVxyXG5cclxuICBvblRvdWNoTW92ZTogKGV2dCkgLT5cclxuICAgIEBsYXN0SW50ZXJhY3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcclxuICAgIHRvdWNoZXMgPSBldnQuY2hhbmdlZFRvdWNoZXNcclxuICAgIGZvciB0b3VjaCBpbiB0b3VjaGVzXHJcbiAgICAgIGlmIEB0b3VjaE1vdXNlID09IHRvdWNoLmlkZW50aWZpZXJcclxuICAgICAgICBAZ2FtZS50b3VjaE1vdmUodG91Y2guY2xpZW50WCwgdG91Y2guY2xpZW50WSlcclxuXHJcbiAgb25Ub3VjaEVuZDogKGV2dCkgLT5cclxuICAgIEBsYXN0SW50ZXJhY3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcclxuICAgIHRvdWNoZXMgPSBldnQuY2hhbmdlZFRvdWNoZXNcclxuICAgIGZvciB0b3VjaCBpbiB0b3VjaGVzXHJcbiAgICAgIGlmIEB0b3VjaE1vdXNlID09IHRvdWNoLmlkZW50aWZpZXJcclxuICAgICAgICBAZ2FtZS50b3VjaFVwKHRvdWNoLmNsaWVudFgsIHRvdWNoLmNsaWVudFkpXHJcbiAgICAgICAgQHRvdWNoTW91c2UgPSBudWxsXHJcbiAgICBpZiBldnQudG91Y2hlcy5sZW5ndGggPT0gMFxyXG4gICAgICBAdG91Y2hNb3VzZSA9IG51bGxcclxuXHJcbiAgb25Nb3VzZURvd246IChldnQpIC0+XHJcbiAgICBpZiBAaGVhcmRPbmVUb3VjaFxyXG4gICAgICByZXR1cm5cclxuICAgIEBsYXN0SW50ZXJhY3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcclxuICAgIEBnYW1lLnRvdWNoRG93bihldnQuY2xpZW50WCwgZXZ0LmNsaWVudFkpXHJcblxyXG4gIG9uTW91c2VNb3ZlOiAoZXZ0KSAtPlxyXG4gICAgaWYgQGhlYXJkT25lVG91Y2hcclxuICAgICAgcmV0dXJuXHJcbiAgICBAbGFzdEludGVyYWN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXHJcbiAgICBAZ2FtZS50b3VjaE1vdmUoZXZ0LmNsaWVudFgsIGV2dC5jbGllbnRZKVxyXG5cclxuICBvbk1vdXNlVXA6IChldnQpIC0+XHJcbiAgICBpZiBAaGVhcmRPbmVUb3VjaFxyXG4gICAgICByZXR1cm5cclxuICAgIEBsYXN0SW50ZXJhY3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcclxuICAgIEBnYW1lLnRvdWNoVXAoZXZ0LmNsaWVudFgsIGV2dC5jbGllbnRZKVxyXG5cclxuc2NyZWVuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ3NjcmVlbidcclxucmVzaXplU2NyZWVuID0gLT5cclxuICBkZXNpcmVkQXNwZWN0UmF0aW8gPSAxNiAvIDlcclxuICBjdXJyZW50QXNwZWN0UmF0aW8gPSB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodFxyXG4gIGlmIGN1cnJlbnRBc3BlY3RSYXRpbyA8IGRlc2lyZWRBc3BlY3RSYXRpb1xyXG4gICAgc2NyZWVuLndpZHRoID0gd2luZG93LmlubmVyV2lkdGhcclxuICAgIHNjcmVlbi5oZWlnaHQgPSBNYXRoLmZsb29yKHdpbmRvdy5pbm5lcldpZHRoICogKDEgLyBkZXNpcmVkQXNwZWN0UmF0aW8pKVxyXG4gIGVsc2VcclxuICAgIHNjcmVlbi53aWR0aCA9IE1hdGguZmxvb3Iod2luZG93LmlubmVySGVpZ2h0ICogZGVzaXJlZEFzcGVjdFJhdGlvKVxyXG4gICAgc2NyZWVuLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxyXG5yZXNpemVTY3JlZW4oKVxyXG4jIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdyZXNpemUnLCByZXNpemVTY3JlZW4sIGZhbHNlXHJcblxyXG5hcHAgPSBuZXcgTmF0aXZlQXBwKHNjcmVlbiwgc2NyZWVuLndpZHRoLCBzY3JlZW4uaGVpZ2h0KVxyXG4iXX0=
