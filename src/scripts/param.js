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

    game.FONT = "'Audiowide', 'HiraKakuProN-W3'";

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

    game.param = {
        ENEMY_DEFAULT_ATTR: {
            width         : 48,
            height        : 48,
            hp            : 2000,
            image         : "",
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
            fontSize: 32,
            fontFamily: game.FONT,
            fillStyle: "hsl(240, 100%, 95%)",
            strokeStyle: "hsl(240, 100%, 75%)",
        },
    };

    game.gameFieldOut = function(elm){
        if(elm.top    > GAME_FIELD_BOTTOM ||
           elm.bottom < GAME_FIELD_TOP ||
           elm.left   > GAME_FIELD_RIGHT ||
           elm.right  < GAME_FIELD_LEFT) return true;
           
        return false;
    }
    
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
            //["stage5_05"]
        ];
        
        return list[num];
    };

})();