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
            
            this.stage = num || 0;

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
            var title = tm.display.TextShape({
                fontSize: 24,
                text: "delta-delta Ver." + game.data.version
            }.$safe(game.param.DEFAULT_TEXT_SHAPE));
            title.autoRender = false;
            title.setPosition(480, 930).addChildTo(this);
                
            //デバッグ情報用
            var info = game.EnemyInfomation().setPosition(542, 776).addChildTo(this);
            
            this.scoreLabel = game.ScoreLabel().setPosition(616, 104);
            this.highScore = game.HighScoreLabel(game.data.highScore[this.stage - 1])
                .setPosition(616, 56);
            var score = game.Score().setPosition(24, 104);
            var highScore = game.HighScore().setPosition(24, 56);
            if(num > 0){
                score.addChildTo(this);
                highScore.addChildTo(this);
                this.scoreLabel.addChildTo(this);
                this.highScore.addChildTo(this);
            }
            
            if(game.config.modeChangeButton !== "none"){
                this.button = game.ModeChangeButton()
                    .setPosition((game.config.modeChangeButton === "left") ? 64 : 576, 654)
                    .setAlpha(0.3)
                    .addChildTo(this);
                var pause = game.PauseButton()
                    .setPosition((game.config.modeChangeButton === "left") ? 64 : 576, 168)
                    .setAlpha(0.3)
                    .addChildTo(this);
            }
            
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
            game.setDanmaku(this, this.player, this, {rank: this.phase});
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
                game.TweenAnimation(enemies[i], "out", 250, {scaleX: 8.0, scaleY: 0.0});
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
                var result = game.Result(this.stage, this.age, this.missCount, bonus).addChildTo(this);
                this.scoreLabel.score += bonus;
                if(this.highScore.score < this.scoreLabel.score) this.highScore.score = this.scoreLabel.score;
                game.data.highScore[this.stage - 1] = this.highScore.score;
                game.saveData(game.data);
            }
             var text = tm.display.TextShape({
                 text: "Touch to Title",
                 fillStyle: "hsl(240, 100%, 95%)",
                 strokeStyle: "hsl(240, 100%, 75%)",
                 fontSize: 32,
                 fontFamily: game.FONT,
            });
            text.setPosition(320, 680);
            
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
                        this.app.replaceScene(game.TitleScene());
                    };
                }.bind(this));
        } 
    });
    
    game.TitleScene = tm.createClass({
        superClass: tm.app.Scene,
        
        init: function(){
            this.superInit();
            
            game.data = game.data.$extend(game.loadData());
            if(game.data.version < game.DEFAULT_DATA.version) game.data.version = game.DEFAULT_DATA.version;
            game.config = game.data.config;
            
            this.setInteractive(false);
            game.BackGround().setPosition(320, 480).addChildTo(this);
            
            var title = tm.display.Sprite("title", 300, 120);
            title.setAlpha(0).setPosition(320, 280).setScale(2).addChildTo(this);
            
            title.tweener
                 .clear()
                 .fadeIn(1500)
                 .call(function(){ this.touchEnable() }.bind(this));

        },
        onpointingend: function(){
            this.children[this.children.length - 1].remove();
            var param = game.param.DEFAULT_TEXT_SHAPE;

            var tutrial = game.TextButton({fontSize: 64, text: "Tutrial"})
                .setPosition(320, 460).addChildTo(this);
            tutrial.onpointingend = function(){
                this.parent.app.replaceScene(game.ShootingScene(0));
            };
            var normal = game.TextButton({fontSize: 64, text: "Normal Mode"})
                .setPosition(320, 560).addChildTo(this);
            normal.onpointingend = function(){
                this.parent.app.replaceScene(game.SelectScene());
            };
            var config = game.TextButton({fontSize: 64, text: "Config"})
                .setPosition(320, 760).addChildTo(this);
            config.onpointingend = function(){
                this.setScale(1);
                this.parent.app.pushScene(game.ConfigScene());
            };
            var manual = game.TextButton({fontSize: 64, text: "Manual"})
                .setPosition(320, 860).addChildTo(this);
            manual.onpointingend = function(){
                this.setScale(1);
                window.location.href = "./manual.html";
            };
                
            
            this.onpointingend = function(){};
        },
        touchEnable: function(){
            this.setInteractive(true);
            var param = game.param.DEFAULT_TEXT_SHAPE;
            
            var title = tm.display.TextShape({fontSize: 24, text: "delta-delta Ver." + game.data.version}.$safe(param)).setPosition(480, 380).addChildTo(this);
            var touch = tm.display.TextShape({text: "Touch Screen"}.$safe(param)).setPosition(320, 640).addChildTo(this);
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
            
            var param = game.param.DEFAULT_TEXT_SHAPE;
            
            var bg = game.BackGround().setPosition(320, 480).addChildTo(this);
            
            var backButton = game.TextButton({
                text: "<",
                fontSize: 80,
            }).setPosition(48, 48).addChildTo(this);
            backButton.onpointingend = function(){
                this.parent.app.replaceScene(game.TitleScene());
            };
            
            var select = tm.display.TextShape({fontSize: 80, text: "Stage Select"}.$safe(param))
                .setPosition(320, 140).addChildTo(this);

            var buttons = ["Stage1", "Stage2", "Stage3", "Stage4", "Stage5"];
            
            for(var i = 0,l = buttons.length;i < l;i++){
                var button = game.TextButton({text: buttons[i]})
                .setPosition(320, i * 100 + 280).addChildTo(this);
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

            game.BlackScreen().addChildTo(this);

            var config = game.config;
            var param = game.param.DEFAULT_TEXT_SHAPE;
            var onStyle = "hsl(240, 100%, 95%)";
            var offStyle = "rgb(50%, 50%, 50%)";
            
            var backButton = game.TextButton({fontSize: 80, text: "<"})
                .setPosition(48, 48).addChildTo(this);
            backButton.onpointingend = function(){
                game.saveData(game.data);
                this.parent.app.popScene();
            };
            
            var configLabel = tm.display.TextShape({text: "Config"}.$safe(param))
                .setPosition(320, 100).addChildTo(this);
            
            var doubleTapLabel = tm.display.TextShape({fontSize: 32, text: "DoubleTap ModeChange"}.$safe(param))
                .setPosition(320, 200).addChildTo(this);
                
            var doubleTapOn = game.TextButton({
                text: "O N",
                fillStyle: offStyle
            }).setPosition(440, 260).addChildTo(this);
            doubleTapOn.update = function(){
                this.setFillStyle((config.enableDoubleTap) ? onStyle : offStyle);
            };
            doubleTapOn.onpointingend = function(){
                this.setScale(1);
                config.enableDoubleTap = true;
            };
            var doubleTapOff = game.TextButton({
                text: "OFF",
                fillStyle: offStyle
            }).setPosition(200, 260).addChildTo(this);
            doubleTapOff.update = function(){
                this.setFillStyle((!config.enableDoubleTap) ? onStyle : offStyle);
            };
            doubleTapOff.onpointingend = function(){
                this.setScale(1);
                config.enableDoubleTap = false;
            };
            
            var changeButtonPosition = tm.display.TextShape({fontSize: 32, text: "Button Position"}.$safe(param))
                .setPosition(320, 340).addChildTo(this);
            var leftButton = game.TextButton({
                text: "Left",
                fillStyle: offStyle
                }).setPosition(320, 400).addChildTo(this);
            leftButton.update = function(){
                this.setFillStyle((config.modeChangeButton === "left") ? onStyle : offStyle);
            };
            leftButton.onpointingend = function(){
                this.setScale(1);
                config.modeChangeButton = "left";
            };
            var rightButton = game.TextButton({
                text: "Right",
                fillStyle: offStyle
            }).setPosition(520, 400).addChildTo(this);
            rightButton.update = function(){
                this.setFillStyle((config.modeChangeButton === "right") ? onStyle : offStyle);
            };
            rightButton.onpointingend = function(){
                this.setScale(1);
                config.modeChangeButton = "right";
            };
            var noneButton = game.TextButton({
                text: "None",
                fillStyle: offStyle
                }).setPosition(120, 400).addChildTo(this);
            noneButton.update = function(){
                this.setFillStyle((config.modeChangeButton === "none") ? onStyle : offStyle);
            };
            noneButton.onpointingend = function(){
                this.setScale(1);
                config.modeChangeButton = "none";
            };
            
            var moveRatio = tm.display.TextShape({fontSize: 32, text:"Move Ratio"}.$safe(param))
                .setPosition(320, 480).addChildTo(this);
            var moveRatioLabel = tm.display.Label(config.moveRatio).setPosition(320, 520).addChildTo(this);
            moveRatioLabel.fontColor = offStyle;
            moveRatioLabel.fontFamily = game.FONT;
            moveRatioLabel.update = function(){ this.text = ~~(config.moveRatio * 100) + "%"; }
            
            for(var i = 0;i < 20;i++){
                var buttons = [];
                buttons[i] = tm.display.RectangleShape({
                    width: 24,
                    height: 64,
                    fillStyle: offStyle,
                    strokeStyle: "hsl(240, 100%, 75%)",
                    lineWidth: 1
                }).setInteractive(true).setPosition(i * 30 + 40, 580).addChildTo(this);
                buttons[i].id = i;
                buttons[i].onpointingstart = function(){
                    config.moveRatio = this.id * 0.05 + 0.55;
                };
                buttons[i].update = function(){
                    this.setFillStyle((config.moveRatio < this.id * 0.05 + 0.55) ? offStyle : onStyle);
                };
            }
            
            var record = game.TextButton({text: "Record"})
                .setPosition(320, 740).addChildTo(this);
            record.onpointingend = function(){
                this.setScale(1);
                this.parent.app.pushScene(game.RecordScene());
            };
            
            var resetConfig = game.TextButton({text: "Reset Config"})
                .setPosition(320, 840).addChildTo(this);
            resetConfig.onpointingend = function(){
                this.setScale(1);
                var scene = game.YesNoDialog("Reset Config?");
                
                scene.onyes = function(){
                    config = game.data.config = {}.$extend(game.DEFAULT_CONFIG);
                    game.saveData(game.data);
                    this.app.popScene();
                };
                this.parent.app.pushScene(scene);
            };
        }
    });
    
    game.RecordScene = tm.createClass({
        superClass: tm.app.Scene,
        
        init: function(){
            this.superInit();

            game.BlackScreen().addChildTo(this);

            var high = game.data.highScore;
            var param = game.param.DEFAULT_TEXT_SHAPE;
            
            var backButton = game.TextButton({fontSize: 80, text: "<"})
                .setPosition(48, 48).addChildTo(this);
            backButton.onpointingend = function(){
                this.parent.app.popScene();
            };

            tm.display.TextShape({text: "High-Score Record", fontSize: 48}.$safe(param))
                .setPosition(320, 140).addChildTo(this);
                
            for(var i = 0;i < high.length;i++){
                tm.display.TextShape({text: "Stage" + (i + 1), fontSize: 48}.$safe(param))
                    .setPosition(160, i * 80 + 280).addChildTo(this);

                var label = tm.display.Label((!high[i]) ? "0" : high[i])
                    .setFontFamily(game.NUMBER_FONT)
                    .setFontSize(64)
                    .setAlign("right")
                    .setPosition(580, i * 80 + 280)
                    .setAlpha(0.5)
                    .addChildTo(this);
                label.id = i;
                label.update = function(){
                    this.text = (!game.data.highScore[this.id]) ? "0" : game.data.highScore[this.id];
                }
            }
            
            var resetButton = game.TextButton({fontSize: 48, text: "Reset High-Score"})
                .setPosition(320, 840).addChildTo(this);
            resetButton.onpointingend = function(){
                this.setScale(1);

                var scene = game.YesNoDialog("Reset High-score?");
                scene.onyes = function(){
                    game.data.highScore = game.DEFAULT_DATA.highScore.clone();
                    game.saveData(game.data);
                    this.app.popScene();
                };
                this.parent.app.pushScene(scene);
            };
        },
    });
    
    game.YesNoDialog = tm.createClass({
        superClass: tm.app.Scene,
        
        init: function(text){
            this.superInit();
            
            game.BlackScreen().addChildTo(this);

            tm.display.TextShape({fontSize: 32, text: text}.$safe(game.param.DEFAULT_TEXT_SHAPE))
                .setPosition(320, 300).addChildTo(this);

            var noButton = game.TextButton({text: "N o"})
                .setPosition(200, 380).addChildTo(this);
            noButton.onpointingend = function(){
                this.parent.dispatchEvent(tm.event.Event("no"));
            };
            var yesButton = game.TextButton({text: "Yes"})
                .setPosition(420, 380).addChildTo(this);
            yesButton.onpointingend = function(){
                this.parent.dispatchEvent(tm.event.Event("yes"));
            };
        },
        onyes: function(){},
        
        onno: function(){
            this.app.popScene();
        },
    });
    
    game.PauseScene = tm.createClass({
        superClass: tm.app.Scene,
        
        init: function(){
            this.superInit();
            
            game.BlackScreen().addChildTo(this);

            tm.display.TextShape({text: "Pause"}.$safe(game.param.DEFAULT_TEXT_SHAPE))
                .setPosition(320, 300).addChildTo(this);
            
            var exit = game.TextButton({fontSize: 48, text: "GiveUp"})
                .setPosition(180, 420).addChildTo(this);
            exit.onpointingend = function(){
                this.setScale(1);
                var app = this.parent.app;
                app.popScene();
                app.replaceScene(game.TitleScene());
            }
            
            var cont = game.TextButton({fontSize: 48, text: "Continue"})
                .setPosition(460, 420).addChildTo(this);
            cont.onpointingend = function(){
                this.setScale(1);
                this.parent.app.popScene();
            }
        }
    });
})();
