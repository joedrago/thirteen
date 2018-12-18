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
      this.fontRenderer.render(this.font, restartQuitSize, "Play Again", shadowDistance + this.center.x, shadowDistance + (this.height - (handAreaHeight * 0.5)), 0.5, 1, this.colors.black);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQW5pbWF0aW9uLmNvZmZlZSIsInNyYy9CdXR0b24uY29mZmVlIiwic3JjL0ZvbnRSZW5kZXJlci5jb2ZmZWUiLCJzcmMvR2FtZS5jb2ZmZWUiLCJzcmMvSGFuZC5jb2ZmZWUiLCJzcmMvTWVudS5jb2ZmZWUiLCJzcmMvUGlsZS5jb2ZmZWUiLCJzcmMvU3ByaXRlUmVuZGVyZXIuY29mZmVlIiwic3JjL1RoaXJ0ZWVuLmNvZmZlZSIsInNyYy9mb250bWV0cmljcy5jb2ZmZWUiLCJzcmMvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBOztBQUFBLFFBQUEsR0FBVyxTQUFDLENBQUQ7RUFDVCxJQUFHLENBQUEsS0FBSyxDQUFSO0FBQ0UsV0FBTyxFQURUO0dBQUEsTUFFSyxJQUFHLENBQUEsR0FBSSxDQUFQO0FBQ0gsV0FBTyxDQUFDLEVBREw7O0FBRUwsU0FBTztBQUxFOztBQU9MO0VBQ1MsbUJBQUMsSUFBRDtBQUNYLFFBQUE7SUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksQ0FBQztJQUNkLElBQUMsQ0FBQSxHQUFELEdBQU87SUFDUCxJQUFDLENBQUEsR0FBRCxHQUFPO0FBQ1AsU0FBQSxTQUFBOztNQUNFLElBQUcsQ0FBQSxLQUFLLE9BQVI7UUFDRSxJQUFDLENBQUEsR0FBSSxDQUFBLENBQUEsQ0FBTCxHQUFVO1FBQ1YsSUFBQyxDQUFBLEdBQUksQ0FBQSxDQUFBLENBQUwsR0FBVSxFQUZaOztBQURGO0VBSlc7O3NCQVViLElBQUEsR0FBTSxTQUFBO0lBQ0osSUFBRyxrQkFBSDtNQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBTCxHQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFEaEI7O0lBRUEsSUFBRyxrQkFBSDtNQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBTCxHQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFEaEI7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VSxDQUFDLE9BQVgsQ0FBQTtXQUNwQixJQUFDLENBQUEsSUFBSSxDQUFDLE9BQU4sQ0FBYyxHQUFHLENBQUMsT0FBbEIsRUFBMkIsR0FBRyxDQUFDLE9BQS9CO0VBSlM7Ozs7OztBQU1iLE1BQUEsR0FBUyxRQUFRLENBQUMsY0FBVCxDQUF3QixRQUF4Qjs7QUFDVCxZQUFBLEdBQWUsU0FBQTtBQUNiLE1BQUE7RUFBQSxrQkFBQSxHQUFxQixFQUFBLEdBQUs7RUFDMUIsa0JBQUEsR0FBcUIsTUFBTSxDQUFDLFVBQVAsR0FBb0IsTUFBTSxDQUFDO0VBQ2hELElBQUcsa0JBQUEsR0FBcUIsa0JBQXhCO0lBQ0UsTUFBTSxDQUFDLEtBQVAsR0FBZSxNQUFNLENBQUM7V0FDdEIsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsSUFBSSxDQUFDLEtBQUwsQ0FBVyxNQUFNLENBQUMsVUFBUCxHQUFvQixDQUFDLENBQUEsR0FBSSxrQkFBTCxDQUEvQixFQUZsQjtHQUFBLE1BQUE7SUFJRSxNQUFNLENBQUMsS0FBUCxHQUFlLElBQUksQ0FBQyxLQUFMLENBQVcsTUFBTSxDQUFDLFdBQVAsR0FBcUIsa0JBQWhDO1dBQ2YsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsTUFBTSxDQUFDLFlBTHpCOztBQUhhOztBQVNmLFlBQUEsQ0FBQTs7QUFHQSxHQUFBLEdBQU0sSUFBSSxTQUFKLENBQWMsTUFBZCxFQUFzQixNQUFNLENBQUMsS0FBN0IsRUFBb0MsTUFBTSxDQUFDLE1BQTNDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY2FsY1NpZ24gPSAodikgLT5cbiAgaWYgdiA9PSAwXG4gICAgcmV0dXJuIDBcbiAgZWxzZSBpZiB2IDwgMFxuICAgIHJldHVybiAtMVxuICByZXR1cm4gMVxuXG5jbGFzcyBBbmltYXRpb25cbiAgY29uc3RydWN0b3I6IChkYXRhKSAtPlxuICAgIEBzcGVlZCA9IGRhdGEuc3BlZWRcbiAgICBAcmVxID0ge31cbiAgICBAY3VyID0ge31cbiAgICBmb3Igayx2IG9mIGRhdGFcbiAgICAgIGlmIGsgIT0gJ3NwZWVkJ1xuICAgICAgICBAcmVxW2tdID0gdlxuICAgICAgICBAY3VyW2tdID0gdlxuXG4gICMgJ2ZpbmlzaGVzJyBhbGwgYW5pbWF0aW9uc1xuICB3YXJwOiAtPlxuICAgIGlmIEBjdXIucj9cbiAgICAgIEBjdXIuciA9IEByZXEuclxuICAgIGlmIEBjdXIucz9cbiAgICAgIEBjdXIucyA9IEByZXEuc1xuICAgIGlmIEBjdXIueD8gYW5kIEBjdXIueT9cbiAgICAgIEBjdXIueCA9IEByZXEueFxuICAgICAgQGN1ci55ID0gQHJlcS55XG5cbiAgYW5pbWF0aW5nOiAtPlxuICAgIGlmIEBjdXIucj9cbiAgICAgIGlmIEByZXEuciAhPSBAY3VyLnJcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICBpZiBAY3VyLnM/XG4gICAgICBpZiBAcmVxLnMgIT0gQGN1ci5zXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgaWYgQGN1ci54PyBhbmQgQGN1ci55P1xuICAgICAgaWYgKEByZXEueCAhPSBAY3VyLngpIG9yIChAcmVxLnkgIT0gQGN1ci55KVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIHJldHVybiBmYWxzZVxuXG4gIHVwZGF0ZTogKGR0KSAtPlxuICAgIHVwZGF0ZWQgPSBmYWxzZVxuICAgICMgcm90YXRpb25cbiAgICBpZiBAY3VyLnI/XG4gICAgICBpZiBAcmVxLnIgIT0gQGN1ci5yXG4gICAgICAgIHVwZGF0ZWQgPSB0cnVlXG4gICAgICAgICMgc2FuaXRpemUgcmVxdWVzdGVkIHJvdGF0aW9uXG4gICAgICAgIHR3b1BpID0gTWF0aC5QSSAqIDJcbiAgICAgICAgbmVnVHdvUGkgPSAtMSAqIHR3b1BpXG4gICAgICAgIEByZXEuciAtPSB0d29QaSB3aGlsZSBAcmVxLnIgPj0gdHdvUGlcbiAgICAgICAgQHJlcS5yICs9IHR3b1BpIHdoaWxlIEByZXEuciA8PSBuZWdUd29QaVxuICAgICAgICAjIHBpY2sgYSBkaXJlY3Rpb24gYW5kIHR1cm5cbiAgICAgICAgZHIgPSBAcmVxLnIgLSBAY3VyLnJcbiAgICAgICAgZGlzdCA9IE1hdGguYWJzKGRyKVxuICAgICAgICBzaWduID0gY2FsY1NpZ24oZHIpXG4gICAgICAgIGlmIGRpc3QgPiBNYXRoLlBJXG4gICAgICAgICAgIyBzcGluIHRoZSBvdGhlciBkaXJlY3Rpb24sIGl0IGlzIGNsb3NlclxuICAgICAgICAgIGRpc3QgPSB0d29QaSAtIGRpc3RcbiAgICAgICAgICBzaWduICo9IC0xXG4gICAgICAgIG1heERpc3QgPSBkdCAqIEBzcGVlZC5yIC8gMTAwMFxuICAgICAgICBpZiBkaXN0IDwgbWF4RGlzdFxuICAgICAgICAgICMgd2UgY2FuIGZpbmlzaCB0aGlzIGZyYW1lXG4gICAgICAgICAgQGN1ci5yID0gQHJlcS5yXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAY3VyLnIgKz0gbWF4RGlzdCAqIHNpZ25cblxuICAgICMgc2NhbGVcbiAgICBpZiBAY3VyLnM/XG4gICAgICBpZiBAcmVxLnMgIT0gQGN1ci5zXG4gICAgICAgIHVwZGF0ZWQgPSB0cnVlXG4gICAgICAgICMgcGljayBhIGRpcmVjdGlvbiBhbmQgdHVyblxuICAgICAgICBkcyA9IEByZXEucyAtIEBjdXIuc1xuICAgICAgICBkaXN0ID0gTWF0aC5hYnMoZHMpXG4gICAgICAgIHNpZ24gPSBjYWxjU2lnbihkcylcbiAgICAgICAgbWF4RGlzdCA9IGR0ICogQHNwZWVkLnMgLyAxMDAwXG4gICAgICAgIGlmIGRpc3QgPCBtYXhEaXN0XG4gICAgICAgICAgIyB3ZSBjYW4gZmluaXNoIHRoaXMgZnJhbWVcbiAgICAgICAgICBAY3VyLnMgPSBAcmVxLnNcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBjdXIucyArPSBtYXhEaXN0ICogc2lnblxuXG4gICAgIyB0cmFuc2xhdGlvblxuICAgIGlmIEBjdXIueD8gYW5kIEBjdXIueT9cbiAgICAgIGlmIChAcmVxLnggIT0gQGN1ci54KSBvciAoQHJlcS55ICE9IEBjdXIueSlcbiAgICAgICAgdXBkYXRlZCA9IHRydWVcbiAgICAgICAgdmVjWCA9IEByZXEueCAtIEBjdXIueFxuICAgICAgICB2ZWNZID0gQHJlcS55IC0gQGN1ci55XG4gICAgICAgIGRpc3QgPSBNYXRoLnNxcnQoKHZlY1ggKiB2ZWNYKSArICh2ZWNZICogdmVjWSkpXG4gICAgICAgIG1heERpc3QgPSBkdCAqIEBzcGVlZC50IC8gMTAwMFxuICAgICAgICBpZiBkaXN0IDwgbWF4RGlzdFxuICAgICAgICAgICMgd2UgY2FuIGZpbmlzaCB0aGlzIGZyYW1lXG4gICAgICAgICAgQGN1ci54ID0gQHJlcS54XG4gICAgICAgICAgQGN1ci55ID0gQHJlcS55XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAjIG1vdmUgYXMgbXVjaCBhcyBwb3NzaWJsZVxuICAgICAgICAgIEBjdXIueCArPSAodmVjWCAvIGRpc3QpICogbWF4RGlzdFxuICAgICAgICAgIEBjdXIueSArPSAodmVjWSAvIGRpc3QpICogbWF4RGlzdFxuXG4gICAgcmV0dXJuIHVwZGF0ZWRcblxubW9kdWxlLmV4cG9ydHMgPSBBbmltYXRpb25cbiIsIkFuaW1hdGlvbiA9IHJlcXVpcmUgJy4vQW5pbWF0aW9uJ1xuXG5jbGFzcyBCdXR0b25cbiAgY29uc3RydWN0b3I6IChAZ2FtZSwgQHNwcml0ZU5hbWVzLCBAZm9udCwgQHRleHRIZWlnaHQsIEB4LCBAeSwgQGNiKSAtPlxuICAgIEBhbmltID0gbmV3IEFuaW1hdGlvbiB7XG4gICAgICBzcGVlZDogeyBzOiAzIH1cbiAgICAgIHM6IDBcbiAgICB9XG4gICAgQGNvbG9yID0geyByOiAxLCBnOiAxLCBiOiAxLCBhOiAwIH1cblxuICB1cGRhdGU6IChkdCkgLT5cbiAgICByZXR1cm4gQGFuaW0udXBkYXRlKGR0KVxuXG4gIHJlbmRlcjogLT5cbiAgICBAY29sb3IuYSA9IEBhbmltLmN1ci5zXG4gICAgQGdhbWUuc3ByaXRlUmVuZGVyZXIucmVuZGVyIEBzcHJpdGVOYW1lc1swXSwgQHgsIEB5LCAwLCBAdGV4dEhlaWdodCAqIDEuNSwgMCwgMC41LCAwLjUsIEBnYW1lLmNvbG9ycy53aGl0ZSwgPT5cbiAgICAgICMgcHVsc2UgYnV0dG9uIGFuaW0sXG4gICAgICBAYW5pbS5jdXIucyA9IDFcbiAgICAgIEBhbmltLnJlcS5zID0gMFxuICAgICAgIyB0aGVuIGNhbGwgY2FsbGJhY2tcbiAgICAgIEBjYih0cnVlKVxuICAgIEBnYW1lLnNwcml0ZVJlbmRlcmVyLnJlbmRlciBAc3ByaXRlTmFtZXNbMV0sIEB4LCBAeSwgMCwgQHRleHRIZWlnaHQgKiAxLjUsIDAsIDAuNSwgMC41LCBAY29sb3JcbiAgICB0ZXh0ID0gQGNiKGZhbHNlKVxuICAgIEBnYW1lLmZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIEB0ZXh0SGVpZ2h0LCB0ZXh0LCBAeCwgQHksIDAuNSwgMC41LCBAZ2FtZS5jb2xvcnMuYnV0dG9udGV4dFxuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1dHRvblxuIiwiZm9udG1ldHJpY3MgPSByZXF1aXJlICcuL2ZvbnRtZXRyaWNzJ1xuXG4jIHRha2VuIGZyb20gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy81NjIzODM4L3JnYi10by1oZXgtYW5kLWhleC10by1yZ2JcbmhleFRvUmdiID0gKGhleCwgYSkgLT5cbiAgICByZXN1bHQgPSAvXiM/KFthLWZcXGRdezJ9KShbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pJC9pLmV4ZWMoaGV4KVxuICAgIHJldHVybiBudWxsIGlmIG5vdCByZXN1bHRcbiAgICByZXR1cm4ge1xuICAgICAgICByOiBwYXJzZUludChyZXN1bHRbMV0sIDE2KSAvIDI1NSxcbiAgICAgICAgZzogcGFyc2VJbnQocmVzdWx0WzJdLCAxNikgLyAyNTUsXG4gICAgICAgIGI6IHBhcnNlSW50KHJlc3VsdFszXSwgMTYpIC8gMjU1XG4gICAgICAgIGE6IGFcbiAgICB9XG5cbmNsYXNzIEZvbnRSZW5kZXJlclxuICBjb25zdHJ1Y3RvcjogIChAZ2FtZSkgLT5cbiAgICBAd2hpdGUgPSB7IHI6IDEsIGc6IDEsIGI6IDEsIGE6IDEgfVxuXG4gIHNpemU6IChmb250LCBoZWlnaHQsIHN0cikgLT5cbiAgICBtZXRyaWNzID0gZm9udG1ldHJpY3NbZm9udF1cbiAgICByZXR1cm4gaWYgbm90IG1ldHJpY3NcbiAgICBzY2FsZSA9IGhlaWdodCAvIG1ldHJpY3MuaGVpZ2h0XG5cbiAgICB0b3RhbFdpZHRoID0gMFxuICAgIHRvdGFsSGVpZ2h0ID0gbWV0cmljcy5oZWlnaHQgKiBzY2FsZVxuXG4gICAgaW5Db2xvciA9IGZhbHNlXG4gICAgZm9yIGNoLCBpIGluIHN0clxuICAgICAgaWYgY2ggPT0gJ2AnXG4gICAgICAgIGluQ29sb3IgPSAhaW5Db2xvclxuXG4gICAgICBpZiBub3QgaW5Db2xvclxuICAgICAgICBjb2RlID0gY2guY2hhckNvZGVBdCgwKVxuICAgICAgICBnbHlwaCA9IG1ldHJpY3MuZ2x5cGhzW2NvZGVdXG4gICAgICAgIGNvbnRpbnVlIGlmIG5vdCBnbHlwaFxuICAgICAgICB0b3RhbFdpZHRoICs9IGdseXBoLnhhZHZhbmNlICogc2NhbGVcblxuICAgIHJldHVybiB7XG4gICAgICB3OiB0b3RhbFdpZHRoXG4gICAgICBoOiB0b3RhbEhlaWdodFxuICAgIH1cblxuICByZW5kZXI6IChmb250LCBoZWlnaHQsIHN0ciwgeCwgeSwgYW5jaG9yeCwgYW5jaG9yeSwgY29sb3IsIGNiKSAtPlxuICAgIG1ldHJpY3MgPSBmb250bWV0cmljc1tmb250XVxuICAgIHJldHVybiBpZiBub3QgbWV0cmljc1xuICAgIHNjYWxlID0gaGVpZ2h0IC8gbWV0cmljcy5oZWlnaHRcblxuICAgIHRvdGFsV2lkdGggPSAwXG4gICAgdG90YWxIZWlnaHQgPSBtZXRyaWNzLmhlaWdodCAqIHNjYWxlXG4gICAgc2tpcENvbG9yID0gZmFsc2VcbiAgICBmb3IgY2gsIGkgaW4gc3RyXG4gICAgICBpZiBjaCA9PSAnYCdcbiAgICAgICAgc2tpcENvbG9yID0gIXNraXBDb2xvclxuICAgICAgY29udGludWUgaWYgc2tpcENvbG9yXG4gICAgICBjb2RlID0gY2guY2hhckNvZGVBdCgwKVxuICAgICAgZ2x5cGggPSBtZXRyaWNzLmdseXBoc1tjb2RlXVxuICAgICAgY29udGludWUgaWYgbm90IGdseXBoXG4gICAgICB0b3RhbFdpZHRoICs9IGdseXBoLnhhZHZhbmNlICogc2NhbGVcblxuICAgIGFuY2hvck9mZnNldFggPSAtMSAqIGFuY2hvcnggKiB0b3RhbFdpZHRoXG4gICAgYW5jaG9yT2Zmc2V0WSA9IC0xICogYW5jaG9yeSAqIHRvdGFsSGVpZ2h0XG4gICAgY3VyclggPSB4XG5cbiAgICBpZiBjb2xvclxuICAgICAgc3RhcnRpbmdDb2xvciA9IGNvbG9yXG4gICAgZWxzZVxuICAgICAgc3RhcnRpbmdDb2xvciA9IEB3aGl0ZVxuICAgIGN1cnJlbnRDb2xvciA9IHN0YXJ0aW5nQ29sb3JcblxuICAgIGNvbG9yU3RhcnQgPSAtMVxuICAgIGZvciBjaCwgaSBpbiBzdHJcbiAgICAgIGlmIGNoID09ICdgJ1xuICAgICAgICBpZiBjb2xvclN0YXJ0ID09IC0xXG4gICAgICAgICAgY29sb3JTdGFydCA9IGkgKyAxXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBsZW4gPSBpIC0gY29sb3JTdGFydFxuICAgICAgICAgIGlmIGxlblxuICAgICAgICAgICAgY3VycmVudENvbG9yID0gaGV4VG9SZ2Ioc3RyLnN1YnN0cihjb2xvclN0YXJ0LCBpIC0gY29sb3JTdGFydCksIHN0YXJ0aW5nQ29sb3IuYSlcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBzdGFydGluZ0NvbG9yXG4gICAgICAgICAgY29sb3JTdGFydCA9IC0xXG5cbiAgICAgIGNvbnRpbnVlIGlmIGNvbG9yU3RhcnQgIT0gLTFcbiAgICAgIGNvZGUgPSBjaC5jaGFyQ29kZUF0KDApXG4gICAgICBnbHlwaCA9IG1ldHJpY3MuZ2x5cGhzW2NvZGVdXG4gICAgICBjb250aW51ZSBpZiBub3QgZ2x5cGhcbiAgICAgIEBnYW1lLmRyYXdJbWFnZSBmb250LFxuICAgICAgZ2x5cGgueCwgZ2x5cGgueSwgZ2x5cGgud2lkdGgsIGdseXBoLmhlaWdodCxcbiAgICAgIGN1cnJYICsgKGdseXBoLnhvZmZzZXQgKiBzY2FsZSkgKyBhbmNob3JPZmZzZXRYLCB5ICsgKGdseXBoLnlvZmZzZXQgKiBzY2FsZSkgKyBhbmNob3JPZmZzZXRZLCBnbHlwaC53aWR0aCAqIHNjYWxlLCBnbHlwaC5oZWlnaHQgKiBzY2FsZSxcbiAgICAgIDAsIDAsIDAsXG4gICAgICBjdXJyZW50Q29sb3IuciwgY3VycmVudENvbG9yLmcsIGN1cnJlbnRDb2xvci5iLCBjdXJyZW50Q29sb3IuYSwgY2JcbiAgICAgIGN1cnJYICs9IGdseXBoLnhhZHZhbmNlICogc2NhbGVcblxubW9kdWxlLmV4cG9ydHMgPSBGb250UmVuZGVyZXJcbiIsIkFuaW1hdGlvbiA9IHJlcXVpcmUgJy4vQW5pbWF0aW9uJ1xuQnV0dG9uID0gcmVxdWlyZSAnLi9CdXR0b24nXG5Gb250UmVuZGVyZXIgPSByZXF1aXJlICcuL0ZvbnRSZW5kZXJlcidcblNwcml0ZVJlbmRlcmVyID0gcmVxdWlyZSAnLi9TcHJpdGVSZW5kZXJlcidcbk1lbnUgPSByZXF1aXJlICcuL01lbnUnXG5IYW5kID0gcmVxdWlyZSAnLi9IYW5kJ1xuUGlsZSA9IHJlcXVpcmUgJy4vUGlsZSdcbntUaGlydGVlbiwgT0ssIGFpQ2hhcmFjdGVyc30gPSByZXF1aXJlICcuL1RoaXJ0ZWVuJ1xuXG4jIHRlbXBcbkJVSUxEX1RJTUVTVEFNUCA9IFwiMC4wLjFcIlxuXG5jbGFzcyBHYW1lXG4gIGNvbnN0cnVjdG9yOiAoQG5hdGl2ZSwgQHdpZHRoLCBAaGVpZ2h0KSAtPlxuICAgIEB2ZXJzaW9uID0gQlVJTERfVElNRVNUQU1QXG4gICAgQGxvZyhcIkdhbWUgY29uc3RydWN0ZWQ6ICN7QHdpZHRofXgje0BoZWlnaHR9XCIpXG4gICAgQGZvbnRSZW5kZXJlciA9IG5ldyBGb250UmVuZGVyZXIgdGhpc1xuICAgIEBzcHJpdGVSZW5kZXJlciA9IG5ldyBTcHJpdGVSZW5kZXJlciB0aGlzXG4gICAgQGZvbnQgPSBcImRhcmtmb3Jlc3RcIlxuICAgIEB6b25lcyA9IFtdXG4gICAgQG5leHRBSVRpY2sgPSAxMDAwICMgd2lsbCBiZSBzZXQgYnkgb3B0aW9uc1xuICAgIEBjZW50ZXIgPVxuICAgICAgeDogQHdpZHRoIC8gMlxuICAgICAgeTogQGhlaWdodCAvIDJcbiAgICBAYWFIZWlnaHQgPSBAd2lkdGggKiA5IC8gMTZcbiAgICBAbG9nIFwiaGVpZ2h0OiAje0BoZWlnaHR9LiBoZWlnaHQgaWYgc2NyZWVuIHdhcyAxNjo5IChhc3BlY3QgYWRqdXN0ZWQpOiAje0BhYUhlaWdodH1cIlxuICAgIEBwYXVzZUJ1dHRvblNpemUgPSBAYWFIZWlnaHQgLyAxNVxuICAgIEBjb2xvcnMgPVxuICAgICAgd2hpdGU6ICAgICAgeyByOiAgIDEsIGc6ICAgMSwgYjogICAxLCBhOiAgIDEgfVxuICAgICAgYmxhY2s6ICAgICAgeyByOiAgIDAsIGc6ICAgMCwgYjogICAwLCBhOiAgIDEgfVxuICAgICAgcmVkOiAgICAgICAgeyByOiAgIDEsIGc6ICAgMCwgYjogICAwLCBhOiAgIDEgfVxuICAgICAgb3JhbmdlOiAgICAgeyByOiAgIDEsIGc6IDAuNSwgYjogICAwLCBhOiAgIDEgfVxuICAgICAgZ29sZDogICAgICAgeyByOiAgIDEsIGc6ICAgMSwgYjogICAwLCBhOiAgIDEgfVxuICAgICAgYnV0dG9udGV4dDogeyByOiAgIDEsIGc6ICAgMSwgYjogICAxLCBhOiAgIDEgfVxuICAgICAgbG9nY29sb3I6ICAgeyByOiAwLjUsIGc6IDAuNSwgYjogMC41LCBhOiAgIDEgfVxuICAgICAgbGlnaHRncmF5OiAgeyByOiAwLjUsIGc6IDAuNSwgYjogMC41LCBhOiAgIDEgfVxuICAgICAgYmFja2dyb3VuZDogeyByOiAgIDAsIGc6IDAuMiwgYjogICAwLCBhOiAgIDEgfVxuICAgICAgcGlsZTogICAgICAgeyByOiAwLjQsIGc6IDAuMiwgYjogICAwLCBhOiAgIDEgfVxuICAgICAgbG9nYmc6ICAgICAgeyByOiAwLjEsIGc6ICAgMCwgYjogICAwLCBhOiAgIDEgfVxuICAgICAgYXJyb3c6ICAgICAgeyByOiAgIDEsIGc6ICAgMSwgYjogICAxLCBhOiAgIDEgfVxuICAgICAgYXJyb3djbG9zZTogeyByOiAgIDEsIGc6IDAuNSwgYjogICAwLCBhOiAwLjMgfVxuICAgICAgaGFuZF9waWNrOiAgeyByOiAgIDAsIGc6IDAuMSwgYjogICAwLCBhOiAxLjAgfVxuICAgICAgaGFuZF9yZW9yZzogeyByOiAwLjQsIGc6ICAgMCwgYjogICAwLCBhOiAxLjAgfVxuICAgICAgcGxheV9hZ2FpbjogeyByOiAgIDAsIGc6ICAgMCwgYjogICAwLCBhOiAwLjcgfVxuICAgICAgb3ZlcmxheTogICAgeyByOiAgIDAsIGc6ICAgMCwgYjogICAwLCBhOiAwLjYgfVxuICAgICAgbWFpbm1lbnU6ICAgeyByOiAwLjEsIGc6IDAuMSwgYjogMC4xLCBhOiAgIDEgfVxuICAgICAgcGF1c2VtZW51OiAgeyByOiAwLjEsIGc6IDAuMCwgYjogMC4xLCBhOiAgIDEgfVxuICAgICAgYmlkOiAgICAgICAgeyByOiAgIDAsIGc6IDAuNiwgYjogICAwLCBhOiAgIDEgfVxuXG4gICAgQHRleHR1cmVzID1cbiAgICAgIFwiY2FyZHNcIjogMFxuICAgICAgXCJkYXJrZm9yZXN0XCI6IDFcbiAgICAgIFwiY2hhcnNcIjogMlxuICAgICAgXCJob3d0bzFcIjogM1xuICAgICAgXCJob3d0bzJcIjogNFxuICAgICAgXCJob3d0bzNcIjogNVxuXG4gICAgQHRoaXJ0ZWVuID0gbnVsbFxuICAgIEBsYXN0RXJyID0gJydcbiAgICBAcGF1c2VkID0gZmFsc2VcbiAgICBAaG93dG8gPSAwXG4gICAgQHJlbmRlckNvbW1hbmRzID0gW11cblxuICAgIEBvcHRpb25NZW51cyA9XG4gICAgICBzcGVlZHM6IFtcbiAgICAgICAgeyB0ZXh0OiBcIkFJIFNwZWVkOiBTbG93XCIsIHNwZWVkOiAyMDAwIH1cbiAgICAgICAgeyB0ZXh0OiBcIkFJIFNwZWVkOiBNZWRpdW1cIiwgc3BlZWQ6IDEwMDAgfVxuICAgICAgICB7IHRleHQ6IFwiQUkgU3BlZWQ6IEZhc3RcIiwgc3BlZWQ6IDUwMCB9XG4gICAgICAgIHsgdGV4dDogXCJBSSBTcGVlZDogVWx0cmFcIiwgc3BlZWQ6IDI1MCB9XG4gICAgICBdXG4gICAgICBzb3J0czogW1xuICAgICAgICB7IHRleHQ6IFwiU29ydCBPcmRlcjogTm9ybWFsXCIgfVxuICAgICAgICB7IHRleHQ6IFwiU29ydCBPcmRlcjogUmV2ZXJzZVwiIH1cbiAgICAgIF1cbiAgICBAb3B0aW9ucyA9XG4gICAgICBzcGVlZEluZGV4OiAxXG4gICAgICBzb3J0SW5kZXg6IDBcbiAgICAgIHNvdW5kOiB0cnVlXG5cbiAgICBAbWFpbk1lbnUgPSBuZXcgTWVudSB0aGlzLCBcIlRoaXJ0ZWVuXCIsIFwic29saWRcIiwgQGNvbG9ycy5tYWlubWVudSwgW1xuICAgICAgKGNsaWNrKSA9PlxuICAgICAgICBpZiBjbGlja1xuICAgICAgICAgIEBob3d0byA9IDFcbiAgICAgICAgcmV0dXJuIFwiSG93IFRvIFBsYXlcIlxuICAgICAgKGNsaWNrKSA9PlxuICAgICAgICBpZiBjbGlja1xuICAgICAgICAgIEBvcHRpb25zLnNwZWVkSW5kZXggPSAoQG9wdGlvbnMuc3BlZWRJbmRleCArIDEpICUgQG9wdGlvbk1lbnVzLnNwZWVkcy5sZW5ndGhcbiAgICAgICAgcmV0dXJuIEBvcHRpb25NZW51cy5zcGVlZHNbQG9wdGlvbnMuc3BlZWRJbmRleF0udGV4dFxuICAgICAgKGNsaWNrKSA9PlxuICAgICAgICBpZiBjbGlja1xuICAgICAgICAgIEBvcHRpb25zLnNvcnRJbmRleCA9IChAb3B0aW9ucy5zb3J0SW5kZXggKyAxKSAlIEBvcHRpb25NZW51cy5zb3J0cy5sZW5ndGhcbiAgICAgICAgcmV0dXJuIEBvcHRpb25NZW51cy5zb3J0c1tAb3B0aW9ucy5zb3J0SW5kZXhdLnRleHRcbiAgICAgIChjbGljaykgPT5cbiAgICAgICAgaWYgY2xpY2tcbiAgICAgICAgICBAbmV3R2FtZSgpXG4gICAgICAgIHJldHVybiBcIlN0YXJ0XCJcbiAgICBdXG5cbiAgICBAcGF1c2VNZW51ID0gbmV3IE1lbnUgdGhpcywgXCJQYXVzZWRcIiwgXCJzb2xpZFwiLCBAY29sb3JzLnBhdXNlbWVudSwgW1xuICAgICAgKGNsaWNrKSA9PlxuICAgICAgICBpZiBjbGlja1xuICAgICAgICAgIEBwYXVzZWQgPSBmYWxzZVxuICAgICAgICByZXR1cm4gXCJSZXN1bWUgR2FtZVwiXG4gICAgICAoY2xpY2spID0+XG4gICAgICAgIGlmIGNsaWNrXG4gICAgICAgICAgQG5ld0dhbWUoKVxuICAgICAgICAgIEBwYXVzZWQgPSBmYWxzZVxuICAgICAgICByZXR1cm4gXCJOZXcgR2FtZVwiXG4gICAgICAoY2xpY2spID0+XG4gICAgICAgIGlmIGNsaWNrXG4gICAgICAgICAgQGhvd3RvID0gMVxuICAgICAgICByZXR1cm4gXCJIb3cgVG8gUGxheVwiXG4gICAgICAoY2xpY2spID0+XG4gICAgICAgIGlmIGNsaWNrXG4gICAgICAgICAgQG9wdGlvbnMuc3BlZWRJbmRleCA9IChAb3B0aW9ucy5zcGVlZEluZGV4ICsgMSkgJSBAb3B0aW9uTWVudXMuc3BlZWRzLmxlbmd0aFxuICAgICAgICByZXR1cm4gQG9wdGlvbk1lbnVzLnNwZWVkc1tAb3B0aW9ucy5zcGVlZEluZGV4XS50ZXh0XG4gICAgICAoY2xpY2spID0+XG4gICAgICAgIGlmIGNsaWNrXG4gICAgICAgICAgQG9wdGlvbnMuc29ydEluZGV4ID0gKEBvcHRpb25zLnNvcnRJbmRleCArIDEpICUgQG9wdGlvbk1lbnVzLnNvcnRzLmxlbmd0aFxuICAgICAgICByZXR1cm4gQG9wdGlvbk1lbnVzLnNvcnRzW0BvcHRpb25zLnNvcnRJbmRleF0udGV4dFxuICAgIF1cblxuICAgIEBuZXdHYW1lKClcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgbG9nZ2luZ1xuXG4gIGxvZzogKHMpIC0+XG4gICAgQG5hdGl2ZS5sb2cocylcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgbG9hZCAvIHNhdmVcblxuICBsb2FkOiAoanNvbikgLT5cbiAgICBAbG9nIFwiKENTKSBsb2FkaW5nIHN0YXRlXCJcbiAgICB0cnlcbiAgICAgIHN0YXRlID0gSlNPTi5wYXJzZSBqc29uXG4gICAgY2F0Y2hcbiAgICAgIEBsb2cgXCJsb2FkIGZhaWxlZCB0byBwYXJzZSBzdGF0ZTogI3tqc29ufVwiXG4gICAgICByZXR1cm5cbiAgICBpZiBzdGF0ZS5vcHRpb25zXG4gICAgICBmb3IgaywgdiBvZiBzdGF0ZS5vcHRpb25zXG4gICAgICAgIEBvcHRpb25zW2tdID0gdlxuXG4gICAgaWYgc3RhdGUudGhpcnRlZW5cbiAgICAgIEBsb2cgXCJyZWNyZWF0aW5nIGdhbWUgZnJvbSBzYXZlZGF0YVwiXG4gICAgICBAdGhpcnRlZW4gPSBuZXcgVGhpcnRlZW4gdGhpcywge1xuICAgICAgICBzdGF0ZTogc3RhdGUudGhpcnRlZW5cbiAgICAgIH1cbiAgICAgIEBwcmVwYXJlR2FtZSgpXG5cbiAgc2F2ZTogLT5cbiAgICAjIEBsb2cgXCIoQ1MpIHNhdmluZyBzdGF0ZVwiXG4gICAgc3RhdGUgPSB7XG4gICAgICBvcHRpb25zOiBAb3B0aW9uc1xuICAgIH1cblxuICAgICMgVE9ETzogRU5BQkxFIFNBVklORyBIRVJFXG4gICAgaWYgQHRoaXJ0ZWVuP1xuICAgICAgQHRoaXJ0ZWVuLnVwZGF0ZVBsYXllckhhbmQoQGhhbmQuY2FyZHMpXG4gICAgICBzdGF0ZS50aGlydGVlbiA9IEB0aGlydGVlbi5zYXZlKClcblxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSBzdGF0ZVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBhaVRpY2tSYXRlOiAtPlxuICAgIHJldHVybiBAb3B0aW9uTWVudXMuc3BlZWRzW0BvcHRpb25zLnNwZWVkSW5kZXhdLnNwZWVkXG5cbiAgbmV3R2FtZTogLT5cbiAgICBAdGhpcnRlZW4gPSBuZXcgVGhpcnRlZW4gdGhpcywge31cbiAgICBAbG9nIFwicGxheWVyIDAncyBoYW5kOiBcIiArIEpTT04uc3RyaW5naWZ5KEB0aGlydGVlbi5wbGF5ZXJzWzBdLmhhbmQpXG4gICAgQHByZXBhcmVHYW1lKClcblxuICBwcmVwYXJlR2FtZTogLT5cbiAgICBAaGFuZCA9IG5ldyBIYW5kIHRoaXNcbiAgICBAcGlsZSA9IG5ldyBQaWxlIHRoaXMsIEBoYW5kXG4gICAgQGhhbmQuc2V0IEB0aGlydGVlbi5wbGF5ZXJzWzBdLmhhbmRcbiAgICBAbGFzdEVyciA9ICcnXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIGlucHV0IGhhbmRsaW5nXG5cbiAgdG91Y2hEb3duOiAoeCwgeSkgLT5cbiAgICAjIEBsb2coXCJ0b3VjaERvd24gI3t4fSwje3l9XCIpXG4gICAgQGNoZWNrWm9uZXMoeCwgeSlcblxuICB0b3VjaE1vdmU6ICh4LCB5KSAtPlxuICAgICMgQGxvZyhcInRvdWNoTW92ZSAje3h9LCN7eX1cIilcbiAgICBpZiBAdGhpcnRlZW4gIT0gbnVsbFxuICAgICAgQGhhbmQubW92ZSh4LCB5KVxuXG4gIHRvdWNoVXA6ICh4LCB5KSAtPlxuICAgICMgQGxvZyhcInRvdWNoVXAgI3t4fSwje3l9XCIpXG4gICAgaWYgQHRoaXJ0ZWVuICE9IG51bGxcbiAgICAgIEBoYW5kLnVwKHgsIHkpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIGhlYWRsaW5lIChnYW1lIHN0YXRlIGluIHRvcCBsZWZ0KVxuXG4gIHByZXR0eUVycm9yVGFibGU6IHtcbiAgICAgIGdhbWVPdmVyOiAgICAgICAgICAgXCJUaGUgZ2FtZSBpcyBvdmVyLlwiXG4gICAgICBpbnZhbGlkUGxheTogICAgICAgIFwiTm90IGEgdmFsaWQgcGxheS5cIlxuICAgICAgbXVzdEJyZWFrT3JQYXNzOiAgICBcIllvdSBwYXNzZWQgYWxyZWFkeSwgc28gMi1icmVha2VyIG9yIHBhc3MuXCJcbiAgICAgIG11c3RQYXNzOiAgICAgICAgICAgXCJZb3UgbXVzdCBwYXNzLlwiXG4gICAgICBtdXN0VGhyb3czUzogICAgICAgIFwiWW91IG11c3QgdXNlIHRoZSAzXFx4YzggaW4geW91ciBwbGF5LlwiXG4gICAgICBub3RZb3VyVHVybjogICAgICAgIFwiSXQgaXMgbm90IHlvdXIgdHVybi5cIlxuICAgICAgdGhyb3dBbnl0aGluZzogICAgICBcIllvdSBoYXZlIGNvbnRyb2wsIHRocm93IGFueXRoaW5nLlwiXG4gICAgICB0b29Mb3dQbGF5OiAgICAgICAgIFwiVGhpcyBwbGF5IGlzIG5vdCBzdHJvbmdlciB0aGFuIHRoZSBjdXJyZW50IHBsYXkuXCJcbiAgICAgIHdyb25nUGxheTogICAgICAgICAgXCJUaGlzIHBsYXkgZG9lcyBub3QgbWF0Y2ggdGhlIGN1cnJlbnQgcGxheS5cIlxuICB9XG5cbiAgcHJldHR5RXJyb3I6IC0+XG4gICAgcHJldHR5ID0gQHByZXR0eUVycm9yVGFibGVbQGxhc3RFcnJdXG4gICAgcmV0dXJuIHByZXR0eSBpZiBwcmV0dHlcbiAgICByZXR1cm4gQGxhc3RFcnJcblxuICBjYWxjSGVhZGxpbmU6IC0+XG4gICAgcmV0dXJuIFwiXCIgaWYgQHRoaXJ0ZWVuID09IG51bGxcblxuICAgIGhlYWRsaW5lID0gQHRoaXJ0ZWVuLmhlYWRsaW5lKClcbiAgICAjIHN3aXRjaCBAdGhpcnRlZW4uc3RhdGVcbiAgICAjICAgd2hlbiBTdGF0ZS5CSURcbiAgICAjICAgICBoZWFkbGluZSA9IFwiV2FpdGluZyBmb3IgYGZmNzcwMGAje0B0aGlydGVlbi5wbGF5ZXJzW0B0aGlydGVlbi50dXJuXS5uYW1lfWBgIHRvIGBmZmZmMDBgYmlkYGBcIlxuICAgICMgICB3aGVuIFN0YXRlLlRSSUNLXG4gICAgIyAgICAgaGVhZGxpbmUgPSBcIldhaXRpbmcgZm9yIGBmZjc3MDBgI3tAdGhpcnRlZW4ucGxheWVyc1tAdGhpcnRlZW4udHVybl0ubmFtZX1gYCB0byBgZmZmZjAwYHBsYXlgYFwiXG4gICAgIyAgIHdoZW4gU3RhdGUuUk9VTkRTVU1NQVJZXG4gICAgIyAgICAgaGVhZGxpbmUgPSBcIldhaXRpbmcgZm9yIG5leHQgcm91bmQuLi5cIlxuICAgICMgICB3aGVuIFN0YXRlLlBPU1RHQU1FU1VNTUFSWVxuICAgICMgICAgIGhlYWRsaW5lID0gXCJHYW1lIG92ZXIhXCJcblxuICAgIGVyclRleHQgPSBcIlwiXG4gICAgaWYgKEBsYXN0RXJyLmxlbmd0aCA+IDApIGFuZCAoQGxhc3RFcnIgIT0gT0spXG4gICAgICBlcnJUZXh0ID0gXCIgIGBmZmZmZmZgRVJST1I6IGBmZjAwMDBgI3tAcHJldHR5RXJyb3IoKX1cIlxuICAgICAgaGVhZGxpbmUgKz0gZXJyVGV4dFxuXG4gICAgcmV0dXJuIGhlYWRsaW5lXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIGdhbWUgb3ZlciBpbmZvcm1hdGlvblxuXG4gIGdhbWVPdmVyVGV4dDogLT5cbiAgICB3aW5uZXIgPSBAdGhpcnRlZW4ud2lubmVyKClcbiAgICBpZiB3aW5uZXIubmFtZSA9PSBcIlBsYXllclwiXG4gICAgICByZXR1cm4gW1wiWW91IHdpbiFcIiwgXCIje0B0aGlydGVlbi5sYXN0U3RyZWFrfSBpbiBhIHJvd1wiXVxuICAgIHJldHVybiBbXCIje3dpbm5lci5uYW1lfSB3aW5zIVwiLCBcIiN7QHRoaXJ0ZWVuLmxhc3RTdHJlYWt9IGluIGEgcm93XCJdXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyBjYXJkIGhhbmRsaW5nXG5cbiAgcGFzczogLT5cbiAgICBAbGFzdEVyciA9IEB0aGlydGVlbi5wYXNzIHtcbiAgICAgIGlkOiAxXG4gICAgfVxuXG4gIHBsYXk6IChjYXJkcykgLT5cbiAgICBjb25zb2xlLmxvZyBcIihnYW1lKSBwbGF5aW5nIGNhcmRzXCIsIGNhcmRzXG5cbiAgICBAdGhpcnRlZW4udXBkYXRlUGxheWVySGFuZChAaGFuZC5jYXJkcylcblxuICAgIHJhd0NhcmRzID0gW11cbiAgICBmb3IgY2FyZCBpbiBjYXJkc1xuICAgICAgcmF3Q2FyZHMucHVzaCBjYXJkLmNhcmRcblxuICAgIHJldCA9IEB0aGlydGVlbi5wbGF5IHtcbiAgICAgIGlkOiAxXG4gICAgICBjYXJkczogcmF3Q2FyZHNcbiAgICB9XG4gICAgQGxhc3RFcnIgPSByZXRcbiAgICBpZiByZXQgPT0gT0tcbiAgICAgIEBoYW5kLnNldCBAdGhpcnRlZW4ucGxheWVyc1swXS5oYW5kXG4gICAgICBAcGlsZS5oaW50IGNhcmRzXG5cbiAgcGxheVBpY2tlZDogLT5cbiAgICBpZiBub3QgQGhhbmQucGlja2luZ1xuICAgICAgcmV0dXJuXG4gICAgY2FyZHMgPSBAaGFuZC5zZWxlY3RlZENhcmRzKClcbiAgICBAaGFuZC5zZWxlY3ROb25lKClcbiAgICBpZiBjYXJkcy5sZW5ndGggPT0gMFxuICAgICAgcmV0dXJuIEBwYXNzKClcbiAgICAjIEBoYW5kLnRvZ2dsZVBpY2tpbmcoKVxuICAgIHJldHVybiBAcGxheShjYXJkcylcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgbWFpbiBsb29wXG5cbiAgdXBkYXRlOiAoZHQpIC0+XG4gICAgQHpvbmVzLmxlbmd0aCA9IDAgIyBmb3JnZXQgYWJvdXQgem9uZXMgZnJvbSB0aGUgbGFzdCBmcmFtZS4gd2UncmUgYWJvdXQgdG8gbWFrZSBzb21lIG5ldyBvbmVzIVxuXG4gICAgdXBkYXRlZCA9IGZhbHNlXG4gICAgaWYgQHVwZGF0ZU1haW5NZW51KGR0KVxuICAgICAgdXBkYXRlZCA9IHRydWVcbiAgICBpZiBAdXBkYXRlR2FtZShkdClcbiAgICAgIHVwZGF0ZWQgPSB0cnVlXG5cbiAgICByZXR1cm4gdXBkYXRlZFxuXG4gIHVwZGF0ZU1haW5NZW51OiAoZHQpIC0+XG4gICAgdXBkYXRlZCA9IGZhbHNlXG4gICAgaWYgQG1haW5NZW51LnVwZGF0ZShkdClcbiAgICAgIHVwZGF0ZWQgPSB0cnVlXG4gICAgcmV0dXJuIHVwZGF0ZWRcblxuICB1cGRhdGVHYW1lOiAoZHQpIC0+XG4gICAgcmV0dXJuIGZhbHNlIGlmIEB0aGlydGVlbiA9PSBudWxsXG5cbiAgICB1cGRhdGVkID0gZmFsc2VcblxuICAgIGlmIEBwaWxlLnVwZGF0ZShkdClcbiAgICAgIHVwZGF0ZWQgPSB0cnVlXG4gICAgaWYgQHBpbGUucmVhZHlGb3JOZXh0VHJpY2soKVxuICAgICAgQG5leHRBSVRpY2sgLT0gZHRcbiAgICAgIGlmIEBuZXh0QUlUaWNrIDw9IDBcbiAgICAgICAgQG5leHRBSVRpY2sgPSBAYWlUaWNrUmF0ZSgpXG4gICAgICAgIGlmIEB0aGlydGVlbi5haVRpY2soKVxuICAgICAgICAgIHVwZGF0ZWQgPSB0cnVlXG4gICAgaWYgQGhhbmQudXBkYXRlKGR0KVxuICAgICAgdXBkYXRlZCA9IHRydWVcblxuICAgIEBwaWxlLnNldCBAdGhpcnRlZW4udGhyb3dJRCwgQHRoaXJ0ZWVuLnBpbGUsIEB0aGlydGVlbi5waWxlV2hvXG5cbiAgICBpZiBAcGF1c2VNZW51LnVwZGF0ZShkdClcbiAgICAgIHVwZGF0ZWQgPSB0cnVlXG5cbiAgICByZXR1cm4gdXBkYXRlZFxuXG4gIHJlbmRlcjogLT5cbiAgICAjIFJlc2V0IHJlbmRlciBjb21tYW5kc1xuICAgIEByZW5kZXJDb21tYW5kcy5sZW5ndGggPSAwXG5cbiAgICBpZiBAaG93dG8gPiAwXG4gICAgICBAcmVuZGVySG93dG8oKVxuICAgIGVsc2UgaWYgQHRoaXJ0ZWVuID09IG51bGxcbiAgICAgIEByZW5kZXJNYWluTWVudSgpXG4gICAgZWxzZVxuICAgICAgQHJlbmRlckdhbWUoKVxuXG4gICAgcmV0dXJuIEByZW5kZXJDb21tYW5kc1xuXG4gIHJlbmRlckhvd3RvOiAtPlxuICAgIGhvd3RvVGV4dHVyZSA9IFwiaG93dG8je0Bob3d0b31cIlxuICAgIEBsb2cgXCJyZW5kZXJpbmcgI3tob3d0b1RleHR1cmV9XCJcbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwic29saWRcIiwgMCwgMCwgQHdpZHRoLCBAaGVpZ2h0LCAwLCAwLCAwLCBAY29sb3JzLmJsYWNrXG4gICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBob3d0b1RleHR1cmUsIDAsIDAsIEB3aWR0aCwgQGFhSGVpZ2h0LCAwLCAwLCAwLCBAY29sb3JzLndoaXRlXG4gICAgYXJyb3dXaWR0aCA9IEB3aWR0aCAvIDIwXG4gICAgYXJyb3dPZmZzZXQgPSBhcnJvd1dpZHRoICogNFxuICAgIGNvbG9yID0gaWYgQGhvd3RvID09IDEgdGhlbiBAY29sb3JzLmFycm93Y2xvc2UgZWxzZSBAY29sb3JzLmFycm93XG4gICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcImFycm93TFwiLCBAY2VudGVyLnggLSBhcnJvd09mZnNldCwgQGhlaWdodCwgYXJyb3dXaWR0aCwgMCwgMCwgMC41LCAxLCBjb2xvciwgPT5cbiAgICAgIEBob3d0by0tXG4gICAgICBpZiBAaG93dG8gPCAwXG4gICAgICAgIEBob3d0byA9IDBcbiAgICBjb2xvciA9IGlmIEBob3d0byA9PSAzIHRoZW4gQGNvbG9ycy5hcnJvd2Nsb3NlIGVsc2UgQGNvbG9ycy5hcnJvd1xuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJhcnJvd1JcIiwgQGNlbnRlci54ICsgYXJyb3dPZmZzZXQsIEBoZWlnaHQsIGFycm93V2lkdGgsIDAsIDAsIDAuNSwgMSwgY29sb3IsID0+XG4gICAgICBAaG93dG8rK1xuICAgICAgaWYgQGhvd3RvID4gM1xuICAgICAgICBAaG93dG8gPSAwXG5cbiAgcmVuZGVyTWFpbk1lbnU6IC0+XG4gICAgQG1haW5NZW51LnJlbmRlcigpXG5cbiAgcmVuZGVyR2FtZTogLT5cblxuICAgICMgYmFja2dyb3VuZFxuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJzb2xpZFwiLCAwLCAwLCBAd2lkdGgsIEBoZWlnaHQsIDAsIDAsIDAsIEBjb2xvcnMuYmFja2dyb3VuZFxuXG4gICAgdGV4dEhlaWdodCA9IEBhYUhlaWdodCAvIDI1XG4gICAgdGV4dFBhZGRpbmcgPSB0ZXh0SGVpZ2h0IC8gNVxuICAgIGNoYXJhY3RlckhlaWdodCA9IEBhYUhlaWdodCAvIDVcbiAgICBjb3VudEhlaWdodCA9IHRleHRIZWlnaHRcblxuICAgICMgTG9nXG4gICAgZm9yIGxpbmUsIGkgaW4gQHRoaXJ0ZWVuLmxvZ1xuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIHRleHRIZWlnaHQsIGxpbmUsIDAsIChpKzEuNSkgKiAodGV4dEhlaWdodCArIHRleHRQYWRkaW5nKSwgMCwgMCwgQGNvbG9ycy5sb2djb2xvclxuXG4gICAgYWlQbGF5ZXJzID0gW1xuICAgICAgQHRoaXJ0ZWVuLnBsYXllcnNbMV1cbiAgICAgIEB0aGlydGVlbi5wbGF5ZXJzWzJdXG4gICAgICBAdGhpcnRlZW4ucGxheWVyc1szXVxuICAgIF1cblxuICAgIGNoYXJhY3Rlck1hcmdpbiA9IGNoYXJhY3RlckhlaWdodCAvIDJcbiAgICBAY2hhckNlaWxpbmcgPSBAaGVpZ2h0ICogMC42XG5cbiAgICAjIGxlZnQgc2lkZVxuICAgIGlmIGFpUGxheWVyc1swXSAhPSBudWxsXG4gICAgICBjaGFyYWN0ZXIgPSBhaUNoYXJhY3RlcnNbYWlQbGF5ZXJzWzBdLmNoYXJJRF1cbiAgICAgIGNoYXJhY3RlcldpZHRoID0gQHNwcml0ZVJlbmRlcmVyLmNhbGNXaWR0aChjaGFyYWN0ZXIuc3ByaXRlLCBjaGFyYWN0ZXJIZWlnaHQpXG4gICAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIGNoYXJhY3Rlci5zcHJpdGUsIGNoYXJhY3Rlck1hcmdpbiwgQGNoYXJDZWlsaW5nLCAwLCBjaGFyYWN0ZXJIZWlnaHQsIDAsIDAsIDEsIEBjb2xvcnMud2hpdGVcbiAgICAgIEByZW5kZXJDb3VudCBhaVBsYXllcnNbMF0sIGFpUGxheWVyc1swXS5pbmRleCA9PSBAdGhpcnRlZW4udHVybiwgY291bnRIZWlnaHQsIGNoYXJhY3Rlck1hcmdpbiArIChjaGFyYWN0ZXJXaWR0aCAvIDIpLCBAY2hhckNlaWxpbmcgLSB0ZXh0UGFkZGluZywgMC41LCAwXG4gICAgICBAcmVuZGVyQUlIYW5kIGFpUGxheWVyc1swXS5jb3VudCwgY2hhcmFjdGVyTWFyZ2luICsgKGNoYXJhY3RlcldpZHRoIC8gMiksIEBjaGFyQ2VpbGluZyAtIHRleHRQYWRkaW5nLCAwLjUsIDBcbiAgICAjIHRvcCBzaWRlXG4gICAgaWYgYWlQbGF5ZXJzWzFdICE9IG51bGxcbiAgICAgIGNoYXJhY3RlciA9IGFpQ2hhcmFjdGVyc1thaVBsYXllcnNbMV0uY2hhcklEXVxuICAgICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBjaGFyYWN0ZXIuc3ByaXRlLCBAY2VudGVyLngsIDAsIDAsIGNoYXJhY3RlckhlaWdodCwgMCwgMC41LCAwLCBAY29sb3JzLndoaXRlXG4gICAgICBAcmVuZGVyQ291bnQgYWlQbGF5ZXJzWzFdLCBhaVBsYXllcnNbMV0uaW5kZXggPT0gQHRoaXJ0ZWVuLnR1cm4sIGNvdW50SGVpZ2h0LCBAY2VudGVyLngsIGNoYXJhY3RlckhlaWdodCwgMC41LCAwXG4gICAgICBAcmVuZGVyQUlIYW5kIGFpUGxheWVyc1swXS5jb3VudCwgY2hhcmFjdGVyTWFyZ2luICsgKGNoYXJhY3RlcldpZHRoIC8gMiksIEBjaGFyQ2VpbGluZyAtIHRleHRQYWRkaW5nLCAwLjUsIDBcbiAgICAjIHJpZ2h0IHNpZGVcbiAgICBpZiBhaVBsYXllcnNbMl0gIT0gbnVsbFxuICAgICAgY2hhcmFjdGVyID0gYWlDaGFyYWN0ZXJzW2FpUGxheWVyc1syXS5jaGFySURdXG4gICAgICBjaGFyYWN0ZXJXaWR0aCA9IEBzcHJpdGVSZW5kZXJlci5jYWxjV2lkdGgoY2hhcmFjdGVyLnNwcml0ZSwgY2hhcmFjdGVySGVpZ2h0KVxuICAgICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBjaGFyYWN0ZXIuc3ByaXRlLCBAd2lkdGggLSBjaGFyYWN0ZXJNYXJnaW4sIEBjaGFyQ2VpbGluZywgMCwgY2hhcmFjdGVySGVpZ2h0LCAwLCAxLCAxLCBAY29sb3JzLndoaXRlXG4gICAgICBAcmVuZGVyQ291bnQgYWlQbGF5ZXJzWzJdLCBhaVBsYXllcnNbMl0uaW5kZXggPT0gQHRoaXJ0ZWVuLnR1cm4sIGNvdW50SGVpZ2h0LCBAd2lkdGggLSAoY2hhcmFjdGVyTWFyZ2luICsgKGNoYXJhY3RlcldpZHRoIC8gMikpLCBAY2hhckNlaWxpbmcgLSB0ZXh0UGFkZGluZywgMC41LCAwXG4gICAgICBAcmVuZGVyQUlIYW5kIGFpUGxheWVyc1swXS5jb3VudCwgY2hhcmFjdGVyTWFyZ2luICsgKGNoYXJhY3RlcldpZHRoIC8gMiksIEBjaGFyQ2VpbGluZyAtIHRleHRQYWRkaW5nLCAwLjUsIDBcblxuICAgICMgY2FyZCBhcmVhXG4gICAgaGFuZEFyZWFIZWlnaHQgPSAwLjI3ICogQGhlaWdodFxuICAgIGlmIEBoYW5kLnBpY2tpbmdcbiAgICAgIGhhbmRhcmVhQ29sb3IgPSBAY29sb3JzLmhhbmRfcGlja1xuICAgIGVsc2VcbiAgICAgIGhhbmRhcmVhQ29sb3IgPSBAY29sb3JzLmhhbmRfcmVvcmdcbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwic29saWRcIiwgMCwgQGhlaWdodCwgQHdpZHRoLCBoYW5kQXJlYUhlaWdodCwgMCwgMCwgMSwgaGFuZGFyZWFDb2xvciwgPT5cbiAgICAgIEBoYW5kLnRvZ2dsZVBpY2tpbmcoKVxuXG4gICAgIyBwaWxlXG4gICAgcGlsZURpbWVuc2lvbiA9IEBoZWlnaHQgKiAwLjRcbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwicGlsZVwiLCBAd2lkdGggLyAyLCBAaGVpZ2h0IC8gMiwgcGlsZURpbWVuc2lvbiwgcGlsZURpbWVuc2lvbiwgMCwgMC41LCAwLjUsIEBjb2xvcnMud2hpdGUsID0+XG4gICAgICBAcGxheVBpY2tlZCgpXG4gICAgQHBpbGUucmVuZGVyKClcblxuICAgIEBoYW5kLnJlbmRlcigpXG4gICAgQHJlbmRlckNvdW50IEB0aGlydGVlbi5wbGF5ZXJzWzBdLCAwID09IEB0aGlydGVlbi50dXJuLCBjb3VudEhlaWdodCwgQGNlbnRlci54LCBAaGVpZ2h0LCAwLjUsIDFcblxuICAgIGlmIEB0aGlydGVlbi53aW5uZXIoKSBhbmQgQHBpbGUucmVzdGluZygpXG4gICAgICBsaW5lcyA9IEBnYW1lT3ZlclRleHQoKVxuICAgICAgZ2FtZU92ZXJTaXplID0gQGFhSGVpZ2h0IC8gOFxuICAgICAgZ2FtZU92ZXJZID0gQGNlbnRlci55XG4gICAgICBpZiBsaW5lcy5sZW5ndGggPiAxXG4gICAgICAgIGdhbWVPdmVyWSAtPSAoZ2FtZU92ZXJTaXplID4+IDEpXG4gICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgZ2FtZU92ZXJTaXplLCBsaW5lc1swXSwgQGNlbnRlci54LCBnYW1lT3ZlclksIDAuNSwgMC41LCBAY29sb3JzLm9yYW5nZVxuICAgICAgaWYgbGluZXMubGVuZ3RoID4gMVxuICAgICAgICBnYW1lT3ZlclkgKz0gZ2FtZU92ZXJTaXplXG4gICAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCBnYW1lT3ZlclNpemUsIGxpbmVzWzFdLCBAY2VudGVyLngsIGdhbWVPdmVyWSwgMC41LCAwLjUsIEBjb2xvcnMub3JhbmdlXG5cbiAgICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJzb2xpZFwiLCAwLCBAaGVpZ2h0LCBAd2lkdGgsIGhhbmRBcmVhSGVpZ2h0LCAwLCAwLCAxLCBAY29sb3JzLnBsYXlfYWdhaW4sID0+XG4gICAgICAgIEB0aGlydGVlbi5kZWFsKClcbiAgICAgICAgQHByZXBhcmVHYW1lKClcblxuICAgICAgcmVzdGFydFF1aXRTaXplID0gQGFhSGVpZ2h0IC8gMTJcbiAgICAgIHNoYWRvd0Rpc3RhbmNlID0gcmVzdGFydFF1aXRTaXplIC8gOFxuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIHJlc3RhcnRRdWl0U2l6ZSwgXCJQbGF5IEFnYWluXCIsIHNoYWRvd0Rpc3RhbmNlICsgQGNlbnRlci54LCBzaGFkb3dEaXN0YW5jZSArIChAaGVpZ2h0IC0gKGhhbmRBcmVhSGVpZ2h0ICogMC41KSksIDAuNSwgMSwgQGNvbG9ycy5ibGFja1xuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIHJlc3RhcnRRdWl0U2l6ZSwgXCJQbGF5IEFnYWluXCIsIEBjZW50ZXIueCwgQGhlaWdodCAtIChoYW5kQXJlYUhlaWdodCAqIDAuNSksIDAuNSwgMSwgQGNvbG9ycy5nb2xkXG5cbiAgICAjIEhlYWRsaW5lIChpbmNsdWRlcyBlcnJvcilcbiAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgdGV4dEhlaWdodCwgQGNhbGNIZWFkbGluZSgpLCAwLCAwLCAwLCAwLCBAY29sb3JzLmxpZ2h0Z3JheVxuXG4gICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcInBhdXNlXCIsIEB3aWR0aCwgMCwgMCwgQHBhdXNlQnV0dG9uU2l6ZSwgMCwgMSwgMCwgQGNvbG9ycy53aGl0ZSwgPT5cbiAgICAgIEBwYXVzZWQgPSB0cnVlXG5cbiAgICBpZiBub3QgQGhhbmQucGlja2luZ1xuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIHRleHRIZWlnaHQsIFwiVW5sb2NrZWRcIiwgMC4wMiAqIEB3aWR0aCwgQGhlaWdodCAtIGhhbmRBcmVhSGVpZ2h0LCAwLCAwLCBAY29sb3JzLndoaXRlXG5cbiAgICBpZiBAcGF1c2VkXG4gICAgICBAcGF1c2VNZW51LnJlbmRlcigpXG5cbiAgICByZXR1cm5cblxuICByZW5kZXJDb3VudDogKHBsYXllciwgbXlUdXJuLCBjb3VudEhlaWdodCwgeCwgeSwgYW5jaG9yeCwgYW5jaG9yeSkgLT5cbiAgICBpZiBteVR1cm5cbiAgICAgIG5hbWVDb2xvciA9IFwiYGZmNzcwMGBcIlxuICAgIGVsc2VcbiAgICAgIG5hbWVDb2xvciA9IFwiXCJcbiAgICBuYW1lU3RyaW5nID0gXCIgI3tuYW1lQ29sb3J9I3twbGF5ZXIubmFtZX1gYCBcIlxuICAgIGNhcmRDb3VudCA9IHBsYXllci5oYW5kLmxlbmd0aFxuICAgIGlmIGNhcmRDb3VudCA+IDFcbiAgICAgIHRyaWNrQ29sb3IgPSBcImZmZmYzM1wiXG4gICAgZWxzZVxuICAgICAgdHJpY2tDb2xvciA9IFwiZmYzMzMzXCJcbiAgICBjb3VudFN0cmluZyA9IFwiIGAje3RyaWNrQ29sb3J9YCN7Y2FyZENvdW50fWBgIGxlZnQgXCJcblxuICAgIG5hbWVTaXplID0gQGZvbnRSZW5kZXJlci5zaXplKEBmb250LCBjb3VudEhlaWdodCwgbmFtZVN0cmluZylcbiAgICBjb3VudFNpemUgPSBAZm9udFJlbmRlcmVyLnNpemUoQGZvbnQsIGNvdW50SGVpZ2h0LCBjb3VudFN0cmluZylcbiAgICBpZiBuYW1lU2l6ZS53ID4gY291bnRTaXplLndcbiAgICAgIGNvdW50U2l6ZS53ID0gbmFtZVNpemUud1xuICAgIGVsc2VcbiAgICAgIG5hbWVTaXplLncgPSBjb3VudFNpemUud1xuICAgIG5hbWVZID0geVxuICAgIGNvdW50WSA9IHlcbiAgICBib3hIZWlnaHQgPSBjb3VudFNpemUuaFxuICAgIGlmIHBsYXllci5pZCAhPSAxXG4gICAgICBib3hIZWlnaHQgKj0gMlxuICAgICAgaWYgYW5jaG9yeSA+IDBcbiAgICAgICAgbmFtZVkgLT0gY291bnRIZWlnaHRcbiAgICAgIGVsc2VcbiAgICAgICAgY291bnRZICs9IGNvdW50SGVpZ2h0XG4gICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcInNvbGlkXCIsIHgsIHksIGNvdW50U2l6ZS53LCBib3hIZWlnaHQsIDAsIGFuY2hvcngsIGFuY2hvcnksIEBjb2xvcnMub3ZlcmxheVxuICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCBjb3VudEhlaWdodCwgbmFtZVN0cmluZywgeCwgbmFtZVksIGFuY2hvcngsIGFuY2hvcnksIEBjb2xvcnMud2hpdGVcbiAgICBpZiBwbGF5ZXIuaWQgIT0gMVxuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIGNvdW50SGVpZ2h0LCBjb3VudFN0cmluZywgeCwgY291bnRZLCBhbmNob3J4LCBhbmNob3J5LCBAY29sb3JzLndoaXRlXG5cbiAgcmVuZGVyQUlIYW5kOiAoY2FyZENvdW50LCBjb3VudEhlaWdodCwgeCwgeSwgYW5jaG9yeCwgYW5jaG9yeSkgLT5cbiAgICAjIFRPRE86IG1ha2UgdGhpcyBkcmF3IGEgdGlueSBoYW5kIG9mIGNhcmRzIG9uIHRoZSBBSSBjaGFyc1xuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyByZW5kZXJpbmcgYW5kIHpvbmVzXG5cbiAgZHJhd0ltYWdlOiAodGV4dHVyZSwgc3gsIHN5LCBzdywgc2gsIGR4LCBkeSwgZHcsIGRoLCByb3QsIGFuY2hvcngsIGFuY2hvcnksIHIsIGcsIGIsIGEsIGNiKSAtPlxuICAgIEByZW5kZXJDb21tYW5kcy5wdXNoIEB0ZXh0dXJlc1t0ZXh0dXJlXSwgc3gsIHN5LCBzdywgc2gsIGR4LCBkeSwgZHcsIGRoLCByb3QsIGFuY2hvcngsIGFuY2hvcnksIHIsIGcsIGIsIGFcblxuICAgIGlmIGNiP1xuICAgICAgIyBjYWxsZXIgd2FudHMgdG8gcmVtZW1iZXIgd2hlcmUgdGhpcyB3YXMgZHJhd24sIGFuZCB3YW50cyB0byBiZSBjYWxsZWQgYmFjayBpZiBpdCBpcyBldmVyIHRvdWNoZWRcbiAgICAgICMgVGhpcyBpcyBjYWxsZWQgYSBcInpvbmVcIi4gU2luY2Ugem9uZXMgYXJlIHRyYXZlcnNlZCBpbiByZXZlcnNlIG9yZGVyLCB0aGUgbmF0dXJhbCBvdmVybGFwIG9mXG4gICAgICAjIGEgc2VyaWVzIG9mIHJlbmRlcnMgaXMgcmVzcGVjdGVkIGFjY29yZGluZ2x5LlxuICAgICAgYW5jaG9yT2Zmc2V0WCA9IC0xICogYW5jaG9yeCAqIGR3XG4gICAgICBhbmNob3JPZmZzZXRZID0gLTEgKiBhbmNob3J5ICogZGhcbiAgICAgIHpvbmUgPVxuICAgICAgICAjIGNlbnRlciAoWCxZKSBhbmQgcmV2ZXJzZWQgcm90YXRpb24sIHVzZWQgdG8gcHV0IHRoZSBjb29yZGluYXRlIGluIGxvY2FsIHNwYWNlIHRvIHRoZSB6b25lXG4gICAgICAgIGN4OiAgZHhcbiAgICAgICAgY3k6ICBkeVxuICAgICAgICByb3Q6IHJvdCAqIC0xXG4gICAgICAgICMgdGhlIGF4aXMgYWxpZ25lZCBib3VuZGluZyBib3ggdXNlZCBmb3IgZGV0ZWN0aW9uIG9mIGEgbG9jYWxzcGFjZSBjb29yZFxuICAgICAgICBsOiAgIGFuY2hvck9mZnNldFhcbiAgICAgICAgdDogICBhbmNob3JPZmZzZXRZXG4gICAgICAgIHI6ICAgYW5jaG9yT2Zmc2V0WCArIGR3XG4gICAgICAgIGI6ICAgYW5jaG9yT2Zmc2V0WSArIGRoXG4gICAgICAgICMgY2FsbGJhY2sgdG8gY2FsbCBpZiB0aGUgem9uZSBpcyBjbGlja2VkIG9uXG4gICAgICAgIGNiOiAgY2JcbiAgICAgIEB6b25lcy5wdXNoIHpvbmVcblxuICBjaGVja1pvbmVzOiAoeCwgeSkgLT5cbiAgICBmb3Igem9uZSBpbiBAem9uZXMgYnkgLTFcbiAgICAgICMgbW92ZSBjb29yZCBpbnRvIHNwYWNlIHJlbGF0aXZlIHRvIHRoZSBxdWFkLCB0aGVuIHJvdGF0ZSBpdCB0byBtYXRjaFxuICAgICAgdW5yb3RhdGVkTG9jYWxYID0geCAtIHpvbmUuY3hcbiAgICAgIHVucm90YXRlZExvY2FsWSA9IHkgLSB6b25lLmN5XG4gICAgICBsb2NhbFggPSB1bnJvdGF0ZWRMb2NhbFggKiBNYXRoLmNvcyh6b25lLnJvdCkgLSB1bnJvdGF0ZWRMb2NhbFkgKiBNYXRoLnNpbih6b25lLnJvdClcbiAgICAgIGxvY2FsWSA9IHVucm90YXRlZExvY2FsWCAqIE1hdGguc2luKHpvbmUucm90KSArIHVucm90YXRlZExvY2FsWSAqIE1hdGguY29zKHpvbmUucm90KVxuICAgICAgaWYgKGxvY2FsWCA8IHpvbmUubCkgb3IgKGxvY2FsWCA+IHpvbmUucikgb3IgKGxvY2FsWSA8IHpvbmUudCkgb3IgKGxvY2FsWSA+IHpvbmUuYilcbiAgICAgICAgIyBvdXRzaWRlIG9mIG9yaWVudGVkIGJvdW5kaW5nIGJveFxuICAgICAgICBjb250aW51ZVxuICAgICAgem9uZS5jYih4LCB5KVxuICAgICAgcmV0dXJuIHRydWVcbiAgICByZXR1cm4gZmFsc2VcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbm1vZHVsZS5leHBvcnRzID0gR2FtZVxuIiwiQW5pbWF0aW9uID0gcmVxdWlyZSAnLi9BbmltYXRpb24nXG5cbkNBUkRfSU1BR0VfVyA9IDEyMFxuQ0FSRF9JTUFHRV9IID0gMTYyXG5DQVJEX0lNQUdFX09GRl9YID0gNFxuQ0FSRF9JTUFHRV9PRkZfWSA9IDRcbkNBUkRfSU1BR0VfQURWX1ggPSBDQVJEX0lNQUdFX1dcbkNBUkRfSU1BR0VfQURWX1kgPSBDQVJEX0lNQUdFX0hcbkNBUkRfUkVOREVSX1NDQUxFID0gMC4zNSAgICAgICAgICAgICAgICAgICMgY2FyZCBoZWlnaHQgY29lZmZpY2llbnQgZnJvbSB0aGUgc2NyZWVuJ3MgaGVpZ2h0XG5DQVJEX0hBTkRfQ1VSVkVfRElTVF9GQUNUT1IgPSAzLjUgICAgICAgICAjIGZhY3RvciB3aXRoIHNjcmVlbiBoZWlnaHQgdG8gZmlndXJlIG91dCBjZW50ZXIgb2YgYXJjLiBiaWdnZXIgbnVtYmVyIGlzIGxlc3MgYXJjXG5DQVJEX0hPTERJTkdfUk9UX09SREVSID0gTWF0aC5QSSAvIDEyICAgICAjIGRlc2lyZWQgcm90YXRpb24gb2YgdGhlIGNhcmQgd2hlbiBiZWluZyBkcmFnZ2VkIGFyb3VuZCBmb3Igb3JkZXJpbmcncyBzYWtlXG5DQVJEX0hPTERJTkdfUk9UX1BMQVkgPSAtMSAqIE1hdGguUEkgLyAxMiAjIGRlc2lyZWQgcm90YXRpb24gb2YgdGhlIGNhcmQgd2hlbiBiZWluZyBkcmFnZ2VkIGFyb3VuZCB3aXRoIGludGVudCB0byBwbGF5XG5DQVJEX1BMQVlfQ0VJTElORyA9IDAuNjAgICAgICAgICAgICAgICAgICAjIGhvdyBtdWNoIG9mIHRoZSB0b3Agb2YgdGhlIHNjcmVlbiByZXByZXNlbnRzIFwiSSB3YW50IHRvIHBsYXkgdGhpc1wiIHZzIFwiSSB3YW50IHRvIHJlb3JkZXJcIlxuXG5OT19DQVJEID0gLTFcblxuSGlnaGxpZ2h0ID1cbiAgTk9ORTogLTFcbiAgVU5TRUxFQ1RFRDogMFxuICBTRUxFQ1RFRDogMVxuICBQSUxFOiAyXG5cbiMgdGFrZW4gZnJvbSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzEyMTEyMTIvaG93LXRvLWNhbGN1bGF0ZS1hbi1hbmdsZS1mcm9tLXRocmVlLXBvaW50c1xuIyB1c2VzIGxhdyBvZiBjb3NpbmVzIHRvIGZpZ3VyZSBvdXQgdGhlIGhhbmQgYXJjIGFuZ2xlXG5maW5kQW5nbGUgPSAocDAsIHAxLCBwMikgLT5cbiAgICBhID0gTWF0aC5wb3cocDEueCAtIHAyLngsIDIpICsgTWF0aC5wb3cocDEueSAtIHAyLnksIDIpXG4gICAgYiA9IE1hdGgucG93KHAxLnggLSBwMC54LCAyKSArIE1hdGgucG93KHAxLnkgLSBwMC55LCAyKVxuICAgIGMgPSBNYXRoLnBvdyhwMi54IC0gcDAueCwgMikgKyBNYXRoLnBvdyhwMi55IC0gcDAueSwgMilcbiAgICByZXR1cm4gTWF0aC5hY29zKCAoYStiLWMpIC8gTWF0aC5zcXJ0KDQqYSpiKSApXG5cbmNhbGNEaXN0YW5jZSA9IChwMCwgcDEpIC0+XG4gIHJldHVybiBNYXRoLnNxcnQoTWF0aC5wb3cocDEueCAtIHAwLngsIDIpICsgTWF0aC5wb3cocDEueSAtIHAwLnksIDIpKVxuXG5jYWxjRGlzdGFuY2VTcXVhcmVkID0gKHgwLCB5MCwgeDEsIHkxKSAtPlxuICByZXR1cm4gTWF0aC5wb3coeDEgLSB4MCwgMikgKyBNYXRoLnBvdyh5MSAtIHkwLCAyKVxuXG5jbGFzcyBIYW5kXG4gIEBDQVJEX0lNQUdFX1c6IENBUkRfSU1BR0VfV1xuICBAQ0FSRF9JTUFHRV9IOiBDQVJEX0lNQUdFX0hcbiAgQENBUkRfSU1BR0VfT0ZGX1g6IENBUkRfSU1BR0VfT0ZGX1hcbiAgQENBUkRfSU1BR0VfT0ZGX1k6IENBUkRfSU1BR0VfT0ZGX1lcbiAgQENBUkRfSU1BR0VfQURWX1g6IENBUkRfSU1BR0VfQURWX1hcbiAgQENBUkRfSU1BR0VfQURWX1k6IENBUkRfSU1BR0VfQURWX1lcbiAgQENBUkRfUkVOREVSX1NDQUxFOiBDQVJEX1JFTkRFUl9TQ0FMRVxuICBASGlnaGxpZ2h0OiBIaWdobGlnaHRcblxuICBjb25zdHJ1Y3RvcjogKEBnYW1lKSAtPlxuICAgIEBjYXJkcyA9IFtdXG4gICAgQGFuaW1zID0ge31cbiAgICBAcG9zaXRpb25DYWNoZSA9IHt9XG5cbiAgICBAcGlja2luZyA9IHRydWVcbiAgICBAcGlja2VkID0gW11cbiAgICBAcGlja1BhaW50ID0gZmFsc2VcblxuICAgIEBkcmFnSW5kZXhTdGFydCA9IE5PX0NBUkRcbiAgICBAZHJhZ0luZGV4Q3VycmVudCA9IE5PX0NBUkRcbiAgICBAZHJhZ1ggPSAwXG4gICAgQGRyYWdZID0gMFxuXG4gICAgIyByZW5kZXIgLyBhbmltIG1ldHJpY3NcbiAgICBAY2FyZFNwZWVkID1cbiAgICAgIHI6IE1hdGguUEkgKiAyXG4gICAgICBzOiAyLjVcbiAgICAgIHQ6IDIgKiBAZ2FtZS53aWR0aFxuICAgIEBwbGF5Q2VpbGluZyA9IENBUkRfUExBWV9DRUlMSU5HICogQGdhbWUuaGVpZ2h0XG4gICAgQGNhcmRIZWlnaHQgPSBNYXRoLmZsb29yKEBnYW1lLmhlaWdodCAqIENBUkRfUkVOREVSX1NDQUxFKVxuICAgIEBjYXJkV2lkdGggID0gTWF0aC5mbG9vcihAY2FyZEhlaWdodCAqIENBUkRfSU1BR0VfVyAvIENBUkRfSU1BR0VfSClcbiAgICBAY2FyZEhhbGZIZWlnaHQgPSBAY2FyZEhlaWdodCA+PiAxXG4gICAgQGNhcmRIYWxmV2lkdGggID0gQGNhcmRXaWR0aCA+PiAxXG4gICAgYXJjTWFyZ2luID0gQGNhcmRXaWR0aCAvIDJcbiAgICBhcmNWZXJ0aWNhbEJpYXMgPSBAY2FyZEhlaWdodCAvIDUwXG4gICAgYm90dG9tTGVmdCAgPSB7IHg6IGFyY01hcmdpbiwgICAgICAgICAgICAgICAgeTogYXJjVmVydGljYWxCaWFzICsgQGdhbWUuaGVpZ2h0IH1cbiAgICBib3R0b21SaWdodCA9IHsgeDogQGdhbWUud2lkdGggLSBhcmNNYXJnaW4sIHk6IGFyY1ZlcnRpY2FsQmlhcyArIEBnYW1lLmhlaWdodCB9XG4gICAgQGhhbmRDZW50ZXIgPSB7IHg6IEBnYW1lLndpZHRoIC8gMiwgICAgICAgICB5OiBhcmNWZXJ0aWNhbEJpYXMgKyBAZ2FtZS5oZWlnaHQgKyAoQ0FSRF9IQU5EX0NVUlZFX0RJU1RfRkFDVE9SICogQGdhbWUuaGVpZ2h0KSB9XG4gICAgQGhhbmRBbmdsZSA9IGZpbmRBbmdsZShib3R0b21MZWZ0LCBAaGFuZENlbnRlciwgYm90dG9tUmlnaHQpXG4gICAgQGhhbmREaXN0YW5jZSA9IGNhbGNEaXN0YW5jZShib3R0b21MZWZ0LCBAaGFuZENlbnRlcilcbiAgICBAaGFuZEFuZ2xlQWR2YW5jZU1heCA9IEBoYW5kQW5nbGUgLyA3ICMgbmV2ZXIgc3BhY2UgdGhlIGNhcmRzIG1vcmUgdGhhbiB3aGF0IHRoZXknZCBsb29rIGxpa2Ugd2l0aCB0aGlzIGhhbmRzaXplXG4gICAgQGdhbWUubG9nIFwiSGFuZCBkaXN0YW5jZSAje0BoYW5kRGlzdGFuY2V9LCBhbmdsZSAje0BoYW5kQW5nbGV9IChzY3JlZW4gaGVpZ2h0ICN7QGdhbWUuaGVpZ2h0fSlcIlxuXG4gIHRvZ2dsZVBpY2tpbmc6IC0+XG4gICAgQHBpY2tpbmcgPSAhQHBpY2tpbmdcbiAgICBpZiBAcGlja2luZ1xuICAgICAgQHNlbGVjdE5vbmUoKVxuXG4gIHNlbGVjdE5vbmU6IC0+XG4gICAgQHBpY2tlZCA9IG5ldyBBcnJheShAY2FyZHMubGVuZ3RoKS5maWxsKGZhbHNlKVxuICAgIHJldHVyblxuXG4gIHNldDogKGNhcmRzKSAtPlxuICAgIEBjYXJkcyA9IGNhcmRzLnNsaWNlKDApXG4gICAgaWYgQHBpY2tpbmdcbiAgICAgIEBzZWxlY3ROb25lKClcbiAgICBAc3luY0FuaW1zKClcbiAgICBAd2FycCgpXG5cbiAgc3luY0FuaW1zOiAtPlxuICAgIHNlZW4gPSB7fVxuICAgIGZvciBjYXJkIGluIEBjYXJkc1xuICAgICAgc2VlbltjYXJkXSsrXG4gICAgICBpZiBub3QgQGFuaW1zW2NhcmRdXG4gICAgICAgIEBhbmltc1tjYXJkXSA9IG5ldyBBbmltYXRpb24ge1xuICAgICAgICAgIHNwZWVkOiBAY2FyZFNwZWVkXG4gICAgICAgICAgeDogMFxuICAgICAgICAgIHk6IDBcbiAgICAgICAgICByOiAwXG4gICAgICAgIH1cbiAgICB0b1JlbW92ZSA9IFtdXG4gICAgZm9yIGNhcmQsYW5pbSBvZiBAYW5pbXNcbiAgICAgIGlmIG5vdCBzZWVuLmhhc093blByb3BlcnR5KGNhcmQpXG4gICAgICAgIHRvUmVtb3ZlLnB1c2ggY2FyZFxuICAgIGZvciBjYXJkIGluIHRvUmVtb3ZlXG4gICAgICAjIEBnYW1lLmxvZyBcInJlbW92aW5nIGFuaW0gZm9yICN7Y2FyZH1cIlxuICAgICAgZGVsZXRlIEBhbmltc1tjYXJkXVxuXG4gICAgQHVwZGF0ZVBvc2l0aW9ucygpXG5cbiAgY2FsY0RyYXduSGFuZDogLT5cbiAgICBkcmF3bkhhbmQgPSBbXVxuICAgIGZvciBjYXJkLGkgaW4gQGNhcmRzXG4gICAgICBpZiBpICE9IEBkcmFnSW5kZXhTdGFydFxuICAgICAgICBkcmF3bkhhbmQucHVzaCBjYXJkXG5cbiAgICBpZiBAZHJhZ0luZGV4Q3VycmVudCAhPSBOT19DQVJEXG4gICAgICBkcmF3bkhhbmQuc3BsaWNlIEBkcmFnSW5kZXhDdXJyZW50LCAwLCBAY2FyZHNbQGRyYWdJbmRleFN0YXJ0XVxuICAgIHJldHVybiBkcmF3bkhhbmRcblxuICB3YW50c1RvUGxheURyYWdnZWRDYXJkOiAtPlxuICAgIHJldHVybiBmYWxzZSBpZiBAZHJhZ0luZGV4U3RhcnQgPT0gTk9fQ0FSRFxuICAgIHJldHVybiBAZHJhZ1kgPCBAcGxheUNlaWxpbmdcblxuICB1cGRhdGVQb3NpdGlvbnM6IC0+XG4gICAgZHJhd25IYW5kID0gQGNhbGNEcmF3bkhhbmQoKVxuICAgIHdhbnRzVG9QbGF5ID0gQHdhbnRzVG9QbGF5RHJhZ2dlZENhcmQoKVxuICAgIGRlc2lyZWRSb3RhdGlvbiA9IENBUkRfSE9MRElOR19ST1RfT1JERVJcbiAgICBwb3NpdGlvbkNvdW50ID0gZHJhd25IYW5kLmxlbmd0aFxuICAgIGlmIHdhbnRzVG9QbGF5XG4gICAgICBkZXNpcmVkUm90YXRpb24gPSBDQVJEX0hPTERJTkdfUk9UX1BMQVlcbiAgICAgIHBvc2l0aW9uQ291bnQtLVxuICAgIHBvc2l0aW9ucyA9IEBjYWxjUG9zaXRpb25zKHBvc2l0aW9uQ291bnQpXG4gICAgZHJhd0luZGV4ID0gMFxuICAgIGZvciBjYXJkLGkgaW4gZHJhd25IYW5kXG4gICAgICBhbmltID0gQGFuaW1zW2NhcmRdXG4gICAgICBpZiBpID09IEBkcmFnSW5kZXhDdXJyZW50XG4gICAgICAgIGFuaW0ucmVxLnggPSBAZHJhZ1hcbiAgICAgICAgYW5pbS5yZXEueSA9IEBkcmFnWVxuICAgICAgICBhbmltLnJlcS5yID0gZGVzaXJlZFJvdGF0aW9uXG4gICAgICAgIGlmIG5vdCB3YW50c1RvUGxheVxuICAgICAgICAgIGRyYXdJbmRleCsrXG4gICAgICBlbHNlXG4gICAgICAgIHBvcyA9IHBvc2l0aW9uc1tkcmF3SW5kZXhdXG4gICAgICAgIGFuaW0ucmVxLnggPSBwb3MueFxuICAgICAgICBhbmltLnJlcS55ID0gcG9zLnlcbiAgICAgICAgYW5pbS5yZXEuciA9IHBvcy5yXG4gICAgICAgIGRyYXdJbmRleCsrXG5cbiAgIyBpbW1lZGlhdGVseSB3YXJwIGFsbCBjYXJkcyB0byB3aGVyZSB0aGV5IHNob3VsZCBiZVxuICB3YXJwOiAtPlxuICAgIGZvciBjYXJkLGFuaW0gb2YgQGFuaW1zXG4gICAgICBhbmltLndhcnAoKVxuXG4gICMgcmVvcmRlciB0aGUgaGFuZCBiYXNlZCBvbiB0aGUgZHJhZyBsb2NhdGlvbiBvZiB0aGUgaGVsZCBjYXJkXG4gIHJlb3JkZXI6IC0+XG4gICAgcmV0dXJuIGlmIEBkcmFnSW5kZXhTdGFydCA9PSBOT19DQVJEXG4gICAgcmV0dXJuIGlmIEBjYXJkcy5sZW5ndGggPCAyICMgbm90aGluZyB0byByZW9yZGVyXG4gICAgcG9zaXRpb25zID0gQGNhbGNQb3NpdGlvbnMoQGNhcmRzLmxlbmd0aClcbiAgICBjbG9zZXN0SW5kZXggPSAwXG4gICAgY2xvc2VzdERpc3QgPSBAZ2FtZS53aWR0aCAqIEBnYW1lLmhlaWdodCAjIHNvbWV0aGluZyBpbXBvc3NpYmx5IGxhcmdlXG4gICAgZm9yIHBvcywgaW5kZXggaW4gcG9zaXRpb25zXG4gICAgICBkaXN0ID0gY2FsY0Rpc3RhbmNlU3F1YXJlZChwb3MueCwgcG9zLnksIEBkcmFnWCwgQGRyYWdZKVxuICAgICAgaWYgY2xvc2VzdERpc3QgPiBkaXN0XG4gICAgICAgIGNsb3Nlc3REaXN0ID0gZGlzdFxuICAgICAgICBjbG9zZXN0SW5kZXggPSBpbmRleFxuICAgIEBkcmFnSW5kZXhDdXJyZW50ID0gY2xvc2VzdEluZGV4XG5cbiAgc2VsZWN0ZWRDYXJkczogLT5cbiAgICBpZiBub3QgQHBpY2tpbmdcbiAgICAgIHJldHVybiBbXVxuXG4gICAgY2FyZHMgPSBbXVxuICAgIGZvciBjYXJkLCBpIGluIEBjYXJkc1xuICAgICAgaWYgQHBpY2tlZFtpXVxuICAgICAgICBhbmltID0gQGFuaW1zW2NhcmRdXG4gICAgICAgIGNhcmRzLnB1c2gge1xuICAgICAgICAgIGNhcmQ6IGNhcmRcbiAgICAgICAgICB4OiBhbmltLmN1ci54XG4gICAgICAgICAgeTogYW5pbS5jdXIueVxuICAgICAgICAgIHI6IGFuaW0uY3VyLnJcbiAgICAgICAgICBpbmRleDogaVxuICAgICAgICB9XG4gICAgcmV0dXJuIGNhcmRzXG5cbiAgZG93bjogKEBkcmFnWCwgQGRyYWdZLCBpbmRleCkgLT5cbiAgICBAdXAoQGRyYWdYLCBAZHJhZ1kpICMgZW5zdXJlIHdlIGxldCBnbyBvZiB0aGUgcHJldmlvdXMgY2FyZCBpbiBjYXNlIHRoZSBldmVudHMgYXJlIGR1bWJcbiAgICBpZiBAcGlja2luZ1xuICAgICAgQHBpY2tlZFtpbmRleF0gPSAhQHBpY2tlZFtpbmRleF1cbiAgICAgIEBwaWNrUGFpbnQgPSBAcGlja2VkW2luZGV4XVxuICAgICAgcmV0dXJuXG4gICAgQGdhbWUubG9nIFwicGlja2luZyB1cCBjYXJkIGluZGV4ICN7aW5kZXh9XCJcbiAgICBAZHJhZ0luZGV4U3RhcnQgPSBpbmRleFxuICAgIEBkcmFnSW5kZXhDdXJyZW50ID0gaW5kZXhcbiAgICBAdXBkYXRlUG9zaXRpb25zKClcblxuICBtb3ZlOiAoQGRyYWdYLCBAZHJhZ1kpIC0+XG4gICAgcmV0dXJuIGlmIEBkcmFnSW5kZXhTdGFydCA9PSBOT19DQVJEXG4gICAgI0BnYW1lLmxvZyBcImRyYWdnaW5nIGFyb3VuZCBjYXJkIGluZGV4ICN7QGRyYWdJbmRleEN1cnJlbnR9XCJcbiAgICBAcmVvcmRlcigpXG4gICAgQHVwZGF0ZVBvc2l0aW9ucygpXG5cbiAgdXA6IChAZHJhZ1gsIEBkcmFnWSkgLT5cbiAgICByZXR1cm4gaWYgQGRyYWdJbmRleFN0YXJ0ID09IE5PX0NBUkRcbiAgICBAcmVvcmRlcigpXG4gICAgaWYgQHdhbnRzVG9QbGF5RHJhZ2dlZENhcmQoKVxuICAgICAgQGdhbWUubG9nIFwidHJ5aW5nIHRvIHBsYXkgYSAje0BjYXJkc1tAZHJhZ0luZGV4U3RhcnRdfSBmcm9tIGluZGV4ICN7QGRyYWdJbmRleFN0YXJ0fVwiXG4gICAgICBjYXJkSW5kZXggPSBAZHJhZ0luZGV4U3RhcnRcbiAgICAgIGNhcmQgPSBAY2FyZHNbY2FyZEluZGV4XVxuICAgICAgYW5pbSA9IEBhbmltc1tjYXJkXVxuICAgICAgQGRyYWdJbmRleFN0YXJ0ID0gTk9fQ0FSRFxuICAgICAgQGRyYWdJbmRleEN1cnJlbnQgPSBOT19DQVJEXG4gICAgICBAZ2FtZS5wbGF5IFt7XG4gICAgICAgIGNhcmQ6IGNhcmRcbiAgICAgICAgeDogYW5pbS5jdXIueFxuICAgICAgICB5OiBhbmltLmN1ci55XG4gICAgICAgIHI6IGFuaW0uY3VyLnJcbiAgICAgICAgaW5kZXg6IGNhcmRJbmRleFxuICAgICAgfV1cbiAgICBlbHNlXG4gICAgICBAZ2FtZS5sb2cgXCJ0cnlpbmcgdG8gcmVvcmRlciAje0BjYXJkc1tAZHJhZ0luZGV4U3RhcnRdfSBpbnRvIGluZGV4ICN7QGRyYWdJbmRleEN1cnJlbnR9XCJcbiAgICAgIEBjYXJkcyA9IEBjYWxjRHJhd25IYW5kKCkgIyBpcyB0aGlzIHJpZ2h0P1xuXG4gICAgQGRyYWdJbmRleFN0YXJ0ID0gTk9fQ0FSRFxuICAgIEBkcmFnSW5kZXhDdXJyZW50ID0gTk9fQ0FSRFxuICAgIEB1cGRhdGVQb3NpdGlvbnMoKVxuXG4gIHVwZGF0ZTogKGR0KSAtPlxuICAgIHVwZGF0ZWQgPSBmYWxzZVxuICAgIGZvciBjYXJkLGFuaW0gb2YgQGFuaW1zXG4gICAgICBpZiBhbmltLnVwZGF0ZShkdClcbiAgICAgICAgdXBkYXRlZCA9IHRydWVcbiAgICByZXR1cm4gdXBkYXRlZFxuXG4gIHJlbmRlcjogLT5cbiAgICByZXR1cm4gaWYgQGNhcmRzLmxlbmd0aCA9PSAwXG4gICAgZHJhd25IYW5kID0gQGNhbGNEcmF3bkhhbmQoKVxuICAgIGZvciB2LCBpbmRleCBpbiBkcmF3bkhhbmRcbiAgICAgIGNvbnRpbnVlIGlmIHYgPT0gTk9fQ0FSRFxuICAgICAgYW5pbSA9IEBhbmltc1t2XVxuICAgICAgZG8gKGFuaW0sIGluZGV4KSA9PlxuICAgICAgICBpZiBAcGlja2luZ1xuICAgICAgICAgIGlmIEBwaWNrZWRbaW5kZXhdXG4gICAgICAgICAgICBoaWdobGlnaHRTdGF0ZSA9IEhpZ2hsaWdodC5TRUxFQ1RFRFxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGhpZ2hsaWdodFN0YXRlID0gSGlnaGxpZ2h0LlVOU0VMRUNURURcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGlmIEB3YW50c1RvUGxheURyYWdnZWRDYXJkKClcbiAgICAgICAgICAgIGlmIChpbmRleCA9PSBAZHJhZ0luZGV4Q3VycmVudClcbiAgICAgICAgICAgICAgaGlnaGxpZ2h0U3RhdGUgPSBIaWdobGlnaHQuU0VMRUNURURcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgaGlnaGxpZ2h0U3RhdGUgPSBIaWdobGlnaHQuVU5TRUxFQ1RFRFxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGhpZ2hsaWdodFN0YXRlID0gSGlnaGxpZ2h0Lk5PTkVcbiAgICAgICAgQHJlbmRlckNhcmQgdiwgYW5pbS5jdXIueCwgYW5pbS5jdXIueSwgYW5pbS5jdXIuciwgMSwgaGlnaGxpZ2h0U3RhdGUsIChjbGlja1gsIGNsaWNrWSkgPT5cbiAgICAgICAgICBAZG93bihjbGlja1gsIGNsaWNrWSwgaW5kZXgpXG5cbiAgcmVuZGVyQ2FyZDogKHYsIHgsIHksIHJvdCwgc2NhbGUsIHNlbGVjdGVkLCBjYikgLT5cbiAgICByb3QgPSAwIGlmIG5vdCByb3RcbiAgICByYW5rID0gTWF0aC5mbG9vcih2IC8gNClcbiAgICBzdWl0ID0gTWF0aC5mbG9vcih2ICUgNClcblxuICAgIGNvbCA9IHN3aXRjaCBzZWxlY3RlZFxuICAgICAgd2hlbiBIaWdobGlnaHQuTk9ORVxuICAgICAgICBbMSwgMSwgMV1cbiAgICAgIHdoZW4gSGlnaGxpZ2h0LlVOU0VMRUNURURcbiAgICAgICAgIyBbMC4zLCAwLjMsIDAuM11cbiAgICAgICAgWzEsIDEsIDFdXG4gICAgICB3aGVuIEhpZ2hsaWdodC5TRUxFQ1RFRFxuICAgICAgICBbMC41LCAwLjUsIDAuOV1cbiAgICAgIHdoZW4gSGlnaGxpZ2h0LlBJTEVcbiAgICAgICAgWzAuNiwgMC42LCAwLjZdXG5cbiAgICBAZ2FtZS5kcmF3SW1hZ2UgXCJjYXJkc1wiLFxuICAgIENBUkRfSU1BR0VfT0ZGX1ggKyAoQ0FSRF9JTUFHRV9BRFZfWCAqIHJhbmspLCBDQVJEX0lNQUdFX09GRl9ZICsgKENBUkRfSU1BR0VfQURWX1kgKiBzdWl0KSwgQ0FSRF9JTUFHRV9XLCBDQVJEX0lNQUdFX0gsXG4gICAgeCwgeSwgQGNhcmRXaWR0aCAqIHNjYWxlLCBAY2FyZEhlaWdodCAqIHNjYWxlLFxuICAgIHJvdCwgMC41LCAwLjUsIGNvbFswXSxjb2xbMV0sY29sWzJdLDEsIGNiXG5cbiAgY2FsY1Bvc2l0aW9uczogKGhhbmRTaXplKSAtPlxuICAgIGlmIEBwb3NpdGlvbkNhY2hlLmhhc093blByb3BlcnR5KGhhbmRTaXplKVxuICAgICAgcmV0dXJuIEBwb3NpdGlvbkNhY2hlW2hhbmRTaXplXVxuICAgIHJldHVybiBbXSBpZiBoYW5kU2l6ZSA9PSAwXG5cbiAgICBhZHZhbmNlID0gQGhhbmRBbmdsZSAvIGhhbmRTaXplXG4gICAgaWYgYWR2YW5jZSA+IEBoYW5kQW5nbGVBZHZhbmNlTWF4XG4gICAgICBhZHZhbmNlID0gQGhhbmRBbmdsZUFkdmFuY2VNYXhcbiAgICBhbmdsZVNwcmVhZCA9IGFkdmFuY2UgKiBoYW5kU2l6ZSAgICAgICAgICAgICAgICAjIGhvdyBtdWNoIG9mIHRoZSBhbmdsZSB3ZSBwbGFuIG9uIHVzaW5nXG4gICAgYW5nbGVMZWZ0b3ZlciA9IEBoYW5kQW5nbGUgLSBhbmdsZVNwcmVhZCAgICAgICAgIyBhbW91bnQgb2YgYW5nbGUgd2UncmUgbm90IHVzaW5nLCBhbmQgbmVlZCB0byBwYWQgc2lkZXMgd2l0aCBldmVubHlcbiAgICBjdXJyZW50QW5nbGUgPSAtMSAqIChAaGFuZEFuZ2xlIC8gMikgICAgICAgICAgICAjIG1vdmUgdG8gdGhlIGxlZnQgc2lkZSBvZiBvdXIgYW5nbGVcbiAgICBjdXJyZW50QW5nbGUgKz0gYW5nbGVMZWZ0b3ZlciAvIDIgICAgICAgICAgICAgICAjIC4uLiBhbmQgYWR2YW5jZSBwYXN0IGhhbGYgb2YgdGhlIHBhZGRpbmdcbiAgICBjdXJyZW50QW5nbGUgKz0gYWR2YW5jZSAvIDIgICAgICAgICAgICAgICAgICAgICAjIC4uLiBhbmQgY2VudGVyIHRoZSBjYXJkcyBpbiB0aGUgYW5nbGVcblxuICAgIHBvc2l0aW9ucyA9IFtdXG4gICAgZm9yIGkgaW4gWzAuLi5oYW5kU2l6ZV1cbiAgICAgIHggPSBAaGFuZENlbnRlci54IC0gTWF0aC5jb3MoKE1hdGguUEkgLyAyKSArIGN1cnJlbnRBbmdsZSkgKiBAaGFuZERpc3RhbmNlXG4gICAgICB5ID0gQGhhbmRDZW50ZXIueSAtIE1hdGguc2luKChNYXRoLlBJIC8gMikgKyBjdXJyZW50QW5nbGUpICogQGhhbmREaXN0YW5jZVxuICAgICAgY3VycmVudEFuZ2xlICs9IGFkdmFuY2VcbiAgICAgIHBvc2l0aW9ucy5wdXNoIHtcbiAgICAgICAgeDogeFxuICAgICAgICB5OiB5XG4gICAgICAgIHI6IGN1cnJlbnRBbmdsZSAtIGFkdmFuY2VcbiAgICAgIH1cblxuICAgIEBwb3NpdGlvbkNhY2hlW2hhbmRTaXplXSA9IHBvc2l0aW9uc1xuICAgIHJldHVybiBwb3NpdGlvbnNcblxubW9kdWxlLmV4cG9ydHMgPSBIYW5kXG4iLCJCdXR0b24gPSByZXF1aXJlICcuL0J1dHRvbidcblxuY2xhc3MgTWVudVxuICBjb25zdHJ1Y3RvcjogKEBnYW1lLCBAdGl0bGUsIEBiYWNrZ3JvdW5kLCBAY29sb3IsIEBhY3Rpb25zKSAtPlxuICAgIEBidXR0b25zID0gW11cbiAgICBAYnV0dG9uTmFtZXMgPSBbXCJidXR0b24wXCIsIFwiYnV0dG9uMVwiXVxuXG4gICAgYnV0dG9uU2l6ZSA9IEBnYW1lLmhlaWdodCAvIDE1XG4gICAgQGJ1dHRvblN0YXJ0WSA9IEBnYW1lLmhlaWdodCAvIDVcblxuICAgIHNsaWNlID0gKEBnYW1lLmhlaWdodCAtIEBidXR0b25TdGFydFkpIC8gKEBhY3Rpb25zLmxlbmd0aCArIDEpXG4gICAgY3VyclkgPSBAYnV0dG9uU3RhcnRZICsgc2xpY2VcbiAgICBmb3IgYWN0aW9uIGluIEBhY3Rpb25zXG4gICAgICBidXR0b24gPSBuZXcgQnV0dG9uKEBnYW1lLCBAYnV0dG9uTmFtZXMsIEBnYW1lLmZvbnQsIGJ1dHRvblNpemUsIEBnYW1lLmNlbnRlci54LCBjdXJyWSwgYWN0aW9uKVxuICAgICAgQGJ1dHRvbnMucHVzaCBidXR0b25cbiAgICAgIGN1cnJZICs9IHNsaWNlXG5cbiAgdXBkYXRlOiAoZHQpIC0+XG4gICAgdXBkYXRlZCA9IGZhbHNlXG4gICAgZm9yIGJ1dHRvbiBpbiBAYnV0dG9uc1xuICAgICAgaWYgYnV0dG9uLnVwZGF0ZShkdClcbiAgICAgICAgdXBkYXRlZCA9IHRydWVcbiAgICByZXR1cm4gdXBkYXRlZFxuXG4gIHJlbmRlcjogLT5cbiAgICBAZ2FtZS5zcHJpdGVSZW5kZXJlci5yZW5kZXIgQGJhY2tncm91bmQsIDAsIDAsIEBnYW1lLndpZHRoLCBAZ2FtZS5oZWlnaHQsIDAsIDAsIDAsIEBjb2xvclxuICAgIEBnYW1lLmZvbnRSZW5kZXJlci5yZW5kZXIgQGdhbWUuZm9udCwgQGdhbWUuaGVpZ2h0IC8gMjUsIFwiQnVpbGQ6ICN7QGdhbWUudmVyc2lvbn1cIiwgMCwgQGdhbWUuaGVpZ2h0LCAwLCAxLCBAZ2FtZS5jb2xvcnMubGlnaHRncmF5XG4gICAgdGl0bGVIZWlnaHQgPSBAZ2FtZS5oZWlnaHQgLyA4XG4gICAgdGl0bGVPZmZzZXQgPSBAYnV0dG9uU3RhcnRZID4+IDFcbiAgICBAZ2FtZS5mb250UmVuZGVyZXIucmVuZGVyIEBnYW1lLmZvbnQsIHRpdGxlSGVpZ2h0LCBAdGl0bGUsIEBnYW1lLmNlbnRlci54LCB0aXRsZU9mZnNldCwgMC41LCAwLjUsIEBnYW1lLmNvbG9ycy53aGl0ZVxuICAgIGZvciBidXR0b24gaW4gQGJ1dHRvbnNcbiAgICAgIGJ1dHRvbi5yZW5kZXIoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1lbnVcbiIsIkFuaW1hdGlvbiA9IHJlcXVpcmUgJy4vQW5pbWF0aW9uJ1xuSGFuZCA9IHJlcXVpcmUgJy4vSGFuZCdcblxuU0VUVExFX01TID0gMTAwMFxuXG5jbGFzcyBQaWxlXG4gIGNvbnN0cnVjdG9yOiAoQGdhbWUsIEBoYW5kKSAtPlxuICAgIEBwbGF5SUQgPSAtMVxuICAgIEBwbGF5cyA9IFtdXG4gICAgQGFuaW1zID0ge31cbiAgICBAc2V0dGxlVGltZXIgPSAwXG4gICAgQHRocm93bkNvbG9yID0geyByOiAxLCBnOiAxLCBiOiAwLCBhOiAxfVxuICAgIEBzY2FsZSA9IDAuNlxuXG4gICAgIyAxLjAgaXMgbm90IG1lc3N5IGF0IGFsbCwgYXMgeW91IGFwcHJvYWNoIDAgaXQgc3RhcnRzIHRvIGFsbCBwaWxlIG9uIG9uZSBhbm90aGVyXG4gICAgbWVzc3kgPSAwLjJcblxuICAgIEBwbGF5Q2FyZFNwYWNpbmcgPSAwLjFcblxuICAgIGNlbnRlclggPSBAZ2FtZS5jZW50ZXIueFxuICAgIGNlbnRlclkgPSBAZ2FtZS5jZW50ZXIueVxuICAgIG9mZnNldFggPSBAaGFuZC5jYXJkV2lkdGggKiBtZXNzeSAqIEBzY2FsZVxuICAgIG9mZnNldFkgPSBAaGFuZC5jYXJkSGFsZkhlaWdodCAqIG1lc3N5ICogQHNjYWxlXG4gICAgQHBsYXlMb2NhdGlvbnMgPSBbXG4gICAgICB7IHg6IGNlbnRlclgsIHk6IGNlbnRlclkgKyBvZmZzZXRZIH0gIyBib3R0b21cbiAgICAgIHsgeDogY2VudGVyWCAtIG9mZnNldFgsIHk6IGNlbnRlclkgfSAjIGxlZnRcbiAgICAgIHsgeDogY2VudGVyWCwgeTogY2VudGVyWSAtIG9mZnNldFkgfSAjIHRvcFxuICAgICAgeyB4OiBjZW50ZXJYICsgb2Zmc2V0WCwgeTogY2VudGVyWSB9ICMgcmlnaHRcbiAgICBdXG4gICAgQHRocm93TG9jYXRpb25zID0gW1xuICAgICAgeyB4OiBjZW50ZXJYLCB5OiBAZ2FtZS5oZWlnaHQgfSAjIGJvdHRvbVxuICAgICAgeyB4OiAwLCB5OiBjZW50ZXJZICsgb2Zmc2V0WSB9ICMgbGVmdFxuICAgICAgeyB4OiBjZW50ZXJYLCB5OiAwIH0gIyB0b3BcbiAgICAgIHsgeDogQGdhbWUud2lkdGgsIHk6IGNlbnRlclkgKyBvZmZzZXRZIH0gIyByaWdodFxuICAgIF1cblxuICBzZXQ6IChwaWxlSUQsIHBpbGUsIHBpbGVXaG8pIC0+XG4gICAgaWYgQHBsYXlJRCAhPSBwaWxlSURcbiAgICAgIEBwbGF5SUQgPSBwaWxlSURcbiAgICAgIEBwbGF5cy5wdXNoIHtcbiAgICAgICAgY2FyZHM6IHBpbGUuc2xpY2UoMClcbiAgICAgICAgd2hvOiBwaWxlV2hvXG4gICAgICB9XG4gICAgICBAc2V0dGxlVGltZXIgPSBTRVRUTEVfTVNcblxuICAgICMgaWYgKEBwbGF5SUQgIT0gcGlsZUlEKSBhbmQgKHRocm93bi5sZW5ndGggPiAwKVxuICAgICMgICBAcGxheXMgPSB0aHJvd24uc2xpY2UoMCkgIyB0aGUgcGlsZSBoYXMgYmVjb21lIHRoZSB0aHJvd24sIHN0YXNoIGl0IG9mZiBvbmUgbGFzdCB0aW1lXG4gICAgIyAgIEBwbGF5V2hvID0gdGhyb3duV2hvLnNsaWNlKDApXG4gICAgIyAgIEBwbGF5SUQgPSBwaWxlSURcbiAgICAjICAgQHNldHRsZVRpbWVyID0gU0VUVExFX01TXG5cbiAgICAjICMgZG9uJ3Qgc3RvbXAgdGhlIHBpbGUgd2UncmUgZHJhd2luZyB1bnRpbCBpdCBpcyBkb25lIHNldHRsaW5nIGFuZCBjYW4gZmx5IG9mZiB0aGUgc2NyZWVuXG4gICAgIyBpZiBAc2V0dGxlVGltZXIgPT0gMFxuICAgICMgICBAcGxheXMgPSBwaWxlLnNsaWNlKDApXG4gICAgIyAgIEBwbGF5V2hvID0gcGlsZVdoby5zbGljZSgwKVxuICAgICMgICBAdGhyb3duID0gdGhyb3duLnNsaWNlKDApXG4gICAgIyAgIEB0aHJvd25XaG8gPSB0aHJvd25XaG8uc2xpY2UoMClcbiAgICAjICAgQHRocm93blRha2VyID0gdGhyb3duVGFrZXJcblxuICAgIEBzeW5jQW5pbXMoKVxuXG4gIGhpbnQ6IChjYXJkcykgLT5cbiAgICBmb3IgY2FyZCBpbiBjYXJkc1xuICAgICAgQGFuaW1zW2NhcmQuY2FyZF0gPSBuZXcgQW5pbWF0aW9uIHtcbiAgICAgICAgc3BlZWQ6IEBoYW5kLmNhcmRTcGVlZFxuICAgICAgICB4OiBjYXJkLnhcbiAgICAgICAgeTogY2FyZC55XG4gICAgICAgIHI6IGNhcmQuclxuICAgICAgICBzOiAxXG4gICAgICB9XG5cbiAgc3luY0FuaW1zOiAtPlxuICAgIHNlZW4gPSB7fVxuICAgIGxvY2F0aW9ucyA9IEB0aHJvd0xvY2F0aW9uc1xuICAgIGZvciBwbGF5IGluIEBwbGF5c1xuICAgICAgZm9yIGNhcmQsIGluZGV4IGluIHBsYXkuY2FyZHNcbiAgICAgICAgc2VlbltjYXJkXSsrXG4gICAgICAgIGlmIG5vdCBAYW5pbXNbY2FyZF1cbiAgICAgICAgICB3aG8gPSBwbGF5Lndob1xuICAgICAgICAgIGxvY2F0aW9uID0gbG9jYXRpb25zW3dob11cbiAgICAgICAgICBAYW5pbXNbY2FyZF0gPSBuZXcgQW5pbWF0aW9uIHtcbiAgICAgICAgICAgIHNwZWVkOiBAaGFuZC5jYXJkU3BlZWRcbiAgICAgICAgICAgIHg6IGxvY2F0aW9uLnhcbiAgICAgICAgICAgIHk6IGxvY2F0aW9uLnlcbiAgICAgICAgICAgIHI6IC0xICogTWF0aC5QSSAvIDRcbiAgICAgICAgICAgIHM6IEBzY2FsZVxuICAgICAgICAgIH1cblxuICAgIHRvUmVtb3ZlID0gW11cbiAgICBmb3IgY2FyZCxhbmltIG9mIEBhbmltc1xuICAgICAgaWYgbm90IHNlZW4uaGFzT3duUHJvcGVydHkoY2FyZClcbiAgICAgICAgdG9SZW1vdmUucHVzaCBjYXJkXG4gICAgZm9yIGNhcmQgaW4gdG9SZW1vdmVcbiAgICAgICMgQGdhbWUubG9nIFwicmVtb3ZpbmcgYW5pbSBmb3IgI3tjYXJkfVwiXG4gICAgICBkZWxldGUgQGFuaW1zW2NhcmRdXG5cbiAgICBAdXBkYXRlUG9zaXRpb25zKClcblxuICB1cGRhdGVQb3NpdGlvbnM6IC0+XG4gICAgbG9jYXRpb25zID0gQHBsYXlMb2NhdGlvbnNcbiAgICBmb3IgcGxheSwgcGxheUluZGV4IGluIEBwbGF5c1xuICAgICAgZm9yIHYsIGluZGV4IGluIHBsYXkuY2FyZHNcbiAgICAgICAgYW5pbSA9IEBhbmltc1t2XVxuICAgICAgICBsb2MgPSBwbGF5Lndob1xuICAgICAgICBhbmltLnJlcS54ID0gbG9jYXRpb25zW2xvY10ueCArIChpbmRleCAqIEBoYW5kLmNhcmRXaWR0aCAqIEBwbGF5Q2FyZFNwYWNpbmcpXG4gICAgICAgIGFuaW0ucmVxLnkgPSBsb2NhdGlvbnNbbG9jXS55XG4gICAgICAgIGFuaW0ucmVxLnIgPSAwLjIgKiBNYXRoLmNvcyhwbGF5SW5kZXggLyAwLjEpXG4gICAgICAgIGFuaW0ucmVxLnMgPSBAc2NhbGVcblxuICByZWFkeUZvck5leHRUcmljazogLT5cbiAgICByZXR1cm4gKEBzZXR0bGVUaW1lciA9PSAwKVxuXG4gIHVwZGF0ZTogKGR0KSAtPlxuICAgIHVwZGF0ZWQgPSBmYWxzZVxuXG4gICAgaWYgQHNldHRsZVRpbWVyID4gMFxuICAgICAgdXBkYXRlZCA9IHRydWVcbiAgICAgIEBzZXR0bGVUaW1lciAtPSBkdFxuICAgICAgaWYgQHNldHRsZVRpbWVyIDwgMFxuICAgICAgICBAc2V0dGxlVGltZXIgPSAwXG5cbiAgICBmb3IgY2FyZCxhbmltIG9mIEBhbmltc1xuICAgICAgaWYgYW5pbS51cGRhdGUoZHQpXG4gICAgICAgIHVwZGF0ZWQgPSB0cnVlXG5cbiAgICByZXR1cm4gdXBkYXRlZFxuXG4gICMgdXNlZCBieSB0aGUgZ2FtZSBvdmVyIHNjcmVlbi4gSXQgcmV0dXJucyB0cnVlIHdoZW4gbmVpdGhlciB0aGUgcGlsZSBub3IgdGhlIGxhc3QgdGhyb3duIGFyZSBtb3ZpbmdcbiAgcmVzdGluZzogLT5cbiAgICBmb3IgY2FyZCxhbmltIG9mIEBhbmltc1xuICAgICAgaWYgYW5pbS5hbmltYXRpbmcoKVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICBpZiBAc2V0dGxlVGltZXIgPiAwXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICByZXR1cm4gdHJ1ZVxuXG4gIHJlbmRlcjogLT5cbiAgICBmb3IgcGxheSwgcGxheUluZGV4IGluIEBwbGF5c1xuICAgICAgaGlnaGxpZ2h0ID0gSGFuZC5IaWdobGlnaHQuUElMRVxuICAgICAgaWYgcGxheUluZGV4ID09IChAcGxheXMubGVuZ3RoIC0gMSlcbiAgICAgICAgaGlnaGxpZ2h0ID0gSGFuZC5IaWdobGlnaHQuTk9ORVxuICAgICAgZm9yIHYsIGluZGV4IGluIHBsYXkuY2FyZHNcbiAgICAgICAgYW5pbSA9IEBhbmltc1t2XVxuICAgICAgICBAaGFuZC5yZW5kZXJDYXJkIHYsIGFuaW0uY3VyLngsIGFuaW0uY3VyLnksIGFuaW0uY3VyLnIsIGFuaW0uY3VyLnMsIGhpZ2hsaWdodFxuXG5tb2R1bGUuZXhwb3J0cyA9IFBpbGVcbiIsImNsYXNzIFNwcml0ZVJlbmRlcmVyXG4gIGNvbnN0cnVjdG9yOiAoQGdhbWUpIC0+XG4gICAgQHNwcml0ZXMgPVxuICAgICAgIyBnZW5lcmljIHNwcml0ZXNcbiAgICAgIHNvbGlkOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6ICA1NSwgeTogNzIzLCB3OiAgMTAsIGg6ICAxMCB9XG4gICAgICBwYXVzZTogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA2MDIsIHk6IDcwNywgdzogMTIyLCBoOiAxMjUgfVxuICAgICAgYnV0dG9uMDogICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogMTQwLCB5OiA3NzcsIHc6IDQyMiwgaDogIDY1IH1cbiAgICAgIGJ1dHRvbjE6ICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDE0MCwgeTogNjk4LCB3OiA0MjIsIGg6ICA2NSB9XG4gICAgICBwbHVzMDogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA3NDUsIHk6IDY2NCwgdzogMTE2LCBoOiAxMTggfVxuICAgICAgcGx1czE6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogNzQ1LCB5OiA4MjAsIHc6IDExNiwgaDogMTE4IH1cbiAgICAgIG1pbnVzMDogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDg5NSwgeTogNjY0LCB3OiAxMTYsIGg6IDExOCB9XG4gICAgICBtaW51czE6ICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA4OTUsIHk6IDgyMCwgdzogMTE2LCBoOiAxMTggfVxuICAgICAgYXJyb3dMOiAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogIDMzLCB5OiA4NTgsIHc6IDIwNCwgaDogMTU2IH1cbiAgICAgIGFycm93UjogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDIzOSwgeTogODUyLCB3OiAyMDgsIGg6IDE1NSB9XG4gICAgICBwaWxlOiAgICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA1MTMsIHk6IDg3NSwgdzogMTI4LCBoOiAxMjggfVxuXG4gICAgICAjIG1lbnUgYmFja2dyb3VuZHNcbiAgICAgIG1haW5tZW51OiAgeyB0ZXh0dXJlOiBcIm1haW5tZW51XCIsICB4OiAwLCB5OiAwLCB3OiAxMjgwLCBoOiA3MjAgfVxuICAgICAgcGF1c2VtZW51OiB7IHRleHR1cmU6IFwicGF1c2VtZW51XCIsIHg6IDAsIHk6IDAsIHc6IDEyODAsIGg6IDcyMCB9XG5cbiAgICAgICMgaG93dG9cbiAgICAgIGhvd3RvMTogICAgeyB0ZXh0dXJlOiBcImhvd3RvMVwiLCAgeDogMCwgeTogIDAsIHc6IDE5MjAsIGg6IDEwODAgfVxuICAgICAgaG93dG8yOiAgICB7IHRleHR1cmU6IFwiaG93dG8yXCIsICB4OiAwLCB5OiAgMCwgdzogMTkyMCwgaDogMTA4MCB9XG4gICAgICBob3d0bzM6ICAgIHsgdGV4dHVyZTogXCJob3d0bzNcIiwgIHg6IDAsIHk6ICAwLCB3OiAxOTIwLCBoOiAxMDgwIH1cblxuICAgICAgIyBjaGFyYWN0ZXJzXG4gICAgICBtYXJpbzogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAgMjAsIHk6ICAgMCwgdzogMTUxLCBoOiAzMDggfVxuICAgICAgbHVpZ2k6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogMTcxLCB5OiAgIDAsIHc6IDE1MSwgaDogMzA4IH1cbiAgICAgIHBlYWNoOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDMzNSwgeTogICAwLCB3OiAxNjQsIGg6IDMwOCB9XG4gICAgICBkYWlzeTogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA1MDQsIHk6ICAgMCwgdzogMTY0LCBoOiAzMDggfVxuICAgICAgeW9zaGk6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogNjY4LCB5OiAgIDAsIHc6IDE4MCwgaDogMzA4IH1cbiAgICAgIHRvYWQ6ICAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDg0OSwgeTogICAwLCB3OiAxNTcsIGg6IDMwOCB9XG4gICAgICBib3dzZXI6ICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAgMTEsIHk6IDMyMiwgdzogMTUxLCBoOiAzMDggfVxuICAgICAgYm93c2VyanI6ICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogMjI1LCB5OiAzMjIsIHc6IDE0NCwgaDogMzA4IH1cbiAgICAgIGtvb3BhOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDM3MiwgeTogMzIyLCB3OiAxMjgsIGg6IDMwOCB9XG4gICAgICByb3NhbGluYTogIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA1MDAsIHk6IDMyMiwgdzogMTczLCBoOiAzMDggfVxuICAgICAgc2h5Z3V5OiAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogNjkxLCB5OiAzMjIsIHc6IDE1NCwgaDogMzA4IH1cbiAgICAgIHRvYWRldHRlOiAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDg0NywgeTogMzIyLCB3OiAxNTgsIGg6IDMwOCB9XG5cbiAgY2FsY1dpZHRoOiAoc3ByaXRlTmFtZSwgaGVpZ2h0KSAtPlxuICAgIHNwcml0ZSA9IEBzcHJpdGVzW3Nwcml0ZU5hbWVdXG4gICAgcmV0dXJuIDEgaWYgbm90IHNwcml0ZVxuICAgIHJldHVybiBoZWlnaHQgKiBzcHJpdGUudyAvIHNwcml0ZS5oXG5cbiAgcmVuZGVyOiAoc3ByaXRlTmFtZSwgZHgsIGR5LCBkdywgZGgsIHJvdCwgYW5jaG9yeCwgYW5jaG9yeSwgY29sb3IsIGNiKSAtPlxuICAgIHNwcml0ZSA9IEBzcHJpdGVzW3Nwcml0ZU5hbWVdXG4gICAgcmV0dXJuIGlmIG5vdCBzcHJpdGVcbiAgICBpZiAoZHcgPT0gMCkgYW5kIChkaCA9PSAwKVxuICAgICAgIyB0aGlzIHByb2JhYmx5IHNob3VsZG4ndCBldmVyIGJlIHVzZWQuXG4gICAgICBkdyA9IHNwcml0ZS54XG4gICAgICBkaCA9IHNwcml0ZS55XG4gICAgZWxzZSBpZiBkdyA9PSAwXG4gICAgICBkdyA9IGRoICogc3ByaXRlLncgLyBzcHJpdGUuaFxuICAgIGVsc2UgaWYgZGggPT0gMFxuICAgICAgZGggPSBkdyAqIHNwcml0ZS5oIC8gc3ByaXRlLndcbiAgICBAZ2FtZS5kcmF3SW1hZ2Ugc3ByaXRlLnRleHR1cmUsIHNwcml0ZS54LCBzcHJpdGUueSwgc3ByaXRlLncsIHNwcml0ZS5oLCBkeCwgZHksIGR3LCBkaCwgcm90LCBhbmNob3J4LCBhbmNob3J5LCBjb2xvci5yLCBjb2xvci5nLCBjb2xvci5iLCBjb2xvci5hLCBjYlxuICAgIHJldHVyblxuXG5tb2R1bGUuZXhwb3J0cyA9IFNwcml0ZVJlbmRlcmVyXG4iLCJNSU5fUExBWUVSUyA9IDNcbk1BWF9MT0dfTElORVMgPSA2XG5PSyA9ICdPSydcblxuU3VpdCA9XG4gIE5PTkU6IC0xXG4gIFNQQURFUzogMFxuICBDTFVCUzogMVxuICBESUFNT05EUzogMlxuICBIRUFSVFM6IDNcblxuU3VpdE5hbWUgPSBbJ1NwYWRlcycsICdDbHVicycsICdEaWFtb25kcycsICdIZWFydHMnXVxuU2hvcnRTdWl0TmFtZSA9IFsnUycsICdDJywgJ0QnLCAnSCddXG5HbHlwaFN1aXROYW1lID0gW1wiXFx4YzhcIiwgXCJcXHhjOVwiLCBcIlxceGNhXCIsIFwiXFx4Y2JcIl1cblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQUkgTmFtZSBHZW5lcmF0b3JcblxuYWlDaGFyYWN0ZXJMaXN0ID0gW1xuICB7IGlkOiBcIm1hcmlvXCIsICAgIG5hbWU6IFwiTWFyaW9cIiwgICAgICBzcHJpdGU6IFwibWFyaW9cIiwgICAgYnJhaW46IFwibm9ybWFsXCIgfVxuICB7IGlkOiBcImx1aWdpXCIsICAgIG5hbWU6IFwiTHVpZ2lcIiwgICAgICBzcHJpdGU6IFwibHVpZ2lcIiwgICAgYnJhaW46IFwibm9ybWFsXCIgfVxuICB7IGlkOiBcInBlYWNoXCIsICAgIG5hbWU6IFwiUGVhY2hcIiwgICAgICBzcHJpdGU6IFwicGVhY2hcIiwgICAgYnJhaW46IFwibm9ybWFsXCIgfVxuICB7IGlkOiBcImRhaXN5XCIsICAgIG5hbWU6IFwiRGFpc3lcIiwgICAgICBzcHJpdGU6IFwiZGFpc3lcIiwgICAgYnJhaW46IFwibm9ybWFsXCIgfVxuICB7IGlkOiBcInlvc2hpXCIsICAgIG5hbWU6IFwiWW9zaGlcIiwgICAgICBzcHJpdGU6IFwieW9zaGlcIiwgICAgYnJhaW46IFwibm9ybWFsXCIgfVxuICB7IGlkOiBcInRvYWRcIiwgICAgIG5hbWU6IFwiVG9hZFwiLCAgICAgICBzcHJpdGU6IFwidG9hZFwiLCAgICAgYnJhaW46IFwibm9ybWFsXCIgfVxuICB7IGlkOiBcImJvd3NlclwiLCAgIG5hbWU6IFwiQm93c2VyXCIsICAgICBzcHJpdGU6IFwiYm93c2VyXCIsICAgYnJhaW46IFwibm9ybWFsXCIgfVxuICB7IGlkOiBcImJvd3NlcmpyXCIsIG5hbWU6IFwiQm93c2VyIEpyXCIsICBzcHJpdGU6IFwiYm93c2VyanJcIiwgYnJhaW46IFwibm9ybWFsXCIgfVxuICB7IGlkOiBcImtvb3BhXCIsICAgIG5hbWU6IFwiS29vcGFcIiwgICAgICBzcHJpdGU6IFwia29vcGFcIiwgICAgYnJhaW46IFwibm9ybWFsXCIgfVxuICB7IGlkOiBcInJvc2FsaW5hXCIsIG5hbWU6IFwiUm9zYWxpbmFcIiwgICBzcHJpdGU6IFwicm9zYWxpbmFcIiwgYnJhaW46IFwibm9ybWFsXCIgfVxuICB7IGlkOiBcInNoeWd1eVwiLCAgIG5hbWU6IFwiU2h5Z3V5XCIsICAgICBzcHJpdGU6IFwic2h5Z3V5XCIsICAgYnJhaW46IFwibm9ybWFsXCIgfVxuICB7IGlkOiBcInRvYWRldHRlXCIsIG5hbWU6IFwiVG9hZGV0dGVcIiwgICBzcHJpdGU6IFwidG9hZGV0dGVcIiwgYnJhaW46IFwibm9ybWFsXCIgfVxuXVxuXG5haUNoYXJhY3RlcnMgPSB7fVxuZm9yIGNoYXJhY3RlciBpbiBhaUNoYXJhY3Rlckxpc3RcbiAgYWlDaGFyYWN0ZXJzW2NoYXJhY3Rlci5pZF0gPSBjaGFyYWN0ZXJcblxucmFuZG9tQ2hhcmFjdGVyID0gLT5cbiAgciA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGFpQ2hhcmFjdGVyTGlzdC5sZW5ndGgpXG4gIHJldHVybiBhaUNoYXJhY3Rlckxpc3Rbcl1cblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQ2FyZFxuXG5jbGFzcyBDYXJkXG4gIGNvbnN0cnVjdG9yOiAoQHJhdykgLT5cbiAgICBAc3VpdCAgPSBNYXRoLmZsb29yKEByYXcgJSA0KVxuICAgIEB2YWx1ZSA9IE1hdGguZmxvb3IoQHJhdyAvIDQpXG4gICAgQHZhbHVlTmFtZSA9IHN3aXRjaCBAdmFsdWVcbiAgICAgIHdoZW4gIDggdGhlbiAnSidcbiAgICAgIHdoZW4gIDkgdGhlbiAnUSdcbiAgICAgIHdoZW4gMTAgdGhlbiAnSydcbiAgICAgIHdoZW4gMTEgdGhlbiAnQSdcbiAgICAgIHdoZW4gMTIgdGhlbiAnMidcbiAgICAgIGVsc2VcbiAgICAgICAgU3RyaW5nKEB2YWx1ZSArIDMpXG4gICAgQG5hbWUgPSBAdmFsdWVOYW1lICsgU2hvcnRTdWl0TmFtZVtAc3VpdF1cbiAgICAjIGNvbnNvbGUubG9nIFwiI3tAcmF3fSAtPiAje0BuYW1lfVwiXG4gIGdseXBoZWROYW1lOiAtPlxuICAgIHJldHVybiBAdmFsdWVOYW1lICsgR2x5cGhTdWl0TmFtZVtAc3VpdF1cblxuY2FyZHNUb1N0cmluZyA9IChyYXdDYXJkcykgLT5cbiAgY2FyZE5hbWVzID0gW11cbiAgZm9yIHJhdyBpbiByYXdDYXJkc1xuICAgIGNhcmQgPSBuZXcgQ2FyZChyYXcpXG4gICAgY2FyZE5hbWVzLnB1c2ggY2FyZC5uYW1lXG4gIHJldHVybiBcIlsgXCIgKyBjYXJkTmFtZXMuam9pbignLCcpICsgXCIgXVwiXG5cbnBsYXlUeXBlVG9TdHJpbmcgPSAodHlwZSkgLT5cbiAgaWYgbWF0Y2hlcyA9IHR5cGUubWF0Y2goL15yb3AoXFxkKykvKVxuICAgIHJldHVybiBcIlJ1biBvZiAje21hdGNoZXNbMV19IFBhaXJzXCJcbiAgaWYgbWF0Y2hlcyA9IHR5cGUubWF0Y2goL15ydW4oXFxkKykvKVxuICAgIHJldHVybiBcIlJ1biBvZiAje21hdGNoZXNbMV19XCJcbiAgaWYgbWF0Y2hlcyA9IHR5cGUubWF0Y2goL15raW5kKFxcZCspLylcbiAgICBpZiBtYXRjaGVzWzFdID09ICcxJ1xuICAgICAgcmV0dXJuICdTaW5nbGUnXG4gICAgaWYgbWF0Y2hlc1sxXSA9PSAnMidcbiAgICAgIHJldHVybiAnUGFpcidcbiAgICBpZiBtYXRjaGVzWzFdID09ICczJ1xuICAgICAgcmV0dXJuICdUcmlwcydcbiAgICByZXR1cm4gJ1F1YWRzJ1xuICByZXR1cm4gdHlwZVxuXG5wbGF5VG9TdHJpbmcgPSAocGxheSkgLT5cbiAgaGlnaENhcmQgPSBuZXcgQ2FyZChwbGF5LmhpZ2gpXG4gIHJldHVybiBcIiN7cGxheVR5cGVUb1N0cmluZyhwbGF5LnR5cGUpfSAtICN7aGlnaENhcmQuZ2x5cGhlZE5hbWUoKX1cIlxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBEZWNrXG5cbmNsYXNzIFNodWZmbGVkRGVja1xuICBjb25zdHJ1Y3RvcjogLT5cbiAgICAjIGRhdCBpbnNpZGUtb3V0IHNodWZmbGUhXG4gICAgQGNhcmRzID0gWyAwIF1cbiAgICBmb3IgaSBpbiBbMS4uLjUyXVxuICAgICAgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGkpXG4gICAgICBAY2FyZHMucHVzaChAY2FyZHNbal0pXG4gICAgICBAY2FyZHNbal0gPSBpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIFRoaXJ0ZWVuXG5cbmNsYXNzIFRoaXJ0ZWVuXG4gIGNvbnN0cnVjdG9yOiAoQGdhbWUsIHBhcmFtcykgLT5cbiAgICByZXR1cm4gaWYgbm90IHBhcmFtc1xuXG4gICAgaWYgcGFyYW1zLnN0YXRlXG4gICAgICBmb3Igayx2IG9mIHBhcmFtcy5zdGF0ZVxuICAgICAgICBpZiBwYXJhbXMuc3RhdGUuaGFzT3duUHJvcGVydHkoaylcbiAgICAgICAgICB0aGlzW2tdID0gcGFyYW1zLnN0YXRlW2tdXG4gICAgZWxzZVxuICAgICAgIyBuZXcgZ2FtZVxuICAgICAgQGxvZyA9IFtdXG4gICAgICBAc3RyZWFrID0gMFxuICAgICAgQGxhc3RTdHJlYWsgPSAwXG5cbiAgICAgIEBwbGF5ZXJzID0gW1xuICAgICAgICB7IGlkOiAxLCBuYW1lOiAnUGxheWVyJywgaW5kZXg6IDAsIHBhc3M6IGZhbHNlIH1cbiAgICAgIF1cblxuICAgICAgZm9yIGkgaW4gWzEuLi40XVxuICAgICAgICBAYWRkQUkoKVxuXG4gICAgICBAZGVhbCgpXG5cbiAgZGVhbDogKHBhcmFtcykgLT5cbiAgICBkZWNrID0gbmV3IFNodWZmbGVkRGVjaygpXG4gICAgZm9yIHBsYXllciwgcGxheWVySW5kZXggaW4gQHBsYXllcnNcbiAgICAgIEBnYW1lLmxvZyBcImRlYWxpbmcgMTMgY2FyZHMgdG8gcGxheWVyICN7cGxheWVySW5kZXh9XCJcblxuICAgICAgcGxheWVyLmhhbmQgPSBbXVxuICAgICAgZm9yIGogaW4gWzAuLi4xM11cbiAgICAgICAgcmF3ID0gZGVjay5jYXJkcy5zaGlmdCgpXG4gICAgICAgIGlmIHJhdyA9PSAwXG4gICAgICAgICAgQHR1cm4gPSBwbGF5ZXJJbmRleFxuICAgICAgICBwbGF5ZXIuaGFuZC5wdXNoKHJhdylcblxuICAgICAgY29uc29sZS5sb2cgXCJAZ2FtZS5vcHRpb25zLnNvcnRJbmRleCAje0BnYW1lLm9wdGlvbnMuc29ydEluZGV4fVwiXG4gICAgICBpZiAoQGdhbWUub3B0aW9ucy5zb3J0SW5kZXggPT0gMCkgb3IgcGxheWVyLmFpXG4gICAgICAgICMgTm9ybWFsXG4gICAgICAgIHBsYXllci5oYW5kLnNvcnQgKGEsYikgLT4gcmV0dXJuIGEgLSBiXG4gICAgICBlbHNlXG4gICAgICAgICMgUmV2ZXJzZVxuICAgICAgICBwbGF5ZXIuaGFuZC5zb3J0IChhLGIpIC0+IHJldHVybiBiIC0gYVxuXG4gICAgQHBpbGUgPSBbXVxuICAgIEBwaWxlV2hvID0gLTFcbiAgICBAdGhyb3dJRCA9IDBcbiAgICBAY3VycmVudFBsYXkgPSBudWxsXG4gICAgQHVucGFzc0FsbCgpXG5cbiAgICBAb3V0cHV0KCdIYW5kIGRlYWx0LCAnICsgQHBsYXllcnNbQHR1cm5dLm5hbWUgKyAnIHBsYXlzIGZpcnN0JylcblxuICAgIHJldHVybiBPS1xuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgVGhpcnRlZW4gbWV0aG9kc1xuXG4gIHNhdmU6IC0+XG4gICAgbmFtZXMgPSBcImxvZyBwbGF5ZXJzIHR1cm4gcGlsZSBwaWxlV2hvIHRocm93SUQgY3VycmVudFBsYXkgc3RyZWFrIGxhc3RTdHJlYWtcIi5zcGxpdChcIiBcIilcbiAgICBzdGF0ZSA9IHt9XG4gICAgZm9yIG5hbWUgaW4gbmFtZXNcbiAgICAgIHN0YXRlW25hbWVdID0gdGhpc1tuYW1lXVxuICAgIHJldHVybiBzdGF0ZVxuXG4gIG91dHB1dDogKHRleHQpIC0+XG4gICAgQGxvZy5wdXNoIHRleHRcbiAgICB3aGlsZSBAbG9nLmxlbmd0aCA+IE1BWF9MT0dfTElORVNcbiAgICAgIEBsb2cuc2hpZnQoKVxuXG4gIGhlYWRsaW5lOiAtPlxuICAgIGlmIEB3aW5uZXIoKSAhPSBudWxsXG4gICAgICByZXR1cm4gXCJHYW1lIE92ZXJcIlxuXG4gICAgaWYgQHBpbGUubGVuZ3RoID09IDBcbiAgICAgIHBsYXlTdHJpbmcgPSBcInRocm93IEFueXRoaW5nIHdpdGggdGhlIDNcXHhjOFwiXG4gICAgZWxzZVxuICAgICAgaWYgQGN1cnJlbnRQbGF5XG4gICAgICAgIHBsYXlTdHJpbmcgPSBcImJlYXQgXCIgKyBwbGF5VG9TdHJpbmcoQGN1cnJlbnRQbGF5KVxuICAgICAgZWxzZVxuICAgICAgICBwbGF5U3RyaW5nID0gXCJ0aHJvdyBBbnl0aGluZ1wiXG5cbiAgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxuICAgIGlmIGN1cnJlbnRQbGF5ZXIuYWlcbiAgICAgIHBsYXllckNvbG9yID0gJ2IwYjAwMCdcbiAgICBlbHNlXG4gICAgICBwbGF5ZXJDb2xvciA9ICdmZjc3MDAnXG4gICAgaGVhZGxpbmUgPSBcImAje3BsYXllckNvbG9yfWAje2N1cnJlbnRQbGF5ZXIubmFtZX1gZmZmZmZmYCB0byAje3BsYXlTdHJpbmd9XCJcbiAgICByZXR1cm4gaGVhZGxpbmVcblxuICBmaW5kUGxheWVyOiAoaWQpIC0+XG4gICAgZm9yIHBsYXllciBpbiBAcGxheWVyc1xuICAgICAgaWYgcGxheWVyLmlkID09IGlkXG4gICAgICAgIHJldHVybiBwbGF5ZXJcbiAgICByZXR1cm4gdW5kZWZpbmVkXG5cbiAgY3VycmVudFBsYXllcjogLT5cbiAgICByZXR1cm4gQHBsYXllcnNbQHR1cm5dXG5cbiAgZXZlcnlvbmVQYXNzZWQ6IC0+XG4gICAgZm9yIHBsYXllciwgcGxheWVySW5kZXggaW4gQHBsYXllcnNcbiAgICAgIGlmIHBsYXllckluZGV4ID09IEB0dXJuXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICBpZiBub3QgcGxheWVyLnBhc3NcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgcmV0dXJuIHRydWVcblxuICBwbGF5ZXJBZnRlcjogKGluZGV4KSAtPlxuICAgIHJldHVybiAoaW5kZXggKyAxKSAlIEBwbGF5ZXJzLmxlbmd0aFxuXG4gIGFkZFBsYXllcjogKHBsYXllcikgLT5cbiAgICBpZiBub3QgcGxheWVyLmFpXG4gICAgICBwbGF5ZXIuYWkgPSBmYWxzZVxuXG4gICAgQHBsYXllcnMucHVzaCBwbGF5ZXJcbiAgICBwbGF5ZXIuaW5kZXggPSBAcGxheWVycy5sZW5ndGggLSAxXG4gICAgQG91dHB1dChwbGF5ZXIubmFtZSArIFwiIGpvaW5zIHRoZSBnYW1lXCIpXG5cbiAgbmFtZVByZXNlbnQ6IChuYW1lKSAtPlxuICAgIGZvciBwbGF5ZXIgaW4gQHBsYXllcnNcbiAgICAgIGlmIHBsYXllci5uYW1lID09IG5hbWVcbiAgICAgICAgcmV0dXJuIHRydWVcblxuICAgIHJldHVybiBmYWxzZVxuXG4gIGFkZEFJOiAtPlxuICAgIGxvb3BcbiAgICAgIGNoYXJhY3RlciA9IHJhbmRvbUNoYXJhY3RlcigpXG4gICAgICBpZiBub3QgQG5hbWVQcmVzZW50KGNoYXJhY3Rlci5uYW1lKVxuICAgICAgICBicmVha1xuXG4gICAgYWkgPVxuICAgICAgY2hhcklEOiBjaGFyYWN0ZXIuaWRcbiAgICAgIG5hbWU6IGNoYXJhY3Rlci5uYW1lXG4gICAgICBpZDogJ2FpJyArIFN0cmluZyhAcGxheWVycy5sZW5ndGgpXG4gICAgICBwYXNzOiBmYWxzZVxuICAgICAgYWk6IHRydWVcblxuICAgIEBhZGRQbGF5ZXIoYWkpXG5cbiAgICBAZ2FtZS5sb2coXCJhZGRlZCBBSSBwbGF5ZXJcIilcbiAgICByZXR1cm4gT0tcblxuICB1cGRhdGVQbGF5ZXJIYW5kOiAoY2FyZHMpIC0+XG4gICAgIyBUaGlzIG1haW50YWlucyB0aGUgcmVvcmdhbml6ZWQgb3JkZXIgb2YgdGhlIHBsYXllcidzIGhhbmRcbiAgICBAcGxheWVyc1swXS5oYW5kID0gY2FyZHMuc2xpY2UoMClcblxuICB3aW5uZXI6IC0+XG4gICAgZm9yIHBsYXllciwgaSBpbiBAcGxheWVyc1xuICAgICAgaWYgcGxheWVyLmhhbmQubGVuZ3RoID09IDBcbiAgICAgICAgcmV0dXJuIHBsYXllclxuICAgIHJldHVybiBudWxsXG5cbiAgaGFzQ2FyZDogKGhhbmQsIHJhd0NhcmQpIC0+XG4gICAgZm9yIHJhdyBpbiBoYW5kXG4gICAgICBpZiByYXcgPT0gcmF3Q2FyZFxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIHJldHVybiBmYWxzZVxuXG4gIGhhc0NhcmRzOiAoaGFuZCwgcmF3Q2FyZHMpIC0+XG4gICAgZm9yIHJhdyBpbiByYXdDYXJkc1xuICAgICAgaWYgbm90IEBoYXNDYXJkKGhhbmQsIHJhdylcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgcmV0dXJuIHRydWVcblxuICByZW1vdmVDYXJkczogKGhhbmQsIHJhd0NhcmRzKSAtPlxuICAgIG5ld0hhbmQgPSBbXVxuICAgIGZvciBjYXJkIGluIGhhbmRcbiAgICAgIGtlZXBNZSA9IHRydWVcbiAgICAgIGZvciByYXcgaW4gcmF3Q2FyZHNcbiAgICAgICAgaWYgY2FyZCA9PSByYXdcbiAgICAgICAgICBrZWVwTWUgPSBmYWxzZVxuICAgICAgICAgIGJyZWFrXG4gICAgICBpZiBrZWVwTWVcbiAgICAgICAgbmV3SGFuZC5wdXNoIGNhcmRcbiAgICByZXR1cm4gbmV3SGFuZFxuXG4gIGNsYXNzaWZ5OiAocmF3Q2FyZHMpIC0+XG4gICAgY2FyZHMgPSByYXdDYXJkcy5tYXAgKHJhdykgLT4gbmV3IENhcmQocmF3KVxuICAgIGNhcmRzID0gY2FyZHMuc29ydCAoYSwgYikgLT4gcmV0dXJuIGEucmF3IC0gYi5yYXdcbiAgICBoaWdoZXN0UmF3ID0gY2FyZHNbY2FyZHMubGVuZ3RoIC0gMV0ucmF3XG5cbiAgICAjIGxvb2sgZm9yIGEgcnVuIG9mIHBhaXJzXG4gICAgaWYgKGNhcmRzLmxlbmd0aCA+PSA2KSBhbmQgKChjYXJkcy5sZW5ndGggJSAyKSA9PSAwKVxuICAgICAgZm91bmRSb3AgPSB0cnVlXG4gICAgICBmb3IgY2FyZCwgY2FyZEluZGV4IGluIGNhcmRzXG4gICAgICAgIGlmIGNhcmRJbmRleCA9PSAwXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgaWYgY2FyZC52YWx1ZSA9PSAxMlxuICAgICAgICAgICMgbm8gMnMgaW4gYSBydW5cbiAgICAgICAgICBmb3VuZFJvcCA9IGZhbHNlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgaWYgKGNhcmRJbmRleCAlIDIpID09IDFcbiAgICAgICAgICAjIG9kZCBjYXJkLCBtdXN0IG1hdGNoIGxhc3QgY2FyZCBleGFjdGx5XG4gICAgICAgICAgaWYgY2FyZC52YWx1ZSAhPSAoY2FyZHNbY2FyZEluZGV4IC0gMV0udmFsdWUpXG4gICAgICAgICAgICBmb3VuZFJvcCA9IGZhbHNlXG4gICAgICAgICAgICBicmVha1xuICAgICAgICBlbHNlXG4gICAgICAgICAgIyBldmVuIGNhcmQsIG11c3QgaW5jcmVtZW50XG4gICAgICAgICAgaWYgY2FyZC52YWx1ZSAhPSAoY2FyZHNbY2FyZEluZGV4IC0gMV0udmFsdWUgKyAxKVxuICAgICAgICAgICAgZm91bmRSb3AgPSBmYWxzZVxuICAgICAgICAgICAgYnJlYWtcblxuICAgICAgaWYgZm91bmRSb3BcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0eXBlOiAncm9wJyArIE1hdGguZmxvb3IoY2FyZHMubGVuZ3RoIC8gMilcbiAgICAgICAgICBoaWdoOiBoaWdoZXN0UmF3XG4gICAgICAgIH1cblxuICAgICMgbG9vayBmb3IgYSBydW5cbiAgICBpZiBjYXJkcy5sZW5ndGggPj0gM1xuICAgICAgZm91bmRSdW4gPSB0cnVlXG4gICAgICBmb3IgY2FyZCwgY2FyZEluZGV4IGluIGNhcmRzXG4gICAgICAgIGlmIGNhcmRJbmRleCA9PSAwXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgaWYgY2FyZC52YWx1ZSA9PSAxMlxuICAgICAgICAgICMgbm8gMnMgaW4gYSBydW5cbiAgICAgICAgICBmb3VuZFJ1biA9IGZhbHNlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgaWYgY2FyZC52YWx1ZSAhPSAoY2FyZHNbY2FyZEluZGV4IC0gMV0udmFsdWUgKyAxKVxuICAgICAgICAgIGZvdW5kUnVuID0gZmFsc2VcbiAgICAgICAgICBicmVha1xuXG4gICAgICBpZiBmb3VuZFJ1blxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHR5cGU6ICdydW4nICsgY2FyZHMubGVuZ3RoXG4gICAgICAgICAgaGlnaDogaGlnaGVzdFJhd1xuICAgICAgICB9XG5cbiAgICAjIGxvb2sgZm9yIFggb2YgYSBraW5kXG4gICAgcmVxVmFsdWUgPSBjYXJkc1swXS52YWx1ZVxuICAgIGZvciBjYXJkIGluIGNhcmRzXG4gICAgICBpZiBjYXJkLnZhbHVlICE9IHJlcVZhbHVlXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgdHlwZSA9ICdraW5kJyArIGNhcmRzLmxlbmd0aFxuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiB0eXBlXG4gICAgICBoaWdoOiBoaWdoZXN0UmF3XG4gICAgfVxuXG4gIGhhbmRIYXMzUzogKGhhbmQpIC0+XG4gICAgZm9yIHJhdyBpbiBoYW5kXG4gICAgICBpZiByYXcgPT0gMFxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIHJldHVybiBmYWxzZVxuXG4gIGNhblBhc3M6IChwYXJhbXMpIC0+XG4gICAgaWYgQHdpbm5lcigpICE9IG51bGxcbiAgICAgIHJldHVybiAnZ2FtZU92ZXInXG5cbiAgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxuICAgIGlmIHBhcmFtcy5pZCAhPSBjdXJyZW50UGxheWVyLmlkXG4gICAgICByZXR1cm4gJ25vdFlvdXJUdXJuJ1xuXG4gICAgaWYgQHBpbGUubGVuZ3RoID09IDBcbiAgICAgIHJldHVybiAnbXVzdFRocm93M1MnXG5cbiAgICBpZiBAZXZlcnlvbmVQYXNzZWQoKVxuICAgICAgcmV0dXJuICd0aHJvd0FueXRoaW5nJ1xuXG4gICAgcmV0dXJuIE9LXG5cbiAgY2FuUGxheTogKHBhcmFtcywgaW5jb21pbmdQbGF5LCBoYW5kSGFzM1MpIC0+XG4gICAgaWYgQHdpbm5lcigpICE9IG51bGxcbiAgICAgIHJldHVybiAnZ2FtZU92ZXInXG5cbiAgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxuICAgIGlmIHBhcmFtcy5pZCAhPSBjdXJyZW50UGxheWVyLmlkXG4gICAgICByZXR1cm4gJ25vdFlvdXJUdXJuJ1xuXG4gICAgaWYgaW5jb21pbmdQbGF5ID09IG51bGxcbiAgICAgIHJldHVybiAnaW52YWxpZFBsYXknXG5cbiAgICBpZiBAcGlsZS5sZW5ndGggPT0gMFxuICAgICAgaWYgbm90IGhhbmRIYXMzU1xuICAgICAgICByZXR1cm4gJ211c3RUaHJvdzNTJ1xuXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcbiAgICBpZiBjdXJyZW50UGxheWVyLnBhc3NcbiAgICAgIGlmIEBjdXJyZW50UGxheSBhbmQgQGNhbkJlQnJva2VuKEBjdXJyZW50UGxheSlcbiAgICAgICAgaWYgQGlzQnJlYWtlclR5cGUoaW5jb21pbmdQbGF5LnR5cGUpXG4gICAgICAgICAgcmV0dXJuIE9LXG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXR1cm4gJ211c3RCcmVha09yUGFzcydcbiAgICAgIHJldHVybiAnbXVzdFBhc3MnXG5cbiAgICBpZiBAY3VycmVudFBsYXkgPT0gbnVsbFxuICAgICAgcmV0dXJuIE9LXG5cbiAgICBpZiBAZXZlcnlvbmVQYXNzZWQoKVxuICAgICAgcmV0dXJuIE9LXG5cbiAgICBpZiBAY2FuQmVCcm9rZW4oQGN1cnJlbnRQbGF5KSBhbmQgQGlzQnJlYWtlclR5cGUoaW5jb21pbmdQbGF5LnR5cGUpXG4gICAgICAjIDIgYnJlYWtlciFcbiAgICAgIHJldHVybiBPS1xuXG4gICAgaWYgaW5jb21pbmdQbGF5LnR5cGUgIT0gQGN1cnJlbnRQbGF5LnR5cGVcbiAgICAgIHJldHVybiAnd3JvbmdQbGF5J1xuXG4gICAgaWYgaW5jb21pbmdQbGF5LmhpZ2ggPCBAY3VycmVudFBsYXkuaGlnaFxuICAgICAgcmV0dXJuICd0b29Mb3dQbGF5J1xuXG4gICAgcmV0dXJuIE9LXG5cbiAgcGxheTogKHBhcmFtcykgLT5cbiAgICBpbmNvbWluZ1BsYXkgPSBAY2xhc3NpZnkocGFyYW1zLmNhcmRzKVxuICAgIGNvbnNvbGUubG9nIFwiaW5jb21pbmdQbGF5XCIsIGluY29taW5nUGxheVxuXG4gICAgY29uc29sZS5sb2cgXCJzb21lb25lIGNhbGxpbmcgcGxheVwiLCBwYXJhbXNcbiAgICByZXQgPSBAY2FuUGxheShwYXJhbXMsIGluY29taW5nUGxheSwgQGhhbmRIYXMzUyhwYXJhbXMuY2FyZHMpKVxuICAgIGlmIHJldCAhPSBPS1xuICAgICAgcmV0dXJuIHJldFxuXG4gICAgIyBUT0RPOiBtYWtlIHByZXR0eSBuYW1lcyBiYXNlZCBvbiB0aGUgcGxheSwgYWRkIHBsYXkgdG8gaGVhZGxpbmVcbiAgICB2ZXJiID0gXCJ0aHJvd3M6XCJcbiAgICBpZiBAY3VycmVudFBsYXlcbiAgICAgIGlmIEBjYW5CZUJyb2tlbihAY3VycmVudFBsYXkpIGFuZCBAaXNCcmVha2VyVHlwZShpbmNvbWluZ1BsYXkudHlwZSlcbiAgICAgICAgIyAyIGJyZWFrZXIhXG4gICAgICAgIEB1bnBhc3NBbGwoKVxuICAgICAgICB2ZXJiID0gXCJicmVha3MgMjpcIlxuICAgICAgZWxzZSBpZiAoaW5jb21pbmdQbGF5LnR5cGUgIT0gQGN1cnJlbnRQbGF5LnR5cGUpIG9yIChpbmNvbWluZ1BsYXkuaGlnaCA8IEBjdXJyZW50UGxheS5oaWdoKVxuICAgICAgICAjIE5ldyBwbGF5IVxuICAgICAgICBAdW5wYXNzQWxsKClcbiAgICAgICAgdmVyYiA9IFwidGhyb3dzIG5ldzpcIlxuICAgIGVsc2VcbiAgICAgIHZlcmIgPSBcImJlZ2luczpcIlxuXG4gICAgQGN1cnJlbnRQbGF5ID0gaW5jb21pbmdQbGF5XG5cbiAgICBAdGhyb3dJRCArPSAxXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcbiAgICBjdXJyZW50UGxheWVyLmhhbmQgPSBAcmVtb3ZlQ2FyZHMoY3VycmVudFBsYXllci5oYW5kLCBwYXJhbXMuY2FyZHMpXG5cbiAgICBAb3V0cHV0KFwiI3tjdXJyZW50UGxheWVyLm5hbWV9ICN7dmVyYn0gI3twbGF5VG9TdHJpbmcoaW5jb21pbmdQbGF5KX1cIilcblxuICAgIGlmIGN1cnJlbnRQbGF5ZXIuaGFuZC5sZW5ndGggPT0gMFxuICAgICAgQG91dHB1dChcIiN7Y3VycmVudFBsYXllci5uYW1lfSB3aW5zIVwiKVxuICAgICAgaWYgY3VycmVudFBsYXllci5haVxuICAgICAgICBAbGFzdFN0cmVhayA9IEBzdHJlYWtcbiAgICAgICAgQHN0cmVhayA9IDBcbiAgICAgIGVsc2VcbiAgICAgICAgQHN0cmVhayArPSAxXG4gICAgICAgIEBsYXN0U3RyZWFrID0gQHN0cmVha1xuXG4gICAgQHBpbGUgPSBwYXJhbXMuY2FyZHMuc2xpY2UoMClcbiAgICBAcGlsZVdobyA9IEB0dXJuXG5cbiAgICBAdHVybiA9IEBwbGF5ZXJBZnRlcihAdHVybilcbiAgICByZXR1cm4gT0tcblxuICB1bnBhc3NBbGw6IC0+XG4gICAgZm9yIHBsYXllciBpbiBAcGxheWVyc1xuICAgICAgcGxheWVyLnBhc3MgPSBmYWxzZVxuICAgIHJldHVyblxuXG4gIHBhc3M6IChwYXJhbXMpIC0+XG4gICAgcmV0ID0gQGNhblBhc3MocGFyYW1zKVxuICAgIGlmIHJldCAhPSBPS1xuICAgICAgcmV0dXJuIHJldFxuXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcbiAgICBpZiBjdXJyZW50UGxheWVyLnBhc3NcbiAgICAgIEBvdXRwdXQoXCIje2N1cnJlbnRQbGF5ZXIubmFtZX0gYXV0by1wYXNzZXNcIilcbiAgICBlbHNlXG4gICAgICBAb3V0cHV0KFwiI3tjdXJyZW50UGxheWVyLm5hbWV9IHBhc3Nlc1wiKVxuICAgIGN1cnJlbnRQbGF5ZXIucGFzcyA9IHRydWVcbiAgICBAdHVybiA9IEBwbGF5ZXJBZnRlcihAdHVybilcbiAgICByZXR1cm4gT0tcblxuICBhaVBsYXk6IChjdXJyZW50UGxheWVyLCBjYXJkcykgLT5cbiAgICByZXR1cm4gQHBsYXkoeydpZCc6Y3VycmVudFBsYXllci5pZCwgJ2NhcmRzJzpjYXJkc30pXG5cbiAgYWlQYXNzOiAoY3VycmVudFBsYXllcikgLT5cbiAgICByZXR1cm4gQHBhc3MoeydpZCc6Y3VycmVudFBsYXllci5pZH0pXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyBBSVxuXG4gICMgR2VuZXJpYyBsb2dnaW5nIGZ1bmN0aW9uOyBwcmVwZW5kcyBjdXJyZW50IEFJIHBsYXllcidzIGd1dHMgYmVmb3JlIHByaW50aW5nIHRleHRcbiAgYWlMb2c6ICh0ZXh0KSAtPlxuICAgIGN1cnJlbnRQbGF5ZXIgPSBAY3VycmVudFBsYXllcigpXG4gICAgaWYgbm90IGN1cnJlbnRQbGF5ZXIuYWlcbiAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgY2hhcmFjdGVyID0gYWlDaGFyYWN0ZXJzW2N1cnJlbnRQbGF5ZXIuY2hhcklEXVxuICAgIEBnYW1lLmxvZygnQUlbJytjdXJyZW50UGxheWVyLm5hbWUrJyAnK2NoYXJhY3Rlci5icmFpbisnXTogaGFuZDonK2NhcmRzVG9TdHJpbmcoY3VycmVudFBsYXllci5oYW5kKSsnIHBpbGU6JytjYXJkc1RvU3RyaW5nKEBwaWxlKSsnICcrdGV4dClcblxuICAjIERldGVjdHMgaWYgdGhlIGN1cnJlbnQgcGxheWVyIGlzIEFJIGR1cmluZyBhIEJJRCBvciBUUklDSyBwaGFzZSBhbmQgYWN0cyBhY2NvcmRpbmcgdG8gdGhlaXIgJ2JyYWluJ1xuICBhaVRpY2s6IC0+XG4gICAgaWYgQHdpbm5lcigpICE9IG51bGxcbiAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcbiAgICBpZiBub3QgY3VycmVudFBsYXllci5haVxuICAgICAgaWYgQGN1cnJlbnRQbGF5IGFuZCAoQGN1cnJlbnRQbGF5LnR5cGUgPT0gJ2tpbmQxJykgYW5kIEBoYXNCcmVha2VyKGN1cnJlbnRQbGF5ZXIuaGFuZClcbiAgICAgICAgIyBkbyBub3RoaW5nLCBwbGF5ZXIgY2FuIGRyb3AgYSBicmVha2VyXG4gICAgICBlbHNlIGlmIGN1cnJlbnRQbGF5ZXIucGFzc1xuICAgICAgICBAYWlMb2coXCJhdXRvcGFzc2luZyBmb3IgcGxheWVyXCIpXG4gICAgICAgIEBhaVBhc3MoY3VycmVudFBsYXllcilcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgY2hhcmFjdGVyID0gYWlDaGFyYWN0ZXJzW2N1cnJlbnRQbGF5ZXIuY2hhcklEXVxuICAgIHJldCA9IEBicmFpbnNbY2hhcmFjdGVyLmJyYWluXS5wbGF5LmFwcGx5KHRoaXMsIFtjdXJyZW50UGxheWVyLCBAY3VycmVudFBsYXksIEBldmVyeW9uZVBhc3NlZCgpXSlcbiAgICBpZiByZXQgPT0gT0tcbiAgICAgIHJldHVybiB0cnVlXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgYWxDYWxjS2luZHM6IChoYW5kLCBwbGF5cywgbWF0Y2gycyA9IGZhbHNlKSAtPlxuICAgIGNhcmRzID0gaGFuZC5tYXAgKHJhdykgLT4gbmV3IENhcmQocmF3KVxuICAgIGNhcmRzID0gY2FyZHMuc29ydCAoYSwgYikgLT4gcmV0dXJuIGEucmF3IC0gYi5yYXdcbiAgICB2YWx1ZUFycmF5cyA9IFtdXG4gICAgZm9yIGkgaW4gWzAuLi4xM11cbiAgICAgIHZhbHVlQXJyYXlzLnB1c2ggW11cbiAgICBmb3IgY2FyZCBpbiBjYXJkc1xuICAgICAgdmFsdWVBcnJheXNbY2FyZC52YWx1ZV0ucHVzaChjYXJkKVxuXG4gICAgaGFuZCA9IFtdXG4gICAgZm9yIHZhbHVlQXJyYXksIHZhbHVlIGluIHZhbHVlQXJyYXlzXG4gICAgICBpZiAodmFsdWVBcnJheS5sZW5ndGggPiAxKSBhbmQgKG1hdGNoMnMgb3IgKHZhbHVlIDwgMTIpKVxuICAgICAgICBrZXkgPSBcImtpbmQje3ZhbHVlQXJyYXkubGVuZ3RofVwiXG4gICAgICAgIHBsYXlzW2tleV0gPz0gW11cbiAgICAgICAgcGxheXNba2V5XS5wdXNoIHZhbHVlQXJyYXkubWFwICh2KSAtPiB2LnJhd1xuICAgICAgZWxzZVxuICAgICAgICBmb3IgdiBpbiB2YWx1ZUFycmF5XG4gICAgICAgICAgaGFuZC5wdXNoIHYucmF3XG5cbiAgICByZXR1cm4gaGFuZFxuXG4gIGFpRmluZFJ1bnM6IChoYW5kLCBlYWNoU2l6ZSwgc2l6ZSkgLT5cbiAgICBydW5zID0gW11cblxuICAgIGNhcmRzID0gaGFuZC5tYXAgKHJhdykgLT4gbmV3IENhcmQocmF3KVxuICAgIGNhcmRzID0gY2FyZHMuc29ydCAoYSwgYikgLT4gcmV0dXJuIGEucmF3IC0gYi5yYXdcbiAgICB2YWx1ZUFycmF5cyA9IFtdXG4gICAgZm9yIGkgaW4gWzAuLi4xM11cbiAgICAgIHZhbHVlQXJyYXlzLnB1c2ggW11cbiAgICBmb3IgY2FyZCBpbiBjYXJkc1xuICAgICAgdmFsdWVBcnJheXNbY2FyZC52YWx1ZV0ucHVzaChjYXJkKVxuXG4gICAgbGFzdFN0YXJ0aW5nVmFsdWUgPSAxMiAtIHNpemVcbiAgICBmb3Igc3RhcnRpbmdWYWx1ZSBpbiBbMC4uLmxhc3RTdGFydGluZ1ZhbHVlXVxuICAgICAgcnVuRm91bmQgPSB0cnVlXG4gICAgICBmb3Igb2Zmc2V0IGluIFswLi4uc2l6ZV1cbiAgICAgICAgaWYgdmFsdWVBcnJheXNbc3RhcnRpbmdWYWx1ZStvZmZzZXRdLmxlbmd0aCA8IGVhY2hTaXplXG4gICAgICAgICAgcnVuRm91bmQgPSBmYWxzZVxuICAgICAgICAgIGJyZWFrXG4gICAgICBpZiBydW5Gb3VuZFxuICAgICAgICBydW4gPSBbXVxuICAgICAgICBmb3Igb2Zmc2V0IGluIFswLi4uc2l6ZV1cbiAgICAgICAgICBmb3IgZWFjaCBpbiBbMC4uLmVhY2hTaXplXVxuICAgICAgICAgICAgcnVuLnB1c2godmFsdWVBcnJheXNbc3RhcnRpbmdWYWx1ZStvZmZzZXRdLnBvcCgpLnJhdylcbiAgICAgICAgcnVucy5wdXNoIHJ1blxuXG4gICAgbGVmdG92ZXJzID0gW11cbiAgICBmb3IgdmFsdWVBcnJheSBpbiB2YWx1ZUFycmF5c1xuICAgICAgZm9yIGNhcmQgaW4gdmFsdWVBcnJheVxuICAgICAgICBsZWZ0b3ZlcnMucHVzaCBjYXJkLnJhd1xuXG4gICAgcmV0dXJuIFtydW5zLCBsZWZ0b3ZlcnNdXG5cbiAgYWlDYWxjUnVuczogKGhhbmQsIHBsYXlzLCBzbWFsbFJ1bnMpIC0+XG4gICAgaWYgc21hbGxSdW5zXG4gICAgICBzdGFydFNpemUgPSAzXG4gICAgICBlbmRTaXplID0gMTJcbiAgICAgIGJ5QW1vdW50ID0gMVxuICAgIGVsc2VcbiAgICAgIHN0YXJ0U2l6ZSA9IDEyXG4gICAgICBlbmRTaXplID0gM1xuICAgICAgYnlBbW91bnQgPSAtMVxuICAgIGZvciBydW5TaXplIGluIFtzdGFydFNpemUuLmVuZFNpemVdIGJ5IGJ5QW1vdW50XG4gICAgICBbcnVucywgbGVmdG92ZXJzXSA9IEBhaUZpbmRSdW5zKGhhbmQsIDEsIHJ1blNpemUpXG4gICAgICBpZiBydW5zLmxlbmd0aCA+IDBcbiAgICAgICAga2V5ID0gXCJydW4je3J1blNpemV9XCJcbiAgICAgICAgcGxheXNba2V5XSA9IHJ1bnNcbiAgICAgIGhhbmQgPSBsZWZ0b3ZlcnNcblxuICAgIHJldHVybiBoYW5kXG5cbiAgYWlDYWxjUm9wczogKGhhbmQsIHBsYXlzKSAtPlxuICAgIHN0YXJ0U2l6ZSA9IDNcbiAgICBlbmRTaXplID0gNlxuICAgIGZvciBydW5TaXplIGluIFtzdGFydFNpemUuLmVuZFNpemVdXG4gICAgICBbcm9wcywgbGVmdG92ZXJzXSA9IEBhaUZpbmRSdW5zKGhhbmQsIDIsIHJ1blNpemUpXG4gICAgICBpZiByb3BzLmxlbmd0aCA+IDBcbiAgICAgICAga2V5ID0gXCJyb3Aje3J1blNpemV9XCJcbiAgICAgICAgcGxheXNba2V5XSA9IHJvcHNcbiAgICAgIGhhbmQgPSBsZWZ0b3ZlcnNcblxuICAgIHJldHVybiBoYW5kXG5cbiAgYWlDYWxjUGxheXM6IChoYW5kLCBzdHJhdGVneSA9IHt9KSAtPlxuICAgIHBsYXlzID0ge31cblxuICAgICMgV2UgYWx3YXlzIHdhbnQgdG8gdXNlIHJvcHMgaWYgd2UgaGF2ZSBvbmVcbiAgICBpZiBzdHJhdGVneS5zZWVzUm9wc1xuICAgICAgaGFuZCA9IEBhaUNhbGNSb3BzKGhhbmQsIHBsYXlzKVxuXG4gICAgaWYgc3RyYXRlZ3kucHJlZmVyc1J1bnNcbiAgICAgIGhhbmQgPSBAYWlDYWxjUnVucyhoYW5kLCBwbGF5cywgc3RyYXRlZ3kuc21hbGxSdW5zKVxuICAgICAgaGFuZCA9IEBhbENhbGNLaW5kcyhoYW5kLCBwbGF5cywgc3RyYXRlZ3kubWF0Y2gycylcbiAgICBlbHNlXG4gICAgICBoYW5kID0gQGFsQ2FsY0tpbmRzKGhhbmQsIHBsYXlzLCBzdHJhdGVneS5tYXRjaDJzKVxuICAgICAgaGFuZCA9IEBhaUNhbGNSdW5zKGhhbmQsIHBsYXlzLCBzdHJhdGVneS5zbWFsbFJ1bnMpXG5cbiAgICBraW5kMSA9IGhhbmQubWFwICh2KSAtPiBbdl1cbiAgICBpZiBraW5kMS5sZW5ndGggPiAwXG4gICAgICBwbGF5cy5raW5kMSA9IGtpbmQxXG4gICAgcmV0dXJuIHBsYXlzXG5cbiAgbnVtYmVyT2ZTaW5nbGVzOiAocGxheXMpIC0+XG4gICAgaWYgbm90IHBsYXlzLmtpbmQxP1xuICAgICAgcmV0dXJuIDBcbiAgICBub25Ud29TaW5nbGVzID0gMFxuICAgIGZvciByYXcgaW4gcGxheXMua2luZDFcbiAgICAgIGlmIHJhdyA8IDQ4XG4gICAgICAgIG5vblR3b1NpbmdsZXMgKz0gMVxuICAgIHJldHVybiBub25Ud29TaW5nbGVzXG5cbiAgYnJlYWtlclBsYXlzOiAoaGFuZCkgLT5cbiAgICByZXR1cm4gQGFpQ2FsY1BsYXlzKGhhbmQsIHsgc2Vlc1JvcHM6IHRydWUsIHByZWZlcnNSdW5zOiBmYWxzZSB9KVxuXG4gIGlzQnJlYWtlclR5cGU6IChwbGF5VHlwZSkgLT5cbiAgICBpZiBwbGF5VHlwZS5tYXRjaCgvXnJvcC8pIG9yIHBsYXlUeXBlID09ICdraW5kNCdcbiAgICAgIHJldHVybiB0cnVlXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgY2FuQmVCcm9rZW46IChwbGF5KSAtPlxuICAgIGlmIHBsYXkudHlwZSAhPSAna2luZDEnXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICBjYXJkID0gbmV3IENhcmQocGxheS5oaWdoKVxuICAgIHJldHVybiAoY2FyZC52YWx1ZSA9PSAxMilcblxuICBoYXNCcmVha2VyOiAoaGFuZCkgLT5cbiAgICBwbGF5cyA9IEBicmVha2VyUGxheXMoaGFuZClcbiAgICBmb3IgcGxheVR5cGUsIHBsYXlsaXN0IG9mIHBsYXlzXG4gICAgICBpZiBAaXNCcmVha2VyVHlwZShwbGF5VHlwZSlcbiAgICAgICAgaWYgcGxheWxpc3QubGVuZ3RoID4gMFxuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgYWlDYWxjQmVzdFBsYXlzOiAoaGFuZCkgLT5cbiAgICBiZXN0UGxheXMgPSBudWxsXG4gICAgZm9yIGJpdHMgaW4gWzAuLi4xNl1cbiAgICAgIHN0cmF0ZWd5ID1cbiAgICAgICAgc21hbGxSdW5zOiAoYml0cyAmIDEpID09IDFcbiAgICAgICAgcHJlZmVyc1J1bnM6IChiaXRzICYgMikgPT0gMlxuICAgICAgICBtYXRjaDJzOiAoYml0cyAmIDQpID09IDRcbiAgICAgICAgc2Vlc1JvcHM6IChiaXRzICYgOCkgPT0gOFxuICAgICAgcGxheXMgPSBAYWlDYWxjUGxheXMoaGFuZCwgc3RyYXRlZ3kpXG4gICAgICBpZiBiZXN0UGxheXMgPT0gbnVsbFxuICAgICAgICBiZXN0UGxheXMgPSBwbGF5c1xuICAgICAgZWxzZVxuICAgICAgICBucCA9IEBudW1iZXJPZlNpbmdsZXMocGxheXMpXG4gICAgICAgIG5icCA9IEBudW1iZXJPZlNpbmdsZXMoYmVzdFBsYXlzKVxuICAgICAgICBpZiBucCA8IG5icFxuICAgICAgICAgIGJlc3RQbGF5cyA9IHBsYXlzXG4gICAgICAgIGVsc2UgaWYgbnAgPT0gbmJwXG4gICAgICAgICAgIyBmbGlwIGEgY29pbiFcbiAgICAgICAgICBpZiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKSA9PSAwXG4gICAgICAgICAgICBiZXN0UGxheXMgPSBwbGF5c1xuICAgIHJldHVybiBiZXN0UGxheXNcblxuICBwcmV0dHlQbGF5czogKHBsYXlzLCBleHRyYVByZXR0eSA9IGZhbHNlKSAtPlxuICAgIHByZXR0eSA9IHt9XG4gICAgZm9yIHR5cGUsIGFyciBvZiBwbGF5c1xuICAgICAgcHJldHR5W3R5cGVdID0gW11cbiAgICAgIGZvciBwbGF5IGluIGFyclxuICAgICAgICBuYW1lcyA9IFtdXG4gICAgICAgIGZvciByYXcgaW4gcGxheVxuICAgICAgICAgIGNhcmQgPSBuZXcgQ2FyZChyYXcpXG4gICAgICAgICAgbmFtZXMucHVzaChjYXJkLm5hbWUpXG4gICAgICAgIHByZXR0eVt0eXBlXS5wdXNoKG5hbWVzKVxuICAgIGlmIGV4dHJhUHJldHR5XG4gICAgICBzID0gXCJcIlxuICAgICAgZm9yIHR5cGVOYW1lLCB0aHJvd3Mgb2YgcHJldHR5XG4gICAgICAgIHMgKz0gXCIgICAgICAqICN7cGxheVR5cGVUb1N0cmluZyh0eXBlTmFtZSl9OlxcblwiXG4gICAgICAgIGlmIHR5cGVOYW1lID09ICdraW5kMSdcbiAgICAgICAgICBzICs9IFwiICAgICAgICAqICN7dGhyb3dzLm1hcCgodikgLT4gdlswXSkuam9pbignLCcpfVxcblwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBmb3IgdCBpbiB0aHJvd3NcbiAgICAgICAgICAgIHMgKz0gXCIgICAgICAgICogI3t0LmpvaW4oJywnKX1cXG5cIlxuICAgICAgcmV0dXJuIHNcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocHJldHR5KVxuXG4gIGhpZ2hlc3RDYXJkOiAocGxheSkgLT5cbiAgICBoaWdoZXN0ID0gMFxuICAgIGZvciBwIGluIHBsYXlcbiAgICAgIGlmIGhpZ2hlc3QgPCBwXG4gICAgICAgIGhpZ2hlc3QgPSBwXG4gICAgcmV0dXJuIGhpZ2hlc3RcblxuICBmaW5kUGxheVdpdGgzUzogKHBsYXlzKSAtPlxuICAgIGZvciBwbGF5VHlwZSwgcGxheWxpc3Qgb2YgcGxheXNcbiAgICAgIGZvciBwbGF5IGluIHBsYXlsaXN0XG4gICAgICAgIGlmIEBoYW5kSGFzM1MocGxheSlcbiAgICAgICAgICByZXR1cm4gcGxheVxuXG4gICAgY29uc29sZS5sb2cgXCJmaW5kUGxheVdpdGgzUzogc29tZXRoaW5nIGltcG9zc2libGUgaXMgaGFwcGVuaW5nXCJcbiAgICByZXR1cm4gW11cblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQUkgQnJhaW5zXG5cbiAgIyBCcmFpbnMgbXVzdCBoYXZlOlxuICAjICogaWQ6IGludGVybmFsIGlkZW50aWZpZXIgZm9yIHRoZSBicmFpblxuICAjICogbmFtZTogcHJldHR5IG5hbWVcbiAgIyAqIHBsYXkoY3VycmVudFBsYXllcikgYXR0ZW1wdHMgdG8gcGxheSBhIGNhcmQgYnkgY2FsbGluZyBhaVBsYXkoKS4gU2hvdWxkIHJldHVybiB0cnVlIGlmIGl0IHN1Y2Nlc3NmdWxseSBwbGF5ZWQgYSBjYXJkIChhaVBsYXkoKSByZXR1cm5lZCB0cnVlKVxuICBicmFpbnM6XG5cbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICMgTm9ybWFsOiBJbnRlbmRlZCB0byBiZSB1c2VkIGJ5IG1vc3QgY2hhcmFjdGVycy5cbiAgICAjICAgICAgICAgTm90IHRvbyBkdW1iLCBub3QgdG9vIHNtYXJ0LlxuICAgIG5vcm1hbDpcbiAgICAgIGlkOiAgIFwibm9ybWFsXCJcbiAgICAgIG5hbWU6IFwiTm9ybWFsXCJcblxuICAgICAgIyBub3JtYWxcbiAgICAgIHBsYXk6IChjdXJyZW50UGxheWVyLCBjdXJyZW50UGxheSwgZXZlcnlvbmVQYXNzZWQpIC0+XG4gICAgICAgIGlmIGN1cnJlbnRQbGF5ZXIucGFzc1xuICAgICAgICAgIGlmIEBjYW5CZUJyb2tlbihjdXJyZW50UGxheSkgYW5kIEBoYXNCcmVha2VyKGN1cnJlbnRQbGF5ZXIuaGFuZClcbiAgICAgICAgICAgIGJyZWFrZXJQbGF5cyA9IEBicmVha2VyUGxheXMoY3VycmVudFBsYXllci5oYW5kKVxuICAgICAgICAgICAgZm9yIHBsYXlUeXBlLCBwbGF5bGlzdCBvZiBicmVha2VyUGxheXNcbiAgICAgICAgICAgICAgaWYgKHBsYXlUeXBlLm1hdGNoKC9ecm9wLykgb3IgKHBsYXlUeXBlID09ICdraW5kNCcpKSBhbmQgKHBsYXlsaXN0Lmxlbmd0aCA+IDApXG4gICAgICAgICAgICAgICAgQGFpTG9nKFwiYnJlYWtpbmcgMlwiKVxuICAgICAgICAgICAgICAgIGlmIEBhaVBsYXkoY3VycmVudFBsYXllciwgcGxheWxpc3RbMF0pID09IE9LXG4gICAgICAgICAgICAgICAgICByZXR1cm4gT0tcblxuICAgICAgICAgIEBhaUxvZyhcImFscmVhZHkgcGFzc2VkLCBnb2luZyB0byBrZWVwIHBhc3NpbmdcIilcbiAgICAgICAgICByZXR1cm4gQGFpUGFzcyhjdXJyZW50UGxheWVyKVxuXG4gICAgICAgIHBsYXlzID0gQGFpQ2FsY0Jlc3RQbGF5cyhjdXJyZW50UGxheWVyLmhhbmQpXG4gICAgICAgIEBhaUxvZyhcImJlc3QgcGxheXM6ICN7QHByZXR0eVBsYXlzKHBsYXlzKX1cIilcblxuICAgICAgICBpZiBAcGlsZS5sZW5ndGggPT0gMFxuICAgICAgICAgIHBsYXkgPSBAZmluZFBsYXlXaXRoM1MocGxheXMpXG4gICAgICAgICAgQGFpTG9nKFwiVGhyb3dpbmcgbXkgcGxheSB3aXRoIHRoZSAzUyBpbiBpdFwiKVxuICAgICAgICAgIGlmIEBhaVBsYXkoY3VycmVudFBsYXllciwgcGxheSkgPT0gT0tcbiAgICAgICAgICAgIHJldHVybiBPS1xuXG4gICAgICAgIGlmIGN1cnJlbnRQbGF5IGFuZCBub3QgZXZlcnlvbmVQYXNzZWRcbiAgICAgICAgICBpZiBwbGF5c1tjdXJyZW50UGxheS50eXBlXT8gYW5kIChwbGF5c1tjdXJyZW50UGxheS50eXBlXS5sZW5ndGggPiAwKVxuICAgICAgICAgICAgZm9yIHBsYXkgaW4gcGxheXNbY3VycmVudFBsYXkudHlwZV1cbiAgICAgICAgICAgICAgaWYgQGhpZ2hlc3RDYXJkKHBsYXkpID4gY3VycmVudFBsYXkuaGlnaFxuICAgICAgICAgICAgICAgIGlmIEBhaVBsYXkoY3VycmVudFBsYXllciwgcGxheSkgPT0gT0tcbiAgICAgICAgICAgICAgICAgIHJldHVybiBPS1xuICAgICAgICAgICAgQGFpTG9nKFwiSSBndWVzcyBJIGNhbid0IGFjdHVhbGx5IGJlYXQgdGhpcywgcGFzc2luZ1wiKVxuICAgICAgICAgICAgcmV0dXJuIEBhaVBhc3MoY3VycmVudFBsYXllcilcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBAYWlMb2coXCJJIGRvbid0IGhhdmUgdGhhdCBwbGF5LCBwYXNzaW5nXCIpXG4gICAgICAgICAgICByZXR1cm4gQGFpUGFzcyhjdXJyZW50UGxheWVyKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgIyBubyBjdXJyZW50IHBsYXksIHRocm93IHRoZSBmaXJzdCBjYXJkXG4gICAgICAgICAgQGFpTG9nKFwiSSBjYW4gZG8gYW55dGhpbmcsIHRocm93aW5nIGEgcmFuZG9tIHBsYXlcIilcbiAgICAgICAgICBwbGF5VHlwZXMgPSBPYmplY3Qua2V5cyhwbGF5cylcbiAgICAgICAgICBwbGF5VHlwZUluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcGxheVR5cGVzLmxlbmd0aClcbiAgICAgICAgICBpZiBAYWlQbGF5KGN1cnJlbnRQbGF5ZXIsIHBsYXlzW3BsYXlUeXBlc1twbGF5VHlwZUluZGV4XV1bMF0pID09IE9LXG4gICAgICAgICAgICByZXR1cm4gT0tcblxuICAgICAgICAjIGZpbmQgdGhlIGZpcnN0IGNhcmQgdGhhdCBiZWF0cyB0aGUgY3VycmVudFBsYXkncyBoaWdoXG4gICAgICAgIGZvciByYXdDYXJkIGluIGN1cnJlbnRQbGF5ZXIuaGFuZFxuICAgICAgICAgIGlmIHJhd0NhcmQgPiBjdXJyZW50UGxheS5oaWdoXG4gICAgICAgICAgICBAYWlMb2coXCJmb3VuZCBzbWFsbGVzdCBzaW5nbGUgKCN7cmF3Q2FyZH0pLCBwbGF5aW5nXCIpXG4gICAgICAgICAgICBpZiBAYWlQbGF5KGN1cnJlbnRQbGF5ZXIsIFtyYXdDYXJkXSkgPT0gT0tcbiAgICAgICAgICAgICAgcmV0dXJuIE9LXG4gICAgICAgICAgICBicmVha1xuXG4gICAgICAgIEBhaUxvZyhcIm5vdGhpbmcgZWxzZSB0byBkbywgcGFzc2luZ1wiKVxuICAgICAgICByZXR1cm4gQGFpUGFzcyhjdXJyZW50UGxheWVyKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBEZWJ1ZyBjb2RlXG5cbmRlYnVnID0gLT5cbiAgdGhpciA9IG5ldyBUaGlydGVlbigpXG4gIGZ1bGx5UGxheWVkID0gMFxuICB0b3RhbEF0dGVtcHRzID0gMTAwXG5cbiAgZm9yIGF0dGVtcHQgaW4gWzAuLi50b3RhbEF0dGVtcHRzXVxuICAgIGRlY2sgPSBuZXcgU2h1ZmZsZWREZWNrKClcbiAgICBoYW5kID0gW11cbiAgICBmb3IgaiBpbiBbMC4uLjEzXVxuICAgICAgcmF3ID0gZGVjay5jYXJkcy5zaGlmdCgpXG4gICAgICBoYW5kLnB1c2gocmF3KVxuICAgICMgaGFuZCA9IFs1MSw1MCw0OSw0OCw0Nyw0Niw0NSw0NCw0Myw0Miw0MSw0MCwzOV1cbiAgICAjIGhhbmQgPSBbMCwxLDIsMyw0LDUsNiw3LDgsOSwxMCwxMSwxMl1cbiAgICBoYW5kLnNvcnQgKGEsYikgLT4gcmV0dXJuIGEgLSBiXG5cbiAgICBjb25zb2xlLmxvZyhcIi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVwiKVxuICAgIGNvbnNvbGUubG9nKFwiSGFuZCAje2F0dGVtcHQrMX06ICN7Y2FyZHNUb1N0cmluZyhoYW5kKX1cIilcbiAgICBjb25zb2xlLmxvZyhcIlwiKVxuXG4gICAgZm91bmRGdWxseVBsYXllZCA9IGZhbHNlXG4gICAgZm9yIGJpdHMgaW4gWzAuLi4xNl1cbiAgICAgIHN0cmF0ZWd5ID1cbiAgICAgICAgc21hbGxSdW5zOiAoYml0cyAmIDEpID09IDFcbiAgICAgICAgcHJlZmVyc1J1bnM6IChiaXRzICYgMikgPT0gMlxuICAgICAgICBtYXRjaDJzOiAoYml0cyAmIDQpID09IDRcbiAgICAgICAgc2Vlc1JvcHM6IChiaXRzICYgOCkgPT0gOFxuICAgICAgcGxheXMgPSB0aGlyLmFpQ2FsY1BsYXlzKGhhbmQsIHN0cmF0ZWd5KVxuXG4gICAgICBjb25zb2xlLmxvZyhcIiAgICogU3RyYXRlZ3k6ICN7SlNPTi5zdHJpbmdpZnkoc3RyYXRlZ3kpfVwiKVxuICAgICAgY29uc29sZS5sb2codGhpci5wcmV0dHlQbGF5cyhwbGF5cywgdHJ1ZSkpXG5cbiAgICAgIGlmIG5vdCBwbGF5cy5raW5kMVxuICAgICAgICBmb3VuZEZ1bGx5UGxheWVkID0gdHJ1ZVxuXG4gICAgaWYgZm91bmRGdWxseVBsYXllZFxuICAgICAgZnVsbHlQbGF5ZWQgKz0gMVxuXG4gIGNvbnNvbGUubG9nIFwiZnVsbHlQbGF5ZWQ6ICN7ZnVsbHlQbGF5ZWR9IC8gI3t0b3RhbEF0dGVtcHRzfVwiXG5cbiMgZGVidWcoKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBFeHBvcnRzXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgQ2FyZDogQ2FyZFxuICBUaGlydGVlbjogVGhpcnRlZW5cbiAgT0s6IE9LXG4gIGFpQ2hhcmFjdGVyczogYWlDaGFyYWN0ZXJzXG4iLCJtb2R1bGUuZXhwb3J0cyA9XG4gIGRhcmtmb3Jlc3Q6XG4gICAgaGVpZ2h0OiA3MlxuICAgIGdseXBoczpcbiAgICAgICc5NycgOiB7IHg6ICAgOCwgeTogICA4LCB3aWR0aDogIDM0LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzk4JyA6IHsgeDogICA4LCB5OiAgNTgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnOTknIDogeyB4OiAgNTAsIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICcxMDAnOiB7IHg6ICAgOCwgeTogMTE4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzEwMSc6IHsgeDogICA4LCB5OiAxNzgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnMTAyJzogeyB4OiAgIDgsIHk6IDIyOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDMzIH1cbiAgICAgICcxMDMnOiB7IHg6ICAgOCwgeTogMjc4LCB3aWR0aDogIDM2LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzUgfVxuICAgICAgJzEwNCc6IHsgeDogICA4LCB5OiAzMjgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnMTA1JzogeyB4OiAgIDgsIHk6IDM3OCwgd2lkdGg6ICAxMiwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDExIH1cbiAgICAgICcxMDYnOiB7IHg6ICAgOCwgeTogNDI4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MSwgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzEwNyc6IHsgeDogIDI4LCB5OiAzNzgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQxLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnMTA4JzogeyB4OiAgNTEsIHk6IDMyOCwgd2lkdGg6ICAzNCwgaGVpZ2h0OiAgNDEsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDMzIH1cbiAgICAgICcxMDknOiB7IHg6ICA1MSwgeTogNDI3LCB3aWR0aDogIDM4LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzcgfVxuICAgICAgJzExMCc6IHsgeDogIDcxLCB5OiAzNzcsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnMTExJzogeyB4OiAgOTcsIHk6IDQyNywgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDEsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICcxMTInOiB7IHg6ICA1MSwgeTogIDU4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzExMyc6IHsgeDogIDUxLCB5OiAxMDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQ1LCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnMTE0JzogeyB4OiAgOTMsIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM1IH1cbiAgICAgICcxMTUnOiB7IHg6ICA1MSwgeTogMTYxLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzUgfVxuICAgICAgJzExNic6IHsgeDogIDUxLCB5OiAyMTEsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzMyB9XG4gICAgICAnMTE3JzogeyB4OiAgNTIsIHk6IDI2MSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICcxMTgnOiB7IHg6ICA5MywgeTogMzExLCB3aWR0aDogIDM0LCBoZWlnaHQ6ICA0MSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzIgfVxuICAgICAgJzExOSc6IHsgeDogMTE0LCB5OiAzNjAsIHdpZHRoOiAgMzgsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzOCB9XG4gICAgICAnMTIwJzogeyB4OiAxNDAsIHk6IDQxMCwgd2lkdGg6ICAzNiwgaGVpZ2h0OiAgNDEsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM3IH1cbiAgICAgICcxMjEnOiB7IHg6IDE0MCwgeTogNDU5LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzEyMic6IHsgeDogMTgzLCB5OiA0NTksIHdpZHRoOiAgMzYsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNSB9XG4gICAgICAnNjUnIDogeyB4OiAgOTQsIHk6ICA1OCwgd2lkdGg6ICAzNCwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cbiAgICAgICc2NicgOiB7IHg6ICA5NCwgeTogMTE5LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzcgfVxuICAgICAgJzY3JyA6IHsgeDogIDk0LCB5OiAxODAsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XG4gICAgICAnNjgnIDogeyB4OiAgOTUsIHk6IDI0MSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM3IH1cbiAgICAgICc2OScgOiB7IHg6IDEzNiwgeTogICA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxuICAgICAgJzcwJyA6IHsgeDogMTM3LCB5OiAgNjksIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnNzEnIDogeyB4OiAxNzksIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cbiAgICAgICc3MicgOiB7IHg6IDEzNywgeTogMTMwLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxuICAgICAgJzczJyA6IHsgeDogMTM4LCB5OiAxOTEsIHdpZHRoOiAgMTIsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAxMyB9XG4gICAgICAnNzQnIDogeyB4OiAxMzgsIHk6IDI1Miwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cbiAgICAgICc3NScgOiB7IHg6IDE1OCwgeTogMTkxLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxuICAgICAgJzc2JyA6IHsgeDogMTYwLCB5OiAzMTMsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnNzcnIDogeyB4OiAxODEsIHk6IDI1MSwgd2lkdGg6ICAzOCwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM5IH1cbiAgICAgICc3OCcgOiB7IHg6IDE4NCwgeTogMzc0LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxuICAgICAgJzc5JyA6IHsgeDogMjAzLCB5OiAzMTIsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNSB9XG4gICAgICAnODAnIDogeyB4OiAxODAsIHk6ICA2OSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICc4MScgOiB7IHg6IDIwMSwgeTogMTMwLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1NiwgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxuICAgICAgJzgyJyA6IHsgeDogMjIyLCB5OiAgIDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XG4gICAgICAnODMnIDogeyB4OiAyMjMsIHk6ICA2OSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM1IH1cbiAgICAgICc4NCcgOiB7IHg6IDI2NSwgeTogICA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzMgfVxuICAgICAgJzg1JyA6IHsgeDogMjI3LCB5OiAxOTQsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNSB9XG4gICAgICAnODYnIDogeyB4OiAyNDQsIHk6IDEzMCwgd2lkdGg6ICA0MSwgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDE5LCB4YWR2YW5jZTogIDM5IH1cbiAgICAgICc4NycgOiB7IHg6IDI2NiwgeTogIDY5LCB3aWR0aDogIDM4LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzcgfVxuICAgICAgJzg4JyA6IHsgeDogMzA4LCB5OiAgIDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAxOSwgeGFkdmFuY2U6ICAzNSB9XG4gICAgICAnODknIDogeyB4OiAyMjcsIHk6IDM3Mywgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDE5LCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICc5MCcgOiB7IHg6IDIyNywgeTogNDMzLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxuICAgICAgJzMzJyA6IHsgeDogMjQ2LCB5OiAyNTUsIHdpZHRoOiAgMTQsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAxMSB9XG4gICAgICAnNTknIDogeyB4OiAxODAsIHk6IDEzMCwgd2lkdGg6ICAxMywgaGVpZ2h0OiAgMzcsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDU2LCB4YWR2YW5jZTogIDEzIH1cbiAgICAgICczNycgOiB7IHg6ICA5NSwgeTogMzAyLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxuICAgICAgJzU4JyA6IHsgeDogMTYwLCB5OiAzNzQsIHdpZHRoOiAgMTMsIGhlaWdodDogIDIzLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA1MCwgeGFkdmFuY2U6ICAxMyB9XG4gICAgICAnNjMnIDogeyB4OiAyNjgsIHk6IDI1NSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDMzIH1cbiAgICAgICc0MicgOiB7IHg6IDEwMywgeTogMzAyLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxuICAgICAgJzQwJyA6IHsgeDogMjcwLCB5OiAxOTAsIHdpZHRoOiAgMjMsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAyMSB9XG4gICAgICAnNDEnIDogeyB4OiAyOTMsIHk6IDEzMCwgd2lkdGg6ICAyMywgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDIxIH1cbiAgICAgICc5NScgOiB7IHg6IDExMSwgeTogMzAyLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxuICAgICAgJzQzJyA6IHsgeDogMjQ2LCB5OiAzMTYsIHdpZHRoOiAgMzUsIGhlaWdodDogIDM0LCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAzOSwgeGFkdmFuY2U6ICAzMiB9XG4gICAgICAnNDUnIDogeyB4OiAxODQsIHk6IDQzNSwgd2lkdGg6ICAyNiwgaGVpZ2h0OiAgMTEsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDQ0LCB4YWR2YW5jZTogIDI1IH1cbiAgICAgICc2MScgOiB7IHg6IDMxMiwgeTogIDY4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICAzMCwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgNDIsIHhhZHZhbmNlOiAgMzMgfVxuICAgICAgJzQ2JyA6IHsgeDogMTM1LCB5OiAzMTMsIHdpZHRoOiAgMTQsIGhlaWdodDogIDExLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA2MSwgeGFkdmFuY2U6ICAxNCB9XG4gICAgICAnNDQnIDogeyB4OiAyMjcsIHk6IDI1NSwgd2lkdGg6ICAxMCwgaGVpZ2h0OiAgMjEsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDY4LCB4YWR2YW5jZTogIDExIH1cbiAgICAgICc0NycgOiB7IHg6IDM1MSwgeTogICA4LCB3aWR0aDogIDI4LCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgMTksIHhhZHZhbmNlOiAgMjYgfVxuICAgICAgJzEyNCc6IHsgeDogMTE5LCB5OiAzMDIsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XG4gICAgICAnMzQnIDogeyB4OiAxMjcsIHk6IDMwMiwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cbiAgICAgICczOScgOiB7IHg6IDIwMSwgeTogMTk0LCB3aWR0aDogIDE4LCBoZWlnaHQ6ICAxOSwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgIDAsIHhhZHZhbmNlOiAgMjEgfVxuICAgICAgJzY0JyA6IHsgeDogMjE4LCB5OiA0MzUsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XG4gICAgICAnMzUnIDogeyB4OiAyMTgsIHk6IDQ0Mywgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cbiAgICAgICczNicgOiB7IHg6IDMwMSwgeTogMTkwLCB3aWR0aDogIDMyLCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgMjIsIHhhZHZhbmNlOiAgMjkgfVxuICAgICAgJzk0JyA6IHsgeDogMjE4LCB5OiA0NTEsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XG4gICAgICAnMzgnIDogeyB4OiAyNDYsIHk6IDM1OCwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cbiAgICAgICcxMjMnOiB7IHg6IDMyNCwgeTogMTA2LCB3aWR0aDogIDI3LCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMjYgfVxuICAgICAgJzEyNSc6IHsgeDogMjcwLCB5OiAzNTgsIHdpZHRoOiAgMjcsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAyNyB9XG4gICAgICAnOTEnIDogeyB4OiAyNzAsIHk6IDQxOCwgd2lkdGg6ICAyMiwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDIxIH1cbiAgICAgICc5MycgOiB7IHg6IDMwMCwgeTogNDE4LCB3aWR0aDogIDIyLCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMjAgfVxuICAgICAgJzQ4JyA6IHsgeDogMzA1LCB5OiAzMTYsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XG4gICAgICAnNDknIDogeyB4OiAzMTEsIHk6IDI1MSwgd2lkdGg6ICAzNCwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM1IH1cbiAgICAgICc1MCcgOiB7IHg6IDM0MSwgeTogMTY2LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzcgfVxuICAgICAgJzUxJyA6IHsgeDogMzU5LCB5OiAgNjgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XG4gICAgICAnNTInIDogeyB4OiAzMzAsIHk6IDM3Nywgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM1IH1cbiAgICAgICc1MycgOiB7IHg6IDM0OCwgeTogMzEyLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzcgfVxuICAgICAgJzU0JyA6IHsgeDogMzMwLCB5OiA0MzgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XG4gICAgICAnNTUnIDogeyB4OiAzNTMsIHk6IDIyNywgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICc1NicgOiB7IHg6IDM4NCwgeTogMTI5LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxuICAgICAgJzU3JyA6IHsgeDogNDAyLCB5OiAgIDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XG4gICAgICAnMzInIDogeyB4OiAgIDAsIHk6ICAgMCwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDIyIH1cblxuICAgICAgIyBjYXJkIGdseXBoc1xuICAgICAgJzIwMCc6IHsgeDogMzk2LCB5OiAzNzgsIHdpZHRoOiAgNDAsIGhlaWdodDogIDQ5LCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMSwgeGFkdmFuY2U6ICA0MyB9ICMgU1xuICAgICAgJzIwMSc6IHsgeDogNDQ3LCB5OiAzMTMsIHdpZHRoOiAgNDksIGhlaWdodDogIDUwLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMSwgeGFkdmFuY2U6ICA1MiB9ICMgQ1xuICAgICAgJzIwMic6IHsgeDogMzk5LCB5OiAzMTMsIHdpZHRoOiAgMzYsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMSwgeGFkdmFuY2U6ICAzOSB9ICMgRFxuICAgICAgJzIwMyc6IHsgeDogNDUyLCB5OiAzODEsIHdpZHRoOiAgMzksIGhlaWdodDogIDQzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMSwgeGFkdmFuY2U6ICA0MiB9ICMgSFxuIiwiIyBUaGlzIGZpbGUgcHJvdmlkZXMgdGhlIHJlbmRlcmluZyBlbmdpbmUgZm9yIHRoZSB3ZWIgdmVyc2lvbi4gTm9uZSBvZiB0aGlzIGNvZGUgaXMgaW5jbHVkZWQgaW4gdGhlIEphdmEgdmVyc2lvbi5cblxuY29uc29sZS5sb2cgJ3dlYiBzdGFydHVwJ1xuXG5HYW1lID0gcmVxdWlyZSAnLi9HYW1lJ1xuXG4jIHRha2VuIGZyb20gaHR0cDojc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzU2MjM4MzgvcmdiLXRvLWhleC1hbmQtaGV4LXRvLXJnYlxuY29tcG9uZW50VG9IZXggPSAoYykgLT5cbiAgaGV4ID0gTWF0aC5mbG9vcihjICogMjU1KS50b1N0cmluZygxNilcbiAgcmV0dXJuIGlmIGhleC5sZW5ndGggPT0gMSB0aGVuIFwiMFwiICsgaGV4IGVsc2UgaGV4XG5yZ2JUb0hleCA9IChyLCBnLCBiKSAtPlxuICByZXR1cm4gXCIjXCIgKyBjb21wb25lbnRUb0hleChyKSArIGNvbXBvbmVudFRvSGV4KGcpICsgY29tcG9uZW50VG9IZXgoYilcblxuU0FWRV9USU1FUl9NUyA9IDMwMDBcblxuY2xhc3MgTmF0aXZlQXBwXG4gIGNvbnN0cnVjdG9yOiAoQHNjcmVlbiwgQHdpZHRoLCBAaGVpZ2h0KSAtPlxuICAgIEB0aW50ZWRUZXh0dXJlQ2FjaGUgPSBbXVxuICAgIEBsYXN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG4gICAgQGxhc3RJbnRlcmFjdFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuICAgIEBoZWFyZE9uZVRvdWNoID0gZmFsc2VcbiAgICBAdG91Y2hNb3VzZSA9IG51bGxcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2Vkb3duJywgIEBvbk1vdXNlRG93bi5iaW5kKHRoaXMpLCBmYWxzZVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdtb3VzZW1vdmUnLCAgQG9uTW91c2VNb3ZlLmJpbmQodGhpcyksIGZhbHNlXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNldXAnLCAgICBAb25Nb3VzZVVwLmJpbmQodGhpcyksIGZhbHNlXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ3RvdWNoc3RhcnQnLCBAb25Ub3VjaFN0YXJ0LmJpbmQodGhpcyksIGZhbHNlXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ3RvdWNobW92ZScsICBAb25Ub3VjaE1vdmUuYmluZCh0aGlzKSwgZmFsc2VcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAndG91Y2hlbmQnLCAgIEBvblRvdWNoRW5kLmJpbmQodGhpcyksIGZhbHNlXG4gICAgQGNvbnRleHQgPSBAc2NyZWVuLmdldENvbnRleHQoXCIyZFwiKVxuICAgIEB0ZXh0dXJlcyA9IFtcbiAgICAgICMgYWxsIGNhcmQgYXJ0XG4gICAgICBcIi4uL2ltYWdlcy9jYXJkcy5wbmdcIlxuICAgICAgIyBmb250c1xuICAgICAgXCIuLi9pbWFnZXMvZGFya2ZvcmVzdC5wbmdcIlxuICAgICAgIyBjaGFyYWN0ZXJzIC8gb3RoZXJcbiAgICAgIFwiLi4vaW1hZ2VzL2NoYXJzLnBuZ1wiXG4gICAgICAjIGhlbHBcbiAgICAgIFwiLi4vaW1hZ2VzL2hvd3RvMS5wbmdcIlxuICAgICAgXCIuLi9pbWFnZXMvaG93dG8yLnBuZ1wiXG4gICAgICBcIi4uL2ltYWdlcy9ob3d0bzMucG5nXCJcbiAgICBdXG5cbiAgICBAZ2FtZSA9IG5ldyBHYW1lKHRoaXMsIEB3aWR0aCwgQGhlaWdodClcblxuICAgIGlmIHR5cGVvZiBTdG9yYWdlICE9IFwidW5kZWZpbmVkXCJcbiAgICAgIHN0YXRlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0gXCJzdGF0ZVwiXG4gICAgICBpZiBzdGF0ZVxuICAgICAgICAjIGNvbnNvbGUubG9nIFwibG9hZGluZyBzdGF0ZTogI3tzdGF0ZX1cIlxuICAgICAgICBAZ2FtZS5sb2FkIHN0YXRlXG5cbiAgICBAcGVuZGluZ0ltYWdlcyA9IDBcbiAgICBsb2FkZWRUZXh0dXJlcyA9IFtdXG4gICAgZm9yIGltYWdlVXJsIGluIEB0ZXh0dXJlc1xuICAgICAgQHBlbmRpbmdJbWFnZXMrK1xuICAgICAgY29uc29sZS5sb2cgXCJsb2FkaW5nIGltYWdlICN7QHBlbmRpbmdJbWFnZXN9OiAje2ltYWdlVXJsfVwiXG4gICAgICBpbWcgPSBuZXcgSW1hZ2UoKVxuICAgICAgaW1nLm9ubG9hZCA9IEBvbkltYWdlTG9hZGVkLmJpbmQodGhpcylcbiAgICAgIGltZy5zcmMgPSBpbWFnZVVybFxuICAgICAgbG9hZGVkVGV4dHVyZXMucHVzaCBpbWdcbiAgICBAdGV4dHVyZXMgPSBsb2FkZWRUZXh0dXJlc1xuXG4gICAgQHNhdmVUaW1lciA9IFNBVkVfVElNRVJfTVNcblxuICBvbkltYWdlTG9hZGVkOiAoaW5mbykgLT5cbiAgICBAcGVuZGluZ0ltYWdlcy0tXG4gICAgaWYgQHBlbmRpbmdJbWFnZXMgPT0gMFxuICAgICAgY29uc29sZS5sb2cgJ0FsbCBpbWFnZXMgbG9hZGVkLiBCZWdpbm5pbmcgcmVuZGVyIGxvb3AuJ1xuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0+IEB1cGRhdGUoKVxuXG4gIGxvZzogKHMpIC0+XG4gICAgY29uc29sZS5sb2cgXCJOYXRpdmVBcHAubG9nKCk6ICN7c31cIlxuXG4gIHVwZGF0ZVNhdmU6IChkdCkgLT5cbiAgICByZXR1cm4gaWYgdHlwZW9mIFN0b3JhZ2UgPT0gXCJ1bmRlZmluZWRcIlxuICAgIEBzYXZlVGltZXIgLT0gZHRcbiAgICBpZiBAc2F2ZVRpbWVyIDw9IDBcbiAgICAgIEBzYXZlVGltZXIgPSBTQVZFX1RJTUVSX01TXG4gICAgICBzdGF0ZSA9IEBnYW1lLnNhdmUoKVxuICAgICAgIyBjb25zb2xlLmxvZyBcInNhdmluZzogI3tzdGF0ZX1cIlxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0gXCJzdGF0ZVwiLCBzdGF0ZVxuXG4gIGdlbmVyYXRlVGludEltYWdlOiAodGV4dHVyZUluZGV4LCByZWQsIGdyZWVuLCBibHVlKSAtPlxuICAgIGltZyA9IEB0ZXh0dXJlc1t0ZXh0dXJlSW5kZXhdXG4gICAgYnVmZiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgXCJjYW52YXNcIlxuICAgIGJ1ZmYud2lkdGggID0gaW1nLndpZHRoXG4gICAgYnVmZi5oZWlnaHQgPSBpbWcuaGVpZ2h0XG5cbiAgICBjdHggPSBidWZmLmdldENvbnRleHQgXCIyZFwiXG4gICAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdjb3B5J1xuICAgIGN0eC5kcmF3SW1hZ2UoaW1nLCAwLCAwKVxuICAgIGZpbGxDb2xvciA9IFwicmdiKCN7TWF0aC5mbG9vcihyZWQqMjU1KX0sICN7TWF0aC5mbG9vcihncmVlbioyNTUpfSwgI3tNYXRoLmZsb29yKGJsdWUqMjU1KX0pXCJcbiAgICBjdHguZmlsbFN0eWxlID0gZmlsbENvbG9yXG4gICAgY29uc29sZS5sb2cgXCJmaWxsQ29sb3IgI3tmaWxsQ29sb3J9XCJcbiAgICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ211bHRpcGx5J1xuICAgIGN0eC5maWxsUmVjdCgwLCAwLCBidWZmLndpZHRoLCBidWZmLmhlaWdodClcbiAgICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2NvcHknXG4gICAgY3R4Lmdsb2JhbEFscGhhID0gMS4wXG4gICAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdkZXN0aW5hdGlvbi1pbidcbiAgICBjdHguZHJhd0ltYWdlKGltZywgMCwgMClcblxuICAgIGltZ0NvbXAgPSBuZXcgSW1hZ2UoKVxuICAgIGltZ0NvbXAuc3JjID0gYnVmZi50b0RhdGFVUkwoKVxuICAgIHJldHVybiBpbWdDb21wXG5cbiAgZHJhd0ltYWdlOiAodGV4dHVyZUluZGV4LCBzcmNYLCBzcmNZLCBzcmNXLCBzcmNILCBkc3RYLCBkc3RZLCBkc3RXLCBkc3RILCByb3QsIGFuY2hvclgsIGFuY2hvclksIHIsIGcsIGIsIGEpIC0+XG4gICAgdGV4dHVyZSA9IEB0ZXh0dXJlc1t0ZXh0dXJlSW5kZXhdXG4gICAgaWYgKHIgIT0gMSkgb3IgKGcgIT0gMSkgb3IgKGIgIT0gMSlcbiAgICAgIHRpbnRlZFRleHR1cmVLZXkgPSBcIiN7dGV4dHVyZUluZGV4fS0je3J9LSN7Z30tI3tifVwiXG4gICAgICB0aW50ZWRUZXh0dXJlID0gQHRpbnRlZFRleHR1cmVDYWNoZVt0aW50ZWRUZXh0dXJlS2V5XVxuICAgICAgaWYgbm90IHRpbnRlZFRleHR1cmVcbiAgICAgICAgdGludGVkVGV4dHVyZSA9IEBnZW5lcmF0ZVRpbnRJbWFnZSB0ZXh0dXJlSW5kZXgsIHIsIGcsIGJcbiAgICAgICAgQHRpbnRlZFRleHR1cmVDYWNoZVt0aW50ZWRUZXh0dXJlS2V5XSA9IHRpbnRlZFRleHR1cmVcbiAgICAgICAgIyBjb25zb2xlLmxvZyBcImdlbmVyYXRlZCBjYWNoZWQgdGV4dHVyZSAje3RpbnRlZFRleHR1cmVLZXl9XCJcbiAgICAgIHRleHR1cmUgPSB0aW50ZWRUZXh0dXJlXG5cbiAgICBAY29udGV4dC5zYXZlKClcbiAgICBAY29udGV4dC50cmFuc2xhdGUgZHN0WCwgZHN0WVxuICAgIEBjb250ZXh0LnJvdGF0ZSByb3QgIyAqIDMuMTQxNTkyIC8gMTgwLjBcbiAgICBhbmNob3JPZmZzZXRYID0gLTEgKiBhbmNob3JYICogZHN0V1xuICAgIGFuY2hvck9mZnNldFkgPSAtMSAqIGFuY2hvclkgKiBkc3RIXG4gICAgQGNvbnRleHQudHJhbnNsYXRlIGFuY2hvck9mZnNldFgsIGFuY2hvck9mZnNldFlcbiAgICBAY29udGV4dC5nbG9iYWxBbHBoYSA9IGFcbiAgICBAY29udGV4dC5kcmF3SW1hZ2UodGV4dHVyZSwgc3JjWCwgc3JjWSwgc3JjVywgc3JjSCwgMCwgMCwgZHN0VywgZHN0SClcbiAgICBAY29udGV4dC5yZXN0b3JlKClcblxuICB1cGRhdGU6IC0+XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0+IEB1cGRhdGUoKVxuXG4gICAgbm93ID0gbmV3IERhdGUoKS5nZXRUaW1lKClcbiAgICBkdCA9IG5vdyAtIEBsYXN0VGltZVxuXG4gICAgdGltZVNpbmNlSW50ZXJhY3QgPSBub3cgLSBAbGFzdEludGVyYWN0VGltZVxuICAgIGlmIHRpbWVTaW5jZUludGVyYWN0ID4gNTAwMFxuICAgICAgZ29hbEZQUyA9IDUgIyBjYWxtIGRvd24sIG5vYm9keSBpcyBkb2luZyBhbnl0aGluZyBmb3IgNSBzZWNvbmRzXG4gICAgZWxzZVxuICAgICAgZ29hbEZQUyA9IDIwMCAjIGFzIGZhc3QgYXMgcG9zc2libGVcbiAgICBpZiBAbGFzdEdvYWxGUFMgIT0gZ29hbEZQU1xuICAgICAgY29uc29sZS5sb2cgXCJzd2l0Y2hpbmcgdG8gI3tnb2FsRlBTfSBGUFNcIlxuICAgICAgQGxhc3RHb2FsRlBTID0gZ29hbEZQU1xuXG4gICAgZnBzSW50ZXJ2YWwgPSAxMDAwIC8gZ29hbEZQU1xuICAgIGlmIGR0IDwgZnBzSW50ZXJ2YWxcbiAgICAgIHJldHVyblxuICAgIEBsYXN0VGltZSA9IG5vd1xuXG4gICAgQGNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIEB3aWR0aCwgQGhlaWdodClcbiAgICBAZ2FtZS51cGRhdGUoZHQpXG4gICAgcmVuZGVyQ29tbWFuZHMgPSBAZ2FtZS5yZW5kZXIoKVxuXG4gICAgaSA9IDBcbiAgICBuID0gcmVuZGVyQ29tbWFuZHMubGVuZ3RoXG4gICAgd2hpbGUgKGkgPCBuKVxuICAgICAgZHJhd0NhbGwgPSByZW5kZXJDb21tYW5kcy5zbGljZShpLCBpICs9IDE2KVxuICAgICAgQGRyYXdJbWFnZS5hcHBseSh0aGlzLCBkcmF3Q2FsbClcblxuICAgIEB1cGRhdGVTYXZlKGR0KVxuXG4gIG9uVG91Y2hTdGFydDogKGV2dCkgLT5cbiAgICBAbGFzdEludGVyYWN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG4gICAgQGhlYXJkT25lVG91Y2ggPSB0cnVlXG4gICAgdG91Y2hlcyA9IGV2dC5jaGFuZ2VkVG91Y2hlc1xuICAgIGZvciB0b3VjaCBpbiB0b3VjaGVzXG4gICAgICBpZiBAdG91Y2hNb3VzZSA9PSBudWxsXG4gICAgICAgIEB0b3VjaE1vdXNlID0gdG91Y2guaWRlbnRpZmllclxuICAgICAgaWYgQHRvdWNoTW91c2UgPT0gdG91Y2guaWRlbnRpZmllclxuICAgICAgICBAZ2FtZS50b3VjaERvd24odG91Y2guY2xpZW50WCwgdG91Y2guY2xpZW50WSlcblxuICBvblRvdWNoTW92ZTogKGV2dCkgLT5cbiAgICBAbGFzdEludGVyYWN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG4gICAgdG91Y2hlcyA9IGV2dC5jaGFuZ2VkVG91Y2hlc1xuICAgIGZvciB0b3VjaCBpbiB0b3VjaGVzXG4gICAgICBpZiBAdG91Y2hNb3VzZSA9PSB0b3VjaC5pZGVudGlmaWVyXG4gICAgICAgIEBnYW1lLnRvdWNoTW92ZSh0b3VjaC5jbGllbnRYLCB0b3VjaC5jbGllbnRZKVxuXG4gIG9uVG91Y2hFbmQ6IChldnQpIC0+XG4gICAgQGxhc3RJbnRlcmFjdFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuICAgIHRvdWNoZXMgPSBldnQuY2hhbmdlZFRvdWNoZXNcbiAgICBmb3IgdG91Y2ggaW4gdG91Y2hlc1xuICAgICAgaWYgQHRvdWNoTW91c2UgPT0gdG91Y2guaWRlbnRpZmllclxuICAgICAgICBAZ2FtZS50b3VjaFVwKHRvdWNoLmNsaWVudFgsIHRvdWNoLmNsaWVudFkpXG4gICAgICAgIEB0b3VjaE1vdXNlID0gbnVsbFxuICAgIGlmIGV2dC50b3VjaGVzLmxlbmd0aCA9PSAwXG4gICAgICBAdG91Y2hNb3VzZSA9IG51bGxcblxuICBvbk1vdXNlRG93bjogKGV2dCkgLT5cbiAgICBpZiBAaGVhcmRPbmVUb3VjaFxuICAgICAgcmV0dXJuXG4gICAgQGxhc3RJbnRlcmFjdFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuICAgIEBnYW1lLnRvdWNoRG93bihldnQuY2xpZW50WCwgZXZ0LmNsaWVudFkpXG5cbiAgb25Nb3VzZU1vdmU6IChldnQpIC0+XG4gICAgaWYgQGhlYXJkT25lVG91Y2hcbiAgICAgIHJldHVyblxuICAgIEBsYXN0SW50ZXJhY3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcbiAgICBAZ2FtZS50b3VjaE1vdmUoZXZ0LmNsaWVudFgsIGV2dC5jbGllbnRZKVxuXG4gIG9uTW91c2VVcDogKGV2dCkgLT5cbiAgICBpZiBAaGVhcmRPbmVUb3VjaFxuICAgICAgcmV0dXJuXG4gICAgQGxhc3RJbnRlcmFjdFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuICAgIEBnYW1lLnRvdWNoVXAoZXZ0LmNsaWVudFgsIGV2dC5jbGllbnRZKVxuXG5zY3JlZW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAnc2NyZWVuJ1xucmVzaXplU2NyZWVuID0gLT5cbiAgZGVzaXJlZEFzcGVjdFJhdGlvID0gMTYgLyA5XG4gIGN1cnJlbnRBc3BlY3RSYXRpbyA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0XG4gIGlmIGN1cnJlbnRBc3BlY3RSYXRpbyA8IGRlc2lyZWRBc3BlY3RSYXRpb1xuICAgIHNjcmVlbi53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG4gICAgc2NyZWVuLmhlaWdodCA9IE1hdGguZmxvb3Iod2luZG93LmlubmVyV2lkdGggKiAoMSAvIGRlc2lyZWRBc3BlY3RSYXRpbykpXG4gIGVsc2VcbiAgICBzY3JlZW4ud2lkdGggPSBNYXRoLmZsb29yKHdpbmRvdy5pbm5lckhlaWdodCAqIGRlc2lyZWRBc3BlY3RSYXRpbylcbiAgICBzY3JlZW4uaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0XG5yZXNpemVTY3JlZW4oKVxuIyB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAncmVzaXplJywgcmVzaXplU2NyZWVuLCBmYWxzZVxuXG5hcHAgPSBuZXcgTmF0aXZlQXBwKHNjcmVlbiwgc2NyZWVuLndpZHRoLCBzY3JlZW4uaGVpZ2h0KVxuIl19
