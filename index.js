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

BUILD_TIMESTAMP = "1.0.4";

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
      if (!this.canThrowAnything()) {
        if (this.currentPlay && (this.currentPlay.type === 'kind1') && this.hasBreaker(currentPlayer.hand)) {

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

  Thirteen.prototype.aiCalcRuns = function(hand, plays, smallRuns, singleSize) {
    var byAmount, endSize, key, leftovers, n, ref, ref1, ref2, ref3, runSize, runs, startSize;
    if (singleSize == null) {
      singleSize = null;
    }
    if (singleSize !== null) {
      startSize = singleSize;
      endSize = singleSize;
      byAmount = 1;
    } else {
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
      ref3 = this.aiFindRuns(hand, 1, runSize), runs = ref3[0], leftovers = ref3[1];
      if (runs.length > 0) {
        key = "run" + runSize;
        plays[key] = runs;
      }
      hand = leftovers;
    }
    return hand;
  };

  Thirteen.prototype.aiCalcRops = function(hand, plays, singleSize) {
    var endSize, key, leftovers, n, ref, ref1, ref2, rops, runSize, startSize;
    if (singleSize == null) {
      singleSize = null;
    }
    if (singleSize === null) {
      startSize = 3;
      endSize = 6;
    } else {
      startSize = singleSize;
      endSize = singleSize;
    }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQW5pbWF0aW9uLmNvZmZlZSIsInNyYy9CdXR0b24uY29mZmVlIiwic3JjL0ZvbnRSZW5kZXJlci5jb2ZmZWUiLCJzcmMvR2FtZS5jb2ZmZWUiLCJzcmMvSGFuZC5jb2ZmZWUiLCJzcmMvTWVudS5jb2ZmZWUiLCJzcmMvUGlsZS5jb2ZmZWUiLCJzcmMvU3ByaXRlUmVuZGVyZXIuY29mZmVlIiwic3JjL1RoaXJ0ZWVuLmNvZmZlZSIsInNyYy9mb250bWV0cmljcy5jb2ZmZWUiLCJzcmMvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBOztBQUFBLFFBQUEsR0FBVyxTQUFDLENBQUQ7RUFDVCxJQUFHLENBQUEsS0FBSyxDQUFSO0FBQ0UsV0FBTyxFQURUO0dBQUEsTUFFSyxJQUFHLENBQUEsR0FBSSxDQUFQO0FBQ0gsV0FBTyxDQUFDLEVBREw7O0FBRUwsU0FBTztBQUxFOztBQU9MO0VBQ1MsbUJBQUMsSUFBRDtBQUNYLFFBQUE7SUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksQ0FBQztJQUNkLElBQUMsQ0FBQSxHQUFELEdBQU87SUFDUCxJQUFDLENBQUEsR0FBRCxHQUFPO0FBQ1AsU0FBQSxTQUFBOztNQUNFLElBQUcsQ0FBQSxLQUFLLE9BQVI7UUFDRSxJQUFDLENBQUEsR0FBSSxDQUFBLENBQUEsQ0FBTCxHQUFVO1FBQ1YsSUFBQyxDQUFBLEdBQUksQ0FBQSxDQUFBLENBQUwsR0FBVSxFQUZaOztBQURGO0VBSlc7O3NCQVViLElBQUEsR0FBTSxTQUFBO0lBQ0osSUFBRyxrQkFBSDtNQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBTCxHQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFEaEI7O0lBRUEsSUFBRyxrQkFBSDtNQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBTCxHQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFEaEI7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TCxDQUEvQixFQUZsQjtHQUFBLE1BQUE7SUFJRSxNQUFNLENBQUMsS0FBUCxHQUFlLElBQUksQ0FBQyxLQUFMLENBQVcsTUFBTSxDQUFDLFdBQVAsR0FBcUIsa0JBQWhDO1dBQ2YsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsTUFBTSxDQUFDLFlBTHpCOztBQUhhOztBQVNmLFlBQUEsQ0FBQTs7QUFHQSxHQUFBLEdBQU0sSUFBSSxTQUFKLENBQWMsTUFBZCxFQUFzQixNQUFNLENBQUMsS0FBN0IsRUFBb0MsTUFBTSxDQUFDLE1BQTNDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY2FsY1NpZ24gPSAodikgLT5cclxuICBpZiB2ID09IDBcclxuICAgIHJldHVybiAwXHJcbiAgZWxzZSBpZiB2IDwgMFxyXG4gICAgcmV0dXJuIC0xXHJcbiAgcmV0dXJuIDFcclxuXHJcbmNsYXNzIEFuaW1hdGlvblxyXG4gIGNvbnN0cnVjdG9yOiAoZGF0YSkgLT5cclxuICAgIEBzcGVlZCA9IGRhdGEuc3BlZWRcclxuICAgIEByZXEgPSB7fVxyXG4gICAgQGN1ciA9IHt9XHJcbiAgICBmb3Igayx2IG9mIGRhdGFcclxuICAgICAgaWYgayAhPSAnc3BlZWQnXHJcbiAgICAgICAgQHJlcVtrXSA9IHZcclxuICAgICAgICBAY3VyW2tdID0gdlxyXG5cclxuICAjICdmaW5pc2hlcycgYWxsIGFuaW1hdGlvbnNcclxuICB3YXJwOiAtPlxyXG4gICAgaWYgQGN1ci5yP1xyXG4gICAgICBAY3VyLnIgPSBAcmVxLnJcclxuICAgIGlmIEBjdXIucz9cclxuICAgICAgQGN1ci5zID0gQHJlcS5zXHJcbiAgICBpZiBAY3VyLng/IGFuZCBAY3VyLnk/XHJcbiAgICAgIEBjdXIueCA9IEByZXEueFxyXG4gICAgICBAY3VyLnkgPSBAcmVxLnlcclxuXHJcbiAgYW5pbWF0aW5nOiAtPlxyXG4gICAgaWYgQGN1ci5yP1xyXG4gICAgICBpZiBAcmVxLnIgIT0gQGN1ci5yXHJcbiAgICAgICAgcmV0dXJuIHRydWVcclxuICAgIGlmIEBjdXIucz9cclxuICAgICAgaWYgQHJlcS5zICE9IEBjdXIuc1xyXG4gICAgICAgIHJldHVybiB0cnVlXHJcbiAgICBpZiBAY3VyLng/IGFuZCBAY3VyLnk/XHJcbiAgICAgIGlmIChAcmVxLnggIT0gQGN1ci54KSBvciAoQHJlcS55ICE9IEBjdXIueSlcclxuICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gIHVwZGF0ZTogKGR0KSAtPlxyXG4gICAgdXBkYXRlZCA9IGZhbHNlXHJcbiAgICAjIHJvdGF0aW9uXHJcbiAgICBpZiBAY3VyLnI/XHJcbiAgICAgIGlmIEByZXEuciAhPSBAY3VyLnJcclxuICAgICAgICB1cGRhdGVkID0gdHJ1ZVxyXG4gICAgICAgICMgc2FuaXRpemUgcmVxdWVzdGVkIHJvdGF0aW9uXHJcbiAgICAgICAgdHdvUGkgPSBNYXRoLlBJICogMlxyXG4gICAgICAgIG5lZ1R3b1BpID0gLTEgKiB0d29QaVxyXG4gICAgICAgIEByZXEuciAtPSB0d29QaSB3aGlsZSBAcmVxLnIgPj0gdHdvUGlcclxuICAgICAgICBAcmVxLnIgKz0gdHdvUGkgd2hpbGUgQHJlcS5yIDw9IG5lZ1R3b1BpXHJcbiAgICAgICAgIyBwaWNrIGEgZGlyZWN0aW9uIGFuZCB0dXJuXHJcbiAgICAgICAgZHIgPSBAcmVxLnIgLSBAY3VyLnJcclxuICAgICAgICBkaXN0ID0gTWF0aC5hYnMoZHIpXHJcbiAgICAgICAgc2lnbiA9IGNhbGNTaWduKGRyKVxyXG4gICAgICAgIGlmIGRpc3QgPiBNYXRoLlBJXHJcbiAgICAgICAgICAjIHNwaW4gdGhlIG90aGVyIGRpcmVjdGlvbiwgaXQgaXMgY2xvc2VyXHJcbiAgICAgICAgICBkaXN0ID0gdHdvUGkgLSBkaXN0XHJcbiAgICAgICAgICBzaWduICo9IC0xXHJcbiAgICAgICAgbWF4RGlzdCA9IGR0ICogQHNwZWVkLnIgLyAxMDAwXHJcbiAgICAgICAgaWYgZGlzdCA8IG1heERpc3RcclxuICAgICAgICAgICMgd2UgY2FuIGZpbmlzaCB0aGlzIGZyYW1lXHJcbiAgICAgICAgICBAY3VyLnIgPSBAcmVxLnJcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBAY3VyLnIgKz0gbWF4RGlzdCAqIHNpZ25cclxuXHJcbiAgICAjIHNjYWxlXHJcbiAgICBpZiBAY3VyLnM/XHJcbiAgICAgIGlmIEByZXEucyAhPSBAY3VyLnNcclxuICAgICAgICB1cGRhdGVkID0gdHJ1ZVxyXG4gICAgICAgICMgcGljayBhIGRpcmVjdGlvbiBhbmQgdHVyblxyXG4gICAgICAgIGRzID0gQHJlcS5zIC0gQGN1ci5zXHJcbiAgICAgICAgZGlzdCA9IE1hdGguYWJzKGRzKVxyXG4gICAgICAgIHNpZ24gPSBjYWxjU2lnbihkcylcclxuICAgICAgICBtYXhEaXN0ID0gZHQgKiBAc3BlZWQucyAvIDEwMDBcclxuICAgICAgICBpZiBkaXN0IDwgbWF4RGlzdFxyXG4gICAgICAgICAgIyB3ZSBjYW4gZmluaXNoIHRoaXMgZnJhbWVcclxuICAgICAgICAgIEBjdXIucyA9IEByZXEuc1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIEBjdXIucyArPSBtYXhEaXN0ICogc2lnblxyXG5cclxuICAgICMgdHJhbnNsYXRpb25cclxuICAgIGlmIEBjdXIueD8gYW5kIEBjdXIueT9cclxuICAgICAgaWYgKEByZXEueCAhPSBAY3VyLngpIG9yIChAcmVxLnkgIT0gQGN1ci55KVxyXG4gICAgICAgIHVwZGF0ZWQgPSB0cnVlXHJcbiAgICAgICAgdmVjWCA9IEByZXEueCAtIEBjdXIueFxyXG4gICAgICAgIHZlY1kgPSBAcmVxLnkgLSBAY3VyLnlcclxuICAgICAgICBkaXN0ID0gTWF0aC5zcXJ0KCh2ZWNYICogdmVjWCkgKyAodmVjWSAqIHZlY1kpKVxyXG4gICAgICAgIG1heERpc3QgPSBkdCAqIEBzcGVlZC50IC8gMTAwMFxyXG4gICAgICAgIGlmIGRpc3QgPCBtYXhEaXN0XHJcbiAgICAgICAgICAjIHdlIGNhbiBmaW5pc2ggdGhpcyBmcmFtZVxyXG4gICAgICAgICAgQGN1ci54ID0gQHJlcS54XHJcbiAgICAgICAgICBAY3VyLnkgPSBAcmVxLnlcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAjIG1vdmUgYXMgbXVjaCBhcyBwb3NzaWJsZVxyXG4gICAgICAgICAgQGN1ci54ICs9ICh2ZWNYIC8gZGlzdCkgKiBtYXhEaXN0XHJcbiAgICAgICAgICBAY3VyLnkgKz0gKHZlY1kgLyBkaXN0KSAqIG1heERpc3RcclxuXHJcbiAgICByZXR1cm4gdXBkYXRlZFxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBbmltYXRpb25cclxuIiwiQW5pbWF0aW9uID0gcmVxdWlyZSAnLi9BbmltYXRpb24nXHJcblxyXG5jbGFzcyBCdXR0b25cclxuICBjb25zdHJ1Y3RvcjogKEBnYW1lLCBAc3ByaXRlTmFtZXMsIEBmb250LCBAdGV4dEhlaWdodCwgQHgsIEB5LCBAY2IpIC0+XHJcbiAgICBAYW5pbSA9IG5ldyBBbmltYXRpb24ge1xyXG4gICAgICBzcGVlZDogeyBzOiAzIH1cclxuICAgICAgczogMFxyXG4gICAgfVxyXG4gICAgQGNvbG9yID0geyByOiAxLCBnOiAxLCBiOiAxLCBhOiAwIH1cclxuXHJcbiAgdXBkYXRlOiAoZHQpIC0+XHJcbiAgICByZXR1cm4gQGFuaW0udXBkYXRlKGR0KVxyXG5cclxuICByZW5kZXI6IC0+XHJcbiAgICBAY29sb3IuYSA9IEBhbmltLmN1ci5zXHJcbiAgICBAZ2FtZS5zcHJpdGVSZW5kZXJlci5yZW5kZXIgQHNwcml0ZU5hbWVzWzBdLCBAeCwgQHksIDAsIEB0ZXh0SGVpZ2h0ICogMS41LCAwLCAwLjUsIDAuNSwgQGdhbWUuY29sb3JzLndoaXRlLCA9PlxyXG4gICAgICAjIHB1bHNlIGJ1dHRvbiBhbmltLFxyXG4gICAgICBAYW5pbS5jdXIucyA9IDFcclxuICAgICAgQGFuaW0ucmVxLnMgPSAwXHJcbiAgICAgICMgdGhlbiBjYWxsIGNhbGxiYWNrXHJcbiAgICAgIEBjYih0cnVlKVxyXG4gICAgQGdhbWUuc3ByaXRlUmVuZGVyZXIucmVuZGVyIEBzcHJpdGVOYW1lc1sxXSwgQHgsIEB5LCAwLCBAdGV4dEhlaWdodCAqIDEuNSwgMCwgMC41LCAwLjUsIEBjb2xvclxyXG4gICAgdGV4dCA9IEBjYihmYWxzZSlcclxuICAgIEBnYW1lLmZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIEB0ZXh0SGVpZ2h0LCB0ZXh0LCBAeCwgQHksIDAuNSwgMC41LCBAZ2FtZS5jb2xvcnMuYnV0dG9udGV4dFxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCdXR0b25cclxuIiwiZm9udG1ldHJpY3MgPSByZXF1aXJlICcuL2ZvbnRtZXRyaWNzJ1xyXG5cclxuIyB0YWtlbiBmcm9tIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNTYyMzgzOC9yZ2ItdG8taGV4LWFuZC1oZXgtdG8tcmdiXHJcbmhleFRvUmdiID0gKGhleCwgYSkgLT5cclxuICAgIHJlc3VsdCA9IC9eIz8oW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KShbYS1mXFxkXXsyfSkkL2kuZXhlYyhoZXgpXHJcbiAgICByZXR1cm4gbnVsbCBpZiBub3QgcmVzdWx0XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHI6IHBhcnNlSW50KHJlc3VsdFsxXSwgMTYpIC8gMjU1LFxyXG4gICAgICAgIGc6IHBhcnNlSW50KHJlc3VsdFsyXSwgMTYpIC8gMjU1LFxyXG4gICAgICAgIGI6IHBhcnNlSW50KHJlc3VsdFszXSwgMTYpIC8gMjU1XHJcbiAgICAgICAgYTogYVxyXG4gICAgfVxyXG5cclxuY2xhc3MgRm9udFJlbmRlcmVyXHJcbiAgY29uc3RydWN0b3I6ICAoQGdhbWUpIC0+XHJcbiAgICBAd2hpdGUgPSB7IHI6IDEsIGc6IDEsIGI6IDEsIGE6IDEgfVxyXG5cclxuICBzaXplOiAoZm9udCwgaGVpZ2h0LCBzdHIpIC0+XHJcbiAgICBtZXRyaWNzID0gZm9udG1ldHJpY3NbZm9udF1cclxuICAgIHJldHVybiBpZiBub3QgbWV0cmljc1xyXG4gICAgc2NhbGUgPSBoZWlnaHQgLyBtZXRyaWNzLmhlaWdodFxyXG5cclxuICAgIHRvdGFsV2lkdGggPSAwXHJcbiAgICB0b3RhbEhlaWdodCA9IG1ldHJpY3MuaGVpZ2h0ICogc2NhbGVcclxuXHJcbiAgICBpbkNvbG9yID0gZmFsc2VcclxuICAgIGZvciBjaCwgaSBpbiBzdHJcclxuICAgICAgaWYgY2ggPT0gJ2AnXHJcbiAgICAgICAgaW5Db2xvciA9ICFpbkNvbG9yXHJcblxyXG4gICAgICBpZiBub3QgaW5Db2xvclxyXG4gICAgICAgIGNvZGUgPSBjaC5jaGFyQ29kZUF0KDApXHJcbiAgICAgICAgZ2x5cGggPSBtZXRyaWNzLmdseXBoc1tjb2RlXVxyXG4gICAgICAgIGNvbnRpbnVlIGlmIG5vdCBnbHlwaFxyXG4gICAgICAgIHRvdGFsV2lkdGggKz0gZ2x5cGgueGFkdmFuY2UgKiBzY2FsZVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHc6IHRvdGFsV2lkdGhcclxuICAgICAgaDogdG90YWxIZWlnaHRcclxuICAgIH1cclxuXHJcbiAgcmVuZGVyOiAoZm9udCwgaGVpZ2h0LCBzdHIsIHgsIHksIGFuY2hvcngsIGFuY2hvcnksIGNvbG9yLCBjYikgLT5cclxuICAgIG1ldHJpY3MgPSBmb250bWV0cmljc1tmb250XVxyXG4gICAgcmV0dXJuIGlmIG5vdCBtZXRyaWNzXHJcbiAgICBzY2FsZSA9IGhlaWdodCAvIG1ldHJpY3MuaGVpZ2h0XHJcblxyXG4gICAgdG90YWxXaWR0aCA9IDBcclxuICAgIHRvdGFsSGVpZ2h0ID0gbWV0cmljcy5oZWlnaHQgKiBzY2FsZVxyXG4gICAgc2tpcENvbG9yID0gZmFsc2VcclxuICAgIGZvciBjaCwgaSBpbiBzdHJcclxuICAgICAgaWYgY2ggPT0gJ2AnXHJcbiAgICAgICAgc2tpcENvbG9yID0gIXNraXBDb2xvclxyXG4gICAgICBjb250aW51ZSBpZiBza2lwQ29sb3JcclxuICAgICAgY29kZSA9IGNoLmNoYXJDb2RlQXQoMClcclxuICAgICAgZ2x5cGggPSBtZXRyaWNzLmdseXBoc1tjb2RlXVxyXG4gICAgICBjb250aW51ZSBpZiBub3QgZ2x5cGhcclxuICAgICAgdG90YWxXaWR0aCArPSBnbHlwaC54YWR2YW5jZSAqIHNjYWxlXHJcblxyXG4gICAgYW5jaG9yT2Zmc2V0WCA9IC0xICogYW5jaG9yeCAqIHRvdGFsV2lkdGhcclxuICAgIGFuY2hvck9mZnNldFkgPSAtMSAqIGFuY2hvcnkgKiB0b3RhbEhlaWdodFxyXG4gICAgY3VyclggPSB4XHJcblxyXG4gICAgaWYgY29sb3JcclxuICAgICAgc3RhcnRpbmdDb2xvciA9IGNvbG9yXHJcbiAgICBlbHNlXHJcbiAgICAgIHN0YXJ0aW5nQ29sb3IgPSBAd2hpdGVcclxuICAgIGN1cnJlbnRDb2xvciA9IHN0YXJ0aW5nQ29sb3JcclxuXHJcbiAgICBjb2xvclN0YXJ0ID0gLTFcclxuICAgIGZvciBjaCwgaSBpbiBzdHJcclxuICAgICAgaWYgY2ggPT0gJ2AnXHJcbiAgICAgICAgaWYgY29sb3JTdGFydCA9PSAtMVxyXG4gICAgICAgICAgY29sb3JTdGFydCA9IGkgKyAxXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgbGVuID0gaSAtIGNvbG9yU3RhcnRcclxuICAgICAgICAgIGlmIGxlblxyXG4gICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBoZXhUb1JnYihzdHIuc3Vic3RyKGNvbG9yU3RhcnQsIGkgLSBjb2xvclN0YXJ0KSwgc3RhcnRpbmdDb2xvci5hKVxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBzdGFydGluZ0NvbG9yXHJcbiAgICAgICAgICBjb2xvclN0YXJ0ID0gLTFcclxuXHJcbiAgICAgIGNvbnRpbnVlIGlmIGNvbG9yU3RhcnQgIT0gLTFcclxuICAgICAgY29kZSA9IGNoLmNoYXJDb2RlQXQoMClcclxuICAgICAgZ2x5cGggPSBtZXRyaWNzLmdseXBoc1tjb2RlXVxyXG4gICAgICBjb250aW51ZSBpZiBub3QgZ2x5cGhcclxuICAgICAgQGdhbWUuZHJhd0ltYWdlIGZvbnQsXHJcbiAgICAgIGdseXBoLngsIGdseXBoLnksIGdseXBoLndpZHRoLCBnbHlwaC5oZWlnaHQsXHJcbiAgICAgIGN1cnJYICsgKGdseXBoLnhvZmZzZXQgKiBzY2FsZSkgKyBhbmNob3JPZmZzZXRYLCB5ICsgKGdseXBoLnlvZmZzZXQgKiBzY2FsZSkgKyBhbmNob3JPZmZzZXRZLCBnbHlwaC53aWR0aCAqIHNjYWxlLCBnbHlwaC5oZWlnaHQgKiBzY2FsZSxcclxuICAgICAgMCwgMCwgMCxcclxuICAgICAgY3VycmVudENvbG9yLnIsIGN1cnJlbnRDb2xvci5nLCBjdXJyZW50Q29sb3IuYiwgY3VycmVudENvbG9yLmEsIGNiXHJcbiAgICAgIGN1cnJYICs9IGdseXBoLnhhZHZhbmNlICogc2NhbGVcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRm9udFJlbmRlcmVyXHJcbiIsIkFuaW1hdGlvbiA9IHJlcXVpcmUgJy4vQW5pbWF0aW9uJ1xyXG5CdXR0b24gPSByZXF1aXJlICcuL0J1dHRvbidcclxuRm9udFJlbmRlcmVyID0gcmVxdWlyZSAnLi9Gb250UmVuZGVyZXInXHJcblNwcml0ZVJlbmRlcmVyID0gcmVxdWlyZSAnLi9TcHJpdGVSZW5kZXJlcidcclxuTWVudSA9IHJlcXVpcmUgJy4vTWVudSdcclxuSGFuZCA9IHJlcXVpcmUgJy4vSGFuZCdcclxuUGlsZSA9IHJlcXVpcmUgJy4vUGlsZSdcclxue1RoaXJ0ZWVuLCBPSywgYWlDaGFyYWN0ZXJzLCBhY2hpZXZlbWVudHNMaXN0fSA9IHJlcXVpcmUgJy4vVGhpcnRlZW4nXHJcblxyXG4jIHRlbXBcclxuQlVJTERfVElNRVNUQU1QID0gXCIxLjAuNFwiXHJcblxyXG5jbGFzcyBHYW1lXHJcbiAgY29uc3RydWN0b3I6IChAbmF0aXZlLCBAd2lkdGgsIEBoZWlnaHQpIC0+XHJcbiAgICBAdmVyc2lvbiA9IEJVSUxEX1RJTUVTVEFNUFxyXG4gICAgQGxvZyhcIkdhbWUgY29uc3RydWN0ZWQ6ICN7QHdpZHRofXgje0BoZWlnaHR9XCIpXHJcbiAgICBAZm9udFJlbmRlcmVyID0gbmV3IEZvbnRSZW5kZXJlciB0aGlzXHJcbiAgICBAc3ByaXRlUmVuZGVyZXIgPSBuZXcgU3ByaXRlUmVuZGVyZXIgdGhpc1xyXG4gICAgQGZvbnQgPSBcImRhcmtmb3Jlc3RcIlxyXG4gICAgQHpvbmVzID0gW11cclxuICAgIEBuZXh0QUlUaWNrID0gMTAwMCAjIHdpbGwgYmUgc2V0IGJ5IG9wdGlvbnNcclxuICAgIEBjZW50ZXIgPVxyXG4gICAgICB4OiBAd2lkdGggLyAyXHJcbiAgICAgIHk6IEBoZWlnaHQgLyAyXHJcbiAgICBAYWFIZWlnaHQgPSBAd2lkdGggKiA5IC8gMTZcclxuICAgIEBsb2cgXCJoZWlnaHQ6ICN7QGhlaWdodH0uIGhlaWdodCBpZiBzY3JlZW4gd2FzIDE2OjkgKGFzcGVjdCBhZGp1c3RlZCk6ICN7QGFhSGVpZ2h0fVwiXHJcbiAgICBAcGF1c2VCdXR0b25TaXplID0gQGFhSGVpZ2h0IC8gMTVcclxuICAgIEBjb2xvcnMgPVxyXG4gICAgICBhcnJvdzogICAgICB7IHI6ICAgMSwgZzogICAxLCBiOiAgIDEsIGE6ICAgMSB9XHJcbiAgICAgIGFycm93Y2xvc2U6IHsgcjogICAxLCBnOiAwLjUsIGI6ICAgMCwgYTogMC4zIH1cclxuICAgICAgYmFja2dyb3VuZDogeyByOiAgIDAsIGc6IDAuMiwgYjogICAwLCBhOiAgIDEgfVxyXG4gICAgICBiaWQ6ICAgICAgICB7IHI6ICAgMCwgZzogMC42LCBiOiAgIDAsIGE6ICAgMSB9XHJcbiAgICAgIGJsYWNrOiAgICAgIHsgcjogICAwLCBnOiAgIDAsIGI6ICAgMCwgYTogICAxIH1cclxuICAgICAgYnV0dG9udGV4dDogeyByOiAgIDEsIGc6ICAgMSwgYjogICAxLCBhOiAgIDEgfVxyXG4gICAgICBnYW1lX292ZXI6ICB7IHI6ICAgMSwgZzogMC41LCBiOiAgIDAsIGE6ICAgMSB9XHJcbiAgICAgIGdvbGQ6ICAgICAgIHsgcjogICAxLCBnOiAgIDEsIGI6ICAgMCwgYTogICAxIH1cclxuICAgICAgaGFuZF9hbnk6ICAgeyByOiAgIDAsIGc6ICAgMCwgYjogMC4yLCBhOiAxLjAgfVxyXG4gICAgICBoYW5kX3BpY2s6ICB7IHI6ICAgMCwgZzogMC4xLCBiOiAgIDAsIGE6IDEuMCB9XHJcbiAgICAgIGhhbmRfcmVvcmc6IHsgcjogMC40LCBnOiAgIDAsIGI6ICAgMCwgYTogMS4wIH1cclxuICAgICAgbGlnaHRncmF5OiAgeyByOiAwLjUsIGc6IDAuNSwgYjogMC41LCBhOiAgIDEgfVxyXG4gICAgICBsb2diZzogICAgICB7IHI6IDAuMSwgZzogICAwLCBiOiAgIDAsIGE6ICAgMSB9XHJcbiAgICAgIGxvZ2NvbG9yOiAgIHsgcjogMC41LCBnOiAwLjUsIGI6IDAuNSwgYTogICAxIH1cclxuICAgICAgbWFpbm1lbnU6ICAgeyByOiAwLjEsIGc6IDAuMSwgYjogMC4xLCBhOiAgIDEgfVxyXG4gICAgICBvcmFuZ2U6ICAgICB7IHI6ICAgMSwgZzogMC41LCBiOiAgIDAsIGE6ICAgMSB9XHJcbiAgICAgIG92ZXJsYXk6ICAgIHsgcjogICAwLCBnOiAgIDAsIGI6ICAgMCwgYTogMC42IH1cclxuICAgICAgcGF1c2VtZW51OiAgeyByOiAwLjEsIGc6IDAuMCwgYjogMC4xLCBhOiAgIDEgfVxyXG4gICAgICBwaWxlOiAgICAgICB7IHI6IDAuNCwgZzogMC4yLCBiOiAgIDAsIGE6ICAgMSB9XHJcbiAgICAgIHBsYXlfYWdhaW46IHsgcjogICAwLCBnOiAgIDAsIGI6ICAgMCwgYTogMC42IH1cclxuICAgICAgcmVkOiAgICAgICAgeyByOiAgIDEsIGc6ICAgMCwgYjogICAwLCBhOiAgIDEgfVxyXG4gICAgICB3aGl0ZTogICAgICB7IHI6ICAgMSwgZzogICAxLCBiOiAgIDEsIGE6ICAgMSB9XHJcbiAgICAgIGFjaF9iZzogICAgIHsgcjogMC4xLCBnOiAwLjEsIGI6IDAuMSwgYTogICAxIH1cclxuICAgICAgYWNoX2hlYWRlcjogeyByOiAgIDEsIGc6IDAuNSwgYjogICAwLCBhOiAgIDEgfVxyXG4gICAgICBhY2hfdGl0bGU6ICB7IHI6ICAgMSwgZzogICAxLCBiOiAgIDEsIGE6ICAgMSB9XHJcbiAgICAgIGFjaF9kZXNjOiAgIHsgcjogMC43LCBnOiAwLjcsIGI6IDAuNywgYTogICAxIH1cclxuXHJcbiAgICBAdGV4dHVyZXMgPVxyXG4gICAgICBcImNhcmRzXCI6IDBcclxuICAgICAgXCJkYXJrZm9yZXN0XCI6IDFcclxuICAgICAgXCJjaGFyc1wiOiAyXHJcbiAgICAgIFwiaG93dG8xXCI6IDNcclxuXHJcbiAgICBAdGhpcnRlZW4gPSBudWxsXHJcbiAgICBAbGFzdEVyciA9ICcnXHJcbiAgICBAcGF1c2VkID0gZmFsc2VcclxuICAgIEByZW5kZXJNb2RlID0gMCAjIDAgPSBnYW1lLCAxID0gaG93dG8sIDIgPSBhY2hpZXZlbWVudHMuIHllcywgSSdtIGJlaW5nIGxhenkuXHJcbiAgICBAcmVuZGVyQ29tbWFuZHMgPSBbXVxyXG4gICAgQGFjaGlldmVtZW50RmFuZmFyZSA9IG51bGxcclxuXHJcbiAgICBAb3B0aW9uTWVudXMgPVxyXG4gICAgICBzcGVlZHM6IFtcclxuICAgICAgICB7IHRleHQ6IFwiQUkgU3BlZWQ6IFNsb3dcIiwgc3BlZWQ6IDIwMDAgfVxyXG4gICAgICAgIHsgdGV4dDogXCJBSSBTcGVlZDogTWVkaXVtXCIsIHNwZWVkOiAxMDAwIH1cclxuICAgICAgICB7IHRleHQ6IFwiQUkgU3BlZWQ6IEZhc3RcIiwgc3BlZWQ6IDUwMCB9XHJcbiAgICAgICAgeyB0ZXh0OiBcIkFJIFNwZWVkOiBVbHRyYVwiLCBzcGVlZDogMjUwIH1cclxuICAgICAgXVxyXG4gICAgICBzb3J0czogW1xyXG4gICAgICAgIHsgdGV4dDogXCJTb3J0IE9yZGVyOiBOb3JtYWxcIiB9XHJcbiAgICAgICAgeyB0ZXh0OiBcIlNvcnQgT3JkZXI6IFJldmVyc2VcIiB9XHJcbiAgICAgIF1cclxuICAgIEBvcHRpb25zID1cclxuICAgICAgc3BlZWRJbmRleDogMVxyXG4gICAgICBzb3J0SW5kZXg6IDBcclxuICAgICAgc291bmQ6IHRydWVcclxuXHJcbiAgICBAcGF1c2VNZW51ID0gbmV3IE1lbnUgdGhpcywgXCJQYXVzZWRcIiwgXCJzb2xpZFwiLCBAY29sb3JzLnBhdXNlbWVudSwgW1xyXG4gICAgICAoY2xpY2spID0+XHJcbiAgICAgICAgaWYgY2xpY2tcclxuICAgICAgICAgIEBwYXVzZWQgPSBmYWxzZVxyXG4gICAgICAgIHJldHVybiBcIlJlc3VtZSBHYW1lXCJcclxuICAgICAgKGNsaWNrKSA9PlxyXG4gICAgICAgIGlmIGNsaWNrXHJcbiAgICAgICAgICBAcmVuZGVyTW9kZSA9IDJcclxuICAgICAgICByZXR1cm4gXCJBY2hpZXZlbWVudHNcIlxyXG4gICAgICAoY2xpY2spID0+XHJcbiAgICAgICAgaWYgY2xpY2tcclxuICAgICAgICAgIEByZW5kZXJNb2RlID0gMVxyXG4gICAgICAgIHJldHVybiBcIkhvdyBUbyBQbGF5XCJcclxuICAgICAgKGNsaWNrKSA9PlxyXG4gICAgICAgIGlmIGNsaWNrXHJcbiAgICAgICAgICBAb3B0aW9ucy5zb3J0SW5kZXggPSAoQG9wdGlvbnMuc29ydEluZGV4ICsgMSkgJSBAb3B0aW9uTWVudXMuc29ydHMubGVuZ3RoXHJcbiAgICAgICAgcmV0dXJuIEBvcHRpb25NZW51cy5zb3J0c1tAb3B0aW9ucy5zb3J0SW5kZXhdLnRleHRcclxuICAgICAgKGNsaWNrKSA9PlxyXG4gICAgICAgIGlmIGNsaWNrXHJcbiAgICAgICAgICBAb3B0aW9ucy5zcGVlZEluZGV4ID0gKEBvcHRpb25zLnNwZWVkSW5kZXggKyAxKSAlIEBvcHRpb25NZW51cy5zcGVlZHMubGVuZ3RoXHJcbiAgICAgICAgcmV0dXJuIEBvcHRpb25NZW51cy5zcGVlZHNbQG9wdGlvbnMuc3BlZWRJbmRleF0udGV4dFxyXG4gICAgICAoY2xpY2spID0+XHJcbiAgICAgICAgaWYgY2xpY2tcclxuICAgICAgICAgIEBuZXdHYW1lKHRydWUpXHJcbiAgICAgICAgICBAcGF1c2VkID0gZmFsc2VcclxuICAgICAgICByZXR1cm4gXCJOZXcgTW9uZXkgR2FtZVwiXHJcbiAgICAgIChjbGljaykgPT5cclxuICAgICAgICBpZiBjbGlja1xyXG4gICAgICAgICAgQG5ld0dhbWUoZmFsc2UpXHJcbiAgICAgICAgICBAcGF1c2VkID0gZmFsc2VcclxuICAgICAgICByZXR1cm4gXCJOZXcgR2FtZVwiXHJcbiAgICBdXHJcblxyXG4gICAgQHRoaXJ0ZWVuID0gbmV3IFRoaXJ0ZWVuIHRoaXMsIHt9XHJcbiAgICBAbG9nIFwicGxheWVyIDAncyBoYW5kOiBcIiArIEpTT04uc3RyaW5naWZ5KEB0aGlydGVlbi5wbGF5ZXJzWzBdLmhhbmQpXHJcbiAgICBAcHJlcGFyZUdhbWUoKVxyXG5cclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgIyBsb2dnaW5nXHJcblxyXG4gIGxvZzogKHMpIC0+XHJcbiAgICBAbmF0aXZlLmxvZyhzKVxyXG5cclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgIyBsb2FkIC8gc2F2ZVxyXG5cclxuICBsb2FkOiAoanNvbikgLT5cclxuICAgIEBsb2cgXCIoQ1MpIGxvYWRpbmcgc3RhdGVcIlxyXG4gICAgdHJ5XHJcbiAgICAgIHN0YXRlID0gSlNPTi5wYXJzZSBqc29uXHJcbiAgICBjYXRjaFxyXG4gICAgICBAbG9nIFwibG9hZCBmYWlsZWQgdG8gcGFyc2Ugc3RhdGU6ICN7anNvbn1cIlxyXG4gICAgICByZXR1cm5cclxuICAgIGlmIHN0YXRlLm9wdGlvbnNcclxuICAgICAgZm9yIGssIHYgb2Ygc3RhdGUub3B0aW9uc1xyXG4gICAgICAgIEBvcHRpb25zW2tdID0gdlxyXG5cclxuICAgIGlmIHN0YXRlLnRoaXJ0ZWVuXHJcbiAgICAgIEBsb2cgXCJyZWNyZWF0aW5nIGdhbWUgZnJvbSBzYXZlZGF0YVwiXHJcbiAgICAgIEB0aGlydGVlbiA9IG5ldyBUaGlydGVlbiB0aGlzLCB7XHJcbiAgICAgICAgc3RhdGU6IHN0YXRlLnRoaXJ0ZWVuXHJcbiAgICAgIH1cclxuICAgICAgQHByZXBhcmVHYW1lKClcclxuXHJcbiAgc2F2ZTogLT5cclxuICAgICMgQGxvZyBcIihDUykgc2F2aW5nIHN0YXRlXCJcclxuICAgIHN0YXRlID0ge1xyXG4gICAgICBvcHRpb25zOiBAb3B0aW9uc1xyXG4gICAgfVxyXG5cclxuICAgIGlmIEB0aGlydGVlbj9cclxuICAgICAgQHRoaXJ0ZWVuLnVwZGF0ZVBsYXllckhhbmQoQGhhbmQuY2FyZHMpXHJcbiAgICAgIHN0YXRlLnRoaXJ0ZWVuID0gQHRoaXJ0ZWVuLnNhdmUoKVxyXG5cclxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSBzdGF0ZVxyXG5cclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIGFpVGlja1JhdGU6IC0+XHJcbiAgICByZXR1cm4gQG9wdGlvbk1lbnVzLnNwZWVkc1tAb3B0aW9ucy5zcGVlZEluZGV4XS5zcGVlZFxyXG5cclxuICBuZXdHYW1lOiAobW9uZXkpIC0+XHJcbiAgICBAdGhpcnRlZW4ubmV3R2FtZShtb25leSlcclxuICAgIEBwcmVwYXJlR2FtZSgpXHJcblxyXG4gIHByZXBhcmVHYW1lOiAtPlxyXG4gICAgQGhhbmQgPSBuZXcgSGFuZCB0aGlzXHJcbiAgICBAcGlsZSA9IG5ldyBQaWxlIHRoaXMsIEBoYW5kXHJcbiAgICBAaGFuZC5zZXQgQHRoaXJ0ZWVuLnBsYXllcnNbMF0uaGFuZFxyXG4gICAgQGxhc3RFcnIgPSAnJ1xyXG5cclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgIyBpbnB1dCBoYW5kbGluZ1xyXG5cclxuICB0b3VjaERvd246ICh4LCB5KSAtPlxyXG4gICAgIyBAbG9nKFwidG91Y2hEb3duICN7eH0sI3t5fVwiKVxyXG4gICAgQGNoZWNrWm9uZXMoeCwgeSlcclxuXHJcbiAgdG91Y2hNb3ZlOiAoeCwgeSkgLT5cclxuICAgICMgQGxvZyhcInRvdWNoTW92ZSAje3h9LCN7eX1cIilcclxuICAgIGlmIEB0aGlydGVlbiAhPSBudWxsXHJcbiAgICAgIEBoYW5kLm1vdmUoeCwgeSlcclxuXHJcbiAgdG91Y2hVcDogKHgsIHkpIC0+XHJcbiAgICAjIEBsb2coXCJ0b3VjaFVwICN7eH0sI3t5fVwiKVxyXG4gICAgaWYgQHRoaXJ0ZWVuICE9IG51bGxcclxuICAgICAgQGhhbmQudXAoeCwgeSlcclxuXHJcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICMgaGVhZGxpbmUgKGdhbWUgc3RhdGUgaW4gdG9wIGxlZnQpXHJcblxyXG4gIHByZXR0eUVycm9yVGFibGU6IHtcclxuICAgICAgZ2FtZU92ZXI6ICAgICAgICAgICBcIlRoZSBnYW1lIGlzIG92ZXIuXCJcclxuICAgICAgaW52YWxpZFBsYXk6ICAgICAgICBcIk5vdCBhIHZhbGlkIHBsYXkuXCJcclxuICAgICAgbXVzdEJyZWFrT3JQYXNzOiAgICBcIllvdSBwYXNzZWQgYWxyZWFkeSwgc28gMi1icmVha2VyIG9yIHBhc3MuXCJcclxuICAgICAgbXVzdFBhc3M6ICAgICAgICAgICBcIllvdSBtdXN0IHBhc3MuXCJcclxuICAgICAgbXVzdFRocm93M1M6ICAgICAgICBcIllvdSBtdXN0IHVzZSB0aGUgM1xceGM4IGluIHlvdXIgcGxheS5cIlxyXG4gICAgICBub3RZb3VyVHVybjogICAgICAgIFwiSXQgaXMgbm90IHlvdXIgdHVybi5cIlxyXG4gICAgICB0aHJvd0FueXRoaW5nOiAgICAgIFwiWW91IGhhdmUgY29udHJvbCwgdGhyb3cgYW55dGhpbmcuXCJcclxuICAgICAgdG9vTG93UGxheTogICAgICAgICBcIlRoaXMgcGxheSBpcyBub3Qgc3Ryb25nZXIgdGhhbiB0aGUgY3VycmVudCBwbGF5LlwiXHJcbiAgICAgIHdyb25nUGxheTogICAgICAgICAgXCJUaGlzIHBsYXkgZG9lcyBub3QgbWF0Y2ggdGhlIGN1cnJlbnQgcGxheS5cIlxyXG4gIH1cclxuXHJcbiAgcHJldHR5RXJyb3I6IC0+XHJcbiAgICBwcmV0dHkgPSBAcHJldHR5RXJyb3JUYWJsZVtAbGFzdEVycl1cclxuICAgIHJldHVybiBwcmV0dHkgaWYgcHJldHR5XHJcbiAgICByZXR1cm4gQGxhc3RFcnJcclxuXHJcbiAgY2FsY0hlYWRsaW5lOiAtPlxyXG4gICAgcmV0dXJuIFwiXCIgaWYgQHRoaXJ0ZWVuID09IG51bGxcclxuXHJcbiAgICBoZWFkbGluZSA9IEB0aGlydGVlbi5oZWFkbGluZSgpXHJcbiAgICAjIHN3aXRjaCBAdGhpcnRlZW4uc3RhdGVcclxuICAgICMgICB3aGVuIFN0YXRlLkJJRFxyXG4gICAgIyAgICAgaGVhZGxpbmUgPSBcIldhaXRpbmcgZm9yIGBmZjc3MDBgI3tAdGhpcnRlZW4ucGxheWVyc1tAdGhpcnRlZW4udHVybl0ubmFtZX1gYCB0byBgZmZmZjAwYGJpZGBgXCJcclxuICAgICMgICB3aGVuIFN0YXRlLlRSSUNLXHJcbiAgICAjICAgICBoZWFkbGluZSA9IFwiV2FpdGluZyBmb3IgYGZmNzcwMGAje0B0aGlydGVlbi5wbGF5ZXJzW0B0aGlydGVlbi50dXJuXS5uYW1lfWBgIHRvIGBmZmZmMDBgcGxheWBgXCJcclxuICAgICMgICB3aGVuIFN0YXRlLlJPVU5EU1VNTUFSWVxyXG4gICAgIyAgICAgaGVhZGxpbmUgPSBcIldhaXRpbmcgZm9yIG5leHQgcm91bmQuLi5cIlxyXG4gICAgIyAgIHdoZW4gU3RhdGUuUE9TVEdBTUVTVU1NQVJZXHJcbiAgICAjICAgICBoZWFkbGluZSA9IFwiR2FtZSBvdmVyIVwiXHJcblxyXG4gICAgZXJyVGV4dCA9IFwiXCJcclxuICAgIGlmIChAbGFzdEVyci5sZW5ndGggPiAwKSBhbmQgKEBsYXN0RXJyICE9IE9LKVxyXG4gICAgICBlcnJUZXh0ID0gXCIgIGBmZmZmZmZgRVJST1I6IGBmZjAwMDBgI3tAcHJldHR5RXJyb3IoKX1cIlxyXG4gICAgICBoZWFkbGluZSArPSBlcnJUZXh0XHJcblxyXG4gICAgcmV0dXJuIGhlYWRsaW5lXHJcblxyXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAjIGdhbWUgb3ZlciBpbmZvcm1hdGlvblxyXG5cclxuICBnYW1lT3ZlclRleHQ6IC0+XHJcbiAgICB3aW5uZXIgPSBAdGhpcnRlZW4ud2lubmVyKClcclxuICAgIGlmIHdpbm5lci5uYW1lID09IFwiUGxheWVyXCJcclxuICAgICAgaWYgQHRoaXJ0ZWVuLmxhc3RTdHJlYWsgPT0gMVxyXG4gICAgICAgIHJldHVybiBbXCJZb3Ugd2luIVwiLCBcIkEgbmV3IHN0cmVhayFcIl1cclxuICAgICAgcmV0dXJuIFtcIllvdSB3aW4hXCIsIFwiI3tAdGhpcnRlZW4ubGFzdFN0cmVha30gaW4gYSByb3chXCJdXHJcbiAgICBpZiBAdGhpcnRlZW4ubGFzdFN0cmVhayA9PSAwXHJcbiAgICAgIHJldHVybiBbXCIje3dpbm5lci5uYW1lfSB3aW5zIVwiLCBcIlRyeSBhZ2Fpbi4uLlwiXVxyXG4gICAgcmV0dXJuIFtcIiN7d2lubmVyLm5hbWV9IHdpbnMhXCIsIFwiU3RyZWFrIGVuZGVkOiAje0B0aGlydGVlbi5sYXN0U3RyZWFrfSB3aW5zXCJdXHJcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICMgY2FyZCBoYW5kbGluZ1xyXG5cclxuICBwYXNzOiAtPlxyXG4gICAgQGxhc3RFcnIgPSBAdGhpcnRlZW4ucGFzcyB7XHJcbiAgICAgIGlkOiAxXHJcbiAgICB9XHJcblxyXG4gIHBsYXk6IChjYXJkcykgLT5cclxuICAgIGNvbnNvbGUubG9nIFwiKGdhbWUpIHBsYXlpbmcgY2FyZHNcIiwgY2FyZHNcclxuXHJcbiAgICBAdGhpcnRlZW4udXBkYXRlUGxheWVySGFuZChAaGFuZC5jYXJkcylcclxuXHJcbiAgICByYXdDYXJkcyA9IFtdXHJcbiAgICBmb3IgY2FyZCBpbiBjYXJkc1xyXG4gICAgICByYXdDYXJkcy5wdXNoIGNhcmQuY2FyZFxyXG5cclxuICAgIHJldCA9IEB0aGlydGVlbi5wbGF5IHtcclxuICAgICAgaWQ6IDFcclxuICAgICAgY2FyZHM6IHJhd0NhcmRzXHJcbiAgICB9XHJcbiAgICBAbGFzdEVyciA9IHJldFxyXG4gICAgaWYgcmV0ID09IE9LXHJcbiAgICAgIEBoYW5kLnNldCBAdGhpcnRlZW4ucGxheWVyc1swXS5oYW5kXHJcbiAgICAgIEBwaWxlLmhpbnQgY2FyZHNcclxuXHJcbiAgcGxheVBpY2tlZDogLT5cclxuICAgIGlmIG5vdCBAaGFuZC5waWNraW5nXHJcbiAgICAgIHJldHVyblxyXG4gICAgY2FyZHMgPSBAaGFuZC5zZWxlY3RlZENhcmRzKClcclxuICAgICMgQGhhbmQuc2VsZWN0Tm9uZSgpXHJcbiAgICBpZiBjYXJkcy5sZW5ndGggPT0gMFxyXG4gICAgICByZXR1cm4gQHBhc3MoKVxyXG4gICAgIyBAaGFuZC50b2dnbGVQaWNraW5nKClcclxuICAgIHJldHVybiBAcGxheShjYXJkcylcclxuXHJcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICMgbWFpbiBsb29wXHJcblxyXG4gIHVwZGF0ZTogKGR0KSAtPlxyXG4gICAgQHpvbmVzLmxlbmd0aCA9IDAgIyBmb3JnZXQgYWJvdXQgem9uZXMgZnJvbSB0aGUgbGFzdCBmcmFtZS4gd2UncmUgYWJvdXQgdG8gbWFrZSBzb21lIG5ldyBvbmVzIVxyXG5cclxuICAgIHVwZGF0ZWQgPSBmYWxzZVxyXG4gICAgaWYgQHVwZGF0ZUdhbWUoZHQpXHJcbiAgICAgIHVwZGF0ZWQgPSB0cnVlXHJcblxyXG4gICAgcmV0dXJuIHVwZGF0ZWRcclxuXHJcbiAgdXBkYXRlR2FtZTogKGR0KSAtPlxyXG4gICAgcmV0dXJuIGZhbHNlIGlmIEB0aGlydGVlbiA9PSBudWxsXHJcblxyXG4gICAgdXBkYXRlZCA9IGZhbHNlXHJcblxyXG4gICAgaWYgQHBpbGUudXBkYXRlKGR0KVxyXG4gICAgICB1cGRhdGVkID0gdHJ1ZVxyXG4gICAgaWYgQHBpbGUucmVhZHlGb3JOZXh0VHJpY2soKVxyXG4gICAgICBAbmV4dEFJVGljayAtPSBkdFxyXG4gICAgICBpZiBAbmV4dEFJVGljayA8PSAwXHJcbiAgICAgICAgQG5leHRBSVRpY2sgPSBAYWlUaWNrUmF0ZSgpXHJcbiAgICAgICAgaWYgQHRoaXJ0ZWVuLmFpVGljaygpXHJcbiAgICAgICAgICB1cGRhdGVkID0gdHJ1ZVxyXG4gICAgaWYgQGhhbmQudXBkYXRlKGR0KVxyXG4gICAgICB1cGRhdGVkID0gdHJ1ZVxyXG5cclxuICAgIEBwaWxlLnNldCBAdGhpcnRlZW4udGhyb3dJRCwgQHRoaXJ0ZWVuLnBpbGUsIEB0aGlydGVlbi5waWxlV2hvXHJcblxyXG4gICAgaWYgQHBhdXNlTWVudS51cGRhdGUoZHQpXHJcbiAgICAgIHVwZGF0ZWQgPSB0cnVlXHJcblxyXG4gICAgaWYgQGFjaGlldmVtZW50RmFuZmFyZSAhPSBudWxsXHJcbiAgICAgIEBhY2hpZXZlbWVudEZhbmZhcmUudGltZSArPSBkdFxyXG4gICAgICBpZiBAYWNoaWV2ZW1lbnRGYW5mYXJlLnRpbWUgPiA1MDAwXHJcbiAgICAgICAgQGFjaGlldmVtZW50RmFuZmFyZSA9IG51bGxcclxuICAgICAgdXBkYXRlZCA9IHRydWVcclxuXHJcbiAgICBpZiBAYWNoaWV2ZW1lbnRGYW5mYXJlID09IG51bGxcclxuICAgICAgaWYgQHRoaXJ0ZWVuLmZhbmZhcmVzLmxlbmd0aCA+IDBcclxuICAgICAgICBAYWNoaWV2ZW1lbnRGYW5mYXJlID1cclxuICAgICAgICAgIHRpdGxlOiBAdGhpcnRlZW4uZmFuZmFyZXMuc2hpZnQoKVxyXG4gICAgICAgICAgdGltZTogMFxyXG5cclxuICAgIHJldHVybiB1cGRhdGVkXHJcblxyXG4gIHJlbmRlcjogLT5cclxuICAgICMgUmVzZXQgcmVuZGVyIGNvbW1hbmRzXHJcbiAgICBAcmVuZGVyQ29tbWFuZHMubGVuZ3RoID0gMFxyXG5cclxuICAgIGlmIEByZW5kZXJNb2RlID09IDFcclxuICAgICAgQHJlbmRlckhvd3RvKClcclxuICAgIGVsc2UgaWYgQHJlbmRlck1vZGUgPT0gMlxyXG4gICAgICBAcmVuZGVyQWNoaWV2ZW1lbnRzKClcclxuICAgIGVsc2VcclxuICAgICAgQHJlbmRlckdhbWUoKVxyXG5cclxuICAgIHJldHVybiBAcmVuZGVyQ29tbWFuZHNcclxuXHJcbiAgcmVuZGVySG93dG86IC0+XHJcbiAgICBob3d0b1RleHR1cmUgPSBcImhvd3RvMVwiXHJcbiAgICBAbG9nIFwicmVuZGVyaW5nICN7aG93dG9UZXh0dXJlfVwiXHJcbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwic29saWRcIiwgMCwgMCwgQHdpZHRoLCBAaGVpZ2h0LCAwLCAwLCAwLCBAY29sb3JzLmJsYWNrXHJcbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIGhvd3RvVGV4dHVyZSwgMCwgMCwgQHdpZHRoLCBAYWFIZWlnaHQsIDAsIDAsIDAsIEBjb2xvcnMud2hpdGUsID0+XHJcbiAgICAgIEByZW5kZXJNb2RlID0gMFxyXG5cclxuICBkZWJ1ZzogLT5cclxuICAgIGNvbnNvbGUubG9nIFwiZGVidWcgYWNoXCJcclxuICAgIGNvbnNvbGUubG9nIEB0aGlydGVlbi5hY2hcclxuICAgICMgQHRoaXJ0ZWVuLmFjaC5lYXJuZWQgPSB7fVxyXG4gICAgIyBAdGhpcnRlZW4uYWNoLmVhcm5lZC52ZXRlcmFuID0gdHJ1ZVxyXG4gICAgIyBAdGhpcnRlZW4uYWNoLmVhcm5lZC50cnloYXJkID0gdHJ1ZVxyXG4gICAgIyBAdGhpcnRlZW4uYWNoLmVhcm5lZC5icmVha2VyID0gdHJ1ZVxyXG4gICAgIyBAdGhpcnRlZW4uYWNoLmVhcm5lZC5rZWVwaXRsb3cgPSB0cnVlXHJcbiAgICAjIEB0aGlydGVlbi5hY2guZWFybmVkLnN1aXRlZCA9IHRydWVcclxuICAgICMgQHRoaXJ0ZWVuLmFjaC5lYXJuZWQudG9ueSA9IHRydWVcclxuICAgICMgQHRoaXJ0ZWVuLmFjaC5lYXJuZWQuc2FtcGxlciA9IHRydWVcclxuICAgICMgQHRoaXJ0ZWVuLmFjaC5lYXJuZWQudHJhZ2VkeSA9IHRydWVcclxuICAgICMgQHRoaXJ0ZWVuLmFjaC5lYXJuZWQuaW5kb21pdGFibGUgPSB0cnVlXHJcbiAgICAjIEB0aGlydGVlbi5hY2guZWFybmVkLnJla3QgPSB0cnVlXHJcbiAgICAjIEB0aGlydGVlbi5hY2guZWFybmVkLmxhdGUgPSB0cnVlXHJcbiAgICAjIEB0aGlydGVlbi5hY2guZWFybmVkLnBhaXJzID0gdHJ1ZVxyXG5cclxuICAgICMgQHRoaXJ0ZWVuLmFjaC5zdGF0ZS50b3RhbEdhbWVzID0gMFxyXG4gICAgIyBAdGhpcnRlZW4uc3RyZWFrID0gMFxyXG5cclxuICByZW5kZXJBY2hpZXZlbWVudHM6IC0+XHJcbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwic29saWRcIiwgMCwgMCwgQHdpZHRoLCBAaGVpZ2h0LCAwLCAwLCAwLCBAY29sb3JzLmFjaF9iZywgPT5cclxuICAgICAgQHJlbmRlck1vZGUgPSAwXHJcblxyXG4gICAgdGl0bGVIZWlnaHQgPSBAaGVpZ2h0IC8gMjBcclxuICAgIHRpdGxlT2Zmc2V0ID0gdGl0bGVIZWlnaHQgLyAyXHJcbiAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgdGl0bGVIZWlnaHQsIFwiQWNoaWV2ZW1lbnRzXCIsIEBjZW50ZXIueCwgdGl0bGVPZmZzZXQsIDAuNSwgMC41LCBAY29sb3JzLmFjaF9oZWFkZXJcclxuXHJcbiAgICBpbWFnZU1hcmdpbiA9IEB3aWR0aCAvIDE1XHJcbiAgICB0b3BIZWlnaHQgPSB0aXRsZUhlaWdodFxyXG4gICAgeCA9IEB3aWR0aCAvIDEyMFxyXG4gICAgeSA9IHRvcEhlaWdodFxyXG4gICAgdGl0bGVIZWlnaHQgPSBAaGVpZ2h0IC8gMjJcclxuICAgIGRlc2NIZWlnaHQgPSBAaGVpZ2h0IC8gMzBcclxuICAgIGltYWdlRGltID0gdGl0bGVIZWlnaHQgKiAyXHJcbiAgICBmb3IgYWNoLCBhY2hJbmRleCBpbiBhY2hpZXZlbWVudHNMaXN0XHJcbiAgICAgIGljb24gPSBcInN0YXJfb2ZmXCJcclxuICAgICAgaWYgQHRoaXJ0ZWVuLmFjaC5lYXJuZWRbYWNoLmlkXVxyXG4gICAgICAgIGljb24gPSBcInN0YXJfb25cIlxyXG4gICAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIGljb24sIHgsIHksIGltYWdlRGltLCBpbWFnZURpbSwgMCwgMCwgMCwgQGNvbG9ycy53aGl0ZVxyXG4gICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgdGl0bGVIZWlnaHQsIGFjaC50aXRsZSwgeCArIGltYWdlTWFyZ2luLCB5LCAwLCAwLCBAY29sb3JzLmFjaF90aXRsZVxyXG4gICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgZGVzY0hlaWdodCwgYWNoLmRlc2NyaXB0aW9uWzBdLCB4ICsgaW1hZ2VNYXJnaW4sIHkgKyB0aXRsZUhlaWdodCwgMCwgMCwgQGNvbG9ycy5hY2hfZGVzY1xyXG4gICAgICBpZiBhY2gucHJvZ3Jlc3M/XHJcbiAgICAgICAgcHJvZ3Jlc3MgPSBhY2gucHJvZ3Jlc3MoQHRoaXJ0ZWVuLmFjaClcclxuICAgICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgZGVzY0hlaWdodCwgcHJvZ3Jlc3MsIHggKyBpbWFnZU1hcmdpbiwgeSArIHRpdGxlSGVpZ2h0ICsgZGVzY0hlaWdodCwgMCwgMCwgQGNvbG9ycy5hY2hfZGVzY1xyXG4gICAgICBlbHNlXHJcbiAgICAgICAgaWYgYWNoLmRlc2NyaXB0aW9uLmxlbmd0aCA+IDFcclxuICAgICAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCBkZXNjSGVpZ2h0LCBhY2guZGVzY3JpcHRpb25bMV0sIHggKyBpbWFnZU1hcmdpbiwgeSArIHRpdGxlSGVpZ2h0ICsgZGVzY0hlaWdodCwgMCwgMCwgQGNvbG9ycy5hY2hfZGVzY1xyXG4gICAgICBpZiBhY2hJbmRleCA9PSA2XHJcbiAgICAgICAgeSA9IHRvcEhlaWdodFxyXG4gICAgICAgIHggKz0gQHdpZHRoIC8gMlxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgeSArPSB0aXRsZUhlaWdodCAqIDNcclxuXHJcbiAgcmVuZGVyR2FtZTogLT5cclxuXHJcbiAgICAjIGJhY2tncm91bmRcclxuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJzb2xpZFwiLCAwLCAwLCBAd2lkdGgsIEBoZWlnaHQsIDAsIDAsIDAsIEBjb2xvcnMuYmFja2dyb3VuZFxyXG5cclxuICAgIHRleHRIZWlnaHQgPSBAYWFIZWlnaHQgLyAyNVxyXG4gICAgdGV4dFBhZGRpbmcgPSB0ZXh0SGVpZ2h0IC8gNVxyXG4gICAgY2hhcmFjdGVySGVpZ2h0ID0gQGFhSGVpZ2h0IC8gNVxyXG4gICAgY291bnRIZWlnaHQgPSB0ZXh0SGVpZ2h0XHJcblxyXG4gICAgZHJhd0dhbWVPdmVyID0gQHRoaXJ0ZWVuLmdhbWVPdmVyKCkgYW5kIEBwaWxlLnJlc3RpbmcoKVxyXG5cclxuICAgICMgTG9nXHJcbiAgICBmb3IgbGluZSwgaSBpbiBAdGhpcnRlZW4ubG9nXHJcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCB0ZXh0SGVpZ2h0LCBsaW5lLCAwLCAoaSsxLjUpICogKHRleHRIZWlnaHQgKyB0ZXh0UGFkZGluZyksIDAsIDAsIEBjb2xvcnMubG9nY29sb3JcclxuXHJcbiAgICBhaVBsYXllcnMgPSBbXHJcbiAgICAgIEB0aGlydGVlbi5wbGF5ZXJzWzFdXHJcbiAgICAgIEB0aGlydGVlbi5wbGF5ZXJzWzJdXHJcbiAgICAgIEB0aGlydGVlbi5wbGF5ZXJzWzNdXHJcbiAgICBdXHJcblxyXG4gICAgY2hhcmFjdGVyTWFyZ2luID0gY2hhcmFjdGVySGVpZ2h0IC8gMlxyXG4gICAgQGNoYXJDZWlsaW5nID0gQGhlaWdodCAqIDAuNlxyXG5cclxuICAgICMgbGVmdCBzaWRlXHJcbiAgICBpZiBhaVBsYXllcnNbMF0gIT0gbnVsbFxyXG4gICAgICBjaGFyYWN0ZXIgPSBhaUNoYXJhY3RlcnNbYWlQbGF5ZXJzWzBdLmNoYXJJRF1cclxuICAgICAgY2hhcmFjdGVyV2lkdGggPSBAc3ByaXRlUmVuZGVyZXIuY2FsY1dpZHRoKGNoYXJhY3Rlci5zcHJpdGUsIGNoYXJhY3RlckhlaWdodClcclxuICAgICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBjaGFyYWN0ZXIuc3ByaXRlLCBjaGFyYWN0ZXJNYXJnaW4sIEBjaGFyQ2VpbGluZywgMCwgY2hhcmFjdGVySGVpZ2h0LCAwLCAwLCAxLCBAY29sb3JzLndoaXRlLCA9PlxyXG4gICAgICAgICMgQGRlYnVnKClcclxuICAgICAgQHJlbmRlckNvdW50IGFpUGxheWVyc1swXSwgQHRoaXJ0ZWVuLm1vbmV5LCBkcmF3R2FtZU92ZXIsIGFpUGxheWVyc1swXS5pbmRleCA9PSBAdGhpcnRlZW4udHVybiwgY291bnRIZWlnaHQsIGNoYXJhY3Rlck1hcmdpbiArIChjaGFyYWN0ZXJXaWR0aCAvIDIpLCBAY2hhckNlaWxpbmcgLSB0ZXh0UGFkZGluZywgMC41LCAwXHJcblxyXG4gICAgIyB0b3Agc2lkZVxyXG4gICAgaWYgYWlQbGF5ZXJzWzFdICE9IG51bGxcclxuICAgICAgY2hhcmFjdGVyID0gYWlDaGFyYWN0ZXJzW2FpUGxheWVyc1sxXS5jaGFySURdXHJcbiAgICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgY2hhcmFjdGVyLnNwcml0ZSwgQGNlbnRlci54LCAwLCAwLCBjaGFyYWN0ZXJIZWlnaHQsIDAsIDAuNSwgMCwgQGNvbG9ycy53aGl0ZVxyXG4gICAgICBAcmVuZGVyQ291bnQgYWlQbGF5ZXJzWzFdLCBAdGhpcnRlZW4ubW9uZXksIGRyYXdHYW1lT3ZlciwgYWlQbGF5ZXJzWzFdLmluZGV4ID09IEB0aGlydGVlbi50dXJuLCBjb3VudEhlaWdodCwgQGNlbnRlci54LCBjaGFyYWN0ZXJIZWlnaHQsIDAuNSwgMFxyXG5cclxuICAgICMgcmlnaHQgc2lkZVxyXG4gICAgaWYgYWlQbGF5ZXJzWzJdICE9IG51bGxcclxuICAgICAgY2hhcmFjdGVyID0gYWlDaGFyYWN0ZXJzW2FpUGxheWVyc1syXS5jaGFySURdXHJcbiAgICAgIGNoYXJhY3RlcldpZHRoID0gQHNwcml0ZVJlbmRlcmVyLmNhbGNXaWR0aChjaGFyYWN0ZXIuc3ByaXRlLCBjaGFyYWN0ZXJIZWlnaHQpXHJcbiAgICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgY2hhcmFjdGVyLnNwcml0ZSwgQHdpZHRoIC0gY2hhcmFjdGVyTWFyZ2luLCBAY2hhckNlaWxpbmcsIDAsIGNoYXJhY3RlckhlaWdodCwgMCwgMSwgMSwgQGNvbG9ycy53aGl0ZVxyXG4gICAgICBAcmVuZGVyQ291bnQgYWlQbGF5ZXJzWzJdLCBAdGhpcnRlZW4ubW9uZXksIGRyYXdHYW1lT3ZlciwgYWlQbGF5ZXJzWzJdLmluZGV4ID09IEB0aGlydGVlbi50dXJuLCBjb3VudEhlaWdodCwgQHdpZHRoIC0gKGNoYXJhY3Rlck1hcmdpbiArIChjaGFyYWN0ZXJXaWR0aCAvIDIpKSwgQGNoYXJDZWlsaW5nIC0gdGV4dFBhZGRpbmcsIDAuNSwgMFxyXG5cclxuICAgICMgY2FyZCBhcmVhXHJcbiAgICBoYW5kQXJlYUhlaWdodCA9IDAuMjcgKiBAaGVpZ2h0XHJcbiAgICBjYXJkQXJlYVRleHQgPSBudWxsXHJcbiAgICBpZiBAaGFuZC5waWNraW5nXHJcbiAgICAgIGhhbmRhcmVhQ29sb3IgPSBAY29sb3JzLmhhbmRfcGlja1xyXG4gICAgICBpZiAoQHRoaXJ0ZWVuLnR1cm4gPT0gMCkgYW5kIChAdGhpcnRlZW4uZXZlcnlvbmVQYXNzZWQoKSBvciAoQHRoaXJ0ZWVuLmN1cnJlbnRQbGF5ID09IG51bGwpKVxyXG4gICAgICAgIGhhbmRhcmVhQ29sb3IgPSBAY29sb3JzLmhhbmRfYW55XHJcbiAgICAgICAgaWYgQHRoaXJ0ZWVuLnBpbGUubGVuZ3RoID09IDBcclxuICAgICAgICAgIGNhcmRBcmVhVGV4dCA9ICdBbnl0aGluZyAoM1xceGM4KSdcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBjYXJkQXJlYVRleHQgPSAnQW55dGhpbmcnXHJcbiAgICBlbHNlXHJcbiAgICAgIGNhcmRBcmVhVGV4dCA9ICdVbmxvY2tlZCdcclxuICAgICAgaGFuZGFyZWFDb2xvciA9IEBjb2xvcnMuaGFuZF9yZW9yZ1xyXG4gICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcInNvbGlkXCIsIDAsIEBoZWlnaHQsIEB3aWR0aCwgaGFuZEFyZWFIZWlnaHQsIDAsIDAsIDEsIGhhbmRhcmVhQ29sb3IsID0+XHJcbiAgICAgIEBoYW5kLnRvZ2dsZVBpY2tpbmcoKVxyXG5cclxuICAgICMgcGlsZVxyXG4gICAgcGlsZURpbWVuc2lvbiA9IEBoZWlnaHQgKiAwLjRcclxuICAgIHBpbGVTcHJpdGUgPSBcInBpbGVcIlxyXG4gICAgaWYgKEB0aGlydGVlbi50dXJuID49IDApIGFuZCAoQHRoaXJ0ZWVuLnR1cm4gPD0gMylcclxuICAgICAgcGlsZVNwcml0ZSArPSBAdGhpcnRlZW4udHVyblxyXG4gICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBwaWxlU3ByaXRlLCBAd2lkdGggLyAyLCBAaGVpZ2h0IC8gMiwgcGlsZURpbWVuc2lvbiwgcGlsZURpbWVuc2lvbiwgMCwgMC41LCAwLjUsIEBjb2xvcnMud2hpdGUsID0+XHJcbiAgICAgIEBwbGF5UGlja2VkKClcclxuICAgIEBwaWxlLnJlbmRlcigpXHJcblxyXG4gICAgQGhhbmQucmVuZGVyKClcclxuXHJcbiAgICBpZiBkcmF3R2FtZU92ZXJcclxuICAgICAgIyBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwic29saWRcIiwgMCwgMCwgQHdpZHRoLCBAaGVpZ2h0IC0gaGFuZEFyZWFIZWlnaHQsIDAsIDAsIDAsIEBjb2xvcnMucGxheV9hZ2FpblxyXG5cclxuICAgICAgbGluZXMgPSBAZ2FtZU92ZXJUZXh0KClcclxuICAgICAgZ2FtZU92ZXJTaXplID0gQGFhSGVpZ2h0IC8gOFxyXG4gICAgICBnYW1lT3ZlclkgPSBAY2VudGVyLnlcclxuICAgICAgaWYgbGluZXMubGVuZ3RoID4gMVxyXG4gICAgICAgIGdhbWVPdmVyWSAtPSAoZ2FtZU92ZXJTaXplID4+IDEpXHJcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCBnYW1lT3ZlclNpemUsIGxpbmVzWzBdLCBAY2VudGVyLngsIGdhbWVPdmVyWSwgMC41LCAwLjUsIEBjb2xvcnMuZ2FtZV9vdmVyXHJcbiAgICAgIGlmIGxpbmVzLmxlbmd0aCA+IDFcclxuICAgICAgICBnYW1lT3ZlclkgKz0gZ2FtZU92ZXJTaXplXHJcbiAgICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIGdhbWVPdmVyU2l6ZSwgbGluZXNbMV0sIEBjZW50ZXIueCwgZ2FtZU92ZXJZLCAwLjUsIDAuNSwgQGNvbG9ycy5nYW1lX292ZXJcclxuXHJcbiAgICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJzb2xpZFwiLCAwLCBAaGVpZ2h0LCBAd2lkdGgsIGhhbmRBcmVhSGVpZ2h0LCAwLCAwLCAxLCBAY29sb3JzLnBsYXlfYWdhaW4sID0+XHJcbiAgICAgICAgQHRoaXJ0ZWVuLmRlYWwoKVxyXG4gICAgICAgIEBwcmVwYXJlR2FtZSgpXHJcblxyXG4gICAgICByZXN0YXJ0UXVpdFNpemUgPSBAYWFIZWlnaHQgLyAxMlxyXG4gICAgICBzaGFkb3dEaXN0YW5jZSA9IHJlc3RhcnRRdWl0U2l6ZSAvIDhcclxuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIHJlc3RhcnRRdWl0U2l6ZSwgXCJQbGF5IEFnYWluXCIsIHNoYWRvd0Rpc3RhbmNlICsgQGNlbnRlci54LCBzaGFkb3dEaXN0YW5jZSArIChAaGVpZ2h0IC0gKGhhbmRBcmVhSGVpZ2h0ICogMC41KSksIDAuNSwgMSwgQGNvbG9ycy5ibGFja1xyXG4gICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgcmVzdGFydFF1aXRTaXplLCBcIlBsYXkgQWdhaW5cIiwgQGNlbnRlci54LCBAaGVpZ2h0IC0gKGhhbmRBcmVhSGVpZ2h0ICogMC41KSwgMC41LCAxLCBAY29sb3JzLmdvbGRcclxuXHJcbiAgICBAcmVuZGVyQ291bnQgQHRoaXJ0ZWVuLnBsYXllcnNbMF0sIEB0aGlydGVlbi5tb25leSwgZHJhd0dhbWVPdmVyLCAwID09IEB0aGlydGVlbi50dXJuLCBjb3VudEhlaWdodCwgQGNlbnRlci54LCBAaGVpZ2h0LCAwLjUsIDFcclxuXHJcbiAgICAjIEhlYWRsaW5lIChpbmNsdWRlcyBlcnJvcilcclxuICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCB0ZXh0SGVpZ2h0LCBAY2FsY0hlYWRsaW5lKCksIDAsIDAsIDAsIDAsIEBjb2xvcnMubGlnaHRncmF5XHJcblxyXG4gICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcInBhdXNlXCIsIEB3aWR0aCwgMCwgMCwgQHBhdXNlQnV0dG9uU2l6ZSwgMCwgMSwgMCwgQGNvbG9ycy53aGl0ZSwgPT5cclxuICAgICAgQHBhdXNlZCA9IHRydWVcclxuXHJcbiAgICBpZiBjYXJkQXJlYVRleHQgIT0gbnVsbFxyXG4gICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgdGV4dEhlaWdodCwgY2FyZEFyZWFUZXh0LCAwLjAyICogQHdpZHRoLCBAaGVpZ2h0IC0gaGFuZEFyZWFIZWlnaHQsIDAsIDAsIEBjb2xvcnMud2hpdGVcclxuXHJcbiAgICBpZiBAYWNoaWV2ZW1lbnRGYW5mYXJlICE9IG51bGxcclxuICAgICAgaWYgQGFjaGlldmVtZW50RmFuZmFyZS50aW1lIDwgMTAwMFxyXG4gICAgICAgIG9wYWNpdHkgPSBAYWNoaWV2ZW1lbnRGYW5mYXJlLnRpbWUgLyAxMDAwXHJcbiAgICAgIGVsc2UgaWYgQGFjaGlldmVtZW50RmFuZmFyZS50aW1lID4gNDAwMFxyXG4gICAgICAgIG9wYWNpdHkgPSAxIC0gKChAYWNoaWV2ZW1lbnRGYW5mYXJlLnRpbWUgLSA0MDAwKSAvIDEwMDApXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBvcGFjaXR5ID0gMVxyXG4gICAgICBjb2xvciA9IHtyOjEsIGc6MSwgYjoxLCBhOm9wYWNpdHl9XHJcbiAgICAgIHggPSBAd2lkdGggKiAwLjZcclxuICAgICAgeSA9IDBcclxuICAgICAgeFRleHQgPSB4ICsgKEB3aWR0aCAqIDAuMDYpXHJcbiAgICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJhdVwiLCB4LCB5LCAwLCBAaGVpZ2h0IC8gMTAsIDAsIDAsIDAsIGNvbG9yLCA9PlxyXG4gICAgICAgIEBhY2hpZXZlbWVudEZhbmZhcmUgPSBudWxsXHJcbiAgICAgICAgQHJlbmRlck1vZGUgPSAyXHJcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCB0ZXh0SGVpZ2h0LCBcIkFjaGlldmVtZW50IEVhcm5lZFwiLCB4VGV4dCwgeSwgMCwgMCwgY29sb3JcclxuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIHRleHRIZWlnaHQsIEBhY2hpZXZlbWVudEZhbmZhcmUudGl0bGUsIHhUZXh0LCB5ICsgdGV4dEhlaWdodCwgMCwgMCwgY29sb3JcclxuXHJcbiAgICBpZiBAcGF1c2VkXHJcbiAgICAgIEBwYXVzZU1lbnUucmVuZGVyKClcclxuXHJcbiAgICByZXR1cm5cclxuXHJcbiAgcmVuZGVyQ291bnQ6IChwbGF5ZXIsIG1vbmV5LCBkcmF3R2FtZU92ZXIsIG15VHVybiwgY291bnRIZWlnaHQsIHgsIHksIGFuY2hvcngsIGFuY2hvcnkpIC0+XHJcbiAgICBpZiBteVR1cm5cclxuICAgICAgbmFtZUNvbG9yID0gXCJgZmY3NzAwYFwiXHJcbiAgICBlbHNlXHJcbiAgICAgIG5hbWVDb2xvciA9IFwiXCJcclxuICAgIG5hbWVTdHJpbmcgPSBcIiAje25hbWVDb2xvcn0je3BsYXllci5uYW1lfWBgXCJcclxuICAgIGlmIG1vbmV5XHJcbiAgICAgIHBsYXllci5tb25leSA/PSAwXHJcbiAgICAgIG5hbWVTdHJpbmcgKz0gXCI6ICQgYGFhZmZhYWAje3BsYXllci5tb25leX1cIlxyXG4gICAgbmFtZVN0cmluZyArPSBcIiBcIlxyXG4gICAgY2FyZENvdW50ID0gcGxheWVyLmhhbmQubGVuZ3RoXHJcbiAgICBpZiBkcmF3R2FtZU92ZXIgb3IgKGNhcmRDb3VudCA9PSAwKVxyXG4gICAgICBpZiBtb25leVxyXG4gICAgICAgIHBsYWNlU3RyaW5nID0gXCI0dGhcIlxyXG4gICAgICAgIGlmIHBsYXllci5wbGFjZSA9PSAxXHJcbiAgICAgICAgICBwbGFjZVN0cmluZyA9IFwiMXN0XCJcclxuICAgICAgICBlbHNlIGlmIHBsYXllci5wbGFjZSA9PSAyXHJcbiAgICAgICAgICBwbGFjZVN0cmluZyA9IFwiMm5kXCJcclxuICAgICAgICBlbHNlIGlmIHBsYXllci5wbGFjZSA9PSAzXHJcbiAgICAgICAgICBwbGFjZVN0cmluZyA9IFwiM3JkXCJcclxuICAgICAgICBjb3VudFN0cmluZyA9IFwiIGBmZmFhZmZgI3twbGFjZVN0cmluZ31gYCBQbGFjZSBcIlxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgaWYgcGxheWVyLnBsYWNlID09IDFcclxuICAgICAgICAgIGNvdW50U3RyaW5nID0gXCIgYGZmZmZhYWBXaW5uZXJgYCBcIlxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIGNvdW50U3RyaW5nID0gXCIgYGZmYWFmZmBMb3NlcmBgIFwiXHJcbiAgICBlbHNlXHJcbiAgICAgIGNvdW50U3RyaW5nID0gXCIgYGZmZmYzM2Aje2NhcmRDb3VudH1gYCBsZWZ0IFwiXHJcblxyXG4gICAgbmFtZVNpemUgPSBAZm9udFJlbmRlcmVyLnNpemUoQGZvbnQsIGNvdW50SGVpZ2h0LCBuYW1lU3RyaW5nKVxyXG4gICAgY291bnRTaXplID0gQGZvbnRSZW5kZXJlci5zaXplKEBmb250LCBjb3VudEhlaWdodCwgY291bnRTdHJpbmcpXHJcbiAgICBpZiBuYW1lU2l6ZS53ID4gY291bnRTaXplLndcclxuICAgICAgY291bnRTaXplLncgPSBuYW1lU2l6ZS53XHJcbiAgICBlbHNlXHJcbiAgICAgIG5hbWVTaXplLncgPSBjb3VudFNpemUud1xyXG4gICAgbmFtZVkgPSB5XHJcbiAgICBjb3VudFkgPSB5XHJcbiAgICBib3hIZWlnaHQgPSBjb3VudFNpemUuaFxyXG4gICAgaWYgdHJ1ZSAjIHBsYXllci5pZCAhPSAxXHJcbiAgICAgIGJveEhlaWdodCAqPSAyXHJcbiAgICAgIGlmIGFuY2hvcnkgPiAwXHJcbiAgICAgICAgbmFtZVkgLT0gY291bnRIZWlnaHRcclxuICAgICAgZWxzZVxyXG4gICAgICAgIGNvdW50WSArPSBjb3VudEhlaWdodFxyXG4gICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcInNvbGlkXCIsIHgsIHksIGNvdW50U2l6ZS53LCBib3hIZWlnaHQsIDAsIGFuY2hvcngsIGFuY2hvcnksIEBjb2xvcnMub3ZlcmxheVxyXG4gICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIGNvdW50SGVpZ2h0LCBuYW1lU3RyaW5nLCB4LCBuYW1lWSwgYW5jaG9yeCwgYW5jaG9yeSwgQGNvbG9ycy53aGl0ZVxyXG4gICAgaWYgdHJ1ZSAjIHBsYXllci5pZCAhPSAxXHJcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCBjb3VudEhlaWdodCwgY291bnRTdHJpbmcsIHgsIGNvdW50WSwgYW5jaG9yeCwgYW5jaG9yeSwgQGNvbG9ycy53aGl0ZVxyXG5cclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgIyByZW5kZXJpbmcgYW5kIHpvbmVzXHJcblxyXG4gIGRyYXdJbWFnZTogKHRleHR1cmUsIHN4LCBzeSwgc3csIHNoLCBkeCwgZHksIGR3LCBkaCwgcm90LCBhbmNob3J4LCBhbmNob3J5LCByLCBnLCBiLCBhLCBjYikgLT5cclxuICAgIEByZW5kZXJDb21tYW5kcy5wdXNoIEB0ZXh0dXJlc1t0ZXh0dXJlXSwgc3gsIHN5LCBzdywgc2gsIGR4LCBkeSwgZHcsIGRoLCByb3QsIGFuY2hvcngsIGFuY2hvcnksIHIsIGcsIGIsIGFcclxuXHJcbiAgICBpZiBjYj9cclxuICAgICAgIyBjYWxsZXIgd2FudHMgdG8gcmVtZW1iZXIgd2hlcmUgdGhpcyB3YXMgZHJhd24sIGFuZCB3YW50cyB0byBiZSBjYWxsZWQgYmFjayBpZiBpdCBpcyBldmVyIHRvdWNoZWRcclxuICAgICAgIyBUaGlzIGlzIGNhbGxlZCBhIFwiem9uZVwiLiBTaW5jZSB6b25lcyBhcmUgdHJhdmVyc2VkIGluIHJldmVyc2Ugb3JkZXIsIHRoZSBuYXR1cmFsIG92ZXJsYXAgb2ZcclxuICAgICAgIyBhIHNlcmllcyBvZiByZW5kZXJzIGlzIHJlc3BlY3RlZCBhY2NvcmRpbmdseS5cclxuICAgICAgYW5jaG9yT2Zmc2V0WCA9IC0xICogYW5jaG9yeCAqIGR3XHJcbiAgICAgIGFuY2hvck9mZnNldFkgPSAtMSAqIGFuY2hvcnkgKiBkaFxyXG4gICAgICB6b25lID1cclxuICAgICAgICAjIGNlbnRlciAoWCxZKSBhbmQgcmV2ZXJzZWQgcm90YXRpb24sIHVzZWQgdG8gcHV0IHRoZSBjb29yZGluYXRlIGluIGxvY2FsIHNwYWNlIHRvIHRoZSB6b25lXHJcbiAgICAgICAgY3g6ICBkeFxyXG4gICAgICAgIGN5OiAgZHlcclxuICAgICAgICByb3Q6IHJvdCAqIC0xXHJcbiAgICAgICAgIyB0aGUgYXhpcyBhbGlnbmVkIGJvdW5kaW5nIGJveCB1c2VkIGZvciBkZXRlY3Rpb24gb2YgYSBsb2NhbHNwYWNlIGNvb3JkXHJcbiAgICAgICAgbDogICBhbmNob3JPZmZzZXRYXHJcbiAgICAgICAgdDogICBhbmNob3JPZmZzZXRZXHJcbiAgICAgICAgcjogICBhbmNob3JPZmZzZXRYICsgZHdcclxuICAgICAgICBiOiAgIGFuY2hvck9mZnNldFkgKyBkaFxyXG4gICAgICAgICMgY2FsbGJhY2sgdG8gY2FsbCBpZiB0aGUgem9uZSBpcyBjbGlja2VkIG9uXHJcbiAgICAgICAgY2I6ICBjYlxyXG4gICAgICBAem9uZXMucHVzaCB6b25lXHJcblxyXG4gIGNoZWNrWm9uZXM6ICh4LCB5KSAtPlxyXG4gICAgZm9yIHpvbmUgaW4gQHpvbmVzIGJ5IC0xXHJcbiAgICAgICMgbW92ZSBjb29yZCBpbnRvIHNwYWNlIHJlbGF0aXZlIHRvIHRoZSBxdWFkLCB0aGVuIHJvdGF0ZSBpdCB0byBtYXRjaFxyXG4gICAgICB1bnJvdGF0ZWRMb2NhbFggPSB4IC0gem9uZS5jeFxyXG4gICAgICB1bnJvdGF0ZWRMb2NhbFkgPSB5IC0gem9uZS5jeVxyXG4gICAgICBsb2NhbFggPSB1bnJvdGF0ZWRMb2NhbFggKiBNYXRoLmNvcyh6b25lLnJvdCkgLSB1bnJvdGF0ZWRMb2NhbFkgKiBNYXRoLnNpbih6b25lLnJvdClcclxuICAgICAgbG9jYWxZID0gdW5yb3RhdGVkTG9jYWxYICogTWF0aC5zaW4oem9uZS5yb3QpICsgdW5yb3RhdGVkTG9jYWxZICogTWF0aC5jb3Moem9uZS5yb3QpXHJcbiAgICAgIGlmIChsb2NhbFggPCB6b25lLmwpIG9yIChsb2NhbFggPiB6b25lLnIpIG9yIChsb2NhbFkgPCB6b25lLnQpIG9yIChsb2NhbFkgPiB6b25lLmIpXHJcbiAgICAgICAgIyBvdXRzaWRlIG9mIG9yaWVudGVkIGJvdW5kaW5nIGJveFxyXG4gICAgICAgIGNvbnRpbnVlXHJcbiAgICAgIHpvbmUuY2IoeCwgeSlcclxuICAgICAgcmV0dXJuIHRydWVcclxuICAgIHJldHVybiBmYWxzZVxyXG5cclxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVcclxuIiwiQW5pbWF0aW9uID0gcmVxdWlyZSAnLi9BbmltYXRpb24nXHJcblxyXG5DQVJEX0lNQUdFX1cgPSAxMjBcclxuQ0FSRF9JTUFHRV9IID0gMTYyXHJcbkNBUkRfSU1BR0VfT0ZGX1ggPSA0XHJcbkNBUkRfSU1BR0VfT0ZGX1kgPSA0XHJcbkNBUkRfSU1BR0VfQURWX1ggPSBDQVJEX0lNQUdFX1dcclxuQ0FSRF9JTUFHRV9BRFZfWSA9IENBUkRfSU1BR0VfSFxyXG5DQVJEX1JFTkRFUl9TQ0FMRSA9IDAuMzUgICAgICAgICAgICAgICAgICAjIGNhcmQgaGVpZ2h0IGNvZWZmaWNpZW50IGZyb20gdGhlIHNjcmVlbidzIGhlaWdodFxyXG5DQVJEX0hBTkRfQ1VSVkVfRElTVF9GQUNUT1IgPSAzLjUgICAgICAgICAjIGZhY3RvciB3aXRoIHNjcmVlbiBoZWlnaHQgdG8gZmlndXJlIG91dCBjZW50ZXIgb2YgYXJjLiBiaWdnZXIgbnVtYmVyIGlzIGxlc3MgYXJjXHJcbkNBUkRfSE9MRElOR19ST1RfT1JERVIgPSBNYXRoLlBJIC8gMTIgICAgICMgZGVzaXJlZCByb3RhdGlvbiBvZiB0aGUgY2FyZCB3aGVuIGJlaW5nIGRyYWdnZWQgYXJvdW5kIGZvciBvcmRlcmluZydzIHNha2VcclxuQ0FSRF9IT0xESU5HX1JPVF9QTEFZID0gLTEgKiBNYXRoLlBJIC8gMTIgIyBkZXNpcmVkIHJvdGF0aW9uIG9mIHRoZSBjYXJkIHdoZW4gYmVpbmcgZHJhZ2dlZCBhcm91bmQgd2l0aCBpbnRlbnQgdG8gcGxheVxyXG5DQVJEX1BMQVlfQ0VJTElORyA9IDAuNjAgICAgICAgICAgICAgICAgICAjIGhvdyBtdWNoIG9mIHRoZSB0b3Agb2YgdGhlIHNjcmVlbiByZXByZXNlbnRzIFwiSSB3YW50IHRvIHBsYXkgdGhpc1wiIHZzIFwiSSB3YW50IHRvIHJlb3JkZXJcIlxyXG5cclxuTk9fQ0FSRCA9IC0xXHJcblxyXG5IaWdobGlnaHQgPVxyXG4gIE5PTkU6IC0xXHJcbiAgVU5TRUxFQ1RFRDogMFxyXG4gIFNFTEVDVEVEOiAxXHJcbiAgUElMRTogMlxyXG5cclxuIyB0YWtlbiBmcm9tIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTIxMTIxMi9ob3ctdG8tY2FsY3VsYXRlLWFuLWFuZ2xlLWZyb20tdGhyZWUtcG9pbnRzXHJcbiMgdXNlcyBsYXcgb2YgY29zaW5lcyB0byBmaWd1cmUgb3V0IHRoZSBoYW5kIGFyYyBhbmdsZVxyXG5maW5kQW5nbGUgPSAocDAsIHAxLCBwMikgLT5cclxuICAgIGEgPSBNYXRoLnBvdyhwMS54IC0gcDIueCwgMikgKyBNYXRoLnBvdyhwMS55IC0gcDIueSwgMilcclxuICAgIGIgPSBNYXRoLnBvdyhwMS54IC0gcDAueCwgMikgKyBNYXRoLnBvdyhwMS55IC0gcDAueSwgMilcclxuICAgIGMgPSBNYXRoLnBvdyhwMi54IC0gcDAueCwgMikgKyBNYXRoLnBvdyhwMi55IC0gcDAueSwgMilcclxuICAgIHJldHVybiBNYXRoLmFjb3MoIChhK2ItYykgLyBNYXRoLnNxcnQoNCphKmIpIClcclxuXHJcbmNhbGNEaXN0YW5jZSA9IChwMCwgcDEpIC0+XHJcbiAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyhwMS54IC0gcDAueCwgMikgKyBNYXRoLnBvdyhwMS55IC0gcDAueSwgMikpXHJcblxyXG5jYWxjRGlzdGFuY2VTcXVhcmVkID0gKHgwLCB5MCwgeDEsIHkxKSAtPlxyXG4gIHJldHVybiBNYXRoLnBvdyh4MSAtIHgwLCAyKSArIE1hdGgucG93KHkxIC0geTAsIDIpXHJcblxyXG5jbGFzcyBIYW5kXHJcbiAgQENBUkRfSU1BR0VfVzogQ0FSRF9JTUFHRV9XXHJcbiAgQENBUkRfSU1BR0VfSDogQ0FSRF9JTUFHRV9IXHJcbiAgQENBUkRfSU1BR0VfT0ZGX1g6IENBUkRfSU1BR0VfT0ZGX1hcclxuICBAQ0FSRF9JTUFHRV9PRkZfWTogQ0FSRF9JTUFHRV9PRkZfWVxyXG4gIEBDQVJEX0lNQUdFX0FEVl9YOiBDQVJEX0lNQUdFX0FEVl9YXHJcbiAgQENBUkRfSU1BR0VfQURWX1k6IENBUkRfSU1BR0VfQURWX1lcclxuICBAQ0FSRF9SRU5ERVJfU0NBTEU6IENBUkRfUkVOREVSX1NDQUxFXHJcbiAgQEhpZ2hsaWdodDogSGlnaGxpZ2h0XHJcblxyXG4gIGNvbnN0cnVjdG9yOiAoQGdhbWUpIC0+XHJcbiAgICBAY2FyZHMgPSBbXVxyXG4gICAgQGFuaW1zID0ge31cclxuICAgIEBwb3NpdGlvbkNhY2hlID0ge31cclxuXHJcbiAgICBAcGlja2luZyA9IHRydWVcclxuICAgIEBwaWNrZWQgPSBbXVxyXG4gICAgQHBpY2tQYWludCA9IGZhbHNlXHJcblxyXG4gICAgQGRyYWdJbmRleFN0YXJ0ID0gTk9fQ0FSRFxyXG4gICAgQGRyYWdJbmRleEN1cnJlbnQgPSBOT19DQVJEXHJcbiAgICBAZHJhZ1ggPSAwXHJcbiAgICBAZHJhZ1kgPSAwXHJcblxyXG4gICAgIyByZW5kZXIgLyBhbmltIG1ldHJpY3NcclxuICAgIEBjYXJkU3BlZWQgPVxyXG4gICAgICByOiBNYXRoLlBJICogMlxyXG4gICAgICBzOiAyLjVcclxuICAgICAgdDogMiAqIEBnYW1lLndpZHRoXHJcbiAgICBAcGxheUNlaWxpbmcgPSBDQVJEX1BMQVlfQ0VJTElORyAqIEBnYW1lLmhlaWdodFxyXG4gICAgQGNhcmRIZWlnaHQgPSBNYXRoLmZsb29yKEBnYW1lLmhlaWdodCAqIENBUkRfUkVOREVSX1NDQUxFKVxyXG4gICAgQGNhcmRXaWR0aCAgPSBNYXRoLmZsb29yKEBjYXJkSGVpZ2h0ICogQ0FSRF9JTUFHRV9XIC8gQ0FSRF9JTUFHRV9IKVxyXG4gICAgQGNhcmRIYWxmSGVpZ2h0ID0gQGNhcmRIZWlnaHQgPj4gMVxyXG4gICAgQGNhcmRIYWxmV2lkdGggID0gQGNhcmRXaWR0aCA+PiAxXHJcbiAgICBhcmNNYXJnaW4gPSBAY2FyZFdpZHRoIC8gMlxyXG4gICAgYXJjVmVydGljYWxCaWFzID0gQGNhcmRIZWlnaHQgLyA1MFxyXG4gICAgYm90dG9tTGVmdCAgPSB7IHg6IGFyY01hcmdpbiwgICAgICAgICAgICAgICAgeTogYXJjVmVydGljYWxCaWFzICsgQGdhbWUuaGVpZ2h0IH1cclxuICAgIGJvdHRvbVJpZ2h0ID0geyB4OiBAZ2FtZS53aWR0aCAtIGFyY01hcmdpbiwgeTogYXJjVmVydGljYWxCaWFzICsgQGdhbWUuaGVpZ2h0IH1cclxuICAgIEBoYW5kQ2VudGVyID0geyB4OiBAZ2FtZS53aWR0aCAvIDIsICAgICAgICAgeTogYXJjVmVydGljYWxCaWFzICsgQGdhbWUuaGVpZ2h0ICsgKENBUkRfSEFORF9DVVJWRV9ESVNUX0ZBQ1RPUiAqIEBnYW1lLmhlaWdodCkgfVxyXG4gICAgQGhhbmRBbmdsZSA9IGZpbmRBbmdsZShib3R0b21MZWZ0LCBAaGFuZENlbnRlciwgYm90dG9tUmlnaHQpXHJcbiAgICBAaGFuZERpc3RhbmNlID0gY2FsY0Rpc3RhbmNlKGJvdHRvbUxlZnQsIEBoYW5kQ2VudGVyKVxyXG4gICAgQGhhbmRBbmdsZUFkdmFuY2VNYXggPSBAaGFuZEFuZ2xlIC8gNyAjIG5ldmVyIHNwYWNlIHRoZSBjYXJkcyBtb3JlIHRoYW4gd2hhdCB0aGV5J2QgbG9vayBsaWtlIHdpdGggdGhpcyBoYW5kc2l6ZVxyXG4gICAgQGdhbWUubG9nIFwiSGFuZCBkaXN0YW5jZSAje0BoYW5kRGlzdGFuY2V9LCBhbmdsZSAje0BoYW5kQW5nbGV9IChzY3JlZW4gaGVpZ2h0ICN7QGdhbWUuaGVpZ2h0fSlcIlxyXG5cclxuICB0b2dnbGVQaWNraW5nOiAtPlxyXG4gICAgQHBpY2tpbmcgPSAhQHBpY2tpbmdcclxuICAgIGlmIEBwaWNraW5nXHJcbiAgICAgIEBzZWxlY3ROb25lKClcclxuXHJcbiAgc2VsZWN0Tm9uZTogLT5cclxuICAgIEBwaWNrZWQgPSBuZXcgQXJyYXkoQGNhcmRzLmxlbmd0aCkuZmlsbChmYWxzZSlcclxuICAgIHJldHVyblxyXG5cclxuICBzZXQ6IChjYXJkcykgLT5cclxuICAgIEBjYXJkcyA9IGNhcmRzLnNsaWNlKDApXHJcbiAgICBpZiBAcGlja2luZ1xyXG4gICAgICBAc2VsZWN0Tm9uZSgpXHJcbiAgICBAc3luY0FuaW1zKClcclxuICAgIEB3YXJwKClcclxuXHJcbiAgc3luY0FuaW1zOiAtPlxyXG4gICAgc2VlbiA9IHt9XHJcbiAgICBmb3IgY2FyZCBpbiBAY2FyZHNcclxuICAgICAgc2VlbltjYXJkXSsrXHJcbiAgICAgIGlmIG5vdCBAYW5pbXNbY2FyZF1cclxuICAgICAgICBAYW5pbXNbY2FyZF0gPSBuZXcgQW5pbWF0aW9uIHtcclxuICAgICAgICAgIHNwZWVkOiBAY2FyZFNwZWVkXHJcbiAgICAgICAgICB4OiAwXHJcbiAgICAgICAgICB5OiAwXHJcbiAgICAgICAgICByOiAwXHJcbiAgICAgICAgfVxyXG4gICAgdG9SZW1vdmUgPSBbXVxyXG4gICAgZm9yIGNhcmQsYW5pbSBvZiBAYW5pbXNcclxuICAgICAgaWYgbm90IHNlZW4uaGFzT3duUHJvcGVydHkoY2FyZClcclxuICAgICAgICB0b1JlbW92ZS5wdXNoIGNhcmRcclxuICAgIGZvciBjYXJkIGluIHRvUmVtb3ZlXHJcbiAgICAgICMgQGdhbWUubG9nIFwicmVtb3ZpbmcgYW5pbSBmb3IgI3tjYXJkfVwiXHJcbiAgICAgIGRlbGV0ZSBAYW5pbXNbY2FyZF1cclxuXHJcbiAgICBAdXBkYXRlUG9zaXRpb25zKClcclxuXHJcbiAgY2FsY0RyYXduSGFuZDogLT5cclxuICAgIGRyYXduSGFuZCA9IFtdXHJcbiAgICBmb3IgY2FyZCxpIGluIEBjYXJkc1xyXG4gICAgICBpZiBpICE9IEBkcmFnSW5kZXhTdGFydFxyXG4gICAgICAgIGRyYXduSGFuZC5wdXNoIGNhcmRcclxuXHJcbiAgICBpZiBAZHJhZ0luZGV4Q3VycmVudCAhPSBOT19DQVJEXHJcbiAgICAgIGRyYXduSGFuZC5zcGxpY2UgQGRyYWdJbmRleEN1cnJlbnQsIDAsIEBjYXJkc1tAZHJhZ0luZGV4U3RhcnRdXHJcbiAgICByZXR1cm4gZHJhd25IYW5kXHJcblxyXG4gIHdhbnRzVG9QbGF5RHJhZ2dlZENhcmQ6IC0+XHJcbiAgICByZXR1cm4gZmFsc2UgaWYgQGRyYWdJbmRleFN0YXJ0ID09IE5PX0NBUkRcclxuICAgIHJldHVybiBAZHJhZ1kgPCBAcGxheUNlaWxpbmdcclxuXHJcbiAgdXBkYXRlUG9zaXRpb25zOiAtPlxyXG4gICAgZHJhd25IYW5kID0gQGNhbGNEcmF3bkhhbmQoKVxyXG4gICAgd2FudHNUb1BsYXkgPSBAd2FudHNUb1BsYXlEcmFnZ2VkQ2FyZCgpXHJcbiAgICBkZXNpcmVkUm90YXRpb24gPSBDQVJEX0hPTERJTkdfUk9UX09SREVSXHJcbiAgICBwb3NpdGlvbkNvdW50ID0gZHJhd25IYW5kLmxlbmd0aFxyXG4gICAgaWYgd2FudHNUb1BsYXlcclxuICAgICAgZGVzaXJlZFJvdGF0aW9uID0gQ0FSRF9IT0xESU5HX1JPVF9QTEFZXHJcbiAgICAgIHBvc2l0aW9uQ291bnQtLVxyXG4gICAgcG9zaXRpb25zID0gQGNhbGNQb3NpdGlvbnMocG9zaXRpb25Db3VudClcclxuICAgIGRyYXdJbmRleCA9IDBcclxuICAgIGZvciBjYXJkLGkgaW4gZHJhd25IYW5kXHJcbiAgICAgIGFuaW0gPSBAYW5pbXNbY2FyZF1cclxuICAgICAgaWYgaSA9PSBAZHJhZ0luZGV4Q3VycmVudFxyXG4gICAgICAgIGFuaW0ucmVxLnggPSBAZHJhZ1hcclxuICAgICAgICBhbmltLnJlcS55ID0gQGRyYWdZXHJcbiAgICAgICAgYW5pbS5yZXEuciA9IGRlc2lyZWRSb3RhdGlvblxyXG4gICAgICAgIGlmIG5vdCB3YW50c1RvUGxheVxyXG4gICAgICAgICAgZHJhd0luZGV4KytcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHBvcyA9IHBvc2l0aW9uc1tkcmF3SW5kZXhdXHJcbiAgICAgICAgYW5pbS5yZXEueCA9IHBvcy54XHJcbiAgICAgICAgYW5pbS5yZXEueSA9IHBvcy55XHJcbiAgICAgICAgYW5pbS5yZXEuciA9IHBvcy5yXHJcbiAgICAgICAgZHJhd0luZGV4KytcclxuXHJcbiAgIyBpbW1lZGlhdGVseSB3YXJwIGFsbCBjYXJkcyB0byB3aGVyZSB0aGV5IHNob3VsZCBiZVxyXG4gIHdhcnA6IC0+XHJcbiAgICBmb3IgY2FyZCxhbmltIG9mIEBhbmltc1xyXG4gICAgICBhbmltLndhcnAoKVxyXG5cclxuICAjIHJlb3JkZXIgdGhlIGhhbmQgYmFzZWQgb24gdGhlIGRyYWcgbG9jYXRpb24gb2YgdGhlIGhlbGQgY2FyZFxyXG4gIHJlb3JkZXI6IC0+XHJcbiAgICByZXR1cm4gaWYgQGRyYWdJbmRleFN0YXJ0ID09IE5PX0NBUkRcclxuICAgIHJldHVybiBpZiBAY2FyZHMubGVuZ3RoIDwgMiAjIG5vdGhpbmcgdG8gcmVvcmRlclxyXG4gICAgcG9zaXRpb25zID0gQGNhbGNQb3NpdGlvbnMoQGNhcmRzLmxlbmd0aClcclxuICAgIGNsb3Nlc3RJbmRleCA9IDBcclxuICAgIGNsb3Nlc3REaXN0ID0gQGdhbWUud2lkdGggKiBAZ2FtZS5oZWlnaHQgIyBzb21ldGhpbmcgaW1wb3NzaWJseSBsYXJnZVxyXG4gICAgZm9yIHBvcywgaW5kZXggaW4gcG9zaXRpb25zXHJcbiAgICAgIGRpc3QgPSBjYWxjRGlzdGFuY2VTcXVhcmVkKHBvcy54LCBwb3MueSwgQGRyYWdYLCBAZHJhZ1kpXHJcbiAgICAgIGlmIGNsb3Nlc3REaXN0ID4gZGlzdFxyXG4gICAgICAgIGNsb3Nlc3REaXN0ID0gZGlzdFxyXG4gICAgICAgIGNsb3Nlc3RJbmRleCA9IGluZGV4XHJcbiAgICBAZHJhZ0luZGV4Q3VycmVudCA9IGNsb3Nlc3RJbmRleFxyXG5cclxuICBzZWxlY3RlZENhcmRzOiAtPlxyXG4gICAgaWYgbm90IEBwaWNraW5nXHJcbiAgICAgIHJldHVybiBbXVxyXG5cclxuICAgIGNhcmRzID0gW11cclxuICAgIGZvciBjYXJkLCBpIGluIEBjYXJkc1xyXG4gICAgICBpZiBAcGlja2VkW2ldXHJcbiAgICAgICAgYW5pbSA9IEBhbmltc1tjYXJkXVxyXG4gICAgICAgIGNhcmRzLnB1c2gge1xyXG4gICAgICAgICAgY2FyZDogY2FyZFxyXG4gICAgICAgICAgeDogYW5pbS5jdXIueFxyXG4gICAgICAgICAgeTogYW5pbS5jdXIueVxyXG4gICAgICAgICAgcjogYW5pbS5jdXIuclxyXG4gICAgICAgICAgaW5kZXg6IGlcclxuICAgICAgICB9XHJcbiAgICByZXR1cm4gY2FyZHNcclxuXHJcbiAgZG93bjogKEBkcmFnWCwgQGRyYWdZLCBpbmRleCkgLT5cclxuICAgIEB1cChAZHJhZ1gsIEBkcmFnWSkgIyBlbnN1cmUgd2UgbGV0IGdvIG9mIHRoZSBwcmV2aW91cyBjYXJkIGluIGNhc2UgdGhlIGV2ZW50cyBhcmUgZHVtYlxyXG4gICAgaWYgQHBpY2tpbmdcclxuICAgICAgQHBpY2tlZFtpbmRleF0gPSAhQHBpY2tlZFtpbmRleF1cclxuICAgICAgQHBpY2tQYWludCA9IEBwaWNrZWRbaW5kZXhdXHJcbiAgICAgIHJldHVyblxyXG4gICAgQGdhbWUubG9nIFwicGlja2luZyB1cCBjYXJkIGluZGV4ICN7aW5kZXh9XCJcclxuICAgIEBkcmFnSW5kZXhTdGFydCA9IGluZGV4XHJcbiAgICBAZHJhZ0luZGV4Q3VycmVudCA9IGluZGV4XHJcbiAgICBAdXBkYXRlUG9zaXRpb25zKClcclxuXHJcbiAgbW92ZTogKEBkcmFnWCwgQGRyYWdZKSAtPlxyXG4gICAgcmV0dXJuIGlmIEBkcmFnSW5kZXhTdGFydCA9PSBOT19DQVJEXHJcbiAgICAjQGdhbWUubG9nIFwiZHJhZ2dpbmcgYXJvdW5kIGNhcmQgaW5kZXggI3tAZHJhZ0luZGV4Q3VycmVudH1cIlxyXG4gICAgQHJlb3JkZXIoKVxyXG4gICAgQHVwZGF0ZVBvc2l0aW9ucygpXHJcblxyXG4gIHVwOiAoQGRyYWdYLCBAZHJhZ1kpIC0+XHJcbiAgICByZXR1cm4gaWYgQGRyYWdJbmRleFN0YXJ0ID09IE5PX0NBUkRcclxuICAgIEByZW9yZGVyKClcclxuICAgIGlmIEB3YW50c1RvUGxheURyYWdnZWRDYXJkKClcclxuICAgICAgQGdhbWUubG9nIFwidHJ5aW5nIHRvIHBsYXkgYSAje0BjYXJkc1tAZHJhZ0luZGV4U3RhcnRdfSBmcm9tIGluZGV4ICN7QGRyYWdJbmRleFN0YXJ0fVwiXHJcbiAgICAgIGNhcmRJbmRleCA9IEBkcmFnSW5kZXhTdGFydFxyXG4gICAgICBjYXJkID0gQGNhcmRzW2NhcmRJbmRleF1cclxuICAgICAgYW5pbSA9IEBhbmltc1tjYXJkXVxyXG4gICAgICBAZHJhZ0luZGV4U3RhcnQgPSBOT19DQVJEXHJcbiAgICAgIEBkcmFnSW5kZXhDdXJyZW50ID0gTk9fQ0FSRFxyXG4gICAgICBAZ2FtZS5wbGF5IFt7XHJcbiAgICAgICAgY2FyZDogY2FyZFxyXG4gICAgICAgIHg6IGFuaW0uY3VyLnhcclxuICAgICAgICB5OiBhbmltLmN1ci55XHJcbiAgICAgICAgcjogYW5pbS5jdXIuclxyXG4gICAgICAgIGluZGV4OiBjYXJkSW5kZXhcclxuICAgICAgfV1cclxuICAgIGVsc2VcclxuICAgICAgQGdhbWUubG9nIFwidHJ5aW5nIHRvIHJlb3JkZXIgI3tAY2FyZHNbQGRyYWdJbmRleFN0YXJ0XX0gaW50byBpbmRleCAje0BkcmFnSW5kZXhDdXJyZW50fVwiXHJcbiAgICAgIEBjYXJkcyA9IEBjYWxjRHJhd25IYW5kKCkgIyBpcyB0aGlzIHJpZ2h0P1xyXG5cclxuICAgIEBkcmFnSW5kZXhTdGFydCA9IE5PX0NBUkRcclxuICAgIEBkcmFnSW5kZXhDdXJyZW50ID0gTk9fQ0FSRFxyXG4gICAgQHVwZGF0ZVBvc2l0aW9ucygpXHJcblxyXG4gIHVwZGF0ZTogKGR0KSAtPlxyXG4gICAgdXBkYXRlZCA9IGZhbHNlXHJcbiAgICBmb3IgY2FyZCxhbmltIG9mIEBhbmltc1xyXG4gICAgICBpZiBhbmltLnVwZGF0ZShkdClcclxuICAgICAgICB1cGRhdGVkID0gdHJ1ZVxyXG4gICAgcmV0dXJuIHVwZGF0ZWRcclxuXHJcbiAgcmVuZGVyOiAtPlxyXG4gICAgcmV0dXJuIGlmIEBjYXJkcy5sZW5ndGggPT0gMFxyXG4gICAgZHJhd25IYW5kID0gQGNhbGNEcmF3bkhhbmQoKVxyXG4gICAgZm9yIHYsIGluZGV4IGluIGRyYXduSGFuZFxyXG4gICAgICBjb250aW51ZSBpZiB2ID09IE5PX0NBUkRcclxuICAgICAgYW5pbSA9IEBhbmltc1t2XVxyXG4gICAgICBkbyAoYW5pbSwgaW5kZXgpID0+XHJcbiAgICAgICAgaWYgQHBpY2tpbmdcclxuICAgICAgICAgIGlmIEBwaWNrZWRbaW5kZXhdXHJcbiAgICAgICAgICAgIGhpZ2hsaWdodFN0YXRlID0gSGlnaGxpZ2h0LlNFTEVDVEVEXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIGhpZ2hsaWdodFN0YXRlID0gSGlnaGxpZ2h0LlVOU0VMRUNURURcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBpZiBAd2FudHNUb1BsYXlEcmFnZ2VkQ2FyZCgpXHJcbiAgICAgICAgICAgIGlmIChpbmRleCA9PSBAZHJhZ0luZGV4Q3VycmVudClcclxuICAgICAgICAgICAgICBoaWdobGlnaHRTdGF0ZSA9IEhpZ2hsaWdodC5TRUxFQ1RFRFxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgaGlnaGxpZ2h0U3RhdGUgPSBIaWdobGlnaHQuVU5TRUxFQ1RFRFxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBoaWdobGlnaHRTdGF0ZSA9IEhpZ2hsaWdodC5OT05FXHJcbiAgICAgICAgQHJlbmRlckNhcmQgdiwgYW5pbS5jdXIueCwgYW5pbS5jdXIueSwgYW5pbS5jdXIuciwgMSwgaGlnaGxpZ2h0U3RhdGUsIChjbGlja1gsIGNsaWNrWSkgPT5cclxuICAgICAgICAgIEBkb3duKGNsaWNrWCwgY2xpY2tZLCBpbmRleClcclxuXHJcbiAgcmVuZGVyQ2FyZDogKHYsIHgsIHksIHJvdCwgc2NhbGUsIHNlbGVjdGVkLCBjYikgLT5cclxuICAgIHJvdCA9IDAgaWYgbm90IHJvdFxyXG4gICAgcmFuayA9IE1hdGguZmxvb3IodiAvIDQpXHJcbiAgICBzdWl0ID0gTWF0aC5mbG9vcih2ICUgNClcclxuXHJcbiAgICBjb2wgPSBzd2l0Y2ggc2VsZWN0ZWRcclxuICAgICAgd2hlbiBIaWdobGlnaHQuTk9ORVxyXG4gICAgICAgIFsxLCAxLCAxXVxyXG4gICAgICB3aGVuIEhpZ2hsaWdodC5VTlNFTEVDVEVEXHJcbiAgICAgICAgIyBbMC4zLCAwLjMsIDAuM11cclxuICAgICAgICBbMSwgMSwgMV1cclxuICAgICAgd2hlbiBIaWdobGlnaHQuU0VMRUNURURcclxuICAgICAgICBbMC41LCAwLjUsIDAuOV1cclxuICAgICAgd2hlbiBIaWdobGlnaHQuUElMRVxyXG4gICAgICAgIFswLjYsIDAuNiwgMC42XVxyXG5cclxuICAgIEBnYW1lLmRyYXdJbWFnZSBcImNhcmRzXCIsXHJcbiAgICBDQVJEX0lNQUdFX09GRl9YICsgKENBUkRfSU1BR0VfQURWX1ggKiByYW5rKSwgQ0FSRF9JTUFHRV9PRkZfWSArIChDQVJEX0lNQUdFX0FEVl9ZICogc3VpdCksIENBUkRfSU1BR0VfVywgQ0FSRF9JTUFHRV9ILFxyXG4gICAgeCwgeSwgQGNhcmRXaWR0aCAqIHNjYWxlLCBAY2FyZEhlaWdodCAqIHNjYWxlLFxyXG4gICAgcm90LCAwLjUsIDAuNSwgY29sWzBdLGNvbFsxXSxjb2xbMl0sMSwgY2JcclxuXHJcbiAgY2FsY1Bvc2l0aW9uczogKGhhbmRTaXplKSAtPlxyXG4gICAgaWYgQHBvc2l0aW9uQ2FjaGUuaGFzT3duUHJvcGVydHkoaGFuZFNpemUpXHJcbiAgICAgIHJldHVybiBAcG9zaXRpb25DYWNoZVtoYW5kU2l6ZV1cclxuICAgIHJldHVybiBbXSBpZiBoYW5kU2l6ZSA9PSAwXHJcblxyXG4gICAgYWR2YW5jZSA9IEBoYW5kQW5nbGUgLyBoYW5kU2l6ZVxyXG4gICAgaWYgYWR2YW5jZSA+IEBoYW5kQW5nbGVBZHZhbmNlTWF4XHJcbiAgICAgIGFkdmFuY2UgPSBAaGFuZEFuZ2xlQWR2YW5jZU1heFxyXG4gICAgYW5nbGVTcHJlYWQgPSBhZHZhbmNlICogaGFuZFNpemUgICAgICAgICAgICAgICAgIyBob3cgbXVjaCBvZiB0aGUgYW5nbGUgd2UgcGxhbiBvbiB1c2luZ1xyXG4gICAgYW5nbGVMZWZ0b3ZlciA9IEBoYW5kQW5nbGUgLSBhbmdsZVNwcmVhZCAgICAgICAgIyBhbW91bnQgb2YgYW5nbGUgd2UncmUgbm90IHVzaW5nLCBhbmQgbmVlZCB0byBwYWQgc2lkZXMgd2l0aCBldmVubHlcclxuICAgIGN1cnJlbnRBbmdsZSA9IC0xICogKEBoYW5kQW5nbGUgLyAyKSAgICAgICAgICAgICMgbW92ZSB0byB0aGUgbGVmdCBzaWRlIG9mIG91ciBhbmdsZVxyXG4gICAgY3VycmVudEFuZ2xlICs9IGFuZ2xlTGVmdG92ZXIgLyAyICAgICAgICAgICAgICAgIyAuLi4gYW5kIGFkdmFuY2UgcGFzdCBoYWxmIG9mIHRoZSBwYWRkaW5nXHJcbiAgICBjdXJyZW50QW5nbGUgKz0gYWR2YW5jZSAvIDIgICAgICAgICAgICAgICAgICAgICAjIC4uLiBhbmQgY2VudGVyIHRoZSBjYXJkcyBpbiB0aGUgYW5nbGVcclxuXHJcbiAgICBwb3NpdGlvbnMgPSBbXVxyXG4gICAgZm9yIGkgaW4gWzAuLi5oYW5kU2l6ZV1cclxuICAgICAgeCA9IEBoYW5kQ2VudGVyLnggLSBNYXRoLmNvcygoTWF0aC5QSSAvIDIpICsgY3VycmVudEFuZ2xlKSAqIEBoYW5kRGlzdGFuY2VcclxuICAgICAgeSA9IEBoYW5kQ2VudGVyLnkgLSBNYXRoLnNpbigoTWF0aC5QSSAvIDIpICsgY3VycmVudEFuZ2xlKSAqIEBoYW5kRGlzdGFuY2VcclxuICAgICAgY3VycmVudEFuZ2xlICs9IGFkdmFuY2VcclxuICAgICAgcG9zaXRpb25zLnB1c2gge1xyXG4gICAgICAgIHg6IHhcclxuICAgICAgICB5OiB5XHJcbiAgICAgICAgcjogY3VycmVudEFuZ2xlIC0gYWR2YW5jZVxyXG4gICAgICB9XHJcblxyXG4gICAgQHBvc2l0aW9uQ2FjaGVbaGFuZFNpemVdID0gcG9zaXRpb25zXHJcbiAgICByZXR1cm4gcG9zaXRpb25zXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRcclxuIiwiQnV0dG9uID0gcmVxdWlyZSAnLi9CdXR0b24nXHJcblxyXG5jbGFzcyBNZW51XHJcbiAgY29uc3RydWN0b3I6IChAZ2FtZSwgQHRpdGxlLCBAYmFja2dyb3VuZCwgQGNvbG9yLCBAYWN0aW9ucykgLT5cclxuICAgIEBidXR0b25zID0gW11cclxuICAgIEBidXR0b25OYW1lcyA9IFtcImJ1dHRvbjBcIiwgXCJidXR0b24xXCJdXHJcblxyXG4gICAgYnV0dG9uU2l6ZSA9IEBnYW1lLmhlaWdodCAvIDE1XHJcbiAgICBAYnV0dG9uU3RhcnRZID0gQGdhbWUuaGVpZ2h0IC8gNVxyXG5cclxuICAgIHNsaWNlID0gKEBnYW1lLmhlaWdodCAtIEBidXR0b25TdGFydFkpIC8gKEBhY3Rpb25zLmxlbmd0aCArIDEpXHJcbiAgICBjdXJyWSA9IEBidXR0b25TdGFydFkgKyBzbGljZVxyXG4gICAgZm9yIGFjdGlvbiBpbiBAYWN0aW9uc1xyXG4gICAgICBidXR0b24gPSBuZXcgQnV0dG9uKEBnYW1lLCBAYnV0dG9uTmFtZXMsIEBnYW1lLmZvbnQsIGJ1dHRvblNpemUsIEBnYW1lLmNlbnRlci54LCBjdXJyWSwgYWN0aW9uKVxyXG4gICAgICBAYnV0dG9ucy5wdXNoIGJ1dHRvblxyXG4gICAgICBjdXJyWSArPSBzbGljZVxyXG5cclxuICB1cGRhdGU6IChkdCkgLT5cclxuICAgIHVwZGF0ZWQgPSBmYWxzZVxyXG4gICAgZm9yIGJ1dHRvbiBpbiBAYnV0dG9uc1xyXG4gICAgICBpZiBidXR0b24udXBkYXRlKGR0KVxyXG4gICAgICAgIHVwZGF0ZWQgPSB0cnVlXHJcbiAgICByZXR1cm4gdXBkYXRlZFxyXG5cclxuICByZW5kZXI6IC0+XHJcbiAgICBAZ2FtZS5zcHJpdGVSZW5kZXJlci5yZW5kZXIgQGJhY2tncm91bmQsIDAsIDAsIEBnYW1lLndpZHRoLCBAZ2FtZS5oZWlnaHQsIDAsIDAsIDAsIEBjb2xvclxyXG4gICAgQGdhbWUuZm9udFJlbmRlcmVyLnJlbmRlciBAZ2FtZS5mb250LCBAZ2FtZS5oZWlnaHQgLyAyNSwgXCJCdWlsZDogI3tAZ2FtZS52ZXJzaW9ufVwiLCAwLCBAZ2FtZS5oZWlnaHQsIDAsIDEsIEBnYW1lLmNvbG9ycy5saWdodGdyYXlcclxuICAgIHRpdGxlSGVpZ2h0ID0gQGdhbWUuaGVpZ2h0IC8gOFxyXG4gICAgdGl0bGVPZmZzZXQgPSBAYnV0dG9uU3RhcnRZID4+IDFcclxuICAgIEBnYW1lLmZvbnRSZW5kZXJlci5yZW5kZXIgQGdhbWUuZm9udCwgdGl0bGVIZWlnaHQsIEB0aXRsZSwgQGdhbWUuY2VudGVyLngsIHRpdGxlT2Zmc2V0LCAwLjUsIDAuNSwgQGdhbWUuY29sb3JzLndoaXRlXHJcbiAgICBmb3IgYnV0dG9uIGluIEBidXR0b25zXHJcbiAgICAgIGJ1dHRvbi5yZW5kZXIoKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNZW51XHJcbiIsIkFuaW1hdGlvbiA9IHJlcXVpcmUgJy4vQW5pbWF0aW9uJ1xyXG5IYW5kID0gcmVxdWlyZSAnLi9IYW5kJ1xyXG5cclxuU0VUVExFX01TID0gMTAwMFxyXG5cclxuY2xhc3MgUGlsZVxyXG4gIGNvbnN0cnVjdG9yOiAoQGdhbWUsIEBoYW5kKSAtPlxyXG4gICAgQHBsYXlJRCA9IC0xXHJcbiAgICBAcGxheXMgPSBbXVxyXG4gICAgQGFuaW1zID0ge31cclxuICAgIEBzZXR0bGVUaW1lciA9IDBcclxuICAgIEB0aHJvd25Db2xvciA9IHsgcjogMSwgZzogMSwgYjogMCwgYTogMX1cclxuICAgIEBzY2FsZSA9IDAuNlxyXG5cclxuICAgICMgMS4wIGlzIG5vdCBtZXNzeSBhdCBhbGwsIGFzIHlvdSBhcHByb2FjaCAwIGl0IHN0YXJ0cyB0byBhbGwgcGlsZSBvbiBvbmUgYW5vdGhlclxyXG4gICAgbWVzc3kgPSAwLjJcclxuXHJcbiAgICBAcGxheUNhcmRTcGFjaW5nID0gMC4xXHJcblxyXG4gICAgY2VudGVyWCA9IEBnYW1lLmNlbnRlci54XHJcbiAgICBjZW50ZXJZID0gQGdhbWUuY2VudGVyLnlcclxuICAgIG9mZnNldFggPSBAaGFuZC5jYXJkV2lkdGggKiBtZXNzeSAqIEBzY2FsZVxyXG4gICAgb2Zmc2V0WSA9IEBoYW5kLmNhcmRIYWxmSGVpZ2h0ICogbWVzc3kgKiBAc2NhbGVcclxuICAgIEBwbGF5TG9jYXRpb25zID0gW1xyXG4gICAgICB7IHg6IGNlbnRlclgsIHk6IGNlbnRlclkgKyBvZmZzZXRZIH0gIyBib3R0b21cclxuICAgICAgeyB4OiBjZW50ZXJYIC0gb2Zmc2V0WCwgeTogY2VudGVyWSB9ICMgbGVmdFxyXG4gICAgICB7IHg6IGNlbnRlclgsIHk6IGNlbnRlclkgLSBvZmZzZXRZIH0gIyB0b3BcclxuICAgICAgeyB4OiBjZW50ZXJYICsgb2Zmc2V0WCwgeTogY2VudGVyWSB9ICMgcmlnaHRcclxuICAgIF1cclxuICAgIEB0aHJvd0xvY2F0aW9ucyA9IFtcclxuICAgICAgeyB4OiBjZW50ZXJYLCB5OiBAZ2FtZS5oZWlnaHQgfSAjIGJvdHRvbVxyXG4gICAgICB7IHg6IDAsIHk6IGNlbnRlclkgKyBvZmZzZXRZIH0gIyBsZWZ0XHJcbiAgICAgIHsgeDogY2VudGVyWCwgeTogMCB9ICMgdG9wXHJcbiAgICAgIHsgeDogQGdhbWUud2lkdGgsIHk6IGNlbnRlclkgKyBvZmZzZXRZIH0gIyByaWdodFxyXG4gICAgXVxyXG5cclxuICBzZXQ6IChwaWxlSUQsIHBpbGUsIHBpbGVXaG8pIC0+XHJcbiAgICBpZiBAcGxheUlEICE9IHBpbGVJRFxyXG4gICAgICBAcGxheUlEID0gcGlsZUlEXHJcbiAgICAgIEBwbGF5cy5wdXNoIHtcclxuICAgICAgICBjYXJkczogcGlsZS5zbGljZSgwKVxyXG4gICAgICAgIHdobzogcGlsZVdob1xyXG4gICAgICB9XHJcbiAgICAgIEBzZXR0bGVUaW1lciA9IFNFVFRMRV9NU1xyXG5cclxuICAgICMgaWYgKEBwbGF5SUQgIT0gcGlsZUlEKSBhbmQgKHRocm93bi5sZW5ndGggPiAwKVxyXG4gICAgIyAgIEBwbGF5cyA9IHRocm93bi5zbGljZSgwKSAjIHRoZSBwaWxlIGhhcyBiZWNvbWUgdGhlIHRocm93biwgc3Rhc2ggaXQgb2ZmIG9uZSBsYXN0IHRpbWVcclxuICAgICMgICBAcGxheVdobyA9IHRocm93bldoby5zbGljZSgwKVxyXG4gICAgIyAgIEBwbGF5SUQgPSBwaWxlSURcclxuICAgICMgICBAc2V0dGxlVGltZXIgPSBTRVRUTEVfTVNcclxuXHJcbiAgICAjICMgZG9uJ3Qgc3RvbXAgdGhlIHBpbGUgd2UncmUgZHJhd2luZyB1bnRpbCBpdCBpcyBkb25lIHNldHRsaW5nIGFuZCBjYW4gZmx5IG9mZiB0aGUgc2NyZWVuXHJcbiAgICAjIGlmIEBzZXR0bGVUaW1lciA9PSAwXHJcbiAgICAjICAgQHBsYXlzID0gcGlsZS5zbGljZSgwKVxyXG4gICAgIyAgIEBwbGF5V2hvID0gcGlsZVdoby5zbGljZSgwKVxyXG4gICAgIyAgIEB0aHJvd24gPSB0aHJvd24uc2xpY2UoMClcclxuICAgICMgICBAdGhyb3duV2hvID0gdGhyb3duV2hvLnNsaWNlKDApXHJcbiAgICAjICAgQHRocm93blRha2VyID0gdGhyb3duVGFrZXJcclxuXHJcbiAgICBAc3luY0FuaW1zKClcclxuXHJcbiAgaGludDogKGNhcmRzKSAtPlxyXG4gICAgZm9yIGNhcmQgaW4gY2FyZHNcclxuICAgICAgQGFuaW1zW2NhcmQuY2FyZF0gPSBuZXcgQW5pbWF0aW9uIHtcclxuICAgICAgICBzcGVlZDogQGhhbmQuY2FyZFNwZWVkXHJcbiAgICAgICAgeDogY2FyZC54XHJcbiAgICAgICAgeTogY2FyZC55XHJcbiAgICAgICAgcjogY2FyZC5yXHJcbiAgICAgICAgczogMVxyXG4gICAgICB9XHJcblxyXG4gIHN5bmNBbmltczogLT5cclxuICAgIHNlZW4gPSB7fVxyXG4gICAgbG9jYXRpb25zID0gQHRocm93TG9jYXRpb25zXHJcbiAgICBmb3IgcGxheSBpbiBAcGxheXNcclxuICAgICAgZm9yIGNhcmQsIGluZGV4IGluIHBsYXkuY2FyZHNcclxuICAgICAgICBzZWVuW2NhcmRdKytcclxuICAgICAgICBpZiBub3QgQGFuaW1zW2NhcmRdXHJcbiAgICAgICAgICB3aG8gPSBwbGF5Lndob1xyXG4gICAgICAgICAgbG9jYXRpb24gPSBsb2NhdGlvbnNbd2hvXVxyXG4gICAgICAgICAgQGFuaW1zW2NhcmRdID0gbmV3IEFuaW1hdGlvbiB7XHJcbiAgICAgICAgICAgIHNwZWVkOiBAaGFuZC5jYXJkU3BlZWRcclxuICAgICAgICAgICAgeDogbG9jYXRpb24ueFxyXG4gICAgICAgICAgICB5OiBsb2NhdGlvbi55XHJcbiAgICAgICAgICAgIHI6IC0xICogTWF0aC5QSSAvIDRcclxuICAgICAgICAgICAgczogQHNjYWxlXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgdG9SZW1vdmUgPSBbXVxyXG4gICAgZm9yIGNhcmQsYW5pbSBvZiBAYW5pbXNcclxuICAgICAgaWYgbm90IHNlZW4uaGFzT3duUHJvcGVydHkoY2FyZClcclxuICAgICAgICB0b1JlbW92ZS5wdXNoIGNhcmRcclxuICAgIGZvciBjYXJkIGluIHRvUmVtb3ZlXHJcbiAgICAgICMgQGdhbWUubG9nIFwicmVtb3ZpbmcgYW5pbSBmb3IgI3tjYXJkfVwiXHJcbiAgICAgIGRlbGV0ZSBAYW5pbXNbY2FyZF1cclxuXHJcbiAgICBAdXBkYXRlUG9zaXRpb25zKClcclxuXHJcbiAgdXBkYXRlUG9zaXRpb25zOiAtPlxyXG4gICAgbG9jYXRpb25zID0gQHBsYXlMb2NhdGlvbnNcclxuICAgIGZvciBwbGF5LCBwbGF5SW5kZXggaW4gQHBsYXlzXHJcbiAgICAgIGZvciB2LCBpbmRleCBpbiBwbGF5LmNhcmRzXHJcbiAgICAgICAgYW5pbSA9IEBhbmltc1t2XVxyXG4gICAgICAgIGxvYyA9IHBsYXkud2hvXHJcbiAgICAgICAgYW5pbS5yZXEueCA9IGxvY2F0aW9uc1tsb2NdLnggKyAoaW5kZXggKiBAaGFuZC5jYXJkV2lkdGggKiBAcGxheUNhcmRTcGFjaW5nKVxyXG4gICAgICAgIGFuaW0ucmVxLnkgPSBsb2NhdGlvbnNbbG9jXS55XHJcbiAgICAgICAgYW5pbS5yZXEuciA9IDAuMiAqIE1hdGguY29zKHBsYXlJbmRleCAvIDAuMSlcclxuICAgICAgICBhbmltLnJlcS5zID0gQHNjYWxlXHJcblxyXG4gIHJlYWR5Rm9yTmV4dFRyaWNrOiAtPlxyXG4gICAgcmV0dXJuIChAc2V0dGxlVGltZXIgPT0gMClcclxuXHJcbiAgdXBkYXRlOiAoZHQpIC0+XHJcbiAgICB1cGRhdGVkID0gZmFsc2VcclxuXHJcbiAgICBpZiBAc2V0dGxlVGltZXIgPiAwXHJcbiAgICAgIHVwZGF0ZWQgPSB0cnVlXHJcbiAgICAgIEBzZXR0bGVUaW1lciAtPSBkdFxyXG4gICAgICBpZiBAc2V0dGxlVGltZXIgPCAwXHJcbiAgICAgICAgQHNldHRsZVRpbWVyID0gMFxyXG5cclxuICAgIGZvciBjYXJkLGFuaW0gb2YgQGFuaW1zXHJcbiAgICAgIGlmIGFuaW0udXBkYXRlKGR0KVxyXG4gICAgICAgIHVwZGF0ZWQgPSB0cnVlXHJcblxyXG4gICAgcmV0dXJuIHVwZGF0ZWRcclxuXHJcbiAgIyB1c2VkIGJ5IHRoZSBnYW1lIG92ZXIgc2NyZWVuLiBJdCByZXR1cm5zIHRydWUgd2hlbiBuZWl0aGVyIHRoZSBwaWxlIG5vciB0aGUgbGFzdCB0aHJvd24gYXJlIG1vdmluZ1xyXG4gIHJlc3Rpbmc6IC0+XHJcbiAgICBmb3IgY2FyZCxhbmltIG9mIEBhbmltc1xyXG4gICAgICBpZiBhbmltLmFuaW1hdGluZygpXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICBpZiBAc2V0dGxlVGltZXIgPiAwXHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgcmV0dXJuIHRydWVcclxuXHJcbiAgcmVuZGVyOiAtPlxyXG4gICAgZm9yIHBsYXksIHBsYXlJbmRleCBpbiBAcGxheXNcclxuICAgICAgaGlnaGxpZ2h0ID0gSGFuZC5IaWdobGlnaHQuUElMRVxyXG4gICAgICBpZiBwbGF5SW5kZXggPT0gKEBwbGF5cy5sZW5ndGggLSAxKVxyXG4gICAgICAgIGhpZ2hsaWdodCA9IEhhbmQuSGlnaGxpZ2h0Lk5PTkVcclxuICAgICAgZm9yIHYsIGluZGV4IGluIHBsYXkuY2FyZHNcclxuICAgICAgICBhbmltID0gQGFuaW1zW3ZdXHJcbiAgICAgICAgQGhhbmQucmVuZGVyQ2FyZCB2LCBhbmltLmN1ci54LCBhbmltLmN1ci55LCBhbmltLmN1ci5yLCBhbmltLmN1ci5zLCBoaWdobGlnaHRcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUGlsZVxyXG4iLCJjbGFzcyBTcHJpdGVSZW5kZXJlclxyXG4gIGNvbnN0cnVjdG9yOiAoQGdhbWUpIC0+XHJcbiAgICBAc3ByaXRlcyA9XHJcbiAgICAgICMgZ2VuZXJpYyBzcHJpdGVzXHJcbiAgICAgIHNvbGlkOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6ICA1NSwgeTogNzIzLCB3OiAgMTAsIGg6ICAxMCB9XHJcbiAgICAgIHBhdXNlOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDYwMiwgeTogNzA3LCB3OiAxMjIsIGg6IDEyNSB9XHJcbiAgICAgIGJ1dHRvbjA6ICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDE0MCwgeTogNzc3LCB3OiA0MjIsIGg6ICA2NSB9XHJcbiAgICAgIGJ1dHRvbjE6ICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDE0MCwgeTogNjk4LCB3OiA0MjIsIGg6ICA2NSB9XHJcbiAgICAgIHBsdXMwOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDc0NSwgeTogNjY0LCB3OiAxMTYsIGg6IDExOCB9XHJcbiAgICAgIHBsdXMxOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDc0NSwgeTogODIwLCB3OiAxMTYsIGg6IDExOCB9XHJcbiAgICAgIG1pbnVzMDogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDg5NSwgeTogNjY0LCB3OiAxMTYsIGg6IDExOCB9XHJcbiAgICAgIG1pbnVzMTogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDg5NSwgeTogODIwLCB3OiAxMTYsIGg6IDExOCB9XHJcbiAgICAgIGFycm93TDogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6ICAzMywgeTogODU4LCB3OiAyMDQsIGg6IDE1NiB9XHJcbiAgICAgIGFycm93UjogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDIzOSwgeTogODUyLCB3OiAyMDgsIGg6IDE1NSB9XHJcblxyXG4gICAgICBwaWxlOiAgICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAgMTMsIHk6IDg4MywgdzogMTI4LCBoOiAxMjggfVxyXG4gICAgICBwaWxlMDogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAxNDUsIHk6IDg4MywgdzogMTI4LCBoOiAxMjggfVxyXG4gICAgICBwaWxlMTogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAyNzcsIHk6IDg4MywgdzogMTI4LCBoOiAxMjggfVxyXG4gICAgICBwaWxlMjogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA0MDksIHk6IDg4MywgdzogMTI4LCBoOiAxMjggfVxyXG4gICAgICBwaWxlMzogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA1NDEsIHk6IDg4MywgdzogMTI4LCBoOiAxMjggfVxyXG5cclxuICAgICAgIyBtZW51IGJhY2tncm91bmRzXHJcbiAgICAgIG1haW5tZW51OiAgeyB0ZXh0dXJlOiBcIm1haW5tZW51XCIsICB4OiAwLCB5OiAwLCB3OiAxMjgwLCBoOiA3MjAgfVxyXG4gICAgICBwYXVzZW1lbnU6IHsgdGV4dHVyZTogXCJwYXVzZW1lbnVcIiwgeDogMCwgeTogMCwgdzogMTI4MCwgaDogNzIwIH1cclxuXHJcbiAgICAgICMgaG93dG9cclxuICAgICAgaG93dG8xOiAgICB7IHRleHR1cmU6IFwiaG93dG8xXCIsICB4OiAwLCB5OiAgMCwgdzogMTkyMCwgaDogMTA4MCB9XHJcblxyXG4gICAgICBhdTogICAgICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA1NDAsIHk6IDEwNzksIHc6IDQwMCwgaDogIDgwIH1cclxuICAgICAgc3Rhcl9vbjogICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogIDM4LCB5OiAxMDY2LCB3OiAxOTAsIGg6IDE5MCB9XHJcbiAgICAgIHN0YXJfb2ZmOiAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDI1MCwgeTogMTA2NiwgdzogMTkwLCBoOiAxOTAgfVxyXG5cclxuICAgICAgIyBjaGFyYWN0ZXJzXHJcbiAgICAgIG1hcmlvOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6ICAyMCwgeTogICAwLCB3OiAxNTEsIGg6IDMwOCB9XHJcbiAgICAgIGx1aWdpOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDE3MSwgeTogICAwLCB3OiAxNTEsIGg6IDMwOCB9XHJcbiAgICAgIHBlYWNoOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDMzNSwgeTogICAwLCB3OiAxNjQsIGg6IDMwOCB9XHJcbiAgICAgIGRhaXN5OiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDUwNCwgeTogICAwLCB3OiAxNjQsIGg6IDMwOCB9XHJcbiAgICAgIHlvc2hpOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDY2OCwgeTogICAwLCB3OiAxODAsIGg6IDMwOCB9XHJcbiAgICAgIHRvYWQ6ICAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDg0OSwgeTogICAwLCB3OiAxNTcsIGg6IDMwOCB9XHJcbiAgICAgIGJvd3NlcjogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6ICAxMSwgeTogMzIyLCB3OiAxNTEsIGg6IDMwOCB9XHJcbiAgICAgIGJvd3NlcmpyOiAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDIyNSwgeTogMzIyLCB3OiAxNDQsIGg6IDMwOCB9XHJcbiAgICAgIGtvb3BhOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDM3MiwgeTogMzIyLCB3OiAxMjgsIGg6IDMwOCB9XHJcbiAgICAgIHJvc2FsaW5hOiAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDUwMCwgeTogMzIyLCB3OiAxNzMsIGg6IDMwOCB9XHJcbiAgICAgIHNoeWd1eTogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDY5MSwgeTogMzIyLCB3OiAxNTQsIGg6IDMwOCB9XHJcbiAgICAgIHRvYWRldHRlOiAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDg0NywgeTogMzIyLCB3OiAxNTgsIGg6IDMwOCB9XHJcblxyXG4gIGNhbGNXaWR0aDogKHNwcml0ZU5hbWUsIGhlaWdodCkgLT5cclxuICAgIHNwcml0ZSA9IEBzcHJpdGVzW3Nwcml0ZU5hbWVdXHJcbiAgICByZXR1cm4gMSBpZiBub3Qgc3ByaXRlXHJcbiAgICByZXR1cm4gaGVpZ2h0ICogc3ByaXRlLncgLyBzcHJpdGUuaFxyXG5cclxuICByZW5kZXI6IChzcHJpdGVOYW1lLCBkeCwgZHksIGR3LCBkaCwgcm90LCBhbmNob3J4LCBhbmNob3J5LCBjb2xvciwgY2IpIC0+XHJcbiAgICBzcHJpdGUgPSBAc3ByaXRlc1tzcHJpdGVOYW1lXVxyXG4gICAgcmV0dXJuIGlmIG5vdCBzcHJpdGVcclxuICAgIGlmIChkdyA9PSAwKSBhbmQgKGRoID09IDApXHJcbiAgICAgICMgdGhpcyBwcm9iYWJseSBzaG91bGRuJ3QgZXZlciBiZSB1c2VkLlxyXG4gICAgICBkdyA9IHNwcml0ZS54XHJcbiAgICAgIGRoID0gc3ByaXRlLnlcclxuICAgIGVsc2UgaWYgZHcgPT0gMFxyXG4gICAgICBkdyA9IGRoICogc3ByaXRlLncgLyBzcHJpdGUuaFxyXG4gICAgZWxzZSBpZiBkaCA9PSAwXHJcbiAgICAgIGRoID0gZHcgKiBzcHJpdGUuaCAvIHNwcml0ZS53XHJcbiAgICBAZ2FtZS5kcmF3SW1hZ2Ugc3ByaXRlLnRleHR1cmUsIHNwcml0ZS54LCBzcHJpdGUueSwgc3ByaXRlLncsIHNwcml0ZS5oLCBkeCwgZHksIGR3LCBkaCwgcm90LCBhbmNob3J4LCBhbmNob3J5LCBjb2xvci5yLCBjb2xvci5nLCBjb2xvci5iLCBjb2xvci5hLCBjYlxyXG4gICAgcmV0dXJuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNwcml0ZVJlbmRlcmVyXHJcbiIsIk1JTl9QTEFZRVJTID0gM1xyXG5NQVhfTE9HX0xJTkVTID0gNlxyXG5PSyA9ICdPSydcclxuXHJcblN1aXQgPVxyXG4gIE5PTkU6IC0xXHJcbiAgU1BBREVTOiAwXHJcbiAgQ0xVQlM6IDFcclxuICBESUFNT05EUzogMlxyXG4gIEhFQVJUUzogM1xyXG5cclxuU3VpdE5hbWUgPSBbJ1NwYWRlcycsICdDbHVicycsICdEaWFtb25kcycsICdIZWFydHMnXVxyXG5TaG9ydFN1aXROYW1lID0gWydTJywgJ0MnLCAnRCcsICdIJ11cclxuR2x5cGhTdWl0TmFtZSA9IFtcIlxceGM4XCIsIFwiXFx4YzlcIiwgXCJcXHhjYVwiLCBcIlxceGNiXCJdXHJcblxyXG5TVEFSVElOR19NT05FWSA9IDI1XHJcblxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIEFJIE5hbWUgR2VuZXJhdG9yXHJcblxyXG5haUNoYXJhY3Rlckxpc3QgPSBbXHJcbiAgeyBpZDogXCJtYXJpb1wiLCAgICBuYW1lOiBcIk1hcmlvXCIsICAgICAgc3ByaXRlOiBcIm1hcmlvXCIsICAgIGJyYWluOiBcIm5vcm1hbFwiIH1cclxuICB7IGlkOiBcImx1aWdpXCIsICAgIG5hbWU6IFwiTHVpZ2lcIiwgICAgICBzcHJpdGU6IFwibHVpZ2lcIiwgICAgYnJhaW46IFwibm9ybWFsXCIgfVxyXG4gIHsgaWQ6IFwicGVhY2hcIiwgICAgbmFtZTogXCJQZWFjaFwiLCAgICAgIHNwcml0ZTogXCJwZWFjaFwiLCAgICBicmFpbjogXCJub3JtYWxcIiB9XHJcbiAgeyBpZDogXCJkYWlzeVwiLCAgICBuYW1lOiBcIkRhaXN5XCIsICAgICAgc3ByaXRlOiBcImRhaXN5XCIsICAgIGJyYWluOiBcIm5vcm1hbFwiIH1cclxuICB7IGlkOiBcInlvc2hpXCIsICAgIG5hbWU6IFwiWW9zaGlcIiwgICAgICBzcHJpdGU6IFwieW9zaGlcIiwgICAgYnJhaW46IFwibm9ybWFsXCIgfVxyXG4gIHsgaWQ6IFwidG9hZFwiLCAgICAgbmFtZTogXCJUb2FkXCIsICAgICAgIHNwcml0ZTogXCJ0b2FkXCIsICAgICBicmFpbjogXCJub3JtYWxcIiB9XHJcbiAgeyBpZDogXCJib3dzZXJcIiwgICBuYW1lOiBcIkJvd3NlclwiLCAgICAgc3ByaXRlOiBcImJvd3NlclwiLCAgIGJyYWluOiBcIm5vcm1hbFwiIH1cclxuICB7IGlkOiBcImJvd3NlcmpyXCIsIG5hbWU6IFwiQm93c2VyIEpyXCIsICBzcHJpdGU6IFwiYm93c2VyanJcIiwgYnJhaW46IFwibm9ybWFsXCIgfVxyXG4gIHsgaWQ6IFwia29vcGFcIiwgICAgbmFtZTogXCJLb29wYVwiLCAgICAgIHNwcml0ZTogXCJrb29wYVwiLCAgICBicmFpbjogXCJub3JtYWxcIiB9XHJcbiAgeyBpZDogXCJyb3NhbGluYVwiLCBuYW1lOiBcIlJvc2FsaW5hXCIsICAgc3ByaXRlOiBcInJvc2FsaW5hXCIsIGJyYWluOiBcIm5vcm1hbFwiIH1cclxuICB7IGlkOiBcInNoeWd1eVwiLCAgIG5hbWU6IFwiU2h5Z3V5XCIsICAgICBzcHJpdGU6IFwic2h5Z3V5XCIsICAgYnJhaW46IFwibm9ybWFsXCIgfVxyXG4gIHsgaWQ6IFwidG9hZGV0dGVcIiwgbmFtZTogXCJUb2FkZXR0ZVwiLCAgIHNwcml0ZTogXCJ0b2FkZXR0ZVwiLCBicmFpbjogXCJub3JtYWxcIiB9XHJcbl1cclxuXHJcbmFpQ2hhcmFjdGVycyA9IHt9XHJcbmZvciBjaGFyYWN0ZXIgaW4gYWlDaGFyYWN0ZXJMaXN0XHJcbiAgYWlDaGFyYWN0ZXJzW2NoYXJhY3Rlci5pZF0gPSBjaGFyYWN0ZXJcclxuXHJcbnJhbmRvbUNoYXJhY3RlciA9IC0+XHJcbiAgciA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGFpQ2hhcmFjdGVyTGlzdC5sZW5ndGgpXHJcbiAgcmV0dXJuIGFpQ2hhcmFjdGVyTGlzdFtyXVxyXG5cclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuIyBDYXJkXHJcblxyXG5jbGFzcyBDYXJkXHJcbiAgY29uc3RydWN0b3I6IChAcmF3KSAtPlxyXG4gICAgQHN1aXQgID0gTWF0aC5mbG9vcihAcmF3ICUgNClcclxuICAgIEB2YWx1ZSA9IE1hdGguZmxvb3IoQHJhdyAvIDQpXHJcbiAgICBAdmFsdWVOYW1lID0gc3dpdGNoIEB2YWx1ZVxyXG4gICAgICB3aGVuICA4IHRoZW4gJ0onXHJcbiAgICAgIHdoZW4gIDkgdGhlbiAnUSdcclxuICAgICAgd2hlbiAxMCB0aGVuICdLJ1xyXG4gICAgICB3aGVuIDExIHRoZW4gJ0EnXHJcbiAgICAgIHdoZW4gMTIgdGhlbiAnMidcclxuICAgICAgZWxzZVxyXG4gICAgICAgIFN0cmluZyhAdmFsdWUgKyAzKVxyXG4gICAgQG5hbWUgPSBAdmFsdWVOYW1lICsgU2hvcnRTdWl0TmFtZVtAc3VpdF1cclxuICAgICMgY29uc29sZS5sb2cgXCIje0ByYXd9IC0+ICN7QG5hbWV9XCJcclxuICBnbHlwaGVkTmFtZTogLT5cclxuICAgIHJldHVybiBAdmFsdWVOYW1lICsgR2x5cGhTdWl0TmFtZVtAc3VpdF1cclxuXHJcbmNhcmRzVG9TdHJpbmcgPSAocmF3Q2FyZHMpIC0+XHJcbiAgY2FyZE5hbWVzID0gW11cclxuICBmb3IgcmF3IGluIHJhd0NhcmRzXHJcbiAgICBjYXJkID0gbmV3IENhcmQocmF3KVxyXG4gICAgY2FyZE5hbWVzLnB1c2ggY2FyZC5uYW1lXHJcbiAgcmV0dXJuIFwiWyBcIiArIGNhcmROYW1lcy5qb2luKCcsJykgKyBcIiBdXCJcclxuXHJcbnBsYXlUeXBlVG9TdHJpbmcgPSAodHlwZSkgLT5cclxuICBpZiBtYXRjaGVzID0gdHlwZS5tYXRjaCgvXnJvcChcXGQrKS8pXHJcbiAgICByZXR1cm4gXCJSdW4gb2YgI3ttYXRjaGVzWzFdfSBQYWlyc1wiXHJcbiAgaWYgbWF0Y2hlcyA9IHR5cGUubWF0Y2goL15ydW4oXFxkKykvKVxyXG4gICAgcmV0dXJuIFwiUnVuIG9mICN7bWF0Y2hlc1sxXX1cIlxyXG4gIGlmIG1hdGNoZXMgPSB0eXBlLm1hdGNoKC9ea2luZChcXGQrKS8pXHJcbiAgICBpZiBtYXRjaGVzWzFdID09ICcxJ1xyXG4gICAgICByZXR1cm4gJ1NpbmdsZSdcclxuICAgIGlmIG1hdGNoZXNbMV0gPT0gJzInXHJcbiAgICAgIHJldHVybiAnUGFpcidcclxuICAgIGlmIG1hdGNoZXNbMV0gPT0gJzMnXHJcbiAgICAgIHJldHVybiAnVHJpcHMnXHJcbiAgICByZXR1cm4gJ1F1YWRzJ1xyXG4gIHJldHVybiB0eXBlXHJcblxyXG5wbGF5VG9TdHJpbmcgPSAocGxheSkgLT5cclxuICBoaWdoQ2FyZCA9IG5ldyBDYXJkKHBsYXkuaGlnaClcclxuICByZXR1cm4gXCIje3BsYXlUeXBlVG9TdHJpbmcocGxheS50eXBlKX0gLSAje2hpZ2hDYXJkLmdseXBoZWROYW1lKCl9XCJcclxuXHJcbnBsYXlUb0NhcmRDb3VudCA9IChwbGF5KSAtPlxyXG4gIGlmIG1hdGNoZXMgPSBwbGF5LnR5cGUubWF0Y2goL15yb3AoXFxkKykvKVxyXG4gICAgcmV0dXJuIHBhcnNlSW50KG1hdGNoZXNbMV0pICogMlxyXG4gIGlmIG1hdGNoZXMgPSBwbGF5LnR5cGUubWF0Y2goL15ydW4oXFxkKykvKVxyXG4gICAgcmV0dXJuIHBhcnNlSW50KG1hdGNoZXNbMV0pXHJcbiAgaWYgbWF0Y2hlcyA9IHBsYXkudHlwZS5tYXRjaCgvXmtpbmQoXFxkKykvKVxyXG4gICAgcmV0dXJuIHBhcnNlSW50KG1hdGNoZXNbMV0pXHJcbiAgcmV0dXJuIDEgIyA/P1xyXG5cclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuIyBEZWNrXHJcblxyXG5jbGFzcyBTaHVmZmxlZERlY2tcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgICMgZGF0IGluc2lkZS1vdXQgc2h1ZmZsZSFcclxuICAgIEBjYXJkcyA9IFsgMCBdXHJcbiAgICBmb3IgaSBpbiBbMS4uLjUyXVxyXG4gICAgICBqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogaSlcclxuICAgICAgQGNhcmRzLnB1c2goQGNhcmRzW2pdKVxyXG4gICAgICBAY2FyZHNbal0gPSBpXHJcblxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIEFjaGlldmVtZW50c1xyXG5cclxuYWNoaWV2ZW1lbnRzTGlzdCA9IFtcclxuICB7XHJcbiAgICBpZDogXCJ2ZXRlcmFuXCJcclxuICAgIHRpdGxlOiBcIkkndmUgU2VlbiBTb21lIFRoaW5nc1wiXHJcbiAgICBkZXNjcmlwdGlvbjogW1wiUGxheSA1MCBIYW5kcy5cIl1cclxuICAgIHByb2dyZXNzOiAoYWNoKSAtPlxyXG4gICAgICBpZiBhY2guc3RhdGUudG90YWxHYW1lcyA+PSA1MFxyXG4gICAgICAgIHJldHVybiBcIlRvdGFsIFBsYXllZDogYGFhZmZhYWAje2FjaC5zdGF0ZS50b3RhbEdhbWVzfWBgIEdhbWVzXCJcclxuICAgICAgcmV0dXJuIFwiUHJvZ3Jlc3M6ICN7YWNoLnN0YXRlLnRvdGFsR2FtZXN9IC8gNTBcIlxyXG4gIH1cclxuICB7XHJcbiAgICBpZDogXCJ0cnloYXJkXCJcclxuICAgIHRpdGxlOiBcIlRyeWhhcmRcIlxyXG4gICAgZGVzY3JpcHRpb246IFtcIkVhcm4gYSA1IGdhbWUgd2luIHN0cmVhay5cIl1cclxuICAgIHByb2dyZXNzOiAoYWNoKSAtPlxyXG4gICAgICBiZXN0U3RyZWFrID0gYWNoLnN0YXRlLmJlc3RTdHJlYWtcclxuICAgICAgYmVzdFN0cmVhayA/PSAwXHJcbiAgICAgIGlmIGJlc3RTdHJlYWsgPj0gNVxyXG4gICAgICAgIHJldHVybiBcIkJlc3QgU3RyZWFrOiBgYWFmZmFhYCN7YmVzdFN0cmVha31gYCBXaW5zXCJcclxuICAgICAgcyA9IFwiXCJcclxuICAgICAgaWYgYmVzdFN0cmVhayA+IDFcclxuICAgICAgICBzID0gXCJzXCJcclxuICAgICAgcmV0dXJuIFwiQmVzdCBTdHJlYWs6ICN7YmVzdFN0cmVha30gV2luI3tzfVwiXHJcbiAgfVxyXG4gIHtcclxuICAgIGlkOiBcImJyZWFrZXJcIlxyXG4gICAgdGl0bGU6IFwiU3ByaW5nIEJyZWFrXCJcclxuICAgIGRlc2NyaXB0aW9uOiBbXCJCcmVhayBhIDIuXCJdXHJcbiAgfVxyXG4gIHtcclxuICAgIGlkOiBcImtlZXBpdGxvd1wiXHJcbiAgICB0aXRsZTogXCJLZWVwIEl0IExvdywgQm95c1wiXHJcbiAgICBkZXNjcmlwdGlvbjogW1wiUGxheSBhIFNpbmdsZSAyIG9uIHRvcCBvZiBhIFNpbmdsZSAzLlwiXVxyXG4gIH1cclxuICB7XHJcbiAgICBpZDogXCJzdWl0ZWRcIlxyXG4gICAgdGl0bGU6IFwiRG9lc24ndCBFdmVuIE1hdHRlclwiXHJcbiAgICBkZXNjcmlwdGlvbjogW1wiVGhyb3cgYSBzdWl0ZWQgcnVuLlwiXVxyXG4gIH1cclxuICB7XHJcbiAgICBpZDogXCJ0b255XCJcclxuICAgIHRpdGxlOiBcIlRoZSBUb255XCJcclxuICAgIGRlc2NyaXB0aW9uOiBbXCJUaHJvdyBhIHJ1biBvZiA3IG9yIG1vcmUgY2FyZHMsIGFuZCB0aGVuIGxvc2UuXCJdXHJcbiAgfVxyXG4gIHtcclxuICAgIGlkOiBcInNhbXBsZXJcIlxyXG4gICAgdGl0bGU6IFwiU2FtcGxlciBQbGF0dGVyXCJcclxuICAgIGRlc2NyaXB0aW9uOiBbXCJJbiBhIHNpbmdsZSBoYW5kOiBwbGF5IGF0IGxlYXN0IG9uZSBTaW5nbGUsXCIsIFwib25lIFBhaXIsIG9uZSBUcmlwcywgYW5kIG9uZSBSdW4uXCJdXHJcbiAgfVxyXG4gIHtcclxuICAgIGlkOiBcInRyYWdlZHlcIlxyXG4gICAgdGl0bGU6IFwiVHJhZ2VkeVwiXHJcbiAgICBkZXNjcmlwdGlvbjogW1wiQmVnaW4gdGhlIGdhbWUgYnkgdGhyb3dpbmcgYSB0d28gYnJlYWtlciBpbnZvbHZpbmdcIiwgXCJ0aGUgMyBvZiBTcGFkZXMuXCJdXHJcbiAgfVxyXG4gIHtcclxuICAgIGlkOiBcImluZG9taXRhYmxlXCJcclxuICAgIHRpdGxlOiBcIkluZG9taXRhYmxlXCJcclxuICAgIGRlc2NyaXB0aW9uOiBbXCJUaHJvdyBhIHJ1biBlbmRpbmcgaW4gdGhlIEFjZSBvZiBIZWFydHMuXCJdXHJcbiAgfVxyXG4gIHtcclxuICAgIGlkOiBcInJla3RcIlxyXG4gICAgdGl0bGU6IFwiR2V0IFJla3RcIlxyXG4gICAgZGVzY3JpcHRpb246IFtcIldpbiB3aGlsZSBhbGwgb3Bwb25lbnRzIHN0aWxsIGhhdmUgMTAgb3IgbW9yZSBjYXJkcy5cIl1cclxuICB9XHJcbiAge1xyXG4gICAgaWQ6IFwibGF0ZVwiXHJcbiAgICB0aXRsZTogXCJGYXNoaW9uYWJseSBMYXRlXCJcclxuICAgIGRlc2NyaXB0aW9uOiBbXCJQYXNzIHVudGlsIGFsbCA0IDJzIGFyZSB0aHJvd24sIGFuZCB0aGVuIHdpbi5cIl1cclxuICB9XHJcbiAge1xyXG4gICAgaWQ6IFwicGFpcnNcIlxyXG4gICAgdGl0bGU6IFwiUGFpcmluZyBVcFwiXHJcbiAgICBkZXNjcmlwdGlvbjogW1wiVGhyb3cgNSBwYWlycyBpbiBhIHNpbmdsZSByb3VuZC5cIl1cclxuICB9XHJcbiAge1xyXG4gICAgaWQ6IFwieW91cnNlbGZcIlxyXG4gICAgdGl0bGU6IFwiWW91IFBsYXllZCBZb3Vyc2VsZlwiXHJcbiAgICBkZXNjcmlwdGlvbjogW1wiQmVhdCB5b3VyIG93biBwbGF5LlwiXVxyXG4gIH1cclxuICB7XHJcbiAgICBpZDogXCJ0aGlydGVlblwiXHJcbiAgICB0aXRsZTogXCJUaGlydGVlblwiXHJcbiAgICBkZXNjcmlwdGlvbjogW1wiRWFybiAxMyBhY2hpZXZlbWVudHMuXCJdXHJcbiAgfVxyXG5dXHJcblxyXG5hY2hpZXZlbWVudHNNYXAgPSB7fVxyXG5mb3IgZSBpbiBhY2hpZXZlbWVudHNMaXN0XHJcbiAgYWNoaWV2ZW1lbnRzTWFwW2UuaWRdID0gZVxyXG5cclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuIyBUaGlydGVlblxyXG5cclxuY2xhc3MgVGhpcnRlZW5cclxuICBjb25zdHJ1Y3RvcjogKEBnYW1lLCBwYXJhbXMpIC0+XHJcbiAgICByZXR1cm4gaWYgbm90IHBhcmFtc1xyXG5cclxuICAgIGlmIHBhcmFtcy5zdGF0ZVxyXG4gICAgICBmb3Igayx2IG9mIHBhcmFtcy5zdGF0ZVxyXG4gICAgICAgIGlmIHBhcmFtcy5zdGF0ZS5oYXNPd25Qcm9wZXJ0eShrKVxyXG4gICAgICAgICAgdGhpc1trXSA9IHBhcmFtcy5zdGF0ZVtrXVxyXG4gICAgICBAaW5pdEFjaGlldmVtZW50cygpXHJcbiAgICBlbHNlXHJcbiAgICAgIEBuZXdHYW1lKHBhcmFtcy5tb25leSlcclxuXHJcbiAgaW5pdEFjaGlldmVtZW50czogLT5cclxuICAgIEBhY2ggPz0ge31cclxuICAgIEBhY2guZWFybmVkID89IHt9XHJcbiAgICBAYWNoLnN0YXRlID89IHt9XHJcbiAgICBAYWNoLnN0YXRlLnRvdGFsR2FtZXMgPz0gMFxyXG4gICAgQGZhbmZhcmVzID0gW11cclxuXHJcbiAgZGVhbDogKHBhcmFtcykgLT5cclxuICAgIGRlY2sgPSBuZXcgU2h1ZmZsZWREZWNrKClcclxuICAgIGZvciBwbGF5ZXIsIHBsYXllckluZGV4IGluIEBwbGF5ZXJzXHJcbiAgICAgIEBnYW1lLmxvZyBcImRlYWxpbmcgMTMgY2FyZHMgdG8gcGxheWVyICN7cGxheWVySW5kZXh9XCJcclxuXHJcbiAgICAgIHBsYXllci5wbGFjZSA9IDBcclxuICAgICAgcGxheWVyLmhhbmQgPSBbXVxyXG4gICAgICBmb3IgaiBpbiBbMC4uLjEzXVxyXG4gICAgICAgIHJhdyA9IGRlY2suY2FyZHMuc2hpZnQoKVxyXG4gICAgICAgIGlmIHJhdyA9PSAwXHJcbiAgICAgICAgICBAdHVybiA9IHBsYXllckluZGV4XHJcbiAgICAgICAgcGxheWVyLmhhbmQucHVzaChyYXcpXHJcblxyXG4gICAgICAjIGNvbnNvbGUubG9nIFwiQGdhbWUub3B0aW9ucy5zb3J0SW5kZXggI3tAZ2FtZS5vcHRpb25zLnNvcnRJbmRleH1cIlxyXG4gICAgICBpZiAoQGdhbWUub3B0aW9ucy5zb3J0SW5kZXggPT0gMCkgb3IgcGxheWVyLmFpXHJcbiAgICAgICAgIyBOb3JtYWxcclxuICAgICAgICBwbGF5ZXIuaGFuZC5zb3J0IChhLGIpIC0+IHJldHVybiBhIC0gYlxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgIyBSZXZlcnNlXHJcbiAgICAgICAgcGxheWVyLmhhbmQuc29ydCAoYSxiKSAtPiByZXR1cm4gYiAtIGFcclxuXHJcbiAgICBAaW5pdEFjaGlldmVtZW50cygpXHJcbiAgICBAYWNoLnN0YXRlLnRocmV3U2luZ2xlID0gZmFsc2VcclxuICAgIEBhY2guc3RhdGUudGhyZXdQYWlyID0gZmFsc2VcclxuICAgIEBhY2guc3RhdGUudGhyZXdUcmlwcyA9IGZhbHNlXHJcbiAgICBAYWNoLnN0YXRlLnRocmV3UnVuID0gZmFsc2VcclxuICAgIEBhY2guc3RhdGUudGhyZXdSdW43ID0gZmFsc2VcclxuICAgIEBhY2guc3RhdGUudHdvc1NlZW4gPSAwXHJcbiAgICBAYWNoLnN0YXRlLmZhc2hpb25hYmx5TGF0ZSA9IGZhbHNlXHJcbiAgICBAYWNoLnN0YXRlLnBhaXJzVGhyb3duID0gMFxyXG4gICAgQGFjaC5zdGF0ZS5iZXN0U3RyZWFrID89IDBcclxuXHJcbiAgICBAcGlsZSA9IFtdXHJcbiAgICBAcGlsZVdobyA9IC0xXHJcbiAgICBAdGhyb3dJRCA9IDBcclxuICAgIEBjdXJyZW50UGxheSA9IG51bGxcclxuICAgIEB1bnBhc3NBbGwoKVxyXG5cclxuICAgIGZvck1vbmV5ID0gXCJcIlxyXG4gICAgaWYgQG1vbmV5XHJcbiAgICAgIGZvck1vbmV5ID0gXCIgKGZvciBtb25leSlcIlxyXG4gICAgQG91dHB1dChcIkhhbmQgZGVhbHQje2Zvck1vbmV5fSwgXCIgKyBAcGxheWVyc1tAdHVybl0ubmFtZSArIFwiIHBsYXlzIGZpcnN0XCIpXHJcblxyXG4gICAgcmV0dXJuIE9LXHJcblxyXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgIyBUaGlydGVlbiBtZXRob2RzXHJcblxyXG4gIG5ld0dhbWU6IChtb25leSA9IGZhbHNlKSAtPlxyXG4gICAgIyBuZXcgZ2FtZVxyXG4gICAgQGxvZyA9IFtdXHJcbiAgICBAc3RyZWFrID0gMFxyXG4gICAgQGxhc3RTdHJlYWsgPSAwXHJcbiAgICBAbW9uZXkgPSBmYWxzZVxyXG4gICAgaWYgbW9uZXlcclxuICAgICAgQG1vbmV5ID0gdHJ1ZVxyXG4gICAgY29uc29sZS5sb2cgXCJmb3IgbW9uZXk6ICN7QG1vbmV5fVwiXHJcblxyXG4gICAgQHBsYXllcnMgPSBbXHJcbiAgICAgIHsgaWQ6IDEsIG5hbWU6ICdQbGF5ZXInLCBpbmRleDogMCwgcGFzczogZmFsc2UsIG1vbmV5OiBTVEFSVElOR19NT05FWSB9XHJcbiAgICBdXHJcblxyXG4gICAgZm9yIGkgaW4gWzEuLi40XVxyXG4gICAgICBAYWRkQUkoKVxyXG5cclxuICAgIEBkZWFsKClcclxuXHJcbiAgc2F2ZTogLT5cclxuICAgIG5hbWVzID0gXCJsb2cgcGxheWVycyB0dXJuIHBpbGUgcGlsZVdobyB0aHJvd0lEIGN1cnJlbnRQbGF5IHN0cmVhayBsYXN0U3RyZWFrIGFjaCBtb25leVwiLnNwbGl0KFwiIFwiKVxyXG4gICAgc3RhdGUgPSB7fVxyXG4gICAgZm9yIG5hbWUgaW4gbmFtZXNcclxuICAgICAgc3RhdGVbbmFtZV0gPSB0aGlzW25hbWVdXHJcbiAgICByZXR1cm4gc3RhdGVcclxuXHJcbiAgb3V0cHV0OiAodGV4dCkgLT5cclxuICAgIEBsb2cucHVzaCB0ZXh0XHJcbiAgICB3aGlsZSBAbG9nLmxlbmd0aCA+IE1BWF9MT0dfTElORVNcclxuICAgICAgQGxvZy5zaGlmdCgpXHJcblxyXG4gIGhlYWRsaW5lOiAtPlxyXG4gICAgaWYgQGdhbWVPdmVyKClcclxuICAgICAgcmV0dXJuIFwiR2FtZSBPdmVyXCJcclxuXHJcbiAgICBpZiBAcGlsZS5sZW5ndGggPT0gMFxyXG4gICAgICBwbGF5U3RyaW5nID0gXCJ0aHJvdyBBbnl0aGluZyB3aXRoIHRoZSAzXFx4YzhcIlxyXG4gICAgZWxzZVxyXG4gICAgICBpZiBAY3VycmVudFBsYXlcclxuICAgICAgICBwbGF5U3RyaW5nID0gXCJiZWF0IFwiICsgcGxheVRvU3RyaW5nKEBjdXJyZW50UGxheSlcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHBsYXlTdHJpbmcgPSBcInRocm93IEFueXRoaW5nXCJcclxuXHJcbiAgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxyXG4gICAgaWYgY3VycmVudFBsYXllci5haVxyXG4gICAgICBwbGF5ZXJDb2xvciA9ICdiMGIwMDAnXHJcbiAgICBlbHNlXHJcbiAgICAgIHBsYXllckNvbG9yID0gJ2ZmNzcwMCdcclxuICAgIGhlYWRsaW5lID0gXCJgI3twbGF5ZXJDb2xvcn1gI3tjdXJyZW50UGxheWVyLm5hbWV9YGZmZmZmZmAgdG8gI3twbGF5U3RyaW5nfVwiXHJcbiAgICBpZiBAZXZlcnlvbmVQYXNzZWQoKVxyXG4gICAgICBoZWFkbGluZSArPSBcIiAob3IgdGhyb3cgYW55dGhpbmcpXCJcclxuICAgIHJldHVybiBoZWFkbGluZVxyXG5cclxuICBjYW5UaHJvd0FueXRoaW5nOiAtPlxyXG4gICAgaWYgQHBpbGUubGVuZ3RoID09IDBcclxuICAgICAgcmV0dXJuIHRydWVcclxuICAgIGlmIG5vdCBAY3VycmVudFBsYXlcclxuICAgICAgcmV0dXJuIHRydWVcclxuICAgIGlmIEBldmVyeW9uZVBhc3NlZCgpXHJcbiAgICAgIHJldHVybiB0cnVlXHJcbiAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgZmluZFBsYXllcjogKGlkKSAtPlxyXG4gICAgZm9yIHBsYXllciBpbiBAcGxheWVyc1xyXG4gICAgICBpZiBwbGF5ZXIuaWQgPT0gaWRcclxuICAgICAgICByZXR1cm4gcGxheWVyXHJcbiAgICByZXR1cm4gdW5kZWZpbmVkXHJcblxyXG4gIGN1cnJlbnRQbGF5ZXI6IC0+XHJcbiAgICByZXR1cm4gQHBsYXllcnNbQHR1cm5dXHJcblxyXG4gIGZpbmRQbGFjZTogKHBsYWNlKSAtPlxyXG4gICAgZm9yIHBsYXllciBpbiBAcGxheWVyc1xyXG4gICAgICBpZiAocGxhY2UgPT0gNCkgYW5kIChwbGF5ZXIucGxhY2UgPT0gMClcclxuICAgICAgICByZXR1cm4gcGxheWVyXHJcbiAgICAgIGlmIHBsYXllci5wbGFjZSA9PSBwbGFjZVxyXG4gICAgICAgIHJldHVybiBwbGF5ZXJcclxuICAgIHJldHVybiB1bmRlZmluZWRcclxuXHJcbiAgcGF5b3V0OiAtPlxyXG4gICAgcGxhY2UxID0gQGZpbmRQbGFjZSgxKVxyXG4gICAgcGxhY2UyID0gQGZpbmRQbGFjZSgyKVxyXG4gICAgcGxhY2UzID0gQGZpbmRQbGFjZSgzKVxyXG4gICAgcGxhY2U0ID0gQGZpbmRQbGFjZSg0KVxyXG5cclxuICAgIGlmIG5vdCBwbGFjZTEgb3Igbm90IHBsYWNlMiBvciBub3QgcGxhY2UzIG9yIG5vdCBwbGFjZTRcclxuICAgICAgQG91dHB1dCBcImVycm9yIHdpdGggcGF5b3V0cyFcIlxyXG4gICAgICByZXR1cm5cclxuXHJcbiAgICBAb3V0cHV0IFwiI3twbGFjZTQubmFtZX0gcGF5cyAkMiB0byAje3BsYWNlMS5uYW1lfVwiXHJcbiAgICBAb3V0cHV0IFwiI3twbGFjZTMubmFtZX0gcGF5cyAkMSB0byAje3BsYWNlMi5uYW1lfVwiXHJcblxyXG4gICAgcGxhY2UxLm1vbmV5ICs9IDJcclxuICAgIHBsYWNlMi5tb25leSArPSAxXHJcbiAgICBwbGFjZTMubW9uZXkgKz0gLTFcclxuICAgIHBsYWNlNC5tb25leSArPSAtMlxyXG4gICAgcmV0dXJuXHJcblxyXG4gICMgYWxsIElOQ0xVRElORyB0aGUgY3VycmVudCBwbGF5ZXJcclxuICBlbnRpcmVUYWJsZVBhc3NlZDogLT5cclxuICAgIGZvciBwbGF5ZXIsIHBsYXllckluZGV4IGluIEBwbGF5ZXJzXHJcbiAgICAgIGlmIHBsYXllci5wbGFjZSAhPSAwXHJcbiAgICAgICAgY29udGludWVcclxuICAgICAgaWYgbm90IHBsYXllci5wYXNzXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICAjIGFsbCBidXQgdGhlIGN1cnJlbnQgcGxheWVyXHJcbiAgZXZlcnlvbmVQYXNzZWQ6IC0+XHJcbiAgICBmb3IgcGxheWVyLCBwbGF5ZXJJbmRleCBpbiBAcGxheWVyc1xyXG4gICAgICBpZiAocGxheWVyLnBsYWNlICE9IDApIGFuZCAoQHBpbGVXaG8gIT0gcGxheWVySW5kZXgpXHJcbiAgICAgICAgY29udGludWVcclxuICAgICAgaWYgcGxheWVySW5kZXggPT0gQHR1cm5cclxuICAgICAgICBjb250aW51ZVxyXG4gICAgICBpZiBub3QgcGxheWVyLnBhc3NcclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgIHJldHVybiB0cnVlXHJcblxyXG4gIHBsYXllckFmdGVyOiAoaW5kZXgpIC0+XHJcbiAgICBsb29wXHJcbiAgICAgIGluZGV4ID0gKGluZGV4ICsgMSkgJSBAcGxheWVycy5sZW5ndGhcclxuICAgICAgaWYgQHBsYXllcnNbaW5kZXhdLnBsYWNlID09IDBcclxuICAgICAgICByZXR1cm4gaW5kZXhcclxuICAgIHJldHVybiAwICMgaW1wb3NzaWJsZT9cclxuXHJcbiAgYWRkUGxheWVyOiAocGxheWVyKSAtPlxyXG4gICAgaWYgbm90IHBsYXllci5haVxyXG4gICAgICBwbGF5ZXIuYWkgPSBmYWxzZVxyXG5cclxuICAgIEBwbGF5ZXJzLnB1c2ggcGxheWVyXHJcbiAgICBwbGF5ZXIuaW5kZXggPSBAcGxheWVycy5sZW5ndGggLSAxXHJcbiAgICBAb3V0cHV0KHBsYXllci5uYW1lICsgXCIgam9pbnMgdGhlIGdhbWVcIilcclxuXHJcbiAgbmFtZVByZXNlbnQ6IChuYW1lKSAtPlxyXG4gICAgZm9yIHBsYXllciBpbiBAcGxheWVyc1xyXG4gICAgICBpZiBwbGF5ZXIubmFtZSA9PSBuYW1lXHJcbiAgICAgICAgcmV0dXJuIHRydWVcclxuXHJcbiAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgYWRkQUk6IC0+XHJcbiAgICBsb29wXHJcbiAgICAgIGNoYXJhY3RlciA9IHJhbmRvbUNoYXJhY3RlcigpXHJcbiAgICAgIGlmIG5vdCBAbmFtZVByZXNlbnQoY2hhcmFjdGVyLm5hbWUpXHJcbiAgICAgICAgYnJlYWtcclxuXHJcbiAgICBhaSA9XHJcbiAgICAgIGNoYXJJRDogY2hhcmFjdGVyLmlkXHJcbiAgICAgIG5hbWU6IGNoYXJhY3Rlci5uYW1lXHJcbiAgICAgIGlkOiAnYWknICsgU3RyaW5nKEBwbGF5ZXJzLmxlbmd0aClcclxuICAgICAgcGFzczogZmFsc2VcclxuICAgICAgYWk6IHRydWVcclxuICAgICAgbW9uZXk6IFNUQVJUSU5HX01PTkVZXHJcblxyXG4gICAgQGFkZFBsYXllcihhaSlcclxuXHJcbiAgICBAZ2FtZS5sb2coXCJhZGRlZCBBSSBwbGF5ZXJcIilcclxuICAgIHJldHVybiBPS1xyXG5cclxuICB1cGRhdGVQbGF5ZXJIYW5kOiAoY2FyZHMpIC0+XHJcbiAgICAjIFRoaXMgbWFpbnRhaW5zIHRoZSByZW9yZ2FuaXplZCBvcmRlciBvZiB0aGUgcGxheWVyJ3MgaGFuZFxyXG4gICAgQHBsYXllcnNbMF0uaGFuZCA9IGNhcmRzLnNsaWNlKDApXHJcblxyXG4gIHdpbm5lcjogLT5cclxuICAgIGZvciBwbGF5ZXIsIGkgaW4gQHBsYXllcnNcclxuICAgICAgaWYgcGxheWVyLnBsYWNlID09IDFcclxuICAgICAgICByZXR1cm4gcGxheWVyXHJcbiAgICByZXR1cm4gbnVsbFxyXG5cclxuICBnYW1lT3ZlcjogLT5cclxuICAgIG5wID0gQG5leHRQbGFjZSgpXHJcbiAgICBpZiBAbW9uZXlcclxuICAgICAgcmV0dXJuIChucCA+IDMpXHJcbiAgICByZXR1cm4gKG5wID4gMSlcclxuXHJcbiAgaGFzQ2FyZDogKGhhbmQsIHJhd0NhcmQpIC0+XHJcbiAgICBmb3IgcmF3IGluIGhhbmRcclxuICAgICAgaWYgcmF3ID09IHJhd0NhcmRcclxuICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gIGhhc0NhcmRzOiAoaGFuZCwgcmF3Q2FyZHMpIC0+XHJcbiAgICBmb3IgcmF3IGluIHJhd0NhcmRzXHJcbiAgICAgIGlmIG5vdCBAaGFzQ2FyZChoYW5kLCByYXcpXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICByZW1vdmVDYXJkczogKGhhbmQsIHJhd0NhcmRzKSAtPlxyXG4gICAgbmV3SGFuZCA9IFtdXHJcbiAgICBmb3IgY2FyZCBpbiBoYW5kXHJcbiAgICAgIGtlZXBNZSA9IHRydWVcclxuICAgICAgZm9yIHJhdyBpbiByYXdDYXJkc1xyXG4gICAgICAgIGlmIGNhcmQgPT0gcmF3XHJcbiAgICAgICAgICBrZWVwTWUgPSBmYWxzZVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgaWYga2VlcE1lXHJcbiAgICAgICAgbmV3SGFuZC5wdXNoIGNhcmRcclxuICAgIHJldHVybiBuZXdIYW5kXHJcblxyXG4gIGNsYXNzaWZ5OiAocmF3Q2FyZHMpIC0+XHJcbiAgICBjYXJkcyA9IHJhd0NhcmRzLm1hcCAocmF3KSAtPiBuZXcgQ2FyZChyYXcpXHJcbiAgICBjYXJkcyA9IGNhcmRzLnNvcnQgKGEsIGIpIC0+IHJldHVybiBhLnJhdyAtIGIucmF3XHJcbiAgICBoaWdoZXN0UmF3ID0gY2FyZHNbY2FyZHMubGVuZ3RoIC0gMV0ucmF3XHJcblxyXG4gICAgIyBsb29rIGZvciBhIHJ1biBvZiBwYWlyc1xyXG4gICAgaWYgKGNhcmRzLmxlbmd0aCA+PSA2KSBhbmQgKChjYXJkcy5sZW5ndGggJSAyKSA9PSAwKVxyXG4gICAgICBmb3VuZFJvcCA9IHRydWVcclxuICAgICAgZm9yIGNhcmQsIGNhcmRJbmRleCBpbiBjYXJkc1xyXG4gICAgICAgIGlmIGNhcmRJbmRleCA9PSAwXHJcbiAgICAgICAgICBjb250aW51ZVxyXG4gICAgICAgIGlmIGNhcmQudmFsdWUgPT0gMTJcclxuICAgICAgICAgICMgbm8gMnMgaW4gYSBydW5cclxuICAgICAgICAgIGZvdW5kUm9wID0gZmFsc2VcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgaWYgKGNhcmRJbmRleCAlIDIpID09IDFcclxuICAgICAgICAgICMgb2RkIGNhcmQsIG11c3QgbWF0Y2ggbGFzdCBjYXJkIGV4YWN0bHlcclxuICAgICAgICAgIGlmIGNhcmQudmFsdWUgIT0gKGNhcmRzW2NhcmRJbmRleCAtIDFdLnZhbHVlKVxyXG4gICAgICAgICAgICBmb3VuZFJvcCA9IGZhbHNlXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgIyBldmVuIGNhcmQsIG11c3QgaW5jcmVtZW50XHJcbiAgICAgICAgICBpZiBjYXJkLnZhbHVlICE9IChjYXJkc1tjYXJkSW5kZXggLSAxXS52YWx1ZSArIDEpXHJcbiAgICAgICAgICAgIGZvdW5kUm9wID0gZmFsc2VcclxuICAgICAgICAgICAgYnJlYWtcclxuXHJcbiAgICAgIGlmIGZvdW5kUm9wXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdyb3AnICsgTWF0aC5mbG9vcihjYXJkcy5sZW5ndGggLyAyKVxyXG4gICAgICAgICAgaGlnaDogaGlnaGVzdFJhd1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAjIGxvb2sgZm9yIGEgcnVuXHJcbiAgICBpZiBjYXJkcy5sZW5ndGggPj0gM1xyXG4gICAgICBmb3VuZFJ1biA9IHRydWVcclxuICAgICAgZm9yIGNhcmQsIGNhcmRJbmRleCBpbiBjYXJkc1xyXG4gICAgICAgIGlmIGNhcmRJbmRleCA9PSAwXHJcbiAgICAgICAgICBjb250aW51ZVxyXG4gICAgICAgIGlmIGNhcmQudmFsdWUgPT0gMTJcclxuICAgICAgICAgICMgbm8gMnMgaW4gYSBydW5cclxuICAgICAgICAgIGZvdW5kUnVuID0gZmFsc2VcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgaWYgY2FyZC52YWx1ZSAhPSAoY2FyZHNbY2FyZEluZGV4IC0gMV0udmFsdWUgKyAxKVxyXG4gICAgICAgICAgZm91bmRSdW4gPSBmYWxzZVxyXG4gICAgICAgICAgYnJlYWtcclxuXHJcbiAgICAgIGlmIGZvdW5kUnVuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHR5cGU6ICdydW4nICsgY2FyZHMubGVuZ3RoXHJcbiAgICAgICAgICBoaWdoOiBoaWdoZXN0UmF3XHJcbiAgICAgICAgfVxyXG5cclxuICAgICMgbG9vayBmb3IgWCBvZiBhIGtpbmRcclxuICAgIHJlcVZhbHVlID0gY2FyZHNbMF0udmFsdWVcclxuICAgIGZvciBjYXJkIGluIGNhcmRzXHJcbiAgICAgIGlmIGNhcmQudmFsdWUgIT0gcmVxVmFsdWVcclxuICAgICAgICByZXR1cm4gbnVsbFxyXG4gICAgdHlwZSA9ICdraW5kJyArIGNhcmRzLmxlbmd0aFxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdHlwZTogdHlwZVxyXG4gICAgICBoaWdoOiBoaWdoZXN0UmF3XHJcbiAgICB9XHJcblxyXG4gIGhhbmRIYXMzUzogKGhhbmQpIC0+XHJcbiAgICBmb3IgcmF3IGluIGhhbmRcclxuICAgICAgaWYgcmF3ID09IDBcclxuICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gIG5leHRQbGFjZTogLT5cclxuICAgIGhpZ2hlc3RQbGFjZSA9IDBcclxuICAgIGZvciBwbGF5ZXIgaW4gQHBsYXllcnNcclxuICAgICAgcGxheWVyLnBsYWNlID89IDBcclxuICAgICAgaWYgaGlnaGVzdFBsYWNlIDwgcGxheWVyLnBsYWNlXHJcbiAgICAgICAgaGlnaGVzdFBsYWNlID0gcGxheWVyLnBsYWNlXHJcbiAgICByZXR1cm4gaGlnaGVzdFBsYWNlICsgMVxyXG5cclxuICBzcGxpdFBsYXlUeXBlOiAocGxheVR5cGUpIC0+XHJcbiAgICBpZiBtYXRjaGVzID0gcGxheVR5cGUubWF0Y2goL14oW14wLTldKykoXFxkKykvKVxyXG4gICAgICByZXR1cm4gW21hdGNoZXNbMV0sIHBhcnNlSW50KG1hdGNoZXNbMl0pXVxyXG4gICAgcmV0dXJuIFtwbGF5VHlwZSwgMV1cclxuXHJcbiAgaGFzUGxheTogKGN1cnJlbnRQbGF5LCBoYW5kKSAtPlxyXG4gICAgIyBxdWljayBjaGVjay4gaWYgeW91IGRvbnQgaGF2ZSBlbm91Z2ggY2FyZHMsIHlvdSBjYW4ndCBoYXZlIGEgcGxheVxyXG4gICAgaWYgKHBsYXlUb0NhcmRDb3VudChjdXJyZW50UGxheSkgPiBoYW5kLmxlbmd0aClcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gICAgbGVmdG92ZXJzID0gW11cclxuICAgIHBsYXlzID0ge31cclxuICAgIHNwbCA9IEBzcGxpdFBsYXlUeXBlKGN1cnJlbnRQbGF5LnR5cGUpXHJcbiAgICBzd2l0Y2ggc3BsWzBdXHJcbiAgICAgIHdoZW4gJ3JvcCdcclxuICAgICAgICBsZWZ0b3ZlcnMgPSBAYWlDYWxjUm9wcyhoYW5kLCBwbGF5cywgc3BsWzFdKVxyXG4gICAgICB3aGVuICdydW4nXHJcbiAgICAgICAgbGVmdG92ZXJzID0gQGFpQ2FsY1J1bnMoaGFuZCwgcGxheXMsIGZhbHNlLCBzcGxbMV0pXHJcbiAgICAgIHdoZW4gJ2tpbmQnXHJcbiAgICAgICAgbGVmdG92ZXJzID0gQGFsQ2FsY0tpbmRzKGhhbmQsIHBsYXlzLCB0cnVlKVxyXG5cclxuICAgIHBsYXlzLmtpbmQxID89IFtdXHJcbiAgICBmb3IgbGVmdG92ZXIgaW4gbGVmdG92ZXJzXHJcbiAgICAgIHBsYXlzLmtpbmQxLnB1c2ggW2xlZnRvdmVyXVxyXG5cclxuICAgIGlmIHBsYXlzW2N1cnJlbnRQbGF5LnR5cGVdPyBhbmQgcGxheXNbY3VycmVudFBsYXkudHlwZV0ubGVuZ3RoID4gMFxyXG4gICAgICAgIGZvciBwbGF5IGluIHBsYXlzW2N1cnJlbnRQbGF5LnR5cGVdXHJcbiAgICAgICAgICBpZiBAaGlnaGVzdENhcmQocGxheSkgPiBjdXJyZW50UGxheS5oaWdoXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlXHJcblxyXG4gICAgIyBzcGVjaWFsIGNhc2Uga2luZHNcclxuICAgIGlmIHNwbFswXSA9PSAna2luZCdcclxuICAgICAgIyBjaGVjayBiaWdnZXIga2luZHNcclxuICAgICAgZm9yIGJpZ2dlcktpbmQgaW4gW3NwbFsxXS4uNF1cclxuICAgICAgICBiaWdnZXJUeXBlID0gXCJraW5kI3tiaWdnZXJLaW5kfVwiXHJcbiAgICAgICAgaWYgcGxheXNbYmlnZ2VyVHlwZV0/IGFuZCBwbGF5c1tiaWdnZXJUeXBlXS5sZW5ndGggPiAwXHJcbiAgICAgICAgICAgIGZvciBwbGF5IGluIHBsYXlzW2JpZ2dlclR5cGVdXHJcbiAgICAgICAgICAgICAgaWYgQGhpZ2hlc3RDYXJkKHBsYXkpID4gY3VycmVudFBsYXkuaGlnaFxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuXHJcbiAgICAjIG5vIHBsYXlzLCBwYXNzXHJcbiAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgY2FuUGFzczogKHBhcmFtcykgLT5cclxuICAgIGlmIEBnYW1lT3ZlcigpXHJcbiAgICAgIHJldHVybiAnZ2FtZU92ZXInXHJcblxyXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcclxuICAgIGlmIHBhcmFtcy5pZCAhPSBjdXJyZW50UGxheWVyLmlkXHJcbiAgICAgIHJldHVybiAnbm90WW91clR1cm4nXHJcblxyXG4gICAgaWYgQHBpbGUubGVuZ3RoID09IDBcclxuICAgICAgcmV0dXJuICdtdXN0VGhyb3czUydcclxuXHJcbiAgICBpZiBAZXZlcnlvbmVQYXNzZWQoKVxyXG4gICAgICByZXR1cm4gJ3Rocm93QW55dGhpbmcnXHJcblxyXG4gICAgcmV0dXJuIE9LXHJcblxyXG4gIGNhblBsYXk6IChwYXJhbXMsIGluY29taW5nUGxheSwgaGFuZEhhczNTKSAtPlxyXG4gICAgaWYgQGdhbWVPdmVyKClcclxuICAgICAgcmV0dXJuICdnYW1lT3ZlcidcclxuXHJcbiAgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxyXG4gICAgaWYgcGFyYW1zLmlkICE9IGN1cnJlbnRQbGF5ZXIuaWRcclxuICAgICAgcmV0dXJuICdub3RZb3VyVHVybidcclxuXHJcbiAgICBpZiBpbmNvbWluZ1BsYXkgPT0gbnVsbFxyXG4gICAgICByZXR1cm4gJ2ludmFsaWRQbGF5J1xyXG5cclxuICAgIGlmIEBwaWxlLmxlbmd0aCA9PSAwXHJcbiAgICAgIGlmIG5vdCBoYW5kSGFzM1NcclxuICAgICAgICByZXR1cm4gJ211c3RUaHJvdzNTJ1xyXG5cclxuICAgIGN1cnJlbnRQbGF5ZXIgPSBAY3VycmVudFBsYXllcigpXHJcbiAgICBpZiBjdXJyZW50UGxheWVyLnBhc3NcclxuICAgICAgaWYgQGN1cnJlbnRQbGF5IGFuZCBAY2FuQmVCcm9rZW4oQGN1cnJlbnRQbGF5KVxyXG4gICAgICAgIGlmIEBpc0JyZWFrZXJUeXBlKGluY29taW5nUGxheS50eXBlKVxyXG4gICAgICAgICAgcmV0dXJuIE9LXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgcmV0dXJuICdtdXN0QnJlYWtPclBhc3MnXHJcbiAgICAgIHJldHVybiAnbXVzdFBhc3MnXHJcblxyXG4gICAgaWYgQGN1cnJlbnRQbGF5ID09IG51bGxcclxuICAgICAgcmV0dXJuIE9LXHJcblxyXG4gICAgaWYgQGV2ZXJ5b25lUGFzc2VkKClcclxuICAgICAgcmV0dXJuIE9LXHJcblxyXG4gICAgaWYgQGNhbkJlQnJva2VuKEBjdXJyZW50UGxheSkgYW5kIEBpc0JyZWFrZXJUeXBlKGluY29taW5nUGxheS50eXBlKVxyXG4gICAgICAjIDIgYnJlYWtlciFcclxuICAgICAgcmV0dXJuIE9LXHJcblxyXG4gICAgaWYgaW5jb21pbmdQbGF5LnR5cGUgIT0gQGN1cnJlbnRQbGF5LnR5cGVcclxuICAgICAgcmV0dXJuICd3cm9uZ1BsYXknXHJcblxyXG4gICAgaWYgaW5jb21pbmdQbGF5LmhpZ2ggPCBAY3VycmVudFBsYXkuaGlnaFxyXG4gICAgICByZXR1cm4gJ3Rvb0xvd1BsYXknXHJcblxyXG4gICAgcmV0dXJuIE9LXHJcblxyXG4gIHBsYXk6IChwYXJhbXMpIC0+XHJcbiAgICBpbmNvbWluZ1BsYXkgPSBAY2xhc3NpZnkocGFyYW1zLmNhcmRzKVxyXG4gICAgY29uc29sZS5sb2cgXCJpbmNvbWluZ1BsYXlcIiwgaW5jb21pbmdQbGF5XHJcblxyXG4gICAgY29uc29sZS5sb2cgXCJzb21lb25lIGNhbGxpbmcgcGxheVwiLCBwYXJhbXNcclxuICAgIHJldCA9IEBjYW5QbGF5KHBhcmFtcywgaW5jb21pbmdQbGF5LCBAaGFuZEhhczNTKHBhcmFtcy5jYXJkcykpXHJcbiAgICBpZiByZXQgIT0gT0tcclxuICAgICAgcmV0dXJuIHJldFxyXG5cclxuICAgIGJyZWFrZXJUaHJvd24gPSBmYWxzZVxyXG4gICAgbmV3VGhyb3cgPSB0cnVlXHJcblxyXG4gICAgIyBUT0RPOiBtYWtlIHByZXR0eSBuYW1lcyBiYXNlZCBvbiB0aGUgcGxheSwgYWRkIHBsYXkgdG8gaGVhZGxpbmVcclxuICAgIHZlcmIgPSBcInRocm93czpcIlxyXG4gICAgaWYgQGN1cnJlbnRQbGF5XHJcbiAgICAgIGlmIEBjYW5CZUJyb2tlbihAY3VycmVudFBsYXkpIGFuZCBAaXNCcmVha2VyVHlwZShpbmNvbWluZ1BsYXkudHlwZSlcclxuICAgICAgICAjIDIgYnJlYWtlciFcclxuICAgICAgICBAdW5wYXNzQWxsKClcclxuICAgICAgICB2ZXJiID0gXCJicmVha3MgMjpcIlxyXG4gICAgICAgIGJyZWFrZXJUaHJvd24gPSB0cnVlXHJcbiAgICAgICAgbmV3VGhyb3cgPSBmYWxzZVxyXG4gICAgICBlbHNlIGlmIChpbmNvbWluZ1BsYXkudHlwZSAhPSBAY3VycmVudFBsYXkudHlwZSkgb3IgKGluY29taW5nUGxheS5oaWdoIDwgQGN1cnJlbnRQbGF5LmhpZ2gpXHJcbiAgICAgICAgIyBOZXcgcGxheSFcclxuICAgICAgICBAdW5wYXNzQWxsKClcclxuICAgICAgICB2ZXJiID0gXCJ0aHJvd3MgbmV3OlwiXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBuZXdUaHJvdyA9IGZhbHNlXHJcbiAgICBlbHNlXHJcbiAgICAgIHZlcmIgPSBcImJlZ2luczpcIlxyXG5cclxuICAgICMgQWNoaWV2ZW1lbnRzXHJcbiAgICBAYWNoLnN0YXRlLnR3b3NTZWVuID89IDBcclxuICAgIEBhY2guc3RhdGUucGFpcnNUaHJvd24gPz0gMFxyXG4gICAgZm9yIGNhcmQgaW4gcGFyYW1zLmNhcmRzXHJcbiAgICAgIGlmIGNhcmQgPj0gNDhcclxuICAgICAgICBAYWNoLnN0YXRlLnR3b3NTZWVuICs9IDFcclxuICAgIGlmIChAYWNoLnN0YXRlLnR3b3NTZWVuID09IDQpIGFuZCAoQHBsYXllcnNbMF0uaGFuZC5sZW5ndGggPT0gMTMpXHJcbiAgICAgIEBhY2guc3RhdGUuZmFzaGlvbmFibHlMYXRlID0gdHJ1ZVxyXG4gICAgY29uc29sZS5sb2cgXCJAYWNoLnN0YXRlLmZhc2hpb25hYmx5TGF0ZSAje0BhY2guc3RhdGUuZmFzaGlvbmFibHlMYXRlfVwiXHJcbiAgICBpZiBAdHVybiA9PSAwXHJcbiAgICAgIGlmIEBldmVyeW9uZVBhc3NlZCgpIGFuZCBub3QgbmV3VGhyb3dcclxuICAgICAgICBAZWFybiBcInlvdXJzZWxmXCJcclxuICAgICAgaWYgaW5jb21pbmdQbGF5LnR5cGUgPT0gJ2tpbmQyJ1xyXG4gICAgICAgIEBhY2guc3RhdGUucGFpcnNUaHJvd24gKz0gMVxyXG4gICAgICAgIGlmIEBhY2guc3RhdGUucGFpcnNUaHJvd24gPj0gNVxyXG4gICAgICAgICAgQGVhcm4gXCJwYWlyc1wiXHJcbiAgICAgIGlmIGJyZWFrZXJUaHJvd25cclxuICAgICAgICBAZWFybiBcImJyZWFrZXJcIlxyXG4gICAgICBpZiBAaXNCcmVha2VyVHlwZShpbmNvbWluZ1BsYXkudHlwZSkgYW5kIChAcGlsZS5sZW5ndGggPT0gMClcclxuICAgICAgICBAZWFybiBcInRyYWdlZHlcIlxyXG4gICAgICBpZiBAaXNSdW5UeXBlKGluY29taW5nUGxheS50eXBlKSBhbmQgQGlzU3VpdGVkKHBhcmFtcy5jYXJkcylcclxuICAgICAgICBAZWFybiBcInN1aXRlZFwiXHJcbiAgICAgIGlmIEBjdXJyZW50UGxheSBhbmQgKEBjdXJyZW50UGxheS50eXBlID09ICdraW5kMScpIGFuZCAoQGN1cnJlbnRQbGF5LmhpZ2ggPD0gMykgYW5kIChpbmNvbWluZ1BsYXkudHlwZSA9PSAna2luZDEnKSBhbmQgKGluY29taW5nUGxheS5oaWdoID49IDQ4KVxyXG4gICAgICAgIEBlYXJuIFwia2VlcGl0bG93XCJcclxuICAgICAgaWYgQGlzUnVuVHlwZShpbmNvbWluZ1BsYXkudHlwZSkgYW5kIChpbmNvbWluZ1BsYXkuaGlnaCA9PSA0NykgIyBBY2Ugb2YgSGVhcnRzXHJcbiAgICAgICAgQGVhcm4gXCJpbmRvbWl0YWJsZVwiXHJcbiAgICAgIGlmIEBpc0JpZ1J1bihpbmNvbWluZ1BsYXksIDcpXHJcbiAgICAgICAgY29uc29sZS5sb2cgXCJ0aHJld1J1bjc6IHRydWVcIlxyXG4gICAgICAgIEBhY2guc3RhdGUudGhyZXdSdW43ID0gdHJ1ZVxyXG4gICAgICBpZiBpbmNvbWluZ1BsYXkudHlwZSA9PSAna2luZDEnXHJcbiAgICAgICAgQGFjaC5zdGF0ZS50aHJld1NpbmdsZSA9IHRydWVcclxuICAgICAgaWYgaW5jb21pbmdQbGF5LnR5cGUgPT0gJ2tpbmQyJ1xyXG4gICAgICAgIEBhY2guc3RhdGUudGhyZXdQYWlyID0gdHJ1ZVxyXG4gICAgICBpZiBpbmNvbWluZ1BsYXkudHlwZSA9PSAna2luZDMnXHJcbiAgICAgICAgQGFjaC5zdGF0ZS50aHJld1RyaXBzID0gdHJ1ZVxyXG4gICAgICBpZiBpbmNvbWluZ1BsYXkudHlwZS5tYXRjaCgvXnJ1bi8pXHJcbiAgICAgICAgQGFjaC5zdGF0ZS50aHJld1J1biA9IHRydWVcclxuICAgICAgaWYgQGFjaC5zdGF0ZS50aHJld1NpbmdsZSBhbmQgQGFjaC5zdGF0ZS50aHJld1BhaXIgYW5kIEBhY2guc3RhdGUudGhyZXdUcmlwcyBhbmQgQGFjaC5zdGF0ZS50aHJld1J1blxyXG4gICAgICAgIEBlYXJuIFwic2FtcGxlclwiXHJcblxyXG4gICAgQGN1cnJlbnRQbGF5ID0gaW5jb21pbmdQbGF5XHJcblxyXG4gICAgQHRocm93SUQgKz0gMVxyXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcclxuICAgIGN1cnJlbnRQbGF5ZXIuaGFuZCA9IEByZW1vdmVDYXJkcyhjdXJyZW50UGxheWVyLmhhbmQsIHBhcmFtcy5jYXJkcylcclxuXHJcbiAgICBAb3V0cHV0KFwiI3tjdXJyZW50UGxheWVyLm5hbWV9ICN7dmVyYn0gI3twbGF5VG9TdHJpbmcoaW5jb21pbmdQbGF5KX1cIilcclxuXHJcbiAgICBpZiBjdXJyZW50UGxheWVyLmhhbmQubGVuZ3RoID09IDBcclxuICAgICAgIyBHYW1lIG92ZXIhIGRvIGdhbWVvdmVyIHRoaW5ncy5cclxuXHJcbiAgICAgIGN1cnJlbnRQbGF5ZXIucGxhY2UgPSBAbmV4dFBsYWNlKClcclxuXHJcbiAgICAgIGlmIEBtb25leVxyXG4gICAgICAgIHBsYWNlU3RyaW5nID0gXCI0dGhcIlxyXG4gICAgICAgIGlmIGN1cnJlbnRQbGF5ZXIucGxhY2UgPT0gMVxyXG4gICAgICAgICAgcGxhY2VTdHJpbmcgPSBcIjFzdFwiXHJcbiAgICAgICAgZWxzZSBpZiBjdXJyZW50UGxheWVyLnBsYWNlID09IDJcclxuICAgICAgICAgIHBsYWNlU3RyaW5nID0gXCIybmRcIlxyXG4gICAgICAgIGVsc2UgaWYgY3VycmVudFBsYXllci5wbGFjZSA9PSAzXHJcbiAgICAgICAgICBwbGFjZVN0cmluZyA9IFwiM3JkXCJcclxuICAgICAgICBAb3V0cHV0KFwiI3tjdXJyZW50UGxheWVyLm5hbWV9IHRha2VzICN7cGxhY2VTdHJpbmd9IHBsYWNlXCIpXHJcblxyXG4gICAgICAgIGlmIGN1cnJlbnRQbGF5ZXIucGxhY2UgPT0gM1xyXG4gICAgICAgICAgQHBheW91dCgpXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBAb3V0cHV0KFwiI3tjdXJyZW50UGxheWVyLm5hbWV9IHdpbnMhXCIpXHJcblxyXG4gICAgICBpZiBjdXJyZW50UGxheWVyLnBsYWNlID09IDFcclxuICAgICAgICBpZiBAdHVybiA9PSAwXHJcbiAgICAgICAgICBAc3RyZWFrICs9IDFcclxuICAgICAgICAgIEBsYXN0U3RyZWFrID0gQHN0cmVha1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIEBsYXN0U3RyZWFrID0gQHN0cmVha1xyXG4gICAgICAgICAgQHN0cmVhayA9IDBcclxuXHJcbiAgICAgIEBhY2guc3RhdGUuYmVzdFN0cmVhayA/PSAwXHJcbiAgICAgIGlmIEBhY2guc3RhdGUuYmVzdFN0cmVhayA8IEBsYXN0U3RyZWFrXHJcbiAgICAgICAgQGFjaC5zdGF0ZS5iZXN0U3RyZWFrID0gQGxhc3RTdHJlYWtcclxuXHJcbiAgICAgICMgQWNoaWV2ZW1lbnRzXHJcbiAgICAgIGlmIEBhY2guc3RhdGUuYmVzdFN0cmVhayA+PSA1XHJcbiAgICAgICAgQGVhcm4gXCJ0cnloYXJkXCJcclxuICAgICAgQGFjaC5zdGF0ZS50b3RhbEdhbWVzICs9IDFcclxuICAgICAgaWYgQGFjaC5zdGF0ZS50b3RhbEdhbWVzID49IDUwXHJcbiAgICAgICAgQGVhcm4gXCJ2ZXRlcmFuXCJcclxuICAgICAgaWYgY3VycmVudFBsYXllci5wbGFjZSA9PSAxXHJcbiAgICAgICAgaWYgQHR1cm4gPT0gMFxyXG4gICAgICAgICAgIyBwbGF5ZXIgd29uXHJcbiAgICAgICAgICBpZiAoQHBsYXllcnNbMV0uaGFuZC5sZW5ndGggPj0gMTApIGFuZCAoQHBsYXllcnNbMl0uaGFuZC5sZW5ndGggPj0gMTApIGFuZCAoQHBsYXllcnNbM10uaGFuZC5sZW5ndGggPj0gMTApXHJcbiAgICAgICAgICAgIEBlYXJuIFwicmVrdFwiXHJcbiAgICAgICAgICBpZiBAYWNoLnN0YXRlLmZhc2hpb25hYmx5TGF0ZVxyXG4gICAgICAgICAgICBAZWFybiBcImxhdGVcIlxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICMgcGxheWVyIGxvc3RcclxuICAgICAgICAgIGlmIEBhY2guc3RhdGUudGhyZXdSdW43XHJcbiAgICAgICAgICAgIEBlYXJuIFwidG9ueVwiXHJcblxyXG4gICAgYWNoaWV2ZW1lbnRDb3VudCA9IDBcclxuICAgIGZvciBhY2hpZXZlbWVudCBpbiBhY2hpZXZlbWVudHNMaXN0XHJcbiAgICAgIGlmIEBhY2guZWFybmVkW2FjaGlldmVtZW50LmlkXVxyXG4gICAgICAgIGFjaGlldmVtZW50Q291bnQgKz0gMVxyXG4gICAgaWYgYWNoaWV2ZW1lbnRDb3VudCA+PSAxM1xyXG4gICAgICBAZWFybiBcInRoaXJ0ZWVuXCJcclxuXHJcbiAgICBAcGlsZSA9IHBhcmFtcy5jYXJkcy5zbGljZSgwKVxyXG4gICAgQHBpbGVXaG8gPSBAdHVyblxyXG5cclxuICAgIEB0dXJuID0gQHBsYXllckFmdGVyKEB0dXJuKVxyXG4gICAgcmV0dXJuIE9LXHJcblxyXG4gIHVucGFzc0FsbDogLT5cclxuICAgIGZvciBwbGF5ZXIgaW4gQHBsYXllcnNcclxuICAgICAgcGxheWVyLnBhc3MgPSBmYWxzZVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHBhc3M6IChwYXJhbXMpIC0+XHJcbiAgICByZXQgPSBAY2FuUGFzcyhwYXJhbXMpXHJcbiAgICBpZiByZXQgIT0gT0tcclxuICAgICAgcmV0dXJuIHJldFxyXG5cclxuICAgIGN1cnJlbnRQbGF5ZXIgPSBAY3VycmVudFBsYXllcigpXHJcbiAgICBpZiBub3QgY3VycmVudFBsYXllci5haSBhbmQgQGN1cnJlbnRQbGF5IGFuZCBub3QgQGhhc1BsYXkoQGN1cnJlbnRQbGF5LCBjdXJyZW50UGxheWVyLmhhbmQpXHJcbiAgICAgIEBvdXRwdXQoXCIje2N1cnJlbnRQbGF5ZXIubmFtZX0gYXV0by1wYXNzZXMgKG5vIHBsYXlzKVwiKVxyXG4gICAgZWxzZSBpZiBjdXJyZW50UGxheWVyLnBhc3NcclxuICAgICAgQG91dHB1dChcIiN7Y3VycmVudFBsYXllci5uYW1lfSBhdXRvLXBhc3Nlc1wiKVxyXG4gICAgZWxzZVxyXG4gICAgICBAb3V0cHV0KFwiI3tjdXJyZW50UGxheWVyLm5hbWV9IHBhc3Nlc1wiKVxyXG4gICAgY3VycmVudFBsYXllci5wYXNzID0gdHJ1ZVxyXG4gICAgQHR1cm4gPSBAcGxheWVyQWZ0ZXIoQHR1cm4pXHJcbiAgICByZXR1cm4gT0tcclxuXHJcbiAgYWlQbGF5OiAoY3VycmVudFBsYXllciwgY2FyZHMpIC0+XHJcbiAgICByZXR1cm4gQHBsYXkoeydpZCc6Y3VycmVudFBsYXllci5pZCwgJ2NhcmRzJzpjYXJkc30pXHJcblxyXG4gIGFpUGFzczogKGN1cnJlbnRQbGF5ZXIpIC0+XHJcbiAgICByZXR1cm4gQHBhc3MoeydpZCc6Y3VycmVudFBsYXllci5pZH0pXHJcblxyXG4gIGVhcm46IChpZCkgLT5cclxuICAgIGlmIEBhY2guZWFybmVkW2lkXVxyXG4gICAgICByZXR1cm5cclxuICAgIGFjaGlldmVtZW50ID0gYWNoaWV2ZW1lbnRzTWFwW2lkXVxyXG4gICAgaWYgbm90IGFjaGlldmVtZW50P1xyXG4gICAgICByZXR1cm5cclxuXHJcbiAgICBAYWNoLmVhcm5lZFtpZF0gPSB0cnVlXHJcbiAgICBAb3V0cHV0KFwiRWFybmVkOiAje2FjaGlldmVtZW50LnRpdGxlfVwiKVxyXG4gICAgQGZhbmZhcmVzLnB1c2ggYWNoaWV2ZW1lbnQudGl0bGVcclxuXHJcblxyXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgIyBBSVxyXG5cclxuICAjIEdlbmVyaWMgbG9nZ2luZyBmdW5jdGlvbjsgcHJlcGVuZHMgY3VycmVudCBBSSBwbGF5ZXIncyBndXRzIGJlZm9yZSBwcmludGluZyB0ZXh0XHJcbiAgYWlMb2c6ICh0ZXh0KSAtPlxyXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcclxuICAgIGlmIG5vdCBjdXJyZW50UGxheWVyLmFpXHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG5cclxuICAgIGNoYXJhY3RlciA9IGFpQ2hhcmFjdGVyc1tjdXJyZW50UGxheWVyLmNoYXJJRF1cclxuICAgIEBnYW1lLmxvZygnQUlbJytjdXJyZW50UGxheWVyLm5hbWUrJyAnK2NoYXJhY3Rlci5icmFpbisnXTogaGFuZDonK2NhcmRzVG9TdHJpbmcoY3VycmVudFBsYXllci5oYW5kKSsnIHBpbGU6JytjYXJkc1RvU3RyaW5nKEBwaWxlKSsnICcrdGV4dClcclxuXHJcbiAgIyBEZXRlY3RzIGlmIHRoZSBjdXJyZW50IHBsYXllciBpcyBBSSBkdXJpbmcgYSBCSUQgb3IgVFJJQ0sgcGhhc2UgYW5kIGFjdHMgYWNjb3JkaW5nIHRvIHRoZWlyICdicmFpbidcclxuICBhaVRpY2s6IC0+XHJcbiAgICBpZiBAZ2FtZU92ZXIoKVxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgICBpZiBAZW50aXJlVGFibGVQYXNzZWQoKVxyXG4gICAgICBAdHVybiA9IEBwbGF5ZXJBZnRlcihAcGlsZVdobylcclxuICAgICAgQHVucGFzc0FsbCgpXHJcbiAgICAgIEBjdXJyZW50UGxheSA9IG51bGxcclxuICAgICAgQG91dHB1dCgnV2hvbGUgdGFibGUgcGFzc2VzLCBjb250cm9sIHRvICcgKyBAcGxheWVyc1tAdHVybl0ubmFtZSlcclxuXHJcbiAgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxyXG4gICAgaWYgbm90IGN1cnJlbnRQbGF5ZXIuYWlcclxuICAgICAgaWYgbm90IEBjYW5UaHJvd0FueXRoaW5nKClcclxuICAgICAgICBpZiBAY3VycmVudFBsYXkgYW5kIChAY3VycmVudFBsYXkudHlwZSA9PSAna2luZDEnKSBhbmQgQGhhc0JyZWFrZXIoY3VycmVudFBsYXllci5oYW5kKVxyXG4gICAgICAgICAgIyBkbyBub3RoaW5nLCBwbGF5ZXIgY2FuIGRyb3AgYSBicmVha2VyXHJcbiAgICAgICAgZWxzZSBpZiBAY3VycmVudFBsYXkgYW5kIG5vdCBAaGFzUGxheShAY3VycmVudFBsYXksIGN1cnJlbnRQbGF5ZXIuaGFuZClcclxuICAgICAgICAgIEBhaUxvZyhcImF1dG9wYXNzaW5nIGZvciBwbGF5ZXIsIG5vIHBsYXlzXCIpXHJcbiAgICAgICAgICBAYWlQYXNzKGN1cnJlbnRQbGF5ZXIpXHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgIGVsc2UgaWYgY3VycmVudFBsYXllci5wYXNzXHJcbiAgICAgICAgICBAYWlMb2coXCJhdXRvcGFzc2luZyBmb3IgcGxheWVyXCIpXHJcbiAgICAgICAgICBAYWlQYXNzKGN1cnJlbnRQbGF5ZXIpXHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgICBjaGFyYWN0ZXIgPSBhaUNoYXJhY3RlcnNbY3VycmVudFBsYXllci5jaGFySURdXHJcbiAgICByZXQgPSBAYnJhaW5zW2NoYXJhY3Rlci5icmFpbl0ucGxheS5hcHBseSh0aGlzLCBbY3VycmVudFBsYXllciwgQGN1cnJlbnRQbGF5LCBAZXZlcnlvbmVQYXNzZWQoKV0pXHJcbiAgICBpZiByZXQgPT0gT0tcclxuICAgICAgcmV0dXJuIHRydWVcclxuICAgIHJldHVybiBmYWxzZVxyXG5cclxuICBhbENhbGNLaW5kczogKGhhbmQsIHBsYXlzLCBtYXRjaDJzID0gZmFsc2UpIC0+XHJcbiAgICBjYXJkcyA9IGhhbmQubWFwIChyYXcpIC0+IG5ldyBDYXJkKHJhdylcclxuICAgIGNhcmRzID0gY2FyZHMuc29ydCAoYSwgYikgLT4gcmV0dXJuIGEucmF3IC0gYi5yYXdcclxuICAgIHZhbHVlQXJyYXlzID0gW11cclxuICAgIGZvciBpIGluIFswLi4uMTNdXHJcbiAgICAgIHZhbHVlQXJyYXlzLnB1c2ggW11cclxuICAgIGZvciBjYXJkIGluIGNhcmRzXHJcbiAgICAgIHZhbHVlQXJyYXlzW2NhcmQudmFsdWVdLnB1c2goY2FyZClcclxuXHJcbiAgICBoYW5kID0gW11cclxuICAgIGZvciB2YWx1ZUFycmF5LCB2YWx1ZSBpbiB2YWx1ZUFycmF5c1xyXG4gICAgICBpZiAodmFsdWVBcnJheS5sZW5ndGggPiAxKSBhbmQgKG1hdGNoMnMgb3IgKHZhbHVlIDwgMTIpKVxyXG4gICAgICAgIGtleSA9IFwia2luZCN7dmFsdWVBcnJheS5sZW5ndGh9XCJcclxuICAgICAgICBwbGF5c1trZXldID89IFtdXHJcbiAgICAgICAgcGxheXNba2V5XS5wdXNoIHZhbHVlQXJyYXkubWFwICh2KSAtPiB2LnJhd1xyXG4gICAgICBlbHNlXHJcbiAgICAgICAgZm9yIHYgaW4gdmFsdWVBcnJheVxyXG4gICAgICAgICAgaGFuZC5wdXNoIHYucmF3XHJcblxyXG4gICAgcmV0dXJuIGhhbmRcclxuXHJcbiAgYWlGaW5kUnVuczogKGhhbmQsIGVhY2hTaXplLCBzaXplKSAtPlxyXG4gICAgcnVucyA9IFtdXHJcblxyXG4gICAgY2FyZHMgPSBoYW5kLm1hcCAocmF3KSAtPiBuZXcgQ2FyZChyYXcpXHJcbiAgICBjYXJkcyA9IGNhcmRzLnNvcnQgKGEsIGIpIC0+IHJldHVybiBhLnJhdyAtIGIucmF3XHJcbiAgICB2YWx1ZUFycmF5cyA9IFtdXHJcbiAgICBmb3IgaSBpbiBbMC4uLjEzXVxyXG4gICAgICB2YWx1ZUFycmF5cy5wdXNoIFtdXHJcbiAgICBmb3IgY2FyZCBpbiBjYXJkc1xyXG4gICAgICB2YWx1ZUFycmF5c1tjYXJkLnZhbHVlXS5wdXNoKGNhcmQpXHJcblxyXG4gICAgbGFzdFN0YXJ0aW5nVmFsdWUgPSAxMiAtIHNpemVcclxuICAgIGZvciBzdGFydGluZ1ZhbHVlIGluIFswLi4ubGFzdFN0YXJ0aW5nVmFsdWVdXHJcbiAgICAgIHJ1bkZvdW5kID0gdHJ1ZVxyXG4gICAgICBmb3Igb2Zmc2V0IGluIFswLi4uc2l6ZV1cclxuICAgICAgICBpZiB2YWx1ZUFycmF5c1tzdGFydGluZ1ZhbHVlK29mZnNldF0ubGVuZ3RoIDwgZWFjaFNpemVcclxuICAgICAgICAgIHJ1bkZvdW5kID0gZmFsc2VcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgIGlmIHJ1bkZvdW5kXHJcbiAgICAgICAgcnVuID0gW11cclxuICAgICAgICBmb3Igb2Zmc2V0IGluIFswLi4uc2l6ZV1cclxuICAgICAgICAgIGZvciBlYWNoIGluIFswLi4uZWFjaFNpemVdXHJcbiAgICAgICAgICAgIHJ1bi5wdXNoKHZhbHVlQXJyYXlzW3N0YXJ0aW5nVmFsdWUrb2Zmc2V0XS5wb3AoKS5yYXcpXHJcbiAgICAgICAgcnVucy5wdXNoIHJ1blxyXG5cclxuICAgIGxlZnRvdmVycyA9IFtdXHJcbiAgICBmb3IgdmFsdWVBcnJheSBpbiB2YWx1ZUFycmF5c1xyXG4gICAgICBmb3IgY2FyZCBpbiB2YWx1ZUFycmF5XHJcbiAgICAgICAgbGVmdG92ZXJzLnB1c2ggY2FyZC5yYXdcclxuXHJcbiAgICByZXR1cm4gW3J1bnMsIGxlZnRvdmVyc11cclxuXHJcbiAgYWlDYWxjUnVuczogKGhhbmQsIHBsYXlzLCBzbWFsbFJ1bnMsIHNpbmdsZVNpemUgPSBudWxsKSAtPlxyXG4gICAgaWYgc2luZ2xlU2l6ZSAhPSBudWxsXHJcbiAgICAgICAgc3RhcnRTaXplID0gc2luZ2xlU2l6ZVxyXG4gICAgICAgIGVuZFNpemUgPSBzaW5nbGVTaXplXHJcbiAgICAgICAgYnlBbW91bnQgPSAxXHJcbiAgICBlbHNlXHJcbiAgICAgIGlmIHNtYWxsUnVuc1xyXG4gICAgICAgIHN0YXJ0U2l6ZSA9IDNcclxuICAgICAgICBlbmRTaXplID0gMTJcclxuICAgICAgICBieUFtb3VudCA9IDFcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHN0YXJ0U2l6ZSA9IDEyXHJcbiAgICAgICAgZW5kU2l6ZSA9IDNcclxuICAgICAgICBieUFtb3VudCA9IC0xXHJcbiAgICBmb3IgcnVuU2l6ZSBpbiBbc3RhcnRTaXplLi5lbmRTaXplXSBieSBieUFtb3VudFxyXG4gICAgICBbcnVucywgbGVmdG92ZXJzXSA9IEBhaUZpbmRSdW5zKGhhbmQsIDEsIHJ1blNpemUpXHJcbiAgICAgIGlmIHJ1bnMubGVuZ3RoID4gMFxyXG4gICAgICAgIGtleSA9IFwicnVuI3tydW5TaXplfVwiXHJcbiAgICAgICAgcGxheXNba2V5XSA9IHJ1bnNcclxuICAgICAgaGFuZCA9IGxlZnRvdmVyc1xyXG5cclxuICAgIHJldHVybiBoYW5kXHJcblxyXG4gIGFpQ2FsY1JvcHM6IChoYW5kLCBwbGF5cywgc2luZ2xlU2l6ZSA9IG51bGwpIC0+XHJcbiAgICBpZiBzaW5nbGVTaXplID09IG51bGxcclxuICAgICAgc3RhcnRTaXplID0gM1xyXG4gICAgICBlbmRTaXplID0gNlxyXG4gICAgZWxzZVxyXG4gICAgICBzdGFydFNpemUgPSBzaW5nbGVTaXplXHJcbiAgICAgIGVuZFNpemUgPSBzaW5nbGVTaXplXHJcbiAgICBmb3IgcnVuU2l6ZSBpbiBbc3RhcnRTaXplLi5lbmRTaXplXVxyXG4gICAgICBbcm9wcywgbGVmdG92ZXJzXSA9IEBhaUZpbmRSdW5zKGhhbmQsIDIsIHJ1blNpemUpXHJcbiAgICAgIGlmIHJvcHMubGVuZ3RoID4gMFxyXG4gICAgICAgIGtleSA9IFwicm9wI3tydW5TaXplfVwiXHJcbiAgICAgICAgcGxheXNba2V5XSA9IHJvcHNcclxuICAgICAgaGFuZCA9IGxlZnRvdmVyc1xyXG5cclxuICAgIHJldHVybiBoYW5kXHJcblxyXG4gIGFpQ2FsY1BsYXlzOiAoaGFuZCwgc3RyYXRlZ3kgPSB7fSkgLT5cclxuICAgIHBsYXlzID0ge31cclxuXHJcbiAgICAjIFdlIGFsd2F5cyB3YW50IHRvIHVzZSByb3BzIGlmIHdlIGhhdmUgb25lXHJcbiAgICBpZiBzdHJhdGVneS5zZWVzUm9wc1xyXG4gICAgICBoYW5kID0gQGFpQ2FsY1JvcHMoaGFuZCwgcGxheXMpXHJcblxyXG4gICAgaWYgc3RyYXRlZ3kucHJlZmVyc1J1bnNcclxuICAgICAgaGFuZCA9IEBhaUNhbGNSdW5zKGhhbmQsIHBsYXlzLCBzdHJhdGVneS5zbWFsbFJ1bnMpXHJcbiAgICAgIGhhbmQgPSBAYWxDYWxjS2luZHMoaGFuZCwgcGxheXMsIHN0cmF0ZWd5Lm1hdGNoMnMpXHJcbiAgICBlbHNlXHJcbiAgICAgIGhhbmQgPSBAYWxDYWxjS2luZHMoaGFuZCwgcGxheXMsIHN0cmF0ZWd5Lm1hdGNoMnMpXHJcbiAgICAgIGhhbmQgPSBAYWlDYWxjUnVucyhoYW5kLCBwbGF5cywgc3RyYXRlZ3kuc21hbGxSdW5zKVxyXG5cclxuICAgIGtpbmQxID0gaGFuZC5tYXAgKHYpIC0+IFt2XVxyXG4gICAgaWYga2luZDEubGVuZ3RoID4gMFxyXG4gICAgICBwbGF5cy5raW5kMSA9IGtpbmQxXHJcbiAgICByZXR1cm4gcGxheXNcclxuXHJcbiAgbnVtYmVyT2ZTaW5nbGVzOiAocGxheXMpIC0+XHJcbiAgICBpZiBub3QgcGxheXMua2luZDE/XHJcbiAgICAgIHJldHVybiAwXHJcbiAgICBub25Ud29TaW5nbGVzID0gMFxyXG4gICAgZm9yIHJhdyBpbiBwbGF5cy5raW5kMVxyXG4gICAgICBpZiByYXcgPCA0OFxyXG4gICAgICAgIG5vblR3b1NpbmdsZXMgKz0gMVxyXG4gICAgcmV0dXJuIG5vblR3b1NpbmdsZXNcclxuXHJcbiAgYnJlYWtlclBsYXlzOiAoaGFuZCkgLT5cclxuICAgIHJldHVybiBAYWlDYWxjUGxheXMoaGFuZCwgeyBzZWVzUm9wczogdHJ1ZSwgcHJlZmVyc1J1bnM6IGZhbHNlIH0pXHJcblxyXG4gIGlzQnJlYWtlclR5cGU6IChwbGF5VHlwZSkgLT5cclxuICAgIGlmIHBsYXlUeXBlLm1hdGNoKC9ecm9wLykgb3IgcGxheVR5cGUgPT0gJ2tpbmQ0J1xyXG4gICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gIGNhbkJlQnJva2VuOiAocGxheSkgLT5cclxuICAgIGlmIHBsYXkudHlwZSAhPSAna2luZDEnXHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgY2FyZCA9IG5ldyBDYXJkKHBsYXkuaGlnaClcclxuICAgIHJldHVybiAoY2FyZC52YWx1ZSA9PSAxMilcclxuXHJcbiAgaGFzQnJlYWtlcjogKGhhbmQpIC0+XHJcbiAgICBwbGF5cyA9IEBicmVha2VyUGxheXMoaGFuZClcclxuICAgIGZvciBwbGF5VHlwZSwgcGxheWxpc3Qgb2YgcGxheXNcclxuICAgICAgaWYgQGlzQnJlYWtlclR5cGUocGxheVR5cGUpXHJcbiAgICAgICAgaWYgcGxheWxpc3QubGVuZ3RoID4gMFxyXG4gICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgIHJldHVybiBmYWxzZVxyXG5cclxuICBpc1J1blR5cGU6IChwbGF5VHlwZSkgLT5cclxuICAgIGlmIHBsYXlUeXBlLm1hdGNoKC9ecnVuLylcclxuICAgICAgcmV0dXJuIHRydWVcclxuICAgIHJldHVybiBmYWxzZVxyXG5cclxuICBpc1N1aXRlZDogKGhhbmQpIC0+XHJcbiAgICBpZiBoYW5kLmxlbmd0aCA8IDFcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICBjYXJkcyA9IGhhbmQubWFwIChyYXcpIC0+IG5ldyBDYXJkKHJhdylcclxuICAgIHN1aXQgPSBjYXJkc1swXS5zdWl0XHJcbiAgICBmb3IgY2FyZCBpbiBjYXJkc1xyXG4gICAgICBpZiBjYXJkLnN1aXQgIT0gc3VpdFxyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgcmV0dXJuIHRydWVcclxuXHJcbiAgaXNCaWdSdW46IChwbGF5LCBhdExlYXN0KSAtPlxyXG4gICAgaWYgbWF0Y2hlcyA9IHBsYXkudHlwZS5tYXRjaCgvXnJ1bihcXGQrKS8pXHJcbiAgICAgIGxlbiA9IHBhcnNlSW50KG1hdGNoZXNbMV0pXHJcbiAgICAgIGlmIGxlbiA+PSBhdExlYXN0XHJcbiAgICAgICAgcmV0dXJuIHRydWVcclxuICAgIHJldHVybiBmYWxzZVxyXG5cclxuICBhaUNhbGNCZXN0UGxheXM6IChoYW5kKSAtPlxyXG4gICAgYmVzdFBsYXlzID0gbnVsbFxyXG4gICAgZm9yIGJpdHMgaW4gWzAuLi4xNl1cclxuICAgICAgc3RyYXRlZ3kgPVxyXG4gICAgICAgIHNtYWxsUnVuczogKGJpdHMgJiAxKSA9PSAxXHJcbiAgICAgICAgcHJlZmVyc1J1bnM6IChiaXRzICYgMikgPT0gMlxyXG4gICAgICAgIG1hdGNoMnM6IChiaXRzICYgNCkgPT0gNFxyXG4gICAgICAgIHNlZXNSb3BzOiAoYml0cyAmIDgpID09IDhcclxuICAgICAgcGxheXMgPSBAYWlDYWxjUGxheXMoaGFuZCwgc3RyYXRlZ3kpXHJcbiAgICAgIGlmIGJlc3RQbGF5cyA9PSBudWxsXHJcbiAgICAgICAgYmVzdFBsYXlzID0gcGxheXNcclxuICAgICAgZWxzZVxyXG4gICAgICAgIG5wID0gQG51bWJlck9mU2luZ2xlcyhwbGF5cylcclxuICAgICAgICBuYnAgPSBAbnVtYmVyT2ZTaW5nbGVzKGJlc3RQbGF5cylcclxuICAgICAgICBpZiBucCA8IG5icFxyXG4gICAgICAgICAgYmVzdFBsYXlzID0gcGxheXNcclxuICAgICAgICBlbHNlIGlmIG5wID09IG5icFxyXG4gICAgICAgICAgIyBmbGlwIGEgY29pbiFcclxuICAgICAgICAgIGlmIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpID09IDBcclxuICAgICAgICAgICAgYmVzdFBsYXlzID0gcGxheXNcclxuICAgIHJldHVybiBiZXN0UGxheXNcclxuXHJcbiAgcHJldHR5UGxheXM6IChwbGF5cywgZXh0cmFQcmV0dHkgPSBmYWxzZSkgLT5cclxuICAgIHByZXR0eSA9IHt9XHJcbiAgICBmb3IgdHlwZSwgYXJyIG9mIHBsYXlzXHJcbiAgICAgIHByZXR0eVt0eXBlXSA9IFtdXHJcbiAgICAgIGZvciBwbGF5IGluIGFyclxyXG4gICAgICAgIG5hbWVzID0gW11cclxuICAgICAgICBmb3IgcmF3IGluIHBsYXlcclxuICAgICAgICAgIGNhcmQgPSBuZXcgQ2FyZChyYXcpXHJcbiAgICAgICAgICBuYW1lcy5wdXNoKGNhcmQubmFtZSlcclxuICAgICAgICBwcmV0dHlbdHlwZV0ucHVzaChuYW1lcylcclxuICAgIGlmIGV4dHJhUHJldHR5XHJcbiAgICAgIHMgPSBcIlwiXHJcbiAgICAgIGZvciB0eXBlTmFtZSwgdGhyb3dzIG9mIHByZXR0eVxyXG4gICAgICAgIHMgKz0gXCIgICAgICAqICN7cGxheVR5cGVUb1N0cmluZyh0eXBlTmFtZSl9OlxcblwiXHJcbiAgICAgICAgaWYgdHlwZU5hbWUgPT0gJ2tpbmQxJ1xyXG4gICAgICAgICAgcyArPSBcIiAgICAgICAgKiAje3Rocm93cy5tYXAoKHYpIC0+IHZbMF0pLmpvaW4oJywnKX1cXG5cIlxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIGZvciB0IGluIHRocm93c1xyXG4gICAgICAgICAgICBzICs9IFwiICAgICAgICAqICN7dC5qb2luKCcsJyl9XFxuXCJcclxuICAgICAgcmV0dXJuIHNcclxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShwcmV0dHkpXHJcblxyXG4gIGhpZ2hlc3RDYXJkOiAocGxheSkgLT5cclxuICAgIGhpZ2hlc3QgPSAwXHJcbiAgICBmb3IgcCBpbiBwbGF5XHJcbiAgICAgIGlmIGhpZ2hlc3QgPCBwXHJcbiAgICAgICAgaGlnaGVzdCA9IHBcclxuICAgIHJldHVybiBoaWdoZXN0XHJcblxyXG4gIGZpbmRQbGF5V2l0aDNTOiAocGxheXMpIC0+XHJcbiAgICBmb3IgcGxheVR5cGUsIHBsYXlsaXN0IG9mIHBsYXlzXHJcbiAgICAgIGZvciBwbGF5IGluIHBsYXlsaXN0XHJcbiAgICAgICAgaWYgQGhhbmRIYXMzUyhwbGF5KVxyXG4gICAgICAgICAgcmV0dXJuIHBsYXlcclxuXHJcbiAgICBjb25zb2xlLmxvZyBcImZpbmRQbGF5V2l0aDNTOiBzb21ldGhpbmcgaW1wb3NzaWJsZSBpcyBoYXBwZW5pbmdcIlxyXG4gICAgcmV0dXJuIFtdXHJcblxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIEFJIEJyYWluc1xyXG5cclxuICAjIEJyYWlucyBtdXN0IGhhdmU6XHJcbiAgIyAqIGlkOiBpbnRlcm5hbCBpZGVudGlmaWVyIGZvciB0aGUgYnJhaW5cclxuICAjICogbmFtZTogcHJldHR5IG5hbWVcclxuICAjICogcGxheShjdXJyZW50UGxheWVyKSBhdHRlbXB0cyB0byBwbGF5IGEgY2FyZCBieSBjYWxsaW5nIGFpUGxheSgpLiBTaG91bGQgcmV0dXJuIHRydWUgaWYgaXQgc3VjY2Vzc2Z1bGx5IHBsYXllZCBhIGNhcmQgKGFpUGxheSgpIHJldHVybmVkIHRydWUpXHJcbiAgYnJhaW5zOlxyXG5cclxuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAjIE5vcm1hbDogSW50ZW5kZWQgdG8gYmUgdXNlZCBieSBtb3N0IGNoYXJhY3RlcnMuXHJcbiAgICAjICAgICAgICAgTm90IHRvbyBkdW1iLCBub3QgdG9vIHNtYXJ0LlxyXG4gICAgbm9ybWFsOlxyXG4gICAgICBpZDogICBcIm5vcm1hbFwiXHJcbiAgICAgIG5hbWU6IFwiTm9ybWFsXCJcclxuXHJcbiAgICAgICMgbm9ybWFsXHJcbiAgICAgIHBsYXk6IChjdXJyZW50UGxheWVyLCBjdXJyZW50UGxheSwgZXZlcnlvbmVQYXNzZWQpIC0+XHJcbiAgICAgICAgaWYgY3VycmVudFBsYXllci5wYXNzXHJcbiAgICAgICAgICBpZiBAY2FuQmVCcm9rZW4oY3VycmVudFBsYXkpIGFuZCBAaGFzQnJlYWtlcihjdXJyZW50UGxheWVyLmhhbmQpXHJcbiAgICAgICAgICAgIGJyZWFrZXJQbGF5cyA9IEBicmVha2VyUGxheXMoY3VycmVudFBsYXllci5oYW5kKVxyXG4gICAgICAgICAgICBmb3IgcGxheVR5cGUsIHBsYXlsaXN0IG9mIGJyZWFrZXJQbGF5c1xyXG4gICAgICAgICAgICAgIGlmIChwbGF5VHlwZS5tYXRjaCgvXnJvcC8pIG9yIChwbGF5VHlwZSA9PSAna2luZDQnKSkgYW5kIChwbGF5bGlzdC5sZW5ndGggPiAwKVxyXG4gICAgICAgICAgICAgICAgQGFpTG9nKFwiYnJlYWtpbmcgMlwiKVxyXG4gICAgICAgICAgICAgICAgaWYgQGFpUGxheShjdXJyZW50UGxheWVyLCBwbGF5bGlzdFswXSkgPT0gT0tcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuIE9LXHJcblxyXG4gICAgICAgICAgQGFpTG9nKFwiYWxyZWFkeSBwYXNzZWQsIGdvaW5nIHRvIGtlZXAgcGFzc2luZ1wiKVxyXG4gICAgICAgICAgcmV0dXJuIEBhaVBhc3MoY3VycmVudFBsYXllcilcclxuXHJcbiAgICAgICAgcGxheXMgPSBAYWlDYWxjQmVzdFBsYXlzKGN1cnJlbnRQbGF5ZXIuaGFuZClcclxuICAgICAgICBAYWlMb2coXCJiZXN0IHBsYXlzOiAje0BwcmV0dHlQbGF5cyhwbGF5cyl9XCIpXHJcblxyXG4gICAgICAgIGlmIEBwaWxlLmxlbmd0aCA9PSAwXHJcbiAgICAgICAgICBwbGF5ID0gQGZpbmRQbGF5V2l0aDNTKHBsYXlzKVxyXG4gICAgICAgICAgQGFpTG9nKFwiVGhyb3dpbmcgbXkgcGxheSB3aXRoIHRoZSAzUyBpbiBpdFwiKVxyXG4gICAgICAgICAgaWYgQGFpUGxheShjdXJyZW50UGxheWVyLCBwbGF5KSA9PSBPS1xyXG4gICAgICAgICAgICByZXR1cm4gT0tcclxuXHJcbiAgICAgICAgaWYgY3VycmVudFBsYXkgYW5kIG5vdCBldmVyeW9uZVBhc3NlZFxyXG4gICAgICAgICAgaWYgcGxheXNbY3VycmVudFBsYXkudHlwZV0/IGFuZCAocGxheXNbY3VycmVudFBsYXkudHlwZV0ubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgZm9yIHBsYXkgaW4gcGxheXNbY3VycmVudFBsYXkudHlwZV1cclxuICAgICAgICAgICAgICBpZiBAaGlnaGVzdENhcmQocGxheSkgPiBjdXJyZW50UGxheS5oaWdoXHJcbiAgICAgICAgICAgICAgICBpZiBAYWlQbGF5KGN1cnJlbnRQbGF5ZXIsIHBsYXkpID09IE9LXHJcbiAgICAgICAgICAgICAgICAgIHJldHVybiBPS1xyXG4gICAgICAgICAgICBAYWlMb2coXCJJIGd1ZXNzIEkgY2FuJ3QgYWN0dWFsbHkgYmVhdCB0aGlzLCBwYXNzaW5nXCIpXHJcbiAgICAgICAgICAgIHJldHVybiBAYWlQYXNzKGN1cnJlbnRQbGF5ZXIpXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIEBhaUxvZyhcIkkgZG9uJ3QgaGF2ZSB0aGF0IHBsYXksIHBhc3NpbmdcIilcclxuICAgICAgICAgICAgcmV0dXJuIEBhaVBhc3MoY3VycmVudFBsYXllcilcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAjIG5vIGN1cnJlbnQgcGxheSwgdGhyb3cgdGhlIGZpcnN0IGNhcmRcclxuICAgICAgICAgIEBhaUxvZyhcIkkgY2FuIGRvIGFueXRoaW5nLCB0aHJvd2luZyBhIHJhbmRvbSBwbGF5XCIpXHJcbiAgICAgICAgICBwbGF5VHlwZXMgPSBPYmplY3Qua2V5cyhwbGF5cylcclxuICAgICAgICAgIHBsYXlUeXBlSW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBwbGF5VHlwZXMubGVuZ3RoKVxyXG4gICAgICAgICAgaWYgQGFpUGxheShjdXJyZW50UGxheWVyLCBwbGF5c1twbGF5VHlwZXNbcGxheVR5cGVJbmRleF1dWzBdKSA9PSBPS1xyXG4gICAgICAgICAgICByZXR1cm4gT0tcclxuXHJcbiAgICAgICAgIyBmaW5kIHRoZSBmaXJzdCBjYXJkIHRoYXQgYmVhdHMgdGhlIGN1cnJlbnRQbGF5J3MgaGlnaFxyXG4gICAgICAgIGZvciByYXdDYXJkIGluIGN1cnJlbnRQbGF5ZXIuaGFuZFxyXG4gICAgICAgICAgaWYgcmF3Q2FyZCA+IGN1cnJlbnRQbGF5LmhpZ2hcclxuICAgICAgICAgICAgQGFpTG9nKFwiZm91bmQgc21hbGxlc3Qgc2luZ2xlICgje3Jhd0NhcmR9KSwgcGxheWluZ1wiKVxyXG4gICAgICAgICAgICBpZiBAYWlQbGF5KGN1cnJlbnRQbGF5ZXIsIFtyYXdDYXJkXSkgPT0gT0tcclxuICAgICAgICAgICAgICByZXR1cm4gT0tcclxuICAgICAgICAgICAgYnJlYWtcclxuXHJcbiAgICAgICAgQGFpTG9nKFwibm90aGluZyBlbHNlIHRvIGRvLCBwYXNzaW5nXCIpXHJcbiAgICAgICAgcmV0dXJuIEBhaVBhc3MoY3VycmVudFBsYXllcilcclxuXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgRGVidWcgY29kZVxyXG5cclxuZGVidWcgPSAtPlxyXG4gIHRoaXIgPSBuZXcgVGhpcnRlZW4oKVxyXG4gIGZ1bGx5UGxheWVkID0gMFxyXG4gIHRvdGFsQXR0ZW1wdHMgPSAxMDBcclxuXHJcbiAgZm9yIGF0dGVtcHQgaW4gWzAuLi50b3RhbEF0dGVtcHRzXVxyXG4gICAgZGVjayA9IG5ldyBTaHVmZmxlZERlY2soKVxyXG4gICAgaGFuZCA9IFtdXHJcbiAgICBmb3IgaiBpbiBbMC4uLjEzXVxyXG4gICAgICByYXcgPSBkZWNrLmNhcmRzLnNoaWZ0KClcclxuICAgICAgaGFuZC5wdXNoKHJhdylcclxuICAgICMgaGFuZCA9IFs1MSw1MCw0OSw0OCw0Nyw0Niw0NSw0NCw0Myw0Miw0MSw0MCwzOV1cclxuICAgICMgaGFuZCA9IFswLDEsMiwzLDQsNSw2LDcsOCw5LDEwLDExLDEyXVxyXG4gICAgaGFuZC5zb3J0IChhLGIpIC0+IHJldHVybiBhIC0gYlxyXG5cclxuICAgIGNvbnNvbGUubG9nKFwiLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXCIpXHJcbiAgICBjb25zb2xlLmxvZyhcIkhhbmQgI3thdHRlbXB0KzF9OiAje2NhcmRzVG9TdHJpbmcoaGFuZCl9XCIpXHJcbiAgICBjb25zb2xlLmxvZyhcIlwiKVxyXG5cclxuICAgIGZvdW5kRnVsbHlQbGF5ZWQgPSBmYWxzZVxyXG4gICAgZm9yIGJpdHMgaW4gWzAuLi4xNl1cclxuICAgICAgc3RyYXRlZ3kgPVxyXG4gICAgICAgIHNtYWxsUnVuczogKGJpdHMgJiAxKSA9PSAxXHJcbiAgICAgICAgcHJlZmVyc1J1bnM6IChiaXRzICYgMikgPT0gMlxyXG4gICAgICAgIG1hdGNoMnM6IChiaXRzICYgNCkgPT0gNFxyXG4gICAgICAgIHNlZXNSb3BzOiAoYml0cyAmIDgpID09IDhcclxuICAgICAgcGxheXMgPSB0aGlyLmFpQ2FsY1BsYXlzKGhhbmQsIHN0cmF0ZWd5KVxyXG5cclxuICAgICAgY29uc29sZS5sb2coXCIgICAqIFN0cmF0ZWd5OiAje0pTT04uc3RyaW5naWZ5KHN0cmF0ZWd5KX1cIilcclxuICAgICAgY29uc29sZS5sb2codGhpci5wcmV0dHlQbGF5cyhwbGF5cywgdHJ1ZSkpXHJcblxyXG4gICAgICBpZiBub3QgcGxheXMua2luZDFcclxuICAgICAgICBmb3VuZEZ1bGx5UGxheWVkID0gdHJ1ZVxyXG5cclxuICAgIGlmIGZvdW5kRnVsbHlQbGF5ZWRcclxuICAgICAgZnVsbHlQbGF5ZWQgKz0gMVxyXG5cclxuICBjb25zb2xlLmxvZyBcImZ1bGx5UGxheWVkOiAje2Z1bGx5UGxheWVkfSAvICN7dG90YWxBdHRlbXB0c31cIlxyXG5cclxuIyBkZWJ1ZygpXHJcblxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIEV4cG9ydHNcclxuXHJcbm1vZHVsZS5leHBvcnRzID1cclxuICBDYXJkOiBDYXJkXHJcbiAgVGhpcnRlZW46IFRoaXJ0ZWVuXHJcbiAgT0s6IE9LXHJcbiAgYWlDaGFyYWN0ZXJzOiBhaUNoYXJhY3RlcnNcclxuICBhY2hpZXZlbWVudHNMaXN0OiBhY2hpZXZlbWVudHNMaXN0XHJcbiAgYWNoaWV2ZW1lbnRzTWFwOiBhY2hpZXZlbWVudHNNYXBcclxuIiwibW9kdWxlLmV4cG9ydHMgPVxyXG4gIGRhcmtmb3Jlc3Q6XHJcbiAgICBoZWlnaHQ6IDcyXHJcbiAgICBnbHlwaHM6XHJcbiAgICAgICc5NycgOiB7IHg6ICAgOCwgeTogICA4LCB3aWR0aDogIDM0LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnOTgnIDogeyB4OiAgIDgsIHk6ICA1OCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzk5JyA6IHsgeDogIDUwLCB5OiAgIDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICcxMDAnOiB7IHg6ICAgOCwgeTogMTE4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnMTAxJzogeyB4OiAgIDgsIHk6IDE3OCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzEwMic6IHsgeDogICA4LCB5OiAyMjgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzMyB9XHJcbiAgICAgICcxMDMnOiB7IHg6ICAgOCwgeTogMjc4LCB3aWR0aDogIDM2LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzUgfVxyXG4gICAgICAnMTA0JzogeyB4OiAgIDgsIHk6IDMyOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzEwNSc6IHsgeDogICA4LCB5OiAzNzgsIHdpZHRoOiAgMTIsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAxMSB9XHJcbiAgICAgICcxMDYnOiB7IHg6ICAgOCwgeTogNDI4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MSwgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnMTA3JzogeyB4OiAgMjgsIHk6IDM3OCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDEsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzEwOCc6IHsgeDogIDUxLCB5OiAzMjgsIHdpZHRoOiAgMzQsIGhlaWdodDogIDQxLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzMyB9XHJcbiAgICAgICcxMDknOiB7IHg6ICA1MSwgeTogNDI3LCB3aWR0aDogIDM4LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzcgfVxyXG4gICAgICAnMTEwJzogeyB4OiAgNzEsIHk6IDM3Nywgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzExMSc6IHsgeDogIDk3LCB5OiA0MjcsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQxLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICcxMTInOiB7IHg6ICA1MSwgeTogIDU4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnMTEzJzogeyB4OiAgNTEsIHk6IDEwOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDUsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzExNCc6IHsgeDogIDkzLCB5OiAgIDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNSB9XHJcbiAgICAgICcxMTUnOiB7IHg6ICA1MSwgeTogMTYxLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzUgfVxyXG4gICAgICAnMTE2JzogeyB4OiAgNTEsIHk6IDIxMSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDMzIH1cclxuICAgICAgJzExNyc6IHsgeDogIDUyLCB5OiAyNjEsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICcxMTgnOiB7IHg6ICA5MywgeTogMzExLCB3aWR0aDogIDM0LCBoZWlnaHQ6ICA0MSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzIgfVxyXG4gICAgICAnMTE5JzogeyB4OiAxMTQsIHk6IDM2MCwgd2lkdGg6ICAzOCwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM4IH1cclxuICAgICAgJzEyMCc6IHsgeDogMTQwLCB5OiA0MTAsIHdpZHRoOiAgMzYsIGhlaWdodDogIDQxLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNyB9XHJcbiAgICAgICcxMjEnOiB7IHg6IDE0MCwgeTogNDU5LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxyXG4gICAgICAnMTIyJzogeyB4OiAxODMsIHk6IDQ1OSwgd2lkdGg6ICAzNiwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM1IH1cclxuICAgICAgJzY1JyA6IHsgeDogIDk0LCB5OiAgNTgsIHdpZHRoOiAgMzQsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XHJcbiAgICAgICc2NicgOiB7IHg6ICA5NCwgeTogMTE5LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzcgfVxyXG4gICAgICAnNjcnIDogeyB4OiAgOTQsIHk6IDE4MCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cclxuICAgICAgJzY4JyA6IHsgeDogIDk1LCB5OiAyNDEsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNyB9XHJcbiAgICAgICc2OScgOiB7IHg6IDEzNiwgeTogICA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxyXG4gICAgICAnNzAnIDogeyB4OiAxMzcsIHk6ICA2OSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzcxJyA6IHsgeDogMTc5LCB5OiAgIDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XHJcbiAgICAgICc3MicgOiB7IHg6IDEzNywgeTogMTMwLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxyXG4gICAgICAnNzMnIDogeyB4OiAxMzgsIHk6IDE5MSwgd2lkdGg6ICAxMiwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDEzIH1cclxuICAgICAgJzc0JyA6IHsgeDogMTM4LCB5OiAyNTIsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XHJcbiAgICAgICc3NScgOiB7IHg6IDE1OCwgeTogMTkxLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxyXG4gICAgICAnNzYnIDogeyB4OiAxNjAsIHk6IDMxMywgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM0IH1cclxuICAgICAgJzc3JyA6IHsgeDogMTgxLCB5OiAyNTEsIHdpZHRoOiAgMzgsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzOSB9XHJcbiAgICAgICc3OCcgOiB7IHg6IDE4NCwgeTogMzc0LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxyXG4gICAgICAnNzknIDogeyB4OiAyMDMsIHk6IDMxMiwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM1IH1cclxuICAgICAgJzgwJyA6IHsgeDogMTgwLCB5OiAgNjksIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICc4MScgOiB7IHg6IDIwMSwgeTogMTMwLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1NiwgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxyXG4gICAgICAnODInIDogeyB4OiAyMjIsIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cclxuICAgICAgJzgzJyA6IHsgeDogMjIzLCB5OiAgNjksIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNSB9XHJcbiAgICAgICc4NCcgOiB7IHg6IDI2NSwgeTogICA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzMgfVxyXG4gICAgICAnODUnIDogeyB4OiAyMjcsIHk6IDE5NCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM1IH1cclxuICAgICAgJzg2JyA6IHsgeDogMjQ0LCB5OiAxMzAsIHdpZHRoOiAgNDEsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAxOSwgeGFkdmFuY2U6ICAzOSB9XHJcbiAgICAgICc4NycgOiB7IHg6IDI2NiwgeTogIDY5LCB3aWR0aDogIDM4LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzcgfVxyXG4gICAgICAnODgnIDogeyB4OiAzMDgsIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDE5LCB4YWR2YW5jZTogIDM1IH1cclxuICAgICAgJzg5JyA6IHsgeDogMjI3LCB5OiAzNzMsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAxOSwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICc5MCcgOiB7IHg6IDIyNywgeTogNDMzLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxyXG4gICAgICAnMzMnIDogeyB4OiAyNDYsIHk6IDI1NSwgd2lkdGg6ICAxNCwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDExIH1cclxuICAgICAgJzU5JyA6IHsgeDogMTgwLCB5OiAxMzAsIHdpZHRoOiAgMTMsIGhlaWdodDogIDM3LCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA1NiwgeGFkdmFuY2U6ICAxMyB9XHJcbiAgICAgICczNycgOiB7IHg6ICA5NSwgeTogMzAyLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxyXG4gICAgICAnNTgnIDogeyB4OiAxNjAsIHk6IDM3NCwgd2lkdGg6ICAxMywgaGVpZ2h0OiAgMjMsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDUwLCB4YWR2YW5jZTogIDEzIH1cclxuICAgICAgJzYzJyA6IHsgeDogMjY4LCB5OiAyNTUsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzMyB9XHJcbiAgICAgICc0MicgOiB7IHg6IDEwMywgeTogMzAyLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxyXG4gICAgICAnNDAnIDogeyB4OiAyNzAsIHk6IDE5MCwgd2lkdGg6ICAyMywgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDIxIH1cclxuICAgICAgJzQxJyA6IHsgeDogMjkzLCB5OiAxMzAsIHdpZHRoOiAgMjMsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAyMSB9XHJcbiAgICAgICc5NScgOiB7IHg6IDExMSwgeTogMzAyLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxyXG4gICAgICAnNDMnIDogeyB4OiAyNDYsIHk6IDMxNiwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgMzQsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDM5LCB4YWR2YW5jZTogIDMyIH1cclxuICAgICAgJzQ1JyA6IHsgeDogMTg0LCB5OiA0MzUsIHdpZHRoOiAgMjYsIGhlaWdodDogIDExLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICA0NCwgeGFkdmFuY2U6ICAyNSB9XHJcbiAgICAgICc2MScgOiB7IHg6IDMxMiwgeTogIDY4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICAzMCwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgNDIsIHhhZHZhbmNlOiAgMzMgfVxyXG4gICAgICAnNDYnIDogeyB4OiAxMzUsIHk6IDMxMywgd2lkdGg6ICAxNCwgaGVpZ2h0OiAgMTEsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDYxLCB4YWR2YW5jZTogIDE0IH1cclxuICAgICAgJzQ0JyA6IHsgeDogMjI3LCB5OiAyNTUsIHdpZHRoOiAgMTAsIGhlaWdodDogIDIxLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA2OCwgeGFkdmFuY2U6ICAxMSB9XHJcbiAgICAgICc0NycgOiB7IHg6IDM1MSwgeTogICA4LCB3aWR0aDogIDI4LCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgMTksIHhhZHZhbmNlOiAgMjYgfVxyXG4gICAgICAnMTI0JzogeyB4OiAxMTksIHk6IDMwMiwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cclxuICAgICAgJzM0JyA6IHsgeDogMTI3LCB5OiAzMDIsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XHJcbiAgICAgICczOScgOiB7IHg6IDIwMSwgeTogMTk0LCB3aWR0aDogIDE4LCBoZWlnaHQ6ICAxOSwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgIDAsIHhhZHZhbmNlOiAgMjEgfVxyXG4gICAgICAnNjQnIDogeyB4OiAyMTgsIHk6IDQzNSwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cclxuICAgICAgJzM1JyA6IHsgeDogMjE4LCB5OiA0NDMsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XHJcbiAgICAgICczNicgOiB7IHg6IDMwMSwgeTogMTkwLCB3aWR0aDogIDMyLCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgMjIsIHhhZHZhbmNlOiAgMjkgfVxyXG4gICAgICAnOTQnIDogeyB4OiAyMTgsIHk6IDQ1MSwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cclxuICAgICAgJzM4JyA6IHsgeDogMjQ2LCB5OiAzNTgsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XHJcbiAgICAgICcxMjMnOiB7IHg6IDMyNCwgeTogMTA2LCB3aWR0aDogIDI3LCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMjYgfVxyXG4gICAgICAnMTI1JzogeyB4OiAyNzAsIHk6IDM1OCwgd2lkdGg6ICAyNywgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDI3IH1cclxuICAgICAgJzkxJyA6IHsgeDogMjcwLCB5OiA0MTgsIHdpZHRoOiAgMjIsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAyMSB9XHJcbiAgICAgICc5MycgOiB7IHg6IDMwMCwgeTogNDE4LCB3aWR0aDogIDIyLCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMjAgfVxyXG4gICAgICAnNDgnIDogeyB4OiAzMDUsIHk6IDMxNiwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cclxuICAgICAgJzQ5JyA6IHsgeDogMzExLCB5OiAyNTEsIHdpZHRoOiAgMzQsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNSB9XHJcbiAgICAgICc1MCcgOiB7IHg6IDM0MSwgeTogMTY2LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzcgfVxyXG4gICAgICAnNTEnIDogeyB4OiAzNTksIHk6ICA2OCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cclxuICAgICAgJzUyJyA6IHsgeDogMzMwLCB5OiAzNzcsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNSB9XHJcbiAgICAgICc1MycgOiB7IHg6IDM0OCwgeTogMzEyLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzcgfVxyXG4gICAgICAnNTQnIDogeyB4OiAzMzAsIHk6IDQzOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cclxuICAgICAgJzU1JyA6IHsgeDogMzUzLCB5OiAyMjcsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNCB9XHJcbiAgICAgICc1NicgOiB7IHg6IDM4NCwgeTogMTI5LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxyXG4gICAgICAnNTcnIDogeyB4OiA0MDIsIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cclxuICAgICAgJzMyJyA6IHsgeDogICAwLCB5OiAgIDAsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAyMiB9XHJcblxyXG4gICAgICAjIGNhcmQgZ2x5cGhzXHJcbiAgICAgICcyMDAnOiB7IHg6IDM5NiwgeTogMzc4LCB3aWR0aDogIDQwLCBoZWlnaHQ6ICA0OSwgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjEsIHhhZHZhbmNlOiAgNDMgfSAjIFNcclxuICAgICAgJzIwMSc6IHsgeDogNDQ3LCB5OiAzMTMsIHdpZHRoOiAgNDksIGhlaWdodDogIDUwLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMSwgeGFkdmFuY2U6ICA1MiB9ICMgQ1xyXG4gICAgICAnMjAyJzogeyB4OiAzOTksIHk6IDMxMywgd2lkdGg6ICAzNiwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIxLCB4YWR2YW5jZTogIDM5IH0gIyBEXHJcbiAgICAgICcyMDMnOiB7IHg6IDQ1MiwgeTogMzgxLCB3aWR0aDogIDM5LCBoZWlnaHQ6ICA0MywgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjEsIHhhZHZhbmNlOiAgNDIgfSAjIEhcclxuIiwiIyBUaGlzIGZpbGUgcHJvdmlkZXMgdGhlIHJlbmRlcmluZyBlbmdpbmUgZm9yIHRoZSB3ZWIgdmVyc2lvbi4gTm9uZSBvZiB0aGlzIGNvZGUgaXMgaW5jbHVkZWQgaW4gdGhlIEphdmEgdmVyc2lvbi5cclxuXHJcbmNvbnNvbGUubG9nICd3ZWIgc3RhcnR1cCdcclxuXHJcbkdhbWUgPSByZXF1aXJlICcuL0dhbWUnXHJcblxyXG4jIHRha2VuIGZyb20gaHR0cDojc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzU2MjM4MzgvcmdiLXRvLWhleC1hbmQtaGV4LXRvLXJnYlxyXG5jb21wb25lbnRUb0hleCA9IChjKSAtPlxyXG4gIGhleCA9IE1hdGguZmxvb3IoYyAqIDI1NSkudG9TdHJpbmcoMTYpXHJcbiAgcmV0dXJuIGlmIGhleC5sZW5ndGggPT0gMSB0aGVuIFwiMFwiICsgaGV4IGVsc2UgaGV4XHJcbnJnYlRvSGV4ID0gKHIsIGcsIGIpIC0+XHJcbiAgcmV0dXJuIFwiI1wiICsgY29tcG9uZW50VG9IZXgocikgKyBjb21wb25lbnRUb0hleChnKSArIGNvbXBvbmVudFRvSGV4KGIpXHJcblxyXG5TQVZFX1RJTUVSX01TID0gMzAwMFxyXG5cclxuY2xhc3MgTmF0aXZlQXBwXHJcbiAgY29uc3RydWN0b3I6IChAc2NyZWVuLCBAd2lkdGgsIEBoZWlnaHQpIC0+XHJcbiAgICBAdGludGVkVGV4dHVyZUNhY2hlID0gW11cclxuICAgIEBsYXN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXHJcbiAgICBAbGFzdEludGVyYWN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXHJcbiAgICBAaGVhcmRPbmVUb3VjaCA9IGZhbHNlXHJcbiAgICBAdG91Y2hNb3VzZSA9IG51bGxcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdtb3VzZWRvd24nLCAgQG9uTW91c2VEb3duLmJpbmQodGhpcyksIGZhbHNlXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2Vtb3ZlJywgIEBvbk1vdXNlTW92ZS5iaW5kKHRoaXMpLCBmYWxzZVxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNldXAnLCAgICBAb25Nb3VzZVVwLmJpbmQodGhpcyksIGZhbHNlXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAndG91Y2hzdGFydCcsIEBvblRvdWNoU3RhcnQuYmluZCh0aGlzKSwgZmFsc2VcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICd0b3VjaG1vdmUnLCAgQG9uVG91Y2hNb3ZlLmJpbmQodGhpcyksIGZhbHNlXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAndG91Y2hlbmQnLCAgIEBvblRvdWNoRW5kLmJpbmQodGhpcyksIGZhbHNlXHJcbiAgICBAY29udGV4dCA9IEBzY3JlZW4uZ2V0Q29udGV4dChcIjJkXCIpXHJcbiAgICBAdGV4dHVyZXMgPSBbXHJcbiAgICAgICMgYWxsIGNhcmQgYXJ0XHJcbiAgICAgIFwiLi4vaW1hZ2VzL2NhcmRzLnBuZ1wiXHJcbiAgICAgICMgZm9udHNcclxuICAgICAgXCIuLi9pbWFnZXMvZGFya2ZvcmVzdC5wbmdcIlxyXG4gICAgICAjIGNoYXJhY3RlcnMgLyBvdGhlclxyXG4gICAgICBcIi4uL2ltYWdlcy9jaGFycy5wbmdcIlxyXG4gICAgICAjIGhlbHBcclxuICAgICAgXCIuLi9pbWFnZXMvaG93dG9wbGF5MS5wbmdcIlxyXG4gICAgXVxyXG5cclxuICAgIEBnYW1lID0gbmV3IEdhbWUodGhpcywgQHdpZHRoLCBAaGVpZ2h0KVxyXG5cclxuICAgIGlmIHR5cGVvZiBTdG9yYWdlICE9IFwidW5kZWZpbmVkXCJcclxuICAgICAgc3RhdGUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSBcInN0YXRlXCJcclxuICAgICAgaWYgc3RhdGVcclxuICAgICAgICAjIGNvbnNvbGUubG9nIFwibG9hZGluZyBzdGF0ZTogI3tzdGF0ZX1cIlxyXG4gICAgICAgIEBnYW1lLmxvYWQgc3RhdGVcclxuXHJcbiAgICBAcGVuZGluZ0ltYWdlcyA9IDBcclxuICAgIGxvYWRlZFRleHR1cmVzID0gW11cclxuICAgIGZvciBpbWFnZVVybCBpbiBAdGV4dHVyZXNcclxuICAgICAgQHBlbmRpbmdJbWFnZXMrK1xyXG4gICAgICBjb25zb2xlLmxvZyBcImxvYWRpbmcgaW1hZ2UgI3tAcGVuZGluZ0ltYWdlc306ICN7aW1hZ2VVcmx9XCJcclxuICAgICAgaW1nID0gbmV3IEltYWdlKClcclxuICAgICAgaW1nLm9ubG9hZCA9IEBvbkltYWdlTG9hZGVkLmJpbmQodGhpcylcclxuICAgICAgaW1nLnNyYyA9IGltYWdlVXJsXHJcbiAgICAgIGxvYWRlZFRleHR1cmVzLnB1c2ggaW1nXHJcbiAgICBAdGV4dHVyZXMgPSBsb2FkZWRUZXh0dXJlc1xyXG5cclxuICAgIEBzYXZlVGltZXIgPSBTQVZFX1RJTUVSX01TXHJcblxyXG4gIG9uSW1hZ2VMb2FkZWQ6IChpbmZvKSAtPlxyXG4gICAgQHBlbmRpbmdJbWFnZXMtLVxyXG4gICAgaWYgQHBlbmRpbmdJbWFnZXMgPT0gMFxyXG4gICAgICBjb25zb2xlLmxvZyAnQWxsIGltYWdlcyBsb2FkZWQuIEJlZ2lubmluZyByZW5kZXIgbG9vcC4nXHJcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9PiBAdXBkYXRlKClcclxuXHJcbiAgbG9nOiAocykgLT5cclxuICAgIGNvbnNvbGUubG9nIFwiTmF0aXZlQXBwLmxvZygpOiAje3N9XCJcclxuXHJcbiAgdXBkYXRlU2F2ZTogKGR0KSAtPlxyXG4gICAgcmV0dXJuIGlmIHR5cGVvZiBTdG9yYWdlID09IFwidW5kZWZpbmVkXCJcclxuICAgIEBzYXZlVGltZXIgLT0gZHRcclxuICAgIGlmIEBzYXZlVGltZXIgPD0gMFxyXG4gICAgICBAc2F2ZVRpbWVyID0gU0FWRV9USU1FUl9NU1xyXG4gICAgICBzdGF0ZSA9IEBnYW1lLnNhdmUoKVxyXG4gICAgICAjIGNvbnNvbGUubG9nIFwic2F2aW5nOiAje3N0YXRlfVwiXHJcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtIFwic3RhdGVcIiwgc3RhdGVcclxuXHJcbiAgZ2VuZXJhdGVUaW50SW1hZ2U6ICh0ZXh0dXJlSW5kZXgsIHJlZCwgZ3JlZW4sIGJsdWUpIC0+XHJcbiAgICBpbWcgPSBAdGV4dHVyZXNbdGV4dHVyZUluZGV4XVxyXG4gICAgYnVmZiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgXCJjYW52YXNcIlxyXG4gICAgYnVmZi53aWR0aCAgPSBpbWcud2lkdGhcclxuICAgIGJ1ZmYuaGVpZ2h0ID0gaW1nLmhlaWdodFxyXG5cclxuICAgIGN0eCA9IGJ1ZmYuZ2V0Q29udGV4dCBcIjJkXCJcclxuICAgIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnY29weSdcclxuICAgIGN0eC5kcmF3SW1hZ2UoaW1nLCAwLCAwKVxyXG4gICAgZmlsbENvbG9yID0gXCJyZ2IoI3tNYXRoLmZsb29yKHJlZCoyNTUpfSwgI3tNYXRoLmZsb29yKGdyZWVuKjI1NSl9LCAje01hdGguZmxvb3IoYmx1ZSoyNTUpfSlcIlxyXG4gICAgY3R4LmZpbGxTdHlsZSA9IGZpbGxDb2xvclxyXG4gICAgIyBjb25zb2xlLmxvZyBcImZpbGxDb2xvciAje2ZpbGxDb2xvcn1cIlxyXG4gICAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdtdWx0aXBseSdcclxuICAgIGN0eC5maWxsUmVjdCgwLCAwLCBidWZmLndpZHRoLCBidWZmLmhlaWdodClcclxuICAgIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnY29weSdcclxuICAgIGN0eC5nbG9iYWxBbHBoYSA9IDEuMFxyXG4gICAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdkZXN0aW5hdGlvbi1pbidcclxuICAgIGN0eC5kcmF3SW1hZ2UoaW1nLCAwLCAwKVxyXG5cclxuICAgIGltZ0NvbXAgPSBuZXcgSW1hZ2UoKVxyXG4gICAgaW1nQ29tcC5zcmMgPSBidWZmLnRvRGF0YVVSTCgpXHJcbiAgICByZXR1cm4gaW1nQ29tcFxyXG5cclxuICBkcmF3SW1hZ2U6ICh0ZXh0dXJlSW5kZXgsIHNyY1gsIHNyY1ksIHNyY1csIHNyY0gsIGRzdFgsIGRzdFksIGRzdFcsIGRzdEgsIHJvdCwgYW5jaG9yWCwgYW5jaG9yWSwgciwgZywgYiwgYSkgLT5cclxuICAgIHRleHR1cmUgPSBAdGV4dHVyZXNbdGV4dHVyZUluZGV4XVxyXG4gICAgaWYgKHIgIT0gMSkgb3IgKGcgIT0gMSkgb3IgKGIgIT0gMSlcclxuICAgICAgdGludGVkVGV4dHVyZUtleSA9IFwiI3t0ZXh0dXJlSW5kZXh9LSN7cn0tI3tnfS0je2J9XCJcclxuICAgICAgdGludGVkVGV4dHVyZSA9IEB0aW50ZWRUZXh0dXJlQ2FjaGVbdGludGVkVGV4dHVyZUtleV1cclxuICAgICAgaWYgbm90IHRpbnRlZFRleHR1cmVcclxuICAgICAgICB0aW50ZWRUZXh0dXJlID0gQGdlbmVyYXRlVGludEltYWdlIHRleHR1cmVJbmRleCwgciwgZywgYlxyXG4gICAgICAgIEB0aW50ZWRUZXh0dXJlQ2FjaGVbdGludGVkVGV4dHVyZUtleV0gPSB0aW50ZWRUZXh0dXJlXHJcbiAgICAgICAgIyBjb25zb2xlLmxvZyBcImdlbmVyYXRlZCBjYWNoZWQgdGV4dHVyZSAje3RpbnRlZFRleHR1cmVLZXl9XCJcclxuICAgICAgdGV4dHVyZSA9IHRpbnRlZFRleHR1cmVcclxuXHJcbiAgICBAY29udGV4dC5zYXZlKClcclxuICAgIEBjb250ZXh0LnRyYW5zbGF0ZSBkc3RYLCBkc3RZXHJcbiAgICBAY29udGV4dC5yb3RhdGUgcm90ICMgKiAzLjE0MTU5MiAvIDE4MC4wXHJcbiAgICBhbmNob3JPZmZzZXRYID0gLTEgKiBhbmNob3JYICogZHN0V1xyXG4gICAgYW5jaG9yT2Zmc2V0WSA9IC0xICogYW5jaG9yWSAqIGRzdEhcclxuICAgIEBjb250ZXh0LnRyYW5zbGF0ZSBhbmNob3JPZmZzZXRYLCBhbmNob3JPZmZzZXRZXHJcbiAgICBAY29udGV4dC5nbG9iYWxBbHBoYSA9IGFcclxuICAgIEBjb250ZXh0LmRyYXdJbWFnZSh0ZXh0dXJlLCBzcmNYLCBzcmNZLCBzcmNXLCBzcmNILCAwLCAwLCBkc3RXLCBkc3RIKVxyXG4gICAgQGNvbnRleHQucmVzdG9yZSgpXHJcblxyXG4gIHVwZGF0ZTogLT5cclxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9PiBAdXBkYXRlKClcclxuXHJcbiAgICBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxyXG4gICAgZHQgPSBub3cgLSBAbGFzdFRpbWVcclxuXHJcbiAgICB0aW1lU2luY2VJbnRlcmFjdCA9IG5vdyAtIEBsYXN0SW50ZXJhY3RUaW1lXHJcbiAgICBpZiB0aW1lU2luY2VJbnRlcmFjdCA+IDUwMDBcclxuICAgICAgZ29hbEZQUyA9IDUgIyBjYWxtIGRvd24sIG5vYm9keSBpcyBkb2luZyBhbnl0aGluZyBmb3IgNSBzZWNvbmRzXHJcbiAgICBlbHNlXHJcbiAgICAgIGdvYWxGUFMgPSAyMDAgIyBhcyBmYXN0IGFzIHBvc3NpYmxlXHJcbiAgICBpZiBAbGFzdEdvYWxGUFMgIT0gZ29hbEZQU1xyXG4gICAgICBjb25zb2xlLmxvZyBcInN3aXRjaGluZyB0byAje2dvYWxGUFN9IEZQU1wiXHJcbiAgICAgIEBsYXN0R29hbEZQUyA9IGdvYWxGUFNcclxuXHJcbiAgICBmcHNJbnRlcnZhbCA9IDEwMDAgLyBnb2FsRlBTXHJcbiAgICBpZiBkdCA8IGZwc0ludGVydmFsXHJcbiAgICAgIHJldHVyblxyXG4gICAgQGxhc3RUaW1lID0gbm93XHJcblxyXG4gICAgQGNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIEB3aWR0aCwgQGhlaWdodClcclxuICAgIEBnYW1lLnVwZGF0ZShkdClcclxuICAgIHJlbmRlckNvbW1hbmRzID0gQGdhbWUucmVuZGVyKClcclxuXHJcbiAgICBpID0gMFxyXG4gICAgbiA9IHJlbmRlckNvbW1hbmRzLmxlbmd0aFxyXG4gICAgd2hpbGUgKGkgPCBuKVxyXG4gICAgICBkcmF3Q2FsbCA9IHJlbmRlckNvbW1hbmRzLnNsaWNlKGksIGkgKz0gMTYpXHJcbiAgICAgIEBkcmF3SW1hZ2UuYXBwbHkodGhpcywgZHJhd0NhbGwpXHJcblxyXG4gICAgQHVwZGF0ZVNhdmUoZHQpXHJcblxyXG4gIG9uVG91Y2hTdGFydDogKGV2dCkgLT5cclxuICAgIEBsYXN0SW50ZXJhY3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcclxuICAgIEBoZWFyZE9uZVRvdWNoID0gdHJ1ZVxyXG4gICAgdG91Y2hlcyA9IGV2dC5jaGFuZ2VkVG91Y2hlc1xyXG4gICAgZm9yIHRvdWNoIGluIHRvdWNoZXNcclxuICAgICAgaWYgQHRvdWNoTW91c2UgPT0gbnVsbFxyXG4gICAgICAgIEB0b3VjaE1vdXNlID0gdG91Y2guaWRlbnRpZmllclxyXG4gICAgICBpZiBAdG91Y2hNb3VzZSA9PSB0b3VjaC5pZGVudGlmaWVyXHJcbiAgICAgICAgQGdhbWUudG91Y2hEb3duKHRvdWNoLmNsaWVudFgsIHRvdWNoLmNsaWVudFkpXHJcblxyXG4gIG9uVG91Y2hNb3ZlOiAoZXZ0KSAtPlxyXG4gICAgQGxhc3RJbnRlcmFjdFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxyXG4gICAgdG91Y2hlcyA9IGV2dC5jaGFuZ2VkVG91Y2hlc1xyXG4gICAgZm9yIHRvdWNoIGluIHRvdWNoZXNcclxuICAgICAgaWYgQHRvdWNoTW91c2UgPT0gdG91Y2guaWRlbnRpZmllclxyXG4gICAgICAgIEBnYW1lLnRvdWNoTW92ZSh0b3VjaC5jbGllbnRYLCB0b3VjaC5jbGllbnRZKVxyXG5cclxuICBvblRvdWNoRW5kOiAoZXZ0KSAtPlxyXG4gICAgQGxhc3RJbnRlcmFjdFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxyXG4gICAgdG91Y2hlcyA9IGV2dC5jaGFuZ2VkVG91Y2hlc1xyXG4gICAgZm9yIHRvdWNoIGluIHRvdWNoZXNcclxuICAgICAgaWYgQHRvdWNoTW91c2UgPT0gdG91Y2guaWRlbnRpZmllclxyXG4gICAgICAgIEBnYW1lLnRvdWNoVXAodG91Y2guY2xpZW50WCwgdG91Y2guY2xpZW50WSlcclxuICAgICAgICBAdG91Y2hNb3VzZSA9IG51bGxcclxuICAgIGlmIGV2dC50b3VjaGVzLmxlbmd0aCA9PSAwXHJcbiAgICAgIEB0b3VjaE1vdXNlID0gbnVsbFxyXG5cclxuICBvbk1vdXNlRG93bjogKGV2dCkgLT5cclxuICAgIGlmIEBoZWFyZE9uZVRvdWNoXHJcbiAgICAgIHJldHVyblxyXG4gICAgQGxhc3RJbnRlcmFjdFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxyXG4gICAgQGdhbWUudG91Y2hEb3duKGV2dC5jbGllbnRYLCBldnQuY2xpZW50WSlcclxuXHJcbiAgb25Nb3VzZU1vdmU6IChldnQpIC0+XHJcbiAgICBpZiBAaGVhcmRPbmVUb3VjaFxyXG4gICAgICByZXR1cm5cclxuICAgIEBsYXN0SW50ZXJhY3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcclxuICAgIEBnYW1lLnRvdWNoTW92ZShldnQuY2xpZW50WCwgZXZ0LmNsaWVudFkpXHJcblxyXG4gIG9uTW91c2VVcDogKGV2dCkgLT5cclxuICAgIGlmIEBoZWFyZE9uZVRvdWNoXHJcbiAgICAgIHJldHVyblxyXG4gICAgQGxhc3RJbnRlcmFjdFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxyXG4gICAgQGdhbWUudG91Y2hVcChldnQuY2xpZW50WCwgZXZ0LmNsaWVudFkpXHJcblxyXG5zY3JlZW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAnc2NyZWVuJ1xyXG5yZXNpemVTY3JlZW4gPSAtPlxyXG4gIGRlc2lyZWRBc3BlY3RSYXRpbyA9IDE2IC8gOVxyXG4gIGN1cnJlbnRBc3BlY3RSYXRpbyA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0XHJcbiAgaWYgY3VycmVudEFzcGVjdFJhdGlvIDwgZGVzaXJlZEFzcGVjdFJhdGlvXHJcbiAgICBzY3JlZW4ud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aFxyXG4gICAgc2NyZWVuLmhlaWdodCA9IE1hdGguZmxvb3Iod2luZG93LmlubmVyV2lkdGggKiAoMSAvIGRlc2lyZWRBc3BlY3RSYXRpbykpXHJcbiAgZWxzZVxyXG4gICAgc2NyZWVuLndpZHRoID0gTWF0aC5mbG9vcih3aW5kb3cuaW5uZXJIZWlnaHQgKiBkZXNpcmVkQXNwZWN0UmF0aW8pXHJcbiAgICBzY3JlZW4uaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0XHJcbnJlc2l6ZVNjcmVlbigpXHJcbiMgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ3Jlc2l6ZScsIHJlc2l6ZVNjcmVlbiwgZmFsc2VcclxuXHJcbmFwcCA9IG5ldyBOYXRpdmVBcHAoc2NyZWVuLCBzY3JlZW4ud2lkdGgsIHNjcmVlbi5oZWlnaHQpXHJcbiJdfQ==
