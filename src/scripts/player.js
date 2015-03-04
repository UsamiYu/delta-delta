/*
 * player.js
 */
var game = game || {};

(function(){

    game.Player = tm.createClass({
        superClass: tm.display.Sprite,

        init: function(){
            this.superInit("image", 64, 64);
            this.setFrameIndex(22);

            this._isDestroy = false;
            this._onShot = false;
            this._shotInterval = 0;

            this.powerGauge = game.PowerGauge(this.maxPower);

            this.refrectionField = game.RefrectionField();
            this.refrectionField.addChildTo(this);
            this.powerGauge.addChildTo(this);

            this.initStatus();
        },
        
        maxSpeed: 6,
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

            this.x = Math.clamp(this.x + this.keyX + this.vx, GAME_FIELD_LEFT + this.radius, GAME_FIELD_RIGHT - this.radius);
            this.y = Math.clamp(this.y + this.keyY + this.vy, GAME_FIELD_TOP + this.radius, GAME_FIELD_BOTTOM - this.radius);
        },
        
        ondestroy: function(){
            if(this._isDestroy) return;
            this._isDestroy = true;
            this.hitFlag = false;
            this._onShot = false;
            var scene = this.getRoot();
            scene.missCount++;
            if(scene.missCount < 10) scene.scoreLabel.score++;
            var e = tm.event.Event("quake");
            e.count = 5;
            this.parent.dispatchEvent(e);

            this.tweener
                .clear()
                .to({scaleX: 10, scaleY: 0.01}, 250)
                .call(function(){
                    this.visible = false;
                }.bind(this))
                .wait(500)
                .call(function(){
                    this.power = 1;
                    this.initStatus();
                }.bind(this));
        },
        
        initStatus: function(){
            this.visible = true;
            this._isDestroy = false;
            this.x = 320;
            this.y = 720 - this.radius;
            this.setScale(10);
            
            game.TweenAnimation(this, "in", 200, { scaleX: 1.0, scaleY: 1.0});
            this.tweener
                .call(function(){
                    this.hitFlagCount = GAME_FPS;
                    this.mode = "shot";
                    this.refrectionField.setScale(0.5);
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
                    this.refrectionField.dispatchEvent(tm.event.Event("changemode"));
                    this.setOnShot(false);
                    this.mode = "refrection";
                    this.timeline.clear()
                        .call(  0, function(){ this.setFrameIndex(21); }.bind(this), 250)
                        .call(500, function(){ this.setFrameIndex(20); }.bind(this), 250);
                    var effect = tm.display.Sprite("image", 64, 64);
                    effect.setFrameIndex(10).setAlpha(0.5).addChildTo(this);
                    game.TweenAnimation(effect, "out", 200, {scaleX: 12.0, scaleY: 12.0, alpha: 0.1});
                break;
                case "refrection":
                    this.refrectionField.dispatchEvent(tm.event.Event("changemode"));
                    this.mode = "shot";
                    this.timeline.clear()
                        .call(  0, function(){ this.setFrameIndex(21); }.bind(this), 250)
                        .call(500, function(){ this.setFrameIndex(22); this.setOnShot(true); }.bind(this), 250);
                break;
                default:
                break;
            }
        },

        shotBullet: function(){
            for(var i = 0;i < 2;i++){
                var bullet = game.PlayerBullet(this.x + i * 24 - 12, this.y - 40, 3);
                bullet.addChildTo(this.parent);
            }
        },
    });
    
    game.RefrectionField = tm.createClass({
        superClass: tm.display.Sprite,
        
        init: function(){
            this.superInit("image", 32, 32);
            this.setFrameIndex(20);
            this.setAlpha(0.5);
        },
        onchangemode: function(){
            this.scaleX = (this.scaleX === 0.5) ? 2.5 : 0.5;
            this.scaleY = (this.scaleY === 0.5) ? 2.5 : 0.5;
        },
        getBoundingCircle: function(){
            return tm.geom.Circle(this.parent.x, this.parent.y, 40); //refrection radius
        },
    });
   
    game.PlayerBullet = tm.createClass({
        superClass: tm.display.Sprite,
        
        init: function(x, y, damage){
            this.superInit("image", 48, 24);
            this.setFrameIndex(2);

            this.x = x;
            this.y = y;

            this.setRotation(90);
            this.vy = -this.speed;
            this.damage = damage;
        },
        speed: 32,
        boundingtype: "rect",
        hitFlag: false,

        update: function(app){
            if(this.hitFlag || game.GameFieldOut(this)){
                this.remove();
                return;
            }

            var enemies = app.currentScene.enemyLayer.children;
            var l = enemies.length;
            if(l > 0){
                for(var i = l;i > 0;i--){
                    var target = enemies[i - 1];
                    if(this.isHitEnemy(target)){
                        target.hp -= this.damage;
                        this.scaleX = 0.25;
                        this.scaleY = 1.2;
                        this.hitFlag = true;
                        break;
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
        isHitEnemy: function(target){
            if(target.tweener.isPlaying || !target.parent) return false;
            if(this.x - 48 > target.x || this.x + 48 < target.x || this.y + 96 < target.y) return false;
            if((target.width === target.height) ||
                (target.rotation === 0) ||
                (target.rotation === 180)){
                return this.isHitElementRect(target);
            }
            var rect = tm.geom.Rect(target.x - target.radius, target.y - target.radius, target.radius * 2, target.radius * 2);
            return tm.collision.testRectRect(rect, this.getBoundingRect());
        }
    });
    
    game.RefrectionBullet = tm.createClass({
        superClass: tm.display.Sprite,
        
        init: function(x, y, vx, vy, obj){
            this.superInit("image", obj.width, obj.height);
            this.setFrameIndex(obj.children[0].frameIndex + 1);
            this.setPosition(x, y);
            
            this.vx = vx;
            this.vy = vy;
            
            this.damage = this.radius;
            
            this.count = (28 - this.radius) / 4;

            this.isSyncRotation = obj.isSyncRotation;

            this.syncRotation();
        },
        boundingType: "rect",
        hitFlag: false,
        
        update: function(app){
            if(game.GameFieldOut(this)){
                this.remove();
                return;
            }
            if(this.hitFlag) return;
            
            var enemies = app.currentScene.enemyLayer.children;
            var l = enemies.length;
 
            if(l > 0){
                for(var i = l;i > 0;i--){
                    var target = enemies[i - 1];
                    if(!target.tweener.isPlaying && target.parent){
                        if(this.isHitElementRect(target)){
                            target.hp -= this.damage;
                            this.update = this.explode;
                            this.tweener
                                .clear()
                                .to({scaleX: 5.0, scaleY:5.0, alpha: 0.5}, 200)
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
                    this.syncRotation();
                }
                if(this.bottom > GAME_FIELD_BOTTOM){
                    this.y += (GAME_FIELD_BOTTOM - this.bottom);
                    this.vy *= -1;
                    this.count--;
                    this.syncRotation();
                }
                if(this.left < GAME_FIELD_LEFT){
                    this.x += (GAME_FIELD_LEFT - this.left);
                    this.vx *= -1;
                    this.count--;
                    this.syncRotation();
                }
                if(this.right > GAME_FIELD_RIGHT){
                    this.x += (GAME_FIELD_RIGHT - this.right);
                    this.vx *= -1;
                    this.count--;
                    this.syncRotation();
                }
            }
        },
        explode: function(app){
            var enemies = app.currentScene.enemyLayer.children;
            var l = enemies.length;
            var bounding = tm.geom.Circle(this.x, this.y, this.radius * this.scaleX);

            if(l > 0){
                for(var i = l;i > 0;i--){
                    var target = enemies[i - 1];
                    if(!target.tweener.isPlaying && target.parent){
                        if(tm.collision.testCircleCircle(bounding, target.getBoundingCircle())){
                            target.hp--;
                        }
                    }
                }
            }
        },
        syncRotation: function(){
            if(!this.isSyncRotation) return;
            this.rotation = Math.radToDeg(tm.geom.Vector2(this.vx, this.vy).toAngle());
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
            canvas.setStrokeStyle((this.color === "blue") ? "hsl(240, 100%, 75%)" : "hsl(30, 100%, 75%)");
            canvas.strokeArc(0, 0, 34, startAngle, Math.PI * 2 * ratio + startAngle, false);

            canvas.restore();
        },
    });

})();