/*
 * main
 */


tm.main(function() {
    var app = tm.app.CanvasApp("#world");
    app.resize(SCREEN_WIDTH, SCREEN_HEIGHT);
    app.fitWindow();
    app.fps = GAME_FPS;

//    app.enableStats();
    app.background = "rgb( 10%, 10%, 10%)";

    var loadingScene = tm.ui.LoadingScene({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        assets: {
            "circle"   : "./src/images/circleImage2.png",
            "triangle" : "./src/images/triangleImage.png",
            "rectangle": "./src/images/rectangleImage.png",
            "polygon"  : "./src/images/polygonImage.png",
            "title"    : "./src/images/title.png"
       },
        nextScene: game.TitleScene,
    });

    app.replaceScene(loadingScene);

//    var scene = game.SelectScene();
//    app.replaceScene(scene);

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
