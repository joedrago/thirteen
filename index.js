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

BUILD_TIMESTAMP = "1.15";

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
    this.pauseButtonSize = this.aaHeight / 15;
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
    var ach, achIndex, descHeight, icon, imageDim, imageMargin, j, len, progress, results, titleHeight, titleOffset, topHeight, x, y;
    this.spriteRenderer.render("solid", 0, 0, this.width, this.height, 0, 0, 0, this.colors.ach_bg, (function(_this) {
      return function() {
        return _this.renderMode = RenderMode.PAUSE;
      };
    })(this));
    titleHeight = this.height / 20;
    titleOffset = titleHeight / 2;
    this.fontRenderer.render(this.font, titleHeight, "Achievements", this.center.x, titleOffset, 0.5, 0.5, this.colors.ach_header);
    imageMargin = this.width / 15;
    topHeight = titleHeight;
    x = this.width / 120;
    y = topHeight;
    titleHeight = this.height / 22;
    descHeight = this.height / 30;
    imageDim = titleHeight * 2;
    results = [];
    for (achIndex = j = 0, len = achievementsList.length; j < len; achIndex = ++j) {
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
      if (achIndex === 6) {
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
var Card, GlyphSuitName, MAX_LOG_LINES, MIN_PLAYERS, OK, ShortSuitName, ShuffledDeck, Suit, SuitName, Thirteen, achievementsList, achievementsMap, aiCharacterList, aiCharacters, cardsToString, character, debug, debug2, e, l, len1, len2, m, playToCardCount, playToString, playTypeToString, randomCharacter;

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
  }
];

achievementsMap = {};

for (m = 0, len2 = achievementsList.length; m < len2; m++) {
  e = achievementsList[m];
  achievementsMap[e.id] = e;
}

Thirteen = (function() {
  Thirteen.STARTING_MONEY = 25;

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
      if (currentPlayer.place === 1) {
        if (this.turn === 0) {
          if ((this.players[1].hand.length >= 10) && (this.players[2].hand.length >= 10) && (this.players[3].hand.length >= 10)) {
            this.earn("rekt");
          }
          if (this.ach.state.fashionablyLate) {
            this.earn("late");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQW5pbWF0aW9uLmNvZmZlZSIsInNyYy9CdXR0b24uY29mZmVlIiwic3JjL0ZvbnRSZW5kZXJlci5jb2ZmZWUiLCJzcmMvR2FtZS5jb2ZmZWUiLCJzcmMvSGFuZC5jb2ZmZWUiLCJzcmMvTWVudS5jb2ZmZWUiLCJzcmMvUGlsZS5jb2ZmZWUiLCJzcmMvU3ByaXRlUmVuZGVyZXIuY29mZmVlIiwic3JjL1RoaXJ0ZWVuLmNvZmZlZSIsInNyYy9mb250bWV0cmljcy5jb2ZmZWUiLCJzcmMvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBOztBQUFBLFFBQUEsR0FBVyxTQUFDLENBQUQ7RUFDVCxJQUFHLENBQUEsS0FBSyxDQUFSO0FBQ0UsV0FBTyxFQURUO0dBQUEsTUFFSyxJQUFHLENBQUEsR0FBSSxDQUFQO0FBQ0gsV0FBTyxDQUFDLEVBREw7O0FBRUwsU0FBTztBQUxFOztBQU9MO0VBQ1MsbUJBQUMsSUFBRDtBQUNYLFFBQUE7SUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksQ0FBQztJQUNkLElBQUMsQ0FBQSxHQUFELEdBQU87SUFDUCxJQUFDLENBQUEsR0FBRCxHQUFPO0FBQ1AsU0FBQSxTQUFBOztNQUNFLElBQUcsQ0FBQSxLQUFLLE9BQVI7UUFDRSxJQUFDLENBQUEsR0FBSSxDQUFBLENBQUEsQ0FBTCxHQUFVO1FBQ1YsSUFBQyxDQUFBLEdBQUksQ0FBQSxDQUFBLENBQUwsR0FBVSxFQUZaOztBQURGO0VBSlc7O3NCQVViLElBQUEsR0FBTSxTQUFBO0lBQ0osSUFBRyxrQkFBSDtNQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBTCxHQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFEaEI7O0lBRUEsSUFBRyxrQkFBSDtNQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBTCxHQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFEaEI7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Q0FBd0IsUUFBeEI7O0FBQ1QsWUFBQSxHQUFlLFNBQUE7QUFDYixNQUFBO0VBQUEsa0JBQUEsR0FBcUIsRUFBQSxHQUFLO0VBQzFCLGtCQUFBLEdBQXFCLE1BQU0sQ0FBQyxVQUFQLEdBQW9CLE1BQU0sQ0FBQztFQUNoRCxJQUFHLGtCQUFBLEdBQXFCLGtCQUF4QjtJQUNFLE1BQU0sQ0FBQyxLQUFQLEdBQWUsTUFBTSxDQUFDO1dBQ3RCLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLElBQUksQ0FBQyxLQUFMLENBQVcsTUFBTSxDQUFDLFVBQVAsR0FBb0IsQ0FBQyxDQUFBLEdBQUksa0JBQUwsQ0FBL0IsRUFGbEI7R0FBQSxNQUFBO0lBSUUsTUFBTSxDQUFDLEtBQVAsR0FBZSxJQUFJLENBQUMsS0FBTCxDQUFXLE1BQU0sQ0FBQyxXQUFQLEdBQXFCLGtCQUFoQztXQUNmLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLE1BQU0sQ0FBQyxZQUx6Qjs7QUFIYTs7QUFTZixZQUFBLENBQUE7O0FBR0EsR0FBQSxHQUFNLElBQUksU0FBSixDQUFjLE1BQWQsRUFBc0IsTUFBTSxDQUFDLEtBQTdCLEVBQW9DLE1BQU0sQ0FBQyxNQUEzQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNhbGNTaWduID0gKHYpIC0+XG4gIGlmIHYgPT0gMFxuICAgIHJldHVybiAwXG4gIGVsc2UgaWYgdiA8IDBcbiAgICByZXR1cm4gLTFcbiAgcmV0dXJuIDFcblxuY2xhc3MgQW5pbWF0aW9uXG4gIGNvbnN0cnVjdG9yOiAoZGF0YSkgLT5cbiAgICBAc3BlZWQgPSBkYXRhLnNwZWVkXG4gICAgQHJlcSA9IHt9XG4gICAgQGN1ciA9IHt9XG4gICAgZm9yIGssdiBvZiBkYXRhXG4gICAgICBpZiBrICE9ICdzcGVlZCdcbiAgICAgICAgQHJlcVtrXSA9IHZcbiAgICAgICAgQGN1cltrXSA9IHZcblxuICAjICdmaW5pc2hlcycgYWxsIGFuaW1hdGlvbnNcbiAgd2FycDogLT5cbiAgICBpZiBAY3VyLnI/XG4gICAgICBAY3VyLnIgPSBAcmVxLnJcbiAgICBpZiBAY3VyLnM/XG4gICAgICBAY3VyLnMgPSBAcmVxLnNcbiAgICBpZiBAY3VyLng/IGFuZCBAY3VyLnk/XG4gICAgICBAY3VyLnggPSBAcmVxLnhcbiAgICAgIEBjdXIueSA9IEByZXEueVxuXG4gIGFuaW1hdGluZzogLT5cbiAgICBpZiBAY3VyLnI/XG4gICAgICBpZiBAcmVxLnIgIT0gQGN1ci5yXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgaWYgQGN1ci5zP1xuICAgICAgaWYgQHJlcS5zICE9IEBjdXIuc1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIGlmIEBjdXIueD8gYW5kIEBjdXIueT9cbiAgICAgIGlmIChAcmVxLnggIT0gQGN1ci54KSBvciAoQHJlcS55ICE9IEBjdXIueSlcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICByZXR1cm4gZmFsc2VcblxuICB1cGRhdGU6IChkdCkgLT5cbiAgICB1cGRhdGVkID0gZmFsc2VcbiAgICAjIHJvdGF0aW9uXG4gICAgaWYgQGN1ci5yP1xuICAgICAgaWYgQHJlcS5yICE9IEBjdXIuclxuICAgICAgICB1cGRhdGVkID0gdHJ1ZVxuICAgICAgICAjIHNhbml0aXplIHJlcXVlc3RlZCByb3RhdGlvblxuICAgICAgICB0d29QaSA9IE1hdGguUEkgKiAyXG4gICAgICAgIG5lZ1R3b1BpID0gLTEgKiB0d29QaVxuICAgICAgICBAcmVxLnIgLT0gdHdvUGkgd2hpbGUgQHJlcS5yID49IHR3b1BpXG4gICAgICAgIEByZXEuciArPSB0d29QaSB3aGlsZSBAcmVxLnIgPD0gbmVnVHdvUGlcbiAgICAgICAgIyBwaWNrIGEgZGlyZWN0aW9uIGFuZCB0dXJuXG4gICAgICAgIGRyID0gQHJlcS5yIC0gQGN1ci5yXG4gICAgICAgIGRpc3QgPSBNYXRoLmFicyhkcilcbiAgICAgICAgc2lnbiA9IGNhbGNTaWduKGRyKVxuICAgICAgICBpZiBkaXN0ID4gTWF0aC5QSVxuICAgICAgICAgICMgc3BpbiB0aGUgb3RoZXIgZGlyZWN0aW9uLCBpdCBpcyBjbG9zZXJcbiAgICAgICAgICBkaXN0ID0gdHdvUGkgLSBkaXN0XG4gICAgICAgICAgc2lnbiAqPSAtMVxuICAgICAgICBtYXhEaXN0ID0gZHQgKiBAc3BlZWQuciAvIDEwMDBcbiAgICAgICAgaWYgZGlzdCA8IG1heERpc3RcbiAgICAgICAgICAjIHdlIGNhbiBmaW5pc2ggdGhpcyBmcmFtZVxuICAgICAgICAgIEBjdXIuciA9IEByZXEuclxuICAgICAgICBlbHNlXG4gICAgICAgICAgQGN1ci5yICs9IG1heERpc3QgKiBzaWduXG5cbiAgICAjIHNjYWxlXG4gICAgaWYgQGN1ci5zP1xuICAgICAgaWYgQHJlcS5zICE9IEBjdXIuc1xuICAgICAgICB1cGRhdGVkID0gdHJ1ZVxuICAgICAgICAjIHBpY2sgYSBkaXJlY3Rpb24gYW5kIHR1cm5cbiAgICAgICAgZHMgPSBAcmVxLnMgLSBAY3VyLnNcbiAgICAgICAgZGlzdCA9IE1hdGguYWJzKGRzKVxuICAgICAgICBzaWduID0gY2FsY1NpZ24oZHMpXG4gICAgICAgIG1heERpc3QgPSBkdCAqIEBzcGVlZC5zIC8gMTAwMFxuICAgICAgICBpZiBkaXN0IDwgbWF4RGlzdFxuICAgICAgICAgICMgd2UgY2FuIGZpbmlzaCB0aGlzIGZyYW1lXG4gICAgICAgICAgQGN1ci5zID0gQHJlcS5zXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAY3VyLnMgKz0gbWF4RGlzdCAqIHNpZ25cblxuICAgICMgdHJhbnNsYXRpb25cbiAgICBpZiBAY3VyLng/IGFuZCBAY3VyLnk/XG4gICAgICBpZiAoQHJlcS54ICE9IEBjdXIueCkgb3IgKEByZXEueSAhPSBAY3VyLnkpXG4gICAgICAgIHVwZGF0ZWQgPSB0cnVlXG4gICAgICAgIHZlY1ggPSBAcmVxLnggLSBAY3VyLnhcbiAgICAgICAgdmVjWSA9IEByZXEueSAtIEBjdXIueVxuICAgICAgICBkaXN0ID0gTWF0aC5zcXJ0KCh2ZWNYICogdmVjWCkgKyAodmVjWSAqIHZlY1kpKVxuICAgICAgICBtYXhEaXN0ID0gZHQgKiBAc3BlZWQudCAvIDEwMDBcbiAgICAgICAgaWYgZGlzdCA8IG1heERpc3RcbiAgICAgICAgICAjIHdlIGNhbiBmaW5pc2ggdGhpcyBmcmFtZVxuICAgICAgICAgIEBjdXIueCA9IEByZXEueFxuICAgICAgICAgIEBjdXIueSA9IEByZXEueVxuICAgICAgICBlbHNlXG4gICAgICAgICAgIyBtb3ZlIGFzIG11Y2ggYXMgcG9zc2libGVcbiAgICAgICAgICBAY3VyLnggKz0gKHZlY1ggLyBkaXN0KSAqIG1heERpc3RcbiAgICAgICAgICBAY3VyLnkgKz0gKHZlY1kgLyBkaXN0KSAqIG1heERpc3RcblxuICAgIHJldHVybiB1cGRhdGVkXG5cbm1vZHVsZS5leHBvcnRzID0gQW5pbWF0aW9uXG4iLCJBbmltYXRpb24gPSByZXF1aXJlICcuL0FuaW1hdGlvbidcblxuY2xhc3MgQnV0dG9uXG4gIGNvbnN0cnVjdG9yOiAoQGdhbWUsIEBzcHJpdGVOYW1lcywgQGZvbnQsIEB0ZXh0SGVpZ2h0LCBAeCwgQHksIEBjYikgLT5cbiAgICBAYW5pbSA9IG5ldyBBbmltYXRpb24ge1xuICAgICAgc3BlZWQ6IHsgczogMyB9XG4gICAgICBzOiAwXG4gICAgfVxuICAgIEBjb2xvciA9IHsgcjogMSwgZzogMSwgYjogMSwgYTogMCB9XG5cbiAgdXBkYXRlOiAoZHQpIC0+XG4gICAgcmV0dXJuIEBhbmltLnVwZGF0ZShkdClcblxuICByZW5kZXI6IC0+XG4gICAgQGNvbG9yLmEgPSBAYW5pbS5jdXIuc1xuICAgIEBnYW1lLnNwcml0ZVJlbmRlcmVyLnJlbmRlciBAc3ByaXRlTmFtZXNbMF0sIEB4LCBAeSwgMCwgQHRleHRIZWlnaHQgKiAxLjUsIDAsIDAuNSwgMC41LCBAZ2FtZS5jb2xvcnMud2hpdGUsID0+XG4gICAgICAjIHB1bHNlIGJ1dHRvbiBhbmltLFxuICAgICAgQGFuaW0uY3VyLnMgPSAxXG4gICAgICBAYW5pbS5yZXEucyA9IDBcbiAgICAgICMgdGhlbiBjYWxsIGNhbGxiYWNrXG4gICAgICBAY2IodHJ1ZSlcbiAgICBAZ2FtZS5zcHJpdGVSZW5kZXJlci5yZW5kZXIgQHNwcml0ZU5hbWVzWzFdLCBAeCwgQHksIDAsIEB0ZXh0SGVpZ2h0ICogMS41LCAwLCAwLjUsIDAuNSwgQGNvbG9yXG4gICAgdGV4dCA9IEBjYihmYWxzZSlcbiAgICBAZ2FtZS5mb250UmVuZGVyZXIucmVuZGVyIEBmb250LCBAdGV4dEhlaWdodCwgdGV4dCwgQHgsIEB5LCAwLjUsIDAuNSwgQGdhbWUuY29sb3JzLmJ1dHRvbnRleHRcblxubW9kdWxlLmV4cG9ydHMgPSBCdXR0b25cbiIsImZvbnRtZXRyaWNzID0gcmVxdWlyZSAnLi9mb250bWV0cmljcydcblxuIyB0YWtlbiBmcm9tIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNTYyMzgzOC9yZ2ItdG8taGV4LWFuZC1oZXgtdG8tcmdiXG5oZXhUb1JnYiA9IChoZXgsIGEpIC0+XG4gICAgcmVzdWx0ID0gL14jPyhbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KSQvaS5leGVjKGhleClcbiAgICByZXR1cm4gbnVsbCBpZiBub3QgcmVzdWx0XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcjogcGFyc2VJbnQocmVzdWx0WzFdLCAxNikgLyAyNTUsXG4gICAgICAgIGc6IHBhcnNlSW50KHJlc3VsdFsyXSwgMTYpIC8gMjU1LFxuICAgICAgICBiOiBwYXJzZUludChyZXN1bHRbM10sIDE2KSAvIDI1NVxuICAgICAgICBhOiBhXG4gICAgfVxuXG5jbGFzcyBGb250UmVuZGVyZXJcbiAgY29uc3RydWN0b3I6ICAoQGdhbWUpIC0+XG4gICAgQHdoaXRlID0geyByOiAxLCBnOiAxLCBiOiAxLCBhOiAxIH1cblxuICBzaXplOiAoZm9udCwgaGVpZ2h0LCBzdHIpIC0+XG4gICAgbWV0cmljcyA9IGZvbnRtZXRyaWNzW2ZvbnRdXG4gICAgcmV0dXJuIGlmIG5vdCBtZXRyaWNzXG4gICAgc2NhbGUgPSBoZWlnaHQgLyBtZXRyaWNzLmhlaWdodFxuXG4gICAgdG90YWxXaWR0aCA9IDBcbiAgICB0b3RhbEhlaWdodCA9IG1ldHJpY3MuaGVpZ2h0ICogc2NhbGVcblxuICAgIGluQ29sb3IgPSBmYWxzZVxuICAgIGZvciBjaCwgaSBpbiBzdHJcbiAgICAgIGlmIGNoID09ICdgJ1xuICAgICAgICBpbkNvbG9yID0gIWluQ29sb3JcblxuICAgICAgaWYgbm90IGluQ29sb3JcbiAgICAgICAgY29kZSA9IGNoLmNoYXJDb2RlQXQoMClcbiAgICAgICAgZ2x5cGggPSBtZXRyaWNzLmdseXBoc1tjb2RlXVxuICAgICAgICBjb250aW51ZSBpZiBub3QgZ2x5cGhcbiAgICAgICAgdG90YWxXaWR0aCArPSBnbHlwaC54YWR2YW5jZSAqIHNjYWxlXG5cbiAgICByZXR1cm4ge1xuICAgICAgdzogdG90YWxXaWR0aFxuICAgICAgaDogdG90YWxIZWlnaHRcbiAgICB9XG5cbiAgcmVuZGVyOiAoZm9udCwgaGVpZ2h0LCBzdHIsIHgsIHksIGFuY2hvcngsIGFuY2hvcnksIGNvbG9yLCBjYikgLT5cbiAgICBtZXRyaWNzID0gZm9udG1ldHJpY3NbZm9udF1cbiAgICByZXR1cm4gaWYgbm90IG1ldHJpY3NcbiAgICBzY2FsZSA9IGhlaWdodCAvIG1ldHJpY3MuaGVpZ2h0XG5cbiAgICB0b3RhbFdpZHRoID0gMFxuICAgIHRvdGFsSGVpZ2h0ID0gbWV0cmljcy5oZWlnaHQgKiBzY2FsZVxuICAgIHNraXBDb2xvciA9IGZhbHNlXG4gICAgZm9yIGNoLCBpIGluIHN0clxuICAgICAgaWYgY2ggPT0gJ2AnXG4gICAgICAgIHNraXBDb2xvciA9ICFza2lwQ29sb3JcbiAgICAgIGNvbnRpbnVlIGlmIHNraXBDb2xvclxuICAgICAgY29kZSA9IGNoLmNoYXJDb2RlQXQoMClcbiAgICAgIGdseXBoID0gbWV0cmljcy5nbHlwaHNbY29kZV1cbiAgICAgIGNvbnRpbnVlIGlmIG5vdCBnbHlwaFxuICAgICAgdG90YWxXaWR0aCArPSBnbHlwaC54YWR2YW5jZSAqIHNjYWxlXG5cbiAgICBhbmNob3JPZmZzZXRYID0gLTEgKiBhbmNob3J4ICogdG90YWxXaWR0aFxuICAgIGFuY2hvck9mZnNldFkgPSAtMSAqIGFuY2hvcnkgKiB0b3RhbEhlaWdodFxuICAgIGN1cnJYID0geFxuXG4gICAgaWYgY29sb3JcbiAgICAgIHN0YXJ0aW5nQ29sb3IgPSBjb2xvclxuICAgIGVsc2VcbiAgICAgIHN0YXJ0aW5nQ29sb3IgPSBAd2hpdGVcbiAgICBjdXJyZW50Q29sb3IgPSBzdGFydGluZ0NvbG9yXG5cbiAgICBjb2xvclN0YXJ0ID0gLTFcbiAgICBmb3IgY2gsIGkgaW4gc3RyXG4gICAgICBpZiBjaCA9PSAnYCdcbiAgICAgICAgaWYgY29sb3JTdGFydCA9PSAtMVxuICAgICAgICAgIGNvbG9yU3RhcnQgPSBpICsgMVxuICAgICAgICBlbHNlXG4gICAgICAgICAgbGVuID0gaSAtIGNvbG9yU3RhcnRcbiAgICAgICAgICBpZiBsZW5cbiAgICAgICAgICAgIGN1cnJlbnRDb2xvciA9IGhleFRvUmdiKHN0ci5zdWJzdHIoY29sb3JTdGFydCwgaSAtIGNvbG9yU3RhcnQpLCBzdGFydGluZ0NvbG9yLmEpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgY3VycmVudENvbG9yID0gc3RhcnRpbmdDb2xvclxuICAgICAgICAgIGNvbG9yU3RhcnQgPSAtMVxuXG4gICAgICBjb250aW51ZSBpZiBjb2xvclN0YXJ0ICE9IC0xXG4gICAgICBjb2RlID0gY2guY2hhckNvZGVBdCgwKVxuICAgICAgZ2x5cGggPSBtZXRyaWNzLmdseXBoc1tjb2RlXVxuICAgICAgY29udGludWUgaWYgbm90IGdseXBoXG4gICAgICBAZ2FtZS5kcmF3SW1hZ2UgZm9udCxcbiAgICAgIGdseXBoLngsIGdseXBoLnksIGdseXBoLndpZHRoLCBnbHlwaC5oZWlnaHQsXG4gICAgICBjdXJyWCArIChnbHlwaC54b2Zmc2V0ICogc2NhbGUpICsgYW5jaG9yT2Zmc2V0WCwgeSArIChnbHlwaC55b2Zmc2V0ICogc2NhbGUpICsgYW5jaG9yT2Zmc2V0WSwgZ2x5cGgud2lkdGggKiBzY2FsZSwgZ2x5cGguaGVpZ2h0ICogc2NhbGUsXG4gICAgICAwLCAwLCAwLFxuICAgICAgY3VycmVudENvbG9yLnIsIGN1cnJlbnRDb2xvci5nLCBjdXJyZW50Q29sb3IuYiwgY3VycmVudENvbG9yLmEsIGNiXG4gICAgICBjdXJyWCArPSBnbHlwaC54YWR2YW5jZSAqIHNjYWxlXG5cbm1vZHVsZS5leHBvcnRzID0gRm9udFJlbmRlcmVyXG4iLCJBbmltYXRpb24gPSByZXF1aXJlICcuL0FuaW1hdGlvbidcbkJ1dHRvbiA9IHJlcXVpcmUgJy4vQnV0dG9uJ1xuRm9udFJlbmRlcmVyID0gcmVxdWlyZSAnLi9Gb250UmVuZGVyZXInXG5TcHJpdGVSZW5kZXJlciA9IHJlcXVpcmUgJy4vU3ByaXRlUmVuZGVyZXInXG5NZW51ID0gcmVxdWlyZSAnLi9NZW51J1xuSGFuZCA9IHJlcXVpcmUgJy4vSGFuZCdcblBpbGUgPSByZXF1aXJlICcuL1BpbGUnXG57VGhpcnRlZW4sIE9LLCBhaUNoYXJhY3RlcnMsIGFjaGlldmVtZW50c0xpc3R9ID0gcmVxdWlyZSAnLi9UaGlydGVlbidcblxuIyB0ZW1wXG5CVUlMRF9USU1FU1RBTVAgPSBcIjEuMTVcIlxuXG5SZW5kZXJNb2RlID1cbiAgR0FNRTogMFxuICBIT1dUTzogMVxuICBBQ0hJRVZFTUVOVFM6IDJcbiAgUEFVU0U6IDNcbiAgT1BUSU9OUzogNFxuXG5jbGFzcyBHYW1lXG4gIGNvbnN0cnVjdG9yOiAoQG5hdGl2ZSwgQHdpZHRoLCBAaGVpZ2h0KSAtPlxuICAgIEB2ZXJzaW9uID0gQlVJTERfVElNRVNUQU1QXG4gICAgQGxvZyhcIkdhbWUgY29uc3RydWN0ZWQ6ICN7QHdpZHRofXgje0BoZWlnaHR9XCIpXG4gICAgQGZvbnRSZW5kZXJlciA9IG5ldyBGb250UmVuZGVyZXIgdGhpc1xuICAgIEBzcHJpdGVSZW5kZXJlciA9IG5ldyBTcHJpdGVSZW5kZXJlciB0aGlzXG4gICAgQGZvbnQgPSBcImRhcmtmb3Jlc3RcIlxuICAgIEB6b25lcyA9IFtdXG4gICAgQG5leHRBSVRpY2sgPSAxMDAwICMgd2lsbCBiZSBzZXQgYnkgb3B0aW9uc1xuICAgIEBjZW50ZXIgPVxuICAgICAgeDogQHdpZHRoIC8gMlxuICAgICAgeTogQGhlaWdodCAvIDJcbiAgICBAYWFIZWlnaHQgPSBAd2lkdGggKiA5IC8gMTZcbiAgICBAbG9nIFwiaGVpZ2h0OiAje0BoZWlnaHR9LiBoZWlnaHQgaWYgc2NyZWVuIHdhcyAxNjo5IChhc3BlY3QgYWRqdXN0ZWQpOiAje0BhYUhlaWdodH1cIlxuICAgIEBwYXVzZUJ1dHRvblNpemUgPSBAYWFIZWlnaHQgLyAxNVxuICAgIEBjb2xvcnMgPVxuICAgICAgYXJyb3c6ICAgICAgeyByOiAgIDEsIGc6ICAgMSwgYjogICAxLCBhOiAgIDEgfVxuICAgICAgYXJyb3djbG9zZTogeyByOiAgIDEsIGc6IDAuNSwgYjogICAwLCBhOiAwLjMgfVxuICAgICAgYmFja2dyb3VuZDogeyByOiAgIDAsIGc6IDAuMiwgYjogICAwLCBhOiAgIDEgfVxuICAgICAgYmlkOiAgICAgICAgeyByOiAgIDAsIGc6IDAuNiwgYjogICAwLCBhOiAgIDEgfVxuICAgICAgYmxhY2s6ICAgICAgeyByOiAgIDAsIGc6ICAgMCwgYjogICAwLCBhOiAgIDEgfVxuICAgICAgYnV0dG9udGV4dDogeyByOiAgIDEsIGc6ICAgMSwgYjogICAxLCBhOiAgIDEgfVxuICAgICAgZ2FtZV9vdmVyOiAgeyByOiAgIDEsIGc6IDAuNSwgYjogICAwLCBhOiAgIDEgfVxuICAgICAgZ29sZDogICAgICAgeyByOiAgIDEsIGc6ICAgMSwgYjogICAwLCBhOiAgIDEgfVxuICAgICAgaGFuZF9hbnk6ICAgeyByOiAgIDAsIGc6ICAgMCwgYjogMC4yLCBhOiAxLjAgfVxuICAgICAgaGFuZF9waWNrOiAgeyByOiAgIDAsIGc6IDAuMSwgYjogICAwLCBhOiAxLjAgfVxuICAgICAgaGFuZF9kcmFnOiAgeyByOiAwLjQsIGc6ICAgMCwgYjogICAwLCBhOiAxLjAgfVxuICAgICAgaGFuZF9wdXNoOiAgeyByOiAwLjIsIGc6ICAgMCwgYjogMC4yLCBhOiAxLjAgfVxuICAgICAgbGlnaHRncmF5OiAgeyByOiAwLjUsIGc6IDAuNSwgYjogMC41LCBhOiAgIDEgfVxuICAgICAgbG9nYmc6ICAgICAgeyByOiAwLjEsIGc6ICAgMCwgYjogICAwLCBhOiAgIDEgfVxuICAgICAgbG9nY29sb3I6ICAgeyByOiAwLjUsIGc6IDAuNSwgYjogMC41LCBhOiAgIDEgfVxuICAgICAgbWFpbm1lbnU6ICAgeyByOiAwLjEsIGc6IDAuMSwgYjogMC4xLCBhOiAgIDEgfVxuICAgICAgb3JhbmdlOiAgICAgeyByOiAgIDEsIGc6IDAuNSwgYjogICAwLCBhOiAgIDEgfVxuICAgICAgb3ZlcmxheTogICAgeyByOiAgIDAsIGc6ICAgMCwgYjogICAwLCBhOiAwLjYgfVxuICAgICAgcGF1c2VtZW51OiAgeyByOiAwLjEsIGc6IDAuMCwgYjogMC4xLCBhOiAgIDEgfVxuICAgICAgb3B0aW9ubWVudTogeyByOiAwLjAsIGc6IDAuMSwgYjogMC4xLCBhOiAgIDEgfVxuICAgICAgcGlsZTogICAgICAgeyByOiAwLjQsIGc6IDAuMiwgYjogICAwLCBhOiAgIDEgfVxuICAgICAgcGxheV9hZ2FpbjogeyByOiAgIDAsIGc6ICAgMCwgYjogICAwLCBhOiAwLjYgfVxuICAgICAgcmVkOiAgICAgICAgeyByOiAgIDEsIGc6ICAgMCwgYjogICAwLCBhOiAgIDEgfVxuICAgICAgd2hpdGU6ICAgICAgeyByOiAgIDEsIGc6ICAgMSwgYjogICAxLCBhOiAgIDEgfVxuICAgICAgYWNoX2JnOiAgICAgeyByOiAwLjEsIGc6IDAuMSwgYjogMC4xLCBhOiAgIDEgfVxuICAgICAgYWNoX2hlYWRlcjogeyByOiAgIDEsIGc6IDAuNSwgYjogICAwLCBhOiAgIDEgfVxuICAgICAgYWNoX3RpdGxlOiAgeyByOiAgIDEsIGc6ICAgMSwgYjogICAxLCBhOiAgIDEgfVxuICAgICAgYWNoX2Rlc2M6ICAgeyByOiAwLjcsIGc6IDAuNywgYjogMC43LCBhOiAgIDEgfVxuXG4gICAgQHRleHR1cmVzID1cbiAgICAgIFwiY2FyZHNcIjogMFxuICAgICAgXCJkYXJrZm9yZXN0XCI6IDFcbiAgICAgIFwiY2hhcnNcIjogMlxuICAgICAgXCJob3d0bzFcIjogM1xuXG4gICAgQHRoaXJ0ZWVuID0gbnVsbFxuICAgIEBsYXN0RXJyID0gJydcbiAgICBAcmVuZGVyTW9kZSA9IFJlbmRlck1vZGUuR0FNRVxuICAgIEByZW5kZXJDb21tYW5kcyA9IFtdXG4gICAgQGFjaGlldmVtZW50RmFuZmFyZSA9IG51bGxcblxuICAgIEBvcHRpb25NZW51cyA9XG4gICAgICBzcGVlZHM6IFtcbiAgICAgICAgeyB0ZXh0OiBcIkFJIFNwZWVkOiBTbG93XCIsIHNwZWVkOiAyMDAwIH1cbiAgICAgICAgeyB0ZXh0OiBcIkFJIFNwZWVkOiBNZWRpdW1cIiwgc3BlZWQ6IDEwMDAgfVxuICAgICAgICB7IHRleHQ6IFwiQUkgU3BlZWQ6IEZhc3RcIiwgc3BlZWQ6IDUwMCB9XG4gICAgICAgIHsgdGV4dDogXCJBSSBTcGVlZDogVWx0cmFcIiwgc3BlZWQ6IDI1MCB9XG4gICAgICBdXG4gICAgICBzb3J0czogW1xuICAgICAgICB7IHRleHQ6IFwiU29ydCBPcmRlcjogTm9ybWFsXCIgfVxuICAgICAgICB7IHRleHQ6IFwiU29ydCBPcmRlcjogUmV2ZXJzZVwiIH1cbiAgICAgIF1cbiAgICAgIGF1dG9wYXNzZXM6IFtcbiAgICAgICAgeyB0ZXh0OiBcIkF1dG9QYXNzOiBEaXNhYmxlZFwiIH1cbiAgICAgICAgeyB0ZXh0OiBcIkF1dG9QYXNzOiBGdWxsXCIgfVxuICAgICAgICB7IHRleHQ6IFwiQXV0b1Bhc3M6IExpbWl0ZWRcIiB9XG4gICAgICBdXG4gICAgQG9wdGlvbnMgPVxuICAgICAgc3BlZWRJbmRleDogMVxuICAgICAgc29ydEluZGV4OiAwXG4gICAgICBzb3VuZDogdHJ1ZVxuICAgICAgYXV0b3Bhc3NJbmRleDogMlxuICAgICAgcHVzaFNvcnRpbmc6IGZhbHNlXG4gICAgICBnaXZpbmdVcDogdHJ1ZVxuXG4gICAgQHBhdXNlTWVudSA9IG5ldyBNZW51IHRoaXMsIFwiUGF1c2VkXCIsIFwic29saWRcIiwgQGNvbG9ycy5wYXVzZW1lbnUsIFtcbiAgICAgIChjbGljaykgPT5cbiAgICAgICAgaWYgY2xpY2tcbiAgICAgICAgICBAcmVuZGVyTW9kZSA9IFJlbmRlck1vZGUuR0FNRVxuICAgICAgICByZXR1cm4gXCJSZXN1bWUgR2FtZVwiXG4gICAgICAoY2xpY2spID0+XG4gICAgICAgIGlmIGNsaWNrXG4gICAgICAgICAgQHJlbmRlck1vZGUgPSBSZW5kZXJNb2RlLk9QVElPTlNcbiAgICAgICAgcmV0dXJuIFwiT3B0aW9uc1wiXG4gICAgICAoY2xpY2spID0+XG4gICAgICAgIGlmIGNsaWNrXG4gICAgICAgICAgQHJlbmRlck1vZGUgPSBSZW5kZXJNb2RlLkFDSElFVkVNRU5UU1xuICAgICAgICByZXR1cm4gXCJBY2hpZXZlbWVudHNcIlxuICAgICAgKGNsaWNrKSA9PlxuICAgICAgICBpZiBjbGlja1xuICAgICAgICAgIEByZW5kZXJNb2RlID0gUmVuZGVyTW9kZS5IT1dUT1xuICAgICAgICByZXR1cm4gXCJIb3cgVG8gUGxheVwiXG4gICAgICAoY2xpY2spID0+XG4gICAgICAgIGlmIGNsaWNrXG4gICAgICAgICAgQG5ld0dhbWUodHJ1ZSlcbiAgICAgICAgICBAcmVuZGVyTW9kZSA9IFJlbmRlck1vZGUuR0FNRVxuICAgICAgICByZXR1cm4gXCJOZXcgTW9uZXkgR2FtZVwiXG4gICAgICAoY2xpY2spID0+XG4gICAgICAgIGlmIGNsaWNrXG4gICAgICAgICAgQG5ld0dhbWUoZmFsc2UpXG4gICAgICAgICAgQHJlbmRlck1vZGUgPSBSZW5kZXJNb2RlLkdBTUVcbiAgICAgICAgcmV0dXJuIFwiTmV3IEdhbWVcIlxuICAgIF1cblxuICAgIEBvcHRpb25NZW51ID0gbmV3IE1lbnUgdGhpcywgXCJPcHRpb25zXCIsIFwic29saWRcIiwgQGNvbG9ycy5vcHRpb25tZW51LCBbXG4gICAgICAoY2xpY2spID0+XG4gICAgICAgIGlmIGNsaWNrXG4gICAgICAgICAgQG9wdGlvbnMuc3BlZWRJbmRleCA9IChAb3B0aW9ucy5zcGVlZEluZGV4ICsgMSkgJSBAb3B0aW9uTWVudXMuc3BlZWRzLmxlbmd0aFxuICAgICAgICByZXR1cm4gQG9wdGlvbk1lbnVzLnNwZWVkc1tAb3B0aW9ucy5zcGVlZEluZGV4XS50ZXh0XG4gICAgICAoY2xpY2spID0+XG4gICAgICAgIGlmIGNsaWNrXG4gICAgICAgICAgQG9wdGlvbnMuYXV0b3Bhc3NJbmRleCA9IChAb3B0aW9ucy5hdXRvcGFzc0luZGV4ICsgMSkgJSBAb3B0aW9uTWVudXMuYXV0b3Bhc3Nlcy5sZW5ndGhcbiAgICAgICAgcmV0dXJuIEBvcHRpb25NZW51cy5hdXRvcGFzc2VzW0BvcHRpb25zLmF1dG9wYXNzSW5kZXhdLnRleHRcbiAgICAgIChjbGljaykgPT5cbiAgICAgICAgaWYgY2xpY2tcbiAgICAgICAgICBAb3B0aW9ucy5zb3J0SW5kZXggPSAoQG9wdGlvbnMuc29ydEluZGV4ICsgMSkgJSBAb3B0aW9uTWVudXMuc29ydHMubGVuZ3RoXG4gICAgICAgIHJldHVybiBAb3B0aW9uTWVudXMuc29ydHNbQG9wdGlvbnMuc29ydEluZGV4XS50ZXh0XG4gICAgICAoY2xpY2spID0+XG4gICAgICAgIGlmIGNsaWNrXG4gICAgICAgICAgQG9wdGlvbnMuZ2l2aW5nVXAgPSAhQG9wdGlvbnMuZ2l2aW5nVXBcbiAgICAgICAgaWYgQG9wdGlvbnMuZ2l2aW5nVXBcbiAgICAgICAgICByZXR1cm4gXCJHaXZpbmcgVXA6IEVuYWJsZWRcIlxuICAgICAgICByZXR1cm4gXCJHaXZpbmcgVXA6IERpc2FibGVkXCJcbiAgICAgIChjbGljaykgPT5cbiAgICAgICAgaWYgY2xpY2tcbiAgICAgICAgICBAb3B0aW9ucy5wdXNoU29ydGluZyA9ICFAb3B0aW9ucy5wdXNoU29ydGluZ1xuICAgICAgICBpZiBAb3B0aW9ucy5wdXNoU29ydGluZ1xuICAgICAgICAgIHJldHVybiBcIlB1c2ggU29ydGluZzogRW5hYmxlZFwiXG4gICAgICAgIHJldHVybiBcIlB1c2ggU29ydGluZzogRGlzYWJsZWRcIlxuICAgICAgKGNsaWNrKSA9PlxuICAgICAgICBpZiBjbGlja1xuICAgICAgICAgIEByZW5kZXJNb2RlID0gUmVuZGVyTW9kZS5QQVVTRVxuICAgICAgICByZXR1cm4gXCJCYWNrXCJcbiAgICBdXG5cbiAgICBAdGhpcnRlZW4gPSBuZXcgVGhpcnRlZW4gdGhpcywge31cbiAgICBAbG9nIFwicGxheWVyIDAncyBoYW5kOiBcIiArIEpTT04uc3RyaW5naWZ5KEB0aGlydGVlbi5wbGF5ZXJzWzBdLmhhbmQpXG4gICAgQHByZXBhcmVHYW1lKClcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgbG9nZ2luZ1xuXG4gIGxvZzogKHMpIC0+XG4gICAgQG5hdGl2ZS5sb2cocylcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgbG9hZCAvIHNhdmVcblxuICBsb2FkOiAoanNvbikgLT5cbiAgICBAbG9nIFwiKENTKSBsb2FkaW5nIHN0YXRlXCJcbiAgICB0cnlcbiAgICAgIHN0YXRlID0gSlNPTi5wYXJzZSBqc29uXG4gICAgY2F0Y2hcbiAgICAgIEBsb2cgXCJsb2FkIGZhaWxlZCB0byBwYXJzZSBzdGF0ZTogI3tqc29ufVwiXG4gICAgICByZXR1cm5cbiAgICBpZiBzdGF0ZS5vcHRpb25zXG4gICAgICBmb3IgaywgdiBvZiBzdGF0ZS5vcHRpb25zXG4gICAgICAgIEBvcHRpb25zW2tdID0gdlxuXG4gICAgaWYgc3RhdGUudGhpcnRlZW5cbiAgICAgIEBsb2cgXCJyZWNyZWF0aW5nIGdhbWUgZnJvbSBzYXZlZGF0YVwiXG4gICAgICBAdGhpcnRlZW4gPSBuZXcgVGhpcnRlZW4gdGhpcywge1xuICAgICAgICBzdGF0ZTogc3RhdGUudGhpcnRlZW5cbiAgICAgIH1cbiAgICAgIEBwcmVwYXJlR2FtZSgpXG5cbiAgc2F2ZTogLT5cbiAgICAjIEBsb2cgXCIoQ1MpIHNhdmluZyBzdGF0ZVwiXG4gICAgc3RhdGUgPSB7XG4gICAgICBvcHRpb25zOiBAb3B0aW9uc1xuICAgIH1cblxuICAgIGlmIEB0aGlydGVlbj9cbiAgICAgIEB0aGlydGVlbi51cGRhdGVQbGF5ZXJIYW5kKEBoYW5kLmNhcmRzKVxuICAgICAgc3RhdGUudGhpcnRlZW4gPSBAdGhpcnRlZW4uc2F2ZSgpXG5cbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkgc3RhdGVcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgYWlUaWNrUmF0ZTogLT5cbiAgICByZXR1cm4gQG9wdGlvbk1lbnVzLnNwZWVkc1tAb3B0aW9ucy5zcGVlZEluZGV4XS5zcGVlZFxuXG4gIG5ld0dhbWU6IChtb25leSkgLT5cbiAgICBAdGhpcnRlZW4ubmV3R2FtZShtb25leSlcbiAgICBAcHJlcGFyZUdhbWUoKVxuXG4gIHByZXBhcmVHYW1lOiAtPlxuICAgIEBoYW5kID0gbmV3IEhhbmQgdGhpc1xuICAgIEBwaWxlID0gbmV3IFBpbGUgdGhpcywgQGhhbmRcbiAgICBAaGFuZC5zZXQgQHRoaXJ0ZWVuLnBsYXllcnNbMF0uaGFuZFxuICAgIEBsYXN0RXJyID0gJydcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgaW5wdXQgaGFuZGxpbmdcblxuICB0b3VjaERvd246ICh4LCB5KSAtPlxuICAgICMgQGxvZyhcInRvdWNoRG93biAje3h9LCN7eX1cIilcbiAgICBAY2hlY2tab25lcyh4LCB5KVxuXG4gIHRvdWNoTW92ZTogKHgsIHkpIC0+XG4gICAgIyBAbG9nKFwidG91Y2hNb3ZlICN7eH0sI3t5fVwiKVxuICAgIGlmIEB0aGlydGVlbiAhPSBudWxsXG4gICAgICBAaGFuZC5tb3ZlKHgsIHkpXG5cbiAgdG91Y2hVcDogKHgsIHkpIC0+XG4gICAgIyBAbG9nKFwidG91Y2hVcCAje3h9LCN7eX1cIilcbiAgICBpZiBAdGhpcnRlZW4gIT0gbnVsbFxuICAgICAgQGhhbmQudXAoeCwgeSlcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgaGVhZGxpbmUgKGdhbWUgc3RhdGUgaW4gdG9wIGxlZnQpXG5cbiAgcHJldHR5RXJyb3JUYWJsZToge1xuICAgICAgZ2FtZU92ZXI6ICAgICAgICAgICBcIlRoZSBnYW1lIGlzIG92ZXIuXCJcbiAgICAgIGludmFsaWRQbGF5OiAgICAgICAgXCJOb3QgYSB2YWxpZCBwbGF5LlwiXG4gICAgICBtdXN0QnJlYWtPclBhc3M6ICAgIFwiWW91IHBhc3NlZCBhbHJlYWR5LCBzbyAyLWJyZWFrZXIgb3IgcGFzcy5cIlxuICAgICAgbXVzdFBhc3M6ICAgICAgICAgICBcIllvdSBtdXN0IHBhc3MuXCJcbiAgICAgIG11c3RUaHJvdzNTOiAgICAgICAgXCJZb3UgbXVzdCB1c2UgdGhlIDNcXHhjOCBpbiB5b3VyIHBsYXkuXCJcbiAgICAgIG5vdFlvdXJUdXJuOiAgICAgICAgXCJJdCBpcyBub3QgeW91ciB0dXJuLlwiXG4gICAgICB0aHJvd0FueXRoaW5nOiAgICAgIFwiWW91IGhhdmUgY29udHJvbCwgdGhyb3cgYW55dGhpbmcuXCJcbiAgICAgIHRvb0xvd1BsYXk6ICAgICAgICAgXCJUaGlzIHBsYXkgaXMgbm90IHN0cm9uZ2VyIHRoYW4gdGhlIGN1cnJlbnQgcGxheS5cIlxuICAgICAgd3JvbmdQbGF5OiAgICAgICAgICBcIlRoaXMgcGxheSBkb2VzIG5vdCBtYXRjaCB0aGUgY3VycmVudCBwbGF5LlwiXG4gIH1cblxuICBwcmV0dHlFcnJvcjogLT5cbiAgICBwcmV0dHkgPSBAcHJldHR5RXJyb3JUYWJsZVtAbGFzdEVycl1cbiAgICByZXR1cm4gcHJldHR5IGlmIHByZXR0eVxuICAgIHJldHVybiBAbGFzdEVyclxuXG4gIGNhbGNIZWFkbGluZTogLT5cbiAgICByZXR1cm4gXCJcIiBpZiBAdGhpcnRlZW4gPT0gbnVsbFxuXG4gICAgaGVhZGxpbmUgPSBAdGhpcnRlZW4uaGVhZGxpbmUoKVxuICAgICMgc3dpdGNoIEB0aGlydGVlbi5zdGF0ZVxuICAgICMgICB3aGVuIFN0YXRlLkJJRFxuICAgICMgICAgIGhlYWRsaW5lID0gXCJXYWl0aW5nIGZvciBgZmY3NzAwYCN7QHRoaXJ0ZWVuLnBsYXllcnNbQHRoaXJ0ZWVuLnR1cm5dLm5hbWV9YGAgdG8gYGZmZmYwMGBiaWRgYFwiXG4gICAgIyAgIHdoZW4gU3RhdGUuVFJJQ0tcbiAgICAjICAgICBoZWFkbGluZSA9IFwiV2FpdGluZyBmb3IgYGZmNzcwMGAje0B0aGlydGVlbi5wbGF5ZXJzW0B0aGlydGVlbi50dXJuXS5uYW1lfWBgIHRvIGBmZmZmMDBgcGxheWBgXCJcbiAgICAjICAgd2hlbiBTdGF0ZS5ST1VORFNVTU1BUllcbiAgICAjICAgICBoZWFkbGluZSA9IFwiV2FpdGluZyBmb3IgbmV4dCByb3VuZC4uLlwiXG4gICAgIyAgIHdoZW4gU3RhdGUuUE9TVEdBTUVTVU1NQVJZXG4gICAgIyAgICAgaGVhZGxpbmUgPSBcIkdhbWUgb3ZlciFcIlxuXG4gICAgZXJyVGV4dCA9IFwiXCJcbiAgICBpZiAoQGxhc3RFcnIubGVuZ3RoID4gMCkgYW5kIChAbGFzdEVyciAhPSBPSylcbiAgICAgIGVyclRleHQgPSBcIiAgYGZmZmZmZmBFUlJPUjogYGZmMDAwMGAje0BwcmV0dHlFcnJvcigpfVwiXG4gICAgICBoZWFkbGluZSArPSBlcnJUZXh0XG5cbiAgICByZXR1cm4gaGVhZGxpbmVcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgZ2FtZSBvdmVyIGluZm9ybWF0aW9uXG5cbiAgZ2FtZU92ZXJUZXh0OiAtPlxuICAgIHdpbm5lciA9IEB0aGlydGVlbi53aW5uZXIoKVxuICAgIGZpcnN0TGluZSA9IFwiI3t3aW5uZXIubmFtZX0gd2lucyFcIlxuICAgIHNlY29uZExpbmUgPSBcIlRyeSBBZ2Fpbi4uLlwiXG4gICAgaWYgd2lubmVyLm5hbWUgPT0gXCJQbGF5ZXJcIlxuICAgICAgZmlyc3RMaW5lID0gXCJZb3Ugd2luIVwiXG4gICAgICBpZiBAdGhpcnRlZW4ubGFzdFN0cmVhayA9PSAxXG4gICAgICAgIHNlY29uZExpbmUgPSBcIkEgbmV3IHN0cmVhayFcIlxuICAgICAgZWxzZVxuICAgICAgICBzZWNvbmRMaW5lID0gXCIje0B0aGlydGVlbi5sYXN0U3RyZWFrfSBpbiBhIHJvdyFcIlxuICAgIGVsc2VcbiAgICAgIGlmIEB0aGlydGVlbi5sYXN0U3RyZWFrID09IDBcbiAgICAgICAgc2Vjb25kTGluZSA9IFwiVHJ5IGFnYWluLi4uXCJcbiAgICAgIGVsc2VcbiAgICAgICAgc2Vjb25kTGluZSA9IFwiU3RyZWFrIGVuZGVkOiAje0B0aGlydGVlbi5sYXN0U3RyZWFrfSB3aW5zXCJcbiAgICBpZiBAdGhpcnRlZW4uc29tZW9uZUdhdmVVcCgpXG4gICAgICBtb25leURlbHRhID0gQHRoaXJ0ZWVuLnBsYXllcnNbMF0ubW9uZXkgLSBUaGlydGVlbi5TVEFSVElOR19NT05FWVxuICAgICAgaWYgbW9uZXlEZWx0YSA+IDBcbiAgICAgICAgc2Vjb25kTGluZSA9IFwiR2FtZSBPdmVyOiBZb3Ugd29uICQje21vbmV5RGVsdGF9XCJcbiAgICAgIGVsc2UgaWYgbW9uZXlEZWx0YSA8IDBcbiAgICAgICAgc2Vjb25kTGluZSA9IFwiR2FtZSBPdmVyOiBZb3UgbG9zdCAkI3stMSAqIG1vbmV5RGVsdGF9XCJcbiAgICAgIGVsc2VcbiAgICAgICAgc2Vjb25kTGluZSA9IFwiR2FtZSBPdmVyOiBZb3UgYnJva2UgZXZlbiFcIlxuICAgIHJldHVybiBbZmlyc3RMaW5lLCBzZWNvbmRMaW5lXVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyBjYXJkIGhhbmRsaW5nXG5cbiAgcGFzczogLT5cbiAgICBAbGFzdEVyciA9IEB0aGlydGVlbi5wYXNzIHtcbiAgICAgIGlkOiAxXG4gICAgfVxuXG4gIHBsYXk6IChjYXJkcykgLT5cbiAgICBjb25zb2xlLmxvZyBcIihnYW1lKSBwbGF5aW5nIGNhcmRzXCIsIGNhcmRzXG5cbiAgICBAdGhpcnRlZW4udXBkYXRlUGxheWVySGFuZChAaGFuZC5jYXJkcylcblxuICAgIHJhd0NhcmRzID0gW11cbiAgICBmb3IgY2FyZCBpbiBjYXJkc1xuICAgICAgcmF3Q2FyZHMucHVzaCBjYXJkLmNhcmRcblxuICAgIHJldCA9IEB0aGlydGVlbi5wbGF5IHtcbiAgICAgIGlkOiAxXG4gICAgICBjYXJkczogcmF3Q2FyZHNcbiAgICB9XG4gICAgQGxhc3RFcnIgPSByZXRcbiAgICBpZiByZXQgPT0gT0tcbiAgICAgIEBoYW5kLnNldCBAdGhpcnRlZW4ucGxheWVyc1swXS5oYW5kXG4gICAgICBAcGlsZS5oaW50IGNhcmRzXG5cbiAgcGxheVBpY2tlZDogLT5cbiAgICBpZiBub3QgQGhhbmQucGlja2luZygpXG4gICAgICByZXR1cm5cbiAgICBjYXJkcyA9IEBoYW5kLnNlbGVjdGVkQ2FyZHMoKVxuICAgICMgQGhhbmQuc2VsZWN0Tm9uZSgpXG4gICAgaWYgY2FyZHMubGVuZ3RoID09IDBcbiAgICAgIHJldHVybiBAcGFzcygpXG4gICAgcmV0dXJuIEBwbGF5KGNhcmRzKVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyBtYWluIGxvb3BcblxuICB1cGRhdGU6IChkdCkgLT5cbiAgICBAem9uZXMubGVuZ3RoID0gMCAjIGZvcmdldCBhYm91dCB6b25lcyBmcm9tIHRoZSBsYXN0IGZyYW1lLiB3ZSdyZSBhYm91dCB0byBtYWtlIHNvbWUgbmV3IG9uZXMhXG5cbiAgICB1cGRhdGVkID0gZmFsc2VcbiAgICBpZiBAdXBkYXRlR2FtZShkdClcbiAgICAgIHVwZGF0ZWQgPSB0cnVlXG5cbiAgICByZXR1cm4gdXBkYXRlZFxuXG4gIHVwZGF0ZUdhbWU6IChkdCkgLT5cbiAgICByZXR1cm4gZmFsc2UgaWYgQHRoaXJ0ZWVuID09IG51bGxcblxuICAgIHVwZGF0ZWQgPSBmYWxzZVxuXG4gICAgaWYgQHBpbGUudXBkYXRlKGR0KVxuICAgICAgdXBkYXRlZCA9IHRydWVcbiAgICBpZiBAcGlsZS5yZWFkeUZvck5leHRUcmljaygpXG4gICAgICBAbmV4dEFJVGljayAtPSBkdFxuICAgICAgaWYgQG5leHRBSVRpY2sgPD0gMFxuICAgICAgICBAbmV4dEFJVGljayA9IEBhaVRpY2tSYXRlKClcbiAgICAgICAgaWYgQHRoaXJ0ZWVuLmFpVGljaygpXG4gICAgICAgICAgdXBkYXRlZCA9IHRydWVcbiAgICBpZiBAaGFuZC51cGRhdGUoZHQpXG4gICAgICB1cGRhdGVkID0gdHJ1ZVxuXG4gICAgQHBpbGUuc2V0IEB0aGlydGVlbi50aHJvd0lELCBAdGhpcnRlZW4ucGlsZSwgQHRoaXJ0ZWVuLnBpbGVXaG9cblxuICAgIGlmIEBwYXVzZU1lbnUudXBkYXRlKGR0KVxuICAgICAgdXBkYXRlZCA9IHRydWVcblxuICAgIGlmIEBvcHRpb25NZW51LnVwZGF0ZShkdClcbiAgICAgIHVwZGF0ZWQgPSB0cnVlXG5cbiAgICBpZiBAYWNoaWV2ZW1lbnRGYW5mYXJlICE9IG51bGxcbiAgICAgIEBhY2hpZXZlbWVudEZhbmZhcmUudGltZSArPSBkdFxuICAgICAgaWYgQGFjaGlldmVtZW50RmFuZmFyZS50aW1lID4gNTAwMFxuICAgICAgICBAYWNoaWV2ZW1lbnRGYW5mYXJlID0gbnVsbFxuICAgICAgdXBkYXRlZCA9IHRydWVcblxuICAgIGlmIEBhY2hpZXZlbWVudEZhbmZhcmUgPT0gbnVsbFxuICAgICAgaWYgQHRoaXJ0ZWVuLmZhbmZhcmVzLmxlbmd0aCA+IDBcbiAgICAgICAgQGFjaGlldmVtZW50RmFuZmFyZSA9XG4gICAgICAgICAgdGl0bGU6IEB0aGlydGVlbi5mYW5mYXJlcy5zaGlmdCgpXG4gICAgICAgICAgdGltZTogMFxuXG4gICAgcmV0dXJuIHVwZGF0ZWRcblxuICByZW5kZXI6IC0+XG4gICAgIyBSZXNldCByZW5kZXIgY29tbWFuZHNcbiAgICBAcmVuZGVyQ29tbWFuZHMubGVuZ3RoID0gMFxuXG4gICAgc3dpdGNoIEByZW5kZXJNb2RlXG4gICAgICB3aGVuIFJlbmRlck1vZGUuSE9XVE9cbiAgICAgICAgQHJlbmRlckhvd3RvKClcbiAgICAgIHdoZW4gUmVuZGVyTW9kZS5BQ0hJRVZFTUVOVFNcbiAgICAgICAgQHJlbmRlckFjaGlldmVtZW50cygpXG4gICAgICB3aGVuIFJlbmRlck1vZGUuT1BUSU9OU1xuICAgICAgICBAcmVuZGVyT3B0aW9ucygpXG4gICAgICB3aGVuIFJlbmRlck1vZGUuUEFVU0VcbiAgICAgICAgQHJlbmRlclBhdXNlKClcbiAgICAgIGVsc2VcbiAgICAgICAgQHJlbmRlckdhbWUoKVxuXG4gICAgcmV0dXJuIEByZW5kZXJDb21tYW5kc1xuXG4gIHJlbmRlclBhdXNlOiAtPlxuICAgIEBwYXVzZU1lbnUucmVuZGVyKClcblxuICByZW5kZXJPcHRpb25zOiAtPlxuICAgIEBvcHRpb25NZW51LnJlbmRlcigpXG5cbiAgcmVuZGVySG93dG86IC0+XG4gICAgaG93dG9UZXh0dXJlID0gXCJob3d0bzFcIlxuICAgIEBsb2cgXCJyZW5kZXJpbmcgI3tob3d0b1RleHR1cmV9XCJcbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwic29saWRcIiwgMCwgMCwgQHdpZHRoLCBAaGVpZ2h0LCAwLCAwLCAwLCBAY29sb3JzLmJsYWNrXG4gICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBob3d0b1RleHR1cmUsIDAsIDAsIEB3aWR0aCwgQGFhSGVpZ2h0LCAwLCAwLCAwLCBAY29sb3JzLndoaXRlLCA9PlxuICAgICAgQHJlbmRlck1vZGUgPSBSZW5kZXJNb2RlLlBBVVNFXG5cbiAgZGVidWc6IC0+XG4gICAgY29uc29sZS5sb2cgXCJkZWJ1ZyBhY2hcIlxuICAgIGNvbnNvbGUubG9nIEB0aGlydGVlbi5hY2hcbiAgICAjIEB0aGlydGVlbi5hY2guZWFybmVkID0ge31cbiAgICAjIEB0aGlydGVlbi5hY2guZWFybmVkLnZldGVyYW4gPSB0cnVlXG4gICAgIyBAdGhpcnRlZW4uYWNoLmVhcm5lZC50cnloYXJkID0gdHJ1ZVxuICAgICMgQHRoaXJ0ZWVuLmFjaC5lYXJuZWQuYnJlYWtlciA9IHRydWVcbiAgICAjIEB0aGlydGVlbi5hY2guZWFybmVkLmtlZXBpdGxvdyA9IHRydWVcbiAgICAjIEB0aGlydGVlbi5hY2guZWFybmVkLnN1aXRlZCA9IHRydWVcbiAgICAjIEB0aGlydGVlbi5hY2guZWFybmVkLnRvbnkgPSB0cnVlXG4gICAgIyBAdGhpcnRlZW4uYWNoLmVhcm5lZC5zYW1wbGVyID0gdHJ1ZVxuICAgICMgQHRoaXJ0ZWVuLmFjaC5lYXJuZWQudHJhZ2VkeSA9IHRydWVcbiAgICAjIEB0aGlydGVlbi5hY2guZWFybmVkLmluZG9taXRhYmxlID0gdHJ1ZVxuICAgICMgQHRoaXJ0ZWVuLmFjaC5lYXJuZWQucmVrdCA9IHRydWVcbiAgICAjIEB0aGlydGVlbi5hY2guZWFybmVkLmxhdGUgPSB0cnVlXG4gICAgIyBAdGhpcnRlZW4uYWNoLmVhcm5lZC5wYWlycyA9IHRydWVcblxuICAgICMgQHRoaXJ0ZWVuLmFjaC5zdGF0ZS50b3RhbEdhbWVzID0gMFxuICAgICMgQHRoaXJ0ZWVuLnN0cmVhayA9IDBcblxuICByZW5kZXJBY2hpZXZlbWVudHM6IC0+XG4gICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcInNvbGlkXCIsIDAsIDAsIEB3aWR0aCwgQGhlaWdodCwgMCwgMCwgMCwgQGNvbG9ycy5hY2hfYmcsID0+XG4gICAgICBAcmVuZGVyTW9kZSA9IFJlbmRlck1vZGUuUEFVU0VcblxuICAgIHRpdGxlSGVpZ2h0ID0gQGhlaWdodCAvIDIwXG4gICAgdGl0bGVPZmZzZXQgPSB0aXRsZUhlaWdodCAvIDJcbiAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgdGl0bGVIZWlnaHQsIFwiQWNoaWV2ZW1lbnRzXCIsIEBjZW50ZXIueCwgdGl0bGVPZmZzZXQsIDAuNSwgMC41LCBAY29sb3JzLmFjaF9oZWFkZXJcblxuICAgIGltYWdlTWFyZ2luID0gQHdpZHRoIC8gMTVcbiAgICB0b3BIZWlnaHQgPSB0aXRsZUhlaWdodFxuICAgIHggPSBAd2lkdGggLyAxMjBcbiAgICB5ID0gdG9wSGVpZ2h0XG4gICAgdGl0bGVIZWlnaHQgPSBAaGVpZ2h0IC8gMjJcbiAgICBkZXNjSGVpZ2h0ID0gQGhlaWdodCAvIDMwXG4gICAgaW1hZ2VEaW0gPSB0aXRsZUhlaWdodCAqIDJcbiAgICBmb3IgYWNoLCBhY2hJbmRleCBpbiBhY2hpZXZlbWVudHNMaXN0XG4gICAgICBpY29uID0gXCJzdGFyX29mZlwiXG4gICAgICBpZiBAdGhpcnRlZW4uYWNoLmVhcm5lZFthY2guaWRdXG4gICAgICAgIGljb24gPSBcInN0YXJfb25cIlxuICAgICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBpY29uLCB4LCB5LCBpbWFnZURpbSwgaW1hZ2VEaW0sIDAsIDAsIDAsIEBjb2xvcnMud2hpdGVcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCB0aXRsZUhlaWdodCwgYWNoLnRpdGxlLCB4ICsgaW1hZ2VNYXJnaW4sIHksIDAsIDAsIEBjb2xvcnMuYWNoX3RpdGxlXG4gICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgZGVzY0hlaWdodCwgYWNoLmRlc2NyaXB0aW9uWzBdLCB4ICsgaW1hZ2VNYXJnaW4sIHkgKyB0aXRsZUhlaWdodCwgMCwgMCwgQGNvbG9ycy5hY2hfZGVzY1xuICAgICAgaWYgYWNoLnByb2dyZXNzP1xuICAgICAgICBwcm9ncmVzcyA9IGFjaC5wcm9ncmVzcyhAdGhpcnRlZW4uYWNoKVxuICAgICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgZGVzY0hlaWdodCwgcHJvZ3Jlc3MsIHggKyBpbWFnZU1hcmdpbiwgeSArIHRpdGxlSGVpZ2h0ICsgZGVzY0hlaWdodCwgMCwgMCwgQGNvbG9ycy5hY2hfZGVzY1xuICAgICAgZWxzZVxuICAgICAgICBpZiBhY2guZGVzY3JpcHRpb24ubGVuZ3RoID4gMVxuICAgICAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCBkZXNjSGVpZ2h0LCBhY2guZGVzY3JpcHRpb25bMV0sIHggKyBpbWFnZU1hcmdpbiwgeSArIHRpdGxlSGVpZ2h0ICsgZGVzY0hlaWdodCwgMCwgMCwgQGNvbG9ycy5hY2hfZGVzY1xuICAgICAgaWYgYWNoSW5kZXggPT0gNlxuICAgICAgICB5ID0gdG9wSGVpZ2h0XG4gICAgICAgIHggKz0gQHdpZHRoIC8gMlxuICAgICAgZWxzZVxuICAgICAgICB5ICs9IHRpdGxlSGVpZ2h0ICogM1xuXG4gIHJlbmRlckFJSGFuZDogKGhhbmQsIHgsIHksIG9mZnNldCkgLT5cbiAgICBzb3J0ZWQgPSBoYW5kLnNvcnQgKGEsIGIpIC0+IGEgLSBiXG4gICAgZm9yIHJhdywgaSBpbiBzb3J0ZWRcbiAgICAgIEBoYW5kLnJlbmRlckNhcmQgcmF3LCB4ICsgKGkgKiBvZmZzZXQpLCB5LCAwLCAwLjcsIDBcblxuICByZW5kZXJHYW1lOiAtPlxuXG4gICAgIyBiYWNrZ3JvdW5kXG4gICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcInNvbGlkXCIsIDAsIDAsIEB3aWR0aCwgQGhlaWdodCwgMCwgMCwgMCwgQGNvbG9ycy5iYWNrZ3JvdW5kXG5cbiAgICB0ZXh0SGVpZ2h0ID0gQGFhSGVpZ2h0IC8gMjVcbiAgICB0ZXh0UGFkZGluZyA9IHRleHRIZWlnaHQgLyA1XG4gICAgY2hhcmFjdGVySGVpZ2h0ID0gQGFhSGVpZ2h0IC8gNVxuICAgIGNvdW50SGVpZ2h0ID0gdGV4dEhlaWdodFxuXG4gICAgZHJhd0dhbWVPdmVyID0gQHRoaXJ0ZWVuLmdhbWVPdmVyKCkgYW5kIEBwaWxlLnJlc3RpbmcoKVxuXG4gICAgIyBMb2dcbiAgICBmb3IgbGluZSwgaSBpbiBAdGhpcnRlZW4ubG9nXG4gICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgdGV4dEhlaWdodCwgbGluZSwgMCwgKGkrMS41KSAqICh0ZXh0SGVpZ2h0ICsgdGV4dFBhZGRpbmcpLCAwLCAwLCBAY29sb3JzLmxvZ2NvbG9yXG5cbiAgICBhaVBsYXllcnMgPSBbXG4gICAgICBAdGhpcnRlZW4ucGxheWVyc1sxXVxuICAgICAgQHRoaXJ0ZWVuLnBsYXllcnNbMl1cbiAgICAgIEB0aGlydGVlbi5wbGF5ZXJzWzNdXG4gICAgXVxuXG4gICAgY2hhcmFjdGVyTWFyZ2luID0gY2hhcmFjdGVySGVpZ2h0IC8gMlxuICAgIEBjaGFyQ2VpbGluZyA9IEBoZWlnaHQgKiAwLjZcblxuICAgIGFpQ2FyZFNwYWNpbmcgPSBAd2lkdGggKiAwLjAxNVxuXG4gICAgIyBsZWZ0IHNpZGVcbiAgICBpZiBhaVBsYXllcnNbMF0gIT0gbnVsbFxuICAgICAgaWYgZHJhd0dhbWVPdmVyXG4gICAgICAgIEByZW5kZXJBSUhhbmQgYWlQbGF5ZXJzWzBdLmhhbmQsIEB3aWR0aCAqIDAuMiwgQGhlaWdodCAqIDAuNjIsIGFpQ2FyZFNwYWNpbmdcblxuICAgICAgY2hhcmFjdGVyID0gYWlDaGFyYWN0ZXJzW2FpUGxheWVyc1swXS5jaGFySURdXG4gICAgICBjaGFyYWN0ZXJXaWR0aCA9IEBzcHJpdGVSZW5kZXJlci5jYWxjV2lkdGgoY2hhcmFjdGVyLnNwcml0ZSwgY2hhcmFjdGVySGVpZ2h0KVxuICAgICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBjaGFyYWN0ZXIuc3ByaXRlLCBjaGFyYWN0ZXJNYXJnaW4sIEBjaGFyQ2VpbGluZywgMCwgY2hhcmFjdGVySGVpZ2h0LCAwLCAwLCAxLCBAY29sb3JzLndoaXRlLCA9PlxuICAgICAgICAjIEBkZWJ1ZygpXG4gICAgICBAcmVuZGVyQ291bnQgYWlQbGF5ZXJzWzBdLCBAdGhpcnRlZW4ubW9uZXksIGRyYXdHYW1lT3ZlciwgYWlQbGF5ZXJzWzBdLmluZGV4ID09IEB0aGlydGVlbi50dXJuLCBjb3VudEhlaWdodCwgY2hhcmFjdGVyTWFyZ2luICsgKGNoYXJhY3RlcldpZHRoIC8gMiksIEBjaGFyQ2VpbGluZyAtIHRleHRQYWRkaW5nLCAwLjUsIDBcblxuICAgICMgdG9wIHNpZGVcbiAgICBpZiBhaVBsYXllcnNbMV0gIT0gbnVsbFxuICAgICAgaWYgZHJhd0dhbWVPdmVyXG4gICAgICAgIEByZW5kZXJBSUhhbmQgYWlQbGF5ZXJzWzFdLmhhbmQsIEB3aWR0aCAqIDAuNiwgQGhlaWdodCAqIDAuMTgsIGFpQ2FyZFNwYWNpbmdcblxuICAgICAgY2hhcmFjdGVyID0gYWlDaGFyYWN0ZXJzW2FpUGxheWVyc1sxXS5jaGFySURdXG4gICAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIGNoYXJhY3Rlci5zcHJpdGUsIEBjZW50ZXIueCwgMCwgMCwgY2hhcmFjdGVySGVpZ2h0LCAwLCAwLjUsIDAsIEBjb2xvcnMud2hpdGVcbiAgICAgIEByZW5kZXJDb3VudCBhaVBsYXllcnNbMV0sIEB0aGlydGVlbi5tb25leSwgZHJhd0dhbWVPdmVyLCBhaVBsYXllcnNbMV0uaW5kZXggPT0gQHRoaXJ0ZWVuLnR1cm4sIGNvdW50SGVpZ2h0LCBAY2VudGVyLngsIGNoYXJhY3RlckhlaWdodCwgMC41LCAwXG5cbiAgICAjIHJpZ2h0IHNpZGVcbiAgICBpZiBhaVBsYXllcnNbMl0gIT0gbnVsbFxuICAgICAgaWYgZHJhd0dhbWVPdmVyXG4gICAgICAgIEByZW5kZXJBSUhhbmQgYWlQbGF5ZXJzWzJdLmhhbmQsIEB3aWR0aCAqIDAuNywgQGhlaWdodCAqIDAuNjIsIGFpQ2FyZFNwYWNpbmdcblxuICAgICAgY2hhcmFjdGVyID0gYWlDaGFyYWN0ZXJzW2FpUGxheWVyc1syXS5jaGFySURdXG4gICAgICBjaGFyYWN0ZXJXaWR0aCA9IEBzcHJpdGVSZW5kZXJlci5jYWxjV2lkdGgoY2hhcmFjdGVyLnNwcml0ZSwgY2hhcmFjdGVySGVpZ2h0KVxuICAgICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBjaGFyYWN0ZXIuc3ByaXRlLCBAd2lkdGggLSBjaGFyYWN0ZXJNYXJnaW4sIEBjaGFyQ2VpbGluZywgMCwgY2hhcmFjdGVySGVpZ2h0LCAwLCAxLCAxLCBAY29sb3JzLndoaXRlXG4gICAgICBAcmVuZGVyQ291bnQgYWlQbGF5ZXJzWzJdLCBAdGhpcnRlZW4ubW9uZXksIGRyYXdHYW1lT3ZlciwgYWlQbGF5ZXJzWzJdLmluZGV4ID09IEB0aGlydGVlbi50dXJuLCBjb3VudEhlaWdodCwgQHdpZHRoIC0gKGNoYXJhY3Rlck1hcmdpbiArIChjaGFyYWN0ZXJXaWR0aCAvIDIpKSwgQGNoYXJDZWlsaW5nIC0gdGV4dFBhZGRpbmcsIDAuNSwgMFxuXG4gICAgIyBjYXJkIGFyZWFcbiAgICBoYW5kQXJlYUhlaWdodCA9IDAuMjcgKiBAaGVpZ2h0XG4gICAgY2FyZEFyZWFUZXh0ID0gbnVsbFxuICAgIHN3aXRjaCBAaGFuZC5tb2RlXG4gICAgICB3aGVuIEhhbmQuUElDS0lOR1xuICAgICAgICBoYW5kYXJlYUNvbG9yID0gQGNvbG9ycy5oYW5kX3BpY2tcbiAgICAgICAgaWYgKEB0aGlydGVlbi50dXJuID09IDApIGFuZCAoQHRoaXJ0ZWVuLmV2ZXJ5b25lUGFzc2VkKCkgb3IgKEB0aGlydGVlbi5jdXJyZW50UGxheSA9PSBudWxsKSlcbiAgICAgICAgICBoYW5kYXJlYUNvbG9yID0gQGNvbG9ycy5oYW5kX2FueVxuICAgICAgICAgIGlmIEB0aGlydGVlbi5waWxlLmxlbmd0aCA9PSAwXG4gICAgICAgICAgICBjYXJkQXJlYVRleHQgPSAnQW55dGhpbmcgKDNcXHhjOCknXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgY2FyZEFyZWFUZXh0ID0gJ0FueXRoaW5nJ1xuICAgICAgd2hlbiBIYW5kLlBVU0hJTkdcbiAgICAgICAgaGFuZGFyZWFDb2xvciA9IEBjb2xvcnMuaGFuZF9wdXNoXG4gICAgICAgIGNhcmRBcmVhVGV4dCA9ICdTb3J0aW5nJ1xuICAgICAgZWxzZVxuICAgICAgICBjYXJkQXJlYVRleHQgPSAnRHJhZ2dpbmcnXG4gICAgICAgIGhhbmRhcmVhQ29sb3IgPSBAY29sb3JzLmhhbmRfZHJhZ1xuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJzb2xpZFwiLCAwLCBAaGVpZ2h0LCBAd2lkdGgsIGhhbmRBcmVhSGVpZ2h0LCAwLCAwLCAxLCBoYW5kYXJlYUNvbG9yLCA9PlxuICAgICAgQGhhbmQuY3ljbGVNb2RlKClcblxuICAgICMgcGlsZVxuICAgIHBpbGVEaW1lbnNpb24gPSBAaGVpZ2h0ICogMC40XG4gICAgcGlsZVNwcml0ZSA9IFwicGlsZVwiXG4gICAgaWYgKEB0aGlydGVlbi50dXJuID49IDApIGFuZCAoQHRoaXJ0ZWVuLnR1cm4gPD0gMylcbiAgICAgIHBpbGVTcHJpdGUgKz0gQHRoaXJ0ZWVuLnR1cm5cbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIHBpbGVTcHJpdGUsIEB3aWR0aCAvIDIsIEBoZWlnaHQgLyAyLCBwaWxlRGltZW5zaW9uLCBwaWxlRGltZW5zaW9uLCAwLCAwLjUsIDAuNSwgQGNvbG9ycy53aGl0ZSwgPT5cbiAgICAgIEBwbGF5UGlja2VkKClcbiAgICBAcGlsZS5yZW5kZXIoKVxuXG4gICAgQGhhbmQucmVuZGVyKClcblxuICAgIGlmIGRyYXdHYW1lT3ZlclxuICAgICAgIyBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwic29saWRcIiwgMCwgMCwgQHdpZHRoLCBAaGVpZ2h0IC0gaGFuZEFyZWFIZWlnaHQsIDAsIDAsIDAsIEBjb2xvcnMucGxheV9hZ2FpblxuXG4gICAgICBsaW5lcyA9IEBnYW1lT3ZlclRleHQoKVxuICAgICAgZ2FtZU92ZXJTaXplID0gQGFhSGVpZ2h0IC8gOFxuICAgICAgZ2FtZU92ZXJZID0gQGNlbnRlci55XG4gICAgICBpZiBsaW5lcy5sZW5ndGggPiAxXG4gICAgICAgIGdhbWVPdmVyWSAtPSAoZ2FtZU92ZXJTaXplID4+IDEpXG4gICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgZ2FtZU92ZXJTaXplLCBsaW5lc1swXSwgQGNlbnRlci54LCBnYW1lT3ZlclksIDAuNSwgMC41LCBAY29sb3JzLmdhbWVfb3ZlclxuICAgICAgaWYgbGluZXMubGVuZ3RoID4gMVxuICAgICAgICBnYW1lT3ZlclkgKz0gZ2FtZU92ZXJTaXplXG4gICAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCBnYW1lT3ZlclNpemUsIGxpbmVzWzFdLCBAY2VudGVyLngsIGdhbWVPdmVyWSwgMC41LCAwLjUsIEBjb2xvcnMuZ2FtZV9vdmVyXG5cbiAgICAgIHBsYXlBZ2FpblRleHQgPSBcIlBsYXkgQWdhaW5cIlxuICAgICAgaWYgQHRoaXJ0ZWVuLnNvbWVvbmVHYXZlVXAoKVxuICAgICAgICBwbGF5QWdhaW5UZXh0ID0gXCJOZXcgTW9uZXkgR2FtZVwiXG4gICAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwic29saWRcIiwgMCwgQGhlaWdodCwgQHdpZHRoLCBoYW5kQXJlYUhlaWdodCwgMCwgMCwgMSwgQGNvbG9ycy5wbGF5X2FnYWluLCA9PlxuICAgICAgICBpZiBAdGhpcnRlZW4uc29tZW9uZUdhdmVVcCgpXG4gICAgICAgICAgQHRoaXJ0ZWVuLm5ld0dhbWUodHJ1ZSwgdHJ1ZSkgIyBzcGVjaWFsIGNhc2U6IGFsbG93IHlvdSB0byBrZWVwIHlvdXIgc3RyZWFrcyBnb2luZ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgQHRoaXJ0ZWVuLmRlYWwoKVxuICAgICAgICBAcHJlcGFyZUdhbWUoKVxuXG4gICAgICByZXN0YXJ0UXVpdFNpemUgPSBAYWFIZWlnaHQgLyAxMlxuICAgICAgc2hhZG93RGlzdGFuY2UgPSByZXN0YXJ0UXVpdFNpemUgLyA4XG4gICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgcmVzdGFydFF1aXRTaXplLCBwbGF5QWdhaW5UZXh0LCBzaGFkb3dEaXN0YW5jZSArIEBjZW50ZXIueCwgc2hhZG93RGlzdGFuY2UgKyAoQGhlaWdodCAtIChoYW5kQXJlYUhlaWdodCAqIDAuNSkpLCAwLjUsIDEsIEBjb2xvcnMuYmxhY2tcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCByZXN0YXJ0UXVpdFNpemUsIHBsYXlBZ2FpblRleHQsIEBjZW50ZXIueCwgQGhlaWdodCAtIChoYW5kQXJlYUhlaWdodCAqIDAuNSksIDAuNSwgMSwgQGNvbG9ycy5nb2xkXG5cbiAgICBAcmVuZGVyQ291bnQgQHRoaXJ0ZWVuLnBsYXllcnNbMF0sIEB0aGlydGVlbi5tb25leSwgZHJhd0dhbWVPdmVyLCAwID09IEB0aGlydGVlbi50dXJuLCBjb3VudEhlaWdodCwgQGNlbnRlci54LCBAaGVpZ2h0LCAwLjUsIDFcblxuICAgICMgSGVhZGxpbmUgKGluY2x1ZGVzIGVycm9yKVxuICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCB0ZXh0SGVpZ2h0LCBAY2FsY0hlYWRsaW5lKCksIDAsIDAsIDAsIDAsIEBjb2xvcnMubGlnaHRncmF5XG5cbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwicGF1c2VcIiwgQHdpZHRoLCAwLCAwLCBAcGF1c2VCdXR0b25TaXplLCAwLCAxLCAwLCBAY29sb3JzLndoaXRlLCA9PlxuICAgICAgQHJlbmRlck1vZGUgPSBSZW5kZXJNb2RlLlBBVVNFXG5cbiAgICBpZiBjYXJkQXJlYVRleHQgIT0gbnVsbFxuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIHRleHRIZWlnaHQsIGNhcmRBcmVhVGV4dCwgMC4wMiAqIEB3aWR0aCwgQGhlaWdodCAtIGhhbmRBcmVhSGVpZ2h0LCAwLCAwLCBAY29sb3JzLndoaXRlXG5cbiAgICBpZiBAYWNoaWV2ZW1lbnRGYW5mYXJlICE9IG51bGxcbiAgICAgIGlmIEBhY2hpZXZlbWVudEZhbmZhcmUudGltZSA8IDEwMDBcbiAgICAgICAgb3BhY2l0eSA9IEBhY2hpZXZlbWVudEZhbmZhcmUudGltZSAvIDEwMDBcbiAgICAgIGVsc2UgaWYgQGFjaGlldmVtZW50RmFuZmFyZS50aW1lID4gNDAwMFxuICAgICAgICBvcGFjaXR5ID0gMSAtICgoQGFjaGlldmVtZW50RmFuZmFyZS50aW1lIC0gNDAwMCkgLyAxMDAwKVxuICAgICAgZWxzZVxuICAgICAgICBvcGFjaXR5ID0gMVxuICAgICAgY29sb3IgPSB7cjoxLCBnOjEsIGI6MSwgYTpvcGFjaXR5fVxuICAgICAgeCA9IEB3aWR0aCAqIDAuNlxuICAgICAgeSA9IDBcbiAgICAgIHhUZXh0ID0geCArIChAd2lkdGggKiAwLjA2KVxuICAgICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcImF1XCIsIHgsIHksIDAsIEBoZWlnaHQgLyAxMCwgMCwgMCwgMCwgY29sb3IsID0+XG4gICAgICAgIEBhY2hpZXZlbWVudEZhbmZhcmUgPSBudWxsXG4gICAgICAgIEByZW5kZXJNb2RlID0gUmVuZGVyTW9kZS5BQ0hJRVZFTUVOVFNcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCB0ZXh0SGVpZ2h0LCBcIkFjaGlldmVtZW50IEVhcm5lZFwiLCB4VGV4dCwgeSwgMCwgMCwgY29sb3JcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCB0ZXh0SGVpZ2h0LCBAYWNoaWV2ZW1lbnRGYW5mYXJlLnRpdGxlLCB4VGV4dCwgeSArIHRleHRIZWlnaHQsIDAsIDAsIGNvbG9yXG5cbiAgICByZXR1cm5cblxuICByZW5kZXJDb3VudDogKHBsYXllciwgbW9uZXksIGRyYXdHYW1lT3ZlciwgbXlUdXJuLCBjb3VudEhlaWdodCwgeCwgeSwgYW5jaG9yeCwgYW5jaG9yeSkgLT5cbiAgICBpZiBteVR1cm5cbiAgICAgIG5hbWVDb2xvciA9IFwiYGZmNzcwMGBcIlxuICAgIGVsc2VcbiAgICAgIG5hbWVDb2xvciA9IFwiXCJcbiAgICBuYW1lU3RyaW5nID0gXCIgI3tuYW1lQ29sb3J9I3twbGF5ZXIubmFtZX1gYFwiXG4gICAgaWYgbW9uZXlcbiAgICAgIHBsYXllci5tb25leSA/PSAwXG4gICAgICBuYW1lU3RyaW5nICs9IFwiOiAkIGBhYWZmYWFgI3twbGF5ZXIubW9uZXl9XCJcbiAgICBuYW1lU3RyaW5nICs9IFwiIFwiXG4gICAgY2FyZENvdW50ID0gcGxheWVyLmhhbmQubGVuZ3RoXG4gICAgaWYgZHJhd0dhbWVPdmVyIG9yIChjYXJkQ291bnQgPT0gMClcbiAgICAgIGlmIG1vbmV5XG4gICAgICAgIHBsYWNlU3RyaW5nID0gXCI0dGhcIlxuICAgICAgICBpZiBwbGF5ZXIucGxhY2UgPT0gMVxuICAgICAgICAgIHBsYWNlU3RyaW5nID0gXCIxc3RcIlxuICAgICAgICBlbHNlIGlmIHBsYXllci5wbGFjZSA9PSAyXG4gICAgICAgICAgcGxhY2VTdHJpbmcgPSBcIjJuZFwiXG4gICAgICAgIGVsc2UgaWYgcGxheWVyLnBsYWNlID09IDNcbiAgICAgICAgICBwbGFjZVN0cmluZyA9IFwiM3JkXCJcbiAgICAgICAgY291bnRTdHJpbmcgPSBcIiBgZmZhYWZmYCN7cGxhY2VTdHJpbmd9YGAgUGxhY2UgXCJcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgcGxheWVyLnBsYWNlID09IDFcbiAgICAgICAgICBjb3VudFN0cmluZyA9IFwiIGBmZmZmYWFgV2lubmVyYGAgXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGNvdW50U3RyaW5nID0gXCIgYGZmYWFmZmBMb3NlcmBgIFwiXG4gICAgZWxzZVxuICAgICAgY291bnRTdHJpbmcgPSBcIiBgZmZmZjMzYCN7Y2FyZENvdW50fWBgIGxlZnQgXCJcblxuICAgIG5hbWVTaXplID0gQGZvbnRSZW5kZXJlci5zaXplKEBmb250LCBjb3VudEhlaWdodCwgbmFtZVN0cmluZylcbiAgICBjb3VudFNpemUgPSBAZm9udFJlbmRlcmVyLnNpemUoQGZvbnQsIGNvdW50SGVpZ2h0LCBjb3VudFN0cmluZylcbiAgICBpZiBuYW1lU2l6ZS53ID4gY291bnRTaXplLndcbiAgICAgIGNvdW50U2l6ZS53ID0gbmFtZVNpemUud1xuICAgIGVsc2VcbiAgICAgIG5hbWVTaXplLncgPSBjb3VudFNpemUud1xuICAgIG5hbWVZID0geVxuICAgIGNvdW50WSA9IHlcbiAgICBib3hIZWlnaHQgPSBjb3VudFNpemUuaFxuICAgIGlmIHRydWUgIyBwbGF5ZXIuaWQgIT0gMVxuICAgICAgYm94SGVpZ2h0ICo9IDJcbiAgICAgIGlmIGFuY2hvcnkgPiAwXG4gICAgICAgIG5hbWVZIC09IGNvdW50SGVpZ2h0XG4gICAgICBlbHNlXG4gICAgICAgIGNvdW50WSArPSBjb3VudEhlaWdodFxuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJzb2xpZFwiLCB4LCB5LCBjb3VudFNpemUudywgYm94SGVpZ2h0LCAwLCBhbmNob3J4LCBhbmNob3J5LCBAY29sb3JzLm92ZXJsYXlcbiAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgY291bnRIZWlnaHQsIG5hbWVTdHJpbmcsIHgsIG5hbWVZLCBhbmNob3J4LCBhbmNob3J5LCBAY29sb3JzLndoaXRlXG4gICAgaWYgdHJ1ZSAjIHBsYXllci5pZCAhPSAxXG4gICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgY291bnRIZWlnaHQsIGNvdW50U3RyaW5nLCB4LCBjb3VudFksIGFuY2hvcngsIGFuY2hvcnksIEBjb2xvcnMud2hpdGVcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgcmVuZGVyaW5nIGFuZCB6b25lc1xuXG4gIGRyYXdJbWFnZTogKHRleHR1cmUsIHN4LCBzeSwgc3csIHNoLCBkeCwgZHksIGR3LCBkaCwgcm90LCBhbmNob3J4LCBhbmNob3J5LCByLCBnLCBiLCBhLCBjYikgLT5cbiAgICBAcmVuZGVyQ29tbWFuZHMucHVzaCBAdGV4dHVyZXNbdGV4dHVyZV0sIHN4LCBzeSwgc3csIHNoLCBkeCwgZHksIGR3LCBkaCwgcm90LCBhbmNob3J4LCBhbmNob3J5LCByLCBnLCBiLCBhXG5cbiAgICBpZiBjYj9cbiAgICAgICMgY2FsbGVyIHdhbnRzIHRvIHJlbWVtYmVyIHdoZXJlIHRoaXMgd2FzIGRyYXduLCBhbmQgd2FudHMgdG8gYmUgY2FsbGVkIGJhY2sgaWYgaXQgaXMgZXZlciB0b3VjaGVkXG4gICAgICAjIFRoaXMgaXMgY2FsbGVkIGEgXCJ6b25lXCIuIFNpbmNlIHpvbmVzIGFyZSB0cmF2ZXJzZWQgaW4gcmV2ZXJzZSBvcmRlciwgdGhlIG5hdHVyYWwgb3ZlcmxhcCBvZlxuICAgICAgIyBhIHNlcmllcyBvZiByZW5kZXJzIGlzIHJlc3BlY3RlZCBhY2NvcmRpbmdseS5cbiAgICAgIGFuY2hvck9mZnNldFggPSAtMSAqIGFuY2hvcnggKiBkd1xuICAgICAgYW5jaG9yT2Zmc2V0WSA9IC0xICogYW5jaG9yeSAqIGRoXG4gICAgICB6b25lID1cbiAgICAgICAgIyBjZW50ZXIgKFgsWSkgYW5kIHJldmVyc2VkIHJvdGF0aW9uLCB1c2VkIHRvIHB1dCB0aGUgY29vcmRpbmF0ZSBpbiBsb2NhbCBzcGFjZSB0byB0aGUgem9uZVxuICAgICAgICBjeDogIGR4XG4gICAgICAgIGN5OiAgZHlcbiAgICAgICAgcm90OiByb3QgKiAtMVxuICAgICAgICAjIHRoZSBheGlzIGFsaWduZWQgYm91bmRpbmcgYm94IHVzZWQgZm9yIGRldGVjdGlvbiBvZiBhIGxvY2Fsc3BhY2UgY29vcmRcbiAgICAgICAgbDogICBhbmNob3JPZmZzZXRYXG4gICAgICAgIHQ6ICAgYW5jaG9yT2Zmc2V0WVxuICAgICAgICByOiAgIGFuY2hvck9mZnNldFggKyBkd1xuICAgICAgICBiOiAgIGFuY2hvck9mZnNldFkgKyBkaFxuICAgICAgICAjIGNhbGxiYWNrIHRvIGNhbGwgaWYgdGhlIHpvbmUgaXMgY2xpY2tlZCBvblxuICAgICAgICBjYjogIGNiXG4gICAgICBAem9uZXMucHVzaCB6b25lXG5cbiAgY2hlY2tab25lczogKHgsIHkpIC0+XG4gICAgZm9yIHpvbmUgaW4gQHpvbmVzIGJ5IC0xXG4gICAgICAjIG1vdmUgY29vcmQgaW50byBzcGFjZSByZWxhdGl2ZSB0byB0aGUgcXVhZCwgdGhlbiByb3RhdGUgaXQgdG8gbWF0Y2hcbiAgICAgIHVucm90YXRlZExvY2FsWCA9IHggLSB6b25lLmN4XG4gICAgICB1bnJvdGF0ZWRMb2NhbFkgPSB5IC0gem9uZS5jeVxuICAgICAgbG9jYWxYID0gdW5yb3RhdGVkTG9jYWxYICogTWF0aC5jb3Moem9uZS5yb3QpIC0gdW5yb3RhdGVkTG9jYWxZICogTWF0aC5zaW4oem9uZS5yb3QpXG4gICAgICBsb2NhbFkgPSB1bnJvdGF0ZWRMb2NhbFggKiBNYXRoLnNpbih6b25lLnJvdCkgKyB1bnJvdGF0ZWRMb2NhbFkgKiBNYXRoLmNvcyh6b25lLnJvdClcbiAgICAgIGlmIChsb2NhbFggPCB6b25lLmwpIG9yIChsb2NhbFggPiB6b25lLnIpIG9yIChsb2NhbFkgPCB6b25lLnQpIG9yIChsb2NhbFkgPiB6b25lLmIpXG4gICAgICAgICMgb3V0c2lkZSBvZiBvcmllbnRlZCBib3VuZGluZyBib3hcbiAgICAgICAgY29udGludWVcbiAgICAgIHpvbmUuY2IoeCwgeSlcbiAgICAgIHJldHVybiB0cnVlXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVcbiIsIkFuaW1hdGlvbiA9IHJlcXVpcmUgJy4vQW5pbWF0aW9uJ1xuXG5DQVJEX0lNQUdFX1cgPSAxMjBcbkNBUkRfSU1BR0VfSCA9IDE2MlxuQ0FSRF9JTUFHRV9PRkZfWCA9IDRcbkNBUkRfSU1BR0VfT0ZGX1kgPSA0XG5DQVJEX0lNQUdFX0FEVl9YID0gQ0FSRF9JTUFHRV9XXG5DQVJEX0lNQUdFX0FEVl9ZID0gQ0FSRF9JTUFHRV9IXG5DQVJEX1JFTkRFUl9TQ0FMRSA9IDAuMzUgICAgICAgICAgICAgICAgICAjIGNhcmQgaGVpZ2h0IGNvZWZmaWNpZW50IGZyb20gdGhlIHNjcmVlbidzIGhlaWdodFxuQ0FSRF9IQU5EX0NVUlZFX0RJU1RfRkFDVE9SID0gMy41ICAgICAgICAgIyBmYWN0b3Igd2l0aCBzY3JlZW4gaGVpZ2h0IHRvIGZpZ3VyZSBvdXQgY2VudGVyIG9mIGFyYy4gYmlnZ2VyIG51bWJlciBpcyBsZXNzIGFyY1xuQ0FSRF9IT0xESU5HX1JPVF9PUkRFUiA9IE1hdGguUEkgLyAxMiAgICAgIyBkZXNpcmVkIHJvdGF0aW9uIG9mIHRoZSBjYXJkIHdoZW4gYmVpbmcgZHJhZ2dlZCBhcm91bmQgZm9yIG9yZGVyaW5nJ3Mgc2FrZVxuQ0FSRF9IT0xESU5HX1JPVF9QTEFZID0gLTEgKiBNYXRoLlBJIC8gMTIgIyBkZXNpcmVkIHJvdGF0aW9uIG9mIHRoZSBjYXJkIHdoZW4gYmVpbmcgZHJhZ2dlZCBhcm91bmQgd2l0aCBpbnRlbnQgdG8gcGxheVxuQ0FSRF9QTEFZX0NFSUxJTkcgPSAwLjYwICAgICAgICAgICAgICAgICAgIyBob3cgbXVjaCBvZiB0aGUgdG9wIG9mIHRoZSBzY3JlZW4gcmVwcmVzZW50cyBcIkkgd2FudCB0byBwbGF5IHRoaXNcIiB2cyBcIkkgd2FudCB0byByZW9yZGVyXCJcblxuTk9fQ0FSRCA9IC0xXG5cbkhpZ2hsaWdodCA9XG4gIE5PTkU6IC0xXG4gIFVOU0VMRUNURUQ6IDBcbiAgU0VMRUNURUQ6IDFcbiAgUElMRTogMlxuXG4jIHRha2VuIGZyb20gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMjExMjEyL2hvdy10by1jYWxjdWxhdGUtYW4tYW5nbGUtZnJvbS10aHJlZS1wb2ludHNcbiMgdXNlcyBsYXcgb2YgY29zaW5lcyB0byBmaWd1cmUgb3V0IHRoZSBoYW5kIGFyYyBhbmdsZVxuZmluZEFuZ2xlID0gKHAwLCBwMSwgcDIpIC0+XG4gICAgYSA9IE1hdGgucG93KHAxLnggLSBwMi54LCAyKSArIE1hdGgucG93KHAxLnkgLSBwMi55LCAyKVxuICAgIGIgPSBNYXRoLnBvdyhwMS54IC0gcDAueCwgMikgKyBNYXRoLnBvdyhwMS55IC0gcDAueSwgMilcbiAgICBjID0gTWF0aC5wb3cocDIueCAtIHAwLngsIDIpICsgTWF0aC5wb3cocDIueSAtIHAwLnksIDIpXG4gICAgcmV0dXJuIE1hdGguYWNvcyggKGErYi1jKSAvIE1hdGguc3FydCg0KmEqYikgKVxuXG5jYWxjRGlzdGFuY2UgPSAocDAsIHAxKSAtPlxuICByZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KHAxLnggLSBwMC54LCAyKSArIE1hdGgucG93KHAxLnkgLSBwMC55LCAyKSlcblxuY2FsY0Rpc3RhbmNlU3F1YXJlZCA9ICh4MCwgeTAsIHgxLCB5MSkgLT5cbiAgcmV0dXJuIE1hdGgucG93KHgxIC0geDAsIDIpICsgTWF0aC5wb3coeTEgLSB5MCwgMilcblxuY2xhc3MgSGFuZFxuICBAQ0FSRF9JTUFHRV9XOiBDQVJEX0lNQUdFX1dcbiAgQENBUkRfSU1BR0VfSDogQ0FSRF9JTUFHRV9IXG4gIEBDQVJEX0lNQUdFX09GRl9YOiBDQVJEX0lNQUdFX09GRl9YXG4gIEBDQVJEX0lNQUdFX09GRl9ZOiBDQVJEX0lNQUdFX09GRl9ZXG4gIEBDQVJEX0lNQUdFX0FEVl9YOiBDQVJEX0lNQUdFX0FEVl9YXG4gIEBDQVJEX0lNQUdFX0FEVl9ZOiBDQVJEX0lNQUdFX0FEVl9ZXG4gIEBDQVJEX1JFTkRFUl9TQ0FMRTogQ0FSRF9SRU5ERVJfU0NBTEVcbiAgQEhpZ2hsaWdodDogSGlnaGxpZ2h0XG5cbiAgQFBJQ0tJTkc6IDBcbiAgQERSQUdHSU5HOiAxXG4gIEBQVVNISU5HOiAyXG5cbiAgY29uc3RydWN0b3I6IChAZ2FtZSkgLT5cbiAgICBAY2FyZHMgPSBbXVxuICAgIEBhbmltcyA9IHt9XG4gICAgQHBvc2l0aW9uQ2FjaGUgPSB7fVxuXG4gICAgQG1vZGUgPSBIYW5kLlBJQ0tJTkdcbiAgICBAcGlja2VkID0gW11cbiAgICBAcGlja1BhaW50ID0gZmFsc2VcblxuICAgIEBkcmFnSW5kZXhTdGFydCA9IE5PX0NBUkRcbiAgICBAZHJhZ0luZGV4Q3VycmVudCA9IE5PX0NBUkRcbiAgICBAZHJhZ1ggPSAwXG4gICAgQGRyYWdZID0gMFxuXG4gICAgIyByZW5kZXIgLyBhbmltIG1ldHJpY3NcbiAgICBAY2FyZFNwZWVkID1cbiAgICAgIHI6IE1hdGguUEkgKiAyXG4gICAgICBzOiAyLjVcbiAgICAgIHQ6IDIgKiBAZ2FtZS53aWR0aFxuICAgIEBwbGF5Q2VpbGluZyA9IENBUkRfUExBWV9DRUlMSU5HICogQGdhbWUuaGVpZ2h0XG4gICAgQGNhcmRIZWlnaHQgPSBNYXRoLmZsb29yKEBnYW1lLmhlaWdodCAqIENBUkRfUkVOREVSX1NDQUxFKVxuICAgIEBjYXJkV2lkdGggID0gTWF0aC5mbG9vcihAY2FyZEhlaWdodCAqIENBUkRfSU1BR0VfVyAvIENBUkRfSU1BR0VfSClcbiAgICBAY2FyZEhhbGZIZWlnaHQgPSBAY2FyZEhlaWdodCA+PiAxXG4gICAgQGNhcmRIYWxmV2lkdGggID0gQGNhcmRXaWR0aCA+PiAxXG4gICAgYXJjTWFyZ2luID0gQGNhcmRXaWR0aCAvIDJcbiAgICBhcmNWZXJ0aWNhbEJpYXMgPSBAY2FyZEhlaWdodCAvIDUwXG4gICAgYm90dG9tTGVmdCAgPSB7IHg6IGFyY01hcmdpbiwgICAgICAgICAgICAgICAgeTogYXJjVmVydGljYWxCaWFzICsgQGdhbWUuaGVpZ2h0IH1cbiAgICBib3R0b21SaWdodCA9IHsgeDogQGdhbWUud2lkdGggLSBhcmNNYXJnaW4sIHk6IGFyY1ZlcnRpY2FsQmlhcyArIEBnYW1lLmhlaWdodCB9XG4gICAgQGhhbmRDZW50ZXIgPSB7IHg6IEBnYW1lLndpZHRoIC8gMiwgICAgICAgICB5OiBhcmNWZXJ0aWNhbEJpYXMgKyBAZ2FtZS5oZWlnaHQgKyAoQ0FSRF9IQU5EX0NVUlZFX0RJU1RfRkFDVE9SICogQGdhbWUuaGVpZ2h0KSB9XG4gICAgQGhhbmRBbmdsZSA9IGZpbmRBbmdsZShib3R0b21MZWZ0LCBAaGFuZENlbnRlciwgYm90dG9tUmlnaHQpXG4gICAgQGhhbmREaXN0YW5jZSA9IGNhbGNEaXN0YW5jZShib3R0b21MZWZ0LCBAaGFuZENlbnRlcilcbiAgICBAaGFuZEFuZ2xlQWR2YW5jZU1heCA9IEBoYW5kQW5nbGUgLyA3ICMgbmV2ZXIgc3BhY2UgdGhlIGNhcmRzIG1vcmUgdGhhbiB3aGF0IHRoZXknZCBsb29rIGxpa2Ugd2l0aCB0aGlzIGhhbmRzaXplXG4gICAgQGdhbWUubG9nIFwiSGFuZCBkaXN0YW5jZSAje0BoYW5kRGlzdGFuY2V9LCBhbmdsZSAje0BoYW5kQW5nbGV9IChzY3JlZW4gaGVpZ2h0ICN7QGdhbWUuaGVpZ2h0fSlcIlxuXG4gIHBpY2tpbmc6IC0+XG4gICAgcmV0dXJuIChAbW9kZSA9PSBIYW5kLlBJQ0tJTkcpXG5cbiAgY3ljbGVNb2RlOiAtPlxuICAgIEBtb2RlID0gc3dpdGNoIEBtb2RlXG4gICAgICB3aGVuIEhhbmQuUElDS0lOR1xuICAgICAgICBIYW5kLkRSQUdHSU5HXG4gICAgICB3aGVuIEhhbmQuRFJBR0dJTkdcbiAgICAgICAgaWYgQGdhbWUub3B0aW9ucy5wdXNoU29ydGluZ1xuICAgICAgICAgIEhhbmQuUFVTSElOR1xuICAgICAgICBlbHNlXG4gICAgICAgICAgSGFuZC5QSUNLSU5HXG4gICAgICB3aGVuIEhhbmQuUFVTSElOR1xuICAgICAgICBIYW5kLlBJQ0tJTkdcbiAgICBpZiBAbW9kZSA9PSBIYW5kLlBJQ0tJTkdcbiAgICAgIEBzZWxlY3ROb25lKClcblxuICBzZWxlY3ROb25lOiAtPlxuICAgIEBwaWNrZWQgPSBuZXcgQXJyYXkoQGNhcmRzLmxlbmd0aCkuZmlsbChmYWxzZSlcbiAgICByZXR1cm5cblxuICBzZXQ6IChjYXJkcykgLT5cbiAgICBAY2FyZHMgPSBjYXJkcy5zbGljZSgwKVxuICAgIGlmIEBtb2RlID09IEhhbmQuUElDS0lOR1xuICAgICAgQHNlbGVjdE5vbmUoKVxuICAgIEBzeW5jQW5pbXMoKVxuICAgIEB3YXJwKClcblxuICBzeW5jQW5pbXM6IC0+XG4gICAgc2VlbiA9IHt9XG4gICAgZm9yIGNhcmQgaW4gQGNhcmRzXG4gICAgICBzZWVuW2NhcmRdKytcbiAgICAgIGlmIG5vdCBAYW5pbXNbY2FyZF1cbiAgICAgICAgQGFuaW1zW2NhcmRdID0gbmV3IEFuaW1hdGlvbiB7XG4gICAgICAgICAgc3BlZWQ6IEBjYXJkU3BlZWRcbiAgICAgICAgICB4OiAwXG4gICAgICAgICAgeTogMFxuICAgICAgICAgIHI6IDBcbiAgICAgICAgfVxuICAgIHRvUmVtb3ZlID0gW11cbiAgICBmb3IgY2FyZCxhbmltIG9mIEBhbmltc1xuICAgICAgaWYgbm90IHNlZW4uaGFzT3duUHJvcGVydHkoY2FyZClcbiAgICAgICAgdG9SZW1vdmUucHVzaCBjYXJkXG4gICAgZm9yIGNhcmQgaW4gdG9SZW1vdmVcbiAgICAgICMgQGdhbWUubG9nIFwicmVtb3ZpbmcgYW5pbSBmb3IgI3tjYXJkfVwiXG4gICAgICBkZWxldGUgQGFuaW1zW2NhcmRdXG5cbiAgICBAdXBkYXRlUG9zaXRpb25zKClcblxuICBjYWxjRHJhd25IYW5kOiAtPlxuICAgIGRyYXduSGFuZCA9IFtdXG4gICAgZm9yIGNhcmQsaSBpbiBAY2FyZHNcbiAgICAgIGlmIGkgIT0gQGRyYWdJbmRleFN0YXJ0XG4gICAgICAgIGRyYXduSGFuZC5wdXNoIGNhcmRcblxuICAgIGlmIEBkcmFnSW5kZXhDdXJyZW50ICE9IE5PX0NBUkRcbiAgICAgIGRyYXduSGFuZC5zcGxpY2UgQGRyYWdJbmRleEN1cnJlbnQsIDAsIEBjYXJkc1tAZHJhZ0luZGV4U3RhcnRdXG4gICAgcmV0dXJuIGRyYXduSGFuZFxuXG4gIHdhbnRzVG9QbGF5RHJhZ2dlZENhcmQ6IC0+XG4gICAgcmV0dXJuIGZhbHNlIGlmIEBkcmFnSW5kZXhTdGFydCA9PSBOT19DQVJEXG4gICAgcmV0dXJuIEBkcmFnWSA8IEBwbGF5Q2VpbGluZ1xuXG4gIHVwZGF0ZVBvc2l0aW9uczogLT5cbiAgICBkcmF3bkhhbmQgPSBAY2FsY0RyYXduSGFuZCgpXG4gICAgd2FudHNUb1BsYXkgPSBAd2FudHNUb1BsYXlEcmFnZ2VkQ2FyZCgpXG4gICAgZGVzaXJlZFJvdGF0aW9uID0gQ0FSRF9IT0xESU5HX1JPVF9PUkRFUlxuICAgIHBvc2l0aW9uQ291bnQgPSBkcmF3bkhhbmQubGVuZ3RoXG4gICAgaWYgd2FudHNUb1BsYXlcbiAgICAgIGRlc2lyZWRSb3RhdGlvbiA9IENBUkRfSE9MRElOR19ST1RfUExBWVxuICAgICAgcG9zaXRpb25Db3VudC0tXG4gICAgcG9zaXRpb25zID0gQGNhbGNQb3NpdGlvbnMocG9zaXRpb25Db3VudClcbiAgICBkcmF3SW5kZXggPSAwXG4gICAgZm9yIGNhcmQsaSBpbiBkcmF3bkhhbmRcbiAgICAgIGFuaW0gPSBAYW5pbXNbY2FyZF1cbiAgICAgIGlmIGkgPT0gQGRyYWdJbmRleEN1cnJlbnRcbiAgICAgICAgYW5pbS5yZXEueCA9IEBkcmFnWFxuICAgICAgICBhbmltLnJlcS55ID0gQGRyYWdZXG4gICAgICAgIGFuaW0ucmVxLnIgPSBkZXNpcmVkUm90YXRpb25cbiAgICAgICAgaWYgbm90IHdhbnRzVG9QbGF5XG4gICAgICAgICAgZHJhd0luZGV4KytcbiAgICAgIGVsc2VcbiAgICAgICAgcG9zID0gcG9zaXRpb25zW2RyYXdJbmRleF1cbiAgICAgICAgYW5pbS5yZXEueCA9IHBvcy54XG4gICAgICAgIGFuaW0ucmVxLnkgPSBwb3MueVxuICAgICAgICBhbmltLnJlcS5yID0gcG9zLnJcbiAgICAgICAgZHJhd0luZGV4KytcblxuICAjIGltbWVkaWF0ZWx5IHdhcnAgYWxsIGNhcmRzIHRvIHdoZXJlIHRoZXkgc2hvdWxkIGJlXG4gIHdhcnA6IC0+XG4gICAgZm9yIGNhcmQsYW5pbSBvZiBAYW5pbXNcbiAgICAgIGFuaW0ud2FycCgpXG5cbiAgIyByZW9yZGVyIHRoZSBoYW5kIGJhc2VkIG9uIHRoZSBkcmFnIGxvY2F0aW9uIG9mIHRoZSBoZWxkIGNhcmRcbiAgcmVvcmRlcjogLT5cbiAgICByZXR1cm4gaWYgQGRyYWdJbmRleFN0YXJ0ID09IE5PX0NBUkRcbiAgICByZXR1cm4gaWYgQGNhcmRzLmxlbmd0aCA8IDIgIyBub3RoaW5nIHRvIHJlb3JkZXJcbiAgICBwb3NpdGlvbnMgPSBAY2FsY1Bvc2l0aW9ucyhAY2FyZHMubGVuZ3RoKVxuICAgIGNsb3Nlc3RJbmRleCA9IDBcbiAgICBjbG9zZXN0RGlzdCA9IEBnYW1lLndpZHRoICogQGdhbWUuaGVpZ2h0ICMgc29tZXRoaW5nIGltcG9zc2libHkgbGFyZ2VcbiAgICBmb3IgcG9zLCBpbmRleCBpbiBwb3NpdGlvbnNcbiAgICAgIGRpc3QgPSBjYWxjRGlzdGFuY2VTcXVhcmVkKHBvcy54LCBwb3MueSwgQGRyYWdYLCBAZHJhZ1kpXG4gICAgICBpZiBjbG9zZXN0RGlzdCA+IGRpc3RcbiAgICAgICAgY2xvc2VzdERpc3QgPSBkaXN0XG4gICAgICAgIGNsb3Nlc3RJbmRleCA9IGluZGV4XG4gICAgQGRyYWdJbmRleEN1cnJlbnQgPSBjbG9zZXN0SW5kZXhcblxuICBzZWxlY3RlZENhcmRzOiAtPlxuICAgIGlmIEBtb2RlICE9IEhhbmQuUElDS0lOR1xuICAgICAgcmV0dXJuIFtdXG5cbiAgICBjYXJkcyA9IFtdXG4gICAgZm9yIGNhcmQsIGkgaW4gQGNhcmRzXG4gICAgICBpZiBAcGlja2VkW2ldXG4gICAgICAgIGFuaW0gPSBAYW5pbXNbY2FyZF1cbiAgICAgICAgY2FyZHMucHVzaCB7XG4gICAgICAgICAgY2FyZDogY2FyZFxuICAgICAgICAgIHg6IGFuaW0uY3VyLnhcbiAgICAgICAgICB5OiBhbmltLmN1ci55XG4gICAgICAgICAgcjogYW5pbS5jdXIuclxuICAgICAgICAgIGluZGV4OiBpXG4gICAgICAgIH1cbiAgICByZXR1cm4gY2FyZHNcblxuICBkb3duOiAoQGRyYWdYLCBAZHJhZ1ksIGluZGV4KSAtPlxuICAgIEB1cChAZHJhZ1gsIEBkcmFnWSkgIyBlbnN1cmUgd2UgbGV0IGdvIG9mIHRoZSBwcmV2aW91cyBjYXJkIGluIGNhc2UgdGhlIGV2ZW50cyBhcmUgZHVtYlxuICAgIGlmIEBtb2RlID09IEhhbmQuUElDS0lOR1xuICAgICAgQHBpY2tlZFtpbmRleF0gPSAhQHBpY2tlZFtpbmRleF1cbiAgICAgIEBwaWNrUGFpbnQgPSBAcGlja2VkW2luZGV4XVxuICAgICAgcmV0dXJuXG4gICAgaWYgQG1vZGUgPT0gSGFuZC5QVVNISU5HXG4gICAgICBpZiBpbmRleCA8IEBjYXJkcy5sZW5ndGhcbiAgICAgICAgdG9FbmQgPSBAY2FyZHNbaW5kZXhdXG4gICAgICAgIEBjYXJkcy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICAgIEBjYXJkcy5wdXNoIHRvRW5kXG4gICAgICAgIEB1cGRhdGVQb3NpdGlvbnMoKVxuICAgICAgcmV0dXJuXG4gICAgQGdhbWUubG9nIFwicGlja2luZyB1cCBjYXJkIGluZGV4ICN7aW5kZXh9XCJcbiAgICBAZHJhZ0luZGV4U3RhcnQgPSBpbmRleFxuICAgIEBkcmFnSW5kZXhDdXJyZW50ID0gaW5kZXhcbiAgICBAdXBkYXRlUG9zaXRpb25zKClcblxuICBtb3ZlOiAoQGRyYWdYLCBAZHJhZ1kpIC0+XG4gICAgcmV0dXJuIGlmIEBkcmFnSW5kZXhTdGFydCA9PSBOT19DQVJEXG4gICAgI0BnYW1lLmxvZyBcImRyYWdnaW5nIGFyb3VuZCBjYXJkIGluZGV4ICN7QGRyYWdJbmRleEN1cnJlbnR9XCJcbiAgICBAcmVvcmRlcigpXG4gICAgQHVwZGF0ZVBvc2l0aW9ucygpXG5cbiAgdXA6IChAZHJhZ1gsIEBkcmFnWSkgLT5cbiAgICByZXR1cm4gaWYgQGRyYWdJbmRleFN0YXJ0ID09IE5PX0NBUkRcbiAgICBAcmVvcmRlcigpXG4gICAgaWYgQHdhbnRzVG9QbGF5RHJhZ2dlZENhcmQoKVxuICAgICAgQGdhbWUubG9nIFwidHJ5aW5nIHRvIHBsYXkgYSAje0BjYXJkc1tAZHJhZ0luZGV4U3RhcnRdfSBmcm9tIGluZGV4ICN7QGRyYWdJbmRleFN0YXJ0fVwiXG4gICAgICBjYXJkSW5kZXggPSBAZHJhZ0luZGV4U3RhcnRcbiAgICAgIGNhcmQgPSBAY2FyZHNbY2FyZEluZGV4XVxuICAgICAgYW5pbSA9IEBhbmltc1tjYXJkXVxuICAgICAgQGRyYWdJbmRleFN0YXJ0ID0gTk9fQ0FSRFxuICAgICAgQGRyYWdJbmRleEN1cnJlbnQgPSBOT19DQVJEXG4gICAgICBAZ2FtZS5wbGF5IFt7XG4gICAgICAgIGNhcmQ6IGNhcmRcbiAgICAgICAgeDogYW5pbS5jdXIueFxuICAgICAgICB5OiBhbmltLmN1ci55XG4gICAgICAgIHI6IGFuaW0uY3VyLnJcbiAgICAgICAgaW5kZXg6IGNhcmRJbmRleFxuICAgICAgfV1cbiAgICBlbHNlXG4gICAgICBAZ2FtZS5sb2cgXCJ0cnlpbmcgdG8gcmVvcmRlciAje0BjYXJkc1tAZHJhZ0luZGV4U3RhcnRdfSBpbnRvIGluZGV4ICN7QGRyYWdJbmRleEN1cnJlbnR9XCJcbiAgICAgIEBjYXJkcyA9IEBjYWxjRHJhd25IYW5kKCkgIyBpcyB0aGlzIHJpZ2h0P1xuXG4gICAgQGRyYWdJbmRleFN0YXJ0ID0gTk9fQ0FSRFxuICAgIEBkcmFnSW5kZXhDdXJyZW50ID0gTk9fQ0FSRFxuICAgIEB1cGRhdGVQb3NpdGlvbnMoKVxuXG4gIHVwZGF0ZTogKGR0KSAtPlxuICAgIHVwZGF0ZWQgPSBmYWxzZVxuICAgIGZvciBjYXJkLGFuaW0gb2YgQGFuaW1zXG4gICAgICBpZiBhbmltLnVwZGF0ZShkdClcbiAgICAgICAgdXBkYXRlZCA9IHRydWVcbiAgICByZXR1cm4gdXBkYXRlZFxuXG4gIHJlbmRlcjogLT5cbiAgICByZXR1cm4gaWYgQGNhcmRzLmxlbmd0aCA9PSAwXG4gICAgZHJhd25IYW5kID0gQGNhbGNEcmF3bkhhbmQoKVxuICAgIGZvciB2LCBpbmRleCBpbiBkcmF3bkhhbmRcbiAgICAgIGNvbnRpbnVlIGlmIHYgPT0gTk9fQ0FSRFxuICAgICAgYW5pbSA9IEBhbmltc1t2XVxuICAgICAgZG8gKGFuaW0sIGluZGV4KSA9PlxuICAgICAgICBpZiBAbW9kZSA9PSBIYW5kLlBJQ0tJTkdcbiAgICAgICAgICBpZiBAcGlja2VkW2luZGV4XVxuICAgICAgICAgICAgaGlnaGxpZ2h0U3RhdGUgPSBIaWdobGlnaHQuU0VMRUNURURcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBoaWdobGlnaHRTdGF0ZSA9IEhpZ2hsaWdodC5VTlNFTEVDVEVEXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBpZiBAd2FudHNUb1BsYXlEcmFnZ2VkQ2FyZCgpXG4gICAgICAgICAgICBpZiAoaW5kZXggPT0gQGRyYWdJbmRleEN1cnJlbnQpXG4gICAgICAgICAgICAgIGhpZ2hsaWdodFN0YXRlID0gSGlnaGxpZ2h0LlNFTEVDVEVEXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIGhpZ2hsaWdodFN0YXRlID0gSGlnaGxpZ2h0LlVOU0VMRUNURURcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBoaWdobGlnaHRTdGF0ZSA9IEhpZ2hsaWdodC5OT05FXG4gICAgICAgIEByZW5kZXJDYXJkIHYsIGFuaW0uY3VyLngsIGFuaW0uY3VyLnksIGFuaW0uY3VyLnIsIDEsIGhpZ2hsaWdodFN0YXRlLCAoY2xpY2tYLCBjbGlja1kpID0+XG4gICAgICAgICAgQGRvd24oY2xpY2tYLCBjbGlja1ksIGluZGV4KVxuXG4gIHJlbmRlckNhcmQ6ICh2LCB4LCB5LCByb3QsIHNjYWxlLCBzZWxlY3RlZCwgY2IpIC0+XG4gICAgcm90ID0gMCBpZiBub3Qgcm90XG4gICAgcmFuayA9IE1hdGguZmxvb3IodiAvIDQpXG4gICAgc3VpdCA9IE1hdGguZmxvb3IodiAlIDQpXG5cbiAgICBjb2wgPSBzd2l0Y2ggc2VsZWN0ZWRcbiAgICAgIHdoZW4gSGlnaGxpZ2h0Lk5PTkVcbiAgICAgICAgWzEsIDEsIDFdXG4gICAgICB3aGVuIEhpZ2hsaWdodC5VTlNFTEVDVEVEXG4gICAgICAgICMgWzAuMywgMC4zLCAwLjNdXG4gICAgICAgIFsxLCAxLCAxXVxuICAgICAgd2hlbiBIaWdobGlnaHQuU0VMRUNURURcbiAgICAgICAgWzAuNSwgMC41LCAwLjldXG4gICAgICB3aGVuIEhpZ2hsaWdodC5QSUxFXG4gICAgICAgIFswLjYsIDAuNiwgMC42XVxuXG4gICAgQGdhbWUuZHJhd0ltYWdlIFwiY2FyZHNcIixcbiAgICBDQVJEX0lNQUdFX09GRl9YICsgKENBUkRfSU1BR0VfQURWX1ggKiByYW5rKSwgQ0FSRF9JTUFHRV9PRkZfWSArIChDQVJEX0lNQUdFX0FEVl9ZICogc3VpdCksIENBUkRfSU1BR0VfVywgQ0FSRF9JTUFHRV9ILFxuICAgIHgsIHksIEBjYXJkV2lkdGggKiBzY2FsZSwgQGNhcmRIZWlnaHQgKiBzY2FsZSxcbiAgICByb3QsIDAuNSwgMC41LCBjb2xbMF0sY29sWzFdLGNvbFsyXSwxLCBjYlxuXG4gIGNhbGNQb3NpdGlvbnM6IChoYW5kU2l6ZSkgLT5cbiAgICBpZiBAcG9zaXRpb25DYWNoZS5oYXNPd25Qcm9wZXJ0eShoYW5kU2l6ZSlcbiAgICAgIHJldHVybiBAcG9zaXRpb25DYWNoZVtoYW5kU2l6ZV1cbiAgICByZXR1cm4gW10gaWYgaGFuZFNpemUgPT0gMFxuXG4gICAgYWR2YW5jZSA9IEBoYW5kQW5nbGUgLyBoYW5kU2l6ZVxuICAgIGlmIGFkdmFuY2UgPiBAaGFuZEFuZ2xlQWR2YW5jZU1heFxuICAgICAgYWR2YW5jZSA9IEBoYW5kQW5nbGVBZHZhbmNlTWF4XG4gICAgYW5nbGVTcHJlYWQgPSBhZHZhbmNlICogaGFuZFNpemUgICAgICAgICAgICAgICAgIyBob3cgbXVjaCBvZiB0aGUgYW5nbGUgd2UgcGxhbiBvbiB1c2luZ1xuICAgIGFuZ2xlTGVmdG92ZXIgPSBAaGFuZEFuZ2xlIC0gYW5nbGVTcHJlYWQgICAgICAgICMgYW1vdW50IG9mIGFuZ2xlIHdlJ3JlIG5vdCB1c2luZywgYW5kIG5lZWQgdG8gcGFkIHNpZGVzIHdpdGggZXZlbmx5XG4gICAgY3VycmVudEFuZ2xlID0gLTEgKiAoQGhhbmRBbmdsZSAvIDIpICAgICAgICAgICAgIyBtb3ZlIHRvIHRoZSBsZWZ0IHNpZGUgb2Ygb3VyIGFuZ2xlXG4gICAgY3VycmVudEFuZ2xlICs9IGFuZ2xlTGVmdG92ZXIgLyAyICAgICAgICAgICAgICAgIyAuLi4gYW5kIGFkdmFuY2UgcGFzdCBoYWxmIG9mIHRoZSBwYWRkaW5nXG4gICAgY3VycmVudEFuZ2xlICs9IGFkdmFuY2UgLyAyICAgICAgICAgICAgICAgICAgICAgIyAuLi4gYW5kIGNlbnRlciB0aGUgY2FyZHMgaW4gdGhlIGFuZ2xlXG5cbiAgICBwb3NpdGlvbnMgPSBbXVxuICAgIGZvciBpIGluIFswLi4uaGFuZFNpemVdXG4gICAgICB4ID0gQGhhbmRDZW50ZXIueCAtIE1hdGguY29zKChNYXRoLlBJIC8gMikgKyBjdXJyZW50QW5nbGUpICogQGhhbmREaXN0YW5jZVxuICAgICAgeSA9IEBoYW5kQ2VudGVyLnkgLSBNYXRoLnNpbigoTWF0aC5QSSAvIDIpICsgY3VycmVudEFuZ2xlKSAqIEBoYW5kRGlzdGFuY2VcbiAgICAgIGN1cnJlbnRBbmdsZSArPSBhZHZhbmNlXG4gICAgICBwb3NpdGlvbnMucHVzaCB7XG4gICAgICAgIHg6IHhcbiAgICAgICAgeTogeVxuICAgICAgICByOiBjdXJyZW50QW5nbGUgLSBhZHZhbmNlXG4gICAgICB9XG5cbiAgICBAcG9zaXRpb25DYWNoZVtoYW5kU2l6ZV0gPSBwb3NpdGlvbnNcbiAgICByZXR1cm4gcG9zaXRpb25zXG5cbm1vZHVsZS5leHBvcnRzID0gSGFuZFxuIiwiQnV0dG9uID0gcmVxdWlyZSAnLi9CdXR0b24nXG5cbmNsYXNzIE1lbnVcbiAgY29uc3RydWN0b3I6IChAZ2FtZSwgQHRpdGxlLCBAYmFja2dyb3VuZCwgQGNvbG9yLCBAYWN0aW9ucykgLT5cbiAgICBAYnV0dG9ucyA9IFtdXG4gICAgQGJ1dHRvbk5hbWVzID0gW1wiYnV0dG9uMFwiLCBcImJ1dHRvbjFcIl1cblxuICAgIGJ1dHRvblNpemUgPSBAZ2FtZS5oZWlnaHQgLyAxNVxuICAgIEBidXR0b25TdGFydFkgPSBAZ2FtZS5oZWlnaHQgLyA1XG5cbiAgICBzbGljZSA9IChAZ2FtZS5oZWlnaHQgLSBAYnV0dG9uU3RhcnRZKSAvIChAYWN0aW9ucy5sZW5ndGggKyAxKVxuICAgIGN1cnJZID0gQGJ1dHRvblN0YXJ0WSArIHNsaWNlXG4gICAgZm9yIGFjdGlvbiBpbiBAYWN0aW9uc1xuICAgICAgYnV0dG9uID0gbmV3IEJ1dHRvbihAZ2FtZSwgQGJ1dHRvbk5hbWVzLCBAZ2FtZS5mb250LCBidXR0b25TaXplLCBAZ2FtZS5jZW50ZXIueCwgY3VyclksIGFjdGlvbilcbiAgICAgIEBidXR0b25zLnB1c2ggYnV0dG9uXG4gICAgICBjdXJyWSArPSBzbGljZVxuXG4gIHVwZGF0ZTogKGR0KSAtPlxuICAgIHVwZGF0ZWQgPSBmYWxzZVxuICAgIGZvciBidXR0b24gaW4gQGJ1dHRvbnNcbiAgICAgIGlmIGJ1dHRvbi51cGRhdGUoZHQpXG4gICAgICAgIHVwZGF0ZWQgPSB0cnVlXG4gICAgcmV0dXJuIHVwZGF0ZWRcblxuICByZW5kZXI6IC0+XG4gICAgQGdhbWUuc3ByaXRlUmVuZGVyZXIucmVuZGVyIEBiYWNrZ3JvdW5kLCAwLCAwLCBAZ2FtZS53aWR0aCwgQGdhbWUuaGVpZ2h0LCAwLCAwLCAwLCBAY29sb3JcbiAgICBAZ2FtZS5mb250UmVuZGVyZXIucmVuZGVyIEBnYW1lLmZvbnQsIEBnYW1lLmhlaWdodCAvIDI1LCBcIkJ1aWxkOiAje0BnYW1lLnZlcnNpb259XCIsIDAsIEBnYW1lLmhlaWdodCwgMCwgMSwgQGdhbWUuY29sb3JzLmxpZ2h0Z3JheVxuICAgIHRpdGxlSGVpZ2h0ID0gQGdhbWUuaGVpZ2h0IC8gOFxuICAgIHRpdGxlT2Zmc2V0ID0gQGJ1dHRvblN0YXJ0WSA+PiAxXG4gICAgQGdhbWUuZm9udFJlbmRlcmVyLnJlbmRlciBAZ2FtZS5mb250LCB0aXRsZUhlaWdodCwgQHRpdGxlLCBAZ2FtZS5jZW50ZXIueCwgdGl0bGVPZmZzZXQsIDAuNSwgMC41LCBAZ2FtZS5jb2xvcnMud2hpdGVcbiAgICBmb3IgYnV0dG9uIGluIEBidXR0b25zXG4gICAgICBidXR0b24ucmVuZGVyKClcblxubW9kdWxlLmV4cG9ydHMgPSBNZW51XG4iLCJBbmltYXRpb24gPSByZXF1aXJlICcuL0FuaW1hdGlvbidcbkhhbmQgPSByZXF1aXJlICcuL0hhbmQnXG5cblNFVFRMRV9NUyA9IDI1MFxuXG5jbGFzcyBQaWxlXG4gIGNvbnN0cnVjdG9yOiAoQGdhbWUsIEBoYW5kKSAtPlxuICAgIEBwbGF5SUQgPSAtMVxuICAgIEBwbGF5cyA9IFtdXG4gICAgQGFuaW1zID0ge31cbiAgICBAc2V0dGxlVGltZXIgPSAwXG4gICAgQHRocm93bkNvbG9yID0geyByOiAxLCBnOiAxLCBiOiAwLCBhOiAxfVxuICAgIEBzY2FsZSA9IDAuNlxuXG4gICAgIyAxLjAgaXMgbm90IG1lc3N5IGF0IGFsbCwgYXMgeW91IGFwcHJvYWNoIDAgaXQgc3RhcnRzIHRvIGFsbCBwaWxlIG9uIG9uZSBhbm90aGVyXG4gICAgbWVzc3kgPSAwLjJcblxuICAgIEBwbGF5Q2FyZFNwYWNpbmcgPSAwLjFcblxuICAgIGNlbnRlclggPSBAZ2FtZS5jZW50ZXIueFxuICAgIGNlbnRlclkgPSBAZ2FtZS5jZW50ZXIueVxuICAgIG9mZnNldFggPSBAaGFuZC5jYXJkV2lkdGggKiBtZXNzeSAqIEBzY2FsZVxuICAgIG9mZnNldFkgPSBAaGFuZC5jYXJkSGFsZkhlaWdodCAqIG1lc3N5ICogQHNjYWxlXG4gICAgQHBsYXlMb2NhdGlvbnMgPSBbXG4gICAgICB7IHg6IGNlbnRlclgsIHk6IGNlbnRlclkgKyBvZmZzZXRZIH0gIyBib3R0b21cbiAgICAgIHsgeDogY2VudGVyWCAtIG9mZnNldFgsIHk6IGNlbnRlclkgfSAjIGxlZnRcbiAgICAgIHsgeDogY2VudGVyWCwgeTogY2VudGVyWSAtIG9mZnNldFkgfSAjIHRvcFxuICAgICAgeyB4OiBjZW50ZXJYICsgb2Zmc2V0WCwgeTogY2VudGVyWSB9ICMgcmlnaHRcbiAgICBdXG4gICAgQHRocm93TG9jYXRpb25zID0gW1xuICAgICAgeyB4OiBjZW50ZXJYLCB5OiBAZ2FtZS5oZWlnaHQgfSAjIGJvdHRvbVxuICAgICAgeyB4OiAwLCB5OiBjZW50ZXJZICsgb2Zmc2V0WSB9ICMgbGVmdFxuICAgICAgeyB4OiBjZW50ZXJYLCB5OiAwIH0gIyB0b3BcbiAgICAgIHsgeDogQGdhbWUud2lkdGgsIHk6IGNlbnRlclkgKyBvZmZzZXRZIH0gIyByaWdodFxuICAgIF1cblxuICBzZXQ6IChwaWxlSUQsIHBpbGUsIHBpbGVXaG8pIC0+XG4gICAgaWYgQHBsYXlJRCAhPSBwaWxlSURcbiAgICAgIEBwbGF5SUQgPSBwaWxlSURcbiAgICAgIEBwbGF5cy5wdXNoIHtcbiAgICAgICAgY2FyZHM6IHBpbGUuc2xpY2UoMClcbiAgICAgICAgd2hvOiBwaWxlV2hvXG4gICAgICB9XG4gICAgICBAc2V0dGxlVGltZXIgPSBTRVRUTEVfTVNcblxuICAgICMgaWYgKEBwbGF5SUQgIT0gcGlsZUlEKSBhbmQgKHRocm93bi5sZW5ndGggPiAwKVxuICAgICMgICBAcGxheXMgPSB0aHJvd24uc2xpY2UoMCkgIyB0aGUgcGlsZSBoYXMgYmVjb21lIHRoZSB0aHJvd24sIHN0YXNoIGl0IG9mZiBvbmUgbGFzdCB0aW1lXG4gICAgIyAgIEBwbGF5V2hvID0gdGhyb3duV2hvLnNsaWNlKDApXG4gICAgIyAgIEBwbGF5SUQgPSBwaWxlSURcbiAgICAjICAgQHNldHRsZVRpbWVyID0gU0VUVExFX01TXG5cbiAgICAjICMgZG9uJ3Qgc3RvbXAgdGhlIHBpbGUgd2UncmUgZHJhd2luZyB1bnRpbCBpdCBpcyBkb25lIHNldHRsaW5nIGFuZCBjYW4gZmx5IG9mZiB0aGUgc2NyZWVuXG4gICAgIyBpZiBAc2V0dGxlVGltZXIgPT0gMFxuICAgICMgICBAcGxheXMgPSBwaWxlLnNsaWNlKDApXG4gICAgIyAgIEBwbGF5V2hvID0gcGlsZVdoby5zbGljZSgwKVxuICAgICMgICBAdGhyb3duID0gdGhyb3duLnNsaWNlKDApXG4gICAgIyAgIEB0aHJvd25XaG8gPSB0aHJvd25XaG8uc2xpY2UoMClcbiAgICAjICAgQHRocm93blRha2VyID0gdGhyb3duVGFrZXJcblxuICAgIEBzeW5jQW5pbXMoKVxuXG4gIHBva2U6IC0+XG4gICAgQHNldHRsZVRpbWVyID0gU0VUVExFX01TXG5cbiAgaGludDogKGNhcmRzKSAtPlxuICAgIGZvciBjYXJkIGluIGNhcmRzXG4gICAgICBAYW5pbXNbY2FyZC5jYXJkXSA9IG5ldyBBbmltYXRpb24ge1xuICAgICAgICBzcGVlZDogQGhhbmQuY2FyZFNwZWVkXG4gICAgICAgIHg6IGNhcmQueFxuICAgICAgICB5OiBjYXJkLnlcbiAgICAgICAgcjogY2FyZC5yXG4gICAgICAgIHM6IDFcbiAgICAgIH1cblxuICBzeW5jQW5pbXM6IC0+XG4gICAgc2VlbiA9IHt9XG4gICAgbG9jYXRpb25zID0gQHRocm93TG9jYXRpb25zXG4gICAgZm9yIHBsYXkgaW4gQHBsYXlzXG4gICAgICBmb3IgY2FyZCwgaW5kZXggaW4gcGxheS5jYXJkc1xuICAgICAgICBzZWVuW2NhcmRdKytcbiAgICAgICAgaWYgbm90IEBhbmltc1tjYXJkXVxuICAgICAgICAgIHdobyA9IHBsYXkud2hvXG4gICAgICAgICAgbG9jYXRpb24gPSBsb2NhdGlvbnNbd2hvXVxuICAgICAgICAgIEBhbmltc1tjYXJkXSA9IG5ldyBBbmltYXRpb24ge1xuICAgICAgICAgICAgc3BlZWQ6IEBoYW5kLmNhcmRTcGVlZFxuICAgICAgICAgICAgeDogbG9jYXRpb24ueFxuICAgICAgICAgICAgeTogbG9jYXRpb24ueVxuICAgICAgICAgICAgcjogLTEgKiBNYXRoLlBJIC8gNFxuICAgICAgICAgICAgczogQHNjYWxlXG4gICAgICAgICAgfVxuXG4gICAgdG9SZW1vdmUgPSBbXVxuICAgIGZvciBjYXJkLGFuaW0gb2YgQGFuaW1zXG4gICAgICBpZiBub3Qgc2Vlbi5oYXNPd25Qcm9wZXJ0eShjYXJkKVxuICAgICAgICB0b1JlbW92ZS5wdXNoIGNhcmRcbiAgICBmb3IgY2FyZCBpbiB0b1JlbW92ZVxuICAgICAgIyBAZ2FtZS5sb2cgXCJyZW1vdmluZyBhbmltIGZvciAje2NhcmR9XCJcbiAgICAgIGRlbGV0ZSBAYW5pbXNbY2FyZF1cblxuICAgIEB1cGRhdGVQb3NpdGlvbnMoKVxuXG4gIHVwZGF0ZVBvc2l0aW9uczogLT5cbiAgICBsb2NhdGlvbnMgPSBAcGxheUxvY2F0aW9uc1xuICAgIGZvciBwbGF5LCBwbGF5SW5kZXggaW4gQHBsYXlzXG4gICAgICBmb3IgdiwgaW5kZXggaW4gcGxheS5jYXJkc1xuICAgICAgICBhbmltID0gQGFuaW1zW3ZdXG4gICAgICAgIGxvYyA9IHBsYXkud2hvXG4gICAgICAgIGFuaW0ucmVxLnggPSBsb2NhdGlvbnNbbG9jXS54ICsgKGluZGV4ICogQGhhbmQuY2FyZFdpZHRoICogQHBsYXlDYXJkU3BhY2luZylcbiAgICAgICAgYW5pbS5yZXEueSA9IGxvY2F0aW9uc1tsb2NdLnlcbiAgICAgICAgYW5pbS5yZXEuciA9IDAuMiAqIE1hdGguY29zKHBsYXlJbmRleCAvIDAuMSlcbiAgICAgICAgYW5pbS5yZXEucyA9IEBzY2FsZVxuXG4gIHJlYWR5Rm9yTmV4dFRyaWNrOiAtPlxuICAgIHJldHVybiBAcmVzdGluZygpXG4gICAgIyByZXR1cm4gKEBzZXR0bGVUaW1lciA9PSAwKVxuXG4gIHVwZGF0ZTogKGR0KSAtPlxuICAgIHVwZGF0ZWQgPSBmYWxzZVxuXG4gICAgaWYgQHNldHRsZVRpbWVyID4gMFxuICAgICAgdXBkYXRlZCA9IHRydWVcbiAgICAgIEBzZXR0bGVUaW1lciAtPSBkdFxuICAgICAgaWYgQHNldHRsZVRpbWVyIDwgMFxuICAgICAgICBAc2V0dGxlVGltZXIgPSAwXG5cbiAgICBmb3IgY2FyZCxhbmltIG9mIEBhbmltc1xuICAgICAgaWYgYW5pbS51cGRhdGUoZHQpXG4gICAgICAgIHVwZGF0ZWQgPSB0cnVlXG5cbiAgICByZXR1cm4gdXBkYXRlZFxuXG4gICMgdXNlZCBieSB0aGUgZ2FtZSBvdmVyIHNjcmVlbi4gSXQgcmV0dXJucyB0cnVlIHdoZW4gbmVpdGhlciB0aGUgcGlsZSBub3IgdGhlIGxhc3QgdGhyb3duIGFyZSBtb3ZpbmdcbiAgcmVzdGluZzogLT5cbiAgICBmb3IgY2FyZCxhbmltIG9mIEBhbmltc1xuICAgICAgaWYgYW5pbS5hbmltYXRpbmcoKVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICBpZiBAc2V0dGxlVGltZXIgPiAwXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICByZXR1cm4gdHJ1ZVxuXG4gIHJlbmRlcjogLT5cbiAgICBmb3IgcGxheSwgcGxheUluZGV4IGluIEBwbGF5c1xuICAgICAgaGlnaGxpZ2h0ID0gSGFuZC5IaWdobGlnaHQuUElMRVxuICAgICAgaWYgcGxheUluZGV4ID09IChAcGxheXMubGVuZ3RoIC0gMSlcbiAgICAgICAgaGlnaGxpZ2h0ID0gSGFuZC5IaWdobGlnaHQuTk9ORVxuICAgICAgZm9yIHYsIGluZGV4IGluIHBsYXkuY2FyZHNcbiAgICAgICAgYW5pbSA9IEBhbmltc1t2XVxuICAgICAgICBAaGFuZC5yZW5kZXJDYXJkIHYsIGFuaW0uY3VyLngsIGFuaW0uY3VyLnksIGFuaW0uY3VyLnIsIGFuaW0uY3VyLnMsIGhpZ2hsaWdodFxuXG5tb2R1bGUuZXhwb3J0cyA9IFBpbGVcbiIsImNsYXNzIFNwcml0ZVJlbmRlcmVyXG4gIGNvbnN0cnVjdG9yOiAoQGdhbWUpIC0+XG4gICAgQHNwcml0ZXMgPVxuICAgICAgIyBnZW5lcmljIHNwcml0ZXNcbiAgICAgIHNvbGlkOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6ICA1NSwgeTogNzIzLCB3OiAgMTAsIGg6ICAxMCB9XG4gICAgICBwYXVzZTogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA2MDIsIHk6IDcwNywgdzogMTIyLCBoOiAxMjUgfVxuICAgICAgYnV0dG9uMDogICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogMTQwLCB5OiA3NzcsIHc6IDQyMiwgaDogIDY1IH1cbiAgICAgIGJ1dHRvbjE6ICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDE0MCwgeTogNjk4LCB3OiA0MjIsIGg6ICA2NSB9XG4gICAgICBwbHVzMDogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA3NDUsIHk6IDY2NCwgdzogMTE2LCBoOiAxMTggfVxuICAgICAgcGx1czE6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogNzQ1LCB5OiA4MjAsIHc6IDExNiwgaDogMTE4IH1cbiAgICAgIG1pbnVzMDogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDg5NSwgeTogNjY0LCB3OiAxMTYsIGg6IDExOCB9XG4gICAgICBtaW51czE6ICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA4OTUsIHk6IDgyMCwgdzogMTE2LCBoOiAxMTggfVxuICAgICAgYXJyb3dMOiAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogIDMzLCB5OiA4NTgsIHc6IDIwNCwgaDogMTU2IH1cbiAgICAgIGFycm93UjogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDIzOSwgeTogODUyLCB3OiAyMDgsIGg6IDE1NSB9XG5cbiAgICAgIHBpbGU6ICAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6ICAxMywgeTogODgzLCB3OiAxMjgsIGg6IDEyOCB9XG4gICAgICBwaWxlMDogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAxNDUsIHk6IDg4MywgdzogMTI4LCBoOiAxMjggfVxuICAgICAgcGlsZTE6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogMjc3LCB5OiA4ODMsIHc6IDEyOCwgaDogMTI4IH1cbiAgICAgIHBpbGUyOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDQwOSwgeTogODgzLCB3OiAxMjgsIGg6IDEyOCB9XG4gICAgICBwaWxlMzogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA1NDEsIHk6IDg4MywgdzogMTI4LCBoOiAxMjggfVxuXG4gICAgICAjIG1lbnUgYmFja2dyb3VuZHNcbiAgICAgIG1haW5tZW51OiAgeyB0ZXh0dXJlOiBcIm1haW5tZW51XCIsICB4OiAwLCB5OiAwLCB3OiAxMjgwLCBoOiA3MjAgfVxuICAgICAgcGF1c2VtZW51OiB7IHRleHR1cmU6IFwicGF1c2VtZW51XCIsIHg6IDAsIHk6IDAsIHc6IDEyODAsIGg6IDcyMCB9XG5cbiAgICAgICMgaG93dG9cbiAgICAgIGhvd3RvMTogICAgeyB0ZXh0dXJlOiBcImhvd3RvMVwiLCAgeDogMCwgeTogIDAsIHc6IDE5MjAsIGg6IDEwODAgfVxuXG4gICAgICBhdTogICAgICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA1NDAsIHk6IDEwNzksIHc6IDQwMCwgaDogIDgwIH1cbiAgICAgIHN0YXJfb246ICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6ICAzOCwgeTogMTA2NiwgdzogMTkwLCBoOiAxOTAgfVxuICAgICAgc3Rhcl9vZmY6ICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogMjUwLCB5OiAxMDY2LCB3OiAxOTAsIGg6IDE5MCB9XG5cbiAgICAgICMgY2hhcmFjdGVyc1xuICAgICAgbWFyaW86ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogIDIwLCB5OiAgIDAsIHc6IDE1MSwgaDogMzA4IH1cbiAgICAgIGx1aWdpOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDE3MSwgeTogICAwLCB3OiAxNTEsIGg6IDMwOCB9XG4gICAgICBwZWFjaDogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAzMzUsIHk6ICAgMCwgdzogMTY0LCBoOiAzMDggfVxuICAgICAgZGFpc3k6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogNTA0LCB5OiAgIDAsIHc6IDE2NCwgaDogMzA4IH1cbiAgICAgIHlvc2hpOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDY2OCwgeTogICAwLCB3OiAxODAsIGg6IDMwOCB9XG4gICAgICB0b2FkOiAgICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA4NDksIHk6ICAgMCwgdzogMTU3LCBoOiAzMDggfVxuICAgICAgYm93c2VyOiAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogIDExLCB5OiAzMjIsIHc6IDE1MSwgaDogMzA4IH1cbiAgICAgIGJvd3NlcmpyOiAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDIyNSwgeTogMzIyLCB3OiAxNDQsIGg6IDMwOCB9XG4gICAgICBrb29wYTogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAzNzIsIHk6IDMyMiwgdzogMTI4LCBoOiAzMDggfVxuICAgICAgcm9zYWxpbmE6ICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogNTAwLCB5OiAzMjIsIHc6IDE3MywgaDogMzA4IH1cbiAgICAgIHNoeWd1eTogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDY5MSwgeTogMzIyLCB3OiAxNTQsIGg6IDMwOCB9XG4gICAgICB0b2FkZXR0ZTogIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA4NDcsIHk6IDMyMiwgdzogMTU4LCBoOiAzMDggfVxuXG4gIGNhbGNXaWR0aDogKHNwcml0ZU5hbWUsIGhlaWdodCkgLT5cbiAgICBzcHJpdGUgPSBAc3ByaXRlc1tzcHJpdGVOYW1lXVxuICAgIHJldHVybiAxIGlmIG5vdCBzcHJpdGVcbiAgICByZXR1cm4gaGVpZ2h0ICogc3ByaXRlLncgLyBzcHJpdGUuaFxuXG4gIHJlbmRlcjogKHNwcml0ZU5hbWUsIGR4LCBkeSwgZHcsIGRoLCByb3QsIGFuY2hvcngsIGFuY2hvcnksIGNvbG9yLCBjYikgLT5cbiAgICBzcHJpdGUgPSBAc3ByaXRlc1tzcHJpdGVOYW1lXVxuICAgIHJldHVybiBpZiBub3Qgc3ByaXRlXG4gICAgaWYgKGR3ID09IDApIGFuZCAoZGggPT0gMClcbiAgICAgICMgdGhpcyBwcm9iYWJseSBzaG91bGRuJ3QgZXZlciBiZSB1c2VkLlxuICAgICAgZHcgPSBzcHJpdGUueFxuICAgICAgZGggPSBzcHJpdGUueVxuICAgIGVsc2UgaWYgZHcgPT0gMFxuICAgICAgZHcgPSBkaCAqIHNwcml0ZS53IC8gc3ByaXRlLmhcbiAgICBlbHNlIGlmIGRoID09IDBcbiAgICAgIGRoID0gZHcgKiBzcHJpdGUuaCAvIHNwcml0ZS53XG4gICAgQGdhbWUuZHJhd0ltYWdlIHNwcml0ZS50ZXh0dXJlLCBzcHJpdGUueCwgc3ByaXRlLnksIHNwcml0ZS53LCBzcHJpdGUuaCwgZHgsIGR5LCBkdywgZGgsIHJvdCwgYW5jaG9yeCwgYW5jaG9yeSwgY29sb3IuciwgY29sb3IuZywgY29sb3IuYiwgY29sb3IuYSwgY2JcbiAgICByZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBTcHJpdGVSZW5kZXJlclxuIiwiTUlOX1BMQVlFUlMgPSAzXG5NQVhfTE9HX0xJTkVTID0gNlxuT0sgPSAnT0snXG5cblN1aXQgPVxuICBOT05FOiAtMVxuICBTUEFERVM6IDBcbiAgQ0xVQlM6IDFcbiAgRElBTU9ORFM6IDJcbiAgSEVBUlRTOiAzXG5cblN1aXROYW1lID0gWydTcGFkZXMnLCAnQ2x1YnMnLCAnRGlhbW9uZHMnLCAnSGVhcnRzJ11cblNob3J0U3VpdE5hbWUgPSBbJ1MnLCAnQycsICdEJywgJ0gnXVxuR2x5cGhTdWl0TmFtZSA9IFtcIlxceGM4XCIsIFwiXFx4YzlcIiwgXCJcXHhjYVwiLCBcIlxceGNiXCJdXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEFJIE5hbWUgR2VuZXJhdG9yXG5cbmFpQ2hhcmFjdGVyTGlzdCA9IFtcbiAgeyBpZDogXCJtYXJpb1wiLCAgICBuYW1lOiBcIk1hcmlvXCIsICAgICAgc3ByaXRlOiBcIm1hcmlvXCIsICAgIGJyYWluOiBcIm5vcm1hbFwiIH1cbiAgeyBpZDogXCJsdWlnaVwiLCAgICBuYW1lOiBcIkx1aWdpXCIsICAgICAgc3ByaXRlOiBcImx1aWdpXCIsICAgIGJyYWluOiBcIm5vcm1hbFwiIH1cbiAgeyBpZDogXCJwZWFjaFwiLCAgICBuYW1lOiBcIlBlYWNoXCIsICAgICAgc3ByaXRlOiBcInBlYWNoXCIsICAgIGJyYWluOiBcIm5vcm1hbFwiIH1cbiAgeyBpZDogXCJkYWlzeVwiLCAgICBuYW1lOiBcIkRhaXN5XCIsICAgICAgc3ByaXRlOiBcImRhaXN5XCIsICAgIGJyYWluOiBcIm5vcm1hbFwiIH1cbiAgeyBpZDogXCJ5b3NoaVwiLCAgICBuYW1lOiBcIllvc2hpXCIsICAgICAgc3ByaXRlOiBcInlvc2hpXCIsICAgIGJyYWluOiBcIm5vcm1hbFwiIH1cbiAgeyBpZDogXCJ0b2FkXCIsICAgICBuYW1lOiBcIlRvYWRcIiwgICAgICAgc3ByaXRlOiBcInRvYWRcIiwgICAgIGJyYWluOiBcIm5vcm1hbFwiIH1cbiAgeyBpZDogXCJib3dzZXJcIiwgICBuYW1lOiBcIkJvd3NlclwiLCAgICAgc3ByaXRlOiBcImJvd3NlclwiLCAgIGJyYWluOiBcIm5vcm1hbFwiIH1cbiAgeyBpZDogXCJib3dzZXJqclwiLCBuYW1lOiBcIkJvd3NlciBKclwiLCAgc3ByaXRlOiBcImJvd3NlcmpyXCIsIGJyYWluOiBcIm5vcm1hbFwiIH1cbiAgeyBpZDogXCJrb29wYVwiLCAgICBuYW1lOiBcIktvb3BhXCIsICAgICAgc3ByaXRlOiBcImtvb3BhXCIsICAgIGJyYWluOiBcIm5vcm1hbFwiIH1cbiAgeyBpZDogXCJyb3NhbGluYVwiLCBuYW1lOiBcIlJvc2FsaW5hXCIsICAgc3ByaXRlOiBcInJvc2FsaW5hXCIsIGJyYWluOiBcIm5vcm1hbFwiIH1cbiAgeyBpZDogXCJzaHlndXlcIiwgICBuYW1lOiBcIlNoeWd1eVwiLCAgICAgc3ByaXRlOiBcInNoeWd1eVwiLCAgIGJyYWluOiBcIm5vcm1hbFwiIH1cbiAgeyBpZDogXCJ0b2FkZXR0ZVwiLCBuYW1lOiBcIlRvYWRldHRlXCIsICAgc3ByaXRlOiBcInRvYWRldHRlXCIsIGJyYWluOiBcIm5vcm1hbFwiIH1cbl1cblxuYWlDaGFyYWN0ZXJzID0ge31cbmZvciBjaGFyYWN0ZXIgaW4gYWlDaGFyYWN0ZXJMaXN0XG4gIGFpQ2hhcmFjdGVyc1tjaGFyYWN0ZXIuaWRdID0gY2hhcmFjdGVyXG5cbnJhbmRvbUNoYXJhY3RlciA9IC0+XG4gIHIgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBhaUNoYXJhY3Rlckxpc3QubGVuZ3RoKVxuICByZXR1cm4gYWlDaGFyYWN0ZXJMaXN0W3JdXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIENhcmRcblxuY2xhc3MgQ2FyZFxuICBjb25zdHJ1Y3RvcjogKEByYXcpIC0+XG4gICAgQHN1aXQgID0gTWF0aC5mbG9vcihAcmF3ICUgNClcbiAgICBAdmFsdWUgPSBNYXRoLmZsb29yKEByYXcgLyA0KVxuICAgIEB2YWx1ZU5hbWUgPSBzd2l0Y2ggQHZhbHVlXG4gICAgICB3aGVuICA4IHRoZW4gJ0onXG4gICAgICB3aGVuICA5IHRoZW4gJ1EnXG4gICAgICB3aGVuIDEwIHRoZW4gJ0snXG4gICAgICB3aGVuIDExIHRoZW4gJ0EnXG4gICAgICB3aGVuIDEyIHRoZW4gJzInXG4gICAgICBlbHNlXG4gICAgICAgIFN0cmluZyhAdmFsdWUgKyAzKVxuICAgIEBuYW1lID0gQHZhbHVlTmFtZSArIFNob3J0U3VpdE5hbWVbQHN1aXRdXG4gICAgIyBjb25zb2xlLmxvZyBcIiN7QHJhd30gLT4gI3tAbmFtZX1cIlxuICBnbHlwaGVkTmFtZTogLT5cbiAgICByZXR1cm4gQHZhbHVlTmFtZSArIEdseXBoU3VpdE5hbWVbQHN1aXRdXG5cbmNhcmRzVG9TdHJpbmcgPSAocmF3Q2FyZHMpIC0+XG4gIGNhcmROYW1lcyA9IFtdXG4gIGZvciByYXcgaW4gcmF3Q2FyZHNcbiAgICBjYXJkID0gbmV3IENhcmQocmF3KVxuICAgIGNhcmROYW1lcy5wdXNoIGNhcmQubmFtZVxuICByZXR1cm4gXCJbIFwiICsgY2FyZE5hbWVzLmpvaW4oJywnKSArIFwiIF1cIlxuXG5wbGF5VHlwZVRvU3RyaW5nID0gKHR5cGUpIC0+XG4gIGlmIG1hdGNoZXMgPSB0eXBlLm1hdGNoKC9ecm9wKFxcZCspLylcbiAgICByZXR1cm4gXCJSdW4gb2YgI3ttYXRjaGVzWzFdfSBQYWlyc1wiXG4gIGlmIG1hdGNoZXMgPSB0eXBlLm1hdGNoKC9ecnVuKFxcZCspLylcbiAgICByZXR1cm4gXCJSdW4gb2YgI3ttYXRjaGVzWzFdfVwiXG4gIGlmIG1hdGNoZXMgPSB0eXBlLm1hdGNoKC9ea2luZChcXGQrKS8pXG4gICAgaWYgbWF0Y2hlc1sxXSA9PSAnMSdcbiAgICAgIHJldHVybiAnU2luZ2xlJ1xuICAgIGlmIG1hdGNoZXNbMV0gPT0gJzInXG4gICAgICByZXR1cm4gJ1BhaXInXG4gICAgaWYgbWF0Y2hlc1sxXSA9PSAnMydcbiAgICAgIHJldHVybiAnVHJpcHMnXG4gICAgcmV0dXJuICdRdWFkcydcbiAgcmV0dXJuIHR5cGVcblxucGxheVRvU3RyaW5nID0gKHBsYXkpIC0+XG4gIGhpZ2hDYXJkID0gbmV3IENhcmQocGxheS5oaWdoKVxuICByZXR1cm4gXCIje3BsYXlUeXBlVG9TdHJpbmcocGxheS50eXBlKX0gLSAje2hpZ2hDYXJkLmdseXBoZWROYW1lKCl9XCJcblxucGxheVRvQ2FyZENvdW50ID0gKHBsYXkpIC0+XG4gIGlmIG1hdGNoZXMgPSBwbGF5LnR5cGUubWF0Y2goL15yb3AoXFxkKykvKVxuICAgIHJldHVybiBwYXJzZUludChtYXRjaGVzWzFdKSAqIDJcbiAgaWYgbWF0Y2hlcyA9IHBsYXkudHlwZS5tYXRjaCgvXnJ1bihcXGQrKS8pXG4gICAgcmV0dXJuIHBhcnNlSW50KG1hdGNoZXNbMV0pXG4gIGlmIG1hdGNoZXMgPSBwbGF5LnR5cGUubWF0Y2goL15raW5kKFxcZCspLylcbiAgICByZXR1cm4gcGFyc2VJbnQobWF0Y2hlc1sxXSlcbiAgcmV0dXJuIDEgIyA/P1xuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBEZWNrXG5cbmNsYXNzIFNodWZmbGVkRGVja1xuICBjb25zdHJ1Y3RvcjogLT5cbiAgICAjIGRhdCBpbnNpZGUtb3V0IHNodWZmbGUhXG4gICAgQGNhcmRzID0gWyAwIF1cbiAgICBmb3IgaSBpbiBbMS4uLjUyXVxuICAgICAgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGkpXG4gICAgICBAY2FyZHMucHVzaChAY2FyZHNbal0pXG4gICAgICBAY2FyZHNbal0gPSBpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEFjaGlldmVtZW50c1xuXG5hY2hpZXZlbWVudHNMaXN0ID0gW1xuICB7XG4gICAgaWQ6IFwidmV0ZXJhblwiXG4gICAgdGl0bGU6IFwiSSd2ZSBTZWVuIFNvbWUgVGhpbmdzXCJcbiAgICBkZXNjcmlwdGlvbjogW1wiUGxheSA1MCBIYW5kcy5cIl1cbiAgICBwcm9ncmVzczogKGFjaCkgLT5cbiAgICAgIGlmIGFjaC5zdGF0ZS50b3RhbEdhbWVzID49IDUwXG4gICAgICAgIHJldHVybiBcIlRvdGFsIFBsYXllZDogYGFhZmZhYWAje2FjaC5zdGF0ZS50b3RhbEdhbWVzfWBgIEdhbWVzXCJcbiAgICAgIHJldHVybiBcIlByb2dyZXNzOiAje2FjaC5zdGF0ZS50b3RhbEdhbWVzfSAvIDUwXCJcbiAgfVxuICB7XG4gICAgaWQ6IFwidHJ5aGFyZFwiXG4gICAgdGl0bGU6IFwiVHJ5aGFyZFwiXG4gICAgZGVzY3JpcHRpb246IFtcIkVhcm4gYSA1IGdhbWUgd2luIHN0cmVhay5cIl1cbiAgICBwcm9ncmVzczogKGFjaCkgLT5cbiAgICAgIGJlc3RTdHJlYWsgPSBhY2guc3RhdGUuYmVzdFN0cmVha1xuICAgICAgYmVzdFN0cmVhayA/PSAwXG4gICAgICBpZiBiZXN0U3RyZWFrID49IDVcbiAgICAgICAgcmV0dXJuIFwiQmVzdCBTdHJlYWs6IGBhYWZmYWFgI3tiZXN0U3RyZWFrfWBgIFdpbnNcIlxuICAgICAgcyA9IFwiXCJcbiAgICAgIGlmIGJlc3RTdHJlYWsgPiAxXG4gICAgICAgIHMgPSBcInNcIlxuICAgICAgcmV0dXJuIFwiQmVzdCBTdHJlYWs6ICN7YmVzdFN0cmVha30gV2luI3tzfVwiXG4gIH1cbiAge1xuICAgIGlkOiBcImJyZWFrZXJcIlxuICAgIHRpdGxlOiBcIlNwcmluZyBCcmVha1wiXG4gICAgZGVzY3JpcHRpb246IFtcIkJyZWFrIGEgMi5cIl1cbiAgfVxuICB7XG4gICAgaWQ6IFwia2VlcGl0bG93XCJcbiAgICB0aXRsZTogXCJLZWVwIEl0IExvdywgQm95c1wiXG4gICAgZGVzY3JpcHRpb246IFtcIlBsYXkgYSBTaW5nbGUgMiBvbiB0b3Agb2YgYSBTaW5nbGUgMy5cIl1cbiAgfVxuICB7XG4gICAgaWQ6IFwic3VpdGVkXCJcbiAgICB0aXRsZTogXCJEb2Vzbid0IEV2ZW4gTWF0dGVyXCJcbiAgICBkZXNjcmlwdGlvbjogW1wiVGhyb3cgYSBzdWl0ZWQgcnVuLlwiXVxuICB9XG4gIHtcbiAgICBpZDogXCJ0b255XCJcbiAgICB0aXRsZTogXCJUaGUgVG9ueVwiXG4gICAgZGVzY3JpcHRpb246IFtcIlRocm93IGEgcnVuIG9mIDcgb3IgbW9yZSBjYXJkcywgYW5kIHRoZW4gbG9zZS5cIl1cbiAgfVxuICB7XG4gICAgaWQ6IFwic2FtcGxlclwiXG4gICAgdGl0bGU6IFwiU2FtcGxlciBQbGF0dGVyXCJcbiAgICBkZXNjcmlwdGlvbjogW1wiSW4gYSBzaW5nbGUgaGFuZDogcGxheSBhdCBsZWFzdCBvbmUgU2luZ2xlLFwiLCBcIm9uZSBQYWlyLCBvbmUgVHJpcHMsIGFuZCBvbmUgUnVuLlwiXVxuICB9XG4gIHtcbiAgICBpZDogXCJ0cmFnZWR5XCJcbiAgICB0aXRsZTogXCJUcmFnZWR5XCJcbiAgICBkZXNjcmlwdGlvbjogW1wiQmVnaW4gdGhlIGdhbWUgYnkgdGhyb3dpbmcgYSB0d28gYnJlYWtlciBpbnZvbHZpbmdcIiwgXCJ0aGUgMyBvZiBTcGFkZXMuXCJdXG4gIH1cbiAge1xuICAgIGlkOiBcImluZG9taXRhYmxlXCJcbiAgICB0aXRsZTogXCJJbmRvbWl0YWJsZVwiXG4gICAgZGVzY3JpcHRpb246IFtcIlRocm93IGEgcnVuIGVuZGluZyBpbiB0aGUgQWNlIG9mIEhlYXJ0cy5cIl1cbiAgfVxuICB7XG4gICAgaWQ6IFwicmVrdFwiXG4gICAgdGl0bGU6IFwiR2V0IFJla3RcIlxuICAgIGRlc2NyaXB0aW9uOiBbXCJXaW4gd2hpbGUgYWxsIG9wcG9uZW50cyBzdGlsbCBoYXZlIDEwIG9yIG1vcmUgY2FyZHMuXCJdXG4gIH1cbiAge1xuICAgIGlkOiBcImxhdGVcIlxuICAgIHRpdGxlOiBcIkZhc2hpb25hYmx5IExhdGVcIlxuICAgIGRlc2NyaXB0aW9uOiBbXCJQYXNzIHVudGlsIGFsbCA0IDJzIGFyZSB0aHJvd24sIGFuZCB0aGVuIHdpbi5cIl1cbiAgfVxuICB7XG4gICAgaWQ6IFwicGFpcnNcIlxuICAgIHRpdGxlOiBcIlBhaXJpbmcgVXBcIlxuICAgIGRlc2NyaXB0aW9uOiBbXCJUaHJvdyA1IHBhaXJzIGluIGEgc2luZ2xlIHJvdW5kLlwiXVxuICB9XG4gIHtcbiAgICBpZDogXCJ5b3Vyc2VsZlwiXG4gICAgdGl0bGU6IFwiWW91IFBsYXllZCBZb3Vyc2VsZlwiXG4gICAgZGVzY3JpcHRpb246IFtcIkJlYXQgeW91ciBvd24gcGxheS5cIl1cbiAgfVxuICB7XG4gICAgaWQ6IFwidGhpcnRlZW5cIlxuICAgIHRpdGxlOiBcIlRoaXJ0ZWVuXCJcbiAgICBkZXNjcmlwdGlvbjogW1wiRWFybiAxMyBhY2hpZXZlbWVudHMuXCJdXG4gIH1cbl1cblxuYWNoaWV2ZW1lbnRzTWFwID0ge31cbmZvciBlIGluIGFjaGlldmVtZW50c0xpc3RcbiAgYWNoaWV2ZW1lbnRzTWFwW2UuaWRdID0gZVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBUaGlydGVlblxuXG5jbGFzcyBUaGlydGVlblxuICBAU1RBUlRJTkdfTU9ORVk6IDI1XG5cbiAgY29uc3RydWN0b3I6IChAZ2FtZSwgcGFyYW1zKSAtPlxuICAgIHJldHVybiBpZiBub3QgcGFyYW1zXG5cbiAgICBpZiBwYXJhbXMuc3RhdGVcbiAgICAgIGZvciBrLHYgb2YgcGFyYW1zLnN0YXRlXG4gICAgICAgIGlmIHBhcmFtcy5zdGF0ZS5oYXNPd25Qcm9wZXJ0eShrKVxuICAgICAgICAgIHRoaXNba10gPSBwYXJhbXMuc3RhdGVba11cbiAgICAgIEBpbml0QWNoaWV2ZW1lbnRzKClcbiAgICBlbHNlXG4gICAgICBAbmV3R2FtZShwYXJhbXMubW9uZXkpXG5cbiAgaW5pdEFjaGlldmVtZW50czogLT5cbiAgICBAYWNoID89IHt9XG4gICAgQGFjaC5lYXJuZWQgPz0ge31cbiAgICBAYWNoLnN0YXRlID89IHt9XG4gICAgQGFjaC5zdGF0ZS50b3RhbEdhbWVzID89IDBcbiAgICBAZmFuZmFyZXMgPSBbXVxuXG4gIGRlYWw6IChwYXJhbXMpIC0+XG4gICAgZGVjayA9IG5ldyBTaHVmZmxlZERlY2soKVxuICAgIGZvciBwbGF5ZXIsIHBsYXllckluZGV4IGluIEBwbGF5ZXJzXG4gICAgICBAZ2FtZS5sb2cgXCJkZWFsaW5nIDEzIGNhcmRzIHRvIHBsYXllciAje3BsYXllckluZGV4fVwiXG5cbiAgICAgIHBsYXllci5wbGFjZSA9IDBcbiAgICAgIHBsYXllci5oYW5kID0gW11cbiAgICAgIGZvciBqIGluIFswLi4uMTNdXG4gICAgICAgIHJhdyA9IGRlY2suY2FyZHMuc2hpZnQoKVxuICAgICAgICBpZiByYXcgPT0gMFxuICAgICAgICAgIEB0dXJuID0gcGxheWVySW5kZXhcbiAgICAgICAgcGxheWVyLmhhbmQucHVzaChyYXcpXG5cbiAgICAgICMgY29uc29sZS5sb2cgXCJAZ2FtZS5vcHRpb25zLnNvcnRJbmRleCAje0BnYW1lLm9wdGlvbnMuc29ydEluZGV4fVwiXG4gICAgICBpZiAoQGdhbWUub3B0aW9ucy5zb3J0SW5kZXggPT0gMCkgb3IgcGxheWVyLmFpXG4gICAgICAgICMgTm9ybWFsXG4gICAgICAgIHBsYXllci5oYW5kLnNvcnQgKGEsYikgLT4gcmV0dXJuIGEgLSBiXG4gICAgICBlbHNlXG4gICAgICAgICMgUmV2ZXJzZVxuICAgICAgICBwbGF5ZXIuaGFuZC5zb3J0IChhLGIpIC0+IHJldHVybiBiIC0gYVxuXG4gICAgQGluaXRBY2hpZXZlbWVudHMoKVxuICAgIEBhY2guc3RhdGUudGhyZXdTaW5nbGUgPSBmYWxzZVxuICAgIEBhY2guc3RhdGUudGhyZXdQYWlyID0gZmFsc2VcbiAgICBAYWNoLnN0YXRlLnRocmV3VHJpcHMgPSBmYWxzZVxuICAgIEBhY2guc3RhdGUudGhyZXdSdW4gPSBmYWxzZVxuICAgIEBhY2guc3RhdGUudGhyZXdSdW43ID0gZmFsc2VcbiAgICBAYWNoLnN0YXRlLnR3b3NTZWVuID0gMFxuICAgIEBhY2guc3RhdGUuZmFzaGlvbmFibHlMYXRlID0gZmFsc2VcbiAgICBAYWNoLnN0YXRlLnBhaXJzVGhyb3duID0gMFxuICAgIEBhY2guc3RhdGUuYmVzdFN0cmVhayA/PSAwXG5cbiAgICBAcGlsZSA9IFtdXG4gICAgQHBpbGVXaG8gPSAtMVxuICAgIEB0aHJvd0lEID0gMFxuICAgIEBjdXJyZW50UGxheSA9IG51bGxcbiAgICBAdW5wYXNzQWxsKClcblxuICAgIGZvck1vbmV5ID0gXCJcIlxuICAgIGlmIEBtb25leVxuICAgICAgZm9yTW9uZXkgPSBcIiAoZm9yIG1vbmV5KVwiXG4gICAgQG91dHB1dChcIkhhbmQgZGVhbHQje2Zvck1vbmV5fSwgXCIgKyBAcGxheWVyc1tAdHVybl0ubmFtZSArIFwiIHBsYXlzIGZpcnN0XCIpXG5cbiAgICByZXR1cm4gT0tcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIFRoaXJ0ZWVuIG1ldGhvZHNcblxuICBuZXdHYW1lOiAobW9uZXkgPSBmYWxzZSwga2VlcFN0cmVhayA9IGZhbHNlKSAtPlxuICAgICMgbmV3IGdhbWVcbiAgICBAbG9nID0gW11cbiAgICBpZiBrZWVwU3RyZWFrXG4gICAgICBAc3RyZWFrID89IDBcbiAgICAgIEBsYXN0U3RyZWFrID89IDBcbiAgICBlbHNlXG4gICAgICBAc3RyZWFrID0gMFxuICAgICAgQGxhc3RTdHJlYWsgPSAwXG4gICAgQG1vbmV5ID0gZmFsc2VcbiAgICBpZiBtb25leVxuICAgICAgQG1vbmV5ID0gdHJ1ZVxuICAgIGNvbnNvbGUubG9nIFwiZm9yIG1vbmV5OiAje0Btb25leX1cIlxuXG4gICAgQHBsYXllcnMgPSBbXG4gICAgICB7IGlkOiAxLCBuYW1lOiAnUGxheWVyJywgaW5kZXg6IDAsIHBhc3M6IGZhbHNlLCBtb25leTogVGhpcnRlZW4uU1RBUlRJTkdfTU9ORVkgfVxuICAgIF1cblxuICAgIGZvciBpIGluIFsxLi4uNF1cbiAgICAgIEBhZGRBSSgpXG5cbiAgICBAZGVhbCgpXG5cbiAgc2F2ZTogLT5cbiAgICBuYW1lcyA9IFwibG9nIHBsYXllcnMgdHVybiBwaWxlIHBpbGVXaG8gdGhyb3dJRCBjdXJyZW50UGxheSBzdHJlYWsgbGFzdFN0cmVhayBhY2ggbW9uZXlcIi5zcGxpdChcIiBcIilcbiAgICBzdGF0ZSA9IHt9XG4gICAgZm9yIG5hbWUgaW4gbmFtZXNcbiAgICAgIHN0YXRlW25hbWVdID0gdGhpc1tuYW1lXVxuICAgIHJldHVybiBzdGF0ZVxuXG4gIG91dHB1dDogKHRleHQpIC0+XG4gICAgQGxvZy5wdXNoIHRleHRcbiAgICB3aGlsZSBAbG9nLmxlbmd0aCA+IE1BWF9MT0dfTElORVNcbiAgICAgIEBsb2cuc2hpZnQoKVxuXG4gIGhlYWRsaW5lOiAtPlxuICAgIGlmIEBnYW1lT3ZlcigpXG4gICAgICByZXR1cm4gXCJHYW1lIE92ZXJcIlxuXG4gICAgaWYgQHBpbGUubGVuZ3RoID09IDBcbiAgICAgIHBsYXlTdHJpbmcgPSBcInRocm93IEFueXRoaW5nIHdpdGggdGhlIDNcXHhjOFwiXG4gICAgZWxzZVxuICAgICAgaWYgQGN1cnJlbnRQbGF5XG4gICAgICAgIHBsYXlTdHJpbmcgPSBcImJlYXQgXCIgKyBwbGF5VG9TdHJpbmcoQGN1cnJlbnRQbGF5KVxuICAgICAgZWxzZVxuICAgICAgICBwbGF5U3RyaW5nID0gXCJ0aHJvdyBBbnl0aGluZ1wiXG5cbiAgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxuICAgIGlmIGN1cnJlbnRQbGF5ZXIuYWlcbiAgICAgIHBsYXllckNvbG9yID0gJ2IwYjAwMCdcbiAgICBlbHNlXG4gICAgICBwbGF5ZXJDb2xvciA9ICdmZjc3MDAnXG4gICAgaGVhZGxpbmUgPSBcImAje3BsYXllckNvbG9yfWAje2N1cnJlbnRQbGF5ZXIubmFtZX1gZmZmZmZmYCB0byAje3BsYXlTdHJpbmd9XCJcbiAgICBpZiBAZXZlcnlvbmVQYXNzZWQoKVxuICAgICAgaGVhZGxpbmUgKz0gXCIgKG9yIHRocm93IGFueXRoaW5nKVwiXG4gICAgcmV0dXJuIGhlYWRsaW5lXG5cbiAgY2FuVGhyb3dBbnl0aGluZzogLT5cbiAgICBpZiBAcGlsZS5sZW5ndGggPT0gMFxuICAgICAgcmV0dXJuIHRydWVcbiAgICBpZiBub3QgQGN1cnJlbnRQbGF5XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGlmIEBldmVyeW9uZVBhc3NlZCgpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIHJldHVybiBmYWxzZVxuXG4gIGZpbmRQbGF5ZXI6IChpZCkgLT5cbiAgICBmb3IgcGxheWVyIGluIEBwbGF5ZXJzXG4gICAgICBpZiBwbGF5ZXIuaWQgPT0gaWRcbiAgICAgICAgcmV0dXJuIHBsYXllclxuICAgIHJldHVybiB1bmRlZmluZWRcblxuICBjdXJyZW50UGxheWVyOiAtPlxuICAgIHJldHVybiBAcGxheWVyc1tAdHVybl1cblxuICBmaW5kUGxhY2U6IChwbGFjZSkgLT5cbiAgICBmb3IgcGxheWVyIGluIEBwbGF5ZXJzXG4gICAgICBpZiAocGxhY2UgPT0gNCkgYW5kIChwbGF5ZXIucGxhY2UgPT0gMClcbiAgICAgICAgcmV0dXJuIHBsYXllclxuICAgICAgaWYgcGxheWVyLnBsYWNlID09IHBsYWNlXG4gICAgICAgIHJldHVybiBwbGF5ZXJcbiAgICByZXR1cm4gdW5kZWZpbmVkXG5cbiAgcGF5b3V0OiAtPlxuICAgIHBsYWNlMSA9IEBmaW5kUGxhY2UoMSlcbiAgICBwbGFjZTIgPSBAZmluZFBsYWNlKDIpXG4gICAgcGxhY2UzID0gQGZpbmRQbGFjZSgzKVxuICAgIHBsYWNlNCA9IEBmaW5kUGxhY2UoNClcblxuICAgIGlmIG5vdCBwbGFjZTEgb3Igbm90IHBsYWNlMiBvciBub3QgcGxhY2UzIG9yIG5vdCBwbGFjZTRcbiAgICAgIEBvdXRwdXQgXCJlcnJvciB3aXRoIHBheW91dHMhXCJcbiAgICAgIHJldHVyblxuXG4gICAgQG91dHB1dCBcIiN7cGxhY2U0Lm5hbWV9IHBheXMgJDIgdG8gI3twbGFjZTEubmFtZX1cIlxuICAgIEBvdXRwdXQgXCIje3BsYWNlMy5uYW1lfSBwYXlzICQxIHRvICN7cGxhY2UyLm5hbWV9XCJcblxuICAgIHBsYWNlMS5tb25leSArPSAyXG4gICAgcGxhY2UyLm1vbmV5ICs9IDFcbiAgICBwbGFjZTMubW9uZXkgKz0gLTFcbiAgICBwbGFjZTQubW9uZXkgKz0gLTJcbiAgICByZXR1cm5cblxuICAjIGFsbCBJTkNMVURJTkcgdGhlIGN1cnJlbnQgcGxheWVyXG4gIGVudGlyZVRhYmxlUGFzc2VkOiAtPlxuICAgIGZvciBwbGF5ZXIsIHBsYXllckluZGV4IGluIEBwbGF5ZXJzXG4gICAgICBpZiBwbGF5ZXIucGxhY2UgIT0gMFxuICAgICAgICBjb250aW51ZVxuICAgICAgaWYgbm90IHBsYXllci5wYXNzXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIHJldHVybiB0cnVlXG5cbiAgIyBhbGwgYnV0IHRoZSBjdXJyZW50IHBsYXllclxuICBldmVyeW9uZVBhc3NlZDogLT5cbiAgICBmb3IgcGxheWVyLCBwbGF5ZXJJbmRleCBpbiBAcGxheWVyc1xuICAgICAgaWYgKHBsYXllci5wbGFjZSAhPSAwKSBhbmQgKEBwaWxlV2hvICE9IHBsYXllckluZGV4KVxuICAgICAgICBjb250aW51ZVxuICAgICAgaWYgcGxheWVySW5kZXggPT0gQHR1cm5cbiAgICAgICAgY29udGludWVcbiAgICAgIGlmIG5vdCBwbGF5ZXIucGFzc1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICByZXR1cm4gdHJ1ZVxuXG4gIHBsYXllckFmdGVyOiAoaW5kZXgpIC0+XG4gICAgbG9vcFxuICAgICAgaW5kZXggPSAoaW5kZXggKyAxKSAlIEBwbGF5ZXJzLmxlbmd0aFxuICAgICAgaWYgQHBsYXllcnNbaW5kZXhdLnBsYWNlID09IDBcbiAgICAgICAgcmV0dXJuIGluZGV4XG4gICAgcmV0dXJuIDAgIyBpbXBvc3NpYmxlP1xuXG4gIGFkZFBsYXllcjogKHBsYXllcikgLT5cbiAgICBpZiBub3QgcGxheWVyLmFpXG4gICAgICBwbGF5ZXIuYWkgPSBmYWxzZVxuXG4gICAgQHBsYXllcnMucHVzaCBwbGF5ZXJcbiAgICBwbGF5ZXIuaW5kZXggPSBAcGxheWVycy5sZW5ndGggLSAxXG4gICAgQG91dHB1dChwbGF5ZXIubmFtZSArIFwiIGpvaW5zIHRoZSBnYW1lXCIpXG5cbiAgbmFtZVByZXNlbnQ6IChuYW1lKSAtPlxuICAgIGZvciBwbGF5ZXIgaW4gQHBsYXllcnNcbiAgICAgIGlmIHBsYXllci5uYW1lID09IG5hbWVcbiAgICAgICAgcmV0dXJuIHRydWVcblxuICAgIHJldHVybiBmYWxzZVxuXG4gIGFkZEFJOiAtPlxuICAgIGxvb3BcbiAgICAgIGNoYXJhY3RlciA9IHJhbmRvbUNoYXJhY3RlcigpXG4gICAgICBpZiBub3QgQG5hbWVQcmVzZW50KGNoYXJhY3Rlci5uYW1lKVxuICAgICAgICBicmVha1xuXG4gICAgYWkgPVxuICAgICAgY2hhcklEOiBjaGFyYWN0ZXIuaWRcbiAgICAgIG5hbWU6IGNoYXJhY3Rlci5uYW1lXG4gICAgICBpZDogJ2FpJyArIFN0cmluZyhAcGxheWVycy5sZW5ndGgpXG4gICAgICBwYXNzOiBmYWxzZVxuICAgICAgYWk6IHRydWVcbiAgICAgIG1vbmV5OiBUaGlydGVlbi5TVEFSVElOR19NT05FWVxuXG4gICAgQGFkZFBsYXllcihhaSlcblxuICAgIEBnYW1lLmxvZyhcImFkZGVkIEFJIHBsYXllclwiKVxuICAgIHJldHVybiBPS1xuXG4gIHVwZGF0ZVBsYXllckhhbmQ6IChjYXJkcykgLT5cbiAgICAjIFRoaXMgbWFpbnRhaW5zIHRoZSByZW9yZ2FuaXplZCBvcmRlciBvZiB0aGUgcGxheWVyJ3MgaGFuZFxuICAgIEBwbGF5ZXJzWzBdLmhhbmQgPSBjYXJkcy5zbGljZSgwKVxuXG4gIHdpbm5lcjogLT5cbiAgICBmb3IgcGxheWVyLCBpIGluIEBwbGF5ZXJzXG4gICAgICBpZiBwbGF5ZXIucGxhY2UgPT0gMVxuICAgICAgICByZXR1cm4gcGxheWVyXG4gICAgcmV0dXJuIG51bGxcblxuICBzb21lb25lR2F2ZVVwOiAtPlxuICAgIGlmIG5vdCBAbW9uZXlcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIGlmIG5vdCBAZ2FtZS5vcHRpb25zLmdpdmluZ1VwXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICBmb3IgcGxheWVyIGluIEBwbGF5ZXJzXG4gICAgICBpZiBwbGF5ZXIubW9uZXkgPD0gMFxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIHJldHVybiBmYWxzZVxuXG4gIGdhbWVPdmVyOiAtPlxuICAgIG5wID0gQG5leHRQbGFjZSgpXG4gICAgaWYgQG1vbmV5XG4gICAgICByZXR1cm4gKG5wID4gMylcbiAgICByZXR1cm4gKG5wID4gMSlcblxuICBoYXNDYXJkOiAoaGFuZCwgcmF3Q2FyZCkgLT5cbiAgICBmb3IgcmF3IGluIGhhbmRcbiAgICAgIGlmIHJhdyA9PSByYXdDYXJkXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgaGFzQ2FyZHM6IChoYW5kLCByYXdDYXJkcykgLT5cbiAgICBmb3IgcmF3IGluIHJhd0NhcmRzXG4gICAgICBpZiBub3QgQGhhc0NhcmQoaGFuZCwgcmF3KVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICByZXR1cm4gdHJ1ZVxuXG4gIHJlbW92ZUNhcmRzOiAoaGFuZCwgcmF3Q2FyZHMpIC0+XG4gICAgbmV3SGFuZCA9IFtdXG4gICAgZm9yIGNhcmQgaW4gaGFuZFxuICAgICAga2VlcE1lID0gdHJ1ZVxuICAgICAgZm9yIHJhdyBpbiByYXdDYXJkc1xuICAgICAgICBpZiBjYXJkID09IHJhd1xuICAgICAgICAgIGtlZXBNZSA9IGZhbHNlXG4gICAgICAgICAgYnJlYWtcbiAgICAgIGlmIGtlZXBNZVxuICAgICAgICBuZXdIYW5kLnB1c2ggY2FyZFxuICAgIHJldHVybiBuZXdIYW5kXG5cbiAgY2xhc3NpZnk6IChyYXdDYXJkcykgLT5cbiAgICBjYXJkcyA9IHJhd0NhcmRzLm1hcCAocmF3KSAtPiBuZXcgQ2FyZChyYXcpXG4gICAgY2FyZHMgPSBjYXJkcy5zb3J0IChhLCBiKSAtPiByZXR1cm4gYS5yYXcgLSBiLnJhd1xuICAgIGhpZ2hlc3RSYXcgPSBjYXJkc1tjYXJkcy5sZW5ndGggLSAxXS5yYXdcblxuICAgICMgbG9vayBmb3IgYSBydW4gb2YgcGFpcnNcbiAgICBpZiAoY2FyZHMubGVuZ3RoID49IDYpIGFuZCAoKGNhcmRzLmxlbmd0aCAlIDIpID09IDApXG4gICAgICBmb3VuZFJvcCA9IHRydWVcbiAgICAgIGZvciBjYXJkLCBjYXJkSW5kZXggaW4gY2FyZHNcbiAgICAgICAgaWYgY2FyZEluZGV4ID09IDBcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICBpZiBjYXJkLnZhbHVlID09IDEyXG4gICAgICAgICAgIyBubyAycyBpbiBhIHJ1blxuICAgICAgICAgIGZvdW5kUm9wID0gZmFsc2VcbiAgICAgICAgICBicmVha1xuICAgICAgICBpZiAoY2FyZEluZGV4ICUgMikgPT0gMVxuICAgICAgICAgICMgb2RkIGNhcmQsIG11c3QgbWF0Y2ggbGFzdCBjYXJkIGV4YWN0bHlcbiAgICAgICAgICBpZiBjYXJkLnZhbHVlICE9IChjYXJkc1tjYXJkSW5kZXggLSAxXS52YWx1ZSlcbiAgICAgICAgICAgIGZvdW5kUm9wID0gZmFsc2VcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAjIGV2ZW4gY2FyZCwgbXVzdCBpbmNyZW1lbnRcbiAgICAgICAgICBpZiBjYXJkLnZhbHVlICE9IChjYXJkc1tjYXJkSW5kZXggLSAxXS52YWx1ZSArIDEpXG4gICAgICAgICAgICBmb3VuZFJvcCA9IGZhbHNlXG4gICAgICAgICAgICBicmVha1xuXG4gICAgICBpZiBmb3VuZFJvcFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHR5cGU6ICdyb3AnICsgTWF0aC5mbG9vcihjYXJkcy5sZW5ndGggLyAyKVxuICAgICAgICAgIGhpZ2g6IGhpZ2hlc3RSYXdcbiAgICAgICAgfVxuXG4gICAgIyBsb29rIGZvciBhIHJ1blxuICAgIGlmIGNhcmRzLmxlbmd0aCA+PSAzXG4gICAgICBmb3VuZFJ1biA9IHRydWVcbiAgICAgIGZvciBjYXJkLCBjYXJkSW5kZXggaW4gY2FyZHNcbiAgICAgICAgaWYgY2FyZEluZGV4ID09IDBcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICBpZiBjYXJkLnZhbHVlID09IDEyXG4gICAgICAgICAgIyBubyAycyBpbiBhIHJ1blxuICAgICAgICAgIGZvdW5kUnVuID0gZmFsc2VcbiAgICAgICAgICBicmVha1xuICAgICAgICBpZiBjYXJkLnZhbHVlICE9IChjYXJkc1tjYXJkSW5kZXggLSAxXS52YWx1ZSArIDEpXG4gICAgICAgICAgZm91bmRSdW4gPSBmYWxzZVxuICAgICAgICAgIGJyZWFrXG5cbiAgICAgIGlmIGZvdW5kUnVuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdHlwZTogJ3J1bicgKyBjYXJkcy5sZW5ndGhcbiAgICAgICAgICBoaWdoOiBoaWdoZXN0UmF3XG4gICAgICAgIH1cblxuICAgICMgbG9vayBmb3IgWCBvZiBhIGtpbmRcbiAgICByZXFWYWx1ZSA9IGNhcmRzWzBdLnZhbHVlXG4gICAgZm9yIGNhcmQgaW4gY2FyZHNcbiAgICAgIGlmIGNhcmQudmFsdWUgIT0gcmVxVmFsdWVcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICB0eXBlID0gJ2tpbmQnICsgY2FyZHMubGVuZ3RoXG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IHR5cGVcbiAgICAgIGhpZ2g6IGhpZ2hlc3RSYXdcbiAgICB9XG5cbiAgaGFuZEhhczNTOiAoaGFuZCkgLT5cbiAgICBmb3IgcmF3IGluIGhhbmRcbiAgICAgIGlmIHJhdyA9PSAwXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgbmV4dFBsYWNlOiAtPlxuICAgIGhpZ2hlc3RQbGFjZSA9IDBcbiAgICBmb3IgcGxheWVyIGluIEBwbGF5ZXJzXG4gICAgICBwbGF5ZXIucGxhY2UgPz0gMFxuICAgICAgaWYgaGlnaGVzdFBsYWNlIDwgcGxheWVyLnBsYWNlXG4gICAgICAgIGhpZ2hlc3RQbGFjZSA9IHBsYXllci5wbGFjZVxuICAgIHJldHVybiBoaWdoZXN0UGxhY2UgKyAxXG5cbiAgc3BsaXRQbGF5VHlwZTogKHBsYXlUeXBlKSAtPlxuICAgIGlmIG1hdGNoZXMgPSBwbGF5VHlwZS5tYXRjaCgvXihbXjAtOV0rKShcXGQrKS8pXG4gICAgICByZXR1cm4gW21hdGNoZXNbMV0sIHBhcnNlSW50KG1hdGNoZXNbMl0pXVxuICAgIHJldHVybiBbcGxheVR5cGUsIDFdXG5cbiAgaGFzUGxheTogKGN1cnJlbnRQbGF5LCBoYW5kKSAtPlxuICAgICMgcXVpY2sgY2hlY2suIGlmIHlvdSBkb250IGhhdmUgZW5vdWdoIGNhcmRzLCB5b3UgY2FuJ3QgaGF2ZSBhIHBsYXlcbiAgICBpZiAocGxheVRvQ2FyZENvdW50KGN1cnJlbnRQbGF5KSA+IGhhbmQubGVuZ3RoKVxuICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICBpZiBAZ2FtZS5vcHRpb25zLmF1dG9wYXNzSW5kZXggPT0gMlxuICAgICAgIyBsaW1pdGVkLCBhc3N1bWUgdGhlcmUncyBhIHBsYXkgaW4gdGhlcmUgc29tZXdoZXJlLCBpZiB0aGVyZSdzIGVub3VnaCBjYXJkc1xuICAgICAgcmV0dXJuIHRydWVcblxuICAgIGxlZnRvdmVycyA9IFtdXG4gICAgcGxheXMgPSB7fVxuICAgIHNwbCA9IEBzcGxpdFBsYXlUeXBlKGN1cnJlbnRQbGF5LnR5cGUpXG4gICAgc3dpdGNoIHNwbFswXVxuICAgICAgd2hlbiAncm9wJ1xuICAgICAgICBsZWZ0b3ZlcnMgPSBAYWlDYWxjUm9wcyhoYW5kLCBwbGF5cywgc3BsWzFdKVxuICAgICAgd2hlbiAncnVuJ1xuICAgICAgICBsZWZ0b3ZlcnMgPSBAYWlDYWxjUnVucyhoYW5kLCBwbGF5cywgZmFsc2UsIHNwbFsxXSlcbiAgICAgIHdoZW4gJ2tpbmQnXG4gICAgICAgIGxlZnRvdmVycyA9IEBhbENhbGNLaW5kcyhoYW5kLCBwbGF5cywgdHJ1ZSlcblxuICAgIHBsYXlzLmtpbmQxID89IFtdXG4gICAgZm9yIGxlZnRvdmVyIGluIGxlZnRvdmVyc1xuICAgICAgcGxheXMua2luZDEucHVzaCBbbGVmdG92ZXJdXG5cbiAgICBpZiBwbGF5c1tjdXJyZW50UGxheS50eXBlXT8gYW5kIHBsYXlzW2N1cnJlbnRQbGF5LnR5cGVdLmxlbmd0aCA+IDBcbiAgICAgICAgZm9yIHBsYXkgaW4gcGxheXNbY3VycmVudFBsYXkudHlwZV1cbiAgICAgICAgICBpZiBAaGlnaGVzdENhcmQocGxheSkgPiBjdXJyZW50UGxheS5oaWdoXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgIyBzcGVjaWFsIGNhc2Uga2luZHNcbiAgICBpZiBzcGxbMF0gPT0gJ2tpbmQnXG4gICAgICAjIGNoZWNrIGJpZ2dlciBraW5kc1xuICAgICAgZm9yIGJpZ2dlcktpbmQgaW4gW3NwbFsxXS4uNF1cbiAgICAgICAgYmlnZ2VyVHlwZSA9IFwia2luZCN7YmlnZ2VyS2luZH1cIlxuICAgICAgICBpZiBwbGF5c1tiaWdnZXJUeXBlXT8gYW5kIHBsYXlzW2JpZ2dlclR5cGVdLmxlbmd0aCA+IDBcbiAgICAgICAgICAgIGZvciBwbGF5IGluIHBsYXlzW2JpZ2dlclR5cGVdXG4gICAgICAgICAgICAgIGlmIEBoaWdoZXN0Q2FyZChwbGF5KSA+IGN1cnJlbnRQbGF5LmhpZ2hcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgIyBubyBwbGF5cywgcGFzc1xuICAgIHJldHVybiBmYWxzZVxuXG4gIGNhblBhc3M6IChwYXJhbXMpIC0+XG4gICAgaWYgQGdhbWVPdmVyKClcbiAgICAgIHJldHVybiAnZ2FtZU92ZXInXG5cbiAgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxuICAgIGlmIHBhcmFtcy5pZCAhPSBjdXJyZW50UGxheWVyLmlkXG4gICAgICByZXR1cm4gJ25vdFlvdXJUdXJuJ1xuXG4gICAgaWYgQHBpbGUubGVuZ3RoID09IDBcbiAgICAgIHJldHVybiAnbXVzdFRocm93M1MnXG5cbiAgICBpZiBAZXZlcnlvbmVQYXNzZWQoKVxuICAgICAgcmV0dXJuICd0aHJvd0FueXRoaW5nJ1xuXG4gICAgcmV0dXJuIE9LXG5cbiAgY2FuUGxheTogKHBhcmFtcywgaW5jb21pbmdQbGF5LCBoYW5kSGFzM1MpIC0+XG4gICAgaWYgQGdhbWVPdmVyKClcbiAgICAgIHJldHVybiAnZ2FtZU92ZXInXG5cbiAgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxuICAgIGlmIHBhcmFtcy5pZCAhPSBjdXJyZW50UGxheWVyLmlkXG4gICAgICByZXR1cm4gJ25vdFlvdXJUdXJuJ1xuXG4gICAgaWYgaW5jb21pbmdQbGF5ID09IG51bGxcbiAgICAgIHJldHVybiAnaW52YWxpZFBsYXknXG5cbiAgICBpZiBAcGlsZS5sZW5ndGggPT0gMFxuICAgICAgaWYgbm90IGhhbmRIYXMzU1xuICAgICAgICByZXR1cm4gJ211c3RUaHJvdzNTJ1xuXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcbiAgICBpZiBjdXJyZW50UGxheWVyLnBhc3NcbiAgICAgIGlmIEBjdXJyZW50UGxheSBhbmQgQGNhbkJlQnJva2VuKEBjdXJyZW50UGxheSlcbiAgICAgICAgaWYgQGlzQnJlYWtlclR5cGUoaW5jb21pbmdQbGF5LnR5cGUpXG4gICAgICAgICAgcmV0dXJuIE9LXG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXR1cm4gJ211c3RCcmVha09yUGFzcydcbiAgICAgIHJldHVybiAnbXVzdFBhc3MnXG5cbiAgICBpZiBAY3VycmVudFBsYXkgPT0gbnVsbFxuICAgICAgcmV0dXJuIE9LXG5cbiAgICBpZiBAZXZlcnlvbmVQYXNzZWQoKVxuICAgICAgcmV0dXJuIE9LXG5cbiAgICBpZiBAY2FuQmVCcm9rZW4oQGN1cnJlbnRQbGF5KSBhbmQgQGlzQnJlYWtlclR5cGUoaW5jb21pbmdQbGF5LnR5cGUpXG4gICAgICAjIDIgYnJlYWtlciFcbiAgICAgIHJldHVybiBPS1xuXG4gICAgaWYgaW5jb21pbmdQbGF5LnR5cGUgIT0gQGN1cnJlbnRQbGF5LnR5cGVcbiAgICAgIHJldHVybiAnd3JvbmdQbGF5J1xuXG4gICAgaWYgaW5jb21pbmdQbGF5LmhpZ2ggPCBAY3VycmVudFBsYXkuaGlnaFxuICAgICAgcmV0dXJuICd0b29Mb3dQbGF5J1xuXG4gICAgcmV0dXJuIE9LXG5cbiAgcGxheTogKHBhcmFtcykgLT5cbiAgICBpbmNvbWluZ1BsYXkgPSBAY2xhc3NpZnkocGFyYW1zLmNhcmRzKVxuICAgIGNvbnNvbGUubG9nIFwiaW5jb21pbmdQbGF5XCIsIGluY29taW5nUGxheVxuXG4gICAgY29uc29sZS5sb2cgXCJzb21lb25lIGNhbGxpbmcgcGxheVwiLCBwYXJhbXNcbiAgICByZXQgPSBAY2FuUGxheShwYXJhbXMsIGluY29taW5nUGxheSwgQGhhbmRIYXMzUyhwYXJhbXMuY2FyZHMpKVxuICAgIGlmIHJldCAhPSBPS1xuICAgICAgcmV0dXJuIHJldFxuXG4gICAgYnJlYWtlclRocm93biA9IGZhbHNlXG4gICAgbmV3VGhyb3cgPSB0cnVlXG5cbiAgICAjIFRPRE86IG1ha2UgcHJldHR5IG5hbWVzIGJhc2VkIG9uIHRoZSBwbGF5LCBhZGQgcGxheSB0byBoZWFkbGluZVxuICAgIHZlcmIgPSBcInRocm93czpcIlxuICAgIGlmIEBjdXJyZW50UGxheVxuICAgICAgaWYgQGNhbkJlQnJva2VuKEBjdXJyZW50UGxheSkgYW5kIEBpc0JyZWFrZXJUeXBlKGluY29taW5nUGxheS50eXBlKVxuICAgICAgICAjIDIgYnJlYWtlciFcbiAgICAgICAgQHVucGFzc0FsbCgpXG4gICAgICAgIHZlcmIgPSBcImJyZWFrcyAyOlwiXG4gICAgICAgIGJyZWFrZXJUaHJvd24gPSB0cnVlXG4gICAgICAgIG5ld1Rocm93ID0gZmFsc2VcbiAgICAgIGVsc2UgaWYgKGluY29taW5nUGxheS50eXBlICE9IEBjdXJyZW50UGxheS50eXBlKSBvciAoaW5jb21pbmdQbGF5LmhpZ2ggPCBAY3VycmVudFBsYXkuaGlnaClcbiAgICAgICAgIyBOZXcgcGxheSFcbiAgICAgICAgQHVucGFzc0FsbCgpXG4gICAgICAgIHZlcmIgPSBcInRocm93cyBuZXc6XCJcbiAgICAgIGVsc2VcbiAgICAgICAgbmV3VGhyb3cgPSBmYWxzZVxuICAgIGVsc2VcbiAgICAgIHZlcmIgPSBcImJlZ2luczpcIlxuXG4gICAgIyBBY2hpZXZlbWVudHNcbiAgICBAYWNoLnN0YXRlLnR3b3NTZWVuID89IDBcbiAgICBAYWNoLnN0YXRlLnBhaXJzVGhyb3duID89IDBcbiAgICBmb3IgY2FyZCBpbiBwYXJhbXMuY2FyZHNcbiAgICAgIGlmIGNhcmQgPj0gNDhcbiAgICAgICAgQGFjaC5zdGF0ZS50d29zU2VlbiArPSAxXG4gICAgaWYgKEBhY2guc3RhdGUudHdvc1NlZW4gPT0gNCkgYW5kIChAcGxheWVyc1swXS5oYW5kLmxlbmd0aCA9PSAxMylcbiAgICAgIEBhY2guc3RhdGUuZmFzaGlvbmFibHlMYXRlID0gdHJ1ZVxuICAgIGNvbnNvbGUubG9nIFwiQGFjaC5zdGF0ZS5mYXNoaW9uYWJseUxhdGUgI3tAYWNoLnN0YXRlLmZhc2hpb25hYmx5TGF0ZX1cIlxuICAgIGlmIEB0dXJuID09IDBcbiAgICAgIGlmIEBldmVyeW9uZVBhc3NlZCgpIGFuZCBub3QgbmV3VGhyb3dcbiAgICAgICAgQGVhcm4gXCJ5b3Vyc2VsZlwiXG4gICAgICBpZiBpbmNvbWluZ1BsYXkudHlwZSA9PSAna2luZDInXG4gICAgICAgIEBhY2guc3RhdGUucGFpcnNUaHJvd24gKz0gMVxuICAgICAgICBpZiBAYWNoLnN0YXRlLnBhaXJzVGhyb3duID49IDVcbiAgICAgICAgICBAZWFybiBcInBhaXJzXCJcbiAgICAgIGlmIGJyZWFrZXJUaHJvd25cbiAgICAgICAgQGVhcm4gXCJicmVha2VyXCJcbiAgICAgIGlmIEBpc0JyZWFrZXJUeXBlKGluY29taW5nUGxheS50eXBlKSBhbmQgKEBwaWxlLmxlbmd0aCA9PSAwKVxuICAgICAgICBAZWFybiBcInRyYWdlZHlcIlxuICAgICAgaWYgQGlzUnVuVHlwZShpbmNvbWluZ1BsYXkudHlwZSkgYW5kIEBpc1N1aXRlZChwYXJhbXMuY2FyZHMpXG4gICAgICAgIEBlYXJuIFwic3VpdGVkXCJcbiAgICAgIGlmIEBjdXJyZW50UGxheSBhbmQgKEBjdXJyZW50UGxheS50eXBlID09ICdraW5kMScpIGFuZCAoQGN1cnJlbnRQbGF5LmhpZ2ggPD0gMykgYW5kIChpbmNvbWluZ1BsYXkudHlwZSA9PSAna2luZDEnKSBhbmQgKGluY29taW5nUGxheS5oaWdoID49IDQ4KVxuICAgICAgICBAZWFybiBcImtlZXBpdGxvd1wiXG4gICAgICBpZiBAaXNSdW5UeXBlKGluY29taW5nUGxheS50eXBlKSBhbmQgKGluY29taW5nUGxheS5oaWdoID09IDQ3KSAjIEFjZSBvZiBIZWFydHNcbiAgICAgICAgQGVhcm4gXCJpbmRvbWl0YWJsZVwiXG4gICAgICBpZiBAaXNCaWdSdW4oaW5jb21pbmdQbGF5LCA3KVxuICAgICAgICBjb25zb2xlLmxvZyBcInRocmV3UnVuNzogdHJ1ZVwiXG4gICAgICAgIEBhY2guc3RhdGUudGhyZXdSdW43ID0gdHJ1ZVxuICAgICAgaWYgaW5jb21pbmdQbGF5LnR5cGUgPT0gJ2tpbmQxJ1xuICAgICAgICBAYWNoLnN0YXRlLnRocmV3U2luZ2xlID0gdHJ1ZVxuICAgICAgaWYgaW5jb21pbmdQbGF5LnR5cGUgPT0gJ2tpbmQyJ1xuICAgICAgICBAYWNoLnN0YXRlLnRocmV3UGFpciA9IHRydWVcbiAgICAgIGlmIGluY29taW5nUGxheS50eXBlID09ICdraW5kMydcbiAgICAgICAgQGFjaC5zdGF0ZS50aHJld1RyaXBzID0gdHJ1ZVxuICAgICAgaWYgaW5jb21pbmdQbGF5LnR5cGUubWF0Y2goL15ydW4vKVxuICAgICAgICBAYWNoLnN0YXRlLnRocmV3UnVuID0gdHJ1ZVxuICAgICAgaWYgQGFjaC5zdGF0ZS50aHJld1NpbmdsZSBhbmQgQGFjaC5zdGF0ZS50aHJld1BhaXIgYW5kIEBhY2guc3RhdGUudGhyZXdUcmlwcyBhbmQgQGFjaC5zdGF0ZS50aHJld1J1blxuICAgICAgICBAZWFybiBcInNhbXBsZXJcIlxuXG4gICAgQGN1cnJlbnRQbGF5ID0gaW5jb21pbmdQbGF5XG5cbiAgICBAdGhyb3dJRCArPSAxXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcbiAgICBjdXJyZW50UGxheWVyLmhhbmQgPSBAcmVtb3ZlQ2FyZHMoY3VycmVudFBsYXllci5oYW5kLCBwYXJhbXMuY2FyZHMpXG5cbiAgICBAb3V0cHV0KFwiI3tjdXJyZW50UGxheWVyLm5hbWV9ICN7dmVyYn0gI3twbGF5VG9TdHJpbmcoaW5jb21pbmdQbGF5KX1cIilcblxuICAgIGlmIGN1cnJlbnRQbGF5ZXIuaGFuZC5sZW5ndGggPT0gMFxuICAgICAgIyBHYW1lIG92ZXIhIGRvIGdhbWVvdmVyIHRoaW5ncy5cblxuICAgICAgY3VycmVudFBsYXllci5wbGFjZSA9IEBuZXh0UGxhY2UoKVxuXG4gICAgICBpZiBAbW9uZXlcbiAgICAgICAgcGxhY2VTdHJpbmcgPSBcIjR0aFwiXG4gICAgICAgIGlmIGN1cnJlbnRQbGF5ZXIucGxhY2UgPT0gMVxuICAgICAgICAgIHBsYWNlU3RyaW5nID0gXCIxc3RcIlxuICAgICAgICBlbHNlIGlmIGN1cnJlbnRQbGF5ZXIucGxhY2UgPT0gMlxuICAgICAgICAgIHBsYWNlU3RyaW5nID0gXCIybmRcIlxuICAgICAgICBlbHNlIGlmIGN1cnJlbnRQbGF5ZXIucGxhY2UgPT0gM1xuICAgICAgICAgIHBsYWNlU3RyaW5nID0gXCIzcmRcIlxuICAgICAgICBAb3V0cHV0KFwiI3tjdXJyZW50UGxheWVyLm5hbWV9IHRha2VzICN7cGxhY2VTdHJpbmd9IHBsYWNlXCIpXG5cbiAgICAgICAgaWYgY3VycmVudFBsYXllci5wbGFjZSA9PSAzXG4gICAgICAgICAgQHBheW91dCgpXG5cbiAgICAgICAgICBpZiBAZ2FtZS5vcHRpb25zLmdpdmluZ1VwXG4gICAgICAgICAgICBmb3IgcGxheWVyIGluIEBwbGF5ZXJzXG4gICAgICAgICAgICAgIGlmIHBsYXllci5tb25leSA8PSAwXG4gICAgICAgICAgICAgICAgQG91dHB1dChcIiN7cGxheWVyLm5hbWV9IGdpdmVzIHVwXCIpXG5cbiAgICAgIGVsc2VcbiAgICAgICAgQG91dHB1dChcIiN7Y3VycmVudFBsYXllci5uYW1lfSB3aW5zIVwiKVxuXG4gICAgICBpZiBjdXJyZW50UGxheWVyLnBsYWNlID09IDFcbiAgICAgICAgaWYgQHR1cm4gPT0gMFxuICAgICAgICAgIEBzdHJlYWsgKz0gMVxuICAgICAgICAgIEBsYXN0U3RyZWFrID0gQHN0cmVha1xuICAgICAgICBlbHNlXG4gICAgICAgICAgQGxhc3RTdHJlYWsgPSBAc3RyZWFrXG4gICAgICAgICAgQHN0cmVhayA9IDBcblxuICAgICAgQGFjaC5zdGF0ZS5iZXN0U3RyZWFrID89IDBcbiAgICAgIGlmIEBhY2guc3RhdGUuYmVzdFN0cmVhayA8IEBsYXN0U3RyZWFrXG4gICAgICAgIEBhY2guc3RhdGUuYmVzdFN0cmVhayA9IEBsYXN0U3RyZWFrXG5cbiAgICAgICMgQWNoaWV2ZW1lbnRzXG4gICAgICBpZiBAYWNoLnN0YXRlLmJlc3RTdHJlYWsgPj0gNVxuICAgICAgICBAZWFybiBcInRyeWhhcmRcIlxuICAgICAgQGFjaC5zdGF0ZS50b3RhbEdhbWVzICs9IDFcbiAgICAgIGlmIEBhY2guc3RhdGUudG90YWxHYW1lcyA+PSA1MFxuICAgICAgICBAZWFybiBcInZldGVyYW5cIlxuICAgICAgaWYgY3VycmVudFBsYXllci5wbGFjZSA9PSAxXG4gICAgICAgIGlmIEB0dXJuID09IDBcbiAgICAgICAgICAjIHBsYXllciB3b25cbiAgICAgICAgICBpZiAoQHBsYXllcnNbMV0uaGFuZC5sZW5ndGggPj0gMTApIGFuZCAoQHBsYXllcnNbMl0uaGFuZC5sZW5ndGggPj0gMTApIGFuZCAoQHBsYXllcnNbM10uaGFuZC5sZW5ndGggPj0gMTApXG4gICAgICAgICAgICBAZWFybiBcInJla3RcIlxuICAgICAgICAgIGlmIEBhY2guc3RhdGUuZmFzaGlvbmFibHlMYXRlXG4gICAgICAgICAgICBAZWFybiBcImxhdGVcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgIyBwbGF5ZXIgbG9zdFxuICAgICAgICAgIGlmIEBhY2guc3RhdGUudGhyZXdSdW43XG4gICAgICAgICAgICBAZWFybiBcInRvbnlcIlxuXG4gICAgYWNoaWV2ZW1lbnRDb3VudCA9IDBcbiAgICBmb3IgYWNoaWV2ZW1lbnQgaW4gYWNoaWV2ZW1lbnRzTGlzdFxuICAgICAgaWYgQGFjaC5lYXJuZWRbYWNoaWV2ZW1lbnQuaWRdXG4gICAgICAgIGFjaGlldmVtZW50Q291bnQgKz0gMVxuICAgIGlmIGFjaGlldmVtZW50Q291bnQgPj0gMTNcbiAgICAgIEBlYXJuIFwidGhpcnRlZW5cIlxuXG4gICAgQHBpbGUgPSBwYXJhbXMuY2FyZHMuc2xpY2UoMClcbiAgICBAcGlsZVdobyA9IEB0dXJuXG5cbiAgICBAdHVybiA9IEBwbGF5ZXJBZnRlcihAdHVybilcbiAgICByZXR1cm4gT0tcblxuICB1bnBhc3NBbGw6IC0+XG4gICAgZm9yIHBsYXllciBpbiBAcGxheWVyc1xuICAgICAgcGxheWVyLnBhc3MgPSBmYWxzZVxuICAgIHJldHVyblxuXG4gIHBhc3M6IChwYXJhbXMpIC0+XG4gICAgcmV0ID0gQGNhblBhc3MocGFyYW1zKVxuICAgIGlmIHJldCAhPSBPS1xuICAgICAgcmV0dXJuIHJldFxuXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcbiAgICBpZiBub3QgY3VycmVudFBsYXllci5haSBhbmQgQGN1cnJlbnRQbGF5IGFuZCBub3QgQGhhc1BsYXkoQGN1cnJlbnRQbGF5LCBjdXJyZW50UGxheWVyLmhhbmQpXG4gICAgICBAb3V0cHV0KFwiI3tjdXJyZW50UGxheWVyLm5hbWV9IGF1dG8tcGFzc2VzIChubyBwbGF5cylcIilcbiAgICBlbHNlIGlmIGN1cnJlbnRQbGF5ZXIucGFzc1xuICAgICAgQG91dHB1dChcIiN7Y3VycmVudFBsYXllci5uYW1lfSBhdXRvLXBhc3Nlc1wiKVxuICAgIGVsc2VcbiAgICAgIEBvdXRwdXQoXCIje2N1cnJlbnRQbGF5ZXIubmFtZX0gcGFzc2VzXCIpXG4gICAgY3VycmVudFBsYXllci5wYXNzID0gdHJ1ZVxuICAgIEB0dXJuID0gQHBsYXllckFmdGVyKEB0dXJuKVxuICAgIEBnYW1lLnBpbGUucG9rZSgpXG4gICAgcmV0dXJuIE9LXG5cbiAgYWlQbGF5OiAoY3VycmVudFBsYXllciwgY2FyZHMpIC0+XG4gICAgcmV0dXJuIEBwbGF5KHsnaWQnOmN1cnJlbnRQbGF5ZXIuaWQsICdjYXJkcyc6Y2FyZHN9KVxuXG4gIGFpUGFzczogKGN1cnJlbnRQbGF5ZXIpIC0+XG4gICAgcmV0dXJuIEBwYXNzKHsnaWQnOmN1cnJlbnRQbGF5ZXIuaWR9KVxuXG4gIGVhcm46IChpZCkgLT5cbiAgICBpZiBAYWNoLmVhcm5lZFtpZF1cbiAgICAgIHJldHVyblxuICAgIGFjaGlldmVtZW50ID0gYWNoaWV2ZW1lbnRzTWFwW2lkXVxuICAgIGlmIG5vdCBhY2hpZXZlbWVudD9cbiAgICAgIHJldHVyblxuXG4gICAgQGFjaC5lYXJuZWRbaWRdID0gdHJ1ZVxuICAgIEBvdXRwdXQoXCJFYXJuZWQ6ICN7YWNoaWV2ZW1lbnQudGl0bGV9XCIpXG4gICAgQGZhbmZhcmVzLnB1c2ggYWNoaWV2ZW1lbnQudGl0bGVcblxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgQUlcblxuICAjIEdlbmVyaWMgbG9nZ2luZyBmdW5jdGlvbjsgcHJlcGVuZHMgY3VycmVudCBBSSBwbGF5ZXIncyBndXRzIGJlZm9yZSBwcmludGluZyB0ZXh0XG4gIGFpTG9nOiAodGV4dCkgLT5cbiAgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxuICAgIGlmIG5vdCBjdXJyZW50UGxheWVyLmFpXG4gICAgICByZXR1cm4gZmFsc2VcblxuICAgIGNoYXJhY3RlciA9IGFpQ2hhcmFjdGVyc1tjdXJyZW50UGxheWVyLmNoYXJJRF1cbiAgICBAZ2FtZS5sb2coJ0FJWycrY3VycmVudFBsYXllci5uYW1lKycgJytjaGFyYWN0ZXIuYnJhaW4rJ106IGhhbmQ6JytjYXJkc1RvU3RyaW5nKGN1cnJlbnRQbGF5ZXIuaGFuZCkrJyBwaWxlOicrY2FyZHNUb1N0cmluZyhAcGlsZSkrJyAnK3RleHQpXG5cbiAgIyBEZXRlY3RzIGlmIHRoZSBjdXJyZW50IHBsYXllciBpcyBBSSBkdXJpbmcgYSBCSUQgb3IgVFJJQ0sgcGhhc2UgYW5kIGFjdHMgYWNjb3JkaW5nIHRvIHRoZWlyICdicmFpbidcbiAgYWlUaWNrOiAtPlxuICAgIGlmIEBnYW1lT3ZlcigpXG4gICAgICByZXR1cm4gZmFsc2VcblxuICAgIGlmIEBlbnRpcmVUYWJsZVBhc3NlZCgpXG4gICAgICBAdHVybiA9IEBwbGF5ZXJBZnRlcihAcGlsZVdobylcbiAgICAgIEB1bnBhc3NBbGwoKVxuICAgICAgQGN1cnJlbnRQbGF5ID0gbnVsbFxuICAgICAgQG91dHB1dCgnV2hvbGUgdGFibGUgcGFzc2VzLCBjb250cm9sIHRvICcgKyBAcGxheWVyc1tAdHVybl0ubmFtZSlcblxuICAgIGN1cnJlbnRQbGF5ZXIgPSBAY3VycmVudFBsYXllcigpXG4gICAgaWYgbm90IGN1cnJlbnRQbGF5ZXIuYWlcbiAgICAgIGlmIEBnYW1lLm9wdGlvbnMuYXV0b3Bhc3NJbmRleCAhPSAwICMgTm90IGRpc2FibGVkXG4gICAgICAgIGlmIG5vdCBAY2FuVGhyb3dBbnl0aGluZygpXG4gICAgICAgICAgaWYgQGN1cnJlbnRQbGF5IGFuZCAoQGN1cnJlbnRQbGF5LnR5cGUgPT0gJ2tpbmQxJykgYW5kIChAY3VycmVudFBsYXkuaGlnaCA+PSA0OCkgYW5kIEBoYXNCcmVha2VyKGN1cnJlbnRQbGF5ZXIuaGFuZClcbiAgICAgICAgICAgICMgZG8gbm90aGluZywgcGxheWVyIGNhbiBkcm9wIGEgYnJlYWtlclxuICAgICAgICAgIGVsc2UgaWYgQGN1cnJlbnRQbGF5IGFuZCBub3QgQGhhc1BsYXkoQGN1cnJlbnRQbGF5LCBjdXJyZW50UGxheWVyLmhhbmQpXG4gICAgICAgICAgICBAYWlMb2coXCJhdXRvcGFzc2luZyBmb3IgcGxheWVyLCBubyBwbGF5c1wiKVxuICAgICAgICAgICAgQGFpUGFzcyhjdXJyZW50UGxheWVyKVxuICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICBlbHNlIGlmIGN1cnJlbnRQbGF5ZXIucGFzc1xuICAgICAgICAgICAgQGFpTG9nKFwiYXV0b3Bhc3NpbmcgZm9yIHBsYXllclwiKVxuICAgICAgICAgICAgQGFpUGFzcyhjdXJyZW50UGxheWVyKVxuICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgY2hhcmFjdGVyID0gYWlDaGFyYWN0ZXJzW2N1cnJlbnRQbGF5ZXIuY2hhcklEXVxuICAgIHJldCA9IEBicmFpbnNbY2hhcmFjdGVyLmJyYWluXS5wbGF5LmFwcGx5KHRoaXMsIFtjdXJyZW50UGxheWVyLCBAY3VycmVudFBsYXksIEBldmVyeW9uZVBhc3NlZCgpXSlcbiAgICBpZiByZXQgPT0gT0tcbiAgICAgIHJldHVybiB0cnVlXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgYWxDYWxjS2luZHM6IChoYW5kLCBwbGF5cywgbWF0Y2gycyA9IGZhbHNlKSAtPlxuICAgIGNhcmRzID0gaGFuZC5tYXAgKHJhdykgLT4gbmV3IENhcmQocmF3KVxuICAgIGNhcmRzID0gY2FyZHMuc29ydCAoYSwgYikgLT4gcmV0dXJuIGEucmF3IC0gYi5yYXdcbiAgICB2YWx1ZUFycmF5cyA9IFtdXG4gICAgZm9yIGkgaW4gWzAuLi4xM11cbiAgICAgIHZhbHVlQXJyYXlzLnB1c2ggW11cbiAgICBmb3IgY2FyZCBpbiBjYXJkc1xuICAgICAgdmFsdWVBcnJheXNbY2FyZC52YWx1ZV0ucHVzaChjYXJkKVxuXG4gICAgaGFuZCA9IFtdXG4gICAgZm9yIHZhbHVlQXJyYXksIHZhbHVlIGluIHZhbHVlQXJyYXlzXG4gICAgICBpZiAodmFsdWVBcnJheS5sZW5ndGggPiAxKSBhbmQgKG1hdGNoMnMgb3IgKHZhbHVlIDwgMTIpKVxuICAgICAgICBrZXkgPSBcImtpbmQje3ZhbHVlQXJyYXkubGVuZ3RofVwiXG4gICAgICAgIHBsYXlzW2tleV0gPz0gW11cbiAgICAgICAgcGxheXNba2V5XS5wdXNoIHZhbHVlQXJyYXkubWFwICh2KSAtPiB2LnJhd1xuICAgICAgZWxzZVxuICAgICAgICBmb3IgdiBpbiB2YWx1ZUFycmF5XG4gICAgICAgICAgaGFuZC5wdXNoIHYucmF3XG5cbiAgICByZXR1cm4gaGFuZFxuXG4gIGFpRmluZFJ1bnM6IChoYW5kLCBlYWNoU2l6ZSwgc2l6ZSwgcHJlZmVyU3Ryb25nUnVucyA9IGZhbHNlKSAtPlxuICAgIHJ1bnMgPSBbXVxuXG4gICAgY2FyZHMgPSBoYW5kLm1hcCAocmF3KSAtPiBuZXcgQ2FyZChyYXcpXG4gICAgY2FyZHMgPSBjYXJkcy5zb3J0IChhLCBiKSAtPiByZXR1cm4gYS5yYXcgLSBiLnJhd1xuICAgIHZhbHVlQXJyYXlzID0gW11cbiAgICBmb3IgaSBpbiBbMC4uLjEzXVxuICAgICAgdmFsdWVBcnJheXMucHVzaCBbXVxuICAgIGZvciBjYXJkIGluIGNhcmRzXG4gICAgICB2YWx1ZUFycmF5c1tjYXJkLnZhbHVlXS5wdXNoKGNhcmQpXG5cbiAgICBpZiBwcmVmZXJTdHJvbmdSdW5zXG4gICAgICBmaXJzdFN0YXJ0aW5nVmFsdWUgPSAxMiAtIHNpemVcbiAgICAgIGxhc3RTdGFydGluZ1ZhbHVlID0gMFxuICAgICAgYnlBbW91bnQgPSAtMVxuICAgIGVsc2VcbiAgICAgIGZpcnN0U3RhcnRpbmdWYWx1ZSA9IDBcbiAgICAgIGxhc3RTdGFydGluZ1ZhbHVlID0gMTIgLSBzaXplXG4gICAgICBieUFtb3VudCA9IDFcbiAgICBmb3Igc3RhcnRpbmdWYWx1ZSBpbiBbZmlyc3RTdGFydGluZ1ZhbHVlLi5sYXN0U3RhcnRpbmdWYWx1ZV0gYnkgYnlBbW91bnRcbiAgICAgIHJ1bkZvdW5kID0gdHJ1ZVxuICAgICAgZm9yIG9mZnNldCBpbiBbMC4uLnNpemVdXG4gICAgICAgIGlmIHZhbHVlQXJyYXlzW3N0YXJ0aW5nVmFsdWUrb2Zmc2V0XS5sZW5ndGggPCBlYWNoU2l6ZVxuICAgICAgICAgIHJ1bkZvdW5kID0gZmFsc2VcbiAgICAgICAgICBicmVha1xuICAgICAgaWYgcnVuRm91bmRcbiAgICAgICAgcnVuID0gW11cbiAgICAgICAgZm9yIG9mZnNldCBpbiBbMC4uLnNpemVdXG4gICAgICAgICAgZm9yIGVhY2ggaW4gWzAuLi5lYWNoU2l6ZV1cbiAgICAgICAgICAgIHJ1bi5wdXNoKHZhbHVlQXJyYXlzW3N0YXJ0aW5nVmFsdWUrb2Zmc2V0XS5wb3AoKS5yYXcpXG4gICAgICAgIHJ1bnMucHVzaCBydW5cblxuICAgIGxlZnRvdmVycyA9IFtdXG4gICAgZm9yIHZhbHVlQXJyYXkgaW4gdmFsdWVBcnJheXNcbiAgICAgIGZvciBjYXJkIGluIHZhbHVlQXJyYXlcbiAgICAgICAgbGVmdG92ZXJzLnB1c2ggY2FyZC5yYXdcblxuICAgIHJldHVybiBbcnVucywgbGVmdG92ZXJzXVxuXG4gIGFpQ2FsY1J1bnM6IChoYW5kLCBwbGF5cywgc21hbGxSdW5zLCBzaW5nbGVTaXplID0gbnVsbCkgLT5cbiAgICBpZiBzaW5nbGVTaXplICE9IG51bGxcbiAgICAgIHByZWZlclN0cm9uZ1J1bnMgPSB0cnVlXG4gICAgICBzdGFydFNpemUgPSBzaW5nbGVTaXplXG4gICAgICBlbmRTaXplID0gc2luZ2xlU2l6ZVxuICAgICAgYnlBbW91bnQgPSAxXG4gICAgZWxzZVxuICAgICAgcHJlZmVyU3Ryb25nUnVucyA9IGZhbHNlXG4gICAgICBpZiBzbWFsbFJ1bnNcbiAgICAgICAgc3RhcnRTaXplID0gM1xuICAgICAgICBlbmRTaXplID0gMTJcbiAgICAgICAgYnlBbW91bnQgPSAxXG4gICAgICBlbHNlXG4gICAgICAgIHN0YXJ0U2l6ZSA9IDEyXG4gICAgICAgIGVuZFNpemUgPSAzXG4gICAgICAgIGJ5QW1vdW50ID0gLTFcbiAgICBmb3IgcnVuU2l6ZSBpbiBbc3RhcnRTaXplLi5lbmRTaXplXSBieSBieUFtb3VudFxuICAgICAgW3J1bnMsIGxlZnRvdmVyc10gPSBAYWlGaW5kUnVucyhoYW5kLCAxLCBydW5TaXplLCBwcmVmZXJTdHJvbmdSdW5zKVxuICAgICAgaWYgcnVucy5sZW5ndGggPiAwXG4gICAgICAgIGtleSA9IFwicnVuI3tydW5TaXplfVwiXG4gICAgICAgIHBsYXlzW2tleV0gPSBydW5zXG4gICAgICBoYW5kID0gbGVmdG92ZXJzXG5cbiAgICByZXR1cm4gaGFuZFxuXG4gIGFpQ2FsY1JvcHM6IChoYW5kLCBwbGF5cywgc2luZ2xlU2l6ZSA9IG51bGwpIC0+XG4gICAgaWYgc2luZ2xlU2l6ZSAhPSBudWxsXG4gICAgICBwcmVmZXJTdHJvbmdSdW5zID0gdHJ1ZVxuICAgICAgc3RhcnRTaXplID0gc2luZ2xlU2l6ZVxuICAgICAgZW5kU2l6ZSA9IHNpbmdsZVNpemVcbiAgICBlbHNlXG4gICAgICBwcmVmZXJTdHJvbmdSdW5zID0gZmFsc2VcbiAgICAgIHN0YXJ0U2l6ZSA9IDNcbiAgICAgIGVuZFNpemUgPSA2XG4gICAgZm9yIHJ1blNpemUgaW4gW3N0YXJ0U2l6ZS4uZW5kU2l6ZV1cbiAgICAgIFtyb3BzLCBsZWZ0b3ZlcnNdID0gQGFpRmluZFJ1bnMoaGFuZCwgMiwgcnVuU2l6ZSwgcHJlZmVyU3Ryb25nUnVucylcbiAgICAgIGlmIHJvcHMubGVuZ3RoID4gMFxuICAgICAgICBrZXkgPSBcInJvcCN7cnVuU2l6ZX1cIlxuICAgICAgICBwbGF5c1trZXldID0gcm9wc1xuICAgICAgaGFuZCA9IGxlZnRvdmVyc1xuXG4gICAgcmV0dXJuIGhhbmRcblxuICBhaUNhbGNQbGF5czogKGhhbmQsIHN0cmF0ZWd5ID0ge30pIC0+XG4gICAgcGxheXMgPSB7fVxuXG4gICAgIyBXZSBhbHdheXMgd2FudCB0byB1c2Ugcm9wcyBpZiB3ZSBoYXZlIG9uZVxuICAgIGlmIHN0cmF0ZWd5LnNlZXNSb3BzXG4gICAgICBoYW5kID0gQGFpQ2FsY1JvcHMoaGFuZCwgcGxheXMpXG5cbiAgICBpZiBzdHJhdGVneS5wcmVmZXJzUnVuc1xuICAgICAgaGFuZCA9IEBhaUNhbGNSdW5zKGhhbmQsIHBsYXlzLCBzdHJhdGVneS5zbWFsbFJ1bnMpXG4gICAgICBoYW5kID0gQGFsQ2FsY0tpbmRzKGhhbmQsIHBsYXlzLCBzdHJhdGVneS5tYXRjaDJzKVxuICAgIGVsc2VcbiAgICAgIGhhbmQgPSBAYWxDYWxjS2luZHMoaGFuZCwgcGxheXMsIHN0cmF0ZWd5Lm1hdGNoMnMpXG4gICAgICBoYW5kID0gQGFpQ2FsY1J1bnMoaGFuZCwgcGxheXMsIHN0cmF0ZWd5LnNtYWxsUnVucylcblxuICAgIGtpbmQxID0gaGFuZC5tYXAgKHYpIC0+IFt2XVxuICAgIGlmIGtpbmQxLmxlbmd0aCA+IDBcbiAgICAgIHBsYXlzLmtpbmQxID0ga2luZDFcbiAgICByZXR1cm4gcGxheXNcblxuICBudW1iZXJPZlNpbmdsZXM6IChwbGF5cykgLT5cbiAgICBpZiBub3QgcGxheXMua2luZDE/XG4gICAgICByZXR1cm4gMFxuICAgIG5vblR3b1NpbmdsZXMgPSAwXG4gICAgZm9yIHJhdyBpbiBwbGF5cy5raW5kMVxuICAgICAgaWYgcmF3IDwgNDhcbiAgICAgICAgbm9uVHdvU2luZ2xlcyArPSAxXG4gICAgcmV0dXJuIG5vblR3b1NpbmdsZXNcblxuICBicmVha2VyUGxheXM6IChoYW5kKSAtPlxuICAgIHJldHVybiBAYWlDYWxjUGxheXMoaGFuZCwgeyBzZWVzUm9wczogdHJ1ZSwgcHJlZmVyc1J1bnM6IGZhbHNlIH0pXG5cbiAgaXNCcmVha2VyVHlwZTogKHBsYXlUeXBlKSAtPlxuICAgIGlmIHBsYXlUeXBlLm1hdGNoKC9ecm9wLykgb3IgcGxheVR5cGUgPT0gJ2tpbmQ0J1xuICAgICAgcmV0dXJuIHRydWVcbiAgICByZXR1cm4gZmFsc2VcblxuICBjYW5CZUJyb2tlbjogKHBsYXkpIC0+XG4gICAgaWYgcGxheS50eXBlICE9ICdraW5kMSdcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIGNhcmQgPSBuZXcgQ2FyZChwbGF5LmhpZ2gpXG4gICAgcmV0dXJuIChjYXJkLnZhbHVlID09IDEyKVxuXG4gIGhhc0JyZWFrZXI6IChoYW5kKSAtPlxuICAgIHBsYXlzID0gQGJyZWFrZXJQbGF5cyhoYW5kKVxuICAgIGZvciBwbGF5VHlwZSwgcGxheWxpc3Qgb2YgcGxheXNcbiAgICAgIGlmIEBpc0JyZWFrZXJUeXBlKHBsYXlUeXBlKVxuICAgICAgICBpZiBwbGF5bGlzdC5sZW5ndGggPiAwXG4gICAgICAgICAgcmV0dXJuIHRydWVcbiAgICByZXR1cm4gZmFsc2VcblxuICBpc1J1blR5cGU6IChwbGF5VHlwZSkgLT5cbiAgICBpZiBwbGF5VHlwZS5tYXRjaCgvXnJ1bi8pXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIHJldHVybiBmYWxzZVxuXG4gIGlzU3VpdGVkOiAoaGFuZCkgLT5cbiAgICBpZiBoYW5kLmxlbmd0aCA8IDFcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIGNhcmRzID0gaGFuZC5tYXAgKHJhdykgLT4gbmV3IENhcmQocmF3KVxuICAgIHN1aXQgPSBjYXJkc1swXS5zdWl0XG4gICAgZm9yIGNhcmQgaW4gY2FyZHNcbiAgICAgIGlmIGNhcmQuc3VpdCAhPSBzdWl0XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIHJldHVybiB0cnVlXG5cbiAgaXNCaWdSdW46IChwbGF5LCBhdExlYXN0KSAtPlxuICAgIGlmIG1hdGNoZXMgPSBwbGF5LnR5cGUubWF0Y2goL15ydW4oXFxkKykvKVxuICAgICAgbGVuID0gcGFyc2VJbnQobWF0Y2hlc1sxXSlcbiAgICAgIGlmIGxlbiA+PSBhdExlYXN0XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgYWlDYWxjQmVzdFBsYXlzOiAoaGFuZCkgLT5cbiAgICBiZXN0UGxheXMgPSBudWxsXG4gICAgZm9yIGJpdHMgaW4gWzAuLi4xNl1cbiAgICAgIHN0cmF0ZWd5ID1cbiAgICAgICAgc21hbGxSdW5zOiAoYml0cyAmIDEpID09IDFcbiAgICAgICAgcHJlZmVyc1J1bnM6IChiaXRzICYgMikgPT0gMlxuICAgICAgICBtYXRjaDJzOiAoYml0cyAmIDQpID09IDRcbiAgICAgICAgc2Vlc1JvcHM6IChiaXRzICYgOCkgPT0gOFxuICAgICAgcGxheXMgPSBAYWlDYWxjUGxheXMoaGFuZCwgc3RyYXRlZ3kpXG4gICAgICBpZiBiZXN0UGxheXMgPT0gbnVsbFxuICAgICAgICBiZXN0UGxheXMgPSBwbGF5c1xuICAgICAgZWxzZVxuICAgICAgICBucCA9IEBudW1iZXJPZlNpbmdsZXMocGxheXMpXG4gICAgICAgIG5icCA9IEBudW1iZXJPZlNpbmdsZXMoYmVzdFBsYXlzKVxuICAgICAgICBpZiBucCA8IG5icFxuICAgICAgICAgIGJlc3RQbGF5cyA9IHBsYXlzXG4gICAgICAgIGVsc2UgaWYgbnAgPT0gbmJwXG4gICAgICAgICAgIyBmbGlwIGEgY29pbiFcbiAgICAgICAgICBpZiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKSA9PSAwXG4gICAgICAgICAgICBiZXN0UGxheXMgPSBwbGF5c1xuICAgIHJldHVybiBiZXN0UGxheXNcblxuICBwcmV0dHlQbGF5czogKHBsYXlzLCBleHRyYVByZXR0eSA9IGZhbHNlKSAtPlxuICAgIHByZXR0eSA9IHt9XG4gICAgZm9yIHR5cGUsIGFyciBvZiBwbGF5c1xuICAgICAgcHJldHR5W3R5cGVdID0gW11cbiAgICAgIGZvciBwbGF5IGluIGFyclxuICAgICAgICBuYW1lcyA9IFtdXG4gICAgICAgIGZvciByYXcgaW4gcGxheVxuICAgICAgICAgIGNhcmQgPSBuZXcgQ2FyZChyYXcpXG4gICAgICAgICAgbmFtZXMucHVzaChjYXJkLm5hbWUpXG4gICAgICAgIHByZXR0eVt0eXBlXS5wdXNoKG5hbWVzKVxuICAgIGlmIGV4dHJhUHJldHR5XG4gICAgICBzID0gXCJcIlxuICAgICAgZm9yIHR5cGVOYW1lLCB0aHJvd3Mgb2YgcHJldHR5XG4gICAgICAgIHMgKz0gXCIgICAgICAqICN7cGxheVR5cGVUb1N0cmluZyh0eXBlTmFtZSl9OlxcblwiXG4gICAgICAgIGlmIHR5cGVOYW1lID09ICdraW5kMSdcbiAgICAgICAgICBzICs9IFwiICAgICAgICAqICN7dGhyb3dzLm1hcCgodikgLT4gdlswXSkuam9pbignLCcpfVxcblwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBmb3IgdCBpbiB0aHJvd3NcbiAgICAgICAgICAgIHMgKz0gXCIgICAgICAgICogI3t0LmpvaW4oJywnKX1cXG5cIlxuICAgICAgcmV0dXJuIHNcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocHJldHR5KVxuXG4gIGhpZ2hlc3RDYXJkOiAocGxheSkgLT5cbiAgICBoaWdoZXN0ID0gMFxuICAgIGZvciBwIGluIHBsYXlcbiAgICAgIGlmIGhpZ2hlc3QgPCBwXG4gICAgICAgIGhpZ2hlc3QgPSBwXG4gICAgcmV0dXJuIGhpZ2hlc3RcblxuICBmaW5kUGxheVdpdGgzUzogKHBsYXlzKSAtPlxuICAgIGZvciBwbGF5VHlwZSwgcGxheWxpc3Qgb2YgcGxheXNcbiAgICAgIGZvciBwbGF5IGluIHBsYXlsaXN0XG4gICAgICAgIGlmIEBoYW5kSGFzM1MocGxheSlcbiAgICAgICAgICByZXR1cm4gcGxheVxuXG4gICAgY29uc29sZS5sb2cgXCJmaW5kUGxheVdpdGgzUzogc29tZXRoaW5nIGltcG9zc2libGUgaXMgaGFwcGVuaW5nXCJcbiAgICByZXR1cm4gW11cblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQUkgQnJhaW5zXG5cbiAgIyBCcmFpbnMgbXVzdCBoYXZlOlxuICAjICogaWQ6IGludGVybmFsIGlkZW50aWZpZXIgZm9yIHRoZSBicmFpblxuICAjICogbmFtZTogcHJldHR5IG5hbWVcbiAgIyAqIHBsYXkoY3VycmVudFBsYXllcikgYXR0ZW1wdHMgdG8gcGxheSBhIGNhcmQgYnkgY2FsbGluZyBhaVBsYXkoKS4gU2hvdWxkIHJldHVybiB0cnVlIGlmIGl0IHN1Y2Nlc3NmdWxseSBwbGF5ZWQgYSBjYXJkIChhaVBsYXkoKSByZXR1cm5lZCB0cnVlKVxuICBicmFpbnM6XG5cbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICMgTm9ybWFsOiBJbnRlbmRlZCB0byBiZSB1c2VkIGJ5IG1vc3QgY2hhcmFjdGVycy5cbiAgICAjICAgICAgICAgTm90IHRvbyBkdW1iLCBub3QgdG9vIHNtYXJ0LlxuICAgIG5vcm1hbDpcbiAgICAgIGlkOiAgIFwibm9ybWFsXCJcbiAgICAgIG5hbWU6IFwiTm9ybWFsXCJcblxuICAgICAgIyBub3JtYWxcbiAgICAgIHBsYXk6IChjdXJyZW50UGxheWVyLCBjdXJyZW50UGxheSwgZXZlcnlvbmVQYXNzZWQpIC0+XG4gICAgICAgIGlmIGN1cnJlbnRQbGF5ZXIucGFzc1xuICAgICAgICAgIGlmIEBjYW5CZUJyb2tlbihjdXJyZW50UGxheSkgYW5kIEBoYXNCcmVha2VyKGN1cnJlbnRQbGF5ZXIuaGFuZClcbiAgICAgICAgICAgIGJyZWFrZXJQbGF5cyA9IEBicmVha2VyUGxheXMoY3VycmVudFBsYXllci5oYW5kKVxuICAgICAgICAgICAgZm9yIHBsYXlUeXBlLCBwbGF5bGlzdCBvZiBicmVha2VyUGxheXNcbiAgICAgICAgICAgICAgaWYgKHBsYXlUeXBlLm1hdGNoKC9ecm9wLykgb3IgKHBsYXlUeXBlID09ICdraW5kNCcpKSBhbmQgKHBsYXlsaXN0Lmxlbmd0aCA+IDApXG4gICAgICAgICAgICAgICAgQGFpTG9nKFwiYnJlYWtpbmcgMlwiKVxuICAgICAgICAgICAgICAgIGlmIEBhaVBsYXkoY3VycmVudFBsYXllciwgcGxheWxpc3RbMF0pID09IE9LXG4gICAgICAgICAgICAgICAgICByZXR1cm4gT0tcblxuICAgICAgICAgIEBhaUxvZyhcImFscmVhZHkgcGFzc2VkLCBnb2luZyB0byBrZWVwIHBhc3NpbmdcIilcbiAgICAgICAgICByZXR1cm4gQGFpUGFzcyhjdXJyZW50UGxheWVyKVxuXG4gICAgICAgIHBsYXlzID0gQGFpQ2FsY0Jlc3RQbGF5cyhjdXJyZW50UGxheWVyLmhhbmQpXG4gICAgICAgIEBhaUxvZyhcImJlc3QgcGxheXM6ICN7QHByZXR0eVBsYXlzKHBsYXlzKX1cIilcblxuICAgICAgICBpZiBAcGlsZS5sZW5ndGggPT0gMFxuICAgICAgICAgIHBsYXkgPSBAZmluZFBsYXlXaXRoM1MocGxheXMpXG4gICAgICAgICAgQGFpTG9nKFwiVGhyb3dpbmcgbXkgcGxheSB3aXRoIHRoZSAzUyBpbiBpdFwiKVxuICAgICAgICAgIGlmIEBhaVBsYXkoY3VycmVudFBsYXllciwgcGxheSkgPT0gT0tcbiAgICAgICAgICAgIHJldHVybiBPS1xuXG4gICAgICAgIGlmIGN1cnJlbnRQbGF5IGFuZCBub3QgZXZlcnlvbmVQYXNzZWRcbiAgICAgICAgICBpZiBwbGF5c1tjdXJyZW50UGxheS50eXBlXT8gYW5kIChwbGF5c1tjdXJyZW50UGxheS50eXBlXS5sZW5ndGggPiAwKVxuICAgICAgICAgICAgZm9yIHBsYXkgaW4gcGxheXNbY3VycmVudFBsYXkudHlwZV1cbiAgICAgICAgICAgICAgaWYgQGhpZ2hlc3RDYXJkKHBsYXkpID4gY3VycmVudFBsYXkuaGlnaFxuICAgICAgICAgICAgICAgIGlmIEBhaVBsYXkoY3VycmVudFBsYXllciwgcGxheSkgPT0gT0tcbiAgICAgICAgICAgICAgICAgIHJldHVybiBPS1xuICAgICAgICAgICAgQGFpTG9nKFwiSSBndWVzcyBJIGNhbid0IGFjdHVhbGx5IGJlYXQgdGhpcywgcGFzc2luZ1wiKVxuICAgICAgICAgICAgcmV0dXJuIEBhaVBhc3MoY3VycmVudFBsYXllcilcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBAYWlMb2coXCJJIGRvbid0IGhhdmUgdGhhdCBwbGF5LCBwYXNzaW5nXCIpXG4gICAgICAgICAgICByZXR1cm4gQGFpUGFzcyhjdXJyZW50UGxheWVyKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgIyBubyBjdXJyZW50IHBsYXksIHRocm93IHRoZSBmaXJzdCBjYXJkXG4gICAgICAgICAgQGFpTG9nKFwiSSBjYW4gZG8gYW55dGhpbmcsIHRocm93aW5nIGEgcmFuZG9tIHBsYXlcIilcbiAgICAgICAgICBwbGF5VHlwZXMgPSBPYmplY3Qua2V5cyhwbGF5cylcbiAgICAgICAgICBwbGF5VHlwZUluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcGxheVR5cGVzLmxlbmd0aClcbiAgICAgICAgICBpZiBAYWlQbGF5KGN1cnJlbnRQbGF5ZXIsIHBsYXlzW3BsYXlUeXBlc1twbGF5VHlwZUluZGV4XV1bMF0pID09IE9LXG4gICAgICAgICAgICByZXR1cm4gT0tcblxuICAgICAgICAjIGZpbmQgdGhlIGZpcnN0IGNhcmQgdGhhdCBiZWF0cyB0aGUgY3VycmVudFBsYXkncyBoaWdoXG4gICAgICAgIGZvciByYXdDYXJkIGluIGN1cnJlbnRQbGF5ZXIuaGFuZFxuICAgICAgICAgIGlmIHJhd0NhcmQgPiBjdXJyZW50UGxheS5oaWdoXG4gICAgICAgICAgICBAYWlMb2coXCJmb3VuZCBzbWFsbGVzdCBzaW5nbGUgKCN7cmF3Q2FyZH0pLCBwbGF5aW5nXCIpXG4gICAgICAgICAgICBpZiBAYWlQbGF5KGN1cnJlbnRQbGF5ZXIsIFtyYXdDYXJkXSkgPT0gT0tcbiAgICAgICAgICAgICAgcmV0dXJuIE9LXG4gICAgICAgICAgICBicmVha1xuXG4gICAgICAgIEBhaUxvZyhcIm5vdGhpbmcgZWxzZSB0byBkbywgcGFzc2luZ1wiKVxuICAgICAgICByZXR1cm4gQGFpUGFzcyhjdXJyZW50UGxheWVyKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBEZWJ1ZyBjb2RlXG5cbmRlYnVnID0gLT5cbiAgdGhpciA9IG5ldyBUaGlydGVlbigpXG4gIGZ1bGx5UGxheWVkID0gMFxuICB0b3RhbEF0dGVtcHRzID0gMTAwXG5cbiAgZm9yIGF0dGVtcHQgaW4gWzAuLi50b3RhbEF0dGVtcHRzXVxuICAgIGRlY2sgPSBuZXcgU2h1ZmZsZWREZWNrKClcbiAgICBoYW5kID0gW11cbiAgICBmb3IgaiBpbiBbMC4uLjEzXVxuICAgICAgcmF3ID0gZGVjay5jYXJkcy5zaGlmdCgpXG4gICAgICBoYW5kLnB1c2gocmF3KVxuICAgICMgaGFuZCA9IFs1MSw1MCw0OSw0OCw0Nyw0Niw0NSw0NCw0Myw0Miw0MSw0MCwzOV1cbiAgICAjIGhhbmQgPSBbMCwxLDIsMyw0LDUsNiw3LDgsOSwxMCwxMSwxMl1cbiAgICBoYW5kLnNvcnQgKGEsYikgLT4gcmV0dXJuIGEgLSBiXG5cbiAgICBjb25zb2xlLmxvZyhcIi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVwiKVxuICAgIGNvbnNvbGUubG9nKFwiSGFuZCAje2F0dGVtcHQrMX06ICN7Y2FyZHNUb1N0cmluZyhoYW5kKX1cIilcbiAgICBjb25zb2xlLmxvZyhcIlwiKVxuXG4gICAgZm91bmRGdWxseVBsYXllZCA9IGZhbHNlXG4gICAgZm9yIGJpdHMgaW4gWzAuLi4xNl1cbiAgICAgIHN0cmF0ZWd5ID1cbiAgICAgICAgc21hbGxSdW5zOiAoYml0cyAmIDEpID09IDFcbiAgICAgICAgcHJlZmVyc1J1bnM6IChiaXRzICYgMikgPT0gMlxuICAgICAgICBtYXRjaDJzOiAoYml0cyAmIDQpID09IDRcbiAgICAgICAgc2Vlc1JvcHM6IChiaXRzICYgOCkgPT0gOFxuICAgICAgcGxheXMgPSB0aGlyLmFpQ2FsY1BsYXlzKGhhbmQsIHN0cmF0ZWd5KVxuXG4gICAgICBjb25zb2xlLmxvZyhcIiAgICogU3RyYXRlZ3k6ICN7SlNPTi5zdHJpbmdpZnkoc3RyYXRlZ3kpfVwiKVxuICAgICAgY29uc29sZS5sb2codGhpci5wcmV0dHlQbGF5cyhwbGF5cywgdHJ1ZSkpXG5cbiAgICAgIGlmIG5vdCBwbGF5cy5raW5kMVxuICAgICAgICBmb3VuZEZ1bGx5UGxheWVkID0gdHJ1ZVxuXG4gICAgaWYgZm91bmRGdWxseVBsYXllZFxuICAgICAgZnVsbHlQbGF5ZWQgKz0gMVxuXG4gIGNvbnNvbGUubG9nIFwiZnVsbHlQbGF5ZWQ6ICN7ZnVsbHlQbGF5ZWR9IC8gI3t0b3RhbEF0dGVtcHRzfVwiXG5cbiMgICAgICBIICBEICBDICBTXG4jICAyOiA1MSA1MCA0OSA0OFxuIyAgQTogNDcgNDYgNDUgNDRcbiMgIEs6IDQzIDQyIDQxIDQwXG4jICBROiAzOSAzOCAzNyAzNlxuIyAgSjogMzUgMzQgMzMgMzJcbiMgMTA6IDMxIDMwIDI5IDI4XG4jICA5OiAyNyAyNiAyNSAyNFxuIyAgODogMjMgMjIgMjEgMjBcbiMgIDc6IDE5IDE4IDE3IDE2XG4jICA2OiAxNSAxNCAxMyAxMlxuIyAgNTogMTEgMTAgIDkgIDhcbiMgIDQ6ICA3ICA2ICA1ICA0XG4jICAzOiAgMyAgMiAgMSAgMFxuXG5kZWJ1ZzIgPSAtPlxuICBnYW1lID1cbiAgICBvcHRpb25zOlxuICAgICAgYXV0b3Bhc3NJbmRleDogMVxuICB0aGlyID0gbmV3IFRoaXJ0ZWVuKGdhbWUpXG4gIGN1cnJlbnRQbGF5ID1cbiAgICB0eXBlOiAncnVuMydcbiAgICBoaWdoOiAyNlxuICBoYW5kID0gW1xuICAgIDEwLCAxMSwgMTUsIDE5LCAyMywgMjdcbiAgXVxuICBjb25zb2xlLmxvZyB0aGlyLmhhc1BsYXkoY3VycmVudFBsYXksIGhhbmQpXG5cblxuIyBkZWJ1ZygpXG4jIGRlYnVnMigpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEV4cG9ydHNcblxubW9kdWxlLmV4cG9ydHMgPVxuICBDYXJkOiBDYXJkXG4gIFRoaXJ0ZWVuOiBUaGlydGVlblxuICBPSzogT0tcbiAgYWlDaGFyYWN0ZXJzOiBhaUNoYXJhY3RlcnNcbiAgYWNoaWV2ZW1lbnRzTGlzdDogYWNoaWV2ZW1lbnRzTGlzdFxuICBhY2hpZXZlbWVudHNNYXA6IGFjaGlldmVtZW50c01hcFxuIiwibW9kdWxlLmV4cG9ydHMgPVxuICBkYXJrZm9yZXN0OlxuICAgIGhlaWdodDogNzJcbiAgICBnbHlwaHM6XG4gICAgICAnOTcnIDogeyB4OiAgIDgsIHk6ICAgOCwgd2lkdGg6ICAzNCwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICc5OCcgOiB7IHg6ICAgOCwgeTogIDU4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzk5JyA6IHsgeDogIDUwLCB5OiAgIDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnMTAwJzogeyB4OiAgIDgsIHk6IDExOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICcxMDEnOiB7IHg6ICAgOCwgeTogMTc4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzEwMic6IHsgeDogICA4LCB5OiAyMjgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzMyB9XG4gICAgICAnMTAzJzogeyB4OiAgIDgsIHk6IDI3OCwgd2lkdGg6ICAzNiwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM1IH1cbiAgICAgICcxMDQnOiB7IHg6ICAgOCwgeTogMzI4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzEwNSc6IHsgeDogICA4LCB5OiAzNzgsIHdpZHRoOiAgMTIsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAxMSB9XG4gICAgICAnMTA2JzogeyB4OiAgIDgsIHk6IDQyOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDEsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICcxMDcnOiB7IHg6ICAyOCwgeTogMzc4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzEwOCc6IHsgeDogIDUxLCB5OiAzMjgsIHdpZHRoOiAgMzQsIGhlaWdodDogIDQxLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzMyB9XG4gICAgICAnMTA5JzogeyB4OiAgNTEsIHk6IDQyNywgd2lkdGg6ICAzOCwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM3IH1cbiAgICAgICcxMTAnOiB7IHg6ICA3MSwgeTogMzc3LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzExMSc6IHsgeDogIDk3LCB5OiA0MjcsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQxLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnMTEyJzogeyB4OiAgNTEsIHk6ICA1OCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICcxMTMnOiB7IHg6ICA1MSwgeTogMTA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0NSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzExNCc6IHsgeDogIDkzLCB5OiAgIDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNSB9XG4gICAgICAnMTE1JzogeyB4OiAgNTEsIHk6IDE2MSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM1IH1cbiAgICAgICcxMTYnOiB7IHg6ICA1MSwgeTogMjExLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzMgfVxuICAgICAgJzExNyc6IHsgeDogIDUyLCB5OiAyNjEsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnMTE4JzogeyB4OiAgOTMsIHk6IDMxMSwgd2lkdGg6ICAzNCwgaGVpZ2h0OiAgNDEsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDMyIH1cbiAgICAgICcxMTknOiB7IHg6IDExNCwgeTogMzYwLCB3aWR0aDogIDM4LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzggfVxuICAgICAgJzEyMCc6IHsgeDogMTQwLCB5OiA0MTAsIHdpZHRoOiAgMzYsIGhlaWdodDogIDQxLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNyB9XG4gICAgICAnMTIxJzogeyB4OiAxNDAsIHk6IDQ1OSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDEsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICcxMjInOiB7IHg6IDE4MywgeTogNDU5LCB3aWR0aDogIDM2LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzUgfVxuICAgICAgJzY1JyA6IHsgeDogIDk0LCB5OiAgNTgsIHdpZHRoOiAgMzQsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XG4gICAgICAnNjYnIDogeyB4OiAgOTQsIHk6IDExOSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM3IH1cbiAgICAgICc2NycgOiB7IHg6ICA5NCwgeTogMTgwLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxuICAgICAgJzY4JyA6IHsgeDogIDk1LCB5OiAyNDEsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNyB9XG4gICAgICAnNjknIDogeyB4OiAxMzYsIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cbiAgICAgICc3MCcgOiB7IHg6IDEzNywgeTogIDY5LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzcxJyA6IHsgeDogMTc5LCB5OiAgIDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XG4gICAgICAnNzInIDogeyB4OiAxMzcsIHk6IDEzMCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cbiAgICAgICc3MycgOiB7IHg6IDEzOCwgeTogMTkxLCB3aWR0aDogIDEyLCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMTMgfVxuICAgICAgJzc0JyA6IHsgeDogMTM4LCB5OiAyNTIsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XG4gICAgICAnNzUnIDogeyB4OiAxNTgsIHk6IDE5MSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cbiAgICAgICc3NicgOiB7IHg6IDE2MCwgeTogMzEzLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzc3JyA6IHsgeDogMTgxLCB5OiAyNTEsIHdpZHRoOiAgMzgsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzOSB9XG4gICAgICAnNzgnIDogeyB4OiAxODQsIHk6IDM3NCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM1IH1cbiAgICAgICc3OScgOiB7IHg6IDIwMywgeTogMzEyLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxuICAgICAgJzgwJyA6IHsgeDogMTgwLCB5OiAgNjksIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnODEnIDogeyB4OiAyMDEsIHk6IDEzMCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTYsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM1IH1cbiAgICAgICc4MicgOiB7IHg6IDIyMiwgeTogICA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxuICAgICAgJzgzJyA6IHsgeDogMjIzLCB5OiAgNjksIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNSB9XG4gICAgICAnODQnIDogeyB4OiAyNjUsIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDMzIH1cbiAgICAgICc4NScgOiB7IHg6IDIyNywgeTogMTk0LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxuICAgICAgJzg2JyA6IHsgeDogMjQ0LCB5OiAxMzAsIHdpZHRoOiAgNDEsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAxOSwgeGFkdmFuY2U6ICAzOSB9XG4gICAgICAnODcnIDogeyB4OiAyNjYsIHk6ICA2OSwgd2lkdGg6ICAzOCwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM3IH1cbiAgICAgICc4OCcgOiB7IHg6IDMwOCwgeTogICA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMTksIHhhZHZhbmNlOiAgMzUgfVxuICAgICAgJzg5JyA6IHsgeDogMjI3LCB5OiAzNzMsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAxOSwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnOTAnIDogeyB4OiAyMjcsIHk6IDQzMywgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM1IH1cbiAgICAgICczMycgOiB7IHg6IDI0NiwgeTogMjU1LCB3aWR0aDogIDE0LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMTEgfVxuICAgICAgJzU5JyA6IHsgeDogMTgwLCB5OiAxMzAsIHdpZHRoOiAgMTMsIGhlaWdodDogIDM3LCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA1NiwgeGFkdmFuY2U6ICAxMyB9XG4gICAgICAnMzcnIDogeyB4OiAgOTUsIHk6IDMwMiwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cbiAgICAgICc1OCcgOiB7IHg6IDE2MCwgeTogMzc0LCB3aWR0aDogIDEzLCBoZWlnaHQ6ICAyMywgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNTAsIHhhZHZhbmNlOiAgMTMgfVxuICAgICAgJzYzJyA6IHsgeDogMjY4LCB5OiAyNTUsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzMyB9XG4gICAgICAnNDInIDogeyB4OiAxMDMsIHk6IDMwMiwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cbiAgICAgICc0MCcgOiB7IHg6IDI3MCwgeTogMTkwLCB3aWR0aDogIDIzLCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMjEgfVxuICAgICAgJzQxJyA6IHsgeDogMjkzLCB5OiAxMzAsIHdpZHRoOiAgMjMsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAyMSB9XG4gICAgICAnOTUnIDogeyB4OiAxMTEsIHk6IDMwMiwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cbiAgICAgICc0MycgOiB7IHg6IDI0NiwgeTogMzE2LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICAzNCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgMzksIHhhZHZhbmNlOiAgMzIgfVxuICAgICAgJzQ1JyA6IHsgeDogMTg0LCB5OiA0MzUsIHdpZHRoOiAgMjYsIGhlaWdodDogIDExLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICA0NCwgeGFkdmFuY2U6ICAyNSB9XG4gICAgICAnNjEnIDogeyB4OiAzMTIsIHk6ICA2OCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgMzAsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDQyLCB4YWR2YW5jZTogIDMzIH1cbiAgICAgICc0NicgOiB7IHg6IDEzNSwgeTogMzEzLCB3aWR0aDogIDE0LCBoZWlnaHQ6ICAxMSwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNjEsIHhhZHZhbmNlOiAgMTQgfVxuICAgICAgJzQ0JyA6IHsgeDogMjI3LCB5OiAyNTUsIHdpZHRoOiAgMTAsIGhlaWdodDogIDIxLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA2OCwgeGFkdmFuY2U6ICAxMSB9XG4gICAgICAnNDcnIDogeyB4OiAzNTEsIHk6ICAgOCwgd2lkdGg6ICAyOCwgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDE5LCB4YWR2YW5jZTogIDI2IH1cbiAgICAgICcxMjQnOiB7IHg6IDExOSwgeTogMzAyLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxuICAgICAgJzM0JyA6IHsgeDogMTI3LCB5OiAzMDIsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XG4gICAgICAnMzknIDogeyB4OiAyMDEsIHk6IDE5NCwgd2lkdGg6ICAxOCwgaGVpZ2h0OiAgMTksIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogICAwLCB4YWR2YW5jZTogIDIxIH1cbiAgICAgICc2NCcgOiB7IHg6IDIxOCwgeTogNDM1LCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxuICAgICAgJzM1JyA6IHsgeDogMjE4LCB5OiA0NDMsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XG4gICAgICAnMzYnIDogeyB4OiAzMDEsIHk6IDE5MCwgd2lkdGg6ICAzMiwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDIyLCB4YWR2YW5jZTogIDI5IH1cbiAgICAgICc5NCcgOiB7IHg6IDIxOCwgeTogNDUxLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxuICAgICAgJzM4JyA6IHsgeDogMjQ2LCB5OiAzNTgsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XG4gICAgICAnMTIzJzogeyB4OiAzMjQsIHk6IDEwNiwgd2lkdGg6ICAyNywgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDI2IH1cbiAgICAgICcxMjUnOiB7IHg6IDI3MCwgeTogMzU4LCB3aWR0aDogIDI3LCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMjcgfVxuICAgICAgJzkxJyA6IHsgeDogMjcwLCB5OiA0MTgsIHdpZHRoOiAgMjIsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAyMSB9XG4gICAgICAnOTMnIDogeyB4OiAzMDAsIHk6IDQxOCwgd2lkdGg6ICAyMiwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDIwIH1cbiAgICAgICc0OCcgOiB7IHg6IDMwNSwgeTogMzE2LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxuICAgICAgJzQ5JyA6IHsgeDogMzExLCB5OiAyNTEsIHdpZHRoOiAgMzQsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNSB9XG4gICAgICAnNTAnIDogeyB4OiAzNDEsIHk6IDE2Niwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM3IH1cbiAgICAgICc1MScgOiB7IHg6IDM1OSwgeTogIDY4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxuICAgICAgJzUyJyA6IHsgeDogMzMwLCB5OiAzNzcsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNSB9XG4gICAgICAnNTMnIDogeyB4OiAzNDgsIHk6IDMxMiwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM3IH1cbiAgICAgICc1NCcgOiB7IHg6IDMzMCwgeTogNDM4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxuICAgICAgJzU1JyA6IHsgeDogMzUzLCB5OiAyMjcsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnNTYnIDogeyB4OiAzODQsIHk6IDEyOSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cbiAgICAgICc1NycgOiB7IHg6IDQwMiwgeTogICA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxuICAgICAgJzMyJyA6IHsgeDogICAwLCB5OiAgIDAsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAyMiB9XG5cbiAgICAgICMgY2FyZCBnbHlwaHNcbiAgICAgICcyMDAnOiB7IHg6IDM5NiwgeTogMzc4LCB3aWR0aDogIDQwLCBoZWlnaHQ6ICA0OSwgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjEsIHhhZHZhbmNlOiAgNDMgfSAjIFNcbiAgICAgICcyMDEnOiB7IHg6IDQ0NywgeTogMzEzLCB3aWR0aDogIDQ5LCBoZWlnaHQ6ICA1MCwgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjEsIHhhZHZhbmNlOiAgNTIgfSAjIENcbiAgICAgICcyMDInOiB7IHg6IDM5OSwgeTogMzEzLCB3aWR0aDogIDM2LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjEsIHhhZHZhbmNlOiAgMzkgfSAjIERcbiAgICAgICcyMDMnOiB7IHg6IDQ1MiwgeTogMzgxLCB3aWR0aDogIDM5LCBoZWlnaHQ6ICA0MywgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjEsIHhhZHZhbmNlOiAgNDIgfSAjIEhcbiIsIiMgVGhpcyBmaWxlIHByb3ZpZGVzIHRoZSByZW5kZXJpbmcgZW5naW5lIGZvciB0aGUgd2ViIHZlcnNpb24uIE5vbmUgb2YgdGhpcyBjb2RlIGlzIGluY2x1ZGVkIGluIHRoZSBKYXZhIHZlcnNpb24uXG5cbmNvbnNvbGUubG9nICd3ZWIgc3RhcnR1cCdcblxuR2FtZSA9IHJlcXVpcmUgJy4vR2FtZSdcblxuIyB0YWtlbiBmcm9tIGh0dHA6I3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy81NjIzODM4L3JnYi10by1oZXgtYW5kLWhleC10by1yZ2JcbmNvbXBvbmVudFRvSGV4ID0gKGMpIC0+XG4gIGhleCA9IE1hdGguZmxvb3IoYyAqIDI1NSkudG9TdHJpbmcoMTYpXG4gIHJldHVybiBpZiBoZXgubGVuZ3RoID09IDEgdGhlbiBcIjBcIiArIGhleCBlbHNlIGhleFxucmdiVG9IZXggPSAociwgZywgYikgLT5cbiAgcmV0dXJuIFwiI1wiICsgY29tcG9uZW50VG9IZXgocikgKyBjb21wb25lbnRUb0hleChnKSArIGNvbXBvbmVudFRvSGV4KGIpXG5cblNBVkVfVElNRVJfTVMgPSAzMDAwXG5cbmNsYXNzIE5hdGl2ZUFwcFxuICBjb25zdHJ1Y3RvcjogKEBzY3JlZW4sIEB3aWR0aCwgQGhlaWdodCkgLT5cbiAgICBAdGludGVkVGV4dHVyZUNhY2hlID0gW11cbiAgICBAbGFzdFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuICAgIEBsYXN0SW50ZXJhY3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcbiAgICBAaGVhcmRPbmVUb3VjaCA9IGZhbHNlXG4gICAgQHRvdWNoTW91c2UgPSBudWxsXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNlZG93bicsICBAb25Nb3VzZURvd24uYmluZCh0aGlzKSwgZmFsc2VcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2Vtb3ZlJywgIEBvbk1vdXNlTW92ZS5iaW5kKHRoaXMpLCBmYWxzZVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdtb3VzZXVwJywgICAgQG9uTW91c2VVcC5iaW5kKHRoaXMpLCBmYWxzZVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICd0b3VjaHN0YXJ0JywgQG9uVG91Y2hTdGFydC5iaW5kKHRoaXMpLCBmYWxzZVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICd0b3VjaG1vdmUnLCAgQG9uVG91Y2hNb3ZlLmJpbmQodGhpcyksIGZhbHNlXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ3RvdWNoZW5kJywgICBAb25Ub3VjaEVuZC5iaW5kKHRoaXMpLCBmYWxzZVxuICAgIEBjb250ZXh0ID0gQHNjcmVlbi5nZXRDb250ZXh0KFwiMmRcIilcbiAgICBAdGV4dHVyZXMgPSBbXG4gICAgICAjIGFsbCBjYXJkIGFydFxuICAgICAgXCIuLi9pbWFnZXMvY2FyZHMucG5nXCJcbiAgICAgICMgZm9udHNcbiAgICAgIFwiLi4vaW1hZ2VzL2Rhcmtmb3Jlc3QucG5nXCJcbiAgICAgICMgY2hhcmFjdGVycyAvIG90aGVyXG4gICAgICBcIi4uL2ltYWdlcy9jaGFycy5wbmdcIlxuICAgICAgIyBoZWxwXG4gICAgICBcIi4uL2ltYWdlcy9ob3d0b3BsYXkxLnBuZ1wiXG4gICAgXVxuXG4gICAgQGdhbWUgPSBuZXcgR2FtZSh0aGlzLCBAd2lkdGgsIEBoZWlnaHQpXG5cbiAgICBpZiB0eXBlb2YgU3RvcmFnZSAhPSBcInVuZGVmaW5lZFwiXG4gICAgICBzdGF0ZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtIFwic3RhdGVcIlxuICAgICAgaWYgc3RhdGVcbiAgICAgICAgIyBjb25zb2xlLmxvZyBcImxvYWRpbmcgc3RhdGU6ICN7c3RhdGV9XCJcbiAgICAgICAgQGdhbWUubG9hZCBzdGF0ZVxuXG4gICAgQHBlbmRpbmdJbWFnZXMgPSAwXG4gICAgbG9hZGVkVGV4dHVyZXMgPSBbXVxuICAgIGZvciBpbWFnZVVybCBpbiBAdGV4dHVyZXNcbiAgICAgIEBwZW5kaW5nSW1hZ2VzKytcbiAgICAgIGNvbnNvbGUubG9nIFwibG9hZGluZyBpbWFnZSAje0BwZW5kaW5nSW1hZ2VzfTogI3tpbWFnZVVybH1cIlxuICAgICAgaW1nID0gbmV3IEltYWdlKClcbiAgICAgIGltZy5vbmxvYWQgPSBAb25JbWFnZUxvYWRlZC5iaW5kKHRoaXMpXG4gICAgICBpbWcuc3JjID0gaW1hZ2VVcmxcbiAgICAgIGxvYWRlZFRleHR1cmVzLnB1c2ggaW1nXG4gICAgQHRleHR1cmVzID0gbG9hZGVkVGV4dHVyZXNcblxuICAgIEBzYXZlVGltZXIgPSBTQVZFX1RJTUVSX01TXG5cbiAgb25JbWFnZUxvYWRlZDogKGluZm8pIC0+XG4gICAgQHBlbmRpbmdJbWFnZXMtLVxuICAgIGlmIEBwZW5kaW5nSW1hZ2VzID09IDBcbiAgICAgIGNvbnNvbGUubG9nICdBbGwgaW1hZ2VzIGxvYWRlZC4gQmVnaW5uaW5nIHJlbmRlciBsb29wLidcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9PiBAdXBkYXRlKClcblxuICBsb2c6IChzKSAtPlxuICAgIGNvbnNvbGUubG9nIFwiTmF0aXZlQXBwLmxvZygpOiAje3N9XCJcblxuICB1cGRhdGVTYXZlOiAoZHQpIC0+XG4gICAgcmV0dXJuIGlmIHR5cGVvZiBTdG9yYWdlID09IFwidW5kZWZpbmVkXCJcbiAgICBAc2F2ZVRpbWVyIC09IGR0XG4gICAgaWYgQHNhdmVUaW1lciA8PSAwXG4gICAgICBAc2F2ZVRpbWVyID0gU0FWRV9USU1FUl9NU1xuICAgICAgc3RhdGUgPSBAZ2FtZS5zYXZlKClcbiAgICAgICMgY29uc29sZS5sb2cgXCJzYXZpbmc6ICN7c3RhdGV9XCJcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtIFwic3RhdGVcIiwgc3RhdGVcblxuICBnZW5lcmF0ZVRpbnRJbWFnZTogKHRleHR1cmVJbmRleCwgcmVkLCBncmVlbiwgYmx1ZSkgLT5cbiAgICBpbWcgPSBAdGV4dHVyZXNbdGV4dHVyZUluZGV4XVxuICAgIGJ1ZmYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50IFwiY2FudmFzXCJcbiAgICBidWZmLndpZHRoICA9IGltZy53aWR0aFxuICAgIGJ1ZmYuaGVpZ2h0ID0gaW1nLmhlaWdodFxuXG4gICAgY3R4ID0gYnVmZi5nZXRDb250ZXh0IFwiMmRcIlxuICAgIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnY29weSdcbiAgICBjdHguZHJhd0ltYWdlKGltZywgMCwgMClcbiAgICBmaWxsQ29sb3IgPSBcInJnYigje01hdGguZmxvb3IocmVkKjI1NSl9LCAje01hdGguZmxvb3IoZ3JlZW4qMjU1KX0sICN7TWF0aC5mbG9vcihibHVlKjI1NSl9KVwiXG4gICAgY3R4LmZpbGxTdHlsZSA9IGZpbGxDb2xvclxuICAgICMgY29uc29sZS5sb2cgXCJmaWxsQ29sb3IgI3tmaWxsQ29sb3J9XCJcbiAgICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ211bHRpcGx5J1xuICAgIGN0eC5maWxsUmVjdCgwLCAwLCBidWZmLndpZHRoLCBidWZmLmhlaWdodClcbiAgICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2NvcHknXG4gICAgY3R4Lmdsb2JhbEFscGhhID0gMS4wXG4gICAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdkZXN0aW5hdGlvbi1pbidcbiAgICBjdHguZHJhd0ltYWdlKGltZywgMCwgMClcblxuICAgIGltZ0NvbXAgPSBuZXcgSW1hZ2UoKVxuICAgIGltZ0NvbXAuc3JjID0gYnVmZi50b0RhdGFVUkwoKVxuICAgIHJldHVybiBpbWdDb21wXG5cbiAgZHJhd0ltYWdlOiAodGV4dHVyZUluZGV4LCBzcmNYLCBzcmNZLCBzcmNXLCBzcmNILCBkc3RYLCBkc3RZLCBkc3RXLCBkc3RILCByb3QsIGFuY2hvclgsIGFuY2hvclksIHIsIGcsIGIsIGEpIC0+XG4gICAgdGV4dHVyZSA9IEB0ZXh0dXJlc1t0ZXh0dXJlSW5kZXhdXG4gICAgaWYgKHIgIT0gMSkgb3IgKGcgIT0gMSkgb3IgKGIgIT0gMSlcbiAgICAgIHRpbnRlZFRleHR1cmVLZXkgPSBcIiN7dGV4dHVyZUluZGV4fS0je3J9LSN7Z30tI3tifVwiXG4gICAgICB0aW50ZWRUZXh0dXJlID0gQHRpbnRlZFRleHR1cmVDYWNoZVt0aW50ZWRUZXh0dXJlS2V5XVxuICAgICAgaWYgbm90IHRpbnRlZFRleHR1cmVcbiAgICAgICAgdGludGVkVGV4dHVyZSA9IEBnZW5lcmF0ZVRpbnRJbWFnZSB0ZXh0dXJlSW5kZXgsIHIsIGcsIGJcbiAgICAgICAgQHRpbnRlZFRleHR1cmVDYWNoZVt0aW50ZWRUZXh0dXJlS2V5XSA9IHRpbnRlZFRleHR1cmVcbiAgICAgICAgIyBjb25zb2xlLmxvZyBcImdlbmVyYXRlZCBjYWNoZWQgdGV4dHVyZSAje3RpbnRlZFRleHR1cmVLZXl9XCJcbiAgICAgIHRleHR1cmUgPSB0aW50ZWRUZXh0dXJlXG5cbiAgICBAY29udGV4dC5zYXZlKClcbiAgICBAY29udGV4dC50cmFuc2xhdGUgZHN0WCwgZHN0WVxuICAgIEBjb250ZXh0LnJvdGF0ZSByb3QgIyAqIDMuMTQxNTkyIC8gMTgwLjBcbiAgICBhbmNob3JPZmZzZXRYID0gLTEgKiBhbmNob3JYICogZHN0V1xuICAgIGFuY2hvck9mZnNldFkgPSAtMSAqIGFuY2hvclkgKiBkc3RIXG4gICAgQGNvbnRleHQudHJhbnNsYXRlIGFuY2hvck9mZnNldFgsIGFuY2hvck9mZnNldFlcbiAgICBAY29udGV4dC5nbG9iYWxBbHBoYSA9IGFcbiAgICBAY29udGV4dC5kcmF3SW1hZ2UodGV4dHVyZSwgc3JjWCwgc3JjWSwgc3JjVywgc3JjSCwgMCwgMCwgZHN0VywgZHN0SClcbiAgICBAY29udGV4dC5yZXN0b3JlKClcblxuICB1cGRhdGU6IC0+XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0+IEB1cGRhdGUoKVxuXG4gICAgbm93ID0gbmV3IERhdGUoKS5nZXRUaW1lKClcbiAgICBkdCA9IG5vdyAtIEBsYXN0VGltZVxuXG4gICAgIyBkdCA9IE1hdGguZmxvb3IoZHQgLyAxMDApXG5cbiAgICB0aW1lU2luY2VJbnRlcmFjdCA9IG5vdyAtIEBsYXN0SW50ZXJhY3RUaW1lXG4gICAgaWYgdGltZVNpbmNlSW50ZXJhY3QgPiA1MDAwXG4gICAgICBnb2FsRlBTID0gNSAjIGNhbG0gZG93biwgbm9ib2R5IGlzIGRvaW5nIGFueXRoaW5nIGZvciBhIHdoaWxlXG4gICAgZWxzZVxuICAgICAgZ29hbEZQUyA9IG51bGwgIyBhcyBmYXN0IGFzIHBvc3NpYmxlXG4gICAgaWYgQGxhc3RHb2FsRlBTICE9IGdvYWxGUFNcbiAgICAgIGNvbnNvbGUubG9nIFwic3dpdGNoaW5nIHRvICN7Z29hbEZQU30gRlBTXCJcbiAgICAgIEBsYXN0R29hbEZQUyA9IGdvYWxGUFNcblxuICAgIGlmIGdvYWxGUFMgIT0gbnVsbFxuICAgICAgZnBzSW50ZXJ2YWwgPSAxMDAwIC8gZ29hbEZQU1xuICAgICAgaWYgZHQgPCBmcHNJbnRlcnZhbFxuICAgICAgICByZXR1cm5cbiAgICBAbGFzdFRpbWUgPSBub3dcblxuICAgIEBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBAd2lkdGgsIEBoZWlnaHQpXG4gICAgaWYgQGdhbWUudXBkYXRlKGR0KVxuICAgICAgQGxhc3RJbnRlcmFjdFRpbWUgPSBub3dcbiAgICByZW5kZXJDb21tYW5kcyA9IEBnYW1lLnJlbmRlcigpXG5cbiAgICBpID0gMFxuICAgIG4gPSByZW5kZXJDb21tYW5kcy5sZW5ndGhcbiAgICB3aGlsZSAoaSA8IG4pXG4gICAgICBkcmF3Q2FsbCA9IHJlbmRlckNvbW1hbmRzLnNsaWNlKGksIGkgKz0gMTYpXG4gICAgICBAZHJhd0ltYWdlLmFwcGx5KHRoaXMsIGRyYXdDYWxsKVxuXG4gICAgQHVwZGF0ZVNhdmUoZHQpXG5cbiAgb25Ub3VjaFN0YXJ0OiAoZXZ0KSAtPlxuICAgIEBsYXN0SW50ZXJhY3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcbiAgICBAaGVhcmRPbmVUb3VjaCA9IHRydWVcbiAgICB0b3VjaGVzID0gZXZ0LmNoYW5nZWRUb3VjaGVzXG4gICAgZm9yIHRvdWNoIGluIHRvdWNoZXNcbiAgICAgIGlmIEB0b3VjaE1vdXNlID09IG51bGxcbiAgICAgICAgQHRvdWNoTW91c2UgPSB0b3VjaC5pZGVudGlmaWVyXG4gICAgICBpZiBAdG91Y2hNb3VzZSA9PSB0b3VjaC5pZGVudGlmaWVyXG4gICAgICAgIEBnYW1lLnRvdWNoRG93bih0b3VjaC5jbGllbnRYLCB0b3VjaC5jbGllbnRZKVxuXG4gIG9uVG91Y2hNb3ZlOiAoZXZ0KSAtPlxuICAgIEBsYXN0SW50ZXJhY3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcbiAgICB0b3VjaGVzID0gZXZ0LmNoYW5nZWRUb3VjaGVzXG4gICAgZm9yIHRvdWNoIGluIHRvdWNoZXNcbiAgICAgIGlmIEB0b3VjaE1vdXNlID09IHRvdWNoLmlkZW50aWZpZXJcbiAgICAgICAgQGdhbWUudG91Y2hNb3ZlKHRvdWNoLmNsaWVudFgsIHRvdWNoLmNsaWVudFkpXG5cbiAgb25Ub3VjaEVuZDogKGV2dCkgLT5cbiAgICBAbGFzdEludGVyYWN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG4gICAgdG91Y2hlcyA9IGV2dC5jaGFuZ2VkVG91Y2hlc1xuICAgIGZvciB0b3VjaCBpbiB0b3VjaGVzXG4gICAgICBpZiBAdG91Y2hNb3VzZSA9PSB0b3VjaC5pZGVudGlmaWVyXG4gICAgICAgIEBnYW1lLnRvdWNoVXAodG91Y2guY2xpZW50WCwgdG91Y2guY2xpZW50WSlcbiAgICAgICAgQHRvdWNoTW91c2UgPSBudWxsXG4gICAgaWYgZXZ0LnRvdWNoZXMubGVuZ3RoID09IDBcbiAgICAgIEB0b3VjaE1vdXNlID0gbnVsbFxuXG4gIG9uTW91c2VEb3duOiAoZXZ0KSAtPlxuICAgIGlmIEBoZWFyZE9uZVRvdWNoXG4gICAgICByZXR1cm5cbiAgICBAbGFzdEludGVyYWN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG4gICAgQGdhbWUudG91Y2hEb3duKGV2dC5jbGllbnRYLCBldnQuY2xpZW50WSlcblxuICBvbk1vdXNlTW92ZTogKGV2dCkgLT5cbiAgICBpZiBAaGVhcmRPbmVUb3VjaFxuICAgICAgcmV0dXJuXG4gICAgQGxhc3RJbnRlcmFjdFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuICAgIEBnYW1lLnRvdWNoTW92ZShldnQuY2xpZW50WCwgZXZ0LmNsaWVudFkpXG5cbiAgb25Nb3VzZVVwOiAoZXZ0KSAtPlxuICAgIGlmIEBoZWFyZE9uZVRvdWNoXG4gICAgICByZXR1cm5cbiAgICBAbGFzdEludGVyYWN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG4gICAgQGdhbWUudG91Y2hVcChldnQuY2xpZW50WCwgZXZ0LmNsaWVudFkpXG5cbnNjcmVlbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkICdzY3JlZW4nXG5yZXNpemVTY3JlZW4gPSAtPlxuICBkZXNpcmVkQXNwZWN0UmF0aW8gPSAxNiAvIDlcbiAgY3VycmVudEFzcGVjdFJhdGlvID0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHRcbiAgaWYgY3VycmVudEFzcGVjdFJhdGlvIDwgZGVzaXJlZEFzcGVjdFJhdGlvXG4gICAgc2NyZWVuLndpZHRoID0gd2luZG93LmlubmVyV2lkdGhcbiAgICBzY3JlZW4uaGVpZ2h0ID0gTWF0aC5mbG9vcih3aW5kb3cuaW5uZXJXaWR0aCAqICgxIC8gZGVzaXJlZEFzcGVjdFJhdGlvKSlcbiAgZWxzZVxuICAgIHNjcmVlbi53aWR0aCA9IE1hdGguZmxvb3Iod2luZG93LmlubmVySGVpZ2h0ICogZGVzaXJlZEFzcGVjdFJhdGlvKVxuICAgIHNjcmVlbi5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHRcbnJlc2l6ZVNjcmVlbigpXG4jIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdyZXNpemUnLCByZXNpemVTY3JlZW4sIGZhbHNlXG5cbmFwcCA9IG5ldyBOYXRpdmVBcHAoc2NyZWVuLCBzY3JlZW4ud2lkdGgsIHNjcmVlbi5oZWlnaHQpXG4iXX0=
