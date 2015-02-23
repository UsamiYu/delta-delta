/*
 * enemy
 */
var game = game || {};

(function(){
    
    game.destroyAnimation = function(elm){
        elm.update = function(){};
        elm.tweener
            .clear()
            .to({scaleX: 8.0, scaleY: 0.0}, 250)
            .call(function(){ if(this.parent) this.remove(); }.bind(elm));
    };
    
    
    game.Enemy = tm.createClass({
        superClass: tm.bulletml.Bullet,
        
        init: function(runner, attr){
            this.superInit(runner);

            attr = attr.$safe(game.param.ENEMY_DEFAULT_ATTR);
            this.fromJSON(attr);

            this._isHitTestEnable = true;
            this.type = attr.type;
            this.maxHp = this._lastHp = this.hp;
            this.preHitTestArea = (this.width > this.height) ? this.width : this.height;
            this.scene = "";

            var image = tm.display.Sprite(this.image, this.width, this.height);
            image.setFrameIndex(this.frameIndex).setAlpha(0.85).addChildTo(this);
            if(this.type === "boss") this.hpGauge = game.EnemyHpGauge(0, 0, this.maxHp);

        },
        ondestroy: function(){
            if(!this.parent) return;
            var scene = this.scene;
            scene.scoreLabel.score += this.maxHp * 10;
            var player = scene.player;
            this.stopDanmaku();
            if(this.type === "boss"){
                scene.dispatchEvent(tm.event.Event("clearstage"));
                return;
            }
            var dist = tm.geom.Vector2(this.x, this.y).distanceSquared(player);
            if(dist > 10000 && scene.bulletLayer.children.length < 130){  //距離100px ^ 2 && 画面内のbulletの数が130未満
                var explode = game.EnemyExplosion(this.x, this.y, ~~((this.radius + this.maxHp) / 10));
                explode.addChildTo(this.scene.bulletLayer);
            }
            this.remove();
        },

        onadded: function(){
            this.visible = true;
            this.scene = this.getRoot().app.currentScene;
            if(this.type === "boss") this.hpGauge.addChildTo(this.scene);
            if(this.danmaku !== "") game.setDanmaku(this, this.scene.player, this.scene);
            if(this.addedAnimation !== ""){
                switch(this.addedAnimation){
                    case "drop":
                        this.setScale(2.5);
                        game.TweenAnimation(this, "in", 200, {});
                    break;
                    case "zoom":
                        this.setScale(0.1);
                        game.TweenAnimation(this, "in", 200, {});
                    default:
                    break;
                };
            }
        },

        onremoved: function(){
            if(this.type === "boss") this.hpGauge.remove();
        },

        update: function(e){
            this.runner.update();
            if(this.isSyncRotation){
                var vec = tm.geom.Vector2(this.runner.x - this.x, this.runner.y - this.y).toAngle();
                this.rotation = Math.radToDeg(vec);
            }
            this.setPosition(this.runner.x, this.runner.y);

            if(this.fieldOutCheck && game.gameFieldOut(this) && this.parent){
                this.remove();
                return;
            }

            if(this.scene.app.frame & 4) this.children[0].setFrameIndex(this.frameIndex).setAlpha(0.85);
                if(this._lastHp > this.hp){
                    this.children[0].setFrameIndex(this.frameIndex + 1).setAlpha(1);
                    if(this._lastHp - this.hp > 5){
                        var damage = (this._lastHp - this.hp - 4) * 0.7;
                        this.hp += ~~damage;
                    }
                    this._lastHp = this.hp;
                }
                
            if(this.type === "boss") this.hpGauge.setHp(this.hp);
            if(this._isHitTestEnable){
                if(this.hp < 1){
                    this._isHitTestEnable = false;
                    this.fire(tm.event.Event("destroy"));
                    return;
                }
                
                var player = this.scene.player;
                if(player.hitFlag){
                    switch(player.mode){
                        case "refrection":
                            var bounding = player.refrectionField.getBoundingCircle();
                            if(tm.collision.testCircleCircle(this, bounding)){
                                var v = Math.min(6, this.hp);
                                player.power *= 0.5;
                                this.hp -= v;
                                var vec = tm.geom.Vector2(player.x - this.x, player.y - this.y).normalize().mul(v);
                                player.x = Math.clamp(player.x + vec.x, GAME_FIELD_LEFT + player.radius, GAME_FIELD_RIGHT - player.radius);
                                player.y = Math.clamp(player.y + vec.y, GAME_FIELD_TOP + player.radius, GAME_FIELD_BOTTOM - player.radius);
                                var e = tm.event.Event("quake");
                                e.count = 1;
                                this.scene.gameField.dispatchEvent(e);
                            }
                        break;
                        default:
                            if(this.isHitPlayer(player)){
                                player.dispatchEvent(tm.event.Event("destroy"));
                                return;
                            }
                        break;
                    }
                }
            }
        },
        preHitTest: function(player){
            if((this.width === this.heigth) || this.rotation === 0 || this.rotation === 180){
                return this.isHitElementRect(player);
            }
            var rect = tm.geom.Rect(
                this.x - this.preHitTestArea * 0.5,
                this.y - this.preHitTestArea * 0.5,
                this.preHitTestArea,
                this.preHitTestArea);
            return tm.collision.testRectRect(rect, player.getBoundingRect());
        },
        isHitPlayer: function(player){
            if(!this.preHitTest(player)) return false;
            if(this.boundingType === "circle") return this.isHitPointCircle(player.x, player.y);
            if((this.width === this.height) && (this.rotation === 0 || this.rotation === 180)){
                return this.isHitPointRect(player.x, player.y);
            }
            return this.isHitPointRectHierarchy(player.x, player.y);
        }

    });

    game.InvisibleEnemy = tm.createClass({
        superClass: tm.bulletml.Bullet,
        
        init: function(runner, attr){
            this.superInit(runner);
            
            this.fieldOutCheck = attr.fieldOutCheck;
            
        },
        
        onadded: function(){
            this.scene = this.getRoot();
        },

        update: function(){
            this.runner.update();
            this.setPosition(this.runner.x, this.runner.y);
            
            if(this.fieldOutCheck && this.parent){
                if(this.x < GAME_FIELD_LEFT ||
                   this.x > GAME_FIELD_RIGHT ||
                   this.y < GAME_FIELD_TOP ||
                   this.y > GAME_FIELD_BOTTOM){
                    this.remove();
                    return;
                }
            }
        },
    });

    game.EnemyBullet = tm.createClass({
        superClass: tm.bulletml.Bullet,
        
        init: function(runner, attr){
            this.superInit(runner);
            attr = attr.$safe(game.param.BULLET_DEFAULT_ATTR);
            this.fromJSON(attr);

            var graphic = tm.display.Sprite("circle", this.width, this.height);
            graphic.setFrameIndex(attr.frameIndex);
            graphic.addChildTo(this);

        },

        fieldOutCheck: true,
        
        onadded: function(){
            this.scene = this.getRoot();
            if(this.scene.player.mode === "refrection" && tm.collision.testCircleCircle(this.getBoundingCircle(), this.scene.player.refrectionField.getBoundingCircle())) this.remove();
        },
        
        update: function(){
            this.runner.update();
            if(this.isSyncRotation){
                var vec = tm.geom.Vector2(this.runner.x - this.x, this.runner.y - this.y).toAngle();
                this.rotation = Math.radToDeg(vec);
            }
            this.setPosition(this.runner.x, this.runner.y);

            if(this.fieldOutCheck && game.gameFieldOut(this) && this.parent){
                this.remove();
                return;
            }

            var field = this.scene.gameField;
            var player = this.scene.player;
            var scoreLabel = this.scene.scoreLabel;
            if(player.getParent() === field && player.hitFlag && this.parent){
                switch (player.mode) {
                    case "shot": 
                        if(this.preHitTest(player)){
                            player.power++;
                            scoreLabel.score += scoreLabel.v;
                            if(this.isHitPlayer(player)){
                                player.dispatchEvent(tm.event.Event("destroy"));
                                return;
                            }
                        }
                    break;
                    case "refrection":
                        var bounding = player.refrectionField.getBoundingCircle();

                        if(tm.collision.testCircleCircle(this, bounding)){
                        //反射
                            var vec = tm.geom.Vector2(this.x - bounding.x, this.y - bounding.y);
                            var len = vec.length();
                            vec.normalize();
                            var distance = (this.radius + bounding.radius) - len;
                            var bulletPoint = tm.geom.Vector2.mul(vec, distance);

                            vec.mul(bounding.radius - this.radius);
                            var bullet = game.RefrectionBullet(this.x + bulletPoint.x, this.y + bulletPoint.y, vec.x, vec.y, this);
                            bullet.addChildTo(field);
                            this.remove();
                            scoreLabel.score += (scoreLabel.v * this.radius);
                            return;
                        }
                    break;
                    default:
                    break;
                }
            }
           
        },
        preHitTest: function(player){
            if(this.width === this.height) return this.isHitElementRect(player);
            var length = 0.5 * ((this.width > this.height) ? this.width : this.height);
            var rect = tm.geom.Rect(this.x - length, this.y - length, length * 2, length * 2);
            return tm.collision.testRectRect(rect, player.getBoundingRect());
        },
        isHitPlayer: function(player){
            if(this.width === this.height) return this.isHitPointCircle(player.x, player.y);
            if(this.rotation === 0 || this.rotation === 180) return this.isHitPointRect(player.x, player.y);
            var vec = tm.geom.Vector2(player.x - this.x, player.y - this.y);
            var p = tm.geom.Vector2().setRadian(vec.toAngle() - Math.degToRad(this.rotation), vec.length());
            var hW = this.width * 0.5;
            var hH = this.height * 0.5;
            if((p.x > -hW) && (p.x < hW) && (p.y > -hH) && (p.y < hH)) return true;
            return false;
        },
        
    });
    
    game.EnemyExplosion = tm.createClass({
        superClass: tm.display.CanvasElement,
        
        init: function(x, y, rank){
            this.superInit();
            
            this.setPosition(x, y);
            this.rank = rank;
        },
        danmaku: "explode",
        onadded: function(){
            var scene = this.getRoot().app.currentScene;
            
            game.setDanmaku(this, scene.player, scene, {rank: this.rank});
        },
        ondestroy: function(){
            if(this.parent) this.remove();
        }
    });


})();
