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

BUILD_TIMESTAMP = "1.11";

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
      hand_reorg: {
        r: 0.4,
        g: 0,
        b: 0,
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
      autopassIndex: 2
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
    return [winner.name + " wins!", "Streak ended: " + this.thirteen.lastStreak + " wins"];
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
    var aiCardSpacing, aiPlayers, cardAreaText, character, characterHeight, characterMargin, characterWidth, color, countHeight, drawGameOver, gameOverSize, gameOverY, handAreaHeight, handareaColor, i, j, len, line, lines, opacity, pileDimension, pileSprite, ref1, restartQuitSize, shadowDistance, textHeight, textPadding, x, xText, y;
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
    if (this.hand.picking) {
      handareaColor = this.colors.hand_pick;
      if ((this.thirteen.turn === 0) && (this.thirteen.everyonePassed() || (this.thirteen.currentPlay === null))) {
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

STARTING_MONEY = 25;

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

  Thirteen.prototype.newGame = function(money) {
    var i, n;
    if (money == null) {
      money = false;
    }
    this.log = [];
    this.streak = 0;
    this.lastStreak = 0;
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
        money: STARTING_MONEY
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
      money: STARTING_MONEY
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
    var achievement, achievementCount, base, base1, base2, breakerThrown, card, currentPlayer, incomingPlay, len3, len4, n, newThrow, o, placeString, ref, ret, verb;
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
    for (o = 0, len4 = achievementsList.length; o < len4; o++) {
      achievement = achievementsList[o];
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
    if (timeSinceInteract > 15000) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQW5pbWF0aW9uLmNvZmZlZSIsInNyYy9CdXR0b24uY29mZmVlIiwic3JjL0ZvbnRSZW5kZXJlci5jb2ZmZWUiLCJzcmMvR2FtZS5jb2ZmZWUiLCJzcmMvSGFuZC5jb2ZmZWUiLCJzcmMvTWVudS5jb2ZmZWUiLCJzcmMvUGlsZS5jb2ZmZWUiLCJzcmMvU3ByaXRlUmVuZGVyZXIuY29mZmVlIiwic3JjL1RoaXJ0ZWVuLmNvZmZlZSIsInNyYy9mb250bWV0cmljcy5jb2ZmZWUiLCJzcmMvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBOztBQUFBLFFBQUEsR0FBVyxTQUFDLENBQUQ7RUFDVCxJQUFHLENBQUEsS0FBSyxDQUFSO0FBQ0UsV0FBTyxFQURUO0dBQUEsTUFFSyxJQUFHLENBQUEsR0FBSSxDQUFQO0FBQ0gsV0FBTyxDQUFDLEVBREw7O0FBRUwsU0FBTztBQUxFOztBQU9MO0VBQ1MsbUJBQUMsSUFBRDtBQUNYLFFBQUE7SUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksQ0FBQztJQUNkLElBQUMsQ0FBQSxHQUFELEdBQU87SUFDUCxJQUFDLENBQUEsR0FBRCxHQUFPO0FBQ1AsU0FBQSxTQUFBOztNQUNFLElBQUcsQ0FBQSxLQUFLLE9BQVI7UUFDRSxJQUFDLENBQUEsR0FBSSxDQUFBLENBQUEsQ0FBTCxHQUFVO1FBQ1YsSUFBQyxDQUFBLEdBQUksQ0FBQSxDQUFBLENBQUwsR0FBVSxFQUZaOztBQURGO0VBSlc7O3NCQVViLElBQUEsR0FBTSxTQUFBO0lBQ0osSUFBRyxrQkFBSDtNQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBTCxHQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFEaEI7O0lBRUEsSUFBRyxrQkFBSDtNQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBTCxHQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFEaEI7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QixRQUF4Qjs7QUFDVCxZQUFBLEdBQWUsU0FBQTtBQUNiLE1BQUE7RUFBQSxrQkFBQSxHQUFxQixFQUFBLEdBQUs7RUFDMUIsa0JBQUEsR0FBcUIsTUFBTSxDQUFDLFVBQVAsR0FBb0IsTUFBTSxDQUFDO0VBQ2hELElBQUcsa0JBQUEsR0FBcUIsa0JBQXhCO0lBQ0UsTUFBTSxDQUFDLEtBQVAsR0FBZSxNQUFNLENBQUM7V0FDdEIsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsSUFBSSxDQUFDLEtBQUwsQ0FBVyxNQUFNLENBQUMsVUFBUCxHQUFvQixDQUFDLENBQUEsR0FBSSxrQkFBTCxDQUEvQixFQUZsQjtHQUFBLE1BQUE7SUFJRSxNQUFNLENBQUMsS0FBUCxHQUFlLElBQUksQ0FBQyxLQUFMLENBQVcsTUFBTSxDQUFDLFdBQVAsR0FBcUIsa0JBQWhDO1dBQ2YsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsTUFBTSxDQUFDLFlBTHpCOztBQUhhOztBQVNmLFlBQUEsQ0FBQTs7QUFHQSxHQUFBLEdBQU0sSUFBSSxTQUFKLENBQWMsTUFBZCxFQUFzQixNQUFNLENBQUMsS0FBN0IsRUFBb0MsTUFBTSxDQUFDLE1BQTNDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY2FsY1NpZ24gPSAodikgLT5cclxuICBpZiB2ID09IDBcclxuICAgIHJldHVybiAwXHJcbiAgZWxzZSBpZiB2IDwgMFxyXG4gICAgcmV0dXJuIC0xXHJcbiAgcmV0dXJuIDFcclxuXHJcbmNsYXNzIEFuaW1hdGlvblxyXG4gIGNvbnN0cnVjdG9yOiAoZGF0YSkgLT5cclxuICAgIEBzcGVlZCA9IGRhdGEuc3BlZWRcclxuICAgIEByZXEgPSB7fVxyXG4gICAgQGN1ciA9IHt9XHJcbiAgICBmb3Igayx2IG9mIGRhdGFcclxuICAgICAgaWYgayAhPSAnc3BlZWQnXHJcbiAgICAgICAgQHJlcVtrXSA9IHZcclxuICAgICAgICBAY3VyW2tdID0gdlxyXG5cclxuICAjICdmaW5pc2hlcycgYWxsIGFuaW1hdGlvbnNcclxuICB3YXJwOiAtPlxyXG4gICAgaWYgQGN1ci5yP1xyXG4gICAgICBAY3VyLnIgPSBAcmVxLnJcclxuICAgIGlmIEBjdXIucz9cclxuICAgICAgQGN1ci5zID0gQHJlcS5zXHJcbiAgICBpZiBAY3VyLng/IGFuZCBAY3VyLnk/XHJcbiAgICAgIEBjdXIueCA9IEByZXEueFxyXG4gICAgICBAY3VyLnkgPSBAcmVxLnlcclxuXHJcbiAgYW5pbWF0aW5nOiAtPlxyXG4gICAgaWYgQGN1ci5yP1xyXG4gICAgICBpZiBAcmVxLnIgIT0gQGN1ci5yXHJcbiAgICAgICAgcmV0dXJuIHRydWVcclxuICAgIGlmIEBjdXIucz9cclxuICAgICAgaWYgQHJlcS5zICE9IEBjdXIuc1xyXG4gICAgICAgIHJldHVybiB0cnVlXHJcbiAgICBpZiBAY3VyLng/IGFuZCBAY3VyLnk/XHJcbiAgICAgIGlmIChAcmVxLnggIT0gQGN1ci54KSBvciAoQHJlcS55ICE9IEBjdXIueSlcclxuICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gIHVwZGF0ZTogKGR0KSAtPlxyXG4gICAgdXBkYXRlZCA9IGZhbHNlXHJcbiAgICAjIHJvdGF0aW9uXHJcbiAgICBpZiBAY3VyLnI/XHJcbiAgICAgIGlmIEByZXEuciAhPSBAY3VyLnJcclxuICAgICAgICB1cGRhdGVkID0gdHJ1ZVxyXG4gICAgICAgICMgc2FuaXRpemUgcmVxdWVzdGVkIHJvdGF0aW9uXHJcbiAgICAgICAgdHdvUGkgPSBNYXRoLlBJICogMlxyXG4gICAgICAgIG5lZ1R3b1BpID0gLTEgKiB0d29QaVxyXG4gICAgICAgIEByZXEuciAtPSB0d29QaSB3aGlsZSBAcmVxLnIgPj0gdHdvUGlcclxuICAgICAgICBAcmVxLnIgKz0gdHdvUGkgd2hpbGUgQHJlcS5yIDw9IG5lZ1R3b1BpXHJcbiAgICAgICAgIyBwaWNrIGEgZGlyZWN0aW9uIGFuZCB0dXJuXHJcbiAgICAgICAgZHIgPSBAcmVxLnIgLSBAY3VyLnJcclxuICAgICAgICBkaXN0ID0gTWF0aC5hYnMoZHIpXHJcbiAgICAgICAgc2lnbiA9IGNhbGNTaWduKGRyKVxyXG4gICAgICAgIGlmIGRpc3QgPiBNYXRoLlBJXHJcbiAgICAgICAgICAjIHNwaW4gdGhlIG90aGVyIGRpcmVjdGlvbiwgaXQgaXMgY2xvc2VyXHJcbiAgICAgICAgICBkaXN0ID0gdHdvUGkgLSBkaXN0XHJcbiAgICAgICAgICBzaWduICo9IC0xXHJcbiAgICAgICAgbWF4RGlzdCA9IGR0ICogQHNwZWVkLnIgLyAxMDAwXHJcbiAgICAgICAgaWYgZGlzdCA8IG1heERpc3RcclxuICAgICAgICAgICMgd2UgY2FuIGZpbmlzaCB0aGlzIGZyYW1lXHJcbiAgICAgICAgICBAY3VyLnIgPSBAcmVxLnJcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBAY3VyLnIgKz0gbWF4RGlzdCAqIHNpZ25cclxuXHJcbiAgICAjIHNjYWxlXHJcbiAgICBpZiBAY3VyLnM/XHJcbiAgICAgIGlmIEByZXEucyAhPSBAY3VyLnNcclxuICAgICAgICB1cGRhdGVkID0gdHJ1ZVxyXG4gICAgICAgICMgcGljayBhIGRpcmVjdGlvbiBhbmQgdHVyblxyXG4gICAgICAgIGRzID0gQHJlcS5zIC0gQGN1ci5zXHJcbiAgICAgICAgZGlzdCA9IE1hdGguYWJzKGRzKVxyXG4gICAgICAgIHNpZ24gPSBjYWxjU2lnbihkcylcclxuICAgICAgICBtYXhEaXN0ID0gZHQgKiBAc3BlZWQucyAvIDEwMDBcclxuICAgICAgICBpZiBkaXN0IDwgbWF4RGlzdFxyXG4gICAgICAgICAgIyB3ZSBjYW4gZmluaXNoIHRoaXMgZnJhbWVcclxuICAgICAgICAgIEBjdXIucyA9IEByZXEuc1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIEBjdXIucyArPSBtYXhEaXN0ICogc2lnblxyXG5cclxuICAgICMgdHJhbnNsYXRpb25cclxuICAgIGlmIEBjdXIueD8gYW5kIEBjdXIueT9cclxuICAgICAgaWYgKEByZXEueCAhPSBAY3VyLngpIG9yIChAcmVxLnkgIT0gQGN1ci55KVxyXG4gICAgICAgIHVwZGF0ZWQgPSB0cnVlXHJcbiAgICAgICAgdmVjWCA9IEByZXEueCAtIEBjdXIueFxyXG4gICAgICAgIHZlY1kgPSBAcmVxLnkgLSBAY3VyLnlcclxuICAgICAgICBkaXN0ID0gTWF0aC5zcXJ0KCh2ZWNYICogdmVjWCkgKyAodmVjWSAqIHZlY1kpKVxyXG4gICAgICAgIG1heERpc3QgPSBkdCAqIEBzcGVlZC50IC8gMTAwMFxyXG4gICAgICAgIGlmIGRpc3QgPCBtYXhEaXN0XHJcbiAgICAgICAgICAjIHdlIGNhbiBmaW5pc2ggdGhpcyBmcmFtZVxyXG4gICAgICAgICAgQGN1ci54ID0gQHJlcS54XHJcbiAgICAgICAgICBAY3VyLnkgPSBAcmVxLnlcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAjIG1vdmUgYXMgbXVjaCBhcyBwb3NzaWJsZVxyXG4gICAgICAgICAgQGN1ci54ICs9ICh2ZWNYIC8gZGlzdCkgKiBtYXhEaXN0XHJcbiAgICAgICAgICBAY3VyLnkgKz0gKHZlY1kgLyBkaXN0KSAqIG1heERpc3RcclxuXHJcbiAgICByZXR1cm4gdXBkYXRlZFxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBbmltYXRpb25cclxuIiwiQW5pbWF0aW9uID0gcmVxdWlyZSAnLi9BbmltYXRpb24nXHJcblxyXG5jbGFzcyBCdXR0b25cclxuICBjb25zdHJ1Y3RvcjogKEBnYW1lLCBAc3ByaXRlTmFtZXMsIEBmb250LCBAdGV4dEhlaWdodCwgQHgsIEB5LCBAY2IpIC0+XHJcbiAgICBAYW5pbSA9IG5ldyBBbmltYXRpb24ge1xyXG4gICAgICBzcGVlZDogeyBzOiAzIH1cclxuICAgICAgczogMFxyXG4gICAgfVxyXG4gICAgQGNvbG9yID0geyByOiAxLCBnOiAxLCBiOiAxLCBhOiAwIH1cclxuXHJcbiAgdXBkYXRlOiAoZHQpIC0+XHJcbiAgICByZXR1cm4gQGFuaW0udXBkYXRlKGR0KVxyXG5cclxuICByZW5kZXI6IC0+XHJcbiAgICBAY29sb3IuYSA9IEBhbmltLmN1ci5zXHJcbiAgICBAZ2FtZS5zcHJpdGVSZW5kZXJlci5yZW5kZXIgQHNwcml0ZU5hbWVzWzBdLCBAeCwgQHksIDAsIEB0ZXh0SGVpZ2h0ICogMS41LCAwLCAwLjUsIDAuNSwgQGdhbWUuY29sb3JzLndoaXRlLCA9PlxyXG4gICAgICAjIHB1bHNlIGJ1dHRvbiBhbmltLFxyXG4gICAgICBAYW5pbS5jdXIucyA9IDFcclxuICAgICAgQGFuaW0ucmVxLnMgPSAwXHJcbiAgICAgICMgdGhlbiBjYWxsIGNhbGxiYWNrXHJcbiAgICAgIEBjYih0cnVlKVxyXG4gICAgQGdhbWUuc3ByaXRlUmVuZGVyZXIucmVuZGVyIEBzcHJpdGVOYW1lc1sxXSwgQHgsIEB5LCAwLCBAdGV4dEhlaWdodCAqIDEuNSwgMCwgMC41LCAwLjUsIEBjb2xvclxyXG4gICAgdGV4dCA9IEBjYihmYWxzZSlcclxuICAgIEBnYW1lLmZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIEB0ZXh0SGVpZ2h0LCB0ZXh0LCBAeCwgQHksIDAuNSwgMC41LCBAZ2FtZS5jb2xvcnMuYnV0dG9udGV4dFxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCdXR0b25cclxuIiwiZm9udG1ldHJpY3MgPSByZXF1aXJlICcuL2ZvbnRtZXRyaWNzJ1xyXG5cclxuIyB0YWtlbiBmcm9tIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNTYyMzgzOC9yZ2ItdG8taGV4LWFuZC1oZXgtdG8tcmdiXHJcbmhleFRvUmdiID0gKGhleCwgYSkgLT5cclxuICAgIHJlc3VsdCA9IC9eIz8oW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KShbYS1mXFxkXXsyfSkkL2kuZXhlYyhoZXgpXHJcbiAgICByZXR1cm4gbnVsbCBpZiBub3QgcmVzdWx0XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHI6IHBhcnNlSW50KHJlc3VsdFsxXSwgMTYpIC8gMjU1LFxyXG4gICAgICAgIGc6IHBhcnNlSW50KHJlc3VsdFsyXSwgMTYpIC8gMjU1LFxyXG4gICAgICAgIGI6IHBhcnNlSW50KHJlc3VsdFszXSwgMTYpIC8gMjU1XHJcbiAgICAgICAgYTogYVxyXG4gICAgfVxyXG5cclxuY2xhc3MgRm9udFJlbmRlcmVyXHJcbiAgY29uc3RydWN0b3I6ICAoQGdhbWUpIC0+XHJcbiAgICBAd2hpdGUgPSB7IHI6IDEsIGc6IDEsIGI6IDEsIGE6IDEgfVxyXG5cclxuICBzaXplOiAoZm9udCwgaGVpZ2h0LCBzdHIpIC0+XHJcbiAgICBtZXRyaWNzID0gZm9udG1ldHJpY3NbZm9udF1cclxuICAgIHJldHVybiBpZiBub3QgbWV0cmljc1xyXG4gICAgc2NhbGUgPSBoZWlnaHQgLyBtZXRyaWNzLmhlaWdodFxyXG5cclxuICAgIHRvdGFsV2lkdGggPSAwXHJcbiAgICB0b3RhbEhlaWdodCA9IG1ldHJpY3MuaGVpZ2h0ICogc2NhbGVcclxuXHJcbiAgICBpbkNvbG9yID0gZmFsc2VcclxuICAgIGZvciBjaCwgaSBpbiBzdHJcclxuICAgICAgaWYgY2ggPT0gJ2AnXHJcbiAgICAgICAgaW5Db2xvciA9ICFpbkNvbG9yXHJcblxyXG4gICAgICBpZiBub3QgaW5Db2xvclxyXG4gICAgICAgIGNvZGUgPSBjaC5jaGFyQ29kZUF0KDApXHJcbiAgICAgICAgZ2x5cGggPSBtZXRyaWNzLmdseXBoc1tjb2RlXVxyXG4gICAgICAgIGNvbnRpbnVlIGlmIG5vdCBnbHlwaFxyXG4gICAgICAgIHRvdGFsV2lkdGggKz0gZ2x5cGgueGFkdmFuY2UgKiBzY2FsZVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHc6IHRvdGFsV2lkdGhcclxuICAgICAgaDogdG90YWxIZWlnaHRcclxuICAgIH1cclxuXHJcbiAgcmVuZGVyOiAoZm9udCwgaGVpZ2h0LCBzdHIsIHgsIHksIGFuY2hvcngsIGFuY2hvcnksIGNvbG9yLCBjYikgLT5cclxuICAgIG1ldHJpY3MgPSBmb250bWV0cmljc1tmb250XVxyXG4gICAgcmV0dXJuIGlmIG5vdCBtZXRyaWNzXHJcbiAgICBzY2FsZSA9IGhlaWdodCAvIG1ldHJpY3MuaGVpZ2h0XHJcblxyXG4gICAgdG90YWxXaWR0aCA9IDBcclxuICAgIHRvdGFsSGVpZ2h0ID0gbWV0cmljcy5oZWlnaHQgKiBzY2FsZVxyXG4gICAgc2tpcENvbG9yID0gZmFsc2VcclxuICAgIGZvciBjaCwgaSBpbiBzdHJcclxuICAgICAgaWYgY2ggPT0gJ2AnXHJcbiAgICAgICAgc2tpcENvbG9yID0gIXNraXBDb2xvclxyXG4gICAgICBjb250aW51ZSBpZiBza2lwQ29sb3JcclxuICAgICAgY29kZSA9IGNoLmNoYXJDb2RlQXQoMClcclxuICAgICAgZ2x5cGggPSBtZXRyaWNzLmdseXBoc1tjb2RlXVxyXG4gICAgICBjb250aW51ZSBpZiBub3QgZ2x5cGhcclxuICAgICAgdG90YWxXaWR0aCArPSBnbHlwaC54YWR2YW5jZSAqIHNjYWxlXHJcblxyXG4gICAgYW5jaG9yT2Zmc2V0WCA9IC0xICogYW5jaG9yeCAqIHRvdGFsV2lkdGhcclxuICAgIGFuY2hvck9mZnNldFkgPSAtMSAqIGFuY2hvcnkgKiB0b3RhbEhlaWdodFxyXG4gICAgY3VyclggPSB4XHJcblxyXG4gICAgaWYgY29sb3JcclxuICAgICAgc3RhcnRpbmdDb2xvciA9IGNvbG9yXHJcbiAgICBlbHNlXHJcbiAgICAgIHN0YXJ0aW5nQ29sb3IgPSBAd2hpdGVcclxuICAgIGN1cnJlbnRDb2xvciA9IHN0YXJ0aW5nQ29sb3JcclxuXHJcbiAgICBjb2xvclN0YXJ0ID0gLTFcclxuICAgIGZvciBjaCwgaSBpbiBzdHJcclxuICAgICAgaWYgY2ggPT0gJ2AnXHJcbiAgICAgICAgaWYgY29sb3JTdGFydCA9PSAtMVxyXG4gICAgICAgICAgY29sb3JTdGFydCA9IGkgKyAxXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgbGVuID0gaSAtIGNvbG9yU3RhcnRcclxuICAgICAgICAgIGlmIGxlblxyXG4gICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBoZXhUb1JnYihzdHIuc3Vic3RyKGNvbG9yU3RhcnQsIGkgLSBjb2xvclN0YXJ0KSwgc3RhcnRpbmdDb2xvci5hKVxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBzdGFydGluZ0NvbG9yXHJcbiAgICAgICAgICBjb2xvclN0YXJ0ID0gLTFcclxuXHJcbiAgICAgIGNvbnRpbnVlIGlmIGNvbG9yU3RhcnQgIT0gLTFcclxuICAgICAgY29kZSA9IGNoLmNoYXJDb2RlQXQoMClcclxuICAgICAgZ2x5cGggPSBtZXRyaWNzLmdseXBoc1tjb2RlXVxyXG4gICAgICBjb250aW51ZSBpZiBub3QgZ2x5cGhcclxuICAgICAgQGdhbWUuZHJhd0ltYWdlIGZvbnQsXHJcbiAgICAgIGdseXBoLngsIGdseXBoLnksIGdseXBoLndpZHRoLCBnbHlwaC5oZWlnaHQsXHJcbiAgICAgIGN1cnJYICsgKGdseXBoLnhvZmZzZXQgKiBzY2FsZSkgKyBhbmNob3JPZmZzZXRYLCB5ICsgKGdseXBoLnlvZmZzZXQgKiBzY2FsZSkgKyBhbmNob3JPZmZzZXRZLCBnbHlwaC53aWR0aCAqIHNjYWxlLCBnbHlwaC5oZWlnaHQgKiBzY2FsZSxcclxuICAgICAgMCwgMCwgMCxcclxuICAgICAgY3VycmVudENvbG9yLnIsIGN1cnJlbnRDb2xvci5nLCBjdXJyZW50Q29sb3IuYiwgY3VycmVudENvbG9yLmEsIGNiXHJcbiAgICAgIGN1cnJYICs9IGdseXBoLnhhZHZhbmNlICogc2NhbGVcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRm9udFJlbmRlcmVyXHJcbiIsIkFuaW1hdGlvbiA9IHJlcXVpcmUgJy4vQW5pbWF0aW9uJ1xyXG5CdXR0b24gPSByZXF1aXJlICcuL0J1dHRvbidcclxuRm9udFJlbmRlcmVyID0gcmVxdWlyZSAnLi9Gb250UmVuZGVyZXInXHJcblNwcml0ZVJlbmRlcmVyID0gcmVxdWlyZSAnLi9TcHJpdGVSZW5kZXJlcidcclxuTWVudSA9IHJlcXVpcmUgJy4vTWVudSdcclxuSGFuZCA9IHJlcXVpcmUgJy4vSGFuZCdcclxuUGlsZSA9IHJlcXVpcmUgJy4vUGlsZSdcclxue1RoaXJ0ZWVuLCBPSywgYWlDaGFyYWN0ZXJzLCBhY2hpZXZlbWVudHNMaXN0fSA9IHJlcXVpcmUgJy4vVGhpcnRlZW4nXHJcblxyXG4jIHRlbXBcclxuQlVJTERfVElNRVNUQU1QID0gXCIxLjExXCJcclxuXHJcblJlbmRlck1vZGUgPVxyXG4gIEdBTUU6IDBcclxuICBIT1dUTzogMVxyXG4gIEFDSElFVkVNRU5UUzogMlxyXG4gIFBBVVNFOiAzXHJcbiAgT1BUSU9OUzogNFxyXG5cclxuY2xhc3MgR2FtZVxyXG4gIGNvbnN0cnVjdG9yOiAoQG5hdGl2ZSwgQHdpZHRoLCBAaGVpZ2h0KSAtPlxyXG4gICAgQHZlcnNpb24gPSBCVUlMRF9USU1FU1RBTVBcclxuICAgIEBsb2coXCJHYW1lIGNvbnN0cnVjdGVkOiAje0B3aWR0aH14I3tAaGVpZ2h0fVwiKVxyXG4gICAgQGZvbnRSZW5kZXJlciA9IG5ldyBGb250UmVuZGVyZXIgdGhpc1xyXG4gICAgQHNwcml0ZVJlbmRlcmVyID0gbmV3IFNwcml0ZVJlbmRlcmVyIHRoaXNcclxuICAgIEBmb250ID0gXCJkYXJrZm9yZXN0XCJcclxuICAgIEB6b25lcyA9IFtdXHJcbiAgICBAbmV4dEFJVGljayA9IDEwMDAgIyB3aWxsIGJlIHNldCBieSBvcHRpb25zXHJcbiAgICBAY2VudGVyID1cclxuICAgICAgeDogQHdpZHRoIC8gMlxyXG4gICAgICB5OiBAaGVpZ2h0IC8gMlxyXG4gICAgQGFhSGVpZ2h0ID0gQHdpZHRoICogOSAvIDE2XHJcbiAgICBAbG9nIFwiaGVpZ2h0OiAje0BoZWlnaHR9LiBoZWlnaHQgaWYgc2NyZWVuIHdhcyAxNjo5IChhc3BlY3QgYWRqdXN0ZWQpOiAje0BhYUhlaWdodH1cIlxyXG4gICAgQHBhdXNlQnV0dG9uU2l6ZSA9IEBhYUhlaWdodCAvIDE1XHJcbiAgICBAY29sb3JzID1cclxuICAgICAgYXJyb3c6ICAgICAgeyByOiAgIDEsIGc6ICAgMSwgYjogICAxLCBhOiAgIDEgfVxyXG4gICAgICBhcnJvd2Nsb3NlOiB7IHI6ICAgMSwgZzogMC41LCBiOiAgIDAsIGE6IDAuMyB9XHJcbiAgICAgIGJhY2tncm91bmQ6IHsgcjogICAwLCBnOiAwLjIsIGI6ICAgMCwgYTogICAxIH1cclxuICAgICAgYmlkOiAgICAgICAgeyByOiAgIDAsIGc6IDAuNiwgYjogICAwLCBhOiAgIDEgfVxyXG4gICAgICBibGFjazogICAgICB7IHI6ICAgMCwgZzogICAwLCBiOiAgIDAsIGE6ICAgMSB9XHJcbiAgICAgIGJ1dHRvbnRleHQ6IHsgcjogICAxLCBnOiAgIDEsIGI6ICAgMSwgYTogICAxIH1cclxuICAgICAgZ2FtZV9vdmVyOiAgeyByOiAgIDEsIGc6IDAuNSwgYjogICAwLCBhOiAgIDEgfVxyXG4gICAgICBnb2xkOiAgICAgICB7IHI6ICAgMSwgZzogICAxLCBiOiAgIDAsIGE6ICAgMSB9XHJcbiAgICAgIGhhbmRfYW55OiAgIHsgcjogICAwLCBnOiAgIDAsIGI6IDAuMiwgYTogMS4wIH1cclxuICAgICAgaGFuZF9waWNrOiAgeyByOiAgIDAsIGc6IDAuMSwgYjogICAwLCBhOiAxLjAgfVxyXG4gICAgICBoYW5kX3Jlb3JnOiB7IHI6IDAuNCwgZzogICAwLCBiOiAgIDAsIGE6IDEuMCB9XHJcbiAgICAgIGxpZ2h0Z3JheTogIHsgcjogMC41LCBnOiAwLjUsIGI6IDAuNSwgYTogICAxIH1cclxuICAgICAgbG9nYmc6ICAgICAgeyByOiAwLjEsIGc6ICAgMCwgYjogICAwLCBhOiAgIDEgfVxyXG4gICAgICBsb2djb2xvcjogICB7IHI6IDAuNSwgZzogMC41LCBiOiAwLjUsIGE6ICAgMSB9XHJcbiAgICAgIG1haW5tZW51OiAgIHsgcjogMC4xLCBnOiAwLjEsIGI6IDAuMSwgYTogICAxIH1cclxuICAgICAgb3JhbmdlOiAgICAgeyByOiAgIDEsIGc6IDAuNSwgYjogICAwLCBhOiAgIDEgfVxyXG4gICAgICBvdmVybGF5OiAgICB7IHI6ICAgMCwgZzogICAwLCBiOiAgIDAsIGE6IDAuNiB9XHJcbiAgICAgIHBhdXNlbWVudTogIHsgcjogMC4xLCBnOiAwLjAsIGI6IDAuMSwgYTogICAxIH1cclxuICAgICAgb3B0aW9ubWVudTogeyByOiAwLjAsIGc6IDAuMSwgYjogMC4xLCBhOiAgIDEgfVxyXG4gICAgICBwaWxlOiAgICAgICB7IHI6IDAuNCwgZzogMC4yLCBiOiAgIDAsIGE6ICAgMSB9XHJcbiAgICAgIHBsYXlfYWdhaW46IHsgcjogICAwLCBnOiAgIDAsIGI6ICAgMCwgYTogMC42IH1cclxuICAgICAgcmVkOiAgICAgICAgeyByOiAgIDEsIGc6ICAgMCwgYjogICAwLCBhOiAgIDEgfVxyXG4gICAgICB3aGl0ZTogICAgICB7IHI6ICAgMSwgZzogICAxLCBiOiAgIDEsIGE6ICAgMSB9XHJcbiAgICAgIGFjaF9iZzogICAgIHsgcjogMC4xLCBnOiAwLjEsIGI6IDAuMSwgYTogICAxIH1cclxuICAgICAgYWNoX2hlYWRlcjogeyByOiAgIDEsIGc6IDAuNSwgYjogICAwLCBhOiAgIDEgfVxyXG4gICAgICBhY2hfdGl0bGU6ICB7IHI6ICAgMSwgZzogICAxLCBiOiAgIDEsIGE6ICAgMSB9XHJcbiAgICAgIGFjaF9kZXNjOiAgIHsgcjogMC43LCBnOiAwLjcsIGI6IDAuNywgYTogICAxIH1cclxuXHJcbiAgICBAdGV4dHVyZXMgPVxyXG4gICAgICBcImNhcmRzXCI6IDBcclxuICAgICAgXCJkYXJrZm9yZXN0XCI6IDFcclxuICAgICAgXCJjaGFyc1wiOiAyXHJcbiAgICAgIFwiaG93dG8xXCI6IDNcclxuXHJcbiAgICBAdGhpcnRlZW4gPSBudWxsXHJcbiAgICBAbGFzdEVyciA9ICcnXHJcbiAgICBAcmVuZGVyTW9kZSA9IFJlbmRlck1vZGUuR0FNRVxyXG4gICAgQHJlbmRlckNvbW1hbmRzID0gW11cclxuICAgIEBhY2hpZXZlbWVudEZhbmZhcmUgPSBudWxsXHJcblxyXG4gICAgQG9wdGlvbk1lbnVzID1cclxuICAgICAgc3BlZWRzOiBbXHJcbiAgICAgICAgeyB0ZXh0OiBcIkFJIFNwZWVkOiBTbG93XCIsIHNwZWVkOiAyMDAwIH1cclxuICAgICAgICB7IHRleHQ6IFwiQUkgU3BlZWQ6IE1lZGl1bVwiLCBzcGVlZDogMTAwMCB9XHJcbiAgICAgICAgeyB0ZXh0OiBcIkFJIFNwZWVkOiBGYXN0XCIsIHNwZWVkOiA1MDAgfVxyXG4gICAgICAgIHsgdGV4dDogXCJBSSBTcGVlZDogVWx0cmFcIiwgc3BlZWQ6IDI1MCB9XHJcbiAgICAgIF1cclxuICAgICAgc29ydHM6IFtcclxuICAgICAgICB7IHRleHQ6IFwiU29ydCBPcmRlcjogTm9ybWFsXCIgfVxyXG4gICAgICAgIHsgdGV4dDogXCJTb3J0IE9yZGVyOiBSZXZlcnNlXCIgfVxyXG4gICAgICBdXHJcbiAgICAgIGF1dG9wYXNzZXM6IFtcclxuICAgICAgICB7IHRleHQ6IFwiQXV0b1Bhc3M6IERpc2FibGVkXCIgfVxyXG4gICAgICAgIHsgdGV4dDogXCJBdXRvUGFzczogRnVsbFwiIH1cclxuICAgICAgICB7IHRleHQ6IFwiQXV0b1Bhc3M6IExpbWl0ZWRcIiB9XHJcbiAgICAgIF1cclxuICAgIEBvcHRpb25zID1cclxuICAgICAgc3BlZWRJbmRleDogMVxyXG4gICAgICBzb3J0SW5kZXg6IDBcclxuICAgICAgc291bmQ6IHRydWVcclxuICAgICAgYXV0b3Bhc3NJbmRleDogMlxyXG5cclxuICAgIEBwYXVzZU1lbnUgPSBuZXcgTWVudSB0aGlzLCBcIlBhdXNlZFwiLCBcInNvbGlkXCIsIEBjb2xvcnMucGF1c2VtZW51LCBbXHJcbiAgICAgIChjbGljaykgPT5cclxuICAgICAgICBpZiBjbGlja1xyXG4gICAgICAgICAgQHJlbmRlck1vZGUgPSBSZW5kZXJNb2RlLkdBTUVcclxuICAgICAgICByZXR1cm4gXCJSZXN1bWUgR2FtZVwiXHJcbiAgICAgIChjbGljaykgPT5cclxuICAgICAgICBpZiBjbGlja1xyXG4gICAgICAgICAgQHJlbmRlck1vZGUgPSBSZW5kZXJNb2RlLk9QVElPTlNcclxuICAgICAgICByZXR1cm4gXCJPcHRpb25zXCJcclxuICAgICAgKGNsaWNrKSA9PlxyXG4gICAgICAgIGlmIGNsaWNrXHJcbiAgICAgICAgICBAcmVuZGVyTW9kZSA9IFJlbmRlck1vZGUuQUNISUVWRU1FTlRTXHJcbiAgICAgICAgcmV0dXJuIFwiQWNoaWV2ZW1lbnRzXCJcclxuICAgICAgKGNsaWNrKSA9PlxyXG4gICAgICAgIGlmIGNsaWNrXHJcbiAgICAgICAgICBAcmVuZGVyTW9kZSA9IFJlbmRlck1vZGUuSE9XVE9cclxuICAgICAgICByZXR1cm4gXCJIb3cgVG8gUGxheVwiXHJcbiAgICAgIChjbGljaykgPT5cclxuICAgICAgICBpZiBjbGlja1xyXG4gICAgICAgICAgQG5ld0dhbWUodHJ1ZSlcclxuICAgICAgICAgIEByZW5kZXJNb2RlID0gUmVuZGVyTW9kZS5HQU1FXHJcbiAgICAgICAgcmV0dXJuIFwiTmV3IE1vbmV5IEdhbWVcIlxyXG4gICAgICAoY2xpY2spID0+XHJcbiAgICAgICAgaWYgY2xpY2tcclxuICAgICAgICAgIEBuZXdHYW1lKGZhbHNlKVxyXG4gICAgICAgICAgQHJlbmRlck1vZGUgPSBSZW5kZXJNb2RlLkdBTUVcclxuICAgICAgICByZXR1cm4gXCJOZXcgR2FtZVwiXHJcbiAgICBdXHJcblxyXG4gICAgQG9wdGlvbk1lbnUgPSBuZXcgTWVudSB0aGlzLCBcIk9wdGlvbnNcIiwgXCJzb2xpZFwiLCBAY29sb3JzLm9wdGlvbm1lbnUsIFtcclxuICAgICAgKGNsaWNrKSA9PlxyXG4gICAgICAgIGlmIGNsaWNrXHJcbiAgICAgICAgICBAb3B0aW9ucy5zcGVlZEluZGV4ID0gKEBvcHRpb25zLnNwZWVkSW5kZXggKyAxKSAlIEBvcHRpb25NZW51cy5zcGVlZHMubGVuZ3RoXHJcbiAgICAgICAgcmV0dXJuIEBvcHRpb25NZW51cy5zcGVlZHNbQG9wdGlvbnMuc3BlZWRJbmRleF0udGV4dFxyXG4gICAgICAoY2xpY2spID0+XHJcbiAgICAgICAgaWYgY2xpY2tcclxuICAgICAgICAgIEBvcHRpb25zLmF1dG9wYXNzSW5kZXggPSAoQG9wdGlvbnMuYXV0b3Bhc3NJbmRleCArIDEpICUgQG9wdGlvbk1lbnVzLmF1dG9wYXNzZXMubGVuZ3RoXHJcbiAgICAgICAgcmV0dXJuIEBvcHRpb25NZW51cy5hdXRvcGFzc2VzW0BvcHRpb25zLmF1dG9wYXNzSW5kZXhdLnRleHRcclxuICAgICAgKGNsaWNrKSA9PlxyXG4gICAgICAgIGlmIGNsaWNrXHJcbiAgICAgICAgICBAb3B0aW9ucy5zb3J0SW5kZXggPSAoQG9wdGlvbnMuc29ydEluZGV4ICsgMSkgJSBAb3B0aW9uTWVudXMuc29ydHMubGVuZ3RoXHJcbiAgICAgICAgcmV0dXJuIEBvcHRpb25NZW51cy5zb3J0c1tAb3B0aW9ucy5zb3J0SW5kZXhdLnRleHRcclxuICAgICAgKGNsaWNrKSA9PlxyXG4gICAgICAgIGlmIGNsaWNrXHJcbiAgICAgICAgICBAcmVuZGVyTW9kZSA9IFJlbmRlck1vZGUuUEFVU0VcclxuICAgICAgICByZXR1cm4gXCJCYWNrXCJcclxuICAgIF1cclxuXHJcbiAgICBAdGhpcnRlZW4gPSBuZXcgVGhpcnRlZW4gdGhpcywge31cclxuICAgIEBsb2cgXCJwbGF5ZXIgMCdzIGhhbmQ6IFwiICsgSlNPTi5zdHJpbmdpZnkoQHRoaXJ0ZWVuLnBsYXllcnNbMF0uaGFuZClcclxuICAgIEBwcmVwYXJlR2FtZSgpXHJcblxyXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAjIGxvZ2dpbmdcclxuXHJcbiAgbG9nOiAocykgLT5cclxuICAgIEBuYXRpdmUubG9nKHMpXHJcblxyXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAjIGxvYWQgLyBzYXZlXHJcblxyXG4gIGxvYWQ6IChqc29uKSAtPlxyXG4gICAgQGxvZyBcIihDUykgbG9hZGluZyBzdGF0ZVwiXHJcbiAgICB0cnlcclxuICAgICAgc3RhdGUgPSBKU09OLnBhcnNlIGpzb25cclxuICAgIGNhdGNoXHJcbiAgICAgIEBsb2cgXCJsb2FkIGZhaWxlZCB0byBwYXJzZSBzdGF0ZTogI3tqc29ufVwiXHJcbiAgICAgIHJldHVyblxyXG4gICAgaWYgc3RhdGUub3B0aW9uc1xyXG4gICAgICBmb3IgaywgdiBvZiBzdGF0ZS5vcHRpb25zXHJcbiAgICAgICAgQG9wdGlvbnNba10gPSB2XHJcblxyXG4gICAgaWYgc3RhdGUudGhpcnRlZW5cclxuICAgICAgQGxvZyBcInJlY3JlYXRpbmcgZ2FtZSBmcm9tIHNhdmVkYXRhXCJcclxuICAgICAgQHRoaXJ0ZWVuID0gbmV3IFRoaXJ0ZWVuIHRoaXMsIHtcclxuICAgICAgICBzdGF0ZTogc3RhdGUudGhpcnRlZW5cclxuICAgICAgfVxyXG4gICAgICBAcHJlcGFyZUdhbWUoKVxyXG5cclxuICBzYXZlOiAtPlxyXG4gICAgIyBAbG9nIFwiKENTKSBzYXZpbmcgc3RhdGVcIlxyXG4gICAgc3RhdGUgPSB7XHJcbiAgICAgIG9wdGlvbnM6IEBvcHRpb25zXHJcbiAgICB9XHJcblxyXG4gICAgaWYgQHRoaXJ0ZWVuP1xyXG4gICAgICBAdGhpcnRlZW4udXBkYXRlUGxheWVySGFuZChAaGFuZC5jYXJkcylcclxuICAgICAgc3RhdGUudGhpcnRlZW4gPSBAdGhpcnRlZW4uc2F2ZSgpXHJcblxyXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5IHN0YXRlXHJcblxyXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgYWlUaWNrUmF0ZTogLT5cclxuICAgIHJldHVybiBAb3B0aW9uTWVudXMuc3BlZWRzW0BvcHRpb25zLnNwZWVkSW5kZXhdLnNwZWVkXHJcblxyXG4gIG5ld0dhbWU6IChtb25leSkgLT5cclxuICAgIEB0aGlydGVlbi5uZXdHYW1lKG1vbmV5KVxyXG4gICAgQHByZXBhcmVHYW1lKClcclxuXHJcbiAgcHJlcGFyZUdhbWU6IC0+XHJcbiAgICBAaGFuZCA9IG5ldyBIYW5kIHRoaXNcclxuICAgIEBwaWxlID0gbmV3IFBpbGUgdGhpcywgQGhhbmRcclxuICAgIEBoYW5kLnNldCBAdGhpcnRlZW4ucGxheWVyc1swXS5oYW5kXHJcbiAgICBAbGFzdEVyciA9ICcnXHJcblxyXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAjIGlucHV0IGhhbmRsaW5nXHJcblxyXG4gIHRvdWNoRG93bjogKHgsIHkpIC0+XHJcbiAgICAjIEBsb2coXCJ0b3VjaERvd24gI3t4fSwje3l9XCIpXHJcbiAgICBAY2hlY2tab25lcyh4LCB5KVxyXG5cclxuICB0b3VjaE1vdmU6ICh4LCB5KSAtPlxyXG4gICAgIyBAbG9nKFwidG91Y2hNb3ZlICN7eH0sI3t5fVwiKVxyXG4gICAgaWYgQHRoaXJ0ZWVuICE9IG51bGxcclxuICAgICAgQGhhbmQubW92ZSh4LCB5KVxyXG5cclxuICB0b3VjaFVwOiAoeCwgeSkgLT5cclxuICAgICMgQGxvZyhcInRvdWNoVXAgI3t4fSwje3l9XCIpXHJcbiAgICBpZiBAdGhpcnRlZW4gIT0gbnVsbFxyXG4gICAgICBAaGFuZC51cCh4LCB5KVxyXG5cclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgIyBoZWFkbGluZSAoZ2FtZSBzdGF0ZSBpbiB0b3AgbGVmdClcclxuXHJcbiAgcHJldHR5RXJyb3JUYWJsZToge1xyXG4gICAgICBnYW1lT3ZlcjogICAgICAgICAgIFwiVGhlIGdhbWUgaXMgb3Zlci5cIlxyXG4gICAgICBpbnZhbGlkUGxheTogICAgICAgIFwiTm90IGEgdmFsaWQgcGxheS5cIlxyXG4gICAgICBtdXN0QnJlYWtPclBhc3M6ICAgIFwiWW91IHBhc3NlZCBhbHJlYWR5LCBzbyAyLWJyZWFrZXIgb3IgcGFzcy5cIlxyXG4gICAgICBtdXN0UGFzczogICAgICAgICAgIFwiWW91IG11c3QgcGFzcy5cIlxyXG4gICAgICBtdXN0VGhyb3czUzogICAgICAgIFwiWW91IG11c3QgdXNlIHRoZSAzXFx4YzggaW4geW91ciBwbGF5LlwiXHJcbiAgICAgIG5vdFlvdXJUdXJuOiAgICAgICAgXCJJdCBpcyBub3QgeW91ciB0dXJuLlwiXHJcbiAgICAgIHRocm93QW55dGhpbmc6ICAgICAgXCJZb3UgaGF2ZSBjb250cm9sLCB0aHJvdyBhbnl0aGluZy5cIlxyXG4gICAgICB0b29Mb3dQbGF5OiAgICAgICAgIFwiVGhpcyBwbGF5IGlzIG5vdCBzdHJvbmdlciB0aGFuIHRoZSBjdXJyZW50IHBsYXkuXCJcclxuICAgICAgd3JvbmdQbGF5OiAgICAgICAgICBcIlRoaXMgcGxheSBkb2VzIG5vdCBtYXRjaCB0aGUgY3VycmVudCBwbGF5LlwiXHJcbiAgfVxyXG5cclxuICBwcmV0dHlFcnJvcjogLT5cclxuICAgIHByZXR0eSA9IEBwcmV0dHlFcnJvclRhYmxlW0BsYXN0RXJyXVxyXG4gICAgcmV0dXJuIHByZXR0eSBpZiBwcmV0dHlcclxuICAgIHJldHVybiBAbGFzdEVyclxyXG5cclxuICBjYWxjSGVhZGxpbmU6IC0+XHJcbiAgICByZXR1cm4gXCJcIiBpZiBAdGhpcnRlZW4gPT0gbnVsbFxyXG5cclxuICAgIGhlYWRsaW5lID0gQHRoaXJ0ZWVuLmhlYWRsaW5lKClcclxuICAgICMgc3dpdGNoIEB0aGlydGVlbi5zdGF0ZVxyXG4gICAgIyAgIHdoZW4gU3RhdGUuQklEXHJcbiAgICAjICAgICBoZWFkbGluZSA9IFwiV2FpdGluZyBmb3IgYGZmNzcwMGAje0B0aGlydGVlbi5wbGF5ZXJzW0B0aGlydGVlbi50dXJuXS5uYW1lfWBgIHRvIGBmZmZmMDBgYmlkYGBcIlxyXG4gICAgIyAgIHdoZW4gU3RhdGUuVFJJQ0tcclxuICAgICMgICAgIGhlYWRsaW5lID0gXCJXYWl0aW5nIGZvciBgZmY3NzAwYCN7QHRoaXJ0ZWVuLnBsYXllcnNbQHRoaXJ0ZWVuLnR1cm5dLm5hbWV9YGAgdG8gYGZmZmYwMGBwbGF5YGBcIlxyXG4gICAgIyAgIHdoZW4gU3RhdGUuUk9VTkRTVU1NQVJZXHJcbiAgICAjICAgICBoZWFkbGluZSA9IFwiV2FpdGluZyBmb3IgbmV4dCByb3VuZC4uLlwiXHJcbiAgICAjICAgd2hlbiBTdGF0ZS5QT1NUR0FNRVNVTU1BUllcclxuICAgICMgICAgIGhlYWRsaW5lID0gXCJHYW1lIG92ZXIhXCJcclxuXHJcbiAgICBlcnJUZXh0ID0gXCJcIlxyXG4gICAgaWYgKEBsYXN0RXJyLmxlbmd0aCA+IDApIGFuZCAoQGxhc3RFcnIgIT0gT0spXHJcbiAgICAgIGVyclRleHQgPSBcIiAgYGZmZmZmZmBFUlJPUjogYGZmMDAwMGAje0BwcmV0dHlFcnJvcigpfVwiXHJcbiAgICAgIGhlYWRsaW5lICs9IGVyclRleHRcclxuXHJcbiAgICByZXR1cm4gaGVhZGxpbmVcclxuXHJcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICMgZ2FtZSBvdmVyIGluZm9ybWF0aW9uXHJcblxyXG4gIGdhbWVPdmVyVGV4dDogLT5cclxuICAgIHdpbm5lciA9IEB0aGlydGVlbi53aW5uZXIoKVxyXG4gICAgaWYgd2lubmVyLm5hbWUgPT0gXCJQbGF5ZXJcIlxyXG4gICAgICBpZiBAdGhpcnRlZW4ubGFzdFN0cmVhayA9PSAxXHJcbiAgICAgICAgcmV0dXJuIFtcIllvdSB3aW4hXCIsIFwiQSBuZXcgc3RyZWFrIVwiXVxyXG4gICAgICByZXR1cm4gW1wiWW91IHdpbiFcIiwgXCIje0B0aGlydGVlbi5sYXN0U3RyZWFrfSBpbiBhIHJvdyFcIl1cclxuICAgIGlmIEB0aGlydGVlbi5sYXN0U3RyZWFrID09IDBcclxuICAgICAgcmV0dXJuIFtcIiN7d2lubmVyLm5hbWV9IHdpbnMhXCIsIFwiVHJ5IGFnYWluLi4uXCJdXHJcbiAgICByZXR1cm4gW1wiI3t3aW5uZXIubmFtZX0gd2lucyFcIiwgXCJTdHJlYWsgZW5kZWQ6ICN7QHRoaXJ0ZWVuLmxhc3RTdHJlYWt9IHdpbnNcIl1cclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgIyBjYXJkIGhhbmRsaW5nXHJcblxyXG4gIHBhc3M6IC0+XHJcbiAgICBAbGFzdEVyciA9IEB0aGlydGVlbi5wYXNzIHtcclxuICAgICAgaWQ6IDFcclxuICAgIH1cclxuXHJcbiAgcGxheTogKGNhcmRzKSAtPlxyXG4gICAgY29uc29sZS5sb2cgXCIoZ2FtZSkgcGxheWluZyBjYXJkc1wiLCBjYXJkc1xyXG5cclxuICAgIEB0aGlydGVlbi51cGRhdGVQbGF5ZXJIYW5kKEBoYW5kLmNhcmRzKVxyXG5cclxuICAgIHJhd0NhcmRzID0gW11cclxuICAgIGZvciBjYXJkIGluIGNhcmRzXHJcbiAgICAgIHJhd0NhcmRzLnB1c2ggY2FyZC5jYXJkXHJcblxyXG4gICAgcmV0ID0gQHRoaXJ0ZWVuLnBsYXkge1xyXG4gICAgICBpZDogMVxyXG4gICAgICBjYXJkczogcmF3Q2FyZHNcclxuICAgIH1cclxuICAgIEBsYXN0RXJyID0gcmV0XHJcbiAgICBpZiByZXQgPT0gT0tcclxuICAgICAgQGhhbmQuc2V0IEB0aGlydGVlbi5wbGF5ZXJzWzBdLmhhbmRcclxuICAgICAgQHBpbGUuaGludCBjYXJkc1xyXG5cclxuICBwbGF5UGlja2VkOiAtPlxyXG4gICAgaWYgbm90IEBoYW5kLnBpY2tpbmdcclxuICAgICAgcmV0dXJuXHJcbiAgICBjYXJkcyA9IEBoYW5kLnNlbGVjdGVkQ2FyZHMoKVxyXG4gICAgIyBAaGFuZC5zZWxlY3ROb25lKClcclxuICAgIGlmIGNhcmRzLmxlbmd0aCA9PSAwXHJcbiAgICAgIHJldHVybiBAcGFzcygpXHJcbiAgICAjIEBoYW5kLnRvZ2dsZVBpY2tpbmcoKVxyXG4gICAgcmV0dXJuIEBwbGF5KGNhcmRzKVxyXG5cclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgIyBtYWluIGxvb3BcclxuXHJcbiAgdXBkYXRlOiAoZHQpIC0+XHJcbiAgICBAem9uZXMubGVuZ3RoID0gMCAjIGZvcmdldCBhYm91dCB6b25lcyBmcm9tIHRoZSBsYXN0IGZyYW1lLiB3ZSdyZSBhYm91dCB0byBtYWtlIHNvbWUgbmV3IG9uZXMhXHJcblxyXG4gICAgdXBkYXRlZCA9IGZhbHNlXHJcbiAgICBpZiBAdXBkYXRlR2FtZShkdClcclxuICAgICAgdXBkYXRlZCA9IHRydWVcclxuXHJcbiAgICByZXR1cm4gdXBkYXRlZFxyXG5cclxuICB1cGRhdGVHYW1lOiAoZHQpIC0+XHJcbiAgICByZXR1cm4gZmFsc2UgaWYgQHRoaXJ0ZWVuID09IG51bGxcclxuXHJcbiAgICB1cGRhdGVkID0gZmFsc2VcclxuXHJcbiAgICBpZiBAcGlsZS51cGRhdGUoZHQpXHJcbiAgICAgIHVwZGF0ZWQgPSB0cnVlXHJcbiAgICBpZiBAcGlsZS5yZWFkeUZvck5leHRUcmljaygpXHJcbiAgICAgIEBuZXh0QUlUaWNrIC09IGR0XHJcbiAgICAgIGlmIEBuZXh0QUlUaWNrIDw9IDBcclxuICAgICAgICBAbmV4dEFJVGljayA9IEBhaVRpY2tSYXRlKClcclxuICAgICAgICBpZiBAdGhpcnRlZW4uYWlUaWNrKClcclxuICAgICAgICAgIHVwZGF0ZWQgPSB0cnVlXHJcbiAgICBpZiBAaGFuZC51cGRhdGUoZHQpXHJcbiAgICAgIHVwZGF0ZWQgPSB0cnVlXHJcblxyXG4gICAgQHBpbGUuc2V0IEB0aGlydGVlbi50aHJvd0lELCBAdGhpcnRlZW4ucGlsZSwgQHRoaXJ0ZWVuLnBpbGVXaG9cclxuXHJcbiAgICBpZiBAcGF1c2VNZW51LnVwZGF0ZShkdClcclxuICAgICAgdXBkYXRlZCA9IHRydWVcclxuXHJcbiAgICBpZiBAb3B0aW9uTWVudS51cGRhdGUoZHQpXHJcbiAgICAgIHVwZGF0ZWQgPSB0cnVlXHJcblxyXG4gICAgaWYgQGFjaGlldmVtZW50RmFuZmFyZSAhPSBudWxsXHJcbiAgICAgIEBhY2hpZXZlbWVudEZhbmZhcmUudGltZSArPSBkdFxyXG4gICAgICBpZiBAYWNoaWV2ZW1lbnRGYW5mYXJlLnRpbWUgPiA1MDAwXHJcbiAgICAgICAgQGFjaGlldmVtZW50RmFuZmFyZSA9IG51bGxcclxuICAgICAgdXBkYXRlZCA9IHRydWVcclxuXHJcbiAgICBpZiBAYWNoaWV2ZW1lbnRGYW5mYXJlID09IG51bGxcclxuICAgICAgaWYgQHRoaXJ0ZWVuLmZhbmZhcmVzLmxlbmd0aCA+IDBcclxuICAgICAgICBAYWNoaWV2ZW1lbnRGYW5mYXJlID1cclxuICAgICAgICAgIHRpdGxlOiBAdGhpcnRlZW4uZmFuZmFyZXMuc2hpZnQoKVxyXG4gICAgICAgICAgdGltZTogMFxyXG5cclxuICAgIHJldHVybiB1cGRhdGVkXHJcblxyXG4gIHJlbmRlcjogLT5cclxuICAgICMgUmVzZXQgcmVuZGVyIGNvbW1hbmRzXHJcbiAgICBAcmVuZGVyQ29tbWFuZHMubGVuZ3RoID0gMFxyXG5cclxuICAgIHN3aXRjaCBAcmVuZGVyTW9kZVxyXG4gICAgICB3aGVuIFJlbmRlck1vZGUuSE9XVE9cclxuICAgICAgICBAcmVuZGVySG93dG8oKVxyXG4gICAgICB3aGVuIFJlbmRlck1vZGUuQUNISUVWRU1FTlRTXHJcbiAgICAgICAgQHJlbmRlckFjaGlldmVtZW50cygpXHJcbiAgICAgIHdoZW4gUmVuZGVyTW9kZS5PUFRJT05TXHJcbiAgICAgICAgQHJlbmRlck9wdGlvbnMoKVxyXG4gICAgICB3aGVuIFJlbmRlck1vZGUuUEFVU0VcclxuICAgICAgICBAcmVuZGVyUGF1c2UoKVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgQHJlbmRlckdhbWUoKVxyXG5cclxuICAgIHJldHVybiBAcmVuZGVyQ29tbWFuZHNcclxuXHJcbiAgcmVuZGVyUGF1c2U6IC0+XHJcbiAgICBAcGF1c2VNZW51LnJlbmRlcigpXHJcblxyXG4gIHJlbmRlck9wdGlvbnM6IC0+XHJcbiAgICBAb3B0aW9uTWVudS5yZW5kZXIoKVxyXG5cclxuICByZW5kZXJIb3d0bzogLT5cclxuICAgIGhvd3RvVGV4dHVyZSA9IFwiaG93dG8xXCJcclxuICAgIEBsb2cgXCJyZW5kZXJpbmcgI3tob3d0b1RleHR1cmV9XCJcclxuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJzb2xpZFwiLCAwLCAwLCBAd2lkdGgsIEBoZWlnaHQsIDAsIDAsIDAsIEBjb2xvcnMuYmxhY2tcclxuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgaG93dG9UZXh0dXJlLCAwLCAwLCBAd2lkdGgsIEBhYUhlaWdodCwgMCwgMCwgMCwgQGNvbG9ycy53aGl0ZSwgPT5cclxuICAgICAgQHJlbmRlck1vZGUgPSBSZW5kZXJNb2RlLlBBVVNFXHJcblxyXG4gIGRlYnVnOiAtPlxyXG4gICAgY29uc29sZS5sb2cgXCJkZWJ1ZyBhY2hcIlxyXG4gICAgY29uc29sZS5sb2cgQHRoaXJ0ZWVuLmFjaFxyXG4gICAgIyBAdGhpcnRlZW4uYWNoLmVhcm5lZCA9IHt9XHJcbiAgICAjIEB0aGlydGVlbi5hY2guZWFybmVkLnZldGVyYW4gPSB0cnVlXHJcbiAgICAjIEB0aGlydGVlbi5hY2guZWFybmVkLnRyeWhhcmQgPSB0cnVlXHJcbiAgICAjIEB0aGlydGVlbi5hY2guZWFybmVkLmJyZWFrZXIgPSB0cnVlXHJcbiAgICAjIEB0aGlydGVlbi5hY2guZWFybmVkLmtlZXBpdGxvdyA9IHRydWVcclxuICAgICMgQHRoaXJ0ZWVuLmFjaC5lYXJuZWQuc3VpdGVkID0gdHJ1ZVxyXG4gICAgIyBAdGhpcnRlZW4uYWNoLmVhcm5lZC50b255ID0gdHJ1ZVxyXG4gICAgIyBAdGhpcnRlZW4uYWNoLmVhcm5lZC5zYW1wbGVyID0gdHJ1ZVxyXG4gICAgIyBAdGhpcnRlZW4uYWNoLmVhcm5lZC50cmFnZWR5ID0gdHJ1ZVxyXG4gICAgIyBAdGhpcnRlZW4uYWNoLmVhcm5lZC5pbmRvbWl0YWJsZSA9IHRydWVcclxuICAgICMgQHRoaXJ0ZWVuLmFjaC5lYXJuZWQucmVrdCA9IHRydWVcclxuICAgICMgQHRoaXJ0ZWVuLmFjaC5lYXJuZWQubGF0ZSA9IHRydWVcclxuICAgICMgQHRoaXJ0ZWVuLmFjaC5lYXJuZWQucGFpcnMgPSB0cnVlXHJcblxyXG4gICAgIyBAdGhpcnRlZW4uYWNoLnN0YXRlLnRvdGFsR2FtZXMgPSAwXHJcbiAgICAjIEB0aGlydGVlbi5zdHJlYWsgPSAwXHJcblxyXG4gIHJlbmRlckFjaGlldmVtZW50czogLT5cclxuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJzb2xpZFwiLCAwLCAwLCBAd2lkdGgsIEBoZWlnaHQsIDAsIDAsIDAsIEBjb2xvcnMuYWNoX2JnLCA9PlxyXG4gICAgICBAcmVuZGVyTW9kZSA9IFJlbmRlck1vZGUuUEFVU0VcclxuXHJcbiAgICB0aXRsZUhlaWdodCA9IEBoZWlnaHQgLyAyMFxyXG4gICAgdGl0bGVPZmZzZXQgPSB0aXRsZUhlaWdodCAvIDJcclxuICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCB0aXRsZUhlaWdodCwgXCJBY2hpZXZlbWVudHNcIiwgQGNlbnRlci54LCB0aXRsZU9mZnNldCwgMC41LCAwLjUsIEBjb2xvcnMuYWNoX2hlYWRlclxyXG5cclxuICAgIGltYWdlTWFyZ2luID0gQHdpZHRoIC8gMTVcclxuICAgIHRvcEhlaWdodCA9IHRpdGxlSGVpZ2h0XHJcbiAgICB4ID0gQHdpZHRoIC8gMTIwXHJcbiAgICB5ID0gdG9wSGVpZ2h0XHJcbiAgICB0aXRsZUhlaWdodCA9IEBoZWlnaHQgLyAyMlxyXG4gICAgZGVzY0hlaWdodCA9IEBoZWlnaHQgLyAzMFxyXG4gICAgaW1hZ2VEaW0gPSB0aXRsZUhlaWdodCAqIDJcclxuICAgIGZvciBhY2gsIGFjaEluZGV4IGluIGFjaGlldmVtZW50c0xpc3RcclxuICAgICAgaWNvbiA9IFwic3Rhcl9vZmZcIlxyXG4gICAgICBpZiBAdGhpcnRlZW4uYWNoLmVhcm5lZFthY2guaWRdXHJcbiAgICAgICAgaWNvbiA9IFwic3Rhcl9vblwiXHJcbiAgICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgaWNvbiwgeCwgeSwgaW1hZ2VEaW0sIGltYWdlRGltLCAwLCAwLCAwLCBAY29sb3JzLndoaXRlXHJcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCB0aXRsZUhlaWdodCwgYWNoLnRpdGxlLCB4ICsgaW1hZ2VNYXJnaW4sIHksIDAsIDAsIEBjb2xvcnMuYWNoX3RpdGxlXHJcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCBkZXNjSGVpZ2h0LCBhY2guZGVzY3JpcHRpb25bMF0sIHggKyBpbWFnZU1hcmdpbiwgeSArIHRpdGxlSGVpZ2h0LCAwLCAwLCBAY29sb3JzLmFjaF9kZXNjXHJcbiAgICAgIGlmIGFjaC5wcm9ncmVzcz9cclxuICAgICAgICBwcm9ncmVzcyA9IGFjaC5wcm9ncmVzcyhAdGhpcnRlZW4uYWNoKVxyXG4gICAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCBkZXNjSGVpZ2h0LCBwcm9ncmVzcywgeCArIGltYWdlTWFyZ2luLCB5ICsgdGl0bGVIZWlnaHQgKyBkZXNjSGVpZ2h0LCAwLCAwLCBAY29sb3JzLmFjaF9kZXNjXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBpZiBhY2guZGVzY3JpcHRpb24ubGVuZ3RoID4gMVxyXG4gICAgICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIGRlc2NIZWlnaHQsIGFjaC5kZXNjcmlwdGlvblsxXSwgeCArIGltYWdlTWFyZ2luLCB5ICsgdGl0bGVIZWlnaHQgKyBkZXNjSGVpZ2h0LCAwLCAwLCBAY29sb3JzLmFjaF9kZXNjXHJcbiAgICAgIGlmIGFjaEluZGV4ID09IDZcclxuICAgICAgICB5ID0gdG9wSGVpZ2h0XHJcbiAgICAgICAgeCArPSBAd2lkdGggLyAyXHJcbiAgICAgIGVsc2VcclxuICAgICAgICB5ICs9IHRpdGxlSGVpZ2h0ICogM1xyXG5cclxuICByZW5kZXJBSUhhbmQ6IChoYW5kLCB4LCB5LCBvZmZzZXQpIC0+XHJcbiAgICBzb3J0ZWQgPSBoYW5kLnNvcnQgKGEsIGIpIC0+IGEgLSBiXHJcbiAgICBmb3IgcmF3LCBpIGluIHNvcnRlZFxyXG4gICAgICBAaGFuZC5yZW5kZXJDYXJkIHJhdywgeCArIChpICogb2Zmc2V0KSwgeSwgMCwgMC43LCAwXHJcblxyXG4gIHJlbmRlckdhbWU6IC0+XHJcblxyXG4gICAgIyBiYWNrZ3JvdW5kXHJcbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwic29saWRcIiwgMCwgMCwgQHdpZHRoLCBAaGVpZ2h0LCAwLCAwLCAwLCBAY29sb3JzLmJhY2tncm91bmRcclxuXHJcbiAgICB0ZXh0SGVpZ2h0ID0gQGFhSGVpZ2h0IC8gMjVcclxuICAgIHRleHRQYWRkaW5nID0gdGV4dEhlaWdodCAvIDVcclxuICAgIGNoYXJhY3RlckhlaWdodCA9IEBhYUhlaWdodCAvIDVcclxuICAgIGNvdW50SGVpZ2h0ID0gdGV4dEhlaWdodFxyXG5cclxuICAgIGRyYXdHYW1lT3ZlciA9IEB0aGlydGVlbi5nYW1lT3ZlcigpIGFuZCBAcGlsZS5yZXN0aW5nKClcclxuXHJcbiAgICAjIExvZ1xyXG4gICAgZm9yIGxpbmUsIGkgaW4gQHRoaXJ0ZWVuLmxvZ1xyXG4gICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgdGV4dEhlaWdodCwgbGluZSwgMCwgKGkrMS41KSAqICh0ZXh0SGVpZ2h0ICsgdGV4dFBhZGRpbmcpLCAwLCAwLCBAY29sb3JzLmxvZ2NvbG9yXHJcblxyXG4gICAgYWlQbGF5ZXJzID0gW1xyXG4gICAgICBAdGhpcnRlZW4ucGxheWVyc1sxXVxyXG4gICAgICBAdGhpcnRlZW4ucGxheWVyc1syXVxyXG4gICAgICBAdGhpcnRlZW4ucGxheWVyc1szXVxyXG4gICAgXVxyXG5cclxuICAgIGNoYXJhY3Rlck1hcmdpbiA9IGNoYXJhY3RlckhlaWdodCAvIDJcclxuICAgIEBjaGFyQ2VpbGluZyA9IEBoZWlnaHQgKiAwLjZcclxuXHJcbiAgICBhaUNhcmRTcGFjaW5nID0gQHdpZHRoICogMC4wMTVcclxuXHJcbiAgICAjIGxlZnQgc2lkZVxyXG4gICAgaWYgYWlQbGF5ZXJzWzBdICE9IG51bGxcclxuICAgICAgaWYgZHJhd0dhbWVPdmVyXHJcbiAgICAgICAgQHJlbmRlckFJSGFuZCBhaVBsYXllcnNbMF0uaGFuZCwgQHdpZHRoICogMC4yLCBAaGVpZ2h0ICogMC42MiwgYWlDYXJkU3BhY2luZ1xyXG5cclxuICAgICAgY2hhcmFjdGVyID0gYWlDaGFyYWN0ZXJzW2FpUGxheWVyc1swXS5jaGFySURdXHJcbiAgICAgIGNoYXJhY3RlcldpZHRoID0gQHNwcml0ZVJlbmRlcmVyLmNhbGNXaWR0aChjaGFyYWN0ZXIuc3ByaXRlLCBjaGFyYWN0ZXJIZWlnaHQpXHJcbiAgICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgY2hhcmFjdGVyLnNwcml0ZSwgY2hhcmFjdGVyTWFyZ2luLCBAY2hhckNlaWxpbmcsIDAsIGNoYXJhY3RlckhlaWdodCwgMCwgMCwgMSwgQGNvbG9ycy53aGl0ZSwgPT5cclxuICAgICAgICAjIEBkZWJ1ZygpXHJcbiAgICAgIEByZW5kZXJDb3VudCBhaVBsYXllcnNbMF0sIEB0aGlydGVlbi5tb25leSwgZHJhd0dhbWVPdmVyLCBhaVBsYXllcnNbMF0uaW5kZXggPT0gQHRoaXJ0ZWVuLnR1cm4sIGNvdW50SGVpZ2h0LCBjaGFyYWN0ZXJNYXJnaW4gKyAoY2hhcmFjdGVyV2lkdGggLyAyKSwgQGNoYXJDZWlsaW5nIC0gdGV4dFBhZGRpbmcsIDAuNSwgMFxyXG5cclxuICAgICMgdG9wIHNpZGVcclxuICAgIGlmIGFpUGxheWVyc1sxXSAhPSBudWxsXHJcbiAgICAgIGlmIGRyYXdHYW1lT3ZlclxyXG4gICAgICAgIEByZW5kZXJBSUhhbmQgYWlQbGF5ZXJzWzFdLmhhbmQsIEB3aWR0aCAqIDAuNiwgQGhlaWdodCAqIDAuMTgsIGFpQ2FyZFNwYWNpbmdcclxuXHJcbiAgICAgIGNoYXJhY3RlciA9IGFpQ2hhcmFjdGVyc1thaVBsYXllcnNbMV0uY2hhcklEXVxyXG4gICAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIGNoYXJhY3Rlci5zcHJpdGUsIEBjZW50ZXIueCwgMCwgMCwgY2hhcmFjdGVySGVpZ2h0LCAwLCAwLjUsIDAsIEBjb2xvcnMud2hpdGVcclxuICAgICAgQHJlbmRlckNvdW50IGFpUGxheWVyc1sxXSwgQHRoaXJ0ZWVuLm1vbmV5LCBkcmF3R2FtZU92ZXIsIGFpUGxheWVyc1sxXS5pbmRleCA9PSBAdGhpcnRlZW4udHVybiwgY291bnRIZWlnaHQsIEBjZW50ZXIueCwgY2hhcmFjdGVySGVpZ2h0LCAwLjUsIDBcclxuXHJcbiAgICAjIHJpZ2h0IHNpZGVcclxuICAgIGlmIGFpUGxheWVyc1syXSAhPSBudWxsXHJcbiAgICAgIGlmIGRyYXdHYW1lT3ZlclxyXG4gICAgICAgIEByZW5kZXJBSUhhbmQgYWlQbGF5ZXJzWzJdLmhhbmQsIEB3aWR0aCAqIDAuNywgQGhlaWdodCAqIDAuNjIsIGFpQ2FyZFNwYWNpbmdcclxuXHJcbiAgICAgIGNoYXJhY3RlciA9IGFpQ2hhcmFjdGVyc1thaVBsYXllcnNbMl0uY2hhcklEXVxyXG4gICAgICBjaGFyYWN0ZXJXaWR0aCA9IEBzcHJpdGVSZW5kZXJlci5jYWxjV2lkdGgoY2hhcmFjdGVyLnNwcml0ZSwgY2hhcmFjdGVySGVpZ2h0KVxyXG4gICAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIGNoYXJhY3Rlci5zcHJpdGUsIEB3aWR0aCAtIGNoYXJhY3Rlck1hcmdpbiwgQGNoYXJDZWlsaW5nLCAwLCBjaGFyYWN0ZXJIZWlnaHQsIDAsIDEsIDEsIEBjb2xvcnMud2hpdGVcclxuICAgICAgQHJlbmRlckNvdW50IGFpUGxheWVyc1syXSwgQHRoaXJ0ZWVuLm1vbmV5LCBkcmF3R2FtZU92ZXIsIGFpUGxheWVyc1syXS5pbmRleCA9PSBAdGhpcnRlZW4udHVybiwgY291bnRIZWlnaHQsIEB3aWR0aCAtIChjaGFyYWN0ZXJNYXJnaW4gKyAoY2hhcmFjdGVyV2lkdGggLyAyKSksIEBjaGFyQ2VpbGluZyAtIHRleHRQYWRkaW5nLCAwLjUsIDBcclxuXHJcbiAgICAjIGNhcmQgYXJlYVxyXG4gICAgaGFuZEFyZWFIZWlnaHQgPSAwLjI3ICogQGhlaWdodFxyXG4gICAgY2FyZEFyZWFUZXh0ID0gbnVsbFxyXG4gICAgaWYgQGhhbmQucGlja2luZ1xyXG4gICAgICBoYW5kYXJlYUNvbG9yID0gQGNvbG9ycy5oYW5kX3BpY2tcclxuICAgICAgaWYgKEB0aGlydGVlbi50dXJuID09IDApIGFuZCAoQHRoaXJ0ZWVuLmV2ZXJ5b25lUGFzc2VkKCkgb3IgKEB0aGlydGVlbi5jdXJyZW50UGxheSA9PSBudWxsKSlcclxuICAgICAgICBoYW5kYXJlYUNvbG9yID0gQGNvbG9ycy5oYW5kX2FueVxyXG4gICAgICAgIGlmIEB0aGlydGVlbi5waWxlLmxlbmd0aCA9PSAwXHJcbiAgICAgICAgICBjYXJkQXJlYVRleHQgPSAnQW55dGhpbmcgKDNcXHhjOCknXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgY2FyZEFyZWFUZXh0ID0gJ0FueXRoaW5nJ1xyXG4gICAgZWxzZVxyXG4gICAgICBjYXJkQXJlYVRleHQgPSAnVW5sb2NrZWQnXHJcbiAgICAgIGhhbmRhcmVhQ29sb3IgPSBAY29sb3JzLmhhbmRfcmVvcmdcclxuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJzb2xpZFwiLCAwLCBAaGVpZ2h0LCBAd2lkdGgsIGhhbmRBcmVhSGVpZ2h0LCAwLCAwLCAxLCBoYW5kYXJlYUNvbG9yLCA9PlxyXG4gICAgICBAaGFuZC50b2dnbGVQaWNraW5nKClcclxuXHJcbiAgICAjIHBpbGVcclxuICAgIHBpbGVEaW1lbnNpb24gPSBAaGVpZ2h0ICogMC40XHJcbiAgICBwaWxlU3ByaXRlID0gXCJwaWxlXCJcclxuICAgIGlmIChAdGhpcnRlZW4udHVybiA+PSAwKSBhbmQgKEB0aGlydGVlbi50dXJuIDw9IDMpXHJcbiAgICAgIHBpbGVTcHJpdGUgKz0gQHRoaXJ0ZWVuLnR1cm5cclxuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgcGlsZVNwcml0ZSwgQHdpZHRoIC8gMiwgQGhlaWdodCAvIDIsIHBpbGVEaW1lbnNpb24sIHBpbGVEaW1lbnNpb24sIDAsIDAuNSwgMC41LCBAY29sb3JzLndoaXRlLCA9PlxyXG4gICAgICBAcGxheVBpY2tlZCgpXHJcbiAgICBAcGlsZS5yZW5kZXIoKVxyXG5cclxuICAgIEBoYW5kLnJlbmRlcigpXHJcblxyXG4gICAgaWYgZHJhd0dhbWVPdmVyXHJcbiAgICAgICMgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcInNvbGlkXCIsIDAsIDAsIEB3aWR0aCwgQGhlaWdodCAtIGhhbmRBcmVhSGVpZ2h0LCAwLCAwLCAwLCBAY29sb3JzLnBsYXlfYWdhaW5cclxuXHJcbiAgICAgIGxpbmVzID0gQGdhbWVPdmVyVGV4dCgpXHJcbiAgICAgIGdhbWVPdmVyU2l6ZSA9IEBhYUhlaWdodCAvIDhcclxuICAgICAgZ2FtZU92ZXJZID0gQGNlbnRlci55XHJcbiAgICAgIGlmIGxpbmVzLmxlbmd0aCA+IDFcclxuICAgICAgICBnYW1lT3ZlclkgLT0gKGdhbWVPdmVyU2l6ZSA+PiAxKVxyXG4gICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgZ2FtZU92ZXJTaXplLCBsaW5lc1swXSwgQGNlbnRlci54LCBnYW1lT3ZlclksIDAuNSwgMC41LCBAY29sb3JzLmdhbWVfb3ZlclxyXG4gICAgICBpZiBsaW5lcy5sZW5ndGggPiAxXHJcbiAgICAgICAgZ2FtZU92ZXJZICs9IGdhbWVPdmVyU2l6ZVxyXG4gICAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCBnYW1lT3ZlclNpemUsIGxpbmVzWzFdLCBAY2VudGVyLngsIGdhbWVPdmVyWSwgMC41LCAwLjUsIEBjb2xvcnMuZ2FtZV9vdmVyXHJcblxyXG4gICAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwic29saWRcIiwgMCwgQGhlaWdodCwgQHdpZHRoLCBoYW5kQXJlYUhlaWdodCwgMCwgMCwgMSwgQGNvbG9ycy5wbGF5X2FnYWluLCA9PlxyXG4gICAgICAgIEB0aGlydGVlbi5kZWFsKClcclxuICAgICAgICBAcHJlcGFyZUdhbWUoKVxyXG5cclxuICAgICAgcmVzdGFydFF1aXRTaXplID0gQGFhSGVpZ2h0IC8gMTJcclxuICAgICAgc2hhZG93RGlzdGFuY2UgPSByZXN0YXJ0UXVpdFNpemUgLyA4XHJcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCByZXN0YXJ0UXVpdFNpemUsIFwiUGxheSBBZ2FpblwiLCBzaGFkb3dEaXN0YW5jZSArIEBjZW50ZXIueCwgc2hhZG93RGlzdGFuY2UgKyAoQGhlaWdodCAtIChoYW5kQXJlYUhlaWdodCAqIDAuNSkpLCAwLjUsIDEsIEBjb2xvcnMuYmxhY2tcclxuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIHJlc3RhcnRRdWl0U2l6ZSwgXCJQbGF5IEFnYWluXCIsIEBjZW50ZXIueCwgQGhlaWdodCAtIChoYW5kQXJlYUhlaWdodCAqIDAuNSksIDAuNSwgMSwgQGNvbG9ycy5nb2xkXHJcblxyXG4gICAgQHJlbmRlckNvdW50IEB0aGlydGVlbi5wbGF5ZXJzWzBdLCBAdGhpcnRlZW4ubW9uZXksIGRyYXdHYW1lT3ZlciwgMCA9PSBAdGhpcnRlZW4udHVybiwgY291bnRIZWlnaHQsIEBjZW50ZXIueCwgQGhlaWdodCwgMC41LCAxXHJcblxyXG4gICAgIyBIZWFkbGluZSAoaW5jbHVkZXMgZXJyb3IpXHJcbiAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgdGV4dEhlaWdodCwgQGNhbGNIZWFkbGluZSgpLCAwLCAwLCAwLCAwLCBAY29sb3JzLmxpZ2h0Z3JheVxyXG5cclxuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJwYXVzZVwiLCBAd2lkdGgsIDAsIDAsIEBwYXVzZUJ1dHRvblNpemUsIDAsIDEsIDAsIEBjb2xvcnMud2hpdGUsID0+XHJcbiAgICAgIEByZW5kZXJNb2RlID0gUmVuZGVyTW9kZS5QQVVTRVxyXG5cclxuICAgIGlmIGNhcmRBcmVhVGV4dCAhPSBudWxsXHJcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCB0ZXh0SGVpZ2h0LCBjYXJkQXJlYVRleHQsIDAuMDIgKiBAd2lkdGgsIEBoZWlnaHQgLSBoYW5kQXJlYUhlaWdodCwgMCwgMCwgQGNvbG9ycy53aGl0ZVxyXG5cclxuICAgIGlmIEBhY2hpZXZlbWVudEZhbmZhcmUgIT0gbnVsbFxyXG4gICAgICBpZiBAYWNoaWV2ZW1lbnRGYW5mYXJlLnRpbWUgPCAxMDAwXHJcbiAgICAgICAgb3BhY2l0eSA9IEBhY2hpZXZlbWVudEZhbmZhcmUudGltZSAvIDEwMDBcclxuICAgICAgZWxzZSBpZiBAYWNoaWV2ZW1lbnRGYW5mYXJlLnRpbWUgPiA0MDAwXHJcbiAgICAgICAgb3BhY2l0eSA9IDEgLSAoKEBhY2hpZXZlbWVudEZhbmZhcmUudGltZSAtIDQwMDApIC8gMTAwMClcclxuICAgICAgZWxzZVxyXG4gICAgICAgIG9wYWNpdHkgPSAxXHJcbiAgICAgIGNvbG9yID0ge3I6MSwgZzoxLCBiOjEsIGE6b3BhY2l0eX1cclxuICAgICAgeCA9IEB3aWR0aCAqIDAuNlxyXG4gICAgICB5ID0gMFxyXG4gICAgICB4VGV4dCA9IHggKyAoQHdpZHRoICogMC4wNilcclxuICAgICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcImF1XCIsIHgsIHksIDAsIEBoZWlnaHQgLyAxMCwgMCwgMCwgMCwgY29sb3IsID0+XHJcbiAgICAgICAgQGFjaGlldmVtZW50RmFuZmFyZSA9IG51bGxcclxuICAgICAgICBAcmVuZGVyTW9kZSA9IFJlbmRlck1vZGUuQUNISUVWRU1FTlRTXHJcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCB0ZXh0SGVpZ2h0LCBcIkFjaGlldmVtZW50IEVhcm5lZFwiLCB4VGV4dCwgeSwgMCwgMCwgY29sb3JcclxuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIHRleHRIZWlnaHQsIEBhY2hpZXZlbWVudEZhbmZhcmUudGl0bGUsIHhUZXh0LCB5ICsgdGV4dEhlaWdodCwgMCwgMCwgY29sb3JcclxuXHJcbiAgICByZXR1cm5cclxuXHJcbiAgcmVuZGVyQ291bnQ6IChwbGF5ZXIsIG1vbmV5LCBkcmF3R2FtZU92ZXIsIG15VHVybiwgY291bnRIZWlnaHQsIHgsIHksIGFuY2hvcngsIGFuY2hvcnkpIC0+XHJcbiAgICBpZiBteVR1cm5cclxuICAgICAgbmFtZUNvbG9yID0gXCJgZmY3NzAwYFwiXHJcbiAgICBlbHNlXHJcbiAgICAgIG5hbWVDb2xvciA9IFwiXCJcclxuICAgIG5hbWVTdHJpbmcgPSBcIiAje25hbWVDb2xvcn0je3BsYXllci5uYW1lfWBgXCJcclxuICAgIGlmIG1vbmV5XHJcbiAgICAgIHBsYXllci5tb25leSA/PSAwXHJcbiAgICAgIG5hbWVTdHJpbmcgKz0gXCI6ICQgYGFhZmZhYWAje3BsYXllci5tb25leX1cIlxyXG4gICAgbmFtZVN0cmluZyArPSBcIiBcIlxyXG4gICAgY2FyZENvdW50ID0gcGxheWVyLmhhbmQubGVuZ3RoXHJcbiAgICBpZiBkcmF3R2FtZU92ZXIgb3IgKGNhcmRDb3VudCA9PSAwKVxyXG4gICAgICBpZiBtb25leVxyXG4gICAgICAgIHBsYWNlU3RyaW5nID0gXCI0dGhcIlxyXG4gICAgICAgIGlmIHBsYXllci5wbGFjZSA9PSAxXHJcbiAgICAgICAgICBwbGFjZVN0cmluZyA9IFwiMXN0XCJcclxuICAgICAgICBlbHNlIGlmIHBsYXllci5wbGFjZSA9PSAyXHJcbiAgICAgICAgICBwbGFjZVN0cmluZyA9IFwiMm5kXCJcclxuICAgICAgICBlbHNlIGlmIHBsYXllci5wbGFjZSA9PSAzXHJcbiAgICAgICAgICBwbGFjZVN0cmluZyA9IFwiM3JkXCJcclxuICAgICAgICBjb3VudFN0cmluZyA9IFwiIGBmZmFhZmZgI3twbGFjZVN0cmluZ31gYCBQbGFjZSBcIlxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgaWYgcGxheWVyLnBsYWNlID09IDFcclxuICAgICAgICAgIGNvdW50U3RyaW5nID0gXCIgYGZmZmZhYWBXaW5uZXJgYCBcIlxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIGNvdW50U3RyaW5nID0gXCIgYGZmYWFmZmBMb3NlcmBgIFwiXHJcbiAgICBlbHNlXHJcbiAgICAgIGNvdW50U3RyaW5nID0gXCIgYGZmZmYzM2Aje2NhcmRDb3VudH1gYCBsZWZ0IFwiXHJcblxyXG4gICAgbmFtZVNpemUgPSBAZm9udFJlbmRlcmVyLnNpemUoQGZvbnQsIGNvdW50SGVpZ2h0LCBuYW1lU3RyaW5nKVxyXG4gICAgY291bnRTaXplID0gQGZvbnRSZW5kZXJlci5zaXplKEBmb250LCBjb3VudEhlaWdodCwgY291bnRTdHJpbmcpXHJcbiAgICBpZiBuYW1lU2l6ZS53ID4gY291bnRTaXplLndcclxuICAgICAgY291bnRTaXplLncgPSBuYW1lU2l6ZS53XHJcbiAgICBlbHNlXHJcbiAgICAgIG5hbWVTaXplLncgPSBjb3VudFNpemUud1xyXG4gICAgbmFtZVkgPSB5XHJcbiAgICBjb3VudFkgPSB5XHJcbiAgICBib3hIZWlnaHQgPSBjb3VudFNpemUuaFxyXG4gICAgaWYgdHJ1ZSAjIHBsYXllci5pZCAhPSAxXHJcbiAgICAgIGJveEhlaWdodCAqPSAyXHJcbiAgICAgIGlmIGFuY2hvcnkgPiAwXHJcbiAgICAgICAgbmFtZVkgLT0gY291bnRIZWlnaHRcclxuICAgICAgZWxzZVxyXG4gICAgICAgIGNvdW50WSArPSBjb3VudEhlaWdodFxyXG4gICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcInNvbGlkXCIsIHgsIHksIGNvdW50U2l6ZS53LCBib3hIZWlnaHQsIDAsIGFuY2hvcngsIGFuY2hvcnksIEBjb2xvcnMub3ZlcmxheVxyXG4gICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIGNvdW50SGVpZ2h0LCBuYW1lU3RyaW5nLCB4LCBuYW1lWSwgYW5jaG9yeCwgYW5jaG9yeSwgQGNvbG9ycy53aGl0ZVxyXG4gICAgaWYgdHJ1ZSAjIHBsYXllci5pZCAhPSAxXHJcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCBjb3VudEhlaWdodCwgY291bnRTdHJpbmcsIHgsIGNvdW50WSwgYW5jaG9yeCwgYW5jaG9yeSwgQGNvbG9ycy53aGl0ZVxyXG5cclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgIyByZW5kZXJpbmcgYW5kIHpvbmVzXHJcblxyXG4gIGRyYXdJbWFnZTogKHRleHR1cmUsIHN4LCBzeSwgc3csIHNoLCBkeCwgZHksIGR3LCBkaCwgcm90LCBhbmNob3J4LCBhbmNob3J5LCByLCBnLCBiLCBhLCBjYikgLT5cclxuICAgIEByZW5kZXJDb21tYW5kcy5wdXNoIEB0ZXh0dXJlc1t0ZXh0dXJlXSwgc3gsIHN5LCBzdywgc2gsIGR4LCBkeSwgZHcsIGRoLCByb3QsIGFuY2hvcngsIGFuY2hvcnksIHIsIGcsIGIsIGFcclxuXHJcbiAgICBpZiBjYj9cclxuICAgICAgIyBjYWxsZXIgd2FudHMgdG8gcmVtZW1iZXIgd2hlcmUgdGhpcyB3YXMgZHJhd24sIGFuZCB3YW50cyB0byBiZSBjYWxsZWQgYmFjayBpZiBpdCBpcyBldmVyIHRvdWNoZWRcclxuICAgICAgIyBUaGlzIGlzIGNhbGxlZCBhIFwiem9uZVwiLiBTaW5jZSB6b25lcyBhcmUgdHJhdmVyc2VkIGluIHJldmVyc2Ugb3JkZXIsIHRoZSBuYXR1cmFsIG92ZXJsYXAgb2ZcclxuICAgICAgIyBhIHNlcmllcyBvZiByZW5kZXJzIGlzIHJlc3BlY3RlZCBhY2NvcmRpbmdseS5cclxuICAgICAgYW5jaG9yT2Zmc2V0WCA9IC0xICogYW5jaG9yeCAqIGR3XHJcbiAgICAgIGFuY2hvck9mZnNldFkgPSAtMSAqIGFuY2hvcnkgKiBkaFxyXG4gICAgICB6b25lID1cclxuICAgICAgICAjIGNlbnRlciAoWCxZKSBhbmQgcmV2ZXJzZWQgcm90YXRpb24sIHVzZWQgdG8gcHV0IHRoZSBjb29yZGluYXRlIGluIGxvY2FsIHNwYWNlIHRvIHRoZSB6b25lXHJcbiAgICAgICAgY3g6ICBkeFxyXG4gICAgICAgIGN5OiAgZHlcclxuICAgICAgICByb3Q6IHJvdCAqIC0xXHJcbiAgICAgICAgIyB0aGUgYXhpcyBhbGlnbmVkIGJvdW5kaW5nIGJveCB1c2VkIGZvciBkZXRlY3Rpb24gb2YgYSBsb2NhbHNwYWNlIGNvb3JkXHJcbiAgICAgICAgbDogICBhbmNob3JPZmZzZXRYXHJcbiAgICAgICAgdDogICBhbmNob3JPZmZzZXRZXHJcbiAgICAgICAgcjogICBhbmNob3JPZmZzZXRYICsgZHdcclxuICAgICAgICBiOiAgIGFuY2hvck9mZnNldFkgKyBkaFxyXG4gICAgICAgICMgY2FsbGJhY2sgdG8gY2FsbCBpZiB0aGUgem9uZSBpcyBjbGlja2VkIG9uXHJcbiAgICAgICAgY2I6ICBjYlxyXG4gICAgICBAem9uZXMucHVzaCB6b25lXHJcblxyXG4gIGNoZWNrWm9uZXM6ICh4LCB5KSAtPlxyXG4gICAgZm9yIHpvbmUgaW4gQHpvbmVzIGJ5IC0xXHJcbiAgICAgICMgbW92ZSBjb29yZCBpbnRvIHNwYWNlIHJlbGF0aXZlIHRvIHRoZSBxdWFkLCB0aGVuIHJvdGF0ZSBpdCB0byBtYXRjaFxyXG4gICAgICB1bnJvdGF0ZWRMb2NhbFggPSB4IC0gem9uZS5jeFxyXG4gICAgICB1bnJvdGF0ZWRMb2NhbFkgPSB5IC0gem9uZS5jeVxyXG4gICAgICBsb2NhbFggPSB1bnJvdGF0ZWRMb2NhbFggKiBNYXRoLmNvcyh6b25lLnJvdCkgLSB1bnJvdGF0ZWRMb2NhbFkgKiBNYXRoLnNpbih6b25lLnJvdClcclxuICAgICAgbG9jYWxZID0gdW5yb3RhdGVkTG9jYWxYICogTWF0aC5zaW4oem9uZS5yb3QpICsgdW5yb3RhdGVkTG9jYWxZICogTWF0aC5jb3Moem9uZS5yb3QpXHJcbiAgICAgIGlmIChsb2NhbFggPCB6b25lLmwpIG9yIChsb2NhbFggPiB6b25lLnIpIG9yIChsb2NhbFkgPCB6b25lLnQpIG9yIChsb2NhbFkgPiB6b25lLmIpXHJcbiAgICAgICAgIyBvdXRzaWRlIG9mIG9yaWVudGVkIGJvdW5kaW5nIGJveFxyXG4gICAgICAgIGNvbnRpbnVlXHJcbiAgICAgIHpvbmUuY2IoeCwgeSlcclxuICAgICAgcmV0dXJuIHRydWVcclxuICAgIHJldHVybiBmYWxzZVxyXG5cclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVcclxuIiwiQW5pbWF0aW9uID0gcmVxdWlyZSAnLi9BbmltYXRpb24nXHJcblxyXG5DQVJEX0lNQUdFX1cgPSAxMjBcclxuQ0FSRF9JTUFHRV9IID0gMTYyXHJcbkNBUkRfSU1BR0VfT0ZGX1ggPSA0XHJcbkNBUkRfSU1BR0VfT0ZGX1kgPSA0XHJcbkNBUkRfSU1BR0VfQURWX1ggPSBDQVJEX0lNQUdFX1dcclxuQ0FSRF9JTUFHRV9BRFZfWSA9IENBUkRfSU1BR0VfSFxyXG5DQVJEX1JFTkRFUl9TQ0FMRSA9IDAuMzUgICAgICAgICAgICAgICAgICAjIGNhcmQgaGVpZ2h0IGNvZWZmaWNpZW50IGZyb20gdGhlIHNjcmVlbidzIGhlaWdodFxyXG5DQVJEX0hBTkRfQ1VSVkVfRElTVF9GQUNUT1IgPSAzLjUgICAgICAgICAjIGZhY3RvciB3aXRoIHNjcmVlbiBoZWlnaHQgdG8gZmlndXJlIG91dCBjZW50ZXIgb2YgYXJjLiBiaWdnZXIgbnVtYmVyIGlzIGxlc3MgYXJjXHJcbkNBUkRfSE9MRElOR19ST1RfT1JERVIgPSBNYXRoLlBJIC8gMTIgICAgICMgZGVzaXJlZCByb3RhdGlvbiBvZiB0aGUgY2FyZCB3aGVuIGJlaW5nIGRyYWdnZWQgYXJvdW5kIGZvciBvcmRlcmluZydzIHNha2VcclxuQ0FSRF9IT0xESU5HX1JPVF9QTEFZID0gLTEgKiBNYXRoLlBJIC8gMTIgIyBkZXNpcmVkIHJvdGF0aW9uIG9mIHRoZSBjYXJkIHdoZW4gYmVpbmcgZHJhZ2dlZCBhcm91bmQgd2l0aCBpbnRlbnQgdG8gcGxheVxyXG5DQVJEX1BMQVlfQ0VJTElORyA9IDAuNjAgICAgICAgICAgICAgICAgICAjIGhvdyBtdWNoIG9mIHRoZSB0b3Agb2YgdGhlIHNjcmVlbiByZXByZXNlbnRzIFwiSSB3YW50IHRvIHBsYXkgdGhpc1wiIHZzIFwiSSB3YW50IHRvIHJlb3JkZXJcIlxyXG5cclxuTk9fQ0FSRCA9IC0xXHJcblxyXG5IaWdobGlnaHQgPVxyXG4gIE5PTkU6IC0xXHJcbiAgVU5TRUxFQ1RFRDogMFxyXG4gIFNFTEVDVEVEOiAxXHJcbiAgUElMRTogMlxyXG5cclxuIyB0YWtlbiBmcm9tIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTIxMTIxMi9ob3ctdG8tY2FsY3VsYXRlLWFuLWFuZ2xlLWZyb20tdGhyZWUtcG9pbnRzXHJcbiMgdXNlcyBsYXcgb2YgY29zaW5lcyB0byBmaWd1cmUgb3V0IHRoZSBoYW5kIGFyYyBhbmdsZVxyXG5maW5kQW5nbGUgPSAocDAsIHAxLCBwMikgLT5cclxuICAgIGEgPSBNYXRoLnBvdyhwMS54IC0gcDIueCwgMikgKyBNYXRoLnBvdyhwMS55IC0gcDIueSwgMilcclxuICAgIGIgPSBNYXRoLnBvdyhwMS54IC0gcDAueCwgMikgKyBNYXRoLnBvdyhwMS55IC0gcDAueSwgMilcclxuICAgIGMgPSBNYXRoLnBvdyhwMi54IC0gcDAueCwgMikgKyBNYXRoLnBvdyhwMi55IC0gcDAueSwgMilcclxuICAgIHJldHVybiBNYXRoLmFjb3MoIChhK2ItYykgLyBNYXRoLnNxcnQoNCphKmIpIClcclxuXHJcbmNhbGNEaXN0YW5jZSA9IChwMCwgcDEpIC0+XHJcbiAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyhwMS54IC0gcDAueCwgMikgKyBNYXRoLnBvdyhwMS55IC0gcDAueSwgMikpXHJcblxyXG5jYWxjRGlzdGFuY2VTcXVhcmVkID0gKHgwLCB5MCwgeDEsIHkxKSAtPlxyXG4gIHJldHVybiBNYXRoLnBvdyh4MSAtIHgwLCAyKSArIE1hdGgucG93KHkxIC0geTAsIDIpXHJcblxyXG5jbGFzcyBIYW5kXHJcbiAgQENBUkRfSU1BR0VfVzogQ0FSRF9JTUFHRV9XXHJcbiAgQENBUkRfSU1BR0VfSDogQ0FSRF9JTUFHRV9IXHJcbiAgQENBUkRfSU1BR0VfT0ZGX1g6IENBUkRfSU1BR0VfT0ZGX1hcclxuICBAQ0FSRF9JTUFHRV9PRkZfWTogQ0FSRF9JTUFHRV9PRkZfWVxyXG4gIEBDQVJEX0lNQUdFX0FEVl9YOiBDQVJEX0lNQUdFX0FEVl9YXHJcbiAgQENBUkRfSU1BR0VfQURWX1k6IENBUkRfSU1BR0VfQURWX1lcclxuICBAQ0FSRF9SRU5ERVJfU0NBTEU6IENBUkRfUkVOREVSX1NDQUxFXHJcbiAgQEhpZ2hsaWdodDogSGlnaGxpZ2h0XHJcblxyXG4gIGNvbnN0cnVjdG9yOiAoQGdhbWUpIC0+XHJcbiAgICBAY2FyZHMgPSBbXVxyXG4gICAgQGFuaW1zID0ge31cclxuICAgIEBwb3NpdGlvbkNhY2hlID0ge31cclxuXHJcbiAgICBAcGlja2luZyA9IHRydWVcclxuICAgIEBwaWNrZWQgPSBbXVxyXG4gICAgQHBpY2tQYWludCA9IGZhbHNlXHJcblxyXG4gICAgQGRyYWdJbmRleFN0YXJ0ID0gTk9fQ0FSRFxyXG4gICAgQGRyYWdJbmRleEN1cnJlbnQgPSBOT19DQVJEXHJcbiAgICBAZHJhZ1ggPSAwXHJcbiAgICBAZHJhZ1kgPSAwXHJcblxyXG4gICAgIyByZW5kZXIgLyBhbmltIG1ldHJpY3NcclxuICAgIEBjYXJkU3BlZWQgPVxyXG4gICAgICByOiBNYXRoLlBJICogMlxyXG4gICAgICBzOiAyLjVcclxuICAgICAgdDogMiAqIEBnYW1lLndpZHRoXHJcbiAgICBAcGxheUNlaWxpbmcgPSBDQVJEX1BMQVlfQ0VJTElORyAqIEBnYW1lLmhlaWdodFxyXG4gICAgQGNhcmRIZWlnaHQgPSBNYXRoLmZsb29yKEBnYW1lLmhlaWdodCAqIENBUkRfUkVOREVSX1NDQUxFKVxyXG4gICAgQGNhcmRXaWR0aCAgPSBNYXRoLmZsb29yKEBjYXJkSGVpZ2h0ICogQ0FSRF9JTUFHRV9XIC8gQ0FSRF9JTUFHRV9IKVxyXG4gICAgQGNhcmRIYWxmSGVpZ2h0ID0gQGNhcmRIZWlnaHQgPj4gMVxyXG4gICAgQGNhcmRIYWxmV2lkdGggID0gQGNhcmRXaWR0aCA+PiAxXHJcbiAgICBhcmNNYXJnaW4gPSBAY2FyZFdpZHRoIC8gMlxyXG4gICAgYXJjVmVydGljYWxCaWFzID0gQGNhcmRIZWlnaHQgLyA1MFxyXG4gICAgYm90dG9tTGVmdCAgPSB7IHg6IGFyY01hcmdpbiwgICAgICAgICAgICAgICAgeTogYXJjVmVydGljYWxCaWFzICsgQGdhbWUuaGVpZ2h0IH1cclxuICAgIGJvdHRvbVJpZ2h0ID0geyB4OiBAZ2FtZS53aWR0aCAtIGFyY01hcmdpbiwgeTogYXJjVmVydGljYWxCaWFzICsgQGdhbWUuaGVpZ2h0IH1cclxuICAgIEBoYW5kQ2VudGVyID0geyB4OiBAZ2FtZS53aWR0aCAvIDIsICAgICAgICAgeTogYXJjVmVydGljYWxCaWFzICsgQGdhbWUuaGVpZ2h0ICsgKENBUkRfSEFORF9DVVJWRV9ESVNUX0ZBQ1RPUiAqIEBnYW1lLmhlaWdodCkgfVxyXG4gICAgQGhhbmRBbmdsZSA9IGZpbmRBbmdsZShib3R0b21MZWZ0LCBAaGFuZENlbnRlciwgYm90dG9tUmlnaHQpXHJcbiAgICBAaGFuZERpc3RhbmNlID0gY2FsY0Rpc3RhbmNlKGJvdHRvbUxlZnQsIEBoYW5kQ2VudGVyKVxyXG4gICAgQGhhbmRBbmdsZUFkdmFuY2VNYXggPSBAaGFuZEFuZ2xlIC8gNyAjIG5ldmVyIHNwYWNlIHRoZSBjYXJkcyBtb3JlIHRoYW4gd2hhdCB0aGV5J2QgbG9vayBsaWtlIHdpdGggdGhpcyBoYW5kc2l6ZVxyXG4gICAgQGdhbWUubG9nIFwiSGFuZCBkaXN0YW5jZSAje0BoYW5kRGlzdGFuY2V9LCBhbmdsZSAje0BoYW5kQW5nbGV9IChzY3JlZW4gaGVpZ2h0ICN7QGdhbWUuaGVpZ2h0fSlcIlxyXG5cclxuICB0b2dnbGVQaWNraW5nOiAtPlxyXG4gICAgQHBpY2tpbmcgPSAhQHBpY2tpbmdcclxuICAgIGlmIEBwaWNraW5nXHJcbiAgICAgIEBzZWxlY3ROb25lKClcclxuXHJcbiAgc2VsZWN0Tm9uZTogLT5cclxuICAgIEBwaWNrZWQgPSBuZXcgQXJyYXkoQGNhcmRzLmxlbmd0aCkuZmlsbChmYWxzZSlcclxuICAgIHJldHVyblxyXG5cclxuICBzZXQ6IChjYXJkcykgLT5cclxuICAgIEBjYXJkcyA9IGNhcmRzLnNsaWNlKDApXHJcbiAgICBpZiBAcGlja2luZ1xyXG4gICAgICBAc2VsZWN0Tm9uZSgpXHJcbiAgICBAc3luY0FuaW1zKClcclxuICAgIEB3YXJwKClcclxuXHJcbiAgc3luY0FuaW1zOiAtPlxyXG4gICAgc2VlbiA9IHt9XHJcbiAgICBmb3IgY2FyZCBpbiBAY2FyZHNcclxuICAgICAgc2VlbltjYXJkXSsrXHJcbiAgICAgIGlmIG5vdCBAYW5pbXNbY2FyZF1cclxuICAgICAgICBAYW5pbXNbY2FyZF0gPSBuZXcgQW5pbWF0aW9uIHtcclxuICAgICAgICAgIHNwZWVkOiBAY2FyZFNwZWVkXHJcbiAgICAgICAgICB4OiAwXHJcbiAgICAgICAgICB5OiAwXHJcbiAgICAgICAgICByOiAwXHJcbiAgICAgICAgfVxyXG4gICAgdG9SZW1vdmUgPSBbXVxyXG4gICAgZm9yIGNhcmQsYW5pbSBvZiBAYW5pbXNcclxuICAgICAgaWYgbm90IHNlZW4uaGFzT3duUHJvcGVydHkoY2FyZClcclxuICAgICAgICB0b1JlbW92ZS5wdXNoIGNhcmRcclxuICAgIGZvciBjYXJkIGluIHRvUmVtb3ZlXHJcbiAgICAgICMgQGdhbWUubG9nIFwicmVtb3ZpbmcgYW5pbSBmb3IgI3tjYXJkfVwiXHJcbiAgICAgIGRlbGV0ZSBAYW5pbXNbY2FyZF1cclxuXHJcbiAgICBAdXBkYXRlUG9zaXRpb25zKClcclxuXHJcbiAgY2FsY0RyYXduSGFuZDogLT5cclxuICAgIGRyYXduSGFuZCA9IFtdXHJcbiAgICBmb3IgY2FyZCxpIGluIEBjYXJkc1xyXG4gICAgICBpZiBpICE9IEBkcmFnSW5kZXhTdGFydFxyXG4gICAgICAgIGRyYXduSGFuZC5wdXNoIGNhcmRcclxuXHJcbiAgICBpZiBAZHJhZ0luZGV4Q3VycmVudCAhPSBOT19DQVJEXHJcbiAgICAgIGRyYXduSGFuZC5zcGxpY2UgQGRyYWdJbmRleEN1cnJlbnQsIDAsIEBjYXJkc1tAZHJhZ0luZGV4U3RhcnRdXHJcbiAgICByZXR1cm4gZHJhd25IYW5kXHJcblxyXG4gIHdhbnRzVG9QbGF5RHJhZ2dlZENhcmQ6IC0+XHJcbiAgICByZXR1cm4gZmFsc2UgaWYgQGRyYWdJbmRleFN0YXJ0ID09IE5PX0NBUkRcclxuICAgIHJldHVybiBAZHJhZ1kgPCBAcGxheUNlaWxpbmdcclxuXHJcbiAgdXBkYXRlUG9zaXRpb25zOiAtPlxyXG4gICAgZHJhd25IYW5kID0gQGNhbGNEcmF3bkhhbmQoKVxyXG4gICAgd2FudHNUb1BsYXkgPSBAd2FudHNUb1BsYXlEcmFnZ2VkQ2FyZCgpXHJcbiAgICBkZXNpcmVkUm90YXRpb24gPSBDQVJEX0hPTERJTkdfUk9UX09SREVSXHJcbiAgICBwb3NpdGlvbkNvdW50ID0gZHJhd25IYW5kLmxlbmd0aFxyXG4gICAgaWYgd2FudHNUb1BsYXlcclxuICAgICAgZGVzaXJlZFJvdGF0aW9uID0gQ0FSRF9IT0xESU5HX1JPVF9QTEFZXHJcbiAgICAgIHBvc2l0aW9uQ291bnQtLVxyXG4gICAgcG9zaXRpb25zID0gQGNhbGNQb3NpdGlvbnMocG9zaXRpb25Db3VudClcclxuICAgIGRyYXdJbmRleCA9IDBcclxuICAgIGZvciBjYXJkLGkgaW4gZHJhd25IYW5kXHJcbiAgICAgIGFuaW0gPSBAYW5pbXNbY2FyZF1cclxuICAgICAgaWYgaSA9PSBAZHJhZ0luZGV4Q3VycmVudFxyXG4gICAgICAgIGFuaW0ucmVxLnggPSBAZHJhZ1hcclxuICAgICAgICBhbmltLnJlcS55ID0gQGRyYWdZXHJcbiAgICAgICAgYW5pbS5yZXEuciA9IGRlc2lyZWRSb3RhdGlvblxyXG4gICAgICAgIGlmIG5vdCB3YW50c1RvUGxheVxyXG4gICAgICAgICAgZHJhd0luZGV4KytcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHBvcyA9IHBvc2l0aW9uc1tkcmF3SW5kZXhdXHJcbiAgICAgICAgYW5pbS5yZXEueCA9IHBvcy54XHJcbiAgICAgICAgYW5pbS5yZXEueSA9IHBvcy55XHJcbiAgICAgICAgYW5pbS5yZXEuciA9IHBvcy5yXHJcbiAgICAgICAgZHJhd0luZGV4KytcclxuXHJcbiAgIyBpbW1lZGlhdGVseSB3YXJwIGFsbCBjYXJkcyB0byB3aGVyZSB0aGV5IHNob3VsZCBiZVxyXG4gIHdhcnA6IC0+XHJcbiAgICBmb3IgY2FyZCxhbmltIG9mIEBhbmltc1xyXG4gICAgICBhbmltLndhcnAoKVxyXG5cclxuICAjIHJlb3JkZXIgdGhlIGhhbmQgYmFzZWQgb24gdGhlIGRyYWcgbG9jYXRpb24gb2YgdGhlIGhlbGQgY2FyZFxyXG4gIHJlb3JkZXI6IC0+XHJcbiAgICByZXR1cm4gaWYgQGRyYWdJbmRleFN0YXJ0ID09IE5PX0NBUkRcclxuICAgIHJldHVybiBpZiBAY2FyZHMubGVuZ3RoIDwgMiAjIG5vdGhpbmcgdG8gcmVvcmRlclxyXG4gICAgcG9zaXRpb25zID0gQGNhbGNQb3NpdGlvbnMoQGNhcmRzLmxlbmd0aClcclxuICAgIGNsb3Nlc3RJbmRleCA9IDBcclxuICAgIGNsb3Nlc3REaXN0ID0gQGdhbWUud2lkdGggKiBAZ2FtZS5oZWlnaHQgIyBzb21ldGhpbmcgaW1wb3NzaWJseSBsYXJnZVxyXG4gICAgZm9yIHBvcywgaW5kZXggaW4gcG9zaXRpb25zXHJcbiAgICAgIGRpc3QgPSBjYWxjRGlzdGFuY2VTcXVhcmVkKHBvcy54LCBwb3MueSwgQGRyYWdYLCBAZHJhZ1kpXHJcbiAgICAgIGlmIGNsb3Nlc3REaXN0ID4gZGlzdFxyXG4gICAgICAgIGNsb3Nlc3REaXN0ID0gZGlzdFxyXG4gICAgICAgIGNsb3Nlc3RJbmRleCA9IGluZGV4XHJcbiAgICBAZHJhZ0luZGV4Q3VycmVudCA9IGNsb3Nlc3RJbmRleFxyXG5cclxuICBzZWxlY3RlZENhcmRzOiAtPlxyXG4gICAgaWYgbm90IEBwaWNraW5nXHJcbiAgICAgIHJldHVybiBbXVxyXG5cclxuICAgIGNhcmRzID0gW11cclxuICAgIGZvciBjYXJkLCBpIGluIEBjYXJkc1xyXG4gICAgICBpZiBAcGlja2VkW2ldXHJcbiAgICAgICAgYW5pbSA9IEBhbmltc1tjYXJkXVxyXG4gICAgICAgIGNhcmRzLnB1c2gge1xyXG4gICAgICAgICAgY2FyZDogY2FyZFxyXG4gICAgICAgICAgeDogYW5pbS5jdXIueFxyXG4gICAgICAgICAgeTogYW5pbS5jdXIueVxyXG4gICAgICAgICAgcjogYW5pbS5jdXIuclxyXG4gICAgICAgICAgaW5kZXg6IGlcclxuICAgICAgICB9XHJcbiAgICByZXR1cm4gY2FyZHNcclxuXHJcbiAgZG93bjogKEBkcmFnWCwgQGRyYWdZLCBpbmRleCkgLT5cclxuICAgIEB1cChAZHJhZ1gsIEBkcmFnWSkgIyBlbnN1cmUgd2UgbGV0IGdvIG9mIHRoZSBwcmV2aW91cyBjYXJkIGluIGNhc2UgdGhlIGV2ZW50cyBhcmUgZHVtYlxyXG4gICAgaWYgQHBpY2tpbmdcclxuICAgICAgQHBpY2tlZFtpbmRleF0gPSAhQHBpY2tlZFtpbmRleF1cclxuICAgICAgQHBpY2tQYWludCA9IEBwaWNrZWRbaW5kZXhdXHJcbiAgICAgIHJldHVyblxyXG4gICAgQGdhbWUubG9nIFwicGlja2luZyB1cCBjYXJkIGluZGV4ICN7aW5kZXh9XCJcclxuICAgIEBkcmFnSW5kZXhTdGFydCA9IGluZGV4XHJcbiAgICBAZHJhZ0luZGV4Q3VycmVudCA9IGluZGV4XHJcbiAgICBAdXBkYXRlUG9zaXRpb25zKClcclxuXHJcbiAgbW92ZTogKEBkcmFnWCwgQGRyYWdZKSAtPlxyXG4gICAgcmV0dXJuIGlmIEBkcmFnSW5kZXhTdGFydCA9PSBOT19DQVJEXHJcbiAgICAjQGdhbWUubG9nIFwiZHJhZ2dpbmcgYXJvdW5kIGNhcmQgaW5kZXggI3tAZHJhZ0luZGV4Q3VycmVudH1cIlxyXG4gICAgQHJlb3JkZXIoKVxyXG4gICAgQHVwZGF0ZVBvc2l0aW9ucygpXHJcblxyXG4gIHVwOiAoQGRyYWdYLCBAZHJhZ1kpIC0+XHJcbiAgICByZXR1cm4gaWYgQGRyYWdJbmRleFN0YXJ0ID09IE5PX0NBUkRcclxuICAgIEByZW9yZGVyKClcclxuICAgIGlmIEB3YW50c1RvUGxheURyYWdnZWRDYXJkKClcclxuICAgICAgQGdhbWUubG9nIFwidHJ5aW5nIHRvIHBsYXkgYSAje0BjYXJkc1tAZHJhZ0luZGV4U3RhcnRdfSBmcm9tIGluZGV4ICN7QGRyYWdJbmRleFN0YXJ0fVwiXHJcbiAgICAgIGNhcmRJbmRleCA9IEBkcmFnSW5kZXhTdGFydFxyXG4gICAgICBjYXJkID0gQGNhcmRzW2NhcmRJbmRleF1cclxuICAgICAgYW5pbSA9IEBhbmltc1tjYXJkXVxyXG4gICAgICBAZHJhZ0luZGV4U3RhcnQgPSBOT19DQVJEXHJcbiAgICAgIEBkcmFnSW5kZXhDdXJyZW50ID0gTk9fQ0FSRFxyXG4gICAgICBAZ2FtZS5wbGF5IFt7XHJcbiAgICAgICAgY2FyZDogY2FyZFxyXG4gICAgICAgIHg6IGFuaW0uY3VyLnhcclxuICAgICAgICB5OiBhbmltLmN1ci55XHJcbiAgICAgICAgcjogYW5pbS5jdXIuclxyXG4gICAgICAgIGluZGV4OiBjYXJkSW5kZXhcclxuICAgICAgfV1cclxuICAgIGVsc2VcclxuICAgICAgQGdhbWUubG9nIFwidHJ5aW5nIHRvIHJlb3JkZXIgI3tAY2FyZHNbQGRyYWdJbmRleFN0YXJ0XX0gaW50byBpbmRleCAje0BkcmFnSW5kZXhDdXJyZW50fVwiXHJcbiAgICAgIEBjYXJkcyA9IEBjYWxjRHJhd25IYW5kKCkgIyBpcyB0aGlzIHJpZ2h0P1xyXG5cclxuICAgIEBkcmFnSW5kZXhTdGFydCA9IE5PX0NBUkRcclxuICAgIEBkcmFnSW5kZXhDdXJyZW50ID0gTk9fQ0FSRFxyXG4gICAgQHVwZGF0ZVBvc2l0aW9ucygpXHJcblxyXG4gIHVwZGF0ZTogKGR0KSAtPlxyXG4gICAgdXBkYXRlZCA9IGZhbHNlXHJcbiAgICBmb3IgY2FyZCxhbmltIG9mIEBhbmltc1xyXG4gICAgICBpZiBhbmltLnVwZGF0ZShkdClcclxuICAgICAgICB1cGRhdGVkID0gdHJ1ZVxyXG4gICAgcmV0dXJuIHVwZGF0ZWRcclxuXHJcbiAgcmVuZGVyOiAtPlxyXG4gICAgcmV0dXJuIGlmIEBjYXJkcy5sZW5ndGggPT0gMFxyXG4gICAgZHJhd25IYW5kID0gQGNhbGNEcmF3bkhhbmQoKVxyXG4gICAgZm9yIHYsIGluZGV4IGluIGRyYXduSGFuZFxyXG4gICAgICBjb250aW51ZSBpZiB2ID09IE5PX0NBUkRcclxuICAgICAgYW5pbSA9IEBhbmltc1t2XVxyXG4gICAgICBkbyAoYW5pbSwgaW5kZXgpID0+XHJcbiAgICAgICAgaWYgQHBpY2tpbmdcclxuICAgICAgICAgIGlmIEBwaWNrZWRbaW5kZXhdXHJcbiAgICAgICAgICAgIGhpZ2hsaWdodFN0YXRlID0gSGlnaGxpZ2h0LlNFTEVDVEVEXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIGhpZ2hsaWdodFN0YXRlID0gSGlnaGxpZ2h0LlVOU0VMRUNURURcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBpZiBAd2FudHNUb1BsYXlEcmFnZ2VkQ2FyZCgpXHJcbiAgICAgICAgICAgIGlmIChpbmRleCA9PSBAZHJhZ0luZGV4Q3VycmVudClcclxuICAgICAgICAgICAgICBoaWdobGlnaHRTdGF0ZSA9IEhpZ2hsaWdodC5TRUxFQ1RFRFxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgaGlnaGxpZ2h0U3RhdGUgPSBIaWdobGlnaHQuVU5TRUxFQ1RFRFxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBoaWdobGlnaHRTdGF0ZSA9IEhpZ2hsaWdodC5OT05FXHJcbiAgICAgICAgQHJlbmRlckNhcmQgdiwgYW5pbS5jdXIueCwgYW5pbS5jdXIueSwgYW5pbS5jdXIuciwgMSwgaGlnaGxpZ2h0U3RhdGUsIChjbGlja1gsIGNsaWNrWSkgPT5cclxuICAgICAgICAgIEBkb3duKGNsaWNrWCwgY2xpY2tZLCBpbmRleClcclxuXHJcbiAgcmVuZGVyQ2FyZDogKHYsIHgsIHksIHJvdCwgc2NhbGUsIHNlbGVjdGVkLCBjYikgLT5cclxuICAgIHJvdCA9IDAgaWYgbm90IHJvdFxyXG4gICAgcmFuayA9IE1hdGguZmxvb3IodiAvIDQpXHJcbiAgICBzdWl0ID0gTWF0aC5mbG9vcih2ICUgNClcclxuXHJcbiAgICBjb2wgPSBzd2l0Y2ggc2VsZWN0ZWRcclxuICAgICAgd2hlbiBIaWdobGlnaHQuTk9ORVxyXG4gICAgICAgIFsxLCAxLCAxXVxyXG4gICAgICB3aGVuIEhpZ2hsaWdodC5VTlNFTEVDVEVEXHJcbiAgICAgICAgIyBbMC4zLCAwLjMsIDAuM11cclxuICAgICAgICBbMSwgMSwgMV1cclxuICAgICAgd2hlbiBIaWdobGlnaHQuU0VMRUNURURcclxuICAgICAgICBbMC41LCAwLjUsIDAuOV1cclxuICAgICAgd2hlbiBIaWdobGlnaHQuUElMRVxyXG4gICAgICAgIFswLjYsIDAuNiwgMC42XVxyXG5cclxuICAgIEBnYW1lLmRyYXdJbWFnZSBcImNhcmRzXCIsXHJcbiAgICBDQVJEX0lNQUdFX09GRl9YICsgKENBUkRfSU1BR0VfQURWX1ggKiByYW5rKSwgQ0FSRF9JTUFHRV9PRkZfWSArIChDQVJEX0lNQUdFX0FEVl9ZICogc3VpdCksIENBUkRfSU1BR0VfVywgQ0FSRF9JTUFHRV9ILFxyXG4gICAgeCwgeSwgQGNhcmRXaWR0aCAqIHNjYWxlLCBAY2FyZEhlaWdodCAqIHNjYWxlLFxyXG4gICAgcm90LCAwLjUsIDAuNSwgY29sWzBdLGNvbFsxXSxjb2xbMl0sMSwgY2JcclxuXHJcbiAgY2FsY1Bvc2l0aW9uczogKGhhbmRTaXplKSAtPlxyXG4gICAgaWYgQHBvc2l0aW9uQ2FjaGUuaGFzT3duUHJvcGVydHkoaGFuZFNpemUpXHJcbiAgICAgIHJldHVybiBAcG9zaXRpb25DYWNoZVtoYW5kU2l6ZV1cclxuICAgIHJldHVybiBbXSBpZiBoYW5kU2l6ZSA9PSAwXHJcblxyXG4gICAgYWR2YW5jZSA9IEBoYW5kQW5nbGUgLyBoYW5kU2l6ZVxyXG4gICAgaWYgYWR2YW5jZSA+IEBoYW5kQW5nbGVBZHZhbmNlTWF4XHJcbiAgICAgIGFkdmFuY2UgPSBAaGFuZEFuZ2xlQWR2YW5jZU1heFxyXG4gICAgYW5nbGVTcHJlYWQgPSBhZHZhbmNlICogaGFuZFNpemUgICAgICAgICAgICAgICAgIyBob3cgbXVjaCBvZiB0aGUgYW5nbGUgd2UgcGxhbiBvbiB1c2luZ1xyXG4gICAgYW5nbGVMZWZ0b3ZlciA9IEBoYW5kQW5nbGUgLSBhbmdsZVNwcmVhZCAgICAgICAgIyBhbW91bnQgb2YgYW5nbGUgd2UncmUgbm90IHVzaW5nLCBhbmQgbmVlZCB0byBwYWQgc2lkZXMgd2l0aCBldmVubHlcclxuICAgIGN1cnJlbnRBbmdsZSA9IC0xICogKEBoYW5kQW5nbGUgLyAyKSAgICAgICAgICAgICMgbW92ZSB0byB0aGUgbGVmdCBzaWRlIG9mIG91ciBhbmdsZVxyXG4gICAgY3VycmVudEFuZ2xlICs9IGFuZ2xlTGVmdG92ZXIgLyAyICAgICAgICAgICAgICAgIyAuLi4gYW5kIGFkdmFuY2UgcGFzdCBoYWxmIG9mIHRoZSBwYWRkaW5nXHJcbiAgICBjdXJyZW50QW5nbGUgKz0gYWR2YW5jZSAvIDIgICAgICAgICAgICAgICAgICAgICAjIC4uLiBhbmQgY2VudGVyIHRoZSBjYXJkcyBpbiB0aGUgYW5nbGVcclxuXHJcbiAgICBwb3NpdGlvbnMgPSBbXVxyXG4gICAgZm9yIGkgaW4gWzAuLi5oYW5kU2l6ZV1cclxuICAgICAgeCA9IEBoYW5kQ2VudGVyLnggLSBNYXRoLmNvcygoTWF0aC5QSSAvIDIpICsgY3VycmVudEFuZ2xlKSAqIEBoYW5kRGlzdGFuY2VcclxuICAgICAgeSA9IEBoYW5kQ2VudGVyLnkgLSBNYXRoLnNpbigoTWF0aC5QSSAvIDIpICsgY3VycmVudEFuZ2xlKSAqIEBoYW5kRGlzdGFuY2VcclxuICAgICAgY3VycmVudEFuZ2xlICs9IGFkdmFuY2VcclxuICAgICAgcG9zaXRpb25zLnB1c2gge1xyXG4gICAgICAgIHg6IHhcclxuICAgICAgICB5OiB5XHJcbiAgICAgICAgcjogY3VycmVudEFuZ2xlIC0gYWR2YW5jZVxyXG4gICAgICB9XHJcblxyXG4gICAgQHBvc2l0aW9uQ2FjaGVbaGFuZFNpemVdID0gcG9zaXRpb25zXHJcbiAgICByZXR1cm4gcG9zaXRpb25zXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRcclxuIiwiQnV0dG9uID0gcmVxdWlyZSAnLi9CdXR0b24nXHJcblxyXG5jbGFzcyBNZW51XHJcbiAgY29uc3RydWN0b3I6IChAZ2FtZSwgQHRpdGxlLCBAYmFja2dyb3VuZCwgQGNvbG9yLCBAYWN0aW9ucykgLT5cclxuICAgIEBidXR0b25zID0gW11cclxuICAgIEBidXR0b25OYW1lcyA9IFtcImJ1dHRvbjBcIiwgXCJidXR0b24xXCJdXHJcblxyXG4gICAgYnV0dG9uU2l6ZSA9IEBnYW1lLmhlaWdodCAvIDE1XHJcbiAgICBAYnV0dG9uU3RhcnRZID0gQGdhbWUuaGVpZ2h0IC8gNVxyXG5cclxuICAgIHNsaWNlID0gKEBnYW1lLmhlaWdodCAtIEBidXR0b25TdGFydFkpIC8gKEBhY3Rpb25zLmxlbmd0aCArIDEpXHJcbiAgICBjdXJyWSA9IEBidXR0b25TdGFydFkgKyBzbGljZVxyXG4gICAgZm9yIGFjdGlvbiBpbiBAYWN0aW9uc1xyXG4gICAgICBidXR0b24gPSBuZXcgQnV0dG9uKEBnYW1lLCBAYnV0dG9uTmFtZXMsIEBnYW1lLmZvbnQsIGJ1dHRvblNpemUsIEBnYW1lLmNlbnRlci54LCBjdXJyWSwgYWN0aW9uKVxyXG4gICAgICBAYnV0dG9ucy5wdXNoIGJ1dHRvblxyXG4gICAgICBjdXJyWSArPSBzbGljZVxyXG5cclxuICB1cGRhdGU6IChkdCkgLT5cclxuICAgIHVwZGF0ZWQgPSBmYWxzZVxyXG4gICAgZm9yIGJ1dHRvbiBpbiBAYnV0dG9uc1xyXG4gICAgICBpZiBidXR0b24udXBkYXRlKGR0KVxyXG4gICAgICAgIHVwZGF0ZWQgPSB0cnVlXHJcbiAgICByZXR1cm4gdXBkYXRlZFxyXG5cclxuICByZW5kZXI6IC0+XHJcbiAgICBAZ2FtZS5zcHJpdGVSZW5kZXJlci5yZW5kZXIgQGJhY2tncm91bmQsIDAsIDAsIEBnYW1lLndpZHRoLCBAZ2FtZS5oZWlnaHQsIDAsIDAsIDAsIEBjb2xvclxyXG4gICAgQGdhbWUuZm9udFJlbmRlcmVyLnJlbmRlciBAZ2FtZS5mb250LCBAZ2FtZS5oZWlnaHQgLyAyNSwgXCJCdWlsZDogI3tAZ2FtZS52ZXJzaW9ufVwiLCAwLCBAZ2FtZS5oZWlnaHQsIDAsIDEsIEBnYW1lLmNvbG9ycy5saWdodGdyYXlcclxuICAgIHRpdGxlSGVpZ2h0ID0gQGdhbWUuaGVpZ2h0IC8gOFxyXG4gICAgdGl0bGVPZmZzZXQgPSBAYnV0dG9uU3RhcnRZID4+IDFcclxuICAgIEBnYW1lLmZvbnRSZW5kZXJlci5yZW5kZXIgQGdhbWUuZm9udCwgdGl0bGVIZWlnaHQsIEB0aXRsZSwgQGdhbWUuY2VudGVyLngsIHRpdGxlT2Zmc2V0LCAwLjUsIDAuNSwgQGdhbWUuY29sb3JzLndoaXRlXHJcbiAgICBmb3IgYnV0dG9uIGluIEBidXR0b25zXHJcbiAgICAgIGJ1dHRvbi5yZW5kZXIoKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNZW51XHJcbiIsIkFuaW1hdGlvbiA9IHJlcXVpcmUgJy4vQW5pbWF0aW9uJ1xyXG5IYW5kID0gcmVxdWlyZSAnLi9IYW5kJ1xyXG5cclxuU0VUVExFX01TID0gMTAwMFxyXG5cclxuY2xhc3MgUGlsZVxyXG4gIGNvbnN0cnVjdG9yOiAoQGdhbWUsIEBoYW5kKSAtPlxyXG4gICAgQHBsYXlJRCA9IC0xXHJcbiAgICBAcGxheXMgPSBbXVxyXG4gICAgQGFuaW1zID0ge31cclxuICAgIEBzZXR0bGVUaW1lciA9IDBcclxuICAgIEB0aHJvd25Db2xvciA9IHsgcjogMSwgZzogMSwgYjogMCwgYTogMX1cclxuICAgIEBzY2FsZSA9IDAuNlxyXG5cclxuICAgICMgMS4wIGlzIG5vdCBtZXNzeSBhdCBhbGwsIGFzIHlvdSBhcHByb2FjaCAwIGl0IHN0YXJ0cyB0byBhbGwgcGlsZSBvbiBvbmUgYW5vdGhlclxyXG4gICAgbWVzc3kgPSAwLjJcclxuXHJcbiAgICBAcGxheUNhcmRTcGFjaW5nID0gMC4xXHJcblxyXG4gICAgY2VudGVyWCA9IEBnYW1lLmNlbnRlci54XHJcbiAgICBjZW50ZXJZID0gQGdhbWUuY2VudGVyLnlcclxuICAgIG9mZnNldFggPSBAaGFuZC5jYXJkV2lkdGggKiBtZXNzeSAqIEBzY2FsZVxyXG4gICAgb2Zmc2V0WSA9IEBoYW5kLmNhcmRIYWxmSGVpZ2h0ICogbWVzc3kgKiBAc2NhbGVcclxuICAgIEBwbGF5TG9jYXRpb25zID0gW1xyXG4gICAgICB7IHg6IGNlbnRlclgsIHk6IGNlbnRlclkgKyBvZmZzZXRZIH0gIyBib3R0b21cclxuICAgICAgeyB4OiBjZW50ZXJYIC0gb2Zmc2V0WCwgeTogY2VudGVyWSB9ICMgbGVmdFxyXG4gICAgICB7IHg6IGNlbnRlclgsIHk6IGNlbnRlclkgLSBvZmZzZXRZIH0gIyB0b3BcclxuICAgICAgeyB4OiBjZW50ZXJYICsgb2Zmc2V0WCwgeTogY2VudGVyWSB9ICMgcmlnaHRcclxuICAgIF1cclxuICAgIEB0aHJvd0xvY2F0aW9ucyA9IFtcclxuICAgICAgeyB4OiBjZW50ZXJYLCB5OiBAZ2FtZS5oZWlnaHQgfSAjIGJvdHRvbVxyXG4gICAgICB7IHg6IDAsIHk6IGNlbnRlclkgKyBvZmZzZXRZIH0gIyBsZWZ0XHJcbiAgICAgIHsgeDogY2VudGVyWCwgeTogMCB9ICMgdG9wXHJcbiAgICAgIHsgeDogQGdhbWUud2lkdGgsIHk6IGNlbnRlclkgKyBvZmZzZXRZIH0gIyByaWdodFxyXG4gICAgXVxyXG5cclxuICBzZXQ6IChwaWxlSUQsIHBpbGUsIHBpbGVXaG8pIC0+XHJcbiAgICBpZiBAcGxheUlEICE9IHBpbGVJRFxyXG4gICAgICBAcGxheUlEID0gcGlsZUlEXHJcbiAgICAgIEBwbGF5cy5wdXNoIHtcclxuICAgICAgICBjYXJkczogcGlsZS5zbGljZSgwKVxyXG4gICAgICAgIHdobzogcGlsZVdob1xyXG4gICAgICB9XHJcbiAgICAgIEBzZXR0bGVUaW1lciA9IFNFVFRMRV9NU1xyXG5cclxuICAgICMgaWYgKEBwbGF5SUQgIT0gcGlsZUlEKSBhbmQgKHRocm93bi5sZW5ndGggPiAwKVxyXG4gICAgIyAgIEBwbGF5cyA9IHRocm93bi5zbGljZSgwKSAjIHRoZSBwaWxlIGhhcyBiZWNvbWUgdGhlIHRocm93biwgc3Rhc2ggaXQgb2ZmIG9uZSBsYXN0IHRpbWVcclxuICAgICMgICBAcGxheVdobyA9IHRocm93bldoby5zbGljZSgwKVxyXG4gICAgIyAgIEBwbGF5SUQgPSBwaWxlSURcclxuICAgICMgICBAc2V0dGxlVGltZXIgPSBTRVRUTEVfTVNcclxuXHJcbiAgICAjICMgZG9uJ3Qgc3RvbXAgdGhlIHBpbGUgd2UncmUgZHJhd2luZyB1bnRpbCBpdCBpcyBkb25lIHNldHRsaW5nIGFuZCBjYW4gZmx5IG9mZiB0aGUgc2NyZWVuXHJcbiAgICAjIGlmIEBzZXR0bGVUaW1lciA9PSAwXHJcbiAgICAjICAgQHBsYXlzID0gcGlsZS5zbGljZSgwKVxyXG4gICAgIyAgIEBwbGF5V2hvID0gcGlsZVdoby5zbGljZSgwKVxyXG4gICAgIyAgIEB0aHJvd24gPSB0aHJvd24uc2xpY2UoMClcclxuICAgICMgICBAdGhyb3duV2hvID0gdGhyb3duV2hvLnNsaWNlKDApXHJcbiAgICAjICAgQHRocm93blRha2VyID0gdGhyb3duVGFrZXJcclxuXHJcbiAgICBAc3luY0FuaW1zKClcclxuXHJcbiAgaGludDogKGNhcmRzKSAtPlxyXG4gICAgZm9yIGNhcmQgaW4gY2FyZHNcclxuICAgICAgQGFuaW1zW2NhcmQuY2FyZF0gPSBuZXcgQW5pbWF0aW9uIHtcclxuICAgICAgICBzcGVlZDogQGhhbmQuY2FyZFNwZWVkXHJcbiAgICAgICAgeDogY2FyZC54XHJcbiAgICAgICAgeTogY2FyZC55XHJcbiAgICAgICAgcjogY2FyZC5yXHJcbiAgICAgICAgczogMVxyXG4gICAgICB9XHJcblxyXG4gIHN5bmNBbmltczogLT5cclxuICAgIHNlZW4gPSB7fVxyXG4gICAgbG9jYXRpb25zID0gQHRocm93TG9jYXRpb25zXHJcbiAgICBmb3IgcGxheSBpbiBAcGxheXNcclxuICAgICAgZm9yIGNhcmQsIGluZGV4IGluIHBsYXkuY2FyZHNcclxuICAgICAgICBzZWVuW2NhcmRdKytcclxuICAgICAgICBpZiBub3QgQGFuaW1zW2NhcmRdXHJcbiAgICAgICAgICB3aG8gPSBwbGF5Lndob1xyXG4gICAgICAgICAgbG9jYXRpb24gPSBsb2NhdGlvbnNbd2hvXVxyXG4gICAgICAgICAgQGFuaW1zW2NhcmRdID0gbmV3IEFuaW1hdGlvbiB7XHJcbiAgICAgICAgICAgIHNwZWVkOiBAaGFuZC5jYXJkU3BlZWRcclxuICAgICAgICAgICAgeDogbG9jYXRpb24ueFxyXG4gICAgICAgICAgICB5OiBsb2NhdGlvbi55XHJcbiAgICAgICAgICAgIHI6IC0xICogTWF0aC5QSSAvIDRcclxuICAgICAgICAgICAgczogQHNjYWxlXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgdG9SZW1vdmUgPSBbXVxyXG4gICAgZm9yIGNhcmQsYW5pbSBvZiBAYW5pbXNcclxuICAgICAgaWYgbm90IHNlZW4uaGFzT3duUHJvcGVydHkoY2FyZClcclxuICAgICAgICB0b1JlbW92ZS5wdXNoIGNhcmRcclxuICAgIGZvciBjYXJkIGluIHRvUmVtb3ZlXHJcbiAgICAgICMgQGdhbWUubG9nIFwicmVtb3ZpbmcgYW5pbSBmb3IgI3tjYXJkfVwiXHJcbiAgICAgIGRlbGV0ZSBAYW5pbXNbY2FyZF1cclxuXHJcbiAgICBAdXBkYXRlUG9zaXRpb25zKClcclxuXHJcbiAgdXBkYXRlUG9zaXRpb25zOiAtPlxyXG4gICAgbG9jYXRpb25zID0gQHBsYXlMb2NhdGlvbnNcclxuICAgIGZvciBwbGF5LCBwbGF5SW5kZXggaW4gQHBsYXlzXHJcbiAgICAgIGZvciB2LCBpbmRleCBpbiBwbGF5LmNhcmRzXHJcbiAgICAgICAgYW5pbSA9IEBhbmltc1t2XVxyXG4gICAgICAgIGxvYyA9IHBsYXkud2hvXHJcbiAgICAgICAgYW5pbS5yZXEueCA9IGxvY2F0aW9uc1tsb2NdLnggKyAoaW5kZXggKiBAaGFuZC5jYXJkV2lkdGggKiBAcGxheUNhcmRTcGFjaW5nKVxyXG4gICAgICAgIGFuaW0ucmVxLnkgPSBsb2NhdGlvbnNbbG9jXS55XHJcbiAgICAgICAgYW5pbS5yZXEuciA9IDAuMiAqIE1hdGguY29zKHBsYXlJbmRleCAvIDAuMSlcclxuICAgICAgICBhbmltLnJlcS5zID0gQHNjYWxlXHJcblxyXG4gIHJlYWR5Rm9yTmV4dFRyaWNrOiAtPlxyXG4gICAgcmV0dXJuIEByZXN0aW5nKClcclxuICAgICMgcmV0dXJuIChAc2V0dGxlVGltZXIgPT0gMClcclxuXHJcbiAgdXBkYXRlOiAoZHQpIC0+XHJcbiAgICB1cGRhdGVkID0gZmFsc2VcclxuXHJcbiAgICBpZiBAc2V0dGxlVGltZXIgPiAwXHJcbiAgICAgIHVwZGF0ZWQgPSB0cnVlXHJcbiAgICAgIEBzZXR0bGVUaW1lciAtPSBkdFxyXG4gICAgICBpZiBAc2V0dGxlVGltZXIgPCAwXHJcbiAgICAgICAgQHNldHRsZVRpbWVyID0gMFxyXG5cclxuICAgIGZvciBjYXJkLGFuaW0gb2YgQGFuaW1zXHJcbiAgICAgIGlmIGFuaW0udXBkYXRlKGR0KVxyXG4gICAgICAgIHVwZGF0ZWQgPSB0cnVlXHJcblxyXG4gICAgcmV0dXJuIHVwZGF0ZWRcclxuXHJcbiAgIyB1c2VkIGJ5IHRoZSBnYW1lIG92ZXIgc2NyZWVuLiBJdCByZXR1cm5zIHRydWUgd2hlbiBuZWl0aGVyIHRoZSBwaWxlIG5vciB0aGUgbGFzdCB0aHJvd24gYXJlIG1vdmluZ1xyXG4gIHJlc3Rpbmc6IC0+XHJcbiAgICBmb3IgY2FyZCxhbmltIG9mIEBhbmltc1xyXG4gICAgICBpZiBhbmltLmFuaW1hdGluZygpXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICBpZiBAc2V0dGxlVGltZXIgPiAwXHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgcmV0dXJuIHRydWVcclxuXHJcbiAgcmVuZGVyOiAtPlxyXG4gICAgZm9yIHBsYXksIHBsYXlJbmRleCBpbiBAcGxheXNcclxuICAgICAgaGlnaGxpZ2h0ID0gSGFuZC5IaWdobGlnaHQuUElMRVxyXG4gICAgICBpZiBwbGF5SW5kZXggPT0gKEBwbGF5cy5sZW5ndGggLSAxKVxyXG4gICAgICAgIGhpZ2hsaWdodCA9IEhhbmQuSGlnaGxpZ2h0Lk5PTkVcclxuICAgICAgZm9yIHYsIGluZGV4IGluIHBsYXkuY2FyZHNcclxuICAgICAgICBhbmltID0gQGFuaW1zW3ZdXHJcbiAgICAgICAgQGhhbmQucmVuZGVyQ2FyZCB2LCBhbmltLmN1ci54LCBhbmltLmN1ci55LCBhbmltLmN1ci5yLCBhbmltLmN1ci5zLCBoaWdobGlnaHRcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUGlsZVxyXG4iLCJjbGFzcyBTcHJpdGVSZW5kZXJlclxyXG4gIGNvbnN0cnVjdG9yOiAoQGdhbWUpIC0+XHJcbiAgICBAc3ByaXRlcyA9XHJcbiAgICAgICMgZ2VuZXJpYyBzcHJpdGVzXHJcbiAgICAgIHNvbGlkOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6ICA1NSwgeTogNzIzLCB3OiAgMTAsIGg6ICAxMCB9XHJcbiAgICAgIHBhdXNlOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDYwMiwgeTogNzA3LCB3OiAxMjIsIGg6IDEyNSB9XHJcbiAgICAgIGJ1dHRvbjA6ICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDE0MCwgeTogNzc3LCB3OiA0MjIsIGg6ICA2NSB9XHJcbiAgICAgIGJ1dHRvbjE6ICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDE0MCwgeTogNjk4LCB3OiA0MjIsIGg6ICA2NSB9XHJcbiAgICAgIHBsdXMwOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDc0NSwgeTogNjY0LCB3OiAxMTYsIGg6IDExOCB9XHJcbiAgICAgIHBsdXMxOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDc0NSwgeTogODIwLCB3OiAxMTYsIGg6IDExOCB9XHJcbiAgICAgIG1pbnVzMDogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDg5NSwgeTogNjY0LCB3OiAxMTYsIGg6IDExOCB9XHJcbiAgICAgIG1pbnVzMTogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDg5NSwgeTogODIwLCB3OiAxMTYsIGg6IDExOCB9XHJcbiAgICAgIGFycm93TDogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6ICAzMywgeTogODU4LCB3OiAyMDQsIGg6IDE1NiB9XHJcbiAgICAgIGFycm93UjogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDIzOSwgeTogODUyLCB3OiAyMDgsIGg6IDE1NSB9XHJcblxyXG4gICAgICBwaWxlOiAgICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAgMTMsIHk6IDg4MywgdzogMTI4LCBoOiAxMjggfVxyXG4gICAgICBwaWxlMDogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAxNDUsIHk6IDg4MywgdzogMTI4LCBoOiAxMjggfVxyXG4gICAgICBwaWxlMTogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAyNzcsIHk6IDg4MywgdzogMTI4LCBoOiAxMjggfVxyXG4gICAgICBwaWxlMjogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA0MDksIHk6IDg4MywgdzogMTI4LCBoOiAxMjggfVxyXG4gICAgICBwaWxlMzogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA1NDEsIHk6IDg4MywgdzogMTI4LCBoOiAxMjggfVxyXG5cclxuICAgICAgIyBtZW51IGJhY2tncm91bmRzXHJcbiAgICAgIG1haW5tZW51OiAgeyB0ZXh0dXJlOiBcIm1haW5tZW51XCIsICB4OiAwLCB5OiAwLCB3OiAxMjgwLCBoOiA3MjAgfVxyXG4gICAgICBwYXVzZW1lbnU6IHsgdGV4dHVyZTogXCJwYXVzZW1lbnVcIiwgeDogMCwgeTogMCwgdzogMTI4MCwgaDogNzIwIH1cclxuXHJcbiAgICAgICMgaG93dG9cclxuICAgICAgaG93dG8xOiAgICB7IHRleHR1cmU6IFwiaG93dG8xXCIsICB4OiAwLCB5OiAgMCwgdzogMTkyMCwgaDogMTA4MCB9XHJcblxyXG4gICAgICBhdTogICAgICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA1NDAsIHk6IDEwNzksIHc6IDQwMCwgaDogIDgwIH1cclxuICAgICAgc3Rhcl9vbjogICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogIDM4LCB5OiAxMDY2LCB3OiAxOTAsIGg6IDE5MCB9XHJcbiAgICAgIHN0YXJfb2ZmOiAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDI1MCwgeTogMTA2NiwgdzogMTkwLCBoOiAxOTAgfVxyXG5cclxuICAgICAgIyBjaGFyYWN0ZXJzXHJcbiAgICAgIG1hcmlvOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6ICAyMCwgeTogICAwLCB3OiAxNTEsIGg6IDMwOCB9XHJcbiAgICAgIGx1aWdpOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDE3MSwgeTogICAwLCB3OiAxNTEsIGg6IDMwOCB9XHJcbiAgICAgIHBlYWNoOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDMzNSwgeTogICAwLCB3OiAxNjQsIGg6IDMwOCB9XHJcbiAgICAgIGRhaXN5OiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDUwNCwgeTogICAwLCB3OiAxNjQsIGg6IDMwOCB9XHJcbiAgICAgIHlvc2hpOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDY2OCwgeTogICAwLCB3OiAxODAsIGg6IDMwOCB9XHJcbiAgICAgIHRvYWQ6ICAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDg0OSwgeTogICAwLCB3OiAxNTcsIGg6IDMwOCB9XHJcbiAgICAgIGJvd3NlcjogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6ICAxMSwgeTogMzIyLCB3OiAxNTEsIGg6IDMwOCB9XHJcbiAgICAgIGJvd3NlcmpyOiAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDIyNSwgeTogMzIyLCB3OiAxNDQsIGg6IDMwOCB9XHJcbiAgICAgIGtvb3BhOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDM3MiwgeTogMzIyLCB3OiAxMjgsIGg6IDMwOCB9XHJcbiAgICAgIHJvc2FsaW5hOiAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDUwMCwgeTogMzIyLCB3OiAxNzMsIGg6IDMwOCB9XHJcbiAgICAgIHNoeWd1eTogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDY5MSwgeTogMzIyLCB3OiAxNTQsIGg6IDMwOCB9XHJcbiAgICAgIHRvYWRldHRlOiAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDg0NywgeTogMzIyLCB3OiAxNTgsIGg6IDMwOCB9XHJcblxyXG4gIGNhbGNXaWR0aDogKHNwcml0ZU5hbWUsIGhlaWdodCkgLT5cclxuICAgIHNwcml0ZSA9IEBzcHJpdGVzW3Nwcml0ZU5hbWVdXHJcbiAgICByZXR1cm4gMSBpZiBub3Qgc3ByaXRlXHJcbiAgICByZXR1cm4gaGVpZ2h0ICogc3ByaXRlLncgLyBzcHJpdGUuaFxyXG5cclxuICByZW5kZXI6IChzcHJpdGVOYW1lLCBkeCwgZHksIGR3LCBkaCwgcm90LCBhbmNob3J4LCBhbmNob3J5LCBjb2xvciwgY2IpIC0+XHJcbiAgICBzcHJpdGUgPSBAc3ByaXRlc1tzcHJpdGVOYW1lXVxyXG4gICAgcmV0dXJuIGlmIG5vdCBzcHJpdGVcclxuICAgIGlmIChkdyA9PSAwKSBhbmQgKGRoID09IDApXHJcbiAgICAgICMgdGhpcyBwcm9iYWJseSBzaG91bGRuJ3QgZXZlciBiZSB1c2VkLlxyXG4gICAgICBkdyA9IHNwcml0ZS54XHJcbiAgICAgIGRoID0gc3ByaXRlLnlcclxuICAgIGVsc2UgaWYgZHcgPT0gMFxyXG4gICAgICBkdyA9IGRoICogc3ByaXRlLncgLyBzcHJpdGUuaFxyXG4gICAgZWxzZSBpZiBkaCA9PSAwXHJcbiAgICAgIGRoID0gZHcgKiBzcHJpdGUuaCAvIHNwcml0ZS53XHJcbiAgICBAZ2FtZS5kcmF3SW1hZ2Ugc3ByaXRlLnRleHR1cmUsIHNwcml0ZS54LCBzcHJpdGUueSwgc3ByaXRlLncsIHNwcml0ZS5oLCBkeCwgZHksIGR3LCBkaCwgcm90LCBhbmNob3J4LCBhbmNob3J5LCBjb2xvci5yLCBjb2xvci5nLCBjb2xvci5iLCBjb2xvci5hLCBjYlxyXG4gICAgcmV0dXJuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNwcml0ZVJlbmRlcmVyXHJcbiIsIk1JTl9QTEFZRVJTID0gM1xyXG5NQVhfTE9HX0xJTkVTID0gNlxyXG5PSyA9ICdPSydcclxuXHJcblN1aXQgPVxyXG4gIE5PTkU6IC0xXHJcbiAgU1BBREVTOiAwXHJcbiAgQ0xVQlM6IDFcclxuICBESUFNT05EUzogMlxyXG4gIEhFQVJUUzogM1xyXG5cclxuU3VpdE5hbWUgPSBbJ1NwYWRlcycsICdDbHVicycsICdEaWFtb25kcycsICdIZWFydHMnXVxyXG5TaG9ydFN1aXROYW1lID0gWydTJywgJ0MnLCAnRCcsICdIJ11cclxuR2x5cGhTdWl0TmFtZSA9IFtcIlxceGM4XCIsIFwiXFx4YzlcIiwgXCJcXHhjYVwiLCBcIlxceGNiXCJdXHJcblxyXG5TVEFSVElOR19NT05FWSA9IDI1XHJcblxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIEFJIE5hbWUgR2VuZXJhdG9yXHJcblxyXG5haUNoYXJhY3Rlckxpc3QgPSBbXHJcbiAgeyBpZDogXCJtYXJpb1wiLCAgICBuYW1lOiBcIk1hcmlvXCIsICAgICAgc3ByaXRlOiBcIm1hcmlvXCIsICAgIGJyYWluOiBcIm5vcm1hbFwiIH1cclxuICB7IGlkOiBcImx1aWdpXCIsICAgIG5hbWU6IFwiTHVpZ2lcIiwgICAgICBzcHJpdGU6IFwibHVpZ2lcIiwgICAgYnJhaW46IFwibm9ybWFsXCIgfVxyXG4gIHsgaWQ6IFwicGVhY2hcIiwgICAgbmFtZTogXCJQZWFjaFwiLCAgICAgIHNwcml0ZTogXCJwZWFjaFwiLCAgICBicmFpbjogXCJub3JtYWxcIiB9XHJcbiAgeyBpZDogXCJkYWlzeVwiLCAgICBuYW1lOiBcIkRhaXN5XCIsICAgICAgc3ByaXRlOiBcImRhaXN5XCIsICAgIGJyYWluOiBcIm5vcm1hbFwiIH1cclxuICB7IGlkOiBcInlvc2hpXCIsICAgIG5hbWU6IFwiWW9zaGlcIiwgICAgICBzcHJpdGU6IFwieW9zaGlcIiwgICAgYnJhaW46IFwibm9ybWFsXCIgfVxyXG4gIHsgaWQ6IFwidG9hZFwiLCAgICAgbmFtZTogXCJUb2FkXCIsICAgICAgIHNwcml0ZTogXCJ0b2FkXCIsICAgICBicmFpbjogXCJub3JtYWxcIiB9XHJcbiAgeyBpZDogXCJib3dzZXJcIiwgICBuYW1lOiBcIkJvd3NlclwiLCAgICAgc3ByaXRlOiBcImJvd3NlclwiLCAgIGJyYWluOiBcIm5vcm1hbFwiIH1cclxuICB7IGlkOiBcImJvd3NlcmpyXCIsIG5hbWU6IFwiQm93c2VyIEpyXCIsICBzcHJpdGU6IFwiYm93c2VyanJcIiwgYnJhaW46IFwibm9ybWFsXCIgfVxyXG4gIHsgaWQ6IFwia29vcGFcIiwgICAgbmFtZTogXCJLb29wYVwiLCAgICAgIHNwcml0ZTogXCJrb29wYVwiLCAgICBicmFpbjogXCJub3JtYWxcIiB9XHJcbiAgeyBpZDogXCJyb3NhbGluYVwiLCBuYW1lOiBcIlJvc2FsaW5hXCIsICAgc3ByaXRlOiBcInJvc2FsaW5hXCIsIGJyYWluOiBcIm5vcm1hbFwiIH1cclxuICB7IGlkOiBcInNoeWd1eVwiLCAgIG5hbWU6IFwiU2h5Z3V5XCIsICAgICBzcHJpdGU6IFwic2h5Z3V5XCIsICAgYnJhaW46IFwibm9ybWFsXCIgfVxyXG4gIHsgaWQ6IFwidG9hZGV0dGVcIiwgbmFtZTogXCJUb2FkZXR0ZVwiLCAgIHNwcml0ZTogXCJ0b2FkZXR0ZVwiLCBicmFpbjogXCJub3JtYWxcIiB9XHJcbl1cclxuXHJcbmFpQ2hhcmFjdGVycyA9IHt9XHJcbmZvciBjaGFyYWN0ZXIgaW4gYWlDaGFyYWN0ZXJMaXN0XHJcbiAgYWlDaGFyYWN0ZXJzW2NoYXJhY3Rlci5pZF0gPSBjaGFyYWN0ZXJcclxuXHJcbnJhbmRvbUNoYXJhY3RlciA9IC0+XHJcbiAgciA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGFpQ2hhcmFjdGVyTGlzdC5sZW5ndGgpXHJcbiAgcmV0dXJuIGFpQ2hhcmFjdGVyTGlzdFtyXVxyXG5cclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuIyBDYXJkXHJcblxyXG5jbGFzcyBDYXJkXHJcbiAgY29uc3RydWN0b3I6IChAcmF3KSAtPlxyXG4gICAgQHN1aXQgID0gTWF0aC5mbG9vcihAcmF3ICUgNClcclxuICAgIEB2YWx1ZSA9IE1hdGguZmxvb3IoQHJhdyAvIDQpXHJcbiAgICBAdmFsdWVOYW1lID0gc3dpdGNoIEB2YWx1ZVxyXG4gICAgICB3aGVuICA4IHRoZW4gJ0onXHJcbiAgICAgIHdoZW4gIDkgdGhlbiAnUSdcclxuICAgICAgd2hlbiAxMCB0aGVuICdLJ1xyXG4gICAgICB3aGVuIDExIHRoZW4gJ0EnXHJcbiAgICAgIHdoZW4gMTIgdGhlbiAnMidcclxuICAgICAgZWxzZVxyXG4gICAgICAgIFN0cmluZyhAdmFsdWUgKyAzKVxyXG4gICAgQG5hbWUgPSBAdmFsdWVOYW1lICsgU2hvcnRTdWl0TmFtZVtAc3VpdF1cclxuICAgICMgY29uc29sZS5sb2cgXCIje0ByYXd9IC0+ICN7QG5hbWV9XCJcclxuICBnbHlwaGVkTmFtZTogLT5cclxuICAgIHJldHVybiBAdmFsdWVOYW1lICsgR2x5cGhTdWl0TmFtZVtAc3VpdF1cclxuXHJcbmNhcmRzVG9TdHJpbmcgPSAocmF3Q2FyZHMpIC0+XHJcbiAgY2FyZE5hbWVzID0gW11cclxuICBmb3IgcmF3IGluIHJhd0NhcmRzXHJcbiAgICBjYXJkID0gbmV3IENhcmQocmF3KVxyXG4gICAgY2FyZE5hbWVzLnB1c2ggY2FyZC5uYW1lXHJcbiAgcmV0dXJuIFwiWyBcIiArIGNhcmROYW1lcy5qb2luKCcsJykgKyBcIiBdXCJcclxuXHJcbnBsYXlUeXBlVG9TdHJpbmcgPSAodHlwZSkgLT5cclxuICBpZiBtYXRjaGVzID0gdHlwZS5tYXRjaCgvXnJvcChcXGQrKS8pXHJcbiAgICByZXR1cm4gXCJSdW4gb2YgI3ttYXRjaGVzWzFdfSBQYWlyc1wiXHJcbiAgaWYgbWF0Y2hlcyA9IHR5cGUubWF0Y2goL15ydW4oXFxkKykvKVxyXG4gICAgcmV0dXJuIFwiUnVuIG9mICN7bWF0Y2hlc1sxXX1cIlxyXG4gIGlmIG1hdGNoZXMgPSB0eXBlLm1hdGNoKC9ea2luZChcXGQrKS8pXHJcbiAgICBpZiBtYXRjaGVzWzFdID09ICcxJ1xyXG4gICAgICByZXR1cm4gJ1NpbmdsZSdcclxuICAgIGlmIG1hdGNoZXNbMV0gPT0gJzInXHJcbiAgICAgIHJldHVybiAnUGFpcidcclxuICAgIGlmIG1hdGNoZXNbMV0gPT0gJzMnXHJcbiAgICAgIHJldHVybiAnVHJpcHMnXHJcbiAgICByZXR1cm4gJ1F1YWRzJ1xyXG4gIHJldHVybiB0eXBlXHJcblxyXG5wbGF5VG9TdHJpbmcgPSAocGxheSkgLT5cclxuICBoaWdoQ2FyZCA9IG5ldyBDYXJkKHBsYXkuaGlnaClcclxuICByZXR1cm4gXCIje3BsYXlUeXBlVG9TdHJpbmcocGxheS50eXBlKX0gLSAje2hpZ2hDYXJkLmdseXBoZWROYW1lKCl9XCJcclxuXHJcbnBsYXlUb0NhcmRDb3VudCA9IChwbGF5KSAtPlxyXG4gIGlmIG1hdGNoZXMgPSBwbGF5LnR5cGUubWF0Y2goL15yb3AoXFxkKykvKVxyXG4gICAgcmV0dXJuIHBhcnNlSW50KG1hdGNoZXNbMV0pICogMlxyXG4gIGlmIG1hdGNoZXMgPSBwbGF5LnR5cGUubWF0Y2goL15ydW4oXFxkKykvKVxyXG4gICAgcmV0dXJuIHBhcnNlSW50KG1hdGNoZXNbMV0pXHJcbiAgaWYgbWF0Y2hlcyA9IHBsYXkudHlwZS5tYXRjaCgvXmtpbmQoXFxkKykvKVxyXG4gICAgcmV0dXJuIHBhcnNlSW50KG1hdGNoZXNbMV0pXHJcbiAgcmV0dXJuIDEgIyA/P1xyXG5cclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuIyBEZWNrXHJcblxyXG5jbGFzcyBTaHVmZmxlZERlY2tcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgICMgZGF0IGluc2lkZS1vdXQgc2h1ZmZsZSFcclxuICAgIEBjYXJkcyA9IFsgMCBdXHJcbiAgICBmb3IgaSBpbiBbMS4uLjUyXVxyXG4gICAgICBqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogaSlcclxuICAgICAgQGNhcmRzLnB1c2goQGNhcmRzW2pdKVxyXG4gICAgICBAY2FyZHNbal0gPSBpXHJcblxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIEFjaGlldmVtZW50c1xyXG5cclxuYWNoaWV2ZW1lbnRzTGlzdCA9IFtcclxuICB7XHJcbiAgICBpZDogXCJ2ZXRlcmFuXCJcclxuICAgIHRpdGxlOiBcIkkndmUgU2VlbiBTb21lIFRoaW5nc1wiXHJcbiAgICBkZXNjcmlwdGlvbjogW1wiUGxheSA1MCBIYW5kcy5cIl1cclxuICAgIHByb2dyZXNzOiAoYWNoKSAtPlxyXG4gICAgICBpZiBhY2guc3RhdGUudG90YWxHYW1lcyA+PSA1MFxyXG4gICAgICAgIHJldHVybiBcIlRvdGFsIFBsYXllZDogYGFhZmZhYWAje2FjaC5zdGF0ZS50b3RhbEdhbWVzfWBgIEdhbWVzXCJcclxuICAgICAgcmV0dXJuIFwiUHJvZ3Jlc3M6ICN7YWNoLnN0YXRlLnRvdGFsR2FtZXN9IC8gNTBcIlxyXG4gIH1cclxuICB7XHJcbiAgICBpZDogXCJ0cnloYXJkXCJcclxuICAgIHRpdGxlOiBcIlRyeWhhcmRcIlxyXG4gICAgZGVzY3JpcHRpb246IFtcIkVhcm4gYSA1IGdhbWUgd2luIHN0cmVhay5cIl1cclxuICAgIHByb2dyZXNzOiAoYWNoKSAtPlxyXG4gICAgICBiZXN0U3RyZWFrID0gYWNoLnN0YXRlLmJlc3RTdHJlYWtcclxuICAgICAgYmVzdFN0cmVhayA/PSAwXHJcbiAgICAgIGlmIGJlc3RTdHJlYWsgPj0gNVxyXG4gICAgICAgIHJldHVybiBcIkJlc3QgU3RyZWFrOiBgYWFmZmFhYCN7YmVzdFN0cmVha31gYCBXaW5zXCJcclxuICAgICAgcyA9IFwiXCJcclxuICAgICAgaWYgYmVzdFN0cmVhayA+IDFcclxuICAgICAgICBzID0gXCJzXCJcclxuICAgICAgcmV0dXJuIFwiQmVzdCBTdHJlYWs6ICN7YmVzdFN0cmVha30gV2luI3tzfVwiXHJcbiAgfVxyXG4gIHtcclxuICAgIGlkOiBcImJyZWFrZXJcIlxyXG4gICAgdGl0bGU6IFwiU3ByaW5nIEJyZWFrXCJcclxuICAgIGRlc2NyaXB0aW9uOiBbXCJCcmVhayBhIDIuXCJdXHJcbiAgfVxyXG4gIHtcclxuICAgIGlkOiBcImtlZXBpdGxvd1wiXHJcbiAgICB0aXRsZTogXCJLZWVwIEl0IExvdywgQm95c1wiXHJcbiAgICBkZXNjcmlwdGlvbjogW1wiUGxheSBhIFNpbmdsZSAyIG9uIHRvcCBvZiBhIFNpbmdsZSAzLlwiXVxyXG4gIH1cclxuICB7XHJcbiAgICBpZDogXCJzdWl0ZWRcIlxyXG4gICAgdGl0bGU6IFwiRG9lc24ndCBFdmVuIE1hdHRlclwiXHJcbiAgICBkZXNjcmlwdGlvbjogW1wiVGhyb3cgYSBzdWl0ZWQgcnVuLlwiXVxyXG4gIH1cclxuICB7XHJcbiAgICBpZDogXCJ0b255XCJcclxuICAgIHRpdGxlOiBcIlRoZSBUb255XCJcclxuICAgIGRlc2NyaXB0aW9uOiBbXCJUaHJvdyBhIHJ1biBvZiA3IG9yIG1vcmUgY2FyZHMsIGFuZCB0aGVuIGxvc2UuXCJdXHJcbiAgfVxyXG4gIHtcclxuICAgIGlkOiBcInNhbXBsZXJcIlxyXG4gICAgdGl0bGU6IFwiU2FtcGxlciBQbGF0dGVyXCJcclxuICAgIGRlc2NyaXB0aW9uOiBbXCJJbiBhIHNpbmdsZSBoYW5kOiBwbGF5IGF0IGxlYXN0IG9uZSBTaW5nbGUsXCIsIFwib25lIFBhaXIsIG9uZSBUcmlwcywgYW5kIG9uZSBSdW4uXCJdXHJcbiAgfVxyXG4gIHtcclxuICAgIGlkOiBcInRyYWdlZHlcIlxyXG4gICAgdGl0bGU6IFwiVHJhZ2VkeVwiXHJcbiAgICBkZXNjcmlwdGlvbjogW1wiQmVnaW4gdGhlIGdhbWUgYnkgdGhyb3dpbmcgYSB0d28gYnJlYWtlciBpbnZvbHZpbmdcIiwgXCJ0aGUgMyBvZiBTcGFkZXMuXCJdXHJcbiAgfVxyXG4gIHtcclxuICAgIGlkOiBcImluZG9taXRhYmxlXCJcclxuICAgIHRpdGxlOiBcIkluZG9taXRhYmxlXCJcclxuICAgIGRlc2NyaXB0aW9uOiBbXCJUaHJvdyBhIHJ1biBlbmRpbmcgaW4gdGhlIEFjZSBvZiBIZWFydHMuXCJdXHJcbiAgfVxyXG4gIHtcclxuICAgIGlkOiBcInJla3RcIlxyXG4gICAgdGl0bGU6IFwiR2V0IFJla3RcIlxyXG4gICAgZGVzY3JpcHRpb246IFtcIldpbiB3aGlsZSBhbGwgb3Bwb25lbnRzIHN0aWxsIGhhdmUgMTAgb3IgbW9yZSBjYXJkcy5cIl1cclxuICB9XHJcbiAge1xyXG4gICAgaWQ6IFwibGF0ZVwiXHJcbiAgICB0aXRsZTogXCJGYXNoaW9uYWJseSBMYXRlXCJcclxuICAgIGRlc2NyaXB0aW9uOiBbXCJQYXNzIHVudGlsIGFsbCA0IDJzIGFyZSB0aHJvd24sIGFuZCB0aGVuIHdpbi5cIl1cclxuICB9XHJcbiAge1xyXG4gICAgaWQ6IFwicGFpcnNcIlxyXG4gICAgdGl0bGU6IFwiUGFpcmluZyBVcFwiXHJcbiAgICBkZXNjcmlwdGlvbjogW1wiVGhyb3cgNSBwYWlycyBpbiBhIHNpbmdsZSByb3VuZC5cIl1cclxuICB9XHJcbiAge1xyXG4gICAgaWQ6IFwieW91cnNlbGZcIlxyXG4gICAgdGl0bGU6IFwiWW91IFBsYXllZCBZb3Vyc2VsZlwiXHJcbiAgICBkZXNjcmlwdGlvbjogW1wiQmVhdCB5b3VyIG93biBwbGF5LlwiXVxyXG4gIH1cclxuICB7XHJcbiAgICBpZDogXCJ0aGlydGVlblwiXHJcbiAgICB0aXRsZTogXCJUaGlydGVlblwiXHJcbiAgICBkZXNjcmlwdGlvbjogW1wiRWFybiAxMyBhY2hpZXZlbWVudHMuXCJdXHJcbiAgfVxyXG5dXHJcblxyXG5hY2hpZXZlbWVudHNNYXAgPSB7fVxyXG5mb3IgZSBpbiBhY2hpZXZlbWVudHNMaXN0XHJcbiAgYWNoaWV2ZW1lbnRzTWFwW2UuaWRdID0gZVxyXG5cclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuIyBUaGlydGVlblxyXG5cclxuY2xhc3MgVGhpcnRlZW5cclxuICBjb25zdHJ1Y3RvcjogKEBnYW1lLCBwYXJhbXMpIC0+XHJcbiAgICByZXR1cm4gaWYgbm90IHBhcmFtc1xyXG5cclxuICAgIGlmIHBhcmFtcy5zdGF0ZVxyXG4gICAgICBmb3Igayx2IG9mIHBhcmFtcy5zdGF0ZVxyXG4gICAgICAgIGlmIHBhcmFtcy5zdGF0ZS5oYXNPd25Qcm9wZXJ0eShrKVxyXG4gICAgICAgICAgdGhpc1trXSA9IHBhcmFtcy5zdGF0ZVtrXVxyXG4gICAgICBAaW5pdEFjaGlldmVtZW50cygpXHJcbiAgICBlbHNlXHJcbiAgICAgIEBuZXdHYW1lKHBhcmFtcy5tb25leSlcclxuXHJcbiAgaW5pdEFjaGlldmVtZW50czogLT5cclxuICAgIEBhY2ggPz0ge31cclxuICAgIEBhY2guZWFybmVkID89IHt9XHJcbiAgICBAYWNoLnN0YXRlID89IHt9XHJcbiAgICBAYWNoLnN0YXRlLnRvdGFsR2FtZXMgPz0gMFxyXG4gICAgQGZhbmZhcmVzID0gW11cclxuXHJcbiAgZGVhbDogKHBhcmFtcykgLT5cclxuICAgIGRlY2sgPSBuZXcgU2h1ZmZsZWREZWNrKClcclxuICAgIGZvciBwbGF5ZXIsIHBsYXllckluZGV4IGluIEBwbGF5ZXJzXHJcbiAgICAgIEBnYW1lLmxvZyBcImRlYWxpbmcgMTMgY2FyZHMgdG8gcGxheWVyICN7cGxheWVySW5kZXh9XCJcclxuXHJcbiAgICAgIHBsYXllci5wbGFjZSA9IDBcclxuICAgICAgcGxheWVyLmhhbmQgPSBbXVxyXG4gICAgICBmb3IgaiBpbiBbMC4uLjEzXVxyXG4gICAgICAgIHJhdyA9IGRlY2suY2FyZHMuc2hpZnQoKVxyXG4gICAgICAgIGlmIHJhdyA9PSAwXHJcbiAgICAgICAgICBAdHVybiA9IHBsYXllckluZGV4XHJcbiAgICAgICAgcGxheWVyLmhhbmQucHVzaChyYXcpXHJcblxyXG4gICAgICAjIGNvbnNvbGUubG9nIFwiQGdhbWUub3B0aW9ucy5zb3J0SW5kZXggI3tAZ2FtZS5vcHRpb25zLnNvcnRJbmRleH1cIlxyXG4gICAgICBpZiAoQGdhbWUub3B0aW9ucy5zb3J0SW5kZXggPT0gMCkgb3IgcGxheWVyLmFpXHJcbiAgICAgICAgIyBOb3JtYWxcclxuICAgICAgICBwbGF5ZXIuaGFuZC5zb3J0IChhLGIpIC0+IHJldHVybiBhIC0gYlxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgIyBSZXZlcnNlXHJcbiAgICAgICAgcGxheWVyLmhhbmQuc29ydCAoYSxiKSAtPiByZXR1cm4gYiAtIGFcclxuXHJcbiAgICBAaW5pdEFjaGlldmVtZW50cygpXHJcbiAgICBAYWNoLnN0YXRlLnRocmV3U2luZ2xlID0gZmFsc2VcclxuICAgIEBhY2guc3RhdGUudGhyZXdQYWlyID0gZmFsc2VcclxuICAgIEBhY2guc3RhdGUudGhyZXdUcmlwcyA9IGZhbHNlXHJcbiAgICBAYWNoLnN0YXRlLnRocmV3UnVuID0gZmFsc2VcclxuICAgIEBhY2guc3RhdGUudGhyZXdSdW43ID0gZmFsc2VcclxuICAgIEBhY2guc3RhdGUudHdvc1NlZW4gPSAwXHJcbiAgICBAYWNoLnN0YXRlLmZhc2hpb25hYmx5TGF0ZSA9IGZhbHNlXHJcbiAgICBAYWNoLnN0YXRlLnBhaXJzVGhyb3duID0gMFxyXG4gICAgQGFjaC5zdGF0ZS5iZXN0U3RyZWFrID89IDBcclxuXHJcbiAgICBAcGlsZSA9IFtdXHJcbiAgICBAcGlsZVdobyA9IC0xXHJcbiAgICBAdGhyb3dJRCA9IDBcclxuICAgIEBjdXJyZW50UGxheSA9IG51bGxcclxuICAgIEB1bnBhc3NBbGwoKVxyXG5cclxuICAgIGZvck1vbmV5ID0gXCJcIlxyXG4gICAgaWYgQG1vbmV5XHJcbiAgICAgIGZvck1vbmV5ID0gXCIgKGZvciBtb25leSlcIlxyXG4gICAgQG91dHB1dChcIkhhbmQgZGVhbHQje2Zvck1vbmV5fSwgXCIgKyBAcGxheWVyc1tAdHVybl0ubmFtZSArIFwiIHBsYXlzIGZpcnN0XCIpXHJcblxyXG4gICAgcmV0dXJuIE9LXHJcblxyXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgIyBUaGlydGVlbiBtZXRob2RzXHJcblxyXG4gIG5ld0dhbWU6IChtb25leSA9IGZhbHNlKSAtPlxyXG4gICAgIyBuZXcgZ2FtZVxyXG4gICAgQGxvZyA9IFtdXHJcbiAgICBAc3RyZWFrID0gMFxyXG4gICAgQGxhc3RTdHJlYWsgPSAwXHJcbiAgICBAbW9uZXkgPSBmYWxzZVxyXG4gICAgaWYgbW9uZXlcclxuICAgICAgQG1vbmV5ID0gdHJ1ZVxyXG4gICAgY29uc29sZS5sb2cgXCJmb3IgbW9uZXk6ICN7QG1vbmV5fVwiXHJcblxyXG4gICAgQHBsYXllcnMgPSBbXHJcbiAgICAgIHsgaWQ6IDEsIG5hbWU6ICdQbGF5ZXInLCBpbmRleDogMCwgcGFzczogZmFsc2UsIG1vbmV5OiBTVEFSVElOR19NT05FWSB9XHJcbiAgICBdXHJcblxyXG4gICAgZm9yIGkgaW4gWzEuLi40XVxyXG4gICAgICBAYWRkQUkoKVxyXG5cclxuICAgIEBkZWFsKClcclxuXHJcbiAgc2F2ZTogLT5cclxuICAgIG5hbWVzID0gXCJsb2cgcGxheWVycyB0dXJuIHBpbGUgcGlsZVdobyB0aHJvd0lEIGN1cnJlbnRQbGF5IHN0cmVhayBsYXN0U3RyZWFrIGFjaCBtb25leVwiLnNwbGl0KFwiIFwiKVxyXG4gICAgc3RhdGUgPSB7fVxyXG4gICAgZm9yIG5hbWUgaW4gbmFtZXNcclxuICAgICAgc3RhdGVbbmFtZV0gPSB0aGlzW25hbWVdXHJcbiAgICByZXR1cm4gc3RhdGVcclxuXHJcbiAgb3V0cHV0OiAodGV4dCkgLT5cclxuICAgIEBsb2cucHVzaCB0ZXh0XHJcbiAgICB3aGlsZSBAbG9nLmxlbmd0aCA+IE1BWF9MT0dfTElORVNcclxuICAgICAgQGxvZy5zaGlmdCgpXHJcblxyXG4gIGhlYWRsaW5lOiAtPlxyXG4gICAgaWYgQGdhbWVPdmVyKClcclxuICAgICAgcmV0dXJuIFwiR2FtZSBPdmVyXCJcclxuXHJcbiAgICBpZiBAcGlsZS5sZW5ndGggPT0gMFxyXG4gICAgICBwbGF5U3RyaW5nID0gXCJ0aHJvdyBBbnl0aGluZyB3aXRoIHRoZSAzXFx4YzhcIlxyXG4gICAgZWxzZVxyXG4gICAgICBpZiBAY3VycmVudFBsYXlcclxuICAgICAgICBwbGF5U3RyaW5nID0gXCJiZWF0IFwiICsgcGxheVRvU3RyaW5nKEBjdXJyZW50UGxheSlcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHBsYXlTdHJpbmcgPSBcInRocm93IEFueXRoaW5nXCJcclxuXHJcbiAgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxyXG4gICAgaWYgY3VycmVudFBsYXllci5haVxyXG4gICAgICBwbGF5ZXJDb2xvciA9ICdiMGIwMDAnXHJcbiAgICBlbHNlXHJcbiAgICAgIHBsYXllckNvbG9yID0gJ2ZmNzcwMCdcclxuICAgIGhlYWRsaW5lID0gXCJgI3twbGF5ZXJDb2xvcn1gI3tjdXJyZW50UGxheWVyLm5hbWV9YGZmZmZmZmAgdG8gI3twbGF5U3RyaW5nfVwiXHJcbiAgICBpZiBAZXZlcnlvbmVQYXNzZWQoKVxyXG4gICAgICBoZWFkbGluZSArPSBcIiAob3IgdGhyb3cgYW55dGhpbmcpXCJcclxuICAgIHJldHVybiBoZWFkbGluZVxyXG5cclxuICBjYW5UaHJvd0FueXRoaW5nOiAtPlxyXG4gICAgaWYgQHBpbGUubGVuZ3RoID09IDBcclxuICAgICAgcmV0dXJuIHRydWVcclxuICAgIGlmIG5vdCBAY3VycmVudFBsYXlcclxuICAgICAgcmV0dXJuIHRydWVcclxuICAgIGlmIEBldmVyeW9uZVBhc3NlZCgpXHJcbiAgICAgIHJldHVybiB0cnVlXHJcbiAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgZmluZFBsYXllcjogKGlkKSAtPlxyXG4gICAgZm9yIHBsYXllciBpbiBAcGxheWVyc1xyXG4gICAgICBpZiBwbGF5ZXIuaWQgPT0gaWRcclxuICAgICAgICByZXR1cm4gcGxheWVyXHJcbiAgICByZXR1cm4gdW5kZWZpbmVkXHJcblxyXG4gIGN1cnJlbnRQbGF5ZXI6IC0+XHJcbiAgICByZXR1cm4gQHBsYXllcnNbQHR1cm5dXHJcblxyXG4gIGZpbmRQbGFjZTogKHBsYWNlKSAtPlxyXG4gICAgZm9yIHBsYXllciBpbiBAcGxheWVyc1xyXG4gICAgICBpZiAocGxhY2UgPT0gNCkgYW5kIChwbGF5ZXIucGxhY2UgPT0gMClcclxuICAgICAgICByZXR1cm4gcGxheWVyXHJcbiAgICAgIGlmIHBsYXllci5wbGFjZSA9PSBwbGFjZVxyXG4gICAgICAgIHJldHVybiBwbGF5ZXJcclxuICAgIHJldHVybiB1bmRlZmluZWRcclxuXHJcbiAgcGF5b3V0OiAtPlxyXG4gICAgcGxhY2UxID0gQGZpbmRQbGFjZSgxKVxyXG4gICAgcGxhY2UyID0gQGZpbmRQbGFjZSgyKVxyXG4gICAgcGxhY2UzID0gQGZpbmRQbGFjZSgzKVxyXG4gICAgcGxhY2U0ID0gQGZpbmRQbGFjZSg0KVxyXG5cclxuICAgIGlmIG5vdCBwbGFjZTEgb3Igbm90IHBsYWNlMiBvciBub3QgcGxhY2UzIG9yIG5vdCBwbGFjZTRcclxuICAgICAgQG91dHB1dCBcImVycm9yIHdpdGggcGF5b3V0cyFcIlxyXG4gICAgICByZXR1cm5cclxuXHJcbiAgICBAb3V0cHV0IFwiI3twbGFjZTQubmFtZX0gcGF5cyAkMiB0byAje3BsYWNlMS5uYW1lfVwiXHJcbiAgICBAb3V0cHV0IFwiI3twbGFjZTMubmFtZX0gcGF5cyAkMSB0byAje3BsYWNlMi5uYW1lfVwiXHJcblxyXG4gICAgcGxhY2UxLm1vbmV5ICs9IDJcclxuICAgIHBsYWNlMi5tb25leSArPSAxXHJcbiAgICBwbGFjZTMubW9uZXkgKz0gLTFcclxuICAgIHBsYWNlNC5tb25leSArPSAtMlxyXG4gICAgcmV0dXJuXHJcblxyXG4gICMgYWxsIElOQ0xVRElORyB0aGUgY3VycmVudCBwbGF5ZXJcclxuICBlbnRpcmVUYWJsZVBhc3NlZDogLT5cclxuICAgIGZvciBwbGF5ZXIsIHBsYXllckluZGV4IGluIEBwbGF5ZXJzXHJcbiAgICAgIGlmIHBsYXllci5wbGFjZSAhPSAwXHJcbiAgICAgICAgY29udGludWVcclxuICAgICAgaWYgbm90IHBsYXllci5wYXNzXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICAjIGFsbCBidXQgdGhlIGN1cnJlbnQgcGxheWVyXHJcbiAgZXZlcnlvbmVQYXNzZWQ6IC0+XHJcbiAgICBmb3IgcGxheWVyLCBwbGF5ZXJJbmRleCBpbiBAcGxheWVyc1xyXG4gICAgICBpZiAocGxheWVyLnBsYWNlICE9IDApIGFuZCAoQHBpbGVXaG8gIT0gcGxheWVySW5kZXgpXHJcbiAgICAgICAgY29udGludWVcclxuICAgICAgaWYgcGxheWVySW5kZXggPT0gQHR1cm5cclxuICAgICAgICBjb250aW51ZVxyXG4gICAgICBpZiBub3QgcGxheWVyLnBhc3NcclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgIHJldHVybiB0cnVlXHJcblxyXG4gIHBsYXllckFmdGVyOiAoaW5kZXgpIC0+XHJcbiAgICBsb29wXHJcbiAgICAgIGluZGV4ID0gKGluZGV4ICsgMSkgJSBAcGxheWVycy5sZW5ndGhcclxuICAgICAgaWYgQHBsYXllcnNbaW5kZXhdLnBsYWNlID09IDBcclxuICAgICAgICByZXR1cm4gaW5kZXhcclxuICAgIHJldHVybiAwICMgaW1wb3NzaWJsZT9cclxuXHJcbiAgYWRkUGxheWVyOiAocGxheWVyKSAtPlxyXG4gICAgaWYgbm90IHBsYXllci5haVxyXG4gICAgICBwbGF5ZXIuYWkgPSBmYWxzZVxyXG5cclxuICAgIEBwbGF5ZXJzLnB1c2ggcGxheWVyXHJcbiAgICBwbGF5ZXIuaW5kZXggPSBAcGxheWVycy5sZW5ndGggLSAxXHJcbiAgICBAb3V0cHV0KHBsYXllci5uYW1lICsgXCIgam9pbnMgdGhlIGdhbWVcIilcclxuXHJcbiAgbmFtZVByZXNlbnQ6IChuYW1lKSAtPlxyXG4gICAgZm9yIHBsYXllciBpbiBAcGxheWVyc1xyXG4gICAgICBpZiBwbGF5ZXIubmFtZSA9PSBuYW1lXHJcbiAgICAgICAgcmV0dXJuIHRydWVcclxuXHJcbiAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgYWRkQUk6IC0+XHJcbiAgICBsb29wXHJcbiAgICAgIGNoYXJhY3RlciA9IHJhbmRvbUNoYXJhY3RlcigpXHJcbiAgICAgIGlmIG5vdCBAbmFtZVByZXNlbnQoY2hhcmFjdGVyLm5hbWUpXHJcbiAgICAgICAgYnJlYWtcclxuXHJcbiAgICBhaSA9XHJcbiAgICAgIGNoYXJJRDogY2hhcmFjdGVyLmlkXHJcbiAgICAgIG5hbWU6IGNoYXJhY3Rlci5uYW1lXHJcbiAgICAgIGlkOiAnYWknICsgU3RyaW5nKEBwbGF5ZXJzLmxlbmd0aClcclxuICAgICAgcGFzczogZmFsc2VcclxuICAgICAgYWk6IHRydWVcclxuICAgICAgbW9uZXk6IFNUQVJUSU5HX01PTkVZXHJcblxyXG4gICAgQGFkZFBsYXllcihhaSlcclxuXHJcbiAgICBAZ2FtZS5sb2coXCJhZGRlZCBBSSBwbGF5ZXJcIilcclxuICAgIHJldHVybiBPS1xyXG5cclxuICB1cGRhdGVQbGF5ZXJIYW5kOiAoY2FyZHMpIC0+XHJcbiAgICAjIFRoaXMgbWFpbnRhaW5zIHRoZSByZW9yZ2FuaXplZCBvcmRlciBvZiB0aGUgcGxheWVyJ3MgaGFuZFxyXG4gICAgQHBsYXllcnNbMF0uaGFuZCA9IGNhcmRzLnNsaWNlKDApXHJcblxyXG4gIHdpbm5lcjogLT5cclxuICAgIGZvciBwbGF5ZXIsIGkgaW4gQHBsYXllcnNcclxuICAgICAgaWYgcGxheWVyLnBsYWNlID09IDFcclxuICAgICAgICByZXR1cm4gcGxheWVyXHJcbiAgICByZXR1cm4gbnVsbFxyXG5cclxuICBnYW1lT3ZlcjogLT5cclxuICAgIG5wID0gQG5leHRQbGFjZSgpXHJcbiAgICBpZiBAbW9uZXlcclxuICAgICAgcmV0dXJuIChucCA+IDMpXHJcbiAgICByZXR1cm4gKG5wID4gMSlcclxuXHJcbiAgaGFzQ2FyZDogKGhhbmQsIHJhd0NhcmQpIC0+XHJcbiAgICBmb3IgcmF3IGluIGhhbmRcclxuICAgICAgaWYgcmF3ID09IHJhd0NhcmRcclxuICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gIGhhc0NhcmRzOiAoaGFuZCwgcmF3Q2FyZHMpIC0+XHJcbiAgICBmb3IgcmF3IGluIHJhd0NhcmRzXHJcbiAgICAgIGlmIG5vdCBAaGFzQ2FyZChoYW5kLCByYXcpXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICByZW1vdmVDYXJkczogKGhhbmQsIHJhd0NhcmRzKSAtPlxyXG4gICAgbmV3SGFuZCA9IFtdXHJcbiAgICBmb3IgY2FyZCBpbiBoYW5kXHJcbiAgICAgIGtlZXBNZSA9IHRydWVcclxuICAgICAgZm9yIHJhdyBpbiByYXdDYXJkc1xyXG4gICAgICAgIGlmIGNhcmQgPT0gcmF3XHJcbiAgICAgICAgICBrZWVwTWUgPSBmYWxzZVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgaWYga2VlcE1lXHJcbiAgICAgICAgbmV3SGFuZC5wdXNoIGNhcmRcclxuICAgIHJldHVybiBuZXdIYW5kXHJcblxyXG4gIGNsYXNzaWZ5OiAocmF3Q2FyZHMpIC0+XHJcbiAgICBjYXJkcyA9IHJhd0NhcmRzLm1hcCAocmF3KSAtPiBuZXcgQ2FyZChyYXcpXHJcbiAgICBjYXJkcyA9IGNhcmRzLnNvcnQgKGEsIGIpIC0+IHJldHVybiBhLnJhdyAtIGIucmF3XHJcbiAgICBoaWdoZXN0UmF3ID0gY2FyZHNbY2FyZHMubGVuZ3RoIC0gMV0ucmF3XHJcblxyXG4gICAgIyBsb29rIGZvciBhIHJ1biBvZiBwYWlyc1xyXG4gICAgaWYgKGNhcmRzLmxlbmd0aCA+PSA2KSBhbmQgKChjYXJkcy5sZW5ndGggJSAyKSA9PSAwKVxyXG4gICAgICBmb3VuZFJvcCA9IHRydWVcclxuICAgICAgZm9yIGNhcmQsIGNhcmRJbmRleCBpbiBjYXJkc1xyXG4gICAgICAgIGlmIGNhcmRJbmRleCA9PSAwXHJcbiAgICAgICAgICBjb250aW51ZVxyXG4gICAgICAgIGlmIGNhcmQudmFsdWUgPT0gMTJcclxuICAgICAgICAgICMgbm8gMnMgaW4gYSBydW5cclxuICAgICAgICAgIGZvdW5kUm9wID0gZmFsc2VcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgaWYgKGNhcmRJbmRleCAlIDIpID09IDFcclxuICAgICAgICAgICMgb2RkIGNhcmQsIG11c3QgbWF0Y2ggbGFzdCBjYXJkIGV4YWN0bHlcclxuICAgICAgICAgIGlmIGNhcmQudmFsdWUgIT0gKGNhcmRzW2NhcmRJbmRleCAtIDFdLnZhbHVlKVxyXG4gICAgICAgICAgICBmb3VuZFJvcCA9IGZhbHNlXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgIyBldmVuIGNhcmQsIG11c3QgaW5jcmVtZW50XHJcbiAgICAgICAgICBpZiBjYXJkLnZhbHVlICE9IChjYXJkc1tjYXJkSW5kZXggLSAxXS52YWx1ZSArIDEpXHJcbiAgICAgICAgICAgIGZvdW5kUm9wID0gZmFsc2VcclxuICAgICAgICAgICAgYnJlYWtcclxuXHJcbiAgICAgIGlmIGZvdW5kUm9wXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdyb3AnICsgTWF0aC5mbG9vcihjYXJkcy5sZW5ndGggLyAyKVxyXG4gICAgICAgICAgaGlnaDogaGlnaGVzdFJhd1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAjIGxvb2sgZm9yIGEgcnVuXHJcbiAgICBpZiBjYXJkcy5sZW5ndGggPj0gM1xyXG4gICAgICBmb3VuZFJ1biA9IHRydWVcclxuICAgICAgZm9yIGNhcmQsIGNhcmRJbmRleCBpbiBjYXJkc1xyXG4gICAgICAgIGlmIGNhcmRJbmRleCA9PSAwXHJcbiAgICAgICAgICBjb250aW51ZVxyXG4gICAgICAgIGlmIGNhcmQudmFsdWUgPT0gMTJcclxuICAgICAgICAgICMgbm8gMnMgaW4gYSBydW5cclxuICAgICAgICAgIGZvdW5kUnVuID0gZmFsc2VcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgaWYgY2FyZC52YWx1ZSAhPSAoY2FyZHNbY2FyZEluZGV4IC0gMV0udmFsdWUgKyAxKVxyXG4gICAgICAgICAgZm91bmRSdW4gPSBmYWxzZVxyXG4gICAgICAgICAgYnJlYWtcclxuXHJcbiAgICAgIGlmIGZvdW5kUnVuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdydW4nICsgY2FyZHMubGVuZ3RoXHJcbiAgICAgICAgICBoaWdoOiBoaWdoZXN0UmF3XHJcbiAgICAgICAgfVxyXG5cclxuICAgICMgbG9vayBmb3IgWCBvZiBhIGtpbmRcclxuICAgIHJlcVZhbHVlID0gY2FyZHNbMF0udmFsdWVcclxuICAgIGZvciBjYXJkIGluIGNhcmRzXHJcbiAgICAgIGlmIGNhcmQudmFsdWUgIT0gcmVxVmFsdWVcclxuICAgICAgICByZXR1cm4gbnVsbFxyXG4gICAgdHlwZSA9ICdraW5kJyArIGNhcmRzLmxlbmd0aFxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdHlwZTogdHlwZVxyXG4gICAgICBoaWdoOiBoaWdoZXN0UmF3XHJcbiAgICB9XHJcblxyXG4gIGhhbmRIYXMzUzogKGhhbmQpIC0+XHJcbiAgICBmb3IgcmF3IGluIGhhbmRcclxuICAgICAgaWYgcmF3ID09IDBcclxuICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gIG5leHRQbGFjZTogLT5cclxuICAgIGhpZ2hlc3RQbGFjZSA9IDBcclxuICAgIGZvciBwbGF5ZXIgaW4gQHBsYXllcnNcclxuICAgICAgcGxheWVyLnBsYWNlID89IDBcclxuICAgICAgaWYgaGlnaGVzdFBsYWNlIDwgcGxheWVyLnBsYWNlXHJcbiAgICAgICAgaGlnaGVzdFBsYWNlID0gcGxheWVyLnBsYWNlXHJcbiAgICByZXR1cm4gaGlnaGVzdFBsYWNlICsgMVxyXG5cclxuICBzcGxpdFBsYXlUeXBlOiAocGxheVR5cGUpIC0+XHJcbiAgICBpZiBtYXRjaGVzID0gcGxheVR5cGUubWF0Y2goL14oW14wLTldKykoXFxkKykvKVxyXG4gICAgICByZXR1cm4gW21hdGNoZXNbMV0sIHBhcnNlSW50KG1hdGNoZXNbMl0pXVxyXG4gICAgcmV0dXJuIFtwbGF5VHlwZSwgMV1cclxuXHJcbiAgaGFzUGxheTogKGN1cnJlbnRQbGF5LCBoYW5kKSAtPlxyXG4gICAgIyBxdWljayBjaGVjay4gaWYgeW91IGRvbnQgaGF2ZSBlbm91Z2ggY2FyZHMsIHlvdSBjYW4ndCBoYXZlIGEgcGxheVxyXG4gICAgaWYgKHBsYXlUb0NhcmRDb3VudChjdXJyZW50UGxheSkgPiBoYW5kLmxlbmd0aClcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gICAgaWYgQGdhbWUub3B0aW9ucy5hdXRvcGFzc0luZGV4ID09IDJcclxuICAgICAgIyBsaW1pdGVkLCBhc3N1bWUgdGhlcmUncyBhIHBsYXkgaW4gdGhlcmUgc29tZXdoZXJlLCBpZiB0aGVyZSdzIGVub3VnaCBjYXJkc1xyXG4gICAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICAgIGxlZnRvdmVycyA9IFtdXHJcbiAgICBwbGF5cyA9IHt9XHJcbiAgICBzcGwgPSBAc3BsaXRQbGF5VHlwZShjdXJyZW50UGxheS50eXBlKVxyXG4gICAgc3dpdGNoIHNwbFswXVxyXG4gICAgICB3aGVuICdyb3AnXHJcbiAgICAgICAgbGVmdG92ZXJzID0gQGFpQ2FsY1JvcHMoaGFuZCwgcGxheXMsIHNwbFsxXSlcclxuICAgICAgd2hlbiAncnVuJ1xyXG4gICAgICAgIGxlZnRvdmVycyA9IEBhaUNhbGNSdW5zKGhhbmQsIHBsYXlzLCBmYWxzZSwgc3BsWzFdKVxyXG4gICAgICB3aGVuICdraW5kJ1xyXG4gICAgICAgIGxlZnRvdmVycyA9IEBhbENhbGNLaW5kcyhoYW5kLCBwbGF5cywgdHJ1ZSlcclxuXHJcbiAgICBwbGF5cy5raW5kMSA/PSBbXVxyXG4gICAgZm9yIGxlZnRvdmVyIGluIGxlZnRvdmVyc1xyXG4gICAgICBwbGF5cy5raW5kMS5wdXNoIFtsZWZ0b3Zlcl1cclxuXHJcbiAgICBpZiBwbGF5c1tjdXJyZW50UGxheS50eXBlXT8gYW5kIHBsYXlzW2N1cnJlbnRQbGF5LnR5cGVdLmxlbmd0aCA+IDBcclxuICAgICAgICBmb3IgcGxheSBpbiBwbGF5c1tjdXJyZW50UGxheS50eXBlXVxyXG4gICAgICAgICAgaWYgQGhpZ2hlc3RDYXJkKHBsYXkpID4gY3VycmVudFBsYXkuaGlnaFxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICAgICMgc3BlY2lhbCBjYXNlIGtpbmRzXHJcbiAgICBpZiBzcGxbMF0gPT0gJ2tpbmQnXHJcbiAgICAgICMgY2hlY2sgYmlnZ2VyIGtpbmRzXHJcbiAgICAgIGZvciBiaWdnZXJLaW5kIGluIFtzcGxbMV0uLjRdXHJcbiAgICAgICAgYmlnZ2VyVHlwZSA9IFwia2luZCN7YmlnZ2VyS2luZH1cIlxyXG4gICAgICAgIGlmIHBsYXlzW2JpZ2dlclR5cGVdPyBhbmQgcGxheXNbYmlnZ2VyVHlwZV0ubGVuZ3RoID4gMFxyXG4gICAgICAgICAgICBmb3IgcGxheSBpbiBwbGF5c1tiaWdnZXJUeXBlXVxyXG4gICAgICAgICAgICAgIGlmIEBoaWdoZXN0Q2FyZChwbGF5KSA+IGN1cnJlbnRQbGF5LmhpZ2hcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXHJcblxyXG4gICAgIyBubyBwbGF5cywgcGFzc1xyXG4gICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gIGNhblBhc3M6IChwYXJhbXMpIC0+XHJcbiAgICBpZiBAZ2FtZU92ZXIoKVxyXG4gICAgICByZXR1cm4gJ2dhbWVPdmVyJ1xyXG5cclxuICAgIGN1cnJlbnRQbGF5ZXIgPSBAY3VycmVudFBsYXllcigpXHJcbiAgICBpZiBwYXJhbXMuaWQgIT0gY3VycmVudFBsYXllci5pZFxyXG4gICAgICByZXR1cm4gJ25vdFlvdXJUdXJuJ1xyXG5cclxuICAgIGlmIEBwaWxlLmxlbmd0aCA9PSAwXHJcbiAgICAgIHJldHVybiAnbXVzdFRocm93M1MnXHJcblxyXG4gICAgaWYgQGV2ZXJ5b25lUGFzc2VkKClcclxuICAgICAgcmV0dXJuICd0aHJvd0FueXRoaW5nJ1xyXG5cclxuICAgIHJldHVybiBPS1xyXG5cclxuICBjYW5QbGF5OiAocGFyYW1zLCBpbmNvbWluZ1BsYXksIGhhbmRIYXMzUykgLT5cclxuICAgIGlmIEBnYW1lT3ZlcigpXHJcbiAgICAgIHJldHVybiAnZ2FtZU92ZXInXHJcblxyXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcclxuICAgIGlmIHBhcmFtcy5pZCAhPSBjdXJyZW50UGxheWVyLmlkXHJcbiAgICAgIHJldHVybiAnbm90WW91clR1cm4nXHJcblxyXG4gICAgaWYgaW5jb21pbmdQbGF5ID09IG51bGxcclxuICAgICAgcmV0dXJuICdpbnZhbGlkUGxheSdcclxuXHJcbiAgICBpZiBAcGlsZS5sZW5ndGggPT0gMFxyXG4gICAgICBpZiBub3QgaGFuZEhhczNTXHJcbiAgICAgICAgcmV0dXJuICdtdXN0VGhyb3czUydcclxuXHJcbiAgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxyXG4gICAgaWYgY3VycmVudFBsYXllci5wYXNzXHJcbiAgICAgIGlmIEBjdXJyZW50UGxheSBhbmQgQGNhbkJlQnJva2VuKEBjdXJyZW50UGxheSlcclxuICAgICAgICBpZiBAaXNCcmVha2VyVHlwZShpbmNvbWluZ1BsYXkudHlwZSlcclxuICAgICAgICAgIHJldHVybiBPS1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIHJldHVybiAnbXVzdEJyZWFrT3JQYXNzJ1xyXG4gICAgICByZXR1cm4gJ211c3RQYXNzJ1xyXG5cclxuICAgIGlmIEBjdXJyZW50UGxheSA9PSBudWxsXHJcbiAgICAgIHJldHVybiBPS1xyXG5cclxuICAgIGlmIEBldmVyeW9uZVBhc3NlZCgpXHJcbiAgICAgIHJldHVybiBPS1xyXG5cclxuICAgIGlmIEBjYW5CZUJyb2tlbihAY3VycmVudFBsYXkpIGFuZCBAaXNCcmVha2VyVHlwZShpbmNvbWluZ1BsYXkudHlwZSlcclxuICAgICAgIyAyIGJyZWFrZXIhXHJcbiAgICAgIHJldHVybiBPS1xyXG5cclxuICAgIGlmIGluY29taW5nUGxheS50eXBlICE9IEBjdXJyZW50UGxheS50eXBlXHJcbiAgICAgIHJldHVybiAnd3JvbmdQbGF5J1xyXG5cclxuICAgIGlmIGluY29taW5nUGxheS5oaWdoIDwgQGN1cnJlbnRQbGF5LmhpZ2hcclxuICAgICAgcmV0dXJuICd0b29Mb3dQbGF5J1xyXG5cclxuICAgIHJldHVybiBPS1xyXG5cclxuICBwbGF5OiAocGFyYW1zKSAtPlxyXG4gICAgaW5jb21pbmdQbGF5ID0gQGNsYXNzaWZ5KHBhcmFtcy5jYXJkcylcclxuICAgIGNvbnNvbGUubG9nIFwiaW5jb21pbmdQbGF5XCIsIGluY29taW5nUGxheVxyXG5cclxuICAgIGNvbnNvbGUubG9nIFwic29tZW9uZSBjYWxsaW5nIHBsYXlcIiwgcGFyYW1zXHJcbiAgICByZXQgPSBAY2FuUGxheShwYXJhbXMsIGluY29taW5nUGxheSwgQGhhbmRIYXMzUyhwYXJhbXMuY2FyZHMpKVxyXG4gICAgaWYgcmV0ICE9IE9LXHJcbiAgICAgIHJldHVybiByZXRcclxuXHJcbiAgICBicmVha2VyVGhyb3duID0gZmFsc2VcclxuICAgIG5ld1Rocm93ID0gdHJ1ZVxyXG5cclxuICAgICMgVE9ETzogbWFrZSBwcmV0dHkgbmFtZXMgYmFzZWQgb24gdGhlIHBsYXksIGFkZCBwbGF5IHRvIGhlYWRsaW5lXHJcbiAgICB2ZXJiID0gXCJ0aHJvd3M6XCJcclxuICAgIGlmIEBjdXJyZW50UGxheVxyXG4gICAgICBpZiBAY2FuQmVCcm9rZW4oQGN1cnJlbnRQbGF5KSBhbmQgQGlzQnJlYWtlclR5cGUoaW5jb21pbmdQbGF5LnR5cGUpXHJcbiAgICAgICAgIyAyIGJyZWFrZXIhXHJcbiAgICAgICAgQHVucGFzc0FsbCgpXHJcbiAgICAgICAgdmVyYiA9IFwiYnJlYWtzIDI6XCJcclxuICAgICAgICBicmVha2VyVGhyb3duID0gdHJ1ZVxyXG4gICAgICAgIG5ld1Rocm93ID0gZmFsc2VcclxuICAgICAgZWxzZSBpZiAoaW5jb21pbmdQbGF5LnR5cGUgIT0gQGN1cnJlbnRQbGF5LnR5cGUpIG9yIChpbmNvbWluZ1BsYXkuaGlnaCA8IEBjdXJyZW50UGxheS5oaWdoKVxyXG4gICAgICAgICMgTmV3IHBsYXkhXHJcbiAgICAgICAgQHVucGFzc0FsbCgpXHJcbiAgICAgICAgdmVyYiA9IFwidGhyb3dzIG5ldzpcIlxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgbmV3VGhyb3cgPSBmYWxzZVxyXG4gICAgZWxzZVxyXG4gICAgICB2ZXJiID0gXCJiZWdpbnM6XCJcclxuXHJcbiAgICAjIEFjaGlldmVtZW50c1xyXG4gICAgQGFjaC5zdGF0ZS50d29zU2VlbiA/PSAwXHJcbiAgICBAYWNoLnN0YXRlLnBhaXJzVGhyb3duID89IDBcclxuICAgIGZvciBjYXJkIGluIHBhcmFtcy5jYXJkc1xyXG4gICAgICBpZiBjYXJkID49IDQ4XHJcbiAgICAgICAgQGFjaC5zdGF0ZS50d29zU2VlbiArPSAxXHJcbiAgICBpZiAoQGFjaC5zdGF0ZS50d29zU2VlbiA9PSA0KSBhbmQgKEBwbGF5ZXJzWzBdLmhhbmQubGVuZ3RoID09IDEzKVxyXG4gICAgICBAYWNoLnN0YXRlLmZhc2hpb25hYmx5TGF0ZSA9IHRydWVcclxuICAgIGNvbnNvbGUubG9nIFwiQGFjaC5zdGF0ZS5mYXNoaW9uYWJseUxhdGUgI3tAYWNoLnN0YXRlLmZhc2hpb25hYmx5TGF0ZX1cIlxyXG4gICAgaWYgQHR1cm4gPT0gMFxyXG4gICAgICBpZiBAZXZlcnlvbmVQYXNzZWQoKSBhbmQgbm90IG5ld1Rocm93XHJcbiAgICAgICAgQGVhcm4gXCJ5b3Vyc2VsZlwiXHJcbiAgICAgIGlmIGluY29taW5nUGxheS50eXBlID09ICdraW5kMidcclxuICAgICAgICBAYWNoLnN0YXRlLnBhaXJzVGhyb3duICs9IDFcclxuICAgICAgICBpZiBAYWNoLnN0YXRlLnBhaXJzVGhyb3duID49IDVcclxuICAgICAgICAgIEBlYXJuIFwicGFpcnNcIlxyXG4gICAgICBpZiBicmVha2VyVGhyb3duXHJcbiAgICAgICAgQGVhcm4gXCJicmVha2VyXCJcclxuICAgICAgaWYgQGlzQnJlYWtlclR5cGUoaW5jb21pbmdQbGF5LnR5cGUpIGFuZCAoQHBpbGUubGVuZ3RoID09IDApXHJcbiAgICAgICAgQGVhcm4gXCJ0cmFnZWR5XCJcclxuICAgICAgaWYgQGlzUnVuVHlwZShpbmNvbWluZ1BsYXkudHlwZSkgYW5kIEBpc1N1aXRlZChwYXJhbXMuY2FyZHMpXHJcbiAgICAgICAgQGVhcm4gXCJzdWl0ZWRcIlxyXG4gICAgICBpZiBAY3VycmVudFBsYXkgYW5kIChAY3VycmVudFBsYXkudHlwZSA9PSAna2luZDEnKSBhbmQgKEBjdXJyZW50UGxheS5oaWdoIDw9IDMpIGFuZCAoaW5jb21pbmdQbGF5LnR5cGUgPT0gJ2tpbmQxJykgYW5kIChpbmNvbWluZ1BsYXkuaGlnaCA+PSA0OClcclxuICAgICAgICBAZWFybiBcImtlZXBpdGxvd1wiXHJcbiAgICAgIGlmIEBpc1J1blR5cGUoaW5jb21pbmdQbGF5LnR5cGUpIGFuZCAoaW5jb21pbmdQbGF5LmhpZ2ggPT0gNDcpICMgQWNlIG9mIEhlYXJ0c1xyXG4gICAgICAgIEBlYXJuIFwiaW5kb21pdGFibGVcIlxyXG4gICAgICBpZiBAaXNCaWdSdW4oaW5jb21pbmdQbGF5LCA3KVxyXG4gICAgICAgIGNvbnNvbGUubG9nIFwidGhyZXdSdW43OiB0cnVlXCJcclxuICAgICAgICBAYWNoLnN0YXRlLnRocmV3UnVuNyA9IHRydWVcclxuICAgICAgaWYgaW5jb21pbmdQbGF5LnR5cGUgPT0gJ2tpbmQxJ1xyXG4gICAgICAgIEBhY2guc3RhdGUudGhyZXdTaW5nbGUgPSB0cnVlXHJcbiAgICAgIGlmIGluY29taW5nUGxheS50eXBlID09ICdraW5kMidcclxuICAgICAgICBAYWNoLnN0YXRlLnRocmV3UGFpciA9IHRydWVcclxuICAgICAgaWYgaW5jb21pbmdQbGF5LnR5cGUgPT0gJ2tpbmQzJ1xyXG4gICAgICAgIEBhY2guc3RhdGUudGhyZXdUcmlwcyA9IHRydWVcclxuICAgICAgaWYgaW5jb21pbmdQbGF5LnR5cGUubWF0Y2goL15ydW4vKVxyXG4gICAgICAgIEBhY2guc3RhdGUudGhyZXdSdW4gPSB0cnVlXHJcbiAgICAgIGlmIEBhY2guc3RhdGUudGhyZXdTaW5nbGUgYW5kIEBhY2guc3RhdGUudGhyZXdQYWlyIGFuZCBAYWNoLnN0YXRlLnRocmV3VHJpcHMgYW5kIEBhY2guc3RhdGUudGhyZXdSdW5cclxuICAgICAgICBAZWFybiBcInNhbXBsZXJcIlxyXG5cclxuICAgIEBjdXJyZW50UGxheSA9IGluY29taW5nUGxheVxyXG5cclxuICAgIEB0aHJvd0lEICs9IDFcclxuICAgIGN1cnJlbnRQbGF5ZXIgPSBAY3VycmVudFBsYXllcigpXHJcbiAgICBjdXJyZW50UGxheWVyLmhhbmQgPSBAcmVtb3ZlQ2FyZHMoY3VycmVudFBsYXllci5oYW5kLCBwYXJhbXMuY2FyZHMpXHJcblxyXG4gICAgQG91dHB1dChcIiN7Y3VycmVudFBsYXllci5uYW1lfSAje3ZlcmJ9ICN7cGxheVRvU3RyaW5nKGluY29taW5nUGxheSl9XCIpXHJcblxyXG4gICAgaWYgY3VycmVudFBsYXllci5oYW5kLmxlbmd0aCA9PSAwXHJcbiAgICAgICMgR2FtZSBvdmVyISBkbyBnYW1lb3ZlciB0aGluZ3MuXHJcblxyXG4gICAgICBjdXJyZW50UGxheWVyLnBsYWNlID0gQG5leHRQbGFjZSgpXHJcblxyXG4gICAgICBpZiBAbW9uZXlcclxuICAgICAgICBwbGFjZVN0cmluZyA9IFwiNHRoXCJcclxuICAgICAgICBpZiBjdXJyZW50UGxheWVyLnBsYWNlID09IDFcclxuICAgICAgICAgIHBsYWNlU3RyaW5nID0gXCIxc3RcIlxyXG4gICAgICAgIGVsc2UgaWYgY3VycmVudFBsYXllci5wbGFjZSA9PSAyXHJcbiAgICAgICAgICBwbGFjZVN0cmluZyA9IFwiMm5kXCJcclxuICAgICAgICBlbHNlIGlmIGN1cnJlbnRQbGF5ZXIucGxhY2UgPT0gM1xyXG4gICAgICAgICAgcGxhY2VTdHJpbmcgPSBcIjNyZFwiXHJcbiAgICAgICAgQG91dHB1dChcIiN7Y3VycmVudFBsYXllci5uYW1lfSB0YWtlcyAje3BsYWNlU3RyaW5nfSBwbGFjZVwiKVxyXG5cclxuICAgICAgICBpZiBjdXJyZW50UGxheWVyLnBsYWNlID09IDNcclxuICAgICAgICAgIEBwYXlvdXQoKVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgQG91dHB1dChcIiN7Y3VycmVudFBsYXllci5uYW1lfSB3aW5zIVwiKVxyXG5cclxuICAgICAgaWYgY3VycmVudFBsYXllci5wbGFjZSA9PSAxXHJcbiAgICAgICAgaWYgQHR1cm4gPT0gMFxyXG4gICAgICAgICAgQHN0cmVhayArPSAxXHJcbiAgICAgICAgICBAbGFzdFN0cmVhayA9IEBzdHJlYWtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBAbGFzdFN0cmVhayA9IEBzdHJlYWtcclxuICAgICAgICAgIEBzdHJlYWsgPSAwXHJcblxyXG4gICAgICBAYWNoLnN0YXRlLmJlc3RTdHJlYWsgPz0gMFxyXG4gICAgICBpZiBAYWNoLnN0YXRlLmJlc3RTdHJlYWsgPCBAbGFzdFN0cmVha1xyXG4gICAgICAgIEBhY2guc3RhdGUuYmVzdFN0cmVhayA9IEBsYXN0U3RyZWFrXHJcblxyXG4gICAgICAjIEFjaGlldmVtZW50c1xyXG4gICAgICBpZiBAYWNoLnN0YXRlLmJlc3RTdHJlYWsgPj0gNVxyXG4gICAgICAgIEBlYXJuIFwidHJ5aGFyZFwiXHJcbiAgICAgIEBhY2guc3RhdGUudG90YWxHYW1lcyArPSAxXHJcbiAgICAgIGlmIEBhY2guc3RhdGUudG90YWxHYW1lcyA+PSA1MFxyXG4gICAgICAgIEBlYXJuIFwidmV0ZXJhblwiXHJcbiAgICAgIGlmIGN1cnJlbnRQbGF5ZXIucGxhY2UgPT0gMVxyXG4gICAgICAgIGlmIEB0dXJuID09IDBcclxuICAgICAgICAgICMgcGxheWVyIHdvblxyXG4gICAgICAgICAgaWYgKEBwbGF5ZXJzWzFdLmhhbmQubGVuZ3RoID49IDEwKSBhbmQgKEBwbGF5ZXJzWzJdLmhhbmQubGVuZ3RoID49IDEwKSBhbmQgKEBwbGF5ZXJzWzNdLmhhbmQubGVuZ3RoID49IDEwKVxyXG4gICAgICAgICAgICBAZWFybiBcInJla3RcIlxyXG4gICAgICAgICAgaWYgQGFjaC5zdGF0ZS5mYXNoaW9uYWJseUxhdGVcclxuICAgICAgICAgICAgQGVhcm4gXCJsYXRlXCJcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAjIHBsYXllciBsb3N0XHJcbiAgICAgICAgICBpZiBAYWNoLnN0YXRlLnRocmV3UnVuN1xyXG4gICAgICAgICAgICBAZWFybiBcInRvbnlcIlxyXG5cclxuICAgIGFjaGlldmVtZW50Q291bnQgPSAwXHJcbiAgICBmb3IgYWNoaWV2ZW1lbnQgaW4gYWNoaWV2ZW1lbnRzTGlzdFxyXG4gICAgICBpZiBAYWNoLmVhcm5lZFthY2hpZXZlbWVudC5pZF1cclxuICAgICAgICBhY2hpZXZlbWVudENvdW50ICs9IDFcclxuICAgIGlmIGFjaGlldmVtZW50Q291bnQgPj0gMTNcclxuICAgICAgQGVhcm4gXCJ0aGlydGVlblwiXHJcblxyXG4gICAgQHBpbGUgPSBwYXJhbXMuY2FyZHMuc2xpY2UoMClcclxuICAgIEBwaWxlV2hvID0gQHR1cm5cclxuXHJcbiAgICBAdHVybiA9IEBwbGF5ZXJBZnRlcihAdHVybilcclxuICAgIHJldHVybiBPS1xyXG5cclxuICB1bnBhc3NBbGw6IC0+XHJcbiAgICBmb3IgcGxheWVyIGluIEBwbGF5ZXJzXHJcbiAgICAgIHBsYXllci5wYXNzID0gZmFsc2VcclxuICAgIHJldHVyblxyXG5cclxuICBwYXNzOiAocGFyYW1zKSAtPlxyXG4gICAgcmV0ID0gQGNhblBhc3MocGFyYW1zKVxyXG4gICAgaWYgcmV0ICE9IE9LXHJcbiAgICAgIHJldHVybiByZXRcclxuXHJcbiAgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxyXG4gICAgaWYgbm90IGN1cnJlbnRQbGF5ZXIuYWkgYW5kIEBjdXJyZW50UGxheSBhbmQgbm90IEBoYXNQbGF5KEBjdXJyZW50UGxheSwgY3VycmVudFBsYXllci5oYW5kKVxyXG4gICAgICBAb3V0cHV0KFwiI3tjdXJyZW50UGxheWVyLm5hbWV9IGF1dG8tcGFzc2VzIChubyBwbGF5cylcIilcclxuICAgIGVsc2UgaWYgY3VycmVudFBsYXllci5wYXNzXHJcbiAgICAgIEBvdXRwdXQoXCIje2N1cnJlbnRQbGF5ZXIubmFtZX0gYXV0by1wYXNzZXNcIilcclxuICAgIGVsc2VcclxuICAgICAgQG91dHB1dChcIiN7Y3VycmVudFBsYXllci5uYW1lfSBwYXNzZXNcIilcclxuICAgIGN1cnJlbnRQbGF5ZXIucGFzcyA9IHRydWVcclxuICAgIEB0dXJuID0gQHBsYXllckFmdGVyKEB0dXJuKVxyXG4gICAgcmV0dXJuIE9LXHJcblxyXG4gIGFpUGxheTogKGN1cnJlbnRQbGF5ZXIsIGNhcmRzKSAtPlxyXG4gICAgcmV0dXJuIEBwbGF5KHsnaWQnOmN1cnJlbnRQbGF5ZXIuaWQsICdjYXJkcyc6Y2FyZHN9KVxyXG5cclxuICBhaVBhc3M6IChjdXJyZW50UGxheWVyKSAtPlxyXG4gICAgcmV0dXJuIEBwYXNzKHsnaWQnOmN1cnJlbnRQbGF5ZXIuaWR9KVxyXG5cclxuICBlYXJuOiAoaWQpIC0+XHJcbiAgICBpZiBAYWNoLmVhcm5lZFtpZF1cclxuICAgICAgcmV0dXJuXHJcbiAgICBhY2hpZXZlbWVudCA9IGFjaGlldmVtZW50c01hcFtpZF1cclxuICAgIGlmIG5vdCBhY2hpZXZlbWVudD9cclxuICAgICAgcmV0dXJuXHJcblxyXG4gICAgQGFjaC5lYXJuZWRbaWRdID0gdHJ1ZVxyXG4gICAgQG91dHB1dChcIkVhcm5lZDogI3thY2hpZXZlbWVudC50aXRsZX1cIilcclxuICAgIEBmYW5mYXJlcy5wdXNoIGFjaGlldmVtZW50LnRpdGxlXHJcblxyXG5cclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICMgQUlcclxuXHJcbiAgIyBHZW5lcmljIGxvZ2dpbmcgZnVuY3Rpb247IHByZXBlbmRzIGN1cnJlbnQgQUkgcGxheWVyJ3MgZ3V0cyBiZWZvcmUgcHJpbnRpbmcgdGV4dFxyXG4gIGFpTG9nOiAodGV4dCkgLT5cclxuICAgIGN1cnJlbnRQbGF5ZXIgPSBAY3VycmVudFBsYXllcigpXHJcbiAgICBpZiBub3QgY3VycmVudFBsYXllci5haVxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgICBjaGFyYWN0ZXIgPSBhaUNoYXJhY3RlcnNbY3VycmVudFBsYXllci5jaGFySURdXHJcbiAgICBAZ2FtZS5sb2coJ0FJWycrY3VycmVudFBsYXllci5uYW1lKycgJytjaGFyYWN0ZXIuYnJhaW4rJ106IGhhbmQ6JytjYXJkc1RvU3RyaW5nKGN1cnJlbnRQbGF5ZXIuaGFuZCkrJyBwaWxlOicrY2FyZHNUb1N0cmluZyhAcGlsZSkrJyAnK3RleHQpXHJcblxyXG4gICMgRGV0ZWN0cyBpZiB0aGUgY3VycmVudCBwbGF5ZXIgaXMgQUkgZHVyaW5nIGEgQklEIG9yIFRSSUNLIHBoYXNlIGFuZCBhY3RzIGFjY29yZGluZyB0byB0aGVpciAnYnJhaW4nXHJcbiAgYWlUaWNrOiAtPlxyXG4gICAgaWYgQGdhbWVPdmVyKClcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gICAgaWYgQGVudGlyZVRhYmxlUGFzc2VkKClcclxuICAgICAgQHR1cm4gPSBAcGxheWVyQWZ0ZXIoQHBpbGVXaG8pXHJcbiAgICAgIEB1bnBhc3NBbGwoKVxyXG4gICAgICBAY3VycmVudFBsYXkgPSBudWxsXHJcbiAgICAgIEBvdXRwdXQoJ1dob2xlIHRhYmxlIHBhc3NlcywgY29udHJvbCB0byAnICsgQHBsYXllcnNbQHR1cm5dLm5hbWUpXHJcblxyXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcclxuICAgIGlmIG5vdCBjdXJyZW50UGxheWVyLmFpXHJcbiAgICAgIGlmIEBnYW1lLm9wdGlvbnMuYXV0b3Bhc3NJbmRleCAhPSAwICMgTm90IGRpc2FibGVkXHJcbiAgICAgICAgaWYgbm90IEBjYW5UaHJvd0FueXRoaW5nKClcclxuICAgICAgICAgIGlmIEBjdXJyZW50UGxheSBhbmQgKEBjdXJyZW50UGxheS50eXBlID09ICdraW5kMScpIGFuZCAoQGN1cnJlbnRQbGF5LmhpZ2ggPj0gNDgpIGFuZCBAaGFzQnJlYWtlcihjdXJyZW50UGxheWVyLmhhbmQpXHJcbiAgICAgICAgICAgICMgZG8gbm90aGluZywgcGxheWVyIGNhbiBkcm9wIGEgYnJlYWtlclxyXG4gICAgICAgICAgZWxzZSBpZiBAY3VycmVudFBsYXkgYW5kIG5vdCBAaGFzUGxheShAY3VycmVudFBsYXksIGN1cnJlbnRQbGF5ZXIuaGFuZClcclxuICAgICAgICAgICAgQGFpTG9nKFwiYXV0b3Bhc3NpbmcgZm9yIHBsYXllciwgbm8gcGxheXNcIilcclxuICAgICAgICAgICAgQGFpUGFzcyhjdXJyZW50UGxheWVyKVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgICAgZWxzZSBpZiBjdXJyZW50UGxheWVyLnBhc3NcclxuICAgICAgICAgICAgQGFpTG9nKFwiYXV0b3Bhc3NpbmcgZm9yIHBsYXllclwiKVxyXG4gICAgICAgICAgICBAYWlQYXNzKGN1cnJlbnRQbGF5ZXIpXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG5cclxuICAgIGNoYXJhY3RlciA9IGFpQ2hhcmFjdGVyc1tjdXJyZW50UGxheWVyLmNoYXJJRF1cclxuICAgIHJldCA9IEBicmFpbnNbY2hhcmFjdGVyLmJyYWluXS5wbGF5LmFwcGx5KHRoaXMsIFtjdXJyZW50UGxheWVyLCBAY3VycmVudFBsYXksIEBldmVyeW9uZVBhc3NlZCgpXSlcclxuICAgIGlmIHJldCA9PSBPS1xyXG4gICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gIGFsQ2FsY0tpbmRzOiAoaGFuZCwgcGxheXMsIG1hdGNoMnMgPSBmYWxzZSkgLT5cclxuICAgIGNhcmRzID0gaGFuZC5tYXAgKHJhdykgLT4gbmV3IENhcmQocmF3KVxyXG4gICAgY2FyZHMgPSBjYXJkcy5zb3J0IChhLCBiKSAtPiByZXR1cm4gYS5yYXcgLSBiLnJhd1xyXG4gICAgdmFsdWVBcnJheXMgPSBbXVxyXG4gICAgZm9yIGkgaW4gWzAuLi4xM11cclxuICAgICAgdmFsdWVBcnJheXMucHVzaCBbXVxyXG4gICAgZm9yIGNhcmQgaW4gY2FyZHNcclxuICAgICAgdmFsdWVBcnJheXNbY2FyZC52YWx1ZV0ucHVzaChjYXJkKVxyXG5cclxuICAgIGhhbmQgPSBbXVxyXG4gICAgZm9yIHZhbHVlQXJyYXksIHZhbHVlIGluIHZhbHVlQXJyYXlzXHJcbiAgICAgIGlmICh2YWx1ZUFycmF5Lmxlbmd0aCA+IDEpIGFuZCAobWF0Y2gycyBvciAodmFsdWUgPCAxMikpXHJcbiAgICAgICAga2V5ID0gXCJraW5kI3t2YWx1ZUFycmF5Lmxlbmd0aH1cIlxyXG4gICAgICAgIHBsYXlzW2tleV0gPz0gW11cclxuICAgICAgICBwbGF5c1trZXldLnB1c2ggdmFsdWVBcnJheS5tYXAgKHYpIC0+IHYucmF3XHJcbiAgICAgIGVsc2VcclxuICAgICAgICBmb3IgdiBpbiB2YWx1ZUFycmF5XHJcbiAgICAgICAgICBoYW5kLnB1c2ggdi5yYXdcclxuXHJcbiAgICByZXR1cm4gaGFuZFxyXG5cclxuICBhaUZpbmRSdW5zOiAoaGFuZCwgZWFjaFNpemUsIHNpemUsIHByZWZlclN0cm9uZ1J1bnMgPSBmYWxzZSkgLT5cclxuICAgIHJ1bnMgPSBbXVxyXG5cclxuICAgIGNhcmRzID0gaGFuZC5tYXAgKHJhdykgLT4gbmV3IENhcmQocmF3KVxyXG4gICAgY2FyZHMgPSBjYXJkcy5zb3J0IChhLCBiKSAtPiByZXR1cm4gYS5yYXcgLSBiLnJhd1xyXG4gICAgdmFsdWVBcnJheXMgPSBbXVxyXG4gICAgZm9yIGkgaW4gWzAuLi4xM11cclxuICAgICAgdmFsdWVBcnJheXMucHVzaCBbXVxyXG4gICAgZm9yIGNhcmQgaW4gY2FyZHNcclxuICAgICAgdmFsdWVBcnJheXNbY2FyZC52YWx1ZV0ucHVzaChjYXJkKVxyXG5cclxuICAgIGlmIHByZWZlclN0cm9uZ1J1bnNcclxuICAgICAgZmlyc3RTdGFydGluZ1ZhbHVlID0gMTIgLSBzaXplXHJcbiAgICAgIGxhc3RTdGFydGluZ1ZhbHVlID0gMFxyXG4gICAgICBieUFtb3VudCA9IC0xXHJcbiAgICBlbHNlXHJcbiAgICAgIGZpcnN0U3RhcnRpbmdWYWx1ZSA9IDBcclxuICAgICAgbGFzdFN0YXJ0aW5nVmFsdWUgPSAxMiAtIHNpemVcclxuICAgICAgYnlBbW91bnQgPSAxXHJcbiAgICBmb3Igc3RhcnRpbmdWYWx1ZSBpbiBbZmlyc3RTdGFydGluZ1ZhbHVlLi5sYXN0U3RhcnRpbmdWYWx1ZV0gYnkgYnlBbW91bnRcclxuICAgICAgcnVuRm91bmQgPSB0cnVlXHJcbiAgICAgIGZvciBvZmZzZXQgaW4gWzAuLi5zaXplXVxyXG4gICAgICAgIGlmIHZhbHVlQXJyYXlzW3N0YXJ0aW5nVmFsdWUrb2Zmc2V0XS5sZW5ndGggPCBlYWNoU2l6ZVxyXG4gICAgICAgICAgcnVuRm91bmQgPSBmYWxzZVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgaWYgcnVuRm91bmRcclxuICAgICAgICBydW4gPSBbXVxyXG4gICAgICAgIGZvciBvZmZzZXQgaW4gWzAuLi5zaXplXVxyXG4gICAgICAgICAgZm9yIGVhY2ggaW4gWzAuLi5lYWNoU2l6ZV1cclxuICAgICAgICAgICAgcnVuLnB1c2godmFsdWVBcnJheXNbc3RhcnRpbmdWYWx1ZStvZmZzZXRdLnBvcCgpLnJhdylcclxuICAgICAgICBydW5zLnB1c2ggcnVuXHJcblxyXG4gICAgbGVmdG92ZXJzID0gW11cclxuICAgIGZvciB2YWx1ZUFycmF5IGluIHZhbHVlQXJyYXlzXHJcbiAgICAgIGZvciBjYXJkIGluIHZhbHVlQXJyYXlcclxuICAgICAgICBsZWZ0b3ZlcnMucHVzaCBjYXJkLnJhd1xyXG5cclxuICAgIHJldHVybiBbcnVucywgbGVmdG92ZXJzXVxyXG5cclxuICBhaUNhbGNSdW5zOiAoaGFuZCwgcGxheXMsIHNtYWxsUnVucywgc2luZ2xlU2l6ZSA9IG51bGwpIC0+XHJcbiAgICBpZiBzaW5nbGVTaXplICE9IG51bGxcclxuICAgICAgcHJlZmVyU3Ryb25nUnVucyA9IHRydWVcclxuICAgICAgc3RhcnRTaXplID0gc2luZ2xlU2l6ZVxyXG4gICAgICBlbmRTaXplID0gc2luZ2xlU2l6ZVxyXG4gICAgICBieUFtb3VudCA9IDFcclxuICAgIGVsc2VcclxuICAgICAgcHJlZmVyU3Ryb25nUnVucyA9IGZhbHNlXHJcbiAgICAgIGlmIHNtYWxsUnVuc1xyXG4gICAgICAgIHN0YXJ0U2l6ZSA9IDNcclxuICAgICAgICBlbmRTaXplID0gMTJcclxuICAgICAgICBieUFtb3VudCA9IDFcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHN0YXJ0U2l6ZSA9IDEyXHJcbiAgICAgICAgZW5kU2l6ZSA9IDNcclxuICAgICAgICBieUFtb3VudCA9IC0xXHJcbiAgICBmb3IgcnVuU2l6ZSBpbiBbc3RhcnRTaXplLi5lbmRTaXplXSBieSBieUFtb3VudFxyXG4gICAgICBbcnVucywgbGVmdG92ZXJzXSA9IEBhaUZpbmRSdW5zKGhhbmQsIDEsIHJ1blNpemUsIHByZWZlclN0cm9uZ1J1bnMpXHJcbiAgICAgIGlmIHJ1bnMubGVuZ3RoID4gMFxyXG4gICAgICAgIGtleSA9IFwicnVuI3tydW5TaXplfVwiXHJcbiAgICAgICAgcGxheXNba2V5XSA9IHJ1bnNcclxuICAgICAgaGFuZCA9IGxlZnRvdmVyc1xyXG5cclxuICAgIHJldHVybiBoYW5kXHJcblxyXG4gIGFpQ2FsY1JvcHM6IChoYW5kLCBwbGF5cywgc2luZ2xlU2l6ZSA9IG51bGwpIC0+XHJcbiAgICBpZiBzaW5nbGVTaXplICE9IG51bGxcclxuICAgICAgcHJlZmVyU3Ryb25nUnVucyA9IHRydWVcclxuICAgICAgc3RhcnRTaXplID0gc2luZ2xlU2l6ZVxyXG4gICAgICBlbmRTaXplID0gc2luZ2xlU2l6ZVxyXG4gICAgZWxzZVxyXG4gICAgICBwcmVmZXJTdHJvbmdSdW5zID0gZmFsc2VcclxuICAgICAgc3RhcnRTaXplID0gM1xyXG4gICAgICBlbmRTaXplID0gNlxyXG4gICAgZm9yIHJ1blNpemUgaW4gW3N0YXJ0U2l6ZS4uZW5kU2l6ZV1cclxuICAgICAgW3JvcHMsIGxlZnRvdmVyc10gPSBAYWlGaW5kUnVucyhoYW5kLCAyLCBydW5TaXplLCBwcmVmZXJTdHJvbmdSdW5zKVxyXG4gICAgICBpZiByb3BzLmxlbmd0aCA+IDBcclxuICAgICAgICBrZXkgPSBcInJvcCN7cnVuU2l6ZX1cIlxyXG4gICAgICAgIHBsYXlzW2tleV0gPSByb3BzXHJcbiAgICAgIGhhbmQgPSBsZWZ0b3ZlcnNcclxuXHJcbiAgICByZXR1cm4gaGFuZFxyXG5cclxuICBhaUNhbGNQbGF5czogKGhhbmQsIHN0cmF0ZWd5ID0ge30pIC0+XHJcbiAgICBwbGF5cyA9IHt9XHJcblxyXG4gICAgIyBXZSBhbHdheXMgd2FudCB0byB1c2Ugcm9wcyBpZiB3ZSBoYXZlIG9uZVxyXG4gICAgaWYgc3RyYXRlZ3kuc2Vlc1JvcHNcclxuICAgICAgaGFuZCA9IEBhaUNhbGNSb3BzKGhhbmQsIHBsYXlzKVxyXG5cclxuICAgIGlmIHN0cmF0ZWd5LnByZWZlcnNSdW5zXHJcbiAgICAgIGhhbmQgPSBAYWlDYWxjUnVucyhoYW5kLCBwbGF5cywgc3RyYXRlZ3kuc21hbGxSdW5zKVxyXG4gICAgICBoYW5kID0gQGFsQ2FsY0tpbmRzKGhhbmQsIHBsYXlzLCBzdHJhdGVneS5tYXRjaDJzKVxyXG4gICAgZWxzZVxyXG4gICAgICBoYW5kID0gQGFsQ2FsY0tpbmRzKGhhbmQsIHBsYXlzLCBzdHJhdGVneS5tYXRjaDJzKVxyXG4gICAgICBoYW5kID0gQGFpQ2FsY1J1bnMoaGFuZCwgcGxheXMsIHN0cmF0ZWd5LnNtYWxsUnVucylcclxuXHJcbiAgICBraW5kMSA9IGhhbmQubWFwICh2KSAtPiBbdl1cclxuICAgIGlmIGtpbmQxLmxlbmd0aCA+IDBcclxuICAgICAgcGxheXMua2luZDEgPSBraW5kMVxyXG4gICAgcmV0dXJuIHBsYXlzXHJcblxyXG4gIG51bWJlck9mU2luZ2xlczogKHBsYXlzKSAtPlxyXG4gICAgaWYgbm90IHBsYXlzLmtpbmQxP1xyXG4gICAgICByZXR1cm4gMFxyXG4gICAgbm9uVHdvU2luZ2xlcyA9IDBcclxuICAgIGZvciByYXcgaW4gcGxheXMua2luZDFcclxuICAgICAgaWYgcmF3IDwgNDhcclxuICAgICAgICBub25Ud29TaW5nbGVzICs9IDFcclxuICAgIHJldHVybiBub25Ud29TaW5nbGVzXHJcblxyXG4gIGJyZWFrZXJQbGF5czogKGhhbmQpIC0+XHJcbiAgICByZXR1cm4gQGFpQ2FsY1BsYXlzKGhhbmQsIHsgc2Vlc1JvcHM6IHRydWUsIHByZWZlcnNSdW5zOiBmYWxzZSB9KVxyXG5cclxuICBpc0JyZWFrZXJUeXBlOiAocGxheVR5cGUpIC0+XHJcbiAgICBpZiBwbGF5VHlwZS5tYXRjaCgvXnJvcC8pIG9yIHBsYXlUeXBlID09ICdraW5kNCdcclxuICAgICAgcmV0dXJuIHRydWVcclxuICAgIHJldHVybiBmYWxzZVxyXG5cclxuICBjYW5CZUJyb2tlbjogKHBsYXkpIC0+XHJcbiAgICBpZiBwbGF5LnR5cGUgIT0gJ2tpbmQxJ1xyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIGNhcmQgPSBuZXcgQ2FyZChwbGF5LmhpZ2gpXHJcbiAgICByZXR1cm4gKGNhcmQudmFsdWUgPT0gMTIpXHJcblxyXG4gIGhhc0JyZWFrZXI6IChoYW5kKSAtPlxyXG4gICAgcGxheXMgPSBAYnJlYWtlclBsYXlzKGhhbmQpXHJcbiAgICBmb3IgcGxheVR5cGUsIHBsYXlsaXN0IG9mIHBsYXlzXHJcbiAgICAgIGlmIEBpc0JyZWFrZXJUeXBlKHBsYXlUeXBlKVxyXG4gICAgICAgIGlmIHBsYXlsaXN0Lmxlbmd0aCA+IDBcclxuICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgaXNSdW5UeXBlOiAocGxheVR5cGUpIC0+XHJcbiAgICBpZiBwbGF5VHlwZS5tYXRjaCgvXnJ1bi8pXHJcbiAgICAgIHJldHVybiB0cnVlXHJcbiAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgaXNTdWl0ZWQ6IChoYW5kKSAtPlxyXG4gICAgaWYgaGFuZC5sZW5ndGggPCAxXHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgY2FyZHMgPSBoYW5kLm1hcCAocmF3KSAtPiBuZXcgQ2FyZChyYXcpXHJcbiAgICBzdWl0ID0gY2FyZHNbMF0uc3VpdFxyXG4gICAgZm9yIGNhcmQgaW4gY2FyZHNcclxuICAgICAgaWYgY2FyZC5zdWl0ICE9IHN1aXRcclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgIHJldHVybiB0cnVlXHJcblxyXG4gIGlzQmlnUnVuOiAocGxheSwgYXRMZWFzdCkgLT5cclxuICAgIGlmIG1hdGNoZXMgPSBwbGF5LnR5cGUubWF0Y2goL15ydW4oXFxkKykvKVxyXG4gICAgICBsZW4gPSBwYXJzZUludChtYXRjaGVzWzFdKVxyXG4gICAgICBpZiBsZW4gPj0gYXRMZWFzdFxyXG4gICAgICAgIHJldHVybiB0cnVlXHJcbiAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgYWlDYWxjQmVzdFBsYXlzOiAoaGFuZCkgLT5cclxuICAgIGJlc3RQbGF5cyA9IG51bGxcclxuICAgIGZvciBiaXRzIGluIFswLi4uMTZdXHJcbiAgICAgIHN0cmF0ZWd5ID1cclxuICAgICAgICBzbWFsbFJ1bnM6IChiaXRzICYgMSkgPT0gMVxyXG4gICAgICAgIHByZWZlcnNSdW5zOiAoYml0cyAmIDIpID09IDJcclxuICAgICAgICBtYXRjaDJzOiAoYml0cyAmIDQpID09IDRcclxuICAgICAgICBzZWVzUm9wczogKGJpdHMgJiA4KSA9PSA4XHJcbiAgICAgIHBsYXlzID0gQGFpQ2FsY1BsYXlzKGhhbmQsIHN0cmF0ZWd5KVxyXG4gICAgICBpZiBiZXN0UGxheXMgPT0gbnVsbFxyXG4gICAgICAgIGJlc3RQbGF5cyA9IHBsYXlzXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBucCA9IEBudW1iZXJPZlNpbmdsZXMocGxheXMpXHJcbiAgICAgICAgbmJwID0gQG51bWJlck9mU2luZ2xlcyhiZXN0UGxheXMpXHJcbiAgICAgICAgaWYgbnAgPCBuYnBcclxuICAgICAgICAgIGJlc3RQbGF5cyA9IHBsYXlzXHJcbiAgICAgICAgZWxzZSBpZiBucCA9PSBuYnBcclxuICAgICAgICAgICMgZmxpcCBhIGNvaW4hXHJcbiAgICAgICAgICBpZiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKSA9PSAwXHJcbiAgICAgICAgICAgIGJlc3RQbGF5cyA9IHBsYXlzXHJcbiAgICByZXR1cm4gYmVzdFBsYXlzXHJcblxyXG4gIHByZXR0eVBsYXlzOiAocGxheXMsIGV4dHJhUHJldHR5ID0gZmFsc2UpIC0+XHJcbiAgICBwcmV0dHkgPSB7fVxyXG4gICAgZm9yIHR5cGUsIGFyciBvZiBwbGF5c1xyXG4gICAgICBwcmV0dHlbdHlwZV0gPSBbXVxyXG4gICAgICBmb3IgcGxheSBpbiBhcnJcclxuICAgICAgICBuYW1lcyA9IFtdXHJcbiAgICAgICAgZm9yIHJhdyBpbiBwbGF5XHJcbiAgICAgICAgICBjYXJkID0gbmV3IENhcmQocmF3KVxyXG4gICAgICAgICAgbmFtZXMucHVzaChjYXJkLm5hbWUpXHJcbiAgICAgICAgcHJldHR5W3R5cGVdLnB1c2gobmFtZXMpXHJcbiAgICBpZiBleHRyYVByZXR0eVxyXG4gICAgICBzID0gXCJcIlxyXG4gICAgICBmb3IgdHlwZU5hbWUsIHRocm93cyBvZiBwcmV0dHlcclxuICAgICAgICBzICs9IFwiICAgICAgKiAje3BsYXlUeXBlVG9TdHJpbmcodHlwZU5hbWUpfTpcXG5cIlxyXG4gICAgICAgIGlmIHR5cGVOYW1lID09ICdraW5kMSdcclxuICAgICAgICAgIHMgKz0gXCIgICAgICAgICogI3t0aHJvd3MubWFwKCh2KSAtPiB2WzBdKS5qb2luKCcsJyl9XFxuXCJcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBmb3IgdCBpbiB0aHJvd3NcclxuICAgICAgICAgICAgcyArPSBcIiAgICAgICAgKiAje3Quam9pbignLCcpfVxcblwiXHJcbiAgICAgIHJldHVybiBzXHJcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocHJldHR5KVxyXG5cclxuICBoaWdoZXN0Q2FyZDogKHBsYXkpIC0+XHJcbiAgICBoaWdoZXN0ID0gMFxyXG4gICAgZm9yIHAgaW4gcGxheVxyXG4gICAgICBpZiBoaWdoZXN0IDwgcFxyXG4gICAgICAgIGhpZ2hlc3QgPSBwXHJcbiAgICByZXR1cm4gaGlnaGVzdFxyXG5cclxuICBmaW5kUGxheVdpdGgzUzogKHBsYXlzKSAtPlxyXG4gICAgZm9yIHBsYXlUeXBlLCBwbGF5bGlzdCBvZiBwbGF5c1xyXG4gICAgICBmb3IgcGxheSBpbiBwbGF5bGlzdFxyXG4gICAgICAgIGlmIEBoYW5kSGFzM1MocGxheSlcclxuICAgICAgICAgIHJldHVybiBwbGF5XHJcblxyXG4gICAgY29uc29sZS5sb2cgXCJmaW5kUGxheVdpdGgzUzogc29tZXRoaW5nIGltcG9zc2libGUgaXMgaGFwcGVuaW5nXCJcclxuICAgIHJldHVybiBbXVxyXG5cclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuIyBBSSBCcmFpbnNcclxuXHJcbiAgIyBCcmFpbnMgbXVzdCBoYXZlOlxyXG4gICMgKiBpZDogaW50ZXJuYWwgaWRlbnRpZmllciBmb3IgdGhlIGJyYWluXHJcbiAgIyAqIG5hbWU6IHByZXR0eSBuYW1lXHJcbiAgIyAqIHBsYXkoY3VycmVudFBsYXllcikgYXR0ZW1wdHMgdG8gcGxheSBhIGNhcmQgYnkgY2FsbGluZyBhaVBsYXkoKS4gU2hvdWxkIHJldHVybiB0cnVlIGlmIGl0IHN1Y2Nlc3NmdWxseSBwbGF5ZWQgYSBjYXJkIChhaVBsYXkoKSByZXR1cm5lZCB0cnVlKVxyXG4gIGJyYWluczpcclxuXHJcbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgIyBOb3JtYWw6IEludGVuZGVkIHRvIGJlIHVzZWQgYnkgbW9zdCBjaGFyYWN0ZXJzLlxyXG4gICAgIyAgICAgICAgIE5vdCB0b28gZHVtYiwgbm90IHRvbyBzbWFydC5cclxuICAgIG5vcm1hbDpcclxuICAgICAgaWQ6ICAgXCJub3JtYWxcIlxyXG4gICAgICBuYW1lOiBcIk5vcm1hbFwiXHJcblxyXG4gICAgICAjIG5vcm1hbFxyXG4gICAgICBwbGF5OiAoY3VycmVudFBsYXllciwgY3VycmVudFBsYXksIGV2ZXJ5b25lUGFzc2VkKSAtPlxyXG4gICAgICAgIGlmIGN1cnJlbnRQbGF5ZXIucGFzc1xyXG4gICAgICAgICAgaWYgQGNhbkJlQnJva2VuKGN1cnJlbnRQbGF5KSBhbmQgQGhhc0JyZWFrZXIoY3VycmVudFBsYXllci5oYW5kKVxyXG4gICAgICAgICAgICBicmVha2VyUGxheXMgPSBAYnJlYWtlclBsYXlzKGN1cnJlbnRQbGF5ZXIuaGFuZClcclxuICAgICAgICAgICAgZm9yIHBsYXlUeXBlLCBwbGF5bGlzdCBvZiBicmVha2VyUGxheXNcclxuICAgICAgICAgICAgICBpZiAocGxheVR5cGUubWF0Y2goL15yb3AvKSBvciAocGxheVR5cGUgPT0gJ2tpbmQ0JykpIGFuZCAocGxheWxpc3QubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgICAgIEBhaUxvZyhcImJyZWFraW5nIDJcIilcclxuICAgICAgICAgICAgICAgIGlmIEBhaVBsYXkoY3VycmVudFBsYXllciwgcGxheWxpc3RbMF0pID09IE9LXHJcbiAgICAgICAgICAgICAgICAgIHJldHVybiBPS1xyXG5cclxuICAgICAgICAgIEBhaUxvZyhcImFscmVhZHkgcGFzc2VkLCBnb2luZyB0byBrZWVwIHBhc3NpbmdcIilcclxuICAgICAgICAgIHJldHVybiBAYWlQYXNzKGN1cnJlbnRQbGF5ZXIpXHJcblxyXG4gICAgICAgIHBsYXlzID0gQGFpQ2FsY0Jlc3RQbGF5cyhjdXJyZW50UGxheWVyLmhhbmQpXHJcbiAgICAgICAgQGFpTG9nKFwiYmVzdCBwbGF5czogI3tAcHJldHR5UGxheXMocGxheXMpfVwiKVxyXG5cclxuICAgICAgICBpZiBAcGlsZS5sZW5ndGggPT0gMFxyXG4gICAgICAgICAgcGxheSA9IEBmaW5kUGxheVdpdGgzUyhwbGF5cylcclxuICAgICAgICAgIEBhaUxvZyhcIlRocm93aW5nIG15IHBsYXkgd2l0aCB0aGUgM1MgaW4gaXRcIilcclxuICAgICAgICAgIGlmIEBhaVBsYXkoY3VycmVudFBsYXllciwgcGxheSkgPT0gT0tcclxuICAgICAgICAgICAgcmV0dXJuIE9LXHJcblxyXG4gICAgICAgIGlmIGN1cnJlbnRQbGF5IGFuZCBub3QgZXZlcnlvbmVQYXNzZWRcclxuICAgICAgICAgIGlmIHBsYXlzW2N1cnJlbnRQbGF5LnR5cGVdPyBhbmQgKHBsYXlzW2N1cnJlbnRQbGF5LnR5cGVdLmxlbmd0aCA+IDApXHJcbiAgICAgICAgICAgIGZvciBwbGF5IGluIHBsYXlzW2N1cnJlbnRQbGF5LnR5cGVdXHJcbiAgICAgICAgICAgICAgaWYgQGhpZ2hlc3RDYXJkKHBsYXkpID4gY3VycmVudFBsYXkuaGlnaFxyXG4gICAgICAgICAgICAgICAgaWYgQGFpUGxheShjdXJyZW50UGxheWVyLCBwbGF5KSA9PSBPS1xyXG4gICAgICAgICAgICAgICAgICByZXR1cm4gT0tcclxuICAgICAgICAgICAgQGFpTG9nKFwiSSBndWVzcyBJIGNhbid0IGFjdHVhbGx5IGJlYXQgdGhpcywgcGFzc2luZ1wiKVxyXG4gICAgICAgICAgICByZXR1cm4gQGFpUGFzcyhjdXJyZW50UGxheWVyKVxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBAYWlMb2coXCJJIGRvbid0IGhhdmUgdGhhdCBwbGF5LCBwYXNzaW5nXCIpXHJcbiAgICAgICAgICAgIHJldHVybiBAYWlQYXNzKGN1cnJlbnRQbGF5ZXIpXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgIyBubyBjdXJyZW50IHBsYXksIHRocm93IHRoZSBmaXJzdCBjYXJkXHJcbiAgICAgICAgICBAYWlMb2coXCJJIGNhbiBkbyBhbnl0aGluZywgdGhyb3dpbmcgYSByYW5kb20gcGxheVwiKVxyXG4gICAgICAgICAgcGxheVR5cGVzID0gT2JqZWN0LmtleXMocGxheXMpXHJcbiAgICAgICAgICBwbGF5VHlwZUluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcGxheVR5cGVzLmxlbmd0aClcclxuICAgICAgICAgIGlmIEBhaVBsYXkoY3VycmVudFBsYXllciwgcGxheXNbcGxheVR5cGVzW3BsYXlUeXBlSW5kZXhdXVswXSkgPT0gT0tcclxuICAgICAgICAgICAgcmV0dXJuIE9LXHJcblxyXG4gICAgICAgICMgZmluZCB0aGUgZmlyc3QgY2FyZCB0aGF0IGJlYXRzIHRoZSBjdXJyZW50UGxheSdzIGhpZ2hcclxuICAgICAgICBmb3IgcmF3Q2FyZCBpbiBjdXJyZW50UGxheWVyLmhhbmRcclxuICAgICAgICAgIGlmIHJhd0NhcmQgPiBjdXJyZW50UGxheS5oaWdoXHJcbiAgICAgICAgICAgIEBhaUxvZyhcImZvdW5kIHNtYWxsZXN0IHNpbmdsZSAoI3tyYXdDYXJkfSksIHBsYXlpbmdcIilcclxuICAgICAgICAgICAgaWYgQGFpUGxheShjdXJyZW50UGxheWVyLCBbcmF3Q2FyZF0pID09IE9LXHJcbiAgICAgICAgICAgICAgcmV0dXJuIE9LXHJcbiAgICAgICAgICAgIGJyZWFrXHJcblxyXG4gICAgICAgIEBhaUxvZyhcIm5vdGhpbmcgZWxzZSB0byBkbywgcGFzc2luZ1wiKVxyXG4gICAgICAgIHJldHVybiBAYWlQYXNzKGN1cnJlbnRQbGF5ZXIpXHJcblxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIERlYnVnIGNvZGVcclxuXHJcbmRlYnVnID0gLT5cclxuICB0aGlyID0gbmV3IFRoaXJ0ZWVuKClcclxuICBmdWxseVBsYXllZCA9IDBcclxuICB0b3RhbEF0dGVtcHRzID0gMTAwXHJcblxyXG4gIGZvciBhdHRlbXB0IGluIFswLi4udG90YWxBdHRlbXB0c11cclxuICAgIGRlY2sgPSBuZXcgU2h1ZmZsZWREZWNrKClcclxuICAgIGhhbmQgPSBbXVxyXG4gICAgZm9yIGogaW4gWzAuLi4xM11cclxuICAgICAgcmF3ID0gZGVjay5jYXJkcy5zaGlmdCgpXHJcbiAgICAgIGhhbmQucHVzaChyYXcpXHJcbiAgICAjIGhhbmQgPSBbNTEsNTAsNDksNDgsNDcsNDYsNDUsNDQsNDMsNDIsNDEsNDAsMzldXHJcbiAgICAjIGhhbmQgPSBbMCwxLDIsMyw0LDUsNiw3LDgsOSwxMCwxMSwxMl1cclxuICAgIGhhbmQuc29ydCAoYSxiKSAtPiByZXR1cm4gYSAtIGJcclxuXHJcbiAgICBjb25zb2xlLmxvZyhcIi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVwiKVxyXG4gICAgY29uc29sZS5sb2coXCJIYW5kICN7YXR0ZW1wdCsxfTogI3tjYXJkc1RvU3RyaW5nKGhhbmQpfVwiKVxyXG4gICAgY29uc29sZS5sb2coXCJcIilcclxuXHJcbiAgICBmb3VuZEZ1bGx5UGxheWVkID0gZmFsc2VcclxuICAgIGZvciBiaXRzIGluIFswLi4uMTZdXHJcbiAgICAgIHN0cmF0ZWd5ID1cclxuICAgICAgICBzbWFsbFJ1bnM6IChiaXRzICYgMSkgPT0gMVxyXG4gICAgICAgIHByZWZlcnNSdW5zOiAoYml0cyAmIDIpID09IDJcclxuICAgICAgICBtYXRjaDJzOiAoYml0cyAmIDQpID09IDRcclxuICAgICAgICBzZWVzUm9wczogKGJpdHMgJiA4KSA9PSA4XHJcbiAgICAgIHBsYXlzID0gdGhpci5haUNhbGNQbGF5cyhoYW5kLCBzdHJhdGVneSlcclxuXHJcbiAgICAgIGNvbnNvbGUubG9nKFwiICAgKiBTdHJhdGVneTogI3tKU09OLnN0cmluZ2lmeShzdHJhdGVneSl9XCIpXHJcbiAgICAgIGNvbnNvbGUubG9nKHRoaXIucHJldHR5UGxheXMocGxheXMsIHRydWUpKVxyXG5cclxuICAgICAgaWYgbm90IHBsYXlzLmtpbmQxXHJcbiAgICAgICAgZm91bmRGdWxseVBsYXllZCA9IHRydWVcclxuXHJcbiAgICBpZiBmb3VuZEZ1bGx5UGxheWVkXHJcbiAgICAgIGZ1bGx5UGxheWVkICs9IDFcclxuXHJcbiAgY29uc29sZS5sb2cgXCJmdWxseVBsYXllZDogI3tmdWxseVBsYXllZH0gLyAje3RvdGFsQXR0ZW1wdHN9XCJcclxuXHJcbiMgICAgICBIICBEICBDICBTXHJcbiMgIDI6IDUxIDUwIDQ5IDQ4XHJcbiMgIEE6IDQ3IDQ2IDQ1IDQ0XHJcbiMgIEs6IDQzIDQyIDQxIDQwXHJcbiMgIFE6IDM5IDM4IDM3IDM2XHJcbiMgIEo6IDM1IDM0IDMzIDMyXHJcbiMgMTA6IDMxIDMwIDI5IDI4XHJcbiMgIDk6IDI3IDI2IDI1IDI0XHJcbiMgIDg6IDIzIDIyIDIxIDIwXHJcbiMgIDc6IDE5IDE4IDE3IDE2XHJcbiMgIDY6IDE1IDE0IDEzIDEyXHJcbiMgIDU6IDExIDEwICA5ICA4XHJcbiMgIDQ6ICA3ICA2ICA1ICA0XHJcbiMgIDM6ICAzICAyICAxICAwXHJcblxyXG5kZWJ1ZzIgPSAtPlxyXG4gIGdhbWUgPVxyXG4gICAgb3B0aW9uczpcclxuICAgICAgYXV0b3Bhc3NJbmRleDogMVxyXG4gIHRoaXIgPSBuZXcgVGhpcnRlZW4oZ2FtZSlcclxuICBjdXJyZW50UGxheSA9XHJcbiAgICB0eXBlOiAncnVuMydcclxuICAgIGhpZ2g6IDI2XHJcbiAgaGFuZCA9IFtcclxuICAgIDEwLCAxMSwgMTUsIDE5LCAyMywgMjdcclxuICBdXHJcbiAgY29uc29sZS5sb2cgdGhpci5oYXNQbGF5KGN1cnJlbnRQbGF5LCBoYW5kKVxyXG5cclxuXHJcbiMgZGVidWcoKVxyXG4jIGRlYnVnMigpXHJcblxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIEV4cG9ydHNcclxuXHJcbm1vZHVsZS5leHBvcnRzID1cclxuICBDYXJkOiBDYXJkXHJcbiAgVGhpcnRlZW46IFRoaXJ0ZWVuXHJcbiAgT0s6IE9LXHJcbiAgYWlDaGFyYWN0ZXJzOiBhaUNoYXJhY3RlcnNcclxuICBhY2hpZXZlbWVudHNMaXN0OiBhY2hpZXZlbWVudHNMaXN0XHJcbiAgYWNoaWV2ZW1lbnRzTWFwOiBhY2hpZXZlbWVudHNNYXBcclxuIiwibW9kdWxlLmV4cG9ydHMgPVxyXG4gIGRhcmtmb3Jlc3Q6XHJcbiAgICBoZWlnaHQ6IDcyXHJcbiAgICBnbHlwaHM6XHJcbiAgICAgICc5NycgOiB7IHg6ICAgOCwgeTogICA4LCB3aWR0aDogIDM0LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnOTgnIDogeyB4OiAgIDgsIHk6ICA1OCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzk5JyA6IHsgeDogIDUwLCB5OiAgIDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICcxMDAnOiB7IHg6ICAgOCwgeTogMTE4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnMTAxJzogeyB4OiAgIDgsIHk6IDE3OCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzEwMic6IHsgeDogICA4LCB5OiAyMjgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzMyB9XHJcbiAgICAgICcxMDMnOiB7IHg6ICAgOCwgeTogMjc4LCB3aWR0aDogIDM2LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzUgfVxyXG4gICAgICAnMTA0JzogeyB4OiAgIDgsIHk6IDMyOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzEwNSc6IHsgeDogICA4LCB5OiAzNzgsIHdpZHRoOiAgMTIsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAxMSB9XHJcbiAgICAgICcxMDYnOiB7IHg6ICAgOCwgeTogNDI4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MSwgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnMTA3JzogeyB4OiAgMjgsIHk6IDM3OCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDEsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzEwOCc6IHsgeDogIDUxLCB5OiAzMjgsIHdpZHRoOiAgMzQsIGhlaWdodDogIDQxLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzMyB9XHJcbiAgICAgICcxMDknOiB7IHg6ICA1MSwgeTogNDI3LCB3aWR0aDogIDM4LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzcgfVxyXG4gICAgICAnMTEwJzogeyB4OiAgNzEsIHk6IDM3Nywgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzExMSc6IHsgeDogIDk3LCB5OiA0MjcsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQxLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICcxMTInOiB7IHg6ICA1MSwgeTogIDU4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnMTEzJzogeyB4OiAgNTEsIHk6IDEwOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDUsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzExNCc6IHsgeDogIDkzLCB5OiAgIDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNSB9XHJcbiAgICAgICcxMTUnOiB7IHg6ICA1MSwgeTogMTYxLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzUgfVxyXG4gICAgICAnMTE2JzogeyB4OiAgNTEsIHk6IDIxMSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDMzIH1cclxuICAgICAgJzExNyc6IHsgeDogIDUyLCB5OiAyNjEsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICcxMTgnOiB7IHg6ICA5MywgeTogMzExLCB3aWR0aDogIDM0LCBoZWlnaHQ6ICA0MSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzIgfVxyXG4gICAgICAnMTE5JzogeyB4OiAxMTQsIHk6IDM2MCwgd2lkdGg6ICAzOCwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM4IH1cclxuICAgICAgJzEyMCc6IHsgeDogMTQwLCB5OiA0MTAsIHdpZHRoOiAgMzYsIGhlaWdodDogIDQxLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNyB9XHJcbiAgICAgICcxMjEnOiB7IHg6IDE0MCwgeTogNDU5LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnMTIyJzogeyB4OiAxODMsIHk6IDQ1OSwgd2lkdGg6ICAzNiwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM1IH1cclxuICAgICAgJzY1JyA6IHsgeDogIDk0LCB5OiAgNTgsIHdpZHRoOiAgMzQsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XHJcbiAgICAgICc2NicgOiB7IHg6ICA5NCwgeTogMTE5LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzcgfVxyXG4gICAgICAnNjcnIDogeyB4OiAgOTQsIHk6IDE4MCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cclxuICAgICAgJzY4JyA6IHsgeDogIDk1LCB5OiAyNDEsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNyB9XHJcbiAgICAgICc2OScgOiB7IHg6IDEzNiwgeTogICA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxyXG4gICAgICAnNzAnIDogeyB4OiAxMzcsIHk6ICA2OSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzcxJyA6IHsgeDogMTc5LCB5OiAgIDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XHJcbiAgICAgICc3MicgOiB7IHg6IDEzNywgeTogMTMwLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxyXG4gICAgICAnNzMnIDogeyB4OiAxMzgsIHk6IDE5MSwgd2lkdGg6ICAxMiwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDEzIH1cclxuICAgICAgJzc0JyA6IHsgeDogMTM4LCB5OiAyNTIsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XHJcbiAgICAgICc3NScgOiB7IHg6IDE1OCwgeTogMTkxLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxyXG4gICAgICAnNzYnIDogeyB4OiAxNjAsIHk6IDMxMywgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzc3JyA6IHsgeDogMTgxLCB5OiAyNTEsIHdpZHRoOiAgMzgsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzOSB9XHJcbiAgICAgICc3OCcgOiB7IHg6IDE4NCwgeTogMzc0LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxyXG4gICAgICAnNzknIDogeyB4OiAyMDMsIHk6IDMxMiwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM1IH1cclxuICAgICAgJzgwJyA6IHsgeDogMTgwLCB5OiAgNjksIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICc4MScgOiB7IHg6IDIwMSwgeTogMTMwLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1NiwgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxyXG4gICAgICAnODInIDogeyB4OiAyMjIsIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cclxuICAgICAgJzgzJyA6IHsgeDogMjIzLCB5OiAgNjksIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNSB9XHJcbiAgICAgICc4NCcgOiB7IHg6IDI2NSwgeTogICA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzMgfVxyXG4gICAgICAnODUnIDogeyB4OiAyMjcsIHk6IDE5NCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM1IH1cclxuICAgICAgJzg2JyA6IHsgeDogMjQ0LCB5OiAxMzAsIHdpZHRoOiAgNDEsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAxOSwgeGFkdmFuY2U6ICAzOSB9XHJcbiAgICAgICc4NycgOiB7IHg6IDI2NiwgeTogIDY5LCB3aWR0aDogIDM4LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzcgfVxyXG4gICAgICAnODgnIDogeyB4OiAzMDgsIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDE5LCB4YWR2YW5jZTogIDM1IH1cclxuICAgICAgJzg5JyA6IHsgeDogMjI3LCB5OiAzNzMsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAxOSwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICc5MCcgOiB7IHg6IDIyNywgeTogNDMzLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxyXG4gICAgICAnMzMnIDogeyB4OiAyNDYsIHk6IDI1NSwgd2lkdGg6ICAxNCwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDExIH1cclxuICAgICAgJzU5JyA6IHsgeDogMTgwLCB5OiAxMzAsIHdpZHRoOiAgMTMsIGhlaWdodDogIDM3LCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA1NiwgeGFkdmFuY2U6ICAxMyB9XHJcbiAgICAgICczNycgOiB7IHg6ICA5NSwgeTogMzAyLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxyXG4gICAgICAnNTgnIDogeyB4OiAxNjAsIHk6IDM3NCwgd2lkdGg6ICAxMywgaGVpZ2h0OiAgMjMsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDUwLCB4YWR2YW5jZTogIDEzIH1cclxuICAgICAgJzYzJyA6IHsgeDogMjY4LCB5OiAyNTUsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzMyB9XHJcbiAgICAgICc0MicgOiB7IHg6IDEwMywgeTogMzAyLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxyXG4gICAgICAnNDAnIDogeyB4OiAyNzAsIHk6IDE5MCwgd2lkdGg6ICAyMywgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDIxIH1cclxuICAgICAgJzQxJyA6IHsgeDogMjkzLCB5OiAxMzAsIHdpZHRoOiAgMjMsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAyMSB9XHJcbiAgICAgICc5NScgOiB7IHg6IDExMSwgeTogMzAyLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxyXG4gICAgICAnNDMnIDogeyB4OiAyNDYsIHk6IDMxNiwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgMzQsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDM5LCB4YWR2YW5jZTogIDMyIH1cclxuICAgICAgJzQ1JyA6IHsgeDogMTg0LCB5OiA0MzUsIHdpZHRoOiAgMjYsIGhlaWdodDogIDExLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICA0NCwgeGFkdmFuY2U6ICAyNSB9XHJcbiAgICAgICc2MScgOiB7IHg6IDMxMiwgeTogIDY4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICAzMCwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgNDIsIHhhZHZhbmNlOiAgMzMgfVxyXG4gICAgICAnNDYnIDogeyB4OiAxMzUsIHk6IDMxMywgd2lkdGg6ICAxNCwgaGVpZ2h0OiAgMTEsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDYxLCB4YWR2YW5jZTogIDE0IH1cclxuICAgICAgJzQ0JyA6IHsgeDogMjI3LCB5OiAyNTUsIHdpZHRoOiAgMTAsIGhlaWdodDogIDIxLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA2OCwgeGFkdmFuY2U6ICAxMSB9XHJcbiAgICAgICc0NycgOiB7IHg6IDM1MSwgeTogICA4LCB3aWR0aDogIDI4LCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgMTksIHhhZHZhbmNlOiAgMjYgfVxyXG4gICAgICAnMTI0JzogeyB4OiAxMTksIHk6IDMwMiwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cclxuICAgICAgJzM0JyA6IHsgeDogMTI3LCB5OiAzMDIsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XHJcbiAgICAgICczOScgOiB7IHg6IDIwMSwgeTogMTk0LCB3aWR0aDogIDE4LCBoZWlnaHQ6ICAxOSwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgIDAsIHhhZHZhbmNlOiAgMjEgfVxyXG4gICAgICAnNjQnIDogeyB4OiAyMTgsIHk6IDQzNSwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cclxuICAgICAgJzM1JyA6IHsgeDogMjE4LCB5OiA0NDMsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XHJcbiAgICAgICczNicgOiB7IHg6IDMwMSwgeTogMTkwLCB3aWR0aDogIDMyLCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgMjIsIHhhZHZhbmNlOiAgMjkgfVxyXG4gICAgICAnOTQnIDogeyB4OiAyMTgsIHk6IDQ1MSwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cclxuICAgICAgJzM4JyA6IHsgeDogMjQ2LCB5OiAzNTgsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XHJcbiAgICAgICcxMjMnOiB7IHg6IDMyNCwgeTogMTA2LCB3aWR0aDogIDI3LCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMjYgfVxyXG4gICAgICAnMTI1JzogeyB4OiAyNzAsIHk6IDM1OCwgd2lkdGg6ICAyNywgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDI3IH1cclxuICAgICAgJzkxJyA6IHsgeDogMjcwLCB5OiA0MTgsIHdpZHRoOiAgMjIsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAyMSB9XHJcbiAgICAgICc5MycgOiB7IHg6IDMwMCwgeTogNDE4LCB3aWR0aDogIDIyLCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMjAgfVxyXG4gICAgICAnNDgnIDogeyB4OiAzMDUsIHk6IDMxNiwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cclxuICAgICAgJzQ5JyA6IHsgeDogMzExLCB5OiAyNTEsIHdpZHRoOiAgMzQsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNSB9XHJcbiAgICAgICc1MCcgOiB7IHg6IDM0MSwgeTogMTY2LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzcgfVxyXG4gICAgICAnNTEnIDogeyB4OiAzNTksIHk6ICA2OCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cclxuICAgICAgJzUyJyA6IHsgeDogMzMwLCB5OiAzNzcsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNSB9XHJcbiAgICAgICc1MycgOiB7IHg6IDM0OCwgeTogMzEyLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzcgfVxyXG4gICAgICAnNTQnIDogeyB4OiAzMzAsIHk6IDQzOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cclxuICAgICAgJzU1JyA6IHsgeDogMzUzLCB5OiAyMjcsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICc1NicgOiB7IHg6IDM4NCwgeTogMTI5LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxyXG4gICAgICAnNTcnIDogeyB4OiA0MDIsIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cclxuICAgICAgJzMyJyA6IHsgeDogICAwLCB5OiAgIDAsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAyMiB9XHJcblxyXG4gICAgICAjIGNhcmQgZ2x5cGhzXHJcbiAgICAgICcyMDAnOiB7IHg6IDM5NiwgeTogMzc4LCB3aWR0aDogIDQwLCBoZWlnaHQ6ICA0OSwgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjEsIHhhZHZhbmNlOiAgNDMgfSAjIFNcclxuICAgICAgJzIwMSc6IHsgeDogNDQ3LCB5OiAzMTMsIHdpZHRoOiAgNDksIGhlaWdodDogIDUwLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMSwgeGFkdmFuY2U6ICA1MiB9ICMgQ1xyXG4gICAgICAnMjAyJzogeyB4OiAzOTksIHk6IDMxMywgd2lkdGg6ICAzNiwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIxLCB4YWR2YW5jZTogIDM5IH0gIyBEXHJcbiAgICAgICcyMDMnOiB7IHg6IDQ1MiwgeTogMzgxLCB3aWR0aDogIDM5LCBoZWlnaHQ6ICA0MywgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjEsIHhhZHZhbmNlOiAgNDIgfSAjIEhcclxuIiwiIyBUaGlzIGZpbGUgcHJvdmlkZXMgdGhlIHJlbmRlcmluZyBlbmdpbmUgZm9yIHRoZSB3ZWIgdmVyc2lvbi4gTm9uZSBvZiB0aGlzIGNvZGUgaXMgaW5jbHVkZWQgaW4gdGhlIEphdmEgdmVyc2lvbi5cclxuXHJcbmNvbnNvbGUubG9nICd3ZWIgc3RhcnR1cCdcclxuXHJcbkdhbWUgPSByZXF1aXJlICcuL0dhbWUnXHJcblxyXG4jIHRha2VuIGZyb20gaHR0cDojc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzU2MjM4MzgvcmdiLXRvLWhleC1hbmQtaGV4LXRvLXJnYlxyXG5jb21wb25lbnRUb0hleCA9IChjKSAtPlxyXG4gIGhleCA9IE1hdGguZmxvb3IoYyAqIDI1NSkudG9TdHJpbmcoMTYpXHJcbiAgcmV0dXJuIGlmIGhleC5sZW5ndGggPT0gMSB0aGVuIFwiMFwiICsgaGV4IGVsc2UgaGV4XHJcbnJnYlRvSGV4ID0gKHIsIGcsIGIpIC0+XHJcbiAgcmV0dXJuIFwiI1wiICsgY29tcG9uZW50VG9IZXgocikgKyBjb21wb25lbnRUb0hleChnKSArIGNvbXBvbmVudFRvSGV4KGIpXHJcblxyXG5TQVZFX1RJTUVSX01TID0gMzAwMFxyXG5cclxuY2xhc3MgTmF0aXZlQXBwXHJcbiAgY29uc3RydWN0b3I6IChAc2NyZWVuLCBAd2lkdGgsIEBoZWlnaHQpIC0+XHJcbiAgICBAdGludGVkVGV4dHVyZUNhY2hlID0gW11cclxuICAgIEBsYXN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXHJcbiAgICBAbGFzdEludGVyYWN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXHJcbiAgICBAaGVhcmRPbmVUb3VjaCA9IGZhbHNlXHJcbiAgICBAdG91Y2hNb3VzZSA9IG51bGxcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdtb3VzZWRvd24nLCAgQG9uTW91c2VEb3duLmJpbmQodGhpcyksIGZhbHNlXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2Vtb3ZlJywgIEBvbk1vdXNlTW92ZS5iaW5kKHRoaXMpLCBmYWxzZVxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNldXAnLCAgICBAb25Nb3VzZVVwLmJpbmQodGhpcyksIGZhbHNlXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAndG91Y2hzdGFydCcsIEBvblRvdWNoU3RhcnQuYmluZCh0aGlzKSwgZmFsc2VcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICd0b3VjaG1vdmUnLCAgQG9uVG91Y2hNb3ZlLmJpbmQodGhpcyksIGZhbHNlXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAndG91Y2hlbmQnLCAgIEBvblRvdWNoRW5kLmJpbmQodGhpcyksIGZhbHNlXHJcbiAgICBAY29udGV4dCA9IEBzY3JlZW4uZ2V0Q29udGV4dChcIjJkXCIpXHJcbiAgICBAdGV4dHVyZXMgPSBbXHJcbiAgICAgICMgYWxsIGNhcmQgYXJ0XHJcbiAgICAgIFwiLi4vaW1hZ2VzL2NhcmRzLnBuZ1wiXHJcbiAgICAgICMgZm9udHNcclxuICAgICAgXCIuLi9pbWFnZXMvZGFya2ZvcmVzdC5wbmdcIlxyXG4gICAgICAjIGNoYXJhY3RlcnMgLyBvdGhlclxyXG4gICAgICBcIi4uL2ltYWdlcy9jaGFycy5wbmdcIlxyXG4gICAgICAjIGhlbHBcclxuICAgICAgXCIuLi9pbWFnZXMvaG93dG9wbGF5MS5wbmdcIlxyXG4gICAgXVxyXG5cclxuICAgIEBnYW1lID0gbmV3IEdhbWUodGhpcywgQHdpZHRoLCBAaGVpZ2h0KVxyXG5cclxuICAgIGlmIHR5cGVvZiBTdG9yYWdlICE9IFwidW5kZWZpbmVkXCJcclxuICAgICAgc3RhdGUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSBcInN0YXRlXCJcclxuICAgICAgaWYgc3RhdGVcclxuICAgICAgICAjIGNvbnNvbGUubG9nIFwibG9hZGluZyBzdGF0ZTogI3tzdGF0ZX1cIlxyXG4gICAgICAgIEBnYW1lLmxvYWQgc3RhdGVcclxuXHJcbiAgICBAcGVuZGluZ0ltYWdlcyA9IDBcclxuICAgIGxvYWRlZFRleHR1cmVzID0gW11cclxuICAgIGZvciBpbWFnZVVybCBpbiBAdGV4dHVyZXNcclxuICAgICAgQHBlbmRpbmdJbWFnZXMrK1xyXG4gICAgICBjb25zb2xlLmxvZyBcImxvYWRpbmcgaW1hZ2UgI3tAcGVuZGluZ0ltYWdlc306ICN7aW1hZ2VVcmx9XCJcclxuICAgICAgaW1nID0gbmV3IEltYWdlKClcclxuICAgICAgaW1nLm9ubG9hZCA9IEBvbkltYWdlTG9hZGVkLmJpbmQodGhpcylcclxuICAgICAgaW1nLnNyYyA9IGltYWdlVXJsXHJcbiAgICAgIGxvYWRlZFRleHR1cmVzLnB1c2ggaW1nXHJcbiAgICBAdGV4dHVyZXMgPSBsb2FkZWRUZXh0dXJlc1xyXG5cclxuICAgIEBzYXZlVGltZXIgPSBTQVZFX1RJTUVSX01TXHJcblxyXG4gIG9uSW1hZ2VMb2FkZWQ6IChpbmZvKSAtPlxyXG4gICAgQHBlbmRpbmdJbWFnZXMtLVxyXG4gICAgaWYgQHBlbmRpbmdJbWFnZXMgPT0gMFxyXG4gICAgICBjb25zb2xlLmxvZyAnQWxsIGltYWdlcyBsb2FkZWQuIEJlZ2lubmluZyByZW5kZXIgbG9vcC4nXHJcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9PiBAdXBkYXRlKClcclxuXHJcbiAgbG9nOiAocykgLT5cclxuICAgIGNvbnNvbGUubG9nIFwiTmF0aXZlQXBwLmxvZygpOiAje3N9XCJcclxuXHJcbiAgdXBkYXRlU2F2ZTogKGR0KSAtPlxyXG4gICAgcmV0dXJuIGlmIHR5cGVvZiBTdG9yYWdlID09IFwidW5kZWZpbmVkXCJcclxuICAgIEBzYXZlVGltZXIgLT0gZHRcclxuICAgIGlmIEBzYXZlVGltZXIgPD0gMFxyXG4gICAgICBAc2F2ZVRpbWVyID0gU0FWRV9USU1FUl9NU1xyXG4gICAgICBzdGF0ZSA9IEBnYW1lLnNhdmUoKVxyXG4gICAgICAjIGNvbnNvbGUubG9nIFwic2F2aW5nOiAje3N0YXRlfVwiXHJcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtIFwic3RhdGVcIiwgc3RhdGVcclxuXHJcbiAgZ2VuZXJhdGVUaW50SW1hZ2U6ICh0ZXh0dXJlSW5kZXgsIHJlZCwgZ3JlZW4sIGJsdWUpIC0+XHJcbiAgICBpbWcgPSBAdGV4dHVyZXNbdGV4dHVyZUluZGV4XVxyXG4gICAgYnVmZiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgXCJjYW52YXNcIlxyXG4gICAgYnVmZi53aWR0aCAgPSBpbWcud2lkdGhcclxuICAgIGJ1ZmYuaGVpZ2h0ID0gaW1nLmhlaWdodFxyXG5cclxuICAgIGN0eCA9IGJ1ZmYuZ2V0Q29udGV4dCBcIjJkXCJcclxuICAgIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnY29weSdcclxuICAgIGN0eC5kcmF3SW1hZ2UoaW1nLCAwLCAwKVxyXG4gICAgZmlsbENvbG9yID0gXCJyZ2IoI3tNYXRoLmZsb29yKHJlZCoyNTUpfSwgI3tNYXRoLmZsb29yKGdyZWVuKjI1NSl9LCAje01hdGguZmxvb3IoYmx1ZSoyNTUpfSlcIlxyXG4gICAgY3R4LmZpbGxTdHlsZSA9IGZpbGxDb2xvclxyXG4gICAgIyBjb25zb2xlLmxvZyBcImZpbGxDb2xvciAje2ZpbGxDb2xvcn1cIlxyXG4gICAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdtdWx0aXBseSdcclxuICAgIGN0eC5maWxsUmVjdCgwLCAwLCBidWZmLndpZHRoLCBidWZmLmhlaWdodClcclxuICAgIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnY29weSdcclxuICAgIGN0eC5nbG9iYWxBbHBoYSA9IDEuMFxyXG4gICAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdkZXN0aW5hdGlvbi1pbidcclxuICAgIGN0eC5kcmF3SW1hZ2UoaW1nLCAwLCAwKVxyXG5cclxuICAgIGltZ0NvbXAgPSBuZXcgSW1hZ2UoKVxyXG4gICAgaW1nQ29tcC5zcmMgPSBidWZmLnRvRGF0YVVSTCgpXHJcbiAgICByZXR1cm4gaW1nQ29tcFxyXG5cclxuICBkcmF3SW1hZ2U6ICh0ZXh0dXJlSW5kZXgsIHNyY1gsIHNyY1ksIHNyY1csIHNyY0gsIGRzdFgsIGRzdFksIGRzdFcsIGRzdEgsIHJvdCwgYW5jaG9yWCwgYW5jaG9yWSwgciwgZywgYiwgYSkgLT5cclxuICAgIHRleHR1cmUgPSBAdGV4dHVyZXNbdGV4dHVyZUluZGV4XVxyXG4gICAgaWYgKHIgIT0gMSkgb3IgKGcgIT0gMSkgb3IgKGIgIT0gMSlcclxuICAgICAgdGludGVkVGV4dHVyZUtleSA9IFwiI3t0ZXh0dXJlSW5kZXh9LSN7cn0tI3tnfS0je2J9XCJcclxuICAgICAgdGludGVkVGV4dHVyZSA9IEB0aW50ZWRUZXh0dXJlQ2FjaGVbdGludGVkVGV4dHVyZUtleV1cclxuICAgICAgaWYgbm90IHRpbnRlZFRleHR1cmVcclxuICAgICAgICB0aW50ZWRUZXh0dXJlID0gQGdlbmVyYXRlVGludEltYWdlIHRleHR1cmVJbmRleCwgciwgZywgYlxyXG4gICAgICAgIEB0aW50ZWRUZXh0dXJlQ2FjaGVbdGludGVkVGV4dHVyZUtleV0gPSB0aW50ZWRUZXh0dXJlXHJcbiAgICAgICAgIyBjb25zb2xlLmxvZyBcImdlbmVyYXRlZCBjYWNoZWQgdGV4dHVyZSAje3RpbnRlZFRleHR1cmVLZXl9XCJcclxuICAgICAgdGV4dHVyZSA9IHRpbnRlZFRleHR1cmVcclxuXHJcbiAgICBAY29udGV4dC5zYXZlKClcclxuICAgIEBjb250ZXh0LnRyYW5zbGF0ZSBkc3RYLCBkc3RZXHJcbiAgICBAY29udGV4dC5yb3RhdGUgcm90ICMgKiAzLjE0MTU5MiAvIDE4MC4wXHJcbiAgICBhbmNob3JPZmZzZXRYID0gLTEgKiBhbmNob3JYICogZHN0V1xyXG4gICAgYW5jaG9yT2Zmc2V0WSA9IC0xICogYW5jaG9yWSAqIGRzdEhcclxuICAgIEBjb250ZXh0LnRyYW5zbGF0ZSBhbmNob3JPZmZzZXRYLCBhbmNob3JPZmZzZXRZXHJcbiAgICBAY29udGV4dC5nbG9iYWxBbHBoYSA9IGFcclxuICAgIEBjb250ZXh0LmRyYXdJbWFnZSh0ZXh0dXJlLCBzcmNYLCBzcmNZLCBzcmNXLCBzcmNILCAwLCAwLCBkc3RXLCBkc3RIKVxyXG4gICAgQGNvbnRleHQucmVzdG9yZSgpXHJcblxyXG4gIHVwZGF0ZTogLT5cclxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9PiBAdXBkYXRlKClcclxuXHJcbiAgICBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxyXG4gICAgZHQgPSBub3cgLSBAbGFzdFRpbWVcclxuXHJcbiAgICAjIGR0ID0gTWF0aC5mbG9vcihkdCAvIDEwMClcclxuXHJcbiAgICB0aW1lU2luY2VJbnRlcmFjdCA9IG5vdyAtIEBsYXN0SW50ZXJhY3RUaW1lXHJcbiAgICBpZiB0aW1lU2luY2VJbnRlcmFjdCA+IDE1MDAwXHJcbiAgICAgIGdvYWxGUFMgPSA1ICMgY2FsbSBkb3duLCBub2JvZHkgaXMgZG9pbmcgYW55dGhpbmcgZm9yIGEgd2hpbGVcclxuICAgIGVsc2VcclxuICAgICAgZ29hbEZQUyA9IG51bGwgIyBhcyBmYXN0IGFzIHBvc3NpYmxlXHJcbiAgICBpZiBAbGFzdEdvYWxGUFMgIT0gZ29hbEZQU1xyXG4gICAgICBjb25zb2xlLmxvZyBcInN3aXRjaGluZyB0byAje2dvYWxGUFN9IEZQU1wiXHJcbiAgICAgIEBsYXN0R29hbEZQUyA9IGdvYWxGUFNcclxuXHJcbiAgICBpZiBnb2FsRlBTICE9IG51bGxcclxuICAgICAgZnBzSW50ZXJ2YWwgPSAxMDAwIC8gZ29hbEZQU1xyXG4gICAgICBpZiBkdCA8IGZwc0ludGVydmFsXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICBAbGFzdFRpbWUgPSBub3dcclxuXHJcbiAgICBAY29udGV4dC5jbGVhclJlY3QoMCwgMCwgQHdpZHRoLCBAaGVpZ2h0KVxyXG4gICAgQGdhbWUudXBkYXRlKGR0KVxyXG4gICAgcmVuZGVyQ29tbWFuZHMgPSBAZ2FtZS5yZW5kZXIoKVxyXG5cclxuICAgIGkgPSAwXHJcbiAgICBuID0gcmVuZGVyQ29tbWFuZHMubGVuZ3RoXHJcbiAgICB3aGlsZSAoaSA8IG4pXHJcbiAgICAgIGRyYXdDYWxsID0gcmVuZGVyQ29tbWFuZHMuc2xpY2UoaSwgaSArPSAxNilcclxuICAgICAgQGRyYXdJbWFnZS5hcHBseSh0aGlzLCBkcmF3Q2FsbClcclxuXHJcbiAgICBAdXBkYXRlU2F2ZShkdClcclxuXHJcbiAgb25Ub3VjaFN0YXJ0OiAoZXZ0KSAtPlxyXG4gICAgQGxhc3RJbnRlcmFjdFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxyXG4gICAgQGhlYXJkT25lVG91Y2ggPSB0cnVlXHJcbiAgICB0b3VjaGVzID0gZXZ0LmNoYW5nZWRUb3VjaGVzXHJcbiAgICBmb3IgdG91Y2ggaW4gdG91Y2hlc1xyXG4gICAgICBpZiBAdG91Y2hNb3VzZSA9PSBudWxsXHJcbiAgICAgICAgQHRvdWNoTW91c2UgPSB0b3VjaC5pZGVudGlmaWVyXHJcbiAgICAgIGlmIEB0b3VjaE1vdXNlID09IHRvdWNoLmlkZW50aWZpZXJcclxuICAgICAgICBAZ2FtZS50b3VjaERvd24odG91Y2guY2xpZW50WCwgdG91Y2guY2xpZW50WSlcclxuXHJcbiAgb25Ub3VjaE1vdmU6IChldnQpIC0+XHJcbiAgICBAbGFzdEludGVyYWN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXHJcbiAgICB0b3VjaGVzID0gZXZ0LmNoYW5nZWRUb3VjaGVzXHJcbiAgICBmb3IgdG91Y2ggaW4gdG91Y2hlc1xyXG4gICAgICBpZiBAdG91Y2hNb3VzZSA9PSB0b3VjaC5pZGVudGlmaWVyXHJcbiAgICAgICAgQGdhbWUudG91Y2hNb3ZlKHRvdWNoLmNsaWVudFgsIHRvdWNoLmNsaWVudFkpXHJcblxyXG4gIG9uVG91Y2hFbmQ6IChldnQpIC0+XHJcbiAgICBAbGFzdEludGVyYWN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXHJcbiAgICB0b3VjaGVzID0gZXZ0LmNoYW5nZWRUb3VjaGVzXHJcbiAgICBmb3IgdG91Y2ggaW4gdG91Y2hlc1xyXG4gICAgICBpZiBAdG91Y2hNb3VzZSA9PSB0b3VjaC5pZGVudGlmaWVyXHJcbiAgICAgICAgQGdhbWUudG91Y2hVcCh0b3VjaC5jbGllbnRYLCB0b3VjaC5jbGllbnRZKVxyXG4gICAgICAgIEB0b3VjaE1vdXNlID0gbnVsbFxyXG4gICAgaWYgZXZ0LnRvdWNoZXMubGVuZ3RoID09IDBcclxuICAgICAgQHRvdWNoTW91c2UgPSBudWxsXHJcblxyXG4gIG9uTW91c2VEb3duOiAoZXZ0KSAtPlxyXG4gICAgaWYgQGhlYXJkT25lVG91Y2hcclxuICAgICAgcmV0dXJuXHJcbiAgICBAbGFzdEludGVyYWN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXHJcbiAgICBAZ2FtZS50b3VjaERvd24oZXZ0LmNsaWVudFgsIGV2dC5jbGllbnRZKVxyXG5cclxuICBvbk1vdXNlTW92ZTogKGV2dCkgLT5cclxuICAgIGlmIEBoZWFyZE9uZVRvdWNoXHJcbiAgICAgIHJldHVyblxyXG4gICAgQGxhc3RJbnRlcmFjdFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxyXG4gICAgQGdhbWUudG91Y2hNb3ZlKGV2dC5jbGllbnRYLCBldnQuY2xpZW50WSlcclxuXHJcbiAgb25Nb3VzZVVwOiAoZXZ0KSAtPlxyXG4gICAgaWYgQGhlYXJkT25lVG91Y2hcclxuICAgICAgcmV0dXJuXHJcbiAgICBAbGFzdEludGVyYWN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXHJcbiAgICBAZ2FtZS50b3VjaFVwKGV2dC5jbGllbnRYLCBldnQuY2xpZW50WSlcclxuXHJcbnNjcmVlbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkICdzY3JlZW4nXHJcbnJlc2l6ZVNjcmVlbiA9IC0+XHJcbiAgZGVzaXJlZEFzcGVjdFJhdGlvID0gMTYgLyA5XHJcbiAgY3VycmVudEFzcGVjdFJhdGlvID0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHRcclxuICBpZiBjdXJyZW50QXNwZWN0UmF0aW8gPCBkZXNpcmVkQXNwZWN0UmF0aW9cclxuICAgIHNjcmVlbi53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXHJcbiAgICBzY3JlZW4uaGVpZ2h0ID0gTWF0aC5mbG9vcih3aW5kb3cuaW5uZXJXaWR0aCAqICgxIC8gZGVzaXJlZEFzcGVjdFJhdGlvKSlcclxuICBlbHNlXHJcbiAgICBzY3JlZW4ud2lkdGggPSBNYXRoLmZsb29yKHdpbmRvdy5pbm5lckhlaWdodCAqIGRlc2lyZWRBc3BlY3RSYXRpbylcclxuICAgIHNjcmVlbi5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHRcclxucmVzaXplU2NyZWVuKClcclxuIyB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAncmVzaXplJywgcmVzaXplU2NyZWVuLCBmYWxzZVxyXG5cclxuYXBwID0gbmV3IE5hdGl2ZUFwcChzY3JlZW4sIHNjcmVlbi53aWR0aCwgc2NyZWVuLmhlaWdodClcclxuIl19
