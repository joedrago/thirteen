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
      play_again: {
        r: 0,
        g: 0,
        b: 0,
        a: 0.7
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
    if (this.thirteen != null) {
      this.thirteen.updatePlayerHand(this.hand.cards);
      state.thirteen = this.thirteen.save();
    }
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

  Game.prototype.prettyErrorTable = {
    gameOver: "The game is over.",
    invalidPlay: "Not a valid play.",
    mustBreakOrPass: "You passed already, so 2-breaker or pass.",
    mustPass: "You must pass.",
    mustThrow3S: "You must use the 3\xc8 in your play.",
    notYourTurn: "It is not your turn.",
    throwAnything: "You have control, throw anything.",
    tooLowPlay: "This play is not stronger than the current play.",
    wrongPlay: "This play does not match the current play."
  };

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
      errText = "  `ffffff`ERROR: `ff0000`" + (this.prettyError());
      headline += errText;
    }
    return headline;
  };

  Game.prototype.gameOverText = function() {
    var winner;
    winner = this.thirteen.winner();
    if (winner.name === "Player") {
      return ["You win!", this.thirteen.lastStreak + " in a row"];
    }
    return [winner.name + " wins!", this.thirteen.lastStreak + " in a row"];
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
      this.spriteRenderer.render("solid", 0, this.height, this.width, handAreaHeight, 0, 0, 1, this.colors.play_again, (function(_this) {
        return function() {
          _this.thirteen.deal();
          return _this.prepareGame();
        };
      })(this));
      restartQuitSize = this.aaHeight / 12;
      shadowDistance = restartQuitSize / 8;
      this.fontRenderer.render(this.font, restartQuitSize, "Play Again", shadowDistance + this.center.x, shadowDistance + (this.height - (handAreaHeight * 0.5)), 0.5, 1, this.colors.black, (function(_this) {
        return function() {};
      })(this));
      this.fontRenderer.render(this.font, restartQuitSize, "Play Again", this.center.x, this.height - (handAreaHeight * 0.5), 0.5, 1, this.colors.gold);
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
var Card, GlyphSuitName, MAX_LOG_LINES, MIN_PLAYERS, OK, ShortSuitName, ShuffledDeck, Suit, SuitName, Thirteen, aiCharacterList, aiCharacters, cardsToString, character, debug, l, len, playToString, playTypeToString, randomCharacter;

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

GlyphSuitName = ["\xc8", "\xc9", "\xca", "\xcb"];

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

  Card.prototype.glyphedName = function() {
    return this.valueName + GlyphSuitName[this.suit];
  };

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
  if (matches = type.match(/^rop(\d+)/)) {
    return "Run of " + matches[1] + " Pairs";
  }
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

playToString = function(play) {
  var highCard;
  highCard = new Card(play.high);
  return (playTypeToString(play.type)) + " - " + (highCard.glyphedName());
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
      this.streak = 0;
      this.lastStreak = 0;
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
    names = "log players turn pile pileWho throwID currentPlay streak lastStreak".split(" ");
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
    if (this.pile.length === 0) {
      playString = "throw Anything with the 3\xc8";
    } else {
      if (this.currentPlay) {
        playString = "beat " + playToString(this.currentPlay);
      } else {
        playString = "throw Anything";
      }
    }
    currentPlayer = this.currentPlayer();
    headline = currentPlayer.name + " to " + playString;
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

  Thirteen.prototype.handHas3S = function(hand) {
    var len1, m, raw;
    for (m = 0, len1 = hand.length; m < len1; m++) {
      raw = hand[m];
      if (raw === 0) {
        return true;
      }
    }
    return false;
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
    if (this.pile.length === 0) {
      return 'mustThrow3S';
    }
    if (this.everyonePassed()) {
      return 'throwAnything';
    }
    return OK;
  };

  Thirteen.prototype.canPlay = function(params, incomingPlay, handHas3S) {
    var currentPlayer;
    if (this.winner() !== null) {
      return 'gameOver';
    }
    currentPlayer = this.currentPlayer();
    if (params.id !== currentPlayer.id) {
      return 'notYourTurn';
    }
    if (incomingPlay === null) {
      return 'invalidPlay';
    }
    if (this.pile.length === 0) {
      if (!handHas3S) {
        return 'mustThrow3S';
      }
    }
    currentPlayer = this.currentPlayer();
    if (currentPlayer.pass) {
      if (this.currentPlay && this.canBeBroken(this.currentPlay)) {
        if (this.isBreakerType(incomingPlay.type)) {
          return OK;
        } else {
          return 'mustBreakOrPass';
        }
      }
      return 'mustPass';
    }
    if (this.currentPlay === null) {
      return OK;
    }
    if (this.everyonePassed()) {
      return OK;
    }
    if (this.canBeBroken(this.currentPlay) && this.isBreakerType(incomingPlay.type)) {
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
    ret = this.canPlay(params, incomingPlay, this.handHas3S(params.cards));
    if (ret !== OK) {
      return ret;
    }
    verb = "throws:";
    if (this.currentPlay) {
      if (this.canBeBroken(this.currentPlay) && this.isBreakerType(incomingPlay.type)) {
        this.unpassAll();
        verb = "breaks 2:";
      } else if ((incomingPlay.type !== this.currentPlay.type) || (incomingPlay.high < this.currentPlay.high)) {
        this.unpassAll();
        verb = "throws new:";
      }
    } else {
      verb = "begins:";
    }
    this.currentPlay = incomingPlay;
    this.throwID += 1;
    currentPlayer = this.currentPlayer();
    currentPlayer.hand = this.removeCards(currentPlayer.hand, params.cards);
    this.output(currentPlayer.name + " " + verb + " " + (playToString(incomingPlay)));
    if (currentPlayer.hand.length === 0) {
      this.output(currentPlayer.name + " wins!");
      if (currentPlayer.ai) {
        this.lastStreak = this.streak;
        this.streak = 0;
      } else {
        this.streak += 1;
        this.lastStreak = this.streak;
      }
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
      if (this.currentPlay && (this.currentPlay.type === 'kind1') && this.hasBreaker(currentPlayer.hand)) {

      } else if (currentPlayer.pass) {
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
    var len1, m, nonTwoSingles, raw, ref;
    if (plays.kind1 == null) {
      return 0;
    }
    nonTwoSingles = 0;
    ref = plays.kind1;
    for (m = 0, len1 = ref.length; m < len1; m++) {
      raw = ref[m];
      if (raw < 48) {
        nonTwoSingles += 1;
      }
    }
    return nonTwoSingles;
  };

  Thirteen.prototype.breakerPlays = function(hand) {
    return this.aiCalcPlays(hand, {
      seesRops: true,
      prefersRuns: false
    });
  };

  Thirteen.prototype.isBreakerType = function(playType) {
    if (playType.match(/^rop/) || playType === 'kind4') {
      return true;
    }
    return false;
  };

  Thirteen.prototype.canBeBroken = function(play) {
    var card;
    if (play.type !== 'kind1') {
      return false;
    }
    card = new Card(play.high);
    return card.value === 12;
  };

  Thirteen.prototype.hasBreaker = function(hand) {
    var playType, playlist, plays;
    plays = this.breakerPlays(hand);
    for (playType in plays) {
      playlist = plays[playType];
      if (this.isBreakerType(playType)) {
        if (playlist.length > 0) {
          return true;
        }
      }
    }
    return false;
  };

  Thirteen.prototype.aiCalcBestPlays = function(hand) {
    var bestPlays, bits, m, nbp, np, plays, strategy;
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
        np = this.numberOfSingles(plays);
        nbp = this.numberOfSingles(bestPlays);
        if (np < nbp) {
          bestPlays = plays;
        } else if (np === nbp) {
          if (Math.floor(Math.random() * 2) === 0) {
            bestPlays = plays;
          }
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

  Thirteen.prototype.findPlayWith3S = function(plays) {
    var len1, m, play, playType, playlist;
    for (playType in plays) {
      playlist = plays[playType];
      for (m = 0, len1 = playlist.length; m < len1; m++) {
        play = playlist[m];
        if (this.handHas3S(play)) {
          return play;
        }
      }
    }
    console.log("findPlayWith3S: something impossible is happening");
    return [];
  };

  Thirteen.prototype.brains = {
    normal: {
      id: "normal",
      name: "Normal",
      play: function(currentPlayer, currentPlay, everyonePassed) {
        var breakerPlays, len1, len2, m, n, play, playType, playTypeIndex, playTypes, playlist, plays, rawCard, ref, ref1;
        if (currentPlayer.pass) {
          if (this.canBeBroken(currentPlay) && this.hasBreaker(currentPlayer.hand)) {
            breakerPlays = this.breakerPlays(currentPlayer.hand);
            for (playType in breakerPlays) {
              playlist = breakerPlays[playType];
              if ((playType.match(/^rop/) || (playType === 'kind4')) && (playlist.length > 0)) {
                this.aiLog("breaking 2");
                if (this.aiPlay(currentPlayer, playlist[0]) === OK) {
                  return OK;
                }
              }
            }
          }
          this.aiLog("already passed, going to keep passing");
          return this.aiPass(currentPlayer);
        }
        plays = this.aiCalcBestPlays(currentPlayer.hand);
        this.aiLog("best plays: " + (this.prettyPlays(plays)));
        if (this.pile.length === 0) {
          play = this.findPlayWith3S(plays);
          this.aiLog("Throwing my play with the 3S in it");
          if (this.aiPlay(currentPlayer, play) === OK) {
            return OK;
          }
        }
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
      },
      '200': {
        x: 396,
        y: 378,
        width: 40,
        height: 49,
        xoffset: 3,
        yoffset: 21,
        xadvance: 43
      },
      '201': {
        x: 447,
        y: 313,
        width: 49,
        height: 50,
        xoffset: 3,
        yoffset: 21,
        xadvance: 52
      },
      '202': {
        x: 399,
        y: 313,
        width: 36,
        height: 53,
        xoffset: 3,
        yoffset: 21,
        xadvance: 39
      },
      '203': {
        x: 452,
        y: 381,
        width: 39,
        height: 43,
        xoffset: 3,
        yoffset: 21,
        xadvance: 42
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQW5pbWF0aW9uLmNvZmZlZSIsInNyYy9CdXR0b24uY29mZmVlIiwic3JjL0ZvbnRSZW5kZXJlci5jb2ZmZWUiLCJzcmMvR2FtZS5jb2ZmZWUiLCJzcmMvSGFuZC5jb2ZmZWUiLCJzcmMvTWVudS5jb2ZmZWUiLCJzcmMvUGlsZS5jb2ZmZWUiLCJzcmMvU3ByaXRlUmVuZGVyZXIuY29mZmVlIiwic3JjL1RoaXJ0ZWVuLmNvZmZlZSIsInNyYy9mb250bWV0cmljcy5jb2ZmZWUiLCJzcmMvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBOztBQUFBLFFBQUEsR0FBVyxTQUFDLENBQUQ7RUFDVCxJQUFHLENBQUEsS0FBSyxDQUFSO0FBQ0UsV0FBTyxFQURUO0dBQUEsTUFFSyxJQUFHLENBQUEsR0FBSSxDQUFQO0FBQ0gsV0FBTyxDQUFDLEVBREw7O0FBRUwsU0FBTztBQUxFOztBQU9MO0VBQ1MsbUJBQUMsSUFBRDtBQUNYLFFBQUE7SUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksQ0FBQztJQUNkLElBQUMsQ0FBQSxHQUFELEdBQU87SUFDUCxJQUFDLENBQUEsR0FBRCxHQUFPO0FBQ1AsU0FBQSxTQUFBOztNQUNFLElBQUcsQ0FBQSxLQUFLLE9BQVI7UUFDRSxJQUFDLENBQUEsR0FBSSxDQUFBLENBQUEsQ0FBTCxHQUFVO1FBQ1YsSUFBQyxDQUFBLEdBQUksQ0FBQSxDQUFBLENBQUwsR0FBVSxFQUZaOztBQURGO0VBSlc7O3NCQVViLElBQUEsR0FBTSxTQUFBO0lBQ0osSUFBRyxrQkFBSDtNQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBTCxHQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFEaEI7O0lBRUEsSUFBRyxrQkFBSDtNQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBTCxHQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFEaEI7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QSxHQUFLO0VBQzFCLGtCQUFBLEdBQXFCLE1BQU0sQ0FBQyxVQUFQLEdBQW9CLE1BQU0sQ0FBQztFQUNoRCxJQUFHLGtCQUFBLEdBQXFCLGtCQUF4QjtJQUNFLE1BQU0sQ0FBQyxLQUFQLEdBQWUsTUFBTSxDQUFDO1dBQ3RCLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLElBQUksQ0FBQyxLQUFMLENBQVcsTUFBTSxDQUFDLFVBQVAsR0FBb0IsQ0FBQyxDQUFBLEdBQUksa0JBQUwsQ0FBL0IsRUFGbEI7R0FBQSxNQUFBO0lBSUUsTUFBTSxDQUFDLEtBQVAsR0FBZSxJQUFJLENBQUMsS0FBTCxDQUFXLE1BQU0sQ0FBQyxXQUFQLEdBQXFCLGtCQUFoQztXQUNmLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLE1BQU0sQ0FBQyxZQUx6Qjs7QUFIYTs7QUFTZixZQUFBLENBQUE7O0FBR0EsR0FBQSxHQUFNLElBQUksU0FBSixDQUFjLE1BQWQsRUFBc0IsTUFBTSxDQUFDLEtBQTdCLEVBQW9DLE1BQU0sQ0FBQyxNQUEzQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNhbGNTaWduID0gKHYpIC0+XG4gIGlmIHYgPT0gMFxuICAgIHJldHVybiAwXG4gIGVsc2UgaWYgdiA8IDBcbiAgICByZXR1cm4gLTFcbiAgcmV0dXJuIDFcblxuY2xhc3MgQW5pbWF0aW9uXG4gIGNvbnN0cnVjdG9yOiAoZGF0YSkgLT5cbiAgICBAc3BlZWQgPSBkYXRhLnNwZWVkXG4gICAgQHJlcSA9IHt9XG4gICAgQGN1ciA9IHt9XG4gICAgZm9yIGssdiBvZiBkYXRhXG4gICAgICBpZiBrICE9ICdzcGVlZCdcbiAgICAgICAgQHJlcVtrXSA9IHZcbiAgICAgICAgQGN1cltrXSA9IHZcblxuICAjICdmaW5pc2hlcycgYWxsIGFuaW1hdGlvbnNcbiAgd2FycDogLT5cbiAgICBpZiBAY3VyLnI/XG4gICAgICBAY3VyLnIgPSBAcmVxLnJcbiAgICBpZiBAY3VyLnM/XG4gICAgICBAY3VyLnMgPSBAcmVxLnNcbiAgICBpZiBAY3VyLng/IGFuZCBAY3VyLnk/XG4gICAgICBAY3VyLnggPSBAcmVxLnhcbiAgICAgIEBjdXIueSA9IEByZXEueVxuXG4gIGFuaW1hdGluZzogLT5cbiAgICBpZiBAY3VyLnI/XG4gICAgICBpZiBAcmVxLnIgIT0gQGN1ci5yXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgaWYgQGN1ci5zP1xuICAgICAgaWYgQHJlcS5zICE9IEBjdXIuc1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIGlmIEBjdXIueD8gYW5kIEBjdXIueT9cbiAgICAgIGlmIChAcmVxLnggIT0gQGN1ci54KSBvciAoQHJlcS55ICE9IEBjdXIueSlcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICByZXR1cm4gZmFsc2VcblxuICB1cGRhdGU6IChkdCkgLT5cbiAgICB1cGRhdGVkID0gZmFsc2VcbiAgICAjIHJvdGF0aW9uXG4gICAgaWYgQGN1ci5yP1xuICAgICAgaWYgQHJlcS5yICE9IEBjdXIuclxuICAgICAgICB1cGRhdGVkID0gdHJ1ZVxuICAgICAgICAjIHNhbml0aXplIHJlcXVlc3RlZCByb3RhdGlvblxuICAgICAgICB0d29QaSA9IE1hdGguUEkgKiAyXG4gICAgICAgIG5lZ1R3b1BpID0gLTEgKiB0d29QaVxuICAgICAgICBAcmVxLnIgLT0gdHdvUGkgd2hpbGUgQHJlcS5yID49IHR3b1BpXG4gICAgICAgIEByZXEuciArPSB0d29QaSB3aGlsZSBAcmVxLnIgPD0gbmVnVHdvUGlcbiAgICAgICAgIyBwaWNrIGEgZGlyZWN0aW9uIGFuZCB0dXJuXG4gICAgICAgIGRyID0gQHJlcS5yIC0gQGN1ci5yXG4gICAgICAgIGRpc3QgPSBNYXRoLmFicyhkcilcbiAgICAgICAgc2lnbiA9IGNhbGNTaWduKGRyKVxuICAgICAgICBpZiBkaXN0ID4gTWF0aC5QSVxuICAgICAgICAgICMgc3BpbiB0aGUgb3RoZXIgZGlyZWN0aW9uLCBpdCBpcyBjbG9zZXJcbiAgICAgICAgICBkaXN0ID0gdHdvUGkgLSBkaXN0XG4gICAgICAgICAgc2lnbiAqPSAtMVxuICAgICAgICBtYXhEaXN0ID0gZHQgKiBAc3BlZWQuciAvIDEwMDBcbiAgICAgICAgaWYgZGlzdCA8IG1heERpc3RcbiAgICAgICAgICAjIHdlIGNhbiBmaW5pc2ggdGhpcyBmcmFtZVxuICAgICAgICAgIEBjdXIuciA9IEByZXEuclxuICAgICAgICBlbHNlXG4gICAgICAgICAgQGN1ci5yICs9IG1heERpc3QgKiBzaWduXG5cbiAgICAjIHNjYWxlXG4gICAgaWYgQGN1ci5zP1xuICAgICAgaWYgQHJlcS5zICE9IEBjdXIuc1xuICAgICAgICB1cGRhdGVkID0gdHJ1ZVxuICAgICAgICAjIHBpY2sgYSBkaXJlY3Rpb24gYW5kIHR1cm5cbiAgICAgICAgZHMgPSBAcmVxLnMgLSBAY3VyLnNcbiAgICAgICAgZGlzdCA9IE1hdGguYWJzKGRzKVxuICAgICAgICBzaWduID0gY2FsY1NpZ24oZHMpXG4gICAgICAgIG1heERpc3QgPSBkdCAqIEBzcGVlZC5zIC8gMTAwMFxuICAgICAgICBpZiBkaXN0IDwgbWF4RGlzdFxuICAgICAgICAgICMgd2UgY2FuIGZpbmlzaCB0aGlzIGZyYW1lXG4gICAgICAgICAgQGN1ci5zID0gQHJlcS5zXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAY3VyLnMgKz0gbWF4RGlzdCAqIHNpZ25cblxuICAgICMgdHJhbnNsYXRpb25cbiAgICBpZiBAY3VyLng/IGFuZCBAY3VyLnk/XG4gICAgICBpZiAoQHJlcS54ICE9IEBjdXIueCkgb3IgKEByZXEueSAhPSBAY3VyLnkpXG4gICAgICAgIHVwZGF0ZWQgPSB0cnVlXG4gICAgICAgIHZlY1ggPSBAcmVxLnggLSBAY3VyLnhcbiAgICAgICAgdmVjWSA9IEByZXEueSAtIEBjdXIueVxuICAgICAgICBkaXN0ID0gTWF0aC5zcXJ0KCh2ZWNYICogdmVjWCkgKyAodmVjWSAqIHZlY1kpKVxuICAgICAgICBtYXhEaXN0ID0gZHQgKiBAc3BlZWQudCAvIDEwMDBcbiAgICAgICAgaWYgZGlzdCA8IG1heERpc3RcbiAgICAgICAgICAjIHdlIGNhbiBmaW5pc2ggdGhpcyBmcmFtZVxuICAgICAgICAgIEBjdXIueCA9IEByZXEueFxuICAgICAgICAgIEBjdXIueSA9IEByZXEueVxuICAgICAgICBlbHNlXG4gICAgICAgICAgIyBtb3ZlIGFzIG11Y2ggYXMgcG9zc2libGVcbiAgICAgICAgICBAY3VyLnggKz0gKHZlY1ggLyBkaXN0KSAqIG1heERpc3RcbiAgICAgICAgICBAY3VyLnkgKz0gKHZlY1kgLyBkaXN0KSAqIG1heERpc3RcblxuICAgIHJldHVybiB1cGRhdGVkXG5cbm1vZHVsZS5leHBvcnRzID0gQW5pbWF0aW9uXG4iLCJBbmltYXRpb24gPSByZXF1aXJlICcuL0FuaW1hdGlvbidcblxuY2xhc3MgQnV0dG9uXG4gIGNvbnN0cnVjdG9yOiAoQGdhbWUsIEBzcHJpdGVOYW1lcywgQGZvbnQsIEB0ZXh0SGVpZ2h0LCBAeCwgQHksIEBjYikgLT5cbiAgICBAYW5pbSA9IG5ldyBBbmltYXRpb24ge1xuICAgICAgc3BlZWQ6IHsgczogMyB9XG4gICAgICBzOiAwXG4gICAgfVxuICAgIEBjb2xvciA9IHsgcjogMSwgZzogMSwgYjogMSwgYTogMCB9XG5cbiAgdXBkYXRlOiAoZHQpIC0+XG4gICAgcmV0dXJuIEBhbmltLnVwZGF0ZShkdClcblxuICByZW5kZXI6IC0+XG4gICAgQGNvbG9yLmEgPSBAYW5pbS5jdXIuc1xuICAgIEBnYW1lLnNwcml0ZVJlbmRlcmVyLnJlbmRlciBAc3ByaXRlTmFtZXNbMF0sIEB4LCBAeSwgMCwgQHRleHRIZWlnaHQgKiAxLjUsIDAsIDAuNSwgMC41LCBAZ2FtZS5jb2xvcnMud2hpdGUsID0+XG4gICAgICAjIHB1bHNlIGJ1dHRvbiBhbmltLFxuICAgICAgQGFuaW0uY3VyLnMgPSAxXG4gICAgICBAYW5pbS5yZXEucyA9IDBcbiAgICAgICMgdGhlbiBjYWxsIGNhbGxiYWNrXG4gICAgICBAY2IodHJ1ZSlcbiAgICBAZ2FtZS5zcHJpdGVSZW5kZXJlci5yZW5kZXIgQHNwcml0ZU5hbWVzWzFdLCBAeCwgQHksIDAsIEB0ZXh0SGVpZ2h0ICogMS41LCAwLCAwLjUsIDAuNSwgQGNvbG9yXG4gICAgdGV4dCA9IEBjYihmYWxzZSlcbiAgICBAZ2FtZS5mb250UmVuZGVyZXIucmVuZGVyIEBmb250LCBAdGV4dEhlaWdodCwgdGV4dCwgQHgsIEB5LCAwLjUsIDAuNSwgQGdhbWUuY29sb3JzLmJ1dHRvbnRleHRcblxubW9kdWxlLmV4cG9ydHMgPSBCdXR0b25cbiIsImZvbnRtZXRyaWNzID0gcmVxdWlyZSAnLi9mb250bWV0cmljcydcblxuIyB0YWtlbiBmcm9tIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNTYyMzgzOC9yZ2ItdG8taGV4LWFuZC1oZXgtdG8tcmdiXG5oZXhUb1JnYiA9IChoZXgsIGEpIC0+XG4gICAgcmVzdWx0ID0gL14jPyhbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KSQvaS5leGVjKGhleClcbiAgICByZXR1cm4gbnVsbCBpZiBub3QgcmVzdWx0XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcjogcGFyc2VJbnQocmVzdWx0WzFdLCAxNikgLyAyNTUsXG4gICAgICAgIGc6IHBhcnNlSW50KHJlc3VsdFsyXSwgMTYpIC8gMjU1LFxuICAgICAgICBiOiBwYXJzZUludChyZXN1bHRbM10sIDE2KSAvIDI1NVxuICAgICAgICBhOiBhXG4gICAgfVxuXG5jbGFzcyBGb250UmVuZGVyZXJcbiAgY29uc3RydWN0b3I6ICAoQGdhbWUpIC0+XG4gICAgQHdoaXRlID0geyByOiAxLCBnOiAxLCBiOiAxLCBhOiAxIH1cblxuICBzaXplOiAoZm9udCwgaGVpZ2h0LCBzdHIpIC0+XG4gICAgbWV0cmljcyA9IGZvbnRtZXRyaWNzW2ZvbnRdXG4gICAgcmV0dXJuIGlmIG5vdCBtZXRyaWNzXG4gICAgc2NhbGUgPSBoZWlnaHQgLyBtZXRyaWNzLmhlaWdodFxuXG4gICAgdG90YWxXaWR0aCA9IDBcbiAgICB0b3RhbEhlaWdodCA9IG1ldHJpY3MuaGVpZ2h0ICogc2NhbGVcblxuICAgIGluQ29sb3IgPSBmYWxzZVxuICAgIGZvciBjaCwgaSBpbiBzdHJcbiAgICAgIGlmIGNoID09ICdgJ1xuICAgICAgICBpbkNvbG9yID0gIWluQ29sb3JcblxuICAgICAgaWYgbm90IGluQ29sb3JcbiAgICAgICAgY29kZSA9IGNoLmNoYXJDb2RlQXQoMClcbiAgICAgICAgZ2x5cGggPSBtZXRyaWNzLmdseXBoc1tjb2RlXVxuICAgICAgICBjb250aW51ZSBpZiBub3QgZ2x5cGhcbiAgICAgICAgdG90YWxXaWR0aCArPSBnbHlwaC54YWR2YW5jZSAqIHNjYWxlXG5cbiAgICByZXR1cm4ge1xuICAgICAgdzogdG90YWxXaWR0aFxuICAgICAgaDogdG90YWxIZWlnaHRcbiAgICB9XG5cbiAgcmVuZGVyOiAoZm9udCwgaGVpZ2h0LCBzdHIsIHgsIHksIGFuY2hvcngsIGFuY2hvcnksIGNvbG9yLCBjYikgLT5cbiAgICBtZXRyaWNzID0gZm9udG1ldHJpY3NbZm9udF1cbiAgICByZXR1cm4gaWYgbm90IG1ldHJpY3NcbiAgICBzY2FsZSA9IGhlaWdodCAvIG1ldHJpY3MuaGVpZ2h0XG5cbiAgICB0b3RhbFdpZHRoID0gMFxuICAgIHRvdGFsSGVpZ2h0ID0gbWV0cmljcy5oZWlnaHQgKiBzY2FsZVxuICAgIHNraXBDb2xvciA9IGZhbHNlXG4gICAgZm9yIGNoLCBpIGluIHN0clxuICAgICAgaWYgY2ggPT0gJ2AnXG4gICAgICAgIHNraXBDb2xvciA9ICFza2lwQ29sb3JcbiAgICAgIGNvbnRpbnVlIGlmIHNraXBDb2xvclxuICAgICAgY29kZSA9IGNoLmNoYXJDb2RlQXQoMClcbiAgICAgIGdseXBoID0gbWV0cmljcy5nbHlwaHNbY29kZV1cbiAgICAgIGNvbnRpbnVlIGlmIG5vdCBnbHlwaFxuICAgICAgdG90YWxXaWR0aCArPSBnbHlwaC54YWR2YW5jZSAqIHNjYWxlXG5cbiAgICBhbmNob3JPZmZzZXRYID0gLTEgKiBhbmNob3J4ICogdG90YWxXaWR0aFxuICAgIGFuY2hvck9mZnNldFkgPSAtMSAqIGFuY2hvcnkgKiB0b3RhbEhlaWdodFxuICAgIGN1cnJYID0geFxuXG4gICAgaWYgY29sb3JcbiAgICAgIHN0YXJ0aW5nQ29sb3IgPSBjb2xvclxuICAgIGVsc2VcbiAgICAgIHN0YXJ0aW5nQ29sb3IgPSBAd2hpdGVcbiAgICBjdXJyZW50Q29sb3IgPSBzdGFydGluZ0NvbG9yXG5cbiAgICBjb2xvclN0YXJ0ID0gLTFcbiAgICBmb3IgY2gsIGkgaW4gc3RyXG4gICAgICBpZiBjaCA9PSAnYCdcbiAgICAgICAgaWYgY29sb3JTdGFydCA9PSAtMVxuICAgICAgICAgIGNvbG9yU3RhcnQgPSBpICsgMVxuICAgICAgICBlbHNlXG4gICAgICAgICAgbGVuID0gaSAtIGNvbG9yU3RhcnRcbiAgICAgICAgICBpZiBsZW5cbiAgICAgICAgICAgIGN1cnJlbnRDb2xvciA9IGhleFRvUmdiKHN0ci5zdWJzdHIoY29sb3JTdGFydCwgaSAtIGNvbG9yU3RhcnQpLCBzdGFydGluZ0NvbG9yLmEpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgY3VycmVudENvbG9yID0gc3RhcnRpbmdDb2xvclxuICAgICAgICAgIGNvbG9yU3RhcnQgPSAtMVxuXG4gICAgICBjb250aW51ZSBpZiBjb2xvclN0YXJ0ICE9IC0xXG4gICAgICBjb2RlID0gY2guY2hhckNvZGVBdCgwKVxuICAgICAgZ2x5cGggPSBtZXRyaWNzLmdseXBoc1tjb2RlXVxuICAgICAgY29udGludWUgaWYgbm90IGdseXBoXG4gICAgICBAZ2FtZS5kcmF3SW1hZ2UgZm9udCxcbiAgICAgIGdseXBoLngsIGdseXBoLnksIGdseXBoLndpZHRoLCBnbHlwaC5oZWlnaHQsXG4gICAgICBjdXJyWCArIChnbHlwaC54b2Zmc2V0ICogc2NhbGUpICsgYW5jaG9yT2Zmc2V0WCwgeSArIChnbHlwaC55b2Zmc2V0ICogc2NhbGUpICsgYW5jaG9yT2Zmc2V0WSwgZ2x5cGgud2lkdGggKiBzY2FsZSwgZ2x5cGguaGVpZ2h0ICogc2NhbGUsXG4gICAgICAwLCAwLCAwLFxuICAgICAgY3VycmVudENvbG9yLnIsIGN1cnJlbnRDb2xvci5nLCBjdXJyZW50Q29sb3IuYiwgY3VycmVudENvbG9yLmEsIGNiXG4gICAgICBjdXJyWCArPSBnbHlwaC54YWR2YW5jZSAqIHNjYWxlXG5cbm1vZHVsZS5leHBvcnRzID0gRm9udFJlbmRlcmVyXG4iLCJBbmltYXRpb24gPSByZXF1aXJlICcuL0FuaW1hdGlvbidcbkJ1dHRvbiA9IHJlcXVpcmUgJy4vQnV0dG9uJ1xuRm9udFJlbmRlcmVyID0gcmVxdWlyZSAnLi9Gb250UmVuZGVyZXInXG5TcHJpdGVSZW5kZXJlciA9IHJlcXVpcmUgJy4vU3ByaXRlUmVuZGVyZXInXG5NZW51ID0gcmVxdWlyZSAnLi9NZW51J1xuSGFuZCA9IHJlcXVpcmUgJy4vSGFuZCdcblBpbGUgPSByZXF1aXJlICcuL1BpbGUnXG57VGhpcnRlZW4sIE9LLCBhaUNoYXJhY3RlcnN9ID0gcmVxdWlyZSAnLi9UaGlydGVlbidcblxuIyB0ZW1wXG5CVUlMRF9USU1FU1RBTVAgPSBcIjAuMC4xXCJcblxuY2xhc3MgR2FtZVxuICBjb25zdHJ1Y3RvcjogKEBuYXRpdmUsIEB3aWR0aCwgQGhlaWdodCkgLT5cbiAgICBAdmVyc2lvbiA9IEJVSUxEX1RJTUVTVEFNUFxuICAgIEBsb2coXCJHYW1lIGNvbnN0cnVjdGVkOiAje0B3aWR0aH14I3tAaGVpZ2h0fVwiKVxuICAgIEBmb250UmVuZGVyZXIgPSBuZXcgRm9udFJlbmRlcmVyIHRoaXNcbiAgICBAc3ByaXRlUmVuZGVyZXIgPSBuZXcgU3ByaXRlUmVuZGVyZXIgdGhpc1xuICAgIEBmb250ID0gXCJkYXJrZm9yZXN0XCJcbiAgICBAem9uZXMgPSBbXVxuICAgIEBuZXh0QUlUaWNrID0gMTAwMCAjIHdpbGwgYmUgc2V0IGJ5IG9wdGlvbnNcbiAgICBAY2VudGVyID1cbiAgICAgIHg6IEB3aWR0aCAvIDJcbiAgICAgIHk6IEBoZWlnaHQgLyAyXG4gICAgQGFhSGVpZ2h0ID0gQHdpZHRoICogOSAvIDE2XG4gICAgQGxvZyBcImhlaWdodDogI3tAaGVpZ2h0fS4gaGVpZ2h0IGlmIHNjcmVlbiB3YXMgMTY6OSAoYXNwZWN0IGFkanVzdGVkKTogI3tAYWFIZWlnaHR9XCJcbiAgICBAcGF1c2VCdXR0b25TaXplID0gQGFhSGVpZ2h0IC8gMTVcbiAgICBAY29sb3JzID1cbiAgICAgIHdoaXRlOiAgICAgIHsgcjogICAxLCBnOiAgIDEsIGI6ICAgMSwgYTogICAxIH1cbiAgICAgIGJsYWNrOiAgICAgIHsgcjogICAwLCBnOiAgIDAsIGI6ICAgMCwgYTogICAxIH1cbiAgICAgIHJlZDogICAgICAgIHsgcjogICAxLCBnOiAgIDAsIGI6ICAgMCwgYTogICAxIH1cbiAgICAgIG9yYW5nZTogICAgIHsgcjogICAxLCBnOiAwLjUsIGI6ICAgMCwgYTogICAxIH1cbiAgICAgIGdvbGQ6ICAgICAgIHsgcjogICAxLCBnOiAgIDEsIGI6ICAgMCwgYTogICAxIH1cbiAgICAgIGJ1dHRvbnRleHQ6IHsgcjogICAxLCBnOiAgIDEsIGI6ICAgMSwgYTogICAxIH1cbiAgICAgIGxpZ2h0Z3JheTogIHsgcjogMC41LCBnOiAwLjUsIGI6IDAuNSwgYTogICAxIH1cbiAgICAgIGJhY2tncm91bmQ6IHsgcjogICAwLCBnOiAwLjIsIGI6ICAgMCwgYTogICAxIH1cbiAgICAgIHBpbGU6ICAgICAgIHsgcjogMC40LCBnOiAwLjIsIGI6ICAgMCwgYTogICAxIH1cbiAgICAgIGxvZ2JnOiAgICAgIHsgcjogMC4xLCBnOiAgIDAsIGI6ICAgMCwgYTogICAxIH1cbiAgICAgIGFycm93OiAgICAgIHsgcjogICAxLCBnOiAgIDEsIGI6ICAgMSwgYTogICAxIH1cbiAgICAgIGFycm93Y2xvc2U6IHsgcjogICAxLCBnOiAwLjUsIGI6ICAgMCwgYTogMC4zIH1cbiAgICAgIGhhbmRfcGljazogIHsgcjogICAwLCBnOiAwLjEsIGI6ICAgMCwgYTogMS4wIH1cbiAgICAgIGhhbmRfcmVvcmc6IHsgcjogMC40LCBnOiAgIDAsIGI6ICAgMCwgYTogMS4wIH1cbiAgICAgIHBsYXlfYWdhaW46IHsgcjogICAwLCBnOiAgIDAsIGI6ICAgMCwgYTogMC43IH1cbiAgICAgIG92ZXJsYXk6ICAgIHsgcjogICAwLCBnOiAgIDAsIGI6ICAgMCwgYTogMC42IH1cbiAgICAgIG1haW5tZW51OiAgIHsgcjogMC4xLCBnOiAwLjEsIGI6IDAuMSwgYTogICAxIH1cbiAgICAgIHBhdXNlbWVudTogIHsgcjogMC4xLCBnOiAwLjAsIGI6IDAuMSwgYTogICAxIH1cbiAgICAgIGJpZDogICAgICAgIHsgcjogICAwLCBnOiAwLjYsIGI6ICAgMCwgYTogICAxIH1cblxuICAgIEB0ZXh0dXJlcyA9XG4gICAgICBcImNhcmRzXCI6IDBcbiAgICAgIFwiZGFya2ZvcmVzdFwiOiAxXG4gICAgICBcImNoYXJzXCI6IDJcbiAgICAgIFwiaG93dG8xXCI6IDNcbiAgICAgIFwiaG93dG8yXCI6IDRcbiAgICAgIFwiaG93dG8zXCI6IDVcblxuICAgIEB0aGlydGVlbiA9IG51bGxcbiAgICBAbGFzdEVyciA9ICcnXG4gICAgQHBhdXNlZCA9IGZhbHNlXG4gICAgQGhvd3RvID0gMFxuICAgIEByZW5kZXJDb21tYW5kcyA9IFtdXG5cbiAgICBAb3B0aW9uTWVudXMgPVxuICAgICAgc3BlZWRzOiBbXG4gICAgICAgIHsgdGV4dDogXCJBSSBTcGVlZDogU2xvd1wiLCBzcGVlZDogMjAwMCB9XG4gICAgICAgIHsgdGV4dDogXCJBSSBTcGVlZDogTWVkaXVtXCIsIHNwZWVkOiAxMDAwIH1cbiAgICAgICAgeyB0ZXh0OiBcIkFJIFNwZWVkOiBGYXN0XCIsIHNwZWVkOiA1MDAgfVxuICAgICAgICB7IHRleHQ6IFwiQUkgU3BlZWQ6IFVsdHJhXCIsIHNwZWVkOiAyNTAgfVxuICAgICAgXVxuICAgICAgc29ydHM6IFtcbiAgICAgICAgeyB0ZXh0OiBcIlNvcnQgT3JkZXI6IE5vcm1hbFwiIH1cbiAgICAgICAgeyB0ZXh0OiBcIlNvcnQgT3JkZXI6IFJldmVyc2VcIiB9XG4gICAgICBdXG4gICAgQG9wdGlvbnMgPVxuICAgICAgc3BlZWRJbmRleDogMVxuICAgICAgc29ydEluZGV4OiAwXG4gICAgICBzb3VuZDogdHJ1ZVxuXG4gICAgQG1haW5NZW51ID0gbmV3IE1lbnUgdGhpcywgXCJUaGlydGVlblwiLCBcInNvbGlkXCIsIEBjb2xvcnMubWFpbm1lbnUsIFtcbiAgICAgIChjbGljaykgPT5cbiAgICAgICAgaWYgY2xpY2tcbiAgICAgICAgICBAaG93dG8gPSAxXG4gICAgICAgIHJldHVybiBcIkhvdyBUbyBQbGF5XCJcbiAgICAgIChjbGljaykgPT5cbiAgICAgICAgaWYgY2xpY2tcbiAgICAgICAgICBAb3B0aW9ucy5zcGVlZEluZGV4ID0gKEBvcHRpb25zLnNwZWVkSW5kZXggKyAxKSAlIEBvcHRpb25NZW51cy5zcGVlZHMubGVuZ3RoXG4gICAgICAgIHJldHVybiBAb3B0aW9uTWVudXMuc3BlZWRzW0BvcHRpb25zLnNwZWVkSW5kZXhdLnRleHRcbiAgICAgIChjbGljaykgPT5cbiAgICAgICAgaWYgY2xpY2tcbiAgICAgICAgICBAb3B0aW9ucy5zb3J0SW5kZXggPSAoQG9wdGlvbnMuc29ydEluZGV4ICsgMSkgJSBAb3B0aW9uTWVudXMuc29ydHMubGVuZ3RoXG4gICAgICAgIHJldHVybiBAb3B0aW9uTWVudXMuc29ydHNbQG9wdGlvbnMuc29ydEluZGV4XS50ZXh0XG4gICAgICAoY2xpY2spID0+XG4gICAgICAgIGlmIGNsaWNrXG4gICAgICAgICAgQG5ld0dhbWUoKVxuICAgICAgICByZXR1cm4gXCJTdGFydFwiXG4gICAgXVxuXG4gICAgQHBhdXNlTWVudSA9IG5ldyBNZW51IHRoaXMsIFwiUGF1c2VkXCIsIFwic29saWRcIiwgQGNvbG9ycy5wYXVzZW1lbnUsIFtcbiAgICAgIChjbGljaykgPT5cbiAgICAgICAgaWYgY2xpY2tcbiAgICAgICAgICBAcGF1c2VkID0gZmFsc2VcbiAgICAgICAgcmV0dXJuIFwiUmVzdW1lIEdhbWVcIlxuICAgICAgKGNsaWNrKSA9PlxuICAgICAgICBpZiBjbGlja1xuICAgICAgICAgIEBuZXdHYW1lKClcbiAgICAgICAgICBAcGF1c2VkID0gZmFsc2VcbiAgICAgICAgcmV0dXJuIFwiTmV3IEdhbWVcIlxuICAgICAgKGNsaWNrKSA9PlxuICAgICAgICBpZiBjbGlja1xuICAgICAgICAgIEBob3d0byA9IDFcbiAgICAgICAgcmV0dXJuIFwiSG93IFRvIFBsYXlcIlxuICAgICAgKGNsaWNrKSA9PlxuICAgICAgICBpZiBjbGlja1xuICAgICAgICAgIEBvcHRpb25zLnNwZWVkSW5kZXggPSAoQG9wdGlvbnMuc3BlZWRJbmRleCArIDEpICUgQG9wdGlvbk1lbnVzLnNwZWVkcy5sZW5ndGhcbiAgICAgICAgcmV0dXJuIEBvcHRpb25NZW51cy5zcGVlZHNbQG9wdGlvbnMuc3BlZWRJbmRleF0udGV4dFxuICAgICAgKGNsaWNrKSA9PlxuICAgICAgICBpZiBjbGlja1xuICAgICAgICAgIEBvcHRpb25zLnNvcnRJbmRleCA9IChAb3B0aW9ucy5zb3J0SW5kZXggKyAxKSAlIEBvcHRpb25NZW51cy5zb3J0cy5sZW5ndGhcbiAgICAgICAgcmV0dXJuIEBvcHRpb25NZW51cy5zb3J0c1tAb3B0aW9ucy5zb3J0SW5kZXhdLnRleHRcbiAgICBdXG5cbiAgICBAbmV3R2FtZSgpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIGxvZ2dpbmdcblxuICBsb2c6IChzKSAtPlxuICAgIEBuYXRpdmUubG9nKHMpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIGxvYWQgLyBzYXZlXG5cbiAgbG9hZDogKGpzb24pIC0+XG4gICAgQGxvZyBcIihDUykgbG9hZGluZyBzdGF0ZVwiXG4gICAgdHJ5XG4gICAgICBzdGF0ZSA9IEpTT04ucGFyc2UganNvblxuICAgIGNhdGNoXG4gICAgICBAbG9nIFwibG9hZCBmYWlsZWQgdG8gcGFyc2Ugc3RhdGU6ICN7anNvbn1cIlxuICAgICAgcmV0dXJuXG4gICAgaWYgc3RhdGUub3B0aW9uc1xuICAgICAgZm9yIGssIHYgb2Ygc3RhdGUub3B0aW9uc1xuICAgICAgICBAb3B0aW9uc1trXSA9IHZcblxuICAgIGlmIHN0YXRlLnRoaXJ0ZWVuXG4gICAgICBAbG9nIFwicmVjcmVhdGluZyBnYW1lIGZyb20gc2F2ZWRhdGFcIlxuICAgICAgQHRoaXJ0ZWVuID0gbmV3IFRoaXJ0ZWVuIHRoaXMsIHtcbiAgICAgICAgc3RhdGU6IHN0YXRlLnRoaXJ0ZWVuXG4gICAgICB9XG4gICAgICBAcHJlcGFyZUdhbWUoKVxuXG4gIHNhdmU6IC0+XG4gICAgIyBAbG9nIFwiKENTKSBzYXZpbmcgc3RhdGVcIlxuICAgIHN0YXRlID0ge1xuICAgICAgb3B0aW9uczogQG9wdGlvbnNcbiAgICB9XG5cbiAgICAjIFRPRE86IEVOQUJMRSBTQVZJTkcgSEVSRVxuICAgIGlmIEB0aGlydGVlbj9cbiAgICAgIEB0aGlydGVlbi51cGRhdGVQbGF5ZXJIYW5kKEBoYW5kLmNhcmRzKVxuICAgICAgc3RhdGUudGhpcnRlZW4gPSBAdGhpcnRlZW4uc2F2ZSgpXG5cbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkgc3RhdGVcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgYWlUaWNrUmF0ZTogLT5cbiAgICByZXR1cm4gQG9wdGlvbk1lbnVzLnNwZWVkc1tAb3B0aW9ucy5zcGVlZEluZGV4XS5zcGVlZFxuXG4gIG5ld0dhbWU6IC0+XG4gICAgQHRoaXJ0ZWVuID0gbmV3IFRoaXJ0ZWVuIHRoaXMsIHt9XG4gICAgQGxvZyBcInBsYXllciAwJ3MgaGFuZDogXCIgKyBKU09OLnN0cmluZ2lmeShAdGhpcnRlZW4ucGxheWVyc1swXS5oYW5kKVxuICAgIEBwcmVwYXJlR2FtZSgpXG5cbiAgcHJlcGFyZUdhbWU6IC0+XG4gICAgQGhhbmQgPSBuZXcgSGFuZCB0aGlzXG4gICAgQHBpbGUgPSBuZXcgUGlsZSB0aGlzLCBAaGFuZFxuICAgIEBoYW5kLnNldCBAdGhpcnRlZW4ucGxheWVyc1swXS5oYW5kXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIGlucHV0IGhhbmRsaW5nXG5cbiAgdG91Y2hEb3duOiAoeCwgeSkgLT5cbiAgICAjIEBsb2coXCJ0b3VjaERvd24gI3t4fSwje3l9XCIpXG4gICAgQGNoZWNrWm9uZXMoeCwgeSlcblxuICB0b3VjaE1vdmU6ICh4LCB5KSAtPlxuICAgICMgQGxvZyhcInRvdWNoTW92ZSAje3h9LCN7eX1cIilcbiAgICBpZiBAdGhpcnRlZW4gIT0gbnVsbFxuICAgICAgQGhhbmQubW92ZSh4LCB5KVxuXG4gIHRvdWNoVXA6ICh4LCB5KSAtPlxuICAgICMgQGxvZyhcInRvdWNoVXAgI3t4fSwje3l9XCIpXG4gICAgaWYgQHRoaXJ0ZWVuICE9IG51bGxcbiAgICAgIEBoYW5kLnVwKHgsIHkpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIGhlYWRsaW5lIChnYW1lIHN0YXRlIGluIHRvcCBsZWZ0KVxuXG4gIHByZXR0eUVycm9yVGFibGU6IHtcbiAgICAgIGdhbWVPdmVyOiAgICAgICAgICAgXCJUaGUgZ2FtZSBpcyBvdmVyLlwiXG4gICAgICBpbnZhbGlkUGxheTogICAgICAgIFwiTm90IGEgdmFsaWQgcGxheS5cIlxuICAgICAgbXVzdEJyZWFrT3JQYXNzOiAgICBcIllvdSBwYXNzZWQgYWxyZWFkeSwgc28gMi1icmVha2VyIG9yIHBhc3MuXCJcbiAgICAgIG11c3RQYXNzOiAgICAgICAgICAgXCJZb3UgbXVzdCBwYXNzLlwiXG4gICAgICBtdXN0VGhyb3czUzogICAgICAgIFwiWW91IG11c3QgdXNlIHRoZSAzXFx4YzggaW4geW91ciBwbGF5LlwiXG4gICAgICBub3RZb3VyVHVybjogICAgICAgIFwiSXQgaXMgbm90IHlvdXIgdHVybi5cIlxuICAgICAgdGhyb3dBbnl0aGluZzogICAgICBcIllvdSBoYXZlIGNvbnRyb2wsIHRocm93IGFueXRoaW5nLlwiXG4gICAgICB0b29Mb3dQbGF5OiAgICAgICAgIFwiVGhpcyBwbGF5IGlzIG5vdCBzdHJvbmdlciB0aGFuIHRoZSBjdXJyZW50IHBsYXkuXCJcbiAgICAgIHdyb25nUGxheTogICAgICAgICAgXCJUaGlzIHBsYXkgZG9lcyBub3QgbWF0Y2ggdGhlIGN1cnJlbnQgcGxheS5cIlxuICB9XG5cbiAgcHJldHR5RXJyb3I6IC0+XG4gICAgcHJldHR5ID0gQHByZXR0eUVycm9yVGFibGVbQGxhc3RFcnJdXG4gICAgcmV0dXJuIHByZXR0eSBpZiBwcmV0dHlcbiAgICByZXR1cm4gQGxhc3RFcnJcblxuICBjYWxjSGVhZGxpbmU6IC0+XG4gICAgcmV0dXJuIFwiXCIgaWYgQHRoaXJ0ZWVuID09IG51bGxcblxuICAgIGhlYWRsaW5lID0gQHRoaXJ0ZWVuLmhlYWRsaW5lKClcbiAgICAjIHN3aXRjaCBAdGhpcnRlZW4uc3RhdGVcbiAgICAjICAgd2hlbiBTdGF0ZS5CSURcbiAgICAjICAgICBoZWFkbGluZSA9IFwiV2FpdGluZyBmb3IgYGZmNzcwMGAje0B0aGlydGVlbi5wbGF5ZXJzW0B0aGlydGVlbi50dXJuXS5uYW1lfWBgIHRvIGBmZmZmMDBgYmlkYGBcIlxuICAgICMgICB3aGVuIFN0YXRlLlRSSUNLXG4gICAgIyAgICAgaGVhZGxpbmUgPSBcIldhaXRpbmcgZm9yIGBmZjc3MDBgI3tAdGhpcnRlZW4ucGxheWVyc1tAdGhpcnRlZW4udHVybl0ubmFtZX1gYCB0byBgZmZmZjAwYHBsYXlgYFwiXG4gICAgIyAgIHdoZW4gU3RhdGUuUk9VTkRTVU1NQVJZXG4gICAgIyAgICAgaGVhZGxpbmUgPSBcIldhaXRpbmcgZm9yIG5leHQgcm91bmQuLi5cIlxuICAgICMgICB3aGVuIFN0YXRlLlBPU1RHQU1FU1VNTUFSWVxuICAgICMgICAgIGhlYWRsaW5lID0gXCJHYW1lIG92ZXIhXCJcblxuICAgIGVyclRleHQgPSBcIlwiXG4gICAgaWYgKEBsYXN0RXJyLmxlbmd0aCA+IDApIGFuZCAoQGxhc3RFcnIgIT0gT0spXG4gICAgICBlcnJUZXh0ID0gXCIgIGBmZmZmZmZgRVJST1I6IGBmZjAwMDBgI3tAcHJldHR5RXJyb3IoKX1cIlxuICAgICAgaGVhZGxpbmUgKz0gZXJyVGV4dFxuXG4gICAgcmV0dXJuIGhlYWRsaW5lXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIGdhbWUgb3ZlciBpbmZvcm1hdGlvblxuXG4gIGdhbWVPdmVyVGV4dDogLT5cbiAgICB3aW5uZXIgPSBAdGhpcnRlZW4ud2lubmVyKClcbiAgICBpZiB3aW5uZXIubmFtZSA9PSBcIlBsYXllclwiXG4gICAgICByZXR1cm4gW1wiWW91IHdpbiFcIiwgXCIje0B0aGlydGVlbi5sYXN0U3RyZWFrfSBpbiBhIHJvd1wiXVxuICAgIHJldHVybiBbXCIje3dpbm5lci5uYW1lfSB3aW5zIVwiLCBcIiN7QHRoaXJ0ZWVuLmxhc3RTdHJlYWt9IGluIGEgcm93XCJdXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyBjYXJkIGhhbmRsaW5nXG5cbiAgcGFzczogLT5cbiAgICBAbGFzdEVyciA9IEB0aGlydGVlbi5wYXNzIHtcbiAgICAgIGlkOiAxXG4gICAgfVxuXG4gIHBsYXk6IChjYXJkcykgLT5cbiAgICBjb25zb2xlLmxvZyBcIihnYW1lKSBwbGF5aW5nIGNhcmRzXCIsIGNhcmRzXG5cbiAgICBAdGhpcnRlZW4udXBkYXRlUGxheWVySGFuZChAaGFuZC5jYXJkcylcblxuICAgIHJhd0NhcmRzID0gW11cbiAgICBmb3IgY2FyZCBpbiBjYXJkc1xuICAgICAgcmF3Q2FyZHMucHVzaCBjYXJkLmNhcmRcblxuICAgIHJldCA9IEB0aGlydGVlbi5wbGF5IHtcbiAgICAgIGlkOiAxXG4gICAgICBjYXJkczogcmF3Q2FyZHNcbiAgICB9XG4gICAgQGxhc3RFcnIgPSByZXRcbiAgICBpZiByZXQgPT0gT0tcbiAgICAgIEBoYW5kLnNldCBAdGhpcnRlZW4ucGxheWVyc1swXS5oYW5kXG4gICAgICBAcGlsZS5oaW50IGNhcmRzXG5cbiAgcGxheVBpY2tlZDogLT5cbiAgICBpZiBub3QgQGhhbmQucGlja2luZ1xuICAgICAgcmV0dXJuXG4gICAgY2FyZHMgPSBAaGFuZC5zZWxlY3RlZENhcmRzKClcbiAgICBAaGFuZC5zZWxlY3ROb25lKClcbiAgICBpZiBjYXJkcy5sZW5ndGggPT0gMFxuICAgICAgcmV0dXJuIEBwYXNzKClcbiAgICAjIEBoYW5kLnRvZ2dsZVBpY2tpbmcoKVxuICAgIHJldHVybiBAcGxheShjYXJkcylcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgbWFpbiBsb29wXG5cbiAgdXBkYXRlOiAoZHQpIC0+XG4gICAgQHpvbmVzLmxlbmd0aCA9IDAgIyBmb3JnZXQgYWJvdXQgem9uZXMgZnJvbSB0aGUgbGFzdCBmcmFtZS4gd2UncmUgYWJvdXQgdG8gbWFrZSBzb21lIG5ldyBvbmVzIVxuXG4gICAgdXBkYXRlZCA9IGZhbHNlXG4gICAgaWYgQHVwZGF0ZU1haW5NZW51KGR0KVxuICAgICAgdXBkYXRlZCA9IHRydWVcbiAgICBpZiBAdXBkYXRlR2FtZShkdClcbiAgICAgIHVwZGF0ZWQgPSB0cnVlXG5cbiAgICByZXR1cm4gdXBkYXRlZFxuXG4gIHVwZGF0ZU1haW5NZW51OiAoZHQpIC0+XG4gICAgdXBkYXRlZCA9IGZhbHNlXG4gICAgaWYgQG1haW5NZW51LnVwZGF0ZShkdClcbiAgICAgIHVwZGF0ZWQgPSB0cnVlXG4gICAgcmV0dXJuIHVwZGF0ZWRcblxuICB1cGRhdGVHYW1lOiAoZHQpIC0+XG4gICAgcmV0dXJuIGZhbHNlIGlmIEB0aGlydGVlbiA9PSBudWxsXG5cbiAgICB1cGRhdGVkID0gZmFsc2VcblxuICAgIGlmIEBwaWxlLnVwZGF0ZShkdClcbiAgICAgIHVwZGF0ZWQgPSB0cnVlXG4gICAgaWYgQHBpbGUucmVhZHlGb3JOZXh0VHJpY2soKVxuICAgICAgQG5leHRBSVRpY2sgLT0gZHRcbiAgICAgIGlmIEBuZXh0QUlUaWNrIDw9IDBcbiAgICAgICAgQG5leHRBSVRpY2sgPSBAYWlUaWNrUmF0ZSgpXG4gICAgICAgIGlmIEB0aGlydGVlbi5haVRpY2soKVxuICAgICAgICAgIHVwZGF0ZWQgPSB0cnVlXG4gICAgaWYgQGhhbmQudXBkYXRlKGR0KVxuICAgICAgdXBkYXRlZCA9IHRydWVcblxuICAgIEBwaWxlLnNldCBAdGhpcnRlZW4udGhyb3dJRCwgQHRoaXJ0ZWVuLnBpbGUsIEB0aGlydGVlbi5waWxlV2hvXG5cbiAgICBpZiBAcGF1c2VNZW51LnVwZGF0ZShkdClcbiAgICAgIHVwZGF0ZWQgPSB0cnVlXG5cbiAgICByZXR1cm4gdXBkYXRlZFxuXG4gIHJlbmRlcjogLT5cbiAgICAjIFJlc2V0IHJlbmRlciBjb21tYW5kc1xuICAgIEByZW5kZXJDb21tYW5kcy5sZW5ndGggPSAwXG5cbiAgICBpZiBAaG93dG8gPiAwXG4gICAgICBAcmVuZGVySG93dG8oKVxuICAgIGVsc2UgaWYgQHRoaXJ0ZWVuID09IG51bGxcbiAgICAgIEByZW5kZXJNYWluTWVudSgpXG4gICAgZWxzZVxuICAgICAgQHJlbmRlckdhbWUoKVxuXG4gICAgcmV0dXJuIEByZW5kZXJDb21tYW5kc1xuXG4gIHJlbmRlckhvd3RvOiAtPlxuICAgIGhvd3RvVGV4dHVyZSA9IFwiaG93dG8je0Bob3d0b31cIlxuICAgIEBsb2cgXCJyZW5kZXJpbmcgI3tob3d0b1RleHR1cmV9XCJcbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwic29saWRcIiwgMCwgMCwgQHdpZHRoLCBAaGVpZ2h0LCAwLCAwLCAwLCBAY29sb3JzLmJsYWNrXG4gICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBob3d0b1RleHR1cmUsIDAsIDAsIEB3aWR0aCwgQGFhSGVpZ2h0LCAwLCAwLCAwLCBAY29sb3JzLndoaXRlXG4gICAgYXJyb3dXaWR0aCA9IEB3aWR0aCAvIDIwXG4gICAgYXJyb3dPZmZzZXQgPSBhcnJvd1dpZHRoICogNFxuICAgIGNvbG9yID0gaWYgQGhvd3RvID09IDEgdGhlbiBAY29sb3JzLmFycm93Y2xvc2UgZWxzZSBAY29sb3JzLmFycm93XG4gICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcImFycm93TFwiLCBAY2VudGVyLnggLSBhcnJvd09mZnNldCwgQGhlaWdodCwgYXJyb3dXaWR0aCwgMCwgMCwgMC41LCAxLCBjb2xvciwgPT5cbiAgICAgIEBob3d0by0tXG4gICAgICBpZiBAaG93dG8gPCAwXG4gICAgICAgIEBob3d0byA9IDBcbiAgICBjb2xvciA9IGlmIEBob3d0byA9PSAzIHRoZW4gQGNvbG9ycy5hcnJvd2Nsb3NlIGVsc2UgQGNvbG9ycy5hcnJvd1xuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJhcnJvd1JcIiwgQGNlbnRlci54ICsgYXJyb3dPZmZzZXQsIEBoZWlnaHQsIGFycm93V2lkdGgsIDAsIDAsIDAuNSwgMSwgY29sb3IsID0+XG4gICAgICBAaG93dG8rK1xuICAgICAgaWYgQGhvd3RvID4gM1xuICAgICAgICBAaG93dG8gPSAwXG5cbiAgcmVuZGVyTWFpbk1lbnU6IC0+XG4gICAgQG1haW5NZW51LnJlbmRlcigpXG5cbiAgcmVuZGVyR2FtZTogLT5cblxuICAgICMgYmFja2dyb3VuZFxuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJzb2xpZFwiLCAwLCAwLCBAd2lkdGgsIEBoZWlnaHQsIDAsIDAsIDAsIEBjb2xvcnMuYmFja2dyb3VuZFxuXG4gICAgdGV4dEhlaWdodCA9IEBhYUhlaWdodCAvIDI1XG4gICAgdGV4dFBhZGRpbmcgPSB0ZXh0SGVpZ2h0IC8gNVxuICAgIGNoYXJhY3RlckhlaWdodCA9IEBhYUhlaWdodCAvIDVcbiAgICBjb3VudEhlaWdodCA9IHRleHRIZWlnaHRcblxuICAgICMgTG9nXG4gICAgZm9yIGxpbmUsIGkgaW4gQHRoaXJ0ZWVuLmxvZ1xuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIHRleHRIZWlnaHQsIGxpbmUsIDAsIChpKzEpICogKHRleHRIZWlnaHQgKyB0ZXh0UGFkZGluZyksIDAsIDAsIEBjb2xvcnMud2hpdGVcblxuICAgIGFpUGxheWVycyA9IFtcbiAgICAgIEB0aGlydGVlbi5wbGF5ZXJzWzFdXG4gICAgICBAdGhpcnRlZW4ucGxheWVyc1syXVxuICAgICAgQHRoaXJ0ZWVuLnBsYXllcnNbM11cbiAgICBdXG5cbiAgICBjaGFyYWN0ZXJNYXJnaW4gPSBjaGFyYWN0ZXJIZWlnaHQgLyAyXG4gICAgQGNoYXJDZWlsaW5nID0gQGhlaWdodCAqIDAuNlxuXG4gICAgIyBsZWZ0IHNpZGVcbiAgICBpZiBhaVBsYXllcnNbMF0gIT0gbnVsbFxuICAgICAgY2hhcmFjdGVyID0gYWlDaGFyYWN0ZXJzW2FpUGxheWVyc1swXS5jaGFySURdXG4gICAgICBjaGFyYWN0ZXJXaWR0aCA9IEBzcHJpdGVSZW5kZXJlci5jYWxjV2lkdGgoY2hhcmFjdGVyLnNwcml0ZSwgY2hhcmFjdGVySGVpZ2h0KVxuICAgICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBjaGFyYWN0ZXIuc3ByaXRlLCBjaGFyYWN0ZXJNYXJnaW4sIEBjaGFyQ2VpbGluZywgMCwgY2hhcmFjdGVySGVpZ2h0LCAwLCAwLCAxLCBAY29sb3JzLndoaXRlXG4gICAgICBAcmVuZGVyQ291bnQgYWlQbGF5ZXJzWzBdLCBhaVBsYXllcnNbMF0uaW5kZXggPT0gQHRoaXJ0ZWVuLnR1cm4sIGNvdW50SGVpZ2h0LCBjaGFyYWN0ZXJNYXJnaW4gKyAoY2hhcmFjdGVyV2lkdGggLyAyKSwgQGNoYXJDZWlsaW5nIC0gdGV4dFBhZGRpbmcsIDAuNSwgMFxuICAgICAgQHJlbmRlckFJSGFuZCBhaVBsYXllcnNbMF0uY291bnQsIGNoYXJhY3Rlck1hcmdpbiArIChjaGFyYWN0ZXJXaWR0aCAvIDIpLCBAY2hhckNlaWxpbmcgLSB0ZXh0UGFkZGluZywgMC41LCAwXG4gICAgIyB0b3Agc2lkZVxuICAgIGlmIGFpUGxheWVyc1sxXSAhPSBudWxsXG4gICAgICBjaGFyYWN0ZXIgPSBhaUNoYXJhY3RlcnNbYWlQbGF5ZXJzWzFdLmNoYXJJRF1cbiAgICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgY2hhcmFjdGVyLnNwcml0ZSwgQGNlbnRlci54LCAwLCAwLCBjaGFyYWN0ZXJIZWlnaHQsIDAsIDAuNSwgMCwgQGNvbG9ycy53aGl0ZVxuICAgICAgQHJlbmRlckNvdW50IGFpUGxheWVyc1sxXSwgYWlQbGF5ZXJzWzFdLmluZGV4ID09IEB0aGlydGVlbi50dXJuLCBjb3VudEhlaWdodCwgQGNlbnRlci54LCBjaGFyYWN0ZXJIZWlnaHQsIDAuNSwgMFxuICAgICAgQHJlbmRlckFJSGFuZCBhaVBsYXllcnNbMF0uY291bnQsIGNoYXJhY3Rlck1hcmdpbiArIChjaGFyYWN0ZXJXaWR0aCAvIDIpLCBAY2hhckNlaWxpbmcgLSB0ZXh0UGFkZGluZywgMC41LCAwXG4gICAgIyByaWdodCBzaWRlXG4gICAgaWYgYWlQbGF5ZXJzWzJdICE9IG51bGxcbiAgICAgIGNoYXJhY3RlciA9IGFpQ2hhcmFjdGVyc1thaVBsYXllcnNbMl0uY2hhcklEXVxuICAgICAgY2hhcmFjdGVyV2lkdGggPSBAc3ByaXRlUmVuZGVyZXIuY2FsY1dpZHRoKGNoYXJhY3Rlci5zcHJpdGUsIGNoYXJhY3RlckhlaWdodClcbiAgICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgY2hhcmFjdGVyLnNwcml0ZSwgQHdpZHRoIC0gY2hhcmFjdGVyTWFyZ2luLCBAY2hhckNlaWxpbmcsIDAsIGNoYXJhY3RlckhlaWdodCwgMCwgMSwgMSwgQGNvbG9ycy53aGl0ZVxuICAgICAgQHJlbmRlckNvdW50IGFpUGxheWVyc1syXSwgYWlQbGF5ZXJzWzJdLmluZGV4ID09IEB0aGlydGVlbi50dXJuLCBjb3VudEhlaWdodCwgQHdpZHRoIC0gKGNoYXJhY3Rlck1hcmdpbiArIChjaGFyYWN0ZXJXaWR0aCAvIDIpKSwgQGNoYXJDZWlsaW5nIC0gdGV4dFBhZGRpbmcsIDAuNSwgMFxuICAgICAgQHJlbmRlckFJSGFuZCBhaVBsYXllcnNbMF0uY291bnQsIGNoYXJhY3Rlck1hcmdpbiArIChjaGFyYWN0ZXJXaWR0aCAvIDIpLCBAY2hhckNlaWxpbmcgLSB0ZXh0UGFkZGluZywgMC41LCAwXG5cbiAgICAjIGNhcmQgYXJlYVxuICAgIGhhbmRBcmVhSGVpZ2h0ID0gMC4yNyAqIEBoZWlnaHRcbiAgICBpZiBAaGFuZC5waWNraW5nXG4gICAgICBoYW5kYXJlYUNvbG9yID0gQGNvbG9ycy5oYW5kX3BpY2tcbiAgICBlbHNlXG4gICAgICBoYW5kYXJlYUNvbG9yID0gQGNvbG9ycy5oYW5kX3Jlb3JnXG4gICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcInNvbGlkXCIsIDAsIEBoZWlnaHQsIEB3aWR0aCwgaGFuZEFyZWFIZWlnaHQsIDAsIDAsIDEsIGhhbmRhcmVhQ29sb3IsID0+XG4gICAgICBAaGFuZC50b2dnbGVQaWNraW5nKClcblxuICAgICMgcGlsZVxuICAgIHBpbGVEaW1lbnNpb24gPSBAaGVpZ2h0ICogMC40XG4gICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcInBpbGVcIiwgQHdpZHRoIC8gMiwgQGhlaWdodCAvIDIsIHBpbGVEaW1lbnNpb24sIHBpbGVEaW1lbnNpb24sIDAsIDAuNSwgMC41LCBAY29sb3JzLndoaXRlLCA9PlxuICAgICAgQHBsYXlQaWNrZWQoKVxuICAgIEBwaWxlLnJlbmRlcigpXG5cbiAgICBAaGFuZC5yZW5kZXIoKVxuICAgIEByZW5kZXJDb3VudCBAdGhpcnRlZW4ucGxheWVyc1swXSwgMCA9PSBAdGhpcnRlZW4udHVybiwgY291bnRIZWlnaHQsIEBjZW50ZXIueCwgQGhlaWdodCwgMC41LCAxXG5cbiAgICBpZiBAdGhpcnRlZW4ud2lubmVyKCkgYW5kIEBwaWxlLnJlc3RpbmcoKVxuICAgICAgbGluZXMgPSBAZ2FtZU92ZXJUZXh0KClcbiAgICAgIGdhbWVPdmVyU2l6ZSA9IEBhYUhlaWdodCAvIDhcbiAgICAgIGdhbWVPdmVyWSA9IEBjZW50ZXIueVxuICAgICAgaWYgbGluZXMubGVuZ3RoID4gMVxuICAgICAgICBnYW1lT3ZlclkgLT0gKGdhbWVPdmVyU2l6ZSA+PiAxKVxuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIGdhbWVPdmVyU2l6ZSwgbGluZXNbMF0sIEBjZW50ZXIueCwgZ2FtZU92ZXJZLCAwLjUsIDAuNSwgQGNvbG9ycy5vcmFuZ2VcbiAgICAgIGlmIGxpbmVzLmxlbmd0aCA+IDFcbiAgICAgICAgZ2FtZU92ZXJZICs9IGdhbWVPdmVyU2l6ZVxuICAgICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgZ2FtZU92ZXJTaXplLCBsaW5lc1sxXSwgQGNlbnRlci54LCBnYW1lT3ZlclksIDAuNSwgMC41LCBAY29sb3JzLm9yYW5nZVxuXG4gICAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwic29saWRcIiwgMCwgQGhlaWdodCwgQHdpZHRoLCBoYW5kQXJlYUhlaWdodCwgMCwgMCwgMSwgQGNvbG9ycy5wbGF5X2FnYWluLCA9PlxuICAgICAgICBAdGhpcnRlZW4uZGVhbCgpXG4gICAgICAgIEBwcmVwYXJlR2FtZSgpXG5cbiAgICAgIHJlc3RhcnRRdWl0U2l6ZSA9IEBhYUhlaWdodCAvIDEyXG4gICAgICBzaGFkb3dEaXN0YW5jZSA9IHJlc3RhcnRRdWl0U2l6ZSAvIDhcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCByZXN0YXJ0UXVpdFNpemUsIFwiUGxheSBBZ2FpblwiLCBzaGFkb3dEaXN0YW5jZSArIEBjZW50ZXIueCwgc2hhZG93RGlzdGFuY2UgKyAoQGhlaWdodCAtIChoYW5kQXJlYUhlaWdodCAqIDAuNSkpLCAwLjUsIDEsIEBjb2xvcnMuYmxhY2ssID0+XG4gICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgcmVzdGFydFF1aXRTaXplLCBcIlBsYXkgQWdhaW5cIiwgQGNlbnRlci54LCBAaGVpZ2h0IC0gKGhhbmRBcmVhSGVpZ2h0ICogMC41KSwgMC41LCAxLCBAY29sb3JzLmdvbGRcblxuICAgICMgSGVhZGxpbmUgKGluY2x1ZGVzIGVycm9yKVxuICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCB0ZXh0SGVpZ2h0LCBAY2FsY0hlYWRsaW5lKCksIDAsIDAsIDAsIDAsIEBjb2xvcnMubGlnaHRncmF5XG5cbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwicGF1c2VcIiwgQHdpZHRoLCAwLCAwLCBAcGF1c2VCdXR0b25TaXplLCAwLCAxLCAwLCBAY29sb3JzLndoaXRlLCA9PlxuICAgICAgQHBhdXNlZCA9IHRydWVcblxuICAgIGlmIG5vdCBAaGFuZC5waWNraW5nXG4gICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgdGV4dEhlaWdodCwgXCJVbmxvY2tlZFwiLCAwLjAyICogQHdpZHRoLCBAaGVpZ2h0IC0gaGFuZEFyZWFIZWlnaHQsIDAsIDAsIEBjb2xvcnMud2hpdGVcblxuICAgIGlmIEBwYXVzZWRcbiAgICAgIEBwYXVzZU1lbnUucmVuZGVyKClcblxuICAgIHJldHVyblxuXG4gIHJlbmRlckNvdW50OiAocGxheWVyLCBteVR1cm4sIGNvdW50SGVpZ2h0LCB4LCB5LCBhbmNob3J4LCBhbmNob3J5KSAtPlxuICAgIGlmIG15VHVyblxuICAgICAgbmFtZUNvbG9yID0gXCJgZmY3NzAwYFwiXG4gICAgZWxzZVxuICAgICAgbmFtZUNvbG9yID0gXCJcIlxuICAgIG5hbWVTdHJpbmcgPSBcIiAje25hbWVDb2xvcn0je3BsYXllci5uYW1lfWBgIFwiXG4gICAgY2FyZENvdW50ID0gcGxheWVyLmhhbmQubGVuZ3RoXG4gICAgaWYgY2FyZENvdW50ID4gMVxuICAgICAgdHJpY2tDb2xvciA9IFwiZmZmZjMzXCJcbiAgICBlbHNlXG4gICAgICB0cmlja0NvbG9yID0gXCJmZjMzMzNcIlxuICAgIGNvdW50U3RyaW5nID0gXCIgYCN7dHJpY2tDb2xvcn1gI3tjYXJkQ291bnR9YGAgbGVmdCBcIlxuXG4gICAgbmFtZVNpemUgPSBAZm9udFJlbmRlcmVyLnNpemUoQGZvbnQsIGNvdW50SGVpZ2h0LCBuYW1lU3RyaW5nKVxuICAgIGNvdW50U2l6ZSA9IEBmb250UmVuZGVyZXIuc2l6ZShAZm9udCwgY291bnRIZWlnaHQsIGNvdW50U3RyaW5nKVxuICAgIGlmIG5hbWVTaXplLncgPiBjb3VudFNpemUud1xuICAgICAgY291bnRTaXplLncgPSBuYW1lU2l6ZS53XG4gICAgZWxzZVxuICAgICAgbmFtZVNpemUudyA9IGNvdW50U2l6ZS53XG4gICAgbmFtZVkgPSB5XG4gICAgY291bnRZID0geVxuICAgIGJveEhlaWdodCA9IGNvdW50U2l6ZS5oXG4gICAgaWYgcGxheWVyLmlkICE9IDFcbiAgICAgIGJveEhlaWdodCAqPSAyXG4gICAgICBpZiBhbmNob3J5ID4gMFxuICAgICAgICBuYW1lWSAtPSBjb3VudEhlaWdodFxuICAgICAgZWxzZVxuICAgICAgICBjb3VudFkgKz0gY291bnRIZWlnaHRcbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwic29saWRcIiwgeCwgeSwgY291bnRTaXplLncsIGJveEhlaWdodCwgMCwgYW5jaG9yeCwgYW5jaG9yeSwgQGNvbG9ycy5vdmVybGF5XG4gICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIGNvdW50SGVpZ2h0LCBuYW1lU3RyaW5nLCB4LCBuYW1lWSwgYW5jaG9yeCwgYW5jaG9yeSwgQGNvbG9ycy53aGl0ZVxuICAgIGlmIHBsYXllci5pZCAhPSAxXG4gICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgY291bnRIZWlnaHQsIGNvdW50U3RyaW5nLCB4LCBjb3VudFksIGFuY2hvcngsIGFuY2hvcnksIEBjb2xvcnMud2hpdGVcblxuICByZW5kZXJBSUhhbmQ6IChjYXJkQ291bnQsIGNvdW50SGVpZ2h0LCB4LCB5LCBhbmNob3J4LCBhbmNob3J5KSAtPlxuICAgICMgVE9ETzogbWFrZSB0aGlzIGRyYXcgYSB0aW55IGhhbmQgb2YgY2FyZHMgb24gdGhlIEFJIGNoYXJzXG5cbiAgICAjIGNhcmRIZWlnaHQgPSBNYXRoLmZsb29yKEBoZWlnaHQgKiBDQVJEX1JFTkRFUl9TQ0FMRSlcbiAgICAjIGNhcmRXaWR0aCAgPSBNYXRoLmZsb29yKGNhcmRIZWlnaHQgKiBDQVJEX0lNQUdFX1cgLyBDQVJEX0lNQUdFX0gpXG4gICAgIyBAZ2FtZS5kcmF3SW1hZ2UgXCJjYXJkc1wiLFxuICAgICMgSGFuZC5DQVJEX0lNQUdFX09GRl9YICsgKEhhbmQuQ0FSRF9JTUFHRV9BRFZfWCAqIHJhbmspLCBIYW5kLkNBUkRfSU1BR0VfT0ZGX1kgKyAoSGFuZC5DQVJEX0lNQUdFX0FEVl9ZICogc3VpdCksIEhhbmQuQ0FSRF9JTUFHRV9XLCBIYW5kLkNBUkRfSU1BR0VfSCxcbiAgICAjIHgsIHksIEBjYXJkV2lkdGggKiBzY2FsZSwgQGNhcmRIZWlnaHQgKiBzY2FsZSxcbiAgICAjIHJvdCwgMC41LCAwLjUsIDEsMSwxLDEsIGNiXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIHJlbmRlcmluZyBhbmQgem9uZXNcblxuICBkcmF3SW1hZ2U6ICh0ZXh0dXJlLCBzeCwgc3ksIHN3LCBzaCwgZHgsIGR5LCBkdywgZGgsIHJvdCwgYW5jaG9yeCwgYW5jaG9yeSwgciwgZywgYiwgYSwgY2IpIC0+XG4gICAgQHJlbmRlckNvbW1hbmRzLnB1c2ggQHRleHR1cmVzW3RleHR1cmVdLCBzeCwgc3ksIHN3LCBzaCwgZHgsIGR5LCBkdywgZGgsIHJvdCwgYW5jaG9yeCwgYW5jaG9yeSwgciwgZywgYiwgYVxuXG4gICAgaWYgY2I/XG4gICAgICAjIGNhbGxlciB3YW50cyB0byByZW1lbWJlciB3aGVyZSB0aGlzIHdhcyBkcmF3biwgYW5kIHdhbnRzIHRvIGJlIGNhbGxlZCBiYWNrIGlmIGl0IGlzIGV2ZXIgdG91Y2hlZFxuICAgICAgIyBUaGlzIGlzIGNhbGxlZCBhIFwiem9uZVwiLiBTaW5jZSB6b25lcyBhcmUgdHJhdmVyc2VkIGluIHJldmVyc2Ugb3JkZXIsIHRoZSBuYXR1cmFsIG92ZXJsYXAgb2ZcbiAgICAgICMgYSBzZXJpZXMgb2YgcmVuZGVycyBpcyByZXNwZWN0ZWQgYWNjb3JkaW5nbHkuXG4gICAgICBhbmNob3JPZmZzZXRYID0gLTEgKiBhbmNob3J4ICogZHdcbiAgICAgIGFuY2hvck9mZnNldFkgPSAtMSAqIGFuY2hvcnkgKiBkaFxuICAgICAgem9uZSA9XG4gICAgICAgICMgY2VudGVyIChYLFkpIGFuZCByZXZlcnNlZCByb3RhdGlvbiwgdXNlZCB0byBwdXQgdGhlIGNvb3JkaW5hdGUgaW4gbG9jYWwgc3BhY2UgdG8gdGhlIHpvbmVcbiAgICAgICAgY3g6ICBkeFxuICAgICAgICBjeTogIGR5XG4gICAgICAgIHJvdDogcm90ICogLTFcbiAgICAgICAgIyB0aGUgYXhpcyBhbGlnbmVkIGJvdW5kaW5nIGJveCB1c2VkIGZvciBkZXRlY3Rpb24gb2YgYSBsb2NhbHNwYWNlIGNvb3JkXG4gICAgICAgIGw6ICAgYW5jaG9yT2Zmc2V0WFxuICAgICAgICB0OiAgIGFuY2hvck9mZnNldFlcbiAgICAgICAgcjogICBhbmNob3JPZmZzZXRYICsgZHdcbiAgICAgICAgYjogICBhbmNob3JPZmZzZXRZICsgZGhcbiAgICAgICAgIyBjYWxsYmFjayB0byBjYWxsIGlmIHRoZSB6b25lIGlzIGNsaWNrZWQgb25cbiAgICAgICAgY2I6ICBjYlxuICAgICAgQHpvbmVzLnB1c2ggem9uZVxuXG4gIGNoZWNrWm9uZXM6ICh4LCB5KSAtPlxuICAgIGZvciB6b25lIGluIEB6b25lcyBieSAtMVxuICAgICAgIyBtb3ZlIGNvb3JkIGludG8gc3BhY2UgcmVsYXRpdmUgdG8gdGhlIHF1YWQsIHRoZW4gcm90YXRlIGl0IHRvIG1hdGNoXG4gICAgICB1bnJvdGF0ZWRMb2NhbFggPSB4IC0gem9uZS5jeFxuICAgICAgdW5yb3RhdGVkTG9jYWxZID0geSAtIHpvbmUuY3lcbiAgICAgIGxvY2FsWCA9IHVucm90YXRlZExvY2FsWCAqIE1hdGguY29zKHpvbmUucm90KSAtIHVucm90YXRlZExvY2FsWSAqIE1hdGguc2luKHpvbmUucm90KVxuICAgICAgbG9jYWxZID0gdW5yb3RhdGVkTG9jYWxYICogTWF0aC5zaW4oem9uZS5yb3QpICsgdW5yb3RhdGVkTG9jYWxZICogTWF0aC5jb3Moem9uZS5yb3QpXG4gICAgICBpZiAobG9jYWxYIDwgem9uZS5sKSBvciAobG9jYWxYID4gem9uZS5yKSBvciAobG9jYWxZIDwgem9uZS50KSBvciAobG9jYWxZID4gem9uZS5iKVxuICAgICAgICAjIG91dHNpZGUgb2Ygb3JpZW50ZWQgYm91bmRpbmcgYm94XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB6b25lLmNiKHgsIHkpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIHJldHVybiBmYWxzZVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxubW9kdWxlLmV4cG9ydHMgPSBHYW1lXG4iLCJBbmltYXRpb24gPSByZXF1aXJlICcuL0FuaW1hdGlvbidcblxuQ0FSRF9JTUFHRV9XID0gMTIwXG5DQVJEX0lNQUdFX0ggPSAxNjJcbkNBUkRfSU1BR0VfT0ZGX1ggPSA0XG5DQVJEX0lNQUdFX09GRl9ZID0gNFxuQ0FSRF9JTUFHRV9BRFZfWCA9IENBUkRfSU1BR0VfV1xuQ0FSRF9JTUFHRV9BRFZfWSA9IENBUkRfSU1BR0VfSFxuQ0FSRF9SRU5ERVJfU0NBTEUgPSAwLjM1ICAgICAgICAgICAgICAgICAgIyBjYXJkIGhlaWdodCBjb2VmZmljaWVudCBmcm9tIHRoZSBzY3JlZW4ncyBoZWlnaHRcbkNBUkRfSEFORF9DVVJWRV9ESVNUX0ZBQ1RPUiA9IDMuNSAgICAgICAgICMgZmFjdG9yIHdpdGggc2NyZWVuIGhlaWdodCB0byBmaWd1cmUgb3V0IGNlbnRlciBvZiBhcmMuIGJpZ2dlciBudW1iZXIgaXMgbGVzcyBhcmNcbkNBUkRfSE9MRElOR19ST1RfT1JERVIgPSBNYXRoLlBJIC8gMTIgICAgICMgZGVzaXJlZCByb3RhdGlvbiBvZiB0aGUgY2FyZCB3aGVuIGJlaW5nIGRyYWdnZWQgYXJvdW5kIGZvciBvcmRlcmluZydzIHNha2VcbkNBUkRfSE9MRElOR19ST1RfUExBWSA9IC0xICogTWF0aC5QSSAvIDEyICMgZGVzaXJlZCByb3RhdGlvbiBvZiB0aGUgY2FyZCB3aGVuIGJlaW5nIGRyYWdnZWQgYXJvdW5kIHdpdGggaW50ZW50IHRvIHBsYXlcbkNBUkRfUExBWV9DRUlMSU5HID0gMC42MCAgICAgICAgICAgICAgICAgICMgaG93IG11Y2ggb2YgdGhlIHRvcCBvZiB0aGUgc2NyZWVuIHJlcHJlc2VudHMgXCJJIHdhbnQgdG8gcGxheSB0aGlzXCIgdnMgXCJJIHdhbnQgdG8gcmVvcmRlclwiXG5cbk5PX0NBUkQgPSAtMVxuXG5IaWdobGlnaHQgPVxuICBOT05FOiAtMVxuICBVTlNFTEVDVEVEOiAwXG4gIFNFTEVDVEVEOiAxXG4gIFBJTEU6IDJcblxuIyB0YWtlbiBmcm9tIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTIxMTIxMi9ob3ctdG8tY2FsY3VsYXRlLWFuLWFuZ2xlLWZyb20tdGhyZWUtcG9pbnRzXG4jIHVzZXMgbGF3IG9mIGNvc2luZXMgdG8gZmlndXJlIG91dCB0aGUgaGFuZCBhcmMgYW5nbGVcbmZpbmRBbmdsZSA9IChwMCwgcDEsIHAyKSAtPlxuICAgIGEgPSBNYXRoLnBvdyhwMS54IC0gcDIueCwgMikgKyBNYXRoLnBvdyhwMS55IC0gcDIueSwgMilcbiAgICBiID0gTWF0aC5wb3cocDEueCAtIHAwLngsIDIpICsgTWF0aC5wb3cocDEueSAtIHAwLnksIDIpXG4gICAgYyA9IE1hdGgucG93KHAyLnggLSBwMC54LCAyKSArIE1hdGgucG93KHAyLnkgLSBwMC55LCAyKVxuICAgIHJldHVybiBNYXRoLmFjb3MoIChhK2ItYykgLyBNYXRoLnNxcnQoNCphKmIpIClcblxuY2FsY0Rpc3RhbmNlID0gKHAwLCBwMSkgLT5cbiAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyhwMS54IC0gcDAueCwgMikgKyBNYXRoLnBvdyhwMS55IC0gcDAueSwgMikpXG5cbmNhbGNEaXN0YW5jZVNxdWFyZWQgPSAoeDAsIHkwLCB4MSwgeTEpIC0+XG4gIHJldHVybiBNYXRoLnBvdyh4MSAtIHgwLCAyKSArIE1hdGgucG93KHkxIC0geTAsIDIpXG5cbmNsYXNzIEhhbmRcbiAgQENBUkRfSU1BR0VfVzogQ0FSRF9JTUFHRV9XXG4gIEBDQVJEX0lNQUdFX0g6IENBUkRfSU1BR0VfSFxuICBAQ0FSRF9JTUFHRV9PRkZfWDogQ0FSRF9JTUFHRV9PRkZfWFxuICBAQ0FSRF9JTUFHRV9PRkZfWTogQ0FSRF9JTUFHRV9PRkZfWVxuICBAQ0FSRF9JTUFHRV9BRFZfWDogQ0FSRF9JTUFHRV9BRFZfWFxuICBAQ0FSRF9JTUFHRV9BRFZfWTogQ0FSRF9JTUFHRV9BRFZfWVxuICBAQ0FSRF9SRU5ERVJfU0NBTEU6IENBUkRfUkVOREVSX1NDQUxFXG4gIEBIaWdobGlnaHQ6IEhpZ2hsaWdodFxuXG4gIGNvbnN0cnVjdG9yOiAoQGdhbWUpIC0+XG4gICAgQGNhcmRzID0gW11cbiAgICBAYW5pbXMgPSB7fVxuICAgIEBwb3NpdGlvbkNhY2hlID0ge31cblxuICAgIEBwaWNraW5nID0gdHJ1ZVxuICAgIEBwaWNrZWQgPSBbXVxuICAgIEBwaWNrUGFpbnQgPSBmYWxzZVxuXG4gICAgQGRyYWdJbmRleFN0YXJ0ID0gTk9fQ0FSRFxuICAgIEBkcmFnSW5kZXhDdXJyZW50ID0gTk9fQ0FSRFxuICAgIEBkcmFnWCA9IDBcbiAgICBAZHJhZ1kgPSAwXG5cbiAgICAjIHJlbmRlciAvIGFuaW0gbWV0cmljc1xuICAgIEBjYXJkU3BlZWQgPVxuICAgICAgcjogTWF0aC5QSSAqIDJcbiAgICAgIHM6IDIuNVxuICAgICAgdDogMiAqIEBnYW1lLndpZHRoXG4gICAgQHBsYXlDZWlsaW5nID0gQ0FSRF9QTEFZX0NFSUxJTkcgKiBAZ2FtZS5oZWlnaHRcbiAgICBAY2FyZEhlaWdodCA9IE1hdGguZmxvb3IoQGdhbWUuaGVpZ2h0ICogQ0FSRF9SRU5ERVJfU0NBTEUpXG4gICAgQGNhcmRXaWR0aCAgPSBNYXRoLmZsb29yKEBjYXJkSGVpZ2h0ICogQ0FSRF9JTUFHRV9XIC8gQ0FSRF9JTUFHRV9IKVxuICAgIEBjYXJkSGFsZkhlaWdodCA9IEBjYXJkSGVpZ2h0ID4+IDFcbiAgICBAY2FyZEhhbGZXaWR0aCAgPSBAY2FyZFdpZHRoID4+IDFcbiAgICBhcmNNYXJnaW4gPSBAY2FyZFdpZHRoIC8gMlxuICAgIGFyY1ZlcnRpY2FsQmlhcyA9IEBjYXJkSGVpZ2h0IC8gNTBcbiAgICBib3R0b21MZWZ0ICA9IHsgeDogYXJjTWFyZ2luLCAgICAgICAgICAgICAgICB5OiBhcmNWZXJ0aWNhbEJpYXMgKyBAZ2FtZS5oZWlnaHQgfVxuICAgIGJvdHRvbVJpZ2h0ID0geyB4OiBAZ2FtZS53aWR0aCAtIGFyY01hcmdpbiwgeTogYXJjVmVydGljYWxCaWFzICsgQGdhbWUuaGVpZ2h0IH1cbiAgICBAaGFuZENlbnRlciA9IHsgeDogQGdhbWUud2lkdGggLyAyLCAgICAgICAgIHk6IGFyY1ZlcnRpY2FsQmlhcyArIEBnYW1lLmhlaWdodCArIChDQVJEX0hBTkRfQ1VSVkVfRElTVF9GQUNUT1IgKiBAZ2FtZS5oZWlnaHQpIH1cbiAgICBAaGFuZEFuZ2xlID0gZmluZEFuZ2xlKGJvdHRvbUxlZnQsIEBoYW5kQ2VudGVyLCBib3R0b21SaWdodClcbiAgICBAaGFuZERpc3RhbmNlID0gY2FsY0Rpc3RhbmNlKGJvdHRvbUxlZnQsIEBoYW5kQ2VudGVyKVxuICAgIEBoYW5kQW5nbGVBZHZhbmNlTWF4ID0gQGhhbmRBbmdsZSAvIDcgIyBuZXZlciBzcGFjZSB0aGUgY2FyZHMgbW9yZSB0aGFuIHdoYXQgdGhleSdkIGxvb2sgbGlrZSB3aXRoIHRoaXMgaGFuZHNpemVcbiAgICBAZ2FtZS5sb2cgXCJIYW5kIGRpc3RhbmNlICN7QGhhbmREaXN0YW5jZX0sIGFuZ2xlICN7QGhhbmRBbmdsZX0gKHNjcmVlbiBoZWlnaHQgI3tAZ2FtZS5oZWlnaHR9KVwiXG5cbiAgdG9nZ2xlUGlja2luZzogLT5cbiAgICBAcGlja2luZyA9ICFAcGlja2luZ1xuICAgIGlmIEBwaWNraW5nXG4gICAgICBAc2VsZWN0Tm9uZSgpXG5cbiAgc2VsZWN0Tm9uZTogLT5cbiAgICBAcGlja2VkID0gbmV3IEFycmF5KEBjYXJkcy5sZW5ndGgpLmZpbGwoZmFsc2UpXG4gICAgcmV0dXJuXG5cbiAgc2V0OiAoY2FyZHMpIC0+XG4gICAgQGNhcmRzID0gY2FyZHMuc2xpY2UoMClcbiAgICBpZiBAcGlja2luZ1xuICAgICAgQHNlbGVjdE5vbmUoKVxuICAgIEBzeW5jQW5pbXMoKVxuICAgIEB3YXJwKClcblxuICBzeW5jQW5pbXM6IC0+XG4gICAgc2VlbiA9IHt9XG4gICAgZm9yIGNhcmQgaW4gQGNhcmRzXG4gICAgICBzZWVuW2NhcmRdKytcbiAgICAgIGlmIG5vdCBAYW5pbXNbY2FyZF1cbiAgICAgICAgQGFuaW1zW2NhcmRdID0gbmV3IEFuaW1hdGlvbiB7XG4gICAgICAgICAgc3BlZWQ6IEBjYXJkU3BlZWRcbiAgICAgICAgICB4OiAwXG4gICAgICAgICAgeTogMFxuICAgICAgICAgIHI6IDBcbiAgICAgICAgfVxuICAgIHRvUmVtb3ZlID0gW11cbiAgICBmb3IgY2FyZCxhbmltIG9mIEBhbmltc1xuICAgICAgaWYgbm90IHNlZW4uaGFzT3duUHJvcGVydHkoY2FyZClcbiAgICAgICAgdG9SZW1vdmUucHVzaCBjYXJkXG4gICAgZm9yIGNhcmQgaW4gdG9SZW1vdmVcbiAgICAgICMgQGdhbWUubG9nIFwicmVtb3ZpbmcgYW5pbSBmb3IgI3tjYXJkfVwiXG4gICAgICBkZWxldGUgQGFuaW1zW2NhcmRdXG5cbiAgICBAdXBkYXRlUG9zaXRpb25zKClcblxuICBjYWxjRHJhd25IYW5kOiAtPlxuICAgIGRyYXduSGFuZCA9IFtdXG4gICAgZm9yIGNhcmQsaSBpbiBAY2FyZHNcbiAgICAgIGlmIGkgIT0gQGRyYWdJbmRleFN0YXJ0XG4gICAgICAgIGRyYXduSGFuZC5wdXNoIGNhcmRcblxuICAgIGlmIEBkcmFnSW5kZXhDdXJyZW50ICE9IE5PX0NBUkRcbiAgICAgIGRyYXduSGFuZC5zcGxpY2UgQGRyYWdJbmRleEN1cnJlbnQsIDAsIEBjYXJkc1tAZHJhZ0luZGV4U3RhcnRdXG4gICAgcmV0dXJuIGRyYXduSGFuZFxuXG4gIHdhbnRzVG9QbGF5RHJhZ2dlZENhcmQ6IC0+XG4gICAgcmV0dXJuIGZhbHNlIGlmIEBkcmFnSW5kZXhTdGFydCA9PSBOT19DQVJEXG4gICAgcmV0dXJuIEBkcmFnWSA8IEBwbGF5Q2VpbGluZ1xuXG4gIHVwZGF0ZVBvc2l0aW9uczogLT5cbiAgICBkcmF3bkhhbmQgPSBAY2FsY0RyYXduSGFuZCgpXG4gICAgd2FudHNUb1BsYXkgPSBAd2FudHNUb1BsYXlEcmFnZ2VkQ2FyZCgpXG4gICAgZGVzaXJlZFJvdGF0aW9uID0gQ0FSRF9IT0xESU5HX1JPVF9PUkRFUlxuICAgIHBvc2l0aW9uQ291bnQgPSBkcmF3bkhhbmQubGVuZ3RoXG4gICAgaWYgd2FudHNUb1BsYXlcbiAgICAgIGRlc2lyZWRSb3RhdGlvbiA9IENBUkRfSE9MRElOR19ST1RfUExBWVxuICAgICAgcG9zaXRpb25Db3VudC0tXG4gICAgcG9zaXRpb25zID0gQGNhbGNQb3NpdGlvbnMocG9zaXRpb25Db3VudClcbiAgICBkcmF3SW5kZXggPSAwXG4gICAgZm9yIGNhcmQsaSBpbiBkcmF3bkhhbmRcbiAgICAgIGFuaW0gPSBAYW5pbXNbY2FyZF1cbiAgICAgIGlmIGkgPT0gQGRyYWdJbmRleEN1cnJlbnRcbiAgICAgICAgYW5pbS5yZXEueCA9IEBkcmFnWFxuICAgICAgICBhbmltLnJlcS55ID0gQGRyYWdZXG4gICAgICAgIGFuaW0ucmVxLnIgPSBkZXNpcmVkUm90YXRpb25cbiAgICAgICAgaWYgbm90IHdhbnRzVG9QbGF5XG4gICAgICAgICAgZHJhd0luZGV4KytcbiAgICAgIGVsc2VcbiAgICAgICAgcG9zID0gcG9zaXRpb25zW2RyYXdJbmRleF1cbiAgICAgICAgYW5pbS5yZXEueCA9IHBvcy54XG4gICAgICAgIGFuaW0ucmVxLnkgPSBwb3MueVxuICAgICAgICBhbmltLnJlcS5yID0gcG9zLnJcbiAgICAgICAgZHJhd0luZGV4KytcblxuICAjIGltbWVkaWF0ZWx5IHdhcnAgYWxsIGNhcmRzIHRvIHdoZXJlIHRoZXkgc2hvdWxkIGJlXG4gIHdhcnA6IC0+XG4gICAgZm9yIGNhcmQsYW5pbSBvZiBAYW5pbXNcbiAgICAgIGFuaW0ud2FycCgpXG5cbiAgIyByZW9yZGVyIHRoZSBoYW5kIGJhc2VkIG9uIHRoZSBkcmFnIGxvY2F0aW9uIG9mIHRoZSBoZWxkIGNhcmRcbiAgcmVvcmRlcjogLT5cbiAgICByZXR1cm4gaWYgQGRyYWdJbmRleFN0YXJ0ID09IE5PX0NBUkRcbiAgICByZXR1cm4gaWYgQGNhcmRzLmxlbmd0aCA8IDIgIyBub3RoaW5nIHRvIHJlb3JkZXJcbiAgICBwb3NpdGlvbnMgPSBAY2FsY1Bvc2l0aW9ucyhAY2FyZHMubGVuZ3RoKVxuICAgIGNsb3Nlc3RJbmRleCA9IDBcbiAgICBjbG9zZXN0RGlzdCA9IEBnYW1lLndpZHRoICogQGdhbWUuaGVpZ2h0ICMgc29tZXRoaW5nIGltcG9zc2libHkgbGFyZ2VcbiAgICBmb3IgcG9zLCBpbmRleCBpbiBwb3NpdGlvbnNcbiAgICAgIGRpc3QgPSBjYWxjRGlzdGFuY2VTcXVhcmVkKHBvcy54LCBwb3MueSwgQGRyYWdYLCBAZHJhZ1kpXG4gICAgICBpZiBjbG9zZXN0RGlzdCA+IGRpc3RcbiAgICAgICAgY2xvc2VzdERpc3QgPSBkaXN0XG4gICAgICAgIGNsb3Nlc3RJbmRleCA9IGluZGV4XG4gICAgQGRyYWdJbmRleEN1cnJlbnQgPSBjbG9zZXN0SW5kZXhcblxuICBzZWxlY3RlZENhcmRzOiAtPlxuICAgIGlmIG5vdCBAcGlja2luZ1xuICAgICAgcmV0dXJuIFtdXG5cbiAgICBjYXJkcyA9IFtdXG4gICAgZm9yIGNhcmQsIGkgaW4gQGNhcmRzXG4gICAgICBpZiBAcGlja2VkW2ldXG4gICAgICAgIGFuaW0gPSBAYW5pbXNbY2FyZF1cbiAgICAgICAgY2FyZHMucHVzaCB7XG4gICAgICAgICAgY2FyZDogY2FyZFxuICAgICAgICAgIHg6IGFuaW0uY3VyLnhcbiAgICAgICAgICB5OiBhbmltLmN1ci55XG4gICAgICAgICAgcjogYW5pbS5jdXIuclxuICAgICAgICAgIGluZGV4OiBpXG4gICAgICAgIH1cbiAgICByZXR1cm4gY2FyZHNcblxuICBkb3duOiAoQGRyYWdYLCBAZHJhZ1ksIGluZGV4KSAtPlxuICAgIEB1cChAZHJhZ1gsIEBkcmFnWSkgIyBlbnN1cmUgd2UgbGV0IGdvIG9mIHRoZSBwcmV2aW91cyBjYXJkIGluIGNhc2UgdGhlIGV2ZW50cyBhcmUgZHVtYlxuICAgIGlmIEBwaWNraW5nXG4gICAgICBAcGlja2VkW2luZGV4XSA9ICFAcGlja2VkW2luZGV4XVxuICAgICAgQHBpY2tQYWludCA9IEBwaWNrZWRbaW5kZXhdXG4gICAgICByZXR1cm5cbiAgICBAZ2FtZS5sb2cgXCJwaWNraW5nIHVwIGNhcmQgaW5kZXggI3tpbmRleH1cIlxuICAgIEBkcmFnSW5kZXhTdGFydCA9IGluZGV4XG4gICAgQGRyYWdJbmRleEN1cnJlbnQgPSBpbmRleFxuICAgIEB1cGRhdGVQb3NpdGlvbnMoKVxuXG4gIG1vdmU6IChAZHJhZ1gsIEBkcmFnWSkgLT5cbiAgICByZXR1cm4gaWYgQGRyYWdJbmRleFN0YXJ0ID09IE5PX0NBUkRcbiAgICAjQGdhbWUubG9nIFwiZHJhZ2dpbmcgYXJvdW5kIGNhcmQgaW5kZXggI3tAZHJhZ0luZGV4Q3VycmVudH1cIlxuICAgIEByZW9yZGVyKClcbiAgICBAdXBkYXRlUG9zaXRpb25zKClcblxuICB1cDogKEBkcmFnWCwgQGRyYWdZKSAtPlxuICAgIHJldHVybiBpZiBAZHJhZ0luZGV4U3RhcnQgPT0gTk9fQ0FSRFxuICAgIEByZW9yZGVyKClcbiAgICBpZiBAd2FudHNUb1BsYXlEcmFnZ2VkQ2FyZCgpXG4gICAgICBAZ2FtZS5sb2cgXCJ0cnlpbmcgdG8gcGxheSBhICN7QGNhcmRzW0BkcmFnSW5kZXhTdGFydF19IGZyb20gaW5kZXggI3tAZHJhZ0luZGV4U3RhcnR9XCJcbiAgICAgIGNhcmRJbmRleCA9IEBkcmFnSW5kZXhTdGFydFxuICAgICAgY2FyZCA9IEBjYXJkc1tjYXJkSW5kZXhdXG4gICAgICBhbmltID0gQGFuaW1zW2NhcmRdXG4gICAgICBAZHJhZ0luZGV4U3RhcnQgPSBOT19DQVJEXG4gICAgICBAZHJhZ0luZGV4Q3VycmVudCA9IE5PX0NBUkRcbiAgICAgIEBnYW1lLnBsYXkgW3tcbiAgICAgICAgY2FyZDogY2FyZFxuICAgICAgICB4OiBhbmltLmN1ci54XG4gICAgICAgIHk6IGFuaW0uY3VyLnlcbiAgICAgICAgcjogYW5pbS5jdXIuclxuICAgICAgICBpbmRleDogY2FyZEluZGV4XG4gICAgICB9XVxuICAgIGVsc2VcbiAgICAgIEBnYW1lLmxvZyBcInRyeWluZyB0byByZW9yZGVyICN7QGNhcmRzW0BkcmFnSW5kZXhTdGFydF19IGludG8gaW5kZXggI3tAZHJhZ0luZGV4Q3VycmVudH1cIlxuICAgICAgQGNhcmRzID0gQGNhbGNEcmF3bkhhbmQoKSAjIGlzIHRoaXMgcmlnaHQ/XG5cbiAgICBAZHJhZ0luZGV4U3RhcnQgPSBOT19DQVJEXG4gICAgQGRyYWdJbmRleEN1cnJlbnQgPSBOT19DQVJEXG4gICAgQHVwZGF0ZVBvc2l0aW9ucygpXG5cbiAgdXBkYXRlOiAoZHQpIC0+XG4gICAgdXBkYXRlZCA9IGZhbHNlXG4gICAgZm9yIGNhcmQsYW5pbSBvZiBAYW5pbXNcbiAgICAgIGlmIGFuaW0udXBkYXRlKGR0KVxuICAgICAgICB1cGRhdGVkID0gdHJ1ZVxuICAgIHJldHVybiB1cGRhdGVkXG5cbiAgcmVuZGVyOiAtPlxuICAgIHJldHVybiBpZiBAY2FyZHMubGVuZ3RoID09IDBcbiAgICBkcmF3bkhhbmQgPSBAY2FsY0RyYXduSGFuZCgpXG4gICAgZm9yIHYsIGluZGV4IGluIGRyYXduSGFuZFxuICAgICAgY29udGludWUgaWYgdiA9PSBOT19DQVJEXG4gICAgICBhbmltID0gQGFuaW1zW3ZdXG4gICAgICBkbyAoYW5pbSwgaW5kZXgpID0+XG4gICAgICAgIGlmIEBwaWNraW5nXG4gICAgICAgICAgaWYgQHBpY2tlZFtpbmRleF1cbiAgICAgICAgICAgIGhpZ2hsaWdodFN0YXRlID0gSGlnaGxpZ2h0LlNFTEVDVEVEXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgaGlnaGxpZ2h0U3RhdGUgPSBIaWdobGlnaHQuVU5TRUxFQ1RFRFxuICAgICAgICBlbHNlXG4gICAgICAgICAgaWYgQHdhbnRzVG9QbGF5RHJhZ2dlZENhcmQoKVxuICAgICAgICAgICAgaWYgKGluZGV4ID09IEBkcmFnSW5kZXhDdXJyZW50KVxuICAgICAgICAgICAgICBoaWdobGlnaHRTdGF0ZSA9IEhpZ2hsaWdodC5TRUxFQ1RFRFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBoaWdobGlnaHRTdGF0ZSA9IEhpZ2hsaWdodC5VTlNFTEVDVEVEXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgaGlnaGxpZ2h0U3RhdGUgPSBIaWdobGlnaHQuTk9ORVxuICAgICAgICBAcmVuZGVyQ2FyZCB2LCBhbmltLmN1ci54LCBhbmltLmN1ci55LCBhbmltLmN1ci5yLCAxLCBoaWdobGlnaHRTdGF0ZSwgKGNsaWNrWCwgY2xpY2tZKSA9PlxuICAgICAgICAgIEBkb3duKGNsaWNrWCwgY2xpY2tZLCBpbmRleClcblxuICByZW5kZXJDYXJkOiAodiwgeCwgeSwgcm90LCBzY2FsZSwgc2VsZWN0ZWQsIGNiKSAtPlxuICAgIHJvdCA9IDAgaWYgbm90IHJvdFxuICAgIHJhbmsgPSBNYXRoLmZsb29yKHYgLyA0KVxuICAgIHN1aXQgPSBNYXRoLmZsb29yKHYgJSA0KVxuXG4gICAgY29sID0gc3dpdGNoIHNlbGVjdGVkXG4gICAgICB3aGVuIEhpZ2hsaWdodC5OT05FXG4gICAgICAgIFsxLCAxLCAxXVxuICAgICAgd2hlbiBIaWdobGlnaHQuVU5TRUxFQ1RFRFxuICAgICAgICAjIFswLjMsIDAuMywgMC4zXVxuICAgICAgICBbMSwgMSwgMV1cbiAgICAgIHdoZW4gSGlnaGxpZ2h0LlNFTEVDVEVEXG4gICAgICAgIFswLjUsIDAuNSwgMC45XVxuICAgICAgd2hlbiBIaWdobGlnaHQuUElMRVxuICAgICAgICBbMC42LCAwLjYsIDAuNl1cblxuICAgIEBnYW1lLmRyYXdJbWFnZSBcImNhcmRzXCIsXG4gICAgQ0FSRF9JTUFHRV9PRkZfWCArIChDQVJEX0lNQUdFX0FEVl9YICogcmFuayksIENBUkRfSU1BR0VfT0ZGX1kgKyAoQ0FSRF9JTUFHRV9BRFZfWSAqIHN1aXQpLCBDQVJEX0lNQUdFX1csIENBUkRfSU1BR0VfSCxcbiAgICB4LCB5LCBAY2FyZFdpZHRoICogc2NhbGUsIEBjYXJkSGVpZ2h0ICogc2NhbGUsXG4gICAgcm90LCAwLjUsIDAuNSwgY29sWzBdLGNvbFsxXSxjb2xbMl0sMSwgY2JcblxuICBjYWxjUG9zaXRpb25zOiAoaGFuZFNpemUpIC0+XG4gICAgaWYgQHBvc2l0aW9uQ2FjaGUuaGFzT3duUHJvcGVydHkoaGFuZFNpemUpXG4gICAgICByZXR1cm4gQHBvc2l0aW9uQ2FjaGVbaGFuZFNpemVdXG4gICAgcmV0dXJuIFtdIGlmIGhhbmRTaXplID09IDBcblxuICAgIGFkdmFuY2UgPSBAaGFuZEFuZ2xlIC8gaGFuZFNpemVcbiAgICBpZiBhZHZhbmNlID4gQGhhbmRBbmdsZUFkdmFuY2VNYXhcbiAgICAgIGFkdmFuY2UgPSBAaGFuZEFuZ2xlQWR2YW5jZU1heFxuICAgIGFuZ2xlU3ByZWFkID0gYWR2YW5jZSAqIGhhbmRTaXplICAgICAgICAgICAgICAgICMgaG93IG11Y2ggb2YgdGhlIGFuZ2xlIHdlIHBsYW4gb24gdXNpbmdcbiAgICBhbmdsZUxlZnRvdmVyID0gQGhhbmRBbmdsZSAtIGFuZ2xlU3ByZWFkICAgICAgICAjIGFtb3VudCBvZiBhbmdsZSB3ZSdyZSBub3QgdXNpbmcsIGFuZCBuZWVkIHRvIHBhZCBzaWRlcyB3aXRoIGV2ZW5seVxuICAgIGN1cnJlbnRBbmdsZSA9IC0xICogKEBoYW5kQW5nbGUgLyAyKSAgICAgICAgICAgICMgbW92ZSB0byB0aGUgbGVmdCBzaWRlIG9mIG91ciBhbmdsZVxuICAgIGN1cnJlbnRBbmdsZSArPSBhbmdsZUxlZnRvdmVyIC8gMiAgICAgICAgICAgICAgICMgLi4uIGFuZCBhZHZhbmNlIHBhc3QgaGFsZiBvZiB0aGUgcGFkZGluZ1xuICAgIGN1cnJlbnRBbmdsZSArPSBhZHZhbmNlIC8gMiAgICAgICAgICAgICAgICAgICAgICMgLi4uIGFuZCBjZW50ZXIgdGhlIGNhcmRzIGluIHRoZSBhbmdsZVxuXG4gICAgcG9zaXRpb25zID0gW11cbiAgICBmb3IgaSBpbiBbMC4uLmhhbmRTaXplXVxuICAgICAgeCA9IEBoYW5kQ2VudGVyLnggLSBNYXRoLmNvcygoTWF0aC5QSSAvIDIpICsgY3VycmVudEFuZ2xlKSAqIEBoYW5kRGlzdGFuY2VcbiAgICAgIHkgPSBAaGFuZENlbnRlci55IC0gTWF0aC5zaW4oKE1hdGguUEkgLyAyKSArIGN1cnJlbnRBbmdsZSkgKiBAaGFuZERpc3RhbmNlXG4gICAgICBjdXJyZW50QW5nbGUgKz0gYWR2YW5jZVxuICAgICAgcG9zaXRpb25zLnB1c2gge1xuICAgICAgICB4OiB4XG4gICAgICAgIHk6IHlcbiAgICAgICAgcjogY3VycmVudEFuZ2xlIC0gYWR2YW5jZVxuICAgICAgfVxuXG4gICAgQHBvc2l0aW9uQ2FjaGVbaGFuZFNpemVdID0gcG9zaXRpb25zXG4gICAgcmV0dXJuIHBvc2l0aW9uc1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRcbiIsIkJ1dHRvbiA9IHJlcXVpcmUgJy4vQnV0dG9uJ1xuXG5jbGFzcyBNZW51XG4gIGNvbnN0cnVjdG9yOiAoQGdhbWUsIEB0aXRsZSwgQGJhY2tncm91bmQsIEBjb2xvciwgQGFjdGlvbnMpIC0+XG4gICAgQGJ1dHRvbnMgPSBbXVxuICAgIEBidXR0b25OYW1lcyA9IFtcImJ1dHRvbjBcIiwgXCJidXR0b24xXCJdXG5cbiAgICBidXR0b25TaXplID0gQGdhbWUuaGVpZ2h0IC8gMTVcbiAgICBAYnV0dG9uU3RhcnRZID0gQGdhbWUuaGVpZ2h0IC8gNVxuXG4gICAgc2xpY2UgPSAoQGdhbWUuaGVpZ2h0IC0gQGJ1dHRvblN0YXJ0WSkgLyAoQGFjdGlvbnMubGVuZ3RoICsgMSlcbiAgICBjdXJyWSA9IEBidXR0b25TdGFydFkgKyBzbGljZVxuICAgIGZvciBhY3Rpb24gaW4gQGFjdGlvbnNcbiAgICAgIGJ1dHRvbiA9IG5ldyBCdXR0b24oQGdhbWUsIEBidXR0b25OYW1lcywgQGdhbWUuZm9udCwgYnV0dG9uU2l6ZSwgQGdhbWUuY2VudGVyLngsIGN1cnJZLCBhY3Rpb24pXG4gICAgICBAYnV0dG9ucy5wdXNoIGJ1dHRvblxuICAgICAgY3VyclkgKz0gc2xpY2VcblxuICB1cGRhdGU6IChkdCkgLT5cbiAgICB1cGRhdGVkID0gZmFsc2VcbiAgICBmb3IgYnV0dG9uIGluIEBidXR0b25zXG4gICAgICBpZiBidXR0b24udXBkYXRlKGR0KVxuICAgICAgICB1cGRhdGVkID0gdHJ1ZVxuICAgIHJldHVybiB1cGRhdGVkXG5cbiAgcmVuZGVyOiAtPlxuICAgIEBnYW1lLnNwcml0ZVJlbmRlcmVyLnJlbmRlciBAYmFja2dyb3VuZCwgMCwgMCwgQGdhbWUud2lkdGgsIEBnYW1lLmhlaWdodCwgMCwgMCwgMCwgQGNvbG9yXG4gICAgQGdhbWUuZm9udFJlbmRlcmVyLnJlbmRlciBAZ2FtZS5mb250LCBAZ2FtZS5oZWlnaHQgLyAyNSwgXCJCdWlsZDogI3tAZ2FtZS52ZXJzaW9ufVwiLCAwLCBAZ2FtZS5oZWlnaHQsIDAsIDEsIEBnYW1lLmNvbG9ycy5saWdodGdyYXlcbiAgICB0aXRsZUhlaWdodCA9IEBnYW1lLmhlaWdodCAvIDhcbiAgICB0aXRsZU9mZnNldCA9IEBidXR0b25TdGFydFkgPj4gMVxuICAgIEBnYW1lLmZvbnRSZW5kZXJlci5yZW5kZXIgQGdhbWUuZm9udCwgdGl0bGVIZWlnaHQsIEB0aXRsZSwgQGdhbWUuY2VudGVyLngsIHRpdGxlT2Zmc2V0LCAwLjUsIDAuNSwgQGdhbWUuY29sb3JzLndoaXRlXG4gICAgZm9yIGJ1dHRvbiBpbiBAYnV0dG9uc1xuICAgICAgYnV0dG9uLnJlbmRlcigpXG5cbm1vZHVsZS5leHBvcnRzID0gTWVudVxuIiwiQW5pbWF0aW9uID0gcmVxdWlyZSAnLi9BbmltYXRpb24nXG5IYW5kID0gcmVxdWlyZSAnLi9IYW5kJ1xuXG5TRVRUTEVfTVMgPSAxMDAwXG5cbmNsYXNzIFBpbGVcbiAgY29uc3RydWN0b3I6IChAZ2FtZSwgQGhhbmQpIC0+XG4gICAgQHBsYXlJRCA9IC0xXG4gICAgQHBsYXlzID0gW11cbiAgICBAYW5pbXMgPSB7fVxuICAgIEBzZXR0bGVUaW1lciA9IDBcbiAgICBAdGhyb3duQ29sb3IgPSB7IHI6IDEsIGc6IDEsIGI6IDAsIGE6IDF9XG4gICAgQHNjYWxlID0gMC42XG5cbiAgICAjIDEuMCBpcyBub3QgbWVzc3kgYXQgYWxsLCBhcyB5b3UgYXBwcm9hY2ggMCBpdCBzdGFydHMgdG8gYWxsIHBpbGUgb24gb25lIGFub3RoZXJcbiAgICBtZXNzeSA9IDAuMlxuXG4gICAgQHBsYXlDYXJkU3BhY2luZyA9IDAuMVxuXG4gICAgY2VudGVyWCA9IEBnYW1lLmNlbnRlci54XG4gICAgY2VudGVyWSA9IEBnYW1lLmNlbnRlci55XG4gICAgb2Zmc2V0WCA9IEBoYW5kLmNhcmRXaWR0aCAqIG1lc3N5ICogQHNjYWxlXG4gICAgb2Zmc2V0WSA9IEBoYW5kLmNhcmRIYWxmSGVpZ2h0ICogbWVzc3kgKiBAc2NhbGVcbiAgICBAcGxheUxvY2F0aW9ucyA9IFtcbiAgICAgIHsgeDogY2VudGVyWCwgeTogY2VudGVyWSArIG9mZnNldFkgfSAjIGJvdHRvbVxuICAgICAgeyB4OiBjZW50ZXJYIC0gb2Zmc2V0WCwgeTogY2VudGVyWSB9ICMgbGVmdFxuICAgICAgeyB4OiBjZW50ZXJYLCB5OiBjZW50ZXJZIC0gb2Zmc2V0WSB9ICMgdG9wXG4gICAgICB7IHg6IGNlbnRlclggKyBvZmZzZXRYLCB5OiBjZW50ZXJZIH0gIyByaWdodFxuICAgIF1cbiAgICBAdGhyb3dMb2NhdGlvbnMgPSBbXG4gICAgICB7IHg6IGNlbnRlclgsIHk6IEBnYW1lLmhlaWdodCB9ICMgYm90dG9tXG4gICAgICB7IHg6IDAsIHk6IGNlbnRlclkgKyBvZmZzZXRZIH0gIyBsZWZ0XG4gICAgICB7IHg6IGNlbnRlclgsIHk6IDAgfSAjIHRvcFxuICAgICAgeyB4OiBAZ2FtZS53aWR0aCwgeTogY2VudGVyWSArIG9mZnNldFkgfSAjIHJpZ2h0XG4gICAgXVxuXG4gIHNldDogKHBpbGVJRCwgcGlsZSwgcGlsZVdobykgLT5cbiAgICBpZiBAcGxheUlEICE9IHBpbGVJRFxuICAgICAgQHBsYXlJRCA9IHBpbGVJRFxuICAgICAgQHBsYXlzLnB1c2gge1xuICAgICAgICBjYXJkczogcGlsZS5zbGljZSgwKVxuICAgICAgICB3aG86IHBpbGVXaG9cbiAgICAgIH1cbiAgICAgIEBzZXR0bGVUaW1lciA9IFNFVFRMRV9NU1xuXG4gICAgIyBpZiAoQHBsYXlJRCAhPSBwaWxlSUQpIGFuZCAodGhyb3duLmxlbmd0aCA+IDApXG4gICAgIyAgIEBwbGF5cyA9IHRocm93bi5zbGljZSgwKSAjIHRoZSBwaWxlIGhhcyBiZWNvbWUgdGhlIHRocm93biwgc3Rhc2ggaXQgb2ZmIG9uZSBsYXN0IHRpbWVcbiAgICAjICAgQHBsYXlXaG8gPSB0aHJvd25XaG8uc2xpY2UoMClcbiAgICAjICAgQHBsYXlJRCA9IHBpbGVJRFxuICAgICMgICBAc2V0dGxlVGltZXIgPSBTRVRUTEVfTVNcblxuICAgICMgIyBkb24ndCBzdG9tcCB0aGUgcGlsZSB3ZSdyZSBkcmF3aW5nIHVudGlsIGl0IGlzIGRvbmUgc2V0dGxpbmcgYW5kIGNhbiBmbHkgb2ZmIHRoZSBzY3JlZW5cbiAgICAjIGlmIEBzZXR0bGVUaW1lciA9PSAwXG4gICAgIyAgIEBwbGF5cyA9IHBpbGUuc2xpY2UoMClcbiAgICAjICAgQHBsYXlXaG8gPSBwaWxlV2hvLnNsaWNlKDApXG4gICAgIyAgIEB0aHJvd24gPSB0aHJvd24uc2xpY2UoMClcbiAgICAjICAgQHRocm93bldobyA9IHRocm93bldoby5zbGljZSgwKVxuICAgICMgICBAdGhyb3duVGFrZXIgPSB0aHJvd25UYWtlclxuXG4gICAgQHN5bmNBbmltcygpXG5cbiAgaGludDogKGNhcmRzKSAtPlxuICAgIGZvciBjYXJkIGluIGNhcmRzXG4gICAgICBAYW5pbXNbY2FyZC5jYXJkXSA9IG5ldyBBbmltYXRpb24ge1xuICAgICAgICBzcGVlZDogQGhhbmQuY2FyZFNwZWVkXG4gICAgICAgIHg6IGNhcmQueFxuICAgICAgICB5OiBjYXJkLnlcbiAgICAgICAgcjogY2FyZC5yXG4gICAgICAgIHM6IDFcbiAgICAgIH1cblxuICBzeW5jQW5pbXM6IC0+XG4gICAgc2VlbiA9IHt9XG4gICAgbG9jYXRpb25zID0gQHRocm93TG9jYXRpb25zXG4gICAgZm9yIHBsYXkgaW4gQHBsYXlzXG4gICAgICBmb3IgY2FyZCwgaW5kZXggaW4gcGxheS5jYXJkc1xuICAgICAgICBzZWVuW2NhcmRdKytcbiAgICAgICAgaWYgbm90IEBhbmltc1tjYXJkXVxuICAgICAgICAgIHdobyA9IHBsYXkud2hvXG4gICAgICAgICAgbG9jYXRpb24gPSBsb2NhdGlvbnNbd2hvXVxuICAgICAgICAgIEBhbmltc1tjYXJkXSA9IG5ldyBBbmltYXRpb24ge1xuICAgICAgICAgICAgc3BlZWQ6IEBoYW5kLmNhcmRTcGVlZFxuICAgICAgICAgICAgeDogbG9jYXRpb24ueFxuICAgICAgICAgICAgeTogbG9jYXRpb24ueVxuICAgICAgICAgICAgcjogLTEgKiBNYXRoLlBJIC8gNFxuICAgICAgICAgICAgczogQHNjYWxlXG4gICAgICAgICAgfVxuXG4gICAgdG9SZW1vdmUgPSBbXVxuICAgIGZvciBjYXJkLGFuaW0gb2YgQGFuaW1zXG4gICAgICBpZiBub3Qgc2Vlbi5oYXNPd25Qcm9wZXJ0eShjYXJkKVxuICAgICAgICB0b1JlbW92ZS5wdXNoIGNhcmRcbiAgICBmb3IgY2FyZCBpbiB0b1JlbW92ZVxuICAgICAgIyBAZ2FtZS5sb2cgXCJyZW1vdmluZyBhbmltIGZvciAje2NhcmR9XCJcbiAgICAgIGRlbGV0ZSBAYW5pbXNbY2FyZF1cblxuICAgIEB1cGRhdGVQb3NpdGlvbnMoKVxuXG4gIHVwZGF0ZVBvc2l0aW9uczogLT5cbiAgICBsb2NhdGlvbnMgPSBAcGxheUxvY2F0aW9uc1xuICAgIGZvciBwbGF5LCBwbGF5SW5kZXggaW4gQHBsYXlzXG4gICAgICBmb3IgdiwgaW5kZXggaW4gcGxheS5jYXJkc1xuICAgICAgICBhbmltID0gQGFuaW1zW3ZdXG4gICAgICAgIGxvYyA9IHBsYXkud2hvXG4gICAgICAgIGFuaW0ucmVxLnggPSBsb2NhdGlvbnNbbG9jXS54ICsgKGluZGV4ICogQGhhbmQuY2FyZFdpZHRoICogQHBsYXlDYXJkU3BhY2luZylcbiAgICAgICAgYW5pbS5yZXEueSA9IGxvY2F0aW9uc1tsb2NdLnlcbiAgICAgICAgYW5pbS5yZXEuciA9IDAuMiAqIE1hdGguY29zKHBsYXlJbmRleCAvIDAuMSlcbiAgICAgICAgYW5pbS5yZXEucyA9IEBzY2FsZVxuXG4gIHJlYWR5Rm9yTmV4dFRyaWNrOiAtPlxuICAgIHJldHVybiAoQHNldHRsZVRpbWVyID09IDApXG5cbiAgdXBkYXRlOiAoZHQpIC0+XG4gICAgdXBkYXRlZCA9IGZhbHNlXG5cbiAgICBpZiBAc2V0dGxlVGltZXIgPiAwXG4gICAgICB1cGRhdGVkID0gdHJ1ZVxuICAgICAgQHNldHRsZVRpbWVyIC09IGR0XG4gICAgICBpZiBAc2V0dGxlVGltZXIgPCAwXG4gICAgICAgIEBzZXR0bGVUaW1lciA9IDBcblxuICAgIGZvciBjYXJkLGFuaW0gb2YgQGFuaW1zXG4gICAgICBpZiBhbmltLnVwZGF0ZShkdClcbiAgICAgICAgdXBkYXRlZCA9IHRydWVcblxuICAgIHJldHVybiB1cGRhdGVkXG5cbiAgIyB1c2VkIGJ5IHRoZSBnYW1lIG92ZXIgc2NyZWVuLiBJdCByZXR1cm5zIHRydWUgd2hlbiBuZWl0aGVyIHRoZSBwaWxlIG5vciB0aGUgbGFzdCB0aHJvd24gYXJlIG1vdmluZ1xuICByZXN0aW5nOiAtPlxuICAgIGZvciBjYXJkLGFuaW0gb2YgQGFuaW1zXG4gICAgICBpZiBhbmltLmFuaW1hdGluZygpXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIGlmIEBzZXR0bGVUaW1lciA+IDBcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIHJldHVybiB0cnVlXG5cbiAgcmVuZGVyOiAtPlxuICAgIGZvciBwbGF5LCBwbGF5SW5kZXggaW4gQHBsYXlzXG4gICAgICBoaWdobGlnaHQgPSBIYW5kLkhpZ2hsaWdodC5QSUxFXG4gICAgICBpZiBwbGF5SW5kZXggPT0gKEBwbGF5cy5sZW5ndGggLSAxKVxuICAgICAgICBoaWdobGlnaHQgPSBIYW5kLkhpZ2hsaWdodC5OT05FXG4gICAgICBmb3IgdiwgaW5kZXggaW4gcGxheS5jYXJkc1xuICAgICAgICBhbmltID0gQGFuaW1zW3ZdXG4gICAgICAgIEBoYW5kLnJlbmRlckNhcmQgdiwgYW5pbS5jdXIueCwgYW5pbS5jdXIueSwgYW5pbS5jdXIuciwgYW5pbS5jdXIucywgaGlnaGxpZ2h0XG5cbm1vZHVsZS5leHBvcnRzID0gUGlsZVxuIiwiY2xhc3MgU3ByaXRlUmVuZGVyZXJcbiAgY29uc3RydWN0b3I6IChAZ2FtZSkgLT5cbiAgICBAc3ByaXRlcyA9XG4gICAgICAjIGdlbmVyaWMgc3ByaXRlc1xuICAgICAgc29saWQ6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogIDU1LCB5OiA3MjMsIHc6ICAxMCwgaDogIDEwIH1cbiAgICAgIHBhdXNlOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDYwMiwgeTogNzA3LCB3OiAxMjIsIGg6IDEyNSB9XG4gICAgICBidXR0b24wOiAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAxNDAsIHk6IDc3NywgdzogNDIyLCBoOiAgNjUgfVxuICAgICAgYnV0dG9uMTogICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogMTQwLCB5OiA2OTgsIHc6IDQyMiwgaDogIDY1IH1cbiAgICAgIHBsdXMwOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDc0NSwgeTogNjY0LCB3OiAxMTYsIGg6IDExOCB9XG4gICAgICBwbHVzMTogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA3NDUsIHk6IDgyMCwgdzogMTE2LCBoOiAxMTggfVxuICAgICAgbWludXMwOiAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogODk1LCB5OiA2NjQsIHc6IDExNiwgaDogMTE4IH1cbiAgICAgIG1pbnVzMTogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDg5NSwgeTogODIwLCB3OiAxMTYsIGg6IDExOCB9XG4gICAgICBhcnJvd0w6ICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAgMzMsIHk6IDg1OCwgdzogMjA0LCBoOiAxNTYgfVxuICAgICAgYXJyb3dSOiAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogMjM5LCB5OiA4NTIsIHc6IDIwOCwgaDogMTU1IH1cbiAgICAgIHBpbGU6ICAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDUxMywgeTogODc1LCB3OiAxMjgsIGg6IDEyOCB9XG5cbiAgICAgICMgbWVudSBiYWNrZ3JvdW5kc1xuICAgICAgbWFpbm1lbnU6ICB7IHRleHR1cmU6IFwibWFpbm1lbnVcIiwgIHg6IDAsIHk6IDAsIHc6IDEyODAsIGg6IDcyMCB9XG4gICAgICBwYXVzZW1lbnU6IHsgdGV4dHVyZTogXCJwYXVzZW1lbnVcIiwgeDogMCwgeTogMCwgdzogMTI4MCwgaDogNzIwIH1cblxuICAgICAgIyBob3d0b1xuICAgICAgaG93dG8xOiAgICB7IHRleHR1cmU6IFwiaG93dG8xXCIsICB4OiAwLCB5OiAgMCwgdzogMTkyMCwgaDogMTA4MCB9XG4gICAgICBob3d0bzI6ICAgIHsgdGV4dHVyZTogXCJob3d0bzJcIiwgIHg6IDAsIHk6ICAwLCB3OiAxOTIwLCBoOiAxMDgwIH1cbiAgICAgIGhvd3RvMzogICAgeyB0ZXh0dXJlOiBcImhvd3RvM1wiLCAgeDogMCwgeTogIDAsIHc6IDE5MjAsIGg6IDEwODAgfVxuXG4gICAgICAjIGNoYXJhY3RlcnNcbiAgICAgIG1hcmlvOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6ICAyMCwgeTogICAwLCB3OiAxNTEsIGg6IDMwOCB9XG4gICAgICBsdWlnaTogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAxNzEsIHk6ICAgMCwgdzogMTUxLCBoOiAzMDggfVxuICAgICAgcGVhY2g6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogMzM1LCB5OiAgIDAsIHc6IDE2NCwgaDogMzA4IH1cbiAgICAgIGRhaXN5OiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDUwNCwgeTogICAwLCB3OiAxNjQsIGg6IDMwOCB9XG4gICAgICB5b3NoaTogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA2NjgsIHk6ICAgMCwgdzogMTgwLCBoOiAzMDggfVxuICAgICAgdG9hZDogICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogODQ5LCB5OiAgIDAsIHc6IDE1NywgaDogMzA4IH1cbiAgICAgIGJvd3NlcjogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6ICAxMSwgeTogMzIyLCB3OiAxNTEsIGg6IDMwOCB9XG4gICAgICBib3dzZXJqcjogIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAyMjUsIHk6IDMyMiwgdzogMTQ0LCBoOiAzMDggfVxuICAgICAga29vcGE6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogMzcyLCB5OiAzMjIsIHc6IDEyOCwgaDogMzA4IH1cbiAgICAgIHJvc2FsaW5hOiAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDUwMCwgeTogMzIyLCB3OiAxNzMsIGg6IDMwOCB9XG4gICAgICBzaHlndXk6ICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA2OTEsIHk6IDMyMiwgdzogMTU0LCBoOiAzMDggfVxuICAgICAgdG9hZGV0dGU6ICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogODQ3LCB5OiAzMjIsIHc6IDE1OCwgaDogMzA4IH1cblxuICBjYWxjV2lkdGg6IChzcHJpdGVOYW1lLCBoZWlnaHQpIC0+XG4gICAgc3ByaXRlID0gQHNwcml0ZXNbc3ByaXRlTmFtZV1cbiAgICByZXR1cm4gMSBpZiBub3Qgc3ByaXRlXG4gICAgcmV0dXJuIGhlaWdodCAqIHNwcml0ZS53IC8gc3ByaXRlLmhcblxuICByZW5kZXI6IChzcHJpdGVOYW1lLCBkeCwgZHksIGR3LCBkaCwgcm90LCBhbmNob3J4LCBhbmNob3J5LCBjb2xvciwgY2IpIC0+XG4gICAgc3ByaXRlID0gQHNwcml0ZXNbc3ByaXRlTmFtZV1cbiAgICByZXR1cm4gaWYgbm90IHNwcml0ZVxuICAgIGlmIChkdyA9PSAwKSBhbmQgKGRoID09IDApXG4gICAgICAjIHRoaXMgcHJvYmFibHkgc2hvdWxkbid0IGV2ZXIgYmUgdXNlZC5cbiAgICAgIGR3ID0gc3ByaXRlLnhcbiAgICAgIGRoID0gc3ByaXRlLnlcbiAgICBlbHNlIGlmIGR3ID09IDBcbiAgICAgIGR3ID0gZGggKiBzcHJpdGUudyAvIHNwcml0ZS5oXG4gICAgZWxzZSBpZiBkaCA9PSAwXG4gICAgICBkaCA9IGR3ICogc3ByaXRlLmggLyBzcHJpdGUud1xuICAgIEBnYW1lLmRyYXdJbWFnZSBzcHJpdGUudGV4dHVyZSwgc3ByaXRlLngsIHNwcml0ZS55LCBzcHJpdGUudywgc3ByaXRlLmgsIGR4LCBkeSwgZHcsIGRoLCByb3QsIGFuY2hvcngsIGFuY2hvcnksIGNvbG9yLnIsIGNvbG9yLmcsIGNvbG9yLmIsIGNvbG9yLmEsIGNiXG4gICAgcmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gU3ByaXRlUmVuZGVyZXJcbiIsIk1JTl9QTEFZRVJTID0gM1xuTUFYX0xPR19MSU5FUyA9IDdcbk9LID0gJ09LJ1xuXG5TdWl0ID1cbiAgTk9ORTogLTFcbiAgU1BBREVTOiAwXG4gIENMVUJTOiAxXG4gIERJQU1PTkRTOiAyXG4gIEhFQVJUUzogM1xuXG5TdWl0TmFtZSA9IFsnU3BhZGVzJywgJ0NsdWJzJywgJ0RpYW1vbmRzJywgJ0hlYXJ0cyddXG5TaG9ydFN1aXROYW1lID0gWydTJywgJ0MnLCAnRCcsICdIJ11cbkdseXBoU3VpdE5hbWUgPSBbXCJcXHhjOFwiLCBcIlxceGM5XCIsIFwiXFx4Y2FcIiwgXCJcXHhjYlwiXVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBBSSBOYW1lIEdlbmVyYXRvclxuXG5haUNoYXJhY3Rlckxpc3QgPSBbXG4gIHsgaWQ6IFwibWFyaW9cIiwgICAgbmFtZTogXCJNYXJpb1wiLCAgICAgIHNwcml0ZTogXCJtYXJpb1wiLCAgICBicmFpbjogXCJub3JtYWxcIiB9XG4gIHsgaWQ6IFwibHVpZ2lcIiwgICAgbmFtZTogXCJMdWlnaVwiLCAgICAgIHNwcml0ZTogXCJsdWlnaVwiLCAgICBicmFpbjogXCJub3JtYWxcIiB9XG4gIHsgaWQ6IFwicGVhY2hcIiwgICAgbmFtZTogXCJQZWFjaFwiLCAgICAgIHNwcml0ZTogXCJwZWFjaFwiLCAgICBicmFpbjogXCJub3JtYWxcIiB9XG4gIHsgaWQ6IFwiZGFpc3lcIiwgICAgbmFtZTogXCJEYWlzeVwiLCAgICAgIHNwcml0ZTogXCJkYWlzeVwiLCAgICBicmFpbjogXCJub3JtYWxcIiB9XG4gIHsgaWQ6IFwieW9zaGlcIiwgICAgbmFtZTogXCJZb3NoaVwiLCAgICAgIHNwcml0ZTogXCJ5b3NoaVwiLCAgICBicmFpbjogXCJub3JtYWxcIiB9XG4gIHsgaWQ6IFwidG9hZFwiLCAgICAgbmFtZTogXCJUb2FkXCIsICAgICAgIHNwcml0ZTogXCJ0b2FkXCIsICAgICBicmFpbjogXCJub3JtYWxcIiB9XG4gIHsgaWQ6IFwiYm93c2VyXCIsICAgbmFtZTogXCJCb3dzZXJcIiwgICAgIHNwcml0ZTogXCJib3dzZXJcIiwgICBicmFpbjogXCJub3JtYWxcIiB9XG4gIHsgaWQ6IFwiYm93c2VyanJcIiwgbmFtZTogXCJCb3dzZXIgSnJcIiwgIHNwcml0ZTogXCJib3dzZXJqclwiLCBicmFpbjogXCJub3JtYWxcIiB9XG4gIHsgaWQ6IFwia29vcGFcIiwgICAgbmFtZTogXCJLb29wYVwiLCAgICAgIHNwcml0ZTogXCJrb29wYVwiLCAgICBicmFpbjogXCJub3JtYWxcIiB9XG4gIHsgaWQ6IFwicm9zYWxpbmFcIiwgbmFtZTogXCJSb3NhbGluYVwiLCAgIHNwcml0ZTogXCJyb3NhbGluYVwiLCBicmFpbjogXCJub3JtYWxcIiB9XG4gIHsgaWQ6IFwic2h5Z3V5XCIsICAgbmFtZTogXCJTaHlndXlcIiwgICAgIHNwcml0ZTogXCJzaHlndXlcIiwgICBicmFpbjogXCJub3JtYWxcIiB9XG4gIHsgaWQ6IFwidG9hZGV0dGVcIiwgbmFtZTogXCJUb2FkZXR0ZVwiLCAgIHNwcml0ZTogXCJ0b2FkZXR0ZVwiLCBicmFpbjogXCJub3JtYWxcIiB9XG5dXG5cbmFpQ2hhcmFjdGVycyA9IHt9XG5mb3IgY2hhcmFjdGVyIGluIGFpQ2hhcmFjdGVyTGlzdFxuICBhaUNoYXJhY3RlcnNbY2hhcmFjdGVyLmlkXSA9IGNoYXJhY3RlclxuXG5yYW5kb21DaGFyYWN0ZXIgPSAtPlxuICByID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogYWlDaGFyYWN0ZXJMaXN0Lmxlbmd0aClcbiAgcmV0dXJuIGFpQ2hhcmFjdGVyTGlzdFtyXVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBDYXJkXG5cbmNsYXNzIENhcmRcbiAgY29uc3RydWN0b3I6IChAcmF3KSAtPlxuICAgIEBzdWl0ICA9IE1hdGguZmxvb3IoQHJhdyAlIDQpXG4gICAgQHZhbHVlID0gTWF0aC5mbG9vcihAcmF3IC8gNClcbiAgICBAdmFsdWVOYW1lID0gc3dpdGNoIEB2YWx1ZVxuICAgICAgd2hlbiAgOCB0aGVuICdKJ1xuICAgICAgd2hlbiAgOSB0aGVuICdRJ1xuICAgICAgd2hlbiAxMCB0aGVuICdLJ1xuICAgICAgd2hlbiAxMSB0aGVuICdBJ1xuICAgICAgd2hlbiAxMiB0aGVuICcyJ1xuICAgICAgZWxzZVxuICAgICAgICBTdHJpbmcoQHZhbHVlICsgMylcbiAgICBAbmFtZSA9IEB2YWx1ZU5hbWUgKyBTaG9ydFN1aXROYW1lW0BzdWl0XVxuICAgICMgY29uc29sZS5sb2cgXCIje0ByYXd9IC0+ICN7QG5hbWV9XCJcbiAgZ2x5cGhlZE5hbWU6IC0+XG4gICAgcmV0dXJuIEB2YWx1ZU5hbWUgKyBHbHlwaFN1aXROYW1lW0BzdWl0XVxuXG5jYXJkc1RvU3RyaW5nID0gKHJhd0NhcmRzKSAtPlxuICBjYXJkTmFtZXMgPSBbXVxuICBmb3IgcmF3IGluIHJhd0NhcmRzXG4gICAgY2FyZCA9IG5ldyBDYXJkKHJhdylcbiAgICBjYXJkTmFtZXMucHVzaCBjYXJkLm5hbWVcbiAgcmV0dXJuIFwiWyBcIiArIGNhcmROYW1lcy5qb2luKCcsJykgKyBcIiBdXCJcblxucGxheVR5cGVUb1N0cmluZyA9ICh0eXBlKSAtPlxuICBpZiBtYXRjaGVzID0gdHlwZS5tYXRjaCgvXnJvcChcXGQrKS8pXG4gICAgcmV0dXJuIFwiUnVuIG9mICN7bWF0Y2hlc1sxXX0gUGFpcnNcIlxuICBpZiBtYXRjaGVzID0gdHlwZS5tYXRjaCgvXnJ1bihcXGQrKS8pXG4gICAgcmV0dXJuIFwiUnVuIG9mICN7bWF0Y2hlc1sxXX1cIlxuICBpZiBtYXRjaGVzID0gdHlwZS5tYXRjaCgvXmtpbmQoXFxkKykvKVxuICAgIGlmIG1hdGNoZXNbMV0gPT0gJzEnXG4gICAgICByZXR1cm4gJ1NpbmdsZSdcbiAgICBpZiBtYXRjaGVzWzFdID09ICcyJ1xuICAgICAgcmV0dXJuICdQYWlyJ1xuICAgIGlmIG1hdGNoZXNbMV0gPT0gJzMnXG4gICAgICByZXR1cm4gJ1RyaXBzJ1xuICAgIHJldHVybiAnUXVhZHMnXG4gIHJldHVybiB0eXBlXG5cbnBsYXlUb1N0cmluZyA9IChwbGF5KSAtPlxuICBoaWdoQ2FyZCA9IG5ldyBDYXJkKHBsYXkuaGlnaClcbiAgcmV0dXJuIFwiI3twbGF5VHlwZVRvU3RyaW5nKHBsYXkudHlwZSl9IC0gI3toaWdoQ2FyZC5nbHlwaGVkTmFtZSgpfVwiXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIERlY2tcblxuY2xhc3MgU2h1ZmZsZWREZWNrXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgICMgZGF0IGluc2lkZS1vdXQgc2h1ZmZsZSFcbiAgICBAY2FyZHMgPSBbIDAgXVxuICAgIGZvciBpIGluIFsxLi4uNTJdXG4gICAgICBqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogaSlcbiAgICAgIEBjYXJkcy5wdXNoKEBjYXJkc1tqXSlcbiAgICAgIEBjYXJkc1tqXSA9IGlcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgVGhpcnRlZW5cblxuY2xhc3MgVGhpcnRlZW5cbiAgY29uc3RydWN0b3I6IChAZ2FtZSwgcGFyYW1zKSAtPlxuICAgIHJldHVybiBpZiBub3QgcGFyYW1zXG5cbiAgICBpZiBwYXJhbXMuc3RhdGVcbiAgICAgIGZvciBrLHYgb2YgcGFyYW1zLnN0YXRlXG4gICAgICAgIGlmIHBhcmFtcy5zdGF0ZS5oYXNPd25Qcm9wZXJ0eShrKVxuICAgICAgICAgIHRoaXNba10gPSBwYXJhbXMuc3RhdGVba11cbiAgICBlbHNlXG4gICAgICAjIG5ldyBnYW1lXG4gICAgICBAbG9nID0gW11cbiAgICAgIEBzdHJlYWsgPSAwXG4gICAgICBAbGFzdFN0cmVhayA9IDBcblxuICAgICAgQHBsYXllcnMgPSBbXG4gICAgICAgIHsgaWQ6IDEsIG5hbWU6ICdQbGF5ZXInLCBpbmRleDogMCwgcGFzczogZmFsc2UgfVxuICAgICAgXVxuXG4gICAgICBmb3IgaSBpbiBbMS4uLjRdXG4gICAgICAgIEBhZGRBSSgpXG5cbiAgICAgIEBkZWFsKClcblxuICBkZWFsOiAocGFyYW1zKSAtPlxuICAgIGRlY2sgPSBuZXcgU2h1ZmZsZWREZWNrKClcbiAgICBmb3IgcGxheWVyLCBwbGF5ZXJJbmRleCBpbiBAcGxheWVyc1xuICAgICAgQGdhbWUubG9nIFwiZGVhbGluZyAxMyBjYXJkcyB0byBwbGF5ZXIgI3twbGF5ZXJJbmRleH1cIlxuXG4gICAgICBwbGF5ZXIuaGFuZCA9IFtdXG4gICAgICBmb3IgaiBpbiBbMC4uLjEzXVxuICAgICAgICByYXcgPSBkZWNrLmNhcmRzLnNoaWZ0KClcbiAgICAgICAgaWYgcmF3ID09IDBcbiAgICAgICAgICBAdHVybiA9IHBsYXllckluZGV4XG4gICAgICAgIHBsYXllci5oYW5kLnB1c2gocmF3KVxuXG4gICAgICBjb25zb2xlLmxvZyBcIkBnYW1lLm9wdGlvbnMuc29ydEluZGV4ICN7QGdhbWUub3B0aW9ucy5zb3J0SW5kZXh9XCJcbiAgICAgIGlmIChAZ2FtZS5vcHRpb25zLnNvcnRJbmRleCA9PSAwKSBvciBwbGF5ZXIuYWlcbiAgICAgICAgIyBOb3JtYWxcbiAgICAgICAgcGxheWVyLmhhbmQuc29ydCAoYSxiKSAtPiByZXR1cm4gYSAtIGJcbiAgICAgIGVsc2VcbiAgICAgICAgIyBSZXZlcnNlXG4gICAgICAgIHBsYXllci5oYW5kLnNvcnQgKGEsYikgLT4gcmV0dXJuIGIgLSBhXG5cbiAgICBAcGlsZSA9IFtdXG4gICAgQHBpbGVXaG8gPSAtMVxuICAgIEB0aHJvd0lEID0gMFxuICAgIEBjdXJyZW50UGxheSA9IG51bGxcbiAgICBAdW5wYXNzQWxsKClcblxuICAgIEBvdXRwdXQoJ0hhbmQgZGVhbHQsICcgKyBAcGxheWVyc1tAdHVybl0ubmFtZSArICcgcGxheXMgZmlyc3QnKVxuXG4gICAgcmV0dXJuIE9LXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyBUaGlydGVlbiBtZXRob2RzXG5cbiAgc2F2ZTogLT5cbiAgICBuYW1lcyA9IFwibG9nIHBsYXllcnMgdHVybiBwaWxlIHBpbGVXaG8gdGhyb3dJRCBjdXJyZW50UGxheSBzdHJlYWsgbGFzdFN0cmVha1wiLnNwbGl0KFwiIFwiKVxuICAgIHN0YXRlID0ge31cbiAgICBmb3IgbmFtZSBpbiBuYW1lc1xuICAgICAgc3RhdGVbbmFtZV0gPSB0aGlzW25hbWVdXG4gICAgcmV0dXJuIHN0YXRlXG5cbiAgb3V0cHV0OiAodGV4dCkgLT5cbiAgICBAbG9nLnB1c2ggdGV4dFxuICAgIGlmIEBsb2cubGVuZ3RoID4gTUFYX0xPR19MSU5FU1xuICAgICAgQGxvZy5zaGlmdCgpXG5cbiAgaGVhZGxpbmU6IC0+XG4gICAgaWYgQHdpbm5lcigpICE9IG51bGxcbiAgICAgIHJldHVybiBcIkdhbWUgT3ZlclwiXG5cbiAgICBpZiBAcGlsZS5sZW5ndGggPT0gMFxuICAgICAgcGxheVN0cmluZyA9IFwidGhyb3cgQW55dGhpbmcgd2l0aCB0aGUgM1xceGM4XCJcbiAgICBlbHNlXG4gICAgICBpZiBAY3VycmVudFBsYXlcbiAgICAgICAgcGxheVN0cmluZyA9IFwiYmVhdCBcIiArIHBsYXlUb1N0cmluZyhAY3VycmVudFBsYXkpXG4gICAgICBlbHNlXG4gICAgICAgIHBsYXlTdHJpbmcgPSBcInRocm93IEFueXRoaW5nXCJcblxuICAgIGN1cnJlbnRQbGF5ZXIgPSBAY3VycmVudFBsYXllcigpXG4gICAgaGVhZGxpbmUgPSBcIiN7Y3VycmVudFBsYXllci5uYW1lfSB0byAje3BsYXlTdHJpbmd9XCJcbiAgICByZXR1cm4gaGVhZGxpbmVcblxuICBmaW5kUGxheWVyOiAoaWQpIC0+XG4gICAgZm9yIHBsYXllciBpbiBAcGxheWVyc1xuICAgICAgaWYgcGxheWVyLmlkID09IGlkXG4gICAgICAgIHJldHVybiBwbGF5ZXJcbiAgICByZXR1cm4gdW5kZWZpbmVkXG5cbiAgY3VycmVudFBsYXllcjogLT5cbiAgICByZXR1cm4gQHBsYXllcnNbQHR1cm5dXG5cbiAgZXZlcnlvbmVQYXNzZWQ6IC0+XG4gICAgZm9yIHBsYXllciwgcGxheWVySW5kZXggaW4gQHBsYXllcnNcbiAgICAgIGlmIHBsYXllckluZGV4ID09IEB0dXJuXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICBpZiBub3QgcGxheWVyLnBhc3NcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgcmV0dXJuIHRydWVcblxuICBwbGF5ZXJBZnRlcjogKGluZGV4KSAtPlxuICAgIHJldHVybiAoaW5kZXggKyAxKSAlIEBwbGF5ZXJzLmxlbmd0aFxuXG4gIGFkZFBsYXllcjogKHBsYXllcikgLT5cbiAgICBpZiBub3QgcGxheWVyLmFpXG4gICAgICBwbGF5ZXIuYWkgPSBmYWxzZVxuXG4gICAgQHBsYXllcnMucHVzaCBwbGF5ZXJcbiAgICBwbGF5ZXIuaW5kZXggPSBAcGxheWVycy5sZW5ndGggLSAxXG4gICAgQG91dHB1dChwbGF5ZXIubmFtZSArIFwiIGpvaW5zIHRoZSBnYW1lXCIpXG5cbiAgbmFtZVByZXNlbnQ6IChuYW1lKSAtPlxuICAgIGZvciBwbGF5ZXIgaW4gQHBsYXllcnNcbiAgICAgIGlmIHBsYXllci5uYW1lID09IG5hbWVcbiAgICAgICAgcmV0dXJuIHRydWVcblxuICAgIHJldHVybiBmYWxzZVxuXG4gIGFkZEFJOiAtPlxuICAgIGxvb3BcbiAgICAgIGNoYXJhY3RlciA9IHJhbmRvbUNoYXJhY3RlcigpXG4gICAgICBpZiBub3QgQG5hbWVQcmVzZW50KGNoYXJhY3Rlci5uYW1lKVxuICAgICAgICBicmVha1xuXG4gICAgYWkgPVxuICAgICAgY2hhcklEOiBjaGFyYWN0ZXIuaWRcbiAgICAgIG5hbWU6IGNoYXJhY3Rlci5uYW1lXG4gICAgICBpZDogJ2FpJyArIFN0cmluZyhAcGxheWVycy5sZW5ndGgpXG4gICAgICBwYXNzOiBmYWxzZVxuICAgICAgYWk6IHRydWVcblxuICAgIEBhZGRQbGF5ZXIoYWkpXG5cbiAgICBAZ2FtZS5sb2coXCJhZGRlZCBBSSBwbGF5ZXJcIilcbiAgICByZXR1cm4gT0tcblxuICB1cGRhdGVQbGF5ZXJIYW5kOiAoY2FyZHMpIC0+XG4gICAgIyBUaGlzIG1haW50YWlucyB0aGUgcmVvcmdhbml6ZWQgb3JkZXIgb2YgdGhlIHBsYXllcidzIGhhbmRcbiAgICBAcGxheWVyc1swXS5oYW5kID0gY2FyZHMuc2xpY2UoMClcblxuICB3aW5uZXI6IC0+XG4gICAgZm9yIHBsYXllciwgaSBpbiBAcGxheWVyc1xuICAgICAgaWYgcGxheWVyLmhhbmQubGVuZ3RoID09IDBcbiAgICAgICAgcmV0dXJuIHBsYXllclxuICAgIHJldHVybiBudWxsXG5cbiAgaGFzQ2FyZDogKGhhbmQsIHJhd0NhcmQpIC0+XG4gICAgZm9yIHJhdyBpbiBoYW5kXG4gICAgICBpZiByYXcgPT0gcmF3Q2FyZFxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIHJldHVybiBmYWxzZVxuXG4gIGhhc0NhcmRzOiAoaGFuZCwgcmF3Q2FyZHMpIC0+XG4gICAgZm9yIHJhdyBpbiByYXdDYXJkc1xuICAgICAgaWYgbm90IEBoYXNDYXJkKGhhbmQsIHJhdylcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgcmV0dXJuIHRydWVcblxuICByZW1vdmVDYXJkczogKGhhbmQsIHJhd0NhcmRzKSAtPlxuICAgIG5ld0hhbmQgPSBbXVxuICAgIGZvciBjYXJkIGluIGhhbmRcbiAgICAgIGtlZXBNZSA9IHRydWVcbiAgICAgIGZvciByYXcgaW4gcmF3Q2FyZHNcbiAgICAgICAgaWYgY2FyZCA9PSByYXdcbiAgICAgICAgICBrZWVwTWUgPSBmYWxzZVxuICAgICAgICAgIGJyZWFrXG4gICAgICBpZiBrZWVwTWVcbiAgICAgICAgbmV3SGFuZC5wdXNoIGNhcmRcbiAgICByZXR1cm4gbmV3SGFuZFxuXG4gIGNsYXNzaWZ5OiAocmF3Q2FyZHMpIC0+XG4gICAgY2FyZHMgPSByYXdDYXJkcy5tYXAgKHJhdykgLT4gbmV3IENhcmQocmF3KVxuICAgIGNhcmRzID0gY2FyZHMuc29ydCAoYSwgYikgLT4gcmV0dXJuIGEucmF3IC0gYi5yYXdcbiAgICBoaWdoZXN0UmF3ID0gY2FyZHNbY2FyZHMubGVuZ3RoIC0gMV0ucmF3XG5cbiAgICAjIGxvb2sgZm9yIGEgcnVuIG9mIHBhaXJzXG4gICAgaWYgKGNhcmRzLmxlbmd0aCA+PSA2KSBhbmQgKChjYXJkcy5sZW5ndGggJSAyKSA9PSAwKVxuICAgICAgZm91bmRSb3AgPSB0cnVlXG4gICAgICBmb3IgY2FyZCwgY2FyZEluZGV4IGluIGNhcmRzXG4gICAgICAgIGlmIGNhcmRJbmRleCA9PSAwXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgaWYgY2FyZC52YWx1ZSA9PSAxMlxuICAgICAgICAgICMgbm8gMnMgaW4gYSBydW5cbiAgICAgICAgICBmb3VuZFJvcCA9IGZhbHNlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgaWYgKGNhcmRJbmRleCAlIDIpID09IDFcbiAgICAgICAgICAjIG9kZCBjYXJkLCBtdXN0IG1hdGNoIGxhc3QgY2FyZCBleGFjdGx5XG4gICAgICAgICAgaWYgY2FyZC52YWx1ZSAhPSAoY2FyZHNbY2FyZEluZGV4IC0gMV0udmFsdWUpXG4gICAgICAgICAgICBmb3VuZFJvcCA9IGZhbHNlXG4gICAgICAgICAgICBicmVha1xuICAgICAgICBlbHNlXG4gICAgICAgICAgIyBldmVuIGNhcmQsIG11c3QgaW5jcmVtZW50XG4gICAgICAgICAgaWYgY2FyZC52YWx1ZSAhPSAoY2FyZHNbY2FyZEluZGV4IC0gMV0udmFsdWUgKyAxKVxuICAgICAgICAgICAgZm91bmRSb3AgPSBmYWxzZVxuICAgICAgICAgICAgYnJlYWtcblxuICAgICAgaWYgZm91bmRSb3BcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0eXBlOiAncm9wJyArIE1hdGguZmxvb3IoY2FyZHMubGVuZ3RoIC8gMilcbiAgICAgICAgICBoaWdoOiBoaWdoZXN0UmF3XG4gICAgICAgIH1cblxuICAgICMgbG9vayBmb3IgYSBydW5cbiAgICBpZiBjYXJkcy5sZW5ndGggPj0gM1xuICAgICAgZm91bmRSdW4gPSB0cnVlXG4gICAgICBmb3IgY2FyZCwgY2FyZEluZGV4IGluIGNhcmRzXG4gICAgICAgIGlmIGNhcmRJbmRleCA9PSAwXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgaWYgY2FyZC52YWx1ZSA9PSAxMlxuICAgICAgICAgICMgbm8gMnMgaW4gYSBydW5cbiAgICAgICAgICBmb3VuZFJ1biA9IGZhbHNlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgaWYgY2FyZC52YWx1ZSAhPSAoY2FyZHNbY2FyZEluZGV4IC0gMV0udmFsdWUgKyAxKVxuICAgICAgICAgIGZvdW5kUnVuID0gZmFsc2VcbiAgICAgICAgICBicmVha1xuXG4gICAgICBpZiBmb3VuZFJ1blxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHR5cGU6ICdydW4nICsgY2FyZHMubGVuZ3RoXG4gICAgICAgICAgaGlnaDogaGlnaGVzdFJhd1xuICAgICAgICB9XG5cbiAgICAjIGxvb2sgZm9yIFggb2YgYSBraW5kXG4gICAgcmVxVmFsdWUgPSBjYXJkc1swXS52YWx1ZVxuICAgIGZvciBjYXJkIGluIGNhcmRzXG4gICAgICBpZiBjYXJkLnZhbHVlICE9IHJlcVZhbHVlXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgdHlwZSA9ICdraW5kJyArIGNhcmRzLmxlbmd0aFxuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiB0eXBlXG4gICAgICBoaWdoOiBoaWdoZXN0UmF3XG4gICAgfVxuXG4gIGhhbmRIYXMzUzogKGhhbmQpIC0+XG4gICAgZm9yIHJhdyBpbiBoYW5kXG4gICAgICBpZiByYXcgPT0gMFxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIHJldHVybiBmYWxzZVxuXG4gIGNhblBhc3M6IChwYXJhbXMpIC0+XG4gICAgaWYgQHdpbm5lcigpICE9IG51bGxcbiAgICAgIHJldHVybiAnZ2FtZU92ZXInXG5cbiAgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxuICAgIGlmIHBhcmFtcy5pZCAhPSBjdXJyZW50UGxheWVyLmlkXG4gICAgICByZXR1cm4gJ25vdFlvdXJUdXJuJ1xuXG4gICAgaWYgQHBpbGUubGVuZ3RoID09IDBcbiAgICAgIHJldHVybiAnbXVzdFRocm93M1MnXG5cbiAgICBpZiBAZXZlcnlvbmVQYXNzZWQoKVxuICAgICAgcmV0dXJuICd0aHJvd0FueXRoaW5nJ1xuXG4gICAgcmV0dXJuIE9LXG5cbiAgY2FuUGxheTogKHBhcmFtcywgaW5jb21pbmdQbGF5LCBoYW5kSGFzM1MpIC0+XG4gICAgaWYgQHdpbm5lcigpICE9IG51bGxcbiAgICAgIHJldHVybiAnZ2FtZU92ZXInXG5cbiAgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxuICAgIGlmIHBhcmFtcy5pZCAhPSBjdXJyZW50UGxheWVyLmlkXG4gICAgICByZXR1cm4gJ25vdFlvdXJUdXJuJ1xuXG4gICAgaWYgaW5jb21pbmdQbGF5ID09IG51bGxcbiAgICAgIHJldHVybiAnaW52YWxpZFBsYXknXG5cbiAgICBpZiBAcGlsZS5sZW5ndGggPT0gMFxuICAgICAgaWYgbm90IGhhbmRIYXMzU1xuICAgICAgICByZXR1cm4gJ211c3RUaHJvdzNTJ1xuXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcbiAgICBpZiBjdXJyZW50UGxheWVyLnBhc3NcbiAgICAgIGlmIEBjdXJyZW50UGxheSBhbmQgQGNhbkJlQnJva2VuKEBjdXJyZW50UGxheSlcbiAgICAgICAgaWYgQGlzQnJlYWtlclR5cGUoaW5jb21pbmdQbGF5LnR5cGUpXG4gICAgICAgICAgcmV0dXJuIE9LXG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXR1cm4gJ211c3RCcmVha09yUGFzcydcbiAgICAgIHJldHVybiAnbXVzdFBhc3MnXG5cbiAgICBpZiBAY3VycmVudFBsYXkgPT0gbnVsbFxuICAgICAgcmV0dXJuIE9LXG5cbiAgICBpZiBAZXZlcnlvbmVQYXNzZWQoKVxuICAgICAgcmV0dXJuIE9LXG5cbiAgICBpZiBAY2FuQmVCcm9rZW4oQGN1cnJlbnRQbGF5KSBhbmQgQGlzQnJlYWtlclR5cGUoaW5jb21pbmdQbGF5LnR5cGUpXG4gICAgICAjIDIgYnJlYWtlciFcbiAgICAgIHJldHVybiBPS1xuXG4gICAgaWYgaW5jb21pbmdQbGF5LnR5cGUgIT0gQGN1cnJlbnRQbGF5LnR5cGVcbiAgICAgIHJldHVybiAnd3JvbmdQbGF5J1xuXG4gICAgaWYgaW5jb21pbmdQbGF5LmhpZ2ggPCBAY3VycmVudFBsYXkuaGlnaFxuICAgICAgcmV0dXJuICd0b29Mb3dQbGF5J1xuXG4gICAgcmV0dXJuIE9LXG5cbiAgcGxheTogKHBhcmFtcykgLT5cbiAgICBpbmNvbWluZ1BsYXkgPSBAY2xhc3NpZnkocGFyYW1zLmNhcmRzKVxuICAgIGNvbnNvbGUubG9nIFwiaW5jb21pbmdQbGF5XCIsIGluY29taW5nUGxheVxuXG4gICAgY29uc29sZS5sb2cgXCJzb21lb25lIGNhbGxpbmcgcGxheVwiLCBwYXJhbXNcbiAgICByZXQgPSBAY2FuUGxheShwYXJhbXMsIGluY29taW5nUGxheSwgQGhhbmRIYXMzUyhwYXJhbXMuY2FyZHMpKVxuICAgIGlmIHJldCAhPSBPS1xuICAgICAgcmV0dXJuIHJldFxuXG4gICAgIyBUT0RPOiBtYWtlIHByZXR0eSBuYW1lcyBiYXNlZCBvbiB0aGUgcGxheSwgYWRkIHBsYXkgdG8gaGVhZGxpbmVcbiAgICB2ZXJiID0gXCJ0aHJvd3M6XCJcbiAgICBpZiBAY3VycmVudFBsYXlcbiAgICAgIGlmIEBjYW5CZUJyb2tlbihAY3VycmVudFBsYXkpIGFuZCBAaXNCcmVha2VyVHlwZShpbmNvbWluZ1BsYXkudHlwZSlcbiAgICAgICAgIyAyIGJyZWFrZXIhXG4gICAgICAgIEB1bnBhc3NBbGwoKVxuICAgICAgICB2ZXJiID0gXCJicmVha3MgMjpcIlxuICAgICAgZWxzZSBpZiAoaW5jb21pbmdQbGF5LnR5cGUgIT0gQGN1cnJlbnRQbGF5LnR5cGUpIG9yIChpbmNvbWluZ1BsYXkuaGlnaCA8IEBjdXJyZW50UGxheS5oaWdoKVxuICAgICAgICAjIE5ldyBwbGF5IVxuICAgICAgICBAdW5wYXNzQWxsKClcbiAgICAgICAgdmVyYiA9IFwidGhyb3dzIG5ldzpcIlxuICAgIGVsc2VcbiAgICAgIHZlcmIgPSBcImJlZ2luczpcIlxuXG4gICAgQGN1cnJlbnRQbGF5ID0gaW5jb21pbmdQbGF5XG5cbiAgICBAdGhyb3dJRCArPSAxXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcbiAgICBjdXJyZW50UGxheWVyLmhhbmQgPSBAcmVtb3ZlQ2FyZHMoY3VycmVudFBsYXllci5oYW5kLCBwYXJhbXMuY2FyZHMpXG5cbiAgICBAb3V0cHV0KFwiI3tjdXJyZW50UGxheWVyLm5hbWV9ICN7dmVyYn0gI3twbGF5VG9TdHJpbmcoaW5jb21pbmdQbGF5KX1cIilcblxuICAgIGlmIGN1cnJlbnRQbGF5ZXIuaGFuZC5sZW5ndGggPT0gMFxuICAgICAgQG91dHB1dChcIiN7Y3VycmVudFBsYXllci5uYW1lfSB3aW5zIVwiKVxuICAgICAgaWYgY3VycmVudFBsYXllci5haVxuICAgICAgICBAbGFzdFN0cmVhayA9IEBzdHJlYWtcbiAgICAgICAgQHN0cmVhayA9IDBcbiAgICAgIGVsc2VcbiAgICAgICAgQHN0cmVhayArPSAxXG4gICAgICAgIEBsYXN0U3RyZWFrID0gQHN0cmVha1xuXG4gICAgQHBpbGUgPSBwYXJhbXMuY2FyZHMuc2xpY2UoMClcbiAgICBAcGlsZVdobyA9IEB0dXJuXG5cbiAgICBAdHVybiA9IEBwbGF5ZXJBZnRlcihAdHVybilcbiAgICByZXR1cm4gT0tcblxuICB1bnBhc3NBbGw6IC0+XG4gICAgZm9yIHBsYXllciBpbiBAcGxheWVyc1xuICAgICAgcGxheWVyLnBhc3MgPSBmYWxzZVxuICAgIHJldHVyblxuXG4gIHBhc3M6IChwYXJhbXMpIC0+XG4gICAgcmV0ID0gQGNhblBhc3MocGFyYW1zKVxuICAgIGlmIHJldCAhPSBPS1xuICAgICAgcmV0dXJuIHJldFxuXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcbiAgICBpZiBjdXJyZW50UGxheWVyLnBhc3NcbiAgICAgIEBvdXRwdXQoXCIje2N1cnJlbnRQbGF5ZXIubmFtZX0gYXV0by1wYXNzZXNcIilcbiAgICBlbHNlXG4gICAgICBAb3V0cHV0KFwiI3tjdXJyZW50UGxheWVyLm5hbWV9IHBhc3Nlc1wiKVxuICAgIGN1cnJlbnRQbGF5ZXIucGFzcyA9IHRydWVcbiAgICBAdHVybiA9IEBwbGF5ZXJBZnRlcihAdHVybilcbiAgICByZXR1cm4gT0tcblxuICBhaVBsYXk6IChjdXJyZW50UGxheWVyLCBjYXJkcykgLT5cbiAgICByZXR1cm4gQHBsYXkoeydpZCc6Y3VycmVudFBsYXllci5pZCwgJ2NhcmRzJzpjYXJkc30pXG5cbiAgYWlQYXNzOiAoY3VycmVudFBsYXllcikgLT5cbiAgICByZXR1cm4gQHBhc3MoeydpZCc6Y3VycmVudFBsYXllci5pZH0pXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyBBSVxuXG4gICMgR2VuZXJpYyBsb2dnaW5nIGZ1bmN0aW9uOyBwcmVwZW5kcyBjdXJyZW50IEFJIHBsYXllcidzIGd1dHMgYmVmb3JlIHByaW50aW5nIHRleHRcbiAgYWlMb2c6ICh0ZXh0KSAtPlxuICAgIGN1cnJlbnRQbGF5ZXIgPSBAY3VycmVudFBsYXllcigpXG4gICAgaWYgbm90IGN1cnJlbnRQbGF5ZXIuYWlcbiAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgY2hhcmFjdGVyID0gYWlDaGFyYWN0ZXJzW2N1cnJlbnRQbGF5ZXIuY2hhcklEXVxuICAgIEBnYW1lLmxvZygnQUlbJytjdXJyZW50UGxheWVyLm5hbWUrJyAnK2NoYXJhY3Rlci5icmFpbisnXTogaGFuZDonK2NhcmRzVG9TdHJpbmcoY3VycmVudFBsYXllci5oYW5kKSsnIHBpbGU6JytjYXJkc1RvU3RyaW5nKEBwaWxlKSsnICcrdGV4dClcblxuICAjIERldGVjdHMgaWYgdGhlIGN1cnJlbnQgcGxheWVyIGlzIEFJIGR1cmluZyBhIEJJRCBvciBUUklDSyBwaGFzZSBhbmQgYWN0cyBhY2NvcmRpbmcgdG8gdGhlaXIgJ2JyYWluJ1xuICBhaVRpY2s6IC0+XG4gICAgaWYgQHdpbm5lcigpICE9IG51bGxcbiAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcbiAgICBpZiBub3QgY3VycmVudFBsYXllci5haVxuICAgICAgaWYgQGN1cnJlbnRQbGF5IGFuZCAoQGN1cnJlbnRQbGF5LnR5cGUgPT0gJ2tpbmQxJykgYW5kIEBoYXNCcmVha2VyKGN1cnJlbnRQbGF5ZXIuaGFuZClcbiAgICAgICAgIyBkbyBub3RoaW5nLCBwbGF5ZXIgY2FuIGRyb3AgYSBicmVha2VyXG4gICAgICBlbHNlIGlmIGN1cnJlbnRQbGF5ZXIucGFzc1xuICAgICAgICBAYWlMb2coXCJhdXRvcGFzc2luZyBmb3IgcGxheWVyXCIpXG4gICAgICAgIEBhaVBhc3MoY3VycmVudFBsYXllcilcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgY2hhcmFjdGVyID0gYWlDaGFyYWN0ZXJzW2N1cnJlbnRQbGF5ZXIuY2hhcklEXVxuICAgIHJldCA9IEBicmFpbnNbY2hhcmFjdGVyLmJyYWluXS5wbGF5LmFwcGx5KHRoaXMsIFtjdXJyZW50UGxheWVyLCBAY3VycmVudFBsYXksIEBldmVyeW9uZVBhc3NlZCgpXSlcbiAgICBpZiByZXQgPT0gT0tcbiAgICAgIHJldHVybiB0cnVlXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgYWxDYWxjS2luZHM6IChoYW5kLCBwbGF5cywgbWF0Y2gycyA9IGZhbHNlKSAtPlxuICAgIGNhcmRzID0gaGFuZC5tYXAgKHJhdykgLT4gbmV3IENhcmQocmF3KVxuICAgIGNhcmRzID0gY2FyZHMuc29ydCAoYSwgYikgLT4gcmV0dXJuIGEucmF3IC0gYi5yYXdcbiAgICB2YWx1ZUFycmF5cyA9IFtdXG4gICAgZm9yIGkgaW4gWzAuLi4xM11cbiAgICAgIHZhbHVlQXJyYXlzLnB1c2ggW11cbiAgICBmb3IgY2FyZCBpbiBjYXJkc1xuICAgICAgdmFsdWVBcnJheXNbY2FyZC52YWx1ZV0ucHVzaChjYXJkKVxuXG4gICAgaGFuZCA9IFtdXG4gICAgZm9yIHZhbHVlQXJyYXksIHZhbHVlIGluIHZhbHVlQXJyYXlzXG4gICAgICBpZiAodmFsdWVBcnJheS5sZW5ndGggPiAxKSBhbmQgKG1hdGNoMnMgb3IgKHZhbHVlIDwgMTIpKVxuICAgICAgICBrZXkgPSBcImtpbmQje3ZhbHVlQXJyYXkubGVuZ3RofVwiXG4gICAgICAgIHBsYXlzW2tleV0gPz0gW11cbiAgICAgICAgcGxheXNba2V5XS5wdXNoIHZhbHVlQXJyYXkubWFwICh2KSAtPiB2LnJhd1xuICAgICAgZWxzZVxuICAgICAgICBmb3IgdiBpbiB2YWx1ZUFycmF5XG4gICAgICAgICAgaGFuZC5wdXNoIHYucmF3XG5cbiAgICByZXR1cm4gaGFuZFxuXG4gIGFpRmluZFJ1bnM6IChoYW5kLCBlYWNoU2l6ZSwgc2l6ZSkgLT5cbiAgICBydW5zID0gW11cblxuICAgIGNhcmRzID0gaGFuZC5tYXAgKHJhdykgLT4gbmV3IENhcmQocmF3KVxuICAgIGNhcmRzID0gY2FyZHMuc29ydCAoYSwgYikgLT4gcmV0dXJuIGEucmF3IC0gYi5yYXdcbiAgICB2YWx1ZUFycmF5cyA9IFtdXG4gICAgZm9yIGkgaW4gWzAuLi4xM11cbiAgICAgIHZhbHVlQXJyYXlzLnB1c2ggW11cbiAgICBmb3IgY2FyZCBpbiBjYXJkc1xuICAgICAgdmFsdWVBcnJheXNbY2FyZC52YWx1ZV0ucHVzaChjYXJkKVxuXG4gICAgbGFzdFN0YXJ0aW5nVmFsdWUgPSAxMiAtIHNpemVcbiAgICBmb3Igc3RhcnRpbmdWYWx1ZSBpbiBbMC4uLmxhc3RTdGFydGluZ1ZhbHVlXVxuICAgICAgcnVuRm91bmQgPSB0cnVlXG4gICAgICBmb3Igb2Zmc2V0IGluIFswLi4uc2l6ZV1cbiAgICAgICAgaWYgdmFsdWVBcnJheXNbc3RhcnRpbmdWYWx1ZStvZmZzZXRdLmxlbmd0aCA8IGVhY2hTaXplXG4gICAgICAgICAgcnVuRm91bmQgPSBmYWxzZVxuICAgICAgICAgIGJyZWFrXG4gICAgICBpZiBydW5Gb3VuZFxuICAgICAgICBydW4gPSBbXVxuICAgICAgICBmb3Igb2Zmc2V0IGluIFswLi4uc2l6ZV1cbiAgICAgICAgICBmb3IgZWFjaCBpbiBbMC4uLmVhY2hTaXplXVxuICAgICAgICAgICAgcnVuLnB1c2godmFsdWVBcnJheXNbc3RhcnRpbmdWYWx1ZStvZmZzZXRdLnBvcCgpLnJhdylcbiAgICAgICAgcnVucy5wdXNoIHJ1blxuXG4gICAgbGVmdG92ZXJzID0gW11cbiAgICBmb3IgdmFsdWVBcnJheSBpbiB2YWx1ZUFycmF5c1xuICAgICAgZm9yIGNhcmQgaW4gdmFsdWVBcnJheVxuICAgICAgICBsZWZ0b3ZlcnMucHVzaCBjYXJkLnJhd1xuXG4gICAgcmV0dXJuIFtydW5zLCBsZWZ0b3ZlcnNdXG5cbiAgYWlDYWxjUnVuczogKGhhbmQsIHBsYXlzLCBzbWFsbFJ1bnMpIC0+XG4gICAgaWYgc21hbGxSdW5zXG4gICAgICBzdGFydFNpemUgPSAzXG4gICAgICBlbmRTaXplID0gMTJcbiAgICAgIGJ5QW1vdW50ID0gMVxuICAgIGVsc2VcbiAgICAgIHN0YXJ0U2l6ZSA9IDEyXG4gICAgICBlbmRTaXplID0gM1xuICAgICAgYnlBbW91bnQgPSAtMVxuICAgIGZvciBydW5TaXplIGluIFtzdGFydFNpemUuLmVuZFNpemVdIGJ5IGJ5QW1vdW50XG4gICAgICBbcnVucywgbGVmdG92ZXJzXSA9IEBhaUZpbmRSdW5zKGhhbmQsIDEsIHJ1blNpemUpXG4gICAgICBpZiBydW5zLmxlbmd0aCA+IDBcbiAgICAgICAga2V5ID0gXCJydW4je3J1blNpemV9XCJcbiAgICAgICAgcGxheXNba2V5XSA9IHJ1bnNcbiAgICAgIGhhbmQgPSBsZWZ0b3ZlcnNcblxuICAgIHJldHVybiBoYW5kXG5cbiAgYWlDYWxjUm9wczogKGhhbmQsIHBsYXlzKSAtPlxuICAgIHN0YXJ0U2l6ZSA9IDNcbiAgICBlbmRTaXplID0gNlxuICAgIGZvciBydW5TaXplIGluIFtzdGFydFNpemUuLmVuZFNpemVdXG4gICAgICBbcm9wcywgbGVmdG92ZXJzXSA9IEBhaUZpbmRSdW5zKGhhbmQsIDIsIHJ1blNpemUpXG4gICAgICBpZiByb3BzLmxlbmd0aCA+IDBcbiAgICAgICAga2V5ID0gXCJyb3Aje3J1blNpemV9XCJcbiAgICAgICAgcGxheXNba2V5XSA9IHJvcHNcbiAgICAgIGhhbmQgPSBsZWZ0b3ZlcnNcblxuICAgIHJldHVybiBoYW5kXG5cbiAgYWlDYWxjUGxheXM6IChoYW5kLCBzdHJhdGVneSA9IHt9KSAtPlxuICAgIHBsYXlzID0ge31cblxuICAgICMgV2UgYWx3YXlzIHdhbnQgdG8gdXNlIHJvcHMgaWYgd2UgaGF2ZSBvbmVcbiAgICBpZiBzdHJhdGVneS5zZWVzUm9wc1xuICAgICAgaGFuZCA9IEBhaUNhbGNSb3BzKGhhbmQsIHBsYXlzKVxuXG4gICAgaWYgc3RyYXRlZ3kucHJlZmVyc1J1bnNcbiAgICAgIGhhbmQgPSBAYWlDYWxjUnVucyhoYW5kLCBwbGF5cywgc3RyYXRlZ3kuc21hbGxSdW5zKVxuICAgICAgaGFuZCA9IEBhbENhbGNLaW5kcyhoYW5kLCBwbGF5cywgc3RyYXRlZ3kubWF0Y2gycylcbiAgICBlbHNlXG4gICAgICBoYW5kID0gQGFsQ2FsY0tpbmRzKGhhbmQsIHBsYXlzLCBzdHJhdGVneS5tYXRjaDJzKVxuICAgICAgaGFuZCA9IEBhaUNhbGNSdW5zKGhhbmQsIHBsYXlzLCBzdHJhdGVneS5zbWFsbFJ1bnMpXG5cbiAgICBraW5kMSA9IGhhbmQubWFwICh2KSAtPiBbdl1cbiAgICBpZiBraW5kMS5sZW5ndGggPiAwXG4gICAgICBwbGF5cy5raW5kMSA9IGtpbmQxXG4gICAgcmV0dXJuIHBsYXlzXG5cbiAgbnVtYmVyT2ZTaW5nbGVzOiAocGxheXMpIC0+XG4gICAgaWYgbm90IHBsYXlzLmtpbmQxP1xuICAgICAgcmV0dXJuIDBcbiAgICBub25Ud29TaW5nbGVzID0gMFxuICAgIGZvciByYXcgaW4gcGxheXMua2luZDFcbiAgICAgIGlmIHJhdyA8IDQ4XG4gICAgICAgIG5vblR3b1NpbmdsZXMgKz0gMVxuICAgIHJldHVybiBub25Ud29TaW5nbGVzXG5cbiAgYnJlYWtlclBsYXlzOiAoaGFuZCkgLT5cbiAgICByZXR1cm4gQGFpQ2FsY1BsYXlzKGhhbmQsIHsgc2Vlc1JvcHM6IHRydWUsIHByZWZlcnNSdW5zOiBmYWxzZSB9KVxuXG4gIGlzQnJlYWtlclR5cGU6IChwbGF5VHlwZSkgLT5cbiAgICBpZiBwbGF5VHlwZS5tYXRjaCgvXnJvcC8pIG9yIHBsYXlUeXBlID09ICdraW5kNCdcbiAgICAgIHJldHVybiB0cnVlXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgY2FuQmVCcm9rZW46IChwbGF5KSAtPlxuICAgIGlmIHBsYXkudHlwZSAhPSAna2luZDEnXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICBjYXJkID0gbmV3IENhcmQocGxheS5oaWdoKVxuICAgIHJldHVybiAoY2FyZC52YWx1ZSA9PSAxMilcblxuICBoYXNCcmVha2VyOiAoaGFuZCkgLT5cbiAgICBwbGF5cyA9IEBicmVha2VyUGxheXMoaGFuZClcbiAgICBmb3IgcGxheVR5cGUsIHBsYXlsaXN0IG9mIHBsYXlzXG4gICAgICBpZiBAaXNCcmVha2VyVHlwZShwbGF5VHlwZSlcbiAgICAgICAgaWYgcGxheWxpc3QubGVuZ3RoID4gMFxuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgYWlDYWxjQmVzdFBsYXlzOiAoaGFuZCkgLT5cbiAgICBiZXN0UGxheXMgPSBudWxsXG4gICAgZm9yIGJpdHMgaW4gWzAuLi4xNl1cbiAgICAgIHN0cmF0ZWd5ID1cbiAgICAgICAgc21hbGxSdW5zOiAoYml0cyAmIDEpID09IDFcbiAgICAgICAgcHJlZmVyc1J1bnM6IChiaXRzICYgMikgPT0gMlxuICAgICAgICBtYXRjaDJzOiAoYml0cyAmIDQpID09IDRcbiAgICAgICAgc2Vlc1JvcHM6IChiaXRzICYgOCkgPT0gOFxuICAgICAgcGxheXMgPSBAYWlDYWxjUGxheXMoaGFuZCwgc3RyYXRlZ3kpXG4gICAgICBpZiBiZXN0UGxheXMgPT0gbnVsbFxuICAgICAgICBiZXN0UGxheXMgPSBwbGF5c1xuICAgICAgZWxzZVxuICAgICAgICBucCA9IEBudW1iZXJPZlNpbmdsZXMocGxheXMpXG4gICAgICAgIG5icCA9IEBudW1iZXJPZlNpbmdsZXMoYmVzdFBsYXlzKVxuICAgICAgICBpZiBucCA8IG5icFxuICAgICAgICAgIGJlc3RQbGF5cyA9IHBsYXlzXG4gICAgICAgIGVsc2UgaWYgbnAgPT0gbmJwXG4gICAgICAgICAgIyBmbGlwIGEgY29pbiFcbiAgICAgICAgICBpZiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKSA9PSAwXG4gICAgICAgICAgICBiZXN0UGxheXMgPSBwbGF5c1xuICAgIHJldHVybiBiZXN0UGxheXNcblxuICBwcmV0dHlQbGF5czogKHBsYXlzLCBleHRyYVByZXR0eSA9IGZhbHNlKSAtPlxuICAgIHByZXR0eSA9IHt9XG4gICAgZm9yIHR5cGUsIGFyciBvZiBwbGF5c1xuICAgICAgcHJldHR5W3R5cGVdID0gW11cbiAgICAgIGZvciBwbGF5IGluIGFyclxuICAgICAgICBuYW1lcyA9IFtdXG4gICAgICAgIGZvciByYXcgaW4gcGxheVxuICAgICAgICAgIGNhcmQgPSBuZXcgQ2FyZChyYXcpXG4gICAgICAgICAgbmFtZXMucHVzaChjYXJkLm5hbWUpXG4gICAgICAgIHByZXR0eVt0eXBlXS5wdXNoKG5hbWVzKVxuICAgIGlmIGV4dHJhUHJldHR5XG4gICAgICBzID0gXCJcIlxuICAgICAgZm9yIHR5cGVOYW1lLCB0aHJvd3Mgb2YgcHJldHR5XG4gICAgICAgIHMgKz0gXCIgICAgICAqICN7cGxheVR5cGVUb1N0cmluZyh0eXBlTmFtZSl9OlxcblwiXG4gICAgICAgIGlmIHR5cGVOYW1lID09ICdraW5kMSdcbiAgICAgICAgICBzICs9IFwiICAgICAgICAqICN7dGhyb3dzLm1hcCgodikgLT4gdlswXSkuam9pbignLCcpfVxcblwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBmb3IgdCBpbiB0aHJvd3NcbiAgICAgICAgICAgIHMgKz0gXCIgICAgICAgICogI3t0LmpvaW4oJywnKX1cXG5cIlxuICAgICAgcmV0dXJuIHNcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocHJldHR5KVxuXG4gIGhpZ2hlc3RDYXJkOiAocGxheSkgLT5cbiAgICBoaWdoZXN0ID0gMFxuICAgIGZvciBwIGluIHBsYXlcbiAgICAgIGlmIGhpZ2hlc3QgPCBwXG4gICAgICAgIGhpZ2hlc3QgPSBwXG4gICAgcmV0dXJuIGhpZ2hlc3RcblxuICBmaW5kUGxheVdpdGgzUzogKHBsYXlzKSAtPlxuICAgIGZvciBwbGF5VHlwZSwgcGxheWxpc3Qgb2YgcGxheXNcbiAgICAgIGZvciBwbGF5IGluIHBsYXlsaXN0XG4gICAgICAgIGlmIEBoYW5kSGFzM1MocGxheSlcbiAgICAgICAgICByZXR1cm4gcGxheVxuXG4gICAgY29uc29sZS5sb2cgXCJmaW5kUGxheVdpdGgzUzogc29tZXRoaW5nIGltcG9zc2libGUgaXMgaGFwcGVuaW5nXCJcbiAgICByZXR1cm4gW11cblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQUkgQnJhaW5zXG5cbiAgIyBCcmFpbnMgbXVzdCBoYXZlOlxuICAjICogaWQ6IGludGVybmFsIGlkZW50aWZpZXIgZm9yIHRoZSBicmFpblxuICAjICogbmFtZTogcHJldHR5IG5hbWVcbiAgIyAqIHBsYXkoY3VycmVudFBsYXllcikgYXR0ZW1wdHMgdG8gcGxheSBhIGNhcmQgYnkgY2FsbGluZyBhaVBsYXkoKS4gU2hvdWxkIHJldHVybiB0cnVlIGlmIGl0IHN1Y2Nlc3NmdWxseSBwbGF5ZWQgYSBjYXJkIChhaVBsYXkoKSByZXR1cm5lZCB0cnVlKVxuICBicmFpbnM6XG5cbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICMgTm9ybWFsOiBJbnRlbmRlZCB0byBiZSB1c2VkIGJ5IG1vc3QgY2hhcmFjdGVycy5cbiAgICAjICAgICAgICAgTm90IHRvbyBkdW1iLCBub3QgdG9vIHNtYXJ0LlxuICAgIG5vcm1hbDpcbiAgICAgIGlkOiAgIFwibm9ybWFsXCJcbiAgICAgIG5hbWU6IFwiTm9ybWFsXCJcblxuICAgICAgIyBub3JtYWxcbiAgICAgIHBsYXk6IChjdXJyZW50UGxheWVyLCBjdXJyZW50UGxheSwgZXZlcnlvbmVQYXNzZWQpIC0+XG4gICAgICAgIGlmIGN1cnJlbnRQbGF5ZXIucGFzc1xuICAgICAgICAgIGlmIEBjYW5CZUJyb2tlbihjdXJyZW50UGxheSkgYW5kIEBoYXNCcmVha2VyKGN1cnJlbnRQbGF5ZXIuaGFuZClcbiAgICAgICAgICAgIGJyZWFrZXJQbGF5cyA9IEBicmVha2VyUGxheXMoY3VycmVudFBsYXllci5oYW5kKVxuICAgICAgICAgICAgZm9yIHBsYXlUeXBlLCBwbGF5bGlzdCBvZiBicmVha2VyUGxheXNcbiAgICAgICAgICAgICAgaWYgKHBsYXlUeXBlLm1hdGNoKC9ecm9wLykgb3IgKHBsYXlUeXBlID09ICdraW5kNCcpKSBhbmQgKHBsYXlsaXN0Lmxlbmd0aCA+IDApXG4gICAgICAgICAgICAgICAgQGFpTG9nKFwiYnJlYWtpbmcgMlwiKVxuICAgICAgICAgICAgICAgIGlmIEBhaVBsYXkoY3VycmVudFBsYXllciwgcGxheWxpc3RbMF0pID09IE9LXG4gICAgICAgICAgICAgICAgICByZXR1cm4gT0tcblxuICAgICAgICAgIEBhaUxvZyhcImFscmVhZHkgcGFzc2VkLCBnb2luZyB0byBrZWVwIHBhc3NpbmdcIilcbiAgICAgICAgICByZXR1cm4gQGFpUGFzcyhjdXJyZW50UGxheWVyKVxuXG4gICAgICAgIHBsYXlzID0gQGFpQ2FsY0Jlc3RQbGF5cyhjdXJyZW50UGxheWVyLmhhbmQpXG4gICAgICAgIEBhaUxvZyhcImJlc3QgcGxheXM6ICN7QHByZXR0eVBsYXlzKHBsYXlzKX1cIilcblxuICAgICAgICBpZiBAcGlsZS5sZW5ndGggPT0gMFxuICAgICAgICAgIHBsYXkgPSBAZmluZFBsYXlXaXRoM1MocGxheXMpXG4gICAgICAgICAgQGFpTG9nKFwiVGhyb3dpbmcgbXkgcGxheSB3aXRoIHRoZSAzUyBpbiBpdFwiKVxuICAgICAgICAgIGlmIEBhaVBsYXkoY3VycmVudFBsYXllciwgcGxheSkgPT0gT0tcbiAgICAgICAgICAgIHJldHVybiBPS1xuXG4gICAgICAgIGlmIGN1cnJlbnRQbGF5IGFuZCBub3QgZXZlcnlvbmVQYXNzZWRcbiAgICAgICAgICBpZiBwbGF5c1tjdXJyZW50UGxheS50eXBlXT8gYW5kIChwbGF5c1tjdXJyZW50UGxheS50eXBlXS5sZW5ndGggPiAwKVxuICAgICAgICAgICAgZm9yIHBsYXkgaW4gcGxheXNbY3VycmVudFBsYXkudHlwZV1cbiAgICAgICAgICAgICAgaWYgQGhpZ2hlc3RDYXJkKHBsYXkpID4gY3VycmVudFBsYXkuaGlnaFxuICAgICAgICAgICAgICAgIGlmIEBhaVBsYXkoY3VycmVudFBsYXllciwgcGxheSkgPT0gT0tcbiAgICAgICAgICAgICAgICAgIHJldHVybiBPS1xuICAgICAgICAgICAgQGFpTG9nKFwiSSBndWVzcyBJIGNhbid0IGFjdHVhbGx5IGJlYXQgdGhpcywgcGFzc2luZ1wiKVxuICAgICAgICAgICAgcmV0dXJuIEBhaVBhc3MoY3VycmVudFBsYXllcilcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBAYWlMb2coXCJJIGRvbid0IGhhdmUgdGhhdCBwbGF5LCBwYXNzaW5nXCIpXG4gICAgICAgICAgICByZXR1cm4gQGFpUGFzcyhjdXJyZW50UGxheWVyKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgIyBubyBjdXJyZW50IHBsYXksIHRocm93IHRoZSBmaXJzdCBjYXJkXG4gICAgICAgICAgQGFpTG9nKFwiSSBjYW4gZG8gYW55dGhpbmcsIHRocm93aW5nIGEgcmFuZG9tIHBsYXlcIilcbiAgICAgICAgICBwbGF5VHlwZXMgPSBPYmplY3Qua2V5cyhwbGF5cylcbiAgICAgICAgICBwbGF5VHlwZUluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcGxheVR5cGVzLmxlbmd0aClcbiAgICAgICAgICBpZiBAYWlQbGF5KGN1cnJlbnRQbGF5ZXIsIHBsYXlzW3BsYXlUeXBlc1twbGF5VHlwZUluZGV4XV1bMF0pID09IE9LXG4gICAgICAgICAgICByZXR1cm4gT0tcblxuICAgICAgICAjIGZpbmQgdGhlIGZpcnN0IGNhcmQgdGhhdCBiZWF0cyB0aGUgY3VycmVudFBsYXkncyBoaWdoXG4gICAgICAgIGZvciByYXdDYXJkIGluIGN1cnJlbnRQbGF5ZXIuaGFuZFxuICAgICAgICAgIGlmIHJhd0NhcmQgPiBjdXJyZW50UGxheS5oaWdoXG4gICAgICAgICAgICBAYWlMb2coXCJmb3VuZCBzbWFsbGVzdCBzaW5nbGUgKCN7cmF3Q2FyZH0pLCBwbGF5aW5nXCIpXG4gICAgICAgICAgICBpZiBAYWlQbGF5KGN1cnJlbnRQbGF5ZXIsIFtyYXdDYXJkXSkgPT0gT0tcbiAgICAgICAgICAgICAgcmV0dXJuIE9LXG4gICAgICAgICAgICBicmVha1xuXG4gICAgICAgIEBhaUxvZyhcIm5vdGhpbmcgZWxzZSB0byBkbywgcGFzc2luZ1wiKVxuICAgICAgICByZXR1cm4gQGFpUGFzcyhjdXJyZW50UGxheWVyKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBEZWJ1ZyBjb2RlXG5cbmRlYnVnID0gLT5cbiAgdGhpciA9IG5ldyBUaGlydGVlbigpXG4gIGZ1bGx5UGxheWVkID0gMFxuICB0b3RhbEF0dGVtcHRzID0gMTAwXG5cbiAgZm9yIGF0dGVtcHQgaW4gWzAuLi50b3RhbEF0dGVtcHRzXVxuICAgIGRlY2sgPSBuZXcgU2h1ZmZsZWREZWNrKClcbiAgICBoYW5kID0gW11cbiAgICBmb3IgaiBpbiBbMC4uLjEzXVxuICAgICAgcmF3ID0gZGVjay5jYXJkcy5zaGlmdCgpXG4gICAgICBoYW5kLnB1c2gocmF3KVxuICAgICMgaGFuZCA9IFs1MSw1MCw0OSw0OCw0Nyw0Niw0NSw0NCw0Myw0Miw0MSw0MCwzOV1cbiAgICAjIGhhbmQgPSBbMCwxLDIsMyw0LDUsNiw3LDgsOSwxMCwxMSwxMl1cbiAgICBoYW5kLnNvcnQgKGEsYikgLT4gcmV0dXJuIGEgLSBiXG5cbiAgICBjb25zb2xlLmxvZyhcIi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVwiKVxuICAgIGNvbnNvbGUubG9nKFwiSGFuZCAje2F0dGVtcHQrMX06ICN7Y2FyZHNUb1N0cmluZyhoYW5kKX1cIilcbiAgICBjb25zb2xlLmxvZyhcIlwiKVxuXG4gICAgZm91bmRGdWxseVBsYXllZCA9IGZhbHNlXG4gICAgZm9yIGJpdHMgaW4gWzAuLi4xNl1cbiAgICAgIHN0cmF0ZWd5ID1cbiAgICAgICAgc21hbGxSdW5zOiAoYml0cyAmIDEpID09IDFcbiAgICAgICAgcHJlZmVyc1J1bnM6IChiaXRzICYgMikgPT0gMlxuICAgICAgICBtYXRjaDJzOiAoYml0cyAmIDQpID09IDRcbiAgICAgICAgc2Vlc1JvcHM6IChiaXRzICYgOCkgPT0gOFxuICAgICAgcGxheXMgPSB0aGlyLmFpQ2FsY1BsYXlzKGhhbmQsIHN0cmF0ZWd5KVxuXG4gICAgICBjb25zb2xlLmxvZyhcIiAgICogU3RyYXRlZ3k6ICN7SlNPTi5zdHJpbmdpZnkoc3RyYXRlZ3kpfVwiKVxuICAgICAgY29uc29sZS5sb2codGhpci5wcmV0dHlQbGF5cyhwbGF5cywgdHJ1ZSkpXG5cbiAgICAgIGlmIG5vdCBwbGF5cy5raW5kMVxuICAgICAgICBmb3VuZEZ1bGx5UGxheWVkID0gdHJ1ZVxuXG4gICAgaWYgZm91bmRGdWxseVBsYXllZFxuICAgICAgZnVsbHlQbGF5ZWQgKz0gMVxuXG4gIGNvbnNvbGUubG9nIFwiZnVsbHlQbGF5ZWQ6ICN7ZnVsbHlQbGF5ZWR9IC8gI3t0b3RhbEF0dGVtcHRzfVwiXG5cbiMgZGVidWcoKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBFeHBvcnRzXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgQ2FyZDogQ2FyZFxuICBUaGlydGVlbjogVGhpcnRlZW5cbiAgT0s6IE9LXG4gIGFpQ2hhcmFjdGVyczogYWlDaGFyYWN0ZXJzXG4iLCJtb2R1bGUuZXhwb3J0cyA9XG4gIGRhcmtmb3Jlc3Q6XG4gICAgaGVpZ2h0OiA3MlxuICAgIGdseXBoczpcbiAgICAgICc5NycgOiB7IHg6ICAgOCwgeTogICA4LCB3aWR0aDogIDM0LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzk4JyA6IHsgeDogICA4LCB5OiAgNTgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnOTknIDogeyB4OiAgNTAsIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICcxMDAnOiB7IHg6ICAgOCwgeTogMTE4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzEwMSc6IHsgeDogICA4LCB5OiAxNzgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnMTAyJzogeyB4OiAgIDgsIHk6IDIyOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDMzIH1cbiAgICAgICcxMDMnOiB7IHg6ICAgOCwgeTogMjc4LCB3aWR0aDogIDM2LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzUgfVxuICAgICAgJzEwNCc6IHsgeDogICA4LCB5OiAzMjgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnMTA1JzogeyB4OiAgIDgsIHk6IDM3OCwgd2lkdGg6ICAxMiwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDExIH1cbiAgICAgICcxMDYnOiB7IHg6ICAgOCwgeTogNDI4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MSwgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzEwNyc6IHsgeDogIDI4LCB5OiAzNzgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQxLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnMTA4JzogeyB4OiAgNTEsIHk6IDMyOCwgd2lkdGg6ICAzNCwgaGVpZ2h0OiAgNDEsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDMzIH1cbiAgICAgICcxMDknOiB7IHg6ICA1MSwgeTogNDI3LCB3aWR0aDogIDM4LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzcgfVxuICAgICAgJzExMCc6IHsgeDogIDcxLCB5OiAzNzcsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnMTExJzogeyB4OiAgOTcsIHk6IDQyNywgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDEsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICcxMTInOiB7IHg6ICA1MSwgeTogIDU4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzExMyc6IHsgeDogIDUxLCB5OiAxMDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQ1LCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnMTE0JzogeyB4OiAgOTMsIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM1IH1cbiAgICAgICcxMTUnOiB7IHg6ICA1MSwgeTogMTYxLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzUgfVxuICAgICAgJzExNic6IHsgeDogIDUxLCB5OiAyMTEsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzMyB9XG4gICAgICAnMTE3JzogeyB4OiAgNTIsIHk6IDI2MSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICcxMTgnOiB7IHg6ICA5MywgeTogMzExLCB3aWR0aDogIDM0LCBoZWlnaHQ6ICA0MSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzIgfVxuICAgICAgJzExOSc6IHsgeDogMTE0LCB5OiAzNjAsIHdpZHRoOiAgMzgsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzOCB9XG4gICAgICAnMTIwJzogeyB4OiAxNDAsIHk6IDQxMCwgd2lkdGg6ICAzNiwgaGVpZ2h0OiAgNDEsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM3IH1cbiAgICAgICcxMjEnOiB7IHg6IDE0MCwgeTogNDU5LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzEyMic6IHsgeDogMTgzLCB5OiA0NTksIHdpZHRoOiAgMzYsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNSB9XG4gICAgICAnNjUnIDogeyB4OiAgOTQsIHk6ICA1OCwgd2lkdGg6ICAzNCwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cbiAgICAgICc2NicgOiB7IHg6ICA5NCwgeTogMTE5LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzcgfVxuICAgICAgJzY3JyA6IHsgeDogIDk0LCB5OiAxODAsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XG4gICAgICAnNjgnIDogeyB4OiAgOTUsIHk6IDI0MSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM3IH1cbiAgICAgICc2OScgOiB7IHg6IDEzNiwgeTogICA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxuICAgICAgJzcwJyA6IHsgeDogMTM3LCB5OiAgNjksIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnNzEnIDogeyB4OiAxNzksIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cbiAgICAgICc3MicgOiB7IHg6IDEzNywgeTogMTMwLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxuICAgICAgJzczJyA6IHsgeDogMTM4LCB5OiAxOTEsIHdpZHRoOiAgMTIsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAxMyB9XG4gICAgICAnNzQnIDogeyB4OiAxMzgsIHk6IDI1Miwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cbiAgICAgICc3NScgOiB7IHg6IDE1OCwgeTogMTkxLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxuICAgICAgJzc2JyA6IHsgeDogMTYwLCB5OiAzMTMsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnNzcnIDogeyB4OiAxODEsIHk6IDI1MSwgd2lkdGg6ICAzOCwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM5IH1cbiAgICAgICc3OCcgOiB7IHg6IDE4NCwgeTogMzc0LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxuICAgICAgJzc5JyA6IHsgeDogMjAzLCB5OiAzMTIsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNSB9XG4gICAgICAnODAnIDogeyB4OiAxODAsIHk6ICA2OSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICc4MScgOiB7IHg6IDIwMSwgeTogMTMwLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1NiwgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxuICAgICAgJzgyJyA6IHsgeDogMjIyLCB5OiAgIDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XG4gICAgICAnODMnIDogeyB4OiAyMjMsIHk6ICA2OSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM1IH1cbiAgICAgICc4NCcgOiB7IHg6IDI2NSwgeTogICA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzMgfVxuICAgICAgJzg1JyA6IHsgeDogMjI3LCB5OiAxOTQsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNSB9XG4gICAgICAnODYnIDogeyB4OiAyNDQsIHk6IDEzMCwgd2lkdGg6ICA0MSwgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDE5LCB4YWR2YW5jZTogIDM5IH1cbiAgICAgICc4NycgOiB7IHg6IDI2NiwgeTogIDY5LCB3aWR0aDogIDM4LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzcgfVxuICAgICAgJzg4JyA6IHsgeDogMzA4LCB5OiAgIDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAxOSwgeGFkdmFuY2U6ICAzNSB9XG4gICAgICAnODknIDogeyB4OiAyMjcsIHk6IDM3Mywgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDE5LCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICc5MCcgOiB7IHg6IDIyNywgeTogNDMzLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxuICAgICAgJzMzJyA6IHsgeDogMjQ2LCB5OiAyNTUsIHdpZHRoOiAgMTQsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAxMSB9XG4gICAgICAnNTknIDogeyB4OiAxODAsIHk6IDEzMCwgd2lkdGg6ICAxMywgaGVpZ2h0OiAgMzcsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDU2LCB4YWR2YW5jZTogIDEzIH1cbiAgICAgICczNycgOiB7IHg6ICA5NSwgeTogMzAyLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxuICAgICAgJzU4JyA6IHsgeDogMTYwLCB5OiAzNzQsIHdpZHRoOiAgMTMsIGhlaWdodDogIDIzLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA1MCwgeGFkdmFuY2U6ICAxMyB9XG4gICAgICAnNjMnIDogeyB4OiAyNjgsIHk6IDI1NSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDMzIH1cbiAgICAgICc0MicgOiB7IHg6IDEwMywgeTogMzAyLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxuICAgICAgJzQwJyA6IHsgeDogMjcwLCB5OiAxOTAsIHdpZHRoOiAgMjMsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAyMSB9XG4gICAgICAnNDEnIDogeyB4OiAyOTMsIHk6IDEzMCwgd2lkdGg6ICAyMywgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDIxIH1cbiAgICAgICc5NScgOiB7IHg6IDExMSwgeTogMzAyLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxuICAgICAgJzQzJyA6IHsgeDogMjQ2LCB5OiAzMTYsIHdpZHRoOiAgMzUsIGhlaWdodDogIDM0LCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAzOSwgeGFkdmFuY2U6ICAzMiB9XG4gICAgICAnNDUnIDogeyB4OiAxODQsIHk6IDQzNSwgd2lkdGg6ICAyNiwgaGVpZ2h0OiAgMTEsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDQ0LCB4YWR2YW5jZTogIDI1IH1cbiAgICAgICc2MScgOiB7IHg6IDMxMiwgeTogIDY4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICAzMCwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgNDIsIHhhZHZhbmNlOiAgMzMgfVxuICAgICAgJzQ2JyA6IHsgeDogMTM1LCB5OiAzMTMsIHdpZHRoOiAgMTQsIGhlaWdodDogIDExLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA2MSwgeGFkdmFuY2U6ICAxNCB9XG4gICAgICAnNDQnIDogeyB4OiAyMjcsIHk6IDI1NSwgd2lkdGg6ICAxMCwgaGVpZ2h0OiAgMjEsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDY4LCB4YWR2YW5jZTogIDExIH1cbiAgICAgICc0NycgOiB7IHg6IDM1MSwgeTogICA4LCB3aWR0aDogIDI4LCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgMTksIHhhZHZhbmNlOiAgMjYgfVxuICAgICAgJzEyNCc6IHsgeDogMTE5LCB5OiAzMDIsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XG4gICAgICAnMzQnIDogeyB4OiAxMjcsIHk6IDMwMiwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cbiAgICAgICczOScgOiB7IHg6IDIwMSwgeTogMTk0LCB3aWR0aDogIDE4LCBoZWlnaHQ6ICAxOSwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgIDAsIHhhZHZhbmNlOiAgMjEgfVxuICAgICAgJzY0JyA6IHsgeDogMjE4LCB5OiA0MzUsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XG4gICAgICAnMzUnIDogeyB4OiAyMTgsIHk6IDQ0Mywgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cbiAgICAgICczNicgOiB7IHg6IDMwMSwgeTogMTkwLCB3aWR0aDogIDMyLCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgMjIsIHhhZHZhbmNlOiAgMjkgfVxuICAgICAgJzk0JyA6IHsgeDogMjE4LCB5OiA0NTEsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XG4gICAgICAnMzgnIDogeyB4OiAyNDYsIHk6IDM1OCwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cbiAgICAgICcxMjMnOiB7IHg6IDMyNCwgeTogMTA2LCB3aWR0aDogIDI3LCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMjYgfVxuICAgICAgJzEyNSc6IHsgeDogMjcwLCB5OiAzNTgsIHdpZHRoOiAgMjcsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAyNyB9XG4gICAgICAnOTEnIDogeyB4OiAyNzAsIHk6IDQxOCwgd2lkdGg6ICAyMiwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDIxIH1cbiAgICAgICc5MycgOiB7IHg6IDMwMCwgeTogNDE4LCB3aWR0aDogIDIyLCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMjAgfVxuICAgICAgJzQ4JyA6IHsgeDogMzA1LCB5OiAzMTYsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XG4gICAgICAnNDknIDogeyB4OiAzMTEsIHk6IDI1MSwgd2lkdGg6ICAzNCwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM1IH1cbiAgICAgICc1MCcgOiB7IHg6IDM0MSwgeTogMTY2LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzcgfVxuICAgICAgJzUxJyA6IHsgeDogMzU5LCB5OiAgNjgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XG4gICAgICAnNTInIDogeyB4OiAzMzAsIHk6IDM3Nywgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM1IH1cbiAgICAgICc1MycgOiB7IHg6IDM0OCwgeTogMzEyLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzcgfVxuICAgICAgJzU0JyA6IHsgeDogMzMwLCB5OiA0MzgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XG4gICAgICAnNTUnIDogeyB4OiAzNTMsIHk6IDIyNywgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICc1NicgOiB7IHg6IDM4NCwgeTogMTI5LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxuICAgICAgJzU3JyA6IHsgeDogNDAyLCB5OiAgIDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XG4gICAgICAnMzInIDogeyB4OiAgIDAsIHk6ICAgMCwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDIyIH1cblxuICAgICAgIyBjYXJkIGdseXBoc1xuICAgICAgJzIwMCc6IHsgeDogMzk2LCB5OiAzNzgsIHdpZHRoOiAgNDAsIGhlaWdodDogIDQ5LCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMSwgeGFkdmFuY2U6ICA0MyB9ICMgU1xuICAgICAgJzIwMSc6IHsgeDogNDQ3LCB5OiAzMTMsIHdpZHRoOiAgNDksIGhlaWdodDogIDUwLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMSwgeGFkdmFuY2U6ICA1MiB9ICMgQ1xuICAgICAgJzIwMic6IHsgeDogMzk5LCB5OiAzMTMsIHdpZHRoOiAgMzYsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMSwgeGFkdmFuY2U6ICAzOSB9ICMgRFxuICAgICAgJzIwMyc6IHsgeDogNDUyLCB5OiAzODEsIHdpZHRoOiAgMzksIGhlaWdodDogIDQzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMSwgeGFkdmFuY2U6ICA0MiB9ICMgSFxuIiwiIyBUaGlzIGZpbGUgcHJvdmlkZXMgdGhlIHJlbmRlcmluZyBlbmdpbmUgZm9yIHRoZSB3ZWIgdmVyc2lvbi4gTm9uZSBvZiB0aGlzIGNvZGUgaXMgaW5jbHVkZWQgaW4gdGhlIEphdmEgdmVyc2lvbi5cblxuY29uc29sZS5sb2cgJ3dlYiBzdGFydHVwJ1xuXG5HYW1lID0gcmVxdWlyZSAnLi9HYW1lJ1xuXG4jIHRha2VuIGZyb20gaHR0cDojc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzU2MjM4MzgvcmdiLXRvLWhleC1hbmQtaGV4LXRvLXJnYlxuY29tcG9uZW50VG9IZXggPSAoYykgLT5cbiAgaGV4ID0gTWF0aC5mbG9vcihjICogMjU1KS50b1N0cmluZygxNilcbiAgcmV0dXJuIGlmIGhleC5sZW5ndGggPT0gMSB0aGVuIFwiMFwiICsgaGV4IGVsc2UgaGV4XG5yZ2JUb0hleCA9IChyLCBnLCBiKSAtPlxuICByZXR1cm4gXCIjXCIgKyBjb21wb25lbnRUb0hleChyKSArIGNvbXBvbmVudFRvSGV4KGcpICsgY29tcG9uZW50VG9IZXgoYilcblxuU0FWRV9USU1FUl9NUyA9IDMwMDBcblxuY2xhc3MgTmF0aXZlQXBwXG4gIGNvbnN0cnVjdG9yOiAoQHNjcmVlbiwgQHdpZHRoLCBAaGVpZ2h0KSAtPlxuICAgIEB0aW50ZWRUZXh0dXJlQ2FjaGUgPSBbXVxuICAgIEBsYXN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG4gICAgQGxhc3RJbnRlcmFjdFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuICAgIEBoZWFyZE9uZVRvdWNoID0gZmFsc2VcbiAgICBAdG91Y2hNb3VzZSA9IG51bGxcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2Vkb3duJywgIEBvbk1vdXNlRG93bi5iaW5kKHRoaXMpLCBmYWxzZVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdtb3VzZW1vdmUnLCAgQG9uTW91c2VNb3ZlLmJpbmQodGhpcyksIGZhbHNlXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNldXAnLCAgICBAb25Nb3VzZVVwLmJpbmQodGhpcyksIGZhbHNlXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ3RvdWNoc3RhcnQnLCBAb25Ub3VjaFN0YXJ0LmJpbmQodGhpcyksIGZhbHNlXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ3RvdWNobW92ZScsICBAb25Ub3VjaE1vdmUuYmluZCh0aGlzKSwgZmFsc2VcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAndG91Y2hlbmQnLCAgIEBvblRvdWNoRW5kLmJpbmQodGhpcyksIGZhbHNlXG4gICAgQGNvbnRleHQgPSBAc2NyZWVuLmdldENvbnRleHQoXCIyZFwiKVxuICAgIEB0ZXh0dXJlcyA9IFtcbiAgICAgICMgYWxsIGNhcmQgYXJ0XG4gICAgICBcIi4uL2ltYWdlcy9jYXJkcy5wbmdcIlxuICAgICAgIyBmb250c1xuICAgICAgXCIuLi9pbWFnZXMvZGFya2ZvcmVzdC5wbmdcIlxuICAgICAgIyBjaGFyYWN0ZXJzIC8gb3RoZXJcbiAgICAgIFwiLi4vaW1hZ2VzL2NoYXJzLnBuZ1wiXG4gICAgICAjIGhlbHBcbiAgICAgIFwiLi4vaW1hZ2VzL2hvd3RvMS5wbmdcIlxuICAgICAgXCIuLi9pbWFnZXMvaG93dG8yLnBuZ1wiXG4gICAgICBcIi4uL2ltYWdlcy9ob3d0bzMucG5nXCJcbiAgICBdXG5cbiAgICBAZ2FtZSA9IG5ldyBHYW1lKHRoaXMsIEB3aWR0aCwgQGhlaWdodClcblxuICAgIGlmIHR5cGVvZiBTdG9yYWdlICE9IFwidW5kZWZpbmVkXCJcbiAgICAgIHN0YXRlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0gXCJzdGF0ZVwiXG4gICAgICBpZiBzdGF0ZVxuICAgICAgICAjIGNvbnNvbGUubG9nIFwibG9hZGluZyBzdGF0ZTogI3tzdGF0ZX1cIlxuICAgICAgICBAZ2FtZS5sb2FkIHN0YXRlXG5cbiAgICBAcGVuZGluZ0ltYWdlcyA9IDBcbiAgICBsb2FkZWRUZXh0dXJlcyA9IFtdXG4gICAgZm9yIGltYWdlVXJsIGluIEB0ZXh0dXJlc1xuICAgICAgQHBlbmRpbmdJbWFnZXMrK1xuICAgICAgY29uc29sZS5sb2cgXCJsb2FkaW5nIGltYWdlICN7QHBlbmRpbmdJbWFnZXN9OiAje2ltYWdlVXJsfVwiXG4gICAgICBpbWcgPSBuZXcgSW1hZ2UoKVxuICAgICAgaW1nLm9ubG9hZCA9IEBvbkltYWdlTG9hZGVkLmJpbmQodGhpcylcbiAgICAgIGltZy5zcmMgPSBpbWFnZVVybFxuICAgICAgbG9hZGVkVGV4dHVyZXMucHVzaCBpbWdcbiAgICBAdGV4dHVyZXMgPSBsb2FkZWRUZXh0dXJlc1xuXG4gICAgQHNhdmVUaW1lciA9IFNBVkVfVElNRVJfTVNcblxuICBvbkltYWdlTG9hZGVkOiAoaW5mbykgLT5cbiAgICBAcGVuZGluZ0ltYWdlcy0tXG4gICAgaWYgQHBlbmRpbmdJbWFnZXMgPT0gMFxuICAgICAgY29uc29sZS5sb2cgJ0FsbCBpbWFnZXMgbG9hZGVkLiBCZWdpbm5pbmcgcmVuZGVyIGxvb3AuJ1xuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0+IEB1cGRhdGUoKVxuXG4gIGxvZzogKHMpIC0+XG4gICAgY29uc29sZS5sb2cgXCJOYXRpdmVBcHAubG9nKCk6ICN7c31cIlxuXG4gIHVwZGF0ZVNhdmU6IChkdCkgLT5cbiAgICByZXR1cm4gaWYgdHlwZW9mIFN0b3JhZ2UgPT0gXCJ1bmRlZmluZWRcIlxuICAgIEBzYXZlVGltZXIgLT0gZHRcbiAgICBpZiBAc2F2ZVRpbWVyIDw9IDBcbiAgICAgIEBzYXZlVGltZXIgPSBTQVZFX1RJTUVSX01TXG4gICAgICBzdGF0ZSA9IEBnYW1lLnNhdmUoKVxuICAgICAgIyBjb25zb2xlLmxvZyBcInNhdmluZzogI3tzdGF0ZX1cIlxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0gXCJzdGF0ZVwiLCBzdGF0ZVxuXG4gIGdlbmVyYXRlVGludEltYWdlOiAodGV4dHVyZUluZGV4LCByZWQsIGdyZWVuLCBibHVlKSAtPlxuICAgIGltZyA9IEB0ZXh0dXJlc1t0ZXh0dXJlSW5kZXhdXG4gICAgYnVmZiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgXCJjYW52YXNcIlxuICAgIGJ1ZmYud2lkdGggID0gaW1nLndpZHRoXG4gICAgYnVmZi5oZWlnaHQgPSBpbWcuaGVpZ2h0XG5cbiAgICBjdHggPSBidWZmLmdldENvbnRleHQgXCIyZFwiXG4gICAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdjb3B5J1xuICAgIGN0eC5kcmF3SW1hZ2UoaW1nLCAwLCAwKVxuICAgIGZpbGxDb2xvciA9IFwicmdiKCN7TWF0aC5mbG9vcihyZWQqMjU1KX0sICN7TWF0aC5mbG9vcihncmVlbioyNTUpfSwgI3tNYXRoLmZsb29yKGJsdWUqMjU1KX0pXCJcbiAgICBjdHguZmlsbFN0eWxlID0gZmlsbENvbG9yXG4gICAgY29uc29sZS5sb2cgXCJmaWxsQ29sb3IgI3tmaWxsQ29sb3J9XCJcbiAgICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ211bHRpcGx5J1xuICAgIGN0eC5maWxsUmVjdCgwLCAwLCBidWZmLndpZHRoLCBidWZmLmhlaWdodClcbiAgICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2NvcHknXG4gICAgY3R4Lmdsb2JhbEFscGhhID0gMS4wXG4gICAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdkZXN0aW5hdGlvbi1pbidcbiAgICBjdHguZHJhd0ltYWdlKGltZywgMCwgMClcblxuICAgIGltZ0NvbXAgPSBuZXcgSW1hZ2UoKVxuICAgIGltZ0NvbXAuc3JjID0gYnVmZi50b0RhdGFVUkwoKVxuICAgIHJldHVybiBpbWdDb21wXG5cbiAgZHJhd0ltYWdlOiAodGV4dHVyZUluZGV4LCBzcmNYLCBzcmNZLCBzcmNXLCBzcmNILCBkc3RYLCBkc3RZLCBkc3RXLCBkc3RILCByb3QsIGFuY2hvclgsIGFuY2hvclksIHIsIGcsIGIsIGEpIC0+XG4gICAgdGV4dHVyZSA9IEB0ZXh0dXJlc1t0ZXh0dXJlSW5kZXhdXG4gICAgaWYgKHIgIT0gMSkgb3IgKGcgIT0gMSkgb3IgKGIgIT0gMSlcbiAgICAgIHRpbnRlZFRleHR1cmVLZXkgPSBcIiN7dGV4dHVyZUluZGV4fS0je3J9LSN7Z30tI3tifVwiXG4gICAgICB0aW50ZWRUZXh0dXJlID0gQHRpbnRlZFRleHR1cmVDYWNoZVt0aW50ZWRUZXh0dXJlS2V5XVxuICAgICAgaWYgbm90IHRpbnRlZFRleHR1cmVcbiAgICAgICAgdGludGVkVGV4dHVyZSA9IEBnZW5lcmF0ZVRpbnRJbWFnZSB0ZXh0dXJlSW5kZXgsIHIsIGcsIGJcbiAgICAgICAgQHRpbnRlZFRleHR1cmVDYWNoZVt0aW50ZWRUZXh0dXJlS2V5XSA9IHRpbnRlZFRleHR1cmVcbiAgICAgICAgIyBjb25zb2xlLmxvZyBcImdlbmVyYXRlZCBjYWNoZWQgdGV4dHVyZSAje3RpbnRlZFRleHR1cmVLZXl9XCJcbiAgICAgIHRleHR1cmUgPSB0aW50ZWRUZXh0dXJlXG5cbiAgICBAY29udGV4dC5zYXZlKClcbiAgICBAY29udGV4dC50cmFuc2xhdGUgZHN0WCwgZHN0WVxuICAgIEBjb250ZXh0LnJvdGF0ZSByb3QgIyAqIDMuMTQxNTkyIC8gMTgwLjBcbiAgICBhbmNob3JPZmZzZXRYID0gLTEgKiBhbmNob3JYICogZHN0V1xuICAgIGFuY2hvck9mZnNldFkgPSAtMSAqIGFuY2hvclkgKiBkc3RIXG4gICAgQGNvbnRleHQudHJhbnNsYXRlIGFuY2hvck9mZnNldFgsIGFuY2hvck9mZnNldFlcbiAgICBAY29udGV4dC5nbG9iYWxBbHBoYSA9IGFcbiAgICBAY29udGV4dC5kcmF3SW1hZ2UodGV4dHVyZSwgc3JjWCwgc3JjWSwgc3JjVywgc3JjSCwgMCwgMCwgZHN0VywgZHN0SClcbiAgICBAY29udGV4dC5yZXN0b3JlKClcblxuICB1cGRhdGU6IC0+XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0+IEB1cGRhdGUoKVxuXG4gICAgbm93ID0gbmV3IERhdGUoKS5nZXRUaW1lKClcbiAgICBkdCA9IG5vdyAtIEBsYXN0VGltZVxuXG4gICAgdGltZVNpbmNlSW50ZXJhY3QgPSBub3cgLSBAbGFzdEludGVyYWN0VGltZVxuICAgIGlmIHRpbWVTaW5jZUludGVyYWN0ID4gNTAwMFxuICAgICAgZ29hbEZQUyA9IDUgIyBjYWxtIGRvd24sIG5vYm9keSBpcyBkb2luZyBhbnl0aGluZyBmb3IgNSBzZWNvbmRzXG4gICAgZWxzZVxuICAgICAgZ29hbEZQUyA9IDIwMCAjIGFzIGZhc3QgYXMgcG9zc2libGVcbiAgICBpZiBAbGFzdEdvYWxGUFMgIT0gZ29hbEZQU1xuICAgICAgY29uc29sZS5sb2cgXCJzd2l0Y2hpbmcgdG8gI3tnb2FsRlBTfSBGUFNcIlxuICAgICAgQGxhc3RHb2FsRlBTID0gZ29hbEZQU1xuXG4gICAgZnBzSW50ZXJ2YWwgPSAxMDAwIC8gZ29hbEZQU1xuICAgIGlmIGR0IDwgZnBzSW50ZXJ2YWxcbiAgICAgIHJldHVyblxuICAgIEBsYXN0VGltZSA9IG5vd1xuXG4gICAgQGNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIEB3aWR0aCwgQGhlaWdodClcbiAgICBAZ2FtZS51cGRhdGUoZHQpXG4gICAgcmVuZGVyQ29tbWFuZHMgPSBAZ2FtZS5yZW5kZXIoKVxuXG4gICAgaSA9IDBcbiAgICBuID0gcmVuZGVyQ29tbWFuZHMubGVuZ3RoXG4gICAgd2hpbGUgKGkgPCBuKVxuICAgICAgZHJhd0NhbGwgPSByZW5kZXJDb21tYW5kcy5zbGljZShpLCBpICs9IDE2KVxuICAgICAgQGRyYXdJbWFnZS5hcHBseSh0aGlzLCBkcmF3Q2FsbClcblxuICAgIEB1cGRhdGVTYXZlKGR0KVxuXG4gIG9uVG91Y2hTdGFydDogKGV2dCkgLT5cbiAgICBAbGFzdEludGVyYWN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG4gICAgQGhlYXJkT25lVG91Y2ggPSB0cnVlXG4gICAgdG91Y2hlcyA9IGV2dC5jaGFuZ2VkVG91Y2hlc1xuICAgIGZvciB0b3VjaCBpbiB0b3VjaGVzXG4gICAgICBpZiBAdG91Y2hNb3VzZSA9PSBudWxsXG4gICAgICAgIEB0b3VjaE1vdXNlID0gdG91Y2guaWRlbnRpZmllclxuICAgICAgaWYgQHRvdWNoTW91c2UgPT0gdG91Y2guaWRlbnRpZmllclxuICAgICAgICBAZ2FtZS50b3VjaERvd24odG91Y2guY2xpZW50WCwgdG91Y2guY2xpZW50WSlcblxuICBvblRvdWNoTW92ZTogKGV2dCkgLT5cbiAgICBAbGFzdEludGVyYWN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG4gICAgdG91Y2hlcyA9IGV2dC5jaGFuZ2VkVG91Y2hlc1xuICAgIGZvciB0b3VjaCBpbiB0b3VjaGVzXG4gICAgICBpZiBAdG91Y2hNb3VzZSA9PSB0b3VjaC5pZGVudGlmaWVyXG4gICAgICAgIEBnYW1lLnRvdWNoTW92ZSh0b3VjaC5jbGllbnRYLCB0b3VjaC5jbGllbnRZKVxuXG4gIG9uVG91Y2hFbmQ6IChldnQpIC0+XG4gICAgQGxhc3RJbnRlcmFjdFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuICAgIHRvdWNoZXMgPSBldnQuY2hhbmdlZFRvdWNoZXNcbiAgICBmb3IgdG91Y2ggaW4gdG91Y2hlc1xuICAgICAgaWYgQHRvdWNoTW91c2UgPT0gdG91Y2guaWRlbnRpZmllclxuICAgICAgICBAZ2FtZS50b3VjaFVwKHRvdWNoLmNsaWVudFgsIHRvdWNoLmNsaWVudFkpXG4gICAgICAgIEB0b3VjaE1vdXNlID0gbnVsbFxuICAgIGlmIGV2dC50b3VjaGVzLmxlbmd0aCA9PSAwXG4gICAgICBAdG91Y2hNb3VzZSA9IG51bGxcblxuICBvbk1vdXNlRG93bjogKGV2dCkgLT5cbiAgICBpZiBAaGVhcmRPbmVUb3VjaFxuICAgICAgcmV0dXJuXG4gICAgQGxhc3RJbnRlcmFjdFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuICAgIEBnYW1lLnRvdWNoRG93bihldnQuY2xpZW50WCwgZXZ0LmNsaWVudFkpXG5cbiAgb25Nb3VzZU1vdmU6IChldnQpIC0+XG4gICAgaWYgQGhlYXJkT25lVG91Y2hcbiAgICAgIHJldHVyblxuICAgIEBsYXN0SW50ZXJhY3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcbiAgICBAZ2FtZS50b3VjaE1vdmUoZXZ0LmNsaWVudFgsIGV2dC5jbGllbnRZKVxuXG4gIG9uTW91c2VVcDogKGV2dCkgLT5cbiAgICBpZiBAaGVhcmRPbmVUb3VjaFxuICAgICAgcmV0dXJuXG4gICAgQGxhc3RJbnRlcmFjdFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuICAgIEBnYW1lLnRvdWNoVXAoZXZ0LmNsaWVudFgsIGV2dC5jbGllbnRZKVxuXG5zY3JlZW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAnc2NyZWVuJ1xucmVzaXplU2NyZWVuID0gLT5cbiAgZGVzaXJlZEFzcGVjdFJhdGlvID0gMTYgLyA5XG4gIGN1cnJlbnRBc3BlY3RSYXRpbyA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0XG4gIGlmIGN1cnJlbnRBc3BlY3RSYXRpbyA8IGRlc2lyZWRBc3BlY3RSYXRpb1xuICAgIHNjcmVlbi53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG4gICAgc2NyZWVuLmhlaWdodCA9IE1hdGguZmxvb3Iod2luZG93LmlubmVyV2lkdGggKiAoMSAvIGRlc2lyZWRBc3BlY3RSYXRpbykpXG4gIGVsc2VcbiAgICBzY3JlZW4ud2lkdGggPSBNYXRoLmZsb29yKHdpbmRvdy5pbm5lckhlaWdodCAqIGRlc2lyZWRBc3BlY3RSYXRpbylcbiAgICBzY3JlZW4uaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0XG5yZXNpemVTY3JlZW4oKVxuIyB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAncmVzaXplJywgcmVzaXplU2NyZWVuLCBmYWxzZVxuXG5hcHAgPSBuZXcgTmF0aXZlQXBwKHNjcmVlbiwgc2NyZWVuLndpZHRoLCBzY3JlZW4uaGVpZ2h0KVxuIl19
