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

BUILD_TIMESTAMP = "1.22";

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
      "how1": 3,
      "how2": 4,
      "how3": 5
    };
    this.thirteen = null;
    this.lastErr = '';
    this.renderMode = RenderMode.GAME;
    this.renderCommands = [];
    this.achievementFanfare = null;
    this.achievementsPage = 0;
    this.howtoPage = 0;
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
      givingUp: true,
      passBreak: true
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
            _this.options.passBreak = !_this.options.passBreak;
          }
          if (_this.options.passBreak) {
            return "Pass Breaks: Enabled";
          }
          return "Pass Breaks: Disabled";
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
    var footerText, howtoPageCount, howtoTexture, nextDim, titleHeight, titleOffset;
    howtoPageCount = 3;
    howtoTexture = "how" + (this.howtoPage + 1);
    this.log("rendering " + howtoTexture);
    this.spriteRenderer.render(howtoTexture, 0, 0, this.width, this.aaHeight, 0, 0, 0, this.colors.white, (function(_this) {
      return function() {
        return _this.renderMode = RenderMode.PAUSE;
      };
    })(this));
    footerText = "Page " + (this.howtoPage + 1) + " / 3";
    titleHeight = this.height / 20;
    titleOffset = titleHeight / 4;
    this.fontRenderer.render(this.font, titleHeight, footerText, this.width - titleOffset, this.height - titleOffset, 1, 1, this.colors.ach_header);
    nextDim = this.width * 0.1;
    this.fontRenderer.render(this.font, titleHeight, "[ Next ]", this.width - titleOffset, titleOffset, 1, 0, this.colors.ach_button);
    return this.spriteRenderer.render("solid", this.width - nextDim, 0, nextDim, nextDim, 0, 0, 0, this.colors.transparent, (function(_this) {
      return function() {
        return _this.howtoPage = (_this.howtoPage + 1) % howtoPageCount;
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
      (function(_this) {
        return (function(character) {
          return _this.spriteRenderer.render(character.sprite, characterMargin, _this.charCeiling, 0, characterHeight, 0, 0, 1, _this.colors.white, function() {
            return _this.thirteen.punch(character);
          });
        });
      })(this)(character);
      this.renderCount(aiPlayers[0], this.thirteen.money, drawGameOver, aiPlayers[0].index === this.thirteen.turn, countHeight, characterMargin + (characterWidth / 2), this.charCeiling - textPadding, 0.5, 0);
    }
    if (aiPlayers[1] !== null) {
      if (drawGameOver) {
        this.renderAIHand(aiPlayers[1].hand, this.width * 0.6, this.height * 0.18, aiCardSpacing);
      }
      character = aiCharacters[aiPlayers[1].charID];
      (function(_this) {
        return (function(character) {
          return _this.spriteRenderer.render(character.sprite, _this.center.x, 0, 0, characterHeight, 0, 0.5, 0, _this.colors.white, function() {
            return _this.thirteen.punch(character);
          });
        });
      })(this)(character);
      this.renderCount(aiPlayers[1], this.thirteen.money, drawGameOver, aiPlayers[1].index === this.thirteen.turn, countHeight, this.center.x, characterHeight, 0.5, 0);
    }
    if (aiPlayers[2] !== null) {
      if (drawGameOver) {
        this.renderAIHand(aiPlayers[2].hand, this.width * 0.7, this.height * 0.62, aiCardSpacing);
      }
      character = aiCharacters[aiPlayers[2].charID];
      characterWidth = this.spriteRenderer.calcWidth(character.sprite, characterHeight);
      (function(_this) {
        return (function(character) {
          return _this.spriteRenderer.render(character.sprite, _this.width - characterMargin, _this.charCeiling, 0, characterHeight, 0, 1, 1, _this.colors.white, function() {
            return _this.thirteen.punch(character);
          });
        });
      })(this)(character);
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
      how1: {
        texture: "how1",
        x: 0,
        y: 0,
        w: 1920,
        h: 1080
      },
      how2: {
        texture: "how2",
        x: 0,
        y: 0,
        w: 1920,
        h: 1080
      },
      how3: {
        texture: "how3",
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
    id: "skilled",
    title: "Skilled",
    description: ["Win 50 Hands."],
    progress: function(ach) {
      if (ach.state.totalWins >= 50) {
        return "Total Wins: `aaffaa`" + ach.state.totalWins + "`` Wins";
      }
      return "Progress: " + ach.state.totalWins + " / 50";
    }
  }, {
    id: "consolationprize",
    title: "Consolation Prize",
    description: ["Lose 10 Hands spectacularly (10+ cards left)."],
    progress: function(ach) {
      if (ach.state.spectacularLosses >= 10) {
        return "Total: `aaffaa`" + ach.state.spectacularLosses + "`` Bad Beats";
      }
      return "Progress: " + ach.state.spectacularLosses + " / 10";
    }
  }, {
    id: "bling",
    title: "Bling Bling",
    description: ["Bankrupt another player in a money game when", "you are ahead by $15 dollars or more ($" + (STARTING_MONEY + 15) + " total)."]
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
    id: "palindrome",
    title: "Palindrome",
    description: ["Throw a run of pairs... but in a reversible way."]
  }, {
    id: "pagercode",
    title: "Pager Code",
    description: ["The secret password is BATHES. Don't tell anyone."]
  }, {
    id: "beast",
    title: "Number of the Beast",
    description: ["Throw a 3-of-a-kind of 6s."]
  }, {
    id: "thirteen2",
    title: "Thirteen 2: Electric Boogaloo",
    description: ["Earn 13 x 2 (26) achievements."]
  }, {
    id: "toad",
    title: "Nobody Likes You, Toad",
    description: ["Punch Toad in the face."]
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
    var base, base1, base2, base3, base4;
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
    if ((base3 = this.ach.state).totalWins == null) {
      base3.totalWins = 0;
    }
    if ((base4 = this.ach.state).spectacularLosses == null) {
      base4.spectacularLosses = 0;
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

  Thirteen.prototype.punch = function(character) {
    console.log("thirteen: punching " + character.id);
    if (character.id === 'toad') {
      return this.earn("toad");
    }
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

  Thirteen.prototype.handIsReversible = function(hand) {
    var card, cards, expecting, index, len3, n;
    if (hand.length === 0) {
      return false;
    }
    cards = hand.map(function(raw) {
      return new Card(raw);
    });
    expecting = cards.map(function(card) {
      return card.value;
    });
    expecting = expecting.reverse();
    for (index = n = 0, len3 = cards.length; n < len3; index = ++n) {
      card = cards[index];
      if (card.value !== expecting[index]) {
        return false;
      }
    }
    return true;
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
      if (this.game.options.passBreak && this.currentPlay && this.canBeBroken(this.currentPlay)) {
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
    var achievement, achievementCount, base, base1, base2, base3, breakerThrown, card, currentPlayer, incomingPlay, len3, len4, len5, n, newThrow, o, placeString, player, q, ref, ref1, ret, verb;
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
      if ((incomingPlay.type === 'kind3') && (incomingPlay.high >= 12) && (incomingPlay.high <= 15)) {
        this.earn("beast");
      }
      if (this.handIsBATHES(params.cards)) {
        this.earn("pagercode");
      }
      if ((incomingPlay.type.match(/rop/)) && (this.handIsReversible(params.cards))) {
        this.earn("palindrome");
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
          if ((base3 = this.ach.state).totalWins == null) {
            base3.totalWins = 0;
          }
          this.ach.state.totalWins += 1;
          if (this.ach.state.totalWins >= 50) {
            this.earn("skilled");
          }
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
          if (this.players[0].hand.length >= 10) {
            this.ach.state.spectacularLosses += 1;
            if (this.ach.state.spectacularLosses >= 10) {
              this.earn("consolationprize");
            }
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
    if (achievementCount >= 26) {
      this.earn("thirteen2");
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
          if (this.game.options.passBreak && this.canBeBroken(currentPlay) && this.hasBreaker(currentPlayer.hand)) {
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
    this.textures = ["../images/cards.png", "../images/darkforest.png", "../images/chars.png", "../images/how1.png", "../images/how2.png", "../images/how3.png"];
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQW5pbWF0aW9uLmNvZmZlZSIsInNyYy9CdXR0b24uY29mZmVlIiwic3JjL0ZvbnRSZW5kZXJlci5jb2ZmZWUiLCJzcmMvR2FtZS5jb2ZmZWUiLCJzcmMvSGFuZC5jb2ZmZWUiLCJzcmMvTWVudS5jb2ZmZWUiLCJzcmMvUGlsZS5jb2ZmZWUiLCJzcmMvU3ByaXRlUmVuZGVyZXIuY29mZmVlIiwic3JjL1RoaXJ0ZWVuLmNvZmZlZSIsInNyYy9mb250bWV0cmljcy5jb2ZmZWUiLCJzcmMvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBOztBQUFBLFFBQUEsR0FBVyxTQUFDLENBQUQ7RUFDVCxJQUFHLENBQUEsS0FBSyxDQUFSO0FBQ0UsV0FBTyxFQURUO0dBQUEsTUFFSyxJQUFHLENBQUEsR0FBSSxDQUFQO0FBQ0gsV0FBTyxDQUFDLEVBREw7O0FBRUwsU0FBTztBQUxFOztBQU9MO0VBQ1MsbUJBQUMsSUFBRDtBQUNYLFFBQUE7SUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksQ0FBQztJQUNkLElBQUMsQ0FBQSxHQUFELEdBQU87SUFDUCxJQUFDLENBQUEsR0FBRCxHQUFPO0FBQ1AsU0FBQSxTQUFBOztNQUNFLElBQUcsQ0FBQSxLQUFLLE9BQVI7UUFDRSxJQUFDLENBQUEsR0FBSSxDQUFBLENBQUEsQ0FBTCxHQUFVO1FBQ1YsSUFBQyxDQUFBLEdBQUksQ0FBQSxDQUFBLENBQUwsR0FBVSxFQUZaOztBQURGO0VBSlc7O3NCQVViLElBQUEsR0FBTSxTQUFBO0lBQ0osSUFBRyxrQkFBSDtNQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBTCxHQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFEaEI7O0lBRUEsSUFBRyxrQkFBSDtNQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBTCxHQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFEaEI7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R0EsR0FBQSxHQUFNLElBQUksU0FBSixDQUFjLE1BQWQsRUFBc0IsTUFBTSxDQUFDLEtBQTdCLEVBQW9DLE1BQU0sQ0FBQyxNQUEzQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNhbGNTaWduID0gKHYpIC0+XHJcbiAgaWYgdiA9PSAwXHJcbiAgICByZXR1cm4gMFxyXG4gIGVsc2UgaWYgdiA8IDBcclxuICAgIHJldHVybiAtMVxyXG4gIHJldHVybiAxXHJcblxyXG5jbGFzcyBBbmltYXRpb25cclxuICBjb25zdHJ1Y3RvcjogKGRhdGEpIC0+XHJcbiAgICBAc3BlZWQgPSBkYXRhLnNwZWVkXHJcbiAgICBAcmVxID0ge31cclxuICAgIEBjdXIgPSB7fVxyXG4gICAgZm9yIGssdiBvZiBkYXRhXHJcbiAgICAgIGlmIGsgIT0gJ3NwZWVkJ1xyXG4gICAgICAgIEByZXFba10gPSB2XHJcbiAgICAgICAgQGN1cltrXSA9IHZcclxuXHJcbiAgIyAnZmluaXNoZXMnIGFsbCBhbmltYXRpb25zXHJcbiAgd2FycDogLT5cclxuICAgIGlmIEBjdXIucj9cclxuICAgICAgQGN1ci5yID0gQHJlcS5yXHJcbiAgICBpZiBAY3VyLnM/XHJcbiAgICAgIEBjdXIucyA9IEByZXEuc1xyXG4gICAgaWYgQGN1ci54PyBhbmQgQGN1ci55P1xyXG4gICAgICBAY3VyLnggPSBAcmVxLnhcclxuICAgICAgQGN1ci55ID0gQHJlcS55XHJcblxyXG4gIGFuaW1hdGluZzogLT5cclxuICAgIGlmIEBjdXIucj9cclxuICAgICAgaWYgQHJlcS5yICE9IEBjdXIuclxyXG4gICAgICAgIHJldHVybiB0cnVlXHJcbiAgICBpZiBAY3VyLnM/XHJcbiAgICAgIGlmIEByZXEucyAhPSBAY3VyLnNcclxuICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgaWYgQGN1ci54PyBhbmQgQGN1ci55P1xyXG4gICAgICBpZiAoQHJlcS54ICE9IEBjdXIueCkgb3IgKEByZXEueSAhPSBAY3VyLnkpXHJcbiAgICAgICAgcmV0dXJuIHRydWVcclxuICAgIHJldHVybiBmYWxzZVxyXG5cclxuICB1cGRhdGU6IChkdCkgLT5cclxuICAgIHVwZGF0ZWQgPSBmYWxzZVxyXG4gICAgIyByb3RhdGlvblxyXG4gICAgaWYgQGN1ci5yP1xyXG4gICAgICBpZiBAcmVxLnIgIT0gQGN1ci5yXHJcbiAgICAgICAgdXBkYXRlZCA9IHRydWVcclxuICAgICAgICAjIHNhbml0aXplIHJlcXVlc3RlZCByb3RhdGlvblxyXG4gICAgICAgIHR3b1BpID0gTWF0aC5QSSAqIDJcclxuICAgICAgICBuZWdUd29QaSA9IC0xICogdHdvUGlcclxuICAgICAgICBAcmVxLnIgLT0gdHdvUGkgd2hpbGUgQHJlcS5yID49IHR3b1BpXHJcbiAgICAgICAgQHJlcS5yICs9IHR3b1BpIHdoaWxlIEByZXEuciA8PSBuZWdUd29QaVxyXG4gICAgICAgICMgcGljayBhIGRpcmVjdGlvbiBhbmQgdHVyblxyXG4gICAgICAgIGRyID0gQHJlcS5yIC0gQGN1ci5yXHJcbiAgICAgICAgZGlzdCA9IE1hdGguYWJzKGRyKVxyXG4gICAgICAgIHNpZ24gPSBjYWxjU2lnbihkcilcclxuICAgICAgICBpZiBkaXN0ID4gTWF0aC5QSVxyXG4gICAgICAgICAgIyBzcGluIHRoZSBvdGhlciBkaXJlY3Rpb24sIGl0IGlzIGNsb3NlclxyXG4gICAgICAgICAgZGlzdCA9IHR3b1BpIC0gZGlzdFxyXG4gICAgICAgICAgc2lnbiAqPSAtMVxyXG4gICAgICAgIG1heERpc3QgPSBkdCAqIEBzcGVlZC5yIC8gMTAwMFxyXG4gICAgICAgIGlmIGRpc3QgPCBtYXhEaXN0XHJcbiAgICAgICAgICAjIHdlIGNhbiBmaW5pc2ggdGhpcyBmcmFtZVxyXG4gICAgICAgICAgQGN1ci5yID0gQHJlcS5yXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgQGN1ci5yICs9IG1heERpc3QgKiBzaWduXHJcblxyXG4gICAgIyBzY2FsZVxyXG4gICAgaWYgQGN1ci5zP1xyXG4gICAgICBpZiBAcmVxLnMgIT0gQGN1ci5zXHJcbiAgICAgICAgdXBkYXRlZCA9IHRydWVcclxuICAgICAgICAjIHBpY2sgYSBkaXJlY3Rpb24gYW5kIHR1cm5cclxuICAgICAgICBkcyA9IEByZXEucyAtIEBjdXIuc1xyXG4gICAgICAgIGRpc3QgPSBNYXRoLmFicyhkcylcclxuICAgICAgICBzaWduID0gY2FsY1NpZ24oZHMpXHJcbiAgICAgICAgbWF4RGlzdCA9IGR0ICogQHNwZWVkLnMgLyAxMDAwXHJcbiAgICAgICAgaWYgZGlzdCA8IG1heERpc3RcclxuICAgICAgICAgICMgd2UgY2FuIGZpbmlzaCB0aGlzIGZyYW1lXHJcbiAgICAgICAgICBAY3VyLnMgPSBAcmVxLnNcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBAY3VyLnMgKz0gbWF4RGlzdCAqIHNpZ25cclxuXHJcbiAgICAjIHRyYW5zbGF0aW9uXHJcbiAgICBpZiBAY3VyLng/IGFuZCBAY3VyLnk/XHJcbiAgICAgIGlmIChAcmVxLnggIT0gQGN1ci54KSBvciAoQHJlcS55ICE9IEBjdXIueSlcclxuICAgICAgICB1cGRhdGVkID0gdHJ1ZVxyXG4gICAgICAgIHZlY1ggPSBAcmVxLnggLSBAY3VyLnhcclxuICAgICAgICB2ZWNZID0gQHJlcS55IC0gQGN1ci55XHJcbiAgICAgICAgZGlzdCA9IE1hdGguc3FydCgodmVjWCAqIHZlY1gpICsgKHZlY1kgKiB2ZWNZKSlcclxuICAgICAgICBtYXhEaXN0ID0gZHQgKiBAc3BlZWQudCAvIDEwMDBcclxuICAgICAgICBpZiBkaXN0IDwgbWF4RGlzdFxyXG4gICAgICAgICAgIyB3ZSBjYW4gZmluaXNoIHRoaXMgZnJhbWVcclxuICAgICAgICAgIEBjdXIueCA9IEByZXEueFxyXG4gICAgICAgICAgQGN1ci55ID0gQHJlcS55XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgIyBtb3ZlIGFzIG11Y2ggYXMgcG9zc2libGVcclxuICAgICAgICAgIEBjdXIueCArPSAodmVjWCAvIGRpc3QpICogbWF4RGlzdFxyXG4gICAgICAgICAgQGN1ci55ICs9ICh2ZWNZIC8gZGlzdCkgKiBtYXhEaXN0XHJcblxyXG4gICAgcmV0dXJuIHVwZGF0ZWRcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQW5pbWF0aW9uXHJcbiIsIkFuaW1hdGlvbiA9IHJlcXVpcmUgJy4vQW5pbWF0aW9uJ1xyXG5cclxuY2xhc3MgQnV0dG9uXHJcbiAgY29uc3RydWN0b3I6IChAZ2FtZSwgQHNwcml0ZU5hbWVzLCBAZm9udCwgQHRleHRIZWlnaHQsIEB4LCBAeSwgQGNiKSAtPlxyXG4gICAgQGFuaW0gPSBuZXcgQW5pbWF0aW9uIHtcclxuICAgICAgc3BlZWQ6IHsgczogMyB9XHJcbiAgICAgIHM6IDBcclxuICAgIH1cclxuICAgIEBjb2xvciA9IHsgcjogMSwgZzogMSwgYjogMSwgYTogMCB9XHJcblxyXG4gIHVwZGF0ZTogKGR0KSAtPlxyXG4gICAgcmV0dXJuIEBhbmltLnVwZGF0ZShkdClcclxuXHJcbiAgcmVuZGVyOiAtPlxyXG4gICAgQGNvbG9yLmEgPSBAYW5pbS5jdXIuc1xyXG4gICAgQGdhbWUuc3ByaXRlUmVuZGVyZXIucmVuZGVyIEBzcHJpdGVOYW1lc1swXSwgQHgsIEB5LCAwLCBAdGV4dEhlaWdodCAqIDEuNSwgMCwgMC41LCAwLjUsIEBnYW1lLmNvbG9ycy53aGl0ZSwgPT5cclxuICAgICAgIyBwdWxzZSBidXR0b24gYW5pbSxcclxuICAgICAgQGFuaW0uY3VyLnMgPSAxXHJcbiAgICAgIEBhbmltLnJlcS5zID0gMFxyXG4gICAgICAjIHRoZW4gY2FsbCBjYWxsYmFja1xyXG4gICAgICBAY2IodHJ1ZSlcclxuICAgIEBnYW1lLnNwcml0ZVJlbmRlcmVyLnJlbmRlciBAc3ByaXRlTmFtZXNbMV0sIEB4LCBAeSwgMCwgQHRleHRIZWlnaHQgKiAxLjUsIDAsIDAuNSwgMC41LCBAY29sb3JcclxuICAgIHRleHQgPSBAY2IoZmFsc2UpXHJcbiAgICBAZ2FtZS5mb250UmVuZGVyZXIucmVuZGVyIEBmb250LCBAdGV4dEhlaWdodCwgdGV4dCwgQHgsIEB5LCAwLjUsIDAuNSwgQGdhbWUuY29sb3JzLmJ1dHRvbnRleHRcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQnV0dG9uXHJcbiIsImZvbnRtZXRyaWNzID0gcmVxdWlyZSAnLi9mb250bWV0cmljcydcclxuXHJcbiMgdGFrZW4gZnJvbSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzU2MjM4MzgvcmdiLXRvLWhleC1hbmQtaGV4LXRvLXJnYlxyXG5oZXhUb1JnYiA9IChoZXgsIGEpIC0+XHJcbiAgICByZXN1bHQgPSAvXiM/KFthLWZcXGRdezJ9KShbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pJC9pLmV4ZWMoaGV4KVxyXG4gICAgcmV0dXJuIG51bGwgaWYgbm90IHJlc3VsdFxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByOiBwYXJzZUludChyZXN1bHRbMV0sIDE2KSAvIDI1NSxcclxuICAgICAgICBnOiBwYXJzZUludChyZXN1bHRbMl0sIDE2KSAvIDI1NSxcclxuICAgICAgICBiOiBwYXJzZUludChyZXN1bHRbM10sIDE2KSAvIDI1NVxyXG4gICAgICAgIGE6IGFcclxuICAgIH1cclxuXHJcbmNsYXNzIEZvbnRSZW5kZXJlclxyXG4gIGNvbnN0cnVjdG9yOiAgKEBnYW1lKSAtPlxyXG4gICAgQHdoaXRlID0geyByOiAxLCBnOiAxLCBiOiAxLCBhOiAxIH1cclxuXHJcbiAgc2l6ZTogKGZvbnQsIGhlaWdodCwgc3RyKSAtPlxyXG4gICAgbWV0cmljcyA9IGZvbnRtZXRyaWNzW2ZvbnRdXHJcbiAgICByZXR1cm4gaWYgbm90IG1ldHJpY3NcclxuICAgIHNjYWxlID0gaGVpZ2h0IC8gbWV0cmljcy5oZWlnaHRcclxuXHJcbiAgICB0b3RhbFdpZHRoID0gMFxyXG4gICAgdG90YWxIZWlnaHQgPSBtZXRyaWNzLmhlaWdodCAqIHNjYWxlXHJcblxyXG4gICAgaW5Db2xvciA9IGZhbHNlXHJcbiAgICBmb3IgY2gsIGkgaW4gc3RyXHJcbiAgICAgIGlmIGNoID09ICdgJ1xyXG4gICAgICAgIGluQ29sb3IgPSAhaW5Db2xvclxyXG5cclxuICAgICAgaWYgbm90IGluQ29sb3JcclxuICAgICAgICBjb2RlID0gY2guY2hhckNvZGVBdCgwKVxyXG4gICAgICAgIGdseXBoID0gbWV0cmljcy5nbHlwaHNbY29kZV1cclxuICAgICAgICBjb250aW51ZSBpZiBub3QgZ2x5cGhcclxuICAgICAgICB0b3RhbFdpZHRoICs9IGdseXBoLnhhZHZhbmNlICogc2NhbGVcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB3OiB0b3RhbFdpZHRoXHJcbiAgICAgIGg6IHRvdGFsSGVpZ2h0XHJcbiAgICB9XHJcblxyXG4gIHJlbmRlcjogKGZvbnQsIGhlaWdodCwgc3RyLCB4LCB5LCBhbmNob3J4LCBhbmNob3J5LCBjb2xvciwgY2IpIC0+XHJcbiAgICBtZXRyaWNzID0gZm9udG1ldHJpY3NbZm9udF1cclxuICAgIHJldHVybiBpZiBub3QgbWV0cmljc1xyXG4gICAgc2NhbGUgPSBoZWlnaHQgLyBtZXRyaWNzLmhlaWdodFxyXG5cclxuICAgIHRvdGFsV2lkdGggPSAwXHJcbiAgICB0b3RhbEhlaWdodCA9IG1ldHJpY3MuaGVpZ2h0ICogc2NhbGVcclxuICAgIHNraXBDb2xvciA9IGZhbHNlXHJcbiAgICBmb3IgY2gsIGkgaW4gc3RyXHJcbiAgICAgIGlmIGNoID09ICdgJ1xyXG4gICAgICAgIHNraXBDb2xvciA9ICFza2lwQ29sb3JcclxuICAgICAgY29udGludWUgaWYgc2tpcENvbG9yXHJcbiAgICAgIGNvZGUgPSBjaC5jaGFyQ29kZUF0KDApXHJcbiAgICAgIGdseXBoID0gbWV0cmljcy5nbHlwaHNbY29kZV1cclxuICAgICAgY29udGludWUgaWYgbm90IGdseXBoXHJcbiAgICAgIHRvdGFsV2lkdGggKz0gZ2x5cGgueGFkdmFuY2UgKiBzY2FsZVxyXG5cclxuICAgIGFuY2hvck9mZnNldFggPSAtMSAqIGFuY2hvcnggKiB0b3RhbFdpZHRoXHJcbiAgICBhbmNob3JPZmZzZXRZID0gLTEgKiBhbmNob3J5ICogdG90YWxIZWlnaHRcclxuICAgIGN1cnJYID0geFxyXG5cclxuICAgIGlmIGNvbG9yXHJcbiAgICAgIHN0YXJ0aW5nQ29sb3IgPSBjb2xvclxyXG4gICAgZWxzZVxyXG4gICAgICBzdGFydGluZ0NvbG9yID0gQHdoaXRlXHJcbiAgICBjdXJyZW50Q29sb3IgPSBzdGFydGluZ0NvbG9yXHJcblxyXG4gICAgY29sb3JTdGFydCA9IC0xXHJcbiAgICBmb3IgY2gsIGkgaW4gc3RyXHJcbiAgICAgIGlmIGNoID09ICdgJ1xyXG4gICAgICAgIGlmIGNvbG9yU3RhcnQgPT0gLTFcclxuICAgICAgICAgIGNvbG9yU3RhcnQgPSBpICsgMVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIGxlbiA9IGkgLSBjb2xvclN0YXJ0XHJcbiAgICAgICAgICBpZiBsZW5cclxuICAgICAgICAgICAgY3VycmVudENvbG9yID0gaGV4VG9SZ2Ioc3RyLnN1YnN0cihjb2xvclN0YXJ0LCBpIC0gY29sb3JTdGFydCksIHN0YXJ0aW5nQ29sb3IuYSlcclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgY3VycmVudENvbG9yID0gc3RhcnRpbmdDb2xvclxyXG4gICAgICAgICAgY29sb3JTdGFydCA9IC0xXHJcblxyXG4gICAgICBjb250aW51ZSBpZiBjb2xvclN0YXJ0ICE9IC0xXHJcbiAgICAgIGNvZGUgPSBjaC5jaGFyQ29kZUF0KDApXHJcbiAgICAgIGdseXBoID0gbWV0cmljcy5nbHlwaHNbY29kZV1cclxuICAgICAgY29udGludWUgaWYgbm90IGdseXBoXHJcbiAgICAgIEBnYW1lLmRyYXdJbWFnZSBmb250LFxyXG4gICAgICBnbHlwaC54LCBnbHlwaC55LCBnbHlwaC53aWR0aCwgZ2x5cGguaGVpZ2h0LFxyXG4gICAgICBjdXJyWCArIChnbHlwaC54b2Zmc2V0ICogc2NhbGUpICsgYW5jaG9yT2Zmc2V0WCwgeSArIChnbHlwaC55b2Zmc2V0ICogc2NhbGUpICsgYW5jaG9yT2Zmc2V0WSwgZ2x5cGgud2lkdGggKiBzY2FsZSwgZ2x5cGguaGVpZ2h0ICogc2NhbGUsXHJcbiAgICAgIDAsIDAsIDAsXHJcbiAgICAgIGN1cnJlbnRDb2xvci5yLCBjdXJyZW50Q29sb3IuZywgY3VycmVudENvbG9yLmIsIGN1cnJlbnRDb2xvci5hLCBjYlxyXG4gICAgICBjdXJyWCArPSBnbHlwaC54YWR2YW5jZSAqIHNjYWxlXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEZvbnRSZW5kZXJlclxyXG4iLCJBbmltYXRpb24gPSByZXF1aXJlICcuL0FuaW1hdGlvbidcclxuQnV0dG9uID0gcmVxdWlyZSAnLi9CdXR0b24nXHJcbkZvbnRSZW5kZXJlciA9IHJlcXVpcmUgJy4vRm9udFJlbmRlcmVyJ1xyXG5TcHJpdGVSZW5kZXJlciA9IHJlcXVpcmUgJy4vU3ByaXRlUmVuZGVyZXInXHJcbk1lbnUgPSByZXF1aXJlICcuL01lbnUnXHJcbkhhbmQgPSByZXF1aXJlICcuL0hhbmQnXHJcblBpbGUgPSByZXF1aXJlICcuL1BpbGUnXHJcbntUaGlydGVlbiwgT0ssIGFpQ2hhcmFjdGVycywgYWNoaWV2ZW1lbnRzTGlzdH0gPSByZXF1aXJlICcuL1RoaXJ0ZWVuJ1xyXG5cclxuIyB0ZW1wXHJcbkJVSUxEX1RJTUVTVEFNUCA9IFwiMS4yMlwiXHJcblxyXG5SZW5kZXJNb2RlID1cclxuICBHQU1FOiAwXHJcbiAgSE9XVE86IDFcclxuICBBQ0hJRVZFTUVOVFM6IDJcclxuICBQQVVTRTogM1xyXG4gIE9QVElPTlM6IDRcclxuXHJcbmNsYXNzIEdhbWVcclxuICBjb25zdHJ1Y3RvcjogKEBuYXRpdmUsIEB3aWR0aCwgQGhlaWdodCkgLT5cclxuICAgIEB2ZXJzaW9uID0gQlVJTERfVElNRVNUQU1QXHJcbiAgICBAbG9nKFwiR2FtZSBjb25zdHJ1Y3RlZDogI3tAd2lkdGh9eCN7QGhlaWdodH1cIilcclxuICAgIEBmb250UmVuZGVyZXIgPSBuZXcgRm9udFJlbmRlcmVyIHRoaXNcclxuICAgIEBzcHJpdGVSZW5kZXJlciA9IG5ldyBTcHJpdGVSZW5kZXJlciB0aGlzXHJcbiAgICBAZm9udCA9IFwiZGFya2ZvcmVzdFwiXHJcbiAgICBAem9uZXMgPSBbXVxyXG4gICAgQG5leHRBSVRpY2sgPSAxMDAwICMgd2lsbCBiZSBzZXQgYnkgb3B0aW9uc1xyXG4gICAgQGNlbnRlciA9XHJcbiAgICAgIHg6IEB3aWR0aCAvIDJcclxuICAgICAgeTogQGhlaWdodCAvIDJcclxuICAgIEBhYUhlaWdodCA9IEB3aWR0aCAqIDkgLyAxNlxyXG4gICAgQGxvZyBcImhlaWdodDogI3tAaGVpZ2h0fS4gaGVpZ2h0IGlmIHNjcmVlbiB3YXMgMTY6OSAoYXNwZWN0IGFkanVzdGVkKTogI3tAYWFIZWlnaHR9XCJcclxuICAgIEBwYXVzZUJ1dHRvblNpemUgPSBAYWFIZWlnaHQgLyAxMlxyXG4gICAgQGNvbG9ycyA9XHJcbiAgICAgIGFycm93OiAgICAgIHsgcjogICAxLCBnOiAgIDEsIGI6ICAgMSwgYTogICAxIH1cclxuICAgICAgYXJyb3djbG9zZTogeyByOiAgIDEsIGc6IDAuNSwgYjogICAwLCBhOiAwLjMgfVxyXG4gICAgICBiYWNrZ3JvdW5kOiB7IHI6ICAgMCwgZzogMC4yLCBiOiAgIDAsIGE6ICAgMSB9XHJcbiAgICAgIGJpZDogICAgICAgIHsgcjogICAwLCBnOiAwLjYsIGI6ICAgMCwgYTogICAxIH1cclxuICAgICAgYmxhY2s6ICAgICAgeyByOiAgIDAsIGc6ICAgMCwgYjogICAwLCBhOiAgIDEgfVxyXG4gICAgICBidXR0b250ZXh0OiB7IHI6ICAgMSwgZzogICAxLCBiOiAgIDEsIGE6ICAgMSB9XHJcbiAgICAgIGdhbWVfb3ZlcjogIHsgcjogICAxLCBnOiAwLjUsIGI6ICAgMCwgYTogICAxIH1cclxuICAgICAgZ29sZDogICAgICAgeyByOiAgIDEsIGc6ICAgMSwgYjogICAwLCBhOiAgIDEgfVxyXG4gICAgICBoYW5kX2FueTogICB7IHI6ICAgMCwgZzogICAwLCBiOiAwLjIsIGE6IDEuMCB9XHJcbiAgICAgIGhhbmRfcGljazogIHsgcjogICAwLCBnOiAwLjEsIGI6ICAgMCwgYTogMS4wIH1cclxuICAgICAgaGFuZF9kcmFnOiAgeyByOiAwLjQsIGc6ICAgMCwgYjogICAwLCBhOiAxLjAgfVxyXG4gICAgICBoYW5kX3B1c2g6ICB7IHI6IDAuMiwgZzogICAwLCBiOiAwLjIsIGE6IDEuMCB9XHJcbiAgICAgIGxpZ2h0Z3JheTogIHsgcjogMC41LCBnOiAwLjUsIGI6IDAuNSwgYTogICAxIH1cclxuICAgICAgbG9nYmc6ICAgICAgeyByOiAwLjEsIGc6ICAgMCwgYjogICAwLCBhOiAgIDEgfVxyXG4gICAgICBsb2djb2xvcjogICB7IHI6IDAuNSwgZzogMC41LCBiOiAwLjUsIGE6ICAgMSB9XHJcbiAgICAgIG1haW5tZW51OiAgIHsgcjogMC4xLCBnOiAwLjEsIGI6IDAuMSwgYTogICAxIH1cclxuICAgICAgb3JhbmdlOiAgICAgeyByOiAgIDEsIGc6IDAuNSwgYjogICAwLCBhOiAgIDEgfVxyXG4gICAgICBvdmVybGF5OiAgICB7IHI6ICAgMCwgZzogICAwLCBiOiAgIDAsIGE6IDAuNiB9XHJcbiAgICAgIHBhdXNlbWVudTogIHsgcjogMC4xLCBnOiAwLjAsIGI6IDAuMSwgYTogICAxIH1cclxuICAgICAgb3B0aW9ubWVudTogeyByOiAwLjAsIGc6IDAuMSwgYjogMC4xLCBhOiAgIDEgfVxyXG4gICAgICBwaWxlOiAgICAgICB7IHI6IDAuNCwgZzogMC4yLCBiOiAgIDAsIGE6ICAgMSB9XHJcbiAgICAgIHBsYXlfYWdhaW46IHsgcjogICAwLCBnOiAgIDAsIGI6ICAgMCwgYTogMC42IH1cclxuICAgICAgcmVkOiAgICAgICAgeyByOiAgIDEsIGc6ICAgMCwgYjogICAwLCBhOiAgIDEgfVxyXG4gICAgICB3aGl0ZTogICAgICB7IHI6ICAgMSwgZzogICAxLCBiOiAgIDEsIGE6ICAgMSB9XHJcbiAgICAgIGFjaF9iZzogICAgIHsgcjogMC4xLCBnOiAwLjEsIGI6IDAuMSwgYTogICAxIH1cclxuICAgICAgYWNoX2hlYWRlcjogeyByOiAgIDEsIGc6IDAuNSwgYjogICAwLCBhOiAgIDEgfVxyXG4gICAgICBhY2hfdGl0bGU6ICB7IHI6ICAgMSwgZzogICAxLCBiOiAgIDEsIGE6ICAgMSB9XHJcbiAgICAgIGFjaF9kZXNjOiAgIHsgcjogMC43LCBnOiAwLjcsIGI6IDAuNywgYTogICAxIH1cclxuICAgICAgYWNoX2J1dHRvbjogeyByOiAwLjcsIGc6IDAuNywgYjogMC4zLCBhOiAgIDEgfVxyXG4gICAgICB0cmFuc3BhcmVudDp7IHI6ICAgMSwgZzogICAxLCBiOiAgIDEsIGE6ICAgMCB9XHJcblxyXG4gICAgQHRleHR1cmVzID1cclxuICAgICAgXCJjYXJkc1wiOiAwXHJcbiAgICAgIFwiZGFya2ZvcmVzdFwiOiAxXHJcbiAgICAgIFwiY2hhcnNcIjogMlxyXG4gICAgICBcImhvdzFcIjogM1xyXG4gICAgICBcImhvdzJcIjogNFxyXG4gICAgICBcImhvdzNcIjogNVxyXG5cclxuICAgIEB0aGlydGVlbiA9IG51bGxcclxuICAgIEBsYXN0RXJyID0gJydcclxuICAgIEByZW5kZXJNb2RlID0gUmVuZGVyTW9kZS5HQU1FXHJcbiAgICBAcmVuZGVyQ29tbWFuZHMgPSBbXVxyXG4gICAgQGFjaGlldmVtZW50RmFuZmFyZSA9IG51bGxcclxuICAgIEBhY2hpZXZlbWVudHNQYWdlID0gMFxyXG4gICAgQGhvd3RvUGFnZSA9IDBcclxuXHJcbiAgICAjIGFjaGlldmVtZW50cyBkZWJ1Z2dpbmdcclxuICAgICMgQHJlbmRlck1vZGUgPSBSZW5kZXJNb2RlLkFDSElFVkVNRU5UU1xyXG4gICAgIyBAYWNoaWV2ZW1lbnRzUGFnZSA9IDFcclxuXHJcbiAgICBAb3B0aW9uTWVudXMgPVxyXG4gICAgICBzcGVlZHM6IFtcclxuICAgICAgICB7IHRleHQ6IFwiQUkgU3BlZWQ6IFNsb3dcIiwgc3BlZWQ6IDIwMDAgfVxyXG4gICAgICAgIHsgdGV4dDogXCJBSSBTcGVlZDogTWVkaXVtXCIsIHNwZWVkOiAxMDAwIH1cclxuICAgICAgICB7IHRleHQ6IFwiQUkgU3BlZWQ6IEZhc3RcIiwgc3BlZWQ6IDUwMCB9XHJcbiAgICAgICAgeyB0ZXh0OiBcIkFJIFNwZWVkOiBVbHRyYVwiLCBzcGVlZDogMjUwIH1cclxuICAgICAgXVxyXG4gICAgICBzb3J0czogW1xyXG4gICAgICAgIHsgdGV4dDogXCJTb3J0IE9yZGVyOiBOb3JtYWxcIiB9XHJcbiAgICAgICAgeyB0ZXh0OiBcIlNvcnQgT3JkZXI6IFJldmVyc2VcIiB9XHJcbiAgICAgIF1cclxuICAgICAgYXV0b3Bhc3NlczogW1xyXG4gICAgICAgIHsgdGV4dDogXCJBdXRvUGFzczogRGlzYWJsZWRcIiB9XHJcbiAgICAgICAgeyB0ZXh0OiBcIkF1dG9QYXNzOiBGdWxsXCIgfVxyXG4gICAgICAgIHsgdGV4dDogXCJBdXRvUGFzczogTGltaXRlZFwiIH1cclxuICAgICAgXVxyXG4gICAgQG9wdGlvbnMgPVxyXG4gICAgICBzcGVlZEluZGV4OiAxXHJcbiAgICAgIHNvcnRJbmRleDogMFxyXG4gICAgICBzb3VuZDogdHJ1ZVxyXG4gICAgICBhdXRvcGFzc0luZGV4OiAyXHJcbiAgICAgIHB1c2hTb3J0aW5nOiBmYWxzZVxyXG4gICAgICBnaXZpbmdVcDogdHJ1ZVxyXG4gICAgICBwYXNzQnJlYWs6IHRydWVcclxuXHJcbiAgICBAcGF1c2VNZW51ID0gbmV3IE1lbnUgdGhpcywgXCJQYXVzZWRcIiwgXCJzb2xpZFwiLCBAY29sb3JzLnBhdXNlbWVudSwgW1xyXG4gICAgICAoY2xpY2spID0+XHJcbiAgICAgICAgaWYgY2xpY2tcclxuICAgICAgICAgIEByZW5kZXJNb2RlID0gUmVuZGVyTW9kZS5HQU1FXHJcbiAgICAgICAgcmV0dXJuIFwiUmVzdW1lIEdhbWVcIlxyXG4gICAgICAoY2xpY2spID0+XHJcbiAgICAgICAgaWYgY2xpY2tcclxuICAgICAgICAgIEByZW5kZXJNb2RlID0gUmVuZGVyTW9kZS5PUFRJT05TXHJcbiAgICAgICAgcmV0dXJuIFwiT3B0aW9uc1wiXHJcbiAgICAgIChjbGljaykgPT5cclxuICAgICAgICBpZiBjbGlja1xyXG4gICAgICAgICAgQHJlbmRlck1vZGUgPSBSZW5kZXJNb2RlLkFDSElFVkVNRU5UU1xyXG4gICAgICAgIHJldHVybiBcIkFjaGlldmVtZW50c1wiXHJcbiAgICAgIChjbGljaykgPT5cclxuICAgICAgICBpZiBjbGlja1xyXG4gICAgICAgICAgQHJlbmRlck1vZGUgPSBSZW5kZXJNb2RlLkhPV1RPXHJcbiAgICAgICAgcmV0dXJuIFwiSG93IFRvIFBsYXlcIlxyXG4gICAgICAoY2xpY2spID0+XHJcbiAgICAgICAgaWYgY2xpY2tcclxuICAgICAgICAgIEBuZXdHYW1lKHRydWUpXHJcbiAgICAgICAgICBAcmVuZGVyTW9kZSA9IFJlbmRlck1vZGUuR0FNRVxyXG4gICAgICAgIHJldHVybiBcIk5ldyBNb25leSBHYW1lXCJcclxuICAgICAgKGNsaWNrKSA9PlxyXG4gICAgICAgIGlmIGNsaWNrXHJcbiAgICAgICAgICBAbmV3R2FtZShmYWxzZSlcclxuICAgICAgICAgIEByZW5kZXJNb2RlID0gUmVuZGVyTW9kZS5HQU1FXHJcbiAgICAgICAgcmV0dXJuIFwiTmV3IEdhbWVcIlxyXG4gICAgXVxyXG5cclxuICAgIEBvcHRpb25NZW51ID0gbmV3IE1lbnUgdGhpcywgXCJPcHRpb25zXCIsIFwic29saWRcIiwgQGNvbG9ycy5vcHRpb25tZW51LCBbXHJcbiAgICAgIChjbGljaykgPT5cclxuICAgICAgICBpZiBjbGlja1xyXG4gICAgICAgICAgQG9wdGlvbnMuc3BlZWRJbmRleCA9IChAb3B0aW9ucy5zcGVlZEluZGV4ICsgMSkgJSBAb3B0aW9uTWVudXMuc3BlZWRzLmxlbmd0aFxyXG4gICAgICAgIHJldHVybiBAb3B0aW9uTWVudXMuc3BlZWRzW0BvcHRpb25zLnNwZWVkSW5kZXhdLnRleHRcclxuICAgICAgKGNsaWNrKSA9PlxyXG4gICAgICAgIGlmIGNsaWNrXHJcbiAgICAgICAgICBAb3B0aW9ucy5hdXRvcGFzc0luZGV4ID0gKEBvcHRpb25zLmF1dG9wYXNzSW5kZXggKyAxKSAlIEBvcHRpb25NZW51cy5hdXRvcGFzc2VzLmxlbmd0aFxyXG4gICAgICAgIHJldHVybiBAb3B0aW9uTWVudXMuYXV0b3Bhc3Nlc1tAb3B0aW9ucy5hdXRvcGFzc0luZGV4XS50ZXh0XHJcbiAgICAgIChjbGljaykgPT5cclxuICAgICAgICBpZiBjbGlja1xyXG4gICAgICAgICAgQG9wdGlvbnMuc29ydEluZGV4ID0gKEBvcHRpb25zLnNvcnRJbmRleCArIDEpICUgQG9wdGlvbk1lbnVzLnNvcnRzLmxlbmd0aFxyXG4gICAgICAgIHJldHVybiBAb3B0aW9uTWVudXMuc29ydHNbQG9wdGlvbnMuc29ydEluZGV4XS50ZXh0XHJcbiAgICAgIChjbGljaykgPT5cclxuICAgICAgICBpZiBjbGlja1xyXG4gICAgICAgICAgQG9wdGlvbnMuZ2l2aW5nVXAgPSAhQG9wdGlvbnMuZ2l2aW5nVXBcclxuICAgICAgICBpZiBAb3B0aW9ucy5naXZpbmdVcFxyXG4gICAgICAgICAgcmV0dXJuIFwiR2l2aW5nIFVwOiBFbmFibGVkXCJcclxuICAgICAgICByZXR1cm4gXCJHaXZpbmcgVXA6IERpc2FibGVkXCJcclxuICAgICAgKGNsaWNrKSA9PlxyXG4gICAgICAgIGlmIGNsaWNrXHJcbiAgICAgICAgICBAb3B0aW9ucy5wYXNzQnJlYWsgPSAhQG9wdGlvbnMucGFzc0JyZWFrXHJcbiAgICAgICAgaWYgQG9wdGlvbnMucGFzc0JyZWFrXHJcbiAgICAgICAgICByZXR1cm4gXCJQYXNzIEJyZWFrczogRW5hYmxlZFwiXHJcbiAgICAgICAgcmV0dXJuIFwiUGFzcyBCcmVha3M6IERpc2FibGVkXCJcclxuICAgICAgKGNsaWNrKSA9PlxyXG4gICAgICAgIGlmIGNsaWNrXHJcbiAgICAgICAgICBAb3B0aW9ucy5wdXNoU29ydGluZyA9ICFAb3B0aW9ucy5wdXNoU29ydGluZ1xyXG4gICAgICAgIGlmIEBvcHRpb25zLnB1c2hTb3J0aW5nXHJcbiAgICAgICAgICByZXR1cm4gXCJQdXNoIFNvcnRpbmc6IEVuYWJsZWRcIlxyXG4gICAgICAgIHJldHVybiBcIlB1c2ggU29ydGluZzogRGlzYWJsZWRcIlxyXG4gICAgICAoY2xpY2spID0+XHJcbiAgICAgICAgaWYgY2xpY2tcclxuICAgICAgICAgIEByZW5kZXJNb2RlID0gUmVuZGVyTW9kZS5QQVVTRVxyXG4gICAgICAgIHJldHVybiBcIkJhY2tcIlxyXG4gICAgXVxyXG5cclxuICAgIEB0aGlydGVlbiA9IG5ldyBUaGlydGVlbiB0aGlzLCB7fVxyXG4gICAgQGxvZyBcInBsYXllciAwJ3MgaGFuZDogXCIgKyBKU09OLnN0cmluZ2lmeShAdGhpcnRlZW4ucGxheWVyc1swXS5oYW5kKVxyXG4gICAgQHByZXBhcmVHYW1lKClcclxuXHJcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICMgbG9nZ2luZ1xyXG5cclxuICBsb2c6IChzKSAtPlxyXG4gICAgQG5hdGl2ZS5sb2cocylcclxuXHJcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICMgbG9hZCAvIHNhdmVcclxuXHJcbiAgbG9hZDogKGpzb24pIC0+XHJcbiAgICBAbG9nIFwiKENTKSBsb2FkaW5nIHN0YXRlXCJcclxuICAgIHRyeVxyXG4gICAgICBzdGF0ZSA9IEpTT04ucGFyc2UganNvblxyXG4gICAgY2F0Y2hcclxuICAgICAgQGxvZyBcImxvYWQgZmFpbGVkIHRvIHBhcnNlIHN0YXRlOiAje2pzb259XCJcclxuICAgICAgcmV0dXJuXHJcbiAgICBpZiBzdGF0ZS5vcHRpb25zXHJcbiAgICAgIGZvciBrLCB2IG9mIHN0YXRlLm9wdGlvbnNcclxuICAgICAgICBAb3B0aW9uc1trXSA9IHZcclxuXHJcbiAgICBpZiBzdGF0ZS50aGlydGVlblxyXG4gICAgICBAbG9nIFwicmVjcmVhdGluZyBnYW1lIGZyb20gc2F2ZWRhdGFcIlxyXG4gICAgICBAdGhpcnRlZW4gPSBuZXcgVGhpcnRlZW4gdGhpcywge1xyXG4gICAgICAgIHN0YXRlOiBzdGF0ZS50aGlydGVlblxyXG4gICAgICB9XHJcbiAgICAgIEBwcmVwYXJlR2FtZSgpXHJcblxyXG4gIHNhdmU6IC0+XHJcbiAgICAjIEBsb2cgXCIoQ1MpIHNhdmluZyBzdGF0ZVwiXHJcbiAgICBzdGF0ZSA9IHtcclxuICAgICAgb3B0aW9uczogQG9wdGlvbnNcclxuICAgIH1cclxuXHJcbiAgICBpZiBAdGhpcnRlZW4/XHJcbiAgICAgIEB0aGlydGVlbi51cGRhdGVQbGF5ZXJIYW5kKEBoYW5kLmNhcmRzKVxyXG4gICAgICBzdGF0ZS50aGlydGVlbiA9IEB0aGlydGVlbi5zYXZlKClcclxuXHJcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkgc3RhdGVcclxuXHJcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICBhaVRpY2tSYXRlOiAtPlxyXG4gICAgcmV0dXJuIEBvcHRpb25NZW51cy5zcGVlZHNbQG9wdGlvbnMuc3BlZWRJbmRleF0uc3BlZWRcclxuXHJcbiAgbmV3R2FtZTogKG1vbmV5KSAtPlxyXG4gICAgQHRoaXJ0ZWVuLm5ld0dhbWUobW9uZXkpXHJcbiAgICBAcHJlcGFyZUdhbWUoKVxyXG5cclxuICBwcmVwYXJlR2FtZTogLT5cclxuICAgIEBoYW5kID0gbmV3IEhhbmQgdGhpc1xyXG4gICAgQHBpbGUgPSBuZXcgUGlsZSB0aGlzLCBAaGFuZFxyXG4gICAgQGhhbmQuc2V0IEB0aGlydGVlbi5wbGF5ZXJzWzBdLmhhbmRcclxuICAgIEBsYXN0RXJyID0gJydcclxuXHJcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICMgaW5wdXQgaGFuZGxpbmdcclxuXHJcbiAgdG91Y2hEb3duOiAoeCwgeSkgLT5cclxuICAgICMgQGxvZyhcInRvdWNoRG93biAje3h9LCN7eX1cIilcclxuICAgIEBjaGVja1pvbmVzKHgsIHkpXHJcblxyXG4gIHRvdWNoTW92ZTogKHgsIHkpIC0+XHJcbiAgICAjIEBsb2coXCJ0b3VjaE1vdmUgI3t4fSwje3l9XCIpXHJcbiAgICBpZiBAdGhpcnRlZW4gIT0gbnVsbFxyXG4gICAgICBAaGFuZC5tb3ZlKHgsIHkpXHJcblxyXG4gIHRvdWNoVXA6ICh4LCB5KSAtPlxyXG4gICAgIyBAbG9nKFwidG91Y2hVcCAje3h9LCN7eX1cIilcclxuICAgIGlmIEB0aGlydGVlbiAhPSBudWxsXHJcbiAgICAgIEBoYW5kLnVwKHgsIHkpXHJcblxyXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAjIGhlYWRsaW5lIChnYW1lIHN0YXRlIGluIHRvcCBsZWZ0KVxyXG5cclxuICBwcmV0dHlFcnJvclRhYmxlOiB7XHJcbiAgICAgIGdhbWVPdmVyOiAgICAgICAgICAgXCJUaGUgZ2FtZSBpcyBvdmVyLlwiXHJcbiAgICAgIGludmFsaWRQbGF5OiAgICAgICAgXCJOb3QgYSB2YWxpZCBwbGF5LlwiXHJcbiAgICAgIG11c3RCcmVha09yUGFzczogICAgXCJZb3UgcGFzc2VkIGFscmVhZHksIHNvIDItYnJlYWtlciBvciBwYXNzLlwiXHJcbiAgICAgIG11c3RQYXNzOiAgICAgICAgICAgXCJZb3UgbXVzdCBwYXNzLlwiXHJcbiAgICAgIG11c3RUaHJvdzNTOiAgICAgICAgXCJZb3UgbXVzdCB1c2UgdGhlIDNcXHhjOCBpbiB5b3VyIHBsYXkuXCJcclxuICAgICAgbm90WW91clR1cm46ICAgICAgICBcIkl0IGlzIG5vdCB5b3VyIHR1cm4uXCJcclxuICAgICAgdGhyb3dBbnl0aGluZzogICAgICBcIllvdSBoYXZlIGNvbnRyb2wsIHRocm93IGFueXRoaW5nLlwiXHJcbiAgICAgIHRvb0xvd1BsYXk6ICAgICAgICAgXCJUaGlzIHBsYXkgaXMgbm90IHN0cm9uZ2VyIHRoYW4gdGhlIGN1cnJlbnQgcGxheS5cIlxyXG4gICAgICB3cm9uZ1BsYXk6ICAgICAgICAgIFwiVGhpcyBwbGF5IGRvZXMgbm90IG1hdGNoIHRoZSBjdXJyZW50IHBsYXkuXCJcclxuICB9XHJcblxyXG4gIHByZXR0eUVycm9yOiAtPlxyXG4gICAgcHJldHR5ID0gQHByZXR0eUVycm9yVGFibGVbQGxhc3RFcnJdXHJcbiAgICByZXR1cm4gcHJldHR5IGlmIHByZXR0eVxyXG4gICAgcmV0dXJuIEBsYXN0RXJyXHJcblxyXG4gIGNhbGNIZWFkbGluZTogLT5cclxuICAgIHJldHVybiBcIlwiIGlmIEB0aGlydGVlbiA9PSBudWxsXHJcblxyXG4gICAgaGVhZGxpbmUgPSBAdGhpcnRlZW4uaGVhZGxpbmUoKVxyXG4gICAgIyBzd2l0Y2ggQHRoaXJ0ZWVuLnN0YXRlXHJcbiAgICAjICAgd2hlbiBTdGF0ZS5CSURcclxuICAgICMgICAgIGhlYWRsaW5lID0gXCJXYWl0aW5nIGZvciBgZmY3NzAwYCN7QHRoaXJ0ZWVuLnBsYXllcnNbQHRoaXJ0ZWVuLnR1cm5dLm5hbWV9YGAgdG8gYGZmZmYwMGBiaWRgYFwiXHJcbiAgICAjICAgd2hlbiBTdGF0ZS5UUklDS1xyXG4gICAgIyAgICAgaGVhZGxpbmUgPSBcIldhaXRpbmcgZm9yIGBmZjc3MDBgI3tAdGhpcnRlZW4ucGxheWVyc1tAdGhpcnRlZW4udHVybl0ubmFtZX1gYCB0byBgZmZmZjAwYHBsYXlgYFwiXHJcbiAgICAjICAgd2hlbiBTdGF0ZS5ST1VORFNVTU1BUllcclxuICAgICMgICAgIGhlYWRsaW5lID0gXCJXYWl0aW5nIGZvciBuZXh0IHJvdW5kLi4uXCJcclxuICAgICMgICB3aGVuIFN0YXRlLlBPU1RHQU1FU1VNTUFSWVxyXG4gICAgIyAgICAgaGVhZGxpbmUgPSBcIkdhbWUgb3ZlciFcIlxyXG5cclxuICAgIGVyclRleHQgPSBcIlwiXHJcbiAgICBpZiAoQGxhc3RFcnIubGVuZ3RoID4gMCkgYW5kIChAbGFzdEVyciAhPSBPSylcclxuICAgICAgZXJyVGV4dCA9IFwiICBgZmZmZmZmYEVSUk9SOiBgZmYwMDAwYCN7QHByZXR0eUVycm9yKCl9XCJcclxuICAgICAgaGVhZGxpbmUgKz0gZXJyVGV4dFxyXG5cclxuICAgIHJldHVybiBoZWFkbGluZVxyXG5cclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgIyBnYW1lIG92ZXIgaW5mb3JtYXRpb25cclxuXHJcbiAgZ2FtZU92ZXJUZXh0OiAtPlxyXG4gICAgd2lubmVyID0gQHRoaXJ0ZWVuLndpbm5lcigpXHJcbiAgICBmaXJzdExpbmUgPSBcIiN7d2lubmVyLm5hbWV9IHdpbnMhXCJcclxuICAgIHNlY29uZExpbmUgPSBcIlRyeSBBZ2Fpbi4uLlwiXHJcbiAgICBpZiB3aW5uZXIubmFtZSA9PSBcIlBsYXllclwiXHJcbiAgICAgIGZpcnN0TGluZSA9IFwiWW91IHdpbiFcIlxyXG4gICAgICBpZiBAdGhpcnRlZW4ubGFzdFN0cmVhayA9PSAxXHJcbiAgICAgICAgc2Vjb25kTGluZSA9IFwiQSBuZXcgc3RyZWFrIVwiXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBzZWNvbmRMaW5lID0gXCIje0B0aGlydGVlbi5sYXN0U3RyZWFrfSBpbiBhIHJvdyFcIlxyXG4gICAgZWxzZVxyXG4gICAgICBpZiBAdGhpcnRlZW4ubGFzdFN0cmVhayA9PSAwXHJcbiAgICAgICAgc2Vjb25kTGluZSA9IFwiVHJ5IGFnYWluLi4uXCJcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHNlY29uZExpbmUgPSBcIlN0cmVhayBlbmRlZDogI3tAdGhpcnRlZW4ubGFzdFN0cmVha30gd2luc1wiXHJcbiAgICBpZiBAdGhpcnRlZW4uc29tZW9uZUdhdmVVcCgpXHJcbiAgICAgIG1vbmV5RGVsdGEgPSBAdGhpcnRlZW4ucGxheWVyc1swXS5tb25leSAtIFRoaXJ0ZWVuLlNUQVJUSU5HX01PTkVZXHJcbiAgICAgIGlmIG1vbmV5RGVsdGEgPiAwXHJcbiAgICAgICAgc2Vjb25kTGluZSA9IFwiR2FtZSBPdmVyOiBZb3Ugd29uICQje21vbmV5RGVsdGF9XCJcclxuICAgICAgZWxzZSBpZiBtb25leURlbHRhIDwgMFxyXG4gICAgICAgIHNlY29uZExpbmUgPSBcIkdhbWUgT3ZlcjogWW91IGxvc3QgJCN7LTEgKiBtb25leURlbHRhfVwiXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBzZWNvbmRMaW5lID0gXCJHYW1lIE92ZXI6IFlvdSBicm9rZSBldmVuIVwiXHJcbiAgICByZXR1cm4gW2ZpcnN0TGluZSwgc2Vjb25kTGluZV1cclxuXHJcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICMgY2FyZCBoYW5kbGluZ1xyXG5cclxuICBwYXNzOiAtPlxyXG4gICAgQGxhc3RFcnIgPSBAdGhpcnRlZW4ucGFzcyB7XHJcbiAgICAgIGlkOiAxXHJcbiAgICB9XHJcblxyXG4gIHBsYXk6IChjYXJkcykgLT5cclxuICAgIGNvbnNvbGUubG9nIFwiKGdhbWUpIHBsYXlpbmcgY2FyZHNcIiwgY2FyZHNcclxuXHJcbiAgICBAdGhpcnRlZW4udXBkYXRlUGxheWVySGFuZChAaGFuZC5jYXJkcylcclxuXHJcbiAgICByYXdDYXJkcyA9IFtdXHJcbiAgICBmb3IgY2FyZCBpbiBjYXJkc1xyXG4gICAgICByYXdDYXJkcy5wdXNoIGNhcmQuY2FyZFxyXG5cclxuICAgIHJldCA9IEB0aGlydGVlbi5wbGF5IHtcclxuICAgICAgaWQ6IDFcclxuICAgICAgY2FyZHM6IHJhd0NhcmRzXHJcbiAgICB9XHJcbiAgICBAbGFzdEVyciA9IHJldFxyXG4gICAgaWYgcmV0ID09IE9LXHJcbiAgICAgIEBoYW5kLnNldCBAdGhpcnRlZW4ucGxheWVyc1swXS5oYW5kXHJcbiAgICAgIEBwaWxlLmhpbnQgY2FyZHNcclxuXHJcbiAgcGxheVBpY2tlZDogLT5cclxuICAgIGlmIG5vdCBAaGFuZC5waWNraW5nKClcclxuICAgICAgcmV0dXJuXHJcbiAgICBjYXJkcyA9IEBoYW5kLnNlbGVjdGVkQ2FyZHMoKVxyXG4gICAgIyBAaGFuZC5zZWxlY3ROb25lKClcclxuICAgIGlmIGNhcmRzLmxlbmd0aCA9PSAwXHJcbiAgICAgIHJldHVybiBAcGFzcygpXHJcbiAgICByZXR1cm4gQHBsYXkoY2FyZHMpXHJcblxyXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAjIG1haW4gbG9vcFxyXG5cclxuICB1cGRhdGU6IChkdCkgLT5cclxuICAgIEB6b25lcy5sZW5ndGggPSAwICMgZm9yZ2V0IGFib3V0IHpvbmVzIGZyb20gdGhlIGxhc3QgZnJhbWUuIHdlJ3JlIGFib3V0IHRvIG1ha2Ugc29tZSBuZXcgb25lcyFcclxuXHJcbiAgICB1cGRhdGVkID0gZmFsc2VcclxuICAgIGlmIEB1cGRhdGVHYW1lKGR0KVxyXG4gICAgICB1cGRhdGVkID0gdHJ1ZVxyXG5cclxuICAgIHJldHVybiB1cGRhdGVkXHJcblxyXG4gIHVwZGF0ZUdhbWU6IChkdCkgLT5cclxuICAgIHJldHVybiBmYWxzZSBpZiBAdGhpcnRlZW4gPT0gbnVsbFxyXG5cclxuICAgIHVwZGF0ZWQgPSBmYWxzZVxyXG5cclxuICAgIGlmIEBwaWxlLnVwZGF0ZShkdClcclxuICAgICAgdXBkYXRlZCA9IHRydWVcclxuICAgIGlmIEBwaWxlLnJlYWR5Rm9yTmV4dFRyaWNrKClcclxuICAgICAgQG5leHRBSVRpY2sgLT0gZHRcclxuICAgICAgaWYgQG5leHRBSVRpY2sgPD0gMFxyXG4gICAgICAgIEBuZXh0QUlUaWNrID0gQGFpVGlja1JhdGUoKVxyXG4gICAgICAgIGlmIEB0aGlydGVlbi5haVRpY2soKVxyXG4gICAgICAgICAgdXBkYXRlZCA9IHRydWVcclxuICAgIGlmIEBoYW5kLnVwZGF0ZShkdClcclxuICAgICAgdXBkYXRlZCA9IHRydWVcclxuXHJcbiAgICBAcGlsZS5zZXQgQHRoaXJ0ZWVuLnRocm93SUQsIEB0aGlydGVlbi5waWxlLCBAdGhpcnRlZW4ucGlsZVdob1xyXG5cclxuICAgIGlmIEBwYXVzZU1lbnUudXBkYXRlKGR0KVxyXG4gICAgICB1cGRhdGVkID0gdHJ1ZVxyXG5cclxuICAgIGlmIEBvcHRpb25NZW51LnVwZGF0ZShkdClcclxuICAgICAgdXBkYXRlZCA9IHRydWVcclxuXHJcbiAgICBpZiBAYWNoaWV2ZW1lbnRGYW5mYXJlICE9IG51bGxcclxuICAgICAgQGFjaGlldmVtZW50RmFuZmFyZS50aW1lICs9IGR0XHJcbiAgICAgIGlmIEBhY2hpZXZlbWVudEZhbmZhcmUudGltZSA+IDUwMDBcclxuICAgICAgICBAYWNoaWV2ZW1lbnRGYW5mYXJlID0gbnVsbFxyXG4gICAgICB1cGRhdGVkID0gdHJ1ZVxyXG5cclxuICAgIGlmIEBhY2hpZXZlbWVudEZhbmZhcmUgPT0gbnVsbFxyXG4gICAgICBpZiBAdGhpcnRlZW4uZmFuZmFyZXMubGVuZ3RoID4gMFxyXG4gICAgICAgIEBhY2hpZXZlbWVudEZhbmZhcmUgPVxyXG4gICAgICAgICAgdGl0bGU6IEB0aGlydGVlbi5mYW5mYXJlcy5zaGlmdCgpXHJcbiAgICAgICAgICB0aW1lOiAwXHJcblxyXG4gICAgcmV0dXJuIHVwZGF0ZWRcclxuXHJcbiAgcmVuZGVyOiAtPlxyXG4gICAgIyBSZXNldCByZW5kZXIgY29tbWFuZHNcclxuICAgIEByZW5kZXJDb21tYW5kcy5sZW5ndGggPSAwXHJcblxyXG4gICAgc3dpdGNoIEByZW5kZXJNb2RlXHJcbiAgICAgIHdoZW4gUmVuZGVyTW9kZS5IT1dUT1xyXG4gICAgICAgIEByZW5kZXJIb3d0bygpXHJcbiAgICAgIHdoZW4gUmVuZGVyTW9kZS5BQ0hJRVZFTUVOVFNcclxuICAgICAgICBAcmVuZGVyQWNoaWV2ZW1lbnRzKClcclxuICAgICAgd2hlbiBSZW5kZXJNb2RlLk9QVElPTlNcclxuICAgICAgICBAcmVuZGVyT3B0aW9ucygpXHJcbiAgICAgIHdoZW4gUmVuZGVyTW9kZS5QQVVTRVxyXG4gICAgICAgIEByZW5kZXJQYXVzZSgpXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBAcmVuZGVyR2FtZSgpXHJcblxyXG4gICAgcmV0dXJuIEByZW5kZXJDb21tYW5kc1xyXG5cclxuICByZW5kZXJQYXVzZTogLT5cclxuICAgIEBwYXVzZU1lbnUucmVuZGVyKClcclxuXHJcbiAgcmVuZGVyT3B0aW9uczogLT5cclxuICAgIEBvcHRpb25NZW51LnJlbmRlcigpXHJcblxyXG4gIHJlbmRlckhvd3RvOiAtPlxyXG4gICAgaG93dG9QYWdlQ291bnQgPSAzXHJcbiAgICBob3d0b1RleHR1cmUgPSBcImhvdyN7QGhvd3RvUGFnZSsxfVwiXHJcbiAgICBAbG9nIFwicmVuZGVyaW5nICN7aG93dG9UZXh0dXJlfVwiXHJcbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIGhvd3RvVGV4dHVyZSwgMCwgMCwgQHdpZHRoLCBAYWFIZWlnaHQsIDAsIDAsIDAsIEBjb2xvcnMud2hpdGUsID0+XHJcbiAgICAgIEByZW5kZXJNb2RlID0gUmVuZGVyTW9kZS5QQVVTRVxyXG5cclxuICAgIGZvb3RlclRleHQgPSBcIlBhZ2UgI3tAaG93dG9QYWdlICsgMX0gLyAzXCJcclxuXHJcbiAgICB0aXRsZUhlaWdodCA9IEBoZWlnaHQgLyAyMFxyXG4gICAgdGl0bGVPZmZzZXQgPSB0aXRsZUhlaWdodCAvIDRcclxuICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCB0aXRsZUhlaWdodCwgZm9vdGVyVGV4dCwgQHdpZHRoIC0gdGl0bGVPZmZzZXQsIEBoZWlnaHQgLSB0aXRsZU9mZnNldCwgMSwgMSwgQGNvbG9ycy5hY2hfaGVhZGVyXHJcblxyXG4gICAgbmV4dERpbSA9IEB3aWR0aCAqIDAuMVxyXG4gICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIHRpdGxlSGVpZ2h0LCBcIlsgTmV4dCBdXCIsIEB3aWR0aCAtIHRpdGxlT2Zmc2V0LCB0aXRsZU9mZnNldCwgMSwgMCwgQGNvbG9ycy5hY2hfYnV0dG9uXHJcbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwic29saWRcIiwgQHdpZHRoIC0gbmV4dERpbSwgMCwgbmV4dERpbSwgbmV4dERpbSwgMCwgMCwgMCwgQGNvbG9ycy50cmFuc3BhcmVudCwgPT5cclxuICAgICAgQGhvd3RvUGFnZSA9IChAaG93dG9QYWdlICsgMSkgJSBob3d0b1BhZ2VDb3VudFxyXG5cclxuICBkZWJ1ZzogLT5cclxuICAgIGNvbnNvbGUubG9nIFwiZGVidWcgYWNoXCJcclxuICAgIGNvbnNvbGUubG9nIEB0aGlydGVlbi5hY2hcclxuICAgICMgQHRoaXJ0ZWVuLmFjaC5lYXJuZWQgPSB7fVxyXG4gICAgIyBAdGhpcnRlZW4uYWNoLmVhcm5lZC52ZXRlcmFuID0gdHJ1ZVxyXG4gICAgIyBAdGhpcnRlZW4uYWNoLmVhcm5lZC50cnloYXJkID0gdHJ1ZVxyXG4gICAgIyBAdGhpcnRlZW4uYWNoLmVhcm5lZC5icmVha2VyID0gdHJ1ZVxyXG4gICAgIyBAdGhpcnRlZW4uYWNoLmVhcm5lZC5rZWVwaXRsb3cgPSB0cnVlXHJcbiAgICAjIEB0aGlydGVlbi5hY2guZWFybmVkLnN1aXRlZCA9IHRydWVcclxuICAgICMgQHRoaXJ0ZWVuLmFjaC5lYXJuZWQudG9ueSA9IHRydWVcclxuICAgICMgQHRoaXJ0ZWVuLmFjaC5lYXJuZWQuc2FtcGxlciA9IHRydWVcclxuICAgICMgQHRoaXJ0ZWVuLmFjaC5lYXJuZWQudHJhZ2VkeSA9IHRydWVcclxuICAgICMgQHRoaXJ0ZWVuLmFjaC5lYXJuZWQuaW5kb21pdGFibGUgPSB0cnVlXHJcbiAgICAjIEB0aGlydGVlbi5hY2guZWFybmVkLnJla3QgPSB0cnVlXHJcbiAgICAjIEB0aGlydGVlbi5hY2guZWFybmVkLmxhdGUgPSB0cnVlXHJcbiAgICAjIEB0aGlydGVlbi5hY2guZWFybmVkLnBhaXJzID0gdHJ1ZVxyXG5cclxuICAgICMgQHRoaXJ0ZWVuLmFjaC5zdGF0ZS50b3RhbEdhbWVzID0gMFxyXG4gICAgIyBAdGhpcnRlZW4uc3RyZWFrID0gMFxyXG5cclxuICByZW5kZXJBY2hpZXZlbWVudHM6IC0+XHJcbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwic29saWRcIiwgMCwgMCwgQHdpZHRoLCBAaGVpZ2h0LCAwLCAwLCAwLCBAY29sb3JzLmFjaF9iZywgPT5cclxuICAgICAgQHJlbmRlck1vZGUgPSBSZW5kZXJNb2RlLlBBVVNFXHJcblxyXG4gICAgYWNoaWV2ZW1lbnRzQ291bnQgPSBhY2hpZXZlbWVudHNMaXN0Lmxlbmd0aFxyXG4gICAgYWNoaWV2ZW1lbnRzUGFnZUNvdW50ID0gTWF0aC5jZWlsKGFjaGlldmVtZW50c0NvdW50IC8gMTQpXHJcbiAgICBhY2hpZXZlbWVudHNFYXJuZWQgPSAwXHJcbiAgICBmb3IgYWNoLCBhY2hJbmRleCBpbiBhY2hpZXZlbWVudHNMaXN0XHJcbiAgICAgIGlmIEB0aGlydGVlbi5hY2guZWFybmVkW2FjaC5pZF1cclxuICAgICAgICBhY2hpZXZlbWVudHNFYXJuZWQgKz0gMVxyXG5cclxuICAgIHRpdGxlVGV4dCA9IFwiQWNoaWV2ZW1lbnRzIC0gI3thY2hpZXZlbWVudHNFYXJuZWR9IC8gI3thY2hpZXZlbWVudHNDb3VudH0gQ29tcGxldGUgLSBQYWdlICN7QGFjaGlldmVtZW50c1BhZ2UgKyAxfSBvZiAje2FjaGlldmVtZW50c1BhZ2VDb3VudH1cIlxyXG5cclxuICAgIHRpdGxlSGVpZ2h0ID0gQGhlaWdodCAvIDIwXHJcbiAgICB0aXRsZU9mZnNldCA9IHRpdGxlSGVpZ2h0IC8gMlxyXG4gICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIHRpdGxlSGVpZ2h0LCB0aXRsZVRleHQsIEBjZW50ZXIueCwgdGl0bGVPZmZzZXQsIDAuNSwgMC41LCBAY29sb3JzLmFjaF9oZWFkZXJcclxuXHJcbiAgICBpZiBhY2hpZXZlbWVudHNQYWdlQ291bnQgPiAxXHJcbiAgICAgIG5leHREaW0gPSBAd2lkdGggKiAwLjFcclxuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIHRpdGxlSGVpZ2h0LCBcIlsgTmV4dCBdXCIsIEB3aWR0aCwgdGl0bGVPZmZzZXQsIDEsIDAuNSwgQGNvbG9ycy5hY2hfYnV0dG9uXHJcbiAgICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJzb2xpZFwiLCBAd2lkdGggLSBuZXh0RGltLCAwLCBuZXh0RGltLCBuZXh0RGltLCAwLCAwLCAwLCBAY29sb3JzLnRyYW5zcGFyZW50LCA9PlxyXG4gICAgICAgIEBhY2hpZXZlbWVudHNQYWdlID0gKEBhY2hpZXZlbWVudHNQYWdlICsgMSkgJSBhY2hpZXZlbWVudHNQYWdlQ291bnRcclxuXHJcbiAgICBpbWFnZU1hcmdpbiA9IEB3aWR0aCAvIDE1XHJcbiAgICB0b3BIZWlnaHQgPSB0aXRsZUhlaWdodFxyXG4gICAgeCA9IEB3aWR0aCAvIDEyMFxyXG4gICAgeSA9IHRvcEhlaWdodFxyXG4gICAgdGl0bGVIZWlnaHQgPSBAaGVpZ2h0IC8gMjJcclxuICAgIGRlc2NIZWlnaHQgPSBAaGVpZ2h0IC8gMzBcclxuICAgIGltYWdlRGltID0gdGl0bGVIZWlnaHQgKiAyXHJcbiAgICBzdGFydEFjaEluZGV4ID0gQGFjaGlldmVtZW50c1BhZ2UgKiAxNFxyXG4gICAgZW5kQWNoSW5kZXggPSBzdGFydEFjaEluZGV4ICsgMTRcclxuICAgIGlmIGVuZEFjaEluZGV4ID4gKGFjaGlldmVtZW50c0xpc3QubGVuZ3RoIC0gMSlcclxuICAgICAgZW5kQWNoSW5kZXggPSBhY2hpZXZlbWVudHNMaXN0Lmxlbmd0aCAtIDFcclxuICAgIGZvciBhY2hJbmRleCBpbiBbc3RhcnRBY2hJbmRleC4uZW5kQWNoSW5kZXhdXHJcbiAgICAgIGFjaFNjcmVlbkluZGV4ID0gYWNoSW5kZXggLSBzdGFydEFjaEluZGV4XHJcbiAgICAgIGFjaCA9IGFjaGlldmVtZW50c0xpc3RbYWNoSW5kZXhdXHJcbiAgICAgIGljb24gPSBcInN0YXJfb2ZmXCJcclxuICAgICAgaWYgQHRoaXJ0ZWVuLmFjaC5lYXJuZWRbYWNoLmlkXVxyXG4gICAgICAgIGljb24gPSBcInN0YXJfb25cIlxyXG4gICAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIGljb24sIHgsIHksIGltYWdlRGltLCBpbWFnZURpbSwgMCwgMCwgMCwgQGNvbG9ycy53aGl0ZVxyXG4gICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgdGl0bGVIZWlnaHQsIGFjaC50aXRsZSwgeCArIGltYWdlTWFyZ2luLCB5LCAwLCAwLCBAY29sb3JzLmFjaF90aXRsZVxyXG4gICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgZGVzY0hlaWdodCwgYWNoLmRlc2NyaXB0aW9uWzBdLCB4ICsgaW1hZ2VNYXJnaW4sIHkgKyB0aXRsZUhlaWdodCwgMCwgMCwgQGNvbG9ycy5hY2hfZGVzY1xyXG4gICAgICBpZiBhY2gucHJvZ3Jlc3M/XHJcbiAgICAgICAgcHJvZ3Jlc3MgPSBhY2gucHJvZ3Jlc3MoQHRoaXJ0ZWVuLmFjaClcclxuICAgICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgZGVzY0hlaWdodCwgcHJvZ3Jlc3MsIHggKyBpbWFnZU1hcmdpbiwgeSArIHRpdGxlSGVpZ2h0ICsgZGVzY0hlaWdodCwgMCwgMCwgQGNvbG9ycy5hY2hfZGVzY1xyXG4gICAgICBlbHNlXHJcbiAgICAgICAgaWYgYWNoLmRlc2NyaXB0aW9uLmxlbmd0aCA+IDFcclxuICAgICAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCBkZXNjSGVpZ2h0LCBhY2guZGVzY3JpcHRpb25bMV0sIHggKyBpbWFnZU1hcmdpbiwgeSArIHRpdGxlSGVpZ2h0ICsgZGVzY0hlaWdodCwgMCwgMCwgQGNvbG9ycy5hY2hfZGVzY1xyXG4gICAgICBpZiBhY2hTY3JlZW5JbmRleCA9PSA2XHJcbiAgICAgICAgeSA9IHRvcEhlaWdodFxyXG4gICAgICAgIHggKz0gQHdpZHRoIC8gMlxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgeSArPSB0aXRsZUhlaWdodCAqIDNcclxuXHJcbiAgcmVuZGVyQUlIYW5kOiAoaGFuZCwgeCwgeSwgb2Zmc2V0KSAtPlxyXG4gICAgc29ydGVkID0gaGFuZC5zb3J0IChhLCBiKSAtPiBhIC0gYlxyXG4gICAgZm9yIHJhdywgaSBpbiBzb3J0ZWRcclxuICAgICAgQGhhbmQucmVuZGVyQ2FyZCByYXcsIHggKyAoaSAqIG9mZnNldCksIHksIDAsIDAuNywgMFxyXG5cclxuICByZW5kZXJHYW1lOiAtPlxyXG5cclxuICAgICMgYmFja2dyb3VuZFxyXG4gICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcInNvbGlkXCIsIDAsIDAsIEB3aWR0aCwgQGhlaWdodCwgMCwgMCwgMCwgQGNvbG9ycy5iYWNrZ3JvdW5kXHJcblxyXG4gICAgdGV4dEhlaWdodCA9IEBhYUhlaWdodCAvIDI1XHJcbiAgICB0ZXh0UGFkZGluZyA9IHRleHRIZWlnaHQgLyA1XHJcbiAgICBjaGFyYWN0ZXJIZWlnaHQgPSBAYWFIZWlnaHQgLyA1XHJcbiAgICBjb3VudEhlaWdodCA9IHRleHRIZWlnaHRcclxuXHJcbiAgICBkcmF3R2FtZU92ZXIgPSBAdGhpcnRlZW4uZ2FtZU92ZXIoKSBhbmQgQHBpbGUucmVzdGluZygpXHJcblxyXG4gICAgIyBMb2dcclxuICAgIGZvciBsaW5lLCBpIGluIEB0aGlydGVlbi5sb2dcclxuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIHRleHRIZWlnaHQsIGxpbmUsIDAsIChpKzEuNSkgKiAodGV4dEhlaWdodCArIHRleHRQYWRkaW5nKSwgMCwgMCwgQGNvbG9ycy5sb2djb2xvclxyXG5cclxuICAgIGFpUGxheWVycyA9IFtcclxuICAgICAgQHRoaXJ0ZWVuLnBsYXllcnNbMV1cclxuICAgICAgQHRoaXJ0ZWVuLnBsYXllcnNbMl1cclxuICAgICAgQHRoaXJ0ZWVuLnBsYXllcnNbM11cclxuICAgIF1cclxuXHJcbiAgICBjaGFyYWN0ZXJNYXJnaW4gPSBjaGFyYWN0ZXJIZWlnaHQgLyAyXHJcbiAgICBAY2hhckNlaWxpbmcgPSBAaGVpZ2h0ICogMC42XHJcblxyXG4gICAgYWlDYXJkU3BhY2luZyA9IEB3aWR0aCAqIDAuMDE1XHJcblxyXG4gICAgIyBsZWZ0IHNpZGVcclxuICAgIGlmIGFpUGxheWVyc1swXSAhPSBudWxsXHJcbiAgICAgIGlmIGRyYXdHYW1lT3ZlclxyXG4gICAgICAgIEByZW5kZXJBSUhhbmQgYWlQbGF5ZXJzWzBdLmhhbmQsIEB3aWR0aCAqIDAuMiwgQGhlaWdodCAqIDAuNjIsIGFpQ2FyZFNwYWNpbmdcclxuXHJcbiAgICAgIGNoYXJhY3RlciA9IGFpQ2hhcmFjdGVyc1thaVBsYXllcnNbMF0uY2hhcklEXVxyXG4gICAgICBjaGFyYWN0ZXJXaWR0aCA9IEBzcHJpdGVSZW5kZXJlci5jYWxjV2lkdGgoY2hhcmFjdGVyLnNwcml0ZSwgY2hhcmFjdGVySGVpZ2h0KVxyXG4gICAgICBkbyAoY2hhcmFjdGVyKSA9PlxyXG4gICAgICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgY2hhcmFjdGVyLnNwcml0ZSwgY2hhcmFjdGVyTWFyZ2luLCBAY2hhckNlaWxpbmcsIDAsIGNoYXJhY3RlckhlaWdodCwgMCwgMCwgMSwgQGNvbG9ycy53aGl0ZSwgPT5cclxuICAgICAgICAgIEB0aGlydGVlbi5wdW5jaChjaGFyYWN0ZXIpXHJcbiAgICAgICAgICAjIEBkZWJ1ZygpXHJcbiAgICAgIEByZW5kZXJDb3VudCBhaVBsYXllcnNbMF0sIEB0aGlydGVlbi5tb25leSwgZHJhd0dhbWVPdmVyLCBhaVBsYXllcnNbMF0uaW5kZXggPT0gQHRoaXJ0ZWVuLnR1cm4sIGNvdW50SGVpZ2h0LCBjaGFyYWN0ZXJNYXJnaW4gKyAoY2hhcmFjdGVyV2lkdGggLyAyKSwgQGNoYXJDZWlsaW5nIC0gdGV4dFBhZGRpbmcsIDAuNSwgMFxyXG5cclxuICAgICMgdG9wIHNpZGVcclxuICAgIGlmIGFpUGxheWVyc1sxXSAhPSBudWxsXHJcbiAgICAgIGlmIGRyYXdHYW1lT3ZlclxyXG4gICAgICAgIEByZW5kZXJBSUhhbmQgYWlQbGF5ZXJzWzFdLmhhbmQsIEB3aWR0aCAqIDAuNiwgQGhlaWdodCAqIDAuMTgsIGFpQ2FyZFNwYWNpbmdcclxuXHJcbiAgICAgIGNoYXJhY3RlciA9IGFpQ2hhcmFjdGVyc1thaVBsYXllcnNbMV0uY2hhcklEXVxyXG4gICAgICBkbyAoY2hhcmFjdGVyKSA9PlxyXG4gICAgICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgY2hhcmFjdGVyLnNwcml0ZSwgQGNlbnRlci54LCAwLCAwLCBjaGFyYWN0ZXJIZWlnaHQsIDAsIDAuNSwgMCwgQGNvbG9ycy53aGl0ZSwgPT5cclxuICAgICAgICAgIEB0aGlydGVlbi5wdW5jaChjaGFyYWN0ZXIpXHJcbiAgICAgIEByZW5kZXJDb3VudCBhaVBsYXllcnNbMV0sIEB0aGlydGVlbi5tb25leSwgZHJhd0dhbWVPdmVyLCBhaVBsYXllcnNbMV0uaW5kZXggPT0gQHRoaXJ0ZWVuLnR1cm4sIGNvdW50SGVpZ2h0LCBAY2VudGVyLngsIGNoYXJhY3RlckhlaWdodCwgMC41LCAwXHJcblxyXG4gICAgIyByaWdodCBzaWRlXHJcbiAgICBpZiBhaVBsYXllcnNbMl0gIT0gbnVsbFxyXG4gICAgICBpZiBkcmF3R2FtZU92ZXJcclxuICAgICAgICBAcmVuZGVyQUlIYW5kIGFpUGxheWVyc1syXS5oYW5kLCBAd2lkdGggKiAwLjcsIEBoZWlnaHQgKiAwLjYyLCBhaUNhcmRTcGFjaW5nXHJcblxyXG4gICAgICBjaGFyYWN0ZXIgPSBhaUNoYXJhY3RlcnNbYWlQbGF5ZXJzWzJdLmNoYXJJRF1cclxuICAgICAgY2hhcmFjdGVyV2lkdGggPSBAc3ByaXRlUmVuZGVyZXIuY2FsY1dpZHRoKGNoYXJhY3Rlci5zcHJpdGUsIGNoYXJhY3RlckhlaWdodClcclxuICAgICAgZG8gKGNoYXJhY3RlcikgPT5cclxuICAgICAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIGNoYXJhY3Rlci5zcHJpdGUsIEB3aWR0aCAtIGNoYXJhY3Rlck1hcmdpbiwgQGNoYXJDZWlsaW5nLCAwLCBjaGFyYWN0ZXJIZWlnaHQsIDAsIDEsIDEsIEBjb2xvcnMud2hpdGUsID0+XHJcbiAgICAgICAgICBAdGhpcnRlZW4ucHVuY2goY2hhcmFjdGVyKVxyXG4gICAgICBAcmVuZGVyQ291bnQgYWlQbGF5ZXJzWzJdLCBAdGhpcnRlZW4ubW9uZXksIGRyYXdHYW1lT3ZlciwgYWlQbGF5ZXJzWzJdLmluZGV4ID09IEB0aGlydGVlbi50dXJuLCBjb3VudEhlaWdodCwgQHdpZHRoIC0gKGNoYXJhY3Rlck1hcmdpbiArIChjaGFyYWN0ZXJXaWR0aCAvIDIpKSwgQGNoYXJDZWlsaW5nIC0gdGV4dFBhZGRpbmcsIDAuNSwgMFxyXG5cclxuICAgICMgY2FyZCBhcmVhXHJcbiAgICBoYW5kQXJlYUhlaWdodCA9IDAuMjcgKiBAaGVpZ2h0XHJcbiAgICBjYXJkQXJlYVRleHQgPSBudWxsXHJcbiAgICBzd2l0Y2ggQGhhbmQubW9kZVxyXG4gICAgICB3aGVuIEhhbmQuUElDS0lOR1xyXG4gICAgICAgIGhhbmRhcmVhQ29sb3IgPSBAY29sb3JzLmhhbmRfcGlja1xyXG4gICAgICAgIGlmIChAdGhpcnRlZW4udHVybiA9PSAwKSBhbmQgKEB0aGlydGVlbi5ldmVyeW9uZVBhc3NlZCgpIG9yIChAdGhpcnRlZW4uY3VycmVudFBsYXkgPT0gbnVsbCkpXHJcbiAgICAgICAgICBoYW5kYXJlYUNvbG9yID0gQGNvbG9ycy5oYW5kX2FueVxyXG4gICAgICAgICAgaWYgQHRoaXJ0ZWVuLnBpbGUubGVuZ3RoID09IDBcclxuICAgICAgICAgICAgY2FyZEFyZWFUZXh0ID0gJ0FueXRoaW5nICgzXFx4YzgpJ1xyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBjYXJkQXJlYVRleHQgPSAnQW55dGhpbmcnXHJcbiAgICAgIHdoZW4gSGFuZC5QVVNISU5HXHJcbiAgICAgICAgaGFuZGFyZWFDb2xvciA9IEBjb2xvcnMuaGFuZF9wdXNoXHJcbiAgICAgICAgY2FyZEFyZWFUZXh0ID0gJ1NvcnRpbmcnXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBjYXJkQXJlYVRleHQgPSAnRHJhZ2dpbmcnXHJcbiAgICAgICAgaGFuZGFyZWFDb2xvciA9IEBjb2xvcnMuaGFuZF9kcmFnXHJcbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwic29saWRcIiwgMCwgQGhlaWdodCwgQHdpZHRoLCBoYW5kQXJlYUhlaWdodCwgMCwgMCwgMSwgaGFuZGFyZWFDb2xvciwgPT5cclxuICAgICAgQGhhbmQuY3ljbGVNb2RlKClcclxuXHJcbiAgICAjIHBpbGVcclxuICAgIHBpbGVEaW1lbnNpb24gPSBAaGVpZ2h0ICogMC40XHJcbiAgICBwaWxlU3ByaXRlID0gXCJwaWxlXCJcclxuICAgIGlmIChAdGhpcnRlZW4udHVybiA+PSAwKSBhbmQgKEB0aGlydGVlbi50dXJuIDw9IDMpXHJcbiAgICAgIHBpbGVTcHJpdGUgKz0gQHRoaXJ0ZWVuLnR1cm5cclxuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgcGlsZVNwcml0ZSwgQHdpZHRoIC8gMiwgQGhlaWdodCAvIDIsIHBpbGVEaW1lbnNpb24sIHBpbGVEaW1lbnNpb24sIDAsIDAuNSwgMC41LCBAY29sb3JzLndoaXRlLCA9PlxyXG4gICAgICBAcGxheVBpY2tlZCgpXHJcbiAgICBAcGlsZS5yZW5kZXIoKVxyXG5cclxuICAgIEBoYW5kLnJlbmRlcigpXHJcblxyXG4gICAgaWYgZHJhd0dhbWVPdmVyXHJcbiAgICAgICMgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcInNvbGlkXCIsIDAsIDAsIEB3aWR0aCwgQGhlaWdodCAtIGhhbmRBcmVhSGVpZ2h0LCAwLCAwLCAwLCBAY29sb3JzLnBsYXlfYWdhaW5cclxuXHJcbiAgICAgIGxpbmVzID0gQGdhbWVPdmVyVGV4dCgpXHJcbiAgICAgIGdhbWVPdmVyU2l6ZSA9IEBhYUhlaWdodCAvIDhcclxuICAgICAgZ2FtZU92ZXJZID0gQGNlbnRlci55XHJcbiAgICAgIGlmIGxpbmVzLmxlbmd0aCA+IDFcclxuICAgICAgICBnYW1lT3ZlclkgLT0gKGdhbWVPdmVyU2l6ZSA+PiAxKVxyXG4gICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgZ2FtZU92ZXJTaXplLCBsaW5lc1swXSwgQGNlbnRlci54LCBnYW1lT3ZlclksIDAuNSwgMC41LCBAY29sb3JzLmdhbWVfb3ZlclxyXG4gICAgICBpZiBsaW5lcy5sZW5ndGggPiAxXHJcbiAgICAgICAgZ2FtZU92ZXJZICs9IGdhbWVPdmVyU2l6ZVxyXG4gICAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCBnYW1lT3ZlclNpemUsIGxpbmVzWzFdLCBAY2VudGVyLngsIGdhbWVPdmVyWSwgMC41LCAwLjUsIEBjb2xvcnMuZ2FtZV9vdmVyXHJcblxyXG4gICAgICBwbGF5QWdhaW5UZXh0ID0gXCJQbGF5IEFnYWluXCJcclxuICAgICAgaWYgQHRoaXJ0ZWVuLnNvbWVvbmVHYXZlVXAoKVxyXG4gICAgICAgIHBsYXlBZ2FpblRleHQgPSBcIk5ldyBNb25leSBHYW1lXCJcclxuICAgICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcInNvbGlkXCIsIDAsIEBoZWlnaHQsIEB3aWR0aCwgaGFuZEFyZWFIZWlnaHQsIDAsIDAsIDEsIEBjb2xvcnMucGxheV9hZ2FpbiwgPT5cclxuICAgICAgICBpZiBAdGhpcnRlZW4uc29tZW9uZUdhdmVVcCgpXHJcbiAgICAgICAgICBAdGhpcnRlZW4ubmV3R2FtZSh0cnVlLCB0cnVlKSAjIHNwZWNpYWwgY2FzZTogYWxsb3cgeW91IHRvIGtlZXAgeW91ciBzdHJlYWtzIGdvaW5nXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgQHRoaXJ0ZWVuLmRlYWwoKVxyXG4gICAgICAgIEBwcmVwYXJlR2FtZSgpXHJcblxyXG4gICAgICByZXN0YXJ0UXVpdFNpemUgPSBAYWFIZWlnaHQgLyAxMlxyXG4gICAgICBzaGFkb3dEaXN0YW5jZSA9IHJlc3RhcnRRdWl0U2l6ZSAvIDhcclxuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIHJlc3RhcnRRdWl0U2l6ZSwgcGxheUFnYWluVGV4dCwgc2hhZG93RGlzdGFuY2UgKyBAY2VudGVyLngsIHNoYWRvd0Rpc3RhbmNlICsgKEBoZWlnaHQgLSAoaGFuZEFyZWFIZWlnaHQgKiAwLjUpKSwgMC41LCAxLCBAY29sb3JzLmJsYWNrXHJcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCByZXN0YXJ0UXVpdFNpemUsIHBsYXlBZ2FpblRleHQsIEBjZW50ZXIueCwgQGhlaWdodCAtIChoYW5kQXJlYUhlaWdodCAqIDAuNSksIDAuNSwgMSwgQGNvbG9ycy5nb2xkXHJcblxyXG4gICAgQHJlbmRlckNvdW50IEB0aGlydGVlbi5wbGF5ZXJzWzBdLCBAdGhpcnRlZW4ubW9uZXksIGRyYXdHYW1lT3ZlciwgMCA9PSBAdGhpcnRlZW4udHVybiwgY291bnRIZWlnaHQsIEBjZW50ZXIueCwgQGhlaWdodCwgMC41LCAxXHJcblxyXG4gICAgIyBIZWFkbGluZSAoaW5jbHVkZXMgZXJyb3IpXHJcbiAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgdGV4dEhlaWdodCwgQGNhbGNIZWFkbGluZSgpLCAwLCAwLCAwLCAwLCBAY29sb3JzLmxpZ2h0Z3JheVxyXG5cclxuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJwYXVzZVwiLCBAd2lkdGgsIDAsIDAsIEBwYXVzZUJ1dHRvblNpemUsIDAsIDEsIDAsIEBjb2xvcnMud2hpdGUsID0+XHJcbiAgICAgIEByZW5kZXJNb2RlID0gUmVuZGVyTW9kZS5QQVVTRVxyXG5cclxuICAgIGlmIGNhcmRBcmVhVGV4dCAhPSBudWxsXHJcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCB0ZXh0SGVpZ2h0LCBjYXJkQXJlYVRleHQsIDAuMDIgKiBAd2lkdGgsIEBoZWlnaHQgLSBoYW5kQXJlYUhlaWdodCwgMCwgMCwgQGNvbG9ycy53aGl0ZVxyXG5cclxuICAgIGlmIEBhY2hpZXZlbWVudEZhbmZhcmUgIT0gbnVsbFxyXG4gICAgICBpZiBAYWNoaWV2ZW1lbnRGYW5mYXJlLnRpbWUgPCAxMDAwXHJcbiAgICAgICAgb3BhY2l0eSA9IEBhY2hpZXZlbWVudEZhbmZhcmUudGltZSAvIDEwMDBcclxuICAgICAgZWxzZSBpZiBAYWNoaWV2ZW1lbnRGYW5mYXJlLnRpbWUgPiA0MDAwXHJcbiAgICAgICAgb3BhY2l0eSA9IDEgLSAoKEBhY2hpZXZlbWVudEZhbmZhcmUudGltZSAtIDQwMDApIC8gMTAwMClcclxuICAgICAgZWxzZVxyXG4gICAgICAgIG9wYWNpdHkgPSAxXHJcbiAgICAgIGNvbG9yID0ge3I6MSwgZzoxLCBiOjEsIGE6b3BhY2l0eX1cclxuICAgICAgeCA9IEB3aWR0aCAqIDAuNlxyXG4gICAgICB5ID0gMFxyXG4gICAgICB4VGV4dCA9IHggKyAoQHdpZHRoICogMC4wNilcclxuICAgICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcImF1XCIsIHgsIHksIDAsIEBoZWlnaHQgLyAxMCwgMCwgMCwgMCwgY29sb3IsID0+XHJcbiAgICAgICAgQGFjaGlldmVtZW50RmFuZmFyZSA9IG51bGxcclxuICAgICAgICBAcmVuZGVyTW9kZSA9IFJlbmRlck1vZGUuQUNISUVWRU1FTlRTXHJcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCB0ZXh0SGVpZ2h0LCBcIkFjaGlldmVtZW50IEVhcm5lZFwiLCB4VGV4dCwgeSwgMCwgMCwgY29sb3JcclxuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIHRleHRIZWlnaHQsIEBhY2hpZXZlbWVudEZhbmZhcmUudGl0bGUsIHhUZXh0LCB5ICsgdGV4dEhlaWdodCwgMCwgMCwgY29sb3JcclxuXHJcbiAgICByZXR1cm5cclxuXHJcbiAgcmVuZGVyQ291bnQ6IChwbGF5ZXIsIG1vbmV5LCBkcmF3R2FtZU92ZXIsIG15VHVybiwgY291bnRIZWlnaHQsIHgsIHksIGFuY2hvcngsIGFuY2hvcnkpIC0+XHJcbiAgICBpZiBteVR1cm5cclxuICAgICAgbmFtZUNvbG9yID0gXCJgZmY3NzAwYFwiXHJcbiAgICBlbHNlXHJcbiAgICAgIG5hbWVDb2xvciA9IFwiXCJcclxuICAgIG5hbWVTdHJpbmcgPSBcIiAje25hbWVDb2xvcn0je3BsYXllci5uYW1lfWBgXCJcclxuICAgIGlmIG1vbmV5XHJcbiAgICAgIHBsYXllci5tb25leSA/PSAwXHJcbiAgICAgIG5hbWVTdHJpbmcgKz0gXCI6ICQgYGFhZmZhYWAje3BsYXllci5tb25leX1cIlxyXG4gICAgbmFtZVN0cmluZyArPSBcIiBcIlxyXG4gICAgY2FyZENvdW50ID0gcGxheWVyLmhhbmQubGVuZ3RoXHJcbiAgICBpZiBkcmF3R2FtZU92ZXIgb3IgKGNhcmRDb3VudCA9PSAwKVxyXG4gICAgICBpZiBtb25leVxyXG4gICAgICAgIHBsYWNlU3RyaW5nID0gXCI0dGhcIlxyXG4gICAgICAgIGlmIHBsYXllci5wbGFjZSA9PSAxXHJcbiAgICAgICAgICBwbGFjZVN0cmluZyA9IFwiMXN0XCJcclxuICAgICAgICBlbHNlIGlmIHBsYXllci5wbGFjZSA9PSAyXHJcbiAgICAgICAgICBwbGFjZVN0cmluZyA9IFwiMm5kXCJcclxuICAgICAgICBlbHNlIGlmIHBsYXllci5wbGFjZSA9PSAzXHJcbiAgICAgICAgICBwbGFjZVN0cmluZyA9IFwiM3JkXCJcclxuICAgICAgICBjb3VudFN0cmluZyA9IFwiIGBmZmFhZmZgI3twbGFjZVN0cmluZ31gYCBQbGFjZSBcIlxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgaWYgcGxheWVyLnBsYWNlID09IDFcclxuICAgICAgICAgIGNvdW50U3RyaW5nID0gXCIgYGZmZmZhYWBXaW5uZXJgYCBcIlxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIGNvdW50U3RyaW5nID0gXCIgYGZmYWFmZmBMb3NlcmBgIFwiXHJcbiAgICBlbHNlXHJcbiAgICAgIGNvdW50U3RyaW5nID0gXCIgYGZmZmYzM2Aje2NhcmRDb3VudH1gYCBsZWZ0IFwiXHJcblxyXG4gICAgbmFtZVNpemUgPSBAZm9udFJlbmRlcmVyLnNpemUoQGZvbnQsIGNvdW50SGVpZ2h0LCBuYW1lU3RyaW5nKVxyXG4gICAgY291bnRTaXplID0gQGZvbnRSZW5kZXJlci5zaXplKEBmb250LCBjb3VudEhlaWdodCwgY291bnRTdHJpbmcpXHJcbiAgICBpZiBuYW1lU2l6ZS53ID4gY291bnRTaXplLndcclxuICAgICAgY291bnRTaXplLncgPSBuYW1lU2l6ZS53XHJcbiAgICBlbHNlXHJcbiAgICAgIG5hbWVTaXplLncgPSBjb3VudFNpemUud1xyXG4gICAgbmFtZVkgPSB5XHJcbiAgICBjb3VudFkgPSB5XHJcbiAgICBib3hIZWlnaHQgPSBjb3VudFNpemUuaFxyXG4gICAgaWYgdHJ1ZSAjIHBsYXllci5pZCAhPSAxXHJcbiAgICAgIGJveEhlaWdodCAqPSAyXHJcbiAgICAgIGlmIGFuY2hvcnkgPiAwXHJcbiAgICAgICAgbmFtZVkgLT0gY291bnRIZWlnaHRcclxuICAgICAgZWxzZVxyXG4gICAgICAgIGNvdW50WSArPSBjb3VudEhlaWdodFxyXG4gICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcInNvbGlkXCIsIHgsIHksIGNvdW50U2l6ZS53LCBib3hIZWlnaHQsIDAsIGFuY2hvcngsIGFuY2hvcnksIEBjb2xvcnMub3ZlcmxheVxyXG4gICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIGNvdW50SGVpZ2h0LCBuYW1lU3RyaW5nLCB4LCBuYW1lWSwgYW5jaG9yeCwgYW5jaG9yeSwgQGNvbG9ycy53aGl0ZVxyXG4gICAgaWYgdHJ1ZSAjIHBsYXllci5pZCAhPSAxXHJcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCBjb3VudEhlaWdodCwgY291bnRTdHJpbmcsIHgsIGNvdW50WSwgYW5jaG9yeCwgYW5jaG9yeSwgQGNvbG9ycy53aGl0ZVxyXG5cclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgIyByZW5kZXJpbmcgYW5kIHpvbmVzXHJcblxyXG4gIGRyYXdJbWFnZTogKHRleHR1cmUsIHN4LCBzeSwgc3csIHNoLCBkeCwgZHksIGR3LCBkaCwgcm90LCBhbmNob3J4LCBhbmNob3J5LCByLCBnLCBiLCBhLCBjYikgLT5cclxuICAgIEByZW5kZXJDb21tYW5kcy5wdXNoIEB0ZXh0dXJlc1t0ZXh0dXJlXSwgc3gsIHN5LCBzdywgc2gsIGR4LCBkeSwgZHcsIGRoLCByb3QsIGFuY2hvcngsIGFuY2hvcnksIHIsIGcsIGIsIGFcclxuXHJcbiAgICBpZiBjYj9cclxuICAgICAgIyBjYWxsZXIgd2FudHMgdG8gcmVtZW1iZXIgd2hlcmUgdGhpcyB3YXMgZHJhd24sIGFuZCB3YW50cyB0byBiZSBjYWxsZWQgYmFjayBpZiBpdCBpcyBldmVyIHRvdWNoZWRcclxuICAgICAgIyBUaGlzIGlzIGNhbGxlZCBhIFwiem9uZVwiLiBTaW5jZSB6b25lcyBhcmUgdHJhdmVyc2VkIGluIHJldmVyc2Ugb3JkZXIsIHRoZSBuYXR1cmFsIG92ZXJsYXAgb2ZcclxuICAgICAgIyBhIHNlcmllcyBvZiByZW5kZXJzIGlzIHJlc3BlY3RlZCBhY2NvcmRpbmdseS5cclxuICAgICAgYW5jaG9yT2Zmc2V0WCA9IC0xICogYW5jaG9yeCAqIGR3XHJcbiAgICAgIGFuY2hvck9mZnNldFkgPSAtMSAqIGFuY2hvcnkgKiBkaFxyXG4gICAgICB6b25lID1cclxuICAgICAgICAjIGNlbnRlciAoWCxZKSBhbmQgcmV2ZXJzZWQgcm90YXRpb24sIHVzZWQgdG8gcHV0IHRoZSBjb29yZGluYXRlIGluIGxvY2FsIHNwYWNlIHRvIHRoZSB6b25lXHJcbiAgICAgICAgY3g6ICBkeFxyXG4gICAgICAgIGN5OiAgZHlcclxuICAgICAgICByb3Q6IHJvdCAqIC0xXHJcbiAgICAgICAgIyB0aGUgYXhpcyBhbGlnbmVkIGJvdW5kaW5nIGJveCB1c2VkIGZvciBkZXRlY3Rpb24gb2YgYSBsb2NhbHNwYWNlIGNvb3JkXHJcbiAgICAgICAgbDogICBhbmNob3JPZmZzZXRYXHJcbiAgICAgICAgdDogICBhbmNob3JPZmZzZXRZXHJcbiAgICAgICAgcjogICBhbmNob3JPZmZzZXRYICsgZHdcclxuICAgICAgICBiOiAgIGFuY2hvck9mZnNldFkgKyBkaFxyXG4gICAgICAgICMgY2FsbGJhY2sgdG8gY2FsbCBpZiB0aGUgem9uZSBpcyBjbGlja2VkIG9uXHJcbiAgICAgICAgY2I6ICBjYlxyXG4gICAgICBAem9uZXMucHVzaCB6b25lXHJcblxyXG4gIGNoZWNrWm9uZXM6ICh4LCB5KSAtPlxyXG4gICAgZm9yIHpvbmUgaW4gQHpvbmVzIGJ5IC0xXHJcbiAgICAgICMgbW92ZSBjb29yZCBpbnRvIHNwYWNlIHJlbGF0aXZlIHRvIHRoZSBxdWFkLCB0aGVuIHJvdGF0ZSBpdCB0byBtYXRjaFxyXG4gICAgICB1bnJvdGF0ZWRMb2NhbFggPSB4IC0gem9uZS5jeFxyXG4gICAgICB1bnJvdGF0ZWRMb2NhbFkgPSB5IC0gem9uZS5jeVxyXG4gICAgICBsb2NhbFggPSB1bnJvdGF0ZWRMb2NhbFggKiBNYXRoLmNvcyh6b25lLnJvdCkgLSB1bnJvdGF0ZWRMb2NhbFkgKiBNYXRoLnNpbih6b25lLnJvdClcclxuICAgICAgbG9jYWxZID0gdW5yb3RhdGVkTG9jYWxYICogTWF0aC5zaW4oem9uZS5yb3QpICsgdW5yb3RhdGVkTG9jYWxZICogTWF0aC5jb3Moem9uZS5yb3QpXHJcbiAgICAgIGlmIChsb2NhbFggPCB6b25lLmwpIG9yIChsb2NhbFggPiB6b25lLnIpIG9yIChsb2NhbFkgPCB6b25lLnQpIG9yIChsb2NhbFkgPiB6b25lLmIpXHJcbiAgICAgICAgIyBvdXRzaWRlIG9mIG9yaWVudGVkIGJvdW5kaW5nIGJveFxyXG4gICAgICAgIGNvbnRpbnVlXHJcbiAgICAgIHpvbmUuY2IoeCwgeSlcclxuICAgICAgcmV0dXJuIHRydWVcclxuICAgIHJldHVybiBmYWxzZVxyXG5cclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVcclxuIiwiQW5pbWF0aW9uID0gcmVxdWlyZSAnLi9BbmltYXRpb24nXHJcblxyXG5DQVJEX0lNQUdFX1cgPSAxMjBcclxuQ0FSRF9JTUFHRV9IID0gMTYyXHJcbkNBUkRfSU1BR0VfT0ZGX1ggPSA0XHJcbkNBUkRfSU1BR0VfT0ZGX1kgPSA0XHJcbkNBUkRfSU1BR0VfQURWX1ggPSBDQVJEX0lNQUdFX1dcclxuQ0FSRF9JTUFHRV9BRFZfWSA9IENBUkRfSU1BR0VfSFxyXG5DQVJEX1JFTkRFUl9TQ0FMRSA9IDAuMzUgICAgICAgICAgICAgICAgICAjIGNhcmQgaGVpZ2h0IGNvZWZmaWNpZW50IGZyb20gdGhlIHNjcmVlbidzIGhlaWdodFxyXG5DQVJEX0hBTkRfQ1VSVkVfRElTVF9GQUNUT1IgPSAzLjUgICAgICAgICAjIGZhY3RvciB3aXRoIHNjcmVlbiBoZWlnaHQgdG8gZmlndXJlIG91dCBjZW50ZXIgb2YgYXJjLiBiaWdnZXIgbnVtYmVyIGlzIGxlc3MgYXJjXHJcbkNBUkRfSE9MRElOR19ST1RfT1JERVIgPSBNYXRoLlBJIC8gMTIgICAgICMgZGVzaXJlZCByb3RhdGlvbiBvZiB0aGUgY2FyZCB3aGVuIGJlaW5nIGRyYWdnZWQgYXJvdW5kIGZvciBvcmRlcmluZydzIHNha2VcclxuQ0FSRF9IT0xESU5HX1JPVF9QTEFZID0gLTEgKiBNYXRoLlBJIC8gMTIgIyBkZXNpcmVkIHJvdGF0aW9uIG9mIHRoZSBjYXJkIHdoZW4gYmVpbmcgZHJhZ2dlZCBhcm91bmQgd2l0aCBpbnRlbnQgdG8gcGxheVxyXG5DQVJEX1BMQVlfQ0VJTElORyA9IDAuNjAgICAgICAgICAgICAgICAgICAjIGhvdyBtdWNoIG9mIHRoZSB0b3Agb2YgdGhlIHNjcmVlbiByZXByZXNlbnRzIFwiSSB3YW50IHRvIHBsYXkgdGhpc1wiIHZzIFwiSSB3YW50IHRvIHJlb3JkZXJcIlxyXG5cclxuTk9fQ0FSRCA9IC0xXHJcblxyXG5IaWdobGlnaHQgPVxyXG4gIE5PTkU6IC0xXHJcbiAgVU5TRUxFQ1RFRDogMFxyXG4gIFNFTEVDVEVEOiAxXHJcbiAgUElMRTogMlxyXG5cclxuIyB0YWtlbiBmcm9tIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTIxMTIxMi9ob3ctdG8tY2FsY3VsYXRlLWFuLWFuZ2xlLWZyb20tdGhyZWUtcG9pbnRzXHJcbiMgdXNlcyBsYXcgb2YgY29zaW5lcyB0byBmaWd1cmUgb3V0IHRoZSBoYW5kIGFyYyBhbmdsZVxyXG5maW5kQW5nbGUgPSAocDAsIHAxLCBwMikgLT5cclxuICAgIGEgPSBNYXRoLnBvdyhwMS54IC0gcDIueCwgMikgKyBNYXRoLnBvdyhwMS55IC0gcDIueSwgMilcclxuICAgIGIgPSBNYXRoLnBvdyhwMS54IC0gcDAueCwgMikgKyBNYXRoLnBvdyhwMS55IC0gcDAueSwgMilcclxuICAgIGMgPSBNYXRoLnBvdyhwMi54IC0gcDAueCwgMikgKyBNYXRoLnBvdyhwMi55IC0gcDAueSwgMilcclxuICAgIHJldHVybiBNYXRoLmFjb3MoIChhK2ItYykgLyBNYXRoLnNxcnQoNCphKmIpIClcclxuXHJcbmNhbGNEaXN0YW5jZSA9IChwMCwgcDEpIC0+XHJcbiAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyhwMS54IC0gcDAueCwgMikgKyBNYXRoLnBvdyhwMS55IC0gcDAueSwgMikpXHJcblxyXG5jYWxjRGlzdGFuY2VTcXVhcmVkID0gKHgwLCB5MCwgeDEsIHkxKSAtPlxyXG4gIHJldHVybiBNYXRoLnBvdyh4MSAtIHgwLCAyKSArIE1hdGgucG93KHkxIC0geTAsIDIpXHJcblxyXG5jbGFzcyBIYW5kXHJcbiAgQENBUkRfSU1BR0VfVzogQ0FSRF9JTUFHRV9XXHJcbiAgQENBUkRfSU1BR0VfSDogQ0FSRF9JTUFHRV9IXHJcbiAgQENBUkRfSU1BR0VfT0ZGX1g6IENBUkRfSU1BR0VfT0ZGX1hcclxuICBAQ0FSRF9JTUFHRV9PRkZfWTogQ0FSRF9JTUFHRV9PRkZfWVxyXG4gIEBDQVJEX0lNQUdFX0FEVl9YOiBDQVJEX0lNQUdFX0FEVl9YXHJcbiAgQENBUkRfSU1BR0VfQURWX1k6IENBUkRfSU1BR0VfQURWX1lcclxuICBAQ0FSRF9SRU5ERVJfU0NBTEU6IENBUkRfUkVOREVSX1NDQUxFXHJcbiAgQEhpZ2hsaWdodDogSGlnaGxpZ2h0XHJcblxyXG4gIEBQSUNLSU5HOiAwXHJcbiAgQERSQUdHSU5HOiAxXHJcbiAgQFBVU0hJTkc6IDJcclxuXHJcbiAgY29uc3RydWN0b3I6IChAZ2FtZSkgLT5cclxuICAgIEBjYXJkcyA9IFtdXHJcbiAgICBAYW5pbXMgPSB7fVxyXG4gICAgQHBvc2l0aW9uQ2FjaGUgPSB7fVxyXG5cclxuICAgIEBtb2RlID0gSGFuZC5QSUNLSU5HXHJcbiAgICBAcGlja2VkID0gW11cclxuICAgIEBwaWNrUGFpbnQgPSBmYWxzZVxyXG5cclxuICAgIEBkcmFnSW5kZXhTdGFydCA9IE5PX0NBUkRcclxuICAgIEBkcmFnSW5kZXhDdXJyZW50ID0gTk9fQ0FSRFxyXG4gICAgQGRyYWdYID0gMFxyXG4gICAgQGRyYWdZID0gMFxyXG5cclxuICAgICMgcmVuZGVyIC8gYW5pbSBtZXRyaWNzXHJcbiAgICBAY2FyZFNwZWVkID1cclxuICAgICAgcjogTWF0aC5QSSAqIDJcclxuICAgICAgczogMi41XHJcbiAgICAgIHQ6IDIgKiBAZ2FtZS53aWR0aFxyXG4gICAgQHBsYXlDZWlsaW5nID0gQ0FSRF9QTEFZX0NFSUxJTkcgKiBAZ2FtZS5oZWlnaHRcclxuICAgIEBjYXJkSGVpZ2h0ID0gTWF0aC5mbG9vcihAZ2FtZS5oZWlnaHQgKiBDQVJEX1JFTkRFUl9TQ0FMRSlcclxuICAgIEBjYXJkV2lkdGggID0gTWF0aC5mbG9vcihAY2FyZEhlaWdodCAqIENBUkRfSU1BR0VfVyAvIENBUkRfSU1BR0VfSClcclxuICAgIEBjYXJkSGFsZkhlaWdodCA9IEBjYXJkSGVpZ2h0ID4+IDFcclxuICAgIEBjYXJkSGFsZldpZHRoICA9IEBjYXJkV2lkdGggPj4gMVxyXG4gICAgYXJjTWFyZ2luID0gQGNhcmRXaWR0aCAvIDJcclxuICAgIGFyY1ZlcnRpY2FsQmlhcyA9IEBjYXJkSGVpZ2h0IC8gNTBcclxuICAgIGJvdHRvbUxlZnQgID0geyB4OiBhcmNNYXJnaW4sICAgICAgICAgICAgICAgIHk6IGFyY1ZlcnRpY2FsQmlhcyArIEBnYW1lLmhlaWdodCB9XHJcbiAgICBib3R0b21SaWdodCA9IHsgeDogQGdhbWUud2lkdGggLSBhcmNNYXJnaW4sIHk6IGFyY1ZlcnRpY2FsQmlhcyArIEBnYW1lLmhlaWdodCB9XHJcbiAgICBAaGFuZENlbnRlciA9IHsgeDogQGdhbWUud2lkdGggLyAyLCAgICAgICAgIHk6IGFyY1ZlcnRpY2FsQmlhcyArIEBnYW1lLmhlaWdodCArIChDQVJEX0hBTkRfQ1VSVkVfRElTVF9GQUNUT1IgKiBAZ2FtZS5oZWlnaHQpIH1cclxuICAgIEBoYW5kQW5nbGUgPSBmaW5kQW5nbGUoYm90dG9tTGVmdCwgQGhhbmRDZW50ZXIsIGJvdHRvbVJpZ2h0KVxyXG4gICAgQGhhbmREaXN0YW5jZSA9IGNhbGNEaXN0YW5jZShib3R0b21MZWZ0LCBAaGFuZENlbnRlcilcclxuICAgIEBoYW5kQW5nbGVBZHZhbmNlTWF4ID0gQGhhbmRBbmdsZSAvIDcgIyBuZXZlciBzcGFjZSB0aGUgY2FyZHMgbW9yZSB0aGFuIHdoYXQgdGhleSdkIGxvb2sgbGlrZSB3aXRoIHRoaXMgaGFuZHNpemVcclxuICAgIEBnYW1lLmxvZyBcIkhhbmQgZGlzdGFuY2UgI3tAaGFuZERpc3RhbmNlfSwgYW5nbGUgI3tAaGFuZEFuZ2xlfSAoc2NyZWVuIGhlaWdodCAje0BnYW1lLmhlaWdodH0pXCJcclxuXHJcbiAgcGlja2luZzogLT5cclxuICAgIHJldHVybiAoQG1vZGUgPT0gSGFuZC5QSUNLSU5HKVxyXG5cclxuICBjeWNsZU1vZGU6IC0+XHJcbiAgICBAbW9kZSA9IHN3aXRjaCBAbW9kZVxyXG4gICAgICB3aGVuIEhhbmQuUElDS0lOR1xyXG4gICAgICAgIEhhbmQuRFJBR0dJTkdcclxuICAgICAgd2hlbiBIYW5kLkRSQUdHSU5HXHJcbiAgICAgICAgaWYgQGdhbWUub3B0aW9ucy5wdXNoU29ydGluZ1xyXG4gICAgICAgICAgSGFuZC5QVVNISU5HXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgSGFuZC5QSUNLSU5HXHJcbiAgICAgIHdoZW4gSGFuZC5QVVNISU5HXHJcbiAgICAgICAgSGFuZC5QSUNLSU5HXHJcbiAgICBpZiBAbW9kZSA9PSBIYW5kLlBJQ0tJTkdcclxuICAgICAgQHNlbGVjdE5vbmUoKVxyXG5cclxuICBzZWxlY3ROb25lOiAtPlxyXG4gICAgQHBpY2tlZCA9IG5ldyBBcnJheShAY2FyZHMubGVuZ3RoKS5maWxsKGZhbHNlKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHNldDogKGNhcmRzKSAtPlxyXG4gICAgQGNhcmRzID0gY2FyZHMuc2xpY2UoMClcclxuICAgIGlmIEBtb2RlID09IEhhbmQuUElDS0lOR1xyXG4gICAgICBAc2VsZWN0Tm9uZSgpXHJcbiAgICBAc3luY0FuaW1zKClcclxuICAgIEB3YXJwKClcclxuXHJcbiAgc3luY0FuaW1zOiAtPlxyXG4gICAgc2VlbiA9IHt9XHJcbiAgICBmb3IgY2FyZCBpbiBAY2FyZHNcclxuICAgICAgc2VlbltjYXJkXSsrXHJcbiAgICAgIGlmIG5vdCBAYW5pbXNbY2FyZF1cclxuICAgICAgICBAYW5pbXNbY2FyZF0gPSBuZXcgQW5pbWF0aW9uIHtcclxuICAgICAgICAgIHNwZWVkOiBAY2FyZFNwZWVkXHJcbiAgICAgICAgICB4OiAwXHJcbiAgICAgICAgICB5OiAwXHJcbiAgICAgICAgICByOiAwXHJcbiAgICAgICAgfVxyXG4gICAgdG9SZW1vdmUgPSBbXVxyXG4gICAgZm9yIGNhcmQsYW5pbSBvZiBAYW5pbXNcclxuICAgICAgaWYgbm90IHNlZW4uaGFzT3duUHJvcGVydHkoY2FyZClcclxuICAgICAgICB0b1JlbW92ZS5wdXNoIGNhcmRcclxuICAgIGZvciBjYXJkIGluIHRvUmVtb3ZlXHJcbiAgICAgICMgQGdhbWUubG9nIFwicmVtb3ZpbmcgYW5pbSBmb3IgI3tjYXJkfVwiXHJcbiAgICAgIGRlbGV0ZSBAYW5pbXNbY2FyZF1cclxuXHJcbiAgICBAdXBkYXRlUG9zaXRpb25zKClcclxuXHJcbiAgY2FsY0RyYXduSGFuZDogLT5cclxuICAgIGRyYXduSGFuZCA9IFtdXHJcbiAgICBmb3IgY2FyZCxpIGluIEBjYXJkc1xyXG4gICAgICBpZiBpICE9IEBkcmFnSW5kZXhTdGFydFxyXG4gICAgICAgIGRyYXduSGFuZC5wdXNoIGNhcmRcclxuXHJcbiAgICBpZiBAZHJhZ0luZGV4Q3VycmVudCAhPSBOT19DQVJEXHJcbiAgICAgIGRyYXduSGFuZC5zcGxpY2UgQGRyYWdJbmRleEN1cnJlbnQsIDAsIEBjYXJkc1tAZHJhZ0luZGV4U3RhcnRdXHJcbiAgICByZXR1cm4gZHJhd25IYW5kXHJcblxyXG4gIHdhbnRzVG9QbGF5RHJhZ2dlZENhcmQ6IC0+XHJcbiAgICByZXR1cm4gZmFsc2UgaWYgQGRyYWdJbmRleFN0YXJ0ID09IE5PX0NBUkRcclxuICAgIHJldHVybiBAZHJhZ1kgPCBAcGxheUNlaWxpbmdcclxuXHJcbiAgdXBkYXRlUG9zaXRpb25zOiAtPlxyXG4gICAgZHJhd25IYW5kID0gQGNhbGNEcmF3bkhhbmQoKVxyXG4gICAgd2FudHNUb1BsYXkgPSBAd2FudHNUb1BsYXlEcmFnZ2VkQ2FyZCgpXHJcbiAgICBkZXNpcmVkUm90YXRpb24gPSBDQVJEX0hPTERJTkdfUk9UX09SREVSXHJcbiAgICBwb3NpdGlvbkNvdW50ID0gZHJhd25IYW5kLmxlbmd0aFxyXG4gICAgaWYgd2FudHNUb1BsYXlcclxuICAgICAgZGVzaXJlZFJvdGF0aW9uID0gQ0FSRF9IT0xESU5HX1JPVF9QTEFZXHJcbiAgICAgIHBvc2l0aW9uQ291bnQtLVxyXG4gICAgcG9zaXRpb25zID0gQGNhbGNQb3NpdGlvbnMocG9zaXRpb25Db3VudClcclxuICAgIGRyYXdJbmRleCA9IDBcclxuICAgIGZvciBjYXJkLGkgaW4gZHJhd25IYW5kXHJcbiAgICAgIGFuaW0gPSBAYW5pbXNbY2FyZF1cclxuICAgICAgaWYgaSA9PSBAZHJhZ0luZGV4Q3VycmVudFxyXG4gICAgICAgIGFuaW0ucmVxLnggPSBAZHJhZ1hcclxuICAgICAgICBhbmltLnJlcS55ID0gQGRyYWdZXHJcbiAgICAgICAgYW5pbS5yZXEuciA9IGRlc2lyZWRSb3RhdGlvblxyXG4gICAgICAgIGlmIG5vdCB3YW50c1RvUGxheVxyXG4gICAgICAgICAgZHJhd0luZGV4KytcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHBvcyA9IHBvc2l0aW9uc1tkcmF3SW5kZXhdXHJcbiAgICAgICAgYW5pbS5yZXEueCA9IHBvcy54XHJcbiAgICAgICAgYW5pbS5yZXEueSA9IHBvcy55XHJcbiAgICAgICAgYW5pbS5yZXEuciA9IHBvcy5yXHJcbiAgICAgICAgZHJhd0luZGV4KytcclxuXHJcbiAgIyBpbW1lZGlhdGVseSB3YXJwIGFsbCBjYXJkcyB0byB3aGVyZSB0aGV5IHNob3VsZCBiZVxyXG4gIHdhcnA6IC0+XHJcbiAgICBmb3IgY2FyZCxhbmltIG9mIEBhbmltc1xyXG4gICAgICBhbmltLndhcnAoKVxyXG5cclxuICAjIHJlb3JkZXIgdGhlIGhhbmQgYmFzZWQgb24gdGhlIGRyYWcgbG9jYXRpb24gb2YgdGhlIGhlbGQgY2FyZFxyXG4gIHJlb3JkZXI6IC0+XHJcbiAgICByZXR1cm4gaWYgQGRyYWdJbmRleFN0YXJ0ID09IE5PX0NBUkRcclxuICAgIHJldHVybiBpZiBAY2FyZHMubGVuZ3RoIDwgMiAjIG5vdGhpbmcgdG8gcmVvcmRlclxyXG4gICAgcG9zaXRpb25zID0gQGNhbGNQb3NpdGlvbnMoQGNhcmRzLmxlbmd0aClcclxuICAgIGNsb3Nlc3RJbmRleCA9IDBcclxuICAgIGNsb3Nlc3REaXN0ID0gQGdhbWUud2lkdGggKiBAZ2FtZS5oZWlnaHQgIyBzb21ldGhpbmcgaW1wb3NzaWJseSBsYXJnZVxyXG4gICAgZm9yIHBvcywgaW5kZXggaW4gcG9zaXRpb25zXHJcbiAgICAgIGRpc3QgPSBjYWxjRGlzdGFuY2VTcXVhcmVkKHBvcy54LCBwb3MueSwgQGRyYWdYLCBAZHJhZ1kpXHJcbiAgICAgIGlmIGNsb3Nlc3REaXN0ID4gZGlzdFxyXG4gICAgICAgIGNsb3Nlc3REaXN0ID0gZGlzdFxyXG4gICAgICAgIGNsb3Nlc3RJbmRleCA9IGluZGV4XHJcbiAgICBAZHJhZ0luZGV4Q3VycmVudCA9IGNsb3Nlc3RJbmRleFxyXG5cclxuICBzZWxlY3RlZENhcmRzOiAtPlxyXG4gICAgaWYgQG1vZGUgIT0gSGFuZC5QSUNLSU5HXHJcbiAgICAgIHJldHVybiBbXVxyXG5cclxuICAgIGNhcmRzID0gW11cclxuICAgIGZvciBjYXJkLCBpIGluIEBjYXJkc1xyXG4gICAgICBpZiBAcGlja2VkW2ldXHJcbiAgICAgICAgYW5pbSA9IEBhbmltc1tjYXJkXVxyXG4gICAgICAgIGNhcmRzLnB1c2gge1xyXG4gICAgICAgICAgY2FyZDogY2FyZFxyXG4gICAgICAgICAgeDogYW5pbS5jdXIueFxyXG4gICAgICAgICAgeTogYW5pbS5jdXIueVxyXG4gICAgICAgICAgcjogYW5pbS5jdXIuclxyXG4gICAgICAgICAgaW5kZXg6IGlcclxuICAgICAgICB9XHJcbiAgICByZXR1cm4gY2FyZHNcclxuXHJcbiAgZG93bjogKEBkcmFnWCwgQGRyYWdZLCBpbmRleCkgLT5cclxuICAgIEB1cChAZHJhZ1gsIEBkcmFnWSkgIyBlbnN1cmUgd2UgbGV0IGdvIG9mIHRoZSBwcmV2aW91cyBjYXJkIGluIGNhc2UgdGhlIGV2ZW50cyBhcmUgZHVtYlxyXG4gICAgaWYgQG1vZGUgPT0gSGFuZC5QSUNLSU5HXHJcbiAgICAgIEBwaWNrZWRbaW5kZXhdID0gIUBwaWNrZWRbaW5kZXhdXHJcbiAgICAgIEBwaWNrUGFpbnQgPSBAcGlja2VkW2luZGV4XVxyXG4gICAgICByZXR1cm5cclxuICAgIGlmIEBtb2RlID09IEhhbmQuUFVTSElOR1xyXG4gICAgICBpZiBpbmRleCA8IEBjYXJkcy5sZW5ndGhcclxuICAgICAgICB0b0VuZCA9IEBjYXJkc1tpbmRleF1cclxuICAgICAgICBAY2FyZHMuc3BsaWNlKGluZGV4LCAxKVxyXG4gICAgICAgIEBjYXJkcy5wdXNoIHRvRW5kXHJcbiAgICAgICAgQHVwZGF0ZVBvc2l0aW9ucygpXHJcbiAgICAgIHJldHVyblxyXG4gICAgQGdhbWUubG9nIFwicGlja2luZyB1cCBjYXJkIGluZGV4ICN7aW5kZXh9XCJcclxuICAgIEBkcmFnSW5kZXhTdGFydCA9IGluZGV4XHJcbiAgICBAZHJhZ0luZGV4Q3VycmVudCA9IGluZGV4XHJcbiAgICBAdXBkYXRlUG9zaXRpb25zKClcclxuXHJcbiAgbW92ZTogKEBkcmFnWCwgQGRyYWdZKSAtPlxyXG4gICAgcmV0dXJuIGlmIEBkcmFnSW5kZXhTdGFydCA9PSBOT19DQVJEXHJcbiAgICAjQGdhbWUubG9nIFwiZHJhZ2dpbmcgYXJvdW5kIGNhcmQgaW5kZXggI3tAZHJhZ0luZGV4Q3VycmVudH1cIlxyXG4gICAgQHJlb3JkZXIoKVxyXG4gICAgQHVwZGF0ZVBvc2l0aW9ucygpXHJcblxyXG4gIHVwOiAoQGRyYWdYLCBAZHJhZ1kpIC0+XHJcbiAgICByZXR1cm4gaWYgQGRyYWdJbmRleFN0YXJ0ID09IE5PX0NBUkRcclxuICAgIEByZW9yZGVyKClcclxuICAgIGlmIEB3YW50c1RvUGxheURyYWdnZWRDYXJkKClcclxuICAgICAgQGdhbWUubG9nIFwidHJ5aW5nIHRvIHBsYXkgYSAje0BjYXJkc1tAZHJhZ0luZGV4U3RhcnRdfSBmcm9tIGluZGV4ICN7QGRyYWdJbmRleFN0YXJ0fVwiXHJcbiAgICAgIGNhcmRJbmRleCA9IEBkcmFnSW5kZXhTdGFydFxyXG4gICAgICBjYXJkID0gQGNhcmRzW2NhcmRJbmRleF1cclxuICAgICAgYW5pbSA9IEBhbmltc1tjYXJkXVxyXG4gICAgICBAZHJhZ0luZGV4U3RhcnQgPSBOT19DQVJEXHJcbiAgICAgIEBkcmFnSW5kZXhDdXJyZW50ID0gTk9fQ0FSRFxyXG4gICAgICBAZ2FtZS5wbGF5IFt7XHJcbiAgICAgICAgY2FyZDogY2FyZFxyXG4gICAgICAgIHg6IGFuaW0uY3VyLnhcclxuICAgICAgICB5OiBhbmltLmN1ci55XHJcbiAgICAgICAgcjogYW5pbS5jdXIuclxyXG4gICAgICAgIGluZGV4OiBjYXJkSW5kZXhcclxuICAgICAgfV1cclxuICAgIGVsc2VcclxuICAgICAgQGdhbWUubG9nIFwidHJ5aW5nIHRvIHJlb3JkZXIgI3tAY2FyZHNbQGRyYWdJbmRleFN0YXJ0XX0gaW50byBpbmRleCAje0BkcmFnSW5kZXhDdXJyZW50fVwiXHJcbiAgICAgIEBjYXJkcyA9IEBjYWxjRHJhd25IYW5kKCkgIyBpcyB0aGlzIHJpZ2h0P1xyXG5cclxuICAgIEBkcmFnSW5kZXhTdGFydCA9IE5PX0NBUkRcclxuICAgIEBkcmFnSW5kZXhDdXJyZW50ID0gTk9fQ0FSRFxyXG4gICAgQHVwZGF0ZVBvc2l0aW9ucygpXHJcblxyXG4gIHVwZGF0ZTogKGR0KSAtPlxyXG4gICAgdXBkYXRlZCA9IGZhbHNlXHJcbiAgICBmb3IgY2FyZCxhbmltIG9mIEBhbmltc1xyXG4gICAgICBpZiBhbmltLnVwZGF0ZShkdClcclxuICAgICAgICB1cGRhdGVkID0gdHJ1ZVxyXG4gICAgcmV0dXJuIHVwZGF0ZWRcclxuXHJcbiAgcmVuZGVyOiAtPlxyXG4gICAgcmV0dXJuIGlmIEBjYXJkcy5sZW5ndGggPT0gMFxyXG4gICAgZHJhd25IYW5kID0gQGNhbGNEcmF3bkhhbmQoKVxyXG4gICAgZm9yIHYsIGluZGV4IGluIGRyYXduSGFuZFxyXG4gICAgICBjb250aW51ZSBpZiB2ID09IE5PX0NBUkRcclxuICAgICAgYW5pbSA9IEBhbmltc1t2XVxyXG4gICAgICBkbyAoYW5pbSwgaW5kZXgpID0+XHJcbiAgICAgICAgaWYgQG1vZGUgPT0gSGFuZC5QSUNLSU5HXHJcbiAgICAgICAgICBpZiBAcGlja2VkW2luZGV4XVxyXG4gICAgICAgICAgICBoaWdobGlnaHRTdGF0ZSA9IEhpZ2hsaWdodC5TRUxFQ1RFRFxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBoaWdobGlnaHRTdGF0ZSA9IEhpZ2hsaWdodC5VTlNFTEVDVEVEXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgaWYgQHdhbnRzVG9QbGF5RHJhZ2dlZENhcmQoKVxyXG4gICAgICAgICAgICBpZiAoaW5kZXggPT0gQGRyYWdJbmRleEN1cnJlbnQpXHJcbiAgICAgICAgICAgICAgaGlnaGxpZ2h0U3RhdGUgPSBIaWdobGlnaHQuU0VMRUNURURcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgIGhpZ2hsaWdodFN0YXRlID0gSGlnaGxpZ2h0LlVOU0VMRUNURURcclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgaGlnaGxpZ2h0U3RhdGUgPSBIaWdobGlnaHQuTk9ORVxyXG4gICAgICAgIEByZW5kZXJDYXJkIHYsIGFuaW0uY3VyLngsIGFuaW0uY3VyLnksIGFuaW0uY3VyLnIsIDEsIGhpZ2hsaWdodFN0YXRlLCAoY2xpY2tYLCBjbGlja1kpID0+XHJcbiAgICAgICAgICBAZG93bihjbGlja1gsIGNsaWNrWSwgaW5kZXgpXHJcblxyXG4gIHJlbmRlckNhcmQ6ICh2LCB4LCB5LCByb3QsIHNjYWxlLCBzZWxlY3RlZCwgY2IpIC0+XHJcbiAgICByb3QgPSAwIGlmIG5vdCByb3RcclxuICAgIHJhbmsgPSBNYXRoLmZsb29yKHYgLyA0KVxyXG4gICAgc3VpdCA9IE1hdGguZmxvb3IodiAlIDQpXHJcblxyXG4gICAgY29sID0gc3dpdGNoIHNlbGVjdGVkXHJcbiAgICAgIHdoZW4gSGlnaGxpZ2h0Lk5PTkVcclxuICAgICAgICBbMSwgMSwgMV1cclxuICAgICAgd2hlbiBIaWdobGlnaHQuVU5TRUxFQ1RFRFxyXG4gICAgICAgICMgWzAuMywgMC4zLCAwLjNdXHJcbiAgICAgICAgWzEsIDEsIDFdXHJcbiAgICAgIHdoZW4gSGlnaGxpZ2h0LlNFTEVDVEVEXHJcbiAgICAgICAgWzAuNSwgMC41LCAwLjldXHJcbiAgICAgIHdoZW4gSGlnaGxpZ2h0LlBJTEVcclxuICAgICAgICBbMC42LCAwLjYsIDAuNl1cclxuXHJcbiAgICBAZ2FtZS5kcmF3SW1hZ2UgXCJjYXJkc1wiLFxyXG4gICAgQ0FSRF9JTUFHRV9PRkZfWCArIChDQVJEX0lNQUdFX0FEVl9YICogcmFuayksIENBUkRfSU1BR0VfT0ZGX1kgKyAoQ0FSRF9JTUFHRV9BRFZfWSAqIHN1aXQpLCBDQVJEX0lNQUdFX1csIENBUkRfSU1BR0VfSCxcclxuICAgIHgsIHksIEBjYXJkV2lkdGggKiBzY2FsZSwgQGNhcmRIZWlnaHQgKiBzY2FsZSxcclxuICAgIHJvdCwgMC41LCAwLjUsIGNvbFswXSxjb2xbMV0sY29sWzJdLDEsIGNiXHJcblxyXG4gIGNhbGNQb3NpdGlvbnM6IChoYW5kU2l6ZSkgLT5cclxuICAgIGlmIEBwb3NpdGlvbkNhY2hlLmhhc093blByb3BlcnR5KGhhbmRTaXplKVxyXG4gICAgICByZXR1cm4gQHBvc2l0aW9uQ2FjaGVbaGFuZFNpemVdXHJcbiAgICByZXR1cm4gW10gaWYgaGFuZFNpemUgPT0gMFxyXG5cclxuICAgIGFkdmFuY2UgPSBAaGFuZEFuZ2xlIC8gaGFuZFNpemVcclxuICAgIGlmIGFkdmFuY2UgPiBAaGFuZEFuZ2xlQWR2YW5jZU1heFxyXG4gICAgICBhZHZhbmNlID0gQGhhbmRBbmdsZUFkdmFuY2VNYXhcclxuICAgIGFuZ2xlU3ByZWFkID0gYWR2YW5jZSAqIGhhbmRTaXplICAgICAgICAgICAgICAgICMgaG93IG11Y2ggb2YgdGhlIGFuZ2xlIHdlIHBsYW4gb24gdXNpbmdcclxuICAgIGFuZ2xlTGVmdG92ZXIgPSBAaGFuZEFuZ2xlIC0gYW5nbGVTcHJlYWQgICAgICAgICMgYW1vdW50IG9mIGFuZ2xlIHdlJ3JlIG5vdCB1c2luZywgYW5kIG5lZWQgdG8gcGFkIHNpZGVzIHdpdGggZXZlbmx5XHJcbiAgICBjdXJyZW50QW5nbGUgPSAtMSAqIChAaGFuZEFuZ2xlIC8gMikgICAgICAgICAgICAjIG1vdmUgdG8gdGhlIGxlZnQgc2lkZSBvZiBvdXIgYW5nbGVcclxuICAgIGN1cnJlbnRBbmdsZSArPSBhbmdsZUxlZnRvdmVyIC8gMiAgICAgICAgICAgICAgICMgLi4uIGFuZCBhZHZhbmNlIHBhc3QgaGFsZiBvZiB0aGUgcGFkZGluZ1xyXG4gICAgY3VycmVudEFuZ2xlICs9IGFkdmFuY2UgLyAyICAgICAgICAgICAgICAgICAgICAgIyAuLi4gYW5kIGNlbnRlciB0aGUgY2FyZHMgaW4gdGhlIGFuZ2xlXHJcblxyXG4gICAgcG9zaXRpb25zID0gW11cclxuICAgIGZvciBpIGluIFswLi4uaGFuZFNpemVdXHJcbiAgICAgIHggPSBAaGFuZENlbnRlci54IC0gTWF0aC5jb3MoKE1hdGguUEkgLyAyKSArIGN1cnJlbnRBbmdsZSkgKiBAaGFuZERpc3RhbmNlXHJcbiAgICAgIHkgPSBAaGFuZENlbnRlci55IC0gTWF0aC5zaW4oKE1hdGguUEkgLyAyKSArIGN1cnJlbnRBbmdsZSkgKiBAaGFuZERpc3RhbmNlXHJcbiAgICAgIGN1cnJlbnRBbmdsZSArPSBhZHZhbmNlXHJcbiAgICAgIHBvc2l0aW9ucy5wdXNoIHtcclxuICAgICAgICB4OiB4XHJcbiAgICAgICAgeTogeVxyXG4gICAgICAgIHI6IGN1cnJlbnRBbmdsZSAtIGFkdmFuY2VcclxuICAgICAgfVxyXG5cclxuICAgIEBwb3NpdGlvbkNhY2hlW2hhbmRTaXplXSA9IHBvc2l0aW9uc1xyXG4gICAgcmV0dXJuIHBvc2l0aW9uc1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBIYW5kXHJcbiIsIkJ1dHRvbiA9IHJlcXVpcmUgJy4vQnV0dG9uJ1xyXG5cclxuY2xhc3MgTWVudVxyXG4gIGNvbnN0cnVjdG9yOiAoQGdhbWUsIEB0aXRsZSwgQGJhY2tncm91bmQsIEBjb2xvciwgQGFjdGlvbnMpIC0+XHJcbiAgICBAYnV0dG9ucyA9IFtdXHJcbiAgICBAYnV0dG9uTmFtZXMgPSBbXCJidXR0b24wXCIsIFwiYnV0dG9uMVwiXVxyXG5cclxuICAgIGJ1dHRvblNpemUgPSBAZ2FtZS5oZWlnaHQgLyAxNVxyXG4gICAgQGJ1dHRvblN0YXJ0WSA9IEBnYW1lLmhlaWdodCAvIDVcclxuXHJcbiAgICBzbGljZSA9IChAZ2FtZS5oZWlnaHQgLSBAYnV0dG9uU3RhcnRZKSAvIChAYWN0aW9ucy5sZW5ndGggKyAxKVxyXG4gICAgY3VyclkgPSBAYnV0dG9uU3RhcnRZICsgc2xpY2VcclxuICAgIGZvciBhY3Rpb24gaW4gQGFjdGlvbnNcclxuICAgICAgYnV0dG9uID0gbmV3IEJ1dHRvbihAZ2FtZSwgQGJ1dHRvbk5hbWVzLCBAZ2FtZS5mb250LCBidXR0b25TaXplLCBAZ2FtZS5jZW50ZXIueCwgY3VyclksIGFjdGlvbilcclxuICAgICAgQGJ1dHRvbnMucHVzaCBidXR0b25cclxuICAgICAgY3VyclkgKz0gc2xpY2VcclxuXHJcbiAgdXBkYXRlOiAoZHQpIC0+XHJcbiAgICB1cGRhdGVkID0gZmFsc2VcclxuICAgIGZvciBidXR0b24gaW4gQGJ1dHRvbnNcclxuICAgICAgaWYgYnV0dG9uLnVwZGF0ZShkdClcclxuICAgICAgICB1cGRhdGVkID0gdHJ1ZVxyXG4gICAgcmV0dXJuIHVwZGF0ZWRcclxuXHJcbiAgcmVuZGVyOiAtPlxyXG4gICAgQGdhbWUuc3ByaXRlUmVuZGVyZXIucmVuZGVyIEBiYWNrZ3JvdW5kLCAwLCAwLCBAZ2FtZS53aWR0aCwgQGdhbWUuaGVpZ2h0LCAwLCAwLCAwLCBAY29sb3JcclxuICAgIEBnYW1lLmZvbnRSZW5kZXJlci5yZW5kZXIgQGdhbWUuZm9udCwgQGdhbWUuaGVpZ2h0IC8gMjUsIFwiQnVpbGQ6ICN7QGdhbWUudmVyc2lvbn1cIiwgMCwgQGdhbWUuaGVpZ2h0LCAwLCAxLCBAZ2FtZS5jb2xvcnMubGlnaHRncmF5XHJcbiAgICB0aXRsZUhlaWdodCA9IEBnYW1lLmhlaWdodCAvIDhcclxuICAgIHRpdGxlT2Zmc2V0ID0gQGJ1dHRvblN0YXJ0WSA+PiAxXHJcbiAgICBAZ2FtZS5mb250UmVuZGVyZXIucmVuZGVyIEBnYW1lLmZvbnQsIHRpdGxlSGVpZ2h0LCBAdGl0bGUsIEBnYW1lLmNlbnRlci54LCB0aXRsZU9mZnNldCwgMC41LCAwLjUsIEBnYW1lLmNvbG9ycy53aGl0ZVxyXG4gICAgZm9yIGJ1dHRvbiBpbiBAYnV0dG9uc1xyXG4gICAgICBidXR0b24ucmVuZGVyKClcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWVudVxyXG4iLCJBbmltYXRpb24gPSByZXF1aXJlICcuL0FuaW1hdGlvbidcclxuSGFuZCA9IHJlcXVpcmUgJy4vSGFuZCdcclxuXHJcblNFVFRMRV9NUyA9IDI1MFxyXG5cclxuY2xhc3MgUGlsZVxyXG4gIGNvbnN0cnVjdG9yOiAoQGdhbWUsIEBoYW5kKSAtPlxyXG4gICAgQHBsYXlJRCA9IC0xXHJcbiAgICBAcGxheXMgPSBbXVxyXG4gICAgQGFuaW1zID0ge31cclxuICAgIEBzZXR0bGVUaW1lciA9IDBcclxuICAgIEB0aHJvd25Db2xvciA9IHsgcjogMSwgZzogMSwgYjogMCwgYTogMX1cclxuICAgIEBzY2FsZSA9IDAuNlxyXG5cclxuICAgICMgMS4wIGlzIG5vdCBtZXNzeSBhdCBhbGwsIGFzIHlvdSBhcHByb2FjaCAwIGl0IHN0YXJ0cyB0byBhbGwgcGlsZSBvbiBvbmUgYW5vdGhlclxyXG4gICAgbWVzc3kgPSAwLjJcclxuXHJcbiAgICBAcGxheUNhcmRTcGFjaW5nID0gMC4xXHJcblxyXG4gICAgY2VudGVyWCA9IEBnYW1lLmNlbnRlci54XHJcbiAgICBjZW50ZXJZID0gQGdhbWUuY2VudGVyLnlcclxuICAgIG9mZnNldFggPSBAaGFuZC5jYXJkV2lkdGggKiBtZXNzeSAqIEBzY2FsZVxyXG4gICAgb2Zmc2V0WSA9IEBoYW5kLmNhcmRIYWxmSGVpZ2h0ICogbWVzc3kgKiBAc2NhbGVcclxuICAgIEBwbGF5TG9jYXRpb25zID0gW1xyXG4gICAgICB7IHg6IGNlbnRlclgsIHk6IGNlbnRlclkgKyBvZmZzZXRZIH0gIyBib3R0b21cclxuICAgICAgeyB4OiBjZW50ZXJYIC0gb2Zmc2V0WCwgeTogY2VudGVyWSB9ICMgbGVmdFxyXG4gICAgICB7IHg6IGNlbnRlclgsIHk6IGNlbnRlclkgLSBvZmZzZXRZIH0gIyB0b3BcclxuICAgICAgeyB4OiBjZW50ZXJYICsgb2Zmc2V0WCwgeTogY2VudGVyWSB9ICMgcmlnaHRcclxuICAgIF1cclxuICAgIEB0aHJvd0xvY2F0aW9ucyA9IFtcclxuICAgICAgeyB4OiBjZW50ZXJYLCB5OiBAZ2FtZS5oZWlnaHQgfSAjIGJvdHRvbVxyXG4gICAgICB7IHg6IDAsIHk6IGNlbnRlclkgKyBvZmZzZXRZIH0gIyBsZWZ0XHJcbiAgICAgIHsgeDogY2VudGVyWCwgeTogMCB9ICMgdG9wXHJcbiAgICAgIHsgeDogQGdhbWUud2lkdGgsIHk6IGNlbnRlclkgKyBvZmZzZXRZIH0gIyByaWdodFxyXG4gICAgXVxyXG5cclxuICBzZXQ6IChwaWxlSUQsIHBpbGUsIHBpbGVXaG8pIC0+XHJcbiAgICBpZiBAcGxheUlEICE9IHBpbGVJRFxyXG4gICAgICBAcGxheUlEID0gcGlsZUlEXHJcbiAgICAgIEBwbGF5cy5wdXNoIHtcclxuICAgICAgICBjYXJkczogcGlsZS5zbGljZSgwKVxyXG4gICAgICAgIHdobzogcGlsZVdob1xyXG4gICAgICB9XHJcbiAgICAgIEBzZXR0bGVUaW1lciA9IFNFVFRMRV9NU1xyXG5cclxuICAgICMgaWYgKEBwbGF5SUQgIT0gcGlsZUlEKSBhbmQgKHRocm93bi5sZW5ndGggPiAwKVxyXG4gICAgIyAgIEBwbGF5cyA9IHRocm93bi5zbGljZSgwKSAjIHRoZSBwaWxlIGhhcyBiZWNvbWUgdGhlIHRocm93biwgc3Rhc2ggaXQgb2ZmIG9uZSBsYXN0IHRpbWVcclxuICAgICMgICBAcGxheVdobyA9IHRocm93bldoby5zbGljZSgwKVxyXG4gICAgIyAgIEBwbGF5SUQgPSBwaWxlSURcclxuICAgICMgICBAc2V0dGxlVGltZXIgPSBTRVRUTEVfTVNcclxuXHJcbiAgICAjICMgZG9uJ3Qgc3RvbXAgdGhlIHBpbGUgd2UncmUgZHJhd2luZyB1bnRpbCBpdCBpcyBkb25lIHNldHRsaW5nIGFuZCBjYW4gZmx5IG9mZiB0aGUgc2NyZWVuXHJcbiAgICAjIGlmIEBzZXR0bGVUaW1lciA9PSAwXHJcbiAgICAjICAgQHBsYXlzID0gcGlsZS5zbGljZSgwKVxyXG4gICAgIyAgIEBwbGF5V2hvID0gcGlsZVdoby5zbGljZSgwKVxyXG4gICAgIyAgIEB0aHJvd24gPSB0aHJvd24uc2xpY2UoMClcclxuICAgICMgICBAdGhyb3duV2hvID0gdGhyb3duV2hvLnNsaWNlKDApXHJcbiAgICAjICAgQHRocm93blRha2VyID0gdGhyb3duVGFrZXJcclxuXHJcbiAgICBAc3luY0FuaW1zKClcclxuXHJcbiAgcG9rZTogLT5cclxuICAgIEBzZXR0bGVUaW1lciA9IFNFVFRMRV9NU1xyXG5cclxuICBoaW50OiAoY2FyZHMpIC0+XHJcbiAgICBmb3IgY2FyZCBpbiBjYXJkc1xyXG4gICAgICBAYW5pbXNbY2FyZC5jYXJkXSA9IG5ldyBBbmltYXRpb24ge1xyXG4gICAgICAgIHNwZWVkOiBAaGFuZC5jYXJkU3BlZWRcclxuICAgICAgICB4OiBjYXJkLnhcclxuICAgICAgICB5OiBjYXJkLnlcclxuICAgICAgICByOiBjYXJkLnJcclxuICAgICAgICBzOiAxXHJcbiAgICAgIH1cclxuXHJcbiAgc3luY0FuaW1zOiAtPlxyXG4gICAgc2VlbiA9IHt9XHJcbiAgICBsb2NhdGlvbnMgPSBAdGhyb3dMb2NhdGlvbnNcclxuICAgIGZvciBwbGF5IGluIEBwbGF5c1xyXG4gICAgICBmb3IgY2FyZCwgaW5kZXggaW4gcGxheS5jYXJkc1xyXG4gICAgICAgIHNlZW5bY2FyZF0rK1xyXG4gICAgICAgIGlmIG5vdCBAYW5pbXNbY2FyZF1cclxuICAgICAgICAgIHdobyA9IHBsYXkud2hvXHJcbiAgICAgICAgICBsb2NhdGlvbiA9IGxvY2F0aW9uc1t3aG9dXHJcbiAgICAgICAgICBAYW5pbXNbY2FyZF0gPSBuZXcgQW5pbWF0aW9uIHtcclxuICAgICAgICAgICAgc3BlZWQ6IEBoYW5kLmNhcmRTcGVlZFxyXG4gICAgICAgICAgICB4OiBsb2NhdGlvbi54XHJcbiAgICAgICAgICAgIHk6IGxvY2F0aW9uLnlcclxuICAgICAgICAgICAgcjogLTEgKiBNYXRoLlBJIC8gNFxyXG4gICAgICAgICAgICBzOiBAc2NhbGVcclxuICAgICAgICAgIH1cclxuXHJcbiAgICB0b1JlbW92ZSA9IFtdXHJcbiAgICBmb3IgY2FyZCxhbmltIG9mIEBhbmltc1xyXG4gICAgICBpZiBub3Qgc2Vlbi5oYXNPd25Qcm9wZXJ0eShjYXJkKVxyXG4gICAgICAgIHRvUmVtb3ZlLnB1c2ggY2FyZFxyXG4gICAgZm9yIGNhcmQgaW4gdG9SZW1vdmVcclxuICAgICAgIyBAZ2FtZS5sb2cgXCJyZW1vdmluZyBhbmltIGZvciAje2NhcmR9XCJcclxuICAgICAgZGVsZXRlIEBhbmltc1tjYXJkXVxyXG5cclxuICAgIEB1cGRhdGVQb3NpdGlvbnMoKVxyXG5cclxuICB1cGRhdGVQb3NpdGlvbnM6IC0+XHJcbiAgICBsb2NhdGlvbnMgPSBAcGxheUxvY2F0aW9uc1xyXG4gICAgZm9yIHBsYXksIHBsYXlJbmRleCBpbiBAcGxheXNcclxuICAgICAgZm9yIHYsIGluZGV4IGluIHBsYXkuY2FyZHNcclxuICAgICAgICBhbmltID0gQGFuaW1zW3ZdXHJcbiAgICAgICAgbG9jID0gcGxheS53aG9cclxuICAgICAgICBhbmltLnJlcS54ID0gbG9jYXRpb25zW2xvY10ueCArIChpbmRleCAqIEBoYW5kLmNhcmRXaWR0aCAqIEBwbGF5Q2FyZFNwYWNpbmcpXHJcbiAgICAgICAgYW5pbS5yZXEueSA9IGxvY2F0aW9uc1tsb2NdLnlcclxuICAgICAgICBhbmltLnJlcS5yID0gMC4yICogTWF0aC5jb3MocGxheUluZGV4IC8gMC4xKVxyXG4gICAgICAgIGFuaW0ucmVxLnMgPSBAc2NhbGVcclxuXHJcbiAgcmVhZHlGb3JOZXh0VHJpY2s6IC0+XHJcbiAgICByZXR1cm4gQHJlc3RpbmcoKVxyXG4gICAgIyByZXR1cm4gKEBzZXR0bGVUaW1lciA9PSAwKVxyXG5cclxuICB1cGRhdGU6IChkdCkgLT5cclxuICAgIHVwZGF0ZWQgPSBmYWxzZVxyXG5cclxuICAgIGlmIEBzZXR0bGVUaW1lciA+IDBcclxuICAgICAgdXBkYXRlZCA9IHRydWVcclxuICAgICAgQHNldHRsZVRpbWVyIC09IGR0XHJcbiAgICAgIGlmIEBzZXR0bGVUaW1lciA8IDBcclxuICAgICAgICBAc2V0dGxlVGltZXIgPSAwXHJcblxyXG4gICAgZm9yIGNhcmQsYW5pbSBvZiBAYW5pbXNcclxuICAgICAgaWYgYW5pbS51cGRhdGUoZHQpXHJcbiAgICAgICAgdXBkYXRlZCA9IHRydWVcclxuXHJcbiAgICByZXR1cm4gdXBkYXRlZFxyXG5cclxuICAjIHVzZWQgYnkgdGhlIGdhbWUgb3ZlciBzY3JlZW4uIEl0IHJldHVybnMgdHJ1ZSB3aGVuIG5laXRoZXIgdGhlIHBpbGUgbm9yIHRoZSBsYXN0IHRocm93biBhcmUgbW92aW5nXHJcbiAgcmVzdGluZzogLT5cclxuICAgIGZvciBjYXJkLGFuaW0gb2YgQGFuaW1zXHJcbiAgICAgIGlmIGFuaW0uYW5pbWF0aW5nKClcclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgIGlmIEBzZXR0bGVUaW1lciA+IDBcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICByZW5kZXI6IC0+XHJcbiAgICBmb3IgcGxheSwgcGxheUluZGV4IGluIEBwbGF5c1xyXG4gICAgICBoaWdobGlnaHQgPSBIYW5kLkhpZ2hsaWdodC5QSUxFXHJcbiAgICAgIGlmIHBsYXlJbmRleCA9PSAoQHBsYXlzLmxlbmd0aCAtIDEpXHJcbiAgICAgICAgaGlnaGxpZ2h0ID0gSGFuZC5IaWdobGlnaHQuTk9ORVxyXG4gICAgICBmb3IgdiwgaW5kZXggaW4gcGxheS5jYXJkc1xyXG4gICAgICAgIGFuaW0gPSBAYW5pbXNbdl1cclxuICAgICAgICBAaGFuZC5yZW5kZXJDYXJkIHYsIGFuaW0uY3VyLngsIGFuaW0uY3VyLnksIGFuaW0uY3VyLnIsIGFuaW0uY3VyLnMsIGhpZ2hsaWdodFxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQaWxlXHJcbiIsImNsYXNzIFNwcml0ZVJlbmRlcmVyXHJcbiAgY29uc3RydWN0b3I6IChAZ2FtZSkgLT5cclxuICAgIEBzcHJpdGVzID1cclxuICAgICAgIyBnZW5lcmljIHNwcml0ZXNcclxuICAgICAgc29saWQ6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogIDU1LCB5OiA3MjMsIHc6ICAxMCwgaDogIDEwIH1cclxuICAgICAgcGF1c2U6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogNjAyLCB5OiA3MDcsIHc6IDEyMiwgaDogMTI1IH1cclxuICAgICAgYnV0dG9uMDogICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogMTQwLCB5OiA3NzcsIHc6IDQyMiwgaDogIDY1IH1cclxuICAgICAgYnV0dG9uMTogICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogMTQwLCB5OiA2OTgsIHc6IDQyMiwgaDogIDY1IH1cclxuICAgICAgcGx1czA6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogNzQ1LCB5OiA2NjQsIHc6IDExNiwgaDogMTE4IH1cclxuICAgICAgcGx1czE6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogNzQ1LCB5OiA4MjAsIHc6IDExNiwgaDogMTE4IH1cclxuICAgICAgbWludXMwOiAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogODk1LCB5OiA2NjQsIHc6IDExNiwgaDogMTE4IH1cclxuICAgICAgbWludXMxOiAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogODk1LCB5OiA4MjAsIHc6IDExNiwgaDogMTE4IH1cclxuICAgICAgYXJyb3dMOiAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogIDMzLCB5OiA4NTgsIHc6IDIwNCwgaDogMTU2IH1cclxuICAgICAgYXJyb3dSOiAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogMjM5LCB5OiA4NTIsIHc6IDIwOCwgaDogMTU1IH1cclxuXHJcbiAgICAgIHBpbGU6ICAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6ICAxMywgeTogODgzLCB3OiAxMjgsIGg6IDEyOCB9XHJcbiAgICAgIHBpbGUwOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDE0NSwgeTogODgzLCB3OiAxMjgsIGg6IDEyOCB9XHJcbiAgICAgIHBpbGUxOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDI3NywgeTogODgzLCB3OiAxMjgsIGg6IDEyOCB9XHJcbiAgICAgIHBpbGUyOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDQwOSwgeTogODgzLCB3OiAxMjgsIGg6IDEyOCB9XHJcbiAgICAgIHBpbGUzOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDU0MSwgeTogODgzLCB3OiAxMjgsIGg6IDEyOCB9XHJcblxyXG4gICAgICAjIG1lbnUgYmFja2dyb3VuZHNcclxuICAgICAgbWFpbm1lbnU6ICB7IHRleHR1cmU6IFwibWFpbm1lbnVcIiwgIHg6IDAsIHk6IDAsIHc6IDEyODAsIGg6IDcyMCB9XHJcbiAgICAgIHBhdXNlbWVudTogeyB0ZXh0dXJlOiBcInBhdXNlbWVudVwiLCB4OiAwLCB5OiAwLCB3OiAxMjgwLCBoOiA3MjAgfVxyXG5cclxuICAgICAgIyBob3d0b1xyXG4gICAgICBob3cxOiAgICAgIHsgdGV4dHVyZTogXCJob3cxXCIsICAgIHg6IDAsIHk6ICAwLCB3OiAxOTIwLCBoOiAxMDgwIH1cclxuICAgICAgaG93MjogICAgICB7IHRleHR1cmU6IFwiaG93MlwiLCAgICB4OiAwLCB5OiAgMCwgdzogMTkyMCwgaDogMTA4MCB9XHJcbiAgICAgIGhvdzM6ICAgICAgeyB0ZXh0dXJlOiBcImhvdzNcIiwgICAgeDogMCwgeTogIDAsIHc6IDE5MjAsIGg6IDEwODAgfVxyXG5cclxuICAgICAgYXU6ICAgICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogNTQwLCB5OiAxMDc5LCB3OiA0MDAsIGg6ICA4MCB9XHJcbiAgICAgIHN0YXJfb246ICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6ICAzOCwgeTogMTA2NiwgdzogMTkwLCBoOiAxOTAgfVxyXG4gICAgICBzdGFyX29mZjogIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAyNTAsIHk6IDEwNjYsIHc6IDE5MCwgaDogMTkwIH1cclxuXHJcbiAgICAgICMgY2hhcmFjdGVyc1xyXG4gICAgICBtYXJpbzogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAgMjAsIHk6ICAgMCwgdzogMTUxLCBoOiAzMDggfVxyXG4gICAgICBsdWlnaTogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAxNzEsIHk6ICAgMCwgdzogMTUxLCBoOiAzMDggfVxyXG4gICAgICBwZWFjaDogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAzMzUsIHk6ICAgMCwgdzogMTY0LCBoOiAzMDggfVxyXG4gICAgICBkYWlzeTogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA1MDQsIHk6ICAgMCwgdzogMTY0LCBoOiAzMDggfVxyXG4gICAgICB5b3NoaTogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA2NjgsIHk6ICAgMCwgdzogMTgwLCBoOiAzMDggfVxyXG4gICAgICB0b2FkOiAgICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA4NDksIHk6ICAgMCwgdzogMTU3LCBoOiAzMDggfVxyXG4gICAgICBib3dzZXI6ICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAgMTEsIHk6IDMyMiwgdzogMTUxLCBoOiAzMDggfVxyXG4gICAgICBib3dzZXJqcjogIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAyMjUsIHk6IDMyMiwgdzogMTQ0LCBoOiAzMDggfVxyXG4gICAgICBrb29wYTogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAzNzIsIHk6IDMyMiwgdzogMTI4LCBoOiAzMDggfVxyXG4gICAgICByb3NhbGluYTogIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA1MDAsIHk6IDMyMiwgdzogMTczLCBoOiAzMDggfVxyXG4gICAgICBzaHlndXk6ICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA2OTEsIHk6IDMyMiwgdzogMTU0LCBoOiAzMDggfVxyXG4gICAgICB0b2FkZXR0ZTogIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA4NDcsIHk6IDMyMiwgdzogMTU4LCBoOiAzMDggfVxyXG5cclxuICBjYWxjV2lkdGg6IChzcHJpdGVOYW1lLCBoZWlnaHQpIC0+XHJcbiAgICBzcHJpdGUgPSBAc3ByaXRlc1tzcHJpdGVOYW1lXVxyXG4gICAgcmV0dXJuIDEgaWYgbm90IHNwcml0ZVxyXG4gICAgcmV0dXJuIGhlaWdodCAqIHNwcml0ZS53IC8gc3ByaXRlLmhcclxuXHJcbiAgcmVuZGVyOiAoc3ByaXRlTmFtZSwgZHgsIGR5LCBkdywgZGgsIHJvdCwgYW5jaG9yeCwgYW5jaG9yeSwgY29sb3IsIGNiKSAtPlxyXG4gICAgc3ByaXRlID0gQHNwcml0ZXNbc3ByaXRlTmFtZV1cclxuICAgIHJldHVybiBpZiBub3Qgc3ByaXRlXHJcbiAgICBpZiAoZHcgPT0gMCkgYW5kIChkaCA9PSAwKVxyXG4gICAgICAjIHRoaXMgcHJvYmFibHkgc2hvdWxkbid0IGV2ZXIgYmUgdXNlZC5cclxuICAgICAgZHcgPSBzcHJpdGUueFxyXG4gICAgICBkaCA9IHNwcml0ZS55XHJcbiAgICBlbHNlIGlmIGR3ID09IDBcclxuICAgICAgZHcgPSBkaCAqIHNwcml0ZS53IC8gc3ByaXRlLmhcclxuICAgIGVsc2UgaWYgZGggPT0gMFxyXG4gICAgICBkaCA9IGR3ICogc3ByaXRlLmggLyBzcHJpdGUud1xyXG4gICAgQGdhbWUuZHJhd0ltYWdlIHNwcml0ZS50ZXh0dXJlLCBzcHJpdGUueCwgc3ByaXRlLnksIHNwcml0ZS53LCBzcHJpdGUuaCwgZHgsIGR5LCBkdywgZGgsIHJvdCwgYW5jaG9yeCwgYW5jaG9yeSwgY29sb3IuciwgY29sb3IuZywgY29sb3IuYiwgY29sb3IuYSwgY2JcclxuICAgIHJldHVyblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTcHJpdGVSZW5kZXJlclxyXG4iLCJNSU5fUExBWUVSUyA9IDNcclxuTUFYX0xPR19MSU5FUyA9IDZcclxuT0sgPSAnT0snXHJcblxyXG5TVEFSVElOR19NT05FWSA9IDI1XHJcblxyXG5TdWl0ID1cclxuICBOT05FOiAtMVxyXG4gIFNQQURFUzogMFxyXG4gIENMVUJTOiAxXHJcbiAgRElBTU9ORFM6IDJcclxuICBIRUFSVFM6IDNcclxuXHJcblN1aXROYW1lID0gWydTcGFkZXMnLCAnQ2x1YnMnLCAnRGlhbW9uZHMnLCAnSGVhcnRzJ11cclxuU2hvcnRTdWl0TmFtZSA9IFsnUycsICdDJywgJ0QnLCAnSCddXHJcbkdseXBoU3VpdE5hbWUgPSBbXCJcXHhjOFwiLCBcIlxceGM5XCIsIFwiXFx4Y2FcIiwgXCJcXHhjYlwiXVxyXG5cclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuIyBBSSBOYW1lIEdlbmVyYXRvclxyXG5cclxuYWlDaGFyYWN0ZXJMaXN0ID0gW1xyXG4gIHsgaWQ6IFwibWFyaW9cIiwgICAgbmFtZTogXCJNYXJpb1wiLCAgICAgIHNwcml0ZTogXCJtYXJpb1wiLCAgICBicmFpbjogXCJub3JtYWxcIiB9XHJcbiAgeyBpZDogXCJsdWlnaVwiLCAgICBuYW1lOiBcIkx1aWdpXCIsICAgICAgc3ByaXRlOiBcImx1aWdpXCIsICAgIGJyYWluOiBcIm5vcm1hbFwiIH1cclxuICB7IGlkOiBcInBlYWNoXCIsICAgIG5hbWU6IFwiUGVhY2hcIiwgICAgICBzcHJpdGU6IFwicGVhY2hcIiwgICAgYnJhaW46IFwibm9ybWFsXCIgfVxyXG4gIHsgaWQ6IFwiZGFpc3lcIiwgICAgbmFtZTogXCJEYWlzeVwiLCAgICAgIHNwcml0ZTogXCJkYWlzeVwiLCAgICBicmFpbjogXCJub3JtYWxcIiB9XHJcbiAgeyBpZDogXCJ5b3NoaVwiLCAgICBuYW1lOiBcIllvc2hpXCIsICAgICAgc3ByaXRlOiBcInlvc2hpXCIsICAgIGJyYWluOiBcIm5vcm1hbFwiIH1cclxuICB7IGlkOiBcInRvYWRcIiwgICAgIG5hbWU6IFwiVG9hZFwiLCAgICAgICBzcHJpdGU6IFwidG9hZFwiLCAgICAgYnJhaW46IFwibm9ybWFsXCIgfVxyXG4gIHsgaWQ6IFwiYm93c2VyXCIsICAgbmFtZTogXCJCb3dzZXJcIiwgICAgIHNwcml0ZTogXCJib3dzZXJcIiwgICBicmFpbjogXCJub3JtYWxcIiB9XHJcbiAgeyBpZDogXCJib3dzZXJqclwiLCBuYW1lOiBcIkJvd3NlciBKclwiLCAgc3ByaXRlOiBcImJvd3NlcmpyXCIsIGJyYWluOiBcIm5vcm1hbFwiIH1cclxuICB7IGlkOiBcImtvb3BhXCIsICAgIG5hbWU6IFwiS29vcGFcIiwgICAgICBzcHJpdGU6IFwia29vcGFcIiwgICAgYnJhaW46IFwibm9ybWFsXCIgfVxyXG4gIHsgaWQ6IFwicm9zYWxpbmFcIiwgbmFtZTogXCJSb3NhbGluYVwiLCAgIHNwcml0ZTogXCJyb3NhbGluYVwiLCBicmFpbjogXCJub3JtYWxcIiB9XHJcbiAgeyBpZDogXCJzaHlndXlcIiwgICBuYW1lOiBcIlNoeWd1eVwiLCAgICAgc3ByaXRlOiBcInNoeWd1eVwiLCAgIGJyYWluOiBcIm5vcm1hbFwiIH1cclxuICB7IGlkOiBcInRvYWRldHRlXCIsIG5hbWU6IFwiVG9hZGV0dGVcIiwgICBzcHJpdGU6IFwidG9hZGV0dGVcIiwgYnJhaW46IFwibm9ybWFsXCIgfVxyXG5dXHJcblxyXG5haUNoYXJhY3RlcnMgPSB7fVxyXG5mb3IgY2hhcmFjdGVyIGluIGFpQ2hhcmFjdGVyTGlzdFxyXG4gIGFpQ2hhcmFjdGVyc1tjaGFyYWN0ZXIuaWRdID0gY2hhcmFjdGVyXHJcblxyXG5yYW5kb21DaGFyYWN0ZXIgPSAtPlxyXG4gIHIgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBhaUNoYXJhY3Rlckxpc3QubGVuZ3RoKVxyXG4gIHJldHVybiBhaUNoYXJhY3Rlckxpc3Rbcl1cclxuXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgQ2FyZFxyXG5cclxuY2xhc3MgQ2FyZFxyXG4gIGNvbnN0cnVjdG9yOiAoQHJhdykgLT5cclxuICAgIEBzdWl0ICA9IE1hdGguZmxvb3IoQHJhdyAlIDQpXHJcbiAgICBAdmFsdWUgPSBNYXRoLmZsb29yKEByYXcgLyA0KVxyXG4gICAgQHZhbHVlTmFtZSA9IHN3aXRjaCBAdmFsdWVcclxuICAgICAgd2hlbiAgOCB0aGVuICdKJ1xyXG4gICAgICB3aGVuICA5IHRoZW4gJ1EnXHJcbiAgICAgIHdoZW4gMTAgdGhlbiAnSydcclxuICAgICAgd2hlbiAxMSB0aGVuICdBJ1xyXG4gICAgICB3aGVuIDEyIHRoZW4gJzInXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBTdHJpbmcoQHZhbHVlICsgMylcclxuICAgIEBuYW1lID0gQHZhbHVlTmFtZSArIFNob3J0U3VpdE5hbWVbQHN1aXRdXHJcbiAgICAjIGNvbnNvbGUubG9nIFwiI3tAcmF3fSAtPiAje0BuYW1lfVwiXHJcbiAgZ2x5cGhlZE5hbWU6IC0+XHJcbiAgICByZXR1cm4gQHZhbHVlTmFtZSArIEdseXBoU3VpdE5hbWVbQHN1aXRdXHJcblxyXG5jYXJkc1RvU3RyaW5nID0gKHJhd0NhcmRzKSAtPlxyXG4gIGNhcmROYW1lcyA9IFtdXHJcbiAgZm9yIHJhdyBpbiByYXdDYXJkc1xyXG4gICAgY2FyZCA9IG5ldyBDYXJkKHJhdylcclxuICAgIGNhcmROYW1lcy5wdXNoIGNhcmQubmFtZVxyXG4gIHJldHVybiBcIlsgXCIgKyBjYXJkTmFtZXMuam9pbignLCcpICsgXCIgXVwiXHJcblxyXG5wbGF5VHlwZVRvU3RyaW5nID0gKHR5cGUpIC0+XHJcbiAgaWYgbWF0Y2hlcyA9IHR5cGUubWF0Y2goL15yb3AoXFxkKykvKVxyXG4gICAgcmV0dXJuIFwiUnVuIG9mICN7bWF0Y2hlc1sxXX0gUGFpcnNcIlxyXG4gIGlmIG1hdGNoZXMgPSB0eXBlLm1hdGNoKC9ecnVuKFxcZCspLylcclxuICAgIHJldHVybiBcIlJ1biBvZiAje21hdGNoZXNbMV19XCJcclxuICBpZiBtYXRjaGVzID0gdHlwZS5tYXRjaCgvXmtpbmQoXFxkKykvKVxyXG4gICAgaWYgbWF0Y2hlc1sxXSA9PSAnMSdcclxuICAgICAgcmV0dXJuICdTaW5nbGUnXHJcbiAgICBpZiBtYXRjaGVzWzFdID09ICcyJ1xyXG4gICAgICByZXR1cm4gJ1BhaXInXHJcbiAgICBpZiBtYXRjaGVzWzFdID09ICczJ1xyXG4gICAgICByZXR1cm4gJ1RyaXBzJ1xyXG4gICAgcmV0dXJuICdRdWFkcydcclxuICByZXR1cm4gdHlwZVxyXG5cclxucGxheVRvU3RyaW5nID0gKHBsYXkpIC0+XHJcbiAgaGlnaENhcmQgPSBuZXcgQ2FyZChwbGF5LmhpZ2gpXHJcbiAgcmV0dXJuIFwiI3twbGF5VHlwZVRvU3RyaW5nKHBsYXkudHlwZSl9IC0gI3toaWdoQ2FyZC5nbHlwaGVkTmFtZSgpfVwiXHJcblxyXG5wbGF5VG9DYXJkQ291bnQgPSAocGxheSkgLT5cclxuICBpZiBtYXRjaGVzID0gcGxheS50eXBlLm1hdGNoKC9ecm9wKFxcZCspLylcclxuICAgIHJldHVybiBwYXJzZUludChtYXRjaGVzWzFdKSAqIDJcclxuICBpZiBtYXRjaGVzID0gcGxheS50eXBlLm1hdGNoKC9ecnVuKFxcZCspLylcclxuICAgIHJldHVybiBwYXJzZUludChtYXRjaGVzWzFdKVxyXG4gIGlmIG1hdGNoZXMgPSBwbGF5LnR5cGUubWF0Y2goL15raW5kKFxcZCspLylcclxuICAgIHJldHVybiBwYXJzZUludChtYXRjaGVzWzFdKVxyXG4gIHJldHVybiAxICMgPz9cclxuXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgRGVja1xyXG5cclxuY2xhc3MgU2h1ZmZsZWREZWNrXHJcbiAgY29uc3RydWN0b3I6IC0+XHJcbiAgICAjIGRhdCBpbnNpZGUtb3V0IHNodWZmbGUhXHJcbiAgICBAY2FyZHMgPSBbIDAgXVxyXG4gICAgZm9yIGkgaW4gWzEuLi41Ml1cclxuICAgICAgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGkpXHJcbiAgICAgIEBjYXJkcy5wdXNoKEBjYXJkc1tqXSlcclxuICAgICAgQGNhcmRzW2pdID0gaVxyXG5cclxuICAgICMgQGNhcmRzID0gW1xyXG4gICAgIyAgIDAsIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDksIDEwLCAxMSwgMTIsXHJcbiAgICAjICAgMTMsIDE0LCAxNSwgMTYsIDE3LCAxOCwgMTksIDIwLCAyMSwgMjIsIDIzLCAyNCwgMjUsXHJcbiAgICAjICAgMjYsIDI3LCAyOCwgMjksIDMwLCAzMSwgMzIsIDMzLCAzNCwgMzUsIDM2LCAzNywgMzgsXHJcbiAgICAjICAgMzksIDQwLCA0MSwgNDIsIDQzLCA0NCwgNDUsIDQ2LCA0NywgNDgsIDQ5LCA1MCwgNTFcclxuICAgICMgXVxyXG5cclxuICAgICMgQGNhcmRzID0gW1xyXG4gICAgIyAgIDAsIDMsIDcsIDExLCAxNSwgMTksIDIzLFxyXG4gICAgIyAgIDEsIDIsIDQsIDUsIDYsIDgsIDksIDEwLCAxMixcclxuICAgICMgICAxMywgMTQsIDE2LCAxNywgMTgsIDIwLCAyMSwgMjIsIDI0LCAyNSxcclxuICAgICMgICAyNiwgMjcsIDI4LCAyOSwgMzAsIDMxLCAzMiwgMzMsIDM0LCAzNSwgMzYsIDM3LCAzOCxcclxuICAgICMgICAzOSwgNDAsIDQxLCA0MiwgNDMsIDQ0LCA0NSwgNDYsIDQ3LCA0OCwgNDksIDUwLCA1MVxyXG4gICAgIyBdXHJcblxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIEFjaGlldmVtZW50c1xyXG5cclxuYWNoaWV2ZW1lbnRzTGlzdCA9IFtcclxuICB7XHJcbiAgICBpZDogXCJ2ZXRlcmFuXCJcclxuICAgIHRpdGxlOiBcIkkndmUgU2VlbiBTb21lIFRoaW5nc1wiXHJcbiAgICBkZXNjcmlwdGlvbjogW1wiUGxheSA1MCBIYW5kcy5cIl1cclxuICAgIHByb2dyZXNzOiAoYWNoKSAtPlxyXG4gICAgICBpZiBhY2guc3RhdGUudG90YWxHYW1lcyA+PSA1MFxyXG4gICAgICAgIHJldHVybiBcIlRvdGFsIFBsYXllZDogYGFhZmZhYWAje2FjaC5zdGF0ZS50b3RhbEdhbWVzfWBgIEdhbWVzXCJcclxuICAgICAgcmV0dXJuIFwiUHJvZ3Jlc3M6ICN7YWNoLnN0YXRlLnRvdGFsR2FtZXN9IC8gNTBcIlxyXG4gIH1cclxuICB7XHJcbiAgICBpZDogXCJ0cnloYXJkXCJcclxuICAgIHRpdGxlOiBcIlRyeWhhcmRcIlxyXG4gICAgZGVzY3JpcHRpb246IFtcIkVhcm4gYSA1IGdhbWUgd2luIHN0cmVhay5cIl1cclxuICAgIHByb2dyZXNzOiAoYWNoKSAtPlxyXG4gICAgICBiZXN0U3RyZWFrID0gYWNoLnN0YXRlLmJlc3RTdHJlYWtcclxuICAgICAgYmVzdFN0cmVhayA/PSAwXHJcbiAgICAgIGlmIGJlc3RTdHJlYWsgPj0gNVxyXG4gICAgICAgIHJldHVybiBcIkJlc3QgU3RyZWFrOiBgYWFmZmFhYCN7YmVzdFN0cmVha31gYCBXaW5zXCJcclxuICAgICAgcyA9IFwiXCJcclxuICAgICAgaWYgYmVzdFN0cmVhayA+IDFcclxuICAgICAgICBzID0gXCJzXCJcclxuICAgICAgcmV0dXJuIFwiQmVzdCBTdHJlYWs6ICN7YmVzdFN0cmVha30gV2luI3tzfVwiXHJcbiAgfVxyXG4gIHtcclxuICAgIGlkOiBcImJyZWFrZXJcIlxyXG4gICAgdGl0bGU6IFwiU3ByaW5nIEJyZWFrXCJcclxuICAgIGRlc2NyaXB0aW9uOiBbXCJCcmVhayBhIDIuXCJdXHJcbiAgfVxyXG4gIHtcclxuICAgIGlkOiBcImtlZXBpdGxvd1wiXHJcbiAgICB0aXRsZTogXCJLZWVwIEl0IExvdywgQm95c1wiXHJcbiAgICBkZXNjcmlwdGlvbjogW1wiUGxheSBhIFNpbmdsZSAyIG9uIHRvcCBvZiBhIFNpbmdsZSAzLlwiXVxyXG4gIH1cclxuICB7XHJcbiAgICBpZDogXCJzdWl0ZWRcIlxyXG4gICAgdGl0bGU6IFwiRG9lc24ndCBFdmVuIE1hdHRlclwiXHJcbiAgICBkZXNjcmlwdGlvbjogW1wiVGhyb3cgYSBzdWl0ZWQgcnVuLlwiXVxyXG4gIH1cclxuICB7XHJcbiAgICBpZDogXCJ0b255XCJcclxuICAgIHRpdGxlOiBcIlRoZSBUb255XCJcclxuICAgIGRlc2NyaXB0aW9uOiBbXCJUaHJvdyBhIHJ1biBvZiA3IG9yIG1vcmUgY2FyZHMsIGFuZCB0aGVuIGxvc2UuXCJdXHJcbiAgfVxyXG4gIHtcclxuICAgIGlkOiBcInNhbXBsZXJcIlxyXG4gICAgdGl0bGU6IFwiU2FtcGxlciBQbGF0dGVyXCJcclxuICAgIGRlc2NyaXB0aW9uOiBbXCJJbiBhIHNpbmdsZSBoYW5kOiBwbGF5IGF0IGxlYXN0IG9uZSBTaW5nbGUsXCIsIFwib25lIFBhaXIsIG9uZSBUcmlwcywgYW5kIG9uZSBSdW4uXCJdXHJcbiAgfVxyXG4gIHtcclxuICAgIGlkOiBcInRyYWdlZHlcIlxyXG4gICAgdGl0bGU6IFwiVHJhZ2VkeVwiXHJcbiAgICBkZXNjcmlwdGlvbjogW1wiQmVnaW4gdGhlIGdhbWUgYnkgdGhyb3dpbmcgYSB0d28gYnJlYWtlciBpbnZvbHZpbmdcIiwgXCJ0aGUgMyBvZiBTcGFkZXMuXCJdXHJcbiAgfVxyXG4gIHtcclxuICAgIGlkOiBcImluZG9taXRhYmxlXCJcclxuICAgIHRpdGxlOiBcIkluZG9taXRhYmxlXCJcclxuICAgIGRlc2NyaXB0aW9uOiBbXCJUaHJvdyBhIHJ1biBlbmRpbmcgaW4gdGhlIEFjZSBvZiBIZWFydHMuXCJdXHJcbiAgfVxyXG4gIHtcclxuICAgIGlkOiBcInJla3RcIlxyXG4gICAgdGl0bGU6IFwiR2V0IFJla3RcIlxyXG4gICAgZGVzY3JpcHRpb246IFtcIldpbiB3aGlsZSBhbGwgb3Bwb25lbnRzIHN0aWxsIGhhdmUgMTAgb3IgbW9yZSBjYXJkcy5cIl1cclxuICB9XHJcbiAge1xyXG4gICAgaWQ6IFwibGF0ZVwiXHJcbiAgICB0aXRsZTogXCJGYXNoaW9uYWJseSBMYXRlXCJcclxuICAgIGRlc2NyaXB0aW9uOiBbXCJQYXNzIHVudGlsIGFsbCA0IDJzIGFyZSB0aHJvd24sIGFuZCB0aGVuIHdpbi5cIl1cclxuICB9XHJcbiAge1xyXG4gICAgaWQ6IFwicGFpcnNcIlxyXG4gICAgdGl0bGU6IFwiUGFpcmluZyBVcFwiXHJcbiAgICBkZXNjcmlwdGlvbjogW1wiVGhyb3cgNSBwYWlycyBpbiBhIHNpbmdsZSByb3VuZC5cIl1cclxuICB9XHJcbiAge1xyXG4gICAgaWQ6IFwieW91cnNlbGZcIlxyXG4gICAgdGl0bGU6IFwiWW91IFBsYXllZCBZb3Vyc2VsZlwiXHJcbiAgICBkZXNjcmlwdGlvbjogW1wiQmVhdCB5b3VyIG93biBwbGF5LlwiXVxyXG4gIH1cclxuICB7XHJcbiAgICBpZDogXCJ0aGlydGVlblwiXHJcbiAgICB0aXRsZTogXCJUaGlydGVlblwiXHJcbiAgICBkZXNjcmlwdGlvbjogW1wiRWFybiAxMyBhY2hpZXZlbWVudHMuXCJdXHJcbiAgfVxyXG5cclxuICAjIFBhZ2UgMlxyXG5cclxuICB7XHJcbiAgICBpZDogXCJ2ZXRlcmFuMlwiXHJcbiAgICB0aXRsZTogXCJPbGQgVGltZXJcIlxyXG4gICAgZGVzY3JpcHRpb246IFtcIlBsYXkgMTAwMCBIYW5kcy5cIl1cclxuICAgIHByb2dyZXNzOiAoYWNoKSAtPlxyXG4gICAgICBpZiBhY2guc3RhdGUudG90YWxHYW1lcyA+PSAxMDAwXHJcbiAgICAgICAgcmV0dXJuIFwiVG90YWwgUGxheWVkOiBgYWFmZmFhYCN7YWNoLnN0YXRlLnRvdGFsR2FtZXN9YGAgR2FtZXNcIlxyXG4gICAgICByZXR1cm4gXCJQcm9ncmVzczogI3thY2guc3RhdGUudG90YWxHYW1lc30gLyAxMDAwXCJcclxuICB9XHJcblxyXG4gIHtcclxuICAgIGlkOiBcInNraWxsZWRcIlxyXG4gICAgdGl0bGU6IFwiU2tpbGxlZFwiXHJcbiAgICBkZXNjcmlwdGlvbjogW1wiV2luIDUwIEhhbmRzLlwiXVxyXG4gICAgcHJvZ3Jlc3M6IChhY2gpIC0+XHJcbiAgICAgIGlmIGFjaC5zdGF0ZS50b3RhbFdpbnMgPj0gNTBcclxuICAgICAgICByZXR1cm4gXCJUb3RhbCBXaW5zOiBgYWFmZmFhYCN7YWNoLnN0YXRlLnRvdGFsV2luc31gYCBXaW5zXCJcclxuICAgICAgcmV0dXJuIFwiUHJvZ3Jlc3M6ICN7YWNoLnN0YXRlLnRvdGFsV2luc30gLyA1MFwiXHJcbiAgfVxyXG5cclxuICB7XHJcbiAgICBpZDogXCJjb25zb2xhdGlvbnByaXplXCJcclxuICAgIHRpdGxlOiBcIkNvbnNvbGF0aW9uIFByaXplXCJcclxuICAgIGRlc2NyaXB0aW9uOiBbXCJMb3NlIDEwIEhhbmRzIHNwZWN0YWN1bGFybHkgKDEwKyBjYXJkcyBsZWZ0KS5cIl1cclxuICAgIHByb2dyZXNzOiAoYWNoKSAtPlxyXG4gICAgICBpZiBhY2guc3RhdGUuc3BlY3RhY3VsYXJMb3NzZXMgPj0gMTBcclxuICAgICAgICByZXR1cm4gXCJUb3RhbDogYGFhZmZhYWAje2FjaC5zdGF0ZS5zcGVjdGFjdWxhckxvc3Nlc31gYCBCYWQgQmVhdHNcIlxyXG4gICAgICByZXR1cm4gXCJQcm9ncmVzczogI3thY2guc3RhdGUuc3BlY3RhY3VsYXJMb3NzZXN9IC8gMTBcIlxyXG4gIH1cclxuXHJcbiAge1xyXG4gICAgaWQ6IFwiYmxpbmdcIlxyXG4gICAgdGl0bGU6IFwiQmxpbmcgQmxpbmdcIlxyXG4gICAgZGVzY3JpcHRpb246IFtcIkJhbmtydXB0IGFub3RoZXIgcGxheWVyIGluIGEgbW9uZXkgZ2FtZSB3aGVuXCIsIFwieW91IGFyZSBhaGVhZCBieSAkMTUgZG9sbGFycyBvciBtb3JlICgkI3tTVEFSVElOR19NT05FWSsxNX0gdG90YWwpLlwiXVxyXG4gIH1cclxuXHJcbiAge1xyXG4gICAgaWQ6IFwia2VlcHRoZWNoYW5nZVwiXHJcbiAgICB0aXRsZTogXCJLZWVwIHRoZSBDaGFuZ2VcIlxyXG4gICAgZGVzY3JpcHRpb246IFtcIldpbiBhIGhhbmQgYnkgdGhyb3dpbmcgYSBzaW5nbGUgMyBsYXN0LlwiXVxyXG4gIH1cclxuXHJcbiAge1xyXG4gICAgaWQ6IFwiZHJhZ3JhY2luZ1wiXHJcbiAgICB0aXRsZTogXCJEcmFnIFJhY2luZ1wiXHJcbiAgICBkZXNjcmlwdGlvbjogW1wiVGhyb3cgYSBwbGF5IHdpdGggdGhlIDMgb2Ygc3BhZGVzIHdoaWNoIG1ha2VzXCIsIFwiYWxsIG9wcG9uZW50cyBwYXNzLlwiXVxyXG4gIH1cclxuXHJcbiAge1xyXG4gICAgaWQ6IFwiaGFuZGljYXBwZWRcIlxyXG4gICAgdGl0bGU6IFwiSGFuZGljYXBwZWRcIlxyXG4gICAgZGVzY3JpcHRpb246IFtcIldpbiB3aXRoIGEgaGFuZCB3aXRob3V0IGFueSB0d29zLlwiXVxyXG4gIH1cclxuXHJcbiAge1xyXG4gICAgaWQ6IFwic29saXRhaXJlXCJcclxuICAgIHRpdGxlOiBcIlNvbGl0YWlyZVwiXHJcbiAgICBkZXNjcmlwdGlvbjogW1wiVGhyb3cgYSBydW4gb2YgNSBvciBtb3JlIGNhcmRzIHdpdGggYWx0ZXJuYXRpbmdcIiwgXCJyZWQgYW5kIGJsYWNrIGNvbG9ycy5cIl1cclxuICB9XHJcblxyXG4gIHtcclxuICAgIGlkOiBcImJhbGxldFwiXHJcbiAgICB0aXRsZTogXCJCYWxsZXRcIlxyXG4gICAgZGVzY3JpcHRpb246IFtcIlRocm93IGEgcGFpciBvZiB0d29zICh0d28gdHdvcykuXCJdXHJcbiAgfVxyXG5cclxuICB7XHJcbiAgICBpZDogXCJwYWxpbmRyb21lXCJcclxuICAgIHRpdGxlOiBcIlBhbGluZHJvbWVcIlxyXG4gICAgZGVzY3JpcHRpb246IFtcIlRocm93IGEgcnVuIG9mIHBhaXJzLi4uIGJ1dCBpbiBhIHJldmVyc2libGUgd2F5LlwiXVxyXG4gIH1cclxuXHJcbiAge1xyXG4gICAgaWQ6IFwicGFnZXJjb2RlXCJcclxuICAgIHRpdGxlOiBcIlBhZ2VyIENvZGVcIlxyXG4gICAgZGVzY3JpcHRpb246IFtcIlRoZSBzZWNyZXQgcGFzc3dvcmQgaXMgQkFUSEVTLiBEb24ndCB0ZWxsIGFueW9uZS5cIl1cclxuICB9XHJcblxyXG4gIHtcclxuICAgIGlkOiBcImJlYXN0XCJcclxuICAgIHRpdGxlOiBcIk51bWJlciBvZiB0aGUgQmVhc3RcIlxyXG4gICAgZGVzY3JpcHRpb246IFtcIlRocm93IGEgMy1vZi1hLWtpbmQgb2YgNnMuXCJdXHJcbiAgfVxyXG5cclxuICB7XHJcbiAgICBpZDogXCJ0aGlydGVlbjJcIlxyXG4gICAgdGl0bGU6IFwiVGhpcnRlZW4gMjogRWxlY3RyaWMgQm9vZ2Fsb29cIlxyXG4gICAgZGVzY3JpcHRpb246IFtcIkVhcm4gMTMgeCAyICgyNikgYWNoaWV2ZW1lbnRzLlwiXVxyXG4gIH1cclxuXHJcbiAge1xyXG4gICAgaWQ6IFwidG9hZFwiXHJcbiAgICB0aXRsZTogXCJOb2JvZHkgTGlrZXMgWW91LCBUb2FkXCJcclxuICAgIGRlc2NyaXB0aW9uOiBbXCJQdW5jaCBUb2FkIGluIHRoZSBmYWNlLlwiXVxyXG4gIH1cclxuXVxyXG5cclxuYWNoaWV2ZW1lbnRzTWFwID0ge31cclxuZm9yIGUgaW4gYWNoaWV2ZW1lbnRzTGlzdFxyXG4gIGFjaGlldmVtZW50c01hcFtlLmlkXSA9IGVcclxuXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgVGhpcnRlZW5cclxuXHJcbmNsYXNzIFRoaXJ0ZWVuXHJcbiAgQFNUQVJUSU5HX01PTkVZOiBTVEFSVElOR19NT05FWVxyXG5cclxuICBjb25zdHJ1Y3RvcjogKEBnYW1lLCBwYXJhbXMpIC0+XHJcbiAgICByZXR1cm4gaWYgbm90IHBhcmFtc1xyXG5cclxuICAgIGlmIHBhcmFtcy5zdGF0ZVxyXG4gICAgICBmb3Igayx2IG9mIHBhcmFtcy5zdGF0ZVxyXG4gICAgICAgIGlmIHBhcmFtcy5zdGF0ZS5oYXNPd25Qcm9wZXJ0eShrKVxyXG4gICAgICAgICAgdGhpc1trXSA9IHBhcmFtcy5zdGF0ZVtrXVxyXG4gICAgICBAaW5pdEFjaGlldmVtZW50cygpXHJcbiAgICBlbHNlXHJcbiAgICAgIEBuZXdHYW1lKHBhcmFtcy5tb25leSlcclxuXHJcbiAgaW5pdEFjaGlldmVtZW50czogLT5cclxuICAgIEBhY2ggPz0ge31cclxuICAgIEBhY2guZWFybmVkID89IHt9XHJcbiAgICBAYWNoLnN0YXRlID89IHt9XHJcbiAgICBAYWNoLnN0YXRlLnRvdGFsR2FtZXMgPz0gMFxyXG4gICAgQGFjaC5zdGF0ZS50b3RhbFdpbnMgPz0gMFxyXG4gICAgQGFjaC5zdGF0ZS5zcGVjdGFjdWxhckxvc3NlcyA/PSAwXHJcbiAgICBAZmFuZmFyZXMgPSBbXVxyXG5cclxuICBkZWFsOiAocGFyYW1zKSAtPlxyXG4gICAgZGVjayA9IG5ldyBTaHVmZmxlZERlY2soKVxyXG4gICAgZm9yIHBsYXllciwgcGxheWVySW5kZXggaW4gQHBsYXllcnNcclxuICAgICAgQGdhbWUubG9nIFwiZGVhbGluZyAxMyBjYXJkcyB0byBwbGF5ZXIgI3twbGF5ZXJJbmRleH1cIlxyXG5cclxuICAgICAgcGxheWVyLnBsYWNlID0gMFxyXG4gICAgICBwbGF5ZXIuaGFuZCA9IFtdXHJcbiAgICAgIGZvciBqIGluIFswLi4uMTNdXHJcbiAgICAgICAgcmF3ID0gZGVjay5jYXJkcy5zaGlmdCgpXHJcbiAgICAgICAgaWYgcmF3ID09IDBcclxuICAgICAgICAgIEB0dXJuID0gcGxheWVySW5kZXhcclxuICAgICAgICBwbGF5ZXIuaGFuZC5wdXNoKHJhdylcclxuXHJcbiAgICAgICMgY29uc29sZS5sb2cgXCJAZ2FtZS5vcHRpb25zLnNvcnRJbmRleCAje0BnYW1lLm9wdGlvbnMuc29ydEluZGV4fVwiXHJcbiAgICAgIGlmIChAZ2FtZS5vcHRpb25zLnNvcnRJbmRleCA9PSAwKSBvciBwbGF5ZXIuYWlcclxuICAgICAgICAjIE5vcm1hbFxyXG4gICAgICAgIHBsYXllci5oYW5kLnNvcnQgKGEsYikgLT4gcmV0dXJuIGEgLSBiXHJcbiAgICAgIGVsc2VcclxuICAgICAgICAjIFJldmVyc2VcclxuICAgICAgICBwbGF5ZXIuaGFuZC5zb3J0IChhLGIpIC0+IHJldHVybiBiIC0gYVxyXG5cclxuICAgIEBpbml0QWNoaWV2ZW1lbnRzKClcclxuICAgIEBhY2guc3RhdGUudGhyZXdTaW5nbGUgPSBmYWxzZVxyXG4gICAgQGFjaC5zdGF0ZS50aHJld1BhaXIgPSBmYWxzZVxyXG4gICAgQGFjaC5zdGF0ZS50aHJld1RyaXBzID0gZmFsc2VcclxuICAgIEBhY2guc3RhdGUudGhyZXdSdW4gPSBmYWxzZVxyXG4gICAgQGFjaC5zdGF0ZS50aHJld1J1bjcgPSBmYWxzZVxyXG4gICAgQGFjaC5zdGF0ZS50d29zU2VlbiA9IDBcclxuICAgIEBhY2guc3RhdGUuZmFzaGlvbmFibHlMYXRlID0gZmFsc2VcclxuICAgIEBhY2guc3RhdGUucGFpcnNUaHJvd24gPSAwXHJcbiAgICBAYWNoLnN0YXRlLmJlc3RTdHJlYWsgPz0gMFxyXG4gICAgQGFjaC5zdGF0ZS5oYW5kaWNhcHBlZCA9IG5vdCBAaGFuZEhhczIoQHBsYXllcnNbMF0uaGFuZClcclxuXHJcbiAgICBAcGlsZSA9IFtdXHJcbiAgICBAcGlsZVdobyA9IC0xXHJcbiAgICBAdGhyb3dJRCA9IDBcclxuICAgIEBjdXJyZW50UGxheSA9IG51bGxcclxuICAgIEB1bnBhc3NBbGwoKVxyXG5cclxuICAgIGZvck1vbmV5ID0gXCJcIlxyXG4gICAgaWYgQG1vbmV5XHJcbiAgICAgIGZvck1vbmV5ID0gXCIgKGZvciBtb25leSlcIlxyXG4gICAgQG91dHB1dChcIkhhbmQgZGVhbHQje2Zvck1vbmV5fSwgXCIgKyBAcGxheWVyc1tAdHVybl0ubmFtZSArIFwiIHBsYXlzIGZpcnN0XCIpXHJcblxyXG4gICAgcmV0dXJuIE9LXHJcblxyXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgIyBUaGlydGVlbiBtZXRob2RzXHJcblxyXG4gIG5ld0dhbWU6IChtb25leSA9IGZhbHNlLCBrZWVwU3RyZWFrID0gZmFsc2UpIC0+XHJcbiAgICAjIG5ldyBnYW1lXHJcbiAgICBAbG9nID0gW11cclxuICAgIGlmIGtlZXBTdHJlYWtcclxuICAgICAgQHN0cmVhayA/PSAwXHJcbiAgICAgIEBsYXN0U3RyZWFrID89IDBcclxuICAgIGVsc2VcclxuICAgICAgQHN0cmVhayA9IDBcclxuICAgICAgQGxhc3RTdHJlYWsgPSAwXHJcbiAgICBAbW9uZXkgPSBmYWxzZVxyXG4gICAgaWYgbW9uZXlcclxuICAgICAgQG1vbmV5ID0gdHJ1ZVxyXG4gICAgY29uc29sZS5sb2cgXCJmb3IgbW9uZXk6ICN7QG1vbmV5fVwiXHJcblxyXG4gICAgQHBsYXllcnMgPSBbXHJcbiAgICAgIHsgaWQ6IDEsIG5hbWU6ICdQbGF5ZXInLCBpbmRleDogMCwgcGFzczogZmFsc2UsIG1vbmV5OiBUaGlydGVlbi5TVEFSVElOR19NT05FWSB9XHJcbiAgICBdXHJcblxyXG4gICAgZm9yIGkgaW4gWzEuLi40XVxyXG4gICAgICBAYWRkQUkoKVxyXG5cclxuICAgIEBkZWFsKClcclxuXHJcbiAgc2F2ZTogLT5cclxuICAgIG5hbWVzID0gXCJsb2cgcGxheWVycyB0dXJuIHBpbGUgcGlsZVdobyB0aHJvd0lEIGN1cnJlbnRQbGF5IHN0cmVhayBsYXN0U3RyZWFrIGFjaCBtb25leVwiLnNwbGl0KFwiIFwiKVxyXG4gICAgc3RhdGUgPSB7fVxyXG4gICAgZm9yIG5hbWUgaW4gbmFtZXNcclxuICAgICAgc3RhdGVbbmFtZV0gPSB0aGlzW25hbWVdXHJcbiAgICByZXR1cm4gc3RhdGVcclxuXHJcbiAgb3V0cHV0OiAodGV4dCkgLT5cclxuICAgIEBsb2cucHVzaCB0ZXh0XHJcbiAgICB3aGlsZSBAbG9nLmxlbmd0aCA+IE1BWF9MT0dfTElORVNcclxuICAgICAgQGxvZy5zaGlmdCgpXHJcblxyXG4gIGhlYWRsaW5lOiAtPlxyXG4gICAgaWYgQGdhbWVPdmVyKClcclxuICAgICAgcmV0dXJuIFwiR2FtZSBPdmVyXCJcclxuXHJcbiAgICBpZiBAcGlsZS5sZW5ndGggPT0gMFxyXG4gICAgICBwbGF5U3RyaW5nID0gXCJ0aHJvdyBBbnl0aGluZyB3aXRoIHRoZSAzXFx4YzhcIlxyXG4gICAgZWxzZVxyXG4gICAgICBpZiBAY3VycmVudFBsYXlcclxuICAgICAgICBwbGF5U3RyaW5nID0gXCJiZWF0IFwiICsgcGxheVRvU3RyaW5nKEBjdXJyZW50UGxheSlcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHBsYXlTdHJpbmcgPSBcInRocm93IEFueXRoaW5nXCJcclxuXHJcbiAgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxyXG4gICAgaWYgY3VycmVudFBsYXllci5haVxyXG4gICAgICBwbGF5ZXJDb2xvciA9ICdiMGIwMDAnXHJcbiAgICBlbHNlXHJcbiAgICAgIHBsYXllckNvbG9yID0gJ2ZmNzcwMCdcclxuICAgIGhlYWRsaW5lID0gXCJgI3twbGF5ZXJDb2xvcn1gI3tjdXJyZW50UGxheWVyLm5hbWV9YGZmZmZmZmAgdG8gI3twbGF5U3RyaW5nfVwiXHJcbiAgICBpZiBAZXZlcnlvbmVQYXNzZWQoKVxyXG4gICAgICBoZWFkbGluZSArPSBcIiAob3IgdGhyb3cgYW55dGhpbmcpXCJcclxuICAgIHJldHVybiBoZWFkbGluZVxyXG5cclxuICBjYW5UaHJvd0FueXRoaW5nOiAtPlxyXG4gICAgaWYgQHBpbGUubGVuZ3RoID09IDBcclxuICAgICAgcmV0dXJuIHRydWVcclxuICAgIGlmIG5vdCBAY3VycmVudFBsYXlcclxuICAgICAgcmV0dXJuIHRydWVcclxuICAgIGlmIEBldmVyeW9uZVBhc3NlZCgpXHJcbiAgICAgIHJldHVybiB0cnVlXHJcbiAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgZmluZFBsYXllcjogKGlkKSAtPlxyXG4gICAgZm9yIHBsYXllciBpbiBAcGxheWVyc1xyXG4gICAgICBpZiBwbGF5ZXIuaWQgPT0gaWRcclxuICAgICAgICByZXR1cm4gcGxheWVyXHJcbiAgICByZXR1cm4gdW5kZWZpbmVkXHJcblxyXG4gIGN1cnJlbnRQbGF5ZXI6IC0+XHJcbiAgICByZXR1cm4gQHBsYXllcnNbQHR1cm5dXHJcblxyXG4gIGZpbmRQbGFjZTogKHBsYWNlKSAtPlxyXG4gICAgZm9yIHBsYXllciBpbiBAcGxheWVyc1xyXG4gICAgICBpZiAocGxhY2UgPT0gNCkgYW5kIChwbGF5ZXIucGxhY2UgPT0gMClcclxuICAgICAgICByZXR1cm4gcGxheWVyXHJcbiAgICAgIGlmIHBsYXllci5wbGFjZSA9PSBwbGFjZVxyXG4gICAgICAgIHJldHVybiBwbGF5ZXJcclxuICAgIHJldHVybiB1bmRlZmluZWRcclxuXHJcbiAgcGF5b3V0OiAtPlxyXG4gICAgcGxhY2UxID0gQGZpbmRQbGFjZSgxKVxyXG4gICAgcGxhY2UyID0gQGZpbmRQbGFjZSgyKVxyXG4gICAgcGxhY2UzID0gQGZpbmRQbGFjZSgzKVxyXG4gICAgcGxhY2U0ID0gQGZpbmRQbGFjZSg0KVxyXG5cclxuICAgIGlmIG5vdCBwbGFjZTEgb3Igbm90IHBsYWNlMiBvciBub3QgcGxhY2UzIG9yIG5vdCBwbGFjZTRcclxuICAgICAgQG91dHB1dCBcImVycm9yIHdpdGggcGF5b3V0cyFcIlxyXG4gICAgICByZXR1cm5cclxuXHJcbiAgICBAb3V0cHV0IFwiI3twbGFjZTQubmFtZX0gcGF5cyAkMiB0byAje3BsYWNlMS5uYW1lfVwiXHJcbiAgICBAb3V0cHV0IFwiI3twbGFjZTMubmFtZX0gcGF5cyAkMSB0byAje3BsYWNlMi5uYW1lfVwiXHJcblxyXG4gICAgcGxhY2UxLm1vbmV5ICs9IDJcclxuICAgIHBsYWNlMi5tb25leSArPSAxXHJcbiAgICBwbGFjZTMubW9uZXkgKz0gLTFcclxuICAgIHBsYWNlNC5tb25leSArPSAtMlxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHB1bmNoOiAoY2hhcmFjdGVyKSAtPlxyXG4gICAgY29uc29sZS5sb2cgXCJ0aGlydGVlbjogcHVuY2hpbmcgI3tjaGFyYWN0ZXIuaWR9XCJcclxuICAgIGlmIGNoYXJhY3Rlci5pZCA9PSAndG9hZCdcclxuICAgICAgQGVhcm4gXCJ0b2FkXCJcclxuXHJcbiAgIyBhbGwgSU5DTFVESU5HIHRoZSBjdXJyZW50IHBsYXllclxyXG4gIGVudGlyZVRhYmxlUGFzc2VkOiAtPlxyXG4gICAgZm9yIHBsYXllciwgcGxheWVySW5kZXggaW4gQHBsYXllcnNcclxuICAgICAgaWYgcGxheWVyLnBsYWNlICE9IDBcclxuICAgICAgICBjb250aW51ZVxyXG4gICAgICBpZiBub3QgcGxheWVyLnBhc3NcclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgIHJldHVybiB0cnVlXHJcblxyXG4gICMgYWxsIGJ1dCB0aGUgY3VycmVudCBwbGF5ZXJcclxuICBldmVyeW9uZVBhc3NlZDogLT5cclxuICAgIGZvciBwbGF5ZXIsIHBsYXllckluZGV4IGluIEBwbGF5ZXJzXHJcbiAgICAgIGlmIChwbGF5ZXIucGxhY2UgIT0gMCkgYW5kIChAcGlsZVdobyAhPSBwbGF5ZXJJbmRleClcclxuICAgICAgICBjb250aW51ZVxyXG4gICAgICBpZiBwbGF5ZXJJbmRleCA9PSBAdHVyblxyXG4gICAgICAgIGNvbnRpbnVlXHJcbiAgICAgIGlmIG5vdCBwbGF5ZXIucGFzc1xyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgcmV0dXJuIHRydWVcclxuXHJcbiAgcGxheWVyQWZ0ZXI6IChpbmRleCkgLT5cclxuICAgIGxvb3BcclxuICAgICAgaW5kZXggPSAoaW5kZXggKyAxKSAlIEBwbGF5ZXJzLmxlbmd0aFxyXG4gICAgICBpZiBAcGxheWVyc1tpbmRleF0ucGxhY2UgPT0gMFxyXG4gICAgICAgIHJldHVybiBpbmRleFxyXG4gICAgcmV0dXJuIDAgIyBpbXBvc3NpYmxlP1xyXG5cclxuICBhZGRQbGF5ZXI6IChwbGF5ZXIpIC0+XHJcbiAgICBpZiBub3QgcGxheWVyLmFpXHJcbiAgICAgIHBsYXllci5haSA9IGZhbHNlXHJcblxyXG4gICAgQHBsYXllcnMucHVzaCBwbGF5ZXJcclxuICAgIHBsYXllci5pbmRleCA9IEBwbGF5ZXJzLmxlbmd0aCAtIDFcclxuICAgIEBvdXRwdXQocGxheWVyLm5hbWUgKyBcIiBqb2lucyB0aGUgZ2FtZVwiKVxyXG5cclxuICBuYW1lUHJlc2VudDogKG5hbWUpIC0+XHJcbiAgICBmb3IgcGxheWVyIGluIEBwbGF5ZXJzXHJcbiAgICAgIGlmIHBsYXllci5uYW1lID09IG5hbWVcclxuICAgICAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICAgIHJldHVybiBmYWxzZVxyXG5cclxuICBhZGRBSTogLT5cclxuICAgIGxvb3BcclxuICAgICAgY2hhcmFjdGVyID0gcmFuZG9tQ2hhcmFjdGVyKClcclxuICAgICAgaWYgbm90IEBuYW1lUHJlc2VudChjaGFyYWN0ZXIubmFtZSlcclxuICAgICAgICBicmVha1xyXG5cclxuICAgIGFpID1cclxuICAgICAgY2hhcklEOiBjaGFyYWN0ZXIuaWRcclxuICAgICAgbmFtZTogY2hhcmFjdGVyLm5hbWVcclxuICAgICAgaWQ6ICdhaScgKyBTdHJpbmcoQHBsYXllcnMubGVuZ3RoKVxyXG4gICAgICBwYXNzOiBmYWxzZVxyXG4gICAgICBhaTogdHJ1ZVxyXG4gICAgICBtb25leTogVGhpcnRlZW4uU1RBUlRJTkdfTU9ORVlcclxuXHJcbiAgICBAYWRkUGxheWVyKGFpKVxyXG5cclxuICAgIEBnYW1lLmxvZyhcImFkZGVkIEFJIHBsYXllclwiKVxyXG4gICAgcmV0dXJuIE9LXHJcblxyXG4gIHVwZGF0ZVBsYXllckhhbmQ6IChjYXJkcykgLT5cclxuICAgICMgVGhpcyBtYWludGFpbnMgdGhlIHJlb3JnYW5pemVkIG9yZGVyIG9mIHRoZSBwbGF5ZXIncyBoYW5kXHJcbiAgICBAcGxheWVyc1swXS5oYW5kID0gY2FyZHMuc2xpY2UoMClcclxuXHJcbiAgd2lubmVyOiAtPlxyXG4gICAgZm9yIHBsYXllciwgaSBpbiBAcGxheWVyc1xyXG4gICAgICBpZiBwbGF5ZXIucGxhY2UgPT0gMVxyXG4gICAgICAgIHJldHVybiBwbGF5ZXJcclxuICAgIHJldHVybiBudWxsXHJcblxyXG4gIHNvbWVvbmVHYXZlVXA6IC0+XHJcbiAgICBpZiBub3QgQG1vbmV5XHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgaWYgbm90IEBnYW1lLm9wdGlvbnMuZ2l2aW5nVXBcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICBmb3IgcGxheWVyIGluIEBwbGF5ZXJzXHJcbiAgICAgIGlmIHBsYXllci5tb25leSA8PSAwXHJcbiAgICAgICAgcmV0dXJuIHRydWVcclxuICAgIHJldHVybiBmYWxzZVxyXG5cclxuICBnYW1lT3ZlcjogLT5cclxuICAgIG5wID0gQG5leHRQbGFjZSgpXHJcbiAgICBpZiBAbW9uZXlcclxuICAgICAgcmV0dXJuIChucCA+IDMpXHJcbiAgICByZXR1cm4gKG5wID4gMSlcclxuXHJcbiAgaGFzQ2FyZDogKGhhbmQsIHJhd0NhcmQpIC0+XHJcbiAgICBmb3IgcmF3IGluIGhhbmRcclxuICAgICAgaWYgcmF3ID09IHJhd0NhcmRcclxuICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gIGhhc0NhcmRzOiAoaGFuZCwgcmF3Q2FyZHMpIC0+XHJcbiAgICBmb3IgcmF3IGluIHJhd0NhcmRzXHJcbiAgICAgIGlmIG5vdCBAaGFzQ2FyZChoYW5kLCByYXcpXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICByZW1vdmVDYXJkczogKGhhbmQsIHJhd0NhcmRzKSAtPlxyXG4gICAgbmV3SGFuZCA9IFtdXHJcbiAgICBmb3IgY2FyZCBpbiBoYW5kXHJcbiAgICAgIGtlZXBNZSA9IHRydWVcclxuICAgICAgZm9yIHJhdyBpbiByYXdDYXJkc1xyXG4gICAgICAgIGlmIGNhcmQgPT0gcmF3XHJcbiAgICAgICAgICBrZWVwTWUgPSBmYWxzZVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgaWYga2VlcE1lXHJcbiAgICAgICAgbmV3SGFuZC5wdXNoIGNhcmRcclxuICAgIHJldHVybiBuZXdIYW5kXHJcblxyXG4gIGNsYXNzaWZ5OiAocmF3Q2FyZHMpIC0+XHJcbiAgICBjYXJkcyA9IHJhd0NhcmRzLm1hcCAocmF3KSAtPiBuZXcgQ2FyZChyYXcpXHJcbiAgICBjYXJkcyA9IGNhcmRzLnNvcnQgKGEsIGIpIC0+IHJldHVybiBhLnJhdyAtIGIucmF3XHJcbiAgICBoaWdoZXN0UmF3ID0gY2FyZHNbY2FyZHMubGVuZ3RoIC0gMV0ucmF3XHJcblxyXG4gICAgIyBsb29rIGZvciBhIHJ1biBvZiBwYWlyc1xyXG4gICAgaWYgKGNhcmRzLmxlbmd0aCA+PSA2KSBhbmQgKChjYXJkcy5sZW5ndGggJSAyKSA9PSAwKVxyXG4gICAgICBmb3VuZFJvcCA9IHRydWVcclxuICAgICAgZm9yIGNhcmQsIGNhcmRJbmRleCBpbiBjYXJkc1xyXG4gICAgICAgIGlmIGNhcmRJbmRleCA9PSAwXHJcbiAgICAgICAgICBjb250aW51ZVxyXG4gICAgICAgIGlmIGNhcmQudmFsdWUgPT0gMTJcclxuICAgICAgICAgICMgbm8gMnMgaW4gYSBydW5cclxuICAgICAgICAgIGZvdW5kUm9wID0gZmFsc2VcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgaWYgKGNhcmRJbmRleCAlIDIpID09IDFcclxuICAgICAgICAgICMgb2RkIGNhcmQsIG11c3QgbWF0Y2ggbGFzdCBjYXJkIGV4YWN0bHlcclxuICAgICAgICAgIGlmIGNhcmQudmFsdWUgIT0gKGNhcmRzW2NhcmRJbmRleCAtIDFdLnZhbHVlKVxyXG4gICAgICAgICAgICBmb3VuZFJvcCA9IGZhbHNlXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgIyBldmVuIGNhcmQsIG11c3QgaW5jcmVtZW50XHJcbiAgICAgICAgICBpZiBjYXJkLnZhbHVlICE9IChjYXJkc1tjYXJkSW5kZXggLSAxXS52YWx1ZSArIDEpXHJcbiAgICAgICAgICAgIGZvdW5kUm9wID0gZmFsc2VcclxuICAgICAgICAgICAgYnJlYWtcclxuXHJcbiAgICAgIGlmIGZvdW5kUm9wXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdyb3AnICsgTWF0aC5mbG9vcihjYXJkcy5sZW5ndGggLyAyKVxyXG4gICAgICAgICAgaGlnaDogaGlnaGVzdFJhd1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAjIGxvb2sgZm9yIGEgcnVuXHJcbiAgICBpZiBjYXJkcy5sZW5ndGggPj0gM1xyXG4gICAgICBmb3VuZFJ1biA9IHRydWVcclxuICAgICAgZm9yIGNhcmQsIGNhcmRJbmRleCBpbiBjYXJkc1xyXG4gICAgICAgIGlmIGNhcmRJbmRleCA9PSAwXHJcbiAgICAgICAgICBjb250aW51ZVxyXG4gICAgICAgIGlmIGNhcmQudmFsdWUgPT0gMTJcclxuICAgICAgICAgICMgbm8gMnMgaW4gYSBydW5cclxuICAgICAgICAgIGZvdW5kUnVuID0gZmFsc2VcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgaWYgY2FyZC52YWx1ZSAhPSAoY2FyZHNbY2FyZEluZGV4IC0gMV0udmFsdWUgKyAxKVxyXG4gICAgICAgICAgZm91bmRSdW4gPSBmYWxzZVxyXG4gICAgICAgICAgYnJlYWtcclxuXHJcbiAgICAgIGlmIGZvdW5kUnVuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdydW4nICsgY2FyZHMubGVuZ3RoXHJcbiAgICAgICAgICBoaWdoOiBoaWdoZXN0UmF3XHJcbiAgICAgICAgfVxyXG5cclxuICAgICMgbG9vayBmb3IgWCBvZiBhIGtpbmRcclxuICAgIHJlcVZhbHVlID0gY2FyZHNbMF0udmFsdWVcclxuICAgIGZvciBjYXJkIGluIGNhcmRzXHJcbiAgICAgIGlmIGNhcmQudmFsdWUgIT0gcmVxVmFsdWVcclxuICAgICAgICByZXR1cm4gbnVsbFxyXG4gICAgdHlwZSA9ICdraW5kJyArIGNhcmRzLmxlbmd0aFxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdHlwZTogdHlwZVxyXG4gICAgICBoaWdoOiBoaWdoZXN0UmF3XHJcbiAgICB9XHJcblxyXG4gIGhhbmRIYXMzUzogKGhhbmQpIC0+XHJcbiAgICBmb3IgcmF3IGluIGhhbmRcclxuICAgICAgaWYgcmF3ID09IDBcclxuICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gIGhhbmRIYXMyOiAoaGFuZCkgLT5cclxuICAgIGZvciByYXcgaW4gaGFuZFxyXG4gICAgICBpZiByYXcgPj0gNDhcclxuICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gIGhhbmRJc1JldmVyc2libGU6IChoYW5kKSAtPlxyXG4gICAgaWYgaGFuZC5sZW5ndGggPT0gMFxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIGNhcmRzID0gaGFuZC5tYXAgKHJhdykgLT4gbmV3IENhcmQocmF3KVxyXG4gICAgIyBkbyBub3Qgc29ydCFcclxuICAgIGV4cGVjdGluZyA9IGNhcmRzLm1hcCAoY2FyZCkgLT4gY2FyZC52YWx1ZVxyXG4gICAgZXhwZWN0aW5nID0gZXhwZWN0aW5nLnJldmVyc2UoKVxyXG4gICAgZm9yIGNhcmQsIGluZGV4IGluIGNhcmRzXHJcbiAgICAgIGlmIGNhcmQudmFsdWUgIT0gZXhwZWN0aW5nW2luZGV4XVxyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgcmV0dXJuIHRydWVcclxuXHJcbiAgaGFuZElzQkFUSEVTOiAoaGFuZCkgLT5cclxuICAgIGlmIGhhbmQubGVuZ3RoICE9IDZcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICBjYXJkcyA9IGhhbmQubWFwIChyYXcpIC0+IG5ldyBDYXJkKHJhdylcclxuICAgICMgZG8gbm90IHNvcnQhXHJcbiAgICBleHBlY3RpbmcgPSBbNSwgMywgNCwgMSwgMCwgMl1cclxuICAgIGZvciBjYXJkLCBpbmRleCBpbiBjYXJkc1xyXG4gICAgICBpZiBjYXJkLnZhbHVlICE9IGV4cGVjdGluZ1tpbmRleF1cclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgIHJldHVybiB0cnVlXHJcblxyXG4gIGNhcmRJc1JlZDogKGNhcmQpIC0+XHJcbiAgICBpZiBjYXJkLnN1aXQgPT0gU3VpdC5ESUFNT05EU1xyXG4gICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgaWYgY2FyZC5zdWl0ID09IFN1aXQuSEVBUlRTXHJcbiAgICAgIHJldHVybiB0cnVlXHJcbiAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgaGFuZEFsdGVybmF0ZXNSZWRBbmRCbGFjazogKGhhbmQpIC0+XHJcbiAgICBjYXJkcyA9IGhhbmQubWFwIChyYXcpIC0+IG5ldyBDYXJkKHJhdylcclxuICAgIGNhcmRzID0gY2FyZHMuc29ydCAoYSwgYikgLT4gcmV0dXJuIGEucmF3IC0gYi5yYXdcclxuICAgIHdhbnRzUmVkID0gQGNhcmRJc1JlZChjYXJkc1swXSlcclxuICAgIGZvciBjYXJkIGluIGNhcmRzXHJcbiAgICAgIGlmIHdhbnRzUmVkICE9IEBjYXJkSXNSZWQoY2FyZClcclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgd2FudHNSZWQgPSAhd2FudHNSZWRcclxuICAgIHJldHVybiB0cnVlXHJcblxyXG4gIG5leHRQbGFjZTogLT5cclxuICAgIGhpZ2hlc3RQbGFjZSA9IDBcclxuICAgIGZvciBwbGF5ZXIgaW4gQHBsYXllcnNcclxuICAgICAgcGxheWVyLnBsYWNlID89IDBcclxuICAgICAgaWYgaGlnaGVzdFBsYWNlIDwgcGxheWVyLnBsYWNlXHJcbiAgICAgICAgaGlnaGVzdFBsYWNlID0gcGxheWVyLnBsYWNlXHJcbiAgICByZXR1cm4gaGlnaGVzdFBsYWNlICsgMVxyXG5cclxuICBzcGxpdFBsYXlUeXBlOiAocGxheVR5cGUpIC0+XHJcbiAgICBpZiBtYXRjaGVzID0gcGxheVR5cGUubWF0Y2goL14oW14wLTldKykoXFxkKykvKVxyXG4gICAgICByZXR1cm4gW21hdGNoZXNbMV0sIHBhcnNlSW50KG1hdGNoZXNbMl0pXVxyXG4gICAgcmV0dXJuIFtwbGF5VHlwZSwgMV1cclxuXHJcbiAgaGFzUGxheTogKGN1cnJlbnRQbGF5LCBoYW5kKSAtPlxyXG4gICAgIyBxdWljayBjaGVjay4gaWYgeW91IGRvbnQgaGF2ZSBlbm91Z2ggY2FyZHMsIHlvdSBjYW4ndCBoYXZlIGEgcGxheVxyXG4gICAgaWYgKHBsYXlUb0NhcmRDb3VudChjdXJyZW50UGxheSkgPiBoYW5kLmxlbmd0aClcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gICAgaWYgQGdhbWUub3B0aW9ucy5hdXRvcGFzc0luZGV4ID09IDJcclxuICAgICAgIyBsaW1pdGVkLCBhc3N1bWUgdGhlcmUncyBhIHBsYXkgaW4gdGhlcmUgc29tZXdoZXJlLCBpZiB0aGVyZSdzIGVub3VnaCBjYXJkc1xyXG4gICAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICAgIGxlZnRvdmVycyA9IFtdXHJcbiAgICBwbGF5cyA9IHt9XHJcbiAgICBzcGwgPSBAc3BsaXRQbGF5VHlwZShjdXJyZW50UGxheS50eXBlKVxyXG4gICAgc3dpdGNoIHNwbFswXVxyXG4gICAgICB3aGVuICdyb3AnXHJcbiAgICAgICAgbGVmdG92ZXJzID0gQGFpQ2FsY1JvcHMoaGFuZCwgcGxheXMsIHNwbFsxXSlcclxuICAgICAgd2hlbiAncnVuJ1xyXG4gICAgICAgIGxlZnRvdmVycyA9IEBhaUNhbGNSdW5zKGhhbmQsIHBsYXlzLCBmYWxzZSwgc3BsWzFdKVxyXG4gICAgICB3aGVuICdraW5kJ1xyXG4gICAgICAgIGxlZnRvdmVycyA9IEBhbENhbGNLaW5kcyhoYW5kLCBwbGF5cywgdHJ1ZSlcclxuXHJcbiAgICBwbGF5cy5raW5kMSA/PSBbXVxyXG4gICAgZm9yIGxlZnRvdmVyIGluIGxlZnRvdmVyc1xyXG4gICAgICBwbGF5cy5raW5kMS5wdXNoIFtsZWZ0b3Zlcl1cclxuXHJcbiAgICBpZiBwbGF5c1tjdXJyZW50UGxheS50eXBlXT8gYW5kIHBsYXlzW2N1cnJlbnRQbGF5LnR5cGVdLmxlbmd0aCA+IDBcclxuICAgICAgICBmb3IgcGxheSBpbiBwbGF5c1tjdXJyZW50UGxheS50eXBlXVxyXG4gICAgICAgICAgaWYgQGhpZ2hlc3RDYXJkKHBsYXkpID4gY3VycmVudFBsYXkuaGlnaFxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICAgICMgc3BlY2lhbCBjYXNlIGtpbmRzXHJcbiAgICBpZiBzcGxbMF0gPT0gJ2tpbmQnXHJcbiAgICAgICMgY2hlY2sgYmlnZ2VyIGtpbmRzXHJcbiAgICAgIGZvciBiaWdnZXJLaW5kIGluIFtzcGxbMV0uLjRdXHJcbiAgICAgICAgYmlnZ2VyVHlwZSA9IFwia2luZCN7YmlnZ2VyS2luZH1cIlxyXG4gICAgICAgIGlmIHBsYXlzW2JpZ2dlclR5cGVdPyBhbmQgcGxheXNbYmlnZ2VyVHlwZV0ubGVuZ3RoID4gMFxyXG4gICAgICAgICAgICBmb3IgcGxheSBpbiBwbGF5c1tiaWdnZXJUeXBlXVxyXG4gICAgICAgICAgICAgIGlmIEBoaWdoZXN0Q2FyZChwbGF5KSA+IGN1cnJlbnRQbGF5LmhpZ2hcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXHJcblxyXG4gICAgIyBubyBwbGF5cywgcGFzc1xyXG4gICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gIGNhblBhc3M6IChwYXJhbXMpIC0+XHJcbiAgICBpZiBAZ2FtZU92ZXIoKVxyXG4gICAgICByZXR1cm4gJ2dhbWVPdmVyJ1xyXG5cclxuICAgIGN1cnJlbnRQbGF5ZXIgPSBAY3VycmVudFBsYXllcigpXHJcbiAgICBpZiBwYXJhbXMuaWQgIT0gY3VycmVudFBsYXllci5pZFxyXG4gICAgICByZXR1cm4gJ25vdFlvdXJUdXJuJ1xyXG5cclxuICAgIGlmIEBwaWxlLmxlbmd0aCA9PSAwXHJcbiAgICAgIHJldHVybiAnbXVzdFRocm93M1MnXHJcblxyXG4gICAgaWYgQGV2ZXJ5b25lUGFzc2VkKClcclxuICAgICAgcmV0dXJuICd0aHJvd0FueXRoaW5nJ1xyXG5cclxuICAgIHJldHVybiBPS1xyXG5cclxuICBjYW5QbGF5OiAocGFyYW1zLCBpbmNvbWluZ1BsYXksIGhhbmRIYXMzUykgLT5cclxuICAgIGlmIEBnYW1lT3ZlcigpXHJcbiAgICAgIHJldHVybiAnZ2FtZU92ZXInXHJcblxyXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcclxuICAgIGlmIHBhcmFtcy5pZCAhPSBjdXJyZW50UGxheWVyLmlkXHJcbiAgICAgIHJldHVybiAnbm90WW91clR1cm4nXHJcblxyXG4gICAgaWYgaW5jb21pbmdQbGF5ID09IG51bGxcclxuICAgICAgcmV0dXJuICdpbnZhbGlkUGxheSdcclxuXHJcbiAgICBpZiBAcGlsZS5sZW5ndGggPT0gMFxyXG4gICAgICBpZiBub3QgaGFuZEhhczNTXHJcbiAgICAgICAgcmV0dXJuICdtdXN0VGhyb3czUydcclxuXHJcbiAgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxyXG4gICAgaWYgY3VycmVudFBsYXllci5wYXNzXHJcbiAgICAgIGlmIEBnYW1lLm9wdGlvbnMucGFzc0JyZWFrIGFuZCBAY3VycmVudFBsYXkgYW5kIEBjYW5CZUJyb2tlbihAY3VycmVudFBsYXkpXHJcbiAgICAgICAgaWYgQGlzQnJlYWtlclR5cGUoaW5jb21pbmdQbGF5LnR5cGUpXHJcbiAgICAgICAgICByZXR1cm4gT0tcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICByZXR1cm4gJ211c3RCcmVha09yUGFzcydcclxuICAgICAgcmV0dXJuICdtdXN0UGFzcydcclxuXHJcbiAgICBpZiBAY3VycmVudFBsYXkgPT0gbnVsbFxyXG4gICAgICByZXR1cm4gT0tcclxuXHJcbiAgICBpZiBAZXZlcnlvbmVQYXNzZWQoKVxyXG4gICAgICByZXR1cm4gT0tcclxuXHJcbiAgICBpZiBAY2FuQmVCcm9rZW4oQGN1cnJlbnRQbGF5KSBhbmQgQGlzQnJlYWtlclR5cGUoaW5jb21pbmdQbGF5LnR5cGUpXHJcbiAgICAgICMgMiBicmVha2VyIVxyXG4gICAgICByZXR1cm4gT0tcclxuXHJcbiAgICBpZiBpbmNvbWluZ1BsYXkudHlwZSAhPSBAY3VycmVudFBsYXkudHlwZVxyXG4gICAgICByZXR1cm4gJ3dyb25nUGxheSdcclxuXHJcbiAgICBpZiBpbmNvbWluZ1BsYXkuaGlnaCA8IEBjdXJyZW50UGxheS5oaWdoXHJcbiAgICAgIHJldHVybiAndG9vTG93UGxheSdcclxuXHJcbiAgICByZXR1cm4gT0tcclxuXHJcbiAgcGxheTogKHBhcmFtcykgLT5cclxuICAgIGluY29taW5nUGxheSA9IEBjbGFzc2lmeShwYXJhbXMuY2FyZHMpXHJcbiAgICBjb25zb2xlLmxvZyBcImluY29taW5nUGxheVwiLCBpbmNvbWluZ1BsYXlcclxuXHJcbiAgICBjb25zb2xlLmxvZyBcInNvbWVvbmUgY2FsbGluZyBwbGF5XCIsIHBhcmFtc1xyXG4gICAgcmV0ID0gQGNhblBsYXkocGFyYW1zLCBpbmNvbWluZ1BsYXksIEBoYW5kSGFzM1MocGFyYW1zLmNhcmRzKSlcclxuICAgIGlmIHJldCAhPSBPS1xyXG4gICAgICByZXR1cm4gcmV0XHJcblxyXG4gICAgYnJlYWtlclRocm93biA9IGZhbHNlXHJcbiAgICBuZXdUaHJvdyA9IHRydWVcclxuXHJcbiAgICAjIFRPRE86IG1ha2UgcHJldHR5IG5hbWVzIGJhc2VkIG9uIHRoZSBwbGF5LCBhZGQgcGxheSB0byBoZWFkbGluZVxyXG4gICAgdmVyYiA9IFwidGhyb3dzOlwiXHJcbiAgICBpZiBAY3VycmVudFBsYXlcclxuICAgICAgaWYgQGNhbkJlQnJva2VuKEBjdXJyZW50UGxheSkgYW5kIEBpc0JyZWFrZXJUeXBlKGluY29taW5nUGxheS50eXBlKVxyXG4gICAgICAgICMgMiBicmVha2VyIVxyXG4gICAgICAgIEB1bnBhc3NBbGwoKVxyXG4gICAgICAgIHZlcmIgPSBcImJyZWFrcyAyOlwiXHJcbiAgICAgICAgYnJlYWtlclRocm93biA9IHRydWVcclxuICAgICAgICBuZXdUaHJvdyA9IGZhbHNlXHJcbiAgICAgIGVsc2UgaWYgKGluY29taW5nUGxheS50eXBlICE9IEBjdXJyZW50UGxheS50eXBlKSBvciAoaW5jb21pbmdQbGF5LmhpZ2ggPCBAY3VycmVudFBsYXkuaGlnaClcclxuICAgICAgICAjIE5ldyBwbGF5IVxyXG4gICAgICAgIEB1bnBhc3NBbGwoKVxyXG4gICAgICAgIHZlcmIgPSBcInRocm93cyBuZXc6XCJcclxuICAgICAgZWxzZVxyXG4gICAgICAgIG5ld1Rocm93ID0gZmFsc2VcclxuICAgIGVsc2VcclxuICAgICAgdmVyYiA9IFwiYmVnaW5zOlwiXHJcblxyXG4gICAgIyBBY2hpZXZlbWVudHNcclxuICAgIEBhY2guc3RhdGUudHdvc1NlZW4gPz0gMFxyXG4gICAgQGFjaC5zdGF0ZS5wYWlyc1Rocm93biA/PSAwXHJcbiAgICBmb3IgY2FyZCBpbiBwYXJhbXMuY2FyZHNcclxuICAgICAgaWYgY2FyZCA+PSA0OFxyXG4gICAgICAgIEBhY2guc3RhdGUudHdvc1NlZW4gKz0gMVxyXG4gICAgaWYgKEBhY2guc3RhdGUudHdvc1NlZW4gPT0gNCkgYW5kIChAcGxheWVyc1swXS5oYW5kLmxlbmd0aCA9PSAxMylcclxuICAgICAgQGFjaC5zdGF0ZS5mYXNoaW9uYWJseUxhdGUgPSB0cnVlXHJcbiAgICBjb25zb2xlLmxvZyBcIkBhY2guc3RhdGUuZmFzaGlvbmFibHlMYXRlICN7QGFjaC5zdGF0ZS5mYXNoaW9uYWJseUxhdGV9XCJcclxuICAgIGlmIEB0dXJuID09IDBcclxuICAgICAgaWYgQGV2ZXJ5b25lUGFzc2VkKCkgYW5kIG5vdCBuZXdUaHJvd1xyXG4gICAgICAgIEBlYXJuIFwieW91cnNlbGZcIlxyXG4gICAgICBpZiBpbmNvbWluZ1BsYXkudHlwZSA9PSAna2luZDInXHJcbiAgICAgICAgQGFjaC5zdGF0ZS5wYWlyc1Rocm93biArPSAxXHJcbiAgICAgICAgaWYgQGFjaC5zdGF0ZS5wYWlyc1Rocm93biA+PSA1XHJcbiAgICAgICAgICBAZWFybiBcInBhaXJzXCJcclxuICAgICAgaWYgYnJlYWtlclRocm93blxyXG4gICAgICAgIEBlYXJuIFwiYnJlYWtlclwiXHJcbiAgICAgIGlmIEBpc0JyZWFrZXJUeXBlKGluY29taW5nUGxheS50eXBlKSBhbmQgKEBwaWxlLmxlbmd0aCA9PSAwKVxyXG4gICAgICAgIEBlYXJuIFwidHJhZ2VkeVwiXHJcbiAgICAgIGlmIEBpc1J1blR5cGUoaW5jb21pbmdQbGF5LnR5cGUpIGFuZCBAaXNTdWl0ZWQocGFyYW1zLmNhcmRzKVxyXG4gICAgICAgIEBlYXJuIFwic3VpdGVkXCJcclxuICAgICAgaWYgQGN1cnJlbnRQbGF5IGFuZCAoQGN1cnJlbnRQbGF5LnR5cGUgPT0gJ2tpbmQxJykgYW5kIChAY3VycmVudFBsYXkuaGlnaCA8PSAzKSBhbmQgKGluY29taW5nUGxheS50eXBlID09ICdraW5kMScpIGFuZCAoaW5jb21pbmdQbGF5LmhpZ2ggPj0gNDgpXHJcbiAgICAgICAgQGVhcm4gXCJrZWVwaXRsb3dcIlxyXG4gICAgICBpZiBAaXNSdW5UeXBlKGluY29taW5nUGxheS50eXBlKSBhbmQgKGluY29taW5nUGxheS5oaWdoID09IDQ3KSAjIEFjZSBvZiBIZWFydHNcclxuICAgICAgICBAZWFybiBcImluZG9taXRhYmxlXCJcclxuICAgICAgaWYgQGlzQmlnUnVuKGluY29taW5nUGxheSwgNylcclxuICAgICAgICBjb25zb2xlLmxvZyBcInRocmV3UnVuNzogdHJ1ZVwiXHJcbiAgICAgICAgQGFjaC5zdGF0ZS50aHJld1J1bjcgPSB0cnVlXHJcbiAgICAgIGlmIGluY29taW5nUGxheS50eXBlID09ICdraW5kMSdcclxuICAgICAgICBAYWNoLnN0YXRlLnRocmV3U2luZ2xlID0gdHJ1ZVxyXG4gICAgICBpZiBpbmNvbWluZ1BsYXkudHlwZSA9PSAna2luZDInXHJcbiAgICAgICAgQGFjaC5zdGF0ZS50aHJld1BhaXIgPSB0cnVlXHJcbiAgICAgIGlmIGluY29taW5nUGxheS50eXBlID09ICdraW5kMydcclxuICAgICAgICBAYWNoLnN0YXRlLnRocmV3VHJpcHMgPSB0cnVlXHJcbiAgICAgIGlmIGluY29taW5nUGxheS50eXBlLm1hdGNoKC9ecnVuLylcclxuICAgICAgICBAYWNoLnN0YXRlLnRocmV3UnVuID0gdHJ1ZVxyXG4gICAgICBpZiBAYWNoLnN0YXRlLnRocmV3U2luZ2xlIGFuZCBAYWNoLnN0YXRlLnRocmV3UGFpciBhbmQgQGFjaC5zdGF0ZS50aHJld1RyaXBzIGFuZCBAYWNoLnN0YXRlLnRocmV3UnVuXHJcbiAgICAgICAgQGVhcm4gXCJzYW1wbGVyXCJcclxuICAgICAgaWYgKHBhcmFtcy5jYXJkcy5sZW5ndGggPj0gNSkgYW5kIEBoYW5kQWx0ZXJuYXRlc1JlZEFuZEJsYWNrKHBhcmFtcy5jYXJkcylcclxuICAgICAgICBAZWFybiBcInNvbGl0YWlyZVwiXHJcbiAgICAgIGlmIChpbmNvbWluZ1BsYXkudHlwZSA9PSAna2luZDInKSBhbmQgKGluY29taW5nUGxheS5oaWdoID49IDQ4KVxyXG4gICAgICAgIEBlYXJuIFwiYmFsbGV0XCJcclxuICAgICAgaWYgKGluY29taW5nUGxheS50eXBlID09ICdraW5kMycpIGFuZCAoaW5jb21pbmdQbGF5LmhpZ2ggPj0gMTIpIGFuZCAoaW5jb21pbmdQbGF5LmhpZ2ggPD0gMTUpXHJcbiAgICAgICAgQGVhcm4gXCJiZWFzdFwiXHJcbiAgICAgIGlmIEBoYW5kSXNCQVRIRVMocGFyYW1zLmNhcmRzKVxyXG4gICAgICAgIEBlYXJuIFwicGFnZXJjb2RlXCJcclxuICAgICAgaWYgKGluY29taW5nUGxheS50eXBlLm1hdGNoKC9yb3AvKSkgYW5kIChAaGFuZElzUmV2ZXJzaWJsZShwYXJhbXMuY2FyZHMpKVxyXG4gICAgICAgIEBlYXJuIFwicGFsaW5kcm9tZVwiXHJcblxyXG4gICAgQGN1cnJlbnRQbGF5ID0gaW5jb21pbmdQbGF5XHJcblxyXG4gICAgQHRocm93SUQgKz0gMVxyXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcclxuICAgIGN1cnJlbnRQbGF5ZXIuaGFuZCA9IEByZW1vdmVDYXJkcyhjdXJyZW50UGxheWVyLmhhbmQsIHBhcmFtcy5jYXJkcylcclxuXHJcbiAgICBAb3V0cHV0KFwiI3tjdXJyZW50UGxheWVyLm5hbWV9ICN7dmVyYn0gI3twbGF5VG9TdHJpbmcoaW5jb21pbmdQbGF5KX1cIilcclxuXHJcbiAgICBpZiBjdXJyZW50UGxheWVyLmhhbmQubGVuZ3RoID09IDBcclxuICAgICAgIyBHYW1lIG92ZXIhIGRvIGdhbWVvdmVyIHRoaW5ncy5cclxuXHJcbiAgICAgIGN1cnJlbnRQbGF5ZXIucGxhY2UgPSBAbmV4dFBsYWNlKClcclxuXHJcbiAgICAgIGlmIEBtb25leVxyXG4gICAgICAgIHBsYWNlU3RyaW5nID0gXCI0dGhcIlxyXG4gICAgICAgIGlmIGN1cnJlbnRQbGF5ZXIucGxhY2UgPT0gMVxyXG4gICAgICAgICAgcGxhY2VTdHJpbmcgPSBcIjFzdFwiXHJcbiAgICAgICAgZWxzZSBpZiBjdXJyZW50UGxheWVyLnBsYWNlID09IDJcclxuICAgICAgICAgIHBsYWNlU3RyaW5nID0gXCIybmRcIlxyXG4gICAgICAgIGVsc2UgaWYgY3VycmVudFBsYXllci5wbGFjZSA9PSAzXHJcbiAgICAgICAgICBwbGFjZVN0cmluZyA9IFwiM3JkXCJcclxuICAgICAgICBAb3V0cHV0KFwiI3tjdXJyZW50UGxheWVyLm5hbWV9IHRha2VzICN7cGxhY2VTdHJpbmd9IHBsYWNlXCIpXHJcblxyXG4gICAgICAgIGlmIGN1cnJlbnRQbGF5ZXIucGxhY2UgPT0gM1xyXG4gICAgICAgICAgQHBheW91dCgpXHJcblxyXG4gICAgICAgICAgaWYgQGdhbWUub3B0aW9ucy5naXZpbmdVcFxyXG4gICAgICAgICAgICBmb3IgcGxheWVyIGluIEBwbGF5ZXJzXHJcbiAgICAgICAgICAgICAgaWYgcGxheWVyLm1vbmV5IDw9IDBcclxuICAgICAgICAgICAgICAgIEBvdXRwdXQoXCIje3BsYXllci5uYW1lfSBnaXZlcyB1cFwiKVxyXG4gICAgICAgICAgICAgICAgaWYgQHBsYXllcnNbMF0ubW9uZXkgPj0gKFRoaXJ0ZWVuLlNUQVJUSU5HX01PTkVZICsgMTUpXHJcbiAgICAgICAgICAgICAgICAgIEBlYXJuIFwiYmxpbmdcIlxyXG5cclxuICAgICAgZWxzZVxyXG4gICAgICAgIEBvdXRwdXQoXCIje2N1cnJlbnRQbGF5ZXIubmFtZX0gd2lucyFcIilcclxuXHJcbiAgICAgIGlmIGN1cnJlbnRQbGF5ZXIucGxhY2UgPT0gMVxyXG4gICAgICAgIGlmIEB0dXJuID09IDBcclxuICAgICAgICAgIEBzdHJlYWsgKz0gMVxyXG4gICAgICAgICAgQGxhc3RTdHJlYWsgPSBAc3RyZWFrXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgQGxhc3RTdHJlYWsgPSBAc3RyZWFrXHJcbiAgICAgICAgICBAc3RyZWFrID0gMFxyXG5cclxuICAgICAgQGFjaC5zdGF0ZS5iZXN0U3RyZWFrID89IDBcclxuICAgICAgaWYgQGFjaC5zdGF0ZS5iZXN0U3RyZWFrIDwgQGxhc3RTdHJlYWtcclxuICAgICAgICBAYWNoLnN0YXRlLmJlc3RTdHJlYWsgPSBAbGFzdFN0cmVha1xyXG5cclxuICAgICAgIyBBY2hpZXZlbWVudHNcclxuICAgICAgaWYgQGFjaC5zdGF0ZS5iZXN0U3RyZWFrID49IDVcclxuICAgICAgICBAZWFybiBcInRyeWhhcmRcIlxyXG4gICAgICBAYWNoLnN0YXRlLnRvdGFsR2FtZXMgKz0gMVxyXG4gICAgICBpZiBAYWNoLnN0YXRlLnRvdGFsR2FtZXMgPj0gNTBcclxuICAgICAgICBAZWFybiBcInZldGVyYW5cIlxyXG4gICAgICBpZiBAYWNoLnN0YXRlLnRvdGFsR2FtZXMgPj0gMTAwMFxyXG4gICAgICAgIEBlYXJuIFwidmV0ZXJhbjJcIlxyXG4gICAgICBpZiBjdXJyZW50UGxheWVyLnBsYWNlID09IDFcclxuICAgICAgICBpZiBAdHVybiA9PSAwXHJcbiAgICAgICAgICAjIHBsYXllciB3b25cclxuICAgICAgICAgIEBhY2guc3RhdGUudG90YWxXaW5zID89IDBcclxuICAgICAgICAgIEBhY2guc3RhdGUudG90YWxXaW5zICs9IDFcclxuICAgICAgICAgIGlmIEBhY2guc3RhdGUudG90YWxXaW5zID49IDUwXHJcbiAgICAgICAgICAgIEBlYXJuIFwic2tpbGxlZFwiXHJcbiAgICAgICAgICBpZiAoQHBsYXllcnNbMV0uaGFuZC5sZW5ndGggPj0gMTApIGFuZCAoQHBsYXllcnNbMl0uaGFuZC5sZW5ndGggPj0gMTApIGFuZCAoQHBsYXllcnNbM10uaGFuZC5sZW5ndGggPj0gMTApXHJcbiAgICAgICAgICAgIEBlYXJuIFwicmVrdFwiXHJcbiAgICAgICAgICBpZiBAYWNoLnN0YXRlLmZhc2hpb25hYmx5TGF0ZVxyXG4gICAgICAgICAgICBAZWFybiBcImxhdGVcIlxyXG4gICAgICAgICAgaWYgQGFjaC5zdGF0ZS5oYW5kaWNhcHBlZFxyXG4gICAgICAgICAgICBAZWFybiBcImhhbmRpY2FwcGVkXCJcclxuICAgICAgICAgIGlmIChwYXJhbXMuY2FyZHMubGVuZ3RoID09IDEpIGFuZCAocGFyYW1zLmNhcmRzWzBdIDwgNClcclxuICAgICAgICAgICAgIyB0aHJldyBhIHNpbmdsZSAzIHRvIGVuZCB0aGUgcm91bmRcclxuICAgICAgICAgICAgQGVhcm4gXCJrZWVwdGhlY2hhbmdlXCJcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAjIHBsYXllciBsb3N0XHJcbiAgICAgICAgICBpZiBAYWNoLnN0YXRlLnRocmV3UnVuN1xyXG4gICAgICAgICAgICBAZWFybiBcInRvbnlcIlxyXG4gICAgICAgICAgaWYgKEBwbGF5ZXJzWzBdLmhhbmQubGVuZ3RoID49IDEwKVxyXG4gICAgICAgICAgICBAYWNoLnN0YXRlLnNwZWN0YWN1bGFyTG9zc2VzICs9IDFcclxuICAgICAgICAgICAgaWYgQGFjaC5zdGF0ZS5zcGVjdGFjdWxhckxvc3NlcyA+PSAxMFxyXG4gICAgICAgICAgICAgIEBlYXJuIFwiY29uc29sYXRpb25wcml6ZVwiXHJcblxyXG4gICAgYWNoaWV2ZW1lbnRDb3VudCA9IDBcclxuICAgIGZvciBhY2hpZXZlbWVudCBpbiBhY2hpZXZlbWVudHNMaXN0XHJcbiAgICAgIGlmIEBhY2guZWFybmVkW2FjaGlldmVtZW50LmlkXVxyXG4gICAgICAgIGFjaGlldmVtZW50Q291bnQgKz0gMVxyXG4gICAgaWYgYWNoaWV2ZW1lbnRDb3VudCA+PSAxM1xyXG4gICAgICBAZWFybiBcInRoaXJ0ZWVuXCJcclxuICAgIGlmIGFjaGlldmVtZW50Q291bnQgPj0gMjZcclxuICAgICAgQGVhcm4gXCJ0aGlydGVlbjJcIlxyXG5cclxuICAgIEBwaWxlID0gcGFyYW1zLmNhcmRzLnNsaWNlKDApXHJcbiAgICBAcGlsZVdobyA9IEB0dXJuXHJcblxyXG4gICAgQHR1cm4gPSBAcGxheWVyQWZ0ZXIoQHR1cm4pXHJcbiAgICByZXR1cm4gT0tcclxuXHJcbiAgdW5wYXNzQWxsOiAtPlxyXG4gICAgZm9yIHBsYXllciBpbiBAcGxheWVyc1xyXG4gICAgICBwbGF5ZXIucGFzcyA9IGZhbHNlXHJcbiAgICByZXR1cm5cclxuXHJcbiAgcGFzczogKHBhcmFtcykgLT5cclxuICAgIHJldCA9IEBjYW5QYXNzKHBhcmFtcylcclxuICAgIGlmIHJldCAhPSBPS1xyXG4gICAgICByZXR1cm4gcmV0XHJcblxyXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcclxuICAgIGlmIG5vdCBjdXJyZW50UGxheWVyLmFpIGFuZCBAY3VycmVudFBsYXkgYW5kIG5vdCBAaGFzUGxheShAY3VycmVudFBsYXksIGN1cnJlbnRQbGF5ZXIuaGFuZClcclxuICAgICAgQG91dHB1dChcIiN7Y3VycmVudFBsYXllci5uYW1lfSBhdXRvLXBhc3NlcyAobm8gcGxheXMpXCIpXHJcbiAgICBlbHNlIGlmIGN1cnJlbnRQbGF5ZXIucGFzc1xyXG4gICAgICBAb3V0cHV0KFwiI3tjdXJyZW50UGxheWVyLm5hbWV9IGF1dG8tcGFzc2VzXCIpXHJcbiAgICBlbHNlXHJcbiAgICAgIEBvdXRwdXQoXCIje2N1cnJlbnRQbGF5ZXIubmFtZX0gcGFzc2VzXCIpXHJcbiAgICBjdXJyZW50UGxheWVyLnBhc3MgPSB0cnVlXHJcbiAgICBAdHVybiA9IEBwbGF5ZXJBZnRlcihAdHVybilcclxuICAgIEBnYW1lLnBpbGUucG9rZSgpXHJcblxyXG4gICAgaWYgKEB0dXJuID09IDApIGFuZCBAZXZlcnlvbmVQYXNzZWQoKSBhbmQgQGhhbmRIYXMzUyhAcGlsZSlcclxuICAgICAgQGVhcm4gXCJkcmFncmFjaW5nXCJcclxuICAgIHJldHVybiBPS1xyXG5cclxuICBhaVBsYXk6IChjdXJyZW50UGxheWVyLCBjYXJkcykgLT5cclxuICAgIHJldHVybiBAcGxheSh7J2lkJzpjdXJyZW50UGxheWVyLmlkLCAnY2FyZHMnOmNhcmRzfSlcclxuXHJcbiAgYWlQYXNzOiAoY3VycmVudFBsYXllcikgLT5cclxuICAgIHJldHVybiBAcGFzcyh7J2lkJzpjdXJyZW50UGxheWVyLmlkfSlcclxuXHJcbiAgZWFybjogKGlkKSAtPlxyXG4gICAgaWYgQGFjaC5lYXJuZWRbaWRdXHJcbiAgICAgIHJldHVyblxyXG4gICAgYWNoaWV2ZW1lbnQgPSBhY2hpZXZlbWVudHNNYXBbaWRdXHJcbiAgICBpZiBub3QgYWNoaWV2ZW1lbnQ/XHJcbiAgICAgIHJldHVyblxyXG5cclxuICAgIEBhY2guZWFybmVkW2lkXSA9IHRydWVcclxuICAgIEBvdXRwdXQoXCJFYXJuZWQ6ICN7YWNoaWV2ZW1lbnQudGl0bGV9XCIpXHJcbiAgICBAZmFuZmFyZXMucHVzaCBhY2hpZXZlbWVudC50aXRsZVxyXG5cclxuXHJcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAjIEFJXHJcblxyXG4gICMgR2VuZXJpYyBsb2dnaW5nIGZ1bmN0aW9uOyBwcmVwZW5kcyBjdXJyZW50IEFJIHBsYXllcidzIGd1dHMgYmVmb3JlIHByaW50aW5nIHRleHRcclxuICBhaUxvZzogKHRleHQpIC0+XHJcbiAgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxyXG4gICAgaWYgbm90IGN1cnJlbnRQbGF5ZXIuYWlcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gICAgY2hhcmFjdGVyID0gYWlDaGFyYWN0ZXJzW2N1cnJlbnRQbGF5ZXIuY2hhcklEXVxyXG4gICAgQGdhbWUubG9nKCdBSVsnK2N1cnJlbnRQbGF5ZXIubmFtZSsnICcrY2hhcmFjdGVyLmJyYWluKyddOiBoYW5kOicrY2FyZHNUb1N0cmluZyhjdXJyZW50UGxheWVyLmhhbmQpKycgcGlsZTonK2NhcmRzVG9TdHJpbmcoQHBpbGUpKycgJyt0ZXh0KVxyXG5cclxuICAjIERldGVjdHMgaWYgdGhlIGN1cnJlbnQgcGxheWVyIGlzIEFJIGR1cmluZyBhIEJJRCBvciBUUklDSyBwaGFzZSBhbmQgYWN0cyBhY2NvcmRpbmcgdG8gdGhlaXIgJ2JyYWluJ1xyXG4gIGFpVGljazogLT5cclxuICAgIGlmIEBnYW1lT3ZlcigpXHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG5cclxuICAgIGlmIEBlbnRpcmVUYWJsZVBhc3NlZCgpXHJcbiAgICAgIEB0dXJuID0gQHBsYXllckFmdGVyKEBwaWxlV2hvKVxyXG4gICAgICBAdW5wYXNzQWxsKClcclxuICAgICAgQGN1cnJlbnRQbGF5ID0gbnVsbFxyXG4gICAgICBAb3V0cHV0KCdXaG9sZSB0YWJsZSBwYXNzZXMsIGNvbnRyb2wgdG8gJyArIEBwbGF5ZXJzW0B0dXJuXS5uYW1lKVxyXG5cclxuICAgIGN1cnJlbnRQbGF5ZXIgPSBAY3VycmVudFBsYXllcigpXHJcbiAgICBpZiBub3QgY3VycmVudFBsYXllci5haVxyXG4gICAgICBpZiBAZ2FtZS5vcHRpb25zLmF1dG9wYXNzSW5kZXggIT0gMCAjIE5vdCBkaXNhYmxlZFxyXG4gICAgICAgIGlmIG5vdCBAY2FuVGhyb3dBbnl0aGluZygpXHJcbiAgICAgICAgICBpZiBAY3VycmVudFBsYXkgYW5kIChAY3VycmVudFBsYXkudHlwZSA9PSAna2luZDEnKSBhbmQgKEBjdXJyZW50UGxheS5oaWdoID49IDQ4KSBhbmQgQGhhc0JyZWFrZXIoY3VycmVudFBsYXllci5oYW5kKVxyXG4gICAgICAgICAgICAjIGRvIG5vdGhpbmcsIHBsYXllciBjYW4gZHJvcCBhIGJyZWFrZXJcclxuICAgICAgICAgIGVsc2UgaWYgQGN1cnJlbnRQbGF5IGFuZCBub3QgQGhhc1BsYXkoQGN1cnJlbnRQbGF5LCBjdXJyZW50UGxheWVyLmhhbmQpXHJcbiAgICAgICAgICAgIEBhaUxvZyhcImF1dG9wYXNzaW5nIGZvciBwbGF5ZXIsIG5vIHBsYXlzXCIpXHJcbiAgICAgICAgICAgIEBhaVBhc3MoY3VycmVudFBsYXllcilcclxuICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICAgIGVsc2UgaWYgY3VycmVudFBsYXllci5wYXNzXHJcbiAgICAgICAgICAgIEBhaUxvZyhcImF1dG9wYXNzaW5nIGZvciBwbGF5ZXJcIilcclxuICAgICAgICAgICAgQGFpUGFzcyhjdXJyZW50UGxheWVyKVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgICBjaGFyYWN0ZXIgPSBhaUNoYXJhY3RlcnNbY3VycmVudFBsYXllci5jaGFySURdXHJcbiAgICByZXQgPSBAYnJhaW5zW2NoYXJhY3Rlci5icmFpbl0ucGxheS5hcHBseSh0aGlzLCBbY3VycmVudFBsYXllciwgQGN1cnJlbnRQbGF5LCBAZXZlcnlvbmVQYXNzZWQoKV0pXHJcbiAgICBpZiByZXQgPT0gT0tcclxuICAgICAgcmV0dXJuIHRydWVcclxuICAgIHJldHVybiBmYWxzZVxyXG5cclxuICBhbENhbGNLaW5kczogKGhhbmQsIHBsYXlzLCBtYXRjaDJzID0gZmFsc2UpIC0+XHJcbiAgICBjYXJkcyA9IGhhbmQubWFwIChyYXcpIC0+IG5ldyBDYXJkKHJhdylcclxuICAgIGNhcmRzID0gY2FyZHMuc29ydCAoYSwgYikgLT4gcmV0dXJuIGEucmF3IC0gYi5yYXdcclxuICAgIHZhbHVlQXJyYXlzID0gW11cclxuICAgIGZvciBpIGluIFswLi4uMTNdXHJcbiAgICAgIHZhbHVlQXJyYXlzLnB1c2ggW11cclxuICAgIGZvciBjYXJkIGluIGNhcmRzXHJcbiAgICAgIHZhbHVlQXJyYXlzW2NhcmQudmFsdWVdLnB1c2goY2FyZClcclxuXHJcbiAgICBoYW5kID0gW11cclxuICAgIGZvciB2YWx1ZUFycmF5LCB2YWx1ZSBpbiB2YWx1ZUFycmF5c1xyXG4gICAgICBpZiAodmFsdWVBcnJheS5sZW5ndGggPiAxKSBhbmQgKG1hdGNoMnMgb3IgKHZhbHVlIDwgMTIpKVxyXG4gICAgICAgIGtleSA9IFwia2luZCN7dmFsdWVBcnJheS5sZW5ndGh9XCJcclxuICAgICAgICBwbGF5c1trZXldID89IFtdXHJcbiAgICAgICAgcGxheXNba2V5XS5wdXNoIHZhbHVlQXJyYXkubWFwICh2KSAtPiB2LnJhd1xyXG4gICAgICBlbHNlXHJcbiAgICAgICAgZm9yIHYgaW4gdmFsdWVBcnJheVxyXG4gICAgICAgICAgaGFuZC5wdXNoIHYucmF3XHJcblxyXG4gICAgcmV0dXJuIGhhbmRcclxuXHJcbiAgYWlGaW5kUnVuczogKGhhbmQsIGVhY2hTaXplLCBzaXplLCBwcmVmZXJTdHJvbmdSdW5zID0gZmFsc2UpIC0+XHJcbiAgICBydW5zID0gW11cclxuXHJcbiAgICBjYXJkcyA9IGhhbmQubWFwIChyYXcpIC0+IG5ldyBDYXJkKHJhdylcclxuICAgIGNhcmRzID0gY2FyZHMuc29ydCAoYSwgYikgLT4gcmV0dXJuIGEucmF3IC0gYi5yYXdcclxuICAgIHZhbHVlQXJyYXlzID0gW11cclxuICAgIGZvciBpIGluIFswLi4uMTNdXHJcbiAgICAgIHZhbHVlQXJyYXlzLnB1c2ggW11cclxuICAgIGZvciBjYXJkIGluIGNhcmRzXHJcbiAgICAgIHZhbHVlQXJyYXlzW2NhcmQudmFsdWVdLnB1c2goY2FyZClcclxuXHJcbiAgICBpZiBwcmVmZXJTdHJvbmdSdW5zXHJcbiAgICAgIGZpcnN0U3RhcnRpbmdWYWx1ZSA9IDEyIC0gc2l6ZVxyXG4gICAgICBsYXN0U3RhcnRpbmdWYWx1ZSA9IDBcclxuICAgICAgYnlBbW91bnQgPSAtMVxyXG4gICAgZWxzZVxyXG4gICAgICBmaXJzdFN0YXJ0aW5nVmFsdWUgPSAwXHJcbiAgICAgIGxhc3RTdGFydGluZ1ZhbHVlID0gMTIgLSBzaXplXHJcbiAgICAgIGJ5QW1vdW50ID0gMVxyXG4gICAgZm9yIHN0YXJ0aW5nVmFsdWUgaW4gW2ZpcnN0U3RhcnRpbmdWYWx1ZS4ubGFzdFN0YXJ0aW5nVmFsdWVdIGJ5IGJ5QW1vdW50XHJcbiAgICAgIHJ1bkZvdW5kID0gdHJ1ZVxyXG4gICAgICBmb3Igb2Zmc2V0IGluIFswLi4uc2l6ZV1cclxuICAgICAgICBpZiB2YWx1ZUFycmF5c1tzdGFydGluZ1ZhbHVlK29mZnNldF0ubGVuZ3RoIDwgZWFjaFNpemVcclxuICAgICAgICAgIHJ1bkZvdW5kID0gZmFsc2VcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgIGlmIHJ1bkZvdW5kXHJcbiAgICAgICAgcnVuID0gW11cclxuICAgICAgICBmb3Igb2Zmc2V0IGluIFswLi4uc2l6ZV1cclxuICAgICAgICAgIGZvciBlYWNoIGluIFswLi4uZWFjaFNpemVdXHJcbiAgICAgICAgICAgIHJ1bi5wdXNoKHZhbHVlQXJyYXlzW3N0YXJ0aW5nVmFsdWUrb2Zmc2V0XS5wb3AoKS5yYXcpXHJcbiAgICAgICAgcnVucy5wdXNoIHJ1blxyXG5cclxuICAgIGxlZnRvdmVycyA9IFtdXHJcbiAgICBmb3IgdmFsdWVBcnJheSBpbiB2YWx1ZUFycmF5c1xyXG4gICAgICBmb3IgY2FyZCBpbiB2YWx1ZUFycmF5XHJcbiAgICAgICAgbGVmdG92ZXJzLnB1c2ggY2FyZC5yYXdcclxuXHJcbiAgICByZXR1cm4gW3J1bnMsIGxlZnRvdmVyc11cclxuXHJcbiAgYWlDYWxjUnVuczogKGhhbmQsIHBsYXlzLCBzbWFsbFJ1bnMsIHNpbmdsZVNpemUgPSBudWxsKSAtPlxyXG4gICAgaWYgc2luZ2xlU2l6ZSAhPSBudWxsXHJcbiAgICAgIHByZWZlclN0cm9uZ1J1bnMgPSB0cnVlXHJcbiAgICAgIHN0YXJ0U2l6ZSA9IHNpbmdsZVNpemVcclxuICAgICAgZW5kU2l6ZSA9IHNpbmdsZVNpemVcclxuICAgICAgYnlBbW91bnQgPSAxXHJcbiAgICBlbHNlXHJcbiAgICAgIHByZWZlclN0cm9uZ1J1bnMgPSBmYWxzZVxyXG4gICAgICBpZiBzbWFsbFJ1bnNcclxuICAgICAgICBzdGFydFNpemUgPSAzXHJcbiAgICAgICAgZW5kU2l6ZSA9IDEyXHJcbiAgICAgICAgYnlBbW91bnQgPSAxXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBzdGFydFNpemUgPSAxMlxyXG4gICAgICAgIGVuZFNpemUgPSAzXHJcbiAgICAgICAgYnlBbW91bnQgPSAtMVxyXG4gICAgZm9yIHJ1blNpemUgaW4gW3N0YXJ0U2l6ZS4uZW5kU2l6ZV0gYnkgYnlBbW91bnRcclxuICAgICAgW3J1bnMsIGxlZnRvdmVyc10gPSBAYWlGaW5kUnVucyhoYW5kLCAxLCBydW5TaXplLCBwcmVmZXJTdHJvbmdSdW5zKVxyXG4gICAgICBpZiBydW5zLmxlbmd0aCA+IDBcclxuICAgICAgICBrZXkgPSBcInJ1biN7cnVuU2l6ZX1cIlxyXG4gICAgICAgIHBsYXlzW2tleV0gPSBydW5zXHJcbiAgICAgIGhhbmQgPSBsZWZ0b3ZlcnNcclxuXHJcbiAgICByZXR1cm4gaGFuZFxyXG5cclxuICBhaUNhbGNSb3BzOiAoaGFuZCwgcGxheXMsIHNpbmdsZVNpemUgPSBudWxsKSAtPlxyXG4gICAgaWYgc2luZ2xlU2l6ZSAhPSBudWxsXHJcbiAgICAgIHByZWZlclN0cm9uZ1J1bnMgPSB0cnVlXHJcbiAgICAgIHN0YXJ0U2l6ZSA9IHNpbmdsZVNpemVcclxuICAgICAgZW5kU2l6ZSA9IHNpbmdsZVNpemVcclxuICAgIGVsc2VcclxuICAgICAgcHJlZmVyU3Ryb25nUnVucyA9IGZhbHNlXHJcbiAgICAgIHN0YXJ0U2l6ZSA9IDNcclxuICAgICAgZW5kU2l6ZSA9IDZcclxuICAgIGZvciBydW5TaXplIGluIFtzdGFydFNpemUuLmVuZFNpemVdXHJcbiAgICAgIFtyb3BzLCBsZWZ0b3ZlcnNdID0gQGFpRmluZFJ1bnMoaGFuZCwgMiwgcnVuU2l6ZSwgcHJlZmVyU3Ryb25nUnVucylcclxuICAgICAgaWYgcm9wcy5sZW5ndGggPiAwXHJcbiAgICAgICAga2V5ID0gXCJyb3Aje3J1blNpemV9XCJcclxuICAgICAgICBwbGF5c1trZXldID0gcm9wc1xyXG4gICAgICBoYW5kID0gbGVmdG92ZXJzXHJcblxyXG4gICAgcmV0dXJuIGhhbmRcclxuXHJcbiAgYWlDYWxjUGxheXM6IChoYW5kLCBzdHJhdGVneSA9IHt9KSAtPlxyXG4gICAgcGxheXMgPSB7fVxyXG5cclxuICAgICMgV2UgYWx3YXlzIHdhbnQgdG8gdXNlIHJvcHMgaWYgd2UgaGF2ZSBvbmVcclxuICAgIGlmIHN0cmF0ZWd5LnNlZXNSb3BzXHJcbiAgICAgIGhhbmQgPSBAYWlDYWxjUm9wcyhoYW5kLCBwbGF5cylcclxuXHJcbiAgICBpZiBzdHJhdGVneS5wcmVmZXJzUnVuc1xyXG4gICAgICBoYW5kID0gQGFpQ2FsY1J1bnMoaGFuZCwgcGxheXMsIHN0cmF0ZWd5LnNtYWxsUnVucylcclxuICAgICAgaGFuZCA9IEBhbENhbGNLaW5kcyhoYW5kLCBwbGF5cywgc3RyYXRlZ3kubWF0Y2gycylcclxuICAgIGVsc2VcclxuICAgICAgaGFuZCA9IEBhbENhbGNLaW5kcyhoYW5kLCBwbGF5cywgc3RyYXRlZ3kubWF0Y2gycylcclxuICAgICAgaGFuZCA9IEBhaUNhbGNSdW5zKGhhbmQsIHBsYXlzLCBzdHJhdGVneS5zbWFsbFJ1bnMpXHJcblxyXG4gICAga2luZDEgPSBoYW5kLm1hcCAodikgLT4gW3ZdXHJcbiAgICBpZiBraW5kMS5sZW5ndGggPiAwXHJcbiAgICAgIHBsYXlzLmtpbmQxID0ga2luZDFcclxuICAgIHJldHVybiBwbGF5c1xyXG5cclxuICBudW1iZXJPZlNpbmdsZXM6IChwbGF5cykgLT5cclxuICAgIGlmIG5vdCBwbGF5cy5raW5kMT9cclxuICAgICAgcmV0dXJuIDBcclxuICAgIG5vblR3b1NpbmdsZXMgPSAwXHJcbiAgICBmb3IgcmF3IGluIHBsYXlzLmtpbmQxXHJcbiAgICAgIGlmIHJhdyA8IDQ4XHJcbiAgICAgICAgbm9uVHdvU2luZ2xlcyArPSAxXHJcbiAgICByZXR1cm4gbm9uVHdvU2luZ2xlc1xyXG5cclxuICBicmVha2VyUGxheXM6IChoYW5kKSAtPlxyXG4gICAgcmV0dXJuIEBhaUNhbGNQbGF5cyhoYW5kLCB7IHNlZXNSb3BzOiB0cnVlLCBwcmVmZXJzUnVuczogZmFsc2UgfSlcclxuXHJcbiAgaXNCcmVha2VyVHlwZTogKHBsYXlUeXBlKSAtPlxyXG4gICAgaWYgcGxheVR5cGUubWF0Y2goL15yb3AvKSBvciBwbGF5VHlwZSA9PSAna2luZDQnXHJcbiAgICAgIHJldHVybiB0cnVlXHJcbiAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgY2FuQmVCcm9rZW46IChwbGF5KSAtPlxyXG4gICAgaWYgcGxheS50eXBlICE9ICdraW5kMSdcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICBjYXJkID0gbmV3IENhcmQocGxheS5oaWdoKVxyXG4gICAgcmV0dXJuIChjYXJkLnZhbHVlID09IDEyKVxyXG5cclxuICBoYXNCcmVha2VyOiAoaGFuZCkgLT5cclxuICAgIHBsYXlzID0gQGJyZWFrZXJQbGF5cyhoYW5kKVxyXG4gICAgZm9yIHBsYXlUeXBlLCBwbGF5bGlzdCBvZiBwbGF5c1xyXG4gICAgICBpZiBAaXNCcmVha2VyVHlwZShwbGF5VHlwZSlcclxuICAgICAgICBpZiBwbGF5bGlzdC5sZW5ndGggPiAwXHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gIGlzUnVuVHlwZTogKHBsYXlUeXBlKSAtPlxyXG4gICAgaWYgcGxheVR5cGUubWF0Y2goL15ydW4vKVxyXG4gICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gIGlzU3VpdGVkOiAoaGFuZCkgLT5cclxuICAgIGlmIGhhbmQubGVuZ3RoIDwgMVxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIGNhcmRzID0gaGFuZC5tYXAgKHJhdykgLT4gbmV3IENhcmQocmF3KVxyXG4gICAgc3VpdCA9IGNhcmRzWzBdLnN1aXRcclxuICAgIGZvciBjYXJkIGluIGNhcmRzXHJcbiAgICAgIGlmIGNhcmQuc3VpdCAhPSBzdWl0XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICBpc0JpZ1J1bjogKHBsYXksIGF0TGVhc3QpIC0+XHJcbiAgICBpZiBtYXRjaGVzID0gcGxheS50eXBlLm1hdGNoKC9ecnVuKFxcZCspLylcclxuICAgICAgbGVuID0gcGFyc2VJbnQobWF0Y2hlc1sxXSlcclxuICAgICAgaWYgbGVuID49IGF0TGVhc3RcclxuICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gIGFpQ2FsY0Jlc3RQbGF5czogKGhhbmQpIC0+XHJcbiAgICBiZXN0UGxheXMgPSBudWxsXHJcbiAgICBmb3IgYml0cyBpbiBbMC4uLjE2XVxyXG4gICAgICBzdHJhdGVneSA9XHJcbiAgICAgICAgc21hbGxSdW5zOiAoYml0cyAmIDEpID09IDFcclxuICAgICAgICBwcmVmZXJzUnVuczogKGJpdHMgJiAyKSA9PSAyXHJcbiAgICAgICAgbWF0Y2gyczogKGJpdHMgJiA0KSA9PSA0XHJcbiAgICAgICAgc2Vlc1JvcHM6IChiaXRzICYgOCkgPT0gOFxyXG4gICAgICBwbGF5cyA9IEBhaUNhbGNQbGF5cyhoYW5kLCBzdHJhdGVneSlcclxuICAgICAgaWYgYmVzdFBsYXlzID09IG51bGxcclxuICAgICAgICBiZXN0UGxheXMgPSBwbGF5c1xyXG4gICAgICBlbHNlXHJcbiAgICAgICAgbnAgPSBAbnVtYmVyT2ZTaW5nbGVzKHBsYXlzKVxyXG4gICAgICAgIG5icCA9IEBudW1iZXJPZlNpbmdsZXMoYmVzdFBsYXlzKVxyXG4gICAgICAgIGlmIG5wIDwgbmJwXHJcbiAgICAgICAgICBiZXN0UGxheXMgPSBwbGF5c1xyXG4gICAgICAgIGVsc2UgaWYgbnAgPT0gbmJwXHJcbiAgICAgICAgICAjIGZsaXAgYSBjb2luIVxyXG4gICAgICAgICAgaWYgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMikgPT0gMFxyXG4gICAgICAgICAgICBiZXN0UGxheXMgPSBwbGF5c1xyXG4gICAgcmV0dXJuIGJlc3RQbGF5c1xyXG5cclxuICBwcmV0dHlQbGF5czogKHBsYXlzLCBleHRyYVByZXR0eSA9IGZhbHNlKSAtPlxyXG4gICAgcHJldHR5ID0ge31cclxuICAgIGZvciB0eXBlLCBhcnIgb2YgcGxheXNcclxuICAgICAgcHJldHR5W3R5cGVdID0gW11cclxuICAgICAgZm9yIHBsYXkgaW4gYXJyXHJcbiAgICAgICAgbmFtZXMgPSBbXVxyXG4gICAgICAgIGZvciByYXcgaW4gcGxheVxyXG4gICAgICAgICAgY2FyZCA9IG5ldyBDYXJkKHJhdylcclxuICAgICAgICAgIG5hbWVzLnB1c2goY2FyZC5uYW1lKVxyXG4gICAgICAgIHByZXR0eVt0eXBlXS5wdXNoKG5hbWVzKVxyXG4gICAgaWYgZXh0cmFQcmV0dHlcclxuICAgICAgcyA9IFwiXCJcclxuICAgICAgZm9yIHR5cGVOYW1lLCB0aHJvd3Mgb2YgcHJldHR5XHJcbiAgICAgICAgcyArPSBcIiAgICAgICogI3twbGF5VHlwZVRvU3RyaW5nKHR5cGVOYW1lKX06XFxuXCJcclxuICAgICAgICBpZiB0eXBlTmFtZSA9PSAna2luZDEnXHJcbiAgICAgICAgICBzICs9IFwiICAgICAgICAqICN7dGhyb3dzLm1hcCgodikgLT4gdlswXSkuam9pbignLCcpfVxcblwiXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgZm9yIHQgaW4gdGhyb3dzXHJcbiAgICAgICAgICAgIHMgKz0gXCIgICAgICAgICogI3t0LmpvaW4oJywnKX1cXG5cIlxyXG4gICAgICByZXR1cm4gc1xyXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHByZXR0eSlcclxuXHJcbiAgaGlnaGVzdENhcmQ6IChwbGF5KSAtPlxyXG4gICAgaGlnaGVzdCA9IDBcclxuICAgIGZvciBwIGluIHBsYXlcclxuICAgICAgaWYgaGlnaGVzdCA8IHBcclxuICAgICAgICBoaWdoZXN0ID0gcFxyXG4gICAgcmV0dXJuIGhpZ2hlc3RcclxuXHJcbiAgZmluZFBsYXlXaXRoM1M6IChwbGF5cykgLT5cclxuICAgIGZvciBwbGF5VHlwZSwgcGxheWxpc3Qgb2YgcGxheXNcclxuICAgICAgZm9yIHBsYXkgaW4gcGxheWxpc3RcclxuICAgICAgICBpZiBAaGFuZEhhczNTKHBsYXkpXHJcbiAgICAgICAgICByZXR1cm4gcGxheVxyXG5cclxuICAgIGNvbnNvbGUubG9nIFwiZmluZFBsYXlXaXRoM1M6IHNvbWV0aGluZyBpbXBvc3NpYmxlIGlzIGhhcHBlbmluZ1wiXHJcbiAgICByZXR1cm4gW11cclxuXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgQUkgQnJhaW5zXHJcblxyXG4gICMgQnJhaW5zIG11c3QgaGF2ZTpcclxuICAjICogaWQ6IGludGVybmFsIGlkZW50aWZpZXIgZm9yIHRoZSBicmFpblxyXG4gICMgKiBuYW1lOiBwcmV0dHkgbmFtZVxyXG4gICMgKiBwbGF5KGN1cnJlbnRQbGF5ZXIpIGF0dGVtcHRzIHRvIHBsYXkgYSBjYXJkIGJ5IGNhbGxpbmcgYWlQbGF5KCkuIFNob3VsZCByZXR1cm4gdHJ1ZSBpZiBpdCBzdWNjZXNzZnVsbHkgcGxheWVkIGEgY2FyZCAoYWlQbGF5KCkgcmV0dXJuZWQgdHJ1ZSlcclxuICBicmFpbnM6XHJcblxyXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICMgTm9ybWFsOiBJbnRlbmRlZCB0byBiZSB1c2VkIGJ5IG1vc3QgY2hhcmFjdGVycy5cclxuICAgICMgICAgICAgICBOb3QgdG9vIGR1bWIsIG5vdCB0b28gc21hcnQuXHJcbiAgICBub3JtYWw6XHJcbiAgICAgIGlkOiAgIFwibm9ybWFsXCJcclxuICAgICAgbmFtZTogXCJOb3JtYWxcIlxyXG5cclxuICAgICAgIyBub3JtYWxcclxuICAgICAgcGxheTogKGN1cnJlbnRQbGF5ZXIsIGN1cnJlbnRQbGF5LCBldmVyeW9uZVBhc3NlZCkgLT5cclxuICAgICAgICBpZiBjdXJyZW50UGxheWVyLnBhc3NcclxuICAgICAgICAgIGlmIEBnYW1lLm9wdGlvbnMucGFzc0JyZWFrIGFuZCBAY2FuQmVCcm9rZW4oY3VycmVudFBsYXkpIGFuZCBAaGFzQnJlYWtlcihjdXJyZW50UGxheWVyLmhhbmQpXHJcbiAgICAgICAgICAgIGJyZWFrZXJQbGF5cyA9IEBicmVha2VyUGxheXMoY3VycmVudFBsYXllci5oYW5kKVxyXG4gICAgICAgICAgICBmb3IgcGxheVR5cGUsIHBsYXlsaXN0IG9mIGJyZWFrZXJQbGF5c1xyXG4gICAgICAgICAgICAgIGlmIChwbGF5VHlwZS5tYXRjaCgvXnJvcC8pIG9yIChwbGF5VHlwZSA9PSAna2luZDQnKSkgYW5kIChwbGF5bGlzdC5sZW5ndGggPiAwKVxyXG4gICAgICAgICAgICAgICAgQGFpTG9nKFwiYnJlYWtpbmcgMlwiKVxyXG4gICAgICAgICAgICAgICAgaWYgQGFpUGxheShjdXJyZW50UGxheWVyLCBwbGF5bGlzdFswXSkgPT0gT0tcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuIE9LXHJcblxyXG4gICAgICAgICAgQGFpTG9nKFwiYWxyZWFkeSBwYXNzZWQsIGdvaW5nIHRvIGtlZXAgcGFzc2luZ1wiKVxyXG4gICAgICAgICAgcmV0dXJuIEBhaVBhc3MoY3VycmVudFBsYXllcilcclxuXHJcbiAgICAgICAgcGxheXMgPSBAYWlDYWxjQmVzdFBsYXlzKGN1cnJlbnRQbGF5ZXIuaGFuZClcclxuICAgICAgICBAYWlMb2coXCJiZXN0IHBsYXlzOiAje0BwcmV0dHlQbGF5cyhwbGF5cyl9XCIpXHJcblxyXG4gICAgICAgIGlmIEBwaWxlLmxlbmd0aCA9PSAwXHJcbiAgICAgICAgICBwbGF5ID0gQGZpbmRQbGF5V2l0aDNTKHBsYXlzKVxyXG4gICAgICAgICAgQGFpTG9nKFwiVGhyb3dpbmcgbXkgcGxheSB3aXRoIHRoZSAzUyBpbiBpdFwiKVxyXG4gICAgICAgICAgaWYgQGFpUGxheShjdXJyZW50UGxheWVyLCBwbGF5KSA9PSBPS1xyXG4gICAgICAgICAgICByZXR1cm4gT0tcclxuXHJcbiAgICAgICAgaWYgY3VycmVudFBsYXkgYW5kIG5vdCBldmVyeW9uZVBhc3NlZFxyXG4gICAgICAgICAgaWYgcGxheXNbY3VycmVudFBsYXkudHlwZV0/IGFuZCAocGxheXNbY3VycmVudFBsYXkudHlwZV0ubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgZm9yIHBsYXkgaW4gcGxheXNbY3VycmVudFBsYXkudHlwZV1cclxuICAgICAgICAgICAgICBpZiBAaGlnaGVzdENhcmQocGxheSkgPiBjdXJyZW50UGxheS5oaWdoXHJcbiAgICAgICAgICAgICAgICBpZiBAYWlQbGF5KGN1cnJlbnRQbGF5ZXIsIHBsYXkpID09IE9LXHJcbiAgICAgICAgICAgICAgICAgIHJldHVybiBPS1xyXG4gICAgICAgICAgICBAYWlMb2coXCJJIGd1ZXNzIEkgY2FuJ3QgYWN0dWFsbHkgYmVhdCB0aGlzLCBwYXNzaW5nXCIpXHJcbiAgICAgICAgICAgIHJldHVybiBAYWlQYXNzKGN1cnJlbnRQbGF5ZXIpXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIEBhaUxvZyhcIkkgZG9uJ3QgaGF2ZSB0aGF0IHBsYXksIHBhc3NpbmdcIilcclxuICAgICAgICAgICAgcmV0dXJuIEBhaVBhc3MoY3VycmVudFBsYXllcilcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAjIG5vIGN1cnJlbnQgcGxheSwgdGhyb3cgdGhlIGZpcnN0IGNhcmRcclxuICAgICAgICAgIEBhaUxvZyhcIkkgY2FuIGRvIGFueXRoaW5nLCB0aHJvd2luZyBhIHJhbmRvbSBwbGF5XCIpXHJcbiAgICAgICAgICBwbGF5VHlwZXMgPSBPYmplY3Qua2V5cyhwbGF5cylcclxuICAgICAgICAgIHBsYXlUeXBlSW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBwbGF5VHlwZXMubGVuZ3RoKVxyXG4gICAgICAgICAgaWYgQGFpUGxheShjdXJyZW50UGxheWVyLCBwbGF5c1twbGF5VHlwZXNbcGxheVR5cGVJbmRleF1dWzBdKSA9PSBPS1xyXG4gICAgICAgICAgICByZXR1cm4gT0tcclxuXHJcbiAgICAgICAgIyBmaW5kIHRoZSBmaXJzdCBjYXJkIHRoYXQgYmVhdHMgdGhlIGN1cnJlbnRQbGF5J3MgaGlnaFxyXG4gICAgICAgIGZvciByYXdDYXJkIGluIGN1cnJlbnRQbGF5ZXIuaGFuZFxyXG4gICAgICAgICAgaWYgcmF3Q2FyZCA+IGN1cnJlbnRQbGF5LmhpZ2hcclxuICAgICAgICAgICAgQGFpTG9nKFwiZm91bmQgc21hbGxlc3Qgc2luZ2xlICgje3Jhd0NhcmR9KSwgcGxheWluZ1wiKVxyXG4gICAgICAgICAgICBpZiBAYWlQbGF5KGN1cnJlbnRQbGF5ZXIsIFtyYXdDYXJkXSkgPT0gT0tcclxuICAgICAgICAgICAgICByZXR1cm4gT0tcclxuICAgICAgICAgICAgYnJlYWtcclxuXHJcbiAgICAgICAgQGFpTG9nKFwibm90aGluZyBlbHNlIHRvIGRvLCBwYXNzaW5nXCIpXHJcbiAgICAgICAgcmV0dXJuIEBhaVBhc3MoY3VycmVudFBsYXllcilcclxuXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgRGVidWcgY29kZVxyXG5cclxuZGVidWcgPSAtPlxyXG4gIHRoaXIgPSBuZXcgVGhpcnRlZW4oKVxyXG4gIGZ1bGx5UGxheWVkID0gMFxyXG4gIHRvdGFsQXR0ZW1wdHMgPSAxMDBcclxuXHJcbiAgZm9yIGF0dGVtcHQgaW4gWzAuLi50b3RhbEF0dGVtcHRzXVxyXG4gICAgZGVjayA9IG5ldyBTaHVmZmxlZERlY2soKVxyXG4gICAgaGFuZCA9IFtdXHJcbiAgICBmb3IgaiBpbiBbMC4uLjEzXVxyXG4gICAgICByYXcgPSBkZWNrLmNhcmRzLnNoaWZ0KClcclxuICAgICAgaGFuZC5wdXNoKHJhdylcclxuICAgICMgaGFuZCA9IFs1MSw1MCw0OSw0OCw0Nyw0Niw0NSw0NCw0Myw0Miw0MSw0MCwzOV1cclxuICAgICMgaGFuZCA9IFswLDEsMiwzLDQsNSw2LDcsOCw5LDEwLDExLDEyXVxyXG4gICAgaGFuZC5zb3J0IChhLGIpIC0+IHJldHVybiBhIC0gYlxyXG5cclxuICAgIGNvbnNvbGUubG9nKFwiLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXCIpXHJcbiAgICBjb25zb2xlLmxvZyhcIkhhbmQgI3thdHRlbXB0KzF9OiAje2NhcmRzVG9TdHJpbmcoaGFuZCl9XCIpXHJcbiAgICBjb25zb2xlLmxvZyhcIlwiKVxyXG5cclxuICAgIGZvdW5kRnVsbHlQbGF5ZWQgPSBmYWxzZVxyXG4gICAgZm9yIGJpdHMgaW4gWzAuLi4xNl1cclxuICAgICAgc3RyYXRlZ3kgPVxyXG4gICAgICAgIHNtYWxsUnVuczogKGJpdHMgJiAxKSA9PSAxXHJcbiAgICAgICAgcHJlZmVyc1J1bnM6IChiaXRzICYgMikgPT0gMlxyXG4gICAgICAgIG1hdGNoMnM6IChiaXRzICYgNCkgPT0gNFxyXG4gICAgICAgIHNlZXNSb3BzOiAoYml0cyAmIDgpID09IDhcclxuICAgICAgcGxheXMgPSB0aGlyLmFpQ2FsY1BsYXlzKGhhbmQsIHN0cmF0ZWd5KVxyXG5cclxuICAgICAgY29uc29sZS5sb2coXCIgICAqIFN0cmF0ZWd5OiAje0pTT04uc3RyaW5naWZ5KHN0cmF0ZWd5KX1cIilcclxuICAgICAgY29uc29sZS5sb2codGhpci5wcmV0dHlQbGF5cyhwbGF5cywgdHJ1ZSkpXHJcblxyXG4gICAgICBpZiBub3QgcGxheXMua2luZDFcclxuICAgICAgICBmb3VuZEZ1bGx5UGxheWVkID0gdHJ1ZVxyXG5cclxuICAgIGlmIGZvdW5kRnVsbHlQbGF5ZWRcclxuICAgICAgZnVsbHlQbGF5ZWQgKz0gMVxyXG5cclxuICBjb25zb2xlLmxvZyBcImZ1bGx5UGxheWVkOiAje2Z1bGx5UGxheWVkfSAvICN7dG90YWxBdHRlbXB0c31cIlxyXG5cclxuIyAgICAgIEggIEQgIEMgIFNcclxuIyAgMjogNTEgNTAgNDkgNDhcclxuIyAgQTogNDcgNDYgNDUgNDRcclxuIyAgSzogNDMgNDIgNDEgNDBcclxuIyAgUTogMzkgMzggMzcgMzZcclxuIyAgSjogMzUgMzQgMzMgMzJcclxuIyAxMDogMzEgMzAgMjkgMjhcclxuIyAgOTogMjcgMjYgMjUgMjRcclxuIyAgODogMjMgMjIgMjEgMjBcclxuIyAgNzogMTkgMTggMTcgMTZcclxuIyAgNjogMTUgMTQgMTMgMTJcclxuIyAgNTogMTEgMTAgIDkgIDhcclxuIyAgNDogIDcgIDYgIDUgIDRcclxuIyAgMzogIDMgIDIgIDEgIDBcclxuXHJcbmRlYnVnMiA9IC0+XHJcbiAgZ2FtZSA9XHJcbiAgICBvcHRpb25zOlxyXG4gICAgICBhdXRvcGFzc0luZGV4OiAxXHJcbiAgdGhpciA9IG5ldyBUaGlydGVlbihnYW1lKVxyXG4gIGN1cnJlbnRQbGF5ID1cclxuICAgIHR5cGU6ICdydW4zJ1xyXG4gICAgaGlnaDogMjZcclxuICBoYW5kID0gW1xyXG4gICAgMTAsIDExLCAxNSwgMTksIDIzLCAyN1xyXG4gIF1cclxuICBjb25zb2xlLmxvZyB0aGlyLmhhc1BsYXkoY3VycmVudFBsYXksIGhhbmQpXHJcblxyXG5cclxuIyBkZWJ1ZygpXHJcbiMgZGVidWcyKClcclxuXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgRXhwb3J0c1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPVxyXG4gIENhcmQ6IENhcmRcclxuICBUaGlydGVlbjogVGhpcnRlZW5cclxuICBPSzogT0tcclxuICBhaUNoYXJhY3RlcnM6IGFpQ2hhcmFjdGVyc1xyXG4gIGFjaGlldmVtZW50c0xpc3Q6IGFjaGlldmVtZW50c0xpc3RcclxuICBhY2hpZXZlbWVudHNNYXA6IGFjaGlldmVtZW50c01hcFxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9XHJcbiAgZGFya2ZvcmVzdDpcclxuICAgIGhlaWdodDogNzJcclxuICAgIGdseXBoczpcclxuICAgICAgJzk3JyA6IHsgeDogICA4LCB5OiAgIDgsIHdpZHRoOiAgMzQsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICc5OCcgOiB7IHg6ICAgOCwgeTogIDU4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnOTknIDogeyB4OiAgNTAsIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzEwMCc6IHsgeDogICA4LCB5OiAxMTgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICcxMDEnOiB7IHg6ICAgOCwgeTogMTc4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnMTAyJzogeyB4OiAgIDgsIHk6IDIyOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDMzIH1cclxuICAgICAgJzEwMyc6IHsgeDogICA4LCB5OiAyNzgsIHdpZHRoOiAgMzYsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNSB9XHJcbiAgICAgICcxMDQnOiB7IHg6ICAgOCwgeTogMzI4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnMTA1JzogeyB4OiAgIDgsIHk6IDM3OCwgd2lkdGg6ICAxMiwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDExIH1cclxuICAgICAgJzEwNic6IHsgeDogICA4LCB5OiA0MjgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQxLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICcxMDcnOiB7IHg6ICAyOCwgeTogMzc4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnMTA4JzogeyB4OiAgNTEsIHk6IDMyOCwgd2lkdGg6ICAzNCwgaGVpZ2h0OiAgNDEsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDMzIH1cclxuICAgICAgJzEwOSc6IHsgeDogIDUxLCB5OiA0MjcsIHdpZHRoOiAgMzgsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNyB9XHJcbiAgICAgICcxMTAnOiB7IHg6ICA3MSwgeTogMzc3LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnMTExJzogeyB4OiAgOTcsIHk6IDQyNywgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDEsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzExMic6IHsgeDogIDUxLCB5OiAgNTgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICcxMTMnOiB7IHg6ICA1MSwgeTogMTA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0NSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnMTE0JzogeyB4OiAgOTMsIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM1IH1cclxuICAgICAgJzExNSc6IHsgeDogIDUxLCB5OiAxNjEsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNSB9XHJcbiAgICAgICcxMTYnOiB7IHg6ICA1MSwgeTogMjExLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzMgfVxyXG4gICAgICAnMTE3JzogeyB4OiAgNTIsIHk6IDI2MSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzExOCc6IHsgeDogIDkzLCB5OiAzMTEsIHdpZHRoOiAgMzQsIGhlaWdodDogIDQxLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzMiB9XHJcbiAgICAgICcxMTknOiB7IHg6IDExNCwgeTogMzYwLCB3aWR0aDogIDM4LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzggfVxyXG4gICAgICAnMTIwJzogeyB4OiAxNDAsIHk6IDQxMCwgd2lkdGg6ICAzNiwgaGVpZ2h0OiAgNDEsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM3IH1cclxuICAgICAgJzEyMSc6IHsgeDogMTQwLCB5OiA0NTksIHdpZHRoOiAgMzUsIGhlaWdodDogIDQxLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICcxMjInOiB7IHg6IDE4MywgeTogNDU5LCB3aWR0aDogIDM2LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzUgfVxyXG4gICAgICAnNjUnIDogeyB4OiAgOTQsIHk6ICA1OCwgd2lkdGg6ICAzNCwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cclxuICAgICAgJzY2JyA6IHsgeDogIDk0LCB5OiAxMTksIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNyB9XHJcbiAgICAgICc2NycgOiB7IHg6ICA5NCwgeTogMTgwLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxyXG4gICAgICAnNjgnIDogeyB4OiAgOTUsIHk6IDI0MSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM3IH1cclxuICAgICAgJzY5JyA6IHsgeDogMTM2LCB5OiAgIDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XHJcbiAgICAgICc3MCcgOiB7IHg6IDEzNywgeTogIDY5LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnNzEnIDogeyB4OiAxNzksIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cclxuICAgICAgJzcyJyA6IHsgeDogMTM3LCB5OiAxMzAsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XHJcbiAgICAgICc3MycgOiB7IHg6IDEzOCwgeTogMTkxLCB3aWR0aDogIDEyLCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMTMgfVxyXG4gICAgICAnNzQnIDogeyB4OiAxMzgsIHk6IDI1Miwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cclxuICAgICAgJzc1JyA6IHsgeDogMTU4LCB5OiAxOTEsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XHJcbiAgICAgICc3NicgOiB7IHg6IDE2MCwgeTogMzEzLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnNzcnIDogeyB4OiAxODEsIHk6IDI1MSwgd2lkdGg6ICAzOCwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM5IH1cclxuICAgICAgJzc4JyA6IHsgeDogMTg0LCB5OiAzNzQsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNSB9XHJcbiAgICAgICc3OScgOiB7IHg6IDIwMywgeTogMzEyLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxyXG4gICAgICAnODAnIDogeyB4OiAxODAsIHk6ICA2OSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzgxJyA6IHsgeDogMjAxLCB5OiAxMzAsIHdpZHRoOiAgMzUsIGhlaWdodDogIDU2LCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNSB9XHJcbiAgICAgICc4MicgOiB7IHg6IDIyMiwgeTogICA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxyXG4gICAgICAnODMnIDogeyB4OiAyMjMsIHk6ICA2OSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM1IH1cclxuICAgICAgJzg0JyA6IHsgeDogMjY1LCB5OiAgIDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzMyB9XHJcbiAgICAgICc4NScgOiB7IHg6IDIyNywgeTogMTk0LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxyXG4gICAgICAnODYnIDogeyB4OiAyNDQsIHk6IDEzMCwgd2lkdGg6ICA0MSwgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDE5LCB4YWR2YW5jZTogIDM5IH1cclxuICAgICAgJzg3JyA6IHsgeDogMjY2LCB5OiAgNjksIHdpZHRoOiAgMzgsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNyB9XHJcbiAgICAgICc4OCcgOiB7IHg6IDMwOCwgeTogICA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMTksIHhhZHZhbmNlOiAgMzUgfVxyXG4gICAgICAnODknIDogeyB4OiAyMjcsIHk6IDM3Mywgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDE5LCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzkwJyA6IHsgeDogMjI3LCB5OiA0MzMsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNSB9XHJcbiAgICAgICczMycgOiB7IHg6IDI0NiwgeTogMjU1LCB3aWR0aDogIDE0LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMTEgfVxyXG4gICAgICAnNTknIDogeyB4OiAxODAsIHk6IDEzMCwgd2lkdGg6ICAxMywgaGVpZ2h0OiAgMzcsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDU2LCB4YWR2YW5jZTogIDEzIH1cclxuICAgICAgJzM3JyA6IHsgeDogIDk1LCB5OiAzMDIsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XHJcbiAgICAgICc1OCcgOiB7IHg6IDE2MCwgeTogMzc0LCB3aWR0aDogIDEzLCBoZWlnaHQ6ICAyMywgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNTAsIHhhZHZhbmNlOiAgMTMgfVxyXG4gICAgICAnNjMnIDogeyB4OiAyNjgsIHk6IDI1NSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDMzIH1cclxuICAgICAgJzQyJyA6IHsgeDogMTAzLCB5OiAzMDIsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XHJcbiAgICAgICc0MCcgOiB7IHg6IDI3MCwgeTogMTkwLCB3aWR0aDogIDIzLCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMjEgfVxyXG4gICAgICAnNDEnIDogeyB4OiAyOTMsIHk6IDEzMCwgd2lkdGg6ICAyMywgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDIxIH1cclxuICAgICAgJzk1JyA6IHsgeDogMTExLCB5OiAzMDIsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XHJcbiAgICAgICc0MycgOiB7IHg6IDI0NiwgeTogMzE2LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICAzNCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgMzksIHhhZHZhbmNlOiAgMzIgfVxyXG4gICAgICAnNDUnIDogeyB4OiAxODQsIHk6IDQzNSwgd2lkdGg6ICAyNiwgaGVpZ2h0OiAgMTEsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDQ0LCB4YWR2YW5jZTogIDI1IH1cclxuICAgICAgJzYxJyA6IHsgeDogMzEyLCB5OiAgNjgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDMwLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICA0MiwgeGFkdmFuY2U6ICAzMyB9XHJcbiAgICAgICc0NicgOiB7IHg6IDEzNSwgeTogMzEzLCB3aWR0aDogIDE0LCBoZWlnaHQ6ICAxMSwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNjEsIHhhZHZhbmNlOiAgMTQgfVxyXG4gICAgICAnNDQnIDogeyB4OiAyMjcsIHk6IDI1NSwgd2lkdGg6ICAxMCwgaGVpZ2h0OiAgMjEsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDY4LCB4YWR2YW5jZTogIDExIH1cclxuICAgICAgJzQ3JyA6IHsgeDogMzUxLCB5OiAgIDgsIHdpZHRoOiAgMjgsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAxOSwgeGFkdmFuY2U6ICAyNiB9XHJcbiAgICAgICcxMjQnOiB7IHg6IDExOSwgeTogMzAyLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxyXG4gICAgICAnMzQnIDogeyB4OiAxMjcsIHk6IDMwMiwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cclxuICAgICAgJzM5JyA6IHsgeDogMjAxLCB5OiAxOTQsIHdpZHRoOiAgMTgsIGhlaWdodDogIDE5LCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAgMCwgeGFkdmFuY2U6ICAyMSB9XHJcbiAgICAgICc2NCcgOiB7IHg6IDIxOCwgeTogNDM1LCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxyXG4gICAgICAnMzUnIDogeyB4OiAyMTgsIHk6IDQ0Mywgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cclxuICAgICAgJzM2JyA6IHsgeDogMzAxLCB5OiAxOTAsIHdpZHRoOiAgMzIsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAyMiwgeGFkdmFuY2U6ICAyOSB9XHJcbiAgICAgICc5NCcgOiB7IHg6IDIxOCwgeTogNDUxLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxyXG4gICAgICAnMzgnIDogeyB4OiAyNDYsIHk6IDM1OCwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cclxuICAgICAgJzEyMyc6IHsgeDogMzI0LCB5OiAxMDYsIHdpZHRoOiAgMjcsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAyNiB9XHJcbiAgICAgICcxMjUnOiB7IHg6IDI3MCwgeTogMzU4LCB3aWR0aDogIDI3LCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMjcgfVxyXG4gICAgICAnOTEnIDogeyB4OiAyNzAsIHk6IDQxOCwgd2lkdGg6ICAyMiwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDIxIH1cclxuICAgICAgJzkzJyA6IHsgeDogMzAwLCB5OiA0MTgsIHdpZHRoOiAgMjIsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAyMCB9XHJcbiAgICAgICc0OCcgOiB7IHg6IDMwNSwgeTogMzE2LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxyXG4gICAgICAnNDknIDogeyB4OiAzMTEsIHk6IDI1MSwgd2lkdGg6ICAzNCwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM1IH1cclxuICAgICAgJzUwJyA6IHsgeDogMzQxLCB5OiAxNjYsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNyB9XHJcbiAgICAgICc1MScgOiB7IHg6IDM1OSwgeTogIDY4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxyXG4gICAgICAnNTInIDogeyB4OiAzMzAsIHk6IDM3Nywgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM1IH1cclxuICAgICAgJzUzJyA6IHsgeDogMzQ4LCB5OiAzMTIsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNyB9XHJcbiAgICAgICc1NCcgOiB7IHg6IDMzMCwgeTogNDM4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxyXG4gICAgICAnNTUnIDogeyB4OiAzNTMsIHk6IDIyNywgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzU2JyA6IHsgeDogMzg0LCB5OiAxMjksIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XHJcbiAgICAgICc1NycgOiB7IHg6IDQwMiwgeTogICA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxyXG4gICAgICAnMzInIDogeyB4OiAgIDAsIHk6ICAgMCwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDIyIH1cclxuXHJcbiAgICAgICMgY2FyZCBnbHlwaHNcclxuICAgICAgJzIwMCc6IHsgeDogMzk2LCB5OiAzNzgsIHdpZHRoOiAgNDAsIGhlaWdodDogIDQ5LCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMSwgeGFkdmFuY2U6ICA0MyB9ICMgU1xyXG4gICAgICAnMjAxJzogeyB4OiA0NDcsIHk6IDMxMywgd2lkdGg6ICA0OSwgaGVpZ2h0OiAgNTAsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIxLCB4YWR2YW5jZTogIDUyIH0gIyBDXHJcbiAgICAgICcyMDInOiB7IHg6IDM5OSwgeTogMzEzLCB3aWR0aDogIDM2LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjEsIHhhZHZhbmNlOiAgMzkgfSAjIERcclxuICAgICAgJzIwMyc6IHsgeDogNDUyLCB5OiAzODEsIHdpZHRoOiAgMzksIGhlaWdodDogIDQzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMSwgeGFkdmFuY2U6ICA0MiB9ICMgSFxyXG4iLCIjIFRoaXMgZmlsZSBwcm92aWRlcyB0aGUgcmVuZGVyaW5nIGVuZ2luZSBmb3IgdGhlIHdlYiB2ZXJzaW9uLiBOb25lIG9mIHRoaXMgY29kZSBpcyBpbmNsdWRlZCBpbiB0aGUgSmF2YSB2ZXJzaW9uLlxyXG5cclxuY29uc29sZS5sb2cgJ3dlYiBzdGFydHVwJ1xyXG5cclxuR2FtZSA9IHJlcXVpcmUgJy4vR2FtZSdcclxuXHJcbiMgdGFrZW4gZnJvbSBodHRwOiNzdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNTYyMzgzOC9yZ2ItdG8taGV4LWFuZC1oZXgtdG8tcmdiXHJcbmNvbXBvbmVudFRvSGV4ID0gKGMpIC0+XHJcbiAgaGV4ID0gTWF0aC5mbG9vcihjICogMjU1KS50b1N0cmluZygxNilcclxuICByZXR1cm4gaWYgaGV4Lmxlbmd0aCA9PSAxIHRoZW4gXCIwXCIgKyBoZXggZWxzZSBoZXhcclxucmdiVG9IZXggPSAociwgZywgYikgLT5cclxuICByZXR1cm4gXCIjXCIgKyBjb21wb25lbnRUb0hleChyKSArIGNvbXBvbmVudFRvSGV4KGcpICsgY29tcG9uZW50VG9IZXgoYilcclxuXHJcblNBVkVfVElNRVJfTVMgPSAzMDAwXHJcblxyXG5jbGFzcyBOYXRpdmVBcHBcclxuICBjb25zdHJ1Y3RvcjogKEBzY3JlZW4sIEB3aWR0aCwgQGhlaWdodCkgLT5cclxuICAgIEB0aW50ZWRUZXh0dXJlQ2FjaGUgPSBbXVxyXG4gICAgQGxhc3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcclxuICAgIEBsYXN0SW50ZXJhY3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcclxuICAgIEBoZWFyZE9uZVRvdWNoID0gZmFsc2VcclxuICAgIEB0b3VjaE1vdXNlID0gbnVsbFxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNlZG93bicsICBAb25Nb3VzZURvd24uYmluZCh0aGlzKSwgZmFsc2VcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdtb3VzZW1vdmUnLCAgQG9uTW91c2VNb3ZlLmJpbmQodGhpcyksIGZhbHNlXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2V1cCcsICAgIEBvbk1vdXNlVXAuYmluZCh0aGlzKSwgZmFsc2VcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICd0b3VjaHN0YXJ0JywgQG9uVG91Y2hTdGFydC5iaW5kKHRoaXMpLCBmYWxzZVxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ3RvdWNobW92ZScsICBAb25Ub3VjaE1vdmUuYmluZCh0aGlzKSwgZmFsc2VcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICd0b3VjaGVuZCcsICAgQG9uVG91Y2hFbmQuYmluZCh0aGlzKSwgZmFsc2VcclxuICAgIEBjb250ZXh0ID0gQHNjcmVlbi5nZXRDb250ZXh0KFwiMmRcIilcclxuICAgIEB0ZXh0dXJlcyA9IFtcclxuICAgICAgIyBhbGwgY2FyZCBhcnRcclxuICAgICAgXCIuLi9pbWFnZXMvY2FyZHMucG5nXCJcclxuICAgICAgIyBmb250c1xyXG4gICAgICBcIi4uL2ltYWdlcy9kYXJrZm9yZXN0LnBuZ1wiXHJcbiAgICAgICMgY2hhcmFjdGVycyAvIG90aGVyXHJcbiAgICAgIFwiLi4vaW1hZ2VzL2NoYXJzLnBuZ1wiXHJcbiAgICAgICMgaGVscFxyXG4gICAgICBcIi4uL2ltYWdlcy9ob3cxLnBuZ1wiXHJcbiAgICAgIFwiLi4vaW1hZ2VzL2hvdzIucG5nXCJcclxuICAgICAgXCIuLi9pbWFnZXMvaG93My5wbmdcIlxyXG4gICAgXVxyXG5cclxuICAgIEBnYW1lID0gbmV3IEdhbWUodGhpcywgQHdpZHRoLCBAaGVpZ2h0KVxyXG5cclxuICAgIGlmIHR5cGVvZiBTdG9yYWdlICE9IFwidW5kZWZpbmVkXCJcclxuICAgICAgc3RhdGUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSBcInN0YXRlXCJcclxuICAgICAgaWYgc3RhdGVcclxuICAgICAgICAjIGNvbnNvbGUubG9nIFwibG9hZGluZyBzdGF0ZTogI3tzdGF0ZX1cIlxyXG4gICAgICAgIEBnYW1lLmxvYWQgc3RhdGVcclxuXHJcbiAgICBAcGVuZGluZ0ltYWdlcyA9IDBcclxuICAgIGxvYWRlZFRleHR1cmVzID0gW11cclxuICAgIGZvciBpbWFnZVVybCBpbiBAdGV4dHVyZXNcclxuICAgICAgQHBlbmRpbmdJbWFnZXMrK1xyXG4gICAgICBjb25zb2xlLmxvZyBcImxvYWRpbmcgaW1hZ2UgI3tAcGVuZGluZ0ltYWdlc306ICN7aW1hZ2VVcmx9XCJcclxuICAgICAgaW1nID0gbmV3IEltYWdlKClcclxuICAgICAgaW1nLm9ubG9hZCA9IEBvbkltYWdlTG9hZGVkLmJpbmQodGhpcylcclxuICAgICAgaW1nLnNyYyA9IGltYWdlVXJsXHJcbiAgICAgIGxvYWRlZFRleHR1cmVzLnB1c2ggaW1nXHJcbiAgICBAdGV4dHVyZXMgPSBsb2FkZWRUZXh0dXJlc1xyXG5cclxuICAgIEBzYXZlVGltZXIgPSBTQVZFX1RJTUVSX01TXHJcblxyXG4gIG9uSW1hZ2VMb2FkZWQ6IChpbmZvKSAtPlxyXG4gICAgQHBlbmRpbmdJbWFnZXMtLVxyXG4gICAgaWYgQHBlbmRpbmdJbWFnZXMgPT0gMFxyXG4gICAgICBjb25zb2xlLmxvZyAnQWxsIGltYWdlcyBsb2FkZWQuIEJlZ2lubmluZyByZW5kZXIgbG9vcC4nXHJcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9PiBAdXBkYXRlKClcclxuXHJcbiAgbG9nOiAocykgLT5cclxuICAgIGNvbnNvbGUubG9nIFwiTmF0aXZlQXBwLmxvZygpOiAje3N9XCJcclxuXHJcbiAgdXBkYXRlU2F2ZTogKGR0KSAtPlxyXG4gICAgcmV0dXJuIGlmIHR5cGVvZiBTdG9yYWdlID09IFwidW5kZWZpbmVkXCJcclxuICAgIEBzYXZlVGltZXIgLT0gZHRcclxuICAgIGlmIEBzYXZlVGltZXIgPD0gMFxyXG4gICAgICBAc2F2ZVRpbWVyID0gU0FWRV9USU1FUl9NU1xyXG4gICAgICBzdGF0ZSA9IEBnYW1lLnNhdmUoKVxyXG4gICAgICAjIGNvbnNvbGUubG9nIFwic2F2aW5nOiAje3N0YXRlfVwiXHJcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtIFwic3RhdGVcIiwgc3RhdGVcclxuXHJcbiAgZ2VuZXJhdGVUaW50SW1hZ2U6ICh0ZXh0dXJlSW5kZXgsIHJlZCwgZ3JlZW4sIGJsdWUpIC0+XHJcbiAgICBpbWcgPSBAdGV4dHVyZXNbdGV4dHVyZUluZGV4XVxyXG4gICAgYnVmZiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgXCJjYW52YXNcIlxyXG4gICAgYnVmZi53aWR0aCAgPSBpbWcud2lkdGhcclxuICAgIGJ1ZmYuaGVpZ2h0ID0gaW1nLmhlaWdodFxyXG5cclxuICAgIGN0eCA9IGJ1ZmYuZ2V0Q29udGV4dCBcIjJkXCJcclxuICAgIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnY29weSdcclxuICAgIGN0eC5kcmF3SW1hZ2UoaW1nLCAwLCAwKVxyXG4gICAgZmlsbENvbG9yID0gXCJyZ2IoI3tNYXRoLmZsb29yKHJlZCoyNTUpfSwgI3tNYXRoLmZsb29yKGdyZWVuKjI1NSl9LCAje01hdGguZmxvb3IoYmx1ZSoyNTUpfSlcIlxyXG4gICAgY3R4LmZpbGxTdHlsZSA9IGZpbGxDb2xvclxyXG4gICAgIyBjb25zb2xlLmxvZyBcImZpbGxDb2xvciAje2ZpbGxDb2xvcn1cIlxyXG4gICAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdtdWx0aXBseSdcclxuICAgIGN0eC5maWxsUmVjdCgwLCAwLCBidWZmLndpZHRoLCBidWZmLmhlaWdodClcclxuICAgIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnY29weSdcclxuICAgIGN0eC5nbG9iYWxBbHBoYSA9IDEuMFxyXG4gICAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdkZXN0aW5hdGlvbi1pbidcclxuICAgIGN0eC5kcmF3SW1hZ2UoaW1nLCAwLCAwKVxyXG5cclxuICAgIGltZ0NvbXAgPSBuZXcgSW1hZ2UoKVxyXG4gICAgaW1nQ29tcC5zcmMgPSBidWZmLnRvRGF0YVVSTCgpXHJcbiAgICByZXR1cm4gaW1nQ29tcFxyXG5cclxuICBkcmF3SW1hZ2U6ICh0ZXh0dXJlSW5kZXgsIHNyY1gsIHNyY1ksIHNyY1csIHNyY0gsIGRzdFgsIGRzdFksIGRzdFcsIGRzdEgsIHJvdCwgYW5jaG9yWCwgYW5jaG9yWSwgciwgZywgYiwgYSkgLT5cclxuICAgIHRleHR1cmUgPSBAdGV4dHVyZXNbdGV4dHVyZUluZGV4XVxyXG4gICAgaWYgKHIgIT0gMSkgb3IgKGcgIT0gMSkgb3IgKGIgIT0gMSlcclxuICAgICAgdGludGVkVGV4dHVyZUtleSA9IFwiI3t0ZXh0dXJlSW5kZXh9LSN7cn0tI3tnfS0je2J9XCJcclxuICAgICAgdGludGVkVGV4dHVyZSA9IEB0aW50ZWRUZXh0dXJlQ2FjaGVbdGludGVkVGV4dHVyZUtleV1cclxuICAgICAgaWYgbm90IHRpbnRlZFRleHR1cmVcclxuICAgICAgICB0aW50ZWRUZXh0dXJlID0gQGdlbmVyYXRlVGludEltYWdlIHRleHR1cmVJbmRleCwgciwgZywgYlxyXG4gICAgICAgIEB0aW50ZWRUZXh0dXJlQ2FjaGVbdGludGVkVGV4dHVyZUtleV0gPSB0aW50ZWRUZXh0dXJlXHJcbiAgICAgICAgIyBjb25zb2xlLmxvZyBcImdlbmVyYXRlZCBjYWNoZWQgdGV4dHVyZSAje3RpbnRlZFRleHR1cmVLZXl9XCJcclxuICAgICAgdGV4dHVyZSA9IHRpbnRlZFRleHR1cmVcclxuXHJcbiAgICBAY29udGV4dC5zYXZlKClcclxuICAgIEBjb250ZXh0LnRyYW5zbGF0ZSBkc3RYLCBkc3RZXHJcbiAgICBAY29udGV4dC5yb3RhdGUgcm90ICMgKiAzLjE0MTU5MiAvIDE4MC4wXHJcbiAgICBhbmNob3JPZmZzZXRYID0gLTEgKiBhbmNob3JYICogZHN0V1xyXG4gICAgYW5jaG9yT2Zmc2V0WSA9IC0xICogYW5jaG9yWSAqIGRzdEhcclxuICAgIEBjb250ZXh0LnRyYW5zbGF0ZSBhbmNob3JPZmZzZXRYLCBhbmNob3JPZmZzZXRZXHJcbiAgICBAY29udGV4dC5nbG9iYWxBbHBoYSA9IGFcclxuICAgIEBjb250ZXh0LmRyYXdJbWFnZSh0ZXh0dXJlLCBzcmNYLCBzcmNZLCBzcmNXLCBzcmNILCAwLCAwLCBkc3RXLCBkc3RIKVxyXG4gICAgQGNvbnRleHQucmVzdG9yZSgpXHJcblxyXG4gIHVwZGF0ZTogLT5cclxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9PiBAdXBkYXRlKClcclxuXHJcbiAgICBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxyXG4gICAgZHQgPSBub3cgLSBAbGFzdFRpbWVcclxuXHJcbiAgICAjIGR0ID0gTWF0aC5mbG9vcihkdCAvIDEwMClcclxuXHJcbiAgICB0aW1lU2luY2VJbnRlcmFjdCA9IG5vdyAtIEBsYXN0SW50ZXJhY3RUaW1lXHJcbiAgICBpZiB0aW1lU2luY2VJbnRlcmFjdCA+IDUwMDBcclxuICAgICAgZ29hbEZQUyA9IDUgIyBjYWxtIGRvd24sIG5vYm9keSBpcyBkb2luZyBhbnl0aGluZyBmb3IgYSB3aGlsZVxyXG4gICAgZWxzZVxyXG4gICAgICBnb2FsRlBTID0gbnVsbCAjIGFzIGZhc3QgYXMgcG9zc2libGVcclxuICAgIGlmIEBsYXN0R29hbEZQUyAhPSBnb2FsRlBTXHJcbiAgICAgIGNvbnNvbGUubG9nIFwic3dpdGNoaW5nIHRvICN7Z29hbEZQU30gRlBTXCJcclxuICAgICAgQGxhc3RHb2FsRlBTID0gZ29hbEZQU1xyXG5cclxuICAgIGlmIGdvYWxGUFMgIT0gbnVsbFxyXG4gICAgICBmcHNJbnRlcnZhbCA9IDEwMDAgLyBnb2FsRlBTXHJcbiAgICAgIGlmIGR0IDwgZnBzSW50ZXJ2YWxcclxuICAgICAgICByZXR1cm5cclxuICAgIEBsYXN0VGltZSA9IG5vd1xyXG5cclxuICAgIEBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBAd2lkdGgsIEBoZWlnaHQpXHJcbiAgICBpZiBAZ2FtZS51cGRhdGUoZHQpXHJcbiAgICAgIEBsYXN0SW50ZXJhY3RUaW1lID0gbm93XHJcbiAgICByZW5kZXJDb21tYW5kcyA9IEBnYW1lLnJlbmRlcigpXHJcblxyXG4gICAgaSA9IDBcclxuICAgIG4gPSByZW5kZXJDb21tYW5kcy5sZW5ndGhcclxuICAgIHdoaWxlIChpIDwgbilcclxuICAgICAgZHJhd0NhbGwgPSByZW5kZXJDb21tYW5kcy5zbGljZShpLCBpICs9IDE2KVxyXG4gICAgICBAZHJhd0ltYWdlLmFwcGx5KHRoaXMsIGRyYXdDYWxsKVxyXG5cclxuICAgIEB1cGRhdGVTYXZlKGR0KVxyXG5cclxuICBvblRvdWNoU3RhcnQ6IChldnQpIC0+XHJcbiAgICBAbGFzdEludGVyYWN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXHJcbiAgICBAaGVhcmRPbmVUb3VjaCA9IHRydWVcclxuICAgIHRvdWNoZXMgPSBldnQuY2hhbmdlZFRvdWNoZXNcclxuICAgIGZvciB0b3VjaCBpbiB0b3VjaGVzXHJcbiAgICAgIGlmIEB0b3VjaE1vdXNlID09IG51bGxcclxuICAgICAgICBAdG91Y2hNb3VzZSA9IHRvdWNoLmlkZW50aWZpZXJcclxuICAgICAgaWYgQHRvdWNoTW91c2UgPT0gdG91Y2guaWRlbnRpZmllclxyXG4gICAgICAgIEBnYW1lLnRvdWNoRG93bih0b3VjaC5jbGllbnRYLCB0b3VjaC5jbGllbnRZKVxyXG5cclxuICBvblRvdWNoTW92ZTogKGV2dCkgLT5cclxuICAgIEBsYXN0SW50ZXJhY3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcclxuICAgIHRvdWNoZXMgPSBldnQuY2hhbmdlZFRvdWNoZXNcclxuICAgIGZvciB0b3VjaCBpbiB0b3VjaGVzXHJcbiAgICAgIGlmIEB0b3VjaE1vdXNlID09IHRvdWNoLmlkZW50aWZpZXJcclxuICAgICAgICBAZ2FtZS50b3VjaE1vdmUodG91Y2guY2xpZW50WCwgdG91Y2guY2xpZW50WSlcclxuXHJcbiAgb25Ub3VjaEVuZDogKGV2dCkgLT5cclxuICAgIEBsYXN0SW50ZXJhY3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcclxuICAgIHRvdWNoZXMgPSBldnQuY2hhbmdlZFRvdWNoZXNcclxuICAgIGZvciB0b3VjaCBpbiB0b3VjaGVzXHJcbiAgICAgIGlmIEB0b3VjaE1vdXNlID09IHRvdWNoLmlkZW50aWZpZXJcclxuICAgICAgICBAZ2FtZS50b3VjaFVwKHRvdWNoLmNsaWVudFgsIHRvdWNoLmNsaWVudFkpXHJcbiAgICAgICAgQHRvdWNoTW91c2UgPSBudWxsXHJcbiAgICBpZiBldnQudG91Y2hlcy5sZW5ndGggPT0gMFxyXG4gICAgICBAdG91Y2hNb3VzZSA9IG51bGxcclxuXHJcbiAgb25Nb3VzZURvd246IChldnQpIC0+XHJcbiAgICBpZiBAaGVhcmRPbmVUb3VjaFxyXG4gICAgICByZXR1cm5cclxuICAgIEBsYXN0SW50ZXJhY3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcclxuICAgIEBnYW1lLnRvdWNoRG93bihldnQuY2xpZW50WCwgZXZ0LmNsaWVudFkpXHJcblxyXG4gIG9uTW91c2VNb3ZlOiAoZXZ0KSAtPlxyXG4gICAgaWYgQGhlYXJkT25lVG91Y2hcclxuICAgICAgcmV0dXJuXHJcbiAgICBAbGFzdEludGVyYWN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXHJcbiAgICBAZ2FtZS50b3VjaE1vdmUoZXZ0LmNsaWVudFgsIGV2dC5jbGllbnRZKVxyXG5cclxuICBvbk1vdXNlVXA6IChldnQpIC0+XHJcbiAgICBpZiBAaGVhcmRPbmVUb3VjaFxyXG4gICAgICByZXR1cm5cclxuICAgIEBsYXN0SW50ZXJhY3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcclxuICAgIEBnYW1lLnRvdWNoVXAoZXZ0LmNsaWVudFgsIGV2dC5jbGllbnRZKVxyXG5cclxuc2NyZWVuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ3NjcmVlbidcclxucmVzaXplU2NyZWVuID0gLT5cclxuICBkZXNpcmVkQXNwZWN0UmF0aW8gPSAxNiAvIDlcclxuICBjdXJyZW50QXNwZWN0UmF0aW8gPSB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodFxyXG4gIGlmIGN1cnJlbnRBc3BlY3RSYXRpbyA8IGRlc2lyZWRBc3BlY3RSYXRpb1xyXG4gICAgc2NyZWVuLndpZHRoID0gd2luZG93LmlubmVyV2lkdGhcclxuICAgIHNjcmVlbi5oZWlnaHQgPSBNYXRoLmZsb29yKHdpbmRvdy5pbm5lcldpZHRoICogKDEgLyBkZXNpcmVkQXNwZWN0UmF0aW8pKVxyXG4gIGVsc2VcclxuICAgIHNjcmVlbi53aWR0aCA9IE1hdGguZmxvb3Iod2luZG93LmlubmVySGVpZ2h0ICogZGVzaXJlZEFzcGVjdFJhdGlvKVxyXG4gICAgc2NyZWVuLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxyXG5yZXNpemVTY3JlZW4oKVxyXG4jIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdyZXNpemUnLCByZXNpemVTY3JlZW4sIGZhbHNlXHJcblxyXG5hcHAgPSBuZXcgTmF0aXZlQXBwKHNjcmVlbiwgc2NyZWVuLndpZHRoLCBzY3JlZW4uaGVpZ2h0KVxyXG4iXX0=
