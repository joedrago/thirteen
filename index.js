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

BUILD_TIMESTAMP = "1.13";

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQW5pbWF0aW9uLmNvZmZlZSIsInNyYy9CdXR0b24uY29mZmVlIiwic3JjL0ZvbnRSZW5kZXJlci5jb2ZmZWUiLCJzcmMvR2FtZS5jb2ZmZWUiLCJzcmMvSGFuZC5jb2ZmZWUiLCJzcmMvTWVudS5jb2ZmZWUiLCJzcmMvUGlsZS5jb2ZmZWUiLCJzcmMvU3ByaXRlUmVuZGVyZXIuY29mZmVlIiwic3JjL1RoaXJ0ZWVuLmNvZmZlZSIsInNyYy9mb250bWV0cmljcy5jb2ZmZWUiLCJzcmMvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBOztBQUFBLFFBQUEsR0FBVyxTQUFDLENBQUQ7RUFDVCxJQUFHLENBQUEsS0FBSyxDQUFSO0FBQ0UsV0FBTyxFQURUO0dBQUEsTUFFSyxJQUFHLENBQUEsR0FBSSxDQUFQO0FBQ0gsV0FBTyxDQUFDLEVBREw7O0FBRUwsU0FBTztBQUxFOztBQU9MO0VBQ1MsbUJBQUMsSUFBRDtBQUNYLFFBQUE7SUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksQ0FBQztJQUNkLElBQUMsQ0FBQSxHQUFELEdBQU87SUFDUCxJQUFDLENBQUEsR0FBRCxHQUFPO0FBQ1AsU0FBQSxTQUFBOztNQUNFLElBQUcsQ0FBQSxLQUFLLE9BQVI7UUFDRSxJQUFDLENBQUEsR0FBSSxDQUFBLENBQUEsQ0FBTCxHQUFVO1FBQ1YsSUFBQyxDQUFBLEdBQUksQ0FBQSxDQUFBLENBQUwsR0FBVSxFQUZaOztBQURGO0VBSlc7O3NCQVViLElBQUEsR0FBTSxTQUFBO0lBQ0osSUFBRyxrQkFBSDtNQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBTCxHQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFEaEI7O0lBRUEsSUFBRyxrQkFBSDtNQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBTCxHQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFEaEI7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QUEsQ0FBVSxDQUFDLE9BQVgsQ0FBQTtXQUNwQixJQUFDLENBQUEsSUFBSSxDQUFDLE9BQU4sQ0FBYyxHQUFHLENBQUMsT0FBbEIsRUFBMkIsR0FBRyxDQUFDLE9BQS9CO0VBSlM7Ozs7OztBQU1iLE1BQUEsR0FBUyxRQUFRLENBQUMsY0FBVCxDQUF3QixRQUF4Qjs7QUFDVCxZQUFBLEdBQWUsU0FBQTtBQUNiLE1BQUE7RUFBQSxrQkFBQSxHQUFxQixFQUFBLEdBQUs7RUFDMUIsa0JBQUEsR0FBcUIsTUFBTSxDQUFDLFVBQVAsR0FBb0IsTUFBTSxDQUFDO0VBQ2hELElBQUcsa0JBQUEsR0FBcUIsa0JBQXhCO0lBQ0UsTUFBTSxDQUFDLEtBQVAsR0FBZSxNQUFNLENBQUM7V0FDdEIsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsSUFBSSxDQUFDLEtBQUwsQ0FBVyxNQUFNLENBQUMsVUFBUCxHQUFvQixDQUFDLENBQUEsR0FBSSxrQkFBTCxDQUEvQixFQUZsQjtHQUFBLE1BQUE7SUFJRSxNQUFNLENBQUMsS0FBUCxHQUFlLElBQUksQ0FBQyxLQUFMLENBQVcsTUFBTSxDQUFDLFdBQVAsR0FBcUIsa0JBQWhDO1dBQ2YsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsTUFBTSxDQUFDLFlBTHpCOztBQUhhOztBQVNmLFlBQUEsQ0FBQTs7QUFHQSxHQUFBLEdBQU0sSUFBSSxTQUFKLENBQWMsTUFBZCxFQUFzQixNQUFNLENBQUMsS0FBN0IsRUFBb0MsTUFBTSxDQUFDLE1BQTNDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY2FsY1NpZ24gPSAodikgLT5cclxuICBpZiB2ID09IDBcclxuICAgIHJldHVybiAwXHJcbiAgZWxzZSBpZiB2IDwgMFxyXG4gICAgcmV0dXJuIC0xXHJcbiAgcmV0dXJuIDFcclxuXHJcbmNsYXNzIEFuaW1hdGlvblxyXG4gIGNvbnN0cnVjdG9yOiAoZGF0YSkgLT5cclxuICAgIEBzcGVlZCA9IGRhdGEuc3BlZWRcclxuICAgIEByZXEgPSB7fVxyXG4gICAgQGN1ciA9IHt9XHJcbiAgICBmb3Igayx2IG9mIGRhdGFcclxuICAgICAgaWYgayAhPSAnc3BlZWQnXHJcbiAgICAgICAgQHJlcVtrXSA9IHZcclxuICAgICAgICBAY3VyW2tdID0gdlxyXG5cclxuICAjICdmaW5pc2hlcycgYWxsIGFuaW1hdGlvbnNcclxuICB3YXJwOiAtPlxyXG4gICAgaWYgQGN1ci5yP1xyXG4gICAgICBAY3VyLnIgPSBAcmVxLnJcclxuICAgIGlmIEBjdXIucz9cclxuICAgICAgQGN1ci5zID0gQHJlcS5zXHJcbiAgICBpZiBAY3VyLng/IGFuZCBAY3VyLnk/XHJcbiAgICAgIEBjdXIueCA9IEByZXEueFxyXG4gICAgICBAY3VyLnkgPSBAcmVxLnlcclxuXHJcbiAgYW5pbWF0aW5nOiAtPlxyXG4gICAgaWYgQGN1ci5yP1xyXG4gICAgICBpZiBAcmVxLnIgIT0gQGN1ci5yXHJcbiAgICAgICAgcmV0dXJuIHRydWVcclxuICAgIGlmIEBjdXIucz9cclxuICAgICAgaWYgQHJlcS5zICE9IEBjdXIuc1xyXG4gICAgICAgIHJldHVybiB0cnVlXHJcbiAgICBpZiBAY3VyLng/IGFuZCBAY3VyLnk/XHJcbiAgICAgIGlmIChAcmVxLnggIT0gQGN1ci54KSBvciAoQHJlcS55ICE9IEBjdXIueSlcclxuICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gIHVwZGF0ZTogKGR0KSAtPlxyXG4gICAgdXBkYXRlZCA9IGZhbHNlXHJcbiAgICAjIHJvdGF0aW9uXHJcbiAgICBpZiBAY3VyLnI/XHJcbiAgICAgIGlmIEByZXEuciAhPSBAY3VyLnJcclxuICAgICAgICB1cGRhdGVkID0gdHJ1ZVxyXG4gICAgICAgICMgc2FuaXRpemUgcmVxdWVzdGVkIHJvdGF0aW9uXHJcbiAgICAgICAgdHdvUGkgPSBNYXRoLlBJICogMlxyXG4gICAgICAgIG5lZ1R3b1BpID0gLTEgKiB0d29QaVxyXG4gICAgICAgIEByZXEuciAtPSB0d29QaSB3aGlsZSBAcmVxLnIgPj0gdHdvUGlcclxuICAgICAgICBAcmVxLnIgKz0gdHdvUGkgd2hpbGUgQHJlcS5yIDw9IG5lZ1R3b1BpXHJcbiAgICAgICAgIyBwaWNrIGEgZGlyZWN0aW9uIGFuZCB0dXJuXHJcbiAgICAgICAgZHIgPSBAcmVxLnIgLSBAY3VyLnJcclxuICAgICAgICBkaXN0ID0gTWF0aC5hYnMoZHIpXHJcbiAgICAgICAgc2lnbiA9IGNhbGNTaWduKGRyKVxyXG4gICAgICAgIGlmIGRpc3QgPiBNYXRoLlBJXHJcbiAgICAgICAgICAjIHNwaW4gdGhlIG90aGVyIGRpcmVjdGlvbiwgaXQgaXMgY2xvc2VyXHJcbiAgICAgICAgICBkaXN0ID0gdHdvUGkgLSBkaXN0XHJcbiAgICAgICAgICBzaWduICo9IC0xXHJcbiAgICAgICAgbWF4RGlzdCA9IGR0ICogQHNwZWVkLnIgLyAxMDAwXHJcbiAgICAgICAgaWYgZGlzdCA8IG1heERpc3RcclxuICAgICAgICAgICMgd2UgY2FuIGZpbmlzaCB0aGlzIGZyYW1lXHJcbiAgICAgICAgICBAY3VyLnIgPSBAcmVxLnJcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBAY3VyLnIgKz0gbWF4RGlzdCAqIHNpZ25cclxuXHJcbiAgICAjIHNjYWxlXHJcbiAgICBpZiBAY3VyLnM/XHJcbiAgICAgIGlmIEByZXEucyAhPSBAY3VyLnNcclxuICAgICAgICB1cGRhdGVkID0gdHJ1ZVxyXG4gICAgICAgICMgcGljayBhIGRpcmVjdGlvbiBhbmQgdHVyblxyXG4gICAgICAgIGRzID0gQHJlcS5zIC0gQGN1ci5zXHJcbiAgICAgICAgZGlzdCA9IE1hdGguYWJzKGRzKVxyXG4gICAgICAgIHNpZ24gPSBjYWxjU2lnbihkcylcclxuICAgICAgICBtYXhEaXN0ID0gZHQgKiBAc3BlZWQucyAvIDEwMDBcclxuICAgICAgICBpZiBkaXN0IDwgbWF4RGlzdFxyXG4gICAgICAgICAgIyB3ZSBjYW4gZmluaXNoIHRoaXMgZnJhbWVcclxuICAgICAgICAgIEBjdXIucyA9IEByZXEuc1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIEBjdXIucyArPSBtYXhEaXN0ICogc2lnblxyXG5cclxuICAgICMgdHJhbnNsYXRpb25cclxuICAgIGlmIEBjdXIueD8gYW5kIEBjdXIueT9cclxuICAgICAgaWYgKEByZXEueCAhPSBAY3VyLngpIG9yIChAcmVxLnkgIT0gQGN1ci55KVxyXG4gICAgICAgIHVwZGF0ZWQgPSB0cnVlXHJcbiAgICAgICAgdmVjWCA9IEByZXEueCAtIEBjdXIueFxyXG4gICAgICAgIHZlY1kgPSBAcmVxLnkgLSBAY3VyLnlcclxuICAgICAgICBkaXN0ID0gTWF0aC5zcXJ0KCh2ZWNYICogdmVjWCkgKyAodmVjWSAqIHZlY1kpKVxyXG4gICAgICAgIG1heERpc3QgPSBkdCAqIEBzcGVlZC50IC8gMTAwMFxyXG4gICAgICAgIGlmIGRpc3QgPCBtYXhEaXN0XHJcbiAgICAgICAgICAjIHdlIGNhbiBmaW5pc2ggdGhpcyBmcmFtZVxyXG4gICAgICAgICAgQGN1ci54ID0gQHJlcS54XHJcbiAgICAgICAgICBAY3VyLnkgPSBAcmVxLnlcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAjIG1vdmUgYXMgbXVjaCBhcyBwb3NzaWJsZVxyXG4gICAgICAgICAgQGN1ci54ICs9ICh2ZWNYIC8gZGlzdCkgKiBtYXhEaXN0XHJcbiAgICAgICAgICBAY3VyLnkgKz0gKHZlY1kgLyBkaXN0KSAqIG1heERpc3RcclxuXHJcbiAgICByZXR1cm4gdXBkYXRlZFxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBbmltYXRpb25cclxuIiwiQW5pbWF0aW9uID0gcmVxdWlyZSAnLi9BbmltYXRpb24nXHJcblxyXG5jbGFzcyBCdXR0b25cclxuICBjb25zdHJ1Y3RvcjogKEBnYW1lLCBAc3ByaXRlTmFtZXMsIEBmb250LCBAdGV4dEhlaWdodCwgQHgsIEB5LCBAY2IpIC0+XHJcbiAgICBAYW5pbSA9IG5ldyBBbmltYXRpb24ge1xyXG4gICAgICBzcGVlZDogeyBzOiAzIH1cclxuICAgICAgczogMFxyXG4gICAgfVxyXG4gICAgQGNvbG9yID0geyByOiAxLCBnOiAxLCBiOiAxLCBhOiAwIH1cclxuXHJcbiAgdXBkYXRlOiAoZHQpIC0+XHJcbiAgICByZXR1cm4gQGFuaW0udXBkYXRlKGR0KVxyXG5cclxuICByZW5kZXI6IC0+XHJcbiAgICBAY29sb3IuYSA9IEBhbmltLmN1ci5zXHJcbiAgICBAZ2FtZS5zcHJpdGVSZW5kZXJlci5yZW5kZXIgQHNwcml0ZU5hbWVzWzBdLCBAeCwgQHksIDAsIEB0ZXh0SGVpZ2h0ICogMS41LCAwLCAwLjUsIDAuNSwgQGdhbWUuY29sb3JzLndoaXRlLCA9PlxyXG4gICAgICAjIHB1bHNlIGJ1dHRvbiBhbmltLFxyXG4gICAgICBAYW5pbS5jdXIucyA9IDFcclxuICAgICAgQGFuaW0ucmVxLnMgPSAwXHJcbiAgICAgICMgdGhlbiBjYWxsIGNhbGxiYWNrXHJcbiAgICAgIEBjYih0cnVlKVxyXG4gICAgQGdhbWUuc3ByaXRlUmVuZGVyZXIucmVuZGVyIEBzcHJpdGVOYW1lc1sxXSwgQHgsIEB5LCAwLCBAdGV4dEhlaWdodCAqIDEuNSwgMCwgMC41LCAwLjUsIEBjb2xvclxyXG4gICAgdGV4dCA9IEBjYihmYWxzZSlcclxuICAgIEBnYW1lLmZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIEB0ZXh0SGVpZ2h0LCB0ZXh0LCBAeCwgQHksIDAuNSwgMC41LCBAZ2FtZS5jb2xvcnMuYnV0dG9udGV4dFxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCdXR0b25cclxuIiwiZm9udG1ldHJpY3MgPSByZXF1aXJlICcuL2ZvbnRtZXRyaWNzJ1xyXG5cclxuIyB0YWtlbiBmcm9tIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNTYyMzgzOC9yZ2ItdG8taGV4LWFuZC1oZXgtdG8tcmdiXHJcbmhleFRvUmdiID0gKGhleCwgYSkgLT5cclxuICAgIHJlc3VsdCA9IC9eIz8oW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KShbYS1mXFxkXXsyfSkkL2kuZXhlYyhoZXgpXHJcbiAgICByZXR1cm4gbnVsbCBpZiBub3QgcmVzdWx0XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHI6IHBhcnNlSW50KHJlc3VsdFsxXSwgMTYpIC8gMjU1LFxyXG4gICAgICAgIGc6IHBhcnNlSW50KHJlc3VsdFsyXSwgMTYpIC8gMjU1LFxyXG4gICAgICAgIGI6IHBhcnNlSW50KHJlc3VsdFszXSwgMTYpIC8gMjU1XHJcbiAgICAgICAgYTogYVxyXG4gICAgfVxyXG5cclxuY2xhc3MgRm9udFJlbmRlcmVyXHJcbiAgY29uc3RydWN0b3I6ICAoQGdhbWUpIC0+XHJcbiAgICBAd2hpdGUgPSB7IHI6IDEsIGc6IDEsIGI6IDEsIGE6IDEgfVxyXG5cclxuICBzaXplOiAoZm9udCwgaGVpZ2h0LCBzdHIpIC0+XHJcbiAgICBtZXRyaWNzID0gZm9udG1ldHJpY3NbZm9udF1cclxuICAgIHJldHVybiBpZiBub3QgbWV0cmljc1xyXG4gICAgc2NhbGUgPSBoZWlnaHQgLyBtZXRyaWNzLmhlaWdodFxyXG5cclxuICAgIHRvdGFsV2lkdGggPSAwXHJcbiAgICB0b3RhbEhlaWdodCA9IG1ldHJpY3MuaGVpZ2h0ICogc2NhbGVcclxuXHJcbiAgICBpbkNvbG9yID0gZmFsc2VcclxuICAgIGZvciBjaCwgaSBpbiBzdHJcclxuICAgICAgaWYgY2ggPT0gJ2AnXHJcbiAgICAgICAgaW5Db2xvciA9ICFpbkNvbG9yXHJcblxyXG4gICAgICBpZiBub3QgaW5Db2xvclxyXG4gICAgICAgIGNvZGUgPSBjaC5jaGFyQ29kZUF0KDApXHJcbiAgICAgICAgZ2x5cGggPSBtZXRyaWNzLmdseXBoc1tjb2RlXVxyXG4gICAgICAgIGNvbnRpbnVlIGlmIG5vdCBnbHlwaFxyXG4gICAgICAgIHRvdGFsV2lkdGggKz0gZ2x5cGgueGFkdmFuY2UgKiBzY2FsZVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHc6IHRvdGFsV2lkdGhcclxuICAgICAgaDogdG90YWxIZWlnaHRcclxuICAgIH1cclxuXHJcbiAgcmVuZGVyOiAoZm9udCwgaGVpZ2h0LCBzdHIsIHgsIHksIGFuY2hvcngsIGFuY2hvcnksIGNvbG9yLCBjYikgLT5cclxuICAgIG1ldHJpY3MgPSBmb250bWV0cmljc1tmb250XVxyXG4gICAgcmV0dXJuIGlmIG5vdCBtZXRyaWNzXHJcbiAgICBzY2FsZSA9IGhlaWdodCAvIG1ldHJpY3MuaGVpZ2h0XHJcblxyXG4gICAgdG90YWxXaWR0aCA9IDBcclxuICAgIHRvdGFsSGVpZ2h0ID0gbWV0cmljcy5oZWlnaHQgKiBzY2FsZVxyXG4gICAgc2tpcENvbG9yID0gZmFsc2VcclxuICAgIGZvciBjaCwgaSBpbiBzdHJcclxuICAgICAgaWYgY2ggPT0gJ2AnXHJcbiAgICAgICAgc2tpcENvbG9yID0gIXNraXBDb2xvclxyXG4gICAgICBjb250aW51ZSBpZiBza2lwQ29sb3JcclxuICAgICAgY29kZSA9IGNoLmNoYXJDb2RlQXQoMClcclxuICAgICAgZ2x5cGggPSBtZXRyaWNzLmdseXBoc1tjb2RlXVxyXG4gICAgICBjb250aW51ZSBpZiBub3QgZ2x5cGhcclxuICAgICAgdG90YWxXaWR0aCArPSBnbHlwaC54YWR2YW5jZSAqIHNjYWxlXHJcblxyXG4gICAgYW5jaG9yT2Zmc2V0WCA9IC0xICogYW5jaG9yeCAqIHRvdGFsV2lkdGhcclxuICAgIGFuY2hvck9mZnNldFkgPSAtMSAqIGFuY2hvcnkgKiB0b3RhbEhlaWdodFxyXG4gICAgY3VyclggPSB4XHJcblxyXG4gICAgaWYgY29sb3JcclxuICAgICAgc3RhcnRpbmdDb2xvciA9IGNvbG9yXHJcbiAgICBlbHNlXHJcbiAgICAgIHN0YXJ0aW5nQ29sb3IgPSBAd2hpdGVcclxuICAgIGN1cnJlbnRDb2xvciA9IHN0YXJ0aW5nQ29sb3JcclxuXHJcbiAgICBjb2xvclN0YXJ0ID0gLTFcclxuICAgIGZvciBjaCwgaSBpbiBzdHJcclxuICAgICAgaWYgY2ggPT0gJ2AnXHJcbiAgICAgICAgaWYgY29sb3JTdGFydCA9PSAtMVxyXG4gICAgICAgICAgY29sb3JTdGFydCA9IGkgKyAxXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgbGVuID0gaSAtIGNvbG9yU3RhcnRcclxuICAgICAgICAgIGlmIGxlblxyXG4gICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBoZXhUb1JnYihzdHIuc3Vic3RyKGNvbG9yU3RhcnQsIGkgLSBjb2xvclN0YXJ0KSwgc3RhcnRpbmdDb2xvci5hKVxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBzdGFydGluZ0NvbG9yXHJcbiAgICAgICAgICBjb2xvclN0YXJ0ID0gLTFcclxuXHJcbiAgICAgIGNvbnRpbnVlIGlmIGNvbG9yU3RhcnQgIT0gLTFcclxuICAgICAgY29kZSA9IGNoLmNoYXJDb2RlQXQoMClcclxuICAgICAgZ2x5cGggPSBtZXRyaWNzLmdseXBoc1tjb2RlXVxyXG4gICAgICBjb250aW51ZSBpZiBub3QgZ2x5cGhcclxuICAgICAgQGdhbWUuZHJhd0ltYWdlIGZvbnQsXHJcbiAgICAgIGdseXBoLngsIGdseXBoLnksIGdseXBoLndpZHRoLCBnbHlwaC5oZWlnaHQsXHJcbiAgICAgIGN1cnJYICsgKGdseXBoLnhvZmZzZXQgKiBzY2FsZSkgKyBhbmNob3JPZmZzZXRYLCB5ICsgKGdseXBoLnlvZmZzZXQgKiBzY2FsZSkgKyBhbmNob3JPZmZzZXRZLCBnbHlwaC53aWR0aCAqIHNjYWxlLCBnbHlwaC5oZWlnaHQgKiBzY2FsZSxcclxuICAgICAgMCwgMCwgMCxcclxuICAgICAgY3VycmVudENvbG9yLnIsIGN1cnJlbnRDb2xvci5nLCBjdXJyZW50Q29sb3IuYiwgY3VycmVudENvbG9yLmEsIGNiXHJcbiAgICAgIGN1cnJYICs9IGdseXBoLnhhZHZhbmNlICogc2NhbGVcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRm9udFJlbmRlcmVyXHJcbiIsIkFuaW1hdGlvbiA9IHJlcXVpcmUgJy4vQW5pbWF0aW9uJ1xyXG5CdXR0b24gPSByZXF1aXJlICcuL0J1dHRvbidcclxuRm9udFJlbmRlcmVyID0gcmVxdWlyZSAnLi9Gb250UmVuZGVyZXInXHJcblNwcml0ZVJlbmRlcmVyID0gcmVxdWlyZSAnLi9TcHJpdGVSZW5kZXJlcidcclxuTWVudSA9IHJlcXVpcmUgJy4vTWVudSdcclxuSGFuZCA9IHJlcXVpcmUgJy4vSGFuZCdcclxuUGlsZSA9IHJlcXVpcmUgJy4vUGlsZSdcclxue1RoaXJ0ZWVuLCBPSywgYWlDaGFyYWN0ZXJzLCBhY2hpZXZlbWVudHNMaXN0fSA9IHJlcXVpcmUgJy4vVGhpcnRlZW4nXHJcblxyXG4jIHRlbXBcclxuQlVJTERfVElNRVNUQU1QID0gXCIxLjEzXCJcclxuXHJcblJlbmRlck1vZGUgPVxyXG4gIEdBTUU6IDBcclxuICBIT1dUTzogMVxyXG4gIEFDSElFVkVNRU5UUzogMlxyXG4gIFBBVVNFOiAzXHJcbiAgT1BUSU9OUzogNFxyXG5cclxuY2xhc3MgR2FtZVxyXG4gIGNvbnN0cnVjdG9yOiAoQG5hdGl2ZSwgQHdpZHRoLCBAaGVpZ2h0KSAtPlxyXG4gICAgQHZlcnNpb24gPSBCVUlMRF9USU1FU1RBTVBcclxuICAgIEBsb2coXCJHYW1lIGNvbnN0cnVjdGVkOiAje0B3aWR0aH14I3tAaGVpZ2h0fVwiKVxyXG4gICAgQGZvbnRSZW5kZXJlciA9IG5ldyBGb250UmVuZGVyZXIgdGhpc1xyXG4gICAgQHNwcml0ZVJlbmRlcmVyID0gbmV3IFNwcml0ZVJlbmRlcmVyIHRoaXNcclxuICAgIEBmb250ID0gXCJkYXJrZm9yZXN0XCJcclxuICAgIEB6b25lcyA9IFtdXHJcbiAgICBAbmV4dEFJVGljayA9IDEwMDAgIyB3aWxsIGJlIHNldCBieSBvcHRpb25zXHJcbiAgICBAY2VudGVyID1cclxuICAgICAgeDogQHdpZHRoIC8gMlxyXG4gICAgICB5OiBAaGVpZ2h0IC8gMlxyXG4gICAgQGFhSGVpZ2h0ID0gQHdpZHRoICogOSAvIDE2XHJcbiAgICBAbG9nIFwiaGVpZ2h0OiAje0BoZWlnaHR9LiBoZWlnaHQgaWYgc2NyZWVuIHdhcyAxNjo5IChhc3BlY3QgYWRqdXN0ZWQpOiAje0BhYUhlaWdodH1cIlxyXG4gICAgQHBhdXNlQnV0dG9uU2l6ZSA9IEBhYUhlaWdodCAvIDE1XHJcbiAgICBAY29sb3JzID1cclxuICAgICAgYXJyb3c6ICAgICAgeyByOiAgIDEsIGc6ICAgMSwgYjogICAxLCBhOiAgIDEgfVxyXG4gICAgICBhcnJvd2Nsb3NlOiB7IHI6ICAgMSwgZzogMC41LCBiOiAgIDAsIGE6IDAuMyB9XHJcbiAgICAgIGJhY2tncm91bmQ6IHsgcjogICAwLCBnOiAwLjIsIGI6ICAgMCwgYTogICAxIH1cclxuICAgICAgYmlkOiAgICAgICAgeyByOiAgIDAsIGc6IDAuNiwgYjogICAwLCBhOiAgIDEgfVxyXG4gICAgICBibGFjazogICAgICB7IHI6ICAgMCwgZzogICAwLCBiOiAgIDAsIGE6ICAgMSB9XHJcbiAgICAgIGJ1dHRvbnRleHQ6IHsgcjogICAxLCBnOiAgIDEsIGI6ICAgMSwgYTogICAxIH1cclxuICAgICAgZ2FtZV9vdmVyOiAgeyByOiAgIDEsIGc6IDAuNSwgYjogICAwLCBhOiAgIDEgfVxyXG4gICAgICBnb2xkOiAgICAgICB7IHI6ICAgMSwgZzogICAxLCBiOiAgIDAsIGE6ICAgMSB9XHJcbiAgICAgIGhhbmRfYW55OiAgIHsgcjogICAwLCBnOiAgIDAsIGI6IDAuMiwgYTogMS4wIH1cclxuICAgICAgaGFuZF9waWNrOiAgeyByOiAgIDAsIGc6IDAuMSwgYjogICAwLCBhOiAxLjAgfVxyXG4gICAgICBoYW5kX3Jlb3JnOiB7IHI6IDAuNCwgZzogICAwLCBiOiAgIDAsIGE6IDEuMCB9XHJcbiAgICAgIGxpZ2h0Z3JheTogIHsgcjogMC41LCBnOiAwLjUsIGI6IDAuNSwgYTogICAxIH1cclxuICAgICAgbG9nYmc6ICAgICAgeyByOiAwLjEsIGc6ICAgMCwgYjogICAwLCBhOiAgIDEgfVxyXG4gICAgICBsb2djb2xvcjogICB7IHI6IDAuNSwgZzogMC41LCBiOiAwLjUsIGE6ICAgMSB9XHJcbiAgICAgIG1haW5tZW51OiAgIHsgcjogMC4xLCBnOiAwLjEsIGI6IDAuMSwgYTogICAxIH1cclxuICAgICAgb3JhbmdlOiAgICAgeyByOiAgIDEsIGc6IDAuNSwgYjogICAwLCBhOiAgIDEgfVxyXG4gICAgICBvdmVybGF5OiAgICB7IHI6ICAgMCwgZzogICAwLCBiOiAgIDAsIGE6IDAuNiB9XHJcbiAgICAgIHBhdXNlbWVudTogIHsgcjogMC4xLCBnOiAwLjAsIGI6IDAuMSwgYTogICAxIH1cclxuICAgICAgb3B0aW9ubWVudTogeyByOiAwLjAsIGc6IDAuMSwgYjogMC4xLCBhOiAgIDEgfVxyXG4gICAgICBwaWxlOiAgICAgICB7IHI6IDAuNCwgZzogMC4yLCBiOiAgIDAsIGE6ICAgMSB9XHJcbiAgICAgIHBsYXlfYWdhaW46IHsgcjogICAwLCBnOiAgIDAsIGI6ICAgMCwgYTogMC42IH1cclxuICAgICAgcmVkOiAgICAgICAgeyByOiAgIDEsIGc6ICAgMCwgYjogICAwLCBhOiAgIDEgfVxyXG4gICAgICB3aGl0ZTogICAgICB7IHI6ICAgMSwgZzogICAxLCBiOiAgIDEsIGE6ICAgMSB9XHJcbiAgICAgIGFjaF9iZzogICAgIHsgcjogMC4xLCBnOiAwLjEsIGI6IDAuMSwgYTogICAxIH1cclxuICAgICAgYWNoX2hlYWRlcjogeyByOiAgIDEsIGc6IDAuNSwgYjogICAwLCBhOiAgIDEgfVxyXG4gICAgICBhY2hfdGl0bGU6ICB7IHI6ICAgMSwgZzogICAxLCBiOiAgIDEsIGE6ICAgMSB9XHJcbiAgICAgIGFjaF9kZXNjOiAgIHsgcjogMC43LCBnOiAwLjcsIGI6IDAuNywgYTogICAxIH1cclxuXHJcbiAgICBAdGV4dHVyZXMgPVxyXG4gICAgICBcImNhcmRzXCI6IDBcclxuICAgICAgXCJkYXJrZm9yZXN0XCI6IDFcclxuICAgICAgXCJjaGFyc1wiOiAyXHJcbiAgICAgIFwiaG93dG8xXCI6IDNcclxuXHJcbiAgICBAdGhpcnRlZW4gPSBudWxsXHJcbiAgICBAbGFzdEVyciA9ICcnXHJcbiAgICBAcmVuZGVyTW9kZSA9IFJlbmRlck1vZGUuR0FNRVxyXG4gICAgQHJlbmRlckNvbW1hbmRzID0gW11cclxuICAgIEBhY2hpZXZlbWVudEZhbmZhcmUgPSBudWxsXHJcblxyXG4gICAgQG9wdGlvbk1lbnVzID1cclxuICAgICAgc3BlZWRzOiBbXHJcbiAgICAgICAgeyB0ZXh0OiBcIkFJIFNwZWVkOiBTbG93XCIsIHNwZWVkOiAyMDAwIH1cclxuICAgICAgICB7IHRleHQ6IFwiQUkgU3BlZWQ6IE1lZGl1bVwiLCBzcGVlZDogMTAwMCB9XHJcbiAgICAgICAgeyB0ZXh0OiBcIkFJIFNwZWVkOiBGYXN0XCIsIHNwZWVkOiA1MDAgfVxyXG4gICAgICAgIHsgdGV4dDogXCJBSSBTcGVlZDogVWx0cmFcIiwgc3BlZWQ6IDI1MCB9XHJcbiAgICAgIF1cclxuICAgICAgc29ydHM6IFtcclxuICAgICAgICB7IHRleHQ6IFwiU29ydCBPcmRlcjogTm9ybWFsXCIgfVxyXG4gICAgICAgIHsgdGV4dDogXCJTb3J0IE9yZGVyOiBSZXZlcnNlXCIgfVxyXG4gICAgICBdXHJcbiAgICAgIGF1dG9wYXNzZXM6IFtcclxuICAgICAgICB7IHRleHQ6IFwiQXV0b1Bhc3M6IERpc2FibGVkXCIgfVxyXG4gICAgICAgIHsgdGV4dDogXCJBdXRvUGFzczogRnVsbFwiIH1cclxuICAgICAgICB7IHRleHQ6IFwiQXV0b1Bhc3M6IExpbWl0ZWRcIiB9XHJcbiAgICAgIF1cclxuICAgIEBvcHRpb25zID1cclxuICAgICAgc3BlZWRJbmRleDogMVxyXG4gICAgICBzb3J0SW5kZXg6IDBcclxuICAgICAgc291bmQ6IHRydWVcclxuICAgICAgYXV0b3Bhc3NJbmRleDogMlxyXG5cclxuICAgIEBwYXVzZU1lbnUgPSBuZXcgTWVudSB0aGlzLCBcIlBhdXNlZFwiLCBcInNvbGlkXCIsIEBjb2xvcnMucGF1c2VtZW51LCBbXHJcbiAgICAgIChjbGljaykgPT5cclxuICAgICAgICBpZiBjbGlja1xyXG4gICAgICAgICAgQHJlbmRlck1vZGUgPSBSZW5kZXJNb2RlLkdBTUVcclxuICAgICAgICByZXR1cm4gXCJSZXN1bWUgR2FtZVwiXHJcbiAgICAgIChjbGljaykgPT5cclxuICAgICAgICBpZiBjbGlja1xyXG4gICAgICAgICAgQHJlbmRlck1vZGUgPSBSZW5kZXJNb2RlLk9QVElPTlNcclxuICAgICAgICByZXR1cm4gXCJPcHRpb25zXCJcclxuICAgICAgKGNsaWNrKSA9PlxyXG4gICAgICAgIGlmIGNsaWNrXHJcbiAgICAgICAgICBAcmVuZGVyTW9kZSA9IFJlbmRlck1vZGUuQUNISUVWRU1FTlRTXHJcbiAgICAgICAgcmV0dXJuIFwiQWNoaWV2ZW1lbnRzXCJcclxuICAgICAgKGNsaWNrKSA9PlxyXG4gICAgICAgIGlmIGNsaWNrXHJcbiAgICAgICAgICBAcmVuZGVyTW9kZSA9IFJlbmRlck1vZGUuSE9XVE9cclxuICAgICAgICByZXR1cm4gXCJIb3cgVG8gUGxheVwiXHJcbiAgICAgIChjbGljaykgPT5cclxuICAgICAgICBpZiBjbGlja1xyXG4gICAgICAgICAgQG5ld0dhbWUodHJ1ZSlcclxuICAgICAgICAgIEByZW5kZXJNb2RlID0gUmVuZGVyTW9kZS5HQU1FXHJcbiAgICAgICAgcmV0dXJuIFwiTmV3IE1vbmV5IEdhbWVcIlxyXG4gICAgICAoY2xpY2spID0+XHJcbiAgICAgICAgaWYgY2xpY2tcclxuICAgICAgICAgIEBuZXdHYW1lKGZhbHNlKVxyXG4gICAgICAgICAgQHJlbmRlck1vZGUgPSBSZW5kZXJNb2RlLkdBTUVcclxuICAgICAgICByZXR1cm4gXCJOZXcgR2FtZVwiXHJcbiAgICBdXHJcblxyXG4gICAgQG9wdGlvbk1lbnUgPSBuZXcgTWVudSB0aGlzLCBcIk9wdGlvbnNcIiwgXCJzb2xpZFwiLCBAY29sb3JzLm9wdGlvbm1lbnUsIFtcclxuICAgICAgKGNsaWNrKSA9PlxyXG4gICAgICAgIGlmIGNsaWNrXHJcbiAgICAgICAgICBAb3B0aW9ucy5zcGVlZEluZGV4ID0gKEBvcHRpb25zLnNwZWVkSW5kZXggKyAxKSAlIEBvcHRpb25NZW51cy5zcGVlZHMubGVuZ3RoXHJcbiAgICAgICAgcmV0dXJuIEBvcHRpb25NZW51cy5zcGVlZHNbQG9wdGlvbnMuc3BlZWRJbmRleF0udGV4dFxyXG4gICAgICAoY2xpY2spID0+XHJcbiAgICAgICAgaWYgY2xpY2tcclxuICAgICAgICAgIEBvcHRpb25zLmF1dG9wYXNzSW5kZXggPSAoQG9wdGlvbnMuYXV0b3Bhc3NJbmRleCArIDEpICUgQG9wdGlvbk1lbnVzLmF1dG9wYXNzZXMubGVuZ3RoXHJcbiAgICAgICAgcmV0dXJuIEBvcHRpb25NZW51cy5hdXRvcGFzc2VzW0BvcHRpb25zLmF1dG9wYXNzSW5kZXhdLnRleHRcclxuICAgICAgKGNsaWNrKSA9PlxyXG4gICAgICAgIGlmIGNsaWNrXHJcbiAgICAgICAgICBAb3B0aW9ucy5zb3J0SW5kZXggPSAoQG9wdGlvbnMuc29ydEluZGV4ICsgMSkgJSBAb3B0aW9uTWVudXMuc29ydHMubGVuZ3RoXHJcbiAgICAgICAgcmV0dXJuIEBvcHRpb25NZW51cy5zb3J0c1tAb3B0aW9ucy5zb3J0SW5kZXhdLnRleHRcclxuICAgICAgKGNsaWNrKSA9PlxyXG4gICAgICAgIGlmIGNsaWNrXHJcbiAgICAgICAgICBAcmVuZGVyTW9kZSA9IFJlbmRlck1vZGUuUEFVU0VcclxuICAgICAgICByZXR1cm4gXCJCYWNrXCJcclxuICAgIF1cclxuXHJcbiAgICBAdGhpcnRlZW4gPSBuZXcgVGhpcnRlZW4gdGhpcywge31cclxuICAgIEBsb2cgXCJwbGF5ZXIgMCdzIGhhbmQ6IFwiICsgSlNPTi5zdHJpbmdpZnkoQHRoaXJ0ZWVuLnBsYXllcnNbMF0uaGFuZClcclxuICAgIEBwcmVwYXJlR2FtZSgpXHJcblxyXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAjIGxvZ2dpbmdcclxuXHJcbiAgbG9nOiAocykgLT5cclxuICAgIEBuYXRpdmUubG9nKHMpXHJcblxyXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAjIGxvYWQgLyBzYXZlXHJcblxyXG4gIGxvYWQ6IChqc29uKSAtPlxyXG4gICAgQGxvZyBcIihDUykgbG9hZGluZyBzdGF0ZVwiXHJcbiAgICB0cnlcclxuICAgICAgc3RhdGUgPSBKU09OLnBhcnNlIGpzb25cclxuICAgIGNhdGNoXHJcbiAgICAgIEBsb2cgXCJsb2FkIGZhaWxlZCB0byBwYXJzZSBzdGF0ZTogI3tqc29ufVwiXHJcbiAgICAgIHJldHVyblxyXG4gICAgaWYgc3RhdGUub3B0aW9uc1xyXG4gICAgICBmb3IgaywgdiBvZiBzdGF0ZS5vcHRpb25zXHJcbiAgICAgICAgQG9wdGlvbnNba10gPSB2XHJcblxyXG4gICAgaWYgc3RhdGUudGhpcnRlZW5cclxuICAgICAgQGxvZyBcInJlY3JlYXRpbmcgZ2FtZSBmcm9tIHNhdmVkYXRhXCJcclxuICAgICAgQHRoaXJ0ZWVuID0gbmV3IFRoaXJ0ZWVuIHRoaXMsIHtcclxuICAgICAgICBzdGF0ZTogc3RhdGUudGhpcnRlZW5cclxuICAgICAgfVxyXG4gICAgICBAcHJlcGFyZUdhbWUoKVxyXG5cclxuICBzYXZlOiAtPlxyXG4gICAgIyBAbG9nIFwiKENTKSBzYXZpbmcgc3RhdGVcIlxyXG4gICAgc3RhdGUgPSB7XHJcbiAgICAgIG9wdGlvbnM6IEBvcHRpb25zXHJcbiAgICB9XHJcblxyXG4gICAgaWYgQHRoaXJ0ZWVuP1xyXG4gICAgICBAdGhpcnRlZW4udXBkYXRlUGxheWVySGFuZChAaGFuZC5jYXJkcylcclxuICAgICAgc3RhdGUudGhpcnRlZW4gPSBAdGhpcnRlZW4uc2F2ZSgpXHJcblxyXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5IHN0YXRlXHJcblxyXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgYWlUaWNrUmF0ZTogLT5cclxuICAgIHJldHVybiBAb3B0aW9uTWVudXMuc3BlZWRzW0BvcHRpb25zLnNwZWVkSW5kZXhdLnNwZWVkXHJcblxyXG4gIG5ld0dhbWU6IChtb25leSkgLT5cclxuICAgIEB0aGlydGVlbi5uZXdHYW1lKG1vbmV5KVxyXG4gICAgQHByZXBhcmVHYW1lKClcclxuXHJcbiAgcHJlcGFyZUdhbWU6IC0+XHJcbiAgICBAaGFuZCA9IG5ldyBIYW5kIHRoaXNcclxuICAgIEBwaWxlID0gbmV3IFBpbGUgdGhpcywgQGhhbmRcclxuICAgIEBoYW5kLnNldCBAdGhpcnRlZW4ucGxheWVyc1swXS5oYW5kXHJcbiAgICBAbGFzdEVyciA9ICcnXHJcblxyXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAjIGlucHV0IGhhbmRsaW5nXHJcblxyXG4gIHRvdWNoRG93bjogKHgsIHkpIC0+XHJcbiAgICAjIEBsb2coXCJ0b3VjaERvd24gI3t4fSwje3l9XCIpXHJcbiAgICBAY2hlY2tab25lcyh4LCB5KVxyXG5cclxuICB0b3VjaE1vdmU6ICh4LCB5KSAtPlxyXG4gICAgIyBAbG9nKFwidG91Y2hNb3ZlICN7eH0sI3t5fVwiKVxyXG4gICAgaWYgQHRoaXJ0ZWVuICE9IG51bGxcclxuICAgICAgQGhhbmQubW92ZSh4LCB5KVxyXG5cclxuICB0b3VjaFVwOiAoeCwgeSkgLT5cclxuICAgICMgQGxvZyhcInRvdWNoVXAgI3t4fSwje3l9XCIpXHJcbiAgICBpZiBAdGhpcnRlZW4gIT0gbnVsbFxyXG4gICAgICBAaGFuZC51cCh4LCB5KVxyXG5cclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgIyBoZWFkbGluZSAoZ2FtZSBzdGF0ZSBpbiB0b3AgbGVmdClcclxuXHJcbiAgcHJldHR5RXJyb3JUYWJsZToge1xyXG4gICAgICBnYW1lT3ZlcjogICAgICAgICAgIFwiVGhlIGdhbWUgaXMgb3Zlci5cIlxyXG4gICAgICBpbnZhbGlkUGxheTogICAgICAgIFwiTm90IGEgdmFsaWQgcGxheS5cIlxyXG4gICAgICBtdXN0QnJlYWtPclBhc3M6ICAgIFwiWW91IHBhc3NlZCBhbHJlYWR5LCBzbyAyLWJyZWFrZXIgb3IgcGFzcy5cIlxyXG4gICAgICBtdXN0UGFzczogICAgICAgICAgIFwiWW91IG11c3QgcGFzcy5cIlxyXG4gICAgICBtdXN0VGhyb3czUzogICAgICAgIFwiWW91IG11c3QgdXNlIHRoZSAzXFx4YzggaW4geW91ciBwbGF5LlwiXHJcbiAgICAgIG5vdFlvdXJUdXJuOiAgICAgICAgXCJJdCBpcyBub3QgeW91ciB0dXJuLlwiXHJcbiAgICAgIHRocm93QW55dGhpbmc6ICAgICAgXCJZb3UgaGF2ZSBjb250cm9sLCB0aHJvdyBhbnl0aGluZy5cIlxyXG4gICAgICB0b29Mb3dQbGF5OiAgICAgICAgIFwiVGhpcyBwbGF5IGlzIG5vdCBzdHJvbmdlciB0aGFuIHRoZSBjdXJyZW50IHBsYXkuXCJcclxuICAgICAgd3JvbmdQbGF5OiAgICAgICAgICBcIlRoaXMgcGxheSBkb2VzIG5vdCBtYXRjaCB0aGUgY3VycmVudCBwbGF5LlwiXHJcbiAgfVxyXG5cclxuICBwcmV0dHlFcnJvcjogLT5cclxuICAgIHByZXR0eSA9IEBwcmV0dHlFcnJvclRhYmxlW0BsYXN0RXJyXVxyXG4gICAgcmV0dXJuIHByZXR0eSBpZiBwcmV0dHlcclxuICAgIHJldHVybiBAbGFzdEVyclxyXG5cclxuICBjYWxjSGVhZGxpbmU6IC0+XHJcbiAgICByZXR1cm4gXCJcIiBpZiBAdGhpcnRlZW4gPT0gbnVsbFxyXG5cclxuICAgIGhlYWRsaW5lID0gQHRoaXJ0ZWVuLmhlYWRsaW5lKClcclxuICAgICMgc3dpdGNoIEB0aGlydGVlbi5zdGF0ZVxyXG4gICAgIyAgIHdoZW4gU3RhdGUuQklEXHJcbiAgICAjICAgICBoZWFkbGluZSA9IFwiV2FpdGluZyBmb3IgYGZmNzcwMGAje0B0aGlydGVlbi5wbGF5ZXJzW0B0aGlydGVlbi50dXJuXS5uYW1lfWBgIHRvIGBmZmZmMDBgYmlkYGBcIlxyXG4gICAgIyAgIHdoZW4gU3RhdGUuVFJJQ0tcclxuICAgICMgICAgIGhlYWRsaW5lID0gXCJXYWl0aW5nIGZvciBgZmY3NzAwYCN7QHRoaXJ0ZWVuLnBsYXllcnNbQHRoaXJ0ZWVuLnR1cm5dLm5hbWV9YGAgdG8gYGZmZmYwMGBwbGF5YGBcIlxyXG4gICAgIyAgIHdoZW4gU3RhdGUuUk9VTkRTVU1NQVJZXHJcbiAgICAjICAgICBoZWFkbGluZSA9IFwiV2FpdGluZyBmb3IgbmV4dCByb3VuZC4uLlwiXHJcbiAgICAjICAgd2hlbiBTdGF0ZS5QT1NUR0FNRVNVTU1BUllcclxuICAgICMgICAgIGhlYWRsaW5lID0gXCJHYW1lIG92ZXIhXCJcclxuXHJcbiAgICBlcnJUZXh0ID0gXCJcIlxyXG4gICAgaWYgKEBsYXN0RXJyLmxlbmd0aCA+IDApIGFuZCAoQGxhc3RFcnIgIT0gT0spXHJcbiAgICAgIGVyclRleHQgPSBcIiAgYGZmZmZmZmBFUlJPUjogYGZmMDAwMGAje0BwcmV0dHlFcnJvcigpfVwiXHJcbiAgICAgIGhlYWRsaW5lICs9IGVyclRleHRcclxuXHJcbiAgICByZXR1cm4gaGVhZGxpbmVcclxuXHJcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICMgZ2FtZSBvdmVyIGluZm9ybWF0aW9uXHJcblxyXG4gIGdhbWVPdmVyVGV4dDogLT5cclxuICAgIHdpbm5lciA9IEB0aGlydGVlbi53aW5uZXIoKVxyXG4gICAgaWYgd2lubmVyLm5hbWUgPT0gXCJQbGF5ZXJcIlxyXG4gICAgICBpZiBAdGhpcnRlZW4ubGFzdFN0cmVhayA9PSAxXHJcbiAgICAgICAgcmV0dXJuIFtcIllvdSB3aW4hXCIsIFwiQSBuZXcgc3RyZWFrIVwiXVxyXG4gICAgICByZXR1cm4gW1wiWW91IHdpbiFcIiwgXCIje0B0aGlydGVlbi5sYXN0U3RyZWFrfSBpbiBhIHJvdyFcIl1cclxuICAgIGlmIEB0aGlydGVlbi5sYXN0U3RyZWFrID09IDBcclxuICAgICAgcmV0dXJuIFtcIiN7d2lubmVyLm5hbWV9IHdpbnMhXCIsIFwiVHJ5IGFnYWluLi4uXCJdXHJcbiAgICByZXR1cm4gW1wiI3t3aW5uZXIubmFtZX0gd2lucyFcIiwgXCJTdHJlYWsgZW5kZWQ6ICN7QHRoaXJ0ZWVuLmxhc3RTdHJlYWt9IHdpbnNcIl1cclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgIyBjYXJkIGhhbmRsaW5nXHJcblxyXG4gIHBhc3M6IC0+XHJcbiAgICBAbGFzdEVyciA9IEB0aGlydGVlbi5wYXNzIHtcclxuICAgICAgaWQ6IDFcclxuICAgIH1cclxuXHJcbiAgcGxheTogKGNhcmRzKSAtPlxyXG4gICAgY29uc29sZS5sb2cgXCIoZ2FtZSkgcGxheWluZyBjYXJkc1wiLCBjYXJkc1xyXG5cclxuICAgIEB0aGlydGVlbi51cGRhdGVQbGF5ZXJIYW5kKEBoYW5kLmNhcmRzKVxyXG5cclxuICAgIHJhd0NhcmRzID0gW11cclxuICAgIGZvciBjYXJkIGluIGNhcmRzXHJcbiAgICAgIHJhd0NhcmRzLnB1c2ggY2FyZC5jYXJkXHJcblxyXG4gICAgcmV0ID0gQHRoaXJ0ZWVuLnBsYXkge1xyXG4gICAgICBpZDogMVxyXG4gICAgICBjYXJkczogcmF3Q2FyZHNcclxuICAgIH1cclxuICAgIEBsYXN0RXJyID0gcmV0XHJcbiAgICBpZiByZXQgPT0gT0tcclxuICAgICAgQGhhbmQuc2V0IEB0aGlydGVlbi5wbGF5ZXJzWzBdLmhhbmRcclxuICAgICAgQHBpbGUuaGludCBjYXJkc1xyXG5cclxuICBwbGF5UGlja2VkOiAtPlxyXG4gICAgaWYgbm90IEBoYW5kLnBpY2tpbmdcclxuICAgICAgcmV0dXJuXHJcbiAgICBjYXJkcyA9IEBoYW5kLnNlbGVjdGVkQ2FyZHMoKVxyXG4gICAgIyBAaGFuZC5zZWxlY3ROb25lKClcclxuICAgIGlmIGNhcmRzLmxlbmd0aCA9PSAwXHJcbiAgICAgIHJldHVybiBAcGFzcygpXHJcbiAgICAjIEBoYW5kLnRvZ2dsZVBpY2tpbmcoKVxyXG4gICAgcmV0dXJuIEBwbGF5KGNhcmRzKVxyXG5cclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgIyBtYWluIGxvb3BcclxuXHJcbiAgdXBkYXRlOiAoZHQpIC0+XHJcbiAgICBAem9uZXMubGVuZ3RoID0gMCAjIGZvcmdldCBhYm91dCB6b25lcyBmcm9tIHRoZSBsYXN0IGZyYW1lLiB3ZSdyZSBhYm91dCB0byBtYWtlIHNvbWUgbmV3IG9uZXMhXHJcblxyXG4gICAgdXBkYXRlZCA9IGZhbHNlXHJcbiAgICBpZiBAdXBkYXRlR2FtZShkdClcclxuICAgICAgdXBkYXRlZCA9IHRydWVcclxuXHJcbiAgICByZXR1cm4gdXBkYXRlZFxyXG5cclxuICB1cGRhdGVHYW1lOiAoZHQpIC0+XHJcbiAgICByZXR1cm4gZmFsc2UgaWYgQHRoaXJ0ZWVuID09IG51bGxcclxuXHJcbiAgICB1cGRhdGVkID0gZmFsc2VcclxuXHJcbiAgICBpZiBAcGlsZS51cGRhdGUoZHQpXHJcbiAgICAgIHVwZGF0ZWQgPSB0cnVlXHJcbiAgICBpZiBAcGlsZS5yZWFkeUZvck5leHRUcmljaygpXHJcbiAgICAgIEBuZXh0QUlUaWNrIC09IGR0XHJcbiAgICAgIGlmIEBuZXh0QUlUaWNrIDw9IDBcclxuICAgICAgICBAbmV4dEFJVGljayA9IEBhaVRpY2tSYXRlKClcclxuICAgICAgICBpZiBAdGhpcnRlZW4uYWlUaWNrKClcclxuICAgICAgICAgIHVwZGF0ZWQgPSB0cnVlXHJcbiAgICBpZiBAaGFuZC51cGRhdGUoZHQpXHJcbiAgICAgIHVwZGF0ZWQgPSB0cnVlXHJcblxyXG4gICAgQHBpbGUuc2V0IEB0aGlydGVlbi50aHJvd0lELCBAdGhpcnRlZW4ucGlsZSwgQHRoaXJ0ZWVuLnBpbGVXaG9cclxuXHJcbiAgICBpZiBAcGF1c2VNZW51LnVwZGF0ZShkdClcclxuICAgICAgdXBkYXRlZCA9IHRydWVcclxuXHJcbiAgICBpZiBAb3B0aW9uTWVudS51cGRhdGUoZHQpXHJcbiAgICAgIHVwZGF0ZWQgPSB0cnVlXHJcblxyXG4gICAgaWYgQGFjaGlldmVtZW50RmFuZmFyZSAhPSBudWxsXHJcbiAgICAgIEBhY2hpZXZlbWVudEZhbmZhcmUudGltZSArPSBkdFxyXG4gICAgICBpZiBAYWNoaWV2ZW1lbnRGYW5mYXJlLnRpbWUgPiA1MDAwXHJcbiAgICAgICAgQGFjaGlldmVtZW50RmFuZmFyZSA9IG51bGxcclxuICAgICAgdXBkYXRlZCA9IHRydWVcclxuXHJcbiAgICBpZiBAYWNoaWV2ZW1lbnRGYW5mYXJlID09IG51bGxcclxuICAgICAgaWYgQHRoaXJ0ZWVuLmZhbmZhcmVzLmxlbmd0aCA+IDBcclxuICAgICAgICBAYWNoaWV2ZW1lbnRGYW5mYXJlID1cclxuICAgICAgICAgIHRpdGxlOiBAdGhpcnRlZW4uZmFuZmFyZXMuc2hpZnQoKVxyXG4gICAgICAgICAgdGltZTogMFxyXG5cclxuICAgIHJldHVybiB1cGRhdGVkXHJcblxyXG4gIHJlbmRlcjogLT5cclxuICAgICMgUmVzZXQgcmVuZGVyIGNvbW1hbmRzXHJcbiAgICBAcmVuZGVyQ29tbWFuZHMubGVuZ3RoID0gMFxyXG5cclxuICAgIHN3aXRjaCBAcmVuZGVyTW9kZVxyXG4gICAgICB3aGVuIFJlbmRlck1vZGUuSE9XVE9cclxuICAgICAgICBAcmVuZGVySG93dG8oKVxyXG4gICAgICB3aGVuIFJlbmRlck1vZGUuQUNISUVWRU1FTlRTXHJcbiAgICAgICAgQHJlbmRlckFjaGlldmVtZW50cygpXHJcbiAgICAgIHdoZW4gUmVuZGVyTW9kZS5PUFRJT05TXHJcbiAgICAgICAgQHJlbmRlck9wdGlvbnMoKVxyXG4gICAgICB3aGVuIFJlbmRlck1vZGUuUEFVU0VcclxuICAgICAgICBAcmVuZGVyUGF1c2UoKVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgQHJlbmRlckdhbWUoKVxyXG5cclxuICAgIHJldHVybiBAcmVuZGVyQ29tbWFuZHNcclxuXHJcbiAgcmVuZGVyUGF1c2U6IC0+XHJcbiAgICBAcGF1c2VNZW51LnJlbmRlcigpXHJcblxyXG4gIHJlbmRlck9wdGlvbnM6IC0+XHJcbiAgICBAb3B0aW9uTWVudS5yZW5kZXIoKVxyXG5cclxuICByZW5kZXJIb3d0bzogLT5cclxuICAgIGhvd3RvVGV4dHVyZSA9IFwiaG93dG8xXCJcclxuICAgIEBsb2cgXCJyZW5kZXJpbmcgI3tob3d0b1RleHR1cmV9XCJcclxuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJzb2xpZFwiLCAwLCAwLCBAd2lkdGgsIEBoZWlnaHQsIDAsIDAsIDAsIEBjb2xvcnMuYmxhY2tcclxuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgaG93dG9UZXh0dXJlLCAwLCAwLCBAd2lkdGgsIEBhYUhlaWdodCwgMCwgMCwgMCwgQGNvbG9ycy53aGl0ZSwgPT5cclxuICAgICAgQHJlbmRlck1vZGUgPSBSZW5kZXJNb2RlLlBBVVNFXHJcblxyXG4gIGRlYnVnOiAtPlxyXG4gICAgY29uc29sZS5sb2cgXCJkZWJ1ZyBhY2hcIlxyXG4gICAgY29uc29sZS5sb2cgQHRoaXJ0ZWVuLmFjaFxyXG4gICAgIyBAdGhpcnRlZW4uYWNoLmVhcm5lZCA9IHt9XHJcbiAgICAjIEB0aGlydGVlbi5hY2guZWFybmVkLnZldGVyYW4gPSB0cnVlXHJcbiAgICAjIEB0aGlydGVlbi5hY2guZWFybmVkLnRyeWhhcmQgPSB0cnVlXHJcbiAgICAjIEB0aGlydGVlbi5hY2guZWFybmVkLmJyZWFrZXIgPSB0cnVlXHJcbiAgICAjIEB0aGlydGVlbi5hY2guZWFybmVkLmtlZXBpdGxvdyA9IHRydWVcclxuICAgICMgQHRoaXJ0ZWVuLmFjaC5lYXJuZWQuc3VpdGVkID0gdHJ1ZVxyXG4gICAgIyBAdGhpcnRlZW4uYWNoLmVhcm5lZC50b255ID0gdHJ1ZVxyXG4gICAgIyBAdGhpcnRlZW4uYWNoLmVhcm5lZC5zYW1wbGVyID0gdHJ1ZVxyXG4gICAgIyBAdGhpcnRlZW4uYWNoLmVhcm5lZC50cmFnZWR5ID0gdHJ1ZVxyXG4gICAgIyBAdGhpcnRlZW4uYWNoLmVhcm5lZC5pbmRvbWl0YWJsZSA9IHRydWVcclxuICAgICMgQHRoaXJ0ZWVuLmFjaC5lYXJuZWQucmVrdCA9IHRydWVcclxuICAgICMgQHRoaXJ0ZWVuLmFjaC5lYXJuZWQubGF0ZSA9IHRydWVcclxuICAgICMgQHRoaXJ0ZWVuLmFjaC5lYXJuZWQucGFpcnMgPSB0cnVlXHJcblxyXG4gICAgIyBAdGhpcnRlZW4uYWNoLnN0YXRlLnRvdGFsR2FtZXMgPSAwXHJcbiAgICAjIEB0aGlydGVlbi5zdHJlYWsgPSAwXHJcblxyXG4gIHJlbmRlckFjaGlldmVtZW50czogLT5cclxuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJzb2xpZFwiLCAwLCAwLCBAd2lkdGgsIEBoZWlnaHQsIDAsIDAsIDAsIEBjb2xvcnMuYWNoX2JnLCA9PlxyXG4gICAgICBAcmVuZGVyTW9kZSA9IFJlbmRlck1vZGUuUEFVU0VcclxuXHJcbiAgICB0aXRsZUhlaWdodCA9IEBoZWlnaHQgLyAyMFxyXG4gICAgdGl0bGVPZmZzZXQgPSB0aXRsZUhlaWdodCAvIDJcclxuICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCB0aXRsZUhlaWdodCwgXCJBY2hpZXZlbWVudHNcIiwgQGNlbnRlci54LCB0aXRsZU9mZnNldCwgMC41LCAwLjUsIEBjb2xvcnMuYWNoX2hlYWRlclxyXG5cclxuICAgIGltYWdlTWFyZ2luID0gQHdpZHRoIC8gMTVcclxuICAgIHRvcEhlaWdodCA9IHRpdGxlSGVpZ2h0XHJcbiAgICB4ID0gQHdpZHRoIC8gMTIwXHJcbiAgICB5ID0gdG9wSGVpZ2h0XHJcbiAgICB0aXRsZUhlaWdodCA9IEBoZWlnaHQgLyAyMlxyXG4gICAgZGVzY0hlaWdodCA9IEBoZWlnaHQgLyAzMFxyXG4gICAgaW1hZ2VEaW0gPSB0aXRsZUhlaWdodCAqIDJcclxuICAgIGZvciBhY2gsIGFjaEluZGV4IGluIGFjaGlldmVtZW50c0xpc3RcclxuICAgICAgaWNvbiA9IFwic3Rhcl9vZmZcIlxyXG4gICAgICBpZiBAdGhpcnRlZW4uYWNoLmVhcm5lZFthY2guaWRdXHJcbiAgICAgICAgaWNvbiA9IFwic3Rhcl9vblwiXHJcbiAgICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgaWNvbiwgeCwgeSwgaW1hZ2VEaW0sIGltYWdlRGltLCAwLCAwLCAwLCBAY29sb3JzLndoaXRlXHJcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCB0aXRsZUhlaWdodCwgYWNoLnRpdGxlLCB4ICsgaW1hZ2VNYXJnaW4sIHksIDAsIDAsIEBjb2xvcnMuYWNoX3RpdGxlXHJcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCBkZXNjSGVpZ2h0LCBhY2guZGVzY3JpcHRpb25bMF0sIHggKyBpbWFnZU1hcmdpbiwgeSArIHRpdGxlSGVpZ2h0LCAwLCAwLCBAY29sb3JzLmFjaF9kZXNjXHJcbiAgICAgIGlmIGFjaC5wcm9ncmVzcz9cclxuICAgICAgICBwcm9ncmVzcyA9IGFjaC5wcm9ncmVzcyhAdGhpcnRlZW4uYWNoKVxyXG4gICAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCBkZXNjSGVpZ2h0LCBwcm9ncmVzcywgeCArIGltYWdlTWFyZ2luLCB5ICsgdGl0bGVIZWlnaHQgKyBkZXNjSGVpZ2h0LCAwLCAwLCBAY29sb3JzLmFjaF9kZXNjXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBpZiBhY2guZGVzY3JpcHRpb24ubGVuZ3RoID4gMVxyXG4gICAgICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIGRlc2NIZWlnaHQsIGFjaC5kZXNjcmlwdGlvblsxXSwgeCArIGltYWdlTWFyZ2luLCB5ICsgdGl0bGVIZWlnaHQgKyBkZXNjSGVpZ2h0LCAwLCAwLCBAY29sb3JzLmFjaF9kZXNjXHJcbiAgICAgIGlmIGFjaEluZGV4ID09IDZcclxuICAgICAgICB5ID0gdG9wSGVpZ2h0XHJcbiAgICAgICAgeCArPSBAd2lkdGggLyAyXHJcbiAgICAgIGVsc2VcclxuICAgICAgICB5ICs9IHRpdGxlSGVpZ2h0ICogM1xyXG5cclxuICByZW5kZXJBSUhhbmQ6IChoYW5kLCB4LCB5LCBvZmZzZXQpIC0+XHJcbiAgICBzb3J0ZWQgPSBoYW5kLnNvcnQgKGEsIGIpIC0+IGEgLSBiXHJcbiAgICBmb3IgcmF3LCBpIGluIHNvcnRlZFxyXG4gICAgICBAaGFuZC5yZW5kZXJDYXJkIHJhdywgeCArIChpICogb2Zmc2V0KSwgeSwgMCwgMC43LCAwXHJcblxyXG4gIHJlbmRlckdhbWU6IC0+XHJcblxyXG4gICAgIyBiYWNrZ3JvdW5kXHJcbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwic29saWRcIiwgMCwgMCwgQHdpZHRoLCBAaGVpZ2h0LCAwLCAwLCAwLCBAY29sb3JzLmJhY2tncm91bmRcclxuXHJcbiAgICB0ZXh0SGVpZ2h0ID0gQGFhSGVpZ2h0IC8gMjVcclxuICAgIHRleHRQYWRkaW5nID0gdGV4dEhlaWdodCAvIDVcclxuICAgIGNoYXJhY3RlckhlaWdodCA9IEBhYUhlaWdodCAvIDVcclxuICAgIGNvdW50SGVpZ2h0ID0gdGV4dEhlaWdodFxyXG5cclxuICAgIGRyYXdHYW1lT3ZlciA9IEB0aGlydGVlbi5nYW1lT3ZlcigpIGFuZCBAcGlsZS5yZXN0aW5nKClcclxuXHJcbiAgICAjIExvZ1xyXG4gICAgZm9yIGxpbmUsIGkgaW4gQHRoaXJ0ZWVuLmxvZ1xyXG4gICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgdGV4dEhlaWdodCwgbGluZSwgMCwgKGkrMS41KSAqICh0ZXh0SGVpZ2h0ICsgdGV4dFBhZGRpbmcpLCAwLCAwLCBAY29sb3JzLmxvZ2NvbG9yXHJcblxyXG4gICAgYWlQbGF5ZXJzID0gW1xyXG4gICAgICBAdGhpcnRlZW4ucGxheWVyc1sxXVxyXG4gICAgICBAdGhpcnRlZW4ucGxheWVyc1syXVxyXG4gICAgICBAdGhpcnRlZW4ucGxheWVyc1szXVxyXG4gICAgXVxyXG5cclxuICAgIGNoYXJhY3Rlck1hcmdpbiA9IGNoYXJhY3RlckhlaWdodCAvIDJcclxuICAgIEBjaGFyQ2VpbGluZyA9IEBoZWlnaHQgKiAwLjZcclxuXHJcbiAgICBhaUNhcmRTcGFjaW5nID0gQHdpZHRoICogMC4wMTVcclxuXHJcbiAgICAjIGxlZnQgc2lkZVxyXG4gICAgaWYgYWlQbGF5ZXJzWzBdICE9IG51bGxcclxuICAgICAgaWYgZHJhd0dhbWVPdmVyXHJcbiAgICAgICAgQHJlbmRlckFJSGFuZCBhaVBsYXllcnNbMF0uaGFuZCwgQHdpZHRoICogMC4yLCBAaGVpZ2h0ICogMC42MiwgYWlDYXJkU3BhY2luZ1xyXG5cclxuICAgICAgY2hhcmFjdGVyID0gYWlDaGFyYWN0ZXJzW2FpUGxheWVyc1swXS5jaGFySURdXHJcbiAgICAgIGNoYXJhY3RlcldpZHRoID0gQHNwcml0ZVJlbmRlcmVyLmNhbGNXaWR0aChjaGFyYWN0ZXIuc3ByaXRlLCBjaGFyYWN0ZXJIZWlnaHQpXHJcbiAgICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgY2hhcmFjdGVyLnNwcml0ZSwgY2hhcmFjdGVyTWFyZ2luLCBAY2hhckNlaWxpbmcsIDAsIGNoYXJhY3RlckhlaWdodCwgMCwgMCwgMSwgQGNvbG9ycy53aGl0ZSwgPT5cclxuICAgICAgICAjIEBkZWJ1ZygpXHJcbiAgICAgIEByZW5kZXJDb3VudCBhaVBsYXllcnNbMF0sIEB0aGlydGVlbi5tb25leSwgZHJhd0dhbWVPdmVyLCBhaVBsYXllcnNbMF0uaW5kZXggPT0gQHRoaXJ0ZWVuLnR1cm4sIGNvdW50SGVpZ2h0LCBjaGFyYWN0ZXJNYXJnaW4gKyAoY2hhcmFjdGVyV2lkdGggLyAyKSwgQGNoYXJDZWlsaW5nIC0gdGV4dFBhZGRpbmcsIDAuNSwgMFxyXG5cclxuICAgICMgdG9wIHNpZGVcclxuICAgIGlmIGFpUGxheWVyc1sxXSAhPSBudWxsXHJcbiAgICAgIGlmIGRyYXdHYW1lT3ZlclxyXG4gICAgICAgIEByZW5kZXJBSUhhbmQgYWlQbGF5ZXJzWzFdLmhhbmQsIEB3aWR0aCAqIDAuNiwgQGhlaWdodCAqIDAuMTgsIGFpQ2FyZFNwYWNpbmdcclxuXHJcbiAgICAgIGNoYXJhY3RlciA9IGFpQ2hhcmFjdGVyc1thaVBsYXllcnNbMV0uY2hhcklEXVxyXG4gICAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIGNoYXJhY3Rlci5zcHJpdGUsIEBjZW50ZXIueCwgMCwgMCwgY2hhcmFjdGVySGVpZ2h0LCAwLCAwLjUsIDAsIEBjb2xvcnMud2hpdGVcclxuICAgICAgQHJlbmRlckNvdW50IGFpUGxheWVyc1sxXSwgQHRoaXJ0ZWVuLm1vbmV5LCBkcmF3R2FtZU92ZXIsIGFpUGxheWVyc1sxXS5pbmRleCA9PSBAdGhpcnRlZW4udHVybiwgY291bnRIZWlnaHQsIEBjZW50ZXIueCwgY2hhcmFjdGVySGVpZ2h0LCAwLjUsIDBcclxuXHJcbiAgICAjIHJpZ2h0IHNpZGVcclxuICAgIGlmIGFpUGxheWVyc1syXSAhPSBudWxsXHJcbiAgICAgIGlmIGRyYXdHYW1lT3ZlclxyXG4gICAgICAgIEByZW5kZXJBSUhhbmQgYWlQbGF5ZXJzWzJdLmhhbmQsIEB3aWR0aCAqIDAuNywgQGhlaWdodCAqIDAuNjIsIGFpQ2FyZFNwYWNpbmdcclxuXHJcbiAgICAgIGNoYXJhY3RlciA9IGFpQ2hhcmFjdGVyc1thaVBsYXllcnNbMl0uY2hhcklEXVxyXG4gICAgICBjaGFyYWN0ZXJXaWR0aCA9IEBzcHJpdGVSZW5kZXJlci5jYWxjV2lkdGgoY2hhcmFjdGVyLnNwcml0ZSwgY2hhcmFjdGVySGVpZ2h0KVxyXG4gICAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIGNoYXJhY3Rlci5zcHJpdGUsIEB3aWR0aCAtIGNoYXJhY3Rlck1hcmdpbiwgQGNoYXJDZWlsaW5nLCAwLCBjaGFyYWN0ZXJIZWlnaHQsIDAsIDEsIDEsIEBjb2xvcnMud2hpdGVcclxuICAgICAgQHJlbmRlckNvdW50IGFpUGxheWVyc1syXSwgQHRoaXJ0ZWVuLm1vbmV5LCBkcmF3R2FtZU92ZXIsIGFpUGxheWVyc1syXS5pbmRleCA9PSBAdGhpcnRlZW4udHVybiwgY291bnRIZWlnaHQsIEB3aWR0aCAtIChjaGFyYWN0ZXJNYXJnaW4gKyAoY2hhcmFjdGVyV2lkdGggLyAyKSksIEBjaGFyQ2VpbGluZyAtIHRleHRQYWRkaW5nLCAwLjUsIDBcclxuXHJcbiAgICAjIGNhcmQgYXJlYVxyXG4gICAgaGFuZEFyZWFIZWlnaHQgPSAwLjI3ICogQGhlaWdodFxyXG4gICAgY2FyZEFyZWFUZXh0ID0gbnVsbFxyXG4gICAgaWYgQGhhbmQucGlja2luZ1xyXG4gICAgICBoYW5kYXJlYUNvbG9yID0gQGNvbG9ycy5oYW5kX3BpY2tcclxuICAgICAgaWYgKEB0aGlydGVlbi50dXJuID09IDApIGFuZCAoQHRoaXJ0ZWVuLmV2ZXJ5b25lUGFzc2VkKCkgb3IgKEB0aGlydGVlbi5jdXJyZW50UGxheSA9PSBudWxsKSlcclxuICAgICAgICBoYW5kYXJlYUNvbG9yID0gQGNvbG9ycy5oYW5kX2FueVxyXG4gICAgICAgIGlmIEB0aGlydGVlbi5waWxlLmxlbmd0aCA9PSAwXHJcbiAgICAgICAgICBjYXJkQXJlYVRleHQgPSAnQW55dGhpbmcgKDNcXHhjOCknXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgY2FyZEFyZWFUZXh0ID0gJ0FueXRoaW5nJ1xyXG4gICAgZWxzZVxyXG4gICAgICBjYXJkQXJlYVRleHQgPSAnVW5sb2NrZWQnXHJcbiAgICAgIGhhbmRhcmVhQ29sb3IgPSBAY29sb3JzLmhhbmRfcmVvcmdcclxuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJzb2xpZFwiLCAwLCBAaGVpZ2h0LCBAd2lkdGgsIGhhbmRBcmVhSGVpZ2h0LCAwLCAwLCAxLCBoYW5kYXJlYUNvbG9yLCA9PlxyXG4gICAgICBAaGFuZC50b2dnbGVQaWNraW5nKClcclxuXHJcbiAgICAjIHBpbGVcclxuICAgIHBpbGVEaW1lbnNpb24gPSBAaGVpZ2h0ICogMC40XHJcbiAgICBwaWxlU3ByaXRlID0gXCJwaWxlXCJcclxuICAgIGlmIChAdGhpcnRlZW4udHVybiA+PSAwKSBhbmQgKEB0aGlydGVlbi50dXJuIDw9IDMpXHJcbiAgICAgIHBpbGVTcHJpdGUgKz0gQHRoaXJ0ZWVuLnR1cm5cclxuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgcGlsZVNwcml0ZSwgQHdpZHRoIC8gMiwgQGhlaWdodCAvIDIsIHBpbGVEaW1lbnNpb24sIHBpbGVEaW1lbnNpb24sIDAsIDAuNSwgMC41LCBAY29sb3JzLndoaXRlLCA9PlxyXG4gICAgICBAcGxheVBpY2tlZCgpXHJcbiAgICBAcGlsZS5yZW5kZXIoKVxyXG5cclxuICAgIEBoYW5kLnJlbmRlcigpXHJcblxyXG4gICAgaWYgZHJhd0dhbWVPdmVyXHJcbiAgICAgICMgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcInNvbGlkXCIsIDAsIDAsIEB3aWR0aCwgQGhlaWdodCAtIGhhbmRBcmVhSGVpZ2h0LCAwLCAwLCAwLCBAY29sb3JzLnBsYXlfYWdhaW5cclxuXHJcbiAgICAgIGxpbmVzID0gQGdhbWVPdmVyVGV4dCgpXHJcbiAgICAgIGdhbWVPdmVyU2l6ZSA9IEBhYUhlaWdodCAvIDhcclxuICAgICAgZ2FtZU92ZXJZID0gQGNlbnRlci55XHJcbiAgICAgIGlmIGxpbmVzLmxlbmd0aCA+IDFcclxuICAgICAgICBnYW1lT3ZlclkgLT0gKGdhbWVPdmVyU2l6ZSA+PiAxKVxyXG4gICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgZ2FtZU92ZXJTaXplLCBsaW5lc1swXSwgQGNlbnRlci54LCBnYW1lT3ZlclksIDAuNSwgMC41LCBAY29sb3JzLmdhbWVfb3ZlclxyXG4gICAgICBpZiBsaW5lcy5sZW5ndGggPiAxXHJcbiAgICAgICAgZ2FtZU92ZXJZICs9IGdhbWVPdmVyU2l6ZVxyXG4gICAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCBnYW1lT3ZlclNpemUsIGxpbmVzWzFdLCBAY2VudGVyLngsIGdhbWVPdmVyWSwgMC41LCAwLjUsIEBjb2xvcnMuZ2FtZV9vdmVyXHJcblxyXG4gICAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwic29saWRcIiwgMCwgQGhlaWdodCwgQHdpZHRoLCBoYW5kQXJlYUhlaWdodCwgMCwgMCwgMSwgQGNvbG9ycy5wbGF5X2FnYWluLCA9PlxyXG4gICAgICAgIEB0aGlydGVlbi5kZWFsKClcclxuICAgICAgICBAcHJlcGFyZUdhbWUoKVxyXG5cclxuICAgICAgcmVzdGFydFF1aXRTaXplID0gQGFhSGVpZ2h0IC8gMTJcclxuICAgICAgc2hhZG93RGlzdGFuY2UgPSByZXN0YXJ0UXVpdFNpemUgLyA4XHJcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCByZXN0YXJ0UXVpdFNpemUsIFwiUGxheSBBZ2FpblwiLCBzaGFkb3dEaXN0YW5jZSArIEBjZW50ZXIueCwgc2hhZG93RGlzdGFuY2UgKyAoQGhlaWdodCAtIChoYW5kQXJlYUhlaWdodCAqIDAuNSkpLCAwLjUsIDEsIEBjb2xvcnMuYmxhY2tcclxuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIHJlc3RhcnRRdWl0U2l6ZSwgXCJQbGF5IEFnYWluXCIsIEBjZW50ZXIueCwgQGhlaWdodCAtIChoYW5kQXJlYUhlaWdodCAqIDAuNSksIDAuNSwgMSwgQGNvbG9ycy5nb2xkXHJcblxyXG4gICAgQHJlbmRlckNvdW50IEB0aGlydGVlbi5wbGF5ZXJzWzBdLCBAdGhpcnRlZW4ubW9uZXksIGRyYXdHYW1lT3ZlciwgMCA9PSBAdGhpcnRlZW4udHVybiwgY291bnRIZWlnaHQsIEBjZW50ZXIueCwgQGhlaWdodCwgMC41LCAxXHJcblxyXG4gICAgIyBIZWFkbGluZSAoaW5jbHVkZXMgZXJyb3IpXHJcbiAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgdGV4dEhlaWdodCwgQGNhbGNIZWFkbGluZSgpLCAwLCAwLCAwLCAwLCBAY29sb3JzLmxpZ2h0Z3JheVxyXG5cclxuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJwYXVzZVwiLCBAd2lkdGgsIDAsIDAsIEBwYXVzZUJ1dHRvblNpemUsIDAsIDEsIDAsIEBjb2xvcnMud2hpdGUsID0+XHJcbiAgICAgIEByZW5kZXJNb2RlID0gUmVuZGVyTW9kZS5QQVVTRVxyXG5cclxuICAgIGlmIGNhcmRBcmVhVGV4dCAhPSBudWxsXHJcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCB0ZXh0SGVpZ2h0LCBjYXJkQXJlYVRleHQsIDAuMDIgKiBAd2lkdGgsIEBoZWlnaHQgLSBoYW5kQXJlYUhlaWdodCwgMCwgMCwgQGNvbG9ycy53aGl0ZVxyXG5cclxuICAgIGlmIEBhY2hpZXZlbWVudEZhbmZhcmUgIT0gbnVsbFxyXG4gICAgICBpZiBAYWNoaWV2ZW1lbnRGYW5mYXJlLnRpbWUgPCAxMDAwXHJcbiAgICAgICAgb3BhY2l0eSA9IEBhY2hpZXZlbWVudEZhbmZhcmUudGltZSAvIDEwMDBcclxuICAgICAgZWxzZSBpZiBAYWNoaWV2ZW1lbnRGYW5mYXJlLnRpbWUgPiA0MDAwXHJcbiAgICAgICAgb3BhY2l0eSA9IDEgLSAoKEBhY2hpZXZlbWVudEZhbmZhcmUudGltZSAtIDQwMDApIC8gMTAwMClcclxuICAgICAgZWxzZVxyXG4gICAgICAgIG9wYWNpdHkgPSAxXHJcbiAgICAgIGNvbG9yID0ge3I6MSwgZzoxLCBiOjEsIGE6b3BhY2l0eX1cclxuICAgICAgeCA9IEB3aWR0aCAqIDAuNlxyXG4gICAgICB5ID0gMFxyXG4gICAgICB4VGV4dCA9IHggKyAoQHdpZHRoICogMC4wNilcclxuICAgICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcImF1XCIsIHgsIHksIDAsIEBoZWlnaHQgLyAxMCwgMCwgMCwgMCwgY29sb3IsID0+XHJcbiAgICAgICAgQGFjaGlldmVtZW50RmFuZmFyZSA9IG51bGxcclxuICAgICAgICBAcmVuZGVyTW9kZSA9IFJlbmRlck1vZGUuQUNISUVWRU1FTlRTXHJcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCB0ZXh0SGVpZ2h0LCBcIkFjaGlldmVtZW50IEVhcm5lZFwiLCB4VGV4dCwgeSwgMCwgMCwgY29sb3JcclxuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIHRleHRIZWlnaHQsIEBhY2hpZXZlbWVudEZhbmZhcmUudGl0bGUsIHhUZXh0LCB5ICsgdGV4dEhlaWdodCwgMCwgMCwgY29sb3JcclxuXHJcbiAgICByZXR1cm5cclxuXHJcbiAgcmVuZGVyQ291bnQ6IChwbGF5ZXIsIG1vbmV5LCBkcmF3R2FtZU92ZXIsIG15VHVybiwgY291bnRIZWlnaHQsIHgsIHksIGFuY2hvcngsIGFuY2hvcnkpIC0+XHJcbiAgICBpZiBteVR1cm5cclxuICAgICAgbmFtZUNvbG9yID0gXCJgZmY3NzAwYFwiXHJcbiAgICBlbHNlXHJcbiAgICAgIG5hbWVDb2xvciA9IFwiXCJcclxuICAgIG5hbWVTdHJpbmcgPSBcIiAje25hbWVDb2xvcn0je3BsYXllci5uYW1lfWBgXCJcclxuICAgIGlmIG1vbmV5XHJcbiAgICAgIHBsYXllci5tb25leSA/PSAwXHJcbiAgICAgIG5hbWVTdHJpbmcgKz0gXCI6ICQgYGFhZmZhYWAje3BsYXllci5tb25leX1cIlxyXG4gICAgbmFtZVN0cmluZyArPSBcIiBcIlxyXG4gICAgY2FyZENvdW50ID0gcGxheWVyLmhhbmQubGVuZ3RoXHJcbiAgICBpZiBkcmF3R2FtZU92ZXIgb3IgKGNhcmRDb3VudCA9PSAwKVxyXG4gICAgICBpZiBtb25leVxyXG4gICAgICAgIHBsYWNlU3RyaW5nID0gXCI0dGhcIlxyXG4gICAgICAgIGlmIHBsYXllci5wbGFjZSA9PSAxXHJcbiAgICAgICAgICBwbGFjZVN0cmluZyA9IFwiMXN0XCJcclxuICAgICAgICBlbHNlIGlmIHBsYXllci5wbGFjZSA9PSAyXHJcbiAgICAgICAgICBwbGFjZVN0cmluZyA9IFwiMm5kXCJcclxuICAgICAgICBlbHNlIGlmIHBsYXllci5wbGFjZSA9PSAzXHJcbiAgICAgICAgICBwbGFjZVN0cmluZyA9IFwiM3JkXCJcclxuICAgICAgICBjb3VudFN0cmluZyA9IFwiIGBmZmFhZmZgI3twbGFjZVN0cmluZ31gYCBQbGFjZSBcIlxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgaWYgcGxheWVyLnBsYWNlID09IDFcclxuICAgICAgICAgIGNvdW50U3RyaW5nID0gXCIgYGZmZmZhYWBXaW5uZXJgYCBcIlxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIGNvdW50U3RyaW5nID0gXCIgYGZmYWFmZmBMb3NlcmBgIFwiXHJcbiAgICBlbHNlXHJcbiAgICAgIGNvdW50U3RyaW5nID0gXCIgYGZmZmYzM2Aje2NhcmRDb3VudH1gYCBsZWZ0IFwiXHJcblxyXG4gICAgbmFtZVNpemUgPSBAZm9udFJlbmRlcmVyLnNpemUoQGZvbnQsIGNvdW50SGVpZ2h0LCBuYW1lU3RyaW5nKVxyXG4gICAgY291bnRTaXplID0gQGZvbnRSZW5kZXJlci5zaXplKEBmb250LCBjb3VudEhlaWdodCwgY291bnRTdHJpbmcpXHJcbiAgICBpZiBuYW1lU2l6ZS53ID4gY291bnRTaXplLndcclxuICAgICAgY291bnRTaXplLncgPSBuYW1lU2l6ZS53XHJcbiAgICBlbHNlXHJcbiAgICAgIG5hbWVTaXplLncgPSBjb3VudFNpemUud1xyXG4gICAgbmFtZVkgPSB5XHJcbiAgICBjb3VudFkgPSB5XHJcbiAgICBib3hIZWlnaHQgPSBjb3VudFNpemUuaFxyXG4gICAgaWYgdHJ1ZSAjIHBsYXllci5pZCAhPSAxXHJcbiAgICAgIGJveEhlaWdodCAqPSAyXHJcbiAgICAgIGlmIGFuY2hvcnkgPiAwXHJcbiAgICAgICAgbmFtZVkgLT0gY291bnRIZWlnaHRcclxuICAgICAgZWxzZVxyXG4gICAgICAgIGNvdW50WSArPSBjb3VudEhlaWdodFxyXG4gICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcInNvbGlkXCIsIHgsIHksIGNvdW50U2l6ZS53LCBib3hIZWlnaHQsIDAsIGFuY2hvcngsIGFuY2hvcnksIEBjb2xvcnMub3ZlcmxheVxyXG4gICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIGNvdW50SGVpZ2h0LCBuYW1lU3RyaW5nLCB4LCBuYW1lWSwgYW5jaG9yeCwgYW5jaG9yeSwgQGNvbG9ycy53aGl0ZVxyXG4gICAgaWYgdHJ1ZSAjIHBsYXllci5pZCAhPSAxXHJcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCBjb3VudEhlaWdodCwgY291bnRTdHJpbmcsIHgsIGNvdW50WSwgYW5jaG9yeCwgYW5jaG9yeSwgQGNvbG9ycy53aGl0ZVxyXG5cclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgIyByZW5kZXJpbmcgYW5kIHpvbmVzXHJcblxyXG4gIGRyYXdJbWFnZTogKHRleHR1cmUsIHN4LCBzeSwgc3csIHNoLCBkeCwgZHksIGR3LCBkaCwgcm90LCBhbmNob3J4LCBhbmNob3J5LCByLCBnLCBiLCBhLCBjYikgLT5cclxuICAgIEByZW5kZXJDb21tYW5kcy5wdXNoIEB0ZXh0dXJlc1t0ZXh0dXJlXSwgc3gsIHN5LCBzdywgc2gsIGR4LCBkeSwgZHcsIGRoLCByb3QsIGFuY2hvcngsIGFuY2hvcnksIHIsIGcsIGIsIGFcclxuXHJcbiAgICBpZiBjYj9cclxuICAgICAgIyBjYWxsZXIgd2FudHMgdG8gcmVtZW1iZXIgd2hlcmUgdGhpcyB3YXMgZHJhd24sIGFuZCB3YW50cyB0byBiZSBjYWxsZWQgYmFjayBpZiBpdCBpcyBldmVyIHRvdWNoZWRcclxuICAgICAgIyBUaGlzIGlzIGNhbGxlZCBhIFwiem9uZVwiLiBTaW5jZSB6b25lcyBhcmUgdHJhdmVyc2VkIGluIHJldmVyc2Ugb3JkZXIsIHRoZSBuYXR1cmFsIG92ZXJsYXAgb2ZcclxuICAgICAgIyBhIHNlcmllcyBvZiByZW5kZXJzIGlzIHJlc3BlY3RlZCBhY2NvcmRpbmdseS5cclxuICAgICAgYW5jaG9yT2Zmc2V0WCA9IC0xICogYW5jaG9yeCAqIGR3XHJcbiAgICAgIGFuY2hvck9mZnNldFkgPSAtMSAqIGFuY2hvcnkgKiBkaFxyXG4gICAgICB6b25lID1cclxuICAgICAgICAjIGNlbnRlciAoWCxZKSBhbmQgcmV2ZXJzZWQgcm90YXRpb24sIHVzZWQgdG8gcHV0IHRoZSBjb29yZGluYXRlIGluIGxvY2FsIHNwYWNlIHRvIHRoZSB6b25lXHJcbiAgICAgICAgY3g6ICBkeFxyXG4gICAgICAgIGN5OiAgZHlcclxuICAgICAgICByb3Q6IHJvdCAqIC0xXHJcbiAgICAgICAgIyB0aGUgYXhpcyBhbGlnbmVkIGJvdW5kaW5nIGJveCB1c2VkIGZvciBkZXRlY3Rpb24gb2YgYSBsb2NhbHNwYWNlIGNvb3JkXHJcbiAgICAgICAgbDogICBhbmNob3JPZmZzZXRYXHJcbiAgICAgICAgdDogICBhbmNob3JPZmZzZXRZXHJcbiAgICAgICAgcjogICBhbmNob3JPZmZzZXRYICsgZHdcclxuICAgICAgICBiOiAgIGFuY2hvck9mZnNldFkgKyBkaFxyXG4gICAgICAgICMgY2FsbGJhY2sgdG8gY2FsbCBpZiB0aGUgem9uZSBpcyBjbGlja2VkIG9uXHJcbiAgICAgICAgY2I6ICBjYlxyXG4gICAgICBAem9uZXMucHVzaCB6b25lXHJcblxyXG4gIGNoZWNrWm9uZXM6ICh4LCB5KSAtPlxyXG4gICAgZm9yIHpvbmUgaW4gQHpvbmVzIGJ5IC0xXHJcbiAgICAgICMgbW92ZSBjb29yZCBpbnRvIHNwYWNlIHJlbGF0aXZlIHRvIHRoZSBxdWFkLCB0aGVuIHJvdGF0ZSBpdCB0byBtYXRjaFxyXG4gICAgICB1bnJvdGF0ZWRMb2NhbFggPSB4IC0gem9uZS5jeFxyXG4gICAgICB1bnJvdGF0ZWRMb2NhbFkgPSB5IC0gem9uZS5jeVxyXG4gICAgICBsb2NhbFggPSB1bnJvdGF0ZWRMb2NhbFggKiBNYXRoLmNvcyh6b25lLnJvdCkgLSB1bnJvdGF0ZWRMb2NhbFkgKiBNYXRoLnNpbih6b25lLnJvdClcclxuICAgICAgbG9jYWxZID0gdW5yb3RhdGVkTG9jYWxYICogTWF0aC5zaW4oem9uZS5yb3QpICsgdW5yb3RhdGVkTG9jYWxZICogTWF0aC5jb3Moem9uZS5yb3QpXHJcbiAgICAgIGlmIChsb2NhbFggPCB6b25lLmwpIG9yIChsb2NhbFggPiB6b25lLnIpIG9yIChsb2NhbFkgPCB6b25lLnQpIG9yIChsb2NhbFkgPiB6b25lLmIpXHJcbiAgICAgICAgIyBvdXRzaWRlIG9mIG9yaWVudGVkIGJvdW5kaW5nIGJveFxyXG4gICAgICAgIGNvbnRpbnVlXHJcbiAgICAgIHpvbmUuY2IoeCwgeSlcclxuICAgICAgcmV0dXJuIHRydWVcclxuICAgIHJldHVybiBmYWxzZVxyXG5cclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVcclxuIiwiQW5pbWF0aW9uID0gcmVxdWlyZSAnLi9BbmltYXRpb24nXHJcblxyXG5DQVJEX0lNQUdFX1cgPSAxMjBcclxuQ0FSRF9JTUFHRV9IID0gMTYyXHJcbkNBUkRfSU1BR0VfT0ZGX1ggPSA0XHJcbkNBUkRfSU1BR0VfT0ZGX1kgPSA0XHJcbkNBUkRfSU1BR0VfQURWX1ggPSBDQVJEX0lNQUdFX1dcclxuQ0FSRF9JTUFHRV9BRFZfWSA9IENBUkRfSU1BR0VfSFxyXG5DQVJEX1JFTkRFUl9TQ0FMRSA9IDAuMzUgICAgICAgICAgICAgICAgICAjIGNhcmQgaGVpZ2h0IGNvZWZmaWNpZW50IGZyb20gdGhlIHNjcmVlbidzIGhlaWdodFxyXG5DQVJEX0hBTkRfQ1VSVkVfRElTVF9GQUNUT1IgPSAzLjUgICAgICAgICAjIGZhY3RvciB3aXRoIHNjcmVlbiBoZWlnaHQgdG8gZmlndXJlIG91dCBjZW50ZXIgb2YgYXJjLiBiaWdnZXIgbnVtYmVyIGlzIGxlc3MgYXJjXHJcbkNBUkRfSE9MRElOR19ST1RfT1JERVIgPSBNYXRoLlBJIC8gMTIgICAgICMgZGVzaXJlZCByb3RhdGlvbiBvZiB0aGUgY2FyZCB3aGVuIGJlaW5nIGRyYWdnZWQgYXJvdW5kIGZvciBvcmRlcmluZydzIHNha2VcclxuQ0FSRF9IT0xESU5HX1JPVF9QTEFZID0gLTEgKiBNYXRoLlBJIC8gMTIgIyBkZXNpcmVkIHJvdGF0aW9uIG9mIHRoZSBjYXJkIHdoZW4gYmVpbmcgZHJhZ2dlZCBhcm91bmQgd2l0aCBpbnRlbnQgdG8gcGxheVxyXG5DQVJEX1BMQVlfQ0VJTElORyA9IDAuNjAgICAgICAgICAgICAgICAgICAjIGhvdyBtdWNoIG9mIHRoZSB0b3Agb2YgdGhlIHNjcmVlbiByZXByZXNlbnRzIFwiSSB3YW50IHRvIHBsYXkgdGhpc1wiIHZzIFwiSSB3YW50IHRvIHJlb3JkZXJcIlxyXG5cclxuTk9fQ0FSRCA9IC0xXHJcblxyXG5IaWdobGlnaHQgPVxyXG4gIE5PTkU6IC0xXHJcbiAgVU5TRUxFQ1RFRDogMFxyXG4gIFNFTEVDVEVEOiAxXHJcbiAgUElMRTogMlxyXG5cclxuIyB0YWtlbiBmcm9tIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTIxMTIxMi9ob3ctdG8tY2FsY3VsYXRlLWFuLWFuZ2xlLWZyb20tdGhyZWUtcG9pbnRzXHJcbiMgdXNlcyBsYXcgb2YgY29zaW5lcyB0byBmaWd1cmUgb3V0IHRoZSBoYW5kIGFyYyBhbmdsZVxyXG5maW5kQW5nbGUgPSAocDAsIHAxLCBwMikgLT5cclxuICAgIGEgPSBNYXRoLnBvdyhwMS54IC0gcDIueCwgMikgKyBNYXRoLnBvdyhwMS55IC0gcDIueSwgMilcclxuICAgIGIgPSBNYXRoLnBvdyhwMS54IC0gcDAueCwgMikgKyBNYXRoLnBvdyhwMS55IC0gcDAueSwgMilcclxuICAgIGMgPSBNYXRoLnBvdyhwMi54IC0gcDAueCwgMikgKyBNYXRoLnBvdyhwMi55IC0gcDAueSwgMilcclxuICAgIHJldHVybiBNYXRoLmFjb3MoIChhK2ItYykgLyBNYXRoLnNxcnQoNCphKmIpIClcclxuXHJcbmNhbGNEaXN0YW5jZSA9IChwMCwgcDEpIC0+XHJcbiAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyhwMS54IC0gcDAueCwgMikgKyBNYXRoLnBvdyhwMS55IC0gcDAueSwgMikpXHJcblxyXG5jYWxjRGlzdGFuY2VTcXVhcmVkID0gKHgwLCB5MCwgeDEsIHkxKSAtPlxyXG4gIHJldHVybiBNYXRoLnBvdyh4MSAtIHgwLCAyKSArIE1hdGgucG93KHkxIC0geTAsIDIpXHJcblxyXG5jbGFzcyBIYW5kXHJcbiAgQENBUkRfSU1BR0VfVzogQ0FSRF9JTUFHRV9XXHJcbiAgQENBUkRfSU1BR0VfSDogQ0FSRF9JTUFHRV9IXHJcbiAgQENBUkRfSU1BR0VfT0ZGX1g6IENBUkRfSU1BR0VfT0ZGX1hcclxuICBAQ0FSRF9JTUFHRV9PRkZfWTogQ0FSRF9JTUFHRV9PRkZfWVxyXG4gIEBDQVJEX0lNQUdFX0FEVl9YOiBDQVJEX0lNQUdFX0FEVl9YXHJcbiAgQENBUkRfSU1BR0VfQURWX1k6IENBUkRfSU1BR0VfQURWX1lcclxuICBAQ0FSRF9SRU5ERVJfU0NBTEU6IENBUkRfUkVOREVSX1NDQUxFXHJcbiAgQEhpZ2hsaWdodDogSGlnaGxpZ2h0XHJcblxyXG4gIGNvbnN0cnVjdG9yOiAoQGdhbWUpIC0+XHJcbiAgICBAY2FyZHMgPSBbXVxyXG4gICAgQGFuaW1zID0ge31cclxuICAgIEBwb3NpdGlvbkNhY2hlID0ge31cclxuXHJcbiAgICBAcGlja2luZyA9IHRydWVcclxuICAgIEBwaWNrZWQgPSBbXVxyXG4gICAgQHBpY2tQYWludCA9IGZhbHNlXHJcblxyXG4gICAgQGRyYWdJbmRleFN0YXJ0ID0gTk9fQ0FSRFxyXG4gICAgQGRyYWdJbmRleEN1cnJlbnQgPSBOT19DQVJEXHJcbiAgICBAZHJhZ1ggPSAwXHJcbiAgICBAZHJhZ1kgPSAwXHJcblxyXG4gICAgIyByZW5kZXIgLyBhbmltIG1ldHJpY3NcclxuICAgIEBjYXJkU3BlZWQgPVxyXG4gICAgICByOiBNYXRoLlBJICogMlxyXG4gICAgICBzOiAyLjVcclxuICAgICAgdDogMiAqIEBnYW1lLndpZHRoXHJcbiAgICBAcGxheUNlaWxpbmcgPSBDQVJEX1BMQVlfQ0VJTElORyAqIEBnYW1lLmhlaWdodFxyXG4gICAgQGNhcmRIZWlnaHQgPSBNYXRoLmZsb29yKEBnYW1lLmhlaWdodCAqIENBUkRfUkVOREVSX1NDQUxFKVxyXG4gICAgQGNhcmRXaWR0aCAgPSBNYXRoLmZsb29yKEBjYXJkSGVpZ2h0ICogQ0FSRF9JTUFHRV9XIC8gQ0FSRF9JTUFHRV9IKVxyXG4gICAgQGNhcmRIYWxmSGVpZ2h0ID0gQGNhcmRIZWlnaHQgPj4gMVxyXG4gICAgQGNhcmRIYWxmV2lkdGggID0gQGNhcmRXaWR0aCA+PiAxXHJcbiAgICBhcmNNYXJnaW4gPSBAY2FyZFdpZHRoIC8gMlxyXG4gICAgYXJjVmVydGljYWxCaWFzID0gQGNhcmRIZWlnaHQgLyA1MFxyXG4gICAgYm90dG9tTGVmdCAgPSB7IHg6IGFyY01hcmdpbiwgICAgICAgICAgICAgICAgeTogYXJjVmVydGljYWxCaWFzICsgQGdhbWUuaGVpZ2h0IH1cclxuICAgIGJvdHRvbVJpZ2h0ID0geyB4OiBAZ2FtZS53aWR0aCAtIGFyY01hcmdpbiwgeTogYXJjVmVydGljYWxCaWFzICsgQGdhbWUuaGVpZ2h0IH1cclxuICAgIEBoYW5kQ2VudGVyID0geyB4OiBAZ2FtZS53aWR0aCAvIDIsICAgICAgICAgeTogYXJjVmVydGljYWxCaWFzICsgQGdhbWUuaGVpZ2h0ICsgKENBUkRfSEFORF9DVVJWRV9ESVNUX0ZBQ1RPUiAqIEBnYW1lLmhlaWdodCkgfVxyXG4gICAgQGhhbmRBbmdsZSA9IGZpbmRBbmdsZShib3R0b21MZWZ0LCBAaGFuZENlbnRlciwgYm90dG9tUmlnaHQpXHJcbiAgICBAaGFuZERpc3RhbmNlID0gY2FsY0Rpc3RhbmNlKGJvdHRvbUxlZnQsIEBoYW5kQ2VudGVyKVxyXG4gICAgQGhhbmRBbmdsZUFkdmFuY2VNYXggPSBAaGFuZEFuZ2xlIC8gNyAjIG5ldmVyIHNwYWNlIHRoZSBjYXJkcyBtb3JlIHRoYW4gd2hhdCB0aGV5J2QgbG9vayBsaWtlIHdpdGggdGhpcyBoYW5kc2l6ZVxyXG4gICAgQGdhbWUubG9nIFwiSGFuZCBkaXN0YW5jZSAje0BoYW5kRGlzdGFuY2V9LCBhbmdsZSAje0BoYW5kQW5nbGV9IChzY3JlZW4gaGVpZ2h0ICN7QGdhbWUuaGVpZ2h0fSlcIlxyXG5cclxuICB0b2dnbGVQaWNraW5nOiAtPlxyXG4gICAgQHBpY2tpbmcgPSAhQHBpY2tpbmdcclxuICAgIGlmIEBwaWNraW5nXHJcbiAgICAgIEBzZWxlY3ROb25lKClcclxuXHJcbiAgc2VsZWN0Tm9uZTogLT5cclxuICAgIEBwaWNrZWQgPSBuZXcgQXJyYXkoQGNhcmRzLmxlbmd0aCkuZmlsbChmYWxzZSlcclxuICAgIHJldHVyblxyXG5cclxuICBzZXQ6IChjYXJkcykgLT5cclxuICAgIEBjYXJkcyA9IGNhcmRzLnNsaWNlKDApXHJcbiAgICBpZiBAcGlja2luZ1xyXG4gICAgICBAc2VsZWN0Tm9uZSgpXHJcbiAgICBAc3luY0FuaW1zKClcclxuICAgIEB3YXJwKClcclxuXHJcbiAgc3luY0FuaW1zOiAtPlxyXG4gICAgc2VlbiA9IHt9XHJcbiAgICBmb3IgY2FyZCBpbiBAY2FyZHNcclxuICAgICAgc2VlbltjYXJkXSsrXHJcbiAgICAgIGlmIG5vdCBAYW5pbXNbY2FyZF1cclxuICAgICAgICBAYW5pbXNbY2FyZF0gPSBuZXcgQW5pbWF0aW9uIHtcclxuICAgICAgICAgIHNwZWVkOiBAY2FyZFNwZWVkXHJcbiAgICAgICAgICB4OiAwXHJcbiAgICAgICAgICB5OiAwXHJcbiAgICAgICAgICByOiAwXHJcbiAgICAgICAgfVxyXG4gICAgdG9SZW1vdmUgPSBbXVxyXG4gICAgZm9yIGNhcmQsYW5pbSBvZiBAYW5pbXNcclxuICAgICAgaWYgbm90IHNlZW4uaGFzT3duUHJvcGVydHkoY2FyZClcclxuICAgICAgICB0b1JlbW92ZS5wdXNoIGNhcmRcclxuICAgIGZvciBjYXJkIGluIHRvUmVtb3ZlXHJcbiAgICAgICMgQGdhbWUubG9nIFwicmVtb3ZpbmcgYW5pbSBmb3IgI3tjYXJkfVwiXHJcbiAgICAgIGRlbGV0ZSBAYW5pbXNbY2FyZF1cclxuXHJcbiAgICBAdXBkYXRlUG9zaXRpb25zKClcclxuXHJcbiAgY2FsY0RyYXduSGFuZDogLT5cclxuICAgIGRyYXduSGFuZCA9IFtdXHJcbiAgICBmb3IgY2FyZCxpIGluIEBjYXJkc1xyXG4gICAgICBpZiBpICE9IEBkcmFnSW5kZXhTdGFydFxyXG4gICAgICAgIGRyYXduSGFuZC5wdXNoIGNhcmRcclxuXHJcbiAgICBpZiBAZHJhZ0luZGV4Q3VycmVudCAhPSBOT19DQVJEXHJcbiAgICAgIGRyYXduSGFuZC5zcGxpY2UgQGRyYWdJbmRleEN1cnJlbnQsIDAsIEBjYXJkc1tAZHJhZ0luZGV4U3RhcnRdXHJcbiAgICByZXR1cm4gZHJhd25IYW5kXHJcblxyXG4gIHdhbnRzVG9QbGF5RHJhZ2dlZENhcmQ6IC0+XHJcbiAgICByZXR1cm4gZmFsc2UgaWYgQGRyYWdJbmRleFN0YXJ0ID09IE5PX0NBUkRcclxuICAgIHJldHVybiBAZHJhZ1kgPCBAcGxheUNlaWxpbmdcclxuXHJcbiAgdXBkYXRlUG9zaXRpb25zOiAtPlxyXG4gICAgZHJhd25IYW5kID0gQGNhbGNEcmF3bkhhbmQoKVxyXG4gICAgd2FudHNUb1BsYXkgPSBAd2FudHNUb1BsYXlEcmFnZ2VkQ2FyZCgpXHJcbiAgICBkZXNpcmVkUm90YXRpb24gPSBDQVJEX0hPTERJTkdfUk9UX09SREVSXHJcbiAgICBwb3NpdGlvbkNvdW50ID0gZHJhd25IYW5kLmxlbmd0aFxyXG4gICAgaWYgd2FudHNUb1BsYXlcclxuICAgICAgZGVzaXJlZFJvdGF0aW9uID0gQ0FSRF9IT0xESU5HX1JPVF9QTEFZXHJcbiAgICAgIHBvc2l0aW9uQ291bnQtLVxyXG4gICAgcG9zaXRpb25zID0gQGNhbGNQb3NpdGlvbnMocG9zaXRpb25Db3VudClcclxuICAgIGRyYXdJbmRleCA9IDBcclxuICAgIGZvciBjYXJkLGkgaW4gZHJhd25IYW5kXHJcbiAgICAgIGFuaW0gPSBAYW5pbXNbY2FyZF1cclxuICAgICAgaWYgaSA9PSBAZHJhZ0luZGV4Q3VycmVudFxyXG4gICAgICAgIGFuaW0ucmVxLnggPSBAZHJhZ1hcclxuICAgICAgICBhbmltLnJlcS55ID0gQGRyYWdZXHJcbiAgICAgICAgYW5pbS5yZXEuciA9IGRlc2lyZWRSb3RhdGlvblxyXG4gICAgICAgIGlmIG5vdCB3YW50c1RvUGxheVxyXG4gICAgICAgICAgZHJhd0luZGV4KytcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHBvcyA9IHBvc2l0aW9uc1tkcmF3SW5kZXhdXHJcbiAgICAgICAgYW5pbS5yZXEueCA9IHBvcy54XHJcbiAgICAgICAgYW5pbS5yZXEueSA9IHBvcy55XHJcbiAgICAgICAgYW5pbS5yZXEuciA9IHBvcy5yXHJcbiAgICAgICAgZHJhd0luZGV4KytcclxuXHJcbiAgIyBpbW1lZGlhdGVseSB3YXJwIGFsbCBjYXJkcyB0byB3aGVyZSB0aGV5IHNob3VsZCBiZVxyXG4gIHdhcnA6IC0+XHJcbiAgICBmb3IgY2FyZCxhbmltIG9mIEBhbmltc1xyXG4gICAgICBhbmltLndhcnAoKVxyXG5cclxuICAjIHJlb3JkZXIgdGhlIGhhbmQgYmFzZWQgb24gdGhlIGRyYWcgbG9jYXRpb24gb2YgdGhlIGhlbGQgY2FyZFxyXG4gIHJlb3JkZXI6IC0+XHJcbiAgICByZXR1cm4gaWYgQGRyYWdJbmRleFN0YXJ0ID09IE5PX0NBUkRcclxuICAgIHJldHVybiBpZiBAY2FyZHMubGVuZ3RoIDwgMiAjIG5vdGhpbmcgdG8gcmVvcmRlclxyXG4gICAgcG9zaXRpb25zID0gQGNhbGNQb3NpdGlvbnMoQGNhcmRzLmxlbmd0aClcclxuICAgIGNsb3Nlc3RJbmRleCA9IDBcclxuICAgIGNsb3Nlc3REaXN0ID0gQGdhbWUud2lkdGggKiBAZ2FtZS5oZWlnaHQgIyBzb21ldGhpbmcgaW1wb3NzaWJseSBsYXJnZVxyXG4gICAgZm9yIHBvcywgaW5kZXggaW4gcG9zaXRpb25zXHJcbiAgICAgIGRpc3QgPSBjYWxjRGlzdGFuY2VTcXVhcmVkKHBvcy54LCBwb3MueSwgQGRyYWdYLCBAZHJhZ1kpXHJcbiAgICAgIGlmIGNsb3Nlc3REaXN0ID4gZGlzdFxyXG4gICAgICAgIGNsb3Nlc3REaXN0ID0gZGlzdFxyXG4gICAgICAgIGNsb3Nlc3RJbmRleCA9IGluZGV4XHJcbiAgICBAZHJhZ0luZGV4Q3VycmVudCA9IGNsb3Nlc3RJbmRleFxyXG5cclxuICBzZWxlY3RlZENhcmRzOiAtPlxyXG4gICAgaWYgbm90IEBwaWNraW5nXHJcbiAgICAgIHJldHVybiBbXVxyXG5cclxuICAgIGNhcmRzID0gW11cclxuICAgIGZvciBjYXJkLCBpIGluIEBjYXJkc1xyXG4gICAgICBpZiBAcGlja2VkW2ldXHJcbiAgICAgICAgYW5pbSA9IEBhbmltc1tjYXJkXVxyXG4gICAgICAgIGNhcmRzLnB1c2gge1xyXG4gICAgICAgICAgY2FyZDogY2FyZFxyXG4gICAgICAgICAgeDogYW5pbS5jdXIueFxyXG4gICAgICAgICAgeTogYW5pbS5jdXIueVxyXG4gICAgICAgICAgcjogYW5pbS5jdXIuclxyXG4gICAgICAgICAgaW5kZXg6IGlcclxuICAgICAgICB9XHJcbiAgICByZXR1cm4gY2FyZHNcclxuXHJcbiAgZG93bjogKEBkcmFnWCwgQGRyYWdZLCBpbmRleCkgLT5cclxuICAgIEB1cChAZHJhZ1gsIEBkcmFnWSkgIyBlbnN1cmUgd2UgbGV0IGdvIG9mIHRoZSBwcmV2aW91cyBjYXJkIGluIGNhc2UgdGhlIGV2ZW50cyBhcmUgZHVtYlxyXG4gICAgaWYgQHBpY2tpbmdcclxuICAgICAgQHBpY2tlZFtpbmRleF0gPSAhQHBpY2tlZFtpbmRleF1cclxuICAgICAgQHBpY2tQYWludCA9IEBwaWNrZWRbaW5kZXhdXHJcbiAgICAgIHJldHVyblxyXG4gICAgQGdhbWUubG9nIFwicGlja2luZyB1cCBjYXJkIGluZGV4ICN7aW5kZXh9XCJcclxuICAgIEBkcmFnSW5kZXhTdGFydCA9IGluZGV4XHJcbiAgICBAZHJhZ0luZGV4Q3VycmVudCA9IGluZGV4XHJcbiAgICBAdXBkYXRlUG9zaXRpb25zKClcclxuXHJcbiAgbW92ZTogKEBkcmFnWCwgQGRyYWdZKSAtPlxyXG4gICAgcmV0dXJuIGlmIEBkcmFnSW5kZXhTdGFydCA9PSBOT19DQVJEXHJcbiAgICAjQGdhbWUubG9nIFwiZHJhZ2dpbmcgYXJvdW5kIGNhcmQgaW5kZXggI3tAZHJhZ0luZGV4Q3VycmVudH1cIlxyXG4gICAgQHJlb3JkZXIoKVxyXG4gICAgQHVwZGF0ZVBvc2l0aW9ucygpXHJcblxyXG4gIHVwOiAoQGRyYWdYLCBAZHJhZ1kpIC0+XHJcbiAgICByZXR1cm4gaWYgQGRyYWdJbmRleFN0YXJ0ID09IE5PX0NBUkRcclxuICAgIEByZW9yZGVyKClcclxuICAgIGlmIEB3YW50c1RvUGxheURyYWdnZWRDYXJkKClcclxuICAgICAgQGdhbWUubG9nIFwidHJ5aW5nIHRvIHBsYXkgYSAje0BjYXJkc1tAZHJhZ0luZGV4U3RhcnRdfSBmcm9tIGluZGV4ICN7QGRyYWdJbmRleFN0YXJ0fVwiXHJcbiAgICAgIGNhcmRJbmRleCA9IEBkcmFnSW5kZXhTdGFydFxyXG4gICAgICBjYXJkID0gQGNhcmRzW2NhcmRJbmRleF1cclxuICAgICAgYW5pbSA9IEBhbmltc1tjYXJkXVxyXG4gICAgICBAZHJhZ0luZGV4U3RhcnQgPSBOT19DQVJEXHJcbiAgICAgIEBkcmFnSW5kZXhDdXJyZW50ID0gTk9fQ0FSRFxyXG4gICAgICBAZ2FtZS5wbGF5IFt7XHJcbiAgICAgICAgY2FyZDogY2FyZFxyXG4gICAgICAgIHg6IGFuaW0uY3VyLnhcclxuICAgICAgICB5OiBhbmltLmN1ci55XHJcbiAgICAgICAgcjogYW5pbS5jdXIuclxyXG4gICAgICAgIGluZGV4OiBjYXJkSW5kZXhcclxuICAgICAgfV1cclxuICAgIGVsc2VcclxuICAgICAgQGdhbWUubG9nIFwidHJ5aW5nIHRvIHJlb3JkZXIgI3tAY2FyZHNbQGRyYWdJbmRleFN0YXJ0XX0gaW50byBpbmRleCAje0BkcmFnSW5kZXhDdXJyZW50fVwiXHJcbiAgICAgIEBjYXJkcyA9IEBjYWxjRHJhd25IYW5kKCkgIyBpcyB0aGlzIHJpZ2h0P1xyXG5cclxuICAgIEBkcmFnSW5kZXhTdGFydCA9IE5PX0NBUkRcclxuICAgIEBkcmFnSW5kZXhDdXJyZW50ID0gTk9fQ0FSRFxyXG4gICAgQHVwZGF0ZVBvc2l0aW9ucygpXHJcblxyXG4gIHVwZGF0ZTogKGR0KSAtPlxyXG4gICAgdXBkYXRlZCA9IGZhbHNlXHJcbiAgICBmb3IgY2FyZCxhbmltIG9mIEBhbmltc1xyXG4gICAgICBpZiBhbmltLnVwZGF0ZShkdClcclxuICAgICAgICB1cGRhdGVkID0gdHJ1ZVxyXG4gICAgcmV0dXJuIHVwZGF0ZWRcclxuXHJcbiAgcmVuZGVyOiAtPlxyXG4gICAgcmV0dXJuIGlmIEBjYXJkcy5sZW5ndGggPT0gMFxyXG4gICAgZHJhd25IYW5kID0gQGNhbGNEcmF3bkhhbmQoKVxyXG4gICAgZm9yIHYsIGluZGV4IGluIGRyYXduSGFuZFxyXG4gICAgICBjb250aW51ZSBpZiB2ID09IE5PX0NBUkRcclxuICAgICAgYW5pbSA9IEBhbmltc1t2XVxyXG4gICAgICBkbyAoYW5pbSwgaW5kZXgpID0+XHJcbiAgICAgICAgaWYgQHBpY2tpbmdcclxuICAgICAgICAgIGlmIEBwaWNrZWRbaW5kZXhdXHJcbiAgICAgICAgICAgIGhpZ2hsaWdodFN0YXRlID0gSGlnaGxpZ2h0LlNFTEVDVEVEXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIGhpZ2hsaWdodFN0YXRlID0gSGlnaGxpZ2h0LlVOU0VMRUNURURcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBpZiBAd2FudHNUb1BsYXlEcmFnZ2VkQ2FyZCgpXHJcbiAgICAgICAgICAgIGlmIChpbmRleCA9PSBAZHJhZ0luZGV4Q3VycmVudClcclxuICAgICAgICAgICAgICBoaWdobGlnaHRTdGF0ZSA9IEhpZ2hsaWdodC5TRUxFQ1RFRFxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgaGlnaGxpZ2h0U3RhdGUgPSBIaWdobGlnaHQuVU5TRUxFQ1RFRFxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBoaWdobGlnaHRTdGF0ZSA9IEhpZ2hsaWdodC5OT05FXHJcbiAgICAgICAgQHJlbmRlckNhcmQgdiwgYW5pbS5jdXIueCwgYW5pbS5jdXIueSwgYW5pbS5jdXIuciwgMSwgaGlnaGxpZ2h0U3RhdGUsIChjbGlja1gsIGNsaWNrWSkgPT5cclxuICAgICAgICAgIEBkb3duKGNsaWNrWCwgY2xpY2tZLCBpbmRleClcclxuXHJcbiAgcmVuZGVyQ2FyZDogKHYsIHgsIHksIHJvdCwgc2NhbGUsIHNlbGVjdGVkLCBjYikgLT5cclxuICAgIHJvdCA9IDAgaWYgbm90IHJvdFxyXG4gICAgcmFuayA9IE1hdGguZmxvb3IodiAvIDQpXHJcbiAgICBzdWl0ID0gTWF0aC5mbG9vcih2ICUgNClcclxuXHJcbiAgICBjb2wgPSBzd2l0Y2ggc2VsZWN0ZWRcclxuICAgICAgd2hlbiBIaWdobGlnaHQuTk9ORVxyXG4gICAgICAgIFsxLCAxLCAxXVxyXG4gICAgICB3aGVuIEhpZ2hsaWdodC5VTlNFTEVDVEVEXHJcbiAgICAgICAgIyBbMC4zLCAwLjMsIDAuM11cclxuICAgICAgICBbMSwgMSwgMV1cclxuICAgICAgd2hlbiBIaWdobGlnaHQuU0VMRUNURURcclxuICAgICAgICBbMC41LCAwLjUsIDAuOV1cclxuICAgICAgd2hlbiBIaWdobGlnaHQuUElMRVxyXG4gICAgICAgIFswLjYsIDAuNiwgMC42XVxyXG5cclxuICAgIEBnYW1lLmRyYXdJbWFnZSBcImNhcmRzXCIsXHJcbiAgICBDQVJEX0lNQUdFX09GRl9YICsgKENBUkRfSU1BR0VfQURWX1ggKiByYW5rKSwgQ0FSRF9JTUFHRV9PRkZfWSArIChDQVJEX0lNQUdFX0FEVl9ZICogc3VpdCksIENBUkRfSU1BR0VfVywgQ0FSRF9JTUFHRV9ILFxyXG4gICAgeCwgeSwgQGNhcmRXaWR0aCAqIHNjYWxlLCBAY2FyZEhlaWdodCAqIHNjYWxlLFxyXG4gICAgcm90LCAwLjUsIDAuNSwgY29sWzBdLGNvbFsxXSxjb2xbMl0sMSwgY2JcclxuXHJcbiAgY2FsY1Bvc2l0aW9uczogKGhhbmRTaXplKSAtPlxyXG4gICAgaWYgQHBvc2l0aW9uQ2FjaGUuaGFzT3duUHJvcGVydHkoaGFuZFNpemUpXHJcbiAgICAgIHJldHVybiBAcG9zaXRpb25DYWNoZVtoYW5kU2l6ZV1cclxuICAgIHJldHVybiBbXSBpZiBoYW5kU2l6ZSA9PSAwXHJcblxyXG4gICAgYWR2YW5jZSA9IEBoYW5kQW5nbGUgLyBoYW5kU2l6ZVxyXG4gICAgaWYgYWR2YW5jZSA+IEBoYW5kQW5nbGVBZHZhbmNlTWF4XHJcbiAgICAgIGFkdmFuY2UgPSBAaGFuZEFuZ2xlQWR2YW5jZU1heFxyXG4gICAgYW5nbGVTcHJlYWQgPSBhZHZhbmNlICogaGFuZFNpemUgICAgICAgICAgICAgICAgIyBob3cgbXVjaCBvZiB0aGUgYW5nbGUgd2UgcGxhbiBvbiB1c2luZ1xyXG4gICAgYW5nbGVMZWZ0b3ZlciA9IEBoYW5kQW5nbGUgLSBhbmdsZVNwcmVhZCAgICAgICAgIyBhbW91bnQgb2YgYW5nbGUgd2UncmUgbm90IHVzaW5nLCBhbmQgbmVlZCB0byBwYWQgc2lkZXMgd2l0aCBldmVubHlcclxuICAgIGN1cnJlbnRBbmdsZSA9IC0xICogKEBoYW5kQW5nbGUgLyAyKSAgICAgICAgICAgICMgbW92ZSB0byB0aGUgbGVmdCBzaWRlIG9mIG91ciBhbmdsZVxyXG4gICAgY3VycmVudEFuZ2xlICs9IGFuZ2xlTGVmdG92ZXIgLyAyICAgICAgICAgICAgICAgIyAuLi4gYW5kIGFkdmFuY2UgcGFzdCBoYWxmIG9mIHRoZSBwYWRkaW5nXHJcbiAgICBjdXJyZW50QW5nbGUgKz0gYWR2YW5jZSAvIDIgICAgICAgICAgICAgICAgICAgICAjIC4uLiBhbmQgY2VudGVyIHRoZSBjYXJkcyBpbiB0aGUgYW5nbGVcclxuXHJcbiAgICBwb3NpdGlvbnMgPSBbXVxyXG4gICAgZm9yIGkgaW4gWzAuLi5oYW5kU2l6ZV1cclxuICAgICAgeCA9IEBoYW5kQ2VudGVyLnggLSBNYXRoLmNvcygoTWF0aC5QSSAvIDIpICsgY3VycmVudEFuZ2xlKSAqIEBoYW5kRGlzdGFuY2VcclxuICAgICAgeSA9IEBoYW5kQ2VudGVyLnkgLSBNYXRoLnNpbigoTWF0aC5QSSAvIDIpICsgY3VycmVudEFuZ2xlKSAqIEBoYW5kRGlzdGFuY2VcclxuICAgICAgY3VycmVudEFuZ2xlICs9IGFkdmFuY2VcclxuICAgICAgcG9zaXRpb25zLnB1c2gge1xyXG4gICAgICAgIHg6IHhcclxuICAgICAgICB5OiB5XHJcbiAgICAgICAgcjogY3VycmVudEFuZ2xlIC0gYWR2YW5jZVxyXG4gICAgICB9XHJcblxyXG4gICAgQHBvc2l0aW9uQ2FjaGVbaGFuZFNpemVdID0gcG9zaXRpb25zXHJcbiAgICByZXR1cm4gcG9zaXRpb25zXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRcclxuIiwiQnV0dG9uID0gcmVxdWlyZSAnLi9CdXR0b24nXHJcblxyXG5jbGFzcyBNZW51XHJcbiAgY29uc3RydWN0b3I6IChAZ2FtZSwgQHRpdGxlLCBAYmFja2dyb3VuZCwgQGNvbG9yLCBAYWN0aW9ucykgLT5cclxuICAgIEBidXR0b25zID0gW11cclxuICAgIEBidXR0b25OYW1lcyA9IFtcImJ1dHRvbjBcIiwgXCJidXR0b24xXCJdXHJcblxyXG4gICAgYnV0dG9uU2l6ZSA9IEBnYW1lLmhlaWdodCAvIDE1XHJcbiAgICBAYnV0dG9uU3RhcnRZID0gQGdhbWUuaGVpZ2h0IC8gNVxyXG5cclxuICAgIHNsaWNlID0gKEBnYW1lLmhlaWdodCAtIEBidXR0b25TdGFydFkpIC8gKEBhY3Rpb25zLmxlbmd0aCArIDEpXHJcbiAgICBjdXJyWSA9IEBidXR0b25TdGFydFkgKyBzbGljZVxyXG4gICAgZm9yIGFjdGlvbiBpbiBAYWN0aW9uc1xyXG4gICAgICBidXR0b24gPSBuZXcgQnV0dG9uKEBnYW1lLCBAYnV0dG9uTmFtZXMsIEBnYW1lLmZvbnQsIGJ1dHRvblNpemUsIEBnYW1lLmNlbnRlci54LCBjdXJyWSwgYWN0aW9uKVxyXG4gICAgICBAYnV0dG9ucy5wdXNoIGJ1dHRvblxyXG4gICAgICBjdXJyWSArPSBzbGljZVxyXG5cclxuICB1cGRhdGU6IChkdCkgLT5cclxuICAgIHVwZGF0ZWQgPSBmYWxzZVxyXG4gICAgZm9yIGJ1dHRvbiBpbiBAYnV0dG9uc1xyXG4gICAgICBpZiBidXR0b24udXBkYXRlKGR0KVxyXG4gICAgICAgIHVwZGF0ZWQgPSB0cnVlXHJcbiAgICByZXR1cm4gdXBkYXRlZFxyXG5cclxuICByZW5kZXI6IC0+XHJcbiAgICBAZ2FtZS5zcHJpdGVSZW5kZXJlci5yZW5kZXIgQGJhY2tncm91bmQsIDAsIDAsIEBnYW1lLndpZHRoLCBAZ2FtZS5oZWlnaHQsIDAsIDAsIDAsIEBjb2xvclxyXG4gICAgQGdhbWUuZm9udFJlbmRlcmVyLnJlbmRlciBAZ2FtZS5mb250LCBAZ2FtZS5oZWlnaHQgLyAyNSwgXCJCdWlsZDogI3tAZ2FtZS52ZXJzaW9ufVwiLCAwLCBAZ2FtZS5oZWlnaHQsIDAsIDEsIEBnYW1lLmNvbG9ycy5saWdodGdyYXlcclxuICAgIHRpdGxlSGVpZ2h0ID0gQGdhbWUuaGVpZ2h0IC8gOFxyXG4gICAgdGl0bGVPZmZzZXQgPSBAYnV0dG9uU3RhcnRZID4+IDFcclxuICAgIEBnYW1lLmZvbnRSZW5kZXJlci5yZW5kZXIgQGdhbWUuZm9udCwgdGl0bGVIZWlnaHQsIEB0aXRsZSwgQGdhbWUuY2VudGVyLngsIHRpdGxlT2Zmc2V0LCAwLjUsIDAuNSwgQGdhbWUuY29sb3JzLndoaXRlXHJcbiAgICBmb3IgYnV0dG9uIGluIEBidXR0b25zXHJcbiAgICAgIGJ1dHRvbi5yZW5kZXIoKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNZW51XHJcbiIsIkFuaW1hdGlvbiA9IHJlcXVpcmUgJy4vQW5pbWF0aW9uJ1xyXG5IYW5kID0gcmVxdWlyZSAnLi9IYW5kJ1xyXG5cclxuU0VUVExFX01TID0gMjUwXHJcblxyXG5jbGFzcyBQaWxlXHJcbiAgY29uc3RydWN0b3I6IChAZ2FtZSwgQGhhbmQpIC0+XHJcbiAgICBAcGxheUlEID0gLTFcclxuICAgIEBwbGF5cyA9IFtdXHJcbiAgICBAYW5pbXMgPSB7fVxyXG4gICAgQHNldHRsZVRpbWVyID0gMFxyXG4gICAgQHRocm93bkNvbG9yID0geyByOiAxLCBnOiAxLCBiOiAwLCBhOiAxfVxyXG4gICAgQHNjYWxlID0gMC42XHJcblxyXG4gICAgIyAxLjAgaXMgbm90IG1lc3N5IGF0IGFsbCwgYXMgeW91IGFwcHJvYWNoIDAgaXQgc3RhcnRzIHRvIGFsbCBwaWxlIG9uIG9uZSBhbm90aGVyXHJcbiAgICBtZXNzeSA9IDAuMlxyXG5cclxuICAgIEBwbGF5Q2FyZFNwYWNpbmcgPSAwLjFcclxuXHJcbiAgICBjZW50ZXJYID0gQGdhbWUuY2VudGVyLnhcclxuICAgIGNlbnRlclkgPSBAZ2FtZS5jZW50ZXIueVxyXG4gICAgb2Zmc2V0WCA9IEBoYW5kLmNhcmRXaWR0aCAqIG1lc3N5ICogQHNjYWxlXHJcbiAgICBvZmZzZXRZID0gQGhhbmQuY2FyZEhhbGZIZWlnaHQgKiBtZXNzeSAqIEBzY2FsZVxyXG4gICAgQHBsYXlMb2NhdGlvbnMgPSBbXHJcbiAgICAgIHsgeDogY2VudGVyWCwgeTogY2VudGVyWSArIG9mZnNldFkgfSAjIGJvdHRvbVxyXG4gICAgICB7IHg6IGNlbnRlclggLSBvZmZzZXRYLCB5OiBjZW50ZXJZIH0gIyBsZWZ0XHJcbiAgICAgIHsgeDogY2VudGVyWCwgeTogY2VudGVyWSAtIG9mZnNldFkgfSAjIHRvcFxyXG4gICAgICB7IHg6IGNlbnRlclggKyBvZmZzZXRYLCB5OiBjZW50ZXJZIH0gIyByaWdodFxyXG4gICAgXVxyXG4gICAgQHRocm93TG9jYXRpb25zID0gW1xyXG4gICAgICB7IHg6IGNlbnRlclgsIHk6IEBnYW1lLmhlaWdodCB9ICMgYm90dG9tXHJcbiAgICAgIHsgeDogMCwgeTogY2VudGVyWSArIG9mZnNldFkgfSAjIGxlZnRcclxuICAgICAgeyB4OiBjZW50ZXJYLCB5OiAwIH0gIyB0b3BcclxuICAgICAgeyB4OiBAZ2FtZS53aWR0aCwgeTogY2VudGVyWSArIG9mZnNldFkgfSAjIHJpZ2h0XHJcbiAgICBdXHJcblxyXG4gIHNldDogKHBpbGVJRCwgcGlsZSwgcGlsZVdobykgLT5cclxuICAgIGlmIEBwbGF5SUQgIT0gcGlsZUlEXHJcbiAgICAgIEBwbGF5SUQgPSBwaWxlSURcclxuICAgICAgQHBsYXlzLnB1c2gge1xyXG4gICAgICAgIGNhcmRzOiBwaWxlLnNsaWNlKDApXHJcbiAgICAgICAgd2hvOiBwaWxlV2hvXHJcbiAgICAgIH1cclxuICAgICAgQHNldHRsZVRpbWVyID0gU0VUVExFX01TXHJcblxyXG4gICAgIyBpZiAoQHBsYXlJRCAhPSBwaWxlSUQpIGFuZCAodGhyb3duLmxlbmd0aCA+IDApXHJcbiAgICAjICAgQHBsYXlzID0gdGhyb3duLnNsaWNlKDApICMgdGhlIHBpbGUgaGFzIGJlY29tZSB0aGUgdGhyb3duLCBzdGFzaCBpdCBvZmYgb25lIGxhc3QgdGltZVxyXG4gICAgIyAgIEBwbGF5V2hvID0gdGhyb3duV2hvLnNsaWNlKDApXHJcbiAgICAjICAgQHBsYXlJRCA9IHBpbGVJRFxyXG4gICAgIyAgIEBzZXR0bGVUaW1lciA9IFNFVFRMRV9NU1xyXG5cclxuICAgICMgIyBkb24ndCBzdG9tcCB0aGUgcGlsZSB3ZSdyZSBkcmF3aW5nIHVudGlsIGl0IGlzIGRvbmUgc2V0dGxpbmcgYW5kIGNhbiBmbHkgb2ZmIHRoZSBzY3JlZW5cclxuICAgICMgaWYgQHNldHRsZVRpbWVyID09IDBcclxuICAgICMgICBAcGxheXMgPSBwaWxlLnNsaWNlKDApXHJcbiAgICAjICAgQHBsYXlXaG8gPSBwaWxlV2hvLnNsaWNlKDApXHJcbiAgICAjICAgQHRocm93biA9IHRocm93bi5zbGljZSgwKVxyXG4gICAgIyAgIEB0aHJvd25XaG8gPSB0aHJvd25XaG8uc2xpY2UoMClcclxuICAgICMgICBAdGhyb3duVGFrZXIgPSB0aHJvd25UYWtlclxyXG5cclxuICAgIEBzeW5jQW5pbXMoKVxyXG5cclxuICBwb2tlOiAtPlxyXG4gICAgQHNldHRsZVRpbWVyID0gU0VUVExFX01TXHJcblxyXG4gIGhpbnQ6IChjYXJkcykgLT5cclxuICAgIGZvciBjYXJkIGluIGNhcmRzXHJcbiAgICAgIEBhbmltc1tjYXJkLmNhcmRdID0gbmV3IEFuaW1hdGlvbiB7XHJcbiAgICAgICAgc3BlZWQ6IEBoYW5kLmNhcmRTcGVlZFxyXG4gICAgICAgIHg6IGNhcmQueFxyXG4gICAgICAgIHk6IGNhcmQueVxyXG4gICAgICAgIHI6IGNhcmQuclxyXG4gICAgICAgIHM6IDFcclxuICAgICAgfVxyXG5cclxuICBzeW5jQW5pbXM6IC0+XHJcbiAgICBzZWVuID0ge31cclxuICAgIGxvY2F0aW9ucyA9IEB0aHJvd0xvY2F0aW9uc1xyXG4gICAgZm9yIHBsYXkgaW4gQHBsYXlzXHJcbiAgICAgIGZvciBjYXJkLCBpbmRleCBpbiBwbGF5LmNhcmRzXHJcbiAgICAgICAgc2VlbltjYXJkXSsrXHJcbiAgICAgICAgaWYgbm90IEBhbmltc1tjYXJkXVxyXG4gICAgICAgICAgd2hvID0gcGxheS53aG9cclxuICAgICAgICAgIGxvY2F0aW9uID0gbG9jYXRpb25zW3dob11cclxuICAgICAgICAgIEBhbmltc1tjYXJkXSA9IG5ldyBBbmltYXRpb24ge1xyXG4gICAgICAgICAgICBzcGVlZDogQGhhbmQuY2FyZFNwZWVkXHJcbiAgICAgICAgICAgIHg6IGxvY2F0aW9uLnhcclxuICAgICAgICAgICAgeTogbG9jYXRpb24ueVxyXG4gICAgICAgICAgICByOiAtMSAqIE1hdGguUEkgLyA0XHJcbiAgICAgICAgICAgIHM6IEBzY2FsZVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgIHRvUmVtb3ZlID0gW11cclxuICAgIGZvciBjYXJkLGFuaW0gb2YgQGFuaW1zXHJcbiAgICAgIGlmIG5vdCBzZWVuLmhhc093blByb3BlcnR5KGNhcmQpXHJcbiAgICAgICAgdG9SZW1vdmUucHVzaCBjYXJkXHJcbiAgICBmb3IgY2FyZCBpbiB0b1JlbW92ZVxyXG4gICAgICAjIEBnYW1lLmxvZyBcInJlbW92aW5nIGFuaW0gZm9yICN7Y2FyZH1cIlxyXG4gICAgICBkZWxldGUgQGFuaW1zW2NhcmRdXHJcblxyXG4gICAgQHVwZGF0ZVBvc2l0aW9ucygpXHJcblxyXG4gIHVwZGF0ZVBvc2l0aW9uczogLT5cclxuICAgIGxvY2F0aW9ucyA9IEBwbGF5TG9jYXRpb25zXHJcbiAgICBmb3IgcGxheSwgcGxheUluZGV4IGluIEBwbGF5c1xyXG4gICAgICBmb3IgdiwgaW5kZXggaW4gcGxheS5jYXJkc1xyXG4gICAgICAgIGFuaW0gPSBAYW5pbXNbdl1cclxuICAgICAgICBsb2MgPSBwbGF5Lndob1xyXG4gICAgICAgIGFuaW0ucmVxLnggPSBsb2NhdGlvbnNbbG9jXS54ICsgKGluZGV4ICogQGhhbmQuY2FyZFdpZHRoICogQHBsYXlDYXJkU3BhY2luZylcclxuICAgICAgICBhbmltLnJlcS55ID0gbG9jYXRpb25zW2xvY10ueVxyXG4gICAgICAgIGFuaW0ucmVxLnIgPSAwLjIgKiBNYXRoLmNvcyhwbGF5SW5kZXggLyAwLjEpXHJcbiAgICAgICAgYW5pbS5yZXEucyA9IEBzY2FsZVxyXG5cclxuICByZWFkeUZvck5leHRUcmljazogLT5cclxuICAgIHJldHVybiBAcmVzdGluZygpXHJcbiAgICAjIHJldHVybiAoQHNldHRsZVRpbWVyID09IDApXHJcblxyXG4gIHVwZGF0ZTogKGR0KSAtPlxyXG4gICAgdXBkYXRlZCA9IGZhbHNlXHJcblxyXG4gICAgaWYgQHNldHRsZVRpbWVyID4gMFxyXG4gICAgICB1cGRhdGVkID0gdHJ1ZVxyXG4gICAgICBAc2V0dGxlVGltZXIgLT0gZHRcclxuICAgICAgaWYgQHNldHRsZVRpbWVyIDwgMFxyXG4gICAgICAgIEBzZXR0bGVUaW1lciA9IDBcclxuXHJcbiAgICBmb3IgY2FyZCxhbmltIG9mIEBhbmltc1xyXG4gICAgICBpZiBhbmltLnVwZGF0ZShkdClcclxuICAgICAgICB1cGRhdGVkID0gdHJ1ZVxyXG5cclxuICAgIHJldHVybiB1cGRhdGVkXHJcblxyXG4gICMgdXNlZCBieSB0aGUgZ2FtZSBvdmVyIHNjcmVlbi4gSXQgcmV0dXJucyB0cnVlIHdoZW4gbmVpdGhlciB0aGUgcGlsZSBub3IgdGhlIGxhc3QgdGhyb3duIGFyZSBtb3ZpbmdcclxuICByZXN0aW5nOiAtPlxyXG4gICAgZm9yIGNhcmQsYW5pbSBvZiBAYW5pbXNcclxuICAgICAgaWYgYW5pbS5hbmltYXRpbmcoKVxyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgaWYgQHNldHRsZVRpbWVyID4gMFxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIHJldHVybiB0cnVlXHJcblxyXG4gIHJlbmRlcjogLT5cclxuICAgIGZvciBwbGF5LCBwbGF5SW5kZXggaW4gQHBsYXlzXHJcbiAgICAgIGhpZ2hsaWdodCA9IEhhbmQuSGlnaGxpZ2h0LlBJTEVcclxuICAgICAgaWYgcGxheUluZGV4ID09IChAcGxheXMubGVuZ3RoIC0gMSlcclxuICAgICAgICBoaWdobGlnaHQgPSBIYW5kLkhpZ2hsaWdodC5OT05FXHJcbiAgICAgIGZvciB2LCBpbmRleCBpbiBwbGF5LmNhcmRzXHJcbiAgICAgICAgYW5pbSA9IEBhbmltc1t2XVxyXG4gICAgICAgIEBoYW5kLnJlbmRlckNhcmQgdiwgYW5pbS5jdXIueCwgYW5pbS5jdXIueSwgYW5pbS5jdXIuciwgYW5pbS5jdXIucywgaGlnaGxpZ2h0XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBpbGVcclxuIiwiY2xhc3MgU3ByaXRlUmVuZGVyZXJcclxuICBjb25zdHJ1Y3RvcjogKEBnYW1lKSAtPlxyXG4gICAgQHNwcml0ZXMgPVxyXG4gICAgICAjIGdlbmVyaWMgc3ByaXRlc1xyXG4gICAgICBzb2xpZDogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAgNTUsIHk6IDcyMywgdzogIDEwLCBoOiAgMTAgfVxyXG4gICAgICBwYXVzZTogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA2MDIsIHk6IDcwNywgdzogMTIyLCBoOiAxMjUgfVxyXG4gICAgICBidXR0b24wOiAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAxNDAsIHk6IDc3NywgdzogNDIyLCBoOiAgNjUgfVxyXG4gICAgICBidXR0b24xOiAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAxNDAsIHk6IDY5OCwgdzogNDIyLCBoOiAgNjUgfVxyXG4gICAgICBwbHVzMDogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA3NDUsIHk6IDY2NCwgdzogMTE2LCBoOiAxMTggfVxyXG4gICAgICBwbHVzMTogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA3NDUsIHk6IDgyMCwgdzogMTE2LCBoOiAxMTggfVxyXG4gICAgICBtaW51czA6ICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA4OTUsIHk6IDY2NCwgdzogMTE2LCBoOiAxMTggfVxyXG4gICAgICBtaW51czE6ICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA4OTUsIHk6IDgyMCwgdzogMTE2LCBoOiAxMTggfVxyXG4gICAgICBhcnJvd0w6ICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAgMzMsIHk6IDg1OCwgdzogMjA0LCBoOiAxNTYgfVxyXG4gICAgICBhcnJvd1I6ICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAyMzksIHk6IDg1MiwgdzogMjA4LCBoOiAxNTUgfVxyXG5cclxuICAgICAgcGlsZTogICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogIDEzLCB5OiA4ODMsIHc6IDEyOCwgaDogMTI4IH1cclxuICAgICAgcGlsZTA6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogMTQ1LCB5OiA4ODMsIHc6IDEyOCwgaDogMTI4IH1cclxuICAgICAgcGlsZTE6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogMjc3LCB5OiA4ODMsIHc6IDEyOCwgaDogMTI4IH1cclxuICAgICAgcGlsZTI6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogNDA5LCB5OiA4ODMsIHc6IDEyOCwgaDogMTI4IH1cclxuICAgICAgcGlsZTM6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogNTQxLCB5OiA4ODMsIHc6IDEyOCwgaDogMTI4IH1cclxuXHJcbiAgICAgICMgbWVudSBiYWNrZ3JvdW5kc1xyXG4gICAgICBtYWlubWVudTogIHsgdGV4dHVyZTogXCJtYWlubWVudVwiLCAgeDogMCwgeTogMCwgdzogMTI4MCwgaDogNzIwIH1cclxuICAgICAgcGF1c2VtZW51OiB7IHRleHR1cmU6IFwicGF1c2VtZW51XCIsIHg6IDAsIHk6IDAsIHc6IDEyODAsIGg6IDcyMCB9XHJcblxyXG4gICAgICAjIGhvd3RvXHJcbiAgICAgIGhvd3RvMTogICAgeyB0ZXh0dXJlOiBcImhvd3RvMVwiLCAgeDogMCwgeTogIDAsIHc6IDE5MjAsIGg6IDEwODAgfVxyXG5cclxuICAgICAgYXU6ICAgICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogNTQwLCB5OiAxMDc5LCB3OiA0MDAsIGg6ICA4MCB9XHJcbiAgICAgIHN0YXJfb246ICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6ICAzOCwgeTogMTA2NiwgdzogMTkwLCBoOiAxOTAgfVxyXG4gICAgICBzdGFyX29mZjogIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAyNTAsIHk6IDEwNjYsIHc6IDE5MCwgaDogMTkwIH1cclxuXHJcbiAgICAgICMgY2hhcmFjdGVyc1xyXG4gICAgICBtYXJpbzogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAgMjAsIHk6ICAgMCwgdzogMTUxLCBoOiAzMDggfVxyXG4gICAgICBsdWlnaTogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAxNzEsIHk6ICAgMCwgdzogMTUxLCBoOiAzMDggfVxyXG4gICAgICBwZWFjaDogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAzMzUsIHk6ICAgMCwgdzogMTY0LCBoOiAzMDggfVxyXG4gICAgICBkYWlzeTogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA1MDQsIHk6ICAgMCwgdzogMTY0LCBoOiAzMDggfVxyXG4gICAgICB5b3NoaTogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA2NjgsIHk6ICAgMCwgdzogMTgwLCBoOiAzMDggfVxyXG4gICAgICB0b2FkOiAgICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA4NDksIHk6ICAgMCwgdzogMTU3LCBoOiAzMDggfVxyXG4gICAgICBib3dzZXI6ICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAgMTEsIHk6IDMyMiwgdzogMTUxLCBoOiAzMDggfVxyXG4gICAgICBib3dzZXJqcjogIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAyMjUsIHk6IDMyMiwgdzogMTQ0LCBoOiAzMDggfVxyXG4gICAgICBrb29wYTogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAzNzIsIHk6IDMyMiwgdzogMTI4LCBoOiAzMDggfVxyXG4gICAgICByb3NhbGluYTogIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA1MDAsIHk6IDMyMiwgdzogMTczLCBoOiAzMDggfVxyXG4gICAgICBzaHlndXk6ICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA2OTEsIHk6IDMyMiwgdzogMTU0LCBoOiAzMDggfVxyXG4gICAgICB0b2FkZXR0ZTogIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA4NDcsIHk6IDMyMiwgdzogMTU4LCBoOiAzMDggfVxyXG5cclxuICBjYWxjV2lkdGg6IChzcHJpdGVOYW1lLCBoZWlnaHQpIC0+XHJcbiAgICBzcHJpdGUgPSBAc3ByaXRlc1tzcHJpdGVOYW1lXVxyXG4gICAgcmV0dXJuIDEgaWYgbm90IHNwcml0ZVxyXG4gICAgcmV0dXJuIGhlaWdodCAqIHNwcml0ZS53IC8gc3ByaXRlLmhcclxuXHJcbiAgcmVuZGVyOiAoc3ByaXRlTmFtZSwgZHgsIGR5LCBkdywgZGgsIHJvdCwgYW5jaG9yeCwgYW5jaG9yeSwgY29sb3IsIGNiKSAtPlxyXG4gICAgc3ByaXRlID0gQHNwcml0ZXNbc3ByaXRlTmFtZV1cclxuICAgIHJldHVybiBpZiBub3Qgc3ByaXRlXHJcbiAgICBpZiAoZHcgPT0gMCkgYW5kIChkaCA9PSAwKVxyXG4gICAgICAjIHRoaXMgcHJvYmFibHkgc2hvdWxkbid0IGV2ZXIgYmUgdXNlZC5cclxuICAgICAgZHcgPSBzcHJpdGUueFxyXG4gICAgICBkaCA9IHNwcml0ZS55XHJcbiAgICBlbHNlIGlmIGR3ID09IDBcclxuICAgICAgZHcgPSBkaCAqIHNwcml0ZS53IC8gc3ByaXRlLmhcclxuICAgIGVsc2UgaWYgZGggPT0gMFxyXG4gICAgICBkaCA9IGR3ICogc3ByaXRlLmggLyBzcHJpdGUud1xyXG4gICAgQGdhbWUuZHJhd0ltYWdlIHNwcml0ZS50ZXh0dXJlLCBzcHJpdGUueCwgc3ByaXRlLnksIHNwcml0ZS53LCBzcHJpdGUuaCwgZHgsIGR5LCBkdywgZGgsIHJvdCwgYW5jaG9yeCwgYW5jaG9yeSwgY29sb3IuciwgY29sb3IuZywgY29sb3IuYiwgY29sb3IuYSwgY2JcclxuICAgIHJldHVyblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTcHJpdGVSZW5kZXJlclxyXG4iLCJNSU5fUExBWUVSUyA9IDNcclxuTUFYX0xPR19MSU5FUyA9IDZcclxuT0sgPSAnT0snXHJcblxyXG5TdWl0ID1cclxuICBOT05FOiAtMVxyXG4gIFNQQURFUzogMFxyXG4gIENMVUJTOiAxXHJcbiAgRElBTU9ORFM6IDJcclxuICBIRUFSVFM6IDNcclxuXHJcblN1aXROYW1lID0gWydTcGFkZXMnLCAnQ2x1YnMnLCAnRGlhbW9uZHMnLCAnSGVhcnRzJ11cclxuU2hvcnRTdWl0TmFtZSA9IFsnUycsICdDJywgJ0QnLCAnSCddXHJcbkdseXBoU3VpdE5hbWUgPSBbXCJcXHhjOFwiLCBcIlxceGM5XCIsIFwiXFx4Y2FcIiwgXCJcXHhjYlwiXVxyXG5cclxuU1RBUlRJTkdfTU9ORVkgPSAyNVxyXG5cclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuIyBBSSBOYW1lIEdlbmVyYXRvclxyXG5cclxuYWlDaGFyYWN0ZXJMaXN0ID0gW1xyXG4gIHsgaWQ6IFwibWFyaW9cIiwgICAgbmFtZTogXCJNYXJpb1wiLCAgICAgIHNwcml0ZTogXCJtYXJpb1wiLCAgICBicmFpbjogXCJub3JtYWxcIiB9XHJcbiAgeyBpZDogXCJsdWlnaVwiLCAgICBuYW1lOiBcIkx1aWdpXCIsICAgICAgc3ByaXRlOiBcImx1aWdpXCIsICAgIGJyYWluOiBcIm5vcm1hbFwiIH1cclxuICB7IGlkOiBcInBlYWNoXCIsICAgIG5hbWU6IFwiUGVhY2hcIiwgICAgICBzcHJpdGU6IFwicGVhY2hcIiwgICAgYnJhaW46IFwibm9ybWFsXCIgfVxyXG4gIHsgaWQ6IFwiZGFpc3lcIiwgICAgbmFtZTogXCJEYWlzeVwiLCAgICAgIHNwcml0ZTogXCJkYWlzeVwiLCAgICBicmFpbjogXCJub3JtYWxcIiB9XHJcbiAgeyBpZDogXCJ5b3NoaVwiLCAgICBuYW1lOiBcIllvc2hpXCIsICAgICAgc3ByaXRlOiBcInlvc2hpXCIsICAgIGJyYWluOiBcIm5vcm1hbFwiIH1cclxuICB7IGlkOiBcInRvYWRcIiwgICAgIG5hbWU6IFwiVG9hZFwiLCAgICAgICBzcHJpdGU6IFwidG9hZFwiLCAgICAgYnJhaW46IFwibm9ybWFsXCIgfVxyXG4gIHsgaWQ6IFwiYm93c2VyXCIsICAgbmFtZTogXCJCb3dzZXJcIiwgICAgIHNwcml0ZTogXCJib3dzZXJcIiwgICBicmFpbjogXCJub3JtYWxcIiB9XHJcbiAgeyBpZDogXCJib3dzZXJqclwiLCBuYW1lOiBcIkJvd3NlciBKclwiLCAgc3ByaXRlOiBcImJvd3NlcmpyXCIsIGJyYWluOiBcIm5vcm1hbFwiIH1cclxuICB7IGlkOiBcImtvb3BhXCIsICAgIG5hbWU6IFwiS29vcGFcIiwgICAgICBzcHJpdGU6IFwia29vcGFcIiwgICAgYnJhaW46IFwibm9ybWFsXCIgfVxyXG4gIHsgaWQ6IFwicm9zYWxpbmFcIiwgbmFtZTogXCJSb3NhbGluYVwiLCAgIHNwcml0ZTogXCJyb3NhbGluYVwiLCBicmFpbjogXCJub3JtYWxcIiB9XHJcbiAgeyBpZDogXCJzaHlndXlcIiwgICBuYW1lOiBcIlNoeWd1eVwiLCAgICAgc3ByaXRlOiBcInNoeWd1eVwiLCAgIGJyYWluOiBcIm5vcm1hbFwiIH1cclxuICB7IGlkOiBcInRvYWRldHRlXCIsIG5hbWU6IFwiVG9hZGV0dGVcIiwgICBzcHJpdGU6IFwidG9hZGV0dGVcIiwgYnJhaW46IFwibm9ybWFsXCIgfVxyXG5dXHJcblxyXG5haUNoYXJhY3RlcnMgPSB7fVxyXG5mb3IgY2hhcmFjdGVyIGluIGFpQ2hhcmFjdGVyTGlzdFxyXG4gIGFpQ2hhcmFjdGVyc1tjaGFyYWN0ZXIuaWRdID0gY2hhcmFjdGVyXHJcblxyXG5yYW5kb21DaGFyYWN0ZXIgPSAtPlxyXG4gIHIgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBhaUNoYXJhY3Rlckxpc3QubGVuZ3RoKVxyXG4gIHJldHVybiBhaUNoYXJhY3Rlckxpc3Rbcl1cclxuXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgQ2FyZFxyXG5cclxuY2xhc3MgQ2FyZFxyXG4gIGNvbnN0cnVjdG9yOiAoQHJhdykgLT5cclxuICAgIEBzdWl0ICA9IE1hdGguZmxvb3IoQHJhdyAlIDQpXHJcbiAgICBAdmFsdWUgPSBNYXRoLmZsb29yKEByYXcgLyA0KVxyXG4gICAgQHZhbHVlTmFtZSA9IHN3aXRjaCBAdmFsdWVcclxuICAgICAgd2hlbiAgOCB0aGVuICdKJ1xyXG4gICAgICB3aGVuICA5IHRoZW4gJ1EnXHJcbiAgICAgIHdoZW4gMTAgdGhlbiAnSydcclxuICAgICAgd2hlbiAxMSB0aGVuICdBJ1xyXG4gICAgICB3aGVuIDEyIHRoZW4gJzInXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBTdHJpbmcoQHZhbHVlICsgMylcclxuICAgIEBuYW1lID0gQHZhbHVlTmFtZSArIFNob3J0U3VpdE5hbWVbQHN1aXRdXHJcbiAgICAjIGNvbnNvbGUubG9nIFwiI3tAcmF3fSAtPiAje0BuYW1lfVwiXHJcbiAgZ2x5cGhlZE5hbWU6IC0+XHJcbiAgICByZXR1cm4gQHZhbHVlTmFtZSArIEdseXBoU3VpdE5hbWVbQHN1aXRdXHJcblxyXG5jYXJkc1RvU3RyaW5nID0gKHJhd0NhcmRzKSAtPlxyXG4gIGNhcmROYW1lcyA9IFtdXHJcbiAgZm9yIHJhdyBpbiByYXdDYXJkc1xyXG4gICAgY2FyZCA9IG5ldyBDYXJkKHJhdylcclxuICAgIGNhcmROYW1lcy5wdXNoIGNhcmQubmFtZVxyXG4gIHJldHVybiBcIlsgXCIgKyBjYXJkTmFtZXMuam9pbignLCcpICsgXCIgXVwiXHJcblxyXG5wbGF5VHlwZVRvU3RyaW5nID0gKHR5cGUpIC0+XHJcbiAgaWYgbWF0Y2hlcyA9IHR5cGUubWF0Y2goL15yb3AoXFxkKykvKVxyXG4gICAgcmV0dXJuIFwiUnVuIG9mICN7bWF0Y2hlc1sxXX0gUGFpcnNcIlxyXG4gIGlmIG1hdGNoZXMgPSB0eXBlLm1hdGNoKC9ecnVuKFxcZCspLylcclxuICAgIHJldHVybiBcIlJ1biBvZiAje21hdGNoZXNbMV19XCJcclxuICBpZiBtYXRjaGVzID0gdHlwZS5tYXRjaCgvXmtpbmQoXFxkKykvKVxyXG4gICAgaWYgbWF0Y2hlc1sxXSA9PSAnMSdcclxuICAgICAgcmV0dXJuICdTaW5nbGUnXHJcbiAgICBpZiBtYXRjaGVzWzFdID09ICcyJ1xyXG4gICAgICByZXR1cm4gJ1BhaXInXHJcbiAgICBpZiBtYXRjaGVzWzFdID09ICczJ1xyXG4gICAgICByZXR1cm4gJ1RyaXBzJ1xyXG4gICAgcmV0dXJuICdRdWFkcydcclxuICByZXR1cm4gdHlwZVxyXG5cclxucGxheVRvU3RyaW5nID0gKHBsYXkpIC0+XHJcbiAgaGlnaENhcmQgPSBuZXcgQ2FyZChwbGF5LmhpZ2gpXHJcbiAgcmV0dXJuIFwiI3twbGF5VHlwZVRvU3RyaW5nKHBsYXkudHlwZSl9IC0gI3toaWdoQ2FyZC5nbHlwaGVkTmFtZSgpfVwiXHJcblxyXG5wbGF5VG9DYXJkQ291bnQgPSAocGxheSkgLT5cclxuICBpZiBtYXRjaGVzID0gcGxheS50eXBlLm1hdGNoKC9ecm9wKFxcZCspLylcclxuICAgIHJldHVybiBwYXJzZUludChtYXRjaGVzWzFdKSAqIDJcclxuICBpZiBtYXRjaGVzID0gcGxheS50eXBlLm1hdGNoKC9ecnVuKFxcZCspLylcclxuICAgIHJldHVybiBwYXJzZUludChtYXRjaGVzWzFdKVxyXG4gIGlmIG1hdGNoZXMgPSBwbGF5LnR5cGUubWF0Y2goL15raW5kKFxcZCspLylcclxuICAgIHJldHVybiBwYXJzZUludChtYXRjaGVzWzFdKVxyXG4gIHJldHVybiAxICMgPz9cclxuXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgRGVja1xyXG5cclxuY2xhc3MgU2h1ZmZsZWREZWNrXHJcbiAgY29uc3RydWN0b3I6IC0+XHJcbiAgICAjIGRhdCBpbnNpZGUtb3V0IHNodWZmbGUhXHJcbiAgICBAY2FyZHMgPSBbIDAgXVxyXG4gICAgZm9yIGkgaW4gWzEuLi41Ml1cclxuICAgICAgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGkpXHJcbiAgICAgIEBjYXJkcy5wdXNoKEBjYXJkc1tqXSlcclxuICAgICAgQGNhcmRzW2pdID0gaVxyXG5cclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuIyBBY2hpZXZlbWVudHNcclxuXHJcbmFjaGlldmVtZW50c0xpc3QgPSBbXHJcbiAge1xyXG4gICAgaWQ6IFwidmV0ZXJhblwiXHJcbiAgICB0aXRsZTogXCJJJ3ZlIFNlZW4gU29tZSBUaGluZ3NcIlxyXG4gICAgZGVzY3JpcHRpb246IFtcIlBsYXkgNTAgSGFuZHMuXCJdXHJcbiAgICBwcm9ncmVzczogKGFjaCkgLT5cclxuICAgICAgaWYgYWNoLnN0YXRlLnRvdGFsR2FtZXMgPj0gNTBcclxuICAgICAgICByZXR1cm4gXCJUb3RhbCBQbGF5ZWQ6IGBhYWZmYWFgI3thY2guc3RhdGUudG90YWxHYW1lc31gYCBHYW1lc1wiXHJcbiAgICAgIHJldHVybiBcIlByb2dyZXNzOiAje2FjaC5zdGF0ZS50b3RhbEdhbWVzfSAvIDUwXCJcclxuICB9XHJcbiAge1xyXG4gICAgaWQ6IFwidHJ5aGFyZFwiXHJcbiAgICB0aXRsZTogXCJUcnloYXJkXCJcclxuICAgIGRlc2NyaXB0aW9uOiBbXCJFYXJuIGEgNSBnYW1lIHdpbiBzdHJlYWsuXCJdXHJcbiAgICBwcm9ncmVzczogKGFjaCkgLT5cclxuICAgICAgYmVzdFN0cmVhayA9IGFjaC5zdGF0ZS5iZXN0U3RyZWFrXHJcbiAgICAgIGJlc3RTdHJlYWsgPz0gMFxyXG4gICAgICBpZiBiZXN0U3RyZWFrID49IDVcclxuICAgICAgICByZXR1cm4gXCJCZXN0IFN0cmVhazogYGFhZmZhYWAje2Jlc3RTdHJlYWt9YGAgV2luc1wiXHJcbiAgICAgIHMgPSBcIlwiXHJcbiAgICAgIGlmIGJlc3RTdHJlYWsgPiAxXHJcbiAgICAgICAgcyA9IFwic1wiXHJcbiAgICAgIHJldHVybiBcIkJlc3QgU3RyZWFrOiAje2Jlc3RTdHJlYWt9IFdpbiN7c31cIlxyXG4gIH1cclxuICB7XHJcbiAgICBpZDogXCJicmVha2VyXCJcclxuICAgIHRpdGxlOiBcIlNwcmluZyBCcmVha1wiXHJcbiAgICBkZXNjcmlwdGlvbjogW1wiQnJlYWsgYSAyLlwiXVxyXG4gIH1cclxuICB7XHJcbiAgICBpZDogXCJrZWVwaXRsb3dcIlxyXG4gICAgdGl0bGU6IFwiS2VlcCBJdCBMb3csIEJveXNcIlxyXG4gICAgZGVzY3JpcHRpb246IFtcIlBsYXkgYSBTaW5nbGUgMiBvbiB0b3Agb2YgYSBTaW5nbGUgMy5cIl1cclxuICB9XHJcbiAge1xyXG4gICAgaWQ6IFwic3VpdGVkXCJcclxuICAgIHRpdGxlOiBcIkRvZXNuJ3QgRXZlbiBNYXR0ZXJcIlxyXG4gICAgZGVzY3JpcHRpb246IFtcIlRocm93IGEgc3VpdGVkIHJ1bi5cIl1cclxuICB9XHJcbiAge1xyXG4gICAgaWQ6IFwidG9ueVwiXHJcbiAgICB0aXRsZTogXCJUaGUgVG9ueVwiXHJcbiAgICBkZXNjcmlwdGlvbjogW1wiVGhyb3cgYSBydW4gb2YgNyBvciBtb3JlIGNhcmRzLCBhbmQgdGhlbiBsb3NlLlwiXVxyXG4gIH1cclxuICB7XHJcbiAgICBpZDogXCJzYW1wbGVyXCJcclxuICAgIHRpdGxlOiBcIlNhbXBsZXIgUGxhdHRlclwiXHJcbiAgICBkZXNjcmlwdGlvbjogW1wiSW4gYSBzaW5nbGUgaGFuZDogcGxheSBhdCBsZWFzdCBvbmUgU2luZ2xlLFwiLCBcIm9uZSBQYWlyLCBvbmUgVHJpcHMsIGFuZCBvbmUgUnVuLlwiXVxyXG4gIH1cclxuICB7XHJcbiAgICBpZDogXCJ0cmFnZWR5XCJcclxuICAgIHRpdGxlOiBcIlRyYWdlZHlcIlxyXG4gICAgZGVzY3JpcHRpb246IFtcIkJlZ2luIHRoZSBnYW1lIGJ5IHRocm93aW5nIGEgdHdvIGJyZWFrZXIgaW52b2x2aW5nXCIsIFwidGhlIDMgb2YgU3BhZGVzLlwiXVxyXG4gIH1cclxuICB7XHJcbiAgICBpZDogXCJpbmRvbWl0YWJsZVwiXHJcbiAgICB0aXRsZTogXCJJbmRvbWl0YWJsZVwiXHJcbiAgICBkZXNjcmlwdGlvbjogW1wiVGhyb3cgYSBydW4gZW5kaW5nIGluIHRoZSBBY2Ugb2YgSGVhcnRzLlwiXVxyXG4gIH1cclxuICB7XHJcbiAgICBpZDogXCJyZWt0XCJcclxuICAgIHRpdGxlOiBcIkdldCBSZWt0XCJcclxuICAgIGRlc2NyaXB0aW9uOiBbXCJXaW4gd2hpbGUgYWxsIG9wcG9uZW50cyBzdGlsbCBoYXZlIDEwIG9yIG1vcmUgY2FyZHMuXCJdXHJcbiAgfVxyXG4gIHtcclxuICAgIGlkOiBcImxhdGVcIlxyXG4gICAgdGl0bGU6IFwiRmFzaGlvbmFibHkgTGF0ZVwiXHJcbiAgICBkZXNjcmlwdGlvbjogW1wiUGFzcyB1bnRpbCBhbGwgNCAycyBhcmUgdGhyb3duLCBhbmQgdGhlbiB3aW4uXCJdXHJcbiAgfVxyXG4gIHtcclxuICAgIGlkOiBcInBhaXJzXCJcclxuICAgIHRpdGxlOiBcIlBhaXJpbmcgVXBcIlxyXG4gICAgZGVzY3JpcHRpb246IFtcIlRocm93IDUgcGFpcnMgaW4gYSBzaW5nbGUgcm91bmQuXCJdXHJcbiAgfVxyXG4gIHtcclxuICAgIGlkOiBcInlvdXJzZWxmXCJcclxuICAgIHRpdGxlOiBcIllvdSBQbGF5ZWQgWW91cnNlbGZcIlxyXG4gICAgZGVzY3JpcHRpb246IFtcIkJlYXQgeW91ciBvd24gcGxheS5cIl1cclxuICB9XHJcbiAge1xyXG4gICAgaWQ6IFwidGhpcnRlZW5cIlxyXG4gICAgdGl0bGU6IFwiVGhpcnRlZW5cIlxyXG4gICAgZGVzY3JpcHRpb246IFtcIkVhcm4gMTMgYWNoaWV2ZW1lbnRzLlwiXVxyXG4gIH1cclxuXVxyXG5cclxuYWNoaWV2ZW1lbnRzTWFwID0ge31cclxuZm9yIGUgaW4gYWNoaWV2ZW1lbnRzTGlzdFxyXG4gIGFjaGlldmVtZW50c01hcFtlLmlkXSA9IGVcclxuXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgVGhpcnRlZW5cclxuXHJcbmNsYXNzIFRoaXJ0ZWVuXHJcbiAgY29uc3RydWN0b3I6IChAZ2FtZSwgcGFyYW1zKSAtPlxyXG4gICAgcmV0dXJuIGlmIG5vdCBwYXJhbXNcclxuXHJcbiAgICBpZiBwYXJhbXMuc3RhdGVcclxuICAgICAgZm9yIGssdiBvZiBwYXJhbXMuc3RhdGVcclxuICAgICAgICBpZiBwYXJhbXMuc3RhdGUuaGFzT3duUHJvcGVydHkoaylcclxuICAgICAgICAgIHRoaXNba10gPSBwYXJhbXMuc3RhdGVba11cclxuICAgICAgQGluaXRBY2hpZXZlbWVudHMoKVxyXG4gICAgZWxzZVxyXG4gICAgICBAbmV3R2FtZShwYXJhbXMubW9uZXkpXHJcblxyXG4gIGluaXRBY2hpZXZlbWVudHM6IC0+XHJcbiAgICBAYWNoID89IHt9XHJcbiAgICBAYWNoLmVhcm5lZCA/PSB7fVxyXG4gICAgQGFjaC5zdGF0ZSA/PSB7fVxyXG4gICAgQGFjaC5zdGF0ZS50b3RhbEdhbWVzID89IDBcclxuICAgIEBmYW5mYXJlcyA9IFtdXHJcblxyXG4gIGRlYWw6IChwYXJhbXMpIC0+XHJcbiAgICBkZWNrID0gbmV3IFNodWZmbGVkRGVjaygpXHJcbiAgICBmb3IgcGxheWVyLCBwbGF5ZXJJbmRleCBpbiBAcGxheWVyc1xyXG4gICAgICBAZ2FtZS5sb2cgXCJkZWFsaW5nIDEzIGNhcmRzIHRvIHBsYXllciAje3BsYXllckluZGV4fVwiXHJcblxyXG4gICAgICBwbGF5ZXIucGxhY2UgPSAwXHJcbiAgICAgIHBsYXllci5oYW5kID0gW11cclxuICAgICAgZm9yIGogaW4gWzAuLi4xM11cclxuICAgICAgICByYXcgPSBkZWNrLmNhcmRzLnNoaWZ0KClcclxuICAgICAgICBpZiByYXcgPT0gMFxyXG4gICAgICAgICAgQHR1cm4gPSBwbGF5ZXJJbmRleFxyXG4gICAgICAgIHBsYXllci5oYW5kLnB1c2gocmF3KVxyXG5cclxuICAgICAgIyBjb25zb2xlLmxvZyBcIkBnYW1lLm9wdGlvbnMuc29ydEluZGV4ICN7QGdhbWUub3B0aW9ucy5zb3J0SW5kZXh9XCJcclxuICAgICAgaWYgKEBnYW1lLm9wdGlvbnMuc29ydEluZGV4ID09IDApIG9yIHBsYXllci5haVxyXG4gICAgICAgICMgTm9ybWFsXHJcbiAgICAgICAgcGxheWVyLmhhbmQuc29ydCAoYSxiKSAtPiByZXR1cm4gYSAtIGJcclxuICAgICAgZWxzZVxyXG4gICAgICAgICMgUmV2ZXJzZVxyXG4gICAgICAgIHBsYXllci5oYW5kLnNvcnQgKGEsYikgLT4gcmV0dXJuIGIgLSBhXHJcblxyXG4gICAgQGluaXRBY2hpZXZlbWVudHMoKVxyXG4gICAgQGFjaC5zdGF0ZS50aHJld1NpbmdsZSA9IGZhbHNlXHJcbiAgICBAYWNoLnN0YXRlLnRocmV3UGFpciA9IGZhbHNlXHJcbiAgICBAYWNoLnN0YXRlLnRocmV3VHJpcHMgPSBmYWxzZVxyXG4gICAgQGFjaC5zdGF0ZS50aHJld1J1biA9IGZhbHNlXHJcbiAgICBAYWNoLnN0YXRlLnRocmV3UnVuNyA9IGZhbHNlXHJcbiAgICBAYWNoLnN0YXRlLnR3b3NTZWVuID0gMFxyXG4gICAgQGFjaC5zdGF0ZS5mYXNoaW9uYWJseUxhdGUgPSBmYWxzZVxyXG4gICAgQGFjaC5zdGF0ZS5wYWlyc1Rocm93biA9IDBcclxuICAgIEBhY2guc3RhdGUuYmVzdFN0cmVhayA/PSAwXHJcblxyXG4gICAgQHBpbGUgPSBbXVxyXG4gICAgQHBpbGVXaG8gPSAtMVxyXG4gICAgQHRocm93SUQgPSAwXHJcbiAgICBAY3VycmVudFBsYXkgPSBudWxsXHJcbiAgICBAdW5wYXNzQWxsKClcclxuXHJcbiAgICBmb3JNb25leSA9IFwiXCJcclxuICAgIGlmIEBtb25leVxyXG4gICAgICBmb3JNb25leSA9IFwiIChmb3IgbW9uZXkpXCJcclxuICAgIEBvdXRwdXQoXCJIYW5kIGRlYWx0I3tmb3JNb25leX0sIFwiICsgQHBsYXllcnNbQHR1cm5dLm5hbWUgKyBcIiBwbGF5cyBmaXJzdFwiKVxyXG5cclxuICAgIHJldHVybiBPS1xyXG5cclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICMgVGhpcnRlZW4gbWV0aG9kc1xyXG5cclxuICBuZXdHYW1lOiAobW9uZXkgPSBmYWxzZSkgLT5cclxuICAgICMgbmV3IGdhbWVcclxuICAgIEBsb2cgPSBbXVxyXG4gICAgQHN0cmVhayA9IDBcclxuICAgIEBsYXN0U3RyZWFrID0gMFxyXG4gICAgQG1vbmV5ID0gZmFsc2VcclxuICAgIGlmIG1vbmV5XHJcbiAgICAgIEBtb25leSA9IHRydWVcclxuICAgIGNvbnNvbGUubG9nIFwiZm9yIG1vbmV5OiAje0Btb25leX1cIlxyXG5cclxuICAgIEBwbGF5ZXJzID0gW1xyXG4gICAgICB7IGlkOiAxLCBuYW1lOiAnUGxheWVyJywgaW5kZXg6IDAsIHBhc3M6IGZhbHNlLCBtb25leTogU1RBUlRJTkdfTU9ORVkgfVxyXG4gICAgXVxyXG5cclxuICAgIGZvciBpIGluIFsxLi4uNF1cclxuICAgICAgQGFkZEFJKClcclxuXHJcbiAgICBAZGVhbCgpXHJcblxyXG4gIHNhdmU6IC0+XHJcbiAgICBuYW1lcyA9IFwibG9nIHBsYXllcnMgdHVybiBwaWxlIHBpbGVXaG8gdGhyb3dJRCBjdXJyZW50UGxheSBzdHJlYWsgbGFzdFN0cmVhayBhY2ggbW9uZXlcIi5zcGxpdChcIiBcIilcclxuICAgIHN0YXRlID0ge31cclxuICAgIGZvciBuYW1lIGluIG5hbWVzXHJcbiAgICAgIHN0YXRlW25hbWVdID0gdGhpc1tuYW1lXVxyXG4gICAgcmV0dXJuIHN0YXRlXHJcblxyXG4gIG91dHB1dDogKHRleHQpIC0+XHJcbiAgICBAbG9nLnB1c2ggdGV4dFxyXG4gICAgd2hpbGUgQGxvZy5sZW5ndGggPiBNQVhfTE9HX0xJTkVTXHJcbiAgICAgIEBsb2cuc2hpZnQoKVxyXG5cclxuICBoZWFkbGluZTogLT5cclxuICAgIGlmIEBnYW1lT3ZlcigpXHJcbiAgICAgIHJldHVybiBcIkdhbWUgT3ZlclwiXHJcblxyXG4gICAgaWYgQHBpbGUubGVuZ3RoID09IDBcclxuICAgICAgcGxheVN0cmluZyA9IFwidGhyb3cgQW55dGhpbmcgd2l0aCB0aGUgM1xceGM4XCJcclxuICAgIGVsc2VcclxuICAgICAgaWYgQGN1cnJlbnRQbGF5XHJcbiAgICAgICAgcGxheVN0cmluZyA9IFwiYmVhdCBcIiArIHBsYXlUb1N0cmluZyhAY3VycmVudFBsYXkpXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBwbGF5U3RyaW5nID0gXCJ0aHJvdyBBbnl0aGluZ1wiXHJcblxyXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcclxuICAgIGlmIGN1cnJlbnRQbGF5ZXIuYWlcclxuICAgICAgcGxheWVyQ29sb3IgPSAnYjBiMDAwJ1xyXG4gICAgZWxzZVxyXG4gICAgICBwbGF5ZXJDb2xvciA9ICdmZjc3MDAnXHJcbiAgICBoZWFkbGluZSA9IFwiYCN7cGxheWVyQ29sb3J9YCN7Y3VycmVudFBsYXllci5uYW1lfWBmZmZmZmZgIHRvICN7cGxheVN0cmluZ31cIlxyXG4gICAgaWYgQGV2ZXJ5b25lUGFzc2VkKClcclxuICAgICAgaGVhZGxpbmUgKz0gXCIgKG9yIHRocm93IGFueXRoaW5nKVwiXHJcbiAgICByZXR1cm4gaGVhZGxpbmVcclxuXHJcbiAgY2FuVGhyb3dBbnl0aGluZzogLT5cclxuICAgIGlmIEBwaWxlLmxlbmd0aCA9PSAwXHJcbiAgICAgIHJldHVybiB0cnVlXHJcbiAgICBpZiBub3QgQGN1cnJlbnRQbGF5XHJcbiAgICAgIHJldHVybiB0cnVlXHJcbiAgICBpZiBAZXZlcnlvbmVQYXNzZWQoKVxyXG4gICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gIGZpbmRQbGF5ZXI6IChpZCkgLT5cclxuICAgIGZvciBwbGF5ZXIgaW4gQHBsYXllcnNcclxuICAgICAgaWYgcGxheWVyLmlkID09IGlkXHJcbiAgICAgICAgcmV0dXJuIHBsYXllclxyXG4gICAgcmV0dXJuIHVuZGVmaW5lZFxyXG5cclxuICBjdXJyZW50UGxheWVyOiAtPlxyXG4gICAgcmV0dXJuIEBwbGF5ZXJzW0B0dXJuXVxyXG5cclxuICBmaW5kUGxhY2U6IChwbGFjZSkgLT5cclxuICAgIGZvciBwbGF5ZXIgaW4gQHBsYXllcnNcclxuICAgICAgaWYgKHBsYWNlID09IDQpIGFuZCAocGxheWVyLnBsYWNlID09IDApXHJcbiAgICAgICAgcmV0dXJuIHBsYXllclxyXG4gICAgICBpZiBwbGF5ZXIucGxhY2UgPT0gcGxhY2VcclxuICAgICAgICByZXR1cm4gcGxheWVyXHJcbiAgICByZXR1cm4gdW5kZWZpbmVkXHJcblxyXG4gIHBheW91dDogLT5cclxuICAgIHBsYWNlMSA9IEBmaW5kUGxhY2UoMSlcclxuICAgIHBsYWNlMiA9IEBmaW5kUGxhY2UoMilcclxuICAgIHBsYWNlMyA9IEBmaW5kUGxhY2UoMylcclxuICAgIHBsYWNlNCA9IEBmaW5kUGxhY2UoNClcclxuXHJcbiAgICBpZiBub3QgcGxhY2UxIG9yIG5vdCBwbGFjZTIgb3Igbm90IHBsYWNlMyBvciBub3QgcGxhY2U0XHJcbiAgICAgIEBvdXRwdXQgXCJlcnJvciB3aXRoIHBheW91dHMhXCJcclxuICAgICAgcmV0dXJuXHJcblxyXG4gICAgQG91dHB1dCBcIiN7cGxhY2U0Lm5hbWV9IHBheXMgJDIgdG8gI3twbGFjZTEubmFtZX1cIlxyXG4gICAgQG91dHB1dCBcIiN7cGxhY2UzLm5hbWV9IHBheXMgJDEgdG8gI3twbGFjZTIubmFtZX1cIlxyXG5cclxuICAgIHBsYWNlMS5tb25leSArPSAyXHJcbiAgICBwbGFjZTIubW9uZXkgKz0gMVxyXG4gICAgcGxhY2UzLm1vbmV5ICs9IC0xXHJcbiAgICBwbGFjZTQubW9uZXkgKz0gLTJcclxuICAgIHJldHVyblxyXG5cclxuICAjIGFsbCBJTkNMVURJTkcgdGhlIGN1cnJlbnQgcGxheWVyXHJcbiAgZW50aXJlVGFibGVQYXNzZWQ6IC0+XHJcbiAgICBmb3IgcGxheWVyLCBwbGF5ZXJJbmRleCBpbiBAcGxheWVyc1xyXG4gICAgICBpZiBwbGF5ZXIucGxhY2UgIT0gMFxyXG4gICAgICAgIGNvbnRpbnVlXHJcbiAgICAgIGlmIG5vdCBwbGF5ZXIucGFzc1xyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgcmV0dXJuIHRydWVcclxuXHJcbiAgIyBhbGwgYnV0IHRoZSBjdXJyZW50IHBsYXllclxyXG4gIGV2ZXJ5b25lUGFzc2VkOiAtPlxyXG4gICAgZm9yIHBsYXllciwgcGxheWVySW5kZXggaW4gQHBsYXllcnNcclxuICAgICAgaWYgKHBsYXllci5wbGFjZSAhPSAwKSBhbmQgKEBwaWxlV2hvICE9IHBsYXllckluZGV4KVxyXG4gICAgICAgIGNvbnRpbnVlXHJcbiAgICAgIGlmIHBsYXllckluZGV4ID09IEB0dXJuXHJcbiAgICAgICAgY29udGludWVcclxuICAgICAgaWYgbm90IHBsYXllci5wYXNzXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICBwbGF5ZXJBZnRlcjogKGluZGV4KSAtPlxyXG4gICAgbG9vcFxyXG4gICAgICBpbmRleCA9IChpbmRleCArIDEpICUgQHBsYXllcnMubGVuZ3RoXHJcbiAgICAgIGlmIEBwbGF5ZXJzW2luZGV4XS5wbGFjZSA9PSAwXHJcbiAgICAgICAgcmV0dXJuIGluZGV4XHJcbiAgICByZXR1cm4gMCAjIGltcG9zc2libGU/XHJcblxyXG4gIGFkZFBsYXllcjogKHBsYXllcikgLT5cclxuICAgIGlmIG5vdCBwbGF5ZXIuYWlcclxuICAgICAgcGxheWVyLmFpID0gZmFsc2VcclxuXHJcbiAgICBAcGxheWVycy5wdXNoIHBsYXllclxyXG4gICAgcGxheWVyLmluZGV4ID0gQHBsYXllcnMubGVuZ3RoIC0gMVxyXG4gICAgQG91dHB1dChwbGF5ZXIubmFtZSArIFwiIGpvaW5zIHRoZSBnYW1lXCIpXHJcblxyXG4gIG5hbWVQcmVzZW50OiAobmFtZSkgLT5cclxuICAgIGZvciBwbGF5ZXIgaW4gQHBsYXllcnNcclxuICAgICAgaWYgcGxheWVyLm5hbWUgPT0gbmFtZVxyXG4gICAgICAgIHJldHVybiB0cnVlXHJcblxyXG4gICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gIGFkZEFJOiAtPlxyXG4gICAgbG9vcFxyXG4gICAgICBjaGFyYWN0ZXIgPSByYW5kb21DaGFyYWN0ZXIoKVxyXG4gICAgICBpZiBub3QgQG5hbWVQcmVzZW50KGNoYXJhY3Rlci5uYW1lKVxyXG4gICAgICAgIGJyZWFrXHJcblxyXG4gICAgYWkgPVxyXG4gICAgICBjaGFySUQ6IGNoYXJhY3Rlci5pZFxyXG4gICAgICBuYW1lOiBjaGFyYWN0ZXIubmFtZVxyXG4gICAgICBpZDogJ2FpJyArIFN0cmluZyhAcGxheWVycy5sZW5ndGgpXHJcbiAgICAgIHBhc3M6IGZhbHNlXHJcbiAgICAgIGFpOiB0cnVlXHJcbiAgICAgIG1vbmV5OiBTVEFSVElOR19NT05FWVxyXG5cclxuICAgIEBhZGRQbGF5ZXIoYWkpXHJcblxyXG4gICAgQGdhbWUubG9nKFwiYWRkZWQgQUkgcGxheWVyXCIpXHJcbiAgICByZXR1cm4gT0tcclxuXHJcbiAgdXBkYXRlUGxheWVySGFuZDogKGNhcmRzKSAtPlxyXG4gICAgIyBUaGlzIG1haW50YWlucyB0aGUgcmVvcmdhbml6ZWQgb3JkZXIgb2YgdGhlIHBsYXllcidzIGhhbmRcclxuICAgIEBwbGF5ZXJzWzBdLmhhbmQgPSBjYXJkcy5zbGljZSgwKVxyXG5cclxuICB3aW5uZXI6IC0+XHJcbiAgICBmb3IgcGxheWVyLCBpIGluIEBwbGF5ZXJzXHJcbiAgICAgIGlmIHBsYXllci5wbGFjZSA9PSAxXHJcbiAgICAgICAgcmV0dXJuIHBsYXllclxyXG4gICAgcmV0dXJuIG51bGxcclxuXHJcbiAgZ2FtZU92ZXI6IC0+XHJcbiAgICBucCA9IEBuZXh0UGxhY2UoKVxyXG4gICAgaWYgQG1vbmV5XHJcbiAgICAgIHJldHVybiAobnAgPiAzKVxyXG4gICAgcmV0dXJuIChucCA+IDEpXHJcblxyXG4gIGhhc0NhcmQ6IChoYW5kLCByYXdDYXJkKSAtPlxyXG4gICAgZm9yIHJhdyBpbiBoYW5kXHJcbiAgICAgIGlmIHJhdyA9PSByYXdDYXJkXHJcbiAgICAgICAgcmV0dXJuIHRydWVcclxuICAgIHJldHVybiBmYWxzZVxyXG5cclxuICBoYXNDYXJkczogKGhhbmQsIHJhd0NhcmRzKSAtPlxyXG4gICAgZm9yIHJhdyBpbiByYXdDYXJkc1xyXG4gICAgICBpZiBub3QgQGhhc0NhcmQoaGFuZCwgcmF3KVxyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgcmV0dXJuIHRydWVcclxuXHJcbiAgcmVtb3ZlQ2FyZHM6IChoYW5kLCByYXdDYXJkcykgLT5cclxuICAgIG5ld0hhbmQgPSBbXVxyXG4gICAgZm9yIGNhcmQgaW4gaGFuZFxyXG4gICAgICBrZWVwTWUgPSB0cnVlXHJcbiAgICAgIGZvciByYXcgaW4gcmF3Q2FyZHNcclxuICAgICAgICBpZiBjYXJkID09IHJhd1xyXG4gICAgICAgICAga2VlcE1lID0gZmFsc2VcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgIGlmIGtlZXBNZVxyXG4gICAgICAgIG5ld0hhbmQucHVzaCBjYXJkXHJcbiAgICByZXR1cm4gbmV3SGFuZFxyXG5cclxuICBjbGFzc2lmeTogKHJhd0NhcmRzKSAtPlxyXG4gICAgY2FyZHMgPSByYXdDYXJkcy5tYXAgKHJhdykgLT4gbmV3IENhcmQocmF3KVxyXG4gICAgY2FyZHMgPSBjYXJkcy5zb3J0IChhLCBiKSAtPiByZXR1cm4gYS5yYXcgLSBiLnJhd1xyXG4gICAgaGlnaGVzdFJhdyA9IGNhcmRzW2NhcmRzLmxlbmd0aCAtIDFdLnJhd1xyXG5cclxuICAgICMgbG9vayBmb3IgYSBydW4gb2YgcGFpcnNcclxuICAgIGlmIChjYXJkcy5sZW5ndGggPj0gNikgYW5kICgoY2FyZHMubGVuZ3RoICUgMikgPT0gMClcclxuICAgICAgZm91bmRSb3AgPSB0cnVlXHJcbiAgICAgIGZvciBjYXJkLCBjYXJkSW5kZXggaW4gY2FyZHNcclxuICAgICAgICBpZiBjYXJkSW5kZXggPT0gMFxyXG4gICAgICAgICAgY29udGludWVcclxuICAgICAgICBpZiBjYXJkLnZhbHVlID09IDEyXHJcbiAgICAgICAgICAjIG5vIDJzIGluIGEgcnVuXHJcbiAgICAgICAgICBmb3VuZFJvcCA9IGZhbHNlXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGlmIChjYXJkSW5kZXggJSAyKSA9PSAxXHJcbiAgICAgICAgICAjIG9kZCBjYXJkLCBtdXN0IG1hdGNoIGxhc3QgY2FyZCBleGFjdGx5XHJcbiAgICAgICAgICBpZiBjYXJkLnZhbHVlICE9IChjYXJkc1tjYXJkSW5kZXggLSAxXS52YWx1ZSlcclxuICAgICAgICAgICAgZm91bmRSb3AgPSBmYWxzZVxyXG4gICAgICAgICAgICBicmVha1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICMgZXZlbiBjYXJkLCBtdXN0IGluY3JlbWVudFxyXG4gICAgICAgICAgaWYgY2FyZC52YWx1ZSAhPSAoY2FyZHNbY2FyZEluZGV4IC0gMV0udmFsdWUgKyAxKVxyXG4gICAgICAgICAgICBmb3VuZFJvcCA9IGZhbHNlXHJcbiAgICAgICAgICAgIGJyZWFrXHJcblxyXG4gICAgICBpZiBmb3VuZFJvcFxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAncm9wJyArIE1hdGguZmxvb3IoY2FyZHMubGVuZ3RoIC8gMilcclxuICAgICAgICAgIGhpZ2g6IGhpZ2hlc3RSYXdcclxuICAgICAgICB9XHJcblxyXG4gICAgIyBsb29rIGZvciBhIHJ1blxyXG4gICAgaWYgY2FyZHMubGVuZ3RoID49IDNcclxuICAgICAgZm91bmRSdW4gPSB0cnVlXHJcbiAgICAgIGZvciBjYXJkLCBjYXJkSW5kZXggaW4gY2FyZHNcclxuICAgICAgICBpZiBjYXJkSW5kZXggPT0gMFxyXG4gICAgICAgICAgY29udGludWVcclxuICAgICAgICBpZiBjYXJkLnZhbHVlID09IDEyXHJcbiAgICAgICAgICAjIG5vIDJzIGluIGEgcnVuXHJcbiAgICAgICAgICBmb3VuZFJ1biA9IGZhbHNlXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGlmIGNhcmQudmFsdWUgIT0gKGNhcmRzW2NhcmRJbmRleCAtIDFdLnZhbHVlICsgMSlcclxuICAgICAgICAgIGZvdW5kUnVuID0gZmFsc2VcclxuICAgICAgICAgIGJyZWFrXHJcblxyXG4gICAgICBpZiBmb3VuZFJ1blxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAncnVuJyArIGNhcmRzLmxlbmd0aFxyXG4gICAgICAgICAgaGlnaDogaGlnaGVzdFJhd1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAjIGxvb2sgZm9yIFggb2YgYSBraW5kXHJcbiAgICByZXFWYWx1ZSA9IGNhcmRzWzBdLnZhbHVlXHJcbiAgICBmb3IgY2FyZCBpbiBjYXJkc1xyXG4gICAgICBpZiBjYXJkLnZhbHVlICE9IHJlcVZhbHVlXHJcbiAgICAgICAgcmV0dXJuIG51bGxcclxuICAgIHR5cGUgPSAna2luZCcgKyBjYXJkcy5sZW5ndGhcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHR5cGU6IHR5cGVcclxuICAgICAgaGlnaDogaGlnaGVzdFJhd1xyXG4gICAgfVxyXG5cclxuICBoYW5kSGFzM1M6IChoYW5kKSAtPlxyXG4gICAgZm9yIHJhdyBpbiBoYW5kXHJcbiAgICAgIGlmIHJhdyA9PSAwXHJcbiAgICAgICAgcmV0dXJuIHRydWVcclxuICAgIHJldHVybiBmYWxzZVxyXG5cclxuICBuZXh0UGxhY2U6IC0+XHJcbiAgICBoaWdoZXN0UGxhY2UgPSAwXHJcbiAgICBmb3IgcGxheWVyIGluIEBwbGF5ZXJzXHJcbiAgICAgIHBsYXllci5wbGFjZSA/PSAwXHJcbiAgICAgIGlmIGhpZ2hlc3RQbGFjZSA8IHBsYXllci5wbGFjZVxyXG4gICAgICAgIGhpZ2hlc3RQbGFjZSA9IHBsYXllci5wbGFjZVxyXG4gICAgcmV0dXJuIGhpZ2hlc3RQbGFjZSArIDFcclxuXHJcbiAgc3BsaXRQbGF5VHlwZTogKHBsYXlUeXBlKSAtPlxyXG4gICAgaWYgbWF0Y2hlcyA9IHBsYXlUeXBlLm1hdGNoKC9eKFteMC05XSspKFxcZCspLylcclxuICAgICAgcmV0dXJuIFttYXRjaGVzWzFdLCBwYXJzZUludChtYXRjaGVzWzJdKV1cclxuICAgIHJldHVybiBbcGxheVR5cGUsIDFdXHJcblxyXG4gIGhhc1BsYXk6IChjdXJyZW50UGxheSwgaGFuZCkgLT5cclxuICAgICMgcXVpY2sgY2hlY2suIGlmIHlvdSBkb250IGhhdmUgZW5vdWdoIGNhcmRzLCB5b3UgY2FuJ3QgaGF2ZSBhIHBsYXlcclxuICAgIGlmIChwbGF5VG9DYXJkQ291bnQoY3VycmVudFBsYXkpID4gaGFuZC5sZW5ndGgpXHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG5cclxuICAgIGlmIEBnYW1lLm9wdGlvbnMuYXV0b3Bhc3NJbmRleCA9PSAyXHJcbiAgICAgICMgbGltaXRlZCwgYXNzdW1lIHRoZXJlJ3MgYSBwbGF5IGluIHRoZXJlIHNvbWV3aGVyZSwgaWYgdGhlcmUncyBlbm91Z2ggY2FyZHNcclxuICAgICAgcmV0dXJuIHRydWVcclxuXHJcbiAgICBsZWZ0b3ZlcnMgPSBbXVxyXG4gICAgcGxheXMgPSB7fVxyXG4gICAgc3BsID0gQHNwbGl0UGxheVR5cGUoY3VycmVudFBsYXkudHlwZSlcclxuICAgIHN3aXRjaCBzcGxbMF1cclxuICAgICAgd2hlbiAncm9wJ1xyXG4gICAgICAgIGxlZnRvdmVycyA9IEBhaUNhbGNSb3BzKGhhbmQsIHBsYXlzLCBzcGxbMV0pXHJcbiAgICAgIHdoZW4gJ3J1bidcclxuICAgICAgICBsZWZ0b3ZlcnMgPSBAYWlDYWxjUnVucyhoYW5kLCBwbGF5cywgZmFsc2UsIHNwbFsxXSlcclxuICAgICAgd2hlbiAna2luZCdcclxuICAgICAgICBsZWZ0b3ZlcnMgPSBAYWxDYWxjS2luZHMoaGFuZCwgcGxheXMsIHRydWUpXHJcblxyXG4gICAgcGxheXMua2luZDEgPz0gW11cclxuICAgIGZvciBsZWZ0b3ZlciBpbiBsZWZ0b3ZlcnNcclxuICAgICAgcGxheXMua2luZDEucHVzaCBbbGVmdG92ZXJdXHJcblxyXG4gICAgaWYgcGxheXNbY3VycmVudFBsYXkudHlwZV0/IGFuZCBwbGF5c1tjdXJyZW50UGxheS50eXBlXS5sZW5ndGggPiAwXHJcbiAgICAgICAgZm9yIHBsYXkgaW4gcGxheXNbY3VycmVudFBsYXkudHlwZV1cclxuICAgICAgICAgIGlmIEBoaWdoZXN0Q2FyZChwbGF5KSA+IGN1cnJlbnRQbGF5LmhpZ2hcclxuICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuXHJcbiAgICAjIHNwZWNpYWwgY2FzZSBraW5kc1xyXG4gICAgaWYgc3BsWzBdID09ICdraW5kJ1xyXG4gICAgICAjIGNoZWNrIGJpZ2dlciBraW5kc1xyXG4gICAgICBmb3IgYmlnZ2VyS2luZCBpbiBbc3BsWzFdLi40XVxyXG4gICAgICAgIGJpZ2dlclR5cGUgPSBcImtpbmQje2JpZ2dlcktpbmR9XCJcclxuICAgICAgICBpZiBwbGF5c1tiaWdnZXJUeXBlXT8gYW5kIHBsYXlzW2JpZ2dlclR5cGVdLmxlbmd0aCA+IDBcclxuICAgICAgICAgICAgZm9yIHBsYXkgaW4gcGxheXNbYmlnZ2VyVHlwZV1cclxuICAgICAgICAgICAgICBpZiBAaGlnaGVzdENhcmQocGxheSkgPiBjdXJyZW50UGxheS5oaWdoXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICAgICMgbm8gcGxheXMsIHBhc3NcclxuICAgIHJldHVybiBmYWxzZVxyXG5cclxuICBjYW5QYXNzOiAocGFyYW1zKSAtPlxyXG4gICAgaWYgQGdhbWVPdmVyKClcclxuICAgICAgcmV0dXJuICdnYW1lT3ZlcidcclxuXHJcbiAgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxyXG4gICAgaWYgcGFyYW1zLmlkICE9IGN1cnJlbnRQbGF5ZXIuaWRcclxuICAgICAgcmV0dXJuICdub3RZb3VyVHVybidcclxuXHJcbiAgICBpZiBAcGlsZS5sZW5ndGggPT0gMFxyXG4gICAgICByZXR1cm4gJ211c3RUaHJvdzNTJ1xyXG5cclxuICAgIGlmIEBldmVyeW9uZVBhc3NlZCgpXHJcbiAgICAgIHJldHVybiAndGhyb3dBbnl0aGluZydcclxuXHJcbiAgICByZXR1cm4gT0tcclxuXHJcbiAgY2FuUGxheTogKHBhcmFtcywgaW5jb21pbmdQbGF5LCBoYW5kSGFzM1MpIC0+XHJcbiAgICBpZiBAZ2FtZU92ZXIoKVxyXG4gICAgICByZXR1cm4gJ2dhbWVPdmVyJ1xyXG5cclxuICAgIGN1cnJlbnRQbGF5ZXIgPSBAY3VycmVudFBsYXllcigpXHJcbiAgICBpZiBwYXJhbXMuaWQgIT0gY3VycmVudFBsYXllci5pZFxyXG4gICAgICByZXR1cm4gJ25vdFlvdXJUdXJuJ1xyXG5cclxuICAgIGlmIGluY29taW5nUGxheSA9PSBudWxsXHJcbiAgICAgIHJldHVybiAnaW52YWxpZFBsYXknXHJcblxyXG4gICAgaWYgQHBpbGUubGVuZ3RoID09IDBcclxuICAgICAgaWYgbm90IGhhbmRIYXMzU1xyXG4gICAgICAgIHJldHVybiAnbXVzdFRocm93M1MnXHJcblxyXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcclxuICAgIGlmIGN1cnJlbnRQbGF5ZXIucGFzc1xyXG4gICAgICBpZiBAY3VycmVudFBsYXkgYW5kIEBjYW5CZUJyb2tlbihAY3VycmVudFBsYXkpXHJcbiAgICAgICAgaWYgQGlzQnJlYWtlclR5cGUoaW5jb21pbmdQbGF5LnR5cGUpXHJcbiAgICAgICAgICByZXR1cm4gT0tcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICByZXR1cm4gJ211c3RCcmVha09yUGFzcydcclxuICAgICAgcmV0dXJuICdtdXN0UGFzcydcclxuXHJcbiAgICBpZiBAY3VycmVudFBsYXkgPT0gbnVsbFxyXG4gICAgICByZXR1cm4gT0tcclxuXHJcbiAgICBpZiBAZXZlcnlvbmVQYXNzZWQoKVxyXG4gICAgICByZXR1cm4gT0tcclxuXHJcbiAgICBpZiBAY2FuQmVCcm9rZW4oQGN1cnJlbnRQbGF5KSBhbmQgQGlzQnJlYWtlclR5cGUoaW5jb21pbmdQbGF5LnR5cGUpXHJcbiAgICAgICMgMiBicmVha2VyIVxyXG4gICAgICByZXR1cm4gT0tcclxuXHJcbiAgICBpZiBpbmNvbWluZ1BsYXkudHlwZSAhPSBAY3VycmVudFBsYXkudHlwZVxyXG4gICAgICByZXR1cm4gJ3dyb25nUGxheSdcclxuXHJcbiAgICBpZiBpbmNvbWluZ1BsYXkuaGlnaCA8IEBjdXJyZW50UGxheS5oaWdoXHJcbiAgICAgIHJldHVybiAndG9vTG93UGxheSdcclxuXHJcbiAgICByZXR1cm4gT0tcclxuXHJcbiAgcGxheTogKHBhcmFtcykgLT5cclxuICAgIGluY29taW5nUGxheSA9IEBjbGFzc2lmeShwYXJhbXMuY2FyZHMpXHJcbiAgICBjb25zb2xlLmxvZyBcImluY29taW5nUGxheVwiLCBpbmNvbWluZ1BsYXlcclxuXHJcbiAgICBjb25zb2xlLmxvZyBcInNvbWVvbmUgY2FsbGluZyBwbGF5XCIsIHBhcmFtc1xyXG4gICAgcmV0ID0gQGNhblBsYXkocGFyYW1zLCBpbmNvbWluZ1BsYXksIEBoYW5kSGFzM1MocGFyYW1zLmNhcmRzKSlcclxuICAgIGlmIHJldCAhPSBPS1xyXG4gICAgICByZXR1cm4gcmV0XHJcblxyXG4gICAgYnJlYWtlclRocm93biA9IGZhbHNlXHJcbiAgICBuZXdUaHJvdyA9IHRydWVcclxuXHJcbiAgICAjIFRPRE86IG1ha2UgcHJldHR5IG5hbWVzIGJhc2VkIG9uIHRoZSBwbGF5LCBhZGQgcGxheSB0byBoZWFkbGluZVxyXG4gICAgdmVyYiA9IFwidGhyb3dzOlwiXHJcbiAgICBpZiBAY3VycmVudFBsYXlcclxuICAgICAgaWYgQGNhbkJlQnJva2VuKEBjdXJyZW50UGxheSkgYW5kIEBpc0JyZWFrZXJUeXBlKGluY29taW5nUGxheS50eXBlKVxyXG4gICAgICAgICMgMiBicmVha2VyIVxyXG4gICAgICAgIEB1bnBhc3NBbGwoKVxyXG4gICAgICAgIHZlcmIgPSBcImJyZWFrcyAyOlwiXHJcbiAgICAgICAgYnJlYWtlclRocm93biA9IHRydWVcclxuICAgICAgICBuZXdUaHJvdyA9IGZhbHNlXHJcbiAgICAgIGVsc2UgaWYgKGluY29taW5nUGxheS50eXBlICE9IEBjdXJyZW50UGxheS50eXBlKSBvciAoaW5jb21pbmdQbGF5LmhpZ2ggPCBAY3VycmVudFBsYXkuaGlnaClcclxuICAgICAgICAjIE5ldyBwbGF5IVxyXG4gICAgICAgIEB1bnBhc3NBbGwoKVxyXG4gICAgICAgIHZlcmIgPSBcInRocm93cyBuZXc6XCJcclxuICAgICAgZWxzZVxyXG4gICAgICAgIG5ld1Rocm93ID0gZmFsc2VcclxuICAgIGVsc2VcclxuICAgICAgdmVyYiA9IFwiYmVnaW5zOlwiXHJcblxyXG4gICAgIyBBY2hpZXZlbWVudHNcclxuICAgIEBhY2guc3RhdGUudHdvc1NlZW4gPz0gMFxyXG4gICAgQGFjaC5zdGF0ZS5wYWlyc1Rocm93biA/PSAwXHJcbiAgICBmb3IgY2FyZCBpbiBwYXJhbXMuY2FyZHNcclxuICAgICAgaWYgY2FyZCA+PSA0OFxyXG4gICAgICAgIEBhY2guc3RhdGUudHdvc1NlZW4gKz0gMVxyXG4gICAgaWYgKEBhY2guc3RhdGUudHdvc1NlZW4gPT0gNCkgYW5kIChAcGxheWVyc1swXS5oYW5kLmxlbmd0aCA9PSAxMylcclxuICAgICAgQGFjaC5zdGF0ZS5mYXNoaW9uYWJseUxhdGUgPSB0cnVlXHJcbiAgICBjb25zb2xlLmxvZyBcIkBhY2guc3RhdGUuZmFzaGlvbmFibHlMYXRlICN7QGFjaC5zdGF0ZS5mYXNoaW9uYWJseUxhdGV9XCJcclxuICAgIGlmIEB0dXJuID09IDBcclxuICAgICAgaWYgQGV2ZXJ5b25lUGFzc2VkKCkgYW5kIG5vdCBuZXdUaHJvd1xyXG4gICAgICAgIEBlYXJuIFwieW91cnNlbGZcIlxyXG4gICAgICBpZiBpbmNvbWluZ1BsYXkudHlwZSA9PSAna2luZDInXHJcbiAgICAgICAgQGFjaC5zdGF0ZS5wYWlyc1Rocm93biArPSAxXHJcbiAgICAgICAgaWYgQGFjaC5zdGF0ZS5wYWlyc1Rocm93biA+PSA1XHJcbiAgICAgICAgICBAZWFybiBcInBhaXJzXCJcclxuICAgICAgaWYgYnJlYWtlclRocm93blxyXG4gICAgICAgIEBlYXJuIFwiYnJlYWtlclwiXHJcbiAgICAgIGlmIEBpc0JyZWFrZXJUeXBlKGluY29taW5nUGxheS50eXBlKSBhbmQgKEBwaWxlLmxlbmd0aCA9PSAwKVxyXG4gICAgICAgIEBlYXJuIFwidHJhZ2VkeVwiXHJcbiAgICAgIGlmIEBpc1J1blR5cGUoaW5jb21pbmdQbGF5LnR5cGUpIGFuZCBAaXNTdWl0ZWQocGFyYW1zLmNhcmRzKVxyXG4gICAgICAgIEBlYXJuIFwic3VpdGVkXCJcclxuICAgICAgaWYgQGN1cnJlbnRQbGF5IGFuZCAoQGN1cnJlbnRQbGF5LnR5cGUgPT0gJ2tpbmQxJykgYW5kIChAY3VycmVudFBsYXkuaGlnaCA8PSAzKSBhbmQgKGluY29taW5nUGxheS50eXBlID09ICdraW5kMScpIGFuZCAoaW5jb21pbmdQbGF5LmhpZ2ggPj0gNDgpXHJcbiAgICAgICAgQGVhcm4gXCJrZWVwaXRsb3dcIlxyXG4gICAgICBpZiBAaXNSdW5UeXBlKGluY29taW5nUGxheS50eXBlKSBhbmQgKGluY29taW5nUGxheS5oaWdoID09IDQ3KSAjIEFjZSBvZiBIZWFydHNcclxuICAgICAgICBAZWFybiBcImluZG9taXRhYmxlXCJcclxuICAgICAgaWYgQGlzQmlnUnVuKGluY29taW5nUGxheSwgNylcclxuICAgICAgICBjb25zb2xlLmxvZyBcInRocmV3UnVuNzogdHJ1ZVwiXHJcbiAgICAgICAgQGFjaC5zdGF0ZS50aHJld1J1bjcgPSB0cnVlXHJcbiAgICAgIGlmIGluY29taW5nUGxheS50eXBlID09ICdraW5kMSdcclxuICAgICAgICBAYWNoLnN0YXRlLnRocmV3U2luZ2xlID0gdHJ1ZVxyXG4gICAgICBpZiBpbmNvbWluZ1BsYXkudHlwZSA9PSAna2luZDInXHJcbiAgICAgICAgQGFjaC5zdGF0ZS50aHJld1BhaXIgPSB0cnVlXHJcbiAgICAgIGlmIGluY29taW5nUGxheS50eXBlID09ICdraW5kMydcclxuICAgICAgICBAYWNoLnN0YXRlLnRocmV3VHJpcHMgPSB0cnVlXHJcbiAgICAgIGlmIGluY29taW5nUGxheS50eXBlLm1hdGNoKC9ecnVuLylcclxuICAgICAgICBAYWNoLnN0YXRlLnRocmV3UnVuID0gdHJ1ZVxyXG4gICAgICBpZiBAYWNoLnN0YXRlLnRocmV3U2luZ2xlIGFuZCBAYWNoLnN0YXRlLnRocmV3UGFpciBhbmQgQGFjaC5zdGF0ZS50aHJld1RyaXBzIGFuZCBAYWNoLnN0YXRlLnRocmV3UnVuXHJcbiAgICAgICAgQGVhcm4gXCJzYW1wbGVyXCJcclxuXHJcbiAgICBAY3VycmVudFBsYXkgPSBpbmNvbWluZ1BsYXlcclxuXHJcbiAgICBAdGhyb3dJRCArPSAxXHJcbiAgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxyXG4gICAgY3VycmVudFBsYXllci5oYW5kID0gQHJlbW92ZUNhcmRzKGN1cnJlbnRQbGF5ZXIuaGFuZCwgcGFyYW1zLmNhcmRzKVxyXG5cclxuICAgIEBvdXRwdXQoXCIje2N1cnJlbnRQbGF5ZXIubmFtZX0gI3t2ZXJifSAje3BsYXlUb1N0cmluZyhpbmNvbWluZ1BsYXkpfVwiKVxyXG5cclxuICAgIGlmIGN1cnJlbnRQbGF5ZXIuaGFuZC5sZW5ndGggPT0gMFxyXG4gICAgICAjIEdhbWUgb3ZlciEgZG8gZ2FtZW92ZXIgdGhpbmdzLlxyXG5cclxuICAgICAgY3VycmVudFBsYXllci5wbGFjZSA9IEBuZXh0UGxhY2UoKVxyXG5cclxuICAgICAgaWYgQG1vbmV5XHJcbiAgICAgICAgcGxhY2VTdHJpbmcgPSBcIjR0aFwiXHJcbiAgICAgICAgaWYgY3VycmVudFBsYXllci5wbGFjZSA9PSAxXHJcbiAgICAgICAgICBwbGFjZVN0cmluZyA9IFwiMXN0XCJcclxuICAgICAgICBlbHNlIGlmIGN1cnJlbnRQbGF5ZXIucGxhY2UgPT0gMlxyXG4gICAgICAgICAgcGxhY2VTdHJpbmcgPSBcIjJuZFwiXHJcbiAgICAgICAgZWxzZSBpZiBjdXJyZW50UGxheWVyLnBsYWNlID09IDNcclxuICAgICAgICAgIHBsYWNlU3RyaW5nID0gXCIzcmRcIlxyXG4gICAgICAgIEBvdXRwdXQoXCIje2N1cnJlbnRQbGF5ZXIubmFtZX0gdGFrZXMgI3twbGFjZVN0cmluZ30gcGxhY2VcIilcclxuXHJcbiAgICAgICAgaWYgY3VycmVudFBsYXllci5wbGFjZSA9PSAzXHJcbiAgICAgICAgICBAcGF5b3V0KClcclxuICAgICAgZWxzZVxyXG4gICAgICAgIEBvdXRwdXQoXCIje2N1cnJlbnRQbGF5ZXIubmFtZX0gd2lucyFcIilcclxuXHJcbiAgICAgIGlmIGN1cnJlbnRQbGF5ZXIucGxhY2UgPT0gMVxyXG4gICAgICAgIGlmIEB0dXJuID09IDBcclxuICAgICAgICAgIEBzdHJlYWsgKz0gMVxyXG4gICAgICAgICAgQGxhc3RTdHJlYWsgPSBAc3RyZWFrXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgQGxhc3RTdHJlYWsgPSBAc3RyZWFrXHJcbiAgICAgICAgICBAc3RyZWFrID0gMFxyXG5cclxuICAgICAgQGFjaC5zdGF0ZS5iZXN0U3RyZWFrID89IDBcclxuICAgICAgaWYgQGFjaC5zdGF0ZS5iZXN0U3RyZWFrIDwgQGxhc3RTdHJlYWtcclxuICAgICAgICBAYWNoLnN0YXRlLmJlc3RTdHJlYWsgPSBAbGFzdFN0cmVha1xyXG5cclxuICAgICAgIyBBY2hpZXZlbWVudHNcclxuICAgICAgaWYgQGFjaC5zdGF0ZS5iZXN0U3RyZWFrID49IDVcclxuICAgICAgICBAZWFybiBcInRyeWhhcmRcIlxyXG4gICAgICBAYWNoLnN0YXRlLnRvdGFsR2FtZXMgKz0gMVxyXG4gICAgICBpZiBAYWNoLnN0YXRlLnRvdGFsR2FtZXMgPj0gNTBcclxuICAgICAgICBAZWFybiBcInZldGVyYW5cIlxyXG4gICAgICBpZiBjdXJyZW50UGxheWVyLnBsYWNlID09IDFcclxuICAgICAgICBpZiBAdHVybiA9PSAwXHJcbiAgICAgICAgICAjIHBsYXllciB3b25cclxuICAgICAgICAgIGlmIChAcGxheWVyc1sxXS5oYW5kLmxlbmd0aCA+PSAxMCkgYW5kIChAcGxheWVyc1syXS5oYW5kLmxlbmd0aCA+PSAxMCkgYW5kIChAcGxheWVyc1szXS5oYW5kLmxlbmd0aCA+PSAxMClcclxuICAgICAgICAgICAgQGVhcm4gXCJyZWt0XCJcclxuICAgICAgICAgIGlmIEBhY2guc3RhdGUuZmFzaGlvbmFibHlMYXRlXHJcbiAgICAgICAgICAgIEBlYXJuIFwibGF0ZVwiXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgIyBwbGF5ZXIgbG9zdFxyXG4gICAgICAgICAgaWYgQGFjaC5zdGF0ZS50aHJld1J1bjdcclxuICAgICAgICAgICAgQGVhcm4gXCJ0b255XCJcclxuXHJcbiAgICBhY2hpZXZlbWVudENvdW50ID0gMFxyXG4gICAgZm9yIGFjaGlldmVtZW50IGluIGFjaGlldmVtZW50c0xpc3RcclxuICAgICAgaWYgQGFjaC5lYXJuZWRbYWNoaWV2ZW1lbnQuaWRdXHJcbiAgICAgICAgYWNoaWV2ZW1lbnRDb3VudCArPSAxXHJcbiAgICBpZiBhY2hpZXZlbWVudENvdW50ID49IDEzXHJcbiAgICAgIEBlYXJuIFwidGhpcnRlZW5cIlxyXG5cclxuICAgIEBwaWxlID0gcGFyYW1zLmNhcmRzLnNsaWNlKDApXHJcbiAgICBAcGlsZVdobyA9IEB0dXJuXHJcblxyXG4gICAgQHR1cm4gPSBAcGxheWVyQWZ0ZXIoQHR1cm4pXHJcbiAgICByZXR1cm4gT0tcclxuXHJcbiAgdW5wYXNzQWxsOiAtPlxyXG4gICAgZm9yIHBsYXllciBpbiBAcGxheWVyc1xyXG4gICAgICBwbGF5ZXIucGFzcyA9IGZhbHNlXHJcbiAgICByZXR1cm5cclxuXHJcbiAgcGFzczogKHBhcmFtcykgLT5cclxuICAgIHJldCA9IEBjYW5QYXNzKHBhcmFtcylcclxuICAgIGlmIHJldCAhPSBPS1xyXG4gICAgICByZXR1cm4gcmV0XHJcblxyXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcclxuICAgIGlmIG5vdCBjdXJyZW50UGxheWVyLmFpIGFuZCBAY3VycmVudFBsYXkgYW5kIG5vdCBAaGFzUGxheShAY3VycmVudFBsYXksIGN1cnJlbnRQbGF5ZXIuaGFuZClcclxuICAgICAgQG91dHB1dChcIiN7Y3VycmVudFBsYXllci5uYW1lfSBhdXRvLXBhc3NlcyAobm8gcGxheXMpXCIpXHJcbiAgICBlbHNlIGlmIGN1cnJlbnRQbGF5ZXIucGFzc1xyXG4gICAgICBAb3V0cHV0KFwiI3tjdXJyZW50UGxheWVyLm5hbWV9IGF1dG8tcGFzc2VzXCIpXHJcbiAgICBlbHNlXHJcbiAgICAgIEBvdXRwdXQoXCIje2N1cnJlbnRQbGF5ZXIubmFtZX0gcGFzc2VzXCIpXHJcbiAgICBjdXJyZW50UGxheWVyLnBhc3MgPSB0cnVlXHJcbiAgICBAdHVybiA9IEBwbGF5ZXJBZnRlcihAdHVybilcclxuICAgIEBnYW1lLnBpbGUucG9rZSgpXHJcbiAgICByZXR1cm4gT0tcclxuXHJcbiAgYWlQbGF5OiAoY3VycmVudFBsYXllciwgY2FyZHMpIC0+XHJcbiAgICByZXR1cm4gQHBsYXkoeydpZCc6Y3VycmVudFBsYXllci5pZCwgJ2NhcmRzJzpjYXJkc30pXHJcblxyXG4gIGFpUGFzczogKGN1cnJlbnRQbGF5ZXIpIC0+XHJcbiAgICByZXR1cm4gQHBhc3MoeydpZCc6Y3VycmVudFBsYXllci5pZH0pXHJcblxyXG4gIGVhcm46IChpZCkgLT5cclxuICAgIGlmIEBhY2guZWFybmVkW2lkXVxyXG4gICAgICByZXR1cm5cclxuICAgIGFjaGlldmVtZW50ID0gYWNoaWV2ZW1lbnRzTWFwW2lkXVxyXG4gICAgaWYgbm90IGFjaGlldmVtZW50P1xyXG4gICAgICByZXR1cm5cclxuXHJcbiAgICBAYWNoLmVhcm5lZFtpZF0gPSB0cnVlXHJcbiAgICBAb3V0cHV0KFwiRWFybmVkOiAje2FjaGlldmVtZW50LnRpdGxlfVwiKVxyXG4gICAgQGZhbmZhcmVzLnB1c2ggYWNoaWV2ZW1lbnQudGl0bGVcclxuXHJcblxyXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgIyBBSVxyXG5cclxuICAjIEdlbmVyaWMgbG9nZ2luZyBmdW5jdGlvbjsgcHJlcGVuZHMgY3VycmVudCBBSSBwbGF5ZXIncyBndXRzIGJlZm9yZSBwcmludGluZyB0ZXh0XHJcbiAgYWlMb2c6ICh0ZXh0KSAtPlxyXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcclxuICAgIGlmIG5vdCBjdXJyZW50UGxheWVyLmFpXHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG5cclxuICAgIGNoYXJhY3RlciA9IGFpQ2hhcmFjdGVyc1tjdXJyZW50UGxheWVyLmNoYXJJRF1cclxuICAgIEBnYW1lLmxvZygnQUlbJytjdXJyZW50UGxheWVyLm5hbWUrJyAnK2NoYXJhY3Rlci5icmFpbisnXTogaGFuZDonK2NhcmRzVG9TdHJpbmcoY3VycmVudFBsYXllci5oYW5kKSsnIHBpbGU6JytjYXJkc1RvU3RyaW5nKEBwaWxlKSsnICcrdGV4dClcclxuXHJcbiAgIyBEZXRlY3RzIGlmIHRoZSBjdXJyZW50IHBsYXllciBpcyBBSSBkdXJpbmcgYSBCSUQgb3IgVFJJQ0sgcGhhc2UgYW5kIGFjdHMgYWNjb3JkaW5nIHRvIHRoZWlyICdicmFpbidcclxuICBhaVRpY2s6IC0+XHJcbiAgICBpZiBAZ2FtZU92ZXIoKVxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgICBpZiBAZW50aXJlVGFibGVQYXNzZWQoKVxyXG4gICAgICBAdHVybiA9IEBwbGF5ZXJBZnRlcihAcGlsZVdobylcclxuICAgICAgQHVucGFzc0FsbCgpXHJcbiAgICAgIEBjdXJyZW50UGxheSA9IG51bGxcclxuICAgICAgQG91dHB1dCgnV2hvbGUgdGFibGUgcGFzc2VzLCBjb250cm9sIHRvICcgKyBAcGxheWVyc1tAdHVybl0ubmFtZSlcclxuXHJcbiAgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxyXG4gICAgaWYgbm90IGN1cnJlbnRQbGF5ZXIuYWlcclxuICAgICAgaWYgQGdhbWUub3B0aW9ucy5hdXRvcGFzc0luZGV4ICE9IDAgIyBOb3QgZGlzYWJsZWRcclxuICAgICAgICBpZiBub3QgQGNhblRocm93QW55dGhpbmcoKVxyXG4gICAgICAgICAgaWYgQGN1cnJlbnRQbGF5IGFuZCAoQGN1cnJlbnRQbGF5LnR5cGUgPT0gJ2tpbmQxJykgYW5kIChAY3VycmVudFBsYXkuaGlnaCA+PSA0OCkgYW5kIEBoYXNCcmVha2VyKGN1cnJlbnRQbGF5ZXIuaGFuZClcclxuICAgICAgICAgICAgIyBkbyBub3RoaW5nLCBwbGF5ZXIgY2FuIGRyb3AgYSBicmVha2VyXHJcbiAgICAgICAgICBlbHNlIGlmIEBjdXJyZW50UGxheSBhbmQgbm90IEBoYXNQbGF5KEBjdXJyZW50UGxheSwgY3VycmVudFBsYXllci5oYW5kKVxyXG4gICAgICAgICAgICBAYWlMb2coXCJhdXRvcGFzc2luZyBmb3IgcGxheWVyLCBubyBwbGF5c1wiKVxyXG4gICAgICAgICAgICBAYWlQYXNzKGN1cnJlbnRQbGF5ZXIpXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgICBlbHNlIGlmIGN1cnJlbnRQbGF5ZXIucGFzc1xyXG4gICAgICAgICAgICBAYWlMb2coXCJhdXRvcGFzc2luZyBmb3IgcGxheWVyXCIpXHJcbiAgICAgICAgICAgIEBhaVBhc3MoY3VycmVudFBsYXllcilcclxuICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gICAgY2hhcmFjdGVyID0gYWlDaGFyYWN0ZXJzW2N1cnJlbnRQbGF5ZXIuY2hhcklEXVxyXG4gICAgcmV0ID0gQGJyYWluc1tjaGFyYWN0ZXIuYnJhaW5dLnBsYXkuYXBwbHkodGhpcywgW2N1cnJlbnRQbGF5ZXIsIEBjdXJyZW50UGxheSwgQGV2ZXJ5b25lUGFzc2VkKCldKVxyXG4gICAgaWYgcmV0ID09IE9LXHJcbiAgICAgIHJldHVybiB0cnVlXHJcbiAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgYWxDYWxjS2luZHM6IChoYW5kLCBwbGF5cywgbWF0Y2gycyA9IGZhbHNlKSAtPlxyXG4gICAgY2FyZHMgPSBoYW5kLm1hcCAocmF3KSAtPiBuZXcgQ2FyZChyYXcpXHJcbiAgICBjYXJkcyA9IGNhcmRzLnNvcnQgKGEsIGIpIC0+IHJldHVybiBhLnJhdyAtIGIucmF3XHJcbiAgICB2YWx1ZUFycmF5cyA9IFtdXHJcbiAgICBmb3IgaSBpbiBbMC4uLjEzXVxyXG4gICAgICB2YWx1ZUFycmF5cy5wdXNoIFtdXHJcbiAgICBmb3IgY2FyZCBpbiBjYXJkc1xyXG4gICAgICB2YWx1ZUFycmF5c1tjYXJkLnZhbHVlXS5wdXNoKGNhcmQpXHJcblxyXG4gICAgaGFuZCA9IFtdXHJcbiAgICBmb3IgdmFsdWVBcnJheSwgdmFsdWUgaW4gdmFsdWVBcnJheXNcclxuICAgICAgaWYgKHZhbHVlQXJyYXkubGVuZ3RoID4gMSkgYW5kIChtYXRjaDJzIG9yICh2YWx1ZSA8IDEyKSlcclxuICAgICAgICBrZXkgPSBcImtpbmQje3ZhbHVlQXJyYXkubGVuZ3RofVwiXHJcbiAgICAgICAgcGxheXNba2V5XSA/PSBbXVxyXG4gICAgICAgIHBsYXlzW2tleV0ucHVzaCB2YWx1ZUFycmF5Lm1hcCAodikgLT4gdi5yYXdcclxuICAgICAgZWxzZVxyXG4gICAgICAgIGZvciB2IGluIHZhbHVlQXJyYXlcclxuICAgICAgICAgIGhhbmQucHVzaCB2LnJhd1xyXG5cclxuICAgIHJldHVybiBoYW5kXHJcblxyXG4gIGFpRmluZFJ1bnM6IChoYW5kLCBlYWNoU2l6ZSwgc2l6ZSwgcHJlZmVyU3Ryb25nUnVucyA9IGZhbHNlKSAtPlxyXG4gICAgcnVucyA9IFtdXHJcblxyXG4gICAgY2FyZHMgPSBoYW5kLm1hcCAocmF3KSAtPiBuZXcgQ2FyZChyYXcpXHJcbiAgICBjYXJkcyA9IGNhcmRzLnNvcnQgKGEsIGIpIC0+IHJldHVybiBhLnJhdyAtIGIucmF3XHJcbiAgICB2YWx1ZUFycmF5cyA9IFtdXHJcbiAgICBmb3IgaSBpbiBbMC4uLjEzXVxyXG4gICAgICB2YWx1ZUFycmF5cy5wdXNoIFtdXHJcbiAgICBmb3IgY2FyZCBpbiBjYXJkc1xyXG4gICAgICB2YWx1ZUFycmF5c1tjYXJkLnZhbHVlXS5wdXNoKGNhcmQpXHJcblxyXG4gICAgaWYgcHJlZmVyU3Ryb25nUnVuc1xyXG4gICAgICBmaXJzdFN0YXJ0aW5nVmFsdWUgPSAxMiAtIHNpemVcclxuICAgICAgbGFzdFN0YXJ0aW5nVmFsdWUgPSAwXHJcbiAgICAgIGJ5QW1vdW50ID0gLTFcclxuICAgIGVsc2VcclxuICAgICAgZmlyc3RTdGFydGluZ1ZhbHVlID0gMFxyXG4gICAgICBsYXN0U3RhcnRpbmdWYWx1ZSA9IDEyIC0gc2l6ZVxyXG4gICAgICBieUFtb3VudCA9IDFcclxuICAgIGZvciBzdGFydGluZ1ZhbHVlIGluIFtmaXJzdFN0YXJ0aW5nVmFsdWUuLmxhc3RTdGFydGluZ1ZhbHVlXSBieSBieUFtb3VudFxyXG4gICAgICBydW5Gb3VuZCA9IHRydWVcclxuICAgICAgZm9yIG9mZnNldCBpbiBbMC4uLnNpemVdXHJcbiAgICAgICAgaWYgdmFsdWVBcnJheXNbc3RhcnRpbmdWYWx1ZStvZmZzZXRdLmxlbmd0aCA8IGVhY2hTaXplXHJcbiAgICAgICAgICBydW5Gb3VuZCA9IGZhbHNlXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICBpZiBydW5Gb3VuZFxyXG4gICAgICAgIHJ1biA9IFtdXHJcbiAgICAgICAgZm9yIG9mZnNldCBpbiBbMC4uLnNpemVdXHJcbiAgICAgICAgICBmb3IgZWFjaCBpbiBbMC4uLmVhY2hTaXplXVxyXG4gICAgICAgICAgICBydW4ucHVzaCh2YWx1ZUFycmF5c1tzdGFydGluZ1ZhbHVlK29mZnNldF0ucG9wKCkucmF3KVxyXG4gICAgICAgIHJ1bnMucHVzaCBydW5cclxuXHJcbiAgICBsZWZ0b3ZlcnMgPSBbXVxyXG4gICAgZm9yIHZhbHVlQXJyYXkgaW4gdmFsdWVBcnJheXNcclxuICAgICAgZm9yIGNhcmQgaW4gdmFsdWVBcnJheVxyXG4gICAgICAgIGxlZnRvdmVycy5wdXNoIGNhcmQucmF3XHJcblxyXG4gICAgcmV0dXJuIFtydW5zLCBsZWZ0b3ZlcnNdXHJcblxyXG4gIGFpQ2FsY1J1bnM6IChoYW5kLCBwbGF5cywgc21hbGxSdW5zLCBzaW5nbGVTaXplID0gbnVsbCkgLT5cclxuICAgIGlmIHNpbmdsZVNpemUgIT0gbnVsbFxyXG4gICAgICBwcmVmZXJTdHJvbmdSdW5zID0gdHJ1ZVxyXG4gICAgICBzdGFydFNpemUgPSBzaW5nbGVTaXplXHJcbiAgICAgIGVuZFNpemUgPSBzaW5nbGVTaXplXHJcbiAgICAgIGJ5QW1vdW50ID0gMVxyXG4gICAgZWxzZVxyXG4gICAgICBwcmVmZXJTdHJvbmdSdW5zID0gZmFsc2VcclxuICAgICAgaWYgc21hbGxSdW5zXHJcbiAgICAgICAgc3RhcnRTaXplID0gM1xyXG4gICAgICAgIGVuZFNpemUgPSAxMlxyXG4gICAgICAgIGJ5QW1vdW50ID0gMVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgc3RhcnRTaXplID0gMTJcclxuICAgICAgICBlbmRTaXplID0gM1xyXG4gICAgICAgIGJ5QW1vdW50ID0gLTFcclxuICAgIGZvciBydW5TaXplIGluIFtzdGFydFNpemUuLmVuZFNpemVdIGJ5IGJ5QW1vdW50XHJcbiAgICAgIFtydW5zLCBsZWZ0b3ZlcnNdID0gQGFpRmluZFJ1bnMoaGFuZCwgMSwgcnVuU2l6ZSwgcHJlZmVyU3Ryb25nUnVucylcclxuICAgICAgaWYgcnVucy5sZW5ndGggPiAwXHJcbiAgICAgICAga2V5ID0gXCJydW4je3J1blNpemV9XCJcclxuICAgICAgICBwbGF5c1trZXldID0gcnVuc1xyXG4gICAgICBoYW5kID0gbGVmdG92ZXJzXHJcblxyXG4gICAgcmV0dXJuIGhhbmRcclxuXHJcbiAgYWlDYWxjUm9wczogKGhhbmQsIHBsYXlzLCBzaW5nbGVTaXplID0gbnVsbCkgLT5cclxuICAgIGlmIHNpbmdsZVNpemUgIT0gbnVsbFxyXG4gICAgICBwcmVmZXJTdHJvbmdSdW5zID0gdHJ1ZVxyXG4gICAgICBzdGFydFNpemUgPSBzaW5nbGVTaXplXHJcbiAgICAgIGVuZFNpemUgPSBzaW5nbGVTaXplXHJcbiAgICBlbHNlXHJcbiAgICAgIHByZWZlclN0cm9uZ1J1bnMgPSBmYWxzZVxyXG4gICAgICBzdGFydFNpemUgPSAzXHJcbiAgICAgIGVuZFNpemUgPSA2XHJcbiAgICBmb3IgcnVuU2l6ZSBpbiBbc3RhcnRTaXplLi5lbmRTaXplXVxyXG4gICAgICBbcm9wcywgbGVmdG92ZXJzXSA9IEBhaUZpbmRSdW5zKGhhbmQsIDIsIHJ1blNpemUsIHByZWZlclN0cm9uZ1J1bnMpXHJcbiAgICAgIGlmIHJvcHMubGVuZ3RoID4gMFxyXG4gICAgICAgIGtleSA9IFwicm9wI3tydW5TaXplfVwiXHJcbiAgICAgICAgcGxheXNba2V5XSA9IHJvcHNcclxuICAgICAgaGFuZCA9IGxlZnRvdmVyc1xyXG5cclxuICAgIHJldHVybiBoYW5kXHJcblxyXG4gIGFpQ2FsY1BsYXlzOiAoaGFuZCwgc3RyYXRlZ3kgPSB7fSkgLT5cclxuICAgIHBsYXlzID0ge31cclxuXHJcbiAgICAjIFdlIGFsd2F5cyB3YW50IHRvIHVzZSByb3BzIGlmIHdlIGhhdmUgb25lXHJcbiAgICBpZiBzdHJhdGVneS5zZWVzUm9wc1xyXG4gICAgICBoYW5kID0gQGFpQ2FsY1JvcHMoaGFuZCwgcGxheXMpXHJcblxyXG4gICAgaWYgc3RyYXRlZ3kucHJlZmVyc1J1bnNcclxuICAgICAgaGFuZCA9IEBhaUNhbGNSdW5zKGhhbmQsIHBsYXlzLCBzdHJhdGVneS5zbWFsbFJ1bnMpXHJcbiAgICAgIGhhbmQgPSBAYWxDYWxjS2luZHMoaGFuZCwgcGxheXMsIHN0cmF0ZWd5Lm1hdGNoMnMpXHJcbiAgICBlbHNlXHJcbiAgICAgIGhhbmQgPSBAYWxDYWxjS2luZHMoaGFuZCwgcGxheXMsIHN0cmF0ZWd5Lm1hdGNoMnMpXHJcbiAgICAgIGhhbmQgPSBAYWlDYWxjUnVucyhoYW5kLCBwbGF5cywgc3RyYXRlZ3kuc21hbGxSdW5zKVxyXG5cclxuICAgIGtpbmQxID0gaGFuZC5tYXAgKHYpIC0+IFt2XVxyXG4gICAgaWYga2luZDEubGVuZ3RoID4gMFxyXG4gICAgICBwbGF5cy5raW5kMSA9IGtpbmQxXHJcbiAgICByZXR1cm4gcGxheXNcclxuXHJcbiAgbnVtYmVyT2ZTaW5nbGVzOiAocGxheXMpIC0+XHJcbiAgICBpZiBub3QgcGxheXMua2luZDE/XHJcbiAgICAgIHJldHVybiAwXHJcbiAgICBub25Ud29TaW5nbGVzID0gMFxyXG4gICAgZm9yIHJhdyBpbiBwbGF5cy5raW5kMVxyXG4gICAgICBpZiByYXcgPCA0OFxyXG4gICAgICAgIG5vblR3b1NpbmdsZXMgKz0gMVxyXG4gICAgcmV0dXJuIG5vblR3b1NpbmdsZXNcclxuXHJcbiAgYnJlYWtlclBsYXlzOiAoaGFuZCkgLT5cclxuICAgIHJldHVybiBAYWlDYWxjUGxheXMoaGFuZCwgeyBzZWVzUm9wczogdHJ1ZSwgcHJlZmVyc1J1bnM6IGZhbHNlIH0pXHJcblxyXG4gIGlzQnJlYWtlclR5cGU6IChwbGF5VHlwZSkgLT5cclxuICAgIGlmIHBsYXlUeXBlLm1hdGNoKC9ecm9wLykgb3IgcGxheVR5cGUgPT0gJ2tpbmQ0J1xyXG4gICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gIGNhbkJlQnJva2VuOiAocGxheSkgLT5cclxuICAgIGlmIHBsYXkudHlwZSAhPSAna2luZDEnXHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgY2FyZCA9IG5ldyBDYXJkKHBsYXkuaGlnaClcclxuICAgIHJldHVybiAoY2FyZC52YWx1ZSA9PSAxMilcclxuXHJcbiAgaGFzQnJlYWtlcjogKGhhbmQpIC0+XHJcbiAgICBwbGF5cyA9IEBicmVha2VyUGxheXMoaGFuZClcclxuICAgIGZvciBwbGF5VHlwZSwgcGxheWxpc3Qgb2YgcGxheXNcclxuICAgICAgaWYgQGlzQnJlYWtlclR5cGUocGxheVR5cGUpXHJcbiAgICAgICAgaWYgcGxheWxpc3QubGVuZ3RoID4gMFxyXG4gICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgIHJldHVybiBmYWxzZVxyXG5cclxuICBpc1J1blR5cGU6IChwbGF5VHlwZSkgLT5cclxuICAgIGlmIHBsYXlUeXBlLm1hdGNoKC9ecnVuLylcclxuICAgICAgcmV0dXJuIHRydWVcclxuICAgIHJldHVybiBmYWxzZVxyXG5cclxuICBpc1N1aXRlZDogKGhhbmQpIC0+XHJcbiAgICBpZiBoYW5kLmxlbmd0aCA8IDFcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICBjYXJkcyA9IGhhbmQubWFwIChyYXcpIC0+IG5ldyBDYXJkKHJhdylcclxuICAgIHN1aXQgPSBjYXJkc1swXS5zdWl0XHJcbiAgICBmb3IgY2FyZCBpbiBjYXJkc1xyXG4gICAgICBpZiBjYXJkLnN1aXQgIT0gc3VpdFxyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgcmV0dXJuIHRydWVcclxuXHJcbiAgaXNCaWdSdW46IChwbGF5LCBhdExlYXN0KSAtPlxyXG4gICAgaWYgbWF0Y2hlcyA9IHBsYXkudHlwZS5tYXRjaCgvXnJ1bihcXGQrKS8pXHJcbiAgICAgIGxlbiA9IHBhcnNlSW50KG1hdGNoZXNbMV0pXHJcbiAgICAgIGlmIGxlbiA+PSBhdExlYXN0XHJcbiAgICAgICAgcmV0dXJuIHRydWVcclxuICAgIHJldHVybiBmYWxzZVxyXG5cclxuICBhaUNhbGNCZXN0UGxheXM6IChoYW5kKSAtPlxyXG4gICAgYmVzdFBsYXlzID0gbnVsbFxyXG4gICAgZm9yIGJpdHMgaW4gWzAuLi4xNl1cclxuICAgICAgc3RyYXRlZ3kgPVxyXG4gICAgICAgIHNtYWxsUnVuczogKGJpdHMgJiAxKSA9PSAxXHJcbiAgICAgICAgcHJlZmVyc1J1bnM6IChiaXRzICYgMikgPT0gMlxyXG4gICAgICAgIG1hdGNoMnM6IChiaXRzICYgNCkgPT0gNFxyXG4gICAgICAgIHNlZXNSb3BzOiAoYml0cyAmIDgpID09IDhcclxuICAgICAgcGxheXMgPSBAYWlDYWxjUGxheXMoaGFuZCwgc3RyYXRlZ3kpXHJcbiAgICAgIGlmIGJlc3RQbGF5cyA9PSBudWxsXHJcbiAgICAgICAgYmVzdFBsYXlzID0gcGxheXNcclxuICAgICAgZWxzZVxyXG4gICAgICAgIG5wID0gQG51bWJlck9mU2luZ2xlcyhwbGF5cylcclxuICAgICAgICBuYnAgPSBAbnVtYmVyT2ZTaW5nbGVzKGJlc3RQbGF5cylcclxuICAgICAgICBpZiBucCA8IG5icFxyXG4gICAgICAgICAgYmVzdFBsYXlzID0gcGxheXNcclxuICAgICAgICBlbHNlIGlmIG5wID09IG5icFxyXG4gICAgICAgICAgIyBmbGlwIGEgY29pbiFcclxuICAgICAgICAgIGlmIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpID09IDBcclxuICAgICAgICAgICAgYmVzdFBsYXlzID0gcGxheXNcclxuICAgIHJldHVybiBiZXN0UGxheXNcclxuXHJcbiAgcHJldHR5UGxheXM6IChwbGF5cywgZXh0cmFQcmV0dHkgPSBmYWxzZSkgLT5cclxuICAgIHByZXR0eSA9IHt9XHJcbiAgICBmb3IgdHlwZSwgYXJyIG9mIHBsYXlzXHJcbiAgICAgIHByZXR0eVt0eXBlXSA9IFtdXHJcbiAgICAgIGZvciBwbGF5IGluIGFyclxyXG4gICAgICAgIG5hbWVzID0gW11cclxuICAgICAgICBmb3IgcmF3IGluIHBsYXlcclxuICAgICAgICAgIGNhcmQgPSBuZXcgQ2FyZChyYXcpXHJcbiAgICAgICAgICBuYW1lcy5wdXNoKGNhcmQubmFtZSlcclxuICAgICAgICBwcmV0dHlbdHlwZV0ucHVzaChuYW1lcylcclxuICAgIGlmIGV4dHJhUHJldHR5XHJcbiAgICAgIHMgPSBcIlwiXHJcbiAgICAgIGZvciB0eXBlTmFtZSwgdGhyb3dzIG9mIHByZXR0eVxyXG4gICAgICAgIHMgKz0gXCIgICAgICAqICN7cGxheVR5cGVUb1N0cmluZyh0eXBlTmFtZSl9OlxcblwiXHJcbiAgICAgICAgaWYgdHlwZU5hbWUgPT0gJ2tpbmQxJ1xyXG4gICAgICAgICAgcyArPSBcIiAgICAgICAgKiAje3Rocm93cy5tYXAoKHYpIC0+IHZbMF0pLmpvaW4oJywnKX1cXG5cIlxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIGZvciB0IGluIHRocm93c1xyXG4gICAgICAgICAgICBzICs9IFwiICAgICAgICAqICN7dC5qb2luKCcsJyl9XFxuXCJcclxuICAgICAgcmV0dXJuIHNcclxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShwcmV0dHkpXHJcblxyXG4gIGhpZ2hlc3RDYXJkOiAocGxheSkgLT5cclxuICAgIGhpZ2hlc3QgPSAwXHJcbiAgICBmb3IgcCBpbiBwbGF5XHJcbiAgICAgIGlmIGhpZ2hlc3QgPCBwXHJcbiAgICAgICAgaGlnaGVzdCA9IHBcclxuICAgIHJldHVybiBoaWdoZXN0XHJcblxyXG4gIGZpbmRQbGF5V2l0aDNTOiAocGxheXMpIC0+XHJcbiAgICBmb3IgcGxheVR5cGUsIHBsYXlsaXN0IG9mIHBsYXlzXHJcbiAgICAgIGZvciBwbGF5IGluIHBsYXlsaXN0XHJcbiAgICAgICAgaWYgQGhhbmRIYXMzUyhwbGF5KVxyXG4gICAgICAgICAgcmV0dXJuIHBsYXlcclxuXHJcbiAgICBjb25zb2xlLmxvZyBcImZpbmRQbGF5V2l0aDNTOiBzb21ldGhpbmcgaW1wb3NzaWJsZSBpcyBoYXBwZW5pbmdcIlxyXG4gICAgcmV0dXJuIFtdXHJcblxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIEFJIEJyYWluc1xyXG5cclxuICAjIEJyYWlucyBtdXN0IGhhdmU6XHJcbiAgIyAqIGlkOiBpbnRlcm5hbCBpZGVudGlmaWVyIGZvciB0aGUgYnJhaW5cclxuICAjICogbmFtZTogcHJldHR5IG5hbWVcclxuICAjICogcGxheShjdXJyZW50UGxheWVyKSBhdHRlbXB0cyB0byBwbGF5IGEgY2FyZCBieSBjYWxsaW5nIGFpUGxheSgpLiBTaG91bGQgcmV0dXJuIHRydWUgaWYgaXQgc3VjY2Vzc2Z1bGx5IHBsYXllZCBhIGNhcmQgKGFpUGxheSgpIHJldHVybmVkIHRydWUpXHJcbiAgYnJhaW5zOlxyXG5cclxuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAjIE5vcm1hbDogSW50ZW5kZWQgdG8gYmUgdXNlZCBieSBtb3N0IGNoYXJhY3RlcnMuXHJcbiAgICAjICAgICAgICAgTm90IHRvbyBkdW1iLCBub3QgdG9vIHNtYXJ0LlxyXG4gICAgbm9ybWFsOlxyXG4gICAgICBpZDogICBcIm5vcm1hbFwiXHJcbiAgICAgIG5hbWU6IFwiTm9ybWFsXCJcclxuXHJcbiAgICAgICMgbm9ybWFsXHJcbiAgICAgIHBsYXk6IChjdXJyZW50UGxheWVyLCBjdXJyZW50UGxheSwgZXZlcnlvbmVQYXNzZWQpIC0+XHJcbiAgICAgICAgaWYgY3VycmVudFBsYXllci5wYXNzXHJcbiAgICAgICAgICBpZiBAY2FuQmVCcm9rZW4oY3VycmVudFBsYXkpIGFuZCBAaGFzQnJlYWtlcihjdXJyZW50UGxheWVyLmhhbmQpXHJcbiAgICAgICAgICAgIGJyZWFrZXJQbGF5cyA9IEBicmVha2VyUGxheXMoY3VycmVudFBsYXllci5oYW5kKVxyXG4gICAgICAgICAgICBmb3IgcGxheVR5cGUsIHBsYXlsaXN0IG9mIGJyZWFrZXJQbGF5c1xyXG4gICAgICAgICAgICAgIGlmIChwbGF5VHlwZS5tYXRjaCgvXnJvcC8pIG9yIChwbGF5VHlwZSA9PSAna2luZDQnKSkgYW5kIChwbGF5bGlzdC5sZW5ndGggPiAwKVxyXG4gICAgICAgICAgICAgICAgQGFpTG9nKFwiYnJlYWtpbmcgMlwiKVxyXG4gICAgICAgICAgICAgICAgaWYgQGFpUGxheShjdXJyZW50UGxheWVyLCBwbGF5bGlzdFswXSkgPT0gT0tcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuIE9LXHJcblxyXG4gICAgICAgICAgQGFpTG9nKFwiYWxyZWFkeSBwYXNzZWQsIGdvaW5nIHRvIGtlZXAgcGFzc2luZ1wiKVxyXG4gICAgICAgICAgcmV0dXJuIEBhaVBhc3MoY3VycmVudFBsYXllcilcclxuXHJcbiAgICAgICAgcGxheXMgPSBAYWlDYWxjQmVzdFBsYXlzKGN1cnJlbnRQbGF5ZXIuaGFuZClcclxuICAgICAgICBAYWlMb2coXCJiZXN0IHBsYXlzOiAje0BwcmV0dHlQbGF5cyhwbGF5cyl9XCIpXHJcblxyXG4gICAgICAgIGlmIEBwaWxlLmxlbmd0aCA9PSAwXHJcbiAgICAgICAgICBwbGF5ID0gQGZpbmRQbGF5V2l0aDNTKHBsYXlzKVxyXG4gICAgICAgICAgQGFpTG9nKFwiVGhyb3dpbmcgbXkgcGxheSB3aXRoIHRoZSAzUyBpbiBpdFwiKVxyXG4gICAgICAgICAgaWYgQGFpUGxheShjdXJyZW50UGxheWVyLCBwbGF5KSA9PSBPS1xyXG4gICAgICAgICAgICByZXR1cm4gT0tcclxuXHJcbiAgICAgICAgaWYgY3VycmVudFBsYXkgYW5kIG5vdCBldmVyeW9uZVBhc3NlZFxyXG4gICAgICAgICAgaWYgcGxheXNbY3VycmVudFBsYXkudHlwZV0/IGFuZCAocGxheXNbY3VycmVudFBsYXkudHlwZV0ubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgZm9yIHBsYXkgaW4gcGxheXNbY3VycmVudFBsYXkudHlwZV1cclxuICAgICAgICAgICAgICBpZiBAaGlnaGVzdENhcmQocGxheSkgPiBjdXJyZW50UGxheS5oaWdoXHJcbiAgICAgICAgICAgICAgICBpZiBAYWlQbGF5KGN1cnJlbnRQbGF5ZXIsIHBsYXkpID09IE9LXHJcbiAgICAgICAgICAgICAgICAgIHJldHVybiBPS1xyXG4gICAgICAgICAgICBAYWlMb2coXCJJIGd1ZXNzIEkgY2FuJ3QgYWN0dWFsbHkgYmVhdCB0aGlzLCBwYXNzaW5nXCIpXHJcbiAgICAgICAgICAgIHJldHVybiBAYWlQYXNzKGN1cnJlbnRQbGF5ZXIpXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIEBhaUxvZyhcIkkgZG9uJ3QgaGF2ZSB0aGF0IHBsYXksIHBhc3NpbmdcIilcclxuICAgICAgICAgICAgcmV0dXJuIEBhaVBhc3MoY3VycmVudFBsYXllcilcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAjIG5vIGN1cnJlbnQgcGxheSwgdGhyb3cgdGhlIGZpcnN0IGNhcmRcclxuICAgICAgICAgIEBhaUxvZyhcIkkgY2FuIGRvIGFueXRoaW5nLCB0aHJvd2luZyBhIHJhbmRvbSBwbGF5XCIpXHJcbiAgICAgICAgICBwbGF5VHlwZXMgPSBPYmplY3Qua2V5cyhwbGF5cylcclxuICAgICAgICAgIHBsYXlUeXBlSW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBwbGF5VHlwZXMubGVuZ3RoKVxyXG4gICAgICAgICAgaWYgQGFpUGxheShjdXJyZW50UGxheWVyLCBwbGF5c1twbGF5VHlwZXNbcGxheVR5cGVJbmRleF1dWzBdKSA9PSBPS1xyXG4gICAgICAgICAgICByZXR1cm4gT0tcclxuXHJcbiAgICAgICAgIyBmaW5kIHRoZSBmaXJzdCBjYXJkIHRoYXQgYmVhdHMgdGhlIGN1cnJlbnRQbGF5J3MgaGlnaFxyXG4gICAgICAgIGZvciByYXdDYXJkIGluIGN1cnJlbnRQbGF5ZXIuaGFuZFxyXG4gICAgICAgICAgaWYgcmF3Q2FyZCA+IGN1cnJlbnRQbGF5LmhpZ2hcclxuICAgICAgICAgICAgQGFpTG9nKFwiZm91bmQgc21hbGxlc3Qgc2luZ2xlICgje3Jhd0NhcmR9KSwgcGxheWluZ1wiKVxyXG4gICAgICAgICAgICBpZiBAYWlQbGF5KGN1cnJlbnRQbGF5ZXIsIFtyYXdDYXJkXSkgPT0gT0tcclxuICAgICAgICAgICAgICByZXR1cm4gT0tcclxuICAgICAgICAgICAgYnJlYWtcclxuXHJcbiAgICAgICAgQGFpTG9nKFwibm90aGluZyBlbHNlIHRvIGRvLCBwYXNzaW5nXCIpXHJcbiAgICAgICAgcmV0dXJuIEBhaVBhc3MoY3VycmVudFBsYXllcilcclxuXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgRGVidWcgY29kZVxyXG5cclxuZGVidWcgPSAtPlxyXG4gIHRoaXIgPSBuZXcgVGhpcnRlZW4oKVxyXG4gIGZ1bGx5UGxheWVkID0gMFxyXG4gIHRvdGFsQXR0ZW1wdHMgPSAxMDBcclxuXHJcbiAgZm9yIGF0dGVtcHQgaW4gWzAuLi50b3RhbEF0dGVtcHRzXVxyXG4gICAgZGVjayA9IG5ldyBTaHVmZmxlZERlY2soKVxyXG4gICAgaGFuZCA9IFtdXHJcbiAgICBmb3IgaiBpbiBbMC4uLjEzXVxyXG4gICAgICByYXcgPSBkZWNrLmNhcmRzLnNoaWZ0KClcclxuICAgICAgaGFuZC5wdXNoKHJhdylcclxuICAgICMgaGFuZCA9IFs1MSw1MCw0OSw0OCw0Nyw0Niw0NSw0NCw0Myw0Miw0MSw0MCwzOV1cclxuICAgICMgaGFuZCA9IFswLDEsMiwzLDQsNSw2LDcsOCw5LDEwLDExLDEyXVxyXG4gICAgaGFuZC5zb3J0IChhLGIpIC0+IHJldHVybiBhIC0gYlxyXG5cclxuICAgIGNvbnNvbGUubG9nKFwiLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXCIpXHJcbiAgICBjb25zb2xlLmxvZyhcIkhhbmQgI3thdHRlbXB0KzF9OiAje2NhcmRzVG9TdHJpbmcoaGFuZCl9XCIpXHJcbiAgICBjb25zb2xlLmxvZyhcIlwiKVxyXG5cclxuICAgIGZvdW5kRnVsbHlQbGF5ZWQgPSBmYWxzZVxyXG4gICAgZm9yIGJpdHMgaW4gWzAuLi4xNl1cclxuICAgICAgc3RyYXRlZ3kgPVxyXG4gICAgICAgIHNtYWxsUnVuczogKGJpdHMgJiAxKSA9PSAxXHJcbiAgICAgICAgcHJlZmVyc1J1bnM6IChiaXRzICYgMikgPT0gMlxyXG4gICAgICAgIG1hdGNoMnM6IChiaXRzICYgNCkgPT0gNFxyXG4gICAgICAgIHNlZXNSb3BzOiAoYml0cyAmIDgpID09IDhcclxuICAgICAgcGxheXMgPSB0aGlyLmFpQ2FsY1BsYXlzKGhhbmQsIHN0cmF0ZWd5KVxyXG5cclxuICAgICAgY29uc29sZS5sb2coXCIgICAqIFN0cmF0ZWd5OiAje0pTT04uc3RyaW5naWZ5KHN0cmF0ZWd5KX1cIilcclxuICAgICAgY29uc29sZS5sb2codGhpci5wcmV0dHlQbGF5cyhwbGF5cywgdHJ1ZSkpXHJcblxyXG4gICAgICBpZiBub3QgcGxheXMua2luZDFcclxuICAgICAgICBmb3VuZEZ1bGx5UGxheWVkID0gdHJ1ZVxyXG5cclxuICAgIGlmIGZvdW5kRnVsbHlQbGF5ZWRcclxuICAgICAgZnVsbHlQbGF5ZWQgKz0gMVxyXG5cclxuICBjb25zb2xlLmxvZyBcImZ1bGx5UGxheWVkOiAje2Z1bGx5UGxheWVkfSAvICN7dG90YWxBdHRlbXB0c31cIlxyXG5cclxuIyAgICAgIEggIEQgIEMgIFNcclxuIyAgMjogNTEgNTAgNDkgNDhcclxuIyAgQTogNDcgNDYgNDUgNDRcclxuIyAgSzogNDMgNDIgNDEgNDBcclxuIyAgUTogMzkgMzggMzcgMzZcclxuIyAgSjogMzUgMzQgMzMgMzJcclxuIyAxMDogMzEgMzAgMjkgMjhcclxuIyAgOTogMjcgMjYgMjUgMjRcclxuIyAgODogMjMgMjIgMjEgMjBcclxuIyAgNzogMTkgMTggMTcgMTZcclxuIyAgNjogMTUgMTQgMTMgMTJcclxuIyAgNTogMTEgMTAgIDkgIDhcclxuIyAgNDogIDcgIDYgIDUgIDRcclxuIyAgMzogIDMgIDIgIDEgIDBcclxuXHJcbmRlYnVnMiA9IC0+XHJcbiAgZ2FtZSA9XHJcbiAgICBvcHRpb25zOlxyXG4gICAgICBhdXRvcGFzc0luZGV4OiAxXHJcbiAgdGhpciA9IG5ldyBUaGlydGVlbihnYW1lKVxyXG4gIGN1cnJlbnRQbGF5ID1cclxuICAgIHR5cGU6ICdydW4zJ1xyXG4gICAgaGlnaDogMjZcclxuICBoYW5kID0gW1xyXG4gICAgMTAsIDExLCAxNSwgMTksIDIzLCAyN1xyXG4gIF1cclxuICBjb25zb2xlLmxvZyB0aGlyLmhhc1BsYXkoY3VycmVudFBsYXksIGhhbmQpXHJcblxyXG5cclxuIyBkZWJ1ZygpXHJcbiMgZGVidWcyKClcclxuXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgRXhwb3J0c1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPVxyXG4gIENhcmQ6IENhcmRcclxuICBUaGlydGVlbjogVGhpcnRlZW5cclxuICBPSzogT0tcclxuICBhaUNoYXJhY3RlcnM6IGFpQ2hhcmFjdGVyc1xyXG4gIGFjaGlldmVtZW50c0xpc3Q6IGFjaGlldmVtZW50c0xpc3RcclxuICBhY2hpZXZlbWVudHNNYXA6IGFjaGlldmVtZW50c01hcFxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9XHJcbiAgZGFya2ZvcmVzdDpcclxuICAgIGhlaWdodDogNzJcclxuICAgIGdseXBoczpcclxuICAgICAgJzk3JyA6IHsgeDogICA4LCB5OiAgIDgsIHdpZHRoOiAgMzQsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICc5OCcgOiB7IHg6ICAgOCwgeTogIDU4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnOTknIDogeyB4OiAgNTAsIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzEwMCc6IHsgeDogICA4LCB5OiAxMTgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICcxMDEnOiB7IHg6ICAgOCwgeTogMTc4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnMTAyJzogeyB4OiAgIDgsIHk6IDIyOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDMzIH1cclxuICAgICAgJzEwMyc6IHsgeDogICA4LCB5OiAyNzgsIHdpZHRoOiAgMzYsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNSB9XHJcbiAgICAgICcxMDQnOiB7IHg6ICAgOCwgeTogMzI4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnMTA1JzogeyB4OiAgIDgsIHk6IDM3OCwgd2lkdGg6ICAxMiwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDExIH1cclxuICAgICAgJzEwNic6IHsgeDogICA4LCB5OiA0MjgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQxLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICcxMDcnOiB7IHg6ICAyOCwgeTogMzc4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnMTA4JzogeyB4OiAgNTEsIHk6IDMyOCwgd2lkdGg6ICAzNCwgaGVpZ2h0OiAgNDEsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDMzIH1cclxuICAgICAgJzEwOSc6IHsgeDogIDUxLCB5OiA0MjcsIHdpZHRoOiAgMzgsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNyB9XHJcbiAgICAgICcxMTAnOiB7IHg6ICA3MSwgeTogMzc3LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnMTExJzogeyB4OiAgOTcsIHk6IDQyNywgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDEsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzExMic6IHsgeDogIDUxLCB5OiAgNTgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICcxMTMnOiB7IHg6ICA1MSwgeTogMTA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0NSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnMTE0JzogeyB4OiAgOTMsIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM1IH1cclxuICAgICAgJzExNSc6IHsgeDogIDUxLCB5OiAxNjEsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNSB9XHJcbiAgICAgICcxMTYnOiB7IHg6ICA1MSwgeTogMjExLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzMgfVxyXG4gICAgICAnMTE3JzogeyB4OiAgNTIsIHk6IDI2MSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzExOCc6IHsgeDogIDkzLCB5OiAzMTEsIHdpZHRoOiAgMzQsIGhlaWdodDogIDQxLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzMiB9XHJcbiAgICAgICcxMTknOiB7IHg6IDExNCwgeTogMzYwLCB3aWR0aDogIDM4LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzggfVxyXG4gICAgICAnMTIwJzogeyB4OiAxNDAsIHk6IDQxMCwgd2lkdGg6ICAzNiwgaGVpZ2h0OiAgNDEsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM3IH1cclxuICAgICAgJzEyMSc6IHsgeDogMTQwLCB5OiA0NTksIHdpZHRoOiAgMzUsIGhlaWdodDogIDQxLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICcxMjInOiB7IHg6IDE4MywgeTogNDU5LCB3aWR0aDogIDM2LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzUgfVxyXG4gICAgICAnNjUnIDogeyB4OiAgOTQsIHk6ICA1OCwgd2lkdGg6ICAzNCwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cclxuICAgICAgJzY2JyA6IHsgeDogIDk0LCB5OiAxMTksIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNyB9XHJcbiAgICAgICc2NycgOiB7IHg6ICA5NCwgeTogMTgwLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxyXG4gICAgICAnNjgnIDogeyB4OiAgOTUsIHk6IDI0MSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM3IH1cclxuICAgICAgJzY5JyA6IHsgeDogMTM2LCB5OiAgIDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XHJcbiAgICAgICc3MCcgOiB7IHg6IDEzNywgeTogIDY5LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnNzEnIDogeyB4OiAxNzksIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cclxuICAgICAgJzcyJyA6IHsgeDogMTM3LCB5OiAxMzAsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XHJcbiAgICAgICc3MycgOiB7IHg6IDEzOCwgeTogMTkxLCB3aWR0aDogIDEyLCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMTMgfVxyXG4gICAgICAnNzQnIDogeyB4OiAxMzgsIHk6IDI1Miwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cclxuICAgICAgJzc1JyA6IHsgeDogMTU4LCB5OiAxOTEsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XHJcbiAgICAgICc3NicgOiB7IHg6IDE2MCwgeTogMzEzLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnNzcnIDogeyB4OiAxODEsIHk6IDI1MSwgd2lkdGg6ICAzOCwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM5IH1cclxuICAgICAgJzc4JyA6IHsgeDogMTg0LCB5OiAzNzQsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNSB9XHJcbiAgICAgICc3OScgOiB7IHg6IDIwMywgeTogMzEyLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxyXG4gICAgICAnODAnIDogeyB4OiAxODAsIHk6ICA2OSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzgxJyA6IHsgeDogMjAxLCB5OiAxMzAsIHdpZHRoOiAgMzUsIGhlaWdodDogIDU2LCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNSB9XHJcbiAgICAgICc4MicgOiB7IHg6IDIyMiwgeTogICA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxyXG4gICAgICAnODMnIDogeyB4OiAyMjMsIHk6ICA2OSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM1IH1cclxuICAgICAgJzg0JyA6IHsgeDogMjY1LCB5OiAgIDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzMyB9XHJcbiAgICAgICc4NScgOiB7IHg6IDIyNywgeTogMTk0LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxyXG4gICAgICAnODYnIDogeyB4OiAyNDQsIHk6IDEzMCwgd2lkdGg6ICA0MSwgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDE5LCB4YWR2YW5jZTogIDM5IH1cclxuICAgICAgJzg3JyA6IHsgeDogMjY2LCB5OiAgNjksIHdpZHRoOiAgMzgsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNyB9XHJcbiAgICAgICc4OCcgOiB7IHg6IDMwOCwgeTogICA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMTksIHhhZHZhbmNlOiAgMzUgfVxyXG4gICAgICAnODknIDogeyB4OiAyMjcsIHk6IDM3Mywgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDE5LCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzkwJyA6IHsgeDogMjI3LCB5OiA0MzMsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNSB9XHJcbiAgICAgICczMycgOiB7IHg6IDI0NiwgeTogMjU1LCB3aWR0aDogIDE0LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMTEgfVxyXG4gICAgICAnNTknIDogeyB4OiAxODAsIHk6IDEzMCwgd2lkdGg6ICAxMywgaGVpZ2h0OiAgMzcsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDU2LCB4YWR2YW5jZTogIDEzIH1cclxuICAgICAgJzM3JyA6IHsgeDogIDk1LCB5OiAzMDIsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XHJcbiAgICAgICc1OCcgOiB7IHg6IDE2MCwgeTogMzc0LCB3aWR0aDogIDEzLCBoZWlnaHQ6ICAyMywgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNTAsIHhhZHZhbmNlOiAgMTMgfVxyXG4gICAgICAnNjMnIDogeyB4OiAyNjgsIHk6IDI1NSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDMzIH1cclxuICAgICAgJzQyJyA6IHsgeDogMTAzLCB5OiAzMDIsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XHJcbiAgICAgICc0MCcgOiB7IHg6IDI3MCwgeTogMTkwLCB3aWR0aDogIDIzLCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMjEgfVxyXG4gICAgICAnNDEnIDogeyB4OiAyOTMsIHk6IDEzMCwgd2lkdGg6ICAyMywgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDIxIH1cclxuICAgICAgJzk1JyA6IHsgeDogMTExLCB5OiAzMDIsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XHJcbiAgICAgICc0MycgOiB7IHg6IDI0NiwgeTogMzE2LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICAzNCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgMzksIHhhZHZhbmNlOiAgMzIgfVxyXG4gICAgICAnNDUnIDogeyB4OiAxODQsIHk6IDQzNSwgd2lkdGg6ICAyNiwgaGVpZ2h0OiAgMTEsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDQ0LCB4YWR2YW5jZTogIDI1IH1cclxuICAgICAgJzYxJyA6IHsgeDogMzEyLCB5OiAgNjgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDMwLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICA0MiwgeGFkdmFuY2U6ICAzMyB9XHJcbiAgICAgICc0NicgOiB7IHg6IDEzNSwgeTogMzEzLCB3aWR0aDogIDE0LCBoZWlnaHQ6ICAxMSwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNjEsIHhhZHZhbmNlOiAgMTQgfVxyXG4gICAgICAnNDQnIDogeyB4OiAyMjcsIHk6IDI1NSwgd2lkdGg6ICAxMCwgaGVpZ2h0OiAgMjEsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDY4LCB4YWR2YW5jZTogIDExIH1cclxuICAgICAgJzQ3JyA6IHsgeDogMzUxLCB5OiAgIDgsIHdpZHRoOiAgMjgsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAxOSwgeGFkdmFuY2U6ICAyNiB9XHJcbiAgICAgICcxMjQnOiB7IHg6IDExOSwgeTogMzAyLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxyXG4gICAgICAnMzQnIDogeyB4OiAxMjcsIHk6IDMwMiwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cclxuICAgICAgJzM5JyA6IHsgeDogMjAxLCB5OiAxOTQsIHdpZHRoOiAgMTgsIGhlaWdodDogIDE5LCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAgMCwgeGFkdmFuY2U6ICAyMSB9XHJcbiAgICAgICc2NCcgOiB7IHg6IDIxOCwgeTogNDM1LCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxyXG4gICAgICAnMzUnIDogeyB4OiAyMTgsIHk6IDQ0Mywgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cclxuICAgICAgJzM2JyA6IHsgeDogMzAxLCB5OiAxOTAsIHdpZHRoOiAgMzIsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAyMiwgeGFkdmFuY2U6ICAyOSB9XHJcbiAgICAgICc5NCcgOiB7IHg6IDIxOCwgeTogNDUxLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxyXG4gICAgICAnMzgnIDogeyB4OiAyNDYsIHk6IDM1OCwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cclxuICAgICAgJzEyMyc6IHsgeDogMzI0LCB5OiAxMDYsIHdpZHRoOiAgMjcsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAyNiB9XHJcbiAgICAgICcxMjUnOiB7IHg6IDI3MCwgeTogMzU4LCB3aWR0aDogIDI3LCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMjcgfVxyXG4gICAgICAnOTEnIDogeyB4OiAyNzAsIHk6IDQxOCwgd2lkdGg6ICAyMiwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDIxIH1cclxuICAgICAgJzkzJyA6IHsgeDogMzAwLCB5OiA0MTgsIHdpZHRoOiAgMjIsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAyMCB9XHJcbiAgICAgICc0OCcgOiB7IHg6IDMwNSwgeTogMzE2LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxyXG4gICAgICAnNDknIDogeyB4OiAzMTEsIHk6IDI1MSwgd2lkdGg6ICAzNCwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM1IH1cclxuICAgICAgJzUwJyA6IHsgeDogMzQxLCB5OiAxNjYsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNyB9XHJcbiAgICAgICc1MScgOiB7IHg6IDM1OSwgeTogIDY4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxyXG4gICAgICAnNTInIDogeyB4OiAzMzAsIHk6IDM3Nywgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM1IH1cclxuICAgICAgJzUzJyA6IHsgeDogMzQ4LCB5OiAzMTIsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNyB9XHJcbiAgICAgICc1NCcgOiB7IHg6IDMzMCwgeTogNDM4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxyXG4gICAgICAnNTUnIDogeyB4OiAzNTMsIHk6IDIyNywgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzU2JyA6IHsgeDogMzg0LCB5OiAxMjksIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XHJcbiAgICAgICc1NycgOiB7IHg6IDQwMiwgeTogICA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxyXG4gICAgICAnMzInIDogeyB4OiAgIDAsIHk6ICAgMCwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDIyIH1cclxuXHJcbiAgICAgICMgY2FyZCBnbHlwaHNcclxuICAgICAgJzIwMCc6IHsgeDogMzk2LCB5OiAzNzgsIHdpZHRoOiAgNDAsIGhlaWdodDogIDQ5LCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMSwgeGFkdmFuY2U6ICA0MyB9ICMgU1xyXG4gICAgICAnMjAxJzogeyB4OiA0NDcsIHk6IDMxMywgd2lkdGg6ICA0OSwgaGVpZ2h0OiAgNTAsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIxLCB4YWR2YW5jZTogIDUyIH0gIyBDXHJcbiAgICAgICcyMDInOiB7IHg6IDM5OSwgeTogMzEzLCB3aWR0aDogIDM2LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjEsIHhhZHZhbmNlOiAgMzkgfSAjIERcclxuICAgICAgJzIwMyc6IHsgeDogNDUyLCB5OiAzODEsIHdpZHRoOiAgMzksIGhlaWdodDogIDQzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMSwgeGFkdmFuY2U6ICA0MiB9ICMgSFxyXG4iLCIjIFRoaXMgZmlsZSBwcm92aWRlcyB0aGUgcmVuZGVyaW5nIGVuZ2luZSBmb3IgdGhlIHdlYiB2ZXJzaW9uLiBOb25lIG9mIHRoaXMgY29kZSBpcyBpbmNsdWRlZCBpbiB0aGUgSmF2YSB2ZXJzaW9uLlxyXG5cclxuY29uc29sZS5sb2cgJ3dlYiBzdGFydHVwJ1xyXG5cclxuR2FtZSA9IHJlcXVpcmUgJy4vR2FtZSdcclxuXHJcbiMgdGFrZW4gZnJvbSBodHRwOiNzdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNTYyMzgzOC9yZ2ItdG8taGV4LWFuZC1oZXgtdG8tcmdiXHJcbmNvbXBvbmVudFRvSGV4ID0gKGMpIC0+XHJcbiAgaGV4ID0gTWF0aC5mbG9vcihjICogMjU1KS50b1N0cmluZygxNilcclxuICByZXR1cm4gaWYgaGV4Lmxlbmd0aCA9PSAxIHRoZW4gXCIwXCIgKyBoZXggZWxzZSBoZXhcclxucmdiVG9IZXggPSAociwgZywgYikgLT5cclxuICByZXR1cm4gXCIjXCIgKyBjb21wb25lbnRUb0hleChyKSArIGNvbXBvbmVudFRvSGV4KGcpICsgY29tcG9uZW50VG9IZXgoYilcclxuXHJcblNBVkVfVElNRVJfTVMgPSAzMDAwXHJcblxyXG5jbGFzcyBOYXRpdmVBcHBcclxuICBjb25zdHJ1Y3RvcjogKEBzY3JlZW4sIEB3aWR0aCwgQGhlaWdodCkgLT5cclxuICAgIEB0aW50ZWRUZXh0dXJlQ2FjaGUgPSBbXVxyXG4gICAgQGxhc3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcclxuICAgIEBsYXN0SW50ZXJhY3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcclxuICAgIEBoZWFyZE9uZVRvdWNoID0gZmFsc2VcclxuICAgIEB0b3VjaE1vdXNlID0gbnVsbFxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNlZG93bicsICBAb25Nb3VzZURvd24uYmluZCh0aGlzKSwgZmFsc2VcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdtb3VzZW1vdmUnLCAgQG9uTW91c2VNb3ZlLmJpbmQodGhpcyksIGZhbHNlXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2V1cCcsICAgIEBvbk1vdXNlVXAuYmluZCh0aGlzKSwgZmFsc2VcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICd0b3VjaHN0YXJ0JywgQG9uVG91Y2hTdGFydC5iaW5kKHRoaXMpLCBmYWxzZVxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ3RvdWNobW92ZScsICBAb25Ub3VjaE1vdmUuYmluZCh0aGlzKSwgZmFsc2VcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICd0b3VjaGVuZCcsICAgQG9uVG91Y2hFbmQuYmluZCh0aGlzKSwgZmFsc2VcclxuICAgIEBjb250ZXh0ID0gQHNjcmVlbi5nZXRDb250ZXh0KFwiMmRcIilcclxuICAgIEB0ZXh0dXJlcyA9IFtcclxuICAgICAgIyBhbGwgY2FyZCBhcnRcclxuICAgICAgXCIuLi9pbWFnZXMvY2FyZHMucG5nXCJcclxuICAgICAgIyBmb250c1xyXG4gICAgICBcIi4uL2ltYWdlcy9kYXJrZm9yZXN0LnBuZ1wiXHJcbiAgICAgICMgY2hhcmFjdGVycyAvIG90aGVyXHJcbiAgICAgIFwiLi4vaW1hZ2VzL2NoYXJzLnBuZ1wiXHJcbiAgICAgICMgaGVscFxyXG4gICAgICBcIi4uL2ltYWdlcy9ob3d0b3BsYXkxLnBuZ1wiXHJcbiAgICBdXHJcblxyXG4gICAgQGdhbWUgPSBuZXcgR2FtZSh0aGlzLCBAd2lkdGgsIEBoZWlnaHQpXHJcblxyXG4gICAgaWYgdHlwZW9mIFN0b3JhZ2UgIT0gXCJ1bmRlZmluZWRcIlxyXG4gICAgICBzdGF0ZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtIFwic3RhdGVcIlxyXG4gICAgICBpZiBzdGF0ZVxyXG4gICAgICAgICMgY29uc29sZS5sb2cgXCJsb2FkaW5nIHN0YXRlOiAje3N0YXRlfVwiXHJcbiAgICAgICAgQGdhbWUubG9hZCBzdGF0ZVxyXG5cclxuICAgIEBwZW5kaW5nSW1hZ2VzID0gMFxyXG4gICAgbG9hZGVkVGV4dHVyZXMgPSBbXVxyXG4gICAgZm9yIGltYWdlVXJsIGluIEB0ZXh0dXJlc1xyXG4gICAgICBAcGVuZGluZ0ltYWdlcysrXHJcbiAgICAgIGNvbnNvbGUubG9nIFwibG9hZGluZyBpbWFnZSAje0BwZW5kaW5nSW1hZ2VzfTogI3tpbWFnZVVybH1cIlxyXG4gICAgICBpbWcgPSBuZXcgSW1hZ2UoKVxyXG4gICAgICBpbWcub25sb2FkID0gQG9uSW1hZ2VMb2FkZWQuYmluZCh0aGlzKVxyXG4gICAgICBpbWcuc3JjID0gaW1hZ2VVcmxcclxuICAgICAgbG9hZGVkVGV4dHVyZXMucHVzaCBpbWdcclxuICAgIEB0ZXh0dXJlcyA9IGxvYWRlZFRleHR1cmVzXHJcblxyXG4gICAgQHNhdmVUaW1lciA9IFNBVkVfVElNRVJfTVNcclxuXHJcbiAgb25JbWFnZUxvYWRlZDogKGluZm8pIC0+XHJcbiAgICBAcGVuZGluZ0ltYWdlcy0tXHJcbiAgICBpZiBAcGVuZGluZ0ltYWdlcyA9PSAwXHJcbiAgICAgIGNvbnNvbGUubG9nICdBbGwgaW1hZ2VzIGxvYWRlZC4gQmVnaW5uaW5nIHJlbmRlciBsb29wLidcclxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0+IEB1cGRhdGUoKVxyXG5cclxuICBsb2c6IChzKSAtPlxyXG4gICAgY29uc29sZS5sb2cgXCJOYXRpdmVBcHAubG9nKCk6ICN7c31cIlxyXG5cclxuICB1cGRhdGVTYXZlOiAoZHQpIC0+XHJcbiAgICByZXR1cm4gaWYgdHlwZW9mIFN0b3JhZ2UgPT0gXCJ1bmRlZmluZWRcIlxyXG4gICAgQHNhdmVUaW1lciAtPSBkdFxyXG4gICAgaWYgQHNhdmVUaW1lciA8PSAwXHJcbiAgICAgIEBzYXZlVGltZXIgPSBTQVZFX1RJTUVSX01TXHJcbiAgICAgIHN0YXRlID0gQGdhbWUuc2F2ZSgpXHJcbiAgICAgICMgY29uc29sZS5sb2cgXCJzYXZpbmc6ICN7c3RhdGV9XCJcclxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0gXCJzdGF0ZVwiLCBzdGF0ZVxyXG5cclxuICBnZW5lcmF0ZVRpbnRJbWFnZTogKHRleHR1cmVJbmRleCwgcmVkLCBncmVlbiwgYmx1ZSkgLT5cclxuICAgIGltZyA9IEB0ZXh0dXJlc1t0ZXh0dXJlSW5kZXhdXHJcbiAgICBidWZmID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCBcImNhbnZhc1wiXHJcbiAgICBidWZmLndpZHRoICA9IGltZy53aWR0aFxyXG4gICAgYnVmZi5oZWlnaHQgPSBpbWcuaGVpZ2h0XHJcblxyXG4gICAgY3R4ID0gYnVmZi5nZXRDb250ZXh0IFwiMmRcIlxyXG4gICAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdjb3B5J1xyXG4gICAgY3R4LmRyYXdJbWFnZShpbWcsIDAsIDApXHJcbiAgICBmaWxsQ29sb3IgPSBcInJnYigje01hdGguZmxvb3IocmVkKjI1NSl9LCAje01hdGguZmxvb3IoZ3JlZW4qMjU1KX0sICN7TWF0aC5mbG9vcihibHVlKjI1NSl9KVwiXHJcbiAgICBjdHguZmlsbFN0eWxlID0gZmlsbENvbG9yXHJcbiAgICAjIGNvbnNvbGUubG9nIFwiZmlsbENvbG9yICN7ZmlsbENvbG9yfVwiXHJcbiAgICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ211bHRpcGx5J1xyXG4gICAgY3R4LmZpbGxSZWN0KDAsIDAsIGJ1ZmYud2lkdGgsIGJ1ZmYuaGVpZ2h0KVxyXG4gICAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdjb3B5J1xyXG4gICAgY3R4Lmdsb2JhbEFscGhhID0gMS4wXHJcbiAgICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2Rlc3RpbmF0aW9uLWluJ1xyXG4gICAgY3R4LmRyYXdJbWFnZShpbWcsIDAsIDApXHJcblxyXG4gICAgaW1nQ29tcCA9IG5ldyBJbWFnZSgpXHJcbiAgICBpbWdDb21wLnNyYyA9IGJ1ZmYudG9EYXRhVVJMKClcclxuICAgIHJldHVybiBpbWdDb21wXHJcblxyXG4gIGRyYXdJbWFnZTogKHRleHR1cmVJbmRleCwgc3JjWCwgc3JjWSwgc3JjVywgc3JjSCwgZHN0WCwgZHN0WSwgZHN0VywgZHN0SCwgcm90LCBhbmNob3JYLCBhbmNob3JZLCByLCBnLCBiLCBhKSAtPlxyXG4gICAgdGV4dHVyZSA9IEB0ZXh0dXJlc1t0ZXh0dXJlSW5kZXhdXHJcbiAgICBpZiAociAhPSAxKSBvciAoZyAhPSAxKSBvciAoYiAhPSAxKVxyXG4gICAgICB0aW50ZWRUZXh0dXJlS2V5ID0gXCIje3RleHR1cmVJbmRleH0tI3tyfS0je2d9LSN7Yn1cIlxyXG4gICAgICB0aW50ZWRUZXh0dXJlID0gQHRpbnRlZFRleHR1cmVDYWNoZVt0aW50ZWRUZXh0dXJlS2V5XVxyXG4gICAgICBpZiBub3QgdGludGVkVGV4dHVyZVxyXG4gICAgICAgIHRpbnRlZFRleHR1cmUgPSBAZ2VuZXJhdGVUaW50SW1hZ2UgdGV4dHVyZUluZGV4LCByLCBnLCBiXHJcbiAgICAgICAgQHRpbnRlZFRleHR1cmVDYWNoZVt0aW50ZWRUZXh0dXJlS2V5XSA9IHRpbnRlZFRleHR1cmVcclxuICAgICAgICAjIGNvbnNvbGUubG9nIFwiZ2VuZXJhdGVkIGNhY2hlZCB0ZXh0dXJlICN7dGludGVkVGV4dHVyZUtleX1cIlxyXG4gICAgICB0ZXh0dXJlID0gdGludGVkVGV4dHVyZVxyXG5cclxuICAgIEBjb250ZXh0LnNhdmUoKVxyXG4gICAgQGNvbnRleHQudHJhbnNsYXRlIGRzdFgsIGRzdFlcclxuICAgIEBjb250ZXh0LnJvdGF0ZSByb3QgIyAqIDMuMTQxNTkyIC8gMTgwLjBcclxuICAgIGFuY2hvck9mZnNldFggPSAtMSAqIGFuY2hvclggKiBkc3RXXHJcbiAgICBhbmNob3JPZmZzZXRZID0gLTEgKiBhbmNob3JZICogZHN0SFxyXG4gICAgQGNvbnRleHQudHJhbnNsYXRlIGFuY2hvck9mZnNldFgsIGFuY2hvck9mZnNldFlcclxuICAgIEBjb250ZXh0Lmdsb2JhbEFscGhhID0gYVxyXG4gICAgQGNvbnRleHQuZHJhd0ltYWdlKHRleHR1cmUsIHNyY1gsIHNyY1ksIHNyY1csIHNyY0gsIDAsIDAsIGRzdFcsIGRzdEgpXHJcbiAgICBAY29udGV4dC5yZXN0b3JlKClcclxuXHJcbiAgdXBkYXRlOiAtPlxyXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0+IEB1cGRhdGUoKVxyXG5cclxuICAgIG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXHJcbiAgICBkdCA9IG5vdyAtIEBsYXN0VGltZVxyXG5cclxuICAgICMgZHQgPSBNYXRoLmZsb29yKGR0IC8gMTAwKVxyXG5cclxuICAgIHRpbWVTaW5jZUludGVyYWN0ID0gbm93IC0gQGxhc3RJbnRlcmFjdFRpbWVcclxuICAgIGlmIHRpbWVTaW5jZUludGVyYWN0ID4gNTAwMFxyXG4gICAgICBnb2FsRlBTID0gNSAjIGNhbG0gZG93biwgbm9ib2R5IGlzIGRvaW5nIGFueXRoaW5nIGZvciBhIHdoaWxlXHJcbiAgICBlbHNlXHJcbiAgICAgIGdvYWxGUFMgPSBudWxsICMgYXMgZmFzdCBhcyBwb3NzaWJsZVxyXG4gICAgaWYgQGxhc3RHb2FsRlBTICE9IGdvYWxGUFNcclxuICAgICAgY29uc29sZS5sb2cgXCJzd2l0Y2hpbmcgdG8gI3tnb2FsRlBTfSBGUFNcIlxyXG4gICAgICBAbGFzdEdvYWxGUFMgPSBnb2FsRlBTXHJcblxyXG4gICAgaWYgZ29hbEZQUyAhPSBudWxsXHJcbiAgICAgIGZwc0ludGVydmFsID0gMTAwMCAvIGdvYWxGUFNcclxuICAgICAgaWYgZHQgPCBmcHNJbnRlcnZhbFxyXG4gICAgICAgIHJldHVyblxyXG4gICAgQGxhc3RUaW1lID0gbm93XHJcblxyXG4gICAgQGNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIEB3aWR0aCwgQGhlaWdodClcclxuICAgIGlmIEBnYW1lLnVwZGF0ZShkdClcclxuICAgICAgQGxhc3RJbnRlcmFjdFRpbWUgPSBub3dcclxuICAgIHJlbmRlckNvbW1hbmRzID0gQGdhbWUucmVuZGVyKClcclxuXHJcbiAgICBpID0gMFxyXG4gICAgbiA9IHJlbmRlckNvbW1hbmRzLmxlbmd0aFxyXG4gICAgd2hpbGUgKGkgPCBuKVxyXG4gICAgICBkcmF3Q2FsbCA9IHJlbmRlckNvbW1hbmRzLnNsaWNlKGksIGkgKz0gMTYpXHJcbiAgICAgIEBkcmF3SW1hZ2UuYXBwbHkodGhpcywgZHJhd0NhbGwpXHJcblxyXG4gICAgQHVwZGF0ZVNhdmUoZHQpXHJcblxyXG4gIG9uVG91Y2hTdGFydDogKGV2dCkgLT5cclxuICAgIEBsYXN0SW50ZXJhY3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcclxuICAgIEBoZWFyZE9uZVRvdWNoID0gdHJ1ZVxyXG4gICAgdG91Y2hlcyA9IGV2dC5jaGFuZ2VkVG91Y2hlc1xyXG4gICAgZm9yIHRvdWNoIGluIHRvdWNoZXNcclxuICAgICAgaWYgQHRvdWNoTW91c2UgPT0gbnVsbFxyXG4gICAgICAgIEB0b3VjaE1vdXNlID0gdG91Y2guaWRlbnRpZmllclxyXG4gICAgICBpZiBAdG91Y2hNb3VzZSA9PSB0b3VjaC5pZGVudGlmaWVyXHJcbiAgICAgICAgQGdhbWUudG91Y2hEb3duKHRvdWNoLmNsaWVudFgsIHRvdWNoLmNsaWVudFkpXHJcblxyXG4gIG9uVG91Y2hNb3ZlOiAoZXZ0KSAtPlxyXG4gICAgQGxhc3RJbnRlcmFjdFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxyXG4gICAgdG91Y2hlcyA9IGV2dC5jaGFuZ2VkVG91Y2hlc1xyXG4gICAgZm9yIHRvdWNoIGluIHRvdWNoZXNcclxuICAgICAgaWYgQHRvdWNoTW91c2UgPT0gdG91Y2guaWRlbnRpZmllclxyXG4gICAgICAgIEBnYW1lLnRvdWNoTW92ZSh0b3VjaC5jbGllbnRYLCB0b3VjaC5jbGllbnRZKVxyXG5cclxuICBvblRvdWNoRW5kOiAoZXZ0KSAtPlxyXG4gICAgQGxhc3RJbnRlcmFjdFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxyXG4gICAgdG91Y2hlcyA9IGV2dC5jaGFuZ2VkVG91Y2hlc1xyXG4gICAgZm9yIHRvdWNoIGluIHRvdWNoZXNcclxuICAgICAgaWYgQHRvdWNoTW91c2UgPT0gdG91Y2guaWRlbnRpZmllclxyXG4gICAgICAgIEBnYW1lLnRvdWNoVXAodG91Y2guY2xpZW50WCwgdG91Y2guY2xpZW50WSlcclxuICAgICAgICBAdG91Y2hNb3VzZSA9IG51bGxcclxuICAgIGlmIGV2dC50b3VjaGVzLmxlbmd0aCA9PSAwXHJcbiAgICAgIEB0b3VjaE1vdXNlID0gbnVsbFxyXG5cclxuICBvbk1vdXNlRG93bjogKGV2dCkgLT5cclxuICAgIGlmIEBoZWFyZE9uZVRvdWNoXHJcbiAgICAgIHJldHVyblxyXG4gICAgQGxhc3RJbnRlcmFjdFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxyXG4gICAgQGdhbWUudG91Y2hEb3duKGV2dC5jbGllbnRYLCBldnQuY2xpZW50WSlcclxuXHJcbiAgb25Nb3VzZU1vdmU6IChldnQpIC0+XHJcbiAgICBpZiBAaGVhcmRPbmVUb3VjaFxyXG4gICAgICByZXR1cm5cclxuICAgIEBsYXN0SW50ZXJhY3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcclxuICAgIEBnYW1lLnRvdWNoTW92ZShldnQuY2xpZW50WCwgZXZ0LmNsaWVudFkpXHJcblxyXG4gIG9uTW91c2VVcDogKGV2dCkgLT5cclxuICAgIGlmIEBoZWFyZE9uZVRvdWNoXHJcbiAgICAgIHJldHVyblxyXG4gICAgQGxhc3RJbnRlcmFjdFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxyXG4gICAgQGdhbWUudG91Y2hVcChldnQuY2xpZW50WCwgZXZ0LmNsaWVudFkpXHJcblxyXG5zY3JlZW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAnc2NyZWVuJ1xyXG5yZXNpemVTY3JlZW4gPSAtPlxyXG4gIGRlc2lyZWRBc3BlY3RSYXRpbyA9IDE2IC8gOVxyXG4gIGN1cnJlbnRBc3BlY3RSYXRpbyA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0XHJcbiAgaWYgY3VycmVudEFzcGVjdFJhdGlvIDwgZGVzaXJlZEFzcGVjdFJhdGlvXHJcbiAgICBzY3JlZW4ud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aFxyXG4gICAgc2NyZWVuLmhlaWdodCA9IE1hdGguZmxvb3Iod2luZG93LmlubmVyV2lkdGggKiAoMSAvIGRlc2lyZWRBc3BlY3RSYXRpbykpXHJcbiAgZWxzZVxyXG4gICAgc2NyZWVuLndpZHRoID0gTWF0aC5mbG9vcih3aW5kb3cuaW5uZXJIZWlnaHQgKiBkZXNpcmVkQXNwZWN0UmF0aW8pXHJcbiAgICBzY3JlZW4uaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0XHJcbnJlc2l6ZVNjcmVlbigpXHJcbiMgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ3Jlc2l6ZScsIHJlc2l6ZVNjcmVlbiwgZmFsc2VcclxuXHJcbmFwcCA9IG5ldyBOYXRpdmVBcHAoc2NyZWVuLCBzY3JlZW4ud2lkdGgsIHNjcmVlbi5oZWlnaHQpXHJcbiJdfQ==
