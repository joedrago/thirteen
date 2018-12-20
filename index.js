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
      logcolor: {
        r: 0.5,
        g: 0.5,
        b: 0.5,
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
      hand_any: {
        r: 0,
        g: 0,
        b: 0.2,
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
      },
      game_over: {
        r: 0.6,
        g: 0.9,
        b: 1,
        a: 1
      }
    };
    this.textures = {
      "cards": 0,
      "darkforest": 1,
      "chars": 2,
      "howto1": 3
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
    this.hand.set(this.thirteen.players[0].hand);
    return this.lastErr = '';
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
      if (this.thirteen.lastStreak === 1) {
        return ["You win!", "A new streak!"];
      }
      return ["You win!", this.thirteen.lastStreak + " in a row!"];
    }
    if (this.thirteen.lastStreak === 0) {
      return [winner.name + " wins!", "Try again..."];
    }
    return [winner.name + " wins!", "Last streak: " + this.thirteen.lastStreak + " wins"];
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
    var howtoTexture;
    howtoTexture = "howto" + this.howto;
    this.log("rendering " + howtoTexture);
    this.spriteRenderer.render("solid", 0, 0, this.width, this.height, 0, 0, 0, this.colors.black);
    return this.spriteRenderer.render(howtoTexture, 0, 0, this.width, this.aaHeight, 0, 0, 0, this.colors.white, (function(_this) {
      return function() {
        return _this.howto = 0;
      };
    })(this));
  };

  Game.prototype.renderMainMenu = function() {
    return this.mainMenu.render();
  };

  Game.prototype.renderGame = function() {
    var aiPlayers, cardAreaText, character, characterHeight, characterMargin, characterWidth, countHeight, gameOverSize, gameOverY, handAreaHeight, handareaColor, i, j, len, line, lines, pileDimension, ref1, restartQuitSize, shadowDistance, textHeight, textPadding;
    this.spriteRenderer.render("solid", 0, 0, this.width, this.height, 0, 0, 0, this.colors.background);
    textHeight = this.aaHeight / 25;
    textPadding = textHeight / 5;
    characterHeight = this.aaHeight / 5;
    countHeight = textHeight;
    ref1 = this.thirteen.log;
    for (i = j = 0, len = ref1.length; j < len; i = ++j) {
      line = ref1[i];
      this.fontRenderer.render(this.font, textHeight, line, 0, (i + 1.5) * (textHeight + textPadding), 0, 0, this.colors.logcolor);
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
    cardAreaText = null;
    if (this.hand.picking) {
      handareaColor = this.colors.hand_pick;
      if ((this.thirteen.turn === 0) && (this.thirteen.everyonePassed() || (this.thirteen.pile.length === 0))) {
        handareaColor = this.colors.hand_any;
        if (this.thirteen.pile.length === 0) {
          cardAreaText = 'Anything (3\xc8)';
        } else {
          cardAreaText = 'Anything';
        }
      }
    } else {
      cardAreaText = 'Unlocked';
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
      this.fontRenderer.render(this.font, gameOverSize, lines[0], this.center.x, gameOverY, 0.5, 0.5, this.colors.game_over);
      if (lines.length > 1) {
        gameOverY += gameOverSize;
        this.fontRenderer.render(this.font, gameOverSize, lines[1], this.center.x, gameOverY, 0.5, 0.5, this.colors.game_over);
      }
      this.spriteRenderer.render("solid", 0, this.height, this.width, handAreaHeight, 0, 0, 1, this.colors.play_again, (function(_this) {
        return function() {
          _this.thirteen.deal();
          return _this.prepareGame();
        };
      })(this));
      restartQuitSize = this.aaHeight / 12;
      shadowDistance = restartQuitSize / 8;
      this.fontRenderer.render(this.font, restartQuitSize, "Play Again", shadowDistance + this.center.x, shadowDistance + (this.height - (handAreaHeight * 0.5)), 0.5, 1, this.colors.black);
      this.fontRenderer.render(this.font, restartQuitSize, "Play Again", this.center.x, this.height - (handAreaHeight * 0.5), 0.5, 1, this.colors.gold);
    }
    this.fontRenderer.render(this.font, textHeight, this.calcHeadline(), 0, 0, 0, 0, this.colors.lightgray);
    this.spriteRenderer.render("pause", this.width, 0, 0, this.pauseButtonSize, 0, 1, 0, this.colors.white, (function(_this) {
      return function() {
        return _this.paused = true;
      };
    })(this));
    if (cardAreaText !== null) {
      this.fontRenderer.render(this.font, textHeight, cardAreaText, 0.02 * this.width, this.height - handAreaHeight, 0, 0, this.colors.white);
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

MAX_LOG_LINES = 6;

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
    var results;
    this.log.push(text);
    results = [];
    while (this.log.length > MAX_LOG_LINES) {
      results.push(this.log.shift());
    }
    return results;
  };

  Thirteen.prototype.headline = function() {
    var currentPlayer, headline, playString, playerColor;
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
    if (currentPlayer.ai) {
      playerColor = 'b0b000';
    } else {
      playerColor = 'ff7700';
    }
    headline = "`" + playerColor + "`" + currentPlayer.name + "`ffffff` to " + playString;
    if (this.everyonePassed()) {
      headline += " (or throw anything)";
    }
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
    this.textures = ["../images/cards.png", "../images/darkforest.png", "../images/chars.png", "../images/howtoplay1.png"];
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQW5pbWF0aW9uLmNvZmZlZSIsInNyYy9CdXR0b24uY29mZmVlIiwic3JjL0ZvbnRSZW5kZXJlci5jb2ZmZWUiLCJzcmMvR2FtZS5jb2ZmZWUiLCJzcmMvSGFuZC5jb2ZmZWUiLCJzcmMvTWVudS5jb2ZmZWUiLCJzcmMvUGlsZS5jb2ZmZWUiLCJzcmMvU3ByaXRlUmVuZGVyZXIuY29mZmVlIiwic3JjL1RoaXJ0ZWVuLmNvZmZlZSIsInNyYy9mb250bWV0cmljcy5jb2ZmZWUiLCJzcmMvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBOztBQUFBLFFBQUEsR0FBVyxTQUFDLENBQUQ7RUFDVCxJQUFHLENBQUEsS0FBSyxDQUFSO0FBQ0UsV0FBTyxFQURUO0dBQUEsTUFFSyxJQUFHLENBQUEsR0FBSSxDQUFQO0FBQ0gsV0FBTyxDQUFDLEVBREw7O0FBRUwsU0FBTztBQUxFOztBQU9MO0VBQ1MsbUJBQUMsSUFBRDtBQUNYLFFBQUE7SUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksQ0FBQztJQUNkLElBQUMsQ0FBQSxHQUFELEdBQU87SUFDUCxJQUFDLENBQUEsR0FBRCxHQUFPO0FBQ1AsU0FBQSxTQUFBOztNQUNFLElBQUcsQ0FBQSxLQUFLLE9BQVI7UUFDRSxJQUFDLENBQUEsR0FBSSxDQUFBLENBQUEsQ0FBTCxHQUFVO1FBQ1YsSUFBQyxDQUFBLEdBQUksQ0FBQSxDQUFBLENBQUwsR0FBVSxFQUZaOztBQURGO0VBSlc7O3NCQVViLElBQUEsR0FBTSxTQUFBO0lBQ0osSUFBRyxrQkFBSDtNQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBTCxHQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFEaEI7O0lBRUEsSUFBRyxrQkFBSDtNQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBTCxHQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFEaEI7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LEtBQUwsQ0FBVyxNQUFNLENBQUMsV0FBUCxHQUFxQixrQkFBaEM7V0FDZixNQUFNLENBQUMsTUFBUCxHQUFnQixNQUFNLENBQUMsWUFMekI7O0FBSGE7O0FBU2YsWUFBQSxDQUFBOztBQUdBLEdBQUEsR0FBTSxJQUFJLFNBQUosQ0FBYyxNQUFkLEVBQXNCLE1BQU0sQ0FBQyxLQUE3QixFQUFvQyxNQUFNLENBQUMsTUFBM0MiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjYWxjU2lnbiA9ICh2KSAtPlxuICBpZiB2ID09IDBcbiAgICByZXR1cm4gMFxuICBlbHNlIGlmIHYgPCAwXG4gICAgcmV0dXJuIC0xXG4gIHJldHVybiAxXG5cbmNsYXNzIEFuaW1hdGlvblxuICBjb25zdHJ1Y3RvcjogKGRhdGEpIC0+XG4gICAgQHNwZWVkID0gZGF0YS5zcGVlZFxuICAgIEByZXEgPSB7fVxuICAgIEBjdXIgPSB7fVxuICAgIGZvciBrLHYgb2YgZGF0YVxuICAgICAgaWYgayAhPSAnc3BlZWQnXG4gICAgICAgIEByZXFba10gPSB2XG4gICAgICAgIEBjdXJba10gPSB2XG5cbiAgIyAnZmluaXNoZXMnIGFsbCBhbmltYXRpb25zXG4gIHdhcnA6IC0+XG4gICAgaWYgQGN1ci5yP1xuICAgICAgQGN1ci5yID0gQHJlcS5yXG4gICAgaWYgQGN1ci5zP1xuICAgICAgQGN1ci5zID0gQHJlcS5zXG4gICAgaWYgQGN1ci54PyBhbmQgQGN1ci55P1xuICAgICAgQGN1ci54ID0gQHJlcS54XG4gICAgICBAY3VyLnkgPSBAcmVxLnlcblxuICBhbmltYXRpbmc6IC0+XG4gICAgaWYgQGN1ci5yP1xuICAgICAgaWYgQHJlcS5yICE9IEBjdXIuclxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIGlmIEBjdXIucz9cbiAgICAgIGlmIEByZXEucyAhPSBAY3VyLnNcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICBpZiBAY3VyLng/IGFuZCBAY3VyLnk/XG4gICAgICBpZiAoQHJlcS54ICE9IEBjdXIueCkgb3IgKEByZXEueSAhPSBAY3VyLnkpXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgdXBkYXRlOiAoZHQpIC0+XG4gICAgdXBkYXRlZCA9IGZhbHNlXG4gICAgIyByb3RhdGlvblxuICAgIGlmIEBjdXIucj9cbiAgICAgIGlmIEByZXEuciAhPSBAY3VyLnJcbiAgICAgICAgdXBkYXRlZCA9IHRydWVcbiAgICAgICAgIyBzYW5pdGl6ZSByZXF1ZXN0ZWQgcm90YXRpb25cbiAgICAgICAgdHdvUGkgPSBNYXRoLlBJICogMlxuICAgICAgICBuZWdUd29QaSA9IC0xICogdHdvUGlcbiAgICAgICAgQHJlcS5yIC09IHR3b1BpIHdoaWxlIEByZXEuciA+PSB0d29QaVxuICAgICAgICBAcmVxLnIgKz0gdHdvUGkgd2hpbGUgQHJlcS5yIDw9IG5lZ1R3b1BpXG4gICAgICAgICMgcGljayBhIGRpcmVjdGlvbiBhbmQgdHVyblxuICAgICAgICBkciA9IEByZXEuciAtIEBjdXIuclxuICAgICAgICBkaXN0ID0gTWF0aC5hYnMoZHIpXG4gICAgICAgIHNpZ24gPSBjYWxjU2lnbihkcilcbiAgICAgICAgaWYgZGlzdCA+IE1hdGguUElcbiAgICAgICAgICAjIHNwaW4gdGhlIG90aGVyIGRpcmVjdGlvbiwgaXQgaXMgY2xvc2VyXG4gICAgICAgICAgZGlzdCA9IHR3b1BpIC0gZGlzdFxuICAgICAgICAgIHNpZ24gKj0gLTFcbiAgICAgICAgbWF4RGlzdCA9IGR0ICogQHNwZWVkLnIgLyAxMDAwXG4gICAgICAgIGlmIGRpc3QgPCBtYXhEaXN0XG4gICAgICAgICAgIyB3ZSBjYW4gZmluaXNoIHRoaXMgZnJhbWVcbiAgICAgICAgICBAY3VyLnIgPSBAcmVxLnJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBjdXIuciArPSBtYXhEaXN0ICogc2lnblxuXG4gICAgIyBzY2FsZVxuICAgIGlmIEBjdXIucz9cbiAgICAgIGlmIEByZXEucyAhPSBAY3VyLnNcbiAgICAgICAgdXBkYXRlZCA9IHRydWVcbiAgICAgICAgIyBwaWNrIGEgZGlyZWN0aW9uIGFuZCB0dXJuXG4gICAgICAgIGRzID0gQHJlcS5zIC0gQGN1ci5zXG4gICAgICAgIGRpc3QgPSBNYXRoLmFicyhkcylcbiAgICAgICAgc2lnbiA9IGNhbGNTaWduKGRzKVxuICAgICAgICBtYXhEaXN0ID0gZHQgKiBAc3BlZWQucyAvIDEwMDBcbiAgICAgICAgaWYgZGlzdCA8IG1heERpc3RcbiAgICAgICAgICAjIHdlIGNhbiBmaW5pc2ggdGhpcyBmcmFtZVxuICAgICAgICAgIEBjdXIucyA9IEByZXEuc1xuICAgICAgICBlbHNlXG4gICAgICAgICAgQGN1ci5zICs9IG1heERpc3QgKiBzaWduXG5cbiAgICAjIHRyYW5zbGF0aW9uXG4gICAgaWYgQGN1ci54PyBhbmQgQGN1ci55P1xuICAgICAgaWYgKEByZXEueCAhPSBAY3VyLngpIG9yIChAcmVxLnkgIT0gQGN1ci55KVxuICAgICAgICB1cGRhdGVkID0gdHJ1ZVxuICAgICAgICB2ZWNYID0gQHJlcS54IC0gQGN1ci54XG4gICAgICAgIHZlY1kgPSBAcmVxLnkgLSBAY3VyLnlcbiAgICAgICAgZGlzdCA9IE1hdGguc3FydCgodmVjWCAqIHZlY1gpICsgKHZlY1kgKiB2ZWNZKSlcbiAgICAgICAgbWF4RGlzdCA9IGR0ICogQHNwZWVkLnQgLyAxMDAwXG4gICAgICAgIGlmIGRpc3QgPCBtYXhEaXN0XG4gICAgICAgICAgIyB3ZSBjYW4gZmluaXNoIHRoaXMgZnJhbWVcbiAgICAgICAgICBAY3VyLnggPSBAcmVxLnhcbiAgICAgICAgICBAY3VyLnkgPSBAcmVxLnlcbiAgICAgICAgZWxzZVxuICAgICAgICAgICMgbW92ZSBhcyBtdWNoIGFzIHBvc3NpYmxlXG4gICAgICAgICAgQGN1ci54ICs9ICh2ZWNYIC8gZGlzdCkgKiBtYXhEaXN0XG4gICAgICAgICAgQGN1ci55ICs9ICh2ZWNZIC8gZGlzdCkgKiBtYXhEaXN0XG5cbiAgICByZXR1cm4gdXBkYXRlZFxuXG5tb2R1bGUuZXhwb3J0cyA9IEFuaW1hdGlvblxuIiwiQW5pbWF0aW9uID0gcmVxdWlyZSAnLi9BbmltYXRpb24nXG5cbmNsYXNzIEJ1dHRvblxuICBjb25zdHJ1Y3RvcjogKEBnYW1lLCBAc3ByaXRlTmFtZXMsIEBmb250LCBAdGV4dEhlaWdodCwgQHgsIEB5LCBAY2IpIC0+XG4gICAgQGFuaW0gPSBuZXcgQW5pbWF0aW9uIHtcbiAgICAgIHNwZWVkOiB7IHM6IDMgfVxuICAgICAgczogMFxuICAgIH1cbiAgICBAY29sb3IgPSB7IHI6IDEsIGc6IDEsIGI6IDEsIGE6IDAgfVxuXG4gIHVwZGF0ZTogKGR0KSAtPlxuICAgIHJldHVybiBAYW5pbS51cGRhdGUoZHQpXG5cbiAgcmVuZGVyOiAtPlxuICAgIEBjb2xvci5hID0gQGFuaW0uY3VyLnNcbiAgICBAZ2FtZS5zcHJpdGVSZW5kZXJlci5yZW5kZXIgQHNwcml0ZU5hbWVzWzBdLCBAeCwgQHksIDAsIEB0ZXh0SGVpZ2h0ICogMS41LCAwLCAwLjUsIDAuNSwgQGdhbWUuY29sb3JzLndoaXRlLCA9PlxuICAgICAgIyBwdWxzZSBidXR0b24gYW5pbSxcbiAgICAgIEBhbmltLmN1ci5zID0gMVxuICAgICAgQGFuaW0ucmVxLnMgPSAwXG4gICAgICAjIHRoZW4gY2FsbCBjYWxsYmFja1xuICAgICAgQGNiKHRydWUpXG4gICAgQGdhbWUuc3ByaXRlUmVuZGVyZXIucmVuZGVyIEBzcHJpdGVOYW1lc1sxXSwgQHgsIEB5LCAwLCBAdGV4dEhlaWdodCAqIDEuNSwgMCwgMC41LCAwLjUsIEBjb2xvclxuICAgIHRleHQgPSBAY2IoZmFsc2UpXG4gICAgQGdhbWUuZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgQHRleHRIZWlnaHQsIHRleHQsIEB4LCBAeSwgMC41LCAwLjUsIEBnYW1lLmNvbG9ycy5idXR0b250ZXh0XG5cbm1vZHVsZS5leHBvcnRzID0gQnV0dG9uXG4iLCJmb250bWV0cmljcyA9IHJlcXVpcmUgJy4vZm9udG1ldHJpY3MnXG5cbiMgdGFrZW4gZnJvbSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzU2MjM4MzgvcmdiLXRvLWhleC1hbmQtaGV4LXRvLXJnYlxuaGV4VG9SZ2IgPSAoaGV4LCBhKSAtPlxuICAgIHJlc3VsdCA9IC9eIz8oW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KShbYS1mXFxkXXsyfSkkL2kuZXhlYyhoZXgpXG4gICAgcmV0dXJuIG51bGwgaWYgbm90IHJlc3VsdFxuICAgIHJldHVybiB7XG4gICAgICAgIHI6IHBhcnNlSW50KHJlc3VsdFsxXSwgMTYpIC8gMjU1LFxuICAgICAgICBnOiBwYXJzZUludChyZXN1bHRbMl0sIDE2KSAvIDI1NSxcbiAgICAgICAgYjogcGFyc2VJbnQocmVzdWx0WzNdLCAxNikgLyAyNTVcbiAgICAgICAgYTogYVxuICAgIH1cblxuY2xhc3MgRm9udFJlbmRlcmVyXG4gIGNvbnN0cnVjdG9yOiAgKEBnYW1lKSAtPlxuICAgIEB3aGl0ZSA9IHsgcjogMSwgZzogMSwgYjogMSwgYTogMSB9XG5cbiAgc2l6ZTogKGZvbnQsIGhlaWdodCwgc3RyKSAtPlxuICAgIG1ldHJpY3MgPSBmb250bWV0cmljc1tmb250XVxuICAgIHJldHVybiBpZiBub3QgbWV0cmljc1xuICAgIHNjYWxlID0gaGVpZ2h0IC8gbWV0cmljcy5oZWlnaHRcblxuICAgIHRvdGFsV2lkdGggPSAwXG4gICAgdG90YWxIZWlnaHQgPSBtZXRyaWNzLmhlaWdodCAqIHNjYWxlXG5cbiAgICBpbkNvbG9yID0gZmFsc2VcbiAgICBmb3IgY2gsIGkgaW4gc3RyXG4gICAgICBpZiBjaCA9PSAnYCdcbiAgICAgICAgaW5Db2xvciA9ICFpbkNvbG9yXG5cbiAgICAgIGlmIG5vdCBpbkNvbG9yXG4gICAgICAgIGNvZGUgPSBjaC5jaGFyQ29kZUF0KDApXG4gICAgICAgIGdseXBoID0gbWV0cmljcy5nbHlwaHNbY29kZV1cbiAgICAgICAgY29udGludWUgaWYgbm90IGdseXBoXG4gICAgICAgIHRvdGFsV2lkdGggKz0gZ2x5cGgueGFkdmFuY2UgKiBzY2FsZVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHc6IHRvdGFsV2lkdGhcbiAgICAgIGg6IHRvdGFsSGVpZ2h0XG4gICAgfVxuXG4gIHJlbmRlcjogKGZvbnQsIGhlaWdodCwgc3RyLCB4LCB5LCBhbmNob3J4LCBhbmNob3J5LCBjb2xvciwgY2IpIC0+XG4gICAgbWV0cmljcyA9IGZvbnRtZXRyaWNzW2ZvbnRdXG4gICAgcmV0dXJuIGlmIG5vdCBtZXRyaWNzXG4gICAgc2NhbGUgPSBoZWlnaHQgLyBtZXRyaWNzLmhlaWdodFxuXG4gICAgdG90YWxXaWR0aCA9IDBcbiAgICB0b3RhbEhlaWdodCA9IG1ldHJpY3MuaGVpZ2h0ICogc2NhbGVcbiAgICBza2lwQ29sb3IgPSBmYWxzZVxuICAgIGZvciBjaCwgaSBpbiBzdHJcbiAgICAgIGlmIGNoID09ICdgJ1xuICAgICAgICBza2lwQ29sb3IgPSAhc2tpcENvbG9yXG4gICAgICBjb250aW51ZSBpZiBza2lwQ29sb3JcbiAgICAgIGNvZGUgPSBjaC5jaGFyQ29kZUF0KDApXG4gICAgICBnbHlwaCA9IG1ldHJpY3MuZ2x5cGhzW2NvZGVdXG4gICAgICBjb250aW51ZSBpZiBub3QgZ2x5cGhcbiAgICAgIHRvdGFsV2lkdGggKz0gZ2x5cGgueGFkdmFuY2UgKiBzY2FsZVxuXG4gICAgYW5jaG9yT2Zmc2V0WCA9IC0xICogYW5jaG9yeCAqIHRvdGFsV2lkdGhcbiAgICBhbmNob3JPZmZzZXRZID0gLTEgKiBhbmNob3J5ICogdG90YWxIZWlnaHRcbiAgICBjdXJyWCA9IHhcblxuICAgIGlmIGNvbG9yXG4gICAgICBzdGFydGluZ0NvbG9yID0gY29sb3JcbiAgICBlbHNlXG4gICAgICBzdGFydGluZ0NvbG9yID0gQHdoaXRlXG4gICAgY3VycmVudENvbG9yID0gc3RhcnRpbmdDb2xvclxuXG4gICAgY29sb3JTdGFydCA9IC0xXG4gICAgZm9yIGNoLCBpIGluIHN0clxuICAgICAgaWYgY2ggPT0gJ2AnXG4gICAgICAgIGlmIGNvbG9yU3RhcnQgPT0gLTFcbiAgICAgICAgICBjb2xvclN0YXJ0ID0gaSArIDFcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGxlbiA9IGkgLSBjb2xvclN0YXJ0XG4gICAgICAgICAgaWYgbGVuXG4gICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBoZXhUb1JnYihzdHIuc3Vic3RyKGNvbG9yU3RhcnQsIGkgLSBjb2xvclN0YXJ0KSwgc3RhcnRpbmdDb2xvci5hKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGN1cnJlbnRDb2xvciA9IHN0YXJ0aW5nQ29sb3JcbiAgICAgICAgICBjb2xvclN0YXJ0ID0gLTFcblxuICAgICAgY29udGludWUgaWYgY29sb3JTdGFydCAhPSAtMVxuICAgICAgY29kZSA9IGNoLmNoYXJDb2RlQXQoMClcbiAgICAgIGdseXBoID0gbWV0cmljcy5nbHlwaHNbY29kZV1cbiAgICAgIGNvbnRpbnVlIGlmIG5vdCBnbHlwaFxuICAgICAgQGdhbWUuZHJhd0ltYWdlIGZvbnQsXG4gICAgICBnbHlwaC54LCBnbHlwaC55LCBnbHlwaC53aWR0aCwgZ2x5cGguaGVpZ2h0LFxuICAgICAgY3VyclggKyAoZ2x5cGgueG9mZnNldCAqIHNjYWxlKSArIGFuY2hvck9mZnNldFgsIHkgKyAoZ2x5cGgueW9mZnNldCAqIHNjYWxlKSArIGFuY2hvck9mZnNldFksIGdseXBoLndpZHRoICogc2NhbGUsIGdseXBoLmhlaWdodCAqIHNjYWxlLFxuICAgICAgMCwgMCwgMCxcbiAgICAgIGN1cnJlbnRDb2xvci5yLCBjdXJyZW50Q29sb3IuZywgY3VycmVudENvbG9yLmIsIGN1cnJlbnRDb2xvci5hLCBjYlxuICAgICAgY3VyclggKz0gZ2x5cGgueGFkdmFuY2UgKiBzY2FsZVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZvbnRSZW5kZXJlclxuIiwiQW5pbWF0aW9uID0gcmVxdWlyZSAnLi9BbmltYXRpb24nXG5CdXR0b24gPSByZXF1aXJlICcuL0J1dHRvbidcbkZvbnRSZW5kZXJlciA9IHJlcXVpcmUgJy4vRm9udFJlbmRlcmVyJ1xuU3ByaXRlUmVuZGVyZXIgPSByZXF1aXJlICcuL1Nwcml0ZVJlbmRlcmVyJ1xuTWVudSA9IHJlcXVpcmUgJy4vTWVudSdcbkhhbmQgPSByZXF1aXJlICcuL0hhbmQnXG5QaWxlID0gcmVxdWlyZSAnLi9QaWxlJ1xue1RoaXJ0ZWVuLCBPSywgYWlDaGFyYWN0ZXJzfSA9IHJlcXVpcmUgJy4vVGhpcnRlZW4nXG5cbiMgdGVtcFxuQlVJTERfVElNRVNUQU1QID0gXCIwLjAuMVwiXG5cbmNsYXNzIEdhbWVcbiAgY29uc3RydWN0b3I6IChAbmF0aXZlLCBAd2lkdGgsIEBoZWlnaHQpIC0+XG4gICAgQHZlcnNpb24gPSBCVUlMRF9USU1FU1RBTVBcbiAgICBAbG9nKFwiR2FtZSBjb25zdHJ1Y3RlZDogI3tAd2lkdGh9eCN7QGhlaWdodH1cIilcbiAgICBAZm9udFJlbmRlcmVyID0gbmV3IEZvbnRSZW5kZXJlciB0aGlzXG4gICAgQHNwcml0ZVJlbmRlcmVyID0gbmV3IFNwcml0ZVJlbmRlcmVyIHRoaXNcbiAgICBAZm9udCA9IFwiZGFya2ZvcmVzdFwiXG4gICAgQHpvbmVzID0gW11cbiAgICBAbmV4dEFJVGljayA9IDEwMDAgIyB3aWxsIGJlIHNldCBieSBvcHRpb25zXG4gICAgQGNlbnRlciA9XG4gICAgICB4OiBAd2lkdGggLyAyXG4gICAgICB5OiBAaGVpZ2h0IC8gMlxuICAgIEBhYUhlaWdodCA9IEB3aWR0aCAqIDkgLyAxNlxuICAgIEBsb2cgXCJoZWlnaHQ6ICN7QGhlaWdodH0uIGhlaWdodCBpZiBzY3JlZW4gd2FzIDE2OjkgKGFzcGVjdCBhZGp1c3RlZCk6ICN7QGFhSGVpZ2h0fVwiXG4gICAgQHBhdXNlQnV0dG9uU2l6ZSA9IEBhYUhlaWdodCAvIDE1XG4gICAgQGNvbG9ycyA9XG4gICAgICB3aGl0ZTogICAgICB7IHI6ICAgMSwgZzogICAxLCBiOiAgIDEsIGE6ICAgMSB9XG4gICAgICBibGFjazogICAgICB7IHI6ICAgMCwgZzogICAwLCBiOiAgIDAsIGE6ICAgMSB9XG4gICAgICByZWQ6ICAgICAgICB7IHI6ICAgMSwgZzogICAwLCBiOiAgIDAsIGE6ICAgMSB9XG4gICAgICBvcmFuZ2U6ICAgICB7IHI6ICAgMSwgZzogMC41LCBiOiAgIDAsIGE6ICAgMSB9XG4gICAgICBnb2xkOiAgICAgICB7IHI6ICAgMSwgZzogICAxLCBiOiAgIDAsIGE6ICAgMSB9XG4gICAgICBidXR0b250ZXh0OiB7IHI6ICAgMSwgZzogICAxLCBiOiAgIDEsIGE6ICAgMSB9XG4gICAgICBsb2djb2xvcjogICB7IHI6IDAuNSwgZzogMC41LCBiOiAwLjUsIGE6ICAgMSB9XG4gICAgICBsaWdodGdyYXk6ICB7IHI6IDAuNSwgZzogMC41LCBiOiAwLjUsIGE6ICAgMSB9XG4gICAgICBiYWNrZ3JvdW5kOiB7IHI6ICAgMCwgZzogMC4yLCBiOiAgIDAsIGE6ICAgMSB9XG4gICAgICBwaWxlOiAgICAgICB7IHI6IDAuNCwgZzogMC4yLCBiOiAgIDAsIGE6ICAgMSB9XG4gICAgICBsb2diZzogICAgICB7IHI6IDAuMSwgZzogICAwLCBiOiAgIDAsIGE6ICAgMSB9XG4gICAgICBhcnJvdzogICAgICB7IHI6ICAgMSwgZzogICAxLCBiOiAgIDEsIGE6ICAgMSB9XG4gICAgICBhcnJvd2Nsb3NlOiB7IHI6ICAgMSwgZzogMC41LCBiOiAgIDAsIGE6IDAuMyB9XG4gICAgICBoYW5kX3BpY2s6ICB7IHI6ICAgMCwgZzogMC4xLCBiOiAgIDAsIGE6IDEuMCB9XG4gICAgICBoYW5kX3Jlb3JnOiB7IHI6IDAuNCwgZzogICAwLCBiOiAgIDAsIGE6IDEuMCB9XG4gICAgICBoYW5kX2FueTogICB7IHI6ICAgMCwgZzogICAwLCBiOiAwLjIsIGE6IDEuMCB9XG4gICAgICBwbGF5X2FnYWluOiB7IHI6ICAgMCwgZzogICAwLCBiOiAgIDAsIGE6IDAuNyB9XG4gICAgICBvdmVybGF5OiAgICB7IHI6ICAgMCwgZzogICAwLCBiOiAgIDAsIGE6IDAuNiB9XG4gICAgICBtYWlubWVudTogICB7IHI6IDAuMSwgZzogMC4xLCBiOiAwLjEsIGE6ICAgMSB9XG4gICAgICBwYXVzZW1lbnU6ICB7IHI6IDAuMSwgZzogMC4wLCBiOiAwLjEsIGE6ICAgMSB9XG4gICAgICBiaWQ6ICAgICAgICB7IHI6ICAgMCwgZzogMC42LCBiOiAgIDAsIGE6ICAgMSB9XG4gICAgICBnYW1lX292ZXI6ICB7IHI6IDAuNiwgZzogMC45LCBiOiAgIDEsIGE6ICAgMSB9XG5cbiAgICBAdGV4dHVyZXMgPVxuICAgICAgXCJjYXJkc1wiOiAwXG4gICAgICBcImRhcmtmb3Jlc3RcIjogMVxuICAgICAgXCJjaGFyc1wiOiAyXG4gICAgICBcImhvd3RvMVwiOiAzXG5cbiAgICBAdGhpcnRlZW4gPSBudWxsXG4gICAgQGxhc3RFcnIgPSAnJ1xuICAgIEBwYXVzZWQgPSBmYWxzZVxuICAgIEBob3d0byA9IDBcbiAgICBAcmVuZGVyQ29tbWFuZHMgPSBbXVxuXG4gICAgQG9wdGlvbk1lbnVzID1cbiAgICAgIHNwZWVkczogW1xuICAgICAgICB7IHRleHQ6IFwiQUkgU3BlZWQ6IFNsb3dcIiwgc3BlZWQ6IDIwMDAgfVxuICAgICAgICB7IHRleHQ6IFwiQUkgU3BlZWQ6IE1lZGl1bVwiLCBzcGVlZDogMTAwMCB9XG4gICAgICAgIHsgdGV4dDogXCJBSSBTcGVlZDogRmFzdFwiLCBzcGVlZDogNTAwIH1cbiAgICAgICAgeyB0ZXh0OiBcIkFJIFNwZWVkOiBVbHRyYVwiLCBzcGVlZDogMjUwIH1cbiAgICAgIF1cbiAgICAgIHNvcnRzOiBbXG4gICAgICAgIHsgdGV4dDogXCJTb3J0IE9yZGVyOiBOb3JtYWxcIiB9XG4gICAgICAgIHsgdGV4dDogXCJTb3J0IE9yZGVyOiBSZXZlcnNlXCIgfVxuICAgICAgXVxuICAgIEBvcHRpb25zID1cbiAgICAgIHNwZWVkSW5kZXg6IDFcbiAgICAgIHNvcnRJbmRleDogMFxuICAgICAgc291bmQ6IHRydWVcblxuICAgIEBtYWluTWVudSA9IG5ldyBNZW51IHRoaXMsIFwiVGhpcnRlZW5cIiwgXCJzb2xpZFwiLCBAY29sb3JzLm1haW5tZW51LCBbXG4gICAgICAoY2xpY2spID0+XG4gICAgICAgIGlmIGNsaWNrXG4gICAgICAgICAgQGhvd3RvID0gMVxuICAgICAgICByZXR1cm4gXCJIb3cgVG8gUGxheVwiXG4gICAgICAoY2xpY2spID0+XG4gICAgICAgIGlmIGNsaWNrXG4gICAgICAgICAgQG9wdGlvbnMuc3BlZWRJbmRleCA9IChAb3B0aW9ucy5zcGVlZEluZGV4ICsgMSkgJSBAb3B0aW9uTWVudXMuc3BlZWRzLmxlbmd0aFxuICAgICAgICByZXR1cm4gQG9wdGlvbk1lbnVzLnNwZWVkc1tAb3B0aW9ucy5zcGVlZEluZGV4XS50ZXh0XG4gICAgICAoY2xpY2spID0+XG4gICAgICAgIGlmIGNsaWNrXG4gICAgICAgICAgQG9wdGlvbnMuc29ydEluZGV4ID0gKEBvcHRpb25zLnNvcnRJbmRleCArIDEpICUgQG9wdGlvbk1lbnVzLnNvcnRzLmxlbmd0aFxuICAgICAgICByZXR1cm4gQG9wdGlvbk1lbnVzLnNvcnRzW0BvcHRpb25zLnNvcnRJbmRleF0udGV4dFxuICAgICAgKGNsaWNrKSA9PlxuICAgICAgICBpZiBjbGlja1xuICAgICAgICAgIEBuZXdHYW1lKClcbiAgICAgICAgcmV0dXJuIFwiU3RhcnRcIlxuICAgIF1cblxuICAgIEBwYXVzZU1lbnUgPSBuZXcgTWVudSB0aGlzLCBcIlBhdXNlZFwiLCBcInNvbGlkXCIsIEBjb2xvcnMucGF1c2VtZW51LCBbXG4gICAgICAoY2xpY2spID0+XG4gICAgICAgIGlmIGNsaWNrXG4gICAgICAgICAgQHBhdXNlZCA9IGZhbHNlXG4gICAgICAgIHJldHVybiBcIlJlc3VtZSBHYW1lXCJcbiAgICAgIChjbGljaykgPT5cbiAgICAgICAgaWYgY2xpY2tcbiAgICAgICAgICBAbmV3R2FtZSgpXG4gICAgICAgICAgQHBhdXNlZCA9IGZhbHNlXG4gICAgICAgIHJldHVybiBcIk5ldyBHYW1lXCJcbiAgICAgIChjbGljaykgPT5cbiAgICAgICAgaWYgY2xpY2tcbiAgICAgICAgICBAaG93dG8gPSAxXG4gICAgICAgIHJldHVybiBcIkhvdyBUbyBQbGF5XCJcbiAgICAgIChjbGljaykgPT5cbiAgICAgICAgaWYgY2xpY2tcbiAgICAgICAgICBAb3B0aW9ucy5zcGVlZEluZGV4ID0gKEBvcHRpb25zLnNwZWVkSW5kZXggKyAxKSAlIEBvcHRpb25NZW51cy5zcGVlZHMubGVuZ3RoXG4gICAgICAgIHJldHVybiBAb3B0aW9uTWVudXMuc3BlZWRzW0BvcHRpb25zLnNwZWVkSW5kZXhdLnRleHRcbiAgICAgIChjbGljaykgPT5cbiAgICAgICAgaWYgY2xpY2tcbiAgICAgICAgICBAb3B0aW9ucy5zb3J0SW5kZXggPSAoQG9wdGlvbnMuc29ydEluZGV4ICsgMSkgJSBAb3B0aW9uTWVudXMuc29ydHMubGVuZ3RoXG4gICAgICAgIHJldHVybiBAb3B0aW9uTWVudXMuc29ydHNbQG9wdGlvbnMuc29ydEluZGV4XS50ZXh0XG4gICAgXVxuXG4gICAgQG5ld0dhbWUoKVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyBsb2dnaW5nXG5cbiAgbG9nOiAocykgLT5cbiAgICBAbmF0aXZlLmxvZyhzKVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyBsb2FkIC8gc2F2ZVxuXG4gIGxvYWQ6IChqc29uKSAtPlxuICAgIEBsb2cgXCIoQ1MpIGxvYWRpbmcgc3RhdGVcIlxuICAgIHRyeVxuICAgICAgc3RhdGUgPSBKU09OLnBhcnNlIGpzb25cbiAgICBjYXRjaFxuICAgICAgQGxvZyBcImxvYWQgZmFpbGVkIHRvIHBhcnNlIHN0YXRlOiAje2pzb259XCJcbiAgICAgIHJldHVyblxuICAgIGlmIHN0YXRlLm9wdGlvbnNcbiAgICAgIGZvciBrLCB2IG9mIHN0YXRlLm9wdGlvbnNcbiAgICAgICAgQG9wdGlvbnNba10gPSB2XG5cbiAgICBpZiBzdGF0ZS50aGlydGVlblxuICAgICAgQGxvZyBcInJlY3JlYXRpbmcgZ2FtZSBmcm9tIHNhdmVkYXRhXCJcbiAgICAgIEB0aGlydGVlbiA9IG5ldyBUaGlydGVlbiB0aGlzLCB7XG4gICAgICAgIHN0YXRlOiBzdGF0ZS50aGlydGVlblxuICAgICAgfVxuICAgICAgQHByZXBhcmVHYW1lKClcblxuICBzYXZlOiAtPlxuICAgICMgQGxvZyBcIihDUykgc2F2aW5nIHN0YXRlXCJcbiAgICBzdGF0ZSA9IHtcbiAgICAgIG9wdGlvbnM6IEBvcHRpb25zXG4gICAgfVxuXG4gICAgIyBUT0RPOiBFTkFCTEUgU0FWSU5HIEhFUkVcbiAgICBpZiBAdGhpcnRlZW4/XG4gICAgICBAdGhpcnRlZW4udXBkYXRlUGxheWVySGFuZChAaGFuZC5jYXJkcylcbiAgICAgIHN0YXRlLnRoaXJ0ZWVuID0gQHRoaXJ0ZWVuLnNhdmUoKVxuXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5IHN0YXRlXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIGFpVGlja1JhdGU6IC0+XG4gICAgcmV0dXJuIEBvcHRpb25NZW51cy5zcGVlZHNbQG9wdGlvbnMuc3BlZWRJbmRleF0uc3BlZWRcblxuICBuZXdHYW1lOiAtPlxuICAgIEB0aGlydGVlbiA9IG5ldyBUaGlydGVlbiB0aGlzLCB7fVxuICAgIEBsb2cgXCJwbGF5ZXIgMCdzIGhhbmQ6IFwiICsgSlNPTi5zdHJpbmdpZnkoQHRoaXJ0ZWVuLnBsYXllcnNbMF0uaGFuZClcbiAgICBAcHJlcGFyZUdhbWUoKVxuXG4gIHByZXBhcmVHYW1lOiAtPlxuICAgIEBoYW5kID0gbmV3IEhhbmQgdGhpc1xuICAgIEBwaWxlID0gbmV3IFBpbGUgdGhpcywgQGhhbmRcbiAgICBAaGFuZC5zZXQgQHRoaXJ0ZWVuLnBsYXllcnNbMF0uaGFuZFxuICAgIEBsYXN0RXJyID0gJydcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgaW5wdXQgaGFuZGxpbmdcblxuICB0b3VjaERvd246ICh4LCB5KSAtPlxuICAgICMgQGxvZyhcInRvdWNoRG93biAje3h9LCN7eX1cIilcbiAgICBAY2hlY2tab25lcyh4LCB5KVxuXG4gIHRvdWNoTW92ZTogKHgsIHkpIC0+XG4gICAgIyBAbG9nKFwidG91Y2hNb3ZlICN7eH0sI3t5fVwiKVxuICAgIGlmIEB0aGlydGVlbiAhPSBudWxsXG4gICAgICBAaGFuZC5tb3ZlKHgsIHkpXG5cbiAgdG91Y2hVcDogKHgsIHkpIC0+XG4gICAgIyBAbG9nKFwidG91Y2hVcCAje3h9LCN7eX1cIilcbiAgICBpZiBAdGhpcnRlZW4gIT0gbnVsbFxuICAgICAgQGhhbmQudXAoeCwgeSlcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgaGVhZGxpbmUgKGdhbWUgc3RhdGUgaW4gdG9wIGxlZnQpXG5cbiAgcHJldHR5RXJyb3JUYWJsZToge1xuICAgICAgZ2FtZU92ZXI6ICAgICAgICAgICBcIlRoZSBnYW1lIGlzIG92ZXIuXCJcbiAgICAgIGludmFsaWRQbGF5OiAgICAgICAgXCJOb3QgYSB2YWxpZCBwbGF5LlwiXG4gICAgICBtdXN0QnJlYWtPclBhc3M6ICAgIFwiWW91IHBhc3NlZCBhbHJlYWR5LCBzbyAyLWJyZWFrZXIgb3IgcGFzcy5cIlxuICAgICAgbXVzdFBhc3M6ICAgICAgICAgICBcIllvdSBtdXN0IHBhc3MuXCJcbiAgICAgIG11c3RUaHJvdzNTOiAgICAgICAgXCJZb3UgbXVzdCB1c2UgdGhlIDNcXHhjOCBpbiB5b3VyIHBsYXkuXCJcbiAgICAgIG5vdFlvdXJUdXJuOiAgICAgICAgXCJJdCBpcyBub3QgeW91ciB0dXJuLlwiXG4gICAgICB0aHJvd0FueXRoaW5nOiAgICAgIFwiWW91IGhhdmUgY29udHJvbCwgdGhyb3cgYW55dGhpbmcuXCJcbiAgICAgIHRvb0xvd1BsYXk6ICAgICAgICAgXCJUaGlzIHBsYXkgaXMgbm90IHN0cm9uZ2VyIHRoYW4gdGhlIGN1cnJlbnQgcGxheS5cIlxuICAgICAgd3JvbmdQbGF5OiAgICAgICAgICBcIlRoaXMgcGxheSBkb2VzIG5vdCBtYXRjaCB0aGUgY3VycmVudCBwbGF5LlwiXG4gIH1cblxuICBwcmV0dHlFcnJvcjogLT5cbiAgICBwcmV0dHkgPSBAcHJldHR5RXJyb3JUYWJsZVtAbGFzdEVycl1cbiAgICByZXR1cm4gcHJldHR5IGlmIHByZXR0eVxuICAgIHJldHVybiBAbGFzdEVyclxuXG4gIGNhbGNIZWFkbGluZTogLT5cbiAgICByZXR1cm4gXCJcIiBpZiBAdGhpcnRlZW4gPT0gbnVsbFxuXG4gICAgaGVhZGxpbmUgPSBAdGhpcnRlZW4uaGVhZGxpbmUoKVxuICAgICMgc3dpdGNoIEB0aGlydGVlbi5zdGF0ZVxuICAgICMgICB3aGVuIFN0YXRlLkJJRFxuICAgICMgICAgIGhlYWRsaW5lID0gXCJXYWl0aW5nIGZvciBgZmY3NzAwYCN7QHRoaXJ0ZWVuLnBsYXllcnNbQHRoaXJ0ZWVuLnR1cm5dLm5hbWV9YGAgdG8gYGZmZmYwMGBiaWRgYFwiXG4gICAgIyAgIHdoZW4gU3RhdGUuVFJJQ0tcbiAgICAjICAgICBoZWFkbGluZSA9IFwiV2FpdGluZyBmb3IgYGZmNzcwMGAje0B0aGlydGVlbi5wbGF5ZXJzW0B0aGlydGVlbi50dXJuXS5uYW1lfWBgIHRvIGBmZmZmMDBgcGxheWBgXCJcbiAgICAjICAgd2hlbiBTdGF0ZS5ST1VORFNVTU1BUllcbiAgICAjICAgICBoZWFkbGluZSA9IFwiV2FpdGluZyBmb3IgbmV4dCByb3VuZC4uLlwiXG4gICAgIyAgIHdoZW4gU3RhdGUuUE9TVEdBTUVTVU1NQVJZXG4gICAgIyAgICAgaGVhZGxpbmUgPSBcIkdhbWUgb3ZlciFcIlxuXG4gICAgZXJyVGV4dCA9IFwiXCJcbiAgICBpZiAoQGxhc3RFcnIubGVuZ3RoID4gMCkgYW5kIChAbGFzdEVyciAhPSBPSylcbiAgICAgIGVyclRleHQgPSBcIiAgYGZmZmZmZmBFUlJPUjogYGZmMDAwMGAje0BwcmV0dHlFcnJvcigpfVwiXG4gICAgICBoZWFkbGluZSArPSBlcnJUZXh0XG5cbiAgICByZXR1cm4gaGVhZGxpbmVcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgZ2FtZSBvdmVyIGluZm9ybWF0aW9uXG5cbiAgZ2FtZU92ZXJUZXh0OiAtPlxuICAgIHdpbm5lciA9IEB0aGlydGVlbi53aW5uZXIoKVxuICAgIGlmIHdpbm5lci5uYW1lID09IFwiUGxheWVyXCJcbiAgICAgIGlmIEB0aGlydGVlbi5sYXN0U3RyZWFrID09IDFcbiAgICAgICAgcmV0dXJuIFtcIllvdSB3aW4hXCIsIFwiQSBuZXcgc3RyZWFrIVwiXVxuICAgICAgcmV0dXJuIFtcIllvdSB3aW4hXCIsIFwiI3tAdGhpcnRlZW4ubGFzdFN0cmVha30gaW4gYSByb3chXCJdXG4gICAgaWYgQHRoaXJ0ZWVuLmxhc3RTdHJlYWsgPT0gMFxuICAgICAgcmV0dXJuIFtcIiN7d2lubmVyLm5hbWV9IHdpbnMhXCIsIFwiVHJ5IGFnYWluLi4uXCJdXG4gICAgcmV0dXJuIFtcIiN7d2lubmVyLm5hbWV9IHdpbnMhXCIsIFwiTGFzdCBzdHJlYWs6ICN7QHRoaXJ0ZWVuLmxhc3RTdHJlYWt9IHdpbnNcIl1cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIGNhcmQgaGFuZGxpbmdcblxuICBwYXNzOiAtPlxuICAgIEBsYXN0RXJyID0gQHRoaXJ0ZWVuLnBhc3Mge1xuICAgICAgaWQ6IDFcbiAgICB9XG5cbiAgcGxheTogKGNhcmRzKSAtPlxuICAgIGNvbnNvbGUubG9nIFwiKGdhbWUpIHBsYXlpbmcgY2FyZHNcIiwgY2FyZHNcblxuICAgIEB0aGlydGVlbi51cGRhdGVQbGF5ZXJIYW5kKEBoYW5kLmNhcmRzKVxuXG4gICAgcmF3Q2FyZHMgPSBbXVxuICAgIGZvciBjYXJkIGluIGNhcmRzXG4gICAgICByYXdDYXJkcy5wdXNoIGNhcmQuY2FyZFxuXG4gICAgcmV0ID0gQHRoaXJ0ZWVuLnBsYXkge1xuICAgICAgaWQ6IDFcbiAgICAgIGNhcmRzOiByYXdDYXJkc1xuICAgIH1cbiAgICBAbGFzdEVyciA9IHJldFxuICAgIGlmIHJldCA9PSBPS1xuICAgICAgQGhhbmQuc2V0IEB0aGlydGVlbi5wbGF5ZXJzWzBdLmhhbmRcbiAgICAgIEBwaWxlLmhpbnQgY2FyZHNcblxuICBwbGF5UGlja2VkOiAtPlxuICAgIGlmIG5vdCBAaGFuZC5waWNraW5nXG4gICAgICByZXR1cm5cbiAgICBjYXJkcyA9IEBoYW5kLnNlbGVjdGVkQ2FyZHMoKVxuICAgIEBoYW5kLnNlbGVjdE5vbmUoKVxuICAgIGlmIGNhcmRzLmxlbmd0aCA9PSAwXG4gICAgICByZXR1cm4gQHBhc3MoKVxuICAgICMgQGhhbmQudG9nZ2xlUGlja2luZygpXG4gICAgcmV0dXJuIEBwbGF5KGNhcmRzKVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyBtYWluIGxvb3BcblxuICB1cGRhdGU6IChkdCkgLT5cbiAgICBAem9uZXMubGVuZ3RoID0gMCAjIGZvcmdldCBhYm91dCB6b25lcyBmcm9tIHRoZSBsYXN0IGZyYW1lLiB3ZSdyZSBhYm91dCB0byBtYWtlIHNvbWUgbmV3IG9uZXMhXG5cbiAgICB1cGRhdGVkID0gZmFsc2VcbiAgICBpZiBAdXBkYXRlTWFpbk1lbnUoZHQpXG4gICAgICB1cGRhdGVkID0gdHJ1ZVxuICAgIGlmIEB1cGRhdGVHYW1lKGR0KVxuICAgICAgdXBkYXRlZCA9IHRydWVcblxuICAgIHJldHVybiB1cGRhdGVkXG5cbiAgdXBkYXRlTWFpbk1lbnU6IChkdCkgLT5cbiAgICB1cGRhdGVkID0gZmFsc2VcbiAgICBpZiBAbWFpbk1lbnUudXBkYXRlKGR0KVxuICAgICAgdXBkYXRlZCA9IHRydWVcbiAgICByZXR1cm4gdXBkYXRlZFxuXG4gIHVwZGF0ZUdhbWU6IChkdCkgLT5cbiAgICByZXR1cm4gZmFsc2UgaWYgQHRoaXJ0ZWVuID09IG51bGxcblxuICAgIHVwZGF0ZWQgPSBmYWxzZVxuXG4gICAgaWYgQHBpbGUudXBkYXRlKGR0KVxuICAgICAgdXBkYXRlZCA9IHRydWVcbiAgICBpZiBAcGlsZS5yZWFkeUZvck5leHRUcmljaygpXG4gICAgICBAbmV4dEFJVGljayAtPSBkdFxuICAgICAgaWYgQG5leHRBSVRpY2sgPD0gMFxuICAgICAgICBAbmV4dEFJVGljayA9IEBhaVRpY2tSYXRlKClcbiAgICAgICAgaWYgQHRoaXJ0ZWVuLmFpVGljaygpXG4gICAgICAgICAgdXBkYXRlZCA9IHRydWVcbiAgICBpZiBAaGFuZC51cGRhdGUoZHQpXG4gICAgICB1cGRhdGVkID0gdHJ1ZVxuXG4gICAgQHBpbGUuc2V0IEB0aGlydGVlbi50aHJvd0lELCBAdGhpcnRlZW4ucGlsZSwgQHRoaXJ0ZWVuLnBpbGVXaG9cblxuICAgIGlmIEBwYXVzZU1lbnUudXBkYXRlKGR0KVxuICAgICAgdXBkYXRlZCA9IHRydWVcblxuICAgIHJldHVybiB1cGRhdGVkXG5cbiAgcmVuZGVyOiAtPlxuICAgICMgUmVzZXQgcmVuZGVyIGNvbW1hbmRzXG4gICAgQHJlbmRlckNvbW1hbmRzLmxlbmd0aCA9IDBcblxuICAgIGlmIEBob3d0byA+IDBcbiAgICAgIEByZW5kZXJIb3d0bygpXG4gICAgZWxzZSBpZiBAdGhpcnRlZW4gPT0gbnVsbFxuICAgICAgQHJlbmRlck1haW5NZW51KClcbiAgICBlbHNlXG4gICAgICBAcmVuZGVyR2FtZSgpXG5cbiAgICByZXR1cm4gQHJlbmRlckNvbW1hbmRzXG5cbiAgcmVuZGVySG93dG86IC0+XG4gICAgaG93dG9UZXh0dXJlID0gXCJob3d0byN7QGhvd3RvfVwiXG4gICAgQGxvZyBcInJlbmRlcmluZyAje2hvd3RvVGV4dHVyZX1cIlxuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJzb2xpZFwiLCAwLCAwLCBAd2lkdGgsIEBoZWlnaHQsIDAsIDAsIDAsIEBjb2xvcnMuYmxhY2tcbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIGhvd3RvVGV4dHVyZSwgMCwgMCwgQHdpZHRoLCBAYWFIZWlnaHQsIDAsIDAsIDAsIEBjb2xvcnMud2hpdGUsID0+XG4gICAgICBAaG93dG8gPSAwXG4gICAgIyBhcnJvd1dpZHRoID0gQHdpZHRoIC8gMjBcbiAgICAjIGFycm93T2Zmc2V0ID0gYXJyb3dXaWR0aCAqIDRcbiAgICAjIGNvbG9yID0gaWYgQGhvd3RvID09IDEgdGhlbiBAY29sb3JzLmFycm93Y2xvc2UgZWxzZSBAY29sb3JzLmFycm93XG4gICAgIyBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwiYXJyb3dMXCIsIEBjZW50ZXIueCAtIGFycm93T2Zmc2V0LCBAaGVpZ2h0LCBhcnJvd1dpZHRoLCAwLCAwLCAwLjUsIDEsIGNvbG9yLCA9PlxuICAgICMgICBAaG93dG8tLVxuICAgICMgICBpZiBAaG93dG8gPCAwXG4gICAgIyAgICAgQGhvd3RvID0gMFxuICAgICMgY29sb3IgPSBpZiBAaG93dG8gPT0gMyB0aGVuIEBjb2xvcnMuYXJyb3djbG9zZSBlbHNlIEBjb2xvcnMuYXJyb3dcbiAgICAjIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJhcnJvd1JcIiwgQGNlbnRlci54ICsgYXJyb3dPZmZzZXQsIEBoZWlnaHQsIGFycm93V2lkdGgsIDAsIDAsIDAuNSwgMSwgY29sb3IsID0+XG4gICAgIyAgIEBob3d0bysrXG4gICAgIyAgIGlmIEBob3d0byA+IDNcbiAgICAjICAgICBAaG93dG8gPSAwXG5cbiAgcmVuZGVyTWFpbk1lbnU6IC0+XG4gICAgQG1haW5NZW51LnJlbmRlcigpXG5cbiAgcmVuZGVyR2FtZTogLT5cblxuICAgICMgYmFja2dyb3VuZFxuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJzb2xpZFwiLCAwLCAwLCBAd2lkdGgsIEBoZWlnaHQsIDAsIDAsIDAsIEBjb2xvcnMuYmFja2dyb3VuZFxuXG4gICAgdGV4dEhlaWdodCA9IEBhYUhlaWdodCAvIDI1XG4gICAgdGV4dFBhZGRpbmcgPSB0ZXh0SGVpZ2h0IC8gNVxuICAgIGNoYXJhY3RlckhlaWdodCA9IEBhYUhlaWdodCAvIDVcbiAgICBjb3VudEhlaWdodCA9IHRleHRIZWlnaHRcblxuICAgICMgTG9nXG4gICAgZm9yIGxpbmUsIGkgaW4gQHRoaXJ0ZWVuLmxvZ1xuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIHRleHRIZWlnaHQsIGxpbmUsIDAsIChpKzEuNSkgKiAodGV4dEhlaWdodCArIHRleHRQYWRkaW5nKSwgMCwgMCwgQGNvbG9ycy5sb2djb2xvclxuXG4gICAgYWlQbGF5ZXJzID0gW1xuICAgICAgQHRoaXJ0ZWVuLnBsYXllcnNbMV1cbiAgICAgIEB0aGlydGVlbi5wbGF5ZXJzWzJdXG4gICAgICBAdGhpcnRlZW4ucGxheWVyc1szXVxuICAgIF1cblxuICAgIGNoYXJhY3Rlck1hcmdpbiA9IGNoYXJhY3RlckhlaWdodCAvIDJcbiAgICBAY2hhckNlaWxpbmcgPSBAaGVpZ2h0ICogMC42XG5cbiAgICAjIGxlZnQgc2lkZVxuICAgIGlmIGFpUGxheWVyc1swXSAhPSBudWxsXG4gICAgICBjaGFyYWN0ZXIgPSBhaUNoYXJhY3RlcnNbYWlQbGF5ZXJzWzBdLmNoYXJJRF1cbiAgICAgIGNoYXJhY3RlcldpZHRoID0gQHNwcml0ZVJlbmRlcmVyLmNhbGNXaWR0aChjaGFyYWN0ZXIuc3ByaXRlLCBjaGFyYWN0ZXJIZWlnaHQpXG4gICAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIGNoYXJhY3Rlci5zcHJpdGUsIGNoYXJhY3Rlck1hcmdpbiwgQGNoYXJDZWlsaW5nLCAwLCBjaGFyYWN0ZXJIZWlnaHQsIDAsIDAsIDEsIEBjb2xvcnMud2hpdGVcbiAgICAgIEByZW5kZXJDb3VudCBhaVBsYXllcnNbMF0sIGFpUGxheWVyc1swXS5pbmRleCA9PSBAdGhpcnRlZW4udHVybiwgY291bnRIZWlnaHQsIGNoYXJhY3Rlck1hcmdpbiArIChjaGFyYWN0ZXJXaWR0aCAvIDIpLCBAY2hhckNlaWxpbmcgLSB0ZXh0UGFkZGluZywgMC41LCAwXG4gICAgICBAcmVuZGVyQUlIYW5kIGFpUGxheWVyc1swXS5jb3VudCwgY2hhcmFjdGVyTWFyZ2luICsgKGNoYXJhY3RlcldpZHRoIC8gMiksIEBjaGFyQ2VpbGluZyAtIHRleHRQYWRkaW5nLCAwLjUsIDBcbiAgICAjIHRvcCBzaWRlXG4gICAgaWYgYWlQbGF5ZXJzWzFdICE9IG51bGxcbiAgICAgIGNoYXJhY3RlciA9IGFpQ2hhcmFjdGVyc1thaVBsYXllcnNbMV0uY2hhcklEXVxuICAgICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBjaGFyYWN0ZXIuc3ByaXRlLCBAY2VudGVyLngsIDAsIDAsIGNoYXJhY3RlckhlaWdodCwgMCwgMC41LCAwLCBAY29sb3JzLndoaXRlXG4gICAgICBAcmVuZGVyQ291bnQgYWlQbGF5ZXJzWzFdLCBhaVBsYXllcnNbMV0uaW5kZXggPT0gQHRoaXJ0ZWVuLnR1cm4sIGNvdW50SGVpZ2h0LCBAY2VudGVyLngsIGNoYXJhY3RlckhlaWdodCwgMC41LCAwXG4gICAgICBAcmVuZGVyQUlIYW5kIGFpUGxheWVyc1swXS5jb3VudCwgY2hhcmFjdGVyTWFyZ2luICsgKGNoYXJhY3RlcldpZHRoIC8gMiksIEBjaGFyQ2VpbGluZyAtIHRleHRQYWRkaW5nLCAwLjUsIDBcbiAgICAjIHJpZ2h0IHNpZGVcbiAgICBpZiBhaVBsYXllcnNbMl0gIT0gbnVsbFxuICAgICAgY2hhcmFjdGVyID0gYWlDaGFyYWN0ZXJzW2FpUGxheWVyc1syXS5jaGFySURdXG4gICAgICBjaGFyYWN0ZXJXaWR0aCA9IEBzcHJpdGVSZW5kZXJlci5jYWxjV2lkdGgoY2hhcmFjdGVyLnNwcml0ZSwgY2hhcmFjdGVySGVpZ2h0KVxuICAgICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBjaGFyYWN0ZXIuc3ByaXRlLCBAd2lkdGggLSBjaGFyYWN0ZXJNYXJnaW4sIEBjaGFyQ2VpbGluZywgMCwgY2hhcmFjdGVySGVpZ2h0LCAwLCAxLCAxLCBAY29sb3JzLndoaXRlXG4gICAgICBAcmVuZGVyQ291bnQgYWlQbGF5ZXJzWzJdLCBhaVBsYXllcnNbMl0uaW5kZXggPT0gQHRoaXJ0ZWVuLnR1cm4sIGNvdW50SGVpZ2h0LCBAd2lkdGggLSAoY2hhcmFjdGVyTWFyZ2luICsgKGNoYXJhY3RlcldpZHRoIC8gMikpLCBAY2hhckNlaWxpbmcgLSB0ZXh0UGFkZGluZywgMC41LCAwXG4gICAgICBAcmVuZGVyQUlIYW5kIGFpUGxheWVyc1swXS5jb3VudCwgY2hhcmFjdGVyTWFyZ2luICsgKGNoYXJhY3RlcldpZHRoIC8gMiksIEBjaGFyQ2VpbGluZyAtIHRleHRQYWRkaW5nLCAwLjUsIDBcblxuICAgICMgY2FyZCBhcmVhXG4gICAgaGFuZEFyZWFIZWlnaHQgPSAwLjI3ICogQGhlaWdodFxuICAgIGNhcmRBcmVhVGV4dCA9IG51bGxcbiAgICBpZiBAaGFuZC5waWNraW5nXG4gICAgICBoYW5kYXJlYUNvbG9yID0gQGNvbG9ycy5oYW5kX3BpY2tcbiAgICAgIGlmIChAdGhpcnRlZW4udHVybiA9PSAwKSBhbmQgKEB0aGlydGVlbi5ldmVyeW9uZVBhc3NlZCgpIG9yIChAdGhpcnRlZW4ucGlsZS5sZW5ndGggPT0gMCkpXG4gICAgICAgIGhhbmRhcmVhQ29sb3IgPSBAY29sb3JzLmhhbmRfYW55XG4gICAgICAgIGlmIEB0aGlydGVlbi5waWxlLmxlbmd0aCA9PSAwXG4gICAgICAgICAgY2FyZEFyZWFUZXh0ID0gJ0FueXRoaW5nICgzXFx4YzgpJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgY2FyZEFyZWFUZXh0ID0gJ0FueXRoaW5nJ1xuICAgIGVsc2VcbiAgICAgIGNhcmRBcmVhVGV4dCA9ICdVbmxvY2tlZCdcbiAgICAgIGhhbmRhcmVhQ29sb3IgPSBAY29sb3JzLmhhbmRfcmVvcmdcbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwic29saWRcIiwgMCwgQGhlaWdodCwgQHdpZHRoLCBoYW5kQXJlYUhlaWdodCwgMCwgMCwgMSwgaGFuZGFyZWFDb2xvciwgPT5cbiAgICAgIEBoYW5kLnRvZ2dsZVBpY2tpbmcoKVxuXG4gICAgIyBwaWxlXG4gICAgcGlsZURpbWVuc2lvbiA9IEBoZWlnaHQgKiAwLjRcbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwicGlsZVwiLCBAd2lkdGggLyAyLCBAaGVpZ2h0IC8gMiwgcGlsZURpbWVuc2lvbiwgcGlsZURpbWVuc2lvbiwgMCwgMC41LCAwLjUsIEBjb2xvcnMud2hpdGUsID0+XG4gICAgICBAcGxheVBpY2tlZCgpXG4gICAgQHBpbGUucmVuZGVyKClcblxuICAgIEBoYW5kLnJlbmRlcigpXG4gICAgQHJlbmRlckNvdW50IEB0aGlydGVlbi5wbGF5ZXJzWzBdLCAwID09IEB0aGlydGVlbi50dXJuLCBjb3VudEhlaWdodCwgQGNlbnRlci54LCBAaGVpZ2h0LCAwLjUsIDFcblxuICAgIGlmIEB0aGlydGVlbi53aW5uZXIoKSBhbmQgQHBpbGUucmVzdGluZygpXG4gICAgICBsaW5lcyA9IEBnYW1lT3ZlclRleHQoKVxuICAgICAgZ2FtZU92ZXJTaXplID0gQGFhSGVpZ2h0IC8gOFxuICAgICAgZ2FtZU92ZXJZID0gQGNlbnRlci55XG4gICAgICBpZiBsaW5lcy5sZW5ndGggPiAxXG4gICAgICAgIGdhbWVPdmVyWSAtPSAoZ2FtZU92ZXJTaXplID4+IDEpXG4gICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgZ2FtZU92ZXJTaXplLCBsaW5lc1swXSwgQGNlbnRlci54LCBnYW1lT3ZlclksIDAuNSwgMC41LCBAY29sb3JzLmdhbWVfb3ZlclxuICAgICAgaWYgbGluZXMubGVuZ3RoID4gMVxuICAgICAgICBnYW1lT3ZlclkgKz0gZ2FtZU92ZXJTaXplXG4gICAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCBnYW1lT3ZlclNpemUsIGxpbmVzWzFdLCBAY2VudGVyLngsIGdhbWVPdmVyWSwgMC41LCAwLjUsIEBjb2xvcnMuZ2FtZV9vdmVyXG5cbiAgICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJzb2xpZFwiLCAwLCBAaGVpZ2h0LCBAd2lkdGgsIGhhbmRBcmVhSGVpZ2h0LCAwLCAwLCAxLCBAY29sb3JzLnBsYXlfYWdhaW4sID0+XG4gICAgICAgIEB0aGlydGVlbi5kZWFsKClcbiAgICAgICAgQHByZXBhcmVHYW1lKClcblxuICAgICAgcmVzdGFydFF1aXRTaXplID0gQGFhSGVpZ2h0IC8gMTJcbiAgICAgIHNoYWRvd0Rpc3RhbmNlID0gcmVzdGFydFF1aXRTaXplIC8gOFxuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIHJlc3RhcnRRdWl0U2l6ZSwgXCJQbGF5IEFnYWluXCIsIHNoYWRvd0Rpc3RhbmNlICsgQGNlbnRlci54LCBzaGFkb3dEaXN0YW5jZSArIChAaGVpZ2h0IC0gKGhhbmRBcmVhSGVpZ2h0ICogMC41KSksIDAuNSwgMSwgQGNvbG9ycy5ibGFja1xuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIHJlc3RhcnRRdWl0U2l6ZSwgXCJQbGF5IEFnYWluXCIsIEBjZW50ZXIueCwgQGhlaWdodCAtIChoYW5kQXJlYUhlaWdodCAqIDAuNSksIDAuNSwgMSwgQGNvbG9ycy5nb2xkXG5cbiAgICAjIEhlYWRsaW5lIChpbmNsdWRlcyBlcnJvcilcbiAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgdGV4dEhlaWdodCwgQGNhbGNIZWFkbGluZSgpLCAwLCAwLCAwLCAwLCBAY29sb3JzLmxpZ2h0Z3JheVxuXG4gICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcInBhdXNlXCIsIEB3aWR0aCwgMCwgMCwgQHBhdXNlQnV0dG9uU2l6ZSwgMCwgMSwgMCwgQGNvbG9ycy53aGl0ZSwgPT5cbiAgICAgIEBwYXVzZWQgPSB0cnVlXG5cbiAgICBpZiBjYXJkQXJlYVRleHQgIT0gbnVsbFxuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIHRleHRIZWlnaHQsIGNhcmRBcmVhVGV4dCwgMC4wMiAqIEB3aWR0aCwgQGhlaWdodCAtIGhhbmRBcmVhSGVpZ2h0LCAwLCAwLCBAY29sb3JzLndoaXRlXG5cbiAgICBpZiBAcGF1c2VkXG4gICAgICBAcGF1c2VNZW51LnJlbmRlcigpXG5cbiAgICByZXR1cm5cblxuICByZW5kZXJDb3VudDogKHBsYXllciwgbXlUdXJuLCBjb3VudEhlaWdodCwgeCwgeSwgYW5jaG9yeCwgYW5jaG9yeSkgLT5cbiAgICBpZiBteVR1cm5cbiAgICAgIG5hbWVDb2xvciA9IFwiYGZmNzcwMGBcIlxuICAgIGVsc2VcbiAgICAgIG5hbWVDb2xvciA9IFwiXCJcbiAgICBuYW1lU3RyaW5nID0gXCIgI3tuYW1lQ29sb3J9I3twbGF5ZXIubmFtZX1gYCBcIlxuICAgIGNhcmRDb3VudCA9IHBsYXllci5oYW5kLmxlbmd0aFxuICAgIGlmIGNhcmRDb3VudCA+IDFcbiAgICAgIHRyaWNrQ29sb3IgPSBcImZmZmYzM1wiXG4gICAgZWxzZVxuICAgICAgdHJpY2tDb2xvciA9IFwiZmYzMzMzXCJcbiAgICBjb3VudFN0cmluZyA9IFwiIGAje3RyaWNrQ29sb3J9YCN7Y2FyZENvdW50fWBgIGxlZnQgXCJcblxuICAgIG5hbWVTaXplID0gQGZvbnRSZW5kZXJlci5zaXplKEBmb250LCBjb3VudEhlaWdodCwgbmFtZVN0cmluZylcbiAgICBjb3VudFNpemUgPSBAZm9udFJlbmRlcmVyLnNpemUoQGZvbnQsIGNvdW50SGVpZ2h0LCBjb3VudFN0cmluZylcbiAgICBpZiBuYW1lU2l6ZS53ID4gY291bnRTaXplLndcbiAgICAgIGNvdW50U2l6ZS53ID0gbmFtZVNpemUud1xuICAgIGVsc2VcbiAgICAgIG5hbWVTaXplLncgPSBjb3VudFNpemUud1xuICAgIG5hbWVZID0geVxuICAgIGNvdW50WSA9IHlcbiAgICBib3hIZWlnaHQgPSBjb3VudFNpemUuaFxuICAgIGlmIHBsYXllci5pZCAhPSAxXG4gICAgICBib3hIZWlnaHQgKj0gMlxuICAgICAgaWYgYW5jaG9yeSA+IDBcbiAgICAgICAgbmFtZVkgLT0gY291bnRIZWlnaHRcbiAgICAgIGVsc2VcbiAgICAgICAgY291bnRZICs9IGNvdW50SGVpZ2h0XG4gICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcInNvbGlkXCIsIHgsIHksIGNvdW50U2l6ZS53LCBib3hIZWlnaHQsIDAsIGFuY2hvcngsIGFuY2hvcnksIEBjb2xvcnMub3ZlcmxheVxuICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCBjb3VudEhlaWdodCwgbmFtZVN0cmluZywgeCwgbmFtZVksIGFuY2hvcngsIGFuY2hvcnksIEBjb2xvcnMud2hpdGVcbiAgICBpZiBwbGF5ZXIuaWQgIT0gMVxuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIGNvdW50SGVpZ2h0LCBjb3VudFN0cmluZywgeCwgY291bnRZLCBhbmNob3J4LCBhbmNob3J5LCBAY29sb3JzLndoaXRlXG5cbiAgcmVuZGVyQUlIYW5kOiAoY2FyZENvdW50LCBjb3VudEhlaWdodCwgeCwgeSwgYW5jaG9yeCwgYW5jaG9yeSkgLT5cbiAgICAjIFRPRE86IG1ha2UgdGhpcyBkcmF3IGEgdGlueSBoYW5kIG9mIGNhcmRzIG9uIHRoZSBBSSBjaGFyc1xuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyByZW5kZXJpbmcgYW5kIHpvbmVzXG5cbiAgZHJhd0ltYWdlOiAodGV4dHVyZSwgc3gsIHN5LCBzdywgc2gsIGR4LCBkeSwgZHcsIGRoLCByb3QsIGFuY2hvcngsIGFuY2hvcnksIHIsIGcsIGIsIGEsIGNiKSAtPlxuICAgIEByZW5kZXJDb21tYW5kcy5wdXNoIEB0ZXh0dXJlc1t0ZXh0dXJlXSwgc3gsIHN5LCBzdywgc2gsIGR4LCBkeSwgZHcsIGRoLCByb3QsIGFuY2hvcngsIGFuY2hvcnksIHIsIGcsIGIsIGFcblxuICAgIGlmIGNiP1xuICAgICAgIyBjYWxsZXIgd2FudHMgdG8gcmVtZW1iZXIgd2hlcmUgdGhpcyB3YXMgZHJhd24sIGFuZCB3YW50cyB0byBiZSBjYWxsZWQgYmFjayBpZiBpdCBpcyBldmVyIHRvdWNoZWRcbiAgICAgICMgVGhpcyBpcyBjYWxsZWQgYSBcInpvbmVcIi4gU2luY2Ugem9uZXMgYXJlIHRyYXZlcnNlZCBpbiByZXZlcnNlIG9yZGVyLCB0aGUgbmF0dXJhbCBvdmVybGFwIG9mXG4gICAgICAjIGEgc2VyaWVzIG9mIHJlbmRlcnMgaXMgcmVzcGVjdGVkIGFjY29yZGluZ2x5LlxuICAgICAgYW5jaG9yT2Zmc2V0WCA9IC0xICogYW5jaG9yeCAqIGR3XG4gICAgICBhbmNob3JPZmZzZXRZID0gLTEgKiBhbmNob3J5ICogZGhcbiAgICAgIHpvbmUgPVxuICAgICAgICAjIGNlbnRlciAoWCxZKSBhbmQgcmV2ZXJzZWQgcm90YXRpb24sIHVzZWQgdG8gcHV0IHRoZSBjb29yZGluYXRlIGluIGxvY2FsIHNwYWNlIHRvIHRoZSB6b25lXG4gICAgICAgIGN4OiAgZHhcbiAgICAgICAgY3k6ICBkeVxuICAgICAgICByb3Q6IHJvdCAqIC0xXG4gICAgICAgICMgdGhlIGF4aXMgYWxpZ25lZCBib3VuZGluZyBib3ggdXNlZCBmb3IgZGV0ZWN0aW9uIG9mIGEgbG9jYWxzcGFjZSBjb29yZFxuICAgICAgICBsOiAgIGFuY2hvck9mZnNldFhcbiAgICAgICAgdDogICBhbmNob3JPZmZzZXRZXG4gICAgICAgIHI6ICAgYW5jaG9yT2Zmc2V0WCArIGR3XG4gICAgICAgIGI6ICAgYW5jaG9yT2Zmc2V0WSArIGRoXG4gICAgICAgICMgY2FsbGJhY2sgdG8gY2FsbCBpZiB0aGUgem9uZSBpcyBjbGlja2VkIG9uXG4gICAgICAgIGNiOiAgY2JcbiAgICAgIEB6b25lcy5wdXNoIHpvbmVcblxuICBjaGVja1pvbmVzOiAoeCwgeSkgLT5cbiAgICBmb3Igem9uZSBpbiBAem9uZXMgYnkgLTFcbiAgICAgICMgbW92ZSBjb29yZCBpbnRvIHNwYWNlIHJlbGF0aXZlIHRvIHRoZSBxdWFkLCB0aGVuIHJvdGF0ZSBpdCB0byBtYXRjaFxuICAgICAgdW5yb3RhdGVkTG9jYWxYID0geCAtIHpvbmUuY3hcbiAgICAgIHVucm90YXRlZExvY2FsWSA9IHkgLSB6b25lLmN5XG4gICAgICBsb2NhbFggPSB1bnJvdGF0ZWRMb2NhbFggKiBNYXRoLmNvcyh6b25lLnJvdCkgLSB1bnJvdGF0ZWRMb2NhbFkgKiBNYXRoLnNpbih6b25lLnJvdClcbiAgICAgIGxvY2FsWSA9IHVucm90YXRlZExvY2FsWCAqIE1hdGguc2luKHpvbmUucm90KSArIHVucm90YXRlZExvY2FsWSAqIE1hdGguY29zKHpvbmUucm90KVxuICAgICAgaWYgKGxvY2FsWCA8IHpvbmUubCkgb3IgKGxvY2FsWCA+IHpvbmUucikgb3IgKGxvY2FsWSA8IHpvbmUudCkgb3IgKGxvY2FsWSA+IHpvbmUuYilcbiAgICAgICAgIyBvdXRzaWRlIG9mIG9yaWVudGVkIGJvdW5kaW5nIGJveFxuICAgICAgICBjb250aW51ZVxuICAgICAgem9uZS5jYih4LCB5KVxuICAgICAgcmV0dXJuIHRydWVcbiAgICByZXR1cm4gZmFsc2VcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbm1vZHVsZS5leHBvcnRzID0gR2FtZVxuIiwiQW5pbWF0aW9uID0gcmVxdWlyZSAnLi9BbmltYXRpb24nXG5cbkNBUkRfSU1BR0VfVyA9IDEyMFxuQ0FSRF9JTUFHRV9IID0gMTYyXG5DQVJEX0lNQUdFX09GRl9YID0gNFxuQ0FSRF9JTUFHRV9PRkZfWSA9IDRcbkNBUkRfSU1BR0VfQURWX1ggPSBDQVJEX0lNQUdFX1dcbkNBUkRfSU1BR0VfQURWX1kgPSBDQVJEX0lNQUdFX0hcbkNBUkRfUkVOREVSX1NDQUxFID0gMC4zNSAgICAgICAgICAgICAgICAgICMgY2FyZCBoZWlnaHQgY29lZmZpY2llbnQgZnJvbSB0aGUgc2NyZWVuJ3MgaGVpZ2h0XG5DQVJEX0hBTkRfQ1VSVkVfRElTVF9GQUNUT1IgPSAzLjUgICAgICAgICAjIGZhY3RvciB3aXRoIHNjcmVlbiBoZWlnaHQgdG8gZmlndXJlIG91dCBjZW50ZXIgb2YgYXJjLiBiaWdnZXIgbnVtYmVyIGlzIGxlc3MgYXJjXG5DQVJEX0hPTERJTkdfUk9UX09SREVSID0gTWF0aC5QSSAvIDEyICAgICAjIGRlc2lyZWQgcm90YXRpb24gb2YgdGhlIGNhcmQgd2hlbiBiZWluZyBkcmFnZ2VkIGFyb3VuZCBmb3Igb3JkZXJpbmcncyBzYWtlXG5DQVJEX0hPTERJTkdfUk9UX1BMQVkgPSAtMSAqIE1hdGguUEkgLyAxMiAjIGRlc2lyZWQgcm90YXRpb24gb2YgdGhlIGNhcmQgd2hlbiBiZWluZyBkcmFnZ2VkIGFyb3VuZCB3aXRoIGludGVudCB0byBwbGF5XG5DQVJEX1BMQVlfQ0VJTElORyA9IDAuNjAgICAgICAgICAgICAgICAgICAjIGhvdyBtdWNoIG9mIHRoZSB0b3Agb2YgdGhlIHNjcmVlbiByZXByZXNlbnRzIFwiSSB3YW50IHRvIHBsYXkgdGhpc1wiIHZzIFwiSSB3YW50IHRvIHJlb3JkZXJcIlxuXG5OT19DQVJEID0gLTFcblxuSGlnaGxpZ2h0ID1cbiAgTk9ORTogLTFcbiAgVU5TRUxFQ1RFRDogMFxuICBTRUxFQ1RFRDogMVxuICBQSUxFOiAyXG5cbiMgdGFrZW4gZnJvbSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzEyMTEyMTIvaG93LXRvLWNhbGN1bGF0ZS1hbi1hbmdsZS1mcm9tLXRocmVlLXBvaW50c1xuIyB1c2VzIGxhdyBvZiBjb3NpbmVzIHRvIGZpZ3VyZSBvdXQgdGhlIGhhbmQgYXJjIGFuZ2xlXG5maW5kQW5nbGUgPSAocDAsIHAxLCBwMikgLT5cbiAgICBhID0gTWF0aC5wb3cocDEueCAtIHAyLngsIDIpICsgTWF0aC5wb3cocDEueSAtIHAyLnksIDIpXG4gICAgYiA9IE1hdGgucG93KHAxLnggLSBwMC54LCAyKSArIE1hdGgucG93KHAxLnkgLSBwMC55LCAyKVxuICAgIGMgPSBNYXRoLnBvdyhwMi54IC0gcDAueCwgMikgKyBNYXRoLnBvdyhwMi55IC0gcDAueSwgMilcbiAgICByZXR1cm4gTWF0aC5hY29zKCAoYStiLWMpIC8gTWF0aC5zcXJ0KDQqYSpiKSApXG5cbmNhbGNEaXN0YW5jZSA9IChwMCwgcDEpIC0+XG4gIHJldHVybiBNYXRoLnNxcnQoTWF0aC5wb3cocDEueCAtIHAwLngsIDIpICsgTWF0aC5wb3cocDEueSAtIHAwLnksIDIpKVxuXG5jYWxjRGlzdGFuY2VTcXVhcmVkID0gKHgwLCB5MCwgeDEsIHkxKSAtPlxuICByZXR1cm4gTWF0aC5wb3coeDEgLSB4MCwgMikgKyBNYXRoLnBvdyh5MSAtIHkwLCAyKVxuXG5jbGFzcyBIYW5kXG4gIEBDQVJEX0lNQUdFX1c6IENBUkRfSU1BR0VfV1xuICBAQ0FSRF9JTUFHRV9IOiBDQVJEX0lNQUdFX0hcbiAgQENBUkRfSU1BR0VfT0ZGX1g6IENBUkRfSU1BR0VfT0ZGX1hcbiAgQENBUkRfSU1BR0VfT0ZGX1k6IENBUkRfSU1BR0VfT0ZGX1lcbiAgQENBUkRfSU1BR0VfQURWX1g6IENBUkRfSU1BR0VfQURWX1hcbiAgQENBUkRfSU1BR0VfQURWX1k6IENBUkRfSU1BR0VfQURWX1lcbiAgQENBUkRfUkVOREVSX1NDQUxFOiBDQVJEX1JFTkRFUl9TQ0FMRVxuICBASGlnaGxpZ2h0OiBIaWdobGlnaHRcblxuICBjb25zdHJ1Y3RvcjogKEBnYW1lKSAtPlxuICAgIEBjYXJkcyA9IFtdXG4gICAgQGFuaW1zID0ge31cbiAgICBAcG9zaXRpb25DYWNoZSA9IHt9XG5cbiAgICBAcGlja2luZyA9IHRydWVcbiAgICBAcGlja2VkID0gW11cbiAgICBAcGlja1BhaW50ID0gZmFsc2VcblxuICAgIEBkcmFnSW5kZXhTdGFydCA9IE5PX0NBUkRcbiAgICBAZHJhZ0luZGV4Q3VycmVudCA9IE5PX0NBUkRcbiAgICBAZHJhZ1ggPSAwXG4gICAgQGRyYWdZID0gMFxuXG4gICAgIyByZW5kZXIgLyBhbmltIG1ldHJpY3NcbiAgICBAY2FyZFNwZWVkID1cbiAgICAgIHI6IE1hdGguUEkgKiAyXG4gICAgICBzOiAyLjVcbiAgICAgIHQ6IDIgKiBAZ2FtZS53aWR0aFxuICAgIEBwbGF5Q2VpbGluZyA9IENBUkRfUExBWV9DRUlMSU5HICogQGdhbWUuaGVpZ2h0XG4gICAgQGNhcmRIZWlnaHQgPSBNYXRoLmZsb29yKEBnYW1lLmhlaWdodCAqIENBUkRfUkVOREVSX1NDQUxFKVxuICAgIEBjYXJkV2lkdGggID0gTWF0aC5mbG9vcihAY2FyZEhlaWdodCAqIENBUkRfSU1BR0VfVyAvIENBUkRfSU1BR0VfSClcbiAgICBAY2FyZEhhbGZIZWlnaHQgPSBAY2FyZEhlaWdodCA+PiAxXG4gICAgQGNhcmRIYWxmV2lkdGggID0gQGNhcmRXaWR0aCA+PiAxXG4gICAgYXJjTWFyZ2luID0gQGNhcmRXaWR0aCAvIDJcbiAgICBhcmNWZXJ0aWNhbEJpYXMgPSBAY2FyZEhlaWdodCAvIDUwXG4gICAgYm90dG9tTGVmdCAgPSB7IHg6IGFyY01hcmdpbiwgICAgICAgICAgICAgICAgeTogYXJjVmVydGljYWxCaWFzICsgQGdhbWUuaGVpZ2h0IH1cbiAgICBib3R0b21SaWdodCA9IHsgeDogQGdhbWUud2lkdGggLSBhcmNNYXJnaW4sIHk6IGFyY1ZlcnRpY2FsQmlhcyArIEBnYW1lLmhlaWdodCB9XG4gICAgQGhhbmRDZW50ZXIgPSB7IHg6IEBnYW1lLndpZHRoIC8gMiwgICAgICAgICB5OiBhcmNWZXJ0aWNhbEJpYXMgKyBAZ2FtZS5oZWlnaHQgKyAoQ0FSRF9IQU5EX0NVUlZFX0RJU1RfRkFDVE9SICogQGdhbWUuaGVpZ2h0KSB9XG4gICAgQGhhbmRBbmdsZSA9IGZpbmRBbmdsZShib3R0b21MZWZ0LCBAaGFuZENlbnRlciwgYm90dG9tUmlnaHQpXG4gICAgQGhhbmREaXN0YW5jZSA9IGNhbGNEaXN0YW5jZShib3R0b21MZWZ0LCBAaGFuZENlbnRlcilcbiAgICBAaGFuZEFuZ2xlQWR2YW5jZU1heCA9IEBoYW5kQW5nbGUgLyA3ICMgbmV2ZXIgc3BhY2UgdGhlIGNhcmRzIG1vcmUgdGhhbiB3aGF0IHRoZXknZCBsb29rIGxpa2Ugd2l0aCB0aGlzIGhhbmRzaXplXG4gICAgQGdhbWUubG9nIFwiSGFuZCBkaXN0YW5jZSAje0BoYW5kRGlzdGFuY2V9LCBhbmdsZSAje0BoYW5kQW5nbGV9IChzY3JlZW4gaGVpZ2h0ICN7QGdhbWUuaGVpZ2h0fSlcIlxuXG4gIHRvZ2dsZVBpY2tpbmc6IC0+XG4gICAgQHBpY2tpbmcgPSAhQHBpY2tpbmdcbiAgICBpZiBAcGlja2luZ1xuICAgICAgQHNlbGVjdE5vbmUoKVxuXG4gIHNlbGVjdE5vbmU6IC0+XG4gICAgQHBpY2tlZCA9IG5ldyBBcnJheShAY2FyZHMubGVuZ3RoKS5maWxsKGZhbHNlKVxuICAgIHJldHVyblxuXG4gIHNldDogKGNhcmRzKSAtPlxuICAgIEBjYXJkcyA9IGNhcmRzLnNsaWNlKDApXG4gICAgaWYgQHBpY2tpbmdcbiAgICAgIEBzZWxlY3ROb25lKClcbiAgICBAc3luY0FuaW1zKClcbiAgICBAd2FycCgpXG5cbiAgc3luY0FuaW1zOiAtPlxuICAgIHNlZW4gPSB7fVxuICAgIGZvciBjYXJkIGluIEBjYXJkc1xuICAgICAgc2VlbltjYXJkXSsrXG4gICAgICBpZiBub3QgQGFuaW1zW2NhcmRdXG4gICAgICAgIEBhbmltc1tjYXJkXSA9IG5ldyBBbmltYXRpb24ge1xuICAgICAgICAgIHNwZWVkOiBAY2FyZFNwZWVkXG4gICAgICAgICAgeDogMFxuICAgICAgICAgIHk6IDBcbiAgICAgICAgICByOiAwXG4gICAgICAgIH1cbiAgICB0b1JlbW92ZSA9IFtdXG4gICAgZm9yIGNhcmQsYW5pbSBvZiBAYW5pbXNcbiAgICAgIGlmIG5vdCBzZWVuLmhhc093blByb3BlcnR5KGNhcmQpXG4gICAgICAgIHRvUmVtb3ZlLnB1c2ggY2FyZFxuICAgIGZvciBjYXJkIGluIHRvUmVtb3ZlXG4gICAgICAjIEBnYW1lLmxvZyBcInJlbW92aW5nIGFuaW0gZm9yICN7Y2FyZH1cIlxuICAgICAgZGVsZXRlIEBhbmltc1tjYXJkXVxuXG4gICAgQHVwZGF0ZVBvc2l0aW9ucygpXG5cbiAgY2FsY0RyYXduSGFuZDogLT5cbiAgICBkcmF3bkhhbmQgPSBbXVxuICAgIGZvciBjYXJkLGkgaW4gQGNhcmRzXG4gICAgICBpZiBpICE9IEBkcmFnSW5kZXhTdGFydFxuICAgICAgICBkcmF3bkhhbmQucHVzaCBjYXJkXG5cbiAgICBpZiBAZHJhZ0luZGV4Q3VycmVudCAhPSBOT19DQVJEXG4gICAgICBkcmF3bkhhbmQuc3BsaWNlIEBkcmFnSW5kZXhDdXJyZW50LCAwLCBAY2FyZHNbQGRyYWdJbmRleFN0YXJ0XVxuICAgIHJldHVybiBkcmF3bkhhbmRcblxuICB3YW50c1RvUGxheURyYWdnZWRDYXJkOiAtPlxuICAgIHJldHVybiBmYWxzZSBpZiBAZHJhZ0luZGV4U3RhcnQgPT0gTk9fQ0FSRFxuICAgIHJldHVybiBAZHJhZ1kgPCBAcGxheUNlaWxpbmdcblxuICB1cGRhdGVQb3NpdGlvbnM6IC0+XG4gICAgZHJhd25IYW5kID0gQGNhbGNEcmF3bkhhbmQoKVxuICAgIHdhbnRzVG9QbGF5ID0gQHdhbnRzVG9QbGF5RHJhZ2dlZENhcmQoKVxuICAgIGRlc2lyZWRSb3RhdGlvbiA9IENBUkRfSE9MRElOR19ST1RfT1JERVJcbiAgICBwb3NpdGlvbkNvdW50ID0gZHJhd25IYW5kLmxlbmd0aFxuICAgIGlmIHdhbnRzVG9QbGF5XG4gICAgICBkZXNpcmVkUm90YXRpb24gPSBDQVJEX0hPTERJTkdfUk9UX1BMQVlcbiAgICAgIHBvc2l0aW9uQ291bnQtLVxuICAgIHBvc2l0aW9ucyA9IEBjYWxjUG9zaXRpb25zKHBvc2l0aW9uQ291bnQpXG4gICAgZHJhd0luZGV4ID0gMFxuICAgIGZvciBjYXJkLGkgaW4gZHJhd25IYW5kXG4gICAgICBhbmltID0gQGFuaW1zW2NhcmRdXG4gICAgICBpZiBpID09IEBkcmFnSW5kZXhDdXJyZW50XG4gICAgICAgIGFuaW0ucmVxLnggPSBAZHJhZ1hcbiAgICAgICAgYW5pbS5yZXEueSA9IEBkcmFnWVxuICAgICAgICBhbmltLnJlcS5yID0gZGVzaXJlZFJvdGF0aW9uXG4gICAgICAgIGlmIG5vdCB3YW50c1RvUGxheVxuICAgICAgICAgIGRyYXdJbmRleCsrXG4gICAgICBlbHNlXG4gICAgICAgIHBvcyA9IHBvc2l0aW9uc1tkcmF3SW5kZXhdXG4gICAgICAgIGFuaW0ucmVxLnggPSBwb3MueFxuICAgICAgICBhbmltLnJlcS55ID0gcG9zLnlcbiAgICAgICAgYW5pbS5yZXEuciA9IHBvcy5yXG4gICAgICAgIGRyYXdJbmRleCsrXG5cbiAgIyBpbW1lZGlhdGVseSB3YXJwIGFsbCBjYXJkcyB0byB3aGVyZSB0aGV5IHNob3VsZCBiZVxuICB3YXJwOiAtPlxuICAgIGZvciBjYXJkLGFuaW0gb2YgQGFuaW1zXG4gICAgICBhbmltLndhcnAoKVxuXG4gICMgcmVvcmRlciB0aGUgaGFuZCBiYXNlZCBvbiB0aGUgZHJhZyBsb2NhdGlvbiBvZiB0aGUgaGVsZCBjYXJkXG4gIHJlb3JkZXI6IC0+XG4gICAgcmV0dXJuIGlmIEBkcmFnSW5kZXhTdGFydCA9PSBOT19DQVJEXG4gICAgcmV0dXJuIGlmIEBjYXJkcy5sZW5ndGggPCAyICMgbm90aGluZyB0byByZW9yZGVyXG4gICAgcG9zaXRpb25zID0gQGNhbGNQb3NpdGlvbnMoQGNhcmRzLmxlbmd0aClcbiAgICBjbG9zZXN0SW5kZXggPSAwXG4gICAgY2xvc2VzdERpc3QgPSBAZ2FtZS53aWR0aCAqIEBnYW1lLmhlaWdodCAjIHNvbWV0aGluZyBpbXBvc3NpYmx5IGxhcmdlXG4gICAgZm9yIHBvcywgaW5kZXggaW4gcG9zaXRpb25zXG4gICAgICBkaXN0ID0gY2FsY0Rpc3RhbmNlU3F1YXJlZChwb3MueCwgcG9zLnksIEBkcmFnWCwgQGRyYWdZKVxuICAgICAgaWYgY2xvc2VzdERpc3QgPiBkaXN0XG4gICAgICAgIGNsb3Nlc3REaXN0ID0gZGlzdFxuICAgICAgICBjbG9zZXN0SW5kZXggPSBpbmRleFxuICAgIEBkcmFnSW5kZXhDdXJyZW50ID0gY2xvc2VzdEluZGV4XG5cbiAgc2VsZWN0ZWRDYXJkczogLT5cbiAgICBpZiBub3QgQHBpY2tpbmdcbiAgICAgIHJldHVybiBbXVxuXG4gICAgY2FyZHMgPSBbXVxuICAgIGZvciBjYXJkLCBpIGluIEBjYXJkc1xuICAgICAgaWYgQHBpY2tlZFtpXVxuICAgICAgICBhbmltID0gQGFuaW1zW2NhcmRdXG4gICAgICAgIGNhcmRzLnB1c2gge1xuICAgICAgICAgIGNhcmQ6IGNhcmRcbiAgICAgICAgICB4OiBhbmltLmN1ci54XG4gICAgICAgICAgeTogYW5pbS5jdXIueVxuICAgICAgICAgIHI6IGFuaW0uY3VyLnJcbiAgICAgICAgICBpbmRleDogaVxuICAgICAgICB9XG4gICAgcmV0dXJuIGNhcmRzXG5cbiAgZG93bjogKEBkcmFnWCwgQGRyYWdZLCBpbmRleCkgLT5cbiAgICBAdXAoQGRyYWdYLCBAZHJhZ1kpICMgZW5zdXJlIHdlIGxldCBnbyBvZiB0aGUgcHJldmlvdXMgY2FyZCBpbiBjYXNlIHRoZSBldmVudHMgYXJlIGR1bWJcbiAgICBpZiBAcGlja2luZ1xuICAgICAgQHBpY2tlZFtpbmRleF0gPSAhQHBpY2tlZFtpbmRleF1cbiAgICAgIEBwaWNrUGFpbnQgPSBAcGlja2VkW2luZGV4XVxuICAgICAgcmV0dXJuXG4gICAgQGdhbWUubG9nIFwicGlja2luZyB1cCBjYXJkIGluZGV4ICN7aW5kZXh9XCJcbiAgICBAZHJhZ0luZGV4U3RhcnQgPSBpbmRleFxuICAgIEBkcmFnSW5kZXhDdXJyZW50ID0gaW5kZXhcbiAgICBAdXBkYXRlUG9zaXRpb25zKClcblxuICBtb3ZlOiAoQGRyYWdYLCBAZHJhZ1kpIC0+XG4gICAgcmV0dXJuIGlmIEBkcmFnSW5kZXhTdGFydCA9PSBOT19DQVJEXG4gICAgI0BnYW1lLmxvZyBcImRyYWdnaW5nIGFyb3VuZCBjYXJkIGluZGV4ICN7QGRyYWdJbmRleEN1cnJlbnR9XCJcbiAgICBAcmVvcmRlcigpXG4gICAgQHVwZGF0ZVBvc2l0aW9ucygpXG5cbiAgdXA6IChAZHJhZ1gsIEBkcmFnWSkgLT5cbiAgICByZXR1cm4gaWYgQGRyYWdJbmRleFN0YXJ0ID09IE5PX0NBUkRcbiAgICBAcmVvcmRlcigpXG4gICAgaWYgQHdhbnRzVG9QbGF5RHJhZ2dlZENhcmQoKVxuICAgICAgQGdhbWUubG9nIFwidHJ5aW5nIHRvIHBsYXkgYSAje0BjYXJkc1tAZHJhZ0luZGV4U3RhcnRdfSBmcm9tIGluZGV4ICN7QGRyYWdJbmRleFN0YXJ0fVwiXG4gICAgICBjYXJkSW5kZXggPSBAZHJhZ0luZGV4U3RhcnRcbiAgICAgIGNhcmQgPSBAY2FyZHNbY2FyZEluZGV4XVxuICAgICAgYW5pbSA9IEBhbmltc1tjYXJkXVxuICAgICAgQGRyYWdJbmRleFN0YXJ0ID0gTk9fQ0FSRFxuICAgICAgQGRyYWdJbmRleEN1cnJlbnQgPSBOT19DQVJEXG4gICAgICBAZ2FtZS5wbGF5IFt7XG4gICAgICAgIGNhcmQ6IGNhcmRcbiAgICAgICAgeDogYW5pbS5jdXIueFxuICAgICAgICB5OiBhbmltLmN1ci55XG4gICAgICAgIHI6IGFuaW0uY3VyLnJcbiAgICAgICAgaW5kZXg6IGNhcmRJbmRleFxuICAgICAgfV1cbiAgICBlbHNlXG4gICAgICBAZ2FtZS5sb2cgXCJ0cnlpbmcgdG8gcmVvcmRlciAje0BjYXJkc1tAZHJhZ0luZGV4U3RhcnRdfSBpbnRvIGluZGV4ICN7QGRyYWdJbmRleEN1cnJlbnR9XCJcbiAgICAgIEBjYXJkcyA9IEBjYWxjRHJhd25IYW5kKCkgIyBpcyB0aGlzIHJpZ2h0P1xuXG4gICAgQGRyYWdJbmRleFN0YXJ0ID0gTk9fQ0FSRFxuICAgIEBkcmFnSW5kZXhDdXJyZW50ID0gTk9fQ0FSRFxuICAgIEB1cGRhdGVQb3NpdGlvbnMoKVxuXG4gIHVwZGF0ZTogKGR0KSAtPlxuICAgIHVwZGF0ZWQgPSBmYWxzZVxuICAgIGZvciBjYXJkLGFuaW0gb2YgQGFuaW1zXG4gICAgICBpZiBhbmltLnVwZGF0ZShkdClcbiAgICAgICAgdXBkYXRlZCA9IHRydWVcbiAgICByZXR1cm4gdXBkYXRlZFxuXG4gIHJlbmRlcjogLT5cbiAgICByZXR1cm4gaWYgQGNhcmRzLmxlbmd0aCA9PSAwXG4gICAgZHJhd25IYW5kID0gQGNhbGNEcmF3bkhhbmQoKVxuICAgIGZvciB2LCBpbmRleCBpbiBkcmF3bkhhbmRcbiAgICAgIGNvbnRpbnVlIGlmIHYgPT0gTk9fQ0FSRFxuICAgICAgYW5pbSA9IEBhbmltc1t2XVxuICAgICAgZG8gKGFuaW0sIGluZGV4KSA9PlxuICAgICAgICBpZiBAcGlja2luZ1xuICAgICAgICAgIGlmIEBwaWNrZWRbaW5kZXhdXG4gICAgICAgICAgICBoaWdobGlnaHRTdGF0ZSA9IEhpZ2hsaWdodC5TRUxFQ1RFRFxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGhpZ2hsaWdodFN0YXRlID0gSGlnaGxpZ2h0LlVOU0VMRUNURURcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGlmIEB3YW50c1RvUGxheURyYWdnZWRDYXJkKClcbiAgICAgICAgICAgIGlmIChpbmRleCA9PSBAZHJhZ0luZGV4Q3VycmVudClcbiAgICAgICAgICAgICAgaGlnaGxpZ2h0U3RhdGUgPSBIaWdobGlnaHQuU0VMRUNURURcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgaGlnaGxpZ2h0U3RhdGUgPSBIaWdobGlnaHQuVU5TRUxFQ1RFRFxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGhpZ2hsaWdodFN0YXRlID0gSGlnaGxpZ2h0Lk5PTkVcbiAgICAgICAgQHJlbmRlckNhcmQgdiwgYW5pbS5jdXIueCwgYW5pbS5jdXIueSwgYW5pbS5jdXIuciwgMSwgaGlnaGxpZ2h0U3RhdGUsIChjbGlja1gsIGNsaWNrWSkgPT5cbiAgICAgICAgICBAZG93bihjbGlja1gsIGNsaWNrWSwgaW5kZXgpXG5cbiAgcmVuZGVyQ2FyZDogKHYsIHgsIHksIHJvdCwgc2NhbGUsIHNlbGVjdGVkLCBjYikgLT5cbiAgICByb3QgPSAwIGlmIG5vdCByb3RcbiAgICByYW5rID0gTWF0aC5mbG9vcih2IC8gNClcbiAgICBzdWl0ID0gTWF0aC5mbG9vcih2ICUgNClcblxuICAgIGNvbCA9IHN3aXRjaCBzZWxlY3RlZFxuICAgICAgd2hlbiBIaWdobGlnaHQuTk9ORVxuICAgICAgICBbMSwgMSwgMV1cbiAgICAgIHdoZW4gSGlnaGxpZ2h0LlVOU0VMRUNURURcbiAgICAgICAgIyBbMC4zLCAwLjMsIDAuM11cbiAgICAgICAgWzEsIDEsIDFdXG4gICAgICB3aGVuIEhpZ2hsaWdodC5TRUxFQ1RFRFxuICAgICAgICBbMC41LCAwLjUsIDAuOV1cbiAgICAgIHdoZW4gSGlnaGxpZ2h0LlBJTEVcbiAgICAgICAgWzAuNiwgMC42LCAwLjZdXG5cbiAgICBAZ2FtZS5kcmF3SW1hZ2UgXCJjYXJkc1wiLFxuICAgIENBUkRfSU1BR0VfT0ZGX1ggKyAoQ0FSRF9JTUFHRV9BRFZfWCAqIHJhbmspLCBDQVJEX0lNQUdFX09GRl9ZICsgKENBUkRfSU1BR0VfQURWX1kgKiBzdWl0KSwgQ0FSRF9JTUFHRV9XLCBDQVJEX0lNQUdFX0gsXG4gICAgeCwgeSwgQGNhcmRXaWR0aCAqIHNjYWxlLCBAY2FyZEhlaWdodCAqIHNjYWxlLFxuICAgIHJvdCwgMC41LCAwLjUsIGNvbFswXSxjb2xbMV0sY29sWzJdLDEsIGNiXG5cbiAgY2FsY1Bvc2l0aW9uczogKGhhbmRTaXplKSAtPlxuICAgIGlmIEBwb3NpdGlvbkNhY2hlLmhhc093blByb3BlcnR5KGhhbmRTaXplKVxuICAgICAgcmV0dXJuIEBwb3NpdGlvbkNhY2hlW2hhbmRTaXplXVxuICAgIHJldHVybiBbXSBpZiBoYW5kU2l6ZSA9PSAwXG5cbiAgICBhZHZhbmNlID0gQGhhbmRBbmdsZSAvIGhhbmRTaXplXG4gICAgaWYgYWR2YW5jZSA+IEBoYW5kQW5nbGVBZHZhbmNlTWF4XG4gICAgICBhZHZhbmNlID0gQGhhbmRBbmdsZUFkdmFuY2VNYXhcbiAgICBhbmdsZVNwcmVhZCA9IGFkdmFuY2UgKiBoYW5kU2l6ZSAgICAgICAgICAgICAgICAjIGhvdyBtdWNoIG9mIHRoZSBhbmdsZSB3ZSBwbGFuIG9uIHVzaW5nXG4gICAgYW5nbGVMZWZ0b3ZlciA9IEBoYW5kQW5nbGUgLSBhbmdsZVNwcmVhZCAgICAgICAgIyBhbW91bnQgb2YgYW5nbGUgd2UncmUgbm90IHVzaW5nLCBhbmQgbmVlZCB0byBwYWQgc2lkZXMgd2l0aCBldmVubHlcbiAgICBjdXJyZW50QW5nbGUgPSAtMSAqIChAaGFuZEFuZ2xlIC8gMikgICAgICAgICAgICAjIG1vdmUgdG8gdGhlIGxlZnQgc2lkZSBvZiBvdXIgYW5nbGVcbiAgICBjdXJyZW50QW5nbGUgKz0gYW5nbGVMZWZ0b3ZlciAvIDIgICAgICAgICAgICAgICAjIC4uLiBhbmQgYWR2YW5jZSBwYXN0IGhhbGYgb2YgdGhlIHBhZGRpbmdcbiAgICBjdXJyZW50QW5nbGUgKz0gYWR2YW5jZSAvIDIgICAgICAgICAgICAgICAgICAgICAjIC4uLiBhbmQgY2VudGVyIHRoZSBjYXJkcyBpbiB0aGUgYW5nbGVcblxuICAgIHBvc2l0aW9ucyA9IFtdXG4gICAgZm9yIGkgaW4gWzAuLi5oYW5kU2l6ZV1cbiAgICAgIHggPSBAaGFuZENlbnRlci54IC0gTWF0aC5jb3MoKE1hdGguUEkgLyAyKSArIGN1cnJlbnRBbmdsZSkgKiBAaGFuZERpc3RhbmNlXG4gICAgICB5ID0gQGhhbmRDZW50ZXIueSAtIE1hdGguc2luKChNYXRoLlBJIC8gMikgKyBjdXJyZW50QW5nbGUpICogQGhhbmREaXN0YW5jZVxuICAgICAgY3VycmVudEFuZ2xlICs9IGFkdmFuY2VcbiAgICAgIHBvc2l0aW9ucy5wdXNoIHtcbiAgICAgICAgeDogeFxuICAgICAgICB5OiB5XG4gICAgICAgIHI6IGN1cnJlbnRBbmdsZSAtIGFkdmFuY2VcbiAgICAgIH1cblxuICAgIEBwb3NpdGlvbkNhY2hlW2hhbmRTaXplXSA9IHBvc2l0aW9uc1xuICAgIHJldHVybiBwb3NpdGlvbnNcblxubW9kdWxlLmV4cG9ydHMgPSBIYW5kXG4iLCJCdXR0b24gPSByZXF1aXJlICcuL0J1dHRvbidcblxuY2xhc3MgTWVudVxuICBjb25zdHJ1Y3RvcjogKEBnYW1lLCBAdGl0bGUsIEBiYWNrZ3JvdW5kLCBAY29sb3IsIEBhY3Rpb25zKSAtPlxuICAgIEBidXR0b25zID0gW11cbiAgICBAYnV0dG9uTmFtZXMgPSBbXCJidXR0b24wXCIsIFwiYnV0dG9uMVwiXVxuXG4gICAgYnV0dG9uU2l6ZSA9IEBnYW1lLmhlaWdodCAvIDE1XG4gICAgQGJ1dHRvblN0YXJ0WSA9IEBnYW1lLmhlaWdodCAvIDVcblxuICAgIHNsaWNlID0gKEBnYW1lLmhlaWdodCAtIEBidXR0b25TdGFydFkpIC8gKEBhY3Rpb25zLmxlbmd0aCArIDEpXG4gICAgY3VyclkgPSBAYnV0dG9uU3RhcnRZICsgc2xpY2VcbiAgICBmb3IgYWN0aW9uIGluIEBhY3Rpb25zXG4gICAgICBidXR0b24gPSBuZXcgQnV0dG9uKEBnYW1lLCBAYnV0dG9uTmFtZXMsIEBnYW1lLmZvbnQsIGJ1dHRvblNpemUsIEBnYW1lLmNlbnRlci54LCBjdXJyWSwgYWN0aW9uKVxuICAgICAgQGJ1dHRvbnMucHVzaCBidXR0b25cbiAgICAgIGN1cnJZICs9IHNsaWNlXG5cbiAgdXBkYXRlOiAoZHQpIC0+XG4gICAgdXBkYXRlZCA9IGZhbHNlXG4gICAgZm9yIGJ1dHRvbiBpbiBAYnV0dG9uc1xuICAgICAgaWYgYnV0dG9uLnVwZGF0ZShkdClcbiAgICAgICAgdXBkYXRlZCA9IHRydWVcbiAgICByZXR1cm4gdXBkYXRlZFxuXG4gIHJlbmRlcjogLT5cbiAgICBAZ2FtZS5zcHJpdGVSZW5kZXJlci5yZW5kZXIgQGJhY2tncm91bmQsIDAsIDAsIEBnYW1lLndpZHRoLCBAZ2FtZS5oZWlnaHQsIDAsIDAsIDAsIEBjb2xvclxuICAgIEBnYW1lLmZvbnRSZW5kZXJlci5yZW5kZXIgQGdhbWUuZm9udCwgQGdhbWUuaGVpZ2h0IC8gMjUsIFwiQnVpbGQ6ICN7QGdhbWUudmVyc2lvbn1cIiwgMCwgQGdhbWUuaGVpZ2h0LCAwLCAxLCBAZ2FtZS5jb2xvcnMubGlnaHRncmF5XG4gICAgdGl0bGVIZWlnaHQgPSBAZ2FtZS5oZWlnaHQgLyA4XG4gICAgdGl0bGVPZmZzZXQgPSBAYnV0dG9uU3RhcnRZID4+IDFcbiAgICBAZ2FtZS5mb250UmVuZGVyZXIucmVuZGVyIEBnYW1lLmZvbnQsIHRpdGxlSGVpZ2h0LCBAdGl0bGUsIEBnYW1lLmNlbnRlci54LCB0aXRsZU9mZnNldCwgMC41LCAwLjUsIEBnYW1lLmNvbG9ycy53aGl0ZVxuICAgIGZvciBidXR0b24gaW4gQGJ1dHRvbnNcbiAgICAgIGJ1dHRvbi5yZW5kZXIoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1lbnVcbiIsIkFuaW1hdGlvbiA9IHJlcXVpcmUgJy4vQW5pbWF0aW9uJ1xuSGFuZCA9IHJlcXVpcmUgJy4vSGFuZCdcblxuU0VUVExFX01TID0gMTAwMFxuXG5jbGFzcyBQaWxlXG4gIGNvbnN0cnVjdG9yOiAoQGdhbWUsIEBoYW5kKSAtPlxuICAgIEBwbGF5SUQgPSAtMVxuICAgIEBwbGF5cyA9IFtdXG4gICAgQGFuaW1zID0ge31cbiAgICBAc2V0dGxlVGltZXIgPSAwXG4gICAgQHRocm93bkNvbG9yID0geyByOiAxLCBnOiAxLCBiOiAwLCBhOiAxfVxuICAgIEBzY2FsZSA9IDAuNlxuXG4gICAgIyAxLjAgaXMgbm90IG1lc3N5IGF0IGFsbCwgYXMgeW91IGFwcHJvYWNoIDAgaXQgc3RhcnRzIHRvIGFsbCBwaWxlIG9uIG9uZSBhbm90aGVyXG4gICAgbWVzc3kgPSAwLjJcblxuICAgIEBwbGF5Q2FyZFNwYWNpbmcgPSAwLjFcblxuICAgIGNlbnRlclggPSBAZ2FtZS5jZW50ZXIueFxuICAgIGNlbnRlclkgPSBAZ2FtZS5jZW50ZXIueVxuICAgIG9mZnNldFggPSBAaGFuZC5jYXJkV2lkdGggKiBtZXNzeSAqIEBzY2FsZVxuICAgIG9mZnNldFkgPSBAaGFuZC5jYXJkSGFsZkhlaWdodCAqIG1lc3N5ICogQHNjYWxlXG4gICAgQHBsYXlMb2NhdGlvbnMgPSBbXG4gICAgICB7IHg6IGNlbnRlclgsIHk6IGNlbnRlclkgKyBvZmZzZXRZIH0gIyBib3R0b21cbiAgICAgIHsgeDogY2VudGVyWCAtIG9mZnNldFgsIHk6IGNlbnRlclkgfSAjIGxlZnRcbiAgICAgIHsgeDogY2VudGVyWCwgeTogY2VudGVyWSAtIG9mZnNldFkgfSAjIHRvcFxuICAgICAgeyB4OiBjZW50ZXJYICsgb2Zmc2V0WCwgeTogY2VudGVyWSB9ICMgcmlnaHRcbiAgICBdXG4gICAgQHRocm93TG9jYXRpb25zID0gW1xuICAgICAgeyB4OiBjZW50ZXJYLCB5OiBAZ2FtZS5oZWlnaHQgfSAjIGJvdHRvbVxuICAgICAgeyB4OiAwLCB5OiBjZW50ZXJZICsgb2Zmc2V0WSB9ICMgbGVmdFxuICAgICAgeyB4OiBjZW50ZXJYLCB5OiAwIH0gIyB0b3BcbiAgICAgIHsgeDogQGdhbWUud2lkdGgsIHk6IGNlbnRlclkgKyBvZmZzZXRZIH0gIyByaWdodFxuICAgIF1cblxuICBzZXQ6IChwaWxlSUQsIHBpbGUsIHBpbGVXaG8pIC0+XG4gICAgaWYgQHBsYXlJRCAhPSBwaWxlSURcbiAgICAgIEBwbGF5SUQgPSBwaWxlSURcbiAgICAgIEBwbGF5cy5wdXNoIHtcbiAgICAgICAgY2FyZHM6IHBpbGUuc2xpY2UoMClcbiAgICAgICAgd2hvOiBwaWxlV2hvXG4gICAgICB9XG4gICAgICBAc2V0dGxlVGltZXIgPSBTRVRUTEVfTVNcblxuICAgICMgaWYgKEBwbGF5SUQgIT0gcGlsZUlEKSBhbmQgKHRocm93bi5sZW5ndGggPiAwKVxuICAgICMgICBAcGxheXMgPSB0aHJvd24uc2xpY2UoMCkgIyB0aGUgcGlsZSBoYXMgYmVjb21lIHRoZSB0aHJvd24sIHN0YXNoIGl0IG9mZiBvbmUgbGFzdCB0aW1lXG4gICAgIyAgIEBwbGF5V2hvID0gdGhyb3duV2hvLnNsaWNlKDApXG4gICAgIyAgIEBwbGF5SUQgPSBwaWxlSURcbiAgICAjICAgQHNldHRsZVRpbWVyID0gU0VUVExFX01TXG5cbiAgICAjICMgZG9uJ3Qgc3RvbXAgdGhlIHBpbGUgd2UncmUgZHJhd2luZyB1bnRpbCBpdCBpcyBkb25lIHNldHRsaW5nIGFuZCBjYW4gZmx5IG9mZiB0aGUgc2NyZWVuXG4gICAgIyBpZiBAc2V0dGxlVGltZXIgPT0gMFxuICAgICMgICBAcGxheXMgPSBwaWxlLnNsaWNlKDApXG4gICAgIyAgIEBwbGF5V2hvID0gcGlsZVdoby5zbGljZSgwKVxuICAgICMgICBAdGhyb3duID0gdGhyb3duLnNsaWNlKDApXG4gICAgIyAgIEB0aHJvd25XaG8gPSB0aHJvd25XaG8uc2xpY2UoMClcbiAgICAjICAgQHRocm93blRha2VyID0gdGhyb3duVGFrZXJcblxuICAgIEBzeW5jQW5pbXMoKVxuXG4gIGhpbnQ6IChjYXJkcykgLT5cbiAgICBmb3IgY2FyZCBpbiBjYXJkc1xuICAgICAgQGFuaW1zW2NhcmQuY2FyZF0gPSBuZXcgQW5pbWF0aW9uIHtcbiAgICAgICAgc3BlZWQ6IEBoYW5kLmNhcmRTcGVlZFxuICAgICAgICB4OiBjYXJkLnhcbiAgICAgICAgeTogY2FyZC55XG4gICAgICAgIHI6IGNhcmQuclxuICAgICAgICBzOiAxXG4gICAgICB9XG5cbiAgc3luY0FuaW1zOiAtPlxuICAgIHNlZW4gPSB7fVxuICAgIGxvY2F0aW9ucyA9IEB0aHJvd0xvY2F0aW9uc1xuICAgIGZvciBwbGF5IGluIEBwbGF5c1xuICAgICAgZm9yIGNhcmQsIGluZGV4IGluIHBsYXkuY2FyZHNcbiAgICAgICAgc2VlbltjYXJkXSsrXG4gICAgICAgIGlmIG5vdCBAYW5pbXNbY2FyZF1cbiAgICAgICAgICB3aG8gPSBwbGF5Lndob1xuICAgICAgICAgIGxvY2F0aW9uID0gbG9jYXRpb25zW3dob11cbiAgICAgICAgICBAYW5pbXNbY2FyZF0gPSBuZXcgQW5pbWF0aW9uIHtcbiAgICAgICAgICAgIHNwZWVkOiBAaGFuZC5jYXJkU3BlZWRcbiAgICAgICAgICAgIHg6IGxvY2F0aW9uLnhcbiAgICAgICAgICAgIHk6IGxvY2F0aW9uLnlcbiAgICAgICAgICAgIHI6IC0xICogTWF0aC5QSSAvIDRcbiAgICAgICAgICAgIHM6IEBzY2FsZVxuICAgICAgICAgIH1cblxuICAgIHRvUmVtb3ZlID0gW11cbiAgICBmb3IgY2FyZCxhbmltIG9mIEBhbmltc1xuICAgICAgaWYgbm90IHNlZW4uaGFzT3duUHJvcGVydHkoY2FyZClcbiAgICAgICAgdG9SZW1vdmUucHVzaCBjYXJkXG4gICAgZm9yIGNhcmQgaW4gdG9SZW1vdmVcbiAgICAgICMgQGdhbWUubG9nIFwicmVtb3ZpbmcgYW5pbSBmb3IgI3tjYXJkfVwiXG4gICAgICBkZWxldGUgQGFuaW1zW2NhcmRdXG5cbiAgICBAdXBkYXRlUG9zaXRpb25zKClcblxuICB1cGRhdGVQb3NpdGlvbnM6IC0+XG4gICAgbG9jYXRpb25zID0gQHBsYXlMb2NhdGlvbnNcbiAgICBmb3IgcGxheSwgcGxheUluZGV4IGluIEBwbGF5c1xuICAgICAgZm9yIHYsIGluZGV4IGluIHBsYXkuY2FyZHNcbiAgICAgICAgYW5pbSA9IEBhbmltc1t2XVxuICAgICAgICBsb2MgPSBwbGF5Lndob1xuICAgICAgICBhbmltLnJlcS54ID0gbG9jYXRpb25zW2xvY10ueCArIChpbmRleCAqIEBoYW5kLmNhcmRXaWR0aCAqIEBwbGF5Q2FyZFNwYWNpbmcpXG4gICAgICAgIGFuaW0ucmVxLnkgPSBsb2NhdGlvbnNbbG9jXS55XG4gICAgICAgIGFuaW0ucmVxLnIgPSAwLjIgKiBNYXRoLmNvcyhwbGF5SW5kZXggLyAwLjEpXG4gICAgICAgIGFuaW0ucmVxLnMgPSBAc2NhbGVcblxuICByZWFkeUZvck5leHRUcmljazogLT5cbiAgICByZXR1cm4gKEBzZXR0bGVUaW1lciA9PSAwKVxuXG4gIHVwZGF0ZTogKGR0KSAtPlxuICAgIHVwZGF0ZWQgPSBmYWxzZVxuXG4gICAgaWYgQHNldHRsZVRpbWVyID4gMFxuICAgICAgdXBkYXRlZCA9IHRydWVcbiAgICAgIEBzZXR0bGVUaW1lciAtPSBkdFxuICAgICAgaWYgQHNldHRsZVRpbWVyIDwgMFxuICAgICAgICBAc2V0dGxlVGltZXIgPSAwXG5cbiAgICBmb3IgY2FyZCxhbmltIG9mIEBhbmltc1xuICAgICAgaWYgYW5pbS51cGRhdGUoZHQpXG4gICAgICAgIHVwZGF0ZWQgPSB0cnVlXG5cbiAgICByZXR1cm4gdXBkYXRlZFxuXG4gICMgdXNlZCBieSB0aGUgZ2FtZSBvdmVyIHNjcmVlbi4gSXQgcmV0dXJucyB0cnVlIHdoZW4gbmVpdGhlciB0aGUgcGlsZSBub3IgdGhlIGxhc3QgdGhyb3duIGFyZSBtb3ZpbmdcbiAgcmVzdGluZzogLT5cbiAgICBmb3IgY2FyZCxhbmltIG9mIEBhbmltc1xuICAgICAgaWYgYW5pbS5hbmltYXRpbmcoKVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICBpZiBAc2V0dGxlVGltZXIgPiAwXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICByZXR1cm4gdHJ1ZVxuXG4gIHJlbmRlcjogLT5cbiAgICBmb3IgcGxheSwgcGxheUluZGV4IGluIEBwbGF5c1xuICAgICAgaGlnaGxpZ2h0ID0gSGFuZC5IaWdobGlnaHQuUElMRVxuICAgICAgaWYgcGxheUluZGV4ID09IChAcGxheXMubGVuZ3RoIC0gMSlcbiAgICAgICAgaGlnaGxpZ2h0ID0gSGFuZC5IaWdobGlnaHQuTk9ORVxuICAgICAgZm9yIHYsIGluZGV4IGluIHBsYXkuY2FyZHNcbiAgICAgICAgYW5pbSA9IEBhbmltc1t2XVxuICAgICAgICBAaGFuZC5yZW5kZXJDYXJkIHYsIGFuaW0uY3VyLngsIGFuaW0uY3VyLnksIGFuaW0uY3VyLnIsIGFuaW0uY3VyLnMsIGhpZ2hsaWdodFxuXG5tb2R1bGUuZXhwb3J0cyA9IFBpbGVcbiIsImNsYXNzIFNwcml0ZVJlbmRlcmVyXG4gIGNvbnN0cnVjdG9yOiAoQGdhbWUpIC0+XG4gICAgQHNwcml0ZXMgPVxuICAgICAgIyBnZW5lcmljIHNwcml0ZXNcbiAgICAgIHNvbGlkOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6ICA1NSwgeTogNzIzLCB3OiAgMTAsIGg6ICAxMCB9XG4gICAgICBwYXVzZTogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA2MDIsIHk6IDcwNywgdzogMTIyLCBoOiAxMjUgfVxuICAgICAgYnV0dG9uMDogICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogMTQwLCB5OiA3NzcsIHc6IDQyMiwgaDogIDY1IH1cbiAgICAgIGJ1dHRvbjE6ICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDE0MCwgeTogNjk4LCB3OiA0MjIsIGg6ICA2NSB9XG4gICAgICBwbHVzMDogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA3NDUsIHk6IDY2NCwgdzogMTE2LCBoOiAxMTggfVxuICAgICAgcGx1czE6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogNzQ1LCB5OiA4MjAsIHc6IDExNiwgaDogMTE4IH1cbiAgICAgIG1pbnVzMDogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDg5NSwgeTogNjY0LCB3OiAxMTYsIGg6IDExOCB9XG4gICAgICBtaW51czE6ICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA4OTUsIHk6IDgyMCwgdzogMTE2LCBoOiAxMTggfVxuICAgICAgYXJyb3dMOiAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogIDMzLCB5OiA4NTgsIHc6IDIwNCwgaDogMTU2IH1cbiAgICAgIGFycm93UjogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDIzOSwgeTogODUyLCB3OiAyMDgsIGg6IDE1NSB9XG4gICAgICBwaWxlOiAgICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA1MTMsIHk6IDg3NSwgdzogMTI4LCBoOiAxMjggfVxuXG4gICAgICAjIG1lbnUgYmFja2dyb3VuZHNcbiAgICAgIG1haW5tZW51OiAgeyB0ZXh0dXJlOiBcIm1haW5tZW51XCIsICB4OiAwLCB5OiAwLCB3OiAxMjgwLCBoOiA3MjAgfVxuICAgICAgcGF1c2VtZW51OiB7IHRleHR1cmU6IFwicGF1c2VtZW51XCIsIHg6IDAsIHk6IDAsIHc6IDEyODAsIGg6IDcyMCB9XG5cbiAgICAgICMgaG93dG9cbiAgICAgIGhvd3RvMTogICAgeyB0ZXh0dXJlOiBcImhvd3RvMVwiLCAgeDogMCwgeTogIDAsIHc6IDE5MjAsIGg6IDEwODAgfVxuXG4gICAgICAjIGNoYXJhY3RlcnNcbiAgICAgIG1hcmlvOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6ICAyMCwgeTogICAwLCB3OiAxNTEsIGg6IDMwOCB9XG4gICAgICBsdWlnaTogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAxNzEsIHk6ICAgMCwgdzogMTUxLCBoOiAzMDggfVxuICAgICAgcGVhY2g6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogMzM1LCB5OiAgIDAsIHc6IDE2NCwgaDogMzA4IH1cbiAgICAgIGRhaXN5OiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDUwNCwgeTogICAwLCB3OiAxNjQsIGg6IDMwOCB9XG4gICAgICB5b3NoaTogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA2NjgsIHk6ICAgMCwgdzogMTgwLCBoOiAzMDggfVxuICAgICAgdG9hZDogICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogODQ5LCB5OiAgIDAsIHc6IDE1NywgaDogMzA4IH1cbiAgICAgIGJvd3NlcjogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6ICAxMSwgeTogMzIyLCB3OiAxNTEsIGg6IDMwOCB9XG4gICAgICBib3dzZXJqcjogIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAyMjUsIHk6IDMyMiwgdzogMTQ0LCBoOiAzMDggfVxuICAgICAga29vcGE6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogMzcyLCB5OiAzMjIsIHc6IDEyOCwgaDogMzA4IH1cbiAgICAgIHJvc2FsaW5hOiAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDUwMCwgeTogMzIyLCB3OiAxNzMsIGg6IDMwOCB9XG4gICAgICBzaHlndXk6ICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA2OTEsIHk6IDMyMiwgdzogMTU0LCBoOiAzMDggfVxuICAgICAgdG9hZGV0dGU6ICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogODQ3LCB5OiAzMjIsIHc6IDE1OCwgaDogMzA4IH1cblxuICBjYWxjV2lkdGg6IChzcHJpdGVOYW1lLCBoZWlnaHQpIC0+XG4gICAgc3ByaXRlID0gQHNwcml0ZXNbc3ByaXRlTmFtZV1cbiAgICByZXR1cm4gMSBpZiBub3Qgc3ByaXRlXG4gICAgcmV0dXJuIGhlaWdodCAqIHNwcml0ZS53IC8gc3ByaXRlLmhcblxuICByZW5kZXI6IChzcHJpdGVOYW1lLCBkeCwgZHksIGR3LCBkaCwgcm90LCBhbmNob3J4LCBhbmNob3J5LCBjb2xvciwgY2IpIC0+XG4gICAgc3ByaXRlID0gQHNwcml0ZXNbc3ByaXRlTmFtZV1cbiAgICByZXR1cm4gaWYgbm90IHNwcml0ZVxuICAgIGlmIChkdyA9PSAwKSBhbmQgKGRoID09IDApXG4gICAgICAjIHRoaXMgcHJvYmFibHkgc2hvdWxkbid0IGV2ZXIgYmUgdXNlZC5cbiAgICAgIGR3ID0gc3ByaXRlLnhcbiAgICAgIGRoID0gc3ByaXRlLnlcbiAgICBlbHNlIGlmIGR3ID09IDBcbiAgICAgIGR3ID0gZGggKiBzcHJpdGUudyAvIHNwcml0ZS5oXG4gICAgZWxzZSBpZiBkaCA9PSAwXG4gICAgICBkaCA9IGR3ICogc3ByaXRlLmggLyBzcHJpdGUud1xuICAgIEBnYW1lLmRyYXdJbWFnZSBzcHJpdGUudGV4dHVyZSwgc3ByaXRlLngsIHNwcml0ZS55LCBzcHJpdGUudywgc3ByaXRlLmgsIGR4LCBkeSwgZHcsIGRoLCByb3QsIGFuY2hvcngsIGFuY2hvcnksIGNvbG9yLnIsIGNvbG9yLmcsIGNvbG9yLmIsIGNvbG9yLmEsIGNiXG4gICAgcmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gU3ByaXRlUmVuZGVyZXJcbiIsIk1JTl9QTEFZRVJTID0gM1xuTUFYX0xPR19MSU5FUyA9IDZcbk9LID0gJ09LJ1xuXG5TdWl0ID1cbiAgTk9ORTogLTFcbiAgU1BBREVTOiAwXG4gIENMVUJTOiAxXG4gIERJQU1PTkRTOiAyXG4gIEhFQVJUUzogM1xuXG5TdWl0TmFtZSA9IFsnU3BhZGVzJywgJ0NsdWJzJywgJ0RpYW1vbmRzJywgJ0hlYXJ0cyddXG5TaG9ydFN1aXROYW1lID0gWydTJywgJ0MnLCAnRCcsICdIJ11cbkdseXBoU3VpdE5hbWUgPSBbXCJcXHhjOFwiLCBcIlxceGM5XCIsIFwiXFx4Y2FcIiwgXCJcXHhjYlwiXVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBBSSBOYW1lIEdlbmVyYXRvclxuXG5haUNoYXJhY3Rlckxpc3QgPSBbXG4gIHsgaWQ6IFwibWFyaW9cIiwgICAgbmFtZTogXCJNYXJpb1wiLCAgICAgIHNwcml0ZTogXCJtYXJpb1wiLCAgICBicmFpbjogXCJub3JtYWxcIiB9XG4gIHsgaWQ6IFwibHVpZ2lcIiwgICAgbmFtZTogXCJMdWlnaVwiLCAgICAgIHNwcml0ZTogXCJsdWlnaVwiLCAgICBicmFpbjogXCJub3JtYWxcIiB9XG4gIHsgaWQ6IFwicGVhY2hcIiwgICAgbmFtZTogXCJQZWFjaFwiLCAgICAgIHNwcml0ZTogXCJwZWFjaFwiLCAgICBicmFpbjogXCJub3JtYWxcIiB9XG4gIHsgaWQ6IFwiZGFpc3lcIiwgICAgbmFtZTogXCJEYWlzeVwiLCAgICAgIHNwcml0ZTogXCJkYWlzeVwiLCAgICBicmFpbjogXCJub3JtYWxcIiB9XG4gIHsgaWQ6IFwieW9zaGlcIiwgICAgbmFtZTogXCJZb3NoaVwiLCAgICAgIHNwcml0ZTogXCJ5b3NoaVwiLCAgICBicmFpbjogXCJub3JtYWxcIiB9XG4gIHsgaWQ6IFwidG9hZFwiLCAgICAgbmFtZTogXCJUb2FkXCIsICAgICAgIHNwcml0ZTogXCJ0b2FkXCIsICAgICBicmFpbjogXCJub3JtYWxcIiB9XG4gIHsgaWQ6IFwiYm93c2VyXCIsICAgbmFtZTogXCJCb3dzZXJcIiwgICAgIHNwcml0ZTogXCJib3dzZXJcIiwgICBicmFpbjogXCJub3JtYWxcIiB9XG4gIHsgaWQ6IFwiYm93c2VyanJcIiwgbmFtZTogXCJCb3dzZXIgSnJcIiwgIHNwcml0ZTogXCJib3dzZXJqclwiLCBicmFpbjogXCJub3JtYWxcIiB9XG4gIHsgaWQ6IFwia29vcGFcIiwgICAgbmFtZTogXCJLb29wYVwiLCAgICAgIHNwcml0ZTogXCJrb29wYVwiLCAgICBicmFpbjogXCJub3JtYWxcIiB9XG4gIHsgaWQ6IFwicm9zYWxpbmFcIiwgbmFtZTogXCJSb3NhbGluYVwiLCAgIHNwcml0ZTogXCJyb3NhbGluYVwiLCBicmFpbjogXCJub3JtYWxcIiB9XG4gIHsgaWQ6IFwic2h5Z3V5XCIsICAgbmFtZTogXCJTaHlndXlcIiwgICAgIHNwcml0ZTogXCJzaHlndXlcIiwgICBicmFpbjogXCJub3JtYWxcIiB9XG4gIHsgaWQ6IFwidG9hZGV0dGVcIiwgbmFtZTogXCJUb2FkZXR0ZVwiLCAgIHNwcml0ZTogXCJ0b2FkZXR0ZVwiLCBicmFpbjogXCJub3JtYWxcIiB9XG5dXG5cbmFpQ2hhcmFjdGVycyA9IHt9XG5mb3IgY2hhcmFjdGVyIGluIGFpQ2hhcmFjdGVyTGlzdFxuICBhaUNoYXJhY3RlcnNbY2hhcmFjdGVyLmlkXSA9IGNoYXJhY3RlclxuXG5yYW5kb21DaGFyYWN0ZXIgPSAtPlxuICByID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogYWlDaGFyYWN0ZXJMaXN0Lmxlbmd0aClcbiAgcmV0dXJuIGFpQ2hhcmFjdGVyTGlzdFtyXVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBDYXJkXG5cbmNsYXNzIENhcmRcbiAgY29uc3RydWN0b3I6IChAcmF3KSAtPlxuICAgIEBzdWl0ICA9IE1hdGguZmxvb3IoQHJhdyAlIDQpXG4gICAgQHZhbHVlID0gTWF0aC5mbG9vcihAcmF3IC8gNClcbiAgICBAdmFsdWVOYW1lID0gc3dpdGNoIEB2YWx1ZVxuICAgICAgd2hlbiAgOCB0aGVuICdKJ1xuICAgICAgd2hlbiAgOSB0aGVuICdRJ1xuICAgICAgd2hlbiAxMCB0aGVuICdLJ1xuICAgICAgd2hlbiAxMSB0aGVuICdBJ1xuICAgICAgd2hlbiAxMiB0aGVuICcyJ1xuICAgICAgZWxzZVxuICAgICAgICBTdHJpbmcoQHZhbHVlICsgMylcbiAgICBAbmFtZSA9IEB2YWx1ZU5hbWUgKyBTaG9ydFN1aXROYW1lW0BzdWl0XVxuICAgICMgY29uc29sZS5sb2cgXCIje0ByYXd9IC0+ICN7QG5hbWV9XCJcbiAgZ2x5cGhlZE5hbWU6IC0+XG4gICAgcmV0dXJuIEB2YWx1ZU5hbWUgKyBHbHlwaFN1aXROYW1lW0BzdWl0XVxuXG5jYXJkc1RvU3RyaW5nID0gKHJhd0NhcmRzKSAtPlxuICBjYXJkTmFtZXMgPSBbXVxuICBmb3IgcmF3IGluIHJhd0NhcmRzXG4gICAgY2FyZCA9IG5ldyBDYXJkKHJhdylcbiAgICBjYXJkTmFtZXMucHVzaCBjYXJkLm5hbWVcbiAgcmV0dXJuIFwiWyBcIiArIGNhcmROYW1lcy5qb2luKCcsJykgKyBcIiBdXCJcblxucGxheVR5cGVUb1N0cmluZyA9ICh0eXBlKSAtPlxuICBpZiBtYXRjaGVzID0gdHlwZS5tYXRjaCgvXnJvcChcXGQrKS8pXG4gICAgcmV0dXJuIFwiUnVuIG9mICN7bWF0Y2hlc1sxXX0gUGFpcnNcIlxuICBpZiBtYXRjaGVzID0gdHlwZS5tYXRjaCgvXnJ1bihcXGQrKS8pXG4gICAgcmV0dXJuIFwiUnVuIG9mICN7bWF0Y2hlc1sxXX1cIlxuICBpZiBtYXRjaGVzID0gdHlwZS5tYXRjaCgvXmtpbmQoXFxkKykvKVxuICAgIGlmIG1hdGNoZXNbMV0gPT0gJzEnXG4gICAgICByZXR1cm4gJ1NpbmdsZSdcbiAgICBpZiBtYXRjaGVzWzFdID09ICcyJ1xuICAgICAgcmV0dXJuICdQYWlyJ1xuICAgIGlmIG1hdGNoZXNbMV0gPT0gJzMnXG4gICAgICByZXR1cm4gJ1RyaXBzJ1xuICAgIHJldHVybiAnUXVhZHMnXG4gIHJldHVybiB0eXBlXG5cbnBsYXlUb1N0cmluZyA9IChwbGF5KSAtPlxuICBoaWdoQ2FyZCA9IG5ldyBDYXJkKHBsYXkuaGlnaClcbiAgcmV0dXJuIFwiI3twbGF5VHlwZVRvU3RyaW5nKHBsYXkudHlwZSl9IC0gI3toaWdoQ2FyZC5nbHlwaGVkTmFtZSgpfVwiXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIERlY2tcblxuY2xhc3MgU2h1ZmZsZWREZWNrXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgICMgZGF0IGluc2lkZS1vdXQgc2h1ZmZsZSFcbiAgICBAY2FyZHMgPSBbIDAgXVxuICAgIGZvciBpIGluIFsxLi4uNTJdXG4gICAgICBqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogaSlcbiAgICAgIEBjYXJkcy5wdXNoKEBjYXJkc1tqXSlcbiAgICAgIEBjYXJkc1tqXSA9IGlcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgVGhpcnRlZW5cblxuY2xhc3MgVGhpcnRlZW5cbiAgY29uc3RydWN0b3I6IChAZ2FtZSwgcGFyYW1zKSAtPlxuICAgIHJldHVybiBpZiBub3QgcGFyYW1zXG5cbiAgICBpZiBwYXJhbXMuc3RhdGVcbiAgICAgIGZvciBrLHYgb2YgcGFyYW1zLnN0YXRlXG4gICAgICAgIGlmIHBhcmFtcy5zdGF0ZS5oYXNPd25Qcm9wZXJ0eShrKVxuICAgICAgICAgIHRoaXNba10gPSBwYXJhbXMuc3RhdGVba11cbiAgICBlbHNlXG4gICAgICAjIG5ldyBnYW1lXG4gICAgICBAbG9nID0gW11cbiAgICAgIEBzdHJlYWsgPSAwXG4gICAgICBAbGFzdFN0cmVhayA9IDBcblxuICAgICAgQHBsYXllcnMgPSBbXG4gICAgICAgIHsgaWQ6IDEsIG5hbWU6ICdQbGF5ZXInLCBpbmRleDogMCwgcGFzczogZmFsc2UgfVxuICAgICAgXVxuXG4gICAgICBmb3IgaSBpbiBbMS4uLjRdXG4gICAgICAgIEBhZGRBSSgpXG5cbiAgICAgIEBkZWFsKClcblxuICBkZWFsOiAocGFyYW1zKSAtPlxuICAgIGRlY2sgPSBuZXcgU2h1ZmZsZWREZWNrKClcbiAgICBmb3IgcGxheWVyLCBwbGF5ZXJJbmRleCBpbiBAcGxheWVyc1xuICAgICAgQGdhbWUubG9nIFwiZGVhbGluZyAxMyBjYXJkcyB0byBwbGF5ZXIgI3twbGF5ZXJJbmRleH1cIlxuXG4gICAgICBwbGF5ZXIuaGFuZCA9IFtdXG4gICAgICBmb3IgaiBpbiBbMC4uLjEzXVxuICAgICAgICByYXcgPSBkZWNrLmNhcmRzLnNoaWZ0KClcbiAgICAgICAgaWYgcmF3ID09IDBcbiAgICAgICAgICBAdHVybiA9IHBsYXllckluZGV4XG4gICAgICAgIHBsYXllci5oYW5kLnB1c2gocmF3KVxuXG4gICAgICAjIGNvbnNvbGUubG9nIFwiQGdhbWUub3B0aW9ucy5zb3J0SW5kZXggI3tAZ2FtZS5vcHRpb25zLnNvcnRJbmRleH1cIlxuICAgICAgaWYgKEBnYW1lLm9wdGlvbnMuc29ydEluZGV4ID09IDApIG9yIHBsYXllci5haVxuICAgICAgICAjIE5vcm1hbFxuICAgICAgICBwbGF5ZXIuaGFuZC5zb3J0IChhLGIpIC0+IHJldHVybiBhIC0gYlxuICAgICAgZWxzZVxuICAgICAgICAjIFJldmVyc2VcbiAgICAgICAgcGxheWVyLmhhbmQuc29ydCAoYSxiKSAtPiByZXR1cm4gYiAtIGFcblxuICAgIEBwaWxlID0gW11cbiAgICBAcGlsZVdobyA9IC0xXG4gICAgQHRocm93SUQgPSAwXG4gICAgQGN1cnJlbnRQbGF5ID0gbnVsbFxuICAgIEB1bnBhc3NBbGwoKVxuXG4gICAgQG91dHB1dCgnSGFuZCBkZWFsdCwgJyArIEBwbGF5ZXJzW0B0dXJuXS5uYW1lICsgJyBwbGF5cyBmaXJzdCcpXG5cbiAgICByZXR1cm4gT0tcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIFRoaXJ0ZWVuIG1ldGhvZHNcblxuICBzYXZlOiAtPlxuICAgIG5hbWVzID0gXCJsb2cgcGxheWVycyB0dXJuIHBpbGUgcGlsZVdobyB0aHJvd0lEIGN1cnJlbnRQbGF5IHN0cmVhayBsYXN0U3RyZWFrXCIuc3BsaXQoXCIgXCIpXG4gICAgc3RhdGUgPSB7fVxuICAgIGZvciBuYW1lIGluIG5hbWVzXG4gICAgICBzdGF0ZVtuYW1lXSA9IHRoaXNbbmFtZV1cbiAgICByZXR1cm4gc3RhdGVcblxuICBvdXRwdXQ6ICh0ZXh0KSAtPlxuICAgIEBsb2cucHVzaCB0ZXh0XG4gICAgd2hpbGUgQGxvZy5sZW5ndGggPiBNQVhfTE9HX0xJTkVTXG4gICAgICBAbG9nLnNoaWZ0KClcblxuICBoZWFkbGluZTogLT5cbiAgICBpZiBAd2lubmVyKCkgIT0gbnVsbFxuICAgICAgcmV0dXJuIFwiR2FtZSBPdmVyXCJcblxuICAgIGlmIEBwaWxlLmxlbmd0aCA9PSAwXG4gICAgICBwbGF5U3RyaW5nID0gXCJ0aHJvdyBBbnl0aGluZyB3aXRoIHRoZSAzXFx4YzhcIlxuICAgIGVsc2VcbiAgICAgIGlmIEBjdXJyZW50UGxheVxuICAgICAgICBwbGF5U3RyaW5nID0gXCJiZWF0IFwiICsgcGxheVRvU3RyaW5nKEBjdXJyZW50UGxheSlcbiAgICAgIGVsc2VcbiAgICAgICAgcGxheVN0cmluZyA9IFwidGhyb3cgQW55dGhpbmdcIlxuXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcbiAgICBpZiBjdXJyZW50UGxheWVyLmFpXG4gICAgICBwbGF5ZXJDb2xvciA9ICdiMGIwMDAnXG4gICAgZWxzZVxuICAgICAgcGxheWVyQ29sb3IgPSAnZmY3NzAwJ1xuICAgIGhlYWRsaW5lID0gXCJgI3twbGF5ZXJDb2xvcn1gI3tjdXJyZW50UGxheWVyLm5hbWV9YGZmZmZmZmAgdG8gI3twbGF5U3RyaW5nfVwiXG4gICAgaWYgQGV2ZXJ5b25lUGFzc2VkKClcbiAgICAgIGhlYWRsaW5lICs9IFwiIChvciB0aHJvdyBhbnl0aGluZylcIlxuICAgIHJldHVybiBoZWFkbGluZVxuXG4gIGZpbmRQbGF5ZXI6IChpZCkgLT5cbiAgICBmb3IgcGxheWVyIGluIEBwbGF5ZXJzXG4gICAgICBpZiBwbGF5ZXIuaWQgPT0gaWRcbiAgICAgICAgcmV0dXJuIHBsYXllclxuICAgIHJldHVybiB1bmRlZmluZWRcblxuICBjdXJyZW50UGxheWVyOiAtPlxuICAgIHJldHVybiBAcGxheWVyc1tAdHVybl1cblxuICBldmVyeW9uZVBhc3NlZDogLT5cbiAgICBmb3IgcGxheWVyLCBwbGF5ZXJJbmRleCBpbiBAcGxheWVyc1xuICAgICAgaWYgcGxheWVySW5kZXggPT0gQHR1cm5cbiAgICAgICAgY29udGludWVcbiAgICAgIGlmIG5vdCBwbGF5ZXIucGFzc1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICByZXR1cm4gdHJ1ZVxuXG4gIHBsYXllckFmdGVyOiAoaW5kZXgpIC0+XG4gICAgcmV0dXJuIChpbmRleCArIDEpICUgQHBsYXllcnMubGVuZ3RoXG5cbiAgYWRkUGxheWVyOiAocGxheWVyKSAtPlxuICAgIGlmIG5vdCBwbGF5ZXIuYWlcbiAgICAgIHBsYXllci5haSA9IGZhbHNlXG5cbiAgICBAcGxheWVycy5wdXNoIHBsYXllclxuICAgIHBsYXllci5pbmRleCA9IEBwbGF5ZXJzLmxlbmd0aCAtIDFcbiAgICBAb3V0cHV0KHBsYXllci5uYW1lICsgXCIgam9pbnMgdGhlIGdhbWVcIilcblxuICBuYW1lUHJlc2VudDogKG5hbWUpIC0+XG4gICAgZm9yIHBsYXllciBpbiBAcGxheWVyc1xuICAgICAgaWYgcGxheWVyLm5hbWUgPT0gbmFtZVxuICAgICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgYWRkQUk6IC0+XG4gICAgbG9vcFxuICAgICAgY2hhcmFjdGVyID0gcmFuZG9tQ2hhcmFjdGVyKClcbiAgICAgIGlmIG5vdCBAbmFtZVByZXNlbnQoY2hhcmFjdGVyLm5hbWUpXG4gICAgICAgIGJyZWFrXG5cbiAgICBhaSA9XG4gICAgICBjaGFySUQ6IGNoYXJhY3Rlci5pZFxuICAgICAgbmFtZTogY2hhcmFjdGVyLm5hbWVcbiAgICAgIGlkOiAnYWknICsgU3RyaW5nKEBwbGF5ZXJzLmxlbmd0aClcbiAgICAgIHBhc3M6IGZhbHNlXG4gICAgICBhaTogdHJ1ZVxuXG4gICAgQGFkZFBsYXllcihhaSlcblxuICAgIEBnYW1lLmxvZyhcImFkZGVkIEFJIHBsYXllclwiKVxuICAgIHJldHVybiBPS1xuXG4gIHVwZGF0ZVBsYXllckhhbmQ6IChjYXJkcykgLT5cbiAgICAjIFRoaXMgbWFpbnRhaW5zIHRoZSByZW9yZ2FuaXplZCBvcmRlciBvZiB0aGUgcGxheWVyJ3MgaGFuZFxuICAgIEBwbGF5ZXJzWzBdLmhhbmQgPSBjYXJkcy5zbGljZSgwKVxuXG4gIHdpbm5lcjogLT5cbiAgICBmb3IgcGxheWVyLCBpIGluIEBwbGF5ZXJzXG4gICAgICBpZiBwbGF5ZXIuaGFuZC5sZW5ndGggPT0gMFxuICAgICAgICByZXR1cm4gcGxheWVyXG4gICAgcmV0dXJuIG51bGxcblxuICBoYXNDYXJkOiAoaGFuZCwgcmF3Q2FyZCkgLT5cbiAgICBmb3IgcmF3IGluIGhhbmRcbiAgICAgIGlmIHJhdyA9PSByYXdDYXJkXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgaGFzQ2FyZHM6IChoYW5kLCByYXdDYXJkcykgLT5cbiAgICBmb3IgcmF3IGluIHJhd0NhcmRzXG4gICAgICBpZiBub3QgQGhhc0NhcmQoaGFuZCwgcmF3KVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICByZXR1cm4gdHJ1ZVxuXG4gIHJlbW92ZUNhcmRzOiAoaGFuZCwgcmF3Q2FyZHMpIC0+XG4gICAgbmV3SGFuZCA9IFtdXG4gICAgZm9yIGNhcmQgaW4gaGFuZFxuICAgICAga2VlcE1lID0gdHJ1ZVxuICAgICAgZm9yIHJhdyBpbiByYXdDYXJkc1xuICAgICAgICBpZiBjYXJkID09IHJhd1xuICAgICAgICAgIGtlZXBNZSA9IGZhbHNlXG4gICAgICAgICAgYnJlYWtcbiAgICAgIGlmIGtlZXBNZVxuICAgICAgICBuZXdIYW5kLnB1c2ggY2FyZFxuICAgIHJldHVybiBuZXdIYW5kXG5cbiAgY2xhc3NpZnk6IChyYXdDYXJkcykgLT5cbiAgICBjYXJkcyA9IHJhd0NhcmRzLm1hcCAocmF3KSAtPiBuZXcgQ2FyZChyYXcpXG4gICAgY2FyZHMgPSBjYXJkcy5zb3J0IChhLCBiKSAtPiByZXR1cm4gYS5yYXcgLSBiLnJhd1xuICAgIGhpZ2hlc3RSYXcgPSBjYXJkc1tjYXJkcy5sZW5ndGggLSAxXS5yYXdcblxuICAgICMgbG9vayBmb3IgYSBydW4gb2YgcGFpcnNcbiAgICBpZiAoY2FyZHMubGVuZ3RoID49IDYpIGFuZCAoKGNhcmRzLmxlbmd0aCAlIDIpID09IDApXG4gICAgICBmb3VuZFJvcCA9IHRydWVcbiAgICAgIGZvciBjYXJkLCBjYXJkSW5kZXggaW4gY2FyZHNcbiAgICAgICAgaWYgY2FyZEluZGV4ID09IDBcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICBpZiBjYXJkLnZhbHVlID09IDEyXG4gICAgICAgICAgIyBubyAycyBpbiBhIHJ1blxuICAgICAgICAgIGZvdW5kUm9wID0gZmFsc2VcbiAgICAgICAgICBicmVha1xuICAgICAgICBpZiAoY2FyZEluZGV4ICUgMikgPT0gMVxuICAgICAgICAgICMgb2RkIGNhcmQsIG11c3QgbWF0Y2ggbGFzdCBjYXJkIGV4YWN0bHlcbiAgICAgICAgICBpZiBjYXJkLnZhbHVlICE9IChjYXJkc1tjYXJkSW5kZXggLSAxXS52YWx1ZSlcbiAgICAgICAgICAgIGZvdW5kUm9wID0gZmFsc2VcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAjIGV2ZW4gY2FyZCwgbXVzdCBpbmNyZW1lbnRcbiAgICAgICAgICBpZiBjYXJkLnZhbHVlICE9IChjYXJkc1tjYXJkSW5kZXggLSAxXS52YWx1ZSArIDEpXG4gICAgICAgICAgICBmb3VuZFJvcCA9IGZhbHNlXG4gICAgICAgICAgICBicmVha1xuXG4gICAgICBpZiBmb3VuZFJvcFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHR5cGU6ICdyb3AnICsgTWF0aC5mbG9vcihjYXJkcy5sZW5ndGggLyAyKVxuICAgICAgICAgIGhpZ2g6IGhpZ2hlc3RSYXdcbiAgICAgICAgfVxuXG4gICAgIyBsb29rIGZvciBhIHJ1blxuICAgIGlmIGNhcmRzLmxlbmd0aCA+PSAzXG4gICAgICBmb3VuZFJ1biA9IHRydWVcbiAgICAgIGZvciBjYXJkLCBjYXJkSW5kZXggaW4gY2FyZHNcbiAgICAgICAgaWYgY2FyZEluZGV4ID09IDBcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICBpZiBjYXJkLnZhbHVlID09IDEyXG4gICAgICAgICAgIyBubyAycyBpbiBhIHJ1blxuICAgICAgICAgIGZvdW5kUnVuID0gZmFsc2VcbiAgICAgICAgICBicmVha1xuICAgICAgICBpZiBjYXJkLnZhbHVlICE9IChjYXJkc1tjYXJkSW5kZXggLSAxXS52YWx1ZSArIDEpXG4gICAgICAgICAgZm91bmRSdW4gPSBmYWxzZVxuICAgICAgICAgIGJyZWFrXG5cbiAgICAgIGlmIGZvdW5kUnVuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdHlwZTogJ3J1bicgKyBjYXJkcy5sZW5ndGhcbiAgICAgICAgICBoaWdoOiBoaWdoZXN0UmF3XG4gICAgICAgIH1cblxuICAgICMgbG9vayBmb3IgWCBvZiBhIGtpbmRcbiAgICByZXFWYWx1ZSA9IGNhcmRzWzBdLnZhbHVlXG4gICAgZm9yIGNhcmQgaW4gY2FyZHNcbiAgICAgIGlmIGNhcmQudmFsdWUgIT0gcmVxVmFsdWVcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICB0eXBlID0gJ2tpbmQnICsgY2FyZHMubGVuZ3RoXG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IHR5cGVcbiAgICAgIGhpZ2g6IGhpZ2hlc3RSYXdcbiAgICB9XG5cbiAgaGFuZEhhczNTOiAoaGFuZCkgLT5cbiAgICBmb3IgcmF3IGluIGhhbmRcbiAgICAgIGlmIHJhdyA9PSAwXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgY2FuUGFzczogKHBhcmFtcykgLT5cbiAgICBpZiBAd2lubmVyKCkgIT0gbnVsbFxuICAgICAgcmV0dXJuICdnYW1lT3ZlcidcblxuICAgIGN1cnJlbnRQbGF5ZXIgPSBAY3VycmVudFBsYXllcigpXG4gICAgaWYgcGFyYW1zLmlkICE9IGN1cnJlbnRQbGF5ZXIuaWRcbiAgICAgIHJldHVybiAnbm90WW91clR1cm4nXG5cbiAgICBpZiBAcGlsZS5sZW5ndGggPT0gMFxuICAgICAgcmV0dXJuICdtdXN0VGhyb3czUydcblxuICAgIGlmIEBldmVyeW9uZVBhc3NlZCgpXG4gICAgICByZXR1cm4gJ3Rocm93QW55dGhpbmcnXG5cbiAgICByZXR1cm4gT0tcblxuICBjYW5QbGF5OiAocGFyYW1zLCBpbmNvbWluZ1BsYXksIGhhbmRIYXMzUykgLT5cbiAgICBpZiBAd2lubmVyKCkgIT0gbnVsbFxuICAgICAgcmV0dXJuICdnYW1lT3ZlcidcblxuICAgIGN1cnJlbnRQbGF5ZXIgPSBAY3VycmVudFBsYXllcigpXG4gICAgaWYgcGFyYW1zLmlkICE9IGN1cnJlbnRQbGF5ZXIuaWRcbiAgICAgIHJldHVybiAnbm90WW91clR1cm4nXG5cbiAgICBpZiBpbmNvbWluZ1BsYXkgPT0gbnVsbFxuICAgICAgcmV0dXJuICdpbnZhbGlkUGxheSdcblxuICAgIGlmIEBwaWxlLmxlbmd0aCA9PSAwXG4gICAgICBpZiBub3QgaGFuZEhhczNTXG4gICAgICAgIHJldHVybiAnbXVzdFRocm93M1MnXG5cbiAgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxuICAgIGlmIGN1cnJlbnRQbGF5ZXIucGFzc1xuICAgICAgaWYgQGN1cnJlbnRQbGF5IGFuZCBAY2FuQmVCcm9rZW4oQGN1cnJlbnRQbGF5KVxuICAgICAgICBpZiBAaXNCcmVha2VyVHlwZShpbmNvbWluZ1BsYXkudHlwZSlcbiAgICAgICAgICByZXR1cm4gT0tcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJldHVybiAnbXVzdEJyZWFrT3JQYXNzJ1xuICAgICAgcmV0dXJuICdtdXN0UGFzcydcblxuICAgIGlmIEBjdXJyZW50UGxheSA9PSBudWxsXG4gICAgICByZXR1cm4gT0tcblxuICAgIGlmIEBldmVyeW9uZVBhc3NlZCgpXG4gICAgICByZXR1cm4gT0tcblxuICAgIGlmIEBjYW5CZUJyb2tlbihAY3VycmVudFBsYXkpIGFuZCBAaXNCcmVha2VyVHlwZShpbmNvbWluZ1BsYXkudHlwZSlcbiAgICAgICMgMiBicmVha2VyIVxuICAgICAgcmV0dXJuIE9LXG5cbiAgICBpZiBpbmNvbWluZ1BsYXkudHlwZSAhPSBAY3VycmVudFBsYXkudHlwZVxuICAgICAgcmV0dXJuICd3cm9uZ1BsYXknXG5cbiAgICBpZiBpbmNvbWluZ1BsYXkuaGlnaCA8IEBjdXJyZW50UGxheS5oaWdoXG4gICAgICByZXR1cm4gJ3Rvb0xvd1BsYXknXG5cbiAgICByZXR1cm4gT0tcblxuICBwbGF5OiAocGFyYW1zKSAtPlxuICAgIGluY29taW5nUGxheSA9IEBjbGFzc2lmeShwYXJhbXMuY2FyZHMpXG4gICAgY29uc29sZS5sb2cgXCJpbmNvbWluZ1BsYXlcIiwgaW5jb21pbmdQbGF5XG5cbiAgICBjb25zb2xlLmxvZyBcInNvbWVvbmUgY2FsbGluZyBwbGF5XCIsIHBhcmFtc1xuICAgIHJldCA9IEBjYW5QbGF5KHBhcmFtcywgaW5jb21pbmdQbGF5LCBAaGFuZEhhczNTKHBhcmFtcy5jYXJkcykpXG4gICAgaWYgcmV0ICE9IE9LXG4gICAgICByZXR1cm4gcmV0XG5cbiAgICAjIFRPRE86IG1ha2UgcHJldHR5IG5hbWVzIGJhc2VkIG9uIHRoZSBwbGF5LCBhZGQgcGxheSB0byBoZWFkbGluZVxuICAgIHZlcmIgPSBcInRocm93czpcIlxuICAgIGlmIEBjdXJyZW50UGxheVxuICAgICAgaWYgQGNhbkJlQnJva2VuKEBjdXJyZW50UGxheSkgYW5kIEBpc0JyZWFrZXJUeXBlKGluY29taW5nUGxheS50eXBlKVxuICAgICAgICAjIDIgYnJlYWtlciFcbiAgICAgICAgQHVucGFzc0FsbCgpXG4gICAgICAgIHZlcmIgPSBcImJyZWFrcyAyOlwiXG4gICAgICBlbHNlIGlmIChpbmNvbWluZ1BsYXkudHlwZSAhPSBAY3VycmVudFBsYXkudHlwZSkgb3IgKGluY29taW5nUGxheS5oaWdoIDwgQGN1cnJlbnRQbGF5LmhpZ2gpXG4gICAgICAgICMgTmV3IHBsYXkhXG4gICAgICAgIEB1bnBhc3NBbGwoKVxuICAgICAgICB2ZXJiID0gXCJ0aHJvd3MgbmV3OlwiXG4gICAgZWxzZVxuICAgICAgdmVyYiA9IFwiYmVnaW5zOlwiXG5cbiAgICBAY3VycmVudFBsYXkgPSBpbmNvbWluZ1BsYXlcblxuICAgIEB0aHJvd0lEICs9IDFcbiAgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxuICAgIGN1cnJlbnRQbGF5ZXIuaGFuZCA9IEByZW1vdmVDYXJkcyhjdXJyZW50UGxheWVyLmhhbmQsIHBhcmFtcy5jYXJkcylcblxuICAgIEBvdXRwdXQoXCIje2N1cnJlbnRQbGF5ZXIubmFtZX0gI3t2ZXJifSAje3BsYXlUb1N0cmluZyhpbmNvbWluZ1BsYXkpfVwiKVxuXG4gICAgaWYgY3VycmVudFBsYXllci5oYW5kLmxlbmd0aCA9PSAwXG4gICAgICBAb3V0cHV0KFwiI3tjdXJyZW50UGxheWVyLm5hbWV9IHdpbnMhXCIpXG4gICAgICBpZiBjdXJyZW50UGxheWVyLmFpXG4gICAgICAgIEBsYXN0U3RyZWFrID0gQHN0cmVha1xuICAgICAgICBAc3RyZWFrID0gMFxuICAgICAgZWxzZVxuICAgICAgICBAc3RyZWFrICs9IDFcbiAgICAgICAgQGxhc3RTdHJlYWsgPSBAc3RyZWFrXG5cbiAgICBAcGlsZSA9IHBhcmFtcy5jYXJkcy5zbGljZSgwKVxuICAgIEBwaWxlV2hvID0gQHR1cm5cblxuICAgIEB0dXJuID0gQHBsYXllckFmdGVyKEB0dXJuKVxuICAgIHJldHVybiBPS1xuXG4gIHVucGFzc0FsbDogLT5cbiAgICBmb3IgcGxheWVyIGluIEBwbGF5ZXJzXG4gICAgICBwbGF5ZXIucGFzcyA9IGZhbHNlXG4gICAgcmV0dXJuXG5cbiAgcGFzczogKHBhcmFtcykgLT5cbiAgICByZXQgPSBAY2FuUGFzcyhwYXJhbXMpXG4gICAgaWYgcmV0ICE9IE9LXG4gICAgICByZXR1cm4gcmV0XG5cbiAgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxuICAgIGlmIGN1cnJlbnRQbGF5ZXIucGFzc1xuICAgICAgQG91dHB1dChcIiN7Y3VycmVudFBsYXllci5uYW1lfSBhdXRvLXBhc3Nlc1wiKVxuICAgIGVsc2VcbiAgICAgIEBvdXRwdXQoXCIje2N1cnJlbnRQbGF5ZXIubmFtZX0gcGFzc2VzXCIpXG4gICAgY3VycmVudFBsYXllci5wYXNzID0gdHJ1ZVxuICAgIEB0dXJuID0gQHBsYXllckFmdGVyKEB0dXJuKVxuICAgIHJldHVybiBPS1xuXG4gIGFpUGxheTogKGN1cnJlbnRQbGF5ZXIsIGNhcmRzKSAtPlxuICAgIHJldHVybiBAcGxheSh7J2lkJzpjdXJyZW50UGxheWVyLmlkLCAnY2FyZHMnOmNhcmRzfSlcblxuICBhaVBhc3M6IChjdXJyZW50UGxheWVyKSAtPlxuICAgIHJldHVybiBAcGFzcyh7J2lkJzpjdXJyZW50UGxheWVyLmlkfSlcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIEFJXG5cbiAgIyBHZW5lcmljIGxvZ2dpbmcgZnVuY3Rpb247IHByZXBlbmRzIGN1cnJlbnQgQUkgcGxheWVyJ3MgZ3V0cyBiZWZvcmUgcHJpbnRpbmcgdGV4dFxuICBhaUxvZzogKHRleHQpIC0+XG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcbiAgICBpZiBub3QgY3VycmVudFBsYXllci5haVxuICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICBjaGFyYWN0ZXIgPSBhaUNoYXJhY3RlcnNbY3VycmVudFBsYXllci5jaGFySURdXG4gICAgQGdhbWUubG9nKCdBSVsnK2N1cnJlbnRQbGF5ZXIubmFtZSsnICcrY2hhcmFjdGVyLmJyYWluKyddOiBoYW5kOicrY2FyZHNUb1N0cmluZyhjdXJyZW50UGxheWVyLmhhbmQpKycgcGlsZTonK2NhcmRzVG9TdHJpbmcoQHBpbGUpKycgJyt0ZXh0KVxuXG4gICMgRGV0ZWN0cyBpZiB0aGUgY3VycmVudCBwbGF5ZXIgaXMgQUkgZHVyaW5nIGEgQklEIG9yIFRSSUNLIHBoYXNlIGFuZCBhY3RzIGFjY29yZGluZyB0byB0aGVpciAnYnJhaW4nXG4gIGFpVGljazogLT5cbiAgICBpZiBAd2lubmVyKCkgIT0gbnVsbFxuICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxuICAgIGlmIG5vdCBjdXJyZW50UGxheWVyLmFpXG4gICAgICBpZiBAY3VycmVudFBsYXkgYW5kIChAY3VycmVudFBsYXkudHlwZSA9PSAna2luZDEnKSBhbmQgQGhhc0JyZWFrZXIoY3VycmVudFBsYXllci5oYW5kKVxuICAgICAgICAjIGRvIG5vdGhpbmcsIHBsYXllciBjYW4gZHJvcCBhIGJyZWFrZXJcbiAgICAgIGVsc2UgaWYgY3VycmVudFBsYXllci5wYXNzXG4gICAgICAgIEBhaUxvZyhcImF1dG9wYXNzaW5nIGZvciBwbGF5ZXJcIilcbiAgICAgICAgQGFpUGFzcyhjdXJyZW50UGxheWVyKVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICBjaGFyYWN0ZXIgPSBhaUNoYXJhY3RlcnNbY3VycmVudFBsYXllci5jaGFySURdXG4gICAgcmV0ID0gQGJyYWluc1tjaGFyYWN0ZXIuYnJhaW5dLnBsYXkuYXBwbHkodGhpcywgW2N1cnJlbnRQbGF5ZXIsIEBjdXJyZW50UGxheSwgQGV2ZXJ5b25lUGFzc2VkKCldKVxuICAgIGlmIHJldCA9PSBPS1xuICAgICAgcmV0dXJuIHRydWVcbiAgICByZXR1cm4gZmFsc2VcblxuICBhbENhbGNLaW5kczogKGhhbmQsIHBsYXlzLCBtYXRjaDJzID0gZmFsc2UpIC0+XG4gICAgY2FyZHMgPSBoYW5kLm1hcCAocmF3KSAtPiBuZXcgQ2FyZChyYXcpXG4gICAgY2FyZHMgPSBjYXJkcy5zb3J0IChhLCBiKSAtPiByZXR1cm4gYS5yYXcgLSBiLnJhd1xuICAgIHZhbHVlQXJyYXlzID0gW11cbiAgICBmb3IgaSBpbiBbMC4uLjEzXVxuICAgICAgdmFsdWVBcnJheXMucHVzaCBbXVxuICAgIGZvciBjYXJkIGluIGNhcmRzXG4gICAgICB2YWx1ZUFycmF5c1tjYXJkLnZhbHVlXS5wdXNoKGNhcmQpXG5cbiAgICBoYW5kID0gW11cbiAgICBmb3IgdmFsdWVBcnJheSwgdmFsdWUgaW4gdmFsdWVBcnJheXNcbiAgICAgIGlmICh2YWx1ZUFycmF5Lmxlbmd0aCA+IDEpIGFuZCAobWF0Y2gycyBvciAodmFsdWUgPCAxMikpXG4gICAgICAgIGtleSA9IFwia2luZCN7dmFsdWVBcnJheS5sZW5ndGh9XCJcbiAgICAgICAgcGxheXNba2V5XSA/PSBbXVxuICAgICAgICBwbGF5c1trZXldLnB1c2ggdmFsdWVBcnJheS5tYXAgKHYpIC0+IHYucmF3XG4gICAgICBlbHNlXG4gICAgICAgIGZvciB2IGluIHZhbHVlQXJyYXlcbiAgICAgICAgICBoYW5kLnB1c2ggdi5yYXdcblxuICAgIHJldHVybiBoYW5kXG5cbiAgYWlGaW5kUnVuczogKGhhbmQsIGVhY2hTaXplLCBzaXplKSAtPlxuICAgIHJ1bnMgPSBbXVxuXG4gICAgY2FyZHMgPSBoYW5kLm1hcCAocmF3KSAtPiBuZXcgQ2FyZChyYXcpXG4gICAgY2FyZHMgPSBjYXJkcy5zb3J0IChhLCBiKSAtPiByZXR1cm4gYS5yYXcgLSBiLnJhd1xuICAgIHZhbHVlQXJyYXlzID0gW11cbiAgICBmb3IgaSBpbiBbMC4uLjEzXVxuICAgICAgdmFsdWVBcnJheXMucHVzaCBbXVxuICAgIGZvciBjYXJkIGluIGNhcmRzXG4gICAgICB2YWx1ZUFycmF5c1tjYXJkLnZhbHVlXS5wdXNoKGNhcmQpXG5cbiAgICBsYXN0U3RhcnRpbmdWYWx1ZSA9IDEyIC0gc2l6ZVxuICAgIGZvciBzdGFydGluZ1ZhbHVlIGluIFswLi4ubGFzdFN0YXJ0aW5nVmFsdWVdXG4gICAgICBydW5Gb3VuZCA9IHRydWVcbiAgICAgIGZvciBvZmZzZXQgaW4gWzAuLi5zaXplXVxuICAgICAgICBpZiB2YWx1ZUFycmF5c1tzdGFydGluZ1ZhbHVlK29mZnNldF0ubGVuZ3RoIDwgZWFjaFNpemVcbiAgICAgICAgICBydW5Gb3VuZCA9IGZhbHNlXG4gICAgICAgICAgYnJlYWtcbiAgICAgIGlmIHJ1bkZvdW5kXG4gICAgICAgIHJ1biA9IFtdXG4gICAgICAgIGZvciBvZmZzZXQgaW4gWzAuLi5zaXplXVxuICAgICAgICAgIGZvciBlYWNoIGluIFswLi4uZWFjaFNpemVdXG4gICAgICAgICAgICBydW4ucHVzaCh2YWx1ZUFycmF5c1tzdGFydGluZ1ZhbHVlK29mZnNldF0ucG9wKCkucmF3KVxuICAgICAgICBydW5zLnB1c2ggcnVuXG5cbiAgICBsZWZ0b3ZlcnMgPSBbXVxuICAgIGZvciB2YWx1ZUFycmF5IGluIHZhbHVlQXJyYXlzXG4gICAgICBmb3IgY2FyZCBpbiB2YWx1ZUFycmF5XG4gICAgICAgIGxlZnRvdmVycy5wdXNoIGNhcmQucmF3XG5cbiAgICByZXR1cm4gW3J1bnMsIGxlZnRvdmVyc11cblxuICBhaUNhbGNSdW5zOiAoaGFuZCwgcGxheXMsIHNtYWxsUnVucykgLT5cbiAgICBpZiBzbWFsbFJ1bnNcbiAgICAgIHN0YXJ0U2l6ZSA9IDNcbiAgICAgIGVuZFNpemUgPSAxMlxuICAgICAgYnlBbW91bnQgPSAxXG4gICAgZWxzZVxuICAgICAgc3RhcnRTaXplID0gMTJcbiAgICAgIGVuZFNpemUgPSAzXG4gICAgICBieUFtb3VudCA9IC0xXG4gICAgZm9yIHJ1blNpemUgaW4gW3N0YXJ0U2l6ZS4uZW5kU2l6ZV0gYnkgYnlBbW91bnRcbiAgICAgIFtydW5zLCBsZWZ0b3ZlcnNdID0gQGFpRmluZFJ1bnMoaGFuZCwgMSwgcnVuU2l6ZSlcbiAgICAgIGlmIHJ1bnMubGVuZ3RoID4gMFxuICAgICAgICBrZXkgPSBcInJ1biN7cnVuU2l6ZX1cIlxuICAgICAgICBwbGF5c1trZXldID0gcnVuc1xuICAgICAgaGFuZCA9IGxlZnRvdmVyc1xuXG4gICAgcmV0dXJuIGhhbmRcblxuICBhaUNhbGNSb3BzOiAoaGFuZCwgcGxheXMpIC0+XG4gICAgc3RhcnRTaXplID0gM1xuICAgIGVuZFNpemUgPSA2XG4gICAgZm9yIHJ1blNpemUgaW4gW3N0YXJ0U2l6ZS4uZW5kU2l6ZV1cbiAgICAgIFtyb3BzLCBsZWZ0b3ZlcnNdID0gQGFpRmluZFJ1bnMoaGFuZCwgMiwgcnVuU2l6ZSlcbiAgICAgIGlmIHJvcHMubGVuZ3RoID4gMFxuICAgICAgICBrZXkgPSBcInJvcCN7cnVuU2l6ZX1cIlxuICAgICAgICBwbGF5c1trZXldID0gcm9wc1xuICAgICAgaGFuZCA9IGxlZnRvdmVyc1xuXG4gICAgcmV0dXJuIGhhbmRcblxuICBhaUNhbGNQbGF5czogKGhhbmQsIHN0cmF0ZWd5ID0ge30pIC0+XG4gICAgcGxheXMgPSB7fVxuXG4gICAgIyBXZSBhbHdheXMgd2FudCB0byB1c2Ugcm9wcyBpZiB3ZSBoYXZlIG9uZVxuICAgIGlmIHN0cmF0ZWd5LnNlZXNSb3BzXG4gICAgICBoYW5kID0gQGFpQ2FsY1JvcHMoaGFuZCwgcGxheXMpXG5cbiAgICBpZiBzdHJhdGVneS5wcmVmZXJzUnVuc1xuICAgICAgaGFuZCA9IEBhaUNhbGNSdW5zKGhhbmQsIHBsYXlzLCBzdHJhdGVneS5zbWFsbFJ1bnMpXG4gICAgICBoYW5kID0gQGFsQ2FsY0tpbmRzKGhhbmQsIHBsYXlzLCBzdHJhdGVneS5tYXRjaDJzKVxuICAgIGVsc2VcbiAgICAgIGhhbmQgPSBAYWxDYWxjS2luZHMoaGFuZCwgcGxheXMsIHN0cmF0ZWd5Lm1hdGNoMnMpXG4gICAgICBoYW5kID0gQGFpQ2FsY1J1bnMoaGFuZCwgcGxheXMsIHN0cmF0ZWd5LnNtYWxsUnVucylcblxuICAgIGtpbmQxID0gaGFuZC5tYXAgKHYpIC0+IFt2XVxuICAgIGlmIGtpbmQxLmxlbmd0aCA+IDBcbiAgICAgIHBsYXlzLmtpbmQxID0ga2luZDFcbiAgICByZXR1cm4gcGxheXNcblxuICBudW1iZXJPZlNpbmdsZXM6IChwbGF5cykgLT5cbiAgICBpZiBub3QgcGxheXMua2luZDE/XG4gICAgICByZXR1cm4gMFxuICAgIG5vblR3b1NpbmdsZXMgPSAwXG4gICAgZm9yIHJhdyBpbiBwbGF5cy5raW5kMVxuICAgICAgaWYgcmF3IDwgNDhcbiAgICAgICAgbm9uVHdvU2luZ2xlcyArPSAxXG4gICAgcmV0dXJuIG5vblR3b1NpbmdsZXNcblxuICBicmVha2VyUGxheXM6IChoYW5kKSAtPlxuICAgIHJldHVybiBAYWlDYWxjUGxheXMoaGFuZCwgeyBzZWVzUm9wczogdHJ1ZSwgcHJlZmVyc1J1bnM6IGZhbHNlIH0pXG5cbiAgaXNCcmVha2VyVHlwZTogKHBsYXlUeXBlKSAtPlxuICAgIGlmIHBsYXlUeXBlLm1hdGNoKC9ecm9wLykgb3IgcGxheVR5cGUgPT0gJ2tpbmQ0J1xuICAgICAgcmV0dXJuIHRydWVcbiAgICByZXR1cm4gZmFsc2VcblxuICBjYW5CZUJyb2tlbjogKHBsYXkpIC0+XG4gICAgaWYgcGxheS50eXBlICE9ICdraW5kMSdcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIGNhcmQgPSBuZXcgQ2FyZChwbGF5LmhpZ2gpXG4gICAgcmV0dXJuIChjYXJkLnZhbHVlID09IDEyKVxuXG4gIGhhc0JyZWFrZXI6IChoYW5kKSAtPlxuICAgIHBsYXlzID0gQGJyZWFrZXJQbGF5cyhoYW5kKVxuICAgIGZvciBwbGF5VHlwZSwgcGxheWxpc3Qgb2YgcGxheXNcbiAgICAgIGlmIEBpc0JyZWFrZXJUeXBlKHBsYXlUeXBlKVxuICAgICAgICBpZiBwbGF5bGlzdC5sZW5ndGggPiAwXG4gICAgICAgICAgcmV0dXJuIHRydWVcbiAgICByZXR1cm4gZmFsc2VcblxuICBhaUNhbGNCZXN0UGxheXM6IChoYW5kKSAtPlxuICAgIGJlc3RQbGF5cyA9IG51bGxcbiAgICBmb3IgYml0cyBpbiBbMC4uLjE2XVxuICAgICAgc3RyYXRlZ3kgPVxuICAgICAgICBzbWFsbFJ1bnM6IChiaXRzICYgMSkgPT0gMVxuICAgICAgICBwcmVmZXJzUnVuczogKGJpdHMgJiAyKSA9PSAyXG4gICAgICAgIG1hdGNoMnM6IChiaXRzICYgNCkgPT0gNFxuICAgICAgICBzZWVzUm9wczogKGJpdHMgJiA4KSA9PSA4XG4gICAgICBwbGF5cyA9IEBhaUNhbGNQbGF5cyhoYW5kLCBzdHJhdGVneSlcbiAgICAgIGlmIGJlc3RQbGF5cyA9PSBudWxsXG4gICAgICAgIGJlc3RQbGF5cyA9IHBsYXlzXG4gICAgICBlbHNlXG4gICAgICAgIG5wID0gQG51bWJlck9mU2luZ2xlcyhwbGF5cylcbiAgICAgICAgbmJwID0gQG51bWJlck9mU2luZ2xlcyhiZXN0UGxheXMpXG4gICAgICAgIGlmIG5wIDwgbmJwXG4gICAgICAgICAgYmVzdFBsYXlzID0gcGxheXNcbiAgICAgICAgZWxzZSBpZiBucCA9PSBuYnBcbiAgICAgICAgICAjIGZsaXAgYSBjb2luIVxuICAgICAgICAgIGlmIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpID09IDBcbiAgICAgICAgICAgIGJlc3RQbGF5cyA9IHBsYXlzXG4gICAgcmV0dXJuIGJlc3RQbGF5c1xuXG4gIHByZXR0eVBsYXlzOiAocGxheXMsIGV4dHJhUHJldHR5ID0gZmFsc2UpIC0+XG4gICAgcHJldHR5ID0ge31cbiAgICBmb3IgdHlwZSwgYXJyIG9mIHBsYXlzXG4gICAgICBwcmV0dHlbdHlwZV0gPSBbXVxuICAgICAgZm9yIHBsYXkgaW4gYXJyXG4gICAgICAgIG5hbWVzID0gW11cbiAgICAgICAgZm9yIHJhdyBpbiBwbGF5XG4gICAgICAgICAgY2FyZCA9IG5ldyBDYXJkKHJhdylcbiAgICAgICAgICBuYW1lcy5wdXNoKGNhcmQubmFtZSlcbiAgICAgICAgcHJldHR5W3R5cGVdLnB1c2gobmFtZXMpXG4gICAgaWYgZXh0cmFQcmV0dHlcbiAgICAgIHMgPSBcIlwiXG4gICAgICBmb3IgdHlwZU5hbWUsIHRocm93cyBvZiBwcmV0dHlcbiAgICAgICAgcyArPSBcIiAgICAgICogI3twbGF5VHlwZVRvU3RyaW5nKHR5cGVOYW1lKX06XFxuXCJcbiAgICAgICAgaWYgdHlwZU5hbWUgPT0gJ2tpbmQxJ1xuICAgICAgICAgIHMgKz0gXCIgICAgICAgICogI3t0aHJvd3MubWFwKCh2KSAtPiB2WzBdKS5qb2luKCcsJyl9XFxuXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGZvciB0IGluIHRocm93c1xuICAgICAgICAgICAgcyArPSBcIiAgICAgICAgKiAje3Quam9pbignLCcpfVxcblwiXG4gICAgICByZXR1cm4gc1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShwcmV0dHkpXG5cbiAgaGlnaGVzdENhcmQ6IChwbGF5KSAtPlxuICAgIGhpZ2hlc3QgPSAwXG4gICAgZm9yIHAgaW4gcGxheVxuICAgICAgaWYgaGlnaGVzdCA8IHBcbiAgICAgICAgaGlnaGVzdCA9IHBcbiAgICByZXR1cm4gaGlnaGVzdFxuXG4gIGZpbmRQbGF5V2l0aDNTOiAocGxheXMpIC0+XG4gICAgZm9yIHBsYXlUeXBlLCBwbGF5bGlzdCBvZiBwbGF5c1xuICAgICAgZm9yIHBsYXkgaW4gcGxheWxpc3RcbiAgICAgICAgaWYgQGhhbmRIYXMzUyhwbGF5KVxuICAgICAgICAgIHJldHVybiBwbGF5XG5cbiAgICBjb25zb2xlLmxvZyBcImZpbmRQbGF5V2l0aDNTOiBzb21ldGhpbmcgaW1wb3NzaWJsZSBpcyBoYXBwZW5pbmdcIlxuICAgIHJldHVybiBbXVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBBSSBCcmFpbnNcblxuICAjIEJyYWlucyBtdXN0IGhhdmU6XG4gICMgKiBpZDogaW50ZXJuYWwgaWRlbnRpZmllciBmb3IgdGhlIGJyYWluXG4gICMgKiBuYW1lOiBwcmV0dHkgbmFtZVxuICAjICogcGxheShjdXJyZW50UGxheWVyKSBhdHRlbXB0cyB0byBwbGF5IGEgY2FyZCBieSBjYWxsaW5nIGFpUGxheSgpLiBTaG91bGQgcmV0dXJuIHRydWUgaWYgaXQgc3VjY2Vzc2Z1bGx5IHBsYXllZCBhIGNhcmQgKGFpUGxheSgpIHJldHVybmVkIHRydWUpXG4gIGJyYWluczpcblxuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgIyBOb3JtYWw6IEludGVuZGVkIHRvIGJlIHVzZWQgYnkgbW9zdCBjaGFyYWN0ZXJzLlxuICAgICMgICAgICAgICBOb3QgdG9vIGR1bWIsIG5vdCB0b28gc21hcnQuXG4gICAgbm9ybWFsOlxuICAgICAgaWQ6ICAgXCJub3JtYWxcIlxuICAgICAgbmFtZTogXCJOb3JtYWxcIlxuXG4gICAgICAjIG5vcm1hbFxuICAgICAgcGxheTogKGN1cnJlbnRQbGF5ZXIsIGN1cnJlbnRQbGF5LCBldmVyeW9uZVBhc3NlZCkgLT5cbiAgICAgICAgaWYgY3VycmVudFBsYXllci5wYXNzXG4gICAgICAgICAgaWYgQGNhbkJlQnJva2VuKGN1cnJlbnRQbGF5KSBhbmQgQGhhc0JyZWFrZXIoY3VycmVudFBsYXllci5oYW5kKVxuICAgICAgICAgICAgYnJlYWtlclBsYXlzID0gQGJyZWFrZXJQbGF5cyhjdXJyZW50UGxheWVyLmhhbmQpXG4gICAgICAgICAgICBmb3IgcGxheVR5cGUsIHBsYXlsaXN0IG9mIGJyZWFrZXJQbGF5c1xuICAgICAgICAgICAgICBpZiAocGxheVR5cGUubWF0Y2goL15yb3AvKSBvciAocGxheVR5cGUgPT0gJ2tpbmQ0JykpIGFuZCAocGxheWxpc3QubGVuZ3RoID4gMClcbiAgICAgICAgICAgICAgICBAYWlMb2coXCJicmVha2luZyAyXCIpXG4gICAgICAgICAgICAgICAgaWYgQGFpUGxheShjdXJyZW50UGxheWVyLCBwbGF5bGlzdFswXSkgPT0gT0tcbiAgICAgICAgICAgICAgICAgIHJldHVybiBPS1xuXG4gICAgICAgICAgQGFpTG9nKFwiYWxyZWFkeSBwYXNzZWQsIGdvaW5nIHRvIGtlZXAgcGFzc2luZ1wiKVxuICAgICAgICAgIHJldHVybiBAYWlQYXNzKGN1cnJlbnRQbGF5ZXIpXG5cbiAgICAgICAgcGxheXMgPSBAYWlDYWxjQmVzdFBsYXlzKGN1cnJlbnRQbGF5ZXIuaGFuZClcbiAgICAgICAgQGFpTG9nKFwiYmVzdCBwbGF5czogI3tAcHJldHR5UGxheXMocGxheXMpfVwiKVxuXG4gICAgICAgIGlmIEBwaWxlLmxlbmd0aCA9PSAwXG4gICAgICAgICAgcGxheSA9IEBmaW5kUGxheVdpdGgzUyhwbGF5cylcbiAgICAgICAgICBAYWlMb2coXCJUaHJvd2luZyBteSBwbGF5IHdpdGggdGhlIDNTIGluIGl0XCIpXG4gICAgICAgICAgaWYgQGFpUGxheShjdXJyZW50UGxheWVyLCBwbGF5KSA9PSBPS1xuICAgICAgICAgICAgcmV0dXJuIE9LXG5cbiAgICAgICAgaWYgY3VycmVudFBsYXkgYW5kIG5vdCBldmVyeW9uZVBhc3NlZFxuICAgICAgICAgIGlmIHBsYXlzW2N1cnJlbnRQbGF5LnR5cGVdPyBhbmQgKHBsYXlzW2N1cnJlbnRQbGF5LnR5cGVdLmxlbmd0aCA+IDApXG4gICAgICAgICAgICBmb3IgcGxheSBpbiBwbGF5c1tjdXJyZW50UGxheS50eXBlXVxuICAgICAgICAgICAgICBpZiBAaGlnaGVzdENhcmQocGxheSkgPiBjdXJyZW50UGxheS5oaWdoXG4gICAgICAgICAgICAgICAgaWYgQGFpUGxheShjdXJyZW50UGxheWVyLCBwbGF5KSA9PSBPS1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIE9LXG4gICAgICAgICAgICBAYWlMb2coXCJJIGd1ZXNzIEkgY2FuJ3QgYWN0dWFsbHkgYmVhdCB0aGlzLCBwYXNzaW5nXCIpXG4gICAgICAgICAgICByZXR1cm4gQGFpUGFzcyhjdXJyZW50UGxheWVyKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBhaUxvZyhcIkkgZG9uJ3QgaGF2ZSB0aGF0IHBsYXksIHBhc3NpbmdcIilcbiAgICAgICAgICAgIHJldHVybiBAYWlQYXNzKGN1cnJlbnRQbGF5ZXIpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAjIG5vIGN1cnJlbnQgcGxheSwgdGhyb3cgdGhlIGZpcnN0IGNhcmRcbiAgICAgICAgICBAYWlMb2coXCJJIGNhbiBkbyBhbnl0aGluZywgdGhyb3dpbmcgYSByYW5kb20gcGxheVwiKVxuICAgICAgICAgIHBsYXlUeXBlcyA9IE9iamVjdC5rZXlzKHBsYXlzKVxuICAgICAgICAgIHBsYXlUeXBlSW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBwbGF5VHlwZXMubGVuZ3RoKVxuICAgICAgICAgIGlmIEBhaVBsYXkoY3VycmVudFBsYXllciwgcGxheXNbcGxheVR5cGVzW3BsYXlUeXBlSW5kZXhdXVswXSkgPT0gT0tcbiAgICAgICAgICAgIHJldHVybiBPS1xuXG4gICAgICAgICMgZmluZCB0aGUgZmlyc3QgY2FyZCB0aGF0IGJlYXRzIHRoZSBjdXJyZW50UGxheSdzIGhpZ2hcbiAgICAgICAgZm9yIHJhd0NhcmQgaW4gY3VycmVudFBsYXllci5oYW5kXG4gICAgICAgICAgaWYgcmF3Q2FyZCA+IGN1cnJlbnRQbGF5LmhpZ2hcbiAgICAgICAgICAgIEBhaUxvZyhcImZvdW5kIHNtYWxsZXN0IHNpbmdsZSAoI3tyYXdDYXJkfSksIHBsYXlpbmdcIilcbiAgICAgICAgICAgIGlmIEBhaVBsYXkoY3VycmVudFBsYXllciwgW3Jhd0NhcmRdKSA9PSBPS1xuICAgICAgICAgICAgICByZXR1cm4gT0tcbiAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgQGFpTG9nKFwibm90aGluZyBlbHNlIHRvIGRvLCBwYXNzaW5nXCIpXG4gICAgICAgIHJldHVybiBAYWlQYXNzKGN1cnJlbnRQbGF5ZXIpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIERlYnVnIGNvZGVcblxuZGVidWcgPSAtPlxuICB0aGlyID0gbmV3IFRoaXJ0ZWVuKClcbiAgZnVsbHlQbGF5ZWQgPSAwXG4gIHRvdGFsQXR0ZW1wdHMgPSAxMDBcblxuICBmb3IgYXR0ZW1wdCBpbiBbMC4uLnRvdGFsQXR0ZW1wdHNdXG4gICAgZGVjayA9IG5ldyBTaHVmZmxlZERlY2soKVxuICAgIGhhbmQgPSBbXVxuICAgIGZvciBqIGluIFswLi4uMTNdXG4gICAgICByYXcgPSBkZWNrLmNhcmRzLnNoaWZ0KClcbiAgICAgIGhhbmQucHVzaChyYXcpXG4gICAgIyBoYW5kID0gWzUxLDUwLDQ5LDQ4LDQ3LDQ2LDQ1LDQ0LDQzLDQyLDQxLDQwLDM5XVxuICAgICMgaGFuZCA9IFswLDEsMiwzLDQsNSw2LDcsOCw5LDEwLDExLDEyXVxuICAgIGhhbmQuc29ydCAoYSxiKSAtPiByZXR1cm4gYSAtIGJcblxuICAgIGNvbnNvbGUubG9nKFwiLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXCIpXG4gICAgY29uc29sZS5sb2coXCJIYW5kICN7YXR0ZW1wdCsxfTogI3tjYXJkc1RvU3RyaW5nKGhhbmQpfVwiKVxuICAgIGNvbnNvbGUubG9nKFwiXCIpXG5cbiAgICBmb3VuZEZ1bGx5UGxheWVkID0gZmFsc2VcbiAgICBmb3IgYml0cyBpbiBbMC4uLjE2XVxuICAgICAgc3RyYXRlZ3kgPVxuICAgICAgICBzbWFsbFJ1bnM6IChiaXRzICYgMSkgPT0gMVxuICAgICAgICBwcmVmZXJzUnVuczogKGJpdHMgJiAyKSA9PSAyXG4gICAgICAgIG1hdGNoMnM6IChiaXRzICYgNCkgPT0gNFxuICAgICAgICBzZWVzUm9wczogKGJpdHMgJiA4KSA9PSA4XG4gICAgICBwbGF5cyA9IHRoaXIuYWlDYWxjUGxheXMoaGFuZCwgc3RyYXRlZ3kpXG5cbiAgICAgIGNvbnNvbGUubG9nKFwiICAgKiBTdHJhdGVneTogI3tKU09OLnN0cmluZ2lmeShzdHJhdGVneSl9XCIpXG4gICAgICBjb25zb2xlLmxvZyh0aGlyLnByZXR0eVBsYXlzKHBsYXlzLCB0cnVlKSlcblxuICAgICAgaWYgbm90IHBsYXlzLmtpbmQxXG4gICAgICAgIGZvdW5kRnVsbHlQbGF5ZWQgPSB0cnVlXG5cbiAgICBpZiBmb3VuZEZ1bGx5UGxheWVkXG4gICAgICBmdWxseVBsYXllZCArPSAxXG5cbiAgY29uc29sZS5sb2cgXCJmdWxseVBsYXllZDogI3tmdWxseVBsYXllZH0gLyAje3RvdGFsQXR0ZW1wdHN9XCJcblxuIyBkZWJ1ZygpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEV4cG9ydHNcblxubW9kdWxlLmV4cG9ydHMgPVxuICBDYXJkOiBDYXJkXG4gIFRoaXJ0ZWVuOiBUaGlydGVlblxuICBPSzogT0tcbiAgYWlDaGFyYWN0ZXJzOiBhaUNoYXJhY3RlcnNcbiIsIm1vZHVsZS5leHBvcnRzID1cbiAgZGFya2ZvcmVzdDpcbiAgICBoZWlnaHQ6IDcyXG4gICAgZ2x5cGhzOlxuICAgICAgJzk3JyA6IHsgeDogICA4LCB5OiAgIDgsIHdpZHRoOiAgMzQsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnOTgnIDogeyB4OiAgIDgsIHk6ICA1OCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICc5OScgOiB7IHg6ICA1MCwgeTogICA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzEwMCc6IHsgeDogICA4LCB5OiAxMTgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnMTAxJzogeyB4OiAgIDgsIHk6IDE3OCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICcxMDInOiB7IHg6ICAgOCwgeTogMjI4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzMgfVxuICAgICAgJzEwMyc6IHsgeDogICA4LCB5OiAyNzgsIHdpZHRoOiAgMzYsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNSB9XG4gICAgICAnMTA0JzogeyB4OiAgIDgsIHk6IDMyOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICcxMDUnOiB7IHg6ICAgOCwgeTogMzc4LCB3aWR0aDogIDEyLCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMTEgfVxuICAgICAgJzEwNic6IHsgeDogICA4LCB5OiA0MjgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQxLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnMTA3JzogeyB4OiAgMjgsIHk6IDM3OCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDEsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICcxMDgnOiB7IHg6ICA1MSwgeTogMzI4LCB3aWR0aDogIDM0LCBoZWlnaHQ6ICA0MSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzMgfVxuICAgICAgJzEwOSc6IHsgeDogIDUxLCB5OiA0MjcsIHdpZHRoOiAgMzgsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNyB9XG4gICAgICAnMTEwJzogeyB4OiAgNzEsIHk6IDM3Nywgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICcxMTEnOiB7IHg6ICA5NywgeTogNDI3LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzExMic6IHsgeDogIDUxLCB5OiAgNTgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnMTEzJzogeyB4OiAgNTEsIHk6IDEwOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDUsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICcxMTQnOiB7IHg6ICA5MywgeTogICA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzUgfVxuICAgICAgJzExNSc6IHsgeDogIDUxLCB5OiAxNjEsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNSB9XG4gICAgICAnMTE2JzogeyB4OiAgNTEsIHk6IDIxMSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDMzIH1cbiAgICAgICcxMTcnOiB7IHg6ICA1MiwgeTogMjYxLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzExOCc6IHsgeDogIDkzLCB5OiAzMTEsIHdpZHRoOiAgMzQsIGhlaWdodDogIDQxLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzMiB9XG4gICAgICAnMTE5JzogeyB4OiAxMTQsIHk6IDM2MCwgd2lkdGg6ICAzOCwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM4IH1cbiAgICAgICcxMjAnOiB7IHg6IDE0MCwgeTogNDEwLCB3aWR0aDogIDM2LCBoZWlnaHQ6ICA0MSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzcgfVxuICAgICAgJzEyMSc6IHsgeDogMTQwLCB5OiA0NTksIHdpZHRoOiAgMzUsIGhlaWdodDogIDQxLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnMTIyJzogeyB4OiAxODMsIHk6IDQ1OSwgd2lkdGg6ICAzNiwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM1IH1cbiAgICAgICc2NScgOiB7IHg6ICA5NCwgeTogIDU4LCB3aWR0aDogIDM0LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxuICAgICAgJzY2JyA6IHsgeDogIDk0LCB5OiAxMTksIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNyB9XG4gICAgICAnNjcnIDogeyB4OiAgOTQsIHk6IDE4MCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cbiAgICAgICc2OCcgOiB7IHg6ICA5NSwgeTogMjQxLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzcgfVxuICAgICAgJzY5JyA6IHsgeDogMTM2LCB5OiAgIDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XG4gICAgICAnNzAnIDogeyB4OiAxMzcsIHk6ICA2OSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICc3MScgOiB7IHg6IDE3OSwgeTogICA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxuICAgICAgJzcyJyA6IHsgeDogMTM3LCB5OiAxMzAsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XG4gICAgICAnNzMnIDogeyB4OiAxMzgsIHk6IDE5MSwgd2lkdGg6ICAxMiwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDEzIH1cbiAgICAgICc3NCcgOiB7IHg6IDEzOCwgeTogMjUyLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxuICAgICAgJzc1JyA6IHsgeDogMTU4LCB5OiAxOTEsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XG4gICAgICAnNzYnIDogeyB4OiAxNjAsIHk6IDMxMywgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICc3NycgOiB7IHg6IDE4MSwgeTogMjUxLCB3aWR0aDogIDM4LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzkgfVxuICAgICAgJzc4JyA6IHsgeDogMTg0LCB5OiAzNzQsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNSB9XG4gICAgICAnNzknIDogeyB4OiAyMDMsIHk6IDMxMiwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM1IH1cbiAgICAgICc4MCcgOiB7IHg6IDE4MCwgeTogIDY5LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzgxJyA6IHsgeDogMjAxLCB5OiAxMzAsIHdpZHRoOiAgMzUsIGhlaWdodDogIDU2LCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNSB9XG4gICAgICAnODInIDogeyB4OiAyMjIsIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cbiAgICAgICc4MycgOiB7IHg6IDIyMywgeTogIDY5LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxuICAgICAgJzg0JyA6IHsgeDogMjY1LCB5OiAgIDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzMyB9XG4gICAgICAnODUnIDogeyB4OiAyMjcsIHk6IDE5NCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM1IH1cbiAgICAgICc4NicgOiB7IHg6IDI0NCwgeTogMTMwLCB3aWR0aDogIDQxLCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMTksIHhhZHZhbmNlOiAgMzkgfVxuICAgICAgJzg3JyA6IHsgeDogMjY2LCB5OiAgNjksIHdpZHRoOiAgMzgsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNyB9XG4gICAgICAnODgnIDogeyB4OiAzMDgsIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDE5LCB4YWR2YW5jZTogIDM1IH1cbiAgICAgICc4OScgOiB7IHg6IDIyNywgeTogMzczLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMTksIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzkwJyA6IHsgeDogMjI3LCB5OiA0MzMsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNSB9XG4gICAgICAnMzMnIDogeyB4OiAyNDYsIHk6IDI1NSwgd2lkdGg6ICAxNCwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDExIH1cbiAgICAgICc1OScgOiB7IHg6IDE4MCwgeTogMTMwLCB3aWR0aDogIDEzLCBoZWlnaHQ6ICAzNywgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNTYsIHhhZHZhbmNlOiAgMTMgfVxuICAgICAgJzM3JyA6IHsgeDogIDk1LCB5OiAzMDIsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XG4gICAgICAnNTgnIDogeyB4OiAxNjAsIHk6IDM3NCwgd2lkdGg6ICAxMywgaGVpZ2h0OiAgMjMsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDUwLCB4YWR2YW5jZTogIDEzIH1cbiAgICAgICc2MycgOiB7IHg6IDI2OCwgeTogMjU1LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzMgfVxuICAgICAgJzQyJyA6IHsgeDogMTAzLCB5OiAzMDIsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XG4gICAgICAnNDAnIDogeyB4OiAyNzAsIHk6IDE5MCwgd2lkdGg6ICAyMywgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDIxIH1cbiAgICAgICc0MScgOiB7IHg6IDI5MywgeTogMTMwLCB3aWR0aDogIDIzLCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMjEgfVxuICAgICAgJzk1JyA6IHsgeDogMTExLCB5OiAzMDIsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XG4gICAgICAnNDMnIDogeyB4OiAyNDYsIHk6IDMxNiwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgMzQsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDM5LCB4YWR2YW5jZTogIDMyIH1cbiAgICAgICc0NScgOiB7IHg6IDE4NCwgeTogNDM1LCB3aWR0aDogIDI2LCBoZWlnaHQ6ICAxMSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgNDQsIHhhZHZhbmNlOiAgMjUgfVxuICAgICAgJzYxJyA6IHsgeDogMzEyLCB5OiAgNjgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDMwLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICA0MiwgeGFkdmFuY2U6ICAzMyB9XG4gICAgICAnNDYnIDogeyB4OiAxMzUsIHk6IDMxMywgd2lkdGg6ICAxNCwgaGVpZ2h0OiAgMTEsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDYxLCB4YWR2YW5jZTogIDE0IH1cbiAgICAgICc0NCcgOiB7IHg6IDIyNywgeTogMjU1LCB3aWR0aDogIDEwLCBoZWlnaHQ6ICAyMSwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNjgsIHhhZHZhbmNlOiAgMTEgfVxuICAgICAgJzQ3JyA6IHsgeDogMzUxLCB5OiAgIDgsIHdpZHRoOiAgMjgsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAxOSwgeGFkdmFuY2U6ICAyNiB9XG4gICAgICAnMTI0JzogeyB4OiAxMTksIHk6IDMwMiwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cbiAgICAgICczNCcgOiB7IHg6IDEyNywgeTogMzAyLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxuICAgICAgJzM5JyA6IHsgeDogMjAxLCB5OiAxOTQsIHdpZHRoOiAgMTgsIGhlaWdodDogIDE5LCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAgMCwgeGFkdmFuY2U6ICAyMSB9XG4gICAgICAnNjQnIDogeyB4OiAyMTgsIHk6IDQzNSwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cbiAgICAgICczNScgOiB7IHg6IDIxOCwgeTogNDQzLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxuICAgICAgJzM2JyA6IHsgeDogMzAxLCB5OiAxOTAsIHdpZHRoOiAgMzIsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAyMiwgeGFkdmFuY2U6ICAyOSB9XG4gICAgICAnOTQnIDogeyB4OiAyMTgsIHk6IDQ1MSwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cbiAgICAgICczOCcgOiB7IHg6IDI0NiwgeTogMzU4LCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxuICAgICAgJzEyMyc6IHsgeDogMzI0LCB5OiAxMDYsIHdpZHRoOiAgMjcsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAyNiB9XG4gICAgICAnMTI1JzogeyB4OiAyNzAsIHk6IDM1OCwgd2lkdGg6ICAyNywgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDI3IH1cbiAgICAgICc5MScgOiB7IHg6IDI3MCwgeTogNDE4LCB3aWR0aDogIDIyLCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMjEgfVxuICAgICAgJzkzJyA6IHsgeDogMzAwLCB5OiA0MTgsIHdpZHRoOiAgMjIsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAyMCB9XG4gICAgICAnNDgnIDogeyB4OiAzMDUsIHk6IDMxNiwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cbiAgICAgICc0OScgOiB7IHg6IDMxMSwgeTogMjUxLCB3aWR0aDogIDM0LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxuICAgICAgJzUwJyA6IHsgeDogMzQxLCB5OiAxNjYsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNyB9XG4gICAgICAnNTEnIDogeyB4OiAzNTksIHk6ICA2OCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cbiAgICAgICc1MicgOiB7IHg6IDMzMCwgeTogMzc3LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxuICAgICAgJzUzJyA6IHsgeDogMzQ4LCB5OiAzMTIsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNyB9XG4gICAgICAnNTQnIDogeyB4OiAzMzAsIHk6IDQzOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cbiAgICAgICc1NScgOiB7IHg6IDM1MywgeTogMjI3LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzU2JyA6IHsgeDogMzg0LCB5OiAxMjksIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XG4gICAgICAnNTcnIDogeyB4OiA0MDIsIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cbiAgICAgICczMicgOiB7IHg6ICAgMCwgeTogICAwLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMjIgfVxuXG4gICAgICAjIGNhcmQgZ2x5cGhzXG4gICAgICAnMjAwJzogeyB4OiAzOTYsIHk6IDM3OCwgd2lkdGg6ICA0MCwgaGVpZ2h0OiAgNDksIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIxLCB4YWR2YW5jZTogIDQzIH0gIyBTXG4gICAgICAnMjAxJzogeyB4OiA0NDcsIHk6IDMxMywgd2lkdGg6ICA0OSwgaGVpZ2h0OiAgNTAsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIxLCB4YWR2YW5jZTogIDUyIH0gIyBDXG4gICAgICAnMjAyJzogeyB4OiAzOTksIHk6IDMxMywgd2lkdGg6ICAzNiwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIxLCB4YWR2YW5jZTogIDM5IH0gIyBEXG4gICAgICAnMjAzJzogeyB4OiA0NTIsIHk6IDM4MSwgd2lkdGg6ICAzOSwgaGVpZ2h0OiAgNDMsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIxLCB4YWR2YW5jZTogIDQyIH0gIyBIXG4iLCIjIFRoaXMgZmlsZSBwcm92aWRlcyB0aGUgcmVuZGVyaW5nIGVuZ2luZSBmb3IgdGhlIHdlYiB2ZXJzaW9uLiBOb25lIG9mIHRoaXMgY29kZSBpcyBpbmNsdWRlZCBpbiB0aGUgSmF2YSB2ZXJzaW9uLlxuXG5jb25zb2xlLmxvZyAnd2ViIHN0YXJ0dXAnXG5cbkdhbWUgPSByZXF1aXJlICcuL0dhbWUnXG5cbiMgdGFrZW4gZnJvbSBodHRwOiNzdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNTYyMzgzOC9yZ2ItdG8taGV4LWFuZC1oZXgtdG8tcmdiXG5jb21wb25lbnRUb0hleCA9IChjKSAtPlxuICBoZXggPSBNYXRoLmZsb29yKGMgKiAyNTUpLnRvU3RyaW5nKDE2KVxuICByZXR1cm4gaWYgaGV4Lmxlbmd0aCA9PSAxIHRoZW4gXCIwXCIgKyBoZXggZWxzZSBoZXhcbnJnYlRvSGV4ID0gKHIsIGcsIGIpIC0+XG4gIHJldHVybiBcIiNcIiArIGNvbXBvbmVudFRvSGV4KHIpICsgY29tcG9uZW50VG9IZXgoZykgKyBjb21wb25lbnRUb0hleChiKVxuXG5TQVZFX1RJTUVSX01TID0gMzAwMFxuXG5jbGFzcyBOYXRpdmVBcHBcbiAgY29uc3RydWN0b3I6IChAc2NyZWVuLCBAd2lkdGgsIEBoZWlnaHQpIC0+XG4gICAgQHRpbnRlZFRleHR1cmVDYWNoZSA9IFtdXG4gICAgQGxhc3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcbiAgICBAbGFzdEludGVyYWN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG4gICAgQGhlYXJkT25lVG91Y2ggPSBmYWxzZVxuICAgIEB0b3VjaE1vdXNlID0gbnVsbFxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdtb3VzZWRvd24nLCAgQG9uTW91c2VEb3duLmJpbmQodGhpcyksIGZhbHNlXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNlbW92ZScsICBAb25Nb3VzZU1vdmUuYmluZCh0aGlzKSwgZmFsc2VcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2V1cCcsICAgIEBvbk1vdXNlVXAuYmluZCh0aGlzKSwgZmFsc2VcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAndG91Y2hzdGFydCcsIEBvblRvdWNoU3RhcnQuYmluZCh0aGlzKSwgZmFsc2VcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAndG91Y2htb3ZlJywgIEBvblRvdWNoTW92ZS5iaW5kKHRoaXMpLCBmYWxzZVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICd0b3VjaGVuZCcsICAgQG9uVG91Y2hFbmQuYmluZCh0aGlzKSwgZmFsc2VcbiAgICBAY29udGV4dCA9IEBzY3JlZW4uZ2V0Q29udGV4dChcIjJkXCIpXG4gICAgQHRleHR1cmVzID0gW1xuICAgICAgIyBhbGwgY2FyZCBhcnRcbiAgICAgIFwiLi4vaW1hZ2VzL2NhcmRzLnBuZ1wiXG4gICAgICAjIGZvbnRzXG4gICAgICBcIi4uL2ltYWdlcy9kYXJrZm9yZXN0LnBuZ1wiXG4gICAgICAjIGNoYXJhY3RlcnMgLyBvdGhlclxuICAgICAgXCIuLi9pbWFnZXMvY2hhcnMucG5nXCJcbiAgICAgICMgaGVscFxuICAgICAgXCIuLi9pbWFnZXMvaG93dG9wbGF5MS5wbmdcIlxuICAgIF1cblxuICAgIEBnYW1lID0gbmV3IEdhbWUodGhpcywgQHdpZHRoLCBAaGVpZ2h0KVxuXG4gICAgaWYgdHlwZW9mIFN0b3JhZ2UgIT0gXCJ1bmRlZmluZWRcIlxuICAgICAgc3RhdGUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSBcInN0YXRlXCJcbiAgICAgIGlmIHN0YXRlXG4gICAgICAgICMgY29uc29sZS5sb2cgXCJsb2FkaW5nIHN0YXRlOiAje3N0YXRlfVwiXG4gICAgICAgIEBnYW1lLmxvYWQgc3RhdGVcblxuICAgIEBwZW5kaW5nSW1hZ2VzID0gMFxuICAgIGxvYWRlZFRleHR1cmVzID0gW11cbiAgICBmb3IgaW1hZ2VVcmwgaW4gQHRleHR1cmVzXG4gICAgICBAcGVuZGluZ0ltYWdlcysrXG4gICAgICBjb25zb2xlLmxvZyBcImxvYWRpbmcgaW1hZ2UgI3tAcGVuZGluZ0ltYWdlc306ICN7aW1hZ2VVcmx9XCJcbiAgICAgIGltZyA9IG5ldyBJbWFnZSgpXG4gICAgICBpbWcub25sb2FkID0gQG9uSW1hZ2VMb2FkZWQuYmluZCh0aGlzKVxuICAgICAgaW1nLnNyYyA9IGltYWdlVXJsXG4gICAgICBsb2FkZWRUZXh0dXJlcy5wdXNoIGltZ1xuICAgIEB0ZXh0dXJlcyA9IGxvYWRlZFRleHR1cmVzXG5cbiAgICBAc2F2ZVRpbWVyID0gU0FWRV9USU1FUl9NU1xuXG4gIG9uSW1hZ2VMb2FkZWQ6IChpbmZvKSAtPlxuICAgIEBwZW5kaW5nSW1hZ2VzLS1cbiAgICBpZiBAcGVuZGluZ0ltYWdlcyA9PSAwXG4gICAgICBjb25zb2xlLmxvZyAnQWxsIGltYWdlcyBsb2FkZWQuIEJlZ2lubmluZyByZW5kZXIgbG9vcC4nXG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPT4gQHVwZGF0ZSgpXG5cbiAgbG9nOiAocykgLT5cbiAgICBjb25zb2xlLmxvZyBcIk5hdGl2ZUFwcC5sb2coKTogI3tzfVwiXG5cbiAgdXBkYXRlU2F2ZTogKGR0KSAtPlxuICAgIHJldHVybiBpZiB0eXBlb2YgU3RvcmFnZSA9PSBcInVuZGVmaW5lZFwiXG4gICAgQHNhdmVUaW1lciAtPSBkdFxuICAgIGlmIEBzYXZlVGltZXIgPD0gMFxuICAgICAgQHNhdmVUaW1lciA9IFNBVkVfVElNRVJfTVNcbiAgICAgIHN0YXRlID0gQGdhbWUuc2F2ZSgpXG4gICAgICAjIGNvbnNvbGUubG9nIFwic2F2aW5nOiAje3N0YXRlfVwiXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSBcInN0YXRlXCIsIHN0YXRlXG5cbiAgZ2VuZXJhdGVUaW50SW1hZ2U6ICh0ZXh0dXJlSW5kZXgsIHJlZCwgZ3JlZW4sIGJsdWUpIC0+XG4gICAgaW1nID0gQHRleHR1cmVzW3RleHR1cmVJbmRleF1cbiAgICBidWZmID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCBcImNhbnZhc1wiXG4gICAgYnVmZi53aWR0aCAgPSBpbWcud2lkdGhcbiAgICBidWZmLmhlaWdodCA9IGltZy5oZWlnaHRcblxuICAgIGN0eCA9IGJ1ZmYuZ2V0Q29udGV4dCBcIjJkXCJcbiAgICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2NvcHknXG4gICAgY3R4LmRyYXdJbWFnZShpbWcsIDAsIDApXG4gICAgZmlsbENvbG9yID0gXCJyZ2IoI3tNYXRoLmZsb29yKHJlZCoyNTUpfSwgI3tNYXRoLmZsb29yKGdyZWVuKjI1NSl9LCAje01hdGguZmxvb3IoYmx1ZSoyNTUpfSlcIlxuICAgIGN0eC5maWxsU3R5bGUgPSBmaWxsQ29sb3JcbiAgICAjIGNvbnNvbGUubG9nIFwiZmlsbENvbG9yICN7ZmlsbENvbG9yfVwiXG4gICAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdtdWx0aXBseSdcbiAgICBjdHguZmlsbFJlY3QoMCwgMCwgYnVmZi53aWR0aCwgYnVmZi5oZWlnaHQpXG4gICAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdjb3B5J1xuICAgIGN0eC5nbG9iYWxBbHBoYSA9IDEuMFxuICAgIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnZGVzdGluYXRpb24taW4nXG4gICAgY3R4LmRyYXdJbWFnZShpbWcsIDAsIDApXG5cbiAgICBpbWdDb21wID0gbmV3IEltYWdlKClcbiAgICBpbWdDb21wLnNyYyA9IGJ1ZmYudG9EYXRhVVJMKClcbiAgICByZXR1cm4gaW1nQ29tcFxuXG4gIGRyYXdJbWFnZTogKHRleHR1cmVJbmRleCwgc3JjWCwgc3JjWSwgc3JjVywgc3JjSCwgZHN0WCwgZHN0WSwgZHN0VywgZHN0SCwgcm90LCBhbmNob3JYLCBhbmNob3JZLCByLCBnLCBiLCBhKSAtPlxuICAgIHRleHR1cmUgPSBAdGV4dHVyZXNbdGV4dHVyZUluZGV4XVxuICAgIGlmIChyICE9IDEpIG9yIChnICE9IDEpIG9yIChiICE9IDEpXG4gICAgICB0aW50ZWRUZXh0dXJlS2V5ID0gXCIje3RleHR1cmVJbmRleH0tI3tyfS0je2d9LSN7Yn1cIlxuICAgICAgdGludGVkVGV4dHVyZSA9IEB0aW50ZWRUZXh0dXJlQ2FjaGVbdGludGVkVGV4dHVyZUtleV1cbiAgICAgIGlmIG5vdCB0aW50ZWRUZXh0dXJlXG4gICAgICAgIHRpbnRlZFRleHR1cmUgPSBAZ2VuZXJhdGVUaW50SW1hZ2UgdGV4dHVyZUluZGV4LCByLCBnLCBiXG4gICAgICAgIEB0aW50ZWRUZXh0dXJlQ2FjaGVbdGludGVkVGV4dHVyZUtleV0gPSB0aW50ZWRUZXh0dXJlXG4gICAgICAgICMgY29uc29sZS5sb2cgXCJnZW5lcmF0ZWQgY2FjaGVkIHRleHR1cmUgI3t0aW50ZWRUZXh0dXJlS2V5fVwiXG4gICAgICB0ZXh0dXJlID0gdGludGVkVGV4dHVyZVxuXG4gICAgQGNvbnRleHQuc2F2ZSgpXG4gICAgQGNvbnRleHQudHJhbnNsYXRlIGRzdFgsIGRzdFlcbiAgICBAY29udGV4dC5yb3RhdGUgcm90ICMgKiAzLjE0MTU5MiAvIDE4MC4wXG4gICAgYW5jaG9yT2Zmc2V0WCA9IC0xICogYW5jaG9yWCAqIGRzdFdcbiAgICBhbmNob3JPZmZzZXRZID0gLTEgKiBhbmNob3JZICogZHN0SFxuICAgIEBjb250ZXh0LnRyYW5zbGF0ZSBhbmNob3JPZmZzZXRYLCBhbmNob3JPZmZzZXRZXG4gICAgQGNvbnRleHQuZ2xvYmFsQWxwaGEgPSBhXG4gICAgQGNvbnRleHQuZHJhd0ltYWdlKHRleHR1cmUsIHNyY1gsIHNyY1ksIHNyY1csIHNyY0gsIDAsIDAsIGRzdFcsIGRzdEgpXG4gICAgQGNvbnRleHQucmVzdG9yZSgpXG5cbiAgdXBkYXRlOiAtPlxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9PiBAdXBkYXRlKClcblxuICAgIG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG4gICAgZHQgPSBub3cgLSBAbGFzdFRpbWVcblxuICAgIHRpbWVTaW5jZUludGVyYWN0ID0gbm93IC0gQGxhc3RJbnRlcmFjdFRpbWVcbiAgICBpZiB0aW1lU2luY2VJbnRlcmFjdCA+IDUwMDBcbiAgICAgIGdvYWxGUFMgPSA1ICMgY2FsbSBkb3duLCBub2JvZHkgaXMgZG9pbmcgYW55dGhpbmcgZm9yIDUgc2Vjb25kc1xuICAgIGVsc2VcbiAgICAgIGdvYWxGUFMgPSAyMDAgIyBhcyBmYXN0IGFzIHBvc3NpYmxlXG4gICAgaWYgQGxhc3RHb2FsRlBTICE9IGdvYWxGUFNcbiAgICAgIGNvbnNvbGUubG9nIFwic3dpdGNoaW5nIHRvICN7Z29hbEZQU30gRlBTXCJcbiAgICAgIEBsYXN0R29hbEZQUyA9IGdvYWxGUFNcblxuICAgIGZwc0ludGVydmFsID0gMTAwMCAvIGdvYWxGUFNcbiAgICBpZiBkdCA8IGZwc0ludGVydmFsXG4gICAgICByZXR1cm5cbiAgICBAbGFzdFRpbWUgPSBub3dcblxuICAgIEBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBAd2lkdGgsIEBoZWlnaHQpXG4gICAgQGdhbWUudXBkYXRlKGR0KVxuICAgIHJlbmRlckNvbW1hbmRzID0gQGdhbWUucmVuZGVyKClcblxuICAgIGkgPSAwXG4gICAgbiA9IHJlbmRlckNvbW1hbmRzLmxlbmd0aFxuICAgIHdoaWxlIChpIDwgbilcbiAgICAgIGRyYXdDYWxsID0gcmVuZGVyQ29tbWFuZHMuc2xpY2UoaSwgaSArPSAxNilcbiAgICAgIEBkcmF3SW1hZ2UuYXBwbHkodGhpcywgZHJhd0NhbGwpXG5cbiAgICBAdXBkYXRlU2F2ZShkdClcblxuICBvblRvdWNoU3RhcnQ6IChldnQpIC0+XG4gICAgQGxhc3RJbnRlcmFjdFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuICAgIEBoZWFyZE9uZVRvdWNoID0gdHJ1ZVxuICAgIHRvdWNoZXMgPSBldnQuY2hhbmdlZFRvdWNoZXNcbiAgICBmb3IgdG91Y2ggaW4gdG91Y2hlc1xuICAgICAgaWYgQHRvdWNoTW91c2UgPT0gbnVsbFxuICAgICAgICBAdG91Y2hNb3VzZSA9IHRvdWNoLmlkZW50aWZpZXJcbiAgICAgIGlmIEB0b3VjaE1vdXNlID09IHRvdWNoLmlkZW50aWZpZXJcbiAgICAgICAgQGdhbWUudG91Y2hEb3duKHRvdWNoLmNsaWVudFgsIHRvdWNoLmNsaWVudFkpXG5cbiAgb25Ub3VjaE1vdmU6IChldnQpIC0+XG4gICAgQGxhc3RJbnRlcmFjdFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuICAgIHRvdWNoZXMgPSBldnQuY2hhbmdlZFRvdWNoZXNcbiAgICBmb3IgdG91Y2ggaW4gdG91Y2hlc1xuICAgICAgaWYgQHRvdWNoTW91c2UgPT0gdG91Y2guaWRlbnRpZmllclxuICAgICAgICBAZ2FtZS50b3VjaE1vdmUodG91Y2guY2xpZW50WCwgdG91Y2guY2xpZW50WSlcblxuICBvblRvdWNoRW5kOiAoZXZ0KSAtPlxuICAgIEBsYXN0SW50ZXJhY3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcbiAgICB0b3VjaGVzID0gZXZ0LmNoYW5nZWRUb3VjaGVzXG4gICAgZm9yIHRvdWNoIGluIHRvdWNoZXNcbiAgICAgIGlmIEB0b3VjaE1vdXNlID09IHRvdWNoLmlkZW50aWZpZXJcbiAgICAgICAgQGdhbWUudG91Y2hVcCh0b3VjaC5jbGllbnRYLCB0b3VjaC5jbGllbnRZKVxuICAgICAgICBAdG91Y2hNb3VzZSA9IG51bGxcbiAgICBpZiBldnQudG91Y2hlcy5sZW5ndGggPT0gMFxuICAgICAgQHRvdWNoTW91c2UgPSBudWxsXG5cbiAgb25Nb3VzZURvd246IChldnQpIC0+XG4gICAgaWYgQGhlYXJkT25lVG91Y2hcbiAgICAgIHJldHVyblxuICAgIEBsYXN0SW50ZXJhY3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcbiAgICBAZ2FtZS50b3VjaERvd24oZXZ0LmNsaWVudFgsIGV2dC5jbGllbnRZKVxuXG4gIG9uTW91c2VNb3ZlOiAoZXZ0KSAtPlxuICAgIGlmIEBoZWFyZE9uZVRvdWNoXG4gICAgICByZXR1cm5cbiAgICBAbGFzdEludGVyYWN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG4gICAgQGdhbWUudG91Y2hNb3ZlKGV2dC5jbGllbnRYLCBldnQuY2xpZW50WSlcblxuICBvbk1vdXNlVXA6IChldnQpIC0+XG4gICAgaWYgQGhlYXJkT25lVG91Y2hcbiAgICAgIHJldHVyblxuICAgIEBsYXN0SW50ZXJhY3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcbiAgICBAZ2FtZS50b3VjaFVwKGV2dC5jbGllbnRYLCBldnQuY2xpZW50WSlcblxuc2NyZWVuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ3NjcmVlbidcbnJlc2l6ZVNjcmVlbiA9IC0+XG4gIGRlc2lyZWRBc3BlY3RSYXRpbyA9IDE2IC8gOVxuICBjdXJyZW50QXNwZWN0UmF0aW8gPSB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodFxuICBpZiBjdXJyZW50QXNwZWN0UmF0aW8gPCBkZXNpcmVkQXNwZWN0UmF0aW9cbiAgICBzY3JlZW4ud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aFxuICAgIHNjcmVlbi5oZWlnaHQgPSBNYXRoLmZsb29yKHdpbmRvdy5pbm5lcldpZHRoICogKDEgLyBkZXNpcmVkQXNwZWN0UmF0aW8pKVxuICBlbHNlXG4gICAgc2NyZWVuLndpZHRoID0gTWF0aC5mbG9vcih3aW5kb3cuaW5uZXJIZWlnaHQgKiBkZXNpcmVkQXNwZWN0UmF0aW8pXG4gICAgc2NyZWVuLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxucmVzaXplU2NyZWVuKClcbiMgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ3Jlc2l6ZScsIHJlc2l6ZVNjcmVlbiwgZmFsc2VcblxuYXBwID0gbmV3IE5hdGl2ZUFwcChzY3JlZW4sIHNjcmVlbi53aWR0aCwgc2NyZWVuLmhlaWdodClcbiJdfQ==
