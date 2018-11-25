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
      return this.picked = new Array(this.cards.length).fill(false);
    }
  };

  Hand.prototype.set = function(cards) {
    this.cards = cards.slice(0);
    if (this.picking) {
      this.picked = new Array(this.cards.length).fill(false);
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
var Card, MAX_LOG_LINES, MIN_PLAYERS, OK, ShortSuitName, ShuffledDeck, Suit, SuitName, Thirteen, aiCharacterList, aiCharacters, cardsToString, character, l, len, randomCharacter;

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
    this.turn = 0;
    this.pile = [];
    this.pileWho = -1;
    this.throwID = 0;
    this.currentPlay = null;
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
    var card, cards, highestRaw, len1, m, reqValue, type;
    cards = rawCards.map(function(raw) {
      return new Card(raw);
    });
    reqValue = cards[0].value;
    highestRaw = cards[0].raw;
    for (m = 0, len1 = cards.length; m < len1; m++) {
      card = cards[m];
      if (card.value !== reqValue) {
        return null;
      }
      if (highestRaw < card.raw) {
        highestRaw = card.raw;
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
    return OK;
  };

  Thirteen.prototype.canPlay = function(params, incomingPlay) {
    var ret;
    ret = this.canPass(params);
    if (ret !== OK) {
      return ret;
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
    var currentPlayer, incomingPlay, ret;
    incomingPlay = this.classify(params.cards);
    console.log("incomingPlay", incomingPlay);
    console.log("someone calling play", params);
    ret = this.canPlay(params, incomingPlay);
    if (ret !== OK) {
      return ret;
    }
    if (this.currentPlay) {
      if ((incomingPlay.type !== this.currentPlay.type) || (incomingPlay.high < this.currentPlay.high)) {
        this.unpassAll();
      }
    }
    this.currentPlay = incomingPlay;
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
    this.output(currentPlayer.name + " passes");
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
      return false;
    }
    character = aiCharacters[currentPlayer.charID];
    ret = this.brains[character.brain].play.apply(this, [currentPlayer, this.currentPlay, this.everyonePassed()]);
    if (ret === OK) {
      return true;
    }
    return false;
  };

  Thirteen.prototype.brains = {
    normal: {
      id: "normal",
      name: "Normal",
      play: function(currentPlayer, currentPlay, everyonePassed) {
        var len1, m, rawCard, ref;
        if (currentPlayer.pass) {
          this.aiLog("already passed, going to keep passing");
          return this.aiPass(currentPlayer);
        }
        if (currentPlay && !everyonePassed) {
          if (currentPlay.type !== 'kind1') {
            this.aiLog("unwilling to do anything but singles, passing");
            return this.aiPass(currentPlayer);
          }
        } else {
          this.aiLog("I can do anything, throwing a single");
          if (this.aiPlay(currentPlayer, [currentPlayer.hand[0]]) === OK) {
            return OK;
          }
        }
        ref = currentPlayer.hand;
        for (m = 0, len1 = ref.length; m < len1; m++) {
          rawCard = ref[m];
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQW5pbWF0aW9uLmNvZmZlZSIsInNyYy9CdXR0b24uY29mZmVlIiwic3JjL0ZvbnRSZW5kZXJlci5jb2ZmZWUiLCJzcmMvR2FtZS5jb2ZmZWUiLCJzcmMvSGFuZC5jb2ZmZWUiLCJzcmMvTWVudS5jb2ZmZWUiLCJzcmMvUGlsZS5jb2ZmZWUiLCJzcmMvU3ByaXRlUmVuZGVyZXIuY29mZmVlIiwic3JjL1RoaXJ0ZWVuLmNvZmZlZSIsInNyYy9mb250bWV0cmljcy5jb2ZmZWUiLCJzcmMvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBOztBQUFBLFFBQUEsR0FBVyxTQUFDLENBQUQ7RUFDVCxJQUFHLENBQUEsS0FBSyxDQUFSO0FBQ0UsV0FBTyxFQURUO0dBQUEsTUFFSyxJQUFHLENBQUEsR0FBSSxDQUFQO0FBQ0gsV0FBTyxDQUFDLEVBREw7O0FBRUwsU0FBTztBQUxFOztBQU9MO0VBQ1MsbUJBQUMsSUFBRDtBQUNYLFFBQUE7SUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksQ0FBQztJQUNkLElBQUMsQ0FBQSxHQUFELEdBQU87SUFDUCxJQUFDLENBQUEsR0FBRCxHQUFPO0FBQ1AsU0FBQSxTQUFBOztNQUNFLElBQUcsQ0FBQSxLQUFLLE9BQVI7UUFDRSxJQUFDLENBQUEsR0FBSSxDQUFBLENBQUEsQ0FBTCxHQUFVO1FBQ1YsSUFBQyxDQUFBLEdBQUksQ0FBQSxDQUFBLENBQUwsR0FBVSxFQUZaOztBQURGO0VBSlc7O3NCQVViLElBQUEsR0FBTSxTQUFBO0lBQ0osSUFBRyxrQkFBSDtNQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBTCxHQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFEaEI7O0lBRUEsSUFBRyxrQkFBSDtNQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBTCxHQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFEaEI7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QSxrQkFBQSxHQUFxQixFQUFBLEdBQUs7RUFDMUIsa0JBQUEsR0FBcUIsTUFBTSxDQUFDLFVBQVAsR0FBb0IsTUFBTSxDQUFDO0VBQ2hELElBQUcsa0JBQUEsR0FBcUIsa0JBQXhCO0lBQ0UsTUFBTSxDQUFDLEtBQVAsR0FBZSxNQUFNLENBQUM7V0FDdEIsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsSUFBSSxDQUFDLEtBQUwsQ0FBVyxNQUFNLENBQUMsVUFBUCxHQUFvQixDQUFDLENBQUEsR0FBSSxrQkFBTCxDQUEvQixFQUZsQjtHQUFBLE1BQUE7SUFJRSxNQUFNLENBQUMsS0FBUCxHQUFlLElBQUksQ0FBQyxLQUFMLENBQVcsTUFBTSxDQUFDLFdBQVAsR0FBcUIsa0JBQWhDO1dBQ2YsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsTUFBTSxDQUFDLFlBTHpCOztBQUhhOztBQVNmLFlBQUEsQ0FBQTs7QUFHQSxHQUFBLEdBQU0sSUFBSSxTQUFKLENBQWMsTUFBZCxFQUFzQixNQUFNLENBQUMsS0FBN0IsRUFBb0MsTUFBTSxDQUFDLE1BQTNDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY2FsY1NpZ24gPSAodikgLT5cclxuICBpZiB2ID09IDBcclxuICAgIHJldHVybiAwXHJcbiAgZWxzZSBpZiB2IDwgMFxyXG4gICAgcmV0dXJuIC0xXHJcbiAgcmV0dXJuIDFcclxuXHJcbmNsYXNzIEFuaW1hdGlvblxyXG4gIGNvbnN0cnVjdG9yOiAoZGF0YSkgLT5cclxuICAgIEBzcGVlZCA9IGRhdGEuc3BlZWRcclxuICAgIEByZXEgPSB7fVxyXG4gICAgQGN1ciA9IHt9XHJcbiAgICBmb3Igayx2IG9mIGRhdGFcclxuICAgICAgaWYgayAhPSAnc3BlZWQnXHJcbiAgICAgICAgQHJlcVtrXSA9IHZcclxuICAgICAgICBAY3VyW2tdID0gdlxyXG5cclxuICAjICdmaW5pc2hlcycgYWxsIGFuaW1hdGlvbnNcclxuICB3YXJwOiAtPlxyXG4gICAgaWYgQGN1ci5yP1xyXG4gICAgICBAY3VyLnIgPSBAcmVxLnJcclxuICAgIGlmIEBjdXIucz9cclxuICAgICAgQGN1ci5zID0gQHJlcS5zXHJcbiAgICBpZiBAY3VyLng/IGFuZCBAY3VyLnk/XHJcbiAgICAgIEBjdXIueCA9IEByZXEueFxyXG4gICAgICBAY3VyLnkgPSBAcmVxLnlcclxuXHJcbiAgYW5pbWF0aW5nOiAtPlxyXG4gICAgaWYgQGN1ci5yP1xyXG4gICAgICBpZiBAcmVxLnIgIT0gQGN1ci5yXHJcbiAgICAgICAgcmV0dXJuIHRydWVcclxuICAgIGlmIEBjdXIucz9cclxuICAgICAgaWYgQHJlcS5zICE9IEBjdXIuc1xyXG4gICAgICAgIHJldHVybiB0cnVlXHJcbiAgICBpZiBAY3VyLng/IGFuZCBAY3VyLnk/XHJcbiAgICAgIGlmIChAcmVxLnggIT0gQGN1ci54KSBvciAoQHJlcS55ICE9IEBjdXIueSlcclxuICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gIHVwZGF0ZTogKGR0KSAtPlxyXG4gICAgdXBkYXRlZCA9IGZhbHNlXHJcbiAgICAjIHJvdGF0aW9uXHJcbiAgICBpZiBAY3VyLnI/XHJcbiAgICAgIGlmIEByZXEuciAhPSBAY3VyLnJcclxuICAgICAgICB1cGRhdGVkID0gdHJ1ZVxyXG4gICAgICAgICMgc2FuaXRpemUgcmVxdWVzdGVkIHJvdGF0aW9uXHJcbiAgICAgICAgdHdvUGkgPSBNYXRoLlBJICogMlxyXG4gICAgICAgIG5lZ1R3b1BpID0gLTEgKiB0d29QaVxyXG4gICAgICAgIEByZXEuciAtPSB0d29QaSB3aGlsZSBAcmVxLnIgPj0gdHdvUGlcclxuICAgICAgICBAcmVxLnIgKz0gdHdvUGkgd2hpbGUgQHJlcS5yIDw9IG5lZ1R3b1BpXHJcbiAgICAgICAgIyBwaWNrIGEgZGlyZWN0aW9uIGFuZCB0dXJuXHJcbiAgICAgICAgZHIgPSBAcmVxLnIgLSBAY3VyLnJcclxuICAgICAgICBkaXN0ID0gTWF0aC5hYnMoZHIpXHJcbiAgICAgICAgc2lnbiA9IGNhbGNTaWduKGRyKVxyXG4gICAgICAgIGlmIGRpc3QgPiBNYXRoLlBJXHJcbiAgICAgICAgICAjIHNwaW4gdGhlIG90aGVyIGRpcmVjdGlvbiwgaXQgaXMgY2xvc2VyXHJcbiAgICAgICAgICBkaXN0ID0gdHdvUGkgLSBkaXN0XHJcbiAgICAgICAgICBzaWduICo9IC0xXHJcbiAgICAgICAgbWF4RGlzdCA9IGR0ICogQHNwZWVkLnIgLyAxMDAwXHJcbiAgICAgICAgaWYgZGlzdCA8IG1heERpc3RcclxuICAgICAgICAgICMgd2UgY2FuIGZpbmlzaCB0aGlzIGZyYW1lXHJcbiAgICAgICAgICBAY3VyLnIgPSBAcmVxLnJcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBAY3VyLnIgKz0gbWF4RGlzdCAqIHNpZ25cclxuXHJcbiAgICAjIHNjYWxlXHJcbiAgICBpZiBAY3VyLnM/XHJcbiAgICAgIGlmIEByZXEucyAhPSBAY3VyLnNcclxuICAgICAgICB1cGRhdGVkID0gdHJ1ZVxyXG4gICAgICAgICMgcGljayBhIGRpcmVjdGlvbiBhbmQgdHVyblxyXG4gICAgICAgIGRzID0gQHJlcS5zIC0gQGN1ci5zXHJcbiAgICAgICAgZGlzdCA9IE1hdGguYWJzKGRzKVxyXG4gICAgICAgIHNpZ24gPSBjYWxjU2lnbihkcylcclxuICAgICAgICBtYXhEaXN0ID0gZHQgKiBAc3BlZWQucyAvIDEwMDBcclxuICAgICAgICBpZiBkaXN0IDwgbWF4RGlzdFxyXG4gICAgICAgICAgIyB3ZSBjYW4gZmluaXNoIHRoaXMgZnJhbWVcclxuICAgICAgICAgIEBjdXIucyA9IEByZXEuc1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIEBjdXIucyArPSBtYXhEaXN0ICogc2lnblxyXG5cclxuICAgICMgdHJhbnNsYXRpb25cclxuICAgIGlmIEBjdXIueD8gYW5kIEBjdXIueT9cclxuICAgICAgaWYgKEByZXEueCAhPSBAY3VyLngpIG9yIChAcmVxLnkgIT0gQGN1ci55KVxyXG4gICAgICAgIHVwZGF0ZWQgPSB0cnVlXHJcbiAgICAgICAgdmVjWCA9IEByZXEueCAtIEBjdXIueFxyXG4gICAgICAgIHZlY1kgPSBAcmVxLnkgLSBAY3VyLnlcclxuICAgICAgICBkaXN0ID0gTWF0aC5zcXJ0KCh2ZWNYICogdmVjWCkgKyAodmVjWSAqIHZlY1kpKVxyXG4gICAgICAgIG1heERpc3QgPSBkdCAqIEBzcGVlZC50IC8gMTAwMFxyXG4gICAgICAgIGlmIGRpc3QgPCBtYXhEaXN0XHJcbiAgICAgICAgICAjIHdlIGNhbiBmaW5pc2ggdGhpcyBmcmFtZVxyXG4gICAgICAgICAgQGN1ci54ID0gQHJlcS54XHJcbiAgICAgICAgICBAY3VyLnkgPSBAcmVxLnlcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAjIG1vdmUgYXMgbXVjaCBhcyBwb3NzaWJsZVxyXG4gICAgICAgICAgQGN1ci54ICs9ICh2ZWNYIC8gZGlzdCkgKiBtYXhEaXN0XHJcbiAgICAgICAgICBAY3VyLnkgKz0gKHZlY1kgLyBkaXN0KSAqIG1heERpc3RcclxuXHJcbiAgICByZXR1cm4gdXBkYXRlZFxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBbmltYXRpb25cclxuIiwiQW5pbWF0aW9uID0gcmVxdWlyZSAnLi9BbmltYXRpb24nXHJcblxyXG5jbGFzcyBCdXR0b25cclxuICBjb25zdHJ1Y3RvcjogKEBnYW1lLCBAc3ByaXRlTmFtZXMsIEBmb250LCBAdGV4dEhlaWdodCwgQHgsIEB5LCBAY2IpIC0+XHJcbiAgICBAYW5pbSA9IG5ldyBBbmltYXRpb24ge1xyXG4gICAgICBzcGVlZDogeyBzOiAzIH1cclxuICAgICAgczogMFxyXG4gICAgfVxyXG4gICAgQGNvbG9yID0geyByOiAxLCBnOiAxLCBiOiAxLCBhOiAwIH1cclxuXHJcbiAgdXBkYXRlOiAoZHQpIC0+XHJcbiAgICByZXR1cm4gQGFuaW0udXBkYXRlKGR0KVxyXG5cclxuICByZW5kZXI6IC0+XHJcbiAgICBAY29sb3IuYSA9IEBhbmltLmN1ci5zXHJcbiAgICBAZ2FtZS5zcHJpdGVSZW5kZXJlci5yZW5kZXIgQHNwcml0ZU5hbWVzWzBdLCBAeCwgQHksIDAsIEB0ZXh0SGVpZ2h0ICogMS41LCAwLCAwLjUsIDAuNSwgQGdhbWUuY29sb3JzLndoaXRlLCA9PlxyXG4gICAgICAjIHB1bHNlIGJ1dHRvbiBhbmltLFxyXG4gICAgICBAYW5pbS5jdXIucyA9IDFcclxuICAgICAgQGFuaW0ucmVxLnMgPSAwXHJcbiAgICAgICMgdGhlbiBjYWxsIGNhbGxiYWNrXHJcbiAgICAgIEBjYih0cnVlKVxyXG4gICAgQGdhbWUuc3ByaXRlUmVuZGVyZXIucmVuZGVyIEBzcHJpdGVOYW1lc1sxXSwgQHgsIEB5LCAwLCBAdGV4dEhlaWdodCAqIDEuNSwgMCwgMC41LCAwLjUsIEBjb2xvclxyXG4gICAgdGV4dCA9IEBjYihmYWxzZSlcclxuICAgIEBnYW1lLmZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIEB0ZXh0SGVpZ2h0LCB0ZXh0LCBAeCwgQHksIDAuNSwgMC41LCBAZ2FtZS5jb2xvcnMuYnV0dG9udGV4dFxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCdXR0b25cclxuIiwiZm9udG1ldHJpY3MgPSByZXF1aXJlICcuL2ZvbnRtZXRyaWNzJ1xyXG5cclxuIyB0YWtlbiBmcm9tIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNTYyMzgzOC9yZ2ItdG8taGV4LWFuZC1oZXgtdG8tcmdiXHJcbmhleFRvUmdiID0gKGhleCwgYSkgLT5cclxuICAgIHJlc3VsdCA9IC9eIz8oW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KShbYS1mXFxkXXsyfSkkL2kuZXhlYyhoZXgpXHJcbiAgICByZXR1cm4gbnVsbCBpZiBub3QgcmVzdWx0XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHI6IHBhcnNlSW50KHJlc3VsdFsxXSwgMTYpIC8gMjU1LFxyXG4gICAgICAgIGc6IHBhcnNlSW50KHJlc3VsdFsyXSwgMTYpIC8gMjU1LFxyXG4gICAgICAgIGI6IHBhcnNlSW50KHJlc3VsdFszXSwgMTYpIC8gMjU1XHJcbiAgICAgICAgYTogYVxyXG4gICAgfVxyXG5cclxuY2xhc3MgRm9udFJlbmRlcmVyXHJcbiAgY29uc3RydWN0b3I6ICAoQGdhbWUpIC0+XHJcbiAgICBAd2hpdGUgPSB7IHI6IDEsIGc6IDEsIGI6IDEsIGE6IDEgfVxyXG5cclxuICBzaXplOiAoZm9udCwgaGVpZ2h0LCBzdHIpIC0+XHJcbiAgICBtZXRyaWNzID0gZm9udG1ldHJpY3NbZm9udF1cclxuICAgIHJldHVybiBpZiBub3QgbWV0cmljc1xyXG4gICAgc2NhbGUgPSBoZWlnaHQgLyBtZXRyaWNzLmhlaWdodFxyXG5cclxuICAgIHRvdGFsV2lkdGggPSAwXHJcbiAgICB0b3RhbEhlaWdodCA9IG1ldHJpY3MuaGVpZ2h0ICogc2NhbGVcclxuXHJcbiAgICBpbkNvbG9yID0gZmFsc2VcclxuICAgIGZvciBjaCwgaSBpbiBzdHJcclxuICAgICAgaWYgY2ggPT0gJ2AnXHJcbiAgICAgICAgaW5Db2xvciA9ICFpbkNvbG9yXHJcblxyXG4gICAgICBpZiBub3QgaW5Db2xvclxyXG4gICAgICAgIGNvZGUgPSBjaC5jaGFyQ29kZUF0KDApXHJcbiAgICAgICAgZ2x5cGggPSBtZXRyaWNzLmdseXBoc1tjb2RlXVxyXG4gICAgICAgIGNvbnRpbnVlIGlmIG5vdCBnbHlwaFxyXG4gICAgICAgIHRvdGFsV2lkdGggKz0gZ2x5cGgueGFkdmFuY2UgKiBzY2FsZVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHc6IHRvdGFsV2lkdGhcclxuICAgICAgaDogdG90YWxIZWlnaHRcclxuICAgIH1cclxuXHJcbiAgcmVuZGVyOiAoZm9udCwgaGVpZ2h0LCBzdHIsIHgsIHksIGFuY2hvcngsIGFuY2hvcnksIGNvbG9yLCBjYikgLT5cclxuICAgIG1ldHJpY3MgPSBmb250bWV0cmljc1tmb250XVxyXG4gICAgcmV0dXJuIGlmIG5vdCBtZXRyaWNzXHJcbiAgICBzY2FsZSA9IGhlaWdodCAvIG1ldHJpY3MuaGVpZ2h0XHJcblxyXG4gICAgdG90YWxXaWR0aCA9IDBcclxuICAgIHRvdGFsSGVpZ2h0ID0gbWV0cmljcy5oZWlnaHQgKiBzY2FsZVxyXG4gICAgc2tpcENvbG9yID0gZmFsc2VcclxuICAgIGZvciBjaCwgaSBpbiBzdHJcclxuICAgICAgaWYgY2ggPT0gJ2AnXHJcbiAgICAgICAgc2tpcENvbG9yID0gIXNraXBDb2xvclxyXG4gICAgICBjb250aW51ZSBpZiBza2lwQ29sb3JcclxuICAgICAgY29kZSA9IGNoLmNoYXJDb2RlQXQoMClcclxuICAgICAgZ2x5cGggPSBtZXRyaWNzLmdseXBoc1tjb2RlXVxyXG4gICAgICBjb250aW51ZSBpZiBub3QgZ2x5cGhcclxuICAgICAgdG90YWxXaWR0aCArPSBnbHlwaC54YWR2YW5jZSAqIHNjYWxlXHJcblxyXG4gICAgYW5jaG9yT2Zmc2V0WCA9IC0xICogYW5jaG9yeCAqIHRvdGFsV2lkdGhcclxuICAgIGFuY2hvck9mZnNldFkgPSAtMSAqIGFuY2hvcnkgKiB0b3RhbEhlaWdodFxyXG4gICAgY3VyclggPSB4XHJcblxyXG4gICAgaWYgY29sb3JcclxuICAgICAgc3RhcnRpbmdDb2xvciA9IGNvbG9yXHJcbiAgICBlbHNlXHJcbiAgICAgIHN0YXJ0aW5nQ29sb3IgPSBAd2hpdGVcclxuICAgIGN1cnJlbnRDb2xvciA9IHN0YXJ0aW5nQ29sb3JcclxuXHJcbiAgICBjb2xvclN0YXJ0ID0gLTFcclxuICAgIGZvciBjaCwgaSBpbiBzdHJcclxuICAgICAgaWYgY2ggPT0gJ2AnXHJcbiAgICAgICAgaWYgY29sb3JTdGFydCA9PSAtMVxyXG4gICAgICAgICAgY29sb3JTdGFydCA9IGkgKyAxXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgbGVuID0gaSAtIGNvbG9yU3RhcnRcclxuICAgICAgICAgIGlmIGxlblxyXG4gICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBoZXhUb1JnYihzdHIuc3Vic3RyKGNvbG9yU3RhcnQsIGkgLSBjb2xvclN0YXJ0KSwgc3RhcnRpbmdDb2xvci5hKVxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBzdGFydGluZ0NvbG9yXHJcbiAgICAgICAgICBjb2xvclN0YXJ0ID0gLTFcclxuXHJcbiAgICAgIGNvbnRpbnVlIGlmIGNvbG9yU3RhcnQgIT0gLTFcclxuICAgICAgY29kZSA9IGNoLmNoYXJDb2RlQXQoMClcclxuICAgICAgZ2x5cGggPSBtZXRyaWNzLmdseXBoc1tjb2RlXVxyXG4gICAgICBjb250aW51ZSBpZiBub3QgZ2x5cGhcclxuICAgICAgQGdhbWUuZHJhd0ltYWdlIGZvbnQsXHJcbiAgICAgIGdseXBoLngsIGdseXBoLnksIGdseXBoLndpZHRoLCBnbHlwaC5oZWlnaHQsXHJcbiAgICAgIGN1cnJYICsgKGdseXBoLnhvZmZzZXQgKiBzY2FsZSkgKyBhbmNob3JPZmZzZXRYLCB5ICsgKGdseXBoLnlvZmZzZXQgKiBzY2FsZSkgKyBhbmNob3JPZmZzZXRZLCBnbHlwaC53aWR0aCAqIHNjYWxlLCBnbHlwaC5oZWlnaHQgKiBzY2FsZSxcclxuICAgICAgMCwgMCwgMCxcclxuICAgICAgY3VycmVudENvbG9yLnIsIGN1cnJlbnRDb2xvci5nLCBjdXJyZW50Q29sb3IuYiwgY3VycmVudENvbG9yLmEsIGNiXHJcbiAgICAgIGN1cnJYICs9IGdseXBoLnhhZHZhbmNlICogc2NhbGVcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRm9udFJlbmRlcmVyXHJcbiIsIkFuaW1hdGlvbiA9IHJlcXVpcmUgJy4vQW5pbWF0aW9uJ1xyXG5CdXR0b24gPSByZXF1aXJlICcuL0J1dHRvbidcclxuRm9udFJlbmRlcmVyID0gcmVxdWlyZSAnLi9Gb250UmVuZGVyZXInXHJcblNwcml0ZVJlbmRlcmVyID0gcmVxdWlyZSAnLi9TcHJpdGVSZW5kZXJlcidcclxuTWVudSA9IHJlcXVpcmUgJy4vTWVudSdcclxuSGFuZCA9IHJlcXVpcmUgJy4vSGFuZCdcclxuUGlsZSA9IHJlcXVpcmUgJy4vUGlsZSdcclxue1RoaXJ0ZWVuLCBPSywgYWlDaGFyYWN0ZXJzfSA9IHJlcXVpcmUgJy4vVGhpcnRlZW4nXHJcblxyXG4jIHRlbXBcclxuQlVJTERfVElNRVNUQU1QID0gXCIwLjAuMVwiXHJcblxyXG5jbGFzcyBHYW1lXHJcbiAgY29uc3RydWN0b3I6IChAbmF0aXZlLCBAd2lkdGgsIEBoZWlnaHQpIC0+XHJcbiAgICBAdmVyc2lvbiA9IEJVSUxEX1RJTUVTVEFNUFxyXG4gICAgQGxvZyhcIkdhbWUgY29uc3RydWN0ZWQ6ICN7QHdpZHRofXgje0BoZWlnaHR9XCIpXHJcbiAgICBAZm9udFJlbmRlcmVyID0gbmV3IEZvbnRSZW5kZXJlciB0aGlzXHJcbiAgICBAc3ByaXRlUmVuZGVyZXIgPSBuZXcgU3ByaXRlUmVuZGVyZXIgdGhpc1xyXG4gICAgQGZvbnQgPSBcImRhcmtmb3Jlc3RcIlxyXG4gICAgQHpvbmVzID0gW11cclxuICAgIEBuZXh0QUlUaWNrID0gMTAwMCAjIHdpbGwgYmUgc2V0IGJ5IG9wdGlvbnNcclxuICAgIEBjZW50ZXIgPVxyXG4gICAgICB4OiBAd2lkdGggLyAyXHJcbiAgICAgIHk6IEBoZWlnaHQgLyAyXHJcbiAgICBAYWFIZWlnaHQgPSBAd2lkdGggKiA5IC8gMTZcclxuICAgIEBsb2cgXCJoZWlnaHQ6ICN7QGhlaWdodH0uIGhlaWdodCBpZiBzY3JlZW4gd2FzIDE2OjkgKGFzcGVjdCBhZGp1c3RlZCk6ICN7QGFhSGVpZ2h0fVwiXHJcbiAgICBAcGF1c2VCdXR0b25TaXplID0gQGFhSGVpZ2h0IC8gMTVcclxuICAgIEBjb2xvcnMgPVxyXG4gICAgICB3aGl0ZTogICAgICB7IHI6ICAgMSwgZzogICAxLCBiOiAgIDEsIGE6ICAgMSB9XHJcbiAgICAgIGJsYWNrOiAgICAgIHsgcjogICAwLCBnOiAgIDAsIGI6ICAgMCwgYTogICAxIH1cclxuICAgICAgcmVkOiAgICAgICAgeyByOiAgIDEsIGc6ICAgMCwgYjogICAwLCBhOiAgIDEgfVxyXG4gICAgICBvcmFuZ2U6ICAgICB7IHI6ICAgMSwgZzogMC41LCBiOiAgIDAsIGE6ICAgMSB9XHJcbiAgICAgIGdvbGQ6ICAgICAgIHsgcjogICAxLCBnOiAgIDEsIGI6ICAgMCwgYTogICAxIH1cclxuICAgICAgYnV0dG9udGV4dDogeyByOiAgIDEsIGc6ICAgMSwgYjogICAxLCBhOiAgIDEgfVxyXG4gICAgICBsaWdodGdyYXk6ICB7IHI6IDAuNSwgZzogMC41LCBiOiAwLjUsIGE6ICAgMSB9XHJcbiAgICAgIGJhY2tncm91bmQ6IHsgcjogICAwLCBnOiAwLjIsIGI6ICAgMCwgYTogICAxIH1cclxuICAgICAgcGlsZTogICAgICAgeyByOiAwLjQsIGc6IDAuMiwgYjogICAwLCBhOiAgIDEgfVxyXG4gICAgICBsb2diZzogICAgICB7IHI6IDAuMSwgZzogICAwLCBiOiAgIDAsIGE6ICAgMSB9XHJcbiAgICAgIGFycm93OiAgICAgIHsgcjogICAxLCBnOiAgIDEsIGI6ICAgMSwgYTogICAxIH1cclxuICAgICAgYXJyb3djbG9zZTogeyByOiAgIDEsIGc6IDAuNSwgYjogICAwLCBhOiAwLjMgfVxyXG4gICAgICBoYW5kX3BpY2s6ICB7IHI6ICAgMCwgZzogMC4xLCBiOiAgIDAsIGE6IDEuMCB9XHJcbiAgICAgIGhhbmRfcmVvcmc6IHsgcjogMC40LCBnOiAgIDAsIGI6ICAgMCwgYTogMS4wIH1cclxuICAgICAgb3ZlcmxheTogICAgeyByOiAgIDAsIGc6ICAgMCwgYjogICAwLCBhOiAwLjYgfVxyXG4gICAgICBtYWlubWVudTogICB7IHI6IDAuMSwgZzogMC4xLCBiOiAwLjEsIGE6ICAgMSB9XHJcbiAgICAgIHBhdXNlbWVudTogIHsgcjogMC4xLCBnOiAwLjAsIGI6IDAuMSwgYTogICAxIH1cclxuICAgICAgYmlkOiAgICAgICAgeyByOiAgIDAsIGc6IDAuNiwgYjogICAwLCBhOiAgIDEgfVxyXG5cclxuICAgIEB0ZXh0dXJlcyA9XHJcbiAgICAgIFwiY2FyZHNcIjogMFxyXG4gICAgICBcImRhcmtmb3Jlc3RcIjogMVxyXG4gICAgICBcImNoYXJzXCI6IDJcclxuICAgICAgXCJob3d0bzFcIjogM1xyXG4gICAgICBcImhvd3RvMlwiOiA0XHJcbiAgICAgIFwiaG93dG8zXCI6IDVcclxuXHJcbiAgICBAdGhpcnRlZW4gPSBudWxsXHJcbiAgICBAbGFzdEVyciA9ICcnXHJcbiAgICBAcGF1c2VkID0gZmFsc2VcclxuICAgIEBob3d0byA9IDBcclxuICAgIEByZW5kZXJDb21tYW5kcyA9IFtdXHJcblxyXG4gICAgQG9wdGlvbk1lbnVzID1cclxuICAgICAgc3BlZWRzOiBbXHJcbiAgICAgICAgeyB0ZXh0OiBcIkFJIFNwZWVkOiBTbG93XCIsIHNwZWVkOiAyMDAwIH1cclxuICAgICAgICB7IHRleHQ6IFwiQUkgU3BlZWQ6IE1lZGl1bVwiLCBzcGVlZDogMTAwMCB9XHJcbiAgICAgICAgeyB0ZXh0OiBcIkFJIFNwZWVkOiBGYXN0XCIsIHNwZWVkOiA1MDAgfVxyXG4gICAgICAgIHsgdGV4dDogXCJBSSBTcGVlZDogVWx0cmFcIiwgc3BlZWQ6IDI1MCB9XHJcbiAgICAgIF1cclxuICAgICAgc29ydHM6IFtcclxuICAgICAgICB7IHRleHQ6IFwiU29ydCBPcmRlcjogTm9ybWFsXCIgfVxyXG4gICAgICAgIHsgdGV4dDogXCJTb3J0IE9yZGVyOiBSZXZlcnNlXCIgfVxyXG4gICAgICBdXHJcbiAgICBAb3B0aW9ucyA9XHJcbiAgICAgIHNwZWVkSW5kZXg6IDFcclxuICAgICAgc29ydEluZGV4OiAwXHJcbiAgICAgIHNvdW5kOiB0cnVlXHJcblxyXG4gICAgQG1haW5NZW51ID0gbmV3IE1lbnUgdGhpcywgXCJUaGlydGVlblwiLCBcInNvbGlkXCIsIEBjb2xvcnMubWFpbm1lbnUsIFtcclxuICAgICAgKGNsaWNrKSA9PlxyXG4gICAgICAgIGlmIGNsaWNrXHJcbiAgICAgICAgICBAaG93dG8gPSAxXHJcbiAgICAgICAgcmV0dXJuIFwiSG93IFRvIFBsYXlcIlxyXG4gICAgICAoY2xpY2spID0+XHJcbiAgICAgICAgaWYgY2xpY2tcclxuICAgICAgICAgIEBvcHRpb25zLnNwZWVkSW5kZXggPSAoQG9wdGlvbnMuc3BlZWRJbmRleCArIDEpICUgQG9wdGlvbk1lbnVzLnNwZWVkcy5sZW5ndGhcclxuICAgICAgICByZXR1cm4gQG9wdGlvbk1lbnVzLnNwZWVkc1tAb3B0aW9ucy5zcGVlZEluZGV4XS50ZXh0XHJcbiAgICAgIChjbGljaykgPT5cclxuICAgICAgICBpZiBjbGlja1xyXG4gICAgICAgICAgQG9wdGlvbnMuc29ydEluZGV4ID0gKEBvcHRpb25zLnNvcnRJbmRleCArIDEpICUgQG9wdGlvbk1lbnVzLnNvcnRzLmxlbmd0aFxyXG4gICAgICAgIHJldHVybiBAb3B0aW9uTWVudXMuc29ydHNbQG9wdGlvbnMuc29ydEluZGV4XS50ZXh0XHJcbiAgICAgIChjbGljaykgPT5cclxuICAgICAgICBpZiBjbGlja1xyXG4gICAgICAgICAgQG5ld0dhbWUoKVxyXG4gICAgICAgIHJldHVybiBcIlN0YXJ0XCJcclxuICAgIF1cclxuXHJcbiAgICBAcGF1c2VNZW51ID0gbmV3IE1lbnUgdGhpcywgXCJQYXVzZWRcIiwgXCJzb2xpZFwiLCBAY29sb3JzLnBhdXNlbWVudSwgW1xyXG4gICAgICAoY2xpY2spID0+XHJcbiAgICAgICAgaWYgY2xpY2tcclxuICAgICAgICAgIEBwYXVzZWQgPSBmYWxzZVxyXG4gICAgICAgIHJldHVybiBcIlJlc3VtZSBHYW1lXCJcclxuICAgICAgKGNsaWNrKSA9PlxyXG4gICAgICAgIGlmIGNsaWNrXHJcbiAgICAgICAgICBAbmV3R2FtZSgpXHJcbiAgICAgICAgICBAcGF1c2VkID0gZmFsc2VcclxuICAgICAgICByZXR1cm4gXCJOZXcgR2FtZVwiXHJcbiAgICAgIChjbGljaykgPT5cclxuICAgICAgICBpZiBjbGlja1xyXG4gICAgICAgICAgQGhvd3RvID0gMVxyXG4gICAgICAgIHJldHVybiBcIkhvdyBUbyBQbGF5XCJcclxuICAgICAgKGNsaWNrKSA9PlxyXG4gICAgICAgIGlmIGNsaWNrXHJcbiAgICAgICAgICBAb3B0aW9ucy5zcGVlZEluZGV4ID0gKEBvcHRpb25zLnNwZWVkSW5kZXggKyAxKSAlIEBvcHRpb25NZW51cy5zcGVlZHMubGVuZ3RoXHJcbiAgICAgICAgcmV0dXJuIEBvcHRpb25NZW51cy5zcGVlZHNbQG9wdGlvbnMuc3BlZWRJbmRleF0udGV4dFxyXG4gICAgICAoY2xpY2spID0+XHJcbiAgICAgICAgaWYgY2xpY2tcclxuICAgICAgICAgIEBvcHRpb25zLnNvcnRJbmRleCA9IChAb3B0aW9ucy5zb3J0SW5kZXggKyAxKSAlIEBvcHRpb25NZW51cy5zb3J0cy5sZW5ndGhcclxuICAgICAgICByZXR1cm4gQG9wdGlvbk1lbnVzLnNvcnRzW0BvcHRpb25zLnNvcnRJbmRleF0udGV4dFxyXG4gICAgXVxyXG5cclxuICAgIEBuZXdHYW1lKClcclxuXHJcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICMgbG9nZ2luZ1xyXG5cclxuICBsb2c6IChzKSAtPlxyXG4gICAgQG5hdGl2ZS5sb2cocylcclxuXHJcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICMgbG9hZCAvIHNhdmVcclxuXHJcbiAgbG9hZDogKGpzb24pIC0+XHJcbiAgICBAbG9nIFwiKENTKSBsb2FkaW5nIHN0YXRlXCJcclxuICAgIHRyeVxyXG4gICAgICBzdGF0ZSA9IEpTT04ucGFyc2UganNvblxyXG4gICAgY2F0Y2hcclxuICAgICAgQGxvZyBcImxvYWQgZmFpbGVkIHRvIHBhcnNlIHN0YXRlOiAje2pzb259XCJcclxuICAgICAgcmV0dXJuXHJcbiAgICBpZiBzdGF0ZS5vcHRpb25zXHJcbiAgICAgIGZvciBrLCB2IG9mIHN0YXRlLm9wdGlvbnNcclxuICAgICAgICBAb3B0aW9uc1trXSA9IHZcclxuXHJcbiAgICBpZiBzdGF0ZS50aGlydGVlblxyXG4gICAgICBAbG9nIFwicmVjcmVhdGluZyBnYW1lIGZyb20gc2F2ZWRhdGFcIlxyXG4gICAgICBAdGhpcnRlZW4gPSBuZXcgVGhpcnRlZW4gdGhpcywge1xyXG4gICAgICAgIHN0YXRlOiBzdGF0ZS50aGlydGVlblxyXG4gICAgICB9XHJcbiAgICAgIEBwcmVwYXJlR2FtZSgpXHJcblxyXG4gIHNhdmU6IC0+XHJcbiAgICAjIEBsb2cgXCIoQ1MpIHNhdmluZyBzdGF0ZVwiXHJcbiAgICBzdGF0ZSA9IHtcclxuICAgICAgb3B0aW9uczogQG9wdGlvbnNcclxuICAgIH1cclxuXHJcbiAgICAjIFRPRE86IEVOQUJMRSBTQVZJTkcgSEVSRVxyXG4gICAgIyBpZiBAdGhpcnRlZW4/XHJcbiAgICAjICAgc3RhdGUudGhpcnRlZW4gPSBAdGhpcnRlZW4uc2F2ZSgpXHJcblxyXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5IHN0YXRlXHJcblxyXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgYWlUaWNrUmF0ZTogLT5cclxuICAgIHJldHVybiBAb3B0aW9uTWVudXMuc3BlZWRzW0BvcHRpb25zLnNwZWVkSW5kZXhdLnNwZWVkXHJcblxyXG4gIG5ld0dhbWU6IC0+XHJcbiAgICBAdGhpcnRlZW4gPSBuZXcgVGhpcnRlZW4gdGhpcywge31cclxuICAgIEBsb2cgXCJwbGF5ZXIgMCdzIGhhbmQ6IFwiICsgSlNPTi5zdHJpbmdpZnkoQHRoaXJ0ZWVuLnBsYXllcnNbMF0uaGFuZClcclxuICAgIEBwcmVwYXJlR2FtZSgpXHJcblxyXG4gIHByZXBhcmVHYW1lOiAtPlxyXG4gICAgQGhhbmQgPSBuZXcgSGFuZCB0aGlzXHJcbiAgICBAcGlsZSA9IG5ldyBQaWxlIHRoaXMsIEBoYW5kXHJcbiAgICBAaGFuZC5zZXQgQHRoaXJ0ZWVuLnBsYXllcnNbMF0uaGFuZFxyXG5cclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgIyBpbnB1dCBoYW5kbGluZ1xyXG5cclxuICB0b3VjaERvd246ICh4LCB5KSAtPlxyXG4gICAgIyBAbG9nKFwidG91Y2hEb3duICN7eH0sI3t5fVwiKVxyXG4gICAgQGNoZWNrWm9uZXMoeCwgeSlcclxuXHJcbiAgdG91Y2hNb3ZlOiAoeCwgeSkgLT5cclxuICAgICMgQGxvZyhcInRvdWNoTW92ZSAje3h9LCN7eX1cIilcclxuICAgIGlmIEB0aGlydGVlbiAhPSBudWxsXHJcbiAgICAgIEBoYW5kLm1vdmUoeCwgeSlcclxuXHJcbiAgdG91Y2hVcDogKHgsIHkpIC0+XHJcbiAgICAjIEBsb2coXCJ0b3VjaFVwICN7eH0sI3t5fVwiKVxyXG4gICAgaWYgQHRoaXJ0ZWVuICE9IG51bGxcclxuICAgICAgQGhhbmQudXAoeCwgeSlcclxuXHJcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICMgaGVhZGxpbmUgKGdhbWUgc3RhdGUgaW4gdG9wIGxlZnQpXHJcblxyXG4gIHByZXR0eUVycm9yVGFibGU6IHtcclxuICAgICMgYmlkT3V0T2ZSYW5nZTogICAgICBcIllvdSBhcmUgc29tZWhvdyBiaWRkaW5nIGFuIGltcG9zc2libGUgdmFsdWUuIFRoZSBnYW1lIG11c3QgYmUgYnJva2VuLlwiXHJcbiAgICAjIGRlYWxlckZ1Y2tlZDogICAgICAgXCJEZWFsZXIgcmVzdHJpY3Rpb246IFlvdSBtYXkgbm90IG1ha2UgdG90YWwgYmlkcyBtYXRjaCB0b3RhbCB0cmlja3MuXCJcclxuICAgICMgZG9Ob3RIYXZlOiAgICAgICAgICBcIllvdSBhcmUgc29tZWhvdyBhdHRlbXB0aW5nIHRvIHBsYXkgYSBjYXJkIHlvdSBkb24ndCBvd24uIFRoZSBnYW1lIG11c3QgYmUgYnJva2VuLlwiXHJcbiAgICAjIGZvcmNlZEhpZ2hlckluU3VpdDogXCJZb3UgaGF2ZSBhIGhpZ2hlciB2YWx1ZSBpbiB0aGUgbGVhZCBzdWl0LiBZb3UgbXVzdCBwbGF5IGl0LiAoUnVsZSAyKVwiXHJcbiAgICAjIGZvcmNlZEluU3VpdDogICAgICAgXCJZb3UgaGF2ZSBhdCBsZWFzdCBvbmUgb2YgdGhlIGxlYWQgc3VpdC4gWW91IG11c3QgcGxheSBpdC4gKFJ1bGUgMSlcIlxyXG4gICAgIyBnYW1lT3ZlcjogICAgICAgICAgIFwiVGhlIGdhbWUgaXMgb3Zlci4gIFRoZSBnYW1lIG11c3QgYmUgYnJva2VuLlwiXHJcbiAgICAjIGluZGV4T3V0T2ZSYW5nZTogICAgXCJZb3UgZG9uJ3QgaGF2ZSB0aGF0IGluZGV4LiBUaGUgZ2FtZSBtdXN0IGJlIGJyb2tlbi5cIlxyXG4gICAgIyBsb3dlc3RDYXJkUmVxdWlyZWQ6IFwiWW91IG11c3Qgc3RhcnQgdGhlIHJvdW5kIHdpdGggdGhlIGxvd2VzdCBjYXJkIHlvdSBoYXZlLlwiXHJcbiAgICAjIG5leHRJc0NvbmZ1c2VkOiAgICAgXCJJbnRlcmFsIGVycm9yLiBUaGUgZ2FtZSBtdXN0IGJlIGJyb2tlbi5cIlxyXG4gICAgIyBub05leHQ6ICAgICAgICAgICAgIFwiSW50ZXJhbCBlcnJvci4gVGhlIGdhbWUgbXVzdCBiZSBicm9rZW4uXCJcclxuICAgICMgbm90QmlkZGluZ05vdzogICAgICBcIllvdSBhcmUgdHJ5aW5nIHRvIGJpZCBkdXJpbmcgdGhlIHdyb25nIHBoYXNlLlwiXHJcbiAgICAjIG5vdEVub3VnaFBsYXllcnM6ICAgXCJDYW5ub3Qgc3RhcnQgdGhlIGdhbWUgd2l0aG91dCBtb3JlIHBsYXllcnMuXCJcclxuICAgICMgbm90SW5UcmljazogICAgICAgICBcIllvdSBhcmUgdHJ5aW5nIHRvIHBsYXkgYSBjYXJkIGR1cmluZyB0aGUgd3JvbmcgcGhhc2UuXCJcclxuICAgICMgbm90WW91clR1cm46ICAgICAgICBcIkl0IGlzbid0IHlvdXIgdHVybi5cIlxyXG4gICAgIyB0cnVtcE5vdEJyb2tlbjogICAgIFwiVHJ1bXAgaXNuJ3QgYnJva2VuIHlldC4gTGVhZCB3aXRoIGEgbm9uLXNwYWRlLlwiXHJcbiAgfVxyXG5cclxuICBwcmV0dHlFcnJvcjogLT5cclxuICAgIHByZXR0eSA9IEBwcmV0dHlFcnJvclRhYmxlW0BsYXN0RXJyXVxyXG4gICAgcmV0dXJuIHByZXR0eSBpZiBwcmV0dHlcclxuICAgIHJldHVybiBAbGFzdEVyclxyXG5cclxuICBjYWxjSGVhZGxpbmU6IC0+XHJcbiAgICByZXR1cm4gXCJcIiBpZiBAdGhpcnRlZW4gPT0gbnVsbFxyXG5cclxuICAgIGhlYWRsaW5lID0gXCJcIlxyXG4gICAgIyBzd2l0Y2ggQHRoaXJ0ZWVuLnN0YXRlXHJcbiAgICAjICAgd2hlbiBTdGF0ZS5CSURcclxuICAgICMgICAgIGhlYWRsaW5lID0gXCJXYWl0aW5nIGZvciBgZmY3NzAwYCN7QHRoaXJ0ZWVuLnBsYXllcnNbQHRoaXJ0ZWVuLnR1cm5dLm5hbWV9YGAgdG8gYGZmZmYwMGBiaWRgYFwiXHJcbiAgICAjICAgd2hlbiBTdGF0ZS5UUklDS1xyXG4gICAgIyAgICAgaGVhZGxpbmUgPSBcIldhaXRpbmcgZm9yIGBmZjc3MDBgI3tAdGhpcnRlZW4ucGxheWVyc1tAdGhpcnRlZW4udHVybl0ubmFtZX1gYCB0byBgZmZmZjAwYHBsYXlgYFwiXHJcbiAgICAjICAgd2hlbiBTdGF0ZS5ST1VORFNVTU1BUllcclxuICAgICMgICAgIGhlYWRsaW5lID0gXCJXYWl0aW5nIGZvciBuZXh0IHJvdW5kLi4uXCJcclxuICAgICMgICB3aGVuIFN0YXRlLlBPU1RHQU1FU1VNTUFSWVxyXG4gICAgIyAgICAgaGVhZGxpbmUgPSBcIkdhbWUgb3ZlciFcIlxyXG5cclxuICAgIGVyclRleHQgPSBcIlwiXHJcbiAgICBpZiAoQGxhc3RFcnIubGVuZ3RoID4gMCkgYW5kIChAbGFzdEVyciAhPSBPSylcclxuICAgICAgZXJyVGV4dCA9IFwiICBFUlJPUjogYGZmMDAwMGAje0BwcmV0dHlFcnJvcigpfVwiXHJcbiAgICAgIGhlYWRsaW5lICs9IGVyclRleHRcclxuXHJcbiAgICByZXR1cm4gaGVhZGxpbmVcclxuXHJcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICMgZ2FtZSBvdmVyIGluZm9ybWF0aW9uXHJcblxyXG4gIGdhbWVPdmVyVGV4dDogLT5cclxuICAgIHdpbm5lciA9IEB0aGlydGVlbi53aW5uZXIoKVxyXG4gICAgaWYgd2lubmVyLm5hbWUgPT0gXCJQbGF5ZXJcIlxyXG4gICAgICByZXR1cm4gW1wiWW91IHdpbiFcIl1cclxuICAgIHJldHVybiBbXCIje3dpbm5lci5uYW1lfSB3aW5zIVwiXVxyXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAjIGNhcmQgaGFuZGxpbmdcclxuXHJcbiAgcGFzczogLT5cclxuICAgIEBsYXN0RXJyID0gQHRoaXJ0ZWVuLnBhc3Mge1xyXG4gICAgICBpZDogMVxyXG4gICAgfVxyXG5cclxuICBwbGF5OiAoY2FyZHMpIC0+XHJcbiAgICBjb25zb2xlLmxvZyBcIihnYW1lKSBwbGF5aW5nIGNhcmRzXCIsIGNhcmRzXHJcblxyXG4gICAgQHRoaXJ0ZWVuLnVwZGF0ZVBsYXllckhhbmQoQGhhbmQuY2FyZHMpXHJcblxyXG4gICAgcmF3Q2FyZHMgPSBbXVxyXG4gICAgZm9yIGNhcmQgaW4gY2FyZHNcclxuICAgICAgcmF3Q2FyZHMucHVzaCBjYXJkLmNhcmRcclxuXHJcbiAgICByZXQgPSBAdGhpcnRlZW4ucGxheSB7XHJcbiAgICAgIGlkOiAxXHJcbiAgICAgIGNhcmRzOiByYXdDYXJkc1xyXG4gICAgfVxyXG4gICAgQGxhc3RFcnIgPSByZXRcclxuICAgIGlmIHJldCA9PSBPS1xyXG4gICAgICBAaGFuZC5zZXQgQHRoaXJ0ZWVuLnBsYXllcnNbMF0uaGFuZFxyXG4gICAgICBAcGlsZS5oaW50IGNhcmRzXHJcblxyXG4gIHBsYXlQaWNrZWQ6IC0+XHJcbiAgICBpZiBub3QgQGhhbmQucGlja2luZ1xyXG4gICAgICByZXR1cm5cclxuICAgIGNhcmRzID0gQGhhbmQuc2VsZWN0ZWRDYXJkcygpXHJcbiAgICBpZiBjYXJkcy5sZW5ndGggPT0gMFxyXG4gICAgICByZXR1cm4gQHBhc3MoKVxyXG4gICAgIyBAaGFuZC50b2dnbGVQaWNraW5nKClcclxuICAgIHJldHVybiBAcGxheShjYXJkcylcclxuXHJcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICMgbWFpbiBsb29wXHJcblxyXG4gIHVwZGF0ZTogKGR0KSAtPlxyXG4gICAgQHpvbmVzLmxlbmd0aCA9IDAgIyBmb3JnZXQgYWJvdXQgem9uZXMgZnJvbSB0aGUgbGFzdCBmcmFtZS4gd2UncmUgYWJvdXQgdG8gbWFrZSBzb21lIG5ldyBvbmVzIVxyXG5cclxuICAgIHVwZGF0ZWQgPSBmYWxzZVxyXG4gICAgaWYgQHVwZGF0ZU1haW5NZW51KGR0KVxyXG4gICAgICB1cGRhdGVkID0gdHJ1ZVxyXG4gICAgaWYgQHVwZGF0ZUdhbWUoZHQpXHJcbiAgICAgIHVwZGF0ZWQgPSB0cnVlXHJcblxyXG4gICAgcmV0dXJuIHVwZGF0ZWRcclxuXHJcbiAgdXBkYXRlTWFpbk1lbnU6IChkdCkgLT5cclxuICAgIHVwZGF0ZWQgPSBmYWxzZVxyXG4gICAgaWYgQG1haW5NZW51LnVwZGF0ZShkdClcclxuICAgICAgdXBkYXRlZCA9IHRydWVcclxuICAgIHJldHVybiB1cGRhdGVkXHJcblxyXG4gIHVwZGF0ZUdhbWU6IChkdCkgLT5cclxuICAgIHJldHVybiBmYWxzZSBpZiBAdGhpcnRlZW4gPT0gbnVsbFxyXG5cclxuICAgIHVwZGF0ZWQgPSBmYWxzZVxyXG5cclxuICAgIGlmIEBwaWxlLnVwZGF0ZShkdClcclxuICAgICAgdXBkYXRlZCA9IHRydWVcclxuICAgIGlmIEBwaWxlLnJlYWR5Rm9yTmV4dFRyaWNrKClcclxuICAgICAgQG5leHRBSVRpY2sgLT0gZHRcclxuICAgICAgaWYgQG5leHRBSVRpY2sgPD0gMFxyXG4gICAgICAgIEBuZXh0QUlUaWNrID0gQGFpVGlja1JhdGUoKVxyXG4gICAgICAgIGlmIEB0aGlydGVlbi5haVRpY2soKVxyXG4gICAgICAgICAgdXBkYXRlZCA9IHRydWVcclxuICAgIGlmIEBoYW5kLnVwZGF0ZShkdClcclxuICAgICAgdXBkYXRlZCA9IHRydWVcclxuXHJcbiAgICBAcGlsZS5zZXQgQHRoaXJ0ZWVuLnRocm93SUQsIEB0aGlydGVlbi5waWxlLCBAdGhpcnRlZW4ucGlsZVdob1xyXG5cclxuICAgIGlmIEBwYXVzZU1lbnUudXBkYXRlKGR0KVxyXG4gICAgICB1cGRhdGVkID0gdHJ1ZVxyXG5cclxuICAgIHJldHVybiB1cGRhdGVkXHJcblxyXG4gIHJlbmRlcjogLT5cclxuICAgICMgUmVzZXQgcmVuZGVyIGNvbW1hbmRzXHJcbiAgICBAcmVuZGVyQ29tbWFuZHMubGVuZ3RoID0gMFxyXG5cclxuICAgIGlmIEBob3d0byA+IDBcclxuICAgICAgQHJlbmRlckhvd3RvKClcclxuICAgIGVsc2UgaWYgQHRoaXJ0ZWVuID09IG51bGxcclxuICAgICAgQHJlbmRlck1haW5NZW51KClcclxuICAgIGVsc2VcclxuICAgICAgQHJlbmRlckdhbWUoKVxyXG5cclxuICAgIHJldHVybiBAcmVuZGVyQ29tbWFuZHNcclxuXHJcbiAgcmVuZGVySG93dG86IC0+XHJcbiAgICBob3d0b1RleHR1cmUgPSBcImhvd3RvI3tAaG93dG99XCJcclxuICAgIEBsb2cgXCJyZW5kZXJpbmcgI3tob3d0b1RleHR1cmV9XCJcclxuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJzb2xpZFwiLCAwLCAwLCBAd2lkdGgsIEBoZWlnaHQsIDAsIDAsIDAsIEBjb2xvcnMuYmxhY2tcclxuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgaG93dG9UZXh0dXJlLCAwLCAwLCBAd2lkdGgsIEBhYUhlaWdodCwgMCwgMCwgMCwgQGNvbG9ycy53aGl0ZVxyXG4gICAgYXJyb3dXaWR0aCA9IEB3aWR0aCAvIDIwXHJcbiAgICBhcnJvd09mZnNldCA9IGFycm93V2lkdGggKiA0XHJcbiAgICBjb2xvciA9IGlmIEBob3d0byA9PSAxIHRoZW4gQGNvbG9ycy5hcnJvd2Nsb3NlIGVsc2UgQGNvbG9ycy5hcnJvd1xyXG4gICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcImFycm93TFwiLCBAY2VudGVyLnggLSBhcnJvd09mZnNldCwgQGhlaWdodCwgYXJyb3dXaWR0aCwgMCwgMCwgMC41LCAxLCBjb2xvciwgPT5cclxuICAgICAgQGhvd3RvLS1cclxuICAgICAgaWYgQGhvd3RvIDwgMFxyXG4gICAgICAgIEBob3d0byA9IDBcclxuICAgIGNvbG9yID0gaWYgQGhvd3RvID09IDMgdGhlbiBAY29sb3JzLmFycm93Y2xvc2UgZWxzZSBAY29sb3JzLmFycm93XHJcbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwiYXJyb3dSXCIsIEBjZW50ZXIueCArIGFycm93T2Zmc2V0LCBAaGVpZ2h0LCBhcnJvd1dpZHRoLCAwLCAwLCAwLjUsIDEsIGNvbG9yLCA9PlxyXG4gICAgICBAaG93dG8rK1xyXG4gICAgICBpZiBAaG93dG8gPiAzXHJcbiAgICAgICAgQGhvd3RvID0gMFxyXG5cclxuICByZW5kZXJNYWluTWVudTogLT5cclxuICAgIEBtYWluTWVudS5yZW5kZXIoKVxyXG5cclxuICByZW5kZXJHYW1lOiAtPlxyXG5cclxuICAgICMgYmFja2dyb3VuZFxyXG4gICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcInNvbGlkXCIsIDAsIDAsIEB3aWR0aCwgQGhlaWdodCwgMCwgMCwgMCwgQGNvbG9ycy5iYWNrZ3JvdW5kXHJcblxyXG4gICAgdGV4dEhlaWdodCA9IEBhYUhlaWdodCAvIDI1XHJcbiAgICB0ZXh0UGFkZGluZyA9IHRleHRIZWlnaHQgLyA1XHJcbiAgICBjaGFyYWN0ZXJIZWlnaHQgPSBAYWFIZWlnaHQgLyA1XHJcbiAgICBjb3VudEhlaWdodCA9IHRleHRIZWlnaHRcclxuXHJcbiAgICAjIExvZ1xyXG4gICAgZm9yIGxpbmUsIGkgaW4gQHRoaXJ0ZWVuLmxvZ1xyXG4gICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgdGV4dEhlaWdodCwgbGluZSwgMCwgKGkrMSkgKiAodGV4dEhlaWdodCArIHRleHRQYWRkaW5nKSwgMCwgMCwgQGNvbG9ycy53aGl0ZVxyXG5cclxuICAgIGFpUGxheWVycyA9IFtcclxuICAgICAgQHRoaXJ0ZWVuLnBsYXllcnNbMV1cclxuICAgICAgQHRoaXJ0ZWVuLnBsYXllcnNbMl1cclxuICAgICAgQHRoaXJ0ZWVuLnBsYXllcnNbM11cclxuICAgIF1cclxuXHJcbiAgICBjaGFyYWN0ZXJNYXJnaW4gPSBjaGFyYWN0ZXJIZWlnaHQgLyAyXHJcbiAgICBAY2hhckNlaWxpbmcgPSBAaGVpZ2h0ICogMC42XHJcblxyXG4gICAgIyBsZWZ0IHNpZGVcclxuICAgIGlmIGFpUGxheWVyc1swXSAhPSBudWxsXHJcbiAgICAgIGNoYXJhY3RlciA9IGFpQ2hhcmFjdGVyc1thaVBsYXllcnNbMF0uY2hhcklEXVxyXG4gICAgICBjaGFyYWN0ZXJXaWR0aCA9IEBzcHJpdGVSZW5kZXJlci5jYWxjV2lkdGgoY2hhcmFjdGVyLnNwcml0ZSwgY2hhcmFjdGVySGVpZ2h0KVxyXG4gICAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIGNoYXJhY3Rlci5zcHJpdGUsIGNoYXJhY3Rlck1hcmdpbiwgQGNoYXJDZWlsaW5nLCAwLCBjaGFyYWN0ZXJIZWlnaHQsIDAsIDAsIDEsIEBjb2xvcnMud2hpdGVcclxuICAgICAgQHJlbmRlckNvdW50IGFpUGxheWVyc1swXSwgYWlQbGF5ZXJzWzBdLmluZGV4ID09IEB0aGlydGVlbi50dXJuLCBjb3VudEhlaWdodCwgY2hhcmFjdGVyTWFyZ2luICsgKGNoYXJhY3RlcldpZHRoIC8gMiksIEBjaGFyQ2VpbGluZyAtIHRleHRQYWRkaW5nLCAwLjUsIDBcclxuICAgICAgQHJlbmRlckFJSGFuZCBhaVBsYXllcnNbMF0uY291bnQsIGNoYXJhY3Rlck1hcmdpbiArIChjaGFyYWN0ZXJXaWR0aCAvIDIpLCBAY2hhckNlaWxpbmcgLSB0ZXh0UGFkZGluZywgMC41LCAwXHJcbiAgICAjIHRvcCBzaWRlXHJcbiAgICBpZiBhaVBsYXllcnNbMV0gIT0gbnVsbFxyXG4gICAgICBjaGFyYWN0ZXIgPSBhaUNoYXJhY3RlcnNbYWlQbGF5ZXJzWzFdLmNoYXJJRF1cclxuICAgICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBjaGFyYWN0ZXIuc3ByaXRlLCBAY2VudGVyLngsIDAsIDAsIGNoYXJhY3RlckhlaWdodCwgMCwgMC41LCAwLCBAY29sb3JzLndoaXRlXHJcbiAgICAgIEByZW5kZXJDb3VudCBhaVBsYXllcnNbMV0sIGFpUGxheWVyc1sxXS5pbmRleCA9PSBAdGhpcnRlZW4udHVybiwgY291bnRIZWlnaHQsIEBjZW50ZXIueCwgY2hhcmFjdGVySGVpZ2h0LCAwLjUsIDBcclxuICAgICAgQHJlbmRlckFJSGFuZCBhaVBsYXllcnNbMF0uY291bnQsIGNoYXJhY3Rlck1hcmdpbiArIChjaGFyYWN0ZXJXaWR0aCAvIDIpLCBAY2hhckNlaWxpbmcgLSB0ZXh0UGFkZGluZywgMC41LCAwXHJcbiAgICAjIHJpZ2h0IHNpZGVcclxuICAgIGlmIGFpUGxheWVyc1syXSAhPSBudWxsXHJcbiAgICAgIGNoYXJhY3RlciA9IGFpQ2hhcmFjdGVyc1thaVBsYXllcnNbMl0uY2hhcklEXVxyXG4gICAgICBjaGFyYWN0ZXJXaWR0aCA9IEBzcHJpdGVSZW5kZXJlci5jYWxjV2lkdGgoY2hhcmFjdGVyLnNwcml0ZSwgY2hhcmFjdGVySGVpZ2h0KVxyXG4gICAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIGNoYXJhY3Rlci5zcHJpdGUsIEB3aWR0aCAtIGNoYXJhY3Rlck1hcmdpbiwgQGNoYXJDZWlsaW5nLCAwLCBjaGFyYWN0ZXJIZWlnaHQsIDAsIDEsIDEsIEBjb2xvcnMud2hpdGVcclxuICAgICAgQHJlbmRlckNvdW50IGFpUGxheWVyc1syXSwgYWlQbGF5ZXJzWzJdLmluZGV4ID09IEB0aGlydGVlbi50dXJuLCBjb3VudEhlaWdodCwgQHdpZHRoIC0gKGNoYXJhY3Rlck1hcmdpbiArIChjaGFyYWN0ZXJXaWR0aCAvIDIpKSwgQGNoYXJDZWlsaW5nIC0gdGV4dFBhZGRpbmcsIDAuNSwgMFxyXG4gICAgICBAcmVuZGVyQUlIYW5kIGFpUGxheWVyc1swXS5jb3VudCwgY2hhcmFjdGVyTWFyZ2luICsgKGNoYXJhY3RlcldpZHRoIC8gMiksIEBjaGFyQ2VpbGluZyAtIHRleHRQYWRkaW5nLCAwLjUsIDBcclxuXHJcbiAgICAjIGNhcmQgYXJlYVxyXG4gICAgaGFuZEFyZWFIZWlnaHQgPSAwLjI3ICogQGhlaWdodFxyXG4gICAgaWYgQGhhbmQucGlja2luZ1xyXG4gICAgICBoYW5kYXJlYUNvbG9yID0gQGNvbG9ycy5oYW5kX3BpY2tcclxuICAgIGVsc2VcclxuICAgICAgaGFuZGFyZWFDb2xvciA9IEBjb2xvcnMuaGFuZF9yZW9yZ1xyXG4gICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcInNvbGlkXCIsIDAsIEBoZWlnaHQsIEB3aWR0aCwgaGFuZEFyZWFIZWlnaHQsIDAsIDAsIDEsIGhhbmRhcmVhQ29sb3IsID0+XHJcbiAgICAgIEBoYW5kLnRvZ2dsZVBpY2tpbmcoKVxyXG5cclxuICAgICMgcGlsZVxyXG4gICAgcGlsZURpbWVuc2lvbiA9IEBoZWlnaHQgKiAwLjRcclxuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJwaWxlXCIsIEB3aWR0aCAvIDIsIEBoZWlnaHQgLyAyLCBwaWxlRGltZW5zaW9uLCBwaWxlRGltZW5zaW9uLCAwLCAwLjUsIDAuNSwgQGNvbG9ycy53aGl0ZSwgPT5cclxuICAgICAgQHBsYXlQaWNrZWQoKVxyXG4gICAgQHBpbGUucmVuZGVyKClcclxuXHJcbiAgICBAaGFuZC5yZW5kZXIoKVxyXG4gICAgQHJlbmRlckNvdW50IEB0aGlydGVlbi5wbGF5ZXJzWzBdLCAwID09IEB0aGlydGVlbi50dXJuLCBjb3VudEhlaWdodCwgQGNlbnRlci54LCBAaGVpZ2h0LCAwLjUsIDFcclxuXHJcbiAgICBpZiBAdGhpcnRlZW4ud2lubmVyKCkgYW5kIEBwaWxlLnJlc3RpbmcoKVxyXG4gICAgICBsaW5lcyA9IEBnYW1lT3ZlclRleHQoKVxyXG4gICAgICBnYW1lT3ZlclNpemUgPSBAYWFIZWlnaHQgLyA4XHJcbiAgICAgIGdhbWVPdmVyWSA9IEBjZW50ZXIueVxyXG4gICAgICBpZiBsaW5lcy5sZW5ndGggPiAxXHJcbiAgICAgICAgZ2FtZU92ZXJZIC09IChnYW1lT3ZlclNpemUgPj4gMSlcclxuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIGdhbWVPdmVyU2l6ZSwgbGluZXNbMF0sIEBjZW50ZXIueCwgZ2FtZU92ZXJZLCAwLjUsIDAuNSwgQGNvbG9ycy5vcmFuZ2VcclxuICAgICAgaWYgbGluZXMubGVuZ3RoID4gMVxyXG4gICAgICAgIGdhbWVPdmVyWSArPSBnYW1lT3ZlclNpemVcclxuICAgICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgZ2FtZU92ZXJTaXplLCBsaW5lc1sxXSwgQGNlbnRlci54LCBnYW1lT3ZlclksIDAuNSwgMC41LCBAY29sb3JzLm9yYW5nZVxyXG5cclxuICAgICAgcmVzdGFydFF1aXRTaXplID0gQGFhSGVpZ2h0IC8gMTJcclxuICAgICAgc2hhZG93RGlzdGFuY2UgPSByZXN0YXJ0UXVpdFNpemUgLyA4XHJcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCByZXN0YXJ0UXVpdFNpemUsIFwiUGxheSBBZ2FpblwiLCBzaGFkb3dEaXN0YW5jZSArIEBjZW50ZXIueCwgc2hhZG93RGlzdGFuY2UgKyAoQGhlaWdodCAtIChoYW5kQXJlYUhlaWdodCAqIDAuNSkpLCAwLjUsIDEsIEBjb2xvcnMuYmxhY2ssID0+XHJcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCByZXN0YXJ0UXVpdFNpemUsIFwiUGxheSBBZ2FpblwiLCBAY2VudGVyLngsIEBoZWlnaHQgLSAoaGFuZEFyZWFIZWlnaHQgKiAwLjUpLCAwLjUsIDEsIEBjb2xvcnMuZ29sZCwgPT5cclxuICAgICAgICBAdGhpcnRlZW4uZGVhbCgpXHJcbiAgICAgICAgQHByZXBhcmVHYW1lKClcclxuXHJcbiAgICAjIEhlYWRsaW5lIChpbmNsdWRlcyBlcnJvcilcclxuICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCB0ZXh0SGVpZ2h0LCBAY2FsY0hlYWRsaW5lKCksIDAsIDAsIDAsIDAsIEBjb2xvcnMubGlnaHRncmF5XHJcblxyXG4gICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcInBhdXNlXCIsIEB3aWR0aCwgMCwgMCwgQHBhdXNlQnV0dG9uU2l6ZSwgMCwgMSwgMCwgQGNvbG9ycy53aGl0ZSwgPT5cclxuICAgICAgQHBhdXNlZCA9IHRydWVcclxuXHJcbiAgICBpZiBub3QgQGhhbmQucGlja2luZ1xyXG4gICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgdGV4dEhlaWdodCwgXCJVbmxvY2tlZFwiLCAwLjAyICogQHdpZHRoLCBAaGVpZ2h0IC0gaGFuZEFyZWFIZWlnaHQsIDAsIDAsIEBjb2xvcnMud2hpdGVcclxuXHJcbiAgICBpZiBAcGF1c2VkXHJcbiAgICAgIEBwYXVzZU1lbnUucmVuZGVyKClcclxuXHJcbiAgICByZXR1cm5cclxuXHJcbiAgcmVuZGVyQ291bnQ6IChwbGF5ZXIsIG15VHVybiwgY291bnRIZWlnaHQsIHgsIHksIGFuY2hvcngsIGFuY2hvcnkpIC0+XHJcbiAgICBpZiBteVR1cm5cclxuICAgICAgbmFtZUNvbG9yID0gXCJgZmY3NzAwYFwiXHJcbiAgICBlbHNlXHJcbiAgICAgIG5hbWVDb2xvciA9IFwiXCJcclxuICAgIG5hbWVTdHJpbmcgPSBcIiAje25hbWVDb2xvcn0je3BsYXllci5uYW1lfWBgIFwiXHJcbiAgICBjYXJkQ291bnQgPSBwbGF5ZXIuaGFuZC5sZW5ndGhcclxuICAgIGlmIGNhcmRDb3VudCA+IDFcclxuICAgICAgdHJpY2tDb2xvciA9IFwiZmZmZjMzXCJcclxuICAgIGVsc2VcclxuICAgICAgdHJpY2tDb2xvciA9IFwiZmYzMzMzXCJcclxuICAgIGNvdW50U3RyaW5nID0gXCIgYCN7dHJpY2tDb2xvcn1gI3tjYXJkQ291bnR9YGAgbGVmdCBcIlxyXG5cclxuICAgIG5hbWVTaXplID0gQGZvbnRSZW5kZXJlci5zaXplKEBmb250LCBjb3VudEhlaWdodCwgbmFtZVN0cmluZylcclxuICAgIGNvdW50U2l6ZSA9IEBmb250UmVuZGVyZXIuc2l6ZShAZm9udCwgY291bnRIZWlnaHQsIGNvdW50U3RyaW5nKVxyXG4gICAgaWYgbmFtZVNpemUudyA+IGNvdW50U2l6ZS53XHJcbiAgICAgIGNvdW50U2l6ZS53ID0gbmFtZVNpemUud1xyXG4gICAgZWxzZVxyXG4gICAgICBuYW1lU2l6ZS53ID0gY291bnRTaXplLndcclxuICAgIG5hbWVZID0geVxyXG4gICAgY291bnRZID0geVxyXG4gICAgYm94SGVpZ2h0ID0gY291bnRTaXplLmhcclxuICAgIGlmIHBsYXllci5pZCAhPSAxXHJcbiAgICAgIGJveEhlaWdodCAqPSAyXHJcbiAgICAgIGlmIGFuY2hvcnkgPiAwXHJcbiAgICAgICAgbmFtZVkgLT0gY291bnRIZWlnaHRcclxuICAgICAgZWxzZVxyXG4gICAgICAgIGNvdW50WSArPSBjb3VudEhlaWdodFxyXG4gICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcInNvbGlkXCIsIHgsIHksIGNvdW50U2l6ZS53LCBib3hIZWlnaHQsIDAsIGFuY2hvcngsIGFuY2hvcnksIEBjb2xvcnMub3ZlcmxheVxyXG4gICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIGNvdW50SGVpZ2h0LCBuYW1lU3RyaW5nLCB4LCBuYW1lWSwgYW5jaG9yeCwgYW5jaG9yeSwgQGNvbG9ycy53aGl0ZVxyXG4gICAgaWYgcGxheWVyLmlkICE9IDFcclxuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIGNvdW50SGVpZ2h0LCBjb3VudFN0cmluZywgeCwgY291bnRZLCBhbmNob3J4LCBhbmNob3J5LCBAY29sb3JzLndoaXRlXHJcblxyXG4gIHJlbmRlckFJSGFuZDogKGNhcmRDb3VudCwgY291bnRIZWlnaHQsIHgsIHksIGFuY2hvcngsIGFuY2hvcnkpIC0+XHJcbiAgICAjIFRPRE86IG1ha2UgdGhpcyBkcmF3IGEgdGlueSBoYW5kIG9mIGNhcmRzIG9uIHRoZSBBSSBjaGFyc1xyXG5cclxuICAgICMgY2FyZEhlaWdodCA9IE1hdGguZmxvb3IoQGhlaWdodCAqIENBUkRfUkVOREVSX1NDQUxFKVxyXG4gICAgIyBjYXJkV2lkdGggID0gTWF0aC5mbG9vcihjYXJkSGVpZ2h0ICogQ0FSRF9JTUFHRV9XIC8gQ0FSRF9JTUFHRV9IKVxyXG4gICAgIyBAZ2FtZS5kcmF3SW1hZ2UgXCJjYXJkc1wiLFxyXG4gICAgIyBIYW5kLkNBUkRfSU1BR0VfT0ZGX1ggKyAoSGFuZC5DQVJEX0lNQUdFX0FEVl9YICogcmFuayksIEhhbmQuQ0FSRF9JTUFHRV9PRkZfWSArIChIYW5kLkNBUkRfSU1BR0VfQURWX1kgKiBzdWl0KSwgSGFuZC5DQVJEX0lNQUdFX1csIEhhbmQuQ0FSRF9JTUFHRV9ILFxyXG4gICAgIyB4LCB5LCBAY2FyZFdpZHRoICogc2NhbGUsIEBjYXJkSGVpZ2h0ICogc2NhbGUsXHJcbiAgICAjIHJvdCwgMC41LCAwLjUsIDEsMSwxLDEsIGNiXHJcblxyXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAjIHJlbmRlcmluZyBhbmQgem9uZXNcclxuXHJcbiAgZHJhd0ltYWdlOiAodGV4dHVyZSwgc3gsIHN5LCBzdywgc2gsIGR4LCBkeSwgZHcsIGRoLCByb3QsIGFuY2hvcngsIGFuY2hvcnksIHIsIGcsIGIsIGEsIGNiKSAtPlxyXG4gICAgQHJlbmRlckNvbW1hbmRzLnB1c2ggQHRleHR1cmVzW3RleHR1cmVdLCBzeCwgc3ksIHN3LCBzaCwgZHgsIGR5LCBkdywgZGgsIHJvdCwgYW5jaG9yeCwgYW5jaG9yeSwgciwgZywgYiwgYVxyXG5cclxuICAgIGlmIGNiP1xyXG4gICAgICAjIGNhbGxlciB3YW50cyB0byByZW1lbWJlciB3aGVyZSB0aGlzIHdhcyBkcmF3biwgYW5kIHdhbnRzIHRvIGJlIGNhbGxlZCBiYWNrIGlmIGl0IGlzIGV2ZXIgdG91Y2hlZFxyXG4gICAgICAjIFRoaXMgaXMgY2FsbGVkIGEgXCJ6b25lXCIuIFNpbmNlIHpvbmVzIGFyZSB0cmF2ZXJzZWQgaW4gcmV2ZXJzZSBvcmRlciwgdGhlIG5hdHVyYWwgb3ZlcmxhcCBvZlxyXG4gICAgICAjIGEgc2VyaWVzIG9mIHJlbmRlcnMgaXMgcmVzcGVjdGVkIGFjY29yZGluZ2x5LlxyXG4gICAgICBhbmNob3JPZmZzZXRYID0gLTEgKiBhbmNob3J4ICogZHdcclxuICAgICAgYW5jaG9yT2Zmc2V0WSA9IC0xICogYW5jaG9yeSAqIGRoXHJcbiAgICAgIHpvbmUgPVxyXG4gICAgICAgICMgY2VudGVyIChYLFkpIGFuZCByZXZlcnNlZCByb3RhdGlvbiwgdXNlZCB0byBwdXQgdGhlIGNvb3JkaW5hdGUgaW4gbG9jYWwgc3BhY2UgdG8gdGhlIHpvbmVcclxuICAgICAgICBjeDogIGR4XHJcbiAgICAgICAgY3k6ICBkeVxyXG4gICAgICAgIHJvdDogcm90ICogLTFcclxuICAgICAgICAjIHRoZSBheGlzIGFsaWduZWQgYm91bmRpbmcgYm94IHVzZWQgZm9yIGRldGVjdGlvbiBvZiBhIGxvY2Fsc3BhY2UgY29vcmRcclxuICAgICAgICBsOiAgIGFuY2hvck9mZnNldFhcclxuICAgICAgICB0OiAgIGFuY2hvck9mZnNldFlcclxuICAgICAgICByOiAgIGFuY2hvck9mZnNldFggKyBkd1xyXG4gICAgICAgIGI6ICAgYW5jaG9yT2Zmc2V0WSArIGRoXHJcbiAgICAgICAgIyBjYWxsYmFjayB0byBjYWxsIGlmIHRoZSB6b25lIGlzIGNsaWNrZWQgb25cclxuICAgICAgICBjYjogIGNiXHJcbiAgICAgIEB6b25lcy5wdXNoIHpvbmVcclxuXHJcbiAgY2hlY2tab25lczogKHgsIHkpIC0+XHJcbiAgICBmb3Igem9uZSBpbiBAem9uZXMgYnkgLTFcclxuICAgICAgIyBtb3ZlIGNvb3JkIGludG8gc3BhY2UgcmVsYXRpdmUgdG8gdGhlIHF1YWQsIHRoZW4gcm90YXRlIGl0IHRvIG1hdGNoXHJcbiAgICAgIHVucm90YXRlZExvY2FsWCA9IHggLSB6b25lLmN4XHJcbiAgICAgIHVucm90YXRlZExvY2FsWSA9IHkgLSB6b25lLmN5XHJcbiAgICAgIGxvY2FsWCA9IHVucm90YXRlZExvY2FsWCAqIE1hdGguY29zKHpvbmUucm90KSAtIHVucm90YXRlZExvY2FsWSAqIE1hdGguc2luKHpvbmUucm90KVxyXG4gICAgICBsb2NhbFkgPSB1bnJvdGF0ZWRMb2NhbFggKiBNYXRoLnNpbih6b25lLnJvdCkgKyB1bnJvdGF0ZWRMb2NhbFkgKiBNYXRoLmNvcyh6b25lLnJvdClcclxuICAgICAgaWYgKGxvY2FsWCA8IHpvbmUubCkgb3IgKGxvY2FsWCA+IHpvbmUucikgb3IgKGxvY2FsWSA8IHpvbmUudCkgb3IgKGxvY2FsWSA+IHpvbmUuYilcclxuICAgICAgICAjIG91dHNpZGUgb2Ygb3JpZW50ZWQgYm91bmRpbmcgYm94XHJcbiAgICAgICAgY29udGludWVcclxuICAgICAgem9uZS5jYih4LCB5KVxyXG4gICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZVxyXG4iLCJBbmltYXRpb24gPSByZXF1aXJlICcuL0FuaW1hdGlvbidcclxuXHJcbkNBUkRfSU1BR0VfVyA9IDEyMFxyXG5DQVJEX0lNQUdFX0ggPSAxNjJcclxuQ0FSRF9JTUFHRV9PRkZfWCA9IDRcclxuQ0FSRF9JTUFHRV9PRkZfWSA9IDRcclxuQ0FSRF9JTUFHRV9BRFZfWCA9IENBUkRfSU1BR0VfV1xyXG5DQVJEX0lNQUdFX0FEVl9ZID0gQ0FSRF9JTUFHRV9IXHJcbkNBUkRfUkVOREVSX1NDQUxFID0gMC4zNSAgICAgICAgICAgICAgICAgICMgY2FyZCBoZWlnaHQgY29lZmZpY2llbnQgZnJvbSB0aGUgc2NyZWVuJ3MgaGVpZ2h0XHJcbkNBUkRfSEFORF9DVVJWRV9ESVNUX0ZBQ1RPUiA9IDMuNSAgICAgICAgICMgZmFjdG9yIHdpdGggc2NyZWVuIGhlaWdodCB0byBmaWd1cmUgb3V0IGNlbnRlciBvZiBhcmMuIGJpZ2dlciBudW1iZXIgaXMgbGVzcyBhcmNcclxuQ0FSRF9IT0xESU5HX1JPVF9PUkRFUiA9IE1hdGguUEkgLyAxMiAgICAgIyBkZXNpcmVkIHJvdGF0aW9uIG9mIHRoZSBjYXJkIHdoZW4gYmVpbmcgZHJhZ2dlZCBhcm91bmQgZm9yIG9yZGVyaW5nJ3Mgc2FrZVxyXG5DQVJEX0hPTERJTkdfUk9UX1BMQVkgPSAtMSAqIE1hdGguUEkgLyAxMiAjIGRlc2lyZWQgcm90YXRpb24gb2YgdGhlIGNhcmQgd2hlbiBiZWluZyBkcmFnZ2VkIGFyb3VuZCB3aXRoIGludGVudCB0byBwbGF5XHJcbkNBUkRfUExBWV9DRUlMSU5HID0gMC42MCAgICAgICAgICAgICAgICAgICMgaG93IG11Y2ggb2YgdGhlIHRvcCBvZiB0aGUgc2NyZWVuIHJlcHJlc2VudHMgXCJJIHdhbnQgdG8gcGxheSB0aGlzXCIgdnMgXCJJIHdhbnQgdG8gcmVvcmRlclwiXHJcblxyXG5OT19DQVJEID0gLTFcclxuXHJcbkhpZ2hsaWdodCA9XHJcbiAgTk9ORTogLTFcclxuICBVTlNFTEVDVEVEOiAwXHJcbiAgU0VMRUNURUQ6IDFcclxuICBQSUxFOiAyXHJcblxyXG4jIHRha2VuIGZyb20gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMjExMjEyL2hvdy10by1jYWxjdWxhdGUtYW4tYW5nbGUtZnJvbS10aHJlZS1wb2ludHNcclxuIyB1c2VzIGxhdyBvZiBjb3NpbmVzIHRvIGZpZ3VyZSBvdXQgdGhlIGhhbmQgYXJjIGFuZ2xlXHJcbmZpbmRBbmdsZSA9IChwMCwgcDEsIHAyKSAtPlxyXG4gICAgYSA9IE1hdGgucG93KHAxLnggLSBwMi54LCAyKSArIE1hdGgucG93KHAxLnkgLSBwMi55LCAyKVxyXG4gICAgYiA9IE1hdGgucG93KHAxLnggLSBwMC54LCAyKSArIE1hdGgucG93KHAxLnkgLSBwMC55LCAyKVxyXG4gICAgYyA9IE1hdGgucG93KHAyLnggLSBwMC54LCAyKSArIE1hdGgucG93KHAyLnkgLSBwMC55LCAyKVxyXG4gICAgcmV0dXJuIE1hdGguYWNvcyggKGErYi1jKSAvIE1hdGguc3FydCg0KmEqYikgKVxyXG5cclxuY2FsY0Rpc3RhbmNlID0gKHAwLCBwMSkgLT5cclxuICByZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KHAxLnggLSBwMC54LCAyKSArIE1hdGgucG93KHAxLnkgLSBwMC55LCAyKSlcclxuXHJcbmNhbGNEaXN0YW5jZVNxdWFyZWQgPSAoeDAsIHkwLCB4MSwgeTEpIC0+XHJcbiAgcmV0dXJuIE1hdGgucG93KHgxIC0geDAsIDIpICsgTWF0aC5wb3coeTEgLSB5MCwgMilcclxuXHJcbmNsYXNzIEhhbmRcclxuICBAQ0FSRF9JTUFHRV9XOiBDQVJEX0lNQUdFX1dcclxuICBAQ0FSRF9JTUFHRV9IOiBDQVJEX0lNQUdFX0hcclxuICBAQ0FSRF9JTUFHRV9PRkZfWDogQ0FSRF9JTUFHRV9PRkZfWFxyXG4gIEBDQVJEX0lNQUdFX09GRl9ZOiBDQVJEX0lNQUdFX09GRl9ZXHJcbiAgQENBUkRfSU1BR0VfQURWX1g6IENBUkRfSU1BR0VfQURWX1hcclxuICBAQ0FSRF9JTUFHRV9BRFZfWTogQ0FSRF9JTUFHRV9BRFZfWVxyXG4gIEBDQVJEX1JFTkRFUl9TQ0FMRTogQ0FSRF9SRU5ERVJfU0NBTEVcclxuICBASGlnaGxpZ2h0OiBIaWdobGlnaHRcclxuXHJcbiAgY29uc3RydWN0b3I6IChAZ2FtZSkgLT5cclxuICAgIEBjYXJkcyA9IFtdXHJcbiAgICBAYW5pbXMgPSB7fVxyXG4gICAgQHBvc2l0aW9uQ2FjaGUgPSB7fVxyXG5cclxuICAgIEBwaWNraW5nID0gdHJ1ZVxyXG4gICAgQHBpY2tlZCA9IFtdXHJcbiAgICBAcGlja1BhaW50ID0gZmFsc2VcclxuXHJcbiAgICBAZHJhZ0luZGV4U3RhcnQgPSBOT19DQVJEXHJcbiAgICBAZHJhZ0luZGV4Q3VycmVudCA9IE5PX0NBUkRcclxuICAgIEBkcmFnWCA9IDBcclxuICAgIEBkcmFnWSA9IDBcclxuXHJcbiAgICAjIHJlbmRlciAvIGFuaW0gbWV0cmljc1xyXG4gICAgQGNhcmRTcGVlZCA9XHJcbiAgICAgIHI6IE1hdGguUEkgKiAyXHJcbiAgICAgIHM6IDIuNVxyXG4gICAgICB0OiAyICogQGdhbWUud2lkdGhcclxuICAgIEBwbGF5Q2VpbGluZyA9IENBUkRfUExBWV9DRUlMSU5HICogQGdhbWUuaGVpZ2h0XHJcbiAgICBAY2FyZEhlaWdodCA9IE1hdGguZmxvb3IoQGdhbWUuaGVpZ2h0ICogQ0FSRF9SRU5ERVJfU0NBTEUpXHJcbiAgICBAY2FyZFdpZHRoICA9IE1hdGguZmxvb3IoQGNhcmRIZWlnaHQgKiBDQVJEX0lNQUdFX1cgLyBDQVJEX0lNQUdFX0gpXHJcbiAgICBAY2FyZEhhbGZIZWlnaHQgPSBAY2FyZEhlaWdodCA+PiAxXHJcbiAgICBAY2FyZEhhbGZXaWR0aCAgPSBAY2FyZFdpZHRoID4+IDFcclxuICAgIGFyY01hcmdpbiA9IEBjYXJkV2lkdGggLyAyXHJcbiAgICBhcmNWZXJ0aWNhbEJpYXMgPSBAY2FyZEhlaWdodCAvIDUwXHJcbiAgICBib3R0b21MZWZ0ICA9IHsgeDogYXJjTWFyZ2luLCAgICAgICAgICAgICAgICB5OiBhcmNWZXJ0aWNhbEJpYXMgKyBAZ2FtZS5oZWlnaHQgfVxyXG4gICAgYm90dG9tUmlnaHQgPSB7IHg6IEBnYW1lLndpZHRoIC0gYXJjTWFyZ2luLCB5OiBhcmNWZXJ0aWNhbEJpYXMgKyBAZ2FtZS5oZWlnaHQgfVxyXG4gICAgQGhhbmRDZW50ZXIgPSB7IHg6IEBnYW1lLndpZHRoIC8gMiwgICAgICAgICB5OiBhcmNWZXJ0aWNhbEJpYXMgKyBAZ2FtZS5oZWlnaHQgKyAoQ0FSRF9IQU5EX0NVUlZFX0RJU1RfRkFDVE9SICogQGdhbWUuaGVpZ2h0KSB9XHJcbiAgICBAaGFuZEFuZ2xlID0gZmluZEFuZ2xlKGJvdHRvbUxlZnQsIEBoYW5kQ2VudGVyLCBib3R0b21SaWdodClcclxuICAgIEBoYW5kRGlzdGFuY2UgPSBjYWxjRGlzdGFuY2UoYm90dG9tTGVmdCwgQGhhbmRDZW50ZXIpXHJcbiAgICBAaGFuZEFuZ2xlQWR2YW5jZU1heCA9IEBoYW5kQW5nbGUgLyA3ICMgbmV2ZXIgc3BhY2UgdGhlIGNhcmRzIG1vcmUgdGhhbiB3aGF0IHRoZXknZCBsb29rIGxpa2Ugd2l0aCB0aGlzIGhhbmRzaXplXHJcbiAgICBAZ2FtZS5sb2cgXCJIYW5kIGRpc3RhbmNlICN7QGhhbmREaXN0YW5jZX0sIGFuZ2xlICN7QGhhbmRBbmdsZX0gKHNjcmVlbiBoZWlnaHQgI3tAZ2FtZS5oZWlnaHR9KVwiXHJcblxyXG4gIHRvZ2dsZVBpY2tpbmc6IC0+XHJcbiAgICBAcGlja2luZyA9ICFAcGlja2luZ1xyXG4gICAgaWYgQHBpY2tpbmdcclxuICAgICAgQHBpY2tlZCA9IG5ldyBBcnJheShAY2FyZHMubGVuZ3RoKS5maWxsKGZhbHNlKVxyXG5cclxuICBzZXQ6IChjYXJkcykgLT5cclxuICAgIEBjYXJkcyA9IGNhcmRzLnNsaWNlKDApXHJcbiAgICBpZiBAcGlja2luZ1xyXG4gICAgICBAcGlja2VkID0gbmV3IEFycmF5KEBjYXJkcy5sZW5ndGgpLmZpbGwoZmFsc2UpXHJcbiAgICBAc3luY0FuaW1zKClcclxuICAgIEB3YXJwKClcclxuXHJcbiAgc3luY0FuaW1zOiAtPlxyXG4gICAgc2VlbiA9IHt9XHJcbiAgICBmb3IgY2FyZCBpbiBAY2FyZHNcclxuICAgICAgc2VlbltjYXJkXSsrXHJcbiAgICAgIGlmIG5vdCBAYW5pbXNbY2FyZF1cclxuICAgICAgICBAYW5pbXNbY2FyZF0gPSBuZXcgQW5pbWF0aW9uIHtcclxuICAgICAgICAgIHNwZWVkOiBAY2FyZFNwZWVkXHJcbiAgICAgICAgICB4OiAwXHJcbiAgICAgICAgICB5OiAwXHJcbiAgICAgICAgICByOiAwXHJcbiAgICAgICAgfVxyXG4gICAgdG9SZW1vdmUgPSBbXVxyXG4gICAgZm9yIGNhcmQsYW5pbSBvZiBAYW5pbXNcclxuICAgICAgaWYgbm90IHNlZW4uaGFzT3duUHJvcGVydHkoY2FyZClcclxuICAgICAgICB0b1JlbW92ZS5wdXNoIGNhcmRcclxuICAgIGZvciBjYXJkIGluIHRvUmVtb3ZlXHJcbiAgICAgICMgQGdhbWUubG9nIFwicmVtb3ZpbmcgYW5pbSBmb3IgI3tjYXJkfVwiXHJcbiAgICAgIGRlbGV0ZSBAYW5pbXNbY2FyZF1cclxuXHJcbiAgICBAdXBkYXRlUG9zaXRpb25zKClcclxuXHJcbiAgY2FsY0RyYXduSGFuZDogLT5cclxuICAgIGRyYXduSGFuZCA9IFtdXHJcbiAgICBmb3IgY2FyZCxpIGluIEBjYXJkc1xyXG4gICAgICBpZiBpICE9IEBkcmFnSW5kZXhTdGFydFxyXG4gICAgICAgIGRyYXduSGFuZC5wdXNoIGNhcmRcclxuXHJcbiAgICBpZiBAZHJhZ0luZGV4Q3VycmVudCAhPSBOT19DQVJEXHJcbiAgICAgIGRyYXduSGFuZC5zcGxpY2UgQGRyYWdJbmRleEN1cnJlbnQsIDAsIEBjYXJkc1tAZHJhZ0luZGV4U3RhcnRdXHJcbiAgICByZXR1cm4gZHJhd25IYW5kXHJcblxyXG4gIHdhbnRzVG9QbGF5RHJhZ2dlZENhcmQ6IC0+XHJcbiAgICByZXR1cm4gZmFsc2UgaWYgQGRyYWdJbmRleFN0YXJ0ID09IE5PX0NBUkRcclxuICAgIHJldHVybiBAZHJhZ1kgPCBAcGxheUNlaWxpbmdcclxuXHJcbiAgdXBkYXRlUG9zaXRpb25zOiAtPlxyXG4gICAgZHJhd25IYW5kID0gQGNhbGNEcmF3bkhhbmQoKVxyXG4gICAgd2FudHNUb1BsYXkgPSBAd2FudHNUb1BsYXlEcmFnZ2VkQ2FyZCgpXHJcbiAgICBkZXNpcmVkUm90YXRpb24gPSBDQVJEX0hPTERJTkdfUk9UX09SREVSXHJcbiAgICBwb3NpdGlvbkNvdW50ID0gZHJhd25IYW5kLmxlbmd0aFxyXG4gICAgaWYgd2FudHNUb1BsYXlcclxuICAgICAgZGVzaXJlZFJvdGF0aW9uID0gQ0FSRF9IT0xESU5HX1JPVF9QTEFZXHJcbiAgICAgIHBvc2l0aW9uQ291bnQtLVxyXG4gICAgcG9zaXRpb25zID0gQGNhbGNQb3NpdGlvbnMocG9zaXRpb25Db3VudClcclxuICAgIGRyYXdJbmRleCA9IDBcclxuICAgIGZvciBjYXJkLGkgaW4gZHJhd25IYW5kXHJcbiAgICAgIGFuaW0gPSBAYW5pbXNbY2FyZF1cclxuICAgICAgaWYgaSA9PSBAZHJhZ0luZGV4Q3VycmVudFxyXG4gICAgICAgIGFuaW0ucmVxLnggPSBAZHJhZ1hcclxuICAgICAgICBhbmltLnJlcS55ID0gQGRyYWdZXHJcbiAgICAgICAgYW5pbS5yZXEuciA9IGRlc2lyZWRSb3RhdGlvblxyXG4gICAgICAgIGlmIG5vdCB3YW50c1RvUGxheVxyXG4gICAgICAgICAgZHJhd0luZGV4KytcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHBvcyA9IHBvc2l0aW9uc1tkcmF3SW5kZXhdXHJcbiAgICAgICAgYW5pbS5yZXEueCA9IHBvcy54XHJcbiAgICAgICAgYW5pbS5yZXEueSA9IHBvcy55XHJcbiAgICAgICAgYW5pbS5yZXEuciA9IHBvcy5yXHJcbiAgICAgICAgZHJhd0luZGV4KytcclxuXHJcbiAgIyBpbW1lZGlhdGVseSB3YXJwIGFsbCBjYXJkcyB0byB3aGVyZSB0aGV5IHNob3VsZCBiZVxyXG4gIHdhcnA6IC0+XHJcbiAgICBmb3IgY2FyZCxhbmltIG9mIEBhbmltc1xyXG4gICAgICBhbmltLndhcnAoKVxyXG5cclxuICAjIHJlb3JkZXIgdGhlIGhhbmQgYmFzZWQgb24gdGhlIGRyYWcgbG9jYXRpb24gb2YgdGhlIGhlbGQgY2FyZFxyXG4gIHJlb3JkZXI6IC0+XHJcbiAgICByZXR1cm4gaWYgQGRyYWdJbmRleFN0YXJ0ID09IE5PX0NBUkRcclxuICAgIHJldHVybiBpZiBAY2FyZHMubGVuZ3RoIDwgMiAjIG5vdGhpbmcgdG8gcmVvcmRlclxyXG4gICAgcG9zaXRpb25zID0gQGNhbGNQb3NpdGlvbnMoQGNhcmRzLmxlbmd0aClcclxuICAgIGNsb3Nlc3RJbmRleCA9IDBcclxuICAgIGNsb3Nlc3REaXN0ID0gQGdhbWUud2lkdGggKiBAZ2FtZS5oZWlnaHQgIyBzb21ldGhpbmcgaW1wb3NzaWJseSBsYXJnZVxyXG4gICAgZm9yIHBvcywgaW5kZXggaW4gcG9zaXRpb25zXHJcbiAgICAgIGRpc3QgPSBjYWxjRGlzdGFuY2VTcXVhcmVkKHBvcy54LCBwb3MueSwgQGRyYWdYLCBAZHJhZ1kpXHJcbiAgICAgIGlmIGNsb3Nlc3REaXN0ID4gZGlzdFxyXG4gICAgICAgIGNsb3Nlc3REaXN0ID0gZGlzdFxyXG4gICAgICAgIGNsb3Nlc3RJbmRleCA9IGluZGV4XHJcbiAgICBAZHJhZ0luZGV4Q3VycmVudCA9IGNsb3Nlc3RJbmRleFxyXG5cclxuICBzZWxlY3RlZENhcmRzOiAtPlxyXG4gICAgaWYgbm90IEBwaWNraW5nXHJcbiAgICAgIHJldHVybiBbXVxyXG5cclxuICAgIGNhcmRzID0gW11cclxuICAgIGZvciBjYXJkLCBpIGluIEBjYXJkc1xyXG4gICAgICBpZiBAcGlja2VkW2ldXHJcbiAgICAgICAgYW5pbSA9IEBhbmltc1tjYXJkXVxyXG4gICAgICAgIGNhcmRzLnB1c2gge1xyXG4gICAgICAgICAgY2FyZDogY2FyZFxyXG4gICAgICAgICAgeDogYW5pbS5jdXIueFxyXG4gICAgICAgICAgeTogYW5pbS5jdXIueVxyXG4gICAgICAgICAgcjogYW5pbS5jdXIuclxyXG4gICAgICAgICAgaW5kZXg6IGlcclxuICAgICAgICB9XHJcbiAgICByZXR1cm4gY2FyZHNcclxuXHJcbiAgZG93bjogKEBkcmFnWCwgQGRyYWdZLCBpbmRleCkgLT5cclxuICAgIEB1cChAZHJhZ1gsIEBkcmFnWSkgIyBlbnN1cmUgd2UgbGV0IGdvIG9mIHRoZSBwcmV2aW91cyBjYXJkIGluIGNhc2UgdGhlIGV2ZW50cyBhcmUgZHVtYlxyXG4gICAgaWYgQHBpY2tpbmdcclxuICAgICAgQHBpY2tlZFtpbmRleF0gPSAhQHBpY2tlZFtpbmRleF1cclxuICAgICAgQHBpY2tQYWludCA9IEBwaWNrZWRbaW5kZXhdXHJcbiAgICAgIHJldHVyblxyXG4gICAgQGdhbWUubG9nIFwicGlja2luZyB1cCBjYXJkIGluZGV4ICN7aW5kZXh9XCJcclxuICAgIEBkcmFnSW5kZXhTdGFydCA9IGluZGV4XHJcbiAgICBAZHJhZ0luZGV4Q3VycmVudCA9IGluZGV4XHJcbiAgICBAdXBkYXRlUG9zaXRpb25zKClcclxuXHJcbiAgbW92ZTogKEBkcmFnWCwgQGRyYWdZKSAtPlxyXG4gICAgcmV0dXJuIGlmIEBkcmFnSW5kZXhTdGFydCA9PSBOT19DQVJEXHJcbiAgICAjQGdhbWUubG9nIFwiZHJhZ2dpbmcgYXJvdW5kIGNhcmQgaW5kZXggI3tAZHJhZ0luZGV4Q3VycmVudH1cIlxyXG4gICAgQHJlb3JkZXIoKVxyXG4gICAgQHVwZGF0ZVBvc2l0aW9ucygpXHJcblxyXG4gIHVwOiAoQGRyYWdYLCBAZHJhZ1kpIC0+XHJcbiAgICByZXR1cm4gaWYgQGRyYWdJbmRleFN0YXJ0ID09IE5PX0NBUkRcclxuICAgIEByZW9yZGVyKClcclxuICAgIGlmIEB3YW50c1RvUGxheURyYWdnZWRDYXJkKClcclxuICAgICAgQGdhbWUubG9nIFwidHJ5aW5nIHRvIHBsYXkgYSAje0BjYXJkc1tAZHJhZ0luZGV4U3RhcnRdfSBmcm9tIGluZGV4ICN7QGRyYWdJbmRleFN0YXJ0fVwiXHJcbiAgICAgIGNhcmRJbmRleCA9IEBkcmFnSW5kZXhTdGFydFxyXG4gICAgICBjYXJkID0gQGNhcmRzW2NhcmRJbmRleF1cclxuICAgICAgYW5pbSA9IEBhbmltc1tjYXJkXVxyXG4gICAgICBAZHJhZ0luZGV4U3RhcnQgPSBOT19DQVJEXHJcbiAgICAgIEBkcmFnSW5kZXhDdXJyZW50ID0gTk9fQ0FSRFxyXG4gICAgICBAZ2FtZS5wbGF5IFt7XHJcbiAgICAgICAgY2FyZDogY2FyZFxyXG4gICAgICAgIHg6IGFuaW0uY3VyLnhcclxuICAgICAgICB5OiBhbmltLmN1ci55XHJcbiAgICAgICAgcjogYW5pbS5jdXIuclxyXG4gICAgICAgIGluZGV4OiBjYXJkSW5kZXhcclxuICAgICAgfV1cclxuICAgIGVsc2VcclxuICAgICAgQGdhbWUubG9nIFwidHJ5aW5nIHRvIHJlb3JkZXIgI3tAY2FyZHNbQGRyYWdJbmRleFN0YXJ0XX0gaW50byBpbmRleCAje0BkcmFnSW5kZXhDdXJyZW50fVwiXHJcbiAgICAgIEBjYXJkcyA9IEBjYWxjRHJhd25IYW5kKCkgIyBpcyB0aGlzIHJpZ2h0P1xyXG5cclxuICAgIEBkcmFnSW5kZXhTdGFydCA9IE5PX0NBUkRcclxuICAgIEBkcmFnSW5kZXhDdXJyZW50ID0gTk9fQ0FSRFxyXG4gICAgQHVwZGF0ZVBvc2l0aW9ucygpXHJcblxyXG4gIHVwZGF0ZTogKGR0KSAtPlxyXG4gICAgdXBkYXRlZCA9IGZhbHNlXHJcbiAgICBmb3IgY2FyZCxhbmltIG9mIEBhbmltc1xyXG4gICAgICBpZiBhbmltLnVwZGF0ZShkdClcclxuICAgICAgICB1cGRhdGVkID0gdHJ1ZVxyXG4gICAgcmV0dXJuIHVwZGF0ZWRcclxuXHJcbiAgcmVuZGVyOiAtPlxyXG4gICAgcmV0dXJuIGlmIEBjYXJkcy5sZW5ndGggPT0gMFxyXG4gICAgZHJhd25IYW5kID0gQGNhbGNEcmF3bkhhbmQoKVxyXG4gICAgZm9yIHYsIGluZGV4IGluIGRyYXduSGFuZFxyXG4gICAgICBjb250aW51ZSBpZiB2ID09IE5PX0NBUkRcclxuICAgICAgYW5pbSA9IEBhbmltc1t2XVxyXG4gICAgICBkbyAoYW5pbSwgaW5kZXgpID0+XHJcbiAgICAgICAgaWYgQHBpY2tpbmdcclxuICAgICAgICAgIGlmIEBwaWNrZWRbaW5kZXhdXHJcbiAgICAgICAgICAgIGhpZ2hsaWdodFN0YXRlID0gSGlnaGxpZ2h0LlNFTEVDVEVEXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIGhpZ2hsaWdodFN0YXRlID0gSGlnaGxpZ2h0LlVOU0VMRUNURURcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBpZiBAd2FudHNUb1BsYXlEcmFnZ2VkQ2FyZCgpXHJcbiAgICAgICAgICAgIGlmIChpbmRleCA9PSBAZHJhZ0luZGV4Q3VycmVudClcclxuICAgICAgICAgICAgICBoaWdobGlnaHRTdGF0ZSA9IEhpZ2hsaWdodC5TRUxFQ1RFRFxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgaGlnaGxpZ2h0U3RhdGUgPSBIaWdobGlnaHQuVU5TRUxFQ1RFRFxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBoaWdobGlnaHRTdGF0ZSA9IEhpZ2hsaWdodC5OT05FXHJcbiAgICAgICAgQHJlbmRlckNhcmQgdiwgYW5pbS5jdXIueCwgYW5pbS5jdXIueSwgYW5pbS5jdXIuciwgMSwgaGlnaGxpZ2h0U3RhdGUsIChjbGlja1gsIGNsaWNrWSkgPT5cclxuICAgICAgICAgIEBkb3duKGNsaWNrWCwgY2xpY2tZLCBpbmRleClcclxuXHJcbiAgcmVuZGVyQ2FyZDogKHYsIHgsIHksIHJvdCwgc2NhbGUsIHNlbGVjdGVkLCBjYikgLT5cclxuICAgIHJvdCA9IDAgaWYgbm90IHJvdFxyXG4gICAgcmFuayA9IE1hdGguZmxvb3IodiAvIDQpXHJcbiAgICBzdWl0ID0gTWF0aC5mbG9vcih2ICUgNClcclxuXHJcbiAgICBjb2wgPSBzd2l0Y2ggc2VsZWN0ZWRcclxuICAgICAgd2hlbiBIaWdobGlnaHQuTk9ORVxyXG4gICAgICAgIFsxLCAxLCAxXVxyXG4gICAgICB3aGVuIEhpZ2hsaWdodC5VTlNFTEVDVEVEXHJcbiAgICAgICAgIyBbMC4zLCAwLjMsIDAuM11cclxuICAgICAgICBbMSwgMSwgMV1cclxuICAgICAgd2hlbiBIaWdobGlnaHQuU0VMRUNURURcclxuICAgICAgICBbMC41LCAwLjUsIDAuOV1cclxuICAgICAgd2hlbiBIaWdobGlnaHQuUElMRVxyXG4gICAgICAgIFswLjYsIDAuNiwgMC42XVxyXG5cclxuICAgIEBnYW1lLmRyYXdJbWFnZSBcImNhcmRzXCIsXHJcbiAgICBDQVJEX0lNQUdFX09GRl9YICsgKENBUkRfSU1BR0VfQURWX1ggKiByYW5rKSwgQ0FSRF9JTUFHRV9PRkZfWSArIChDQVJEX0lNQUdFX0FEVl9ZICogc3VpdCksIENBUkRfSU1BR0VfVywgQ0FSRF9JTUFHRV9ILFxyXG4gICAgeCwgeSwgQGNhcmRXaWR0aCAqIHNjYWxlLCBAY2FyZEhlaWdodCAqIHNjYWxlLFxyXG4gICAgcm90LCAwLjUsIDAuNSwgY29sWzBdLGNvbFsxXSxjb2xbMl0sMSwgY2JcclxuXHJcbiAgY2FsY1Bvc2l0aW9uczogKGhhbmRTaXplKSAtPlxyXG4gICAgaWYgQHBvc2l0aW9uQ2FjaGUuaGFzT3duUHJvcGVydHkoaGFuZFNpemUpXHJcbiAgICAgIHJldHVybiBAcG9zaXRpb25DYWNoZVtoYW5kU2l6ZV1cclxuICAgIHJldHVybiBbXSBpZiBoYW5kU2l6ZSA9PSAwXHJcblxyXG4gICAgYWR2YW5jZSA9IEBoYW5kQW5nbGUgLyBoYW5kU2l6ZVxyXG4gICAgaWYgYWR2YW5jZSA+IEBoYW5kQW5nbGVBZHZhbmNlTWF4XHJcbiAgICAgIGFkdmFuY2UgPSBAaGFuZEFuZ2xlQWR2YW5jZU1heFxyXG4gICAgYW5nbGVTcHJlYWQgPSBhZHZhbmNlICogaGFuZFNpemUgICAgICAgICAgICAgICAgIyBob3cgbXVjaCBvZiB0aGUgYW5nbGUgd2UgcGxhbiBvbiB1c2luZ1xyXG4gICAgYW5nbGVMZWZ0b3ZlciA9IEBoYW5kQW5nbGUgLSBhbmdsZVNwcmVhZCAgICAgICAgIyBhbW91bnQgb2YgYW5nbGUgd2UncmUgbm90IHVzaW5nLCBhbmQgbmVlZCB0byBwYWQgc2lkZXMgd2l0aCBldmVubHlcclxuICAgIGN1cnJlbnRBbmdsZSA9IC0xICogKEBoYW5kQW5nbGUgLyAyKSAgICAgICAgICAgICMgbW92ZSB0byB0aGUgbGVmdCBzaWRlIG9mIG91ciBhbmdsZVxyXG4gICAgY3VycmVudEFuZ2xlICs9IGFuZ2xlTGVmdG92ZXIgLyAyICAgICAgICAgICAgICAgIyAuLi4gYW5kIGFkdmFuY2UgcGFzdCBoYWxmIG9mIHRoZSBwYWRkaW5nXHJcbiAgICBjdXJyZW50QW5nbGUgKz0gYWR2YW5jZSAvIDIgICAgICAgICAgICAgICAgICAgICAjIC4uLiBhbmQgY2VudGVyIHRoZSBjYXJkcyBpbiB0aGUgYW5nbGVcclxuXHJcbiAgICBwb3NpdGlvbnMgPSBbXVxyXG4gICAgZm9yIGkgaW4gWzAuLi5oYW5kU2l6ZV1cclxuICAgICAgeCA9IEBoYW5kQ2VudGVyLnggLSBNYXRoLmNvcygoTWF0aC5QSSAvIDIpICsgY3VycmVudEFuZ2xlKSAqIEBoYW5kRGlzdGFuY2VcclxuICAgICAgeSA9IEBoYW5kQ2VudGVyLnkgLSBNYXRoLnNpbigoTWF0aC5QSSAvIDIpICsgY3VycmVudEFuZ2xlKSAqIEBoYW5kRGlzdGFuY2VcclxuICAgICAgY3VycmVudEFuZ2xlICs9IGFkdmFuY2VcclxuICAgICAgcG9zaXRpb25zLnB1c2gge1xyXG4gICAgICAgIHg6IHhcclxuICAgICAgICB5OiB5XHJcbiAgICAgICAgcjogY3VycmVudEFuZ2xlIC0gYWR2YW5jZVxyXG4gICAgICB9XHJcblxyXG4gICAgQHBvc2l0aW9uQ2FjaGVbaGFuZFNpemVdID0gcG9zaXRpb25zXHJcbiAgICByZXR1cm4gcG9zaXRpb25zXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRcclxuIiwiQnV0dG9uID0gcmVxdWlyZSAnLi9CdXR0b24nXHJcblxyXG5jbGFzcyBNZW51XHJcbiAgY29uc3RydWN0b3I6IChAZ2FtZSwgQHRpdGxlLCBAYmFja2dyb3VuZCwgQGNvbG9yLCBAYWN0aW9ucykgLT5cclxuICAgIEBidXR0b25zID0gW11cclxuICAgIEBidXR0b25OYW1lcyA9IFtcImJ1dHRvbjBcIiwgXCJidXR0b24xXCJdXHJcblxyXG4gICAgYnV0dG9uU2l6ZSA9IEBnYW1lLmhlaWdodCAvIDE1XHJcbiAgICBAYnV0dG9uU3RhcnRZID0gQGdhbWUuaGVpZ2h0IC8gNVxyXG5cclxuICAgIHNsaWNlID0gKEBnYW1lLmhlaWdodCAtIEBidXR0b25TdGFydFkpIC8gKEBhY3Rpb25zLmxlbmd0aCArIDEpXHJcbiAgICBjdXJyWSA9IEBidXR0b25TdGFydFkgKyBzbGljZVxyXG4gICAgZm9yIGFjdGlvbiBpbiBAYWN0aW9uc1xyXG4gICAgICBidXR0b24gPSBuZXcgQnV0dG9uKEBnYW1lLCBAYnV0dG9uTmFtZXMsIEBnYW1lLmZvbnQsIGJ1dHRvblNpemUsIEBnYW1lLmNlbnRlci54LCBjdXJyWSwgYWN0aW9uKVxyXG4gICAgICBAYnV0dG9ucy5wdXNoIGJ1dHRvblxyXG4gICAgICBjdXJyWSArPSBzbGljZVxyXG5cclxuICB1cGRhdGU6IChkdCkgLT5cclxuICAgIHVwZGF0ZWQgPSBmYWxzZVxyXG4gICAgZm9yIGJ1dHRvbiBpbiBAYnV0dG9uc1xyXG4gICAgICBpZiBidXR0b24udXBkYXRlKGR0KVxyXG4gICAgICAgIHVwZGF0ZWQgPSB0cnVlXHJcbiAgICByZXR1cm4gdXBkYXRlZFxyXG5cclxuICByZW5kZXI6IC0+XHJcbiAgICBAZ2FtZS5zcHJpdGVSZW5kZXJlci5yZW5kZXIgQGJhY2tncm91bmQsIDAsIDAsIEBnYW1lLndpZHRoLCBAZ2FtZS5oZWlnaHQsIDAsIDAsIDAsIEBjb2xvclxyXG4gICAgQGdhbWUuZm9udFJlbmRlcmVyLnJlbmRlciBAZ2FtZS5mb250LCBAZ2FtZS5oZWlnaHQgLyAyNSwgXCJCdWlsZDogI3tAZ2FtZS52ZXJzaW9ufVwiLCAwLCBAZ2FtZS5oZWlnaHQsIDAsIDEsIEBnYW1lLmNvbG9ycy5saWdodGdyYXlcclxuICAgIHRpdGxlSGVpZ2h0ID0gQGdhbWUuaGVpZ2h0IC8gOFxyXG4gICAgdGl0bGVPZmZzZXQgPSBAYnV0dG9uU3RhcnRZID4+IDFcclxuICAgIEBnYW1lLmZvbnRSZW5kZXJlci5yZW5kZXIgQGdhbWUuZm9udCwgdGl0bGVIZWlnaHQsIEB0aXRsZSwgQGdhbWUuY2VudGVyLngsIHRpdGxlT2Zmc2V0LCAwLjUsIDAuNSwgQGdhbWUuY29sb3JzLndoaXRlXHJcbiAgICBmb3IgYnV0dG9uIGluIEBidXR0b25zXHJcbiAgICAgIGJ1dHRvbi5yZW5kZXIoKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNZW51XHJcbiIsIkFuaW1hdGlvbiA9IHJlcXVpcmUgJy4vQW5pbWF0aW9uJ1xyXG5IYW5kID0gcmVxdWlyZSAnLi9IYW5kJ1xyXG5cclxuU0VUVExFX01TID0gMTAwMFxyXG5cclxuY2xhc3MgUGlsZVxyXG4gIGNvbnN0cnVjdG9yOiAoQGdhbWUsIEBoYW5kKSAtPlxyXG4gICAgQHBsYXlJRCA9IC0xXHJcbiAgICBAcGxheXMgPSBbXVxyXG4gICAgQGFuaW1zID0ge31cclxuICAgIEBzZXR0bGVUaW1lciA9IDBcclxuICAgIEB0aHJvd25Db2xvciA9IHsgcjogMSwgZzogMSwgYjogMCwgYTogMX1cclxuICAgIEBzY2FsZSA9IDAuNlxyXG5cclxuICAgICMgMS4wIGlzIG5vdCBtZXNzeSBhdCBhbGwsIGFzIHlvdSBhcHByb2FjaCAwIGl0IHN0YXJ0cyB0byBhbGwgcGlsZSBvbiBvbmUgYW5vdGhlclxyXG4gICAgbWVzc3kgPSAwLjJcclxuXHJcbiAgICBAcGxheUNhcmRTcGFjaW5nID0gMC4xXHJcblxyXG4gICAgY2VudGVyWCA9IEBnYW1lLmNlbnRlci54XHJcbiAgICBjZW50ZXJZID0gQGdhbWUuY2VudGVyLnlcclxuICAgIG9mZnNldFggPSBAaGFuZC5jYXJkV2lkdGggKiBtZXNzeSAqIEBzY2FsZVxyXG4gICAgb2Zmc2V0WSA9IEBoYW5kLmNhcmRIYWxmSGVpZ2h0ICogbWVzc3kgKiBAc2NhbGVcclxuICAgIEBwbGF5TG9jYXRpb25zID0gW1xyXG4gICAgICB7IHg6IGNlbnRlclgsIHk6IGNlbnRlclkgKyBvZmZzZXRZIH0gIyBib3R0b21cclxuICAgICAgeyB4OiBjZW50ZXJYIC0gb2Zmc2V0WCwgeTogY2VudGVyWSB9ICMgbGVmdFxyXG4gICAgICB7IHg6IGNlbnRlclgsIHk6IGNlbnRlclkgLSBvZmZzZXRZIH0gIyB0b3BcclxuICAgICAgeyB4OiBjZW50ZXJYICsgb2Zmc2V0WCwgeTogY2VudGVyWSB9ICMgcmlnaHRcclxuICAgIF1cclxuICAgIEB0aHJvd0xvY2F0aW9ucyA9IFtcclxuICAgICAgeyB4OiBjZW50ZXJYLCB5OiBAZ2FtZS5oZWlnaHQgfSAjIGJvdHRvbVxyXG4gICAgICB7IHg6IDAsIHk6IGNlbnRlclkgKyBvZmZzZXRZIH0gIyBsZWZ0XHJcbiAgICAgIHsgeDogY2VudGVyWCwgeTogMCB9ICMgdG9wXHJcbiAgICAgIHsgeDogQGdhbWUud2lkdGgsIHk6IGNlbnRlclkgKyBvZmZzZXRZIH0gIyByaWdodFxyXG4gICAgXVxyXG5cclxuICBzZXQ6IChwaWxlSUQsIHBpbGUsIHBpbGVXaG8pIC0+XHJcbiAgICBpZiBAcGxheUlEICE9IHBpbGVJRFxyXG4gICAgICBAcGxheUlEID0gcGlsZUlEXHJcbiAgICAgIEBwbGF5cy5wdXNoIHtcclxuICAgICAgICBjYXJkczogcGlsZS5zbGljZSgwKVxyXG4gICAgICAgIHdobzogcGlsZVdob1xyXG4gICAgICB9XHJcbiAgICAgIEBzZXR0bGVUaW1lciA9IFNFVFRMRV9NU1xyXG5cclxuICAgICMgaWYgKEBwbGF5SUQgIT0gcGlsZUlEKSBhbmQgKHRocm93bi5sZW5ndGggPiAwKVxyXG4gICAgIyAgIEBwbGF5cyA9IHRocm93bi5zbGljZSgwKSAjIHRoZSBwaWxlIGhhcyBiZWNvbWUgdGhlIHRocm93biwgc3Rhc2ggaXQgb2ZmIG9uZSBsYXN0IHRpbWVcclxuICAgICMgICBAcGxheVdobyA9IHRocm93bldoby5zbGljZSgwKVxyXG4gICAgIyAgIEBwbGF5SUQgPSBwaWxlSURcclxuICAgICMgICBAc2V0dGxlVGltZXIgPSBTRVRUTEVfTVNcclxuXHJcbiAgICAjICMgZG9uJ3Qgc3RvbXAgdGhlIHBpbGUgd2UncmUgZHJhd2luZyB1bnRpbCBpdCBpcyBkb25lIHNldHRsaW5nIGFuZCBjYW4gZmx5IG9mZiB0aGUgc2NyZWVuXHJcbiAgICAjIGlmIEBzZXR0bGVUaW1lciA9PSAwXHJcbiAgICAjICAgQHBsYXlzID0gcGlsZS5zbGljZSgwKVxyXG4gICAgIyAgIEBwbGF5V2hvID0gcGlsZVdoby5zbGljZSgwKVxyXG4gICAgIyAgIEB0aHJvd24gPSB0aHJvd24uc2xpY2UoMClcclxuICAgICMgICBAdGhyb3duV2hvID0gdGhyb3duV2hvLnNsaWNlKDApXHJcbiAgICAjICAgQHRocm93blRha2VyID0gdGhyb3duVGFrZXJcclxuXHJcbiAgICBAc3luY0FuaW1zKClcclxuXHJcbiAgaGludDogKGNhcmRzKSAtPlxyXG4gICAgZm9yIGNhcmQgaW4gY2FyZHNcclxuICAgICAgQGFuaW1zW2NhcmQuY2FyZF0gPSBuZXcgQW5pbWF0aW9uIHtcclxuICAgICAgICBzcGVlZDogQGhhbmQuY2FyZFNwZWVkXHJcbiAgICAgICAgeDogY2FyZC54XHJcbiAgICAgICAgeTogY2FyZC55XHJcbiAgICAgICAgcjogY2FyZC5yXHJcbiAgICAgICAgczogMVxyXG4gICAgICB9XHJcblxyXG4gIHN5bmNBbmltczogLT5cclxuICAgIHNlZW4gPSB7fVxyXG4gICAgbG9jYXRpb25zID0gQHRocm93TG9jYXRpb25zXHJcbiAgICBmb3IgcGxheSBpbiBAcGxheXNcclxuICAgICAgZm9yIGNhcmQsIGluZGV4IGluIHBsYXkuY2FyZHNcclxuICAgICAgICBzZWVuW2NhcmRdKytcclxuICAgICAgICBpZiBub3QgQGFuaW1zW2NhcmRdXHJcbiAgICAgICAgICB3aG8gPSBwbGF5Lndob1xyXG4gICAgICAgICAgbG9jYXRpb24gPSBsb2NhdGlvbnNbd2hvXVxyXG4gICAgICAgICAgQGFuaW1zW2NhcmRdID0gbmV3IEFuaW1hdGlvbiB7XHJcbiAgICAgICAgICAgIHNwZWVkOiBAaGFuZC5jYXJkU3BlZWRcclxuICAgICAgICAgICAgeDogbG9jYXRpb24ueFxyXG4gICAgICAgICAgICB5OiBsb2NhdGlvbi55XHJcbiAgICAgICAgICAgIHI6IC0xICogTWF0aC5QSSAvIDRcclxuICAgICAgICAgICAgczogQHNjYWxlXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgdG9SZW1vdmUgPSBbXVxyXG4gICAgZm9yIGNhcmQsYW5pbSBvZiBAYW5pbXNcclxuICAgICAgaWYgbm90IHNlZW4uaGFzT3duUHJvcGVydHkoY2FyZClcclxuICAgICAgICB0b1JlbW92ZS5wdXNoIGNhcmRcclxuICAgIGZvciBjYXJkIGluIHRvUmVtb3ZlXHJcbiAgICAgICMgQGdhbWUubG9nIFwicmVtb3ZpbmcgYW5pbSBmb3IgI3tjYXJkfVwiXHJcbiAgICAgIGRlbGV0ZSBAYW5pbXNbY2FyZF1cclxuXHJcbiAgICBAdXBkYXRlUG9zaXRpb25zKClcclxuXHJcbiAgdXBkYXRlUG9zaXRpb25zOiAtPlxyXG4gICAgbG9jYXRpb25zID0gQHBsYXlMb2NhdGlvbnNcclxuICAgIGZvciBwbGF5LCBwbGF5SW5kZXggaW4gQHBsYXlzXHJcbiAgICAgIGZvciB2LCBpbmRleCBpbiBwbGF5LmNhcmRzXHJcbiAgICAgICAgYW5pbSA9IEBhbmltc1t2XVxyXG4gICAgICAgIGxvYyA9IHBsYXkud2hvXHJcbiAgICAgICAgYW5pbS5yZXEueCA9IGxvY2F0aW9uc1tsb2NdLnggKyAoaW5kZXggKiBAaGFuZC5jYXJkV2lkdGggKiBAcGxheUNhcmRTcGFjaW5nKVxyXG4gICAgICAgIGFuaW0ucmVxLnkgPSBsb2NhdGlvbnNbbG9jXS55XHJcbiAgICAgICAgYW5pbS5yZXEuciA9IDAuMiAqIE1hdGguY29zKHBsYXlJbmRleCAvIDAuMSlcclxuICAgICAgICBhbmltLnJlcS5zID0gQHNjYWxlXHJcblxyXG4gIHJlYWR5Rm9yTmV4dFRyaWNrOiAtPlxyXG4gICAgcmV0dXJuIChAc2V0dGxlVGltZXIgPT0gMClcclxuXHJcbiAgdXBkYXRlOiAoZHQpIC0+XHJcbiAgICB1cGRhdGVkID0gZmFsc2VcclxuXHJcbiAgICBpZiBAc2V0dGxlVGltZXIgPiAwXHJcbiAgICAgIHVwZGF0ZWQgPSB0cnVlXHJcbiAgICAgIEBzZXR0bGVUaW1lciAtPSBkdFxyXG4gICAgICBpZiBAc2V0dGxlVGltZXIgPCAwXHJcbiAgICAgICAgQHNldHRsZVRpbWVyID0gMFxyXG5cclxuICAgIGZvciBjYXJkLGFuaW0gb2YgQGFuaW1zXHJcbiAgICAgIGlmIGFuaW0udXBkYXRlKGR0KVxyXG4gICAgICAgIHVwZGF0ZWQgPSB0cnVlXHJcblxyXG4gICAgcmV0dXJuIHVwZGF0ZWRcclxuXHJcbiAgIyB1c2VkIGJ5IHRoZSBnYW1lIG92ZXIgc2NyZWVuLiBJdCByZXR1cm5zIHRydWUgd2hlbiBuZWl0aGVyIHRoZSBwaWxlIG5vciB0aGUgbGFzdCB0aHJvd24gYXJlIG1vdmluZ1xyXG4gIHJlc3Rpbmc6IC0+XHJcbiAgICBmb3IgY2FyZCxhbmltIG9mIEBhbmltc1xyXG4gICAgICBpZiBhbmltLmFuaW1hdGluZygpXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICBpZiBAc2V0dGxlVGltZXIgPiAwXHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgcmV0dXJuIHRydWVcclxuXHJcbiAgcmVuZGVyOiAtPlxyXG4gICAgZm9yIHBsYXksIHBsYXlJbmRleCBpbiBAcGxheXNcclxuICAgICAgaGlnaGxpZ2h0ID0gSGFuZC5IaWdobGlnaHQuUElMRVxyXG4gICAgICBpZiBwbGF5SW5kZXggPT0gKEBwbGF5cy5sZW5ndGggLSAxKVxyXG4gICAgICAgIGhpZ2hsaWdodCA9IEhhbmQuSGlnaGxpZ2h0Lk5PTkVcclxuICAgICAgZm9yIHYsIGluZGV4IGluIHBsYXkuY2FyZHNcclxuICAgICAgICBhbmltID0gQGFuaW1zW3ZdXHJcbiAgICAgICAgQGhhbmQucmVuZGVyQ2FyZCB2LCBhbmltLmN1ci54LCBhbmltLmN1ci55LCBhbmltLmN1ci5yLCBhbmltLmN1ci5zLCBoaWdobGlnaHRcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUGlsZVxyXG4iLCJjbGFzcyBTcHJpdGVSZW5kZXJlclxyXG4gIGNvbnN0cnVjdG9yOiAoQGdhbWUpIC0+XHJcbiAgICBAc3ByaXRlcyA9XHJcbiAgICAgICMgZ2VuZXJpYyBzcHJpdGVzXHJcbiAgICAgIHNvbGlkOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6ICA1NSwgeTogNzIzLCB3OiAgMTAsIGg6ICAxMCB9XHJcbiAgICAgIHBhdXNlOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDYwMiwgeTogNzA3LCB3OiAxMjIsIGg6IDEyNSB9XHJcbiAgICAgIGJ1dHRvbjA6ICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDE0MCwgeTogNzc3LCB3OiA0MjIsIGg6ICA2NSB9XHJcbiAgICAgIGJ1dHRvbjE6ICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDE0MCwgeTogNjk4LCB3OiA0MjIsIGg6ICA2NSB9XHJcbiAgICAgIHBsdXMwOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDc0NSwgeTogNjY0LCB3OiAxMTYsIGg6IDExOCB9XHJcbiAgICAgIHBsdXMxOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDc0NSwgeTogODIwLCB3OiAxMTYsIGg6IDExOCB9XHJcbiAgICAgIG1pbnVzMDogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDg5NSwgeTogNjY0LCB3OiAxMTYsIGg6IDExOCB9XHJcbiAgICAgIG1pbnVzMTogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDg5NSwgeTogODIwLCB3OiAxMTYsIGg6IDExOCB9XHJcbiAgICAgIGFycm93TDogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6ICAzMywgeTogODU4LCB3OiAyMDQsIGg6IDE1NiB9XHJcbiAgICAgIGFycm93UjogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDIzOSwgeTogODUyLCB3OiAyMDgsIGg6IDE1NSB9XHJcbiAgICAgIHBpbGU6ICAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDUxMywgeTogODc1LCB3OiAxMjgsIGg6IDEyOCB9XHJcblxyXG4gICAgICAjIG1lbnUgYmFja2dyb3VuZHNcclxuICAgICAgbWFpbm1lbnU6ICB7IHRleHR1cmU6IFwibWFpbm1lbnVcIiwgIHg6IDAsIHk6IDAsIHc6IDEyODAsIGg6IDcyMCB9XHJcbiAgICAgIHBhdXNlbWVudTogeyB0ZXh0dXJlOiBcInBhdXNlbWVudVwiLCB4OiAwLCB5OiAwLCB3OiAxMjgwLCBoOiA3MjAgfVxyXG5cclxuICAgICAgIyBob3d0b1xyXG4gICAgICBob3d0bzE6ICAgIHsgdGV4dHVyZTogXCJob3d0bzFcIiwgIHg6IDAsIHk6ICAwLCB3OiAxOTIwLCBoOiAxMDgwIH1cclxuICAgICAgaG93dG8yOiAgICB7IHRleHR1cmU6IFwiaG93dG8yXCIsICB4OiAwLCB5OiAgMCwgdzogMTkyMCwgaDogMTA4MCB9XHJcbiAgICAgIGhvd3RvMzogICAgeyB0ZXh0dXJlOiBcImhvd3RvM1wiLCAgeDogMCwgeTogIDAsIHc6IDE5MjAsIGg6IDEwODAgfVxyXG5cclxuICAgICAgIyBjaGFyYWN0ZXJzXHJcbiAgICAgIG1hcmlvOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6ICAyMCwgeTogICAwLCB3OiAxNTEsIGg6IDMwOCB9XHJcbiAgICAgIGx1aWdpOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDE3MSwgeTogICAwLCB3OiAxNTEsIGg6IDMwOCB9XHJcbiAgICAgIHBlYWNoOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDMzNSwgeTogICAwLCB3OiAxNjQsIGg6IDMwOCB9XHJcbiAgICAgIGRhaXN5OiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDUwNCwgeTogICAwLCB3OiAxNjQsIGg6IDMwOCB9XHJcbiAgICAgIHlvc2hpOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDY2OCwgeTogICAwLCB3OiAxODAsIGg6IDMwOCB9XHJcbiAgICAgIHRvYWQ6ICAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDg0OSwgeTogICAwLCB3OiAxNTcsIGg6IDMwOCB9XHJcbiAgICAgIGJvd3NlcjogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6ICAxMSwgeTogMzIyLCB3OiAxNTEsIGg6IDMwOCB9XHJcbiAgICAgIGJvd3NlcmpyOiAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDIyNSwgeTogMzIyLCB3OiAxNDQsIGg6IDMwOCB9XHJcbiAgICAgIGtvb3BhOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDM3MiwgeTogMzIyLCB3OiAxMjgsIGg6IDMwOCB9XHJcbiAgICAgIHJvc2FsaW5hOiAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDUwMCwgeTogMzIyLCB3OiAxNzMsIGg6IDMwOCB9XHJcbiAgICAgIHNoeWd1eTogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDY5MSwgeTogMzIyLCB3OiAxNTQsIGg6IDMwOCB9XHJcbiAgICAgIHRvYWRldHRlOiAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDg0NywgeTogMzIyLCB3OiAxNTgsIGg6IDMwOCB9XHJcblxyXG4gIGNhbGNXaWR0aDogKHNwcml0ZU5hbWUsIGhlaWdodCkgLT5cclxuICAgIHNwcml0ZSA9IEBzcHJpdGVzW3Nwcml0ZU5hbWVdXHJcbiAgICByZXR1cm4gMSBpZiBub3Qgc3ByaXRlXHJcbiAgICByZXR1cm4gaGVpZ2h0ICogc3ByaXRlLncgLyBzcHJpdGUuaFxyXG5cclxuICByZW5kZXI6IChzcHJpdGVOYW1lLCBkeCwgZHksIGR3LCBkaCwgcm90LCBhbmNob3J4LCBhbmNob3J5LCBjb2xvciwgY2IpIC0+XHJcbiAgICBzcHJpdGUgPSBAc3ByaXRlc1tzcHJpdGVOYW1lXVxyXG4gICAgcmV0dXJuIGlmIG5vdCBzcHJpdGVcclxuICAgIGlmIChkdyA9PSAwKSBhbmQgKGRoID09IDApXHJcbiAgICAgICMgdGhpcyBwcm9iYWJseSBzaG91bGRuJ3QgZXZlciBiZSB1c2VkLlxyXG4gICAgICBkdyA9IHNwcml0ZS54XHJcbiAgICAgIGRoID0gc3ByaXRlLnlcclxuICAgIGVsc2UgaWYgZHcgPT0gMFxyXG4gICAgICBkdyA9IGRoICogc3ByaXRlLncgLyBzcHJpdGUuaFxyXG4gICAgZWxzZSBpZiBkaCA9PSAwXHJcbiAgICAgIGRoID0gZHcgKiBzcHJpdGUuaCAvIHNwcml0ZS53XHJcbiAgICBAZ2FtZS5kcmF3SW1hZ2Ugc3ByaXRlLnRleHR1cmUsIHNwcml0ZS54LCBzcHJpdGUueSwgc3ByaXRlLncsIHNwcml0ZS5oLCBkeCwgZHksIGR3LCBkaCwgcm90LCBhbmNob3J4LCBhbmNob3J5LCBjb2xvci5yLCBjb2xvci5nLCBjb2xvci5iLCBjb2xvci5hLCBjYlxyXG4gICAgcmV0dXJuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNwcml0ZVJlbmRlcmVyXHJcbiIsIk1JTl9QTEFZRVJTID0gM1xyXG5NQVhfTE9HX0xJTkVTID0gN1xyXG5PSyA9ICdPSydcclxuXHJcblN1aXQgPVxyXG4gIE5PTkU6IC0xXHJcbiAgU1BBREVTOiAwXHJcbiAgQ0xVQlM6IDFcclxuICBESUFNT05EUzogMlxyXG4gIEhFQVJUUzogM1xyXG5cclxuU3VpdE5hbWUgPSBbJ1NwYWRlcycsICdDbHVicycsICdEaWFtb25kcycsICdIZWFydHMnXVxyXG5TaG9ydFN1aXROYW1lID0gWydTJywgJ0MnLCAnRCcsICdIJ11cclxuXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgQUkgTmFtZSBHZW5lcmF0b3JcclxuXHJcbmFpQ2hhcmFjdGVyTGlzdCA9IFtcclxuICB7IGlkOiBcIm1hcmlvXCIsICAgIG5hbWU6IFwiTWFyaW9cIiwgICAgICBzcHJpdGU6IFwibWFyaW9cIiwgICAgYnJhaW46IFwibm9ybWFsXCIgfVxyXG4gIHsgaWQ6IFwibHVpZ2lcIiwgICAgbmFtZTogXCJMdWlnaVwiLCAgICAgIHNwcml0ZTogXCJsdWlnaVwiLCAgICBicmFpbjogXCJub3JtYWxcIiB9XHJcbiAgeyBpZDogXCJwZWFjaFwiLCAgICBuYW1lOiBcIlBlYWNoXCIsICAgICAgc3ByaXRlOiBcInBlYWNoXCIsICAgIGJyYWluOiBcIm5vcm1hbFwiIH1cclxuICB7IGlkOiBcImRhaXN5XCIsICAgIG5hbWU6IFwiRGFpc3lcIiwgICAgICBzcHJpdGU6IFwiZGFpc3lcIiwgICAgYnJhaW46IFwibm9ybWFsXCIgfVxyXG4gIHsgaWQ6IFwieW9zaGlcIiwgICAgbmFtZTogXCJZb3NoaVwiLCAgICAgIHNwcml0ZTogXCJ5b3NoaVwiLCAgICBicmFpbjogXCJub3JtYWxcIiB9XHJcbiAgeyBpZDogXCJ0b2FkXCIsICAgICBuYW1lOiBcIlRvYWRcIiwgICAgICAgc3ByaXRlOiBcInRvYWRcIiwgICAgIGJyYWluOiBcIm5vcm1hbFwiIH1cclxuICB7IGlkOiBcImJvd3NlclwiLCAgIG5hbWU6IFwiQm93c2VyXCIsICAgICBzcHJpdGU6IFwiYm93c2VyXCIsICAgYnJhaW46IFwibm9ybWFsXCIgfVxyXG4gIHsgaWQ6IFwiYm93c2VyanJcIiwgbmFtZTogXCJCb3dzZXIgSnJcIiwgIHNwcml0ZTogXCJib3dzZXJqclwiLCBicmFpbjogXCJub3JtYWxcIiB9XHJcbiAgeyBpZDogXCJrb29wYVwiLCAgICBuYW1lOiBcIktvb3BhXCIsICAgICAgc3ByaXRlOiBcImtvb3BhXCIsICAgIGJyYWluOiBcIm5vcm1hbFwiIH1cclxuICB7IGlkOiBcInJvc2FsaW5hXCIsIG5hbWU6IFwiUm9zYWxpbmFcIiwgICBzcHJpdGU6IFwicm9zYWxpbmFcIiwgYnJhaW46IFwibm9ybWFsXCIgfVxyXG4gIHsgaWQ6IFwic2h5Z3V5XCIsICAgbmFtZTogXCJTaHlndXlcIiwgICAgIHNwcml0ZTogXCJzaHlndXlcIiwgICBicmFpbjogXCJub3JtYWxcIiB9XHJcbiAgeyBpZDogXCJ0b2FkZXR0ZVwiLCBuYW1lOiBcIlRvYWRldHRlXCIsICAgc3ByaXRlOiBcInRvYWRldHRlXCIsIGJyYWluOiBcIm5vcm1hbFwiIH1cclxuXVxyXG5cclxuYWlDaGFyYWN0ZXJzID0ge31cclxuZm9yIGNoYXJhY3RlciBpbiBhaUNoYXJhY3Rlckxpc3RcclxuICBhaUNoYXJhY3RlcnNbY2hhcmFjdGVyLmlkXSA9IGNoYXJhY3RlclxyXG5cclxucmFuZG9tQ2hhcmFjdGVyID0gLT5cclxuICByID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogYWlDaGFyYWN0ZXJMaXN0Lmxlbmd0aClcclxuICByZXR1cm4gYWlDaGFyYWN0ZXJMaXN0W3JdXHJcblxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIENhcmRcclxuXHJcbmNsYXNzIENhcmRcclxuICBjb25zdHJ1Y3RvcjogKEByYXcpIC0+XHJcbiAgICBAc3VpdCAgPSBNYXRoLmZsb29yKEByYXcgJSA0KVxyXG4gICAgQHZhbHVlID0gTWF0aC5mbG9vcihAcmF3IC8gNClcclxuICAgIEB2YWx1ZU5hbWUgPSBzd2l0Y2ggQHZhbHVlXHJcbiAgICAgIHdoZW4gIDggdGhlbiAnSidcclxuICAgICAgd2hlbiAgOSB0aGVuICdRJ1xyXG4gICAgICB3aGVuIDEwIHRoZW4gJ0snXHJcbiAgICAgIHdoZW4gMTEgdGhlbiAnQSdcclxuICAgICAgd2hlbiAxMiB0aGVuICcyJ1xyXG4gICAgICBlbHNlXHJcbiAgICAgICAgU3RyaW5nKEB2YWx1ZSArIDMpXHJcbiAgICBAbmFtZSA9IEB2YWx1ZU5hbWUgKyBTaG9ydFN1aXROYW1lW0BzdWl0XVxyXG4gICAgIyBjb25zb2xlLmxvZyBcIiN7QHJhd30gLT4gI3tAbmFtZX1cIlxyXG5cclxuY2FyZHNUb1N0cmluZyA9IChyYXdDYXJkcykgLT5cclxuICBjYXJkTmFtZXMgPSBbXVxyXG4gIGZvciByYXcgaW4gcmF3Q2FyZHNcclxuICAgIGNhcmQgPSBuZXcgQ2FyZChyYXcpXHJcbiAgICBjYXJkTmFtZXMucHVzaCBjYXJkLm5hbWVcclxuICByZXR1cm4gXCJbIFwiICsgY2FyZE5hbWVzLmpvaW4oJywnKSArIFwiIF1cIlxyXG5cclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuIyBEZWNrXHJcblxyXG5jbGFzcyBTaHVmZmxlZERlY2tcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgICMgZGF0IGluc2lkZS1vdXQgc2h1ZmZsZSFcclxuICAgIEBjYXJkcyA9IFsgMCBdXHJcbiAgICBmb3IgaSBpbiBbMS4uLjUyXVxyXG4gICAgICBqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogaSlcclxuICAgICAgQGNhcmRzLnB1c2goQGNhcmRzW2pdKVxyXG4gICAgICBAY2FyZHNbal0gPSBpXHJcblxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIFRoaXJ0ZWVuXHJcblxyXG5jbGFzcyBUaGlydGVlblxyXG4gIGNvbnN0cnVjdG9yOiAoQGdhbWUsIHBhcmFtcykgLT5cclxuICAgIHJldHVybiBpZiBub3QgcGFyYW1zXHJcblxyXG4gICAgaWYgcGFyYW1zLnN0YXRlXHJcbiAgICAgIGZvciBrLHYgb2YgcGFyYW1zLnN0YXRlXHJcbiAgICAgICAgaWYgcGFyYW1zLnN0YXRlLmhhc093blByb3BlcnR5KGspXHJcbiAgICAgICAgICB0aGlzW2tdID0gcGFyYW1zLnN0YXRlW2tdXHJcbiAgICBlbHNlXHJcbiAgICAgICMgbmV3IGdhbWVcclxuICAgICAgQGxvZyA9IFtdXHJcblxyXG4gICAgICBAcGxheWVycyA9IFtcclxuICAgICAgICB7IGlkOiAxLCBuYW1lOiAnUGxheWVyJywgaW5kZXg6IDAsIHBhc3M6IGZhbHNlIH1cclxuICAgICAgXVxyXG5cclxuICAgICAgZm9yIGkgaW4gWzEuLi40XVxyXG4gICAgICAgIEBhZGRBSSgpXHJcblxyXG4gICAgICBAZGVhbCgpXHJcblxyXG4gIGRlYWw6IChwYXJhbXMpIC0+XHJcbiAgICBkZWNrID0gbmV3IFNodWZmbGVkRGVjaygpXHJcbiAgICBmb3IgcGxheWVyLCBpIGluIEBwbGF5ZXJzXHJcbiAgICAgIEBnYW1lLmxvZyBcImRlYWxpbmcgMTMgY2FyZHMgdG8gcGxheWVyICN7aX1cIlxyXG5cclxuICAgICAgcGxheWVyLmhhbmQgPSBbXVxyXG4gICAgICBmb3IgaiBpbiBbMC4uLjEzXVxyXG4gICAgICAgIHBsYXllci5oYW5kLnB1c2goZGVjay5jYXJkcy5zaGlmdCgpKVxyXG5cclxuICAgICAgY29uc29sZS5sb2cgXCJAZ2FtZS5vcHRpb25zLnNvcnRJbmRleCAje0BnYW1lLm9wdGlvbnMuc29ydEluZGV4fVwiXHJcbiAgICAgIGlmIChAZ2FtZS5vcHRpb25zLnNvcnRJbmRleCA9PSAwKSBvciBwbGF5ZXIuYWlcclxuICAgICAgICAjIE5vcm1hbFxyXG4gICAgICAgIHBsYXllci5oYW5kLnNvcnQgKGEsYikgLT4gcmV0dXJuIGEgLSBiXHJcbiAgICAgIGVsc2VcclxuICAgICAgICAjIFJldmVyc2VcclxuICAgICAgICBwbGF5ZXIuaGFuZC5zb3J0IChhLGIpIC0+IHJldHVybiBiIC0gYVxyXG5cclxuICAgIEB0dXJuID0gMCAjIFRPRE86IGZpeFxyXG4gICAgQHBpbGUgPSBbXVxyXG4gICAgQHBpbGVXaG8gPSAtMVxyXG4gICAgQHRocm93SUQgPSAwXHJcbiAgICBAY3VycmVudFBsYXkgPSBudWxsXHJcblxyXG4gICAgQG91dHB1dCgnSGFuZCBkZWFsdCwgJyArIEBwbGF5ZXJzW0B0dXJuXS5uYW1lICsgJyBwbGF5cyBmaXJzdCcpXHJcblxyXG4gICAgcmV0dXJuIE9LXHJcblxyXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgIyBUaGlydGVlbiBtZXRob2RzXHJcblxyXG4gIHNhdmU6IC0+XHJcbiAgICBuYW1lcyA9IFwibG9nIHBsYXllcnMgdHVybiBwaWxlIHBpbGVXaG8gdGhyb3dJRCBjdXJyZW50UGxheVwiLnNwbGl0KFwiIFwiKVxyXG4gICAgc3RhdGUgPSB7fVxyXG4gICAgZm9yIG5hbWUgaW4gbmFtZXNcclxuICAgICAgc3RhdGVbbmFtZV0gPSB0aGlzW25hbWVdXHJcbiAgICByZXR1cm4gc3RhdGVcclxuXHJcbiAgb3V0cHV0OiAodGV4dCkgLT5cclxuICAgIEBsb2cucHVzaCB0ZXh0XHJcbiAgICBpZiBAbG9nLmxlbmd0aCA+IE1BWF9MT0dfTElORVNcclxuICAgICAgQGxvZy5zaGlmdCgpXHJcblxyXG4gIGZpbmRQbGF5ZXI6IChpZCkgLT5cclxuICAgIGZvciBwbGF5ZXIgaW4gQHBsYXllcnNcclxuICAgICAgaWYgcGxheWVyLmlkID09IGlkXHJcbiAgICAgICAgcmV0dXJuIHBsYXllclxyXG4gICAgcmV0dXJuIHVuZGVmaW5lZFxyXG5cclxuICBjdXJyZW50UGxheWVyOiAtPlxyXG4gICAgcmV0dXJuIEBwbGF5ZXJzW0B0dXJuXVxyXG5cclxuICBldmVyeW9uZVBhc3NlZDogLT5cclxuICAgIGZvciBwbGF5ZXIsIHBsYXllckluZGV4IGluIEBwbGF5ZXJzXHJcbiAgICAgIGlmIHBsYXllckluZGV4ID09IEB0dXJuXHJcbiAgICAgICAgY29udGludWVcclxuICAgICAgaWYgbm90IHBsYXllci5wYXNzXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICBwbGF5ZXJBZnRlcjogKGluZGV4KSAtPlxyXG4gICAgcmV0dXJuIChpbmRleCArIDEpICUgQHBsYXllcnMubGVuZ3RoXHJcblxyXG4gIGFkZFBsYXllcjogKHBsYXllcikgLT5cclxuICAgIGlmIG5vdCBwbGF5ZXIuYWlcclxuICAgICAgcGxheWVyLmFpID0gZmFsc2VcclxuXHJcbiAgICBAcGxheWVycy5wdXNoIHBsYXllclxyXG4gICAgcGxheWVyLmluZGV4ID0gQHBsYXllcnMubGVuZ3RoIC0gMVxyXG4gICAgQG91dHB1dChwbGF5ZXIubmFtZSArIFwiIGpvaW5zIHRoZSBnYW1lXCIpXHJcblxyXG4gIG5hbWVQcmVzZW50OiAobmFtZSkgLT5cclxuICAgIGZvciBwbGF5ZXIgaW4gQHBsYXllcnNcclxuICAgICAgaWYgcGxheWVyLm5hbWUgPT0gbmFtZVxyXG4gICAgICAgIHJldHVybiB0cnVlXHJcblxyXG4gICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gIGFkZEFJOiAtPlxyXG4gICAgbG9vcFxyXG4gICAgICBjaGFyYWN0ZXIgPSByYW5kb21DaGFyYWN0ZXIoKVxyXG4gICAgICBpZiBub3QgQG5hbWVQcmVzZW50KGNoYXJhY3Rlci5uYW1lKVxyXG4gICAgICAgIGJyZWFrXHJcblxyXG4gICAgYWkgPVxyXG4gICAgICBjaGFySUQ6IGNoYXJhY3Rlci5pZFxyXG4gICAgICBuYW1lOiBjaGFyYWN0ZXIubmFtZVxyXG4gICAgICBpZDogJ2FpJyArIFN0cmluZyhAcGxheWVycy5sZW5ndGgpXHJcbiAgICAgIHBhc3M6IGZhbHNlXHJcbiAgICAgIGFpOiB0cnVlXHJcblxyXG4gICAgQGFkZFBsYXllcihhaSlcclxuXHJcbiAgICBAZ2FtZS5sb2coXCJhZGRlZCBBSSBwbGF5ZXJcIilcclxuICAgIHJldHVybiBPS1xyXG5cclxuICB1cGRhdGVQbGF5ZXJIYW5kOiAoY2FyZHMpIC0+XHJcbiAgICAjIFRoaXMgbWFpbnRhaW5zIHRoZSByZW9yZ2FuaXplZCBvcmRlciBvZiB0aGUgcGxheWVyJ3MgaGFuZFxyXG4gICAgQHBsYXllcnNbMF0uaGFuZCA9IGNhcmRzLnNsaWNlKDApXHJcblxyXG4gIHdpbm5lcjogLT5cclxuICAgIGZvciBwbGF5ZXIsIGkgaW4gQHBsYXllcnNcclxuICAgICAgaWYgcGxheWVyLmhhbmQubGVuZ3RoID09IDBcclxuICAgICAgICByZXR1cm4gcGxheWVyXHJcbiAgICByZXR1cm4gbnVsbFxyXG5cclxuICBoYXNDYXJkOiAoaGFuZCwgcmF3Q2FyZCkgLT5cclxuICAgIGZvciByYXcgaW4gaGFuZFxyXG4gICAgICBpZiByYXcgPT0gcmF3Q2FyZFxyXG4gICAgICAgIHJldHVybiB0cnVlXHJcbiAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgaGFzQ2FyZHM6IChoYW5kLCByYXdDYXJkcykgLT5cclxuICAgIGZvciByYXcgaW4gcmF3Q2FyZHNcclxuICAgICAgaWYgbm90IEBoYXNDYXJkKGhhbmQsIHJhdylcclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgIHJldHVybiB0cnVlXHJcblxyXG4gIHJlbW92ZUNhcmRzOiAoaGFuZCwgcmF3Q2FyZHMpIC0+XHJcbiAgICBuZXdIYW5kID0gW11cclxuICAgIGZvciBjYXJkIGluIGhhbmRcclxuICAgICAga2VlcE1lID0gdHJ1ZVxyXG4gICAgICBmb3IgcmF3IGluIHJhd0NhcmRzXHJcbiAgICAgICAgaWYgY2FyZCA9PSByYXdcclxuICAgICAgICAgIGtlZXBNZSA9IGZhbHNlXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICBpZiBrZWVwTWVcclxuICAgICAgICBuZXdIYW5kLnB1c2ggY2FyZFxyXG4gICAgcmV0dXJuIG5ld0hhbmRcclxuXHJcbiAgY2xhc3NpZnk6IChyYXdDYXJkcykgLT5cclxuICAgIGNhcmRzID0gcmF3Q2FyZHMubWFwIChyYXcpIC0+IG5ldyBDYXJkKHJhdylcclxuXHJcbiAgICAjIGxvb2sgZm9yIFggb2YgYSBraW5kXHJcbiAgICByZXFWYWx1ZSA9IGNhcmRzWzBdLnZhbHVlXHJcbiAgICBoaWdoZXN0UmF3ID0gY2FyZHNbMF0ucmF3XHJcbiAgICBmb3IgY2FyZCBpbiBjYXJkc1xyXG4gICAgICBpZiBjYXJkLnZhbHVlICE9IHJlcVZhbHVlXHJcbiAgICAgICAgcmV0dXJuIG51bGxcclxuICAgICAgaWYgaGlnaGVzdFJhdyA8IGNhcmQucmF3XHJcbiAgICAgICAgaGlnaGVzdFJhdyA9IGNhcmQucmF3XHJcbiAgICB0eXBlID0gJ2tpbmQnICsgY2FyZHMubGVuZ3RoXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0eXBlOiB0eXBlXHJcbiAgICAgIGhpZ2g6IGhpZ2hlc3RSYXdcclxuICAgIH1cclxuXHJcbiAgY2FuUGFzczogKHBhcmFtcykgLT5cclxuICAgIGlmIEB3aW5uZXIoKSAhPSBudWxsXHJcbiAgICAgIHJldHVybiAnZ2FtZU92ZXInXHJcblxyXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcclxuICAgIGlmIHBhcmFtcy5pZCAhPSBjdXJyZW50UGxheWVyLmlkXHJcbiAgICAgIHJldHVybiAnbm90WW91clR1cm4nXHJcblxyXG4gICAgcmV0dXJuIE9LXHJcblxyXG4gIGNhblBsYXk6IChwYXJhbXMsIGluY29taW5nUGxheSkgLT5cclxuICAgIHJldCA9IEBjYW5QYXNzKHBhcmFtcylcclxuICAgIGlmIHJldCAhPSBPS1xyXG4gICAgICByZXR1cm4gcmV0XHJcblxyXG4gICAgaWYgaW5jb21pbmdQbGF5ID09IG51bGxcclxuICAgICAgcmV0dXJuICdpbnZhbGlkUGxheSdcclxuXHJcbiAgICBpZiBAY3VycmVudFBsYXkgPT0gbnVsbFxyXG4gICAgICByZXR1cm4gT0tcclxuXHJcbiAgICBpZiBAZXZlcnlvbmVQYXNzZWQoKVxyXG4gICAgICByZXR1cm4gT0tcclxuXHJcbiAgICBpZiBpbmNvbWluZ1BsYXkudHlwZSAhPSBAY3VycmVudFBsYXkudHlwZVxyXG4gICAgICByZXR1cm4gJ3dyb25nUGxheSdcclxuXHJcbiAgICBpZiBpbmNvbWluZ1BsYXkuaGlnaCA8IEBjdXJyZW50UGxheS5oaWdoXHJcbiAgICAgIHJldHVybiAndG9vTG93UGxheSdcclxuXHJcbiAgICByZXR1cm4gT0tcclxuXHJcbiAgcGxheTogKHBhcmFtcykgLT5cclxuICAgIGluY29taW5nUGxheSA9IEBjbGFzc2lmeShwYXJhbXMuY2FyZHMpXHJcbiAgICBjb25zb2xlLmxvZyBcImluY29taW5nUGxheVwiLCBpbmNvbWluZ1BsYXlcclxuXHJcbiAgICBjb25zb2xlLmxvZyBcInNvbWVvbmUgY2FsbGluZyBwbGF5XCIsIHBhcmFtc1xyXG4gICAgcmV0ID0gQGNhblBsYXkocGFyYW1zLCBpbmNvbWluZ1BsYXkpXHJcbiAgICBpZiByZXQgIT0gT0tcclxuICAgICAgcmV0dXJuIHJldFxyXG5cclxuICAgIGlmIEBjdXJyZW50UGxheVxyXG4gICAgICBpZiAoaW5jb21pbmdQbGF5LnR5cGUgIT0gQGN1cnJlbnRQbGF5LnR5cGUpIG9yIChpbmNvbWluZ1BsYXkuaGlnaCA8IEBjdXJyZW50UGxheS5oaWdoKVxyXG4gICAgICAgICMgTmV3IHBsYXkhXHJcbiAgICAgICAgQHVucGFzc0FsbCgpXHJcblxyXG4gICAgQGN1cnJlbnRQbGF5ID0gaW5jb21pbmdQbGF5XHJcblxyXG4gICAgQHRocm93SUQgKz0gMVxyXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcclxuICAgIGN1cnJlbnRQbGF5ZXIuaGFuZCA9IEByZW1vdmVDYXJkcyhjdXJyZW50UGxheWVyLmhhbmQsIHBhcmFtcy5jYXJkcylcclxuXHJcbiAgICBAb3V0cHV0KFwiI3tjdXJyZW50UGxheWVyLm5hbWV9IHRocm93cyAje2NhcmRzVG9TdHJpbmcocGFyYW1zLmNhcmRzKX1cIilcclxuXHJcbiAgICBpZiBjdXJyZW50UGxheWVyLmhhbmQubGVuZ3RoID09IDBcclxuICAgICAgQG91dHB1dChcIiN7Y3VycmVudFBsYXllci5uYW1lfSB3aW5zIVwiKVxyXG5cclxuICAgIEBwaWxlID0gcGFyYW1zLmNhcmRzLnNsaWNlKDApXHJcbiAgICBAcGlsZVdobyA9IEB0dXJuXHJcblxyXG4gICAgQHR1cm4gPSBAcGxheWVyQWZ0ZXIoQHR1cm4pXHJcbiAgICByZXR1cm4gT0tcclxuXHJcbiAgdW5wYXNzQWxsOiAtPlxyXG4gICAgZm9yIHBsYXllciBpbiBAcGxheWVyc1xyXG4gICAgICBwbGF5ZXIucGFzcyA9IGZhbHNlXHJcbiAgICByZXR1cm5cclxuXHJcbiAgcGFzczogKHBhcmFtcykgLT5cclxuICAgIHJldCA9IEBjYW5QYXNzKHBhcmFtcylcclxuICAgIGlmIHJldCAhPSBPS1xyXG4gICAgICByZXR1cm4gcmV0XHJcblxyXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcclxuICAgIEBvdXRwdXQoXCIje2N1cnJlbnRQbGF5ZXIubmFtZX0gcGFzc2VzXCIpXHJcbiAgICBjdXJyZW50UGxheWVyLnBhc3MgPSB0cnVlXHJcbiAgICBAdHVybiA9IEBwbGF5ZXJBZnRlcihAdHVybilcclxuICAgIHJldHVybiBPS1xyXG5cclxuICBhaVBsYXk6IChjdXJyZW50UGxheWVyLCBjYXJkcykgLT5cclxuICAgIHJldHVybiBAcGxheSh7J2lkJzpjdXJyZW50UGxheWVyLmlkLCAnY2FyZHMnOmNhcmRzfSlcclxuXHJcbiAgYWlQYXNzOiAoY3VycmVudFBsYXllcikgLT5cclxuICAgIHJldHVybiBAcGFzcyh7J2lkJzpjdXJyZW50UGxheWVyLmlkfSlcclxuXHJcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAjIEFJXHJcblxyXG4gICMgR2VuZXJpYyBsb2dnaW5nIGZ1bmN0aW9uOyBwcmVwZW5kcyBjdXJyZW50IEFJIHBsYXllcidzIGd1dHMgYmVmb3JlIHByaW50aW5nIHRleHRcclxuICBhaUxvZzogKHRleHQpIC0+XHJcbiAgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxyXG4gICAgaWYgbm90IGN1cnJlbnRQbGF5ZXIuYWlcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gICAgY2hhcmFjdGVyID0gYWlDaGFyYWN0ZXJzW2N1cnJlbnRQbGF5ZXIuY2hhcklEXVxyXG4gICAgQGdhbWUubG9nKCdBSVsnK2N1cnJlbnRQbGF5ZXIubmFtZSsnICcrY2hhcmFjdGVyLmJyYWluKyddOiBoYW5kOicrY2FyZHNUb1N0cmluZyhjdXJyZW50UGxheWVyLmhhbmQpKycgcGlsZTonK2NhcmRzVG9TdHJpbmcoQHBpbGUpKycgJyt0ZXh0KVxyXG5cclxuICAjIERldGVjdHMgaWYgdGhlIGN1cnJlbnQgcGxheWVyIGlzIEFJIGR1cmluZyBhIEJJRCBvciBUUklDSyBwaGFzZSBhbmQgYWN0cyBhY2NvcmRpbmcgdG8gdGhlaXIgJ2JyYWluJ1xyXG4gIGFpVGljazogLT5cclxuICAgIGlmIEB3aW5uZXIoKSAhPSBudWxsXHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG5cclxuICAgIGN1cnJlbnRQbGF5ZXIgPSBAY3VycmVudFBsYXllcigpXHJcbiAgICBpZiBub3QgY3VycmVudFBsYXllci5haVxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgICBjaGFyYWN0ZXIgPSBhaUNoYXJhY3RlcnNbY3VycmVudFBsYXllci5jaGFySURdXHJcbiAgICByZXQgPSBAYnJhaW5zW2NoYXJhY3Rlci5icmFpbl0ucGxheS5hcHBseSh0aGlzLCBbY3VycmVudFBsYXllciwgQGN1cnJlbnRQbGF5LCBAZXZlcnlvbmVQYXNzZWQoKV0pXHJcbiAgICBpZiByZXQgPT0gT0tcclxuICAgICAgcmV0dXJuIHRydWVcclxuICAgIHJldHVybiBmYWxzZVxyXG5cclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuIyBBSSBCcmFpbnNcclxuXHJcbiAgIyBCcmFpbnMgbXVzdCBoYXZlOlxyXG4gICMgKiBpZDogaW50ZXJuYWwgaWRlbnRpZmllciBmb3IgdGhlIGJyYWluXHJcbiAgIyAqIG5hbWU6IHByZXR0eSBuYW1lXHJcbiAgIyAqIHBsYXkoY3VycmVudFBsYXllcikgYXR0ZW1wdHMgdG8gcGxheSBhIGNhcmQgYnkgY2FsbGluZyBhaVBsYXkoKS4gU2hvdWxkIHJldHVybiB0cnVlIGlmIGl0IHN1Y2Nlc3NmdWxseSBwbGF5ZWQgYSBjYXJkIChhaVBsYXkoKSByZXR1cm5lZCB0cnVlKVxyXG4gIGJyYWluczpcclxuXHJcbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgIyBOb3JtYWw6IEludGVuZGVkIHRvIGJlIHVzZWQgYnkgbW9zdCBjaGFyYWN0ZXJzLlxyXG4gICAgIyAgICAgICAgIE5vdCB0b28gZHVtYiwgbm90IHRvbyBzbWFydC5cclxuICAgIG5vcm1hbDpcclxuICAgICAgaWQ6ICAgXCJub3JtYWxcIlxyXG4gICAgICBuYW1lOiBcIk5vcm1hbFwiXHJcblxyXG4gICAgICAjIG5vcm1hbFxyXG4gICAgICBwbGF5OiAoY3VycmVudFBsYXllciwgY3VycmVudFBsYXksIGV2ZXJ5b25lUGFzc2VkKSAtPlxyXG4gICAgICAgIGlmIGN1cnJlbnRQbGF5ZXIucGFzc1xyXG4gICAgICAgICAgQGFpTG9nKFwiYWxyZWFkeSBwYXNzZWQsIGdvaW5nIHRvIGtlZXAgcGFzc2luZ1wiKVxyXG4gICAgICAgICAgcmV0dXJuIEBhaVBhc3MoY3VycmVudFBsYXllcilcclxuXHJcbiAgICAgICAgaWYgY3VycmVudFBsYXkgYW5kIG5vdCBldmVyeW9uZVBhc3NlZFxyXG4gICAgICAgICAgaWYgY3VycmVudFBsYXkudHlwZSAhPSAna2luZDEnXHJcbiAgICAgICAgICAgIEBhaUxvZyhcInVud2lsbGluZyB0byBkbyBhbnl0aGluZyBidXQgc2luZ2xlcywgcGFzc2luZ1wiKVxyXG4gICAgICAgICAgICByZXR1cm4gQGFpUGFzcyhjdXJyZW50UGxheWVyKVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICMgbm8gY3VycmVudCBwbGF5LCB0aHJvdyB0aGUgZmlyc3QgY2FyZFxyXG4gICAgICAgICAgQGFpTG9nKFwiSSBjYW4gZG8gYW55dGhpbmcsIHRocm93aW5nIGEgc2luZ2xlXCIpXHJcbiAgICAgICAgICBpZiBAYWlQbGF5KGN1cnJlbnRQbGF5ZXIsIFtjdXJyZW50UGxheWVyLmhhbmRbMF1dKSA9PSBPS1xyXG4gICAgICAgICAgICByZXR1cm4gT0tcclxuXHJcbiAgICAgICAgIyBmaW5kIHRoZSBmaXJzdCBjYXJkIHRoYXQgYmVhdHMgdGhlIGN1cnJlbnRQbGF5J3MgaGlnaFxyXG4gICAgICAgIGZvciByYXdDYXJkIGluIGN1cnJlbnRQbGF5ZXIuaGFuZFxyXG4gICAgICAgICAgaWYgcmF3Q2FyZCA+IGN1cnJlbnRQbGF5LmhpZ2hcclxuICAgICAgICAgICAgQGFpTG9nKFwiZm91bmQgc21hbGxlc3Qgc2luZ2xlICgje3Jhd0NhcmR9KSwgcGxheWluZ1wiKVxyXG4gICAgICAgICAgICBpZiBAYWlQbGF5KGN1cnJlbnRQbGF5ZXIsIFtyYXdDYXJkXSkgPT0gT0tcclxuICAgICAgICAgICAgICByZXR1cm4gT0tcclxuICAgICAgICAgICAgYnJlYWtcclxuXHJcbiAgICAgICAgQGFpTG9nKFwibm90aGluZyBlbHNlIHRvIGRvLCBwYXNzaW5nXCIpXHJcbiAgICAgICAgcmV0dXJuIEBhaVBhc3MoY3VycmVudFBsYXllcilcclxuXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgRXhwb3J0c1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPVxyXG4gIENhcmQ6IENhcmRcclxuICBUaGlydGVlbjogVGhpcnRlZW5cclxuICBPSzogT0tcclxuICBhaUNoYXJhY3RlcnM6IGFpQ2hhcmFjdGVyc1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9XHJcbiAgZGFya2ZvcmVzdDpcclxuICAgIGhlaWdodDogNzJcclxuICAgIGdseXBoczpcclxuICAgICAgJzk3JyA6IHsgeDogICA4LCB5OiAgIDgsIHdpZHRoOiAgMzQsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICc5OCcgOiB7IHg6ICAgOCwgeTogIDU4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnOTknIDogeyB4OiAgNTAsIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzEwMCc6IHsgeDogICA4LCB5OiAxMTgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICcxMDEnOiB7IHg6ICAgOCwgeTogMTc4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnMTAyJzogeyB4OiAgIDgsIHk6IDIyOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDMzIH1cclxuICAgICAgJzEwMyc6IHsgeDogICA4LCB5OiAyNzgsIHdpZHRoOiAgMzYsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNSB9XHJcbiAgICAgICcxMDQnOiB7IHg6ICAgOCwgeTogMzI4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnMTA1JzogeyB4OiAgIDgsIHk6IDM3OCwgd2lkdGg6ICAxMiwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDExIH1cclxuICAgICAgJzEwNic6IHsgeDogICA4LCB5OiA0MjgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQxLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICcxMDcnOiB7IHg6ICAyOCwgeTogMzc4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnMTA4JzogeyB4OiAgNTEsIHk6IDMyOCwgd2lkdGg6ICAzNCwgaGVpZ2h0OiAgNDEsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDMzIH1cclxuICAgICAgJzEwOSc6IHsgeDogIDUxLCB5OiA0MjcsIHdpZHRoOiAgMzgsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNyB9XHJcbiAgICAgICcxMTAnOiB7IHg6ICA3MSwgeTogMzc3LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnMTExJzogeyB4OiAgOTcsIHk6IDQyNywgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDEsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzExMic6IHsgeDogIDUxLCB5OiAgNTgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICcxMTMnOiB7IHg6ICA1MSwgeTogMTA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0NSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnMTE0JzogeyB4OiAgOTMsIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM1IH1cclxuICAgICAgJzExNSc6IHsgeDogIDUxLCB5OiAxNjEsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNSB9XHJcbiAgICAgICcxMTYnOiB7IHg6ICA1MSwgeTogMjExLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzMgfVxyXG4gICAgICAnMTE3JzogeyB4OiAgNTIsIHk6IDI2MSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzExOCc6IHsgeDogIDkzLCB5OiAzMTEsIHdpZHRoOiAgMzQsIGhlaWdodDogIDQxLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzMiB9XHJcbiAgICAgICcxMTknOiB7IHg6IDExNCwgeTogMzYwLCB3aWR0aDogIDM4LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzggfVxyXG4gICAgICAnMTIwJzogeyB4OiAxNDAsIHk6IDQxMCwgd2lkdGg6ICAzNiwgaGVpZ2h0OiAgNDEsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM3IH1cclxuICAgICAgJzEyMSc6IHsgeDogMTQwLCB5OiA0NTksIHdpZHRoOiAgMzUsIGhlaWdodDogIDQxLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICcxMjInOiB7IHg6IDE4MywgeTogNDU5LCB3aWR0aDogIDM2LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzUgfVxyXG4gICAgICAnNjUnIDogeyB4OiAgOTQsIHk6ICA1OCwgd2lkdGg6ICAzNCwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cclxuICAgICAgJzY2JyA6IHsgeDogIDk0LCB5OiAxMTksIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNyB9XHJcbiAgICAgICc2NycgOiB7IHg6ICA5NCwgeTogMTgwLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxyXG4gICAgICAnNjgnIDogeyB4OiAgOTUsIHk6IDI0MSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM3IH1cclxuICAgICAgJzY5JyA6IHsgeDogMTM2LCB5OiAgIDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XHJcbiAgICAgICc3MCcgOiB7IHg6IDEzNywgeTogIDY5LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnNzEnIDogeyB4OiAxNzksIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cclxuICAgICAgJzcyJyA6IHsgeDogMTM3LCB5OiAxMzAsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XHJcbiAgICAgICc3MycgOiB7IHg6IDEzOCwgeTogMTkxLCB3aWR0aDogIDEyLCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMTMgfVxyXG4gICAgICAnNzQnIDogeyB4OiAxMzgsIHk6IDI1Miwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cclxuICAgICAgJzc1JyA6IHsgeDogMTU4LCB5OiAxOTEsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XHJcbiAgICAgICc3NicgOiB7IHg6IDE2MCwgeTogMzEzLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnNzcnIDogeyB4OiAxODEsIHk6IDI1MSwgd2lkdGg6ICAzOCwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM5IH1cclxuICAgICAgJzc4JyA6IHsgeDogMTg0LCB5OiAzNzQsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNSB9XHJcbiAgICAgICc3OScgOiB7IHg6IDIwMywgeTogMzEyLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxyXG4gICAgICAnODAnIDogeyB4OiAxODAsIHk6ICA2OSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzgxJyA6IHsgeDogMjAxLCB5OiAxMzAsIHdpZHRoOiAgMzUsIGhlaWdodDogIDU2LCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNSB9XHJcbiAgICAgICc4MicgOiB7IHg6IDIyMiwgeTogICA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxyXG4gICAgICAnODMnIDogeyB4OiAyMjMsIHk6ICA2OSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM1IH1cclxuICAgICAgJzg0JyA6IHsgeDogMjY1LCB5OiAgIDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzMyB9XHJcbiAgICAgICc4NScgOiB7IHg6IDIyNywgeTogMTk0LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxyXG4gICAgICAnODYnIDogeyB4OiAyNDQsIHk6IDEzMCwgd2lkdGg6ICA0MSwgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDE5LCB4YWR2YW5jZTogIDM5IH1cclxuICAgICAgJzg3JyA6IHsgeDogMjY2LCB5OiAgNjksIHdpZHRoOiAgMzgsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNyB9XHJcbiAgICAgICc4OCcgOiB7IHg6IDMwOCwgeTogICA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMTksIHhhZHZhbmNlOiAgMzUgfVxyXG4gICAgICAnODknIDogeyB4OiAyMjcsIHk6IDM3Mywgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDE5LCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzkwJyA6IHsgeDogMjI3LCB5OiA0MzMsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNSB9XHJcbiAgICAgICczMycgOiB7IHg6IDI0NiwgeTogMjU1LCB3aWR0aDogIDE0LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMTEgfVxyXG4gICAgICAnNTknIDogeyB4OiAxODAsIHk6IDEzMCwgd2lkdGg6ICAxMywgaGVpZ2h0OiAgMzcsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDU2LCB4YWR2YW5jZTogIDEzIH1cclxuICAgICAgJzM3JyA6IHsgeDogIDk1LCB5OiAzMDIsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XHJcbiAgICAgICc1OCcgOiB7IHg6IDE2MCwgeTogMzc0LCB3aWR0aDogIDEzLCBoZWlnaHQ6ICAyMywgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNTAsIHhhZHZhbmNlOiAgMTMgfVxyXG4gICAgICAnNjMnIDogeyB4OiAyNjgsIHk6IDI1NSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDMzIH1cclxuICAgICAgJzQyJyA6IHsgeDogMTAzLCB5OiAzMDIsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XHJcbiAgICAgICc0MCcgOiB7IHg6IDI3MCwgeTogMTkwLCB3aWR0aDogIDIzLCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMjEgfVxyXG4gICAgICAnNDEnIDogeyB4OiAyOTMsIHk6IDEzMCwgd2lkdGg6ICAyMywgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDIxIH1cclxuICAgICAgJzk1JyA6IHsgeDogMTExLCB5OiAzMDIsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XHJcbiAgICAgICc0MycgOiB7IHg6IDI0NiwgeTogMzE2LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICAzNCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgMzksIHhhZHZhbmNlOiAgMzIgfVxyXG4gICAgICAnNDUnIDogeyB4OiAxODQsIHk6IDQzNSwgd2lkdGg6ICAyNiwgaGVpZ2h0OiAgMTEsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDQ0LCB4YWR2YW5jZTogIDI1IH1cclxuICAgICAgJzYxJyA6IHsgeDogMzEyLCB5OiAgNjgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDMwLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICA0MiwgeGFkdmFuY2U6ICAzMyB9XHJcbiAgICAgICc0NicgOiB7IHg6IDEzNSwgeTogMzEzLCB3aWR0aDogIDE0LCBoZWlnaHQ6ICAxMSwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNjEsIHhhZHZhbmNlOiAgMTQgfVxyXG4gICAgICAnNDQnIDogeyB4OiAyMjcsIHk6IDI1NSwgd2lkdGg6ICAxMCwgaGVpZ2h0OiAgMjEsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDY4LCB4YWR2YW5jZTogIDExIH1cclxuICAgICAgJzQ3JyA6IHsgeDogMzUxLCB5OiAgIDgsIHdpZHRoOiAgMjgsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAxOSwgeGFkdmFuY2U6ICAyNiB9XHJcbiAgICAgICcxMjQnOiB7IHg6IDExOSwgeTogMzAyLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxyXG4gICAgICAnMzQnIDogeyB4OiAxMjcsIHk6IDMwMiwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cclxuICAgICAgJzM5JyA6IHsgeDogMjAxLCB5OiAxOTQsIHdpZHRoOiAgMTgsIGhlaWdodDogIDE5LCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAgMCwgeGFkdmFuY2U6ICAyMSB9XHJcbiAgICAgICc2NCcgOiB7IHg6IDIxOCwgeTogNDM1LCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxyXG4gICAgICAnMzUnIDogeyB4OiAyMTgsIHk6IDQ0Mywgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cclxuICAgICAgJzM2JyA6IHsgeDogMzAxLCB5OiAxOTAsIHdpZHRoOiAgMzIsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAyMiwgeGFkdmFuY2U6ICAyOSB9XHJcbiAgICAgICc5NCcgOiB7IHg6IDIxOCwgeTogNDUxLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxyXG4gICAgICAnMzgnIDogeyB4OiAyNDYsIHk6IDM1OCwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cclxuICAgICAgJzEyMyc6IHsgeDogMzI0LCB5OiAxMDYsIHdpZHRoOiAgMjcsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAyNiB9XHJcbiAgICAgICcxMjUnOiB7IHg6IDI3MCwgeTogMzU4LCB3aWR0aDogIDI3LCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMjcgfVxyXG4gICAgICAnOTEnIDogeyB4OiAyNzAsIHk6IDQxOCwgd2lkdGg6ICAyMiwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDIxIH1cclxuICAgICAgJzkzJyA6IHsgeDogMzAwLCB5OiA0MTgsIHdpZHRoOiAgMjIsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAyMCB9XHJcbiAgICAgICc0OCcgOiB7IHg6IDMwNSwgeTogMzE2LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxyXG4gICAgICAnNDknIDogeyB4OiAzMTEsIHk6IDI1MSwgd2lkdGg6ICAzNCwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM1IH1cclxuICAgICAgJzUwJyA6IHsgeDogMzQxLCB5OiAxNjYsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNyB9XHJcbiAgICAgICc1MScgOiB7IHg6IDM1OSwgeTogIDY4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxyXG4gICAgICAnNTInIDogeyB4OiAzMzAsIHk6IDM3Nywgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM1IH1cclxuICAgICAgJzUzJyA6IHsgeDogMzQ4LCB5OiAzMTIsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNyB9XHJcbiAgICAgICc1NCcgOiB7IHg6IDMzMCwgeTogNDM4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxyXG4gICAgICAnNTUnIDogeyB4OiAzNTMsIHk6IDIyNywgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzU2JyA6IHsgeDogMzg0LCB5OiAxMjksIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XHJcbiAgICAgICc1NycgOiB7IHg6IDQwMiwgeTogICA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxyXG4gICAgICAnMzInIDogeyB4OiAgIDAsIHk6ICAgMCwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDIyIH1cclxuIiwiIyBUaGlzIGZpbGUgcHJvdmlkZXMgdGhlIHJlbmRlcmluZyBlbmdpbmUgZm9yIHRoZSB3ZWIgdmVyc2lvbi4gTm9uZSBvZiB0aGlzIGNvZGUgaXMgaW5jbHVkZWQgaW4gdGhlIEphdmEgdmVyc2lvbi5cclxuXHJcbmNvbnNvbGUubG9nICd3ZWIgc3RhcnR1cCdcclxuXHJcbkdhbWUgPSByZXF1aXJlICcuL0dhbWUnXHJcblxyXG4jIHRha2VuIGZyb20gaHR0cDojc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzU2MjM4MzgvcmdiLXRvLWhleC1hbmQtaGV4LXRvLXJnYlxyXG5jb21wb25lbnRUb0hleCA9IChjKSAtPlxyXG4gIGhleCA9IE1hdGguZmxvb3IoYyAqIDI1NSkudG9TdHJpbmcoMTYpXHJcbiAgcmV0dXJuIGlmIGhleC5sZW5ndGggPT0gMSB0aGVuIFwiMFwiICsgaGV4IGVsc2UgaGV4XHJcbnJnYlRvSGV4ID0gKHIsIGcsIGIpIC0+XHJcbiAgcmV0dXJuIFwiI1wiICsgY29tcG9uZW50VG9IZXgocikgKyBjb21wb25lbnRUb0hleChnKSArIGNvbXBvbmVudFRvSGV4KGIpXHJcblxyXG5TQVZFX1RJTUVSX01TID0gMzAwMFxyXG5cclxuY2xhc3MgTmF0aXZlQXBwXHJcbiAgY29uc3RydWN0b3I6IChAc2NyZWVuLCBAd2lkdGgsIEBoZWlnaHQpIC0+XHJcbiAgICBAdGludGVkVGV4dHVyZUNhY2hlID0gW11cclxuICAgIEBsYXN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXHJcbiAgICBAbGFzdEludGVyYWN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXHJcbiAgICBAaGVhcmRPbmVUb3VjaCA9IGZhbHNlXHJcbiAgICBAdG91Y2hNb3VzZSA9IG51bGxcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdtb3VzZWRvd24nLCAgQG9uTW91c2VEb3duLmJpbmQodGhpcyksIGZhbHNlXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2Vtb3ZlJywgIEBvbk1vdXNlTW92ZS5iaW5kKHRoaXMpLCBmYWxzZVxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNldXAnLCAgICBAb25Nb3VzZVVwLmJpbmQodGhpcyksIGZhbHNlXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAndG91Y2hzdGFydCcsIEBvblRvdWNoU3RhcnQuYmluZCh0aGlzKSwgZmFsc2VcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICd0b3VjaG1vdmUnLCAgQG9uVG91Y2hNb3ZlLmJpbmQodGhpcyksIGZhbHNlXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAndG91Y2hlbmQnLCAgIEBvblRvdWNoRW5kLmJpbmQodGhpcyksIGZhbHNlXHJcbiAgICBAY29udGV4dCA9IEBzY3JlZW4uZ2V0Q29udGV4dChcIjJkXCIpXHJcbiAgICBAdGV4dHVyZXMgPSBbXHJcbiAgICAgICMgYWxsIGNhcmQgYXJ0XHJcbiAgICAgIFwiLi4vaW1hZ2VzL2NhcmRzLnBuZ1wiXHJcbiAgICAgICMgZm9udHNcclxuICAgICAgXCIuLi9pbWFnZXMvZGFya2ZvcmVzdC5wbmdcIlxyXG4gICAgICAjIGNoYXJhY3RlcnMgLyBvdGhlclxyXG4gICAgICBcIi4uL2ltYWdlcy9jaGFycy5wbmdcIlxyXG4gICAgICAjIGhlbHBcclxuICAgICAgXCIuLi9pbWFnZXMvaG93dG8xLnBuZ1wiXHJcbiAgICAgIFwiLi4vaW1hZ2VzL2hvd3RvMi5wbmdcIlxyXG4gICAgICBcIi4uL2ltYWdlcy9ob3d0bzMucG5nXCJcclxuICAgIF1cclxuXHJcbiAgICBAZ2FtZSA9IG5ldyBHYW1lKHRoaXMsIEB3aWR0aCwgQGhlaWdodClcclxuXHJcbiAgICBpZiB0eXBlb2YgU3RvcmFnZSAhPSBcInVuZGVmaW5lZFwiXHJcbiAgICAgIHN0YXRlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0gXCJzdGF0ZVwiXHJcbiAgICAgIGlmIHN0YXRlXHJcbiAgICAgICAgIyBjb25zb2xlLmxvZyBcImxvYWRpbmcgc3RhdGU6ICN7c3RhdGV9XCJcclxuICAgICAgICBAZ2FtZS5sb2FkIHN0YXRlXHJcblxyXG4gICAgQHBlbmRpbmdJbWFnZXMgPSAwXHJcbiAgICBsb2FkZWRUZXh0dXJlcyA9IFtdXHJcbiAgICBmb3IgaW1hZ2VVcmwgaW4gQHRleHR1cmVzXHJcbiAgICAgIEBwZW5kaW5nSW1hZ2VzKytcclxuICAgICAgY29uc29sZS5sb2cgXCJsb2FkaW5nIGltYWdlICN7QHBlbmRpbmdJbWFnZXN9OiAje2ltYWdlVXJsfVwiXHJcbiAgICAgIGltZyA9IG5ldyBJbWFnZSgpXHJcbiAgICAgIGltZy5vbmxvYWQgPSBAb25JbWFnZUxvYWRlZC5iaW5kKHRoaXMpXHJcbiAgICAgIGltZy5zcmMgPSBpbWFnZVVybFxyXG4gICAgICBsb2FkZWRUZXh0dXJlcy5wdXNoIGltZ1xyXG4gICAgQHRleHR1cmVzID0gbG9hZGVkVGV4dHVyZXNcclxuXHJcbiAgICBAc2F2ZVRpbWVyID0gU0FWRV9USU1FUl9NU1xyXG5cclxuICBvbkltYWdlTG9hZGVkOiAoaW5mbykgLT5cclxuICAgIEBwZW5kaW5nSW1hZ2VzLS1cclxuICAgIGlmIEBwZW5kaW5nSW1hZ2VzID09IDBcclxuICAgICAgY29uc29sZS5sb2cgJ0FsbCBpbWFnZXMgbG9hZGVkLiBCZWdpbm5pbmcgcmVuZGVyIGxvb3AuJ1xyXG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPT4gQHVwZGF0ZSgpXHJcblxyXG4gIGxvZzogKHMpIC0+XHJcbiAgICBjb25zb2xlLmxvZyBcIk5hdGl2ZUFwcC5sb2coKTogI3tzfVwiXHJcblxyXG4gIHVwZGF0ZVNhdmU6IChkdCkgLT5cclxuICAgIHJldHVybiBpZiB0eXBlb2YgU3RvcmFnZSA9PSBcInVuZGVmaW5lZFwiXHJcbiAgICBAc2F2ZVRpbWVyIC09IGR0XHJcbiAgICBpZiBAc2F2ZVRpbWVyIDw9IDBcclxuICAgICAgQHNhdmVUaW1lciA9IFNBVkVfVElNRVJfTVNcclxuICAgICAgc3RhdGUgPSBAZ2FtZS5zYXZlKClcclxuICAgICAgIyBjb25zb2xlLmxvZyBcInNhdmluZzogI3tzdGF0ZX1cIlxyXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSBcInN0YXRlXCIsIHN0YXRlXHJcblxyXG4gIGdlbmVyYXRlVGludEltYWdlOiAodGV4dHVyZUluZGV4LCByZWQsIGdyZWVuLCBibHVlKSAtPlxyXG4gICAgaW1nID0gQHRleHR1cmVzW3RleHR1cmVJbmRleF1cclxuICAgIGJ1ZmYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50IFwiY2FudmFzXCJcclxuICAgIGJ1ZmYud2lkdGggID0gaW1nLndpZHRoXHJcbiAgICBidWZmLmhlaWdodCA9IGltZy5oZWlnaHRcclxuXHJcbiAgICBjdHggPSBidWZmLmdldENvbnRleHQgXCIyZFwiXHJcbiAgICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2NvcHknXHJcbiAgICBjdHguZHJhd0ltYWdlKGltZywgMCwgMClcclxuICAgIGZpbGxDb2xvciA9IFwicmdiKCN7TWF0aC5mbG9vcihyZWQqMjU1KX0sICN7TWF0aC5mbG9vcihncmVlbioyNTUpfSwgI3tNYXRoLmZsb29yKGJsdWUqMjU1KX0pXCJcclxuICAgIGN0eC5maWxsU3R5bGUgPSBmaWxsQ29sb3JcclxuICAgIGNvbnNvbGUubG9nIFwiZmlsbENvbG9yICN7ZmlsbENvbG9yfVwiXHJcbiAgICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ211bHRpcGx5J1xyXG4gICAgY3R4LmZpbGxSZWN0KDAsIDAsIGJ1ZmYud2lkdGgsIGJ1ZmYuaGVpZ2h0KVxyXG4gICAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdjb3B5J1xyXG4gICAgY3R4Lmdsb2JhbEFscGhhID0gMS4wXHJcbiAgICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2Rlc3RpbmF0aW9uLWluJ1xyXG4gICAgY3R4LmRyYXdJbWFnZShpbWcsIDAsIDApXHJcblxyXG4gICAgaW1nQ29tcCA9IG5ldyBJbWFnZSgpXHJcbiAgICBpbWdDb21wLnNyYyA9IGJ1ZmYudG9EYXRhVVJMKClcclxuICAgIHJldHVybiBpbWdDb21wXHJcblxyXG4gIGRyYXdJbWFnZTogKHRleHR1cmVJbmRleCwgc3JjWCwgc3JjWSwgc3JjVywgc3JjSCwgZHN0WCwgZHN0WSwgZHN0VywgZHN0SCwgcm90LCBhbmNob3JYLCBhbmNob3JZLCByLCBnLCBiLCBhKSAtPlxyXG4gICAgdGV4dHVyZSA9IEB0ZXh0dXJlc1t0ZXh0dXJlSW5kZXhdXHJcbiAgICBpZiAociAhPSAxKSBvciAoZyAhPSAxKSBvciAoYiAhPSAxKVxyXG4gICAgICB0aW50ZWRUZXh0dXJlS2V5ID0gXCIje3RleHR1cmVJbmRleH0tI3tyfS0je2d9LSN7Yn1cIlxyXG4gICAgICB0aW50ZWRUZXh0dXJlID0gQHRpbnRlZFRleHR1cmVDYWNoZVt0aW50ZWRUZXh0dXJlS2V5XVxyXG4gICAgICBpZiBub3QgdGludGVkVGV4dHVyZVxyXG4gICAgICAgIHRpbnRlZFRleHR1cmUgPSBAZ2VuZXJhdGVUaW50SW1hZ2UgdGV4dHVyZUluZGV4LCByLCBnLCBiXHJcbiAgICAgICAgQHRpbnRlZFRleHR1cmVDYWNoZVt0aW50ZWRUZXh0dXJlS2V5XSA9IHRpbnRlZFRleHR1cmVcclxuICAgICAgICAjIGNvbnNvbGUubG9nIFwiZ2VuZXJhdGVkIGNhY2hlZCB0ZXh0dXJlICN7dGludGVkVGV4dHVyZUtleX1cIlxyXG4gICAgICB0ZXh0dXJlID0gdGludGVkVGV4dHVyZVxyXG5cclxuICAgIEBjb250ZXh0LnNhdmUoKVxyXG4gICAgQGNvbnRleHQudHJhbnNsYXRlIGRzdFgsIGRzdFlcclxuICAgIEBjb250ZXh0LnJvdGF0ZSByb3QgIyAqIDMuMTQxNTkyIC8gMTgwLjBcclxuICAgIGFuY2hvck9mZnNldFggPSAtMSAqIGFuY2hvclggKiBkc3RXXHJcbiAgICBhbmNob3JPZmZzZXRZID0gLTEgKiBhbmNob3JZICogZHN0SFxyXG4gICAgQGNvbnRleHQudHJhbnNsYXRlIGFuY2hvck9mZnNldFgsIGFuY2hvck9mZnNldFlcclxuICAgIEBjb250ZXh0Lmdsb2JhbEFscGhhID0gYVxyXG4gICAgQGNvbnRleHQuZHJhd0ltYWdlKHRleHR1cmUsIHNyY1gsIHNyY1ksIHNyY1csIHNyY0gsIDAsIDAsIGRzdFcsIGRzdEgpXHJcbiAgICBAY29udGV4dC5yZXN0b3JlKClcclxuXHJcbiAgdXBkYXRlOiAtPlxyXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0+IEB1cGRhdGUoKVxyXG5cclxuICAgIG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXHJcbiAgICBkdCA9IG5vdyAtIEBsYXN0VGltZVxyXG5cclxuICAgIHRpbWVTaW5jZUludGVyYWN0ID0gbm93IC0gQGxhc3RJbnRlcmFjdFRpbWVcclxuICAgIGlmIHRpbWVTaW5jZUludGVyYWN0ID4gNTAwMFxyXG4gICAgICBnb2FsRlBTID0gNSAjIGNhbG0gZG93biwgbm9ib2R5IGlzIGRvaW5nIGFueXRoaW5nIGZvciA1IHNlY29uZHNcclxuICAgIGVsc2VcclxuICAgICAgZ29hbEZQUyA9IDIwMCAjIGFzIGZhc3QgYXMgcG9zc2libGVcclxuICAgIGlmIEBsYXN0R29hbEZQUyAhPSBnb2FsRlBTXHJcbiAgICAgIGNvbnNvbGUubG9nIFwic3dpdGNoaW5nIHRvICN7Z29hbEZQU30gRlBTXCJcclxuICAgICAgQGxhc3RHb2FsRlBTID0gZ29hbEZQU1xyXG5cclxuICAgIGZwc0ludGVydmFsID0gMTAwMCAvIGdvYWxGUFNcclxuICAgIGlmIGR0IDwgZnBzSW50ZXJ2YWxcclxuICAgICAgcmV0dXJuXHJcbiAgICBAbGFzdFRpbWUgPSBub3dcclxuXHJcbiAgICBAY29udGV4dC5jbGVhclJlY3QoMCwgMCwgQHdpZHRoLCBAaGVpZ2h0KVxyXG4gICAgQGdhbWUudXBkYXRlKGR0KVxyXG4gICAgcmVuZGVyQ29tbWFuZHMgPSBAZ2FtZS5yZW5kZXIoKVxyXG5cclxuICAgIGkgPSAwXHJcbiAgICBuID0gcmVuZGVyQ29tbWFuZHMubGVuZ3RoXHJcbiAgICB3aGlsZSAoaSA8IG4pXHJcbiAgICAgIGRyYXdDYWxsID0gcmVuZGVyQ29tbWFuZHMuc2xpY2UoaSwgaSArPSAxNilcclxuICAgICAgQGRyYXdJbWFnZS5hcHBseSh0aGlzLCBkcmF3Q2FsbClcclxuXHJcbiAgICBAdXBkYXRlU2F2ZShkdClcclxuXHJcbiAgb25Ub3VjaFN0YXJ0OiAoZXZ0KSAtPlxyXG4gICAgQGxhc3RJbnRlcmFjdFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxyXG4gICAgQGhlYXJkT25lVG91Y2ggPSB0cnVlXHJcbiAgICB0b3VjaGVzID0gZXZ0LmNoYW5nZWRUb3VjaGVzXHJcbiAgICBmb3IgdG91Y2ggaW4gdG91Y2hlc1xyXG4gICAgICBpZiBAdG91Y2hNb3VzZSA9PSBudWxsXHJcbiAgICAgICAgQHRvdWNoTW91c2UgPSB0b3VjaC5pZGVudGlmaWVyXHJcbiAgICAgIGlmIEB0b3VjaE1vdXNlID09IHRvdWNoLmlkZW50aWZpZXJcclxuICAgICAgICBAZ2FtZS50b3VjaERvd24odG91Y2guY2xpZW50WCwgdG91Y2guY2xpZW50WSlcclxuXHJcbiAgb25Ub3VjaE1vdmU6IChldnQpIC0+XHJcbiAgICBAbGFzdEludGVyYWN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXHJcbiAgICB0b3VjaGVzID0gZXZ0LmNoYW5nZWRUb3VjaGVzXHJcbiAgICBmb3IgdG91Y2ggaW4gdG91Y2hlc1xyXG4gICAgICBpZiBAdG91Y2hNb3VzZSA9PSB0b3VjaC5pZGVudGlmaWVyXHJcbiAgICAgICAgQGdhbWUudG91Y2hNb3ZlKHRvdWNoLmNsaWVudFgsIHRvdWNoLmNsaWVudFkpXHJcblxyXG4gIG9uVG91Y2hFbmQ6IChldnQpIC0+XHJcbiAgICBAbGFzdEludGVyYWN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXHJcbiAgICB0b3VjaGVzID0gZXZ0LmNoYW5nZWRUb3VjaGVzXHJcbiAgICBmb3IgdG91Y2ggaW4gdG91Y2hlc1xyXG4gICAgICBpZiBAdG91Y2hNb3VzZSA9PSB0b3VjaC5pZGVudGlmaWVyXHJcbiAgICAgICAgQGdhbWUudG91Y2hVcCh0b3VjaC5jbGllbnRYLCB0b3VjaC5jbGllbnRZKVxyXG4gICAgICAgIEB0b3VjaE1vdXNlID0gbnVsbFxyXG4gICAgaWYgZXZ0LnRvdWNoZXMubGVuZ3RoID09IDBcclxuICAgICAgQHRvdWNoTW91c2UgPSBudWxsXHJcblxyXG4gIG9uTW91c2VEb3duOiAoZXZ0KSAtPlxyXG4gICAgaWYgQGhlYXJkT25lVG91Y2hcclxuICAgICAgcmV0dXJuXHJcbiAgICBAbGFzdEludGVyYWN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXHJcbiAgICBAZ2FtZS50b3VjaERvd24oZXZ0LmNsaWVudFgsIGV2dC5jbGllbnRZKVxyXG5cclxuICBvbk1vdXNlTW92ZTogKGV2dCkgLT5cclxuICAgIGlmIEBoZWFyZE9uZVRvdWNoXHJcbiAgICAgIHJldHVyblxyXG4gICAgQGxhc3RJbnRlcmFjdFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxyXG4gICAgQGdhbWUudG91Y2hNb3ZlKGV2dC5jbGllbnRYLCBldnQuY2xpZW50WSlcclxuXHJcbiAgb25Nb3VzZVVwOiAoZXZ0KSAtPlxyXG4gICAgaWYgQGhlYXJkT25lVG91Y2hcclxuICAgICAgcmV0dXJuXHJcbiAgICBAbGFzdEludGVyYWN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXHJcbiAgICBAZ2FtZS50b3VjaFVwKGV2dC5jbGllbnRYLCBldnQuY2xpZW50WSlcclxuXHJcbnNjcmVlbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkICdzY3JlZW4nXHJcbnJlc2l6ZVNjcmVlbiA9IC0+XHJcbiAgZGVzaXJlZEFzcGVjdFJhdGlvID0gMTYgLyA5XHJcbiAgY3VycmVudEFzcGVjdFJhdGlvID0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHRcclxuICBpZiBjdXJyZW50QXNwZWN0UmF0aW8gPCBkZXNpcmVkQXNwZWN0UmF0aW9cclxuICAgIHNjcmVlbi53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXHJcbiAgICBzY3JlZW4uaGVpZ2h0ID0gTWF0aC5mbG9vcih3aW5kb3cuaW5uZXJXaWR0aCAqICgxIC8gZGVzaXJlZEFzcGVjdFJhdGlvKSlcclxuICBlbHNlXHJcbiAgICBzY3JlZW4ud2lkdGggPSBNYXRoLmZsb29yKHdpbmRvdy5pbm5lckhlaWdodCAqIGRlc2lyZWRBc3BlY3RSYXRpbylcclxuICAgIHNjcmVlbi5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHRcclxucmVzaXplU2NyZWVuKClcclxuIyB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAncmVzaXplJywgcmVzaXplU2NyZWVuLCBmYWxzZVxyXG5cclxuYXBwID0gbmV3IE5hdGl2ZUFwcChzY3JlZW4sIHNjcmVlbi53aWR0aCwgc2NyZWVuLmhlaWdodClcclxuIl19
