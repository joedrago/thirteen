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
var Animation, BUILD_TIMESTAMP, Button, FontRenderer, Game, Hand, Menu, OK, Pile, SpriteRenderer, Thirteen, achievementsList, aiCharacters, ref;

Animation = require('./Animation');

Button = require('./Button');

FontRenderer = require('./FontRenderer');

SpriteRenderer = require('./SpriteRenderer');

Menu = require('./Menu');

Hand = require('./Hand');

Pile = require('./Pile');

ref = require('./Thirteen'), Thirteen = ref.Thirteen, OK = ref.OK, aiCharacters = ref.aiCharacters, achievementsList = ref.achievementsList;

BUILD_TIMESTAMP = "1.0.0";

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
    this.paused = false;
    this.renderMode = 0;
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
      ]
    };
    this.options = {
      speedIndex: 1,
      sortIndex: 0,
      sound: true
    };
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
            _this.renderMode = 2;
          }
          return "Achievements";
        };
      })(this), (function(_this) {
        return function(click) {
          if (click) {
            _this.renderMode = 1;
          }
          return "How To Play";
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
            _this.options.speedIndex = (_this.options.speedIndex + 1) % _this.optionMenus.speeds.length;
          }
          return _this.optionMenus.speeds[_this.options.speedIndex].text;
        };
      })(this), (function(_this) {
        return function(click) {
          if (click) {
            _this.newGame(true);
            _this.paused = false;
          }
          return "New Money Game";
        };
      })(this), (function(_this) {
        return function(click) {
          if (click) {
            _this.newGame(false);
            _this.paused = false;
          }
          return "New Game";
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
    if (this.renderMode === 1) {
      this.renderHowto();
    } else if (this.renderMode === 2) {
      this.renderAchievements();
    } else {
      this.renderGame();
    }
    return this.renderCommands;
  };

  Game.prototype.renderHowto = function() {
    var howtoTexture;
    howtoTexture = "howto1";
    this.log("rendering " + howtoTexture);
    this.spriteRenderer.render("solid", 0, 0, this.width, this.height, 0, 0, 0, this.colors.black);
    return this.spriteRenderer.render(howtoTexture, 0, 0, this.width, this.aaHeight, 0, 0, 0, this.colors.white, (function(_this) {
      return function() {
        return _this.renderMode = 0;
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
        return _this.renderMode = 0;
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

  Game.prototype.renderGame = function() {
    var aiPlayers, cardAreaText, character, characterHeight, characterMargin, characterWidth, color, countHeight, drawGameOver, gameOverSize, gameOverY, handAreaHeight, handareaColor, i, j, len, line, lines, opacity, pileDimension, pileSprite, ref1, restartQuitSize, shadowDistance, textHeight, textPadding, x, xText, y;
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
    if (aiPlayers[0] !== null) {
      character = aiCharacters[aiPlayers[0].charID];
      characterWidth = this.spriteRenderer.calcWidth(character.sprite, characterHeight);
      this.spriteRenderer.render(character.sprite, characterMargin, this.charCeiling, 0, characterHeight, 0, 0, 1, this.colors.white, (function(_this) {
        return function() {};
      })(this));
      this.renderCount(aiPlayers[0], this.thirteen.money, drawGameOver, aiPlayers[0].index === this.thirteen.turn, countHeight, characterMargin + (characterWidth / 2), this.charCeiling - textPadding, 0.5, 0);
    }
    if (aiPlayers[1] !== null) {
      character = aiCharacters[aiPlayers[1].charID];
      this.spriteRenderer.render(character.sprite, this.center.x, 0, 0, characterHeight, 0, 0.5, 0, this.colors.white);
      this.renderCount(aiPlayers[1], this.thirteen.money, drawGameOver, aiPlayers[1].index === this.thirteen.turn, countHeight, this.center.x, characterHeight, 0.5, 0);
    }
    if (aiPlayers[2] !== null) {
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
        return _this.paused = true;
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
          return _this.renderMode = 2;
        };
      })(this));
      this.fontRenderer.render(this.font, textHeight, "Achievement Earned", xText, y, 0, 0, color);
      this.fontRenderer.render(this.font, textHeight, this.achievementFanfare.title, xText, y + textHeight, 0, 0, color);
    }
    if (this.paused) {
      this.pauseMenu.render();
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
var Card, GlyphSuitName, MAX_LOG_LINES, MIN_PLAYERS, OK, STARTING_MONEY, ShortSuitName, ShuffledDeck, Suit, SuitName, Thirteen, achievementsList, achievementsMap, aiCharacterList, aiCharacters, cardsToString, character, debug, e, l, len1, len2, m, playToCardCount, playToString, playTypeToString, randomCharacter;

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
  function Thirteen(game, params) {
    var k, ref, v;
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
      if ((this.turn === 0) && (currentPlayer.place === 1)) {
        this.streak += 1;
        this.lastStreak = this.streak;
      } else {
        this.lastStreak = this.streak;
        this.streak = 0;
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
      if ((this.turn === 0) && (currentPlayer.place === 1)) {
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
    if (this.currentPlay && (playToCardCount(this.currentPlay) > currentPlayer.hand.length)) {
      this.output(currentPlayer.name + " auto-passes (too few cards)");
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
      if (this.currentPlay && (this.currentPlay.type === 'kind1') && this.hasBreaker(currentPlayer.hand)) {

      } else if (this.currentPlay && (playToCardCount(this.currentPlay) > currentPlayer.hand.length)) {
        this.aiLog("autopassing for player, not enough cards");
        this.aiPass(currentPlayer);
        return true;
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

  Thirteen.prototype.aiFindRuns = function(hand, eachSize, size) {
    var card, cards, each, i, lastStartingValue, leftovers, len3, len4, len5, n, o, offset, q, ref, ref1, ref2, ref3, run, runFound, runs, startingValue, u, valueArray, valueArrays, w, x, y, z;
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
    lastStartingValue = 12 - size;
    for (startingValue = q = 0, ref = lastStartingValue; 0 <= ref ? q < ref : q > ref; startingValue = 0 <= ref ? ++q : --q) {
      runFound = true;
      for (offset = u = 0, ref1 = size; 0 <= ref1 ? u < ref1 : u > ref1; offset = 0 <= ref1 ? ++u : --u) {
        if (valueArrays[startingValue + offset].length < eachSize) {
          runFound = false;
          break;
        }
      }
      if (runFound) {
        run = [];
        for (offset = w = 0, ref2 = size; 0 <= ref2 ? w < ref2 : w > ref2; offset = 0 <= ref2 ? ++w : --w) {
          for (each = x = 0, ref3 = eachSize; 0 <= ref3 ? x < ref3 : x > ref3; each = 0 <= ref3 ? ++x : --x) {
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

  Thirteen.prototype.aiCalcRuns = function(hand, plays, smallRuns) {
    var byAmount, endSize, key, leftovers, n, ref, ref1, ref2, ref3, runSize, runs, startSize;
    if (smallRuns) {
      startSize = 3;
      endSize = 12;
      byAmount = 1;
    } else {
      startSize = 12;
      endSize = 3;
      byAmount = -1;
    }
    for (runSize = n = ref = startSize, ref1 = endSize, ref2 = byAmount; ref2 > 0 ? n <= ref1 : n >= ref1; runSize = n += ref2) {
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
    var endSize, key, leftovers, n, ref, ref1, ref2, rops, runSize, startSize;
    startSize = 3;
    endSize = 6;
    for (runSize = n = ref = startSize, ref1 = endSize; ref <= ref1 ? n <= ref1 : n >= ref1; runSize = ref <= ref1 ? ++n : --n) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQW5pbWF0aW9uLmNvZmZlZSIsInNyYy9CdXR0b24uY29mZmVlIiwic3JjL0ZvbnRSZW5kZXJlci5jb2ZmZWUiLCJzcmMvR2FtZS5jb2ZmZWUiLCJzcmMvSGFuZC5jb2ZmZWUiLCJzcmMvTWVudS5jb2ZmZWUiLCJzcmMvUGlsZS5jb2ZmZWUiLCJzcmMvU3ByaXRlUmVuZGVyZXIuY29mZmVlIiwic3JjL1RoaXJ0ZWVuLmNvZmZlZSIsInNyYy9mb250bWV0cmljcy5jb2ZmZWUiLCJzcmMvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBOztBQUFBLFFBQUEsR0FBVyxTQUFDLENBQUQ7RUFDVCxJQUFHLENBQUEsS0FBSyxDQUFSO0FBQ0UsV0FBTyxFQURUO0dBQUEsTUFFSyxJQUFHLENBQUEsR0FBSSxDQUFQO0FBQ0gsV0FBTyxDQUFDLEVBREw7O0FBRUwsU0FBTztBQUxFOztBQU9MO0VBQ1MsbUJBQUMsSUFBRDtBQUNYLFFBQUE7SUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksQ0FBQztJQUNkLElBQUMsQ0FBQSxHQUFELEdBQU87SUFDUCxJQUFDLENBQUEsR0FBRCxHQUFPO0FBQ1AsU0FBQSxTQUFBOztNQUNFLElBQUcsQ0FBQSxLQUFLLE9BQVI7UUFDRSxJQUFDLENBQUEsR0FBSSxDQUFBLENBQUEsQ0FBTCxHQUFVO1FBQ1YsSUFBQyxDQUFBLEdBQUksQ0FBQSxDQUFBLENBQUwsR0FBVSxFQUZaOztBQURGO0VBSlc7O3NCQVViLElBQUEsR0FBTSxTQUFBO0lBQ0osSUFBRyxrQkFBSDtNQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBTCxHQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFEaEI7O0lBRUEsSUFBRyxrQkFBSDtNQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBTCxHQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFEaEI7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Q0FBQyxNQUFQLEdBQWdCLElBQUksQ0FBQyxLQUFMLENBQVcsTUFBTSxDQUFDLFVBQVAsR0FBb0IsQ0FBQyxDQUFBLEdBQUksa0JBQUwsQ0FBL0IsRUFGbEI7R0FBQSxNQUFBO0lBSUUsTUFBTSxDQUFDLEtBQVAsR0FBZSxJQUFJLENBQUMsS0FBTCxDQUFXLE1BQU0sQ0FBQyxXQUFQLEdBQXFCLGtCQUFoQztXQUNmLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLE1BQU0sQ0FBQyxZQUx6Qjs7QUFIYTs7QUFTZixZQUFBLENBQUE7O0FBR0EsR0FBQSxHQUFNLElBQUksU0FBSixDQUFjLE1BQWQsRUFBc0IsTUFBTSxDQUFDLEtBQTdCLEVBQW9DLE1BQU0sQ0FBQyxNQUEzQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNhbGNTaWduID0gKHYpIC0+XHJcbiAgaWYgdiA9PSAwXHJcbiAgICByZXR1cm4gMFxyXG4gIGVsc2UgaWYgdiA8IDBcclxuICAgIHJldHVybiAtMVxyXG4gIHJldHVybiAxXHJcblxyXG5jbGFzcyBBbmltYXRpb25cclxuICBjb25zdHJ1Y3RvcjogKGRhdGEpIC0+XHJcbiAgICBAc3BlZWQgPSBkYXRhLnNwZWVkXHJcbiAgICBAcmVxID0ge31cclxuICAgIEBjdXIgPSB7fVxyXG4gICAgZm9yIGssdiBvZiBkYXRhXHJcbiAgICAgIGlmIGsgIT0gJ3NwZWVkJ1xyXG4gICAgICAgIEByZXFba10gPSB2XHJcbiAgICAgICAgQGN1cltrXSA9IHZcclxuXHJcbiAgIyAnZmluaXNoZXMnIGFsbCBhbmltYXRpb25zXHJcbiAgd2FycDogLT5cclxuICAgIGlmIEBjdXIucj9cclxuICAgICAgQGN1ci5yID0gQHJlcS5yXHJcbiAgICBpZiBAY3VyLnM/XHJcbiAgICAgIEBjdXIucyA9IEByZXEuc1xyXG4gICAgaWYgQGN1ci54PyBhbmQgQGN1ci55P1xyXG4gICAgICBAY3VyLnggPSBAcmVxLnhcclxuICAgICAgQGN1ci55ID0gQHJlcS55XHJcblxyXG4gIGFuaW1hdGluZzogLT5cclxuICAgIGlmIEBjdXIucj9cclxuICAgICAgaWYgQHJlcS5yICE9IEBjdXIuclxyXG4gICAgICAgIHJldHVybiB0cnVlXHJcbiAgICBpZiBAY3VyLnM/XHJcbiAgICAgIGlmIEByZXEucyAhPSBAY3VyLnNcclxuICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgaWYgQGN1ci54PyBhbmQgQGN1ci55P1xyXG4gICAgICBpZiAoQHJlcS54ICE9IEBjdXIueCkgb3IgKEByZXEueSAhPSBAY3VyLnkpXHJcbiAgICAgICAgcmV0dXJuIHRydWVcclxuICAgIHJldHVybiBmYWxzZVxyXG5cclxuICB1cGRhdGU6IChkdCkgLT5cclxuICAgIHVwZGF0ZWQgPSBmYWxzZVxyXG4gICAgIyByb3RhdGlvblxyXG4gICAgaWYgQGN1ci5yP1xyXG4gICAgICBpZiBAcmVxLnIgIT0gQGN1ci5yXHJcbiAgICAgICAgdXBkYXRlZCA9IHRydWVcclxuICAgICAgICAjIHNhbml0aXplIHJlcXVlc3RlZCByb3RhdGlvblxyXG4gICAgICAgIHR3b1BpID0gTWF0aC5QSSAqIDJcclxuICAgICAgICBuZWdUd29QaSA9IC0xICogdHdvUGlcclxuICAgICAgICBAcmVxLnIgLT0gdHdvUGkgd2hpbGUgQHJlcS5yID49IHR3b1BpXHJcbiAgICAgICAgQHJlcS5yICs9IHR3b1BpIHdoaWxlIEByZXEuciA8PSBuZWdUd29QaVxyXG4gICAgICAgICMgcGljayBhIGRpcmVjdGlvbiBhbmQgdHVyblxyXG4gICAgICAgIGRyID0gQHJlcS5yIC0gQGN1ci5yXHJcbiAgICAgICAgZGlzdCA9IE1hdGguYWJzKGRyKVxyXG4gICAgICAgIHNpZ24gPSBjYWxjU2lnbihkcilcclxuICAgICAgICBpZiBkaXN0ID4gTWF0aC5QSVxyXG4gICAgICAgICAgIyBzcGluIHRoZSBvdGhlciBkaXJlY3Rpb24sIGl0IGlzIGNsb3NlclxyXG4gICAgICAgICAgZGlzdCA9IHR3b1BpIC0gZGlzdFxyXG4gICAgICAgICAgc2lnbiAqPSAtMVxyXG4gICAgICAgIG1heERpc3QgPSBkdCAqIEBzcGVlZC5yIC8gMTAwMFxyXG4gICAgICAgIGlmIGRpc3QgPCBtYXhEaXN0XHJcbiAgICAgICAgICAjIHdlIGNhbiBmaW5pc2ggdGhpcyBmcmFtZVxyXG4gICAgICAgICAgQGN1ci5yID0gQHJlcS5yXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgQGN1ci5yICs9IG1heERpc3QgKiBzaWduXHJcblxyXG4gICAgIyBzY2FsZVxyXG4gICAgaWYgQGN1ci5zP1xyXG4gICAgICBpZiBAcmVxLnMgIT0gQGN1ci5zXHJcbiAgICAgICAgdXBkYXRlZCA9IHRydWVcclxuICAgICAgICAjIHBpY2sgYSBkaXJlY3Rpb24gYW5kIHR1cm5cclxuICAgICAgICBkcyA9IEByZXEucyAtIEBjdXIuc1xyXG4gICAgICAgIGRpc3QgPSBNYXRoLmFicyhkcylcclxuICAgICAgICBzaWduID0gY2FsY1NpZ24oZHMpXHJcbiAgICAgICAgbWF4RGlzdCA9IGR0ICogQHNwZWVkLnMgLyAxMDAwXHJcbiAgICAgICAgaWYgZGlzdCA8IG1heERpc3RcclxuICAgICAgICAgICMgd2UgY2FuIGZpbmlzaCB0aGlzIGZyYW1lXHJcbiAgICAgICAgICBAY3VyLnMgPSBAcmVxLnNcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBAY3VyLnMgKz0gbWF4RGlzdCAqIHNpZ25cclxuXHJcbiAgICAjIHRyYW5zbGF0aW9uXHJcbiAgICBpZiBAY3VyLng/IGFuZCBAY3VyLnk/XHJcbiAgICAgIGlmIChAcmVxLnggIT0gQGN1ci54KSBvciAoQHJlcS55ICE9IEBjdXIueSlcclxuICAgICAgICB1cGRhdGVkID0gdHJ1ZVxyXG4gICAgICAgIHZlY1ggPSBAcmVxLnggLSBAY3VyLnhcclxuICAgICAgICB2ZWNZID0gQHJlcS55IC0gQGN1ci55XHJcbiAgICAgICAgZGlzdCA9IE1hdGguc3FydCgodmVjWCAqIHZlY1gpICsgKHZlY1kgKiB2ZWNZKSlcclxuICAgICAgICBtYXhEaXN0ID0gZHQgKiBAc3BlZWQudCAvIDEwMDBcclxuICAgICAgICBpZiBkaXN0IDwgbWF4RGlzdFxyXG4gICAgICAgICAgIyB3ZSBjYW4gZmluaXNoIHRoaXMgZnJhbWVcclxuICAgICAgICAgIEBjdXIueCA9IEByZXEueFxyXG4gICAgICAgICAgQGN1ci55ID0gQHJlcS55XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgIyBtb3ZlIGFzIG11Y2ggYXMgcG9zc2libGVcclxuICAgICAgICAgIEBjdXIueCArPSAodmVjWCAvIGRpc3QpICogbWF4RGlzdFxyXG4gICAgICAgICAgQGN1ci55ICs9ICh2ZWNZIC8gZGlzdCkgKiBtYXhEaXN0XHJcblxyXG4gICAgcmV0dXJuIHVwZGF0ZWRcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQW5pbWF0aW9uXHJcbiIsIkFuaW1hdGlvbiA9IHJlcXVpcmUgJy4vQW5pbWF0aW9uJ1xyXG5cclxuY2xhc3MgQnV0dG9uXHJcbiAgY29uc3RydWN0b3I6IChAZ2FtZSwgQHNwcml0ZU5hbWVzLCBAZm9udCwgQHRleHRIZWlnaHQsIEB4LCBAeSwgQGNiKSAtPlxyXG4gICAgQGFuaW0gPSBuZXcgQW5pbWF0aW9uIHtcclxuICAgICAgc3BlZWQ6IHsgczogMyB9XHJcbiAgICAgIHM6IDBcclxuICAgIH1cclxuICAgIEBjb2xvciA9IHsgcjogMSwgZzogMSwgYjogMSwgYTogMCB9XHJcblxyXG4gIHVwZGF0ZTogKGR0KSAtPlxyXG4gICAgcmV0dXJuIEBhbmltLnVwZGF0ZShkdClcclxuXHJcbiAgcmVuZGVyOiAtPlxyXG4gICAgQGNvbG9yLmEgPSBAYW5pbS5jdXIuc1xyXG4gICAgQGdhbWUuc3ByaXRlUmVuZGVyZXIucmVuZGVyIEBzcHJpdGVOYW1lc1swXSwgQHgsIEB5LCAwLCBAdGV4dEhlaWdodCAqIDEuNSwgMCwgMC41LCAwLjUsIEBnYW1lLmNvbG9ycy53aGl0ZSwgPT5cclxuICAgICAgIyBwdWxzZSBidXR0b24gYW5pbSxcclxuICAgICAgQGFuaW0uY3VyLnMgPSAxXHJcbiAgICAgIEBhbmltLnJlcS5zID0gMFxyXG4gICAgICAjIHRoZW4gY2FsbCBjYWxsYmFja1xyXG4gICAgICBAY2IodHJ1ZSlcclxuICAgIEBnYW1lLnNwcml0ZVJlbmRlcmVyLnJlbmRlciBAc3ByaXRlTmFtZXNbMV0sIEB4LCBAeSwgMCwgQHRleHRIZWlnaHQgKiAxLjUsIDAsIDAuNSwgMC41LCBAY29sb3JcclxuICAgIHRleHQgPSBAY2IoZmFsc2UpXHJcbiAgICBAZ2FtZS5mb250UmVuZGVyZXIucmVuZGVyIEBmb250LCBAdGV4dEhlaWdodCwgdGV4dCwgQHgsIEB5LCAwLjUsIDAuNSwgQGdhbWUuY29sb3JzLmJ1dHRvbnRleHRcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQnV0dG9uXHJcbiIsImZvbnRtZXRyaWNzID0gcmVxdWlyZSAnLi9mb250bWV0cmljcydcclxuXHJcbiMgdGFrZW4gZnJvbSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzU2MjM4MzgvcmdiLXRvLWhleC1hbmQtaGV4LXRvLXJnYlxyXG5oZXhUb1JnYiA9IChoZXgsIGEpIC0+XHJcbiAgICByZXN1bHQgPSAvXiM/KFthLWZcXGRdezJ9KShbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pJC9pLmV4ZWMoaGV4KVxyXG4gICAgcmV0dXJuIG51bGwgaWYgbm90IHJlc3VsdFxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByOiBwYXJzZUludChyZXN1bHRbMV0sIDE2KSAvIDI1NSxcclxuICAgICAgICBnOiBwYXJzZUludChyZXN1bHRbMl0sIDE2KSAvIDI1NSxcclxuICAgICAgICBiOiBwYXJzZUludChyZXN1bHRbM10sIDE2KSAvIDI1NVxyXG4gICAgICAgIGE6IGFcclxuICAgIH1cclxuXHJcbmNsYXNzIEZvbnRSZW5kZXJlclxyXG4gIGNvbnN0cnVjdG9yOiAgKEBnYW1lKSAtPlxyXG4gICAgQHdoaXRlID0geyByOiAxLCBnOiAxLCBiOiAxLCBhOiAxIH1cclxuXHJcbiAgc2l6ZTogKGZvbnQsIGhlaWdodCwgc3RyKSAtPlxyXG4gICAgbWV0cmljcyA9IGZvbnRtZXRyaWNzW2ZvbnRdXHJcbiAgICByZXR1cm4gaWYgbm90IG1ldHJpY3NcclxuICAgIHNjYWxlID0gaGVpZ2h0IC8gbWV0cmljcy5oZWlnaHRcclxuXHJcbiAgICB0b3RhbFdpZHRoID0gMFxyXG4gICAgdG90YWxIZWlnaHQgPSBtZXRyaWNzLmhlaWdodCAqIHNjYWxlXHJcblxyXG4gICAgaW5Db2xvciA9IGZhbHNlXHJcbiAgICBmb3IgY2gsIGkgaW4gc3RyXHJcbiAgICAgIGlmIGNoID09ICdgJ1xyXG4gICAgICAgIGluQ29sb3IgPSAhaW5Db2xvclxyXG5cclxuICAgICAgaWYgbm90IGluQ29sb3JcclxuICAgICAgICBjb2RlID0gY2guY2hhckNvZGVBdCgwKVxyXG4gICAgICAgIGdseXBoID0gbWV0cmljcy5nbHlwaHNbY29kZV1cclxuICAgICAgICBjb250aW51ZSBpZiBub3QgZ2x5cGhcclxuICAgICAgICB0b3RhbFdpZHRoICs9IGdseXBoLnhhZHZhbmNlICogc2NhbGVcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB3OiB0b3RhbFdpZHRoXHJcbiAgICAgIGg6IHRvdGFsSGVpZ2h0XHJcbiAgICB9XHJcblxyXG4gIHJlbmRlcjogKGZvbnQsIGhlaWdodCwgc3RyLCB4LCB5LCBhbmNob3J4LCBhbmNob3J5LCBjb2xvciwgY2IpIC0+XHJcbiAgICBtZXRyaWNzID0gZm9udG1ldHJpY3NbZm9udF1cclxuICAgIHJldHVybiBpZiBub3QgbWV0cmljc1xyXG4gICAgc2NhbGUgPSBoZWlnaHQgLyBtZXRyaWNzLmhlaWdodFxyXG5cclxuICAgIHRvdGFsV2lkdGggPSAwXHJcbiAgICB0b3RhbEhlaWdodCA9IG1ldHJpY3MuaGVpZ2h0ICogc2NhbGVcclxuICAgIHNraXBDb2xvciA9IGZhbHNlXHJcbiAgICBmb3IgY2gsIGkgaW4gc3RyXHJcbiAgICAgIGlmIGNoID09ICdgJ1xyXG4gICAgICAgIHNraXBDb2xvciA9ICFza2lwQ29sb3JcclxuICAgICAgY29udGludWUgaWYgc2tpcENvbG9yXHJcbiAgICAgIGNvZGUgPSBjaC5jaGFyQ29kZUF0KDApXHJcbiAgICAgIGdseXBoID0gbWV0cmljcy5nbHlwaHNbY29kZV1cclxuICAgICAgY29udGludWUgaWYgbm90IGdseXBoXHJcbiAgICAgIHRvdGFsV2lkdGggKz0gZ2x5cGgueGFkdmFuY2UgKiBzY2FsZVxyXG5cclxuICAgIGFuY2hvck9mZnNldFggPSAtMSAqIGFuY2hvcnggKiB0b3RhbFdpZHRoXHJcbiAgICBhbmNob3JPZmZzZXRZID0gLTEgKiBhbmNob3J5ICogdG90YWxIZWlnaHRcclxuICAgIGN1cnJYID0geFxyXG5cclxuICAgIGlmIGNvbG9yXHJcbiAgICAgIHN0YXJ0aW5nQ29sb3IgPSBjb2xvclxyXG4gICAgZWxzZVxyXG4gICAgICBzdGFydGluZ0NvbG9yID0gQHdoaXRlXHJcbiAgICBjdXJyZW50Q29sb3IgPSBzdGFydGluZ0NvbG9yXHJcblxyXG4gICAgY29sb3JTdGFydCA9IC0xXHJcbiAgICBmb3IgY2gsIGkgaW4gc3RyXHJcbiAgICAgIGlmIGNoID09ICdgJ1xyXG4gICAgICAgIGlmIGNvbG9yU3RhcnQgPT0gLTFcclxuICAgICAgICAgIGNvbG9yU3RhcnQgPSBpICsgMVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIGxlbiA9IGkgLSBjb2xvclN0YXJ0XHJcbiAgICAgICAgICBpZiBsZW5cclxuICAgICAgICAgICAgY3VycmVudENvbG9yID0gaGV4VG9SZ2Ioc3RyLnN1YnN0cihjb2xvclN0YXJ0LCBpIC0gY29sb3JTdGFydCksIHN0YXJ0aW5nQ29sb3IuYSlcclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgY3VycmVudENvbG9yID0gc3RhcnRpbmdDb2xvclxyXG4gICAgICAgICAgY29sb3JTdGFydCA9IC0xXHJcblxyXG4gICAgICBjb250aW51ZSBpZiBjb2xvclN0YXJ0ICE9IC0xXHJcbiAgICAgIGNvZGUgPSBjaC5jaGFyQ29kZUF0KDApXHJcbiAgICAgIGdseXBoID0gbWV0cmljcy5nbHlwaHNbY29kZV1cclxuICAgICAgY29udGludWUgaWYgbm90IGdseXBoXHJcbiAgICAgIEBnYW1lLmRyYXdJbWFnZSBmb250LFxyXG4gICAgICBnbHlwaC54LCBnbHlwaC55LCBnbHlwaC53aWR0aCwgZ2x5cGguaGVpZ2h0LFxyXG4gICAgICBjdXJyWCArIChnbHlwaC54b2Zmc2V0ICogc2NhbGUpICsgYW5jaG9yT2Zmc2V0WCwgeSArIChnbHlwaC55b2Zmc2V0ICogc2NhbGUpICsgYW5jaG9yT2Zmc2V0WSwgZ2x5cGgud2lkdGggKiBzY2FsZSwgZ2x5cGguaGVpZ2h0ICogc2NhbGUsXHJcbiAgICAgIDAsIDAsIDAsXHJcbiAgICAgIGN1cnJlbnRDb2xvci5yLCBjdXJyZW50Q29sb3IuZywgY3VycmVudENvbG9yLmIsIGN1cnJlbnRDb2xvci5hLCBjYlxyXG4gICAgICBjdXJyWCArPSBnbHlwaC54YWR2YW5jZSAqIHNjYWxlXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEZvbnRSZW5kZXJlclxyXG4iLCJBbmltYXRpb24gPSByZXF1aXJlICcuL0FuaW1hdGlvbidcclxuQnV0dG9uID0gcmVxdWlyZSAnLi9CdXR0b24nXHJcbkZvbnRSZW5kZXJlciA9IHJlcXVpcmUgJy4vRm9udFJlbmRlcmVyJ1xyXG5TcHJpdGVSZW5kZXJlciA9IHJlcXVpcmUgJy4vU3ByaXRlUmVuZGVyZXInXHJcbk1lbnUgPSByZXF1aXJlICcuL01lbnUnXHJcbkhhbmQgPSByZXF1aXJlICcuL0hhbmQnXHJcblBpbGUgPSByZXF1aXJlICcuL1BpbGUnXHJcbntUaGlydGVlbiwgT0ssIGFpQ2hhcmFjdGVycywgYWNoaWV2ZW1lbnRzTGlzdH0gPSByZXF1aXJlICcuL1RoaXJ0ZWVuJ1xyXG5cclxuIyB0ZW1wXHJcbkJVSUxEX1RJTUVTVEFNUCA9IFwiMS4wLjBcIlxyXG5cclxuY2xhc3MgR2FtZVxyXG4gIGNvbnN0cnVjdG9yOiAoQG5hdGl2ZSwgQHdpZHRoLCBAaGVpZ2h0KSAtPlxyXG4gICAgQHZlcnNpb24gPSBCVUlMRF9USU1FU1RBTVBcclxuICAgIEBsb2coXCJHYW1lIGNvbnN0cnVjdGVkOiAje0B3aWR0aH14I3tAaGVpZ2h0fVwiKVxyXG4gICAgQGZvbnRSZW5kZXJlciA9IG5ldyBGb250UmVuZGVyZXIgdGhpc1xyXG4gICAgQHNwcml0ZVJlbmRlcmVyID0gbmV3IFNwcml0ZVJlbmRlcmVyIHRoaXNcclxuICAgIEBmb250ID0gXCJkYXJrZm9yZXN0XCJcclxuICAgIEB6b25lcyA9IFtdXHJcbiAgICBAbmV4dEFJVGljayA9IDEwMDAgIyB3aWxsIGJlIHNldCBieSBvcHRpb25zXHJcbiAgICBAY2VudGVyID1cclxuICAgICAgeDogQHdpZHRoIC8gMlxyXG4gICAgICB5OiBAaGVpZ2h0IC8gMlxyXG4gICAgQGFhSGVpZ2h0ID0gQHdpZHRoICogOSAvIDE2XHJcbiAgICBAbG9nIFwiaGVpZ2h0OiAje0BoZWlnaHR9LiBoZWlnaHQgaWYgc2NyZWVuIHdhcyAxNjo5IChhc3BlY3QgYWRqdXN0ZWQpOiAje0BhYUhlaWdodH1cIlxyXG4gICAgQHBhdXNlQnV0dG9uU2l6ZSA9IEBhYUhlaWdodCAvIDE1XHJcbiAgICBAY29sb3JzID1cclxuICAgICAgYXJyb3c6ICAgICAgeyByOiAgIDEsIGc6ICAgMSwgYjogICAxLCBhOiAgIDEgfVxyXG4gICAgICBhcnJvd2Nsb3NlOiB7IHI6ICAgMSwgZzogMC41LCBiOiAgIDAsIGE6IDAuMyB9XHJcbiAgICAgIGJhY2tncm91bmQ6IHsgcjogICAwLCBnOiAwLjIsIGI6ICAgMCwgYTogICAxIH1cclxuICAgICAgYmlkOiAgICAgICAgeyByOiAgIDAsIGc6IDAuNiwgYjogICAwLCBhOiAgIDEgfVxyXG4gICAgICBibGFjazogICAgICB7IHI6ICAgMCwgZzogICAwLCBiOiAgIDAsIGE6ICAgMSB9XHJcbiAgICAgIGJ1dHRvbnRleHQ6IHsgcjogICAxLCBnOiAgIDEsIGI6ICAgMSwgYTogICAxIH1cclxuICAgICAgZ2FtZV9vdmVyOiAgeyByOiAgIDEsIGc6IDAuNSwgYjogICAwLCBhOiAgIDEgfVxyXG4gICAgICBnb2xkOiAgICAgICB7IHI6ICAgMSwgZzogICAxLCBiOiAgIDAsIGE6ICAgMSB9XHJcbiAgICAgIGhhbmRfYW55OiAgIHsgcjogICAwLCBnOiAgIDAsIGI6IDAuMiwgYTogMS4wIH1cclxuICAgICAgaGFuZF9waWNrOiAgeyByOiAgIDAsIGc6IDAuMSwgYjogICAwLCBhOiAxLjAgfVxyXG4gICAgICBoYW5kX3Jlb3JnOiB7IHI6IDAuNCwgZzogICAwLCBiOiAgIDAsIGE6IDEuMCB9XHJcbiAgICAgIGxpZ2h0Z3JheTogIHsgcjogMC41LCBnOiAwLjUsIGI6IDAuNSwgYTogICAxIH1cclxuICAgICAgbG9nYmc6ICAgICAgeyByOiAwLjEsIGc6ICAgMCwgYjogICAwLCBhOiAgIDEgfVxyXG4gICAgICBsb2djb2xvcjogICB7IHI6IDAuNSwgZzogMC41LCBiOiAwLjUsIGE6ICAgMSB9XHJcbiAgICAgIG1haW5tZW51OiAgIHsgcjogMC4xLCBnOiAwLjEsIGI6IDAuMSwgYTogICAxIH1cclxuICAgICAgb3JhbmdlOiAgICAgeyByOiAgIDEsIGc6IDAuNSwgYjogICAwLCBhOiAgIDEgfVxyXG4gICAgICBvdmVybGF5OiAgICB7IHI6ICAgMCwgZzogICAwLCBiOiAgIDAsIGE6IDAuNiB9XHJcbiAgICAgIHBhdXNlbWVudTogIHsgcjogMC4xLCBnOiAwLjAsIGI6IDAuMSwgYTogICAxIH1cclxuICAgICAgcGlsZTogICAgICAgeyByOiAwLjQsIGc6IDAuMiwgYjogICAwLCBhOiAgIDEgfVxyXG4gICAgICBwbGF5X2FnYWluOiB7IHI6ICAgMCwgZzogICAwLCBiOiAgIDAsIGE6IDAuNiB9XHJcbiAgICAgIHJlZDogICAgICAgIHsgcjogICAxLCBnOiAgIDAsIGI6ICAgMCwgYTogICAxIH1cclxuICAgICAgd2hpdGU6ICAgICAgeyByOiAgIDEsIGc6ICAgMSwgYjogICAxLCBhOiAgIDEgfVxyXG4gICAgICBhY2hfYmc6ICAgICB7IHI6IDAuMSwgZzogMC4xLCBiOiAwLjEsIGE6ICAgMSB9XHJcbiAgICAgIGFjaF9oZWFkZXI6IHsgcjogICAxLCBnOiAwLjUsIGI6ICAgMCwgYTogICAxIH1cclxuICAgICAgYWNoX3RpdGxlOiAgeyByOiAgIDEsIGc6ICAgMSwgYjogICAxLCBhOiAgIDEgfVxyXG4gICAgICBhY2hfZGVzYzogICB7IHI6IDAuNywgZzogMC43LCBiOiAwLjcsIGE6ICAgMSB9XHJcblxyXG4gICAgQHRleHR1cmVzID1cclxuICAgICAgXCJjYXJkc1wiOiAwXHJcbiAgICAgIFwiZGFya2ZvcmVzdFwiOiAxXHJcbiAgICAgIFwiY2hhcnNcIjogMlxyXG4gICAgICBcImhvd3RvMVwiOiAzXHJcblxyXG4gICAgQHRoaXJ0ZWVuID0gbnVsbFxyXG4gICAgQGxhc3RFcnIgPSAnJ1xyXG4gICAgQHBhdXNlZCA9IGZhbHNlXHJcbiAgICBAcmVuZGVyTW9kZSA9IDAgIyAwID0gZ2FtZSwgMSA9IGhvd3RvLCAyID0gYWNoaWV2ZW1lbnRzLiB5ZXMsIEknbSBiZWluZyBsYXp5LlxyXG4gICAgQHJlbmRlckNvbW1hbmRzID0gW11cclxuICAgIEBhY2hpZXZlbWVudEZhbmZhcmUgPSBudWxsXHJcblxyXG4gICAgQG9wdGlvbk1lbnVzID1cclxuICAgICAgc3BlZWRzOiBbXHJcbiAgICAgICAgeyB0ZXh0OiBcIkFJIFNwZWVkOiBTbG93XCIsIHNwZWVkOiAyMDAwIH1cclxuICAgICAgICB7IHRleHQ6IFwiQUkgU3BlZWQ6IE1lZGl1bVwiLCBzcGVlZDogMTAwMCB9XHJcbiAgICAgICAgeyB0ZXh0OiBcIkFJIFNwZWVkOiBGYXN0XCIsIHNwZWVkOiA1MDAgfVxyXG4gICAgICAgIHsgdGV4dDogXCJBSSBTcGVlZDogVWx0cmFcIiwgc3BlZWQ6IDI1MCB9XHJcbiAgICAgIF1cclxuICAgICAgc29ydHM6IFtcclxuICAgICAgICB7IHRleHQ6IFwiU29ydCBPcmRlcjogTm9ybWFsXCIgfVxyXG4gICAgICAgIHsgdGV4dDogXCJTb3J0IE9yZGVyOiBSZXZlcnNlXCIgfVxyXG4gICAgICBdXHJcbiAgICBAb3B0aW9ucyA9XHJcbiAgICAgIHNwZWVkSW5kZXg6IDFcclxuICAgICAgc29ydEluZGV4OiAwXHJcbiAgICAgIHNvdW5kOiB0cnVlXHJcblxyXG4gICAgQHBhdXNlTWVudSA9IG5ldyBNZW51IHRoaXMsIFwiUGF1c2VkXCIsIFwic29saWRcIiwgQGNvbG9ycy5wYXVzZW1lbnUsIFtcclxuICAgICAgKGNsaWNrKSA9PlxyXG4gICAgICAgIGlmIGNsaWNrXHJcbiAgICAgICAgICBAcGF1c2VkID0gZmFsc2VcclxuICAgICAgICByZXR1cm4gXCJSZXN1bWUgR2FtZVwiXHJcbiAgICAgIChjbGljaykgPT5cclxuICAgICAgICBpZiBjbGlja1xyXG4gICAgICAgICAgQHJlbmRlck1vZGUgPSAyXHJcbiAgICAgICAgcmV0dXJuIFwiQWNoaWV2ZW1lbnRzXCJcclxuICAgICAgKGNsaWNrKSA9PlxyXG4gICAgICAgIGlmIGNsaWNrXHJcbiAgICAgICAgICBAcmVuZGVyTW9kZSA9IDFcclxuICAgICAgICByZXR1cm4gXCJIb3cgVG8gUGxheVwiXHJcbiAgICAgIChjbGljaykgPT5cclxuICAgICAgICBpZiBjbGlja1xyXG4gICAgICAgICAgQG9wdGlvbnMuc29ydEluZGV4ID0gKEBvcHRpb25zLnNvcnRJbmRleCArIDEpICUgQG9wdGlvbk1lbnVzLnNvcnRzLmxlbmd0aFxyXG4gICAgICAgIHJldHVybiBAb3B0aW9uTWVudXMuc29ydHNbQG9wdGlvbnMuc29ydEluZGV4XS50ZXh0XHJcbiAgICAgIChjbGljaykgPT5cclxuICAgICAgICBpZiBjbGlja1xyXG4gICAgICAgICAgQG9wdGlvbnMuc3BlZWRJbmRleCA9IChAb3B0aW9ucy5zcGVlZEluZGV4ICsgMSkgJSBAb3B0aW9uTWVudXMuc3BlZWRzLmxlbmd0aFxyXG4gICAgICAgIHJldHVybiBAb3B0aW9uTWVudXMuc3BlZWRzW0BvcHRpb25zLnNwZWVkSW5kZXhdLnRleHRcclxuICAgICAgKGNsaWNrKSA9PlxyXG4gICAgICAgIGlmIGNsaWNrXHJcbiAgICAgICAgICBAbmV3R2FtZSh0cnVlKVxyXG4gICAgICAgICAgQHBhdXNlZCA9IGZhbHNlXHJcbiAgICAgICAgcmV0dXJuIFwiTmV3IE1vbmV5IEdhbWVcIlxyXG4gICAgICAoY2xpY2spID0+XHJcbiAgICAgICAgaWYgY2xpY2tcclxuICAgICAgICAgIEBuZXdHYW1lKGZhbHNlKVxyXG4gICAgICAgICAgQHBhdXNlZCA9IGZhbHNlXHJcbiAgICAgICAgcmV0dXJuIFwiTmV3IEdhbWVcIlxyXG4gICAgXVxyXG5cclxuICAgIEB0aGlydGVlbiA9IG5ldyBUaGlydGVlbiB0aGlzLCB7fVxyXG4gICAgQGxvZyBcInBsYXllciAwJ3MgaGFuZDogXCIgKyBKU09OLnN0cmluZ2lmeShAdGhpcnRlZW4ucGxheWVyc1swXS5oYW5kKVxyXG4gICAgQHByZXBhcmVHYW1lKClcclxuXHJcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICMgbG9nZ2luZ1xyXG5cclxuICBsb2c6IChzKSAtPlxyXG4gICAgQG5hdGl2ZS5sb2cocylcclxuXHJcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICMgbG9hZCAvIHNhdmVcclxuXHJcbiAgbG9hZDogKGpzb24pIC0+XHJcbiAgICBAbG9nIFwiKENTKSBsb2FkaW5nIHN0YXRlXCJcclxuICAgIHRyeVxyXG4gICAgICBzdGF0ZSA9IEpTT04ucGFyc2UganNvblxyXG4gICAgY2F0Y2hcclxuICAgICAgQGxvZyBcImxvYWQgZmFpbGVkIHRvIHBhcnNlIHN0YXRlOiAje2pzb259XCJcclxuICAgICAgcmV0dXJuXHJcbiAgICBpZiBzdGF0ZS5vcHRpb25zXHJcbiAgICAgIGZvciBrLCB2IG9mIHN0YXRlLm9wdGlvbnNcclxuICAgICAgICBAb3B0aW9uc1trXSA9IHZcclxuXHJcbiAgICBpZiBzdGF0ZS50aGlydGVlblxyXG4gICAgICBAbG9nIFwicmVjcmVhdGluZyBnYW1lIGZyb20gc2F2ZWRhdGFcIlxyXG4gICAgICBAdGhpcnRlZW4gPSBuZXcgVGhpcnRlZW4gdGhpcywge1xyXG4gICAgICAgIHN0YXRlOiBzdGF0ZS50aGlydGVlblxyXG4gICAgICB9XHJcbiAgICAgIEBwcmVwYXJlR2FtZSgpXHJcblxyXG4gIHNhdmU6IC0+XHJcbiAgICAjIEBsb2cgXCIoQ1MpIHNhdmluZyBzdGF0ZVwiXHJcbiAgICBzdGF0ZSA9IHtcclxuICAgICAgb3B0aW9uczogQG9wdGlvbnNcclxuICAgIH1cclxuXHJcbiAgICBpZiBAdGhpcnRlZW4/XHJcbiAgICAgIEB0aGlydGVlbi51cGRhdGVQbGF5ZXJIYW5kKEBoYW5kLmNhcmRzKVxyXG4gICAgICBzdGF0ZS50aGlydGVlbiA9IEB0aGlydGVlbi5zYXZlKClcclxuXHJcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkgc3RhdGVcclxuXHJcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICBhaVRpY2tSYXRlOiAtPlxyXG4gICAgcmV0dXJuIEBvcHRpb25NZW51cy5zcGVlZHNbQG9wdGlvbnMuc3BlZWRJbmRleF0uc3BlZWRcclxuXHJcbiAgbmV3R2FtZTogKG1vbmV5KSAtPlxyXG4gICAgQHRoaXJ0ZWVuLm5ld0dhbWUobW9uZXkpXHJcbiAgICBAcHJlcGFyZUdhbWUoKVxyXG5cclxuICBwcmVwYXJlR2FtZTogLT5cclxuICAgIEBoYW5kID0gbmV3IEhhbmQgdGhpc1xyXG4gICAgQHBpbGUgPSBuZXcgUGlsZSB0aGlzLCBAaGFuZFxyXG4gICAgQGhhbmQuc2V0IEB0aGlydGVlbi5wbGF5ZXJzWzBdLmhhbmRcclxuICAgIEBsYXN0RXJyID0gJydcclxuXHJcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICMgaW5wdXQgaGFuZGxpbmdcclxuXHJcbiAgdG91Y2hEb3duOiAoeCwgeSkgLT5cclxuICAgICMgQGxvZyhcInRvdWNoRG93biAje3h9LCN7eX1cIilcclxuICAgIEBjaGVja1pvbmVzKHgsIHkpXHJcblxyXG4gIHRvdWNoTW92ZTogKHgsIHkpIC0+XHJcbiAgICAjIEBsb2coXCJ0b3VjaE1vdmUgI3t4fSwje3l9XCIpXHJcbiAgICBpZiBAdGhpcnRlZW4gIT0gbnVsbFxyXG4gICAgICBAaGFuZC5tb3ZlKHgsIHkpXHJcblxyXG4gIHRvdWNoVXA6ICh4LCB5KSAtPlxyXG4gICAgIyBAbG9nKFwidG91Y2hVcCAje3h9LCN7eX1cIilcclxuICAgIGlmIEB0aGlydGVlbiAhPSBudWxsXHJcbiAgICAgIEBoYW5kLnVwKHgsIHkpXHJcblxyXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAjIGhlYWRsaW5lIChnYW1lIHN0YXRlIGluIHRvcCBsZWZ0KVxyXG5cclxuICBwcmV0dHlFcnJvclRhYmxlOiB7XHJcbiAgICAgIGdhbWVPdmVyOiAgICAgICAgICAgXCJUaGUgZ2FtZSBpcyBvdmVyLlwiXHJcbiAgICAgIGludmFsaWRQbGF5OiAgICAgICAgXCJOb3QgYSB2YWxpZCBwbGF5LlwiXHJcbiAgICAgIG11c3RCcmVha09yUGFzczogICAgXCJZb3UgcGFzc2VkIGFscmVhZHksIHNvIDItYnJlYWtlciBvciBwYXNzLlwiXHJcbiAgICAgIG11c3RQYXNzOiAgICAgICAgICAgXCJZb3UgbXVzdCBwYXNzLlwiXHJcbiAgICAgIG11c3RUaHJvdzNTOiAgICAgICAgXCJZb3UgbXVzdCB1c2UgdGhlIDNcXHhjOCBpbiB5b3VyIHBsYXkuXCJcclxuICAgICAgbm90WW91clR1cm46ICAgICAgICBcIkl0IGlzIG5vdCB5b3VyIHR1cm4uXCJcclxuICAgICAgdGhyb3dBbnl0aGluZzogICAgICBcIllvdSBoYXZlIGNvbnRyb2wsIHRocm93IGFueXRoaW5nLlwiXHJcbiAgICAgIHRvb0xvd1BsYXk6ICAgICAgICAgXCJUaGlzIHBsYXkgaXMgbm90IHN0cm9uZ2VyIHRoYW4gdGhlIGN1cnJlbnQgcGxheS5cIlxyXG4gICAgICB3cm9uZ1BsYXk6ICAgICAgICAgIFwiVGhpcyBwbGF5IGRvZXMgbm90IG1hdGNoIHRoZSBjdXJyZW50IHBsYXkuXCJcclxuICB9XHJcblxyXG4gIHByZXR0eUVycm9yOiAtPlxyXG4gICAgcHJldHR5ID0gQHByZXR0eUVycm9yVGFibGVbQGxhc3RFcnJdXHJcbiAgICByZXR1cm4gcHJldHR5IGlmIHByZXR0eVxyXG4gICAgcmV0dXJuIEBsYXN0RXJyXHJcblxyXG4gIGNhbGNIZWFkbGluZTogLT5cclxuICAgIHJldHVybiBcIlwiIGlmIEB0aGlydGVlbiA9PSBudWxsXHJcblxyXG4gICAgaGVhZGxpbmUgPSBAdGhpcnRlZW4uaGVhZGxpbmUoKVxyXG4gICAgIyBzd2l0Y2ggQHRoaXJ0ZWVuLnN0YXRlXHJcbiAgICAjICAgd2hlbiBTdGF0ZS5CSURcclxuICAgICMgICAgIGhlYWRsaW5lID0gXCJXYWl0aW5nIGZvciBgZmY3NzAwYCN7QHRoaXJ0ZWVuLnBsYXllcnNbQHRoaXJ0ZWVuLnR1cm5dLm5hbWV9YGAgdG8gYGZmZmYwMGBiaWRgYFwiXHJcbiAgICAjICAgd2hlbiBTdGF0ZS5UUklDS1xyXG4gICAgIyAgICAgaGVhZGxpbmUgPSBcIldhaXRpbmcgZm9yIGBmZjc3MDBgI3tAdGhpcnRlZW4ucGxheWVyc1tAdGhpcnRlZW4udHVybl0ubmFtZX1gYCB0byBgZmZmZjAwYHBsYXlgYFwiXHJcbiAgICAjICAgd2hlbiBTdGF0ZS5ST1VORFNVTU1BUllcclxuICAgICMgICAgIGhlYWRsaW5lID0gXCJXYWl0aW5nIGZvciBuZXh0IHJvdW5kLi4uXCJcclxuICAgICMgICB3aGVuIFN0YXRlLlBPU1RHQU1FU1VNTUFSWVxyXG4gICAgIyAgICAgaGVhZGxpbmUgPSBcIkdhbWUgb3ZlciFcIlxyXG5cclxuICAgIGVyclRleHQgPSBcIlwiXHJcbiAgICBpZiAoQGxhc3RFcnIubGVuZ3RoID4gMCkgYW5kIChAbGFzdEVyciAhPSBPSylcclxuICAgICAgZXJyVGV4dCA9IFwiICBgZmZmZmZmYEVSUk9SOiBgZmYwMDAwYCN7QHByZXR0eUVycm9yKCl9XCJcclxuICAgICAgaGVhZGxpbmUgKz0gZXJyVGV4dFxyXG5cclxuICAgIHJldHVybiBoZWFkbGluZVxyXG5cclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgIyBnYW1lIG92ZXIgaW5mb3JtYXRpb25cclxuXHJcbiAgZ2FtZU92ZXJUZXh0OiAtPlxyXG4gICAgd2lubmVyID0gQHRoaXJ0ZWVuLndpbm5lcigpXHJcbiAgICBpZiB3aW5uZXIubmFtZSA9PSBcIlBsYXllclwiXHJcbiAgICAgIGlmIEB0aGlydGVlbi5sYXN0U3RyZWFrID09IDFcclxuICAgICAgICByZXR1cm4gW1wiWW91IHdpbiFcIiwgXCJBIG5ldyBzdHJlYWshXCJdXHJcbiAgICAgIHJldHVybiBbXCJZb3Ugd2luIVwiLCBcIiN7QHRoaXJ0ZWVuLmxhc3RTdHJlYWt9IGluIGEgcm93IVwiXVxyXG4gICAgaWYgQHRoaXJ0ZWVuLmxhc3RTdHJlYWsgPT0gMFxyXG4gICAgICByZXR1cm4gW1wiI3t3aW5uZXIubmFtZX0gd2lucyFcIiwgXCJUcnkgYWdhaW4uLi5cIl1cclxuICAgIHJldHVybiBbXCIje3dpbm5lci5uYW1lfSB3aW5zIVwiLCBcIlN0cmVhayBlbmRlZDogI3tAdGhpcnRlZW4ubGFzdFN0cmVha30gd2luc1wiXVxyXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAjIGNhcmQgaGFuZGxpbmdcclxuXHJcbiAgcGFzczogLT5cclxuICAgIEBsYXN0RXJyID0gQHRoaXJ0ZWVuLnBhc3Mge1xyXG4gICAgICBpZDogMVxyXG4gICAgfVxyXG5cclxuICBwbGF5OiAoY2FyZHMpIC0+XHJcbiAgICBjb25zb2xlLmxvZyBcIihnYW1lKSBwbGF5aW5nIGNhcmRzXCIsIGNhcmRzXHJcblxyXG4gICAgQHRoaXJ0ZWVuLnVwZGF0ZVBsYXllckhhbmQoQGhhbmQuY2FyZHMpXHJcblxyXG4gICAgcmF3Q2FyZHMgPSBbXVxyXG4gICAgZm9yIGNhcmQgaW4gY2FyZHNcclxuICAgICAgcmF3Q2FyZHMucHVzaCBjYXJkLmNhcmRcclxuXHJcbiAgICByZXQgPSBAdGhpcnRlZW4ucGxheSB7XHJcbiAgICAgIGlkOiAxXHJcbiAgICAgIGNhcmRzOiByYXdDYXJkc1xyXG4gICAgfVxyXG4gICAgQGxhc3RFcnIgPSByZXRcclxuICAgIGlmIHJldCA9PSBPS1xyXG4gICAgICBAaGFuZC5zZXQgQHRoaXJ0ZWVuLnBsYXllcnNbMF0uaGFuZFxyXG4gICAgICBAcGlsZS5oaW50IGNhcmRzXHJcblxyXG4gIHBsYXlQaWNrZWQ6IC0+XHJcbiAgICBpZiBub3QgQGhhbmQucGlja2luZ1xyXG4gICAgICByZXR1cm5cclxuICAgIGNhcmRzID0gQGhhbmQuc2VsZWN0ZWRDYXJkcygpXHJcbiAgICBAaGFuZC5zZWxlY3ROb25lKClcclxuICAgIGlmIGNhcmRzLmxlbmd0aCA9PSAwXHJcbiAgICAgIHJldHVybiBAcGFzcygpXHJcbiAgICAjIEBoYW5kLnRvZ2dsZVBpY2tpbmcoKVxyXG4gICAgcmV0dXJuIEBwbGF5KGNhcmRzKVxyXG5cclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgIyBtYWluIGxvb3BcclxuXHJcbiAgdXBkYXRlOiAoZHQpIC0+XHJcbiAgICBAem9uZXMubGVuZ3RoID0gMCAjIGZvcmdldCBhYm91dCB6b25lcyBmcm9tIHRoZSBsYXN0IGZyYW1lLiB3ZSdyZSBhYm91dCB0byBtYWtlIHNvbWUgbmV3IG9uZXMhXHJcblxyXG4gICAgdXBkYXRlZCA9IGZhbHNlXHJcbiAgICBpZiBAdXBkYXRlR2FtZShkdClcclxuICAgICAgdXBkYXRlZCA9IHRydWVcclxuXHJcbiAgICByZXR1cm4gdXBkYXRlZFxyXG5cclxuICB1cGRhdGVHYW1lOiAoZHQpIC0+XHJcbiAgICByZXR1cm4gZmFsc2UgaWYgQHRoaXJ0ZWVuID09IG51bGxcclxuXHJcbiAgICB1cGRhdGVkID0gZmFsc2VcclxuXHJcbiAgICBpZiBAcGlsZS51cGRhdGUoZHQpXHJcbiAgICAgIHVwZGF0ZWQgPSB0cnVlXHJcbiAgICBpZiBAcGlsZS5yZWFkeUZvck5leHRUcmljaygpXHJcbiAgICAgIEBuZXh0QUlUaWNrIC09IGR0XHJcbiAgICAgIGlmIEBuZXh0QUlUaWNrIDw9IDBcclxuICAgICAgICBAbmV4dEFJVGljayA9IEBhaVRpY2tSYXRlKClcclxuICAgICAgICBpZiBAdGhpcnRlZW4uYWlUaWNrKClcclxuICAgICAgICAgIHVwZGF0ZWQgPSB0cnVlXHJcbiAgICBpZiBAaGFuZC51cGRhdGUoZHQpXHJcbiAgICAgIHVwZGF0ZWQgPSB0cnVlXHJcblxyXG4gICAgQHBpbGUuc2V0IEB0aGlydGVlbi50aHJvd0lELCBAdGhpcnRlZW4ucGlsZSwgQHRoaXJ0ZWVuLnBpbGVXaG9cclxuXHJcbiAgICBpZiBAcGF1c2VNZW51LnVwZGF0ZShkdClcclxuICAgICAgdXBkYXRlZCA9IHRydWVcclxuXHJcbiAgICBpZiBAYWNoaWV2ZW1lbnRGYW5mYXJlICE9IG51bGxcclxuICAgICAgQGFjaGlldmVtZW50RmFuZmFyZS50aW1lICs9IGR0XHJcbiAgICAgIGlmIEBhY2hpZXZlbWVudEZhbmZhcmUudGltZSA+IDUwMDBcclxuICAgICAgICBAYWNoaWV2ZW1lbnRGYW5mYXJlID0gbnVsbFxyXG4gICAgICB1cGRhdGVkID0gdHJ1ZVxyXG5cclxuICAgIGlmIEBhY2hpZXZlbWVudEZhbmZhcmUgPT0gbnVsbFxyXG4gICAgICBpZiBAdGhpcnRlZW4uZmFuZmFyZXMubGVuZ3RoID4gMFxyXG4gICAgICAgIEBhY2hpZXZlbWVudEZhbmZhcmUgPVxyXG4gICAgICAgICAgdGl0bGU6IEB0aGlydGVlbi5mYW5mYXJlcy5zaGlmdCgpXHJcbiAgICAgICAgICB0aW1lOiAwXHJcblxyXG4gICAgcmV0dXJuIHVwZGF0ZWRcclxuXHJcbiAgcmVuZGVyOiAtPlxyXG4gICAgIyBSZXNldCByZW5kZXIgY29tbWFuZHNcclxuICAgIEByZW5kZXJDb21tYW5kcy5sZW5ndGggPSAwXHJcblxyXG4gICAgaWYgQHJlbmRlck1vZGUgPT0gMVxyXG4gICAgICBAcmVuZGVySG93dG8oKVxyXG4gICAgZWxzZSBpZiBAcmVuZGVyTW9kZSA9PSAyXHJcbiAgICAgIEByZW5kZXJBY2hpZXZlbWVudHMoKVxyXG4gICAgZWxzZVxyXG4gICAgICBAcmVuZGVyR2FtZSgpXHJcblxyXG4gICAgcmV0dXJuIEByZW5kZXJDb21tYW5kc1xyXG5cclxuICByZW5kZXJIb3d0bzogLT5cclxuICAgIGhvd3RvVGV4dHVyZSA9IFwiaG93dG8xXCJcclxuICAgIEBsb2cgXCJyZW5kZXJpbmcgI3tob3d0b1RleHR1cmV9XCJcclxuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJzb2xpZFwiLCAwLCAwLCBAd2lkdGgsIEBoZWlnaHQsIDAsIDAsIDAsIEBjb2xvcnMuYmxhY2tcclxuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgaG93dG9UZXh0dXJlLCAwLCAwLCBAd2lkdGgsIEBhYUhlaWdodCwgMCwgMCwgMCwgQGNvbG9ycy53aGl0ZSwgPT5cclxuICAgICAgQHJlbmRlck1vZGUgPSAwXHJcblxyXG4gIGRlYnVnOiAtPlxyXG4gICAgY29uc29sZS5sb2cgXCJkZWJ1ZyBhY2hcIlxyXG4gICAgY29uc29sZS5sb2cgQHRoaXJ0ZWVuLmFjaFxyXG4gICAgIyBAdGhpcnRlZW4uYWNoLmVhcm5lZCA9IHt9XHJcbiAgICAjIEB0aGlydGVlbi5hY2guZWFybmVkLnZldGVyYW4gPSB0cnVlXHJcbiAgICAjIEB0aGlydGVlbi5hY2guZWFybmVkLnRyeWhhcmQgPSB0cnVlXHJcbiAgICAjIEB0aGlydGVlbi5hY2guZWFybmVkLmJyZWFrZXIgPSB0cnVlXHJcbiAgICAjIEB0aGlydGVlbi5hY2guZWFybmVkLmtlZXBpdGxvdyA9IHRydWVcclxuICAgICMgQHRoaXJ0ZWVuLmFjaC5lYXJuZWQuc3VpdGVkID0gdHJ1ZVxyXG4gICAgIyBAdGhpcnRlZW4uYWNoLmVhcm5lZC50b255ID0gdHJ1ZVxyXG4gICAgIyBAdGhpcnRlZW4uYWNoLmVhcm5lZC5zYW1wbGVyID0gdHJ1ZVxyXG4gICAgIyBAdGhpcnRlZW4uYWNoLmVhcm5lZC50cmFnZWR5ID0gdHJ1ZVxyXG4gICAgIyBAdGhpcnRlZW4uYWNoLmVhcm5lZC5pbmRvbWl0YWJsZSA9IHRydWVcclxuICAgICMgQHRoaXJ0ZWVuLmFjaC5lYXJuZWQucmVrdCA9IHRydWVcclxuICAgICMgQHRoaXJ0ZWVuLmFjaC5lYXJuZWQubGF0ZSA9IHRydWVcclxuICAgICMgQHRoaXJ0ZWVuLmFjaC5lYXJuZWQucGFpcnMgPSB0cnVlXHJcblxyXG4gICAgIyBAdGhpcnRlZW4uYWNoLnN0YXRlLnRvdGFsR2FtZXMgPSAwXHJcbiAgICAjIEB0aGlydGVlbi5zdHJlYWsgPSAwXHJcblxyXG4gIHJlbmRlckFjaGlldmVtZW50czogLT5cclxuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJzb2xpZFwiLCAwLCAwLCBAd2lkdGgsIEBoZWlnaHQsIDAsIDAsIDAsIEBjb2xvcnMuYWNoX2JnLCA9PlxyXG4gICAgICBAcmVuZGVyTW9kZSA9IDBcclxuXHJcbiAgICB0aXRsZUhlaWdodCA9IEBoZWlnaHQgLyAyMFxyXG4gICAgdGl0bGVPZmZzZXQgPSB0aXRsZUhlaWdodCAvIDJcclxuICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCB0aXRsZUhlaWdodCwgXCJBY2hpZXZlbWVudHNcIiwgQGNlbnRlci54LCB0aXRsZU9mZnNldCwgMC41LCAwLjUsIEBjb2xvcnMuYWNoX2hlYWRlclxyXG5cclxuICAgIGltYWdlTWFyZ2luID0gQHdpZHRoIC8gMTVcclxuICAgIHRvcEhlaWdodCA9IHRpdGxlSGVpZ2h0XHJcbiAgICB4ID0gQHdpZHRoIC8gMTIwXHJcbiAgICB5ID0gdG9wSGVpZ2h0XHJcbiAgICB0aXRsZUhlaWdodCA9IEBoZWlnaHQgLyAyMlxyXG4gICAgZGVzY0hlaWdodCA9IEBoZWlnaHQgLyAzMFxyXG4gICAgaW1hZ2VEaW0gPSB0aXRsZUhlaWdodCAqIDJcclxuICAgIGZvciBhY2gsIGFjaEluZGV4IGluIGFjaGlldmVtZW50c0xpc3RcclxuICAgICAgaWNvbiA9IFwic3Rhcl9vZmZcIlxyXG4gICAgICBpZiBAdGhpcnRlZW4uYWNoLmVhcm5lZFthY2guaWRdXHJcbiAgICAgICAgaWNvbiA9IFwic3Rhcl9vblwiXHJcbiAgICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgaWNvbiwgeCwgeSwgaW1hZ2VEaW0sIGltYWdlRGltLCAwLCAwLCAwLCBAY29sb3JzLndoaXRlXHJcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCB0aXRsZUhlaWdodCwgYWNoLnRpdGxlLCB4ICsgaW1hZ2VNYXJnaW4sIHksIDAsIDAsIEBjb2xvcnMuYWNoX3RpdGxlXHJcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCBkZXNjSGVpZ2h0LCBhY2guZGVzY3JpcHRpb25bMF0sIHggKyBpbWFnZU1hcmdpbiwgeSArIHRpdGxlSGVpZ2h0LCAwLCAwLCBAY29sb3JzLmFjaF9kZXNjXHJcbiAgICAgIGlmIGFjaC5wcm9ncmVzcz9cclxuICAgICAgICBwcm9ncmVzcyA9IGFjaC5wcm9ncmVzcyhAdGhpcnRlZW4uYWNoKVxyXG4gICAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCBkZXNjSGVpZ2h0LCBwcm9ncmVzcywgeCArIGltYWdlTWFyZ2luLCB5ICsgdGl0bGVIZWlnaHQgKyBkZXNjSGVpZ2h0LCAwLCAwLCBAY29sb3JzLmFjaF9kZXNjXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBpZiBhY2guZGVzY3JpcHRpb24ubGVuZ3RoID4gMVxyXG4gICAgICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIGRlc2NIZWlnaHQsIGFjaC5kZXNjcmlwdGlvblsxXSwgeCArIGltYWdlTWFyZ2luLCB5ICsgdGl0bGVIZWlnaHQgKyBkZXNjSGVpZ2h0LCAwLCAwLCBAY29sb3JzLmFjaF9kZXNjXHJcbiAgICAgIGlmIGFjaEluZGV4ID09IDZcclxuICAgICAgICB5ID0gdG9wSGVpZ2h0XHJcbiAgICAgICAgeCArPSBAd2lkdGggLyAyXHJcbiAgICAgIGVsc2VcclxuICAgICAgICB5ICs9IHRpdGxlSGVpZ2h0ICogM1xyXG5cclxuICByZW5kZXJHYW1lOiAtPlxyXG5cclxuICAgICMgYmFja2dyb3VuZFxyXG4gICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcInNvbGlkXCIsIDAsIDAsIEB3aWR0aCwgQGhlaWdodCwgMCwgMCwgMCwgQGNvbG9ycy5iYWNrZ3JvdW5kXHJcblxyXG4gICAgdGV4dEhlaWdodCA9IEBhYUhlaWdodCAvIDI1XHJcbiAgICB0ZXh0UGFkZGluZyA9IHRleHRIZWlnaHQgLyA1XHJcbiAgICBjaGFyYWN0ZXJIZWlnaHQgPSBAYWFIZWlnaHQgLyA1XHJcbiAgICBjb3VudEhlaWdodCA9IHRleHRIZWlnaHRcclxuXHJcbiAgICBkcmF3R2FtZU92ZXIgPSBAdGhpcnRlZW4uZ2FtZU92ZXIoKSBhbmQgQHBpbGUucmVzdGluZygpXHJcblxyXG4gICAgIyBMb2dcclxuICAgIGZvciBsaW5lLCBpIGluIEB0aGlydGVlbi5sb2dcclxuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIHRleHRIZWlnaHQsIGxpbmUsIDAsIChpKzEuNSkgKiAodGV4dEhlaWdodCArIHRleHRQYWRkaW5nKSwgMCwgMCwgQGNvbG9ycy5sb2djb2xvclxyXG5cclxuICAgIGFpUGxheWVycyA9IFtcclxuICAgICAgQHRoaXJ0ZWVuLnBsYXllcnNbMV1cclxuICAgICAgQHRoaXJ0ZWVuLnBsYXllcnNbMl1cclxuICAgICAgQHRoaXJ0ZWVuLnBsYXllcnNbM11cclxuICAgIF1cclxuXHJcbiAgICBjaGFyYWN0ZXJNYXJnaW4gPSBjaGFyYWN0ZXJIZWlnaHQgLyAyXHJcbiAgICBAY2hhckNlaWxpbmcgPSBAaGVpZ2h0ICogMC42XHJcblxyXG4gICAgIyBsZWZ0IHNpZGVcclxuICAgIGlmIGFpUGxheWVyc1swXSAhPSBudWxsXHJcbiAgICAgIGNoYXJhY3RlciA9IGFpQ2hhcmFjdGVyc1thaVBsYXllcnNbMF0uY2hhcklEXVxyXG4gICAgICBjaGFyYWN0ZXJXaWR0aCA9IEBzcHJpdGVSZW5kZXJlci5jYWxjV2lkdGgoY2hhcmFjdGVyLnNwcml0ZSwgY2hhcmFjdGVySGVpZ2h0KVxyXG4gICAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIGNoYXJhY3Rlci5zcHJpdGUsIGNoYXJhY3Rlck1hcmdpbiwgQGNoYXJDZWlsaW5nLCAwLCBjaGFyYWN0ZXJIZWlnaHQsIDAsIDAsIDEsIEBjb2xvcnMud2hpdGUsID0+XHJcbiAgICAgICAgIyBAZGVidWcoKVxyXG4gICAgICBAcmVuZGVyQ291bnQgYWlQbGF5ZXJzWzBdLCBAdGhpcnRlZW4ubW9uZXksIGRyYXdHYW1lT3ZlciwgYWlQbGF5ZXJzWzBdLmluZGV4ID09IEB0aGlydGVlbi50dXJuLCBjb3VudEhlaWdodCwgY2hhcmFjdGVyTWFyZ2luICsgKGNoYXJhY3RlcldpZHRoIC8gMiksIEBjaGFyQ2VpbGluZyAtIHRleHRQYWRkaW5nLCAwLjUsIDBcclxuXHJcbiAgICAjIHRvcCBzaWRlXHJcbiAgICBpZiBhaVBsYXllcnNbMV0gIT0gbnVsbFxyXG4gICAgICBjaGFyYWN0ZXIgPSBhaUNoYXJhY3RlcnNbYWlQbGF5ZXJzWzFdLmNoYXJJRF1cclxuICAgICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBjaGFyYWN0ZXIuc3ByaXRlLCBAY2VudGVyLngsIDAsIDAsIGNoYXJhY3RlckhlaWdodCwgMCwgMC41LCAwLCBAY29sb3JzLndoaXRlXHJcbiAgICAgIEByZW5kZXJDb3VudCBhaVBsYXllcnNbMV0sIEB0aGlydGVlbi5tb25leSwgZHJhd0dhbWVPdmVyLCBhaVBsYXllcnNbMV0uaW5kZXggPT0gQHRoaXJ0ZWVuLnR1cm4sIGNvdW50SGVpZ2h0LCBAY2VudGVyLngsIGNoYXJhY3RlckhlaWdodCwgMC41LCAwXHJcblxyXG4gICAgIyByaWdodCBzaWRlXHJcbiAgICBpZiBhaVBsYXllcnNbMl0gIT0gbnVsbFxyXG4gICAgICBjaGFyYWN0ZXIgPSBhaUNoYXJhY3RlcnNbYWlQbGF5ZXJzWzJdLmNoYXJJRF1cclxuICAgICAgY2hhcmFjdGVyV2lkdGggPSBAc3ByaXRlUmVuZGVyZXIuY2FsY1dpZHRoKGNoYXJhY3Rlci5zcHJpdGUsIGNoYXJhY3RlckhlaWdodClcclxuICAgICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBjaGFyYWN0ZXIuc3ByaXRlLCBAd2lkdGggLSBjaGFyYWN0ZXJNYXJnaW4sIEBjaGFyQ2VpbGluZywgMCwgY2hhcmFjdGVySGVpZ2h0LCAwLCAxLCAxLCBAY29sb3JzLndoaXRlXHJcbiAgICAgIEByZW5kZXJDb3VudCBhaVBsYXllcnNbMl0sIEB0aGlydGVlbi5tb25leSwgZHJhd0dhbWVPdmVyLCBhaVBsYXllcnNbMl0uaW5kZXggPT0gQHRoaXJ0ZWVuLnR1cm4sIGNvdW50SGVpZ2h0LCBAd2lkdGggLSAoY2hhcmFjdGVyTWFyZ2luICsgKGNoYXJhY3RlcldpZHRoIC8gMikpLCBAY2hhckNlaWxpbmcgLSB0ZXh0UGFkZGluZywgMC41LCAwXHJcblxyXG4gICAgIyBjYXJkIGFyZWFcclxuICAgIGhhbmRBcmVhSGVpZ2h0ID0gMC4yNyAqIEBoZWlnaHRcclxuICAgIGNhcmRBcmVhVGV4dCA9IG51bGxcclxuICAgIGlmIEBoYW5kLnBpY2tpbmdcclxuICAgICAgaGFuZGFyZWFDb2xvciA9IEBjb2xvcnMuaGFuZF9waWNrXHJcbiAgICAgIGlmIChAdGhpcnRlZW4udHVybiA9PSAwKSBhbmQgKEB0aGlydGVlbi5ldmVyeW9uZVBhc3NlZCgpIG9yIChAdGhpcnRlZW4uY3VycmVudFBsYXkgPT0gbnVsbCkpXHJcbiAgICAgICAgaGFuZGFyZWFDb2xvciA9IEBjb2xvcnMuaGFuZF9hbnlcclxuICAgICAgICBpZiBAdGhpcnRlZW4ucGlsZS5sZW5ndGggPT0gMFxyXG4gICAgICAgICAgY2FyZEFyZWFUZXh0ID0gJ0FueXRoaW5nICgzXFx4YzgpJ1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIGNhcmRBcmVhVGV4dCA9ICdBbnl0aGluZydcclxuICAgIGVsc2VcclxuICAgICAgY2FyZEFyZWFUZXh0ID0gJ1VubG9ja2VkJ1xyXG4gICAgICBoYW5kYXJlYUNvbG9yID0gQGNvbG9ycy5oYW5kX3Jlb3JnXHJcbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwic29saWRcIiwgMCwgQGhlaWdodCwgQHdpZHRoLCBoYW5kQXJlYUhlaWdodCwgMCwgMCwgMSwgaGFuZGFyZWFDb2xvciwgPT5cclxuICAgICAgQGhhbmQudG9nZ2xlUGlja2luZygpXHJcblxyXG4gICAgIyBwaWxlXHJcbiAgICBwaWxlRGltZW5zaW9uID0gQGhlaWdodCAqIDAuNFxyXG4gICAgcGlsZVNwcml0ZSA9IFwicGlsZVwiXHJcbiAgICBpZiAoQHRoaXJ0ZWVuLnR1cm4gPj0gMCkgYW5kIChAdGhpcnRlZW4udHVybiA8PSAzKVxyXG4gICAgICBwaWxlU3ByaXRlICs9IEB0aGlydGVlbi50dXJuXHJcbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIHBpbGVTcHJpdGUsIEB3aWR0aCAvIDIsIEBoZWlnaHQgLyAyLCBwaWxlRGltZW5zaW9uLCBwaWxlRGltZW5zaW9uLCAwLCAwLjUsIDAuNSwgQGNvbG9ycy53aGl0ZSwgPT5cclxuICAgICAgQHBsYXlQaWNrZWQoKVxyXG4gICAgQHBpbGUucmVuZGVyKClcclxuXHJcbiAgICBAaGFuZC5yZW5kZXIoKVxyXG5cclxuICAgIGlmIGRyYXdHYW1lT3ZlclxyXG4gICAgICAjIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJzb2xpZFwiLCAwLCAwLCBAd2lkdGgsIEBoZWlnaHQgLSBoYW5kQXJlYUhlaWdodCwgMCwgMCwgMCwgQGNvbG9ycy5wbGF5X2FnYWluXHJcblxyXG4gICAgICBsaW5lcyA9IEBnYW1lT3ZlclRleHQoKVxyXG4gICAgICBnYW1lT3ZlclNpemUgPSBAYWFIZWlnaHQgLyA4XHJcbiAgICAgIGdhbWVPdmVyWSA9IEBjZW50ZXIueVxyXG4gICAgICBpZiBsaW5lcy5sZW5ndGggPiAxXHJcbiAgICAgICAgZ2FtZU92ZXJZIC09IChnYW1lT3ZlclNpemUgPj4gMSlcclxuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIGdhbWVPdmVyU2l6ZSwgbGluZXNbMF0sIEBjZW50ZXIueCwgZ2FtZU92ZXJZLCAwLjUsIDAuNSwgQGNvbG9ycy5nYW1lX292ZXJcclxuICAgICAgaWYgbGluZXMubGVuZ3RoID4gMVxyXG4gICAgICAgIGdhbWVPdmVyWSArPSBnYW1lT3ZlclNpemVcclxuICAgICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgZ2FtZU92ZXJTaXplLCBsaW5lc1sxXSwgQGNlbnRlci54LCBnYW1lT3ZlclksIDAuNSwgMC41LCBAY29sb3JzLmdhbWVfb3ZlclxyXG5cclxuICAgICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcInNvbGlkXCIsIDAsIEBoZWlnaHQsIEB3aWR0aCwgaGFuZEFyZWFIZWlnaHQsIDAsIDAsIDEsIEBjb2xvcnMucGxheV9hZ2FpbiwgPT5cclxuICAgICAgICBAdGhpcnRlZW4uZGVhbCgpXHJcbiAgICAgICAgQHByZXBhcmVHYW1lKClcclxuXHJcbiAgICAgIHJlc3RhcnRRdWl0U2l6ZSA9IEBhYUhlaWdodCAvIDEyXHJcbiAgICAgIHNoYWRvd0Rpc3RhbmNlID0gcmVzdGFydFF1aXRTaXplIC8gOFxyXG4gICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgcmVzdGFydFF1aXRTaXplLCBcIlBsYXkgQWdhaW5cIiwgc2hhZG93RGlzdGFuY2UgKyBAY2VudGVyLngsIHNoYWRvd0Rpc3RhbmNlICsgKEBoZWlnaHQgLSAoaGFuZEFyZWFIZWlnaHQgKiAwLjUpKSwgMC41LCAxLCBAY29sb3JzLmJsYWNrXHJcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCByZXN0YXJ0UXVpdFNpemUsIFwiUGxheSBBZ2FpblwiLCBAY2VudGVyLngsIEBoZWlnaHQgLSAoaGFuZEFyZWFIZWlnaHQgKiAwLjUpLCAwLjUsIDEsIEBjb2xvcnMuZ29sZFxyXG5cclxuICAgIEByZW5kZXJDb3VudCBAdGhpcnRlZW4ucGxheWVyc1swXSwgQHRoaXJ0ZWVuLm1vbmV5LCBkcmF3R2FtZU92ZXIsIDAgPT0gQHRoaXJ0ZWVuLnR1cm4sIGNvdW50SGVpZ2h0LCBAY2VudGVyLngsIEBoZWlnaHQsIDAuNSwgMVxyXG5cclxuICAgICMgSGVhZGxpbmUgKGluY2x1ZGVzIGVycm9yKVxyXG4gICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIHRleHRIZWlnaHQsIEBjYWxjSGVhZGxpbmUoKSwgMCwgMCwgMCwgMCwgQGNvbG9ycy5saWdodGdyYXlcclxuXHJcbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwicGF1c2VcIiwgQHdpZHRoLCAwLCAwLCBAcGF1c2VCdXR0b25TaXplLCAwLCAxLCAwLCBAY29sb3JzLndoaXRlLCA9PlxyXG4gICAgICBAcGF1c2VkID0gdHJ1ZVxyXG5cclxuICAgIGlmIGNhcmRBcmVhVGV4dCAhPSBudWxsXHJcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCB0ZXh0SGVpZ2h0LCBjYXJkQXJlYVRleHQsIDAuMDIgKiBAd2lkdGgsIEBoZWlnaHQgLSBoYW5kQXJlYUhlaWdodCwgMCwgMCwgQGNvbG9ycy53aGl0ZVxyXG5cclxuICAgIGlmIEBhY2hpZXZlbWVudEZhbmZhcmUgIT0gbnVsbFxyXG4gICAgICBpZiBAYWNoaWV2ZW1lbnRGYW5mYXJlLnRpbWUgPCAxMDAwXHJcbiAgICAgICAgb3BhY2l0eSA9IEBhY2hpZXZlbWVudEZhbmZhcmUudGltZSAvIDEwMDBcclxuICAgICAgZWxzZSBpZiBAYWNoaWV2ZW1lbnRGYW5mYXJlLnRpbWUgPiA0MDAwXHJcbiAgICAgICAgb3BhY2l0eSA9IDEgLSAoKEBhY2hpZXZlbWVudEZhbmZhcmUudGltZSAtIDQwMDApIC8gMTAwMClcclxuICAgICAgZWxzZVxyXG4gICAgICAgIG9wYWNpdHkgPSAxXHJcbiAgICAgIGNvbG9yID0ge3I6MSwgZzoxLCBiOjEsIGE6b3BhY2l0eX1cclxuICAgICAgeCA9IEB3aWR0aCAqIDAuNlxyXG4gICAgICB5ID0gMFxyXG4gICAgICB4VGV4dCA9IHggKyAoQHdpZHRoICogMC4wNilcclxuICAgICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcImF1XCIsIHgsIHksIDAsIEBoZWlnaHQgLyAxMCwgMCwgMCwgMCwgY29sb3IsID0+XHJcbiAgICAgICAgQGFjaGlldmVtZW50RmFuZmFyZSA9IG51bGxcclxuICAgICAgICBAcmVuZGVyTW9kZSA9IDJcclxuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIHRleHRIZWlnaHQsIFwiQWNoaWV2ZW1lbnQgRWFybmVkXCIsIHhUZXh0LCB5LCAwLCAwLCBjb2xvclxyXG4gICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgdGV4dEhlaWdodCwgQGFjaGlldmVtZW50RmFuZmFyZS50aXRsZSwgeFRleHQsIHkgKyB0ZXh0SGVpZ2h0LCAwLCAwLCBjb2xvclxyXG5cclxuICAgIGlmIEBwYXVzZWRcclxuICAgICAgQHBhdXNlTWVudS5yZW5kZXIoKVxyXG5cclxuICAgIHJldHVyblxyXG5cclxuICByZW5kZXJDb3VudDogKHBsYXllciwgbW9uZXksIGRyYXdHYW1lT3ZlciwgbXlUdXJuLCBjb3VudEhlaWdodCwgeCwgeSwgYW5jaG9yeCwgYW5jaG9yeSkgLT5cclxuICAgIGlmIG15VHVyblxyXG4gICAgICBuYW1lQ29sb3IgPSBcImBmZjc3MDBgXCJcclxuICAgIGVsc2VcclxuICAgICAgbmFtZUNvbG9yID0gXCJcIlxyXG4gICAgbmFtZVN0cmluZyA9IFwiICN7bmFtZUNvbG9yfSN7cGxheWVyLm5hbWV9YGBcIlxyXG4gICAgaWYgbW9uZXlcclxuICAgICAgcGxheWVyLm1vbmV5ID89IDBcclxuICAgICAgbmFtZVN0cmluZyArPSBcIjogJCBgYWFmZmFhYCN7cGxheWVyLm1vbmV5fVwiXHJcbiAgICBuYW1lU3RyaW5nICs9IFwiIFwiXHJcbiAgICBjYXJkQ291bnQgPSBwbGF5ZXIuaGFuZC5sZW5ndGhcclxuICAgIGlmIGRyYXdHYW1lT3ZlciBvciAoY2FyZENvdW50ID09IDApXHJcbiAgICAgIGlmIG1vbmV5XHJcbiAgICAgICAgcGxhY2VTdHJpbmcgPSBcIjR0aFwiXHJcbiAgICAgICAgaWYgcGxheWVyLnBsYWNlID09IDFcclxuICAgICAgICAgIHBsYWNlU3RyaW5nID0gXCIxc3RcIlxyXG4gICAgICAgIGVsc2UgaWYgcGxheWVyLnBsYWNlID09IDJcclxuICAgICAgICAgIHBsYWNlU3RyaW5nID0gXCIybmRcIlxyXG4gICAgICAgIGVsc2UgaWYgcGxheWVyLnBsYWNlID09IDNcclxuICAgICAgICAgIHBsYWNlU3RyaW5nID0gXCIzcmRcIlxyXG4gICAgICAgIGNvdW50U3RyaW5nID0gXCIgYGZmYWFmZmAje3BsYWNlU3RyaW5nfWBgIFBsYWNlIFwiXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBpZiBwbGF5ZXIucGxhY2UgPT0gMVxyXG4gICAgICAgICAgY291bnRTdHJpbmcgPSBcIiBgZmZmZmFhYFdpbm5lcmBgIFwiXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgY291bnRTdHJpbmcgPSBcIiBgZmZhYWZmYExvc2VyYGAgXCJcclxuICAgIGVsc2VcclxuICAgICAgY291bnRTdHJpbmcgPSBcIiBgZmZmZjMzYCN7Y2FyZENvdW50fWBgIGxlZnQgXCJcclxuXHJcbiAgICBuYW1lU2l6ZSA9IEBmb250UmVuZGVyZXIuc2l6ZShAZm9udCwgY291bnRIZWlnaHQsIG5hbWVTdHJpbmcpXHJcbiAgICBjb3VudFNpemUgPSBAZm9udFJlbmRlcmVyLnNpemUoQGZvbnQsIGNvdW50SGVpZ2h0LCBjb3VudFN0cmluZylcclxuICAgIGlmIG5hbWVTaXplLncgPiBjb3VudFNpemUud1xyXG4gICAgICBjb3VudFNpemUudyA9IG5hbWVTaXplLndcclxuICAgIGVsc2VcclxuICAgICAgbmFtZVNpemUudyA9IGNvdW50U2l6ZS53XHJcbiAgICBuYW1lWSA9IHlcclxuICAgIGNvdW50WSA9IHlcclxuICAgIGJveEhlaWdodCA9IGNvdW50U2l6ZS5oXHJcbiAgICBpZiB0cnVlICMgcGxheWVyLmlkICE9IDFcclxuICAgICAgYm94SGVpZ2h0ICo9IDJcclxuICAgICAgaWYgYW5jaG9yeSA+IDBcclxuICAgICAgICBuYW1lWSAtPSBjb3VudEhlaWdodFxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgY291bnRZICs9IGNvdW50SGVpZ2h0XHJcbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwic29saWRcIiwgeCwgeSwgY291bnRTaXplLncsIGJveEhlaWdodCwgMCwgYW5jaG9yeCwgYW5jaG9yeSwgQGNvbG9ycy5vdmVybGF5XHJcbiAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgY291bnRIZWlnaHQsIG5hbWVTdHJpbmcsIHgsIG5hbWVZLCBhbmNob3J4LCBhbmNob3J5LCBAY29sb3JzLndoaXRlXHJcbiAgICBpZiB0cnVlICMgcGxheWVyLmlkICE9IDFcclxuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIGNvdW50SGVpZ2h0LCBjb3VudFN0cmluZywgeCwgY291bnRZLCBhbmNob3J4LCBhbmNob3J5LCBAY29sb3JzLndoaXRlXHJcblxyXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAjIHJlbmRlcmluZyBhbmQgem9uZXNcclxuXHJcbiAgZHJhd0ltYWdlOiAodGV4dHVyZSwgc3gsIHN5LCBzdywgc2gsIGR4LCBkeSwgZHcsIGRoLCByb3QsIGFuY2hvcngsIGFuY2hvcnksIHIsIGcsIGIsIGEsIGNiKSAtPlxyXG4gICAgQHJlbmRlckNvbW1hbmRzLnB1c2ggQHRleHR1cmVzW3RleHR1cmVdLCBzeCwgc3ksIHN3LCBzaCwgZHgsIGR5LCBkdywgZGgsIHJvdCwgYW5jaG9yeCwgYW5jaG9yeSwgciwgZywgYiwgYVxyXG5cclxuICAgIGlmIGNiP1xyXG4gICAgICAjIGNhbGxlciB3YW50cyB0byByZW1lbWJlciB3aGVyZSB0aGlzIHdhcyBkcmF3biwgYW5kIHdhbnRzIHRvIGJlIGNhbGxlZCBiYWNrIGlmIGl0IGlzIGV2ZXIgdG91Y2hlZFxyXG4gICAgICAjIFRoaXMgaXMgY2FsbGVkIGEgXCJ6b25lXCIuIFNpbmNlIHpvbmVzIGFyZSB0cmF2ZXJzZWQgaW4gcmV2ZXJzZSBvcmRlciwgdGhlIG5hdHVyYWwgb3ZlcmxhcCBvZlxyXG4gICAgICAjIGEgc2VyaWVzIG9mIHJlbmRlcnMgaXMgcmVzcGVjdGVkIGFjY29yZGluZ2x5LlxyXG4gICAgICBhbmNob3JPZmZzZXRYID0gLTEgKiBhbmNob3J4ICogZHdcclxuICAgICAgYW5jaG9yT2Zmc2V0WSA9IC0xICogYW5jaG9yeSAqIGRoXHJcbiAgICAgIHpvbmUgPVxyXG4gICAgICAgICMgY2VudGVyIChYLFkpIGFuZCByZXZlcnNlZCByb3RhdGlvbiwgdXNlZCB0byBwdXQgdGhlIGNvb3JkaW5hdGUgaW4gbG9jYWwgc3BhY2UgdG8gdGhlIHpvbmVcclxuICAgICAgICBjeDogIGR4XHJcbiAgICAgICAgY3k6ICBkeVxyXG4gICAgICAgIHJvdDogcm90ICogLTFcclxuICAgICAgICAjIHRoZSBheGlzIGFsaWduZWQgYm91bmRpbmcgYm94IHVzZWQgZm9yIGRldGVjdGlvbiBvZiBhIGxvY2Fsc3BhY2UgY29vcmRcclxuICAgICAgICBsOiAgIGFuY2hvck9mZnNldFhcclxuICAgICAgICB0OiAgIGFuY2hvck9mZnNldFlcclxuICAgICAgICByOiAgIGFuY2hvck9mZnNldFggKyBkd1xyXG4gICAgICAgIGI6ICAgYW5jaG9yT2Zmc2V0WSArIGRoXHJcbiAgICAgICAgIyBjYWxsYmFjayB0byBjYWxsIGlmIHRoZSB6b25lIGlzIGNsaWNrZWQgb25cclxuICAgICAgICBjYjogIGNiXHJcbiAgICAgIEB6b25lcy5wdXNoIHpvbmVcclxuXHJcbiAgY2hlY2tab25lczogKHgsIHkpIC0+XHJcbiAgICBmb3Igem9uZSBpbiBAem9uZXMgYnkgLTFcclxuICAgICAgIyBtb3ZlIGNvb3JkIGludG8gc3BhY2UgcmVsYXRpdmUgdG8gdGhlIHF1YWQsIHRoZW4gcm90YXRlIGl0IHRvIG1hdGNoXHJcbiAgICAgIHVucm90YXRlZExvY2FsWCA9IHggLSB6b25lLmN4XHJcbiAgICAgIHVucm90YXRlZExvY2FsWSA9IHkgLSB6b25lLmN5XHJcbiAgICAgIGxvY2FsWCA9IHVucm90YXRlZExvY2FsWCAqIE1hdGguY29zKHpvbmUucm90KSAtIHVucm90YXRlZExvY2FsWSAqIE1hdGguc2luKHpvbmUucm90KVxyXG4gICAgICBsb2NhbFkgPSB1bnJvdGF0ZWRMb2NhbFggKiBNYXRoLnNpbih6b25lLnJvdCkgKyB1bnJvdGF0ZWRMb2NhbFkgKiBNYXRoLmNvcyh6b25lLnJvdClcclxuICAgICAgaWYgKGxvY2FsWCA8IHpvbmUubCkgb3IgKGxvY2FsWCA+IHpvbmUucikgb3IgKGxvY2FsWSA8IHpvbmUudCkgb3IgKGxvY2FsWSA+IHpvbmUuYilcclxuICAgICAgICAjIG91dHNpZGUgb2Ygb3JpZW50ZWQgYm91bmRpbmcgYm94XHJcbiAgICAgICAgY29udGludWVcclxuICAgICAgem9uZS5jYih4LCB5KVxyXG4gICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZVxyXG4iLCJBbmltYXRpb24gPSByZXF1aXJlICcuL0FuaW1hdGlvbidcclxuXHJcbkNBUkRfSU1BR0VfVyA9IDEyMFxyXG5DQVJEX0lNQUdFX0ggPSAxNjJcclxuQ0FSRF9JTUFHRV9PRkZfWCA9IDRcclxuQ0FSRF9JTUFHRV9PRkZfWSA9IDRcclxuQ0FSRF9JTUFHRV9BRFZfWCA9IENBUkRfSU1BR0VfV1xyXG5DQVJEX0lNQUdFX0FEVl9ZID0gQ0FSRF9JTUFHRV9IXHJcbkNBUkRfUkVOREVSX1NDQUxFID0gMC4zNSAgICAgICAgICAgICAgICAgICMgY2FyZCBoZWlnaHQgY29lZmZpY2llbnQgZnJvbSB0aGUgc2NyZWVuJ3MgaGVpZ2h0XHJcbkNBUkRfSEFORF9DVVJWRV9ESVNUX0ZBQ1RPUiA9IDMuNSAgICAgICAgICMgZmFjdG9yIHdpdGggc2NyZWVuIGhlaWdodCB0byBmaWd1cmUgb3V0IGNlbnRlciBvZiBhcmMuIGJpZ2dlciBudW1iZXIgaXMgbGVzcyBhcmNcclxuQ0FSRF9IT0xESU5HX1JPVF9PUkRFUiA9IE1hdGguUEkgLyAxMiAgICAgIyBkZXNpcmVkIHJvdGF0aW9uIG9mIHRoZSBjYXJkIHdoZW4gYmVpbmcgZHJhZ2dlZCBhcm91bmQgZm9yIG9yZGVyaW5nJ3Mgc2FrZVxyXG5DQVJEX0hPTERJTkdfUk9UX1BMQVkgPSAtMSAqIE1hdGguUEkgLyAxMiAjIGRlc2lyZWQgcm90YXRpb24gb2YgdGhlIGNhcmQgd2hlbiBiZWluZyBkcmFnZ2VkIGFyb3VuZCB3aXRoIGludGVudCB0byBwbGF5XHJcbkNBUkRfUExBWV9DRUlMSU5HID0gMC42MCAgICAgICAgICAgICAgICAgICMgaG93IG11Y2ggb2YgdGhlIHRvcCBvZiB0aGUgc2NyZWVuIHJlcHJlc2VudHMgXCJJIHdhbnQgdG8gcGxheSB0aGlzXCIgdnMgXCJJIHdhbnQgdG8gcmVvcmRlclwiXHJcblxyXG5OT19DQVJEID0gLTFcclxuXHJcbkhpZ2hsaWdodCA9XHJcbiAgTk9ORTogLTFcclxuICBVTlNFTEVDVEVEOiAwXHJcbiAgU0VMRUNURUQ6IDFcclxuICBQSUxFOiAyXHJcblxyXG4jIHRha2VuIGZyb20gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMjExMjEyL2hvdy10by1jYWxjdWxhdGUtYW4tYW5nbGUtZnJvbS10aHJlZS1wb2ludHNcclxuIyB1c2VzIGxhdyBvZiBjb3NpbmVzIHRvIGZpZ3VyZSBvdXQgdGhlIGhhbmQgYXJjIGFuZ2xlXHJcbmZpbmRBbmdsZSA9IChwMCwgcDEsIHAyKSAtPlxyXG4gICAgYSA9IE1hdGgucG93KHAxLnggLSBwMi54LCAyKSArIE1hdGgucG93KHAxLnkgLSBwMi55LCAyKVxyXG4gICAgYiA9IE1hdGgucG93KHAxLnggLSBwMC54LCAyKSArIE1hdGgucG93KHAxLnkgLSBwMC55LCAyKVxyXG4gICAgYyA9IE1hdGgucG93KHAyLnggLSBwMC54LCAyKSArIE1hdGgucG93KHAyLnkgLSBwMC55LCAyKVxyXG4gICAgcmV0dXJuIE1hdGguYWNvcyggKGErYi1jKSAvIE1hdGguc3FydCg0KmEqYikgKVxyXG5cclxuY2FsY0Rpc3RhbmNlID0gKHAwLCBwMSkgLT5cclxuICByZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KHAxLnggLSBwMC54LCAyKSArIE1hdGgucG93KHAxLnkgLSBwMC55LCAyKSlcclxuXHJcbmNhbGNEaXN0YW5jZVNxdWFyZWQgPSAoeDAsIHkwLCB4MSwgeTEpIC0+XHJcbiAgcmV0dXJuIE1hdGgucG93KHgxIC0geDAsIDIpICsgTWF0aC5wb3coeTEgLSB5MCwgMilcclxuXHJcbmNsYXNzIEhhbmRcclxuICBAQ0FSRF9JTUFHRV9XOiBDQVJEX0lNQUdFX1dcclxuICBAQ0FSRF9JTUFHRV9IOiBDQVJEX0lNQUdFX0hcclxuICBAQ0FSRF9JTUFHRV9PRkZfWDogQ0FSRF9JTUFHRV9PRkZfWFxyXG4gIEBDQVJEX0lNQUdFX09GRl9ZOiBDQVJEX0lNQUdFX09GRl9ZXHJcbiAgQENBUkRfSU1BR0VfQURWX1g6IENBUkRfSU1BR0VfQURWX1hcclxuICBAQ0FSRF9JTUFHRV9BRFZfWTogQ0FSRF9JTUFHRV9BRFZfWVxyXG4gIEBDQVJEX1JFTkRFUl9TQ0FMRTogQ0FSRF9SRU5ERVJfU0NBTEVcclxuICBASGlnaGxpZ2h0OiBIaWdobGlnaHRcclxuXHJcbiAgY29uc3RydWN0b3I6IChAZ2FtZSkgLT5cclxuICAgIEBjYXJkcyA9IFtdXHJcbiAgICBAYW5pbXMgPSB7fVxyXG4gICAgQHBvc2l0aW9uQ2FjaGUgPSB7fVxyXG5cclxuICAgIEBwaWNraW5nID0gdHJ1ZVxyXG4gICAgQHBpY2tlZCA9IFtdXHJcbiAgICBAcGlja1BhaW50ID0gZmFsc2VcclxuXHJcbiAgICBAZHJhZ0luZGV4U3RhcnQgPSBOT19DQVJEXHJcbiAgICBAZHJhZ0luZGV4Q3VycmVudCA9IE5PX0NBUkRcclxuICAgIEBkcmFnWCA9IDBcclxuICAgIEBkcmFnWSA9IDBcclxuXHJcbiAgICAjIHJlbmRlciAvIGFuaW0gbWV0cmljc1xyXG4gICAgQGNhcmRTcGVlZCA9XHJcbiAgICAgIHI6IE1hdGguUEkgKiAyXHJcbiAgICAgIHM6IDIuNVxyXG4gICAgICB0OiAyICogQGdhbWUud2lkdGhcclxuICAgIEBwbGF5Q2VpbGluZyA9IENBUkRfUExBWV9DRUlMSU5HICogQGdhbWUuaGVpZ2h0XHJcbiAgICBAY2FyZEhlaWdodCA9IE1hdGguZmxvb3IoQGdhbWUuaGVpZ2h0ICogQ0FSRF9SRU5ERVJfU0NBTEUpXHJcbiAgICBAY2FyZFdpZHRoICA9IE1hdGguZmxvb3IoQGNhcmRIZWlnaHQgKiBDQVJEX0lNQUdFX1cgLyBDQVJEX0lNQUdFX0gpXHJcbiAgICBAY2FyZEhhbGZIZWlnaHQgPSBAY2FyZEhlaWdodCA+PiAxXHJcbiAgICBAY2FyZEhhbGZXaWR0aCAgPSBAY2FyZFdpZHRoID4+IDFcclxuICAgIGFyY01hcmdpbiA9IEBjYXJkV2lkdGggLyAyXHJcbiAgICBhcmNWZXJ0aWNhbEJpYXMgPSBAY2FyZEhlaWdodCAvIDUwXHJcbiAgICBib3R0b21MZWZ0ICA9IHsgeDogYXJjTWFyZ2luLCAgICAgICAgICAgICAgICB5OiBhcmNWZXJ0aWNhbEJpYXMgKyBAZ2FtZS5oZWlnaHQgfVxyXG4gICAgYm90dG9tUmlnaHQgPSB7IHg6IEBnYW1lLndpZHRoIC0gYXJjTWFyZ2luLCB5OiBhcmNWZXJ0aWNhbEJpYXMgKyBAZ2FtZS5oZWlnaHQgfVxyXG4gICAgQGhhbmRDZW50ZXIgPSB7IHg6IEBnYW1lLndpZHRoIC8gMiwgICAgICAgICB5OiBhcmNWZXJ0aWNhbEJpYXMgKyBAZ2FtZS5oZWlnaHQgKyAoQ0FSRF9IQU5EX0NVUlZFX0RJU1RfRkFDVE9SICogQGdhbWUuaGVpZ2h0KSB9XHJcbiAgICBAaGFuZEFuZ2xlID0gZmluZEFuZ2xlKGJvdHRvbUxlZnQsIEBoYW5kQ2VudGVyLCBib3R0b21SaWdodClcclxuICAgIEBoYW5kRGlzdGFuY2UgPSBjYWxjRGlzdGFuY2UoYm90dG9tTGVmdCwgQGhhbmRDZW50ZXIpXHJcbiAgICBAaGFuZEFuZ2xlQWR2YW5jZU1heCA9IEBoYW5kQW5nbGUgLyA3ICMgbmV2ZXIgc3BhY2UgdGhlIGNhcmRzIG1vcmUgdGhhbiB3aGF0IHRoZXknZCBsb29rIGxpa2Ugd2l0aCB0aGlzIGhhbmRzaXplXHJcbiAgICBAZ2FtZS5sb2cgXCJIYW5kIGRpc3RhbmNlICN7QGhhbmREaXN0YW5jZX0sIGFuZ2xlICN7QGhhbmRBbmdsZX0gKHNjcmVlbiBoZWlnaHQgI3tAZ2FtZS5oZWlnaHR9KVwiXHJcblxyXG4gIHRvZ2dsZVBpY2tpbmc6IC0+XHJcbiAgICBAcGlja2luZyA9ICFAcGlja2luZ1xyXG4gICAgaWYgQHBpY2tpbmdcclxuICAgICAgQHNlbGVjdE5vbmUoKVxyXG5cclxuICBzZWxlY3ROb25lOiAtPlxyXG4gICAgQHBpY2tlZCA9IG5ldyBBcnJheShAY2FyZHMubGVuZ3RoKS5maWxsKGZhbHNlKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHNldDogKGNhcmRzKSAtPlxyXG4gICAgQGNhcmRzID0gY2FyZHMuc2xpY2UoMClcclxuICAgIGlmIEBwaWNraW5nXHJcbiAgICAgIEBzZWxlY3ROb25lKClcclxuICAgIEBzeW5jQW5pbXMoKVxyXG4gICAgQHdhcnAoKVxyXG5cclxuICBzeW5jQW5pbXM6IC0+XHJcbiAgICBzZWVuID0ge31cclxuICAgIGZvciBjYXJkIGluIEBjYXJkc1xyXG4gICAgICBzZWVuW2NhcmRdKytcclxuICAgICAgaWYgbm90IEBhbmltc1tjYXJkXVxyXG4gICAgICAgIEBhbmltc1tjYXJkXSA9IG5ldyBBbmltYXRpb24ge1xyXG4gICAgICAgICAgc3BlZWQ6IEBjYXJkU3BlZWRcclxuICAgICAgICAgIHg6IDBcclxuICAgICAgICAgIHk6IDBcclxuICAgICAgICAgIHI6IDBcclxuICAgICAgICB9XHJcbiAgICB0b1JlbW92ZSA9IFtdXHJcbiAgICBmb3IgY2FyZCxhbmltIG9mIEBhbmltc1xyXG4gICAgICBpZiBub3Qgc2Vlbi5oYXNPd25Qcm9wZXJ0eShjYXJkKVxyXG4gICAgICAgIHRvUmVtb3ZlLnB1c2ggY2FyZFxyXG4gICAgZm9yIGNhcmQgaW4gdG9SZW1vdmVcclxuICAgICAgIyBAZ2FtZS5sb2cgXCJyZW1vdmluZyBhbmltIGZvciAje2NhcmR9XCJcclxuICAgICAgZGVsZXRlIEBhbmltc1tjYXJkXVxyXG5cclxuICAgIEB1cGRhdGVQb3NpdGlvbnMoKVxyXG5cclxuICBjYWxjRHJhd25IYW5kOiAtPlxyXG4gICAgZHJhd25IYW5kID0gW11cclxuICAgIGZvciBjYXJkLGkgaW4gQGNhcmRzXHJcbiAgICAgIGlmIGkgIT0gQGRyYWdJbmRleFN0YXJ0XHJcbiAgICAgICAgZHJhd25IYW5kLnB1c2ggY2FyZFxyXG5cclxuICAgIGlmIEBkcmFnSW5kZXhDdXJyZW50ICE9IE5PX0NBUkRcclxuICAgICAgZHJhd25IYW5kLnNwbGljZSBAZHJhZ0luZGV4Q3VycmVudCwgMCwgQGNhcmRzW0BkcmFnSW5kZXhTdGFydF1cclxuICAgIHJldHVybiBkcmF3bkhhbmRcclxuXHJcbiAgd2FudHNUb1BsYXlEcmFnZ2VkQ2FyZDogLT5cclxuICAgIHJldHVybiBmYWxzZSBpZiBAZHJhZ0luZGV4U3RhcnQgPT0gTk9fQ0FSRFxyXG4gICAgcmV0dXJuIEBkcmFnWSA8IEBwbGF5Q2VpbGluZ1xyXG5cclxuICB1cGRhdGVQb3NpdGlvbnM6IC0+XHJcbiAgICBkcmF3bkhhbmQgPSBAY2FsY0RyYXduSGFuZCgpXHJcbiAgICB3YW50c1RvUGxheSA9IEB3YW50c1RvUGxheURyYWdnZWRDYXJkKClcclxuICAgIGRlc2lyZWRSb3RhdGlvbiA9IENBUkRfSE9MRElOR19ST1RfT1JERVJcclxuICAgIHBvc2l0aW9uQ291bnQgPSBkcmF3bkhhbmQubGVuZ3RoXHJcbiAgICBpZiB3YW50c1RvUGxheVxyXG4gICAgICBkZXNpcmVkUm90YXRpb24gPSBDQVJEX0hPTERJTkdfUk9UX1BMQVlcclxuICAgICAgcG9zaXRpb25Db3VudC0tXHJcbiAgICBwb3NpdGlvbnMgPSBAY2FsY1Bvc2l0aW9ucyhwb3NpdGlvbkNvdW50KVxyXG4gICAgZHJhd0luZGV4ID0gMFxyXG4gICAgZm9yIGNhcmQsaSBpbiBkcmF3bkhhbmRcclxuICAgICAgYW5pbSA9IEBhbmltc1tjYXJkXVxyXG4gICAgICBpZiBpID09IEBkcmFnSW5kZXhDdXJyZW50XHJcbiAgICAgICAgYW5pbS5yZXEueCA9IEBkcmFnWFxyXG4gICAgICAgIGFuaW0ucmVxLnkgPSBAZHJhZ1lcclxuICAgICAgICBhbmltLnJlcS5yID0gZGVzaXJlZFJvdGF0aW9uXHJcbiAgICAgICAgaWYgbm90IHdhbnRzVG9QbGF5XHJcbiAgICAgICAgICBkcmF3SW5kZXgrK1xyXG4gICAgICBlbHNlXHJcbiAgICAgICAgcG9zID0gcG9zaXRpb25zW2RyYXdJbmRleF1cclxuICAgICAgICBhbmltLnJlcS54ID0gcG9zLnhcclxuICAgICAgICBhbmltLnJlcS55ID0gcG9zLnlcclxuICAgICAgICBhbmltLnJlcS5yID0gcG9zLnJcclxuICAgICAgICBkcmF3SW5kZXgrK1xyXG5cclxuICAjIGltbWVkaWF0ZWx5IHdhcnAgYWxsIGNhcmRzIHRvIHdoZXJlIHRoZXkgc2hvdWxkIGJlXHJcbiAgd2FycDogLT5cclxuICAgIGZvciBjYXJkLGFuaW0gb2YgQGFuaW1zXHJcbiAgICAgIGFuaW0ud2FycCgpXHJcblxyXG4gICMgcmVvcmRlciB0aGUgaGFuZCBiYXNlZCBvbiB0aGUgZHJhZyBsb2NhdGlvbiBvZiB0aGUgaGVsZCBjYXJkXHJcbiAgcmVvcmRlcjogLT5cclxuICAgIHJldHVybiBpZiBAZHJhZ0luZGV4U3RhcnQgPT0gTk9fQ0FSRFxyXG4gICAgcmV0dXJuIGlmIEBjYXJkcy5sZW5ndGggPCAyICMgbm90aGluZyB0byByZW9yZGVyXHJcbiAgICBwb3NpdGlvbnMgPSBAY2FsY1Bvc2l0aW9ucyhAY2FyZHMubGVuZ3RoKVxyXG4gICAgY2xvc2VzdEluZGV4ID0gMFxyXG4gICAgY2xvc2VzdERpc3QgPSBAZ2FtZS53aWR0aCAqIEBnYW1lLmhlaWdodCAjIHNvbWV0aGluZyBpbXBvc3NpYmx5IGxhcmdlXHJcbiAgICBmb3IgcG9zLCBpbmRleCBpbiBwb3NpdGlvbnNcclxuICAgICAgZGlzdCA9IGNhbGNEaXN0YW5jZVNxdWFyZWQocG9zLngsIHBvcy55LCBAZHJhZ1gsIEBkcmFnWSlcclxuICAgICAgaWYgY2xvc2VzdERpc3QgPiBkaXN0XHJcbiAgICAgICAgY2xvc2VzdERpc3QgPSBkaXN0XHJcbiAgICAgICAgY2xvc2VzdEluZGV4ID0gaW5kZXhcclxuICAgIEBkcmFnSW5kZXhDdXJyZW50ID0gY2xvc2VzdEluZGV4XHJcblxyXG4gIHNlbGVjdGVkQ2FyZHM6IC0+XHJcbiAgICBpZiBub3QgQHBpY2tpbmdcclxuICAgICAgcmV0dXJuIFtdXHJcblxyXG4gICAgY2FyZHMgPSBbXVxyXG4gICAgZm9yIGNhcmQsIGkgaW4gQGNhcmRzXHJcbiAgICAgIGlmIEBwaWNrZWRbaV1cclxuICAgICAgICBhbmltID0gQGFuaW1zW2NhcmRdXHJcbiAgICAgICAgY2FyZHMucHVzaCB7XHJcbiAgICAgICAgICBjYXJkOiBjYXJkXHJcbiAgICAgICAgICB4OiBhbmltLmN1ci54XHJcbiAgICAgICAgICB5OiBhbmltLmN1ci55XHJcbiAgICAgICAgICByOiBhbmltLmN1ci5yXHJcbiAgICAgICAgICBpbmRleDogaVxyXG4gICAgICAgIH1cclxuICAgIHJldHVybiBjYXJkc1xyXG5cclxuICBkb3duOiAoQGRyYWdYLCBAZHJhZ1ksIGluZGV4KSAtPlxyXG4gICAgQHVwKEBkcmFnWCwgQGRyYWdZKSAjIGVuc3VyZSB3ZSBsZXQgZ28gb2YgdGhlIHByZXZpb3VzIGNhcmQgaW4gY2FzZSB0aGUgZXZlbnRzIGFyZSBkdW1iXHJcbiAgICBpZiBAcGlja2luZ1xyXG4gICAgICBAcGlja2VkW2luZGV4XSA9ICFAcGlja2VkW2luZGV4XVxyXG4gICAgICBAcGlja1BhaW50ID0gQHBpY2tlZFtpbmRleF1cclxuICAgICAgcmV0dXJuXHJcbiAgICBAZ2FtZS5sb2cgXCJwaWNraW5nIHVwIGNhcmQgaW5kZXggI3tpbmRleH1cIlxyXG4gICAgQGRyYWdJbmRleFN0YXJ0ID0gaW5kZXhcclxuICAgIEBkcmFnSW5kZXhDdXJyZW50ID0gaW5kZXhcclxuICAgIEB1cGRhdGVQb3NpdGlvbnMoKVxyXG5cclxuICBtb3ZlOiAoQGRyYWdYLCBAZHJhZ1kpIC0+XHJcbiAgICByZXR1cm4gaWYgQGRyYWdJbmRleFN0YXJ0ID09IE5PX0NBUkRcclxuICAgICNAZ2FtZS5sb2cgXCJkcmFnZ2luZyBhcm91bmQgY2FyZCBpbmRleCAje0BkcmFnSW5kZXhDdXJyZW50fVwiXHJcbiAgICBAcmVvcmRlcigpXHJcbiAgICBAdXBkYXRlUG9zaXRpb25zKClcclxuXHJcbiAgdXA6IChAZHJhZ1gsIEBkcmFnWSkgLT5cclxuICAgIHJldHVybiBpZiBAZHJhZ0luZGV4U3RhcnQgPT0gTk9fQ0FSRFxyXG4gICAgQHJlb3JkZXIoKVxyXG4gICAgaWYgQHdhbnRzVG9QbGF5RHJhZ2dlZENhcmQoKVxyXG4gICAgICBAZ2FtZS5sb2cgXCJ0cnlpbmcgdG8gcGxheSBhICN7QGNhcmRzW0BkcmFnSW5kZXhTdGFydF19IGZyb20gaW5kZXggI3tAZHJhZ0luZGV4U3RhcnR9XCJcclxuICAgICAgY2FyZEluZGV4ID0gQGRyYWdJbmRleFN0YXJ0XHJcbiAgICAgIGNhcmQgPSBAY2FyZHNbY2FyZEluZGV4XVxyXG4gICAgICBhbmltID0gQGFuaW1zW2NhcmRdXHJcbiAgICAgIEBkcmFnSW5kZXhTdGFydCA9IE5PX0NBUkRcclxuICAgICAgQGRyYWdJbmRleEN1cnJlbnQgPSBOT19DQVJEXHJcbiAgICAgIEBnYW1lLnBsYXkgW3tcclxuICAgICAgICBjYXJkOiBjYXJkXHJcbiAgICAgICAgeDogYW5pbS5jdXIueFxyXG4gICAgICAgIHk6IGFuaW0uY3VyLnlcclxuICAgICAgICByOiBhbmltLmN1ci5yXHJcbiAgICAgICAgaW5kZXg6IGNhcmRJbmRleFxyXG4gICAgICB9XVxyXG4gICAgZWxzZVxyXG4gICAgICBAZ2FtZS5sb2cgXCJ0cnlpbmcgdG8gcmVvcmRlciAje0BjYXJkc1tAZHJhZ0luZGV4U3RhcnRdfSBpbnRvIGluZGV4ICN7QGRyYWdJbmRleEN1cnJlbnR9XCJcclxuICAgICAgQGNhcmRzID0gQGNhbGNEcmF3bkhhbmQoKSAjIGlzIHRoaXMgcmlnaHQ/XHJcblxyXG4gICAgQGRyYWdJbmRleFN0YXJ0ID0gTk9fQ0FSRFxyXG4gICAgQGRyYWdJbmRleEN1cnJlbnQgPSBOT19DQVJEXHJcbiAgICBAdXBkYXRlUG9zaXRpb25zKClcclxuXHJcbiAgdXBkYXRlOiAoZHQpIC0+XHJcbiAgICB1cGRhdGVkID0gZmFsc2VcclxuICAgIGZvciBjYXJkLGFuaW0gb2YgQGFuaW1zXHJcbiAgICAgIGlmIGFuaW0udXBkYXRlKGR0KVxyXG4gICAgICAgIHVwZGF0ZWQgPSB0cnVlXHJcbiAgICByZXR1cm4gdXBkYXRlZFxyXG5cclxuICByZW5kZXI6IC0+XHJcbiAgICByZXR1cm4gaWYgQGNhcmRzLmxlbmd0aCA9PSAwXHJcbiAgICBkcmF3bkhhbmQgPSBAY2FsY0RyYXduSGFuZCgpXHJcbiAgICBmb3IgdiwgaW5kZXggaW4gZHJhd25IYW5kXHJcbiAgICAgIGNvbnRpbnVlIGlmIHYgPT0gTk9fQ0FSRFxyXG4gICAgICBhbmltID0gQGFuaW1zW3ZdXHJcbiAgICAgIGRvIChhbmltLCBpbmRleCkgPT5cclxuICAgICAgICBpZiBAcGlja2luZ1xyXG4gICAgICAgICAgaWYgQHBpY2tlZFtpbmRleF1cclxuICAgICAgICAgICAgaGlnaGxpZ2h0U3RhdGUgPSBIaWdobGlnaHQuU0VMRUNURURcclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgaGlnaGxpZ2h0U3RhdGUgPSBIaWdobGlnaHQuVU5TRUxFQ1RFRFxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIGlmIEB3YW50c1RvUGxheURyYWdnZWRDYXJkKClcclxuICAgICAgICAgICAgaWYgKGluZGV4ID09IEBkcmFnSW5kZXhDdXJyZW50KVxyXG4gICAgICAgICAgICAgIGhpZ2hsaWdodFN0YXRlID0gSGlnaGxpZ2h0LlNFTEVDVEVEXHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICBoaWdobGlnaHRTdGF0ZSA9IEhpZ2hsaWdodC5VTlNFTEVDVEVEXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIGhpZ2hsaWdodFN0YXRlID0gSGlnaGxpZ2h0Lk5PTkVcclxuICAgICAgICBAcmVuZGVyQ2FyZCB2LCBhbmltLmN1ci54LCBhbmltLmN1ci55LCBhbmltLmN1ci5yLCAxLCBoaWdobGlnaHRTdGF0ZSwgKGNsaWNrWCwgY2xpY2tZKSA9PlxyXG4gICAgICAgICAgQGRvd24oY2xpY2tYLCBjbGlja1ksIGluZGV4KVxyXG5cclxuICByZW5kZXJDYXJkOiAodiwgeCwgeSwgcm90LCBzY2FsZSwgc2VsZWN0ZWQsIGNiKSAtPlxyXG4gICAgcm90ID0gMCBpZiBub3Qgcm90XHJcbiAgICByYW5rID0gTWF0aC5mbG9vcih2IC8gNClcclxuICAgIHN1aXQgPSBNYXRoLmZsb29yKHYgJSA0KVxyXG5cclxuICAgIGNvbCA9IHN3aXRjaCBzZWxlY3RlZFxyXG4gICAgICB3aGVuIEhpZ2hsaWdodC5OT05FXHJcbiAgICAgICAgWzEsIDEsIDFdXHJcbiAgICAgIHdoZW4gSGlnaGxpZ2h0LlVOU0VMRUNURURcclxuICAgICAgICAjIFswLjMsIDAuMywgMC4zXVxyXG4gICAgICAgIFsxLCAxLCAxXVxyXG4gICAgICB3aGVuIEhpZ2hsaWdodC5TRUxFQ1RFRFxyXG4gICAgICAgIFswLjUsIDAuNSwgMC45XVxyXG4gICAgICB3aGVuIEhpZ2hsaWdodC5QSUxFXHJcbiAgICAgICAgWzAuNiwgMC42LCAwLjZdXHJcblxyXG4gICAgQGdhbWUuZHJhd0ltYWdlIFwiY2FyZHNcIixcclxuICAgIENBUkRfSU1BR0VfT0ZGX1ggKyAoQ0FSRF9JTUFHRV9BRFZfWCAqIHJhbmspLCBDQVJEX0lNQUdFX09GRl9ZICsgKENBUkRfSU1BR0VfQURWX1kgKiBzdWl0KSwgQ0FSRF9JTUFHRV9XLCBDQVJEX0lNQUdFX0gsXHJcbiAgICB4LCB5LCBAY2FyZFdpZHRoICogc2NhbGUsIEBjYXJkSGVpZ2h0ICogc2NhbGUsXHJcbiAgICByb3QsIDAuNSwgMC41LCBjb2xbMF0sY29sWzFdLGNvbFsyXSwxLCBjYlxyXG5cclxuICBjYWxjUG9zaXRpb25zOiAoaGFuZFNpemUpIC0+XHJcbiAgICBpZiBAcG9zaXRpb25DYWNoZS5oYXNPd25Qcm9wZXJ0eShoYW5kU2l6ZSlcclxuICAgICAgcmV0dXJuIEBwb3NpdGlvbkNhY2hlW2hhbmRTaXplXVxyXG4gICAgcmV0dXJuIFtdIGlmIGhhbmRTaXplID09IDBcclxuXHJcbiAgICBhZHZhbmNlID0gQGhhbmRBbmdsZSAvIGhhbmRTaXplXHJcbiAgICBpZiBhZHZhbmNlID4gQGhhbmRBbmdsZUFkdmFuY2VNYXhcclxuICAgICAgYWR2YW5jZSA9IEBoYW5kQW5nbGVBZHZhbmNlTWF4XHJcbiAgICBhbmdsZVNwcmVhZCA9IGFkdmFuY2UgKiBoYW5kU2l6ZSAgICAgICAgICAgICAgICAjIGhvdyBtdWNoIG9mIHRoZSBhbmdsZSB3ZSBwbGFuIG9uIHVzaW5nXHJcbiAgICBhbmdsZUxlZnRvdmVyID0gQGhhbmRBbmdsZSAtIGFuZ2xlU3ByZWFkICAgICAgICAjIGFtb3VudCBvZiBhbmdsZSB3ZSdyZSBub3QgdXNpbmcsIGFuZCBuZWVkIHRvIHBhZCBzaWRlcyB3aXRoIGV2ZW5seVxyXG4gICAgY3VycmVudEFuZ2xlID0gLTEgKiAoQGhhbmRBbmdsZSAvIDIpICAgICAgICAgICAgIyBtb3ZlIHRvIHRoZSBsZWZ0IHNpZGUgb2Ygb3VyIGFuZ2xlXHJcbiAgICBjdXJyZW50QW5nbGUgKz0gYW5nbGVMZWZ0b3ZlciAvIDIgICAgICAgICAgICAgICAjIC4uLiBhbmQgYWR2YW5jZSBwYXN0IGhhbGYgb2YgdGhlIHBhZGRpbmdcclxuICAgIGN1cnJlbnRBbmdsZSArPSBhZHZhbmNlIC8gMiAgICAgICAgICAgICAgICAgICAgICMgLi4uIGFuZCBjZW50ZXIgdGhlIGNhcmRzIGluIHRoZSBhbmdsZVxyXG5cclxuICAgIHBvc2l0aW9ucyA9IFtdXHJcbiAgICBmb3IgaSBpbiBbMC4uLmhhbmRTaXplXVxyXG4gICAgICB4ID0gQGhhbmRDZW50ZXIueCAtIE1hdGguY29zKChNYXRoLlBJIC8gMikgKyBjdXJyZW50QW5nbGUpICogQGhhbmREaXN0YW5jZVxyXG4gICAgICB5ID0gQGhhbmRDZW50ZXIueSAtIE1hdGguc2luKChNYXRoLlBJIC8gMikgKyBjdXJyZW50QW5nbGUpICogQGhhbmREaXN0YW5jZVxyXG4gICAgICBjdXJyZW50QW5nbGUgKz0gYWR2YW5jZVxyXG4gICAgICBwb3NpdGlvbnMucHVzaCB7XHJcbiAgICAgICAgeDogeFxyXG4gICAgICAgIHk6IHlcclxuICAgICAgICByOiBjdXJyZW50QW5nbGUgLSBhZHZhbmNlXHJcbiAgICAgIH1cclxuXHJcbiAgICBAcG9zaXRpb25DYWNoZVtoYW5kU2l6ZV0gPSBwb3NpdGlvbnNcclxuICAgIHJldHVybiBwb3NpdGlvbnNcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gSGFuZFxyXG4iLCJCdXR0b24gPSByZXF1aXJlICcuL0J1dHRvbidcclxuXHJcbmNsYXNzIE1lbnVcclxuICBjb25zdHJ1Y3RvcjogKEBnYW1lLCBAdGl0bGUsIEBiYWNrZ3JvdW5kLCBAY29sb3IsIEBhY3Rpb25zKSAtPlxyXG4gICAgQGJ1dHRvbnMgPSBbXVxyXG4gICAgQGJ1dHRvbk5hbWVzID0gW1wiYnV0dG9uMFwiLCBcImJ1dHRvbjFcIl1cclxuXHJcbiAgICBidXR0b25TaXplID0gQGdhbWUuaGVpZ2h0IC8gMTVcclxuICAgIEBidXR0b25TdGFydFkgPSBAZ2FtZS5oZWlnaHQgLyA1XHJcblxyXG4gICAgc2xpY2UgPSAoQGdhbWUuaGVpZ2h0IC0gQGJ1dHRvblN0YXJ0WSkgLyAoQGFjdGlvbnMubGVuZ3RoICsgMSlcclxuICAgIGN1cnJZID0gQGJ1dHRvblN0YXJ0WSArIHNsaWNlXHJcbiAgICBmb3IgYWN0aW9uIGluIEBhY3Rpb25zXHJcbiAgICAgIGJ1dHRvbiA9IG5ldyBCdXR0b24oQGdhbWUsIEBidXR0b25OYW1lcywgQGdhbWUuZm9udCwgYnV0dG9uU2l6ZSwgQGdhbWUuY2VudGVyLngsIGN1cnJZLCBhY3Rpb24pXHJcbiAgICAgIEBidXR0b25zLnB1c2ggYnV0dG9uXHJcbiAgICAgIGN1cnJZICs9IHNsaWNlXHJcblxyXG4gIHVwZGF0ZTogKGR0KSAtPlxyXG4gICAgdXBkYXRlZCA9IGZhbHNlXHJcbiAgICBmb3IgYnV0dG9uIGluIEBidXR0b25zXHJcbiAgICAgIGlmIGJ1dHRvbi51cGRhdGUoZHQpXHJcbiAgICAgICAgdXBkYXRlZCA9IHRydWVcclxuICAgIHJldHVybiB1cGRhdGVkXHJcblxyXG4gIHJlbmRlcjogLT5cclxuICAgIEBnYW1lLnNwcml0ZVJlbmRlcmVyLnJlbmRlciBAYmFja2dyb3VuZCwgMCwgMCwgQGdhbWUud2lkdGgsIEBnYW1lLmhlaWdodCwgMCwgMCwgMCwgQGNvbG9yXHJcbiAgICBAZ2FtZS5mb250UmVuZGVyZXIucmVuZGVyIEBnYW1lLmZvbnQsIEBnYW1lLmhlaWdodCAvIDI1LCBcIkJ1aWxkOiAje0BnYW1lLnZlcnNpb259XCIsIDAsIEBnYW1lLmhlaWdodCwgMCwgMSwgQGdhbWUuY29sb3JzLmxpZ2h0Z3JheVxyXG4gICAgdGl0bGVIZWlnaHQgPSBAZ2FtZS5oZWlnaHQgLyA4XHJcbiAgICB0aXRsZU9mZnNldCA9IEBidXR0b25TdGFydFkgPj4gMVxyXG4gICAgQGdhbWUuZm9udFJlbmRlcmVyLnJlbmRlciBAZ2FtZS5mb250LCB0aXRsZUhlaWdodCwgQHRpdGxlLCBAZ2FtZS5jZW50ZXIueCwgdGl0bGVPZmZzZXQsIDAuNSwgMC41LCBAZ2FtZS5jb2xvcnMud2hpdGVcclxuICAgIGZvciBidXR0b24gaW4gQGJ1dHRvbnNcclxuICAgICAgYnV0dG9uLnJlbmRlcigpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1lbnVcclxuIiwiQW5pbWF0aW9uID0gcmVxdWlyZSAnLi9BbmltYXRpb24nXHJcbkhhbmQgPSByZXF1aXJlICcuL0hhbmQnXHJcblxyXG5TRVRUTEVfTVMgPSAxMDAwXHJcblxyXG5jbGFzcyBQaWxlXHJcbiAgY29uc3RydWN0b3I6IChAZ2FtZSwgQGhhbmQpIC0+XHJcbiAgICBAcGxheUlEID0gLTFcclxuICAgIEBwbGF5cyA9IFtdXHJcbiAgICBAYW5pbXMgPSB7fVxyXG4gICAgQHNldHRsZVRpbWVyID0gMFxyXG4gICAgQHRocm93bkNvbG9yID0geyByOiAxLCBnOiAxLCBiOiAwLCBhOiAxfVxyXG4gICAgQHNjYWxlID0gMC42XHJcblxyXG4gICAgIyAxLjAgaXMgbm90IG1lc3N5IGF0IGFsbCwgYXMgeW91IGFwcHJvYWNoIDAgaXQgc3RhcnRzIHRvIGFsbCBwaWxlIG9uIG9uZSBhbm90aGVyXHJcbiAgICBtZXNzeSA9IDAuMlxyXG5cclxuICAgIEBwbGF5Q2FyZFNwYWNpbmcgPSAwLjFcclxuXHJcbiAgICBjZW50ZXJYID0gQGdhbWUuY2VudGVyLnhcclxuICAgIGNlbnRlclkgPSBAZ2FtZS5jZW50ZXIueVxyXG4gICAgb2Zmc2V0WCA9IEBoYW5kLmNhcmRXaWR0aCAqIG1lc3N5ICogQHNjYWxlXHJcbiAgICBvZmZzZXRZID0gQGhhbmQuY2FyZEhhbGZIZWlnaHQgKiBtZXNzeSAqIEBzY2FsZVxyXG4gICAgQHBsYXlMb2NhdGlvbnMgPSBbXHJcbiAgICAgIHsgeDogY2VudGVyWCwgeTogY2VudGVyWSArIG9mZnNldFkgfSAjIGJvdHRvbVxyXG4gICAgICB7IHg6IGNlbnRlclggLSBvZmZzZXRYLCB5OiBjZW50ZXJZIH0gIyBsZWZ0XHJcbiAgICAgIHsgeDogY2VudGVyWCwgeTogY2VudGVyWSAtIG9mZnNldFkgfSAjIHRvcFxyXG4gICAgICB7IHg6IGNlbnRlclggKyBvZmZzZXRYLCB5OiBjZW50ZXJZIH0gIyByaWdodFxyXG4gICAgXVxyXG4gICAgQHRocm93TG9jYXRpb25zID0gW1xyXG4gICAgICB7IHg6IGNlbnRlclgsIHk6IEBnYW1lLmhlaWdodCB9ICMgYm90dG9tXHJcbiAgICAgIHsgeDogMCwgeTogY2VudGVyWSArIG9mZnNldFkgfSAjIGxlZnRcclxuICAgICAgeyB4OiBjZW50ZXJYLCB5OiAwIH0gIyB0b3BcclxuICAgICAgeyB4OiBAZ2FtZS53aWR0aCwgeTogY2VudGVyWSArIG9mZnNldFkgfSAjIHJpZ2h0XHJcbiAgICBdXHJcblxyXG4gIHNldDogKHBpbGVJRCwgcGlsZSwgcGlsZVdobykgLT5cclxuICAgIGlmIEBwbGF5SUQgIT0gcGlsZUlEXHJcbiAgICAgIEBwbGF5SUQgPSBwaWxlSURcclxuICAgICAgQHBsYXlzLnB1c2gge1xyXG4gICAgICAgIGNhcmRzOiBwaWxlLnNsaWNlKDApXHJcbiAgICAgICAgd2hvOiBwaWxlV2hvXHJcbiAgICAgIH1cclxuICAgICAgQHNldHRsZVRpbWVyID0gU0VUVExFX01TXHJcblxyXG4gICAgIyBpZiAoQHBsYXlJRCAhPSBwaWxlSUQpIGFuZCAodGhyb3duLmxlbmd0aCA+IDApXHJcbiAgICAjICAgQHBsYXlzID0gdGhyb3duLnNsaWNlKDApICMgdGhlIHBpbGUgaGFzIGJlY29tZSB0aGUgdGhyb3duLCBzdGFzaCBpdCBvZmYgb25lIGxhc3QgdGltZVxyXG4gICAgIyAgIEBwbGF5V2hvID0gdGhyb3duV2hvLnNsaWNlKDApXHJcbiAgICAjICAgQHBsYXlJRCA9IHBpbGVJRFxyXG4gICAgIyAgIEBzZXR0bGVUaW1lciA9IFNFVFRMRV9NU1xyXG5cclxuICAgICMgIyBkb24ndCBzdG9tcCB0aGUgcGlsZSB3ZSdyZSBkcmF3aW5nIHVudGlsIGl0IGlzIGRvbmUgc2V0dGxpbmcgYW5kIGNhbiBmbHkgb2ZmIHRoZSBzY3JlZW5cclxuICAgICMgaWYgQHNldHRsZVRpbWVyID09IDBcclxuICAgICMgICBAcGxheXMgPSBwaWxlLnNsaWNlKDApXHJcbiAgICAjICAgQHBsYXlXaG8gPSBwaWxlV2hvLnNsaWNlKDApXHJcbiAgICAjICAgQHRocm93biA9IHRocm93bi5zbGljZSgwKVxyXG4gICAgIyAgIEB0aHJvd25XaG8gPSB0aHJvd25XaG8uc2xpY2UoMClcclxuICAgICMgICBAdGhyb3duVGFrZXIgPSB0aHJvd25UYWtlclxyXG5cclxuICAgIEBzeW5jQW5pbXMoKVxyXG5cclxuICBoaW50OiAoY2FyZHMpIC0+XHJcbiAgICBmb3IgY2FyZCBpbiBjYXJkc1xyXG4gICAgICBAYW5pbXNbY2FyZC5jYXJkXSA9IG5ldyBBbmltYXRpb24ge1xyXG4gICAgICAgIHNwZWVkOiBAaGFuZC5jYXJkU3BlZWRcclxuICAgICAgICB4OiBjYXJkLnhcclxuICAgICAgICB5OiBjYXJkLnlcclxuICAgICAgICByOiBjYXJkLnJcclxuICAgICAgICBzOiAxXHJcbiAgICAgIH1cclxuXHJcbiAgc3luY0FuaW1zOiAtPlxyXG4gICAgc2VlbiA9IHt9XHJcbiAgICBsb2NhdGlvbnMgPSBAdGhyb3dMb2NhdGlvbnNcclxuICAgIGZvciBwbGF5IGluIEBwbGF5c1xyXG4gICAgICBmb3IgY2FyZCwgaW5kZXggaW4gcGxheS5jYXJkc1xyXG4gICAgICAgIHNlZW5bY2FyZF0rK1xyXG4gICAgICAgIGlmIG5vdCBAYW5pbXNbY2FyZF1cclxuICAgICAgICAgIHdobyA9IHBsYXkud2hvXHJcbiAgICAgICAgICBsb2NhdGlvbiA9IGxvY2F0aW9uc1t3aG9dXHJcbiAgICAgICAgICBAYW5pbXNbY2FyZF0gPSBuZXcgQW5pbWF0aW9uIHtcclxuICAgICAgICAgICAgc3BlZWQ6IEBoYW5kLmNhcmRTcGVlZFxyXG4gICAgICAgICAgICB4OiBsb2NhdGlvbi54XHJcbiAgICAgICAgICAgIHk6IGxvY2F0aW9uLnlcclxuICAgICAgICAgICAgcjogLTEgKiBNYXRoLlBJIC8gNFxyXG4gICAgICAgICAgICBzOiBAc2NhbGVcclxuICAgICAgICAgIH1cclxuXHJcbiAgICB0b1JlbW92ZSA9IFtdXHJcbiAgICBmb3IgY2FyZCxhbmltIG9mIEBhbmltc1xyXG4gICAgICBpZiBub3Qgc2Vlbi5oYXNPd25Qcm9wZXJ0eShjYXJkKVxyXG4gICAgICAgIHRvUmVtb3ZlLnB1c2ggY2FyZFxyXG4gICAgZm9yIGNhcmQgaW4gdG9SZW1vdmVcclxuICAgICAgIyBAZ2FtZS5sb2cgXCJyZW1vdmluZyBhbmltIGZvciAje2NhcmR9XCJcclxuICAgICAgZGVsZXRlIEBhbmltc1tjYXJkXVxyXG5cclxuICAgIEB1cGRhdGVQb3NpdGlvbnMoKVxyXG5cclxuICB1cGRhdGVQb3NpdGlvbnM6IC0+XHJcbiAgICBsb2NhdGlvbnMgPSBAcGxheUxvY2F0aW9uc1xyXG4gICAgZm9yIHBsYXksIHBsYXlJbmRleCBpbiBAcGxheXNcclxuICAgICAgZm9yIHYsIGluZGV4IGluIHBsYXkuY2FyZHNcclxuICAgICAgICBhbmltID0gQGFuaW1zW3ZdXHJcbiAgICAgICAgbG9jID0gcGxheS53aG9cclxuICAgICAgICBhbmltLnJlcS54ID0gbG9jYXRpb25zW2xvY10ueCArIChpbmRleCAqIEBoYW5kLmNhcmRXaWR0aCAqIEBwbGF5Q2FyZFNwYWNpbmcpXHJcbiAgICAgICAgYW5pbS5yZXEueSA9IGxvY2F0aW9uc1tsb2NdLnlcclxuICAgICAgICBhbmltLnJlcS5yID0gMC4yICogTWF0aC5jb3MocGxheUluZGV4IC8gMC4xKVxyXG4gICAgICAgIGFuaW0ucmVxLnMgPSBAc2NhbGVcclxuXHJcbiAgcmVhZHlGb3JOZXh0VHJpY2s6IC0+XHJcbiAgICByZXR1cm4gKEBzZXR0bGVUaW1lciA9PSAwKVxyXG5cclxuICB1cGRhdGU6IChkdCkgLT5cclxuICAgIHVwZGF0ZWQgPSBmYWxzZVxyXG5cclxuICAgIGlmIEBzZXR0bGVUaW1lciA+IDBcclxuICAgICAgdXBkYXRlZCA9IHRydWVcclxuICAgICAgQHNldHRsZVRpbWVyIC09IGR0XHJcbiAgICAgIGlmIEBzZXR0bGVUaW1lciA8IDBcclxuICAgICAgICBAc2V0dGxlVGltZXIgPSAwXHJcblxyXG4gICAgZm9yIGNhcmQsYW5pbSBvZiBAYW5pbXNcclxuICAgICAgaWYgYW5pbS51cGRhdGUoZHQpXHJcbiAgICAgICAgdXBkYXRlZCA9IHRydWVcclxuXHJcbiAgICByZXR1cm4gdXBkYXRlZFxyXG5cclxuICAjIHVzZWQgYnkgdGhlIGdhbWUgb3ZlciBzY3JlZW4uIEl0IHJldHVybnMgdHJ1ZSB3aGVuIG5laXRoZXIgdGhlIHBpbGUgbm9yIHRoZSBsYXN0IHRocm93biBhcmUgbW92aW5nXHJcbiAgcmVzdGluZzogLT5cclxuICAgIGZvciBjYXJkLGFuaW0gb2YgQGFuaW1zXHJcbiAgICAgIGlmIGFuaW0uYW5pbWF0aW5nKClcclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgIGlmIEBzZXR0bGVUaW1lciA+IDBcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICByZW5kZXI6IC0+XHJcbiAgICBmb3IgcGxheSwgcGxheUluZGV4IGluIEBwbGF5c1xyXG4gICAgICBoaWdobGlnaHQgPSBIYW5kLkhpZ2hsaWdodC5QSUxFXHJcbiAgICAgIGlmIHBsYXlJbmRleCA9PSAoQHBsYXlzLmxlbmd0aCAtIDEpXHJcbiAgICAgICAgaGlnaGxpZ2h0ID0gSGFuZC5IaWdobGlnaHQuTk9ORVxyXG4gICAgICBmb3IgdiwgaW5kZXggaW4gcGxheS5jYXJkc1xyXG4gICAgICAgIGFuaW0gPSBAYW5pbXNbdl1cclxuICAgICAgICBAaGFuZC5yZW5kZXJDYXJkIHYsIGFuaW0uY3VyLngsIGFuaW0uY3VyLnksIGFuaW0uY3VyLnIsIGFuaW0uY3VyLnMsIGhpZ2hsaWdodFxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQaWxlXHJcbiIsImNsYXNzIFNwcml0ZVJlbmRlcmVyXHJcbiAgY29uc3RydWN0b3I6IChAZ2FtZSkgLT5cclxuICAgIEBzcHJpdGVzID1cclxuICAgICAgIyBnZW5lcmljIHNwcml0ZXNcclxuICAgICAgc29saWQ6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogIDU1LCB5OiA3MjMsIHc6ICAxMCwgaDogIDEwIH1cclxuICAgICAgcGF1c2U6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogNjAyLCB5OiA3MDcsIHc6IDEyMiwgaDogMTI1IH1cclxuICAgICAgYnV0dG9uMDogICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogMTQwLCB5OiA3NzcsIHc6IDQyMiwgaDogIDY1IH1cclxuICAgICAgYnV0dG9uMTogICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogMTQwLCB5OiA2OTgsIHc6IDQyMiwgaDogIDY1IH1cclxuICAgICAgcGx1czA6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogNzQ1LCB5OiA2NjQsIHc6IDExNiwgaDogMTE4IH1cclxuICAgICAgcGx1czE6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogNzQ1LCB5OiA4MjAsIHc6IDExNiwgaDogMTE4IH1cclxuICAgICAgbWludXMwOiAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogODk1LCB5OiA2NjQsIHc6IDExNiwgaDogMTE4IH1cclxuICAgICAgbWludXMxOiAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogODk1LCB5OiA4MjAsIHc6IDExNiwgaDogMTE4IH1cclxuICAgICAgYXJyb3dMOiAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogIDMzLCB5OiA4NTgsIHc6IDIwNCwgaDogMTU2IH1cclxuICAgICAgYXJyb3dSOiAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogMjM5LCB5OiA4NTIsIHc6IDIwOCwgaDogMTU1IH1cclxuXHJcbiAgICAgIHBpbGU6ICAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6ICAxMywgeTogODgzLCB3OiAxMjgsIGg6IDEyOCB9XHJcbiAgICAgIHBpbGUwOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDE0NSwgeTogODgzLCB3OiAxMjgsIGg6IDEyOCB9XHJcbiAgICAgIHBpbGUxOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDI3NywgeTogODgzLCB3OiAxMjgsIGg6IDEyOCB9XHJcbiAgICAgIHBpbGUyOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDQwOSwgeTogODgzLCB3OiAxMjgsIGg6IDEyOCB9XHJcbiAgICAgIHBpbGUzOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDU0MSwgeTogODgzLCB3OiAxMjgsIGg6IDEyOCB9XHJcblxyXG4gICAgICAjIG1lbnUgYmFja2dyb3VuZHNcclxuICAgICAgbWFpbm1lbnU6ICB7IHRleHR1cmU6IFwibWFpbm1lbnVcIiwgIHg6IDAsIHk6IDAsIHc6IDEyODAsIGg6IDcyMCB9XHJcbiAgICAgIHBhdXNlbWVudTogeyB0ZXh0dXJlOiBcInBhdXNlbWVudVwiLCB4OiAwLCB5OiAwLCB3OiAxMjgwLCBoOiA3MjAgfVxyXG5cclxuICAgICAgIyBob3d0b1xyXG4gICAgICBob3d0bzE6ICAgIHsgdGV4dHVyZTogXCJob3d0bzFcIiwgIHg6IDAsIHk6ICAwLCB3OiAxOTIwLCBoOiAxMDgwIH1cclxuXHJcbiAgICAgIGF1OiAgICAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDU0MCwgeTogMTA3OSwgdzogNDAwLCBoOiAgODAgfVxyXG4gICAgICBzdGFyX29uOiAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAgMzgsIHk6IDEwNjYsIHc6IDE5MCwgaDogMTkwIH1cclxuICAgICAgc3Rhcl9vZmY6ICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogMjUwLCB5OiAxMDY2LCB3OiAxOTAsIGg6IDE5MCB9XHJcblxyXG4gICAgICAjIGNoYXJhY3RlcnNcclxuICAgICAgbWFyaW86ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogIDIwLCB5OiAgIDAsIHc6IDE1MSwgaDogMzA4IH1cclxuICAgICAgbHVpZ2k6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogMTcxLCB5OiAgIDAsIHc6IDE1MSwgaDogMzA4IH1cclxuICAgICAgcGVhY2g6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogMzM1LCB5OiAgIDAsIHc6IDE2NCwgaDogMzA4IH1cclxuICAgICAgZGFpc3k6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogNTA0LCB5OiAgIDAsIHc6IDE2NCwgaDogMzA4IH1cclxuICAgICAgeW9zaGk6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogNjY4LCB5OiAgIDAsIHc6IDE4MCwgaDogMzA4IH1cclxuICAgICAgdG9hZDogICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogODQ5LCB5OiAgIDAsIHc6IDE1NywgaDogMzA4IH1cclxuICAgICAgYm93c2VyOiAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogIDExLCB5OiAzMjIsIHc6IDE1MSwgaDogMzA4IH1cclxuICAgICAgYm93c2VyanI6ICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogMjI1LCB5OiAzMjIsIHc6IDE0NCwgaDogMzA4IH1cclxuICAgICAga29vcGE6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogMzcyLCB5OiAzMjIsIHc6IDEyOCwgaDogMzA4IH1cclxuICAgICAgcm9zYWxpbmE6ICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogNTAwLCB5OiAzMjIsIHc6IDE3MywgaDogMzA4IH1cclxuICAgICAgc2h5Z3V5OiAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogNjkxLCB5OiAzMjIsIHc6IDE1NCwgaDogMzA4IH1cclxuICAgICAgdG9hZGV0dGU6ICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogODQ3LCB5OiAzMjIsIHc6IDE1OCwgaDogMzA4IH1cclxuXHJcbiAgY2FsY1dpZHRoOiAoc3ByaXRlTmFtZSwgaGVpZ2h0KSAtPlxyXG4gICAgc3ByaXRlID0gQHNwcml0ZXNbc3ByaXRlTmFtZV1cclxuICAgIHJldHVybiAxIGlmIG5vdCBzcHJpdGVcclxuICAgIHJldHVybiBoZWlnaHQgKiBzcHJpdGUudyAvIHNwcml0ZS5oXHJcblxyXG4gIHJlbmRlcjogKHNwcml0ZU5hbWUsIGR4LCBkeSwgZHcsIGRoLCByb3QsIGFuY2hvcngsIGFuY2hvcnksIGNvbG9yLCBjYikgLT5cclxuICAgIHNwcml0ZSA9IEBzcHJpdGVzW3Nwcml0ZU5hbWVdXHJcbiAgICByZXR1cm4gaWYgbm90IHNwcml0ZVxyXG4gICAgaWYgKGR3ID09IDApIGFuZCAoZGggPT0gMClcclxuICAgICAgIyB0aGlzIHByb2JhYmx5IHNob3VsZG4ndCBldmVyIGJlIHVzZWQuXHJcbiAgICAgIGR3ID0gc3ByaXRlLnhcclxuICAgICAgZGggPSBzcHJpdGUueVxyXG4gICAgZWxzZSBpZiBkdyA9PSAwXHJcbiAgICAgIGR3ID0gZGggKiBzcHJpdGUudyAvIHNwcml0ZS5oXHJcbiAgICBlbHNlIGlmIGRoID09IDBcclxuICAgICAgZGggPSBkdyAqIHNwcml0ZS5oIC8gc3ByaXRlLndcclxuICAgIEBnYW1lLmRyYXdJbWFnZSBzcHJpdGUudGV4dHVyZSwgc3ByaXRlLngsIHNwcml0ZS55LCBzcHJpdGUudywgc3ByaXRlLmgsIGR4LCBkeSwgZHcsIGRoLCByb3QsIGFuY2hvcngsIGFuY2hvcnksIGNvbG9yLnIsIGNvbG9yLmcsIGNvbG9yLmIsIGNvbG9yLmEsIGNiXHJcbiAgICByZXR1cm5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU3ByaXRlUmVuZGVyZXJcclxuIiwiTUlOX1BMQVlFUlMgPSAzXHJcbk1BWF9MT0dfTElORVMgPSA2XHJcbk9LID0gJ09LJ1xyXG5cclxuU3VpdCA9XHJcbiAgTk9ORTogLTFcclxuICBTUEFERVM6IDBcclxuICBDTFVCUzogMVxyXG4gIERJQU1PTkRTOiAyXHJcbiAgSEVBUlRTOiAzXHJcblxyXG5TdWl0TmFtZSA9IFsnU3BhZGVzJywgJ0NsdWJzJywgJ0RpYW1vbmRzJywgJ0hlYXJ0cyddXHJcblNob3J0U3VpdE5hbWUgPSBbJ1MnLCAnQycsICdEJywgJ0gnXVxyXG5HbHlwaFN1aXROYW1lID0gW1wiXFx4YzhcIiwgXCJcXHhjOVwiLCBcIlxceGNhXCIsIFwiXFx4Y2JcIl1cclxuXHJcblNUQVJUSU5HX01PTkVZID0gMjVcclxuXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgQUkgTmFtZSBHZW5lcmF0b3JcclxuXHJcbmFpQ2hhcmFjdGVyTGlzdCA9IFtcclxuICB7IGlkOiBcIm1hcmlvXCIsICAgIG5hbWU6IFwiTWFyaW9cIiwgICAgICBzcHJpdGU6IFwibWFyaW9cIiwgICAgYnJhaW46IFwibm9ybWFsXCIgfVxyXG4gIHsgaWQ6IFwibHVpZ2lcIiwgICAgbmFtZTogXCJMdWlnaVwiLCAgICAgIHNwcml0ZTogXCJsdWlnaVwiLCAgICBicmFpbjogXCJub3JtYWxcIiB9XHJcbiAgeyBpZDogXCJwZWFjaFwiLCAgICBuYW1lOiBcIlBlYWNoXCIsICAgICAgc3ByaXRlOiBcInBlYWNoXCIsICAgIGJyYWluOiBcIm5vcm1hbFwiIH1cclxuICB7IGlkOiBcImRhaXN5XCIsICAgIG5hbWU6IFwiRGFpc3lcIiwgICAgICBzcHJpdGU6IFwiZGFpc3lcIiwgICAgYnJhaW46IFwibm9ybWFsXCIgfVxyXG4gIHsgaWQ6IFwieW9zaGlcIiwgICAgbmFtZTogXCJZb3NoaVwiLCAgICAgIHNwcml0ZTogXCJ5b3NoaVwiLCAgICBicmFpbjogXCJub3JtYWxcIiB9XHJcbiAgeyBpZDogXCJ0b2FkXCIsICAgICBuYW1lOiBcIlRvYWRcIiwgICAgICAgc3ByaXRlOiBcInRvYWRcIiwgICAgIGJyYWluOiBcIm5vcm1hbFwiIH1cclxuICB7IGlkOiBcImJvd3NlclwiLCAgIG5hbWU6IFwiQm93c2VyXCIsICAgICBzcHJpdGU6IFwiYm93c2VyXCIsICAgYnJhaW46IFwibm9ybWFsXCIgfVxyXG4gIHsgaWQ6IFwiYm93c2VyanJcIiwgbmFtZTogXCJCb3dzZXIgSnJcIiwgIHNwcml0ZTogXCJib3dzZXJqclwiLCBicmFpbjogXCJub3JtYWxcIiB9XHJcbiAgeyBpZDogXCJrb29wYVwiLCAgICBuYW1lOiBcIktvb3BhXCIsICAgICAgc3ByaXRlOiBcImtvb3BhXCIsICAgIGJyYWluOiBcIm5vcm1hbFwiIH1cclxuICB7IGlkOiBcInJvc2FsaW5hXCIsIG5hbWU6IFwiUm9zYWxpbmFcIiwgICBzcHJpdGU6IFwicm9zYWxpbmFcIiwgYnJhaW46IFwibm9ybWFsXCIgfVxyXG4gIHsgaWQ6IFwic2h5Z3V5XCIsICAgbmFtZTogXCJTaHlndXlcIiwgICAgIHNwcml0ZTogXCJzaHlndXlcIiwgICBicmFpbjogXCJub3JtYWxcIiB9XHJcbiAgeyBpZDogXCJ0b2FkZXR0ZVwiLCBuYW1lOiBcIlRvYWRldHRlXCIsICAgc3ByaXRlOiBcInRvYWRldHRlXCIsIGJyYWluOiBcIm5vcm1hbFwiIH1cclxuXVxyXG5cclxuYWlDaGFyYWN0ZXJzID0ge31cclxuZm9yIGNoYXJhY3RlciBpbiBhaUNoYXJhY3Rlckxpc3RcclxuICBhaUNoYXJhY3RlcnNbY2hhcmFjdGVyLmlkXSA9IGNoYXJhY3RlclxyXG5cclxucmFuZG9tQ2hhcmFjdGVyID0gLT5cclxuICByID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogYWlDaGFyYWN0ZXJMaXN0Lmxlbmd0aClcclxuICByZXR1cm4gYWlDaGFyYWN0ZXJMaXN0W3JdXHJcblxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIENhcmRcclxuXHJcbmNsYXNzIENhcmRcclxuICBjb25zdHJ1Y3RvcjogKEByYXcpIC0+XHJcbiAgICBAc3VpdCAgPSBNYXRoLmZsb29yKEByYXcgJSA0KVxyXG4gICAgQHZhbHVlID0gTWF0aC5mbG9vcihAcmF3IC8gNClcclxuICAgIEB2YWx1ZU5hbWUgPSBzd2l0Y2ggQHZhbHVlXHJcbiAgICAgIHdoZW4gIDggdGhlbiAnSidcclxuICAgICAgd2hlbiAgOSB0aGVuICdRJ1xyXG4gICAgICB3aGVuIDEwIHRoZW4gJ0snXHJcbiAgICAgIHdoZW4gMTEgdGhlbiAnQSdcclxuICAgICAgd2hlbiAxMiB0aGVuICcyJ1xyXG4gICAgICBlbHNlXHJcbiAgICAgICAgU3RyaW5nKEB2YWx1ZSArIDMpXHJcbiAgICBAbmFtZSA9IEB2YWx1ZU5hbWUgKyBTaG9ydFN1aXROYW1lW0BzdWl0XVxyXG4gICAgIyBjb25zb2xlLmxvZyBcIiN7QHJhd30gLT4gI3tAbmFtZX1cIlxyXG4gIGdseXBoZWROYW1lOiAtPlxyXG4gICAgcmV0dXJuIEB2YWx1ZU5hbWUgKyBHbHlwaFN1aXROYW1lW0BzdWl0XVxyXG5cclxuY2FyZHNUb1N0cmluZyA9IChyYXdDYXJkcykgLT5cclxuICBjYXJkTmFtZXMgPSBbXVxyXG4gIGZvciByYXcgaW4gcmF3Q2FyZHNcclxuICAgIGNhcmQgPSBuZXcgQ2FyZChyYXcpXHJcbiAgICBjYXJkTmFtZXMucHVzaCBjYXJkLm5hbWVcclxuICByZXR1cm4gXCJbIFwiICsgY2FyZE5hbWVzLmpvaW4oJywnKSArIFwiIF1cIlxyXG5cclxucGxheVR5cGVUb1N0cmluZyA9ICh0eXBlKSAtPlxyXG4gIGlmIG1hdGNoZXMgPSB0eXBlLm1hdGNoKC9ecm9wKFxcZCspLylcclxuICAgIHJldHVybiBcIlJ1biBvZiAje21hdGNoZXNbMV19IFBhaXJzXCJcclxuICBpZiBtYXRjaGVzID0gdHlwZS5tYXRjaCgvXnJ1bihcXGQrKS8pXHJcbiAgICByZXR1cm4gXCJSdW4gb2YgI3ttYXRjaGVzWzFdfVwiXHJcbiAgaWYgbWF0Y2hlcyA9IHR5cGUubWF0Y2goL15raW5kKFxcZCspLylcclxuICAgIGlmIG1hdGNoZXNbMV0gPT0gJzEnXHJcbiAgICAgIHJldHVybiAnU2luZ2xlJ1xyXG4gICAgaWYgbWF0Y2hlc1sxXSA9PSAnMidcclxuICAgICAgcmV0dXJuICdQYWlyJ1xyXG4gICAgaWYgbWF0Y2hlc1sxXSA9PSAnMydcclxuICAgICAgcmV0dXJuICdUcmlwcydcclxuICAgIHJldHVybiAnUXVhZHMnXHJcbiAgcmV0dXJuIHR5cGVcclxuXHJcbnBsYXlUb1N0cmluZyA9IChwbGF5KSAtPlxyXG4gIGhpZ2hDYXJkID0gbmV3IENhcmQocGxheS5oaWdoKVxyXG4gIHJldHVybiBcIiN7cGxheVR5cGVUb1N0cmluZyhwbGF5LnR5cGUpfSAtICN7aGlnaENhcmQuZ2x5cGhlZE5hbWUoKX1cIlxyXG5cclxucGxheVRvQ2FyZENvdW50ID0gKHBsYXkpIC0+XHJcbiAgaWYgbWF0Y2hlcyA9IHBsYXkudHlwZS5tYXRjaCgvXnJvcChcXGQrKS8pXHJcbiAgICByZXR1cm4gcGFyc2VJbnQobWF0Y2hlc1sxXSkgKiAyXHJcbiAgaWYgbWF0Y2hlcyA9IHBsYXkudHlwZS5tYXRjaCgvXnJ1bihcXGQrKS8pXHJcbiAgICByZXR1cm4gcGFyc2VJbnQobWF0Y2hlc1sxXSlcclxuICBpZiBtYXRjaGVzID0gcGxheS50eXBlLm1hdGNoKC9ea2luZChcXGQrKS8pXHJcbiAgICByZXR1cm4gcGFyc2VJbnQobWF0Y2hlc1sxXSlcclxuICByZXR1cm4gMSAjID8/XHJcblxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIERlY2tcclxuXHJcbmNsYXNzIFNodWZmbGVkRGVja1xyXG4gIGNvbnN0cnVjdG9yOiAtPlxyXG4gICAgIyBkYXQgaW5zaWRlLW91dCBzaHVmZmxlIVxyXG4gICAgQGNhcmRzID0gWyAwIF1cclxuICAgIGZvciBpIGluIFsxLi4uNTJdXHJcbiAgICAgIGogPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBpKVxyXG4gICAgICBAY2FyZHMucHVzaChAY2FyZHNbal0pXHJcbiAgICAgIEBjYXJkc1tqXSA9IGlcclxuXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgQWNoaWV2ZW1lbnRzXHJcblxyXG5hY2hpZXZlbWVudHNMaXN0ID0gW1xyXG4gIHtcclxuICAgIGlkOiBcInZldGVyYW5cIlxyXG4gICAgdGl0bGU6IFwiSSd2ZSBTZWVuIFNvbWUgVGhpbmdzXCJcclxuICAgIGRlc2NyaXB0aW9uOiBbXCJQbGF5IDUwIEhhbmRzLlwiXVxyXG4gICAgcHJvZ3Jlc3M6IChhY2gpIC0+XHJcbiAgICAgIGlmIGFjaC5zdGF0ZS50b3RhbEdhbWVzID49IDUwXHJcbiAgICAgICAgcmV0dXJuIFwiVG90YWwgUGxheWVkOiBgYWFmZmFhYCN7YWNoLnN0YXRlLnRvdGFsR2FtZXN9YGAgR2FtZXNcIlxyXG4gICAgICByZXR1cm4gXCJQcm9ncmVzczogI3thY2guc3RhdGUudG90YWxHYW1lc30gLyA1MFwiXHJcbiAgfVxyXG4gIHtcclxuICAgIGlkOiBcInRyeWhhcmRcIlxyXG4gICAgdGl0bGU6IFwiVHJ5aGFyZFwiXHJcbiAgICBkZXNjcmlwdGlvbjogW1wiRWFybiBhIDUgZ2FtZSB3aW4gc3RyZWFrLlwiXVxyXG4gICAgcHJvZ3Jlc3M6IChhY2gpIC0+XHJcbiAgICAgIGJlc3RTdHJlYWsgPSBhY2guc3RhdGUuYmVzdFN0cmVha1xyXG4gICAgICBiZXN0U3RyZWFrID89IDBcclxuICAgICAgaWYgYmVzdFN0cmVhayA+PSA1XHJcbiAgICAgICAgcmV0dXJuIFwiQmVzdCBTdHJlYWs6IGBhYWZmYWFgI3tiZXN0U3RyZWFrfWBgIFdpbnNcIlxyXG4gICAgICBzID0gXCJcIlxyXG4gICAgICBpZiBiZXN0U3RyZWFrID4gMVxyXG4gICAgICAgIHMgPSBcInNcIlxyXG4gICAgICByZXR1cm4gXCJCZXN0IFN0cmVhazogI3tiZXN0U3RyZWFrfSBXaW4je3N9XCJcclxuICB9XHJcbiAge1xyXG4gICAgaWQ6IFwiYnJlYWtlclwiXHJcbiAgICB0aXRsZTogXCJTcHJpbmcgQnJlYWtcIlxyXG4gICAgZGVzY3JpcHRpb246IFtcIkJyZWFrIGEgMi5cIl1cclxuICB9XHJcbiAge1xyXG4gICAgaWQ6IFwia2VlcGl0bG93XCJcclxuICAgIHRpdGxlOiBcIktlZXAgSXQgTG93LCBCb3lzXCJcclxuICAgIGRlc2NyaXB0aW9uOiBbXCJQbGF5IGEgU2luZ2xlIDIgb24gdG9wIG9mIGEgU2luZ2xlIDMuXCJdXHJcbiAgfVxyXG4gIHtcclxuICAgIGlkOiBcInN1aXRlZFwiXHJcbiAgICB0aXRsZTogXCJEb2Vzbid0IEV2ZW4gTWF0dGVyXCJcclxuICAgIGRlc2NyaXB0aW9uOiBbXCJUaHJvdyBhIHN1aXRlZCBydW4uXCJdXHJcbiAgfVxyXG4gIHtcclxuICAgIGlkOiBcInRvbnlcIlxyXG4gICAgdGl0bGU6IFwiVGhlIFRvbnlcIlxyXG4gICAgZGVzY3JpcHRpb246IFtcIlRocm93IGEgcnVuIG9mIDcgb3IgbW9yZSBjYXJkcywgYW5kIHRoZW4gbG9zZS5cIl1cclxuICB9XHJcbiAge1xyXG4gICAgaWQ6IFwic2FtcGxlclwiXHJcbiAgICB0aXRsZTogXCJTYW1wbGVyIFBsYXR0ZXJcIlxyXG4gICAgZGVzY3JpcHRpb246IFtcIkluIGEgc2luZ2xlIGhhbmQ6IHBsYXkgYXQgbGVhc3Qgb25lIFNpbmdsZSxcIiwgXCJvbmUgUGFpciwgb25lIFRyaXBzLCBhbmQgb25lIFJ1bi5cIl1cclxuICB9XHJcbiAge1xyXG4gICAgaWQ6IFwidHJhZ2VkeVwiXHJcbiAgICB0aXRsZTogXCJUcmFnZWR5XCJcclxuICAgIGRlc2NyaXB0aW9uOiBbXCJCZWdpbiB0aGUgZ2FtZSBieSB0aHJvd2luZyBhIHR3byBicmVha2VyIGludm9sdmluZ1wiLCBcInRoZSAzIG9mIFNwYWRlcy5cIl1cclxuICB9XHJcbiAge1xyXG4gICAgaWQ6IFwiaW5kb21pdGFibGVcIlxyXG4gICAgdGl0bGU6IFwiSW5kb21pdGFibGVcIlxyXG4gICAgZGVzY3JpcHRpb246IFtcIlRocm93IGEgcnVuIGVuZGluZyBpbiB0aGUgQWNlIG9mIEhlYXJ0cy5cIl1cclxuICB9XHJcbiAge1xyXG4gICAgaWQ6IFwicmVrdFwiXHJcbiAgICB0aXRsZTogXCJHZXQgUmVrdFwiXHJcbiAgICBkZXNjcmlwdGlvbjogW1wiV2luIHdoaWxlIGFsbCBvcHBvbmVudHMgc3RpbGwgaGF2ZSAxMCBvciBtb3JlIGNhcmRzLlwiXVxyXG4gIH1cclxuICB7XHJcbiAgICBpZDogXCJsYXRlXCJcclxuICAgIHRpdGxlOiBcIkZhc2hpb25hYmx5IExhdGVcIlxyXG4gICAgZGVzY3JpcHRpb246IFtcIlBhc3MgdW50aWwgYWxsIDQgMnMgYXJlIHRocm93biwgYW5kIHRoZW4gd2luLlwiXVxyXG4gIH1cclxuICB7XHJcbiAgICBpZDogXCJwYWlyc1wiXHJcbiAgICB0aXRsZTogXCJQYWlyaW5nIFVwXCJcclxuICAgIGRlc2NyaXB0aW9uOiBbXCJUaHJvdyA1IHBhaXJzIGluIGEgc2luZ2xlIHJvdW5kLlwiXVxyXG4gIH1cclxuICB7XHJcbiAgICBpZDogXCJ5b3Vyc2VsZlwiXHJcbiAgICB0aXRsZTogXCJZb3UgUGxheWVkIFlvdXJzZWxmXCJcclxuICAgIGRlc2NyaXB0aW9uOiBbXCJCZWF0IHlvdXIgb3duIHBsYXkuXCJdXHJcbiAgfVxyXG4gIHtcclxuICAgIGlkOiBcInRoaXJ0ZWVuXCJcclxuICAgIHRpdGxlOiBcIlRoaXJ0ZWVuXCJcclxuICAgIGRlc2NyaXB0aW9uOiBbXCJFYXJuIDEzIGFjaGlldmVtZW50cy5cIl1cclxuICB9XHJcbl1cclxuXHJcbmFjaGlldmVtZW50c01hcCA9IHt9XHJcbmZvciBlIGluIGFjaGlldmVtZW50c0xpc3RcclxuICBhY2hpZXZlbWVudHNNYXBbZS5pZF0gPSBlXHJcblxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIFRoaXJ0ZWVuXHJcblxyXG5jbGFzcyBUaGlydGVlblxyXG4gIGNvbnN0cnVjdG9yOiAoQGdhbWUsIHBhcmFtcykgLT5cclxuICAgIHJldHVybiBpZiBub3QgcGFyYW1zXHJcblxyXG4gICAgaWYgcGFyYW1zLnN0YXRlXHJcbiAgICAgIGZvciBrLHYgb2YgcGFyYW1zLnN0YXRlXHJcbiAgICAgICAgaWYgcGFyYW1zLnN0YXRlLmhhc093blByb3BlcnR5KGspXHJcbiAgICAgICAgICB0aGlzW2tdID0gcGFyYW1zLnN0YXRlW2tdXHJcbiAgICAgIEBpbml0QWNoaWV2ZW1lbnRzKClcclxuICAgIGVsc2VcclxuICAgICAgQG5ld0dhbWUocGFyYW1zLm1vbmV5KVxyXG5cclxuICBpbml0QWNoaWV2ZW1lbnRzOiAtPlxyXG4gICAgQGFjaCA/PSB7fVxyXG4gICAgQGFjaC5lYXJuZWQgPz0ge31cclxuICAgIEBhY2guc3RhdGUgPz0ge31cclxuICAgIEBhY2guc3RhdGUudG90YWxHYW1lcyA/PSAwXHJcbiAgICBAZmFuZmFyZXMgPSBbXVxyXG5cclxuICBkZWFsOiAocGFyYW1zKSAtPlxyXG4gICAgZGVjayA9IG5ldyBTaHVmZmxlZERlY2soKVxyXG4gICAgZm9yIHBsYXllciwgcGxheWVySW5kZXggaW4gQHBsYXllcnNcclxuICAgICAgQGdhbWUubG9nIFwiZGVhbGluZyAxMyBjYXJkcyB0byBwbGF5ZXIgI3twbGF5ZXJJbmRleH1cIlxyXG5cclxuICAgICAgcGxheWVyLnBsYWNlID0gMFxyXG4gICAgICBwbGF5ZXIuaGFuZCA9IFtdXHJcbiAgICAgIGZvciBqIGluIFswLi4uMTNdXHJcbiAgICAgICAgcmF3ID0gZGVjay5jYXJkcy5zaGlmdCgpXHJcbiAgICAgICAgaWYgcmF3ID09IDBcclxuICAgICAgICAgIEB0dXJuID0gcGxheWVySW5kZXhcclxuICAgICAgICBwbGF5ZXIuaGFuZC5wdXNoKHJhdylcclxuXHJcbiAgICAgICMgY29uc29sZS5sb2cgXCJAZ2FtZS5vcHRpb25zLnNvcnRJbmRleCAje0BnYW1lLm9wdGlvbnMuc29ydEluZGV4fVwiXHJcbiAgICAgIGlmIChAZ2FtZS5vcHRpb25zLnNvcnRJbmRleCA9PSAwKSBvciBwbGF5ZXIuYWlcclxuICAgICAgICAjIE5vcm1hbFxyXG4gICAgICAgIHBsYXllci5oYW5kLnNvcnQgKGEsYikgLT4gcmV0dXJuIGEgLSBiXHJcbiAgICAgIGVsc2VcclxuICAgICAgICAjIFJldmVyc2VcclxuICAgICAgICBwbGF5ZXIuaGFuZC5zb3J0IChhLGIpIC0+IHJldHVybiBiIC0gYVxyXG5cclxuICAgIEBpbml0QWNoaWV2ZW1lbnRzKClcclxuICAgIEBhY2guc3RhdGUudGhyZXdTaW5nbGUgPSBmYWxzZVxyXG4gICAgQGFjaC5zdGF0ZS50aHJld1BhaXIgPSBmYWxzZVxyXG4gICAgQGFjaC5zdGF0ZS50aHJld1RyaXBzID0gZmFsc2VcclxuICAgIEBhY2guc3RhdGUudGhyZXdSdW4gPSBmYWxzZVxyXG4gICAgQGFjaC5zdGF0ZS50aHJld1J1bjcgPSBmYWxzZVxyXG4gICAgQGFjaC5zdGF0ZS50d29zU2VlbiA9IDBcclxuICAgIEBhY2guc3RhdGUuZmFzaGlvbmFibHlMYXRlID0gZmFsc2VcclxuICAgIEBhY2guc3RhdGUucGFpcnNUaHJvd24gPSAwXHJcbiAgICBAYWNoLnN0YXRlLmJlc3RTdHJlYWsgPz0gMFxyXG5cclxuICAgIEBwaWxlID0gW11cclxuICAgIEBwaWxlV2hvID0gLTFcclxuICAgIEB0aHJvd0lEID0gMFxyXG4gICAgQGN1cnJlbnRQbGF5ID0gbnVsbFxyXG4gICAgQHVucGFzc0FsbCgpXHJcblxyXG4gICAgZm9yTW9uZXkgPSBcIlwiXHJcbiAgICBpZiBAbW9uZXlcclxuICAgICAgZm9yTW9uZXkgPSBcIiAoZm9yIG1vbmV5KVwiXHJcbiAgICBAb3V0cHV0KFwiSGFuZCBkZWFsdCN7Zm9yTW9uZXl9LCBcIiArIEBwbGF5ZXJzW0B0dXJuXS5uYW1lICsgXCIgcGxheXMgZmlyc3RcIilcclxuXHJcbiAgICByZXR1cm4gT0tcclxuXHJcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAjIFRoaXJ0ZWVuIG1ldGhvZHNcclxuXHJcbiAgbmV3R2FtZTogKG1vbmV5ID0gZmFsc2UpIC0+XHJcbiAgICAjIG5ldyBnYW1lXHJcbiAgICBAbG9nID0gW11cclxuICAgIEBzdHJlYWsgPSAwXHJcbiAgICBAbGFzdFN0cmVhayA9IDBcclxuICAgIEBtb25leSA9IGZhbHNlXHJcbiAgICBpZiBtb25leVxyXG4gICAgICBAbW9uZXkgPSB0cnVlXHJcbiAgICBjb25zb2xlLmxvZyBcImZvciBtb25leTogI3tAbW9uZXl9XCJcclxuXHJcbiAgICBAcGxheWVycyA9IFtcclxuICAgICAgeyBpZDogMSwgbmFtZTogJ1BsYXllcicsIGluZGV4OiAwLCBwYXNzOiBmYWxzZSwgbW9uZXk6IFNUQVJUSU5HX01PTkVZIH1cclxuICAgIF1cclxuXHJcbiAgICBmb3IgaSBpbiBbMS4uLjRdXHJcbiAgICAgIEBhZGRBSSgpXHJcblxyXG4gICAgQGRlYWwoKVxyXG5cclxuICBzYXZlOiAtPlxyXG4gICAgbmFtZXMgPSBcImxvZyBwbGF5ZXJzIHR1cm4gcGlsZSBwaWxlV2hvIHRocm93SUQgY3VycmVudFBsYXkgc3RyZWFrIGxhc3RTdHJlYWsgYWNoIG1vbmV5XCIuc3BsaXQoXCIgXCIpXHJcbiAgICBzdGF0ZSA9IHt9XHJcbiAgICBmb3IgbmFtZSBpbiBuYW1lc1xyXG4gICAgICBzdGF0ZVtuYW1lXSA9IHRoaXNbbmFtZV1cclxuICAgIHJldHVybiBzdGF0ZVxyXG5cclxuICBvdXRwdXQ6ICh0ZXh0KSAtPlxyXG4gICAgQGxvZy5wdXNoIHRleHRcclxuICAgIHdoaWxlIEBsb2cubGVuZ3RoID4gTUFYX0xPR19MSU5FU1xyXG4gICAgICBAbG9nLnNoaWZ0KClcclxuXHJcbiAgaGVhZGxpbmU6IC0+XHJcbiAgICBpZiBAZ2FtZU92ZXIoKVxyXG4gICAgICByZXR1cm4gXCJHYW1lIE92ZXJcIlxyXG5cclxuICAgIGlmIEBwaWxlLmxlbmd0aCA9PSAwXHJcbiAgICAgIHBsYXlTdHJpbmcgPSBcInRocm93IEFueXRoaW5nIHdpdGggdGhlIDNcXHhjOFwiXHJcbiAgICBlbHNlXHJcbiAgICAgIGlmIEBjdXJyZW50UGxheVxyXG4gICAgICAgIHBsYXlTdHJpbmcgPSBcImJlYXQgXCIgKyBwbGF5VG9TdHJpbmcoQGN1cnJlbnRQbGF5KVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgcGxheVN0cmluZyA9IFwidGhyb3cgQW55dGhpbmdcIlxyXG5cclxuICAgIGN1cnJlbnRQbGF5ZXIgPSBAY3VycmVudFBsYXllcigpXHJcbiAgICBpZiBjdXJyZW50UGxheWVyLmFpXHJcbiAgICAgIHBsYXllckNvbG9yID0gJ2IwYjAwMCdcclxuICAgIGVsc2VcclxuICAgICAgcGxheWVyQ29sb3IgPSAnZmY3NzAwJ1xyXG4gICAgaGVhZGxpbmUgPSBcImAje3BsYXllckNvbG9yfWAje2N1cnJlbnRQbGF5ZXIubmFtZX1gZmZmZmZmYCB0byAje3BsYXlTdHJpbmd9XCJcclxuICAgIGlmIEBldmVyeW9uZVBhc3NlZCgpXHJcbiAgICAgIGhlYWRsaW5lICs9IFwiIChvciB0aHJvdyBhbnl0aGluZylcIlxyXG4gICAgcmV0dXJuIGhlYWRsaW5lXHJcblxyXG4gIGZpbmRQbGF5ZXI6IChpZCkgLT5cclxuICAgIGZvciBwbGF5ZXIgaW4gQHBsYXllcnNcclxuICAgICAgaWYgcGxheWVyLmlkID09IGlkXHJcbiAgICAgICAgcmV0dXJuIHBsYXllclxyXG4gICAgcmV0dXJuIHVuZGVmaW5lZFxyXG5cclxuICBjdXJyZW50UGxheWVyOiAtPlxyXG4gICAgcmV0dXJuIEBwbGF5ZXJzW0B0dXJuXVxyXG5cclxuICBmaW5kUGxhY2U6IChwbGFjZSkgLT5cclxuICAgIGZvciBwbGF5ZXIgaW4gQHBsYXllcnNcclxuICAgICAgaWYgKHBsYWNlID09IDQpIGFuZCAocGxheWVyLnBsYWNlID09IDApXHJcbiAgICAgICAgcmV0dXJuIHBsYXllclxyXG4gICAgICBpZiBwbGF5ZXIucGxhY2UgPT0gcGxhY2VcclxuICAgICAgICByZXR1cm4gcGxheWVyXHJcbiAgICByZXR1cm4gdW5kZWZpbmVkXHJcblxyXG4gIHBheW91dDogLT5cclxuICAgIHBsYWNlMSA9IEBmaW5kUGxhY2UoMSlcclxuICAgIHBsYWNlMiA9IEBmaW5kUGxhY2UoMilcclxuICAgIHBsYWNlMyA9IEBmaW5kUGxhY2UoMylcclxuICAgIHBsYWNlNCA9IEBmaW5kUGxhY2UoNClcclxuXHJcbiAgICBpZiBub3QgcGxhY2UxIG9yIG5vdCBwbGFjZTIgb3Igbm90IHBsYWNlMyBvciBub3QgcGxhY2U0XHJcbiAgICAgIEBvdXRwdXQgXCJlcnJvciB3aXRoIHBheW91dHMhXCJcclxuICAgICAgcmV0dXJuXHJcblxyXG4gICAgQG91dHB1dCBcIiN7cGxhY2U0Lm5hbWV9IHBheXMgJDIgdG8gI3twbGFjZTEubmFtZX1cIlxyXG4gICAgQG91dHB1dCBcIiN7cGxhY2UzLm5hbWV9IHBheXMgJDEgdG8gI3twbGFjZTIubmFtZX1cIlxyXG5cclxuICAgIHBsYWNlMS5tb25leSArPSAyXHJcbiAgICBwbGFjZTIubW9uZXkgKz0gMVxyXG4gICAgcGxhY2UzLm1vbmV5ICs9IC0xXHJcbiAgICBwbGFjZTQubW9uZXkgKz0gLTJcclxuICAgIHJldHVyblxyXG5cclxuICAjIGFsbCBJTkNMVURJTkcgdGhlIGN1cnJlbnQgcGxheWVyXHJcbiAgZW50aXJlVGFibGVQYXNzZWQ6IC0+XHJcbiAgICBmb3IgcGxheWVyLCBwbGF5ZXJJbmRleCBpbiBAcGxheWVyc1xyXG4gICAgICBpZiBwbGF5ZXIucGxhY2UgIT0gMFxyXG4gICAgICAgIGNvbnRpbnVlXHJcbiAgICAgIGlmIG5vdCBwbGF5ZXIucGFzc1xyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgcmV0dXJuIHRydWVcclxuXHJcbiAgIyBhbGwgYnV0IHRoZSBjdXJyZW50IHBsYXllclxyXG4gIGV2ZXJ5b25lUGFzc2VkOiAtPlxyXG4gICAgZm9yIHBsYXllciwgcGxheWVySW5kZXggaW4gQHBsYXllcnNcclxuICAgICAgaWYgKHBsYXllci5wbGFjZSAhPSAwKSBhbmQgKEBwaWxlV2hvICE9IHBsYXllckluZGV4KVxyXG4gICAgICAgIGNvbnRpbnVlXHJcbiAgICAgIGlmIHBsYXllckluZGV4ID09IEB0dXJuXHJcbiAgICAgICAgY29udGludWVcclxuICAgICAgaWYgbm90IHBsYXllci5wYXNzXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICBwbGF5ZXJBZnRlcjogKGluZGV4KSAtPlxyXG4gICAgbG9vcFxyXG4gICAgICBpbmRleCA9IChpbmRleCArIDEpICUgQHBsYXllcnMubGVuZ3RoXHJcbiAgICAgIGlmIEBwbGF5ZXJzW2luZGV4XS5wbGFjZSA9PSAwXHJcbiAgICAgICAgcmV0dXJuIGluZGV4XHJcbiAgICByZXR1cm4gMCAjIGltcG9zc2libGU/XHJcblxyXG4gIGFkZFBsYXllcjogKHBsYXllcikgLT5cclxuICAgIGlmIG5vdCBwbGF5ZXIuYWlcclxuICAgICAgcGxheWVyLmFpID0gZmFsc2VcclxuXHJcbiAgICBAcGxheWVycy5wdXNoIHBsYXllclxyXG4gICAgcGxheWVyLmluZGV4ID0gQHBsYXllcnMubGVuZ3RoIC0gMVxyXG4gICAgQG91dHB1dChwbGF5ZXIubmFtZSArIFwiIGpvaW5zIHRoZSBnYW1lXCIpXHJcblxyXG4gIG5hbWVQcmVzZW50OiAobmFtZSkgLT5cclxuICAgIGZvciBwbGF5ZXIgaW4gQHBsYXllcnNcclxuICAgICAgaWYgcGxheWVyLm5hbWUgPT0gbmFtZVxyXG4gICAgICAgIHJldHVybiB0cnVlXHJcblxyXG4gICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gIGFkZEFJOiAtPlxyXG4gICAgbG9vcFxyXG4gICAgICBjaGFyYWN0ZXIgPSByYW5kb21DaGFyYWN0ZXIoKVxyXG4gICAgICBpZiBub3QgQG5hbWVQcmVzZW50KGNoYXJhY3Rlci5uYW1lKVxyXG4gICAgICAgIGJyZWFrXHJcblxyXG4gICAgYWkgPVxyXG4gICAgICBjaGFySUQ6IGNoYXJhY3Rlci5pZFxyXG4gICAgICBuYW1lOiBjaGFyYWN0ZXIubmFtZVxyXG4gICAgICBpZDogJ2FpJyArIFN0cmluZyhAcGxheWVycy5sZW5ndGgpXHJcbiAgICAgIHBhc3M6IGZhbHNlXHJcbiAgICAgIGFpOiB0cnVlXHJcbiAgICAgIG1vbmV5OiBTVEFSVElOR19NT05FWVxyXG5cclxuICAgIEBhZGRQbGF5ZXIoYWkpXHJcblxyXG4gICAgQGdhbWUubG9nKFwiYWRkZWQgQUkgcGxheWVyXCIpXHJcbiAgICByZXR1cm4gT0tcclxuXHJcbiAgdXBkYXRlUGxheWVySGFuZDogKGNhcmRzKSAtPlxyXG4gICAgIyBUaGlzIG1haW50YWlucyB0aGUgcmVvcmdhbml6ZWQgb3JkZXIgb2YgdGhlIHBsYXllcidzIGhhbmRcclxuICAgIEBwbGF5ZXJzWzBdLmhhbmQgPSBjYXJkcy5zbGljZSgwKVxyXG5cclxuICB3aW5uZXI6IC0+XHJcbiAgICBmb3IgcGxheWVyLCBpIGluIEBwbGF5ZXJzXHJcbiAgICAgIGlmIHBsYXllci5wbGFjZSA9PSAxXHJcbiAgICAgICAgcmV0dXJuIHBsYXllclxyXG4gICAgcmV0dXJuIG51bGxcclxuXHJcbiAgZ2FtZU92ZXI6IC0+XHJcbiAgICBucCA9IEBuZXh0UGxhY2UoKVxyXG4gICAgaWYgQG1vbmV5XHJcbiAgICAgIHJldHVybiAobnAgPiAzKVxyXG4gICAgcmV0dXJuIChucCA+IDEpXHJcblxyXG4gIGhhc0NhcmQ6IChoYW5kLCByYXdDYXJkKSAtPlxyXG4gICAgZm9yIHJhdyBpbiBoYW5kXHJcbiAgICAgIGlmIHJhdyA9PSByYXdDYXJkXHJcbiAgICAgICAgcmV0dXJuIHRydWVcclxuICAgIHJldHVybiBmYWxzZVxyXG5cclxuICBoYXNDYXJkczogKGhhbmQsIHJhd0NhcmRzKSAtPlxyXG4gICAgZm9yIHJhdyBpbiByYXdDYXJkc1xyXG4gICAgICBpZiBub3QgQGhhc0NhcmQoaGFuZCwgcmF3KVxyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgcmV0dXJuIHRydWVcclxuXHJcbiAgcmVtb3ZlQ2FyZHM6IChoYW5kLCByYXdDYXJkcykgLT5cclxuICAgIG5ld0hhbmQgPSBbXVxyXG4gICAgZm9yIGNhcmQgaW4gaGFuZFxyXG4gICAgICBrZWVwTWUgPSB0cnVlXHJcbiAgICAgIGZvciByYXcgaW4gcmF3Q2FyZHNcclxuICAgICAgICBpZiBjYXJkID09IHJhd1xyXG4gICAgICAgICAga2VlcE1lID0gZmFsc2VcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgIGlmIGtlZXBNZVxyXG4gICAgICAgIG5ld0hhbmQucHVzaCBjYXJkXHJcbiAgICByZXR1cm4gbmV3SGFuZFxyXG5cclxuICBjbGFzc2lmeTogKHJhd0NhcmRzKSAtPlxyXG4gICAgY2FyZHMgPSByYXdDYXJkcy5tYXAgKHJhdykgLT4gbmV3IENhcmQocmF3KVxyXG4gICAgY2FyZHMgPSBjYXJkcy5zb3J0IChhLCBiKSAtPiByZXR1cm4gYS5yYXcgLSBiLnJhd1xyXG4gICAgaGlnaGVzdFJhdyA9IGNhcmRzW2NhcmRzLmxlbmd0aCAtIDFdLnJhd1xyXG5cclxuICAgICMgbG9vayBmb3IgYSBydW4gb2YgcGFpcnNcclxuICAgIGlmIChjYXJkcy5sZW5ndGggPj0gNikgYW5kICgoY2FyZHMubGVuZ3RoICUgMikgPT0gMClcclxuICAgICAgZm91bmRSb3AgPSB0cnVlXHJcbiAgICAgIGZvciBjYXJkLCBjYXJkSW5kZXggaW4gY2FyZHNcclxuICAgICAgICBpZiBjYXJkSW5kZXggPT0gMFxyXG4gICAgICAgICAgY29udGludWVcclxuICAgICAgICBpZiBjYXJkLnZhbHVlID09IDEyXHJcbiAgICAgICAgICAjIG5vIDJzIGluIGEgcnVuXHJcbiAgICAgICAgICBmb3VuZFJvcCA9IGZhbHNlXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGlmIChjYXJkSW5kZXggJSAyKSA9PSAxXHJcbiAgICAgICAgICAjIG9kZCBjYXJkLCBtdXN0IG1hdGNoIGxhc3QgY2FyZCBleGFjdGx5XHJcbiAgICAgICAgICBpZiBjYXJkLnZhbHVlICE9IChjYXJkc1tjYXJkSW5kZXggLSAxXS52YWx1ZSlcclxuICAgICAgICAgICAgZm91bmRSb3AgPSBmYWxzZVxyXG4gICAgICAgICAgICBicmVha1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICMgZXZlbiBjYXJkLCBtdXN0IGluY3JlbWVudFxyXG4gICAgICAgICAgaWYgY2FyZC52YWx1ZSAhPSAoY2FyZHNbY2FyZEluZGV4IC0gMV0udmFsdWUgKyAxKVxyXG4gICAgICAgICAgICBmb3VuZFJvcCA9IGZhbHNlXHJcbiAgICAgICAgICAgIGJyZWFrXHJcblxyXG4gICAgICBpZiBmb3VuZFJvcFxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAncm9wJyArIE1hdGguZmxvb3IoY2FyZHMubGVuZ3RoIC8gMilcclxuICAgICAgICAgIGhpZ2g6IGhpZ2hlc3RSYXdcclxuICAgICAgICB9XHJcblxyXG4gICAgIyBsb29rIGZvciBhIHJ1blxyXG4gICAgaWYgY2FyZHMubGVuZ3RoID49IDNcclxuICAgICAgZm91bmRSdW4gPSB0cnVlXHJcbiAgICAgIGZvciBjYXJkLCBjYXJkSW5kZXggaW4gY2FyZHNcclxuICAgICAgICBpZiBjYXJkSW5kZXggPT0gMFxyXG4gICAgICAgICAgY29udGludWVcclxuICAgICAgICBpZiBjYXJkLnZhbHVlID09IDEyXHJcbiAgICAgICAgICAjIG5vIDJzIGluIGEgcnVuXHJcbiAgICAgICAgICBmb3VuZFJ1biA9IGZhbHNlXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGlmIGNhcmQudmFsdWUgIT0gKGNhcmRzW2NhcmRJbmRleCAtIDFdLnZhbHVlICsgMSlcclxuICAgICAgICAgIGZvdW5kUnVuID0gZmFsc2VcclxuICAgICAgICAgIGJyZWFrXHJcblxyXG4gICAgICBpZiBmb3VuZFJ1blxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICB0eXBlOiAncnVuJyArIGNhcmRzLmxlbmd0aFxyXG4gICAgICAgICAgaGlnaDogaGlnaGVzdFJhd1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAjIGxvb2sgZm9yIFggb2YgYSBraW5kXHJcbiAgICByZXFWYWx1ZSA9IGNhcmRzWzBdLnZhbHVlXHJcbiAgICBmb3IgY2FyZCBpbiBjYXJkc1xyXG4gICAgICBpZiBjYXJkLnZhbHVlICE9IHJlcVZhbHVlXHJcbiAgICAgICAgcmV0dXJuIG51bGxcclxuICAgIHR5cGUgPSAna2luZCcgKyBjYXJkcy5sZW5ndGhcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHR5cGU6IHR5cGVcclxuICAgICAgaGlnaDogaGlnaGVzdFJhd1xyXG4gICAgfVxyXG5cclxuICBoYW5kSGFzM1M6IChoYW5kKSAtPlxyXG4gICAgZm9yIHJhdyBpbiBoYW5kXHJcbiAgICAgIGlmIHJhdyA9PSAwXHJcbiAgICAgICAgcmV0dXJuIHRydWVcclxuICAgIHJldHVybiBmYWxzZVxyXG5cclxuICBuZXh0UGxhY2U6IC0+XHJcbiAgICBoaWdoZXN0UGxhY2UgPSAwXHJcbiAgICBmb3IgcGxheWVyIGluIEBwbGF5ZXJzXHJcbiAgICAgIHBsYXllci5wbGFjZSA/PSAwXHJcbiAgICAgIGlmIGhpZ2hlc3RQbGFjZSA8IHBsYXllci5wbGFjZVxyXG4gICAgICAgIGhpZ2hlc3RQbGFjZSA9IHBsYXllci5wbGFjZVxyXG4gICAgcmV0dXJuIGhpZ2hlc3RQbGFjZSArIDFcclxuXHJcbiAgY2FuUGFzczogKHBhcmFtcykgLT5cclxuICAgIGlmIEBnYW1lT3ZlcigpXHJcbiAgICAgIHJldHVybiAnZ2FtZU92ZXInXHJcblxyXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcclxuICAgIGlmIHBhcmFtcy5pZCAhPSBjdXJyZW50UGxheWVyLmlkXHJcbiAgICAgIHJldHVybiAnbm90WW91clR1cm4nXHJcblxyXG4gICAgaWYgQHBpbGUubGVuZ3RoID09IDBcclxuICAgICAgcmV0dXJuICdtdXN0VGhyb3czUydcclxuXHJcbiAgICBpZiBAZXZlcnlvbmVQYXNzZWQoKVxyXG4gICAgICByZXR1cm4gJ3Rocm93QW55dGhpbmcnXHJcblxyXG4gICAgcmV0dXJuIE9LXHJcblxyXG4gIGNhblBsYXk6IChwYXJhbXMsIGluY29taW5nUGxheSwgaGFuZEhhczNTKSAtPlxyXG4gICAgaWYgQGdhbWVPdmVyKClcclxuICAgICAgcmV0dXJuICdnYW1lT3ZlcidcclxuXHJcbiAgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxyXG4gICAgaWYgcGFyYW1zLmlkICE9IGN1cnJlbnRQbGF5ZXIuaWRcclxuICAgICAgcmV0dXJuICdub3RZb3VyVHVybidcclxuXHJcbiAgICBpZiBpbmNvbWluZ1BsYXkgPT0gbnVsbFxyXG4gICAgICByZXR1cm4gJ2ludmFsaWRQbGF5J1xyXG5cclxuICAgIGlmIEBwaWxlLmxlbmd0aCA9PSAwXHJcbiAgICAgIGlmIG5vdCBoYW5kSGFzM1NcclxuICAgICAgICByZXR1cm4gJ211c3RUaHJvdzNTJ1xyXG5cclxuICAgIGN1cnJlbnRQbGF5ZXIgPSBAY3VycmVudFBsYXllcigpXHJcbiAgICBpZiBjdXJyZW50UGxheWVyLnBhc3NcclxuICAgICAgaWYgQGN1cnJlbnRQbGF5IGFuZCBAY2FuQmVCcm9rZW4oQGN1cnJlbnRQbGF5KVxyXG4gICAgICAgIGlmIEBpc0JyZWFrZXJUeXBlKGluY29taW5nUGxheS50eXBlKVxyXG4gICAgICAgICAgcmV0dXJuIE9LXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgcmV0dXJuICdtdXN0QnJlYWtPclBhc3MnXHJcbiAgICAgIHJldHVybiAnbXVzdFBhc3MnXHJcblxyXG4gICAgaWYgQGN1cnJlbnRQbGF5ID09IG51bGxcclxuICAgICAgcmV0dXJuIE9LXHJcblxyXG4gICAgaWYgQGV2ZXJ5b25lUGFzc2VkKClcclxuICAgICAgcmV0dXJuIE9LXHJcblxyXG4gICAgaWYgQGNhbkJlQnJva2VuKEBjdXJyZW50UGxheSkgYW5kIEBpc0JyZWFrZXJUeXBlKGluY29taW5nUGxheS50eXBlKVxyXG4gICAgICAjIDIgYnJlYWtlciFcclxuICAgICAgcmV0dXJuIE9LXHJcblxyXG4gICAgaWYgaW5jb21pbmdQbGF5LnR5cGUgIT0gQGN1cnJlbnRQbGF5LnR5cGVcclxuICAgICAgcmV0dXJuICd3cm9uZ1BsYXknXHJcblxyXG4gICAgaWYgaW5jb21pbmdQbGF5LmhpZ2ggPCBAY3VycmVudFBsYXkuaGlnaFxyXG4gICAgICByZXR1cm4gJ3Rvb0xvd1BsYXknXHJcblxyXG4gICAgcmV0dXJuIE9LXHJcblxyXG4gIHBsYXk6IChwYXJhbXMpIC0+XHJcbiAgICBpbmNvbWluZ1BsYXkgPSBAY2xhc3NpZnkocGFyYW1zLmNhcmRzKVxyXG4gICAgY29uc29sZS5sb2cgXCJpbmNvbWluZ1BsYXlcIiwgaW5jb21pbmdQbGF5XHJcblxyXG4gICAgY29uc29sZS5sb2cgXCJzb21lb25lIGNhbGxpbmcgcGxheVwiLCBwYXJhbXNcclxuICAgIHJldCA9IEBjYW5QbGF5KHBhcmFtcywgaW5jb21pbmdQbGF5LCBAaGFuZEhhczNTKHBhcmFtcy5jYXJkcykpXHJcbiAgICBpZiByZXQgIT0gT0tcclxuICAgICAgcmV0dXJuIHJldFxyXG5cclxuICAgIGJyZWFrZXJUaHJvd24gPSBmYWxzZVxyXG4gICAgbmV3VGhyb3cgPSB0cnVlXHJcblxyXG4gICAgIyBUT0RPOiBtYWtlIHByZXR0eSBuYW1lcyBiYXNlZCBvbiB0aGUgcGxheSwgYWRkIHBsYXkgdG8gaGVhZGxpbmVcclxuICAgIHZlcmIgPSBcInRocm93czpcIlxyXG4gICAgaWYgQGN1cnJlbnRQbGF5XHJcbiAgICAgIGlmIEBjYW5CZUJyb2tlbihAY3VycmVudFBsYXkpIGFuZCBAaXNCcmVha2VyVHlwZShpbmNvbWluZ1BsYXkudHlwZSlcclxuICAgICAgICAjIDIgYnJlYWtlciFcclxuICAgICAgICBAdW5wYXNzQWxsKClcclxuICAgICAgICB2ZXJiID0gXCJicmVha3MgMjpcIlxyXG4gICAgICAgIGJyZWFrZXJUaHJvd24gPSB0cnVlXHJcbiAgICAgICAgbmV3VGhyb3cgPSBmYWxzZVxyXG4gICAgICBlbHNlIGlmIChpbmNvbWluZ1BsYXkudHlwZSAhPSBAY3VycmVudFBsYXkudHlwZSkgb3IgKGluY29taW5nUGxheS5oaWdoIDwgQGN1cnJlbnRQbGF5LmhpZ2gpXHJcbiAgICAgICAgIyBOZXcgcGxheSFcclxuICAgICAgICBAdW5wYXNzQWxsKClcclxuICAgICAgICB2ZXJiID0gXCJ0aHJvd3MgbmV3OlwiXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBuZXdUaHJvdyA9IGZhbHNlXHJcbiAgICBlbHNlXHJcbiAgICAgIHZlcmIgPSBcImJlZ2luczpcIlxyXG5cclxuICAgICMgQWNoaWV2ZW1lbnRzXHJcbiAgICBAYWNoLnN0YXRlLnR3b3NTZWVuID89IDBcclxuICAgIEBhY2guc3RhdGUucGFpcnNUaHJvd24gPz0gMFxyXG4gICAgZm9yIGNhcmQgaW4gcGFyYW1zLmNhcmRzXHJcbiAgICAgIGlmIGNhcmQgPj0gNDhcclxuICAgICAgICBAYWNoLnN0YXRlLnR3b3NTZWVuICs9IDFcclxuICAgIGlmIChAYWNoLnN0YXRlLnR3b3NTZWVuID09IDQpIGFuZCAoQHBsYXllcnNbMF0uaGFuZC5sZW5ndGggPT0gMTMpXHJcbiAgICAgIEBhY2guc3RhdGUuZmFzaGlvbmFibHlMYXRlID0gdHJ1ZVxyXG4gICAgY29uc29sZS5sb2cgXCJAYWNoLnN0YXRlLmZhc2hpb25hYmx5TGF0ZSAje0BhY2guc3RhdGUuZmFzaGlvbmFibHlMYXRlfVwiXHJcbiAgICBpZiBAdHVybiA9PSAwXHJcbiAgICAgIGlmIEBldmVyeW9uZVBhc3NlZCgpIGFuZCBub3QgbmV3VGhyb3dcclxuICAgICAgICBAZWFybiBcInlvdXJzZWxmXCJcclxuICAgICAgaWYgaW5jb21pbmdQbGF5LnR5cGUgPT0gJ2tpbmQyJ1xyXG4gICAgICAgIEBhY2guc3RhdGUucGFpcnNUaHJvd24gKz0gMVxyXG4gICAgICAgIGlmIEBhY2guc3RhdGUucGFpcnNUaHJvd24gPj0gNVxyXG4gICAgICAgICAgQGVhcm4gXCJwYWlyc1wiXHJcbiAgICAgIGlmIGJyZWFrZXJUaHJvd25cclxuICAgICAgICBAZWFybiBcImJyZWFrZXJcIlxyXG4gICAgICBpZiBAaXNCcmVha2VyVHlwZShpbmNvbWluZ1BsYXkudHlwZSkgYW5kIChAcGlsZS5sZW5ndGggPT0gMClcclxuICAgICAgICBAZWFybiBcInRyYWdlZHlcIlxyXG4gICAgICBpZiBAaXNSdW5UeXBlKGluY29taW5nUGxheS50eXBlKSBhbmQgQGlzU3VpdGVkKHBhcmFtcy5jYXJkcylcclxuICAgICAgICBAZWFybiBcInN1aXRlZFwiXHJcbiAgICAgIGlmIEBjdXJyZW50UGxheSBhbmQgKEBjdXJyZW50UGxheS50eXBlID09ICdraW5kMScpIGFuZCAoQGN1cnJlbnRQbGF5LmhpZ2ggPD0gMykgYW5kIChpbmNvbWluZ1BsYXkudHlwZSA9PSAna2luZDEnKSBhbmQgKGluY29taW5nUGxheS5oaWdoID49IDQ4KVxyXG4gICAgICAgIEBlYXJuIFwia2VlcGl0bG93XCJcclxuICAgICAgaWYgQGlzUnVuVHlwZShpbmNvbWluZ1BsYXkudHlwZSkgYW5kIChpbmNvbWluZ1BsYXkuaGlnaCA9PSA0NykgIyBBY2Ugb2YgSGVhcnRzXHJcbiAgICAgICAgQGVhcm4gXCJpbmRvbWl0YWJsZVwiXHJcbiAgICAgIGlmIEBpc0JpZ1J1bihpbmNvbWluZ1BsYXksIDcpXHJcbiAgICAgICAgY29uc29sZS5sb2cgXCJ0aHJld1J1bjc6IHRydWVcIlxyXG4gICAgICAgIEBhY2guc3RhdGUudGhyZXdSdW43ID0gdHJ1ZVxyXG4gICAgICBpZiBpbmNvbWluZ1BsYXkudHlwZSA9PSAna2luZDEnXHJcbiAgICAgICAgQGFjaC5zdGF0ZS50aHJld1NpbmdsZSA9IHRydWVcclxuICAgICAgaWYgaW5jb21pbmdQbGF5LnR5cGUgPT0gJ2tpbmQyJ1xyXG4gICAgICAgIEBhY2guc3RhdGUudGhyZXdQYWlyID0gdHJ1ZVxyXG4gICAgICBpZiBpbmNvbWluZ1BsYXkudHlwZSA9PSAna2luZDMnXHJcbiAgICAgICAgQGFjaC5zdGF0ZS50aHJld1RyaXBzID0gdHJ1ZVxyXG4gICAgICBpZiBpbmNvbWluZ1BsYXkudHlwZS5tYXRjaCgvXnJ1bi8pXHJcbiAgICAgICAgQGFjaC5zdGF0ZS50aHJld1J1biA9IHRydWVcclxuICAgICAgaWYgQGFjaC5zdGF0ZS50aHJld1NpbmdsZSBhbmQgQGFjaC5zdGF0ZS50aHJld1BhaXIgYW5kIEBhY2guc3RhdGUudGhyZXdUcmlwcyBhbmQgQGFjaC5zdGF0ZS50aHJld1J1blxyXG4gICAgICAgIEBlYXJuIFwic2FtcGxlclwiXHJcblxyXG4gICAgQGN1cnJlbnRQbGF5ID0gaW5jb21pbmdQbGF5XHJcblxyXG4gICAgQHRocm93SUQgKz0gMVxyXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcclxuICAgIGN1cnJlbnRQbGF5ZXIuaGFuZCA9IEByZW1vdmVDYXJkcyhjdXJyZW50UGxheWVyLmhhbmQsIHBhcmFtcy5jYXJkcylcclxuXHJcbiAgICBAb3V0cHV0KFwiI3tjdXJyZW50UGxheWVyLm5hbWV9ICN7dmVyYn0gI3twbGF5VG9TdHJpbmcoaW5jb21pbmdQbGF5KX1cIilcclxuXHJcbiAgICBpZiBjdXJyZW50UGxheWVyLmhhbmQubGVuZ3RoID09IDBcclxuICAgICAgIyBHYW1lIG92ZXIhIGRvIGdhbWVvdmVyIHRoaW5ncy5cclxuXHJcbiAgICAgIGN1cnJlbnRQbGF5ZXIucGxhY2UgPSBAbmV4dFBsYWNlKClcclxuXHJcbiAgICAgIGlmIEBtb25leVxyXG4gICAgICAgIHBsYWNlU3RyaW5nID0gXCI0dGhcIlxyXG4gICAgICAgIGlmIGN1cnJlbnRQbGF5ZXIucGxhY2UgPT0gMVxyXG4gICAgICAgICAgcGxhY2VTdHJpbmcgPSBcIjFzdFwiXHJcbiAgICAgICAgZWxzZSBpZiBjdXJyZW50UGxheWVyLnBsYWNlID09IDJcclxuICAgICAgICAgIHBsYWNlU3RyaW5nID0gXCIybmRcIlxyXG4gICAgICAgIGVsc2UgaWYgY3VycmVudFBsYXllci5wbGFjZSA9PSAzXHJcbiAgICAgICAgICBwbGFjZVN0cmluZyA9IFwiM3JkXCJcclxuICAgICAgICBAb3V0cHV0KFwiI3tjdXJyZW50UGxheWVyLm5hbWV9IHRha2VzICN7cGxhY2VTdHJpbmd9IHBsYWNlXCIpXHJcblxyXG4gICAgICAgIGlmIGN1cnJlbnRQbGF5ZXIucGxhY2UgPT0gM1xyXG4gICAgICAgICAgQHBheW91dCgpXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBAb3V0cHV0KFwiI3tjdXJyZW50UGxheWVyLm5hbWV9IHdpbnMhXCIpXHJcblxyXG4gICAgICBpZiAoQHR1cm4gPT0gMCkgYW5kIChjdXJyZW50UGxheWVyLnBsYWNlID09IDEpXHJcbiAgICAgICAgQHN0cmVhayArPSAxXHJcbiAgICAgICAgQGxhc3RTdHJlYWsgPSBAc3RyZWFrXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBAbGFzdFN0cmVhayA9IEBzdHJlYWtcclxuICAgICAgICBAc3RyZWFrID0gMFxyXG5cclxuICAgICAgQGFjaC5zdGF0ZS5iZXN0U3RyZWFrID89IDBcclxuICAgICAgaWYgQGFjaC5zdGF0ZS5iZXN0U3RyZWFrIDwgQGxhc3RTdHJlYWtcclxuICAgICAgICBAYWNoLnN0YXRlLmJlc3RTdHJlYWsgPSBAbGFzdFN0cmVha1xyXG5cclxuICAgICAgIyBBY2hpZXZlbWVudHNcclxuICAgICAgaWYgQGFjaC5zdGF0ZS5iZXN0U3RyZWFrID49IDVcclxuICAgICAgICBAZWFybiBcInRyeWhhcmRcIlxyXG4gICAgICBAYWNoLnN0YXRlLnRvdGFsR2FtZXMgKz0gMVxyXG4gICAgICBpZiBAYWNoLnN0YXRlLnRvdGFsR2FtZXMgPj0gNTBcclxuICAgICAgICBAZWFybiBcInZldGVyYW5cIlxyXG4gICAgICBpZiAoQHR1cm4gPT0gMCkgYW5kIChjdXJyZW50UGxheWVyLnBsYWNlID09IDEpXHJcbiAgICAgICAgIyBwbGF5ZXIgd29uXHJcbiAgICAgICAgaWYgKEBwbGF5ZXJzWzFdLmhhbmQubGVuZ3RoID49IDEwKSBhbmQgKEBwbGF5ZXJzWzJdLmhhbmQubGVuZ3RoID49IDEwKSBhbmQgKEBwbGF5ZXJzWzNdLmhhbmQubGVuZ3RoID49IDEwKVxyXG4gICAgICAgICAgQGVhcm4gXCJyZWt0XCJcclxuICAgICAgICBpZiBAYWNoLnN0YXRlLmZhc2hpb25hYmx5TGF0ZVxyXG4gICAgICAgICAgQGVhcm4gXCJsYXRlXCJcclxuICAgICAgZWxzZVxyXG4gICAgICAgICMgcGxheWVyIGxvc3RcclxuICAgICAgICBpZiBAYWNoLnN0YXRlLnRocmV3UnVuN1xyXG4gICAgICAgICAgQGVhcm4gXCJ0b255XCJcclxuXHJcbiAgICBhY2hpZXZlbWVudENvdW50ID0gMFxyXG4gICAgZm9yIGFjaGlldmVtZW50IGluIGFjaGlldmVtZW50c0xpc3RcclxuICAgICAgaWYgQGFjaC5lYXJuZWRbYWNoaWV2ZW1lbnQuaWRdXHJcbiAgICAgICAgYWNoaWV2ZW1lbnRDb3VudCArPSAxXHJcbiAgICBpZiBhY2hpZXZlbWVudENvdW50ID49IDEzXHJcbiAgICAgIEBlYXJuIFwidGhpcnRlZW5cIlxyXG5cclxuICAgIEBwaWxlID0gcGFyYW1zLmNhcmRzLnNsaWNlKDApXHJcbiAgICBAcGlsZVdobyA9IEB0dXJuXHJcblxyXG4gICAgQHR1cm4gPSBAcGxheWVyQWZ0ZXIoQHR1cm4pXHJcbiAgICByZXR1cm4gT0tcclxuXHJcbiAgdW5wYXNzQWxsOiAtPlxyXG4gICAgZm9yIHBsYXllciBpbiBAcGxheWVyc1xyXG4gICAgICBwbGF5ZXIucGFzcyA9IGZhbHNlXHJcbiAgICByZXR1cm5cclxuXHJcbiAgcGFzczogKHBhcmFtcykgLT5cclxuICAgIHJldCA9IEBjYW5QYXNzKHBhcmFtcylcclxuICAgIGlmIHJldCAhPSBPS1xyXG4gICAgICByZXR1cm4gcmV0XHJcblxyXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcclxuICAgIGlmIEBjdXJyZW50UGxheSBhbmQgKHBsYXlUb0NhcmRDb3VudChAY3VycmVudFBsYXkpID4gY3VycmVudFBsYXllci5oYW5kLmxlbmd0aClcclxuICAgICAgQG91dHB1dChcIiN7Y3VycmVudFBsYXllci5uYW1lfSBhdXRvLXBhc3NlcyAodG9vIGZldyBjYXJkcylcIilcclxuICAgIGVsc2UgaWYgY3VycmVudFBsYXllci5wYXNzXHJcbiAgICAgIEBvdXRwdXQoXCIje2N1cnJlbnRQbGF5ZXIubmFtZX0gYXV0by1wYXNzZXNcIilcclxuICAgIGVsc2VcclxuICAgICAgQG91dHB1dChcIiN7Y3VycmVudFBsYXllci5uYW1lfSBwYXNzZXNcIilcclxuICAgIGN1cnJlbnRQbGF5ZXIucGFzcyA9IHRydWVcclxuICAgIEB0dXJuID0gQHBsYXllckFmdGVyKEB0dXJuKVxyXG4gICAgcmV0dXJuIE9LXHJcblxyXG4gIGFpUGxheTogKGN1cnJlbnRQbGF5ZXIsIGNhcmRzKSAtPlxyXG4gICAgcmV0dXJuIEBwbGF5KHsnaWQnOmN1cnJlbnRQbGF5ZXIuaWQsICdjYXJkcyc6Y2FyZHN9KVxyXG5cclxuICBhaVBhc3M6IChjdXJyZW50UGxheWVyKSAtPlxyXG4gICAgcmV0dXJuIEBwYXNzKHsnaWQnOmN1cnJlbnRQbGF5ZXIuaWR9KVxyXG5cclxuICBlYXJuOiAoaWQpIC0+XHJcbiAgICBpZiBAYWNoLmVhcm5lZFtpZF1cclxuICAgICAgcmV0dXJuXHJcbiAgICBhY2hpZXZlbWVudCA9IGFjaGlldmVtZW50c01hcFtpZF1cclxuICAgIGlmIG5vdCBhY2hpZXZlbWVudD9cclxuICAgICAgcmV0dXJuXHJcblxyXG4gICAgQGFjaC5lYXJuZWRbaWRdID0gdHJ1ZVxyXG4gICAgQG91dHB1dChcIkVhcm5lZDogI3thY2hpZXZlbWVudC50aXRsZX1cIilcclxuICAgIEBmYW5mYXJlcy5wdXNoIGFjaGlldmVtZW50LnRpdGxlXHJcblxyXG5cclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICMgQUlcclxuXHJcbiAgIyBHZW5lcmljIGxvZ2dpbmcgZnVuY3Rpb247IHByZXBlbmRzIGN1cnJlbnQgQUkgcGxheWVyJ3MgZ3V0cyBiZWZvcmUgcHJpbnRpbmcgdGV4dFxyXG4gIGFpTG9nOiAodGV4dCkgLT5cclxuICAgIGN1cnJlbnRQbGF5ZXIgPSBAY3VycmVudFBsYXllcigpXHJcbiAgICBpZiBub3QgY3VycmVudFBsYXllci5haVxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgICBjaGFyYWN0ZXIgPSBhaUNoYXJhY3RlcnNbY3VycmVudFBsYXllci5jaGFySURdXHJcbiAgICBAZ2FtZS5sb2coJ0FJWycrY3VycmVudFBsYXllci5uYW1lKycgJytjaGFyYWN0ZXIuYnJhaW4rJ106IGhhbmQ6JytjYXJkc1RvU3RyaW5nKGN1cnJlbnRQbGF5ZXIuaGFuZCkrJyBwaWxlOicrY2FyZHNUb1N0cmluZyhAcGlsZSkrJyAnK3RleHQpXHJcblxyXG4gICMgRGV0ZWN0cyBpZiB0aGUgY3VycmVudCBwbGF5ZXIgaXMgQUkgZHVyaW5nIGEgQklEIG9yIFRSSUNLIHBoYXNlIGFuZCBhY3RzIGFjY29yZGluZyB0byB0aGVpciAnYnJhaW4nXHJcbiAgYWlUaWNrOiAtPlxyXG4gICAgaWYgQGdhbWVPdmVyKClcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gICAgaWYgQGVudGlyZVRhYmxlUGFzc2VkKClcclxuICAgICAgQHR1cm4gPSBAcGxheWVyQWZ0ZXIoQHBpbGVXaG8pXHJcbiAgICAgIEB1bnBhc3NBbGwoKVxyXG4gICAgICBAY3VycmVudFBsYXkgPSBudWxsXHJcbiAgICAgIEBvdXRwdXQoJ1dob2xlIHRhYmxlIHBhc3NlcywgY29udHJvbCB0byAnICsgQHBsYXllcnNbQHR1cm5dLm5hbWUpXHJcblxyXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcclxuICAgIGlmIG5vdCBjdXJyZW50UGxheWVyLmFpXHJcbiAgICAgIGlmIEBjdXJyZW50UGxheSBhbmQgKEBjdXJyZW50UGxheS50eXBlID09ICdraW5kMScpIGFuZCBAaGFzQnJlYWtlcihjdXJyZW50UGxheWVyLmhhbmQpXHJcbiAgICAgICAgIyBkbyBub3RoaW5nLCBwbGF5ZXIgY2FuIGRyb3AgYSBicmVha2VyXHJcbiAgICAgIGVsc2UgaWYgQGN1cnJlbnRQbGF5IGFuZCAocGxheVRvQ2FyZENvdW50KEBjdXJyZW50UGxheSkgPiBjdXJyZW50UGxheWVyLmhhbmQubGVuZ3RoKVxyXG4gICAgICAgIEBhaUxvZyhcImF1dG9wYXNzaW5nIGZvciBwbGF5ZXIsIG5vdCBlbm91Z2ggY2FyZHNcIilcclxuICAgICAgICBAYWlQYXNzKGN1cnJlbnRQbGF5ZXIpXHJcbiAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgZWxzZSBpZiBjdXJyZW50UGxheWVyLnBhc3NcclxuICAgICAgICBAYWlMb2coXCJhdXRvcGFzc2luZyBmb3IgcGxheWVyXCIpXHJcbiAgICAgICAgQGFpUGFzcyhjdXJyZW50UGxheWVyKVxyXG4gICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG5cclxuICAgIGNoYXJhY3RlciA9IGFpQ2hhcmFjdGVyc1tjdXJyZW50UGxheWVyLmNoYXJJRF1cclxuICAgIHJldCA9IEBicmFpbnNbY2hhcmFjdGVyLmJyYWluXS5wbGF5LmFwcGx5KHRoaXMsIFtjdXJyZW50UGxheWVyLCBAY3VycmVudFBsYXksIEBldmVyeW9uZVBhc3NlZCgpXSlcclxuICAgIGlmIHJldCA9PSBPS1xyXG4gICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gIGFsQ2FsY0tpbmRzOiAoaGFuZCwgcGxheXMsIG1hdGNoMnMgPSBmYWxzZSkgLT5cclxuICAgIGNhcmRzID0gaGFuZC5tYXAgKHJhdykgLT4gbmV3IENhcmQocmF3KVxyXG4gICAgY2FyZHMgPSBjYXJkcy5zb3J0IChhLCBiKSAtPiByZXR1cm4gYS5yYXcgLSBiLnJhd1xyXG4gICAgdmFsdWVBcnJheXMgPSBbXVxyXG4gICAgZm9yIGkgaW4gWzAuLi4xM11cclxuICAgICAgdmFsdWVBcnJheXMucHVzaCBbXVxyXG4gICAgZm9yIGNhcmQgaW4gY2FyZHNcclxuICAgICAgdmFsdWVBcnJheXNbY2FyZC52YWx1ZV0ucHVzaChjYXJkKVxyXG5cclxuICAgIGhhbmQgPSBbXVxyXG4gICAgZm9yIHZhbHVlQXJyYXksIHZhbHVlIGluIHZhbHVlQXJyYXlzXHJcbiAgICAgIGlmICh2YWx1ZUFycmF5Lmxlbmd0aCA+IDEpIGFuZCAobWF0Y2gycyBvciAodmFsdWUgPCAxMikpXHJcbiAgICAgICAga2V5ID0gXCJraW5kI3t2YWx1ZUFycmF5Lmxlbmd0aH1cIlxyXG4gICAgICAgIHBsYXlzW2tleV0gPz0gW11cclxuICAgICAgICBwbGF5c1trZXldLnB1c2ggdmFsdWVBcnJheS5tYXAgKHYpIC0+IHYucmF3XHJcbiAgICAgIGVsc2VcclxuICAgICAgICBmb3IgdiBpbiB2YWx1ZUFycmF5XHJcbiAgICAgICAgICBoYW5kLnB1c2ggdi5yYXdcclxuXHJcbiAgICByZXR1cm4gaGFuZFxyXG5cclxuICBhaUZpbmRSdW5zOiAoaGFuZCwgZWFjaFNpemUsIHNpemUpIC0+XHJcbiAgICBydW5zID0gW11cclxuXHJcbiAgICBjYXJkcyA9IGhhbmQubWFwIChyYXcpIC0+IG5ldyBDYXJkKHJhdylcclxuICAgIGNhcmRzID0gY2FyZHMuc29ydCAoYSwgYikgLT4gcmV0dXJuIGEucmF3IC0gYi5yYXdcclxuICAgIHZhbHVlQXJyYXlzID0gW11cclxuICAgIGZvciBpIGluIFswLi4uMTNdXHJcbiAgICAgIHZhbHVlQXJyYXlzLnB1c2ggW11cclxuICAgIGZvciBjYXJkIGluIGNhcmRzXHJcbiAgICAgIHZhbHVlQXJyYXlzW2NhcmQudmFsdWVdLnB1c2goY2FyZClcclxuXHJcbiAgICBsYXN0U3RhcnRpbmdWYWx1ZSA9IDEyIC0gc2l6ZVxyXG4gICAgZm9yIHN0YXJ0aW5nVmFsdWUgaW4gWzAuLi5sYXN0U3RhcnRpbmdWYWx1ZV1cclxuICAgICAgcnVuRm91bmQgPSB0cnVlXHJcbiAgICAgIGZvciBvZmZzZXQgaW4gWzAuLi5zaXplXVxyXG4gICAgICAgIGlmIHZhbHVlQXJyYXlzW3N0YXJ0aW5nVmFsdWUrb2Zmc2V0XS5sZW5ndGggPCBlYWNoU2l6ZVxyXG4gICAgICAgICAgcnVuRm91bmQgPSBmYWxzZVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgaWYgcnVuRm91bmRcclxuICAgICAgICBydW4gPSBbXVxyXG4gICAgICAgIGZvciBvZmZzZXQgaW4gWzAuLi5zaXplXVxyXG4gICAgICAgICAgZm9yIGVhY2ggaW4gWzAuLi5lYWNoU2l6ZV1cclxuICAgICAgICAgICAgcnVuLnB1c2godmFsdWVBcnJheXNbc3RhcnRpbmdWYWx1ZStvZmZzZXRdLnBvcCgpLnJhdylcclxuICAgICAgICBydW5zLnB1c2ggcnVuXHJcblxyXG4gICAgbGVmdG92ZXJzID0gW11cclxuICAgIGZvciB2YWx1ZUFycmF5IGluIHZhbHVlQXJyYXlzXHJcbiAgICAgIGZvciBjYXJkIGluIHZhbHVlQXJyYXlcclxuICAgICAgICBsZWZ0b3ZlcnMucHVzaCBjYXJkLnJhd1xyXG5cclxuICAgIHJldHVybiBbcnVucywgbGVmdG92ZXJzXVxyXG5cclxuICBhaUNhbGNSdW5zOiAoaGFuZCwgcGxheXMsIHNtYWxsUnVucykgLT5cclxuICAgIGlmIHNtYWxsUnVuc1xyXG4gICAgICBzdGFydFNpemUgPSAzXHJcbiAgICAgIGVuZFNpemUgPSAxMlxyXG4gICAgICBieUFtb3VudCA9IDFcclxuICAgIGVsc2VcclxuICAgICAgc3RhcnRTaXplID0gMTJcclxuICAgICAgZW5kU2l6ZSA9IDNcclxuICAgICAgYnlBbW91bnQgPSAtMVxyXG4gICAgZm9yIHJ1blNpemUgaW4gW3N0YXJ0U2l6ZS4uZW5kU2l6ZV0gYnkgYnlBbW91bnRcclxuICAgICAgW3J1bnMsIGxlZnRvdmVyc10gPSBAYWlGaW5kUnVucyhoYW5kLCAxLCBydW5TaXplKVxyXG4gICAgICBpZiBydW5zLmxlbmd0aCA+IDBcclxuICAgICAgICBrZXkgPSBcInJ1biN7cnVuU2l6ZX1cIlxyXG4gICAgICAgIHBsYXlzW2tleV0gPSBydW5zXHJcbiAgICAgIGhhbmQgPSBsZWZ0b3ZlcnNcclxuXHJcbiAgICByZXR1cm4gaGFuZFxyXG5cclxuICBhaUNhbGNSb3BzOiAoaGFuZCwgcGxheXMpIC0+XHJcbiAgICBzdGFydFNpemUgPSAzXHJcbiAgICBlbmRTaXplID0gNlxyXG4gICAgZm9yIHJ1blNpemUgaW4gW3N0YXJ0U2l6ZS4uZW5kU2l6ZV1cclxuICAgICAgW3JvcHMsIGxlZnRvdmVyc10gPSBAYWlGaW5kUnVucyhoYW5kLCAyLCBydW5TaXplKVxyXG4gICAgICBpZiByb3BzLmxlbmd0aCA+IDBcclxuICAgICAgICBrZXkgPSBcInJvcCN7cnVuU2l6ZX1cIlxyXG4gICAgICAgIHBsYXlzW2tleV0gPSByb3BzXHJcbiAgICAgIGhhbmQgPSBsZWZ0b3ZlcnNcclxuXHJcbiAgICByZXR1cm4gaGFuZFxyXG5cclxuICBhaUNhbGNQbGF5czogKGhhbmQsIHN0cmF0ZWd5ID0ge30pIC0+XHJcbiAgICBwbGF5cyA9IHt9XHJcblxyXG4gICAgIyBXZSBhbHdheXMgd2FudCB0byB1c2Ugcm9wcyBpZiB3ZSBoYXZlIG9uZVxyXG4gICAgaWYgc3RyYXRlZ3kuc2Vlc1JvcHNcclxuICAgICAgaGFuZCA9IEBhaUNhbGNSb3BzKGhhbmQsIHBsYXlzKVxyXG5cclxuICAgIGlmIHN0cmF0ZWd5LnByZWZlcnNSdW5zXHJcbiAgICAgIGhhbmQgPSBAYWlDYWxjUnVucyhoYW5kLCBwbGF5cywgc3RyYXRlZ3kuc21hbGxSdW5zKVxyXG4gICAgICBoYW5kID0gQGFsQ2FsY0tpbmRzKGhhbmQsIHBsYXlzLCBzdHJhdGVneS5tYXRjaDJzKVxyXG4gICAgZWxzZVxyXG4gICAgICBoYW5kID0gQGFsQ2FsY0tpbmRzKGhhbmQsIHBsYXlzLCBzdHJhdGVneS5tYXRjaDJzKVxyXG4gICAgICBoYW5kID0gQGFpQ2FsY1J1bnMoaGFuZCwgcGxheXMsIHN0cmF0ZWd5LnNtYWxsUnVucylcclxuXHJcbiAgICBraW5kMSA9IGhhbmQubWFwICh2KSAtPiBbdl1cclxuICAgIGlmIGtpbmQxLmxlbmd0aCA+IDBcclxuICAgICAgcGxheXMua2luZDEgPSBraW5kMVxyXG4gICAgcmV0dXJuIHBsYXlzXHJcblxyXG4gIG51bWJlck9mU2luZ2xlczogKHBsYXlzKSAtPlxyXG4gICAgaWYgbm90IHBsYXlzLmtpbmQxP1xyXG4gICAgICByZXR1cm4gMFxyXG4gICAgbm9uVHdvU2luZ2xlcyA9IDBcclxuICAgIGZvciByYXcgaW4gcGxheXMua2luZDFcclxuICAgICAgaWYgcmF3IDwgNDhcclxuICAgICAgICBub25Ud29TaW5nbGVzICs9IDFcclxuICAgIHJldHVybiBub25Ud29TaW5nbGVzXHJcblxyXG4gIGJyZWFrZXJQbGF5czogKGhhbmQpIC0+XHJcbiAgICByZXR1cm4gQGFpQ2FsY1BsYXlzKGhhbmQsIHsgc2Vlc1JvcHM6IHRydWUsIHByZWZlcnNSdW5zOiBmYWxzZSB9KVxyXG5cclxuICBpc0JyZWFrZXJUeXBlOiAocGxheVR5cGUpIC0+XHJcbiAgICBpZiBwbGF5VHlwZS5tYXRjaCgvXnJvcC8pIG9yIHBsYXlUeXBlID09ICdraW5kNCdcclxuICAgICAgcmV0dXJuIHRydWVcclxuICAgIHJldHVybiBmYWxzZVxyXG5cclxuICBjYW5CZUJyb2tlbjogKHBsYXkpIC0+XHJcbiAgICBpZiBwbGF5LnR5cGUgIT0gJ2tpbmQxJ1xyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIGNhcmQgPSBuZXcgQ2FyZChwbGF5LmhpZ2gpXHJcbiAgICByZXR1cm4gKGNhcmQudmFsdWUgPT0gMTIpXHJcblxyXG4gIGhhc0JyZWFrZXI6IChoYW5kKSAtPlxyXG4gICAgcGxheXMgPSBAYnJlYWtlclBsYXlzKGhhbmQpXHJcbiAgICBmb3IgcGxheVR5cGUsIHBsYXlsaXN0IG9mIHBsYXlzXHJcbiAgICAgIGlmIEBpc0JyZWFrZXJUeXBlKHBsYXlUeXBlKVxyXG4gICAgICAgIGlmIHBsYXlsaXN0Lmxlbmd0aCA+IDBcclxuICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgaXNSdW5UeXBlOiAocGxheVR5cGUpIC0+XHJcbiAgICBpZiBwbGF5VHlwZS5tYXRjaCgvXnJ1bi8pXHJcbiAgICAgIHJldHVybiB0cnVlXHJcbiAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgaXNTdWl0ZWQ6IChoYW5kKSAtPlxyXG4gICAgaWYgaGFuZC5sZW5ndGggPCAxXHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgY2FyZHMgPSBoYW5kLm1hcCAocmF3KSAtPiBuZXcgQ2FyZChyYXcpXHJcbiAgICBzdWl0ID0gY2FyZHNbMF0uc3VpdFxyXG4gICAgZm9yIGNhcmQgaW4gY2FyZHNcclxuICAgICAgaWYgY2FyZC5zdWl0ICE9IHN1aXRcclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgIHJldHVybiB0cnVlXHJcblxyXG4gIGlzQmlnUnVuOiAocGxheSwgYXRMZWFzdCkgLT5cclxuICAgIGlmIG1hdGNoZXMgPSBwbGF5LnR5cGUubWF0Y2goL15ydW4oXFxkKykvKVxyXG4gICAgICBsZW4gPSBwYXJzZUludChtYXRjaGVzWzFdKVxyXG4gICAgICBpZiBsZW4gPj0gYXRMZWFzdFxyXG4gICAgICAgIHJldHVybiB0cnVlXHJcbiAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgYWlDYWxjQmVzdFBsYXlzOiAoaGFuZCkgLT5cclxuICAgIGJlc3RQbGF5cyA9IG51bGxcclxuICAgIGZvciBiaXRzIGluIFswLi4uMTZdXHJcbiAgICAgIHN0cmF0ZWd5ID1cclxuICAgICAgICBzbWFsbFJ1bnM6IChiaXRzICYgMSkgPT0gMVxyXG4gICAgICAgIHByZWZlcnNSdW5zOiAoYml0cyAmIDIpID09IDJcclxuICAgICAgICBtYXRjaDJzOiAoYml0cyAmIDQpID09IDRcclxuICAgICAgICBzZWVzUm9wczogKGJpdHMgJiA4KSA9PSA4XHJcbiAgICAgIHBsYXlzID0gQGFpQ2FsY1BsYXlzKGhhbmQsIHN0cmF0ZWd5KVxyXG4gICAgICBpZiBiZXN0UGxheXMgPT0gbnVsbFxyXG4gICAgICAgIGJlc3RQbGF5cyA9IHBsYXlzXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBucCA9IEBudW1iZXJPZlNpbmdsZXMocGxheXMpXHJcbiAgICAgICAgbmJwID0gQG51bWJlck9mU2luZ2xlcyhiZXN0UGxheXMpXHJcbiAgICAgICAgaWYgbnAgPCBuYnBcclxuICAgICAgICAgIGJlc3RQbGF5cyA9IHBsYXlzXHJcbiAgICAgICAgZWxzZSBpZiBucCA9PSBuYnBcclxuICAgICAgICAgICMgZmxpcCBhIGNvaW4hXHJcbiAgICAgICAgICBpZiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKSA9PSAwXHJcbiAgICAgICAgICAgIGJlc3RQbGF5cyA9IHBsYXlzXHJcbiAgICByZXR1cm4gYmVzdFBsYXlzXHJcblxyXG4gIHByZXR0eVBsYXlzOiAocGxheXMsIGV4dHJhUHJldHR5ID0gZmFsc2UpIC0+XHJcbiAgICBwcmV0dHkgPSB7fVxyXG4gICAgZm9yIHR5cGUsIGFyciBvZiBwbGF5c1xyXG4gICAgICBwcmV0dHlbdHlwZV0gPSBbXVxyXG4gICAgICBmb3IgcGxheSBpbiBhcnJcclxuICAgICAgICBuYW1lcyA9IFtdXHJcbiAgICAgICAgZm9yIHJhdyBpbiBwbGF5XHJcbiAgICAgICAgICBjYXJkID0gbmV3IENhcmQocmF3KVxyXG4gICAgICAgICAgbmFtZXMucHVzaChjYXJkLm5hbWUpXHJcbiAgICAgICAgcHJldHR5W3R5cGVdLnB1c2gobmFtZXMpXHJcbiAgICBpZiBleHRyYVByZXR0eVxyXG4gICAgICBzID0gXCJcIlxyXG4gICAgICBmb3IgdHlwZU5hbWUsIHRocm93cyBvZiBwcmV0dHlcclxuICAgICAgICBzICs9IFwiICAgICAgKiAje3BsYXlUeXBlVG9TdHJpbmcodHlwZU5hbWUpfTpcXG5cIlxyXG4gICAgICAgIGlmIHR5cGVOYW1lID09ICdraW5kMSdcclxuICAgICAgICAgIHMgKz0gXCIgICAgICAgICogI3t0aHJvd3MubWFwKCh2KSAtPiB2WzBdKS5qb2luKCcsJyl9XFxuXCJcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBmb3IgdCBpbiB0aHJvd3NcclxuICAgICAgICAgICAgcyArPSBcIiAgICAgICAgKiAje3Quam9pbignLCcpfVxcblwiXHJcbiAgICAgIHJldHVybiBzXHJcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocHJldHR5KVxyXG5cclxuICBoaWdoZXN0Q2FyZDogKHBsYXkpIC0+XHJcbiAgICBoaWdoZXN0ID0gMFxyXG4gICAgZm9yIHAgaW4gcGxheVxyXG4gICAgICBpZiBoaWdoZXN0IDwgcFxyXG4gICAgICAgIGhpZ2hlc3QgPSBwXHJcbiAgICByZXR1cm4gaGlnaGVzdFxyXG5cclxuICBmaW5kUGxheVdpdGgzUzogKHBsYXlzKSAtPlxyXG4gICAgZm9yIHBsYXlUeXBlLCBwbGF5bGlzdCBvZiBwbGF5c1xyXG4gICAgICBmb3IgcGxheSBpbiBwbGF5bGlzdFxyXG4gICAgICAgIGlmIEBoYW5kSGFzM1MocGxheSlcclxuICAgICAgICAgIHJldHVybiBwbGF5XHJcblxyXG4gICAgY29uc29sZS5sb2cgXCJmaW5kUGxheVdpdGgzUzogc29tZXRoaW5nIGltcG9zc2libGUgaXMgaGFwcGVuaW5nXCJcclxuICAgIHJldHVybiBbXVxyXG5cclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuIyBBSSBCcmFpbnNcclxuXHJcbiAgIyBCcmFpbnMgbXVzdCBoYXZlOlxyXG4gICMgKiBpZDogaW50ZXJuYWwgaWRlbnRpZmllciBmb3IgdGhlIGJyYWluXHJcbiAgIyAqIG5hbWU6IHByZXR0eSBuYW1lXHJcbiAgIyAqIHBsYXkoY3VycmVudFBsYXllcikgYXR0ZW1wdHMgdG8gcGxheSBhIGNhcmQgYnkgY2FsbGluZyBhaVBsYXkoKS4gU2hvdWxkIHJldHVybiB0cnVlIGlmIGl0IHN1Y2Nlc3NmdWxseSBwbGF5ZWQgYSBjYXJkIChhaVBsYXkoKSByZXR1cm5lZCB0cnVlKVxyXG4gIGJyYWluczpcclxuXHJcbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgIyBOb3JtYWw6IEludGVuZGVkIHRvIGJlIHVzZWQgYnkgbW9zdCBjaGFyYWN0ZXJzLlxyXG4gICAgIyAgICAgICAgIE5vdCB0b28gZHVtYiwgbm90IHRvbyBzbWFydC5cclxuICAgIG5vcm1hbDpcclxuICAgICAgaWQ6ICAgXCJub3JtYWxcIlxyXG4gICAgICBuYW1lOiBcIk5vcm1hbFwiXHJcblxyXG4gICAgICAjIG5vcm1hbFxyXG4gICAgICBwbGF5OiAoY3VycmVudFBsYXllciwgY3VycmVudFBsYXksIGV2ZXJ5b25lUGFzc2VkKSAtPlxyXG4gICAgICAgIGlmIGN1cnJlbnRQbGF5ZXIucGFzc1xyXG4gICAgICAgICAgaWYgQGNhbkJlQnJva2VuKGN1cnJlbnRQbGF5KSBhbmQgQGhhc0JyZWFrZXIoY3VycmVudFBsYXllci5oYW5kKVxyXG4gICAgICAgICAgICBicmVha2VyUGxheXMgPSBAYnJlYWtlclBsYXlzKGN1cnJlbnRQbGF5ZXIuaGFuZClcclxuICAgICAgICAgICAgZm9yIHBsYXlUeXBlLCBwbGF5bGlzdCBvZiBicmVha2VyUGxheXNcclxuICAgICAgICAgICAgICBpZiAocGxheVR5cGUubWF0Y2goL15yb3AvKSBvciAocGxheVR5cGUgPT0gJ2tpbmQ0JykpIGFuZCAocGxheWxpc3QubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgICAgIEBhaUxvZyhcImJyZWFraW5nIDJcIilcclxuICAgICAgICAgICAgICAgIGlmIEBhaVBsYXkoY3VycmVudFBsYXllciwgcGxheWxpc3RbMF0pID09IE9LXHJcbiAgICAgICAgICAgICAgICAgIHJldHVybiBPS1xyXG5cclxuICAgICAgICAgIEBhaUxvZyhcImFscmVhZHkgcGFzc2VkLCBnb2luZyB0byBrZWVwIHBhc3NpbmdcIilcclxuICAgICAgICAgIHJldHVybiBAYWlQYXNzKGN1cnJlbnRQbGF5ZXIpXHJcblxyXG4gICAgICAgIHBsYXlzID0gQGFpQ2FsY0Jlc3RQbGF5cyhjdXJyZW50UGxheWVyLmhhbmQpXHJcbiAgICAgICAgQGFpTG9nKFwiYmVzdCBwbGF5czogI3tAcHJldHR5UGxheXMocGxheXMpfVwiKVxyXG5cclxuICAgICAgICBpZiBAcGlsZS5sZW5ndGggPT0gMFxyXG4gICAgICAgICAgcGxheSA9IEBmaW5kUGxheVdpdGgzUyhwbGF5cylcclxuICAgICAgICAgIEBhaUxvZyhcIlRocm93aW5nIG15IHBsYXkgd2l0aCB0aGUgM1MgaW4gaXRcIilcclxuICAgICAgICAgIGlmIEBhaVBsYXkoY3VycmVudFBsYXllciwgcGxheSkgPT0gT0tcclxuICAgICAgICAgICAgcmV0dXJuIE9LXHJcblxyXG4gICAgICAgIGlmIGN1cnJlbnRQbGF5IGFuZCBub3QgZXZlcnlvbmVQYXNzZWRcclxuICAgICAgICAgIGlmIHBsYXlzW2N1cnJlbnRQbGF5LnR5cGVdPyBhbmQgKHBsYXlzW2N1cnJlbnRQbGF5LnR5cGVdLmxlbmd0aCA+IDApXHJcbiAgICAgICAgICAgIGZvciBwbGF5IGluIHBsYXlzW2N1cnJlbnRQbGF5LnR5cGVdXHJcbiAgICAgICAgICAgICAgaWYgQGhpZ2hlc3RDYXJkKHBsYXkpID4gY3VycmVudFBsYXkuaGlnaFxyXG4gICAgICAgICAgICAgICAgaWYgQGFpUGxheShjdXJyZW50UGxheWVyLCBwbGF5KSA9PSBPS1xyXG4gICAgICAgICAgICAgICAgICByZXR1cm4gT0tcclxuICAgICAgICAgICAgQGFpTG9nKFwiSSBndWVzcyBJIGNhbid0IGFjdHVhbGx5IGJlYXQgdGhpcywgcGFzc2luZ1wiKVxyXG4gICAgICAgICAgICByZXR1cm4gQGFpUGFzcyhjdXJyZW50UGxheWVyKVxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBAYWlMb2coXCJJIGRvbid0IGhhdmUgdGhhdCBwbGF5LCBwYXNzaW5nXCIpXHJcbiAgICAgICAgICAgIHJldHVybiBAYWlQYXNzKGN1cnJlbnRQbGF5ZXIpXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgIyBubyBjdXJyZW50IHBsYXksIHRocm93IHRoZSBmaXJzdCBjYXJkXHJcbiAgICAgICAgICBAYWlMb2coXCJJIGNhbiBkbyBhbnl0aGluZywgdGhyb3dpbmcgYSByYW5kb20gcGxheVwiKVxyXG4gICAgICAgICAgcGxheVR5cGVzID0gT2JqZWN0LmtleXMocGxheXMpXHJcbiAgICAgICAgICBwbGF5VHlwZUluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcGxheVR5cGVzLmxlbmd0aClcclxuICAgICAgICAgIGlmIEBhaVBsYXkoY3VycmVudFBsYXllciwgcGxheXNbcGxheVR5cGVzW3BsYXlUeXBlSW5kZXhdXVswXSkgPT0gT0tcclxuICAgICAgICAgICAgcmV0dXJuIE9LXHJcblxyXG4gICAgICAgICMgZmluZCB0aGUgZmlyc3QgY2FyZCB0aGF0IGJlYXRzIHRoZSBjdXJyZW50UGxheSdzIGhpZ2hcclxuICAgICAgICBmb3IgcmF3Q2FyZCBpbiBjdXJyZW50UGxheWVyLmhhbmRcclxuICAgICAgICAgIGlmIHJhd0NhcmQgPiBjdXJyZW50UGxheS5oaWdoXHJcbiAgICAgICAgICAgIEBhaUxvZyhcImZvdW5kIHNtYWxsZXN0IHNpbmdsZSAoI3tyYXdDYXJkfSksIHBsYXlpbmdcIilcclxuICAgICAgICAgICAgaWYgQGFpUGxheShjdXJyZW50UGxheWVyLCBbcmF3Q2FyZF0pID09IE9LXHJcbiAgICAgICAgICAgICAgcmV0dXJuIE9LXHJcbiAgICAgICAgICAgIGJyZWFrXHJcblxyXG4gICAgICAgIEBhaUxvZyhcIm5vdGhpbmcgZWxzZSB0byBkbywgcGFzc2luZ1wiKVxyXG4gICAgICAgIHJldHVybiBAYWlQYXNzKGN1cnJlbnRQbGF5ZXIpXHJcblxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIERlYnVnIGNvZGVcclxuXHJcbmRlYnVnID0gLT5cclxuICB0aGlyID0gbmV3IFRoaXJ0ZWVuKClcclxuICBmdWxseVBsYXllZCA9IDBcclxuICB0b3RhbEF0dGVtcHRzID0gMTAwXHJcblxyXG4gIGZvciBhdHRlbXB0IGluIFswLi4udG90YWxBdHRlbXB0c11cclxuICAgIGRlY2sgPSBuZXcgU2h1ZmZsZWREZWNrKClcclxuICAgIGhhbmQgPSBbXVxyXG4gICAgZm9yIGogaW4gWzAuLi4xM11cclxuICAgICAgcmF3ID0gZGVjay5jYXJkcy5zaGlmdCgpXHJcbiAgICAgIGhhbmQucHVzaChyYXcpXHJcbiAgICAjIGhhbmQgPSBbNTEsNTAsNDksNDgsNDcsNDYsNDUsNDQsNDMsNDIsNDEsNDAsMzldXHJcbiAgICAjIGhhbmQgPSBbMCwxLDIsMyw0LDUsNiw3LDgsOSwxMCwxMSwxMl1cclxuICAgIGhhbmQuc29ydCAoYSxiKSAtPiByZXR1cm4gYSAtIGJcclxuXHJcbiAgICBjb25zb2xlLmxvZyhcIi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVwiKVxyXG4gICAgY29uc29sZS5sb2coXCJIYW5kICN7YXR0ZW1wdCsxfTogI3tjYXJkc1RvU3RyaW5nKGhhbmQpfVwiKVxyXG4gICAgY29uc29sZS5sb2coXCJcIilcclxuXHJcbiAgICBmb3VuZEZ1bGx5UGxheWVkID0gZmFsc2VcclxuICAgIGZvciBiaXRzIGluIFswLi4uMTZdXHJcbiAgICAgIHN0cmF0ZWd5ID1cclxuICAgICAgICBzbWFsbFJ1bnM6IChiaXRzICYgMSkgPT0gMVxyXG4gICAgICAgIHByZWZlcnNSdW5zOiAoYml0cyAmIDIpID09IDJcclxuICAgICAgICBtYXRjaDJzOiAoYml0cyAmIDQpID09IDRcclxuICAgICAgICBzZWVzUm9wczogKGJpdHMgJiA4KSA9PSA4XHJcbiAgICAgIHBsYXlzID0gdGhpci5haUNhbGNQbGF5cyhoYW5kLCBzdHJhdGVneSlcclxuXHJcbiAgICAgIGNvbnNvbGUubG9nKFwiICAgKiBTdHJhdGVneTogI3tKU09OLnN0cmluZ2lmeShzdHJhdGVneSl9XCIpXHJcbiAgICAgIGNvbnNvbGUubG9nKHRoaXIucHJldHR5UGxheXMocGxheXMsIHRydWUpKVxyXG5cclxuICAgICAgaWYgbm90IHBsYXlzLmtpbmQxXHJcbiAgICAgICAgZm91bmRGdWxseVBsYXllZCA9IHRydWVcclxuXHJcbiAgICBpZiBmb3VuZEZ1bGx5UGxheWVkXHJcbiAgICAgIGZ1bGx5UGxheWVkICs9IDFcclxuXHJcbiAgY29uc29sZS5sb2cgXCJmdWxseVBsYXllZDogI3tmdWxseVBsYXllZH0gLyAje3RvdGFsQXR0ZW1wdHN9XCJcclxuXHJcbiMgZGVidWcoKVxyXG5cclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuIyBFeHBvcnRzXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9XHJcbiAgQ2FyZDogQ2FyZFxyXG4gIFRoaXJ0ZWVuOiBUaGlydGVlblxyXG4gIE9LOiBPS1xyXG4gIGFpQ2hhcmFjdGVyczogYWlDaGFyYWN0ZXJzXHJcbiAgYWNoaWV2ZW1lbnRzTGlzdDogYWNoaWV2ZW1lbnRzTGlzdFxyXG4gIGFjaGlldmVtZW50c01hcDogYWNoaWV2ZW1lbnRzTWFwXHJcbiIsIm1vZHVsZS5leHBvcnRzID1cclxuICBkYXJrZm9yZXN0OlxyXG4gICAgaGVpZ2h0OiA3MlxyXG4gICAgZ2x5cGhzOlxyXG4gICAgICAnOTcnIDogeyB4OiAgIDgsIHk6ICAgOCwgd2lkdGg6ICAzNCwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzk4JyA6IHsgeDogICA4LCB5OiAgNTgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICc5OScgOiB7IHg6ICA1MCwgeTogICA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnMTAwJzogeyB4OiAgIDgsIHk6IDExOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzEwMSc6IHsgeDogICA4LCB5OiAxNzgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICcxMDInOiB7IHg6ICAgOCwgeTogMjI4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzMgfVxyXG4gICAgICAnMTAzJzogeyB4OiAgIDgsIHk6IDI3OCwgd2lkdGg6ICAzNiwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM1IH1cclxuICAgICAgJzEwNCc6IHsgeDogICA4LCB5OiAzMjgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICcxMDUnOiB7IHg6ICAgOCwgeTogMzc4LCB3aWR0aDogIDEyLCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMTEgfVxyXG4gICAgICAnMTA2JzogeyB4OiAgIDgsIHk6IDQyOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDEsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzEwNyc6IHsgeDogIDI4LCB5OiAzNzgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQxLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICcxMDgnOiB7IHg6ICA1MSwgeTogMzI4LCB3aWR0aDogIDM0LCBoZWlnaHQ6ICA0MSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzMgfVxyXG4gICAgICAnMTA5JzogeyB4OiAgNTEsIHk6IDQyNywgd2lkdGg6ICAzOCwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM3IH1cclxuICAgICAgJzExMCc6IHsgeDogIDcxLCB5OiAzNzcsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICcxMTEnOiB7IHg6ICA5NywgeTogNDI3LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnMTEyJzogeyB4OiAgNTEsIHk6ICA1OCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzExMyc6IHsgeDogIDUxLCB5OiAxMDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQ1LCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICcxMTQnOiB7IHg6ICA5MywgeTogICA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzUgfVxyXG4gICAgICAnMTE1JzogeyB4OiAgNTEsIHk6IDE2MSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM1IH1cclxuICAgICAgJzExNic6IHsgeDogIDUxLCB5OiAyMTEsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzMyB9XHJcbiAgICAgICcxMTcnOiB7IHg6ICA1MiwgeTogMjYxLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnMTE4JzogeyB4OiAgOTMsIHk6IDMxMSwgd2lkdGg6ICAzNCwgaGVpZ2h0OiAgNDEsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDMyIH1cclxuICAgICAgJzExOSc6IHsgeDogMTE0LCB5OiAzNjAsIHdpZHRoOiAgMzgsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzOCB9XHJcbiAgICAgICcxMjAnOiB7IHg6IDE0MCwgeTogNDEwLCB3aWR0aDogIDM2LCBoZWlnaHQ6ICA0MSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzcgfVxyXG4gICAgICAnMTIxJzogeyB4OiAxNDAsIHk6IDQ1OSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDEsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzEyMic6IHsgeDogMTgzLCB5OiA0NTksIHdpZHRoOiAgMzYsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNSB9XHJcbiAgICAgICc2NScgOiB7IHg6ICA5NCwgeTogIDU4LCB3aWR0aDogIDM0LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxyXG4gICAgICAnNjYnIDogeyB4OiAgOTQsIHk6IDExOSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM3IH1cclxuICAgICAgJzY3JyA6IHsgeDogIDk0LCB5OiAxODAsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XHJcbiAgICAgICc2OCcgOiB7IHg6ICA5NSwgeTogMjQxLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzcgfVxyXG4gICAgICAnNjknIDogeyB4OiAxMzYsIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cclxuICAgICAgJzcwJyA6IHsgeDogMTM3LCB5OiAgNjksIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICc3MScgOiB7IHg6IDE3OSwgeTogICA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxyXG4gICAgICAnNzInIDogeyB4OiAxMzcsIHk6IDEzMCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cclxuICAgICAgJzczJyA6IHsgeDogMTM4LCB5OiAxOTEsIHdpZHRoOiAgMTIsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAxMyB9XHJcbiAgICAgICc3NCcgOiB7IHg6IDEzOCwgeTogMjUyLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxyXG4gICAgICAnNzUnIDogeyB4OiAxNTgsIHk6IDE5MSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cclxuICAgICAgJzc2JyA6IHsgeDogMTYwLCB5OiAzMTMsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICc3NycgOiB7IHg6IDE4MSwgeTogMjUxLCB3aWR0aDogIDM4LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzkgfVxyXG4gICAgICAnNzgnIDogeyB4OiAxODQsIHk6IDM3NCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM1IH1cclxuICAgICAgJzc5JyA6IHsgeDogMjAzLCB5OiAzMTIsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNSB9XHJcbiAgICAgICc4MCcgOiB7IHg6IDE4MCwgeTogIDY5LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnODEnIDogeyB4OiAyMDEsIHk6IDEzMCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTYsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM1IH1cclxuICAgICAgJzgyJyA6IHsgeDogMjIyLCB5OiAgIDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XHJcbiAgICAgICc4MycgOiB7IHg6IDIyMywgeTogIDY5LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxyXG4gICAgICAnODQnIDogeyB4OiAyNjUsIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDMzIH1cclxuICAgICAgJzg1JyA6IHsgeDogMjI3LCB5OiAxOTQsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNSB9XHJcbiAgICAgICc4NicgOiB7IHg6IDI0NCwgeTogMTMwLCB3aWR0aDogIDQxLCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMTksIHhhZHZhbmNlOiAgMzkgfVxyXG4gICAgICAnODcnIDogeyB4OiAyNjYsIHk6ICA2OSwgd2lkdGg6ICAzOCwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM3IH1cclxuICAgICAgJzg4JyA6IHsgeDogMzA4LCB5OiAgIDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAxOSwgeGFkdmFuY2U6ICAzNSB9XHJcbiAgICAgICc4OScgOiB7IHg6IDIyNywgeTogMzczLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMTksIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnOTAnIDogeyB4OiAyMjcsIHk6IDQzMywgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM1IH1cclxuICAgICAgJzMzJyA6IHsgeDogMjQ2LCB5OiAyNTUsIHdpZHRoOiAgMTQsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAxMSB9XHJcbiAgICAgICc1OScgOiB7IHg6IDE4MCwgeTogMTMwLCB3aWR0aDogIDEzLCBoZWlnaHQ6ICAzNywgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNTYsIHhhZHZhbmNlOiAgMTMgfVxyXG4gICAgICAnMzcnIDogeyB4OiAgOTUsIHk6IDMwMiwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cclxuICAgICAgJzU4JyA6IHsgeDogMTYwLCB5OiAzNzQsIHdpZHRoOiAgMTMsIGhlaWdodDogIDIzLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA1MCwgeGFkdmFuY2U6ICAxMyB9XHJcbiAgICAgICc2MycgOiB7IHg6IDI2OCwgeTogMjU1LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzMgfVxyXG4gICAgICAnNDInIDogeyB4OiAxMDMsIHk6IDMwMiwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cclxuICAgICAgJzQwJyA6IHsgeDogMjcwLCB5OiAxOTAsIHdpZHRoOiAgMjMsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAyMSB9XHJcbiAgICAgICc0MScgOiB7IHg6IDI5MywgeTogMTMwLCB3aWR0aDogIDIzLCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMjEgfVxyXG4gICAgICAnOTUnIDogeyB4OiAxMTEsIHk6IDMwMiwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cclxuICAgICAgJzQzJyA6IHsgeDogMjQ2LCB5OiAzMTYsIHdpZHRoOiAgMzUsIGhlaWdodDogIDM0LCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAzOSwgeGFkdmFuY2U6ICAzMiB9XHJcbiAgICAgICc0NScgOiB7IHg6IDE4NCwgeTogNDM1LCB3aWR0aDogIDI2LCBoZWlnaHQ6ICAxMSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgNDQsIHhhZHZhbmNlOiAgMjUgfVxyXG4gICAgICAnNjEnIDogeyB4OiAzMTIsIHk6ICA2OCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgMzAsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDQyLCB4YWR2YW5jZTogIDMzIH1cclxuICAgICAgJzQ2JyA6IHsgeDogMTM1LCB5OiAzMTMsIHdpZHRoOiAgMTQsIGhlaWdodDogIDExLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA2MSwgeGFkdmFuY2U6ICAxNCB9XHJcbiAgICAgICc0NCcgOiB7IHg6IDIyNywgeTogMjU1LCB3aWR0aDogIDEwLCBoZWlnaHQ6ICAyMSwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNjgsIHhhZHZhbmNlOiAgMTEgfVxyXG4gICAgICAnNDcnIDogeyB4OiAzNTEsIHk6ICAgOCwgd2lkdGg6ICAyOCwgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDE5LCB4YWR2YW5jZTogIDI2IH1cclxuICAgICAgJzEyNCc6IHsgeDogMTE5LCB5OiAzMDIsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XHJcbiAgICAgICczNCcgOiB7IHg6IDEyNywgeTogMzAyLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxyXG4gICAgICAnMzknIDogeyB4OiAyMDEsIHk6IDE5NCwgd2lkdGg6ICAxOCwgaGVpZ2h0OiAgMTksIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogICAwLCB4YWR2YW5jZTogIDIxIH1cclxuICAgICAgJzY0JyA6IHsgeDogMjE4LCB5OiA0MzUsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XHJcbiAgICAgICczNScgOiB7IHg6IDIxOCwgeTogNDQzLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxyXG4gICAgICAnMzYnIDogeyB4OiAzMDEsIHk6IDE5MCwgd2lkdGg6ICAzMiwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDIyLCB4YWR2YW5jZTogIDI5IH1cclxuICAgICAgJzk0JyA6IHsgeDogMjE4LCB5OiA0NTEsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XHJcbiAgICAgICczOCcgOiB7IHg6IDI0NiwgeTogMzU4LCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxyXG4gICAgICAnMTIzJzogeyB4OiAzMjQsIHk6IDEwNiwgd2lkdGg6ICAyNywgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDI2IH1cclxuICAgICAgJzEyNSc6IHsgeDogMjcwLCB5OiAzNTgsIHdpZHRoOiAgMjcsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAyNyB9XHJcbiAgICAgICc5MScgOiB7IHg6IDI3MCwgeTogNDE4LCB3aWR0aDogIDIyLCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMjEgfVxyXG4gICAgICAnOTMnIDogeyB4OiAzMDAsIHk6IDQxOCwgd2lkdGg6ICAyMiwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDIwIH1cclxuICAgICAgJzQ4JyA6IHsgeDogMzA1LCB5OiAzMTYsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XHJcbiAgICAgICc0OScgOiB7IHg6IDMxMSwgeTogMjUxLCB3aWR0aDogIDM0LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxyXG4gICAgICAnNTAnIDogeyB4OiAzNDEsIHk6IDE2Niwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM3IH1cclxuICAgICAgJzUxJyA6IHsgeDogMzU5LCB5OiAgNjgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XHJcbiAgICAgICc1MicgOiB7IHg6IDMzMCwgeTogMzc3LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxyXG4gICAgICAnNTMnIDogeyB4OiAzNDgsIHk6IDMxMiwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM3IH1cclxuICAgICAgJzU0JyA6IHsgeDogMzMwLCB5OiA0MzgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XHJcbiAgICAgICc1NScgOiB7IHg6IDM1MywgeTogMjI3LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnNTYnIDogeyB4OiAzODQsIHk6IDEyOSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cclxuICAgICAgJzU3JyA6IHsgeDogNDAyLCB5OiAgIDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XHJcbiAgICAgICczMicgOiB7IHg6ICAgMCwgeTogICAwLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMjIgfVxyXG5cclxuICAgICAgIyBjYXJkIGdseXBoc1xyXG4gICAgICAnMjAwJzogeyB4OiAzOTYsIHk6IDM3OCwgd2lkdGg6ICA0MCwgaGVpZ2h0OiAgNDksIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIxLCB4YWR2YW5jZTogIDQzIH0gIyBTXHJcbiAgICAgICcyMDEnOiB7IHg6IDQ0NywgeTogMzEzLCB3aWR0aDogIDQ5LCBoZWlnaHQ6ICA1MCwgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjEsIHhhZHZhbmNlOiAgNTIgfSAjIENcclxuICAgICAgJzIwMic6IHsgeDogMzk5LCB5OiAzMTMsIHdpZHRoOiAgMzYsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMSwgeGFkdmFuY2U6ICAzOSB9ICMgRFxyXG4gICAgICAnMjAzJzogeyB4OiA0NTIsIHk6IDM4MSwgd2lkdGg6ICAzOSwgaGVpZ2h0OiAgNDMsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIxLCB4YWR2YW5jZTogIDQyIH0gIyBIXHJcbiIsIiMgVGhpcyBmaWxlIHByb3ZpZGVzIHRoZSByZW5kZXJpbmcgZW5naW5lIGZvciB0aGUgd2ViIHZlcnNpb24uIE5vbmUgb2YgdGhpcyBjb2RlIGlzIGluY2x1ZGVkIGluIHRoZSBKYXZhIHZlcnNpb24uXHJcblxyXG5jb25zb2xlLmxvZyAnd2ViIHN0YXJ0dXAnXHJcblxyXG5HYW1lID0gcmVxdWlyZSAnLi9HYW1lJ1xyXG5cclxuIyB0YWtlbiBmcm9tIGh0dHA6I3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy81NjIzODM4L3JnYi10by1oZXgtYW5kLWhleC10by1yZ2JcclxuY29tcG9uZW50VG9IZXggPSAoYykgLT5cclxuICBoZXggPSBNYXRoLmZsb29yKGMgKiAyNTUpLnRvU3RyaW5nKDE2KVxyXG4gIHJldHVybiBpZiBoZXgubGVuZ3RoID09IDEgdGhlbiBcIjBcIiArIGhleCBlbHNlIGhleFxyXG5yZ2JUb0hleCA9IChyLCBnLCBiKSAtPlxyXG4gIHJldHVybiBcIiNcIiArIGNvbXBvbmVudFRvSGV4KHIpICsgY29tcG9uZW50VG9IZXgoZykgKyBjb21wb25lbnRUb0hleChiKVxyXG5cclxuU0FWRV9USU1FUl9NUyA9IDMwMDBcclxuXHJcbmNsYXNzIE5hdGl2ZUFwcFxyXG4gIGNvbnN0cnVjdG9yOiAoQHNjcmVlbiwgQHdpZHRoLCBAaGVpZ2h0KSAtPlxyXG4gICAgQHRpbnRlZFRleHR1cmVDYWNoZSA9IFtdXHJcbiAgICBAbGFzdFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxyXG4gICAgQGxhc3RJbnRlcmFjdFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxyXG4gICAgQGhlYXJkT25lVG91Y2ggPSBmYWxzZVxyXG4gICAgQHRvdWNoTW91c2UgPSBudWxsXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2Vkb3duJywgIEBvbk1vdXNlRG93bi5iaW5kKHRoaXMpLCBmYWxzZVxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNlbW92ZScsICBAb25Nb3VzZU1vdmUuYmluZCh0aGlzKSwgZmFsc2VcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdtb3VzZXVwJywgICAgQG9uTW91c2VVcC5iaW5kKHRoaXMpLCBmYWxzZVxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ3RvdWNoc3RhcnQnLCBAb25Ub3VjaFN0YXJ0LmJpbmQodGhpcyksIGZhbHNlXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAndG91Y2htb3ZlJywgIEBvblRvdWNoTW92ZS5iaW5kKHRoaXMpLCBmYWxzZVxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ3RvdWNoZW5kJywgICBAb25Ub3VjaEVuZC5iaW5kKHRoaXMpLCBmYWxzZVxyXG4gICAgQGNvbnRleHQgPSBAc2NyZWVuLmdldENvbnRleHQoXCIyZFwiKVxyXG4gICAgQHRleHR1cmVzID0gW1xyXG4gICAgICAjIGFsbCBjYXJkIGFydFxyXG4gICAgICBcIi4uL2ltYWdlcy9jYXJkcy5wbmdcIlxyXG4gICAgICAjIGZvbnRzXHJcbiAgICAgIFwiLi4vaW1hZ2VzL2Rhcmtmb3Jlc3QucG5nXCJcclxuICAgICAgIyBjaGFyYWN0ZXJzIC8gb3RoZXJcclxuICAgICAgXCIuLi9pbWFnZXMvY2hhcnMucG5nXCJcclxuICAgICAgIyBoZWxwXHJcbiAgICAgIFwiLi4vaW1hZ2VzL2hvd3RvcGxheTEucG5nXCJcclxuICAgIF1cclxuXHJcbiAgICBAZ2FtZSA9IG5ldyBHYW1lKHRoaXMsIEB3aWR0aCwgQGhlaWdodClcclxuXHJcbiAgICBpZiB0eXBlb2YgU3RvcmFnZSAhPSBcInVuZGVmaW5lZFwiXHJcbiAgICAgIHN0YXRlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0gXCJzdGF0ZVwiXHJcbiAgICAgIGlmIHN0YXRlXHJcbiAgICAgICAgIyBjb25zb2xlLmxvZyBcImxvYWRpbmcgc3RhdGU6ICN7c3RhdGV9XCJcclxuICAgICAgICBAZ2FtZS5sb2FkIHN0YXRlXHJcblxyXG4gICAgQHBlbmRpbmdJbWFnZXMgPSAwXHJcbiAgICBsb2FkZWRUZXh0dXJlcyA9IFtdXHJcbiAgICBmb3IgaW1hZ2VVcmwgaW4gQHRleHR1cmVzXHJcbiAgICAgIEBwZW5kaW5nSW1hZ2VzKytcclxuICAgICAgY29uc29sZS5sb2cgXCJsb2FkaW5nIGltYWdlICN7QHBlbmRpbmdJbWFnZXN9OiAje2ltYWdlVXJsfVwiXHJcbiAgICAgIGltZyA9IG5ldyBJbWFnZSgpXHJcbiAgICAgIGltZy5vbmxvYWQgPSBAb25JbWFnZUxvYWRlZC5iaW5kKHRoaXMpXHJcbiAgICAgIGltZy5zcmMgPSBpbWFnZVVybFxyXG4gICAgICBsb2FkZWRUZXh0dXJlcy5wdXNoIGltZ1xyXG4gICAgQHRleHR1cmVzID0gbG9hZGVkVGV4dHVyZXNcclxuXHJcbiAgICBAc2F2ZVRpbWVyID0gU0FWRV9USU1FUl9NU1xyXG5cclxuICBvbkltYWdlTG9hZGVkOiAoaW5mbykgLT5cclxuICAgIEBwZW5kaW5nSW1hZ2VzLS1cclxuICAgIGlmIEBwZW5kaW5nSW1hZ2VzID09IDBcclxuICAgICAgY29uc29sZS5sb2cgJ0FsbCBpbWFnZXMgbG9hZGVkLiBCZWdpbm5pbmcgcmVuZGVyIGxvb3AuJ1xyXG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPT4gQHVwZGF0ZSgpXHJcblxyXG4gIGxvZzogKHMpIC0+XHJcbiAgICBjb25zb2xlLmxvZyBcIk5hdGl2ZUFwcC5sb2coKTogI3tzfVwiXHJcblxyXG4gIHVwZGF0ZVNhdmU6IChkdCkgLT5cclxuICAgIHJldHVybiBpZiB0eXBlb2YgU3RvcmFnZSA9PSBcInVuZGVmaW5lZFwiXHJcbiAgICBAc2F2ZVRpbWVyIC09IGR0XHJcbiAgICBpZiBAc2F2ZVRpbWVyIDw9IDBcclxuICAgICAgQHNhdmVUaW1lciA9IFNBVkVfVElNRVJfTVNcclxuICAgICAgc3RhdGUgPSBAZ2FtZS5zYXZlKClcclxuICAgICAgIyBjb25zb2xlLmxvZyBcInNhdmluZzogI3tzdGF0ZX1cIlxyXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSBcInN0YXRlXCIsIHN0YXRlXHJcblxyXG4gIGdlbmVyYXRlVGludEltYWdlOiAodGV4dHVyZUluZGV4LCByZWQsIGdyZWVuLCBibHVlKSAtPlxyXG4gICAgaW1nID0gQHRleHR1cmVzW3RleHR1cmVJbmRleF1cclxuICAgIGJ1ZmYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50IFwiY2FudmFzXCJcclxuICAgIGJ1ZmYud2lkdGggID0gaW1nLndpZHRoXHJcbiAgICBidWZmLmhlaWdodCA9IGltZy5oZWlnaHRcclxuXHJcbiAgICBjdHggPSBidWZmLmdldENvbnRleHQgXCIyZFwiXHJcbiAgICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2NvcHknXHJcbiAgICBjdHguZHJhd0ltYWdlKGltZywgMCwgMClcclxuICAgIGZpbGxDb2xvciA9IFwicmdiKCN7TWF0aC5mbG9vcihyZWQqMjU1KX0sICN7TWF0aC5mbG9vcihncmVlbioyNTUpfSwgI3tNYXRoLmZsb29yKGJsdWUqMjU1KX0pXCJcclxuICAgIGN0eC5maWxsU3R5bGUgPSBmaWxsQ29sb3JcclxuICAgICMgY29uc29sZS5sb2cgXCJmaWxsQ29sb3IgI3tmaWxsQ29sb3J9XCJcclxuICAgIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnbXVsdGlwbHknXHJcbiAgICBjdHguZmlsbFJlY3QoMCwgMCwgYnVmZi53aWR0aCwgYnVmZi5oZWlnaHQpXHJcbiAgICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2NvcHknXHJcbiAgICBjdHguZ2xvYmFsQWxwaGEgPSAxLjBcclxuICAgIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnZGVzdGluYXRpb24taW4nXHJcbiAgICBjdHguZHJhd0ltYWdlKGltZywgMCwgMClcclxuXHJcbiAgICBpbWdDb21wID0gbmV3IEltYWdlKClcclxuICAgIGltZ0NvbXAuc3JjID0gYnVmZi50b0RhdGFVUkwoKVxyXG4gICAgcmV0dXJuIGltZ0NvbXBcclxuXHJcbiAgZHJhd0ltYWdlOiAodGV4dHVyZUluZGV4LCBzcmNYLCBzcmNZLCBzcmNXLCBzcmNILCBkc3RYLCBkc3RZLCBkc3RXLCBkc3RILCByb3QsIGFuY2hvclgsIGFuY2hvclksIHIsIGcsIGIsIGEpIC0+XHJcbiAgICB0ZXh0dXJlID0gQHRleHR1cmVzW3RleHR1cmVJbmRleF1cclxuICAgIGlmIChyICE9IDEpIG9yIChnICE9IDEpIG9yIChiICE9IDEpXHJcbiAgICAgIHRpbnRlZFRleHR1cmVLZXkgPSBcIiN7dGV4dHVyZUluZGV4fS0je3J9LSN7Z30tI3tifVwiXHJcbiAgICAgIHRpbnRlZFRleHR1cmUgPSBAdGludGVkVGV4dHVyZUNhY2hlW3RpbnRlZFRleHR1cmVLZXldXHJcbiAgICAgIGlmIG5vdCB0aW50ZWRUZXh0dXJlXHJcbiAgICAgICAgdGludGVkVGV4dHVyZSA9IEBnZW5lcmF0ZVRpbnRJbWFnZSB0ZXh0dXJlSW5kZXgsIHIsIGcsIGJcclxuICAgICAgICBAdGludGVkVGV4dHVyZUNhY2hlW3RpbnRlZFRleHR1cmVLZXldID0gdGludGVkVGV4dHVyZVxyXG4gICAgICAgICMgY29uc29sZS5sb2cgXCJnZW5lcmF0ZWQgY2FjaGVkIHRleHR1cmUgI3t0aW50ZWRUZXh0dXJlS2V5fVwiXHJcbiAgICAgIHRleHR1cmUgPSB0aW50ZWRUZXh0dXJlXHJcblxyXG4gICAgQGNvbnRleHQuc2F2ZSgpXHJcbiAgICBAY29udGV4dC50cmFuc2xhdGUgZHN0WCwgZHN0WVxyXG4gICAgQGNvbnRleHQucm90YXRlIHJvdCAjICogMy4xNDE1OTIgLyAxODAuMFxyXG4gICAgYW5jaG9yT2Zmc2V0WCA9IC0xICogYW5jaG9yWCAqIGRzdFdcclxuICAgIGFuY2hvck9mZnNldFkgPSAtMSAqIGFuY2hvclkgKiBkc3RIXHJcbiAgICBAY29udGV4dC50cmFuc2xhdGUgYW5jaG9yT2Zmc2V0WCwgYW5jaG9yT2Zmc2V0WVxyXG4gICAgQGNvbnRleHQuZ2xvYmFsQWxwaGEgPSBhXHJcbiAgICBAY29udGV4dC5kcmF3SW1hZ2UodGV4dHVyZSwgc3JjWCwgc3JjWSwgc3JjVywgc3JjSCwgMCwgMCwgZHN0VywgZHN0SClcclxuICAgIEBjb250ZXh0LnJlc3RvcmUoKVxyXG5cclxuICB1cGRhdGU6IC0+XHJcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPT4gQHVwZGF0ZSgpXHJcblxyXG4gICAgbm93ID0gbmV3IERhdGUoKS5nZXRUaW1lKClcclxuICAgIGR0ID0gbm93IC0gQGxhc3RUaW1lXHJcblxyXG4gICAgdGltZVNpbmNlSW50ZXJhY3QgPSBub3cgLSBAbGFzdEludGVyYWN0VGltZVxyXG4gICAgaWYgdGltZVNpbmNlSW50ZXJhY3QgPiA1MDAwXHJcbiAgICAgIGdvYWxGUFMgPSA1ICMgY2FsbSBkb3duLCBub2JvZHkgaXMgZG9pbmcgYW55dGhpbmcgZm9yIDUgc2Vjb25kc1xyXG4gICAgZWxzZVxyXG4gICAgICBnb2FsRlBTID0gMjAwICMgYXMgZmFzdCBhcyBwb3NzaWJsZVxyXG4gICAgaWYgQGxhc3RHb2FsRlBTICE9IGdvYWxGUFNcclxuICAgICAgY29uc29sZS5sb2cgXCJzd2l0Y2hpbmcgdG8gI3tnb2FsRlBTfSBGUFNcIlxyXG4gICAgICBAbGFzdEdvYWxGUFMgPSBnb2FsRlBTXHJcblxyXG4gICAgZnBzSW50ZXJ2YWwgPSAxMDAwIC8gZ29hbEZQU1xyXG4gICAgaWYgZHQgPCBmcHNJbnRlcnZhbFxyXG4gICAgICByZXR1cm5cclxuICAgIEBsYXN0VGltZSA9IG5vd1xyXG5cclxuICAgIEBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBAd2lkdGgsIEBoZWlnaHQpXHJcbiAgICBAZ2FtZS51cGRhdGUoZHQpXHJcbiAgICByZW5kZXJDb21tYW5kcyA9IEBnYW1lLnJlbmRlcigpXHJcblxyXG4gICAgaSA9IDBcclxuICAgIG4gPSByZW5kZXJDb21tYW5kcy5sZW5ndGhcclxuICAgIHdoaWxlIChpIDwgbilcclxuICAgICAgZHJhd0NhbGwgPSByZW5kZXJDb21tYW5kcy5zbGljZShpLCBpICs9IDE2KVxyXG4gICAgICBAZHJhd0ltYWdlLmFwcGx5KHRoaXMsIGRyYXdDYWxsKVxyXG5cclxuICAgIEB1cGRhdGVTYXZlKGR0KVxyXG5cclxuICBvblRvdWNoU3RhcnQ6IChldnQpIC0+XHJcbiAgICBAbGFzdEludGVyYWN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXHJcbiAgICBAaGVhcmRPbmVUb3VjaCA9IHRydWVcclxuICAgIHRvdWNoZXMgPSBldnQuY2hhbmdlZFRvdWNoZXNcclxuICAgIGZvciB0b3VjaCBpbiB0b3VjaGVzXHJcbiAgICAgIGlmIEB0b3VjaE1vdXNlID09IG51bGxcclxuICAgICAgICBAdG91Y2hNb3VzZSA9IHRvdWNoLmlkZW50aWZpZXJcclxuICAgICAgaWYgQHRvdWNoTW91c2UgPT0gdG91Y2guaWRlbnRpZmllclxyXG4gICAgICAgIEBnYW1lLnRvdWNoRG93bih0b3VjaC5jbGllbnRYLCB0b3VjaC5jbGllbnRZKVxyXG5cclxuICBvblRvdWNoTW92ZTogKGV2dCkgLT5cclxuICAgIEBsYXN0SW50ZXJhY3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcclxuICAgIHRvdWNoZXMgPSBldnQuY2hhbmdlZFRvdWNoZXNcclxuICAgIGZvciB0b3VjaCBpbiB0b3VjaGVzXHJcbiAgICAgIGlmIEB0b3VjaE1vdXNlID09IHRvdWNoLmlkZW50aWZpZXJcclxuICAgICAgICBAZ2FtZS50b3VjaE1vdmUodG91Y2guY2xpZW50WCwgdG91Y2guY2xpZW50WSlcclxuXHJcbiAgb25Ub3VjaEVuZDogKGV2dCkgLT5cclxuICAgIEBsYXN0SW50ZXJhY3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcclxuICAgIHRvdWNoZXMgPSBldnQuY2hhbmdlZFRvdWNoZXNcclxuICAgIGZvciB0b3VjaCBpbiB0b3VjaGVzXHJcbiAgICAgIGlmIEB0b3VjaE1vdXNlID09IHRvdWNoLmlkZW50aWZpZXJcclxuICAgICAgICBAZ2FtZS50b3VjaFVwKHRvdWNoLmNsaWVudFgsIHRvdWNoLmNsaWVudFkpXHJcbiAgICAgICAgQHRvdWNoTW91c2UgPSBudWxsXHJcbiAgICBpZiBldnQudG91Y2hlcy5sZW5ndGggPT0gMFxyXG4gICAgICBAdG91Y2hNb3VzZSA9IG51bGxcclxuXHJcbiAgb25Nb3VzZURvd246IChldnQpIC0+XHJcbiAgICBpZiBAaGVhcmRPbmVUb3VjaFxyXG4gICAgICByZXR1cm5cclxuICAgIEBsYXN0SW50ZXJhY3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcclxuICAgIEBnYW1lLnRvdWNoRG93bihldnQuY2xpZW50WCwgZXZ0LmNsaWVudFkpXHJcblxyXG4gIG9uTW91c2VNb3ZlOiAoZXZ0KSAtPlxyXG4gICAgaWYgQGhlYXJkT25lVG91Y2hcclxuICAgICAgcmV0dXJuXHJcbiAgICBAbGFzdEludGVyYWN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXHJcbiAgICBAZ2FtZS50b3VjaE1vdmUoZXZ0LmNsaWVudFgsIGV2dC5jbGllbnRZKVxyXG5cclxuICBvbk1vdXNlVXA6IChldnQpIC0+XHJcbiAgICBpZiBAaGVhcmRPbmVUb3VjaFxyXG4gICAgICByZXR1cm5cclxuICAgIEBsYXN0SW50ZXJhY3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcclxuICAgIEBnYW1lLnRvdWNoVXAoZXZ0LmNsaWVudFgsIGV2dC5jbGllbnRZKVxyXG5cclxuc2NyZWVuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ3NjcmVlbidcclxucmVzaXplU2NyZWVuID0gLT5cclxuICBkZXNpcmVkQXNwZWN0UmF0aW8gPSAxNiAvIDlcclxuICBjdXJyZW50QXNwZWN0UmF0aW8gPSB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodFxyXG4gIGlmIGN1cnJlbnRBc3BlY3RSYXRpbyA8IGRlc2lyZWRBc3BlY3RSYXRpb1xyXG4gICAgc2NyZWVuLndpZHRoID0gd2luZG93LmlubmVyV2lkdGhcclxuICAgIHNjcmVlbi5oZWlnaHQgPSBNYXRoLmZsb29yKHdpbmRvdy5pbm5lcldpZHRoICogKDEgLyBkZXNpcmVkQXNwZWN0UmF0aW8pKVxyXG4gIGVsc2VcclxuICAgIHNjcmVlbi53aWR0aCA9IE1hdGguZmxvb3Iod2luZG93LmlubmVySGVpZ2h0ICogZGVzaXJlZEFzcGVjdFJhdGlvKVxyXG4gICAgc2NyZWVuLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxyXG5yZXNpemVTY3JlZW4oKVxyXG4jIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdyZXNpemUnLCByZXNpemVTY3JlZW4sIGZhbHNlXHJcblxyXG5hcHAgPSBuZXcgTmF0aXZlQXBwKHNjcmVlbiwgc2NyZWVuLndpZHRoLCBzY3JlZW4uaGVpZ2h0KVxyXG4iXX0=
