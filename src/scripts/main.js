/*
 * main
 */


tm.main(function() {
    var app = tm.app.CanvasApp("#world");
    app.resize(SCREEN_WIDTH, SCREEN_HEIGHT);
    app.fitWindow();
    app.fps = GAME_FPS;

    app.enableStats();
    app.background = "rgba( 55%, 55%, 70%, 1)";
/*
    var loadingScene = tm.ui.LoadingScene({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        assets: {
            "shot"  : "./images/shot.png",
            "player": "./images/player.png",
            "bullet": "./images/bullet.png"
        },
        nextScene: myClass.ShootingScene,
    });

    app.pushScene(loadingScene);

    var test = tm.display.Sprite("bullet", 24, 24);
    test.frameIndex = 0;
    test.blur = 3;

    test.addChildTo(app.currentScene).setPosition(320, 480);
*/
//    var scene = myClass.ShootingScene(0);
    var scene = myClass.SelectScene();
    app.replaceScene(scene);

    app.update = function() {
        var scene = this.currentScene;
        var player = scene.player;
        var key = this.keyboard;
        
        if (key.getKeyDown("space") == true) {
            (scene.isUpdate == true) ? scene.sleep() : scene.wakeUp();
        }
        if(!player) return;
        if(key.getKeyDown("z") === true || key.getKeyDown("Z") === true){
            player.fire(tm.event.Event("changemode"));
        }
        var angle = key.getKeyAngle();
        if(angle === null){
            player.keyX = player.keyY = player.speed = 0;
            return;
        }
        player.speed = ((key.getKey("x") === true || key.getKey("X") === true)) ? 2 : 8;
        player.keyX = player.speed * Math.cos(angle * Math.DEG_TO_RAD);
        player.keyY = -player.speed * Math.sin(angle * Math.DEG_TO_RAD);
    }

    app.run();
});
