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

BUILD_TIMESTAMP = "1.0.6";

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQW5pbWF0aW9uLmNvZmZlZSIsInNyYy9CdXR0b24uY29mZmVlIiwic3JjL0ZvbnRSZW5kZXJlci5jb2ZmZWUiLCJzcmMvR2FtZS5jb2ZmZWUiLCJzcmMvSGFuZC5jb2ZmZWUiLCJzcmMvTWVudS5jb2ZmZWUiLCJzcmMvUGlsZS5jb2ZmZWUiLCJzcmMvU3ByaXRlUmVuZGVyZXIuY29mZmVlIiwic3JjL1RoaXJ0ZWVuLmNvZmZlZSIsInNyYy9mb250bWV0cmljcy5jb2ZmZWUiLCJzcmMvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBOztBQUFBLFFBQUEsR0FBVyxTQUFDLENBQUQ7RUFDVCxJQUFHLENBQUEsS0FBSyxDQUFSO0FBQ0UsV0FBTyxFQURUO0dBQUEsTUFFSyxJQUFHLENBQUEsR0FBSSxDQUFQO0FBQ0gsV0FBTyxDQUFDLEVBREw7O0FBRUwsU0FBTztBQUxFOztBQU9MO0VBQ1MsbUJBQUMsSUFBRDtBQUNYLFFBQUE7SUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksQ0FBQztJQUNkLElBQUMsQ0FBQSxHQUFELEdBQU87SUFDUCxJQUFDLENBQUEsR0FBRCxHQUFPO0FBQ1AsU0FBQSxTQUFBOztNQUNFLElBQUcsQ0FBQSxLQUFLLE9BQVI7UUFDRSxJQUFDLENBQUEsR0FBSSxDQUFBLENBQUEsQ0FBTCxHQUFVO1FBQ1YsSUFBQyxDQUFBLEdBQUksQ0FBQSxDQUFBLENBQUwsR0FBVSxFQUZaOztBQURGO0VBSlc7O3NCQVViLElBQUEsR0FBTSxTQUFBO0lBQ0osSUFBRyxrQkFBSDtNQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBTCxHQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFEaEI7O0lBRUEsSUFBRyxrQkFBSDtNQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBTCxHQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFEaEI7O0lBRUEsSUFBRyxvQkFBQSxJQUFZLG9CQUFmO01BQ0UsSUFBQyxDQUFBLEdBQUcsQ0FBQyxDQUFMLEdBQVMsSUFBQyxDQUFBLEdBQUcsQ0FBQzthQUNkLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBTCxHQUFTLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFGaEI7O0VBTEk7O3NCQVNOLFNBQUEsR0FBVyxTQUFBO0lBQ1QsSUFBRyxrQkFBSDtNQUNFLElBQUcsSUFBQyxDQUFBLEdBQUcsQ0FBQyxDQUFMLEtBQVUsSUFBQyxDQUFBLEdBQUcsQ0FBQyxDQUFsQjtBQUNFLGVBQU8sS0FEVDtPQURGOztJQUdBLElBQUcsa0JBQUg7TUFDRSxJQUFHLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBTCxLQUFVLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBbEI7QUFDRSxlQUFPLEtBRFQ7T0FERjs7SUFHQSxJQUFHLG9CQUFBLElBQVksb0JBQWY7TUFDRSxJQUFHLENBQUMsSUFBQyxDQUFBLEdBQUcsQ0FBQyxDQUFMLEtBQVUsSUFBQyxDQUFBLEdBQUcsQ0FBQyxDQUFoQixDQUFBLElBQXNCLENBQUMsSUFBQyxDQUFBLEdBQUcsQ0FBQyxDQUFMLEtBQVUsSUFBQyxDQUFBLEdBQUcsQ0FBQyxDQUFoQixDQUF6QjtBQUNFLGVBQU8sS0FEVDtPQURGOztBQUdBLFdBQU87RUFWRTs7c0JBWVgsTUFBQSxHQUFRLFNBQUMsRUFBRDtBQUNOLFFBQUE7SUFBQSxPQUFBLEdBQVU7SUFFVixJQUFHLGtCQUFIO01BQ0UsSUFBRyxJQUFDLENBQUEsR0FBRyxDQUFDLENBQUwsS0FBVSxJQUFDLENBQUEsR0FBRyxDQUFDLENBQWxCO1FBQ0UsT0FBQSxHQUFVO1FBRVYsS0FBQSxHQUFRLElBQUksQ0FBQyxFQUFMLEdBQVU7UUFDbEIsUUFBQSxHQUFXLENBQUMsQ0FBRCxHQUFLO0FBQ0EsZUFBTSxJQUFDLENBQUEsR0FBRyxDQUFDLENBQUwsSUFBVSxLQUFoQjtVQUFoQixJQUFDLENBQUEsR0FBRyxDQUFDLENBQUwsSUFBVTtRQUFNO0FBQ0EsZUFBTSxJQUFDLENBQUEsR0FBRyxDQUFDLENBQUwsSUFBVSxRQUFoQjtVQUFoQixJQUFDLENBQUEsR0FBRyxDQUFDLENBQUwsSUFBVTtRQUFNO1FBRWhCLEVBQUEsR0FBSyxJQUFDLENBQUEsR0FBRyxDQUFDLENBQUwsR0FBUyxJQUFDLENBQUEsR0FBRyxDQUFDO1FBQ25CLElBQUEsR0FBTyxJQUFJLENBQUMsR0FBTCxDQUFTLEVBQVQ7UUFDUCxJQUFBLEdBQU8sUUFBQSxDQUFTLEVBQVQ7UUFDUCxJQUFHLElBQUEsR0FBTyxJQUFJLENBQUMsRUFBZjtVQUVFLElBQUEsR0FBTyxLQUFBLEdBQVE7VUFDZixJQUFBLElBQVEsQ0FBQyxFQUhYOztRQUlBLE9BQUEsR0FBVSxFQUFBLEdBQUssSUFBQyxDQUFBLEtBQUssQ0FBQyxDQUFaLEdBQWdCO1FBQzFCLElBQUcsSUFBQSxHQUFPLE9BQVY7VUFFRSxJQUFDLENBQUEsR0FBRyxDQUFDLENBQUwsR0FBUyxJQUFDLENBQUEsR0FBRyxDQUFDLEVBRmhCO1NBQUEsTUFBQTtVQUlFLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBTCxJQUFVLE9BQUEsR0FBVSxLQUp0QjtTQWhCRjtPQURGOztJQXdCQSxJQUFHLGtCQUFIO01BQ0UsSUFBRyxJQUFDLENBQUEsR0FBRyxDQUFDLENBQUwsS0FBVSxJQUFDLENBQUEsR0FBRyxDQUFDLENBQWxCO1FBQ0UsT0FBQSxHQUFVO1FBRVYsRUFBQSxHQUFLLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBTCxHQUFTLElBQUMsQ0FBQSxHQUFHLENBQUM7UUFDbkIsSUFBQSxHQUFPLElBQUksQ0FBQyxHQUFMLENBQVMsRUFBVDtRQUNQLElBQUEsR0FBTyxRQUFBLENBQVMsRUFBVDtRQUNQLE9BQUEsR0FBVSxFQUFBLEdBQUssSUFBQyxDQUFBLEtBQUssQ0FBQyxDQUFaLEdBQWdCO1FBQzFCLElBQUcsSUFBQSxHQUFPLE9BQVY7VUFFRSxJQUFDLENBQUEsR0FBRyxDQUFDLENBQUwsR0FBUyxJQUFDLENBQUEsR0FBRyxDQUFDLEVBRmhCO1NBQUEsTUFBQTtVQUlFLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBTCxJQUFVLE9BQUEsR0FBVSxLQUp0QjtTQVBGO09BREY7O0lBZUEsSUFBRyxvQkFBQSxJQUFZLG9CQUFmO01BQ0UsSUFBRyxDQUFDLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBTCxLQUFVLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBaEIsQ0FBQSxJQUFzQixDQUFDLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBTCxLQUFVLElBQUMsQ0FBQSxHQUFHLENBQUMsQ0FBaEIsQ0FBekI7UUFDRSxPQUFBLEdBQVU7UUFDVixJQUFBLEdBQU8sSUFBQyxDQUFBLEdBQUcsQ0FBQyxDQUFMLEdBQVMsSUFBQyxDQUFBLEdBQUcsQ0FBQztRQUNyQixJQUFBLEdBQU8sSUFBQyxDQUFBLEdBQUcsQ0FBQyxDQUFMLEdBQVMsSUFBQyxDQUFBLEdBQUcsQ0FBQztRQUNyQixJQUFBLEdBQU8sSUFBSSxDQUFDLElBQUwsQ0FBVSxDQUFDLElBQUEsR0FBTyxJQUFSLENBQUEsR0FBZ0IsQ0FBQyxJQUFBLEdBQU8sSUFBUixDQUExQjtRQUNQLE9BQUEsR0FBVSxFQUFBLEdBQUssSUFBQyxDQUFBLEtBQUssQ0FBQyxDQUFaLEdBQWdCO1FBQzFCLElBQUcsSUFBQSxHQUFPLE9BQVY7VUFFRSxJQUFDLENBQUEsR0FBRyxDQUFDLENBQUwsR0FBUyxJQUFDLENBQUEsR0FBRyxDQUFDO1VBQ2QsSUFBQyxDQUFBLEdBQUcsQ0FBQyxDQUFMLEdBQVMsSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUhoQjtTQUFBLE1BQUE7VUFNRSxJQUFDLENBQUEsR0FBRyxDQUFDLENBQUwsSUFBVSxDQUFDLElBQUEsR0FBTyxJQUFSLENBQUEsR0FBZ0I7VUFDMUIsSUFBQyxDQUFBLEdBQUcsQ0FBQyxDQUFMLElBQVUsQ0FBQyxJQUFBLEdBQU8sSUFBUixDQUFBLEdBQWdCLFFBUDVCO1NBTkY7T0FERjs7QUFnQkEsV0FBTztFQTFERDs7Ozs7O0FBNERWLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOzs7O0FDbkdqQixJQUFBOztBQUFBLFNBQUEsR0FBWSxPQUFBLENBQVEsYUFBUjs7QUFFTjtFQUNTLGdCQUFDLElBQUQsRUFBUSxXQUFSLEVBQXNCLElBQXRCLEVBQTZCLFVBQTdCLEVBQTBDLENBQTFDLEVBQThDLENBQTlDLEVBQWtELEVBQWxEO0lBQUMsSUFBQyxDQUFBLE9BQUQ7SUFBTyxJQUFDLENBQUEsY0FBRDtJQUFjLElBQUMsQ0FBQSxPQUFEO0lBQU8sSUFBQyxDQUFBLGFBQUQ7SUFBYSxJQUFDLENBQUEsSUFBRDtJQUFJLElBQUMsQ0FBQSxJQUFEO0lBQUksSUFBQyxDQUFBLEtBQUQ7SUFDN0QsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFJLFNBQUosQ0FBYztNQUNwQixLQUFBLEVBQU87UUFBRSxDQUFBLEVBQUcsQ0FBTDtPQURhO01BRXBCLENBQUEsRUFBRyxDQUZpQjtLQUFkO0lBSVIsSUFBQyxDQUFBLEtBQUQsR0FBUztNQUFFLENBQUEsRUFBRyxDQUFMO01BQVEsQ0FBQSxFQUFHLENBQVg7TUFBYyxDQUFBLEVBQUcsQ0FBakI7TUFBb0IsQ0FBQSxFQUFHLENBQXZCOztFQUxFOzttQkFPYixNQUFBLEdBQVEsU0FBQyxFQUFEO0FBQ04sV0FBTyxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sQ0FBYSxFQUFiO0VBREQ7O21CQUdSLE1BQUEsR0FBUSxTQUFBO0FBQ04sUUFBQTtJQUFBLElBQUMsQ0FBQSxLQUFLLENBQUMsQ0FBUCxHQUFXLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBRyxDQUFDO0lBQ3JCLElBQUMsQ0FBQSxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQXJCLENBQTRCLElBQUMsQ0FBQSxXQUFZLENBQUEsQ0FBQSxDQUF6QyxFQUE2QyxJQUFDLENBQUEsQ0FBOUMsRUFBaUQsSUFBQyxDQUFBLENBQWxELEVBQXFELENBQXJELEVBQXdELElBQUMsQ0FBQSxVQUFELEdBQWMsR0FBdEUsRUFBMkUsQ0FBM0UsRUFBOEUsR0FBOUUsRUFBbUYsR0FBbkYsRUFBd0YsSUFBQyxDQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBckcsRUFBNEcsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFBO1FBRTFHLEtBQUMsQ0FBQSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQVYsR0FBYztRQUNkLEtBQUMsQ0FBQSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQVYsR0FBYztlQUVkLEtBQUMsQ0FBQSxFQUFELENBQUksSUFBSjtNQUwwRztJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBNUc7SUFNQSxJQUFDLENBQUEsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFyQixDQUE0QixJQUFDLENBQUEsV0FBWSxDQUFBLENBQUEsQ0FBekMsRUFBNkMsSUFBQyxDQUFBLENBQTlDLEVBQWlELElBQUMsQ0FBQSxDQUFsRCxFQUFxRCxDQUFyRCxFQUF3RCxJQUFDLENBQUEsVUFBRCxHQUFjLEdBQXRFLEVBQTJFLENBQTNFLEVBQThFLEdBQTlFLEVBQW1GLEdBQW5GLEVBQXdGLElBQUMsQ0FBQSxLQUF6RjtJQUNBLElBQUEsR0FBTyxJQUFDLENBQUEsRUFBRCxDQUFJLEtBQUo7V0FDUCxJQUFDLENBQUEsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFuQixDQUEwQixJQUFDLENBQUEsSUFBM0IsRUFBaUMsSUFBQyxDQUFBLFVBQWxDLEVBQThDLElBQTlDLEVBQW9ELElBQUMsQ0FBQSxDQUFyRCxFQUF3RCxJQUFDLENBQUEsQ0FBekQsRUFBNEQsR0FBNUQsRUFBaUUsR0FBakUsRUFBc0UsSUFBQyxDQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBbkY7RUFWTTs7Ozs7O0FBWVYsTUFBTSxDQUFDLE9BQVAsR0FBaUI7Ozs7QUN6QmpCLElBQUE7O0FBQUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxlQUFSOztBQUdkLFFBQUEsR0FBVyxTQUFDLEdBQUQsRUFBTSxDQUFOO0FBQ1AsTUFBQTtFQUFBLE1BQUEsR0FBUywyQ0FBMkMsQ0FBQyxJQUE1QyxDQUFpRCxHQUFqRDtFQUNULElBQWUsQ0FBSSxNQUFuQjtBQUFBLFdBQU8sS0FBUDs7QUFDQSxTQUFPO0lBQ0gsQ0FBQSxFQUFHLFFBQUEsQ0FBUyxNQUFPLENBQUEsQ0FBQSxDQUFoQixFQUFvQixFQUFwQixDQUFBLEdBQTBCLEdBRDFCO0lBRUgsQ0FBQSxFQUFHLFFBQUEsQ0FBUyxNQUFPLENBQUEsQ0FBQSxDQUFoQixFQUFvQixFQUFwQixDQUFBLEdBQTBCLEdBRjFCO0lBR0gsQ0FBQSxFQUFHLFFBQUEsQ0FBUyxNQUFPLENBQUEsQ0FBQSxDQUFoQixFQUFvQixFQUFwQixDQUFBLEdBQTBCLEdBSDFCO0lBSUgsQ0FBQSxFQUFHLENBSkE7O0FBSEE7O0FBVUw7RUFDVSxzQkFBQyxJQUFEO0lBQUMsSUFBQyxDQUFBLE9BQUQ7SUFDYixJQUFDLENBQUEsS0FBRCxHQUFTO01BQUUsQ0FBQSxFQUFHLENBQUw7TUFBUSxDQUFBLEVBQUcsQ0FBWDtNQUFjLENBQUEsRUFBRyxDQUFqQjtNQUFvQixDQUFBLEVBQUcsQ0FBdkI7O0VBREc7O3lCQUdkLElBQUEsR0FBTSxTQUFDLElBQUQsRUFBTyxNQUFQLEVBQWUsR0FBZjtBQUNKLFFBQUE7SUFBQSxPQUFBLEdBQVUsV0FBWSxDQUFBLElBQUE7SUFDdEIsSUFBVSxDQUFJLE9BQWQ7QUFBQSxhQUFBOztJQUNBLEtBQUEsR0FBUSxNQUFBLEdBQVMsT0FBTyxDQUFDO0lBRXpCLFVBQUEsR0FBYTtJQUNiLFdBQUEsR0FBYyxPQUFPLENBQUMsTUFBUixHQUFpQjtJQUUvQixPQUFBLEdBQVU7QUFDVixTQUFBLCtDQUFBOztNQUNFLElBQUcsRUFBQSxLQUFNLEdBQVQ7UUFDRSxPQUFBLEdBQVUsQ0FBQyxRQURiOztNQUdBLElBQUcsQ0FBSSxPQUFQO1FBQ0UsSUFBQSxHQUFPLEVBQUUsQ0FBQyxVQUFILENBQWMsQ0FBZDtRQUNQLEtBQUEsR0FBUSxPQUFPLENBQUMsTUFBTyxDQUFBLElBQUE7UUFDdkIsSUFBWSxDQUFJLEtBQWhCO0FBQUEsbUJBQUE7O1FBQ0EsVUFBQSxJQUFjLEtBQUssQ0FBQyxRQUFOLEdBQWlCLE1BSmpDOztBQUpGO0FBVUEsV0FBTztNQUNMLENBQUEsRUFBRyxVQURFO01BRUwsQ0FBQSxFQUFHLFdBRkU7O0VBbkJIOzt5QkF3Qk4sTUFBQSxHQUFRLFNBQUMsSUFBRCxFQUFPLE1BQVAsRUFBZSxHQUFmLEVBQW9CLENBQXBCLEVBQXVCLENBQXZCLEVBQTBCLE9BQTFCLEVBQW1DLE9BQW5DLEVBQTRDLEtBQTVDLEVBQW1ELEVBQW5EO0FBQ04sUUFBQTtJQUFBLE9BQUEsR0FBVSxXQUFZLENBQUEsSUFBQTtJQUN0QixJQUFVLENBQUksT0FBZDtBQUFBLGFBQUE7O0lBQ0EsS0FBQSxHQUFRLE1BQUEsR0FBUyxPQUFPLENBQUM7SUFFekIsVUFBQSxHQUFhO0lBQ2IsV0FBQSxHQUFjLE9BQU8sQ0FBQyxNQUFSLEdBQWlCO0lBQy9CLFNBQUEsR0FBWTtBQUNaLFNBQUEsK0NBQUE7O01BQ0UsSUFBRyxFQUFBLEtBQU0sR0FBVDtRQUNFLFNBQUEsR0FBWSxDQUFDLFVBRGY7O01BRUEsSUFBWSxTQUFaO0FBQUEsaUJBQUE7O01BQ0EsSUFBQSxHQUFPLEVBQUUsQ0FBQyxVQUFILENBQWMsQ0FBZDtNQUNQLEtBQUEsR0FBUSxPQUFPLENBQUMsTUFBTyxDQUFBLElBQUE7TUFDdkIsSUFBWSxDQUFJLEtBQWhCO0FBQUEsaUJBQUE7O01BQ0EsVUFBQSxJQUFjLEtBQUssQ0FBQyxRQUFOLEdBQWlCO0FBUGpDO0lBU0EsYUFBQSxHQUFnQixDQUFDLENBQUQsR0FBSyxPQUFMLEdBQWU7SUFDL0IsYUFBQSxHQUFnQixDQUFDLENBQUQsR0FBSyxPQUFMLEdBQWU7SUFDL0IsS0FBQSxHQUFRO0lBRVIsSUFBRyxLQUFIO01BQ0UsYUFBQSxHQUFnQixNQURsQjtLQUFBLE1BQUE7TUFHRSxhQUFBLEdBQWdCLElBQUMsQ0FBQSxNQUhuQjs7SUFJQSxZQUFBLEdBQWU7SUFFZixVQUFBLEdBQWEsQ0FBQztBQUNkO1NBQUEsK0NBQUE7O01BQ0UsSUFBRyxFQUFBLEtBQU0sR0FBVDtRQUNFLElBQUcsVUFBQSxLQUFjLENBQUMsQ0FBbEI7VUFDRSxVQUFBLEdBQWEsQ0FBQSxHQUFJLEVBRG5CO1NBQUEsTUFBQTtVQUdFLEdBQUEsR0FBTSxDQUFBLEdBQUk7VUFDVixJQUFHLEdBQUg7WUFDRSxZQUFBLEdBQWUsUUFBQSxDQUFTLEdBQUcsQ0FBQyxNQUFKLENBQVcsVUFBWCxFQUF1QixDQUFBLEdBQUksVUFBM0IsQ0FBVCxFQUFpRCxhQUFhLENBQUMsQ0FBL0QsRUFEakI7V0FBQSxNQUFBO1lBR0UsWUFBQSxHQUFlLGNBSGpCOztVQUlBLFVBQUEsR0FBYSxDQUFDLEVBUmhCO1NBREY7O01BV0EsSUFBWSxVQUFBLEtBQWMsQ0FBQyxDQUEzQjtBQUFBLGlCQUFBOztNQUNBLElBQUEsR0FBTyxFQUFFLENBQUMsVUFBSCxDQUFjLENBQWQ7TUFDUCxLQUFBLEdBQVEsT0FBTyxDQUFDLE1BQU8sQ0FBQSxJQUFBO01BQ3ZCLElBQVksQ0FBSSxLQUFoQjtBQUFBLGlCQUFBOztNQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBTixDQUFnQixJQUFoQixFQUNBLEtBQUssQ0FBQyxDQUROLEVBQ1MsS0FBSyxDQUFDLENBRGYsRUFDa0IsS0FBSyxDQUFDLEtBRHhCLEVBQytCLEtBQUssQ0FBQyxNQURyQyxFQUVBLEtBQUEsR0FBUSxDQUFDLEtBQUssQ0FBQyxPQUFOLEdBQWdCLEtBQWpCLENBQVIsR0FBa0MsYUFGbEMsRUFFaUQsQ0FBQSxHQUFJLENBQUMsS0FBSyxDQUFDLE9BQU4sR0FBZ0IsS0FBakIsQ0FBSixHQUE4QixhQUYvRSxFQUU4RixLQUFLLENBQUMsS0FBTixHQUFjLEtBRjVHLEVBRW1ILEtBQUssQ0FBQyxNQUFOLEdBQWUsS0FGbEksRUFHQSxDQUhBLEVBR0csQ0FISCxFQUdNLENBSE4sRUFJQSxZQUFZLENBQUMsQ0FKYixFQUlnQixZQUFZLENBQUMsQ0FKN0IsRUFJZ0MsWUFBWSxDQUFDLENBSjdDLEVBSWdELFlBQVksQ0FBQyxDQUo3RCxFQUlnRSxFQUpoRTttQkFLQSxLQUFBLElBQVMsS0FBSyxDQUFDLFFBQU4sR0FBaUI7QUFyQjVCOztFQTVCTTs7Ozs7O0FBbURWLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOzs7O0FDNUZqQixJQUFBOztBQUFBLFNBQUEsR0FBWSxPQUFBLENBQVEsYUFBUjs7QUFDWixNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0FBQ1QsWUFBQSxHQUFlLE9BQUEsQ0FBUSxnQkFBUjs7QUFDZixjQUFBLEdBQWlCLE9BQUEsQ0FBUSxrQkFBUjs7QUFDakIsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztBQUNQLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7QUFDUCxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0FBQ1AsTUFBaUQsT0FBQSxDQUFRLFlBQVIsQ0FBakQsRUFBQyx1QkFBRCxFQUFXLFdBQVgsRUFBZSwrQkFBZixFQUE2Qjs7QUFHN0IsZUFBQSxHQUFrQjs7QUFFWjtFQUNTLGNBQUMsT0FBRCxFQUFVLEtBQVYsRUFBa0IsTUFBbEI7SUFBQyxJQUFDLEVBQUEsTUFBQSxLQUFEO0lBQVMsSUFBQyxDQUFBLFFBQUQ7SUFBUSxJQUFDLENBQUEsU0FBRDtJQUM3QixJQUFDLENBQUEsT0FBRCxHQUFXO0lBQ1gsSUFBQyxDQUFBLEdBQUQsQ0FBSyxvQkFBQSxHQUFxQixJQUFDLENBQUEsS0FBdEIsR0FBNEIsR0FBNUIsR0FBK0IsSUFBQyxDQUFBLE1BQXJDO0lBQ0EsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsSUFBSSxZQUFKLENBQWlCLElBQWpCO0lBQ2hCLElBQUMsQ0FBQSxjQUFELEdBQWtCLElBQUksY0FBSixDQUFtQixJQUFuQjtJQUNsQixJQUFDLENBQUEsSUFBRCxHQUFRO0lBQ1IsSUFBQyxDQUFBLEtBQUQsR0FBUztJQUNULElBQUMsQ0FBQSxVQUFELEdBQWM7SUFDZCxJQUFDLENBQUEsTUFBRCxHQUNFO01BQUEsQ0FBQSxFQUFHLElBQUMsQ0FBQSxLQUFELEdBQVMsQ0FBWjtNQUNBLENBQUEsRUFBRyxJQUFDLENBQUEsTUFBRCxHQUFVLENBRGI7O0lBRUYsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFDLENBQUEsS0FBRCxHQUFTLENBQVQsR0FBYTtJQUN6QixJQUFDLENBQUEsR0FBRCxDQUFLLFVBQUEsR0FBVyxJQUFDLENBQUEsTUFBWixHQUFtQixpREFBbkIsR0FBb0UsSUFBQyxDQUFBLFFBQTFFO0lBQ0EsSUFBQyxDQUFBLGVBQUQsR0FBbUIsSUFBQyxDQUFBLFFBQUQsR0FBWTtJQUMvQixJQUFDLENBQUEsTUFBRCxHQUNFO01BQUEsS0FBQSxFQUFZO1FBQUUsQ0FBQSxFQUFLLENBQVA7UUFBVSxDQUFBLEVBQUssQ0FBZjtRQUFrQixDQUFBLEVBQUssQ0FBdkI7UUFBMEIsQ0FBQSxFQUFLLENBQS9CO09BQVo7TUFDQSxVQUFBLEVBQVk7UUFBRSxDQUFBLEVBQUssQ0FBUDtRQUFVLENBQUEsRUFBRyxHQUFiO1FBQWtCLENBQUEsRUFBSyxDQUF2QjtRQUEwQixDQUFBLEVBQUcsR0FBN0I7T0FEWjtNQUVBLFVBQUEsRUFBWTtRQUFFLENBQUEsRUFBSyxDQUFQO1FBQVUsQ0FBQSxFQUFHLEdBQWI7UUFBa0IsQ0FBQSxFQUFLLENBQXZCO1FBQTBCLENBQUEsRUFBSyxDQUEvQjtPQUZaO01BR0EsR0FBQSxFQUFZO1FBQUUsQ0FBQSxFQUFLLENBQVA7UUFBVSxDQUFBLEVBQUcsR0FBYjtRQUFrQixDQUFBLEVBQUssQ0FBdkI7UUFBMEIsQ0FBQSxFQUFLLENBQS9CO09BSFo7TUFJQSxLQUFBLEVBQVk7UUFBRSxDQUFBLEVBQUssQ0FBUDtRQUFVLENBQUEsRUFBSyxDQUFmO1FBQWtCLENBQUEsRUFBSyxDQUF2QjtRQUEwQixDQUFBLEVBQUssQ0FBL0I7T0FKWjtNQUtBLFVBQUEsRUFBWTtRQUFFLENBQUEsRUFBSyxDQUFQO1FBQVUsQ0FBQSxFQUFLLENBQWY7UUFBa0IsQ0FBQSxFQUFLLENBQXZCO1FBQTBCLENBQUEsRUFBSyxDQUEvQjtPQUxaO01BTUEsU0FBQSxFQUFZO1FBQUUsQ0FBQSxFQUFLLENBQVA7UUFBVSxDQUFBLEVBQUcsR0FBYjtRQUFrQixDQUFBLEVBQUssQ0FBdkI7UUFBMEIsQ0FBQSxFQUFLLENBQS9CO09BTlo7TUFPQSxJQUFBLEVBQVk7UUFBRSxDQUFBLEVBQUssQ0FBUDtRQUFVLENBQUEsRUFBSyxDQUFmO1FBQWtCLENBQUEsRUFBSyxDQUF2QjtRQUEwQixDQUFBLEVBQUssQ0FBL0I7T0FQWjtNQVFBLFFBQUEsRUFBWTtRQUFFLENBQUEsRUFBSyxDQUFQO1FBQVUsQ0FBQSxFQUFLLENBQWY7UUFBa0IsQ0FBQSxFQUFHLEdBQXJCO1FBQTBCLENBQUEsRUFBRyxHQUE3QjtPQVJaO01BU0EsU0FBQSxFQUFZO1FBQUUsQ0FBQSxFQUFLLENBQVA7UUFBVSxDQUFBLEVBQUcsR0FBYjtRQUFrQixDQUFBLEVBQUssQ0FBdkI7UUFBMEIsQ0FBQSxFQUFHLEdBQTdCO09BVFo7TUFVQSxVQUFBLEVBQVk7UUFBRSxDQUFBLEVBQUcsR0FBTDtRQUFVLENBQUEsRUFBSyxDQUFmO1FBQWtCLENBQUEsRUFBSyxDQUF2QjtRQUEwQixDQUFBLEVBQUcsR0FBN0I7T0FWWjtNQVdBLFNBQUEsRUFBWTtRQUFFLENBQUEsRUFBRyxHQUFMO1FBQVUsQ0FBQSxFQUFHLEdBQWI7UUFBa0IsQ0FBQSxFQUFHLEdBQXJCO1FBQTBCLENBQUEsRUFBSyxDQUEvQjtPQVhaO01BWUEsS0FBQSxFQUFZO1FBQUUsQ0FBQSxFQUFHLEdBQUw7UUFBVSxDQUFBLEVBQUssQ0FBZjtRQUFrQixDQUFBLEVBQUssQ0FBdkI7UUFBMEIsQ0FBQSxFQUFLLENBQS9CO09BWlo7TUFhQSxRQUFBLEVBQVk7UUFBRSxDQUFBLEVBQUcsR0FBTDtRQUFVLENBQUEsRUFBRyxHQUFiO1FBQWtCLENBQUEsRUFBRyxHQUFyQjtRQUEwQixDQUFBLEVBQUssQ0FBL0I7T0FiWjtNQWNBLFFBQUEsRUFBWTtRQUFFLENBQUEsRUFBRyxHQUFMO1FBQVUsQ0FBQSxFQUFHLEdBQWI7UUFBa0IsQ0FBQSxFQUFHLEdBQXJCO1FBQTBCLENBQUEsRUFBSyxDQUEvQjtPQWRaO01BZUEsTUFBQSxFQUFZO1FBQUUsQ0FBQSxFQUFLLENBQVA7UUFBVSxDQUFBLEVBQUcsR0FBYjtRQUFrQixDQUFBLEVBQUssQ0FBdkI7UUFBMEIsQ0FBQSxFQUFLLENBQS9CO09BZlo7TUFnQkEsT0FBQSxFQUFZO1FBQUUsQ0FBQSxFQUFLLENBQVA7UUFBVSxDQUFBLEVBQUssQ0FBZjtRQUFrQixDQUFBLEVBQUssQ0FBdkI7UUFBMEIsQ0FBQSxFQUFHLEdBQTdCO09BaEJaO01BaUJBLFNBQUEsRUFBWTtRQUFFLENBQUEsRUFBRyxHQUFMO1FBQVUsQ0FBQSxFQUFHLEdBQWI7UUFBa0IsQ0FBQSxFQUFHLEdBQXJCO1FBQTBCLENBQUEsRUFBSyxDQUEvQjtPQWpCWjtNQWtCQSxJQUFBLEVBQVk7UUFBRSxDQUFBLEVBQUcsR0FBTDtRQUFVLENBQUEsRUFBRyxHQUFiO1FBQWtCLENBQUEsRUFBSyxDQUF2QjtRQUEwQixDQUFBLEVBQUssQ0FBL0I7T0FsQlo7TUFtQkEsVUFBQSxFQUFZO1FBQUUsQ0FBQSxFQUFLLENBQVA7UUFBVSxDQUFBLEVBQUssQ0FBZjtRQUFrQixDQUFBLEVBQUssQ0FBdkI7UUFBMEIsQ0FBQSxFQUFHLEdBQTdCO09BbkJaO01Bb0JBLEdBQUEsRUFBWTtRQUFFLENBQUEsRUFBSyxDQUFQO1FBQVUsQ0FBQSxFQUFLLENBQWY7UUFBa0IsQ0FBQSxFQUFLLENBQXZCO1FBQTBCLENBQUEsRUFBSyxDQUEvQjtPQXBCWjtNQXFCQSxLQUFBLEVBQVk7UUFBRSxDQUFBLEVBQUssQ0FBUDtRQUFVLENBQUEsRUFBSyxDQUFmO1FBQWtCLENBQUEsRUFBSyxDQUF2QjtRQUEwQixDQUFBLEVBQUssQ0FBL0I7T0FyQlo7TUFzQkEsTUFBQSxFQUFZO1FBQUUsQ0FBQSxFQUFHLEdBQUw7UUFBVSxDQUFBLEVBQUcsR0FBYjtRQUFrQixDQUFBLEVBQUcsR0FBckI7UUFBMEIsQ0FBQSxFQUFLLENBQS9CO09BdEJaO01BdUJBLFVBQUEsRUFBWTtRQUFFLENBQUEsRUFBSyxDQUFQO1FBQVUsQ0FBQSxFQUFHLEdBQWI7UUFBa0IsQ0FBQSxFQUFLLENBQXZCO1FBQTBCLENBQUEsRUFBSyxDQUEvQjtPQXZCWjtNQXdCQSxTQUFBLEVBQVk7UUFBRSxDQUFBLEVBQUssQ0FBUDtRQUFVLENBQUEsRUFBSyxDQUFmO1FBQWtCLENBQUEsRUFBSyxDQUF2QjtRQUEwQixDQUFBLEVBQUssQ0FBL0I7T0F4Qlo7TUF5QkEsUUFBQSxFQUFZO1FBQUUsQ0FBQSxFQUFHLEdBQUw7UUFBVSxDQUFBLEVBQUcsR0FBYjtRQUFrQixDQUFBLEVBQUcsR0FBckI7UUFBMEIsQ0FBQSxFQUFLLENBQS9CO09BekJaOztJQTJCRixJQUFDLENBQUEsUUFBRCxHQUNFO01BQUEsT0FBQSxFQUFTLENBQVQ7TUFDQSxZQUFBLEVBQWMsQ0FEZDtNQUVBLE9BQUEsRUFBUyxDQUZUO01BR0EsUUFBQSxFQUFVLENBSFY7O0lBS0YsSUFBQyxDQUFBLFFBQUQsR0FBWTtJQUNaLElBQUMsQ0FBQSxPQUFELEdBQVc7SUFDWCxJQUFDLENBQUEsTUFBRCxHQUFVO0lBQ1YsSUFBQyxDQUFBLFVBQUQsR0FBYztJQUNkLElBQUMsQ0FBQSxjQUFELEdBQWtCO0lBQ2xCLElBQUMsQ0FBQSxrQkFBRCxHQUFzQjtJQUV0QixJQUFDLENBQUEsV0FBRCxHQUNFO01BQUEsTUFBQSxFQUFRO1FBQ047VUFBRSxJQUFBLEVBQU0sZ0JBQVI7VUFBMEIsS0FBQSxFQUFPLElBQWpDO1NBRE0sRUFFTjtVQUFFLElBQUEsRUFBTSxrQkFBUjtVQUE0QixLQUFBLEVBQU8sSUFBbkM7U0FGTSxFQUdOO1VBQUUsSUFBQSxFQUFNLGdCQUFSO1VBQTBCLEtBQUEsRUFBTyxHQUFqQztTQUhNLEVBSU47VUFBRSxJQUFBLEVBQU0saUJBQVI7VUFBMkIsS0FBQSxFQUFPLEdBQWxDO1NBSk07T0FBUjtNQU1BLEtBQUEsRUFBTztRQUNMO1VBQUUsSUFBQSxFQUFNLG9CQUFSO1NBREssRUFFTDtVQUFFLElBQUEsRUFBTSxxQkFBUjtTQUZLO09BTlA7O0lBVUYsSUFBQyxDQUFBLE9BQUQsR0FDRTtNQUFBLFVBQUEsRUFBWSxDQUFaO01BQ0EsU0FBQSxFQUFXLENBRFg7TUFFQSxLQUFBLEVBQU8sSUFGUDs7SUFJRixJQUFDLENBQUEsU0FBRCxHQUFhLElBQUksSUFBSixDQUFTLElBQVQsRUFBZSxRQUFmLEVBQXlCLE9BQXpCLEVBQWtDLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBMUMsRUFBcUQ7TUFDaEUsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEtBQUQ7VUFDRSxJQUFHLEtBQUg7WUFDRSxLQUFDLENBQUEsTUFBRCxHQUFVLE1BRFo7O0FBRUEsaUJBQU87UUFIVDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FEZ0UsRUFLaEUsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEtBQUQ7VUFDRSxJQUFHLEtBQUg7WUFDRSxLQUFDLENBQUEsVUFBRCxHQUFjLEVBRGhCOztBQUVBLGlCQUFPO1FBSFQ7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBTGdFLEVBU2hFLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxLQUFEO1VBQ0UsSUFBRyxLQUFIO1lBQ0UsS0FBQyxDQUFBLFVBQUQsR0FBYyxFQURoQjs7QUFFQSxpQkFBTztRQUhUO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVRnRSxFQWFoRSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsS0FBRDtVQUNFLElBQUcsS0FBSDtZQUNFLEtBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxHQUFxQixDQUFDLEtBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxHQUFxQixDQUF0QixDQUFBLEdBQTJCLEtBQUMsQ0FBQSxXQUFXLENBQUMsS0FBSyxDQUFDLE9BRHJFOztBQUVBLGlCQUFPLEtBQUMsQ0FBQSxXQUFXLENBQUMsS0FBTSxDQUFBLEtBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxDQUFtQixDQUFDO1FBSGhEO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQWJnRSxFQWlCaEUsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEtBQUQ7VUFDRSxJQUFHLEtBQUg7WUFDRSxLQUFDLENBQUEsT0FBTyxDQUFDLFVBQVQsR0FBc0IsQ0FBQyxLQUFDLENBQUEsT0FBTyxDQUFDLFVBQVQsR0FBc0IsQ0FBdkIsQ0FBQSxHQUE0QixLQUFDLENBQUEsV0FBVyxDQUFDLE1BQU0sQ0FBQyxPQUR4RTs7QUFFQSxpQkFBTyxLQUFDLENBQUEsV0FBVyxDQUFDLE1BQU8sQ0FBQSxLQUFDLENBQUEsT0FBTyxDQUFDLFVBQVQsQ0FBb0IsQ0FBQztRQUhsRDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FqQmdFLEVBcUJoRSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsS0FBRDtVQUNFLElBQUcsS0FBSDtZQUNFLEtBQUMsQ0FBQSxPQUFELENBQVMsSUFBVDtZQUNBLEtBQUMsQ0FBQSxNQUFELEdBQVUsTUFGWjs7QUFHQSxpQkFBTztRQUpUO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQXJCZ0UsRUEwQmhFLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxLQUFEO1VBQ0UsSUFBRyxLQUFIO1lBQ0UsS0FBQyxDQUFBLE9BQUQsQ0FBUyxLQUFUO1lBQ0EsS0FBQyxDQUFBLE1BQUQsR0FBVSxNQUZaOztBQUdBLGlCQUFPO1FBSlQ7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBMUJnRTtLQUFyRDtJQWlDYixJQUFDLENBQUEsUUFBRCxHQUFZLElBQUksUUFBSixDQUFhLElBQWIsRUFBbUIsRUFBbkI7SUFDWixJQUFDLENBQUEsR0FBRCxDQUFLLG1CQUFBLEdBQXNCLElBQUksQ0FBQyxTQUFMLENBQWUsSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBcEMsQ0FBM0I7SUFDQSxJQUFDLENBQUEsV0FBRCxDQUFBO0VBMUdXOztpQkErR2IsR0FBQSxHQUFLLFNBQUMsQ0FBRDtXQUNILElBQUMsRUFBQSxNQUFBLEVBQU0sQ0FBQyxHQUFSLENBQVksQ0FBWjtFQURHOztpQkFNTCxJQUFBLEdBQU0sU0FBQyxJQUFEO0FBQ0osUUFBQTtJQUFBLElBQUMsQ0FBQSxHQUFELENBQUssb0JBQUw7QUFDQTtNQUNFLEtBQUEsR0FBUSxJQUFJLENBQUMsS0FBTCxDQUFXLElBQVgsRUFEVjtLQUFBLGFBQUE7TUFHRSxJQUFDLENBQUEsR0FBRCxDQUFLLDhCQUFBLEdBQStCLElBQXBDO0FBQ0EsYUFKRjs7SUFLQSxJQUFHLEtBQUssQ0FBQyxPQUFUO0FBQ0U7QUFBQSxXQUFBLFNBQUE7O1FBQ0UsSUFBQyxDQUFBLE9BQVEsQ0FBQSxDQUFBLENBQVQsR0FBYztBQURoQixPQURGOztJQUlBLElBQUcsS0FBSyxDQUFDLFFBQVQ7TUFDRSxJQUFDLENBQUEsR0FBRCxDQUFLLCtCQUFMO01BQ0EsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFJLFFBQUosQ0FBYSxJQUFiLEVBQW1CO1FBQzdCLEtBQUEsRUFBTyxLQUFLLENBQUMsUUFEZ0I7T0FBbkI7YUFHWixJQUFDLENBQUEsV0FBRCxDQUFBLEVBTEY7O0VBWEk7O2lCQWtCTixJQUFBLEdBQU0sU0FBQTtBQUVKLFFBQUE7SUFBQSxLQUFBLEdBQVE7TUFDTixPQUFBLEVBQVMsSUFBQyxDQUFBLE9BREo7O0lBSVIsSUFBRyxxQkFBSDtNQUNFLElBQUMsQ0FBQSxRQUFRLENBQUMsZ0JBQVYsQ0FBMkIsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFqQztNQUNBLEtBQUssQ0FBQyxRQUFOLEdBQWlCLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixDQUFBLEVBRm5COztBQUlBLFdBQU8sSUFBSSxDQUFDLFNBQUwsQ0FBZSxLQUFmO0VBVkg7O2lCQWNOLFVBQUEsR0FBWSxTQUFBO0FBQ1YsV0FBTyxJQUFDLENBQUEsV0FBVyxDQUFDLE1BQU8sQ0FBQSxJQUFDLENBQUEsT0FBTyxDQUFDLFVBQVQsQ0FBb0IsQ0FBQztFQUR0Qzs7aUJBR1osT0FBQSxHQUFTLFNBQUMsS0FBRDtJQUNQLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBVixDQUFrQixLQUFsQjtXQUNBLElBQUMsQ0FBQSxXQUFELENBQUE7RUFGTzs7aUJBSVQsV0FBQSxHQUFhLFNBQUE7SUFDWCxJQUFDLENBQUEsSUFBRCxHQUFRLElBQUksSUFBSixDQUFTLElBQVQ7SUFDUixJQUFDLENBQUEsSUFBRCxHQUFRLElBQUksSUFBSixDQUFTLElBQVQsRUFBZSxJQUFDLENBQUEsSUFBaEI7SUFDUixJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBVSxJQUFDLENBQUEsUUFBUSxDQUFDLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUEvQjtXQUNBLElBQUMsQ0FBQSxPQUFELEdBQVc7RUFKQTs7aUJBU2IsU0FBQSxHQUFXLFNBQUMsQ0FBRCxFQUFJLENBQUo7V0FFVCxJQUFDLENBQUEsVUFBRCxDQUFZLENBQVosRUFBZSxDQUFmO0VBRlM7O2lCQUlYLFNBQUEsR0FBVyxTQUFDLENBQUQsRUFBSSxDQUFKO0lBRVQsSUFBRyxJQUFDLENBQUEsUUFBRCxLQUFhLElBQWhCO2FBQ0UsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVcsQ0FBWCxFQUFjLENBQWQsRUFERjs7RUFGUzs7aUJBS1gsT0FBQSxHQUFTLFNBQUMsQ0FBRCxFQUFJLENBQUo7SUFFUCxJQUFHLElBQUMsQ0FBQSxRQUFELEtBQWEsSUFBaEI7YUFDRSxJQUFDLENBQUEsSUFBSSxDQUFDLEVBQU4sQ0FBUyxDQUFULEVBQVksQ0FBWixFQURGOztFQUZPOztpQkFRVCxnQkFBQSxHQUFrQjtJQUNkLFFBQUEsRUFBb0IsbUJBRE47SUFFZCxXQUFBLEVBQW9CLG1CQUZOO0lBR2QsZUFBQSxFQUFvQiwyQ0FITjtJQUlkLFFBQUEsRUFBb0IsZ0JBSk47SUFLZCxXQUFBLEVBQW9CLHNDQUxOO0lBTWQsV0FBQSxFQUFvQixzQkFOTjtJQU9kLGFBQUEsRUFBb0IsbUNBUE47SUFRZCxVQUFBLEVBQW9CLGtEQVJOO0lBU2QsU0FBQSxFQUFvQiw0Q0FUTjs7O2lCQVlsQixXQUFBLEdBQWEsU0FBQTtBQUNYLFFBQUE7SUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLGdCQUFpQixDQUFBLElBQUMsQ0FBQSxPQUFEO0lBQzNCLElBQWlCLE1BQWpCO0FBQUEsYUFBTyxPQUFQOztBQUNBLFdBQU8sSUFBQyxDQUFBO0VBSEc7O2lCQUtiLFlBQUEsR0FBYyxTQUFBO0FBQ1osUUFBQTtJQUFBLElBQWEsSUFBQyxDQUFBLFFBQUQsS0FBYSxJQUExQjtBQUFBLGFBQU8sR0FBUDs7SUFFQSxRQUFBLEdBQVcsSUFBQyxDQUFBLFFBQVEsQ0FBQyxRQUFWLENBQUE7SUFXWCxPQUFBLEdBQVU7SUFDVixJQUFHLENBQUMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULEdBQWtCLENBQW5CLENBQUEsSUFBMEIsQ0FBQyxJQUFDLENBQUEsT0FBRCxLQUFZLEVBQWIsQ0FBN0I7TUFDRSxPQUFBLEdBQVUsMkJBQUEsR0FBMkIsQ0FBQyxJQUFDLENBQUEsV0FBRCxDQUFBLENBQUQ7TUFDckMsUUFBQSxJQUFZLFFBRmQ7O0FBSUEsV0FBTztFQW5CSzs7aUJBd0JkLFlBQUEsR0FBYyxTQUFBO0FBQ1osUUFBQTtJQUFBLE1BQUEsR0FBUyxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsQ0FBQTtJQUNULElBQUcsTUFBTSxDQUFDLElBQVAsS0FBZSxRQUFsQjtNQUNFLElBQUcsSUFBQyxDQUFBLFFBQVEsQ0FBQyxVQUFWLEtBQXdCLENBQTNCO0FBQ0UsZUFBTyxDQUFDLFVBQUQsRUFBYSxlQUFiLEVBRFQ7O0FBRUEsYUFBTyxDQUFDLFVBQUQsRUFBZ0IsSUFBQyxDQUFBLFFBQVEsQ0FBQyxVQUFYLEdBQXNCLFlBQXJDLEVBSFQ7O0lBSUEsSUFBRyxJQUFDLENBQUEsUUFBUSxDQUFDLFVBQVYsS0FBd0IsQ0FBM0I7QUFDRSxhQUFPLENBQUksTUFBTSxDQUFDLElBQVIsR0FBYSxRQUFoQixFQUF5QixjQUF6QixFQURUOztBQUVBLFdBQU8sQ0FBSSxNQUFNLENBQUMsSUFBUixHQUFhLFFBQWhCLEVBQXlCLGdCQUFBLEdBQWlCLElBQUMsQ0FBQSxRQUFRLENBQUMsVUFBM0IsR0FBc0MsT0FBL0Q7RUFSSzs7aUJBWWQsSUFBQSxHQUFNLFNBQUE7V0FDSixJQUFDLENBQUEsT0FBRCxHQUFXLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixDQUFlO01BQ3hCLEVBQUEsRUFBSSxDQURvQjtLQUFmO0VBRFA7O2lCQUtOLElBQUEsR0FBTSxTQUFDLEtBQUQ7QUFDSixRQUFBO0lBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxzQkFBWixFQUFvQyxLQUFwQztJQUVBLElBQUMsQ0FBQSxRQUFRLENBQUMsZ0JBQVYsQ0FBMkIsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFqQztJQUVBLFFBQUEsR0FBVztBQUNYLFNBQUEsdUNBQUE7O01BQ0UsUUFBUSxDQUFDLElBQVQsQ0FBYyxJQUFJLENBQUMsSUFBbkI7QUFERjtJQUdBLEdBQUEsR0FBTSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBZTtNQUNuQixFQUFBLEVBQUksQ0FEZTtNQUVuQixLQUFBLEVBQU8sUUFGWTtLQUFmO0lBSU4sSUFBQyxDQUFBLE9BQUQsR0FBVztJQUNYLElBQUcsR0FBQSxLQUFPLEVBQVY7TUFDRSxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBVSxJQUFDLENBQUEsUUFBUSxDQUFDLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUEvQjthQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFXLEtBQVgsRUFGRjs7RUFkSTs7aUJBa0JOLFVBQUEsR0FBWSxTQUFBO0FBQ1YsUUFBQTtJQUFBLElBQUcsQ0FBSSxJQUFDLENBQUEsSUFBSSxDQUFDLE9BQWI7QUFDRSxhQURGOztJQUVBLEtBQUEsR0FBUSxJQUFDLENBQUEsSUFBSSxDQUFDLGFBQU4sQ0FBQTtJQUVSLElBQUcsS0FBSyxDQUFDLE1BQU4sS0FBZ0IsQ0FBbkI7QUFDRSxhQUFPLElBQUMsQ0FBQSxJQUFELENBQUEsRUFEVDs7QUFHQSxXQUFPLElBQUMsQ0FBQSxJQUFELENBQU0sS0FBTjtFQVJHOztpQkFhWixNQUFBLEdBQVEsU0FBQyxFQUFEO0FBQ04sUUFBQTtJQUFBLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxHQUFnQjtJQUVoQixPQUFBLEdBQVU7SUFDVixJQUFHLElBQUMsQ0FBQSxVQUFELENBQVksRUFBWixDQUFIO01BQ0UsT0FBQSxHQUFVLEtBRFo7O0FBR0EsV0FBTztFQVBEOztpQkFTUixVQUFBLEdBQVksU0FBQyxFQUFEO0FBQ1YsUUFBQTtJQUFBLElBQWdCLElBQUMsQ0FBQSxRQUFELEtBQWEsSUFBN0I7QUFBQSxhQUFPLE1BQVA7O0lBRUEsT0FBQSxHQUFVO0lBRVYsSUFBRyxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sQ0FBYSxFQUFiLENBQUg7TUFDRSxPQUFBLEdBQVUsS0FEWjs7SUFFQSxJQUFHLElBQUMsQ0FBQSxJQUFJLENBQUMsaUJBQU4sQ0FBQSxDQUFIO01BQ0UsSUFBQyxDQUFBLFVBQUQsSUFBZTtNQUNmLElBQUcsSUFBQyxDQUFBLFVBQUQsSUFBZSxDQUFsQjtRQUNFLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBQyxDQUFBLFVBQUQsQ0FBQTtRQUNkLElBQUcsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLENBQUEsQ0FBSDtVQUNFLE9BQUEsR0FBVSxLQURaO1NBRkY7T0FGRjs7SUFNQSxJQUFHLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixDQUFhLEVBQWIsQ0FBSDtNQUNFLE9BQUEsR0FBVSxLQURaOztJQUdBLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFVLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBcEIsRUFBNkIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUF2QyxFQUE2QyxJQUFDLENBQUEsUUFBUSxDQUFDLE9BQXZEO0lBRUEsSUFBRyxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsQ0FBa0IsRUFBbEIsQ0FBSDtNQUNFLE9BQUEsR0FBVSxLQURaOztJQUdBLElBQUcsSUFBQyxDQUFBLGtCQUFELEtBQXVCLElBQTFCO01BQ0UsSUFBQyxDQUFBLGtCQUFrQixDQUFDLElBQXBCLElBQTRCO01BQzVCLElBQUcsSUFBQyxDQUFBLGtCQUFrQixDQUFDLElBQXBCLEdBQTJCLElBQTlCO1FBQ0UsSUFBQyxDQUFBLGtCQUFELEdBQXNCLEtBRHhCOztNQUVBLE9BQUEsR0FBVSxLQUpaOztJQU1BLElBQUcsSUFBQyxDQUFBLGtCQUFELEtBQXVCLElBQTFCO01BQ0UsSUFBRyxJQUFDLENBQUEsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFuQixHQUE0QixDQUEvQjtRQUNFLElBQUMsQ0FBQSxrQkFBRCxHQUNFO1VBQUEsS0FBQSxFQUFPLElBQUMsQ0FBQSxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQW5CLENBQUEsQ0FBUDtVQUNBLElBQUEsRUFBTSxDQUROO1VBRko7T0FERjs7QUFNQSxXQUFPO0VBakNHOztpQkFtQ1osTUFBQSxHQUFRLFNBQUE7SUFFTixJQUFDLENBQUEsY0FBYyxDQUFDLE1BQWhCLEdBQXlCO0lBRXpCLElBQUcsSUFBQyxDQUFBLFVBQUQsS0FBZSxDQUFsQjtNQUNFLElBQUMsQ0FBQSxXQUFELENBQUEsRUFERjtLQUFBLE1BRUssSUFBRyxJQUFDLENBQUEsVUFBRCxLQUFlLENBQWxCO01BQ0gsSUFBQyxDQUFBLGtCQUFELENBQUEsRUFERztLQUFBLE1BQUE7TUFHSCxJQUFDLENBQUEsVUFBRCxDQUFBLEVBSEc7O0FBS0wsV0FBTyxJQUFDLENBQUE7RUFYRjs7aUJBYVIsV0FBQSxHQUFhLFNBQUE7QUFDWCxRQUFBO0lBQUEsWUFBQSxHQUFlO0lBQ2YsSUFBQyxDQUFBLEdBQUQsQ0FBSyxZQUFBLEdBQWEsWUFBbEI7SUFDQSxJQUFDLENBQUEsY0FBYyxDQUFDLE1BQWhCLENBQXVCLE9BQXZCLEVBQWdDLENBQWhDLEVBQW1DLENBQW5DLEVBQXNDLElBQUMsQ0FBQSxLQUF2QyxFQUE4QyxJQUFDLENBQUEsTUFBL0MsRUFBdUQsQ0FBdkQsRUFBMEQsQ0FBMUQsRUFBNkQsQ0FBN0QsRUFBZ0UsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUF4RTtXQUNBLElBQUMsQ0FBQSxjQUFjLENBQUMsTUFBaEIsQ0FBdUIsWUFBdkIsRUFBcUMsQ0FBckMsRUFBd0MsQ0FBeEMsRUFBMkMsSUFBQyxDQUFBLEtBQTVDLEVBQW1ELElBQUMsQ0FBQSxRQUFwRCxFQUE4RCxDQUE5RCxFQUFpRSxDQUFqRSxFQUFvRSxDQUFwRSxFQUF1RSxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQS9FLEVBQXNGLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQTtlQUNwRixLQUFDLENBQUEsVUFBRCxHQUFjO01BRHNFO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0RjtFQUpXOztpQkFPYixLQUFBLEdBQU8sU0FBQTtJQUNMLE9BQU8sQ0FBQyxHQUFSLENBQVksV0FBWjtXQUNBLE9BQU8sQ0FBQyxHQUFSLENBQVksSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUF0QjtFQUZLOztpQkFvQlAsa0JBQUEsR0FBb0IsU0FBQTtBQUNsQixRQUFBO0lBQUEsSUFBQyxDQUFBLGNBQWMsQ0FBQyxNQUFoQixDQUF1QixPQUF2QixFQUFnQyxDQUFoQyxFQUFtQyxDQUFuQyxFQUFzQyxJQUFDLENBQUEsS0FBdkMsRUFBOEMsSUFBQyxDQUFBLE1BQS9DLEVBQXVELENBQXZELEVBQTBELENBQTFELEVBQTZELENBQTdELEVBQWdFLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBeEUsRUFBZ0YsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFBO2VBQzlFLEtBQUMsQ0FBQSxVQUFELEdBQWM7TUFEZ0U7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhGO0lBR0EsV0FBQSxHQUFjLElBQUMsQ0FBQSxNQUFELEdBQVU7SUFDeEIsV0FBQSxHQUFjLFdBQUEsR0FBYztJQUM1QixJQUFDLENBQUEsWUFBWSxDQUFDLE1BQWQsQ0FBcUIsSUFBQyxDQUFBLElBQXRCLEVBQTRCLFdBQTVCLEVBQXlDLGNBQXpDLEVBQXlELElBQUMsQ0FBQSxNQUFNLENBQUMsQ0FBakUsRUFBb0UsV0FBcEUsRUFBaUYsR0FBakYsRUFBc0YsR0FBdEYsRUFBMkYsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFuRztJQUVBLFdBQUEsR0FBYyxJQUFDLENBQUEsS0FBRCxHQUFTO0lBQ3ZCLFNBQUEsR0FBWTtJQUNaLENBQUEsR0FBSSxJQUFDLENBQUEsS0FBRCxHQUFTO0lBQ2IsQ0FBQSxHQUFJO0lBQ0osV0FBQSxHQUFjLElBQUMsQ0FBQSxNQUFELEdBQVU7SUFDeEIsVUFBQSxHQUFhLElBQUMsQ0FBQSxNQUFELEdBQVU7SUFDdkIsUUFBQSxHQUFXLFdBQUEsR0FBYztBQUN6QjtTQUFBLHdFQUFBOztNQUNFLElBQUEsR0FBTztNQUNQLElBQUcsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTyxDQUFBLEdBQUcsQ0FBQyxFQUFKLENBQXhCO1FBQ0UsSUFBQSxHQUFPLFVBRFQ7O01BRUEsSUFBQyxDQUFBLGNBQWMsQ0FBQyxNQUFoQixDQUF1QixJQUF2QixFQUE2QixDQUE3QixFQUFnQyxDQUFoQyxFQUFtQyxRQUFuQyxFQUE2QyxRQUE3QyxFQUF1RCxDQUF2RCxFQUEwRCxDQUExRCxFQUE2RCxDQUE3RCxFQUFnRSxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQXhFO01BQ0EsSUFBQyxDQUFBLFlBQVksQ0FBQyxNQUFkLENBQXFCLElBQUMsQ0FBQSxJQUF0QixFQUE0QixXQUE1QixFQUF5QyxHQUFHLENBQUMsS0FBN0MsRUFBb0QsQ0FBQSxHQUFJLFdBQXhELEVBQXFFLENBQXJFLEVBQXdFLENBQXhFLEVBQTJFLENBQTNFLEVBQThFLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBdEY7TUFDQSxJQUFDLENBQUEsWUFBWSxDQUFDLE1BQWQsQ0FBcUIsSUFBQyxDQUFBLElBQXRCLEVBQTRCLFVBQTVCLEVBQXdDLEdBQUcsQ0FBQyxXQUFZLENBQUEsQ0FBQSxDQUF4RCxFQUE0RCxDQUFBLEdBQUksV0FBaEUsRUFBNkUsQ0FBQSxHQUFJLFdBQWpGLEVBQThGLENBQTlGLEVBQWlHLENBQWpHLEVBQW9HLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBNUc7TUFDQSxJQUFHLG9CQUFIO1FBQ0UsUUFBQSxHQUFXLEdBQUcsQ0FBQyxRQUFKLENBQWEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUF2QjtRQUNYLElBQUMsQ0FBQSxZQUFZLENBQUMsTUFBZCxDQUFxQixJQUFDLENBQUEsSUFBdEIsRUFBNEIsVUFBNUIsRUFBd0MsUUFBeEMsRUFBa0QsQ0FBQSxHQUFJLFdBQXRELEVBQW1FLENBQUEsR0FBSSxXQUFKLEdBQWtCLFVBQXJGLEVBQWlHLENBQWpHLEVBQW9HLENBQXBHLEVBQXVHLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBL0csRUFGRjtPQUFBLE1BQUE7UUFJRSxJQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUMsTUFBaEIsR0FBeUIsQ0FBNUI7VUFDRSxJQUFDLENBQUEsWUFBWSxDQUFDLE1BQWQsQ0FBcUIsSUFBQyxDQUFBLElBQXRCLEVBQTRCLFVBQTVCLEVBQXdDLEdBQUcsQ0FBQyxXQUFZLENBQUEsQ0FBQSxDQUF4RCxFQUE0RCxDQUFBLEdBQUksV0FBaEUsRUFBNkUsQ0FBQSxHQUFJLFdBQUosR0FBa0IsVUFBL0YsRUFBMkcsQ0FBM0csRUFBOEcsQ0FBOUcsRUFBaUgsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUF6SCxFQURGO1NBSkY7O01BTUEsSUFBRyxRQUFBLEtBQVksQ0FBZjtRQUNFLENBQUEsR0FBSTtxQkFDSixDQUFBLElBQUssSUFBQyxDQUFBLEtBQUQsR0FBUyxHQUZoQjtPQUFBLE1BQUE7cUJBSUUsQ0FBQSxJQUFLLFdBQUEsR0FBYyxHQUpyQjs7QUFiRjs7RUFma0I7O2lCQWtDcEIsVUFBQSxHQUFZLFNBQUE7QUFHVixRQUFBO0lBQUEsSUFBQyxDQUFBLGNBQWMsQ0FBQyxNQUFoQixDQUF1QixPQUF2QixFQUFnQyxDQUFoQyxFQUFtQyxDQUFuQyxFQUFzQyxJQUFDLENBQUEsS0FBdkMsRUFBOEMsSUFBQyxDQUFBLE1BQS9DLEVBQXVELENBQXZELEVBQTBELENBQTFELEVBQTZELENBQTdELEVBQWdFLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBeEU7SUFFQSxVQUFBLEdBQWEsSUFBQyxDQUFBLFFBQUQsR0FBWTtJQUN6QixXQUFBLEdBQWMsVUFBQSxHQUFhO0lBQzNCLGVBQUEsR0FBa0IsSUFBQyxDQUFBLFFBQUQsR0FBWTtJQUM5QixXQUFBLEdBQWM7SUFFZCxZQUFBLEdBQWUsSUFBQyxDQUFBLFFBQVEsQ0FBQyxRQUFWLENBQUEsQ0FBQSxJQUF5QixJQUFDLENBQUEsSUFBSSxDQUFDLE9BQU4sQ0FBQTtBQUd4QztBQUFBLFNBQUEsOENBQUE7O01BQ0UsSUFBQyxDQUFBLFlBQVksQ0FBQyxNQUFkLENBQXFCLElBQUMsQ0FBQSxJQUF0QixFQUE0QixVQUE1QixFQUF3QyxJQUF4QyxFQUE4QyxDQUE5QyxFQUFpRCxDQUFDLENBQUEsR0FBRSxHQUFILENBQUEsR0FBVSxDQUFDLFVBQUEsR0FBYSxXQUFkLENBQTNELEVBQXVGLENBQXZGLEVBQTBGLENBQTFGLEVBQTZGLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBckc7QUFERjtJQUdBLFNBQUEsR0FBWSxDQUNWLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBUSxDQUFBLENBQUEsQ0FEUixFQUVWLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBUSxDQUFBLENBQUEsQ0FGUixFQUdWLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBUSxDQUFBLENBQUEsQ0FIUjtJQU1aLGVBQUEsR0FBa0IsZUFBQSxHQUFrQjtJQUNwQyxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUMsQ0FBQSxNQUFELEdBQVU7SUFHekIsSUFBRyxTQUFVLENBQUEsQ0FBQSxDQUFWLEtBQWdCLElBQW5CO01BQ0UsU0FBQSxHQUFZLFlBQWEsQ0FBQSxTQUFVLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBYjtNQUN6QixjQUFBLEdBQWlCLElBQUMsQ0FBQSxjQUFjLENBQUMsU0FBaEIsQ0FBMEIsU0FBUyxDQUFDLE1BQXBDLEVBQTRDLGVBQTVDO01BQ2pCLElBQUMsQ0FBQSxjQUFjLENBQUMsTUFBaEIsQ0FBdUIsU0FBUyxDQUFDLE1BQWpDLEVBQXlDLGVBQXpDLEVBQTBELElBQUMsQ0FBQSxXQUEzRCxFQUF3RSxDQUF4RSxFQUEyRSxlQUEzRSxFQUE0RixDQUE1RixFQUErRixDQUEvRixFQUFrRyxDQUFsRyxFQUFxRyxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQTdHLEVBQW9ILENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQSxHQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwSDtNQUVBLElBQUMsQ0FBQSxXQUFELENBQWEsU0FBVSxDQUFBLENBQUEsQ0FBdkIsRUFBMkIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxLQUFyQyxFQUE0QyxZQUE1QyxFQUEwRCxTQUFVLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBYixLQUFzQixJQUFDLENBQUEsUUFBUSxDQUFDLElBQTFGLEVBQWdHLFdBQWhHLEVBQTZHLGVBQUEsR0FBa0IsQ0FBQyxjQUFBLEdBQWlCLENBQWxCLENBQS9ILEVBQXFKLElBQUMsQ0FBQSxXQUFELEdBQWUsV0FBcEssRUFBaUwsR0FBakwsRUFBc0wsQ0FBdEwsRUFMRjs7SUFRQSxJQUFHLFNBQVUsQ0FBQSxDQUFBLENBQVYsS0FBZ0IsSUFBbkI7TUFDRSxTQUFBLEdBQVksWUFBYSxDQUFBLFNBQVUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFiO01BQ3pCLElBQUMsQ0FBQSxjQUFjLENBQUMsTUFBaEIsQ0FBdUIsU0FBUyxDQUFDLE1BQWpDLEVBQXlDLElBQUMsQ0FBQSxNQUFNLENBQUMsQ0FBakQsRUFBb0QsQ0FBcEQsRUFBdUQsQ0FBdkQsRUFBMEQsZUFBMUQsRUFBMkUsQ0FBM0UsRUFBOEUsR0FBOUUsRUFBbUYsQ0FBbkYsRUFBc0YsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUE5RjtNQUNBLElBQUMsQ0FBQSxXQUFELENBQWEsU0FBVSxDQUFBLENBQUEsQ0FBdkIsRUFBMkIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxLQUFyQyxFQUE0QyxZQUE1QyxFQUEwRCxTQUFVLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBYixLQUFzQixJQUFDLENBQUEsUUFBUSxDQUFDLElBQTFGLEVBQWdHLFdBQWhHLEVBQTZHLElBQUMsQ0FBQSxNQUFNLENBQUMsQ0FBckgsRUFBd0gsZUFBeEgsRUFBeUksR0FBekksRUFBOEksQ0FBOUksRUFIRjs7SUFNQSxJQUFHLFNBQVUsQ0FBQSxDQUFBLENBQVYsS0FBZ0IsSUFBbkI7TUFDRSxTQUFBLEdBQVksWUFBYSxDQUFBLFNBQVUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFiO01BQ3pCLGNBQUEsR0FBaUIsSUFBQyxDQUFBLGNBQWMsQ0FBQyxTQUFoQixDQUEwQixTQUFTLENBQUMsTUFBcEMsRUFBNEMsZUFBNUM7TUFDakIsSUFBQyxDQUFBLGNBQWMsQ0FBQyxNQUFoQixDQUF1QixTQUFTLENBQUMsTUFBakMsRUFBeUMsSUFBQyxDQUFBLEtBQUQsR0FBUyxlQUFsRCxFQUFtRSxJQUFDLENBQUEsV0FBcEUsRUFBaUYsQ0FBakYsRUFBb0YsZUFBcEYsRUFBcUcsQ0FBckcsRUFBd0csQ0FBeEcsRUFBMkcsQ0FBM0csRUFBOEcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUF0SDtNQUNBLElBQUMsQ0FBQSxXQUFELENBQWEsU0FBVSxDQUFBLENBQUEsQ0FBdkIsRUFBMkIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxLQUFyQyxFQUE0QyxZQUE1QyxFQUEwRCxTQUFVLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBYixLQUFzQixJQUFDLENBQUEsUUFBUSxDQUFDLElBQTFGLEVBQWdHLFdBQWhHLEVBQTZHLElBQUMsQ0FBQSxLQUFELEdBQVMsQ0FBQyxlQUFBLEdBQWtCLENBQUMsY0FBQSxHQUFpQixDQUFsQixDQUFuQixDQUF0SCxFQUFnSyxJQUFDLENBQUEsV0FBRCxHQUFlLFdBQS9LLEVBQTRMLEdBQTVMLEVBQWlNLENBQWpNLEVBSkY7O0lBT0EsY0FBQSxHQUFpQixJQUFBLEdBQU8sSUFBQyxDQUFBO0lBQ3pCLFlBQUEsR0FBZTtJQUNmLElBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxPQUFUO01BQ0UsYUFBQSxHQUFnQixJQUFDLENBQUEsTUFBTSxDQUFDO01BQ3hCLElBQUcsQ0FBQyxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsS0FBa0IsQ0FBbkIsQ0FBQSxJQUEwQixDQUFDLElBQUMsQ0FBQSxRQUFRLENBQUMsY0FBVixDQUFBLENBQUEsSUFBOEIsQ0FBQyxJQUFDLENBQUEsUUFBUSxDQUFDLFdBQVYsS0FBeUIsSUFBMUIsQ0FBL0IsQ0FBN0I7UUFDRSxhQUFBLEdBQWdCLElBQUMsQ0FBQSxNQUFNLENBQUM7UUFDeEIsSUFBRyxJQUFDLENBQUEsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFmLEtBQXlCLENBQTVCO1VBQ0UsWUFBQSxHQUFlLG1CQURqQjtTQUFBLE1BQUE7VUFHRSxZQUFBLEdBQWUsV0FIakI7U0FGRjtPQUZGO0tBQUEsTUFBQTtNQVNFLFlBQUEsR0FBZTtNQUNmLGFBQUEsR0FBZ0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQVYxQjs7SUFXQSxJQUFDLENBQUEsY0FBYyxDQUFDLE1BQWhCLENBQXVCLE9BQXZCLEVBQWdDLENBQWhDLEVBQW1DLElBQUMsQ0FBQSxNQUFwQyxFQUE0QyxJQUFDLENBQUEsS0FBN0MsRUFBb0QsY0FBcEQsRUFBb0UsQ0FBcEUsRUFBdUUsQ0FBdkUsRUFBMEUsQ0FBMUUsRUFBNkUsYUFBN0UsRUFBNEYsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFBO2VBQzFGLEtBQUMsQ0FBQSxJQUFJLENBQUMsYUFBTixDQUFBO01BRDBGO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE1RjtJQUlBLGFBQUEsR0FBZ0IsSUFBQyxDQUFBLE1BQUQsR0FBVTtJQUMxQixVQUFBLEdBQWE7SUFDYixJQUFHLENBQUMsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLElBQWtCLENBQW5CLENBQUEsSUFBMEIsQ0FBQyxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsSUFBa0IsQ0FBbkIsQ0FBN0I7TUFDRSxVQUFBLElBQWMsSUFBQyxDQUFBLFFBQVEsQ0FBQyxLQUQxQjs7SUFFQSxJQUFDLENBQUEsY0FBYyxDQUFDLE1BQWhCLENBQXVCLFVBQXZCLEVBQW1DLElBQUMsQ0FBQSxLQUFELEdBQVMsQ0FBNUMsRUFBK0MsSUFBQyxDQUFBLE1BQUQsR0FBVSxDQUF6RCxFQUE0RCxhQUE1RCxFQUEyRSxhQUEzRSxFQUEwRixDQUExRixFQUE2RixHQUE3RixFQUFrRyxHQUFsRyxFQUF1RyxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQS9HLEVBQXNILENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQTtlQUNwSCxLQUFDLENBQUEsVUFBRCxDQUFBO01BRG9IO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0SDtJQUVBLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixDQUFBO0lBRUEsSUFBQyxDQUFBLElBQUksQ0FBQyxNQUFOLENBQUE7SUFFQSxJQUFHLFlBQUg7TUFHRSxLQUFBLEdBQVEsSUFBQyxDQUFBLFlBQUQsQ0FBQTtNQUNSLFlBQUEsR0FBZSxJQUFDLENBQUEsUUFBRCxHQUFZO01BQzNCLFNBQUEsR0FBWSxJQUFDLENBQUEsTUFBTSxDQUFDO01BQ3BCLElBQUcsS0FBSyxDQUFDLE1BQU4sR0FBZSxDQUFsQjtRQUNFLFNBQUEsSUFBYyxZQUFBLElBQWdCLEVBRGhDOztNQUVBLElBQUMsQ0FBQSxZQUFZLENBQUMsTUFBZCxDQUFxQixJQUFDLENBQUEsSUFBdEIsRUFBNEIsWUFBNUIsRUFBMEMsS0FBTSxDQUFBLENBQUEsQ0FBaEQsRUFBb0QsSUFBQyxDQUFBLE1BQU0sQ0FBQyxDQUE1RCxFQUErRCxTQUEvRCxFQUEwRSxHQUExRSxFQUErRSxHQUEvRSxFQUFvRixJQUFDLENBQUEsTUFBTSxDQUFDLFNBQTVGO01BQ0EsSUFBRyxLQUFLLENBQUMsTUFBTixHQUFlLENBQWxCO1FBQ0UsU0FBQSxJQUFhO1FBQ2IsSUFBQyxDQUFBLFlBQVksQ0FBQyxNQUFkLENBQXFCLElBQUMsQ0FBQSxJQUF0QixFQUE0QixZQUE1QixFQUEwQyxLQUFNLENBQUEsQ0FBQSxDQUFoRCxFQUFvRCxJQUFDLENBQUEsTUFBTSxDQUFDLENBQTVELEVBQStELFNBQS9ELEVBQTBFLEdBQTFFLEVBQStFLEdBQS9FLEVBQW9GLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBNUYsRUFGRjs7TUFJQSxJQUFDLENBQUEsY0FBYyxDQUFDLE1BQWhCLENBQXVCLE9BQXZCLEVBQWdDLENBQWhDLEVBQW1DLElBQUMsQ0FBQSxNQUFwQyxFQUE0QyxJQUFDLENBQUEsS0FBN0MsRUFBb0QsY0FBcEQsRUFBb0UsQ0FBcEUsRUFBdUUsQ0FBdkUsRUFBMEUsQ0FBMUUsRUFBNkUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFyRixFQUFpRyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDL0YsS0FBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLENBQUE7aUJBQ0EsS0FBQyxDQUFBLFdBQUQsQ0FBQTtRQUYrRjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakc7TUFJQSxlQUFBLEdBQWtCLElBQUMsQ0FBQSxRQUFELEdBQVk7TUFDOUIsY0FBQSxHQUFpQixlQUFBLEdBQWtCO01BQ25DLElBQUMsQ0FBQSxZQUFZLENBQUMsTUFBZCxDQUFxQixJQUFDLENBQUEsSUFBdEIsRUFBNEIsZUFBNUIsRUFBNkMsWUFBN0MsRUFBMkQsY0FBQSxHQUFpQixJQUFDLENBQUEsTUFBTSxDQUFDLENBQXBGLEVBQXVGLGNBQUEsR0FBaUIsQ0FBQyxJQUFDLENBQUEsTUFBRCxHQUFVLENBQUMsY0FBQSxHQUFpQixHQUFsQixDQUFYLENBQXhHLEVBQTRJLEdBQTVJLEVBQWlKLENBQWpKLEVBQW9KLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBNUo7TUFDQSxJQUFDLENBQUEsWUFBWSxDQUFDLE1BQWQsQ0FBcUIsSUFBQyxDQUFBLElBQXRCLEVBQTRCLGVBQTVCLEVBQTZDLFlBQTdDLEVBQTJELElBQUMsQ0FBQSxNQUFNLENBQUMsQ0FBbkUsRUFBc0UsSUFBQyxDQUFBLE1BQUQsR0FBVSxDQUFDLGNBQUEsR0FBaUIsR0FBbEIsQ0FBaEYsRUFBd0csR0FBeEcsRUFBNkcsQ0FBN0csRUFBZ0gsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUF4SCxFQXBCRjs7SUFzQkEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFDLENBQUEsUUFBUSxDQUFDLE9BQVEsQ0FBQSxDQUFBLENBQS9CLEVBQW1DLElBQUMsQ0FBQSxRQUFRLENBQUMsS0FBN0MsRUFBb0QsWUFBcEQsRUFBa0UsQ0FBQSxLQUFLLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBakYsRUFBdUYsV0FBdkYsRUFBb0csSUFBQyxDQUFBLE1BQU0sQ0FBQyxDQUE1RyxFQUErRyxJQUFDLENBQUEsTUFBaEgsRUFBd0gsR0FBeEgsRUFBNkgsQ0FBN0g7SUFHQSxJQUFDLENBQUEsWUFBWSxDQUFDLE1BQWQsQ0FBcUIsSUFBQyxDQUFBLElBQXRCLEVBQTRCLFVBQTVCLEVBQXdDLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FBeEMsRUFBeUQsQ0FBekQsRUFBNEQsQ0FBNUQsRUFBK0QsQ0FBL0QsRUFBa0UsQ0FBbEUsRUFBcUUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUE3RTtJQUVBLElBQUMsQ0FBQSxjQUFjLENBQUMsTUFBaEIsQ0FBdUIsT0FBdkIsRUFBZ0MsSUFBQyxDQUFBLEtBQWpDLEVBQXdDLENBQXhDLEVBQTJDLENBQTNDLEVBQThDLElBQUMsQ0FBQSxlQUEvQyxFQUFnRSxDQUFoRSxFQUFtRSxDQUFuRSxFQUFzRSxDQUF0RSxFQUF5RSxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQWpGLEVBQXdGLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQTtlQUN0RixLQUFDLENBQUEsTUFBRCxHQUFVO01BRDRFO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4RjtJQUdBLElBQUcsWUFBQSxLQUFnQixJQUFuQjtNQUNFLElBQUMsQ0FBQSxZQUFZLENBQUMsTUFBZCxDQUFxQixJQUFDLENBQUEsSUFBdEIsRUFBNEIsVUFBNUIsRUFBd0MsWUFBeEMsRUFBc0QsSUFBQSxHQUFPLElBQUMsQ0FBQSxLQUE5RCxFQUFxRSxJQUFDLENBQUEsTUFBRCxHQUFVLGNBQS9FLEVBQStGLENBQS9GLEVBQWtHLENBQWxHLEVBQXFHLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBN0csRUFERjs7SUFHQSxJQUFHLElBQUMsQ0FBQSxrQkFBRCxLQUF1QixJQUExQjtNQUNFLElBQUcsSUFBQyxDQUFBLGtCQUFrQixDQUFDLElBQXBCLEdBQTJCLElBQTlCO1FBQ0UsT0FBQSxHQUFVLElBQUMsQ0FBQSxrQkFBa0IsQ0FBQyxJQUFwQixHQUEyQixLQUR2QztPQUFBLE1BRUssSUFBRyxJQUFDLENBQUEsa0JBQWtCLENBQUMsSUFBcEIsR0FBMkIsSUFBOUI7UUFDSCxPQUFBLEdBQVUsQ0FBQSxHQUFJLENBQUMsQ0FBQyxJQUFDLENBQUEsa0JBQWtCLENBQUMsSUFBcEIsR0FBMkIsSUFBNUIsQ0FBQSxHQUFvQyxJQUFyQyxFQURYO09BQUEsTUFBQTtRQUdILE9BQUEsR0FBVSxFQUhQOztNQUlMLEtBQUEsR0FBUTtRQUFDLENBQUEsRUFBRSxDQUFIO1FBQU0sQ0FBQSxFQUFFLENBQVI7UUFBVyxDQUFBLEVBQUUsQ0FBYjtRQUFnQixDQUFBLEVBQUUsT0FBbEI7O01BQ1IsQ0FBQSxHQUFJLElBQUMsQ0FBQSxLQUFELEdBQVM7TUFDYixDQUFBLEdBQUk7TUFDSixLQUFBLEdBQVEsQ0FBQSxHQUFJLENBQUMsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFWO01BQ1osSUFBQyxDQUFBLGNBQWMsQ0FBQyxNQUFoQixDQUF1QixJQUF2QixFQUE2QixDQUE3QixFQUFnQyxDQUFoQyxFQUFtQyxDQUFuQyxFQUFzQyxJQUFDLENBQUEsTUFBRCxHQUFVLEVBQWhELEVBQW9ELENBQXBELEVBQXVELENBQXZELEVBQTBELENBQTFELEVBQTZELEtBQTdELEVBQW9FLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNsRSxLQUFDLENBQUEsa0JBQUQsR0FBc0I7aUJBQ3RCLEtBQUMsQ0FBQSxVQUFELEdBQWM7UUFGb0Q7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBFO01BR0EsSUFBQyxDQUFBLFlBQVksQ0FBQyxNQUFkLENBQXFCLElBQUMsQ0FBQSxJQUF0QixFQUE0QixVQUE1QixFQUF3QyxvQkFBeEMsRUFBOEQsS0FBOUQsRUFBcUUsQ0FBckUsRUFBd0UsQ0FBeEUsRUFBMkUsQ0FBM0UsRUFBOEUsS0FBOUU7TUFDQSxJQUFDLENBQUEsWUFBWSxDQUFDLE1BQWQsQ0FBcUIsSUFBQyxDQUFBLElBQXRCLEVBQTRCLFVBQTVCLEVBQXdDLElBQUMsQ0FBQSxrQkFBa0IsQ0FBQyxLQUE1RCxFQUFtRSxLQUFuRSxFQUEwRSxDQUFBLEdBQUksVUFBOUUsRUFBMEYsQ0FBMUYsRUFBNkYsQ0FBN0YsRUFBZ0csS0FBaEcsRUFmRjs7SUFpQkEsSUFBRyxJQUFDLENBQUEsTUFBSjtNQUNFLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxDQUFBLEVBREY7O0VBNUhVOztpQkFpSVosV0FBQSxHQUFhLFNBQUMsTUFBRCxFQUFTLEtBQVQsRUFBZ0IsWUFBaEIsRUFBOEIsTUFBOUIsRUFBc0MsV0FBdEMsRUFBbUQsQ0FBbkQsRUFBc0QsQ0FBdEQsRUFBeUQsT0FBekQsRUFBa0UsT0FBbEU7QUFDWCxRQUFBO0lBQUEsSUFBRyxNQUFIO01BQ0UsU0FBQSxHQUFZLFdBRGQ7S0FBQSxNQUFBO01BR0UsU0FBQSxHQUFZLEdBSGQ7O0lBSUEsVUFBQSxHQUFhLEdBQUEsR0FBSSxTQUFKLEdBQWdCLE1BQU0sQ0FBQyxJQUF2QixHQUE0QjtJQUN6QyxJQUFHLEtBQUg7O1FBQ0UsTUFBTSxDQUFDLFFBQVM7O01BQ2hCLFVBQUEsSUFBYyxjQUFBLEdBQWUsTUFBTSxDQUFDLE1BRnRDOztJQUdBLFVBQUEsSUFBYztJQUNkLFNBQUEsR0FBWSxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ3hCLElBQUcsWUFBQSxJQUFnQixDQUFDLFNBQUEsS0FBYSxDQUFkLENBQW5CO01BQ0UsSUFBRyxLQUFIO1FBQ0UsV0FBQSxHQUFjO1FBQ2QsSUFBRyxNQUFNLENBQUMsS0FBUCxLQUFnQixDQUFuQjtVQUNFLFdBQUEsR0FBYyxNQURoQjtTQUFBLE1BRUssSUFBRyxNQUFNLENBQUMsS0FBUCxLQUFnQixDQUFuQjtVQUNILFdBQUEsR0FBYyxNQURYO1NBQUEsTUFFQSxJQUFHLE1BQU0sQ0FBQyxLQUFQLEtBQWdCLENBQW5CO1VBQ0gsV0FBQSxHQUFjLE1BRFg7O1FBRUwsV0FBQSxHQUFjLFdBQUEsR0FBWSxXQUFaLEdBQXdCLFlBUnhDO09BQUEsTUFBQTtRQVVFLElBQUcsTUFBTSxDQUFDLEtBQVAsS0FBZ0IsQ0FBbkI7VUFDRSxXQUFBLEdBQWMscUJBRGhCO1NBQUEsTUFBQTtVQUdFLFdBQUEsR0FBYyxvQkFIaEI7U0FWRjtPQURGO0tBQUEsTUFBQTtNQWdCRSxXQUFBLEdBQWMsV0FBQSxHQUFZLFNBQVosR0FBc0IsV0FoQnRDOztJQWtCQSxRQUFBLEdBQVcsSUFBQyxDQUFBLFlBQVksQ0FBQyxJQUFkLENBQW1CLElBQUMsQ0FBQSxJQUFwQixFQUEwQixXQUExQixFQUF1QyxVQUF2QztJQUNYLFNBQUEsR0FBWSxJQUFDLENBQUEsWUFBWSxDQUFDLElBQWQsQ0FBbUIsSUFBQyxDQUFBLElBQXBCLEVBQTBCLFdBQTFCLEVBQXVDLFdBQXZDO0lBQ1osSUFBRyxRQUFRLENBQUMsQ0FBVCxHQUFhLFNBQVMsQ0FBQyxDQUExQjtNQUNFLFNBQVMsQ0FBQyxDQUFWLEdBQWMsUUFBUSxDQUFDLEVBRHpCO0tBQUEsTUFBQTtNQUdFLFFBQVEsQ0FBQyxDQUFULEdBQWEsU0FBUyxDQUFDLEVBSHpCOztJQUlBLEtBQUEsR0FBUTtJQUNSLE1BQUEsR0FBUztJQUNULFNBQUEsR0FBWSxTQUFTLENBQUM7SUFDdEIsSUFBRyxJQUFIO01BQ0UsU0FBQSxJQUFhO01BQ2IsSUFBRyxPQUFBLEdBQVUsQ0FBYjtRQUNFLEtBQUEsSUFBUyxZQURYO09BQUEsTUFBQTtRQUdFLE1BQUEsSUFBVSxZQUhaO09BRkY7O0lBTUEsSUFBQyxDQUFBLGNBQWMsQ0FBQyxNQUFoQixDQUF1QixPQUF2QixFQUFnQyxDQUFoQyxFQUFtQyxDQUFuQyxFQUFzQyxTQUFTLENBQUMsQ0FBaEQsRUFBbUQsU0FBbkQsRUFBOEQsQ0FBOUQsRUFBaUUsT0FBakUsRUFBMEUsT0FBMUUsRUFBbUYsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUEzRjtJQUNBLElBQUMsQ0FBQSxZQUFZLENBQUMsTUFBZCxDQUFxQixJQUFDLENBQUEsSUFBdEIsRUFBNEIsV0FBNUIsRUFBeUMsVUFBekMsRUFBcUQsQ0FBckQsRUFBd0QsS0FBeEQsRUFBK0QsT0FBL0QsRUFBd0UsT0FBeEUsRUFBaUYsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUF6RjtJQUNBLElBQUcsSUFBSDthQUNFLElBQUMsQ0FBQSxZQUFZLENBQUMsTUFBZCxDQUFxQixJQUFDLENBQUEsSUFBdEIsRUFBNEIsV0FBNUIsRUFBeUMsV0FBekMsRUFBc0QsQ0FBdEQsRUFBeUQsTUFBekQsRUFBaUUsT0FBakUsRUFBMEUsT0FBMUUsRUFBbUYsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUEzRixFQURGOztFQTlDVzs7aUJBb0RiLFNBQUEsR0FBVyxTQUFDLE9BQUQsRUFBVSxFQUFWLEVBQWMsRUFBZCxFQUFrQixFQUFsQixFQUFzQixFQUF0QixFQUEwQixFQUExQixFQUE4QixFQUE5QixFQUFrQyxFQUFsQyxFQUFzQyxFQUF0QyxFQUEwQyxHQUExQyxFQUErQyxPQUEvQyxFQUF3RCxPQUF4RCxFQUFpRSxDQUFqRSxFQUFvRSxDQUFwRSxFQUF1RSxDQUF2RSxFQUEwRSxDQUExRSxFQUE2RSxFQUE3RTtBQUNULFFBQUE7SUFBQSxJQUFDLENBQUEsY0FBYyxDQUFDLElBQWhCLENBQXFCLElBQUMsQ0FBQSxRQUFTLENBQUEsT0FBQSxDQUEvQixFQUF5QyxFQUF6QyxFQUE2QyxFQUE3QyxFQUFpRCxFQUFqRCxFQUFxRCxFQUFyRCxFQUF5RCxFQUF6RCxFQUE2RCxFQUE3RCxFQUFpRSxFQUFqRSxFQUFxRSxFQUFyRSxFQUF5RSxHQUF6RSxFQUE4RSxPQUE5RSxFQUF1RixPQUF2RixFQUFnRyxDQUFoRyxFQUFtRyxDQUFuRyxFQUFzRyxDQUF0RyxFQUF5RyxDQUF6RztJQUVBLElBQUcsVUFBSDtNQUlFLGFBQUEsR0FBZ0IsQ0FBQyxDQUFELEdBQUssT0FBTCxHQUFlO01BQy9CLGFBQUEsR0FBZ0IsQ0FBQyxDQUFELEdBQUssT0FBTCxHQUFlO01BQy9CLElBQUEsR0FFRTtRQUFBLEVBQUEsRUFBSyxFQUFMO1FBQ0EsRUFBQSxFQUFLLEVBREw7UUFFQSxHQUFBLEVBQUssR0FBQSxHQUFNLENBQUMsQ0FGWjtRQUlBLENBQUEsRUFBSyxhQUpMO1FBS0EsQ0FBQSxFQUFLLGFBTEw7UUFNQSxDQUFBLEVBQUssYUFBQSxHQUFnQixFQU5yQjtRQU9BLENBQUEsRUFBSyxhQUFBLEdBQWdCLEVBUHJCO1FBU0EsRUFBQSxFQUFLLEVBVEw7O2FBVUYsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQVksSUFBWixFQWxCRjs7RUFIUzs7aUJBdUJYLFVBQUEsR0FBWSxTQUFDLENBQUQsRUFBSSxDQUFKO0FBQ1YsUUFBQTtBQUFBO0FBQUEsU0FBQSxvQ0FBQTs7TUFFRSxlQUFBLEdBQWtCLENBQUEsR0FBSSxJQUFJLENBQUM7TUFDM0IsZUFBQSxHQUFrQixDQUFBLEdBQUksSUFBSSxDQUFDO01BQzNCLE1BQUEsR0FBUyxlQUFBLEdBQWtCLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBSSxDQUFDLEdBQWQsQ0FBbEIsR0FBdUMsZUFBQSxHQUFrQixJQUFJLENBQUMsR0FBTCxDQUFTLElBQUksQ0FBQyxHQUFkO01BQ2xFLE1BQUEsR0FBUyxlQUFBLEdBQWtCLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBSSxDQUFDLEdBQWQsQ0FBbEIsR0FBdUMsZUFBQSxHQUFrQixJQUFJLENBQUMsR0FBTCxDQUFTLElBQUksQ0FBQyxHQUFkO01BQ2xFLElBQUcsQ0FBQyxNQUFBLEdBQVMsSUFBSSxDQUFDLENBQWYsQ0FBQSxJQUFxQixDQUFDLE1BQUEsR0FBUyxJQUFJLENBQUMsQ0FBZixDQUFyQixJQUEwQyxDQUFDLE1BQUEsR0FBUyxJQUFJLENBQUMsQ0FBZixDQUExQyxJQUErRCxDQUFDLE1BQUEsR0FBUyxJQUFJLENBQUMsQ0FBZixDQUFsRTtBQUVFLGlCQUZGOztNQUdBLElBQUksQ0FBQyxFQUFMLENBQVEsQ0FBUixFQUFXLENBQVg7QUFDQSxhQUFPO0FBVlQ7QUFXQSxXQUFPO0VBWkc7Ozs7OztBQWdCZCxNQUFNLENBQUMsT0FBUCxHQUFpQjs7OztBQzltQmpCLElBQUE7O0FBQUEsU0FBQSxHQUFZLE9BQUEsQ0FBUSxhQUFSOztBQUVaLFlBQUEsR0FBZTs7QUFDZixZQUFBLEdBQWU7O0FBQ2YsZ0JBQUEsR0FBbUI7O0FBQ25CLGdCQUFBLEdBQW1COztBQUNuQixnQkFBQSxHQUFtQjs7QUFDbkIsZ0JBQUEsR0FBbUI7O0FBQ25CLGlCQUFBLEdBQW9COztBQUNwQiwyQkFBQSxHQUE4Qjs7QUFDOUIsc0JBQUEsR0FBeUIsSUFBSSxDQUFDLEVBQUwsR0FBVTs7QUFDbkMscUJBQUEsR0FBd0IsQ0FBQyxDQUFELEdBQUssSUFBSSxDQUFDLEVBQVYsR0FBZTs7QUFDdkMsaUJBQUEsR0FBb0I7O0FBRXBCLE9BQUEsR0FBVSxDQUFDOztBQUVYLFNBQUEsR0FDRTtFQUFBLElBQUEsRUFBTSxDQUFDLENBQVA7RUFDQSxVQUFBLEVBQVksQ0FEWjtFQUVBLFFBQUEsRUFBVSxDQUZWO0VBR0EsSUFBQSxFQUFNLENBSE47OztBQU9GLFNBQUEsR0FBWSxTQUFDLEVBQUQsRUFBSyxFQUFMLEVBQVMsRUFBVDtBQUNSLE1BQUE7RUFBQSxDQUFBLEdBQUksSUFBSSxDQUFDLEdBQUwsQ0FBUyxFQUFFLENBQUMsQ0FBSCxHQUFPLEVBQUUsQ0FBQyxDQUFuQixFQUFzQixDQUF0QixDQUFBLEdBQTJCLElBQUksQ0FBQyxHQUFMLENBQVMsRUFBRSxDQUFDLENBQUgsR0FBTyxFQUFFLENBQUMsQ0FBbkIsRUFBc0IsQ0FBdEI7RUFDL0IsQ0FBQSxHQUFJLElBQUksQ0FBQyxHQUFMLENBQVMsRUFBRSxDQUFDLENBQUgsR0FBTyxFQUFFLENBQUMsQ0FBbkIsRUFBc0IsQ0FBdEIsQ0FBQSxHQUEyQixJQUFJLENBQUMsR0FBTCxDQUFTLEVBQUUsQ0FBQyxDQUFILEdBQU8sRUFBRSxDQUFDLENBQW5CLEVBQXNCLENBQXRCO0VBQy9CLENBQUEsR0FBSSxJQUFJLENBQUMsR0FBTCxDQUFTLEVBQUUsQ0FBQyxDQUFILEdBQU8sRUFBRSxDQUFDLENBQW5CLEVBQXNCLENBQXRCLENBQUEsR0FBMkIsSUFBSSxDQUFDLEdBQUwsQ0FBUyxFQUFFLENBQUMsQ0FBSCxHQUFPLEVBQUUsQ0FBQyxDQUFuQixFQUFzQixDQUF0QjtBQUMvQixTQUFPLElBQUksQ0FBQyxJQUFMLENBQVcsQ0FBQyxDQUFBLEdBQUUsQ0FBRixHQUFJLENBQUwsQ0FBQSxHQUFVLElBQUksQ0FBQyxJQUFMLENBQVUsQ0FBQSxHQUFFLENBQUYsR0FBSSxDQUFkLENBQXJCO0FBSkM7O0FBTVosWUFBQSxHQUFlLFNBQUMsRUFBRCxFQUFLLEVBQUw7QUFDYixTQUFPLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBSSxDQUFDLEdBQUwsQ0FBUyxFQUFFLENBQUMsQ0FBSCxHQUFPLEVBQUUsQ0FBQyxDQUFuQixFQUFzQixDQUF0QixDQUFBLEdBQTJCLElBQUksQ0FBQyxHQUFMLENBQVMsRUFBRSxDQUFDLENBQUgsR0FBTyxFQUFFLENBQUMsQ0FBbkIsRUFBc0IsQ0FBdEIsQ0FBckM7QUFETTs7QUFHZixtQkFBQSxHQUFzQixTQUFDLEVBQUQsRUFBSyxFQUFMLEVBQVMsRUFBVCxFQUFhLEVBQWI7QUFDcEIsU0FBTyxJQUFJLENBQUMsR0FBTCxDQUFTLEVBQUEsR0FBSyxFQUFkLEVBQWtCLENBQWxCLENBQUEsR0FBdUIsSUFBSSxDQUFDLEdBQUwsQ0FBUyxFQUFBLEdBQUssRUFBZCxFQUFrQixDQUFsQjtBQURWOztBQUdoQjtFQUNKLElBQUMsQ0FBQSxZQUFELEdBQWU7O0VBQ2YsSUFBQyxDQUFBLFlBQUQsR0FBZTs7RUFDZixJQUFDLENBQUEsZ0JBQUQsR0FBbUI7O0VBQ25CLElBQUMsQ0FBQSxnQkFBRCxHQUFtQjs7RUFDbkIsSUFBQyxDQUFBLGdCQUFELEdBQW1COztFQUNuQixJQUFDLENBQUEsZ0JBQUQsR0FBbUI7O0VBQ25CLElBQUMsQ0FBQSxpQkFBRCxHQUFvQjs7RUFDcEIsSUFBQyxDQUFBLFNBQUQsR0FBWTs7RUFFQyxjQUFDLElBQUQ7QUFDWCxRQUFBO0lBRFksSUFBQyxDQUFBLE9BQUQ7SUFDWixJQUFDLENBQUEsS0FBRCxHQUFTO0lBQ1QsSUFBQyxDQUFBLEtBQUQsR0FBUztJQUNULElBQUMsQ0FBQSxhQUFELEdBQWlCO0lBRWpCLElBQUMsQ0FBQSxPQUFELEdBQVc7SUFDWCxJQUFDLENBQUEsTUFBRCxHQUFVO0lBQ1YsSUFBQyxDQUFBLFNBQUQsR0FBYTtJQUViLElBQUMsQ0FBQSxjQUFELEdBQWtCO0lBQ2xCLElBQUMsQ0FBQSxnQkFBRCxHQUFvQjtJQUNwQixJQUFDLENBQUEsS0FBRCxHQUFTO0lBQ1QsSUFBQyxDQUFBLEtBQUQsR0FBUztJQUdULElBQUMsQ0FBQSxTQUFELEdBQ0U7TUFBQSxDQUFBLEVBQUcsSUFBSSxDQUFDLEVBQUwsR0FBVSxDQUFiO01BQ0EsQ0FBQSxFQUFHLEdBREg7TUFFQSxDQUFBLEVBQUcsQ0FBQSxHQUFJLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FGYjs7SUFHRixJQUFDLENBQUEsV0FBRCxHQUFlLGlCQUFBLEdBQW9CLElBQUMsQ0FBQSxJQUFJLENBQUM7SUFDekMsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixHQUFlLGlCQUExQjtJQUNkLElBQUMsQ0FBQSxTQUFELEdBQWMsSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFDLENBQUEsVUFBRCxHQUFjLFlBQWQsR0FBNkIsWUFBeEM7SUFDZCxJQUFDLENBQUEsY0FBRCxHQUFrQixJQUFDLENBQUEsVUFBRCxJQUFlO0lBQ2pDLElBQUMsQ0FBQSxhQUFELEdBQWtCLElBQUMsQ0FBQSxTQUFELElBQWM7SUFDaEMsU0FBQSxHQUFZLElBQUMsQ0FBQSxTQUFELEdBQWE7SUFDekIsZUFBQSxHQUFrQixJQUFDLENBQUEsVUFBRCxHQUFjO0lBQ2hDLFVBQUEsR0FBYztNQUFFLENBQUEsRUFBRyxTQUFMO01BQStCLENBQUEsRUFBRyxlQUFBLEdBQWtCLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBMUQ7O0lBQ2QsV0FBQSxHQUFjO01BQUUsQ0FBQSxFQUFHLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixHQUFjLFNBQW5CO01BQThCLENBQUEsRUFBRyxlQUFBLEdBQWtCLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBekQ7O0lBQ2QsSUFBQyxDQUFBLFVBQUQsR0FBYztNQUFFLENBQUEsRUFBRyxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQU4sR0FBYyxDQUFuQjtNQUE4QixDQUFBLEVBQUcsZUFBQSxHQUFrQixJQUFDLENBQUEsSUFBSSxDQUFDLE1BQXhCLEdBQWlDLENBQUMsMkJBQUEsR0FBOEIsSUFBQyxDQUFBLElBQUksQ0FBQyxNQUFyQyxDQUFsRTs7SUFDZCxJQUFDLENBQUEsU0FBRCxHQUFhLFNBQUEsQ0FBVSxVQUFWLEVBQXNCLElBQUMsQ0FBQSxVQUF2QixFQUFtQyxXQUFuQztJQUNiLElBQUMsQ0FBQSxZQUFELEdBQWdCLFlBQUEsQ0FBYSxVQUFiLEVBQXlCLElBQUMsQ0FBQSxVQUExQjtJQUNoQixJQUFDLENBQUEsbUJBQUQsR0FBdUIsSUFBQyxDQUFBLFNBQUQsR0FBYTtJQUNwQyxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBVSxnQkFBQSxHQUFpQixJQUFDLENBQUEsWUFBbEIsR0FBK0IsVUFBL0IsR0FBeUMsSUFBQyxDQUFBLFNBQTFDLEdBQW9ELGtCQUFwRCxHQUFzRSxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQTVFLEdBQW1GLEdBQTdGO0VBaENXOztpQkFrQ2IsYUFBQSxHQUFlLFNBQUE7SUFDYixJQUFDLENBQUEsT0FBRCxHQUFXLENBQUMsSUFBQyxDQUFBO0lBQ2IsSUFBRyxJQUFDLENBQUEsT0FBSjthQUNFLElBQUMsQ0FBQSxVQUFELENBQUEsRUFERjs7RUFGYTs7aUJBS2YsVUFBQSxHQUFZLFNBQUE7SUFDVixJQUFDLENBQUEsTUFBRCxHQUFVLElBQUksS0FBSixDQUFVLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBakIsQ0FBd0IsQ0FBQyxJQUF6QixDQUE4QixLQUE5QjtFQURBOztpQkFJWixHQUFBLEdBQUssU0FBQyxLQUFEO0lBQ0gsSUFBQyxDQUFBLEtBQUQsR0FBUyxLQUFLLENBQUMsS0FBTixDQUFZLENBQVo7SUFDVCxJQUFHLElBQUMsQ0FBQSxPQUFKO01BQ0UsSUFBQyxDQUFBLFVBQUQsQ0FBQSxFQURGOztJQUVBLElBQUMsQ0FBQSxTQUFELENBQUE7V0FDQSxJQUFDLENBQUEsSUFBRCxDQUFBO0VBTEc7O2lCQU9MLFNBQUEsR0FBVyxTQUFBO0FBQ1QsUUFBQTtJQUFBLElBQUEsR0FBTztBQUNQO0FBQUEsU0FBQSxxQ0FBQTs7TUFDRSxJQUFLLENBQUEsSUFBQSxDQUFMO01BQ0EsSUFBRyxDQUFJLElBQUMsQ0FBQSxLQUFNLENBQUEsSUFBQSxDQUFkO1FBQ0UsSUFBQyxDQUFBLEtBQU0sQ0FBQSxJQUFBLENBQVAsR0FBZSxJQUFJLFNBQUosQ0FBYztVQUMzQixLQUFBLEVBQU8sSUFBQyxDQUFBLFNBRG1CO1VBRTNCLENBQUEsRUFBRyxDQUZ3QjtVQUczQixDQUFBLEVBQUcsQ0FId0I7VUFJM0IsQ0FBQSxFQUFHLENBSndCO1NBQWQsRUFEakI7O0FBRkY7SUFTQSxRQUFBLEdBQVc7QUFDWDtBQUFBLFNBQUEsWUFBQTs7TUFDRSxJQUFHLENBQUksSUFBSSxDQUFDLGNBQUwsQ0FBb0IsSUFBcEIsQ0FBUDtRQUNFLFFBQVEsQ0FBQyxJQUFULENBQWMsSUFBZCxFQURGOztBQURGO0FBR0EsU0FBQSw0Q0FBQTs7TUFFRSxPQUFPLElBQUMsQ0FBQSxLQUFNLENBQUEsSUFBQTtBQUZoQjtXQUlBLElBQUMsQ0FBQSxlQUFELENBQUE7RUFuQlM7O2lCQXFCWCxhQUFBLEdBQWUsU0FBQTtBQUNiLFFBQUE7SUFBQSxTQUFBLEdBQVk7QUFDWjtBQUFBLFNBQUEsNkNBQUE7O01BQ0UsSUFBRyxDQUFBLEtBQUssSUFBQyxDQUFBLGNBQVQ7UUFDRSxTQUFTLENBQUMsSUFBVixDQUFlLElBQWYsRUFERjs7QUFERjtJQUlBLElBQUcsSUFBQyxDQUFBLGdCQUFELEtBQXFCLE9BQXhCO01BQ0UsU0FBUyxDQUFDLE1BQVYsQ0FBaUIsSUFBQyxDQUFBLGdCQUFsQixFQUFvQyxDQUFwQyxFQUF1QyxJQUFDLENBQUEsS0FBTSxDQUFBLElBQUMsQ0FBQSxjQUFELENBQTlDLEVBREY7O0FBRUEsV0FBTztFQVJNOztpQkFVZixzQkFBQSxHQUF3QixTQUFBO0lBQ3RCLElBQWdCLElBQUMsQ0FBQSxjQUFELEtBQW1CLE9BQW5DO0FBQUEsYUFBTyxNQUFQOztBQUNBLFdBQU8sSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFDLENBQUE7RUFGSzs7aUJBSXhCLGVBQUEsR0FBaUIsU0FBQTtBQUNmLFFBQUE7SUFBQSxTQUFBLEdBQVksSUFBQyxDQUFBLGFBQUQsQ0FBQTtJQUNaLFdBQUEsR0FBYyxJQUFDLENBQUEsc0JBQUQsQ0FBQTtJQUNkLGVBQUEsR0FBa0I7SUFDbEIsYUFBQSxHQUFnQixTQUFTLENBQUM7SUFDMUIsSUFBRyxXQUFIO01BQ0UsZUFBQSxHQUFrQjtNQUNsQixhQUFBLEdBRkY7O0lBR0EsU0FBQSxHQUFZLElBQUMsQ0FBQSxhQUFELENBQWUsYUFBZjtJQUNaLFNBQUEsR0FBWTtBQUNaO1NBQUEsbURBQUE7O01BQ0UsSUFBQSxHQUFPLElBQUMsQ0FBQSxLQUFNLENBQUEsSUFBQTtNQUNkLElBQUcsQ0FBQSxLQUFLLElBQUMsQ0FBQSxnQkFBVDtRQUNFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBVCxHQUFhLElBQUMsQ0FBQTtRQUNkLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBVCxHQUFhLElBQUMsQ0FBQTtRQUNkLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBVCxHQUFhO1FBQ2IsSUFBRyxDQUFJLFdBQVA7dUJBQ0UsU0FBQSxJQURGO1NBQUEsTUFBQTsrQkFBQTtTQUpGO09BQUEsTUFBQTtRQU9FLEdBQUEsR0FBTSxTQUFVLENBQUEsU0FBQTtRQUNoQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQVQsR0FBYSxHQUFHLENBQUM7UUFDakIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFULEdBQWEsR0FBRyxDQUFDO1FBQ2pCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBVCxHQUFhLEdBQUcsQ0FBQztxQkFDakIsU0FBQSxJQVhGOztBQUZGOztFQVZlOztpQkEwQmpCLElBQUEsR0FBTSxTQUFBO0FBQ0osUUFBQTtBQUFBO0FBQUE7U0FBQSxXQUFBOzttQkFDRSxJQUFJLENBQUMsSUFBTCxDQUFBO0FBREY7O0VBREk7O2lCQUtOLE9BQUEsR0FBUyxTQUFBO0FBQ1AsUUFBQTtJQUFBLElBQVUsSUFBQyxDQUFBLGNBQUQsS0FBbUIsT0FBN0I7QUFBQSxhQUFBOztJQUNBLElBQVUsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLEdBQWdCLENBQTFCO0FBQUEsYUFBQTs7SUFDQSxTQUFBLEdBQVksSUFBQyxDQUFBLGFBQUQsQ0FBZSxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQXRCO0lBQ1osWUFBQSxHQUFlO0lBQ2YsV0FBQSxHQUFjLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixHQUFjLElBQUMsQ0FBQSxJQUFJLENBQUM7QUFDbEMsU0FBQSwyREFBQTs7TUFDRSxJQUFBLEdBQU8sbUJBQUEsQ0FBb0IsR0FBRyxDQUFDLENBQXhCLEVBQTJCLEdBQUcsQ0FBQyxDQUEvQixFQUFrQyxJQUFDLENBQUEsS0FBbkMsRUFBMEMsSUFBQyxDQUFBLEtBQTNDO01BQ1AsSUFBRyxXQUFBLEdBQWMsSUFBakI7UUFDRSxXQUFBLEdBQWM7UUFDZCxZQUFBLEdBQWUsTUFGakI7O0FBRkY7V0FLQSxJQUFDLENBQUEsZ0JBQUQsR0FBb0I7RUFYYjs7aUJBYVQsYUFBQSxHQUFlLFNBQUE7QUFDYixRQUFBO0lBQUEsSUFBRyxDQUFJLElBQUMsQ0FBQSxPQUFSO0FBQ0UsYUFBTyxHQURUOztJQUdBLEtBQUEsR0FBUTtBQUNSO0FBQUEsU0FBQSw2Q0FBQTs7TUFDRSxJQUFHLElBQUMsQ0FBQSxNQUFPLENBQUEsQ0FBQSxDQUFYO1FBQ0UsSUFBQSxHQUFPLElBQUMsQ0FBQSxLQUFNLENBQUEsSUFBQTtRQUNkLEtBQUssQ0FBQyxJQUFOLENBQVc7VUFDVCxJQUFBLEVBQU0sSUFERztVQUVULENBQUEsRUFBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBRkg7VUFHVCxDQUFBLEVBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUhIO1VBSVQsQ0FBQSxFQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FKSDtVQUtULEtBQUEsRUFBTyxDQUxFO1NBQVgsRUFGRjs7QUFERjtBQVVBLFdBQU87RUFmTTs7aUJBaUJmLElBQUEsR0FBTSxTQUFDLEtBQUQsRUFBUyxLQUFULEVBQWlCLEtBQWpCO0lBQUMsSUFBQyxDQUFBLFFBQUQ7SUFBUSxJQUFDLENBQUEsUUFBRDtJQUNiLElBQUMsQ0FBQSxFQUFELENBQUksSUFBQyxDQUFBLEtBQUwsRUFBWSxJQUFDLENBQUEsS0FBYjtJQUNBLElBQUcsSUFBQyxDQUFBLE9BQUo7TUFDRSxJQUFDLENBQUEsTUFBTyxDQUFBLEtBQUEsQ0FBUixHQUFpQixDQUFDLElBQUMsQ0FBQSxNQUFPLENBQUEsS0FBQTtNQUMxQixJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQSxNQUFPLENBQUEsS0FBQTtBQUNyQixhQUhGOztJQUlBLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFVLHdCQUFBLEdBQXlCLEtBQW5DO0lBQ0EsSUFBQyxDQUFBLGNBQUQsR0FBa0I7SUFDbEIsSUFBQyxDQUFBLGdCQUFELEdBQW9CO1dBQ3BCLElBQUMsQ0FBQSxlQUFELENBQUE7RUFUSTs7aUJBV04sSUFBQSxHQUFNLFNBQUMsS0FBRCxFQUFTLEtBQVQ7SUFBQyxJQUFDLENBQUEsUUFBRDtJQUFRLElBQUMsQ0FBQSxRQUFEO0lBQ2IsSUFBVSxJQUFDLENBQUEsY0FBRCxLQUFtQixPQUE3QjtBQUFBLGFBQUE7O0lBRUEsSUFBQyxDQUFBLE9BQUQsQ0FBQTtXQUNBLElBQUMsQ0FBQSxlQUFELENBQUE7RUFKSTs7aUJBTU4sRUFBQSxHQUFJLFNBQUMsS0FBRCxFQUFTLEtBQVQ7QUFDRixRQUFBO0lBREcsSUFBQyxDQUFBLFFBQUQ7SUFBUSxJQUFDLENBQUEsUUFBRDtJQUNYLElBQVUsSUFBQyxDQUFBLGNBQUQsS0FBbUIsT0FBN0I7QUFBQSxhQUFBOztJQUNBLElBQUMsQ0FBQSxPQUFELENBQUE7SUFDQSxJQUFHLElBQUMsQ0FBQSxzQkFBRCxDQUFBLENBQUg7TUFDRSxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBVSxtQkFBQSxHQUFvQixJQUFDLENBQUEsS0FBTSxDQUFBLElBQUMsQ0FBQSxjQUFELENBQTNCLEdBQTRDLGNBQTVDLEdBQTBELElBQUMsQ0FBQSxjQUFyRTtNQUNBLFNBQUEsR0FBWSxJQUFDLENBQUE7TUFDYixJQUFBLEdBQU8sSUFBQyxDQUFBLEtBQU0sQ0FBQSxTQUFBO01BQ2QsSUFBQSxHQUFPLElBQUMsQ0FBQSxLQUFNLENBQUEsSUFBQTtNQUNkLElBQUMsQ0FBQSxjQUFELEdBQWtCO01BQ2xCLElBQUMsQ0FBQSxnQkFBRCxHQUFvQjtNQUNwQixJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBVztRQUFDO1VBQ1YsSUFBQSxFQUFNLElBREk7VUFFVixDQUFBLEVBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUZGO1VBR1YsQ0FBQSxFQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FIRjtVQUlWLENBQUEsRUFBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBSkY7VUFLVixLQUFBLEVBQU8sU0FMRztTQUFEO09BQVgsRUFQRjtLQUFBLE1BQUE7TUFlRSxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBVSxvQkFBQSxHQUFxQixJQUFDLENBQUEsS0FBTSxDQUFBLElBQUMsQ0FBQSxjQUFELENBQTVCLEdBQTZDLGNBQTdDLEdBQTJELElBQUMsQ0FBQSxnQkFBdEU7TUFDQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUMsQ0FBQSxhQUFELENBQUEsRUFoQlg7O0lBa0JBLElBQUMsQ0FBQSxjQUFELEdBQWtCO0lBQ2xCLElBQUMsQ0FBQSxnQkFBRCxHQUFvQjtXQUNwQixJQUFDLENBQUEsZUFBRCxDQUFBO0VBdkJFOztpQkF5QkosTUFBQSxHQUFRLFNBQUMsRUFBRDtBQUNOLFFBQUE7SUFBQSxPQUFBLEdBQVU7QUFDVjtBQUFBLFNBQUEsV0FBQTs7TUFDRSxJQUFHLElBQUksQ0FBQyxNQUFMLENBQVksRUFBWixDQUFIO1FBQ0UsT0FBQSxHQUFVLEtBRFo7O0FBREY7QUFHQSxXQUFPO0VBTEQ7O2lCQU9SLE1BQUEsR0FBUSxTQUFBO0FBQ04sUUFBQTtJQUFBLElBQVUsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLEtBQWlCLENBQTNCO0FBQUEsYUFBQTs7SUFDQSxTQUFBLEdBQVksSUFBQyxDQUFBLGFBQUQsQ0FBQTtBQUNaO1NBQUEsMkRBQUE7O01BQ0UsSUFBWSxDQUFBLEtBQUssT0FBakI7QUFBQSxpQkFBQTs7TUFDQSxJQUFBLEdBQU8sSUFBQyxDQUFBLEtBQU0sQ0FBQSxDQUFBO21CQUNYLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFELEVBQU8sS0FBUDtBQUNELGNBQUE7VUFBQSxJQUFHLEtBQUMsQ0FBQSxPQUFKO1lBQ0UsSUFBRyxLQUFDLENBQUEsTUFBTyxDQUFBLEtBQUEsQ0FBWDtjQUNFLGNBQUEsR0FBaUIsU0FBUyxDQUFDLFNBRDdCO2FBQUEsTUFBQTtjQUdFLGNBQUEsR0FBaUIsU0FBUyxDQUFDLFdBSDdCO2FBREY7V0FBQSxNQUFBO1lBTUUsSUFBRyxLQUFDLENBQUEsc0JBQUQsQ0FBQSxDQUFIO2NBQ0UsSUFBSSxLQUFBLEtBQVMsS0FBQyxDQUFBLGdCQUFkO2dCQUNFLGNBQUEsR0FBaUIsU0FBUyxDQUFDLFNBRDdCO2VBQUEsTUFBQTtnQkFHRSxjQUFBLEdBQWlCLFNBQVMsQ0FBQyxXQUg3QjtlQURGO2FBQUEsTUFBQTtjQU1FLGNBQUEsR0FBaUIsU0FBUyxDQUFDLEtBTjdCO2FBTkY7O2lCQWFBLEtBQUMsQ0FBQSxVQUFELENBQVksQ0FBWixFQUFlLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBeEIsRUFBMkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFwQyxFQUF1QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQWhELEVBQW1ELENBQW5ELEVBQXNELGNBQXRELEVBQXNFLFNBQUMsTUFBRCxFQUFTLE1BQVQ7bUJBQ3BFLEtBQUMsQ0FBQSxJQUFELENBQU0sTUFBTixFQUFjLE1BQWQsRUFBc0IsS0FBdEI7VUFEb0UsQ0FBdEU7UUFkQztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBSCxDQUFJLElBQUosRUFBVSxLQUFWO0FBSEY7O0VBSE07O2lCQXVCUixVQUFBLEdBQVksU0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxHQUFWLEVBQWUsS0FBZixFQUFzQixRQUF0QixFQUFnQyxFQUFoQztBQUNWLFFBQUE7SUFBQSxJQUFXLENBQUksR0FBZjtNQUFBLEdBQUEsR0FBTSxFQUFOOztJQUNBLElBQUEsR0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLENBQUEsR0FBSSxDQUFmO0lBQ1AsSUFBQSxHQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBQSxHQUFJLENBQWY7SUFFUCxHQUFBO0FBQU0sY0FBTyxRQUFQO0FBQUEsYUFDQyxTQUFTLENBQUMsSUFEWDtpQkFFRixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUDtBQUZFLGFBR0MsU0FBUyxDQUFDLFVBSFg7aUJBS0YsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVA7QUFMRSxhQU1DLFNBQVMsQ0FBQyxRQU5YO2lCQU9GLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYO0FBUEUsYUFRQyxTQUFTLENBQUMsSUFSWDtpQkFTRixDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWDtBQVRFOztXQVdOLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBTixDQUFnQixPQUFoQixFQUNBLGdCQUFBLEdBQW1CLENBQUMsZ0JBQUEsR0FBbUIsSUFBcEIsQ0FEbkIsRUFDOEMsZ0JBQUEsR0FBbUIsQ0FBQyxnQkFBQSxHQUFtQixJQUFwQixDQURqRSxFQUM0RixZQUQ1RixFQUMwRyxZQUQxRyxFQUVBLENBRkEsRUFFRyxDQUZILEVBRU0sSUFBQyxDQUFBLFNBQUQsR0FBYSxLQUZuQixFQUUwQixJQUFDLENBQUEsVUFBRCxHQUFjLEtBRnhDLEVBR0EsR0FIQSxFQUdLLEdBSEwsRUFHVSxHQUhWLEVBR2UsR0FBSSxDQUFBLENBQUEsQ0FIbkIsRUFHc0IsR0FBSSxDQUFBLENBQUEsQ0FIMUIsRUFHNkIsR0FBSSxDQUFBLENBQUEsQ0FIakMsRUFHb0MsQ0FIcEMsRUFHdUMsRUFIdkM7RUFoQlU7O2lCQXFCWixhQUFBLEdBQWUsU0FBQyxRQUFEO0FBQ2IsUUFBQTtJQUFBLElBQUcsSUFBQyxDQUFBLGFBQWEsQ0FBQyxjQUFmLENBQThCLFFBQTlCLENBQUg7QUFDRSxhQUFPLElBQUMsQ0FBQSxhQUFjLENBQUEsUUFBQSxFQUR4Qjs7SUFFQSxJQUFhLFFBQUEsS0FBWSxDQUF6QjtBQUFBLGFBQU8sR0FBUDs7SUFFQSxPQUFBLEdBQVUsSUFBQyxDQUFBLFNBQUQsR0FBYTtJQUN2QixJQUFHLE9BQUEsR0FBVSxJQUFDLENBQUEsbUJBQWQ7TUFDRSxPQUFBLEdBQVUsSUFBQyxDQUFBLG9CQURiOztJQUVBLFdBQUEsR0FBYyxPQUFBLEdBQVU7SUFDeEIsYUFBQSxHQUFnQixJQUFDLENBQUEsU0FBRCxHQUFhO0lBQzdCLFlBQUEsR0FBZSxDQUFDLENBQUQsR0FBSyxDQUFDLElBQUMsQ0FBQSxTQUFELEdBQWEsQ0FBZDtJQUNwQixZQUFBLElBQWdCLGFBQUEsR0FBZ0I7SUFDaEMsWUFBQSxJQUFnQixPQUFBLEdBQVU7SUFFMUIsU0FBQSxHQUFZO0FBQ1osU0FBUyxpRkFBVDtNQUNFLENBQUEsR0FBSSxJQUFDLENBQUEsVUFBVSxDQUFDLENBQVosR0FBZ0IsSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFDLElBQUksQ0FBQyxFQUFMLEdBQVUsQ0FBWCxDQUFBLEdBQWdCLFlBQXpCLENBQUEsR0FBeUMsSUFBQyxDQUFBO01BQzlELENBQUEsR0FBSSxJQUFDLENBQUEsVUFBVSxDQUFDLENBQVosR0FBZ0IsSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFDLElBQUksQ0FBQyxFQUFMLEdBQVUsQ0FBWCxDQUFBLEdBQWdCLFlBQXpCLENBQUEsR0FBeUMsSUFBQyxDQUFBO01BQzlELFlBQUEsSUFBZ0I7TUFDaEIsU0FBUyxDQUFDLElBQVYsQ0FBZTtRQUNiLENBQUEsRUFBRyxDQURVO1FBRWIsQ0FBQSxFQUFHLENBRlU7UUFHYixDQUFBLEVBQUcsWUFBQSxHQUFlLE9BSEw7T0FBZjtBQUpGO0lBVUEsSUFBQyxDQUFBLGFBQWMsQ0FBQSxRQUFBLENBQWYsR0FBMkI7QUFDM0IsV0FBTztFQTFCTTs7Ozs7O0FBNEJqQixNQUFNLENBQUMsT0FBUCxHQUFpQjs7OztBQ3pUakIsSUFBQTs7QUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0FBRUg7RUFDUyxjQUFDLElBQUQsRUFBUSxLQUFSLEVBQWdCLFVBQWhCLEVBQTZCLEtBQTdCLEVBQXFDLE9BQXJDO0FBQ1gsUUFBQTtJQURZLElBQUMsQ0FBQSxPQUFEO0lBQU8sSUFBQyxDQUFBLFFBQUQ7SUFBUSxJQUFDLENBQUEsYUFBRDtJQUFhLElBQUMsQ0FBQSxRQUFEO0lBQVEsSUFBQyxDQUFBLFVBQUQ7SUFDaEQsSUFBQyxDQUFBLE9BQUQsR0FBVztJQUNYLElBQUMsQ0FBQSxXQUFELEdBQWUsQ0FBQyxTQUFELEVBQVksU0FBWjtJQUVmLFVBQUEsR0FBYSxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sR0FBZTtJQUM1QixJQUFDLENBQUEsWUFBRCxHQUFnQixJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sR0FBZTtJQUUvQixLQUFBLEdBQVEsQ0FBQyxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sR0FBZSxJQUFDLENBQUEsWUFBakIsQ0FBQSxHQUFpQyxDQUFDLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxHQUFrQixDQUFuQjtJQUN6QyxLQUFBLEdBQVEsSUFBQyxDQUFBLFlBQUQsR0FBZ0I7QUFDeEI7QUFBQSxTQUFBLHFDQUFBOztNQUNFLE1BQUEsR0FBUyxJQUFJLE1BQUosQ0FBVyxJQUFDLENBQUEsSUFBWixFQUFrQixJQUFDLENBQUEsV0FBbkIsRUFBZ0MsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUF0QyxFQUE0QyxVQUE1QyxFQUF3RCxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFyRSxFQUF3RSxLQUF4RSxFQUErRSxNQUEvRTtNQUNULElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLE1BQWQ7TUFDQSxLQUFBLElBQVM7QUFIWDtFQVRXOztpQkFjYixNQUFBLEdBQVEsU0FBQyxFQUFEO0FBQ04sUUFBQTtJQUFBLE9BQUEsR0FBVTtBQUNWO0FBQUEsU0FBQSxxQ0FBQTs7TUFDRSxJQUFHLE1BQU0sQ0FBQyxNQUFQLENBQWMsRUFBZCxDQUFIO1FBQ0UsT0FBQSxHQUFVLEtBRFo7O0FBREY7QUFHQSxXQUFPO0VBTEQ7O2lCQU9SLE1BQUEsR0FBUSxTQUFBO0FBQ04sUUFBQTtJQUFBLElBQUMsQ0FBQSxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQXJCLENBQTRCLElBQUMsQ0FBQSxVQUE3QixFQUF5QyxDQUF6QyxFQUE0QyxDQUE1QyxFQUErQyxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQXJELEVBQTRELElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBbEUsRUFBMEUsQ0FBMUUsRUFBNkUsQ0FBN0UsRUFBZ0YsQ0FBaEYsRUFBbUYsSUFBQyxDQUFBLEtBQXBGO0lBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBbkIsQ0FBMEIsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFoQyxFQUFzQyxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sR0FBZSxFQUFyRCxFQUF5RCxTQUFBLEdBQVUsSUFBQyxDQUFBLElBQUksQ0FBQyxPQUF6RSxFQUFvRixDQUFwRixFQUF1RixJQUFDLENBQUEsSUFBSSxDQUFDLE1BQTdGLEVBQXFHLENBQXJHLEVBQXdHLENBQXhHLEVBQTJHLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQXhIO0lBQ0EsV0FBQSxHQUFjLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixHQUFlO0lBQzdCLFdBQUEsR0FBYyxJQUFDLENBQUEsWUFBRCxJQUFpQjtJQUMvQixJQUFDLENBQUEsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFuQixDQUEwQixJQUFDLENBQUEsSUFBSSxDQUFDLElBQWhDLEVBQXNDLFdBQXRDLEVBQW1ELElBQUMsQ0FBQSxLQUFwRCxFQUEyRCxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUF4RSxFQUEyRSxXQUEzRSxFQUF3RixHQUF4RixFQUE2RixHQUE3RixFQUFrRyxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUEvRztBQUNBO0FBQUE7U0FBQSxxQ0FBQTs7bUJBQ0UsTUFBTSxDQUFDLE1BQVAsQ0FBQTtBQURGOztFQU5NOzs7Ozs7QUFTVixNQUFNLENBQUMsT0FBUCxHQUFpQjs7OztBQ2pDakIsSUFBQTs7QUFBQSxTQUFBLEdBQVksT0FBQSxDQUFRLGFBQVI7O0FBQ1osSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztBQUVQLFNBQUEsR0FBWTs7QUFFTjtFQUNTLGNBQUMsSUFBRCxFQUFRLElBQVI7QUFDWCxRQUFBO0lBRFksSUFBQyxDQUFBLE9BQUQ7SUFBTyxJQUFDLENBQUEsT0FBRDtJQUNuQixJQUFDLENBQUEsTUFBRCxHQUFVLENBQUM7SUFDWCxJQUFDLENBQUEsS0FBRCxHQUFTO0lBQ1QsSUFBQyxDQUFBLEtBQUQsR0FBUztJQUNULElBQUMsQ0FBQSxXQUFELEdBQWU7SUFDZixJQUFDLENBQUEsV0FBRCxHQUFlO01BQUUsQ0FBQSxFQUFHLENBQUw7TUFBUSxDQUFBLEVBQUcsQ0FBWDtNQUFjLENBQUEsRUFBRyxDQUFqQjtNQUFvQixDQUFBLEVBQUcsQ0FBdkI7O0lBQ2YsSUFBQyxDQUFBLEtBQUQsR0FBUztJQUdULEtBQUEsR0FBUTtJQUVSLElBQUMsQ0FBQSxlQUFELEdBQW1CO0lBRW5CLE9BQUEsR0FBVSxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUN2QixPQUFBLEdBQVUsSUFBQyxDQUFBLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDdkIsT0FBQSxHQUFVLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBTixHQUFrQixLQUFsQixHQUEwQixJQUFDLENBQUE7SUFDckMsT0FBQSxHQUFVLElBQUMsQ0FBQSxJQUFJLENBQUMsY0FBTixHQUF1QixLQUF2QixHQUErQixJQUFDLENBQUE7SUFDMUMsSUFBQyxDQUFBLGFBQUQsR0FBaUI7TUFDZjtRQUFFLENBQUEsRUFBRyxPQUFMO1FBQWMsQ0FBQSxFQUFHLE9BQUEsR0FBVSxPQUEzQjtPQURlLEVBRWY7UUFBRSxDQUFBLEVBQUcsT0FBQSxHQUFVLE9BQWY7UUFBd0IsQ0FBQSxFQUFHLE9BQTNCO09BRmUsRUFHZjtRQUFFLENBQUEsRUFBRyxPQUFMO1FBQWMsQ0FBQSxFQUFHLE9BQUEsR0FBVSxPQUEzQjtPQUhlLEVBSWY7UUFBRSxDQUFBLEVBQUcsT0FBQSxHQUFVLE9BQWY7UUFBd0IsQ0FBQSxFQUFHLE9BQTNCO09BSmU7O0lBTWpCLElBQUMsQ0FBQSxjQUFELEdBQWtCO01BQ2hCO1FBQUUsQ0FBQSxFQUFHLE9BQUw7UUFBYyxDQUFBLEVBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxNQUF2QjtPQURnQixFQUVoQjtRQUFFLENBQUEsRUFBRyxDQUFMO1FBQVEsQ0FBQSxFQUFHLE9BQUEsR0FBVSxPQUFyQjtPQUZnQixFQUdoQjtRQUFFLENBQUEsRUFBRyxPQUFMO1FBQWMsQ0FBQSxFQUFHLENBQWpCO09BSGdCLEVBSWhCO1FBQUUsQ0FBQSxFQUFHLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBWDtRQUFrQixDQUFBLEVBQUcsT0FBQSxHQUFVLE9BQS9CO09BSmdCOztFQXZCUDs7aUJBOEJiLEdBQUEsR0FBSyxTQUFDLE1BQUQsRUFBUyxJQUFULEVBQWUsT0FBZjtJQUNILElBQUcsSUFBQyxDQUFBLE1BQUQsS0FBVyxNQUFkO01BQ0UsSUFBQyxDQUFBLE1BQUQsR0FBVTtNQUNWLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFZO1FBQ1YsS0FBQSxFQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBWCxDQURHO1FBRVYsR0FBQSxFQUFLLE9BRks7T0FBWjtNQUlBLElBQUMsQ0FBQSxXQUFELEdBQWUsVUFOakI7O1dBc0JBLElBQUMsQ0FBQSxTQUFELENBQUE7RUF2Qkc7O2lCQXlCTCxJQUFBLEdBQU0sU0FBQyxLQUFEO0FBQ0osUUFBQTtBQUFBO1NBQUEsdUNBQUE7O21CQUNFLElBQUMsQ0FBQSxLQUFNLENBQUEsSUFBSSxDQUFDLElBQUwsQ0FBUCxHQUFvQixJQUFJLFNBQUosQ0FBYztRQUNoQyxLQUFBLEVBQU8sSUFBQyxDQUFBLElBQUksQ0FBQyxTQURtQjtRQUVoQyxDQUFBLEVBQUcsSUFBSSxDQUFDLENBRndCO1FBR2hDLENBQUEsRUFBRyxJQUFJLENBQUMsQ0FId0I7UUFJaEMsQ0FBQSxFQUFHLElBQUksQ0FBQyxDQUp3QjtRQUtoQyxDQUFBLEVBQUcsQ0FMNkI7T0FBZDtBQUR0Qjs7RUFESTs7aUJBVU4sU0FBQSxHQUFXLFNBQUE7QUFDVCxRQUFBO0lBQUEsSUFBQSxHQUFPO0lBQ1AsU0FBQSxHQUFZLElBQUMsQ0FBQTtBQUNiO0FBQUEsU0FBQSxxQ0FBQTs7QUFDRTtBQUFBLFdBQUEsd0RBQUE7O1FBQ0UsSUFBSyxDQUFBLElBQUEsQ0FBTDtRQUNBLElBQUcsQ0FBSSxJQUFDLENBQUEsS0FBTSxDQUFBLElBQUEsQ0FBZDtVQUNFLEdBQUEsR0FBTSxJQUFJLENBQUM7VUFDWCxRQUFBLEdBQVcsU0FBVSxDQUFBLEdBQUE7VUFDckIsSUFBQyxDQUFBLEtBQU0sQ0FBQSxJQUFBLENBQVAsR0FBZSxJQUFJLFNBQUosQ0FBYztZQUMzQixLQUFBLEVBQU8sSUFBQyxDQUFBLElBQUksQ0FBQyxTQURjO1lBRTNCLENBQUEsRUFBRyxRQUFRLENBQUMsQ0FGZTtZQUczQixDQUFBLEVBQUcsUUFBUSxDQUFDLENBSGU7WUFJM0IsQ0FBQSxFQUFHLENBQUMsQ0FBRCxHQUFLLElBQUksQ0FBQyxFQUFWLEdBQWUsQ0FKUztZQUszQixDQUFBLEVBQUcsSUFBQyxDQUFBLEtBTHVCO1dBQWQsRUFIakI7O0FBRkY7QUFERjtJQWNBLFFBQUEsR0FBVztBQUNYO0FBQUEsU0FBQSxZQUFBOztNQUNFLElBQUcsQ0FBSSxJQUFJLENBQUMsY0FBTCxDQUFvQixJQUFwQixDQUFQO1FBQ0UsUUFBUSxDQUFDLElBQVQsQ0FBYyxJQUFkLEVBREY7O0FBREY7QUFHQSxTQUFBLDRDQUFBOztNQUVFLE9BQU8sSUFBQyxDQUFBLEtBQU0sQ0FBQSxJQUFBO0FBRmhCO1dBSUEsSUFBQyxDQUFBLGVBQUQsQ0FBQTtFQXpCUzs7aUJBMkJYLGVBQUEsR0FBaUIsU0FBQTtBQUNmLFFBQUE7SUFBQSxTQUFBLEdBQVksSUFBQyxDQUFBO0FBQ2I7QUFBQTtTQUFBLDZEQUFBOzs7O0FBQ0U7QUFBQTthQUFBLHdEQUFBOztVQUNFLElBQUEsR0FBTyxJQUFDLENBQUEsS0FBTSxDQUFBLENBQUE7VUFDZCxHQUFBLEdBQU0sSUFBSSxDQUFDO1VBQ1gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFULEdBQWEsU0FBVSxDQUFBLEdBQUEsQ0FBSSxDQUFDLENBQWYsR0FBbUIsQ0FBQyxLQUFBLEdBQVEsSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFkLEdBQTBCLElBQUMsQ0FBQSxlQUE1QjtVQUNoQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQVQsR0FBYSxTQUFVLENBQUEsR0FBQSxDQUFJLENBQUM7VUFDNUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFULEdBQWEsR0FBQSxHQUFNLElBQUksQ0FBQyxHQUFMLENBQVMsU0FBQSxHQUFZLEdBQXJCO3dCQUNuQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQVQsR0FBYSxJQUFDLENBQUE7QUFOaEI7OztBQURGOztFQUZlOztpQkFXakIsaUJBQUEsR0FBbUIsU0FBQTtBQUNqQixXQUFRLElBQUMsQ0FBQSxXQUFELEtBQWdCO0VBRFA7O2lCQUduQixNQUFBLEdBQVEsU0FBQyxFQUFEO0FBQ04sUUFBQTtJQUFBLE9BQUEsR0FBVTtJQUVWLElBQUcsSUFBQyxDQUFBLFdBQUQsR0FBZSxDQUFsQjtNQUNFLE9BQUEsR0FBVTtNQUNWLElBQUMsQ0FBQSxXQUFELElBQWdCO01BQ2hCLElBQUcsSUFBQyxDQUFBLFdBQUQsR0FBZSxDQUFsQjtRQUNFLElBQUMsQ0FBQSxXQUFELEdBQWUsRUFEakI7T0FIRjs7QUFNQTtBQUFBLFNBQUEsV0FBQTs7TUFDRSxJQUFHLElBQUksQ0FBQyxNQUFMLENBQVksRUFBWixDQUFIO1FBQ0UsT0FBQSxHQUFVLEtBRFo7O0FBREY7QUFJQSxXQUFPO0VBYkQ7O2lCQWdCUixPQUFBLEdBQVMsU0FBQTtBQUNQLFFBQUE7QUFBQTtBQUFBLFNBQUEsV0FBQTs7TUFDRSxJQUFHLElBQUksQ0FBQyxTQUFMLENBQUEsQ0FBSDtBQUNFLGVBQU8sTUFEVDs7QUFERjtJQUdBLElBQUcsSUFBQyxDQUFBLFdBQUQsR0FBZSxDQUFsQjtBQUNFLGFBQU8sTUFEVDs7QUFFQSxXQUFPO0VBTkE7O2lCQVFULE1BQUEsR0FBUSxTQUFBO0FBQ04sUUFBQTtBQUFBO0FBQUE7U0FBQSw2REFBQTs7TUFDRSxTQUFBLEdBQVksSUFBSSxDQUFDLFNBQVMsQ0FBQztNQUMzQixJQUFHLFNBQUEsS0FBYSxDQUFDLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxHQUFnQixDQUFqQixDQUFoQjtRQUNFLFNBQUEsR0FBWSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBRDdCOzs7O0FBRUE7QUFBQTthQUFBLHdEQUFBOztVQUNFLElBQUEsR0FBTyxJQUFDLENBQUEsS0FBTSxDQUFBLENBQUE7d0JBQ2QsSUFBQyxDQUFBLElBQUksQ0FBQyxVQUFOLENBQWlCLENBQWpCLEVBQW9CLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBN0IsRUFBZ0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUF6QyxFQUE0QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQXJELEVBQXdELElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBakUsRUFBb0UsU0FBcEU7QUFGRjs7O0FBSkY7O0VBRE07Ozs7OztBQVNWLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOzs7O0FDakpqQixJQUFBOztBQUFNO0VBQ1Msd0JBQUMsSUFBRDtJQUFDLElBQUMsQ0FBQSxPQUFEO0lBQ1osSUFBQyxDQUFBLE9BQUQsR0FFRTtNQUFBLEtBQUEsRUFBVztRQUFFLE9BQUEsRUFBUyxPQUFYO1FBQW9CLENBQUEsRUFBSSxFQUF4QjtRQUE0QixDQUFBLEVBQUcsR0FBL0I7UUFBb0MsQ0FBQSxFQUFJLEVBQXhDO1FBQTRDLENBQUEsRUFBSSxFQUFoRDtPQUFYO01BQ0EsS0FBQSxFQUFXO1FBQUUsT0FBQSxFQUFTLE9BQVg7UUFBb0IsQ0FBQSxFQUFHLEdBQXZCO1FBQTRCLENBQUEsRUFBRyxHQUEvQjtRQUFvQyxDQUFBLEVBQUcsR0FBdkM7UUFBNEMsQ0FBQSxFQUFHLEdBQS9DO09BRFg7TUFFQSxPQUFBLEVBQVc7UUFBRSxPQUFBLEVBQVMsT0FBWDtRQUFvQixDQUFBLEVBQUcsR0FBdkI7UUFBNEIsQ0FBQSxFQUFHLEdBQS9CO1FBQW9DLENBQUEsRUFBRyxHQUF2QztRQUE0QyxDQUFBLEVBQUksRUFBaEQ7T0FGWDtNQUdBLE9BQUEsRUFBVztRQUFFLE9BQUEsRUFBUyxPQUFYO1FBQW9CLENBQUEsRUFBRyxHQUF2QjtRQUE0QixDQUFBLEVBQUcsR0FBL0I7UUFBb0MsQ0FBQSxFQUFHLEdBQXZDO1FBQTRDLENBQUEsRUFBSSxFQUFoRDtPQUhYO01BSUEsS0FBQSxFQUFXO1FBQUUsT0FBQSxFQUFTLE9BQVg7UUFBb0IsQ0FBQSxFQUFHLEdBQXZCO1FBQTRCLENBQUEsRUFBRyxHQUEvQjtRQUFvQyxDQUFBLEVBQUcsR0FBdkM7UUFBNEMsQ0FBQSxFQUFHLEdBQS9DO09BSlg7TUFLQSxLQUFBLEVBQVc7UUFBRSxPQUFBLEVBQVMsT0FBWDtRQUFvQixDQUFBLEVBQUcsR0FBdkI7UUFBNEIsQ0FBQSxFQUFHLEdBQS9CO1FBQW9DLENBQUEsRUFBRyxHQUF2QztRQUE0QyxDQUFBLEVBQUcsR0FBL0M7T0FMWDtNQU1BLE1BQUEsRUFBVztRQUFFLE9BQUEsRUFBUyxPQUFYO1FBQW9CLENBQUEsRUFBRyxHQUF2QjtRQUE0QixDQUFBLEVBQUcsR0FBL0I7UUFBb0MsQ0FBQSxFQUFHLEdBQXZDO1FBQTRDLENBQUEsRUFBRyxHQUEvQztPQU5YO01BT0EsTUFBQSxFQUFXO1FBQUUsT0FBQSxFQUFTLE9BQVg7UUFBb0IsQ0FBQSxFQUFHLEdBQXZCO1FBQTRCLENBQUEsRUFBRyxHQUEvQjtRQUFvQyxDQUFBLEVBQUcsR0FBdkM7UUFBNEMsQ0FBQSxFQUFHLEdBQS9DO09BUFg7TUFRQSxNQUFBLEVBQVc7UUFBRSxPQUFBLEVBQVMsT0FBWDtRQUFvQixDQUFBLEVBQUksRUFBeEI7UUFBNEIsQ0FBQSxFQUFHLEdBQS9CO1FBQW9DLENBQUEsRUFBRyxHQUF2QztRQUE0QyxDQUFBLEVBQUcsR0FBL0M7T0FSWDtNQVNBLE1BQUEsRUFBVztRQUFFLE9BQUEsRUFBUyxPQUFYO1FBQW9CLENBQUEsRUFBRyxHQUF2QjtRQUE0QixDQUFBLEVBQUcsR0FBL0I7UUFBb0MsQ0FBQSxFQUFHLEdBQXZDO1FBQTRDLENBQUEsRUFBRyxHQUEvQztPQVRYO01BV0EsSUFBQSxFQUFXO1FBQUUsT0FBQSxFQUFTLE9BQVg7UUFBb0IsQ0FBQSxFQUFJLEVBQXhCO1FBQTRCLENBQUEsRUFBRyxHQUEvQjtRQUFvQyxDQUFBLEVBQUcsR0FBdkM7UUFBNEMsQ0FBQSxFQUFHLEdBQS9DO09BWFg7TUFZQSxLQUFBLEVBQVc7UUFBRSxPQUFBLEVBQVMsT0FBWDtRQUFvQixDQUFBLEVBQUcsR0FBdkI7UUFBNEIsQ0FBQSxFQUFHLEdBQS9CO1FBQW9DLENBQUEsRUFBRyxHQUF2QztRQUE0QyxDQUFBLEVBQUcsR0FBL0M7T0FaWDtNQWFBLEtBQUEsRUFBVztRQUFFLE9BQUEsRUFBUyxPQUFYO1FBQW9CLENBQUEsRUFBRyxHQUF2QjtRQUE0QixDQUFBLEVBQUcsR0FBL0I7UUFBb0MsQ0FBQSxFQUFHLEdBQXZDO1FBQTRDLENBQUEsRUFBRyxHQUEvQztPQWJYO01BY0EsS0FBQSxFQUFXO1FBQUUsT0FBQSxFQUFTLE9BQVg7UUFBb0IsQ0FBQSxFQUFHLEdBQXZCO1FBQTRCLENBQUEsRUFBRyxHQUEvQjtRQUFvQyxDQUFBLEVBQUcsR0FBdkM7UUFBNEMsQ0FBQSxFQUFHLEdBQS9DO09BZFg7TUFlQSxLQUFBLEVBQVc7UUFBRSxPQUFBLEVBQVMsT0FBWDtRQUFvQixDQUFBLEVBQUcsR0FBdkI7UUFBNEIsQ0FBQSxFQUFHLEdBQS9CO1FBQW9DLENBQUEsRUFBRyxHQUF2QztRQUE0QyxDQUFBLEVBQUcsR0FBL0M7T0FmWDtNQWtCQSxRQUFBLEVBQVc7UUFBRSxPQUFBLEVBQVMsVUFBWDtRQUF3QixDQUFBLEVBQUcsQ0FBM0I7UUFBOEIsQ0FBQSxFQUFHLENBQWpDO1FBQW9DLENBQUEsRUFBRyxJQUF2QztRQUE2QyxDQUFBLEVBQUcsR0FBaEQ7T0FsQlg7TUFtQkEsU0FBQSxFQUFXO1FBQUUsT0FBQSxFQUFTLFdBQVg7UUFBd0IsQ0FBQSxFQUFHLENBQTNCO1FBQThCLENBQUEsRUFBRyxDQUFqQztRQUFvQyxDQUFBLEVBQUcsSUFBdkM7UUFBNkMsQ0FBQSxFQUFHLEdBQWhEO09BbkJYO01Bc0JBLE1BQUEsRUFBVztRQUFFLE9BQUEsRUFBUyxRQUFYO1FBQXNCLENBQUEsRUFBRyxDQUF6QjtRQUE0QixDQUFBLEVBQUksQ0FBaEM7UUFBbUMsQ0FBQSxFQUFHLElBQXRDO1FBQTRDLENBQUEsRUFBRyxJQUEvQztPQXRCWDtNQXdCQSxFQUFBLEVBQVc7UUFBRSxPQUFBLEVBQVMsT0FBWDtRQUFvQixDQUFBLEVBQUcsR0FBdkI7UUFBNEIsQ0FBQSxFQUFHLElBQS9CO1FBQXFDLENBQUEsRUFBRyxHQUF4QztRQUE2QyxDQUFBLEVBQUksRUFBakQ7T0F4Qlg7TUF5QkEsT0FBQSxFQUFXO1FBQUUsT0FBQSxFQUFTLE9BQVg7UUFBb0IsQ0FBQSxFQUFJLEVBQXhCO1FBQTRCLENBQUEsRUFBRyxJQUEvQjtRQUFxQyxDQUFBLEVBQUcsR0FBeEM7UUFBNkMsQ0FBQSxFQUFHLEdBQWhEO09BekJYO01BMEJBLFFBQUEsRUFBVztRQUFFLE9BQUEsRUFBUyxPQUFYO1FBQW9CLENBQUEsRUFBRyxHQUF2QjtRQUE0QixDQUFBLEVBQUcsSUFBL0I7UUFBcUMsQ0FBQSxFQUFHLEdBQXhDO1FBQTZDLENBQUEsRUFBRyxHQUFoRDtPQTFCWDtNQTZCQSxLQUFBLEVBQVc7UUFBRSxPQUFBLEVBQVMsT0FBWDtRQUFvQixDQUFBLEVBQUksRUFBeEI7UUFBNEIsQ0FBQSxFQUFLLENBQWpDO1FBQW9DLENBQUEsRUFBRyxHQUF2QztRQUE0QyxDQUFBLEVBQUcsR0FBL0M7T0E3Qlg7TUE4QkEsS0FBQSxFQUFXO1FBQUUsT0FBQSxFQUFTLE9BQVg7UUFBb0IsQ0FBQSxFQUFHLEdBQXZCO1FBQTRCLENBQUEsRUFBSyxDQUFqQztRQUFvQyxDQUFBLEVBQUcsR0FBdkM7UUFBNEMsQ0FBQSxFQUFHLEdBQS9DO09BOUJYO01BK0JBLEtBQUEsRUFBVztRQUFFLE9BQUEsRUFBUyxPQUFYO1FBQW9CLENBQUEsRUFBRyxHQUF2QjtRQUE0QixDQUFBLEVBQUssQ0FBakM7UUFBb0MsQ0FBQSxFQUFHLEdBQXZDO1FBQTRDLENBQUEsRUFBRyxHQUEvQztPQS9CWDtNQWdDQSxLQUFBLEVBQVc7UUFBRSxPQUFBLEVBQVMsT0FBWDtRQUFvQixDQUFBLEVBQUcsR0FBdkI7UUFBNEIsQ0FBQSxFQUFLLENBQWpDO1FBQW9DLENBQUEsRUFBRyxHQUF2QztRQUE0QyxDQUFBLEVBQUcsR0FBL0M7T0FoQ1g7TUFpQ0EsS0FBQSxFQUFXO1FBQUUsT0FBQSxFQUFTLE9BQVg7UUFBb0IsQ0FBQSxFQUFHLEdBQXZCO1FBQTRCLENBQUEsRUFBSyxDQUFqQztRQUFvQyxDQUFBLEVBQUcsR0FBdkM7UUFBNEMsQ0FBQSxFQUFHLEdBQS9DO09BakNYO01Ba0NBLElBQUEsRUFBVztRQUFFLE9BQUEsRUFBUyxPQUFYO1FBQW9CLENBQUEsRUFBRyxHQUF2QjtRQUE0QixDQUFBLEVBQUssQ0FBakM7UUFBb0MsQ0FBQSxFQUFHLEdBQXZDO1FBQTRDLENBQUEsRUFBRyxHQUEvQztPQWxDWDtNQW1DQSxNQUFBLEVBQVc7UUFBRSxPQUFBLEVBQVMsT0FBWDtRQUFvQixDQUFBLEVBQUksRUFBeEI7UUFBNEIsQ0FBQSxFQUFHLEdBQS9CO1FBQW9DLENBQUEsRUFBRyxHQUF2QztRQUE0QyxDQUFBLEVBQUcsR0FBL0M7T0FuQ1g7TUFvQ0EsUUFBQSxFQUFXO1FBQUUsT0FBQSxFQUFTLE9BQVg7UUFBb0IsQ0FBQSxFQUFHLEdBQXZCO1FBQTRCLENBQUEsRUFBRyxHQUEvQjtRQUFvQyxDQUFBLEVBQUcsR0FBdkM7UUFBNEMsQ0FBQSxFQUFHLEdBQS9DO09BcENYO01BcUNBLEtBQUEsRUFBVztRQUFFLE9BQUEsRUFBUyxPQUFYO1FBQW9CLENBQUEsRUFBRyxHQUF2QjtRQUE0QixDQUFBLEVBQUcsR0FBL0I7UUFBb0MsQ0FBQSxFQUFHLEdBQXZDO1FBQTRDLENBQUEsRUFBRyxHQUEvQztPQXJDWDtNQXNDQSxRQUFBLEVBQVc7UUFBRSxPQUFBLEVBQVMsT0FBWDtRQUFvQixDQUFBLEVBQUcsR0FBdkI7UUFBNEIsQ0FBQSxFQUFHLEdBQS9CO1FBQW9DLENBQUEsRUFBRyxHQUF2QztRQUE0QyxDQUFBLEVBQUcsR0FBL0M7T0F0Q1g7TUF1Q0EsTUFBQSxFQUFXO1FBQUUsT0FBQSxFQUFTLE9BQVg7UUFBb0IsQ0FBQSxFQUFHLEdBQXZCO1FBQTRCLENBQUEsRUFBRyxHQUEvQjtRQUFvQyxDQUFBLEVBQUcsR0FBdkM7UUFBNEMsQ0FBQSxFQUFHLEdBQS9DO09BdkNYO01Bd0NBLFFBQUEsRUFBVztRQUFFLE9BQUEsRUFBUyxPQUFYO1FBQW9CLENBQUEsRUFBRyxHQUF2QjtRQUE0QixDQUFBLEVBQUcsR0FBL0I7UUFBb0MsQ0FBQSxFQUFHLEdBQXZDO1FBQTRDLENBQUEsRUFBRyxHQUEvQztPQXhDWDs7RUFIUzs7MkJBNkNiLFNBQUEsR0FBVyxTQUFDLFVBQUQsRUFBYSxNQUFiO0FBQ1QsUUFBQTtJQUFBLE1BQUEsR0FBUyxJQUFDLENBQUEsT0FBUSxDQUFBLFVBQUE7SUFDbEIsSUFBWSxDQUFJLE1BQWhCO0FBQUEsYUFBTyxFQUFQOztBQUNBLFdBQU8sTUFBQSxHQUFTLE1BQU0sQ0FBQyxDQUFoQixHQUFvQixNQUFNLENBQUM7RUFIekI7OzJCQUtYLE1BQUEsR0FBUSxTQUFDLFVBQUQsRUFBYSxFQUFiLEVBQWlCLEVBQWpCLEVBQXFCLEVBQXJCLEVBQXlCLEVBQXpCLEVBQTZCLEdBQTdCLEVBQWtDLE9BQWxDLEVBQTJDLE9BQTNDLEVBQW9ELEtBQXBELEVBQTJELEVBQTNEO0FBQ04sUUFBQTtJQUFBLE1BQUEsR0FBUyxJQUFDLENBQUEsT0FBUSxDQUFBLFVBQUE7SUFDbEIsSUFBVSxDQUFJLE1BQWQ7QUFBQSxhQUFBOztJQUNBLElBQUcsQ0FBQyxFQUFBLEtBQU0sQ0FBUCxDQUFBLElBQWMsQ0FBQyxFQUFBLEtBQU0sQ0FBUCxDQUFqQjtNQUVFLEVBQUEsR0FBSyxNQUFNLENBQUM7TUFDWixFQUFBLEdBQUssTUFBTSxDQUFDLEVBSGQ7S0FBQSxNQUlLLElBQUcsRUFBQSxLQUFNLENBQVQ7TUFDSCxFQUFBLEdBQUssRUFBQSxHQUFLLE1BQU0sQ0FBQyxDQUFaLEdBQWdCLE1BQU0sQ0FBQyxFQUR6QjtLQUFBLE1BRUEsSUFBRyxFQUFBLEtBQU0sQ0FBVDtNQUNILEVBQUEsR0FBSyxFQUFBLEdBQUssTUFBTSxDQUFDLENBQVosR0FBZ0IsTUFBTSxDQUFDLEVBRHpCOztJQUVMLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBTixDQUFnQixNQUFNLENBQUMsT0FBdkIsRUFBZ0MsTUFBTSxDQUFDLENBQXZDLEVBQTBDLE1BQU0sQ0FBQyxDQUFqRCxFQUFvRCxNQUFNLENBQUMsQ0FBM0QsRUFBOEQsTUFBTSxDQUFDLENBQXJFLEVBQXdFLEVBQXhFLEVBQTRFLEVBQTVFLEVBQWdGLEVBQWhGLEVBQW9GLEVBQXBGLEVBQXdGLEdBQXhGLEVBQTZGLE9BQTdGLEVBQXNHLE9BQXRHLEVBQStHLEtBQUssQ0FBQyxDQUFySCxFQUF3SCxLQUFLLENBQUMsQ0FBOUgsRUFBaUksS0FBSyxDQUFDLENBQXZJLEVBQTBJLEtBQUssQ0FBQyxDQUFoSixFQUFtSixFQUFuSjtFQVhNOzs7Ozs7QUFjVixNQUFNLENBQUMsT0FBUCxHQUFpQjs7OztBQ2pFakIsSUFBQTs7QUFBQSxXQUFBLEdBQWM7O0FBQ2QsYUFBQSxHQUFnQjs7QUFDaEIsRUFBQSxHQUFLOztBQUVMLElBQUEsR0FDRTtFQUFBLElBQUEsRUFBTSxDQUFDLENBQVA7RUFDQSxNQUFBLEVBQVEsQ0FEUjtFQUVBLEtBQUEsRUFBTyxDQUZQO0VBR0EsUUFBQSxFQUFVLENBSFY7RUFJQSxNQUFBLEVBQVEsQ0FKUjs7O0FBTUYsUUFBQSxHQUFXLENBQUMsUUFBRCxFQUFXLE9BQVgsRUFBb0IsVUFBcEIsRUFBZ0MsUUFBaEM7O0FBQ1gsYUFBQSxHQUFnQixDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxFQUFnQixHQUFoQjs7QUFDaEIsYUFBQSxHQUFnQixDQUFDLE1BQUQsRUFBUyxNQUFULEVBQWlCLE1BQWpCLEVBQXlCLE1BQXpCOztBQUVoQixjQUFBLEdBQWlCOztBQUtqQixlQUFBLEdBQWtCO0VBQ2hCO0lBQUUsRUFBQSxFQUFJLE9BQU47SUFBa0IsSUFBQSxFQUFNLE9BQXhCO0lBQXNDLE1BQUEsRUFBUSxPQUE5QztJQUEwRCxLQUFBLEVBQU8sUUFBakU7R0FEZ0IsRUFFaEI7SUFBRSxFQUFBLEVBQUksT0FBTjtJQUFrQixJQUFBLEVBQU0sT0FBeEI7SUFBc0MsTUFBQSxFQUFRLE9BQTlDO0lBQTBELEtBQUEsRUFBTyxRQUFqRTtHQUZnQixFQUdoQjtJQUFFLEVBQUEsRUFBSSxPQUFOO0lBQWtCLElBQUEsRUFBTSxPQUF4QjtJQUFzQyxNQUFBLEVBQVEsT0FBOUM7SUFBMEQsS0FBQSxFQUFPLFFBQWpFO0dBSGdCLEVBSWhCO0lBQUUsRUFBQSxFQUFJLE9BQU47SUFBa0IsSUFBQSxFQUFNLE9BQXhCO0lBQXNDLE1BQUEsRUFBUSxPQUE5QztJQUEwRCxLQUFBLEVBQU8sUUFBakU7R0FKZ0IsRUFLaEI7SUFBRSxFQUFBLEVBQUksT0FBTjtJQUFrQixJQUFBLEVBQU0sT0FBeEI7SUFBc0MsTUFBQSxFQUFRLE9BQTlDO0lBQTBELEtBQUEsRUFBTyxRQUFqRTtHQUxnQixFQU1oQjtJQUFFLEVBQUEsRUFBSSxNQUFOO0lBQWtCLElBQUEsRUFBTSxNQUF4QjtJQUFzQyxNQUFBLEVBQVEsTUFBOUM7SUFBMEQsS0FBQSxFQUFPLFFBQWpFO0dBTmdCLEVBT2hCO0lBQUUsRUFBQSxFQUFJLFFBQU47SUFBa0IsSUFBQSxFQUFNLFFBQXhCO0lBQXNDLE1BQUEsRUFBUSxRQUE5QztJQUEwRCxLQUFBLEVBQU8sUUFBakU7R0FQZ0IsRUFRaEI7SUFBRSxFQUFBLEVBQUksVUFBTjtJQUFrQixJQUFBLEVBQU0sV0FBeEI7SUFBc0MsTUFBQSxFQUFRLFVBQTlDO0lBQTBELEtBQUEsRUFBTyxRQUFqRTtHQVJnQixFQVNoQjtJQUFFLEVBQUEsRUFBSSxPQUFOO0lBQWtCLElBQUEsRUFBTSxPQUF4QjtJQUFzQyxNQUFBLEVBQVEsT0FBOUM7SUFBMEQsS0FBQSxFQUFPLFFBQWpFO0dBVGdCLEVBVWhCO0lBQUUsRUFBQSxFQUFJLFVBQU47SUFBa0IsSUFBQSxFQUFNLFVBQXhCO0lBQXNDLE1BQUEsRUFBUSxVQUE5QztJQUEwRCxLQUFBLEVBQU8sUUFBakU7R0FWZ0IsRUFXaEI7SUFBRSxFQUFBLEVBQUksUUFBTjtJQUFrQixJQUFBLEVBQU0sUUFBeEI7SUFBc0MsTUFBQSxFQUFRLFFBQTlDO0lBQTBELEtBQUEsRUFBTyxRQUFqRTtHQVhnQixFQVloQjtJQUFFLEVBQUEsRUFBSSxVQUFOO0lBQWtCLElBQUEsRUFBTSxVQUF4QjtJQUFzQyxNQUFBLEVBQVEsVUFBOUM7SUFBMEQsS0FBQSxFQUFPLFFBQWpFO0dBWmdCOzs7QUFlbEIsWUFBQSxHQUFlOztBQUNmLEtBQUEsbURBQUE7O0VBQ0UsWUFBYSxDQUFBLFNBQVMsQ0FBQyxFQUFWLENBQWIsR0FBNkI7QUFEL0I7O0FBR0EsZUFBQSxHQUFrQixTQUFBO0FBQ2hCLE1BQUE7RUFBQSxDQUFBLEdBQUksSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFJLENBQUMsTUFBTCxDQUFBLENBQUEsR0FBZ0IsZUFBZSxDQUFDLE1BQTNDO0FBQ0osU0FBTyxlQUFnQixDQUFBLENBQUE7QUFGUDs7QUFPWjtFQUNTLGNBQUMsSUFBRDtJQUFDLElBQUMsQ0FBQSxNQUFEO0lBQ1osSUFBQyxDQUFBLElBQUQsR0FBUyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUMsQ0FBQSxHQUFELEdBQU8sQ0FBbEI7SUFDVCxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBQyxDQUFBLEdBQUQsR0FBTyxDQUFsQjtJQUNULElBQUMsQ0FBQSxTQUFEO0FBQWEsY0FBTyxJQUFDLENBQUEsS0FBUjtBQUFBLGFBQ0wsQ0FESztpQkFDRTtBQURGLGFBRUwsQ0FGSztpQkFFRTtBQUZGLGFBR04sRUFITTtpQkFHRTtBQUhGLGFBSU4sRUFKTTtpQkFJRTtBQUpGLGFBS04sRUFMTTtpQkFLRTtBQUxGO2lCQU9ULE1BQUEsQ0FBTyxJQUFDLENBQUEsS0FBRCxHQUFTLENBQWhCO0FBUFM7O0lBUWIsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFDLENBQUEsU0FBRCxHQUFhLGFBQWMsQ0FBQSxJQUFDLENBQUEsSUFBRDtFQVh4Qjs7aUJBYWIsV0FBQSxHQUFhLFNBQUE7QUFDWCxXQUFPLElBQUMsQ0FBQSxTQUFELEdBQWEsYUFBYyxDQUFBLElBQUMsQ0FBQSxJQUFEO0VBRHZCOzs7Ozs7QUFHZixhQUFBLEdBQWdCLFNBQUMsUUFBRDtBQUNkLE1BQUE7RUFBQSxTQUFBLEdBQVk7QUFDWixPQUFBLDRDQUFBOztJQUNFLElBQUEsR0FBTyxJQUFJLElBQUosQ0FBUyxHQUFUO0lBQ1AsU0FBUyxDQUFDLElBQVYsQ0FBZSxJQUFJLENBQUMsSUFBcEI7QUFGRjtBQUdBLFNBQU8sSUFBQSxHQUFPLFNBQVMsQ0FBQyxJQUFWLENBQWUsR0FBZixDQUFQLEdBQTZCO0FBTHRCOztBQU9oQixnQkFBQSxHQUFtQixTQUFDLElBQUQ7QUFDakIsTUFBQTtFQUFBLElBQUcsT0FBQSxHQUFVLElBQUksQ0FBQyxLQUFMLENBQVcsV0FBWCxDQUFiO0FBQ0UsV0FBTyxTQUFBLEdBQVUsT0FBUSxDQUFBLENBQUEsQ0FBbEIsR0FBcUIsU0FEOUI7O0VBRUEsSUFBRyxPQUFBLEdBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxXQUFYLENBQWI7QUFDRSxXQUFPLFNBQUEsR0FBVSxPQUFRLENBQUEsQ0FBQSxFQUQzQjs7RUFFQSxJQUFHLE9BQUEsR0FBVSxJQUFJLENBQUMsS0FBTCxDQUFXLFlBQVgsQ0FBYjtJQUNFLElBQUcsT0FBUSxDQUFBLENBQUEsQ0FBUixLQUFjLEdBQWpCO0FBQ0UsYUFBTyxTQURUOztJQUVBLElBQUcsT0FBUSxDQUFBLENBQUEsQ0FBUixLQUFjLEdBQWpCO0FBQ0UsYUFBTyxPQURUOztJQUVBLElBQUcsT0FBUSxDQUFBLENBQUEsQ0FBUixLQUFjLEdBQWpCO0FBQ0UsYUFBTyxRQURUOztBQUVBLFdBQU8sUUFQVDs7QUFRQSxTQUFPO0FBYlU7O0FBZW5CLFlBQUEsR0FBZSxTQUFDLElBQUQ7QUFDYixNQUFBO0VBQUEsUUFBQSxHQUFXLElBQUksSUFBSixDQUFTLElBQUksQ0FBQyxJQUFkO0FBQ1gsU0FBUyxDQUFDLGdCQUFBLENBQWlCLElBQUksQ0FBQyxJQUF0QixDQUFELENBQUEsR0FBNkIsS0FBN0IsR0FBaUMsQ0FBQyxRQUFRLENBQUMsV0FBVCxDQUFBLENBQUQ7QUFGN0I7O0FBSWYsZUFBQSxHQUFrQixTQUFDLElBQUQ7QUFDaEIsTUFBQTtFQUFBLElBQUcsT0FBQSxHQUFVLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBVixDQUFnQixXQUFoQixDQUFiO0FBQ0UsV0FBTyxRQUFBLENBQVMsT0FBUSxDQUFBLENBQUEsQ0FBakIsQ0FBQSxHQUF1QixFQURoQzs7RUFFQSxJQUFHLE9BQUEsR0FBVSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQVYsQ0FBZ0IsV0FBaEIsQ0FBYjtBQUNFLFdBQU8sUUFBQSxDQUFTLE9BQVEsQ0FBQSxDQUFBLENBQWpCLEVBRFQ7O0VBRUEsSUFBRyxPQUFBLEdBQVUsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFWLENBQWdCLFlBQWhCLENBQWI7QUFDRSxXQUFPLFFBQUEsQ0FBUyxPQUFRLENBQUEsQ0FBQSxDQUFqQixFQURUOztBQUVBLFNBQU87QUFQUzs7QUFZWjtFQUNTLHNCQUFBO0FBRVgsUUFBQTtJQUFBLElBQUMsQ0FBQSxLQUFELEdBQVMsQ0FBRSxDQUFGO0FBQ1QsU0FBUywwQkFBVDtNQUNFLENBQUEsR0FBSSxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBQSxHQUFnQixDQUEzQjtNQUNKLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFZLElBQUMsQ0FBQSxLQUFNLENBQUEsQ0FBQSxDQUFuQjtNQUNBLElBQUMsQ0FBQSxLQUFNLENBQUEsQ0FBQSxDQUFQLEdBQVk7QUFIZDtFQUhXOzs7Ozs7QUFXZixnQkFBQSxHQUFtQjtFQUNqQjtJQUNFLEVBQUEsRUFBSSxTQUROO0lBRUUsS0FBQSxFQUFPLHVCQUZUO0lBR0UsV0FBQSxFQUFhLENBQUMsZ0JBQUQsQ0FIZjtJQUlFLFFBQUEsRUFBVSxTQUFDLEdBQUQ7TUFDUixJQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsVUFBVixJQUF3QixFQUEzQjtBQUNFLGVBQU8sd0JBQUEsR0FBeUIsR0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFuQyxHQUE4QyxXQUR2RDs7QUFFQSxhQUFPLFlBQUEsR0FBYSxHQUFHLENBQUMsS0FBSyxDQUFDLFVBQXZCLEdBQWtDO0lBSGpDLENBSlo7R0FEaUIsRUFVakI7SUFDRSxFQUFBLEVBQUksU0FETjtJQUVFLEtBQUEsRUFBTyxTQUZUO0lBR0UsV0FBQSxFQUFhLENBQUMsMkJBQUQsQ0FIZjtJQUlFLFFBQUEsRUFBVSxTQUFDLEdBQUQ7QUFDUixVQUFBO01BQUEsVUFBQSxHQUFhLEdBQUcsQ0FBQyxLQUFLLENBQUM7O1FBQ3ZCLGFBQWM7O01BQ2QsSUFBRyxVQUFBLElBQWMsQ0FBakI7QUFDRSxlQUFPLHVCQUFBLEdBQXdCLFVBQXhCLEdBQW1DLFVBRDVDOztNQUVBLENBQUEsR0FBSTtNQUNKLElBQUcsVUFBQSxHQUFhLENBQWhCO1FBQ0UsQ0FBQSxHQUFJLElBRE47O0FBRUEsYUFBTyxlQUFBLEdBQWdCLFVBQWhCLEdBQTJCLE1BQTNCLEdBQWlDO0lBUmhDLENBSlo7R0FWaUIsRUF3QmpCO0lBQ0UsRUFBQSxFQUFJLFNBRE47SUFFRSxLQUFBLEVBQU8sY0FGVDtJQUdFLFdBQUEsRUFBYSxDQUFDLFlBQUQsQ0FIZjtHQXhCaUIsRUE2QmpCO0lBQ0UsRUFBQSxFQUFJLFdBRE47SUFFRSxLQUFBLEVBQU8sbUJBRlQ7SUFHRSxXQUFBLEVBQWEsQ0FBQyx1Q0FBRCxDQUhmO0dBN0JpQixFQWtDakI7SUFDRSxFQUFBLEVBQUksUUFETjtJQUVFLEtBQUEsRUFBTyxxQkFGVDtJQUdFLFdBQUEsRUFBYSxDQUFDLHFCQUFELENBSGY7R0FsQ2lCLEVBdUNqQjtJQUNFLEVBQUEsRUFBSSxNQUROO0lBRUUsS0FBQSxFQUFPLFVBRlQ7SUFHRSxXQUFBLEVBQWEsQ0FBQyxnREFBRCxDQUhmO0dBdkNpQixFQTRDakI7SUFDRSxFQUFBLEVBQUksU0FETjtJQUVFLEtBQUEsRUFBTyxpQkFGVDtJQUdFLFdBQUEsRUFBYSxDQUFDLDZDQUFELEVBQWdELG1DQUFoRCxDQUhmO0dBNUNpQixFQWlEakI7SUFDRSxFQUFBLEVBQUksU0FETjtJQUVFLEtBQUEsRUFBTyxTQUZUO0lBR0UsV0FBQSxFQUFhLENBQUMsb0RBQUQsRUFBdUQsa0JBQXZELENBSGY7R0FqRGlCLEVBc0RqQjtJQUNFLEVBQUEsRUFBSSxhQUROO0lBRUUsS0FBQSxFQUFPLGFBRlQ7SUFHRSxXQUFBLEVBQWEsQ0FBQywwQ0FBRCxDQUhmO0dBdERpQixFQTJEakI7SUFDRSxFQUFBLEVBQUksTUFETjtJQUVFLEtBQUEsRUFBTyxVQUZUO0lBR0UsV0FBQSxFQUFhLENBQUMsc0RBQUQsQ0FIZjtHQTNEaUIsRUFnRWpCO0lBQ0UsRUFBQSxFQUFJLE1BRE47SUFFRSxLQUFBLEVBQU8sa0JBRlQ7SUFHRSxXQUFBLEVBQWEsQ0FBQywrQ0FBRCxDQUhmO0dBaEVpQixFQXFFakI7SUFDRSxFQUFBLEVBQUksT0FETjtJQUVFLEtBQUEsRUFBTyxZQUZUO0lBR0UsV0FBQSxFQUFhLENBQUMsa0NBQUQsQ0FIZjtHQXJFaUIsRUEwRWpCO0lBQ0UsRUFBQSxFQUFJLFVBRE47SUFFRSxLQUFBLEVBQU8scUJBRlQ7SUFHRSxXQUFBLEVBQWEsQ0FBQyxxQkFBRCxDQUhmO0dBMUVpQixFQStFakI7SUFDRSxFQUFBLEVBQUksVUFETjtJQUVFLEtBQUEsRUFBTyxVQUZUO0lBR0UsV0FBQSxFQUFhLENBQUMsdUJBQUQsQ0FIZjtHQS9FaUI7OztBQXNGbkIsZUFBQSxHQUFrQjs7QUFDbEIsS0FBQSxvREFBQTs7RUFDRSxlQUFnQixDQUFBLENBQUMsQ0FBQyxFQUFGLENBQWhCLEdBQXdCO0FBRDFCOztBQU1NO0VBQ1Msa0JBQUMsSUFBRCxFQUFRLE1BQVI7QUFDWCxRQUFBO0lBRFksSUFBQyxDQUFBLE9BQUQ7SUFDWixJQUFVLENBQUksTUFBZDtBQUFBLGFBQUE7O0lBRUEsSUFBRyxNQUFNLENBQUMsS0FBVjtBQUNFO0FBQUEsV0FBQSxRQUFBOztRQUNFLElBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFiLENBQTRCLENBQTVCLENBQUg7VUFDRSxJQUFLLENBQUEsQ0FBQSxDQUFMLEdBQVUsTUFBTSxDQUFDLEtBQU0sQ0FBQSxDQUFBLEVBRHpCOztBQURGO01BR0EsSUFBQyxDQUFBLGdCQUFELENBQUEsRUFKRjtLQUFBLE1BQUE7TUFNRSxJQUFDLENBQUEsT0FBRCxDQUFTLE1BQU0sQ0FBQyxLQUFoQixFQU5GOztFQUhXOztxQkFXYixnQkFBQSxHQUFrQixTQUFBO0FBQ2hCLFFBQUE7O01BQUEsSUFBQyxDQUFBLE1BQU87OztVQUNKLENBQUMsU0FBVTs7O1dBQ1gsQ0FBQyxRQUFTOzs7V0FDSixDQUFDLGFBQWM7O1dBQ3pCLElBQUMsQ0FBQSxRQUFELEdBQVk7RUFMSTs7cUJBT2xCLElBQUEsR0FBTSxTQUFDLE1BQUQ7QUFDSixRQUFBO0lBQUEsSUFBQSxHQUFPLElBQUksWUFBSixDQUFBO0FBQ1A7QUFBQSxTQUFBLG1FQUFBOztNQUNFLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFVLDZCQUFBLEdBQThCLFdBQXhDO01BRUEsTUFBTSxDQUFDLEtBQVAsR0FBZTtNQUNmLE1BQU0sQ0FBQyxJQUFQLEdBQWM7QUFDZCxXQUFTLDBCQUFUO1FBQ0UsR0FBQSxHQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBWCxDQUFBO1FBQ04sSUFBRyxHQUFBLEtBQU8sQ0FBVjtVQUNFLElBQUMsQ0FBQSxJQUFELEdBQVEsWUFEVjs7UUFFQSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQVosQ0FBaUIsR0FBakI7QUFKRjtNQU9BLElBQUcsQ0FBQyxJQUFDLENBQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFkLEtBQTJCLENBQTVCLENBQUEsSUFBa0MsTUFBTSxDQUFDLEVBQTVDO1FBRUUsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFaLENBQWlCLFNBQUMsQ0FBRCxFQUFHLENBQUg7QUFBUyxpQkFBTyxDQUFBLEdBQUk7UUFBcEIsQ0FBakIsRUFGRjtPQUFBLE1BQUE7UUFLRSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQVosQ0FBaUIsU0FBQyxDQUFELEVBQUcsQ0FBSDtBQUFTLGlCQUFPLENBQUEsR0FBSTtRQUFwQixDQUFqQixFQUxGOztBQVpGO0lBbUJBLElBQUMsQ0FBQSxnQkFBRCxDQUFBO0lBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBWCxHQUF5QjtJQUN6QixJQUFDLENBQUEsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFYLEdBQXVCO0lBQ3ZCLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBSyxDQUFDLFVBQVgsR0FBd0I7SUFDeEIsSUFBQyxDQUFBLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBWCxHQUFzQjtJQUN0QixJQUFDLENBQUEsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFYLEdBQXVCO0lBQ3ZCLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVgsR0FBc0I7SUFDdEIsSUFBQyxDQUFBLEdBQUcsQ0FBQyxLQUFLLENBQUMsZUFBWCxHQUE2QjtJQUM3QixJQUFDLENBQUEsR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFYLEdBQXlCOztVQUNmLENBQUMsYUFBYzs7SUFFekIsSUFBQyxDQUFBLElBQUQsR0FBUTtJQUNSLElBQUMsQ0FBQSxPQUFELEdBQVcsQ0FBQztJQUNaLElBQUMsQ0FBQSxPQUFELEdBQVc7SUFDWCxJQUFDLENBQUEsV0FBRCxHQUFlO0lBQ2YsSUFBQyxDQUFBLFNBQUQsQ0FBQTtJQUVBLFFBQUEsR0FBVztJQUNYLElBQUcsSUFBQyxDQUFBLEtBQUo7TUFDRSxRQUFBLEdBQVcsZUFEYjs7SUFFQSxJQUFDLENBQUEsTUFBRCxDQUFRLENBQUEsWUFBQSxHQUFhLFFBQWIsR0FBc0IsSUFBdEIsQ0FBQSxHQUE0QixJQUFDLENBQUEsT0FBUSxDQUFBLElBQUMsQ0FBQSxJQUFELENBQU0sQ0FBQyxJQUE1QyxHQUFtRCxjQUEzRDtBQUVBLFdBQU87RUEzQ0g7O3FCQWdETixPQUFBLEdBQVMsU0FBQyxLQUFEO0FBRVAsUUFBQTs7TUFGUSxRQUFROztJQUVoQixJQUFDLENBQUEsR0FBRCxHQUFPO0lBQ1AsSUFBQyxDQUFBLE1BQUQsR0FBVTtJQUNWLElBQUMsQ0FBQSxVQUFELEdBQWM7SUFDZCxJQUFDLENBQUEsS0FBRCxHQUFTO0lBQ1QsSUFBRyxLQUFIO01BQ0UsSUFBQyxDQUFBLEtBQUQsR0FBUyxLQURYOztJQUVBLE9BQU8sQ0FBQyxHQUFSLENBQVksYUFBQSxHQUFjLElBQUMsQ0FBQSxLQUEzQjtJQUVBLElBQUMsQ0FBQSxPQUFELEdBQVc7TUFDVDtRQUFFLEVBQUEsRUFBSSxDQUFOO1FBQVMsSUFBQSxFQUFNLFFBQWY7UUFBeUIsS0FBQSxFQUFPLENBQWhDO1FBQW1DLElBQUEsRUFBTSxLQUF6QztRQUFnRCxLQUFBLEVBQU8sY0FBdkQ7T0FEUzs7QUFJWCxTQUFTLHlCQUFUO01BQ0UsSUFBQyxDQUFBLEtBQUQsQ0FBQTtBQURGO1dBR0EsSUFBQyxDQUFBLElBQUQsQ0FBQTtFQWpCTzs7cUJBbUJULElBQUEsR0FBTSxTQUFBO0FBQ0osUUFBQTtJQUFBLEtBQUEsR0FBUSwrRUFBK0UsQ0FBQyxLQUFoRixDQUFzRixHQUF0RjtJQUNSLEtBQUEsR0FBUTtBQUNSLFNBQUEseUNBQUE7O01BQ0UsS0FBTSxDQUFBLElBQUEsQ0FBTixHQUFjLElBQUssQ0FBQSxJQUFBO0FBRHJCO0FBRUEsV0FBTztFQUxIOztxQkFPTixNQUFBLEdBQVEsU0FBQyxJQUFEO0FBQ04sUUFBQTtJQUFBLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLElBQVY7QUFDQTtXQUFNLElBQUMsQ0FBQSxHQUFHLENBQUMsTUFBTCxHQUFjLGFBQXBCO21CQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBTCxDQUFBO0lBREYsQ0FBQTs7RUFGTTs7cUJBS1IsUUFBQSxHQUFVLFNBQUE7QUFDUixRQUFBO0lBQUEsSUFBRyxJQUFDLENBQUEsUUFBRCxDQUFBLENBQUg7QUFDRSxhQUFPLFlBRFQ7O0lBR0EsSUFBRyxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sS0FBZ0IsQ0FBbkI7TUFDRSxVQUFBLEdBQWEsZ0NBRGY7S0FBQSxNQUFBO01BR0UsSUFBRyxJQUFDLENBQUEsV0FBSjtRQUNFLFVBQUEsR0FBYSxPQUFBLEdBQVUsWUFBQSxDQUFhLElBQUMsQ0FBQSxXQUFkLEVBRHpCO09BQUEsTUFBQTtRQUdFLFVBQUEsR0FBYSxpQkFIZjtPQUhGOztJQVFBLGFBQUEsR0FBZ0IsSUFBQyxDQUFBLGFBQUQsQ0FBQTtJQUNoQixJQUFHLGFBQWEsQ0FBQyxFQUFqQjtNQUNFLFdBQUEsR0FBYyxTQURoQjtLQUFBLE1BQUE7TUFHRSxXQUFBLEdBQWMsU0FIaEI7O0lBSUEsUUFBQSxHQUFXLEdBQUEsR0FBSSxXQUFKLEdBQWdCLEdBQWhCLEdBQW1CLGFBQWEsQ0FBQyxJQUFqQyxHQUFzQyxjQUF0QyxHQUFvRDtJQUMvRCxJQUFHLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBSDtNQUNFLFFBQUEsSUFBWSx1QkFEZDs7QUFFQSxXQUFPO0VBcEJDOztxQkFzQlYsZ0JBQUEsR0FBa0IsU0FBQTtJQUNoQixJQUFHLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixLQUFnQixDQUFuQjtBQUNFLGFBQU8sS0FEVDs7SUFFQSxJQUFHLENBQUksSUFBQyxDQUFBLFdBQVI7QUFDRSxhQUFPLEtBRFQ7O0lBRUEsSUFBRyxJQUFDLENBQUEsY0FBRCxDQUFBLENBQUg7QUFDRSxhQUFPLEtBRFQ7O0FBRUEsV0FBTztFQVBTOztxQkFTbEIsVUFBQSxHQUFZLFNBQUMsRUFBRDtBQUNWLFFBQUE7QUFBQTtBQUFBLFNBQUEsdUNBQUE7O01BQ0UsSUFBRyxNQUFNLENBQUMsRUFBUCxLQUFhLEVBQWhCO0FBQ0UsZUFBTyxPQURUOztBQURGO0FBR0EsV0FBTztFQUpHOztxQkFNWixhQUFBLEdBQWUsU0FBQTtBQUNiLFdBQU8sSUFBQyxDQUFBLE9BQVEsQ0FBQSxJQUFDLENBQUEsSUFBRDtFQURIOztxQkFHZixTQUFBLEdBQVcsU0FBQyxLQUFEO0FBQ1QsUUFBQTtBQUFBO0FBQUEsU0FBQSx1Q0FBQTs7TUFDRSxJQUFHLENBQUMsS0FBQSxLQUFTLENBQVYsQ0FBQSxJQUFpQixDQUFDLE1BQU0sQ0FBQyxLQUFQLEtBQWdCLENBQWpCLENBQXBCO0FBQ0UsZUFBTyxPQURUOztNQUVBLElBQUcsTUFBTSxDQUFDLEtBQVAsS0FBZ0IsS0FBbkI7QUFDRSxlQUFPLE9BRFQ7O0FBSEY7QUFLQSxXQUFPO0VBTkU7O3FCQVFYLE1BQUEsR0FBUSxTQUFBO0FBQ04sUUFBQTtJQUFBLE1BQUEsR0FBUyxJQUFDLENBQUEsU0FBRCxDQUFXLENBQVg7SUFDVCxNQUFBLEdBQVMsSUFBQyxDQUFBLFNBQUQsQ0FBVyxDQUFYO0lBQ1QsTUFBQSxHQUFTLElBQUMsQ0FBQSxTQUFELENBQVcsQ0FBWDtJQUNULE1BQUEsR0FBUyxJQUFDLENBQUEsU0FBRCxDQUFXLENBQVg7SUFFVCxJQUFHLENBQUksTUFBSixJQUFjLENBQUksTUFBbEIsSUFBNEIsQ0FBSSxNQUFoQyxJQUEwQyxDQUFJLE1BQWpEO01BQ0UsSUFBQyxDQUFBLE1BQUQsQ0FBUSxxQkFBUjtBQUNBLGFBRkY7O0lBSUEsSUFBQyxDQUFBLE1BQUQsQ0FBVyxNQUFNLENBQUMsSUFBUixHQUFhLGNBQWIsR0FBMkIsTUFBTSxDQUFDLElBQTVDO0lBQ0EsSUFBQyxDQUFBLE1BQUQsQ0FBVyxNQUFNLENBQUMsSUFBUixHQUFhLGNBQWIsR0FBMkIsTUFBTSxDQUFDLElBQTVDO0lBRUEsTUFBTSxDQUFDLEtBQVAsSUFBZ0I7SUFDaEIsTUFBTSxDQUFDLEtBQVAsSUFBZ0I7SUFDaEIsTUFBTSxDQUFDLEtBQVAsSUFBZ0IsQ0FBQztJQUNqQixNQUFNLENBQUMsS0FBUCxJQUFnQixDQUFDO0VBaEJYOztxQkFvQlIsaUJBQUEsR0FBbUIsU0FBQTtBQUNqQixRQUFBO0FBQUE7QUFBQSxTQUFBLG1FQUFBOztNQUNFLElBQUcsTUFBTSxDQUFDLEtBQVAsS0FBZ0IsQ0FBbkI7QUFDRSxpQkFERjs7TUFFQSxJQUFHLENBQUksTUFBTSxDQUFDLElBQWQ7QUFDRSxlQUFPLE1BRFQ7O0FBSEY7QUFLQSxXQUFPO0VBTlU7O3FCQVNuQixjQUFBLEdBQWdCLFNBQUE7QUFDZCxRQUFBO0FBQUE7QUFBQSxTQUFBLG1FQUFBOztNQUNFLElBQUcsQ0FBQyxNQUFNLENBQUMsS0FBUCxLQUFnQixDQUFqQixDQUFBLElBQXdCLENBQUMsSUFBQyxDQUFBLE9BQUQsS0FBWSxXQUFiLENBQTNCO0FBQ0UsaUJBREY7O01BRUEsSUFBRyxXQUFBLEtBQWUsSUFBQyxDQUFBLElBQW5CO0FBQ0UsaUJBREY7O01BRUEsSUFBRyxDQUFJLE1BQU0sQ0FBQyxJQUFkO0FBQ0UsZUFBTyxNQURUOztBQUxGO0FBT0EsV0FBTztFQVJPOztxQkFVaEIsV0FBQSxHQUFhLFNBQUMsS0FBRDtBQUNYLFdBQUEsSUFBQTtNQUNFLEtBQUEsR0FBUSxDQUFDLEtBQUEsR0FBUSxDQUFULENBQUEsR0FBYyxJQUFDLENBQUEsT0FBTyxDQUFDO01BQy9CLElBQUcsSUFBQyxDQUFBLE9BQVEsQ0FBQSxLQUFBLENBQU0sQ0FBQyxLQUFoQixLQUF5QixDQUE1QjtBQUNFLGVBQU8sTUFEVDs7SUFGRjtBQUlBLFdBQU87RUFMSTs7cUJBT2IsU0FBQSxHQUFXLFNBQUMsTUFBRDtJQUNULElBQUcsQ0FBSSxNQUFNLENBQUMsRUFBZDtNQUNFLE1BQU0sQ0FBQyxFQUFQLEdBQVksTUFEZDs7SUFHQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxNQUFkO0lBQ0EsTUFBTSxDQUFDLEtBQVAsR0FBZSxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsR0FBa0I7V0FDakMsSUFBQyxDQUFBLE1BQUQsQ0FBUSxNQUFNLENBQUMsSUFBUCxHQUFjLGlCQUF0QjtFQU5TOztxQkFRWCxXQUFBLEdBQWEsU0FBQyxJQUFEO0FBQ1gsUUFBQTtBQUFBO0FBQUEsU0FBQSx1Q0FBQTs7TUFDRSxJQUFHLE1BQU0sQ0FBQyxJQUFQLEtBQWUsSUFBbEI7QUFDRSxlQUFPLEtBRFQ7O0FBREY7QUFJQSxXQUFPO0VBTEk7O3FCQU9iLEtBQUEsR0FBTyxTQUFBO0FBQ0wsUUFBQTtBQUFBLFdBQUEsSUFBQTtNQUNFLFNBQUEsR0FBWSxlQUFBLENBQUE7TUFDWixJQUFHLENBQUksSUFBQyxDQUFBLFdBQUQsQ0FBYSxTQUFTLENBQUMsSUFBdkIsQ0FBUDtBQUNFLGNBREY7O0lBRkY7SUFLQSxFQUFBLEdBQ0U7TUFBQSxNQUFBLEVBQVEsU0FBUyxDQUFDLEVBQWxCO01BQ0EsSUFBQSxFQUFNLFNBQVMsQ0FBQyxJQURoQjtNQUVBLEVBQUEsRUFBSSxJQUFBLEdBQU8sTUFBQSxDQUFPLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBaEIsQ0FGWDtNQUdBLElBQUEsRUFBTSxLQUhOO01BSUEsRUFBQSxFQUFJLElBSko7TUFLQSxLQUFBLEVBQU8sY0FMUDs7SUFPRixJQUFDLENBQUEsU0FBRCxDQUFXLEVBQVg7SUFFQSxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBVSxpQkFBVjtBQUNBLFdBQU87RUFqQkY7O3FCQW1CUCxnQkFBQSxHQUFrQixTQUFDLEtBQUQ7V0FFaEIsSUFBQyxDQUFBLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUFaLEdBQW1CLEtBQUssQ0FBQyxLQUFOLENBQVksQ0FBWjtFQUZIOztxQkFJbEIsTUFBQSxHQUFRLFNBQUE7QUFDTixRQUFBO0FBQUE7QUFBQSxTQUFBLCtDQUFBOztNQUNFLElBQUcsTUFBTSxDQUFDLEtBQVAsS0FBZ0IsQ0FBbkI7QUFDRSxlQUFPLE9BRFQ7O0FBREY7QUFHQSxXQUFPO0VBSkQ7O3FCQU1SLFFBQUEsR0FBVSxTQUFBO0FBQ1IsUUFBQTtJQUFBLEVBQUEsR0FBSyxJQUFDLENBQUEsU0FBRCxDQUFBO0lBQ0wsSUFBRyxJQUFDLENBQUEsS0FBSjtBQUNFLGFBQVEsRUFBQSxHQUFLLEVBRGY7O0FBRUEsV0FBUSxFQUFBLEdBQUs7RUFKTDs7cUJBTVYsT0FBQSxHQUFTLFNBQUMsSUFBRCxFQUFPLE9BQVA7QUFDUCxRQUFBO0FBQUEsU0FBQSx3Q0FBQTs7TUFDRSxJQUFHLEdBQUEsS0FBTyxPQUFWO0FBQ0UsZUFBTyxLQURUOztBQURGO0FBR0EsV0FBTztFQUpBOztxQkFNVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUDtBQUNSLFFBQUE7QUFBQSxTQUFBLDRDQUFBOztNQUNFLElBQUcsQ0FBSSxJQUFDLENBQUEsT0FBRCxDQUFTLElBQVQsRUFBZSxHQUFmLENBQVA7QUFDRSxlQUFPLE1BRFQ7O0FBREY7QUFHQSxXQUFPO0VBSkM7O3FCQU1WLFdBQUEsR0FBYSxTQUFDLElBQUQsRUFBTyxRQUFQO0FBQ1gsUUFBQTtJQUFBLE9BQUEsR0FBVTtBQUNWLFNBQUEsd0NBQUE7O01BQ0UsTUFBQSxHQUFTO0FBQ1QsV0FBQSw0Q0FBQTs7UUFDRSxJQUFHLElBQUEsS0FBUSxHQUFYO1VBQ0UsTUFBQSxHQUFTO0FBQ1QsZ0JBRkY7O0FBREY7TUFJQSxJQUFHLE1BQUg7UUFDRSxPQUFPLENBQUMsSUFBUixDQUFhLElBQWIsRUFERjs7QUFORjtBQVFBLFdBQU87RUFWSTs7cUJBWWIsUUFBQSxHQUFVLFNBQUMsUUFBRDtBQUNSLFFBQUE7SUFBQSxLQUFBLEdBQVEsUUFBUSxDQUFDLEdBQVQsQ0FBYSxTQUFDLEdBQUQ7YUFBUyxJQUFJLElBQUosQ0FBUyxHQUFUO0lBQVQsQ0FBYjtJQUNSLEtBQUEsR0FBUSxLQUFLLENBQUMsSUFBTixDQUFXLFNBQUMsQ0FBRCxFQUFJLENBQUo7QUFBVSxhQUFPLENBQUMsQ0FBQyxHQUFGLEdBQVEsQ0FBQyxDQUFDO0lBQTNCLENBQVg7SUFDUixVQUFBLEdBQWEsS0FBTSxDQUFBLEtBQUssQ0FBQyxNQUFOLEdBQWUsQ0FBZixDQUFpQixDQUFDO0lBR3JDLElBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTixJQUFnQixDQUFqQixDQUFBLElBQXdCLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTixHQUFlLENBQWhCLENBQUEsS0FBc0IsQ0FBdkIsQ0FBM0I7TUFDRSxRQUFBLEdBQVc7QUFDWCxXQUFBLGlFQUFBOztRQUNFLElBQUcsU0FBQSxLQUFhLENBQWhCO0FBQ0UsbUJBREY7O1FBRUEsSUFBRyxJQUFJLENBQUMsS0FBTCxLQUFjLEVBQWpCO1VBRUUsUUFBQSxHQUFXO0FBQ1gsZ0JBSEY7O1FBSUEsSUFBRyxDQUFDLFNBQUEsR0FBWSxDQUFiLENBQUEsS0FBbUIsQ0FBdEI7VUFFRSxJQUFHLElBQUksQ0FBQyxLQUFMLEtBQWUsS0FBTSxDQUFBLFNBQUEsR0FBWSxDQUFaLENBQWMsQ0FBQyxLQUF2QztZQUNFLFFBQUEsR0FBVztBQUNYLGtCQUZGO1dBRkY7U0FBQSxNQUFBO1VBT0UsSUFBRyxJQUFJLENBQUMsS0FBTCxLQUFjLENBQUMsS0FBTSxDQUFBLFNBQUEsR0FBWSxDQUFaLENBQWMsQ0FBQyxLQUFyQixHQUE2QixDQUE5QixDQUFqQjtZQUNFLFFBQUEsR0FBVztBQUNYLGtCQUZGO1dBUEY7O0FBUEY7TUFrQkEsSUFBRyxRQUFIO0FBQ0UsZUFBTztVQUNMLElBQUEsRUFBTSxLQUFBLEdBQVEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxLQUFLLENBQUMsTUFBTixHQUFlLENBQTFCLENBRFQ7VUFFTCxJQUFBLEVBQU0sVUFGRDtVQURUO09BcEJGOztJQTJCQSxJQUFHLEtBQUssQ0FBQyxNQUFOLElBQWdCLENBQW5CO01BQ0UsUUFBQSxHQUFXO0FBQ1gsV0FBQSxpRUFBQTs7UUFDRSxJQUFHLFNBQUEsS0FBYSxDQUFoQjtBQUNFLG1CQURGOztRQUVBLElBQUcsSUFBSSxDQUFDLEtBQUwsS0FBYyxFQUFqQjtVQUVFLFFBQUEsR0FBVztBQUNYLGdCQUhGOztRQUlBLElBQUcsSUFBSSxDQUFDLEtBQUwsS0FBYyxDQUFDLEtBQU0sQ0FBQSxTQUFBLEdBQVksQ0FBWixDQUFjLENBQUMsS0FBckIsR0FBNkIsQ0FBOUIsQ0FBakI7VUFDRSxRQUFBLEdBQVc7QUFDWCxnQkFGRjs7QUFQRjtNQVdBLElBQUcsUUFBSDtBQUNFLGVBQU87VUFDTCxJQUFBLEVBQU0sS0FBQSxHQUFRLEtBQUssQ0FBQyxNQURmO1VBRUwsSUFBQSxFQUFNLFVBRkQ7VUFEVDtPQWJGOztJQW9CQSxRQUFBLEdBQVcsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDO0FBQ3BCLFNBQUEseUNBQUE7O01BQ0UsSUFBRyxJQUFJLENBQUMsS0FBTCxLQUFjLFFBQWpCO0FBQ0UsZUFBTyxLQURUOztBQURGO0lBR0EsSUFBQSxHQUFPLE1BQUEsR0FBUyxLQUFLLENBQUM7QUFDdEIsV0FBTztNQUNMLElBQUEsRUFBTSxJQUREO01BRUwsSUFBQSxFQUFNLFVBRkQ7O0VBMURDOztxQkErRFYsU0FBQSxHQUFXLFNBQUMsSUFBRDtBQUNULFFBQUE7QUFBQSxTQUFBLHdDQUFBOztNQUNFLElBQUcsR0FBQSxLQUFPLENBQVY7QUFDRSxlQUFPLEtBRFQ7O0FBREY7QUFHQSxXQUFPO0VBSkU7O3FCQU1YLFNBQUEsR0FBVyxTQUFBO0FBQ1QsUUFBQTtJQUFBLFlBQUEsR0FBZTtBQUNmO0FBQUEsU0FBQSx1Q0FBQTs7O1FBQ0UsTUFBTSxDQUFDLFFBQVM7O01BQ2hCLElBQUcsWUFBQSxHQUFlLE1BQU0sQ0FBQyxLQUF6QjtRQUNFLFlBQUEsR0FBZSxNQUFNLENBQUMsTUFEeEI7O0FBRkY7QUFJQSxXQUFPLFlBQUEsR0FBZTtFQU5iOztxQkFRWCxhQUFBLEdBQWUsU0FBQyxRQUFEO0FBQ2IsUUFBQTtJQUFBLElBQUcsT0FBQSxHQUFVLFFBQVEsQ0FBQyxLQUFULENBQWUsaUJBQWYsQ0FBYjtBQUNFLGFBQU8sQ0FBQyxPQUFRLENBQUEsQ0FBQSxDQUFULEVBQWEsUUFBQSxDQUFTLE9BQVEsQ0FBQSxDQUFBLENBQWpCLENBQWIsRUFEVDs7QUFFQSxXQUFPLENBQUMsUUFBRCxFQUFXLENBQVg7RUFITTs7cUJBS2YsT0FBQSxHQUFTLFNBQUMsV0FBRCxFQUFjLElBQWQ7QUFFUCxRQUFBO0lBQUEsSUFBSSxlQUFBLENBQWdCLFdBQWhCLENBQUEsR0FBK0IsSUFBSSxDQUFDLE1BQXhDO0FBQ0UsYUFBTyxNQURUOztJQUdBLFNBQUEsR0FBWTtJQUNaLEtBQUEsR0FBUTtJQUNSLEdBQUEsR0FBTSxJQUFDLENBQUEsYUFBRCxDQUFlLFdBQVcsQ0FBQyxJQUEzQjtBQUNOLFlBQU8sR0FBSSxDQUFBLENBQUEsQ0FBWDtBQUFBLFdBQ08sS0FEUDtRQUVJLFNBQUEsR0FBWSxJQUFDLENBQUEsVUFBRCxDQUFZLElBQVosRUFBa0IsS0FBbEIsRUFBeUIsR0FBSSxDQUFBLENBQUEsQ0FBN0I7QUFEVDtBQURQLFdBR08sS0FIUDtRQUlJLFNBQUEsR0FBWSxJQUFDLENBQUEsVUFBRCxDQUFZLElBQVosRUFBa0IsS0FBbEIsRUFBeUIsS0FBekIsRUFBZ0MsR0FBSSxDQUFBLENBQUEsQ0FBcEM7QUFEVDtBQUhQLFdBS08sTUFMUDtRQU1JLFNBQUEsR0FBWSxJQUFDLENBQUEsV0FBRCxDQUFhLElBQWIsRUFBbUIsS0FBbkIsRUFBMEIsSUFBMUI7QUFOaEI7O01BUUEsS0FBSyxDQUFDLFFBQVM7O0FBQ2YsU0FBQSw2Q0FBQTs7TUFDRSxLQUFLLENBQUMsS0FBSyxDQUFDLElBQVosQ0FBaUIsQ0FBQyxRQUFELENBQWpCO0FBREY7SUFHQSxJQUFHLGlDQUFBLElBQTZCLEtBQU0sQ0FBQSxXQUFXLENBQUMsSUFBWixDQUFpQixDQUFDLE1BQXhCLEdBQWlDLENBQWpFO0FBQ0k7QUFBQSxXQUFBLHVDQUFBOztRQUNFLElBQUcsSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFiLENBQUEsR0FBcUIsV0FBVyxDQUFDLElBQXBDO0FBQ0UsaUJBQU8sS0FEVDs7QUFERixPQURKOztJQU1BLElBQUcsR0FBSSxDQUFBLENBQUEsQ0FBSixLQUFVLE1BQWI7QUFFRSxXQUFrQiwrRkFBbEI7UUFDRSxVQUFBLEdBQWEsTUFBQSxHQUFPO1FBQ3BCLElBQUcsMkJBQUEsSUFBdUIsS0FBTSxDQUFBLFVBQUEsQ0FBVyxDQUFDLE1BQWxCLEdBQTJCLENBQXJEO0FBQ0k7QUFBQSxlQUFBLHdDQUFBOztZQUNFLElBQUcsSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFiLENBQUEsR0FBcUIsV0FBVyxDQUFDLElBQXBDO0FBQ0UscUJBQU8sS0FEVDs7QUFERixXQURKOztBQUZGLE9BRkY7O0FBVUEsV0FBTztFQXBDQTs7cUJBc0NULE9BQUEsR0FBUyxTQUFDLE1BQUQ7QUFDUCxRQUFBO0lBQUEsSUFBRyxJQUFDLENBQUEsUUFBRCxDQUFBLENBQUg7QUFDRSxhQUFPLFdBRFQ7O0lBR0EsYUFBQSxHQUFnQixJQUFDLENBQUEsYUFBRCxDQUFBO0lBQ2hCLElBQUcsTUFBTSxDQUFDLEVBQVAsS0FBYSxhQUFhLENBQUMsRUFBOUI7QUFDRSxhQUFPLGNBRFQ7O0lBR0EsSUFBRyxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sS0FBZ0IsQ0FBbkI7QUFDRSxhQUFPLGNBRFQ7O0lBR0EsSUFBRyxJQUFDLENBQUEsY0FBRCxDQUFBLENBQUg7QUFDRSxhQUFPLGdCQURUOztBQUdBLFdBQU87RUFkQTs7cUJBZ0JULE9BQUEsR0FBUyxTQUFDLE1BQUQsRUFBUyxZQUFULEVBQXVCLFNBQXZCO0FBQ1AsUUFBQTtJQUFBLElBQUcsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFIO0FBQ0UsYUFBTyxXQURUOztJQUdBLGFBQUEsR0FBZ0IsSUFBQyxDQUFBLGFBQUQsQ0FBQTtJQUNoQixJQUFHLE1BQU0sQ0FBQyxFQUFQLEtBQWEsYUFBYSxDQUFDLEVBQTlCO0FBQ0UsYUFBTyxjQURUOztJQUdBLElBQUcsWUFBQSxLQUFnQixJQUFuQjtBQUNFLGFBQU8sY0FEVDs7SUFHQSxJQUFHLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixLQUFnQixDQUFuQjtNQUNFLElBQUcsQ0FBSSxTQUFQO0FBQ0UsZUFBTyxjQURUO09BREY7O0lBSUEsYUFBQSxHQUFnQixJQUFDLENBQUEsYUFBRCxDQUFBO0lBQ2hCLElBQUcsYUFBYSxDQUFDLElBQWpCO01BQ0UsSUFBRyxJQUFDLENBQUEsV0FBRCxJQUFpQixJQUFDLENBQUEsV0FBRCxDQUFhLElBQUMsQ0FBQSxXQUFkLENBQXBCO1FBQ0UsSUFBRyxJQUFDLENBQUEsYUFBRCxDQUFlLFlBQVksQ0FBQyxJQUE1QixDQUFIO0FBQ0UsaUJBQU8sR0FEVDtTQUFBLE1BQUE7QUFHRSxpQkFBTyxrQkFIVDtTQURGOztBQUtBLGFBQU8sV0FOVDs7SUFRQSxJQUFHLElBQUMsQ0FBQSxXQUFELEtBQWdCLElBQW5CO0FBQ0UsYUFBTyxHQURUOztJQUdBLElBQUcsSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQUFIO0FBQ0UsYUFBTyxHQURUOztJQUdBLElBQUcsSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFDLENBQUEsV0FBZCxDQUFBLElBQStCLElBQUMsQ0FBQSxhQUFELENBQWUsWUFBWSxDQUFDLElBQTVCLENBQWxDO0FBRUUsYUFBTyxHQUZUOztJQUlBLElBQUcsWUFBWSxDQUFDLElBQWIsS0FBcUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxJQUFyQztBQUNFLGFBQU8sWUFEVDs7SUFHQSxJQUFHLFlBQVksQ0FBQyxJQUFiLEdBQW9CLElBQUMsQ0FBQSxXQUFXLENBQUMsSUFBcEM7QUFDRSxhQUFPLGFBRFQ7O0FBR0EsV0FBTztFQXhDQTs7cUJBMENULElBQUEsR0FBTSxTQUFDLE1BQUQ7QUFDSixRQUFBO0lBQUEsWUFBQSxHQUFlLElBQUMsQ0FBQSxRQUFELENBQVUsTUFBTSxDQUFDLEtBQWpCO0lBQ2YsT0FBTyxDQUFDLEdBQVIsQ0FBWSxjQUFaLEVBQTRCLFlBQTVCO0lBRUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxzQkFBWixFQUFvQyxNQUFwQztJQUNBLEdBQUEsR0FBTSxJQUFDLENBQUEsT0FBRCxDQUFTLE1BQVQsRUFBaUIsWUFBakIsRUFBK0IsSUFBQyxDQUFBLFNBQUQsQ0FBVyxNQUFNLENBQUMsS0FBbEIsQ0FBL0I7SUFDTixJQUFHLEdBQUEsS0FBTyxFQUFWO0FBQ0UsYUFBTyxJQURUOztJQUdBLGFBQUEsR0FBZ0I7SUFDaEIsUUFBQSxHQUFXO0lBR1gsSUFBQSxHQUFPO0lBQ1AsSUFBRyxJQUFDLENBQUEsV0FBSjtNQUNFLElBQUcsSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFDLENBQUEsV0FBZCxDQUFBLElBQStCLElBQUMsQ0FBQSxhQUFELENBQWUsWUFBWSxDQUFDLElBQTVCLENBQWxDO1FBRUUsSUFBQyxDQUFBLFNBQUQsQ0FBQTtRQUNBLElBQUEsR0FBTztRQUNQLGFBQUEsR0FBZ0I7UUFDaEIsUUFBQSxHQUFXLE1BTGI7T0FBQSxNQU1LLElBQUcsQ0FBQyxZQUFZLENBQUMsSUFBYixLQUFxQixJQUFDLENBQUEsV0FBVyxDQUFDLElBQW5DLENBQUEsSUFBNEMsQ0FBQyxZQUFZLENBQUMsSUFBYixHQUFvQixJQUFDLENBQUEsV0FBVyxDQUFDLElBQWxDLENBQS9DO1FBRUgsSUFBQyxDQUFBLFNBQUQsQ0FBQTtRQUNBLElBQUEsR0FBTyxjQUhKO09BQUEsTUFBQTtRQUtILFFBQUEsR0FBVyxNQUxSO09BUFA7S0FBQSxNQUFBO01BY0UsSUFBQSxHQUFPLFVBZFQ7OztVQWlCVSxDQUFDLFdBQVk7OztXQUNiLENBQUMsY0FBZTs7QUFDMUI7QUFBQSxTQUFBLHVDQUFBOztNQUNFLElBQUcsSUFBQSxJQUFRLEVBQVg7UUFDRSxJQUFDLENBQUEsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFYLElBQXVCLEVBRHpCOztBQURGO0lBR0EsSUFBRyxDQUFDLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVgsS0FBdUIsQ0FBeEIsQ0FBQSxJQUErQixDQUFDLElBQUMsQ0FBQSxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBSSxDQUFDLE1BQWpCLEtBQTJCLEVBQTVCLENBQWxDO01BQ0UsSUFBQyxDQUFBLEdBQUcsQ0FBQyxLQUFLLENBQUMsZUFBWCxHQUE2QixLQUQvQjs7SUFFQSxPQUFPLENBQUMsR0FBUixDQUFZLDZCQUFBLEdBQThCLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBSyxDQUFDLGVBQXJEO0lBQ0EsSUFBRyxJQUFDLENBQUEsSUFBRCxLQUFTLENBQVo7TUFDRSxJQUFHLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBQSxJQUFzQixDQUFJLFFBQTdCO1FBQ0UsSUFBQyxDQUFBLElBQUQsQ0FBTSxVQUFOLEVBREY7O01BRUEsSUFBRyxZQUFZLENBQUMsSUFBYixLQUFxQixPQUF4QjtRQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVgsSUFBMEI7UUFDMUIsSUFBRyxJQUFDLENBQUEsR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFYLElBQTBCLENBQTdCO1VBQ0UsSUFBQyxDQUFBLElBQUQsQ0FBTSxPQUFOLEVBREY7U0FGRjs7TUFJQSxJQUFHLGFBQUg7UUFDRSxJQUFDLENBQUEsSUFBRCxDQUFNLFNBQU4sRUFERjs7TUFFQSxJQUFHLElBQUMsQ0FBQSxhQUFELENBQWUsWUFBWSxDQUFDLElBQTVCLENBQUEsSUFBc0MsQ0FBQyxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sS0FBZ0IsQ0FBakIsQ0FBekM7UUFDRSxJQUFDLENBQUEsSUFBRCxDQUFNLFNBQU4sRUFERjs7TUFFQSxJQUFHLElBQUMsQ0FBQSxTQUFELENBQVcsWUFBWSxDQUFDLElBQXhCLENBQUEsSUFBa0MsSUFBQyxDQUFBLFFBQUQsQ0FBVSxNQUFNLENBQUMsS0FBakIsQ0FBckM7UUFDRSxJQUFDLENBQUEsSUFBRCxDQUFNLFFBQU4sRUFERjs7TUFFQSxJQUFHLElBQUMsQ0FBQSxXQUFELElBQWlCLENBQUMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxJQUFiLEtBQXFCLE9BQXRCLENBQWpCLElBQW9ELENBQUMsSUFBQyxDQUFBLFdBQVcsQ0FBQyxJQUFiLElBQXFCLENBQXRCLENBQXBELElBQWlGLENBQUMsWUFBWSxDQUFDLElBQWIsS0FBcUIsT0FBdEIsQ0FBakYsSUFBb0gsQ0FBQyxZQUFZLENBQUMsSUFBYixJQUFxQixFQUF0QixDQUF2SDtRQUNFLElBQUMsQ0FBQSxJQUFELENBQU0sV0FBTixFQURGOztNQUVBLElBQUcsSUFBQyxDQUFBLFNBQUQsQ0FBVyxZQUFZLENBQUMsSUFBeEIsQ0FBQSxJQUFrQyxDQUFDLFlBQVksQ0FBQyxJQUFiLEtBQXFCLEVBQXRCLENBQXJDO1FBQ0UsSUFBQyxDQUFBLElBQUQsQ0FBTSxhQUFOLEVBREY7O01BRUEsSUFBRyxJQUFDLENBQUEsUUFBRCxDQUFVLFlBQVYsRUFBd0IsQ0FBeEIsQ0FBSDtRQUNFLE9BQU8sQ0FBQyxHQUFSLENBQVksaUJBQVo7UUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFYLEdBQXVCLEtBRnpCOztNQUdBLElBQUcsWUFBWSxDQUFDLElBQWIsS0FBcUIsT0FBeEI7UUFDRSxJQUFDLENBQUEsR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFYLEdBQXlCLEtBRDNCOztNQUVBLElBQUcsWUFBWSxDQUFDLElBQWIsS0FBcUIsT0FBeEI7UUFDRSxJQUFDLENBQUEsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFYLEdBQXVCLEtBRHpCOztNQUVBLElBQUcsWUFBWSxDQUFDLElBQWIsS0FBcUIsT0FBeEI7UUFDRSxJQUFDLENBQUEsR0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFYLEdBQXdCLEtBRDFCOztNQUVBLElBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFsQixDQUF3QixNQUF4QixDQUFIO1FBQ0UsSUFBQyxDQUFBLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBWCxHQUFzQixLQUR4Qjs7TUFFQSxJQUFHLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVgsSUFBMkIsSUFBQyxDQUFBLEdBQUcsQ0FBQyxLQUFLLENBQUMsU0FBdEMsSUFBb0QsSUFBQyxDQUFBLEdBQUcsQ0FBQyxLQUFLLENBQUMsVUFBL0QsSUFBOEUsSUFBQyxDQUFBLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBNUY7UUFDRSxJQUFDLENBQUEsSUFBRCxDQUFNLFNBQU4sRUFERjtPQTVCRjs7SUErQkEsSUFBQyxDQUFBLFdBQUQsR0FBZTtJQUVmLElBQUMsQ0FBQSxPQUFELElBQVk7SUFDWixhQUFBLEdBQWdCLElBQUMsQ0FBQSxhQUFELENBQUE7SUFDaEIsYUFBYSxDQUFDLElBQWQsR0FBcUIsSUFBQyxDQUFBLFdBQUQsQ0FBYSxhQUFhLENBQUMsSUFBM0IsRUFBaUMsTUFBTSxDQUFDLEtBQXhDO0lBRXJCLElBQUMsQ0FBQSxNQUFELENBQVcsYUFBYSxDQUFDLElBQWYsR0FBb0IsR0FBcEIsR0FBdUIsSUFBdkIsR0FBNEIsR0FBNUIsR0FBOEIsQ0FBQyxZQUFBLENBQWEsWUFBYixDQUFELENBQXhDO0lBRUEsSUFBRyxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQW5CLEtBQTZCLENBQWhDO01BR0UsYUFBYSxDQUFDLEtBQWQsR0FBc0IsSUFBQyxDQUFBLFNBQUQsQ0FBQTtNQUV0QixJQUFHLElBQUMsQ0FBQSxLQUFKO1FBQ0UsV0FBQSxHQUFjO1FBQ2QsSUFBRyxhQUFhLENBQUMsS0FBZCxLQUF1QixDQUExQjtVQUNFLFdBQUEsR0FBYyxNQURoQjtTQUFBLE1BRUssSUFBRyxhQUFhLENBQUMsS0FBZCxLQUF1QixDQUExQjtVQUNILFdBQUEsR0FBYyxNQURYO1NBQUEsTUFFQSxJQUFHLGFBQWEsQ0FBQyxLQUFkLEtBQXVCLENBQTFCO1VBQ0gsV0FBQSxHQUFjLE1BRFg7O1FBRUwsSUFBQyxDQUFBLE1BQUQsQ0FBVyxhQUFhLENBQUMsSUFBZixHQUFvQixTQUFwQixHQUE2QixXQUE3QixHQUF5QyxRQUFuRDtRQUVBLElBQUcsYUFBYSxDQUFDLEtBQWQsS0FBdUIsQ0FBMUI7VUFDRSxJQUFDLENBQUEsTUFBRCxDQUFBLEVBREY7U0FWRjtPQUFBLE1BQUE7UUFhRSxJQUFDLENBQUEsTUFBRCxDQUFXLGFBQWEsQ0FBQyxJQUFmLEdBQW9CLFFBQTlCLEVBYkY7O01BZUEsSUFBRyxhQUFhLENBQUMsS0FBZCxLQUF1QixDQUExQjtRQUNFLElBQUcsSUFBQyxDQUFBLElBQUQsS0FBUyxDQUFaO1VBQ0UsSUFBQyxDQUFBLE1BQUQsSUFBVztVQUNYLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBQyxDQUFBLE9BRmpCO1NBQUEsTUFBQTtVQUlFLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBQyxDQUFBO1VBQ2YsSUFBQyxDQUFBLE1BQUQsR0FBVSxFQUxaO1NBREY7OzthQVFVLENBQUMsYUFBYzs7TUFDekIsSUFBRyxJQUFDLENBQUEsR0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFYLEdBQXdCLElBQUMsQ0FBQSxVQUE1QjtRQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBSyxDQUFDLFVBQVgsR0FBd0IsSUFBQyxDQUFBLFdBRDNCOztNQUlBLElBQUcsSUFBQyxDQUFBLEdBQUcsQ0FBQyxLQUFLLENBQUMsVUFBWCxJQUF5QixDQUE1QjtRQUNFLElBQUMsQ0FBQSxJQUFELENBQU0sU0FBTixFQURGOztNQUVBLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBSyxDQUFDLFVBQVgsSUFBeUI7TUFDekIsSUFBRyxJQUFDLENBQUEsR0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFYLElBQXlCLEVBQTVCO1FBQ0UsSUFBQyxDQUFBLElBQUQsQ0FBTSxTQUFOLEVBREY7O01BRUEsSUFBRyxhQUFhLENBQUMsS0FBZCxLQUF1QixDQUExQjtRQUNFLElBQUcsSUFBQyxDQUFBLElBQUQsS0FBUyxDQUFaO1VBRUUsSUFBRyxDQUFDLElBQUMsQ0FBQSxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBSSxDQUFDLE1BQWpCLElBQTJCLEVBQTVCLENBQUEsSUFBb0MsQ0FBQyxJQUFDLENBQUEsT0FBUSxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQUksQ0FBQyxNQUFqQixJQUEyQixFQUE1QixDQUFwQyxJQUF3RSxDQUFDLElBQUMsQ0FBQSxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBSSxDQUFDLE1BQWpCLElBQTJCLEVBQTVCLENBQTNFO1lBQ0UsSUFBQyxDQUFBLElBQUQsQ0FBTSxNQUFOLEVBREY7O1VBRUEsSUFBRyxJQUFDLENBQUEsR0FBRyxDQUFDLEtBQUssQ0FBQyxlQUFkO1lBQ0UsSUFBQyxDQUFBLElBQUQsQ0FBTSxNQUFOLEVBREY7V0FKRjtTQUFBLE1BQUE7VUFRRSxJQUFHLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQWQ7WUFDRSxJQUFDLENBQUEsSUFBRCxDQUFNLE1BQU4sRUFERjtXQVJGO1NBREY7T0F0Q0Y7O0lBa0RBLGdCQUFBLEdBQW1CO0FBQ25CLFNBQUEsb0RBQUE7O01BQ0UsSUFBRyxJQUFDLENBQUEsR0FBRyxDQUFDLE1BQU8sQ0FBQSxXQUFXLENBQUMsRUFBWixDQUFmO1FBQ0UsZ0JBQUEsSUFBb0IsRUFEdEI7O0FBREY7SUFHQSxJQUFHLGdCQUFBLElBQW9CLEVBQXZCO01BQ0UsSUFBQyxDQUFBLElBQUQsQ0FBTSxVQUFOLEVBREY7O0lBR0EsSUFBQyxDQUFBLElBQUQsR0FBUSxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQWIsQ0FBbUIsQ0FBbkI7SUFDUixJQUFDLENBQUEsT0FBRCxHQUFXLElBQUMsQ0FBQTtJQUVaLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFDLENBQUEsSUFBZDtBQUNSLFdBQU87RUEzSUg7O3FCQTZJTixTQUFBLEdBQVcsU0FBQTtBQUNULFFBQUE7QUFBQTtBQUFBLFNBQUEsdUNBQUE7O01BQ0UsTUFBTSxDQUFDLElBQVAsR0FBYztBQURoQjtFQURTOztxQkFLWCxJQUFBLEdBQU0sU0FBQyxNQUFEO0FBQ0osUUFBQTtJQUFBLEdBQUEsR0FBTSxJQUFDLENBQUEsT0FBRCxDQUFTLE1BQVQ7SUFDTixJQUFHLEdBQUEsS0FBTyxFQUFWO0FBQ0UsYUFBTyxJQURUOztJQUdBLGFBQUEsR0FBZ0IsSUFBQyxDQUFBLGFBQUQsQ0FBQTtJQUNoQixJQUFHLENBQUksYUFBYSxDQUFDLEVBQWxCLElBQXlCLElBQUMsQ0FBQSxXQUExQixJQUEwQyxDQUFJLElBQUMsQ0FBQSxPQUFELENBQVMsSUFBQyxDQUFBLFdBQVYsRUFBdUIsYUFBYSxDQUFDLElBQXJDLENBQWpEO01BQ0UsSUFBQyxDQUFBLE1BQUQsQ0FBVyxhQUFhLENBQUMsSUFBZixHQUFvQix5QkFBOUIsRUFERjtLQUFBLE1BRUssSUFBRyxhQUFhLENBQUMsSUFBakI7TUFDSCxJQUFDLENBQUEsTUFBRCxDQUFXLGFBQWEsQ0FBQyxJQUFmLEdBQW9CLGNBQTlCLEVBREc7S0FBQSxNQUFBO01BR0gsSUFBQyxDQUFBLE1BQUQsQ0FBVyxhQUFhLENBQUMsSUFBZixHQUFvQixTQUE5QixFQUhHOztJQUlMLGFBQWEsQ0FBQyxJQUFkLEdBQXFCO0lBQ3JCLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFDLENBQUEsSUFBZDtBQUNSLFdBQU87RUFkSDs7cUJBZ0JOLE1BQUEsR0FBUSxTQUFDLGFBQUQsRUFBZ0IsS0FBaEI7QUFDTixXQUFPLElBQUMsQ0FBQSxJQUFELENBQU07TUFBQyxJQUFBLEVBQUssYUFBYSxDQUFDLEVBQXBCO01BQXdCLE9BQUEsRUFBUSxLQUFoQztLQUFOO0VBREQ7O3FCQUdSLE1BQUEsR0FBUSxTQUFDLGFBQUQ7QUFDTixXQUFPLElBQUMsQ0FBQSxJQUFELENBQU07TUFBQyxJQUFBLEVBQUssYUFBYSxDQUFDLEVBQXBCO0tBQU47RUFERDs7cUJBR1IsSUFBQSxHQUFNLFNBQUMsRUFBRDtBQUNKLFFBQUE7SUFBQSxJQUFHLElBQUMsQ0FBQSxHQUFHLENBQUMsTUFBTyxDQUFBLEVBQUEsQ0FBZjtBQUNFLGFBREY7O0lBRUEsV0FBQSxHQUFjLGVBQWdCLENBQUEsRUFBQTtJQUM5QixJQUFPLG1CQUFQO0FBQ0UsYUFERjs7SUFHQSxJQUFDLENBQUEsR0FBRyxDQUFDLE1BQU8sQ0FBQSxFQUFBLENBQVosR0FBa0I7SUFDbEIsSUFBQyxDQUFBLE1BQUQsQ0FBUSxVQUFBLEdBQVcsV0FBVyxDQUFDLEtBQS9CO1dBQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLENBQWUsV0FBVyxDQUFDLEtBQTNCO0VBVEk7O3FCQWdCTixLQUFBLEdBQU8sU0FBQyxJQUFEO0FBQ0wsUUFBQTtJQUFBLGFBQUEsR0FBZ0IsSUFBQyxDQUFBLGFBQUQsQ0FBQTtJQUNoQixJQUFHLENBQUksYUFBYSxDQUFDLEVBQXJCO0FBQ0UsYUFBTyxNQURUOztJQUdBLFNBQUEsR0FBWSxZQUFhLENBQUEsYUFBYSxDQUFDLE1BQWQ7V0FDekIsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLENBQVUsS0FBQSxHQUFNLGFBQWEsQ0FBQyxJQUFwQixHQUF5QixHQUF6QixHQUE2QixTQUFTLENBQUMsS0FBdkMsR0FBNkMsVUFBN0MsR0FBd0QsYUFBQSxDQUFjLGFBQWEsQ0FBQyxJQUE1QixDQUF4RCxHQUEwRixRQUExRixHQUFtRyxhQUFBLENBQWMsSUFBQyxDQUFBLElBQWYsQ0FBbkcsR0FBd0gsR0FBeEgsR0FBNEgsSUFBdEk7RUFOSzs7cUJBU1AsTUFBQSxHQUFRLFNBQUE7QUFDTixRQUFBO0lBQUEsSUFBRyxJQUFDLENBQUEsUUFBRCxDQUFBLENBQUg7QUFDRSxhQUFPLE1BRFQ7O0lBR0EsSUFBRyxJQUFDLENBQUEsaUJBQUQsQ0FBQSxDQUFIO01BQ0UsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFDLENBQUEsV0FBRCxDQUFhLElBQUMsQ0FBQSxPQUFkO01BQ1IsSUFBQyxDQUFBLFNBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxXQUFELEdBQWU7TUFDZixJQUFDLENBQUEsTUFBRCxDQUFRLGlDQUFBLEdBQW9DLElBQUMsQ0FBQSxPQUFRLENBQUEsSUFBQyxDQUFBLElBQUQsQ0FBTSxDQUFDLElBQTVELEVBSkY7O0lBTUEsYUFBQSxHQUFnQixJQUFDLENBQUEsYUFBRCxDQUFBO0lBQ2hCLElBQUcsQ0FBSSxhQUFhLENBQUMsRUFBckI7TUFDRSxJQUFHLENBQUksSUFBQyxDQUFBLGdCQUFELENBQUEsQ0FBUDtRQUNFLElBQUcsSUFBQyxDQUFBLFdBQUQsSUFBaUIsQ0FBQyxJQUFDLENBQUEsV0FBVyxDQUFDLElBQWIsS0FBcUIsT0FBdEIsQ0FBakIsSUFBb0QsQ0FBQyxJQUFDLENBQUEsV0FBVyxDQUFDLElBQWIsSUFBcUIsRUFBdEIsQ0FBcEQsSUFBa0YsSUFBQyxDQUFBLFVBQUQsQ0FBWSxhQUFhLENBQUMsSUFBMUIsQ0FBckY7QUFBQTtTQUFBLE1BRUssSUFBRyxJQUFDLENBQUEsV0FBRCxJQUFpQixDQUFJLElBQUMsQ0FBQSxPQUFELENBQVMsSUFBQyxDQUFBLFdBQVYsRUFBdUIsYUFBYSxDQUFDLElBQXJDLENBQXhCO1VBQ0gsSUFBQyxDQUFBLEtBQUQsQ0FBTyxrQ0FBUDtVQUNBLElBQUMsQ0FBQSxNQUFELENBQVEsYUFBUjtBQUNBLGlCQUFPLEtBSEo7U0FBQSxNQUlBLElBQUcsYUFBYSxDQUFDLElBQWpCO1VBQ0gsSUFBQyxDQUFBLEtBQUQsQ0FBTyx3QkFBUDtVQUNBLElBQUMsQ0FBQSxNQUFELENBQVEsYUFBUjtBQUNBLGlCQUFPLEtBSEo7U0FQUDs7QUFXQSxhQUFPLE1BWlQ7O0lBY0EsU0FBQSxHQUFZLFlBQWEsQ0FBQSxhQUFhLENBQUMsTUFBZDtJQUN6QixHQUFBLEdBQU0sSUFBQyxDQUFBLE1BQU8sQ0FBQSxTQUFTLENBQUMsS0FBVixDQUFnQixDQUFDLElBQUksQ0FBQyxLQUE5QixDQUFvQyxJQUFwQyxFQUEwQyxDQUFDLGFBQUQsRUFBZ0IsSUFBQyxDQUFBLFdBQWpCLEVBQThCLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBOUIsQ0FBMUM7SUFDTixJQUFHLEdBQUEsS0FBTyxFQUFWO0FBQ0UsYUFBTyxLQURUOztBQUVBLFdBQU87RUE3QkQ7O3FCQStCUixXQUFBLEdBQWEsU0FBQyxJQUFELEVBQU8sS0FBUCxFQUFjLE9BQWQ7QUFDWCxRQUFBOztNQUR5QixVQUFVOztJQUNuQyxLQUFBLEdBQVEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxTQUFDLEdBQUQ7YUFBUyxJQUFJLElBQUosQ0FBUyxHQUFUO0lBQVQsQ0FBVDtJQUNSLEtBQUEsR0FBUSxLQUFLLENBQUMsSUFBTixDQUFXLFNBQUMsQ0FBRCxFQUFJLENBQUo7QUFBVSxhQUFPLENBQUMsQ0FBQyxHQUFGLEdBQVEsQ0FBQyxDQUFDO0lBQTNCLENBQVg7SUFDUixXQUFBLEdBQWM7QUFDZCxTQUFTLDBCQUFUO01BQ0UsV0FBVyxDQUFDLElBQVosQ0FBaUIsRUFBakI7QUFERjtBQUVBLFNBQUEseUNBQUE7O01BQ0UsV0FBWSxDQUFBLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBQyxJQUF4QixDQUE2QixJQUE3QjtBQURGO0lBR0EsSUFBQSxHQUFPO0FBQ1AsU0FBQSwrREFBQTs7TUFDRSxJQUFHLENBQUMsVUFBVSxDQUFDLE1BQVgsR0FBb0IsQ0FBckIsQ0FBQSxJQUE0QixDQUFDLE9BQUEsSUFBVyxDQUFDLEtBQUEsR0FBUSxFQUFULENBQVosQ0FBL0I7UUFDRSxHQUFBLEdBQU0sTUFBQSxHQUFPLFVBQVUsQ0FBQzs7VUFDeEIsS0FBTSxDQUFBLEdBQUEsSUFBUTs7UUFDZCxLQUFNLENBQUEsR0FBQSxDQUFJLENBQUMsSUFBWCxDQUFnQixVQUFVLENBQUMsR0FBWCxDQUFlLFNBQUMsQ0FBRDtpQkFBTyxDQUFDLENBQUM7UUFBVCxDQUFmLENBQWhCLEVBSEY7T0FBQSxNQUFBO0FBS0UsYUFBQSw4Q0FBQTs7VUFDRSxJQUFJLENBQUMsSUFBTCxDQUFVLENBQUMsQ0FBQyxHQUFaO0FBREYsU0FMRjs7QUFERjtBQVNBLFdBQU87RUFuQkk7O3FCQXFCYixVQUFBLEdBQVksU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixJQUFqQjtBQUNWLFFBQUE7SUFBQSxJQUFBLEdBQU87SUFFUCxLQUFBLEdBQVEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxTQUFDLEdBQUQ7YUFBUyxJQUFJLElBQUosQ0FBUyxHQUFUO0lBQVQsQ0FBVDtJQUNSLEtBQUEsR0FBUSxLQUFLLENBQUMsSUFBTixDQUFXLFNBQUMsQ0FBRCxFQUFJLENBQUo7QUFBVSxhQUFPLENBQUMsQ0FBQyxHQUFGLEdBQVEsQ0FBQyxDQUFDO0lBQTNCLENBQVg7SUFDUixXQUFBLEdBQWM7QUFDZCxTQUFTLDBCQUFUO01BQ0UsV0FBVyxDQUFDLElBQVosQ0FBaUIsRUFBakI7QUFERjtBQUVBLFNBQUEseUNBQUE7O01BQ0UsV0FBWSxDQUFBLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBQyxJQUF4QixDQUE2QixJQUE3QjtBQURGO0lBR0EsaUJBQUEsR0FBb0IsRUFBQSxHQUFLO0FBQ3pCLFNBQXFCLGtIQUFyQjtNQUNFLFFBQUEsR0FBVztBQUNYLFdBQWMsNEZBQWQ7UUFDRSxJQUFHLFdBQVksQ0FBQSxhQUFBLEdBQWMsTUFBZCxDQUFxQixDQUFDLE1BQWxDLEdBQTJDLFFBQTlDO1VBQ0UsUUFBQSxHQUFXO0FBQ1gsZ0JBRkY7O0FBREY7TUFJQSxJQUFHLFFBQUg7UUFDRSxHQUFBLEdBQU07QUFDTixhQUFjLDRGQUFkO0FBQ0UsZUFBWSw0RkFBWjtZQUNFLEdBQUcsQ0FBQyxJQUFKLENBQVMsV0FBWSxDQUFBLGFBQUEsR0FBYyxNQUFkLENBQXFCLENBQUMsR0FBbEMsQ0FBQSxDQUF1QyxDQUFDLEdBQWpEO0FBREY7QUFERjtRQUdBLElBQUksQ0FBQyxJQUFMLENBQVUsR0FBVixFQUxGOztBQU5GO0lBYUEsU0FBQSxHQUFZO0FBQ1osU0FBQSwrQ0FBQTs7QUFDRSxXQUFBLDhDQUFBOztRQUNFLFNBQVMsQ0FBQyxJQUFWLENBQWUsSUFBSSxDQUFDLEdBQXBCO0FBREY7QUFERjtBQUlBLFdBQU8sQ0FBQyxJQUFELEVBQU8sU0FBUDtFQTlCRzs7cUJBZ0NaLFVBQUEsR0FBWSxTQUFDLElBQUQsRUFBTyxLQUFQLEVBQWMsU0FBZCxFQUF5QixVQUF6QjtBQUNWLFFBQUE7O01BRG1DLGFBQWE7O0lBQ2hELElBQUcsVUFBQSxLQUFjLElBQWpCO01BQ0ksU0FBQSxHQUFZO01BQ1osT0FBQSxHQUFVO01BQ1YsUUFBQSxHQUFXLEVBSGY7S0FBQSxNQUFBO01BS0UsSUFBRyxTQUFIO1FBQ0UsU0FBQSxHQUFZO1FBQ1osT0FBQSxHQUFVO1FBQ1YsUUFBQSxHQUFXLEVBSGI7T0FBQSxNQUFBO1FBS0UsU0FBQSxHQUFZO1FBQ1osT0FBQSxHQUFVO1FBQ1YsUUFBQSxHQUFXLENBQUMsRUFQZDtPQUxGOztBQWFBLFNBQWUscUhBQWY7TUFDRSxPQUFvQixJQUFDLENBQUEsVUFBRCxDQUFZLElBQVosRUFBa0IsQ0FBbEIsRUFBcUIsT0FBckIsQ0FBcEIsRUFBQyxjQUFELEVBQU87TUFDUCxJQUFHLElBQUksQ0FBQyxNQUFMLEdBQWMsQ0FBakI7UUFDRSxHQUFBLEdBQU0sS0FBQSxHQUFNO1FBQ1osS0FBTSxDQUFBLEdBQUEsQ0FBTixHQUFhLEtBRmY7O01BR0EsSUFBQSxHQUFPO0FBTFQ7QUFPQSxXQUFPO0VBckJHOztxQkF1QlosVUFBQSxHQUFZLFNBQUMsSUFBRCxFQUFPLEtBQVAsRUFBYyxVQUFkO0FBQ1YsUUFBQTs7TUFEd0IsYUFBYTs7SUFDckMsSUFBRyxVQUFBLEtBQWMsSUFBakI7TUFDRSxTQUFBLEdBQVk7TUFDWixPQUFBLEdBQVUsRUFGWjtLQUFBLE1BQUE7TUFJRSxTQUFBLEdBQVk7TUFDWixPQUFBLEdBQVUsV0FMWjs7QUFNQSxTQUFlLHFIQUFmO01BQ0UsT0FBb0IsSUFBQyxDQUFBLFVBQUQsQ0FBWSxJQUFaLEVBQWtCLENBQWxCLEVBQXFCLE9BQXJCLENBQXBCLEVBQUMsY0FBRCxFQUFPO01BQ1AsSUFBRyxJQUFJLENBQUMsTUFBTCxHQUFjLENBQWpCO1FBQ0UsR0FBQSxHQUFNLEtBQUEsR0FBTTtRQUNaLEtBQU0sQ0FBQSxHQUFBLENBQU4sR0FBYSxLQUZmOztNQUdBLElBQUEsR0FBTztBQUxUO0FBT0EsV0FBTztFQWRHOztxQkFnQlosV0FBQSxHQUFhLFNBQUMsSUFBRCxFQUFPLFFBQVA7QUFDWCxRQUFBOztNQURrQixXQUFXOztJQUM3QixLQUFBLEdBQVE7SUFHUixJQUFHLFFBQVEsQ0FBQyxRQUFaO01BQ0UsSUFBQSxHQUFPLElBQUMsQ0FBQSxVQUFELENBQVksSUFBWixFQUFrQixLQUFsQixFQURUOztJQUdBLElBQUcsUUFBUSxDQUFDLFdBQVo7TUFDRSxJQUFBLEdBQU8sSUFBQyxDQUFBLFVBQUQsQ0FBWSxJQUFaLEVBQWtCLEtBQWxCLEVBQXlCLFFBQVEsQ0FBQyxTQUFsQztNQUNQLElBQUEsR0FBTyxJQUFDLENBQUEsV0FBRCxDQUFhLElBQWIsRUFBbUIsS0FBbkIsRUFBMEIsUUFBUSxDQUFDLE9BQW5DLEVBRlQ7S0FBQSxNQUFBO01BSUUsSUFBQSxHQUFPLElBQUMsQ0FBQSxXQUFELENBQWEsSUFBYixFQUFtQixLQUFuQixFQUEwQixRQUFRLENBQUMsT0FBbkM7TUFDUCxJQUFBLEdBQU8sSUFBQyxDQUFBLFVBQUQsQ0FBWSxJQUFaLEVBQWtCLEtBQWxCLEVBQXlCLFFBQVEsQ0FBQyxTQUFsQyxFQUxUOztJQU9BLEtBQUEsR0FBUSxJQUFJLENBQUMsR0FBTCxDQUFTLFNBQUMsQ0FBRDthQUFPLENBQUMsQ0FBRDtJQUFQLENBQVQ7SUFDUixJQUFHLEtBQUssQ0FBQyxNQUFOLEdBQWUsQ0FBbEI7TUFDRSxLQUFLLENBQUMsS0FBTixHQUFjLE1BRGhCOztBQUVBLFdBQU87RUFqQkk7O3FCQW1CYixlQUFBLEdBQWlCLFNBQUMsS0FBRDtBQUNmLFFBQUE7SUFBQSxJQUFPLG1CQUFQO0FBQ0UsYUFBTyxFQURUOztJQUVBLGFBQUEsR0FBZ0I7QUFDaEI7QUFBQSxTQUFBLHVDQUFBOztNQUNFLElBQUcsR0FBQSxHQUFNLEVBQVQ7UUFDRSxhQUFBLElBQWlCLEVBRG5COztBQURGO0FBR0EsV0FBTztFQVBROztxQkFTakIsWUFBQSxHQUFjLFNBQUMsSUFBRDtBQUNaLFdBQU8sSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFiLEVBQW1CO01BQUUsUUFBQSxFQUFVLElBQVo7TUFBa0IsV0FBQSxFQUFhLEtBQS9CO0tBQW5CO0VBREs7O3FCQUdkLGFBQUEsR0FBZSxTQUFDLFFBQUQ7SUFDYixJQUFHLFFBQVEsQ0FBQyxLQUFULENBQWUsTUFBZixDQUFBLElBQTBCLFFBQUEsS0FBWSxPQUF6QztBQUNFLGFBQU8sS0FEVDs7QUFFQSxXQUFPO0VBSE07O3FCQUtmLFdBQUEsR0FBYSxTQUFDLElBQUQ7QUFDWCxRQUFBO0lBQUEsSUFBRyxJQUFJLENBQUMsSUFBTCxLQUFhLE9BQWhCO0FBQ0UsYUFBTyxNQURUOztJQUVBLElBQUEsR0FBTyxJQUFJLElBQUosQ0FBUyxJQUFJLENBQUMsSUFBZDtBQUNQLFdBQVEsSUFBSSxDQUFDLEtBQUwsS0FBYztFQUpYOztxQkFNYixVQUFBLEdBQVksU0FBQyxJQUFEO0FBQ1YsUUFBQTtJQUFBLEtBQUEsR0FBUSxJQUFDLENBQUEsWUFBRCxDQUFjLElBQWQ7QUFDUixTQUFBLGlCQUFBOztNQUNFLElBQUcsSUFBQyxDQUFBLGFBQUQsQ0FBZSxRQUFmLENBQUg7UUFDRSxJQUFHLFFBQVEsQ0FBQyxNQUFULEdBQWtCLENBQXJCO0FBQ0UsaUJBQU8sS0FEVDtTQURGOztBQURGO0FBSUEsV0FBTztFQU5HOztxQkFRWixTQUFBLEdBQVcsU0FBQyxRQUFEO0lBQ1QsSUFBRyxRQUFRLENBQUMsS0FBVCxDQUFlLE1BQWYsQ0FBSDtBQUNFLGFBQU8sS0FEVDs7QUFFQSxXQUFPO0VBSEU7O3FCQUtYLFFBQUEsR0FBVSxTQUFDLElBQUQ7QUFDUixRQUFBO0lBQUEsSUFBRyxJQUFJLENBQUMsTUFBTCxHQUFjLENBQWpCO0FBQ0UsYUFBTyxNQURUOztJQUVBLEtBQUEsR0FBUSxJQUFJLENBQUMsR0FBTCxDQUFTLFNBQUMsR0FBRDthQUFTLElBQUksSUFBSixDQUFTLEdBQVQ7SUFBVCxDQUFUO0lBQ1IsSUFBQSxHQUFPLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQztBQUNoQixTQUFBLHlDQUFBOztNQUNFLElBQUcsSUFBSSxDQUFDLElBQUwsS0FBYSxJQUFoQjtBQUNFLGVBQU8sTUFEVDs7QUFERjtBQUdBLFdBQU87RUFSQzs7cUJBVVYsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLE9BQVA7QUFDUixRQUFBO0lBQUEsSUFBRyxPQUFBLEdBQVUsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFWLENBQWdCLFdBQWhCLENBQWI7TUFDRSxHQUFBLEdBQU0sUUFBQSxDQUFTLE9BQVEsQ0FBQSxDQUFBLENBQWpCO01BQ04sSUFBRyxHQUFBLElBQU8sT0FBVjtBQUNFLGVBQU8sS0FEVDtPQUZGOztBQUlBLFdBQU87RUFMQzs7cUJBT1YsZUFBQSxHQUFpQixTQUFDLElBQUQ7QUFDZixRQUFBO0lBQUEsU0FBQSxHQUFZO0FBQ1osU0FBWSxnQ0FBWjtNQUNFLFFBQUEsR0FDRTtRQUFBLFNBQUEsRUFBVyxDQUFDLElBQUEsR0FBTyxDQUFSLENBQUEsS0FBYyxDQUF6QjtRQUNBLFdBQUEsRUFBYSxDQUFDLElBQUEsR0FBTyxDQUFSLENBQUEsS0FBYyxDQUQzQjtRQUVBLE9BQUEsRUFBUyxDQUFDLElBQUEsR0FBTyxDQUFSLENBQUEsS0FBYyxDQUZ2QjtRQUdBLFFBQUEsRUFBVSxDQUFDLElBQUEsR0FBTyxDQUFSLENBQUEsS0FBYyxDQUh4Qjs7TUFJRixLQUFBLEdBQVEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFiLEVBQW1CLFFBQW5CO01BQ1IsSUFBRyxTQUFBLEtBQWEsSUFBaEI7UUFDRSxTQUFBLEdBQVksTUFEZDtPQUFBLE1BQUE7UUFHRSxFQUFBLEdBQUssSUFBQyxDQUFBLGVBQUQsQ0FBaUIsS0FBakI7UUFDTCxHQUFBLEdBQU0sSUFBQyxDQUFBLGVBQUQsQ0FBaUIsU0FBakI7UUFDTixJQUFHLEVBQUEsR0FBSyxHQUFSO1VBQ0UsU0FBQSxHQUFZLE1BRGQ7U0FBQSxNQUVLLElBQUcsRUFBQSxLQUFNLEdBQVQ7VUFFSCxJQUFHLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFBLEdBQWdCLENBQTNCLENBQUEsS0FBaUMsQ0FBcEM7WUFDRSxTQUFBLEdBQVksTUFEZDtXQUZHO1NBUFA7O0FBUEY7QUFrQkEsV0FBTztFQXBCUTs7cUJBc0JqQixXQUFBLEdBQWEsU0FBQyxLQUFELEVBQVEsV0FBUjtBQUNYLFFBQUE7O01BRG1CLGNBQWM7O0lBQ2pDLE1BQUEsR0FBUztBQUNULFNBQUEsYUFBQTs7TUFDRSxNQUFPLENBQUEsSUFBQSxDQUFQLEdBQWU7QUFDZixXQUFBLHVDQUFBOztRQUNFLEtBQUEsR0FBUTtBQUNSLGFBQUEsd0NBQUE7O1VBQ0UsSUFBQSxHQUFPLElBQUksSUFBSixDQUFTLEdBQVQ7VUFDUCxLQUFLLENBQUMsSUFBTixDQUFXLElBQUksQ0FBQyxJQUFoQjtBQUZGO1FBR0EsTUFBTyxDQUFBLElBQUEsQ0FBSyxDQUFDLElBQWIsQ0FBa0IsS0FBbEI7QUFMRjtBQUZGO0lBUUEsSUFBRyxXQUFIO01BQ0UsQ0FBQSxHQUFJO0FBQ0osV0FBQSxrQkFBQTs7UUFDRSxDQUFBLElBQUssVUFBQSxHQUFVLENBQUMsZ0JBQUEsQ0FBaUIsUUFBakIsQ0FBRCxDQUFWLEdBQXNDO1FBQzNDLElBQUcsUUFBQSxLQUFZLE9BQWY7VUFDRSxDQUFBLElBQUssWUFBQSxHQUFZLENBQUMsTUFBTSxDQUFDLEdBQVAsQ0FBVyxTQUFDLENBQUQ7bUJBQU8sQ0FBRSxDQUFBLENBQUE7VUFBVCxDQUFYLENBQXVCLENBQUMsSUFBeEIsQ0FBNkIsR0FBN0IsQ0FBRCxDQUFaLEdBQStDLEtBRHREO1NBQUEsTUFBQTtBQUdFLGVBQUEsMENBQUE7O1lBQ0UsQ0FBQSxJQUFLLFlBQUEsR0FBWSxDQUFDLENBQUMsQ0FBQyxJQUFGLENBQU8sR0FBUCxDQUFELENBQVosR0FBeUI7QUFEaEMsV0FIRjs7QUFGRjtBQU9BLGFBQU8sRUFUVDs7QUFVQSxXQUFPLElBQUksQ0FBQyxTQUFMLENBQWUsTUFBZjtFQXBCSTs7cUJBc0JiLFdBQUEsR0FBYSxTQUFDLElBQUQ7QUFDWCxRQUFBO0lBQUEsT0FBQSxHQUFVO0FBQ1YsU0FBQSx3Q0FBQTs7TUFDRSxJQUFHLE9BQUEsR0FBVSxDQUFiO1FBQ0UsT0FBQSxHQUFVLEVBRFo7O0FBREY7QUFHQSxXQUFPO0VBTEk7O3FCQU9iLGNBQUEsR0FBZ0IsU0FBQyxLQUFEO0FBQ2QsUUFBQTtBQUFBLFNBQUEsaUJBQUE7O0FBQ0UsV0FBQSw0Q0FBQTs7UUFDRSxJQUFHLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBWCxDQUFIO0FBQ0UsaUJBQU8sS0FEVDs7QUFERjtBQURGO0lBS0EsT0FBTyxDQUFDLEdBQVIsQ0FBWSxtREFBWjtBQUNBLFdBQU87RUFQTzs7cUJBZ0JoQixNQUFBLEdBS0U7SUFBQSxNQUFBLEVBQ0U7TUFBQSxFQUFBLEVBQU0sUUFBTjtNQUNBLElBQUEsRUFBTSxRQUROO01BSUEsSUFBQSxFQUFNLFNBQUMsYUFBRCxFQUFnQixXQUFoQixFQUE2QixjQUE3QjtBQUNKLFlBQUE7UUFBQSxJQUFHLGFBQWEsQ0FBQyxJQUFqQjtVQUNFLElBQUcsSUFBQyxDQUFBLFdBQUQsQ0FBYSxXQUFiLENBQUEsSUFBOEIsSUFBQyxDQUFBLFVBQUQsQ0FBWSxhQUFhLENBQUMsSUFBMUIsQ0FBakM7WUFDRSxZQUFBLEdBQWUsSUFBQyxDQUFBLFlBQUQsQ0FBYyxhQUFhLENBQUMsSUFBNUI7QUFDZixpQkFBQSx3QkFBQTs7Y0FDRSxJQUFHLENBQUMsUUFBUSxDQUFDLEtBQVQsQ0FBZSxNQUFmLENBQUEsSUFBMEIsQ0FBQyxRQUFBLEtBQVksT0FBYixDQUEzQixDQUFBLElBQXNELENBQUMsUUFBUSxDQUFDLE1BQVQsR0FBa0IsQ0FBbkIsQ0FBekQ7Z0JBQ0UsSUFBQyxDQUFBLEtBQUQsQ0FBTyxZQUFQO2dCQUNBLElBQUcsSUFBQyxDQUFBLE1BQUQsQ0FBUSxhQUFSLEVBQXVCLFFBQVMsQ0FBQSxDQUFBLENBQWhDLENBQUEsS0FBdUMsRUFBMUM7QUFDRSx5QkFBTyxHQURUO2lCQUZGOztBQURGLGFBRkY7O1VBUUEsSUFBQyxDQUFBLEtBQUQsQ0FBTyx1Q0FBUDtBQUNBLGlCQUFPLElBQUMsQ0FBQSxNQUFELENBQVEsYUFBUixFQVZUOztRQVlBLEtBQUEsR0FBUSxJQUFDLENBQUEsZUFBRCxDQUFpQixhQUFhLENBQUMsSUFBL0I7UUFDUixJQUFDLENBQUEsS0FBRCxDQUFPLGNBQUEsR0FBYyxDQUFDLElBQUMsQ0FBQSxXQUFELENBQWEsS0FBYixDQUFELENBQXJCO1FBRUEsSUFBRyxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sS0FBZ0IsQ0FBbkI7VUFDRSxJQUFBLEdBQU8sSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsS0FBaEI7VUFDUCxJQUFDLENBQUEsS0FBRCxDQUFPLG9DQUFQO1VBQ0EsSUFBRyxJQUFDLENBQUEsTUFBRCxDQUFRLGFBQVIsRUFBdUIsSUFBdkIsQ0FBQSxLQUFnQyxFQUFuQztBQUNFLG1CQUFPLEdBRFQ7V0FIRjs7UUFNQSxJQUFHLFdBQUEsSUFBZ0IsQ0FBSSxjQUF2QjtVQUNFLElBQUcsaUNBQUEsSUFBNkIsQ0FBQyxLQUFNLENBQUEsV0FBVyxDQUFDLElBQVosQ0FBaUIsQ0FBQyxNQUF4QixHQUFpQyxDQUFsQyxDQUFoQztBQUNFO0FBQUEsaUJBQUEsdUNBQUE7O2NBQ0UsSUFBRyxJQUFDLENBQUEsV0FBRCxDQUFhLElBQWIsQ0FBQSxHQUFxQixXQUFXLENBQUMsSUFBcEM7Z0JBQ0UsSUFBRyxJQUFDLENBQUEsTUFBRCxDQUFRLGFBQVIsRUFBdUIsSUFBdkIsQ0FBQSxLQUFnQyxFQUFuQztBQUNFLHlCQUFPLEdBRFQ7aUJBREY7O0FBREY7WUFJQSxJQUFDLENBQUEsS0FBRCxDQUFPLDZDQUFQO0FBQ0EsbUJBQU8sSUFBQyxDQUFBLE1BQUQsQ0FBUSxhQUFSLEVBTlQ7V0FBQSxNQUFBO1lBUUUsSUFBQyxDQUFBLEtBQUQsQ0FBTyxpQ0FBUDtBQUNBLG1CQUFPLElBQUMsQ0FBQSxNQUFELENBQVEsYUFBUixFQVRUO1dBREY7U0FBQSxNQUFBO1VBYUUsSUFBQyxDQUFBLEtBQUQsQ0FBTywyQ0FBUDtVQUNBLFNBQUEsR0FBWSxNQUFNLENBQUMsSUFBUCxDQUFZLEtBQVo7VUFDWixhQUFBLEdBQWdCLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFBLEdBQWdCLFNBQVMsQ0FBQyxNQUFyQztVQUNoQixJQUFHLElBQUMsQ0FBQSxNQUFELENBQVEsYUFBUixFQUF1QixLQUFNLENBQUEsU0FBVSxDQUFBLGFBQUEsQ0FBVixDQUEwQixDQUFBLENBQUEsQ0FBdkQsQ0FBQSxLQUE4RCxFQUFqRTtBQUNFLG1CQUFPLEdBRFQ7V0FoQkY7O0FBb0JBO0FBQUEsYUFBQSx3Q0FBQTs7VUFDRSxJQUFHLE9BQUEsR0FBVSxXQUFXLENBQUMsSUFBekI7WUFDRSxJQUFDLENBQUEsS0FBRCxDQUFPLHlCQUFBLEdBQTBCLE9BQTFCLEdBQWtDLFlBQXpDO1lBQ0EsSUFBRyxJQUFDLENBQUEsTUFBRCxDQUFRLGFBQVIsRUFBdUIsQ0FBQyxPQUFELENBQXZCLENBQUEsS0FBcUMsRUFBeEM7QUFDRSxxQkFBTyxHQURUOztBQUVBLGtCQUpGOztBQURGO1FBT0EsSUFBQyxDQUFBLEtBQUQsQ0FBTyw2QkFBUDtBQUNBLGVBQU8sSUFBQyxDQUFBLE1BQUQsQ0FBUSxhQUFSO01BbERILENBSk47S0FERjs7Ozs7OztBQTRESixLQUFBLEdBQVEsU0FBQTtBQUNOLE1BQUE7RUFBQSxJQUFBLEdBQU8sSUFBSSxRQUFKLENBQUE7RUFDUCxXQUFBLEdBQWM7RUFDZCxhQUFBLEdBQWdCO0FBRWhCLE9BQWUsa0dBQWY7SUFDRSxJQUFBLEdBQU8sSUFBSSxZQUFKLENBQUE7SUFDUCxJQUFBLEdBQU87QUFDUCxTQUFTLDBCQUFUO01BQ0UsR0FBQSxHQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBWCxDQUFBO01BQ04sSUFBSSxDQUFDLElBQUwsQ0FBVSxHQUFWO0FBRkY7SUFLQSxJQUFJLENBQUMsSUFBTCxDQUFVLFNBQUMsQ0FBRCxFQUFHLENBQUg7QUFBUyxhQUFPLENBQUEsR0FBSTtJQUFwQixDQUFWO0lBRUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSwwRUFBWjtJQUNBLE9BQU8sQ0FBQyxHQUFSLENBQVksT0FBQSxHQUFPLENBQUMsT0FBQSxHQUFRLENBQVQsQ0FBUCxHQUFrQixJQUFsQixHQUFxQixDQUFDLGFBQUEsQ0FBYyxJQUFkLENBQUQsQ0FBakM7SUFDQSxPQUFPLENBQUMsR0FBUixDQUFZLEVBQVo7SUFFQSxnQkFBQSxHQUFtQjtBQUNuQixTQUFZLGdDQUFaO01BQ0UsUUFBQSxHQUNFO1FBQUEsU0FBQSxFQUFXLENBQUMsSUFBQSxHQUFPLENBQVIsQ0FBQSxLQUFjLENBQXpCO1FBQ0EsV0FBQSxFQUFhLENBQUMsSUFBQSxHQUFPLENBQVIsQ0FBQSxLQUFjLENBRDNCO1FBRUEsT0FBQSxFQUFTLENBQUMsSUFBQSxHQUFPLENBQVIsQ0FBQSxLQUFjLENBRnZCO1FBR0EsUUFBQSxFQUFVLENBQUMsSUFBQSxHQUFPLENBQVIsQ0FBQSxLQUFjLENBSHhCOztNQUlGLEtBQUEsR0FBUSxJQUFJLENBQUMsV0FBTCxDQUFpQixJQUFqQixFQUF1QixRQUF2QjtNQUVSLE9BQU8sQ0FBQyxHQUFSLENBQVksaUJBQUEsR0FBaUIsQ0FBQyxJQUFJLENBQUMsU0FBTCxDQUFlLFFBQWYsQ0FBRCxDQUE3QjtNQUNBLE9BQU8sQ0FBQyxHQUFSLENBQVksSUFBSSxDQUFDLFdBQUwsQ0FBaUIsS0FBakIsRUFBd0IsSUFBeEIsQ0FBWjtNQUVBLElBQUcsQ0FBSSxLQUFLLENBQUMsS0FBYjtRQUNFLGdCQUFBLEdBQW1CLEtBRHJCOztBQVhGO0lBY0EsSUFBRyxnQkFBSDtNQUNFLFdBQUEsSUFBZSxFQURqQjs7QUE3QkY7U0FnQ0EsT0FBTyxDQUFDLEdBQVIsQ0FBWSxlQUFBLEdBQWdCLFdBQWhCLEdBQTRCLEtBQTVCLEdBQWlDLGFBQTdDO0FBckNNOztBQTRDUixNQUFNLENBQUMsT0FBUCxHQUNFO0VBQUEsSUFBQSxFQUFNLElBQU47RUFDQSxRQUFBLEVBQVUsUUFEVjtFQUVBLEVBQUEsRUFBSSxFQUZKO0VBR0EsWUFBQSxFQUFjLFlBSGQ7RUFJQSxnQkFBQSxFQUFrQixnQkFKbEI7RUFLQSxlQUFBLEVBQWlCLGVBTGpCOzs7OztBQy9yQ0YsTUFBTSxDQUFDLE9BQVAsR0FDRTtFQUFBLFVBQUEsRUFDRTtJQUFBLE1BQUEsRUFBUSxFQUFSO0lBQ0EsTUFBQSxFQUNFO01BQUEsSUFBQSxFQUFPO1FBQUUsQ0FBQSxFQUFLLENBQVA7UUFBVSxDQUFBLEVBQUssQ0FBZjtRQUFrQixLQUFBLEVBQVEsRUFBMUI7UUFBOEIsTUFBQSxFQUFTLEVBQXZDO1FBQTJDLE9BQUEsRUFBVyxDQUF0RDtRQUF5RCxPQUFBLEVBQVUsRUFBbkU7UUFBdUUsUUFBQSxFQUFXLEVBQWxGO09BQVA7TUFDQSxJQUFBLEVBQU87UUFBRSxDQUFBLEVBQUssQ0FBUDtRQUFVLENBQUEsRUFBSSxFQUFkO1FBQWtCLEtBQUEsRUFBUSxFQUExQjtRQUE4QixNQUFBLEVBQVMsRUFBdkM7UUFBMkMsT0FBQSxFQUFXLENBQXREO1FBQXlELE9BQUEsRUFBVSxFQUFuRTtRQUF1RSxRQUFBLEVBQVcsRUFBbEY7T0FEUDtNQUVBLElBQUEsRUFBTztRQUFFLENBQUEsRUFBSSxFQUFOO1FBQVUsQ0FBQSxFQUFLLENBQWY7UUFBa0IsS0FBQSxFQUFRLEVBQTFCO1FBQThCLE1BQUEsRUFBUyxFQUF2QztRQUEyQyxPQUFBLEVBQVcsQ0FBdEQ7UUFBeUQsT0FBQSxFQUFVLEVBQW5FO1FBQXVFLFFBQUEsRUFBVyxFQUFsRjtPQUZQO01BR0EsS0FBQSxFQUFPO1FBQUUsQ0FBQSxFQUFLLENBQVA7UUFBVSxDQUFBLEVBQUcsR0FBYjtRQUFrQixLQUFBLEVBQVEsRUFBMUI7UUFBOEIsTUFBQSxFQUFTLEVBQXZDO1FBQTJDLE9BQUEsRUFBVyxDQUF0RDtRQUF5RCxPQUFBLEVBQVUsRUFBbkU7UUFBdUUsUUFBQSxFQUFXLEVBQWxGO09BSFA7TUFJQSxLQUFBLEVBQU87UUFBRSxDQUFBLEVBQUssQ0FBUDtRQUFVLENBQUEsRUFBRyxHQUFiO1FBQWtCLEtBQUEsRUFBUSxFQUExQjtRQUE4QixNQUFBLEVBQVMsRUFBdkM7UUFBMkMsT0FBQSxFQUFXLENBQXREO1FBQXlELE9BQUEsRUFBVSxFQUFuRTtRQUF1RSxRQUFBLEVBQVcsRUFBbEY7T0FKUDtNQUtBLEtBQUEsRUFBTztRQUFFLENBQUEsRUFBSyxDQUFQO1FBQVUsQ0FBQSxFQUFHLEdBQWI7UUFBa0IsS0FBQSxFQUFRLEVBQTFCO1FBQThCLE1BQUEsRUFBUyxFQUF2QztRQUEyQyxPQUFBLEVBQVcsQ0FBdEQ7UUFBeUQsT0FBQSxFQUFVLEVBQW5FO1FBQXVFLFFBQUEsRUFBVyxFQUFsRjtPQUxQO01BTUEsS0FBQSxFQUFPO1FBQUUsQ0FBQSxFQUFLLENBQVA7UUFBVSxDQUFBLEVBQUcsR0FBYjtRQUFrQixLQUFBLEVBQVEsRUFBMUI7UUFBOEIsTUFBQSxFQUFTLEVBQXZDO1FBQTJDLE9BQUEsRUFBVyxDQUF0RDtRQUF5RCxPQUFBLEVBQVUsRUFBbkU7UUFBdUUsUUFBQSxFQUFXLEVBQWxGO09BTlA7TUFPQSxLQUFBLEVBQU87UUFBRSxDQUFBLEVBQUssQ0FBUDtRQUFVLENBQUEsRUFBRyxHQUFiO1FBQWtCLEtBQUEsRUFBUSxFQUExQjtRQUE4QixNQUFBLEVBQVMsRUFBdkM7UUFBMkMsT0FBQSxFQUFXLENBQXREO1FBQXlELE9BQUEsRUFBVSxFQUFuRTtRQUF1RSxRQUFBLEVBQVcsRUFBbEY7T0FQUDtNQVFBLEtBQUEsRUFBTztRQUFFLENBQUEsRUFBSyxDQUFQO1FBQVUsQ0FBQSxFQUFHLEdBQWI7UUFBa0IsS0FBQSxFQUFRLEVBQTFCO1FBQThCLE1BQUEsRUFBUyxFQUF2QztRQUEyQyxPQUFBLEVBQVcsQ0FBdEQ7UUFBeUQsT0FBQSxFQUFVLEVBQW5FO1FBQXVFLFFBQUEsRUFBVyxFQUFsRjtPQVJQO01BU0EsS0FBQSxFQUFPO1FBQUUsQ0FBQSxFQUFLLENBQVA7UUFBVSxDQUFBLEVBQUcsR0FBYjtRQUFrQixLQUFBLEVBQVEsRUFBMUI7UUFBOEIsTUFBQSxFQUFTLEVBQXZDO1FBQTJDLE9BQUEsRUFBVyxDQUF0RDtRQUF5RCxPQUFBLEVBQVUsRUFBbkU7UUFBdUUsUUFBQSxFQUFXLEVBQWxGO09BVFA7TUFVQSxLQUFBLEVBQU87UUFBRSxDQUFBLEVBQUksRUFBTjtRQUFVLENBQUEsRUFBRyxHQUFiO1FBQWtCLEtBQUEsRUFBUSxFQUExQjtRQUE4QixNQUFBLEVBQVMsRUFBdkM7UUFBMkMsT0FBQSxFQUFXLENBQXREO1FBQXlELE9BQUEsRUFBVSxFQUFuRTtRQUF1RSxRQUFBLEVBQVcsRUFBbEY7T0FWUDtNQVdBLEtBQUEsRUFBTztRQUFFLENBQUEsRUFBSSxFQUFOO1FBQVUsQ0FBQSxFQUFHLEdBQWI7UUFBa0IsS0FBQSxFQUFRLEVBQTFCO1FBQThCLE1BQUEsRUFBUyxFQUF2QztRQUEyQyxPQUFBLEVBQVcsQ0FBdEQ7UUFBeUQsT0FBQSxFQUFVLEVBQW5FO1FBQXVFLFFBQUEsRUFBVyxFQUFsRjtPQVhQO01BWUEsS0FBQSxFQUFPO1FBQUUsQ0FBQSxFQUFJLEVBQU47UUFBVSxDQUFBLEVBQUcsR0FBYjtRQUFrQixLQUFBLEVBQVEsRUFBMUI7UUFBOEIsTUFBQSxFQUFTLEVBQXZDO1FBQTJDLE9BQUEsRUFBVyxDQUF0RDtRQUF5RCxPQUFBLEVBQVUsRUFBbkU7UUFBdUUsUUFBQSxFQUFXLEVBQWxGO09BWlA7TUFhQSxLQUFBLEVBQU87UUFBRSxDQUFBLEVBQUksRUFBTjtRQUFVLENBQUEsRUFBRyxHQUFiO1FBQWtCLEtBQUEsRUFBUSxFQUExQjtRQUE4QixNQUFBLEVBQVMsRUFBdkM7UUFBMkMsT0FBQSxFQUFXLENBQXREO1FBQXlELE9BQUEsRUFBVSxFQUFuRTtRQUF1RSxRQUFBLEVBQVcsRUFBbEY7T0FiUDtNQWNBLEtBQUEsRUFBTztRQUFFLENBQUEsRUFBSSxFQUFOO1FBQVUsQ0FBQSxFQUFHLEdBQWI7UUFBa0IsS0FBQSxFQUFRLEVBQTFCO1FBQThCLE1BQUEsRUFBUyxFQUF2QztRQUEyQyxPQUFBLEVBQVcsQ0FBdEQ7UUFBeUQsT0FBQSxFQUFVLEVBQW5FO1FBQXVFLFFBQUEsRUFBVyxFQUFsRjtPQWRQO01BZUEsS0FBQSxFQUFPO1FBQUUsQ0FBQSxFQUFJLEVBQU47UUFBVSxDQUFBLEVBQUksRUFBZDtRQUFrQixLQUFBLEVBQVEsRUFBMUI7UUFBOEIsTUFBQSxFQUFTLEVBQXZDO1FBQTJDLE9BQUEsRUFBVyxDQUF0RDtRQUF5RCxPQUFBLEVBQVUsRUFBbkU7UUFBdUUsUUFBQSxFQUFXLEVBQWxGO09BZlA7TUFnQkEsS0FBQSxFQUFPO1FBQUUsQ0FBQSxFQUFJLEVBQU47UUFBVSxDQUFBLEVBQUcsR0FBYjtRQUFrQixLQUFBLEVBQVEsRUFBMUI7UUFBOEIsTUFBQSxFQUFTLEVBQXZDO1FBQTJDLE9BQUEsRUFBVyxDQUF0RDtRQUF5RCxPQUFBLEVBQVUsRUFBbkU7UUFBdUUsUUFBQSxFQUFXLEVBQWxGO09BaEJQO01BaUJBLEtBQUEsRUFBTztRQUFFLENBQUEsRUFBSSxFQUFOO1FBQVUsQ0FBQSxFQUFLLENBQWY7UUFBa0IsS0FBQSxFQUFRLEVBQTFCO1FBQThCLE1BQUEsRUFBUyxFQUF2QztRQUEyQyxPQUFBLEVBQVcsQ0FBdEQ7UUFBeUQsT0FBQSxFQUFVLEVBQW5FO1FBQXVFLFFBQUEsRUFBVyxFQUFsRjtPQWpCUDtNQWtCQSxLQUFBLEVBQU87UUFBRSxDQUFBLEVBQUksRUFBTjtRQUFVLENBQUEsRUFBRyxHQUFiO1FBQWtCLEtBQUEsRUFBUSxFQUExQjtRQUE4QixNQUFBLEVBQVMsRUFBdkM7UUFBMkMsT0FBQSxFQUFXLENBQXREO1FBQXlELE9BQUEsRUFBVSxFQUFuRTtRQUF1RSxRQUFBLEVBQVcsRUFBbEY7T0FsQlA7TUFtQkEsS0FBQSxFQUFPO1FBQUUsQ0FBQSxFQUFJLEVBQU47UUFBVSxDQUFBLEVBQUcsR0FBYjtRQUFrQixLQUFBLEVBQVEsRUFBMUI7UUFBOEIsTUFBQSxFQUFTLEVBQXZDO1FBQTJDLE9BQUEsRUFBVyxDQUF0RDtRQUF5RCxPQUFBLEVBQVUsRUFBbkU7UUFBdUUsUUFBQSxFQUFXLEVBQWxGO09BbkJQO01Bb0JBLEtBQUEsRUFBTztRQUFFLENBQUEsRUFBSSxFQUFOO1FBQVUsQ0FBQSxFQUFHLEdBQWI7UUFBa0IsS0FBQSxFQUFRLEVBQTFCO1FBQThCLE1BQUEsRUFBUyxFQUF2QztRQUEyQyxPQUFBLEVBQVcsQ0FBdEQ7UUFBeUQsT0FBQSxFQUFVLEVBQW5FO1FBQXVFLFFBQUEsRUFBVyxFQUFsRjtPQXBCUDtNQXFCQSxLQUFBLEVBQU87UUFBRSxDQUFBLEVBQUksRUFBTjtRQUFVLENBQUEsRUFBRyxHQUFiO1FBQWtCLEtBQUEsRUFBUSxFQUExQjtRQUE4QixNQUFBLEVBQVMsRUFBdkM7UUFBMkMsT0FBQSxFQUFXLENBQXREO1FBQXlELE9BQUEsRUFBVSxFQUFuRTtRQUF1RSxRQUFBLEVBQVcsRUFBbEY7T0FyQlA7TUFzQkEsS0FBQSxFQUFPO1FBQUUsQ0FBQSxFQUFHLEdBQUw7UUFBVSxDQUFBLEVBQUcsR0FBYjtRQUFrQixLQUFBLEVBQVEsRUFBMUI7UUFBOEIsTUFBQSxFQUFTLEVBQXZDO1FBQTJDLE9BQUEsRUFBVyxDQUF0RDtRQUF5RCxPQUFBLEVBQVUsRUFBbkU7UUFBdUUsUUFBQSxFQUFXLEVBQWxGO09BdEJQO01BdUJBLEtBQUEsRUFBTztRQUFFLENBQUEsRUFBRyxHQUFMO1FBQVUsQ0FBQSxFQUFHLEdBQWI7UUFBa0IsS0FBQSxFQUFRLEVBQTFCO1FBQThCLE1BQUEsRUFBUyxFQUF2QztRQUEyQyxPQUFBLEVBQVcsQ0FBdEQ7UUFBeUQsT0FBQSxFQUFVLEVBQW5FO1FBQXVFLFFBQUEsRUFBVyxFQUFsRjtPQXZCUDtNQXdCQSxLQUFBLEVBQU87UUFBRSxDQUFBLEVBQUcsR0FBTDtRQUFVLENBQUEsRUFBRyxHQUFiO1FBQWtCLEtBQUEsRUFBUSxFQUExQjtRQUE4QixNQUFBLEVBQVMsRUFBdkM7UUFBMkMsT0FBQSxFQUFXLENBQXREO1FBQXlELE9BQUEsRUFBVSxFQUFuRTtRQUF1RSxRQUFBLEVBQVcsRUFBbEY7T0F4QlA7TUF5QkEsS0FBQSxFQUFPO1FBQUUsQ0FBQSxFQUFHLEdBQUw7UUFBVSxDQUFBLEVBQUcsR0FBYjtRQUFrQixLQUFBLEVBQVEsRUFBMUI7UUFBOEIsTUFBQSxFQUFTLEVBQXZDO1FBQTJDLE9BQUEsRUFBVyxDQUF0RDtRQUF5RCxPQUFBLEVBQVUsRUFBbkU7UUFBdUUsUUFBQSxFQUFXLEVBQWxGO09BekJQO01BMEJBLElBQUEsRUFBTztRQUFFLENBQUEsRUFBSSxFQUFOO1FBQVUsQ0FBQSxFQUFJLEVBQWQ7UUFBa0IsS0FBQSxFQUFRLEVBQTFCO1FBQThCLE1BQUEsRUFBUyxFQUF2QztRQUEyQyxPQUFBLEVBQVcsQ0FBdEQ7UUFBeUQsT0FBQSxFQUFVLEVBQW5FO1FBQXVFLFFBQUEsRUFBVyxFQUFsRjtPQTFCUDtNQTJCQSxJQUFBLEVBQU87UUFBRSxDQUFBLEVBQUksRUFBTjtRQUFVLENBQUEsRUFBRyxHQUFiO1FBQWtCLEtBQUEsRUFBUSxFQUExQjtRQUE4QixNQUFBLEVBQVMsRUFBdkM7UUFBMkMsT0FBQSxFQUFXLENBQXREO1FBQXlELE9BQUEsRUFBVSxFQUFuRTtRQUF1RSxRQUFBLEVBQVcsRUFBbEY7T0EzQlA7TUE0QkEsSUFBQSxFQUFPO1FBQUUsQ0FBQSxFQUFJLEVBQU47UUFBVSxDQUFBLEVBQUcsR0FBYjtRQUFrQixLQUFBLEVBQVEsRUFBMUI7UUFBOEIsTUFBQSxFQUFTLEVBQXZDO1FBQTJDLE9BQUEsRUFBVyxDQUF0RDtRQUF5RCxPQUFBLEVBQVUsRUFBbkU7UUFBdUUsUUFBQSxFQUFXLEVBQWxGO09BNUJQO01BNkJBLElBQUEsRUFBTztRQUFFLENBQUEsRUFBSSxFQUFOO1FBQVUsQ0FBQSxFQUFHLEdBQWI7UUFBa0IsS0FBQSxFQUFRLEVBQTFCO1FBQThCLE1BQUEsRUFBUyxFQUF2QztRQUEyQyxPQUFBLEVBQVcsQ0FBdEQ7UUFBeUQsT0FBQSxFQUFVLEVBQW5FO1FBQXVFLFFBQUEsRUFBVyxFQUFsRjtPQTdCUDtNQThCQSxJQUFBLEVBQU87UUFBRSxDQUFBLEVBQUcsR0FBTDtRQUFVLENBQUEsRUFBSyxDQUFmO1FBQWtCLEtBQUEsRUFBUSxFQUExQjtRQUE4QixNQUFBLEVBQVMsRUFBdkM7UUFBMkMsT0FBQSxFQUFXLENBQXREO1FBQXlELE9BQUEsRUFBVSxFQUFuRTtRQUF1RSxRQUFBLEVBQVcsRUFBbEY7T0E5QlA7TUErQkEsSUFBQSxFQUFPO1FBQUUsQ0FBQSxFQUFHLEdBQUw7UUFBVSxDQUFBLEVBQUksRUFBZDtRQUFrQixLQUFBLEVBQVEsRUFBMUI7UUFBOEIsTUFBQSxFQUFTLEVBQXZDO1FBQTJDLE9BQUEsRUFBVyxDQUF0RDtRQUF5RCxPQUFBLEVBQVUsRUFBbkU7UUFBdUUsUUFBQSxFQUFXLEVBQWxGO09BL0JQO01BZ0NBLElBQUEsRUFBTztRQUFFLENBQUEsRUFBRyxHQUFMO1FBQVUsQ0FBQSxFQUFLLENBQWY7UUFBa0IsS0FBQSxFQUFRLEVBQTFCO1FBQThCLE1BQUEsRUFBUyxFQUF2QztRQUEyQyxPQUFBLEVBQVcsQ0FBdEQ7UUFBeUQsT0FBQSxFQUFVLEVBQW5FO1FBQXVFLFFBQUEsRUFBVyxFQUFsRjtPQWhDUDtNQWlDQSxJQUFBLEVBQU87UUFBRSxDQUFBLEVBQUcsR0FBTDtRQUFVLENBQUEsRUFBRyxHQUFiO1FBQWtCLEtBQUEsRUFBUSxFQUExQjtRQUE4QixNQUFBLEVBQVMsRUFBdkM7UUFBMkMsT0FBQSxFQUFXLENBQXREO1FBQXlELE9BQUEsRUFBVSxFQUFuRTtRQUF1RSxRQUFBLEVBQVcsRUFBbEY7T0FqQ1A7TUFrQ0EsSUFBQSxFQUFPO1FBQUUsQ0FBQSxFQUFHLEdBQUw7UUFBVSxDQUFBLEVBQUcsR0FBYjtRQUFrQixLQUFBLEVBQVEsRUFBMUI7UUFBOEIsTUFBQSxFQUFTLEVBQXZDO1FBQTJDLE9BQUEsRUFBVyxDQUF0RDtRQUF5RCxPQUFBLEVBQVUsRUFBbkU7UUFBdUUsUUFBQSxFQUFXLEVBQWxGO09BbENQO01BbUNBLElBQUEsRUFBTztRQUFFLENBQUEsRUFBRyxHQUFMO1FBQVUsQ0FBQSxFQUFHLEdBQWI7UUFBa0IsS0FBQSxFQUFRLEVBQTFCO1FBQThCLE1BQUEsRUFBUyxFQUF2QztRQUEyQyxPQUFBLEVBQVcsQ0FBdEQ7UUFBeUQsT0FBQSxFQUFVLEVBQW5FO1FBQXVFLFFBQUEsRUFBVyxFQUFsRjtPQW5DUDtNQW9DQSxJQUFBLEVBQU87UUFBRSxDQUFBLEVBQUcsR0FBTDtRQUFVLENBQUEsRUFBRyxHQUFiO1FBQWtCLEtBQUEsRUFBUSxFQUExQjtRQUE4QixNQUFBLEVBQVMsRUFBdkM7UUFBMkMsT0FBQSxFQUFXLENBQXREO1FBQXlELE9BQUEsRUFBVSxFQUFuRTtRQUF1RSxRQUFBLEVBQVcsRUFBbEY7T0FwQ1A7TUFxQ0EsSUFBQSxFQUFPO1FBQUUsQ0FBQSxFQUFHLEdBQUw7UUFBVSxDQUFBLEVBQUcsR0FBYjtRQUFrQixLQUFBLEVBQVEsRUFBMUI7UUFBOEIsTUFBQSxFQUFTLEVBQXZDO1FBQTJDLE9BQUEsRUFBVyxDQUF0RDtRQUF5RCxPQUFBLEVBQVUsRUFBbkU7UUFBdUUsUUFBQSxFQUFXLEVBQWxGO09BckNQO01Bc0NBLElBQUEsRUFBTztRQUFFLENBQUEsRUFBRyxHQUFMO1FBQVUsQ0FBQSxFQUFHLEdBQWI7UUFBa0IsS0FBQSxFQUFRLEVBQTFCO1FBQThCLE1BQUEsRUFBUyxFQUF2QztRQUEyQyxPQUFBLEVBQVcsQ0FBdEQ7UUFBeUQsT0FBQSxFQUFVLEVBQW5FO1FBQXVFLFFBQUEsRUFBVyxFQUFsRjtPQXRDUDtNQXVDQSxJQUFBLEVBQU87UUFBRSxDQUFBLEVBQUcsR0FBTDtRQUFVLENBQUEsRUFBRyxHQUFiO1FBQWtCLEtBQUEsRUFBUSxFQUExQjtRQUE4QixNQUFBLEVBQVMsRUFBdkM7UUFBMkMsT0FBQSxFQUFXLENBQXREO1FBQXlELE9BQUEsRUFBVSxFQUFuRTtRQUF1RSxRQUFBLEVBQVcsRUFBbEY7T0F2Q1A7TUF3Q0EsSUFBQSxFQUFPO1FBQUUsQ0FBQSxFQUFHLEdBQUw7UUFBVSxDQUFBLEVBQUcsR0FBYjtRQUFrQixLQUFBLEVBQVEsRUFBMUI7UUFBOEIsTUFBQSxFQUFTLEVBQXZDO1FBQTJDLE9BQUEsRUFBVyxDQUF0RDtRQUF5RCxPQUFBLEVBQVUsRUFBbkU7UUFBdUUsUUFBQSxFQUFXLEVBQWxGO09BeENQO01BeUNBLElBQUEsRUFBTztRQUFFLENBQUEsRUFBRyxHQUFMO1FBQVUsQ0FBQSxFQUFJLEVBQWQ7UUFBa0IsS0FBQSxFQUFRLEVBQTFCO1FBQThCLE1BQUEsRUFBUyxFQUF2QztRQUEyQyxPQUFBLEVBQVcsQ0FBdEQ7UUFBeUQsT0FBQSxFQUFVLEVBQW5FO1FBQXVFLFFBQUEsRUFBVyxFQUFsRjtPQXpDUDtNQTBDQSxJQUFBLEVBQU87UUFBRSxDQUFBLEVBQUcsR0FBTDtRQUFVLENBQUEsRUFBRyxHQUFiO1FBQWtCLEtBQUEsRUFBUSxFQUExQjtRQUE4QixNQUFBLEVBQVMsRUFBdkM7UUFBMkMsT0FBQSxFQUFXLENBQXREO1FBQXlELE9BQUEsRUFBVSxFQUFuRTtRQUF1RSxRQUFBLEVBQVcsRUFBbEY7T0ExQ1A7TUEyQ0EsSUFBQSxFQUFPO1FBQUUsQ0FBQSxFQUFHLEdBQUw7UUFBVSxDQUFBLEVBQUssQ0FBZjtRQUFrQixLQUFBLEVBQVEsRUFBMUI7UUFBOEIsTUFBQSxFQUFTLEVBQXZDO1FBQTJDLE9BQUEsRUFBVyxDQUF0RDtRQUF5RCxPQUFBLEVBQVUsRUFBbkU7UUFBdUUsUUFBQSxFQUFXLEVBQWxGO09BM0NQO01BNENBLElBQUEsRUFBTztRQUFFLENBQUEsRUFBRyxHQUFMO1FBQVUsQ0FBQSxFQUFJLEVBQWQ7UUFBa0IsS0FBQSxFQUFRLEVBQTFCO1FBQThCLE1BQUEsRUFBUyxFQUF2QztRQUEyQyxPQUFBLEVBQVcsQ0FBdEQ7UUFBeUQsT0FBQSxFQUFVLEVBQW5FO1FBQXVFLFFBQUEsRUFBVyxFQUFsRjtPQTVDUDtNQTZDQSxJQUFBLEVBQU87UUFBRSxDQUFBLEVBQUcsR0FBTDtRQUFVLENBQUEsRUFBSyxDQUFmO1FBQWtCLEtBQUEsRUFBUSxFQUExQjtRQUE4QixNQUFBLEVBQVMsRUFBdkM7UUFBMkMsT0FBQSxFQUFXLENBQXREO1FBQXlELE9BQUEsRUFBVSxFQUFuRTtRQUF1RSxRQUFBLEVBQVcsRUFBbEY7T0E3Q1A7TUE4Q0EsSUFBQSxFQUFPO1FBQUUsQ0FBQSxFQUFHLEdBQUw7UUFBVSxDQUFBLEVBQUcsR0FBYjtRQUFrQixLQUFBLEVBQVEsRUFBMUI7UUFBOEIsTUFBQSxFQUFTLEVBQXZDO1FBQTJDLE9BQUEsRUFBVyxDQUF0RDtRQUF5RCxPQUFBLEVBQVUsRUFBbkU7UUFBdUUsUUFBQSxFQUFXLEVBQWxGO09BOUNQO01BK0NBLElBQUEsRUFBTztRQUFFLENBQUEsRUFBRyxHQUFMO1FBQVUsQ0FBQSxFQUFHLEdBQWI7UUFBa0IsS0FBQSxFQUFRLEVBQTFCO1FBQThCLE1BQUEsRUFBUyxFQUF2QztRQUEyQyxPQUFBLEVBQVcsQ0FBdEQ7UUFBeUQsT0FBQSxFQUFVLEVBQW5FO1FBQXVFLFFBQUEsRUFBVyxFQUFsRjtPQS9DUDtNQWdEQSxJQUFBLEVBQU87UUFBRSxDQUFBLEVBQUcsR0FBTDtRQUFVLENBQUEsRUFBSSxFQUFkO1FBQWtCLEtBQUEsRUFBUSxFQUExQjtRQUE4QixNQUFBLEVBQVMsRUFBdkM7UUFBMkMsT0FBQSxFQUFXLENBQXREO1FBQXlELE9BQUEsRUFBVSxFQUFuRTtRQUF1RSxRQUFBLEVBQVcsRUFBbEY7T0FoRFA7TUFpREEsSUFBQSxFQUFPO1FBQUUsQ0FBQSxFQUFHLEdBQUw7UUFBVSxDQUFBLEVBQUssQ0FBZjtRQUFrQixLQUFBLEVBQVEsRUFBMUI7UUFBOEIsTUFBQSxFQUFTLEVBQXZDO1FBQTJDLE9BQUEsRUFBVyxDQUF0RDtRQUF5RCxPQUFBLEVBQVUsRUFBbkU7UUFBdUUsUUFBQSxFQUFXLEVBQWxGO09BakRQO01Ba0RBLElBQUEsRUFBTztRQUFFLENBQUEsRUFBRyxHQUFMO1FBQVUsQ0FBQSxFQUFHLEdBQWI7UUFBa0IsS0FBQSxFQUFRLEVBQTFCO1FBQThCLE1BQUEsRUFBUyxFQUF2QztRQUEyQyxPQUFBLEVBQVcsQ0FBdEQ7UUFBeUQsT0FBQSxFQUFVLEVBQW5FO1FBQXVFLFFBQUEsRUFBVyxFQUFsRjtPQWxEUDtNQW1EQSxJQUFBLEVBQU87UUFBRSxDQUFBLEVBQUcsR0FBTDtRQUFVLENBQUEsRUFBRyxHQUFiO1FBQWtCLEtBQUEsRUFBUSxFQUExQjtRQUE4QixNQUFBLEVBQVMsRUFBdkM7UUFBMkMsT0FBQSxFQUFXLENBQXREO1FBQXlELE9BQUEsRUFBVSxFQUFuRTtRQUF1RSxRQUFBLEVBQVcsRUFBbEY7T0FuRFA7TUFvREEsSUFBQSxFQUFPO1FBQUUsQ0FBQSxFQUFHLEdBQUw7UUFBVSxDQUFBLEVBQUcsR0FBYjtRQUFrQixLQUFBLEVBQVEsRUFBMUI7UUFBOEIsTUFBQSxFQUFTLEVBQXZDO1FBQTJDLE9BQUEsRUFBVyxDQUF0RDtRQUF5RCxPQUFBLEVBQVUsRUFBbkU7UUFBdUUsUUFBQSxFQUFXLEVBQWxGO09BcERQO01BcURBLElBQUEsRUFBTztRQUFFLENBQUEsRUFBRyxHQUFMO1FBQVUsQ0FBQSxFQUFHLEdBQWI7UUFBa0IsS0FBQSxFQUFRLEVBQTFCO1FBQThCLE1BQUEsRUFBUyxFQUF2QztRQUEyQyxPQUFBLEVBQVcsQ0FBdEQ7UUFBeUQsT0FBQSxFQUFVLEVBQW5FO1FBQXVFLFFBQUEsRUFBVyxFQUFsRjtPQXJEUDtNQXNEQSxJQUFBLEVBQU87UUFBRSxDQUFBLEVBQUksRUFBTjtRQUFVLENBQUEsRUFBRyxHQUFiO1FBQWtCLEtBQUEsRUFBUyxDQUEzQjtRQUE4QixNQUFBLEVBQVUsQ0FBeEM7UUFBMkMsT0FBQSxFQUFXLENBQXREO1FBQXlELE9BQUEsRUFBVSxFQUFuRTtRQUF1RSxRQUFBLEVBQVcsRUFBbEY7T0F0RFA7TUF1REEsSUFBQSxFQUFPO1FBQUUsQ0FBQSxFQUFHLEdBQUw7UUFBVSxDQUFBLEVBQUcsR0FBYjtRQUFrQixLQUFBLEVBQVEsRUFBMUI7UUFBOEIsTUFBQSxFQUFTLEVBQXZDO1FBQTJDLE9BQUEsRUFBVyxDQUF0RDtRQUF5RCxPQUFBLEVBQVUsRUFBbkU7UUFBdUUsUUFBQSxFQUFXLEVBQWxGO09BdkRQO01Bd0RBLElBQUEsRUFBTztRQUFFLENBQUEsRUFBRyxHQUFMO1FBQVUsQ0FBQSxFQUFHLEdBQWI7UUFBa0IsS0FBQSxFQUFRLEVBQTFCO1FBQThCLE1BQUEsRUFBUyxFQUF2QztRQUEyQyxPQUFBLEVBQVcsQ0FBdEQ7UUFBeUQsT0FBQSxFQUFVLEVBQW5FO1FBQXVFLFFBQUEsRUFBVyxFQUFsRjtPQXhEUDtNQXlEQSxJQUFBLEVBQU87UUFBRSxDQUFBLEVBQUcsR0FBTDtRQUFVLENBQUEsRUFBRyxHQUFiO1FBQWtCLEtBQUEsRUFBUyxDQUEzQjtRQUE4QixNQUFBLEVBQVUsQ0FBeEM7UUFBMkMsT0FBQSxFQUFXLENBQXREO1FBQXlELE9BQUEsRUFBVSxFQUFuRTtRQUF1RSxRQUFBLEVBQVcsRUFBbEY7T0F6RFA7TUEwREEsSUFBQSxFQUFPO1FBQUUsQ0FBQSxFQUFHLEdBQUw7UUFBVSxDQUFBLEVBQUcsR0FBYjtRQUFrQixLQUFBLEVBQVEsRUFBMUI7UUFBOEIsTUFBQSxFQUFTLEVBQXZDO1FBQTJDLE9BQUEsRUFBVyxDQUF0RDtRQUF5RCxPQUFBLEVBQVUsRUFBbkU7UUFBdUUsUUFBQSxFQUFXLEVBQWxGO09BMURQO01BMkRBLElBQUEsRUFBTztRQUFFLENBQUEsRUFBRyxHQUFMO1FBQVUsQ0FBQSxFQUFHLEdBQWI7UUFBa0IsS0FBQSxFQUFRLEVBQTFCO1FBQThCLE1BQUEsRUFBUyxFQUF2QztRQUEyQyxPQUFBLEVBQVcsQ0FBdEQ7UUFBeUQsT0FBQSxFQUFVLEVBQW5FO1FBQXVFLFFBQUEsRUFBVyxFQUFsRjtPQTNEUDtNQTREQSxJQUFBLEVBQU87UUFBRSxDQUFBLEVBQUcsR0FBTDtRQUFVLENBQUEsRUFBRyxHQUFiO1FBQWtCLEtBQUEsRUFBUyxDQUEzQjtRQUE4QixNQUFBLEVBQVUsQ0FBeEM7UUFBMkMsT0FBQSxFQUFXLENBQXREO1FBQXlELE9BQUEsRUFBVSxFQUFuRTtRQUF1RSxRQUFBLEVBQVcsRUFBbEY7T0E1RFA7TUE2REEsSUFBQSxFQUFPO1FBQUUsQ0FBQSxFQUFHLEdBQUw7UUFBVSxDQUFBLEVBQUcsR0FBYjtRQUFrQixLQUFBLEVBQVEsRUFBMUI7UUFBOEIsTUFBQSxFQUFTLEVBQXZDO1FBQTJDLE9BQUEsRUFBVyxDQUF0RDtRQUF5RCxPQUFBLEVBQVUsRUFBbkU7UUFBdUUsUUFBQSxFQUFXLEVBQWxGO09BN0RQO01BOERBLElBQUEsRUFBTztRQUFFLENBQUEsRUFBRyxHQUFMO1FBQVUsQ0FBQSxFQUFHLEdBQWI7UUFBa0IsS0FBQSxFQUFRLEVBQTFCO1FBQThCLE1BQUEsRUFBUyxFQUF2QztRQUEyQyxPQUFBLEVBQVcsQ0FBdEQ7UUFBeUQsT0FBQSxFQUFVLEVBQW5FO1FBQXVFLFFBQUEsRUFBVyxFQUFsRjtPQTlEUDtNQStEQSxJQUFBLEVBQU87UUFBRSxDQUFBLEVBQUcsR0FBTDtRQUFVLENBQUEsRUFBSSxFQUFkO1FBQWtCLEtBQUEsRUFBUSxFQUExQjtRQUE4QixNQUFBLEVBQVMsRUFBdkM7UUFBMkMsT0FBQSxFQUFXLENBQXREO1FBQXlELE9BQUEsRUFBVSxFQUFuRTtRQUF1RSxRQUFBLEVBQVcsRUFBbEY7T0EvRFA7TUFnRUEsSUFBQSxFQUFPO1FBQUUsQ0FBQSxFQUFHLEdBQUw7UUFBVSxDQUFBLEVBQUcsR0FBYjtRQUFrQixLQUFBLEVBQVEsRUFBMUI7UUFBOEIsTUFBQSxFQUFTLEVBQXZDO1FBQTJDLE9BQUEsRUFBVyxDQUF0RDtRQUF5RCxPQUFBLEVBQVUsRUFBbkU7UUFBdUUsUUFBQSxFQUFXLEVBQWxGO09BaEVQO01BaUVBLElBQUEsRUFBTztRQUFFLENBQUEsRUFBRyxHQUFMO1FBQVUsQ0FBQSxFQUFHLEdBQWI7UUFBa0IsS0FBQSxFQUFRLEVBQTFCO1FBQThCLE1BQUEsRUFBUyxFQUF2QztRQUEyQyxPQUFBLEVBQVcsQ0FBdEQ7UUFBeUQsT0FBQSxFQUFVLEVBQW5FO1FBQXVFLFFBQUEsRUFBVyxFQUFsRjtPQWpFUDtNQWtFQSxJQUFBLEVBQU87UUFBRSxDQUFBLEVBQUcsR0FBTDtRQUFVLENBQUEsRUFBSyxDQUFmO1FBQWtCLEtBQUEsRUFBUSxFQUExQjtRQUE4QixNQUFBLEVBQVMsRUFBdkM7UUFBMkMsT0FBQSxFQUFXLENBQXREO1FBQXlELE9BQUEsRUFBVSxFQUFuRTtRQUF1RSxRQUFBLEVBQVcsRUFBbEY7T0FsRVA7TUFtRUEsS0FBQSxFQUFPO1FBQUUsQ0FBQSxFQUFHLEdBQUw7UUFBVSxDQUFBLEVBQUcsR0FBYjtRQUFrQixLQUFBLEVBQVMsQ0FBM0I7UUFBOEIsTUFBQSxFQUFVLENBQXhDO1FBQTJDLE9BQUEsRUFBVyxDQUF0RDtRQUF5RCxPQUFBLEVBQVUsRUFBbkU7UUFBdUUsUUFBQSxFQUFXLEVBQWxGO09BbkVQO01Bb0VBLElBQUEsRUFBTztRQUFFLENBQUEsRUFBRyxHQUFMO1FBQVUsQ0FBQSxFQUFHLEdBQWI7UUFBa0IsS0FBQSxFQUFTLENBQTNCO1FBQThCLE1BQUEsRUFBVSxDQUF4QztRQUEyQyxPQUFBLEVBQVcsQ0FBdEQ7UUFBeUQsT0FBQSxFQUFVLEVBQW5FO1FBQXVFLFFBQUEsRUFBVyxFQUFsRjtPQXBFUDtNQXFFQSxJQUFBLEVBQU87UUFBRSxDQUFBLEVBQUcsR0FBTDtRQUFVLENBQUEsRUFBRyxHQUFiO1FBQWtCLEtBQUEsRUFBUSxFQUExQjtRQUE4QixNQUFBLEVBQVMsRUFBdkM7UUFBMkMsT0FBQSxFQUFXLENBQXREO1FBQXlELE9BQUEsRUFBVyxDQUFwRTtRQUF1RSxRQUFBLEVBQVcsRUFBbEY7T0FyRVA7TUFzRUEsSUFBQSxFQUFPO1FBQUUsQ0FBQSxFQUFHLEdBQUw7UUFBVSxDQUFBLEVBQUcsR0FBYjtRQUFrQixLQUFBLEVBQVMsQ0FBM0I7UUFBOEIsTUFBQSxFQUFVLENBQXhDO1FBQTJDLE9BQUEsRUFBVyxDQUF0RDtRQUF5RCxPQUFBLEVBQVUsRUFBbkU7UUFBdUUsUUFBQSxFQUFXLEVBQWxGO09BdEVQO01BdUVBLElBQUEsRUFBTztRQUFFLENBQUEsRUFBRyxHQUFMO1FBQVUsQ0FBQSxFQUFHLEdBQWI7UUFBa0IsS0FBQSxFQUFTLENBQTNCO1FBQThCLE1BQUEsRUFBVSxDQUF4QztRQUEyQyxPQUFBLEVBQVcsQ0FBdEQ7UUFBeUQsT0FBQSxFQUFVLEVBQW5FO1FBQXVFLFFBQUEsRUFBVyxFQUFsRjtPQXZFUDtNQXdFQSxJQUFBLEVBQU87UUFBRSxDQUFBLEVBQUcsR0FBTDtRQUFVLENBQUEsRUFBRyxHQUFiO1FBQWtCLEtBQUEsRUFBUSxFQUExQjtRQUE4QixNQUFBLEVBQVMsRUFBdkM7UUFBMkMsT0FBQSxFQUFXLENBQXREO1FBQXlELE9BQUEsRUFBVSxFQUFuRTtRQUF1RSxRQUFBLEVBQVcsRUFBbEY7T0F4RVA7TUF5RUEsSUFBQSxFQUFPO1FBQUUsQ0FBQSxFQUFHLEdBQUw7UUFBVSxDQUFBLEVBQUcsR0FBYjtRQUFrQixLQUFBLEVBQVMsQ0FBM0I7UUFBOEIsTUFBQSxFQUFVLENBQXhDO1FBQTJDLE9BQUEsRUFBVyxDQUF0RDtRQUF5RCxPQUFBLEVBQVUsRUFBbkU7UUFBdUUsUUFBQSxFQUFXLEVBQWxGO09BekVQO01BMEVBLElBQUEsRUFBTztRQUFFLENBQUEsRUFBRyxHQUFMO1FBQVUsQ0FBQSxFQUFHLEdBQWI7UUFBa0IsS0FBQSxFQUFTLENBQTNCO1FBQThCLE1BQUEsRUFBVSxDQUF4QztRQUEyQyxPQUFBLEVBQVcsQ0FBdEQ7UUFBeUQsT0FBQSxFQUFVLEVBQW5FO1FBQXVFLFFBQUEsRUFBVyxFQUFsRjtPQTFFUDtNQTJFQSxLQUFBLEVBQU87UUFBRSxDQUFBLEVBQUcsR0FBTDtRQUFVLENBQUEsRUFBRyxHQUFiO1FBQWtCLEtBQUEsRUFBUSxFQUExQjtRQUE4QixNQUFBLEVBQVMsRUFBdkM7UUFBMkMsT0FBQSxFQUFXLENBQXREO1FBQXlELE9BQUEsRUFBVSxFQUFuRTtRQUF1RSxRQUFBLEVBQVcsRUFBbEY7T0EzRVA7TUE0RUEsS0FBQSxFQUFPO1FBQUUsQ0FBQSxFQUFHLEdBQUw7UUFBVSxDQUFBLEVBQUcsR0FBYjtRQUFrQixLQUFBLEVBQVEsRUFBMUI7UUFBOEIsTUFBQSxFQUFTLEVBQXZDO1FBQTJDLE9BQUEsRUFBVyxDQUF0RDtRQUF5RCxPQUFBLEVBQVUsRUFBbkU7UUFBdUUsUUFBQSxFQUFXLEVBQWxGO09BNUVQO01BNkVBLElBQUEsRUFBTztRQUFFLENBQUEsRUFBRyxHQUFMO1FBQVUsQ0FBQSxFQUFHLEdBQWI7UUFBa0IsS0FBQSxFQUFRLEVBQTFCO1FBQThCLE1BQUEsRUFBUyxFQUF2QztRQUEyQyxPQUFBLEVBQVcsQ0FBdEQ7UUFBeUQsT0FBQSxFQUFVLEVBQW5FO1FBQXVFLFFBQUEsRUFBVyxFQUFsRjtPQTdFUDtNQThFQSxJQUFBLEVBQU87UUFBRSxDQUFBLEVBQUcsR0FBTDtRQUFVLENBQUEsRUFBRyxHQUFiO1FBQWtCLEtBQUEsRUFBUSxFQUExQjtRQUE4QixNQUFBLEVBQVMsRUFBdkM7UUFBMkMsT0FBQSxFQUFXLENBQXREO1FBQXlELE9BQUEsRUFBVSxFQUFuRTtRQUF1RSxRQUFBLEVBQVcsRUFBbEY7T0E5RVA7TUErRUEsSUFBQSxFQUFPO1FBQUUsQ0FBQSxFQUFHLEdBQUw7UUFBVSxDQUFBLEVBQUcsR0FBYjtRQUFrQixLQUFBLEVBQVEsRUFBMUI7UUFBOEIsTUFBQSxFQUFTLEVBQXZDO1FBQTJDLE9BQUEsRUFBVyxDQUF0RDtRQUF5RCxPQUFBLEVBQVUsRUFBbkU7UUFBdUUsUUFBQSxFQUFXLEVBQWxGO09BL0VQO01BZ0ZBLElBQUEsRUFBTztRQUFFLENBQUEsRUFBRyxHQUFMO1FBQVUsQ0FBQSxFQUFHLEdBQWI7UUFBa0IsS0FBQSxFQUFRLEVBQTFCO1FBQThCLE1BQUEsRUFBUyxFQUF2QztRQUEyQyxPQUFBLEVBQVcsQ0FBdEQ7UUFBeUQsT0FBQSxFQUFVLEVBQW5FO1FBQXVFLFFBQUEsRUFBVyxFQUFsRjtPQWhGUDtNQWlGQSxJQUFBLEVBQU87UUFBRSxDQUFBLEVBQUcsR0FBTDtRQUFVLENBQUEsRUFBRyxHQUFiO1FBQWtCLEtBQUEsRUFBUSxFQUExQjtRQUE4QixNQUFBLEVBQVMsRUFBdkM7UUFBMkMsT0FBQSxFQUFXLENBQXREO1FBQXlELE9BQUEsRUFBVSxFQUFuRTtRQUF1RSxRQUFBLEVBQVcsRUFBbEY7T0FqRlA7TUFrRkEsSUFBQSxFQUFPO1FBQUUsQ0FBQSxFQUFHLEdBQUw7UUFBVSxDQUFBLEVBQUksRUFBZDtRQUFrQixLQUFBLEVBQVEsRUFBMUI7UUFBOEIsTUFBQSxFQUFTLEVBQXZDO1FBQTJDLE9BQUEsRUFBVyxDQUF0RDtRQUF5RCxPQUFBLEVBQVUsRUFBbkU7UUFBdUUsUUFBQSxFQUFXLEVBQWxGO09BbEZQO01BbUZBLElBQUEsRUFBTztRQUFFLENBQUEsRUFBRyxHQUFMO1FBQVUsQ0FBQSxFQUFHLEdBQWI7UUFBa0IsS0FBQSxFQUFRLEVBQTFCO1FBQThCLE1BQUEsRUFBUyxFQUF2QztRQUEyQyxPQUFBLEVBQVcsQ0FBdEQ7UUFBeUQsT0FBQSxFQUFVLEVBQW5FO1FBQXVFLFFBQUEsRUFBVyxFQUFsRjtPQW5GUDtNQW9GQSxJQUFBLEVBQU87UUFBRSxDQUFBLEVBQUcsR0FBTDtRQUFVLENBQUEsRUFBRyxHQUFiO1FBQWtCLEtBQUEsRUFBUSxFQUExQjtRQUE4QixNQUFBLEVBQVMsRUFBdkM7UUFBMkMsT0FBQSxFQUFXLENBQXREO1FBQXlELE9BQUEsRUFBVSxFQUFuRTtRQUF1RSxRQUFBLEVBQVcsRUFBbEY7T0FwRlA7TUFxRkEsSUFBQSxFQUFPO1FBQUUsQ0FBQSxFQUFHLEdBQUw7UUFBVSxDQUFBLEVBQUcsR0FBYjtRQUFrQixLQUFBLEVBQVEsRUFBMUI7UUFBOEIsTUFBQSxFQUFTLEVBQXZDO1FBQTJDLE9BQUEsRUFBVyxDQUF0RDtRQUF5RCxPQUFBLEVBQVUsRUFBbkU7UUFBdUUsUUFBQSxFQUFXLEVBQWxGO09BckZQO01Bc0ZBLElBQUEsRUFBTztRQUFFLENBQUEsRUFBRyxHQUFMO1FBQVUsQ0FBQSxFQUFHLEdBQWI7UUFBa0IsS0FBQSxFQUFRLEVBQTFCO1FBQThCLE1BQUEsRUFBUyxFQUF2QztRQUEyQyxPQUFBLEVBQVcsQ0FBdEQ7UUFBeUQsT0FBQSxFQUFVLEVBQW5FO1FBQXVFLFFBQUEsRUFBVyxFQUFsRjtPQXRGUDtNQXVGQSxJQUFBLEVBQU87UUFBRSxDQUFBLEVBQUcsR0FBTDtRQUFVLENBQUEsRUFBRyxHQUFiO1FBQWtCLEtBQUEsRUFBUSxFQUExQjtRQUE4QixNQUFBLEVBQVMsRUFBdkM7UUFBMkMsT0FBQSxFQUFXLENBQXREO1FBQXlELE9BQUEsRUFBVSxFQUFuRTtRQUF1RSxRQUFBLEVBQVcsRUFBbEY7T0F2RlA7TUF3RkEsSUFBQSxFQUFPO1FBQUUsQ0FBQSxFQUFHLEdBQUw7UUFBVSxDQUFBLEVBQUssQ0FBZjtRQUFrQixLQUFBLEVBQVEsRUFBMUI7UUFBOEIsTUFBQSxFQUFTLEVBQXZDO1FBQTJDLE9BQUEsRUFBVyxDQUF0RDtRQUF5RCxPQUFBLEVBQVUsRUFBbkU7UUFBdUUsUUFBQSxFQUFXLEVBQWxGO09BeEZQO01BeUZBLElBQUEsRUFBTztRQUFFLENBQUEsRUFBSyxDQUFQO1FBQVUsQ0FBQSxFQUFLLENBQWY7UUFBa0IsS0FBQSxFQUFTLENBQTNCO1FBQThCLE1BQUEsRUFBVSxDQUF4QztRQUEyQyxPQUFBLEVBQVcsQ0FBdEQ7UUFBeUQsT0FBQSxFQUFVLEVBQW5FO1FBQXVFLFFBQUEsRUFBVyxFQUFsRjtPQXpGUDtNQTRGQSxLQUFBLEVBQU87UUFBRSxDQUFBLEVBQUcsR0FBTDtRQUFVLENBQUEsRUFBRyxHQUFiO1FBQWtCLEtBQUEsRUFBUSxFQUExQjtRQUE4QixNQUFBLEVBQVMsRUFBdkM7UUFBMkMsT0FBQSxFQUFXLENBQXREO1FBQXlELE9BQUEsRUFBVSxFQUFuRTtRQUF1RSxRQUFBLEVBQVcsRUFBbEY7T0E1RlA7TUE2RkEsS0FBQSxFQUFPO1FBQUUsQ0FBQSxFQUFHLEdBQUw7UUFBVSxDQUFBLEVBQUcsR0FBYjtRQUFrQixLQUFBLEVBQVEsRUFBMUI7UUFBOEIsTUFBQSxFQUFTLEVBQXZDO1FBQTJDLE9BQUEsRUFBVyxDQUF0RDtRQUF5RCxPQUFBLEVBQVUsRUFBbkU7UUFBdUUsUUFBQSxFQUFXLEVBQWxGO09BN0ZQO01BOEZBLEtBQUEsRUFBTztRQUFFLENBQUEsRUFBRyxHQUFMO1FBQVUsQ0FBQSxFQUFHLEdBQWI7UUFBa0IsS0FBQSxFQUFRLEVBQTFCO1FBQThCLE1BQUEsRUFBUyxFQUF2QztRQUEyQyxPQUFBLEVBQVcsQ0FBdEQ7UUFBeUQsT0FBQSxFQUFVLEVBQW5FO1FBQXVFLFFBQUEsRUFBVyxFQUFsRjtPQTlGUDtNQStGQSxLQUFBLEVBQU87UUFBRSxDQUFBLEVBQUcsR0FBTDtRQUFVLENBQUEsRUFBRyxHQUFiO1FBQWtCLEtBQUEsRUFBUSxFQUExQjtRQUE4QixNQUFBLEVBQVMsRUFBdkM7UUFBMkMsT0FBQSxFQUFXLENBQXREO1FBQXlELE9BQUEsRUFBVSxFQUFuRTtRQUF1RSxRQUFBLEVBQVcsRUFBbEY7T0EvRlA7S0FGRjtHQURGOzs7OztBQ0NGLElBQUE7O0FBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxhQUFaOztBQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7QUFHUCxjQUFBLEdBQWlCLFNBQUMsQ0FBRDtBQUNmLE1BQUE7RUFBQSxHQUFBLEdBQU0sSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFBLEdBQUksR0FBZixDQUFtQixDQUFDLFFBQXBCLENBQTZCLEVBQTdCO0VBQ0MsSUFBRyxHQUFHLENBQUMsTUFBSixLQUFjLENBQWpCO1dBQXdCLEdBQUEsR0FBTSxJQUE5QjtHQUFBLE1BQUE7V0FBdUMsSUFBdkM7O0FBRlE7O0FBR2pCLFFBQUEsR0FBVyxTQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUDtBQUNULFNBQU8sR0FBQSxHQUFNLGNBQUEsQ0FBZSxDQUFmLENBQU4sR0FBMEIsY0FBQSxDQUFlLENBQWYsQ0FBMUIsR0FBOEMsY0FBQSxDQUFlLENBQWY7QUFENUM7O0FBR1gsYUFBQSxHQUFnQjs7QUFFVjtFQUNTLG1CQUFDLE9BQUQsRUFBVSxLQUFWLEVBQWtCLE1BQWxCO0FBQ1gsUUFBQTtJQURZLElBQUMsQ0FBQSxTQUFEO0lBQVMsSUFBQyxDQUFBLFFBQUQ7SUFBUSxJQUFDLENBQUEsU0FBRDtJQUM3QixJQUFDLENBQUEsa0JBQUQsR0FBc0I7SUFDdEIsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFJLElBQUosQ0FBQSxDQUFVLENBQUMsT0FBWCxDQUFBO0lBQ1osSUFBQyxDQUFBLGdCQUFELEdBQW9CLElBQUksSUFBSixDQUFBLENBQVUsQ0FBQyxPQUFYLENBQUE7SUFDcEIsSUFBQyxDQUFBLGFBQUQsR0FBaUI7SUFDakIsSUFBQyxDQUFBLFVBQUQsR0FBYztJQUNkLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixXQUF4QixFQUFzQyxJQUFDLENBQUEsV0FBVyxDQUFDLElBQWIsQ0FBa0IsSUFBbEIsQ0FBdEMsRUFBK0QsS0FBL0Q7SUFDQSxNQUFNLENBQUMsZ0JBQVAsQ0FBd0IsV0FBeEIsRUFBc0MsSUFBQyxDQUFBLFdBQVcsQ0FBQyxJQUFiLENBQWtCLElBQWxCLENBQXRDLEVBQStELEtBQS9EO0lBQ0EsTUFBTSxDQUFDLGdCQUFQLENBQXdCLFNBQXhCLEVBQXNDLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixJQUFoQixDQUF0QyxFQUE2RCxLQUE3RDtJQUNBLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixZQUF4QixFQUFzQyxJQUFDLENBQUEsWUFBWSxDQUFDLElBQWQsQ0FBbUIsSUFBbkIsQ0FBdEMsRUFBZ0UsS0FBaEU7SUFDQSxNQUFNLENBQUMsZ0JBQVAsQ0FBd0IsV0FBeEIsRUFBc0MsSUFBQyxDQUFBLFdBQVcsQ0FBQyxJQUFiLENBQWtCLElBQWxCLENBQXRDLEVBQStELEtBQS9EO0lBQ0EsTUFBTSxDQUFDLGdCQUFQLENBQXdCLFVBQXhCLEVBQXNDLElBQUMsQ0FBQSxVQUFVLENBQUMsSUFBWixDQUFpQixJQUFqQixDQUF0QyxFQUE4RCxLQUE5RDtJQUNBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLENBQW1CLElBQW5CO0lBQ1gsSUFBQyxDQUFBLFFBQUQsR0FBWSxDQUVWLHFCQUZVLEVBSVYsMEJBSlUsRUFNVixxQkFOVSxFQVFWLDBCQVJVO0lBV1osSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFJLElBQUosQ0FBUyxJQUFULEVBQWUsSUFBQyxDQUFBLEtBQWhCLEVBQXVCLElBQUMsQ0FBQSxNQUF4QjtJQUVSLElBQUcsT0FBTyxPQUFQLEtBQWtCLFdBQXJCO01BQ0UsS0FBQSxHQUFRLFlBQVksQ0FBQyxPQUFiLENBQXFCLE9BQXJCO01BQ1IsSUFBRyxLQUFIO1FBRUUsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVcsS0FBWCxFQUZGO09BRkY7O0lBTUEsSUFBQyxDQUFBLGFBQUQsR0FBaUI7SUFDakIsY0FBQSxHQUFpQjtBQUNqQjtBQUFBLFNBQUEscUNBQUE7O01BQ0UsSUFBQyxDQUFBLGFBQUQ7TUFDQSxPQUFPLENBQUMsR0FBUixDQUFZLGdCQUFBLEdBQWlCLElBQUMsQ0FBQSxhQUFsQixHQUFnQyxJQUFoQyxHQUFvQyxRQUFoRDtNQUNBLEdBQUEsR0FBTSxJQUFJLEtBQUosQ0FBQTtNQUNOLEdBQUcsQ0FBQyxNQUFKLEdBQWEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxJQUFmLENBQW9CLElBQXBCO01BQ2IsR0FBRyxDQUFDLEdBQUosR0FBVTtNQUNWLGNBQWMsQ0FBQyxJQUFmLENBQW9CLEdBQXBCO0FBTkY7SUFPQSxJQUFDLENBQUEsUUFBRCxHQUFZO0lBRVosSUFBQyxDQUFBLFNBQUQsR0FBYTtFQTNDRjs7c0JBNkNiLGFBQUEsR0FBZSxTQUFDLElBQUQ7SUFDYixJQUFDLENBQUEsYUFBRDtJQUNBLElBQUcsSUFBQyxDQUFBLGFBQUQsS0FBa0IsQ0FBckI7TUFDRSxPQUFPLENBQUMsR0FBUixDQUFZLDJDQUFaO2FBQ0EscUJBQUEsQ0FBc0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLEtBQUMsQ0FBQSxNQUFELENBQUE7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEIsRUFGRjs7RUFGYTs7c0JBTWYsR0FBQSxHQUFLLFNBQUMsQ0FBRDtXQUNILE9BQU8sQ0FBQyxHQUFSLENBQVksbUJBQUEsR0FBb0IsQ0FBaEM7RUFERzs7c0JBR0wsVUFBQSxHQUFZLFNBQUMsRUFBRDtBQUNWLFFBQUE7SUFBQSxJQUFVLE9BQU8sT0FBUCxLQUFrQixXQUE1QjtBQUFBLGFBQUE7O0lBQ0EsSUFBQyxDQUFBLFNBQUQsSUFBYztJQUNkLElBQUcsSUFBQyxDQUFBLFNBQUQsSUFBYyxDQUFqQjtNQUNFLElBQUMsQ0FBQSxTQUFELEdBQWE7TUFDYixLQUFBLEdBQVEsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQUE7YUFFUixZQUFZLENBQUMsT0FBYixDQUFxQixPQUFyQixFQUE4QixLQUE5QixFQUpGOztFQUhVOztzQkFTWixpQkFBQSxHQUFtQixTQUFDLFlBQUQsRUFBZSxHQUFmLEVBQW9CLEtBQXBCLEVBQTJCLElBQTNCO0FBQ2pCLFFBQUE7SUFBQSxHQUFBLEdBQU0sSUFBQyxDQUFBLFFBQVMsQ0FBQSxZQUFBO0lBQ2hCLElBQUEsR0FBTyxRQUFRLENBQUMsYUFBVCxDQUF1QixRQUF2QjtJQUNQLElBQUksQ0FBQyxLQUFMLEdBQWMsR0FBRyxDQUFDO0lBQ2xCLElBQUksQ0FBQyxNQUFMLEdBQWMsR0FBRyxDQUFDO0lBRWxCLEdBQUEsR0FBTSxJQUFJLENBQUMsVUFBTCxDQUFnQixJQUFoQjtJQUNOLEdBQUcsQ0FBQyx3QkFBSixHQUErQjtJQUMvQixHQUFHLENBQUMsU0FBSixDQUFjLEdBQWQsRUFBbUIsQ0FBbkIsRUFBc0IsQ0FBdEI7SUFDQSxTQUFBLEdBQVksTUFBQSxHQUFNLENBQUMsSUFBSSxDQUFDLEtBQUwsQ0FBVyxHQUFBLEdBQUksR0FBZixDQUFELENBQU4sR0FBMkIsSUFBM0IsR0FBOEIsQ0FBQyxJQUFJLENBQUMsS0FBTCxDQUFXLEtBQUEsR0FBTSxHQUFqQixDQUFELENBQTlCLEdBQXFELElBQXJELEdBQXdELENBQUMsSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFBLEdBQUssR0FBaEIsQ0FBRCxDQUF4RCxHQUE4RTtJQUMxRixHQUFHLENBQUMsU0FBSixHQUFnQjtJQUVoQixHQUFHLENBQUMsd0JBQUosR0FBK0I7SUFDL0IsR0FBRyxDQUFDLFFBQUosQ0FBYSxDQUFiLEVBQWdCLENBQWhCLEVBQW1CLElBQUksQ0FBQyxLQUF4QixFQUErQixJQUFJLENBQUMsTUFBcEM7SUFDQSxHQUFHLENBQUMsd0JBQUosR0FBK0I7SUFDL0IsR0FBRyxDQUFDLFdBQUosR0FBa0I7SUFDbEIsR0FBRyxDQUFDLHdCQUFKLEdBQStCO0lBQy9CLEdBQUcsQ0FBQyxTQUFKLENBQWMsR0FBZCxFQUFtQixDQUFuQixFQUFzQixDQUF0QjtJQUVBLE9BQUEsR0FBVSxJQUFJLEtBQUosQ0FBQTtJQUNWLE9BQU8sQ0FBQyxHQUFSLEdBQWMsSUFBSSxDQUFDLFNBQUwsQ0FBQTtBQUNkLFdBQU87RUFyQlU7O3NCQXVCbkIsU0FBQSxHQUFXLFNBQUMsWUFBRCxFQUFlLElBQWYsRUFBcUIsSUFBckIsRUFBMkIsSUFBM0IsRUFBaUMsSUFBakMsRUFBdUMsSUFBdkMsRUFBNkMsSUFBN0MsRUFBbUQsSUFBbkQsRUFBeUQsSUFBekQsRUFBK0QsR0FBL0QsRUFBb0UsT0FBcEUsRUFBNkUsT0FBN0UsRUFBc0YsQ0FBdEYsRUFBeUYsQ0FBekYsRUFBNEYsQ0FBNUYsRUFBK0YsQ0FBL0Y7QUFDVCxRQUFBO0lBQUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxRQUFTLENBQUEsWUFBQTtJQUNwQixJQUFHLENBQUMsQ0FBQSxLQUFLLENBQU4sQ0FBQSxJQUFZLENBQUMsQ0FBQSxLQUFLLENBQU4sQ0FBWixJQUF3QixDQUFDLENBQUEsS0FBSyxDQUFOLENBQTNCO01BQ0UsZ0JBQUEsR0FBc0IsWUFBRCxHQUFjLEdBQWQsR0FBaUIsQ0FBakIsR0FBbUIsR0FBbkIsR0FBc0IsQ0FBdEIsR0FBd0IsR0FBeEIsR0FBMkI7TUFDaEQsYUFBQSxHQUFnQixJQUFDLENBQUEsa0JBQW1CLENBQUEsZ0JBQUE7TUFDcEMsSUFBRyxDQUFJLGFBQVA7UUFDRSxhQUFBLEdBQWdCLElBQUMsQ0FBQSxpQkFBRCxDQUFtQixZQUFuQixFQUFpQyxDQUFqQyxFQUFvQyxDQUFwQyxFQUF1QyxDQUF2QztRQUNoQixJQUFDLENBQUEsa0JBQW1CLENBQUEsZ0JBQUEsQ0FBcEIsR0FBd0MsY0FGMUM7O01BSUEsT0FBQSxHQUFVLGNBUFo7O0lBU0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQUE7SUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsQ0FBbUIsSUFBbkIsRUFBeUIsSUFBekI7SUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBZ0IsR0FBaEI7SUFDQSxhQUFBLEdBQWdCLENBQUMsQ0FBRCxHQUFLLE9BQUwsR0FBZTtJQUMvQixhQUFBLEdBQWdCLENBQUMsQ0FBRCxHQUFLLE9BQUwsR0FBZTtJQUMvQixJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsQ0FBbUIsYUFBbkIsRUFBa0MsYUFBbEM7SUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLFdBQVQsR0FBdUI7SUFDdkIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULENBQW1CLE9BQW5CLEVBQTRCLElBQTVCLEVBQWtDLElBQWxDLEVBQXdDLElBQXhDLEVBQThDLElBQTlDLEVBQW9ELENBQXBELEVBQXVELENBQXZELEVBQTBELElBQTFELEVBQWdFLElBQWhFO1dBQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFULENBQUE7RUFuQlM7O3NCQXFCWCxNQUFBLEdBQVEsU0FBQTtBQUNOLFFBQUE7SUFBQSxxQkFBQSxDQUFzQixDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUE7ZUFBRyxLQUFDLENBQUEsTUFBRCxDQUFBO01BQUg7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRCO0lBRUEsR0FBQSxHQUFNLElBQUksSUFBSixDQUFBLENBQVUsQ0FBQyxPQUFYLENBQUE7SUFDTixFQUFBLEdBQUssR0FBQSxHQUFNLElBQUMsQ0FBQTtJQUlaLGlCQUFBLEdBQW9CLEdBQUEsR0FBTSxJQUFDLENBQUE7SUFDM0IsSUFBRyxpQkFBQSxHQUFvQixLQUF2QjtNQUNFLE9BQUEsR0FBVSxFQURaO0tBQUEsTUFBQTtNQUdFLE9BQUEsR0FBVSxLQUhaOztJQUlBLElBQUcsSUFBQyxDQUFBLFdBQUQsS0FBZ0IsT0FBbkI7TUFDRSxPQUFPLENBQUMsR0FBUixDQUFZLGVBQUEsR0FBZ0IsT0FBaEIsR0FBd0IsTUFBcEM7TUFDQSxJQUFDLENBQUEsV0FBRCxHQUFlLFFBRmpCOztJQUlBLElBQUcsT0FBQSxLQUFXLElBQWQ7TUFDRSxXQUFBLEdBQWMsSUFBQSxHQUFPO01BQ3JCLElBQUcsRUFBQSxHQUFLLFdBQVI7QUFDRSxlQURGO09BRkY7O0lBSUEsSUFBQyxDQUFBLFFBQUQsR0FBWTtJQUVaLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxDQUFtQixDQUFuQixFQUFzQixDQUF0QixFQUF5QixJQUFDLENBQUEsS0FBMUIsRUFBaUMsSUFBQyxDQUFBLE1BQWxDO0lBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxNQUFOLENBQWEsRUFBYjtJQUNBLGNBQUEsR0FBaUIsSUFBQyxDQUFBLElBQUksQ0FBQyxNQUFOLENBQUE7SUFFakIsQ0FBQSxHQUFJO0lBQ0osQ0FBQSxHQUFJLGNBQWMsQ0FBQztBQUNuQixXQUFPLENBQUEsR0FBSSxDQUFYO01BQ0UsUUFBQSxHQUFXLGNBQWMsQ0FBQyxLQUFmLENBQXFCLENBQXJCLEVBQXdCLENBQUEsSUFBSyxFQUE3QjtNQUNYLElBQUMsQ0FBQSxTQUFTLENBQUMsS0FBWCxDQUFpQixJQUFqQixFQUF1QixRQUF2QjtJQUZGO1dBSUEsSUFBQyxDQUFBLFVBQUQsQ0FBWSxFQUFaO0VBakNNOztzQkFtQ1IsWUFBQSxHQUFjLFNBQUMsR0FBRDtBQUNaLFFBQUE7SUFBQSxJQUFDLENBQUEsZ0JBQUQsR0FBb0IsSUFBSSxJQUFKLENBQUEsQ0FBVSxDQUFDLE9BQVgsQ0FBQTtJQUNwQixJQUFDLENBQUEsYUFBRCxHQUFpQjtJQUNqQixPQUFBLEdBQVUsR0FBRyxDQUFDO0FBQ2Q7U0FBQSx5Q0FBQTs7TUFDRSxJQUFHLElBQUMsQ0FBQSxVQUFELEtBQWUsSUFBbEI7UUFDRSxJQUFDLENBQUEsVUFBRCxHQUFjLEtBQUssQ0FBQyxXQUR0Qjs7TUFFQSxJQUFHLElBQUMsQ0FBQSxVQUFELEtBQWUsS0FBSyxDQUFDLFVBQXhCO3FCQUNFLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBTixDQUFnQixLQUFLLENBQUMsT0FBdEIsRUFBK0IsS0FBSyxDQUFDLE9BQXJDLEdBREY7T0FBQSxNQUFBOzZCQUFBOztBQUhGOztFQUpZOztzQkFVZCxXQUFBLEdBQWEsU0FBQyxHQUFEO0FBQ1gsUUFBQTtJQUFBLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixJQUFJLElBQUosQ0FBQSxDQUFVLENBQUMsT0FBWCxDQUFBO0lBQ3BCLE9BQUEsR0FBVSxHQUFHLENBQUM7QUFDZDtTQUFBLHlDQUFBOztNQUNFLElBQUcsSUFBQyxDQUFBLFVBQUQsS0FBZSxLQUFLLENBQUMsVUFBeEI7cUJBQ0UsSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFOLENBQWdCLEtBQUssQ0FBQyxPQUF0QixFQUErQixLQUFLLENBQUMsT0FBckMsR0FERjtPQUFBLE1BQUE7NkJBQUE7O0FBREY7O0VBSFc7O3NCQU9iLFVBQUEsR0FBWSxTQUFDLEdBQUQ7QUFDVixRQUFBO0lBQUEsSUFBQyxDQUFBLGdCQUFELEdBQW9CLElBQUksSUFBSixDQUFBLENBQVUsQ0FBQyxPQUFYLENBQUE7SUFDcEIsT0FBQSxHQUFVLEdBQUcsQ0FBQztBQUNkLFNBQUEseUNBQUE7O01BQ0UsSUFBRyxJQUFDLENBQUEsVUFBRCxLQUFlLEtBQUssQ0FBQyxVQUF4QjtRQUNFLElBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixDQUFjLEtBQUssQ0FBQyxPQUFwQixFQUE2QixLQUFLLENBQUMsT0FBbkM7UUFDQSxJQUFDLENBQUEsVUFBRCxHQUFjLEtBRmhCOztBQURGO0lBSUEsSUFBRyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQVosS0FBc0IsQ0FBekI7YUFDRSxJQUFDLENBQUEsVUFBRCxHQUFjLEtBRGhCOztFQVBVOztzQkFVWixXQUFBLEdBQWEsU0FBQyxHQUFEO0lBQ1gsSUFBRyxJQUFDLENBQUEsYUFBSjtBQUNFLGFBREY7O0lBRUEsSUFBQyxDQUFBLGdCQUFELEdBQW9CLElBQUksSUFBSixDQUFBLENBQVUsQ0FBQyxPQUFYLENBQUE7V0FDcEIsSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFOLENBQWdCLEdBQUcsQ0FBQyxPQUFwQixFQUE2QixHQUFHLENBQUMsT0FBakM7RUFKVzs7c0JBTWIsV0FBQSxHQUFhLFNBQUMsR0FBRDtJQUNYLElBQUcsSUFBQyxDQUFBLGFBQUo7QUFDRSxhQURGOztJQUVBLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixJQUFJLElBQUosQ0FBQSxDQUFVLENBQUMsT0FBWCxDQUFBO1dBQ3BCLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBTixDQUFnQixHQUFHLENBQUMsT0FBcEIsRUFBNkIsR0FBRyxDQUFDLE9BQWpDO0VBSlc7O3NCQU1iLFNBQUEsR0FBVyxTQUFDLEdBQUQ7SUFDVCxJQUFHLElBQUMsQ0FBQSxhQUFKO0FBQ0UsYUFERjs7SUFFQSxJQUFDLENBQUEsZ0JBQUQsR0FBb0IsSUFBSSxJQUFKLENBQUEsQ0FBVSxDQUFDLE9BQVgsQ0FBQTtXQUNwQixJQUFDLENBQUEsSUFBSSxDQUFDLE9BQU4sQ0FBYyxHQUFHLENBQUMsT0FBbEIsRUFBMkIsR0FBRyxDQUFDLE9BQS9CO0VBSlM7Ozs7OztBQU1iLE1BQUEsR0FBUyxRQUFRLENBQUMsY0FBVCxDQUF3QixRQUF4Qjs7QUFDVCxZQUFBLEdBQWUsU0FBQTtBQUNiLE1BQUE7RUFBQSxrQkFBQSxHQUFxQixFQUFBLEdBQUs7RUFDMUIsa0JBQUEsR0FBcUIsTUFBTSxDQUFDLFVBQVAsR0FBb0IsTUFBTSxDQUFDO0VBQ2hELElBQUcsa0JBQUEsR0FBcUIsa0JBQXhCO0lBQ0UsTUFBTSxDQUFDLEtBQVAsR0FBZSxNQUFNLENBQUM7V0FDdEIsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsSUFBSSxDQUFDLEtBQUwsQ0FBVyxNQUFNLENBQUMsVUFBUCxHQUFvQixDQUFDLENBQUEsR0FBSSxrQkFBTCxDQUEvQixFQUZsQjtHQUFBLE1BQUE7SUFJRSxNQUFNLENBQUMsS0FBUCxHQUFlLElBQUksQ0FBQyxLQUFMLENBQVcsTUFBTSxDQUFDLFdBQVAsR0FBcUIsa0JBQWhDO1dBQ2YsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsTUFBTSxDQUFDLFlBTHpCOztBQUhhOztBQVNmLFlBQUEsQ0FBQTs7QUFHQSxHQUFBLEdBQU0sSUFBSSxTQUFKLENBQWMsTUFBZCxFQUFzQixNQUFNLENBQUMsS0FBN0IsRUFBb0MsTUFBTSxDQUFDLE1BQTNDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY2FsY1NpZ24gPSAodikgLT5cbiAgaWYgdiA9PSAwXG4gICAgcmV0dXJuIDBcbiAgZWxzZSBpZiB2IDwgMFxuICAgIHJldHVybiAtMVxuICByZXR1cm4gMVxuXG5jbGFzcyBBbmltYXRpb25cbiAgY29uc3RydWN0b3I6IChkYXRhKSAtPlxuICAgIEBzcGVlZCA9IGRhdGEuc3BlZWRcbiAgICBAcmVxID0ge31cbiAgICBAY3VyID0ge31cbiAgICBmb3Igayx2IG9mIGRhdGFcbiAgICAgIGlmIGsgIT0gJ3NwZWVkJ1xuICAgICAgICBAcmVxW2tdID0gdlxuICAgICAgICBAY3VyW2tdID0gdlxuXG4gICMgJ2ZpbmlzaGVzJyBhbGwgYW5pbWF0aW9uc1xuICB3YXJwOiAtPlxuICAgIGlmIEBjdXIucj9cbiAgICAgIEBjdXIuciA9IEByZXEuclxuICAgIGlmIEBjdXIucz9cbiAgICAgIEBjdXIucyA9IEByZXEuc1xuICAgIGlmIEBjdXIueD8gYW5kIEBjdXIueT9cbiAgICAgIEBjdXIueCA9IEByZXEueFxuICAgICAgQGN1ci55ID0gQHJlcS55XG5cbiAgYW5pbWF0aW5nOiAtPlxuICAgIGlmIEBjdXIucj9cbiAgICAgIGlmIEByZXEuciAhPSBAY3VyLnJcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICBpZiBAY3VyLnM/XG4gICAgICBpZiBAcmVxLnMgIT0gQGN1ci5zXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgaWYgQGN1ci54PyBhbmQgQGN1ci55P1xuICAgICAgaWYgKEByZXEueCAhPSBAY3VyLngpIG9yIChAcmVxLnkgIT0gQGN1ci55KVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIHJldHVybiBmYWxzZVxuXG4gIHVwZGF0ZTogKGR0KSAtPlxuICAgIHVwZGF0ZWQgPSBmYWxzZVxuICAgICMgcm90YXRpb25cbiAgICBpZiBAY3VyLnI/XG4gICAgICBpZiBAcmVxLnIgIT0gQGN1ci5yXG4gICAgICAgIHVwZGF0ZWQgPSB0cnVlXG4gICAgICAgICMgc2FuaXRpemUgcmVxdWVzdGVkIHJvdGF0aW9uXG4gICAgICAgIHR3b1BpID0gTWF0aC5QSSAqIDJcbiAgICAgICAgbmVnVHdvUGkgPSAtMSAqIHR3b1BpXG4gICAgICAgIEByZXEuciAtPSB0d29QaSB3aGlsZSBAcmVxLnIgPj0gdHdvUGlcbiAgICAgICAgQHJlcS5yICs9IHR3b1BpIHdoaWxlIEByZXEuciA8PSBuZWdUd29QaVxuICAgICAgICAjIHBpY2sgYSBkaXJlY3Rpb24gYW5kIHR1cm5cbiAgICAgICAgZHIgPSBAcmVxLnIgLSBAY3VyLnJcbiAgICAgICAgZGlzdCA9IE1hdGguYWJzKGRyKVxuICAgICAgICBzaWduID0gY2FsY1NpZ24oZHIpXG4gICAgICAgIGlmIGRpc3QgPiBNYXRoLlBJXG4gICAgICAgICAgIyBzcGluIHRoZSBvdGhlciBkaXJlY3Rpb24sIGl0IGlzIGNsb3NlclxuICAgICAgICAgIGRpc3QgPSB0d29QaSAtIGRpc3RcbiAgICAgICAgICBzaWduICo9IC0xXG4gICAgICAgIG1heERpc3QgPSBkdCAqIEBzcGVlZC5yIC8gMTAwMFxuICAgICAgICBpZiBkaXN0IDwgbWF4RGlzdFxuICAgICAgICAgICMgd2UgY2FuIGZpbmlzaCB0aGlzIGZyYW1lXG4gICAgICAgICAgQGN1ci5yID0gQHJlcS5yXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAY3VyLnIgKz0gbWF4RGlzdCAqIHNpZ25cblxuICAgICMgc2NhbGVcbiAgICBpZiBAY3VyLnM/XG4gICAgICBpZiBAcmVxLnMgIT0gQGN1ci5zXG4gICAgICAgIHVwZGF0ZWQgPSB0cnVlXG4gICAgICAgICMgcGljayBhIGRpcmVjdGlvbiBhbmQgdHVyblxuICAgICAgICBkcyA9IEByZXEucyAtIEBjdXIuc1xuICAgICAgICBkaXN0ID0gTWF0aC5hYnMoZHMpXG4gICAgICAgIHNpZ24gPSBjYWxjU2lnbihkcylcbiAgICAgICAgbWF4RGlzdCA9IGR0ICogQHNwZWVkLnMgLyAxMDAwXG4gICAgICAgIGlmIGRpc3QgPCBtYXhEaXN0XG4gICAgICAgICAgIyB3ZSBjYW4gZmluaXNoIHRoaXMgZnJhbWVcbiAgICAgICAgICBAY3VyLnMgPSBAcmVxLnNcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBjdXIucyArPSBtYXhEaXN0ICogc2lnblxuXG4gICAgIyB0cmFuc2xhdGlvblxuICAgIGlmIEBjdXIueD8gYW5kIEBjdXIueT9cbiAgICAgIGlmIChAcmVxLnggIT0gQGN1ci54KSBvciAoQHJlcS55ICE9IEBjdXIueSlcbiAgICAgICAgdXBkYXRlZCA9IHRydWVcbiAgICAgICAgdmVjWCA9IEByZXEueCAtIEBjdXIueFxuICAgICAgICB2ZWNZID0gQHJlcS55IC0gQGN1ci55XG4gICAgICAgIGRpc3QgPSBNYXRoLnNxcnQoKHZlY1ggKiB2ZWNYKSArICh2ZWNZICogdmVjWSkpXG4gICAgICAgIG1heERpc3QgPSBkdCAqIEBzcGVlZC50IC8gMTAwMFxuICAgICAgICBpZiBkaXN0IDwgbWF4RGlzdFxuICAgICAgICAgICMgd2UgY2FuIGZpbmlzaCB0aGlzIGZyYW1lXG4gICAgICAgICAgQGN1ci54ID0gQHJlcS54XG4gICAgICAgICAgQGN1ci55ID0gQHJlcS55XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAjIG1vdmUgYXMgbXVjaCBhcyBwb3NzaWJsZVxuICAgICAgICAgIEBjdXIueCArPSAodmVjWCAvIGRpc3QpICogbWF4RGlzdFxuICAgICAgICAgIEBjdXIueSArPSAodmVjWSAvIGRpc3QpICogbWF4RGlzdFxuXG4gICAgcmV0dXJuIHVwZGF0ZWRcblxubW9kdWxlLmV4cG9ydHMgPSBBbmltYXRpb25cbiIsIkFuaW1hdGlvbiA9IHJlcXVpcmUgJy4vQW5pbWF0aW9uJ1xuXG5jbGFzcyBCdXR0b25cbiAgY29uc3RydWN0b3I6IChAZ2FtZSwgQHNwcml0ZU5hbWVzLCBAZm9udCwgQHRleHRIZWlnaHQsIEB4LCBAeSwgQGNiKSAtPlxuICAgIEBhbmltID0gbmV3IEFuaW1hdGlvbiB7XG4gICAgICBzcGVlZDogeyBzOiAzIH1cbiAgICAgIHM6IDBcbiAgICB9XG4gICAgQGNvbG9yID0geyByOiAxLCBnOiAxLCBiOiAxLCBhOiAwIH1cblxuICB1cGRhdGU6IChkdCkgLT5cbiAgICByZXR1cm4gQGFuaW0udXBkYXRlKGR0KVxuXG4gIHJlbmRlcjogLT5cbiAgICBAY29sb3IuYSA9IEBhbmltLmN1ci5zXG4gICAgQGdhbWUuc3ByaXRlUmVuZGVyZXIucmVuZGVyIEBzcHJpdGVOYW1lc1swXSwgQHgsIEB5LCAwLCBAdGV4dEhlaWdodCAqIDEuNSwgMCwgMC41LCAwLjUsIEBnYW1lLmNvbG9ycy53aGl0ZSwgPT5cbiAgICAgICMgcHVsc2UgYnV0dG9uIGFuaW0sXG4gICAgICBAYW5pbS5jdXIucyA9IDFcbiAgICAgIEBhbmltLnJlcS5zID0gMFxuICAgICAgIyB0aGVuIGNhbGwgY2FsbGJhY2tcbiAgICAgIEBjYih0cnVlKVxuICAgIEBnYW1lLnNwcml0ZVJlbmRlcmVyLnJlbmRlciBAc3ByaXRlTmFtZXNbMV0sIEB4LCBAeSwgMCwgQHRleHRIZWlnaHQgKiAxLjUsIDAsIDAuNSwgMC41LCBAY29sb3JcbiAgICB0ZXh0ID0gQGNiKGZhbHNlKVxuICAgIEBnYW1lLmZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIEB0ZXh0SGVpZ2h0LCB0ZXh0LCBAeCwgQHksIDAuNSwgMC41LCBAZ2FtZS5jb2xvcnMuYnV0dG9udGV4dFxuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1dHRvblxuIiwiZm9udG1ldHJpY3MgPSByZXF1aXJlICcuL2ZvbnRtZXRyaWNzJ1xuXG4jIHRha2VuIGZyb20gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy81NjIzODM4L3JnYi10by1oZXgtYW5kLWhleC10by1yZ2JcbmhleFRvUmdiID0gKGhleCwgYSkgLT5cbiAgICByZXN1bHQgPSAvXiM/KFthLWZcXGRdezJ9KShbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pJC9pLmV4ZWMoaGV4KVxuICAgIHJldHVybiBudWxsIGlmIG5vdCByZXN1bHRcbiAgICByZXR1cm4ge1xuICAgICAgICByOiBwYXJzZUludChyZXN1bHRbMV0sIDE2KSAvIDI1NSxcbiAgICAgICAgZzogcGFyc2VJbnQocmVzdWx0WzJdLCAxNikgLyAyNTUsXG4gICAgICAgIGI6IHBhcnNlSW50KHJlc3VsdFszXSwgMTYpIC8gMjU1XG4gICAgICAgIGE6IGFcbiAgICB9XG5cbmNsYXNzIEZvbnRSZW5kZXJlclxuICBjb25zdHJ1Y3RvcjogIChAZ2FtZSkgLT5cbiAgICBAd2hpdGUgPSB7IHI6IDEsIGc6IDEsIGI6IDEsIGE6IDEgfVxuXG4gIHNpemU6IChmb250LCBoZWlnaHQsIHN0cikgLT5cbiAgICBtZXRyaWNzID0gZm9udG1ldHJpY3NbZm9udF1cbiAgICByZXR1cm4gaWYgbm90IG1ldHJpY3NcbiAgICBzY2FsZSA9IGhlaWdodCAvIG1ldHJpY3MuaGVpZ2h0XG5cbiAgICB0b3RhbFdpZHRoID0gMFxuICAgIHRvdGFsSGVpZ2h0ID0gbWV0cmljcy5oZWlnaHQgKiBzY2FsZVxuXG4gICAgaW5Db2xvciA9IGZhbHNlXG4gICAgZm9yIGNoLCBpIGluIHN0clxuICAgICAgaWYgY2ggPT0gJ2AnXG4gICAgICAgIGluQ29sb3IgPSAhaW5Db2xvclxuXG4gICAgICBpZiBub3QgaW5Db2xvclxuICAgICAgICBjb2RlID0gY2guY2hhckNvZGVBdCgwKVxuICAgICAgICBnbHlwaCA9IG1ldHJpY3MuZ2x5cGhzW2NvZGVdXG4gICAgICAgIGNvbnRpbnVlIGlmIG5vdCBnbHlwaFxuICAgICAgICB0b3RhbFdpZHRoICs9IGdseXBoLnhhZHZhbmNlICogc2NhbGVcblxuICAgIHJldHVybiB7XG4gICAgICB3OiB0b3RhbFdpZHRoXG4gICAgICBoOiB0b3RhbEhlaWdodFxuICAgIH1cblxuICByZW5kZXI6IChmb250LCBoZWlnaHQsIHN0ciwgeCwgeSwgYW5jaG9yeCwgYW5jaG9yeSwgY29sb3IsIGNiKSAtPlxuICAgIG1ldHJpY3MgPSBmb250bWV0cmljc1tmb250XVxuICAgIHJldHVybiBpZiBub3QgbWV0cmljc1xuICAgIHNjYWxlID0gaGVpZ2h0IC8gbWV0cmljcy5oZWlnaHRcblxuICAgIHRvdGFsV2lkdGggPSAwXG4gICAgdG90YWxIZWlnaHQgPSBtZXRyaWNzLmhlaWdodCAqIHNjYWxlXG4gICAgc2tpcENvbG9yID0gZmFsc2VcbiAgICBmb3IgY2gsIGkgaW4gc3RyXG4gICAgICBpZiBjaCA9PSAnYCdcbiAgICAgICAgc2tpcENvbG9yID0gIXNraXBDb2xvclxuICAgICAgY29udGludWUgaWYgc2tpcENvbG9yXG4gICAgICBjb2RlID0gY2guY2hhckNvZGVBdCgwKVxuICAgICAgZ2x5cGggPSBtZXRyaWNzLmdseXBoc1tjb2RlXVxuICAgICAgY29udGludWUgaWYgbm90IGdseXBoXG4gICAgICB0b3RhbFdpZHRoICs9IGdseXBoLnhhZHZhbmNlICogc2NhbGVcblxuICAgIGFuY2hvck9mZnNldFggPSAtMSAqIGFuY2hvcnggKiB0b3RhbFdpZHRoXG4gICAgYW5jaG9yT2Zmc2V0WSA9IC0xICogYW5jaG9yeSAqIHRvdGFsSGVpZ2h0XG4gICAgY3VyclggPSB4XG5cbiAgICBpZiBjb2xvclxuICAgICAgc3RhcnRpbmdDb2xvciA9IGNvbG9yXG4gICAgZWxzZVxuICAgICAgc3RhcnRpbmdDb2xvciA9IEB3aGl0ZVxuICAgIGN1cnJlbnRDb2xvciA9IHN0YXJ0aW5nQ29sb3JcblxuICAgIGNvbG9yU3RhcnQgPSAtMVxuICAgIGZvciBjaCwgaSBpbiBzdHJcbiAgICAgIGlmIGNoID09ICdgJ1xuICAgICAgICBpZiBjb2xvclN0YXJ0ID09IC0xXG4gICAgICAgICAgY29sb3JTdGFydCA9IGkgKyAxXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBsZW4gPSBpIC0gY29sb3JTdGFydFxuICAgICAgICAgIGlmIGxlblxuICAgICAgICAgICAgY3VycmVudENvbG9yID0gaGV4VG9SZ2Ioc3RyLnN1YnN0cihjb2xvclN0YXJ0LCBpIC0gY29sb3JTdGFydCksIHN0YXJ0aW5nQ29sb3IuYSlcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBjdXJyZW50Q29sb3IgPSBzdGFydGluZ0NvbG9yXG4gICAgICAgICAgY29sb3JTdGFydCA9IC0xXG5cbiAgICAgIGNvbnRpbnVlIGlmIGNvbG9yU3RhcnQgIT0gLTFcbiAgICAgIGNvZGUgPSBjaC5jaGFyQ29kZUF0KDApXG4gICAgICBnbHlwaCA9IG1ldHJpY3MuZ2x5cGhzW2NvZGVdXG4gICAgICBjb250aW51ZSBpZiBub3QgZ2x5cGhcbiAgICAgIEBnYW1lLmRyYXdJbWFnZSBmb250LFxuICAgICAgZ2x5cGgueCwgZ2x5cGgueSwgZ2x5cGgud2lkdGgsIGdseXBoLmhlaWdodCxcbiAgICAgIGN1cnJYICsgKGdseXBoLnhvZmZzZXQgKiBzY2FsZSkgKyBhbmNob3JPZmZzZXRYLCB5ICsgKGdseXBoLnlvZmZzZXQgKiBzY2FsZSkgKyBhbmNob3JPZmZzZXRZLCBnbHlwaC53aWR0aCAqIHNjYWxlLCBnbHlwaC5oZWlnaHQgKiBzY2FsZSxcbiAgICAgIDAsIDAsIDAsXG4gICAgICBjdXJyZW50Q29sb3IuciwgY3VycmVudENvbG9yLmcsIGN1cnJlbnRDb2xvci5iLCBjdXJyZW50Q29sb3IuYSwgY2JcbiAgICAgIGN1cnJYICs9IGdseXBoLnhhZHZhbmNlICogc2NhbGVcblxubW9kdWxlLmV4cG9ydHMgPSBGb250UmVuZGVyZXJcbiIsIkFuaW1hdGlvbiA9IHJlcXVpcmUgJy4vQW5pbWF0aW9uJ1xuQnV0dG9uID0gcmVxdWlyZSAnLi9CdXR0b24nXG5Gb250UmVuZGVyZXIgPSByZXF1aXJlICcuL0ZvbnRSZW5kZXJlcidcblNwcml0ZVJlbmRlcmVyID0gcmVxdWlyZSAnLi9TcHJpdGVSZW5kZXJlcidcbk1lbnUgPSByZXF1aXJlICcuL01lbnUnXG5IYW5kID0gcmVxdWlyZSAnLi9IYW5kJ1xuUGlsZSA9IHJlcXVpcmUgJy4vUGlsZSdcbntUaGlydGVlbiwgT0ssIGFpQ2hhcmFjdGVycywgYWNoaWV2ZW1lbnRzTGlzdH0gPSByZXF1aXJlICcuL1RoaXJ0ZWVuJ1xuXG4jIHRlbXBcbkJVSUxEX1RJTUVTVEFNUCA9IFwiMS4wLjZcIlxuXG5jbGFzcyBHYW1lXG4gIGNvbnN0cnVjdG9yOiAoQG5hdGl2ZSwgQHdpZHRoLCBAaGVpZ2h0KSAtPlxuICAgIEB2ZXJzaW9uID0gQlVJTERfVElNRVNUQU1QXG4gICAgQGxvZyhcIkdhbWUgY29uc3RydWN0ZWQ6ICN7QHdpZHRofXgje0BoZWlnaHR9XCIpXG4gICAgQGZvbnRSZW5kZXJlciA9IG5ldyBGb250UmVuZGVyZXIgdGhpc1xuICAgIEBzcHJpdGVSZW5kZXJlciA9IG5ldyBTcHJpdGVSZW5kZXJlciB0aGlzXG4gICAgQGZvbnQgPSBcImRhcmtmb3Jlc3RcIlxuICAgIEB6b25lcyA9IFtdXG4gICAgQG5leHRBSVRpY2sgPSAxMDAwICMgd2lsbCBiZSBzZXQgYnkgb3B0aW9uc1xuICAgIEBjZW50ZXIgPVxuICAgICAgeDogQHdpZHRoIC8gMlxuICAgICAgeTogQGhlaWdodCAvIDJcbiAgICBAYWFIZWlnaHQgPSBAd2lkdGggKiA5IC8gMTZcbiAgICBAbG9nIFwiaGVpZ2h0OiAje0BoZWlnaHR9LiBoZWlnaHQgaWYgc2NyZWVuIHdhcyAxNjo5IChhc3BlY3QgYWRqdXN0ZWQpOiAje0BhYUhlaWdodH1cIlxuICAgIEBwYXVzZUJ1dHRvblNpemUgPSBAYWFIZWlnaHQgLyAxNVxuICAgIEBjb2xvcnMgPVxuICAgICAgYXJyb3c6ICAgICAgeyByOiAgIDEsIGc6ICAgMSwgYjogICAxLCBhOiAgIDEgfVxuICAgICAgYXJyb3djbG9zZTogeyByOiAgIDEsIGc6IDAuNSwgYjogICAwLCBhOiAwLjMgfVxuICAgICAgYmFja2dyb3VuZDogeyByOiAgIDAsIGc6IDAuMiwgYjogICAwLCBhOiAgIDEgfVxuICAgICAgYmlkOiAgICAgICAgeyByOiAgIDAsIGc6IDAuNiwgYjogICAwLCBhOiAgIDEgfVxuICAgICAgYmxhY2s6ICAgICAgeyByOiAgIDAsIGc6ICAgMCwgYjogICAwLCBhOiAgIDEgfVxuICAgICAgYnV0dG9udGV4dDogeyByOiAgIDEsIGc6ICAgMSwgYjogICAxLCBhOiAgIDEgfVxuICAgICAgZ2FtZV9vdmVyOiAgeyByOiAgIDEsIGc6IDAuNSwgYjogICAwLCBhOiAgIDEgfVxuICAgICAgZ29sZDogICAgICAgeyByOiAgIDEsIGc6ICAgMSwgYjogICAwLCBhOiAgIDEgfVxuICAgICAgaGFuZF9hbnk6ICAgeyByOiAgIDAsIGc6ICAgMCwgYjogMC4yLCBhOiAxLjAgfVxuICAgICAgaGFuZF9waWNrOiAgeyByOiAgIDAsIGc6IDAuMSwgYjogICAwLCBhOiAxLjAgfVxuICAgICAgaGFuZF9yZW9yZzogeyByOiAwLjQsIGc6ICAgMCwgYjogICAwLCBhOiAxLjAgfVxuICAgICAgbGlnaHRncmF5OiAgeyByOiAwLjUsIGc6IDAuNSwgYjogMC41LCBhOiAgIDEgfVxuICAgICAgbG9nYmc6ICAgICAgeyByOiAwLjEsIGc6ICAgMCwgYjogICAwLCBhOiAgIDEgfVxuICAgICAgbG9nY29sb3I6ICAgeyByOiAwLjUsIGc6IDAuNSwgYjogMC41LCBhOiAgIDEgfVxuICAgICAgbWFpbm1lbnU6ICAgeyByOiAwLjEsIGc6IDAuMSwgYjogMC4xLCBhOiAgIDEgfVxuICAgICAgb3JhbmdlOiAgICAgeyByOiAgIDEsIGc6IDAuNSwgYjogICAwLCBhOiAgIDEgfVxuICAgICAgb3ZlcmxheTogICAgeyByOiAgIDAsIGc6ICAgMCwgYjogICAwLCBhOiAwLjYgfVxuICAgICAgcGF1c2VtZW51OiAgeyByOiAwLjEsIGc6IDAuMCwgYjogMC4xLCBhOiAgIDEgfVxuICAgICAgcGlsZTogICAgICAgeyByOiAwLjQsIGc6IDAuMiwgYjogICAwLCBhOiAgIDEgfVxuICAgICAgcGxheV9hZ2FpbjogeyByOiAgIDAsIGc6ICAgMCwgYjogICAwLCBhOiAwLjYgfVxuICAgICAgcmVkOiAgICAgICAgeyByOiAgIDEsIGc6ICAgMCwgYjogICAwLCBhOiAgIDEgfVxuICAgICAgd2hpdGU6ICAgICAgeyByOiAgIDEsIGc6ICAgMSwgYjogICAxLCBhOiAgIDEgfVxuICAgICAgYWNoX2JnOiAgICAgeyByOiAwLjEsIGc6IDAuMSwgYjogMC4xLCBhOiAgIDEgfVxuICAgICAgYWNoX2hlYWRlcjogeyByOiAgIDEsIGc6IDAuNSwgYjogICAwLCBhOiAgIDEgfVxuICAgICAgYWNoX3RpdGxlOiAgeyByOiAgIDEsIGc6ICAgMSwgYjogICAxLCBhOiAgIDEgfVxuICAgICAgYWNoX2Rlc2M6ICAgeyByOiAwLjcsIGc6IDAuNywgYjogMC43LCBhOiAgIDEgfVxuXG4gICAgQHRleHR1cmVzID1cbiAgICAgIFwiY2FyZHNcIjogMFxuICAgICAgXCJkYXJrZm9yZXN0XCI6IDFcbiAgICAgIFwiY2hhcnNcIjogMlxuICAgICAgXCJob3d0bzFcIjogM1xuXG4gICAgQHRoaXJ0ZWVuID0gbnVsbFxuICAgIEBsYXN0RXJyID0gJydcbiAgICBAcGF1c2VkID0gZmFsc2VcbiAgICBAcmVuZGVyTW9kZSA9IDAgIyAwID0gZ2FtZSwgMSA9IGhvd3RvLCAyID0gYWNoaWV2ZW1lbnRzLiB5ZXMsIEknbSBiZWluZyBsYXp5LlxuICAgIEByZW5kZXJDb21tYW5kcyA9IFtdXG4gICAgQGFjaGlldmVtZW50RmFuZmFyZSA9IG51bGxcblxuICAgIEBvcHRpb25NZW51cyA9XG4gICAgICBzcGVlZHM6IFtcbiAgICAgICAgeyB0ZXh0OiBcIkFJIFNwZWVkOiBTbG93XCIsIHNwZWVkOiAyMDAwIH1cbiAgICAgICAgeyB0ZXh0OiBcIkFJIFNwZWVkOiBNZWRpdW1cIiwgc3BlZWQ6IDEwMDAgfVxuICAgICAgICB7IHRleHQ6IFwiQUkgU3BlZWQ6IEZhc3RcIiwgc3BlZWQ6IDUwMCB9XG4gICAgICAgIHsgdGV4dDogXCJBSSBTcGVlZDogVWx0cmFcIiwgc3BlZWQ6IDI1MCB9XG4gICAgICBdXG4gICAgICBzb3J0czogW1xuICAgICAgICB7IHRleHQ6IFwiU29ydCBPcmRlcjogTm9ybWFsXCIgfVxuICAgICAgICB7IHRleHQ6IFwiU29ydCBPcmRlcjogUmV2ZXJzZVwiIH1cbiAgICAgIF1cbiAgICBAb3B0aW9ucyA9XG4gICAgICBzcGVlZEluZGV4OiAxXG4gICAgICBzb3J0SW5kZXg6IDBcbiAgICAgIHNvdW5kOiB0cnVlXG5cbiAgICBAcGF1c2VNZW51ID0gbmV3IE1lbnUgdGhpcywgXCJQYXVzZWRcIiwgXCJzb2xpZFwiLCBAY29sb3JzLnBhdXNlbWVudSwgW1xuICAgICAgKGNsaWNrKSA9PlxuICAgICAgICBpZiBjbGlja1xuICAgICAgICAgIEBwYXVzZWQgPSBmYWxzZVxuICAgICAgICByZXR1cm4gXCJSZXN1bWUgR2FtZVwiXG4gICAgICAoY2xpY2spID0+XG4gICAgICAgIGlmIGNsaWNrXG4gICAgICAgICAgQHJlbmRlck1vZGUgPSAyXG4gICAgICAgIHJldHVybiBcIkFjaGlldmVtZW50c1wiXG4gICAgICAoY2xpY2spID0+XG4gICAgICAgIGlmIGNsaWNrXG4gICAgICAgICAgQHJlbmRlck1vZGUgPSAxXG4gICAgICAgIHJldHVybiBcIkhvdyBUbyBQbGF5XCJcbiAgICAgIChjbGljaykgPT5cbiAgICAgICAgaWYgY2xpY2tcbiAgICAgICAgICBAb3B0aW9ucy5zb3J0SW5kZXggPSAoQG9wdGlvbnMuc29ydEluZGV4ICsgMSkgJSBAb3B0aW9uTWVudXMuc29ydHMubGVuZ3RoXG4gICAgICAgIHJldHVybiBAb3B0aW9uTWVudXMuc29ydHNbQG9wdGlvbnMuc29ydEluZGV4XS50ZXh0XG4gICAgICAoY2xpY2spID0+XG4gICAgICAgIGlmIGNsaWNrXG4gICAgICAgICAgQG9wdGlvbnMuc3BlZWRJbmRleCA9IChAb3B0aW9ucy5zcGVlZEluZGV4ICsgMSkgJSBAb3B0aW9uTWVudXMuc3BlZWRzLmxlbmd0aFxuICAgICAgICByZXR1cm4gQG9wdGlvbk1lbnVzLnNwZWVkc1tAb3B0aW9ucy5zcGVlZEluZGV4XS50ZXh0XG4gICAgICAoY2xpY2spID0+XG4gICAgICAgIGlmIGNsaWNrXG4gICAgICAgICAgQG5ld0dhbWUodHJ1ZSlcbiAgICAgICAgICBAcGF1c2VkID0gZmFsc2VcbiAgICAgICAgcmV0dXJuIFwiTmV3IE1vbmV5IEdhbWVcIlxuICAgICAgKGNsaWNrKSA9PlxuICAgICAgICBpZiBjbGlja1xuICAgICAgICAgIEBuZXdHYW1lKGZhbHNlKVxuICAgICAgICAgIEBwYXVzZWQgPSBmYWxzZVxuICAgICAgICByZXR1cm4gXCJOZXcgR2FtZVwiXG4gICAgXVxuXG4gICAgQHRoaXJ0ZWVuID0gbmV3IFRoaXJ0ZWVuIHRoaXMsIHt9XG4gICAgQGxvZyBcInBsYXllciAwJ3MgaGFuZDogXCIgKyBKU09OLnN0cmluZ2lmeShAdGhpcnRlZW4ucGxheWVyc1swXS5oYW5kKVxuICAgIEBwcmVwYXJlR2FtZSgpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIGxvZ2dpbmdcblxuICBsb2c6IChzKSAtPlxuICAgIEBuYXRpdmUubG9nKHMpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIGxvYWQgLyBzYXZlXG5cbiAgbG9hZDogKGpzb24pIC0+XG4gICAgQGxvZyBcIihDUykgbG9hZGluZyBzdGF0ZVwiXG4gICAgdHJ5XG4gICAgICBzdGF0ZSA9IEpTT04ucGFyc2UganNvblxuICAgIGNhdGNoXG4gICAgICBAbG9nIFwibG9hZCBmYWlsZWQgdG8gcGFyc2Ugc3RhdGU6ICN7anNvbn1cIlxuICAgICAgcmV0dXJuXG4gICAgaWYgc3RhdGUub3B0aW9uc1xuICAgICAgZm9yIGssIHYgb2Ygc3RhdGUub3B0aW9uc1xuICAgICAgICBAb3B0aW9uc1trXSA9IHZcblxuICAgIGlmIHN0YXRlLnRoaXJ0ZWVuXG4gICAgICBAbG9nIFwicmVjcmVhdGluZyBnYW1lIGZyb20gc2F2ZWRhdGFcIlxuICAgICAgQHRoaXJ0ZWVuID0gbmV3IFRoaXJ0ZWVuIHRoaXMsIHtcbiAgICAgICAgc3RhdGU6IHN0YXRlLnRoaXJ0ZWVuXG4gICAgICB9XG4gICAgICBAcHJlcGFyZUdhbWUoKVxuXG4gIHNhdmU6IC0+XG4gICAgIyBAbG9nIFwiKENTKSBzYXZpbmcgc3RhdGVcIlxuICAgIHN0YXRlID0ge1xuICAgICAgb3B0aW9uczogQG9wdGlvbnNcbiAgICB9XG5cbiAgICBpZiBAdGhpcnRlZW4/XG4gICAgICBAdGhpcnRlZW4udXBkYXRlUGxheWVySGFuZChAaGFuZC5jYXJkcylcbiAgICAgIHN0YXRlLnRoaXJ0ZWVuID0gQHRoaXJ0ZWVuLnNhdmUoKVxuXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5IHN0YXRlXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIGFpVGlja1JhdGU6IC0+XG4gICAgcmV0dXJuIEBvcHRpb25NZW51cy5zcGVlZHNbQG9wdGlvbnMuc3BlZWRJbmRleF0uc3BlZWRcblxuICBuZXdHYW1lOiAobW9uZXkpIC0+XG4gICAgQHRoaXJ0ZWVuLm5ld0dhbWUobW9uZXkpXG4gICAgQHByZXBhcmVHYW1lKClcblxuICBwcmVwYXJlR2FtZTogLT5cbiAgICBAaGFuZCA9IG5ldyBIYW5kIHRoaXNcbiAgICBAcGlsZSA9IG5ldyBQaWxlIHRoaXMsIEBoYW5kXG4gICAgQGhhbmQuc2V0IEB0aGlydGVlbi5wbGF5ZXJzWzBdLmhhbmRcbiAgICBAbGFzdEVyciA9ICcnXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIGlucHV0IGhhbmRsaW5nXG5cbiAgdG91Y2hEb3duOiAoeCwgeSkgLT5cbiAgICAjIEBsb2coXCJ0b3VjaERvd24gI3t4fSwje3l9XCIpXG4gICAgQGNoZWNrWm9uZXMoeCwgeSlcblxuICB0b3VjaE1vdmU6ICh4LCB5KSAtPlxuICAgICMgQGxvZyhcInRvdWNoTW92ZSAje3h9LCN7eX1cIilcbiAgICBpZiBAdGhpcnRlZW4gIT0gbnVsbFxuICAgICAgQGhhbmQubW92ZSh4LCB5KVxuXG4gIHRvdWNoVXA6ICh4LCB5KSAtPlxuICAgICMgQGxvZyhcInRvdWNoVXAgI3t4fSwje3l9XCIpXG4gICAgaWYgQHRoaXJ0ZWVuICE9IG51bGxcbiAgICAgIEBoYW5kLnVwKHgsIHkpXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIGhlYWRsaW5lIChnYW1lIHN0YXRlIGluIHRvcCBsZWZ0KVxuXG4gIHByZXR0eUVycm9yVGFibGU6IHtcbiAgICAgIGdhbWVPdmVyOiAgICAgICAgICAgXCJUaGUgZ2FtZSBpcyBvdmVyLlwiXG4gICAgICBpbnZhbGlkUGxheTogICAgICAgIFwiTm90IGEgdmFsaWQgcGxheS5cIlxuICAgICAgbXVzdEJyZWFrT3JQYXNzOiAgICBcIllvdSBwYXNzZWQgYWxyZWFkeSwgc28gMi1icmVha2VyIG9yIHBhc3MuXCJcbiAgICAgIG11c3RQYXNzOiAgICAgICAgICAgXCJZb3UgbXVzdCBwYXNzLlwiXG4gICAgICBtdXN0VGhyb3czUzogICAgICAgIFwiWW91IG11c3QgdXNlIHRoZSAzXFx4YzggaW4geW91ciBwbGF5LlwiXG4gICAgICBub3RZb3VyVHVybjogICAgICAgIFwiSXQgaXMgbm90IHlvdXIgdHVybi5cIlxuICAgICAgdGhyb3dBbnl0aGluZzogICAgICBcIllvdSBoYXZlIGNvbnRyb2wsIHRocm93IGFueXRoaW5nLlwiXG4gICAgICB0b29Mb3dQbGF5OiAgICAgICAgIFwiVGhpcyBwbGF5IGlzIG5vdCBzdHJvbmdlciB0aGFuIHRoZSBjdXJyZW50IHBsYXkuXCJcbiAgICAgIHdyb25nUGxheTogICAgICAgICAgXCJUaGlzIHBsYXkgZG9lcyBub3QgbWF0Y2ggdGhlIGN1cnJlbnQgcGxheS5cIlxuICB9XG5cbiAgcHJldHR5RXJyb3I6IC0+XG4gICAgcHJldHR5ID0gQHByZXR0eUVycm9yVGFibGVbQGxhc3RFcnJdXG4gICAgcmV0dXJuIHByZXR0eSBpZiBwcmV0dHlcbiAgICByZXR1cm4gQGxhc3RFcnJcblxuICBjYWxjSGVhZGxpbmU6IC0+XG4gICAgcmV0dXJuIFwiXCIgaWYgQHRoaXJ0ZWVuID09IG51bGxcblxuICAgIGhlYWRsaW5lID0gQHRoaXJ0ZWVuLmhlYWRsaW5lKClcbiAgICAjIHN3aXRjaCBAdGhpcnRlZW4uc3RhdGVcbiAgICAjICAgd2hlbiBTdGF0ZS5CSURcbiAgICAjICAgICBoZWFkbGluZSA9IFwiV2FpdGluZyBmb3IgYGZmNzcwMGAje0B0aGlydGVlbi5wbGF5ZXJzW0B0aGlydGVlbi50dXJuXS5uYW1lfWBgIHRvIGBmZmZmMDBgYmlkYGBcIlxuICAgICMgICB3aGVuIFN0YXRlLlRSSUNLXG4gICAgIyAgICAgaGVhZGxpbmUgPSBcIldhaXRpbmcgZm9yIGBmZjc3MDBgI3tAdGhpcnRlZW4ucGxheWVyc1tAdGhpcnRlZW4udHVybl0ubmFtZX1gYCB0byBgZmZmZjAwYHBsYXlgYFwiXG4gICAgIyAgIHdoZW4gU3RhdGUuUk9VTkRTVU1NQVJZXG4gICAgIyAgICAgaGVhZGxpbmUgPSBcIldhaXRpbmcgZm9yIG5leHQgcm91bmQuLi5cIlxuICAgICMgICB3aGVuIFN0YXRlLlBPU1RHQU1FU1VNTUFSWVxuICAgICMgICAgIGhlYWRsaW5lID0gXCJHYW1lIG92ZXIhXCJcblxuICAgIGVyclRleHQgPSBcIlwiXG4gICAgaWYgKEBsYXN0RXJyLmxlbmd0aCA+IDApIGFuZCAoQGxhc3RFcnIgIT0gT0spXG4gICAgICBlcnJUZXh0ID0gXCIgIGBmZmZmZmZgRVJST1I6IGBmZjAwMDBgI3tAcHJldHR5RXJyb3IoKX1cIlxuICAgICAgaGVhZGxpbmUgKz0gZXJyVGV4dFxuXG4gICAgcmV0dXJuIGhlYWRsaW5lXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIGdhbWUgb3ZlciBpbmZvcm1hdGlvblxuXG4gIGdhbWVPdmVyVGV4dDogLT5cbiAgICB3aW5uZXIgPSBAdGhpcnRlZW4ud2lubmVyKClcbiAgICBpZiB3aW5uZXIubmFtZSA9PSBcIlBsYXllclwiXG4gICAgICBpZiBAdGhpcnRlZW4ubGFzdFN0cmVhayA9PSAxXG4gICAgICAgIHJldHVybiBbXCJZb3Ugd2luIVwiLCBcIkEgbmV3IHN0cmVhayFcIl1cbiAgICAgIHJldHVybiBbXCJZb3Ugd2luIVwiLCBcIiN7QHRoaXJ0ZWVuLmxhc3RTdHJlYWt9IGluIGEgcm93IVwiXVxuICAgIGlmIEB0aGlydGVlbi5sYXN0U3RyZWFrID09IDBcbiAgICAgIHJldHVybiBbXCIje3dpbm5lci5uYW1lfSB3aW5zIVwiLCBcIlRyeSBhZ2Fpbi4uLlwiXVxuICAgIHJldHVybiBbXCIje3dpbm5lci5uYW1lfSB3aW5zIVwiLCBcIlN0cmVhayBlbmRlZDogI3tAdGhpcnRlZW4ubGFzdFN0cmVha30gd2luc1wiXVxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgY2FyZCBoYW5kbGluZ1xuXG4gIHBhc3M6IC0+XG4gICAgQGxhc3RFcnIgPSBAdGhpcnRlZW4ucGFzcyB7XG4gICAgICBpZDogMVxuICAgIH1cblxuICBwbGF5OiAoY2FyZHMpIC0+XG4gICAgY29uc29sZS5sb2cgXCIoZ2FtZSkgcGxheWluZyBjYXJkc1wiLCBjYXJkc1xuXG4gICAgQHRoaXJ0ZWVuLnVwZGF0ZVBsYXllckhhbmQoQGhhbmQuY2FyZHMpXG5cbiAgICByYXdDYXJkcyA9IFtdXG4gICAgZm9yIGNhcmQgaW4gY2FyZHNcbiAgICAgIHJhd0NhcmRzLnB1c2ggY2FyZC5jYXJkXG5cbiAgICByZXQgPSBAdGhpcnRlZW4ucGxheSB7XG4gICAgICBpZDogMVxuICAgICAgY2FyZHM6IHJhd0NhcmRzXG4gICAgfVxuICAgIEBsYXN0RXJyID0gcmV0XG4gICAgaWYgcmV0ID09IE9LXG4gICAgICBAaGFuZC5zZXQgQHRoaXJ0ZWVuLnBsYXllcnNbMF0uaGFuZFxuICAgICAgQHBpbGUuaGludCBjYXJkc1xuXG4gIHBsYXlQaWNrZWQ6IC0+XG4gICAgaWYgbm90IEBoYW5kLnBpY2tpbmdcbiAgICAgIHJldHVyblxuICAgIGNhcmRzID0gQGhhbmQuc2VsZWN0ZWRDYXJkcygpXG4gICAgIyBAaGFuZC5zZWxlY3ROb25lKClcbiAgICBpZiBjYXJkcy5sZW5ndGggPT0gMFxuICAgICAgcmV0dXJuIEBwYXNzKClcbiAgICAjIEBoYW5kLnRvZ2dsZVBpY2tpbmcoKVxuICAgIHJldHVybiBAcGxheShjYXJkcylcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgbWFpbiBsb29wXG5cbiAgdXBkYXRlOiAoZHQpIC0+XG4gICAgQHpvbmVzLmxlbmd0aCA9IDAgIyBmb3JnZXQgYWJvdXQgem9uZXMgZnJvbSB0aGUgbGFzdCBmcmFtZS4gd2UncmUgYWJvdXQgdG8gbWFrZSBzb21lIG5ldyBvbmVzIVxuXG4gICAgdXBkYXRlZCA9IGZhbHNlXG4gICAgaWYgQHVwZGF0ZUdhbWUoZHQpXG4gICAgICB1cGRhdGVkID0gdHJ1ZVxuXG4gICAgcmV0dXJuIHVwZGF0ZWRcblxuICB1cGRhdGVHYW1lOiAoZHQpIC0+XG4gICAgcmV0dXJuIGZhbHNlIGlmIEB0aGlydGVlbiA9PSBudWxsXG5cbiAgICB1cGRhdGVkID0gZmFsc2VcblxuICAgIGlmIEBwaWxlLnVwZGF0ZShkdClcbiAgICAgIHVwZGF0ZWQgPSB0cnVlXG4gICAgaWYgQHBpbGUucmVhZHlGb3JOZXh0VHJpY2soKVxuICAgICAgQG5leHRBSVRpY2sgLT0gZHRcbiAgICAgIGlmIEBuZXh0QUlUaWNrIDw9IDBcbiAgICAgICAgQG5leHRBSVRpY2sgPSBAYWlUaWNrUmF0ZSgpXG4gICAgICAgIGlmIEB0aGlydGVlbi5haVRpY2soKVxuICAgICAgICAgIHVwZGF0ZWQgPSB0cnVlXG4gICAgaWYgQGhhbmQudXBkYXRlKGR0KVxuICAgICAgdXBkYXRlZCA9IHRydWVcblxuICAgIEBwaWxlLnNldCBAdGhpcnRlZW4udGhyb3dJRCwgQHRoaXJ0ZWVuLnBpbGUsIEB0aGlydGVlbi5waWxlV2hvXG5cbiAgICBpZiBAcGF1c2VNZW51LnVwZGF0ZShkdClcbiAgICAgIHVwZGF0ZWQgPSB0cnVlXG5cbiAgICBpZiBAYWNoaWV2ZW1lbnRGYW5mYXJlICE9IG51bGxcbiAgICAgIEBhY2hpZXZlbWVudEZhbmZhcmUudGltZSArPSBkdFxuICAgICAgaWYgQGFjaGlldmVtZW50RmFuZmFyZS50aW1lID4gNTAwMFxuICAgICAgICBAYWNoaWV2ZW1lbnRGYW5mYXJlID0gbnVsbFxuICAgICAgdXBkYXRlZCA9IHRydWVcblxuICAgIGlmIEBhY2hpZXZlbWVudEZhbmZhcmUgPT0gbnVsbFxuICAgICAgaWYgQHRoaXJ0ZWVuLmZhbmZhcmVzLmxlbmd0aCA+IDBcbiAgICAgICAgQGFjaGlldmVtZW50RmFuZmFyZSA9XG4gICAgICAgICAgdGl0bGU6IEB0aGlydGVlbi5mYW5mYXJlcy5zaGlmdCgpXG4gICAgICAgICAgdGltZTogMFxuXG4gICAgcmV0dXJuIHVwZGF0ZWRcblxuICByZW5kZXI6IC0+XG4gICAgIyBSZXNldCByZW5kZXIgY29tbWFuZHNcbiAgICBAcmVuZGVyQ29tbWFuZHMubGVuZ3RoID0gMFxuXG4gICAgaWYgQHJlbmRlck1vZGUgPT0gMVxuICAgICAgQHJlbmRlckhvd3RvKClcbiAgICBlbHNlIGlmIEByZW5kZXJNb2RlID09IDJcbiAgICAgIEByZW5kZXJBY2hpZXZlbWVudHMoKVxuICAgIGVsc2VcbiAgICAgIEByZW5kZXJHYW1lKClcblxuICAgIHJldHVybiBAcmVuZGVyQ29tbWFuZHNcblxuICByZW5kZXJIb3d0bzogLT5cbiAgICBob3d0b1RleHR1cmUgPSBcImhvd3RvMVwiXG4gICAgQGxvZyBcInJlbmRlcmluZyAje2hvd3RvVGV4dHVyZX1cIlxuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJzb2xpZFwiLCAwLCAwLCBAd2lkdGgsIEBoZWlnaHQsIDAsIDAsIDAsIEBjb2xvcnMuYmxhY2tcbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIGhvd3RvVGV4dHVyZSwgMCwgMCwgQHdpZHRoLCBAYWFIZWlnaHQsIDAsIDAsIDAsIEBjb2xvcnMud2hpdGUsID0+XG4gICAgICBAcmVuZGVyTW9kZSA9IDBcblxuICBkZWJ1ZzogLT5cbiAgICBjb25zb2xlLmxvZyBcImRlYnVnIGFjaFwiXG4gICAgY29uc29sZS5sb2cgQHRoaXJ0ZWVuLmFjaFxuICAgICMgQHRoaXJ0ZWVuLmFjaC5lYXJuZWQgPSB7fVxuICAgICMgQHRoaXJ0ZWVuLmFjaC5lYXJuZWQudmV0ZXJhbiA9IHRydWVcbiAgICAjIEB0aGlydGVlbi5hY2guZWFybmVkLnRyeWhhcmQgPSB0cnVlXG4gICAgIyBAdGhpcnRlZW4uYWNoLmVhcm5lZC5icmVha2VyID0gdHJ1ZVxuICAgICMgQHRoaXJ0ZWVuLmFjaC5lYXJuZWQua2VlcGl0bG93ID0gdHJ1ZVxuICAgICMgQHRoaXJ0ZWVuLmFjaC5lYXJuZWQuc3VpdGVkID0gdHJ1ZVxuICAgICMgQHRoaXJ0ZWVuLmFjaC5lYXJuZWQudG9ueSA9IHRydWVcbiAgICAjIEB0aGlydGVlbi5hY2guZWFybmVkLnNhbXBsZXIgPSB0cnVlXG4gICAgIyBAdGhpcnRlZW4uYWNoLmVhcm5lZC50cmFnZWR5ID0gdHJ1ZVxuICAgICMgQHRoaXJ0ZWVuLmFjaC5lYXJuZWQuaW5kb21pdGFibGUgPSB0cnVlXG4gICAgIyBAdGhpcnRlZW4uYWNoLmVhcm5lZC5yZWt0ID0gdHJ1ZVxuICAgICMgQHRoaXJ0ZWVuLmFjaC5lYXJuZWQubGF0ZSA9IHRydWVcbiAgICAjIEB0aGlydGVlbi5hY2guZWFybmVkLnBhaXJzID0gdHJ1ZVxuXG4gICAgIyBAdGhpcnRlZW4uYWNoLnN0YXRlLnRvdGFsR2FtZXMgPSAwXG4gICAgIyBAdGhpcnRlZW4uc3RyZWFrID0gMFxuXG4gIHJlbmRlckFjaGlldmVtZW50czogLT5cbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwic29saWRcIiwgMCwgMCwgQHdpZHRoLCBAaGVpZ2h0LCAwLCAwLCAwLCBAY29sb3JzLmFjaF9iZywgPT5cbiAgICAgIEByZW5kZXJNb2RlID0gMFxuXG4gICAgdGl0bGVIZWlnaHQgPSBAaGVpZ2h0IC8gMjBcbiAgICB0aXRsZU9mZnNldCA9IHRpdGxlSGVpZ2h0IC8gMlxuICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCB0aXRsZUhlaWdodCwgXCJBY2hpZXZlbWVudHNcIiwgQGNlbnRlci54LCB0aXRsZU9mZnNldCwgMC41LCAwLjUsIEBjb2xvcnMuYWNoX2hlYWRlclxuXG4gICAgaW1hZ2VNYXJnaW4gPSBAd2lkdGggLyAxNVxuICAgIHRvcEhlaWdodCA9IHRpdGxlSGVpZ2h0XG4gICAgeCA9IEB3aWR0aCAvIDEyMFxuICAgIHkgPSB0b3BIZWlnaHRcbiAgICB0aXRsZUhlaWdodCA9IEBoZWlnaHQgLyAyMlxuICAgIGRlc2NIZWlnaHQgPSBAaGVpZ2h0IC8gMzBcbiAgICBpbWFnZURpbSA9IHRpdGxlSGVpZ2h0ICogMlxuICAgIGZvciBhY2gsIGFjaEluZGV4IGluIGFjaGlldmVtZW50c0xpc3RcbiAgICAgIGljb24gPSBcInN0YXJfb2ZmXCJcbiAgICAgIGlmIEB0aGlydGVlbi5hY2guZWFybmVkW2FjaC5pZF1cbiAgICAgICAgaWNvbiA9IFwic3Rhcl9vblwiXG4gICAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIGljb24sIHgsIHksIGltYWdlRGltLCBpbWFnZURpbSwgMCwgMCwgMCwgQGNvbG9ycy53aGl0ZVxuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIHRpdGxlSGVpZ2h0LCBhY2gudGl0bGUsIHggKyBpbWFnZU1hcmdpbiwgeSwgMCwgMCwgQGNvbG9ycy5hY2hfdGl0bGVcbiAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCBkZXNjSGVpZ2h0LCBhY2guZGVzY3JpcHRpb25bMF0sIHggKyBpbWFnZU1hcmdpbiwgeSArIHRpdGxlSGVpZ2h0LCAwLCAwLCBAY29sb3JzLmFjaF9kZXNjXG4gICAgICBpZiBhY2gucHJvZ3Jlc3M/XG4gICAgICAgIHByb2dyZXNzID0gYWNoLnByb2dyZXNzKEB0aGlydGVlbi5hY2gpXG4gICAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCBkZXNjSGVpZ2h0LCBwcm9ncmVzcywgeCArIGltYWdlTWFyZ2luLCB5ICsgdGl0bGVIZWlnaHQgKyBkZXNjSGVpZ2h0LCAwLCAwLCBAY29sb3JzLmFjaF9kZXNjXG4gICAgICBlbHNlXG4gICAgICAgIGlmIGFjaC5kZXNjcmlwdGlvbi5sZW5ndGggPiAxXG4gICAgICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIGRlc2NIZWlnaHQsIGFjaC5kZXNjcmlwdGlvblsxXSwgeCArIGltYWdlTWFyZ2luLCB5ICsgdGl0bGVIZWlnaHQgKyBkZXNjSGVpZ2h0LCAwLCAwLCBAY29sb3JzLmFjaF9kZXNjXG4gICAgICBpZiBhY2hJbmRleCA9PSA2XG4gICAgICAgIHkgPSB0b3BIZWlnaHRcbiAgICAgICAgeCArPSBAd2lkdGggLyAyXG4gICAgICBlbHNlXG4gICAgICAgIHkgKz0gdGl0bGVIZWlnaHQgKiAzXG5cbiAgcmVuZGVyR2FtZTogLT5cblxuICAgICMgYmFja2dyb3VuZFxuICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJzb2xpZFwiLCAwLCAwLCBAd2lkdGgsIEBoZWlnaHQsIDAsIDAsIDAsIEBjb2xvcnMuYmFja2dyb3VuZFxuXG4gICAgdGV4dEhlaWdodCA9IEBhYUhlaWdodCAvIDI1XG4gICAgdGV4dFBhZGRpbmcgPSB0ZXh0SGVpZ2h0IC8gNVxuICAgIGNoYXJhY3RlckhlaWdodCA9IEBhYUhlaWdodCAvIDVcbiAgICBjb3VudEhlaWdodCA9IHRleHRIZWlnaHRcblxuICAgIGRyYXdHYW1lT3ZlciA9IEB0aGlydGVlbi5nYW1lT3ZlcigpIGFuZCBAcGlsZS5yZXN0aW5nKClcblxuICAgICMgTG9nXG4gICAgZm9yIGxpbmUsIGkgaW4gQHRoaXJ0ZWVuLmxvZ1xuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIHRleHRIZWlnaHQsIGxpbmUsIDAsIChpKzEuNSkgKiAodGV4dEhlaWdodCArIHRleHRQYWRkaW5nKSwgMCwgMCwgQGNvbG9ycy5sb2djb2xvclxuXG4gICAgYWlQbGF5ZXJzID0gW1xuICAgICAgQHRoaXJ0ZWVuLnBsYXllcnNbMV1cbiAgICAgIEB0aGlydGVlbi5wbGF5ZXJzWzJdXG4gICAgICBAdGhpcnRlZW4ucGxheWVyc1szXVxuICAgIF1cblxuICAgIGNoYXJhY3Rlck1hcmdpbiA9IGNoYXJhY3RlckhlaWdodCAvIDJcbiAgICBAY2hhckNlaWxpbmcgPSBAaGVpZ2h0ICogMC42XG5cbiAgICAjIGxlZnQgc2lkZVxuICAgIGlmIGFpUGxheWVyc1swXSAhPSBudWxsXG4gICAgICBjaGFyYWN0ZXIgPSBhaUNoYXJhY3RlcnNbYWlQbGF5ZXJzWzBdLmNoYXJJRF1cbiAgICAgIGNoYXJhY3RlcldpZHRoID0gQHNwcml0ZVJlbmRlcmVyLmNhbGNXaWR0aChjaGFyYWN0ZXIuc3ByaXRlLCBjaGFyYWN0ZXJIZWlnaHQpXG4gICAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIGNoYXJhY3Rlci5zcHJpdGUsIGNoYXJhY3Rlck1hcmdpbiwgQGNoYXJDZWlsaW5nLCAwLCBjaGFyYWN0ZXJIZWlnaHQsIDAsIDAsIDEsIEBjb2xvcnMud2hpdGUsID0+XG4gICAgICAgICMgQGRlYnVnKClcbiAgICAgIEByZW5kZXJDb3VudCBhaVBsYXllcnNbMF0sIEB0aGlydGVlbi5tb25leSwgZHJhd0dhbWVPdmVyLCBhaVBsYXllcnNbMF0uaW5kZXggPT0gQHRoaXJ0ZWVuLnR1cm4sIGNvdW50SGVpZ2h0LCBjaGFyYWN0ZXJNYXJnaW4gKyAoY2hhcmFjdGVyV2lkdGggLyAyKSwgQGNoYXJDZWlsaW5nIC0gdGV4dFBhZGRpbmcsIDAuNSwgMFxuXG4gICAgIyB0b3Agc2lkZVxuICAgIGlmIGFpUGxheWVyc1sxXSAhPSBudWxsXG4gICAgICBjaGFyYWN0ZXIgPSBhaUNoYXJhY3RlcnNbYWlQbGF5ZXJzWzFdLmNoYXJJRF1cbiAgICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgY2hhcmFjdGVyLnNwcml0ZSwgQGNlbnRlci54LCAwLCAwLCBjaGFyYWN0ZXJIZWlnaHQsIDAsIDAuNSwgMCwgQGNvbG9ycy53aGl0ZVxuICAgICAgQHJlbmRlckNvdW50IGFpUGxheWVyc1sxXSwgQHRoaXJ0ZWVuLm1vbmV5LCBkcmF3R2FtZU92ZXIsIGFpUGxheWVyc1sxXS5pbmRleCA9PSBAdGhpcnRlZW4udHVybiwgY291bnRIZWlnaHQsIEBjZW50ZXIueCwgY2hhcmFjdGVySGVpZ2h0LCAwLjUsIDBcblxuICAgICMgcmlnaHQgc2lkZVxuICAgIGlmIGFpUGxheWVyc1syXSAhPSBudWxsXG4gICAgICBjaGFyYWN0ZXIgPSBhaUNoYXJhY3RlcnNbYWlQbGF5ZXJzWzJdLmNoYXJJRF1cbiAgICAgIGNoYXJhY3RlcldpZHRoID0gQHNwcml0ZVJlbmRlcmVyLmNhbGNXaWR0aChjaGFyYWN0ZXIuc3ByaXRlLCBjaGFyYWN0ZXJIZWlnaHQpXG4gICAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIGNoYXJhY3Rlci5zcHJpdGUsIEB3aWR0aCAtIGNoYXJhY3Rlck1hcmdpbiwgQGNoYXJDZWlsaW5nLCAwLCBjaGFyYWN0ZXJIZWlnaHQsIDAsIDEsIDEsIEBjb2xvcnMud2hpdGVcbiAgICAgIEByZW5kZXJDb3VudCBhaVBsYXllcnNbMl0sIEB0aGlydGVlbi5tb25leSwgZHJhd0dhbWVPdmVyLCBhaVBsYXllcnNbMl0uaW5kZXggPT0gQHRoaXJ0ZWVuLnR1cm4sIGNvdW50SGVpZ2h0LCBAd2lkdGggLSAoY2hhcmFjdGVyTWFyZ2luICsgKGNoYXJhY3RlcldpZHRoIC8gMikpLCBAY2hhckNlaWxpbmcgLSB0ZXh0UGFkZGluZywgMC41LCAwXG5cbiAgICAjIGNhcmQgYXJlYVxuICAgIGhhbmRBcmVhSGVpZ2h0ID0gMC4yNyAqIEBoZWlnaHRcbiAgICBjYXJkQXJlYVRleHQgPSBudWxsXG4gICAgaWYgQGhhbmQucGlja2luZ1xuICAgICAgaGFuZGFyZWFDb2xvciA9IEBjb2xvcnMuaGFuZF9waWNrXG4gICAgICBpZiAoQHRoaXJ0ZWVuLnR1cm4gPT0gMCkgYW5kIChAdGhpcnRlZW4uZXZlcnlvbmVQYXNzZWQoKSBvciAoQHRoaXJ0ZWVuLmN1cnJlbnRQbGF5ID09IG51bGwpKVxuICAgICAgICBoYW5kYXJlYUNvbG9yID0gQGNvbG9ycy5oYW5kX2FueVxuICAgICAgICBpZiBAdGhpcnRlZW4ucGlsZS5sZW5ndGggPT0gMFxuICAgICAgICAgIGNhcmRBcmVhVGV4dCA9ICdBbnl0aGluZyAoM1xceGM4KSdcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGNhcmRBcmVhVGV4dCA9ICdBbnl0aGluZydcbiAgICBlbHNlXG4gICAgICBjYXJkQXJlYVRleHQgPSAnVW5sb2NrZWQnXG4gICAgICBoYW5kYXJlYUNvbG9yID0gQGNvbG9ycy5oYW5kX3Jlb3JnXG4gICAgQHNwcml0ZVJlbmRlcmVyLnJlbmRlciBcInNvbGlkXCIsIDAsIEBoZWlnaHQsIEB3aWR0aCwgaGFuZEFyZWFIZWlnaHQsIDAsIDAsIDEsIGhhbmRhcmVhQ29sb3IsID0+XG4gICAgICBAaGFuZC50b2dnbGVQaWNraW5nKClcblxuICAgICMgcGlsZVxuICAgIHBpbGVEaW1lbnNpb24gPSBAaGVpZ2h0ICogMC40XG4gICAgcGlsZVNwcml0ZSA9IFwicGlsZVwiXG4gICAgaWYgKEB0aGlydGVlbi50dXJuID49IDApIGFuZCAoQHRoaXJ0ZWVuLnR1cm4gPD0gMylcbiAgICAgIHBpbGVTcHJpdGUgKz0gQHRoaXJ0ZWVuLnR1cm5cbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIHBpbGVTcHJpdGUsIEB3aWR0aCAvIDIsIEBoZWlnaHQgLyAyLCBwaWxlRGltZW5zaW9uLCBwaWxlRGltZW5zaW9uLCAwLCAwLjUsIDAuNSwgQGNvbG9ycy53aGl0ZSwgPT5cbiAgICAgIEBwbGF5UGlja2VkKClcbiAgICBAcGlsZS5yZW5kZXIoKVxuXG4gICAgQGhhbmQucmVuZGVyKClcblxuICAgIGlmIGRyYXdHYW1lT3ZlclxuICAgICAgIyBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwic29saWRcIiwgMCwgMCwgQHdpZHRoLCBAaGVpZ2h0IC0gaGFuZEFyZWFIZWlnaHQsIDAsIDAsIDAsIEBjb2xvcnMucGxheV9hZ2FpblxuXG4gICAgICBsaW5lcyA9IEBnYW1lT3ZlclRleHQoKVxuICAgICAgZ2FtZU92ZXJTaXplID0gQGFhSGVpZ2h0IC8gOFxuICAgICAgZ2FtZU92ZXJZID0gQGNlbnRlci55XG4gICAgICBpZiBsaW5lcy5sZW5ndGggPiAxXG4gICAgICAgIGdhbWVPdmVyWSAtPSAoZ2FtZU92ZXJTaXplID4+IDEpXG4gICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgZ2FtZU92ZXJTaXplLCBsaW5lc1swXSwgQGNlbnRlci54LCBnYW1lT3ZlclksIDAuNSwgMC41LCBAY29sb3JzLmdhbWVfb3ZlclxuICAgICAgaWYgbGluZXMubGVuZ3RoID4gMVxuICAgICAgICBnYW1lT3ZlclkgKz0gZ2FtZU92ZXJTaXplXG4gICAgICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCBnYW1lT3ZlclNpemUsIGxpbmVzWzFdLCBAY2VudGVyLngsIGdhbWVPdmVyWSwgMC41LCAwLjUsIEBjb2xvcnMuZ2FtZV9vdmVyXG5cbiAgICAgIEBzcHJpdGVSZW5kZXJlci5yZW5kZXIgXCJzb2xpZFwiLCAwLCBAaGVpZ2h0LCBAd2lkdGgsIGhhbmRBcmVhSGVpZ2h0LCAwLCAwLCAxLCBAY29sb3JzLnBsYXlfYWdhaW4sID0+XG4gICAgICAgIEB0aGlydGVlbi5kZWFsKClcbiAgICAgICAgQHByZXBhcmVHYW1lKClcblxuICAgICAgcmVzdGFydFF1aXRTaXplID0gQGFhSGVpZ2h0IC8gMTJcbiAgICAgIHNoYWRvd0Rpc3RhbmNlID0gcmVzdGFydFF1aXRTaXplIC8gOFxuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIHJlc3RhcnRRdWl0U2l6ZSwgXCJQbGF5IEFnYWluXCIsIHNoYWRvd0Rpc3RhbmNlICsgQGNlbnRlci54LCBzaGFkb3dEaXN0YW5jZSArIChAaGVpZ2h0IC0gKGhhbmRBcmVhSGVpZ2h0ICogMC41KSksIDAuNSwgMSwgQGNvbG9ycy5ibGFja1xuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIHJlc3RhcnRRdWl0U2l6ZSwgXCJQbGF5IEFnYWluXCIsIEBjZW50ZXIueCwgQGhlaWdodCAtIChoYW5kQXJlYUhlaWdodCAqIDAuNSksIDAuNSwgMSwgQGNvbG9ycy5nb2xkXG5cbiAgICBAcmVuZGVyQ291bnQgQHRoaXJ0ZWVuLnBsYXllcnNbMF0sIEB0aGlydGVlbi5tb25leSwgZHJhd0dhbWVPdmVyLCAwID09IEB0aGlydGVlbi50dXJuLCBjb3VudEhlaWdodCwgQGNlbnRlci54LCBAaGVpZ2h0LCAwLjUsIDFcblxuICAgICMgSGVhZGxpbmUgKGluY2x1ZGVzIGVycm9yKVxuICAgIEBmb250UmVuZGVyZXIucmVuZGVyIEBmb250LCB0ZXh0SGVpZ2h0LCBAY2FsY0hlYWRsaW5lKCksIDAsIDAsIDAsIDAsIEBjb2xvcnMubGlnaHRncmF5XG5cbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwicGF1c2VcIiwgQHdpZHRoLCAwLCAwLCBAcGF1c2VCdXR0b25TaXplLCAwLCAxLCAwLCBAY29sb3JzLndoaXRlLCA9PlxuICAgICAgQHBhdXNlZCA9IHRydWVcblxuICAgIGlmIGNhcmRBcmVhVGV4dCAhPSBudWxsXG4gICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgdGV4dEhlaWdodCwgY2FyZEFyZWFUZXh0LCAwLjAyICogQHdpZHRoLCBAaGVpZ2h0IC0gaGFuZEFyZWFIZWlnaHQsIDAsIDAsIEBjb2xvcnMud2hpdGVcblxuICAgIGlmIEBhY2hpZXZlbWVudEZhbmZhcmUgIT0gbnVsbFxuICAgICAgaWYgQGFjaGlldmVtZW50RmFuZmFyZS50aW1lIDwgMTAwMFxuICAgICAgICBvcGFjaXR5ID0gQGFjaGlldmVtZW50RmFuZmFyZS50aW1lIC8gMTAwMFxuICAgICAgZWxzZSBpZiBAYWNoaWV2ZW1lbnRGYW5mYXJlLnRpbWUgPiA0MDAwXG4gICAgICAgIG9wYWNpdHkgPSAxIC0gKChAYWNoaWV2ZW1lbnRGYW5mYXJlLnRpbWUgLSA0MDAwKSAvIDEwMDApXG4gICAgICBlbHNlXG4gICAgICAgIG9wYWNpdHkgPSAxXG4gICAgICBjb2xvciA9IHtyOjEsIGc6MSwgYjoxLCBhOm9wYWNpdHl9XG4gICAgICB4ID0gQHdpZHRoICogMC42XG4gICAgICB5ID0gMFxuICAgICAgeFRleHQgPSB4ICsgKEB3aWR0aCAqIDAuMDYpXG4gICAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwiYXVcIiwgeCwgeSwgMCwgQGhlaWdodCAvIDEwLCAwLCAwLCAwLCBjb2xvciwgPT5cbiAgICAgICAgQGFjaGlldmVtZW50RmFuZmFyZSA9IG51bGxcbiAgICAgICAgQHJlbmRlck1vZGUgPSAyXG4gICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgdGV4dEhlaWdodCwgXCJBY2hpZXZlbWVudCBFYXJuZWRcIiwgeFRleHQsIHksIDAsIDAsIGNvbG9yXG4gICAgICBAZm9udFJlbmRlcmVyLnJlbmRlciBAZm9udCwgdGV4dEhlaWdodCwgQGFjaGlldmVtZW50RmFuZmFyZS50aXRsZSwgeFRleHQsIHkgKyB0ZXh0SGVpZ2h0LCAwLCAwLCBjb2xvclxuXG4gICAgaWYgQHBhdXNlZFxuICAgICAgQHBhdXNlTWVudS5yZW5kZXIoKVxuXG4gICAgcmV0dXJuXG5cbiAgcmVuZGVyQ291bnQ6IChwbGF5ZXIsIG1vbmV5LCBkcmF3R2FtZU92ZXIsIG15VHVybiwgY291bnRIZWlnaHQsIHgsIHksIGFuY2hvcngsIGFuY2hvcnkpIC0+XG4gICAgaWYgbXlUdXJuXG4gICAgICBuYW1lQ29sb3IgPSBcImBmZjc3MDBgXCJcbiAgICBlbHNlXG4gICAgICBuYW1lQ29sb3IgPSBcIlwiXG4gICAgbmFtZVN0cmluZyA9IFwiICN7bmFtZUNvbG9yfSN7cGxheWVyLm5hbWV9YGBcIlxuICAgIGlmIG1vbmV5XG4gICAgICBwbGF5ZXIubW9uZXkgPz0gMFxuICAgICAgbmFtZVN0cmluZyArPSBcIjogJCBgYWFmZmFhYCN7cGxheWVyLm1vbmV5fVwiXG4gICAgbmFtZVN0cmluZyArPSBcIiBcIlxuICAgIGNhcmRDb3VudCA9IHBsYXllci5oYW5kLmxlbmd0aFxuICAgIGlmIGRyYXdHYW1lT3ZlciBvciAoY2FyZENvdW50ID09IDApXG4gICAgICBpZiBtb25leVxuICAgICAgICBwbGFjZVN0cmluZyA9IFwiNHRoXCJcbiAgICAgICAgaWYgcGxheWVyLnBsYWNlID09IDFcbiAgICAgICAgICBwbGFjZVN0cmluZyA9IFwiMXN0XCJcbiAgICAgICAgZWxzZSBpZiBwbGF5ZXIucGxhY2UgPT0gMlxuICAgICAgICAgIHBsYWNlU3RyaW5nID0gXCIybmRcIlxuICAgICAgICBlbHNlIGlmIHBsYXllci5wbGFjZSA9PSAzXG4gICAgICAgICAgcGxhY2VTdHJpbmcgPSBcIjNyZFwiXG4gICAgICAgIGNvdW50U3RyaW5nID0gXCIgYGZmYWFmZmAje3BsYWNlU3RyaW5nfWBgIFBsYWNlIFwiXG4gICAgICBlbHNlXG4gICAgICAgIGlmIHBsYXllci5wbGFjZSA9PSAxXG4gICAgICAgICAgY291bnRTdHJpbmcgPSBcIiBgZmZmZmFhYFdpbm5lcmBgIFwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBjb3VudFN0cmluZyA9IFwiIGBmZmFhZmZgTG9zZXJgYCBcIlxuICAgIGVsc2VcbiAgICAgIGNvdW50U3RyaW5nID0gXCIgYGZmZmYzM2Aje2NhcmRDb3VudH1gYCBsZWZ0IFwiXG5cbiAgICBuYW1lU2l6ZSA9IEBmb250UmVuZGVyZXIuc2l6ZShAZm9udCwgY291bnRIZWlnaHQsIG5hbWVTdHJpbmcpXG4gICAgY291bnRTaXplID0gQGZvbnRSZW5kZXJlci5zaXplKEBmb250LCBjb3VudEhlaWdodCwgY291bnRTdHJpbmcpXG4gICAgaWYgbmFtZVNpemUudyA+IGNvdW50U2l6ZS53XG4gICAgICBjb3VudFNpemUudyA9IG5hbWVTaXplLndcbiAgICBlbHNlXG4gICAgICBuYW1lU2l6ZS53ID0gY291bnRTaXplLndcbiAgICBuYW1lWSA9IHlcbiAgICBjb3VudFkgPSB5XG4gICAgYm94SGVpZ2h0ID0gY291bnRTaXplLmhcbiAgICBpZiB0cnVlICMgcGxheWVyLmlkICE9IDFcbiAgICAgIGJveEhlaWdodCAqPSAyXG4gICAgICBpZiBhbmNob3J5ID4gMFxuICAgICAgICBuYW1lWSAtPSBjb3VudEhlaWdodFxuICAgICAgZWxzZVxuICAgICAgICBjb3VudFkgKz0gY291bnRIZWlnaHRcbiAgICBAc3ByaXRlUmVuZGVyZXIucmVuZGVyIFwic29saWRcIiwgeCwgeSwgY291bnRTaXplLncsIGJveEhlaWdodCwgMCwgYW5jaG9yeCwgYW5jaG9yeSwgQGNvbG9ycy5vdmVybGF5XG4gICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIGNvdW50SGVpZ2h0LCBuYW1lU3RyaW5nLCB4LCBuYW1lWSwgYW5jaG9yeCwgYW5jaG9yeSwgQGNvbG9ycy53aGl0ZVxuICAgIGlmIHRydWUgIyBwbGF5ZXIuaWQgIT0gMVxuICAgICAgQGZvbnRSZW5kZXJlci5yZW5kZXIgQGZvbnQsIGNvdW50SGVpZ2h0LCBjb3VudFN0cmluZywgeCwgY291bnRZLCBhbmNob3J4LCBhbmNob3J5LCBAY29sb3JzLndoaXRlXG5cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIHJlbmRlcmluZyBhbmQgem9uZXNcblxuICBkcmF3SW1hZ2U6ICh0ZXh0dXJlLCBzeCwgc3ksIHN3LCBzaCwgZHgsIGR5LCBkdywgZGgsIHJvdCwgYW5jaG9yeCwgYW5jaG9yeSwgciwgZywgYiwgYSwgY2IpIC0+XG4gICAgQHJlbmRlckNvbW1hbmRzLnB1c2ggQHRleHR1cmVzW3RleHR1cmVdLCBzeCwgc3ksIHN3LCBzaCwgZHgsIGR5LCBkdywgZGgsIHJvdCwgYW5jaG9yeCwgYW5jaG9yeSwgciwgZywgYiwgYVxuXG4gICAgaWYgY2I/XG4gICAgICAjIGNhbGxlciB3YW50cyB0byByZW1lbWJlciB3aGVyZSB0aGlzIHdhcyBkcmF3biwgYW5kIHdhbnRzIHRvIGJlIGNhbGxlZCBiYWNrIGlmIGl0IGlzIGV2ZXIgdG91Y2hlZFxuICAgICAgIyBUaGlzIGlzIGNhbGxlZCBhIFwiem9uZVwiLiBTaW5jZSB6b25lcyBhcmUgdHJhdmVyc2VkIGluIHJldmVyc2Ugb3JkZXIsIHRoZSBuYXR1cmFsIG92ZXJsYXAgb2ZcbiAgICAgICMgYSBzZXJpZXMgb2YgcmVuZGVycyBpcyByZXNwZWN0ZWQgYWNjb3JkaW5nbHkuXG4gICAgICBhbmNob3JPZmZzZXRYID0gLTEgKiBhbmNob3J4ICogZHdcbiAgICAgIGFuY2hvck9mZnNldFkgPSAtMSAqIGFuY2hvcnkgKiBkaFxuICAgICAgem9uZSA9XG4gICAgICAgICMgY2VudGVyIChYLFkpIGFuZCByZXZlcnNlZCByb3RhdGlvbiwgdXNlZCB0byBwdXQgdGhlIGNvb3JkaW5hdGUgaW4gbG9jYWwgc3BhY2UgdG8gdGhlIHpvbmVcbiAgICAgICAgY3g6ICBkeFxuICAgICAgICBjeTogIGR5XG4gICAgICAgIHJvdDogcm90ICogLTFcbiAgICAgICAgIyB0aGUgYXhpcyBhbGlnbmVkIGJvdW5kaW5nIGJveCB1c2VkIGZvciBkZXRlY3Rpb24gb2YgYSBsb2NhbHNwYWNlIGNvb3JkXG4gICAgICAgIGw6ICAgYW5jaG9yT2Zmc2V0WFxuICAgICAgICB0OiAgIGFuY2hvck9mZnNldFlcbiAgICAgICAgcjogICBhbmNob3JPZmZzZXRYICsgZHdcbiAgICAgICAgYjogICBhbmNob3JPZmZzZXRZICsgZGhcbiAgICAgICAgIyBjYWxsYmFjayB0byBjYWxsIGlmIHRoZSB6b25lIGlzIGNsaWNrZWQgb25cbiAgICAgICAgY2I6ICBjYlxuICAgICAgQHpvbmVzLnB1c2ggem9uZVxuXG4gIGNoZWNrWm9uZXM6ICh4LCB5KSAtPlxuICAgIGZvciB6b25lIGluIEB6b25lcyBieSAtMVxuICAgICAgIyBtb3ZlIGNvb3JkIGludG8gc3BhY2UgcmVsYXRpdmUgdG8gdGhlIHF1YWQsIHRoZW4gcm90YXRlIGl0IHRvIG1hdGNoXG4gICAgICB1bnJvdGF0ZWRMb2NhbFggPSB4IC0gem9uZS5jeFxuICAgICAgdW5yb3RhdGVkTG9jYWxZID0geSAtIHpvbmUuY3lcbiAgICAgIGxvY2FsWCA9IHVucm90YXRlZExvY2FsWCAqIE1hdGguY29zKHpvbmUucm90KSAtIHVucm90YXRlZExvY2FsWSAqIE1hdGguc2luKHpvbmUucm90KVxuICAgICAgbG9jYWxZID0gdW5yb3RhdGVkTG9jYWxYICogTWF0aC5zaW4oem9uZS5yb3QpICsgdW5yb3RhdGVkTG9jYWxZICogTWF0aC5jb3Moem9uZS5yb3QpXG4gICAgICBpZiAobG9jYWxYIDwgem9uZS5sKSBvciAobG9jYWxYID4gem9uZS5yKSBvciAobG9jYWxZIDwgem9uZS50KSBvciAobG9jYWxZID4gem9uZS5iKVxuICAgICAgICAjIG91dHNpZGUgb2Ygb3JpZW50ZWQgYm91bmRpbmcgYm94XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB6b25lLmNiKHgsIHkpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIHJldHVybiBmYWxzZVxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxubW9kdWxlLmV4cG9ydHMgPSBHYW1lXG4iLCJBbmltYXRpb24gPSByZXF1aXJlICcuL0FuaW1hdGlvbidcblxuQ0FSRF9JTUFHRV9XID0gMTIwXG5DQVJEX0lNQUdFX0ggPSAxNjJcbkNBUkRfSU1BR0VfT0ZGX1ggPSA0XG5DQVJEX0lNQUdFX09GRl9ZID0gNFxuQ0FSRF9JTUFHRV9BRFZfWCA9IENBUkRfSU1BR0VfV1xuQ0FSRF9JTUFHRV9BRFZfWSA9IENBUkRfSU1BR0VfSFxuQ0FSRF9SRU5ERVJfU0NBTEUgPSAwLjM1ICAgICAgICAgICAgICAgICAgIyBjYXJkIGhlaWdodCBjb2VmZmljaWVudCBmcm9tIHRoZSBzY3JlZW4ncyBoZWlnaHRcbkNBUkRfSEFORF9DVVJWRV9ESVNUX0ZBQ1RPUiA9IDMuNSAgICAgICAgICMgZmFjdG9yIHdpdGggc2NyZWVuIGhlaWdodCB0byBmaWd1cmUgb3V0IGNlbnRlciBvZiBhcmMuIGJpZ2dlciBudW1iZXIgaXMgbGVzcyBhcmNcbkNBUkRfSE9MRElOR19ST1RfT1JERVIgPSBNYXRoLlBJIC8gMTIgICAgICMgZGVzaXJlZCByb3RhdGlvbiBvZiB0aGUgY2FyZCB3aGVuIGJlaW5nIGRyYWdnZWQgYXJvdW5kIGZvciBvcmRlcmluZydzIHNha2VcbkNBUkRfSE9MRElOR19ST1RfUExBWSA9IC0xICogTWF0aC5QSSAvIDEyICMgZGVzaXJlZCByb3RhdGlvbiBvZiB0aGUgY2FyZCB3aGVuIGJlaW5nIGRyYWdnZWQgYXJvdW5kIHdpdGggaW50ZW50IHRvIHBsYXlcbkNBUkRfUExBWV9DRUlMSU5HID0gMC42MCAgICAgICAgICAgICAgICAgICMgaG93IG11Y2ggb2YgdGhlIHRvcCBvZiB0aGUgc2NyZWVuIHJlcHJlc2VudHMgXCJJIHdhbnQgdG8gcGxheSB0aGlzXCIgdnMgXCJJIHdhbnQgdG8gcmVvcmRlclwiXG5cbk5PX0NBUkQgPSAtMVxuXG5IaWdobGlnaHQgPVxuICBOT05FOiAtMVxuICBVTlNFTEVDVEVEOiAwXG4gIFNFTEVDVEVEOiAxXG4gIFBJTEU6IDJcblxuIyB0YWtlbiBmcm9tIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTIxMTIxMi9ob3ctdG8tY2FsY3VsYXRlLWFuLWFuZ2xlLWZyb20tdGhyZWUtcG9pbnRzXG4jIHVzZXMgbGF3IG9mIGNvc2luZXMgdG8gZmlndXJlIG91dCB0aGUgaGFuZCBhcmMgYW5nbGVcbmZpbmRBbmdsZSA9IChwMCwgcDEsIHAyKSAtPlxuICAgIGEgPSBNYXRoLnBvdyhwMS54IC0gcDIueCwgMikgKyBNYXRoLnBvdyhwMS55IC0gcDIueSwgMilcbiAgICBiID0gTWF0aC5wb3cocDEueCAtIHAwLngsIDIpICsgTWF0aC5wb3cocDEueSAtIHAwLnksIDIpXG4gICAgYyA9IE1hdGgucG93KHAyLnggLSBwMC54LCAyKSArIE1hdGgucG93KHAyLnkgLSBwMC55LCAyKVxuICAgIHJldHVybiBNYXRoLmFjb3MoIChhK2ItYykgLyBNYXRoLnNxcnQoNCphKmIpIClcblxuY2FsY0Rpc3RhbmNlID0gKHAwLCBwMSkgLT5cbiAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyhwMS54IC0gcDAueCwgMikgKyBNYXRoLnBvdyhwMS55IC0gcDAueSwgMikpXG5cbmNhbGNEaXN0YW5jZVNxdWFyZWQgPSAoeDAsIHkwLCB4MSwgeTEpIC0+XG4gIHJldHVybiBNYXRoLnBvdyh4MSAtIHgwLCAyKSArIE1hdGgucG93KHkxIC0geTAsIDIpXG5cbmNsYXNzIEhhbmRcbiAgQENBUkRfSU1BR0VfVzogQ0FSRF9JTUFHRV9XXG4gIEBDQVJEX0lNQUdFX0g6IENBUkRfSU1BR0VfSFxuICBAQ0FSRF9JTUFHRV9PRkZfWDogQ0FSRF9JTUFHRV9PRkZfWFxuICBAQ0FSRF9JTUFHRV9PRkZfWTogQ0FSRF9JTUFHRV9PRkZfWVxuICBAQ0FSRF9JTUFHRV9BRFZfWDogQ0FSRF9JTUFHRV9BRFZfWFxuICBAQ0FSRF9JTUFHRV9BRFZfWTogQ0FSRF9JTUFHRV9BRFZfWVxuICBAQ0FSRF9SRU5ERVJfU0NBTEU6IENBUkRfUkVOREVSX1NDQUxFXG4gIEBIaWdobGlnaHQ6IEhpZ2hsaWdodFxuXG4gIGNvbnN0cnVjdG9yOiAoQGdhbWUpIC0+XG4gICAgQGNhcmRzID0gW11cbiAgICBAYW5pbXMgPSB7fVxuICAgIEBwb3NpdGlvbkNhY2hlID0ge31cblxuICAgIEBwaWNraW5nID0gdHJ1ZVxuICAgIEBwaWNrZWQgPSBbXVxuICAgIEBwaWNrUGFpbnQgPSBmYWxzZVxuXG4gICAgQGRyYWdJbmRleFN0YXJ0ID0gTk9fQ0FSRFxuICAgIEBkcmFnSW5kZXhDdXJyZW50ID0gTk9fQ0FSRFxuICAgIEBkcmFnWCA9IDBcbiAgICBAZHJhZ1kgPSAwXG5cbiAgICAjIHJlbmRlciAvIGFuaW0gbWV0cmljc1xuICAgIEBjYXJkU3BlZWQgPVxuICAgICAgcjogTWF0aC5QSSAqIDJcbiAgICAgIHM6IDIuNVxuICAgICAgdDogMiAqIEBnYW1lLndpZHRoXG4gICAgQHBsYXlDZWlsaW5nID0gQ0FSRF9QTEFZX0NFSUxJTkcgKiBAZ2FtZS5oZWlnaHRcbiAgICBAY2FyZEhlaWdodCA9IE1hdGguZmxvb3IoQGdhbWUuaGVpZ2h0ICogQ0FSRF9SRU5ERVJfU0NBTEUpXG4gICAgQGNhcmRXaWR0aCAgPSBNYXRoLmZsb29yKEBjYXJkSGVpZ2h0ICogQ0FSRF9JTUFHRV9XIC8gQ0FSRF9JTUFHRV9IKVxuICAgIEBjYXJkSGFsZkhlaWdodCA9IEBjYXJkSGVpZ2h0ID4+IDFcbiAgICBAY2FyZEhhbGZXaWR0aCAgPSBAY2FyZFdpZHRoID4+IDFcbiAgICBhcmNNYXJnaW4gPSBAY2FyZFdpZHRoIC8gMlxuICAgIGFyY1ZlcnRpY2FsQmlhcyA9IEBjYXJkSGVpZ2h0IC8gNTBcbiAgICBib3R0b21MZWZ0ICA9IHsgeDogYXJjTWFyZ2luLCAgICAgICAgICAgICAgICB5OiBhcmNWZXJ0aWNhbEJpYXMgKyBAZ2FtZS5oZWlnaHQgfVxuICAgIGJvdHRvbVJpZ2h0ID0geyB4OiBAZ2FtZS53aWR0aCAtIGFyY01hcmdpbiwgeTogYXJjVmVydGljYWxCaWFzICsgQGdhbWUuaGVpZ2h0IH1cbiAgICBAaGFuZENlbnRlciA9IHsgeDogQGdhbWUud2lkdGggLyAyLCAgICAgICAgIHk6IGFyY1ZlcnRpY2FsQmlhcyArIEBnYW1lLmhlaWdodCArIChDQVJEX0hBTkRfQ1VSVkVfRElTVF9GQUNUT1IgKiBAZ2FtZS5oZWlnaHQpIH1cbiAgICBAaGFuZEFuZ2xlID0gZmluZEFuZ2xlKGJvdHRvbUxlZnQsIEBoYW5kQ2VudGVyLCBib3R0b21SaWdodClcbiAgICBAaGFuZERpc3RhbmNlID0gY2FsY0Rpc3RhbmNlKGJvdHRvbUxlZnQsIEBoYW5kQ2VudGVyKVxuICAgIEBoYW5kQW5nbGVBZHZhbmNlTWF4ID0gQGhhbmRBbmdsZSAvIDcgIyBuZXZlciBzcGFjZSB0aGUgY2FyZHMgbW9yZSB0aGFuIHdoYXQgdGhleSdkIGxvb2sgbGlrZSB3aXRoIHRoaXMgaGFuZHNpemVcbiAgICBAZ2FtZS5sb2cgXCJIYW5kIGRpc3RhbmNlICN7QGhhbmREaXN0YW5jZX0sIGFuZ2xlICN7QGhhbmRBbmdsZX0gKHNjcmVlbiBoZWlnaHQgI3tAZ2FtZS5oZWlnaHR9KVwiXG5cbiAgdG9nZ2xlUGlja2luZzogLT5cbiAgICBAcGlja2luZyA9ICFAcGlja2luZ1xuICAgIGlmIEBwaWNraW5nXG4gICAgICBAc2VsZWN0Tm9uZSgpXG5cbiAgc2VsZWN0Tm9uZTogLT5cbiAgICBAcGlja2VkID0gbmV3IEFycmF5KEBjYXJkcy5sZW5ndGgpLmZpbGwoZmFsc2UpXG4gICAgcmV0dXJuXG5cbiAgc2V0OiAoY2FyZHMpIC0+XG4gICAgQGNhcmRzID0gY2FyZHMuc2xpY2UoMClcbiAgICBpZiBAcGlja2luZ1xuICAgICAgQHNlbGVjdE5vbmUoKVxuICAgIEBzeW5jQW5pbXMoKVxuICAgIEB3YXJwKClcblxuICBzeW5jQW5pbXM6IC0+XG4gICAgc2VlbiA9IHt9XG4gICAgZm9yIGNhcmQgaW4gQGNhcmRzXG4gICAgICBzZWVuW2NhcmRdKytcbiAgICAgIGlmIG5vdCBAYW5pbXNbY2FyZF1cbiAgICAgICAgQGFuaW1zW2NhcmRdID0gbmV3IEFuaW1hdGlvbiB7XG4gICAgICAgICAgc3BlZWQ6IEBjYXJkU3BlZWRcbiAgICAgICAgICB4OiAwXG4gICAgICAgICAgeTogMFxuICAgICAgICAgIHI6IDBcbiAgICAgICAgfVxuICAgIHRvUmVtb3ZlID0gW11cbiAgICBmb3IgY2FyZCxhbmltIG9mIEBhbmltc1xuICAgICAgaWYgbm90IHNlZW4uaGFzT3duUHJvcGVydHkoY2FyZClcbiAgICAgICAgdG9SZW1vdmUucHVzaCBjYXJkXG4gICAgZm9yIGNhcmQgaW4gdG9SZW1vdmVcbiAgICAgICMgQGdhbWUubG9nIFwicmVtb3ZpbmcgYW5pbSBmb3IgI3tjYXJkfVwiXG4gICAgICBkZWxldGUgQGFuaW1zW2NhcmRdXG5cbiAgICBAdXBkYXRlUG9zaXRpb25zKClcblxuICBjYWxjRHJhd25IYW5kOiAtPlxuICAgIGRyYXduSGFuZCA9IFtdXG4gICAgZm9yIGNhcmQsaSBpbiBAY2FyZHNcbiAgICAgIGlmIGkgIT0gQGRyYWdJbmRleFN0YXJ0XG4gICAgICAgIGRyYXduSGFuZC5wdXNoIGNhcmRcblxuICAgIGlmIEBkcmFnSW5kZXhDdXJyZW50ICE9IE5PX0NBUkRcbiAgICAgIGRyYXduSGFuZC5zcGxpY2UgQGRyYWdJbmRleEN1cnJlbnQsIDAsIEBjYXJkc1tAZHJhZ0luZGV4U3RhcnRdXG4gICAgcmV0dXJuIGRyYXduSGFuZFxuXG4gIHdhbnRzVG9QbGF5RHJhZ2dlZENhcmQ6IC0+XG4gICAgcmV0dXJuIGZhbHNlIGlmIEBkcmFnSW5kZXhTdGFydCA9PSBOT19DQVJEXG4gICAgcmV0dXJuIEBkcmFnWSA8IEBwbGF5Q2VpbGluZ1xuXG4gIHVwZGF0ZVBvc2l0aW9uczogLT5cbiAgICBkcmF3bkhhbmQgPSBAY2FsY0RyYXduSGFuZCgpXG4gICAgd2FudHNUb1BsYXkgPSBAd2FudHNUb1BsYXlEcmFnZ2VkQ2FyZCgpXG4gICAgZGVzaXJlZFJvdGF0aW9uID0gQ0FSRF9IT0xESU5HX1JPVF9PUkRFUlxuICAgIHBvc2l0aW9uQ291bnQgPSBkcmF3bkhhbmQubGVuZ3RoXG4gICAgaWYgd2FudHNUb1BsYXlcbiAgICAgIGRlc2lyZWRSb3RhdGlvbiA9IENBUkRfSE9MRElOR19ST1RfUExBWVxuICAgICAgcG9zaXRpb25Db3VudC0tXG4gICAgcG9zaXRpb25zID0gQGNhbGNQb3NpdGlvbnMocG9zaXRpb25Db3VudClcbiAgICBkcmF3SW5kZXggPSAwXG4gICAgZm9yIGNhcmQsaSBpbiBkcmF3bkhhbmRcbiAgICAgIGFuaW0gPSBAYW5pbXNbY2FyZF1cbiAgICAgIGlmIGkgPT0gQGRyYWdJbmRleEN1cnJlbnRcbiAgICAgICAgYW5pbS5yZXEueCA9IEBkcmFnWFxuICAgICAgICBhbmltLnJlcS55ID0gQGRyYWdZXG4gICAgICAgIGFuaW0ucmVxLnIgPSBkZXNpcmVkUm90YXRpb25cbiAgICAgICAgaWYgbm90IHdhbnRzVG9QbGF5XG4gICAgICAgICAgZHJhd0luZGV4KytcbiAgICAgIGVsc2VcbiAgICAgICAgcG9zID0gcG9zaXRpb25zW2RyYXdJbmRleF1cbiAgICAgICAgYW5pbS5yZXEueCA9IHBvcy54XG4gICAgICAgIGFuaW0ucmVxLnkgPSBwb3MueVxuICAgICAgICBhbmltLnJlcS5yID0gcG9zLnJcbiAgICAgICAgZHJhd0luZGV4KytcblxuICAjIGltbWVkaWF0ZWx5IHdhcnAgYWxsIGNhcmRzIHRvIHdoZXJlIHRoZXkgc2hvdWxkIGJlXG4gIHdhcnA6IC0+XG4gICAgZm9yIGNhcmQsYW5pbSBvZiBAYW5pbXNcbiAgICAgIGFuaW0ud2FycCgpXG5cbiAgIyByZW9yZGVyIHRoZSBoYW5kIGJhc2VkIG9uIHRoZSBkcmFnIGxvY2F0aW9uIG9mIHRoZSBoZWxkIGNhcmRcbiAgcmVvcmRlcjogLT5cbiAgICByZXR1cm4gaWYgQGRyYWdJbmRleFN0YXJ0ID09IE5PX0NBUkRcbiAgICByZXR1cm4gaWYgQGNhcmRzLmxlbmd0aCA8IDIgIyBub3RoaW5nIHRvIHJlb3JkZXJcbiAgICBwb3NpdGlvbnMgPSBAY2FsY1Bvc2l0aW9ucyhAY2FyZHMubGVuZ3RoKVxuICAgIGNsb3Nlc3RJbmRleCA9IDBcbiAgICBjbG9zZXN0RGlzdCA9IEBnYW1lLndpZHRoICogQGdhbWUuaGVpZ2h0ICMgc29tZXRoaW5nIGltcG9zc2libHkgbGFyZ2VcbiAgICBmb3IgcG9zLCBpbmRleCBpbiBwb3NpdGlvbnNcbiAgICAgIGRpc3QgPSBjYWxjRGlzdGFuY2VTcXVhcmVkKHBvcy54LCBwb3MueSwgQGRyYWdYLCBAZHJhZ1kpXG4gICAgICBpZiBjbG9zZXN0RGlzdCA+IGRpc3RcbiAgICAgICAgY2xvc2VzdERpc3QgPSBkaXN0XG4gICAgICAgIGNsb3Nlc3RJbmRleCA9IGluZGV4XG4gICAgQGRyYWdJbmRleEN1cnJlbnQgPSBjbG9zZXN0SW5kZXhcblxuICBzZWxlY3RlZENhcmRzOiAtPlxuICAgIGlmIG5vdCBAcGlja2luZ1xuICAgICAgcmV0dXJuIFtdXG5cbiAgICBjYXJkcyA9IFtdXG4gICAgZm9yIGNhcmQsIGkgaW4gQGNhcmRzXG4gICAgICBpZiBAcGlja2VkW2ldXG4gICAgICAgIGFuaW0gPSBAYW5pbXNbY2FyZF1cbiAgICAgICAgY2FyZHMucHVzaCB7XG4gICAgICAgICAgY2FyZDogY2FyZFxuICAgICAgICAgIHg6IGFuaW0uY3VyLnhcbiAgICAgICAgICB5OiBhbmltLmN1ci55XG4gICAgICAgICAgcjogYW5pbS5jdXIuclxuICAgICAgICAgIGluZGV4OiBpXG4gICAgICAgIH1cbiAgICByZXR1cm4gY2FyZHNcblxuICBkb3duOiAoQGRyYWdYLCBAZHJhZ1ksIGluZGV4KSAtPlxuICAgIEB1cChAZHJhZ1gsIEBkcmFnWSkgIyBlbnN1cmUgd2UgbGV0IGdvIG9mIHRoZSBwcmV2aW91cyBjYXJkIGluIGNhc2UgdGhlIGV2ZW50cyBhcmUgZHVtYlxuICAgIGlmIEBwaWNraW5nXG4gICAgICBAcGlja2VkW2luZGV4XSA9ICFAcGlja2VkW2luZGV4XVxuICAgICAgQHBpY2tQYWludCA9IEBwaWNrZWRbaW5kZXhdXG4gICAgICByZXR1cm5cbiAgICBAZ2FtZS5sb2cgXCJwaWNraW5nIHVwIGNhcmQgaW5kZXggI3tpbmRleH1cIlxuICAgIEBkcmFnSW5kZXhTdGFydCA9IGluZGV4XG4gICAgQGRyYWdJbmRleEN1cnJlbnQgPSBpbmRleFxuICAgIEB1cGRhdGVQb3NpdGlvbnMoKVxuXG4gIG1vdmU6IChAZHJhZ1gsIEBkcmFnWSkgLT5cbiAgICByZXR1cm4gaWYgQGRyYWdJbmRleFN0YXJ0ID09IE5PX0NBUkRcbiAgICAjQGdhbWUubG9nIFwiZHJhZ2dpbmcgYXJvdW5kIGNhcmQgaW5kZXggI3tAZHJhZ0luZGV4Q3VycmVudH1cIlxuICAgIEByZW9yZGVyKClcbiAgICBAdXBkYXRlUG9zaXRpb25zKClcblxuICB1cDogKEBkcmFnWCwgQGRyYWdZKSAtPlxuICAgIHJldHVybiBpZiBAZHJhZ0luZGV4U3RhcnQgPT0gTk9fQ0FSRFxuICAgIEByZW9yZGVyKClcbiAgICBpZiBAd2FudHNUb1BsYXlEcmFnZ2VkQ2FyZCgpXG4gICAgICBAZ2FtZS5sb2cgXCJ0cnlpbmcgdG8gcGxheSBhICN7QGNhcmRzW0BkcmFnSW5kZXhTdGFydF19IGZyb20gaW5kZXggI3tAZHJhZ0luZGV4U3RhcnR9XCJcbiAgICAgIGNhcmRJbmRleCA9IEBkcmFnSW5kZXhTdGFydFxuICAgICAgY2FyZCA9IEBjYXJkc1tjYXJkSW5kZXhdXG4gICAgICBhbmltID0gQGFuaW1zW2NhcmRdXG4gICAgICBAZHJhZ0luZGV4U3RhcnQgPSBOT19DQVJEXG4gICAgICBAZHJhZ0luZGV4Q3VycmVudCA9IE5PX0NBUkRcbiAgICAgIEBnYW1lLnBsYXkgW3tcbiAgICAgICAgY2FyZDogY2FyZFxuICAgICAgICB4OiBhbmltLmN1ci54XG4gICAgICAgIHk6IGFuaW0uY3VyLnlcbiAgICAgICAgcjogYW5pbS5jdXIuclxuICAgICAgICBpbmRleDogY2FyZEluZGV4XG4gICAgICB9XVxuICAgIGVsc2VcbiAgICAgIEBnYW1lLmxvZyBcInRyeWluZyB0byByZW9yZGVyICN7QGNhcmRzW0BkcmFnSW5kZXhTdGFydF19IGludG8gaW5kZXggI3tAZHJhZ0luZGV4Q3VycmVudH1cIlxuICAgICAgQGNhcmRzID0gQGNhbGNEcmF3bkhhbmQoKSAjIGlzIHRoaXMgcmlnaHQ/XG5cbiAgICBAZHJhZ0luZGV4U3RhcnQgPSBOT19DQVJEXG4gICAgQGRyYWdJbmRleEN1cnJlbnQgPSBOT19DQVJEXG4gICAgQHVwZGF0ZVBvc2l0aW9ucygpXG5cbiAgdXBkYXRlOiAoZHQpIC0+XG4gICAgdXBkYXRlZCA9IGZhbHNlXG4gICAgZm9yIGNhcmQsYW5pbSBvZiBAYW5pbXNcbiAgICAgIGlmIGFuaW0udXBkYXRlKGR0KVxuICAgICAgICB1cGRhdGVkID0gdHJ1ZVxuICAgIHJldHVybiB1cGRhdGVkXG5cbiAgcmVuZGVyOiAtPlxuICAgIHJldHVybiBpZiBAY2FyZHMubGVuZ3RoID09IDBcbiAgICBkcmF3bkhhbmQgPSBAY2FsY0RyYXduSGFuZCgpXG4gICAgZm9yIHYsIGluZGV4IGluIGRyYXduSGFuZFxuICAgICAgY29udGludWUgaWYgdiA9PSBOT19DQVJEXG4gICAgICBhbmltID0gQGFuaW1zW3ZdXG4gICAgICBkbyAoYW5pbSwgaW5kZXgpID0+XG4gICAgICAgIGlmIEBwaWNraW5nXG4gICAgICAgICAgaWYgQHBpY2tlZFtpbmRleF1cbiAgICAgICAgICAgIGhpZ2hsaWdodFN0YXRlID0gSGlnaGxpZ2h0LlNFTEVDVEVEXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgaGlnaGxpZ2h0U3RhdGUgPSBIaWdobGlnaHQuVU5TRUxFQ1RFRFxuICAgICAgICBlbHNlXG4gICAgICAgICAgaWYgQHdhbnRzVG9QbGF5RHJhZ2dlZENhcmQoKVxuICAgICAgICAgICAgaWYgKGluZGV4ID09IEBkcmFnSW5kZXhDdXJyZW50KVxuICAgICAgICAgICAgICBoaWdobGlnaHRTdGF0ZSA9IEhpZ2hsaWdodC5TRUxFQ1RFRFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBoaWdobGlnaHRTdGF0ZSA9IEhpZ2hsaWdodC5VTlNFTEVDVEVEXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgaGlnaGxpZ2h0U3RhdGUgPSBIaWdobGlnaHQuTk9ORVxuICAgICAgICBAcmVuZGVyQ2FyZCB2LCBhbmltLmN1ci54LCBhbmltLmN1ci55LCBhbmltLmN1ci5yLCAxLCBoaWdobGlnaHRTdGF0ZSwgKGNsaWNrWCwgY2xpY2tZKSA9PlxuICAgICAgICAgIEBkb3duKGNsaWNrWCwgY2xpY2tZLCBpbmRleClcblxuICByZW5kZXJDYXJkOiAodiwgeCwgeSwgcm90LCBzY2FsZSwgc2VsZWN0ZWQsIGNiKSAtPlxuICAgIHJvdCA9IDAgaWYgbm90IHJvdFxuICAgIHJhbmsgPSBNYXRoLmZsb29yKHYgLyA0KVxuICAgIHN1aXQgPSBNYXRoLmZsb29yKHYgJSA0KVxuXG4gICAgY29sID0gc3dpdGNoIHNlbGVjdGVkXG4gICAgICB3aGVuIEhpZ2hsaWdodC5OT05FXG4gICAgICAgIFsxLCAxLCAxXVxuICAgICAgd2hlbiBIaWdobGlnaHQuVU5TRUxFQ1RFRFxuICAgICAgICAjIFswLjMsIDAuMywgMC4zXVxuICAgICAgICBbMSwgMSwgMV1cbiAgICAgIHdoZW4gSGlnaGxpZ2h0LlNFTEVDVEVEXG4gICAgICAgIFswLjUsIDAuNSwgMC45XVxuICAgICAgd2hlbiBIaWdobGlnaHQuUElMRVxuICAgICAgICBbMC42LCAwLjYsIDAuNl1cblxuICAgIEBnYW1lLmRyYXdJbWFnZSBcImNhcmRzXCIsXG4gICAgQ0FSRF9JTUFHRV9PRkZfWCArIChDQVJEX0lNQUdFX0FEVl9YICogcmFuayksIENBUkRfSU1BR0VfT0ZGX1kgKyAoQ0FSRF9JTUFHRV9BRFZfWSAqIHN1aXQpLCBDQVJEX0lNQUdFX1csIENBUkRfSU1BR0VfSCxcbiAgICB4LCB5LCBAY2FyZFdpZHRoICogc2NhbGUsIEBjYXJkSGVpZ2h0ICogc2NhbGUsXG4gICAgcm90LCAwLjUsIDAuNSwgY29sWzBdLGNvbFsxXSxjb2xbMl0sMSwgY2JcblxuICBjYWxjUG9zaXRpb25zOiAoaGFuZFNpemUpIC0+XG4gICAgaWYgQHBvc2l0aW9uQ2FjaGUuaGFzT3duUHJvcGVydHkoaGFuZFNpemUpXG4gICAgICByZXR1cm4gQHBvc2l0aW9uQ2FjaGVbaGFuZFNpemVdXG4gICAgcmV0dXJuIFtdIGlmIGhhbmRTaXplID09IDBcblxuICAgIGFkdmFuY2UgPSBAaGFuZEFuZ2xlIC8gaGFuZFNpemVcbiAgICBpZiBhZHZhbmNlID4gQGhhbmRBbmdsZUFkdmFuY2VNYXhcbiAgICAgIGFkdmFuY2UgPSBAaGFuZEFuZ2xlQWR2YW5jZU1heFxuICAgIGFuZ2xlU3ByZWFkID0gYWR2YW5jZSAqIGhhbmRTaXplICAgICAgICAgICAgICAgICMgaG93IG11Y2ggb2YgdGhlIGFuZ2xlIHdlIHBsYW4gb24gdXNpbmdcbiAgICBhbmdsZUxlZnRvdmVyID0gQGhhbmRBbmdsZSAtIGFuZ2xlU3ByZWFkICAgICAgICAjIGFtb3VudCBvZiBhbmdsZSB3ZSdyZSBub3QgdXNpbmcsIGFuZCBuZWVkIHRvIHBhZCBzaWRlcyB3aXRoIGV2ZW5seVxuICAgIGN1cnJlbnRBbmdsZSA9IC0xICogKEBoYW5kQW5nbGUgLyAyKSAgICAgICAgICAgICMgbW92ZSB0byB0aGUgbGVmdCBzaWRlIG9mIG91ciBhbmdsZVxuICAgIGN1cnJlbnRBbmdsZSArPSBhbmdsZUxlZnRvdmVyIC8gMiAgICAgICAgICAgICAgICMgLi4uIGFuZCBhZHZhbmNlIHBhc3QgaGFsZiBvZiB0aGUgcGFkZGluZ1xuICAgIGN1cnJlbnRBbmdsZSArPSBhZHZhbmNlIC8gMiAgICAgICAgICAgICAgICAgICAgICMgLi4uIGFuZCBjZW50ZXIgdGhlIGNhcmRzIGluIHRoZSBhbmdsZVxuXG4gICAgcG9zaXRpb25zID0gW11cbiAgICBmb3IgaSBpbiBbMC4uLmhhbmRTaXplXVxuICAgICAgeCA9IEBoYW5kQ2VudGVyLnggLSBNYXRoLmNvcygoTWF0aC5QSSAvIDIpICsgY3VycmVudEFuZ2xlKSAqIEBoYW5kRGlzdGFuY2VcbiAgICAgIHkgPSBAaGFuZENlbnRlci55IC0gTWF0aC5zaW4oKE1hdGguUEkgLyAyKSArIGN1cnJlbnRBbmdsZSkgKiBAaGFuZERpc3RhbmNlXG4gICAgICBjdXJyZW50QW5nbGUgKz0gYWR2YW5jZVxuICAgICAgcG9zaXRpb25zLnB1c2gge1xuICAgICAgICB4OiB4XG4gICAgICAgIHk6IHlcbiAgICAgICAgcjogY3VycmVudEFuZ2xlIC0gYWR2YW5jZVxuICAgICAgfVxuXG4gICAgQHBvc2l0aW9uQ2FjaGVbaGFuZFNpemVdID0gcG9zaXRpb25zXG4gICAgcmV0dXJuIHBvc2l0aW9uc1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRcbiIsIkJ1dHRvbiA9IHJlcXVpcmUgJy4vQnV0dG9uJ1xuXG5jbGFzcyBNZW51XG4gIGNvbnN0cnVjdG9yOiAoQGdhbWUsIEB0aXRsZSwgQGJhY2tncm91bmQsIEBjb2xvciwgQGFjdGlvbnMpIC0+XG4gICAgQGJ1dHRvbnMgPSBbXVxuICAgIEBidXR0b25OYW1lcyA9IFtcImJ1dHRvbjBcIiwgXCJidXR0b24xXCJdXG5cbiAgICBidXR0b25TaXplID0gQGdhbWUuaGVpZ2h0IC8gMTVcbiAgICBAYnV0dG9uU3RhcnRZID0gQGdhbWUuaGVpZ2h0IC8gNVxuXG4gICAgc2xpY2UgPSAoQGdhbWUuaGVpZ2h0IC0gQGJ1dHRvblN0YXJ0WSkgLyAoQGFjdGlvbnMubGVuZ3RoICsgMSlcbiAgICBjdXJyWSA9IEBidXR0b25TdGFydFkgKyBzbGljZVxuICAgIGZvciBhY3Rpb24gaW4gQGFjdGlvbnNcbiAgICAgIGJ1dHRvbiA9IG5ldyBCdXR0b24oQGdhbWUsIEBidXR0b25OYW1lcywgQGdhbWUuZm9udCwgYnV0dG9uU2l6ZSwgQGdhbWUuY2VudGVyLngsIGN1cnJZLCBhY3Rpb24pXG4gICAgICBAYnV0dG9ucy5wdXNoIGJ1dHRvblxuICAgICAgY3VyclkgKz0gc2xpY2VcblxuICB1cGRhdGU6IChkdCkgLT5cbiAgICB1cGRhdGVkID0gZmFsc2VcbiAgICBmb3IgYnV0dG9uIGluIEBidXR0b25zXG4gICAgICBpZiBidXR0b24udXBkYXRlKGR0KVxuICAgICAgICB1cGRhdGVkID0gdHJ1ZVxuICAgIHJldHVybiB1cGRhdGVkXG5cbiAgcmVuZGVyOiAtPlxuICAgIEBnYW1lLnNwcml0ZVJlbmRlcmVyLnJlbmRlciBAYmFja2dyb3VuZCwgMCwgMCwgQGdhbWUud2lkdGgsIEBnYW1lLmhlaWdodCwgMCwgMCwgMCwgQGNvbG9yXG4gICAgQGdhbWUuZm9udFJlbmRlcmVyLnJlbmRlciBAZ2FtZS5mb250LCBAZ2FtZS5oZWlnaHQgLyAyNSwgXCJCdWlsZDogI3tAZ2FtZS52ZXJzaW9ufVwiLCAwLCBAZ2FtZS5oZWlnaHQsIDAsIDEsIEBnYW1lLmNvbG9ycy5saWdodGdyYXlcbiAgICB0aXRsZUhlaWdodCA9IEBnYW1lLmhlaWdodCAvIDhcbiAgICB0aXRsZU9mZnNldCA9IEBidXR0b25TdGFydFkgPj4gMVxuICAgIEBnYW1lLmZvbnRSZW5kZXJlci5yZW5kZXIgQGdhbWUuZm9udCwgdGl0bGVIZWlnaHQsIEB0aXRsZSwgQGdhbWUuY2VudGVyLngsIHRpdGxlT2Zmc2V0LCAwLjUsIDAuNSwgQGdhbWUuY29sb3JzLndoaXRlXG4gICAgZm9yIGJ1dHRvbiBpbiBAYnV0dG9uc1xuICAgICAgYnV0dG9uLnJlbmRlcigpXG5cbm1vZHVsZS5leHBvcnRzID0gTWVudVxuIiwiQW5pbWF0aW9uID0gcmVxdWlyZSAnLi9BbmltYXRpb24nXG5IYW5kID0gcmVxdWlyZSAnLi9IYW5kJ1xuXG5TRVRUTEVfTVMgPSAxMDAwXG5cbmNsYXNzIFBpbGVcbiAgY29uc3RydWN0b3I6IChAZ2FtZSwgQGhhbmQpIC0+XG4gICAgQHBsYXlJRCA9IC0xXG4gICAgQHBsYXlzID0gW11cbiAgICBAYW5pbXMgPSB7fVxuICAgIEBzZXR0bGVUaW1lciA9IDBcbiAgICBAdGhyb3duQ29sb3IgPSB7IHI6IDEsIGc6IDEsIGI6IDAsIGE6IDF9XG4gICAgQHNjYWxlID0gMC42XG5cbiAgICAjIDEuMCBpcyBub3QgbWVzc3kgYXQgYWxsLCBhcyB5b3UgYXBwcm9hY2ggMCBpdCBzdGFydHMgdG8gYWxsIHBpbGUgb24gb25lIGFub3RoZXJcbiAgICBtZXNzeSA9IDAuMlxuXG4gICAgQHBsYXlDYXJkU3BhY2luZyA9IDAuMVxuXG4gICAgY2VudGVyWCA9IEBnYW1lLmNlbnRlci54XG4gICAgY2VudGVyWSA9IEBnYW1lLmNlbnRlci55XG4gICAgb2Zmc2V0WCA9IEBoYW5kLmNhcmRXaWR0aCAqIG1lc3N5ICogQHNjYWxlXG4gICAgb2Zmc2V0WSA9IEBoYW5kLmNhcmRIYWxmSGVpZ2h0ICogbWVzc3kgKiBAc2NhbGVcbiAgICBAcGxheUxvY2F0aW9ucyA9IFtcbiAgICAgIHsgeDogY2VudGVyWCwgeTogY2VudGVyWSArIG9mZnNldFkgfSAjIGJvdHRvbVxuICAgICAgeyB4OiBjZW50ZXJYIC0gb2Zmc2V0WCwgeTogY2VudGVyWSB9ICMgbGVmdFxuICAgICAgeyB4OiBjZW50ZXJYLCB5OiBjZW50ZXJZIC0gb2Zmc2V0WSB9ICMgdG9wXG4gICAgICB7IHg6IGNlbnRlclggKyBvZmZzZXRYLCB5OiBjZW50ZXJZIH0gIyByaWdodFxuICAgIF1cbiAgICBAdGhyb3dMb2NhdGlvbnMgPSBbXG4gICAgICB7IHg6IGNlbnRlclgsIHk6IEBnYW1lLmhlaWdodCB9ICMgYm90dG9tXG4gICAgICB7IHg6IDAsIHk6IGNlbnRlclkgKyBvZmZzZXRZIH0gIyBsZWZ0XG4gICAgICB7IHg6IGNlbnRlclgsIHk6IDAgfSAjIHRvcFxuICAgICAgeyB4OiBAZ2FtZS53aWR0aCwgeTogY2VudGVyWSArIG9mZnNldFkgfSAjIHJpZ2h0XG4gICAgXVxuXG4gIHNldDogKHBpbGVJRCwgcGlsZSwgcGlsZVdobykgLT5cbiAgICBpZiBAcGxheUlEICE9IHBpbGVJRFxuICAgICAgQHBsYXlJRCA9IHBpbGVJRFxuICAgICAgQHBsYXlzLnB1c2gge1xuICAgICAgICBjYXJkczogcGlsZS5zbGljZSgwKVxuICAgICAgICB3aG86IHBpbGVXaG9cbiAgICAgIH1cbiAgICAgIEBzZXR0bGVUaW1lciA9IFNFVFRMRV9NU1xuXG4gICAgIyBpZiAoQHBsYXlJRCAhPSBwaWxlSUQpIGFuZCAodGhyb3duLmxlbmd0aCA+IDApXG4gICAgIyAgIEBwbGF5cyA9IHRocm93bi5zbGljZSgwKSAjIHRoZSBwaWxlIGhhcyBiZWNvbWUgdGhlIHRocm93biwgc3Rhc2ggaXQgb2ZmIG9uZSBsYXN0IHRpbWVcbiAgICAjICAgQHBsYXlXaG8gPSB0aHJvd25XaG8uc2xpY2UoMClcbiAgICAjICAgQHBsYXlJRCA9IHBpbGVJRFxuICAgICMgICBAc2V0dGxlVGltZXIgPSBTRVRUTEVfTVNcblxuICAgICMgIyBkb24ndCBzdG9tcCB0aGUgcGlsZSB3ZSdyZSBkcmF3aW5nIHVudGlsIGl0IGlzIGRvbmUgc2V0dGxpbmcgYW5kIGNhbiBmbHkgb2ZmIHRoZSBzY3JlZW5cbiAgICAjIGlmIEBzZXR0bGVUaW1lciA9PSAwXG4gICAgIyAgIEBwbGF5cyA9IHBpbGUuc2xpY2UoMClcbiAgICAjICAgQHBsYXlXaG8gPSBwaWxlV2hvLnNsaWNlKDApXG4gICAgIyAgIEB0aHJvd24gPSB0aHJvd24uc2xpY2UoMClcbiAgICAjICAgQHRocm93bldobyA9IHRocm93bldoby5zbGljZSgwKVxuICAgICMgICBAdGhyb3duVGFrZXIgPSB0aHJvd25UYWtlclxuXG4gICAgQHN5bmNBbmltcygpXG5cbiAgaGludDogKGNhcmRzKSAtPlxuICAgIGZvciBjYXJkIGluIGNhcmRzXG4gICAgICBAYW5pbXNbY2FyZC5jYXJkXSA9IG5ldyBBbmltYXRpb24ge1xuICAgICAgICBzcGVlZDogQGhhbmQuY2FyZFNwZWVkXG4gICAgICAgIHg6IGNhcmQueFxuICAgICAgICB5OiBjYXJkLnlcbiAgICAgICAgcjogY2FyZC5yXG4gICAgICAgIHM6IDFcbiAgICAgIH1cblxuICBzeW5jQW5pbXM6IC0+XG4gICAgc2VlbiA9IHt9XG4gICAgbG9jYXRpb25zID0gQHRocm93TG9jYXRpb25zXG4gICAgZm9yIHBsYXkgaW4gQHBsYXlzXG4gICAgICBmb3IgY2FyZCwgaW5kZXggaW4gcGxheS5jYXJkc1xuICAgICAgICBzZWVuW2NhcmRdKytcbiAgICAgICAgaWYgbm90IEBhbmltc1tjYXJkXVxuICAgICAgICAgIHdobyA9IHBsYXkud2hvXG4gICAgICAgICAgbG9jYXRpb24gPSBsb2NhdGlvbnNbd2hvXVxuICAgICAgICAgIEBhbmltc1tjYXJkXSA9IG5ldyBBbmltYXRpb24ge1xuICAgICAgICAgICAgc3BlZWQ6IEBoYW5kLmNhcmRTcGVlZFxuICAgICAgICAgICAgeDogbG9jYXRpb24ueFxuICAgICAgICAgICAgeTogbG9jYXRpb24ueVxuICAgICAgICAgICAgcjogLTEgKiBNYXRoLlBJIC8gNFxuICAgICAgICAgICAgczogQHNjYWxlXG4gICAgICAgICAgfVxuXG4gICAgdG9SZW1vdmUgPSBbXVxuICAgIGZvciBjYXJkLGFuaW0gb2YgQGFuaW1zXG4gICAgICBpZiBub3Qgc2Vlbi5oYXNPd25Qcm9wZXJ0eShjYXJkKVxuICAgICAgICB0b1JlbW92ZS5wdXNoIGNhcmRcbiAgICBmb3IgY2FyZCBpbiB0b1JlbW92ZVxuICAgICAgIyBAZ2FtZS5sb2cgXCJyZW1vdmluZyBhbmltIGZvciAje2NhcmR9XCJcbiAgICAgIGRlbGV0ZSBAYW5pbXNbY2FyZF1cblxuICAgIEB1cGRhdGVQb3NpdGlvbnMoKVxuXG4gIHVwZGF0ZVBvc2l0aW9uczogLT5cbiAgICBsb2NhdGlvbnMgPSBAcGxheUxvY2F0aW9uc1xuICAgIGZvciBwbGF5LCBwbGF5SW5kZXggaW4gQHBsYXlzXG4gICAgICBmb3IgdiwgaW5kZXggaW4gcGxheS5jYXJkc1xuICAgICAgICBhbmltID0gQGFuaW1zW3ZdXG4gICAgICAgIGxvYyA9IHBsYXkud2hvXG4gICAgICAgIGFuaW0ucmVxLnggPSBsb2NhdGlvbnNbbG9jXS54ICsgKGluZGV4ICogQGhhbmQuY2FyZFdpZHRoICogQHBsYXlDYXJkU3BhY2luZylcbiAgICAgICAgYW5pbS5yZXEueSA9IGxvY2F0aW9uc1tsb2NdLnlcbiAgICAgICAgYW5pbS5yZXEuciA9IDAuMiAqIE1hdGguY29zKHBsYXlJbmRleCAvIDAuMSlcbiAgICAgICAgYW5pbS5yZXEucyA9IEBzY2FsZVxuXG4gIHJlYWR5Rm9yTmV4dFRyaWNrOiAtPlxuICAgIHJldHVybiAoQHNldHRsZVRpbWVyID09IDApXG5cbiAgdXBkYXRlOiAoZHQpIC0+XG4gICAgdXBkYXRlZCA9IGZhbHNlXG5cbiAgICBpZiBAc2V0dGxlVGltZXIgPiAwXG4gICAgICB1cGRhdGVkID0gdHJ1ZVxuICAgICAgQHNldHRsZVRpbWVyIC09IGR0XG4gICAgICBpZiBAc2V0dGxlVGltZXIgPCAwXG4gICAgICAgIEBzZXR0bGVUaW1lciA9IDBcblxuICAgIGZvciBjYXJkLGFuaW0gb2YgQGFuaW1zXG4gICAgICBpZiBhbmltLnVwZGF0ZShkdClcbiAgICAgICAgdXBkYXRlZCA9IHRydWVcblxuICAgIHJldHVybiB1cGRhdGVkXG5cbiAgIyB1c2VkIGJ5IHRoZSBnYW1lIG92ZXIgc2NyZWVuLiBJdCByZXR1cm5zIHRydWUgd2hlbiBuZWl0aGVyIHRoZSBwaWxlIG5vciB0aGUgbGFzdCB0aHJvd24gYXJlIG1vdmluZ1xuICByZXN0aW5nOiAtPlxuICAgIGZvciBjYXJkLGFuaW0gb2YgQGFuaW1zXG4gICAgICBpZiBhbmltLmFuaW1hdGluZygpXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIGlmIEBzZXR0bGVUaW1lciA+IDBcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIHJldHVybiB0cnVlXG5cbiAgcmVuZGVyOiAtPlxuICAgIGZvciBwbGF5LCBwbGF5SW5kZXggaW4gQHBsYXlzXG4gICAgICBoaWdobGlnaHQgPSBIYW5kLkhpZ2hsaWdodC5QSUxFXG4gICAgICBpZiBwbGF5SW5kZXggPT0gKEBwbGF5cy5sZW5ndGggLSAxKVxuICAgICAgICBoaWdobGlnaHQgPSBIYW5kLkhpZ2hsaWdodC5OT05FXG4gICAgICBmb3IgdiwgaW5kZXggaW4gcGxheS5jYXJkc1xuICAgICAgICBhbmltID0gQGFuaW1zW3ZdXG4gICAgICAgIEBoYW5kLnJlbmRlckNhcmQgdiwgYW5pbS5jdXIueCwgYW5pbS5jdXIueSwgYW5pbS5jdXIuciwgYW5pbS5jdXIucywgaGlnaGxpZ2h0XG5cbm1vZHVsZS5leHBvcnRzID0gUGlsZVxuIiwiY2xhc3MgU3ByaXRlUmVuZGVyZXJcbiAgY29uc3RydWN0b3I6IChAZ2FtZSkgLT5cbiAgICBAc3ByaXRlcyA9XG4gICAgICAjIGdlbmVyaWMgc3ByaXRlc1xuICAgICAgc29saWQ6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogIDU1LCB5OiA3MjMsIHc6ICAxMCwgaDogIDEwIH1cbiAgICAgIHBhdXNlOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDYwMiwgeTogNzA3LCB3OiAxMjIsIGg6IDEyNSB9XG4gICAgICBidXR0b24wOiAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAxNDAsIHk6IDc3NywgdzogNDIyLCBoOiAgNjUgfVxuICAgICAgYnV0dG9uMTogICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogMTQwLCB5OiA2OTgsIHc6IDQyMiwgaDogIDY1IH1cbiAgICAgIHBsdXMwOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDc0NSwgeTogNjY0LCB3OiAxMTYsIGg6IDExOCB9XG4gICAgICBwbHVzMTogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA3NDUsIHk6IDgyMCwgdzogMTE2LCBoOiAxMTggfVxuICAgICAgbWludXMwOiAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogODk1LCB5OiA2NjQsIHc6IDExNiwgaDogMTE4IH1cbiAgICAgIG1pbnVzMTogICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDg5NSwgeTogODIwLCB3OiAxMTYsIGg6IDExOCB9XG4gICAgICBhcnJvd0w6ICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAgMzMsIHk6IDg1OCwgdzogMjA0LCBoOiAxNTYgfVxuICAgICAgYXJyb3dSOiAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogMjM5LCB5OiA4NTIsIHc6IDIwOCwgaDogMTU1IH1cblxuICAgICAgcGlsZTogICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogIDEzLCB5OiA4ODMsIHc6IDEyOCwgaDogMTI4IH1cbiAgICAgIHBpbGUwOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDE0NSwgeTogODgzLCB3OiAxMjgsIGg6IDEyOCB9XG4gICAgICBwaWxlMTogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAyNzcsIHk6IDg4MywgdzogMTI4LCBoOiAxMjggfVxuICAgICAgcGlsZTI6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogNDA5LCB5OiA4ODMsIHc6IDEyOCwgaDogMTI4IH1cbiAgICAgIHBpbGUzOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDU0MSwgeTogODgzLCB3OiAxMjgsIGg6IDEyOCB9XG5cbiAgICAgICMgbWVudSBiYWNrZ3JvdW5kc1xuICAgICAgbWFpbm1lbnU6ICB7IHRleHR1cmU6IFwibWFpbm1lbnVcIiwgIHg6IDAsIHk6IDAsIHc6IDEyODAsIGg6IDcyMCB9XG4gICAgICBwYXVzZW1lbnU6IHsgdGV4dHVyZTogXCJwYXVzZW1lbnVcIiwgeDogMCwgeTogMCwgdzogMTI4MCwgaDogNzIwIH1cblxuICAgICAgIyBob3d0b1xuICAgICAgaG93dG8xOiAgICB7IHRleHR1cmU6IFwiaG93dG8xXCIsICB4OiAwLCB5OiAgMCwgdzogMTkyMCwgaDogMTA4MCB9XG5cbiAgICAgIGF1OiAgICAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDU0MCwgeTogMTA3OSwgdzogNDAwLCBoOiAgODAgfVxuICAgICAgc3Rhcl9vbjogICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogIDM4LCB5OiAxMDY2LCB3OiAxOTAsIGg6IDE5MCB9XG4gICAgICBzdGFyX29mZjogIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAyNTAsIHk6IDEwNjYsIHc6IDE5MCwgaDogMTkwIH1cblxuICAgICAgIyBjaGFyYWN0ZXJzXG4gICAgICBtYXJpbzogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAgMjAsIHk6ICAgMCwgdzogMTUxLCBoOiAzMDggfVxuICAgICAgbHVpZ2k6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogMTcxLCB5OiAgIDAsIHc6IDE1MSwgaDogMzA4IH1cbiAgICAgIHBlYWNoOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDMzNSwgeTogICAwLCB3OiAxNjQsIGg6IDMwOCB9XG4gICAgICBkYWlzeTogICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA1MDQsIHk6ICAgMCwgdzogMTY0LCBoOiAzMDggfVxuICAgICAgeW9zaGk6ICAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogNjY4LCB5OiAgIDAsIHc6IDE4MCwgaDogMzA4IH1cbiAgICAgIHRvYWQ6ICAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDg0OSwgeTogICAwLCB3OiAxNTcsIGg6IDMwOCB9XG4gICAgICBib3dzZXI6ICAgIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiAgMTEsIHk6IDMyMiwgdzogMTUxLCBoOiAzMDggfVxuICAgICAgYm93c2VyanI6ICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogMjI1LCB5OiAzMjIsIHc6IDE0NCwgaDogMzA4IH1cbiAgICAgIGtvb3BhOiAgICAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDM3MiwgeTogMzIyLCB3OiAxMjgsIGg6IDMwOCB9XG4gICAgICByb3NhbGluYTogIHsgdGV4dHVyZTogXCJjaGFyc1wiLCB4OiA1MDAsIHk6IDMyMiwgdzogMTczLCBoOiAzMDggfVxuICAgICAgc2h5Z3V5OiAgICB7IHRleHR1cmU6IFwiY2hhcnNcIiwgeDogNjkxLCB5OiAzMjIsIHc6IDE1NCwgaDogMzA4IH1cbiAgICAgIHRvYWRldHRlOiAgeyB0ZXh0dXJlOiBcImNoYXJzXCIsIHg6IDg0NywgeTogMzIyLCB3OiAxNTgsIGg6IDMwOCB9XG5cbiAgY2FsY1dpZHRoOiAoc3ByaXRlTmFtZSwgaGVpZ2h0KSAtPlxuICAgIHNwcml0ZSA9IEBzcHJpdGVzW3Nwcml0ZU5hbWVdXG4gICAgcmV0dXJuIDEgaWYgbm90IHNwcml0ZVxuICAgIHJldHVybiBoZWlnaHQgKiBzcHJpdGUudyAvIHNwcml0ZS5oXG5cbiAgcmVuZGVyOiAoc3ByaXRlTmFtZSwgZHgsIGR5LCBkdywgZGgsIHJvdCwgYW5jaG9yeCwgYW5jaG9yeSwgY29sb3IsIGNiKSAtPlxuICAgIHNwcml0ZSA9IEBzcHJpdGVzW3Nwcml0ZU5hbWVdXG4gICAgcmV0dXJuIGlmIG5vdCBzcHJpdGVcbiAgICBpZiAoZHcgPT0gMCkgYW5kIChkaCA9PSAwKVxuICAgICAgIyB0aGlzIHByb2JhYmx5IHNob3VsZG4ndCBldmVyIGJlIHVzZWQuXG4gICAgICBkdyA9IHNwcml0ZS54XG4gICAgICBkaCA9IHNwcml0ZS55XG4gICAgZWxzZSBpZiBkdyA9PSAwXG4gICAgICBkdyA9IGRoICogc3ByaXRlLncgLyBzcHJpdGUuaFxuICAgIGVsc2UgaWYgZGggPT0gMFxuICAgICAgZGggPSBkdyAqIHNwcml0ZS5oIC8gc3ByaXRlLndcbiAgICBAZ2FtZS5kcmF3SW1hZ2Ugc3ByaXRlLnRleHR1cmUsIHNwcml0ZS54LCBzcHJpdGUueSwgc3ByaXRlLncsIHNwcml0ZS5oLCBkeCwgZHksIGR3LCBkaCwgcm90LCBhbmNob3J4LCBhbmNob3J5LCBjb2xvci5yLCBjb2xvci5nLCBjb2xvci5iLCBjb2xvci5hLCBjYlxuICAgIHJldHVyblxuXG5tb2R1bGUuZXhwb3J0cyA9IFNwcml0ZVJlbmRlcmVyXG4iLCJNSU5fUExBWUVSUyA9IDNcbk1BWF9MT0dfTElORVMgPSA2XG5PSyA9ICdPSydcblxuU3VpdCA9XG4gIE5PTkU6IC0xXG4gIFNQQURFUzogMFxuICBDTFVCUzogMVxuICBESUFNT05EUzogMlxuICBIRUFSVFM6IDNcblxuU3VpdE5hbWUgPSBbJ1NwYWRlcycsICdDbHVicycsICdEaWFtb25kcycsICdIZWFydHMnXVxuU2hvcnRTdWl0TmFtZSA9IFsnUycsICdDJywgJ0QnLCAnSCddXG5HbHlwaFN1aXROYW1lID0gW1wiXFx4YzhcIiwgXCJcXHhjOVwiLCBcIlxceGNhXCIsIFwiXFx4Y2JcIl1cblxuU1RBUlRJTkdfTU9ORVkgPSAyNVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBBSSBOYW1lIEdlbmVyYXRvclxuXG5haUNoYXJhY3Rlckxpc3QgPSBbXG4gIHsgaWQ6IFwibWFyaW9cIiwgICAgbmFtZTogXCJNYXJpb1wiLCAgICAgIHNwcml0ZTogXCJtYXJpb1wiLCAgICBicmFpbjogXCJub3JtYWxcIiB9XG4gIHsgaWQ6IFwibHVpZ2lcIiwgICAgbmFtZTogXCJMdWlnaVwiLCAgICAgIHNwcml0ZTogXCJsdWlnaVwiLCAgICBicmFpbjogXCJub3JtYWxcIiB9XG4gIHsgaWQ6IFwicGVhY2hcIiwgICAgbmFtZTogXCJQZWFjaFwiLCAgICAgIHNwcml0ZTogXCJwZWFjaFwiLCAgICBicmFpbjogXCJub3JtYWxcIiB9XG4gIHsgaWQ6IFwiZGFpc3lcIiwgICAgbmFtZTogXCJEYWlzeVwiLCAgICAgIHNwcml0ZTogXCJkYWlzeVwiLCAgICBicmFpbjogXCJub3JtYWxcIiB9XG4gIHsgaWQ6IFwieW9zaGlcIiwgICAgbmFtZTogXCJZb3NoaVwiLCAgICAgIHNwcml0ZTogXCJ5b3NoaVwiLCAgICBicmFpbjogXCJub3JtYWxcIiB9XG4gIHsgaWQ6IFwidG9hZFwiLCAgICAgbmFtZTogXCJUb2FkXCIsICAgICAgIHNwcml0ZTogXCJ0b2FkXCIsICAgICBicmFpbjogXCJub3JtYWxcIiB9XG4gIHsgaWQ6IFwiYm93c2VyXCIsICAgbmFtZTogXCJCb3dzZXJcIiwgICAgIHNwcml0ZTogXCJib3dzZXJcIiwgICBicmFpbjogXCJub3JtYWxcIiB9XG4gIHsgaWQ6IFwiYm93c2VyanJcIiwgbmFtZTogXCJCb3dzZXIgSnJcIiwgIHNwcml0ZTogXCJib3dzZXJqclwiLCBicmFpbjogXCJub3JtYWxcIiB9XG4gIHsgaWQ6IFwia29vcGFcIiwgICAgbmFtZTogXCJLb29wYVwiLCAgICAgIHNwcml0ZTogXCJrb29wYVwiLCAgICBicmFpbjogXCJub3JtYWxcIiB9XG4gIHsgaWQ6IFwicm9zYWxpbmFcIiwgbmFtZTogXCJSb3NhbGluYVwiLCAgIHNwcml0ZTogXCJyb3NhbGluYVwiLCBicmFpbjogXCJub3JtYWxcIiB9XG4gIHsgaWQ6IFwic2h5Z3V5XCIsICAgbmFtZTogXCJTaHlndXlcIiwgICAgIHNwcml0ZTogXCJzaHlndXlcIiwgICBicmFpbjogXCJub3JtYWxcIiB9XG4gIHsgaWQ6IFwidG9hZGV0dGVcIiwgbmFtZTogXCJUb2FkZXR0ZVwiLCAgIHNwcml0ZTogXCJ0b2FkZXR0ZVwiLCBicmFpbjogXCJub3JtYWxcIiB9XG5dXG5cbmFpQ2hhcmFjdGVycyA9IHt9XG5mb3IgY2hhcmFjdGVyIGluIGFpQ2hhcmFjdGVyTGlzdFxuICBhaUNoYXJhY3RlcnNbY2hhcmFjdGVyLmlkXSA9IGNoYXJhY3RlclxuXG5yYW5kb21DaGFyYWN0ZXIgPSAtPlxuICByID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogYWlDaGFyYWN0ZXJMaXN0Lmxlbmd0aClcbiAgcmV0dXJuIGFpQ2hhcmFjdGVyTGlzdFtyXVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBDYXJkXG5cbmNsYXNzIENhcmRcbiAgY29uc3RydWN0b3I6IChAcmF3KSAtPlxuICAgIEBzdWl0ICA9IE1hdGguZmxvb3IoQHJhdyAlIDQpXG4gICAgQHZhbHVlID0gTWF0aC5mbG9vcihAcmF3IC8gNClcbiAgICBAdmFsdWVOYW1lID0gc3dpdGNoIEB2YWx1ZVxuICAgICAgd2hlbiAgOCB0aGVuICdKJ1xuICAgICAgd2hlbiAgOSB0aGVuICdRJ1xuICAgICAgd2hlbiAxMCB0aGVuICdLJ1xuICAgICAgd2hlbiAxMSB0aGVuICdBJ1xuICAgICAgd2hlbiAxMiB0aGVuICcyJ1xuICAgICAgZWxzZVxuICAgICAgICBTdHJpbmcoQHZhbHVlICsgMylcbiAgICBAbmFtZSA9IEB2YWx1ZU5hbWUgKyBTaG9ydFN1aXROYW1lW0BzdWl0XVxuICAgICMgY29uc29sZS5sb2cgXCIje0ByYXd9IC0+ICN7QG5hbWV9XCJcbiAgZ2x5cGhlZE5hbWU6IC0+XG4gICAgcmV0dXJuIEB2YWx1ZU5hbWUgKyBHbHlwaFN1aXROYW1lW0BzdWl0XVxuXG5jYXJkc1RvU3RyaW5nID0gKHJhd0NhcmRzKSAtPlxuICBjYXJkTmFtZXMgPSBbXVxuICBmb3IgcmF3IGluIHJhd0NhcmRzXG4gICAgY2FyZCA9IG5ldyBDYXJkKHJhdylcbiAgICBjYXJkTmFtZXMucHVzaCBjYXJkLm5hbWVcbiAgcmV0dXJuIFwiWyBcIiArIGNhcmROYW1lcy5qb2luKCcsJykgKyBcIiBdXCJcblxucGxheVR5cGVUb1N0cmluZyA9ICh0eXBlKSAtPlxuICBpZiBtYXRjaGVzID0gdHlwZS5tYXRjaCgvXnJvcChcXGQrKS8pXG4gICAgcmV0dXJuIFwiUnVuIG9mICN7bWF0Y2hlc1sxXX0gUGFpcnNcIlxuICBpZiBtYXRjaGVzID0gdHlwZS5tYXRjaCgvXnJ1bihcXGQrKS8pXG4gICAgcmV0dXJuIFwiUnVuIG9mICN7bWF0Y2hlc1sxXX1cIlxuICBpZiBtYXRjaGVzID0gdHlwZS5tYXRjaCgvXmtpbmQoXFxkKykvKVxuICAgIGlmIG1hdGNoZXNbMV0gPT0gJzEnXG4gICAgICByZXR1cm4gJ1NpbmdsZSdcbiAgICBpZiBtYXRjaGVzWzFdID09ICcyJ1xuICAgICAgcmV0dXJuICdQYWlyJ1xuICAgIGlmIG1hdGNoZXNbMV0gPT0gJzMnXG4gICAgICByZXR1cm4gJ1RyaXBzJ1xuICAgIHJldHVybiAnUXVhZHMnXG4gIHJldHVybiB0eXBlXG5cbnBsYXlUb1N0cmluZyA9IChwbGF5KSAtPlxuICBoaWdoQ2FyZCA9IG5ldyBDYXJkKHBsYXkuaGlnaClcbiAgcmV0dXJuIFwiI3twbGF5VHlwZVRvU3RyaW5nKHBsYXkudHlwZSl9IC0gI3toaWdoQ2FyZC5nbHlwaGVkTmFtZSgpfVwiXG5cbnBsYXlUb0NhcmRDb3VudCA9IChwbGF5KSAtPlxuICBpZiBtYXRjaGVzID0gcGxheS50eXBlLm1hdGNoKC9ecm9wKFxcZCspLylcbiAgICByZXR1cm4gcGFyc2VJbnQobWF0Y2hlc1sxXSkgKiAyXG4gIGlmIG1hdGNoZXMgPSBwbGF5LnR5cGUubWF0Y2goL15ydW4oXFxkKykvKVxuICAgIHJldHVybiBwYXJzZUludChtYXRjaGVzWzFdKVxuICBpZiBtYXRjaGVzID0gcGxheS50eXBlLm1hdGNoKC9ea2luZChcXGQrKS8pXG4gICAgcmV0dXJuIHBhcnNlSW50KG1hdGNoZXNbMV0pXG4gIHJldHVybiAxICMgPz9cblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgRGVja1xuXG5jbGFzcyBTaHVmZmxlZERlY2tcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgIyBkYXQgaW5zaWRlLW91dCBzaHVmZmxlIVxuICAgIEBjYXJkcyA9IFsgMCBdXG4gICAgZm9yIGkgaW4gWzEuLi41Ml1cbiAgICAgIGogPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBpKVxuICAgICAgQGNhcmRzLnB1c2goQGNhcmRzW2pdKVxuICAgICAgQGNhcmRzW2pdID0gaVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBBY2hpZXZlbWVudHNcblxuYWNoaWV2ZW1lbnRzTGlzdCA9IFtcbiAge1xuICAgIGlkOiBcInZldGVyYW5cIlxuICAgIHRpdGxlOiBcIkkndmUgU2VlbiBTb21lIFRoaW5nc1wiXG4gICAgZGVzY3JpcHRpb246IFtcIlBsYXkgNTAgSGFuZHMuXCJdXG4gICAgcHJvZ3Jlc3M6IChhY2gpIC0+XG4gICAgICBpZiBhY2guc3RhdGUudG90YWxHYW1lcyA+PSA1MFxuICAgICAgICByZXR1cm4gXCJUb3RhbCBQbGF5ZWQ6IGBhYWZmYWFgI3thY2guc3RhdGUudG90YWxHYW1lc31gYCBHYW1lc1wiXG4gICAgICByZXR1cm4gXCJQcm9ncmVzczogI3thY2guc3RhdGUudG90YWxHYW1lc30gLyA1MFwiXG4gIH1cbiAge1xuICAgIGlkOiBcInRyeWhhcmRcIlxuICAgIHRpdGxlOiBcIlRyeWhhcmRcIlxuICAgIGRlc2NyaXB0aW9uOiBbXCJFYXJuIGEgNSBnYW1lIHdpbiBzdHJlYWsuXCJdXG4gICAgcHJvZ3Jlc3M6IChhY2gpIC0+XG4gICAgICBiZXN0U3RyZWFrID0gYWNoLnN0YXRlLmJlc3RTdHJlYWtcbiAgICAgIGJlc3RTdHJlYWsgPz0gMFxuICAgICAgaWYgYmVzdFN0cmVhayA+PSA1XG4gICAgICAgIHJldHVybiBcIkJlc3QgU3RyZWFrOiBgYWFmZmFhYCN7YmVzdFN0cmVha31gYCBXaW5zXCJcbiAgICAgIHMgPSBcIlwiXG4gICAgICBpZiBiZXN0U3RyZWFrID4gMVxuICAgICAgICBzID0gXCJzXCJcbiAgICAgIHJldHVybiBcIkJlc3QgU3RyZWFrOiAje2Jlc3RTdHJlYWt9IFdpbiN7c31cIlxuICB9XG4gIHtcbiAgICBpZDogXCJicmVha2VyXCJcbiAgICB0aXRsZTogXCJTcHJpbmcgQnJlYWtcIlxuICAgIGRlc2NyaXB0aW9uOiBbXCJCcmVhayBhIDIuXCJdXG4gIH1cbiAge1xuICAgIGlkOiBcImtlZXBpdGxvd1wiXG4gICAgdGl0bGU6IFwiS2VlcCBJdCBMb3csIEJveXNcIlxuICAgIGRlc2NyaXB0aW9uOiBbXCJQbGF5IGEgU2luZ2xlIDIgb24gdG9wIG9mIGEgU2luZ2xlIDMuXCJdXG4gIH1cbiAge1xuICAgIGlkOiBcInN1aXRlZFwiXG4gICAgdGl0bGU6IFwiRG9lc24ndCBFdmVuIE1hdHRlclwiXG4gICAgZGVzY3JpcHRpb246IFtcIlRocm93IGEgc3VpdGVkIHJ1bi5cIl1cbiAgfVxuICB7XG4gICAgaWQ6IFwidG9ueVwiXG4gICAgdGl0bGU6IFwiVGhlIFRvbnlcIlxuICAgIGRlc2NyaXB0aW9uOiBbXCJUaHJvdyBhIHJ1biBvZiA3IG9yIG1vcmUgY2FyZHMsIGFuZCB0aGVuIGxvc2UuXCJdXG4gIH1cbiAge1xuICAgIGlkOiBcInNhbXBsZXJcIlxuICAgIHRpdGxlOiBcIlNhbXBsZXIgUGxhdHRlclwiXG4gICAgZGVzY3JpcHRpb246IFtcIkluIGEgc2luZ2xlIGhhbmQ6IHBsYXkgYXQgbGVhc3Qgb25lIFNpbmdsZSxcIiwgXCJvbmUgUGFpciwgb25lIFRyaXBzLCBhbmQgb25lIFJ1bi5cIl1cbiAgfVxuICB7XG4gICAgaWQ6IFwidHJhZ2VkeVwiXG4gICAgdGl0bGU6IFwiVHJhZ2VkeVwiXG4gICAgZGVzY3JpcHRpb246IFtcIkJlZ2luIHRoZSBnYW1lIGJ5IHRocm93aW5nIGEgdHdvIGJyZWFrZXIgaW52b2x2aW5nXCIsIFwidGhlIDMgb2YgU3BhZGVzLlwiXVxuICB9XG4gIHtcbiAgICBpZDogXCJpbmRvbWl0YWJsZVwiXG4gICAgdGl0bGU6IFwiSW5kb21pdGFibGVcIlxuICAgIGRlc2NyaXB0aW9uOiBbXCJUaHJvdyBhIHJ1biBlbmRpbmcgaW4gdGhlIEFjZSBvZiBIZWFydHMuXCJdXG4gIH1cbiAge1xuICAgIGlkOiBcInJla3RcIlxuICAgIHRpdGxlOiBcIkdldCBSZWt0XCJcbiAgICBkZXNjcmlwdGlvbjogW1wiV2luIHdoaWxlIGFsbCBvcHBvbmVudHMgc3RpbGwgaGF2ZSAxMCBvciBtb3JlIGNhcmRzLlwiXVxuICB9XG4gIHtcbiAgICBpZDogXCJsYXRlXCJcbiAgICB0aXRsZTogXCJGYXNoaW9uYWJseSBMYXRlXCJcbiAgICBkZXNjcmlwdGlvbjogW1wiUGFzcyB1bnRpbCBhbGwgNCAycyBhcmUgdGhyb3duLCBhbmQgdGhlbiB3aW4uXCJdXG4gIH1cbiAge1xuICAgIGlkOiBcInBhaXJzXCJcbiAgICB0aXRsZTogXCJQYWlyaW5nIFVwXCJcbiAgICBkZXNjcmlwdGlvbjogW1wiVGhyb3cgNSBwYWlycyBpbiBhIHNpbmdsZSByb3VuZC5cIl1cbiAgfVxuICB7XG4gICAgaWQ6IFwieW91cnNlbGZcIlxuICAgIHRpdGxlOiBcIllvdSBQbGF5ZWQgWW91cnNlbGZcIlxuICAgIGRlc2NyaXB0aW9uOiBbXCJCZWF0IHlvdXIgb3duIHBsYXkuXCJdXG4gIH1cbiAge1xuICAgIGlkOiBcInRoaXJ0ZWVuXCJcbiAgICB0aXRsZTogXCJUaGlydGVlblwiXG4gICAgZGVzY3JpcHRpb246IFtcIkVhcm4gMTMgYWNoaWV2ZW1lbnRzLlwiXVxuICB9XG5dXG5cbmFjaGlldmVtZW50c01hcCA9IHt9XG5mb3IgZSBpbiBhY2hpZXZlbWVudHNMaXN0XG4gIGFjaGlldmVtZW50c01hcFtlLmlkXSA9IGVcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgVGhpcnRlZW5cblxuY2xhc3MgVGhpcnRlZW5cbiAgY29uc3RydWN0b3I6IChAZ2FtZSwgcGFyYW1zKSAtPlxuICAgIHJldHVybiBpZiBub3QgcGFyYW1zXG5cbiAgICBpZiBwYXJhbXMuc3RhdGVcbiAgICAgIGZvciBrLHYgb2YgcGFyYW1zLnN0YXRlXG4gICAgICAgIGlmIHBhcmFtcy5zdGF0ZS5oYXNPd25Qcm9wZXJ0eShrKVxuICAgICAgICAgIHRoaXNba10gPSBwYXJhbXMuc3RhdGVba11cbiAgICAgIEBpbml0QWNoaWV2ZW1lbnRzKClcbiAgICBlbHNlXG4gICAgICBAbmV3R2FtZShwYXJhbXMubW9uZXkpXG5cbiAgaW5pdEFjaGlldmVtZW50czogLT5cbiAgICBAYWNoID89IHt9XG4gICAgQGFjaC5lYXJuZWQgPz0ge31cbiAgICBAYWNoLnN0YXRlID89IHt9XG4gICAgQGFjaC5zdGF0ZS50b3RhbEdhbWVzID89IDBcbiAgICBAZmFuZmFyZXMgPSBbXVxuXG4gIGRlYWw6IChwYXJhbXMpIC0+XG4gICAgZGVjayA9IG5ldyBTaHVmZmxlZERlY2soKVxuICAgIGZvciBwbGF5ZXIsIHBsYXllckluZGV4IGluIEBwbGF5ZXJzXG4gICAgICBAZ2FtZS5sb2cgXCJkZWFsaW5nIDEzIGNhcmRzIHRvIHBsYXllciAje3BsYXllckluZGV4fVwiXG5cbiAgICAgIHBsYXllci5wbGFjZSA9IDBcbiAgICAgIHBsYXllci5oYW5kID0gW11cbiAgICAgIGZvciBqIGluIFswLi4uMTNdXG4gICAgICAgIHJhdyA9IGRlY2suY2FyZHMuc2hpZnQoKVxuICAgICAgICBpZiByYXcgPT0gMFxuICAgICAgICAgIEB0dXJuID0gcGxheWVySW5kZXhcbiAgICAgICAgcGxheWVyLmhhbmQucHVzaChyYXcpXG5cbiAgICAgICMgY29uc29sZS5sb2cgXCJAZ2FtZS5vcHRpb25zLnNvcnRJbmRleCAje0BnYW1lLm9wdGlvbnMuc29ydEluZGV4fVwiXG4gICAgICBpZiAoQGdhbWUub3B0aW9ucy5zb3J0SW5kZXggPT0gMCkgb3IgcGxheWVyLmFpXG4gICAgICAgICMgTm9ybWFsXG4gICAgICAgIHBsYXllci5oYW5kLnNvcnQgKGEsYikgLT4gcmV0dXJuIGEgLSBiXG4gICAgICBlbHNlXG4gICAgICAgICMgUmV2ZXJzZVxuICAgICAgICBwbGF5ZXIuaGFuZC5zb3J0IChhLGIpIC0+IHJldHVybiBiIC0gYVxuXG4gICAgQGluaXRBY2hpZXZlbWVudHMoKVxuICAgIEBhY2guc3RhdGUudGhyZXdTaW5nbGUgPSBmYWxzZVxuICAgIEBhY2guc3RhdGUudGhyZXdQYWlyID0gZmFsc2VcbiAgICBAYWNoLnN0YXRlLnRocmV3VHJpcHMgPSBmYWxzZVxuICAgIEBhY2guc3RhdGUudGhyZXdSdW4gPSBmYWxzZVxuICAgIEBhY2guc3RhdGUudGhyZXdSdW43ID0gZmFsc2VcbiAgICBAYWNoLnN0YXRlLnR3b3NTZWVuID0gMFxuICAgIEBhY2guc3RhdGUuZmFzaGlvbmFibHlMYXRlID0gZmFsc2VcbiAgICBAYWNoLnN0YXRlLnBhaXJzVGhyb3duID0gMFxuICAgIEBhY2guc3RhdGUuYmVzdFN0cmVhayA/PSAwXG5cbiAgICBAcGlsZSA9IFtdXG4gICAgQHBpbGVXaG8gPSAtMVxuICAgIEB0aHJvd0lEID0gMFxuICAgIEBjdXJyZW50UGxheSA9IG51bGxcbiAgICBAdW5wYXNzQWxsKClcblxuICAgIGZvck1vbmV5ID0gXCJcIlxuICAgIGlmIEBtb25leVxuICAgICAgZm9yTW9uZXkgPSBcIiAoZm9yIG1vbmV5KVwiXG4gICAgQG91dHB1dChcIkhhbmQgZGVhbHQje2Zvck1vbmV5fSwgXCIgKyBAcGxheWVyc1tAdHVybl0ubmFtZSArIFwiIHBsYXlzIGZpcnN0XCIpXG5cbiAgICByZXR1cm4gT0tcblxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIFRoaXJ0ZWVuIG1ldGhvZHNcblxuICBuZXdHYW1lOiAobW9uZXkgPSBmYWxzZSkgLT5cbiAgICAjIG5ldyBnYW1lXG4gICAgQGxvZyA9IFtdXG4gICAgQHN0cmVhayA9IDBcbiAgICBAbGFzdFN0cmVhayA9IDBcbiAgICBAbW9uZXkgPSBmYWxzZVxuICAgIGlmIG1vbmV5XG4gICAgICBAbW9uZXkgPSB0cnVlXG4gICAgY29uc29sZS5sb2cgXCJmb3IgbW9uZXk6ICN7QG1vbmV5fVwiXG5cbiAgICBAcGxheWVycyA9IFtcbiAgICAgIHsgaWQ6IDEsIG5hbWU6ICdQbGF5ZXInLCBpbmRleDogMCwgcGFzczogZmFsc2UsIG1vbmV5OiBTVEFSVElOR19NT05FWSB9XG4gICAgXVxuXG4gICAgZm9yIGkgaW4gWzEuLi40XVxuICAgICAgQGFkZEFJKClcblxuICAgIEBkZWFsKClcblxuICBzYXZlOiAtPlxuICAgIG5hbWVzID0gXCJsb2cgcGxheWVycyB0dXJuIHBpbGUgcGlsZVdobyB0aHJvd0lEIGN1cnJlbnRQbGF5IHN0cmVhayBsYXN0U3RyZWFrIGFjaCBtb25leVwiLnNwbGl0KFwiIFwiKVxuICAgIHN0YXRlID0ge31cbiAgICBmb3IgbmFtZSBpbiBuYW1lc1xuICAgICAgc3RhdGVbbmFtZV0gPSB0aGlzW25hbWVdXG4gICAgcmV0dXJuIHN0YXRlXG5cbiAgb3V0cHV0OiAodGV4dCkgLT5cbiAgICBAbG9nLnB1c2ggdGV4dFxuICAgIHdoaWxlIEBsb2cubGVuZ3RoID4gTUFYX0xPR19MSU5FU1xuICAgICAgQGxvZy5zaGlmdCgpXG5cbiAgaGVhZGxpbmU6IC0+XG4gICAgaWYgQGdhbWVPdmVyKClcbiAgICAgIHJldHVybiBcIkdhbWUgT3ZlclwiXG5cbiAgICBpZiBAcGlsZS5sZW5ndGggPT0gMFxuICAgICAgcGxheVN0cmluZyA9IFwidGhyb3cgQW55dGhpbmcgd2l0aCB0aGUgM1xceGM4XCJcbiAgICBlbHNlXG4gICAgICBpZiBAY3VycmVudFBsYXlcbiAgICAgICAgcGxheVN0cmluZyA9IFwiYmVhdCBcIiArIHBsYXlUb1N0cmluZyhAY3VycmVudFBsYXkpXG4gICAgICBlbHNlXG4gICAgICAgIHBsYXlTdHJpbmcgPSBcInRocm93IEFueXRoaW5nXCJcblxuICAgIGN1cnJlbnRQbGF5ZXIgPSBAY3VycmVudFBsYXllcigpXG4gICAgaWYgY3VycmVudFBsYXllci5haVxuICAgICAgcGxheWVyQ29sb3IgPSAnYjBiMDAwJ1xuICAgIGVsc2VcbiAgICAgIHBsYXllckNvbG9yID0gJ2ZmNzcwMCdcbiAgICBoZWFkbGluZSA9IFwiYCN7cGxheWVyQ29sb3J9YCN7Y3VycmVudFBsYXllci5uYW1lfWBmZmZmZmZgIHRvICN7cGxheVN0cmluZ31cIlxuICAgIGlmIEBldmVyeW9uZVBhc3NlZCgpXG4gICAgICBoZWFkbGluZSArPSBcIiAob3IgdGhyb3cgYW55dGhpbmcpXCJcbiAgICByZXR1cm4gaGVhZGxpbmVcblxuICBjYW5UaHJvd0FueXRoaW5nOiAtPlxuICAgIGlmIEBwaWxlLmxlbmd0aCA9PSAwXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGlmIG5vdCBAY3VycmVudFBsYXlcbiAgICAgIHJldHVybiB0cnVlXG4gICAgaWYgQGV2ZXJ5b25lUGFzc2VkKClcbiAgICAgIHJldHVybiB0cnVlXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgZmluZFBsYXllcjogKGlkKSAtPlxuICAgIGZvciBwbGF5ZXIgaW4gQHBsYXllcnNcbiAgICAgIGlmIHBsYXllci5pZCA9PSBpZFxuICAgICAgICByZXR1cm4gcGxheWVyXG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuXG4gIGN1cnJlbnRQbGF5ZXI6IC0+XG4gICAgcmV0dXJuIEBwbGF5ZXJzW0B0dXJuXVxuXG4gIGZpbmRQbGFjZTogKHBsYWNlKSAtPlxuICAgIGZvciBwbGF5ZXIgaW4gQHBsYXllcnNcbiAgICAgIGlmIChwbGFjZSA9PSA0KSBhbmQgKHBsYXllci5wbGFjZSA9PSAwKVxuICAgICAgICByZXR1cm4gcGxheWVyXG4gICAgICBpZiBwbGF5ZXIucGxhY2UgPT0gcGxhY2VcbiAgICAgICAgcmV0dXJuIHBsYXllclxuICAgIHJldHVybiB1bmRlZmluZWRcblxuICBwYXlvdXQ6IC0+XG4gICAgcGxhY2UxID0gQGZpbmRQbGFjZSgxKVxuICAgIHBsYWNlMiA9IEBmaW5kUGxhY2UoMilcbiAgICBwbGFjZTMgPSBAZmluZFBsYWNlKDMpXG4gICAgcGxhY2U0ID0gQGZpbmRQbGFjZSg0KVxuXG4gICAgaWYgbm90IHBsYWNlMSBvciBub3QgcGxhY2UyIG9yIG5vdCBwbGFjZTMgb3Igbm90IHBsYWNlNFxuICAgICAgQG91dHB1dCBcImVycm9yIHdpdGggcGF5b3V0cyFcIlxuICAgICAgcmV0dXJuXG5cbiAgICBAb3V0cHV0IFwiI3twbGFjZTQubmFtZX0gcGF5cyAkMiB0byAje3BsYWNlMS5uYW1lfVwiXG4gICAgQG91dHB1dCBcIiN7cGxhY2UzLm5hbWV9IHBheXMgJDEgdG8gI3twbGFjZTIubmFtZX1cIlxuXG4gICAgcGxhY2UxLm1vbmV5ICs9IDJcbiAgICBwbGFjZTIubW9uZXkgKz0gMVxuICAgIHBsYWNlMy5tb25leSArPSAtMVxuICAgIHBsYWNlNC5tb25leSArPSAtMlxuICAgIHJldHVyblxuXG4gICMgYWxsIElOQ0xVRElORyB0aGUgY3VycmVudCBwbGF5ZXJcbiAgZW50aXJlVGFibGVQYXNzZWQ6IC0+XG4gICAgZm9yIHBsYXllciwgcGxheWVySW5kZXggaW4gQHBsYXllcnNcbiAgICAgIGlmIHBsYXllci5wbGFjZSAhPSAwXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICBpZiBub3QgcGxheWVyLnBhc3NcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgcmV0dXJuIHRydWVcblxuICAjIGFsbCBidXQgdGhlIGN1cnJlbnQgcGxheWVyXG4gIGV2ZXJ5b25lUGFzc2VkOiAtPlxuICAgIGZvciBwbGF5ZXIsIHBsYXllckluZGV4IGluIEBwbGF5ZXJzXG4gICAgICBpZiAocGxheWVyLnBsYWNlICE9IDApIGFuZCAoQHBpbGVXaG8gIT0gcGxheWVySW5kZXgpXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICBpZiBwbGF5ZXJJbmRleCA9PSBAdHVyblxuICAgICAgICBjb250aW51ZVxuICAgICAgaWYgbm90IHBsYXllci5wYXNzXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIHJldHVybiB0cnVlXG5cbiAgcGxheWVyQWZ0ZXI6IChpbmRleCkgLT5cbiAgICBsb29wXG4gICAgICBpbmRleCA9IChpbmRleCArIDEpICUgQHBsYXllcnMubGVuZ3RoXG4gICAgICBpZiBAcGxheWVyc1tpbmRleF0ucGxhY2UgPT0gMFxuICAgICAgICByZXR1cm4gaW5kZXhcbiAgICByZXR1cm4gMCAjIGltcG9zc2libGU/XG5cbiAgYWRkUGxheWVyOiAocGxheWVyKSAtPlxuICAgIGlmIG5vdCBwbGF5ZXIuYWlcbiAgICAgIHBsYXllci5haSA9IGZhbHNlXG5cbiAgICBAcGxheWVycy5wdXNoIHBsYXllclxuICAgIHBsYXllci5pbmRleCA9IEBwbGF5ZXJzLmxlbmd0aCAtIDFcbiAgICBAb3V0cHV0KHBsYXllci5uYW1lICsgXCIgam9pbnMgdGhlIGdhbWVcIilcblxuICBuYW1lUHJlc2VudDogKG5hbWUpIC0+XG4gICAgZm9yIHBsYXllciBpbiBAcGxheWVyc1xuICAgICAgaWYgcGxheWVyLm5hbWUgPT0gbmFtZVxuICAgICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgYWRkQUk6IC0+XG4gICAgbG9vcFxuICAgICAgY2hhcmFjdGVyID0gcmFuZG9tQ2hhcmFjdGVyKClcbiAgICAgIGlmIG5vdCBAbmFtZVByZXNlbnQoY2hhcmFjdGVyLm5hbWUpXG4gICAgICAgIGJyZWFrXG5cbiAgICBhaSA9XG4gICAgICBjaGFySUQ6IGNoYXJhY3Rlci5pZFxuICAgICAgbmFtZTogY2hhcmFjdGVyLm5hbWVcbiAgICAgIGlkOiAnYWknICsgU3RyaW5nKEBwbGF5ZXJzLmxlbmd0aClcbiAgICAgIHBhc3M6IGZhbHNlXG4gICAgICBhaTogdHJ1ZVxuICAgICAgbW9uZXk6IFNUQVJUSU5HX01PTkVZXG5cbiAgICBAYWRkUGxheWVyKGFpKVxuXG4gICAgQGdhbWUubG9nKFwiYWRkZWQgQUkgcGxheWVyXCIpXG4gICAgcmV0dXJuIE9LXG5cbiAgdXBkYXRlUGxheWVySGFuZDogKGNhcmRzKSAtPlxuICAgICMgVGhpcyBtYWludGFpbnMgdGhlIHJlb3JnYW5pemVkIG9yZGVyIG9mIHRoZSBwbGF5ZXIncyBoYW5kXG4gICAgQHBsYXllcnNbMF0uaGFuZCA9IGNhcmRzLnNsaWNlKDApXG5cbiAgd2lubmVyOiAtPlxuICAgIGZvciBwbGF5ZXIsIGkgaW4gQHBsYXllcnNcbiAgICAgIGlmIHBsYXllci5wbGFjZSA9PSAxXG4gICAgICAgIHJldHVybiBwbGF5ZXJcbiAgICByZXR1cm4gbnVsbFxuXG4gIGdhbWVPdmVyOiAtPlxuICAgIG5wID0gQG5leHRQbGFjZSgpXG4gICAgaWYgQG1vbmV5XG4gICAgICByZXR1cm4gKG5wID4gMylcbiAgICByZXR1cm4gKG5wID4gMSlcblxuICBoYXNDYXJkOiAoaGFuZCwgcmF3Q2FyZCkgLT5cbiAgICBmb3IgcmF3IGluIGhhbmRcbiAgICAgIGlmIHJhdyA9PSByYXdDYXJkXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgaGFzQ2FyZHM6IChoYW5kLCByYXdDYXJkcykgLT5cbiAgICBmb3IgcmF3IGluIHJhd0NhcmRzXG4gICAgICBpZiBub3QgQGhhc0NhcmQoaGFuZCwgcmF3KVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICByZXR1cm4gdHJ1ZVxuXG4gIHJlbW92ZUNhcmRzOiAoaGFuZCwgcmF3Q2FyZHMpIC0+XG4gICAgbmV3SGFuZCA9IFtdXG4gICAgZm9yIGNhcmQgaW4gaGFuZFxuICAgICAga2VlcE1lID0gdHJ1ZVxuICAgICAgZm9yIHJhdyBpbiByYXdDYXJkc1xuICAgICAgICBpZiBjYXJkID09IHJhd1xuICAgICAgICAgIGtlZXBNZSA9IGZhbHNlXG4gICAgICAgICAgYnJlYWtcbiAgICAgIGlmIGtlZXBNZVxuICAgICAgICBuZXdIYW5kLnB1c2ggY2FyZFxuICAgIHJldHVybiBuZXdIYW5kXG5cbiAgY2xhc3NpZnk6IChyYXdDYXJkcykgLT5cbiAgICBjYXJkcyA9IHJhd0NhcmRzLm1hcCAocmF3KSAtPiBuZXcgQ2FyZChyYXcpXG4gICAgY2FyZHMgPSBjYXJkcy5zb3J0IChhLCBiKSAtPiByZXR1cm4gYS5yYXcgLSBiLnJhd1xuICAgIGhpZ2hlc3RSYXcgPSBjYXJkc1tjYXJkcy5sZW5ndGggLSAxXS5yYXdcblxuICAgICMgbG9vayBmb3IgYSBydW4gb2YgcGFpcnNcbiAgICBpZiAoY2FyZHMubGVuZ3RoID49IDYpIGFuZCAoKGNhcmRzLmxlbmd0aCAlIDIpID09IDApXG4gICAgICBmb3VuZFJvcCA9IHRydWVcbiAgICAgIGZvciBjYXJkLCBjYXJkSW5kZXggaW4gY2FyZHNcbiAgICAgICAgaWYgY2FyZEluZGV4ID09IDBcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICBpZiBjYXJkLnZhbHVlID09IDEyXG4gICAgICAgICAgIyBubyAycyBpbiBhIHJ1blxuICAgICAgICAgIGZvdW5kUm9wID0gZmFsc2VcbiAgICAgICAgICBicmVha1xuICAgICAgICBpZiAoY2FyZEluZGV4ICUgMikgPT0gMVxuICAgICAgICAgICMgb2RkIGNhcmQsIG11c3QgbWF0Y2ggbGFzdCBjYXJkIGV4YWN0bHlcbiAgICAgICAgICBpZiBjYXJkLnZhbHVlICE9IChjYXJkc1tjYXJkSW5kZXggLSAxXS52YWx1ZSlcbiAgICAgICAgICAgIGZvdW5kUm9wID0gZmFsc2VcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAjIGV2ZW4gY2FyZCwgbXVzdCBpbmNyZW1lbnRcbiAgICAgICAgICBpZiBjYXJkLnZhbHVlICE9IChjYXJkc1tjYXJkSW5kZXggLSAxXS52YWx1ZSArIDEpXG4gICAgICAgICAgICBmb3VuZFJvcCA9IGZhbHNlXG4gICAgICAgICAgICBicmVha1xuXG4gICAgICBpZiBmb3VuZFJvcFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHR5cGU6ICdyb3AnICsgTWF0aC5mbG9vcihjYXJkcy5sZW5ndGggLyAyKVxuICAgICAgICAgIGhpZ2g6IGhpZ2hlc3RSYXdcbiAgICAgICAgfVxuXG4gICAgIyBsb29rIGZvciBhIHJ1blxuICAgIGlmIGNhcmRzLmxlbmd0aCA+PSAzXG4gICAgICBmb3VuZFJ1biA9IHRydWVcbiAgICAgIGZvciBjYXJkLCBjYXJkSW5kZXggaW4gY2FyZHNcbiAgICAgICAgaWYgY2FyZEluZGV4ID09IDBcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICBpZiBjYXJkLnZhbHVlID09IDEyXG4gICAgICAgICAgIyBubyAycyBpbiBhIHJ1blxuICAgICAgICAgIGZvdW5kUnVuID0gZmFsc2VcbiAgICAgICAgICBicmVha1xuICAgICAgICBpZiBjYXJkLnZhbHVlICE9IChjYXJkc1tjYXJkSW5kZXggLSAxXS52YWx1ZSArIDEpXG4gICAgICAgICAgZm91bmRSdW4gPSBmYWxzZVxuICAgICAgICAgIGJyZWFrXG5cbiAgICAgIGlmIGZvdW5kUnVuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdHlwZTogJ3J1bicgKyBjYXJkcy5sZW5ndGhcbiAgICAgICAgICBoaWdoOiBoaWdoZXN0UmF3XG4gICAgICAgIH1cblxuICAgICMgbG9vayBmb3IgWCBvZiBhIGtpbmRcbiAgICByZXFWYWx1ZSA9IGNhcmRzWzBdLnZhbHVlXG4gICAgZm9yIGNhcmQgaW4gY2FyZHNcbiAgICAgIGlmIGNhcmQudmFsdWUgIT0gcmVxVmFsdWVcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICB0eXBlID0gJ2tpbmQnICsgY2FyZHMubGVuZ3RoXG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IHR5cGVcbiAgICAgIGhpZ2g6IGhpZ2hlc3RSYXdcbiAgICB9XG5cbiAgaGFuZEhhczNTOiAoaGFuZCkgLT5cbiAgICBmb3IgcmF3IGluIGhhbmRcbiAgICAgIGlmIHJhdyA9PSAwXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgbmV4dFBsYWNlOiAtPlxuICAgIGhpZ2hlc3RQbGFjZSA9IDBcbiAgICBmb3IgcGxheWVyIGluIEBwbGF5ZXJzXG4gICAgICBwbGF5ZXIucGxhY2UgPz0gMFxuICAgICAgaWYgaGlnaGVzdFBsYWNlIDwgcGxheWVyLnBsYWNlXG4gICAgICAgIGhpZ2hlc3RQbGFjZSA9IHBsYXllci5wbGFjZVxuICAgIHJldHVybiBoaWdoZXN0UGxhY2UgKyAxXG5cbiAgc3BsaXRQbGF5VHlwZTogKHBsYXlUeXBlKSAtPlxuICAgIGlmIG1hdGNoZXMgPSBwbGF5VHlwZS5tYXRjaCgvXihbXjAtOV0rKShcXGQrKS8pXG4gICAgICByZXR1cm4gW21hdGNoZXNbMV0sIHBhcnNlSW50KG1hdGNoZXNbMl0pXVxuICAgIHJldHVybiBbcGxheVR5cGUsIDFdXG5cbiAgaGFzUGxheTogKGN1cnJlbnRQbGF5LCBoYW5kKSAtPlxuICAgICMgcXVpY2sgY2hlY2suIGlmIHlvdSBkb250IGhhdmUgZW5vdWdoIGNhcmRzLCB5b3UgY2FuJ3QgaGF2ZSBhIHBsYXlcbiAgICBpZiAocGxheVRvQ2FyZENvdW50KGN1cnJlbnRQbGF5KSA+IGhhbmQubGVuZ3RoKVxuICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICBsZWZ0b3ZlcnMgPSBbXVxuICAgIHBsYXlzID0ge31cbiAgICBzcGwgPSBAc3BsaXRQbGF5VHlwZShjdXJyZW50UGxheS50eXBlKVxuICAgIHN3aXRjaCBzcGxbMF1cbiAgICAgIHdoZW4gJ3JvcCdcbiAgICAgICAgbGVmdG92ZXJzID0gQGFpQ2FsY1JvcHMoaGFuZCwgcGxheXMsIHNwbFsxXSlcbiAgICAgIHdoZW4gJ3J1bidcbiAgICAgICAgbGVmdG92ZXJzID0gQGFpQ2FsY1J1bnMoaGFuZCwgcGxheXMsIGZhbHNlLCBzcGxbMV0pXG4gICAgICB3aGVuICdraW5kJ1xuICAgICAgICBsZWZ0b3ZlcnMgPSBAYWxDYWxjS2luZHMoaGFuZCwgcGxheXMsIHRydWUpXG5cbiAgICBwbGF5cy5raW5kMSA/PSBbXVxuICAgIGZvciBsZWZ0b3ZlciBpbiBsZWZ0b3ZlcnNcbiAgICAgIHBsYXlzLmtpbmQxLnB1c2ggW2xlZnRvdmVyXVxuXG4gICAgaWYgcGxheXNbY3VycmVudFBsYXkudHlwZV0/IGFuZCBwbGF5c1tjdXJyZW50UGxheS50eXBlXS5sZW5ndGggPiAwXG4gICAgICAgIGZvciBwbGF5IGluIHBsYXlzW2N1cnJlbnRQbGF5LnR5cGVdXG4gICAgICAgICAgaWYgQGhpZ2hlc3RDYXJkKHBsYXkpID4gY3VycmVudFBsYXkuaGlnaFxuICAgICAgICAgICAgcmV0dXJuIHRydWVcblxuICAgICMgc3BlY2lhbCBjYXNlIGtpbmRzXG4gICAgaWYgc3BsWzBdID09ICdraW5kJ1xuICAgICAgIyBjaGVjayBiaWdnZXIga2luZHNcbiAgICAgIGZvciBiaWdnZXJLaW5kIGluIFtzcGxbMV0uLjRdXG4gICAgICAgIGJpZ2dlclR5cGUgPSBcImtpbmQje2JpZ2dlcktpbmR9XCJcbiAgICAgICAgaWYgcGxheXNbYmlnZ2VyVHlwZV0/IGFuZCBwbGF5c1tiaWdnZXJUeXBlXS5sZW5ndGggPiAwXG4gICAgICAgICAgICBmb3IgcGxheSBpbiBwbGF5c1tiaWdnZXJUeXBlXVxuICAgICAgICAgICAgICBpZiBAaGlnaGVzdENhcmQocGxheSkgPiBjdXJyZW50UGxheS5oaWdoXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcblxuICAgICMgbm8gcGxheXMsIHBhc3NcbiAgICByZXR1cm4gZmFsc2VcblxuICBjYW5QYXNzOiAocGFyYW1zKSAtPlxuICAgIGlmIEBnYW1lT3ZlcigpXG4gICAgICByZXR1cm4gJ2dhbWVPdmVyJ1xuXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcbiAgICBpZiBwYXJhbXMuaWQgIT0gY3VycmVudFBsYXllci5pZFxuICAgICAgcmV0dXJuICdub3RZb3VyVHVybidcblxuICAgIGlmIEBwaWxlLmxlbmd0aCA9PSAwXG4gICAgICByZXR1cm4gJ211c3RUaHJvdzNTJ1xuXG4gICAgaWYgQGV2ZXJ5b25lUGFzc2VkKClcbiAgICAgIHJldHVybiAndGhyb3dBbnl0aGluZydcblxuICAgIHJldHVybiBPS1xuXG4gIGNhblBsYXk6IChwYXJhbXMsIGluY29taW5nUGxheSwgaGFuZEhhczNTKSAtPlxuICAgIGlmIEBnYW1lT3ZlcigpXG4gICAgICByZXR1cm4gJ2dhbWVPdmVyJ1xuXG4gICAgY3VycmVudFBsYXllciA9IEBjdXJyZW50UGxheWVyKClcbiAgICBpZiBwYXJhbXMuaWQgIT0gY3VycmVudFBsYXllci5pZFxuICAgICAgcmV0dXJuICdub3RZb3VyVHVybidcblxuICAgIGlmIGluY29taW5nUGxheSA9PSBudWxsXG4gICAgICByZXR1cm4gJ2ludmFsaWRQbGF5J1xuXG4gICAgaWYgQHBpbGUubGVuZ3RoID09IDBcbiAgICAgIGlmIG5vdCBoYW5kSGFzM1NcbiAgICAgICAgcmV0dXJuICdtdXN0VGhyb3czUydcblxuICAgIGN1cnJlbnRQbGF5ZXIgPSBAY3VycmVudFBsYXllcigpXG4gICAgaWYgY3VycmVudFBsYXllci5wYXNzXG4gICAgICBpZiBAY3VycmVudFBsYXkgYW5kIEBjYW5CZUJyb2tlbihAY3VycmVudFBsYXkpXG4gICAgICAgIGlmIEBpc0JyZWFrZXJUeXBlKGluY29taW5nUGxheS50eXBlKVxuICAgICAgICAgIHJldHVybiBPS1xuICAgICAgICBlbHNlXG4gICAgICAgICAgcmV0dXJuICdtdXN0QnJlYWtPclBhc3MnXG4gICAgICByZXR1cm4gJ211c3RQYXNzJ1xuXG4gICAgaWYgQGN1cnJlbnRQbGF5ID09IG51bGxcbiAgICAgIHJldHVybiBPS1xuXG4gICAgaWYgQGV2ZXJ5b25lUGFzc2VkKClcbiAgICAgIHJldHVybiBPS1xuXG4gICAgaWYgQGNhbkJlQnJva2VuKEBjdXJyZW50UGxheSkgYW5kIEBpc0JyZWFrZXJUeXBlKGluY29taW5nUGxheS50eXBlKVxuICAgICAgIyAyIGJyZWFrZXIhXG4gICAgICByZXR1cm4gT0tcblxuICAgIGlmIGluY29taW5nUGxheS50eXBlICE9IEBjdXJyZW50UGxheS50eXBlXG4gICAgICByZXR1cm4gJ3dyb25nUGxheSdcblxuICAgIGlmIGluY29taW5nUGxheS5oaWdoIDwgQGN1cnJlbnRQbGF5LmhpZ2hcbiAgICAgIHJldHVybiAndG9vTG93UGxheSdcblxuICAgIHJldHVybiBPS1xuXG4gIHBsYXk6IChwYXJhbXMpIC0+XG4gICAgaW5jb21pbmdQbGF5ID0gQGNsYXNzaWZ5KHBhcmFtcy5jYXJkcylcbiAgICBjb25zb2xlLmxvZyBcImluY29taW5nUGxheVwiLCBpbmNvbWluZ1BsYXlcblxuICAgIGNvbnNvbGUubG9nIFwic29tZW9uZSBjYWxsaW5nIHBsYXlcIiwgcGFyYW1zXG4gICAgcmV0ID0gQGNhblBsYXkocGFyYW1zLCBpbmNvbWluZ1BsYXksIEBoYW5kSGFzM1MocGFyYW1zLmNhcmRzKSlcbiAgICBpZiByZXQgIT0gT0tcbiAgICAgIHJldHVybiByZXRcblxuICAgIGJyZWFrZXJUaHJvd24gPSBmYWxzZVxuICAgIG5ld1Rocm93ID0gdHJ1ZVxuXG4gICAgIyBUT0RPOiBtYWtlIHByZXR0eSBuYW1lcyBiYXNlZCBvbiB0aGUgcGxheSwgYWRkIHBsYXkgdG8gaGVhZGxpbmVcbiAgICB2ZXJiID0gXCJ0aHJvd3M6XCJcbiAgICBpZiBAY3VycmVudFBsYXlcbiAgICAgIGlmIEBjYW5CZUJyb2tlbihAY3VycmVudFBsYXkpIGFuZCBAaXNCcmVha2VyVHlwZShpbmNvbWluZ1BsYXkudHlwZSlcbiAgICAgICAgIyAyIGJyZWFrZXIhXG4gICAgICAgIEB1bnBhc3NBbGwoKVxuICAgICAgICB2ZXJiID0gXCJicmVha3MgMjpcIlxuICAgICAgICBicmVha2VyVGhyb3duID0gdHJ1ZVxuICAgICAgICBuZXdUaHJvdyA9IGZhbHNlXG4gICAgICBlbHNlIGlmIChpbmNvbWluZ1BsYXkudHlwZSAhPSBAY3VycmVudFBsYXkudHlwZSkgb3IgKGluY29taW5nUGxheS5oaWdoIDwgQGN1cnJlbnRQbGF5LmhpZ2gpXG4gICAgICAgICMgTmV3IHBsYXkhXG4gICAgICAgIEB1bnBhc3NBbGwoKVxuICAgICAgICB2ZXJiID0gXCJ0aHJvd3MgbmV3OlwiXG4gICAgICBlbHNlXG4gICAgICAgIG5ld1Rocm93ID0gZmFsc2VcbiAgICBlbHNlXG4gICAgICB2ZXJiID0gXCJiZWdpbnM6XCJcblxuICAgICMgQWNoaWV2ZW1lbnRzXG4gICAgQGFjaC5zdGF0ZS50d29zU2VlbiA/PSAwXG4gICAgQGFjaC5zdGF0ZS5wYWlyc1Rocm93biA/PSAwXG4gICAgZm9yIGNhcmQgaW4gcGFyYW1zLmNhcmRzXG4gICAgICBpZiBjYXJkID49IDQ4XG4gICAgICAgIEBhY2guc3RhdGUudHdvc1NlZW4gKz0gMVxuICAgIGlmIChAYWNoLnN0YXRlLnR3b3NTZWVuID09IDQpIGFuZCAoQHBsYXllcnNbMF0uaGFuZC5sZW5ndGggPT0gMTMpXG4gICAgICBAYWNoLnN0YXRlLmZhc2hpb25hYmx5TGF0ZSA9IHRydWVcbiAgICBjb25zb2xlLmxvZyBcIkBhY2guc3RhdGUuZmFzaGlvbmFibHlMYXRlICN7QGFjaC5zdGF0ZS5mYXNoaW9uYWJseUxhdGV9XCJcbiAgICBpZiBAdHVybiA9PSAwXG4gICAgICBpZiBAZXZlcnlvbmVQYXNzZWQoKSBhbmQgbm90IG5ld1Rocm93XG4gICAgICAgIEBlYXJuIFwieW91cnNlbGZcIlxuICAgICAgaWYgaW5jb21pbmdQbGF5LnR5cGUgPT0gJ2tpbmQyJ1xuICAgICAgICBAYWNoLnN0YXRlLnBhaXJzVGhyb3duICs9IDFcbiAgICAgICAgaWYgQGFjaC5zdGF0ZS5wYWlyc1Rocm93biA+PSA1XG4gICAgICAgICAgQGVhcm4gXCJwYWlyc1wiXG4gICAgICBpZiBicmVha2VyVGhyb3duXG4gICAgICAgIEBlYXJuIFwiYnJlYWtlclwiXG4gICAgICBpZiBAaXNCcmVha2VyVHlwZShpbmNvbWluZ1BsYXkudHlwZSkgYW5kIChAcGlsZS5sZW5ndGggPT0gMClcbiAgICAgICAgQGVhcm4gXCJ0cmFnZWR5XCJcbiAgICAgIGlmIEBpc1J1blR5cGUoaW5jb21pbmdQbGF5LnR5cGUpIGFuZCBAaXNTdWl0ZWQocGFyYW1zLmNhcmRzKVxuICAgICAgICBAZWFybiBcInN1aXRlZFwiXG4gICAgICBpZiBAY3VycmVudFBsYXkgYW5kIChAY3VycmVudFBsYXkudHlwZSA9PSAna2luZDEnKSBhbmQgKEBjdXJyZW50UGxheS5oaWdoIDw9IDMpIGFuZCAoaW5jb21pbmdQbGF5LnR5cGUgPT0gJ2tpbmQxJykgYW5kIChpbmNvbWluZ1BsYXkuaGlnaCA+PSA0OClcbiAgICAgICAgQGVhcm4gXCJrZWVwaXRsb3dcIlxuICAgICAgaWYgQGlzUnVuVHlwZShpbmNvbWluZ1BsYXkudHlwZSkgYW5kIChpbmNvbWluZ1BsYXkuaGlnaCA9PSA0NykgIyBBY2Ugb2YgSGVhcnRzXG4gICAgICAgIEBlYXJuIFwiaW5kb21pdGFibGVcIlxuICAgICAgaWYgQGlzQmlnUnVuKGluY29taW5nUGxheSwgNylcbiAgICAgICAgY29uc29sZS5sb2cgXCJ0aHJld1J1bjc6IHRydWVcIlxuICAgICAgICBAYWNoLnN0YXRlLnRocmV3UnVuNyA9IHRydWVcbiAgICAgIGlmIGluY29taW5nUGxheS50eXBlID09ICdraW5kMSdcbiAgICAgICAgQGFjaC5zdGF0ZS50aHJld1NpbmdsZSA9IHRydWVcbiAgICAgIGlmIGluY29taW5nUGxheS50eXBlID09ICdraW5kMidcbiAgICAgICAgQGFjaC5zdGF0ZS50aHJld1BhaXIgPSB0cnVlXG4gICAgICBpZiBpbmNvbWluZ1BsYXkudHlwZSA9PSAna2luZDMnXG4gICAgICAgIEBhY2guc3RhdGUudGhyZXdUcmlwcyA9IHRydWVcbiAgICAgIGlmIGluY29taW5nUGxheS50eXBlLm1hdGNoKC9ecnVuLylcbiAgICAgICAgQGFjaC5zdGF0ZS50aHJld1J1biA9IHRydWVcbiAgICAgIGlmIEBhY2guc3RhdGUudGhyZXdTaW5nbGUgYW5kIEBhY2guc3RhdGUudGhyZXdQYWlyIGFuZCBAYWNoLnN0YXRlLnRocmV3VHJpcHMgYW5kIEBhY2guc3RhdGUudGhyZXdSdW5cbiAgICAgICAgQGVhcm4gXCJzYW1wbGVyXCJcblxuICAgIEBjdXJyZW50UGxheSA9IGluY29taW5nUGxheVxuXG4gICAgQHRocm93SUQgKz0gMVxuICAgIGN1cnJlbnRQbGF5ZXIgPSBAY3VycmVudFBsYXllcigpXG4gICAgY3VycmVudFBsYXllci5oYW5kID0gQHJlbW92ZUNhcmRzKGN1cnJlbnRQbGF5ZXIuaGFuZCwgcGFyYW1zLmNhcmRzKVxuXG4gICAgQG91dHB1dChcIiN7Y3VycmVudFBsYXllci5uYW1lfSAje3ZlcmJ9ICN7cGxheVRvU3RyaW5nKGluY29taW5nUGxheSl9XCIpXG5cbiAgICBpZiBjdXJyZW50UGxheWVyLmhhbmQubGVuZ3RoID09IDBcbiAgICAgICMgR2FtZSBvdmVyISBkbyBnYW1lb3ZlciB0aGluZ3MuXG5cbiAgICAgIGN1cnJlbnRQbGF5ZXIucGxhY2UgPSBAbmV4dFBsYWNlKClcblxuICAgICAgaWYgQG1vbmV5XG4gICAgICAgIHBsYWNlU3RyaW5nID0gXCI0dGhcIlxuICAgICAgICBpZiBjdXJyZW50UGxheWVyLnBsYWNlID09IDFcbiAgICAgICAgICBwbGFjZVN0cmluZyA9IFwiMXN0XCJcbiAgICAgICAgZWxzZSBpZiBjdXJyZW50UGxheWVyLnBsYWNlID09IDJcbiAgICAgICAgICBwbGFjZVN0cmluZyA9IFwiMm5kXCJcbiAgICAgICAgZWxzZSBpZiBjdXJyZW50UGxheWVyLnBsYWNlID09IDNcbiAgICAgICAgICBwbGFjZVN0cmluZyA9IFwiM3JkXCJcbiAgICAgICAgQG91dHB1dChcIiN7Y3VycmVudFBsYXllci5uYW1lfSB0YWtlcyAje3BsYWNlU3RyaW5nfSBwbGFjZVwiKVxuXG4gICAgICAgIGlmIGN1cnJlbnRQbGF5ZXIucGxhY2UgPT0gM1xuICAgICAgICAgIEBwYXlvdXQoKVxuICAgICAgZWxzZVxuICAgICAgICBAb3V0cHV0KFwiI3tjdXJyZW50UGxheWVyLm5hbWV9IHdpbnMhXCIpXG5cbiAgICAgIGlmIGN1cnJlbnRQbGF5ZXIucGxhY2UgPT0gMVxuICAgICAgICBpZiBAdHVybiA9PSAwXG4gICAgICAgICAgQHN0cmVhayArPSAxXG4gICAgICAgICAgQGxhc3RTdHJlYWsgPSBAc3RyZWFrXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAbGFzdFN0cmVhayA9IEBzdHJlYWtcbiAgICAgICAgICBAc3RyZWFrID0gMFxuXG4gICAgICBAYWNoLnN0YXRlLmJlc3RTdHJlYWsgPz0gMFxuICAgICAgaWYgQGFjaC5zdGF0ZS5iZXN0U3RyZWFrIDwgQGxhc3RTdHJlYWtcbiAgICAgICAgQGFjaC5zdGF0ZS5iZXN0U3RyZWFrID0gQGxhc3RTdHJlYWtcblxuICAgICAgIyBBY2hpZXZlbWVudHNcbiAgICAgIGlmIEBhY2guc3RhdGUuYmVzdFN0cmVhayA+PSA1XG4gICAgICAgIEBlYXJuIFwidHJ5aGFyZFwiXG4gICAgICBAYWNoLnN0YXRlLnRvdGFsR2FtZXMgKz0gMVxuICAgICAgaWYgQGFjaC5zdGF0ZS50b3RhbEdhbWVzID49IDUwXG4gICAgICAgIEBlYXJuIFwidmV0ZXJhblwiXG4gICAgICBpZiBjdXJyZW50UGxheWVyLnBsYWNlID09IDFcbiAgICAgICAgaWYgQHR1cm4gPT0gMFxuICAgICAgICAgICMgcGxheWVyIHdvblxuICAgICAgICAgIGlmIChAcGxheWVyc1sxXS5oYW5kLmxlbmd0aCA+PSAxMCkgYW5kIChAcGxheWVyc1syXS5oYW5kLmxlbmd0aCA+PSAxMCkgYW5kIChAcGxheWVyc1szXS5oYW5kLmxlbmd0aCA+PSAxMClcbiAgICAgICAgICAgIEBlYXJuIFwicmVrdFwiXG4gICAgICAgICAgaWYgQGFjaC5zdGF0ZS5mYXNoaW9uYWJseUxhdGVcbiAgICAgICAgICAgIEBlYXJuIFwibGF0ZVwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAjIHBsYXllciBsb3N0XG4gICAgICAgICAgaWYgQGFjaC5zdGF0ZS50aHJld1J1bjdcbiAgICAgICAgICAgIEBlYXJuIFwidG9ueVwiXG5cbiAgICBhY2hpZXZlbWVudENvdW50ID0gMFxuICAgIGZvciBhY2hpZXZlbWVudCBpbiBhY2hpZXZlbWVudHNMaXN0XG4gICAgICBpZiBAYWNoLmVhcm5lZFthY2hpZXZlbWVudC5pZF1cbiAgICAgICAgYWNoaWV2ZW1lbnRDb3VudCArPSAxXG4gICAgaWYgYWNoaWV2ZW1lbnRDb3VudCA+PSAxM1xuICAgICAgQGVhcm4gXCJ0aGlydGVlblwiXG5cbiAgICBAcGlsZSA9IHBhcmFtcy5jYXJkcy5zbGljZSgwKVxuICAgIEBwaWxlV2hvID0gQHR1cm5cblxuICAgIEB0dXJuID0gQHBsYXllckFmdGVyKEB0dXJuKVxuICAgIHJldHVybiBPS1xuXG4gIHVucGFzc0FsbDogLT5cbiAgICBmb3IgcGxheWVyIGluIEBwbGF5ZXJzXG4gICAgICBwbGF5ZXIucGFzcyA9IGZhbHNlXG4gICAgcmV0dXJuXG5cbiAgcGFzczogKHBhcmFtcykgLT5cbiAgICByZXQgPSBAY2FuUGFzcyhwYXJhbXMpXG4gICAgaWYgcmV0ICE9IE9LXG4gICAgICByZXR1cm4gcmV0XG5cbiAgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxuICAgIGlmIG5vdCBjdXJyZW50UGxheWVyLmFpIGFuZCBAY3VycmVudFBsYXkgYW5kIG5vdCBAaGFzUGxheShAY3VycmVudFBsYXksIGN1cnJlbnRQbGF5ZXIuaGFuZClcbiAgICAgIEBvdXRwdXQoXCIje2N1cnJlbnRQbGF5ZXIubmFtZX0gYXV0by1wYXNzZXMgKG5vIHBsYXlzKVwiKVxuICAgIGVsc2UgaWYgY3VycmVudFBsYXllci5wYXNzXG4gICAgICBAb3V0cHV0KFwiI3tjdXJyZW50UGxheWVyLm5hbWV9IGF1dG8tcGFzc2VzXCIpXG4gICAgZWxzZVxuICAgICAgQG91dHB1dChcIiN7Y3VycmVudFBsYXllci5uYW1lfSBwYXNzZXNcIilcbiAgICBjdXJyZW50UGxheWVyLnBhc3MgPSB0cnVlXG4gICAgQHR1cm4gPSBAcGxheWVyQWZ0ZXIoQHR1cm4pXG4gICAgcmV0dXJuIE9LXG5cbiAgYWlQbGF5OiAoY3VycmVudFBsYXllciwgY2FyZHMpIC0+XG4gICAgcmV0dXJuIEBwbGF5KHsnaWQnOmN1cnJlbnRQbGF5ZXIuaWQsICdjYXJkcyc6Y2FyZHN9KVxuXG4gIGFpUGFzczogKGN1cnJlbnRQbGF5ZXIpIC0+XG4gICAgcmV0dXJuIEBwYXNzKHsnaWQnOmN1cnJlbnRQbGF5ZXIuaWR9KVxuXG4gIGVhcm46IChpZCkgLT5cbiAgICBpZiBAYWNoLmVhcm5lZFtpZF1cbiAgICAgIHJldHVyblxuICAgIGFjaGlldmVtZW50ID0gYWNoaWV2ZW1lbnRzTWFwW2lkXVxuICAgIGlmIG5vdCBhY2hpZXZlbWVudD9cbiAgICAgIHJldHVyblxuXG4gICAgQGFjaC5lYXJuZWRbaWRdID0gdHJ1ZVxuICAgIEBvdXRwdXQoXCJFYXJuZWQ6ICN7YWNoaWV2ZW1lbnQudGl0bGV9XCIpXG4gICAgQGZhbmZhcmVzLnB1c2ggYWNoaWV2ZW1lbnQudGl0bGVcblxuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgQUlcblxuICAjIEdlbmVyaWMgbG9nZ2luZyBmdW5jdGlvbjsgcHJlcGVuZHMgY3VycmVudCBBSSBwbGF5ZXIncyBndXRzIGJlZm9yZSBwcmludGluZyB0ZXh0XG4gIGFpTG9nOiAodGV4dCkgLT5cbiAgICBjdXJyZW50UGxheWVyID0gQGN1cnJlbnRQbGF5ZXIoKVxuICAgIGlmIG5vdCBjdXJyZW50UGxheWVyLmFpXG4gICAgICByZXR1cm4gZmFsc2VcblxuICAgIGNoYXJhY3RlciA9IGFpQ2hhcmFjdGVyc1tjdXJyZW50UGxheWVyLmNoYXJJRF1cbiAgICBAZ2FtZS5sb2coJ0FJWycrY3VycmVudFBsYXllci5uYW1lKycgJytjaGFyYWN0ZXIuYnJhaW4rJ106IGhhbmQ6JytjYXJkc1RvU3RyaW5nKGN1cnJlbnRQbGF5ZXIuaGFuZCkrJyBwaWxlOicrY2FyZHNUb1N0cmluZyhAcGlsZSkrJyAnK3RleHQpXG5cbiAgIyBEZXRlY3RzIGlmIHRoZSBjdXJyZW50IHBsYXllciBpcyBBSSBkdXJpbmcgYSBCSUQgb3IgVFJJQ0sgcGhhc2UgYW5kIGFjdHMgYWNjb3JkaW5nIHRvIHRoZWlyICdicmFpbidcbiAgYWlUaWNrOiAtPlxuICAgIGlmIEBnYW1lT3ZlcigpXG4gICAgICByZXR1cm4gZmFsc2VcblxuICAgIGlmIEBlbnRpcmVUYWJsZVBhc3NlZCgpXG4gICAgICBAdHVybiA9IEBwbGF5ZXJBZnRlcihAcGlsZVdobylcbiAgICAgIEB1bnBhc3NBbGwoKVxuICAgICAgQGN1cnJlbnRQbGF5ID0gbnVsbFxuICAgICAgQG91dHB1dCgnV2hvbGUgdGFibGUgcGFzc2VzLCBjb250cm9sIHRvICcgKyBAcGxheWVyc1tAdHVybl0ubmFtZSlcblxuICAgIGN1cnJlbnRQbGF5ZXIgPSBAY3VycmVudFBsYXllcigpXG4gICAgaWYgbm90IGN1cnJlbnRQbGF5ZXIuYWlcbiAgICAgIGlmIG5vdCBAY2FuVGhyb3dBbnl0aGluZygpXG4gICAgICAgIGlmIEBjdXJyZW50UGxheSBhbmQgKEBjdXJyZW50UGxheS50eXBlID09ICdraW5kMScpIGFuZCAoQGN1cnJlbnRQbGF5LmhpZ2ggPj0gNDgpIGFuZCBAaGFzQnJlYWtlcihjdXJyZW50UGxheWVyLmhhbmQpXG4gICAgICAgICAgIyBkbyBub3RoaW5nLCBwbGF5ZXIgY2FuIGRyb3AgYSBicmVha2VyXG4gICAgICAgIGVsc2UgaWYgQGN1cnJlbnRQbGF5IGFuZCBub3QgQGhhc1BsYXkoQGN1cnJlbnRQbGF5LCBjdXJyZW50UGxheWVyLmhhbmQpXG4gICAgICAgICAgQGFpTG9nKFwiYXV0b3Bhc3NpbmcgZm9yIHBsYXllciwgbm8gcGxheXNcIilcbiAgICAgICAgICBAYWlQYXNzKGN1cnJlbnRQbGF5ZXIpXG4gICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgZWxzZSBpZiBjdXJyZW50UGxheWVyLnBhc3NcbiAgICAgICAgICBAYWlMb2coXCJhdXRvcGFzc2luZyBmb3IgcGxheWVyXCIpXG4gICAgICAgICAgQGFpUGFzcyhjdXJyZW50UGxheWVyKVxuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICByZXR1cm4gZmFsc2VcblxuICAgIGNoYXJhY3RlciA9IGFpQ2hhcmFjdGVyc1tjdXJyZW50UGxheWVyLmNoYXJJRF1cbiAgICByZXQgPSBAYnJhaW5zW2NoYXJhY3Rlci5icmFpbl0ucGxheS5hcHBseSh0aGlzLCBbY3VycmVudFBsYXllciwgQGN1cnJlbnRQbGF5LCBAZXZlcnlvbmVQYXNzZWQoKV0pXG4gICAgaWYgcmV0ID09IE9LXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIHJldHVybiBmYWxzZVxuXG4gIGFsQ2FsY0tpbmRzOiAoaGFuZCwgcGxheXMsIG1hdGNoMnMgPSBmYWxzZSkgLT5cbiAgICBjYXJkcyA9IGhhbmQubWFwIChyYXcpIC0+IG5ldyBDYXJkKHJhdylcbiAgICBjYXJkcyA9IGNhcmRzLnNvcnQgKGEsIGIpIC0+IHJldHVybiBhLnJhdyAtIGIucmF3XG4gICAgdmFsdWVBcnJheXMgPSBbXVxuICAgIGZvciBpIGluIFswLi4uMTNdXG4gICAgICB2YWx1ZUFycmF5cy5wdXNoIFtdXG4gICAgZm9yIGNhcmQgaW4gY2FyZHNcbiAgICAgIHZhbHVlQXJyYXlzW2NhcmQudmFsdWVdLnB1c2goY2FyZClcblxuICAgIGhhbmQgPSBbXVxuICAgIGZvciB2YWx1ZUFycmF5LCB2YWx1ZSBpbiB2YWx1ZUFycmF5c1xuICAgICAgaWYgKHZhbHVlQXJyYXkubGVuZ3RoID4gMSkgYW5kIChtYXRjaDJzIG9yICh2YWx1ZSA8IDEyKSlcbiAgICAgICAga2V5ID0gXCJraW5kI3t2YWx1ZUFycmF5Lmxlbmd0aH1cIlxuICAgICAgICBwbGF5c1trZXldID89IFtdXG4gICAgICAgIHBsYXlzW2tleV0ucHVzaCB2YWx1ZUFycmF5Lm1hcCAodikgLT4gdi5yYXdcbiAgICAgIGVsc2VcbiAgICAgICAgZm9yIHYgaW4gdmFsdWVBcnJheVxuICAgICAgICAgIGhhbmQucHVzaCB2LnJhd1xuXG4gICAgcmV0dXJuIGhhbmRcblxuICBhaUZpbmRSdW5zOiAoaGFuZCwgZWFjaFNpemUsIHNpemUpIC0+XG4gICAgcnVucyA9IFtdXG5cbiAgICBjYXJkcyA9IGhhbmQubWFwIChyYXcpIC0+IG5ldyBDYXJkKHJhdylcbiAgICBjYXJkcyA9IGNhcmRzLnNvcnQgKGEsIGIpIC0+IHJldHVybiBhLnJhdyAtIGIucmF3XG4gICAgdmFsdWVBcnJheXMgPSBbXVxuICAgIGZvciBpIGluIFswLi4uMTNdXG4gICAgICB2YWx1ZUFycmF5cy5wdXNoIFtdXG4gICAgZm9yIGNhcmQgaW4gY2FyZHNcbiAgICAgIHZhbHVlQXJyYXlzW2NhcmQudmFsdWVdLnB1c2goY2FyZClcblxuICAgIGxhc3RTdGFydGluZ1ZhbHVlID0gMTIgLSBzaXplXG4gICAgZm9yIHN0YXJ0aW5nVmFsdWUgaW4gWzAuLi5sYXN0U3RhcnRpbmdWYWx1ZV1cbiAgICAgIHJ1bkZvdW5kID0gdHJ1ZVxuICAgICAgZm9yIG9mZnNldCBpbiBbMC4uLnNpemVdXG4gICAgICAgIGlmIHZhbHVlQXJyYXlzW3N0YXJ0aW5nVmFsdWUrb2Zmc2V0XS5sZW5ndGggPCBlYWNoU2l6ZVxuICAgICAgICAgIHJ1bkZvdW5kID0gZmFsc2VcbiAgICAgICAgICBicmVha1xuICAgICAgaWYgcnVuRm91bmRcbiAgICAgICAgcnVuID0gW11cbiAgICAgICAgZm9yIG9mZnNldCBpbiBbMC4uLnNpemVdXG4gICAgICAgICAgZm9yIGVhY2ggaW4gWzAuLi5lYWNoU2l6ZV1cbiAgICAgICAgICAgIHJ1bi5wdXNoKHZhbHVlQXJyYXlzW3N0YXJ0aW5nVmFsdWUrb2Zmc2V0XS5wb3AoKS5yYXcpXG4gICAgICAgIHJ1bnMucHVzaCBydW5cblxuICAgIGxlZnRvdmVycyA9IFtdXG4gICAgZm9yIHZhbHVlQXJyYXkgaW4gdmFsdWVBcnJheXNcbiAgICAgIGZvciBjYXJkIGluIHZhbHVlQXJyYXlcbiAgICAgICAgbGVmdG92ZXJzLnB1c2ggY2FyZC5yYXdcblxuICAgIHJldHVybiBbcnVucywgbGVmdG92ZXJzXVxuXG4gIGFpQ2FsY1J1bnM6IChoYW5kLCBwbGF5cywgc21hbGxSdW5zLCBzaW5nbGVTaXplID0gbnVsbCkgLT5cbiAgICBpZiBzaW5nbGVTaXplICE9IG51bGxcbiAgICAgICAgc3RhcnRTaXplID0gc2luZ2xlU2l6ZVxuICAgICAgICBlbmRTaXplID0gc2luZ2xlU2l6ZVxuICAgICAgICBieUFtb3VudCA9IDFcbiAgICBlbHNlXG4gICAgICBpZiBzbWFsbFJ1bnNcbiAgICAgICAgc3RhcnRTaXplID0gM1xuICAgICAgICBlbmRTaXplID0gMTJcbiAgICAgICAgYnlBbW91bnQgPSAxXG4gICAgICBlbHNlXG4gICAgICAgIHN0YXJ0U2l6ZSA9IDEyXG4gICAgICAgIGVuZFNpemUgPSAzXG4gICAgICAgIGJ5QW1vdW50ID0gLTFcbiAgICBmb3IgcnVuU2l6ZSBpbiBbc3RhcnRTaXplLi5lbmRTaXplXSBieSBieUFtb3VudFxuICAgICAgW3J1bnMsIGxlZnRvdmVyc10gPSBAYWlGaW5kUnVucyhoYW5kLCAxLCBydW5TaXplKVxuICAgICAgaWYgcnVucy5sZW5ndGggPiAwXG4gICAgICAgIGtleSA9IFwicnVuI3tydW5TaXplfVwiXG4gICAgICAgIHBsYXlzW2tleV0gPSBydW5zXG4gICAgICBoYW5kID0gbGVmdG92ZXJzXG5cbiAgICByZXR1cm4gaGFuZFxuXG4gIGFpQ2FsY1JvcHM6IChoYW5kLCBwbGF5cywgc2luZ2xlU2l6ZSA9IG51bGwpIC0+XG4gICAgaWYgc2luZ2xlU2l6ZSA9PSBudWxsXG4gICAgICBzdGFydFNpemUgPSAzXG4gICAgICBlbmRTaXplID0gNlxuICAgIGVsc2VcbiAgICAgIHN0YXJ0U2l6ZSA9IHNpbmdsZVNpemVcbiAgICAgIGVuZFNpemUgPSBzaW5nbGVTaXplXG4gICAgZm9yIHJ1blNpemUgaW4gW3N0YXJ0U2l6ZS4uZW5kU2l6ZV1cbiAgICAgIFtyb3BzLCBsZWZ0b3ZlcnNdID0gQGFpRmluZFJ1bnMoaGFuZCwgMiwgcnVuU2l6ZSlcbiAgICAgIGlmIHJvcHMubGVuZ3RoID4gMFxuICAgICAgICBrZXkgPSBcInJvcCN7cnVuU2l6ZX1cIlxuICAgICAgICBwbGF5c1trZXldID0gcm9wc1xuICAgICAgaGFuZCA9IGxlZnRvdmVyc1xuXG4gICAgcmV0dXJuIGhhbmRcblxuICBhaUNhbGNQbGF5czogKGhhbmQsIHN0cmF0ZWd5ID0ge30pIC0+XG4gICAgcGxheXMgPSB7fVxuXG4gICAgIyBXZSBhbHdheXMgd2FudCB0byB1c2Ugcm9wcyBpZiB3ZSBoYXZlIG9uZVxuICAgIGlmIHN0cmF0ZWd5LnNlZXNSb3BzXG4gICAgICBoYW5kID0gQGFpQ2FsY1JvcHMoaGFuZCwgcGxheXMpXG5cbiAgICBpZiBzdHJhdGVneS5wcmVmZXJzUnVuc1xuICAgICAgaGFuZCA9IEBhaUNhbGNSdW5zKGhhbmQsIHBsYXlzLCBzdHJhdGVneS5zbWFsbFJ1bnMpXG4gICAgICBoYW5kID0gQGFsQ2FsY0tpbmRzKGhhbmQsIHBsYXlzLCBzdHJhdGVneS5tYXRjaDJzKVxuICAgIGVsc2VcbiAgICAgIGhhbmQgPSBAYWxDYWxjS2luZHMoaGFuZCwgcGxheXMsIHN0cmF0ZWd5Lm1hdGNoMnMpXG4gICAgICBoYW5kID0gQGFpQ2FsY1J1bnMoaGFuZCwgcGxheXMsIHN0cmF0ZWd5LnNtYWxsUnVucylcblxuICAgIGtpbmQxID0gaGFuZC5tYXAgKHYpIC0+IFt2XVxuICAgIGlmIGtpbmQxLmxlbmd0aCA+IDBcbiAgICAgIHBsYXlzLmtpbmQxID0ga2luZDFcbiAgICByZXR1cm4gcGxheXNcblxuICBudW1iZXJPZlNpbmdsZXM6IChwbGF5cykgLT5cbiAgICBpZiBub3QgcGxheXMua2luZDE/XG4gICAgICByZXR1cm4gMFxuICAgIG5vblR3b1NpbmdsZXMgPSAwXG4gICAgZm9yIHJhdyBpbiBwbGF5cy5raW5kMVxuICAgICAgaWYgcmF3IDwgNDhcbiAgICAgICAgbm9uVHdvU2luZ2xlcyArPSAxXG4gICAgcmV0dXJuIG5vblR3b1NpbmdsZXNcblxuICBicmVha2VyUGxheXM6IChoYW5kKSAtPlxuICAgIHJldHVybiBAYWlDYWxjUGxheXMoaGFuZCwgeyBzZWVzUm9wczogdHJ1ZSwgcHJlZmVyc1J1bnM6IGZhbHNlIH0pXG5cbiAgaXNCcmVha2VyVHlwZTogKHBsYXlUeXBlKSAtPlxuICAgIGlmIHBsYXlUeXBlLm1hdGNoKC9ecm9wLykgb3IgcGxheVR5cGUgPT0gJ2tpbmQ0J1xuICAgICAgcmV0dXJuIHRydWVcbiAgICByZXR1cm4gZmFsc2VcblxuICBjYW5CZUJyb2tlbjogKHBsYXkpIC0+XG4gICAgaWYgcGxheS50eXBlICE9ICdraW5kMSdcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIGNhcmQgPSBuZXcgQ2FyZChwbGF5LmhpZ2gpXG4gICAgcmV0dXJuIChjYXJkLnZhbHVlID09IDEyKVxuXG4gIGhhc0JyZWFrZXI6IChoYW5kKSAtPlxuICAgIHBsYXlzID0gQGJyZWFrZXJQbGF5cyhoYW5kKVxuICAgIGZvciBwbGF5VHlwZSwgcGxheWxpc3Qgb2YgcGxheXNcbiAgICAgIGlmIEBpc0JyZWFrZXJUeXBlKHBsYXlUeXBlKVxuICAgICAgICBpZiBwbGF5bGlzdC5sZW5ndGggPiAwXG4gICAgICAgICAgcmV0dXJuIHRydWVcbiAgICByZXR1cm4gZmFsc2VcblxuICBpc1J1blR5cGU6IChwbGF5VHlwZSkgLT5cbiAgICBpZiBwbGF5VHlwZS5tYXRjaCgvXnJ1bi8pXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIHJldHVybiBmYWxzZVxuXG4gIGlzU3VpdGVkOiAoaGFuZCkgLT5cbiAgICBpZiBoYW5kLmxlbmd0aCA8IDFcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIGNhcmRzID0gaGFuZC5tYXAgKHJhdykgLT4gbmV3IENhcmQocmF3KVxuICAgIHN1aXQgPSBjYXJkc1swXS5zdWl0XG4gICAgZm9yIGNhcmQgaW4gY2FyZHNcbiAgICAgIGlmIGNhcmQuc3VpdCAhPSBzdWl0XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIHJldHVybiB0cnVlXG5cbiAgaXNCaWdSdW46IChwbGF5LCBhdExlYXN0KSAtPlxuICAgIGlmIG1hdGNoZXMgPSBwbGF5LnR5cGUubWF0Y2goL15ydW4oXFxkKykvKVxuICAgICAgbGVuID0gcGFyc2VJbnQobWF0Y2hlc1sxXSlcbiAgICAgIGlmIGxlbiA+PSBhdExlYXN0XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgYWlDYWxjQmVzdFBsYXlzOiAoaGFuZCkgLT5cbiAgICBiZXN0UGxheXMgPSBudWxsXG4gICAgZm9yIGJpdHMgaW4gWzAuLi4xNl1cbiAgICAgIHN0cmF0ZWd5ID1cbiAgICAgICAgc21hbGxSdW5zOiAoYml0cyAmIDEpID09IDFcbiAgICAgICAgcHJlZmVyc1J1bnM6IChiaXRzICYgMikgPT0gMlxuICAgICAgICBtYXRjaDJzOiAoYml0cyAmIDQpID09IDRcbiAgICAgICAgc2Vlc1JvcHM6IChiaXRzICYgOCkgPT0gOFxuICAgICAgcGxheXMgPSBAYWlDYWxjUGxheXMoaGFuZCwgc3RyYXRlZ3kpXG4gICAgICBpZiBiZXN0UGxheXMgPT0gbnVsbFxuICAgICAgICBiZXN0UGxheXMgPSBwbGF5c1xuICAgICAgZWxzZVxuICAgICAgICBucCA9IEBudW1iZXJPZlNpbmdsZXMocGxheXMpXG4gICAgICAgIG5icCA9IEBudW1iZXJPZlNpbmdsZXMoYmVzdFBsYXlzKVxuICAgICAgICBpZiBucCA8IG5icFxuICAgICAgICAgIGJlc3RQbGF5cyA9IHBsYXlzXG4gICAgICAgIGVsc2UgaWYgbnAgPT0gbmJwXG4gICAgICAgICAgIyBmbGlwIGEgY29pbiFcbiAgICAgICAgICBpZiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKSA9PSAwXG4gICAgICAgICAgICBiZXN0UGxheXMgPSBwbGF5c1xuICAgIHJldHVybiBiZXN0UGxheXNcblxuICBwcmV0dHlQbGF5czogKHBsYXlzLCBleHRyYVByZXR0eSA9IGZhbHNlKSAtPlxuICAgIHByZXR0eSA9IHt9XG4gICAgZm9yIHR5cGUsIGFyciBvZiBwbGF5c1xuICAgICAgcHJldHR5W3R5cGVdID0gW11cbiAgICAgIGZvciBwbGF5IGluIGFyclxuICAgICAgICBuYW1lcyA9IFtdXG4gICAgICAgIGZvciByYXcgaW4gcGxheVxuICAgICAgICAgIGNhcmQgPSBuZXcgQ2FyZChyYXcpXG4gICAgICAgICAgbmFtZXMucHVzaChjYXJkLm5hbWUpXG4gICAgICAgIHByZXR0eVt0eXBlXS5wdXNoKG5hbWVzKVxuICAgIGlmIGV4dHJhUHJldHR5XG4gICAgICBzID0gXCJcIlxuICAgICAgZm9yIHR5cGVOYW1lLCB0aHJvd3Mgb2YgcHJldHR5XG4gICAgICAgIHMgKz0gXCIgICAgICAqICN7cGxheVR5cGVUb1N0cmluZyh0eXBlTmFtZSl9OlxcblwiXG4gICAgICAgIGlmIHR5cGVOYW1lID09ICdraW5kMSdcbiAgICAgICAgICBzICs9IFwiICAgICAgICAqICN7dGhyb3dzLm1hcCgodikgLT4gdlswXSkuam9pbignLCcpfVxcblwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBmb3IgdCBpbiB0aHJvd3NcbiAgICAgICAgICAgIHMgKz0gXCIgICAgICAgICogI3t0LmpvaW4oJywnKX1cXG5cIlxuICAgICAgcmV0dXJuIHNcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocHJldHR5KVxuXG4gIGhpZ2hlc3RDYXJkOiAocGxheSkgLT5cbiAgICBoaWdoZXN0ID0gMFxuICAgIGZvciBwIGluIHBsYXlcbiAgICAgIGlmIGhpZ2hlc3QgPCBwXG4gICAgICAgIGhpZ2hlc3QgPSBwXG4gICAgcmV0dXJuIGhpZ2hlc3RcblxuICBmaW5kUGxheVdpdGgzUzogKHBsYXlzKSAtPlxuICAgIGZvciBwbGF5VHlwZSwgcGxheWxpc3Qgb2YgcGxheXNcbiAgICAgIGZvciBwbGF5IGluIHBsYXlsaXN0XG4gICAgICAgIGlmIEBoYW5kSGFzM1MocGxheSlcbiAgICAgICAgICByZXR1cm4gcGxheVxuXG4gICAgY29uc29sZS5sb2cgXCJmaW5kUGxheVdpdGgzUzogc29tZXRoaW5nIGltcG9zc2libGUgaXMgaGFwcGVuaW5nXCJcbiAgICByZXR1cm4gW11cblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQUkgQnJhaW5zXG5cbiAgIyBCcmFpbnMgbXVzdCBoYXZlOlxuICAjICogaWQ6IGludGVybmFsIGlkZW50aWZpZXIgZm9yIHRoZSBicmFpblxuICAjICogbmFtZTogcHJldHR5IG5hbWVcbiAgIyAqIHBsYXkoY3VycmVudFBsYXllcikgYXR0ZW1wdHMgdG8gcGxheSBhIGNhcmQgYnkgY2FsbGluZyBhaVBsYXkoKS4gU2hvdWxkIHJldHVybiB0cnVlIGlmIGl0IHN1Y2Nlc3NmdWxseSBwbGF5ZWQgYSBjYXJkIChhaVBsYXkoKSByZXR1cm5lZCB0cnVlKVxuICBicmFpbnM6XG5cbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICMgTm9ybWFsOiBJbnRlbmRlZCB0byBiZSB1c2VkIGJ5IG1vc3QgY2hhcmFjdGVycy5cbiAgICAjICAgICAgICAgTm90IHRvbyBkdW1iLCBub3QgdG9vIHNtYXJ0LlxuICAgIG5vcm1hbDpcbiAgICAgIGlkOiAgIFwibm9ybWFsXCJcbiAgICAgIG5hbWU6IFwiTm9ybWFsXCJcblxuICAgICAgIyBub3JtYWxcbiAgICAgIHBsYXk6IChjdXJyZW50UGxheWVyLCBjdXJyZW50UGxheSwgZXZlcnlvbmVQYXNzZWQpIC0+XG4gICAgICAgIGlmIGN1cnJlbnRQbGF5ZXIucGFzc1xuICAgICAgICAgIGlmIEBjYW5CZUJyb2tlbihjdXJyZW50UGxheSkgYW5kIEBoYXNCcmVha2VyKGN1cnJlbnRQbGF5ZXIuaGFuZClcbiAgICAgICAgICAgIGJyZWFrZXJQbGF5cyA9IEBicmVha2VyUGxheXMoY3VycmVudFBsYXllci5oYW5kKVxuICAgICAgICAgICAgZm9yIHBsYXlUeXBlLCBwbGF5bGlzdCBvZiBicmVha2VyUGxheXNcbiAgICAgICAgICAgICAgaWYgKHBsYXlUeXBlLm1hdGNoKC9ecm9wLykgb3IgKHBsYXlUeXBlID09ICdraW5kNCcpKSBhbmQgKHBsYXlsaXN0Lmxlbmd0aCA+IDApXG4gICAgICAgICAgICAgICAgQGFpTG9nKFwiYnJlYWtpbmcgMlwiKVxuICAgICAgICAgICAgICAgIGlmIEBhaVBsYXkoY3VycmVudFBsYXllciwgcGxheWxpc3RbMF0pID09IE9LXG4gICAgICAgICAgICAgICAgICByZXR1cm4gT0tcblxuICAgICAgICAgIEBhaUxvZyhcImFscmVhZHkgcGFzc2VkLCBnb2luZyB0byBrZWVwIHBhc3NpbmdcIilcbiAgICAgICAgICByZXR1cm4gQGFpUGFzcyhjdXJyZW50UGxheWVyKVxuXG4gICAgICAgIHBsYXlzID0gQGFpQ2FsY0Jlc3RQbGF5cyhjdXJyZW50UGxheWVyLmhhbmQpXG4gICAgICAgIEBhaUxvZyhcImJlc3QgcGxheXM6ICN7QHByZXR0eVBsYXlzKHBsYXlzKX1cIilcblxuICAgICAgICBpZiBAcGlsZS5sZW5ndGggPT0gMFxuICAgICAgICAgIHBsYXkgPSBAZmluZFBsYXlXaXRoM1MocGxheXMpXG4gICAgICAgICAgQGFpTG9nKFwiVGhyb3dpbmcgbXkgcGxheSB3aXRoIHRoZSAzUyBpbiBpdFwiKVxuICAgICAgICAgIGlmIEBhaVBsYXkoY3VycmVudFBsYXllciwgcGxheSkgPT0gT0tcbiAgICAgICAgICAgIHJldHVybiBPS1xuXG4gICAgICAgIGlmIGN1cnJlbnRQbGF5IGFuZCBub3QgZXZlcnlvbmVQYXNzZWRcbiAgICAgICAgICBpZiBwbGF5c1tjdXJyZW50UGxheS50eXBlXT8gYW5kIChwbGF5c1tjdXJyZW50UGxheS50eXBlXS5sZW5ndGggPiAwKVxuICAgICAgICAgICAgZm9yIHBsYXkgaW4gcGxheXNbY3VycmVudFBsYXkudHlwZV1cbiAgICAgICAgICAgICAgaWYgQGhpZ2hlc3RDYXJkKHBsYXkpID4gY3VycmVudFBsYXkuaGlnaFxuICAgICAgICAgICAgICAgIGlmIEBhaVBsYXkoY3VycmVudFBsYXllciwgcGxheSkgPT0gT0tcbiAgICAgICAgICAgICAgICAgIHJldHVybiBPS1xuICAgICAgICAgICAgQGFpTG9nKFwiSSBndWVzcyBJIGNhbid0IGFjdHVhbGx5IGJlYXQgdGhpcywgcGFzc2luZ1wiKVxuICAgICAgICAgICAgcmV0dXJuIEBhaVBhc3MoY3VycmVudFBsYXllcilcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBAYWlMb2coXCJJIGRvbid0IGhhdmUgdGhhdCBwbGF5LCBwYXNzaW5nXCIpXG4gICAgICAgICAgICByZXR1cm4gQGFpUGFzcyhjdXJyZW50UGxheWVyKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgIyBubyBjdXJyZW50IHBsYXksIHRocm93IHRoZSBmaXJzdCBjYXJkXG4gICAgICAgICAgQGFpTG9nKFwiSSBjYW4gZG8gYW55dGhpbmcsIHRocm93aW5nIGEgcmFuZG9tIHBsYXlcIilcbiAgICAgICAgICBwbGF5VHlwZXMgPSBPYmplY3Qua2V5cyhwbGF5cylcbiAgICAgICAgICBwbGF5VHlwZUluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcGxheVR5cGVzLmxlbmd0aClcbiAgICAgICAgICBpZiBAYWlQbGF5KGN1cnJlbnRQbGF5ZXIsIHBsYXlzW3BsYXlUeXBlc1twbGF5VHlwZUluZGV4XV1bMF0pID09IE9LXG4gICAgICAgICAgICByZXR1cm4gT0tcblxuICAgICAgICAjIGZpbmQgdGhlIGZpcnN0IGNhcmQgdGhhdCBiZWF0cyB0aGUgY3VycmVudFBsYXkncyBoaWdoXG4gICAgICAgIGZvciByYXdDYXJkIGluIGN1cnJlbnRQbGF5ZXIuaGFuZFxuICAgICAgICAgIGlmIHJhd0NhcmQgPiBjdXJyZW50UGxheS5oaWdoXG4gICAgICAgICAgICBAYWlMb2coXCJmb3VuZCBzbWFsbGVzdCBzaW5nbGUgKCN7cmF3Q2FyZH0pLCBwbGF5aW5nXCIpXG4gICAgICAgICAgICBpZiBAYWlQbGF5KGN1cnJlbnRQbGF5ZXIsIFtyYXdDYXJkXSkgPT0gT0tcbiAgICAgICAgICAgICAgcmV0dXJuIE9LXG4gICAgICAgICAgICBicmVha1xuXG4gICAgICAgIEBhaUxvZyhcIm5vdGhpbmcgZWxzZSB0byBkbywgcGFzc2luZ1wiKVxuICAgICAgICByZXR1cm4gQGFpUGFzcyhjdXJyZW50UGxheWVyKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBEZWJ1ZyBjb2RlXG5cbmRlYnVnID0gLT5cbiAgdGhpciA9IG5ldyBUaGlydGVlbigpXG4gIGZ1bGx5UGxheWVkID0gMFxuICB0b3RhbEF0dGVtcHRzID0gMTAwXG5cbiAgZm9yIGF0dGVtcHQgaW4gWzAuLi50b3RhbEF0dGVtcHRzXVxuICAgIGRlY2sgPSBuZXcgU2h1ZmZsZWREZWNrKClcbiAgICBoYW5kID0gW11cbiAgICBmb3IgaiBpbiBbMC4uLjEzXVxuICAgICAgcmF3ID0gZGVjay5jYXJkcy5zaGlmdCgpXG4gICAgICBoYW5kLnB1c2gocmF3KVxuICAgICMgaGFuZCA9IFs1MSw1MCw0OSw0OCw0Nyw0Niw0NSw0NCw0Myw0Miw0MSw0MCwzOV1cbiAgICAjIGhhbmQgPSBbMCwxLDIsMyw0LDUsNiw3LDgsOSwxMCwxMSwxMl1cbiAgICBoYW5kLnNvcnQgKGEsYikgLT4gcmV0dXJuIGEgLSBiXG5cbiAgICBjb25zb2xlLmxvZyhcIi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVwiKVxuICAgIGNvbnNvbGUubG9nKFwiSGFuZCAje2F0dGVtcHQrMX06ICN7Y2FyZHNUb1N0cmluZyhoYW5kKX1cIilcbiAgICBjb25zb2xlLmxvZyhcIlwiKVxuXG4gICAgZm91bmRGdWxseVBsYXllZCA9IGZhbHNlXG4gICAgZm9yIGJpdHMgaW4gWzAuLi4xNl1cbiAgICAgIHN0cmF0ZWd5ID1cbiAgICAgICAgc21hbGxSdW5zOiAoYml0cyAmIDEpID09IDFcbiAgICAgICAgcHJlZmVyc1J1bnM6IChiaXRzICYgMikgPT0gMlxuICAgICAgICBtYXRjaDJzOiAoYml0cyAmIDQpID09IDRcbiAgICAgICAgc2Vlc1JvcHM6IChiaXRzICYgOCkgPT0gOFxuICAgICAgcGxheXMgPSB0aGlyLmFpQ2FsY1BsYXlzKGhhbmQsIHN0cmF0ZWd5KVxuXG4gICAgICBjb25zb2xlLmxvZyhcIiAgICogU3RyYXRlZ3k6ICN7SlNPTi5zdHJpbmdpZnkoc3RyYXRlZ3kpfVwiKVxuICAgICAgY29uc29sZS5sb2codGhpci5wcmV0dHlQbGF5cyhwbGF5cywgdHJ1ZSkpXG5cbiAgICAgIGlmIG5vdCBwbGF5cy5raW5kMVxuICAgICAgICBmb3VuZEZ1bGx5UGxheWVkID0gdHJ1ZVxuXG4gICAgaWYgZm91bmRGdWxseVBsYXllZFxuICAgICAgZnVsbHlQbGF5ZWQgKz0gMVxuXG4gIGNvbnNvbGUubG9nIFwiZnVsbHlQbGF5ZWQ6ICN7ZnVsbHlQbGF5ZWR9IC8gI3t0b3RhbEF0dGVtcHRzfVwiXG5cbiMgZGVidWcoKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBFeHBvcnRzXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgQ2FyZDogQ2FyZFxuICBUaGlydGVlbjogVGhpcnRlZW5cbiAgT0s6IE9LXG4gIGFpQ2hhcmFjdGVyczogYWlDaGFyYWN0ZXJzXG4gIGFjaGlldmVtZW50c0xpc3Q6IGFjaGlldmVtZW50c0xpc3RcbiAgYWNoaWV2ZW1lbnRzTWFwOiBhY2hpZXZlbWVudHNNYXBcbiIsIm1vZHVsZS5leHBvcnRzID1cbiAgZGFya2ZvcmVzdDpcbiAgICBoZWlnaHQ6IDcyXG4gICAgZ2x5cGhzOlxuICAgICAgJzk3JyA6IHsgeDogICA4LCB5OiAgIDgsIHdpZHRoOiAgMzQsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnOTgnIDogeyB4OiAgIDgsIHk6ICA1OCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICc5OScgOiB7IHg6ICA1MCwgeTogICA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzEwMCc6IHsgeDogICA4LCB5OiAxMTgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnMTAxJzogeyB4OiAgIDgsIHk6IDE3OCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICcxMDInOiB7IHg6ICAgOCwgeTogMjI4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzMgfVxuICAgICAgJzEwMyc6IHsgeDogICA4LCB5OiAyNzgsIHdpZHRoOiAgMzYsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNSB9XG4gICAgICAnMTA0JzogeyB4OiAgIDgsIHk6IDMyOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICcxMDUnOiB7IHg6ICAgOCwgeTogMzc4LCB3aWR0aDogIDEyLCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMTEgfVxuICAgICAgJzEwNic6IHsgeDogICA4LCB5OiA0MjgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQxLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnMTA3JzogeyB4OiAgMjgsIHk6IDM3OCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDEsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICcxMDgnOiB7IHg6ICA1MSwgeTogMzI4LCB3aWR0aDogIDM0LCBoZWlnaHQ6ICA0MSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzMgfVxuICAgICAgJzEwOSc6IHsgeDogIDUxLCB5OiA0MjcsIHdpZHRoOiAgMzgsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNyB9XG4gICAgICAnMTEwJzogeyB4OiAgNzEsIHk6IDM3Nywgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICcxMTEnOiB7IHg6ICA5NywgeTogNDI3LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzExMic6IHsgeDogIDUxLCB5OiAgNTgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnMTEzJzogeyB4OiAgNTEsIHk6IDEwOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDUsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICcxMTQnOiB7IHg6ICA5MywgeTogICA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzUgfVxuICAgICAgJzExNSc6IHsgeDogIDUxLCB5OiAxNjEsIHdpZHRoOiAgMzUsIGhlaWdodDogIDQyLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNSB9XG4gICAgICAnMTE2JzogeyB4OiAgNTEsIHk6IDIxMSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDMzIH1cbiAgICAgICcxMTcnOiB7IHg6ICA1MiwgeTogMjYxLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA0MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzExOCc6IHsgeDogIDkzLCB5OiAzMTEsIHdpZHRoOiAgMzQsIGhlaWdodDogIDQxLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzMiB9XG4gICAgICAnMTE5JzogeyB4OiAxMTQsIHk6IDM2MCwgd2lkdGg6ICAzOCwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM4IH1cbiAgICAgICcxMjAnOiB7IHg6IDE0MCwgeTogNDEwLCB3aWR0aDogIDM2LCBoZWlnaHQ6ICA0MSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMzEsIHhhZHZhbmNlOiAgMzcgfVxuICAgICAgJzEyMSc6IHsgeDogMTQwLCB5OiA0NTksIHdpZHRoOiAgMzUsIGhlaWdodDogIDQxLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAzMSwgeGFkdmFuY2U6ICAzNCB9XG4gICAgICAnMTIyJzogeyB4OiAxODMsIHk6IDQ1OSwgd2lkdGg6ICAzNiwgaGVpZ2h0OiAgNDIsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDMxLCB4YWR2YW5jZTogIDM1IH1cbiAgICAgICc2NScgOiB7IHg6ICA5NCwgeTogIDU4LCB3aWR0aDogIDM0LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxuICAgICAgJzY2JyA6IHsgeDogIDk0LCB5OiAxMTksIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNyB9XG4gICAgICAnNjcnIDogeyB4OiAgOTQsIHk6IDE4MCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cbiAgICAgICc2OCcgOiB7IHg6ICA5NSwgeTogMjQxLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzcgfVxuICAgICAgJzY5JyA6IHsgeDogMTM2LCB5OiAgIDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XG4gICAgICAnNzAnIDogeyB4OiAxMzcsIHk6ICA2OSwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICc3MScgOiB7IHg6IDE3OSwgeTogICA4LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxuICAgICAgJzcyJyA6IHsgeDogMTM3LCB5OiAxMzAsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XG4gICAgICAnNzMnIDogeyB4OiAxMzgsIHk6IDE5MSwgd2lkdGg6ICAxMiwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDEzIH1cbiAgICAgICc3NCcgOiB7IHg6IDEzOCwgeTogMjUyLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzYgfVxuICAgICAgJzc1JyA6IHsgeDogMTU4LCB5OiAxOTEsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XG4gICAgICAnNzYnIDogeyB4OiAxNjAsIHk6IDMxMywgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM0IH1cbiAgICAgICc3NycgOiB7IHg6IDE4MSwgeTogMjUxLCB3aWR0aDogIDM4LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzkgfVxuICAgICAgJzc4JyA6IHsgeDogMTg0LCB5OiAzNzQsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNSB9XG4gICAgICAnNzknIDogeyB4OiAyMDMsIHk6IDMxMiwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM1IH1cbiAgICAgICc4MCcgOiB7IHg6IDE4MCwgeTogIDY5LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzgxJyA6IHsgeDogMjAxLCB5OiAxMzAsIHdpZHRoOiAgMzUsIGhlaWdodDogIDU2LCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNSB9XG4gICAgICAnODInIDogeyB4OiAyMjIsIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cbiAgICAgICc4MycgOiB7IHg6IDIyMywgeTogIDY5LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxuICAgICAgJzg0JyA6IHsgeDogMjY1LCB5OiAgIDgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzMyB9XG4gICAgICAnODUnIDogeyB4OiAyMjcsIHk6IDE5NCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM1IH1cbiAgICAgICc4NicgOiB7IHg6IDI0NCwgeTogMTMwLCB3aWR0aDogIDQxLCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMTksIHhhZHZhbmNlOiAgMzkgfVxuICAgICAgJzg3JyA6IHsgeDogMjY2LCB5OiAgNjksIHdpZHRoOiAgMzgsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNyB9XG4gICAgICAnODgnIDogeyB4OiAzMDgsIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMSwgeW9mZnNldDogIDE5LCB4YWR2YW5jZTogIDM1IH1cbiAgICAgICc4OScgOiB7IHg6IDIyNywgeTogMzczLCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMTksIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzkwJyA6IHsgeDogMjI3LCB5OiA0MzMsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNSB9XG4gICAgICAnMzMnIDogeyB4OiAyNDYsIHk6IDI1NSwgd2lkdGg6ICAxNCwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDExIH1cbiAgICAgICc1OScgOiB7IHg6IDE4MCwgeTogMTMwLCB3aWR0aDogIDEzLCBoZWlnaHQ6ICAzNywgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNTYsIHhhZHZhbmNlOiAgMTMgfVxuICAgICAgJzM3JyA6IHsgeDogIDk1LCB5OiAzMDIsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XG4gICAgICAnNTgnIDogeyB4OiAxNjAsIHk6IDM3NCwgd2lkdGg6ICAxMywgaGVpZ2h0OiAgMjMsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDUwLCB4YWR2YW5jZTogIDEzIH1cbiAgICAgICc2MycgOiB7IHg6IDI2OCwgeTogMjU1LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzMgfVxuICAgICAgJzQyJyA6IHsgeDogMTAzLCB5OiAzMDIsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XG4gICAgICAnNDAnIDogeyB4OiAyNzAsIHk6IDE5MCwgd2lkdGg6ICAyMywgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDIxIH1cbiAgICAgICc0MScgOiB7IHg6IDI5MywgeTogMTMwLCB3aWR0aDogIDIzLCBoZWlnaHQ6ICA1MiwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMjEgfVxuICAgICAgJzk1JyA6IHsgeDogMTExLCB5OiAzMDIsIHdpZHRoOiAgIDAsIGhlaWdodDogICAwLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICA3MCwgeGFkdmFuY2U6ICAyMiB9XG4gICAgICAnNDMnIDogeyB4OiAyNDYsIHk6IDMxNiwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgMzQsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDM5LCB4YWR2YW5jZTogIDMyIH1cbiAgICAgICc0NScgOiB7IHg6IDE4NCwgeTogNDM1LCB3aWR0aDogIDI2LCBoZWlnaHQ6ICAxMSwgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgNDQsIHhhZHZhbmNlOiAgMjUgfVxuICAgICAgJzYxJyA6IHsgeDogMzEyLCB5OiAgNjgsIHdpZHRoOiAgMzUsIGhlaWdodDogIDMwLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICA0MiwgeGFkdmFuY2U6ICAzMyB9XG4gICAgICAnNDYnIDogeyB4OiAxMzUsIHk6IDMxMywgd2lkdGg6ICAxNCwgaGVpZ2h0OiAgMTEsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDYxLCB4YWR2YW5jZTogIDE0IH1cbiAgICAgICc0NCcgOiB7IHg6IDIyNywgeTogMjU1LCB3aWR0aDogIDEwLCBoZWlnaHQ6ICAyMSwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNjgsIHhhZHZhbmNlOiAgMTEgfVxuICAgICAgJzQ3JyA6IHsgeDogMzUxLCB5OiAgIDgsIHdpZHRoOiAgMjgsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAxOSwgeGFkdmFuY2U6ICAyNiB9XG4gICAgICAnMTI0JzogeyB4OiAxMTksIHk6IDMwMiwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cbiAgICAgICczNCcgOiB7IHg6IDEyNywgeTogMzAyLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxuICAgICAgJzM5JyA6IHsgeDogMjAxLCB5OiAxOTQsIHdpZHRoOiAgMTgsIGhlaWdodDogIDE5LCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAgMCwgeGFkdmFuY2U6ICAyMSB9XG4gICAgICAnNjQnIDogeyB4OiAyMTgsIHk6IDQzNSwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cbiAgICAgICczNScgOiB7IHg6IDIxOCwgeTogNDQzLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxuICAgICAgJzM2JyA6IHsgeDogMzAxLCB5OiAxOTAsIHdpZHRoOiAgMzIsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAyMiwgeGFkdmFuY2U6ICAyOSB9XG4gICAgICAnOTQnIDogeyB4OiAyMTgsIHk6IDQ1MSwgd2lkdGg6ICAgMCwgaGVpZ2h0OiAgIDAsIHhvZmZzZXQ6ICAgMCwgeW9mZnNldDogIDcwLCB4YWR2YW5jZTogIDIyIH1cbiAgICAgICczOCcgOiB7IHg6IDI0NiwgeTogMzU4LCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgNzAsIHhhZHZhbmNlOiAgMjIgfVxuICAgICAgJzEyMyc6IHsgeDogMzI0LCB5OiAxMDYsIHdpZHRoOiAgMjcsIGhlaWdodDogIDUyLCB4b2Zmc2V0OiAgIDAsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAyNiB9XG4gICAgICAnMTI1JzogeyB4OiAyNzAsIHk6IDM1OCwgd2lkdGg6ICAyNywgaGVpZ2h0OiAgNTIsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDI3IH1cbiAgICAgICc5MScgOiB7IHg6IDI3MCwgeTogNDE4LCB3aWR0aDogIDIyLCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAwLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMjEgfVxuICAgICAgJzkzJyA6IHsgeDogMzAwLCB5OiA0MTgsIHdpZHRoOiAgMjIsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDEsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAyMCB9XG4gICAgICAnNDgnIDogeyB4OiAzMDUsIHk6IDMxNiwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cbiAgICAgICc0OScgOiB7IHg6IDMxMSwgeTogMjUxLCB3aWR0aDogIDM0LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAyLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxuICAgICAgJzUwJyA6IHsgeDogMzQxLCB5OiAxNjYsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNyB9XG4gICAgICAnNTEnIDogeyB4OiAzNTksIHk6ICA2OCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cbiAgICAgICc1MicgOiB7IHg6IDMzMCwgeTogMzc3LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzUgfVxuICAgICAgJzUzJyA6IHsgeDogMzQ4LCB5OiAzMTIsIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDMsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNyB9XG4gICAgICAnNTQnIDogeyB4OiAzMzAsIHk6IDQzOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMiwgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cbiAgICAgICc1NScgOiB7IHg6IDM1MywgeTogMjI3LCB3aWR0aDogIDM1LCBoZWlnaHQ6ICA1MywgeG9mZnNldDogICAxLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMzQgfVxuICAgICAgJzU2JyA6IHsgeDogMzg0LCB5OiAxMjksIHdpZHRoOiAgMzUsIGhlaWdodDogIDUzLCB4b2Zmc2V0OiAgIDIsIHlvZmZzZXQ6ICAyMCwgeGFkdmFuY2U6ICAzNiB9XG4gICAgICAnNTcnIDogeyB4OiA0MDIsIHk6ICAgOCwgd2lkdGg6ICAzNSwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIwLCB4YWR2YW5jZTogIDM2IH1cbiAgICAgICczMicgOiB7IHg6ICAgMCwgeTogICAwLCB3aWR0aDogICAwLCBoZWlnaHQ6ICAgMCwgeG9mZnNldDogICAzLCB5b2Zmc2V0OiAgMjAsIHhhZHZhbmNlOiAgMjIgfVxuXG4gICAgICAjIGNhcmQgZ2x5cGhzXG4gICAgICAnMjAwJzogeyB4OiAzOTYsIHk6IDM3OCwgd2lkdGg6ICA0MCwgaGVpZ2h0OiAgNDksIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIxLCB4YWR2YW5jZTogIDQzIH0gIyBTXG4gICAgICAnMjAxJzogeyB4OiA0NDcsIHk6IDMxMywgd2lkdGg6ICA0OSwgaGVpZ2h0OiAgNTAsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIxLCB4YWR2YW5jZTogIDUyIH0gIyBDXG4gICAgICAnMjAyJzogeyB4OiAzOTksIHk6IDMxMywgd2lkdGg6ICAzNiwgaGVpZ2h0OiAgNTMsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIxLCB4YWR2YW5jZTogIDM5IH0gIyBEXG4gICAgICAnMjAzJzogeyB4OiA0NTIsIHk6IDM4MSwgd2lkdGg6ICAzOSwgaGVpZ2h0OiAgNDMsIHhvZmZzZXQ6ICAgMywgeW9mZnNldDogIDIxLCB4YWR2YW5jZTogIDQyIH0gIyBIXG4iLCIjIFRoaXMgZmlsZSBwcm92aWRlcyB0aGUgcmVuZGVyaW5nIGVuZ2luZSBmb3IgdGhlIHdlYiB2ZXJzaW9uLiBOb25lIG9mIHRoaXMgY29kZSBpcyBpbmNsdWRlZCBpbiB0aGUgSmF2YSB2ZXJzaW9uLlxuXG5jb25zb2xlLmxvZyAnd2ViIHN0YXJ0dXAnXG5cbkdhbWUgPSByZXF1aXJlICcuL0dhbWUnXG5cbiMgdGFrZW4gZnJvbSBodHRwOiNzdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNTYyMzgzOC9yZ2ItdG8taGV4LWFuZC1oZXgtdG8tcmdiXG5jb21wb25lbnRUb0hleCA9IChjKSAtPlxuICBoZXggPSBNYXRoLmZsb29yKGMgKiAyNTUpLnRvU3RyaW5nKDE2KVxuICByZXR1cm4gaWYgaGV4Lmxlbmd0aCA9PSAxIHRoZW4gXCIwXCIgKyBoZXggZWxzZSBoZXhcbnJnYlRvSGV4ID0gKHIsIGcsIGIpIC0+XG4gIHJldHVybiBcIiNcIiArIGNvbXBvbmVudFRvSGV4KHIpICsgY29tcG9uZW50VG9IZXgoZykgKyBjb21wb25lbnRUb0hleChiKVxuXG5TQVZFX1RJTUVSX01TID0gMzAwMFxuXG5jbGFzcyBOYXRpdmVBcHBcbiAgY29uc3RydWN0b3I6IChAc2NyZWVuLCBAd2lkdGgsIEBoZWlnaHQpIC0+XG4gICAgQHRpbnRlZFRleHR1cmVDYWNoZSA9IFtdXG4gICAgQGxhc3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcbiAgICBAbGFzdEludGVyYWN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG4gICAgQGhlYXJkT25lVG91Y2ggPSBmYWxzZVxuICAgIEB0b3VjaE1vdXNlID0gbnVsbFxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdtb3VzZWRvd24nLCAgQG9uTW91c2VEb3duLmJpbmQodGhpcyksIGZhbHNlXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNlbW92ZScsICBAb25Nb3VzZU1vdmUuYmluZCh0aGlzKSwgZmFsc2VcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2V1cCcsICAgIEBvbk1vdXNlVXAuYmluZCh0aGlzKSwgZmFsc2VcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAndG91Y2hzdGFydCcsIEBvblRvdWNoU3RhcnQuYmluZCh0aGlzKSwgZmFsc2VcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAndG91Y2htb3ZlJywgIEBvblRvdWNoTW92ZS5iaW5kKHRoaXMpLCBmYWxzZVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICd0b3VjaGVuZCcsICAgQG9uVG91Y2hFbmQuYmluZCh0aGlzKSwgZmFsc2VcbiAgICBAY29udGV4dCA9IEBzY3JlZW4uZ2V0Q29udGV4dChcIjJkXCIpXG4gICAgQHRleHR1cmVzID0gW1xuICAgICAgIyBhbGwgY2FyZCBhcnRcbiAgICAgIFwiLi4vaW1hZ2VzL2NhcmRzLnBuZ1wiXG4gICAgICAjIGZvbnRzXG4gICAgICBcIi4uL2ltYWdlcy9kYXJrZm9yZXN0LnBuZ1wiXG4gICAgICAjIGNoYXJhY3RlcnMgLyBvdGhlclxuICAgICAgXCIuLi9pbWFnZXMvY2hhcnMucG5nXCJcbiAgICAgICMgaGVscFxuICAgICAgXCIuLi9pbWFnZXMvaG93dG9wbGF5MS5wbmdcIlxuICAgIF1cblxuICAgIEBnYW1lID0gbmV3IEdhbWUodGhpcywgQHdpZHRoLCBAaGVpZ2h0KVxuXG4gICAgaWYgdHlwZW9mIFN0b3JhZ2UgIT0gXCJ1bmRlZmluZWRcIlxuICAgICAgc3RhdGUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSBcInN0YXRlXCJcbiAgICAgIGlmIHN0YXRlXG4gICAgICAgICMgY29uc29sZS5sb2cgXCJsb2FkaW5nIHN0YXRlOiAje3N0YXRlfVwiXG4gICAgICAgIEBnYW1lLmxvYWQgc3RhdGVcblxuICAgIEBwZW5kaW5nSW1hZ2VzID0gMFxuICAgIGxvYWRlZFRleHR1cmVzID0gW11cbiAgICBmb3IgaW1hZ2VVcmwgaW4gQHRleHR1cmVzXG4gICAgICBAcGVuZGluZ0ltYWdlcysrXG4gICAgICBjb25zb2xlLmxvZyBcImxvYWRpbmcgaW1hZ2UgI3tAcGVuZGluZ0ltYWdlc306ICN7aW1hZ2VVcmx9XCJcbiAgICAgIGltZyA9IG5ldyBJbWFnZSgpXG4gICAgICBpbWcub25sb2FkID0gQG9uSW1hZ2VMb2FkZWQuYmluZCh0aGlzKVxuICAgICAgaW1nLnNyYyA9IGltYWdlVXJsXG4gICAgICBsb2FkZWRUZXh0dXJlcy5wdXNoIGltZ1xuICAgIEB0ZXh0dXJlcyA9IGxvYWRlZFRleHR1cmVzXG5cbiAgICBAc2F2ZVRpbWVyID0gU0FWRV9USU1FUl9NU1xuXG4gIG9uSW1hZ2VMb2FkZWQ6IChpbmZvKSAtPlxuICAgIEBwZW5kaW5nSW1hZ2VzLS1cbiAgICBpZiBAcGVuZGluZ0ltYWdlcyA9PSAwXG4gICAgICBjb25zb2xlLmxvZyAnQWxsIGltYWdlcyBsb2FkZWQuIEJlZ2lubmluZyByZW5kZXIgbG9vcC4nXG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPT4gQHVwZGF0ZSgpXG5cbiAgbG9nOiAocykgLT5cbiAgICBjb25zb2xlLmxvZyBcIk5hdGl2ZUFwcC5sb2coKTogI3tzfVwiXG5cbiAgdXBkYXRlU2F2ZTogKGR0KSAtPlxuICAgIHJldHVybiBpZiB0eXBlb2YgU3RvcmFnZSA9PSBcInVuZGVmaW5lZFwiXG4gICAgQHNhdmVUaW1lciAtPSBkdFxuICAgIGlmIEBzYXZlVGltZXIgPD0gMFxuICAgICAgQHNhdmVUaW1lciA9IFNBVkVfVElNRVJfTVNcbiAgICAgIHN0YXRlID0gQGdhbWUuc2F2ZSgpXG4gICAgICAjIGNvbnNvbGUubG9nIFwic2F2aW5nOiAje3N0YXRlfVwiXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSBcInN0YXRlXCIsIHN0YXRlXG5cbiAgZ2VuZXJhdGVUaW50SW1hZ2U6ICh0ZXh0dXJlSW5kZXgsIHJlZCwgZ3JlZW4sIGJsdWUpIC0+XG4gICAgaW1nID0gQHRleHR1cmVzW3RleHR1cmVJbmRleF1cbiAgICBidWZmID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCBcImNhbnZhc1wiXG4gICAgYnVmZi53aWR0aCAgPSBpbWcud2lkdGhcbiAgICBidWZmLmhlaWdodCA9IGltZy5oZWlnaHRcblxuICAgIGN0eCA9IGJ1ZmYuZ2V0Q29udGV4dCBcIjJkXCJcbiAgICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2NvcHknXG4gICAgY3R4LmRyYXdJbWFnZShpbWcsIDAsIDApXG4gICAgZmlsbENvbG9yID0gXCJyZ2IoI3tNYXRoLmZsb29yKHJlZCoyNTUpfSwgI3tNYXRoLmZsb29yKGdyZWVuKjI1NSl9LCAje01hdGguZmxvb3IoYmx1ZSoyNTUpfSlcIlxuICAgIGN0eC5maWxsU3R5bGUgPSBmaWxsQ29sb3JcbiAgICAjIGNvbnNvbGUubG9nIFwiZmlsbENvbG9yICN7ZmlsbENvbG9yfVwiXG4gICAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdtdWx0aXBseSdcbiAgICBjdHguZmlsbFJlY3QoMCwgMCwgYnVmZi53aWR0aCwgYnVmZi5oZWlnaHQpXG4gICAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdjb3B5J1xuICAgIGN0eC5nbG9iYWxBbHBoYSA9IDEuMFxuICAgIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnZGVzdGluYXRpb24taW4nXG4gICAgY3R4LmRyYXdJbWFnZShpbWcsIDAsIDApXG5cbiAgICBpbWdDb21wID0gbmV3IEltYWdlKClcbiAgICBpbWdDb21wLnNyYyA9IGJ1ZmYudG9EYXRhVVJMKClcbiAgICByZXR1cm4gaW1nQ29tcFxuXG4gIGRyYXdJbWFnZTogKHRleHR1cmVJbmRleCwgc3JjWCwgc3JjWSwgc3JjVywgc3JjSCwgZHN0WCwgZHN0WSwgZHN0VywgZHN0SCwgcm90LCBhbmNob3JYLCBhbmNob3JZLCByLCBnLCBiLCBhKSAtPlxuICAgIHRleHR1cmUgPSBAdGV4dHVyZXNbdGV4dHVyZUluZGV4XVxuICAgIGlmIChyICE9IDEpIG9yIChnICE9IDEpIG9yIChiICE9IDEpXG4gICAgICB0aW50ZWRUZXh0dXJlS2V5ID0gXCIje3RleHR1cmVJbmRleH0tI3tyfS0je2d9LSN7Yn1cIlxuICAgICAgdGludGVkVGV4dHVyZSA9IEB0aW50ZWRUZXh0dXJlQ2FjaGVbdGludGVkVGV4dHVyZUtleV1cbiAgICAgIGlmIG5vdCB0aW50ZWRUZXh0dXJlXG4gICAgICAgIHRpbnRlZFRleHR1cmUgPSBAZ2VuZXJhdGVUaW50SW1hZ2UgdGV4dHVyZUluZGV4LCByLCBnLCBiXG4gICAgICAgIEB0aW50ZWRUZXh0dXJlQ2FjaGVbdGludGVkVGV4dHVyZUtleV0gPSB0aW50ZWRUZXh0dXJlXG4gICAgICAgICMgY29uc29sZS5sb2cgXCJnZW5lcmF0ZWQgY2FjaGVkIHRleHR1cmUgI3t0aW50ZWRUZXh0dXJlS2V5fVwiXG4gICAgICB0ZXh0dXJlID0gdGludGVkVGV4dHVyZVxuXG4gICAgQGNvbnRleHQuc2F2ZSgpXG4gICAgQGNvbnRleHQudHJhbnNsYXRlIGRzdFgsIGRzdFlcbiAgICBAY29udGV4dC5yb3RhdGUgcm90ICMgKiAzLjE0MTU5MiAvIDE4MC4wXG4gICAgYW5jaG9yT2Zmc2V0WCA9IC0xICogYW5jaG9yWCAqIGRzdFdcbiAgICBhbmNob3JPZmZzZXRZID0gLTEgKiBhbmNob3JZICogZHN0SFxuICAgIEBjb250ZXh0LnRyYW5zbGF0ZSBhbmNob3JPZmZzZXRYLCBhbmNob3JPZmZzZXRZXG4gICAgQGNvbnRleHQuZ2xvYmFsQWxwaGEgPSBhXG4gICAgQGNvbnRleHQuZHJhd0ltYWdlKHRleHR1cmUsIHNyY1gsIHNyY1ksIHNyY1csIHNyY0gsIDAsIDAsIGRzdFcsIGRzdEgpXG4gICAgQGNvbnRleHQucmVzdG9yZSgpXG5cbiAgdXBkYXRlOiAtPlxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9PiBAdXBkYXRlKClcblxuICAgIG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG4gICAgZHQgPSBub3cgLSBAbGFzdFRpbWVcblxuICAgICMgZHQgPSBNYXRoLmZsb29yKGR0IC8gMTAwKVxuXG4gICAgdGltZVNpbmNlSW50ZXJhY3QgPSBub3cgLSBAbGFzdEludGVyYWN0VGltZVxuICAgIGlmIHRpbWVTaW5jZUludGVyYWN0ID4gMTUwMDBcbiAgICAgIGdvYWxGUFMgPSA1ICMgY2FsbSBkb3duLCBub2JvZHkgaXMgZG9pbmcgYW55dGhpbmcgZm9yIGEgd2hpbGVcbiAgICBlbHNlXG4gICAgICBnb2FsRlBTID0gbnVsbCAjIGFzIGZhc3QgYXMgcG9zc2libGVcbiAgICBpZiBAbGFzdEdvYWxGUFMgIT0gZ29hbEZQU1xuICAgICAgY29uc29sZS5sb2cgXCJzd2l0Y2hpbmcgdG8gI3tnb2FsRlBTfSBGUFNcIlxuICAgICAgQGxhc3RHb2FsRlBTID0gZ29hbEZQU1xuXG4gICAgaWYgZ29hbEZQUyAhPSBudWxsXG4gICAgICBmcHNJbnRlcnZhbCA9IDEwMDAgLyBnb2FsRlBTXG4gICAgICBpZiBkdCA8IGZwc0ludGVydmFsXG4gICAgICAgIHJldHVyblxuICAgIEBsYXN0VGltZSA9IG5vd1xuXG4gICAgQGNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIEB3aWR0aCwgQGhlaWdodClcbiAgICBAZ2FtZS51cGRhdGUoZHQpXG4gICAgcmVuZGVyQ29tbWFuZHMgPSBAZ2FtZS5yZW5kZXIoKVxuXG4gICAgaSA9IDBcbiAgICBuID0gcmVuZGVyQ29tbWFuZHMubGVuZ3RoXG4gICAgd2hpbGUgKGkgPCBuKVxuICAgICAgZHJhd0NhbGwgPSByZW5kZXJDb21tYW5kcy5zbGljZShpLCBpICs9IDE2KVxuICAgICAgQGRyYXdJbWFnZS5hcHBseSh0aGlzLCBkcmF3Q2FsbClcblxuICAgIEB1cGRhdGVTYXZlKGR0KVxuXG4gIG9uVG91Y2hTdGFydDogKGV2dCkgLT5cbiAgICBAbGFzdEludGVyYWN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG4gICAgQGhlYXJkT25lVG91Y2ggPSB0cnVlXG4gICAgdG91Y2hlcyA9IGV2dC5jaGFuZ2VkVG91Y2hlc1xuICAgIGZvciB0b3VjaCBpbiB0b3VjaGVzXG4gICAgICBpZiBAdG91Y2hNb3VzZSA9PSBudWxsXG4gICAgICAgIEB0b3VjaE1vdXNlID0gdG91Y2guaWRlbnRpZmllclxuICAgICAgaWYgQHRvdWNoTW91c2UgPT0gdG91Y2guaWRlbnRpZmllclxuICAgICAgICBAZ2FtZS50b3VjaERvd24odG91Y2guY2xpZW50WCwgdG91Y2guY2xpZW50WSlcblxuICBvblRvdWNoTW92ZTogKGV2dCkgLT5cbiAgICBAbGFzdEludGVyYWN0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG4gICAgdG91Y2hlcyA9IGV2dC5jaGFuZ2VkVG91Y2hlc1xuICAgIGZvciB0b3VjaCBpbiB0b3VjaGVzXG4gICAgICBpZiBAdG91Y2hNb3VzZSA9PSB0b3VjaC5pZGVudGlmaWVyXG4gICAgICAgIEBnYW1lLnRvdWNoTW92ZSh0b3VjaC5jbGllbnRYLCB0b3VjaC5jbGllbnRZKVxuXG4gIG9uVG91Y2hFbmQ6IChldnQpIC0+XG4gICAgQGxhc3RJbnRlcmFjdFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuICAgIHRvdWNoZXMgPSBldnQuY2hhbmdlZFRvdWNoZXNcbiAgICBmb3IgdG91Y2ggaW4gdG91Y2hlc1xuICAgICAgaWYgQHRvdWNoTW91c2UgPT0gdG91Y2guaWRlbnRpZmllclxuICAgICAgICBAZ2FtZS50b3VjaFVwKHRvdWNoLmNsaWVudFgsIHRvdWNoLmNsaWVudFkpXG4gICAgICAgIEB0b3VjaE1vdXNlID0gbnVsbFxuICAgIGlmIGV2dC50b3VjaGVzLmxlbmd0aCA9PSAwXG4gICAgICBAdG91Y2hNb3VzZSA9IG51bGxcblxuICBvbk1vdXNlRG93bjogKGV2dCkgLT5cbiAgICBpZiBAaGVhcmRPbmVUb3VjaFxuICAgICAgcmV0dXJuXG4gICAgQGxhc3RJbnRlcmFjdFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuICAgIEBnYW1lLnRvdWNoRG93bihldnQuY2xpZW50WCwgZXZ0LmNsaWVudFkpXG5cbiAgb25Nb3VzZU1vdmU6IChldnQpIC0+XG4gICAgaWYgQGhlYXJkT25lVG91Y2hcbiAgICAgIHJldHVyblxuICAgIEBsYXN0SW50ZXJhY3RUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcbiAgICBAZ2FtZS50b3VjaE1vdmUoZXZ0LmNsaWVudFgsIGV2dC5jbGllbnRZKVxuXG4gIG9uTW91c2VVcDogKGV2dCkgLT5cbiAgICBpZiBAaGVhcmRPbmVUb3VjaFxuICAgICAgcmV0dXJuXG4gICAgQGxhc3RJbnRlcmFjdFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuICAgIEBnYW1lLnRvdWNoVXAoZXZ0LmNsaWVudFgsIGV2dC5jbGllbnRZKVxuXG5zY3JlZW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAnc2NyZWVuJ1xucmVzaXplU2NyZWVuID0gLT5cbiAgZGVzaXJlZEFzcGVjdFJhdGlvID0gMTYgLyA5XG4gIGN1cnJlbnRBc3BlY3RSYXRpbyA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0XG4gIGlmIGN1cnJlbnRBc3BlY3RSYXRpbyA8IGRlc2lyZWRBc3BlY3RSYXRpb1xuICAgIHNjcmVlbi53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG4gICAgc2NyZWVuLmhlaWdodCA9IE1hdGguZmxvb3Iod2luZG93LmlubmVyV2lkdGggKiAoMSAvIGRlc2lyZWRBc3BlY3RSYXRpbykpXG4gIGVsc2VcbiAgICBzY3JlZW4ud2lkdGggPSBNYXRoLmZsb29yKHdpbmRvdy5pbm5lckhlaWdodCAqIGRlc2lyZWRBc3BlY3RSYXRpbylcbiAgICBzY3JlZW4uaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0XG5yZXNpemVTY3JlZW4oKVxuIyB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAncmVzaXplJywgcmVzaXplU2NyZWVuLCBmYWxzZVxuXG5hcHAgPSBuZXcgTmF0aXZlQXBwKHNjcmVlbiwgc2NyZWVuLndpZHRoLCBzY3JlZW4uaGVpZ2h0KVxuIl19
