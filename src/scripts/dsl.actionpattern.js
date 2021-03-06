/*
 * dsl.actionpattern.js
 */

game.ActionPattern = {};
game.FirePattern = {};

(function(){

    var d = bulletml.dsl;

    game.ActionPattern["change_direction"] = function(val, type, duration, waitTime){
        if(!waitTime) waitTime = duration;
        if(!type) return;
        return d.action([
            d.changeDirection(d.direction(val, type), duration),
            d.wait(waitTime)
        ]);
    };

    game.ActionPattern["change_speed"] = function(val, duration, waitTime){
        if(!waitTime) waitTime = duration;
        return d.action([
            d.changeSpeed(d.speed(val), duration),
            d.wait(waitTime)
        ]);
    };

    game.ActionPattern["yura_yura"] = function(speed, time, loop){
        if(!loop) loop = 99;

        return d.action([
            d.changeSpeed(d.speed(speed), 1),
            d.repeat(loop, [
                game.ActionPattern["change_direction"](120, "absolute", 1, time),
                game.ActionPattern["change_direction"]( 60, "absolute", 1, time),
                game.ActionPattern["change_direction"](300, "absolute", 1, time),
                game.ActionPattern["change_direction"](240, "absolute", 1, time * 2),
                game.ActionPattern["change_direction"](300, "absolute", 1, time),
                game.ActionPattern["change_direction"]( 60, "absolute", 1, time),
                game.ActionPattern["change_direction"](120, "absolute", 1, time),
            ]),
            d.changeSpeed(d.speed(0), 1)
        ]);
    };

    game.ActionPattern["round_trip"] = function(speed, time, loop, waitTime){
        waitTime = waitTime || 0;
        if(!loop) loop = 999;
        if(!waitTime){
            return d.action([
                d.repeat(loop, [
                    d.changeSpeed(d.speed(0), 1),
                    game.ActionPattern["change_direction"](180, "relative", 1),
                    game.ActionPattern["change_speed"](speed, 1, time),
                ])
            ]);
        }
        return d.action([
            d.repeat(loop, [
                game.ActionPattern["change_speed"](0, 1, waitTime),
                game.ActionPattern["change_direction"](180, "relative", 1),
                game.ActionPattern["change_speed"](speed, 1, time),
            ])
        ]);
    };

    game.ActionPattern["triangle_loop"] = function(speed, direction, time, loop, waitTime){
        waitTime = waitTime || 0;
        if(!loop) loop = 999;
        if(!waitTime){
            return d.action([
                d.changeDirection(d.direction((direction === "left") ? 210 : 150, "absolute"), 1),
                game.ActionPattern["change_speed"](speed, 1, time),
                d.repeat(loop, [
                    d.repeat(3, [
                        game.ActionPattern["change_direction"]((direction === "left") ? -120 : 120, "relative", 1)
                    ])
                ])
            ]);
        }
        return d.action([
            d.changeDirection(d.direction((direction === "left") ? 210 : 150, "absolute"), 1),
            d.repeat(loop, [
                d.repeat(3, [
                    game.ActionPattern["change_speed"](speed, 1, time),
                    game.ActionPattern["change_direction"]((direction === "left") ? -120 : 120, "relative", 1),
                    game.ActionPattern["change_speed"](0, 1, waitTime)
                ])
            ])
        ]);
    };

    game.ActionPattern["circle_loop"] = function(speed, radius, direction, loop){
        if(!loop) loop = 99;
        var r = radius * Math.PI / 180;
        var dir = direction * speed;
        return d.action([
            game.ActionPattern["change_speed"](speed * r, 1),
            d.repeat(~~(360 / Math.abs(dir)) * loop, [
                game.ActionPattern["change_direction"](dir, "relative", 1),
            ])
        ]);
    };

    game.ActionPattern["time_attack_01"] = function(rank, boss){
        return d.action([
            d.wait(60),
            game.FirePattern["offset"](320, 0, 180, "absolute", 8, boss, d.action([
                game.ActionPattern["change_speed"](0, 60),
                game.ActionPattern["yura_yura"](1.0 + rank * 0.1, 80 - rank)
             ]))
        ]);
    };

    game.ActionPattern["time_attack_02"] = function(rank, boss){
        return d.action([
            d.wait(60),
            game.FirePattern["offset"](320, 0, 180, "absolute", 5, boss, d.action([
                game.ActionPattern["change_speed"](0, 60),
                d.repeat(99, [
                    game.ActionPattern["triangle_loop"](Math.min(1 + rank * 0.1, 2.5), "left", 135, 1, 60 + rank),
                    game.ActionPattern["triangle_loop"](Math.min(1 + rank * 0.1, 2.5), "right", 135, 1, 60 + rank),
                ])
            ]))
        ]);
    };

    game.ActionPattern["time_attack_03"] = function(rank, boss){
        return d.action([
            d.wait(60),
            game.FirePattern["offset"](320, 0, 180, "absolute", 5, boss, d.action([
                game.ActionPattern["change_speed"](0, 90),
                game.ActionPattern["change_direction"](0, "absolute", 1),
                d.repeat(99, [
                    game.ActionPattern["circle_loop"](Math.min(2, rank * 0.1 + 0.5), 120, 1, 1),
                    game.ActionPattern["change_speed"](0, 1, 60),
                    game.ActionPattern["circle_loop"](Math.min(2, rank * 0.1 + 0.5), 120, -1, 1),
                    game.ActionPattern["change_speed"](0, 1, 60),
                    game.ActionPattern["change_direction"](180, "relative", 1, 60),
                ]),
            ]))
        ]);
    };

    game.ActionPattern["time_attack_04"] = function(rank, boss){
        return d.action([
            d.wait(60),
            game.FirePattern["offset"](320, 0, 180, "absolute", 10, boss, game.ActionPattern["change_speed"](0, 60))
        ]);
    };

    game.ActionPattern["nway_shot"] = function(rank, deg, direction, directionType, spd, bullet, childBullet){
        var direct = (direction < 0) ? -1 : 1;
        return d.action([
            game.FirePattern["normal"](direction, directionType, spd, bullet, game.ActionPattern["burst_shot"](rank, direct)),
            d.bindVar("spd", spd - 1),
            d.repeat(8 + ~~(rank * 0.5), [
                d.wait(3),
                game.FirePattern["normal"](deg, "sequence", "$spd - $loop.index", bullet, game.ActionPattern["burst_shot"](rank, direct, childBullet))
            ])
        ]);
    }

    game.ActionPattern["burst_shot"] = function(rank, direction, bullet){
        return d.action([
            game.ActionPattern["change_speed"](0, 45, 15),
            game.FirePattern["normal"](direction, "relative", 3 + rank * 0.2, bullet),
            d.repeat(3 + ~~(rank * 0.25), [
                d.wait(10 - ~~(rank * 0.5)),
                game.FirePattern["normal"](direction * 4, "sequence", 3 + rank * 0.2, bullet)
            ]),
            d.vanish()
        ]);
    };

    game.FirePattern["normal"] = function(direction, directionType, speed, bullet, action){
        bullet = bullet || {};
        if(!action){
            return d.fire(
                d.direction(direction, directionType),
                d.speed(speed),
                d.bullet(bullet)
            );
        }
        return d.fire(
            d.direction(direction, directionType),
            d.speed(speed),
            d.bullet(bullet, action)
        );
    };

    game.FirePattern["offset"] = function(offsetX, offsetY, direction, directionType, speed, bullet, action){
        bullet = bullet || {};
        if(!action){
            return d.fire(
                d.offsetX(offsetX),
                d.offsetY(offsetY),
                d.autonomy(true),
                d.direction(direction, directionType),
                d.speed(speed),
                d.bullet(bullet)
            );
        }
        return d.fire(
            d.offsetX(offsetX),
            d.offsetY(offsetY),
            d.direction(direction, directionType),
            d.speed(speed),
            d.bullet(bullet, action)
        );
    };

})();
