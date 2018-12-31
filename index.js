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
var Animation, BUILD_TIMESTAMP, Button, FontRenderer, Game, Hand, Menu, OK, Pile, RenderMode, SpriteRenderer, Thirteen, achievementsList, aiCharacters, ref;

Animation = require('./Animation');

Button = require('./Button');

FontRenderer = require('./FontRenderer');

SpriteRenderer = require('./SpriteRenderer');

Menu = require('./Menu');

Hand = require('./Hand');

Pile = require('./Pile');

ref = require('./Thirteen'), Thirteen = ref.Thirteen, OK = ref.OK, aiCharacters = ref.aiCharacters, achievementsList = ref.achievementsList;

BUILD_TIMESTAMP = "1.19";

RenderMode = {
  GAME: 0,
  HOWTO: 1,
  ACHIEVEMENTS: 2,
  PAUSE: 3,
  OPTIONS: 4
};

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
    this.pauseButtonSize = this.aaHeight / 12;
    this.colors = {
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
      background: {
        r: 0,
        g: 0.2,
        b: 0,
        a: 1
      },
      bid: {
        r: 0,
        g: 0.6,
        b: 0,
        a: 1
      },
      black: {
        r: 0,
        g: 0,
        b: 0,
        a: 1
      },
      buttontext: {
        r: 1,
        g: 1,
        b: 1,
        a: 1
      },
      game_over: {
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
      hand_any: {
        r: 0,
        g: 0,
        b: 0.2,
        a: 1.0
      },
      hand_pick: {
        r: 0,
        g: 0.1,
        b: 0,
        a: 1.0
      },
      hand_drag: {
        r: 0.4,
        g: 0,
        b: 0,
        a: 1.0
      },
      hand_push: {
        r: 0.2,
        g: 0,
        b: 0.2,
        a: 1.0
      },
      lightgray: {
        r: 0.5,
        g: 0.5,
        b: 0.5,
        a: 1
      },
      logbg: {
        r: 0.1,
        g: 0,
        b: 0,
        a: 1
      },
      logcolor: {
        r: 0.5,
        g: 0.5,
        b: 0.5,
        a: 1
      },
      mainmenu: {
        r: 0.1,
        g: 0.1,
        b: 0.1,
        a: 1
      },
      orange: {
        r: 1,
        g: 0.5,
        b: 0,
        a: 1
      },
      overlay: {
        r: 0,
        g: 0,
        b: 0,
        a: 0.6
      },
      pausemenu: {
        r: 0.1,
        g: 0.0,
        b: 0.1,
        a: 1
      },
      optionmenu: {
        r: 0.0,
        g: 0.1,
        b: 0.1,
        a: 1
      },
      pile: {
        r: 0.4,
        g: 0.2,
        b: 0,
        a: 1
      },
      play_again: {
        r: 0,
        g: 0,
        b: 0,
        a: 0.6
      },
      red: {
        r: 1,
        g: 0,
        b: 0,
        a: 1
      },
      white: {
        r: 1,
        g: 1,
        b: 1,
        a: 1
      },
      ach_bg: {
        r: 0.1,
        g: 0.1,
        b: 0.1,
        a: 1
      },
      ach_header: {
        r: 1,
        g: 0.5,
        b: 0,
        a: 1
      },
      ach_title: {
        r: 1,
        g: 1,
        b: 1,
        a: 1
      },
      ach_desc: {
        r: 0.7,
        g: 0.7,
        b: 0.7,
        a: 1
      },
      ach_button: {
        r: 0.7,
        g: 0.7,
        b: 0.3,
        a: 1
      },
      transparent: {
        r: 1,
        g: 1,
        b: 1,
        a: 0
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
    this.renderMode = RenderMode.GAME;
    this.renderCommands = [];
    this.achievementFanfare = null;
    this.achievementsPage = 0;
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
      ],
      autopasses: [
        {
          text: "AutoPass: Disabled"
        }, {
          text: "AutoPass: Full"
        }, {
          text: "AutoPass: Limited"
        }
      ]
    };
    this.options = {
      speedIndex: 1,
      sortIndex: 0,
      sound: true,
      autopassIndex: 2,
      pushSorting: false,
      givingUp: true
    };
    this.pauseMenu = new Menu(this, "Paused", "solid", this.colors.pausemenu, [
      (function(_this) {
        return function(click) {
          if (click) {
            _this.renderMode = RenderMode.GAME;
          }
          return "Resume Game";
        };
      })(this), (function(_this) {
        return function(click) {
          if (click) {
            _this.renderMode = RenderMode.OPTIONS;
          }
          return "Options";
        };
      })(this), (function(_this) {
        return function(click) {
          if (click) {
            _this.renderMode = RenderMode.ACHIEVEMENTS;
          }
          return "Achievements";
        };
      })(this), (function(_this) {
        return function(click) {
          if (click) {
            _this.renderMode = RenderMode.HOWTO;
          }
          return "How To Play";
        };
      })(this), (function(_this) {
        return function(click) {
          if (click) {
            _this.newGame(true);
            _this.renderMode = RenderMode.GAME;
          }
          return "New Money Game";
        };
      })(this), (function(_this) {
        return function(click) {
          if (click) {
            _this.newGame(false);
            _this.renderMode = RenderMode.GAME;
          }
          return "New Game";
        };
      })(this)
    ]);
    this.optionMenu = new Menu(this, "Options", "solid", this.colors.optionmenu, [
      (function(_this) {
        return function(click) {
          if (click) {
            _this.options.speedIndex = (_this.options.speedIndex + 1) % _this.optionMenus.speeds.length;
          }
          return _this.optionMenus.speeds[_this.options.speedIndex].text;
        };
      })(this), (function(_this) {
        return function(click) {
          if (click) {
            _this.options.autopassIndex = (_this.options.autopassIndex + 1) % _this.optionMenus.autopasses.length;
          }
          return _this.optionMenus.autopasses[_this.options.autopassIndex].text;
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
            _this.options.givingUp = !_this.options.givingUp;
          }
          if (_this.options.givingUp) {
            return "Giving Up: Enabled";
          }
          return "Giving Up: Disabled";
        };
      })(this), (function(_this) {
        return function(click) {
          if (click) {
            _this.options.pushSorting = !_this.options.pushSorting;
          }
          if (_this.options.pushSorting) {
            return "Push Sorting: Enabled";
          }
          return "Push Sorting: Disabled";
        };
      })(this), (function(_this) {
        return function(click) {
          if (click) {
            _this.renderMode = RenderMode.PAUSE;
          }
          return "Back";
        };
      })(this)
    ]);
    this.thirteen = new Thirteen(this, {});
    this.log("player 0's hand: " + JSON.stringify(this.thirteen.players[0].hand));
    this.prepareGame();
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

  Game.prototype.newGame = function(money) {
    this.thirteen.newGame(money);
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
    var firstLine, moneyDelta, secondLine, winner;
    winner = this.thirteen.winner();
    firstLine = winner.name + " wins!";
    secondLine = "Try Again...";
    if (winner.name === "Player") {
      firstLine = "You win!";
      if (this.thirteen.lastStreak === 1) {
        secondLine = "A new streak!";
      } else {
        secondLine = this.thirteen.lastStreak + " in a row!";
      }
    } else {
      if (this.thirteen.lastStreak === 0) {
        secondLine = "Try again...";
      } else {
        secondLine = "Streak ended: " + this.thirteen.lastStreak + " wins";
      }
    }
    if (this.thirteen.someoneGaveUp()) {
      moneyDelta = this.thirteen.players[0].money - Thirteen.STARTING_MONEY;
      if (moneyDelta > 0) {
        secondLine = "Game Over: You won $" + moneyDelta;
      } else if (moneyDelta < 0) {
        secondLine = "Game Over: You lost $" + (-1 * moneyDelta);
      } else {
        secondLine = "Game Over: You broke even!";
      }
    }
    return [firstLine, secondLine];
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
    if (!this.hand.picking()) {
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
    if (this.updateGame(dt)) {
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
    if (this.optionMenu.update(dt)) {
      updated = true;
    }
    if (this.achievementFanfare !== null) {
      this.achievementFanfare.time += dt;
      if (this.achievementFanfare.time > 5000) {
        this.achievementFanfare = null;
      }
      updated = true;
    }
    if (this.achievementFanfare === null) {
      if (this.thirteen.fanfares.length > 0) {
        this.achievementFanfare = {
          title: this.thirteen.fanfares.shift(),
          time: 0
        };
      }
    }
    return updated;
  };

  Game.prototype.render = function() {
    this.renderCommands.length = 0;
    switch (this.renderMode) {
      case RenderMode.HOWTO:
        this.renderHowto();
        break;
      case RenderMode.ACHIEVEMENTS:
        this.renderAchievements();
        break;
      case RenderMode.OPTIONS:
        this.renderOptions();
        break;
      case RenderMode.PAUSE:
        this.renderPause();
        break;
      default:
        this.renderGame();
    }
    return this.renderCommands;
  };

  Game.prototype.renderPause = function() {
    return this.pauseMenu.render();
  };

  Game.prototype.renderOptions = function() {
    return this.optionMenu.render();
  };

  Game.prototype.renderHowto = function() {
    var howtoTexture;
    howtoTexture = "howto1";
    this.log("rendering " + howtoTexture);
    this.spriteRenderer.render("solid", 0, 0, this.width, this.height, 0, 0, 0, this.colors.black);
    return this.spriteRenderer.render(howtoTexture, 0, 0, this.width, this.aaHeight, 0, 0, 0, this.colors.white, (function(_this) {
      return function() {
        return _this.renderMode = RenderMode.PAUSE;
      };
    })(this));
  };

  Game.prototype.debug = function() {
    console.log("debug ach");
    return console.log(this.thirteen.ach);
  };

  Game.prototype.renderAchievements = function() {
    var ach, achIndex, achScreenIndex, achievementsCount, achievementsEarned, achievementsPageCount, descHeight, endAchIndex, icon, imageDim, imageMargin, j, l, len, nextDim, progress, ref1, ref2, results, startAchIndex, titleHeight, titleOffset, titleText, topHeight, x, y;
    this.spriteRenderer.render("solid", 0, 0, this.width, this.height, 0, 0, 0, this.colors.ach_bg, (function(_this) {
      return function() {
        return _this.renderMode = RenderMode.PAUSE;
      };
    })(this));
    achievementsCount = achievementsList.length;
    achievementsPageCount = Math.ceil(achievementsCount / 14);
    achievementsEarned = 0;
    for (achIndex = j = 0, len = achievementsList.length; j < len; achIndex = ++j) {
      ach = achievementsList[achIndex];
      if (this.thirteen.ach.earned[ach.id]) {
        achievementsEarned += 1;
      }
    }
    titleText = "Achievements - " + achievementsEarned + " / " + achievementsCount + " Complete - Page " + (this.achievementsPage + 1) + " of " + achievementsPageCount;
    titleHeight = this.height / 20;
    titleOffset = titleHeight / 2;
    this.fontRenderer.render(this.font, titleHeight, titleText, this.center.x, titleOffset, 0.5, 0.5, this.colors.ach_header);
    if (achievementsPageCount > 1) {
      nextDim = this.width * 0.1;
      this.fontRenderer.render(this.font, titleHeight, "[ Next ]", this.width, titleOffset, 1, 0.5, this.colors.ach_button);
      this.spriteRenderer.render("solid", this.width - nextDim, 0, nextDim, nextDim, 0, 0, 0, this.colors.transparent, (function(_this) {
        return function() {
          return _this.achievementsPage = (_this.achievementsPage + 1) % achievementsPageCount;
        };
      })(this));
    }
    imageMargin = this.width / 15;
    topHeight = titleHeight;
    x = this.width / 120;
    y = topHeight;
    titleHeight = this.height / 22;
    descHeight = this.height / 30;
    imageDim = titleHeight * 2;
    startAchIndex = this.achievementsPage * 14;
    endAchIndex = startAchIndex + 14;
    if (endAchIndex > (achievementsList.length - 1)) {
      endAchIndex = achievementsList.length - 1;
    }
    results = [];
    for (achIndex = l = ref1 = startAchIndex, ref2 = endAchIndex; ref1 <= ref2 ? l <= ref2 : l >= ref2; achIndex = ref1 <= ref2 ? ++l : --l) {
      achScreenIndex = achIndex - startAchIndex;
      ach = achievementsList[achIndex];
      icon = "star_off";
      if (this.thirteen.ach.earned[ach.id]) {
        icon = "star_on";
      }
      this.spriteRenderer.render(icon, x, y, imageDim, imageDim, 0, 0, 0, this.colors.white);
      this.fontRenderer.render(this.font, titleHeight, ach.title, x + imageMargin, y, 0, 0, this.colors.ach_title);
      this.fontRenderer.render(this.font, descHeight, ach.description[0], x + imageMargin, y + titleHeight, 0, 0, this.colors.ach_desc);
      if (ach.progress != null) {
        progress = ach.progress(this.thirteen.ach);
        this.fontRenderer.render(this.font, descHeight, progress, x + imageMargin, y + titleHeight + descHeight, 0, 0, this.colors.ach_desc);
      } else {
        if (ach.description.length > 1) {
          this.fontRenderer.render(this.font, descHeight, ach.description[1], x + imageMargin, y + titleHeight + descHeight, 0, 0, this.colors.ach_desc);
        }
      }
      if (achScreenIndex === 6) {
        y = topHeight;
        results.push(x += this.width / 2);
      } else {
        results.push(y += titleHeight * 3);
      }
    }
    return results;
  };

  Game.prototype.renderAIHand = function(hand, x, y, offset) {
    var i, j, len, raw, results, sorted;
    sorted = hand.sort(function(a, b) {
      return a - b;
    });
    results = [];
    for (i = j = 0, len = sorted.length; j < len; i = ++j) {
      raw = sorted[i];
      results.push(this.hand.renderCard(raw, x + (i * offset), y, 0, 0.7, 0));
    }
    return results;
  };

  Game.prototype.renderGame = function() {
    var aiCardSpacing, aiPlayers, cardAreaText, character, characterHeight, characterMargin, characterWidth, color, countHeight, drawGameOver, gameOverSize, gameOverY, handAreaHeight, handareaColor, i, j, len, line, lines, opacity, pileDimension, pileSprite, playAgainText, ref1, restartQuitSize, shadowDistance, textHeight, textPadding, x, xText, y;
    this.spriteRenderer.render("solid", 0, 0, this.width, this.height, 0, 0, 0, this.colors.background);
    textHeight = this.aaHeight / 25;
    textPadding = textHeight / 5;
    characterHeight = this.aaHeight / 5;
    countHeight = textHeight;
    drawGameOver = this.thirteen.gameOver() && this.pile.resting();
    ref1 = this.thirteen.log;
    for (i = j = 0, len = ref1.length; j < len; i = ++j) {
      line = ref1[i];
      this.fontRenderer.render(this.font, textHeight, line, 0, (i + 1.5) * (textHeight + textPadding), 0, 0, this.colors.logcolor);
    }
    aiPlayers = [this.thirteen.players[1], this.thirteen.players[2], this.thirteen.players[3]];
    characterMargin = characterHeight / 2;
    this.charCeiling = this.height * 0.6;
    aiCardSpacing = this.width * 0.015;
    if (aiPlayers[0] !== null) {
      if (drawGameOver) {
        this.renderAIHand(aiPlayers[0].hand, this.width * 0.2, this.height * 0.62, aiCardSpacing);
      }
      character = aiCharacters[aiPlayers[0].charID];
      characterWidth = this.spriteRenderer.calcWidth(character.sprite, characterHeight);
      this.spriteRenderer.render(character.sprite, characterMargin, this.charCeiling, 0, characterHeight, 0, 0, 1, this.colors.white, (function(_this) {
        return function() {};
      })(this));
      this.renderCount(aiPlayers[0], this.thirteen.money, drawGameOver, aiPlayers[0].index === this.thirteen.turn, countHeight, characterMargin + (characterWidth / 2), this.charCeiling - textPadding, 0.5, 0);
    }
    if (aiPlayers[1] !== null) {
      if (drawGameOver) {
        this.renderAIHand(aiPlayers[1].hand, this.width * 0.6, this.height * 0.18, aiCardSpacing);
      }
      character = aiCharacters[aiPlayers[1].charID];
      this.spriteRenderer.render(character.sprite, this.center.x, 0, 0, characterHeight, 0, 0.5, 0, this.colors.white);
      this.renderCount(aiPlayers[1], this.thirteen.money, drawGameOver, aiPlayers[1].index === this.thirteen.turn, countHeight, this.center.x, characterHeight, 0.5, 0);
    }
    if (aiPlayers[2] !== null) {
      if (drawGameOver) {
        this.renderAIHand(aiPlayers[2].hand, this.width * 0.7, this.height * 0.62, aiCardSpacing);
      }
      character = aiCharacters[aiPlayers[2].charID];
      characterWidth = this.spriteRenderer.calcWidth(character.sprite, characterHeight);
      this.spriteRenderer.render(character.sprite, this.width - characterMargin, this.charCeiling, 0, characterHeight, 0, 1, 1, this.colors.white);
      this.renderCount(aiPlayers[2], this.thirteen.money, drawGameOver, aiPlayers[2].index === this.thirteen.turn, countHeight, this.width - (characterMargin + (characterWidth / 2)), this.charCeiling - textPadding, 0.5, 0);
    }
    handAreaHeight = 0.27 * this.height;
    cardAreaText = null;
    switch (this.hand.mode) {
      case Hand.PICKING:
        handareaColor = this.colors.hand_pick;
        if ((this.thirteen.turn === 0) && (this.thirteen.everyonePassed() || (this.thirteen.currentPlay === null))) {
          handareaColor = this.colors.hand_any;
          if (this.thirteen.pile.length === 0) {
            cardAreaText = 'Anything (3\xc8)';
          } else {
            cardAreaText = 'Anything';
          }
        }
        break;
      case Hand.PUSHING:
        handareaColor = this.colors.hand_push;
        cardAreaText = 'Sorting';
        break;
      default:
        cardAreaText = 'Dragging';
        handareaColor = this.colors.hand_drag;
    }
    this.spriteRenderer.render("solid", 0, this.height, this.width, handAreaHeight, 0, 0, 1, handareaColor, (function(_this) {
      return function() {
        return _this.hand.cycleMode();
      };
    })(this));
    pileDimension = this.height * 0.4;
    pileSprite = "pile";
    if ((this.thirteen.turn >= 0) && (this.thirteen.turn <= 3)) {
      pileSprite += this.thirteen.turn;
    }
    this.spriteRenderer.render(pileSprite, this.width / 2, this.height / 2, pileDimension, pileDimension, 0, 0.5, 0.5, this.colors.white, (function(_this) {
      return function() {
        return _this.playPicked();
      };
    })(this));
    this.pile.render();
    this.hand.render();
    if (drawGameOver) {
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
      playAgainText = "Play Again";
      if (this.thirteen.someoneGaveUp()) {
        playAgainText = "New Money Game";
      }
      this.spriteRenderer.render("solid", 0, this.height, this.width, handAreaHeight, 0, 0, 1, this.colors.play_again, (function(_this) {
        return function() {
          if (_this.thirteen.someoneGaveUp()) {
            _this.thirteen.newGame(true, true);
          } else {
            _this.thirteen.deal();
          }
          return _this.prepareGame();
        };
      })(this));
      restartQuitSize = this.aaHeight / 12;
      shadowDistance = restartQuitSize / 8;
      this.fontRenderer.render(this.font, restartQuitSize, playAgainText, shadowDistance + this.center.x, shadowDistance + (this.height - (handAreaHeight * 0.5)), 0.5, 1, this.colors.black);
      this.fontRenderer.render(this.font, restartQuitSize, playAgainText, this.center.x, this.height - (handAreaHeight * 0.5), 0.5, 1, this.colors.gold);
    }
    this.renderCount(this.thirteen.players[0], this.thirteen.money, drawGameOver, 0 === this.thirteen.turn, countHeight, this.center.x, this.height, 0.5, 1);
    this.fontRenderer.render(this.font, textHeight, this.calcHeadline(), 0, 0, 0, 0, this.colors.lightgray);
    this.spriteRenderer.render("pause", this.width, 0, 0, this.pauseButtonSize, 0, 1, 0, this.colors.white, (function(_this) {
      return function() {
        return _this.renderMode = RenderMode.PAUSE;
      };
    })(this));
    if (cardAreaText !== null) {
      this.fontRenderer.render(this.font, textHeight, cardAreaText, 0.02 * this.width, this.height - handAreaHeight, 0, 0, this.colors.white);
    }
    if (this.achievementFanfare !== null) {
      if (this.achievementFanfare.time < 1000) {
        opacity = this.achievementFanfare.time / 1000;
      } else if (this.achievementFanfare.time > 4000) {
        opacity = 1 - ((this.achievementFanfare.time - 4000) / 1000);
      } else {
        opacity = 1;
      }
      color = {
        r: 1,
        g: 1,
        b: 1,
        a: opacity
      };
      x = this.width * 0.6;
      y = 0;
      xText = x + (this.width * 0.06);
      this.spriteRenderer.render("au", x, y, 0, this.height / 10, 0, 0, 0, color, (function(_this) {
        return function() {
          _this.achievementFanfare = null;
          return _this.renderMode = RenderMode.ACHIEVEMENTS;
        };
      })(this));
      this.fontRenderer.render(this.font, textHeight, "Achievement Earned", xText, y, 0, 0, color);
      this.fontRenderer.render(this.font, textHeight, this.achievementFanfare.title, xText, y + textHeight, 0, 0, color);
    }
  };

  Game.prototype.renderCount = function(player, money, drawGameOver, myTurn, countHeight, x, y, anchorx, anchory) {
    var boxHeight, cardCount, countSize, countString, countY, nameColor, nameSize, nameString, nameY, placeString;
    if (myTurn) {
      nameColor = "`ff7700`";
    } else {
      nameColor = "";
    }
    nameString = " " + nameColor + player.name + "``";
    if (money) {
      if (player.money == null) {
        player.money = 0;
      }
      nameString += ": $ `aaffaa`" + player.money;
    }
    nameString += " ";
    cardCount = player.hand.length;
    if (drawGameOver || (cardCount === 0)) {
      if (money) {
        placeString = "4th";
        if (player.place === 1) {
          placeString = "1st";
        } else if (player.place === 2) {
          placeString = "2nd";
        } else if (player.place === 3) {
          placeString = "3rd";
        }
        countString = " `ffaaff`" + placeString + "`` Place ";
      } else {
        if (player.place === 1) {
          countString = " `ffffaa`Winner`` ";
        } else {
          countString = " `ffaaff`Loser`` ";
        }
      }
    } else {
      countString = " `ffff33`" + cardCount + "`` left ";
    }
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
    if (true) {
      boxHeight *= 2;
      if (anchory > 0) {
        nameY -= countHeight;
      } else {
        countY += countHeight;
      }
    }
    this.spriteRenderer.render("solid", x, y, countSize.w, boxHeight, 0, anchorx, anchory, this.colors.overlay);
    this.fontRenderer.render(this.font, countHeight, nameString, x, nameY, anchorx, anchory, this.colors.white);
    if (true) {
      return this.fontRenderer.render(this.font, countHeight, countString, x, countY, anchorx, anchory, this.colors.white);
    }
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

  Hand.PICKING = 0;

  Hand.DRAGGING = 1;

  Hand.PUSHING = 2;

  function Hand(game) {
    var arcMargin, arcVerticalBias, bottomLeft, bottomRight;
    this.game = game;
    this.cards = [];
    this.anims = {};
    this.positionCache = {};
    this.mode = Hand.PICKING;
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

  Hand.prototype.picking = function() {
    return this.mode === Hand.PICKING;
  };

  Hand.prototype.cycleMode = function() {
    this.mode = (function() {
      switch (this.mode) {
        case Hand.PICKING:
          return Hand.DRAGGING;
        case Hand.DRAGGING:
          if (this.game.options.pushSorting) {
            return Hand.PUSHING;
          } else {
            return Hand.PICKING;
          }
          break;
        case Hand.PUSHING:
          return Hand.PICKING;
      }
    }).call(this);
    if (this.mode === Hand.PICKING) {
      return this.selectNone();
    }
  };

  Hand.prototype.selectNone = function() {
    this.picked = new Array(this.cards.length).fill(false);
  };

  Hand.prototype.set = function(cards) {
    this.cards = cards.slice(0);
    if (this.mode === Hand.PICKING) {
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
    if (this.mode !== Hand.PICKING) {
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
    var toEnd;
    this.dragX = dragX;
    this.dragY = dragY;
    this.up(this.dragX, this.dragY);
    if (this.mode === Hand.PICKING) {
      this.picked[index] = !this.picked[index];
      this.pickPaint = this.picked[index];
      return;
    }
    if (this.mode === Hand.PUSHING) {
      if (index < this.cards.length) {
        toEnd = this.cards[index];
        this.cards.splice(index, 1);
        this.cards.push(toEnd);
        this.updatePositions();
      }
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
          if (_this.mode === Hand.PICKING) {
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

SETTLE_MS = 250;

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

  Pile.prototype.poke = function() {
    return this.settleTimer = SETTLE_MS;
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
    return this.resting();
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
        x: 13,
        y: 883,
        w: 128,
        h: 128
      },
      pile0: {
        texture: "chars",
        x: 145,
        y: 883,
        w: 128,
        h: 128
      },
      pile1: {
        texture: "chars",
        x: 277,
        y: 883,
        w: 128,
        h: 128
      },
      pile2: {
        texture: "chars",
        x: 409,
        y: 883,
        w: 128,
        h: 128
      },
      pile3: {
        texture: "chars",
        x: 541,
        y: 883,
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
      au: {
        texture: "chars",
        x: 540,
        y: 1079,
        w: 400,
        h: 80
      },
      star_on: {
        texture: "chars",
        x: 38,
        y: 1066,
        w: 190,
        h: 190
      },
      star_off: {
        texture: "chars",
        x: 250,
        y: 1066,
        w: 190,
        h: 190
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
var Card, GlyphSuitName, MAX_LOG_LINES, MIN_PLAYERS, OK, STARTING_MONEY, ShortSuitName, ShuffledDeck, Suit, SuitName, Thirteen, achievementsList, achievementsMap, aiCharacterList, aiCharacters, cardsToString, character, debug, debug2, e, l, len1, len2, m, playToCardCount, playToString, playTypeToString, randomCharacter;

MIN_PLAYERS = 3;

MAX_LOG_LINES = 6;

OK = 'OK';

STARTING_MONEY = 25;

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

for (l = 0, len1 = aiCharacterList.length; l < len1; l++) {
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
  var card, cardNames, len2, m, raw;
  cardNames = [];
  for (m = 0, len2 = rawCards.length; m < len2; m++) {
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

playToCardCount = function(play) {
  var matches;
  if (matches = play.type.match(/^rop(\d+)/)) {
    return parseInt(matches[1]) * 2;
  }
  if (matches = play.type.match(/^run(\d+)/)) {
    return parseInt(matches[1]);
  }
  if (matches = play.type.match(/^kind(\d+)/)) {
    return parseInt(matches[1]);
  }
  return 1;
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

achievementsList = [
  {
    id: "veteran",
    title: "I've Seen Some Things",
    description: ["Play 50 Hands."],
    progress: function(ach) {
      if (ach.state.totalGames >= 50) {
        return "Total Played: `aaffaa`" + ach.state.totalGames + "`` Games";
      }
      return "Progress: " + ach.state.totalGames + " / 50";
    }
  }, {
    id: "tryhard",
    title: "Tryhard",
    description: ["Earn a 5 game win streak."],
    progress: function(ach) {
      var bestStreak, s;
      bestStreak = ach.state.bestStreak;
      if (bestStreak == null) {
        bestStreak = 0;
      }
      if (bestStreak >= 5) {
        return "Best Streak: `aaffaa`" + bestStreak + "`` Wins";
      }
      s = "";
      if (bestStreak > 1) {
        s = "s";
      }
      return "Best Streak: " + bestStreak + " Win" + s;
    }
  }, {
    id: "breaker",
    title: "Spring Break",
    description: ["Break a 2."]
  }, {
    id: "keepitlow",
    title: "Keep It Low, Boys",
    description: ["Play a Single 2 on top of a Single 3."]
  }, {
    id: "suited",
    title: "Doesn't Even Matter",
    description: ["Throw a suited run."]
  }, {
    id: "tony",
    title: "The Tony",
    description: ["Throw a run of 7 or more cards, and then lose."]
  }, {
    id: "sampler",
    title: "Sampler Platter",
    description: ["In a single hand: play at least one Single,", "one Pair, one Trips, and one Run."]
  }, {
    id: "tragedy",
    title: "Tragedy",
    description: ["Begin the game by throwing a two breaker involving", "the 3 of Spades."]
  }, {
    id: "indomitable",
    title: "Indomitable",
    description: ["Throw a run ending in the Ace of Hearts."]
  }, {
    id: "rekt",
    title: "Get Rekt",
    description: ["Win while all opponents still have 10 or more cards."]
  }, {
    id: "late",
    title: "Fashionably Late",
    description: ["Pass until all 4 2s are thrown, and then win."]
  }, {
    id: "pairs",
    title: "Pairing Up",
    description: ["Throw 5 pairs in a single round."]
  }, {
    id: "yourself",
    title: "You Played Yourself",
    description: ["Beat your own play."]
  }, {
    id: "thirteen",
    title: "Thirteen",
    description: ["Earn 13 achievements."]
  }, {
    id: "veteran2",
    title: "Old Timer",
    description: ["Play 1000 Hands."],
    progress: function(ach) {
      if (ach.state.totalGames >= 1000) {
        return "Total Played: `aaffaa`" + ach.state.totalGames + "`` Games";
      }
      return "Progress: " + ach.state.totalGames + " / 1000";
    }
  }, {
    id: "bling",
    title: "Bling Bling",
    description: ["Bankrupt another player in a money game when", "you are ahead by $15 dollars ($" + (STARTING_MONEY + 15) + " total)."]
  }, {
    id: "keepthechange",
    title: "Keep the Change",
    description: ["Win a hand by throwing a single 3 last."]
  }, {
    id: "dragracing",
    title: "Drag Racing",
    description: ["Throw a play with the 3 of spades which makes", "all opponents pass."]
  }, {
    id: "handicapped",
    title: "Handicapped",
    description: ["Win with a hand without any twos."]
  }, {
    id: "solitaire",
    title: "Solitaire",
    description: ["Throw a run of 5 or more cards with alternating", "red and black colors."]
  }, {
    id: "ballet",
    title: "Ballet",
    description: ["Throw a pair of twos (two twos)."]
  }, {
    id: "pagercode",
    title: "Pager Code",
    description: ["The secret password is BATHES. Don't tell anyone."]
  }
];

achievementsMap = {};

for (m = 0, len2 = achievementsList.length; m < len2; m++) {
  e = achievementsList[m];
  achievementsMap[e.id] = e;
}

Thirteen = (function() {
  Thirteen.STARTING_MONEY = STARTING_MONEY;

  function Thirteen(game1, params) {
    var k, ref, v;
    this.game = game1;
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
      this.initAchievements();
    } else {
      this.newGame(params.money);
    }
  }

  Thirteen.prototype.initAchievements = function() {
    var base, base1, base2;
    if (this.ach == null) {
      this.ach = {};
    }
    if ((base = this.ach).earned == null) {
      base.earned = {};
    }
    if ((base1 = this.ach).state == null) {
      base1.state = {};
    }
    if ((base2 = this.ach.state).totalGames == null) {
      base2.totalGames = 0;
    }
    return this.fanfares = [];
  };

  Thirteen.prototype.deal = function(params) {
    var base, deck, forMoney, j, len3, n, o, player, playerIndex, raw, ref;
    deck = new ShuffledDeck();
    ref = this.players;
    for (playerIndex = n = 0, len3 = ref.length; n < len3; playerIndex = ++n) {
      player = ref[playerIndex];
      this.game.log("dealing 13 cards to player " + playerIndex);
      player.place = 0;
      player.hand = [];
      for (j = o = 0; o < 13; j = ++o) {
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
    this.initAchievements();
    this.ach.state.threwSingle = false;
    this.ach.state.threwPair = false;
    this.ach.state.threwTrips = false;
    this.ach.state.threwRun = false;
    this.ach.state.threwRun7 = false;
    this.ach.state.twosSeen = 0;
    this.ach.state.fashionablyLate = false;
    this.ach.state.pairsThrown = 0;
    if ((base = this.ach.state).bestStreak == null) {
      base.bestStreak = 0;
    }
    this.ach.state.handicapped = !this.handHas2(this.players[0].hand);
    this.pile = [];
    this.pileWho = -1;
    this.throwID = 0;
    this.currentPlay = null;
    this.unpassAll();
    forMoney = "";
    if (this.money) {
      forMoney = " (for money)";
    }
    this.output(("Hand dealt" + forMoney + ", ") + this.players[this.turn].name + " plays first");
    return OK;
  };

  Thirteen.prototype.newGame = function(money, keepStreak) {
    var i, n;
    if (money == null) {
      money = false;
    }
    if (keepStreak == null) {
      keepStreak = false;
    }
    this.log = [];
    if (keepStreak) {
      if (this.streak == null) {
        this.streak = 0;
      }
      if (this.lastStreak == null) {
        this.lastStreak = 0;
      }
    } else {
      this.streak = 0;
      this.lastStreak = 0;
    }
    this.money = false;
    if (money) {
      this.money = true;
    }
    console.log("for money: " + this.money);
    this.players = [
      {
        id: 1,
        name: 'Player',
        index: 0,
        pass: false,
        money: Thirteen.STARTING_MONEY
      }
    ];
    for (i = n = 1; n < 4; i = ++n) {
      this.addAI();
    }
    return this.deal();
  };

  Thirteen.prototype.save = function() {
    var len3, n, name, names, state;
    names = "log players turn pile pileWho throwID currentPlay streak lastStreak ach money".split(" ");
    state = {};
    for (n = 0, len3 = names.length; n < len3; n++) {
      name = names[n];
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
    if (this.gameOver()) {
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

  Thirteen.prototype.canThrowAnything = function() {
    if (this.pile.length === 0) {
      return true;
    }
    if (!this.currentPlay) {
      return true;
    }
    if (this.everyonePassed()) {
      return true;
    }
    return false;
  };

  Thirteen.prototype.findPlayer = function(id) {
    var len3, n, player, ref;
    ref = this.players;
    for (n = 0, len3 = ref.length; n < len3; n++) {
      player = ref[n];
      if (player.id === id) {
        return player;
      }
    }
    return void 0;
  };

  Thirteen.prototype.currentPlayer = function() {
    return this.players[this.turn];
  };

  Thirteen.prototype.findPlace = function(place) {
    var len3, n, player, ref;
    ref = this.players;
    for (n = 0, len3 = ref.length; n < len3; n++) {
      player = ref[n];
      if ((place === 4) && (player.place === 0)) {
        return player;
      }
      if (player.place === place) {
        return player;
      }
    }
    return void 0;
  };

  Thirteen.prototype.payout = function() {
    var place1, place2, place3, place4;
    place1 = this.findPlace(1);
    place2 = this.findPlace(2);
    place3 = this.findPlace(3);
    place4 = this.findPlace(4);
    if (!place1 || !place2 || !place3 || !place4) {
      this.output("error with payouts!");
      return;
    }
    this.output(place4.name + " pays $2 to " + place1.name);
    this.output(place3.name + " pays $1 to " + place2.name);
    place1.money += 2;
    place2.money += 1;
    place3.money += -1;
    place4.money += -2;
  };

  Thirteen.prototype.entireTablePassed = function() {
    var len3, n, player, playerIndex, ref;
    ref = this.players;
    for (playerIndex = n = 0, len3 = ref.length; n < len3; playerIndex = ++n) {
      player = ref[playerIndex];
      if (player.place !== 0) {
        continue;
      }
      if (!player.pass) {
        return false;
      }
    }
    return true;
  };

  Thirteen.prototype.everyonePassed = function() {
    var len3, n, player, playerIndex, ref;
    ref = this.players;
    for (playerIndex = n = 0, len3 = ref.length; n < len3; playerIndex = ++n) {
      player = ref[playerIndex];
      if ((player.place !== 0) && (this.pileWho !== playerIndex)) {
        continue;
      }
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
    while (true) {
      index = (index + 1) % this.players.length;
      if (this.players[index].place === 0) {
        return index;
      }
    }
    return 0;
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
    var len3, n, player, ref;
    ref = this.players;
    for (n = 0, len3 = ref.length; n < len3; n++) {
      player = ref[n];
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
      ai: true,
      money: Thirteen.STARTING_MONEY
    };
    this.addPlayer(ai);
    this.game.log("added AI player");
    return OK;
  };

  Thirteen.prototype.updatePlayerHand = function(cards) {
    return this.players[0].hand = cards.slice(0);
  };

  Thirteen.prototype.winner = function() {
    var i, len3, n, player, ref;
    ref = this.players;
    for (i = n = 0, len3 = ref.length; n < len3; i = ++n) {
      player = ref[i];
      if (player.place === 1) {
        return player;
      }
    }
    return null;
  };

  Thirteen.prototype.someoneGaveUp = function() {
    var len3, n, player, ref;
    if (!this.money) {
      return false;
    }
    if (!this.game.options.givingUp) {
      return false;
    }
    ref = this.players;
    for (n = 0, len3 = ref.length; n < len3; n++) {
      player = ref[n];
      if (player.money <= 0) {
        return true;
      }
    }
    return false;
  };

  Thirteen.prototype.gameOver = function() {
    var np;
    np = this.nextPlace();
    if (this.money) {
      return np > 3;
    }
    return np > 1;
  };

  Thirteen.prototype.hasCard = function(hand, rawCard) {
    var len3, n, raw;
    for (n = 0, len3 = hand.length; n < len3; n++) {
      raw = hand[n];
      if (raw === rawCard) {
        return true;
      }
    }
    return false;
  };

  Thirteen.prototype.hasCards = function(hand, rawCards) {
    var len3, n, raw;
    for (n = 0, len3 = rawCards.length; n < len3; n++) {
      raw = rawCards[n];
      if (!this.hasCard(hand, raw)) {
        return false;
      }
    }
    return true;
  };

  Thirteen.prototype.removeCards = function(hand, rawCards) {
    var card, keepMe, len3, len4, n, newHand, o, raw;
    newHand = [];
    for (n = 0, len3 = hand.length; n < len3; n++) {
      card = hand[n];
      keepMe = true;
      for (o = 0, len4 = rawCards.length; o < len4; o++) {
        raw = rawCards[o];
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
    var card, cardIndex, cards, foundRop, foundRun, highestRaw, len3, len4, len5, n, o, q, reqValue, type;
    cards = rawCards.map(function(raw) {
      return new Card(raw);
    });
    cards = cards.sort(function(a, b) {
      return a.raw - b.raw;
    });
    highestRaw = cards[cards.length - 1].raw;
    if ((cards.length >= 6) && ((cards.length % 2) === 0)) {
      foundRop = true;
      for (cardIndex = n = 0, len3 = cards.length; n < len3; cardIndex = ++n) {
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
      for (cardIndex = o = 0, len4 = cards.length; o < len4; cardIndex = ++o) {
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
    for (q = 0, len5 = cards.length; q < len5; q++) {
      card = cards[q];
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
    var len3, n, raw;
    for (n = 0, len3 = hand.length; n < len3; n++) {
      raw = hand[n];
      if (raw === 0) {
        return true;
      }
    }
    return false;
  };

  Thirteen.prototype.handHas2 = function(hand) {
    var len3, n, raw;
    for (n = 0, len3 = hand.length; n < len3; n++) {
      raw = hand[n];
      if (raw >= 48) {
        return true;
      }
    }
    return false;
  };

  Thirteen.prototype.handIsBATHES = function(hand) {
    var card, cards, expecting, index, len3, n;
    if (hand.length !== 6) {
      return false;
    }
    cards = hand.map(function(raw) {
      return new Card(raw);
    });
    expecting = [5, 3, 4, 1, 0, 2];
    for (index = n = 0, len3 = cards.length; n < len3; index = ++n) {
      card = cards[index];
      if (card.value !== expecting[index]) {
        return false;
      }
    }
    return true;
  };

  Thirteen.prototype.cardIsRed = function(card) {
    if (card.suit === Suit.DIAMONDS) {
      return true;
    }
    if (card.suit === Suit.HEARTS) {
      return true;
    }
    return false;
  };

  Thirteen.prototype.handAlternatesRedAndBlack = function(hand) {
    var card, cards, len3, n, wantsRed;
    cards = hand.map(function(raw) {
      return new Card(raw);
    });
    cards = cards.sort(function(a, b) {
      return a.raw - b.raw;
    });
    wantsRed = this.cardIsRed(cards[0]);
    for (n = 0, len3 = cards.length; n < len3; n++) {
      card = cards[n];
      if (wantsRed !== this.cardIsRed(card)) {
        return false;
      }
      wantsRed = !wantsRed;
    }
    return true;
  };

  Thirteen.prototype.nextPlace = function() {
    var highestPlace, len3, n, player, ref;
    highestPlace = 0;
    ref = this.players;
    for (n = 0, len3 = ref.length; n < len3; n++) {
      player = ref[n];
      if (player.place == null) {
        player.place = 0;
      }
      if (highestPlace < player.place) {
        highestPlace = player.place;
      }
    }
    return highestPlace + 1;
  };

  Thirteen.prototype.splitPlayType = function(playType) {
    var matches;
    if (matches = playType.match(/^([^0-9]+)(\d+)/)) {
      return [matches[1], parseInt(matches[2])];
    }
    return [playType, 1];
  };

  Thirteen.prototype.hasPlay = function(currentPlay, hand) {
    var biggerKind, biggerType, leftover, leftovers, len3, len4, len5, n, o, play, plays, q, ref, ref1, ref2, spl, u;
    if (playToCardCount(currentPlay) > hand.length) {
      return false;
    }
    if (this.game.options.autopassIndex === 2) {
      return true;
    }
    leftovers = [];
    plays = {};
    spl = this.splitPlayType(currentPlay.type);
    switch (spl[0]) {
      case 'rop':
        leftovers = this.aiCalcRops(hand, plays, spl[1]);
        break;
      case 'run':
        leftovers = this.aiCalcRuns(hand, plays, false, spl[1]);
        break;
      case 'kind':
        leftovers = this.alCalcKinds(hand, plays, true);
    }
    if (plays.kind1 == null) {
      plays.kind1 = [];
    }
    for (n = 0, len3 = leftovers.length; n < len3; n++) {
      leftover = leftovers[n];
      plays.kind1.push([leftover]);
    }
    if ((plays[currentPlay.type] != null) && plays[currentPlay.type].length > 0) {
      ref = plays[currentPlay.type];
      for (o = 0, len4 = ref.length; o < len4; o++) {
        play = ref[o];
        if (this.highestCard(play) > currentPlay.high) {
          return true;
        }
      }
    }
    if (spl[0] === 'kind') {
      for (biggerKind = q = ref1 = spl[1]; ref1 <= 4 ? q <= 4 : q >= 4; biggerKind = ref1 <= 4 ? ++q : --q) {
        biggerType = "kind" + biggerKind;
        if ((plays[biggerType] != null) && plays[biggerType].length > 0) {
          ref2 = plays[biggerType];
          for (u = 0, len5 = ref2.length; u < len5; u++) {
            play = ref2[u];
            if (this.highestCard(play) > currentPlay.high) {
              return true;
            }
          }
        }
      }
    }
    return false;
  };

  Thirteen.prototype.canPass = function(params) {
    var currentPlayer;
    if (this.gameOver()) {
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
    if (this.gameOver()) {
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
    var achievement, achievementCount, base, base1, base2, breakerThrown, card, currentPlayer, incomingPlay, len3, len4, len5, n, newThrow, o, placeString, player, q, ref, ref1, ret, verb;
    incomingPlay = this.classify(params.cards);
    console.log("incomingPlay", incomingPlay);
    console.log("someone calling play", params);
    ret = this.canPlay(params, incomingPlay, this.handHas3S(params.cards));
    if (ret !== OK) {
      return ret;
    }
    breakerThrown = false;
    newThrow = true;
    verb = "throws:";
    if (this.currentPlay) {
      if (this.canBeBroken(this.currentPlay) && this.isBreakerType(incomingPlay.type)) {
        this.unpassAll();
        verb = "breaks 2:";
        breakerThrown = true;
        newThrow = false;
      } else if ((incomingPlay.type !== this.currentPlay.type) || (incomingPlay.high < this.currentPlay.high)) {
        this.unpassAll();
        verb = "throws new:";
      } else {
        newThrow = false;
      }
    } else {
      verb = "begins:";
    }
    if ((base = this.ach.state).twosSeen == null) {
      base.twosSeen = 0;
    }
    if ((base1 = this.ach.state).pairsThrown == null) {
      base1.pairsThrown = 0;
    }
    ref = params.cards;
    for (n = 0, len3 = ref.length; n < len3; n++) {
      card = ref[n];
      if (card >= 48) {
        this.ach.state.twosSeen += 1;
      }
    }
    if ((this.ach.state.twosSeen === 4) && (this.players[0].hand.length === 13)) {
      this.ach.state.fashionablyLate = true;
    }
    console.log("@ach.state.fashionablyLate " + this.ach.state.fashionablyLate);
    if (this.turn === 0) {
      if (this.everyonePassed() && !newThrow) {
        this.earn("yourself");
      }
      if (incomingPlay.type === 'kind2') {
        this.ach.state.pairsThrown += 1;
        if (this.ach.state.pairsThrown >= 5) {
          this.earn("pairs");
        }
      }
      if (breakerThrown) {
        this.earn("breaker");
      }
      if (this.isBreakerType(incomingPlay.type) && (this.pile.length === 0)) {
        this.earn("tragedy");
      }
      if (this.isRunType(incomingPlay.type) && this.isSuited(params.cards)) {
        this.earn("suited");
      }
      if (this.currentPlay && (this.currentPlay.type === 'kind1') && (this.currentPlay.high <= 3) && (incomingPlay.type === 'kind1') && (incomingPlay.high >= 48)) {
        this.earn("keepitlow");
      }
      if (this.isRunType(incomingPlay.type) && (incomingPlay.high === 47)) {
        this.earn("indomitable");
      }
      if (this.isBigRun(incomingPlay, 7)) {
        console.log("threwRun7: true");
        this.ach.state.threwRun7 = true;
      }
      if (incomingPlay.type === 'kind1') {
        this.ach.state.threwSingle = true;
      }
      if (incomingPlay.type === 'kind2') {
        this.ach.state.threwPair = true;
      }
      if (incomingPlay.type === 'kind3') {
        this.ach.state.threwTrips = true;
      }
      if (incomingPlay.type.match(/^run/)) {
        this.ach.state.threwRun = true;
      }
      if (this.ach.state.threwSingle && this.ach.state.threwPair && this.ach.state.threwTrips && this.ach.state.threwRun) {
        this.earn("sampler");
      }
      if ((params.cards.length >= 5) && this.handAlternatesRedAndBlack(params.cards)) {
        this.earn("solitaire");
      }
      if ((incomingPlay.type === 'kind2') && (incomingPlay.high >= 48)) {
        this.earn("ballet");
      }
      if (this.handIsBATHES(params.cards)) {
        this.earn("pagercode");
      }
    }
    this.currentPlay = incomingPlay;
    this.throwID += 1;
    currentPlayer = this.currentPlayer();
    currentPlayer.hand = this.removeCards(currentPlayer.hand, params.cards);
    this.output(currentPlayer.name + " " + verb + " " + (playToString(incomingPlay)));
    if (currentPlayer.hand.length === 0) {
      currentPlayer.place = this.nextPlace();
      if (this.money) {
        placeString = "4th";
        if (currentPlayer.place === 1) {
          placeString = "1st";
        } else if (currentPlayer.place === 2) {
          placeString = "2nd";
        } else if (currentPlayer.place === 3) {
          placeString = "3rd";
        }
        this.output(currentPlayer.name + " takes " + placeString + " place");
        if (currentPlayer.place === 3) {
          this.payout();
          if (this.game.options.givingUp) {
            ref1 = this.players;
            for (o = 0, len4 = ref1.length; o < len4; o++) {
              player = ref1[o];
              if (player.money <= 0) {
                this.output(player.name + " gives up");
                if (this.players[0].money >= (Thirteen.STARTING_MONEY + 15)) {
                  this.earn("bling");
                }
              }
            }
          }
        }
      } else {
        this.output(currentPlayer.name + " wins!");
      }
      if (currentPlayer.place === 1) {
        if (this.turn === 0) {
          this.streak += 1;
          this.lastStreak = this.streak;
        } else {
          this.lastStreak = this.streak;
          this.streak = 0;
        }
      }
      if ((base2 = this.ach.state).bestStreak == null) {
        base2.bestStreak = 0;
      }
      if (this.ach.state.bestStreak < this.lastStreak) {
        this.ach.state.bestStreak = this.lastStreak;
      }
      if (this.ach.state.bestStreak >= 5) {
        this.earn("tryhard");
      }
      this.ach.state.totalGames += 1;
      if (this.ach.state.totalGames >= 50) {
        this.earn("veteran");
      }
      if (this.ach.state.totalGames >= 1000) {
        this.earn("veteran2");
      }
      if (currentPlayer.place === 1) {
        if (this.turn === 0) {
          if ((this.players[1].hand.length >= 10) && (this.players[2].hand.length >= 10) && (this.players[3].hand.length >= 10)) {
            this.earn("rekt");
          }
          if (this.ach.state.fashionablyLate) {
            this.earn("late");
          }
          if (this.ach.state.handicapped) {
            this.earn("handicapped");
          }
          if ((params.cards.length === 1) && (params.cards[0] < 4)) {
            this.earn("keepthechange");
          }
        } else {
          if (this.ach.state.threwRun7) {
            this.earn("tony");
          }
        }
      }
    }
    achievementCount = 0;
    for (q = 0, len5 = achievementsList.length; q < len5; q++) {
      achievement = achievementsList[q];
      if (this.ach.earned[achievement.id]) {
        achievementCount += 1;
      }
    }
    if (achievementCount >= 13) {
      this.earn("thirteen");
    }
    this.pile = params.cards.slice(0);
    this.pileWho = this.turn;
    this.turn = this.playerAfter(this.turn);
    return OK;
  };

  Thirteen.prototype.unpassAll = function() {
    var len3, n, player, ref;
    ref = this.players;
    for (n = 0, len3 = ref.length; n < len3; n++) {
      player = ref[n];
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
    if (!currentPlayer.ai && this.currentPlay && !this.hasPlay(this.currentPlay, currentPlayer.hand)) {
      this.output(currentPlayer.name + " auto-passes (no plays)");
    } else if (currentPlayer.pass) {
      this.output(currentPlayer.name + " auto-passes");
    } else {
      this.output(currentPlayer.name + " passes");
    }
    currentPlayer.pass = true;
    this.turn = this.playerAfter(this.turn);
    this.game.pile.poke();
    if ((this.turn === 0) && this.everyonePassed() && this.handHas3S(this.pile)) {
      this.earn("dragracing");
    }
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

  Thirteen.prototype.earn = function(id) {
    var achievement;
    if (this.ach.earned[id]) {
      return;
    }
    achievement = achievementsMap[id];
    if (achievement == null) {
      return;
    }
    this.ach.earned[id] = true;
    this.output("Earned: " + achievement.title);
    return this.fanfares.push(achievement.title);
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
    if (this.gameOver()) {
      return false;
    }
    if (this.entireTablePassed()) {
      this.turn = this.playerAfter(this.pileWho);
      this.unpassAll();
      this.currentPlay = null;
      this.output('Whole table passes, control to ' + this.players[this.turn].name);
    }
    currentPlayer = this.currentPlayer();
    if (!currentPlayer.ai) {
      if (this.game.options.autopassIndex !== 0) {
        if (!this.canThrowAnything()) {
          if (this.currentPlay && (this.currentPlay.type === 'kind1') && (this.currentPlay.high >= 48) && this.hasBreaker(currentPlayer.hand)) {

          } else if (this.currentPlay && !this.hasPlay(this.currentPlay, currentPlayer.hand)) {
            this.aiLog("autopassing for player, no plays");
            this.aiPass(currentPlayer);
            return true;
          } else if (currentPlayer.pass) {
            this.aiLog("autopassing for player");
            this.aiPass(currentPlayer);
            return true;
          }
        }
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
    var card, cards, i, key, len3, len4, len5, n, o, q, u, v, value, valueArray, valueArrays;
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
    for (i = n = 0; n < 13; i = ++n) {
      valueArrays.push([]);
    }
    for (o = 0, len3 = cards.length; o < len3; o++) {
      card = cards[o];
      valueArrays[card.value].push(card);
    }
    hand = [];
    for (value = q = 0, len4 = valueArrays.length; q < len4; value = ++q) {
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
        for (u = 0, len5 = valueArray.length; u < len5; u++) {
          v = valueArray[u];
          hand.push(v.raw);
        }
      }
    }
    return hand;
  };

  Thirteen.prototype.aiFindRuns = function(hand, eachSize, size, preferStrongRuns) {
    var byAmount, card, cards, each, firstStartingValue, i, lastStartingValue, leftovers, len3, len4, len5, n, o, offset, q, ref, ref1, ref2, ref3, ref4, ref5, run, runFound, runs, startingValue, u, valueArray, valueArrays, w, x, y, z;
    if (preferStrongRuns == null) {
      preferStrongRuns = false;
    }
    runs = [];
    cards = hand.map(function(raw) {
      return new Card(raw);
    });
    cards = cards.sort(function(a, b) {
      return a.raw - b.raw;
    });
    valueArrays = [];
    for (i = n = 0; n < 13; i = ++n) {
      valueArrays.push([]);
    }
    for (o = 0, len3 = cards.length; o < len3; o++) {
      card = cards[o];
      valueArrays[card.value].push(card);
    }
    if (preferStrongRuns) {
      firstStartingValue = 12 - size;
      lastStartingValue = 0;
      byAmount = -1;
    } else {
      firstStartingValue = 0;
      lastStartingValue = 12 - size;
      byAmount = 1;
    }
    for (startingValue = q = ref = firstStartingValue, ref1 = lastStartingValue, ref2 = byAmount; ref2 > 0 ? q <= ref1 : q >= ref1; startingValue = q += ref2) {
      runFound = true;
      for (offset = u = 0, ref3 = size; 0 <= ref3 ? u < ref3 : u > ref3; offset = 0 <= ref3 ? ++u : --u) {
        if (valueArrays[startingValue + offset].length < eachSize) {
          runFound = false;
          break;
        }
      }
      if (runFound) {
        run = [];
        for (offset = w = 0, ref4 = size; 0 <= ref4 ? w < ref4 : w > ref4; offset = 0 <= ref4 ? ++w : --w) {
          for (each = x = 0, ref5 = eachSize; 0 <= ref5 ? x < ref5 : x > ref5; each = 0 <= ref5 ? ++x : --x) {
            run.push(valueArrays[startingValue + offset].pop().raw);
          }
        }
        runs.push(run);
      }
    }
    leftovers = [];
    for (y = 0, len4 = valueArrays.length; y < len4; y++) {
      valueArray = valueArrays[y];
      for (z = 0, len5 = valueArray.length; z < len5; z++) {
        card = valueArray[z];
        leftovers.push(card.raw);
      }
    }
    return [runs, leftovers];
  };

  Thirteen.prototype.aiCalcRuns = function(hand, plays, smallRuns, singleSize) {
    var byAmount, endSize, key, leftovers, n, preferStrongRuns, ref, ref1, ref2, ref3, runSize, runs, startSize;
    if (singleSize == null) {
      singleSize = null;
    }
    if (singleSize !== null) {
      preferStrongRuns = true;
      startSize = singleSize;
      endSize = singleSize;
      byAmount = 1;
    } else {
      preferStrongRuns = false;
      if (smallRuns) {
        startSize = 3;
        endSize = 12;
        byAmount = 1;
      } else {
        startSize = 12;
        endSize = 3;
        byAmount = -1;
      }
    }
    for (runSize = n = ref = startSize, ref1 = endSize, ref2 = byAmount; ref2 > 0 ? n <= ref1 : n >= ref1; runSize = n += ref2) {
      ref3 = this.aiFindRuns(hand, 1, runSize, preferStrongRuns), runs = ref3[0], leftovers = ref3[1];
      if (runs.length > 0) {
        key = "run" + runSize;
        plays[key] = runs;
      }
      hand = leftovers;
    }
    return hand;
  };

  Thirteen.prototype.aiCalcRops = function(hand, plays, singleSize) {
    var endSize, key, leftovers, n, preferStrongRuns, ref, ref1, ref2, rops, runSize, startSize;
    if (singleSize == null) {
      singleSize = null;
    }
    if (singleSize !== null) {
      preferStrongRuns = true;
      startSize = singleSize;
      endSize = singleSize;
    } else {
      preferStrongRuns = false;
      startSize = 3;
      endSize = 6;
    }
    for (runSize = n = ref = startSize, ref1 = endSize; ref <= ref1 ? n <= ref1 : n >= ref1; runSize = ref <= ref1 ? ++n : --n) {
      ref2 = this.aiFindRuns(hand, 2, runSize, preferStrongRuns), rops = ref2[0], leftovers = ref2[1];
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
    var len3, n, nonTwoSingles, raw, ref;
    if (plays.kind1 == null) {
      return 0;
    }
    nonTwoSingles = 0;
    ref = plays.kind1;
    for (n = 0, len3 = ref.length; n < len3; n++) {
      raw = ref[n];
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

  Thirteen.prototype.isRunType = function(playType) {
    if (playType.match(/^run/)) {
      return true;
    }
    return false;
  };

  Thirteen.prototype.isSuited = function(hand) {
    var card, cards, len3, n, suit;
    if (hand.length < 1) {
      return false;
    }
    cards = hand.map(function(raw) {
      return new Card(raw);
    });
    suit = cards[0].suit;
    for (n = 0, len3 = cards.length; n < len3; n++) {
      card = cards[n];
      if (card.suit !== suit) {
        return false;
      }
    }
    return true;
  };

  Thirteen.prototype.isBigRun = function(play, atLeast) {
    var len, matches;
    if (matches = play.type.match(/^run(\d+)/)) {
      len = parseInt(matches[1]);
      if (len >= atLeast) {
        return true;
      }
    }
    return false;
  };

  Thirteen.prototype.aiCalcBestPlays = function(hand) {
    var bestPlays, bits, n, nbp, np, plays, strategy;
    bestPlays = null;
    for (bits = n = 0; n < 16; bits = ++n) {
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
    var arr, card, len3, len4, len5, n, names, o, play, pretty, q, raw, s, t, throws, type, typeName;
    if (extraPretty == null) {
      extraPretty = false;
    }
    pretty = {};
    for (type in plays) {
      arr = plays[type];
      pretty[type] = [];
      for (n = 0, len3 = arr.length; n < len3; n++) {
        play = arr[n];
        names = [];
        for (o = 0, len4 = play.length; o < len4; o++) {
          raw = play[o];
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
          for (q = 0, len5 = throws.length; q < len5; q++) {
            t = throws[q];
            s += "        * " + (t.join(',')) + "\n";
          }
        }
      }
      return s;
    }
    return JSON.stringify(pretty);
  };

  Thirteen.prototype.highestCard = function(play) {
    var highest, len3, n, p;
    highest = 0;
    for (n = 0, len3 = play.length; n < len3; n++) {
      p = play[n];
      if (highest < p) {
        highest = p;
      }
    }
    return highest;
  };

  Thirteen.prototype.findPlayWith3S = function(plays) {
    var len3, n, play, playType, playlist;
    for (playType in plays) {
      playlist = plays[playType];
      for (n = 0, len3 = playlist.length; n < len3; n++) {
        play = playlist[n];
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
        var breakerPlays, len3, len4, n, o, play, playType, playTypeIndex, playTypes, playlist, plays, rawCard, ref, ref1;
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
            for (n = 0, len3 = ref.length; n < len3; n++) {
              play = ref[n];
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
        for (o = 0, len4 = ref1.length; o < len4; o++) {
          rawCard = ref1[o];
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
  var attempt, bits, deck, foundFullyPlayed, fullyPlayed, hand, j, n, o, plays, q, raw, ref, strategy, thir, totalAttempts;
  thir = new Thirteen();
  fullyPlayed = 0;
  totalAttempts = 100;
  for (attempt = n = 0, ref = totalAttempts; 0 <= ref ? n < ref : n > ref; attempt = 0 <= ref ? ++n : --n) {
    deck = new ShuffledDeck();
    hand = [];
    for (j = o = 0; o < 13; j = ++o) {
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
    for (bits = q = 0; q < 16; bits = ++q) {
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

debug2 = function() {
  var currentPlay, game, hand, thir;
  game = {
    options: {
      autopassIndex: 1
    }
  };
  thir = new Thirteen(game);
  currentPlay = {
    type: 'run3',
    high: 26
  };
  hand = [10, 11, 15, 19, 23, 27];
  return console.log(thir.hasPlay(currentPlay, hand));
};

module.exports = {
  Card: Card,
  Thirteen: Thirteen,
  OK: OK,
  aiCharacters: aiCharacters,
  achievementsList: achievementsList,
  achievementsMap: achievementsMap
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
      goalFPS = null;
    }
    if (this.lastGoalFPS !== goalFPS) {
      console.log("switching to " + goalFPS + " FPS");
      this.lastGoalFPS = goalFPS;
    }
    if (goalFPS !== null) {
      fpsInterval = 1000 / goalFPS;
      if (dt < fpsInterval) {
        return;
      }
    }
    this.lastTime = now;
    this.context.clearRect(0, 0, this.width, this.height);
    if (this.game.update(dt)) {
      this.lastInteractTime = now;
    }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQW5pbWF0aW9uLmNvZmZlZSIsInNyYy9CdXR0b24uY29mZmVlIiwic3JjL0ZvbnRSZW5kZXJlci5jb2ZmZWUiLCJzcmMvR2FtZS5jb2ZmZWUiLCJzcmMvSGFuZC5jb2ZmZWUiLCJzcmMvTWVudS5jb2ZmZWUiLCJzcmMvUGlsZS5jb2ZmZWUiLCJzcmMvU3ByaXRlUmVuZGVyZXIuY29mZmVlIiwic3JjL1RoaXJ0ZWVuLmNvZmZlZSIsInNyYy9mb250bWV0cmljcy5jb2ZmZWUiLCJzcmMvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBOztBQUFBLFFBQUEsR0FBVyxTQUFDLENBQUQ7RUFDVCxJQUFHLENBQUEsS0FBSyxDQUFSO0FBQ0UsV0FBTyxFQURUO0dBQUEsTUFFSyxJQUFHLENBQUEsR0FBSSxDQUFQO0FBQ0gsV0FBTyxDQUFDLEVBREw7O0FBRUwsU0FBTztBQUxFOztBQU9MO0VBQ1MsbUJBQUMsSUFBRDtBQUNYLFFBQUE7SUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksQ0FBQztJQUNkLElBQUMsQ0FBQSxHQUFELEdBQU87SUFDUCxJQUFDLENBQUEsR0FBRCxHQUFPO0FBQ1AsU0FBQSxTQUFBOztNQUNFLElBQUcsQ0FBQSxLQUFLLE9BQVI7UUFDRSxJQUFDLENBQUEsR0FBSSxDQUFBLENBQUEsQ0FBTCxHQUFVO1FBQ1YsSUFBQyxDQUFBLEdBQUksQ0FBQSxDQUFBLENBQUwsR0FBVSxFQUZaOztBQURGO0VBSlc7O3NCQVViLElBQUEsR0FBTSxTQUFBO0lBQ0osSUFBRyxrQkFBSDtNQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBTCxHQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFEaEI7O0lBRUEsSUFBRyxrQkFBSDtNQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBTCxHQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFEaEI7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QixRQUF4Qjs7QUFDVCxZQUFBLEdBQWUsU0FBQTtBQUNiLE1BQUE7RUFBQSxrQkFBQSxHQUFxQixFQUFBLEdBQUs7RUFDMUIsa0JBQUEsR0FBcUIsTUFBTSxDQUFDLFVBQVAsR0FBb0IsTUFBTSxDQUFDO0VBQ2hELElBQUcsa0JBQUEsR0FBcUIsa0JBQXhCO0lBQ0UsTUFBTSxDQUFDLEtBQVAsR0FBZSxNQUFNLENBQUM7V0FDdEIsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsSUFBSSxDQUFDLEtBQUwsQ0FBVyxNQUFNLENBQUMsVUFBUCxHQUFvQixDQUFDLENBQUEsR0FBSSxrQkFBTCxDQUEvQixFQUZsQjtHQUFBLE1BQUE7SUFJRSxNQUFNLENBQUMsS0FBUCxHQUFlLElBQUksQ0FBQyxLQUFMLENBQVcsTUFBTSxDQUFDLFdBQVAsR0FBcUIsa0JBQWhDO1dBQ2YsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsTUFBTSxDQUFDLFlBTHpCOztBQUhhOztBQVNmLFlBQUEsQ0FBQTs7QUFHQSxHQUFBLEdBQU0sSUFBSSxTQUFKLENBQWMsTUFBZCxFQUFzQixNQUFNLENBQUMsS0FBN0IsRUFBb0MsTUFBTSxDQUFDLE1BQTNDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY2FsY1NpZ24gPSAodikgLT5cbiAgaWYgdiA9PSAwXG4gICAgcmV0dXJuIDBcbiAgZWxzZSBpZiB2IDwgMFxuICAgIHJldHVybiAtMVxuICByZXR1cm4gMVxuXG5jbGFzcyBBbmltYXRpb25cbiAgY29uc3RydWN0b3I6IChkYXRhKSAtPlxuICAgIEBzcGVlZCA9IGRhdGEuc3BlZWRcbiAgICBAcmVxID0ge31cbiAgICBAY3VyID0ge31cbiAgICBmb3Igayx2IG9mIGRhdGFcbiAgICAgIGlmIGsgIT0gJ3NwZWVkJ1xuICAgICAgICBAcmVxW2tdID0gdlxuICAgICAgICBAY3VyW2tdID0gdlxuXG4gICMgJ2ZpbmlzaGVzJyBhbGwgYW5pbWF0aW9uc1xuICB3YXJwOiAtPlxuICAgIGlmIEBjdXIucj9cbiAgICAgIEBjdXIuciA9IEByZXEuclxuICAgIGlmIEBjdXIucz9cbiAgICAgIEBjdXIucyA9IEByZXEuc1xuICAgIGlmIEBjdXIueD8gYW5kIEBjdXIueT9cbiAgICAgIEBjdXIueCA9IEByZXEueFxuICAgICAgQGN1ci55ID0gQHJlcS55XG5cbiAgYW5pbWF0aW5nOiAtPlxuICAgIGlmIEBjdXIucj9cbiAgICAgIGlmIEByZXEuciAhPSBAY3VyLnJcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICBpZiBAY3VyLnM/XG4gICAgICBpZiBAcmVxLnMgIT0gQGN1ci5zXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgaWYgQGN1ci54PyBhbmQgQGN1ci55P1xuICAgICAgaWYgKEByZXEueCAhPSBAY3VyLngpIG9yIChAcmVxLnkgIT0gQGN1ci55KVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIHJldHVybiBmYWxzZVxuXG4gIHVwZGF0ZTogKGR0KSAtPlxuICAgIHVwZGF0ZWQgPSBmYWxzZVxuICAgICMgcm90YXRpb25cbiAgICBpZiBAY3VyLnI/XG4gICAgICBpZiBAcmVxLnIgIT0gQGN1ci5yXG4gICAgICAgIHVwZGF0ZWQgPSB0cnVlXG4gICAgICAgICMgc2FuaXRpemUgcmVxdWVzdGVkIHJvdGF0aW9uXG4gICAgICAgIHR3b1BpID0gTWF0aC5QSSAqIDJcbiAgICAgICAgbmVnVHdvUGkgPSAtMSAqIHR3b1BpXG4gICAgICAgIEByZXEuciAtPSB0d29QaSB3aGlsZSBAcmVxLnIgPj0gdHdvUGlcbiAgICAgICAgQHJlcS5yICs9IHR3b1BpIHdoaWxlIEByZXEuciA8PSBuZWdUd29QaVxuICAgICAgICAjIHBpY2sgYSBkaXJlY3Rpb24gYW5kIHR1cm5cbiAgICAgICAgZHIgPSBAcmVxLnIgLSBAY3VyLnJcbiAgICAgICAgZGlzdCA9IE1hdGguYWJzKGRyKVxuICAgICAgICBzaWduID0gY2FsY1NpZ24oZHIpXG4gICAgICAgIGlmIGRpc3QgPiBNYXRoLlBJXG4gICAgICAgICAgIyBzcGluIHRoZSBvdGhlciBkaXJlY3Rpb24sIGl0IGlzIGNsb3NlclxuICAgICAgICAgIGRpc3QgPSB0d29QaSAtIGRpc3RcbiAgICAgICAgICBzaWduICo9IC0xXG4gICAgICAgIG1heERpc3QgPSBkdCAqIEBzcGVlZC5yIC8gMTAwMFxuICAgICAgICBpZiBkaXN0IDwgbWF4RGlzdFxuICAgICAgICAgICMgd2UgY2FuIGZpbmlzaCB0aGlzIGZyYW1lXG4gICAgICAgICAgQGN1ci5yID0gQHJlcS5yXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAY3VyLnIgKz0gbWF4RGlzdCAqIHNpZ25cblxuICAgICMgc2NhbGVcbiAgICBpZiBAY3VyLnM/XG4gICAgICBpZiBAcmVxLnMgIT0gQGN1ci5zXG4gICAgICAgIHVwZGF0ZWQgPSB0cnVlXG4gICAgICAgICMgcGljayBhIGRpcmVjdGlvbiBhbmQgdHVyblxuICAgICAgICBkcyA9IEByZXEucyAtIEBjdXIuc1xuICAgICAgICBkaXN0ID0gTWF0aC5hYnMoZHMpXG4gICAgICAgIHNpZ24gPSBjYWxjU2lnbihkcylcbiAgICAgICAgbWF4RGlzdCA9IGR0ICogQHNwZWVkLnMgLyAxMDAwXG4gICAgICAgIGlmIGRpc3QgPCBtYXhEaXN0XG4gICAgICAgICAgIyB3ZSBjYW4gZmluaXNoIHRoaXMgZnJhbWVcbiAgICAgICAgICBAY3VyLnMgPSBAcmVxLnNcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBjdXIucyArPSBtYXhEaXN0ICogc2lnblxuXG4gICAgIyB0cmFuc2xhdGlvblxuICAgIGlmIEBjdXIueD8gYW5kIEBjdXIueT9cbiAgICAgIGlmIChAcmVxLnggIT0gQGN1ci54KSBvciAoQHJlcS55ICE9IEBjdXIueSlcbiAgICAgICAgdXBkYXRlZCA9IHRydWVcbiAgICAgICAgdmVjWCA9IEByZXEueCAtIEBjdXIueFxuICAgICAgICB2ZWNZID0gQHJlcS55IC0gQGN1ci55XG4gICAgICAgIGRpc3QgPSBNYXRoLnNxcnQoKHZlY1ggKiB2ZWNYKSArICh2ZWNZICogdmVjWSkpXG4gICAgICAgIG1heERpc3QgPSBkdCAqIEBzcGVlZC50IC8gMTAwMFxuICAgICAgICBpZiBkaXN0IDwgbWF4RGlzdFxuICAgICAgICAgICMgd2UgY2FuIGZpbmlzaCB0aGlzIGZyYW1lXG4gICAgICAgICAgQGN1ci54ID0gQHJlcS54XG4gICAgICAgICAgQGN1ci55ID0gQHJlcS55XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAjIG1vdmUgYXMgbXVjaCBhcyBwb3NzaWJsZVxuICAgICAgICAgIEBjdXIueCArPSAodmVjWCAvIGRpc3QpICogbWF4RGlzdFxuICAgICAgICAgIEBjdXIueSArPSAodmVjWSAvIGRpc3QpICogbWF4RGlzdFxuXG4gICAgcmV0dXJuIHVwZGF0ZWRcblxubW9kdWxlLmV4cG9ydHMgPSBBbmltYXRpb25cbiIsIkFuaW1hdGlvbiA9IHJlcXVpcmUgJy4vQW5pbWF0aW9uJ1xuXG5jbGFzcyBCdXR0b25cbiAgY29uc3RydWN0b3I6IChAZ2FtZSwgQHNwcml0ZU5hbWVzLCBAZm9udCwgQHRleHRIZWlnaHQsIEB4LCBAeSwgQGNiKSAtPlxuICAgIEBhbmltID0gbmV3IEFuaW1hdGlvbiB7XG4gICAgICBzcGVlZDogeyBzOiAzIH1cbiAgICAgIHM6IDBcbiAgICB9XG4gICAgQGNvbG9yID0geyByOiAxLCBnOiAxLCBiOiAxLCBhOiAwIH1cblxuICB1cGRhdGU6IChkdCkgLT5cbiAgICByZXR1cm4gQGFuaW0udXBkYXRlKGR0KVxuXG4gIHJlbmRlcjogLT5cbiAgICBAY29sb3IuYSA9IEBhbmltLmN1ci5zXG4gICAgQGdhbWUuc3ByaXRlUmVuZGVyZXIucmVuZGVyIEBzcHJpdGVOYW1lc1swXSwgQHgsIEB5LCAwLCBAdGV4dEhlaWdodCAqIDEuNSwgMCwgMC41LCAwLjUsIEBnYW1lLmNvbG9ycy53aGl0ZSwgPT5cbiAgICAgICMgcHVsc2UgYnV0dG9uIGFuaW0sXG4gICAgICBAYW5pbS5jdXIucyA9IDFcbiAgICAgIEBhbmltLnJlcS5zID0gMFxuICAgICAgIyB0aGVuIGNhbGwgY2FsbGJhY2tcbiAgICAgIEBjYih0cnVlKVxuICAgIEBnYW1lLnNwcml0ZVJlbmRlcmVyLnJlbmRlciBAc3ByaXRlTmFtZXNbMV0sIEB4LCBAeSwgMCwgQHRleHRIZWlnaHQgKiAxLjUsIDAsIDAuNSwgMC41LCBAY29sb3JcbiAgICB0ZXh0ID0gQGNiKGZhbHNlKVxuICAgIEBnYW1lLmZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIEB0ZXh0SGVpZ2h0LCB0ZXh0LCBAeCwgQHksIDAuNSwgMC41LCBAZ2FtZS5jb2xvcnMuYnV0dG9udGV4dFxuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1dHRvblxuIiwiZm9udG1ldHJpY3MgPSByZXF1aXJlICcuL2ZvbnRtZXRyaWNzJ1xuXG4jIHRha2VuIGZyb20gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy81NjIzODM4L3JnYi10by1oZXgtYW5kLWhleC10by1yZ2JcbmhleFRvUmdiID0gKGhleCwgYSkgLT5cbiAgICByZXN1bHQgPSAvXiM/KFthLWZcXGRdezJ9KShbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pJC9pLmV4ZWMoaGV4KVxuICAgIHJldHVybiBudWxsIGlmIG5vdCByZXN1bHRcbiAgICByZXR1cm4ge1xuICAgICAgICByOiBwYXJzZUludChyZXN1bHRbMV0sIDE2KSAvIDI1NSxcbiAgICAgICAgZzogcGFyc2VJbnQocmVzdWx0WzJdLCAxNikgLyAyNTUsXG4gICAgICAgIGI6IHBhcnNlSW50KHJlc3VsdFszXSwgMTYpIC8gMjU1XG4gICAgICAgIGE6IGFcbiAgICB9XG5cbmNsYXNzIEZvbnRSZW5kZXJlclxuICBjb25zdHJ1Y3RvcjogIChAZ2FtZSkgLT5cbiAgICBAd2hpdGUgPSB7IHI6IDEsIGc6IDEsIGI6IDEsIGE6IDEgfVxuXG4gIHNpemU6IChmb250LCBoZWlnaHQsIHN0cikgLT5cbiAgICBtZXRyaWNzID0gZm9udG1ldHJpY3NbZm9udF1cbiAgICByZXR1cm4gaWYgbm90IG1ldHJpY3NcbiAgICBzY2FsZSA9IGhlaWdodCAvIG1ldHJpY3MuaGVpZ2h0XG5cbiAgICB0b3RhbFdpZHRoID0gMFxuICAgIHRvdGFsSGVpZ2h0ID0gbWV0cmljcy5oZWlnaHQgKiBzY2FsZVxuXG4gICAgaW5Db2xvciA9IGZhbHNlXG4gICAgZm9yIGNoLCBpIGluIHN0clxuICAgICAgaWYgY2ggPT0gJ2AnXG4gICAgICAgIGluQ29sb3IgPSAhaW5Db2xvclxuXG4gICAgICBpZiBub3QgaW5Db2xvclxuICAgICAgICBjb2RlID0gY2guY2hhckNvZGVBdCgwKVxuICAgICAgICBnbHlwaCA9IG1ldHJpY3MuZ2x5cGhzW2NvZGVdXG4gICAgICAgIGNvbnRpbnVlIGlmIG5vdCBnbHlwaFxuICAgICAgICB0b3RhbFdpZHRoICs9IGdseXBoLnhhZHZhbmNlICogc2NhbGVcblxuICAgIHJldHVybiB7XG4gICAgICB3OiB0b3RhbFdpZHRoXG4gICAgICBoOiB0b3RhbEhlaWdodFxuICAgIH1cblxuICByZW5kZXI6IChmb250LCBoZWlnaHQsIHN0ciwgeCwgeSwgYW5jaG9yeCwgYW5jaG9yeSwgY29sb3IsIGNiKSAtPlxuICAgIG1ldHJpY3MgPSBmb250bWV0cmljc1tmb250XVxuICAgIHJldHVybiBpZiBub3QgbWV0cmljc1xuICAgIHNjYWxlID0gaGVpZ2h0IC8gbWV0cmljcy5oZWlnaHRcblxuICAgIHRvdGFsV2lkdGggPSAwXG4gICAgdG90YWxIZWlnaHQgPSBtZXRyaWNzLmhlaWdodCAqIHNjYWxlXG4gICAgc2tpcENvbG9yID0gZmFsc2VcbiAgICBmb3IgY2gsIGkgaW4gc3RyXG4gICAgICBpZiBjaCA9PSAnYCdcbiAgICAgICAgc2tpcENvbG9yID0gIXNraXBDb2xvclxuICAgICAgY29udGludWUgaWYgc2tpcENvbG9yXG4gICAgICBjb2RlID0gY2guY2hhckNvZGVBdCgwKVxuICAgICAgZ2x5cGggPSBtZXRyaWNzLmdseXBoc1tjb2RlXVxuICAgICAgY29udGludWUgaWYgbm90IGdseXBoXG4gICAgICB0b3RhbFdpZHRoICs9IGdseXBoLnhhZHZhbmNlICogc2NhbGVcblxuICAgIGFuY2hvck9mZnNldFggPSAtMSAqIGFuY2hvcnggKiB0b3RhbFdpZHRoXG4gICAgYW5jaG9yT2Zmc2V0WSA9IC0xICogYW5jaG9yeSAqIHRvdGFsSGVpZ2h0XG4gICAgY3VyclggPSB4XG5cbiAgICBpZiBjb2xvclxuICAgICAgc3RhcnRpbmdDb2xvciA9IGNvbG9yXG4gICAgZWxzZVxuICAgICAgc3RhcnRpbmdDb2xvciA9IEB3aGl0ZVxuICAgIGN1cnJlbnRDb2xvciA9IHN0YXJ0aW5nQ29sb3JcblxuICAgIGNvbG9yU3RhcnQgPSAtMVxuICAgIGZvciBjaCwgaSBpbiBzdHJcbiAgICAgIGlmIGNoID09ICdgJ1xuICAgICAgICBpZiBjb2xvclN0YXJ0ID09IC0xXG4gICAgICAgICAgY29sb3JTdGFydCA9IGkgKyAxXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBsZW4gPSBpIC0gY29sb3JTdGFydFxuICAgICAgICAgIGlmIGxlblxuICAgICAgICAgICAgY3VycmVudENvbG9yID0gaGV4VG9SZ2Ioc3RyLnN1YnN0cihjb2xvclN0YXJ0LCBpIC0gY29sb3JTdGFydCksIHN0YXJ0aW5nQ29sb3IuYSlcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBzdGFydGluZ0NvbG9yXG4gICAgICAgICAgY29sb3JTdGFydCA9IC0xXG5cbiAgICAgIGNvbnRpbnVlIGlmIGNvbG9yU3RhcnQgIT0gLTFcbiAgICAgIGNvZGUgPSBjaC5jaGFyQ29kZUF0KDApXG4gICAgICBnbHlwaCA9IG1ldHJpY3MuZ2x5cGhzW2NvZGVdXG4gICAgICBjb250aW51ZSBpZiBub3QgZ2x5cGhcbiAgICAgIEBnYW1lLmRyYXdJbWFnZSBmb250LFxuICAgICAgZ2x5cGgueCwgZ2x5cGgueSwgZ2x5cGgud2lkdGgsIGdseXBoLmhlaWdodCxcbiAgICAgIGN1cnJYICsgKGdseXBoLnhvZmZzZXQgKiBzY2FsZSkgKyBhbmNob3JPZmZzZXRYLCB5ICsgKGdseXBoLnlvZmZzZXQgKiBzY2FsZSkgKyBhbmNob3JPZmZzZXRZLCBnbHlwaC53aWR0aCAqIHNjYWxlLCBnbHlwaC5oZWlnaHQgKiBzY2FsZSxcbiAgICAgIDAsIDAsIDAsXG4gICAgICBjdXJyZW50Q29sb3IuciwgY3VycmVudENvbG9yLmcsIGN1cnJlbnRDb2xvci5iLCBjdXJyZW50Q29sb3IuYSwgY2JcbiAgICAgIGN1cnJYICs9IGdseXBoLnhhZHZhbmNlICogc2NhbGVcblxubW9kdWxlLmV4cG9ydHMgPSBGb250UmVuZGVyZXJcbiIsIkFuaW1hdGlvbiA9IHJlcXVpcmUgJy4vQW5pbWF0aW9uJ1xuQnV0dG9uID0gcmVxdWlyZSAnLi9CdXR0b24nXG5Gb250UmVuZGVyZXIgPSByZXF1aXJlICcuL0ZvbnRSZW5kZXJlcidcblNwcml0ZVJlbmRlcmVyID0gcmVxdWlyZSAnLi9TcHJpdGVSZW5kZXJlcidcbk1lbnUgPSByZXF1aXJlICcuL01lbnUnXG5IYW5kID0gcmVxdWlyZSAnLi9IYW5kJ1xuUGlsZSA9IHJlcXVpcmUgJy4vUGlsZSdcbntUaGlydGVlbiwgT0ssIGFpQ2hhcmFjdGVycywgYWNoaWV2ZW1lbnRzTGlzdH0gPSByZXF1aXJlICcuL1RoaXJ0ZWVuJ1xuXG4jIHRlbXBcbkJVSUxEX1RJTUVTVEFNUCA9IFwiMS4xOVwiXG5cblJlbmRlck1vZGUgPVxuICBHQU1FOiAwXG4gIEhPV1RPOiAxXG4gIEFDSElFVkVNRU5UUzogMlxuICBQQVVTRTogM1xuICBPUFRJT05TOiA0XG5cbmNsYXNzIEdhbWVcbiAgY29uc3RydWN0b3I6IChAbmF0aXZlLCBAd2lkdGgsIEBoZWlnaHQpIC0+XG4gICAgQHZlcnNpb24gPSBCVUlMRF9USU1FU1RBTVBcbiAgICBAbG9nKFwiR2FtZSBjb25zdHJ1Y3RlZDogI3tAd2lkdGh9eCN7QGhlaWdodH1cIilcbiAgICBAZm9udFJlbmRlcmVyID0gbmV3IEZvbnRSZW5kZXJlciB0aGlzXG4gICAgQHNwcml0ZVJlbmRlcmVyID0gbmV3IFNwcml0ZVJlbmRlcmVyIHRoaXNcbiAgICBAZm9udCA9IFwiZGFya2ZvcmVzdFwiXG4gICAgQHpvbmVzID0gW11cbiAgICBAbmV4dEFJVGljayA9IDEwMDAgIyB3aWxsIGJlIHNldCBieSBvcHRpb25zXG4gICAgQGNlbnRlciA9XG4gICAgICB4OiBAd2lkdGggLyAyXG4gICAgICB5OiBAaGVpZ2h0IC8gMlxuICAgIEBhYUhlaWdodCA9IEB3aWR0aCAqIDkgLyAxNlxuICAgIEBsb2cgXCJoZWlnaHQ6ICN7QGhlaWdodH0uIGhlaWdodCBpZiBzY3JlZW4gd2FzIDE2OjkgKGFzcGVjdCBhZGp1c3RlZCk6ICN7QGFhSGVpZ2h0fVwiXG4gICAgQHBhdXNlQnV0dG9uU2l6ZSA9IEBhYUhlaWdodCAvIDEyXG4gICAgQGNvbG9ycyA9XG4gICAgICBhcnJvdzogICAgICB7IHI6ICAgMSwgZzogICAxLCBiOiAgIDEsIGE6ICAgMSB9XG4gICAgICBhcnJvd2Nsb3NlOiB7IHI6ICAgMSwgZzogMC41LCBiOiAgIDAsIGE6IDAuMyB9XG4gICAgICBiYWNrZ3JvdW5kOiB7IHI6ICAgMCwgZzogMC4yLCBiOiAgIDAsIGE6ICAgMSB9XG4gICAgICBiaWQ6ICAgICAgICB7IHI6ICAgMCwgZzogMC42LCBiOiAgIDAsIGE6ICAgMSB9XG4gICAgICBibGFjazogICAgICB7IHI6ICAgMCwgZzogICAwLCBiOiAgIDAsIGE6ICAgMSB9XG4gICAgICBidXR0b250ZXh0OiB7IHI6ICAgMSwgZzogICAxLCBiOiAgIDEsIGE6ICAgMSB9XG4gICAgICBnYW1lX292ZXI6ICB7IHI6ICAgMSwgZzogMC41LCBiOiAgIDAsIGE6ICAgMSB9XG4gICAgICBnb2xkOiAgICAgICB7IHI6ICAgMSwgZzogICAxLCBiOiAgIDAsIGE6ICAgMSB9XG4gICAgICBoYW5kX2FueTogICB7IHI6ICAgMCwgZzogICAwLCBiOiAwLjIsIGE6IDEuMCB9XG4gICAgICBoYW5kX3BpY2s6ICB7IHI6ICAgMCwgZzogMC4xLCBiOiAgIDAsIGE6IDEuMCB9XG4gICAgICBoYW5kX2RyYWc6ICB7IHI6IDAuNCwgZzogICAwLCBiOiAgIDAsIGE6IDEuMCB9XG4gICAgICBoYW5kX3B1c2g6ICB7IHI6IDAuMiwgZzogICAwLCBiOiAwLjIsIGE6IDEuMCB9XG4gICAgICBsaWdodGdyYXk6ICB7IHI6IDAuNSwgZzogMC41LCBiOiAwLjUsIGE6ICAgMSB9XG4gICAgICBsb2diZzogICAgICB7IHI6IDAuMSwgZzogICAwLCBiOiAgIDAsIGE6ICAgMSB9XG4gICAgICBsb2djb2xvcjogICB7IHI6IDAuNSwgZzogMC41LCBiOiAwLjUsIGE6ICAgMSB9XG4gICAgICBtYWlubWVudTogICB7IHI6IDAuMSwgZzogMC4xLCBiOiAwLjEsIGE6ICAgMSB9XG4gICAgICBvcmFuZ2U6ICAgICB7IHI6ICAgMSwgZzogMC41LCBiOiAgIDAsIGE6ICAgMSB9XG4gICAgICBvdmVybGF5OiAgICB7IHI6ICAgMCwgZzogICAwLCBiOiAgIDAsIGE6IDAuNiB9XG4gICAgICBwYXVzZW1lbnU6ICB7IHI6IDAuMSwgZzogMC4wLCBiOiAwLjEsIGE6ICAgMSB9XG4gICAgICBvcHRpb25tZW51OiB7IHI6IDAuMCwgZzogMC4xLCBiOiAwLjEsIGE6ICAgMSB9XG4gICAgICBwaWxlOiAgICAgICB7IHI6IDAuNCwgZzogMC4yLCBiOiAgIDAsIGE6ICAgMSB9XG4gICAgICBwbGF5X2FnYWluOiB7IHI6ICAgMCwgZzogICAwLCBiOiAgIDAsIGE6IDAuNiB9XG4gICAgICByZWQ6ICAgICAgICB7IHI6ICAgMSwgZzogICAwLCBiOiAgIDAsIGE6ICAgMSB9XG4gICAgICB3aGl0ZTogICAgICB7IHI6ICAgMSwgZzogICAxLCBiOiAgIDEsIGE6ICAgMSB9XG4gICAgICBhY2hfYmc6ICAgICB7IHI6IDAuMSwgZzogMC4xLCBiOiAwLjEsIGE6ICAgMSB9XG4gICAgICBhY2hfaGVhZGVyOiB7IHI6ICAgMSwgZzogMC41LCBiOiAgIDAsIGE6ICAgMSB9XG4gICAgICBhY2hfdGl0bGU6ICB7IHI6ICAgMSwgZzogICAxLCBiOiAgIDEsIGE6ICAgMSB9XG4gICAgICBhY2hfZGVzYzogICB7IHI6IDAuNywgZzogMC43LCBiOiAwLjcsIGE6ICAgMSB9XG4gICAgICBhY2hfYnV0dG9uOiB7IHI6IDAuNywgZzogMC43LCBiOiAwLjMsIGE6ICAgMSB9XG4gICAgICB0cmFuc3BhcmVudDp7IHI6ICAgMSwgZzogICAxLCBiOiAgIDEsIGE6ICAgMCB9XG5cbiAgICBAdGV4dHVyZXMgPVxuICAgICAgXCJjYXJkc1wiOiAwXG4gICAgICBcImRhcmtmb3Jlc3RcIjogMVxuICAgICAgXCJjaGFyc1wiOiAyXG4gICAgICBcImhvd3RvMVwiOiAzXG5cbiAgICBAdGhpcnRlZW4gPSBudWxsXG4gICAgQGxhc3RFcnIgPSAnJ1xuICAgIEByZW5kZXJNb2RlID0gUmVuZGVyTW9kZS5HQU1FXG4gICAgQHJlbmRlckNvbW1hbmRzID0gW11cbiAgICBAYWNoaWV2ZW1lbnRGYW5mYXJlID0gbnVsbFxuICAgIEBhY2hpZXZlbWVudHNQYWdlID0gMFxuXG4gICAgIyBhY2hpZXZlbWVudHMgZGVidWdnaW5nXG4gICAgIyBAcmVuZGVyTW9kZSA9IFJlbmRlck1vZGUuQUNISUVWRU1FTlRTXG4gICAgIyBAYWNoaWV2ZW1lbnRzUGFnZSA9IDFcblxuICAgIEBvcHRpb25NZW51cyA9XG4gICAgICBzcGVlZHM6IFtcbiAgICAgICAgeyB0ZXh0OiBcIkFJIFNwZWVkOiBTbG93XCIsIHNwZWVkOiAyMDAwIH1cbiAgICAgICAgeyB0ZXh0OiBcIkFJIFNwZWVkOiBNZWRpdW1cIiwgc3BlZWQ6IDEwMDAgfVxuICAgICAgICB7IHRleHQ6IFwiQUkgU3BlZWQ6IEZhc3RcIiwgc3BlZWQ6IDUwMCB9XG4gICAgICAgIHsgdGV4dDogXCJBSSBTcGVlZDogVWx0cmFcIiwgc3BlZWQ6IDI1MCB9XG4gICAgICBdXG4gICAgICBzb3J0czogW1xuICAgICAgICB7IHRleHQ6IFwiU29ydCBPcmRlcjogTm9ybWFsXCIgfVxuICAgICAgICB7IHRleHQ6IFwiU29ydCBPcmRlcjogUmV2ZXJzZVwiIH1cbiAgICAgIF1cbiAgICAgIGF1dG9wYXNzZXM6IFtcbiAgICAgICAgeyB0ZXh0OiBcIkF1dG9QYXNzOiBEaXNhYmxlZFwiIH1cbiAgICAgICAgeyB0ZXh0OiBcIkF1dG9QYXNzOiBGdWxsXCIgfVxuICAgICAgICB7IHRleHQ6IFwiQXV0b1Bhc3M6IExpbWl0ZWRcIiB9XG4gICAgICBdXG4gICAgQG9wdGlvbnMgPVxuICAgICAgc3BlZWRJbmRleDogMVxuICAgICAgc29ydEluZGV4OiAwXG4gICAgICBzb3VuZDogdHJ1ZVxuICAgICAgYXV0b3Bhc3NJbmRleDogMlxuICAgICAgcHVzaFNvcnRpbmc6IGZhbHNlXG4gICAgICBnaXZpbmdVcDogdHJ1ZVxuXG4gICAgQHBhdXNlTWVudSA9IG5ldyBNZW51IHRoaXMsIFwiUGF1c2VkXCIsIFwic29saWRcIiwgQGNvbG9ycy5wYXVzZW1lbnUsIFtcbiAgICAgIChjbGljaykgPT5cbiAgICAgICAgaWYgY2xpY2tcbiAgICAgICAgICBAcmVuZGVyTW9kZSA9IFJlbmRlck1vZGUuR0FNRVxuICAgICAgICByZXR1cm4gXCJSZXN1bWUgR2FtZVwiXG4gICAgICAoY2xpY2spID0+XG4gICAgICAgIGlmIGNsaWNrXG4gICAgICAgICAgQHJlbmRlck1vZGUgPSBSZW5kZXJNb2RlLk9QVElPTlNcbiAgICAgICAgcmV0dXJuIFwiT3B0aW9uc1wiXG4gICAgICAoY2xpY2spID0+XG4gICAgICAgIGlmIGNsaWNrXG4gICAgICAgICAgQHJlbmRlck1vZGUgPSBSZW5kZXJNb2RlLkFDSElFVkVNRU5UU1xuICAgICAgICByZXR1cm4gXCJBY2hpZXZlbWVudHNcIlxuICAgICAgKGNsaWNrKSA9PlxuICAgICAgICBpZiBjbGlja1xuICAgICAgICAgIEByZW5kZXJNb2RlID0gUmVuZGVyTW9kZS5IT1dUT1xuICAgICAgICByZXR1cm4gXCJIb3cgVG8gUGxheVwiXG4gICAgICAoY2xpY2spID0+XG4gICAgICAgIGlmIGNsaWNrXG4gICAgICAgICAgQG5ld0dhbWUodHJ1ZSlcbiAgICAgICAgICBAcmVuZGVyTW9kZSA9IFJlbmRlck1vZGUuR0FNRVxuICAgICAgICByZXR1cm4gXCJOZXcgTW9uZXkgR2FtZVwiXG4gICAgICAoY2xpY2spID0+XG4gICAgICAgIGlmIGNsaWNrXG4gICAgICAgICAgQG5ld0dhbWUoZmFsc2UpXG4gICAgICAgICAgQHJlbmRlck1vZGUgPSBSZW5kZXJNb2RlLkdBTUVcbiAgICAgICAgcmV0dXJuIFwiTmV3IEdhbWVcIlxuICAgIF1cblxuICAgIEBvcHRpb25NZW51ID0gbmV3IE1lbnUgdGhpcywgXCJPcHRpb25zXCIsIFwic29saWRcIiwgQGNvbG9ycy5vcHRpb25tZW51LCBbXG4gICAgICAoY2xpY2spID0+XG4gICAgICAgIGlmIGNsaWNrXG4gICAgICAgICAgQG9wdGlvbnMuc3BlZWRJbmRleCA9IChAb3B0aW9ucy5zcGVlZEluZGV4ICsgMSkgJSBAb3B0aW9uTWVudXMuc3BlZWRzLmxlbmd0aFxuICAgICAgICByZXR1cm4gQG9wdGlvbk1lbnVzLnNwZWVkc1tAb3B0aW9ucy5zcGVlZEluZGV4XS50ZXh0XG4gICAgICAoY2xpY2spID0+XG4gICAgICAgIGlmIGNsaWNrXG4gICAgICAgICAgQG9wdGlvbnMuYXV0b3Bhc3NJbmRleCA9IChAb3B0aW9ucy5hdXRvcGFzc0luZGV4ICsgMSkgJSBAb3B0aW9uTWVudXMuYXV0b3Bhc3Nlcy5sZW5ndGhcbiAgICAgICAgcmV0dXJuIEBvcHRpb25NZW51cy5hdXRvcGFzc2VzW0BvcHRpb25zLmF1dG9wYXNzSW5kZXhdLnRleHRcbiAgICAgIChjbGljaykgPT5cbiAgICAgICAgaWYgY2xpY2tcbiAgICAgICAgICBAb3B0aW9ucy5zb3J0SW5kZXggPSAoQG9wdGlvbnMuc29ydEluZGV4ICsgMSkgJSBAb3B0aW9uTWVudXMuc29ydHMubGVuZ3RoXG4gICAgICAgIHJldHVybiBAb3B0aW9uTWVudXMuc29ydHNbQG9wdGlvbnMuc29ydEluZGV4XS50ZXh0XG4gICAgICAoY2xpY2spID0+XG4gICAgICAgIGlmIGNsaWNrXG4gICAgICAgICAgQG9wdGlvbnMuZ2l2aW5nVXAgPSAhQG9wdGlvbnMuZ2l2aW5nVXBcbiAgICAgICAgaWYgQG9wdGlvbnMuZ2l2aW5nVXBcbiAgICAgICAgICByZXR1cm4gXCJHaXZpbmcgVXA6IEVuYWJsZWRcIlxuICAgICAgICByZXR1cm4gXCJHaXZpbmcgVXA6IERpc2FibGVkXCJcbiAgICAgIChjbGljaykgPT5cbiAgICAgICAgaWYgY2xpY2tcbiAgICAgICAgICBAb3B0aW9ucy5wdXNoU29ydGluZyA9ICFAb3B0aW9ucy5wdXNoU29ydGluZ1xuICAgICAgICBpZiBAb3B0aW9ucy5wdXNoU29ydGluZ1xuICAgICAgICAgIHJldHVybiBcIlB1c2ggU29ydGluZzogRW5hYmxlZFwiXG4gICAgICAgIHJldHVybiBcIlB1c2ggU29ydGluZzogRGlzYWJsZWRcIlxuICAgICAgKGNsaWNrKSA9PlxuICAgICAgICBpZiBjbGlja1xuICAgICAgICAgIEByZW5kZXJNb2RlID0gUmVuZGVyTW9kZS5QQVVTRVxuICAgICAgICByZXR1cm4gXCJCYWNrXCJcbiAgICBdXG5cbiAgICBAdGhpcnRlZW4gPSBuZXcgVGhpcnRlZW4gdGhpcywge31cbiAgICBAbG9nIFwicGxheWVyIDAncyBoYW5kOiBcIiArIEpTT04uc3RyaW5naWZ5KEB0aGlydGVlbi5wbGF5ZXJzWzBdLmhhbmQpXG4gICAgQHByZXBhcmVHYW1lKClcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgbG9nZ2luZ1xuXG4gIGxvZzogKHMpIC0+XG4gICAgQG5hdGl2ZS5sb2cocylcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgbG9hZCAvIHNhdmVcblxuICBsb2FkOiAoanNvbikgLT5cbiAgICBAbG9nIFwiKENTKSBsb2FkaW5nIHN0YXRlXCJcbiAgICB0cnlcbiAgICAgIHN0YXRlID0gSlNPTi5wYXJzZSBqc29uXG4gICAgY2F0Y2hcbiAgICAgIEBsb2cgXCJsb2FkIGZhaWxlZCB0byBwYXJzZSBzdGF0ZTogI3tqc29ufVwiXG4gICAgICByZXR1cm5cbiAgICBpZiBzdGF0ZS5vcHRpb25zXG4gICAgICBmb3IgaywgdiBvZiBzdGF0ZS5vcHRpb25zXG4gICAgICAgIEBvcHRpb25zW2tdID0gdlxuXG4gICAgaWYgc3RhdGUudGhpcnRlZW5cbiAgICAgIEBsb2cgXCJyZWNyZWF0aW5nIGdhbWUgZnJvbSBzYXZlZGF0YVwiXG4gICAgICBAdGhpcnRlZW4gPSBuZXcgVGhpcnRlZW4gdGhpcywge1xuICAgICAgICBzdGF0ZTogc3RhdGUudGhpcnRlZW5cbiAgICAgIH1cbiAgICAgIEBwcmVwYXJlR2FtZSgpXG5cbiAgc2F2ZTogLT5cbiAgICAjIEBsb2cgXCIoQ1MpIHNhdmluZyBzdGF0ZVwiXG4gICAgc3RhdGUgPSB7XG4gICAgICBvcHRpb25zOiBAb3B0aW9uc1xuICAgIH1cblxuICAgIGlmIEB0aGlydGVlbj9cbiAgICAgIEB0aGlydGVlbi51cGRhdGVQbGF5ZXJIYW5kKEBoYW5kLmNhcmRzKVxuICAgICAgc3RhdGUudGhpcnRlZW4gPSBAdGhpcnRlZW4uc2F2ZSgpXG5cbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkgc3RhdGVcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgYWlUaWNrUmF0ZTogLT5cbiAgICByZXR1cm4gQG9wdGlvbk1lbnVzLnNwZWVkc1tAb3B0aW9ucy5zcGVlZEluZGV4XS5zcGVlZFxuXG4gIG5ld0dhbWU6IChtb25leSkgLT5cbiAgICBAdGhpcnRlZW4ubmV3R2FtZShtb25leSlcbiAgICBAcHJlcGFyZUdhbWUoKVxuXG4gIHByZXBhcmVHYW1lOiAtPlxuICAgIEBoYW5kID0gbmV3IEhhbmQgdGhpc1xuICAgIEBwaWxlID0gbmV3IFBpbGUgdGhpcywgQGhhbmRcbiAgICBAaGFuZC5zZXQgQHRoaXJ0ZWVuLnBsYXllcnNbMF0uaGFuZFxuICAgIEBsYXN0RXJyID0gJydcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgaW5wdXQgaGFuZGxpbmdcblxuICB0b3VjaERvd246ICh4LCB5KSAtPlxuICAgICMgQGxvZyhcInRvdWNoRG93biAje3h9LCN7eX1cIilcbiAgICBAY2hlY2tab25lcyh4LCB5KVxuXG4gIHRvdWNoTW92ZTogKHgsIHkpIC0+XG4gICAgIyBAbG9nKFwidG91Y2hNb3ZlICN7eH0sI3t5fVwiKVxuICAgIGlmIEB0aGlydGVlbiAhPSBudWxsXG4gICAgICBAaGFuZC5tb3ZlKHgsIHkpXG5cbiAgdG91Y2hVcDogKHgsIHkpIC0+XG4gICAgIyBAbG9nKFwidG91Y2hVcCAje3h9LCN7eX1cIilcbiAgICBpZiBAdGhpcnRlZW4gIT0gbnVsbFxuICAgICAgQGhhbmQudXAoeCwgeSlcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgaGVhZGxpbmUgKGdhbWUgc3RhdGUgaW4gdG9wIGxlZnQpXG5cbiAgcHJldHR5RXJyb3JUYWJsZToge1xuICAgICAgZ2FtZU92ZXI6ICAgICAgICAgICBcIlRoZSBnYW1lIGlzIG92ZXIuXCJcbiAgICAgIGludmFsaWRQbGF5OiAgICAgICAgXCJOb3QgYSB2YWxpZCBwbGF5LlwiXG4gICAgICBtdXN0QnJlYWtPclBhc3M6ICAgIFwiWW91IHBhc3NlZCBhbHJlYWR5LCBzbyAyLWJyZWFrZXIgb3IgcGFzcy5cIlxuICAgICAgbXVzdFBhc3M6ICAgICAgICAgICBcIllvdSBtdXN0IHBhc3MuXCJcbiAgICAgIG11c3RUaHJvdzNTOiAgICAgICAgXCJZb3UgbXVzdCB1c2UgdGhlIDNcXHhjOCBpbiB5b3VyIHBsYXkuXCJcbiAgICAgIG5vdFlvdXJUdXJuOiAgICAgICAgXCJJdCBpcyBub3QgeW91ciB0dXJuLlwiXG4gICAgICB0aHJvd0FueXRoaW5nOiAgICAgIFwiWW91IGhhdmUgY29udHJvbCwgdGhyb3cgYW55dGhpbmcuXCJcbiAgICAgIHRvb0xvd1BsYXk6ICAgICAgICAgXCJUaGlzIHBsYXkgaXMgbm90IHN0cm9uZ2VyIHRoYW4gdGhlIGN1cnJlbnQgcGxheS5cIlxuICAgICAgd3JvbmdQbGF5OiAgICAgICAgICBcIlRoaXMgcGxheSBkb2VzIG5vdCBtYXRjaCB0aGUgY3VycmVudCBwbGF5LlwiXG4gIH1cblxuICBwcmV0dHlFcnJvcjogLT5cbiAgICBwcmV0dHkgPSBAcHJldHR5RXJyb3JUYWJsZVtAbGFzdEVycl1cbiAgICByZXR1cm4gcHJldHR5IGlmIHByZXR0eVxuICAgIHJldHVybiBAbGFzdEVyclxuXG4gIGNhbGNIZWFkbGluZTogLT5cbiAgICByZXR1cm4gXCJcIiBpZiBAdGhpcnRlZW4gPT0gbnVsbFxuXG4gICAgaGVhZGxpbmUgPSBAdGhpcnRlZW4uaGVhZGxpbmUoKVxuICAgICMgc3dpdGNoIEB0aGlydGVlbi5zdGF0ZVxuICAgICMgICB3aGVuIFN0YXRlLkJJRFxuICAgICMgICAgIGhlYWRsaW5lID0gXCJXYWl0aW5nIGZvciBgZmY3NzAwYCN7QHRoaXJ0ZWVuLnBsYXllcnNbQHRoaXJ0ZWVuLnR1cm5dLm5hbWV9YGAgdG8gYGZmZmYwMGBiaWRgYFwiXG4gICAgIyAgIHdoZW4gU3RhdGUuVFJJQ0tcbiAgICAjICAgICBoZWFkbGluZSA9IFwiV2FpdGluZyBmb3IgYGZmNzcwMGAje0B0aGlydGVlbi5wbGF5ZXJzW0B0aGlydGVlbi50dXJuXS5uYW1lfWBgIHRvIGBmZmZmMDBgcGxheWBgXCJcbiAgICAjICAgd2hlbiBTdGF0ZS5ST1VORFNVTU1BUllcbiAgICAjICAgICBoZWFkbGluZSA9IFwiV2FpdGluZyBmb3IgbmV4dCByb3VuZC4uLlwiXG4gICAgIyAgIHdoZW4gU3RhdGUuUE9TVEdBTUVTVU1NQVJZXG4gICAgIyAgICAgaGVhZGxpbmUgPSBcIkdhbWUgb3ZlciFcIlxuXG4gICAgZXJyVGV4dCA9IFwiXCJcbiAgICBpZiAoQGxhc3RFcnIubGVuZ3RoID4gMCkgYW5kIChAbGFzdEVyciAhPSBPSylcbiAgICAgIGVyclRleHQgPSBcIiAgYGZmZmZmZmBFUlJPUjogYGZmMDAwMGAje0BwcmV0dHlFcnJvcigpfVwiXG4gICAgICBoZWFkbGluZSArPSBlcnJUZXh0XG5cbiAgICByZXR1cm4gaGVhZGxpbmVcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgZ2FtZSBvdmVyIGluZm9ybWF0aW9uXG5cbiAgZ2FtZU92ZXJUZXh0OiAtPlxuICAgIHdpbm5lciA9IEB0aGlydGVlbi53aW5uZXIoKVxuICAgIGZpcnN0TGluZSA9IFwiI3t3aW5uZXIubmFtZX0gd2lucyFcIlxuICAgIHNlY29uZExpbmUgPSBcIlRyeSBBZ2Fpbi4uLlwiXG4gICAgaWYgd2lubmVyLm5hbWUgPT0gXCJQbGF5ZXJcIlxuICAgICAgZmlyc3RMaW5lID0gXCJZb3Ugd2luIVwiXG4gICAgICBpZiBAdGhpcnRlZW4ubGFzdFN0cmVhayA9PSAxXG4gICAgICAgIHNlY29uZExpbmUgPSBcIkEgbmV3IHN0cmVhayFcIlxuICAgICAgZWxzZVxuICAgICAgICBzZWNvbmRMaW5lID0gXCIje0B0aGlydGVlbi5sYXN0U3RyZWFrfSBpbiBhIHJvdyFcIlxuICAgIGVsc2VcbiAgICAgIGlmIEB0aGlydGVlbi5sYXN0U3RyZWFrID09IDBcbiAgICAgICAgc2Vjb25kTGluZSA9IFwiVHJ5IGFnYWluLi4uXCJcbiAgICAgIGVsc2VcbiAgICAgICAgc2Vjb25kTGluZSA9IFwiU3RyZWFrIGVuZGVkOiAje0B0aGlydGVlbi5sYXN0U3RyZWFrfSB3aW5zXCJcbiAgICBpZiBAdGhpcnRlZW4uc29tZW9uZUdhdmVVcCgpXG4gICAgICBtb25leURlbHRhID0gQHRoaXJ0ZWVuLnBsYXllcnNbMF0ubW9uZXkgLSBUaGlydGVlbi5TVEFSVElOR19NT05FWVxuICAgICAgaWYgbW9uZXlEZWx0YSA+IDBcbiAgICAgICAgc2Vjb25kTGluZSA9IFwiR2FtZSBPdmVyOiBZb3Ugd29uICQje21vbmV5RGVsdGF9XCJcbiAgICAgIGVsc2UgaWYgbW9uZXlEZWx0YSA8IDBcbiAgICAgICAgc2Vjb25kTGluZSA9IFwiR2FtZSBPdmVyOiBZb3UgbG9zdCAkI3stMSAqIG1vbmV5RGVsdGF9XCJcbiAgICAgIGVsc2VcbiAgICAgICAgc2Vjb25kTGluZSA9IFwiR2FtZSBPdmVyOiBZb3UgYnJva2UgZXZlbiFcIlxuICAgIHJldHVybiBbZmlyc3RMaW5lLCBzZWNvbmRMaW5lXVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyBjYXJkIGhhbmRsaW5nXG5cbiAgcGFzczogLT5cbiAgICBAbGFzdEVyciA9IEB0aGlydGVlbi5wYXNzIHtcbiAgICAgIGlkOiAxXG4gICAgfVxuXG4gIHBsYXk6IChjYXJkcykgLT5cbiAgICBjb25zb2xlLmxvZyBcIihnYW1lKSBwbGF5aW5nIGNhcmRzXCIsIGNhcmRzXG5cbiAgICBAdGhpcnRlZW4udXBkYXRlUGxheWVySGFuZChAaGFuZC5jYXJkcylcblxuICAgIHJhd0NhcmRzID0gW11cbiAgICBmb3IgY2FyZCBpbiBjYXJkc1xuICAgICAgcmF3Q2FyZHMucHVzaCBjYXJkLmNhcmRcblxuICAgIHJldCA9IEB0aGlydGVlbi5wbGF5IHtcbiAgICAgIGlkOiAxXG4gICAgICBjYXJkczogcmF3Q2FyZHNcbiAgICB9XG4gICAgQGxhc3RFcnIgPSByZXRcbiAgICBpZiByZXQgPT0gT0tcbiAgICAgIEBoYW5kLnNldCBAdGhpcnRlZW4ucGxheWVyc1swXS5oYW5kXG4gICAgICBAcGlsZS5oaW50IGNhcmRzXG5cbiAgcGxheVBpY2tlZDogLT5cbiAgICBpZiBub3QgQGhhbmQucGlja2luZygpXG4gICAgICByZXR1cm5cbiAgICBjYXJkcyA9IEBoYW5kLnNlbGVjdGVkQ2FyZHMoKVxuICAgICMgQGhhbmQuc2VsZWN0Tm9uZSgpXG4gICAgaWYgY2FyZHMubGVuZ3RoID09IDBcbiAgICAgIHJldHVybiBAcGFzcygpXG4gICAgcmV0dXJuIEBwbGF5KGNhcmRzKVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyBtYWluIGxvb3BcblxuICB1cGRhdGU6IChkdCkgLT5cbiAgICBAem9uZXMubGVuZ3RoID0gMCAjIGZvcmdldCBhYm91dCB6b25lcyBmcm9tIHRoZSBsYXN0IGZyYW1lLiB3ZSdyZSBhYm91dCB0byBtYWtlIHNvbWUgbmV3IG9uZXMhXG5cbiAgICB1cGRhdGVkID0gZmFsc2VcbiAgICBpZiBAdXBkYXRlR2FtZShkdClcbiAgICAgIHVwZGF0ZWQgPSB0cnVlXG5cbiAgICByZXR1cm4gdXBkYXRlZFxuXG4gIHVwZGF0ZUdhbWU6IChkdCkgLT5cbiAgICByZXR1cm4gZmFsc2UgaWYgQHRoaXJ0ZWVuID09IG51bGxcblxuICAgIHVwZGF0ZWQgPSBmYWxzZVxuXG4gICAgaWYgQHBpbGUudXBkYXRlKGR0KVxuICAgICAgdXBkYXRlZCA9IHRydWVcbiAgICBpZiBAcGlsZS5yZWFkeUZvck5leHRUcmljaygpXG4gICAgICBAbmV4dEFJVGljayAtPSBkdFxuICAgICAgaWYgQG5leHRBSVRpY2sgPD0gMFxuICAgICAgICBAbmV4dEFJVGljayA9IEBhaVRpY2tSYXRlKClcbiAgICAgICAgaWYgQHRoaXJ0ZWVuLmFpVGljaygpXG4gICAgICAgICAgdXBkYXRlZCA9IHRydWVcbiAgICBpZiBAaGFuZC51cGRhdGUoZHQpXG4gICAgICB1cGRhdGVkID0gdHJ1ZVxuXG4gICAgQHBpbGUuc2V0IEB0aGlydGVlbi50aHJvd0lELCBAdGhpcnRlZW4ucGlsZSwgQHRoaXJ0ZWVuLnBpbGVXaG9cblxuICAgIGlmIEBwYXVzZU1lbnUudXBkYXRlKGR0KVxuICAgICAgdXBkYXRlZCA9IHRydWVcblxuICAgIGlmIEBvcHRpb25NZW51LnVwZGF0ZShkdClcbiAgICAgIHVwZGF0ZWQgPSB0cnVlXG5cbiAgICBpZiBAYWNoaWV2ZW1lbnRGYW5mYXJlICE9IG51bGxcbiAgICAgIEBhY2hpZXZlbWVudEZhbmZhcmUudGltZSArPSBkdFxuICAgICAgaWYgQGFjaGlldmVtZW50RmFuZmFyZS50aW1lID4gNTAwMFxuICAgICAgICBAYWNoaWV2ZW1lbnRGYW5mYXJlID0gbnVsbFxuICAgICAgdXBkYXRlZCA9IHRydWVcblxuICAgIGlmIEBhY2hpZXZlbWVudEZhbmZhcmUgPT0gbnVsbFxuICAgICAgaWYgQHRoaXJ0ZWVuLmZhbmZhcmVzLmxlbmd0aCA+IDBcbiAgICAgICAgQGFjaGlldmVtZW50RmFuZmFyZSA9XG4gICAgICAgICAgdGl0bGU6IEB0aGlydGVlbi5mYW5mYXJlcy5zaGlmdCgpXG4gICAgICAgICAgdGltZTogMFxuXG4gICAgcmV0dXJuIHVwZGF0ZWRcblxuICByZW5kZXI6IC0+XG4gICAgIyBSZXNldCByZW5kZXIgY29tbWFuZHNcbiAgICBAcmVuZGVyQ29tbWFuZHMubGVuZ3RoID0gMFxuXG4gICAgc3dpdGNoIEByZW5kZXJNb2RlXG4gICAgICB3aGVuIFJlbmRlck1vZGUuSE9XVE9cbiAgICAgICAgQHJlbmRlckhvd3RvKClcbiAgICAgIHdoZW4gUmVuZGVyTW9kZS5BQ0hJRVZFTUVOVFNcbiAgICAgICAgQHJlbmRlckFjaGlldmVtZW50cygpXG4gICAgICB3aGVuIFJlbmRlck1vZGUuT1BUSU9OU1xuICAgICAgICBAcmVuZGVyT3B0aW9ucygpXG4gICAgICB3aGVuIFJlbmRlck1vZGUuUEFVU0VcbiAgICAgICAgQHJlbmRlclBhdXNlKClcbiAgICAgIGVsc2VcbiAgICAgICAgQHJlbmRlckdhbWUoKVxuXG4gICAgcmV0dXJuIEByZW5kZXJDb21tYW5kc1xuXG4gIHJlbmRlclBhdXNlOiAtPlxuICAgIEBwYXVzZU1lbnUucmVuZGVyKClcblxuICByZW5kZXJPcHRpb25zOiAtPlxuICAgIEBvcHRpb25NZW51LnJlbmRlcigpXG5cbiAgcmVuZGVySG93dG86IC0+XG4gICAgaG93dG9UZXh0dXJlID0gXCJob3d0bzFcIlxuICAgIEBsb2cgXCJyZW5kZXJpbmcgI3tob3d0b1RleHR1cmV9XCJcbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwic29saWRcIiwgMCwgMCwgQHdpZHRoLCBAaGVpZ2h0LCAwLCAwLCAwLCBAY29sb3JzLmJsYWNrXG4gICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBob3d0b1RleHR1cmUsIDAsIDAsIEB3aWR0aCwgQGFhSGVpZ2h0LCAwLCAwLCAwLCBAY29sb3JzLndoaXRlLCA9PlxuICAgICAgQHJlbmRlck1vZGUgPSBSZW5kZXJNb2RlLlBBVVNFXG5cbiAgZGVidWc6IC0+XG4gICAgY29uc29sZS5sb2cgXCJkZWJ1ZyBhY2hcIlxuICAgIGNvbnNvbGUubG9nIEB0aGlydGVlbi5hY2hcbiAgICAjIEB0aGlydGVlbi5hY2guZWFybmVkID0ge31cbiAgICAjIEB0aGlydGVlbi5hY2guZWFybmVkLnZldGVyYW4gPSB0cnVlXG4gICAgIyBAdGhpcnRlZW4uYWNoLmVhcm5lZC50cnloYXJkID0gdHJ1ZVxuICAgICMgQHRoaXJ0ZWVuLmFjaC5lYXJuZWQuYnJlYWtlciA9IHRydWVcbiAgICAjIEB0aGlydGVlbi5hY2guZWFybmVkLmtlZXBpdGxvdyA9IHRydWVcbiAgICAjIEB0aGlydGVlbi5hY2guZWFybmVkLnN1aXRlZCA9IHRydWVcbiAgICAjIEB0aGlydGVlbi5hY2guZWFybmVkLnRvbnkgPSB0cnVlXG4gICAgIyBAdGhpcnRlZW4uYWNoLmVhcm5lZC5zYW1wbGVyID0gdHJ1ZVxuICAgICMgQHRoaXJ0ZWVuLmFjaC5lYXJuZWQudHJhZ2VkeSA9IHRydWVcbiAgICAjIEB0aGlydGVlbi5hY2guZWFybmVkLmluZG9taXRhYmxlID0gdHJ1ZVxuICAgICMgQHRoaXJ0ZWVuLmFjaC5lYXJuZWQucmVrdCA9IHRydWVcbiAgICAjIEB0aGlydGVlbi5hY2guZWFybmVkLmxhdGUgPSB0cnVlXG4gICAgIyBAdGhpcnRlZW4uYWNoLmVhcm5lZC5wYWlycyA9IHRydWVcblxuICAgICMgQHRoaXJ0ZWVuLmFjaC5zdGF0ZS50b3RhbEdhbWVzID0gMFxuICAgICMgQHRoaXJ0ZWVuLnN0cmVhayA9IDBcblxuICByZW5kZXJBY2hpZXZlbWVudHM6IC0+XG4gICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcInNvbGlkXCIsIDAsIDAsIEB3aWR0aCwgQGhlaWdodCwgMCwgMCwgMCwgQGNvbG9ycy5hY2hfYmcsID0+XG4gICAgICBAcmVuZGVyTW9kZSA9IFJlbmRlck1vZGUuUEFVU0VcblxuICAgIGFjaGlldmVtZW50c0NvdW50ID0gYWNoaWV2ZW1lbnRzTGlzdC5sZW5ndGhcbiAgICBhY2hpZXZlbWVudHNQYWdlQ291bnQgPSBNYXRoLmNlaWwoYWNoaWV2ZW1lbnRzQ291bnQgLyAxNClcbiAgICBhY2hpZXZlbWVudHNFYXJuZWQgPSAwXG4gICAgZm9yIGFjaCwgYWNoSW5kZXggaW4gYWNoaWV2ZW1lbnRzTGlzdFxuICAgICAgaWYgQHRoaXJ0ZWVuLmFjaC5lYXJuZWRbYWNoLmlkXVxuICAgICAgICBhY2hpZXZlbWVudHNFYXJuZWQgKz0gMVxuXG4gICAgdGl0bGVUZXh0ID0gXCJBY2hpZXZlbWVudHMgLSAje2FjaGlldmVtZW50c0Vhcm5lZH0gLyAje2FjaGlldmVtZW50c0NvdW50fSBDb21wbGV0ZSAtIFBhZ2UgI3tAYWNoaWV2ZW1lbnRzUGFnZSArIDF9IG9mICN7YWNoaWV2ZW1lbnRzUGFnZUNvdW50fVwiXG5cbiAgICB0aXRsZUhlaWdodCA9IEBoZWlnaHQgLyAyMFxuICAgIHRpdGxlT2Zmc2V0ID0gdGl0bGVIZWlnaHQgLyAyXG4gICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIHRpdGxlSGVpZ2h0LCB0aXRsZVRleHQsIEBjZW50ZXIueCwgdGl0bGVPZmZzZXQsIDAuNSwgMC41LCBAY29sb3JzLmFjaF9oZWFkZXJcblxuICAgIGlmIGFjaGlldmVtZW50c1BhZ2VDb3VudCA+IDFcbiAgICAgIG5leHREaW0gPSBAd2lkdGggKiAwLjFcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCB0aXRsZUhlaWdodCwgXCJbIE5leHQgXVwiLCBAd2lkdGgsIHRpdGxlT2Zmc2V0LCAxLCAwLjUsIEBjb2xvcnMuYWNoX2J1dHRvblxuICAgICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcInNvbGlkXCIsIEB3aWR0aCAtIG5leHREaW0sIDAsIG5leHREaW0sIG5leHREaW0sIDAsIDAsIDAsIEBjb2xvcnMudHJhbnNwYXJlbnQsID0+XG4gICAgICAgIEBhY2hpZXZlbWVudHNQYWdlID0gKEBhY2hpZXZlbWVudHNQYWdlICsgMSkgJSBhY2hpZXZlbWVudHNQYWdlQ291bnRcblxuICAgIGltYWdlTWFyZ2luID0gQHdpZHRoIC8gMTVcbiAgICB0b3BIZWlnaHQgPSB0aXRsZUhlaWdodFxuICAgIHggPSBAd2lkdGggLyAxMjBcbiAgICB5ID0gdG9wSGVpZ2h0XG4gICAgdGl0bGVIZWlnaHQgPSBAaGVpZ2h0IC8gMjJcbiAgICBkZXNjSGVpZ2h0ID0gQGhlaWdodCAvIDMwXG4gICAgaW1hZ2VEaW0gPSB0aXRsZUhlaWdodCAqIDJcbiAgICBzdGFydEFjaEluZGV4ID0gQGFjaGlldmVtZW50c1BhZ2UgKiAxNFxuICAgIGVuZEFjaEluZGV4ID0gc3RhcnRBY2hJbmRleCArIDE0XG4gICAgaWYgZW5kQWNoSW5kZXggPiAoYWNoaWV2ZW1lbnRzTGlzdC5sZW5ndGggLSAxKVxuICAgICAgZW5kQWNoSW5kZXggPSBhY2hpZXZlbWVudHNMaXN0Lmxlbmd0aCAtIDFcbiAgICBmb3IgYWNoSW5kZXggaW4gW3N0YXJ0QWNoSW5kZXguLmVuZEFjaEluZGV4XVxuICAgICAgYWNoU2NyZWVuSW5kZXggPSBhY2hJbmRleCAtIHN0YXJ0QWNoSW5kZXhcbiAgICAgIGFjaCA9IGFjaGlldmVtZW50c0xpc3RbYWNoSW5kZXhdXG4gICAgICBpY29uID0gXCJzdGFyX29mZlwiXG4gICAgICBpZiBAdGhpcnRlZW4uYWNoLmVhcm5lZFthY2guaWRdXG4gICAgICAgIGljb24gPSBcInN0YXJfb25cIlxuICAgICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBpY29uLCB4LCB5LCBpbWFnZURpbSwgaW1hZ2VEaW0sIDAsIDAsIDAsIEBjb2xvcnMud2hpdGVcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCB0aXRsZUhlaWdodCwgYWNoLnRpdGxlLCB4ICsgaW1hZ2VNYXJnaW4sIHksIDAsIDAsIEBjb2xvcnMuYWNoX3RpdGxlXG4gICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgZGVzY0hlaWdodCwgYWNoLmRlc2NyaXB0aW9uWzBdLCB4ICsgaW1hZ2VNYXJnaW4sIHkgKyB0aXRsZUhlaWdodCwgMCwgMCwgQGNvbG9ycy5hY2hfZGVzY1xuICAgICAgaWYgYWNoLnByb2dyZXNzP1xuICAgICAgICBwcm9ncmVzcyA9IGFjaC5wcm9ncmVzcyhAdGhpcnRlZW4uYWNoKVxuICAgICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgZGVzY0hlaWdodCwgcHJvZ3Jlc3MsIHggKyBpbWFnZU1hcmdpbiwgeSArIHRpdGxlSGVpZ2h0ICsgZGVzY0hlaWdodCwgMCwgMCwgQGNvbG9ycy5hY2hfZGVzY1xuICAgICAgZWxzZVxuICAgICAgICBpZiBhY2guZGVzY3JpcHRpb24ubGVuZ3RoID4gMVxuICAgICAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCBkZXNjSGVpZ2h0LCBhY2guZGVzY3JpcHRpb25bMV0sIHggKyBpbWFnZU1hcmdpbiwgeSArIHRpdGxlSGVpZ2h0ICsgZGVzY0hlaWdodCwgMCwgMCwgQGNvbG9ycy5hY2hfZGVzY1xuICAgICAgaWYgYWNoU2NyZWVuSW5kZXggPT0gNlxuICAgICAgICB5ID0gdG9wSGVpZ2h0XG4gICAgICAgIHggKz0gQHdpZHRoIC8gMlxuICAgICAgZWxzZVxuICAgICAgICB5ICs9IHRpdGxlSGVpZ2h0ICogM1xuXG4gIHJlbmRlckFJSGFuZDogKGhhbmQsIHgsIHksIG9mZnNldCkgLT5cbiAgICBzb3J0ZWQgPSBoYW5kLnNvcnQgKGEsIGIpIC0+IGEgLSBiXG4gICAgZm9yIHJhdywgaSBpbiBzb3J0ZWRcbiAgICAgIEBoYW5kLnJlbmRlckNhcmQgcmF3LCB4ICsgKGkgKiBvZmZzZXQpLCB5LCAwLCAwLjcsIDBcblxuICByZW5kZXJHYW1lOiAtPlxuXG4gICAgIyBiYWNrZ3JvdW5kXG4gICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcInNvbGlkXCIsIDAsIDAsIEB3aWR0aCwgQGhlaWdodCwgMCwgMCwgMCwgQGNvbG9ycy5iYWNrZ3JvdW5kXG5cbiAgICB0ZXh0SGVpZ2h0ID0gQGFhSGVpZ2h0IC8gMjVcbiAgICB0ZXh0UGFkZGluZyA9IHRleHRIZWlnaHQgLyA1XG4gICAgY2hhcmFjdGVySGVpZ2h0ID0gQGFhSGVpZ2h0IC8gNVxuICAgIGNvdW50SGVpZ2h0ID0gdGV4dEhlaWdodFxuXG4gICAgZHJhd0dhbWVPdmVyID0gQHRoaXJ0ZWVuLmdhbWVPdmVyKCkgYW5kIEBwaWxlLnJlc3RpbmcoKVxuXG4gICAgIyBMb2dcbiAgICBmb3IgbGluZSwgaSBpbiBAdGhpcnRlZW4ubG9nXG4gICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgdGV4dEhlaWdodCwgbGluZSwgMCwgKGkrMS41KSAqICh0ZXh0SGVpZ2h0ICsgdGV4dFBhZGRpbmcpLCAwLCAwLCBAY29sb3JzLmxvZ2NvbG9yXG5cbiAgICBhaVBsYXllcnMgPSBbXG4gICAgICBAdGhpcnRlZW4ucGxheWVyc1sxXVxuICAgICAgQHRoaXJ0ZWVuLnBsYXllcnNbMl1cbiAgICAgIEB0aGlydGVlbi5wbGF5ZXJzWzNdXG4gICAgXVxuXG4gICAgY2hhcmFjdGVyTWFyZ2luID0gY2hhcmFjdGVySGVpZ2h0IC8gMlxuICAgIEBjaGFyQ2VpbGluZyA9IEBoZWlnaHQgKiAwLjZcblxuICAgIGFpQ2FyZFNwYWNpbmcgPSBAd2lkdGggKiAwLjAxNVxuXG4gICAgIyBsZWZ0IHNpZGVcbiAgICBpZiBhaVBsYXllcnNbMF0gIT0gbnVsbFxuICAgICAgaWYgZHJhd0dhbWVPdmVyXG4gICAgICAgIEByZW5kZXJBSUhhbmQgYWlQbGF5ZXJzWzBdLmhhbmQsIEB3aWR0aCAqIDAuMiwgQGhlaWdodCAqIDAuNjIsIGFpQ2FyZFNwYWNpbmdcblxuICAgICAgY2hhcmFjdGVyID0gYWlDaGFyYWN0ZXJzW2FpUGxheWVyc1swXS5jaGFySURdXG4gICAgICBjaGFyYWN0ZXJXaWR0aCA9IEBzcHJpdGVSZW5kZXJlci5jYWxjV2lkdGgoY2hhcmFjdGVyLnNwcml0ZSwgY2hhcmFjdGVySGVpZ2h0KVxuICAgICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBjaGFyYWN0ZXIuc3ByaXRlLCBjaGFyYWN0ZXJNYXJnaW4sIEBjaGFyQ2VpbGluZywgMCwgY2hhcmFjdGVySGVpZ2h0LCAwLCAwLCAxLCBAY29sb3JzLndoaXRlLCA9PlxuICAgICAgICAjIEBkZWJ1ZygpXG4gICAgICBAcmVuZGVyQ291bnQgYWlQbGF5ZXJzWzBdLCBAdGhpcnRlZW4ubW9uZXksIGRyYXdHYW1lT3ZlciwgYWlQbGF5ZXJzWzBdLmluZGV4ID09IEB0aGlydGVlbi50dXJuLCBjb3VudEhlaWdodCwgY2hhcmFjdGVyTWFyZ2luICsgKGNoYXJhY3RlcldpZHRoIC8gMiksIEBjaGFyQ2VpbGluZyAtIHRleHRQYWRkaW5nLCAwLjUsIDBcblxuICAgICMgdG9wIHNpZGVcbiAgICBpZiBhaVBsYXllcnNbMV0gIT0gbnVsbFxuICAgICAgaWYgZHJhd0dhbWVPdmVyXG4gICAgICAgIEByZW5kZXJBSUhhbmQgYWlQbGF5ZXJzWzFdLmhhbmQsIEB3aWR0aCAqIDAuNiwgQGhlaWdodCAqIDAuMTgsIGFpQ2FyZFNwYWNpbmdcblxuICAgICAgY2hhcmFjdGVyID0gYWlDaGFyYWN0ZXJzW2FpUGxheWVyc1sxXS5jaGFySURdXG4gICAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIGNoYXJhY3Rlci5zcHJpdGUsIEBjZW50ZXIueCwgMCwgMCwgY2hhcmFjdGVySGVpZ2h0LCAwLCAwLjUsIDAsIEBjb2xvcnMud2hpdGVcbiAgICAgIEByZW5kZXJDb3VudCBhaVBsYXllcnNbMV0sIEB0aGlydGVlbi5tb25leSwgZHJhd0dhbWVPdmVyLCBhaVBsYXllcnNbMV0uaW5kZXggPT0gQHRoaXJ0ZWVuLnR1cm4sIGNvdW50SGVpZ2h0LCBAY2VudGVyLngsIGNoYXJhY3RlckhlaWdodCwgMC41LCAwXG5cbiAgICAjIHJpZ2h0IHNpZGVcbiAgICBpZiBhaVBsYXllcnNbMl0gIT0gbnVsbFxuICAgICAgaWYgZHJhd0dhbWVPdmVyXG4gICAgICAgIEByZW5kZXJBSUhhbmQgYWlQbGF5ZXJzWzJdLmhhbmQsIEB3aWR0aCAqIDAuNywgQGhlaWdodCAqIDAuNjIsIGFpQ2FyZFNwYWNpbmdcblxuICAgICAgY2hhcmFjdGVyID0gYWlDaGFyYWN0ZXJzW2FpUGxheWVyc1syXS5jaGFySURdXG4gICAgICBjaGFyYWN0ZXJXaWR0aCA9IEBzcHJpdGVSZW5kZXJlci5jYWxjV2lkdGgoY2hhcmFjdGVyLnNwcml0ZSwgY2hhcmFjdGVySGVpZ2h0KVxuICAgICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBjaGFyYWN0ZXIuc3ByaXRlLCBAd2lkdGggLSBjaGFyYWN0ZXJNYXJnaW4sIEBjaGFyQ2VpbGluZywgMCwgY2hhcmFjdGVySGVpZ2h0LCAwLCAxLCAxLCBAY29sb3JzLndoaXRlXG4gICAgICBAcmVuZGVyQ291bnQgYWlQbGF5ZXJzWzJdLCBAdGhpcnRlZW4ubW9uZXksIGRyYXdHYW1lT3ZlciwgYWlQbGF5ZXJzWzJdLmluZGV4ID09IEB0aGlydGVlbi50dXJuLCBjb3VudEhlaWdodCwgQHdpZHRoIC0gKGNoYXJhY3Rlck1hcmdpbiArIChjaGFyYWN0ZXJXaWR0aCAvIDIpKSwgQGNoYXJDZWlsaW5nIC0gdGV4dFBhZGRpbmcsIDAuNSwgMFxuXG4gICAgIyBjYXJkIGFyZWFcbiAgICBoYW5kQXJlYUhlaWdodCA9IDAuMjcgKiBAaGVpZ2h0XG4gICAgY2FyZEFyZWFUZXh0ID0gbnVsbFxuICAgIHN3aXRjaCBAaGFuZC5tb2RlXG4gICAgICB3aGVuIEhhbmQuUElDS0lOR1xuICAgICAgICBoYW5kYXJlYUNvbG9yID0gQGNvbG9ycy5oYW5kX3BpY2tcbiAgICAgICAgaWYgKEB0aGlydGVlbi50dXJuID09IDApIGFuZCAoQHRoaXJ0ZWVuLmV2ZXJ5b25lUGFzc2VkKCkgb3IgKEB0aGlydGVlbi5jdXJyZW50UGxheSA9PSBudWxsKSlcbiAgICAgICAgICBoYW5kYXJlYUNvbG9yID0gQGNvbG9ycy5oYW5kX2FueVxuICAgICAgICAgIGlmIEB0aGlydGVlbi5waWxlLmxlbmd0aCA9PSAwXG4gICAgICAgICAgICBjYXJkQXJlYVRleHQgPSAnQW55dGhpbmcgKDNcXHhjOCknXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgY2FyZEFyZWFUZXh0ID0gJ0FueXRoaW5nJ1xuICAgICAgd2hlbiBIYW5kLlBVU0hJTkdcbiAgICAgICAgaGFuZGFyZWFDb2xvciA9IEBjb2xvcnMuaGFuZF9wdXNoXG4gICAgICAgIGNhcmRBcmVhVGV4dCA9ICdTb3J0aW5nJ1xuICAgICAgZWxzZVxuICAgICAgICBjYXJkQXJlYVRleHQgPSAnRHJhZ2dpbmcnXG4gICAgICAgIGhhbmRhcmVhQ29sb3IgPSBAY29sb3JzLmhhbmRfZHJhZ1xuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJzb2xpZFwiLCAwLCBAaGVpZ2h0LCBAd2lkdGgsIGhhbmRBcmVhSGVpZ2h0LCAwLCAwLCAxLCBoYW5kYXJlYUNvbG9yLCA9PlxuICAgICAgQGhhbmQuY3ljbGVNb2RlKClcblxuICAgICMgcGlsZVxuICAgIHBpbGVEaW1lbnNpb24gPSBAaGVpZ2h0ICogMC40XG4gICAgcGlsZVNwcml0ZSA9IFwicGlsZVwiXG4gICAgaWYgKEB0aGlydGVlbi50dXJuID49IDApIGFuZCAoQHRoaXJ0ZWVuLnR1cm4gPD0gMylcbiAgICAgIHBpbGVTcHJpdGUgKz0gQHRoaXJ0ZWVuLnR1cm5cbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIHBpbGVTcHJpdGUsIEB3aWR0aCAvIDIsIEBoZWlnaHQgLyAyLCBwaWxlRGltZW5zaW9uLCBwaWxlRGltZW5zaW9uLCAwLCAwLjUsIDAuNSwgQGNvbG9ycy53aGl0ZSwgPT5cbiAgICAgIEBwbGF5UGlja2VkKClcbiAgICBAcGlsZS5yZW5kZXIoKVxuXG4gICAgQGhhbmQucmVuZGVyKClcblxuICAgIGlmIGRyYXdHYW1lT3ZlclxuICAgICAgIyBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwic29saWRcIiwgMCwgMCwgQHdpZHRoLCBAaGVpZ2h0IC0gaGFuZEFyZWFIZWlnaHQsIDAsIDAsIDAsIEBjb2xvcnMucGxheV9hZ2FpblxuXG4gICAgICBsaW5lcyA9IEBnYW1lT3ZlclRleHQoKVxuICAgICAgZ2FtZU92ZXJTaXplID0gQGFhSGVpZ2h0IC8gOFxuICAgICAgZ2FtZU92ZXJZID0gQGNlbnRlci55XG4gICAgICBpZiBsaW5lcy5sZW5ndGggPiAxXG4gICAgICAgIGdhbWVPdmVyWSAtPSAoZ2FtZU92ZXJTaXplID4+IDEpXG4gICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgZ2FtZU92ZXJTaXplLCBsaW5lc1swXSwgQGNlbnRlci54LCBnYW1lT3ZlclksIDAuNSwgMC41LCBAY29sb3JzLmdhbWVfb3ZlclxuICAgICAgaWYgbGluZXMubGVuZ3RoID4gMVxuICAgICAgICBnYW1lT3ZlclkgKz0gZ2FtZU92ZXJTaXplXG4gICAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCBnYW1lT3ZlclNpemUsIGxpbmVzWzFdLCBAY2VudGVyLngsIGdhbWVPdmVyWSwgMC41LCAwLjUsIEBjb2xvcnMuZ2FtZV9vdmVyXG5cbiAgICAgIHBsYXlBZ2FpblRleHQgPSBcIlBsYXkgQWdhaW5cIlxuICAgICAgaWYgQHRoaXJ0ZWVuLnNvbWVvbmVHYXZlVXAoKVxuICAgICAgICBwbGF5QWdhaW5UZXh0ID0gXCJOZXcgTW9uZXkgR2FtZVwiXG4gICAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwic29saWRcIiwgMCwgQGhlaWdodCwgQHdpZHRoLCBoYW5kQXJlYUhlaWdodCwgMCwgMCwgMSwgQGNvbG9ycy5wbGF5X2FnYWluLCA9PlxuICAgICAgICBpZiBAdGhpcnRlZW4uc29tZW9uZUdhdmVVcCgpXG4gICAgICAgICAgQHRoaXJ0ZWVuLm5ld0dhbWUodHJ1ZSwgdHJ1ZSkgIyBzcGVjaWFsIGNhc2U6IGFsbG93IHlvdSB0byBrZWVwIHlvdXIgc3RyZWFrcyBnb2luZ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgQHRoaXJ0ZWVuLmRlYWwoKVxuICAgICAgICBAcHJlcGFyZUdhbWUoKVxuXG4gICAgICByZXN0YXJ0UXVpdFNpemUgPSBAYWFIZWlnaHQgLyAxMlxuICAgICAgc2hhZG93RGlzdGFuY2UgPSByZXN0YXJ0UXVpdFNpemUgLyA4XG4gICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgcmVzdGFydFF1aXRTaXplLCBwbGF5QWdhaW5UZXh0LCBzaGFkb3dEaXN0YW5jZSArIEBjZW50ZXIueCwgc2hhZG93RGlzdGFuY2UgKyAoQGhlaWdodCAtIChoYW5kQXJlYUhlaWdodCAqIDAuNSkpLCAwLjUsIDEsIEBjb2xvcnMuYmxhY2tcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCByZXN0YXJ0UXVpdFNpemUsIHBsYXlBZ2FpblRleHQsIEBjZW50ZXIueCwgQGhlaWdodCAtIChoYW5kQXJlYUhlaWdodCAqIDAuNSksIDAuNSwgMSwgQGNvbG9ycy5nb2xkXG5cbiAgICBAcmVuZGVyQ291bnQgQHRoaXJ0ZWVuLnBsYXllcnNbMF0sIEB0aGlydGVlbi5tb25leSwgZHJhd0dhbWVPdmVyLCAwID09IEB0aGlydGVlbi50dXJuLCBjb3VudEhlaWdodCwgQGNlbnRlci54LCBAaGVpZ2h0LCAwLjUsIDFcblxuICAgICMgSGVhZGxpbmUgKGluY2x1ZGVzIGVycm9yKVxuICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCB0ZXh0SGVpZ2h0LCBAY2FsY0hlYWRsaW5lKCksIDAsIDAsIDAsIDAsIEBjb2xvcnMubGlnaHRncmF5XG5cbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwicGF1c2VcIiwgQHdpZHRoLCAwLCAwLCBAcGF1c2VCdXR0b25TaXplLCAwLCAxLCAwLCBAY29sb3JzLndoaXRlLCA9PlxuICAgICAgQHJlbmRlck1vZGUgPSBSZW5kZXJNb2RlLlBBVVNFXG5cbiAgICBpZiBjYXJkQXJlYVRleHQgIT0gbnVsbFxuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIHRleHRIZWlnaHQsIGNhcmRBcmVhVGV4dCwgMC4wMiAqIEB3aWR0aCwgQGhlaWdodCAtIGhhbmRBcmVhSGVpZ2h0LCAwLCAwLCBAY29sb3JzLndoaXRlXG5cbiAgICBpZiBAYWNoaWV2ZW1lbnRGYW5mYXJlICE9IG51bGxcbiAgICAgIGlmIEBhY2hpZXZlbWVudEZhbmZhcmUudGltZSA8IDEwMDBcbiAgICAgICAgb3BhY2l0eSA9IEBhY2hpZXZlbWVudEZhbmZhcmUudGltZSAvIDEwMDBcbiAgICAgIGVsc2UgaWYgQGFjaGlldmVtZW50RmFuZmFyZS50aW1lID4gNDAwMFxuICAgICAgICBvcGFjaXR5ID0gMSAtICgoQGFjaGlldmVtZW50RmFuZmFyZS50aW1lIC0gNDAwMCkgLyAxMDAwKVxuICAgICAgZWxzZVxuICAgICAgICBvcGFjaXR5ID0gMVxuICAgICAgY29sb3IgPSB7cjoxLCBnOjEsIGI6MSwgYTpvcGFjaXR5fVxuICAgICAgeCA9IEB3aWR0aCAqIDAuNlxuICAgICAgeSA9IDBcbiAgICAgIHhUZXh0ID0geCArIChAd2lkdGggKiAwLjA2KVxuICAgICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcImF1XCIsIHgsIHksIDAsIEBoZWlnaHQgLyAxMCwgMCwgMCwgMCwgY29sb3IsID0+XG4gICAgICAgIEBhY2hpZXZlbWVudEZhbmZhcmUgPSBudWxsXG4gICAgICAgIEByZW5kZXJNb2RlID0gUmVuZGVyTW9kZS5BQ0hJRVZFTUVOVFNcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCB0ZXh0SGVpZ2h0LCBcIkFjaGlldmVtZW50IEVhcm5lZFwiLCB4VGV4dCwgeSwgMCwgMCwgY29sb3JcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCB0ZXh0SGVpZ2h0LCBAYWNoaWV2ZW1lbnRGYW5mYXJlLnRpdGxlLCB4VGV4dCwgeSArIHRleHRIZWlnaHQsIDAsIDAsIGNvbG9yXG5cbiAgICByZXR1cm5cblxuICByZW5kZXJDb3VudDogKHBsYXllciwgbW9uZXksIGRyYXdHYW1lT3ZlciwgbXlUdXJuLCBjb3VudEhlaWdodCwgeCwgeSwgYW5jaG9yeCwgYW5jaG9yeSkgLT5cbiAgICBpZiBteVR1cm5cbiAgICAgIG5hbWVDb2xvciA9IFwiYGZmNzcwMGBcIlxuICAgIGVsc2VcbiAgICAgIG5hbWVDb2xvciA9IFwiXCJcbiAgICBuYW1lU3RyaW5nID0gXCIgI3tuYW1lQ29sb3J9I3twbGF5ZXIubmFtZX1gYFwiXG4gICAgaWYgbW9uZXlcbiAgICAgIHBsYXllci5tb25leSA/PSAwXG4gICAgICBuYW1lU3RyaW5nICs9IFwiOiAkIGBhYWZmYWFgI3twbGF5ZXIubW9uZXl9XCJcbiAgICBuYW1lU3RyaW5nICs9IFwiIFwiXG4gICAgY2FyZENvdW50ID0gcGxheWVyLmhhbmQubGVuZ3RoXG4gICAgaWYgZHJhd0dhbWVPdmVyIG9yIChjYXJkQ291bnQgPT0gMClcbiAgICAgIGlmIG1vbmV5XG4gICAgICAgIHBsYWNlU3RyaW5nID0gXCI0dGhcIlxuICAgICAgICBpZiBwbGF5ZXIucGxhY2UgPT0gMVxuICAgICAgICAgIHBsYWNlU3RyaW5nID0gXCIxc3RcIlxuICAgICAgICBlbHNlIGlmIHBsYXllci5wbGFjZSA9PSAyXG4gICAgICAgICAgcGxhY2VTdHJpbmcgPSBcIjJuZFwiXG4gICAgICAgIGVsc2UgaWYgcGxheWVyLnBsYWNlID09IDNcbiAgICAgICAgICBwbGFjZVN0cmluZyA9IFwiM3JkXCJcbiAgICAgICAgY291bnRTdHJpbmcgPSBcIiBgZmZhYWZmYCN7cGxhY2VTdHJpbmd9YGAgUGxhY2UgXCJcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgcGxheWVyLnBsYWNlID09IDFcbiAgICAgICAgICBjb3VudFN0cmluZyA9IFwiIGBmZmZmYWFgV2lubmVyYGAgXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGNvdW50U3RyaW5nID0gXCIgYGZmYWFmZmBMb3NlcmBgIFwiXG4gICAgZWxzZVxuICAgICAgY291bnRTdHJpbmcgPSBcIiBgZmZmZjMzYCN7Y2FyZENvdW50fWBgIGxlZnQgXCJcblxuICAgIG5hbWVTaXplID0gQGZvbnRSZW5kZXJlci5zaXplKEBmb250LCBjb3VudEhlaWdodCwgbmFtZVN0cmluZylcbiAgICBjb3VudFNpemUgPSBAZm9udFJlbmRlcmVyLnNpemUoQGZvbnQsIGNvdW50SGVpZ2h0LCBjb3VudFN0cmluZylcbiAgICBpZiBuYW1lU2l6ZS53ID4gY291bnRTaXplLndcbiAgICAgIGNvdW50U2l6ZS53ID0gbmFtZVNpemUud1xuICAgIGVsc2VcbiAgICAgIG5hbWVTaXplLncgPSBjb3VudFNpemUud1xuICAgIG5hbWVZID0geVxuICAgIGNvdW50WSA9IHlcbiAgICBib3hIZWlnaHQgPSBjb3VudFNpemUuaFxuICAgIGlmIHRydWUgIyBwbGF5ZXIuaWQgIT0gMVxuICAgICAgYm94SGVpZ2h0ICo9IDJcbiAgICAgIGlmIGFuY2hvcnkgPiAwXG4gICAgICAgIG5hbWVZIC09IGNvdW50SGVpZ2h0XG4gICAgICBlbHNlXG4gICAgICAgIGNvdW50WSArPSBjb3VudEhlaWdodFxuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJzb2xpZFwiLCB4LCB5LCBjb3VudFNpemUudywgYm94SGVpZ2h0LCAwLCBhbmNob3J4LCBhbmNob3J5LCBAY29sb3JzLm92ZXJsYXlcbiAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgY291bnRIZWlnaHQsIG5hbWVTdHJpbmcsIHgsIG5hbWVZLCBhbmNob3J4LCBhbmNob3J5LCBAY29sb3JzLndoaXRlXG4gICAgaWYgdHJ1ZSAjIHBsYXllci5pZCAhPSAxXG4gICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgY291bnRIZWlnaHQsIGNvdW50U3RyaW5nLCB4LCBjb3VudFksIGFuY2hvcngsIGFuY2hvcnksIEBjb2xvcnMud2hpdGVcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgcmVuZGVyaW5nIGFuZCB6b25lc1xuXG4gIGRyYXdJbWFnZTogKHRleHR1cmUsIHN4LCBzeSwgc3csIHNoLCBkeCwgZHksIGR3LCBkaCwgcm90LCBhbmNob3J4LCBhbmNob3J5LCByLCBnLCBiLCBhLCBjYikgLT5cbiAgICBAcmVuZGVyQ29tbWFuZHMucHVzaCBAdGV4dHVyZXNbdGV4dHVyZV0sIHN4LCBzeSwgc3csIHNoLCBkeCwgZHksIGR3LCBkaCwgcm90LCBhbmNob3J4LCBhbmNob3J5LCByLCBnLCBiLCBhXG5cbiAgICBpZiBjYj9cbiAgICAgICMgY2FsbGVyIHdhbnRzIHRvIHJlbWVtYmVyIHdoZXJlIHRoaXMgd2FzIGRyYXduLCBhbmQgd2FudHMgdG8gYmUgY2FsbGVkIGJhY2sgaWYgaXQgaXMgZXZlciB0b3VjaGVkXG4gICAgICAjIFRoaXMgaXMgY2FsbGVkIGEgXCJ6b25lXCIuIFNpbmNlIHpvbmVzIGFyZSB0cmF2ZXJzZWQgaW4gcmV2ZXJzZSBvcmRlciwgdGhlIG5hdHVyYWwgb3ZlcmxhcCBvZlxuICAgICAgIyBhIHNlcmllcyBvZiByZW5kZXJzIGlzIHJlc3BlY3RlZCBhY2NvcmRpbmdseS5cbiAgICAgIGFuY2hvck9mZnNldFggPSAtMSAqIGFuY2hvcnggKiBkd1xuICAgICAgYW5jaG9yT2Zmc2V0WSA9IC0xICogYW5jaG9yeSAqIGRoXG4gICAgICB6b25lID1cbiAgICAgICAgIyBjZW50ZXIgKFgsWSkgYW5kIHJldmVyc2VkIHJvdGF0aW9uLCB1c2VkIHRvIHB1dCB0aGUgY29vcmRpbmF0ZSBpbiBsb2NhbCBzcGFjZSB0byB0aGUgem9uZVxuICAgICAgICBjeDogIGR4XG4gICAgICAgIGN5OiAgZHlcbiAgICAgICAgcm90OiByb3QgKiAtMVxuICAgICAgICAjIHRoZSBheGlzIGFsaWduZWQgYm91bmRpbmcgYm94IHVzZWQgZm9yIGRldGVjdGlvbiBvZiBhIGxvY2Fsc3BhY2UgY29vcmRcbiAgICAgICAgbDogICBhbmNob3JPZmZzZXRYXG4gICAgICAgIHQ6ICAgYW5jaG9yT2Zmc2V0WVxuICAgICAgICByOiAgIGFuY2hvck9mZnNldFggKyBkd1xuICAgICAgICBiOiAgIGFuY2hvck9mZnNldFkgKyBkaFxuICAgICAgICAjIGNhbGxiYWNrIHRvIGNhbGwgaWYgdGhlIHpvbmUgaXMgY2xpY2tlZCBvblxuICAgICAgICBjYjogIGNiXG4gICAgICBAem9uZXMucHVzaCB6b25lXG5cbiAgY2hlY2tab25lczogKHgsIHkpIC0+XG4gICAgZm9yIHpvbmUgaW4gQHpvbmVzIGJ5IC0xXG4gICAgICAjIG1vdmUgY29vcmQgaW50byBzcGFjZSByZWxhdGl2ZSB0byB0aGUgcXVhZCwgdGhlbiByb3RhdGUgaXQgdG8gbWF0Y2hcbiAgICAgIHVucm90YXRlZExvY2FsWCA9IHggLSB6b25lLmN4XG4gICAgICB1bnJvdGF0ZWRMb2NhbFkgPSB5IC0gem9uZS5jeVxuICAgICAgbG9jYWxYID0gdW5yb3RhdGVkTG9jYWxYICogTWF0aC5jb3Moem9uZS5yb3QpIC0gdW5yb3RhdGVkTG9jYWxZICogTWF0aC5zaW4oem9uZS5yb3QpXG4gICAgICBsb2NhbFkgPSB1bnJvdGF0ZWRMb2NhbFggKiBNYXRoLnNpbih6b25lLnJvdCkgKyB1bnJvdGF0ZWRMb2NhbFkgKiBNYXRoLmNvcyh6b25lLnJvdClcbiAgICAgIGlmIChsb2NhbFggPCB6b25lLmwpIG9yIChsb2NhbFggPiB6b25lLnIpIG9yIChsb2NhbFkgPCB6b25lLnQpIG9yIChsb2NhbFkgPiB6b25lLmIpXG4gICAgICAgICMgb3V0c2lkZSBvZiBvcmllbnRlZCBib3VuZGluZyBib3hcbiAgICAgICAgY29udGludWVcbiAgICAgIHpvbmUuY2IoeCwgeSlcbiAgICAgIHJldHVybiB0cnVlXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVcbiIsIkFuaW1hdGlvbiA9IHJlcXVpcmUgJy4vQW5pbWF0aW9uJ1xuXG5DQVJEX0lNQUdFX1cgPSAxMjBcbkNBUkRfSU1BR0VfSCA9IDE2MlxuQ0FSRF9JTUFHRV9PRkZfWCA9IDRcbkNBUkRfSU1BR0VfT0ZGX1kgPSA0XG5DQVJEX0lNQUdFX0FEVl9YID0gQ0FSRF9JTUFHRV9XXG5DQVJEX0lNQUdFX0FEVl9ZID0gQ0FSRF9JTUFHRV9IXG5DQVJEX1JFTkRFUl9TQ0FMRSA9IDAuMzUgICAgICAgICAgICAgICAgICAjIGNhcmQgaGVpZ2h0IGNvZWZmaWNpZW50IGZyb20gdGhlIHNjcmVlbidzIGhlaWdodFxuQ0FSRF9IQU5EX0NVUlZFX0RJU1RfRkFDVE9SID0gMy41ICAgICAgICAgIyBmYWN0b3Igd2l0aCBzY3JlZW4gaGVpZ2h0IHRvIGZpZ3VyZSBvdXQgY2VudGVyIG9mIGFyYy4gYmlnZ2VyIG51bWJlciBpcyBsZXNzIGFyY1xuQ0FSRF9IT0xESU5HX1JPVF9PUkRFUiA9IE1hdGguUEkgLyAxMiAgICAgIyBkZXNpcmVkIHJvdGF0aW9uIG9mIHRoZSBjYXJkIHdoZW4gYmVpbmcgZHJhZ2dlZCBhcm91bmQgZm9yIG9yZGVyaW5nJ3Mgc2FrZVxuQ0FSRF9IT0xESU5HX1JPVF9QTEFZID0gLTEgKiBNYXRoLlBJIC8gMTIgIyBkZXNpcmVkIHJvdGF0aW9uIG9mIHRoZSBjYXJkIHdoZW4gYmVpbmcgZHJhZ2dlZCBhcm91bmQgd2l0aCBpbnRlbnQgdG8gcGxheVxuQ0FSRF9QTEFZX0NFSUxJTkcgPSAwLjYwICAgICAgICAgICAgICAgICAgIyBob3cgbXVjaCBvZiB0aGUgdG9wIG9mIHRoZSBzY3JlZW4gcmVwcmVzZW50cyBcIkkgd2FudCB0byBwbGF5IHRoaXNcIiB2cyBcIkkgd2FudCB0byByZW9yZGVyXCJcblxuTk9fQ0FSRCA9IC0xXG5cbkhpZ2hsaWdodCA9XG4gIE5PTkU6IC0xXG4gIFVOU0VMRUNURUQ6IDBcbiAgU0VMRUNURUQ6IDFcbiAgUElMRTogMlxuXG4jIHRha2VuIGZyb20gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMjExMjEyL2hvdy10by1jYWxjdWxhdGUtYW4tYW5nbGUtZnJvbS10aHJlZS1wb2ludHNcbiMgdXNlcyBsYXcgb2YgY29zaW5lcyB0byBmaWd1cmUgb3V0IHRoZSBoYW5kIGFyYyBhbmdsZVxuZmluZEFuZ2xlID0gKHAwLCBwMSwgcDIpIC0+XG4gICAgYSA9IE1hdGgucG93KHAxLnggLSBwMi54LCAyKSArIE1hdGgucG93KHAxLnkgLSBwMi55LCAyKVxuICAgIGIgPSBNYXRoLnBvdyhwMS54IC0gcDAueCwgMikgKyBNYXRoLnBvdyhwMS55IC0gcDAueSwgMilcbiAgICBjID0gTWF0aC5wb3cocDIueCAtIHAwLngsIDIpICsgTWF0aC5wb3cocDIueSAtIHAwLnksIDIpXG4gICAgcmV0dXJuIE1hdGguYWNvcyggKGErYi1jKSAvIE1hdGguc3FydCg0KmEqYikgKVxuXG5jYWxjRGlzdGFuY2UgPSAocDAsIHAxKSAtPlxuICByZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KHAxLnggLSBwMC54LCAyKSArIE1hdGgucG93KHAxLnkgLSBwMC55LCAyKSlcblxuY2FsY0Rpc3RhbmNlU3F1YXJlZCA9ICh4MCwgeTAsIHgxLCB5MSkgLT5cbiAgcmV0dXJuIE1hdGgucG93KHgxIC0geDAsIDIpICsgTWF0aC5wb3coeTEgLSB5MCwgMilcblxuY2xhc3MgSGFuZFxuICBAQ0FSRF9JTUFHRV9XOiBDQVJEX0lNQUdFX1dcbiAgQENBUkRfSU1BR0VfSDogQ0FSRF9JTUFHRV9IXG4gIEBDQVJEX0lNQUdFX09GRl9YOiBDQVJEX0lNQUdFX09GRl9YXG4gIEBDQVJEX0lNQUdFX09GRl9ZOiBDQVJEX0lNQUdFX09GRl9ZXG4gIEBDQVJEX0lNQUdFX0FEVl9YOiBDQVJEX0lNQUdFX0FEVl9YXG4gIEBDQVJEX0lNQUdFX0FEVl9ZOiBDQVJEX0lNQUdFX0FEVl9ZXG4gIEBDQVJEX1JFTkRFUl9TQ0FMRTogQ0FSRF9SRU5ERVJfU0NBTEVcbiAgQEhpZ2hsaWdodDogSGlnaGxpZ2h0XG5cbiAgQFBJQ0tJTkc6IDBcbiAgQERSQUdHSU5HOiAxXG4gIEBQVVNISU5HOiAyXG5cbiAgY29uc3RydWN0b3I6IChAZ2FtZSkgLT5cbiAgICBAY2FyZHMgPSBbXVxuICAgIEBhbmltcyA9IHt9XG4gICAgQHBvc2l0aW9uQ2FjaGUgPSB7fVxuXG4gICAgQG1vZGUgPSBIYW5kLlBJQ0tJTkdcbiAgICBAcGlja2VkID0gW11cbiAgICBAcGlja1BhaW50ID0gZmFsc2VcblxuICAgIEBkcmFnSW5kZXhTdGFydCA9IE5PX0NBUkRcbiAgICBAZHJhZ0luZGV4Q3VycmVudCA9IE5PX0NBUkRcbiAgICBAZHJhZ1ggPSAwXG4gICAgQGRyYWdZID0gMFxuXG4gICAgIyByZW5kZXIgLyBhbmltIG1ldHJpY3NcbiAgICBAY2FyZFNwZWVkID1cbiAgICAgIHI6IE1hdGguUEkgKiAyXG4gICAgICBzOiAyLjVcbiAgICAgIHQ6IDIgKiBAZ2FtZS53aWR0aFxuICAgIEBwbGF5Q2VpbGluZyA9IENBUkRfUExBWV9DRUlMSU5HICogQGdhbWUuaGVpZ2h0XG4gICAgQGNhcmRIZWlnaHQgPSBNYXRoLmZsb29yKEBnYW1lLmhlaWdodCAqIENBUkRfUkVOREVSX1NDQUxFKVxuICAgIEBjYXJkV2lkdGggID0gTWF0aC5mbG9vcihAY2FyZEhlaWdodCAqIENBUkRfSU1BR0VfVyAvIENBUkRfSU1BR0VfSClcbiAgICBAY2FyZEhhbGZIZWlnaHQgPSBAY2FyZEhlaWdodCA+PiAxXG4gICAgQGNhcmRIYWxmV2lkdGggID0gQGNhcmRXaWR0aCA+PiAxXG4gICAgYXJjTWFyZ2luID0gQGNhcmRXaWR0aCAvIDJcbiAgICBhcmNWZXJ0aWNhbEJpYXMgPSBAY2FyZEhlaWdodCAvIDUwXG4gICAgYm90dG9tTGVmdCAgPSB7IHg6IGFyY01hcmdpbiwgICAgICAgICAgICAgICAgeTogYXJjVmVydGljYWxCaWFzICsgQGdhbWUuaGVpZ2h0IH1cbiAgICBib3R0b21SaWdodCA9IHsgeDogQGdhbWUud2lkdGggLSBhcmNNYXJnaW4sIHk6IGFyY1ZlcnRpY2FsQmlhcyArIEBnYW1lLmhlaWdodCB9XG4gICAgQGhhbmRDZW50ZXIgPSB7IHg6IEBnYW1lLndpZHRoIC8gMiwgICAgICAgICB5OiBhcmNWZXJ0aWNhbEJpYXMgKyBAZ2FtZS5oZWlnaHQgKyAoQ0FSRF9IQU5EX0NVUlZFX0RJU1RfRkFDVE9SICogQGdhbWUuaGVpZ2h0KSB9XG4gICAgQGhhbmRBbmdsZSA9IGZpbmRBbmdsZShib3R0b21MZWZ0LCBAaGFuZENlbnRlciwgYm90dG9tUmlnaHQpXG4gICAgQGhhbmREaXN0YW5jZSA9IGNhbGNEaXN0YW5jZShib3R0b21MZWZ0LCBAaGFuZENlbnRlcilcbiAgICBAaGFuZEFuZ2xlQWR2YW5jZU1heCA9IEBoYW5kQW5nbGUgLyA3ICMgbmV2ZXIgc3BhY2UgdGhlIGNhcmRzIG1vcmUgdGhhbiB3aGF0IHRoZXknZCBsb29rIGxpa2Ugd2l0aCB0aGlzIGhhbmRzaXplXG4gICAgQGdhbWUubG9nIFwiSGFuZCBkaXN0YW5jZSAje0BoYW5kRGlzdGFuY2V9LCBhbmdsZSAje0BoYW5kQW5nbGV9IChzY3JlZW4gaGVpZ2h0ICN7QGdhbWUuaGVpZ2h0fSlcIlxuXG4gIHBpY2tpbmc6IC0+XG4gICAgcmV0dXJuIChAbW9kZSA9PSBIYW5kLlBJQ0tJTkcpXG5cbiAgY3ljbGVNb2RlOiAtPlxuICAgIEBtb2RlID0gc3dpdGNoIEBtb2RlXG4gICAgICB3aGVuIEhhbmQuUElDS0lOR1xuICAgICAgICBIYW5kLkRSQUdHSU5HXG4gICAgICB3aGVuIEhhbmQuRFJBR0dJTkdcbiAgICAgICAgaWYgQGdhbWUub3B0aW9ucy5wdXNoU29ydGluZ1xuICAgICAgICAgIEhhbmQuUFVTSElOR1xuICAgICAgICBlbHNlXG4gICAgICAgICAgSGFuZC5QSUNLSU5HXG4gICAgICB3aGVuIEhhbmQuUFVTSElOR1xuICAgICAgICBIYW5kLlBJQ0tJTkdcbiAgICBpZiBAbW9kZSA9PSBIYW5kLlBJQ0tJTkdcbiAgICAgIEBzZWxlY3ROb25lKClcblxuICBzZWxlY3ROb25lOiAtPlxuICAgIEBwaWNrZWQgPSBuZXcgQXJyYXkoQGNhcmRzLmxlbmd0aCkuZmlsbChmYWxzZSlcbiAgICByZXR1cm5cblxuICBzZXQ6IChjYXJkcykgLT5cbiAgICBAY2FyZHMgPSBjYXJkcy5zbGljZSgwKVxuICAgIGlmIEBtb2RlID09IEhhbmQuUElDS0lOR1xuICAgICAgQHNlbGVjdE5vbmUoKVxuICAgIEBzeW5jQW5pbXMoKVxuICAgIEB3YXJwKClcblxuICBzeW5jQW5pbXM6IC0+XG4gICAgc2VlbiA9IHt9XG4gICAgZm9yIGNhcmQgaW4gQGNhcmRzXG4gICAgICBzZWVuW2NhcmRdKytcbiAgICAgIGlmIG5vdCBAYW5pbXNbY2FyZF1cbiAgICAgICAgQGFuaW1zW2NhcmRdID0gbmV3IEFuaW1hdGlvbiB7XG4gICAgICAgICAgc3BlZWQ6IEBjYXJkU3BlZWRcbiAgICAgICAgICB4OiAwXG4gICAgICAgICAgeTogMFxuICAgICAgICAgIHI6IDBcbiAgICAgICAgfVxuICAgIHRvUmVtb3ZlID0gW11cbiAgICBmb3IgY2FyZCxhbmltIG9mIEBhbmltc1xuICAgICAgaWYgbm90IHNlZW4uaGFzT3duUHJvcGVydHkoY2FyZClcbiAgICAgICAgdG9SZW1vdmUucHVzaCBjYXJkXG4gICAgZm9yIGNhcmQgaW4gdG9SZW1vdmVcbiAgICAgICMgQGdhbWUubG9nIFwicmVtb3ZpbmcgYW5pbSBmb3IgI3tjYXJkfVwiXG4gICAgICBkZWxldGUgQGFuaW1zW2NhcmRdXG5cbiAgICBAdXBkYXRlUG9zaXRpb25zKClcblxuICBjYWxjRHJhd25IYW5kOiAtPlxuICAgIGRyYXduSGFuZCA9IFtdXG4gICAgZm9yIGNhcmQsaSBpbiBAY2FyZHNcbiAgICAgIGlmIGkgIT0gQGRyYWdJbmRleFN0YXJ0XG4gICAgICAgIGRyYXduSGFuZC5wdXNoIGNhcmRcblxuICAgIGlmIEBkcmFnSW5kZXhDdXJyZW50ICE9IE5PX0NBUkRcbiAgICAgIGRyYXduSGFuZC5zcGxpY2UgQGRyYWdJbmRleEN1cnJlbnQsIDAsIEBjYXJkc1tAZHJhZ0luZGV4U3RhcnRdXG4gICAgcmV0dXJuIGRyYXduSGFuZFxuXG4gIHdhbnRzVG9QbGF5RHJhZ2dlZENhcmQ6IC0+XG4gICAgcmV0dXJuIGZhbHNlIGlmIEBkcmFnSW5kZXhTdGFydCA9PSBOT19DQVJEXG4gICAgcmV0dXJuIEBkcmFnWSA8IEBwbGF5Q2VpbGluZ1xuXG4gIHVwZGF0ZVBvc2l0aW9uczogLT5cbiAgICBkcmF3bkhhbmQgPSBAY2FsY0RyYXduSGFuZCgpXG4gICAgd2FudHNUb1BsYXkgPSBAd2FudHNUb1BsYXlEcmFnZ2VkQ2FyZCgpXG4gICAgZGVzaXJlZFJvdGF0aW9uID0gQ0FSRF9IT0xESU5HX1JPVF9PUkRFUlxuICAgIHBvc2l0aW9uQ291bnQgPSBkcmF3bkhhbmQubGVuZ3RoXG4gICAgaWYgd2FudHNUb1BsYXlcbiAgICAgIGRlc2lyZWRSb3RhdGlvbiA9IENBUkRfSE9MRElOR19ST1RfUExBWVxuICAgICAgcG9zaXRpb25Db3VudC0tXG4gICAgcG9zaXRpb25zID0gQGNhbGNQb3NpdGlvbnMocG9zaXRpb25Db3VudClcbiAgICBkcmF3SW5kZXggPSAwXG4gICAgZm9yIGNhcmQsaSBpbiBkcmF3bkhhbmRcbiAgICAgIGFuaW0gPSBAYW5pbXNbY2FyZF1cbiAgICAgIGlmIGkgPT0gQGRyYWdJbmRleEN1cnJlbnRcbiAgICAgICAgYW5pbS5yZXEueCA9IEBkcmFnWFxuICAgICAgICBhbmltLnJlcS55ID0gQGRyYWdZXG4gICAgICAgIGFuaW0ucmVxLnIgPSBkZXNpcmVkUm90YXRpb25cbiAgICAgICAgaWYgbm90IHdhbnRzVG9QbGF5XG4gICAgICAgICAgZHJhd0luZGV4KytcbiAgICAgIGVsc2VcbiAgICAgICAgcG9zID0gcG9zaXRpb25zW2RyYXdJbmRleF1cbiAgICAgICAgYW5pbS5yZXEueCA9IHBvcy54XG4gICAgICAgIGFuaW0ucmVxLnkgPSBwb3MueVxuICAgICAgICBhbmltLnJlcS5yID0gcG9zLnJcbiAgICAgICAgZHJhd0luZGV4KytcblxuICAjIGltbWVkaWF0ZWx5IHdhcnAgYWxsIGNhcmRzIHRvIHdoZXJlIHRoZXkgc2hvdWxkIGJlXG4gIHdhcnA6IC0+XG4gICAgZm9yIGNhcmQsYW5pbSBvZiBAYW5pbXNcbiAgICAgIGFuaW0ud2FycCgpXG5cbiAgIyByZW9yZGVyIHRoZSBoYW5kIGJhc2VkIG9uIHRoZSBkcmFnIGxvY2F0aW9uIG9mIHRoZSBoZWxkIGNhcmRcbiAgcmVvcmRlcjogLT5cbiAgICByZXR1cm4gaWYgQGRyYWdJbmRleFN0YXJ0ID09IE5PX0NBUkRcbiAgICByZXR1cm4gaWYgQGNhcmRzLmxlbmd0aCA8IDIgIyBub3RoaW5nIHRvIHJlb3JkZXJcbiAgICBwb3NpdGlvbnMgPSBAY2FsY1Bvc2l0aW9ucyhAY2FyZHMubGVuZ3RoKVxuICAgIGNsb3Nlc3RJbmRleCA9IDBcbiAgICBjbG9zZXN0RGlzdCA9IEBnYW1lLndpZHRoICogQGdhbWUuaGVpZ2h0ICMgc29tZXRoaW5nIGltcG9zc2libHkgbGFyZ2VcbiAgICBmb3IgcG9zLCBpbmRleCBpbiBwb3NpdGlvbnNcbiAgICAgIGRpc3QgPSBjYWxjRGlzdGFuY2VTcXVhcmVkKHBvcy54LCBwb3MueSwgQGRyYWdYLCBAZHJhZ1kpXG4gICAgICBpZiBjbG9zZXN0RGlzdCA+IGRpc3RcbiAgICAgICAgY2xvc2VzdERpc3QgPSBkaXN0XG4gICAgICAgIGNsb3Nlc3RJbmRleCA9IGluZGV4XG4gICAgQGRyYWdJbmRleEN1cnJlbnQgPSBjbG9zZXN0SW5kZXhcblxuICBzZWxlY3RlZENhcmRzOiAtPlxuICAgIGlmIEBtb2RlICE9IEhhbmQuUElDS0lOR1xuICAgICAgcmV0dXJuIFtdXG5cbiAgICBjYXJkcyA9IFtdXG4gICAgZm9yIGNhcmQsIGkgaW4gQGNhcmRzXG4gICAgICBpZiBAcGlja2VkW2ldXG4gICAgICAgIGFuaW0gPSBAYW5pbXNbY2FyZF1cbiAgICAgICAgY2FyZHMucHVzaCB7XG4gICAgICAgICAgY2FyZDogY2FyZFxuICAgICAgICAgIHg6IGFuaW0uY3VyLnhcbiAgICAgICAgICB5OiBhbmltLmN1ci55XG4gICAgICAgICAgcjogYW5pbS5jdXIuclxuICAgICAgICAgIGluZGV4OiBpXG4gICAgICAgIH1cbiAgICByZXR1cm4gY2FyZHNcblxuICBkb3duOiAoQGRyYWdYLCBAZHJhZ1ksIGluZGV4KSAtPlxuICAgIEB1cChAZHJhZ1gsIEBkcmFnWSkgIyBlbnN1cmUgd2UgbGV0IGdvIG9mIHRoZSBwcmV2aW91cyBjYXJkIGluIGNhc2UgdGhlIGV2ZW50cyBhcmUgZHVtYlxuICAgIGlmIEBtb2RlID09IEhhbmQuUElDS0lOR1xuICAgICAgQHBpY2tlZFtpbmRleF0gPSAhQHBpY2tlZFtpbmRleF1cbiAgICAgIEBwaWNrUGFpbnQgPSBAcGlja2VkW2luZGV4XVxuICAgICAgcmV0dXJuXG4gICAgaWYgQG1vZGUgPT0gSGFuZC5QVVNISU5HXG4gICAgICBpZiBpbmRleCA8IEBjYXJkcy5sZW5ndGhcbiAgICAgICAgdG9FbmQgPSBAY2FyZHNbaW5kZXhdXG4gICAgICAgIEBjYXJkcy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICAgIEBjYXJkcy5wdXNoIHRvRW5kXG4gICAgICAgIEB1cGRhdGVQb3NpdGlvbnMoKVxuICAgICAgcmV0dXJuXG4gICAgQGdhbWUubG9nIFwicGlja2luZyB1cCBjYXJkIGluZGV4ICN7aW5kZXh9XCJcbiAgICBAZHJhZ0luZGV4U3RhcnQgPSBpbmRleFxuICAgIEBkcmFnSW5kZXhDdXJyZW50ID0gaW5kZXhcbiAgICBAdXBkYXRlUG9zaXRpb25zKClcblxuICBtb3ZlOiAoQGRyYWdYLCBAZHJhZ1kpIC0+XG4gICAgcmV0dXJuIGlmIEBkcmFnSW5kZXhTdGFydCA9PSBOT19DQVJEXG4gICAgI0BnYW1lLmxvZyBcImRyYWdnaW5nIGFyb3VuZCBjYXJkIGluZGV4ICN7QGRyYWdJbmRleEN1cnJlbnR9XCJcbiAgICBAcmVvcmRlcigpXG4gICAgQHVwZGF0ZVBvc2l0aW9ucygpXG5cbiAgdXA6IChAZHJhZ1gsIEBkcmFnWSkgLT5cbiAgICByZXR1cm4gaWYgQGRyYWdJbmRleFN0YXJ0ID09IE5PX0NBUkRcbiAgICBAcmVvcmRlcigpXG4gICAgaWYgQHdhbnRzVG9QbGF5RHJhZ2dlZENhcmQoKVxuICAgICAgQGdhbWUubG9nIFwidHJ5aW5nIHRvIHBsYXkgYSAje0BjYXJkc1tAZHJhZ0luZGV4U3RhcnRdfSBmcm9tIGluZGV4ICN7QGRyYWdJbmRleFN0YXJ0fVwiXG4gICAgICBjYXJkSW5kZXggPSBAZHJhZ0luZGV4U3RhcnRcbiAgICAgIGNhcmQgPSBAY2FyZHNbY2FyZEluZGV4XVxuICAgICAgYW5pbSA9IEBhbmltc1tjYXJkXVxuICAgICAgQGRyYWdJbmRleFN0YXJ0ID0gTk9fQ0FSRFxuICAgICAgQGRyYWdJbmRleEN1cnJlbnQgPSBOT19DQVJEXG4gICAgICBAZ2FtZS5wbGF5IFt7XG4gICAgICAgIGNhcmQ6IGNhcmRcbiAgICAgICAgeDogYW5pbS5jdXIueFxuICAgICAgICB5OiBhbmltLmN1ci55XG4gICAgICAgIHI6IGFuaW0uY3VyLnJcbiAgICAgICAgaW5kZXg6IGNhcmRJbmRleFxuICAgICAgfV1cbiAgICBlbHNlXG4gICAgICBAZ2FtZS5sb2cgXCJ0cnlpbmcgdG8gcmVvcmRlciAje0BjYXJkc1tAZHJhZ0luZGV4U3RhcnRdfSBpbnRvIGluZGV4ICN7QGRyYWdJbmRleEN1cnJlbnR9XCJcbiAgICAgIEBjYXJkcyA9IEBjYWxjRHJhd25IYW5kKCkgIyBpcyB0aGlzIHJpZ2h0P1xuXG4gICAgQGRyYWdJbmRleFN0YXJ0ID0gTk9fQ0FSRFxuICAgIEBkcmFnSW5kZXhDdXJyZW50ID0gTk9fQ0FSRFxuICAgIEB1cGRhdGVQb3NpdGlvbnMoKVxuXG4gIHVwZGF0ZTogKGR0KSAtPlxuICAgIHVwZGF0ZWQgPSBmYWxzZVxuICAgIGZvciBjYXJkLGFuaW0gb2YgQGFuaW1zXG4gICAgICBpZiBhbmltLnVwZGF0ZShkdClcbiAgICAgICAgdXBkYXRlZCA9IHRydWVcbiAgICByZXR1cm4gdXBkYXRlZFxuXG4gIHJlbmRlcjogLT5cbiAgICByZXR1cm4gaWYgQGNhcmRzLmxlbmd0aCA9PSAwXG4gICAgZHJhd25IYW5kID0gQGNhbGNEcmF3bkhhbmQoKVxuICAgIGZvciB2LCBpbmRleCBpbiBkcmF3bkhhbmRcbiAgICAgIGNvbnRpbnVlIGlmIHYgPT0gTk9fQ0FSRFxuICAgICAgYW5pbSA9IEBhbmltc1t2XVxuICAgICAgZG8gKGFuaW0sIGluZGV4KSA9PlxuICAgICAgICBpZiBAbW9kZSA9PSBIYW5kLlBJQ0tJTkdcbiAgICAgICAgICBpZiBAcGlja2VkW2luZGV4XVxuICAgICAgICAgICAgaGlnaGxpZ2h0U3RhdGUgPSBIaWdobGlnaHQuU0VMRUNURURcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBoaWdobGlnaHRTdGF0ZSA9IEhpZ2hsaWdodC5VTlNFTEVDVEVEXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBpZiBAd2FudHNUb1BsYXlEcmFnZ2VkQ2FyZCgpXG4gICAgICAgICAgICBpZiAoaW5kZXggPT0gQGRyYWdJbmRleEN1cnJlbnQpXG4gICAgICAgICAgICAgIGhpZ2hsaWdodFN0YXRlID0gSGlnaGxpZ2h0LlNFTEVDVEVEXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIGhpZ2hsaWdodFN0YXRlID0gSGlnaGxpZ2h0LlVOU0VMRUNURURcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBoaWdobGlnaHRTdGF0ZSA9IEhpZ2hsaWdodC5OT05FXG4gICAgICAgIEByZW5kZXJDYXJkIHYsIGFuaW0uY3VyLngsIGFuaW0uY3VyLnksIGFuaW0uY3VyLnIsIDEsIGhpZ2hsaWdodFN0YXRlLCAoY2xpY2tYLCBjbGlja1kpID0+XG4gICAgICAgICAgQGRvd24oY2xpY2tYLCBjbGlja1ksIGluZGV4KVxuXG4gIHJlbmRlckNhcmQ6ICh2LCB4LCB5LCByb3QsIHNjYWxlLCBzZWxlY3RlZCwgY2IpIC0+XG4gICAgcm90ID0gMCBpZiBub3Qgcm90XG4gICAgcmFuayA9IE1hdGguZmxvb3IodiAvIDQpXG4gICAgc3VpdCA9IE1hdGguZmxvb3IodiAlIDQpXG5cbiAgICBjb2wgPSBzd2l0Y2ggc2VsZWN0ZWRcbiAgICAgIHdoZW4gSGlnaGxpZ2h0Lk5PTkVcbiAgICAgICAgWzEsIDEsIDFdXG4gICAgICB3aGVuIEhpZ2hsaWdodC5VTlNFTEVDVEVEXG4gICAgICAgICMgWzAuMywgMC4zLCAwLjNdXG4gICAgICAgIFsxLCAxLCAxXVxuICAgICAgd2hlbiBIaWdobGlnaHQuU0VMRUNURURcbiAgICAgICAgWzAuNSwgMC41LCAwLjldXG4gICAgICB3aGVuIEhpZ2hsaWdodC5QSUxFXG4gICAgICAgIFswLjYsIDAuNiwgMC42XVxuXG4gICAgQGdhbWUuZHJhd0ltYWdlIFwiY2FyZHNcIixcbiAgICBDQVJEX0lNQUdFX09GRl9YICsgKENBUkRfSU1BR0VfQURWX1ggKiByYW5rKSwgQ0FSRF9JTUFHRV9PRkZfWSArIChDQVJEX0lNQUdFX0FEVl9ZICogc3VpdCksIENBUkRfSU1BR0VfVywgQ0FSRF9JTUFHRV9ILFxuICAgIHgsIHksIEBjYXJkV2lkdGggKiBzY2FsZSwgQGNhcmRIZWlnaHQgKiBzY2FsZSxcbiAgICByb3QsIDAuNSwgMC41LCBjb2xbMF0sY29sWzFdLGNvbFsyXSwxLCBjYlxuXG4gIGNhbGNQb3NpdGlvbnM6IChoYW5kU2l6ZSkgLT5cbiAgICBpZiBAcG9zaXRpb25DYWNoZS5oYXNPd25Qcm9wZXJ0eShoYW5kU2l6ZSlcbiAgICAgIHJldHVybiBAcG9zaXRpb25DYWNoZVtoYW5kU2l6ZV1cbiAgICByZXR1cm4gW10gaWYgaGFuZFNpemUgPT0gMFxuXG4gICAgYWR2YW5jZSA9IEBoYW5kQW5nbGUgLyBoYW5kU2l6ZVxuICAgIGlmIGFkdmFuY2UgPiBAaGFuZEFuZ2xlQWR2YW5jZU1heFxuICAgICAgYWR2YW5jZSA9IEBoYW5kQW5nbGVBZHZhbmNlTWF4XG4gICAgYW5nbGVTcHJlYWQgPSBhZHZhbmNlICogaGFuZFNpemUgICAgICAgICAgICAgICAgIyBob3cgbXVjaCBvZiB0aGUgYW5nbGUgd2UgcGxhbiBvbiB1c2luZ1xuICAgIGFuZ2xlTGVmdG92ZXIgPSBAaGFuZEFuZ2xlIC0gYW5nbGVTcHJlYWQgICAgICAgICMgYW1vdW50IG9mIGFuZ2xlIHdlJ3JlIG5vdCB1c2luZywgYW5kIG5lZWQgdG8gcGFkIHNpZGVzIHdpdGggZXZlbmx5XG4gICAgY3VycmVudEFuZ2xlID0gLTEgKiAoQGhhbmRBbmdsZSAvIDIpICAgICAgICAgICAgIyBtb3ZlIHRvIHRoZSBsZWZ0IHNpZGUgb2Ygb3VyIGFuZ2xlXG4gICAgY3VycmVudEFuZ2xlICs9IGFuZ2xlTGVmdG92ZXIgLyAyICAgICAgICAgICAgICAgIyAuLi4gYW5kIGFkdmFuY2UgcGFzdCBoYWxmIG9mIHRoZSBwYWRkaW5nXG4gICAgY3VycmVudEFuZ2xlICs9IGFkdmFuY2UgLyAyICAgICAgICAgICAgICAgICAgICAgIyAuLi4gYW5kIGNlbnRlciB0aGUgY2FyZHMgaW4gdGhlIGFuZ2xlXG5cbiAgICBwb3NpdGlvbnMgPSBbXVxuICAgIGZvciBpIGluIFswLi4uaGFuZFNpemVdXG4gICAgICB4ID0gQGhhbmRDZW50ZXIueCAtIE1hdGguY29zKChNYXRoLlBJIC8gMikgKyBjdXJyZW50QW5nbGUpICogQGhhbmREaXN0YW5jZVxuICAgICAgeSA9IEBoYW5kQ2VudGVyLnkgLSBNYXRoLnNpbigoTWF0aC5QSSAvIDIpICsgY3VycmVudEFuZ2xlKSAqIEBoYW5kRGlzdGFuY2VcbiAgICAgIGN1cnJlbnRBbmdsZSArPSBhZHZhbmNlXG4gICAgICBwb3NpdGlvbnMucHVzaCB7XG4gICAgICAgIHg6IHhcbiAgICAgICAgeTogeVxuICAgICAgICByOiBjdXJyZW50QW5nbGUgLSBhZHZhbmNlXG4gICAgICB9XG5cbiAgICBAcG9zaXRpb25DYWNoZVtoYW5kU2l6ZV0gPSBwb3NpdGlvbnNcbiAgICByZXR1cm4gcG9zaXRpb25zXG5cbm1vZHVsZS5leHBvcnRzID0gSGFuZFxuIiwiQnV0dG9uID0gcmVxdWlyZSAnLi9CdXR0b24nXG5cbmNsYXNzIE1lbnVcbiAgY29uc3RydWN0b3I6IChAZ2FtZSwgQHRpdGxlLCBAYmFja2dyb3VuZCwgQGNvbG9yLCBAYWN0aW9ucykgLT5cbiAgICBAYnV0dG9ucyA9IFtdXG4gICAgQGJ1dHRvbk5hbWVzID0gW1wiYnV0dG9uMFwiLCBcImJ1dHRvbjFcIl1cblxuICAgIGJ1dHRvblNpemUgPSBAZ2FtZS5oZWlnaHQgLyAxNVxuICAgIEBidXR0b25TdGFydFkgPSBAZ2FtZS5oZWlnaHQgLyA1XG5cbiAgICBzbGljZSA9IChAZ2FtZS5oZWlnaHQgLSBAYnV0dG9uU3RhcnRZKSAvIChAYWN0aW9ucy5sZW5ndGggKyAxKVxuICAgIGN1cnJZID0gQGJ1dHRvblN0YXJ0WSArIHNsaWNlXG4gICAgZm9yIGFjdGlvbiBpbiBAYWN0aW9uc1xuICAgICAgYnV0dG9uID0gbmV3IEJ1dHRvbihAZ2FtZSwgQGJ1dHRvbk5hbWVzLCBAZ2FtZS5mb250LCBidXR0b25TaXplLCBAZ2FtZS5jZW50ZXIueCwgY3VyclksIGFjdGlvbilcbiAgICAgIEBidXR0b25zLnB1c2ggYnV0dG9uXG4gICAgICBjdXJyWSArPSBzbGljZVxuXG4gIHVwZGF0ZTogKGR0KSAtPlxuICAgIHVwZGF0ZWQgPSBmYWxzZVxuICAgIGZvciBidXR0b24gaW4gQGJ1dHRvbnNcbiAgICAgIGlmIGJ1dHRvbi51cGRhdGUoZHQpXG4gICAgICAgIHVwZGF0ZWQgPSB0cnVlXG4gICAgcmV0dXJuIHVwZGF0ZWRcblxuICByZW5kZXI6IC0+XG4gICAgQGdhbWUuc3ByaXRlUmVuZGVyZXIucmVuZGVyIEBiYWNrZ3JvdW5kLCAwLCAwLCBAZ2FtZS53aWR0aCwgQGdhbWUuaGVpZ2h0LCAwLCAwLCAwLCBAY29sb3JcbiAgICBAZ2FtZS5mb250UmVuZGVyZXIucmVuZGVyIEBnYW1lLmZvbnQsIEBnYW1lLmhlaWdodCAvIDI1LCBcIkJ1aWxkOiAje0BnYW1lLnZlcnNpb259XCIsIDAsIEBnYW1lLmhlaWdodCwgMCwgMSwgQGdhbWUuY29sb3JzLmxpZ2h0Z3JheVxuICAgIHRpdGxlSGVpZ2h0ID0gQGdhbWUuaGVpZ2h0IC8gOFxuICAgIHRpdGxlT2Zmc2V0ID0gQGJ1dHRvblN0YXJ0WSA+PiAxXG4gICAgQGdhbWUuZm9udFJlbmRlcmVyLnJlbmRlciBAZ2FtZS5mb250LCB0aXRsZUhlaWdodCwgQHRpdGxlLCBAZ2FtZS5jZW50ZXIueCwgdGl0bGVPZmZzZXQsIDAuNSwgMC41LCBAZ2FtZS5jb2xvcnMud2hpdGVcbiAgICBmb3IgYnV0dG9uIGluIEBidXR0b25zXG4gICAgICBidXR0b24ucmVuZGVyKClcblxubW9kdWxlLmV4cG9ydHMgPSBNZW51XG4iLCJBbmltYXRpb24gPSByZXF1aXJlICcuL0FuaW1hdGlvbidcbkhhbmQgPSByZXF1aXJlICcuL0hhbmQnXG5cblNFVFRMRV9NUyA9IDI1MFxuXG5jbGFzcyBQaWxlXG4gIGNvbnN0cnVjdG9yOiAoQGdhbWUsIEBoYW5kKSAtPlxuICAgIEBwbGF5SUQgPSAtMVxuICAgIEBwbGF5cyA9IFtdXG4gICAgQGFuaW1zID0ge31cbiAgICBAc2V0dGxlVGltZXIgPSAwXG4gICAgQHRocm93bkNvbG9yID0geyByOiAxLCBnOiAxLCBiOiAwLCBhOiAxfVxuICAgIEBzY2FsZSA9IDAuNlxuXG4gICAgIyAxLjAgaXMgbm90IG1lc3N5IGF0IGFsbCwgYXMgeW91IGFwcHJvYWNoIDAgaXQgc3RhcnRzIHRvIGFsbCBwaWxlIG9uIG9uZSBhbm90aGVyXG4gICAgbWVzc3kgPSAwLjJcblxuICAgIEBwbGF5Q2FyZFNwYWNpbmcgPSAwLjFcblxuICAgIGNlbnRlclggPSBAZ2FtZS5jZW50ZXIueFxuICAgIGNlbnRlclkgPSBAZ2FtZS5jZW50ZXIueVxuICAgIG9mZnNldFggPSBAaGFuZC5jYXJkV2lkdGggKiBtZXNzeSAqIEBzY2FsZVxuICAgIG9mZnNldFkgPSBAaGFuZC5jYXJkSGFsZkhlaWdodCAqIG1lc3N5ICogQHNjYWxlXG4gICAgQHBsYXlMb2NhdGlvbnMgPSBbXG4gICAgICB7IHg6IGNlbnRlclgsIHk6IGNlbnRlclkgKyBvZmZzZXRZIH0gIyBib3R0b21cbiAgICAgIHsgeDogY2VudGVyWCAtIG9mZnNldFgsIHk6IGNlbnRlclkgfSAjIGxlZnRcbiAgICAgIHsgeDogY2VudGVyWCwgeTogY2VudGVyWSAtIG9mZnNldFkgfSAjIHRvcFxuICAgICAgeyB4OiBjZW50ZXJYICsgb2Zmc2V0WCwgeTogY2VudGVyWSB9ICMgcmlnaHRcbiAgICBdXG4gICAgQHRocm93TG9jYXRpb25zID0gW1xuICAgICAgeyB4OiBjZW50ZXJYLCB5OiBAZ2FtZS5oZWlnaHQgfSAjIGJvdHRvbVxuICAgICAgeyB4OiAwLCB5OiBjZW50ZXJZICsgb2Zmc2V0WSB9ICMgbGVmdFxuICAgICAgeyB4OiBjZW50ZXJYLCB5OiAwIH0gIyB0b3BcbiAgICAgIHsgeDogQGdhbWUud2lkdGgsIHk6IGNlbnRlclkgKyBvZmZzZXRZIH0gIyByaWdodFxuICAgIF1cblxuICBzZXQ6IChwaWxlSUQsIHBpbGUsIHBpbGVXaG8pIC0+XG4gICAgaWYgQHBsYXlJRCAhPSBwaWxlSURcbiAgICAgIEBwbGF5SUQgPSBwaWxlSURcbiAgICAgIEBwbGF5cy5wdXNoIHtcbiAgICAgICAgY2FyZHM6IHBpbGUuc2xpY2UoMClcbiAgICAgICAgd2hvOiBwaWxlV2hvXG4gICAgICB9XG4gICAgICBAc2V0dGxlVGltZXIgPSBTRVRUTEVfTVNcblxuICAgICMgaWYgKEBwbGF5SUQgIT0gcGlsZUlEKSBhbmQgKHRocm93bi5sZW5ndGggPiAwKVxuICAgICMgICBAcGxheXMgPSB0aHJvd24uc2xpY2UoMCkgIyB0aGUgcGlsZSBoYXMgYmVjb21lIHRoZSB0aHJvd24sIHN0YXNoIGl0IG9mZiBvbmUgbGFzdCB0aW1lXG4gICAgIyAgIEBwbGF5V2hvID0gdGhyb3duV2hvLnNsaWNlKDApXG4gICAgIyAgIEBwbGF5SUQgPSBwaWxlSURcbiAgICAjICAgQHNldHRsZVRpbWVyID0gU0VUVExFX01TXG5cbiAgICAjICMgZG9uJ3Qgc3RvbXAgdGhlIHBpbGUgd2UncmUgZHJhd2luZyB1bnRpbCBpdCBpcyBkb25lIHNldHRsaW5nIGFuZCBjYW4gZmx5IG9mZiB0aGUgc2NyZWVuXG4gICAgIyBpZiBAc2V0dGxlVGltZXIgPT0gMFxuICAgICMgICBAcGxheXMgPSBwaWxlLnNsaWNlKDApXG4gICAgIyAgIEBwbGF5V2hvID0gcGlsZVdoby5zbGljZSgwKVxuICAgICMgICBAdGhyb3duID0gdGhyb3duLnNsaWNlKDApXG4gICAgIyAgIEB0aHJvd25XaG8gPSB0aHJvd25XaG8uc2xpY2UoMClcbiAgICAjICAgQHRocm93blRha2VyID0gdGhyb3duVGFrZXJcblxuICAgIEBzeW5jQW5pbXMoKVxuXG4gIHBva2U6IC0+XG4gICAgQHNldHRsZVRpbWVyID0gU0VUVExFX01TXG5cbiAgaGludDogKGNhcmRzKSAtPlxuICAgIGZvciBjYXJkIGluIGNhcmRzXG4gICAgICBAYW5pbXNbY2FyZC5jYXJkXSA9IG5ldyBBbmltYXRpb24ge1xuICAgICAgICBzcGVlZDogQGhhbmQuY2FyZFNwZWVkXG4gICAgICAgIHg6IGNhcmQueFxuICAgICAgICB5OiBjYXJkLnlcbiAgICAgICAgcjogY2FyZC5yXG4gICAgICAgIHM6IDFcbiAgICAgIH1cblxuICBzeW5jQW5pbXM6IC0+XG4gICAgc2VlbiA9IHt9XG4gICAgbG9jYXRpb25zID0gQHRocm93TG9jYXRpb25zXG4gICAgZm9yIHBsYXkgaW4gQHBsYXlzXG4gICAgICBmb3IgY2FyZCwgaW5kZXggaW4gcGxheS5jYXJkc1xuICAgICAgICBzZWVuW2NhcmRdKytcbiAgICAgICAgaWYgbm90IEBhbmltc1tjYXJkXVxuICAgICAgICAgIHdobyA9IHBsYXkud2hvXG4gICAgICAgICAgbG9jYXRpb24gPSBsb2NhdGlvbnNbd2hvXVxuICAgICAgICAgIEBhbmltc1tjYXJkXSA9IG5ldyBBbmltYXRpb24ge1xuICAgICAgICAgICAgc3BlZWQ6IEBoYW5kLmNhcmRTcGVlZFxuICAgICAgICAgICAgeDogbG9jYXRpb24ueFxuICAgICAgICAgICAgeTogbG9jYXRpb24ueVxuICAgICAgICAgICAgcjogLTEgKiBNYXRoLlBJIC8gNFxuICAgICAgICAgICAgczogQHNjYWxlXG4gICAgICAgICAgfVxuXG4gICAgdG9SZW1vdmUgPSBbXVxuICAgIGZvciBjYXJkLGFuaW0gb2YgQGFuaW1zXG4gICAgICBpZiBub3Qgc2Vlbi5oYXNPd25Qcm9wZXJ0eShjYXJkKVxuICAgICAgICB0b1JlbW92ZS5wdXNoIGNhcmRcbiAgICBmb3IgY2FyZCBpbiB0b1JlbW92ZVxuICAgICAgIyBAZ2FtZS5sb2cgXCJyZW1vdmluZyBhbmltIGZvciAje2NhcmR9XCJcbiAgICAgIGRlbGV0ZSBAYW5pbXNbY2FyZF1cblxuICAgIEB1cGRhdGVQb3NpdGlvbnMoKVxuXG4gIHVwZGF0ZVBvc2l0aW9uczogLT5cbiAgICBsb2NhdGlvbnMgPSBAcGxheUxvY2F0aW9uc1xuICAgIGZvciBwbGF5LCBwbGF5SW5kZXggaW4gQHBsYXlzXG4gICAgICBmb3IgdiwgaW5kZXggaW4gcGxheS5jYXJkc1xuICAgICAgICBhbmltID0gQGFuaW1zW3ZdXG4gICAgICAgIGxvYyA9IHBsYXkud2hvXG4gICAgICAgIGFuaW0ucmVxLnggPSBsb2NhdGlvbnNbbG9jXS54ICsgKGluZGV4ICogQGhhbmQuY2FyZFdpZHRoICogQHBsYXlDYXJkU3BhY2luZylcbiAgICAgICAgYW5pbS5yZXEueSA9IGxvY2F0aW9uc1tsb2NdLnlcbiAgICAgICAgYW5pbS5yZXEuciA9IDAuMiAqIE1hdGguY29zKHBsYXlJbmRleCAvIDAuMSlcbiAgICAgICAgYW5pbS5yZXEucyA9IEBzY2FsZVxuXG4gIHJlYWR5Rm9yTmV4dFRyaWNrOiAtPlxuICAgIHJldHVybiBAcmVzdGluZygpXG4gICAgIyByZXR1cm4gKEBzZXR0bGVUaW1lciA9PSAwKVxuXG4gIHVwZGF0ZTogKGR0KSAtPlxuICAgIHVwZGF0ZWQgPSBmYWxzZVxuXG4gICAgaWYgQHNldHRsZVRpbWVyID4gMFxuICAgICAgdXBkYXRlZCA9IHRydWVcbiAgICAgIEBzZXR0bGVUaW1lciAtPSBkdFxuICAgICAgaWYgQHNldHRsZVRpbWVyIDwgMFxuICAgICAgICBAc2V0dGxlVGltZXIgPSAwXG5cbiAgICBmb3IgY2FyZCxhbmltIG9mIEBhbmltc1xuICAgICAgaWYgYW5pbS51cGRhdGUoZHQpXG4gICAgICAgIHVwZGF0ZWQgPSB0cnVlXG5cbiAgICByZXR1cm4gdXBkYXRlZFxuXG4gICMgdXNlZCBieSB0aGUgZ2FtZSBvdmVyIHNjcmVlbi4gSXQgcmV0dXJucyB0cnVlIHdoZW4gbmVpdGhlciB0aGUgcGlsZSBub3IgdGhlIGxhc3QgdGhyb3duIGFyZSBtb3ZpbmdcbiAgcmVzdGluZzogLT5cbiAgICBmb3IgY2FyZCxhbmltIG9mIEBhbmltc1xuICAgICAgaWYgYW5pbS5hbmltYXRpbmcoKVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICBpZiBAc2V0dGxlVGltZXIgPiAwXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICByZXR1cm4gdHJ1ZVxuXG4gIHJlbmRlcjogLT5cbiAgICBmb3IgcGxheSwgcGxheUluZGV4IGluIEBwbGF5c1xuICAgICAgaGlnaGxpZ2h0ID0gSGFuZC5IaWdobGlnaHQuUElMRVxuICAgICAgaWYgcGxheUluZGV4ID09IChAcGxheXMubGVuZ3RoIC0gMSlcbiAgICAgICAgaGlnaGxpZ2h0ID0gSGFuZC5IaWdobGlnaHQuTk9ORVxuICAgICAgZm9yIHYsIGluZGV4IGluIHBsYXkuY2FyZHNcbiAgICAgICAgYW5pbSA9IEBhbmltc1t2XVxuICAgICAgICBAaGFuZC5yZW5kZXJDYXJkIHYsIGFuaW0uY3VyLngsIGFuaW0uY3VyLnksIGFuaW0uY3VyLnIsIGFuaW0uY3VyLnMsIGhpZ2hsaWdodFxuXG5tb2R1bGUuZXhwb3J0cyA9IFBpbGVcbiIsImNsYXNzIFNwcml0ZVJlbmRlcmVyXG4gIGNvbnN0cnVjdG9yOiAoQGdhbWUpIC0+XG4gICAgQHNwcml0ZXMgPVxuICAgICAgIyBnZW5lcmljIHNwcml0ZXNcbiAgICAgIHNvbGlkOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6ICA1NSwgeTogNzIzLCB3OiAgMTAsIGg6ICAxMCB9XG4gICAgICBwYXVzZTogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA2MDIsIHk6IDcwNywgdzogMTIyLCBoOiAxMjUgfVxuICAgICAgYnV0dG9uMDogICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogMTQwLCB5OiA3NzcsIHc6IDQyMiwgaDogIDY1IH1cbiAgICAgIGJ1dHRvbjE6ICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDE0MCwgeTogNjk4LCB3OiA0MjIsIGg6ICA2NSB9XG4gICAgICBwbHVzMDogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA3NDUsIHk6IDY2NCwgdzogMTE2LCBoOiAxMTggfVxuICAgICAgcGx1czE6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogNzQ1LCB5OiA4MjAsIHc6IDExNiwgaDogMTE4IH1cbiAgICAgIG1pbnVzMDogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDg5NSwgeTogNjY0LCB3OiAxMTYsIGg6IDExOCB9XG4gICAgICBtaW51czE6ICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA4OTUsIHk6IDgyMCwgdzogMTE2LCBoOiAxMTggfVxuICAgICAgYXJyb3dMOiAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogIDMzLCB5OiA4NTgsIHc6IDIwNCwgaDogMTU2IH1cbiAgICAgIGFycm93UjogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDIzOSwgeTogODUyLCB3OiAyMDgsIGg6IDE1NSB9XG5cbiAgICAgIHBpbGU6ICAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6ICAxMywgeTogODgzLCB3OiAxMjgsIGg6IDEyOCB9XG4gICAgICBwaWxlMDogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAxNDUsIHk6IDg4MywgdzogMTI4LCBoOiAxMjggfVxuICAgICAgcGlsZTE6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogMjc3LCB5OiA4ODMsIHc6IDEyOCwgaDogMTI4IH1cbiAgICAgIHBpbGUyOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDQwOSwgeTogODgzLCB3OiAxMjgsIGg6IDEyOCB9XG4gICAgICBwaWxlMzogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA1NDEsIHk6IDg4MywgdzogMTI4LCBoOiAxMjggfVxuXG4gICAgICAjIG1lbnUgYmFja2dyb3VuZHNcbiAgICAgIG1haW5tZW51OiAgeyB0ZXh0dXJlOiBcIm1haW5tZW51XCIsICB4OiAwLCB5OiAwLCB3OiAxMjgwLCBoOiA3MjAgfVxuICAgICAgcGF1c2VtZW51OiB7IHRleHR1cmU6IFwicGF1c2VtZW51XCIsIHg6IDAsIHk6IDAsIHc6IDEyODAsIGg6IDcyMCB9XG5cbiAgICAgICMgaG93dG9cbiAgICAgIGhvd3RvMTogICAgeyB0ZXh0dXJlOiBcImhvd3RvMVwiLCAgeDogMCwgeTogIDAsIHc6IDE5MjAsIGg6IDEwODAgfVxuXG4gICAgICBhdTogICAgICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA1NDAsIHk6IDEwNzksIHc6IDQwMCwgaDogIDgwIH1cbiAgICAgIHN0YXJfb246ICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6ICAzOCwgeTogMTA2NiwgdzogMTkwLCBoOiAxOTAgfVxuICAgICAgc3Rhcl9vZmY6ICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogMjUwLCB5OiAxMDY2LCB3OiAxOTAsIGg6IDE5MCB9XG5cbiAgICAgICMgY2hhcmFjdGVyc1xuICAgICAgbWFyaW86ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogIDIwLCB5OiAgIDAsIHc6IDE1MSwgaDogMzA4IH1cbiAgICAgIGx1aWdpOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDE3MSwgeTogICAwLCB3OiAxNTEsIGg6IDMwOCB9XG4gICAgICBwZWFjaDogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAzMzUsIHk6ICAgMCwgdzogMTY0LCBoOiAzMDggfVxuICAgICAgZGFpc3k6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogNTA0LCB5OiAgIDAsIHc6IDE2NCwgaDogMzA4IH1cbiAgICAgIHlvc2hpOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDY2OCwgeTogICAwLCB3OiAxODAsIGg6IDMwOCB9XG4gICAgICB0b2FkOiAgICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA4NDksIHk6ICAgMCwgdzogMTU3LCBoOiAzMDggfVxuICAgICAgYm93c2VyOiAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogIDExLCB5OiAzMjIsIHc6IDE1MSwgaDogMzA4IH1cbiAgICAgIGJvd3NlcmpyOiAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDIyNSwgeTogMzIyLCB3OiAxNDQsIGg6IDMwOCB9XG4gICAgICBrb29wYTogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAzNzIsIHk6IDMyMiwgdzogMTI4LCBoOiAzMDggfVxuICAgICAgcm9zYWxpbmE6ICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogNTAwLCB5OiAzMjIsIHc6IDE3MywgaDogMzA4IH1cbiAgICAgIHNoeWd1eTogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDY5MSwgeTogMzIyLCB3OiAxNTQsIGg6IDMwOCB9XG4gICAgICB0b2FkZXR0ZTogIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA4NDcsIHk6IDMyMiwgdzogMTU4LCBoOiAzMDggfVxuXG4gIGNhbGNXaWR0aDogKHNwcml0ZU5hbWUsIGhlaWdodCkgLT5cbiAgICBzcHJpdGUgPSBAc3ByaXRlc1tzcHJpdGVOYW1lXVxuICAgIHJldHVybiAxIGlmIG5vdCBzcHJpdGVcbiAgICByZXR1cm4gaGVpZ2h0ICogc3ByaXRlLncgLyBzcHJpdGUuaFxuXG4gIHJlbmRlcjogKHNwcml0ZU5hbWUsIGR4LCBkeSwgZHcsIGRoLCByb3QsIGFuY2hvcngsIGFuY2hvcnksIGNvbG9yLCBjYikgLT5cbiAgICBzcHJpdGUgPSBAc3ByaXRlc1tzcHJpdGVOYW1lXVxuICAgIHJldHVybiBpZiBub3Qgc3ByaXRlXG4gICAgaWYgKGR3ID09IDApIGFuZCAoZGggPT0gMClcbiAgICAgICMgdGhpcyBwcm9iYWJseSBzaG91bGRuJ3QgZXZlciBiZSB1c2VkLlxuICAgICAgZHcgPSBzcHJpdGUueFxuICAgICAgZGggPSBzcHJpdGUueVxuICAgIGVsc2UgaWYgZHcgPT0gMFxuICAgICAgZHcgPSBkaCAqIHNwcml0ZS53IC8gc3ByaXRlLmhcbiAgICBlbHNlIGlmIGRoID09IDBcbiAgICAgIGRoID0gZHcgKiBzcHJpdGUuaCAvIHNwcml0ZS53XG4gICAgQGdhbWUuZHJhd0ltYWdlIHNwcml0ZS50ZXh0dXJlLCBzcHJpdGUueCwgc3ByaXRlLnksIHNwcml0ZS53LCBzcHJpdGUuaCwgZHgsIGR5LCBkdywgZGgsIHJvdCwgYW5jaG9yeCwgYW5jaG9yeSwgY29sb3IuciwgY29sb3IuZywgY29sb3IuYiwgY29sb3IuYSwgY2JcbiAgICByZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBTcHJpdGVSZW5kZXJlclxuIiwiTUlOX1BMQVlFUlMgPSAzXG5NQVhfTE9HX0xJTkVTID0gNlxuT0sgPSAnT0snXG5cblNUQVJUSU5HX01PTkVZID0gMjVcblxuU3VpdCA9XG4gIE5PTkU6IC0xXG4gIFNQQURFUzogMFxuICBDTFVCUzogMVxuICBESUFNT05EUzogMlxuICBIRUFSVFM6IDNcblxuU3VpdE5hbWUgPSBbJ1NwYWRlcycsICdDbHVicycsICdEaWFtb25kcycsICdIZWFydHMnXVxuU2hvcnRTdWl0TmFtZSA9IFsnUycsICdDJywgJ0QnLCAnSCddXG5HbHlwaFN1aXROYW1lID0gW1wiXFx4YzhcIiwgXCJcXHhjOVwiLCBcIlxceGNhXCIsIFwiXFx4Y2JcIl1cblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQUkgTmFtZSBHZW5lcmF0b3JcblxuYWlDaGFyYWN0ZXJMaXN0ID0gW1xuICB7IGlkOiBcIm1hcmlvXCIsICAgIG5hbWU6IFwiTWFyaW9cIiwgICAgICBzcHJpdGU6IFwibWFyaW9cIiwgICAgYnJhaW46IFwibm9ybWFsXCIgfVxuICB7IGlkOiBcImx1aWdpXCIsICAgIG5hbWU6IFwiTHVpZ2lcIiwgICAgICBzcHJpdGU6IFwibHVpZ2lcIiwgICAgYnJhaW46IFwibm9ybWFsXCIgfVxuICB7IGlkOiBcInBlYWNoXCIsICAgIG5hbWU6IFwiUGVhY2hcIiwgICAgICBzcHJpdGU6IFwicGVhY2hcIiwgICAgYnJhaW46IFwibm9ybWFsXCIgfVxuICB7IGlkOiBcImRhaXN5XCIsICAgIG5hbWU6IFwiRGFpc3lcIiwgICAgICBzcHJpdGU6IFwiZGFpc3lcIiwgICAgYnJhaW46IFwibm9ybWFsXCIgfVxuICB7IGlkOiBcInlvc2hpXCIsICAgIG5hbWU6IFwiWW9zaGlcIiwgICAgICBzcHJpdGU6IFwieW9zaGlcIiwgICAgYnJhaW46IFwibm9ybWFsXCIgfVxuICB7IGlkOiBcInRvYWRcIiwgICAgIG5hbWU6IFwiVG9hZFwiLCAgICAgICBzcHJpdGU6IFwidG9hZFwiLCAgICAgYnJhaW46IFwibm9ybWFsXCIgfVxuICB7IGlkOiBcImJvd3NlclwiLCAgIG5hbWU6IFwiQm93c2VyXCIsICAgICBzcHJpdGU6IFwiYm93c2VyXCIsICAgYnJhaW46IFwibm9ybWFsXCIgfVxuICB7IGlkOiBcImJvd3NlcmpyXCIsIG5hbWU6IFwiQm93c2VyIEpyXCIsICBzcHJpdGU6IFwiYm93c2VyanJcIiwgYnJhaW46IFwibm9ybWFsXCIgfVxuICB7IGlkOiBcImtvb3BhXCIsICAgIG5hbWU6IFwiS29vcGFcIiwgICAgICBzcHJpdGU6IFwia29vcGFcIiwgICAgYnJhaW46IFwibm9ybWFsXCIgfVxuICB7IGlkOiBcInJvc2FsaW5hXCIsIG5hbWU6IFwiUm9zYWxpbmFcIiwgICBzcHJpdGU6IFwicm9zYWxpbmFcIiwgYnJhaW46IFwibm9ybWFsXCIgfVxuICB7IGlkOiBcInNoeWd1eVwiLCAgIG5hbWU6IFwiU2h5Z3V5XCIsICAgICBzcHJpdGU6IFwic2h5Z3V5XCIsICAgYnJhaW46IFwibm9ybWFsXCIgfVxuICB7IGlkOiBcInRvYWRldHRlXCIsIG5hbWU6IFwiVG9hZGV0dGVcIiwgICBzcHJpdGU6IFwidG9hZGV0dGVcIiwgYnJhaW46IFwibm9ybWFsXCIgfVxuXVxuXG5haUNoYXJhY3RlcnMgPSB7fVxuZm9yIGNoYXJhY3RlciBpbiBhaUNoYXJhY3Rlckxpc3RcbiAgYWlDaGFyYWN0ZXJzW2NoYXJhY3Rlci5pZF0gPSBjaGFyYWN0ZXJcblxucmFuZG9tQ2hhcmFjdGVyID0gLT5cbiAgciA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGFpQ2hhcmFjdGVyTGlzdC5sZW5ndGgpXG4gIHJldHVybiBhaUNoYXJhY3Rlckxpc3Rbcl1cblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQ2FyZFxuXG5jbGFzcyBDYXJkXG4gIGNvbnN0cnVjdG9yOiAoQHJhdykgLT5cbiAgICBAc3VpdCAgPSBNYXRoLmZsb29yKEByYXcgJSA0KVxuICAgIEB2YWx1ZSA9IE1hdGguZmxvb3IoQHJhdyAvIDQpXG4gICAgQHZhbHVlTmFtZSA9IHN3aXRjaCBAdmFsdWVcbiAgICAgIHdoZW4gIDggdGhlbiAnSidcbiAgICAgIHdoZW4gIDkgdGhlbiAnUSdcbiAgICAgIHdoZW4gMTAgdGhlbiAnSydcbiAgICAgIHdoZW4gMTEgdGhlbiAnQSdcbiAgICAgIHdoZW4gMTIgdGhlbiAnMidcbiAgICAgIGVsc2VcbiAgICAgICAgU3RyaW5nKEB2YWx1ZSArIDMpXG4gICAgQG5hbWUgPSBAdmFsdWVOYW1lICsgU2hvcnRTdWl0TmFtZVtAc3VpdF1cbiAgICAjIGNvbnNvbGUubG9nIFwiI3tAcmF3fSAtPiAje0BuYW1lfVwiXG4gIGdseXBoZWROYW1lOiAtPlxuICAgIHJldHVybiBAdmFsdWVOYW1lICsgR2x5cGhTdWl0TmFtZVtAc3VpdF1cblxuY2FyZHNUb1N0cmluZyA9IChyYXdDYXJkcykgLT5cbiAgY2FyZE5hbWVzID0gW11cbiAgZm9yIHJhdyBpbiByYXdDYXJkc1xuICAgIGNhcmQgPSBuZXcgQ2FyZChyYXcpXG4gICAgY2FyZE5hbWVzLnB1c2ggY2FyZC5uYW1lXG4gIHJldHVybiBcIlsgXCIgKyBjYXJkTmFtZXMuam9pbignLCcpICsgXCIgXVwiXG5cbnBsYXlUeXBlVG9TdHJpbmcgPSAodHlwZSkgLT5cbiAgaWYgbWF0Y2hlcyA9IHR5cGUubWF0Y2goL15yb3AoXFxkKykvKVxuICAgIHJldHVybiBcIlJ1biBvZiAje21hdGNoZXNbMV19IFBhaXJzXCJcbiAgaWYgbWF0Y2hlcyA9IHR5cGUubWF0Y2goL15ydW4oXFxkKykvKVxuICAgIHJldHVybiBcIlJ1biBvZiAje21hdGNoZXNbMV19XCJcbiAgaWYgbWF0Y2hlcyA9IHR5cGUubWF0Y2goL15raW5kKFxcZCspLylcbiAgICBpZiBtYXRjaGVzWzFdID09ICcxJ1xuICAgICAgcmV0dXJuICdTaW5nbGUnXG4gICAgaWYgbWF0Y2hlc1sxXSA9PSAnMidcbiAgICAgIHJldHVybiAnUGFpcidcbiAgICBpZiBtYXRjaGVzWzFdID09ICczJ1xuICAgICAgcmV0dXJuICdUcmlwcydcbiAgICByZXR1cm4gJ1F1YWRzJ1xuICByZXR1cm4gdHlwZVxuXG5wbGF5VG9TdHJpbmcgPSAocGxheSkgLT5cbiAgaGlnaENhcmQgPSBuZXcgQ2FyZChwbGF5LmhpZ2gpXG4gIHJldHVybiBcIiN7cGxheVR5cGVUb1N0cmluZyhwbGF5LnR5cGUpfSAtICN7aGlnaENhcmQuZ2x5cGhlZE5hbWUoKX1cIlxuXG5wbGF5VG9DYXJkQ291bnQgPSAocGxheSkgLT5cbiAgaWYgbWF0Y2hlcyA9IHBsYXkudHlwZS5tYXRjaCgvXnJvcChcXGQrKS8pXG4gICAgcmV0dXJuIHBhcnNlSW50KG1hdGNoZXNbMV0pICogMlxuICBpZiBtYXRjaGVzID0gcGxheS50eXBlLm1hdGNoKC9ecnVuKFxcZCspLylcbiAgICByZXR1cm4gcGFyc2VJbnQobWF0Y2hlc1sxXSlcbiAgaWYgbWF0Y2hlcyA9IHBsYXkudHlwZS5tYXRjaCgvXmtpbmQoXFxkKykvKVxuICAgIHJldHVybiBwYXJzZUludChtYXRjaGVzWzFdKVxuICByZXR1cm4gMSAjID8/XG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIERlY2tcblxuY2xhc3MgU2h1ZmZsZWREZWNrXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgICMgZGF0IGluc2lkZS1vdXQgc2h1ZmZsZSFcbiAgICBAY2FyZHMgPSBbIDAgXVxuICAgIGZvciBpIGluIFsxLi4uNTJdXG4gICAgICBqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogaSlcbiAgICAgIEBjYXJkcy5wdXNoKEBjYXJkc1tqXSlcbiAgICAgIEBjYXJkc1tqXSA9IGlcblxuICAgICMgQGNhcmRzID0gW1xuICAgICMgICAwLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5LCAxMCwgMTEsIDEyLFxuICAgICMgICAxMywgMTQsIDE1LCAxNiwgMTcsIDE4LCAxOSwgMjAsIDIxLCAyMiwgMjMsIDI0LCAyNSxcbiAgICAjICAgMjYsIDI3LCAyOCwgMjksIDMwLCAzMSwgMzIsIDMzLCAzNCwgMzUsIDM2LCAzNywgMzgsXG4gICAgIyAgIDM5LCA0MCwgNDEsIDQyLCA0MywgNDQsIDQ1LCA0NiwgNDcsIDQ4LCA0OSwgNTAsIDUxXG4gICAgIyBdXG5cbiAgICAjIEBjYXJkcyA9IFtcbiAgICAjICAgMCwgMywgNywgMTEsIDE1LCAxOSwgMjMsXG4gICAgIyAgIDEsIDIsIDQsIDUsIDYsIDgsIDksIDEwLCAxMixcbiAgICAjICAgMTMsIDE0LCAxNiwgMTcsIDE4LCAyMCwgMjEsIDIyLCAyNCwgMjUsXG4gICAgIyAgIDI2LCAyNywgMjgsIDI5LCAzMCwgMzEsIDMyLCAzMywgMzQsIDM1LCAzNiwgMzcsIDM4LFxuICAgICMgICAzOSwgNDAsIDQxLCA0MiwgNDMsIDQ0LCA0NSwgNDYsIDQ3LCA0OCwgNDksIDUwLCA1MVxuICAgICMgXVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBBY2hpZXZlbWVudHNcblxuYWNoaWV2ZW1lbnRzTGlzdCA9IFtcbiAge1xuICAgIGlkOiBcInZldGVyYW5cIlxuICAgIHRpdGxlOiBcIkkndmUgU2VlbiBTb21lIFRoaW5nc1wiXG4gICAgZGVzY3JpcHRpb246IFtcIlBsYXkgNTAgSGFuZHMuXCJdXG4gICAgcHJvZ3Jlc3M6IChhY2gpIC0+XG4gICAgICBpZiBhY2guc3RhdGUudG90YWxHYW1lcyA+PSA1MFxuICAgICAgICByZXR1cm4gXCJUb3RhbCBQbGF5ZWQ6IGBhYWZmYWFgI3thY2guc3RhdGUudG90YWxHYW1lc31gYCBHYW1lc1wiXG4gICAgICByZXR1cm4gXCJQcm9ncmVzczogI3thY2guc3RhdGUudG90YWxHYW1lc30gLyA1MFwiXG4gIH1cbiAge1xuICAgIGlkOiBcInRyeWhhcmRcIlxuICAgIHRpdGxlOiBcIlRyeWhhcmRcIlxuICAgIGRlc2NyaXB0aW9uOiBbXCJFYXJuIGEgNSBnYW1lIHdpbiBzdHJlYWsuXCJdXG4gICAgcHJvZ3Jlc3M6IChhY2gpIC0+XG4gICAgICBiZXN0U3RyZWFrID0gYWNoLnN0YXRlLmJlc3RTdHJlYWtcbiAgICAgIGJlc3RTdHJlYWsgPz0gMFxuICAgICAgaWYgYmVzdFN0cmVhayA+PSA1XG4gICAgICAgIHJldHVybiBcIkJlc3QgU3RyZWFrOiBgYWFmZmFhYCN7YmVzdFN0cmVha31gYCBXaW5zXCJcbiAgICAgIHMgPSBcIlwiXG4gICAgICBpZiBiZXN0U3RyZWFrID4gMVxuICAgICAgICBzID0gXCJzXCJcbiAgICAgIHJldHVybiBcIkJlc3QgU3RyZWFrOiAje2Jlc3RTdHJlYWt9IFdpbiN7c31cIlxuICB9XG4gIHtcbiAgICBpZDogXCJicmVha2VyXCJcbiAgICB0aXRsZTogXCJTcHJpbmcgQnJlYWtcIlxuICAgIGRlc2NyaXB0aW9uOiBbXCJCcmVhayBhIDIuXCJdXG4gIH1cbiAge1xuICAgIGlkOiBcImtlZXBpdGxvd1wiXG4gICAgdGl0bGU6IFwiS2VlcCBJdCBMb3csIEJveXNcIlxuICAgIGRlc2NyaXB0aW9uOiBbXCJQbGF5IGEgU2luZ2xlIDIgb24gdG9wIG9mIGEgU2luZ2xlIDMuXCJdXG4gIH1cbiAge1xuICAgIGlkOiBcInN1aXRlZFwiXG4gICAgdGl0bGU6IFwiRG9lc24ndCBFdmVuIE1hdHRlclwiXG4gICAgZGVzY3JpcHRpb246IFtcIlRocm93IGEgc3VpdGVkIHJ1bi5cIl1cbiAgfVxuICB7XG4gICAgaWQ6IFwidG9ueVwiXG4gICAgdGl0bGU6IFwiVGhlIFRvbnlcIlxuICAgIGRlc2NyaXB0aW9uOiBbXCJUaHJvdyBhIHJ1biBvZiA3IG9yIG1vcmUgY2FyZHMsIGFuZCB0aGVuIGxvc2UuXCJdXG4gIH1cbiAge1xuICAgIGlkOiBcInNhbXBsZXJcIlxuICAgIHRpdGxlOiBcIlNhbXBsZXIgUGxhdHRlclwiXG4gICAgZGVzY3JpcHRpb246IFtcIkluIGEgc2luZ2xlIGhhbmQ6IHBsYXkgYXQgbGVhc3Qgb25lIFNpbmdsZSxcIiwgXCJvbmUgUGFpciwgb25lIFRyaXBzLCBhbmQgb25lIFJ1bi5cIl1cbiAgfVxuICB7XG4gICAgaWQ6IFwidHJhZ2VkeVwiXG4gICAgdGl0bGU6IFwiVHJhZ2VkeVwiXG4gICAgZGVzY3JpcHRpb246IFtcIkJlZ2luIHRoZSBnYW1lIGJ5IHRocm93aW5nIGEgdHdvIGJyZWFrZXIgaW52b2x2aW5nXCIsIFwidGhlIDMgb2YgU3BhZGVzLlwiXVxuICB9XG4gIHtcbiAgICBpZDogXCJpbmRvbWl0YWJsZVwiXG4gICAgdGl0bGU6IFwiSW5kb21pdGFibGVcIlxuICAgIGRlc2NyaXB0aW9uOiBbXCJUaHJvdyBhIHJ1biBlbmRpbmcgaW4gdGhlIEFjZSBvZiBIZWFydHMuXCJdXG4gIH1cbiAge1xuICAgIGlkOiBcInJla3RcIlxuICAgIHRpdGxlOiBcIkdldCBSZWt0XCJcbiAgICBkZXNjcmlwdGlvbjogW1wiV2luIHdoaWxlIGFsbCBvcHBvbmVudHMgc3RpbGwgaGF2ZSAxMCBvciBtb3JlIGNhcmRzLlwiXVxuICB9XG4gIHtcbiAgICBpZDogXCJsYXRlXCJcbiAgICB0aXRsZTogXCJGYXNoaW9uYWJseSBMYXRlXCJcbiAgICBkZXNjcmlwdGlvbjogW1wiUGFzcyB1bnRpbCBhbGwgNCAycyBhcmUgdGhyb3duLCBhbmQgdGhlbiB3aW4uXCJdXG4gIH1cbiAge1xuICAgIGlkOiBcInBhaXJzXCJcbiAgICB0aXRsZTogXCJQYWlyaW5nIFVwXCJcbiAgICBkZXNjcmlwdGlvbjogW1wiVGhyb3cgNSBwYWlycyBpbiBhIHNpbmdsZSByb3VuZC5cIl1cbiAgfVxuICB7XG4gICAgaWQ6IFwieW91cnNlbGZcIlxuICAgIHRpdGxlOiBcIllvdSBQbGF5ZWQgWW91cnNlbGZcIlxuICAgIGRlc2NyaXB0aW9uOiBbXCJCZWF0IHlvdXIgb3duIHBsYXkuXCJdXG4gIH1cbiAge1xuICAgIGlkOiBcInRoaXJ0ZWVuXCJcbiAgICB0aXRsZTogXCJUaGlydGVlblwiXG4gICAgZGVzY3JpcHRpb246IFtcIkVhcm4gMTMgYWNoaWV2ZW1lbnRzLlwiXVxuICB9XG5cbiAgIyBQYWdlIDJcblxuICB7XG4gICAgaWQ6IFwidmV0ZXJhbjJcIlxuICAgIHRpdGxlOiBcIk9sZCBUaW1lclwiXG4gICAgZGVzY3JpcHRpb246IFtcIlBsYXkgMTAwMCBIYW5kcy5cIl1cbiAgICBwcm9ncmVzczogKGFjaCkgLT5cbiAgICAgIGlmIGFjaC5zdGF0ZS50b3RhbEdhbWVzID49IDEwMDBcbiAgICAgICAgcmV0dXJuIFwiVG90YWwgUGxheWVkOiBgYWFmZmFhYCN7YWNoLnN0YXRlLnRvdGFsR2FtZXN9YGAgR2FtZXNcIlxuICAgICAgcmV0dXJuIFwiUHJvZ3Jlc3M6ICN7YWNoLnN0YXRlLnRvdGFsR2FtZXN9IC8gMTAwMFwiXG4gIH1cblxuICB7XG4gICAgaWQ6IFwiYmxpbmdcIlxuICAgIHRpdGxlOiBcIkJsaW5nIEJsaW5nXCJcbiAgICBkZXNjcmlwdGlvbjogW1wiQmFua3J1cHQgYW5vdGhlciBwbGF5ZXIgaW4gYSBtb25leSBnYW1lIHdoZW5cIiwgXCJ5b3UgYXJlIGFoZWFkIGJ5ICQxNSBkb2xsYXJzICgkI3tTVEFSVElOR19NT05FWSsxNX0gdG90YWwpLlwiXVxuICB9XG5cbiAge1xuICAgIGlkOiBcImtlZXB0aGVjaGFuZ2VcIlxuICAgIHRpdGxlOiBcIktlZXAgdGhlIENoYW5nZVwiXG4gICAgZGVzY3JpcHRpb246IFtcIldpbiBhIGhhbmQgYnkgdGhyb3dpbmcgYSBzaW5nbGUgMyBsYXN0LlwiXVxuICB9XG5cbiAge1xuICAgIGlkOiBcImRyYWdyYWNpbmdcIlxuICAgIHRpdGxlOiBcIkRyYWcgUmFjaW5nXCJcbiAgICBkZXNjcmlwdGlvbjogW1wiVGhyb3cgYSBwbGF5IHdpdGggdGhlIDMgb2Ygc3BhZGVzIHdoaWNoIG1ha2VzXCIsIFwiYWxsIG9wcG9uZW50cyBwYXNzLlwiXVxuICB9XG5cbiAge1xuICAgIGlkOiBcImhhbmRpY2FwcGVkXCJcbiAgICB0aXRsZTogXCJIYW5kaWNhcHBlZFwiXG4gICAgZGVzY3JpcHRpb246IFtcIldpbiB3aXRoIGEgaGFuZCB3aXRob3V0IGFueSB0d29zLlwiXVxuICB9XG5cbiAge1xuICAgIGlkOiBcInNvbGl0YWlyZVwiXG4gICAgdGl0bGU6IFwiU29saXRhaXJlXCJcbiAgICBkZXNjcmlwdGlvbjogW1wiVGhyb3cgYSBydW4gb2YgNSBvciBtb3JlIGNhcmRzIHdpdGggYWx0ZXJuYXRpbmdcIiwgXCJyZWQgYW5kIGJsYWNrIGNvbG9ycy5cIl1cbiAgfVxuXG4gIHtcbiAgICBpZDogXCJiYWxsZXRcIlxuICAgIHRpdGxlOiBcIkJhbGxldFwiXG4gICAgZGVzY3JpcHRpb246IFtcIlRocm93IGEgcGFpciBvZiB0d29zICh0d28gdHdvcykuXCJdXG4gIH1cblxuICB7XG4gICAgaWQ6IFwicGFnZXJjb2RlXCJcbiAgICB0aXRsZTogXCJQYWdlciBDb2RlXCJcbiAgICBkZXNjcmlwdGlvbjogW1wiVGhlIHNlY3JldCBwYXNzd29yZCBpcyBCQVRIRVMuIERvbid0IHRlbGwgYW55b25lLlwiXVxuICB9XG5dXG5cbmFjaGlldmVtZW50c01hcCA9IHt9XG5mb3IgZSBpbiBhY2hpZXZlbWVudHNMaXN0XG4gIGFjaGlldmVtZW50c01hcFtlLmlkXSA9IGVcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgVGhpcnRlZW5cblxuY2xhc3MgVGhpcnRlZW5cbiAgQFNUQVJUSU5HX01PTkVZOiBTVEFSVElOR19NT05FWVxuXG4gIGNvbnN0cnVjdG9yOiAoQGdhbWUsIHBhcmFtcykgLT5cbiAgICByZXR1cm4gaWYgbm90IHBhcmFtc1xuXG4gICAgaWYgcGFyYW1zLnN0YXRlXG4gICAgICBmb3Igayx2IG9mIHBhcmFtcy5zdGF0ZVxuICAgICAgICBpZiBwYXJhbXMuc3RhdGUuaGFzT3duUHJvcGVydHkoaylcbiAgICAgICAgICB0aGlzW2tdID0gcGFyYW1zLnN0YXRlW2tdXG4gICAgICBAaW5pdEFjaGlldmVtZW50cygpXG4gICAgZWxzZVxuICAgICAgQG5ld0dhbWUocGFyYW1zLm1vbmV5KVxuXG4gIGluaXRBY2hpZXZlbWVudHM6IC0+XG4gICAgQGFjaCA/PSB7fVxuICAgIEBhY2guZWFybmVkID89IHt9XG4gICAgQGFjaC5zdGF0ZSA/PSB7fVxuICAgIEBhY2guc3RhdGUudG90YWxHYW1lcyA/PSAwXG4gICAgQGZhbmZhcmVzID0gW11cblxuICBkZWFsOiAocGFyYW1zKSAtPlxuICAgIGRlY2sgPSBuZXcgU2h1ZmZsZWREZWNrKClcbiAgICBmb3IgcGxheWVyLCBwbGF5ZXJJbmRleCBpbiBAcGxheWVyc1xuICAgICAgQGdhbWUubG9nIFwiZGVhbGluZyAxMyBjYXJkcyB0byBwbGF5ZXIgI3twbGF5ZXJJbmRleH1cIlxuXG4gICAgICBwbGF5ZXIucGxhY2UgPSAwXG4gICAgICBwbGF5ZXIuaGFuZCA9IFtdXG4gICAgICBmb3IgaiBpbiBbMC4uLjEzXVxuICAgICAgICByYXcgPSBkZWNrLmNhcmRzLnNoaWZ0KClcbiAgICAgICAgaWYgcmF3ID09IDBcbiAgICAgICAgICBAdHVybiA9IHBsYXllckluZGV4XG4gICAgICAgIHBsYXllci5oYW5kLnB1c2gocmF3KVxuXG4gICAgICAjIGNvbnNvbGUubG9nIFwiQGdhbWUub3B0aW9ucy5zb3J0SW5kZXggI3tAZ2FtZS5vcHRpb25zLnNvcnRJbmRleH1cIlxuICAgICAgaWYgKEBnYW1lLm9wdGlvbnMuc29ydEluZGV4ID09IDApIG9yIHBsYXllci5haVxuICAgICAgICAjIE5vcm1hbFxuICAgICAgICBwbGF5ZXIuaGFuZC5zb3J0IChhLGIpIC0+IHJldHVybiBhIC0gYlxuICAgICAgZWxzZVxuICAgICAgICAjIFJldmVyc2VcbiAgICAgICAgcGxheWVyLmhhbmQuc29ydCAoYSxiKSAtPiByZXR1cm4gYiAtIGFcblxuICAgIEBpbml0QWNoaWV2ZW1lbnRzKClcbiAgICBAYWNoLnN0YXRlLnRocmV3U2luZ2xlID0gZmFsc2VcbiAgICBAYWNoLnN0YXRlLnRocmV3UGFpciA9IGZhbHNlXG4gICAgQGFjaC5zdGF0ZS50aHJld1RyaXBzID0gZmFsc2VcbiAgICBAYWNoLnN0YXRlLnRocmV3UnVuID0gZmFsc2VcbiAgICBAYWNoLnN0YXRlLnRocmV3UnVuNyA9IGZhbHNlXG4gICAgQGFjaC5zdGF0ZS50d29zU2VlbiA9IDBcbiAgICBAYWNoLnN0YXRlLmZhc2hpb25hYmx5TGF0ZSA9IGZhbHNlXG4gICAgQGFjaC5zdGF0ZS5wYWlyc1Rocm93biA9IDBcbiAgICBAYWNoLnN0YXRlLmJlc3RTdHJlYWsgPz0gMFxuICAgIEBhY2guc3RhdGUuaGFuZGljYXBwZWQgPSBub3QgQGhhbmRIYXMyKEBwbGF5ZXJzWzBdLmhhbmQpXG5cbiAgICBAcGlsZSA9IFtdXG4gICAgQHBpbGVXaG8gPSAtMVxuICAgIEB0aHJvd0lEID0gMFxuICAgIEBjdXJyZW50UGxheSA9IG51bGxcbiAgICBAdW5wYXNzQWxsKClcblxuICAgIGZvck1vbmV5ID0gXCJcIlxuICAgIGlmIEBtb25leVxuICAgICAgZm9yTW9uZXkgPSBcIiAoZm9yIG1vbmV5KVwiXG4gICAgQG91dHB1dChcIkhhbmQgZGVhbHQje2Zvck1vbmV5fSwgXCIgKyBAcGxheWVyc1tAdHVybl0ubmFtZSArIFwiIHBsYXlzIGZpcnN0XCIpXG5cbiAgICByZXR1cm4gT0tcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIFRoaXJ0ZWVuIG1ldGhvZHNcblxuICBuZXdHYW1lOiAobW9uZXkgPSBmYWxzZSwga2VlcFN0cmVhayA9IGZhbHNlKSAtPlxuICAgICMgbmV3IGdhbWVcbiAgICBAbG9nID0gW11cbiAgICBpZiBrZWVwU3RyZWFrXG4gICAgICBAc3RyZWFrID89IDBcbiAgICAgIEBsYXN0U3RyZWFrID89IDBcbiAgICBlbHNlXG4gICAgICBAc3RyZWFrID0gMFxuICAgICAgQGxhc3RTdHJlYWsgPSAwXG4gICAgQG1vbmV5ID0gZmFsc2VcbiAgICBpZiBtb25leVxuICAgICAgQG1vbmV5ID0gdHJ1ZVxuICAgIGNvbnNvbGUubG9nIFwiZm9yIG1vbmV5OiAje0Btb25leX1cIlxuXG4gICAgQHBsYXllcnMgPSBbXG4gICAgICB7IGlkOiAxLCBuYW1lOiAnUGxheWVyJywgaW5kZXg6IDAsIHBhc3M6IGZhbHNlLCBtb25leTogVGhpcnRlZW4uU1RBUlRJTkdfTU9ORVkgfVxuICAgIF1cblxuICAgIGZvciBpIGluIFsxLi4uNF1cbiAgICAgIEBhZGRBSSgpXG5cbiAgICBAZGVhbCgpXG5cbiAgc2F2ZTogLT5cbiAgICBuYW1lcyA9IFwibG9nIHBsYXllcnMgdHVybiBwaWxlIHBpbGVXaG8gdGhyb3dJRCBjdXJyZW50UGxheSBzdHJlYWsgbGFzdFN0cmVhayBhY2ggbW9uZXlcIi5zcGxpdChcIiBcIilcbiAgICBzdGF0ZSA9IHt9XG4gICAgZm9yIG5hbWUgaW4gbmFtZXNcbiAgICAgIHN0YXRlW25hbWVdID0gdGhpc1tuYW1lXVxuICAgIHJldHVybiBzdGF0ZVxuXG4gIG91dHB1dDogKHRleHQpIC0+XG4gICAgQGxvZy5wdXNoIHRleHRcbiAgICB3aGlsZSBAbG9nLmxlbmd0aCA+IE1BWF9MT0dfTElORVNcbiAgICAgIEBsb2cuc2hpZnQoKVxuXG4gIGhlYWRsaW5lOiAtPlxuICAgIGlmIEBnYW1lT3ZlcigpXG4gICAgICByZXR1cm4gXCJHYW1lIE92ZXJcIlxuXG4gICAgaWYgQHBpbGUubGVuZ3RoID09IDBcbiAgICAgIHBsYXlTdHJpbmcgPSBcInRocm93IEFueXRoaW5nIHdpdGggdGhlIDNcXHhjOFwiXG4gICAgZWxzZVxuICAgICAgaWYgQGN1cnJlbnRQbGF5XG4gICAgICAgIHBsYXlTdHJpbmcgPSBcImJlYXQgXCIgKyBwbGF5VG9TdHJpbmcoQGN1cnJlbnRQbGF5KVxuICAgICAgZWxzZVxuICAgICAgICBwbGF5U3RyaW5nID0gXCJ0aHJvdyBBbnl0aGluZ1wiXG5cbiAgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxuICAgIGlmIGN1cnJlbnRQbGF5ZXIuYWlcbiAgICAgIHBsYXllckNvbG9yID0gJ2IwYjAwMCdcbiAgICBlbHNlXG4gICAgICBwbGF5ZXJDb2xvciA9ICdmZjc3MDAnXG4gICAgaGVhZGxpbmUgPSBcImAje3BsYXllckNvbG9yfWAje2N1cnJlbnRQbGF5ZXIubmFtZX1gZmZmZmZmYCB0byAje3BsYXlTdHJpbmd9XCJcbiAgICBpZiBAZXZlcnlvbmVQYXNzZWQoKVxuICAgICAgaGVhZGxpbmUgKz0gXCIgKG9yIHRocm93IGFueXRoaW5nKVwiXG4gICAgcmV0dXJuIGhlYWRsaW5lXG5cbiAgY2FuVGhyb3dBbnl0aGluZzogLT5cbiAgICBpZiBAcGlsZS5sZW5ndGggPT0gMFxuICAgICAgcmV0dXJuIHRydWVcbiAgICBpZiBub3QgQGN1cnJlbnRQbGF5XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGlmIEBldmVyeW9uZVBhc3NlZCgpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIHJldHVybiBmYWxzZVxuXG4gIGZpbmRQbGF5ZXI6IChpZCkgLT5cbiAgICBmb3IgcGxheWVyIGluIEBwbGF5ZXJzXG4gICAgICBpZiBwbGF5ZXIuaWQgPT0gaWRcbiAgICAgICAgcmV0dXJuIHBsYXllclxuICAgIHJldHVybiB1bmRlZmluZWRcblxuICBjdXJyZW50UGxheWVyOiAtPlxuICAgIHJldHVybiBAcGxheWVyc1tAdHVybl1cblxuICBmaW5kUGxhY2U6IChwbGFjZSkgLT5cbiAgICBmb3IgcGxheWVyIGluIEBwbGF5ZXJzXG4gICAgICBpZiAocGxhY2UgPT0gNCkgYW5kIChwbGF5ZXIucGxhY2UgPT0gMClcbiAgICAgICAgcmV0dXJuIHBsYXllclxuICAgICAgaWYgcGxheWVyLnBsYWNlID09IHBsYWNlXG4gICAgICAgIHJldHVybiBwbGF5ZXJcbiAgICByZXR1cm4gdW5kZWZpbmVkXG5cbiAgcGF5b3V0OiAtPlxuICAgIHBsYWNlMSA9IEBmaW5kUGxhY2UoMSlcbiAgICBwbGFjZTIgPSBAZmluZFBsYWNlKDIpXG4gICAgcGxhY2UzID0gQGZpbmRQbGFjZSgzKVxuICAgIHBsYWNlNCA9IEBmaW5kUGxhY2UoNClcblxuICAgIGlmIG5vdCBwbGFjZTEgb3Igbm90IHBsYWNlMiBvciBub3QgcGxhY2UzIG9yIG5vdCBwbGFjZTRcbiAgICAgIEBvdXRwdXQgXCJlcnJvciB3aXRoIHBheW91dHMhXCJcbiAgICAgIHJldHVyblxuXG4gICAgQG91dHB1dCBcIiN7cGxhY2U0Lm5hbWV9IHBheXMgJDIgdG8gI3twbGFjZTEubmFtZX1cIlxuICAgIEBvdXRwdXQgXCIje3BsYWNlMy5uYW1lfSBwYXlzICQxIHRvICN7cGxhY2UyLm5hbWV9XCJcblxuICAgIHBsYWNlMS5tb25leSArPSAyXG4gICAgcGxhY2UyLm1vbmV5ICs9IDFcbiAgICBwbGFjZTMubW9uZXkgKz0gLTFcbiAgICBwbGFjZTQubW9uZXkgKz0gLTJcbiAgICByZXR1cm5cblxuICAjIGFsbCBJTkNMVURJTkcgdGhlIGN1cnJlbnQgcGxheWVyXG4gIGVudGlyZVRhYmxlUGFzc2VkOiAtPlxuICAgIGZvciBwbGF5ZXIsIHBsYXllckluZGV4IGluIEBwbGF5ZXJzXG4gICAgICBpZiBwbGF5ZXIucGxhY2UgIT0gMFxuICAgICAgICBjb250aW51ZVxuICAgICAgaWYgbm90IHBsYXllci5wYXNzXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIHJldHVybiB0cnVlXG5cbiAgIyBhbGwgYnV0IHRoZSBjdXJyZW50IHBsYXllclxuICBldmVyeW9uZVBhc3NlZDogLT5cbiAgICBmb3IgcGxheWVyLCBwbGF5ZXJJbmRleCBpbiBAcGxheWVyc1xuICAgICAgaWYgKHBsYXllci5wbGFjZSAhPSAwKSBhbmQgKEBwaWxlV2hvICE9IHBsYXllckluZGV4KVxuICAgICAgICBjb250aW51ZVxuICAgICAgaWYgcGxheWVySW5kZXggPT0gQHR1cm5cbiAgICAgICAgY29udGludWVcbiAgICAgIGlmIG5vdCBwbGF5ZXIucGFzc1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICByZXR1cm4gdHJ1ZVxuXG4gIHBsYXllckFmdGVyOiAoaW5kZXgpIC0+XG4gICAgbG9vcFxuICAgICAgaW5kZXggPSAoaW5kZXggKyAxKSAlIEBwbGF5ZXJzLmxlbmd0aFxuICAgICAgaWYgQHBsYXllcnNbaW5kZXhdLnBsYWNlID09IDBcbiAgICAgICAgcmV0dXJuIGluZGV4XG4gICAgcmV0dXJuIDAgIyBpbXBvc3NpYmxlP1xuXG4gIGFkZFBsYXllcjogKHBsYXllcikgLT5cbiAgICBpZiBub3QgcGxheWVyLmFpXG4gICAgICBwbGF5ZXIuYWkgPSBmYWxzZVxuXG4gICAgQHBsYXllcnMucHVzaCBwbGF5ZXJcbiAgICBwbGF5ZXIuaW5kZXggPSBAcGxheWVycy5sZW5ndGggLSAxXG4gICAgQG91dHB1dChwbGF5ZXIubmFtZSArIFwiIGpvaW5zIHRoZSBnYW1lXCIpXG5cbiAgbmFtZVByZXNlbnQ6IChuYW1lKSAtPlxuICAgIGZvciBwbGF5ZXIgaW4gQHBsYXllcnNcbiAgICAgIGlmIHBsYXllci5uYW1lID09IG5hbWVcbiAgICAgICAgcmV0dXJuIHRydWVcblxuICAgIHJldHVybiBmYWxzZVxuXG4gIGFkZEFJOiAtPlxuICAgIGxvb3BcbiAgICAgIGNoYXJhY3RlciA9IHJhbmRvbUNoYXJhY3RlcigpXG4gICAgICBpZiBub3QgQG5hbWVQcmVzZW50KGNoYXJhY3Rlci5uYW1lKVxuICAgICAgICBicmVha1xuXG4gICAgYWkgPVxuICAgICAgY2hhcklEOiBjaGFyYWN0ZXIuaWRcbiAgICAgIG5hbWU6IGNoYXJhY3Rlci5uYW1lXG4gICAgICBpZDogJ2FpJyArIFN0cmluZyhAcGxheWVycy5sZW5ndGgpXG4gICAgICBwYXNzOiBmYWxzZVxuICAgICAgYWk6IHRydWVcbiAgICAgIG1vbmV5OiBUaGlydGVlbi5TVEFSVElOR19NT05FWVxuXG4gICAgQGFkZFBsYXllcihhaSlcblxuICAgIEBnYW1lLmxvZyhcImFkZGVkIEFJIHBsYXllclwiKVxuICAgIHJldHVybiBPS1xuXG4gIHVwZGF0ZVBsYXllckhhbmQ6IChjYXJkcykgLT5cbiAgICAjIFRoaXMgbWFpbnRhaW5zIHRoZSByZW9yZ2FuaXplZCBvcmRlciBvZiB0aGUgcGxheWVyJ3MgaGFuZFxuICAgIEBwbGF5ZXJzWzBdLmhhbmQgPSBjYXJkcy5zbGljZSgwKVxuXG4gIHdpbm5lcjogLT5cbiAgICBmb3IgcGxheWVyLCBpIGluIEBwbGF5ZXJzXG4gICAgICBpZiBwbGF5ZXIucGxhY2UgPT0gMVxuICAgICAgICByZXR1cm4gcGxheWVyXG4gICAgcmV0dXJuIG51bGxcblxuICBzb21lb25lR2F2ZVVwOiAtPlxuICAgIGlmIG5vdCBAbW9uZXlcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIGlmIG5vdCBAZ2FtZS5vcHRpb25zLmdpdmluZ1VwXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICBmb3IgcGxheWVyIGluIEBwbGF5ZXJzXG4gICAgICBpZiBwbGF5ZXIubW9uZXkgPD0gMFxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIHJldHVybiBmYWxzZVxuXG4gIGdhbWVPdmVyOiAtPlxuICAgIG5wID0gQG5leHRQbGFjZSgpXG4gICAgaWYgQG1vbmV5XG4gICAgICByZXR1cm4gKG5wID4gMylcbiAgICByZXR1cm4gKG5wID4gMSlcblxuICBoYXNDYXJkOiAoaGFuZCwgcmF3Q2FyZCkgLT5cbiAgICBmb3IgcmF3IGluIGhhbmRcbiAgICAgIGlmIHJhdyA9PSByYXdDYXJkXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgaGFzQ2FyZHM6IChoYW5kLCByYXdDYXJkcykgLT5cbiAgICBmb3IgcmF3IGluIHJhd0NhcmRzXG4gICAgICBpZiBub3QgQGhhc0NhcmQoaGFuZCwgcmF3KVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICByZXR1cm4gdHJ1ZVxuXG4gIHJlbW92ZUNhcmRzOiAoaGFuZCwgcmF3Q2FyZHMpIC0+XG4gICAgbmV3SGFuZCA9IFtdXG4gICAgZm9yIGNhcmQgaW4gaGFuZFxuICAgICAga2VlcE1lID0gdHJ1ZVxuICAgICAgZm9yIHJhdyBpbiByYXdDYXJkc1xuICAgICAgICBpZiBjYXJkID09IHJhd1xuICAgICAgICAgIGtlZXBNZSA9IGZhbHNlXG4gICAgICAgICAgYnJlYWtcbiAgICAgIGlmIGtlZXBNZVxuICAgICAgICBuZXdIYW5kLnB1c2ggY2FyZFxuICAgIHJldHVybiBuZXdIYW5kXG5cbiAgY2xhc3NpZnk6IChyYXdDYXJkcykgLT5cbiAgICBjYXJkcyA9IHJhd0NhcmRzLm1hcCAocmF3KSAtPiBuZXcgQ2FyZChyYXcpXG4gICAgY2FyZHMgPSBjYXJkcy5zb3J0IChhLCBiKSAtPiByZXR1cm4gYS5yYXcgLSBiLnJhd1xuICAgIGhpZ2hlc3RSYXcgPSBjYXJkc1tjYXJkcy5sZW5ndGggLSAxXS5yYXdcblxuICAgICMgbG9vayBmb3IgYSBydW4gb2YgcGFpcnNcbiAgICBpZiAoY2FyZHMubGVuZ3RoID49IDYpIGFuZCAoKGNhcmRzLmxlbmd0aCAlIDIpID09IDApXG4gICAgICBmb3VuZFJvcCA9IHRydWVcbiAgICAgIGZvciBjYXJkLCBjYXJkSW5kZXggaW4gY2FyZHNcbiAgICAgICAgaWYgY2FyZEluZGV4ID09IDBcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICBpZiBjYXJkLnZhbHVlID09IDEyXG4gICAgICAgICAgIyBubyAycyBpbiBhIHJ1blxuICAgICAgICAgIGZvdW5kUm9wID0gZmFsc2VcbiAgICAgICAgICBicmVha1xuICAgICAgICBpZiAoY2FyZEluZGV4ICUgMikgPT0gMVxuICAgICAgICAgICMgb2RkIGNhcmQsIG11c3QgbWF0Y2ggbGFzdCBjYXJkIGV4YWN0bHlcbiAgICAgICAgICBpZiBjYXJkLnZhbHVlICE9IChjYXJkc1tjYXJkSW5kZXggLSAxXS52YWx1ZSlcbiAgICAgICAgICAgIGZvdW5kUm9wID0gZmFsc2VcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAjIGV2ZW4gY2FyZCwgbXVzdCBpbmNyZW1lbnRcbiAgICAgICAgICBpZiBjYXJkLnZhbHVlICE9IChjYXJkc1tjYXJkSW5kZXggLSAxXS52YWx1ZSArIDEpXG4gICAgICAgICAgICBmb3VuZFJvcCA9IGZhbHNlXG4gICAgICAgICAgICBicmVha1xuXG4gICAgICBpZiBmb3VuZFJvcFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHR5cGU6ICdyb3AnICsgTWF0aC5mbG9vcihjYXJkcy5sZW5ndGggLyAyKVxuICAgICAgICAgIGhpZ2g6IGhpZ2hlc3RSYXdcbiAgICAgICAgfVxuXG4gICAgIyBsb29rIGZvciBhIHJ1blxuICAgIGlmIGNhcmRzLmxlbmd0aCA+PSAzXG4gICAgICBmb3VuZFJ1biA9IHRydWVcbiAgICAgIGZvciBjYXJkLCBjYXJkSW5kZXggaW4gY2FyZHNcbiAgICAgICAgaWYgY2FyZEluZGV4ID09IDBcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICBpZiBjYXJkLnZhbHVlID09IDEyXG4gICAgICAgICAgIyBubyAycyBpbiBhIHJ1blxuICAgICAgICAgIGZvdW5kUnVuID0gZmFsc2VcbiAgICAgICAgICBicmVha1xuICAgICAgICBpZiBjYXJkLnZhbHVlICE9IChjYXJkc1tjYXJkSW5kZXggLSAxXS52YWx1ZSArIDEpXG4gICAgICAgICAgZm91bmRSdW4gPSBmYWxzZVxuICAgICAgICAgIGJyZWFrXG5cbiAgICAgIGlmIGZvdW5kUnVuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdHlwZTogJ3J1bicgKyBjYXJkcy5sZW5ndGhcbiAgICAgICAgICBoaWdoOiBoaWdoZXN0UmF3XG4gICAgICAgIH1cblxuICAgICMgbG9vayBmb3IgWCBvZiBhIGtpbmRcbiAgICByZXFWYWx1ZSA9IGNhcmRzWzBdLnZhbHVlXG4gICAgZm9yIGNhcmQgaW4gY2FyZHNcbiAgICAgIGlmIGNhcmQudmFsdWUgIT0gcmVxVmFsdWVcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICB0eXBlID0gJ2tpbmQnICsgY2FyZHMubGVuZ3RoXG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IHR5cGVcbiAgICAgIGhpZ2g6IGhpZ2hlc3RSYXdcbiAgICB9XG5cbiAgaGFuZEhhczNTOiAoaGFuZCkgLT5cbiAgICBmb3IgcmF3IGluIGhhbmRcbiAgICAgIGlmIHJhdyA9PSAwXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgaGFuZEhhczI6IChoYW5kKSAtPlxuICAgIGZvciByYXcgaW4gaGFuZFxuICAgICAgaWYgcmF3ID49IDQ4XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgaGFuZElzQkFUSEVTOiAoaGFuZCkgLT5cbiAgICBpZiBoYW5kLmxlbmd0aCAhPSA2XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICBjYXJkcyA9IGhhbmQubWFwIChyYXcpIC0+IG5ldyBDYXJkKHJhdylcbiAgICAjIGRvIG5vdCBzb3J0IVxuICAgIGV4cGVjdGluZyA9IFs1LCAzLCA0LCAxLCAwLCAyXVxuICAgIGZvciBjYXJkLCBpbmRleCBpbiBjYXJkc1xuICAgICAgaWYgY2FyZC52YWx1ZSAhPSBleHBlY3RpbmdbaW5kZXhdXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIHJldHVybiB0cnVlXG5cbiAgY2FyZElzUmVkOiAoY2FyZCkgLT5cbiAgICBpZiBjYXJkLnN1aXQgPT0gU3VpdC5ESUFNT05EU1xuICAgICAgcmV0dXJuIHRydWVcbiAgICBpZiBjYXJkLnN1aXQgPT0gU3VpdC5IRUFSVFNcbiAgICAgIHJldHVybiB0cnVlXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgaGFuZEFsdGVybmF0ZXNSZWRBbmRCbGFjazogKGhhbmQpIC0+XG4gICAgY2FyZHMgPSBoYW5kLm1hcCAocmF3KSAtPiBuZXcgQ2FyZChyYXcpXG4gICAgY2FyZHMgPSBjYXJkcy5zb3J0IChhLCBiKSAtPiByZXR1cm4gYS5yYXcgLSBiLnJhd1xuICAgIHdhbnRzUmVkID0gQGNhcmRJc1JlZChjYXJkc1swXSlcbiAgICBmb3IgY2FyZCBpbiBjYXJkc1xuICAgICAgaWYgd2FudHNSZWQgIT0gQGNhcmRJc1JlZChjYXJkKVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIHdhbnRzUmVkID0gIXdhbnRzUmVkXG4gICAgcmV0dXJuIHRydWVcblxuICBuZXh0UGxhY2U6IC0+XG4gICAgaGlnaGVzdFBsYWNlID0gMFxuICAgIGZvciBwbGF5ZXIgaW4gQHBsYXllcnNcbiAgICAgIHBsYXllci5wbGFjZSA/PSAwXG4gICAgICBpZiBoaWdoZXN0UGxhY2UgPCBwbGF5ZXIucGxhY2VcbiAgICAgICAgaGlnaGVzdFBsYWNlID0gcGxheWVyLnBsYWNlXG4gICAgcmV0dXJuIGhpZ2hlc3RQbGFjZSArIDFcblxuICBzcGxpdFBsYXlUeXBlOiAocGxheVR5cGUpIC0+XG4gICAgaWYgbWF0Y2hlcyA9IHBsYXlUeXBlLm1hdGNoKC9eKFteMC05XSspKFxcZCspLylcbiAgICAgIHJldHVybiBbbWF0Y2hlc1sxXSwgcGFyc2VJbnQobWF0Y2hlc1syXSldXG4gICAgcmV0dXJuIFtwbGF5VHlwZSwgMV1cblxuICBoYXNQbGF5OiAoY3VycmVudFBsYXksIGhhbmQpIC0+XG4gICAgIyBxdWljayBjaGVjay4gaWYgeW91IGRvbnQgaGF2ZSBlbm91Z2ggY2FyZHMsIHlvdSBjYW4ndCBoYXZlIGEgcGxheVxuICAgIGlmIChwbGF5VG9DYXJkQ291bnQoY3VycmVudFBsYXkpID4gaGFuZC5sZW5ndGgpXG4gICAgICByZXR1cm4gZmFsc2VcblxuICAgIGlmIEBnYW1lLm9wdGlvbnMuYXV0b3Bhc3NJbmRleCA9PSAyXG4gICAgICAjIGxpbWl0ZWQsIGFzc3VtZSB0aGVyZSdzIGEgcGxheSBpbiB0aGVyZSBzb21ld2hlcmUsIGlmIHRoZXJlJ3MgZW5vdWdoIGNhcmRzXG4gICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgbGVmdG92ZXJzID0gW11cbiAgICBwbGF5cyA9IHt9XG4gICAgc3BsID0gQHNwbGl0UGxheVR5cGUoY3VycmVudFBsYXkudHlwZSlcbiAgICBzd2l0Y2ggc3BsWzBdXG4gICAgICB3aGVuICdyb3AnXG4gICAgICAgIGxlZnRvdmVycyA9IEBhaUNhbGNSb3BzKGhhbmQsIHBsYXlzLCBzcGxbMV0pXG4gICAgICB3aGVuICdydW4nXG4gICAgICAgIGxlZnRvdmVycyA9IEBhaUNhbGNSdW5zKGhhbmQsIHBsYXlzLCBmYWxzZSwgc3BsWzFdKVxuICAgICAgd2hlbiAna2luZCdcbiAgICAgICAgbGVmdG92ZXJzID0gQGFsQ2FsY0tpbmRzKGhhbmQsIHBsYXlzLCB0cnVlKVxuXG4gICAgcGxheXMua2luZDEgPz0gW11cbiAgICBmb3IgbGVmdG92ZXIgaW4gbGVmdG92ZXJzXG4gICAgICBwbGF5cy5raW5kMS5wdXNoIFtsZWZ0b3Zlcl1cblxuICAgIGlmIHBsYXlzW2N1cnJlbnRQbGF5LnR5cGVdPyBhbmQgcGxheXNbY3VycmVudFBsYXkudHlwZV0ubGVuZ3RoID4gMFxuICAgICAgICBmb3IgcGxheSBpbiBwbGF5c1tjdXJyZW50UGxheS50eXBlXVxuICAgICAgICAgIGlmIEBoaWdoZXN0Q2FyZChwbGF5KSA+IGN1cnJlbnRQbGF5LmhpZ2hcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG5cbiAgICAjIHNwZWNpYWwgY2FzZSBraW5kc1xuICAgIGlmIHNwbFswXSA9PSAna2luZCdcbiAgICAgICMgY2hlY2sgYmlnZ2VyIGtpbmRzXG4gICAgICBmb3IgYmlnZ2VyS2luZCBpbiBbc3BsWzFdLi40XVxuICAgICAgICBiaWdnZXJUeXBlID0gXCJraW5kI3tiaWdnZXJLaW5kfVwiXG4gICAgICAgIGlmIHBsYXlzW2JpZ2dlclR5cGVdPyBhbmQgcGxheXNbYmlnZ2VyVHlwZV0ubGVuZ3RoID4gMFxuICAgICAgICAgICAgZm9yIHBsYXkgaW4gcGxheXNbYmlnZ2VyVHlwZV1cbiAgICAgICAgICAgICAgaWYgQGhpZ2hlc3RDYXJkKHBsYXkpID4gY3VycmVudFBsYXkuaGlnaFxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG5cbiAgICAjIG5vIHBsYXlzLCBwYXNzXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgY2FuUGFzczogKHBhcmFtcykgLT5cbiAgICBpZiBAZ2FtZU92ZXIoKVxuICAgICAgcmV0dXJuICdnYW1lT3ZlcidcblxuICAgIGN1cnJlbnRQbGF5ZXIgPSBAY3VycmVudFBsYXllcigpXG4gICAgaWYgcGFyYW1zLmlkICE9IGN1cnJlbnRQbGF5ZXIuaWRcbiAgICAgIHJldHVybiAnbm90WW91clR1cm4nXG5cbiAgICBpZiBAcGlsZS5sZW5ndGggPT0gMFxuICAgICAgcmV0dXJuICdtdXN0VGhyb3czUydcblxuICAgIGlmIEBldmVyeW9uZVBhc3NlZCgpXG4gICAgICByZXR1cm4gJ3Rocm93QW55dGhpbmcnXG5cbiAgICByZXR1cm4gT0tcblxuICBjYW5QbGF5OiAocGFyYW1zLCBpbmNvbWluZ1BsYXksIGhhbmRIYXMzUykgLT5cbiAgICBpZiBAZ2FtZU92ZXIoKVxuICAgICAgcmV0dXJuICdnYW1lT3ZlcidcblxuICAgIGN1cnJlbnRQbGF5ZXIgPSBAY3VycmVudFBsYXllcigpXG4gICAgaWYgcGFyYW1zLmlkICE9IGN1cnJlbnRQbGF5ZXIuaWRcbiAgICAgIHJldHVybiAnbm90WW91clR1cm4nXG5cbiAgICBpZiBpbmNvbWluZ1BsYXkgPT0gbnVsbFxuICAgICAgcmV0dXJuICdpbnZhbGlkUGxheSdcblxuICAgIGlmIEBwaWxlLmxlbmd0aCA9PSAwXG4gICAgICBpZiBub3QgaGFuZEhhczNTXG4gICAgICAgIHJldHVybiAnbXVzdFRocm93M1MnXG5cbiAgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxuICAgIGlmIGN1cnJlbnRQbGF5ZXIucGFzc1xuICAgICAgaWYgQGN1cnJlbnRQbGF5IGFuZCBAY2FuQmVCcm9rZW4oQGN1cnJlbnRQbGF5KVxuICAgICAgICBpZiBAaXNCcmVha2VyVHlwZShpbmNvbWluZ1BsYXkudHlwZSlcbiAgICAgICAgICByZXR1cm4gT0tcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJldHVybiAnbXVzdEJyZWFrT3JQYXNzJ1xuICAgICAgcmV0dXJuICdtdXN0UGFzcydcblxuICAgIGlmIEBjdXJyZW50UGxheSA9PSBudWxsXG4gICAgICByZXR1cm4gT0tcblxuICAgIGlmIEBldmVyeW9uZVBhc3NlZCgpXG4gICAgICByZXR1cm4gT0tcblxuICAgIGlmIEBjYW5CZUJyb2tlbihAY3VycmVudFBsYXkpIGFuZCBAaXNCcmVha2VyVHlwZShpbmNvbWluZ1BsYXkudHlwZSlcbiAgICAgICMgMiBicmVha2VyIVxuICAgICAgcmV0dXJuIE9LXG5cbiAgICBpZiBpbmNvbWluZ1BsYXkudHlwZSAhPSBAY3VycmVudFBsYXkudHlwZVxuICAgICAgcmV0dXJuICd3cm9uZ1BsYXknXG5cbiAgICBpZiBpbmNvbWluZ1BsYXkuaGlnaCA8IEBjdXJyZW50UGxheS5oaWdoXG4gICAgICByZXR1cm4gJ3Rvb0xvd1BsYXknXG5cbiAgICByZXR1cm4gT0tcblxuICBwbGF5OiAocGFyYW1zKSAtPlxuICAgIGluY29taW5nUGxheSA9IEBjbGFzc2lmeShwYXJhbXMuY2FyZHMpXG4gICAgY29uc29sZS5sb2cgXCJpbmNvbWluZ1BsYXlcIiwgaW5jb21pbmdQbGF5XG5cbiAgICBjb25zb2xlLmxvZyBcInNvbWVvbmUgY2FsbGluZyBwbGF5XCIsIHBhcmFtc1xuICAgIHJldCA9IEBjYW5QbGF5KHBhcmFtcywgaW5jb21pbmdQbGF5LCBAaGFuZEhhczNTKHBhcmFtcy5jYXJkcykpXG4gICAgaWYgcmV0ICE9IE9LXG4gICAgICByZXR1cm4gcmV0XG5cbiAgICBicmVha2VyVGhyb3duID0gZmFsc2VcbiAgICBuZXdUaHJvdyA9IHRydWVcblxuICAgICMgVE9ETzogbWFrZSBwcmV0dHkgbmFtZXMgYmFzZWQgb24gdGhlIHBsYXksIGFkZCBwbGF5IHRvIGhlYWRsaW5lXG4gICAgdmVyYiA9IFwidGhyb3dzOlwiXG4gICAgaWYgQGN1cnJlbnRQbGF5XG4gICAgICBpZiBAY2FuQmVCcm9rZW4oQGN1cnJlbnRQbGF5KSBhbmQgQGlzQnJlYWtlclR5cGUoaW5jb21pbmdQbGF5LnR5cGUpXG4gICAgICAgICMgMiBicmVha2VyIVxuICAgICAgICBAdW5wYXNzQWxsKClcbiAgICAgICAgdmVyYiA9IFwiYnJlYWtzIDI6XCJcbiAgICAgICAgYnJlYWtlclRocm93biA9IHRydWVcbiAgICAgICAgbmV3VGhyb3cgPSBmYWxzZVxuICAgICAgZWxzZSBpZiAoaW5jb21pbmdQbGF5LnR5cGUgIT0gQGN1cnJlbnRQbGF5LnR5cGUpIG9yIChpbmNvbWluZ1BsYXkuaGlnaCA8IEBjdXJyZW50UGxheS5oaWdoKVxuICAgICAgICAjIE5ldyBwbGF5IVxuICAgICAgICBAdW5wYXNzQWxsKClcbiAgICAgICAgdmVyYiA9IFwidGhyb3dzIG5ldzpcIlxuICAgICAgZWxzZVxuICAgICAgICBuZXdUaHJvdyA9IGZhbHNlXG4gICAgZWxzZVxuICAgICAgdmVyYiA9IFwiYmVnaW5zOlwiXG5cbiAgICAjIEFjaGlldmVtZW50c1xuICAgIEBhY2guc3RhdGUudHdvc1NlZW4gPz0gMFxuICAgIEBhY2guc3RhdGUucGFpcnNUaHJvd24gPz0gMFxuICAgIGZvciBjYXJkIGluIHBhcmFtcy5jYXJkc1xuICAgICAgaWYgY2FyZCA+PSA0OFxuICAgICAgICBAYWNoLnN0YXRlLnR3b3NTZWVuICs9IDFcbiAgICBpZiAoQGFjaC5zdGF0ZS50d29zU2VlbiA9PSA0KSBhbmQgKEBwbGF5ZXJzWzBdLmhhbmQubGVuZ3RoID09IDEzKVxuICAgICAgQGFjaC5zdGF0ZS5mYXNoaW9uYWJseUxhdGUgPSB0cnVlXG4gICAgY29uc29sZS5sb2cgXCJAYWNoLnN0YXRlLmZhc2hpb25hYmx5TGF0ZSAje0BhY2guc3RhdGUuZmFzaGlvbmFibHlMYXRlfVwiXG4gICAgaWYgQHR1cm4gPT0gMFxuICAgICAgaWYgQGV2ZXJ5b25lUGFzc2VkKCkgYW5kIG5vdCBuZXdUaHJvd1xuICAgICAgICBAZWFybiBcInlvdXJzZWxmXCJcbiAgICAgIGlmIGluY29taW5nUGxheS50eXBlID09ICdraW5kMidcbiAgICAgICAgQGFjaC5zdGF0ZS5wYWlyc1Rocm93biArPSAxXG4gICAgICAgIGlmIEBhY2guc3RhdGUucGFpcnNUaHJvd24gPj0gNVxuICAgICAgICAgIEBlYXJuIFwicGFpcnNcIlxuICAgICAgaWYgYnJlYWtlclRocm93blxuICAgICAgICBAZWFybiBcImJyZWFrZXJcIlxuICAgICAgaWYgQGlzQnJlYWtlclR5cGUoaW5jb21pbmdQbGF5LnR5cGUpIGFuZCAoQHBpbGUubGVuZ3RoID09IDApXG4gICAgICAgIEBlYXJuIFwidHJhZ2VkeVwiXG4gICAgICBpZiBAaXNSdW5UeXBlKGluY29taW5nUGxheS50eXBlKSBhbmQgQGlzU3VpdGVkKHBhcmFtcy5jYXJkcylcbiAgICAgICAgQGVhcm4gXCJzdWl0ZWRcIlxuICAgICAgaWYgQGN1cnJlbnRQbGF5IGFuZCAoQGN1cnJlbnRQbGF5LnR5cGUgPT0gJ2tpbmQxJykgYW5kIChAY3VycmVudFBsYXkuaGlnaCA8PSAzKSBhbmQgKGluY29taW5nUGxheS50eXBlID09ICdraW5kMScpIGFuZCAoaW5jb21pbmdQbGF5LmhpZ2ggPj0gNDgpXG4gICAgICAgIEBlYXJuIFwia2VlcGl0bG93XCJcbiAgICAgIGlmIEBpc1J1blR5cGUoaW5jb21pbmdQbGF5LnR5cGUpIGFuZCAoaW5jb21pbmdQbGF5LmhpZ2ggPT0gNDcpICMgQWNlIG9mIEhlYXJ0c1xuICAgICAgICBAZWFybiBcImluZG9taXRhYmxlXCJcbiAgICAgIGlmIEBpc0JpZ1J1bihpbmNvbWluZ1BsYXksIDcpXG4gICAgICAgIGNvbnNvbGUubG9nIFwidGhyZXdSdW43OiB0cnVlXCJcbiAgICAgICAgQGFjaC5zdGF0ZS50aHJld1J1bjcgPSB0cnVlXG4gICAgICBpZiBpbmNvbWluZ1BsYXkudHlwZSA9PSAna2luZDEnXG4gICAgICAgIEBhY2guc3RhdGUudGhyZXdTaW5nbGUgPSB0cnVlXG4gICAgICBpZiBpbmNvbWluZ1BsYXkudHlwZSA9PSAna2luZDInXG4gICAgICAgIEBhY2guc3RhdGUudGhyZXdQYWlyID0gdHJ1ZVxuICAgICAgaWYgaW5jb21pbmdQbGF5LnR5cGUgPT0gJ2tpbmQzJ1xuICAgICAgICBAYWNoLnN0YXRlLnRocmV3VHJpcHMgPSB0cnVlXG4gICAgICBpZiBpbmNvbWluZ1BsYXkudHlwZS5tYXRjaCgvXnJ1bi8pXG4gICAgICAgIEBhY2guc3RhdGUudGhyZXdSdW4gPSB0cnVlXG4gICAgICBpZiBAYWNoLnN0YXRlLnRocmV3U2luZ2xlIGFuZCBAYWNoLnN0YXRlLnRocmV3UGFpciBhbmQgQGFjaC5zdGF0ZS50aHJld1RyaXBzIGFuZCBAYWNoLnN0YXRlLnRocmV3UnVuXG4gICAgICAgIEBlYXJuIFwic2FtcGxlclwiXG4gICAgICBpZiAocGFyYW1zLmNhcmRzLmxlbmd0aCA+PSA1KSBhbmQgQGhhbmRBbHRlcm5hdGVzUmVkQW5kQmxhY2socGFyYW1zLmNhcmRzKVxuICAgICAgICBAZWFybiBcInNvbGl0YWlyZVwiXG4gICAgICBpZiAoaW5jb21pbmdQbGF5LnR5cGUgPT0gJ2tpbmQyJykgYW5kIChpbmNvbWluZ1BsYXkuaGlnaCA+PSA0OClcbiAgICAgICAgQGVhcm4gXCJiYWxsZXRcIlxuICAgICAgaWYgQGhhbmRJc0JBVEhFUyhwYXJhbXMuY2FyZHMpXG4gICAgICAgIEBlYXJuIFwicGFnZXJjb2RlXCJcblxuICAgIEBjdXJyZW50UGxheSA9IGluY29taW5nUGxheVxuXG4gICAgQHRocm93SUQgKz0gMVxuICAgIGN1cnJlbnRQbGF5ZXIgPSBAY3VycmVudFBsYXllcigpXG4gICAgY3VycmVudFBsYXllci5oYW5kID0gQHJlbW92ZUNhcmRzKGN1cnJlbnRQbGF5ZXIuaGFuZCwgcGFyYW1zLmNhcmRzKVxuXG4gICAgQG91dHB1dChcIiN7Y3VycmVudFBsYXllci5uYW1lfSAje3ZlcmJ9ICN7cGxheVRvU3RyaW5nKGluY29taW5nUGxheSl9XCIpXG5cbiAgICBpZiBjdXJyZW50UGxheWVyLmhhbmQubGVuZ3RoID09IDBcbiAgICAgICMgR2FtZSBvdmVyISBkbyBnYW1lb3ZlciB0aGluZ3MuXG5cbiAgICAgIGN1cnJlbnRQbGF5ZXIucGxhY2UgPSBAbmV4dFBsYWNlKClcblxuICAgICAgaWYgQG1vbmV5XG4gICAgICAgIHBsYWNlU3RyaW5nID0gXCI0dGhcIlxuICAgICAgICBpZiBjdXJyZW50UGxheWVyLnBsYWNlID09IDFcbiAgICAgICAgICBwbGFjZVN0cmluZyA9IFwiMXN0XCJcbiAgICAgICAgZWxzZSBpZiBjdXJyZW50UGxheWVyLnBsYWNlID09IDJcbiAgICAgICAgICBwbGFjZVN0cmluZyA9IFwiMm5kXCJcbiAgICAgICAgZWxzZSBpZiBjdXJyZW50UGxheWVyLnBsYWNlID09IDNcbiAgICAgICAgICBwbGFjZVN0cmluZyA9IFwiM3JkXCJcbiAgICAgICAgQG91dHB1dChcIiN7Y3VycmVudFBsYXllci5uYW1lfSB0YWtlcyAje3BsYWNlU3RyaW5nfSBwbGFjZVwiKVxuXG4gICAgICAgIGlmIGN1cnJlbnRQbGF5ZXIucGxhY2UgPT0gM1xuICAgICAgICAgIEBwYXlvdXQoKVxuXG4gICAgICAgICAgaWYgQGdhbWUub3B0aW9ucy5naXZpbmdVcFxuICAgICAgICAgICAgZm9yIHBsYXllciBpbiBAcGxheWVyc1xuICAgICAgICAgICAgICBpZiBwbGF5ZXIubW9uZXkgPD0gMFxuICAgICAgICAgICAgICAgIEBvdXRwdXQoXCIje3BsYXllci5uYW1lfSBnaXZlcyB1cFwiKVxuICAgICAgICAgICAgICAgIGlmIEBwbGF5ZXJzWzBdLm1vbmV5ID49IChUaGlydGVlbi5TVEFSVElOR19NT05FWSArIDE1KVxuICAgICAgICAgICAgICAgICAgQGVhcm4gXCJibGluZ1wiXG5cbiAgICAgIGVsc2VcbiAgICAgICAgQG91dHB1dChcIiN7Y3VycmVudFBsYXllci5uYW1lfSB3aW5zIVwiKVxuXG4gICAgICBpZiBjdXJyZW50UGxheWVyLnBsYWNlID09IDFcbiAgICAgICAgaWYgQHR1cm4gPT0gMFxuICAgICAgICAgIEBzdHJlYWsgKz0gMVxuICAgICAgICAgIEBsYXN0U3RyZWFrID0gQHN0cmVha1xuICAgICAgICBlbHNlXG4gICAgICAgICAgQGxhc3RTdHJlYWsgPSBAc3RyZWFrXG4gICAgICAgICAgQHN0cmVhayA9IDBcblxuICAgICAgQGFjaC5zdGF0ZS5iZXN0U3RyZWFrID89IDBcbiAgICAgIGlmIEBhY2guc3RhdGUuYmVzdFN0cmVhayA8IEBsYXN0U3RyZWFrXG4gICAgICAgIEBhY2guc3RhdGUuYmVzdFN0cmVhayA9IEBsYXN0U3RyZWFrXG5cbiAgICAgICMgQWNoaWV2ZW1lbnRzXG4gICAgICBpZiBAYWNoLnN0YXRlLmJlc3RTdHJlYWsgPj0gNVxuICAgICAgICBAZWFybiBcInRyeWhhcmRcIlxuICAgICAgQGFjaC5zdGF0ZS50b3RhbEdhbWVzICs9IDFcbiAgICAgIGlmIEBhY2guc3RhdGUudG90YWxHYW1lcyA+PSA1MFxuICAgICAgICBAZWFybiBcInZldGVyYW5cIlxuICAgICAgaWYgQGFjaC5zdGF0ZS50b3RhbEdhbWVzID49IDEwMDBcbiAgICAgICAgQGVhcm4gXCJ2ZXRlcmFuMlwiXG4gICAgICBpZiBjdXJyZW50UGxheWVyLnBsYWNlID09IDFcbiAgICAgICAgaWYgQHR1cm4gPT0gMFxuICAgICAgICAgICMgcGxheWVyIHdvblxuICAgICAgICAgIGlmIChAcGxheWVyc1sxXS5oYW5kLmxlbmd0aCA+PSAxMCkgYW5kIChAcGxheWVyc1syXS5oYW5kLmxlbmd0aCA+PSAxMCkgYW5kIChAcGxheWVyc1szXS5oYW5kLmxlbmd0aCA+PSAxMClcbiAgICAgICAgICAgIEBlYXJuIFwicmVrdFwiXG4gICAgICAgICAgaWYgQGFjaC5zdGF0ZS5mYXNoaW9uYWJseUxhdGVcbiAgICAgICAgICAgIEBlYXJuIFwibGF0ZVwiXG4gICAgICAgICAgaWYgQGFjaC5zdGF0ZS5oYW5kaWNhcHBlZFxuICAgICAgICAgICAgQGVhcm4gXCJoYW5kaWNhcHBlZFwiXG4gICAgICAgICAgaWYgKHBhcmFtcy5jYXJkcy5sZW5ndGggPT0gMSkgYW5kIChwYXJhbXMuY2FyZHNbMF0gPCA0KVxuICAgICAgICAgICAgIyB0aHJldyBhIHNpbmdsZSAzIHRvIGVuZCB0aGUgcm91bmRcbiAgICAgICAgICAgIEBlYXJuIFwia2VlcHRoZWNoYW5nZVwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAjIHBsYXllciBsb3N0XG4gICAgICAgICAgaWYgQGFjaC5zdGF0ZS50aHJld1J1bjdcbiAgICAgICAgICAgIEBlYXJuIFwidG9ueVwiXG5cbiAgICBhY2hpZXZlbWVudENvdW50ID0gMFxuICAgIGZvciBhY2hpZXZlbWVudCBpbiBhY2hpZXZlbWVudHNMaXN0XG4gICAgICBpZiBAYWNoLmVhcm5lZFthY2hpZXZlbWVudC5pZF1cbiAgICAgICAgYWNoaWV2ZW1lbnRDb3VudCArPSAxXG4gICAgaWYgYWNoaWV2ZW1lbnRDb3VudCA+PSAxM1xuICAgICAgQGVhcm4gXCJ0aGlydGVlblwiXG5cbiAgICBAcGlsZSA9IHBhcmFtcy5jYXJkcy5zbGljZSgwKVxuICAgIEBwaWxlV2hvID0gQHR1cm5cblxuICAgIEB0dXJuID0gQHBsYXllckFmdGVyKEB0dXJuKVxuICAgIHJldHVybiBPS1xuXG4gIHVucGFzc0FsbDogLT5cbiAgICBmb3IgcGxheWVyIGluIEBwbGF5ZXJzXG4gICAgICBwbGF5ZXIucGFzcyA9IGZhbHNlXG4gICAgcmV0dXJuXG5cbiAgcGFzczogKHBhcmFtcykgLT5cbiAgICByZXQgPSBAY2FuUGFzcyhwYXJhbXMpXG4gICAgaWYgcmV0ICE9IE9LXG4gICAgICByZXR1cm4gcmV0XG5cbiAgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxuICAgIGlmIG5vdCBjdXJyZW50UGxheWVyLmFpIGFuZCBAY3VycmVudFBsYXkgYW5kIG5vdCBAaGFzUGxheShAY3VycmVudFBsYXksIGN1cnJlbnRQbGF5ZXIuaGFuZClcbiAgICAgIEBvdXRwdXQoXCIje2N1cnJlbnRQbGF5ZXIubmFtZX0gYXV0by1wYXNzZXMgKG5vIHBsYXlzKVwiKVxuICAgIGVsc2UgaWYgY3VycmVudFBsYXllci5wYXNzXG4gICAgICBAb3V0cHV0KFwiI3tjdXJyZW50UGxheWVyLm5hbWV9IGF1dG8tcGFzc2VzXCIpXG4gICAgZWxzZVxuICAgICAgQG91dHB1dChcIiN7Y3VycmVudFBsYXllci5uYW1lfSBwYXNzZXNcIilcbiAgICBjdXJyZW50UGxheWVyLnBhc3MgPSB0cnVlXG4gICAgQHR1cm4gPSBAcGxheWVyQWZ0ZXIoQHR1cm4pXG4gICAgQGdhbWUucGlsZS5wb2tlKClcblxuICAgIGlmIChAdHVybiA9PSAwKSBhbmQgQGV2ZXJ5b25lUGFzc2VkKCkgYW5kIEBoYW5kSGFzM1MoQHBpbGUpXG4gICAgICBAZWFybiBcImRyYWdyYWNpbmdcIlxuICAgIHJldHVybiBPS1xuXG4gIGFpUGxheTogKGN1cnJlbnRQbGF5ZXIsIGNhcmRzKSAtPlxuICAgIHJldHVybiBAcGxheSh7J2lkJzpjdXJyZW50UGxheWVyLmlkLCAnY2FyZHMnOmNhcmRzfSlcblxuICBhaVBhc3M6IChjdXJyZW50UGxheWVyKSAtPlxuICAgIHJldHVybiBAcGFzcyh7J2lkJzpjdXJyZW50UGxheWVyLmlkfSlcblxuICBlYXJuOiAoaWQpIC0+XG4gICAgaWYgQGFjaC5lYXJuZWRbaWRdXG4gICAgICByZXR1cm5cbiAgICBhY2hpZXZlbWVudCA9IGFjaGlldmVtZW50c01hcFtpZF1cbiAgICBpZiBub3QgYWNoaWV2ZW1lbnQ/XG4gICAgICByZXR1cm5cblxuICAgIEBhY2guZWFybmVkW2lkXSA9IHRydWVcbiAgICBAb3V0cHV0KFwiRWFybmVkOiAje2FjaGlldmVtZW50LnRpdGxlfVwiKVxuICAgIEBmYW5mYXJlcy5wdXNoIGFjaGlldmVtZW50LnRpdGxlXG5cblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIEFJXG5cbiAgIyBHZW5lcmljIGxvZ2dpbmcgZnVuY3Rpb247IHByZXBlbmRzIGN1cnJlbnQgQUkgcGxheWVyJ3MgZ3V0cyBiZWZvcmUgcHJpbnRpbmcgdGV4dFxuICBhaUxvZzogKHRleHQpIC0+XG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcbiAgICBpZiBub3QgY3VycmVudFBsYXllci5haVxuICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICBjaGFyYWN0ZXIgPSBhaUNoYXJhY3RlcnNbY3VycmVudFBsYXllci5jaGFySURdXG4gICAgQGdhbWUubG9nKCdBSVsnK2N1cnJlbnRQbGF5ZXIubmFtZSsnICcrY2hhcmFjdGVyLmJyYWluKyddOiBoYW5kOicrY2FyZHNUb1N0cmluZyhjdXJyZW50UGxheWVyLmhhbmQpKycgcGlsZTonK2NhcmRzVG9TdHJpbmcoQHBpbGUpKycgJyt0ZXh0KVxuXG4gICMgRGV0ZWN0cyBpZiB0aGUgY3VycmVudCBwbGF5ZXIgaXMgQUkgZHVyaW5nIGEgQklEIG9yIFRSSUNLIHBoYXNlIGFuZCBhY3RzIGFjY29yZGluZyB0byB0aGVpciAnYnJhaW4nXG4gIGFpVGljazogLT5cbiAgICBpZiBAZ2FtZU92ZXIoKVxuICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICBpZiBAZW50aXJlVGFibGVQYXNzZWQoKVxuICAgICAgQHR1cm4gPSBAcGxheWVyQWZ0ZXIoQHBpbGVXaG8pXG4gICAgICBAdW5wYXNzQWxsKClcbiAgICAgIEBjdXJyZW50UGxheSA9IG51bGxcbiAgICAgIEBvdXRwdXQoJ1dob2xlIHRhYmxlIHBhc3NlcywgY29udHJvbCB0byAnICsgQHBsYXllcnNbQHR1cm5dLm5hbWUpXG5cbiAgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxuICAgIGlmIG5vdCBjdXJyZW50UGxheWVyLmFpXG4gICAgICBpZiBAZ2FtZS5vcHRpb25zLmF1dG9wYXNzSW5kZXggIT0gMCAjIE5vdCBkaXNhYmxlZFxuICAgICAgICBpZiBub3QgQGNhblRocm93QW55dGhpbmcoKVxuICAgICAgICAgIGlmIEBjdXJyZW50UGxheSBhbmQgKEBjdXJyZW50UGxheS50eXBlID09ICdraW5kMScpIGFuZCAoQGN1cnJlbnRQbGF5LmhpZ2ggPj0gNDgpIGFuZCBAaGFzQnJlYWtlcihjdXJyZW50UGxheWVyLmhhbmQpXG4gICAgICAgICAgICAjIGRvIG5vdGhpbmcsIHBsYXllciBjYW4gZHJvcCBhIGJyZWFrZXJcbiAgICAgICAgICBlbHNlIGlmIEBjdXJyZW50UGxheSBhbmQgbm90IEBoYXNQbGF5KEBjdXJyZW50UGxheSwgY3VycmVudFBsYXllci5oYW5kKVxuICAgICAgICAgICAgQGFpTG9nKFwiYXV0b3Bhc3NpbmcgZm9yIHBsYXllciwgbm8gcGxheXNcIilcbiAgICAgICAgICAgIEBhaVBhc3MoY3VycmVudFBsYXllcilcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgZWxzZSBpZiBjdXJyZW50UGxheWVyLnBhc3NcbiAgICAgICAgICAgIEBhaUxvZyhcImF1dG9wYXNzaW5nIGZvciBwbGF5ZXJcIilcbiAgICAgICAgICAgIEBhaVBhc3MoY3VycmVudFBsYXllcilcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICByZXR1cm4gZmFsc2VcblxuICAgIGNoYXJhY3RlciA9IGFpQ2hhcmFjdGVyc1tjdXJyZW50UGxheWVyLmNoYXJJRF1cbiAgICByZXQgPSBAYnJhaW5zW2NoYXJhY3Rlci5icmFpbl0ucGxheS5hcHBseSh0aGlzLCBbY3VycmVudFBsYXllciwgQGN1cnJlbnRQbGF5LCBAZXZlcnlvbmVQYXNzZWQoKV0pXG4gICAgaWYgcmV0ID09IE9LXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIHJldHVybiBmYWxzZVxuXG4gIGFsQ2FsY0tpbmRzOiAoaGFuZCwgcGxheXMsIG1hdGNoMnMgPSBmYWxzZSkgLT5cbiAgICBjYXJkcyA9IGhhbmQubWFwIChyYXcpIC0+IG5ldyBDYXJkKHJhdylcbiAgICBjYXJkcyA9IGNhcmRzLnNvcnQgKGEsIGIpIC0+IHJldHVybiBhLnJhdyAtIGIucmF3XG4gICAgdmFsdWVBcnJheXMgPSBbXVxuICAgIGZvciBpIGluIFswLi4uMTNdXG4gICAgICB2YWx1ZUFycmF5cy5wdXNoIFtdXG4gICAgZm9yIGNhcmQgaW4gY2FyZHNcbiAgICAgIHZhbHVlQXJyYXlzW2NhcmQudmFsdWVdLnB1c2goY2FyZClcblxuICAgIGhhbmQgPSBbXVxuICAgIGZvciB2YWx1ZUFycmF5LCB2YWx1ZSBpbiB2YWx1ZUFycmF5c1xuICAgICAgaWYgKHZhbHVlQXJyYXkubGVuZ3RoID4gMSkgYW5kIChtYXRjaDJzIG9yICh2YWx1ZSA8IDEyKSlcbiAgICAgICAga2V5ID0gXCJraW5kI3t2YWx1ZUFycmF5Lmxlbmd0aH1cIlxuICAgICAgICBwbGF5c1trZXldID89IFtdXG4gICAgICAgIHBsYXlzW2tleV0ucHVzaCB2YWx1ZUFycmF5Lm1hcCAodikgLT4gdi5yYXdcbiAgICAgIGVsc2VcbiAgICAgICAgZm9yIHYgaW4gdmFsdWVBcnJheVxuICAgICAgICAgIGhhbmQucHVzaCB2LnJhd1xuXG4gICAgcmV0dXJuIGhhbmRcblxuICBhaUZpbmRSdW5zOiAoaGFuZCwgZWFjaFNpemUsIHNpemUsIHByZWZlclN0cm9uZ1J1bnMgPSBmYWxzZSkgLT5cbiAgICBydW5zID0gW11cblxuICAgIGNhcmRzID0gaGFuZC5tYXAgKHJhdykgLT4gbmV3IENhcmQocmF3KVxuICAgIGNhcmRzID0gY2FyZHMuc29ydCAoYSwgYikgLT4gcmV0dXJuIGEucmF3IC0gYi5yYXdcbiAgICB2YWx1ZUFycmF5cyA9IFtdXG4gICAgZm9yIGkgaW4gWzAuLi4xM11cbiAgICAgIHZhbHVlQXJyYXlzLnB1c2ggW11cbiAgICBmb3IgY2FyZCBpbiBjYXJkc1xuICAgICAgdmFsdWVBcnJheXNbY2FyZC52YWx1ZV0ucHVzaChjYXJkKVxuXG4gICAgaWYgcHJlZmVyU3Ryb25nUnVuc1xuICAgICAgZmlyc3RTdGFydGluZ1ZhbHVlID0gMTIgLSBzaXplXG4gICAgICBsYXN0U3RhcnRpbmdWYWx1ZSA9IDBcbiAgICAgIGJ5QW1vdW50ID0gLTFcbiAgICBlbHNlXG4gICAgICBmaXJzdFN0YXJ0aW5nVmFsdWUgPSAwXG4gICAgICBsYXN0U3RhcnRpbmdWYWx1ZSA9IDEyIC0gc2l6ZVxuICAgICAgYnlBbW91bnQgPSAxXG4gICAgZm9yIHN0YXJ0aW5nVmFsdWUgaW4gW2ZpcnN0U3RhcnRpbmdWYWx1ZS4ubGFzdFN0YXJ0aW5nVmFsdWVdIGJ5IGJ5QW1vdW50XG4gICAgICBydW5Gb3VuZCA9IHRydWVcbiAgICAgIGZvciBvZmZzZXQgaW4gWzAuLi5zaXplXVxuICAgICAgICBpZiB2YWx1ZUFycmF5c1tzdGFydGluZ1ZhbHVlK29mZnNldF0ubGVuZ3RoIDwgZWFjaFNpemVcbiAgICAgICAgICBydW5Gb3VuZCA9IGZhbHNlXG4gICAgICAgICAgYnJlYWtcbiAgICAgIGlmIHJ1bkZvdW5kXG4gICAgICAgIHJ1biA9IFtdXG4gICAgICAgIGZvciBvZmZzZXQgaW4gWzAuLi5zaXplXVxuICAgICAgICAgIGZvciBlYWNoIGluIFswLi4uZWFjaFNpemVdXG4gICAgICAgICAgICBydW4ucHVzaCh2YWx1ZUFycmF5c1tzdGFydGluZ1ZhbHVlK29mZnNldF0ucG9wKCkucmF3KVxuICAgICAgICBydW5zLnB1c2ggcnVuXG5cbiAgICBsZWZ0b3ZlcnMgPSBbXVxuICAgIGZvciB2YWx1ZUFycmF5IGluIHZhbHVlQXJyYXlzXG4gICAgICBmb3IgY2FyZCBpbiB2YWx1ZUFycmF5XG4gICAgICAgIGxlZnRvdmVycy5wdXNoIGNhcmQucmF3XG5cbiAgICByZXR1cm4gW3J1bnMsIGxlZnRvdmVyc11cblxuICBhaUNhbGNSdW5zOiAoaGFuZCwgcGxheXMsIHNtYWxsUnVucywgc2luZ2xlU2l6ZSA9IG51bGwpIC0+XG4gICAgaWYgc2luZ2xlU2l6ZSAhPSBudWxsXG4gICAgICBwcmVmZXJTdHJvbmdSdW5zID0gdHJ1ZVxuICAgICAgc3RhcnRTaXplID0gc2luZ2xlU2l6ZVxuICAgICAgZW5kU2l6ZSA9IHNpbmdsZVNpemVcbiAgICAgIGJ5QW1vdW50ID0gMVxuICAgIGVsc2VcbiAgICAgIHByZWZlclN0cm9uZ1J1bnMgPSBmYWxzZVxuICAgICAgaWYgc21hbGxSdW5zXG4gICAgICAgIHN0YXJ0U2l6ZSA9IDNcbiAgICAgICAgZW5kU2l6ZSA9IDEyXG4gICAgICAgIGJ5QW1vdW50ID0gMVxuICAgICAgZWxzZVxuICAgICAgICBzdGFydFNpemUgPSAxMlxuICAgICAgICBlbmRTaXplID0gM1xuICAgICAgICBieUFtb3VudCA9IC0xXG4gICAgZm9yIHJ1blNpemUgaW4gW3N0YXJ0U2l6ZS4uZW5kU2l6ZV0gYnkgYnlBbW91bnRcbiAgICAgIFtydW5zLCBsZWZ0b3ZlcnNdID0gQGFpRmluZFJ1bnMoaGFuZCwgMSwgcnVuU2l6ZSwgcHJlZmVyU3Ryb25nUnVucylcbiAgICAgIGlmIHJ1bnMubGVuZ3RoID4gMFxuICAgICAgICBrZXkgPSBcInJ1biN7cnVuU2l6ZX1cIlxuICAgICAgICBwbGF5c1trZXldID0gcnVuc1xuICAgICAgaGFuZCA9IGxlZnRvdmVyc1xuXG4gICAgcmV0dXJuIGhhbmRcblxuICBhaUNhbGNSb3BzOiAoaGFuZCwgcGxheXMsIHNpbmdsZVNpemUgPSBudWxsKSAtPlxuICAgIGlmIHNpbmdsZVNpemUgIT0gbnVsbFxuICAgICAgcHJlZmVyU3Ryb25nUnVucyA9IHRydWVcbiAgICAgIHN0YXJ0U2l6ZSA9IHNpbmdsZVNpemVcbiAgICAgIGVuZFNpemUgPSBzaW5nbGVTaXplXG4gICAgZWxzZVxuICAgICAgcHJlZmVyU3Ryb25nUnVucyA9IGZhbHNlXG4gICAgICBzdGFydFNpemUgPSAzXG4gICAgICBlbmRTaXplID0gNlxuICAgIGZvciBydW5TaXplIGluIFtzdGFydFNpemUuLmVuZFNpemVdXG4gICAgICBbcm9wcywgbGVmdG92ZXJzXSA9IEBhaUZpbmRSdW5zKGhhbmQsIDIsIHJ1blNpemUsIHByZWZlclN0cm9uZ1J1bnMpXG4gICAgICBpZiByb3BzLmxlbmd0aCA+IDBcbiAgICAgICAga2V5ID0gXCJyb3Aje3J1blNpemV9XCJcbiAgICAgICAgcGxheXNba2V5XSA9IHJvcHNcbiAgICAgIGhhbmQgPSBsZWZ0b3ZlcnNcblxuICAgIHJldHVybiBoYW5kXG5cbiAgYWlDYWxjUGxheXM6IChoYW5kLCBzdHJhdGVneSA9IHt9KSAtPlxuICAgIHBsYXlzID0ge31cblxuICAgICMgV2UgYWx3YXlzIHdhbnQgdG8gdXNlIHJvcHMgaWYgd2UgaGF2ZSBvbmVcbiAgICBpZiBzdHJhdGVneS5zZWVzUm9wc1xuICAgICAgaGFuZCA9IEBhaUNhbGNSb3BzKGhhbmQsIHBsYXlzKVxuXG4gICAgaWYgc3RyYXRlZ3kucHJlZmVyc1J1bnNcbiAgICAgIGhhbmQgPSBAYWlDYWxjUnVucyhoYW5kLCBwbGF5cywgc3RyYXRlZ3kuc21hbGxSdW5zKVxuICAgICAgaGFuZCA9IEBhbENhbGNLaW5kcyhoYW5kLCBwbGF5cywgc3RyYXRlZ3kubWF0Y2gycylcbiAgICBlbHNlXG4gICAgICBoYW5kID0gQGFsQ2FsY0tpbmRzKGhhbmQsIHBsYXlzLCBzdHJhdGVneS5tYXRjaDJzKVxuICAgICAgaGFuZCA9IEBhaUNhbGNSdW5zKGhhbmQsIHBsYXlzLCBzdHJhdGVneS5zbWFsbFJ1bnMpXG5cbiAgICBraW5kMSA9IGhhbmQubWFwICh2KSAtPiBbdl1cbiAgICBpZiBraW5kMS5sZW5ndGggPiAwXG4gICAgICBwbGF5cy5raW5kMSA9IGtpbmQxXG4gICAgcmV0dXJuIHBsYXlzXG5cbiAgbnVtYmVyT2ZTaW5nbGVzOiAocGxheXMpIC0+XG4gICAgaWYgbm90IHBsYXlzLmtpbmQxP1xuICAgICAgcmV0dXJuIDBcbiAgICBub25Ud29TaW5nbGVzID0gMFxuICAgIGZvciByYXcgaW4gcGxheXMua2luZDFcbiAgICAgIGlmIHJhdyA8IDQ4XG4gICAgICAgIG5vblR3b1NpbmdsZXMgKz0gMVxuICAgIHJldHVybiBub25Ud29TaW5nbGVzXG5cbiAgYnJlYWtlclBsYXlzOiAoaGFuZCkgLT5cbiAgICByZXR1cm4gQGFpQ2FsY1BsYXlzKGhhbmQsIHsgc2Vlc1JvcHM6IHRydWUsIHByZWZlcnNSdW5zOiBmYWxzZSB9KVxuXG4gIGlzQnJlYWtlclR5cGU6IChwbGF5VHlwZSkgLT5cbiAgICBpZiBwbGF5VHlwZS5tYXRjaCgvXnJvcC8pIG9yIHBsYXlUeXBlID09ICdraW5kNCdcbiAgICAgIHJldHVybiB0cnVlXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgY2FuQmVCcm9rZW46IChwbGF5KSAtPlxuICAgIGlmIHBsYXkudHlwZSAhPSAna2luZDEnXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICBjYXJkID0gbmV3IENhcmQocGxheS5oaWdoKVxuICAgIHJldHVybiAoY2FyZC52YWx1ZSA9PSAxMilcblxuICBoYXNCcmVha2VyOiAoaGFuZCkgLT5cbiAgICBwbGF5cyA9IEBicmVha2VyUGxheXMoaGFuZClcbiAgICBmb3IgcGxheVR5cGUsIHBsYXlsaXN0IG9mIHBsYXlzXG4gICAgICBpZiBAaXNCcmVha2VyVHlwZShwbGF5VHlwZSlcbiAgICAgICAgaWYgcGxheWxpc3QubGVuZ3RoID4gMFxuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgaXNSdW5UeXBlOiAocGxheVR5cGUpIC0+XG4gICAgaWYgcGxheVR5cGUubWF0Y2goL15ydW4vKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICByZXR1cm4gZmFsc2VcblxuICBpc1N1aXRlZDogKGhhbmQpIC0+XG4gICAgaWYgaGFuZC5sZW5ndGggPCAxXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICBjYXJkcyA9IGhhbmQubWFwIChyYXcpIC0+IG5ldyBDYXJkKHJhdylcbiAgICBzdWl0ID0gY2FyZHNbMF0uc3VpdFxuICAgIGZvciBjYXJkIGluIGNhcmRzXG4gICAgICBpZiBjYXJkLnN1aXQgIT0gc3VpdFxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICByZXR1cm4gdHJ1ZVxuXG4gIGlzQmlnUnVuOiAocGxheSwgYXRMZWFzdCkgLT5cbiAgICBpZiBtYXRjaGVzID0gcGxheS50eXBlLm1hdGNoKC9ecnVuKFxcZCspLylcbiAgICAgIGxlbiA9IHBhcnNlSW50KG1hdGNoZXNbMV0pXG4gICAgICBpZiBsZW4gPj0gYXRMZWFzdFxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIHJldHVybiBmYWxzZVxuXG4gIGFpQ2FsY0Jlc3RQbGF5czogKGhhbmQpIC0+XG4gICAgYmVzdFBsYXlzID0gbnVsbFxuICAgIGZvciBiaXRzIGluIFswLi4uMTZdXG4gICAgICBzdHJhdGVneSA9XG4gICAgICAgIHNtYWxsUnVuczogKGJpdHMgJiAxKSA9PSAxXG4gICAgICAgIHByZWZlcnNSdW5zOiAoYml0cyAmIDIpID09IDJcbiAgICAgICAgbWF0Y2gyczogKGJpdHMgJiA0KSA9PSA0XG4gICAgICAgIHNlZXNSb3BzOiAoYml0cyAmIDgpID09IDhcbiAgICAgIHBsYXlzID0gQGFpQ2FsY1BsYXlzKGhhbmQsIHN0cmF0ZWd5KVxuICAgICAgaWYgYmVzdFBsYXlzID09IG51bGxcbiAgICAgICAgYmVzdFBsYXlzID0gcGxheXNcbiAgICAgIGVsc2VcbiAgICAgICAgbnAgPSBAbnVtYmVyT2ZTaW5nbGVzKHBsYXlzKVxuICAgICAgICBuYnAgPSBAbnVtYmVyT2ZTaW5nbGVzKGJlc3RQbGF5cylcbiAgICAgICAgaWYgbnAgPCBuYnBcbiAgICAgICAgICBiZXN0UGxheXMgPSBwbGF5c1xuICAgICAgICBlbHNlIGlmIG5wID09IG5icFxuICAgICAgICAgICMgZmxpcCBhIGNvaW4hXG4gICAgICAgICAgaWYgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMikgPT0gMFxuICAgICAgICAgICAgYmVzdFBsYXlzID0gcGxheXNcbiAgICByZXR1cm4gYmVzdFBsYXlzXG5cbiAgcHJldHR5UGxheXM6IChwbGF5cywgZXh0cmFQcmV0dHkgPSBmYWxzZSkgLT5cbiAgICBwcmV0dHkgPSB7fVxuICAgIGZvciB0eXBlLCBhcnIgb2YgcGxheXNcbiAgICAgIHByZXR0eVt0eXBlXSA9IFtdXG4gICAgICBmb3IgcGxheSBpbiBhcnJcbiAgICAgICAgbmFtZXMgPSBbXVxuICAgICAgICBmb3IgcmF3IGluIHBsYXlcbiAgICAgICAgICBjYXJkID0gbmV3IENhcmQocmF3KVxuICAgICAgICAgIG5hbWVzLnB1c2goY2FyZC5uYW1lKVxuICAgICAgICBwcmV0dHlbdHlwZV0ucHVzaChuYW1lcylcbiAgICBpZiBleHRyYVByZXR0eVxuICAgICAgcyA9IFwiXCJcbiAgICAgIGZvciB0eXBlTmFtZSwgdGhyb3dzIG9mIHByZXR0eVxuICAgICAgICBzICs9IFwiICAgICAgKiAje3BsYXlUeXBlVG9TdHJpbmcodHlwZU5hbWUpfTpcXG5cIlxuICAgICAgICBpZiB0eXBlTmFtZSA9PSAna2luZDEnXG4gICAgICAgICAgcyArPSBcIiAgICAgICAgKiAje3Rocm93cy5tYXAoKHYpIC0+IHZbMF0pLmpvaW4oJywnKX1cXG5cIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgZm9yIHQgaW4gdGhyb3dzXG4gICAgICAgICAgICBzICs9IFwiICAgICAgICAqICN7dC5qb2luKCcsJyl9XFxuXCJcbiAgICAgIHJldHVybiBzXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHByZXR0eSlcblxuICBoaWdoZXN0Q2FyZDogKHBsYXkpIC0+XG4gICAgaGlnaGVzdCA9IDBcbiAgICBmb3IgcCBpbiBwbGF5XG4gICAgICBpZiBoaWdoZXN0IDwgcFxuICAgICAgICBoaWdoZXN0ID0gcFxuICAgIHJldHVybiBoaWdoZXN0XG5cbiAgZmluZFBsYXlXaXRoM1M6IChwbGF5cykgLT5cbiAgICBmb3IgcGxheVR5cGUsIHBsYXlsaXN0IG9mIHBsYXlzXG4gICAgICBmb3IgcGxheSBpbiBwbGF5bGlzdFxuICAgICAgICBpZiBAaGFuZEhhczNTKHBsYXkpXG4gICAgICAgICAgcmV0dXJuIHBsYXlcblxuICAgIGNvbnNvbGUubG9nIFwiZmluZFBsYXlXaXRoM1M6IHNvbWV0aGluZyBpbXBvc3NpYmxlIGlzIGhhcHBlbmluZ1wiXG4gICAgcmV0dXJuIFtdXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEFJIEJyYWluc1xuXG4gICMgQnJhaW5zIG11c3QgaGF2ZTpcbiAgIyAqIGlkOiBpbnRlcm5hbCBpZGVudGlmaWVyIGZvciB0aGUgYnJhaW5cbiAgIyAqIG5hbWU6IHByZXR0eSBuYW1lXG4gICMgKiBwbGF5KGN1cnJlbnRQbGF5ZXIpIGF0dGVtcHRzIHRvIHBsYXkgYSBjYXJkIGJ5IGNhbGxpbmcgYWlQbGF5KCkuIFNob3VsZCByZXR1cm4gdHJ1ZSBpZiBpdCBzdWNjZXNzZnVsbHkgcGxheWVkIGEgY2FyZCAoYWlQbGF5KCkgcmV0dXJuZWQgdHJ1ZSlcbiAgYnJhaW5zOlxuXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAjIE5vcm1hbDogSW50ZW5kZWQgdG8gYmUgdXNlZCBieSBtb3N0IGNoYXJhY3RlcnMuXG4gICAgIyAgICAgICAgIE5vdCB0b28gZHVtYiwgbm90IHRvbyBzbWFydC5cbiAgICBub3JtYWw6XG4gICAgICBpZDogICBcIm5vcm1hbFwiXG4gICAgICBuYW1lOiBcIk5vcm1hbFwiXG5cbiAgICAgICMgbm9ybWFsXG4gICAgICBwbGF5OiAoY3VycmVudFBsYXllciwgY3VycmVudFBsYXksIGV2ZXJ5b25lUGFzc2VkKSAtPlxuICAgICAgICBpZiBjdXJyZW50UGxheWVyLnBhc3NcbiAgICAgICAgICBpZiBAY2FuQmVCcm9rZW4oY3VycmVudFBsYXkpIGFuZCBAaGFzQnJlYWtlcihjdXJyZW50UGxheWVyLmhhbmQpXG4gICAgICAgICAgICBicmVha2VyUGxheXMgPSBAYnJlYWtlclBsYXlzKGN1cnJlbnRQbGF5ZXIuaGFuZClcbiAgICAgICAgICAgIGZvciBwbGF5VHlwZSwgcGxheWxpc3Qgb2YgYnJlYWtlclBsYXlzXG4gICAgICAgICAgICAgIGlmIChwbGF5VHlwZS5tYXRjaCgvXnJvcC8pIG9yIChwbGF5VHlwZSA9PSAna2luZDQnKSkgYW5kIChwbGF5bGlzdC5sZW5ndGggPiAwKVxuICAgICAgICAgICAgICAgIEBhaUxvZyhcImJyZWFraW5nIDJcIilcbiAgICAgICAgICAgICAgICBpZiBAYWlQbGF5KGN1cnJlbnRQbGF5ZXIsIHBsYXlsaXN0WzBdKSA9PSBPS1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIE9LXG5cbiAgICAgICAgICBAYWlMb2coXCJhbHJlYWR5IHBhc3NlZCwgZ29pbmcgdG8ga2VlcCBwYXNzaW5nXCIpXG4gICAgICAgICAgcmV0dXJuIEBhaVBhc3MoY3VycmVudFBsYXllcilcblxuICAgICAgICBwbGF5cyA9IEBhaUNhbGNCZXN0UGxheXMoY3VycmVudFBsYXllci5oYW5kKVxuICAgICAgICBAYWlMb2coXCJiZXN0IHBsYXlzOiAje0BwcmV0dHlQbGF5cyhwbGF5cyl9XCIpXG5cbiAgICAgICAgaWYgQHBpbGUubGVuZ3RoID09IDBcbiAgICAgICAgICBwbGF5ID0gQGZpbmRQbGF5V2l0aDNTKHBsYXlzKVxuICAgICAgICAgIEBhaUxvZyhcIlRocm93aW5nIG15IHBsYXkgd2l0aCB0aGUgM1MgaW4gaXRcIilcbiAgICAgICAgICBpZiBAYWlQbGF5KGN1cnJlbnRQbGF5ZXIsIHBsYXkpID09IE9LXG4gICAgICAgICAgICByZXR1cm4gT0tcblxuICAgICAgICBpZiBjdXJyZW50UGxheSBhbmQgbm90IGV2ZXJ5b25lUGFzc2VkXG4gICAgICAgICAgaWYgcGxheXNbY3VycmVudFBsYXkudHlwZV0/IGFuZCAocGxheXNbY3VycmVudFBsYXkudHlwZV0ubGVuZ3RoID4gMClcbiAgICAgICAgICAgIGZvciBwbGF5IGluIHBsYXlzW2N1cnJlbnRQbGF5LnR5cGVdXG4gICAgICAgICAgICAgIGlmIEBoaWdoZXN0Q2FyZChwbGF5KSA+IGN1cnJlbnRQbGF5LmhpZ2hcbiAgICAgICAgICAgICAgICBpZiBAYWlQbGF5KGN1cnJlbnRQbGF5ZXIsIHBsYXkpID09IE9LXG4gICAgICAgICAgICAgICAgICByZXR1cm4gT0tcbiAgICAgICAgICAgIEBhaUxvZyhcIkkgZ3Vlc3MgSSBjYW4ndCBhY3R1YWxseSBiZWF0IHRoaXMsIHBhc3NpbmdcIilcbiAgICAgICAgICAgIHJldHVybiBAYWlQYXNzKGN1cnJlbnRQbGF5ZXIpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGFpTG9nKFwiSSBkb24ndCBoYXZlIHRoYXQgcGxheSwgcGFzc2luZ1wiKVxuICAgICAgICAgICAgcmV0dXJuIEBhaVBhc3MoY3VycmVudFBsYXllcilcbiAgICAgICAgZWxzZVxuICAgICAgICAgICMgbm8gY3VycmVudCBwbGF5LCB0aHJvdyB0aGUgZmlyc3QgY2FyZFxuICAgICAgICAgIEBhaUxvZyhcIkkgY2FuIGRvIGFueXRoaW5nLCB0aHJvd2luZyBhIHJhbmRvbSBwbGF5XCIpXG4gICAgICAgICAgcGxheVR5cGVzID0gT2JqZWN0LmtleXMocGxheXMpXG4gICAgICAgICAgcGxheVR5cGVJbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHBsYXlUeXBlcy5sZW5ndGgpXG4gICAgICAgICAgaWYgQGFpUGxheShjdXJyZW50UGxheWVyLCBwbGF5c1twbGF5VHlwZXNbcGxheVR5cGVJbmRleF1dWzBdKSA9PSBPS1xuICAgICAgICAgICAgcmV0dXJuIE9LXG5cbiAgICAgICAgIyBmaW5kIHRoZSBmaXJzdCBjYXJkIHRoYXQgYmVhdHMgdGhlIGN1cnJlbnRQbGF5J3MgaGlnaFxuICAgICAgICBmb3IgcmF3Q2FyZCBpbiBjdXJyZW50UGxheWVyLmhhbmRcbiAgICAgICAgICBpZiByYXdDYXJkID4gY3VycmVudFBsYXkuaGlnaFxuICAgICAgICAgICAgQGFpTG9nKFwiZm91bmQgc21hbGxlc3Qgc2luZ2xlICgje3Jhd0NhcmR9KSwgcGxheWluZ1wiKVxuICAgICAgICAgICAgaWYgQGFpUGxheShjdXJyZW50UGxheWVyLCBbcmF3Q2FyZF0pID09IE9LXG4gICAgICAgICAgICAgIHJldHVybiBPS1xuICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICBAYWlMb2coXCJub3RoaW5nIGVsc2UgdG8gZG8sIHBhc3NpbmdcIilcbiAgICAgICAgcmV0dXJuIEBhaVBhc3MoY3VycmVudFBsYXllcilcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgRGVidWcgY29kZVxuXG5kZWJ1ZyA9IC0+XG4gIHRoaXIgPSBuZXcgVGhpcnRlZW4oKVxuICBmdWxseVBsYXllZCA9IDBcbiAgdG90YWxBdHRlbXB0cyA9IDEwMFxuXG4gIGZvciBhdHRlbXB0IGluIFswLi4udG90YWxBdHRlbXB0c11cbiAgICBkZWNrID0gbmV3IFNodWZmbGVkRGVjaygpXG4gICAgaGFuZCA9IFtdXG4gICAgZm9yIGogaW4gWzAuLi4xM11cbiAgICAgIHJhdyA9IGRlY2suY2FyZHMuc2hpZnQoKVxuICAgICAgaGFuZC5wdXNoKHJhdylcbiAgICAjIGhhbmQgPSBbNTEsNTAsNDksNDgsNDcsNDYsNDUsNDQsNDMsNDIsNDEsNDAsMzldXG4gICAgIyBoYW5kID0gWzAsMSwyLDMsNCw1LDYsNyw4LDksMTAsMTEsMTJdXG4gICAgaGFuZC5zb3J0IChhLGIpIC0+IHJldHVybiBhIC0gYlxuXG4gICAgY29uc29sZS5sb2coXCItLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cIilcbiAgICBjb25zb2xlLmxvZyhcIkhhbmQgI3thdHRlbXB0KzF9OiAje2NhcmRzVG9TdHJpbmcoaGFuZCl9XCIpXG4gICAgY29uc29sZS5sb2coXCJcIilcblxuICAgIGZvdW5kRnVsbHlQbGF5ZWQgPSBmYWxzZVxuICAgIGZvciBiaXRzIGluIFswLi4uMTZdXG4gICAgICBzdHJhdGVneSA9XG4gICAgICAgIHNtYWxsUnVuczogKGJpdHMgJiAxKSA9PSAxXG4gICAgICAgIHByZWZlcnNSdW5zOiAoYml0cyAmIDIpID09IDJcbiAgICAgICAgbWF0Y2gyczogKGJpdHMgJiA0KSA9PSA0XG4gICAgICAgIHNlZXNSb3BzOiAoYml0cyAmIDgpID09IDhcbiAgICAgIHBsYXlzID0gdGhpci5haUNhbGNQbGF5cyhoYW5kLCBzdHJhdGVneSlcblxuICAgICAgY29uc29sZS5sb2coXCIgICAqIFN0cmF0ZWd5OiAje0pTT04uc3RyaW5naWZ5KHN0cmF0ZWd5KX1cIilcbiAgICAgIGNvbnNvbGUubG9nKHRoaXIucHJldHR5UGxheXMocGxheXMsIHRydWUpKVxuXG4gICAgICBpZiBub3QgcGxheXMua2luZDFcbiAgICAgICAgZm91bmRGdWxseVBsYXllZCA9IHRydWVcblxuICAgIGlmIGZvdW5kRnVsbHlQbGF5ZWRcbiAgICAgIGZ1bGx5UGxheWVkICs9IDFcblxuICBjb25zb2xlLmxvZyBcImZ1bGx5UGxheWVkOiAje2Z1bGx5UGxheWVkfSAvICN7dG90YWxBdHRlbXB0c31cIlxuXG4jICAgICAgSCAgRCAgQyAgU1xuIyAgMjogNTEgNTAgNDkgNDhcbiMgIEE6IDQ3IDQ2IDQ1IDQ0XG4jICBLOiA0MyA0MiA0MSA0MFxuIyAgUTogMzkgMzggMzcgMzZcbiMgIEo6IDM1IDM0IDMzIDMyXG4jIDEwOiAzMSAzMCAyOSAyOFxuIyAgOTogMjcgMjYgMjUgMjRcbiMgIDg6IDIzIDIyIDIxIDIwXG4jICA3OiAxOSAxOCAxNyAxNlxuIyAgNjogMTUgMTQgMTMgMTJcbiMgIDU6IDExIDEwICA5ICA4XG4jICA0OiAgNyAgNiAgNSAgNFxuIyAgMzogIDMgIDIgIDEgIDBcblxuZGVidWcyID0gLT5cbiAgZ2FtZSA9XG4gICAgb3B0aW9uczpcbiAgICAgIGF1dG9wYXNzSW5kZXg6IDFcbiAgdGhpciA9IG5ldyBUaGlydGVlbihnYW1lKVxuICBjdXJyZW50UGxheSA9XG4gICAgdHlwZTogJ3J1bjMnXG4gICAgaGlnaDogMjZcbiAgaGFuZCA9IFtcbiAgICAxMCwgMTEsIDE1LCAxOSwgMjMsIDI3XG4gIF1cbiAgY29uc29sZS5sb2cgdGhpci5oYXNQbGF5KGN1cnJlbnRQbGF5LCBoYW5kKVxuXG5cbiMgZGVidWcoKVxuIyBkZWJ1ZzIoKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBFeHBvcnRzXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgQ2FyZDogQ2FyZFxuICBUaGlydGVlbjogVGhpcnRlZW5cbiAgT0s6IE9LXG4gIGFpQ2hhcmFjdGVyczogYWlDaGFyYWN0ZXJzXG4gIGFjaGlldmVtZW50c0xpc3Q6IGFjaGlldmVtZW50c0xpc3RcbiAgYWNoaWV2ZW1lbnRzTWFwOiBhY2hpZXZlbWVudHNNYXBcbiIsIm1vZHVsZS5leHBvcnRzID1cbiAgZGFya2ZvcmVzdDpcbiAgICBoZWlnaHQ6IDcyXG4gICAgZ2x5cGhzOlxuICAgICAgJzk3JyA6IHsgeDogICA4LCB5OiAgIDgsIHdpZHRoOiAgMzQsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnOTgnIDogeyB4OiAgIDgsIHk6ICA1OCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICc5OScgOiB7IHg6ICA1MCwgeTogICA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzEwMCc6IHsgeDogICA4LCB5OiAxMTgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnMTAxJzogeyB4OiAgIDgsIHk6IDE3OCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICcxMDInOiB7IHg6ICAgOCwgeTogMjI4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzMgfVxuICAgICAgJzEwMyc6IHsgeDogICA4LCB5OiAyNzgsIHdpZHRoOiAgMzYsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNSB9XG4gICAgICAnMTA0JzogeyB4OiAgIDgsIHk6IDMyOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICcxMDUnOiB7IHg6ICAgOCwgeTogMzc4LCB3aWR0aDogIDEyLCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMTEgfVxuICAgICAgJzEwNic6IHsgeDogICA4LCB5OiA0MjgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQxLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnMTA3JzogeyB4OiAgMjgsIHk6IDM3OCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDEsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICcxMDgnOiB7IHg6ICA1MSwgeTogMzI4LCB3aWR0aDogIDM0LCBoZWlnaHQ6ICA0MSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzMgfVxuICAgICAgJzEwOSc6IHsgeDogIDUxLCB5OiA0MjcsIHdpZHRoOiAgMzgsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNyB9XG4gICAgICAnMTEwJzogeyB4OiAgNzEsIHk6IDM3Nywgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICcxMTEnOiB7IHg6ICA5NywgeTogNDI3LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzExMic6IHsgeDogIDUxLCB5OiAgNTgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnMTEzJzogeyB4OiAgNTEsIHk6IDEwOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDUsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICcxMTQnOiB7IHg6ICA5MywgeTogICA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzUgfVxuICAgICAgJzExNSc6IHsgeDogIDUxLCB5OiAxNjEsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNSB9XG4gICAgICAnMTE2JzogeyB4OiAgNTEsIHk6IDIxMSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDMzIH1cbiAgICAgICcxMTcnOiB7IHg6ICA1MiwgeTogMjYxLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzExOCc6IHsgeDogIDkzLCB5OiAzMTEsIHdpZHRoOiAgMzQsIGhlaWdodDogIDQxLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzMiB9XG4gICAgICAnMTE5JzogeyB4OiAxMTQsIHk6IDM2MCwgd2lkdGg6ICAzOCwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM4IH1cbiAgICAgICcxMjAnOiB7IHg6IDE0MCwgeTogNDEwLCB3aWR0aDogIDM2LCBoZWlnaHQ6ICA0MSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzcgfVxuICAgICAgJzEyMSc6IHsgeDogMTQwLCB5OiA0NTksIHdpZHRoOiAgMzUsIGhlaWdodDogIDQxLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnMTIyJzogeyB4OiAxODMsIHk6IDQ1OSwgd2lkdGg6ICAzNiwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM1IH1cbiAgICAgICc2NScgOiB7IHg6ICA5NCwgeTogIDU4LCB3aWR0aDogIDM0LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxuICAgICAgJzY2JyA6IHsgeDogIDk0LCB5OiAxMTksIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNyB9XG4gICAgICAnNjcnIDogeyB4OiAgOTQsIHk6IDE4MCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cbiAgICAgICc2OCcgOiB7IHg6ICA5NSwgeTogMjQxLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzcgfVxuICAgICAgJzY5JyA6IHsgeDogMTM2LCB5OiAgIDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XG4gICAgICAnNzAnIDogeyB4OiAxMzcsIHk6ICA2OSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICc3MScgOiB7IHg6IDE3OSwgeTogICA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxuICAgICAgJzcyJyA6IHsgeDogMTM3LCB5OiAxMzAsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XG4gICAgICAnNzMnIDogeyB4OiAxMzgsIHk6IDE5MSwgd2lkdGg6ICAxMiwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDEzIH1cbiAgICAgICc3NCcgOiB7IHg6IDEzOCwgeTogMjUyLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxuICAgICAgJzc1JyA6IHsgeDogMTU4LCB5OiAxOTEsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XG4gICAgICAnNzYnIDogeyB4OiAxNjAsIHk6IDMxMywgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICc3NycgOiB7IHg6IDE4MSwgeTogMjUxLCB3aWR0aDogIDM4LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzkgfVxuICAgICAgJzc4JyA6IHsgeDogMTg0LCB5OiAzNzQsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNSB9XG4gICAgICAnNzknIDogeyB4OiAyMDMsIHk6IDMxMiwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM1IH1cbiAgICAgICc4MCcgOiB7IHg6IDE4MCwgeTogIDY5LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzgxJyA6IHsgeDogMjAxLCB5OiAxMzAsIHdpZHRoOiAgMzUsIGhlaWdodDogIDU2LCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNSB9XG4gICAgICAnODInIDogeyB4OiAyMjIsIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cbiAgICAgICc4MycgOiB7IHg6IDIyMywgeTogIDY5LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxuICAgICAgJzg0JyA6IHsgeDogMjY1LCB5OiAgIDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzMyB9XG4gICAgICAnODUnIDogeyB4OiAyMjcsIHk6IDE5NCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM1IH1cbiAgICAgICc4NicgOiB7IHg6IDI0NCwgeTogMTMwLCB3aWR0aDogIDQxLCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMTksIHhhZHZhbmNlOiAgMzkgfVxuICAgICAgJzg3JyA6IHsgeDogMjY2LCB5OiAgNjksIHdpZHRoOiAgMzgsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNyB9XG4gICAgICAnODgnIDogeyB4OiAzMDgsIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDE5LCB4YWR2YW5jZTogIDM1IH1cbiAgICAgICc4OScgOiB7IHg6IDIyNywgeTogMzczLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMTksIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzkwJyA6IHsgeDogMjI3LCB5OiA0MzMsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNSB9XG4gICAgICAnMzMnIDogeyB4OiAyNDYsIHk6IDI1NSwgd2lkdGg6ICAxNCwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDExIH1cbiAgICAgICc1OScgOiB7IHg6IDE4MCwgeTogMTMwLCB3aWR0aDogIDEzLCBoZWlnaHQ6ICAzNywgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNTYsIHhhZHZhbmNlOiAgMTMgfVxuICAgICAgJzM3JyA6IHsgeDogIDk1LCB5OiAzMDIsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XG4gICAgICAnNTgnIDogeyB4OiAxNjAsIHk6IDM3NCwgd2lkdGg6ICAxMywgaGVpZ2h0OiAgMjMsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDUwLCB4YWR2YW5jZTogIDEzIH1cbiAgICAgICc2MycgOiB7IHg6IDI2OCwgeTogMjU1LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzMgfVxuICAgICAgJzQyJyA6IHsgeDogMTAzLCB5OiAzMDIsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XG4gICAgICAnNDAnIDogeyB4OiAyNzAsIHk6IDE5MCwgd2lkdGg6ICAyMywgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDIxIH1cbiAgICAgICc0MScgOiB7IHg6IDI5MywgeTogMTMwLCB3aWR0aDogIDIzLCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMjEgfVxuICAgICAgJzk1JyA6IHsgeDogMTExLCB5OiAzMDIsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XG4gICAgICAnNDMnIDogeyB4OiAyNDYsIHk6IDMxNiwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgMzQsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDM5LCB4YWR2YW5jZTogIDMyIH1cbiAgICAgICc0NScgOiB7IHg6IDE4NCwgeTogNDM1LCB3aWR0aDogIDI2LCBoZWlnaHQ6ICAxMSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgNDQsIHhhZHZhbmNlOiAgMjUgfVxuICAgICAgJzYxJyA6IHsgeDogMzEyLCB5OiAgNjgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDMwLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICA0MiwgeGFkdmFuY2U6ICAzMyB9XG4gICAgICAnNDYnIDogeyB4OiAxMzUsIHk6IDMxMywgd2lkdGg6ICAxNCwgaGVpZ2h0OiAgMTEsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDYxLCB4YWR2YW5jZTogIDE0IH1cbiAgICAgICc0NCcgOiB7IHg6IDIyNywgeTogMjU1LCB3aWR0aDogIDEwLCBoZWlnaHQ6ICAyMSwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNjgsIHhhZHZhbmNlOiAgMTEgfVxuICAgICAgJzQ3JyA6IHsgeDogMzUxLCB5OiAgIDgsIHdpZHRoOiAgMjgsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAxOSwgeGFkdmFuY2U6ICAyNiB9XG4gICAgICAnMTI0JzogeyB4OiAxMTksIHk6IDMwMiwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cbiAgICAgICczNCcgOiB7IHg6IDEyNywgeTogMzAyLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxuICAgICAgJzM5JyA6IHsgeDogMjAxLCB5OiAxOTQsIHdpZHRoOiAgMTgsIGhlaWdodDogIDE5LCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAgMCwgeGFkdmFuY2U6ICAyMSB9XG4gICAgICAnNjQnIDogeyB4OiAyMTgsIHk6IDQzNSwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cbiAgICAgICczNScgOiB7IHg6IDIxOCwgeTogNDQzLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxuICAgICAgJzM2JyA6IHsgeDogMzAxLCB5OiAxOTAsIHdpZHRoOiAgMzIsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAyMiwgeGFkdmFuY2U6ICAyOSB9XG4gICAgICAnOTQnIDogeyB4OiAyMTgsIHk6IDQ1MSwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cbiAgICAgICczOCcgOiB7IHg6IDI0NiwgeTogMzU4LCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxuICAgICAgJzEyMyc6IHsgeDogMzI0LCB5OiAxMDYsIHdpZHRoOiAgMjcsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAyNiB9XG4gICAgICAnMTI1JzogeyB4OiAyNzAsIHk6IDM1OCwgd2lkdGg6ICAyNywgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDI3IH1cbiAgICAgICc5MScgOiB7IHg6IDI3MCwgeTogNDE4LCB3aWR0aDogIDIyLCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMjEgfVxuICAgICAgJzkzJyA6IHsgeDogMzAwLCB5OiA0MTgsIHdpZHRoOiAgMjIsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAyMCB9XG4gICAgICAnNDgnIDogeyB4OiAzMDUsIHk6IDMxNiwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cbiAgICAgICc0OScgOiB7IHg6IDMxMSwgeTogMjUxLCB3aWR0aDogIDM0LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxuICAgICAgJzUwJyA6IHsgeDogMzQxLCB5OiAxNjYsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNyB9XG4gICAgICAnNTEnIDogeyB4OiAzNTksIHk6ICA2OCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cbiAgICAgICc1MicgOiB7IHg6IDMzMCwgeTogMzc3LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxuICAgICAgJzUzJyA6IHsgeDogMzQ4LCB5OiAzMTIsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNyB9XG4gICAgICAnNTQnIDogeyB4OiAzMzAsIHk6IDQzOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cbiAgICAgICc1NScgOiB7IHg6IDM1MywgeTogMjI3LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzU2JyA6IHsgeDogMzg0LCB5OiAxMjksIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XG4gICAgICAnNTcnIDogeyB4OiA0MDIsIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cbiAgICAgICczMicgOiB7IHg6ICAgMCwgeTogICAwLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMjIgfVxuXG4gICAgICAjIGNhcmQgZ2x5cGhzXG4gICAgICAnMjAwJzogeyB4OiAzOTYsIHk6IDM3OCwgd2lkdGg6ICA0MCwgaGVpZ2h0OiAgNDksIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIxLCB4YWR2YW5jZTogIDQzIH0gIyBTXG4gICAgICAnMjAxJzogeyB4OiA0NDcsIHk6IDMxMywgd2lkdGg6ICA0OSwgaGVpZ2h0OiAgNTAsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIxLCB4YWR2YW5jZTogIDUyIH0gIyBDXG4gICAgICAnMjAyJzogeyB4OiAzOTksIHk6IDMxMywgd2lkdGg6ICAzNiwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIxLCB4YWR2YW5jZTogIDM5IH0gIyBEXG4gICAgICAnMjAzJzogeyB4OiA0NTIsIHk6IDM4MSwgd2lkdGg6ICAzOSwgaGVpZ2h0OiAgNDMsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIxLCB4YWR2YW5jZTogIDQyIH0gIyBIXG4iLCIjIFRoaXMgZmlsZSBwcm92aWRlcyB0aGUgcmVuZGVyaW5nIGVuZ2luZSBmb3IgdGhlIHdlYiB2ZXJzaW9uLiBOb25lIG9mIHRoaXMgY29kZSBpcyBpbmNsdWRlZCBpbiB0aGUgSmF2YSB2ZXJzaW9uLlxuXG5jb25zb2xlLmxvZyAnd2ViIHN0YXJ0dXAnXG5cbkdhbWUgPSByZXF1aXJlICcuL0dhbWUnXG5cbiMgdGFrZW4gZnJvbSBodHRwOiNzdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNTYyMzgzOC9yZ2ItdG8taGV4LWFuZC1oZXgtdG8tcmdiXG5jb21wb25lbnRUb0hleCA9IChjKSAtPlxuICBoZXggPSBNYXRoLmZsb29yKGMgKiAyNTUpLnRvU3RyaW5nKDE2KVxuICByZXR1cm4gaWYgaGV4Lmxlbmd0aCA9PSAxIHRoZW4gXCIwXCIgKyBoZXggZWxzZSBoZXhcbnJnYlRvSGV4ID0gKHIsIGcsIGIpIC0+XG4gIHJldHVybiBcIiNcIiArIGNvbXBvbmVudFRvSGV4KHIpICsgY29tcG9uZW50VG9IZXgoZykgKyBjb21wb25lbnRUb0hleChiKVxuXG5TQVZFX1RJTUVSX01TID0gMzAwMFxuXG5jbGFzcyBOYXRpdmVBcHBcbiAgY29uc3RydWN0b3I6IChAc2NyZWVuLCBAd2lkdGgsIEBoZWlnaHQpIC0+XG4gICAgQHRpbnRlZFRleHR1cmVDYWNoZSA9IFtdXG4gICAgQGxhc3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcbiAgICBAbGFzdEludGVyYWN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG4gICAgQGhlYXJkT25lVG91Y2ggPSBmYWxzZVxuICAgIEB0b3VjaE1vdXNlID0gbnVsbFxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdtb3VzZWRvd24nLCAgQG9uTW91c2VEb3duLmJpbmQodGhpcyksIGZhbHNlXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNlbW92ZScsICBAb25Nb3VzZU1vdmUuYmluZCh0aGlzKSwgZmFsc2VcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2V1cCcsICAgIEBvbk1vdXNlVXAuYmluZCh0aGlzKSwgZmFsc2VcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAndG91Y2hzdGFydCcsIEBvblRvdWNoU3RhcnQuYmluZCh0aGlzKSwgZmFsc2VcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAndG91Y2htb3ZlJywgIEBvblRvdWNoTW92ZS5iaW5kKHRoaXMpLCBmYWxzZVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICd0b3VjaGVuZCcsICAgQG9uVG91Y2hFbmQuYmluZCh0aGlzKSwgZmFsc2VcbiAgICBAY29udGV4dCA9IEBzY3JlZW4uZ2V0Q29udGV4dChcIjJkXCIpXG4gICAgQHRleHR1cmVzID0gW1xuICAgICAgIyBhbGwgY2FyZCBhcnRcbiAgICAgIFwiLi4vaW1hZ2VzL2NhcmRzLnBuZ1wiXG4gICAgICAjIGZvbnRzXG4gICAgICBcIi4uL2ltYWdlcy9kYXJrZm9yZXN0LnBuZ1wiXG4gICAgICAjIGNoYXJhY3RlcnMgLyBvdGhlclxuICAgICAgXCIuLi9pbWFnZXMvY2hhcnMucG5nXCJcbiAgICAgICMgaGVscFxuICAgICAgXCIuLi9pbWFnZXMvaG93dG9wbGF5MS5wbmdcIlxuICAgIF1cblxuICAgIEBnYW1lID0gbmV3IEdhbWUodGhpcywgQHdpZHRoLCBAaGVpZ2h0KVxuXG4gICAgaWYgdHlwZW9mIFN0b3JhZ2UgIT0gXCJ1bmRlZmluZWRcIlxuICAgICAgc3RhdGUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSBcInN0YXRlXCJcbiAgICAgIGlmIHN0YXRlXG4gICAgICAgICMgY29uc29sZS5sb2cgXCJsb2FkaW5nIHN0YXRlOiAje3N0YXRlfVwiXG4gICAgICAgIEBnYW1lLmxvYWQgc3RhdGVcblxuICAgIEBwZW5kaW5nSW1hZ2VzID0gMFxuICAgIGxvYWRlZFRleHR1cmVzID0gW11cbiAgICBmb3IgaW1hZ2VVcmwgaW4gQHRleHR1cmVzXG4gICAgICBAcGVuZGluZ0ltYWdlcysrXG4gICAgICBjb25zb2xlLmxvZyBcImxvYWRpbmcgaW1hZ2UgI3tAcGVuZGluZ0ltYWdlc306ICN7aW1hZ2VVcmx9XCJcbiAgICAgIGltZyA9IG5ldyBJbWFnZSgpXG4gICAgICBpbWcub25sb2FkID0gQG9uSW1hZ2VMb2FkZWQuYmluZCh0aGlzKVxuICAgICAgaW1nLnNyYyA9IGltYWdlVXJsXG4gICAgICBsb2FkZWRUZXh0dXJlcy5wdXNoIGltZ1xuICAgIEB0ZXh0dXJlcyA9IGxvYWRlZFRleHR1cmVzXG5cbiAgICBAc2F2ZVRpbWVyID0gU0FWRV9USU1FUl9NU1xuXG4gIG9uSW1hZ2VMb2FkZWQ6IChpbmZvKSAtPlxuICAgIEBwZW5kaW5nSW1hZ2VzLS1cbiAgICBpZiBAcGVuZGluZ0ltYWdlcyA9PSAwXG4gICAgICBjb25zb2xlLmxvZyAnQWxsIGltYWdlcyBsb2FkZWQuIEJlZ2lubmluZyByZW5kZXIgbG9vcC4nXG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPT4gQHVwZGF0ZSgpXG5cbiAgbG9nOiAocykgLT5cbiAgICBjb25zb2xlLmxvZyBcIk5hdGl2ZUFwcC5sb2coKTogI3tzfVwiXG5cbiAgdXBkYXRlU2F2ZTogKGR0KSAtPlxuICAgIHJldHVybiBpZiB0eXBlb2YgU3RvcmFnZSA9PSBcInVuZGVmaW5lZFwiXG4gICAgQHNhdmVUaW1lciAtPSBkdFxuICAgIGlmIEBzYXZlVGltZXIgPD0gMFxuICAgICAgQHNhdmVUaW1lciA9IFNBVkVfVElNRVJfTVNcbiAgICAgIHN0YXRlID0gQGdhbWUuc2F2ZSgpXG4gICAgICAjIGNvbnNvbGUubG9nIFwic2F2aW5nOiAje3N0YXRlfVwiXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSBcInN0YXRlXCIsIHN0YXRlXG5cbiAgZ2VuZXJhdGVUaW50SW1hZ2U6ICh0ZXh0dXJlSW5kZXgsIHJlZCwgZ3JlZW4sIGJsdWUpIC0+XG4gICAgaW1nID0gQHRleHR1cmVzW3RleHR1cmVJbmRleF1cbiAgICBidWZmID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCBcImNhbnZhc1wiXG4gICAgYnVmZi53aWR0aCAgPSBpbWcud2lkdGhcbiAgICBidWZmLmhlaWdodCA9IGltZy5oZWlnaHRcblxuICAgIGN0eCA9IGJ1ZmYuZ2V0Q29udGV4dCBcIjJkXCJcbiAgICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2NvcHknXG4gICAgY3R4LmRyYXdJbWFnZShpbWcsIDAsIDApXG4gICAgZmlsbENvbG9yID0gXCJyZ2IoI3tNYXRoLmZsb29yKHJlZCoyNTUpfSwgI3tNYXRoLmZsb29yKGdyZWVuKjI1NSl9LCAje01hdGguZmxvb3IoYmx1ZSoyNTUpfSlcIlxuICAgIGN0eC5maWxsU3R5bGUgPSBmaWxsQ29sb3JcbiAgICAjIGNvbnNvbGUubG9nIFwiZmlsbENvbG9yICN7ZmlsbENvbG9yfVwiXG4gICAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdtdWx0aXBseSdcbiAgICBjdHguZmlsbFJlY3QoMCwgMCwgYnVmZi53aWR0aCwgYnVmZi5oZWlnaHQpXG4gICAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdjb3B5J1xuICAgIGN0eC5nbG9iYWxBbHBoYSA9IDEuMFxuICAgIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnZGVzdGluYXRpb24taW4nXG4gICAgY3R4LmRyYXdJbWFnZShpbWcsIDAsIDApXG5cbiAgICBpbWdDb21wID0gbmV3IEltYWdlKClcbiAgICBpbWdDb21wLnNyYyA9IGJ1ZmYudG9EYXRhVVJMKClcbiAgICByZXR1cm4gaW1nQ29tcFxuXG4gIGRyYXdJbWFnZTogKHRleHR1cmVJbmRleCwgc3JjWCwgc3JjWSwgc3JjVywgc3JjSCwgZHN0WCwgZHN0WSwgZHN0VywgZHN0SCwgcm90LCBhbmNob3JYLCBhbmNob3JZLCByLCBnLCBiLCBhKSAtPlxuICAgIHRleHR1cmUgPSBAdGV4dHVyZXNbdGV4dHVyZUluZGV4XVxuICAgIGlmIChyICE9IDEpIG9yIChnICE9IDEpIG9yIChiICE9IDEpXG4gICAgICB0aW50ZWRUZXh0dXJlS2V5ID0gXCIje3RleHR1cmVJbmRleH0tI3tyfS0je2d9LSN7Yn1cIlxuICAgICAgdGludGVkVGV4dHVyZSA9IEB0aW50ZWRUZXh0dXJlQ2FjaGVbdGludGVkVGV4dHVyZUtleV1cbiAgICAgIGlmIG5vdCB0aW50ZWRUZXh0dXJlXG4gICAgICAgIHRpbnRlZFRleHR1cmUgPSBAZ2VuZXJhdGVUaW50SW1hZ2UgdGV4dHVyZUluZGV4LCByLCBnLCBiXG4gICAgICAgIEB0aW50ZWRUZXh0dXJlQ2FjaGVbdGludGVkVGV4dHVyZUtleV0gPSB0aW50ZWRUZXh0dXJlXG4gICAgICAgICMgY29uc29sZS5sb2cgXCJnZW5lcmF0ZWQgY2FjaGVkIHRleHR1cmUgI3t0aW50ZWRUZXh0dXJlS2V5fVwiXG4gICAgICB0ZXh0dXJlID0gdGludGVkVGV4dHVyZVxuXG4gICAgQGNvbnRleHQuc2F2ZSgpXG4gICAgQGNvbnRleHQudHJhbnNsYXRlIGRzdFgsIGRzdFlcbiAgICBAY29udGV4dC5yb3RhdGUgcm90ICMgKiAzLjE0MTU5MiAvIDE4MC4wXG4gICAgYW5jaG9yT2Zmc2V0WCA9IC0xICogYW5jaG9yWCAqIGRzdFdcbiAgICBhbmNob3JPZmZzZXRZID0gLTEgKiBhbmNob3JZICogZHN0SFxuICAgIEBjb250ZXh0LnRyYW5zbGF0ZSBhbmNob3JPZmZzZXRYLCBhbmNob3JPZmZzZXRZXG4gICAgQGNvbnRleHQuZ2xvYmFsQWxwaGEgPSBhXG4gICAgQGNvbnRleHQuZHJhd0ltYWdlKHRleHR1cmUsIHNyY1gsIHNyY1ksIHNyY1csIHNyY0gsIDAsIDAsIGRzdFcsIGRzdEgpXG4gICAgQGNvbnRleHQucmVzdG9yZSgpXG5cbiAgdXBkYXRlOiAtPlxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9PiBAdXBkYXRlKClcblxuICAgIG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG4gICAgZHQgPSBub3cgLSBAbGFzdFRpbWVcblxuICAgICMgZHQgPSBNYXRoLmZsb29yKGR0IC8gMTAwKVxuXG4gICAgdGltZVNpbmNlSW50ZXJhY3QgPSBub3cgLSBAbGFzdEludGVyYWN0VGltZVxuICAgIGlmIHRpbWVTaW5jZUludGVyYWN0ID4gNTAwMFxuICAgICAgZ29hbEZQUyA9IDUgIyBjYWxtIGRvd24sIG5vYm9keSBpcyBkb2luZyBhbnl0aGluZyBmb3IgYSB3aGlsZVxuICAgIGVsc2VcbiAgICAgIGdvYWxGUFMgPSBudWxsICMgYXMgZmFzdCBhcyBwb3NzaWJsZVxuICAgIGlmIEBsYXN0R29hbEZQUyAhPSBnb2FsRlBTXG4gICAgICBjb25zb2xlLmxvZyBcInN3aXRjaGluZyB0byAje2dvYWxGUFN9IEZQU1wiXG4gICAgICBAbGFzdEdvYWxGUFMgPSBnb2FsRlBTXG5cbiAgICBpZiBnb2FsRlBTICE9IG51bGxcbiAgICAgIGZwc0ludGVydmFsID0gMTAwMCAvIGdvYWxGUFNcbiAgICAgIGlmIGR0IDwgZnBzSW50ZXJ2YWxcbiAgICAgICAgcmV0dXJuXG4gICAgQGxhc3RUaW1lID0gbm93XG5cbiAgICBAY29udGV4dC5jbGVhclJlY3QoMCwgMCwgQHdpZHRoLCBAaGVpZ2h0KVxuICAgIGlmIEBnYW1lLnVwZGF0ZShkdClcbiAgICAgIEBsYXN0SW50ZXJhY3RUaW1lID0gbm93XG4gICAgcmVuZGVyQ29tbWFuZHMgPSBAZ2FtZS5yZW5kZXIoKVxuXG4gICAgaSA9IDBcbiAgICBuID0gcmVuZGVyQ29tbWFuZHMubGVuZ3RoXG4gICAgd2hpbGUgKGkgPCBuKVxuICAgICAgZHJhd0NhbGwgPSByZW5kZXJDb21tYW5kcy5zbGljZShpLCBpICs9IDE2KVxuICAgICAgQGRyYXdJbWFnZS5hcHBseSh0aGlzLCBkcmF3Q2FsbClcblxuICAgIEB1cGRhdGVTYXZlKGR0KVxuXG4gIG9uVG91Y2hTdGFydDogKGV2dCkgLT5cbiAgICBAbGFzdEludGVyYWN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG4gICAgQGhlYXJkT25lVG91Y2ggPSB0cnVlXG4gICAgdG91Y2hlcyA9IGV2dC5jaGFuZ2VkVG91Y2hlc1xuICAgIGZvciB0b3VjaCBpbiB0b3VjaGVzXG4gICAgICBpZiBAdG91Y2hNb3VzZSA9PSBudWxsXG4gICAgICAgIEB0b3VjaE1vdXNlID0gdG91Y2guaWRlbnRpZmllclxuICAgICAgaWYgQHRvdWNoTW91c2UgPT0gdG91Y2guaWRlbnRpZmllclxuICAgICAgICBAZ2FtZS50b3VjaERvd24odG91Y2guY2xpZW50WCwgdG91Y2guY2xpZW50WSlcblxuICBvblRvdWNoTW92ZTogKGV2dCkgLT5cbiAgICBAbGFzdEludGVyYWN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG4gICAgdG91Y2hlcyA9IGV2dC5jaGFuZ2VkVG91Y2hlc1xuICAgIGZvciB0b3VjaCBpbiB0b3VjaGVzXG4gICAgICBpZiBAdG91Y2hNb3VzZSA9PSB0b3VjaC5pZGVudGlmaWVyXG4gICAgICAgIEBnYW1lLnRvdWNoTW92ZSh0b3VjaC5jbGllbnRYLCB0b3VjaC5jbGllbnRZKVxuXG4gIG9uVG91Y2hFbmQ6IChldnQpIC0+XG4gICAgQGxhc3RJbnRlcmFjdFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuICAgIHRvdWNoZXMgPSBldnQuY2hhbmdlZFRvdWNoZXNcbiAgICBmb3IgdG91Y2ggaW4gdG91Y2hlc1xuICAgICAgaWYgQHRvdWNoTW91c2UgPT0gdG91Y2guaWRlbnRpZmllclxuICAgICAgICBAZ2FtZS50b3VjaFVwKHRvdWNoLmNsaWVudFgsIHRvdWNoLmNsaWVudFkpXG4gICAgICAgIEB0b3VjaE1vdXNlID0gbnVsbFxuICAgIGlmIGV2dC50b3VjaGVzLmxlbmd0aCA9PSAwXG4gICAgICBAdG91Y2hNb3VzZSA9IG51bGxcblxuICBvbk1vdXNlRG93bjogKGV2dCkgLT5cbiAgICBpZiBAaGVhcmRPbmVUb3VjaFxuICAgICAgcmV0dXJuXG4gICAgQGxhc3RJbnRlcmFjdFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuICAgIEBnYW1lLnRvdWNoRG93bihldnQuY2xpZW50WCwgZXZ0LmNsaWVudFkpXG5cbiAgb25Nb3VzZU1vdmU6IChldnQpIC0+XG4gICAgaWYgQGhlYXJkT25lVG91Y2hcbiAgICAgIHJldHVyblxuICAgIEBsYXN0SW50ZXJhY3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcbiAgICBAZ2FtZS50b3VjaE1vdmUoZXZ0LmNsaWVudFgsIGV2dC5jbGllbnRZKVxuXG4gIG9uTW91c2VVcDogKGV2dCkgLT5cbiAgICBpZiBAaGVhcmRPbmVUb3VjaFxuICAgICAgcmV0dXJuXG4gICAgQGxhc3RJbnRlcmFjdFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuICAgIEBnYW1lLnRvdWNoVXAoZXZ0LmNsaWVudFgsIGV2dC5jbGllbnRZKVxuXG5zY3JlZW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAnc2NyZWVuJ1xucmVzaXplU2NyZWVuID0gLT5cbiAgZGVzaXJlZEFzcGVjdFJhdGlvID0gMTYgLyA5XG4gIGN1cnJlbnRBc3BlY3RSYXRpbyA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0XG4gIGlmIGN1cnJlbnRBc3BlY3RSYXRpbyA8IGRlc2lyZWRBc3BlY3RSYXRpb1xuICAgIHNjcmVlbi53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG4gICAgc2NyZWVuLmhlaWdodCA9IE1hdGguZmxvb3Iod2luZG93LmlubmVyV2lkdGggKiAoMSAvIGRlc2lyZWRBc3BlY3RSYXRpbykpXG4gIGVsc2VcbiAgICBzY3JlZW4ud2lkdGggPSBNYXRoLmZsb29yKHdpbmRvdy5pbm5lckhlaWdodCAqIGRlc2lyZWRBc3BlY3RSYXRpbylcbiAgICBzY3JlZW4uaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0XG5yZXNpemVTY3JlZW4oKVxuIyB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAncmVzaXplJywgcmVzaXplU2NyZWVuLCBmYWxzZVxuXG5hcHAgPSBuZXcgTmF0aXZlQXBwKHNjcmVlbiwgc2NyZWVuLndpZHRoLCBzY3JlZW4uaGVpZ2h0KVxuIl19
