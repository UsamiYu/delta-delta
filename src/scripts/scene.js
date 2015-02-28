/*
 * scene
 */
var game = game || {};

(function(){
/**
 * Sceneクラス
 */

    game.ShootingScene = tm.createClass({
        superClass: tm.app.Scene,
        
        init: function(num){
            this.superInit();
            this.background = game.BackGround().setPosition(320, 480).addChildTo(this);
            //ゲーム描画領域(シーン描画領域とは異なる)
            this.gameField = tm.display.CanvasElement().addChildTo(this);
            this.gameField.onquake = function(e){
                var rx = (Math.random() * 2 < 1) ? 8 : -8;
                var ry = (Math.random() * 2 < 1) ? 8 : -8;
                this.tweener
                    .clear()
                    .moveBy(rx, ry, ~~(1000 / GAME_FPS))
                    .moveBy(-2 * rx, -2 * ry, ~~(2000 / GAME_FPS))
                    .move(0, 0, ~~(1000 / GAME_FPS))
                    .call(function(){
                        if(e.count > 0){
                            e.count -= 1;
                            this.tweener.rewind();
                        }
                    }.bind(this), ~~(1000 / GAME_FPS));
            }
            this.player = game.Player();
            this.player.addChildTo(this.gameField);
            //敵描画レイヤー
            this.enemyLayer = tm.display.CanvasElement().addChildTo(this.gameField);
            //弾描画レイヤー
            this.bulletLayer = tm.display.CanvasElement().addChildTo(this.gameField);
            
            //ゲーム描画領域より上に描画するもの
            var frame = game.GameFieldFrame().setPosition(320,480).addChildTo(this);
            var titleSprite = tm.display.Sprite("title", 300, 120).setPosition(320, 840).addChildTo(this);
            var title = tm.display.TextShape({fontSize: 24, text: "delta-delta Ver. 0.1"}.$safe(game.param.DEFAULT_TEXT_SHAPE));
            title.autoRender = false;
            title.setPosition(480, 930).addChildTo(this);
                
            //デバッグ情報用
            if(game.config.enableEnemyInfo){
                var info = game.EnemyInfomation().setPosition(542, 776).addChildTo(this);
            }

            this.scoreLabel = game.ScoreLabel().setPosition(24, 56);
            if(num > 0) this.scoreLabel.addChildTo(this);
            
            if(game.config.modeChangeButton !== "none"){
                this.button = game.ModeChangeButton()
                    .setPosition((game.config.modeChangeButton === "left") ? 64 : 576, 654)
                    .setAlpha(0.3)
                    .addChildTo(this);
            }
            
            this.stage = num || 0;
            this.danmakuList = game.danmakuList(this.stage);
            this.stepTick();
        },
        //ダブルタップチェック用変数
        pointingCheck: {
            count: 0,
            time: 0,
            durationTime: GAME_FPS / 4, //250ms
        },
        age: 0,
        timeBonus: 0,
        missCount: 0,
        danmaku: "",
        phase: 0,

        stepTick: function(){
            this.danmaku = this.danmakuList[this.phase];
            if(this.danmakuList.length <= this.phase){
                this.result();
                return;
            }
            if(this.danmaku === "") return;

            this.stopDanmaku();
            game.setDanmaku(this, this.player, this);
            this.timeBonus += 60 * GAME_FPS;
            this.phase++;

            game.EffectiveText("PHASE " + ("00" + this.phase + "/").substr(-3) + ("00" + this.danmakuList.length).substr(-2))
                   .setPosition(320, 240)
                   .addChildTo(this);
        },
        
        update: function(){
            this.age++;
            if(this.pointingCheck.count > 0 && game.config.enableDoubleTap){
                this.pointingCheck.time++;

                if(this.pointingCheck.time > this.pointingCheck.durationTime){
                    this.pointingCheck.time = this.pointingCheck.count = 0;
                }
            }
        },
        
        onpointingstart: function(){
            if(!game.config.enableDoubleTap){
                this.onpointingstart = function(){};
                return;
            }
            this.pointingCheck.time = 0;
            if(this.pointingCheck.count === 0) this.pointingCheck.count = 1;
            if(this.pointingCheck.count === 2){
                this.pointingCheck.count = 0;
                var player = this.player;
                if(player.getParent() === this.gameField) player.dispatchEvent(tm.event.Event("changemode"));
            };
        },

        onpointingend: function(){
            if(game.config.enableDoubleTap){
                this.pointingCheck.time = 0;
                if(this.pointingCheck.count === 1) this.pointingCheck.count = 2;
            }
            var player = this.player;
            if(player.getParent() === this.gameField){
                player.vx = player.vy = 0;
            }
            
        },

        onpointingmove: function(e){
            var p = e.pointing;
            var player = this.player;
            if(player.tweener.isPlaying){
                player.vx = player.vy = 0;
                return;
            }

            if(player.getParent() === this.gameField){
                //player.vx = p.dx;
                //player.vy = p.dy;
                player.vx = Math.min(Math.max(-player.radius, p.dx * game.config.moveRatio), player.radius);
                player.vy = Math.min(Math.max(-player.radius, p.dy * game.config.moveRatio), player.radius);
            }
        },
        
        onclearstage: function(){
            this.stopDanmaku();
            var enemies = this.enemyLayer.children;
            for(var i = 0, l = enemies.length;i < l;i++){
                enemies[i]._isHitTestEnable = false;
                enemies[i].stopDanmaku();
                game.destroyAnimation(enemies[i]);
            }
            this.bulletLayer.removeChildren();

            this.stepTick();
        },

        oncutin: function(e){
            //チュートリアルなどを差し込む
            var text = e.parm;
            alert(e.parm);
        },
        result: function(){
            if(this.stage !== 0){
                var bonus = Math.max(0, ~~((this.timeBonus - this.age) / (this.missCount + 1)) * 250);
                var result = game.Result(this.age, this.missCount, bonus).addChildTo(this);
                this.scoreLabel.score += bonus;
            }
             var text = tm.display.TextShape({
                 text: "Touch to Stage Select",
                 fillStyle: "hsl(240, 100%, 95%)",
                 strokeStyle: "hsl(240, 100%, 75%)",
                 fontSize: 32,
                 fontFamily: game.FONT,
            });
            text.setPosition(320, 600);
            
            text.tweener
                .wait(1000)
                .fadeOut(1)
                .wait(500)
                .fadeIn(1)
                .setLoop(true);
            
            this.tweener
                .clear()
                .wait(1500)
                .call(function(){
                    this.player.remove();
                    text.addChildTo(this);
                    this.ontouchstart = function(){};
                    this.ontouchmove = function(){};
                    this.ontouchend = function(){
                        this.removeChildren();
                        this.app.replaceScene(game.SelectScene());
                    };
                }.bind(this));
        } 
    });
    
    game.TitleScene = tm.createClass({
        superClass: tm.app.Scene,
        
        init: function(){
            this.superInit();
            
            this.setInteractive(false);
            game.BackGround().setPosition(320, 480).addChildTo(this);
            
            var title = tm.display.Sprite("title", 300, 120);
            title.setAlpha(0).setPosition(320, 320).setScale(2).addChildTo(this);
            
            title.tweener
                 .clear()
                 .fadeIn(1500)
                 .call(function(){ this.touchEnable() }.bind(this));

        },
        onpointingend: function(){
            this.children[this.children.length - 1].remove();
            var param = game.param.DEFAULT_TEXT_SHAPE;

            var tutrial = game.TextButton({fontSize: 48, text: "Tutrial"}.$safe(param))
                .setPosition(320, 520).addChildTo(this);
            tutrial.onpointingend = function(){
                console.log("tutrial");
                if(this.parent) this.parent.app.replaceScene(game.ShootingScene(0));
            };
            var normal = game.TextButton({fontSize: 48, text: "Normal Mode"}.$safe(param))
                .setPosition(320, 600).addChildTo(this);
            normal.onpointingend = function(){
                console.log("normal");
                if(this.parent) this.parent.app.replaceScene(game.SelectScene());
            };
            var config = game.TextButton({fontSize: 48, text: "Config"}.$safe(param))
                .setPosition(320, 760).addChildTo(this);
            config.onpointingend = function(){
                console.log("config");
                if(this.parent) this.parent.app.pushScene(game.ConfigScene());
            };
            this.onpointingend = function(){};
        },
        touchEnable: function(){
            this.setInteractive(true);
            var param = game.param.DEFAULT_TEXT_SHAPE;
            
            var title = tm.display.TextShape({fontSize: 24, text: "delta-delta Ver.0.1"}.$safe(param)).setPosition(480, 420).addChildTo(this);
            var touch = tm.display.TextShape({fontSize: 48, text: "Touch Screen"}.$safe(param)).setPosition(320, 640).addChildTo(this);
            touch.tweener
                 .clear()
                 .fadeIn(1)
                 .wait(1000)
                 .fadeOut(1)
                 .wait(500)
                 .setLoop(true);
        }
    });

    game.SelectScene = tm.createClass({
        superClass: tm.app.Scene,
        
        init: function(){
            this.superInit();
            
//            var param = game.param.DEFAULT_TEXT_SHAPE;
            
            var bg = game.BackGround().setPosition(320, 480).addChildTo(this);
            
            var select = tm.display.TextShape({fontSize: 80, text: "Stage Select"})
                .setPosition(320, 80).addChildTo(this);

            var buttons = ["Stage1", "Stage2", "Stage3", "Stage4", "Stage5"];
            
            for(var i = 0,l = buttons.length;i < l;i++){
                var button = game.TextButton({
                    fontSize: 64, text: buttons[i]})
                .setPosition(320, i * 120 + 240).addChildTo(this);
                button.num = i + 1;
                button.setInteractive(true);
                button.onpointingend = function(){
                    if(this.parent) this.parent.app.replaceScene(game.ShootingScene(this.num));
                }
            }
        },
    });
    
    game.ConfigScene = tm.createClass({
        superClass: tm.app.Scene,
        
        init: function(){
            this.superInit();
            tm.display.RectangleShape({
                width: 640,
                height: 960,
                fillStyle: "rgba(0, 0, 0, 0.8)",
                strokeStyle: "rgb(0, 0, 0)"
            }).setPosition(320, 480).addChildTo(this);
            
            var config = game.config;
            var param = game.param.DEFAULT_TEXT_SHAPE;
            var onStyle = "hsl(240, 100%, 95%)";
            var offStyle = "rgba(100%, 100%, 100%, 0.5)";
            
            var backButton = game.TextButton({fontSize: 64, text: "<"}.$safe(param))
                .setPosition(48, 48).addChildTo(this);
            backButton.onpointingend = function(){
                this.parent.app.popScene();
            };
            
            var configLabel = tm.display.TextShape({fontSize: 64, text: "Config"}.$safe(param))
                .setPosition(320, 100).addChildTo(this);
            
            var doubleTapLabel = tm.display.TextShape({text: "DoubleTap ModeChange"}.$safe(param))
                .setPosition(320, 200).addChildTo(this);
                
            var doubleTapOn = game.TextButton({
                fontSize: 48,
                text: "O N",
                fillStyle: (config.enableDoubleTap) ? onStyle : offStyle
            }).setPosition(200, 240).addChildTo(this);
            doubleTapOn.onpointingend = function(){
                config.enableDoubleTap = true;
                this.setFillStyle(onStyle);
                doubleTapOff.setFillStyle(offStyle);
            };
            var doubleTapOff = game.TextButton({
                fontSize: 48,
                text: "OFF",
                fillStyle: (config.enableDoubleTap) ? offStyle : onStyle
            }).setPosition(440, 240).addChildTo(this);
            doubleTapOff.onpointingend = function(){
                config.enableDoubleTap = false;
                this.setFillStyle(onStyle);
                doubleTapOn.setFillStyle(offStyle);
            };
            
            var changeButtonPosition = tm.display.TextShape({text: "ModeChangeButton Position"}.$safe(param))
                .setPosition(320, 340).addChildTo(this);
            var leftButton = game.TextButton({
                fontSize: 48,
                text: "Left",
                fillStyle: (config.modeChangeButton === "left") ? onStyle : offStyle
                }).setPosition(120, 380).addChildTo(this);
            leftButton.onpointingend = function(){
                config.modeChangeButton = "left";
                this.setFillStyle(onStyle);
                rightButton.setFillStyle(offStyle);
                noneButton.setFillStyle(offStyle); 
            };
            var rightButton = game.TextButton({
                fontSize: 48,
                text: "Right",
                fillStyle: (config.modeChangeButton === "right") ? onStyle : offStyle
            }).setPosition(320, 380).addChildTo(this);
            rightButton.onpointingend = function(){
                config.modeChangeButton = "right";
                this.setFillStyle(onStyle);
                leftButton.setFillStyle(offStyle);
                noneButton.setFillStyle(offStyle);
            };
            var noneButton = game.TextButton({
                fontSize: 48,
                text: "None",
                fillStyle: (config.modeChangeButton === "none") ? onStyle : offStyle
                }).setPosition(520, 380).addChildTo(this);
            noneButton.onpointingend = function(){
                config.modeChangeButton = "none";
                this.setFillStyle(onStyle);
                leftButton.setFillStyle(offStyle);
                rightButton.setFillStyle(offStyle);
            };
            
            var moveRatio = tm.display.TextShape({text:"Move Ratio"}.$safe(param))
                .setPosition(320, 480).addChildTo(this);
            var moveRatioLabel = tm.display.Label(config.moveRatio).setPosition(320, 520).addChildTo(this);
            moveRatioLabel.fontColor = offStyle;
            moveRatioLabel.fontFamily = game.FONT;
            moveRatioLabel.update = function(){ this.text = ~~(config.moveRatio * 100) + "%"; }
            
            for(var i = 0;i < 20;i++){
                var buttons = [];
                buttons[i] = tm.display.RectangleShape({
                    width: 24,
                    height: 48,
                    fillStyle: (i < 10 * config.moveRatio) ? onStyle : offStyle,
                    strokeStyle: "hsl(240, 100%, 75%)",
                    lineWidth: 1
                }).setInteractive(true).setPosition(i * 30 + 40, 560).addChildTo(this);
                buttons[i].id = i;
                buttons[i].onpointingstart = function(){
                    config.moveRatio = this.id * 0.05 + 0.55;
                };
                buttons[i].update = function(){
                    this.setFillStyle((config.moveRatio < this.id * 0.05 + 0.55) ? offStyle : onStyle);
                };
            }
        }
    });

})();
