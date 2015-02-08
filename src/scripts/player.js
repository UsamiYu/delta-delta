/*
 * player.js
 */
var game = game || {};

(function(){

    game.Player = tm.createClass({
//        superClass: tm.display.TriangleShape,
        superClass: tm.display.Sprite,

        init: function(){
//            var style = game.colorStyle.getColorStyle("green");
//            this.superInit({
//                width      : 64,
//                height     : 64,
//                fillStyle  : style.fillStyle,
//                strokeStyle: style.strokeStyle,
//                lineWidth  : 8});
            this.superInit("player", 64, 64);
            this.setFrameIndex(0);

            this._isDestroy = false;
            this._onShot = false;
            this._shotInterval = 0;

            this.powerGauge = game.PowerGauge(this.maxPower);

            this.refrectionField = game.RefrectionField();
            this.refrectionField.addChildTo(this);
            this.powerGauge.addChildTo(this);

            this.initStatus();
        },
        
        maxSpeed: 8,
        speed: 0,
        keyX: 0,
        keyY: 0,
        vx: 0,
        vy: 0,
        shotInterval: [8, 6, 4],
        shotLevel: 0,
        power: 1,
        maxPower: 1200,
        mode: "shot", // "shot" or "refrection"
        hitFlag: true,
        hitFlagCount: 0,

        update: function(app){

            if(this._isDestroy){
                return;
            }
            
            //パワーチェック
            if(this.mode === "refrection"){
                this.power -= 4;
            }
            this.power += (2 - this.shotLevel);
            
            this.power = Math.clamp(this.power, 1, this.maxPower);
            this.shotLevel = ~~(this.power / this.maxPower * 2);

            this.powerGauge.setPower(this.power);
            
            if(this.power === 1 && this.mode === "refrection") this.fire(tm.event.Event("changemode"));

            //弾生成
            if(this.mode === "shot"){
                if(this._onShot && this._shotInterval < 1){
                    this.shotBullet();
                    this._shotInterval = this.shotInterval[this.shotLevel];
                }
                this._shotInterval--;
            }

            if(!this.tweener.isPlaying && this.hitFlagCount > 0){
                this.hitFlagCount--;
                if(this.hitFlagCount % 4 === 0){
                    this.visible = !this.visible;
                }
                if(this.hitFlagCount < 1) this.hitFlag = this.visible = true; 
            }

            this.x += (this.left   + this.keyX + this.vx < GAME_FIELD_LEFT ||
                       this.right  + this.keyX + this.vx > GAME_FIELD_RIGHT) ?
                        0 : (this.keyX + this.vx);
            this.y += (this.top    + this.keyY + this.vy < GAME_FIELD_TOP ||
                       this.bottom + this.keyY + this.vy > GAME_FIELD_BOTTOM) ?
                        0 : (this.keyY + this.vy);
        },
        
        ondestroy: function(){
            if(this._isDestroy) return;
            this._isDestroy = true;
            this.hitFlag = false;
            this._onShot = false;
            var scene = this.getRoot();
            scene.missCount++;
            if(scene.missCount < 10) scene.scoreLabel.score++;

            this.tweener
                .clear()
                .to({scaleX: 10, scaleY: 0.01}, 250)
                .call(function(){
                    this.visible = false;
                }.bind(this))
                .wait(500)
                .call(function(){
                    this.power = 1;
                    this.initStatus("shot");
                }.bind(this));
        },
        
        initStatus: function(){
            this.visible = true;
            this._isDestroy = false;
//            this.setOnShot(true);
            this.x = 320;
            this.y = 720 - this.radius;
            this.setScale(10);
            
            game.TweenAnimation(this, "in", 200, { scaleX: 1.0, scaleY: 1.0});
            this.tweener
                .call(function(){
                    this.hitFlagCount = GAME_FPS;
                    this.mode = "shot";
                    this.refrectionField.setScale(0.2).setAlpha(1.0);
                    this.setOnShot(true);
                }.bind(this));
        },

        setOnShot: function(bool){
            this._onShot = bool
        },

        onchangemode: function(){
            switch(this.mode){
                case "shot":
                    if(this.power < this.maxPower / 2) return;
                    this.refrectionField.setScale(1.0).setAlpha(0.5);
                    this.setOnShot(false);
                    this.mode = "refrection";
                    var effect = tm.display.Sprite("circle", 80, 80);
                    effect.setFrameIndex(2).setScale(0.2).setAlpha(0.5).addChildTo(this);
                    game.TweenAnimation(effect, "out", 250, {scaleX: 18.0, scaleY: 18.0, alpha: 0.1});
                break;
                case "refrection":
                    this.refrectionField.setScale(0.2).setAlpha(1.0);
                    this.setOnShot(true);
                    this.mode = "shot";
                break;
                default:
                break;
            }
        },

        shotBullet: function(){
            for(var i = 0;i < 2;i++){
                var bullet = game.PlayerBullet(this.x + i * 24 - 12, this.y - 32, 3);
                bullet.addChildTo(this.parent);
            }
        },
    });
    
    game.RefrectionField = tm.createClass({
//        superClass: tm.display.CircleShape,
        superClass: tm.display.Sprite,
        
        init: function(){
/*            var style = game.colorStyle.getColorStyle("yellow");
            this.superInit({
                width      : 80,
                height     : 80,
                fillStyle  : "rgba(0, 0, 0, 0.0)",
                strokeStyle: style.strokeStyle,
                lineWidth  : 12});
            this.setScale(0.2);
        }, */
            this.superInit("circle", 80, 80);
            this.setFrameIndex(2);
            this.setScale(0.2);
        },
    });
   
    game.PlayerBullet = tm.createClass({
//        superClass: tm.display.CircleShape,
        superClass: tm.display.Sprite,
        
        init: function(x, y, damage){
//            var style = game.colorStyle.getColorStyle("lime");
            this.superInit("circle", 48, 24);
            this.setFrameIndex(2);
/*            this.superInit({
                width      : 16,
                height     : 16,
                fillStyle  : style.fillStyle,
                strokeStyle: style.strokeStyle,
                lineWidth  : 4});
*/
            this.x = x;
            this.y = y;

//            angle = Math.degToRad(angle + 270);
            this.setRotation(90);
            this.vy = -this.speed;
            this.damage = damage;
        },
        speed: 32,
        boundingtype: "rect",
        hitFlag: false,

        update: function(app){
            if(this.hitFlag || game.gameFieldOut(this)){
                this.remove();
                return;
            }

            var enemies = app.currentScene.enemies;
            var l = enemies.length;
            if(l > 0){
                for(var i = l;i > 0;i--){
                    var target = enemies[i - 1];
                    if(!target.tweener.isPlaying){
                        if(this.isHitElementRect(target)){
                            target.hp -= this.damage;
                            this.scaleX = 0.25;
                            this.scaleY = 1.2;
                            this.hitFlag = true;
                            break;
                        }
                    }
                }
            }
            this.y += this.vy;
        },
        getBoundingRect: function(){
            return tm.geom.Rect(
                this.x - this.height * this.originX,
                this.y - this.width  * this.originY,
                this.height,
                this.width);
        },
    });
    
    game.RefrectionBullet = tm.createClass({
        superClass: tm.display.Sprite,
        
        init: function(x, y, size, vx, vy){
            var style = game.colorStyle.getColorStyle("lime");
            var width = (size !== 24) ? 32 : 24;
            var height = width;
            this.superInit("bullet", width, height);
            this.setFrameIndex(style.index + ((size !== 24) ? 12 : 0));
            this.setScale((size === 64) ? 2 : 1);
            this.x = x;
            this.y = y;
            
            this.vx = vx;
            this.vy = vy;
            
            this.damage = size / 2;
            
            this.count = (64 - size) / 8;
        },
        boundingType: "rect",
        hitFlag: false,
        
        update: function(app){
            if(game.gameFieldOut(this)){
                this.remove();
                return;
            }
            if(this.hitFlag) return;
            var enemies = app.currentScene.enemies;
            var l = enemies.length;
 
            if(l > 0){
                for(var i = l;i > 0;i--){
                    var target = enemies[i - 1];
                    if(!target.tweener.isPlaying){
                        if(this.isHitElement(target)){
                            target.hp -= this.damage;
                            this.update = this.explode;
                            this.tweener
                                .clear()
                                .to({scaleX: 5.0, scaleY:5.0, alpha: 0.3}, 250)
                                .call(function(){ this.remove(); }.bind(this));
                            break;
                        }
                    }
                }
            }

            this.x += this.vx;
            this.y += this.vy;

            if(this.count > 0){
                if(this.top < GAME_FIELD_TOP){
                    this.y += (GAME_FIELD_TOP - this.top);
                    this.vy *= -1;
                    this.count--;
                }
                if(this.bottom > GAME_FIELD_BOTTOM){
                    this.y += (GAME_FIELD_BOTTOM - this.bottom);
                    this.vy *= -1;
                    this.count--;
                }
                if(this.left < GAME_FIELD_LEFT){
                    this.x += (GAME_FIELD_LEFT - this.left);
                    this.vx *= -1;
                    this.count--;
                }
                if(this.right > GAME_FIELD_RIGHT){
                    this.x += (GAME_FIELD_RIGHT - this.right);
                    this.vx *= -1;
                    this.count--;
                }
            }
        },
        explode: function(app){
            var enemies = app.currentScene.enemies;
            var l = enemies.length;
            var bounding = tm.geom.Circle(this.x, this.y, this.width * this.scaleX / 2);
            
            if(l > 0){
                for(var i = l;i > 0;i--){
                    var target = enemies[i - 1];
                    if(!target.tweener.isPlaying){
                        if(tm.collision.testCircleCircle(bounding, target.getBoundingCircle())){
                             target.hp--;
                        }
                    }
                }
            }
        }
    });
    
    game.PowerGauge = tm.createClass({
        superClass: tm.ui.Gauge,
        
        init: function(maxPower){
            this.superInit({
                width: 80,
                height: 80,
                animationFlag: false,
            });
            
            
            this.color = "blue";
            this.value = 0;
            this.maxPower = maxPower;
        },
        power: 0,
        
        setPower: function(pow){
            if(this.power === pow) return;
            this.power = pow;
            this.setValue(this.power / this.maxPower * 100);
            this.color = (this.power < this.maxPower / 2) ? "blue" : "orange";
        },
        draw: function(canvas){
            canvas.save();
            canvas.lineWidth = 4;
            var ratio = this.getRatio();
            var startAngle = Math.degToRad(270);
            canvas.setStrokeStyle(game.colorStyle.getColorStyle(this.color).strokeStyle);
            canvas.strokeArc(0, 0, 34, startAngle, Math.PI * 2 * ratio + startAngle, false);

            canvas.restore();
        },
    });

})();