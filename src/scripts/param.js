/*
 * parameter
 */

/*
 * 定数
 */

var SCREEN_WIDTH      = 640;
var SCREEN_HEIGHT     = 960;

var GAME_FIELD_LEFT   = 16;
var GAME_FIELD_RIGHT  = 624;
var GAME_FIELD_TOP    = 32;
var GAME_FIELD_BOTTOM = 720;

var GAME_FPS          = 60;

/*
 *  自分用クラスをグローバルに確保
 */

var game = game || {};

(function(){

    game.FONT = "'Audiowide', 'HiraKakuProN-W3', 'monospace'";
    game.NUMBER_FONT = "'Inconsolata', 'monospace'";

    game.param = {
        ENEMY_DEFAULT_ATTR: {
            width         : 48,
            height        : 48,
            hp            : 2000,
            frameIndex    : 0,
            boundingType  : "circle",
            type          : "enemy",
            danmaku       : "",
            fieldOutCheck : true,
            addedAnimation: "",
            isSyncRotation: false,
            target        : "player",
        },
        BULLET_DEFAULT_ATTR: {
            width         : 24,
            height        : 24,
            color         : "red",
            frameIndex    : 0,
            isSyncRotation: false
        },
        DEFAULT_TEXT_SHAPE: {
            fontSize   : 64,
            fontFamily : game.FONT,
            fillStyle  : "hsl(240, 100%, 95%)",
            strokeStyle: "hsl(240, 100%, 75%)",
        },
    };

    game.DEFAULT_CONFIG = {
        enableDoubleTap : true, // true or false
        modeChangeButton: "right", // "left" or "right" or "none"
        enableBackGround: true, // true or false
        moveRatio       : 1.0,
    };

    game.DEFAULT_DATA = {
        title: "delta-delta",
        version: "0.3",
        config: game.DEFAULT_CONFIG,
        highScore: [0, 0, 0, 0, 0, 0]
    };

    game.data = {};

    game.saveData = function(obj){
        obj = obj || {};
        localStorage.setItem("gameData", JSON.stringify(obj));
    };

    game.loadData = function(){
        if(!localStorage.getItem("gameData")){
            game.saveData(game.DEFAULT_DATA);
        }
        return JSON.parse(localStorage.getItem("gameData"));
    };

    game.GameFieldOut = function(elm){
        if(elm.top    > GAME_FIELD_BOTTOM ||
           elm.bottom < GAME_FIELD_TOP ||
           elm.left   > GAME_FIELD_RIGHT ||
           elm.right  < GAME_FIELD_LEFT) return true;

        return false;
    }

    game.TweenAnimation = function(obj, type, time, param){
        param = param.$safe({
            scaleX  : 1.0,
            scaleY  : 1.0,
            alpha   : 1.0,
            rotation: 0,
        });

        if(time < 1) return;

        switch (type){
            case "in":
                obj.tweener
                   .clear()
                   .to(param, time);
            break;
            case "out":
                obj.update = function(){};
                obj.tweener
                   .clear()
                   .to(param, time)
                   .call(function(){ if(this.parent) this.remove(); }.bind(obj));
            break;
            case "draw_phase":
                obj.tweener
                   .clear()
                   .to({scaleX: 1.0, scaleY: 1.0}, time)
                   .wait(time * 5)
                   .to(param, time)
                   .call(function(){ if(this.parent) this.remove(); }.bind(obj));
            break;
            default:
            break;
        };
    };

    game.setDanmaku = function(elm, target, scene, param){

        var config = {
            target: target,
            createNewBullet: function(runner, attr){
                switch(attr.type){
                    case "enemy":
                    case "boss" :
                        var enemy = game.Enemy(runner, attr).addChildTo(scene.enemyLayer);
                    break;
                    case "invisible":
                        var enemy = game.InvisibleEnemy(runner, attr).addChildTo(scene.bulletLayer);
                    break;
                    default:
                        var bullet = game.EnemyBullet(runner, attr).addChildTo(scene.bulletLayer);
                    break;
                }
            }
        }

        elm.startDanmaku(game.danmakuPattern(elm.danmaku, param), config);

    };

    game.danmakuList = function(num){
        var list = [
            ["stage0_01", "stage0_02", "stage0_03"],
            ["stage1_01", "stage1_02", "stage1_03"],
            ["stage2_01", "stage2_02", "stage2_03"],
            ["stage3_01", "stage3_02", "stage3_03"],
            ["stage4_01", "stage4_02", "stage4_03", "stage4_04"],
            ["stage5_01", "stage5_02", "stage5_03", "stage5_04", "stage5_05"],
            ["ta01", "ta02", "ta03", "ta04", "ta05", "ta06", "ta07", "ta08", "ta09", "ta10"]
            //["ta10"]
        ];

        return list[num];
    };

    game.bossDanmaku = ["boss10", "boss12", "boss13", "boss14", "boss15", "whip02"].shuffle();
    //game.bossDanmaku = ["boss15"];

    //ビット操作系関数
    game.BitSeparate32 = function(num){
        num = (num | (num << 8)) & 0x00ff00ff;
        num = (num | (num << 4)) & 0x0f0f0f0f;
        num = (num | (num << 2)) & 0x33333333;
        return (num | (num << 1)) & 0x55555555;
    };

    //４分木分割空間管理用オブジェクト
    game.object4Tree = {
        width: 640,
        height: 720,
        level: 3,
        minWidth: 80,   //最小空間（孫空間）の幅   width / Math.pow(2, this.level)
        minHeight: 90,  //最小空間（孫空間）の高さ  height / Math.pow(2, this.level)
        matchList: [],
    };

    var MortonNumberToLiner4Tree = function(num){
        if(num > 84){ return {level: 4, number: num - 85}; }
        if(num > 20){ return {level: 3, number: num - 21}; }
        if(num >  4){ return {level: 2, number: num -  5}; }
        if(num >  0){ return {level: 1, number: num -  1}; }
        return {level: 0, number: 0};
    };

    var Liner4TreeToMortonNumber = function(level, num){
        if(level === 1){ return num + 1 }
        if(level === 2){ return num + 5 }
        if(level === 3){ return num + 21}
        if(level === 4){ return num + 85}
        return num;
    };

    game.object4Tree.defineFunction("GetMortonNumberPoint", function(x, y){
        var xx = ~~(Math.clamp(x, 0, this.width - 1) / this.minWidth);
        var yy = ~~(Math.clamp(y, 0, this.height - 1) / this.minHeight);
        return (game.BitSeparate32(xx) | game.BitSeparate32(yy) << 1);
    });

    game.object4Tree.defineFunction("GetMortonNumberObject", function(obj){
        var leftTop = this.GetMortonNumberPoint(obj.left, obj.top);
        var rightBottom = this.GetMortonNumberPoint(obj.right, obj.bottom);
        var xor = leftTop ^ rightBottom;
        if(xor === 0) return Liner4TreeToMortonNumber(this.level, rightBottom);
        if(xor < 8) return Liner4TreeToMortonNumber(this.level - 1, rightBottom >> 2);
        if(xor < 16) return Liner4TreeToMortonNumber(this.level - 2, rightBottom >> 4);
        if(xor < 64) return Liner4TreeToMortonNumber(this.level - 3, rightBottom >> 6);
        return 0;
    });

    var MortonNumberMatch = function(num1, num2){
        if(num1 === 0 || num2 === 0){ return true; }
        var morton1 = MortonNumberToLiner4Tree(num1);
        var morton2 = MortonNumberToLiner4Tree(num2);
        var level = morton1.level - morton2.level;
        if(level === 0 && num1 === num2){ return true; }
        if(level > 0 && ~~(morton1.number / Math.pow(4, level)) === morton2.number){
            return true;
        }
        if(level < 0 && (morton1.number === ~~(morton2.number / Math.pow(4, -level)))){
            return true;
        }
        return false;
    }

    var mmax = (Math.pow(4, game.object4Tree.level + 1) - 1) / 3;
    for(var l = 0;l < mmax;l++){
        game.object4Tree.matchList[l] = [];
        for(var m = 0;m < mmax;m++){
            if(l === 0 || m === 0 || MortonNumberMatch(l, m)){
                game.object4Tree.matchList[l].push(m);
            }
        }
    }

    game.object4Tree.defineFunction("match", function(num1, num2){
        if(this.matchList[num1].contains(num2)){ return true; }
        return false;
    });

})();
