/*
 * ui.js
 */

var game = game || {};

(function(){

    game.Score = tm.createClass({
        superClass: tm.display.Label,
         
        init: function(){
            this.superInit("Score");
            this.setAlign("left");
            this.setFontSize(48);
            this.setFontFamily(game.FONT);
            this.setAlpha(0.5);
         },
    });
    
    game.HighScore = tm.createClass({
        superClass: tm.display.Label,
         
        init: function(){
            this.superInit("High-Score");
            this.setAlign("left");
            this.setFontSize(48);
            this.setFontFamily(game.FONT);
            this.setAlpha(0.5);
        },
    });

    game.ScoreLabel = tm.createClass({
        superClass: tm.display.Label,
         
        init: function(){
            this.superInit("0");
            this.setAlign("right");
            this.setFontSize(64);
            this.setFontFamily(game.NUMBER_FONT);             
            this.setAlpha(0.5);
            this.score = 0;
            this.v = 600 / GAME_FPS; //スコア係数
        },
        update: function(){
            this.text = "" + ~~(this.score);
        },
    });

    game.HighScoreLabel = tm.createClass({
        superClass: tm.display.Label,
         
        init: function(score){
            this.superInit(score);
            this.setAlign("right");
            this.setFontSize(64);
            this.setFontFamily(game.NUMBER_FONT);
            this.setAlpha(0.5);
            this.score = parseInt(score, 10);
        },
        update: function(){
            if(this.parent){
                var score = this.parent.scoreLabel.score;
                if(score > this.score){
                    this.score = score;
                }
            }
            this.text = "" + ~~(this.score);
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
                animationFlag: false,
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
                fontFamily: game.FONT,
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
            this.superInit("image", 96, 96);
            this.setFrameIndex(11);
            
            this.setInteractive(true);
            this.boundingType = "circle";
            var text = tm.display.TextShape({
                text: "C",
                fontSize: 48,
                fontFamily: game.NUMBER_FONT,
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
    
    game.PauseButton = tm.createClass({
        superClass: tm.display.Shape,
        
        init: function(){
            this.superInit({width: 64, height: 64, fillStyle: "white"});
            
            this.autoRender = false;
            this.render();
            this.setInteractive(true);
        },
        _render: function(){
            this.canvas.fillRect(5, 2, 24, 60);
            this.canvas.fillRect(35, 2, 24, 60);
        },
        onpointingstart: function(){
            this.setScale(0.9);
        },
        onpointingend: function(){
            this.setScale(1);
            this.parent.app.pushScene(game.PauseScene());
        }
    });
    
    game.TextButton = tm.createClass({
        superClass: tm.display.TextShape,
        
        init: function(param){
            param = param.$safe(game.param.DEFAULT_TEXT_SHAPE);
            this.superInit(param);
            this.boundingType = "rect";
            this.setInteractive(true);
        },
        onpointingstart: function(){
            this.setScale(0.9);
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
            this.superInit("enemy :0000/0000");
            this.setAlign("left");
            this.setFontSize(14);
            this.setFontFamily(game.NUMBER_FONT);
            this.maxValue = 0;
            this.autoRender = false;
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
            this.setFontSize(14);
            this.setFontFamily(game.NUMBER_FONT);
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

            if(!game.config.enableBackGround){
                this.tweener.wait(1).call(function(){ this.remove(); }.bind(this));
                return;
            }
            
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
    
    game.BlackScreen = tm.createClass({
        superClass: tm.display.RectangleShape,
        
        init: function(){
            this.superInit({
                width: 640,
                height: 960,
                fillStyle: "rgba(0, 0, 0, 0.75)",
                strokeStyle: "rgb(0, 0, 0)",
                x: 320,
                y: 480
            });
        }
    });
    
    game.Result = tm.createClass({
        superClass: tm.display.CanvasElement,
        
        init: function(stage, age, miss, bonus, phase){
            this.superInit();

            var t = age / GAME_FPS;
            var ms = ~~((t - ~~(t)) * 100);
            var mm = Math.floor(t / 60);
            var ss = Math.floor(t) - mm * 60;
            
            if(stage < 6){
                this.addLabel("Stage " + stage + " Clear", "center", game.FONT, 48, 320, 190);
                this.addLabel("Time", "left", game.FONT, 48, 120, 360);
                this.addLabel(
                    ("00" + mm).substr(-2) + ":" + ("00" + ss).substr(-2) + "." + ("00" + ms).substr(-2),
                    "right",
                    game.NUMBER_FONT,
                    48,
                    520,
                    360);
            }else{
                this.addLabel("Phase", "left", game.FONT, 48, 120, 360);
                this.addLabel(phase + "", "right", game.NUMBER_FONT, 48, 520, 360);
            }
            
            this.addLabel("Result", "center", game.FONT, 48, 320, 280);
            
            this.addLabel("Miss", "left", game.FONT, 48, 120, 440);
            
            this.addLabel(miss + "", "right", game.NUMBER_FONT, 48, 520, 440);
            
            this.addLabel("Bonus", "left", game.FONT, 48, 120, 540);
            
            this.addLabel(bonus + "", "right", game.NUMBER_FONT, 48, 520, 540);
        },
        addLabel: function(text, align, font, fontSize, x, y){
            var label = tm.display.Label(text);
            label.setAlign(align)
                 .setFontSize(fontSize)
                 .setAlpha(0.7)
                 .setFontFamily(font)
                 .setPosition(x, y)
                 .addChildTo(this);
        }
    });
    
    game.Timer = tm.createClass({
        superClass: tm.display.CanvasElement,
        
        init: function(){
            this.superInit();
            
            tm.display.Label("Time")
                .setPosition(-64, 0)
                .setFontSize(48)
                .setFontFamily(game.FONT)
                .setAlpha(0.5)
                .addChildTo(this);

            this.sec = tm.display.Label("60")
                .setFontSize(80)
                .setFontFamily(game.NUMBER_FONT)
                .setAlpha(0.5)
                .setPosition(-80, 48)
                .addChildTo(this);
            this.ms = tm.display.Label(".00")
                .setFontSize(48)
                .setFontFamily(game.NUMBER_FONT)
                .setAlpha(0.5)
                .setPosition(-12, 36)
                .addChildTo(this);
                
            this.timer = 60 * GAME_FPS;
        },
        update: function(){
            if(this.tweener.isPlaying){ return; }
            this.timer -= 1;
            var sec = ~~(this.timer / GAME_FPS);
            var score = 0;
            this.ms.text = "." + ("0" + ~~((this.timer / GAME_FPS - sec) * 100)).substr(-2);
            this.sec.text = ("0" + sec).substr(-2);
            if(this.timer === 0){
                var scene = this.parent;
                scene.stopDanmaku();
                var enemies = scene.enemyLayer.children;
                for(var i = 0, l = enemies.length;i < l;i++){
                    enemies[i]._isHitTestEnable = false;
                    if(enemies[i].type === "boss"){
                        score = 500 * (1 - enemies[i].hp / enemies[i].maxHp);
                    }
                    enemies[i].stopDanmaku();
                    game.TweenAnimation(enemies[i], "out", 250, {scaleX: 8.0, scaleY: 0.0});
                }
                scene.bulletLayer.removeChildren();
                
                scene.phase -= 1;

                scene.timeBonus = scene.phase * 1500 + score;

                this.tweener
                    .clear()
                    //.wait(500)
                    .call(function(){
                        game.EffectiveText("Time Up")
                            .setPosition(320, 280)
                            .addChildTo(this);
                    }.bind(scene))
                    .wait(2000)
                    .call(function(){ this.result(); }.bind(scene));

                this.update = function(){};
            }
        },
        onstop: function(){
            this.sec.tweener
                .clear()
                .fadeIn(1)
                .to({alpha: 0.5}, 1500);
            this.ms.tweener
                .clear()
                .fadeIn(1)
                .to({alpha: 0.5}, 1500);
            this.tweener
                .clear()
                .wait(1000);
        }
    });

})();