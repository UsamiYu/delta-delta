/*
 * ui.js
 */

var game = game || {};

(function(){

    game.ScoreLabel = tm.createClass({
         superClass: tm.display.Label,
         
         init: function(){
             this.superInit("SCORE:000000000");
             this.setAlign("left");
             this.setFontSize(32);
             this.setFontFamily("Audiowide");             
             this.setAlpha(0.5);
             this.score = 0;
             this.v = 600 / GAME_FPS; //スコア係数
         },
         update: function(){
             this.text = "SCORE:" + ("000000000" + ~~(this.score)).substr(-9);
         },
    });

    game.EnemyHpGauge = tm.createClass({
        superClass: tm.ui.Gauge,
        
        init: function(x, y, maxHp){
            this.superInit({
                width: 632,
                height: 24,
                x: x || 4,
                y: y || 4,
                bgColor: "red",
                color: "lime",
                animationTime: 1000,
                borderWidth: 2,
            });

            this.maxHp = this.value = this.hp = maxHp;
        },
        
        setHp: function(hp){
            if(this.hp === hp) return;
            this.hp = hp;
            this.setValue(this.hp / this.maxHp * 100);
        },
    });
    
    game.EffectiveText = tm.createClass({
        superClass: tm.display.CanvasElement,
        
        init: function(text){
            this.superInit();

            if(!text) return;
            
            this.text = text;
            this.count = 0;
            this.age = 0;
        },
        tick: function(){
            var count = this.children.length;
            if(count >= this.text.length){
                this.update = function(){ if(count < 1) this.remove(); };
                return;
            }

            var textShape = tm.display.TextShape({
                fontSize: 32,
                fontFamily: "Audiowide",
                fillStyle: "hsl(240, 100%, 95%)",
                strokeStyle: "hsl(240, 100%, 75%)",
                text: this.text[count]
            })
            .setPosition(count * 32 - this.text.length * 16, 0)
            .addChildTo(this);
            
            var sx = textShape.scaleX = 0.2;
            var sy = textShape.scaleY = 10.0;

            game.TweenAnimation(textShape, "draw_phase", 240, {scaleX: sx, scaleY: sy});

        },
        update: function(){
            if(this.age > 6){
                this.tick();
                this.age = 0;
            }
            this.age++;
        },
    });

    game.ModeChangeButton = tm.createClass({
        superClass: tm.display.Sprite,
        
        init: function(){
            this.superInit("polygon", 96, 96);
            this.setFrameIndex(2);
            
            this.setInteractive(true);
            this.boundingType = "circle";
            var text = tm.display.TextShape({
                text: "C",
                fontSize: 48,
//                fontFamily: "Inconsolata",
            }).addChildTo(this);
        },
        onpointingstart: function(){
            this.setScale(0.9);
        },
        onpointingend: function(){
            this.setScale(1);
            var scene = this.parent;
            scene.pointingCheck.count = 0;
            scene.player.dispatchEvent(tm.event.Event("changemode"));
        }
    });
    
    game.GameFieldFrame = tm.createClass({
        superClass: tm.display.Shape,
        
        init: function(){
            this.superInit({
                width    : 640,
                height   : 960,
                fillStyle: "rgb(127, 127, 196)"
            });

            this.autoRender = false;
        },
        _render: function(){
            this.canvas.fillRect(0, 0, this.width, this.height);
            this.canvas.clear(GAME_FIELD_LEFT, GAME_FIELD_TOP, 608, 688);
        }
    });
    
    game.EnemyInfomation = tm.createClass({
        superClass: tm.display.RectangleShape,
        
        init: function(){
            this.superInit({
                width: 160,
                height: 80,
                fillStyle: "rgba( 0, 0, 0, 0.4)"
            });
            
            var enemy = game.EnemyCounter().setPosition(-72, -24).addChildTo(this);
            var bullet = game.BulletCounter().setPosition(-72, -8).addChildTo(this);
            
            this.scene = null;
        },

    });
    
    game.EnemyCounter = tm.createClass({
        superClass: tm.display.Label,
        
        init: function(){
            this.superInit("enemy : 000/ 000");
            this.setAlign("left");
            this.setFontSize(16);
            this.setFontFamily("Inconsolata");
            this.maxValue = 0;
        },
        update: function(app){
            var v = app.currentScene.enemyLayer.children.length;
            if(this.maxValue < v) this.maxValue = v;
            this.text = "enemy :" + ("0000" + v).substr(-4) + "/" + ("0000" + this.maxValue).substr(-4);
        }
    });
    
    game.BulletCounter = tm.createClass({
        superClass: tm.display.Label,
        
        init: function(){
            this.superInit("bullet:0000/0000");
            this.setAlign("left");
            this.setFontSize(16);
            this.setFontFamily("Inconsolata");
            this.maxValue = 0;
            this.autoRender = false;
        },
        update: function(app){
            var v = app.currentScene.bulletLayer.children.length;
            if(this.maxValue < v) this.maxValue = v;
            this.text = "bullet:" + ("0000" + v).substr(-4) + "/" + ("0000" + this.maxValue).substr(-4);
        }
    });
    
    game.BackGround = tm.createClass({
        superClass: tm.display.CanvasElement,
        
        init: function(){
            this.superInit();
            
            this.back = game.BackGroundImage().setScale(2).setAlpha(0.5).addChildTo(this);
            this.back.tweener
                     .clear()
                     .move(0, 47, 4000)
                     .move(0, 0, 1).setLoop(true);

            this.front = game.BackGroundImage().setScale(3).setAlpha(0.4).addChildTo(this);
            this.front.tweener
                      .clear()
                      .move(0, 71, 4000)
                      .move(0, 0, 1).setLoop(true);
        },
    });
    
    game.BackGroundImage = tm.createClass({
        superClass: tm.display.Shape,
        
        init: function(){
            this.superInit({
                width: 320,
                height: 480,
                lineWidth: 1,
                strokeStyle: "rgb( 40%, 70%, 70%)"
            });
            
            this.autoRender = false;
            this.render();
        },
        _render: function(){
            for(var i = 0;i < 480;i += 24){
                this.canvas.line(0, i, 320, i).stroke();
            }
        }
    });
    
    game.Result = tm.createClass({
        superClass: tm.display.CanvasElement,
        
        init: function(age, miss, bonus){
            this.superInit();

            var t = age / GAME_FPS;
            var ms = ~~((t - ~~(t)) * 100);
            var mm = Math.floor(t / 60);
            var ss = Math.floor(t) - mm * 60;
            
            this.addLabel("RESULT", "center", 48, 320, 160);
            
            this.addLabel("TIME", "left", 32, 120, 280);

            
            this.addLabel(
                ("00" + mm).substr(-2) + ":" + ("00" + ss).substr(-2) + "." + ("00" + ms).substr(-2),
                "right",
                32,
                520,
                280);

            this.addLabel("MISS", "left", 32, 120, 340);
            
            this.addLabel(miss + "", "right", 32, 520, 340);
            
            this.addLabel("BONUS", "left", 32, 120, 480);
            
            this.addLabel(bonus + "", "right", 32, 520, 480);
        },
        addLabel: function(text, align, fontSize, x, y){
            var label = tm.display.Label(text);
            label.setAlign(align)
                 .setFontSize(fontSize)
                 .setAlpha(0.7)
                 .setFontFamily("Audiowide")
                 .setPosition(x, y)
                 .addChildTo(this);
        }
    });
})();